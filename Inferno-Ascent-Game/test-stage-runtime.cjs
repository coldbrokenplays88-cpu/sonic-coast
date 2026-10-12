const {test}=require('node:test');
const assert=require('node:assert/strict');
const {boot}=require('./test-support.cjs');
const read=(a,expression)=>JSON.parse(a.run(`JSON.stringify(${expression})`));
const near=(actual,expected)=>assert.ok(Math.abs(actual-expected)<1e-9,`${actual} != ${expected}`);

for(const act of [1,2]){
 test(`surface solver chooses the earliest crossing in act ${act}`,()=>{
  const a=boot(act);
  a.run(`const late={id:'late',x1:0,x2:500,y1:420,y2:420,kind:'main'};
   const early={...late,id:'early',y1:414,y2:414};
   level.surfaces=[late,early];level.hazards=[];visited.clear();jumpBuffer=0;
   Object.assign(p,{x:200,y:390,vx:6,vy:15,ground:false,surface:null,rolling:false});
   moveAndResolveSurfaces();`);
  assert.deepEqual(read(a,'[p.x,p.y,p.vy,p.ground,p.surface.id,p.lastX,p.lastY]'),[206,394,0,true,'early',200,390]);
 });
 test(`surface solver follows a connected slope but leaves a gap in act ${act}`,()=>{
  const a=boot(act);
  a.run(`const left={id:'left',x1:0,x2:100,y1:400,y2:400,kind:'main'};
   const slope={...left,id:'slope',x1:100,x2:200,y2:380};
   level.surfaces=[left,slope];level.hazards=[];jumpBuffer=0;
   Object.assign(p,{x:98,y:380,vx:14,vy:0,ground:true,surface:left,rolling:false});
   moveAndResolveSurfaces();`);
  assert.equal(a.run('p.surface.id'),'slope');assert.equal(a.run('p.ground'),true);
  near(a.run('p.y'),377.6);assert.equal(a.run('p.vy'),0);
  a.run(`const gap={...left,id:'gap',x1:114,x2:214};level.surfaces=[left,gap];
   Object.assign(p,{x:98,y:380,vx:14,vy:0,ground:true,surface:left});
   moveAndResolveSurfaces();`);
  assert.equal(a.run('p.x'),112);assert.equal(a.run('p.ground'),false);assert.equal(a.run('p.surface'),null);
 });
 for(const axis of ['x','y'])test(`surface carry retains its contact on moving ${axis} platforms in act ${act}`,()=>{
  const a=boot(act);
  a.run(`const moving={id:'moving',x1:100,x2:300,y1:400,y2:400,kind:'moving',motion:{axis:'${axis}',amp:20,period:100,phase:.2}};
   level.surfaces=[moving];level.hazards=[];runFrames=12;jumpBuffer=0;
   const prev=pose(moving,11),now=pose(moving,12);
   Object.assign(p,{x:(prev.x1+prev.x2)/2,y:prev.y1-20,vx:0,vy:0,ground:true,surface:moving,rolling:false});
   applySurfaceMotion();moveAndResolveSurfaces();`);
  near(a.run('p.x'),a.run('(now.x1+now.x2)/2'));near(a.run('feet()'),a.run('now.y1'));
  assert.equal(a.run('p.ground'),true);assert.equal(a.run('p.surface.id'),'moving');
 });
}

for(const act of [1,2]){
 test(`stage selection dispatches only the current act's world and reset behavior (${act})`,()=>{
  const a=boot(act);
  a.run(`const calls=[];updateAct2=()=>calls.push('act2');updateMiddleSection=()=>calls.push('middle');
   resetAct2=()=>calls.push('reset');updateMiddleMotion=()=>{calls.push('motion');return false};
   selectStageRuntime();resetStageRuntime();updateStageWorld();updateStageMotion();`);
  assert.deepEqual(read(a,'calls'),act===2?['reset','act2','middle','motion']:[]);
  a.run(`selectAct(${act===1?2:1});calls.length=0;updateStageWorld();resetStageRuntime();`);
  assert.deepEqual(read(a,'calls'),act===1?['act2','middle','reset']:[]);
 });
 test(`stage death limit keeps its existing evaluation in act ${act}`,()=>{
  const a=boot(act);
  a.run(`let floorCalls=0;level.floorAt=x=>{floorCalls++;return x-123};p.x=300;`);
  assert.equal(a.run('stageDeathLimit()'),act===1?800:1127);
  assert.equal(a.run('floorCalls'),act===1?0:1);
 });
 test(`stage completion preserves the current goal rule in act ${act}`,()=>{
  const a=boot(act);
  a.run(`let finished=0,endingStarted=0;finishAct=()=>finished++;beginEndingScene=()=>endingStarted++;
   p.x=END+1;p.ground=true;p.surface={kind:'main'};boss=null;updateStageCompletion();`);
  assert.equal(a.run('finished'),act===1?1:0);
  a.run(`p.ground=false;p.surface=null;p.landFrame=runFrames;p.landKind='main';updateStageCompletion();`);
  assert.equal(a.run('finished'),act===1?2:0);
  a.run(`p.landFrame=-1;boss={state:'defeated'};updateStageCompletion();`);
  assert.equal(a.run('finished'),act===1?2:0);assert.equal(a.run('endingStarted'),act===2?1:0);
 });
}
test('stage selection rejects an unsupported built act',()=>{
 const a=boot();a.run('selectStageRuntime()');
 assert.throws(()=>a.run('level.act=99;selectStageRuntime()'),/Unsupported stage act: 99/);
});
test('legacy Act 1 metadata stays unchanged and a missing Act 2 identity is rejected',()=>{
 const a=boot(1);
 assert.equal(a.run("Object.hasOwn(level,'act')"),false);assert.equal(a.run('stageDeathLimit()'),800);
 assert.throws(()=>a.run('selectedAct=2;selectStageRuntime()'),/Unsupported stage act: undefined/);
});
test('a stage-consumed movement tick skips shared movement and loop motion',()=>{
 const a=boot();a.run(`updateStageMotion();const originalX=p.x,originalY=p.y,originalVx=p.vx;
  updateMiddleMotion=()=>{p.x++;return true};updateLoop=()=>{throw Error('loop must not run')};p.loop={speed:10};
  const consumed=updateMovement();`);
 assert.equal(a.run('consumed'),true);assert.equal(a.run('p.x'),a.run('originalX+1'));
 assert.equal(a.run('p.y'),a.run('originalY'));assert.equal(a.run('p.vx'),a.run('originalVx'));
});
test('wrong-route landing corrects speed before landing effects and contact assignment',()=>{
 const a=boot();a.run(`const fallen={id:'fallen',x1:0,x2:500,y1:400,y2:400,kind:'main',fallen:true};
  beforeStageLanding(fallen);let observed=null;gameSound=name=>{if(name==='land')observed=[p.vx,p.wrongRouteDrop,p.ground,p.surface]};
  jumpBuffer=0;Object.assign(p,{vx:19,wrongRouteDrop:true,ground:false,surface:null});land(fallen,400);`);
 assert.deepEqual(read(a,'observed'),[0,false,false,null]);assert.equal(a.run('p.surface.id'),'fallen');
});
test('pool entry establishes roll state before a buffered jump consumes the landing',()=>{
 const a=boot();a.run(`const poolSurface={id:'pool',x1:0,x2:500,y1:400,y2:400,kind:'main',poolCurve:true};
  afterStageLanding(poolSurface);const originalJump=jump;let atJump=null;
  jump=()=>{atJump=[p.surface.id,p.poolApproach,p.rolling,p.roll,p.rollAge,p.lowRollFrames];originalJump()};
  Object.assign(p,{vx:8,ground:false,surface:null,poolApproach:true,rolling:false,rollAge:90,lowRollFrames:4});
  jumpBuffer=1;land(poolSurface,400);`);
 assert.deepEqual(read(a,'atJump'),['pool',false,true,true,0,0]);
 assert.equal(a.run('p.ground'),false);assert.equal(a.run('p.surface'),null);assert.equal(a.run('jumpBuffer'),0);
});
test('Act 1 does not run pool or wrong-route stage landing changes',()=>{
 const a=boot(1);a.run(`Object.assign(p,{vx:19,wrongRouteDrop:true,poolApproach:true,rolling:false});
  const foreignSurface={fallen:true,poolCurve:true};beforeStageLanding(foreignSurface);afterStageLanding(foreignSurface);`);
 assert.deepEqual(read(a,'[p.vx,p.wrongRouteDrop,p.poolApproach,p.rolling]'),[19,true,true,false]);
});
for(const act of [1,2])test(`wrong-route enemy reaction respects hurt and mode guards in act ${act}`,()=>{
 const a=boot(act);a.run(`let drops=0;beginWrongRouteDrop=()=>drops++;const guard={id:'mid-wrong-way-guard'};
  p.hurt=0;handleStageEnemyDamage(guard);p.hurt=22;handleStageEnemyDamage({id:'other'});
  mode='over';handleStageEnemyDamage(guard);mode='playing';handleStageEnemyDamage(guard);`);
 assert.equal(a.run('drops'),act===2?1:0);
});
test('an explicit death zone short-circuits the stage floor query',()=>{
 const a=boot();a.run(`stageDeathLimit();level.floorAt=()=>{throw Error('floor must not be queried')};
  level.deathZones=[{x1:0,x2:1000,y:100}];level.surfaces=[];level.hazards=[];
  Object.assign(p,{x:300,y:50000,vx:0,vy:0,ground:false,surface:null});updateMovement();`);
 assert.equal(a.run('stats.deaths'),1);assert.equal(a.run('lives'),2);
});
