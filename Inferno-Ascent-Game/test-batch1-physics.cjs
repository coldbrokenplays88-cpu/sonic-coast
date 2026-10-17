// Legacy controller unit fixtures; migrated Act 1 is covered in test-act1-motion.cjs.
const test = require('node:test'),
  assert = require('node:assert/strict'),
  { bootLegacy: boot } = require('./test-support.cjs');
function floor(act = 2) {
  const a = boot(act);
  a.run(
    `level.surfaces=[{id:'test',x1:0,x2:20000,y1:-1000,y2:-1000,kind:'main'}];level.hazards=[];level.pads=[];level.springs=[];level.loops=[];level.deathZones=[];level.floorAt=()=>1e6;END=30000;Object.assign(p,{x:1000,y:-1020,vx:0,vy:0,ground:true,surface:level.surfaces[0],inv:10000,rolling:false,dashRolling:false});keys.clear();boost=0;`
  );
  return a;
}
function loopRun({
  radius = 94,
  speed = 14,
  direction = 1,
  advanced = false,
  rolling = false,
} = {}) {
  const a = floor();
  a.run(
    `level.loops=[{id:'loop-test',x:2000,y:-1000,r:${radius},profile:${JSON.stringify(advanced ? 'advanced' : 'standard')},used:false,solved:false}];p.x=2000;p.vx=${direction * speed};p.rolling=${rolling};keys.add(${JSON.stringify(direction > 0 ? 'ArrowRight' : 'ArrowLeft')});beginLoop(level.loops[0]);window.lowest=${speed};`
  );
  let frames = 0;
  while (a.run('!!p.loop') && frames++ < 1200)
    a.run(
      'runFrames++;updateLoop();window.lowest=Math.min(window.lowest,Math.abs(p.loop?.speed??99))'
    );
  return { a, frames };
}
for (const radius of [40, 94, 95, 130, 200, 320])
  for (const direction of [1, -1])
    test(`standard loop ${radius}, direction ${direction}, clears at 14 without abilities`, () => {
      const { a } = loopRun({ radius, direction });
      assert.equal(a.run('stats.loops'), 1);
      assert.equal(a.run('boost'), 0);
      assert.equal(a.run('stats.jumps'), 0);
      assert.ok(a.run('window.lowest') > 0);
      assert.ok(a.run('p.vx') * direction > 0);
    });
test('standard loop contact still fails at low speed and high speed finishes faster', () => {
  for (const radius of [40, 94, 130, 320]) {
    const slow = loopRun({ radius, speed: 2 });
    assert.equal(slow.a.run('stats.loops'), 0);
    const normal = loopRun({ radius }),
      fast = loopRun({ radius, speed: 23 });
    assert.equal(fast.a.run('stats.loops'), 1);
    assert.ok(fast.frames < normal.frames);
  }
});
test('advanced loop opt-in retains stronger momentum requirements', () => {
  assert.equal(loopRun({ radius: 130, advanced: true }).a.run('stats.loops'), 0);
});
test('loop completion can be revisited without immediate retrigger or repeat score', () => {
  const { a } = loopRun();
  assert.equal(a.run('score'), 500);
  a.run('updateAct2()');
  assert.equal(a.run('!!p.loop'), false);
  a.run('p.x=1900;p.lastX=1910;p.vx=-14;updateAct2();p.lastX=1990;p.x=2001;p.vx=14;updateAct2()');
  assert.equal(a.run('!!p.loop'), true);
  for (let n = 0; n < 300 && a.run('!!p.loop'); n++) a.run('runFrames++;updateLoop()');
  assert.equal(a.run('stats.loops'), 1);
  assert.equal(a.run('score'), 500);
});
for (const act of [1, 2]) {
  test(`act ${act}: Spin Dash initial speed is below boost, but downhill momentum is not capped`, () => {
    const a = floor(act);
    a.run('charge=20;updateMovement()');
    assert.ok(a.run('p.vx') <= 19);
    assert.ok(a.run('p.vx') > 18);
    a.run(
      `p.surface.y1=-40000;p.surface.y2=-30000;p.x=5000;p.y=yOn(p.surface,p.x)-20;keys.add('ArrowDown');for(let i=0;i<180;i++){runFrames++;updateMovement()}`
    );
    assert.ok(a.run('measurementSpeed()') > 23);
  });
  test(`act ${act}: released roll slows to standing, but stays rolled under a low ceiling`, () => {
    const a = floor(act);
    a.run('p.vx=19;p.rolling=true;p.dashRolling=true');
    for (let i = 0; i < 600; i++) a.run('runFrames++;updateMovement()');
    assert.equal(a.run('p.rolling'), false);
    assert.equal(a.run('p.vx'), 0);
    const b = floor(act);
    b.run(
      `p.rolling=true;p.vx=0;level.hazards=[{type:'gate',x:900,y:-1045,w:300,h:15}];for(let i=0;i<120;i++){runFrames++;updateMovement()}`
    );
    assert.equal(b.run('p.rolling'), true);
    b.run('level.hazards=[];runFrames++;updateMovement()');
    assert.equal(b.run('p.rolling'), false);
  });
}
test('boostExit junction permits precision countersteering without changing designated express exits', () => {
  const a = floor();
  a.run("p.surface.boostExit=true;p.vx=10;keys.add('ArrowLeft');updateMovement()");
  assert.ok(a.run('p.vx') <= 8.9750001);
  const b = floor();
  b.run(
    "p.surface.boostExit=true;p.surface.kind='express';p.vx=10;keys.add('ArrowLeft');updateMovement()"
  );
  assert.equal(b.run('p.vx'), 9.18);
});
test('normal contact supports walls and ceilings without a vertical slope division', () => {
  const a = floor();
  a.run(
    `level.surfaces=[{id:'wall',contactMode:'oriented',x1:1000,y1:0,x2:1000,y2:-4000}];p.surface=level.surfaces[0];p.x=980;p.y=-100;p.contactSpeed=14;p.vx=0;p.vy=-14;keys.add('ArrowRight');for(let i=0;i<15;i++){runFrames++;updateMovement()}`
  );
  assert.equal(a.run('p.ground'), true);
  assert.ok(a.run('p.y') < -250);
  assert.ok(Number.isFinite(a.run('p.vx')));
  assert.ok(a.run('p.contactSpeed') < 14);
  const b = floor();
  b.run(
    `level.surfaces=[{id:'ceiling',contactMode:'oriented',x1:4000,y1:-1000,x2:0,y2:-1000}];p.surface=level.surfaces[0];p.x=2000;p.y=-980;p.contactSpeed=14;p.vx=-14;p.vy=0;keys.add('ArrowRight');for(let i=0;i<15;i++){runFrames++;updateMovement()}`
  );
  assert.equal(b.run('p.ground'), true);
  assert.ok(b.run('p.x') < 1900);
});
test('slow wall contact detaches; wall jump preserves travel and adds outward impulse', () => {
  const a = floor();
  a.run(
    `level.surfaces=[{id:'wall',contactMode:'oriented',x1:1000,y1:0,x2:1000,y2:-4000}];p.surface=level.surfaces[0];p.x=980;p.y=-100;p.contactSpeed=2;p.vx=0;p.vy=-2;updateMovement()`
  );
  assert.equal(a.run('p.ground'), false);
  const b = floor();
  b.run(
    `level.surfaces=[{id:'wall',contactMode:'oriented',x1:1000,y1:0,x2:1000,y2:-4000}];p.surface=level.surfaces[0];p.x=980;p.y=-100;p.contactSpeed=14;p.vx=0;p.vy=-14;jump()`
  );
  assert.ok(b.run('p.vx') < -13);
  assert.ok(b.run('p.vy') <= -14);
  assert.equal(b.run('p.ground'), false);
});
test('high-speed exits do not immediately retrigger the completed loop', () => {
  for (const speed of [23, 40, 80]) {
    const { a } = loopRun({ speed, rolling: true });
    a.run('p.lastX=p.x;runFrames++;updateMovement();updateAct2()');
    assert.equal(a.run('!!p.loop'), false);
    assert.ok(a.run('p.x') > 2000);
  }
});
test('directed floor, wall and ceiling joins conserve travel without leaving contact', () => {
  const a = floor();
  a.run(
    `level.surfaces=[{id:'floor',contactMode:'oriented',x1:0,y1:-1000,x2:1000,y2:-1000},{id:'wall',contactMode:'oriented',x1:1000,y1:-1000,x2:1000,y2:-1400},{id:'ceiling',contactMode:'oriented',x1:1000,y1:-1400,x2:0,y2:-1400}];p.surface=level.surfaces[0];p.x=940;p.y=-1020;p.contactSpeed=32;p.vx=32;p.vy=0;keys.add('ArrowRight');window.seen=new Set();for(let i=0;i<25;i++){runFrames++;updateMovement();window.seen.add(p.surface?.id)}`
  );
  assert.equal(a.run('p.ground'), true);
  assert.equal(a.run("window.seen.has('wall')"), true);
  assert.equal(a.run("window.seen.has('ceiling')"), true);
  assert.ok(a.run('measurementSpeed()') < 32);
  assert.ok(a.run('measurementSpeed()') > 15);
});
test('swept directed wall contact catches a fast airborne approach and rejects its back face', () => {
  const a = floor();
  a.run(
    `level.surfaces=[{id:'wall',contactMode:'oriented',x1:1100,y1:0,x2:1100,y2:-4000}];p.x=1000;p.y=-1500;p.vx=120;p.vy=-30;p.ground=false;p.surface=null;moveAndResolveSurfaces()`
  );
  assert.equal(a.run('p.surface?.id'), 'wall');
  assert.equal(a.run('p.x'), 1080);
  assert.ok(a.run('p.contactSpeed') > 25);
  const b = floor();
  b.run(
    `level.surfaces=[{id:'wall',contactMode:'oriented',x1:1100,y1:0,x2:1100,y2:-4000}];p.x=1200;p.y=-1500;p.vx=-120;p.vy=-30;p.ground=false;p.surface=null;moveAndResolveSurfaces()`
  );
  assert.equal(b.run('p.ground'), false);
});
test('moving wall carry and jump inherit platform motion exactly once', () => {
  const a = floor();
  a.run(
    `runFrames=20;level.surfaces=[{id:'wall',contactMode:'oriented',x1:1100,y1:0,x2:1100,y2:-4000,motion:{axis:'x',amp:30,period:180,phase:0}}];p.surface=level.surfaces[0];p.contactSpeed=14;p.vx=0;p.vy=-14;p.x=pose(p.surface).x1-20;p.y=-500;window.before=p.x;window.carry=surfaceVelocity(p.surface).x;applySurfaceMotion()`
  );
  assert.ok(Math.abs(a.run('p.x-window.before-window.carry')) < 1e-8);
  a.run('jump()');
  assert.ok(Math.abs(a.run('p.vx-window.carry+13.4')) < 1e-8);
  assert.ok(a.run('p.vy') < -13);
});
test('normal-force test rejects a fast convex crest without changing its launch velocity', () => {
  const a = floor();
  a.run(
    `level.surfaces=[{id:'flat',contactMode:'oriented',x1:0,y1:-1000,x2:1000,y2:-1000},{id:'down',contactMode:'oriented',x1:1000,y1:-1000,x2:1100,y2:-900}];p.surface=level.surfaces[0];p.x=995;p.y=-1020;p.contactSpeed=40;p.vx=40;p.vy=0;moveOrientedSurface(1)`
  );
  assert.equal(a.run('p.ground'), false);
  assert.equal(a.run('p.vx'), 40);
  assert.ok(a.run('p.vy') > 0);
  assert.ok(a.run('p.x') > 1000);
});

test('oriented flat contact preserves Spin Dash release and variable jump height', () => {
  const a = floor();
  a.run("p.surface.contactMode='oriented';p.contactSpeed=0;charge=20;updateMovement()");
  assert.ok(a.run('p.contactSpeed') > 18);
  assert.ok(a.run('p.contactSpeed') <= 19);
  const b = floor();
  b.run("p.surface.contactMode='oriented';p.contactSpeed=14;p.vx=14;jump();release('Space',true)");
  assert.equal(b.run('p.vy'), -5);
  assert.equal(b.run('p.vx'), 14);
});
test('boost accelerates reverse loops and preserves faster reverse momentum', () => {
  for (const speed of [14, 32]) {
    const a = floor();
    a.run(
      `level.loops=[{id:'reverse',x:2000,y:-1000,r:130}];p.vx=-${speed};p.face=-1;boost=90;keys.add('ArrowLeft');keys.add('ShiftLeft');beginLoop(level.loops[0]);updateLoop()`
    );
    assert.ok(a.run('p.loop.speed') < -speed + 0.1);
    assert.ok(a.run('boost') < 90);
  }
});

test('authored double loops clear consecutively at a normal running approach', () => {
  const a = boot();
  a.run(
    `const s=surfaceById('draw-loop-flat-1');Object.assign(p,{x:30200,y:s.y1-20,vx:14,vy:0,ground:true,surface:s,rolling:false});boost=0;keys.clear();press('ArrowRight',true)`
  );
  for (let n = 0; n < 240 && a.run('stats.loops') < 2; n++) a.run('update()');
  assert.equal(a.run('stats.loops'), 2);
  assert.equal(a.run('stats.jumps'), 0);
  assert.equal(a.run('stats.deaths'), 0);
  assert.equal(a.run('boost'), 0);
});

test('ground roll and airborne spin select the same 38-unit diameter in both artwork paths', () => {
  const a = boot();
  a.run(`art.recoveredSpeedster={};p.rolling=true;p.ground=true;p.hurt=0;charge=0`);
  assert.equal(a.run('recoveredSonicPose().diameter'), 38);
  a.run('p.ground=false');
  assert.equal(a.run('recoveredSonicPose().diameter'), 38);
  a.run(`delete art.recoveredSpeedster;delete art.recoveredPeelout;p.ground=true;art.sonic={}`);
  assert.equal(a.run('sonicPose().diameter'), 38);
  a.run('p.ground=false');
  assert.equal(a.run('sonicPose().diameter'), 38);
});

test('legacy floor to directed wall preserves unused substep travel', () => {
  const a = floor();
  a.run(
    `level.surfaces=[{id:'flat',x1:0,x2:1000,y1:-1000,y2:-1000,kind:'main'},{id:'wall',contactMode:'oriented',x1:1000,y1:-1000,x2:1000,y2:-1400}];p.surface=level.surfaces[0];Object.assign(p,{x:990,y:-1020,vx:40,vy:0});moveAndResolveSurfaces()`
  );
  assert.equal(a.run('p.surface.id'), 'wall');
  assert.equal(a.run('p.contactSpeed'), 40);
  assert.ok(Math.abs(a.run('p.y') + 1030) < 1e-8);
});
