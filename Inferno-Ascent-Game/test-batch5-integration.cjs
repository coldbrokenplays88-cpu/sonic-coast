const { test } = require('node:test');
const assert = require('node:assert/strict');
const { boot } = require('./test-support.cjs');

test('an airborne burst into the authored pool spring preserves its launch on following ticks', () => {
  const a = boot(2);
  a.run(`
    const d = level.springs.find(d => d.id === 'mid-low-spring');
    const f = springFace(d), r = Math.abs(f.nx) * 13 + Math.abs(f.ny) * 19;
    Object.assign(p, {x: f.x + f.nx * (r + 2), y: f.y + f.ny * (r + 2) - 1,
      ground: false, surface: null, vx: -23, vy: 0, face: -1, inv: 0});
    count = 20;
    keys.clear();
    press('ShiftLeft');
    update();
  `);
  assert.equal(a.run(`level.springs.find(d => d.id === 'mid-low-spring').firedAt`), 1);
  assert.equal(a.run('p.vy'), -18);
  assert.equal(a.run('p.airBoostActive'), false);
  assert.equal(a.run('p.airBoostFrames'), 0);
  assert.equal(a.run('p.airBoostUsed'), true);
  const y = a.run('p.y');
  a.run('update()');
  assert.ok(a.run('p.y') < y, 'held boost must not flatten the spring arc');
  assert.ok(a.run('p.vy') < -17);
  assert.equal(a.run('boost'), 67.5);
  a.run(`release('ShiftLeft');press('ShiftLeft');update()`);
  assert.equal(a.run('p.airBoostActive'), false, 'spring is not a landing that grants a second burst');
  assert.equal(a.run('boost'), 67.5);
});

for (const act of [1, 2]) {
  test(`act ${act}: a vent supersedes an active burst without replenishing the airborne allowance`, () => {
    const a = boot(act);
    a.run(`
      Object.assign(p, {x:5000,y:-20000,vx:8,vy:-4,ground:false,surface:null,inv:0});
      keys.clear();press('ShiftLeft');updateBoostState(true);
      launchAirDevice({id:'vent-integration-fixture',cityVent:true,x:p.x,y:p.y,power:20,launchX:8});
      updateBoostState(true);
    `);
    assert.equal(a.run('p.vy'), -20);
    assert.equal(a.run('p.vx'), 8);
    assert.equal(a.run('p.airBoostFrames'), 0);
    assert.equal(a.run('p.airBoostActive'), false);
    assert.equal(a.run('p.boosting'), false);
    assert.equal(a.run('p.airBoostUsed'), true);
    assert.equal(a.run('boost'), 67.5);
    a.run(`release('ShiftLeft');press('ShiftLeft');updateBoostState(true)`);
    assert.equal(a.run('p.boosting'), false);
    a.run(`release('ShiftLeft');land(level.surfaces[0],level.surfaces[0].y1)`);
    assert.equal(a.run('p.airBoostUsed'), false, 'only a real landing restores the allowance');
  });
}
