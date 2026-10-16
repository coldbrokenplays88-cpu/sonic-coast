const { test } = require('node:test'),
  assert = require('node:assert/strict'),
  { boot } = require('./test-support.cjs');
function scene(act = 2) {
  const a = boot(act);
  a.run(
    `level.surfaces=[];level.springs=[];level.pads=[];level.hazards=[];level.loops=[];level.monitors=[];level.checkpoints=[];level.deathZones=[];level.middleSection=null;level.floorAt=()=>1e6;level.surfaceIndex=new Map();rings=[];enemies=[];boost=90;END=100000;keys.clear();Object.assign(p,{x:1000,y:-2000,vx:0,vy:0,ground:false,surface:null,inv:0,hurt:0,rolling:false,scriptedLaunch:false});count=20`
  );
  return a;
}
const near = (a, b) => assert.ok(Math.abs(a - b) < 1e-7, `${a} != ${b}`);
for (const act of [1, 2]) {
  test(`act ${act}: air burst costs exactly 25%, including the last quarter`, () => {
    for (const gauge of [90, 22.5]) {
      const a = scene(act);
      a.run(
        `boost=${gauge};press('ShiftLeft');for(let i=0;i<18;i++){runFrames++;updateMovement()}`
      );
      near(a.run('boost'), gauge - 22.5);
      assert.equal(a.run('p.airBoostUsed'), true);
      near(a.run('p.vy'), 0);
      a.run('runFrames++;updateMovement()');
      assert.equal(a.run('p.boosting'), false);
      near(a.run('boost'), gauge - 22.5);
    }
  });
  test(`act ${act}: insufficient charge cannot buy a partial burst`, () => {
    const a = scene(act);
    a.run("boost=22;press('ShiftLeft');updateMovement()");
    near(a.run('boost'), 22);
    assert.equal(a.run('p.airBoostUsed'), false);
  });
  test(`act ${act}: ground boost carried into air coasts without drain until a fresh press`, () => {
    const a = scene(act);
    a.run(
      `const s={id:'floor',x1:0,x2:10000,y1:-1000,y2:-1000,kind:'main'};level.surfaces=[s];Object.assign(p,{x:1000,y:-1020,vx:14,ground:true,surface:s});press('ShiftLeft');updateMovement();window.energy=boost;jump();updateMovement()`
    );
    assert.equal(a.run('p.boosting'), false);
    assert.equal(a.run('p.airBoostUsed'), false);
    near(a.run('boost'), a.run('window.energy'));
    a.run("release('ShiftLeft');press('ShiftLeft');updateMovement()");
    near(a.run('boost'), a.run('window.energy') - 22.5);
    assert.equal(a.run('p.airBoostUsed'), true);
  });
}
function springScene(angle = 0, motion = false) {
  const a = scene();
  a.run(
    `level.springs=[{id:'test-spring',x:1000,y:-1000,power:${angle === 4 ? 0 : 20},launchX:${angle === 0 ? 0 : angle === 4 ? 25 : 20},surfaceId:'support'}];level.surfaces=${motion ? "[{id:'support',x1:900,x2:1100,y1:-1000,y2:-1000,motion:{axis:'x',amp:150,period:180,phase:0}}]" : '[]'};level.surfaceIndex=new Map(level.surfaces.map(s=>[s.id,s]));`
  );
  return a;
}
test('upright cap catches fast airborne landings without supporting-floor proximity', () => {
  for (const speed of [8, 23, 120]) {
    const a = springScene();
    a.run(
      `p.x=1000;p.y=-1060-${speed / 2};p.vy=${speed};moveAndResolveSurfaces();activateWorldDevices()`
    );
    assert.equal(a.run('level.springs[0].firedAt'), 0);
    assert.ok(a.run('p.vy') < 0);
    assert.equal(a.run('p.ground'), false);
  }
});
test('upright spring casing and underside do not trigger the cap', () => {
  const a = springScene();
  a.run(
    `const s={id:'support',x1:800,x2:1200,y1:-1000,y2:-1000,kind:'main'};level.surfaces=[s];Object.assign(p,{x:1000,y:-1020,vx:8,vy:0,ground:true,surface:s});activateWorldDevices()`
  );
  assert.equal(a.run('level.springs[0].firedAt'), undefined);
  const b = springScene();
  b.run('p.x=1000;p.y=-1010;p.vy=-80;moveAndResolveSurfaces();activateWorldDevices()');
  assert.equal(b.run('level.springs[0].firedAt'), undefined);
});
test('diagonal and horizontal springs catch front impacts and reject the back face', () => {
  for (const angle of [2, 4])
    for (const front of [true, false]) {
      const a = springScene(angle);
      a.run(
        `const a=${angle}*Math.PI/8,nx=Math.sin(a),ny=-Math.cos(a),height=38,radius=Math.abs(nx)*13+Math.abs(ny)*height/2,cx=1000+nx*40,cy=-1000+ny*40,side=${front ? 1 : -1};Object.assign(p,{x:cx+nx*(radius+50)*side,y:cy+ny*(radius+50)*side-20+height/2,vx:-nx*100*side,vy:-ny*100*side});moveAndResolveSurfaces();activateWorldDevices()`
      );
      assert.equal(a.run('level.springs[0].firedAt!==undefined'), front);
    }
});
test('moving spring cap follows the platform throughout its cycle', () => {
  for (const frame of [1, 40, 90, 130]) {
    const a = springScene(0, true);
    a.run(
      `runFrames=${frame};const q=airDevicePose(level.springs[0]);p.x=q.x;p.y=q.y-100;p.vy=120;moveAndResolveSurfaces();activateWorldDevices()`
    );
    assert.equal(a.run('level.springs[0].firedAt'), frame);
  }
});
test('a later genuine cap landing can activate the spring again', () => {
  const a = springScene();
  a.run(
    `p.x=1000;p.y=-1100;p.vy=120;moveAndResolveSurfaces();activateWorldDevices();runFrames=90;p.x=1000;p.y=-1100;p.vy=120;moveAndResolveSurfaces();activateWorldDevices()`
  );
  assert.equal(a.run('level.springs[0].firedAt'), 90);
});
for (const [direction, vx, vy, x, y] of [
  ['up', 0, 100, 1000, -1120],
  ['down', 0, -100, 1000, -900],
  ['left', 100, 0, 900, -1020],
  ['right', -100, 0, 1100, -1020],
])
  test(`${direction} spikes hurt on their pointed face`, () => {
    const a = scene();
    a.run(
      `level.hazards=[{id:'spikes',type:'spikes',direction:'${direction}',x:980,y:-1040,w:40,h:40}];Object.assign(p,{x:${x},y:${y},vx:${vx},vy:${vy}});moveAndResolveSurfaces();resolveHazards(p.lastX,p.lastY)`
    );
    assert.equal(a.run('stats.hits'), 1);
  });
test('upward spike sides and underside do not hurt', () => {
  for (const [x, y, vx, vy] of [
    [900, -1010, 100, 0],
    [1100, -1010, -100, 0],
    [1000, -930, 0, -100],
  ]) {
    const a = scene();
    a.run(
      `level.hazards=[{type:'spikes',x:980,y:-1040,w:40,h:40}];Object.assign(p,{x:${x},y:${y},vx:${vx},vy:${vy}});moveAndResolveSurfaces();resolveHazards(p.lastX,p.lastY)`
    );
    assert.equal(a.run('stats.hits'), 0);
  }
});
test('horizontal jump hazards have visible side spikes on solid mounts', () => {
  for (const act of [1, 2]) {
    const a = boot(act);
    assert.ok(a.run("level.hazards.some(h=>h.type==='spikes'&&h.direction==='left')"));
    assert.ok(a.run("level.hazards.some(h=>h.spikeMount&&h.type==='bulkhead')"));
  }
});
test('fast movement cannot skip rings, attacking monitors or enemies', () => {
  const a = scene();
  a.run(
    `rings=[{x:1090,y:-2000,taken:false}];level.monitors=[{id:'box',x:1090,y:-1960,broken:false}];enemies=[{id:'enemy',x:1090,y:-2000,base:1090,baseY:-2000,phase:0,range:0,alive:true}];p.vx=180;p.jumpAttack=true;updateMovement();collectWorldRings();collectBoostMonitors();updateWorldEnemies()`
  );
  assert.equal(a.run('rings[0].taken'), true);
  assert.equal(a.run('level.monitors[0].broken'), true);
  assert.equal(a.run('enemies[0].alive'), false);
});
test('a non-attacking fast enemy crossing hurts once', () => {
  const a = scene();
  a.run(
    `enemies=[{id:'enemy',x:1090,y:-2000,base:1090,baseY:-2000,phase:0,range:0,alive:true}];p.vx=180;updateMovement();updateWorldEnemies()`
  );
  assert.equal(a.run('stats.hits'), 1);
  assert.equal(a.run('enemies[0].alive'), true);
});
test('checkpoint crossing is recorded before leaving the valid roof', () => {
  const a = scene();
  a.run(
    `const s={id:'checkpoint-roof',x1:500,x2:1100,y1:-1000,y2:-1000,kind:'main'};level.surfaces=[s];level.checkpoints=[{x:500,y:-1000,surfaceId:s.id},{x:1095,y:-1000,surfaceId:s.id}];checkpoint=0;Object.assign(p,{x:1000,y:-1020,vx:180,ground:true,surface:s});updateMovement();updateWorldCheckpoints()`
  );
  assert.equal(a.run('checkpoint'), 1);
});

test('air burst pays once on a tap, does not refund, and landing permits a new burst', () => {
  const a = scene();
  a.run("press('ShiftLeft');updateMovement();release('ShiftLeft');updateMovement()");
  near(a.run('boost'), 67.5);
  assert.equal(a.run('p.airBoostActive'), false);
  a.run("press('ShiftLeft');updateMovement()");
  near(a.run('boost'), 67.5);
  a.run(
    "release('ShiftLeft');const s={id:'land',x1:0,x2:2000,y1:-1000,y2:-1000,kind:'main'};land(s,-1000);jump();press('ShiftLeft');updateMovement()"
  );
  near(a.run('boost'), 45);
  assert.equal(a.run('p.airBoostUsed'), true);
});
test('normal ground boost drain and empty-gauge free rails remain unchanged', () => {
  for (const free of [false, true]) {
    const a = scene();
    a.run(
      `const s={id:'rail',x1:0,x2:10000,y1:-1000,y2:-1000,kind:'express',grindable:${free},infiniteBoost:${free}};Object.assign(p,{x:1000,y:-1020,ground:true,surface:s,vx:14});boost=${free ? 0 : 90};for(let n=0;n<20;n++)updateBoostState(true)`
    );
    near(a.run('boost'), free ? 0 : 80);
    assert.equal(a.run('p.boosting'), true);
  }
});
test('parallel travel beside an upright cap and contacts beyond its ends cannot fire it', () => {
  const a = springScene();
  a.run('p.x=900;p.y=-1060;p.vx=180;p.vy=0;moveAndResolveSurfaces()');
  assert.equal(a.run('level.springs[0].firedAt'), undefined);
  const b = springScene(2);
  b.run(
    `const f=springFace(level.springs[0]),r=(13+19)*Math.SQRT1_2;Object.assign(p,{x:f.x+f.tx*80+f.nx*(r+20),y:f.y+f.ty*80+f.ny*(r+20)-1,vx:-f.nx*80,vy:-f.ny*80});moveAndResolveSurfaces()`
  );
  assert.equal(b.run('level.springs[0].firedAt'), undefined);
});
test('a high-speed grounded crossing activates an existing launch vent', () => {
  const a = scene();
  a.run(
    `const s={id:'vent-roof',x1:0,x2:5000,y1:-1000,y2:-1000,kind:'main'};level.surfaces=[s];level.pads=[{id:'vent',x:1090,y:-1000,cityVent:true,power:20,launchX:10}];Object.assign(p,{x:1000,y:-1020,vx:180,ground:true,surface:s});updateMovement()`
  );
  assert.equal(a.run('level.pads[0].firedAt'), 0);
  assert.equal(a.run('p.ground'), false);
  assert.ok(a.run('p.vy') < 0);
});
test('solid walls stop a fast sweep before objects behind them are collected', () => {
  const a = scene();
  a.run(
    `level.hazards=[{id:'wall',type:'bulkhead',x:1050,y:-2200,w:20,h:400}];rings=[{x:1120,y:-2000,taken:false}];level.monitors=[{id:'box',x:1120,y:-1960,broken:false}];p.vx=180;p.jumpAttack=true;updateMovement()`
  );
  assert.equal(a.run('rings[0].taken'), false);
  assert.equal(a.run('level.monitors[0].broken'), false);
  assert.ok(a.run('p.x') < 1050);
});
test('rings inside a loop are not collected by sweeping the chord of its trajectory', () => {
  const a = scene();
  a.run(
    `level.loops=[{id:'loop',x:2000,y:-1000,r:94}];p.x=2000;p.y=-1020;p.vx=80;keys.add('ArrowRight');rings=[{x:2000,y:-1114,taken:false}];beginLoop(level.loops[0]);for(let n=0;n<20&&p.loop;n++){runFrames++;updateLoop()}`
  );
  assert.equal(a.run('stats.loops'), 1);
  assert.equal(a.run('rings[0].taken'), false);
});

test('new spike mounts support standing and ordinary jumps from their safe top', () => {
  const a = boot(1);
  a.run(
    `const h=level.hazards.find(h=>h.spikeMount);Object.assign(p,{x:h.x+h.w/2,y:h.y-35,vx:0,vy:20,ground:false,surface:null,inv:0});count=20;keys.clear();updateMovement()`
  );
  assert.equal(a.run('p.ground'), true);
  assert.equal(a.run('p.surface.id'), a.run('h.id'));
  a.run('jump()');
  assert.equal(a.run('p.ground'), false);
  assert.ok(a.run('p.vy') < 0);
});

test('boss-owned destruction movement keeps ordinary world interactions frozen', () => {
  const a = scene();
  a.run(
    `boss={state:'destroyed'};rings=[{x:1090,y:-2000,taken:false}];level.monitors=[{id:'box',x:1090,y:-1960,broken:false}];p.vx=180;p.jumpAttack=true;updateMovement()`
  );
  assert.equal(a.run('rings[0].taken'), false);
  assert.equal(a.run('level.monitors[0].broken'), false);
});

test('running flush across a spring cap activates it instead of standing on its face', () => {
  const a = springScene();
  a.run(
    `const s={id:'cap-height',x1:800,x2:1400,y1:-1040,y2:-1040,kind:'main'};level.surfaces=[s];Object.assign(p,{x:900,y:-1060,vx:180,vy:0,ground:true,surface:s});moveAndResolveSurfaces()`
  );
  assert.equal(a.run('level.springs[0].firedAt'), 0);
  assert.equal(a.run('p.ground'), false);
});
