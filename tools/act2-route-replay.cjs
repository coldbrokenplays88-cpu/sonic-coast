// Bounded production-input checks, also run against the extracted player ZIP.
// Each scenario uses one declared initial placement; subsequent travel is input-only.
const assert = require('node:assert/strict');
const { startLoopSource, blimpReplaySource } = require('../Inferno-Ascent-Game/blimp-test-helpers.cjs');
const { aimHighSource } = require('../Inferno-Ascent-Game/route-test-helpers.cjs');

async function act2RouteSmoke(page) {
  const checks = [];
  const run = (source) => page.evaluate((source) => (0, eval)(source), source);
  for (const cautious of [false, true]) {
    const result = await run(`selectAct(2);start();${startLoopSource}${blimpReplaySource}
      startLoop();var replayStart=performance.now();var result=replayBlimps(${cautious});draw();
      ({scenario:'blimps ${cautious ? 'wait' : 'momentum'}',...result,state:readGameState(),ms:performance.now()-replayStart});`);
    assert.equal(result.state.deaths, 0);
    assert.equal(result.life, true);
    assert.equal(result.shield, 'bubble');
    assert.equal(result.thirdVisibleAtJump, cautious);
    assert.ok(result.landings.some((x) => x.id === 'blimp-return-rail'));
    checks.push(result);
  }
  for (const phase of [0, 120]) {
    const result = await run(`selectAct(2);start();${aimHighSource}
      runFrames=${phase};var entry=surfaceById('mid-fallen-building');
      Object.assign(p,{x:level.middleSection.start+600,y:yOn(entry,level.middleSection.start+600)-20,surface:entry,ground:true,vx:8,vy:0});
      boost=0;count=20;keys.clear();press('Space',true);var began=runFrames;var replayStart=performance.now();
      for(var frame=0;frame<1000&&mode==='playing';frame++){
        aimHigh();if(p.surface?.grindable){keys.clear();keys.add('ShiftLeft');keys.add('ArrowRight')}
        update();if(p.surface?.id==='mid-junction')break;
      }
      draw();({scenario:'upper chain phase ${phase}',ticks:runFrames-began,ms:performance.now()-replayStart,surface:p.surface?.id,
        springs:level.springs.filter(d=>d.id.startsWith('mid-')&&d.firedAt!==undefined).map(d=>d.id),state:readGameState()});`);
    assert.equal(result.surface, 'mid-junction');
    assert.equal(result.springs.length, 6);
    assert.equal(result.state.deaths, 0);
    assert.equal(result.state.hits, 0);
    assert.equal(result.state.boost, 0, 'the authored rail remains free at zero meter');
    checks.push(result);
  }
  const lower = await run(`selectAct(2);start();var vent=level.pads.find(d=>d.id==='mid-low-spring');var deck=surfaceById(vent.surfaceId);
    Object.assign(p,{x:vent.x-30,y:yOn(deck,vent.x-30)-20,surface:deck,ground:true,vx:8,vy:0});count=20;boost=0;
    press('ArrowRight',true);press('ArrowDown',true);var enteredPool=false;var began=runFrames;
    for(var frame=0;frame<280&&mode==='playing';frame++){
      update();enteredPool ||= !!p.surface?.poolCurve;
      if(p.poolExit&&!p.ground&&p.act1Motion.lastTakeoff?.reason==='rolled crest')break;
    }
    draw();({scenario:'lower vent and pool',ticks:runFrames-began,enteredPool,panel:p.poolExit,takeoff:p.act1Motion.lastTakeoff,state:readGameState()});`);
  assert.equal(lower.enteredPool, true);
  assert.equal(lower.panel, true);
  assert.equal(lower.state.deaths, 0);
  assert.equal(lower.takeoff.reason, 'rolled crest');
  checks.push(lower);

  // Test real entrance/AI control handoff. The defeat below is an explicit
  // integration fixture, not a claim of an automated or human boss-fight clear.
  const entrance = await run(`selectAct(2);start();var arenaDeck=surfaceById('summit-arena');
    Object.assign(p,{x:level.arena.x+400,y:arenaDeck.y1-20,vx:0,vy:0,ground:true,surface:arenaDeck});update();
    var ownerBefore=p.act1Motion.updates;for(var frame=0;frame<200;frame++)update();
    var frozen=p.act1Motion.updates===ownerBefore;
    for(var frame=0;frame<50;frame++)update();press('ArrowRight',true);var beforeWalk=p.x;
    for(var frame=0;frame<10;frame++)update();release('ArrowRight',true);draw();
    ({scenario:'boss entrance',frozen,resumed:p.x>beforeWalk,state:boss.state});`);
  assert.equal(entrance.frozen, true);
  assert.equal(entrance.resumed, true);
  checks.push(entrance);
  await page.waitForFunction(() => endingArtReady());
  const ending = await run(`boss.state='defeated';update();var ownerBefore=p.act1Motion.updates;var endingBeats=new Set();
    for(var frame=0;frame<1000&&mode==='playing';frame++){update();if(ending)endingBeats.add(ending.beat);if(frame%12===0)draw()}
    draw();({scenario:'ending after defeat fixture',status:mode,beats:[...endingBeats],movementFrozen:p.act1Motion.updates===ownerBefore,ready:endingArtReady()});`);
  assert.equal(ending.status, 'win');
  assert.equal(ending.movementFrozen, true);
  assert.equal(ending.ready, true);
  checks.push(ending);
  return checks;
}
module.exports = { act2RouteSmoke };
