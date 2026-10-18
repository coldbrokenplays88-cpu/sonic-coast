const { test } = require('node:test');
const assert = require('node:assert/strict');
const { boot } = require('./test-support.cjs');

test('Split Skyline ramp joins the continuing flat instead of its overlapping ending deck', () => {
  for (const rolling of [false, true]) for (const speed of [8, 14, 24]) {
    const a = boot();
    a.run(`var ramp=surfaceById('split-skyline-act2-190');
      Object.assign(p,{x:ramp.x2-50,y:yOn(ramp,ramp.x2-50)-20,vx:${speed},vy:0,
        ground:true,surface:ramp,rolling:${rolling},roll:${rolling},inv:9999});
      resetAct1Motion();press('ArrowRight',true);for(let i=0;i<12;i++)update()`);
    assert.equal(a.run('p.surface?.id'), 'split-skyline-act2-205', `speed ${speed}, rolling ${rolling}`);
    assert.equal(a.run('p.ground'), true);
    assert.equal(a.run('stats.deaths'), 0);
  }
});

test('Split Skyline interior rails allow held Boost from an empty meter through the uphill exit', () => {
  const a = boot();
  for (const id of ['secret-rail-down','secret-rail-bottom','secret-rail-up','secret-rail-merge'])
    assert.equal(a.run(`surfaceById('${id}').infiniteBoost`), true, id);
  a.run(`level.hazards.find(h=>h.id==='secret-facade-wall').broken=true;
    var rail=surfaceById('secret-rail-down');boost=0;
    Object.assign(p,{x:rail.x1+4,y:yOn(rail,rail.x1+4)-20,vx:0,vy:0,
      ground:true,surface:rail,rolling:false,roll:false,inv:9999});resetAct1Motion();
    press('ArrowRight',true);press('ShiftLeft',true);var interiorVisited=new Set();
    for(let i=0;i<200;i++){update();if(p.surface)interiorVisited.add(p.surface.id);if(p.x>=surfaceById('secret-rail-merge').x2)break}`);
  for (const id of ['secret-rail-down','secret-rail-bottom','secret-rail-up'])
    assert.equal(a.run(`interiorVisited.has('${id}')`), true, id);
  assert.ok(a.run("p.x>=surfaceById('secret-rail-merge').x2"));
  assert.equal(a.run('boost'), 0);
  assert.equal(a.run('stats.deaths'), 0);
});

test('first upper spring is reachable with a held ordinary jump from the fallen slope', () => {
  for (const speed of [6, 8]) {
    const a = boot();
    a.run(`var floor=surfaceById('mid-fallen-building'),x=level.middleSection.start+700;
      Object.assign(p,{x,y:yOn(floor,x)-20,vx:${speed},vy:0,ground:true,surface:floor,
        rolling:false,roll:false,inv:9999});resetAct1Motion();boost=0;
      press('ArrowRight',true);press('Space',true);
      var first=level.springs.find(d=>d.id==='mid-upper-spring');
      for(let i=0;i<90&&first.firedAt===undefined;i++)update()`);
    assert.ok(a.run('first.firedAt!==undefined'), `approach speed ${speed}`);
    assert.equal(a.run('stats.deaths'), 0);
    assert.equal(a.run('p.act1Motion.boost.bursts'), 0);
  }
});

test('lower vent and water route reaches the tilted roof by a normal jump without a momentum pad', () => {
  const a = boot();
  assert.equal(a.run("level.pads.some(d=>d.id==='mid-pool-booster'||d.poolBooster)"), false);
  a.run(`var vent=level.pads.find(d=>d.id==='mid-low-spring'),floor=surfaceById(vent.surfaceId);
    Object.assign(p,{x:vent.x-30,y:yOn(floor,vent.x-30)-20,vx:8,vy:0,
      ground:true,surface:floor,rolling:false,roll:false,inv:9999});resetAct1Motion();boost=0;
    press('ArrowRight',true);press('ArrowDown',true);
    var poolEntered=false,jumpedFromPool=false,roofReached=false;
    for(let i=0;i<400;i++){
      if(!jumpedFromPool&&p.surface?.poolCurve&&p.x>level.middleSection.start+2050){
        release('ArrowDown',true);press('Space',true);jumpedFromPool=true;
      }
      update();poolEntered ||= !!p.surface?.poolCurve;
      roofReached ||= p.surface?.id==='mid-tilted-glass-roof';if(roofReached)break;
    }`);
  assert.equal(a.run('poolEntered&&jumpedFromPool&&roofReached'), true);
  assert.equal(a.run('stats.deaths'), 0);
  assert.equal(a.run('p.poolExit'), false, 'removed device cannot grant its old impulse');
  assert.equal(a.run('p.act1Motion.boost.bursts'), 0);
});
