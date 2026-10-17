const { test } = require('node:test');
const assert = require('node:assert/strict');
const { boot } = require('./test-support.cjs');
function enter() {
  const a = boot();
  a.run(`selectAct('playtest');start()`);
  assert.equal(a.run('selectedAct'), 'playtest', 'PLAYTEST needs an explicit selector route');
  return a;
}
const json = (a, source) => JSON.parse(a.run(`JSON.stringify(${source})`));

test('PLAYTEST initializes the ground benchmark and draws its contact/player overlay', () => {
  const a = enter(), state = json(a, 'readGameState()');
  assert.equal(state.act, 'playtest');
  assert.equal(state.movementImplemented, true);
  assert.equal(state.player.x, 0);
  assert.equal(state.player.speed, 0);
  assert.deepEqual(state.contact.anchor, {x:0,y:400});
  assert.equal(state.camera.zoom, 1);
  assert.equal(state.camera.x,-480);
  a.rects.length = 0;
  a.run('draw()');
  assert.ok(a.rects.some(r => r[0] === -11 && r[1] === -48 && r[2] === 22 && r[3] === 48));
  assert.match(a.c.document.querySelector('#playtest-status').textContent, /Ground-only/i);
});

test('PLAYTEST input and ticks bypass legacy movement, interactions, water, bosses, and HUD', () => {
  const a = enter(), protectedState = `({p,charge,boost,clock,runFrames,score,stats,cam,camY,zoom})`;
  const before = a.run(`JSON.stringify(${protectedState})`);
  a.run(`for(const name of ['updateMovement','updateWorldPlatforms','updateStageMotion','updateStageWorld','updateWaterState','updateBreathing','activateWorldDevices','collectBoostMonitors','collectWorldRings','updateWorldEnemies','updateWorldCheckpoints','updateBossEncounter','updateEndingScene','updateStageCompletion','updateCamera','drawAct2World'])globalThis[name]=()=>{throw Error('Legacy call: '+name)};
    press('ArrowRight',true);press('ArrowDown',true);press('Space',true);press('ShiftLeft',true);
    for(let i=0;i<30;i++)update();release('Space',true);release('ShiftLeft',true);draw();`);
  assert.equal(a.run(`JSON.stringify(${protectedState})`), before);
  assert.equal(a.run('readGameState().frame'), 30);
  assert.equal(a.run('playtestState.player.ticks'),30);
  assert.ok(a.run('playtestState.player.x')>0);
});

test('PLAYTEST entry does not initialize a legacy level, stage runtime, or encounter', () => {
  const a = enter();
  a.run(`selectAct(2);for(const name of ['configureBoostMonitors','makeLevel','makeLevel2','selectStageRuntime','setupBossEncounter','respawn'])globalThis[name]=()=>{throw Error('Legacy setup: '+name)};
    selectAct('playtest');start()`);
  assert.equal(a.run('level.act'), 'playtest');
  assert.equal(a.run('stageRuntime'), null);
  assert.equal(a.run('boss'), null);
  assert.equal(a.run('ending'), null);
});

test('PLAYTEST pauses, resumes without reset, and resets without stale input', () => {
  const a = enter();
  a.run(`press('ArrowRight',true);for(let i=0;i<12;i++)update();press('KeyP',true);for(let i=0;i<20;i++)update()`);
  assert.equal(a.run('mode'), 'paused');
  assert.equal(a.run('readGameState().frame'), 12);
  assert.equal(a.run('keys.size'), 0);
  a.run(`press('KeyP',true);update()`);
  assert.equal(a.run('mode'), 'playing');
  assert.equal(a.run('readGameState().frame'), 13);
  a.run(`press('ArrowDown',true);press('Space',true);press('KeyR',true)`);
  assert.equal(a.run('readGameState().frame'), 0);
  assert.equal(a.run('keys.size'), 0);
  assert.equal(a.run('charge'), 0);
});

for (const act of [1, 2]) {
  test(`PLAYTEST exits cleanly into Act ${act}, preserving its existing runtime behavior`, () => {
    const a = enter(), baseline = boot(act);
    a.run(`press('ArrowDown',true);press('Space',true);press('ShiftLeft',true);update();selectAct(${act});start()`);
    assert.equal(a.run('playtestState'), null);
    assert.equal(a.run('keys.size'), 0);
    assert.equal(a.run('selectedAct'), act);
    assert.equal(a.run('p.airBoostRequested'), false);
    assert.equal(a.run('charge'), 0);
    assert.equal(a.run('stageRuntime===neonExpressAct1Runtime'), act === 1);
    for (const ctx of [a, baseline]) ctx.run(`press('ArrowRight',true);for(let i=0;i<20;i++)update()`);
    const snapshot = 'JSON.stringify({x:p.x,y:p.y,vx:p.vx,vy:p.vy,rolling:p.rolling,ground:p.ground,boost,clock,stats})';
    assert.equal(a.run(snapshot), baseline.run(snapshot));
    a.run(`press('ShiftLeft',true);selectAct('playtest');start()`);
    assert.equal(a.run('keys.size'), 0);
    assert.equal(a.run('readGameState().frame'), 0);
    assert.equal(a.run('boss'), null);
  });
}

test('frame-stepping PLAYTEST reports its own state without running a legacy controller', () => {
  const a = enter();
  a.run(`stepGameFrames({keys:['down','jump','boost','right'],frames:10})`);
  assert.equal(a.run('readGameState().act'), 'playtest');
  assert.equal(a.run('readGameState().frame'), 10);
  assert.equal(a.run('readGameState().movementImplemented'), true);
  assert.equal(a.run('charge'), 0);
});
