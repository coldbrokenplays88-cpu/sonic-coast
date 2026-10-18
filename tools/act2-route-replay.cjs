// Bounded production-input checks, also run against the extracted player ZIP.
// Each scenario uses one declared initial placement; subsequent travel is input-only.
const assert = require('node:assert/strict');
const { startLoopSource, blimpReplaySource } = require('../Inferno-Ascent-Game/blimp-test-helpers.cjs');
const { aimHighSource } = require('../Inferno-Ascent-Game/route-test-helpers.cjs');

async function act2RouteSmoke(page) {
  const checks = [];
  const run = (source) => page.evaluate((source) => (0, eval)(source), source);
  const tower = await run(`selectAct(2);start();var towerChecks=[];
    for(var direction of [-1,1])for(var rolling of [false,true])for(var speed of [14,24]){
      start();keys.clear();var cap=level.surfaces.find(s=>s.faceId==='under-attack-tower-face-21');
      var edge=direction>0?cap.x2:cap.x1;
      Object.assign(p,{x:edge-direction*2,y:yOn(cap,edge-direction*2)-20,vx:direction*speed,
        vy:0,ground:true,surface:cap,rolling,roll:rolling,inv:9999});
      press(direction>0?'ArrowRight':'ArrowLeft',true);
      var towerBefore=p.act1Motion.updates;
      for(var tick=0;tick<6;tick++)update();draw();
      towerChecks.push({direction,rolling,speed,travel:(p.x-edge)*direction,ticks:p.act1Motion.updates-towerBefore});
    }
    ({scenario:'first tower finite-cap exits',cases:towerChecks});`);
  assert.equal(tower.cases.length, 8);
  for (const result of tower.cases) {
    assert.ok(result.travel > 60, 'running off the tower must keep advancing');
    assert.equal(result.ticks, 6, 'tower exits must consume every tick without freezing');
  }
  checks.push(tower);
  const flat = await run(`selectAct(2);start();var flatChecks=[];
    for(var speed of [8,14,24])for(var rolling of [false,true]){
      var ramp=surfaceById('split-skyline-act2-190');keys.clear();
      Object.assign(p,{x:ramp.x2-50,y:yOn(ramp,ramp.x2-50)-20,vx:speed,vy:0,
        ground:true,surface:ramp,rolling,roll:rolling,inv:9999});press('ArrowRight',true);
      for(var tick=0;tick<12;tick++)update();draw();
      flatChecks.push({speed,rolling,surface:p.surface?.id,ground:p.ground});
    }({scenario:'Split Skyline ramp to flat',cases:flatChecks});`);
  for (const result of flat.cases) {
    assert.equal(result.surface, 'split-skyline-act2-205');
    assert.equal(result.ground, true);
  }
  checks.push(flat);
  const interior = await run(`selectAct(2);start();keys.clear();
    level.hazards.find(h=>h.id==='secret-facade-wall').broken=true;
    var rail=surfaceById('secret-rail-down');boost=0;
    Object.assign(p,{x:rail.x1+4,y:yOn(rail,rail.x1+4)-20,vx:0,vy:0,ground:true,
      surface:rail,rolling:false,roll:false,inv:9999});
    press('ArrowRight',true);press('ShiftLeft',true);var began=runFrames;
    for(var tick=0;tick<200;tick++){update();if(p.x>=surfaceById('secret-rail-merge').x2)break}
    draw();({scenario:'interior rail at zero meter',ticks:runFrames-began,
      exited:p.x>=surfaceById('secret-rail-merge').x2,meter:boost});`);
  assert.equal(interior.exited, true);
  assert.equal(interior.meter, 0);
  checks.push(interior);
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
      Object.assign(p,{x:level.middleSection.start+700,y:yOn(entry,level.middleSection.start+700)-20,surface:entry,ground:true,vx:6,vy:0,rolling:false,roll:false});
      boost=0;count=20;keys.clear();press('ArrowRight',true);press('Space',true);var began=runFrames;var replayStart=performance.now();
      for(var frame=0;frame<1000&&mode==='playing';frame++){
        if(level.springs.find(d=>d.id==='mid-upper-spring').firedAt!==undefined)aimHigh();
        if(p.surface?.grindable){keys.clear();keys.add('ShiftLeft');keys.add('ArrowRight')}
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
    press('ArrowRight',true);press('ArrowDown',true);var enteredPool=false,jumpedFromPool=false,roofReached=false;var began=runFrames;
    for(var frame=0;frame<400&&mode==='playing';frame++){
      if(!jumpedFromPool&&p.surface?.poolCurve&&p.x>level.middleSection.start+2050){
        release('ArrowDown',true);press('Space',true);jumpedFromPool=true;
      }
      update();enteredPool ||= !!p.surface?.poolCurve;
      roofReached ||= p.surface?.id==='mid-tilted-glass-roof';if(p.surface?.id==='mid-pool-roof-exit')break;
    }
    draw();({scenario:'lower vent and pool without pad',ticks:runFrames-began,enteredPool,jumpedFromPool,roofReached,exitSurface:p.surface?.id,panel:p.poolExit,state:readGameState()});`);
  assert.equal(lower.enteredPool, true);
  assert.equal(lower.jumpedFromPool, true);
  assert.equal(lower.roofReached, true);
  assert.equal(lower.exitSurface, 'mid-pool-roof-exit');
  assert.equal(lower.panel, false);
  assert.equal(lower.state.deaths, 0);
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
