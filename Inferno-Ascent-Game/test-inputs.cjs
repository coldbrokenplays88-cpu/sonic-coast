const {test}=require('node:test');
const assert=require('node:assert/strict');
const {boot}=require('./test-support.cjs');
test('registers timed input tool',()=>{assert.ok(boot().tools.has('step_game_frames'));});
for(const act of [1,2])test('held movement uses exact normal physics in act '+act,()=>{
 const a=boot(act),b=boot(act);
 const r=a.call('step_game_frames',{keys:['right'],frames:60});
 b.run("press('ArrowRight');for(let i=0;i<60;i++)update();release('ArrowRight')");
 assert.equal(r.x,b.run('p.x'));assert.equal(r.vx,b.run('p.vx'));
 assert.equal(r.framesAdvanced,60);assert.equal(a.run('keys.size'),0);
 assert.ok(r.x>120);assert.equal(a.run('runFrames'),60);
});
test('held jump rises higher than a tap',()=>{
 const a=boot(),b=boot();
 const held=a.call('step_game_frames',{keys:['jump'],frames:12});
 b.call('step_game_frames',{keys:['jump'],frames:1});
 const tap=b.call('step_game_frames',{keys:[],frames:11});
 assert.ok(held.y<tap.y);assert.equal(held.jumps,1);assert.equal(a.run('p.jumpHeld'),false);
});
test('boost accelerates and consumes boost',()=>{
 const a=boot();const r=a.call('step_game_frames',{keys:['right','boost'],frames:10});
 assert.ok(r.vx>15);assert.ok(r.boost<90);assert.equal(a.run('keys.size'),0);
});
test('roll and spin dash use the existing handlers',()=>{
 const a=boot();a.call('step_game_frames',{keys:['down','jump'],frames:1});
 const r=a.call('step_game_frames',{keys:[],frames:1});
 assert.ok(r.vx>10);assert.ok(r.rolls>=1);
});
test('inspection freezes simulation and physical input restores it',()=>{
 const a=boot();a.call('step_game_frames',{keys:['right'],frames:30});
 const x=a.run('p.x');a.run('frame(1000);frame(1100)');
 assert.equal(a.run('p.x'),x);a.run("press('ArrowRight');frame(1200)");
 assert.ok(a.run('p.x')>x);
});
test('invalid requests fail before changing state',()=>{
 const a=boot();for(const input of [{keys:['teleport'],frames:1},{keys:['right'],frames:0},{keys:[],frames:601},{keys:[],frames:1.5},{keys:[],frames:1,extra:true},{keys:['left','right'],frames:1}]){
 assert.throws(()=>a.call('step_game_frames',input));assert.equal(a.run('runFrames'),0);
 }
});
test('stops on death and releases all controls',()=>{
 const a=boot();a.run('p.x=2000;p.y=10000;p.ground=false;p.surface=null');
 const r=a.call('step_game_frames',{keys:['right','boost'],frames:60});
 assert.equal(r.deaths,1);assert.equal(r.framesAdvanced,1);assert.equal(a.run('keys.size'),0);
});
test('restart restores ordinary playback',()=>{
 const a=boot();a.call('step_game_frames',{keys:[],frames:1});a.call('restart_game');
 assert.equal(a.run('testControlled'),false);assert.equal(a.run('runFrames'),0);
});
test('camera zoom changes continuously across the old speed threshold',()=>{
 const a=boot();
 const at=speed=>a.run(`p.vx=${speed};zoom=1;for(let i=0;i<400;i++)updateCamera();zoom`);
 assert.ok(Math.abs(at(15.99)-at(16.01))<.001);
 const values=[0,8,12,16,20,24].map(at);
 for(let i=1;i<values.length;i++)assert.ok(values[i]<=values[i-1]);
 assert.ok(values[2]<values[1]&&values[2]>values[4]);
 assert.ok(Math.abs(values[0]-.94)<.0001);
 assert.ok(Math.abs(values.at(-1)-.76)<.0001);
});
test('vertical camera framing stays continuous when ground speed crosses nine',()=>{
 const a=boot();
 const at=speed=>a.run(`p.ground=true;p.loop=null;p.x=1800;p.y=-200;p.vx=${speed};p.vy=0;zoom=.94;camY=-560;updateCamera();(p.y-camY)*zoom`);
 assert.ok(Math.abs(at(8.99)-at(9.01))<.1,'tiny speed changes must not jerk the scene vertically');
});
test('spring drawing compresses, extends and returns to rest after firing',()=>{
 const a=boot();
 a.run('const springVisual={x:100,y:420,firedAt:100};');
 const render=frame=>{a.rects.length=0;a.run(`runFrames=${frame};drawPixelAirDevice(springVisual,true)`);return a.rects.map(r=>[...r]);};
 const resting=render(99),compressed=render(100),extended=render(105);
 assert.notDeepEqual(compressed,resting);
 assert.notDeepEqual(extended,compressed);
 assert.ok(Math.min(...extended.map(r=>r[1]))<Math.min(...resting.map(r=>r[1])));
 assert.deepEqual(render(125),resting);
 assert.equal(a.run('springVisual.y'),420);
 for(const r of extended)for(const n of r)assert.equal(n%2,0);
});
for(const axis of ['x','y'])test('rider stays on an authored moving platform on axis '+axis,()=>{
 const a=boot();
 a.run(`const ride=level.surfaces.find(s=>s.kind==='moving'&&s.motion.axis==='${axis}');
 level.surfaces=[ride];level.hazards=[];level.deathZones=[];level.floorAt=()=>1e6;
 p.x=(pose(ride).x1+pose(ride).x2)/2;p.y=yOn(ride,p.x)-20;p.vx=0;p.vy=0;p.ground=true;p.surface=ride;
 for(let i=0;i<60;i++){runFrames++;updateMovement();}`);
 assert.equal(a.run('p.surface.id'),a.run('ride.id'));
 assert.equal(a.run('p.ground'),true);
 assert.ok(Math.abs(a.run('feet()-yOn(ride,p.x)'))<.0001);
 assert.ok(Math.abs(a.run('p.x-(pose(ride).x1+pose(ride).x2)/2'))<.0001);
});
test('running on an authored angled deck follows its collision top',()=>{
 const a=boot();
 a.run(`const slopeDeck=level.surfaces.find(s=>s.y1!==s.y2&&!s.motion&&!s.sealedBy&&s.x2-s.x1>400);
 level.surfaces=[slopeDeck];level.hazards=[];level.deathZones=[];level.floorAt=()=>1e6;
 p.x=slopeDeck.x1+40;p.y=yOn(slopeDeck,p.x)-20;p.vx=5;p.vy=0;p.ground=true;p.surface=slopeDeck;
 press('ArrowRight');for(let i=0;i<20;i++){runFrames++;updateMovement();}`);
 assert.equal(a.run('p.ground'),true);
 assert.equal(a.run('p.surface.id'),a.run('slopeDeck.id'));
 assert.ok(Math.abs(a.run('feet()-yOn(slopeDeck,p.x)'))<.0001);
});
test('recovered sprites take priority for every active movement state',()=>{
 const a=boot();
 a.run('art.recoveredSpeedster={};art.recoveredPeelout={};');
 const cases=[
  ["p.ground=true;p.vx=0;runFrames=400",'idle'],
  ["p.ground=true;p.vx=8;keys.add('ArrowRight')",'run'],
  ["p.ground=true;p.vx=20;p.boosting=true",'boost'],
  ["p.ground=true;p.vx=5;p.boosting=false;p.rolling=true",'roll'],
  ["p.ground=false;p.rolling=false;p.vy=-12;p.poseJumpFrame=runFrames-10",'rise'],
  ["p.ground=false;p.vy=10",'fall'],
  ["p.ground=true;p.vx=10;p.brakeActive=true;keys.clear()",'brake'],
  ["p.brakeActive=false;p.surface={grindable:true,x1:0,x2:100,y1:0,y2:0};p.vx=20",'grind-fast'],
  ["p.surface=null;p.hurt=10",'hurt']
 ];
 for(const [setup,state]of cases){a.run(setup);const pose=a.run('sonicPose()');assert.equal(pose.state,state);assert.ok(['recoveredSpeedster','recoveredPeelout'].includes(pose.sheet));assert.ok(Number.isInteger(pose.frame)&&pose.frame>=0&&pose.frame<48);}
});
