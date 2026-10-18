const {test}=require('node:test');
const assert=require('node:assert/strict');
const {boot}=require('./test-support.cjs');

test('Act 2 has one approved movement owner, bypassing legacy integration',()=>{
 const a=boot(2);
 assert.equal(a.run('p.act1Motion?.act'),2,'explicit authored Act 2 controller');
 a.run(`integrateSurfaceStep=()=>{throw Error('legacy physics')};applySurfaceMotion=()=>{throw Error('legacy gravity')};press('ArrowRight',true);for(let i=0;i<25;i++)update()`);
 assert.equal(a.run('p.act1Motion.ticks'),25);
 assert.ok(Math.abs(a.run('p.act1Motion.speed')-4)<1e-8);
});

test('steep authored rail cannot be climbed from rest without Boost; free metadata works at zero meter',()=>{
 const a=boot(2);
 a.run(`level.hazards.find(h=>h.id==='secret-facade-wall').broken=true;var rail=surfaceById('secret-rail-up');Object.assign(p,{x:rail.x1+150,y:yOn(rail,rail.x1+150)-20,vx:0,vy:0,ground:true,surface:rail,rolling:false});resetAct1Motion();press('ArrowRight',true);for(let i=0;i<15;i++)update()`);
 assert.ok(a.run('p.act1Motion.speed')<=0);
 assert.ok(a.run('p.x')<=a.run('rail.x1+150'));
 a.run(`rail=surfaceById('mid-rail-entry');Object.assign(p,{x:rail.x1+100,y:yOn(rail,rail.x1+100)-20,vx:8,vy:0,ground:true,surface:rail,rolling:false});boost=0;resetAct1Motion();press('ShiftLeft',true);for(let i=0;i<10;i++)update()`);
 assert.equal(a.run('boost'),0);
 assert.equal(a.run('p.boosting'),true);
 assert.ok(a.run('p.act1Motion.speed')>15);
});

test('authored spring top launches once and held jump does not cut the new trajectory',()=>{
 const a=boot(2);
 a.run(`var spring=level.springs.find(d=>d.id==='mid-left-spring'),face=springFace(spring);Object.assign(p,{x:face.x,y:face.y-55,vx:0,vy:30,ground:false,surface:null,roll:false,rolling:false});resetAct1Motion();keys.add('Space');for(let i=0;i<3;i++)update()`);
 assert.ok(a.run('spring.firedAt')>=0);
 assert.ok(a.run('p.vy')<-17);
 assert.equal(a.run('p.act1Motion.air.cutEligible'),false);
});

test('both authored loop sections retain normal-speed traversal with shared contact physics',()=>{
 for(const id of ['draw-loop-1','city-climax-loop-248']){
  const a=boot(2);
  a.run(`var trialLoop=level.loops.find(l=>l.id==='${id}');Object.assign(p,{x:trialLoop.x-10,y:trialLoop.y-20,vx:14,vy:0,ground:true,surface:level.surfaces.find(s=>s.x1<=trialLoop.x&&s.x2>=trialLoop.x&&Math.abs(yOn(s,trialLoop.x)-trialLoop.y)<2),roll:false,rolling:false});resetAct1Motion();p.inv=9999;press('ArrowRight',true);for(let i=0;i<200&&!trialLoop.solved;i++)update()`);
  assert.equal(a.run('trialLoop.solved'),true,id);
  assert.ok(a.run('stats.loops')>=1);
 }
});

for(const direction of [-1,1])test(`authored loop ${direction}: low entry fails, repeat entries score once, and jump hands off tangent velocity`,()=>{
 const a=boot();
 const setup=(speed)=>a.run(`keys.clear();var testedLoop=level.loops.find(l=>l.id==='city-climax-loop-248');var floorDeck=level.surfaces.find(s=>s.x1<=testedLoop.x&&s.x2>=testedLoop.x&&Math.abs(yOn(s,testedLoop.x)-testedLoop.y)<1);Object.assign(p,{x:testedLoop.x-(${direction})*80,y:testedLoop.y-20,vx:${speed*direction},vy:0,ground:true,surface:floorDeck,rolling:false,roll:false,inv:9999});resetAct1Motion()`);
 setup(4);a.run(`for(let i=0;i<140;i++)update()`);
 assert.equal(a.run('testedLoop.solved'),false);
 assert.ok(a.run('p.act1Motion.speed===null||p.act1Motion.speed*'+direction+'<=4'));
 for(let pass=0;pass<2;pass++){
  setup(14);a.run(`press('${direction>0?'ArrowRight':'ArrowLeft'}',true);for(let i=0;i<160&&(i<8||p.loop);i++)update()`);
  assert.equal(a.run('testedLoop.solved'),true);
  assert.equal(a.run('stats.loops'),1,'revisits cannot farm completion score');
  assert.equal(a.run('testedLoop.used'),false);
 }
 setup(18);a.run(`press('${direction>0?'ArrowRight':'ArrowLeft'}',true);for(let i=0;i<8;i++)update();var departureContact=act1Contact(p.act1Motion);var departureSpeed=p.act1Motion.speed;press('Space',true);update()`);
 assert.equal(a.run('p.act1Motion.mode'),'airborne');
 assert.equal(a.run('p.act1Motion.lastTakeoff.reason'),'jump');
 assert.ok(Math.abs(a.run('p.act1Motion.lastTakeoff.vx-(departureSpeed*departureContact.tx+10.5*departureContact.nx)'))<1e-6);
});

test('moving spring uses its physical mount velocity once and launches on repeated descending contacts',()=>{
 const a=boot();
 for(const phase of [0,75,150,225]){
  a.run(`runFrames=${phase};keys.clear();var movingCap=level.springs.find(d=>d.id==='mid-moving-spring');delete movingCap.firedAt;var cap=act1SpringFace(movingCap,runFrames);Object.assign(p,{x:cap.x,y:cap.y-45,vx:cap.vx,vy:28,ground:false,surface:null,rolling:false,roll:false,inv:9999});resetAct1Motion();var expectedCarrier=act1Surface(surfaceById(movingCap.surfaceId),cap.x,runFrames).vx;var launchesBefore=p.act1Motion.launches||0;update()`);
  assert.equal(a.run('(p.act1Motion.launches||0)-launchesBefore'),1);
  assert.equal(a.run('p.act1Motion.air.cutEligible'),false);
  assert.ok(Math.abs(a.run('p.vx-expectedCarrier'))<.081,'only one mount transfer plus at most one tick air steering');
 }
});

test('spring casings block fast side/back contact without firing their caps',()=>{
 for(const approach of ['side','below']){
  const a=boot();
  a.run(`var capDevice=level.springs.find(d=>d.id==='mid-left-spring'),capGeometry=act1SpringFace(capDevice,runFrames);Object.assign(p,{x:capGeometry.x${approach==='side'?'-100':''},y:capGeometry.y${approach==='side'?'+15':'+80'},vx:${approach==='side'?160:0},vy:${approach==='side'?0:-160},ground:false,surface:null,rolling:false,roll:false,inv:9999});resetAct1Motion();update()`);
  assert.equal(a.run('capDevice.firedAt'),undefined);
  assert.ok(a.run(approach==='side'?'p.x<capGeometry.x-30':'p.y>capGeometry.y'),'visible casing cannot be tunneled through');
 }
});

test('water force ratios, bubble breathing/slam and death/reset remain owned by Act 2',()=>{
 const a=boot();
 a.run(`keys.clear();var pool=level.middleSection.pool;Object.assign(p,{x:(pool.x1+pool.x2)/2,y:pool.y+10,vx:8,vy:0,ground:false,surface:null,rolling:false,roll:false,underwater:false});resetAct1Motion();var beforeWaterX=p.x;update()`);
 assert.ok(Math.abs(a.run('p.x-beforeWaterX')-4)<1e-7);
 assert.ok(Math.abs(a.run('p.vy')-.1)<1e-8);
 a.run(`p.shield='bubble';p.airTicks=1;updateBreathing();press('Space',true);update()`);
 assert.equal(a.run('p.bubbleSlam'),true);
 assert.ok(a.run('p.vy')>=8);
 a.run(`checkpoint=12;count=0;die()`);
 assert.equal(a.run('p.act1Motion.act'),2);
 assert.equal(a.run('p.act1Motion.updates'),0);
 assert.equal(a.run('p.bubbleSlam'),false);
 assert.equal(a.run('keys.size'),0);
});

test('boss-owned ticks freeze the movement controller, then return cleanly; ending bypasses it',()=>{
 const a=boot();
 a.run(`var arenaDeck=surfaceById('summit-arena');Object.assign(p,{x:level.arena.x+400,y:arenaDeck.y1-20,vx:0,vy:0,ground:true,surface:arenaDeck,rolling:false,roll:false});resetAct1Motion();update();var beforeBossTicks=p.act1Motion.updates;for(let i=0;i<200;i++)update()`);
 assert.equal(a.run('p.act1Motion.updates'),a.run('beforeBossTicks'));
 assert.equal(a.run('p.act1Motion.pendingJump'),false);
 a.run(`for(let i=0;i<50;i++)update();press('ArrowRight',true);var beforeWalk=p.x;for(let i=0;i<10;i++)update()`);
 assert.ok(a.run('p.x>beforeWalk'));
 a.run(`boss.state='defeated';update();endingArtReady=()=>true;var beforeEndingTicks=p.act1Motion.updates;for(let i=0;i<1000;i++)update()`);
 assert.equal(a.run('mode'),'win');
 assert.equal(a.run('p.act1Motion.updates'),a.run('beforeEndingTicks'));
});

test('crossing water during an already purchased air burst preserves its clock and allowance',()=>{
 const a=boot();
 a.run(`var wetPool=level.middleSection.pool;var wetEntry=wetPool.x1;while(!waterAt(wetEntry,wetPool.y+20))wetEntry++;Object.assign(p,{x:wetEntry-12,y:wetPool.y+20,vx:10,vy:0,ground:false,surface:null,rolling:false,roll:false,underwater:false});resetAct1Motion();press('ShiftLeft',true);update()`);
 assert.equal(a.run('p.underwater'),true);
 assert.equal(a.run('p.act1Motion.boost.remaining'),17);
 assert.equal(a.run('p.act1Motion.boost.airUsed'),true);
 assert.equal(a.run('boost'),67.5);
 assert.equal(a.run('p.vy'),0);
});

test('ordinary springs share one impulse; prescribed route launchers are visible vents',()=>{
 const a=boot();
 assert.ok(a.run('level.springs.every(d=>d.power===experimentalDeviceTuning.springSpeed&&d.launchX===undefined)'));
 for(const id of ['blimp-entry-spring','blimp-return-spring','mid-low-spring']){
  assert.ok(a.run(`level.pads.some(d=>d.id==='${id}'&&d.cityVent&&d.replacesSpring)`));
  assert.equal(a.run(`level.springs.some(d=>d.id==='${id}')`),false);
 }
});


test('earned momentum breaks the actual Skyline wall and awards its event once',()=>{
 const a=boot();a.run(`var wall=level.hazards.find(h=>h.id==='split-skyline-crack-195');var wallDeck=level.surfaces.find(s=>s.x1<=wall.x-80&&s.x2>=wall.x-80&&Math.abs(yOn(s,wall.x-80)-wall.floor)<100);Object.assign(p,{x:wall.x-80,y:yOn(wallDeck,wall.x-80)-20,vx:25,vy:0,ground:true,surface:wallDeck,rolling:true,roll:true,inv:9999});resetAct1Motion();var barriersBefore=stats.barriers||0;for(let i=0;i<9;i++)update()`);
 assert.equal(a.run('wall.broken'),true);
 assert.equal(a.run('(stats.barriers||0)-barriersBefore'),1);
});

test('tower caps release at either edge without zero-time solid-top reattachment',()=>{
 for(const faceId of ['under-attack-tower-face-21','skyline-fork-tower-face-58','split-skyline-tower-face-215','city-climax-tower-face-243']){
  const a=boot();
  for(const direction of [-1,1])for(const rolling of [false,true]){
   a.run(`start();keys.clear();var cap=level.surfaces.find(s=>s.faceId==='${faceId}');var edge=${direction}>0?cap.x2:cap.x1;Object.assign(p,{x:edge-(${direction})*2,y:yOn(cap,edge-(${direction})*2)-20,vx:${direction}*14,vy:0,ground:true,surface:cap,rolling:${rolling},roll:${rolling},inv:9999});resetAct1Motion();keys.add('${direction>0?'ArrowRight':'ArrowLeft'}')`);
   assert.doesNotThrow(()=>a.run('for(let i=0;i<6;i++)update()'),`${faceId} direction ${direction} rolling ${rolling}`);
   assert.ok(a.run(`(p.x-edge)*${direction}>60`),'movement advances beyond the cap');
   assert.ok(a.run('p.act1Motion.updates>=6'),'all requested ticks complete');
  }
 }
});
