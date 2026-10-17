(() => {
  var __defProp = Object.defineProperty;
  var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
  var __export = (target, all) => {
    for (var name in all)
      __defProp(target, name, { get: all[name], enumerable: true });
  };

  // src/state.js
  var state = {
    cityRasterContext: void 0,
    cityPillarPass: void 0,
    boss: void 0,
    bossCheckpoint: void 0,
    ending: void 0,
    stageRuntime: void 0,
    testControlled: void 0,
    selectedAct: void 0,
    level: void 0,
    END: void 0,
    mode: void 0,
    cam: void 0,
    camY: void 0,
    zoom: void 0,
    clock: void 0,
    lives: void 0,
    count: void 0,
    score: void 0,
    charge: void 0,
    checkpoint: void 0,
    toastTime: void 0,
    sound: void 0,
    particles: void 0,
    rings: void 0,
    enemies: void 0,
    last: void 0,
    acc: void 0,
    step: void 0,
    boost: void 0,
    shake: void 0,
    anim: void 0,
    jumpBuffer: void 0,
    coyote: void 0,
    stage: void 0,
    runFrames: void 0,
    stats: void 0,
    visited: void 0
  };

  // src/level.js
  var level_exports = {};
  __export(level_exports, {
    getRuntimeBindings: () => getRuntimeBindings,
    initializeRuntimeModule: () => initializeRuntimeModule,
    makeLevel: () => makeLevel
  });
  function makeLevel() {
    const surfaces = [], hazards = [], enemies = [], pads = [], rings = [], signs = [], checkpoints = [], sectors = [];
    let serial = 0;
    function rail(x1, x2, y1 = 420, y2 = y1, kind = "main", extra = {}) {
      const s = { id: "rail-" + serial++, x1, x2, y1, y2, kind, ...extra };
      surfaces.push(s);
      return s;
    }
    __name(rail, "rail");
    function line(x1, x2, y, kind = "main", extra = {}) {
      return rail(x1, x2, y, y, kind, extra);
    }
    __name(line, "line");
    function ringLine(x1, x2, y, spacing = 65) {
      for (let x = x1; x < x2; x += spacing) rings.push({ x, y, taken: false });
    }
    __name(ringLine, "ringLine");
    function arc(x1, x2, y, height = 105) {
      for (let i = 0; i <= 7; i++)
        rings.push({
          x: x1 + (x2 - x1) * i / 7,
          y: y - 35 - Math.sin(i * Math.PI / 7) * height,
          taken: false
        });
    }
    __name(arc, "arc");
    function label(x, y, text, type = "jump") {
      signs.push({ x, y, text, type });
    }
    __name(label, "label");
    function spikes(x, y, w = 90) {
      hazards.push({ id: "spike-" + serial++, type: "spikes", x: x - w / 2, y: y - 25, w, h: 25 });
      label(x - 600, y - 85, "JUMP", "jump");
    }
    __name(spikes, "spikes");
    function gate(x1, x2, y) {
      hazards.push({
        id: "gate-" + serial++,
        type: "gate",
        x: x1,
        y: y - 210,
        w: x2 - x1,
        h: 170,
        // Approved Act 1 migration: 40-unit tunnel clears the 38-unit roll.
        floor: y
      });
      label(x1 - 650, y - 76, "ROLL  \u2193", "roll");
    }
    __name(gate, "gate");
    function crab(x, y, extra = {}) {
      enemies.push({
        id: "bot-" + serial++,
        kind: "crab",
        base: x,
        x,
        y,
        baseY: y,
        range: 18,
        ...extra
      });
    }
    __name(crab, "crab");
    function drone(x, y, extra = {}) {
      enemies.push({
        id: "bot-" + serial++,
        kind: "drone",
        base: x,
        x,
        y,
        baseY: y,
        range: 26,
        ...extra
      });
    }
    __name(drone, "drone");
    function boostPad(x, y) {
      pads.push({ x, y });
    }
    __name(boostPad, "boostPad");
    function recovery(a, b, y = 550) {
      return line(a, b, y, "recovery");
    }
    __name(recovery, "recovery");
    function upper(a, b, y, extra = {}) {
      return line(a, b, y, "express", extra);
    }
    __name(upper, "upper");
    function sector(x, name, hint) {
      sectors.push({ x, name, hint });
      checkpoints.push({ x: x + 100, y: 420, name });
      label(x + 260, 340, name, "sector");
    }
    __name(sector, "sector");
    sector(0, "01 / SWITCHBACK", "Build speed. Jump the spikes, then roll through the pink tunnel.");
    line(0, 2500);
    rail(2500, 2750, 420, 355);
    line(3100, 4400);
    spikes(900, 420, 86);
    gate(2250, 2470, 420);
    upper(3e3, 3800, 230, { routeType: "skill" });
    rail(3800, 4140, 230, 420, "express", { routeType: "skill" });
    recovery(2810, 3180, 550);
    rail(3180, 3530, 550, 420, "recovery");
    label(2530, 280, "HOLD JUMP / HIGH ROAD", "express");
    arc(2710, 3220, 355, 90);
    ringLine(350, 680, 378);
    ringLine(1250, 1850, 378, 90);
    ringLine(3110, 3720, 188, 72);
    crab(3890, 402);
    sector(
      4400,
      "02 / BROKEN BEAT",
      "Hold Jump to take the high road. Short hops keep you on the amber bridge."
    );
    line(4400, 5400);
    rail(5400, 5650, 420, 360);
    line(5990, 6290, 390, "crumble");
    line(6620, 8800);
    spikes(4950, 420, 86);
    upper(6e3, 7050, 220, { routeType: "skill" });
    rail(7050, 7450, 220, 420, "express", { routeType: "skill" });
    recovery(5710, 6040, 550);
    recovery(6350, 6720, 550);
    rail(6720, 7070, 550, 420, "recovery");
    label(5470, 280, "CHOOSE YOUR JUMP", "express");
    arc(5610, 6080, 360, 80);
    arc(6250, 6700, 390, 85);
    gate(7600, 7830, 420);
    spikes(8500, 420, 86);
    ringLine(4570, 4790, 378);
    ringLine(6090, 6890, 178, 80);
    ringLine(6870, 7230, 378);
    ringLine(7980, 8270, 378);
    sector(
      8800,
      "03 / LONG SHOT",
      "Save boost for the launch. Gold express rails give you room to enjoy your speed."
    );
    line(8800, 1e4);
    rail(1e4, 10250, 420, 345);
    line(10600, 11350);
    line(11700, 11950, 400, "crumble");
    line(12300, 14500);
    spikes(9350, 420, 86);
    upper(11e3, 13700, 205, { routeType: "boost", entrySpeed: 20 });
    rail(13700, 14250, 205, 420, "express", { routeType: "boost" });
    recovery(10300, 10670, 545);
    rail(10670, 11020, 545, 420, "recovery");
    recovery(11400, 11760, 550);
    recovery(12e3, 12380, 550);
    rail(12380, 12800, 550, 420, "recovery");
    label(9750, 280, "SAVE BOOST / LONG SHOT", "express");
    label(10940, 155, "BOOST EXPRESS", "express");
    arc(10220, 11200, 345, 155);
    label(10950, 345, "NORMAL ROAD / TWO JUMPS", "jump");
    arc(11310, 11780, 420, 90);
    arc(11900, 12450, 400, 95);
    gate(13400, 13620, 420);
    crab(15150, 402);
    ringLine(8930, 9190, 378);
    ringLine(9610, 9940, 378);
    ringLine(11120, 13570, 163, 180);
    ringLine(12500, 12700, 378);
    sector(
      14500,
      "04 / ROBOT RELAY",
      "Jump onto the marked drone. Hold Jump on impact to rebound onto the skill route."
    );
    line(14500, 15500);
    rail(15500, 15750, 420, 360);
    line(16100, 16400, 410, "crumble");
    line(16740, 17580);
    line(17880, 18100, 390, "crumble");
    line(18420, 19200);
    upper(16400, 17400, 205, { routeType: "skill" });
    rail(17400, 18420, 205, 420, "express", { routeType: "skill" });
    recovery(15810, 16190, 550);
    recovery(16460, 16820, 550);
    rail(16820, 17180, 550, 420, "recovery");
    recovery(17640, 17990, 550);
    recovery(18160, 18520, 550);
    rail(18520, 18820, 550, 420, "recovery");
    drone(16330, 290, { bounceRoute: true, range: 12 });
    crab(17100, 402);
    label(15400, 290, "ENEMY REBOUND / HIGH ROAD", "express");
    arc(15710, 16200, 360, 95);
    arc(17540, 18e3, 420, 85);
    ringLine(14800, 15280, 378);
    ringLine(16520, 17300, 163, 80);
    ringLine(16830, 17e3, 378);
    ringLine(18560, 18730, 378);
    sector(
      19200,
      "05 / SHIFTING SKY",
      "Roll, then release. Jump across the green rails; missed landings have a lower way back."
    );
    line(19200, 20400);
    rail(20400, 20650, 420, 355);
    line(22200, 22800);
    gate(19600, 19800, 420);
    line(20800, 21240, 390, "moving", { motion: { axis: "y", amp: 18, period: 220, phase: 0.3 } });
    line(21500, 21920, 390, "moving", { motion: { axis: "x", amp: 35, period: 240, phase: 1.1 } });
    upper(21100, 21900, 245, { routeType: "skill" });
    rail(21900, 22520, 245, 420, "express", { routeType: "skill" });
    recovery(20700, 21290, 560);
    recovery(21300, 21970, 560);
    rail(21970, 22400, 560, 420, "recovery");
    label(20350, 280, "JUMP / MOVING RAILS", "jump");
    arc(20610, 21090, 355, 85);
    arc(21200, 21620, 390, 90);
    ringLine(19350, 19530, 378);
    ringLine(19900, 20280, 378);
    ringLine(21320, 21820, 203, 75);
    ringLine(22450, 22680, 378);
    sector(
      22800,
      "06 / FINAL TRANSFER",
      "Choose the normal bridge or spend saved boost for the final express run."
    );
    line(22800, 23800);
    rail(23800, 24100, 420, 350);
    line(24450, 25e3);
    line(25300, 25600, 395, "crumble");
    line(25930, 27180);
    line(27500, 27820, 390, "crumble");
    line(28150, 29400);
    gate(23350, 23580, 420);
    upper(24980, 28e3, 205, { routeType: "boost", entrySpeed: 20 });
    rail(28e3, 28600, 205, 420, "express", { routeType: "boost" });
    recovery(24150, 24520, 550);
    rail(24520, 24870, 550, 420, "recovery");
    recovery(25060, 25380, 550);
    recovery(25660, 26010, 550);
    rail(26010, 26400, 550, 420, "recovery");
    recovery(27240, 27570, 550);
    recovery(27880, 28240, 550);
    rail(28240, 28600, 550, 420, "recovery");
    label(23580, 280, "FINAL LAUNCH / SAVE BOOST", "express");
    arc(24060, 25080, 350, 155);
    label(24800, 325, "NORMAL BRIDGE", "jump");
    arc(24960, 25410, 420, 85);
    arc(25560, 26050, 395, 90);
    arc(27140, 27600, 420, 90);
    ringLine(23e3, 23160, 378);
    ringLine(23500, 23700, 378);
    ringLine(25120, 27800, 163, 170);
    ringLine(26150, 26650, 378, 90);
    ringLine(28720, 29e3, 378);
    for (const s of surfaces)
      if (s.kind === "crumble") {
        s.crumbleDelay = 42;
        s.crumbleTimer = -1;
        s.restoreAt = 0;
      }
    return { end: 29e3, surfaces, hazards, enemies, pads, rings, signs, checkpoints, sectors };
  }
  __name(makeLevel, "makeLevel");
  function initializeRuntimeModule() {
  }
  __name(initializeRuntimeModule, "initializeRuntimeModule");
  function getRuntimeBindings() {
    return {
      makeLevel: {
        get: /* @__PURE__ */ __name(() => makeLevel, "get"),
        set: /* @__PURE__ */ __name((value) => {
          makeLevel = value;
        }, "set")
      }
    };
  }
  __name(getRuntimeBindings, "getRuntimeBindings");

  // src/midsection.js
  var midsection_exports = {};
  __export(midsection_exports, {
    addMiddleSection: () => addMiddleSection,
    beginWrongRouteDrop: () => beginWrongRouteDrop,
    drawMiddleSection: () => drawMiddleSection,
    getRuntimeBindings: () => getRuntimeBindings34,
    initializeRuntimeModule: () => initializeRuntimeModule34,
    updateMiddleMotion: () => updateMiddleMotion,
    updateMiddleSection: () => updateMiddleSection
  });

  // src/act2.js
  var act2_exports = {};
  __export(act2_exports, {
    beginLoop: () => beginLoop,
    cameraTracking: () => cameraTracking,
    cityFlame: () => cityFlame,
    citySmoke: () => citySmoke,
    drawAct2Background: () => drawAct2Background,
    drawAct2Bulkhead: () => drawAct2Bulkhead,
    drawAct2Structures: () => drawAct2Structures,
    drawAct2Supports: () => drawAct2Supports,
    drawAct2World: () => drawAct2World,
    drawClimbCue: () => drawClimbCue,
    drawGrindRail: () => drawGrindRail,
    drawSkylineSmoke: () => drawSkylineSmoke,
    getRuntimeBindings: () => getRuntimeBindings33,
    initializeRuntimeModule: () => initializeRuntimeModule33,
    launchAirDevice: () => launchAirDevice,
    predictLanding: () => predictLanding,
    resetAct2: () => resetAct2,
    resetCameraTracking: () => resetCameraTracking,
    selectAct: () => selectAct,
    skylineSmokeSprites: () => skylineSmokeSprites,
    updateAct2: () => updateAct2,
    updateCamera: () => updateCamera,
    updateLoop: () => updateLoop
  });

  // src/playtest.js
  var playtest_exports = {};
  __export(playtest_exports, {
    clearPlaytestInput: () => clearPlaytestInput,
    drawGroundPlayer: () => drawGroundPlayer,
    drawPlaytest: () => drawPlaytest,
    exitPlaytest: () => exitPlaytest,
    framePlaytest: () => framePlaytest,
    getRuntimeBindings: () => getRuntimeBindings32,
    handlePlaytestInput: () => handlePlaytestInput,
    initializeRuntimeModule: () => initializeRuntimeModule32,
    isPlaytest: () => isPlaytest,
    playtestState: () => playtestState,
    readPlaytestState: () => readPlaytestState,
    resetPlaytest: () => resetPlaytest,
    setupPlaytest: () => setupPlaytest,
    updatePlaytest: () => updatePlaytest,
    updatePlaytestHud: () => updatePlaytestHud
  });

  // src/playtest-rails.js
  var playtest_rails_exports = {};
  __export(playtest_rails_exports, {
    createExperimentalRail: () => createExperimentalRail,
    experimentalRailImpact: () => experimentalRailImpact,
    experimentalRailTuning: () => experimentalRailTuning,
    getRuntimeBindings: () => getRuntimeBindings4,
    initializeRuntimeModule: () => initializeRuntimeModule4,
    multiplyRailPolynomial: () => multiplyRailPolynomial,
    sampleExperimentalRail: () => sampleExperimentalRail
  });

  // src/playtest-ground.js
  var playtest_ground_exports = {};
  __export(playtest_ground_exports, {
    advanceGroundSubstep: () => advanceGroundSubstep,
    beginGroundTick: () => beginGroundTick,
    createGroundPlayer: () => createGroundPlayer,
    finishGroundTick: () => finishGroundTick,
    getRuntimeBindings: () => getRuntimeBindings2,
    groundBounds: () => groundBounds,
    groundContact: () => groundContact,
    groundEnergy: () => groundEnergy,
    groundResist: () => groundResist,
    groundTuning: () => groundTuning,
    initializeRuntimeModule: () => initializeRuntimeModule2,
    sampleGround: () => sampleGround,
    stepGroundPlayer: () => stepGroundPlayer
  });
  var groundTuning;
  function sampleGround(scenario, x) {
    if (scenario === "flat")
      return { x, y: 400, angle: 0, tx: 1, ty: 0, nx: 0, ny: -1, curvature: 0 };
    if (scenario !== "valley") throw Error("Unknown PLAYTEST ground scenario");
    const u = Math.max(0, Math.abs(x) - 200), t = Math.min(1, u / 800), grade = 0.65;
    const height = u < 800 ? grade * 800 * (t ** 3 - 0.5 * t ** 4) : grade * (u - 400);
    const slope = -Math.sign(x) * grade * (3 * t * t - 2 * t ** 3);
    const second = u < 800 ? -grade * 6 * t * (1 - t) / 800 : 0;
    const norm = Math.hypot(1, slope);
    return {
      x,
      y: 650 - height,
      angle: Math.atan(slope),
      tx: 1 / norm,
      ty: slope / norm,
      nx: slope / norm,
      ny: -1 / norm,
      curvature: second / norm ** 3
    };
  }
  __name(sampleGround, "sampleGround");
  function groundBounds(scenario) {
    if (scenario === "flat") return 5e3;
    if (scenario === "valley") return 2400;
    throw Error("Unknown PLAYTEST ground scenario");
  }
  __name(groundBounds, "groundBounds");
  function createGroundPlayer(scenario = "flat", x = 0, speed = 0, posture = "standing") {
    groundBounds(scenario);
    return {
      scenario,
      x,
      speed,
      posture,
      facing: Math.sign(speed) || 1,
      ticks: 0,
      restTicks: 0,
      downHeld: false,
      distance: 0,
      boundary: null
    };
  }
  __name(createGroundPlayer, "createGroundPlayer");
  function groundContact(player, sampler = sampleGround) {
    const surface = sampler(player.scenario, player.x);
    const height = player.posture === "rolling" ? groundTuning.rollDiameter : groundTuning.standHeight;
    return {
      ...surface,
      speed: player.speed,
      vx: player.speed * surface.tx,
      vy: player.speed * surface.ty,
      anchor: { x: surface.x, y: surface.y },
      height,
      width: player.posture === "rolling" ? height : groundTuning.standWidth,
      center: { x: surface.x + surface.nx * height / 2, y: surface.y + surface.ny * height / 2 },
      normalReaction: -groundTuning.gravity * surface.ny - player.speed ** 2 * surface.curvature
    };
  }
  __name(groundContact, "groundContact");
  function groundEnergy(player, sampler = sampleGround) {
    return player.speed ** 2 / 2 + groundTuning.gravity * (650 - sampler(player.scenario, player.x).y);
  }
  __name(groundEnergy, "groundEnergy");
  function groundResist(speed, amount) {
    return Math.sign(speed) * Math.max(0, Math.abs(speed) - amount);
  }
  __name(groundResist, "groundResist");
  function beginGroundTick(player, input = {}, allowRoll = true) {
    const t = groundTuning, direction = Math.sign(input.direction || 0), down = !!input.down;
    if (down && !player.downHeld && Math.abs(player.speed) >= t.rollEntrySpeed && allowRoll) {
      player.posture = "rolling";
      player.restTicks = 0;
    }
    player.downHeld = down;
    const rolling = player.posture === "rolling";
    const braking = direction * player.speed < 0;
    return { direction, rolling, braking };
  }
  __name(beginGroundTick, "beginGroundTick");
  function advanceGroundSubstep(player, controls, dt, sampler = sampleGround, arcLength = false) {
    const t = controls.physics || groundTuning, { direction, rolling, braking } = controls;
    const position = arcLength ? player.pathS : player.x;
    const before = sampler(player.scenario, position);
    const rollBrake = direction * player.speed < 0 ? t.rollBrake * (1 - Math.abs(before.ty)) * Math.min(1, Math.abs(player.speed) / t.rollBrakeFadeSpeed) : 0;
    const resistance = controls.boost ? rolling ? t.rollResistance : 0 : rolling ? t.rollResistance + rollBrake : (direction ? 0 : t.coastResistance) + (braking ? t.brake : 0);
    const drive = controls.boost ? controls.boost.facing * Math.max(0, controls.boost.speed - player.speed * controls.boost.facing) * (1 - (1 - controls.boost.response) ** dt) / dt : !rolling && direction && !braking ? direction * Math.min(t.acceleration, Math.max(0, t.runRange - player.speed * direction) / dt) : 0;
    const midpointX = position + player.speed * (arcLength ? 1 : before.tx) * dt / 2;
    const midpoint = sampler(player.scenario, midpointX);
    const slopeFactor = rolling && player.speed * midpoint.ty > 0 ? t.rollDownhillMultiplier : 1;
    const nextSpeed = groundResist(
      player.speed + (t.gravity * midpoint.ty * slopeFactor + drive) * dt,
      resistance * dt
    );
    if (arcLength) player.pathS += (player.speed + nextSpeed) * 0.5 * dt;
    else player.x += (player.speed + nextSpeed) * 0.5 * midpoint.tx * dt;
    player.distance += Math.abs((player.speed + nextSpeed) * 0.5 * dt);
    player.speed = nextSpeed;
  }
  __name(advanceGroundSubstep, "advanceGroundSubstep");
  function finishGroundTick(player, controls, sampler = sampleGround, canStand2 = true, bounds = groundBounds, arcLength = false) {
    const t = groundTuning, { rolling } = controls;
    player.ticks++;
    if (Math.abs(player.speed) > 0.02) player.facing = Math.sign(player.speed);
    const slopeForce = Math.abs(
      t.gravity * sampler(player.scenario, arcLength ? player.pathS : player.x).ty
    );
    const turning = controls.direction * player.facing < 0 && Math.abs(player.speed) <= t.rollTurnSpeed;
    if (rolling && turning && slopeForce <= t.rollResistance && canStand2) {
      player.posture = "standing";
      player.restTicks = 0;
    } else if (rolling && Math.abs(player.speed) < t.restSpeed && slopeForce <= t.rollResistance) {
      player.restTicks++;
      if (player.restTicks >= t.uncurlTicks && canStand2) {
        player.posture = "standing";
        player.restTicks = 0;
      }
    } else player.restTicks = 0;
    if (!Number.isFinite(player.x) || !Number.isFinite(player.speed) || Math.abs(player.speed) > t.safetySpeed)
      player.boundary = "numerical safety reset (outside benchmark range)";
    else if (Math.abs(player.x) > bounds(player.scenario)) player.boundary = "test boundary reset";
  }
  __name(finishGroundTick, "finishGroundTick");
  function stepGroundPlayer(player, input = {}) {
    const controls = beginGroundTick(player, input);
    for (let i = 0; i < groundTuning.substeps; i++)
      advanceGroundSubstep(player, controls, 1 / groundTuning.substeps);
    finishGroundTick(player, controls);
  }
  __name(stepGroundPlayer, "stepGroundPlayer");
  function initializeRuntimeModule2() {
    groundTuning = Object.freeze({
      revision: "GROUND-5",
      hz: 60,
      substeps: 4,
      runRange: 14,
      acceleration: 0.16,
      brake: 0.5,
      coastResistance: 0.1,
      gravity: 0.35,
      rollResistance: 0.025,
      rollDownhillMultiplier: 2.5,
      rollBrake: 0.18,
      rollBrakeFadeSpeed: 2,
      rollTurnSpeed: 1,
      rollEntrySpeed: 2,
      restSpeed: 0.08,
      uncurlTicks: 12,
      safetySpeed: 80,
      standHeight: 48,
      standWidth: 22,
      rollDiameter: 38
    });
  }
  __name(initializeRuntimeModule2, "initializeRuntimeModule");
  function getRuntimeBindings2() {
    return {};
  }
  __name(getRuntimeBindings2, "getRuntimeBindings");

  // src/playtest-path.js
  var playtest_path_exports = {};
  __export(playtest_path_exports, {
    getRuntimeBindings: () => getRuntimeBindings3,
    initializeRuntimeModule: () => initializeRuntimeModule3,
    makePath: () => makePath,
    pathArcCaps: () => pathArcCaps,
    pathArcDistance: () => pathArcDistance,
    pathArcFaceDistance: () => pathArcFaceDistance,
    pathArcImpact: () => pathArcImpact,
    pathBody: () => pathBody,
    pathCorners: () => pathCorners,
    pathDistances: () => pathDistances,
    pathLineDistance: () => pathLineDistance,
    pathPolynomialRoots: () => pathPolynomialRoots,
    playtestPaths: () => playtestPaths,
    samplePath: () => samplePath,
    syncPathPlayer: () => syncPathPlayer
  });
  var playtestPaths;
  function makePath(id, radius, chamber = false) {
    const pieces = [];
    let length = 0;
    const add = /* @__PURE__ */ __name((p2) => {
      p2.start = length;
      length += p2.length;
      p2.end = length;
      p2.id = id + "-" + pieces.length;
      pieces.push(p2);
    }, "add");
    const line = /* @__PURE__ */ __name((x, y, x2, y2) => {
      const d = Math.hypot(x2 - x, y2 - y);
      add({ kind: "line", x, y, tx: (x2 - x) / d, ty: (y2 - y) / d, length: d });
    }, "line");
    const arc = /* @__PURE__ */ __name((cx, cy, a, b) => add({ kind: "arc", cx, cy, r: radius, a, b, length: radius * (b - a) }), "arc");
    const floor = chamber ? 440 : 600;
    line(-1e3, floor, 0, floor);
    const entry = length;
    let ceiling = null;
    if (!chamber) arc(0, floor - radius, 0, Math.PI * 2);
    else {
      arc(0, floor - radius, 0, Math.PI / 2);
      line(radius, floor - radius, radius, 260);
      arc(0, 260, Math.PI / 2, Math.PI);
      line(0, 260 - radius, -360, 260 - radius);
      ceiling = length - 180;
      arc(-360, 260, Math.PI, Math.PI * 1.5);
      line(-360 - radius, 260, -360 - radius, floor - radius);
      arc(-360, floor - radius, Math.PI * 1.5, Math.PI * 2);
    }
    const exit = length;
    line(chamber ? -360 : 0, floor, 1e3, floor);
    return { id, pieces, length, entry, exit, ceiling, thickness: 12 };
  }
  __name(makePath, "makePath");
  function samplePath(path, distance) {
    const s = Math.max(0, Math.min(path.length, distance));
    const p2 = path.pieces.find((p3) => s < p3.end - 1e-9) || path.pieces.at(-1), u = s - p2.start;
    let x, y, tx, ty, curvature = 0;
    if (p2.kind === "line") {
      x = p2.x + u * p2.tx;
      y = p2.y + u * p2.ty;
      tx = p2.tx;
      ty = p2.ty;
    } else {
      const angle = p2.a + u / p2.r;
      x = p2.cx + p2.r * Math.sin(angle);
      y = p2.cy + p2.r * Math.cos(angle);
      tx = Math.cos(angle);
      ty = -Math.sin(angle);
      curvature = -1 / p2.r;
    }
    return {
      x,
      y,
      tx,
      ty,
      nx: ty,
      ny: -tx,
      angle: Math.atan2(ty, tx),
      curvature,
      id: p2.id,
      pathS: s,
      piece: p2
    };
  }
  __name(samplePath, "samplePath");
  function pathCorners(body) {
    const c = Math.cos(body.angle), s = Math.sin(body.angle), out = [];
    for (const x of [-body.hw, body.hw])
      for (const y of [-body.hh, body.hh])
        out.push({ x: body.x + c * x - s * y, y: body.y + s * x + c * y });
    return out;
  }
  __name(pathCorners, "pathCorners");
  function pathLineDistance(body, p2, path) {
    const nx = p2.ty, ny = -p2.tx, dx = body.x - p2.x, dy = body.y - p2.y;
    const u = dx * p2.tx + dy * p2.ty, v = dx * nx + dy * ny;
    let distance, normalX, normalY, front = false;
    if (body.circle) {
      const cu = Math.max(0, Math.min(p2.length, u)), cv = Math.max(-path.thickness, Math.min(0, v));
      const du = u - cu, dv = v - cv, d = Math.hypot(du, dv);
      if (d > 1e-10) {
        distance = d - body.hw;
        normalX = (du * p2.tx + dv * nx) / d;
        normalY = (du * p2.ty + dv * ny) / d;
        front = cv === 0 && v >= 0;
      } else {
        const faces = [
          { d: -v, x: nx, y: ny, front: true },
          { d: v + path.thickness, x: -nx, y: -ny },
          { d: u, x: -p2.tx, y: -p2.ty },
          { d: p2.length - u, x: p2.tx, y: p2.ty }
        ].sort((a, b) => a.d - b.d);
        distance = -faces[0].d - body.hw;
        normalX = faces[0].x;
        normalY = faces[0].y;
        front = !!faces[0].front;
      }
    } else {
      const c = Math.cos(body.angle), s = Math.sin(body.angle), cx = p2.x + p2.tx * p2.length / 2 - nx * path.thickness / 2, cy = p2.y + p2.ty * p2.length / 2 - ny * path.thickness / 2;
      distance = -Infinity;
      for (const [ax, ay] of [
        [1, 0],
        [0, 1],
        [c, s],
        [-s, c],
        [p2.tx, p2.ty],
        [nx, ny]
      ]) {
        const offset = (body.x - cx) * ax + (body.y - cy) * ay;
        const extent = body.hw * Math.abs(c * ax + s * ay) + body.hh * Math.abs(-s * ax + c * ay) + p2.length / 2 * Math.abs(p2.tx * ax + p2.ty * ay) + path.thickness / 2 * Math.abs(nx * ax + ny * ay);
        const gap = Math.abs(offset) - extent;
        if (gap > distance) {
          distance = gap;
          normalX = Math.sign(offset) * ax;
          normalY = Math.sign(offset) * ay;
        }
      }
      front = normalX * nx + normalY * ny > 0.999;
    }
    const surface = samplePath(path, p2.start + Math.max(0, Math.min(p2.length, u)));
    return {
      distance,
      nx: normalX,
      ny: normalY,
      curvature: 0.04,
      kind: "floor",
      canLand: front,
      surface,
      id: p2.id,
      convex: true
    };
  }
  __name(pathLineDistance, "pathLineDistance");
  function pathArcFaceDistance(body, p2, path) {
    const dx = body.x - p2.cx, dy = body.y - p2.cy;
    const inside = Math.hypot(dx, dy) < p2.r + path.thickness / 2;
    let point, extent;
    if (body.circle) {
      point = { x: body.x, y: body.y };
      extent = body.hw;
    } else if (inside) {
      point = pathCorners(body).sort(
        (a, b) => Math.hypot(b.x - p2.cx, b.y - p2.cy) - Math.hypot(a.x - p2.cx, a.y - p2.cy)
      )[0];
      extent = 0;
    } else {
      const c = Math.cos(body.angle), s = Math.sin(body.angle), u = (p2.cx - body.x) * c + (p2.cy - body.y) * s, v = -(p2.cx - body.x) * s + (p2.cy - body.y) * c;
      const x = Math.max(-body.hw, Math.min(body.hw, u)), y = Math.max(-body.hh, Math.min(body.hh, v));
      point = { x: body.x + c * x - s * y, y: body.y + s * x + c * y };
      extent = 0;
    }
    let angle = Math.atan2(point.x - p2.cx, point.y - p2.cy);
    while (angle < p2.a - 1e-9) angle += Math.PI * 2;
    if (angle > p2.b + 1e-9) return null;
    angle = Math.max(p2.a, Math.min(p2.b, angle));
    const radial = Math.hypot(point.x - p2.cx, point.y - p2.cy), rx = Math.sin(angle), ry = Math.cos(angle);
    const surface = samplePath(path, p2.start + (angle - p2.a) * p2.r);
    return {
      distance: (inside ? p2.r - radial : radial - p2.r - path.thickness) - extent,
      nx: inside ? -rx : rx,
      ny: inside ? -ry : ry,
      curvature: 0.04,
      kind: "floor",
      canLand: inside,
      surface,
      id: p2.id,
      convex: !inside
    };
  }
  __name(pathArcFaceDistance, "pathArcFaceDistance");
  function pathArcDistance(body, p2, path) {
    const candidates = [];
    const face = pathArcFaceDistance(body, p2, path);
    if (face) candidates.push(face);
    if (p2.b - p2.a < Math.PI * 2 - 1e-8)
      for (const angle of [p2.a, p2.b]) {
        const rx = Math.sin(angle), ry = Math.cos(angle);
        const cap = {
          kind: "line",
          x: p2.cx + p2.r * rx,
          y: p2.cy + p2.r * ry,
          tx: rx,
          ty: ry,
          length: path.thickness,
          start: p2.start,
          id: p2.id
        };
        const q2 = pathLineDistance(body, cap, { ...path, thickness: 0 });
        candidates.push({ ...q2, canLand: false, kind: "box", convex: false });
      }
    if (!candidates.length) return null;
    const q = candidates.sort((a, b) => a.distance - b.distance)[0];
    return { ...q, curvature: 0.08, far: q.distance > 2 };
  }
  __name(pathArcDistance, "pathArcDistance");
  function pathDistances(path, body, nearS = null) {
    const results = [];
    for (const original of path.pieces) {
      let p2 = original;
      if (nearS != null) {
        const reach = body.hw + body.hh + path.thickness + 2;
        const lo = Math.max(p2.start, nearS - reach), hi = Math.min(p2.end, nearS + reach);
        if (lo >= hi) continue;
        if (p2.kind === "arc")
          p2 = {
            ...p2,
            start: lo,
            end: hi,
            length: hi - lo,
            a: p2.a + (lo - p2.start) / p2.r,
            b: p2.a + (hi - p2.start) / p2.r
          };
        else
          p2 = {
            ...p2,
            start: lo,
            end: hi,
            length: hi - lo,
            x: p2.x + (lo - p2.start) * p2.tx,
            y: p2.y + (lo - p2.start) * p2.ty
          };
      }
      const q = p2.kind === "line" ? pathLineDistance(body, p2, path) : pathArcDistance(body, p2, path);
      if (q) results.push(q);
    }
    return results;
  }
  __name(pathDistances, "pathDistances");
  function pathBody(player, posture = player.posture) {
    const path = playtestPaths[player.scenario], s = samplePath(path, player.pathS), height = posture === "rolling" ? 38 : 48;
    const body = {
      x: s.x + s.nx * height / 2,
      y: s.y + s.ny * height / 2,
      hw: (posture === "rolling" ? 38 : 22) / 2,
      hh: height / 2,
      circle: posture === "rolling",
      angle: s.angle
    };
    if (!body.circle) {
      const clear = /* @__PURE__ */ __name((shift) => {
        const b = { ...body, x: body.x + s.nx * shift, y: body.y + s.ny * shift };
        return pathDistances(path, b, player.pathS).every((q) => q.distance >= -1e-7);
      }, "clear");
      if (!clear(0)) {
        let lo = 0, hi = 2;
        for (let i = 0; i < 20; i++) {
          const mid = (lo + hi) / 2;
          if (clear(mid)) hi = mid;
          else lo = mid;
        }
        body.x += s.nx * hi;
        body.y += s.ny * hi;
      }
    }
    return body;
  }
  __name(pathBody, "pathBody");
  function syncPathPlayer(player) {
    const s = samplePath(playtestPaths[player.scenario], player.pathS);
    player.x = s.x;
    player.y = s.y;
  }
  __name(syncPathPlayer, "syncPathPlayer");
  function initializeRuntimeModule3() {
    const loop = makePath("loop", 96), wide = makePath("loop-wide", 140), chamber = makePath("wall-ceiling", 120, true);
    playtestPaths = Object.freeze({
      loop,
      "loop-reverse": loop,
      "loop-wide": wide,
      "wall-ceiling": chamber,
      "wall-ceiling-reverse": chamber
    });
  }
  __name(initializeRuntimeModule3, "initializeRuntimeModule");
  function getRuntimeBindings3() {
    return {};
  }
  __name(getRuntimeBindings3, "getRuntimeBindings");
  function pathPolynomialRoots(coefficients, lo, hi) {
    const c = [...coefficients];
    while (c.length > 1 && Math.abs(c.at(-1)) < 1e-14) c.pop();
    const value = /* @__PURE__ */ __name((t) => c.reduceRight((v, x) => v * t + x, 0), "value");
    if (c.length <= 1) return [];
    if (c.length === 2) {
      const r = -c[0] / c[1];
      return r >= lo - 1e-10 && r <= hi + 1e-10 ? [Math.max(lo, Math.min(hi, r))] : [];
    }
    const points = [
      lo,
      ...pathPolynomialRoots(
        c.slice(1).map((x, i) => x * (i + 1)),
        lo,
        hi
      ),
      hi
    ], roots = [];
    for (const t of points) if (Math.abs(value(t)) < 1e-8) roots.push(t);
    for (let i = 1; i < points.length; i++) {
      let a = points[i - 1], b = points[i], fa = value(a), fb = value(b);
      if (fa * fb >= 0) continue;
      for (let n = 0; n < 48; n++) {
        const m = (a + b) / 2, fm = value(m);
        if (fa * fm <= 0) {
          b = m;
          fb = fm;
        } else {
          a = m;
          fa = fm;
        }
      }
      roots.push((a + b) / 2);
    }
    return roots.sort((a, b) => a - b).filter((x, i, a) => !i || x - a[i - 1] > 1e-9);
  }
  __name(pathPolynomialRoots, "pathPolynomialRoots");
  function pathArcImpact(body, vx, vy, ax, ay, duration, p2, path, skin, accept) {
    const times = [0], x = body.x - p2.cx, y = body.y - p2.cy;
    const circle = /* @__PURE__ */ __name((dx, dy, r) => times.push(
      ...pathPolynomialRoots(
        [
          dx * dx + dy * dy - r * r,
          2 * (dx * vx + dy * vy),
          vx * vx + vy * vy + dx * ax + dy * ay,
          vx * ax + vy * ay,
          (ax * ax + ay * ay) / 4
        ],
        0,
        duration
      )
    ), "circle");
    if (body.circle) {
      circle(x, y, p2.r - body.hw);
      circle(x, y, p2.r + path.thickness + body.hw);
    } else {
      for (const corner of pathCorners(body)) {
        circle(corner.x - p2.cx, corner.y - p2.cy, p2.r);
        circle(corner.x - p2.cx, corner.y - p2.cy, p2.r + path.thickness);
      }
      const r = p2.r + path.thickness;
      for (const sign2 of [-1, 1]) {
        times.push(...pathPolynomialRoots([x - sign2 * (r + body.hw), vx, ax / 2], 0, duration));
        times.push(...pathPolynomialRoots([y - sign2 * (r + body.hh), vy, ay / 2], 0, duration));
      }
    }
    for (const time of times.sort((a, b) => a - b)) {
      const at = {
        ...body,
        x: body.x + vx * time + ax * time * time / 2,
        y: body.y + vy * time + ay * time * time / 2
      };
      const q = pathArcFaceDistance(at, p2, path);
      if (!q || !accept(q)) continue;
      const into = (vx + ax * time) * q.nx + (vy + ay * time) * q.ny;
      if (time === 0 && q.distance < -skin || Math.abs(q.distance) <= skin + 1e-6 && (into < -1e-8 || Math.abs(into) < 1e-8 && ax * q.nx + ay * q.ny < -1e-8))
        return { time, q };
    }
    return null;
  }
  __name(pathArcImpact, "pathArcImpact");
  function pathArcCaps(p2, path) {
    if (p2.b - p2.a >= Math.PI * 2 - 1e-8) return [];
    return [p2.a, p2.b].map((angle) => {
      const tx = Math.sin(angle), ty = Math.cos(angle);
      return {
        kind: "line",
        x: p2.cx + p2.r * tx,
        y: p2.cy + p2.r * ty,
        tx,
        ty,
        length: path.thickness,
        start: p2.start,
        id: p2.id
      };
    });
  }
  __name(pathArcCaps, "pathArcCaps");

  // src/playtest-rails.js
  var experimentalRailTuning;
  function createExperimentalRail() {
    const points = [
      [-600, 300, 0],
      [-300, 260, -0.1],
      [0, 240, 0],
      [300, 260, 0.1],
      [600, 300, 0]
    ];
    const pieces = points.slice(0, -1).map(([x, y, m], i) => {
      const [x2, y2, m2] = points[i + 1], w = x2 - x;
      return {
        id: "rail-piece-" + i,
        x1: x,
        x2,
        y,
        c: [y, m, (3 * (y2 - y) / w - 2 * m - m2) / w, (2 * (y - y2) / w + m + m2) / (w * w)],
        grindable: true,
        routeType: i === 1 || i === 2 ? "boost" : "skill",
        infiniteBoost: i === 1 || i === 2
      };
    });
    return { id: "test-rail", pieces, x1: -600, x2: 600 };
  }
  __name(createExperimentalRail, "createExperimentalRail");
  function sampleExperimentalRail(rail, x, direction = 1) {
    const p2 = rail.pieces.find((p3) => direction < 0 ? x <= p3.x2 + 1e-9 : x < p3.x2 - 1e-9) || rail.pieces.at(-1), u = x - p2.x1;
    const [a, b, c, d] = p2.c, y = a + b * u + c * u * u + d * u * u * u, slope = b + 2 * c * u + 3 * d * u * u;
    const n = Math.hypot(1, slope);
    return {
      x,
      y,
      tx: 1 / n,
      ty: slope / n,
      nx: slope / n,
      ny: -1 / n,
      angle: Math.atan(slope),
      curvature: (2 * c + 6 * d * u) / (n * n * n),
      id: p2.id,
      railId: rail.id,
      grindable: p2.grindable,
      infiniteBoost: p2.infiniteBoost,
      piece: p2
    };
  }
  __name(sampleExperimentalRail, "sampleExperimentalRail");
  function multiplyRailPolynomial(a, b) {
    const out = Array(a.length + b.length - 1).fill(0);
    for (let i = 0; i < a.length; i++) for (let j = 0; j < b.length; j++) out[i + j] += a[i] * b[j];
    return out;
  }
  __name(multiplyRailPolynomial, "multiplyRailPolynomial");
  function experimentalRailImpact(rail, body, vx, vy, ax, ay, duration, skin) {
    const extent = body.hh;
    let first = null;
    for (const p2 of rail.pieces) {
      const u = [body.x - p2.x1, vx, ax / 2], u2 = multiplyRailPolynomial(u, u), u3 = multiplyRailPolynomial(u2, u);
      const c = [body.y + extent - p2.c[0] + skin, vy, ay / 2, 0, 0, 0, 0];
      for (const [poly, k] of [
        [u, p2.c[1]],
        [u2, p2.c[2]],
        [u3, p2.c[3]]
      ])
        for (let i = 0; i < poly.length; i++) c[i] -= poly[i] * k;
      for (const time of pathPolynomialRoots(c, 0, duration)) {
        const x = body.x + vx * time + ax * time * time / 2;
        if (x < p2.x1 - 1e-7 || x > p2.x2 + 1e-7) continue;
        const surface = sampleExperimentalRail(rail, x), into = (vx + ax * time) * surface.nx + (vy + ay * time) * surface.ny;
        if (into >= -1e-8) continue;
        const hit = { time, q: { ...surface, kind: "rail", surface, canLand: true, distance: skin } };
        if (!first || time < first.time) first = hit;
      }
    }
    return first;
  }
  __name(experimentalRailImpact, "experimentalRailImpact");
  function initializeRuntimeModule4() {
    experimentalRailTuning = Object.freeze({
      ...groundTuning,
      acceleration: 0.08,
      brake: 0.45,
      coastResistance: 0.025
    });
  }
  __name(initializeRuntimeModule4, "initializeRuntimeModule");
  function getRuntimeBindings4() {
    return {};
  }
  __name(getRuntimeBindings4, "getRuntimeBindings");

  // src/playtest-devices.js
  var playtest_devices_exports = {};
  __export(playtest_devices_exports, {
    experimentalDeviceImpact: () => experimentalDeviceImpact,
    experimentalDeviceTuning: () => experimentalDeviceTuning,
    experimentalPlatformImpact: () => experimentalPlatformImpact,
    experimentalPlatformPose: () => experimentalPlatformPose,
    experimentalSpringDistance: () => experimentalSpringDistance,
    experimentalSpringPose: () => experimentalSpringPose,
    getRuntimeBindings: () => getRuntimeBindings5,
    initializeRuntimeModule: () => initializeRuntimeModule5
  });
  var experimentalDeviceTuning;
  function experimentalPlatformPose(platform, time) {
    const m = platform.motion;
    let offset = 0, velocity = 0, nextTurn = Infinity;
    if (m) {
      const u = (((time + (m.phase || 0)) / m.period + 0.25) % 1 + 1) % 1;
      offset = m.amplitude * (u < 0.5 ? -1 + 4 * u : 3 - 4 * u);
      velocity = (u < 0.5 ? 1 : -1) * 4 * m.amplitude / m.period;
      nextTurn = (0.5 - u % 0.5) * m.period;
    }
    const dx = m?.axis === "x" ? offset : 0, dy = m?.axis === "y" ? offset : 0;
    return {
      id: platform.id,
      x1: platform.x - platform.width / 2 + dx,
      x2: platform.x + platform.width / 2 + dx,
      y1: platform.y + dy,
      y2: platform.y + dy + platform.depth,
      vx: m?.axis === "x" ? velocity : 0,
      vy: m?.axis === "y" ? velocity : 0,
      nextTurn
    };
  }
  __name(experimentalPlatformPose, "experimentalPlatformPose");
  function experimentalPlatformImpact(body, vx, vy, ax, ay, duration, pose2, skin) {
    const extentY = body.circle ? body.hh : Math.abs(Math.sin(body.angle)) * body.hw + Math.abs(Math.cos(body.angle)) * body.hh;
    const roots = pathPolynomialRoots(
      [body.y + extentY - pose2.y1 + skin, vy - pose2.vy, ay / 2],
      0,
      duration
    );
    for (const time of roots) {
      if (vy - pose2.vy + ay * time <= 1e-8) continue;
      const x = body.x + (vx - pose2.vx) * time + ax * time * time / 2;
      if (x < pose2.x1 || x > pose2.x2) continue;
      return {
        time,
        q: {
          distance: skin,
          nx: 0,
          ny: -1,
          kind: "platform",
          id: pose2.id,
          canLand: true,
          velocity: { vx: pose2.vx, vy: pose2.vy }
        }
      };
    }
    return null;
  }
  __name(experimentalPlatformImpact, "experimentalPlatformImpact");
  function experimentalSpringPose(spring, time, fixture = {}) {
    const carrier = fixture.platforms?.find((p2) => p2.id === spring.platform);
    const pose2 = carrier ? experimentalPlatformPose(carrier, time) : null;
    const angle = spring.angle || 0, nx = Math.sin(angle), ny = -Math.cos(angle);
    return {
      ...spring,
      x: spring.x + (pose2 ? (pose2.x1 + pose2.x2) / 2 : 0),
      y: spring.y + (pose2 ? pose2.y1 : 0),
      nx,
      ny,
      tx: -ny,
      ty: nx,
      half: 24,
      depth: 20,
      vx: pose2?.vx || 0,
      vy: pose2?.vy || 0
    };
  }
  __name(experimentalSpringPose, "experimentalSpringPose");
  function experimentalSpringDistance(body, face) {
    const dx = body.x - face.x, dy = body.y - face.y;
    const x = dx * face.tx + dy * face.ty;
    const y = -(dx * face.nx + dy * face.ny);
    let distance, nx, ny;
    if (body.circle) {
      const px = Math.max(-face.half, Math.min(face.half, x));
      const py = Math.max(0, Math.min(face.depth, y));
      const lx = x - px, ly = y - py, length = Math.hypot(lx, ly);
      if (length > 1e-12) {
        distance = length - body.hw;
        nx = lx / length;
        ny = ly / length;
      } else {
        const near = [
          { d: x + face.half, x: -1, y: 0 },
          { d: face.half - x, x: 1, y: 0 },
          { d: y, x: 0, y: -1 },
          { d: face.depth - y, x: 0, y: 1 }
        ].sort((a, b) => a.d - b.d)[0];
        distance = -near.d - body.hw;
        nx = near.x;
        ny = near.y;
      }
      return { distance, nx: nx * face.tx - ny * face.nx, ny: nx * face.ty - ny * face.ny };
    }
    const c = Math.cos(body.angle), s = Math.sin(body.angle);
    const cx = face.x - face.nx * face.depth / 2, cy = face.y - face.ny * face.depth / 2;
    let result = { distance: -Infinity };
    for (const [ax, ay] of [
      [face.tx, face.ty],
      [face.nx, face.ny],
      [c, s],
      [-s, c]
    ]) {
      const extent = body.hw * Math.abs(c * ax + s * ay) + body.hh * Math.abs(-s * ax + c * ay) + face.half * Math.abs(face.tx * ax + face.ty * ay) + face.depth / 2 * Math.abs(face.nx * ax + face.ny * ay);
      const projection = (body.x - cx) * ax + (body.y - cy) * ay;
      const d = Math.abs(projection) - extent;
      if (d > result.distance)
        result = { distance: d, nx: Math.sign(projection) * ax, ny: Math.sign(projection) * ay };
    }
    return result;
  }
  __name(experimentalSpringDistance, "experimentalSpringDistance");
  function experimentalDeviceImpact(body, vx, vy, ax, ay, duration, face, skin) {
    const candidates = [0];
    const roots = /* @__PURE__ */ __name((coefficients) => candidates.push(...pathPolynomialRoots(coefficients, 0, duration)), "roots");
    const dx = body.x - face.x, dy = body.y - face.y;
    if (body.circle) {
      const x = dx * face.tx + dy * face.ty, y = -dx * face.nx - dy * face.ny;
      const ux = vx * face.tx + vy * face.ty, uy = -vx * face.nx - vy * face.ny;
      const bx = (ax * face.tx + ay * face.ty) / 2, by = (-ax * face.nx - ay * face.ny) / 2;
      const radius = body.hw + skin;
      for (const edge of [-face.half - radius, face.half + radius]) roots([x - edge, ux, bx]);
      for (const edge of [-radius, face.depth + radius]) roots([y - edge, uy, by]);
      for (const cx of [-face.half, face.half])
        for (const cy of [0, face.depth]) {
          const px = x - cx, py = y - cy;
          roots([
            px * px + py * py - radius * radius,
            2 * (px * ux + py * uy),
            ux * ux + uy * uy + 2 * (px * bx + py * by),
            2 * (ux * bx + uy * by),
            bx * bx + by * by
          ]);
        }
    } else {
      const c = Math.cos(body.angle), s = Math.sin(body.angle);
      for (const [nx, ny] of [
        [face.tx, face.ty],
        [face.nx, face.ny],
        [c, s],
        [-s, c]
      ]) {
        const extent = body.hw * Math.abs(c * nx + s * ny) + body.hh * Math.abs(-s * nx + c * ny) + face.half * Math.abs(face.tx * nx + face.ty * ny) + face.depth / 2 * Math.abs(face.nx * nx + face.ny * ny) + skin;
        const offset = (dx + face.nx * face.depth / 2) * nx + (dy + face.ny * face.depth / 2) * ny;
        for (const sign2 of [-1, 1])
          roots([offset - sign2 * extent, vx * nx + vy * ny, (ax * nx + ay * ny) / 2]);
      }
    }
    candidates.sort((a, b) => a - b);
    for (const time of candidates) {
      const at = {
        ...body,
        x: body.x + vx * time + ax * time * time / 2,
        y: body.y + vy * time + ay * time * time / 2
      };
      const q = experimentalSpringDistance(at, face);
      if (q.distance > skin + 1e-7) continue;
      const vn = (vx + ax * time) * q.nx + (vy + ay * time) * q.ny;
      const an = ax * q.nx + ay * q.ny;
      if (vn < -1e-8 || Math.abs(vn) <= 1e-8 && an < -1e-8 || q.distance < -skin)
        return { time, q };
    }
    return null;
  }
  __name(experimentalDeviceImpact, "experimentalDeviceImpact");
  function initializeRuntimeModule5() {
    experimentalDeviceTuning = Object.freeze({
      springSpeed: 18,
      dashEntrySpeed: 0.5,
      dashMin: 12,
      dashMax: 19,
      dashChargeTicks: 30
    });
  }
  __name(initializeRuntimeModule5, "initializeRuntimeModule");
  function getRuntimeBindings5() {
    return {};
  }
  __name(getRuntimeBindings5, "getRuntimeBindings");

  // src/game.js
  var game_exports = {};
  __export(game_exports, {
    $: () => $,
    BOOST_MAX: () => BOOST_MAX,
    FOOT_RADIUS: () => FOOT_RADIUS,
    H: () => H,
    JUMP_KEYS: () => JUMP_KEYS,
    SONIC_VISUAL_SCALE: () => SONIC_VISUAL_SCALE,
    W: () => W,
    art: () => art,
    artFiles: () => artFiles,
    artLoads: () => artLoads,
    backdropScaleCache: () => backdropScaleCache,
    boostFrames: () => boostFrames,
    brakeFrames: () => brakeFrames,
    canvas: () => canvas,
    cityCloudLayer: () => cityCloudLayer,
    cityCloudLayers: () => cityCloudLayers,
    citySkyHeights: () => citySkyHeights,
    cityTexture: () => cityTexture,
    cityTextureCache: () => cityTextureCache,
    ctx: () => ctx,
    die: () => die,
    draw: () => draw,
    drawCityBackdrop: () => drawCityBackdrop,
    drawCityClouds: () => drawCityClouds,
    drawRail: () => drawRail,
    drawSonicFrame: () => drawSonicFrame,
    ellipse: () => ellipse,
    extraMotion: () => extraMotion,
    failedArt: () => failedArt,
    finishAct: () => finishAct,
    frame: () => frame,
    gameSound: () => gameSound,
    getRuntimeBindings: () => getRuntimeBindings31,
    grindFrames: () => grindFrames,
    hurt: () => hurt,
    initializeRuntimeModule: () => initializeRuntimeModule31,
    keys: () => keys,
    legacySonicArt: () => legacySonicArt,
    loadActArt: () => loadActArt,
    loadArt: () => loadArt,
    motionFrames: () => motionFrames,
    movementTuning: () => movementTuning,
    notify: () => notify,
    p: () => p,
    pause: () => pause,
    press: () => press,
    readGameState: () => readGameState,
    reconstructPixels: () => reconstructPixels,
    release: () => release,
    respawn: () => respawn,
    restart: () => restart,
    ring: () => ring,
    setup: () => setup,
    sharedArt: () => sharedArt,
    show: () => show,
    sign: () => sign,
    sizedCityBackdrop: () => sizedCityBackdrop,
    sonic: () => sonic,
    sonicFrames: () => sonicFrames,
    sonicPose: () => sonicPose,
    sparks: () => sparks,
    spritePixel: () => spritePixel,
    start: () => start,
    stepGameFrames: () => stepGameFrames,
    testInputCodes: () => testInputCodes,
    tuning: () => tuning,
    update: () => update,
    updateHud: () => updateHud,
    updateParticles: () => updateParticles
  });

  // src/act1-motion.js
  var act1_motion_exports = {};
  __export(act1_motion_exports, {
    act1Body: () => act1Body,
    act1Box: () => act1Box,
    act1Clear: () => act1Clear,
    act1SolidImpact: () => act1SolidImpact,
    act1Solids: () => act1Solids,
    act1Surface: () => act1Surface,
    adoptAct1Interaction: () => adoptAct1Interaction,
    attachAct1: () => attachAct1,
    clearAct1Input: () => clearAct1Input,
    getRuntimeBindings: () => getRuntimeBindings25,
    initializeRuntimeModule: () => initializeRuntimeModule25,
    inputAct1Motion: () => inputAct1Motion,
    moveAct1Air: () => moveAct1Air,
    moveAct1Ground: () => moveAct1Ground,
    projectAct1Motion: () => projectAct1Motion,
    releaseAct1: () => releaseAct1,
    resetAct1Motion: () => resetAct1Motion,
    updateAct1Movement: () => updateAct1Movement,
    usesAct1Motion: () => usesAct1Motion
  });

  // src/playtest-motion.js
  var playtest_motion_exports = {};
  __export(playtest_motion_exports, {
    advanceMotionGround: () => advanceMotionGround,
    bodyBoxDistance: () => bodyBoxDistance,
    createMotionPlayer: () => createMotionPlayer,
    firstAirImpact: () => firstAirImpact,
    firstDeviceImpact: () => firstDeviceImpact,
    firstGroundDeviceImpact: () => firstGroundDeviceImpact,
    floorBodyDistance: () => floorBodyDistance,
    getRuntimeBindings: () => getRuntimeBindings7,
    initializeRuntimeModule: () => initializeRuntimeModule7,
    landMotion: () => landMotion,
    launchExperimentalSpring: () => launchExperimentalSpring,
    motionAirForces: () => motionAirForces,
    motionBody: () => motionBody,
    motionBounds: () => motionBounds,
    motionContact: () => motionContact,
    motionFixtures: () => motionFixtures,
    motionPostureClear: () => motionPostureClear,
    motionRail: () => motionRail,
    motionReaction: () => motionReaction,
    motionSpans: () => motionSpans,
    motionSpawn: () => motionSpawn,
    motionSupport: () => motionSupport,
    motionSupported: () => motionSupported,
    motionSurface: () => motionSurface,
    motionTrajectory: () => motionTrajectory,
    motionTuning: () => motionTuning,
    moveAirTime: () => moveAirTime,
    releaseMotion: () => releaseMotion,
    sampleMotionExtension: () => sampleMotionExtension,
    sampleMotionGround: () => sampleMotionGround,
    sampleMotionPath: () => sampleMotionPath,
    stepMotionPlayer: () => stepMotionPlayer,
    sweepGroundBox: () => sweepGroundBox,
    sweepMotionDistance: () => sweepMotionDistance,
    updateExperimentalDash: () => updateExperimentalDash
  });

  // src/playtest-boost.js
  var playtest_boost_exports = {};
  __export(playtest_boost_exports, {
    beginExperimentalBoost: () => beginExperimentalBoost,
    createExperimentalBoost: () => createExperimentalBoost,
    experimentalBoostTuning: () => experimentalBoostTuning,
    experimentalGroundBoost: () => experimentalGroundBoost,
    getRuntimeBindings: () => getRuntimeBindings6,
    initializeRuntimeModule: () => initializeRuntimeModule6,
    resetExperimentalAirBoost: () => resetExperimentalAirBoost
  });
  var experimentalBoostTuning;
  function createExperimentalBoost(meter = 90) {
    return {
      meter,
      locked: false,
      held: false,
      airUsed: false,
      remaining: 0,
      active: false,
      bursts: 0
    };
  }
  __name(createExperimentalBoost, "createExperimentalBoost");
  function beginExperimentalBoost(player, input, startedGrounded) {
    const b = player.boost, t = experimentalBoostTuning;
    b.held = !!input.boostHeld;
    b.active = false;
    if (!b.held) {
      b.locked = false;
      b.remaining = 0;
    }
    if (player.mode === "grounded") {
      b.airUsed = false;
      b.remaining = 0;
      return;
    }
    const freshAir = input.boostPressed && (input.boostPressAirborne ?? !startedGrounded);
    if (freshAir && b.held && !b.airUsed && !b.locked && !player.dash && b.meter >= t.maximum / 4) {
      b.meter -= t.maximum / 4;
      b.airUsed = true;
      b.remaining = t.airTicks;
      b.bursts++;
      player.air.vx = player.facing * Math.max(t.speed, player.air.vx * player.facing);
      player.air.vy = 0;
      player.air.cutEligible = false;
      player.air.jumpLift = 0;
      player.latestTransition = "air Boost burst";
    }
  }
  __name(beginExperimentalBoost, "beginExperimentalBoost");
  function resetExperimentalAirBoost(player) {
    player.boost.airUsed = false;
    player.boost.remaining = 0;
    player.boost.active = false;
  }
  __name(resetExperimentalAirBoost, "resetExperimentalAirBoost");
  function experimentalGroundBoost(player, surface) {
    const b = player.boost;
    return b.held && !player.dash && (surface.grindable && surface.infiniteBoost || b.meter > 0 && !b.locked);
  }
  __name(experimentalGroundBoost, "experimentalGroundBoost");
  function initializeRuntimeModule6() {
    experimentalBoostTuning = Object.freeze({
      maximum: 90,
      groundCost: 0.5,
      speed: 23,
      response: 0.14,
      airTicks: 18
    });
  }
  __name(initializeRuntimeModule6, "initializeRuntimeModule");
  function getRuntimeBindings6() {
    return {};
  }
  __name(getRuntimeBindings6, "getRuntimeBindings");

  // src/playtest-motion.js
  var motionTuning;
  var motionFixtures;
  function motionBounds(scenario) {
    const fixture = motionFixtures[scenario];
    if (!fixture) throw Error("Unknown PLAYTEST fixture");
    return fixture.bounds;
  }
  __name(motionBounds, "motionBounds");
  function motionSpans(scenario) {
    if (playtestPaths[scenario]) return [];
    const b = motionBounds(scenario);
    return scenario === "gap" ? [
      [-b, 100],
      [300, b]
    ] : [[-b, b]];
  }
  __name(motionSpans, "motionSpans");
  function sampleMotionExtension(scenario, x) {
    let s;
    if (scenario === "flat" || scenario === "valley") s = sampleGround(scenario, x);
    else {
      let y = 400, slope = 0, second = 0;
      if (scenario === "crest" && Math.abs(x) < 360) {
        const u = x / 360, w = 1 - u * u;
        y -= 100 * w * w * w;
        slope = 600 * x * w * w / (360 * 360);
        second = 600 / (360 * 360) * w * (1 - 5 * u * u);
      }
      const norm = Math.hypot(1, slope);
      s = {
        x,
        y,
        angle: Math.atan(slope),
        tx: 1 / norm,
        ty: slope / norm,
        nx: slope / norm,
        ny: -1 / norm,
        curvature: second / norm ** 3
      };
    }
    return { ...s, id: scenario + "-floor-" + (scenario === "gap" && x >= 300 ? 1 : 0) };
  }
  __name(sampleMotionExtension, "sampleMotionExtension");
  function sampleMotionGround(scenario, x) {
    if (!motionSpans(scenario).some(([a, b]) => x >= a && x <= b)) return null;
    return sampleMotionExtension(scenario, x);
  }
  __name(sampleMotionGround, "sampleMotionGround");
  function createMotionPlayer(scenario = "flat") {
    motionBounds(scenario);
    const x = motionFixtures[scenario].spawn;
    const path = playtestPaths[scenario];
    const spawn = path ? samplePath(path, x) : sampleMotionExtension(scenario, x);
    return {
      ...createGroundPlayer(),
      scenario,
      x: spawn.x,
      y: spawn.y,
      ...path ? { pathS: x } : {},
      mode: "grounded",
      air: null,
      supportId: null,
      railId: null,
      boost: createExperimentalBoost(motionFixtures[scenario].meter ?? 90),
      dash: null,
      springLaunches: 0,
      latestTransition: "reset",
      transitionCount: 0,
      lastTakeoff: null,
      lastLanding: null
    };
  }
  __name(createMotionPlayer, "createMotionPlayer");
  function motionSpawn(scenario) {
    return playtestPaths[scenario] ? samplePath(playtestPaths[scenario], motionFixtures[scenario].spawn) : sampleMotionExtension(scenario, motionFixtures[scenario].spawn);
  }
  __name(motionSpawn, "motionSpawn");
  function motionSupport(player, time = player.ticks) {
    const platform = motionFixtures[player.scenario].platforms?.find(
      (p2) => p2.id === player.supportId
    );
    return platform ? experimentalPlatformPose(platform, time) : null;
  }
  __name(motionSupport, "motionSupport");
  function motionRail(player) {
    return motionFixtures[player.scenario].rails?.find((r) => r.id === player.railId);
  }
  __name(motionRail, "motionRail");
  function motionSurface(player, time = player.ticks) {
    const rail = motionRail(player);
    if (rail) return sampleExperimentalRail(rail, player.x, Math.sign(player.speed));
    const support = motionSupport(player, time);
    if (support)
      return {
        x: player.x,
        y: player.y,
        angle: 0,
        tx: 1,
        ty: 0,
        nx: 0,
        ny: -1,
        curvature: 0,
        id: support.id,
        vx: support.vx,
        vy: support.vy
      };
    return playtestPaths[player.scenario] ? samplePath(playtestPaths[player.scenario], player.pathS) : sampleMotionGround(player.scenario, player.x);
  }
  __name(motionSurface, "motionSurface");
  function sampleMotionPath(scenario, s) {
    return samplePath(playtestPaths[scenario], s);
  }
  __name(sampleMotionPath, "sampleMotionPath");
  function advanceMotionGround(player, controls, dt, time = player.ticks) {
    if (controls.groundBlocked) {
      const support2 = motionSupport(player, time);
      if (support2) {
        player.x += support2.vx * dt;
        player.y = motionSupport(player, time + dt).y1;
      }
      return;
    }
    const rail = motionRail(player), surface = motionSurface(player, time);
    const boosted = experimentalGroundBoost(player, surface || {});
    if (rail || boosted)
      controls = {
        ...controls,
        ...rail ? { physics: experimentalRailTuning, rolling: false } : {},
        ...boosted ? { boost: { ...experimentalBoostTuning, facing: player.facing } } : {}
      };
    if (rail) {
      advanceGroundSubstep(
        player,
        controls,
        dt,
        (_scenario, x) => sampleExperimentalRail(rail, x, Math.sign(player.speed))
      );
      player.y = sampleExperimentalRail(rail, player.x).y;
      return;
    }
    const support = motionSupport(player, time);
    if (support) {
      advanceGroundSubstep(player, controls, dt, (_scenario, x) => ({
        ...motionSurface(player, time),
        x
      }));
      player.x += support.vx * dt;
      player.y = motionSupport(player, time + dt).y1;
      return;
    }
    const path = playtestPaths[player.scenario];
    advanceGroundSubstep(
      player,
      controls,
      dt,
      path ? sampleMotionPath : sampleMotionExtension,
      !!path
    );
    if (path) syncPathPlayer(player);
    else player.y = sampleMotionExtension(player.scenario, player.x).y;
  }
  __name(advanceMotionGround, "advanceMotionGround");
  function motionReaction(player, surface) {
    const radius = player.posture === "rolling" ? 19 : 24;
    const normalAcceleration = player.speed * player.speed * surface.curvature * (1 + radius * surface.curvature);
    return -normalAcceleration - groundTuning.gravity * surface.ny;
  }
  __name(motionReaction, "motionReaction");
  function motionSupported(player, surface) {
    if (!surface) return false;
    if (surface.pathS !== void 0) {
      const steep = surface.ny >= -Math.SQRT1_2;
      if (steep && Math.abs(player.speed) < motionTuning.steepGripSpeed) return false;
      if (steep && Math.abs(surface.curvature) < 1e-9) return true;
      return player.posture === "standing" && surface.ny < -Math.SQRT1_2 && surface.curvature >= 0 || motionReaction(player, surface) >= -1e-6;
    }
    return player.posture === "standing" || motionReaction(player, surface) >= -1e-6;
  }
  __name(motionSupported, "motionSupported");
  function motionContact(player, time = player.ticks) {
    if (player.mode === "grounded") {
      const path = playtestPaths[player.scenario];
      const support = motionSupport(player, time);
      const rail = motionRail(player);
      if (rail) {
        const surface2 = motionSurface(player, time);
        return {
          ...surface2,
          surfaceAngle: surface2.angle,
          angle: 0,
          grounded: true,
          anchor: { x: player.x, y: player.y },
          center: { x: player.x, y: player.y - 24 },
          width: 22,
          height: 48,
          speed: player.speed,
          vx: player.speed * surface2.tx,
          vy: player.speed * surface2.ty,
          normalReaction: motionReaction(player, surface2)
        };
      }
      if (support) {
        const surface2 = motionSurface(player, time), height2 = player.posture === "rolling" ? 38 : 48;
        return {
          ...surface2,
          grounded: true,
          anchor: { x: player.x, y: player.y },
          center: { x: player.x, y: player.y - height2 / 2 },
          width: player.posture === "rolling" ? 38 : 22,
          height: height2,
          speed: player.speed,
          vx: player.speed + support.vx,
          vy: support.vy,
          normalReaction: groundTuning.gravity
        };
      }
      const surface = path ? motionSurface(player) : null;
      const body = path ? pathBody(player) : null;
      const c = path ? {
        ...surface,
        anchor: { x: surface.x, y: surface.y },
        center: { x: body.x, y: body.y },
        width: body.hw * 2,
        height: body.hh * 2,
        speed: player.speed,
        vx: player.speed * surface.tx,
        vy: player.speed * surface.ty
      } : groundContact(player, sampleMotionExtension);
      const reaction = motionReaction(player, c);
      return {
        ...c,
        grounded: true,
        normalReaction: reaction,
        uprightGrip: player.posture === "standing" && c.ny < -Math.SQRT1_2 && reaction < -1e-6,
        steepGrip: !!path && c.ny >= -Math.SQRT1_2 && Math.abs(c.curvature) < 1e-9
      };
    }
    const height = player.posture === "rolling" ? 38 : 48, width = player.posture === "rolling" ? 38 : 22;
    return {
      x: player.x,
      y: player.y + height / 2,
      center: { x: player.x, y: player.y },
      anchor: null,
      width,
      height,
      angle: 0,
      tx: 1,
      ty: 0,
      nx: 0,
      ny: 0,
      curvature: 0,
      normalReaction: 0,
      grounded: false,
      speed: Math.hypot(player.air.vx, player.air.vy),
      vx: player.air.vx,
      vy: player.air.vy
    };
  }
  __name(motionContact, "motionContact");
  function motionBody(player, posture = player.posture, time = player.ticks) {
    if (player.mode === "grounded" && motionRail(player))
      return {
        x: player.x,
        y: player.y - (posture === "rolling" ? 19 : 24),
        hw: posture === "rolling" ? 19 : 11,
        hh: posture === "rolling" ? 19 : 24,
        circle: posture === "rolling",
        angle: 0
      };
    if (player.mode === "grounded" && playtestPaths[player.scenario])
      return pathBody(player, posture);
    const height = posture === "rolling" ? 38 : 48, width = posture === "rolling" ? 38 : 22;
    const s = player.mode === "grounded" ? motionSurface(player, time) || sampleMotionExtension(player.scenario, player.x) : null;
    return {
      x: s ? s.x + s.nx * height / 2 : player.x,
      y: s ? s.y + s.ny * height / 2 : player.y,
      hw: width / 2,
      hh: height / 2,
      circle: posture === "rolling",
      angle: s ? s.angle : 0
    };
  }
  __name(motionBody, "motionBody");
  function bodyBoxDistance(body, box) {
    if (body.circle) {
      const px = Math.max(box.x1, Math.min(box.x2, body.x)), py = Math.max(box.y1, Math.min(box.y2, body.y));
      const dx2 = body.x - px, dy2 = body.y - py, length = Math.hypot(dx2, dy2);
      if (length > 1e-12)
        return {
          distance: length - body.hw,
          nx: dx2 / length,
          ny: dy2 / length,
          curvature: 1 / body.hw
        };
      const faces = [
        { distance: body.x - box.x1, nx: -1, ny: 0 },
        { distance: box.x2 - body.x, nx: 1, ny: 0 },
        { distance: body.y - box.y1, nx: 0, ny: -1 },
        { distance: box.y2 - body.y, nx: 0, ny: 1 }
      ].sort((a, b) => a.distance - b.distance);
      return { ...faces[0], distance: -faces[0].distance - body.hw, curvature: 1 / body.hw };
    }
    const dx = Math.abs(body.x - (box.x1 + box.x2) / 2) - (box.x2 - box.x1) / 2 - body.hw;
    const dy = Math.abs(body.y - (box.y1 + box.y2) / 2) - (box.y2 - box.y1) / 2 - body.hh;
    return dx > dy ? { distance: dx, nx: Math.sign(body.x - (box.x1 + box.x2) / 2), ny: 0, curvature: 0 } : { distance: dy, nx: 0, ny: Math.sign(body.y - (box.y1 + box.y2) / 2), curvature: 0 };
  }
  __name(bodyBoxDistance, "bodyBoxDistance");
  function motionPostureClear(player, posture, time = player.ticks) {
    const body = motionBody(player, posture, time), c = Math.cos(body.angle), s = Math.sin(body.angle);
    for (const box of motionFixtures[player.scenario].boxes) {
      if (body.circle) {
        if (bodyBoxDistance(body, box).distance < -motionTuning.skin) return false;
        continue;
      }
      const dx = body.x - (box.x1 + box.x2) / 2, dy = body.y - (box.y1 + box.y2) / 2, bw = (box.x2 - box.x1) / 2, bh = (box.y2 - box.y1) / 2;
      const axes = [
        [1, 0],
        [0, 1],
        [c, s],
        [-s, c]
      ];
      if (axes.every(
        ([x, y]) => Math.abs(dx * x + dy * y) < body.hw * Math.abs(c * x + s * y) + body.hh * Math.abs(-s * x + c * y) + bw * Math.abs(x) + bh * Math.abs(y) - motionTuning.skin
      ))
        return false;
    }
    for (const spring of motionFixtures[player.scenario].springs || [])
      if (experimentalSpringDistance(
        body,
        experimentalSpringPose(spring, time, motionFixtures[player.scenario])
      ).distance < -motionTuning.skin)
        return false;
    if (playtestPaths[player.scenario] && pathDistances(
      playtestPaths[player.scenario],
      body,
      player.mode === "grounded" ? player.pathS : null
    ).some((q) => q.distance < -motionTuning.skin))
      return false;
    return true;
  }
  __name(motionPostureClear, "motionPostureClear");
  function floorBodyDistance(scenario, body, span, index) {
    const [left, right] = span;
    if (!body.circle) {
      const a = Math.max(left, body.x - body.hw), b = Math.min(right, body.x + body.hw);
      if (a > b) return null;
      const candidates = [a, b];
      if (a <= 0 && b >= 0) candidates.push(0);
      const q2 = candidates.map((x2) => sampleMotionExtension(scenario, x2)).sort((a2, b2) => a2.y - b2.y)[0];
      return {
        distance: q2.y - body.y - body.hh,
        nx: q2.nx,
        ny: q2.ny,
        gradient: Math.hypot(1, q2.ty / q2.tx),
        curvature: 0.02,
        surface: q2,
        id: scenario + "-floor-" + index,
        kind: "floor",
        canLand: true
      };
    }
    let x = Math.max(left, Math.min(right, body.x));
    const initial = sampleMotionExtension(scenario, x), vertical = initial.y - body.y;
    if (body.x >= left && body.x <= right && vertical > 45)
      return {
        distance: vertical / Math.hypot(1, 0.65) - body.hw,
        nx: initial.nx,
        ny: initial.ny,
        curvature: 0.02,
        far: true
      };
    const lo = Math.max(left, body.x - body.hw - 2), hi = Math.min(right, body.x + body.hw + 2);
    if (lo <= hi)
      for (let i = 0; i < 10; i++) {
        const q2 = sampleMotionExtension(scenario, x), slope = q2.ty / q2.tx, second = q2.curvature / q2.tx ** 3;
        const next = Math.max(
          lo,
          Math.min(
            hi,
            x - (x - body.x + (q2.y - body.y) * slope) / (1 + slope * slope + (q2.y - body.y) * second)
          )
        );
        if (Math.abs(next - x) < 1e-9) {
          x = next;
          break;
        }
        x = next;
      }
    const q = sampleMotionExtension(scenario, x), dx = body.x - q.x, dy = body.y - q.y, len = Math.hypot(dx, dy);
    const interior = x > left + 1e-6 && x < right - 1e-6;
    if (!interior && body.y > q.y && (body.x < left || body.x > right)) return null;
    const outside = dx * q.nx + dy * q.ny >= 0 || !interior;
    return {
      distance: (outside ? len : -len) - body.hw,
      nx: outside && len > 1e-9 ? dx / len : q.nx,
      ny: outside && len > 1e-9 ? dy / len : q.ny,
      curvature: 0.02,
      convex: !interior,
      surface: q,
      id: scenario + "-floor-" + index,
      kind: "floor",
      canLand: interior
    };
  }
  __name(floorBodyDistance, "floorBodyDistance");
  function motionTrajectory(body, vx, vy, ax, ay, t) {
    return { ...body, x: body.x + vx * t + ax * t * t / 2, y: body.y + vy * t + ay * t * t / 2 };
  }
  __name(motionTrajectory, "motionTrajectory");
  function sweepMotionDistance(body, vx, vy, ax, ay, duration, query, convex = false) {
    let time = 0;
    for (let i = 0; i < 96; i++) {
      const at = motionTrajectory(body, vx, vy, ax, ay, time), q = query(at);
      if (!q) return null;
      const ux = vx + ax * time, uy = vy + ay * time, remaining = duration - time;
      const vn = ux * q.nx + uy * q.ny, an = ax * q.nx + ay * q.ny;
      const convexHere = convex || q.convex;
      if (q.distance <= motionTuning.skin + 1e-8) {
        if (vn < -1e-8 || Math.abs(vn) <= 1e-8 && an < -1e-8 || q.distance < -motionTuning.skin)
          return { time, q };
        if (convexHere && vn >= -1e-8 && vn + an * remaining / 2 >= -1e-8) return null;
      }
      if (remaining <= 1e-10) return null;
      const speed = Math.hypot(ux, uy) + Math.hypot(ax, ay) * remaining;
      const gradient = q.gradient || 1;
      const closing = Math.max(0, -vn) * gradient + (Math.hypot(ax, ay) * gradient + (convexHere ? 0 : q.curvature || 0) * speed * speed) * remaining;
      const bound = q.far ? speed : Math.min(speed * gradient, closing);
      if (bound < 1e-12) return null;
      const advance = Math.max(1e-8, (q.distance - motionTuning.skin) / bound);
      if (advance > remaining) return null;
      time += Math.min(remaining, advance);
    }
    throw Error("PLAYTEST continuous collision did not converge");
  }
  __name(sweepMotionDistance, "sweepMotionDistance");
  function firstAirImpact(player, ax, ay, duration, time = player.ticks) {
    const body = motionBody(player), a = player.air;
    let hit = null;
    for (const box of motionFixtures[player.scenario].boxes) {
      const result = sweepMotionDistance(
        body,
        a.vx,
        a.vy,
        ax,
        ay,
        duration,
        (b) => ({ ...bodyBoxDistance(b, box), kind: "box", id: box.id }),
        true
      );
      if (result && (!hit || result.time < hit.time)) hit = result;
    }
    for (const rail of motionFixtures[player.scenario].rails || []) {
      if (a.railDeparture === rail.id && a.separation && !a.separation.cleared) continue;
      const result = experimentalRailImpact(
        rail,
        body,
        a.vx,
        a.vy,
        ax,
        ay,
        duration,
        motionTuning.skin
      );
      if (result && (!hit || result.time < hit.time)) hit = result;
    }
    const deviceHit = firstDeviceImpact(player, body, a.vx, a.vy, ax, ay, duration, time);
    if (deviceHit && (!hit || deviceHit.time < hit.time)) hit = deviceHit;
    for (const [index, span] of motionSpans(player.scenario).entries()) {
      const result = sweepMotionDistance(body, a.vx, a.vy, ax, ay, duration, (b) => {
        const q = floorBodyDistance(player.scenario, b, span, index);
        if (q && a.separation && a.separation.id === q.id && !a.separation.cleared && Math.abs(q.distance) <= motionTuning.separation)
          return null;
        return q;
      });
      if (result && (!hit || result.time < hit.time)) hit = result;
    }
    const path = playtestPaths[player.scenario];
    if (path)
      for (const piece of path.pieces) {
        const accept = /* @__PURE__ */ __name((q) => {
          if (a.departure?.includes(q.id) && Math.abs(q.surface.pathS - a.pathOrigin) > a.pathReach)
            return false;
          return !(a.separation?.id === q.id && !a.separation.cleared && Math.abs(q.distance) <= motionTuning.separation);
        }, "accept");
        if (piece.kind === "arc") {
          const face = pathArcImpact(
            body,
            a.vx,
            a.vy,
            ax,
            ay,
            duration,
            piece,
            path,
            motionTuning.skin,
            accept
          );
          if (face && (!hit || face.time < hit.time)) hit = face;
          for (const cap of pathArcCaps(piece, path)) {
            const result = sweepMotionDistance(
              body,
              a.vx,
              a.vy,
              ax,
              ay,
              duration,
              (b) => {
                const q = {
                  ...pathLineDistance(b, cap, { ...path, thickness: 0 }),
                  kind: "box",
                  canLand: false
                };
                return accept(q) ? q : null;
              },
              true
            );
            if (result && (!hit || result.time < hit.time)) hit = result;
          }
        } else {
          const result = sweepMotionDistance(
            body,
            a.vx,
            a.vy,
            ax,
            ay,
            duration,
            (b) => {
              const q = pathLineDistance(b, piece, path);
              return accept(q) ? q : null;
            },
            true
          );
          if (result && (!hit || result.time < hit.time)) hit = result;
        }
      }
    return hit;
  }
  __name(firstAirImpact, "firstAirImpact");
  function sweepGroundBox(before, after, box, duration) {
    const extentX = /* @__PURE__ */ __name((b) => b.circle ? b.hw : Math.abs(Math.cos(b.angle)) * b.hw + Math.abs(Math.sin(b.angle)) * b.hh, "extentX");
    const extentY = /* @__PURE__ */ __name((b) => b.circle ? b.hh : Math.abs(Math.sin(b.angle)) * b.hw + Math.abs(Math.cos(b.angle)) * b.hh, "extentY");
    if (Math.max(before.y + extentY(before), after.y + extentY(after)) <= box.y1 + motionTuning.skin || Math.min(before.y - extentY(before), after.y - extentY(after)) >= box.y2 - motionTuning.skin || Math.max(before.x + extentX(before), after.x + extentX(after)) < box.x1 || Math.min(before.x - extentX(before), after.x - extentX(after)) > box.x2)
      return null;
    if (before.circle) {
      return sweepMotionDistance(
        before,
        (after.x - before.x) / duration,
        (after.y - before.y) / duration,
        0,
        0,
        duration,
        (b) => bodyBoxDistance(b, box),
        true
      );
    }
    const c = Math.cos(before.angle), s = Math.sin(before.angle), dx = after.x - before.x, dy = after.y - before.y;
    let enter = 0, exit = 1, normal = null;
    for (const [x, y] of [
      [1, 0],
      [0, 1],
      [c, s],
      [-s, c]
    ]) {
      const extent = before.hw * Math.abs(c * x + s * y) + before.hh * Math.abs(-s * x + c * y) + (box.x2 - box.x1) / 2 * Math.abs(x) + (box.y2 - box.y1) / 2 * Math.abs(y);
      const offset = (before.x - (box.x1 + box.x2) / 2) * x + (before.y - (box.y1 + box.y2) / 2) * y, travel = dx * x + dy * y;
      if (Math.abs(travel) < 1e-12) {
        if (Math.abs(offset) >= extent - motionTuning.skin) return null;
        continue;
      }
      let a = (-extent - offset) / travel, b = (extent - offset) / travel;
      if (a > b) [a, b] = [b, a];
      if (a >= enter) {
        enter = a;
        normal = { nx: -Math.sign(travel) * x, ny: -Math.sign(travel) * y };
      }
      exit = Math.min(exit, b);
      if (enter > exit) return null;
    }
    return normal && enter >= 0 && enter <= 1 ? { time: enter * duration, q: normal } : null;
  }
  __name(sweepGroundBox, "sweepGroundBox");
  function releaseMotion(player, reason, jump2 = false, time = player.ticks) {
    const c = motionContact(player, time), previous = player.posture;
    const before = { vx: c.vx, vy: c.vy };
    let center = c.center;
    if (jump2 && motionPostureClear(player, "rolling", time)) {
      player.posture = "rolling";
      const body = motionBody(player, player.posture, time);
      center = { x: body.x, y: body.y };
    }
    const impulse = jump2 ? motionTuning.jumpImpulse : 0;
    const after = { vx: before.vx + c.nx * impulse, vy: before.vy + c.ny * impulse };
    player.lastTakeoff = {
      reason,
      before,
      after,
      normal: { x: c.nx, y: c.ny },
      anchor: c.anchor,
      reaction: c.normalReaction
    };
    const path = playtestPaths[player.scenario];
    const pathOrigin = player.pathS;
    const shape = motionBody(player);
    const pathReach = shape.hw + shape.hh + (path?.thickness || 0) + 2;
    const departure = path ? pathDistances(path, { ...motionBody(player), x: center.x, y: center.y, angle: 0 }).filter((q) => q.distance < 0 && Math.abs(q.surface.pathS - player.pathS) > pathReach).map((q) => q.id) : [];
    if (path) player.pathS = null;
    player.x = center.x;
    player.y = center.y;
    player.speed = null;
    if (player.boost.remaining <= 0) player.boost.active = false;
    const railDeparture = player.railId;
    player.supportId = null;
    player.railId = null;
    player.dash = null;
    player.mode = "airborne";
    player.air = {
      ...after,
      railDeparture,
      departure,
      ...path ? { pathOrigin, pathReach } : {},
      jumpLift: Math.max(0, -c.ny * impulse),
      cutEligible: jump2,
      restorePosture: previous,
      separation: { id: c.id, cleared: false }
    };
    player.latestTransition = reason;
    player.transitionCount++;
  }
  __name(releaseMotion, "releaseMotion");
  function moveAirTime(player, ax, ay, time, clockTime = player.ticks) {
    const a = player.air;
    player.x += a.vx * time + ax * time * time / 2;
    player.y += a.vy * time + ay * time * time / 2;
    player.distance += Math.hypot(a.vx, a.vy) * time;
    a.vx += ax * time;
    a.vy += ay * time;
    a.jumpLift = Math.max(0, (a.jumpLift || 0) - groundTuning.gravity * time);
    const path = playtestPaths[player.scenario];
    if (path && a.departure?.length) {
      const distances = pathDistances(path, motionBody(player));
      a.departure = a.departure.filter(
        (id) => distances.some((q) => q.id === id && q.distance <= motionTuning.separation)
      );
    }
    if (a.separation && !a.separation.cleared) {
      if (a.railDeparture) {
        const rail = motionFixtures[player.scenario].rails.find((r) => r.id === a.railDeparture);
        const gap = sampleExperimentalRail(rail, player.x).y - player.y - motionBody(player).hh;
        if (gap > motionTuning.separation || player.x < rail.x1 || player.x > rail.x2)
          a.separation.cleared = true;
        return;
      }
      const platform = motionFixtures[player.scenario].platforms?.find(
        (p2) => p2.id === a.separation.id
      );
      if (platform) {
        const distance = bodyBoxDistance(
          motionBody(player),
          experimentalPlatformPose(platform, clockTime + time)
        ).distance;
        if (distance > motionTuning.separation) a.separation.cleared = true;
        return;
      }
      if (playtestPaths[player.scenario]) {
        const q2 = pathDistances(playtestPaths[player.scenario], motionBody(player)).find(
          (q3) => q3.id === a.separation.id
        );
        if (!q2 || q2.distance > motionTuning.separation) a.separation.cleared = true;
        return;
      }
      const span = motionSpans(player.scenario).find(
        (s, i) => player.scenario + "-floor-" + i === a.separation.id
      );
      const q = span ? floorBodyDistance(
        player.scenario,
        motionBody(player),
        span,
        Number(a.separation.id.slice(-1))
      ) : null;
      if (!q || q.distance > motionTuning.separation) a.separation.cleared = true;
    }
  }
  __name(moveAirTime, "moveAirTime");
  function landMotion(player, hit, incoming, time = player.ticks) {
    if (hit.kind === "rail") {
      const rail = motionFixtures[player.scenario].rails.find((r) => r.id === hit.railId), surface = sampleExperimentalRail(rail, player.x);
      const speed2 = incoming.vx * surface.tx + incoming.vy * surface.ty;
      const candidate2 = {
        ...player,
        mode: "grounded",
        railId: rail.id,
        supportId: null,
        posture: "standing",
        x: player.x,
        y: surface.y,
        speed: speed2,
        air: null,
        restTicks: 0,
        dash: null
      };
      if (!motionPostureClear(candidate2, "standing", time)) return false;
      Object.assign(player, candidate2, {
        latestTransition: "rail capture",
        transitionCount: player.transitionCount + 1
      });
      player.lastLanding = {
        incoming,
        speed: speed2,
        tx: surface.tx,
        ty: surface.ty,
        anchor: { x: player.x, y: surface.y }
      };
      resetExperimentalAirBoost(player);
      return true;
    }
    if (hit.kind === "platform") {
      const support = hit.platform, relative = incoming.vx - support.vx;
      const candidate2 = {
        ...player,
        mode: "grounded",
        air: null,
        supportId: support.id,
        speed: relative,
        y: support.y1,
        restTicks: 0
      };
      const posture2 = [player.air.restorePosture, player.posture].find(
        (posture3) => motionPostureClear({ ...candidate2, posture: posture3 }, posture3, time)
      );
      if (!posture2) return false;
      Object.assign(player, candidate2, {
        posture: posture2,
        latestTransition: "platform landing",
        transitionCount: player.transitionCount + 1
      });
      player.lastLanding = {
        incoming,
        speed: relative,
        tx: 1,
        ty: 0,
        platformVelocity: { vx: support.vx, vy: support.vy },
        anchor: { x: player.x, y: support.y1 }
      };
      resetExperimentalAirBoost(player);
      return true;
    }
    const path = playtestPaths[player.scenario];
    if (path) {
      const piece = hit.surface.piece;
      let pathS;
      if (piece.kind === "line")
        pathS = piece.start + Math.max(
          0,
          Math.min(piece.length, (player.x - piece.x) * piece.tx + (player.y - piece.y) * piece.ty)
        );
      else {
        let angle = Math.atan2(player.x - piece.cx, player.y - piece.cy);
        while (angle < piece.a - 1e-9) angle += Math.PI * 2;
        angle = Math.max(piece.a, Math.min(piece.b, angle));
        pathS = piece.start + (angle - piece.a) * piece.r;
      }
      const surface = samplePath(path, pathS), speed2 = incoming.vx * surface.tx + incoming.vy * surface.ty;
      const candidate2 = {
        ...player,
        pathS,
        x: surface.x,
        y: surface.y,
        mode: "grounded",
        air: null,
        speed: speed2
      };
      const posture2 = [player.air.restorePosture, player.posture].find((posture3) => {
        candidate2.posture = posture3;
        return motionSupported(candidate2, surface) && motionPostureClear(candidate2, posture3);
      });
      if (!posture2) return false;
      Object.assign(player, candidate2, {
        posture: posture2,
        restTicks: 0,
        latestTransition: "landing",
        transitionCount: player.transitionCount + 1
      });
      player.lastLanding = {
        incoming,
        speed: speed2,
        tx: surface.tx,
        ty: surface.ty,
        normal: { x: surface.nx, y: surface.ny },
        anchor: { x: surface.x, y: surface.y }
      };
      resetExperimentalAirBoost(player);
      return true;
    }
    const restore = player.air.restorePosture;
    let x = hit.surface.x;
    if (player.posture === "standing") {
      x = player.x;
      for (let i = 0; i < 12; i++) {
        const s2 = sampleMotionExtension(player.scenario, x);
        const error = x + s2.nx * 24 - player.x;
        x -= error / (1 + 24 * s2.curvature);
        if (Math.abs(error) < 1e-9) break;
      }
    }
    const s = sampleMotionGround(player.scenario, x);
    if (!s) return false;
    const speed = incoming.vx * s.tx + incoming.vy * s.ty;
    const candidate = { ...player, mode: "grounded", x, y: s.y, speed, air: null };
    const posture = [restore, player.posture].find((posture2) => {
      candidate.posture = posture2;
      return motionPostureClear(candidate, posture2) && motionSupported(candidate, s);
    });
    if (!posture) return false;
    Object.assign(player, { mode: "grounded", x, y: s.y, speed, air: null, posture });
    player.restTicks = 0;
    player.latestTransition = "landing";
    player.transitionCount++;
    player.lastLanding = {
      incoming,
      speed,
      tx: s.tx,
      ty: s.ty,
      normal: { x: s.nx, y: s.ny },
      anchor: { x: s.x, y: s.y }
    };
    resetExperimentalAirBoost(player);
    return true;
  }
  __name(landMotion, "landMotion");
  function firstDeviceImpact(player, body, vx, vy, ax, ay, duration, time) {
    const fixture = motionFixtures[player.scenario];
    let hit = null;
    for (const platform of fixture.platforms || []) {
      if (platform.id === player.supportId || player.air?.separation?.id === platform.id && !player.air.separation.cleared)
        continue;
      const pose2 = experimentalPlatformPose(platform, time);
      const result = experimentalPlatformImpact(
        body,
        vx,
        vy,
        ax,
        ay,
        duration,
        pose2,
        motionTuning.skin
      );
      if (result && (!hit || result.time < hit.time)) {
        result.q.platform = experimentalPlatformPose(platform, time + result.time);
        result.q.canLand = result.q.ny < -0.999;
        hit = result;
      }
    }
    for (const spring of fixture.springs || []) {
      const face = experimentalSpringPose(spring, time, fixture);
      let result = experimentalDeviceImpact(
        body,
        vx - face.vx,
        vy - face.vy,
        ax,
        ay,
        duration,
        face,
        motionTuning.skin
      );
      if (result)
        Object.assign(result.q, {
          kind: "spring",
          id: spring.id,
          velocity: { vx: face.vx, vy: face.vy }
        });
      if (player.mode === "grounded") {
        const surface = motionSurface(player, time);
        const radius = body.circle ? body.hw : Math.abs(Math.cos(body.angle) * face.nx + Math.sin(body.angle) * face.ny) * body.hw + Math.abs(-Math.sin(body.angle) * face.nx + Math.cos(body.angle) * face.ny) * body.hh;
        const distance = (body.x - face.x) * face.nx + (body.y - face.y) * face.ny - radius;
        if (surface.nx * face.nx + surface.ny * face.ny > 0.999 && Math.abs(distance) < motionTuning.skin * 2) {
          const tangent = (body.x - face.x) * face.tx + (body.y - face.y) * face.ty;
          const along = (vx - face.vx) * face.tx + (vy - face.vy) * face.ty;
          const extent = body.circle ? 0 : body.hw;
          const lo = -face.half - extent, hi = face.half + extent;
          const t = tangent >= lo && tangent <= hi ? 0 : along ? (Math.sign(along) > 0 ? lo - tangent : hi - tangent) / along : Infinity;
          if (t >= 0 && t <= duration && (!result || t <= result.time + motionTuning.skin))
            result = {
              time: t,
              q: { distance: 0, nx: face.nx, ny: face.ny, kind: "spring", id: spring.id }
            };
        }
      }
      if (result && (!hit || result.time <= hit.time)) {
        result.q.face = experimentalSpringPose(spring, time + result.time, fixture);
        result.q.active = result.q.nx * face.nx + result.q.ny * face.ny > 0.999;
        hit = result;
      }
    }
    return hit;
  }
  __name(firstDeviceImpact, "firstDeviceImpact");
  function firstGroundDeviceImpact(player, candidate, duration, time) {
    const before = motionBody(player, player.posture, time), after = motionBody(candidate, candidate.posture, time + duration);
    return firstDeviceImpact(
      player,
      before,
      (after.x - before.x) / duration,
      (after.y - before.y) / duration,
      0,
      0,
      duration,
      time
    );
  }
  __name(firstGroundDeviceImpact, "firstGroundDeviceImpact");
  function launchExperimentalSpring(player, face, time) {
    const c = motionContact(player, time), vx = c.vx - face.vx, vy = c.vy - face.vy;
    const tangent = vx * face.tx + vy * face.ty;
    const normal = Math.max(experimentalDeviceTuning.springSpeed, vx * face.nx + vy * face.ny);
    const world = {
      vx: tangent * face.tx + normal * face.nx + face.vx,
      vy: tangent * face.ty + normal * face.ny + face.vy
    };
    player.boost.remaining = 0;
    player.boost.active = false;
    const center = c.center, restore = player.air?.restorePosture || player.posture;
    Object.assign(player, {
      mode: "airborne",
      speed: null,
      supportId: null,
      railId: null,
      dash: null,
      x: center.x,
      y: center.y,
      air: { ...world, restorePosture: restore, cutEligible: false, jumpLift: 0 },
      springLaunches: player.springLaunches + 1,
      latestTransition: "spring " + face.id,
      transitionCount: player.transitionCount + 1,
      lastSpring: { id: face.id, time, relativeTangent: tangent, normalSpeed: normal, world }
    });
  }
  __name(launchExperimentalSpring, "launchExperimentalSpring");
  function updateExperimentalDash(player, input, surface = null, canRoll = null) {
    const t = experimentalDeviceTuning, direction = Math.sign(input.direction || 0);
    if (player.mode !== "grounded" || player.railId) {
      player.dash = null;
      return false;
    }
    if (player.dash) {
      if (direction && direction !== player.dash.facing) {
        player.dash = null;
        player.latestTransition = "Spin Dash cancelled";
        return true;
      }
      if (!input.down) {
        const dash = player.dash, release2 = t.dashMin + (t.dashMax - t.dashMin) * dash.charge / t.dashChargeTicks;
        if (Math.abs(player.speed) < release2) player.speed = dash.facing * release2;
        player.dash = null;
        player.posture = "rolling";
        player.restTicks = 0;
        player.latestTransition = "Spin Dash release";
        return true;
      }
      if (input.jumpHeld || input.jumpPressed)
        player.dash.charge = Math.min(t.dashChargeTicks, player.dash.charge + 1);
      return true;
    }
    if (input.down && input.jumpPressed && Math.abs(player.speed) <= t.dashEntrySpeed && (surface || motionSurface(player)).ny < -0.7 && (canRoll ? canRoll() : motionPostureClear(player, "rolling"))) {
      player.dash = { charge: 1, facing: player.facing };
      player.posture = "rolling";
      player.restTicks = 0;
      player.latestTransition = "Spin Dash charging";
      return true;
    }
    return false;
  }
  __name(updateExperimentalDash, "updateExperimentalDash");
  function motionAirForces(player, direction, braking, dt) {
    const a = player.air;
    let target = a.vx;
    if (direction)
      target = braking ? Math.sign(a.vx) * Math.max(0, Math.abs(a.vx) - motionTuning.airBrake * dt) : a.vx + direction * Math.min(
        motionTuning.airAcceleration * dt,
        Math.max(0, motionTuning.airRange - direction * a.vx)
      );
    const bursting = player.boost.held && player.boost.remaining > 0;
    return {
      ax: bursting ? 0 : (target - a.vx) / dt,
      ay: bursting ? 0 : groundTuning.gravity,
      bursting
    };
  }
  __name(motionAirForces, "motionAirForces");
  function stepMotionPlayer(player, input = {}) {
    const direction = Math.sign(input.direction || 0);
    const startedGrounded = player.mode === "grounded";
    let burstAdvanced = false;
    const dashAction = updateExperimentalDash(player, input);
    let controls = null, airBraking = null;
    if (player.mode === "grounded") {
      controls = beginGroundTick(
        player,
        input,
        !player.railId && motionPostureClear(player, "rolling")
      );
      if (player.dash) controls = { direction: 0, rolling: false, braking: true };
      if (input.jumpPressed && !dashAction) releaseMotion(player, "jump", true);
    } else player.downHeld = !!input.down;
    beginExperimentalBoost(player, input, startedGrounded);
    if (player.air?.cutEligible && !input.jumpHeld) {
      if (player.air.vy < 0 && player.air.jumpLift > 0)
        player.air.vy += player.air.jumpLift * (1 - motionTuning.cutRatio);
      player.air.jumpLift = 0;
      player.air.cutEligible = false;
    }
    for (let sub = 0; sub < groundTuning.substeps && !player.boundary; sub++) {
      let remaining = 1 / groundTuning.substeps;
      const blocked = [];
      for (let iteration = 0; remaining > 1e-9; iteration++) {
        if (iteration >= 12) throw Error("PLAYTEST transition iteration did not converge");
        const clockTime = player.ticks + (sub + 1) / groundTuning.substeps - remaining;
        const fixture = motionFixtures[player.scenario];
        const untilTurn = Math.min(
          Infinity,
          ...(fixture.platforms || []).map((p2) => experimentalPlatformPose(p2, clockTime).nextTurn)
        );
        const slice = Math.min(remaining, untilTurn);
        if (player.mode === "grounded") {
          controls ??= {
            direction,
            rolling: player.posture === "rolling",
            braking: direction * player.speed < 0
          };
          const path = playtestPaths[player.scenario];
          const rail = motionRail(player);
          const current = motionSurface(player, clockTime);
          if (!current) {
            releaseMotion(player, "ledge", false, clockTime);
            continue;
          }
          if (!motionSupported(player, current)) {
            releaseMotion(player, path ? "lost support / traction" : "crest", false, clockTime);
            continue;
          }
          const groundBoost = experimentalGroundBoost(player, current);
          const freeBoost = !!(current.grindable && current.infiniteBoost);
          player.boost.active = groundBoost;
          const resourceSlice = groundBoost && !freeBoost ? Math.min(slice, player.boost.meter / experimentalBoostTuning.groundCost) : slice;
          const duration = path ? Math.min(
            resourceSlice,
            0.04 / Math.max(1e-9, Math.abs(player.speed) * Math.abs(current.curvature))
          ) : resourceSlice;
          const candidate = { ...player };
          advanceMotionGround(candidate, controls, duration, clockTime);
          const position = /* @__PURE__ */ __name((p2) => path ? p2.pathS : p2.x, "position");
          const carrier = motionSupport(player, clockTime);
          const span = rail ? [rail.x1, rail.x2] : carrier ? [carrier.x1, carrier.x2] : path ? [0, path.length] : motionSpans(player.scenario).find(([a, b]) => player.x >= a && player.x <= b);
          let event = null, blockNormal = null, blockedBox = null, time = duration;
          const beyond = position(candidate) - (carrier?.vx || 0) * duration < span[0] || position(candidate) - (carrier?.vx || 0) * duration > span[1];
          const supported = motionSupported(
            candidate,
            path ? sampleMotionPath(player.scenario, candidate.pathS) : motionSurface(candidate, clockTime + duration)
          );
          if (beyond || !supported) {
            let lo = 0, hi = duration;
            for (let n = 0; n < 30; n++) {
              const mid = (lo + hi) / 2, q = { ...player };
              advanceMotionGround(q, controls, mid, clockTime);
              if (position(q) - (carrier?.vx || 0) * mid < span[0] || position(q) - (carrier?.vx || 0) * mid > span[1] || !motionSupported(
                q,
                path ? sampleMotionPath(q.scenario, q.pathS) : motionSurface(q, clockTime + mid)
              ))
                hi = mid;
              else lo = mid;
            }
            time = hi;
            event = beyond ? path ? "path boundary" : "ledge" : path ? "lost support / traction" : "crest";
          }
          if (rail) {
            const target = player.speed >= 0 ? current.piece.x2 : current.piece.x1;
            if (target > rail.x1 && target < rail.x2 && (candidate.x - target) * Math.sign(player.speed) >= 0 && Math.abs(player.x - target) > 1e-8) {
              let lo = 0, hi = duration;
              for (let i = 0; i < 30; i++) {
                const mid = (lo + hi) / 2, q = { ...player };
                advanceMotionGround(q, controls, mid, clockTime);
                if ((q.x - target) * Math.sign(player.speed) >= 0) hi = mid;
                else lo = mid;
              }
              if (hi < time) {
                time = hi;
                event = "rail join";
              }
            }
          }
          for (const box of motionFixtures[player.scenario].boxes) {
            if (controls.groundBlocked && controls.blockedBox === box && (!carrier || carrier.vx * controls.blockedNormal.nx + carrier.vy * controls.blockedNormal.ny >= -1e-8))
              continue;
            const hit = sweepGroundBox(
              motionBody(player, player.posture, clockTime),
              motionBody(candidate, candidate.posture, clockTime + duration),
              box,
              duration
            );
            if (hit && hit.time <= time) {
              time = hit.time;
              event = "block";
              blockNormal = hit.q;
              blockedBox = box;
            }
          }
          const deviceHit = firstGroundDeviceImpact(
            player,
            candidate,
            duration,
            player.ticks + (sub + 1) / groundTuning.substeps - remaining
          );
          if (deviceHit && deviceHit.time <= time) {
            time = deviceHit.time;
            event = deviceHit.q;
          }
          if (time > 0)
            advanceMotionGround(
              player,
              controls,
              time,
              player.ticks + (sub + 1) / groundTuning.substeps - remaining
            );
          if (groundBoost && !freeBoost) {
            player.boost.meter = Math.max(
              0,
              player.boost.meter - experimentalBoostTuning.groundCost * time
            );
            if (player.boost.meter < 1e-10) {
              player.boost.meter = 0;
              player.boost.locked = true;
            }
          }
          remaining -= time;
          if (event === "rail join") continue;
          if (event && typeof event === "object") {
            if (event.kind === "spring" && event.active) {
              launchExperimentalSpring(player, event.face, clockTime + time);
              controls = null;
            } else {
              player.speed = 0;
              player.latestTransition = "device casing block";
              const relativeInto = ((carrier?.vx || 0) - (event.velocity?.vx || 0)) * event.nx + ((carrier?.vy || 0) - (event.velocity?.vy || 0)) * event.ny;
              if (relativeInto < -1e-8) player.boundary = "moving device blocked clearance reset";
              if (!player.boundary)
                controls = {
                  direction: 0,
                  rolling: player.posture === "rolling",
                  braking: false,
                  groundBlocked: true
                };
              else remaining = 0;
            }
          } else if (event === "block") {
            player.speed = 0;
            player.latestTransition = "wall / clearance block";
            if (carrier && carrier.vx * blockNormal.nx + carrier.vy * blockNormal.ny < -1e-8)
              player.boundary = "moving support blocked clearance reset";
            if (!player.boundary)
              controls = {
                direction: 0,
                rolling: player.posture === "rolling",
                braking: false,
                groundBlocked: true,
                blockedBox,
                blockedNormal: blockNormal
              };
            else remaining = 0;
          } else if (event === "path boundary") {
            player.boundary = "test path boundary reset";
            remaining = 0;
          } else if (event)
            releaseMotion(
              player,
              rail && event === "ledge" ? "rail end" : event,
              false,
              clockTime + time
            );
        } else {
          const a = player.air;
          airBraking ??= direction * a.vx < 0;
          let { ax, ay, bursting } = motionAirForces(player, direction, airBraking, slice);
          if (bursting) {
            burstAdvanced = true;
            player.boost.active = true;
          }
          for (const n2 of blocked) {
            const into2 = ax * n2.nx + ay * n2.ny;
            if (into2 < 0) {
              ax -= into2 * n2.nx;
              ay -= into2 * n2.ny;
            }
          }
          const hit = firstAirImpact(player, ax, ay, slice, clockTime);
          if (!hit) {
            moveAirTime(player, ax, ay, slice, clockTime);
            remaining -= slice;
            continue;
          }
          moveAirTime(player, ax, ay, hit.time, clockTime);
          remaining -= hit.time;
          if (hit.q.kind === "spring" && hit.q.active) {
            launchExperimentalSpring(player, hit.q.face, clockTime + hit.time);
            airBraking = null;
            continue;
          }
          const n = hit.q, incoming = { vx: a.vx, vy: a.vy }, into = (a.vx - (n.velocity?.vx || 0)) * n.nx + (a.vy - (n.velocity?.vy || 0)) * n.ny;
          if (into < 0) {
            a.vx -= into * n.nx;
            a.vy -= into * n.ny;
          }
          if (["floor", "platform", "rail"].includes(n.kind) && n.canLand) {
            if (landMotion(player, n, incoming, clockTime + hit.time)) {
              controls = null;
              continue;
            }
            a.separation = { id: n.id, cleared: false };
            player.latestTransition = "unsupported floor impact";
          } else {
            blocked.push(n);
            player.latestTransition = n.ny > 0.5 ? "ceiling impact" : "wall impact";
            if (n.ny > 0.5) {
              a.jumpLift = 0;
              a.cutEligible = false;
            }
          }
          player.x += n.nx * Math.max(0, motionTuning.skin - n.distance);
          player.y += n.ny * Math.max(0, motionTuning.skin - n.distance);
        }
      }
    }
    if (burstAdvanced && player.boost.remaining > 0) player.boost.remaining--;
    if (player.mode === "grounded")
      finishGroundTick(
        player,
        controls || { rolling: player.posture === "rolling" },
        playtestPaths[player.scenario] ? sampleMotionPath : (scenario, x) => ({ ...motionSurface(player, player.ticks + 1), x }),
        motionPostureClear(player, "standing"),
        motionBounds,
        !!playtestPaths[player.scenario]
      );
    else {
      player.ticks++;
      if (Math.abs(player.air.vx) > 0.02) player.facing = Math.sign(player.air.vx);
    }
    const view = motionContact(player);
    if (!Number.isFinite(view.center.x) || !Number.isFinite(view.center.y) || !Number.isFinite(view.vx) || !Number.isFinite(view.vy) || Math.hypot(view.vx, view.vy) > groundTuning.safetySpeed)
      player.boundary = "numerical safety reset";
    else if (Math.abs(view.center.x) > motionBounds(player.scenario) || view.center.y > 1350)
      player.boundary = "test boundary / fall recovery reset";
  }
  __name(stepMotionPlayer, "stepMotionPlayer");
  function initializeRuntimeModule7() {
    motionTuning = Object.freeze({
      revision: "RAIL-BOOST-1 / DEVICES-2 / PATH-1 / AIR-2 / GROUND-5",
      steepGripSpeed: 2.5,
      jumpImpulse: 10.5,
      cutRatio: 0.4,
      airAcceleration: 0.08,
      airBrake: 0.16,
      airRange: 14,
      skin: 1e-5,
      separation: 2e-3
    });
    motionFixtures = Object.freeze({
      ...Object.fromEntries(
        Object.entries(playtestPaths).map(([id, path]) => [
          id,
          { bounds: 1300, spawn: id.endsWith("reverse") ? path.length - 140 : 140, boxes: [], path }
        ])
      ),
      rails: {
        bounds: 2e3,
        spawn: -780,
        boxes: [],
        rails: [
          createExperimentalRail(),
          {
            id: "gap-rail",
            x1: 1e3,
            x2: 1400,
            pieces: [
              {
                id: "gap-rail-piece",
                x1: 1e3,
                x2: 1400,
                y: 300,
                c: [300, 0, 0, 0],
                grindable: true,
                infiniteBoost: false
              }
            ]
          }
        ]
      },
      "rails-empty": {
        bounds: 2e3,
        spawn: -780,
        boxes: [],
        meter: 0,
        rails: [createExperimentalRail()]
      },
      springs: {
        bounds: 1800,
        spawn: -160,
        boxes: [],
        springs: [
          { id: "up-spring", x: 120, y: 376, angle: 0 },
          { id: "right-spring", x: 450, y: 300, angle: Math.PI / 2 },
          { id: "diagonal-spring", x: 750, y: 360, angle: Math.PI / 4 },
          { id: "left-spring", x: -650, y: 300, angle: -Math.PI / 2 }
        ]
      },
      platforms: {
        bounds: 1800,
        spawn: -280,
        boxes: [],
        platforms: [
          {
            id: "ferry",
            x: 0,
            y: 280,
            width: 180,
            depth: 20,
            motion: { axis: "x", amplitude: 120, period: 240 }
          },
          {
            id: "elevator",
            x: 500,
            y: 280,
            width: 180,
            depth: 20,
            motion: { axis: "y", amplitude: 70, period: 180 }
          }
        ]
      },
      "moving-spring": {
        bounds: 1800,
        spawn: -280,
        boxes: [],
        platforms: [
          {
            id: "spring-ferry",
            x: 0,
            y: 280,
            width: 180,
            depth: 20,
            motion: { axis: "x", amplitude: 120, period: 240 }
          }
        ],
        springs: [{ id: "moving-cap", platform: "spring-ferry", x: 0, y: -24, angle: 0 }]
      },
      flat: { bounds: 5e3, spawn: 0, boxes: [] },
      valley: { bounds: 2400, spawn: 0, boxes: [] },
      crest: { bounds: 1800, spawn: -600, boxes: [] },
      gap: {
        bounds: 1800,
        spawn: -250,
        boxes: [
          { id: "gap-left-face", x1: 60, x2: 100, y1: 400, y2: 1500 },
          { id: "gap-right-face", x1: 300, x2: 340, y1: 400, y2: 1500 }
        ]
      },
      wall: { bounds: 1800, spawn: 0, boxes: [{ id: "wall", x1: 350, x2: 390, y1: 150, y2: 400 }] },
      ceiling: {
        bounds: 1800,
        spawn: 0,
        boxes: [{ id: "ceiling", x1: 200, x2: 420, y1: 320, y2: 357 }]
      }
    });
  }
  __name(initializeRuntimeModule7, "initializeRuntimeModule");
  function getRuntimeBindings7() {
    return {};
  }
  __name(getRuntimeBindings7, "getRuntimeBindings");

  // src/surface-collision.js
  var surface_collision_exports = {};
  __export(surface_collision_exports, {
    active: () => active,
    applySurfaceMotion: () => applySurfaceMotion,
    bodyHeight: () => bodyHeight,
    canStand: () => canStand,
    feet: () => feet,
    getRuntimeBindings: () => getRuntimeBindings24,
    groundSlopeForce: () => groundSlopeForce,
    initializeRuntimeModule: () => initializeRuntimeModule24,
    integrateSurfaceStep: () => integrateSurfaceStep,
    land: () => land,
    leaveSurface: () => leaveSurface,
    loopPhysics: () => loopPhysics,
    moveAndResolveSurfaces: () => moveAndResolveSurfaces,
    moveOrientedSurface: () => moveOrientedSurface,
    pose: () => pose,
    recordSurfaceLanding: () => recordSurfaceLanding,
    resetPlatforms: () => resetPlatforms,
    resolveHazards: () => resolveHazards,
    spikeContact: () => spikeContact,
    staticSurfacePoses: () => staticSurfacePoses,
    surfaceBasis: () => surfaceBasis,
    surfaceNormalReaction: () => surfaceNormalReaction,
    surfaceOverlaps: () => surfaceOverlaps,
    surfaceTravelSpeed: () => surfaceTravelSpeed,
    surfaceVelocity: () => surfaceVelocity,
    sweptBoxTime: () => sweptBoxTime,
    sweptCircleTime: () => sweptCircleTime,
    sweptOrientedContact: () => sweptOrientedContact,
    topAt: () => topAt,
    yOn: () => yOn
  });

  // src/blimp-route.js
  var blimp_route_exports = {};
  __export(blimp_route_exports, {
    addBlimpRoute: () => addBlimpRoute,
    blimpTextures: () => blimpTextures,
    drawBlimpRoute: () => drawBlimpRoute,
    getRuntimeBindings: () => getRuntimeBindings10,
    initializeRuntimeModule: () => initializeRuntimeModule10,
    invalidateBlimpEntry: () => invalidateBlimpEntry,
    onBlimpLanding: () => onBlimpLanding,
    qualifyingBlimpEntry: () => qualifyingBlimpEntry,
    recordBlimpDeparture: () => recordBlimpDeparture,
    recordBlimpJump: () => recordBlimpJump,
    resetBlimpRoute: () => resetBlimpRoute
  });

  // src/boost-rules.js
  var boost_rules_exports = {};
  __export(boost_rules_exports, {
    airDevicePose: () => airDevicePose,
    collectBoostMonitors: () => collectBoostMonitors,
    configureBoostMonitors: () => configureBoostMonitors,
    freeRailBoost: () => freeRailBoost,
    getRuntimeBindings: () => getRuntimeBindings8,
    initializeRuntimeModule: () => initializeRuntimeModule8,
    measurementSpeed: () => measurementSpeed,
    monitorPose: () => monitorPose,
    resetBoostMonitors: () => resetBoostMonitors,
    surfaceById: () => surfaceById,
    updateBoostState: () => updateBoostState
  });
  function freeRailBoost() {
    return !!(p.ground && p.surface?.grindable && p.surface.infiniteBoost);
  }
  __name(freeRailBoost, "freeRailBoost");
  function updateBoostState(want) {
    if (!want) {
      p.boostLocked = false;
      p.groundBoostHeld = false;
      p.airBoostFrames = 0;
    }
    if (p.ground) {
      p.airBoostUsed = false;
      p.airBoostFrames = 0;
      p.groundBoostHeld = want;
    }
    const free = freeRailBoost(), eligible = !state.charge && !p.hurt && !p.wrongRouteDrop && !p.bubbleSlam;
    if (p.airBoostRequested && want && !p.ground && !p.airBoostUsed && state.boost >= BOOST_MAX / 4 && !p.boostLocked && eligible) {
      state.boost -= BOOST_MAX / 4;
      invalidateBlimpEntry();
      p.airBoostUsed = true;
      p.airBoostFrames = 18;
      p.groundBoostHeld = false;
      p.scriptedLaunch = false;
      p.airSpeedLimit = null;
      p.airLaunchUntil = 0;
      p.vx = p.face * Math.max(23, p.vx * p.face);
      p.vy = 0;
      p.jumpReleaseVy = null;
      p.jumpAttack = true;
    }
    p.airBoostRequested = false;
    p.boosting = !!(want && (p.ground ? free || state.boost > 0 && !p.boostLocked : p.airBoostFrames > 0) && eligible);
    if (p.boosting && p.airBoostFrames > 0) {
      p.vy = 0;
      p.airBoostFrames--;
      p.airBoostActive = true;
    } else p.airBoostActive = false;
    if (p.boosting && p.ground && !free) {
      state.boost = Math.max(0, state.boost - 0.5);
      if (!state.boost) p.boostLocked = true;
    }
    return p.boosting;
  }
  __name(updateBoostState, "updateBoostState");
  function measurementSpeed() {
    if (p.loop) return Math.abs(p.loop.speed);
    if (p.ground && p.surface?.contactMode === "oriented") return Math.abs(p.contactSpeed);
    if (p.ground && p.surface) return Math.abs(p.vx) * Math.hypot(1, pose(p.surface).slope);
    return Math.hypot(p.vx, p.vy);
  }
  __name(measurementSpeed, "measurementSpeed");
  function configureBoostMonitors(l) {
    l.monitors ??= [];
    l.surfaceIndex = new Map(l.surfaces.map((s) => [s.id, s]));
    if (l.act !== 2) {
      l.buildings ??= [];
      for (const s of l.surfaces) {
        s.cityType = s.y1 !== s.y2 ? "concrete-ramp" : s.kind === "main" ? "rooftop" : s.kind === "moving" ? "freight-lift" : s.kind === "crumble" ? "broken-bridge" : "fire-escape";
        if (s.kind === "main") {
          s.roof = true;
          l.buildings.push({
            x: s.x1,
            y: Math.min(s.y1, s.y2) + 26,
            w: s.x2 - s.x1,
            h: 1e3,
            seed: Math.floor(s.x1 / 1800),
            roofId: s.id
          });
        }
      }
    }
    const shield = l.monitors.find((m) => m.id === "mid-secret-monitor" && !m.required);
    if (shield) shield.item = "bubble";
    const add = /* @__PURE__ */ __name((id, s, x, required = false) => {
      if (!s || l.monitors.some((m) => m.id === id)) return;
      l.monitors.push({
        id,
        x,
        y: s.y1 + (x - s.x1) * (s.y2 - s.y1) / (s.x2 - s.x1),
        surfaceId: s.id,
        broken: false,
        required
      });
    }, "add");
    for (const h of l.hazards.filter((h2) => h2.type === "breakable" && !h2.secret)) {
      const s = l.surfaces.filter(
        (s2) => !s2.sealedBy && s2.x1 < h.x && s2.x2 >= h.x - 500 && Math.abs((s2.y1 + s2.y2) / 2 - h.floor) < 200
      ).sort((a, b) => b.x2 - a.x2)[0];
      if (s)
        add("boost-before-" + h.id, s, Math.max(s.x1 + 45, Math.min(s.x2 - 60, h.x - 240)), true);
    }
    for (const s of l.surfaces.filter((s2) => s2.routeType === "boost" && s2.entrySpeed)) {
      const approach = l.surfaces.filter(
        (a) => !a.sealedBy && a.kind === "main" && a.x1 < s.x1 && a.x2 >= s.x1 - 700 && Math.abs(a.y2 - s.y1) < 400
      ).sort((a, b) => b.x2 - a.x2)[0];
      if (approach)
        add(
          "boost-route-" + s.id,
          approach,
          Math.max(approach.x1 + 55, Math.min(approach.x2 - 60, s.x1 - 200)),
          true
        );
    }
    for (const s of l.surfaces) if (s.grindable && s.routeType === "boost") s.infiniteBoost = true;
    return l;
  }
  __name(configureBoostMonitors, "configureBoostMonitors");
  function surfaceById(id) {
    return state.level.surfaceIndex?.get(id) || state.level.surfaces.find((s) => s.id === id);
  }
  __name(surfaceById, "surfaceById");
  function monitorPose(m) {
    const s = m.surfaceId && surfaceById(m.surfaceId);
    if (!s) return m;
    const q = pose(s);
    return { ...m, x: m.x + q.x1 - s.x1, y: yOn(s, m.x + q.x1 - s.x1) };
  }
  __name(monitorPose, "monitorPose");
  function collectBoostMonitors(oldX = p.x, oldY = p.y) {
    for (const m of state.level.monitors || []) {
      if (m.broken) continue;
      const q = monitorPose(m);
      const height = bodyHeight();
      if (sweptBoxTime(oldX, oldY, p.x, p.y, q.x - 34, q.y - 78, q.x + 34, q.y - 20 + height) === null)
        continue;
      const attacking = p.boosting || p.rolling && Math.abs(p.vx) > 2 || !p.ground && p.jumpAttack;
      if (!attacking) continue;
      m.broken = true;
      m.brokenAt = state.runFrames;
      if (m.item === "bubble") {
        p.shield = "bubble";
        p.airRemaining = 1800;
      } else if (m.item === "life") {
        state.lives++;
      } else {
        state.boost = BOOST_MAX;
        p.boostLocked = false;
      }
      state.score += 100;
      state.stats.monitors = (state.stats.monitors || 0) + 1;
      sparks(q.x, q.y - 28, 12, "#9deaff");
      if (typeof gameSound === "function") gameSound("monitor");
    }
  }
  __name(collectBoostMonitors, "collectBoostMonitors");
  function resetBoostMonitors() {
    for (const m of state.level.monitors || []) m.broken = false;
  }
  __name(resetBoostMonitors, "resetBoostMonitors");
  function airDevicePose(d, t = state.runFrames) {
    const s = d.surfaceId && surfaceById(d.surfaceId);
    if (!s) return d;
    const q = pose(s, t);
    return { ...d, x: d.x + q.x1 - s.x1, y: q.y1 + (d.x - s.x1) * q.slope };
  }
  __name(airDevicePose, "airDevicePose");
  function initializeRuntimeModule8() {
  }
  __name(initializeRuntimeModule8, "initializeRuntimeModule");
  function getRuntimeBindings8() {
    return {
      freeRailBoost: {
        get: /* @__PURE__ */ __name(() => freeRailBoost, "get"),
        set: /* @__PURE__ */ __name((value) => {
          freeRailBoost = value;
        }, "set")
      },
      updateBoostState: {
        get: /* @__PURE__ */ __name(() => updateBoostState, "get"),
        set: /* @__PURE__ */ __name((value) => {
          updateBoostState = value;
        }, "set")
      },
      measurementSpeed: {
        get: /* @__PURE__ */ __name(() => measurementSpeed, "get"),
        set: /* @__PURE__ */ __name((value) => {
          measurementSpeed = value;
        }, "set")
      },
      configureBoostMonitors: {
        get: /* @__PURE__ */ __name(() => configureBoostMonitors, "get"),
        set: /* @__PURE__ */ __name((value) => {
          configureBoostMonitors = value;
        }, "set")
      },
      surfaceById: {
        get: /* @__PURE__ */ __name(() => surfaceById, "get"),
        set: /* @__PURE__ */ __name((value) => {
          surfaceById = value;
        }, "set")
      },
      monitorPose: {
        get: /* @__PURE__ */ __name(() => monitorPose, "get"),
        set: /* @__PURE__ */ __name((value) => {
          monitorPose = value;
        }, "set")
      },
      collectBoostMonitors: {
        get: /* @__PURE__ */ __name(() => collectBoostMonitors, "get"),
        set: /* @__PURE__ */ __name((value) => {
          collectBoostMonitors = value;
        }, "set")
      },
      resetBoostMonitors: {
        get: /* @__PURE__ */ __name(() => resetBoostMonitors, "get"),
        set: /* @__PURE__ */ __name((value) => {
          resetBoostMonitors = value;
        }, "set")
      },
      airDevicePose: {
        get: /* @__PURE__ */ __name(() => airDevicePose, "get"),
        set: /* @__PURE__ */ __name((value) => {
          airDevicePose = value;
        }, "set")
      }
    };
  }
  __name(getRuntimeBindings8, "getRuntimeBindings");

  // src/pixel-world.js
  var pixel_world_exports = {};
  __export(pixel_world_exports, {
    cityDeckTextures: () => cityDeckTextures,
    cityFacade: () => cityFacade,
    cityFacadeTiles: () => cityFacadeTiles,
    cityLoopTextures: () => cityLoopTextures,
    cityMaterials: () => cityMaterials,
    cityPillar: () => cityPillar,
    cityPillarFrameSpans: () => cityPillarFrameSpans,
    cityPillarTextures: () => cityPillarTextures,
    cityPixelLine: () => cityPixelLine,
    cityPixelOval: () => cityPixelOval,
    cityPixelRect: () => cityPixelRect,
    drawCityBreakable: () => drawCityBreakable,
    drawCityCutaways: () => drawCityCutaways,
    drawPixelCityDeck: () => drawPixelCityDeck,
    drawPixelCityLoop: () => drawPixelCityLoop,
    drawPixelCityStructures: () => drawPixelCityStructures,
    drawPixelRing: () => drawPixelRing,
    getRuntimeBindings: () => getRuntimeBindings9,
    initializeRuntimeModule: () => initializeRuntimeModule9,
    paintCityFacade: () => paintCityFacade,
    paintCityPillar: () => paintCityPillar,
    paintPixelCityDeck: () => paintPixelCityDeck,
    paintPixelCityLoop: () => paintPixelCityLoop,
    paintPixelRing: () => paintPixelRing,
    pixelRingTextures: () => pixelRingTextures,
    ringPalette: () => ringPalette,
    ringPixels: () => ringPixels
  });
  var cityMaterials;
  var cityFacadeTiles;
  var cityPillarTextures;
  var cityPillarFrameSpans;
  var cityDeckTextures;
  var cityLoopTextures;
  var ringPixels;
  var ringPalette;
  var pixelRingTextures;
  function cityPixelRect(x, y, w, h, color) {
    if (w <= 0 || h <= 0) return;
    const dc = state.cityRasterContext || ctx;
    dc.fillStyle = color;
    dc.fillRect(
      Math.floor(x / 2) * 2,
      Math.floor(y / 2) * 2,
      Math.ceil(w / 2) * 2,
      Math.ceil(h / 2) * 2
    );
  }
  __name(cityPixelRect, "cityPixelRect");
  function cityPixelLine(x1, y1, x2, y2, color, width = 2) {
    const steps = Math.max(1, Math.ceil(Math.max(Math.abs(x2 - x1), Math.abs(y2 - y1)) / 2));
    for (let i = 0; i <= steps; i++) {
      const t = i / steps;
      cityPixelRect(
        x1 + (x2 - x1) * t - width / 2,
        y1 + (y2 - y1) * t - width / 2,
        width,
        width,
        color
      );
    }
  }
  __name(cityPixelLine, "cityPixelLine");
  function cityPixelOval(x, y, rx, ry, color) {
    for (let yy = -Math.ceil(ry / 2); yy <= ry / 2; yy++) {
      const dy = yy * 2, w = Math.floor(rx * Math.sqrt(Math.max(0, 1 - dy * dy / (ry * ry))) / 2) * 2;
      cityPixelRect(x - w, y + dy, w * 2, 2, color);
    }
  }
  __name(cityPixelOval, "cityPixelOval");
  function cityFacade(left, right, roofY, seed = 0, exposed = false, landmark = null) {
    left = Math.floor(left / 2) * 2;
    right = Math.floor(right / 2) * 2;
    roofY = Math.floor(roofY / 2) * 2;
    if (!document.createElement) return paintCityFacade(left, right, roofY, seed, exposed, landmark);
    const x1 = Math.max(left, state.cam - 40), x2 = Math.min(right, state.cam + W / state.zoom + 40), y1 = Math.max(roofY, state.camY - 40), y2 = state.camY + H / state.zoom + 80;
    if (x2 <= x1 || y2 <= y1) return;
    for (let y = Math.floor(y1 / 256) * 256; y < y2; y += 256)
      for (let x = Math.floor(x1 / 256) * 256; x < x2; x += 256) {
        const key = [left, right, roofY, seed, exposed, landmark, x, y].join("/");
        let texture = cityFacadeTiles.get(key);
        if (!texture) {
          texture = document.createElement("canvas");
          texture.width = 128;
          texture.height = 128;
          const dc = texture.getContext("2d");
          dc.scale(0.5, 0.5);
          dc.translate(-x, -y);
          state.cityRasterContext = dc;
          try {
            paintCityFacade(left, right, roofY, seed, exposed, landmark, {
              left: x,
              right: x + 256,
              top: y,
              bottom: y + 256
            });
          } finally {
            state.cityRasterContext = null;
          }
          if (cityFacadeTiles.size >= 128)
            cityFacadeTiles.delete(cityFacadeTiles.keys().next().value);
          cityFacadeTiles.set(key, texture);
        }
        ctx.drawImage(texture, x, y, 256, 256);
      }
  }
  __name(cityFacade, "cityFacade");
  function paintCityFacade(left, right, roofY, seed = 0, exposed = false, landmark = null, clip) {
    left = Math.floor(left / 2) * 2;
    right = Math.floor(right / 2) * 2;
    roofY = Math.floor(roofY / 2) * 2;
    const limitLeft = clip?.left ?? state.cam - 40, limitRight = clip?.right ?? state.cam + W / state.zoom + 40, limitTop = clip?.top ?? state.camY - 40, limitBottom = clip?.bottom ?? state.camY + H / state.zoom + 80;
    const p2 = cityMaterials[Math.abs(seed) % 4], x1 = Math.max(left, limitLeft), x2 = Math.min(right, limitRight), top = Math.max(roofY, limitTop), bottom = limitBottom;
    if (x2 <= x1 || bottom <= top) return;
    cityPixelRect(x1, top, x2 - x1, bottom - top, p2.body);
    for (let yy = Math.ceil(top / 32) * 32; yy < bottom; yy += 32) {
      cityPixelRect(x1, yy, x2 - x1, 2, p2.shade);
      for (let xx = Math.ceil((x1 - Math.floor(yy / 32) % 2 * 24) / 48) * 48 + Math.floor(yy / 32) % 2 * 24; xx < x2; xx += 48) {
        const k = Math.abs(Math.floor(xx / 48) * 7 + Math.floor(yy / 32) * 13 + seed) % 7;
        cityPixelRect(xx + 10, yy + 12, 6, 2, k === 0 ? p2.edge : p2.light);
        cityPixelRect(xx + 29, yy + 23, 8, 2, p2.shade);
      }
    }
    const width = right - left, bay = exposed ? 150 : 110, start2 = Math.max(0, Math.floor((x1 - left - 12) / bay));
    for (let c = start2; c * bay + left + 12 < x2; c++) {
      const x = left + 12 + c * bay, wide = Math.min(bay - 18, right - x - 12);
      if (wide < 16) continue;
      cityPixelRect(x, top, wide, bottom - top, p2.shade);
      cityPixelRect(x - 4, top, 4, bottom - top, p2.light);
      cityPixelRect(x + wide, top, 4, bottom - top, p2.light);
      for (let y = roofY + 24 + Math.max(0, Math.floor((top - roofY - 24) / 96)) * 96; y < bottom; y += 96) {
        const key = Math.abs(c * 17 + Math.floor((y - roofY) / 64) * 11 + seed) % 13;
        cityPixelRect(x, y - 4, wide + 4, 6, p2.light);
        cityPixelRect(x + 4, y + 5, wide - 8, 40, "#11192c");
        if (exposed && key % 3 === 0) {
          cityPixelLine(x + 6, y + 8, x + wide - 8, y + 43, p2.light, 4);
          cityPixelRect(x + 8, y + 10, 10, 4, p2.edge);
        } else {
          for (let j = 0; j < 2; j++) {
            const wx = x + 8 + j * (wide - 14) / 2, ww = Math.max(8, (wide - 26) / 2), lit = key % 5 !== 0;
            cityPixelRect(wx, y + 8, ww, 30, lit ? key % 2 ? p2.window : p2.cool : "#22243a");
            if (lit) {
              cityPixelRect(wx, y + 8, ww, 4, p2.glow);
              cityPixelRect(wx + 2, y + 14, 2, 18, p2.light);
              cityPixelRect(wx + ww - 4, y + 22, 4, 16, p2.shade);
              cityPixelRect(wx + 4, y + 23, ww - 8, 2, p2.body);
            }
          }
        }
        if (key === 0 && seed > 35) {
          cityPixelRect(x + wide / 2, y + 30, 10, 12, "#ff742e");
          cityPixelRect(x + wide / 2 + 2, y + 25, 6, 12, "#ffb747");
          cityPixelRect(x + wide / 2 + 4, y + 32, 2, 8, "#ffe39c");
        }
      }
    }
    if (left >= limitLeft) {
      cityPixelRect(left, top, 6, bottom - top, p2.edge);
      cityPixelRect(left + 6, top, 8, bottom - top, p2.light);
    }
    if (right < limitRight) {
      cityPixelRect(right - 18, top, 14, bottom - top, p2.shade);
      cityPixelRect(right - 4, top, 4, bottom - top, "#0d1428");
    }
    if (landmark === "BROADCAST RELAY") {
      const x = right - 66;
      for (let y = roofY + 34 + Math.max(0, Math.floor((top - roofY - 154) / 120)) * 120; y < bottom + 8; y += 120) {
        cityPixelRect(x, y, 6, 98, p2.edge);
        cityPixelLine(x, y + 30, x - 30, y + 45, p2.light, 6);
        cityPixelOval(x - 34, y + 45, 24, 12, p2.edge);
        cityPixelOval(x - 34, y + 43, 18, 6, p2.shade);
        cityPixelRect(x - 36, y + 30, 4, 14, p2.cool);
      }
    } else if (landmark === "NEON WORKS") {
      const x = left + 24;
      cityPixelRect(x, top, 54, bottom - top, p2.shade);
      for (let y = roofY + 34 + Math.max(0, Math.floor((top - roofY) / 96)) * 96; y < bottom; y += 96) {
        cityPixelRect(x + 8, y, 36, 56, p2.body);
        cityPixelLine(x + 17, y + 8, x + 32, y + 22, "#c67baf", 4);
        cityPixelLine(x + 32, y + 22, x + 17, y + 36, "#c67baf", 4);
        cityPixelRect(x + 8, y + 48, 32, 2, "#6db1ba");
      }
    } else if (landmark === "WEST TOWER") {
      const x = left + width * 0.45;
      cityPixelRect(x, top, 46, bottom - top, "#11182b");
      for (let y = Math.floor((top - 96) / 96) * 96; y < bottom + 8; y += 96) {
        cityPixelRect(x - 12, y + 30, 58, 28, p2.shade);
        cityPixelLine(x - 30, y, x + 45, y + 70, p2.edge, 6);
      }
    } else if (landmark === "EAST WORKSITE") {
      const x = right - 58;
      cityPixelRect(x, top, 24, bottom - top, "#6a554a");
      for (let y = Math.floor((top - 64) / 64) * 64; y < bottom + 8; y += 64) {
        cityPixelLine(x, y, x + 22, y + 54, "#c59562", 4);
        cityPixelLine(x + 22, y, x, y + 54, "#a77958", 4);
      }
    } else if (landmark === "HELIPAD ACCESS") {
      const x = right - 95;
      cityPixelRect(x, top, 54, bottom - top, "#343d4f");
      for (let y = Math.floor((top - 48) / 48) * 48; y < bottom; y += 48) {
        cityPixelRect(x + 4, y, 46, 6, p2.edge);
        cityPixelRect(x + 12, y + 10, 26, 24, p2.shade);
      }
    }
  }
  __name(paintCityFacade, "paintCityFacade");
  function paintCityPillar(x, y, bottom, steel = false) {
    const p2 = cityMaterials[steel ? 2 : 0];
    cityPixelRect(x, y, steel ? 16 : 30, bottom - y, p2.shade);
    cityPixelRect(x, y, steel ? 4 : 6, bottom - y, p2.edge);
    cityPixelRect(x + 6, y, steel ? 6 : 16, bottom - y, p2.body);
    for (let yy = Math.ceil(y / 52) * 52; yy < bottom; yy += 52) {
      cityPixelRect(x - 4, yy, steel ? 24 : 38, 6, p2.light);
      if (steel) cityPixelLine(x + 4, yy + 8, x + 12, yy + 45, p2.light, 2);
    }
  }
  __name(paintCityPillar, "paintCityPillar");
  function cityPillar(x, y, bottom, steel = false) {
    if (bottom <= y) return;
    if (!document.createElement) return paintCityPillar(x, y, bottom, steel);
    let texture = cityPillarTextures.get(steel);
    if (!texture) {
      texture = document.createElement("canvas");
      texture.width = (steel ? 24 : 38) / 2;
      texture.height = 520;
      const dc = texture.getContext("2d");
      dc.scale(0.5, 0.5);
      state.cityRasterContext = dc;
      try {
        paintCityPillar(4, 0, 1040, steel);
      } finally {
        state.cityRasterContext = null;
      }
      cityPillarTextures.set(steel, texture);
    }
    const top = Math.max(Math.floor(y / 2) * 2, Math.floor((state.camY - 40) / 2) * 2);
    let end = Math.min(
      Math.ceil(bottom / 2) * 2,
      Math.ceil((state.camY + H / state.zoom + 80) / 2) * 2
    );
    if (state.cityPillarPass) {
      const key = Math.floor(x / 2) + "/" + steel, covered = cityPillarFrameSpans.get(key);
      if (covered !== void 0) end = Math.min(end, covered);
      if (end <= top) return;
      cityPillarFrameSpans.set(key, top);
    }
    for (let yy = Math.floor(top / 1040) * 1040; yy < end; yy += 1040) {
      const cut = Math.max(0, top - yy), height = Math.min(1040 - cut, end - yy - cut);
      if (height > 0)
        ctx.drawImage(
          texture,
          0,
          cut / 2,
          texture.width,
          height / 2,
          Math.floor((x - 4) / 2) * 2,
          yy + cut,
          texture.width * 2,
          height
        );
    }
  }
  __name(cityPillar, "cityPillar");
  function drawPixelCityStructures() {
    cityPillarFrameSpans.clear();
    state.cityPillarPass = true;
    try {
      for (const b of state.level.buildings) {
        if (b.scenery) continue;
        const roof = b.roofId && surfaceById(b.roofId), top = roof ? Math.min(roof.y1, roof.y2) + 26 : b.y;
        if (b.x + b.w < state.cam - 40 || b.x > state.cam + W / state.zoom + 40)
          continue;
        ctx.save();
        ctx.globalAlpha = b.interiorOpacity ?? 1;
        if (roof && roof.y1 !== roof.y2) {
          const left = Math.max(b.x, state.cam - 40), right = Math.min(b.x + b.w, state.cam + W / state.zoom + 40), bottom = state.camY + H / state.zoom + 80;
          ctx.beginPath();
          ctx.moveTo(left, bottom);
          for (let x = Math.floor(left / 2) * 2; x <= right; x += 2) {
            const y = Math.floor((yOn(roof, x) + 26) / 2) * 2;
            ctx.lineTo(x, y);
            ctx.lineTo(x + 2, y);
          }
          ctx.lineTo(right, bottom);
          ctx.closePath();
          ctx.clip();
        }
        cityFacade(b.x, b.x + b.w, top, b.seed, !!b.exposed, b.landmark);
        ctx.restore();
      }
      for (const s of state.level.surfaces) {
        if (s.cityType === "blimp" || s.cityType === "blimp-anchor" || s.blimpRail || !active(s) || s.wallCap || s.secretDepth > 4 && !state.level.middleSection?.secretRevealed)
          continue;
        const q = pose(s), left = Math.max(q.x1, state.cam - 40), right = Math.min(q.x2, state.cam + W / state.zoom + 40), type = s.cityType, bottom = state.camY + H / state.zoom + 80;
        if (type === "interior" || type === "glass-pool") continue;
        if (s.kind === "moving" && !s.roof && !s.facade) {
          const horizontal = s.motion?.axis === "x", top = horizontal ? s.y1 - 115 : s.y1 - (s.motion?.amp || 0) - 40, railBottom = s.y1 + (s.motion?.amp || 0) + 60;
          if (horizontal) {
            const spanLeft = Math.max(s.x1 - s.motion.amp, state.cam - 40), spanRight = Math.min(
              s.x2 + s.motion.amp,
              state.cam + W / state.zoom + 40
            );
            if (spanRight <= spanLeft || top > bottom || q.y1 + 14 < state.camY - 40) continue;
            cityPixelRect(spanLeft, top, spanRight - spanLeft, 8, "#405066");
            cityPixelRect(spanLeft, top, spanRight - spanLeft, 2, "#a2968a");
            for (const x of [q.x1 + 8, q.x2 - 12]) {
              if (x < state.cam - 40 || x > state.cam + W / state.zoom + 40)
                continue;
              cityPixelRect(x - 4, top + 2, 12, 10, "#697b8e");
              cityPixelLine(
                x,
                q.y1 + 14,
                x,
                Math.max(top + 10, state.camY - 40),
                "#697b8e",
                2
              );
            }
          } else {
            const visibleTop = Math.max(top, state.camY - 40), visibleBottom = Math.min(railBottom, bottom);
            if (right <= left || visibleBottom <= visibleTop) continue;
            for (const x of [s.x1 + 8, s.x2 - 12]) {
              cityPixelRect(x, visibleTop, 4, visibleBottom - visibleTop, "#405066");
              cityPixelRect(x + 4, visibleTop, 2, visibleBottom - visibleTop, "#a2968a");
              cityPixelLine(x, yOn(s, x) + 14, x, visibleTop, "#697b8e", 2);
            }
          }
          continue;
        }
        if (right <= left || Math.min(q.y1, q.y2) > bottom) continue;
        if (type === "rooftop" && !s.facade && !s.roof) {
          cityFacade(q.x1, q.x2, Math.min(q.y1, q.y2) + 26, Math.floor(s.x1 / 810), false);
          continue;
        }
        if (s.roof || s.facade) {
          if (s.facade) {
            for (const x of [q.x1 + 12, q.x2 - 24]) {
              const y = yOn(s, x) + 26;
              cityPixelLine(x, y, x + 26, y + 48, "#68778b", 4);
              cityPixelRect(x + 22, y + 43, 12, 8, "#a28287");
            }
          }
          continue;
        }
        if (s.grindable) {
          for (let x = Math.ceil(left / 260) * 260; x < right; x += 260)
            cityPillar(x, yOn(s, x) + 10, bottom, true);
          continue;
        }
        if (s.routeType === "skill" && q.x2 - q.x1 <= 64) {
          const x = (q.x1 + q.x2) / 2, y = yOn(s, x) + 26;
          cityPillar(x, Math.max(y, state.camY - 40), bottom, true);
          cityPixelLine(q.x1 + 4, y, x, y + 42, "#526277", 4);
          continue;
        }
        const spacing = type === "highway" || type === "concrete-ramp" ? 240 : 160;
        for (let x = Math.ceil((left - 24) / spacing) * spacing; x < right; x += spacing) {
          if (x < q.x1 + 6 || x > q.x2 - 24) continue;
          const y = yOn(s, x) + 26;
          cityPillar(x, Math.max(y, state.camY - 40), bottom, type !== "highway");
          const x2 = Math.min(x + 90, q.x2 - 8);
          cityPixelLine(x + 4, y, x2, yOn(s, x2) + 100, "#526277", 4);
        }
      }
    } finally {
      state.cityPillarPass = false;
    }
  }
  __name(drawPixelCityStructures, "drawPixelCityStructures");
  function paintPixelCityLoop(cx, cy, r) {
    for (let y = -r - 14; y <= r + 14; y += 2)
      for (let x = -r - 14; x <= r + 14; x += 2) {
        const radius = Math.hypot(x + 1, y + 1), offset = radius - r;
        if (Math.abs(offset) > 12) continue;
        const color = offset > 9 ? "#111b31" : offset > 6 ? "#7696ad" : offset > 3 ? "#4e657e" : offset > -7 ? "#25354d" : offset > -10 ? "#88c7d1" : "#3c667d";
        cityPixelRect(cx + x, cy + y, 2, 2, color);
      }
  }
  __name(paintPixelCityLoop, "paintPixelCityLoop");
  function drawPixelCityLoop(l) {
    if (!document.createElement) {
      paintPixelCityLoop(l.x, l.y - l.r, l.r);
      return;
    }
    let texture = cityLoopTextures.get(l.r);
    if (!texture) {
      const diameter = l.r * 2 + 28;
      texture = document.createElement("canvas");
      texture.width = diameter / 2;
      texture.height = diameter / 2;
      const dc = texture.getContext("2d");
      dc.scale(0.5, 0.5);
      state.cityRasterContext = dc;
      try {
        paintPixelCityLoop(l.r + 14, l.r + 14, l.r);
      } finally {
        state.cityRasterContext = null;
      }
      cityLoopTextures.set(l.r, texture);
    }
    ctx.drawImage(texture, l.x - l.r - 14, l.y - l.r * 2 - 14, texture.width * 2, texture.height * 2);
  }
  __name(drawPixelCityLoop, "drawPixelCityLoop");
  function drawPixelCityDeck(s, left, right) {
    const q = pose(s), width = q.x2 - q.x1, delta = q.y2 - q.y1, key = [width, delta, s.cityType, s.kind].join("/");
    if (document.createElement) {
      let texture = cityDeckTextures.get(key);
      if (!texture) {
        texture = document.createElement("canvas");
        texture.width = Math.ceil((width + 2) / 2);
        texture.height = Math.ceil((Math.abs(delta) + 52) / 2);
        const dc = texture.getContext("2d");
        dc.scale(0.5, 0.5);
        state.cityRasterContext = dc;
        try {
          paintPixelCityDeck(
            {
              x1: 0,
              x2: width,
              y1: Math.max(0, -delta),
              y2: Math.max(0, delta),
              kind: s.kind,
              cityType: s.cityType,
              crumbleTimer: -1
            },
            0,
            width
          );
        } finally {
          state.cityRasterContext = null;
        }
        cityDeckTextures.set(key, texture);
      }
      const cut = Math.max(0, left - q.x1), span = Math.min(right - left, width - cut), offset = s.crumbleTimer > 0 && s.crumbleTimer < 16 ? Math.round(Math.sin(state.runFrames * 3)) * 2 : 0;
      ctx.drawImage(
        texture,
        cut / 2,
        0,
        span / 2,
        texture.height,
        left,
        Math.min(q.y1, q.y2) + offset,
        span,
        texture.height * 2
      );
      drawClimbCue(s, left, right);
      return;
    }
    paintPixelCityDeck(s, left, right);
    drawClimbCue(s, left, right);
  }
  __name(drawPixelCityDeck, "drawPixelCityDeck");
  function paintPixelCityDeck(s, left, right) {
    const q = pose(s), type = s.cityType || "scaffold", concrete = [
      "rooftop",
      "concrete-ramp",
      "highway",
      "ruined-walkway",
      "broken-bridge",
      "exposed-floor",
      "tower-cap"
    ].includes(type), height = type === "ventilation" ? 38 : type === "billboard" ? 46 : concrete ? 32 : 24, edge = s.kind === "express" ? "#e1b875" : s.kind === "lower" ? "#7796b0" : s.kind === "crumble" ? "#c89468" : s.kind === "moving" ? "#83b3b5" : "#8cafbd";
    const shakeOffset = s.crumbleTimer > 0 && s.crumbleTimer < 16 ? Math.round(Math.sin(state.runFrames * 3)) * 2 : 0;
    for (let x = Math.floor(left / 2) * 2; x < right; x += 2) {
      const y = Math.round((yOn(s, x) + shakeOffset) / 2) * 2;
      cityPixelRect(x, y, 2, height, concrete ? "#4f4c62" : "#35455b");
      cityPixelRect(x, y, 2, 2, edge);
      cityPixelRect(x, y + 2, 2, 4, "#b0a2a4");
      cityPixelRect(x, y + 6, 2, 4, concrete ? "#70637b" : "#607486");
      cityPixelRect(x, y + height - 8, 2, 6, "#23283f");
      cityPixelRect(x, y + height - 2, 2, 2, "#111a2f");
    }
    for (let x = Math.ceil(left / 32) * 32; x < right - 12; x += 32) {
      const y = yOn(s, x) + shakeOffset, k = Math.abs(Math.floor(x / 32)) % 5;
      cityPixelRect(x, y + 10, 2, height - 18, "#24293e");
      cityPixelRect(x + 2, y + 12, 8, 2, k === 1 ? "#9b8292" : "#746c83");
      cityPixelRect(x + 16, y + 18, 6, 2, "#2b3047");
      cityPixelRect(x + 24, y + 12, 2, 2, "#c0aa99");
      if (type === "ventilation") {
        for (const xx of [x + 8, x + 16, x + 24]) {
          cityPixelRect(xx, y + 12, 4, 16, "#172b3c");
          cityPixelRect(xx + 4, y + 12, 2, 14, "#648899");
        }
      } else if (!concrete && type !== "billboard") {
        cityPixelLine(x + 4, y + 10, x + 20, y + height - 8, "#698299", 2);
        cityPixelLine(x + 20, y + 10, x + 4, y + height - 8, "#485f76", 2);
      }
      if (s.kind === "crumble" || type === "broken-bridge") {
        cityPixelRect(x + 11, y + 6, 2, 8, "#1b2138");
        cityPixelRect(x + 13, y + 12, 6, 2, "#1b2138");
        cityPixelRect(x + 17, y + 14, 2, 10, "#1b2138");
      }
    }
    if (type === "billboard" && right - left > 100) {
      const x = Math.max(q.x1 + 10, left + 6), y = yOn(s, x) + 14;
      cityPixelRect(x, y, 76, 20, "#28263f");
      for (let i = 0; i < 5; i++)
        cityPixelRect(x + 8 + i * 12, y + 4, 6, 10, i % 2 ? "#bd85a9" : "#778fae");
    }
  }
  __name(paintPixelCityDeck, "paintPixelCityDeck");
  function paintPixelRing(dc, width, left = 0, top = 0) {
    for (let row = 0; row < 16; row++)
      for (let col = 0; col < 16; col++) {
        const key = ringPixels[row][col];
        if (key === ".") continue;
        const a = left + Math.round(col * width / 16), b = left + Math.round((col + 1) * width / 16);
        if (b > a) {
          dc.fillStyle = ringPalette[key];
          dc.fillRect(
            a,
            top + Math.floor(row * 1.5),
            b - a,
            Math.ceil((row + 1) * 1.5) - Math.floor(row * 1.5)
          );
        }
      }
  }
  __name(paintPixelRing, "paintPixelRing");
  function drawPixelRing(x, y, scale = 1) {
    const width = Math.max(4, Math.round(16 * scale)), left = Math.round(x - width / 2), top = Math.round(y - 12);
    if (!document.createElement) return paintPixelRing(ctx, width, left, top);
    let texture = pixelRingTextures.get(width);
    if (!texture) {
      texture = document.createElement("canvas");
      texture.width = width;
      texture.height = 24;
      paintPixelRing(texture.getContext("2d"), width);
      pixelRingTextures.set(width, texture);
    }
    ctx.drawImage(texture, left, top);
  }
  __name(drawPixelRing, "drawPixelRing");
  function drawCityCutaways(b) {
    if (b.x + b.w < state.cam - 40 || b.x > state.cam + W / state.zoom + 40)
      return;
    const gate = b.gateId && state.level.hazards.find((h) => h.id === b.gateId);
    if (gate && !gate.broken) return;
    for (const r of b.rooms || []) {
      const top = r.sloped ? b.y + 24 : r.y - 170, bottom = r.sloped ? r.bottom : r.y + 12, left = Math.max(r.x1, state.cam - 40), right = Math.min(r.x2, state.cam + W / state.zoom + 40);
      if (right <= left || bottom < state.camY - 40 || top > state.camY + H / state.zoom + 40)
        continue;
      cityPixelRect(
        left,
        Math.max(top, state.camY - 40),
        right - left,
        Math.min(bottom, state.camY + H / state.zoom + 40) - Math.max(top, state.camY - 40),
        "#10182b"
      );
      cityPixelRect(left, top, right - left, 8, "#62596b");
      for (let x = Math.ceil(left / 200) * 200; x < right; x += 200) {
        cityPixelRect(x, top + 10, 8, bottom - top - 18, "#29344a");
        cityPixelRect(x + 16, top + 26, 36, 4, "#77657b");
      }
      if (!r.sloped) {
        cityPixelRect(left, r.y - 55, right - left, 3, "#3d455b");
        for (let x = Math.ceil(left / 120) * 120; x < right; x += 120)
          cityPixelRect(x, r.y - 110, 18, 4, "#73828d");
      }
    }
    if (b.duct) {
      const d = b.duct;
      cityPixelRect(d.x - 25, d.y1 + 20, 50, d.y2 - d.y1 - 30, "#111b2c");
      cityPixelRect(d.x - 31, d.y1 + 20, 6, d.y2 - d.y1 - 30, "#596b7b");
      cityPixelRect(d.x + 25, d.y1 + 20, 6, d.y2 - d.y1 - 30, "#596b7b");
      for (let y = d.y1 + 60; y < d.y2; y += 90) {
        cityPixelRect(d.x - 20, y, 40, 3, "#354b61");
      }
    }
    if (b.burning) {
      for (const x of [b.x + 80, b.x + b.w - 110]) {
        cityFlame(x, b.y + 28, 40, 85, Math.floor(x / 100), 0.9);
        citySmoke(x, b.y - 40, 40, 2, 0.25);
      }
    }
  }
  __name(drawCityCutaways, "drawCityCutaways");
  function drawCityBreakable(h) {
    if (h.style === "glass") {
      cityPixelRect(h.x, h.y, h.w, h.h, "#315675");
      cityPixelRect(h.x, h.y, 4, h.h, "#a3c4d0");
      cityPixelRect(h.x + h.w - 4, h.y, 4, h.h, "#7699ac");
      for (let y = h.y + 8; y < h.y + h.h - 8; y += 24) {
        cityPixelRect(h.x + 5, y, h.w - 10, 2, "#87aebc");
        cityPixelLine(h.x + 6, y + 3, h.x + h.w - 6, y + 18, "#567e9c", 2);
      }
    } else {
      cityPixelRect(h.x, h.y, h.w, h.h, "#283046");
      for (let y2 = h.y + 10; y2 < h.y + h.h; y2 += 32) {
        cityPixelRect(h.x, y2, h.w, 2, "#151e31");
        cityPixelRect(h.x + 4, y2 + 12, 6, 2, "#53607a");
      }
      const x = h.x + 12, y = h.y + 74;
      cityPixelRect(x, y, 2, 8, "#1c2539");
      cityPixelRect(x + 2, y + 6, 4, 2, "#1c2539");
      cityPixelRect(x + 4, y + 8, 2, 10, "#1c2539");
      if (!h.secret) {
        cityPixelRect(h.x + 4, h.y + 16, h.w - 8, 4, "#8c9ca4");
        cityPixelRect(h.x + 4, h.y + h.h - 8, h.w - 8, 4, "#7c8993");
      }
    }
  }
  __name(drawCityBreakable, "drawCityBreakable");
  function initializeRuntimeModule9() {
    state.cityRasterContext = null;
    cityMaterials = [
      {
        body: "#25223e",
        shade: "#151b30",
        light: "#57536f",
        edge: "#8b758b",
        window: "#d280ac",
        glow: "#e6aecb",
        cool: "#6189a5"
      },
      {
        body: "#2c2441",
        shade: "#181b30",
        light: "#625173",
        edge: "#a87b94",
        window: "#c773a6",
        glow: "#f2b0cb",
        cool: "#657b9d"
      },
      {
        body: "#283046",
        shade: "#151e31",
        light: "#53607a",
        edge: "#819099",
        window: "#769ab0",
        glow: "#b6d0d6",
        cool: "#c987a3"
      },
      {
        body: "#332b43",
        shade: "#1c1f32",
        light: "#65566d",
        edge: "#ac8b89",
        window: "#c48c77",
        glow: "#ebbd86",
        cool: "#777fa3"
      }
    ];
    cityFacadeTiles = /* @__PURE__ */ new Map();
    cityPillarTextures = /* @__PURE__ */ new Map();
    cityPillarFrameSpans = /* @__PURE__ */ new Map();
    state.cityPillarPass = false;
    cityDeckTextures = /* @__PURE__ */ new Map();
    cityLoopTextures = /* @__PURE__ */ new Map();
    ringPixels = [
      ".....gggggg.....",
      "...ggwwwwwwgg...",
      "..gwyyyyyywwgg..",
      ".gwyggssssgywgg.",
      ".wygs......sgwg.",
      "gwyg........gywg",
      "gyg..........gyg",
      "gyg..........gyg",
      "gyg..........gyg",
      "gyg..........gyg",
      "gwg..........gwg",
      ".gwg........gwg.",
      ".gywg......gwyg.",
      "..gywwyyyywwyg..",
      "...ggwwwwwwgg...",
      ".....ssssss....."
    ];
    ringPalette = { g: "#efa900", y: "#f4ef00", w: "#f4f1ec", s: "#954100" };
    pixelRingTextures = /* @__PURE__ */ new Map();
  }
  __name(initializeRuntimeModule9, "initializeRuntimeModule");
  function getRuntimeBindings9() {
    return {
      cityPixelRect: {
        get: /* @__PURE__ */ __name(() => cityPixelRect, "get"),
        set: /* @__PURE__ */ __name((value) => {
          cityPixelRect = value;
        }, "set")
      },
      cityPixelLine: {
        get: /* @__PURE__ */ __name(() => cityPixelLine, "get"),
        set: /* @__PURE__ */ __name((value) => {
          cityPixelLine = value;
        }, "set")
      },
      cityPixelOval: {
        get: /* @__PURE__ */ __name(() => cityPixelOval, "get"),
        set: /* @__PURE__ */ __name((value) => {
          cityPixelOval = value;
        }, "set")
      },
      cityMaterials: {
        get: /* @__PURE__ */ __name(() => cityMaterials, "get"),
        set: /* @__PURE__ */ __name((value) => {
          cityMaterials = value;
        }, "set")
      },
      cityFacadeTiles: {
        get: /* @__PURE__ */ __name(() => cityFacadeTiles, "get"),
        set: /* @__PURE__ */ __name((value) => {
          cityFacadeTiles = value;
        }, "set")
      },
      cityFacade: {
        get: /* @__PURE__ */ __name(() => cityFacade, "get"),
        set: /* @__PURE__ */ __name((value) => {
          cityFacade = value;
        }, "set")
      },
      paintCityFacade: {
        get: /* @__PURE__ */ __name(() => paintCityFacade, "get"),
        set: /* @__PURE__ */ __name((value) => {
          paintCityFacade = value;
        }, "set")
      },
      paintCityPillar: {
        get: /* @__PURE__ */ __name(() => paintCityPillar, "get"),
        set: /* @__PURE__ */ __name((value) => {
          paintCityPillar = value;
        }, "set")
      },
      cityPillarTextures: {
        get: /* @__PURE__ */ __name(() => cityPillarTextures, "get"),
        set: /* @__PURE__ */ __name((value) => {
          cityPillarTextures = value;
        }, "set")
      },
      cityPillarFrameSpans: {
        get: /* @__PURE__ */ __name(() => cityPillarFrameSpans, "get"),
        set: /* @__PURE__ */ __name((value) => {
          cityPillarFrameSpans = value;
        }, "set")
      },
      cityPillar: {
        get: /* @__PURE__ */ __name(() => cityPillar, "get"),
        set: /* @__PURE__ */ __name((value) => {
          cityPillar = value;
        }, "set")
      },
      drawPixelCityStructures: {
        get: /* @__PURE__ */ __name(() => drawPixelCityStructures, "get"),
        set: /* @__PURE__ */ __name((value) => {
          drawPixelCityStructures = value;
        }, "set")
      },
      cityDeckTextures: {
        get: /* @__PURE__ */ __name(() => cityDeckTextures, "get"),
        set: /* @__PURE__ */ __name((value) => {
          cityDeckTextures = value;
        }, "set")
      },
      cityLoopTextures: {
        get: /* @__PURE__ */ __name(() => cityLoopTextures, "get"),
        set: /* @__PURE__ */ __name((value) => {
          cityLoopTextures = value;
        }, "set")
      },
      paintPixelCityLoop: {
        get: /* @__PURE__ */ __name(() => paintPixelCityLoop, "get"),
        set: /* @__PURE__ */ __name((value) => {
          paintPixelCityLoop = value;
        }, "set")
      },
      drawPixelCityLoop: {
        get: /* @__PURE__ */ __name(() => drawPixelCityLoop, "get"),
        set: /* @__PURE__ */ __name((value) => {
          drawPixelCityLoop = value;
        }, "set")
      },
      drawPixelCityDeck: {
        get: /* @__PURE__ */ __name(() => drawPixelCityDeck, "get"),
        set: /* @__PURE__ */ __name((value) => {
          drawPixelCityDeck = value;
        }, "set")
      },
      paintPixelCityDeck: {
        get: /* @__PURE__ */ __name(() => paintPixelCityDeck, "get"),
        set: /* @__PURE__ */ __name((value) => {
          paintPixelCityDeck = value;
        }, "set")
      },
      ringPixels: {
        get: /* @__PURE__ */ __name(() => ringPixels, "get"),
        set: /* @__PURE__ */ __name((value) => {
          ringPixels = value;
        }, "set")
      },
      ringPalette: {
        get: /* @__PURE__ */ __name(() => ringPalette, "get"),
        set: /* @__PURE__ */ __name((value) => {
          ringPalette = value;
        }, "set")
      },
      pixelRingTextures: {
        get: /* @__PURE__ */ __name(() => pixelRingTextures, "get"),
        set: /* @__PURE__ */ __name((value) => {
          pixelRingTextures = value;
        }, "set")
      },
      paintPixelRing: {
        get: /* @__PURE__ */ __name(() => paintPixelRing, "get"),
        set: /* @__PURE__ */ __name((value) => {
          paintPixelRing = value;
        }, "set")
      },
      drawPixelRing: {
        get: /* @__PURE__ */ __name(() => drawPixelRing, "get"),
        set: /* @__PURE__ */ __name((value) => {
          drawPixelRing = value;
        }, "set")
      },
      drawCityCutaways: {
        get: /* @__PURE__ */ __name(() => drawCityCutaways, "get"),
        set: /* @__PURE__ */ __name((value) => {
          drawCityCutaways = value;
        }, "set")
      },
      drawCityBreakable: {
        get: /* @__PURE__ */ __name(() => drawCityBreakable, "get"),
        set: /* @__PURE__ */ __name((value) => {
          drawCityBreakable = value;
        }, "set")
      }
    };
  }
  __name(getRuntimeBindings9, "getRuntimeBindings");

  // src/blimp-route.js
  var blimpTextures;
  function addBlimpRoute(l) {
    const ramp = l.surfaces.find((s) => s.id === "draw-loop-launch"), exit = l.surfaces.find((s) => s.id === "draw-hall-exit");
    const ox = ramp.x1 - 31e3, oy = ramp.y1 + 2800;
    const add = /* @__PURE__ */ __name((id, x1, x2, y1, y2 = y1, extra = {}) => {
      const s = {
        id,
        x1: x1 + ox,
        x2: x2 + ox,
        y1: y1 + oy,
        y2: y2 + oy,
        kind: "main",
        cityType: "blimp",
        ...extra
      };
      l.surfaces.push(s);
      return s;
    }, "add");
    const entry = add("blimp-entry", 31931, 31989, -3320, -3320, { cityType: "blimp-anchor" });
    const points = [
      [30716, -3850],
      [30816, -3770],
      [30916, -3720],
      [31016, -3700],
      [31116, -3700],
      [31216, -3720],
      [31316, -3750],
      [31416, -3780],
      [31586, -3810]
    ];
    const curve = [];
    for (let i = 0; i < points.length - 1; i++)
      curve.push(
        add("blimp-curve-" + i, points[i][0], points[i + 1][0], points[i][1], points[i + 1][1])
      );
    const moving = add("blimp-moving", 29836, 30336, -3810, -3810, {
      kind: "moving",
      motion: { type: "flight", axis: "x", distance: -710, speed: 3, startedAt: null }
    });
    const reward = add("blimp-reward", 28386, 29036, -3690);
    l.springs.push(
      {
        id: "blimp-entry-spring",
        surfaceId: entry.id,
        x: 31960 + ox,
        y: entry.y1,
        power: 21,
        launchX: -20
      },
      {
        id: "blimp-return-spring",
        surfaceId: reward.id,
        x: 28416 + ox,
        y: reward.y1,
        power: 32,
        launchX: 28
      }
    );
    add("blimp-return-rail", 30016, 34800, -4400, -4400, {
      kind: "express",
      grindable: true,
      cityType: "grind-rail",
      blimpRail: true
    });
    add("blimp-return-descent", 34800, 36500, -4400, exit.y2 - oy, {
      kind: "express",
      grindable: true,
      cityType: "grind-rail",
      blimpRail: true
    });
    l.monitors ??= [];
    for (const [id, item, x] of [
      ["blimp-life", "life", 28561],
      ["blimp-shield", "bubble", 28481]
    ])
      l.monitors.push({ id, item, x: x + ox, y: reward.y1, surfaceId: reward.id, broken: false });
    for (let x = reward.x1 + 370; x < reward.x2 - 40; x += 76)
      l.rings.push({ x, y: reward.y1 - 38, taken: false });
    l.blimpRoute = {
      entered: false,
      departureFrame: -100,
      departureSpeed: 0,
      entryId: entry.id,
      movingId: moving.id,
      rewardId: reward.id,
      exitId: exit.id,
      blimps: [
        { id: "damaged", surfaces: curve.map((s) => s.id), damaged: true },
        { id: "moving", surfaces: [moving.id] },
        { id: "reward", surfaces: [reward.id] }
      ]
    };
    return l;
  }
  __name(addBlimpRoute, "addBlimpRoute");
  function resetBlimpRoute() {
    const s = state.level.blimpRoute && surfaceById(state.level.blimpRoute.movingId);
    if (s) {
      s.motion.startedAt = null;
      Object.assign(state.level.blimpRoute, {
        entered: false,
        departureFrame: -100,
        departureSpeed: 0
      });
      for (const d of state.level.springs)
        if (d.id === "blimp-entry-spring" || d.id === "blimp-return-spring") delete d.firedAt;
    }
  }
  __name(resetBlimpRoute, "resetBlimpRoute");
  function recordBlimpJump(surface, speed) {
    const r = state.level.blimpRoute;
    if (!r) return;
    const fromRamp = surface?.id === "draw-loop-launch" || !surface && state.coyote > 0 && state.runFrames - r.departureFrame <= tuning.coyote;
    if (fromRamp && surface) {
      r.departureFrame = state.runFrames;
      r.departureSpeed = Math.abs(speed);
    } else if (!fromRamp) invalidateBlimpEntry();
  }
  __name(recordBlimpJump, "recordBlimpJump");
  function invalidateBlimpEntry() {
    const r = state.level.blimpRoute;
    if (r) {
      r.departureFrame = -100;
      r.departureSpeed = 0;
    }
  }
  __name(invalidateBlimpEntry, "invalidateBlimpEntry");
  function recordBlimpDeparture(s) {
    const r = state.level.blimpRoute;
    if (r && s.id === "draw-loop-launch") {
      r.departureFrame = state.runFrames;
      r.departureSpeed = Math.abs(p.vx) * Math.hypot(1, pose(s).slope);
    }
  }
  __name(recordBlimpDeparture, "recordBlimpDeparture");
  function onBlimpLanding(s) {
    const r = state.level.blimpRoute;
    if (!r) return;
    if (s.id !== r.entryId) invalidateBlimpEntry();
    if (s.id === r.movingId && s.motion.startedAt === null)
      s.motion.startedAt = state.runFrames;
  }
  __name(onBlimpLanding, "onBlimpLanding");
  function qualifyingBlimpEntry() {
    const r = state.level.blimpRoute;
    return !!(r && r.departureFrame >= 0 && r.departureSpeed >= 24 && !p.airBoostUsed);
  }
  __name(qualifyingBlimpEntry, "qualifyingBlimpEntry");
  function drawBlimpRoute() {
    for (const b of state.level.blimpRoute?.blimps || []) {
      const surfaces = b.surfaces.map(surfaceById), first = pose(surfaces[0]), last = pose(surfaces.at(-1)), x = first.x1, right = last.x2, top = Math.min(...surfaces.map((s) => Math.min(s.y1, s.y2))), bottom = Math.max(...surfaces.map((s) => Math.max(s.y1, s.y2))) + (b.damaged ? 154 : 234);
      const side = b.damaged ? 80 : 42, effectTop = top - (b.damaged ? 224 : 0);
      if (right + side < state.cam - 40 || x - side > state.cam + W / state.zoom + 40 || bottom < state.camY - 40 || effectTop > state.camY + H / state.zoom + 40)
        continue;
      let texture = blimpTextures.get(b.id);
      if (!texture && document.createElement) {
        texture = document.createElement("canvas");
        texture.width = Math.ceil((right - x + 84) / 2);
        texture.height = Math.ceil((bottom - top + 2) / 2);
        const dc = texture.getContext("2d");
        dc.imageSmoothingEnabled = false;
        const w = right - x, localTop = /* @__PURE__ */ __name((xx) => {
          const s = surfaces.find((s2) => xx + x <= s2.x2) || surfaces.at(-1);
          return s.y1 + (xx + x - s.x1) * (s.y2 - s.y1) / (s.x2 - s.x1) - top;
        }, "localTop");
        const box = /* @__PURE__ */ __name((xx, yy, ww, hh, color) => {
          dc.fillStyle = color;
          dc.fillRect(
            Math.floor((xx + 42) / 2),
            Math.floor(yy / 2),
            Math.ceil(ww / 2),
            Math.ceil(hh / 2)
          );
        }, "box");
        for (let xx = 0; xx < w; xx += 2) {
          const u = xx / w, roof = localTop(xx), depth = b.damaged ? 35 + 30 * Math.sin(u * Math.PI) : 24 + 150 * Math.sin(u * Math.PI);
          for (let yy = 0; yy < depth; yy += 2) {
            const shade = yy / depth, color = yy < 4 ? "#d8e8de" : yy < 8 ? "#7fa6ab" : shade < 0.22 ? "#91a9b1" : shade < 0.5 ? "#607a91" : shade < 0.8 ? "#3b536d" : "#25364d";
            box(xx, roof + yy, 2, 2, color);
          }
          box(xx, roof + depth, 2, 4, "#101c32");
          if (Math.floor(xx / 92) % 2 === 0)
            box(xx, roof + Math.min(26, depth * 0.35), 2, 8, "#d95369");
          if (xx % 92 < 4) box(xx, roof + 8, 2, Math.max(2, depth - 14), "#445b73");
          if (b.damaged && (xx * 17 % 138 < 44 || u < 0.12 || u > 0.88)) {
            box(xx, roof + 10, 2, depth * 0.6, "#252737");
            if (xx % 18 < 2) box(xx, roof + 8, 2, 6, "#975450");
          }
        }
        const mid = w * 0.52, base = localTop(mid) + (b.damaged ? 54 : 180);
        for (let i = 0; i < 20; i++) {
          box(-36 + i * 2, localTop(0) + 18 + i, 38 - i * 2, 4, i < 4 ? "#d66777" : "#3e5572");
          box(w - 2, localTop(w) + 20 + i, 40 - i * 2, 4, i < 4 ? "#d66777" : "#3e5572");
        }
        box(mid - 48, base, 96, 26, "#17253c");
        box(mid - 44, base + 2, 88, 4, "#7796a0");
        box(mid - 32, base + 8, 18, 8, "#58cbdf");
        box(mid - 8, base + 8, 18, 8, "#58cbdf");
        box(mid + 16, base + 8, 18, 8, "#58cbdf");
        box(mid - 48, base + 26, 96, 4, "#ae5770");
        for (const xx of [w * 0.25, w * 0.76]) {
          const yy = localTop(xx) + (b.damaged ? 44 : 150);
          box(xx - 18, yy, 36, 16, "#182a42");
          box(xx - 14, yy + 2, 28, 4, "#708c9e");
          box(xx + 10, yy + 6, 10, 6, "#e5ac6a");
          box(xx - 12, yy + 14, 28, 2, "#c65f78");
        }
        blimpTextures.set(b.id, texture);
      }
      if (texture)
        ctx.drawImage(
          texture,
          Math.round((x - 42) / 2) * 2,
          Math.round(top / 2) * 2,
          texture.width * 2,
          texture.height * 2
        );
      if (b.damaged) {
        for (const s of [surfaces[0], surfaces.at(-1)]) {
          const xx = s === surfaces[0] ? s.x1 + 20 : s.x2 - 20, yy = yOn(s, xx);
          cityFlame(xx, yy + 24, 34, 56, Math.floor(xx / 10));
          citySmoke(xx, yy - 50, 44, Math.floor(xx / 10), 0.45);
        }
      } else
        for (const xx of [(first.x1 + first.x2) / 2]) {
          const yy = first.y1 + 210;
          cityPixelRect(xx - 16, yy, 32, 4, "#32465e");
          cityPixelRect(
            xx - 2,
            yy - 6 + Math.floor(state.runFrames / 3) % 3 * 4,
            4,
            12,
            "#c4d9dd"
          );
        }
    }
  }
  __name(drawBlimpRoute, "drawBlimpRoute");
  function initializeRuntimeModule10() {
    blimpTextures = /* @__PURE__ */ new Map();
  }
  __name(initializeRuntimeModule10, "initializeRuntimeModule");
  function getRuntimeBindings10() {
    return {
      addBlimpRoute: {
        get: /* @__PURE__ */ __name(() => addBlimpRoute, "get"),
        set: /* @__PURE__ */ __name((value) => {
          addBlimpRoute = value;
        }, "set")
      },
      resetBlimpRoute: {
        get: /* @__PURE__ */ __name(() => resetBlimpRoute, "get"),
        set: /* @__PURE__ */ __name((value) => {
          resetBlimpRoute = value;
        }, "set")
      },
      recordBlimpJump: {
        get: /* @__PURE__ */ __name(() => recordBlimpJump, "get"),
        set: /* @__PURE__ */ __name((value) => {
          recordBlimpJump = value;
        }, "set")
      },
      recordBlimpDeparture: {
        get: /* @__PURE__ */ __name(() => recordBlimpDeparture, "get"),
        set: /* @__PURE__ */ __name((value) => {
          recordBlimpDeparture = value;
        }, "set")
      },
      onBlimpLanding: {
        get: /* @__PURE__ */ __name(() => onBlimpLanding, "get"),
        set: /* @__PURE__ */ __name((value) => {
          onBlimpLanding = value;
        }, "set")
      },
      qualifyingBlimpEntry: {
        get: /* @__PURE__ */ __name(() => qualifyingBlimpEntry, "get"),
        set: /* @__PURE__ */ __name((value) => {
          qualifyingBlimpEntry = value;
        }, "set")
      },
      drawBlimpRoute: {
        get: /* @__PURE__ */ __name(() => drawBlimpRoute, "get"),
        set: /* @__PURE__ */ __name((value) => {
          drawBlimpRoute = value;
        }, "set")
      }
    };
  }
  __name(getRuntimeBindings10, "getRuntimeBindings");

  // src/player-movement.js
  var player_movement_exports = {};
  __export(player_movement_exports, {
    beginBubbleSlam: () => beginBubbleSlam,
    getRuntimeBindings: () => getRuntimeBindings22,
    initializeRuntimeModule: () => initializeRuntimeModule22,
    jump: () => jump,
    reboundBubbleShield: () => reboundBubbleShield,
    resetPlayerAbilities: () => resetPlayerAbilities,
    stopRollAtRest: () => stopRollAtRest,
    updateBrakingPose: () => updateBrakingPose,
    updateBreathing: () => updateBreathing,
    updateMovement: () => updateMovement,
    updateRoll: () => updateRoll,
    updateWaterState: () => updateWaterState,
    waterAt: () => waterAt
  });

  // src/stage-runtime.js
  var stage_runtime_exports = {};
  __export(stage_runtime_exports, {
    afterStageLanding: () => afterStageLanding,
    beforeStageLanding: () => beforeStageLanding,
    getRuntimeBindings: () => getRuntimeBindings21,
    handleStageEnemyDamage: () => handleStageEnemyDamage,
    initializeRuntimeModule: () => initializeRuntimeModule21,
    neonExpressAct1Runtime: () => neonExpressAct1Runtime,
    neonExpressAct2Runtime: () => neonExpressAct2Runtime,
    resetStageRuntime: () => resetStageRuntime,
    selectStageRuntime: () => selectStageRuntime,
    stageDeathLimit: () => stageDeathLimit,
    updateStageCompletion: () => updateStageCompletion,
    updateStageMotion: () => updateStageMotion,
    updateStageWorld: () => updateStageWorld
  });

  // src/boss-game.js
  var boss_game_exports = {};
  __export(boss_game_exports, {
    beginEndingScene: () => beginEndingScene,
    bossOwnsControls: () => bossOwnsControls,
    drawBossEncounter: () => drawBossEncounter,
    frameBossCamera: () => frameBossCamera,
    getRuntimeBindings: () => getRuntimeBindings20,
    initializeRuntimeModule: () => initializeRuntimeModule20,
    resetBossAttempt: () => resetBossAttempt,
    setupBossEncounter: () => setupBossEncounter,
    updateBossEncounter: () => updateBossEncounter,
    updateEndingScene: () => updateEndingScene
  });

  // src/ending-scene.js
  var ending_scene_exports = {};
  __export(ending_scene_exports, {
    ENDING_BEATS: () => ENDING_BEATS,
    createEndingScene: () => createEndingScene,
    endingPose: () => endingPose,
    getRuntimeBindings: () => getRuntimeBindings11,
    initializeRuntimeModule: () => initializeRuntimeModule11,
    tickEndingScene: () => tickEndingScene
  });
  var ENDING_BEATS;
  var createEndingScene;
  var tickEndingScene;
  var endingPose;
  function initializeRuntimeModule11() {
    (function(root) {
      "use strict";
      const ENDING_BEATS2 = Object.freeze(
        [
          ["escape", 108],
          ["aim", 48],
          ["rocket", 54],
          ["kick", 30],
          ["return", 30],
          ["explode", 54],
          ["jetpack", 84],
          ["offer", 90],
          ["approach", 42],
          ["nod", 108],
          ["annoy", 42],
          ["swing", 66],
          ["realize", 60],
          ["vanish", 24],
          ["sigh", 96],
          ["end", 30]
        ].map(([name, duration]) => Object.freeze({ name, duration }))
      );
      const starts = {};
      let total = 0;
      for (const b of ENDING_BEATS2) {
        starts[b.name] = total;
        total += b.duration;
      }
      const clamp = /* @__PURE__ */ __name((v, a = 0, b = 1) => Math.max(a, Math.min(b, v)), "clamp"), ease = /* @__PURE__ */ __name((t) => {
        t = clamp(t);
        return t * t * (3 - 2 * t);
      }, "ease"), mix = /* @__PURE__ */ __name((a, b, t) => a + (b - a) * clamp(t), "mix");
      function pose2(actor, age, cels, sheet = actor.sheet) {
        actor.sheet = sheet;
        let end = 0;
        for (const [frame2, hold] of cels) {
          end += hold;
          actor.frame = frame2;
          if (age < end) return;
        }
      }
      __name(pose2, "pose");
      function createEndingScene2(arena, player, camera) {
        return {
          arena: { ...arena },
          camera: Object.freeze({ ...camera }),
          startX: player.x,
          sonicX: clamp(player.x, arena.x + 490, arena.x + 630),
          index: 0,
          beat: "escape",
          age: 0,
          frame: 0,
          done: false,
          events: []
        };
      }
      __name(createEndingScene2, "createEndingScene");
      function tickEndingScene2(s) {
        s.events = [];
        if (s.done) return s;
        s.frame++;
        s.age++;
        if (s.age >= ENDING_BEATS2[s.index].duration) {
          if (s.index === ENDING_BEATS2.length - 1) {
            s.done = true;
            return s;
          }
          s.index++;
          s.beat = ENDING_BEATS2[s.index].name;
          s.age = 0;
        }
        const entry = {
          rocket: "rocketFire",
          kick: "shadowTeleport",
          explode: "podExplosion",
          jetpack: "jetpack",
          offer: "emeraldOffer",
          vanish: "chaosWarp"
        };
        if (s.age === 0 && entry[s.beat]) s.events.push(entry[s.beat]);
        if (s.beat === "kick" && s.age === 18) s.events.push("kickImpact");
        if (s.beat === "swing" && s.age === 52) s.events.push("chaosCharge");
        if (s.beat === "sigh" && s.age === 30) s.events.push("relievedSigh");
        return s;
      }
      __name(tickEndingScene2, "tickEndingScene");
      function endingPose2(s) {
        const { beat: b, age: a, frame: f } = s, roof = s.arena.y, sx = s.sonicX, shadowX = sx + 235, podX = s.arena.x + 1100;
        const since = /* @__PURE__ */ __name((name) => f - starts[name], "since"), past = /* @__PURE__ */ __name((name) => f >= starts[name], "past"), cycle = /* @__PURE__ */ __name((n, d = 6) => Math.floor(a / d) % n, "cycle");
        const sonic2 = {
          x: sx,
          y: roof,
          visible: !past("sigh"),
          action: "confident",
          sheet: "sonic",
          frame: 0,
          flip: false,
          alpha: 1
        };
        const shadow = {
          x: shadowX,
          y: roof,
          visible: past("kick"),
          action: "neutral",
          sheet: "shadow",
          frame: 15,
          flip: false,
          alpha: 1
        };
        const pod = {
          x: podX,
          y: roof - 210 + Math.sin(f * 0.065) * 3,
          visible: !past("explode"),
          sheet: "eggman",
          frame: 0,
          alpha: 1
        };
        const eggman = {
          x: podX,
          y: roof - 210,
          visible: past("explode") && !past("offer"),
          sheet: "eggman",
          frame: 4,
          alpha: 1
        };
        const contact = { x: sx + 171, y: roof - 92 }, blast = { x: podX - 20, y: roof - 265 };
        const effects = {
          arrival: b === "kick" && a < 14,
          kick: b === "kick" && a >= 18 && a < 25,
          explosion: b === "explode",
          teleport: (b === "swing" && a >= 52 || past("realize")) && !past("sigh"),
          warp: b === "vanish",
          dust: b === "approach" && a > 24,
          sigh: b === "sigh" && a >= 30 && a < 65
        };
        if (b === "escape") {
          pod.y = mix(roof + 30, roof - 210, ease(a / 85));
          pose2(
            sonic2,
            a,
            [
              [2, 42],
              [0, 4],
              [1, 4],
              [0, 3],
              [2, 55]
            ],
            "sonic-polish"
          );
          if (a < 6) {
            sonic2.sheet = "sonic";
            sonic2.frame = 0;
          }
          if (Math.abs(s.startX - sx) > 5 && a < 36) {
            sonic2.x = mix(s.startX, sx, ease(a / 36));
            sonic2.action = "run";
            sonic2.sheet = "recovered";
            sonic2.frame = cycle(8, 3);
            sonic2.flip = s.startX > sx;
          }
        }
        if (b === "aim") {
          pose2(
            pod,
            a,
            [
              [0, 10],
              [1, 18],
              [2, 20]
            ],
            "eggman-polish"
          );
          if (a < 8) pose2(sonic2, a, [[3, 8]], "sonic-polish");
          else
            pose2(
              sonic2,
              a - 8,
              [
                [1, 16],
                [2, 24]
              ],
              "sonic"
            );
        }
        if (["rocket", "kick", "return"].includes(b)) {
          const t = since("rocket");
          sonic2.action = "grin";
          if (t < 8) pose2(sonic2, t, [[4, 8]], "sonic-polish");
          else
            pose2(
              sonic2,
              t - 8,
              [
                [3, 7],
                [4, 15],
                [5, 100]
              ],
              "sonic"
            );
          if (t < 30)
            pose2(
              pod,
              t,
              [
                [3, 5],
                [4, 6],
                [3, 7],
                [2, 12]
              ],
              "eggman-polish"
            );
          else if (b === "rocket") pose2(pod, a - 30, [[5, 24]], "eggman-polish");
          else
            pose2(
              pod,
              since("kick"),
              [
                [5, 8],
                [6, 12],
                [7, 40]
              ],
              "eggman-polish"
            );
        }
        if (["kick", "return", "explode", "jetpack"].includes(b) && since("kick") >= 18) {
          const t = since("kick") - 18;
          sonic2.action = "disappointed";
          if (t < 9) sonic2.frame = 6;
          else if (t < 42)
            pose2(
              sonic2,
              t - 9,
              [
                [6, 9],
                [5, 24]
              ],
              "sonic-polish"
            );
          else if (t < 70)
            pose2(
              sonic2,
              t - 42,
              [
                [7, 7],
                [8, 21]
              ],
              "sonic"
            );
          else if (t < 94) pose2(sonic2, t - 70, [[7, 24]], "sonic-polish");
          else sonic2.frame = 8;
        }
        if (["explode", "jetpack"].includes(b)) {
          const t = since("explode");
          if (t < 12)
            pose2(
              shadow,
              t,
              [
                [8, 6],
                [9, 6]
              ],
              "shadow-polish"
            );
          else shadow.frame = 16;
        }
        if (b === "offer") {
          sonic2.action = "unbothered";
          shadow.action = "offer";
          if (a < 9) sonic2.frame = 9;
          else if (a < 15) pose2(sonic2, a - 9, [[9, 6]], "sonic-polish");
          else if (a < 29) sonic2.frame = 10;
          else if (a < 37) pose2(sonic2, a - 29, [[10, 8]], "sonic-polish");
          else
            pose2(
              sonic2,
              a - 37,
              [
                [11, 39],
                [10, 14]
              ],
              "sonic"
            );
          if (a < 14)
            pose2(
              shadow,
              a,
              [
                [16, 6],
                [17, 8]
              ],
              "shadow"
            );
          else if (a < 22) pose2(shadow, a - 14, [[10, 8]], "shadow-polish");
          else
            pose2(
              shadow,
              a - 22,
              [
                [18, 8],
                [19, 7],
                [20, 53]
              ],
              "shadow"
            );
        }
        if (b === "approach") {
          sonic2.x = mix(sx, shadowX - 88, ease(a / 30));
          sonic2.action = a < 30 ? "run" : "unbothered";
          if (a < 30) {
            sonic2.sheet = "recovered";
            sonic2.frame = cycle(8, 2);
          } else if (a < 34) pose2(sonic2, a - 30, [[11, 4]], "sonic-polish");
          else sonic2.frame = 11;
          shadow.frame = 20;
        }
        if (past("nod")) {
          sonic2.x = shadowX - 88;
          sonic2.action = "nod";
          shadow.frame = 20;
          const t = since("nod");
          if (t < 18)
            pose2(
              sonic2,
              t,
              [
                [11, 10],
                [10, 8]
              ],
              "sonic"
            );
          else if (t >= 66 && t < 82)
            pose2(
              sonic2,
              t - 66,
              [
                [11, 12],
                [10, 4]
              ],
              "sonic"
            );
          else {
            const n = (t - (t < 66 ? 18 : 82)) % 44;
            if (n < 7) pose2(sonic2, n, [[12, 7]], "sonic-polish");
            else if (n < 26)
              pose2(
                sonic2,
                n - 7,
                [
                  [13, 6],
                  [14, 8],
                  [13, 5]
                ],
                "sonic"
              );
            else
              pose2(
                sonic2,
                n - 26,
                [
                  [15, 6],
                  [16, 6],
                  [17, 6]
                ],
                "sonic-polish"
              );
          }
          if (b === "nod" && a >= 48 && a < 58)
            pose2(
              shadow,
              a - 48,
              [
                [11, 4],
                [17, 6]
              ],
              "shadow-polish"
            );
        }
        if (b === "annoy") {
          shadow.action = "annoyed";
          pose2(
            shadow,
            a,
            [
              [21, 12],
              [22, 12],
              [23, 18]
            ],
            "shadow"
          );
        }
        if (b === "swing") {
          shadow.action = "swing";
          if (a < 40)
            pose2(
              shadow,
              a,
              [
                [12, 6],
                [13, 6],
                [14, 6],
                [15, 14],
                [16, 8]
              ],
              "shadow-polish"
            );
          else if (a < 46) pose2(shadow, a - 40, [[17, 6]], "shadow-polish");
          else {
            pose2(
              shadow,
              a - 46,
              [
                [25, 6],
                [26, 6],
                [27, 8]
              ],
              "shadow"
            );
            shadow.flip = true;
          }
        }
        if (b === "realize") {
          sonic2.action = "confused";
          sonic2.y = roof - ease(a / 50) * 16;
          shadow.action = "smirk";
          pose2(
            sonic2,
            a,
            [
              [18, 8],
              [19, 10],
              [20, 10],
              [21, 12],
              [22, 10],
              [23, 10]
            ],
            "sonic"
          );
          pose2(
            shadow,
            a,
            [
              [18, 36],
              [19, 4],
              [18, 20]
            ],
            "shadow-polish"
          );
        }
        if (b === "vanish") {
          sonic2.action = "confused";
          sonic2.sheet = "sonic";
          sonic2.frame = 23;
          sonic2.y = roof - 16 - a * 0.3;
          sonic2.alpha = 1 - ease(a / 18);
          sonic2.visible = a < 20;
          shadow.action = "smirk";
          shadow.sheet = "shadow-polish";
          shadow.frame = 18;
        }
        if (b === "sigh" || b === "end") {
          shadow.action = "sigh";
          sonic2.visible = false;
          const t = b === "end" ? 96 : a;
          if (t < 64)
            pose2(
              shadow,
              t,
              [
                [18, 10],
                [19, 7],
                [20, 15],
                [21, 12],
                [22, 14],
                [23, 6]
              ],
              "shadow-polish"
            );
          else {
            shadow.frame = 31;
            shadow.flip = true;
          }
        }
        if (b === "kick") {
          shadow.action = "kick";
          shadow.x = mix(sx + 105, sx + 128, ease(a / 18));
          shadow.y = roof - 14 - Math.sin(clamp(a / 30) * Math.PI) * 23;
          if (a < 12)
            pose2(
              shadow,
              a,
              [
                [0, 4],
                [1, 4],
                [2, 4]
              ],
              "shadow-polish"
            );
          else if (a < 20)
            pose2(
              shadow,
              a - 12,
              [
                [3, 5],
                [4, 3]
              ],
              "shadow"
            );
          else
            pose2(
              shadow,
              a - 20,
              [
                [3, 5],
                [4, 5]
              ],
              "shadow-polish"
            );
          shadow.alpha = a < 6 ? a / 6 : 1;
        }
        if (b === "return") {
          shadow.action = "land";
          shadow.x = mix(sx + 128, shadowX, ease(a / 22));
          shadow.y = roof - 14 * (1 - ease(a / 22)) - Math.sin(clamp(a / 22) * Math.PI) * 20;
          pose2(
            shadow,
            a,
            [
              [4, 14],
              [5, 8],
              [6, 4],
              [7, 4]
            ],
            "shadow-polish"
          );
        }
        if (eggman.visible) {
          const t = since("explode");
          eggman.frame = t < 18 ? 4 : 5 + Math.floor(t / 9) % 3;
          eggman.x = podX + Math.max(0, t - 22) * 3.6;
          eggman.y = roof - 205 - Math.min(t, 22) * 2.4 - Math.max(0, t - 22) * 3.2;
        }
        const emerald = {
          color: "yellow",
          visible: past("offer"),
          phase: "held",
          overlay: false,
          progress: 0,
          x: shadow.x - 25,
          y: shadow.y - 36
        };
        if (b === "swing" && a >= 6 && a < 12) {
          emerald.overlay = true;
          emerald.phase = "lowered";
        }
        if (b === "swing" && a >= 12 && a <= 39) {
          emerald.phase = "airborne";
          emerald.overlay = true;
          emerald.progress = (a - 12) / 27;
          emerald.y = mix(shadow.y - 46, shadow.y - 55, emerald.progress) - 4 * 44 * emerald.progress * (1 - emerald.progress);
        }
        let rocket = null;
        const launch = starts.rocket, hit = starts.kick + 18, impact = starts.explode;
        if (f >= launch && f < impact) {
          const from = f <= hit ? { x: podX - 65, y: roof - 226 } : contact, to = f <= hit ? contact : blast;
          const t = f <= hit ? (f - launch) / (hit - launch) : (f - hit) / (impact - hit);
          rocket = {
            x: mix(from.x, to.x, t),
            y: mix(from.y, to.y, t),
            angle: Math.atan2(to.y - from.y, to.x - from.x) - Math.PI,
            sheet: "eggman",
            frame: 9,
            nose: true,
            alpha: 1
          };
        }
        return {
          beat: b,
          age: a,
          frame: f,
          sonic: sonic2,
          shadow,
          pod,
          eggman,
          emerald,
          rocket,
          contact,
          blast,
          effects
        };
      }
      __name(endingPose2, "endingPose");
      const api = { ENDING_BEATS: ENDING_BEATS2, createEndingScene: createEndingScene2, tickEndingScene: tickEndingScene2, endingPose: endingPose2 };
      if (false) (void 0).exports = api;
      else Object.assign(root, api);
    })(typeof window !== "undefined" ? window : globalThis);
  }
  __name(initializeRuntimeModule11, "initializeRuntimeModule");
  function getRuntimeBindings11() {
    return {
      ENDING_BEATS: {
        get: /* @__PURE__ */ __name(() => ENDING_BEATS, "get"),
        set: /* @__PURE__ */ __name((value) => {
          ENDING_BEATS = value;
        }, "set")
      },
      createEndingScene: {
        get: /* @__PURE__ */ __name(() => createEndingScene, "get"),
        set: /* @__PURE__ */ __name((value) => {
          createEndingScene = value;
        }, "set")
      },
      tickEndingScene: {
        get: /* @__PURE__ */ __name(() => tickEndingScene, "get"),
        set: /* @__PURE__ */ __name((value) => {
          tickEndingScene = value;
        }, "set")
      },
      endingPose: {
        get: /* @__PURE__ */ __name(() => endingPose, "get"),
        set: /* @__PURE__ */ __name((value) => {
          endingPose = value;
        }, "set")
      }
    };
  }
  __name(getRuntimeBindings11, "getRuntimeBindings");

  // src/egg-scorpion.js
  var egg_scorpion_exports = {};
  __export(egg_scorpion_exports, {
    createEggScorpion: () => createEggScorpion,
    damageEggScorpion: () => damageEggScorpion,
    getRuntimeBindings: () => getRuntimeBindings12,
    initializeRuntimeModule: () => initializeRuntimeModule12,
    scorpionDanger: () => scorpionDanger,
    scorpionGeometry: () => scorpionGeometry,
    tickEggScorpion: () => tickEggScorpion
  });
  var createEggScorpion;
  var tickEggScorpion;
  var scorpionGeometry;
  var damageEggScorpion;
  var scorpionDanger;
  function initializeRuntimeModule12() {
    (function(root) {
      "use strict";
      const clamp = /* @__PURE__ */ __name((v, a, z) => Math.max(a, Math.min(z, v)), "clamp"), ease = /* @__PURE__ */ __name((t) => {
        t = clamp(t, 0, 1);
        return t * t * (3 - 2 * t);
      }, "ease"), mix = /* @__PURE__ */ __name((a, z, t) => a + (z - a) * ease(t), "mix");
      const durations = {
        entrance: 240,
        idle: 65,
        "tail-windup": 65,
        "tail-strike": 24,
        "tail-retract": 45,
        "bite-windup": 55,
        "bite-lunge": 24,
        "bite-hold": 22,
        "bite-open": 100,
        "bite-retract": 42,
        hit: 55,
        "laser-windup": 70,
        "laser-fire": 32,
        "laser-cool": 45,
        destroyed: 150
      };
      function createEggScorpion2(arena) {
        return {
          arena: { ...arena },
          x: arena.x + 1170,
          y: arena.y,
          state: "entrance",
          age: 0,
          hits: 0,
          shattered: [false, false],
          bites: 0,
          verticalAttacks: 0,
          laserMode: false,
          anchored: false,
          target: null,
          beam: null,
          event: "",
          sequence: 0
        };
      }
      __name(createEggScorpion2, "createEggScorpion");
      function enter(b, state2, p2) {
        b.state = state2;
        b.age = 0;
        b.sequence++;
        b.event = state2;
        b.beam = null;
        if (state2 === "idle") b.verticalAttacks = 0;
        if (state2 === "tail-strike" || state2 === "laser-fire") b.verticalAttacks++;
        if (state2 === "tail-windup" || state2 === "laser-windup")
          b.target = { x: clamp(p2.x, b.arena.x + 260, b.x - 115), y: b.y - 20 };
        if (state2 === "bite-windup") {
          b.biteX = clamp(p2.x + 90, b.arena.x + 650, b.x - 170);
          b.bites++;
        }
        if (state2 === "laser-fire") {
          const g = scorpionGeometry2(b), a = { ...g.tip }, dx = b.target.x - a.x, dy = b.target.y - a.y, t = (b.y + 25 - a.y) / dy;
          b.beam = { a, z: { x: a.x + dx * t, y: b.y + 25 } };
        }
      }
      __name(enter, "enter");
      function tickEggScorpion2(b, p2) {
        b.event = "";
        if (b.state === "defeated") return b;
        b.age++;
        if (b.age < (durations[b.state] || 1)) return b;
        const next = {
          entrance: "idle",
          idle: b.laserMode ? "laser-windup" : "tail-windup",
          "tail-windup": "tail-strike",
          "tail-strike": "tail-retract",
          "tail-retract": b.verticalAttacks < 2 ? "tail-windup" : "bite-windup",
          "bite-windup": "bite-lunge",
          "bite-lunge": "bite-hold",
          "bite-hold": "bite-open",
          "bite-open": "bite-retract",
          "bite-retract": "idle",
          hit: "idle",
          "laser-windup": "laser-fire",
          "laser-fire": "laser-cool",
          "laser-cool": b.verticalAttacks < 3 ? "laser-windup" : "bite-windup",
          destroyed: "defeated"
        }[b.state] || "idle";
        if (b.state === "entrance") b.anchored = true;
        enter(b, next, p2);
        return b;
      }
      __name(tickEggScorpion2, "tickEggScorpion");
      function scorpionGeometry2(b) {
        const a = b.age, s = b.state, entry = s === "entrance" ? 1 - ease((a - 30) / 160) : 0, offset = entry * 360;
        let head = { x: b.x - 50, y: b.y - 210 + offset }, tail = { x: b.x + 30, y: b.y - 365 + offset };
        if (s === "entrance") {
          head.y = a < 105 ? mix(b.y + 100, b.y - 90, (a - 25) / 80) : mix(b.y - 90, b.y - 210, (a - 105) / 85);
          tail.y = mix(b.y + 250, b.y - 365, (a - 145) / 80);
        }
        const low = { x: b.biteX ?? b.x - 260, y: b.y - 90 };
        if (s === "bite-windup") {
          head.x += mix(0, 35, a / 55);
          head.y -= mix(0, 20, a / 55);
        }
        if (s === "bite-lunge") {
          head = { x: mix(b.x - 15, low.x, a / 24), y: mix(b.y - 230, low.y, a / 24) };
        }
        if (["bite-hold", "bite-open", "hit"].includes(s)) head = { ...low };
        if (s === "bite-retract")
          head = { x: mix(low.x, b.x - 50, a / 42), y: mix(low.y, b.y - 210, a / 42) };
        if (s === "tail-windup")
          tail = {
            x: mix(b.x + 30, b.target.x, a / 65),
            y: b.y - 365 - Math.sin(Math.min(1, a / 65) * Math.PI) * 35
          };
        if (s === "tail-strike") tail = { x: b.target.x, y: mix(b.y - 365, b.y - 8, a / 9) };
        if (s === "tail-retract")
          tail = { x: mix(b.target.x, b.x + 30, a / 45), y: mix(b.y - 8, b.y - 365, a / 45) };
        if (["laser-windup", "laser-fire", "laser-cool"].includes(s))
          tail = { x: b.x - 15, y: b.y - 340 };
        const lowering = ["bite-lunge", "bite-hold", "bite-open", "bite-retract", "hit"].includes(s), bodyShift = lowering ? (head.x - (b.x - 50)) * 0.65 : 0, bodyDrop = lowering ? (head.y - (b.y - 210)) * 0.3 : 0;
        return {
          body: {
            x: b.x + 30 + bodyShift,
            y: s === "entrance" ? mix(b.y + 230, b.y - 130, (a - 85) / 110) : b.y - 130 + bodyDrop
          },
          head,
          eyes: [
            { x: head.x - 37, y: head.y },
            { x: head.x + 13, y: head.y }
          ],
          tip: tail,
          claws: [
            {
              x: b.x - 155,
              y: s === "entrance" ? mix(b.y + 110, b.y - 36, (a - 65) / 90) : b.y - 36
            },
            {
              x: b.x + 155,
              y: s === "entrance" ? mix(b.y + 110, b.y - 36, (a - 65) / 90) : b.y - 36
            }
          ],
          reveal: 1 - entry
        };
      }
      __name(scorpionGeometry2, "scorpionGeometry");
      function damageEggScorpion2(b, p2) {
        if (b.state !== "bite-open" || p2.ground || !p2.jumpAttack || p2.hurt > 0) return false;
        const g = scorpionGeometry2(b), eye = g.eyes.findIndex(
          (e, i) => (b.hits >= 2 || !b.shattered[i]) && Math.abs(p2.x - e.x) < 34 && Math.abs(p2.y - e.y) < 34
        );
        if (eye < 0) return false;
        if (b.hits < 2) b.shattered[eye] = true;
        b.hits++;
        b.laserMode = b.hits >= 2;
        enter(b, b.hits >= 3 ? "destroyed" : "hit", p2);
        return true;
      }
      __name(damageEggScorpion2, "damageEggScorpion");
      function segmentDistance(p2, a, z) {
        const dx = z.x - a.x, dy = z.y - a.y, t = clamp(((p2.x - a.x) * dx + (p2.y - a.y) * dy) / (dx * dx + dy * dy || 1), 0, 1);
        return Math.hypot(p2.x - a.x - dx * t, p2.y - a.y - dy * t);
      }
      __name(segmentDistance, "segmentDistance");
      function scorpionDanger2(b, p2) {
        const g = scorpionGeometry2(b);
        if (b.state === "tail-strike" && b.age >= 7 && Math.abs(p2.x - b.target.x) < 36 && p2.y + 20 >= g.tip.y - 20)
          return true;
        if (["bite-lunge", "bite-hold"].includes(b.state) && Math.abs(p2.x - g.head.x) < 125 && Math.abs(p2.y - (g.head.y + 35)) < 50)
          return true;
        if (b.state === "laser-fire" && b.beam && (segmentDistance(p2, b.beam.a, b.beam.z) < 24 || segmentDistance({ x: p2.x, y: p2.y + 15 }, b.beam.a, b.beam.z) < 20))
          return true;
        if (!["entrance", "hit", "destroyed", "defeated"].includes(b.state)) {
          if (Math.abs(p2.x - g.body.x) < 90 && p2.y + 20 > g.body.y - 80 && p2.y < b.y) return true;
          if (g.claws.some((c) => Math.abs(p2.x - c.x) < 32 && Math.abs(p2.y - c.y) < 65)) return true;
        }
        return false;
      }
      __name(scorpionDanger2, "scorpionDanger");
      const api = {
        createEggScorpion: createEggScorpion2,
        tickEggScorpion: tickEggScorpion2,
        scorpionGeometry: scorpionGeometry2,
        damageEggScorpion: damageEggScorpion2,
        scorpionDanger: scorpionDanger2
      };
      if (false) (void 0).exports = api;
      else Object.assign(root, api);
    })(typeof window !== "undefined" ? window : globalThis);
  }
  __name(initializeRuntimeModule12, "initializeRuntimeModule");
  function getRuntimeBindings12() {
    return {
      createEggScorpion: {
        get: /* @__PURE__ */ __name(() => createEggScorpion, "get"),
        set: /* @__PURE__ */ __name((value) => {
          createEggScorpion = value;
        }, "set")
      },
      tickEggScorpion: {
        get: /* @__PURE__ */ __name(() => tickEggScorpion, "get"),
        set: /* @__PURE__ */ __name((value) => {
          tickEggScorpion = value;
        }, "set")
      },
      scorpionGeometry: {
        get: /* @__PURE__ */ __name(() => scorpionGeometry, "get"),
        set: /* @__PURE__ */ __name((value) => {
          scorpionGeometry = value;
        }, "set")
      },
      damageEggScorpion: {
        get: /* @__PURE__ */ __name(() => damageEggScorpion, "get"),
        set: /* @__PURE__ */ __name((value) => {
          damageEggScorpion = value;
        }, "set")
      },
      scorpionDanger: {
        get: /* @__PURE__ */ __name(() => scorpionDanger, "get"),
        set: /* @__PURE__ */ __name((value) => {
          scorpionDanger = value;
        }, "set")
      }
    };
  }
  __name(getRuntimeBindings12, "getRuntimeBindings");

  // src/boss-art.js
  var boss_art_exports = {};
  __export(boss_art_exports, {
    drawScorpionLink: () => drawScorpionLink,
    getRuntimeBindings: () => getRuntimeBindings13,
    initializeRuntimeModule: () => initializeRuntimeModule13,
    prepareScorpionArt: () => prepareScorpionArt,
    renderEggScorpion: () => renderEggScorpion,
    scorpionBounds: () => scorpionBounds,
    scorpionPart: () => scorpionPart,
    scorpionParts: () => scorpionParts,
    scorpionStamp: () => scorpionStamp,
    scorpionStamps: () => scorpionStamps
  });
  var scorpionParts;
  var scorpionStamps;
  var scorpionBounds;
  function prepareScorpionArt(image) {
    scorpionStamps.clear();
    for (const [name, [x, y, r, b, width]] of Object.entries(scorpionBounds)) {
      const c = document.createElement("canvas");
      c.width = r - x;
      c.height = b - y;
      const dc = c.getContext("2d");
      dc.imageSmoothingEnabled = false;
      dc.drawImage(image, x, y, r - x, b - y, 0, 0, c.width, c.height);
      scorpionParts.set(name, { image: c, width, height: Math.round((b - y) * width / (r - x)) });
    }
  }
  __name(prepareScorpionArt, "prepareScorpionArt");
  function scorpionStamp(name, angle = 0, mirror = false) {
    const part = scorpionParts.get(name);
    if (!part) return null;
    const turn = Math.round(angle / (Math.PI / 16)), key = name + ":" + turn + ":" + mirror;
    if (scorpionStamps.has(key)) return scorpionStamps.get(key);
    const size = Math.ceil(Math.hypot(part.width, part.height)) + 4;
    const stamp = {
      ...part,
      angle: turn * Math.PI / 16,
      mirror,
      offset: 2 * Math.floor(size / 2) - size
    };
    scorpionStamps.set(key, stamp);
    return stamp;
  }
  __name(scorpionStamp, "scorpionStamp");
  function scorpionPart(name, x, y, angle = 0, mirror = false) {
    const stamp = scorpionStamp(name, angle, mirror);
    if (!stamp) return;
    ctx.save();
    ctx.translate(Math.round(x / 2) * 2 + stamp.offset, Math.round(y / 2) * 2 + stamp.offset);
    ctx.rotate(stamp.angle);
    if (stamp.mirror) ctx.scale(-1, 1);
    ctx.imageSmoothingEnabled = false;
    ctx.drawImage(
      stamp.image,
      -Math.floor(stamp.width / 2) * 2,
      -Math.floor(stamp.height / 2) * 2,
      stamp.width * 2,
      stamp.height * 2
    );
    ctx.restore();
  }
  __name(scorpionPart, "scorpionPart");
  function drawScorpionLink(a, z, width = 20) {
    cityPixelLine(a.x, a.y, z.x, z.y, "#07101d", width + 8);
    cityPixelLine(a.x, a.y, z.x, z.y, "#354254", width);
    cityPixelLine(a.x - 4, a.y - 3, z.x - 4, z.y - 3, "#72869a", 4);
    cityPixelLine(a.x + 7, a.y, z.x + 7, z.y, "#c91d2b", 4);
  }
  __name(drawScorpionLink, "drawScorpionLink");
  function renderEggScorpion(b) {
    const g = scorpionGeometry(b), s = b.state, roof = b.y;
    ctx.save();
    ctx.beginPath();
    ctx.rect(b.arena.x, roof - 560, b.arena.w, 560);
    ctx.clip();
    if (s === "destroyed" || s === "defeated") {
      const t = Math.min(1, b.age / 100);
      for (let i = 0; i < 12; i++) {
        const a = i * 2.4, x = b.x + Math.cos(a) * t * (110 + i * 12), y = roof - 120 + Math.sin(a) * t * 140 + t * t * 160;
        cityPixelRect(x, y, 12, 8, i % 2 ? "#d92a32" : "#718295");
      }
      if (s === "destroyed" && b.age < 110) {
        ctx.globalAlpha = 1 - t;
        scorpionPart("body", g.body.x, g.body.y);
        ctx.globalAlpha = 1;
        for (let i = 0; i < 5; i++) {
          const x = b.x - 160 + i * 70, y = roof - 60 - Math.sin(b.age * 0.11 + i) * 90;
          cityPixelOval(x, y, 24 + b.age % 12, 24, "#fd492a");
          cityPixelOval(x, y, 14, 14, "#ffe98c");
        }
      }
      ctx.restore();
      return;
    }
    const base = { x: g.body.x + 65, y: g.body.y - 20 }, control = {
      x: b.x + 180,
      y: b.state === "entrance" ? Math.max(g.tip.y, roof - 370) : roof - 370
    };
    let last = base;
    for (let i = 1; i <= 9; i++) {
      const t = i / 9, z = {
        x: (1 - t) * (1 - t) * base.x + 2 * (1 - t) * t * control.x + t * t * g.tip.x,
        y: (1 - t) * (1 - t) * base.y + 2 * (1 - t) * t * control.y + t * t * g.tip.y
      };
      drawScorpionLink(last, z, 26 - i);
      cityPixelOval(z.x, z.y, 10, 10, "#07101d");
      cityPixelOval(z.x, z.y, 6, 6, "#dd2631");
      last = z;
    }
    scorpionPart(
      b.laserMode ? "cannon" : "stinger",
      g.tip.x,
      g.tip.y,
      s === "tail-strike" ? -0.5 : 0
    );
    scorpionPart("body", g.body.x, g.body.y + Math.sin(b.age * 0.045) * 2);
    for (let i = 0; i < 2; i++) {
      const c = g.claws[i], shoulder = { x: g.body.x + (i ? 80 : -80), y: g.body.y - 20 };
      drawScorpionLink(shoulder, { x: c.x, y: c.y - 80 }, 24);
      scorpionPart("claw", c.x, c.y - 30, 0, i === 1);
      if (b.anchored) {
        for (let j = 0; j < 3; j++)
          cityPixelLine(c.x, c.y + 30, c.x + (j - 1) * 22, roof, "#0c1424", 4);
        cityPixelRect(c.x - 15, roof - 4, 30, 4, "#f19b79");
      }
    }
    const h = g.head, neck = { x: g.body.x - 70, y: g.body.y - 20 };
    drawScorpionLink({ x: g.body.x - 30, y: g.body.y - 10 }, neck, 36);
    drawScorpionLink(neck, { x: h.x + 20, y: h.y + 35 }, 30);
    const bite = ["bite-windup", "bite-lunge", "bite-hold"].includes(s), jawAngle = bite ? s === "bite-windup" ? Math.min(1, b.age / 45) * 0.65 : 0.65 : s === "bite-open" ? 0.15 : 0;
    scorpionPart("jaw", h.x - 75, h.y + 43, -jawAngle);
    scorpionPart("jaw", h.x + 75, h.y + 43, jawAngle, true);
    scorpionPart("head", h.x, h.y);
    for (let i = 0; i < 2; i++)
      if (b.shattered[i]) {
        const e = g.eyes[i];
        cityPixelOval(e.x, e.y, 27, 29, "#09101b");
        cityPixelLine(e.x - 13, e.y - 12, e.x + 12, e.y + 10, "#586a7b", 4);
        cityPixelRect(e.x - 3, e.y - 5, 6, 8, "#ff4b3a");
      }
    if (s === "bite-open") {
      const pulse = Math.floor(b.age / 10) % 2;
      for (const [i, e] of g.eyes.entries()) {
        if (b.hits < 2 && b.shattered[i]) continue;
        cityPixelRect(e.x - 24, e.y - 30, 12, 2, pulse ? "#fff5bb" : "#ffd149");
        cityPixelRect(e.x + 12, e.y + 28, 12, 2, "#ffd149");
      }
    }
    if (s === "hit" && b.age % 6 < 3) {
      ctx.globalAlpha = 0.45;
      cityPixelOval(h.x, h.y - 15, 72, 65, "#eafaff");
      ctx.globalAlpha = 1;
    }
    if (["tail-windup", "tail-strike"].includes(s)) {
      const x = b.target.x, pulse = Math.floor(b.age / 6) % 2;
      cityPixelRect(x - 38, roof - 4, 76, 4, pulse ? "#ffe088" : "#ff4037");
      for (let i = -1; i <= 1; i++) cityPixelRect(x + i * 22 - 4, roof - 14, 8, 6, "#ff6650");
      if (s === "tail-windup") cityPixelLine(x, roof - 30, x, roof - 80, "#ff4e4960", 4);
    }
    if (s === "laser-windup") {
      const z = b.target;
      cityPixelLine(g.tip.x, g.tip.y, z.x, z.y, "#ff3f5860", 2);
      cityPixelOval(g.tip.x - 12, g.tip.y - 10, 6 + b.age / 14, 6 + b.age / 14, "#ffe799");
    }
    if (s === "laser-fire" && b.beam) {
      cityPixelLine(b.beam.a.x, b.beam.a.y, b.beam.z.x, b.beam.z.y, "#ad1f58", 22);
      cityPixelLine(b.beam.a.x, b.beam.a.y, b.beam.z.x, b.beam.z.y, "#ff5155", 12);
      cityPixelLine(b.beam.a.x, b.beam.a.y, b.beam.z.x, b.beam.z.y, "#fff4c2", 4);
    }
    ctx.restore();
  }
  __name(renderEggScorpion, "renderEggScorpion");
  function initializeRuntimeModule13() {
    scorpionParts = /* @__PURE__ */ new Map();
    scorpionStamps = /* @__PURE__ */ new Map();
    scorpionBounds = {
      body: [16, 125, 430, 503, 132],
      head: [455, 88, 811, 460, 84],
      jaw: [800, 177, 1184, 485, 64],
      claw: [1198, 54, 1534, 506, 58],
      tail: [65, 520, 327, 991, 46],
      stinger: [369, 573, 779, 958, 65],
      cannon: [796, 562, 1169, 966, 65],
      eyes: [1176, 674, 1535, 991, 74]
    };
  }
  __name(initializeRuntimeModule13, "initializeRuntimeModule");
  function getRuntimeBindings13() {
    return {
      scorpionParts: {
        get: /* @__PURE__ */ __name(() => scorpionParts, "get"),
        set: /* @__PURE__ */ __name((value) => {
          scorpionParts = value;
        }, "set")
      },
      scorpionStamps: {
        get: /* @__PURE__ */ __name(() => scorpionStamps, "get"),
        set: /* @__PURE__ */ __name((value) => {
          scorpionStamps = value;
        }, "set")
      },
      scorpionBounds: {
        get: /* @__PURE__ */ __name(() => scorpionBounds, "get"),
        set: /* @__PURE__ */ __name((value) => {
          scorpionBounds = value;
        }, "set")
      },
      prepareScorpionArt: {
        get: /* @__PURE__ */ __name(() => prepareScorpionArt, "get"),
        set: /* @__PURE__ */ __name((value) => {
          prepareScorpionArt = value;
        }, "set")
      },
      scorpionStamp: {
        get: /* @__PURE__ */ __name(() => scorpionStamp, "get"),
        set: /* @__PURE__ */ __name((value) => {
          scorpionStamp = value;
        }, "set")
      },
      scorpionPart: {
        get: /* @__PURE__ */ __name(() => scorpionPart, "get"),
        set: /* @__PURE__ */ __name((value) => {
          scorpionPart = value;
        }, "set")
      },
      drawScorpionLink: {
        get: /* @__PURE__ */ __name(() => drawScorpionLink, "get"),
        set: /* @__PURE__ */ __name((value) => {
          drawScorpionLink = value;
        }, "set")
      },
      renderEggScorpion: {
        get: /* @__PURE__ */ __name(() => renderEggScorpion, "get"),
        set: /* @__PURE__ */ __name((value) => {
          renderEggScorpion = value;
        }, "set")
      }
    };
  }
  __name(getRuntimeBindings13, "getRuntimeBindings");

  // src/city-polish.js
  var city_polish_exports = {};
  __export(city_polish_exports, {
    drawBoostMonitor: () => drawBoostMonitor,
    drawCityDetails: () => drawCityDetails,
    drawDamagedRoof: () => drawDamagedRoof,
    drawDebrisWarning: () => drawDebrisWarning,
    drawPixelDebris: () => drawPixelDebris,
    drawPixelEnemy: () => drawPixelEnemy,
    drawPixelSign: () => drawPixelSign,
    drawPixelSpikes: () => drawPixelSpikes,
    drawPlayerAbilities: () => drawPlayerAbilities,
    drawPolishedSpring: () => drawPolishedSpring,
    drawPolishedVent: () => drawPolishedVent,
    drawPoolBooster: () => drawPoolBooster,
    getRuntimeBindings: () => getRuntimeBindings14,
    initializeRuntimeModule: () => initializeRuntimeModule14,
    polishCached: () => polishCached,
    polishCompile: () => polishCompile,
    polishDirection: () => polishDirection,
    polishDraw: () => polishDraw,
    polishFont: () => polishFont,
    polishRaster: () => polishRaster,
    polishSpriteCache: () => polishSpriteCache,
    polishVisible: () => polishVisible,
    polishedSpringFrame: () => polishedSpringFrame,
    updateCityInteriors: () => updateCityInteriors
  });
  var polishSpriteCache;
  var polishFont;
  function polishVisible(x, y, w = 80, h = 120) {
    return x + w >= state.cam - 40 && x - w <= state.cam + W / state.zoom + 40 && y + h >= state.camY - 40 && y - h <= state.camY + H / state.zoom + 40;
  }
  __name(polishVisible, "polishVisible");
  function polishRaster(width, height, paint) {
    const pixels = new Array(width * height).fill(null);
    const dot = /* @__PURE__ */ __name((x, y, color) => {
      x = Math.round(x);
      y = Math.round(y);
      if (x >= 0 && x < width && y >= 0 && y < height) pixels[y * width + x] = color;
    }, "dot");
    const box = /* @__PURE__ */ __name((x, y, w, h, color) => {
      for (let yy = y; yy < y + h; yy++) for (let xx = x; xx < x + w; xx++) dot(xx, yy, color);
    }, "box");
    const line = /* @__PURE__ */ __name((x1, y1, x2, y2, color, thickness = 1) => {
      const n = Math.max(Math.abs(x2 - x1), Math.abs(y2 - y1), 1);
      for (let i = 0; i <= n; i++)
        box(
          Math.round(x1 + (x2 - x1) * i / n),
          Math.round(y1 + (y2 - y1) * i / n),
          thickness,
          thickness,
          color
        );
    }, "line");
    const disk = /* @__PURE__ */ __name((cx, cy, rx, ry, color) => {
      for (let y = -ry; y <= ry; y++) {
        const span = Math.floor(rx * Math.sqrt(Math.max(0, 1 - y * y / (ry * ry))));
        box(cx - span, cy + y, span * 2 + 1, 1, color);
      }
    }, "disk");
    paint({ dot, box, line, disk });
    return { width, height, pixels };
  }
  __name(polishRaster, "polishRaster");
  function polishCompile(raster, angle = 0, anchorX = 0, anchorY = 0) {
    const runs = [], a = angle * Math.PI / 8, c = Math.cos(a), s = Math.sin(a), rotated = angle !== 0;
    const bound = rotated ? Math.ceil(Math.hypot(raster.width, raster.height)) : 0;
    const left = rotated ? -bound : -anchorX, top = rotated ? -bound : -anchorY, right = rotated ? bound : raster.width - anchorX, bottom = rotated ? bound : raster.height - anchorY;
    for (let y = top; y < bottom; y++) {
      let start2 = left, last = null;
      for (let x = left; x <= right; x++) {
        const sx = rotated ? Math.round(c * x + s * y + anchorX) : x + anchorX, sy = rotated ? Math.round(-s * x + c * y + anchorY) : y + anchorY;
        const color = x === right || sx < 0 || sy < 0 || sx >= raster.width || sy >= raster.height ? null : raster.pixels[sy * raster.width + sx];
        if (color !== last) {
          if (last) runs.push([start2 * 2, y * 2, (x - start2) * 2, 2, last]);
          start2 = x;
          last = color;
        }
      }
    }
    return runs;
  }
  __name(polishCompile, "polishCompile");
  function polishCached(key, build) {
    let sprite = polishSpriteCache.get(key);
    if (!sprite) {
      sprite = build();
      if (polishSpriteCache.size >= 192)
        polishSpriteCache.delete(polishSpriteCache.keys().next().value);
      polishSpriteCache.set(key, sprite);
    }
    return sprite;
  }
  __name(polishCached, "polishCached");
  function polishDraw(runs, x, y) {
    x = Math.round(x / 2) * 2;
    y = Math.round(y / 2) * 2;
    if (!runs.length) return;
    if (typeof document !== "undefined" && document.createElement && typeof ctx.drawImage === "function") {
      if (!runs.texture) {
        let left = Infinity, top = Infinity, right = -Infinity, bottom = -Infinity;
        for (const r of runs) {
          left = Math.min(left, r[0]);
          top = Math.min(top, r[1]);
          right = Math.max(right, r[0] + r[2]);
          bottom = Math.max(bottom, r[1] + r[3]);
        }
        const texture = document.createElement("canvas");
        texture.width = (right - left) / 2;
        texture.height = (bottom - top) / 2;
        const dc = texture.getContext("2d");
        if (dc) {
          for (const r of runs) {
            dc.fillStyle = r[4];
            dc.fillRect((r[0] - left) / 2, (r[1] - top) / 2, r[2] / 2, r[3] / 2);
          }
          runs.texture = texture;
          runs.left = left;
          runs.top = top;
        }
      }
      if (runs.texture) {
        ctx.drawImage(
          runs.texture,
          x + runs.left,
          y + runs.top,
          runs.texture.width * 2,
          runs.texture.height * 2
        );
        return;
      }
    }
    for (const r of runs) cityPixelRect(x + r[0], y + r[1], r[2], r[3], r[4]);
  }
  __name(polishDraw, "polishDraw");
  function polishDirection(device) {
    const horizontal = device.launchX ?? device.vx ?? 0, vertical = -(device.power ?? device.up ?? 25);
    return Math.round(Math.atan2(horizontal, -vertical) * 8 / Math.PI);
  }
  __name(polishDirection, "polishDirection");
  function polishedSpringFrame(device) {
    const age = state.runFrames - (device.firedAt ?? -1e3);
    if (age < 0 || age >= 24) return 0;
    return age < 3 ? 1 : age < 6 ? 2 : age < 10 ? 3 : age < 15 ? 4 : age < 20 ? 5 : 0;
  }
  __name(polishedSpringFrame, "polishedSpringFrame");
  function drawPolishedSpring(device) {
    if (!polishVisible(device.x, device.y, 64, 90)) return;
    const frame2 = polishedSpringFrame(device), angle = polishDirection(device);
    const runs = polishCached("spring/" + frame2 + "/" + angle, () => {
      const offsets = [0, 4, -9, -6, -3, 1], cap = 12 + offsets[frame2];
      const raster = polishRaster(29, 31, ({ box, disk, line }) => {
        box(5, 27, 19, 3, "#152238");
        box(3, 26, 23, 2, "#81243c");
        box(5, 25, 19, 2, "#e4413e");
        box(7, 25, 15, 1, "#ff9a5c");
        box(8, 28, 13, 1, "#aebac2");
        box(12, cap + 5, 5, 21 - cap, "#3d485b");
        for (let y = cap + 7; y < 25; y += 3) {
          line(9, y, 19, y + 2, "#8694a1");
          line(8, y, 18, y + 1, "#e2e5d7");
          box(8, y, 2, 1, "#ffffff");
          box(17, y + 1, 3, 1, "#687887");
        }
        disk(14, cap + 3, 13, 4, "#152238");
        disk(14, cap + 2, 12, 3, "#9a243e");
        disk(14, cap + 1, 11, 3, "#e8413a");
        box(5, cap, 19, 1, "#ff8a53");
        box(4, cap + 1, 3, 3, "#ff563f");
        box(22, cap + 2, 3, 2, "#bb273e");
        box(11, cap - 1, 7, 5, "#ffcc45");
        box(12, cap - 1, 5, 1, "#fff6a4");
        box(12, cap + 1, 5, 3, "#ffe476");
        box(13, cap + 4, 3, 1, "#a15c31");
        box(8, cap - 2, 4, 1, "#64d1ee");
        box(17, cap - 2, 4, 1, "#64d1ee");
        box(6, cap, 2, 1, "#ffe0a1");
      });
      return polishCompile(raster, angle, 14, 30);
    });
    polishDraw(runs, device.x, device.y);
  }
  __name(drawPolishedSpring, "drawPolishedSpring");
  function drawBoostMonitor(monitor) {
    if (!polishVisible(monitor.x, monitor.y, 42, 70)) return;
    const broken = !!monitor.broken, phase = Math.floor(state.runFrames / 8) % 3;
    const runs = polishCached(
      "monitor/" + (monitor.item || "boost") + "/" + (broken ? "broken" : phase),
      () => polishCompile(
        polishRaster(27, 31, ({ box, line, disk }) => {
          box(8, 28, 11, 2, "#131c30");
          box(9, 26, 9, 3, "#84909e");
          box(4, 29, 19, 2, "#142036");
          box(5, 28, 17, 1, "#b2bcc3");
          box(7, 27, 13, 1, "#e1e4de");
          if (broken) {
            box(3, 20, 21, 5, "#424d63");
            box(2, 21, 3, 4, "#9ca8b0");
            box(21, 20, 3, 5, "#9ca8b0");
            box(6, 22, 15, 3, "#172034");
            line(6, 23, 12, 17, "#6b778b");
            line(13, 24, 17, 18, "#8994a0");
            box(20, 25, 3, 1, "#c6424a");
            return;
          }
          box(3, 1, 21, 2, "#dde4e1");
          box(1, 3, 25, 21, "#39445a");
          box(2, 2, 23, 23, "#9aa4ac");
          box(3, 3, 21, 1, "#d5dfdf");
          box(3, 4, 2, 19, "#c7cfd0");
          box(23, 4, 1, 19, "#576779");
          box(4, 23, 19, 2, "#778795");
          box(5, 5, 17, 17, "#202437");
          box(6, 6, 15, 15, "#bc8438");
          box(7, 7, 13, 13, "#141e35");
          box(7, 6, 13, 1, "#ffda78");
          box(6, 7, 1, 13, "#efbc56");
          box(20, 7, 1, 13, "#987043");
          box(7, 20, 13, 1, "#e5b150");
          for (let y = 9; y < 19; y += 3) box(8, y, 11, 1, "#233248");
          box(8, 8, 9, 1, "#39485d");
          box(8, 9, 1, 5, "#56606b");
          if (monitor.item === "bubble") {
            disk(14, 14, 5, 5, "#6391de");
            disk(14, 14, 4, 4, "#285383");
            line(10, 12, 12, 10, "#eeffff", 2);
            box(16, 16, 2, 2, "#a4eaff");
          } else if (monitor.item !== "life") {
            const dx = phase === 1 ? 1 : 0;
            line(15 + dx, 9, 10 + dx, 14, "#8bb8cf", 2);
            line(14 + dx, 13, 10 + dx, 18, "#8bb8cf", 2);
            box(12 + dx, 12, 5, 2, "#8bb8cf");
            line(15 + dx, 8, 10 + dx, 13, "#edfaff", 2);
            box(11 + dx, 12, 6, 2, "#edfaff");
            line(15 + dx, 13, 10 + dx, 18, "#edfaff", 2);
            box(14 + dx, 8, 4, 1, "#edfaff");
          }
          box(3, 24, 2, 1, "#e94e5b");
          box(22, 24, 2, 1, "#e94e5b");
          box(9, 24, 3, 1, "#dae3df");
          box(14, 24, 3, 1, "#dae3df");
        }),
        0,
        13,
        30
      )
    );
    polishDraw(runs, monitor.x, monitor.y);
    if (monitor.item === "life" && !broken && art.recoveredSpeedster) {
      ctx.drawImage(
        art.recoveredSpeedster,
        20,
        362,
        131,
        87,
        Math.round(monitor.x - 12),
        Math.round(monitor.y - 46),
        24,
        16
      );
    }
  }
  __name(drawBoostMonitor, "drawBoostMonitor");
  function drawPoolBooster(device) {
    if (!polishVisible(device.x, device.y, 58, 90)) return;
    if (device.poolBooster && device.power === 0) {
      const phase2 = Math.floor(state.runFrames / 4) % 4;
      const runs2 = polishCached(
        "ground-pool/" + phase2,
        () => polishCompile(
          polishRaster(37, 13, ({ box, line, disk }) => {
            box(1, 9, 35, 4, "#18263a");
            box(2, 8, 33, 2, "#a7c6d3");
            box(4, 10, 29, 2, "#46586f");
            box(9, 2, 19, 6, "#992849");
            box(10, 2, 17, 1, "#ef6970");
            box(10, 7, 17, 1, "#4e253e");
            for (let i = 0; i < 3; i++) {
              const x = 11 + i * 5;
              line(x, 3, x + 2, 5, phase2 === i ? "#d8ffff" : "#70cbdc");
              line(x + 2, 5, x, 7, phase2 === i ? "#d8ffff" : "#70cbdc");
            }
            for (const x of [5, 31]) {
              disk(x, 6, 4, 4, "#172639");
              disk(x, 6, 3, 3, "#d6e6e8");
              disk(x, 6, 1, 1, "#7a8592");
              const d = phase2 % 2 ? 1 : 0;
              line(x - 2, 6 - d, x + 2, 6 + d, "#b5344e");
            }
            box(2, 11, 3, 1, "#e8eff0");
            box(32, 11, 3, 1, "#e8eff0");
          }),
          0,
          18,
          12
        )
      );
      polishDraw(runs2, device.x, device.y);
      return;
    }
    const phase = Math.floor(state.runFrames / 4) % 4, angle = polishDirection(device);
    const runs = polishCached(
      "pool/" + phase + "/" + angle,
      () => polishCompile(
        polishRaster(37, 32, ({ box, line, disk }) => {
          box(3, 26, 31, 5, "#16223a");
          box(1, 24, 35, 4, "#46566d");
          box(3, 25, 31, 1, "#a5bdc7");
          box(5, 28, 27, 2, "#28394e");
          box(6, 20, 25, 5, "#971f43");
          box(7, 20, 23, 2, "#e84b58");
          box(7, 22, 23, 2, "#b52f4e");
          box(8, 24, 21, 1, "#f18b74");
          for (const x of [7, 29]) {
            disk(x, 17, 6, 7, "#15253b");
            disk(x, 17, 5, 6, "#e84b58");
            disk(x, 17, 4, 5, "#d9e8eb");
            disk(x, 17, 2, 3, "#697e92");
            const a = phase * Math.PI / 2, dx = Math.round(Math.cos(a) * 4), dy = Math.round(Math.sin(a) * 4);
            line(x - dx, 17 - dy, x + dx, 17 + dy, "#96334c");
            line(x + dy, 17 - dx, x - dy, 17 + dx, "#96334c");
            box(x, 17, 1, 1, "#f8f6d6");
          }
          box(12, 7, 13, 14, "#192c43");
          box(11, 7, 1, 14, "#a8ced7");
          box(25, 7, 1, 14, "#66879c");
          box(13, 8, 11, 11, "#426a80");
          for (let i = 0; i < 3; i++) {
            const y = 8 + (i * 4 + phase) % 12;
            line(14, y + 2, 18, y - 1, "#d9e8eb");
            line(18, y - 1, 22, y + 2, "#d9e8eb");
          }
          box(14, 20, 9, 1, "#7ce1ee");
          box(3, 25, 3, 2, "#d9e8eb");
          box(31, 25, 3, 2, "#d9e8eb");
        }),
        angle,
        18,
        31
      )
    );
    polishDraw(runs, device.x, device.y);
  }
  __name(drawPoolBooster, "drawPoolBooster");
  function drawPolishedVent(device) {
    if (!polishVisible(device.x, device.y, 50, 100)) return;
    const phase = Math.floor(state.runFrames / 4) % 4, hidden = !!device.hidden;
    const runs = polishCached(
      "vent/" + phase + "/" + hidden,
      () => polishCompile(
        polishRaster(35, 48, ({ box, line }) => {
          box(1, 40, 33, 7, "#16243a");
          box(2, 40, 31, 1, "#b3c4cc");
          box(3, 41, 29, 2, "#687d93");
          box(2, 46, 31, 1, "#3c4a62");
          for (let x = 5; x < 31; x += 4) {
            box(x, 42, 2, 4, "#14263b");
            box(x, 42, 2, 1, "#95aab8");
          }
          box(2, 43, 2, 3, "#c4d4d1");
          box(31, 43, 2, 3, "#c4d4d1");
          for (let i = 0; i < 4; i++) {
            const y = 34 - i * 9 - phase * 2;
            if (hidden) {
              box(8 + i * 5, y, 1, 2, i % 2 ? "#b9866f" : "#d2a889");
            } else {
              line(10, y + 4, 17, y, "#669aaf");
              line(17, y, 24, y + 4, "#669aaf");
              line(12, y + 3, 17, y, "#b9e4df");
              line(17, y, 22, y + 3, "#b9e4df");
            }
          }
        }),
        0,
        17,
        47
      )
    );
    polishDraw(runs, device.x, device.y);
  }
  __name(drawPolishedVent, "drawPolishedVent");
  function drawPixelDebris(debris) {
    if (!debris.triggered || debris.age < debris.warn || debris.age > debris.warn + debris.fall + 120)
      return;
    const t = Math.min(1, (debris.age - debris.warn) / Math.max(1, debris.fall)), y = debris.y - 460 + 460 * t * t;
    if (!polishVisible(debris.x, y, debris.w / 2 + 20, 64)) return;
    const width = Math.max(8, Math.round(debris.w / 2));
    const runs = polishCached(
      "debris/" + width,
      () => polishCompile(
        polishRaster(width, 24, ({ box, line }) => {
          box(2, 2, width - 4, 20, "#172139");
          box(4, 0, width - 8, 22, "#403349");
          box(2, 2, width - 4, 2, "#a68b85");
          box(4, 4, width - 8, 2, "#77657b");
          box(3, 6, width - 6, 14, "#4c415a");
          box(2, 20, width - 4, 3, "#241f35");
          for (let x = 6; x < width - 6; x += 9) {
            box(x, 7, 6, 9, "#1a283b");
            box(x + 1, 7, 4, 2, "#bf9187");
            box(x + 1, 10, 2, 5, "#e5a37c");
            box(x + 4, 10, 1, 5, "#556b85");
            box(x, 17, 6, 1, "#796574");
          }
          line(1, 14, 7, 18, "#172139", 2);
          line(width - 8, 5, width - 2, 11, "#172139", 2);
          box(3, 1, 3, 2, "#ddd0ac");
          box(width - 7, 3, 4, 1, "#cfb596");
          for (let x = 7; x < width - 4; x += 13) {
            box(x, 19, 7, 3, "#a84b48");
            box(x + 2, 20, 4, 2, "#ef8b46");
            box(x + 3, 21, 2, 2, "#ffcf70");
          }
        }),
        0,
        Math.floor(width / 2),
        23
      )
    );
    polishDraw(runs, debris.x, y);
  }
  __name(drawPixelDebris, "drawPixelDebris");
  function drawPixelEnemy(enemy) {
    if (enemy.alive === false || !polishVisible(enemy.x, enemy.y, 48, 60)) return;
    const drone = enemy.kind === "drone", phase = Math.floor(state.runFrames / 7 + (enemy.phase || 0)) % 2;
    const runs = polishCached(
      "enemy/" + (drone ? "drone/" : "crab/") + phase,
      () => polishCompile(
        polishRaster(35, 28, ({ box, line, disk }) => {
          if (drone) {
            for (const side of [0, 1]) {
              const x = side ? 25 : 3;
              box(x, 7, 7, 3, "#122139");
              box(x + 1, 5, 5, 8, "#a4b8c4");
              box(x + 2, 6, 4, 2, "#f4ebcf");
              box(x + 1, 12, 5, 2, "#506b81");
              box(x + 2, 14, 3, phase ? 5 : 3, "#74def0");
              box(x + 3, 14, 1, phase ? 3 : 5, "#e9ffff");
              line(side ? 24 : 10, 9, side ? 21 : 13, 15, "#c8d6d6", 2);
              line(side ? 25 : 9, 9, side ? 22 : 12, 14, "#687b94", 2);
            }
            disk(17, 14, 9, 9, "#0b192e");
            disk(17, 13, 8, 7, "#50738c");
            disk(17, 12, 6, 5, "#82a3b2");
            box(12, 8, 10, 2, "#cbd8d6");
            box(13, 7, 8, 1, "#e9eee0");
            box(11, 12, 13, 6, "#0f2439");
            box(12, 13, 11, 3, "#8c303d");
            box(13, 13, 3, 2, "#ff5c52");
            box(19, 13, 3, 2, "#ff5c52");
            box(13, 13, 1, 1, "#ffe7b0");
            box(19, 13, 1, 1, "#ffe7b0");
            box(15, 18, 5, 2, "#b8c9c6");
            box(16, 19, 3, 3, "#40526e");
            box(17, 22, 1, 2, "#c38183");
          } else {
            for (const side of [0, 1]) {
              const x = side ? 26 : 3;
              line(side ? 24 : 10, 13, x + 2, 8, "#c7d6d7", 2);
              line(x + 2, 9, x + 2, 5, "#606f88", 2);
              disk(x + 2, 5, 4, 4, "#12213a");
              disk(x + 2, 4, 3, 3, "#db4554");
              box(x + 1, 2, 3, 1, "#ffad81");
              box(x + 1, 4, 2, 3, "#742438");
              box(x + 2, 3, 2, 1, "#f7e4bc");
              for (let i = 0; i < 2; i++) {
                const start2 = side ? 23 : 11, outer = side ? 28 + i * 3 : 6 - i * 3, yy = 19 + i * 2 + (phase === i ? 1 : 0);
                line(start2, 17 + i * 2, outer, yy, "#bec8c8", 2);
                line(outer, yy, outer + (side ? 2 : -2), 24, "#586e87", 2);
                box(outer + (side ? 0 : -4), 24, 6, 2, "#14223b");
                box(outer + (side ? 1 : -3), 24, 4, 1, "#a8bbc6");
              }
            }
            disk(17, 14, 11, 9, "#0c1930");
            disk(17, 13, 10, 8, "#922443");
            disk(17, 11, 9, 6, "#d94760");
            disk(17, 9, 7, 3, "#fa795c");
            box(12, 8, 10, 1, "#ffd099");
            box(10, 13, 15, 6, "#10253b");
            box(11, 14, 13, 1, "#7495a3");
            box(12, 14, 4, 3, "#ff5c52");
            box(19, 14, 4, 3, "#ff5c52");
            box(12, 14, 2, 1, "#ffe7b0");
            box(19, 14, 2, 1, "#ffe7b0");
            box(15, 18, 5, 3, "#d5c8bd");
            box(16, 19, 3, 2, "#75899b");
            box(14, 22, 7, 2, "#3c4f6c");
          }
        }),
        0,
        17,
        14
      )
    );
    polishDraw(runs, enemy.x, enemy.y);
    if (enemy.bounceRoute) {
      const y = enemy.y - 36;
      cityPixelRect(enemy.x - 8, y + 4, 16, 2, "#162237");
      cityPixelLine(enemy.x - 8, y + 2, enemy.x, y - 6, "#ffe0a1", 2);
      cityPixelLine(enemy.x, y - 6, enemy.x + 8, y + 2, "#ffe0a1", 2);
    }
  }
  __name(drawPixelEnemy, "drawPixelEnemy");
  function drawPixelSpikes(hazard) {
    if (!polishVisible(hazard.x + hazard.w / 2, hazard.y, hazard.w / 2 + 20, hazard.h + 20)) return;
    ctx.save();
    const direction = hazard.direction ?? "up";
    if (direction !== "up") {
      if (direction === "left") {
        ctx.translate(hazard.x, hazard.y + hazard.h);
        ctx.rotate(-Math.PI / 2);
      } else if (direction === "right") {
        ctx.translate(hazard.x + hazard.w, hazard.y);
        ctx.rotate(Math.PI / 2);
      } else {
        ctx.translate(hazard.x + hazard.w, hazard.y + hazard.h);
        ctx.rotate(Math.PI);
      }
      hazard = {
        x: 0,
        y: 0,
        w: direction === "down" ? hazard.w : hazard.h,
        h: direction === "down" ? hazard.h : hazard.w
      };
    }
    const bottom = hazard.y + hazard.h, top = hazard.y, width = Math.min(20, hazard.w);
    cityPixelRect(hazard.x, bottom - 6, hazard.w, 6, "#152136");
    cityPixelRect(hazard.x, bottom - 6, hazard.w, 2, "#aa435f");
    for (let x = hazard.x; x < hazard.x + hazard.w; x += width) {
      const w = Math.min(width, hazard.x + hazard.w - x), middle = x + w / 2;
      for (let y = top; y < bottom - 6; y += 2) {
        const half = Math.min(w / 2 - 1, (y - top + 2) / (bottom - 6 - top) * w / 2);
        cityPixelRect(middle - half, y, half * 2, 2, "#47627c");
        cityPixelRect(middle - half, y, Math.max(2, half), 2, "#a7cedb");
        cityPixelRect(middle - half, y, 2, 2, "#eff5e7");
      }
      cityPixelRect(x + 2, bottom - 6, w - 4, 2, "#7894a2");
    }
    ctx.restore();
  }
  __name(drawPixelSpikes, "drawPixelSpikes");
  function drawDebrisWarning(debris) {
    if (!debris.triggered || debris.age >= debris.warn || !polishVisible(debris.x, debris.y, debris.w / 2 + 42, 160))
      return;
    const pulse = Math.floor(state.runFrames / 6) % 2, bright = pulse ? "#ff9750" : "#ffe18a", left = debris.x - debris.w / 2;
    cityPixelRect(left - 8, debris.y - 8, debris.w + 16, 8, "#182038");
    cityPixelRect(left, debris.y - 6, debris.w, 4, bright);
    for (let x = left; x < left + debris.w; x += 12) cityPixelRect(x, debris.y - 6, 4, 4, "#7b3847");
    for (const side of [-1, 1]) {
      const x = debris.x + side * (debris.w / 2 + 12);
      cityPixelRect(x - 2, debris.y - 20, 4, 18, bright);
      cityPixelRect(x + (side < 0 ? 0 : -10), debris.y - 20, 12, 4, bright);
    }
    const y = Math.max(
      state.camY + 44,
      Math.min(debris.y - 112, state.camY + H / state.zoom - 126)
    );
    for (let yy = 0; yy < 40; yy += 2) {
      const half = Math.floor((yy / 2 + 3) / 2) * 2;
      cityPixelRect(debris.x - half - 4, y + yy, half * 2 + 8, 2, "#132038");
      cityPixelRect(debris.x - half, y + yy, half * 2, 2, bright);
      if (yy > 8 && yy < 34 && half > 4)
        cityPixelRect(debris.x - half + 4, y + yy, half * 2 - 8, 2, "#2d2c3e");
    }
    cityPixelRect(debris.x - 2, y + 16, 4, 12, "#fff4c2");
    cityPixelRect(debris.x - 2, y + 30, 4, 4, "#fff4c2");
    for (let i = 0; i < 3; i++) {
      const yy = y + 48 + i * 14 + Math.floor(state.runFrames / 2) % 7 * 2;
      cityPixelLine(debris.x - 10, yy, debris.x, yy + 8, bright, 4);
      cityPixelLine(debris.x, yy + 8, debris.x + 10, yy, bright, 4);
    }
  }
  __name(drawDebrisWarning, "drawDebrisWarning");
  function drawPixelSign(x, y, text, type) {
    text = String(text).toUpperCase().slice(0, 40);
    const width = Math.max(72, text.length * 12 + 16);
    if (!polishVisible(x, y, width / 2, 70)) return;
    const color = type === "express" ? "#f4d287" : type === "roll" ? "#eca0c6" : type === "recovery" ? "#97b9da" : "#9ed5df";
    cityPixelRect(x - 4, y, 8, 38, "#18243a");
    cityPixelRect(x - 2, y, 2, 38, "#72889b");
    cityPixelRect(x - width / 2 - 2, y - 28, width + 4, 30, "#102034");
    cityPixelRect(x - width / 2, y - 26, width, 26, "#4c526a");
    cityPixelRect(x - width / 2 + 2, y - 24, width - 4, 22, "#19273e");
    cityPixelRect(x - width / 2 + 2, y - 26, width - 4, 2, color);
    cityPixelRect(x - width / 2 + 4, y - 22, 2, 2, "#cad6cf");
    cityPixelRect(x + width / 2 - 6, y - 22, 2, 2, "#cad6cf");
    const runs = polishCached(
      "sign/" + type + "/" + text,
      () => polishCompile(
        polishRaster(text.length * 6, 7, ({ box }) => {
          for (let i = 0; i < text.length; i++) {
            const glyph = polishFont[text[i]];
            if (!glyph) continue;
            for (let yy = 0; yy < 7; yy++)
              for (let xx = 0; xx < 5; xx++)
                if (glyph[yy][xx] === "1") box(i * 6 + xx, yy, 1, 1, color);
          }
        })
      )
    );
    polishDraw(runs, x - text.length * 6 + 2, y - 20);
  }
  __name(drawPixelSign, "drawPixelSign");
  function updateCityInteriors() {
    for (const building of state.level.buildings || []) {
      if (!building.rooms?.length) continue;
      const gate = building.gateId && (state.level.hazards || []).find((h) => h.id === building.gateId), open = !building.gateId || !!gate?.broken;
      let inside = false;
      if (open)
        for (const room of building.rooms) {
          const top = room.sloped ? building.y + 24 : room.y - 170, bottom = room.sloped ? room.bottom ?? room.y + 12 : room.y + 12;
          if (p.x >= room.x1 - 8 && p.x <= room.x2 + 8 && p.y + 20 >= top && p.y - 36 <= bottom) {
            inside = true;
            break;
          }
        }
      if (open && building.duct) {
        const duct = building.duct;
        if (Math.abs(p.x - duct.x) < 44 && p.y + 20 >= Math.min(duct.y1, duct.y2) && p.y - 36 <= Math.max(duct.y1, duct.y2))
          inside = true;
      }
      const target = inside ? 0.24 : 1, current = building.interiorOpacity ?? 1;
      building.interiorOpacity = current + (target - current) * 0.12;
      if (Math.abs(building.interiorOpacity - target) < 1e-3) building.interiorOpacity = target;
    }
  }
  __name(updateCityInteriors, "updateCityInteriors");
  function drawCityDetails() {
    for (const s of state.level.surfaces || []) if (s.fallen || s.damaged) drawDamagedRoof(s);
    if (!state.level.buildings) return;
    for (const building of state.level.buildings) {
      if (building.scenery || building.x + building.w < state.cam - 40 || building.x > state.cam + W / state.zoom + 40)
        continue;
      const roof = building.roofId && (state.level.surfaces || []).find((s) => s.id === building.roofId), roofY = roof && typeof yOn === "function" ? yOn(roof, building.x) : building.y;
      const y = roofY + 38, seed = Math.abs(building.seed || 0), left = building.x + 22, right = building.x + building.w - 22;
      if (y > state.camY + H / state.zoom + 40 || y + 160 < state.camY - 40 || right - left < 70)
        continue;
      const alpha = ctx.globalAlpha;
      ctx.globalAlpha = alpha * (building.interiorOpacity ?? 1);
      const panelX = left + 16 + seed % 3 * 12, panelW = Math.min(74, right - panelX - 8);
      if (polishVisible(panelX, y, panelW, 92)) {
        cityPixelRect(panelX, y, panelW, 44, "#152136");
        cityPixelRect(panelX + 2, y + 2, panelW - 4, 40, "#59647b");
        cityPixelRect(panelX + 4, y + 4, panelW - 8, 2, "#99a6ae");
        cityPixelRect(panelX + 4, y + 8, panelW - 8, 30, "#343f56");
        for (let yy = y + 10; yy < y + 36; yy += 6) {
          cityPixelRect(panelX + 8, yy, panelW - 16, 2, "#19283d");
          cityPixelRect(panelX + 8, yy + 2, panelW - 16, 2, "#748294");
        }
        cityPixelRect(panelX + 6, y + 40, 4, 4, "#bdd0c8");
        cityPixelRect(panelX + panelW - 10, y + 40, 4, 4, "#bdd0c8");
      }
      const pipeX = right - 16;
      cityPixelRect(pipeX, y, 10, 118, "#162238");
      cityPixelRect(pipeX + 2, y, 4, 118, "#708297");
      cityPixelRect(pipeX + 2, y, 2, 118, "#a4b5bf");
      for (let yy = y + 10; yy < y + 116; yy += 32) {
        cityPixelRect(pipeX - 4, yy, 18, 6, "#26324a");
        cityPixelRect(pipeX - 2, yy, 14, 2, "#879ca8");
      }
      if (building.burning || building.exposed) {
        const x = Math.min(right - 36, panelX + panelW + 20), yy = y + 54;
        cityPixelLine(x, yy, x + 18, yy + 26, "#121e33", 4);
        cityPixelLine(x + 18, yy + 26, x + 8, yy + 48, "#121e33", 4);
        cityPixelRect(x + 2, yy + 4, 4, 10, "#8d7188");
        cityPixelRect(x - 8, yy + 66, 32, 8, "#17233a");
        cityPixelRect(x - 6, yy + 66, 12, 2, "#866d7b");
        cityPixelRect(x + 10, yy + 70, 12, 2, "#63758a");
      }
      ctx.globalAlpha = alpha;
    }
  }
  __name(drawCityDetails, "drawCityDetails");
  function drawDamagedRoof(s) {
    const slope = (s.y2 - s.y1) / (s.x2 - s.x1), floor = /* @__PURE__ */ __name((x) => s.y1 + (x - s.x1) * slope, "floor");
    if (s.x2 < state.cam - 40 || s.x1 > state.cam + W / state.zoom + 40 || Math.min(s.y1, s.y2) > state.camY + H / state.zoom + 40 || Math.max(s.y1, s.y2) + 190 < state.camY - 40)
      return;
    const first = Math.max(0, Math.floor((state.cam - 40 - s.x1 - 30) / 120));
    for (let i = first, x = s.x1 + 30 + i * 120; x < s.x2 - 60 && x < state.cam + W / state.zoom + 40; i++, x += 120) {
      const y = Math.ceil((floor(x) + 38) / 2) * 2;
      cityPixelRect(x, y, 56, 46, "#101a2d");
      cityPixelRect(x + 2, y + 2, 52, 4, "#71889a");
      cityPixelRect(x + 4, y + 10, 18, 26, "#456e86");
      cityPixelRect(x + 34, y + 8, 16, 18, "#35506b");
      cityPixelLine(x + 18, y + 4, x + 30, y + 18, "#101a2d", 4);
      cityPixelLine(x + 30, y + 18, x + 22, y + 32, "#101a2d", 4);
      for (const [dx, dy] of [
        [20, 34],
        [28, 40],
        [42, 30]
      ]) {
        cityPixelRect(x + dx, y + dy, 6, 4, "#82b7c3");
        cityPixelRect(x + dx + 2, y + dy, 2, 2, "#c9e2df");
      }
      const braceY = y + 52;
      cityPixelLine(x + 4, braceY, x + 24, braceY + 24, "#121c30", 10);
      cityPixelLine(x + 4, braceY, x + 24, braceY + 24, "#6f6b7b", 4);
      cityPixelLine(x + 28, braceY + 40, x + 48, braceY + 56, "#121c30", 10);
      cityPixelLine(x + 28, braceY + 40, x + 48, braceY + 56, "#9a7887", 4);
      cityPixelRect(x + 20, braceY + 24, 8, 6, "#b39b96");
      cityPixelRect(x + 26, braceY + 36, 6, 6, "#8f94a1");
      cityPixelLine(x + 64, y + 10, x + 72, y + 30, "#0d172a", 4);
      cityPixelLine(x + 72, y + 30, x + 62, y + 46, "#0d172a", 4);
      cityPixelRect(x + 6, y + 126, 60, 8, "#172238");
      cityPixelRect(x + 10, y + 120, 14, 8, "#767084");
      cityPixelRect(x + 34, y + 116, 20, 12, "#544e68");
      cityPixelRect(x + 38, y + 116, 12, 2, "#9b7f8f");
    }
  }
  __name(drawDamagedRoof, "drawDamagedRoof");
  function drawPlayerAbilities() {
    if (p.shield === "bubble") {
      const radius = p.bubbleSlam ? 29 : 31 + Math.floor(state.runFrames / 10) % 2;
      cityPixelOval(p.x, p.y - 2, radius, radius, "#6eb9ed24");
      for (let i = 0; i < 32; i++) {
        const a = i * Math.PI / 16, b = (i + 1) * Math.PI / 16;
        cityPixelLine(
          p.x + Math.cos(a) * radius,
          p.y - 2 + Math.sin(a) * radius,
          p.x + Math.cos(b) * radius,
          p.y - 2 + Math.sin(b) * radius,
          i > 16 && i < 25 ? "#e6ffff" : "#659feab0",
          2
        );
      }
      cityPixelRect(p.x - 20, p.y - 23, 8, 2, "#ffffff");
      cityPixelRect(p.x - 23, p.y - 20, 2, 6, "#baffff");
    }
    if (p.underwater && p.shield !== "bubble" && p.airRemaining <= 720 && state.mode === "playing") {
      const value = Math.min(5, Math.floor(Math.max(0, p.airRemaining - 1) / 120));
      const glyph = [
        "111101101101111",
        "010110010010111",
        "111001111100111",
        "111001111001111",
        "101101111001001",
        "111100111001111"
      ][value];
      const x = p.x + 24, y = p.y - 52 - (120 - p.airRemaining % 120) * 0.12;
      cityPixelOval(x + 6, y + 10, 13, 16, "#102943cc");
      for (let i = 0; i < 15; i++)
        if (glyph[i] === "1")
          cityPixelRect(x + i % 3 * 4, y + Math.floor(i / 3) * 4, 4, 4, "#e6faff");
    }
  }
  __name(drawPlayerAbilities, "drawPlayerAbilities");
  function initializeRuntimeModule14() {
    polishSpriteCache = /* @__PURE__ */ new Map();
    polishFont = {
      A: ["01110", "10001", "10001", "11111", "10001", "10001", "10001"],
      B: ["11110", "10001", "10001", "11110", "10001", "10001", "11110"],
      C: ["01111", "10000", "10000", "10000", "10000", "10000", "01111"],
      D: ["11110", "10001", "10001", "10001", "10001", "10001", "11110"],
      E: ["11111", "10000", "10000", "11110", "10000", "10000", "11111"],
      F: ["11111", "10000", "10000", "11110", "10000", "10000", "10000"],
      G: ["01111", "10000", "10000", "10111", "10001", "10001", "01111"],
      H: ["10001", "10001", "10001", "11111", "10001", "10001", "10001"],
      I: ["11111", "00100", "00100", "00100", "00100", "00100", "11111"],
      J: ["00111", "00010", "00010", "00010", "10010", "10010", "01100"],
      K: ["10001", "10010", "10100", "11000", "10100", "10010", "10001"],
      L: ["10000", "10000", "10000", "10000", "10000", "10000", "11111"],
      M: ["10001", "11011", "10101", "10101", "10001", "10001", "10001"],
      N: ["10001", "11001", "10101", "10011", "10001", "10001", "10001"],
      O: ["01110", "10001", "10001", "10001", "10001", "10001", "01110"],
      P: ["11110", "10001", "10001", "11110", "10000", "10000", "10000"],
      Q: ["01110", "10001", "10001", "10001", "10101", "10010", "01101"],
      R: ["11110", "10001", "10001", "11110", "10100", "10010", "10001"],
      S: ["01111", "10000", "10000", "01110", "00001", "00001", "11110"],
      T: ["11111", "00100", "00100", "00100", "00100", "00100", "00100"],
      U: ["10001", "10001", "10001", "10001", "10001", "10001", "01110"],
      V: ["10001", "10001", "10001", "10001", "10001", "01010", "00100"],
      W: ["10001", "10001", "10001", "10101", "10101", "10101", "01010"],
      X: ["10001", "10001", "01010", "00100", "01010", "10001", "10001"],
      Y: ["10001", "10001", "01010", "00100", "00100", "00100", "00100"],
      Z: ["11111", "00001", "00010", "00100", "01000", "10000", "11111"],
      0: ["01110", "10001", "10011", "10101", "11001", "10001", "01110"],
      1: ["00100", "01100", "00100", "00100", "00100", "00100", "01110"],
      2: ["01110", "10001", "00001", "00010", "00100", "01000", "11111"],
      3: ["11110", "00001", "00001", "01110", "00001", "00001", "11110"],
      4: ["00010", "00110", "01010", "10010", "11111", "00010", "00010"],
      5: ["11111", "10000", "10000", "11110", "00001", "00001", "11110"],
      6: ["01110", "10000", "10000", "11110", "10001", "10001", "01110"],
      7: ["11111", "00001", "00010", "00100", "01000", "01000", "01000"],
      8: ["01110", "10001", "10001", "01110", "10001", "10001", "01110"],
      9: ["01110", "10001", "10001", "01111", "00001", "00001", "01110"],
      "-": ["00000", "00000", "00000", "11111", "00000", "00000", "00000"],
      "/": ["00001", "00001", "00010", "00100", "01000", "10000", "10000"],
      "!": ["00100", "00100", "00100", "00100", "00100", "00000", "00100"],
      "?": ["01110", "10001", "00001", "00010", "00100", "00000", "00100"],
      ">": ["10000", "01000", "00100", "00010", "00100", "01000", "10000"],
      "<": ["00001", "00010", "00100", "01000", "00100", "00010", "00001"],
      ":": ["00000", "00100", "00100", "00000", "00100", "00100", "00000"]
    };
  }
  __name(initializeRuntimeModule14, "initializeRuntimeModule");
  function getRuntimeBindings14() {
    return {
      polishSpriteCache: {
        get: /* @__PURE__ */ __name(() => polishSpriteCache, "get"),
        set: /* @__PURE__ */ __name((value) => {
          polishSpriteCache = value;
        }, "set")
      },
      polishVisible: {
        get: /* @__PURE__ */ __name(() => polishVisible, "get"),
        set: /* @__PURE__ */ __name((value) => {
          polishVisible = value;
        }, "set")
      },
      polishRaster: {
        get: /* @__PURE__ */ __name(() => polishRaster, "get"),
        set: /* @__PURE__ */ __name((value) => {
          polishRaster = value;
        }, "set")
      },
      polishCompile: {
        get: /* @__PURE__ */ __name(() => polishCompile, "get"),
        set: /* @__PURE__ */ __name((value) => {
          polishCompile = value;
        }, "set")
      },
      polishCached: {
        get: /* @__PURE__ */ __name(() => polishCached, "get"),
        set: /* @__PURE__ */ __name((value) => {
          polishCached = value;
        }, "set")
      },
      polishDraw: {
        get: /* @__PURE__ */ __name(() => polishDraw, "get"),
        set: /* @__PURE__ */ __name((value) => {
          polishDraw = value;
        }, "set")
      },
      polishDirection: {
        get: /* @__PURE__ */ __name(() => polishDirection, "get"),
        set: /* @__PURE__ */ __name((value) => {
          polishDirection = value;
        }, "set")
      },
      polishedSpringFrame: {
        get: /* @__PURE__ */ __name(() => polishedSpringFrame, "get"),
        set: /* @__PURE__ */ __name((value) => {
          polishedSpringFrame = value;
        }, "set")
      },
      drawPolishedSpring: {
        get: /* @__PURE__ */ __name(() => drawPolishedSpring, "get"),
        set: /* @__PURE__ */ __name((value) => {
          drawPolishedSpring = value;
        }, "set")
      },
      drawBoostMonitor: {
        get: /* @__PURE__ */ __name(() => drawBoostMonitor, "get"),
        set: /* @__PURE__ */ __name((value) => {
          drawBoostMonitor = value;
        }, "set")
      },
      drawPoolBooster: {
        get: /* @__PURE__ */ __name(() => drawPoolBooster, "get"),
        set: /* @__PURE__ */ __name((value) => {
          drawPoolBooster = value;
        }, "set")
      },
      drawPolishedVent: {
        get: /* @__PURE__ */ __name(() => drawPolishedVent, "get"),
        set: /* @__PURE__ */ __name((value) => {
          drawPolishedVent = value;
        }, "set")
      },
      drawPixelDebris: {
        get: /* @__PURE__ */ __name(() => drawPixelDebris, "get"),
        set: /* @__PURE__ */ __name((value) => {
          drawPixelDebris = value;
        }, "set")
      },
      drawPixelEnemy: {
        get: /* @__PURE__ */ __name(() => drawPixelEnemy, "get"),
        set: /* @__PURE__ */ __name((value) => {
          drawPixelEnemy = value;
        }, "set")
      },
      drawPixelSpikes: {
        get: /* @__PURE__ */ __name(() => drawPixelSpikes, "get"),
        set: /* @__PURE__ */ __name((value) => {
          drawPixelSpikes = value;
        }, "set")
      },
      drawDebrisWarning: {
        get: /* @__PURE__ */ __name(() => drawDebrisWarning, "get"),
        set: /* @__PURE__ */ __name((value) => {
          drawDebrisWarning = value;
        }, "set")
      },
      polishFont: {
        get: /* @__PURE__ */ __name(() => polishFont, "get"),
        set: /* @__PURE__ */ __name((value) => {
          polishFont = value;
        }, "set")
      },
      drawPixelSign: {
        get: /* @__PURE__ */ __name(() => drawPixelSign, "get"),
        set: /* @__PURE__ */ __name((value) => {
          drawPixelSign = value;
        }, "set")
      },
      updateCityInteriors: {
        get: /* @__PURE__ */ __name(() => updateCityInteriors, "get"),
        set: /* @__PURE__ */ __name((value) => {
          updateCityInteriors = value;
        }, "set")
      },
      drawCityDetails: {
        get: /* @__PURE__ */ __name(() => drawCityDetails, "get"),
        set: /* @__PURE__ */ __name((value) => {
          drawCityDetails = value;
        }, "set")
      },
      drawDamagedRoof: {
        get: /* @__PURE__ */ __name(() => drawDamagedRoof, "get"),
        set: /* @__PURE__ */ __name((value) => {
          drawDamagedRoof = value;
        }, "set")
      },
      drawPlayerAbilities: {
        get: /* @__PURE__ */ __name(() => drawPlayerAbilities, "get"),
        set: /* @__PURE__ */ __name((value) => {
          drawPlayerAbilities = value;
        }, "set")
      }
    };
  }
  __name(getRuntimeBindings14, "getRuntimeBindings");

  // src/ending-art.js
  var ending_art_exports = {};
  __export(ending_art_exports, {
    drawEndingScene: () => drawEndingScene,
    endingActor: () => endingActor,
    endingArtReady: () => endingArtReady,
    endingAura: () => endingAura,
    endingBurst: () => endingBurst,
    endingGemAnchor: () => endingGemAnchor,
    endingLoadErrors: () => endingLoadErrors,
    endingSheets: () => endingSheets,
    endingSprites: () => endingSprites,
    endingStar: () => endingStar,
    getRuntimeBindings: () => getRuntimeBindings19,
    initializeRuntimeModule: () => initializeRuntimeModule19,
    loadEndingArt: () => loadEndingArt,
    prepareEndingArt: () => prepareEndingArt,
    prepareEndingEmerald: () => prepareEndingEmerald,
    retryEndingArt: () => retryEndingArt
  });

  // src/ending-frames.js
  var ending_frames_exports = {};
  __export(ending_frames_exports, {
    endingFrames: () => endingFrames,
    getRuntimeBindings: () => getRuntimeBindings15,
    initializeRuntimeModule: () => initializeRuntimeModule15
  });
  var endingFrames;
  function initializeRuntimeModule15() {
    endingFrames = { "shadow": [{ "bounds": [24, 32, 178, 218], "seed": [119, 32], "anchor": [41, 218], "scale": 0.2857142857142857 }, { "bounds": [209, 35, 361, 236], "seed": [273, 35], "anchor": [236, 236], "scale": 0.2857142857142857 }, { "bounds": [393, 31, 546, 253], "seed": [451, 31], "anchor": [455.5, 253], "scale": 0.2857142857142857 }, { "bounds": [568, 34, 751, 244], "seed": [627, 34], "anchor": [620.5, 244], "scale": 0.2857142857142857 }, { "bounds": [742, 25, 927, 250], "seed": [798, 25], "anchor": [785, 250], "scale": 0.2857142857142857 }, { "bounds": [932, 35, 1090, 234], "seed": [999, 35], "anchor": [1050, 234], "scale": 0.2857142857142857 }, { "bounds": [1109, 32, 1264, 246], "seed": [1186, 32], "anchor": [1152, 246], "scale": 0.2857142857142857 }, { "bounds": [1286, 49, 1445, 253], "seed": [1339, 49], "anchor": [1359.5, 253], "scale": 0.2857142857142857 }, { "bounds": [19, 300, 184, 487], "seed": [85, 300], "anchor": [111.5, 487], "scale": 0.2857142857142857 }, { "bounds": [195, 302, 373, 487], "seed": [316, 302], "anchor": [288, 487], "scale": 0.2857142857142857 }, { "bounds": [390, 291, 554, 493], "seed": [457, 291], "anchor": [428, 493], "scale": 0.2857142857142857 }, { "bounds": [579, 282, 733, 493], "seed": [618, 282], "anchor": [659.5, 493], "scale": 0.2857142857142857 }, { "bounds": [746, 288, 902, 493], "seed": [789, 288], "anchor": [827.5, 493], "scale": 0.2857142857142857 }, { "bounds": [923, 288, 1078, 499], "seed": [975, 288], "anchor": [1015.5, 499], "scale": 0.2857142857142857 }, { "bounds": [1113, 290, 1254, 496], "seed": [1184, 290], "anchor": [1174, 496], "scale": 0.2857142857142857 }, { "bounds": [1286, 284, 1429, 499], "seed": [1358, 284], "anchor": [1348.5, 499], "scale": 0.2857142857142857 }, { "bounds": [23, 538, 169, 755], "seed": [96, 538], "anchor": [84, 755], "scale": 0.2857142857142857 }, { "bounds": [190, 533, 364, 752], "seed": [296, 533], "anchor": [270, 752], "scale": 0.2857142857142857 }, { "bounds": [363, 536, 544, 750], "seed": [471, 536], "anchor": [457, 750], "scale": 0.2857142857142857 }, { "bounds": [553, 536, 731, 750], "seed": [660, 536], "anchor": [648.5, 750], "scale": 0.2857142857142857, "gem": [579, 622] }, { "bounds": [736, 536, 902, 751], "seed": [831, 536], "anchor": [812, 751], "scale": 0.2857142857142857, "gem": [765, 641] }, { "bounds": [905, 538, 1068, 752], "seed": [994, 538], "anchor": [987, 752], "scale": 0.2857142857142857, "gem": [941, 641] }, { "bounds": [1080, 538, 1246, 752], "seed": [1177, 538], "anchor": [1166.5, 752], "scale": 0.2857142857142857, "gem": [1110, 641] }, { "bounds": [1257, 538, 1425, 752], "seed": [1355, 538], "anchor": [1345.5, 752], "scale": 0.2857142857142857, "gem": [1288, 639] }, { "bounds": [16, 803, 189, 1027], "seed": [112, 803], "anchor": [92.5, 1027], "scale": 0.2857142857142857, "gem": [41, 938] }, { "bounds": [213, 814, 394, 1026], "seed": [271, 814], "anchor": [291.5, 1026], "scale": 0.2857142857142857, "gem": [372, 867] }, { "bounds": [387, 770, 551, 1031], "seed": [408, 770], "anchor": [476.5, 1031], "scale": 0.2857142857142857, "gem": [416, 792] }, { "bounds": [575, 780, 726, 1031], "seed": [601, 780], "anchor": [654.5, 1031], "scale": 0.2857142857142857, "gem": [611, 804] }, { "bounds": [745, 804, 899, 1030], "seed": [809, 804], "anchor": [828, 1030], "scale": 0.2857142857142857, "gem": [768, 924] }, { "bounds": [921, 814, 1079, 1031], "seed": [980, 814], "anchor": [1009, 1031], "scale": 0.2857142857142857, "gem": [947, 923] }, { "bounds": [1100, 801, 1256, 1031], "seed": [1181, 801], "anchor": [1186, 1031], "scale": 0.2857142857142857, "gem": [1128, 921] }, { "bounds": [1279, 812, 1434, 1032], "seed": [1339, 812], "anchor": [1364, 1032], "scale": 0.2857142857142857 }], "sonic": [{ "bounds": [37, 21, 205, 241], "seed": [105, 21], "anchor": [135.5, 241], "scale": 0.27802690582959644 }, { "bounds": [288, 21, 505, 241], "seed": [355, 21], "anchor": [393.5, 241], "scale": 0.27802690582959644 }, { "bounds": [549, 23, 761, 241], "seed": [610, 23], "anchor": [649.5, 241], "scale": 0.27802690582959644 }, { "bounds": [803, 25, 1022, 241], "seed": [864, 25], "anchor": [907, 241], "scale": 0.27802690582959644 }, { "bounds": [1059, 25, 1278, 241], "seed": [1119, 25], "anchor": [1163, 241], "scale": 0.27802690582959644 }, { "bounds": [1317, 18, 1526, 241], "seed": [1448, 18], "anchor": [1423.5, 241], "scale": 0.27802690582959644 }, { "bounds": [42, 268, 213, 493], "seed": [104, 268], "anchor": [138.5, 493], "scale": 0.27802690582959644 }, { "bounds": [295, 268, 478, 491], "seed": [362, 268], "anchor": [406.5, 491], "scale": 0.27802690582959644 }, { "bounds": [553, 268, 726, 491], "seed": [621, 268], "anchor": [653.5, 491], "scale": 0.27802690582959644 }, { "bounds": [805, 272, 990, 491], "seed": [871, 272], "anchor": [914.5, 491], "scale": 0.27802690582959644 }, { "bounds": [1056, 272, 1279, 492], "seed": [1120, 272], "anchor": [1169.5, 492], "scale": 0.27802690582959644 }, { "bounds": [1317, 272, 1531, 492], "seed": [1381, 272], "anchor": [1425, 492], "scale": 0.27802690582959644 }, { "bounds": [34, 524, 253, 748], "seed": [99, 524], "anchor": [143, 748], "scale": 0.27802690582959644 }, { "bounds": [292, 523, 474, 747], "seed": [428, 523], "anchor": [401.5, 747], "scale": 0.27802690582959644 }, { "bounds": [555, 516, 737, 749], "seed": [616, 516], "anchor": [663.5, 749], "scale": 0.27802690582959644 }, { "bounds": [808, 524, 1018, 748], "seed": [876, 524], "anchor": [909, 748], "scale": 0.27802690582959644 }, { "bounds": [1067, 525, 1276, 747], "seed": [1134, 525], "anchor": [1166.5, 747], "scale": 0.27802690582959644 }, { "bounds": [1322, 524, 1525, 748], "seed": [1389, 524], "anchor": [1420, 748], "scale": 0.27802690582959644 }, { "bounds": [37, 776, 240, 1004], "seed": [105, 776], "anchor": [138.5, 1004], "scale": 0.27802690582959644 }, { "bounds": [291, 778, 478, 1004], "seed": [360, 778], "anchor": [397, 1004], "scale": 0.27802690582959644 }, { "bounds": [551, 776, 761, 1004], "seed": [620, 776], "anchor": [654.5, 1004], "scale": 0.27802690582959644 }, { "bounds": [806, 776, 1029, 1004], "seed": [881, 776], "anchor": [912.5, 1004], "scale": 0.27802690582959644 }, { "bounds": [1081, 763, 1282, 994], "seed": [1142, 763], "anchor": [1115.5, 994], "scale": 0.27802690582959644 }, { "bounds": [1333, 768, 1518, 992], "seed": [1388, 768], "anchor": [1432.5, 992], "scale": 0.27802690582959644 }], "eggman": [{ "bounds": [23, 50, 341, 402], "seed": [144, 50], "anchor": [182, 402], "scale": 0.29 }, { "bounds": [374, 53, 697, 404], "seed": [488, 53], "anchor": [535.5, 404], "scale": 0.29 }, { "bounds": [745, 78, 1071, 402], "seed": [944, 78], "anchor": [908, 402], "scale": 0.29 }, { "bounds": [1109, 50, 1428, 402], "seed": [1230, 50], "anchor": [1268.5, 402], "scale": 0.29 }, { "bounds": [17, 446, 355, 785], "seed": [104, 446], "anchor": [186, 785], "scale": 0.29 }, { "bounds": [400, 454, 694, 726], "seed": [629, 454], "anchor": [547, 726], "scale": 0.29 }, { "bounds": [770, 453, 1046, 753], "seed": [863, 453], "anchor": [908, 753], "scale": 0.29 }, { "bounds": [1153, 443, 1397, 756], "seed": [1281, 443], "anchor": [1275, 756], "scale": 0.29 }, { "bounds": [23, 844, 307, 1002], "seed": [198, 844], "anchor": [165, 1002], "scale": 0.17 }, { "bounds": [346, 844, 712, 1002], "seed": [519, 844], "anchor": [529, 1002], "scale": 0.17 }, { "bounds": [749, 764, 1083, 1074], "seed": [852, 764], "anchor": [916, 1074], "scale": 0.29 }, { "bounds": [1130, 805, 1435, 1035], "anchor": [1282.5, 1035], "scale": 0.29, "islands": true }] };
  }
  __name(initializeRuntimeModule15, "initializeRuntimeModule");
  function getRuntimeBindings15() {
    return {
      "endingFrames": { get: /* @__PURE__ */ __name(() => endingFrames, "get"), set: /* @__PURE__ */ __name((value) => {
        endingFrames = value;
      }, "set") }
    };
  }
  __name(getRuntimeBindings15, "getRuntimeBindings");

  // src/recovered-art.js
  var recovered_art_exports = {};
  __export(recovered_art_exports, {
    drawRecoveredSonicFrame: () => drawRecoveredSonicFrame,
    getRuntimeBindings: () => getRuntimeBindings18,
    initializeRuntimeModule: () => initializeRuntimeModule18,
    recoveredSonicPose: () => recoveredSonicPose,
    recoveredSpriteFrames: () => recoveredSpriteFrames,
    recoveredSpriteTextures: () => recoveredSpriteTextures
  });

  // src/supplemental-frames.js
  var supplemental_frames_exports = {};
  __export(supplemental_frames_exports, {
    getRuntimeBindings: () => getRuntimeBindings16,
    initializeRuntimeModule: () => initializeRuntimeModule16,
    supplementalSpriteFrames: () => supplementalSpriteFrames
  });
  var supplementalSpriteFrames;
  function initializeRuntimeModule16() {
    supplementalSpriteFrames = { "supplemental": [{ "bounds": [22, 32, 215, 219], "anchor": [109, 196], "scale": 0.2720781661029688 }, { "bounds": [237, 32, 435, 227], "anchor": [113, 196], "scale": 0.2720781661029688 }, { "bounds": [459, 32, 665, 230], "anchor": [117, 196], "scale": 0.2720781661029688 }, { "bounds": [680, 32, 879, 230], "anchor": [113, 196], "scale": 0.2720781661029688 }, { "bounds": [900, 32, 1099, 227], "anchor": [114, 196], "scale": 0.2720781661029688 }, { "bounds": [1120, 30, 1339, 227], "anchor": [116, 198], "scale": 0.2720781661029688 }, { "bounds": [1351, 30, 1546, 226], "anchor": [113, 198], "scale": 0.2720781661029688 }, { "bounds": [1561, 30, 1760, 229], "anchor": [118, 198], "scale": 0.2720781661029688 }, { "bounds": [22, 245, 226, 422], "anchor": [118, 186], "scale": 0.2720781661029688 }, { "bounds": [238, 247, 445, 417], "anchor": [123, 184], "scale": 0.2720781661029688 }, { "bounds": [458, 247, 664, 426], "anchor": [121, 184], "scale": 0.2720781661029688 }, { "bounds": [687, 248, 880, 431], "anchor": [107, 183], "scale": 0.2720781661029688 }, { "bounds": [902, 248, 1110, 426], "anchor": [124, 183], "scale": 0.2720781661029688 }, { "bounds": [1121, 247, 1335, 433], "anchor": [128, 184], "scale": 0.2720781661029688 }, { "bounds": [1342, 247, 1550, 431], "anchor": [123, 184], "scale": 0.2720781661029688 }, { "bounds": [1564, 246, 1760, 431], "anchor": [112, 185], "scale": 0.2720781661029688 }, { "bounds": [18, 447, 215, 633], "anchor": [106, 186], "scale": 0.2720781661029688 }, { "bounds": [233, 448, 429, 633], "anchor": [106, 185], "scale": 0.2720781661029688 }, { "bounds": [456, 448, 659, 633], "anchor": [113, 185], "scale": 0.2720781661029688 }, { "bounds": [685, 451, 881, 633], "anchor": [107, 182], "scale": 0.2720781661029688 }, { "bounds": [904, 449, 1104, 633], "anchor": [103, 184], "scale": 0.2720781661029688 }, { "bounds": [1125, 447, 1328, 633], "anchor": [111, 186], "scale": 0.2720781661029688 }, { "bounds": [1349, 449, 1548, 635], "anchor": [108, 184], "scale": 0.2720781661029688 }, { "bounds": [1563, 449, 1759, 633], "anchor": [104, 184], "scale": 0.2720781661029688 }, { "bounds": [16, 647, 214, 864], "anchor": [112, 223], "scale": 0.2720781661029688 }, { "bounds": [236, 653, 430, 867], "anchor": [104, 217], "scale": 0.2720781661029688 }, { "bounds": [461, 647, 677, 864], "anchor": [107, 223], "scale": 0.2720781661029688 }, { "bounds": [688, 658, 886, 872], "anchor": [94, 212], "scale": 0.2720781661029688 }, { "bounds": [927, 683, 1104, 872], "anchor": [87, 187], "scale": 0.2720781661029688 }, { "bounds": [1147, 658, 1318, 872], "anchor": [81, 212], "scale": 0.2720781661029688 }, { "bounds": [1360, 702, 1547, 872], "anchor": [84, 168], "scale": 0.2720781661029688 }, { "bounds": [1580, 702, 1754, 872], "anchor": [71, 168], "scale": 0.2720781661029688 }], "peeloutCycle": [{ "bounds": [42, 103, 406, 441], "anchor": [207, 344], "scale": 0.1360390830514844 }, { "bounds": [483, 103, 848, 447], "anchor": [208, 344], "scale": 0.1360390830514844 }, { "bounds": [925, 103, 1291, 449], "anchor": [209, 344], "scale": 0.1360390830514844 }, { "bounds": [1370, 103, 1732, 449], "anchor": [205, 344], "scale": 0.1360390830514844 }, { "bounds": [34, 489, 399, 825], "anchor": [210, 334], "scale": 0.1360390830514844 }, { "bounds": [482, 486, 848, 825], "anchor": [209, 337], "scale": 0.1360390830514844 }, { "bounds": [925, 485, 1291, 821], "anchor": [208, 338], "scale": 0.1360390830514844 }, { "bounds": [1370, 485, 1733, 825], "anchor": [206, 338], "scale": 0.1360390830514844 }] };
  }
  __name(initializeRuntimeModule16, "initializeRuntimeModule");
  function getRuntimeBindings16() {
    return {
      "supplementalSpriteFrames": { get: /* @__PURE__ */ __name(() => supplementalSpriteFrames, "get"), set: /* @__PURE__ */ __name((value) => {
        supplementalSpriteFrames = value;
      }, "set") }
    };
  }
  __name(getRuntimeBindings16, "getRuntimeBindings");

  // src/traversal-frames.js
  var traversal_frames_exports = {};
  __export(traversal_frames_exports, {
    getRuntimeBindings: () => getRuntimeBindings17,
    initializeRuntimeModule: () => initializeRuntimeModule17,
    traversalSpriteFrames: () => traversalSpriteFrames
  });
  var traversalSpriteFrames;
  function initializeRuntimeModule17() {
    traversalSpriteFrames = { "traversalActing": [{ "bounds": [38, 47, 235, 272], "anchor": [70, 225], "scale": 0.2608695652173913 }, { "bounds": [276, 44, 515, 272], "anchor": [103, 228], "scale": 0.2608695652173913 }, { "bounds": [527, 47, 781, 272], "anchor": [123, 225], "scale": 0.2608695652173913, "trim": [[249, 93, 5, 25]] }, { "bounds": [776, 38, 1032, 272], "anchor": [154, 234], "scale": 0.2608695652173913, "trim": [[0, 170, 5, 19]] }, { "bounds": [1037, 34, 1263, 272], "anchor": [134, 238], "scale": 0.2608695652173913 }, { "bounds": [1299, 44, 1530, 272], "anchor": [96, 228], "scale": 0.2608695652173913 }, { "bounds": [1553, 42, 1764, 272], "anchor": [85, 230], "scale": 0.2608695652173913 }, { "bounds": [1810, 45, 2029, 272], "anchor": [94, 227], "scale": 0.2608695652173913 }, { "bounds": [28, 290, 235, 522], "anchor": [78, 232], "scale": 0.2608695652173913 }, { "bounds": [279, 290, 516, 522], "anchor": [108, 232], "scale": 0.2608695652173913 }, { "bounds": [532, 293, 772, 522], "anchor": [121, 229], "scale": 0.2608695652173913 }, { "bounds": [777, 282, 1034, 522], "anchor": [167, 240], "scale": 0.2608695652173913, "trim": [[248, 42, 9, 70]] }, { "bounds": [1025, 282, 1286, 522], "anchor": [167, 240], "scale": 0.2608695652173913, "trim": [[0, 179, 9, 25]] }, { "bounds": [1314, 297, 1536, 522], "anchor": [107, 225], "scale": 0.2608695652173913 }, { "bounds": [1573, 290, 1785, 522], "anchor": [99, 232], "scale": 0.2608695652173913 }, { "bounds": [1817, 292, 2026, 522], "anchor": [89, 230], "scale": 0.2608695652173913 }, { "bounds": [39, 544, 254, 757], "anchor": [161, 213], "scale": 0.2608695652173913 }, { "bounds": [275, 539, 518, 757], "anchor": [189, 218], "scale": 0.2608695652173913 }, { "bounds": [522, 542, 780, 757], "anchor": [204, 215], "scale": 0.2608695652173913 }, { "bounds": [782, 545, 1021, 757], "anchor": [185, 212], "scale": 0.2608695652173913 }, { "bounds": [1050, 545, 1289, 757], "anchor": [185, 212], "scale": 0.2608695652173913 }, { "bounds": [1305, 539, 1532, 757], "anchor": [173, 218], "scale": 0.2608695652173913 }, { "bounds": [1546, 539, 1788, 757], "anchor": [188, 218], "scale": 0.2608695652173913 }, { "bounds": [1819, 541, 2037, 756], "anchor": [164, 215], "scale": 0.2608695652173913 }], "traversalLaunch": [{ "bounds": [23, 22, 200, 258], "anchor": [88, 236], "scale": 0.2510460251046025 }, { "bounds": [246, 19, 424, 257], "anchor": [79, 238], "scale": 0.2510460251046025 }, { "bounds": [460, 18, 652, 253], "anchor": [100, 235], "scale": 0.2510460251046025 }, { "bounds": [692, 19, 869, 257], "anchor": [92, 238], "scale": 0.2510460251046025 }, { "bounds": [917, 19, 1091, 258], "anchor": [84, 239], "scale": 0.2510460251046025 }, { "bounds": [1127, 19, 1310, 257], "anchor": [72, 238], "scale": 0.2510460251046025 }, { "bounds": [1338, 18, 1541, 256], "anchor": [102, 238], "scale": 0.2510460251046025 }, { "bounds": [1574, 19, 1761, 257], "anchor": [112, 238], "scale": 0.2510460251046025 }, { "bounds": [14, 287, 214, 422], "anchor": [100, 68], "scale": 0.2510460251046025 }, { "bounds": [219, 292, 432, 428], "anchor": [106, 68], "scale": 0.2510460251046025 }, { "bounds": [438, 293, 662, 424], "anchor": [112, 66], "scale": 0.2510460251046025 }, { "bounds": [676, 291, 887, 424], "anchor": [106, 66], "scale": 0.2510460251046025 }, { "bounds": [902, 292, 1116, 422], "anchor": [107, 65], "scale": 0.2510460251046025 }, { "bounds": [1125, 292, 1328, 424], "anchor": [102, 66], "scale": 0.2510460251046025 }, { "bounds": [1346, 295, 1546, 421], "anchor": [100, 63], "scale": 0.2510460251046025 }, { "bounds": [1560, 289, 1758, 426], "anchor": [99, 68], "scale": 0.2510460251046025 }, { "bounds": [17, 456, 209, 640], "anchor": [96, 92], "scale": 0.2510460251046025 }, { "bounds": [231, 456, 424, 642], "anchor": [96, 93], "scale": 0.2510460251046025 }, { "bounds": [448, 458, 643, 643], "anchor": [98, 92], "scale": 0.2510460251046025 }, { "bounds": [678, 461, 863, 641], "anchor": [92, 90], "scale": 0.2510460251046025 }, { "bounds": [886, 467, 1098, 642], "anchor": [106, 88], "scale": 0.2510460251046025 }, { "bounds": [1117, 462, 1326, 644], "anchor": [104, 91], "scale": 0.2510460251046025 }, { "bounds": [1345, 465, 1549, 647], "anchor": [102, 91], "scale": 0.2510460251046025 }, { "bounds": [1560, 462, 1747, 648], "anchor": [94, 93], "scale": 0.2510460251046025 }, { "bounds": [18, 677, 216, 864], "anchor": [99, 94], "scale": 0.2510460251046025 }, { "bounds": [252, 680, 428, 858], "anchor": [88, 89], "scale": 0.2510460251046025 }, { "bounds": [450, 673, 653, 860], "anchor": [102, 94], "scale": 0.2510460251046025 }, { "bounds": [676, 676, 876, 861], "anchor": [100, 92], "scale": 0.2510460251046025 }, { "bounds": [896, 676, 1102, 862], "anchor": [103, 93], "scale": 0.2510460251046025 }, { "bounds": [1128, 674, 1325, 856], "anchor": [98, 91], "scale": 0.2510460251046025 }, { "bounds": [1344, 672, 1542, 860], "anchor": [99, 94], "scale": 0.2510460251046025 }, { "bounds": [1563, 674, 1757, 860], "anchor": [97, 93], "scale": 0.2510460251046025 }] };
  }
  __name(initializeRuntimeModule17, "initializeRuntimeModule");
  function getRuntimeBindings17() {
    return {
      "traversalSpriteFrames": { get: /* @__PURE__ */ __name(() => traversalSpriteFrames, "get"), set: /* @__PURE__ */ __name((value) => {
        traversalSpriteFrames = value;
      }, "set") }
    };
  }
  __name(getRuntimeBindings17, "getRuntimeBindings");

  // src/recovered-art.js
  var recoveredSpriteTextures;
  var recoveredSpriteFrames;
  function recoveredSonicPose() {
    const speed = p.loop ? Math.abs(p.loop.speed) : Math.abs(p.surface?.contactMode === "oriented" ? p.contactSpeed : p.vx), face = p.face;
    const sheet = art.recoveredSpeedster ? "recoveredSpeedster" : "recoveredPeelout";
    const out = /* @__PURE__ */ __name((state2, frame2, extra = {}) => ({
      state: state2,
      frame: frame2,
      face,
      sheet,
      rotation: 0,
      ball: false,
      ...extra
    }), "out");
    const fastSheet = art.recoveredPeelout ? "recoveredPeelout" : sheet;
    if (p.hurt) return out("hurt", 39);
    if (p.airBoostActive)
      return out("boost", 8 + Math.floor(state.runFrames / 2) % 8, {
        sheet: art.supplemental ? "supplemental" : fastSheet
      });
    if (p.ground && p.surface?.grindable) {
      const entry = state.runFrames - p.grindEntryFrame;
      if (art.supplemental && entry >= 0 && entry < 4)
        return out("grind-entry", 24 + Math.floor(entry / 2), {
          sheet: "supplemental",
          face: Math.sign(p.vx) || face,
          rotation: Math.atan(pose(p.surface).slope) * (Math.sign(p.vx) || face)
        });
      const fast = p.boosting || speed > 18 || p.grindFast && speed > 16;
      return out(
        fast ? "grind-fast" : "grind",
        art.supplemental ? 16 + Math.floor(state.runFrames / (fast ? 2 : 4)) % 8 : [35, 36, 37][Math.floor(state.runFrames / 3) % 3],
        {
          sheet: art.supplemental ? "supplemental" : fastSheet,
          face: Math.sign(p.vx) || face,
          rotation: Math.atan(pose(p.surface).slope) * (Math.sign(p.vx) || face)
        }
      );
    }
    if (state.charge && art.supplemental)
      return out("charge", 30 + Math.floor(state.runFrames / 4) % 2, {
        sheet: "supplemental"
      });
    if (p.rolling || state.charge || p.bubbleSlam)
      return out(
        "roll",
        26 + Math.floor(state.charge ? state.runFrames / 2 : state.anim * 0.6) % 3,
        {
          ball: true,
          diameter: 38,
          rotation: state.anim * 0.22
        }
      );
    if (!p.ground) {
      const exit = state.runFrames - p.grindExitFrame;
      if (art.supplemental && exit >= 0 && exit < 4)
        return out("grind-exit", 26 + Math.floor(exit / 2), { sheet: "supplemental" });
      const age = state.runFrames - p.poseJumpFrame;
      if (age >= 0 && age < 4 && p.vy < 0) return out("takeoff", 25);
      if (p.vy < -3)
        return out("rise", 26 + Math.floor(state.runFrames / 3) % 3, {
          ball: true,
          diameter: 38,
          rotation: state.anim * 0.04
        });
      if (p.vy < 3)
        return out("apex", 26 + Math.floor(state.runFrames / 3) % 3, {
          ball: true,
          diameter: 38,
          rotation: state.anim * 0.04
        });
      return out("fall", 29 + Math.floor(state.runFrames / 5) % 2);
    }
    const dir = Number(keys.has("ArrowRight") || keys.has("KeyD")) - Number(keys.has("ArrowLeft") || keys.has("KeyA"));
    if (!p.loop && !p.boosting && (p.brakeActive && speed > 0.03 || dir && speed > 2 && dir !== Math.sign(p.vx)))
      return out("brake", 32 + Math.min(5, Math.floor((p.brakeAge || 0) / 4)), {
        face: p.brakeActive ? p.brakeFace : Math.sign(p.vx)
      });
    if (!p.loop && !dir && !p.boosting && speed < 0.5 && state.runFrames - p.stopFrame < 12)
      return out("stop", 38);
    if (state.runFrames - p.poseLandingFrame >= 0 && state.runFrames - p.poseLandingFrame < 6)
      return art.supplemental ? out("land", 28 + Math.floor((state.runFrames - p.poseLandingFrame) / 3), {
        sheet: "supplemental"
      }) : out("land", 31);
    if (p.boosting)
      return out("boost", 8 + Math.floor(state.runFrames / 2) % 8, {
        sheet: art.supplemental ? "supplemental" : fastSheet
      });
    if (speed >= 12 && art.peeloutCycle)
      return out("run-fast", Math.floor(state.anim * 0.6) % 8, { sheet: "peeloutCycle" });
    if (speed > 0.5)
      return out("run", Math.floor(state.anim * 0.48) % 8, {
        sheet: speed > 12 ? fastSheet : sheet
      });
    const phase = state.runFrames % 240;
    return out("idle", phase < 180 ? 16 : phase < 190 ? 17 : phase < 220 ? 18 : 19);
  }
  __name(recoveredSonicPose, "recoveredSonicPose");
  function drawRecoveredSonicFrame(q) {
    const descriptor = recoveredSpriteFrames[q.sheet][q.frame], im = art[q.sheet];
    const [left, top, right, bottom] = descriptor.bounds, sw = right - left, sh = bottom - top;
    const key = q.sheet + "/" + q.frame + "/" + (q.ball ? q.diameter : 0);
    let sprite = recoveredSpriteTextures.get(key);
    if (!sprite) {
      const scale = q.ball ? q.diameter / Math.max(sw, sh) : descriptor.scale ?? 1 / 3;
      const image = document.createElement("canvas");
      image.width = sw;
      image.height = sh;
      const width = Math.max(1, Math.round(sw * scale)), height = Math.max(1, Math.round(sh * scale));
      const dc = image.getContext("2d");
      dc.imageSmoothingEnabled = false;
      if (descriptor.trim) {
        dc.beginPath();
        dc.rect(0, 0, sw, sh);
        for (const rect of descriptor.trim) dc.rect(...rect);
        dc.clip("evenodd");
      }
      dc.drawImage(im, left, top, sw, sh, 0, 0, sw, sh);
      sprite = {
        image,
        width,
        height,
        x: Math.round(descriptor.anchor[0] * scale),
        y: Math.round(descriptor.anchor[1] * scale)
      };
      recoveredSpriteTextures.set(key, sprite);
    }
    const transform = ctx.getTransform(), worldScale = Math.hypot(transform.a, transform.b), integerScale = Math.max(1, Math.round(worldScale)), ratio = integerScale / worldScale;
    const foot = q.pivotY ?? (q.ball ? p.ground ? 20 - Math.floor(sprite.height / 2) : 1 : 20);
    ctx.save();
    ctx.setTransform(
      transform.a * ratio,
      transform.b * ratio,
      transform.c * ratio,
      transform.d * ratio,
      Math.round(transform.e + transform.c * foot),
      Math.round(transform.f + transform.d * foot)
    );
    if (q.rotation) ctx.rotate(q.rotation);
    ctx.imageSmoothingEnabled = false;
    ctx.drawImage(
      sprite.image,
      q.ball ? -Math.round(sprite.width / 2) : -sprite.x,
      q.ball ? -Math.round(sprite.height / 2) : -sprite.y,
      sprite.width,
      sprite.height
    );
    ctx.restore();
  }
  __name(drawRecoveredSonicFrame, "drawRecoveredSonicFrame");
  function initializeRuntimeModule18() {
    recoveredSpriteTextures = /* @__PURE__ */ new Map();
    recoveredSpriteFrames = { "recoveredSpeedster": [{ "bounds": [20, 30, 168, 175], "anchor": [79, 153] }, { "bounds": [197, 29, 346, 183], "anchor": [83, 154] }, { "bounds": [382, 29, 536, 185], "anchor": [84, 154] }, { "bounds": [560, 28, 710, 183], "anchor": [90, 155] }, { "bounds": [737, 30, 891, 183], "anchor": [92, 153] }, { "bounds": [916, 26, 1082, 183], "anchor": [92, 157] }, { "bounds": [1107, 28, 1254, 180], "anchor": [88, 155] }, { "bounds": [1282, 24, 1434, 183], "anchor": [96, 159] }, { "bounds": [22, 200, 179, 344], "anchor": [81, 149] }, { "bounds": [198, 203, 356, 338], "anchor": [87, 146] }, { "bounds": [376, 202, 538, 347], "anchor": [89, 147] }, { "bounds": [562, 205, 716, 347], "anchor": [88, 144] }, { "bounds": [740, 206, 903, 350], "anchor": [89, 143] }, { "bounds": [914, 205, 1078, 350], "anchor": [95, 144] }, { "bounds": [1100, 203, 1256, 350], "anchor": [94, 146] }, { "bounds": [1281, 203, 1431, 351], "anchor": [89, 146] }, { "bounds": [20, 362, 151, 540], "anchor": [74, 177] }, { "bounds": [202, 360, 344, 540], "anchor": [76, 179] }, { "bounds": [385, 364, 527, 541], "anchor": [78, 175] }, { "bounds": [558, 364, 709, 541], "anchor": [89, 175] }, { "bounds": [737, 363, 913, 540], "anchor": [89, 176] }, { "bounds": [919, 364, 1090, 540], "anchor": [90, 175] }, { "bounds": [1103, 360, 1251, 540], "anchor": [85, 179] }, { "bounds": [1284, 370, 1427, 540], "anchor": [91, 169] }, { "bounds": [21, 594, 163, 721], "anchor": [84, 125] }, { "bounds": [185, 555, 356, 721], "anchor": [92, 164] }, { "bounds": [406, 607, 525, 721], "anchor": [59, 112] }, { "bounds": [585, 606, 706, 722], "anchor": [65, 113] }, { "bounds": [762, 605, 883, 721], "anchor": [67, 114] }, { "bounds": [905, 547, 1086, 713], "anchor": [98, 172] }, { "bounds": [1104, 567, 1258, 718], "anchor": [96, 152] }, { "bounds": [1279, 596, 1434, 721], "anchor": [91, 123] }, { "bounds": [20, 734, 171, 880], "anchor": [80, 147] }, { "bounds": [190, 732, 365, 882], "anchor": [92, 149] }, { "bounds": [372, 734, 547, 882], "anchor": [94, 147] }, { "bounds": [551, 747, 744, 882], "anchor": [94, 134] }, { "bounds": [744, 735, 921, 877], "anchor": [81, 146] }, { "bounds": [914, 745, 1097, 882], "anchor": [93, 136] }, { "bounds": [1112, 732, 1251, 883], "anchor": [68, 149] }, { "bounds": [1271, 743, 1440, 878], "anchor": [89, 138] }, { "bounds": [21, 892, 193, 1073], "anchor": [74, 181] }, { "bounds": [208, 889, 342, 1072], "anchor": [75, 184] }, { "bounds": [379, 894, 531, 1072], "anchor": [88, 179] }, { "bounds": [555, 901, 722, 1073], "anchor": [93, 172] }, { "bounds": [741, 892, 895, 1073], "anchor": [86, 181] }, { "bounds": [929, 890, 1067, 1075], "anchor": [79, 183] }, { "bounds": [1114, 897, 1243, 1075], "anchor": [71, 176] }, { "bounds": [1273, 899, 1432, 1075], "anchor": [102, 174] }], "recoveredPeelout": [{ "bounds": [18, 29, 174, 177], "anchor": [81, 154] }, { "bounds": [193, 27, 354, 184], "anchor": [87, 156] }, { "bounds": [375, 27, 541, 187], "anchor": [91, 156] }, { "bounds": [555, 28, 713, 187], "anchor": [95, 155] }, { "bounds": [732, 29, 895, 184], "anchor": [97, 154] }, { "bounds": [911, 26, 1088, 185], "anchor": [97, 157] }, { "bounds": [1099, 27, 1260, 184], "anchor": [96, 156] }, { "bounds": [1270, 25, 1436, 187], "anchor": [108, 158] }, { "bounds": [20, 200, 182, 346], "anchor": [83, 149] }, { "bounds": [197, 202, 360, 341], "anchor": [88, 147] }, { "bounds": [375, 202, 542, 349], "anchor": [90, 147] }, { "bounds": [563, 204, 718, 350], "anchor": [87, 145] }, { "bounds": [740, 206, 905, 354], "anchor": [89, 143] }, { "bounds": [917, 203, 1084, 354], "anchor": [92, 146] }, { "bounds": [1101, 201, 1261, 352], "anchor": [93, 148] }, { "bounds": [1278, 202, 1432, 356], "anchor": [92, 147] }, { "bounds": [19, 362, 156, 541], "anchor": [75, 177] }, { "bounds": [199, 360, 350, 542], "anchor": [79, 179] }, { "bounds": [386, 364, 531, 543], "anchor": [77, 175] }, { "bounds": [557, 364, 713, 543], "anchor": [90, 175] }, { "bounds": [739, 363, 915, 542], "anchor": [87, 176] }, { "bounds": [923, 364, 1095, 543], "anchor": [86, 175] }, { "bounds": [1107, 363, 1255, 542], "anchor": [81, 176] }, { "bounds": [1282, 371, 1429, 541], "anchor": [93, 168] }, { "bounds": [19, 592, 164, 723], "anchor": [86, 127] }, { "bounds": [185, 553, 362, 723], "anchor": [92, 166] }, { "bounds": [404, 605, 532, 727], "anchor": [61, 114] }, { "bounds": [583, 605, 711, 726], "anchor": [67, 114] }, { "bounds": [758, 605, 888, 728], "anchor": [71, 114] }, { "bounds": [906, 548, 1091, 715], "anchor": [97, 171] }, { "bounds": [1104, 566, 1261, 720], "anchor": [96, 153] }, { "bounds": [1279, 594, 1436, 722], "anchor": [91, 125] }, { "bounds": [18, 733, 174, 880], "anchor": [82, 148] }, { "bounds": [188, 733, 370, 885], "anchor": [94, 148] }, { "bounds": [372, 735, 551, 885], "anchor": [94, 146] }, { "bounds": [550, 746, 750, 884], "anchor": [95, 135] }, { "bounds": [746, 735, 925, 879], "anchor": [79, 146] }, { "bounds": [915, 744, 1099, 884], "anchor": [92, 137] }, { "bounds": [1115, 732, 1255, 885], "anchor": [65, 149] }, { "bounds": [1273, 740, 1443, 879], "anchor": [87, 141] }, { "bounds": [20, 891, 193, 1074], "anchor": [75, 182] }, { "bounds": [207, 889, 348, 1074], "anchor": [76, 184] }, { "bounds": [376, 895, 535, 1074], "anchor": [91, 178] }, { "bounds": [555, 899, 725, 1074], "anchor": [93, 174] }, { "bounds": [742, 891, 897, 1074], "anchor": [85, 182] }, { "bounds": [928, 891, 1072, 1076], "anchor": [80, 182] }, { "bounds": [1114, 895, 1246, 1076], "anchor": [71, 178] }, { "bounds": [1275, 898, 1435, 1076], "anchor": [100, 175] }] };
    Object.assign(recoveredSpriteFrames, supplementalSpriteFrames, traversalSpriteFrames);
  }
  __name(initializeRuntimeModule18, "initializeRuntimeModule");
  function getRuntimeBindings18() {
    return {
      recoveredSonicPose: {
        get: /* @__PURE__ */ __name(() => recoveredSonicPose, "get"),
        set: /* @__PURE__ */ __name((value) => {
          recoveredSonicPose = value;
        }, "set")
      },
      recoveredSpriteTextures: {
        get: /* @__PURE__ */ __name(() => recoveredSpriteTextures, "get"),
        set: /* @__PURE__ */ __name((value) => {
          recoveredSpriteTextures = value;
        }, "set")
      },
      drawRecoveredSonicFrame: {
        get: /* @__PURE__ */ __name(() => drawRecoveredSonicFrame, "get"),
        set: /* @__PURE__ */ __name((value) => {
          drawRecoveredSonicFrame = value;
        }, "set")
      },
      recoveredSpriteFrames: {
        get: /* @__PURE__ */ __name(() => recoveredSpriteFrames, "get"),
        set: /* @__PURE__ */ __name((value) => {
          recoveredSpriteFrames = value;
        }, "set")
      }
    };
  }
  __name(getRuntimeBindings18, "getRuntimeBindings");

  // src/ending-art.js
  var endingSprites;
  var endingLoadErrors;
  var endingSheets;
  function prepareEndingArt(name, image) {
    const source = document.createElement("canvas");
    source.width = image.width;
    source.height = image.height;
    const sc = source.getContext("2d", { willReadFrequently: true });
    sc.drawImage(image, 0, 0);
    const frames = [];
    for (const d of endingFrames[name]) {
      const [l, t, r, b] = d.bounds, w = r - l, h = b - t, data = sc.getImageData(l, t, w, h), pixels = data.data;
      const keep = new Uint8Array(w * h);
      if (d.islands) {
        for (let i = 0; i < keep.length; i++) keep[i] = pixels[i * 4 + 3] > 160 ? 1 : 0;
      } else {
        const queue = new Int32Array(w * h), seed = (d.seed[1] - t) * w + d.seed[0] - l;
        let head = 0, tail = 1;
        queue[0] = seed;
        keep[seed] = 1;
        while (head < tail) {
          const i = queue[head++], x = i % w;
          for (const j of [x ? i - 1 : -1, x < w - 1 ? i + 1 : -1, i - w, i + w])
            if (j >= 0 && j < keep.length && !keep[j] && pixels[j * 4 + 3] > 160) {
              keep[j] = 1;
              queue[tail++] = j;
            }
        }
      }
      for (let i = 0; i < keep.length; i++) pixels[i * 4 + 3] = keep[i] ? 255 : 0;
      const crop = document.createElement("canvas");
      crop.width = w;
      crop.height = h;
      crop.getContext("2d").putImageData(data, 0, 0);
      const width = Math.ceil(w * d.scale), height = Math.ceil(h * d.scale);
      frames.push({
        image: crop,
        width,
        height,
        x: Math.round((d.anchor[0] - l) * d.scale),
        y: height,
        gem: d.gem ? {
          x: Math.round((d.gem[0] - d.anchor[0]) * d.scale),
          y: Math.round((d.gem[1] - b) * d.scale)
        } : null
      });
    }
    endingSprites.set(name, frames);
    endingLoadErrors.delete(name);
    if (name === "shadow") prepareEndingEmerald(source);
  }
  __name(prepareEndingArt, "prepareEndingArt");
  function prepareEndingEmerald(source) {
    const crop = document.createElement("canvas");
    crop.width = 50;
    crop.height = 40;
    const c = crop.getContext("2d");
    c.drawImage(source, 738, 622, 50, 40, 0, 0, 50, 40);
    const data = c.getImageData(0, 0, 50, 40), poly = [
      [12, 7],
      [15, 5],
      [33, 5],
      [44, 16],
      [44, 18],
      [41, 22],
      [36, 28],
      [32, 32],
      [23, 35],
      [21, 35],
      [12, 27],
      [11, 26],
      [4, 18],
      [4, 16],
      [6, 13]
    ];
    for (let y = 0; y < 40; y++)
      for (let x = 0; x < 50; x++) {
        let inside = false;
        for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
          const [xi, yi] = poly[i], [xj, yj] = poly[j];
          if (yi > y !== yj > y && x < (xj - xi) * (y - yi) / (yj - yi) + xi) inside = !inside;
        }
        data.data[(y * 50 + x) * 4 + 3] = inside && data.data[(y * 50 + x) * 4 + 3] > 160 ? 255 : 0;
      }
    c.putImageData(data, 0, 0);
    endingSprites.set("emerald", [{ image: crop, width: 14, height: 12, x: 7, y: 6 }]);
  }
  __name(prepareEndingEmerald, "prepareEndingEmerald");
  function endingArtReady() {
    return endingSheets.every((name) => endingSprites.has(name));
  }
  __name(endingArtReady, "endingArtReady");
  function retryEndingArt() {
    for (const name of endingLoadErrors) {
      endingLoadErrors.delete(name);
      loadEndingArt(name, true);
    }
  }
  __name(retryEndingArt, "retryEndingArt");
  function loadEndingArt(name, retry = false) {
    const im = new Image();
    im.onload = () => prepareEndingArt(name, im);
    im.onerror = () => endingLoadErrors.add(name);
    im.src = "assets/ending-" + name + ".png" + (retry ? "?retry=" + Date.now() : "");
  }
  __name(loadEndingArt, "loadEndingArt");
  function endingGemAnchor(actor, frame2 = actor.frame, sheet = actor.sheet) {
    const cel = endingSprites.get(sheet)?.[frame2];
    if (!cel?.gem) return null;
    const tr = ctx.getTransform(), worldScale = Math.hypot(tr.a, tr.b), ratio = Math.max(1, Math.round(worldScale)) / worldScale;
    return { x: actor.x + cel.gem.x * ratio * (actor.flip ? -1 : 1), y: actor.y + cel.gem.y * ratio };
  }
  __name(endingGemAnchor, "endingGemAnchor");
  function endingActor(actor) {
    if (!actor.visible || actor.alpha === 0) return null;
    if (actor.sheet === "recovered" && !art.recoveredSpeedster)
      actor = { ...actor, sheet: "sonic", frame: 0 };
    if (actor.sheet === "recovered") {
      ctx.save();
      ctx.translate(actor.x, actor.y - 20);
      ctx.scale(actor.flip ? -1 : 1, 1);
      drawRecoveredSonicFrame({ sheet: "recoveredSpeedster", frame: actor.frame, ball: false });
      ctx.restore();
      return null;
    }
    const cel = endingSprites.get(actor.sheet)?.[actor.frame];
    if (!cel) return null;
    const tr = ctx.getTransform(), worldScale = Math.hypot(tr.a, tr.b), pixelScale = Math.max(1, Math.round(worldScale)), ratio = pixelScale / worldScale;
    const px = Math.round(tr.a * actor.x + tr.c * actor.y + tr.e), py = Math.round(tr.b * actor.x + tr.d * actor.y + tr.f);
    ctx.save();
    ctx.setTransform(tr.a * ratio, tr.b * ratio, tr.c * ratio, tr.d * ratio, px, py);
    ctx.imageSmoothingEnabled = false;
    ctx.globalAlpha = actor.alpha ?? 1;
    if (actor.flip) ctx.scale(-1, 1);
    if (actor.angle !== void 0) {
      const turn = Math.round(actor.angle / (Math.PI / 32));
      ctx.rotate(turn * Math.PI / 32);
      ctx.drawImage(
        cel.image,
        actor.nose ? 0 : -cel.width / 2,
        -cel.height / 2,
        cel.width,
        cel.height
      );
    } else ctx.drawImage(cel.image, -cel.x, -cel.y, cel.width, cel.height);
    ctx.restore();
    return endingGemAnchor(actor);
  }
  __name(endingActor, "endingActor");
  function endingStar(x, y, size, color) {
    cityPixelRect(x - size, y - 1, size * 2 + 2, 2, color);
    cityPixelRect(x - 1, y - size, 2, size * 2 + 2, color);
    cityPixelRect(x - 3, y - 3, 6, 6, color);
  }
  __name(endingStar, "endingStar");
  function endingBurst(x, y, age, life = 54) {
    const t = Math.max(0, Math.min(1, age / life));
    for (let i = 0; i < 10; i++) {
      const a = i * 2.399, dist = t * (40 + i * 7), xx = x + Math.cos(a) * dist, yy = y + Math.sin(a) * dist + t * t * 55;
      const size = Math.max(2, (1 - t) * (12 + i % 3 * 6));
      cityPixelOval(xx, yy, size, size, "#a92849");
      cityPixelOval(xx, yy, size * 0.75, size * 0.75, "#ff6f32");
      cityPixelOval(xx, yy, size * 0.4, size * 0.4, "#ffeeb0");
    }
    for (let i = 0; i < 9; i++) {
      const a = i * 2.4, dist = t * (80 + i * 12);
      cityPixelRect(
        x + Math.cos(a) * dist,
        y + Math.sin(a) * dist + t * t * 120,
        6,
        4,
        i % 2 ? "#8297b6" : "#e2463b"
      );
    }
  }
  __name(endingBurst, "endingBurst");
  function endingAura(x, y, frame2, power = 1) {
    const radius = 32 + Math.sin(frame2 * 0.22) * 4;
    for (let i = 0; i < 22; i++) {
      const a = i * Math.PI * 2 / 22 + frame2 * 0.11, xx = x + Math.cos(a) * radius * power, yy = y - 40 + Math.sin(a) * 56 * power;
      cityPixelRect(xx, yy, 2 + i % 3 * 2, 4, i % 3 ? "#ffe259" : "#fff5c2");
      if (i % 4 === 0) cityPixelLine(xx, yy, xx + Math.sin(a) * 7, yy - 12, "#fff9df", 2);
    }
  }
  __name(endingAura, "endingAura");
  function drawEndingScene(s) {
    const q = endingPose(s), f = q.frame, ground = s.arena.y;
    if (q.sonic.visible) cityPixelOval(q.sonic.x, ground + 1, 17, 3, "#060c2466");
    if (q.shadow.visible) cityPixelOval(q.shadow.x, ground + 1, 18, 3, "#060c2466");
    if (q.effects.teleport)
      endingAura(q.sonic.x, q.sonic.y, f, q.beat === "swing" ? 0.6 + 0.4 * (q.age - 52) / 14 : 1);
    endingActor(q.pod);
    if (q.pod.visible) {
      for (let i = 0; i < 2; i++) {
        const x = q.pod.x - 24 + i * 48, fire = 8 + Math.floor(f / 3 + i) % 3 * 4;
        cityPixelOval(x, q.pod.y + fire / 2, 5, fire, "#227add");
        cityPixelRect(x - 2, q.pod.y, 4, fire, "#a5f9ff");
      }
    }
    if (q.rocket) {
      const r = q.rocket, tr = ctx.getTransform(), scale = Math.hypot(tr.a, tr.b), ratio = Math.max(1, Math.round(scale)) / scale;
      const tail = (endingSprites.get(r.sheet)?.[r.frame]?.width ?? 63) * ratio * (r.nose ? 1 : 0.5), dx = -Math.cos(r.angle), dy = -Math.sin(r.angle);
      for (let i = 1; i < 7; i++) {
        const distance = tail + i * 11, x = r.x - dx * distance, y = r.y - dy * distance;
        cityPixelOval(x, y, 4 + i * 0.6, 3 + i * 0.5, i % 2 ? "#67708690" : "#d9d4d580");
      }
      endingActor({ ...r, visible: true });
    }
    if (q.eggman.visible) {
      const e = q.eggman;
      const fire = 16 + Math.floor(f / 3) % 3 * 5;
      cityPixelOval(e.x + 25, e.y - 24 + fire / 2, 7, fire, "#fa6932");
      cityPixelOval(e.x + 25, e.y - 26, 4, fire * 0.6, "#fff0a2");
      for (let i = 0; i < 5; i++)
        cityPixelOval(e.x + 25 - i * 5, e.y + 10 + i * 15, 5 + i * 2, 5 + i * 2, "#7b819b80");
      endingActor(e);
    }
    if (q.effects.explosion) endingBurst(q.blast.x, q.blast.y, q.age);
    endingActor(q.sonic);
    let gem = endingActor(q.shadow);
    if (q.emerald.overlay) {
      if (q.emerald.phase === "airborne") {
        const from = endingGemAnchor(q.shadow, 14, "shadow-polish"), to = endingGemAnchor(q.shadow, 16, "shadow-polish"), t = q.emerald.progress;
        if (from && to)
          gem = {
            x: from.x + (to.x - from.x) * t,
            y: from.y + (to.y - from.y) * t - 4 * 44 * t * (1 - t)
          };
      }
      if (gem) endingActor({ sheet: "emerald", frame: 0, visible: true, x: gem.x, y: gem.y });
    }
    if (q.beat === "swing" && q.age === 39 && gem) endingStar(gem.x, gem.y, 5, "#fffbd4");
    if (q.effects.arrival) {
      endingAura(q.shadow.x, q.shadow.y, f, 1 - q.age / 18);
      endingStar(q.shadow.x, q.shadow.y - 35, 35 - q.age * 2, "#fff3c2");
    }
    if (q.effects.kick) endingStar(q.contact.x, q.contact.y, 19 - (q.age - 18) * 2, "#fff9dd");
    if (gem && q.emerald.visible) {
      if (f % 28 < 7) endingStar(gem.x + 4, gem.y - 4, 3, "#fffbd4");
      if (q.effects.teleport)
        for (let i = 0; i < 3; i++) {
          const y = q.sonic.y - 25 - i * 17;
          cityPixelLine(gem.x, gem.y, (gem.x + q.sonic.x) / 2, gem.y - 8 + i * 5, "#ffdc6b80", 2);
          cityPixelLine((gem.x + q.sonic.x) / 2, gem.y - 8 + i * 5, q.sonic.x, y, "#fff0a180", 2);
        }
    }
    if (q.effects.warp) {
      const t = q.age / 24;
      endingStar(q.sonic.x, q.sonic.y - 35, Math.max(2, 48 * (1 - t)), "#fffbd6");
      for (let i = 0; i < 8; i++) {
        const a = i * Math.PI / 4;
        endingStar(
          q.sonic.x + Math.cos(a) * t * 65,
          q.sonic.y - 35 + Math.sin(a) * t * 65,
          Math.max(1, 4 - t * 4),
          "#ffd65c"
        );
      }
    }
    if (q.effects.dust)
      for (let i = 0; i < 4; i++)
        cityPixelOval(q.sonic.x - 20 - i * 12, ground - 2 - i % 2 * 3, 5 + i, 3, "#b7c2d47a");
    if (q.effects.sigh) {
      const t = (q.age - 30) / 35;
      for (let i = 0; i < 3; i++)
        cityPixelRect(
          q.shadow.x - 25 - t * 20 - i * 5,
          q.shadow.y - 43 + t * 8 + i * 2,
          4,
          2,
          "#dceaf399"
        );
    }
  }
  __name(drawEndingScene, "drawEndingScene");
  function initializeRuntimeModule19() {
    endingSprites = /* @__PURE__ */ new Map();
    endingLoadErrors = /* @__PURE__ */ new Set();
    endingSheets = ["sonic", "shadow", "eggman", "sonic-polish", "shadow-polish", "eggman-polish"];
    for (const name of endingSheets) loadEndingArt(name);
  }
  __name(initializeRuntimeModule19, "initializeRuntimeModule");
  function getRuntimeBindings19() {
    return {
      endingSprites: {
        get: /* @__PURE__ */ __name(() => endingSprites, "get"),
        set: /* @__PURE__ */ __name((value) => {
          endingSprites = value;
        }, "set")
      },
      endingLoadErrors: {
        get: /* @__PURE__ */ __name(() => endingLoadErrors, "get"),
        set: /* @__PURE__ */ __name((value) => {
          endingLoadErrors = value;
        }, "set")
      },
      endingSheets: {
        get: /* @__PURE__ */ __name(() => endingSheets, "get"),
        set: /* @__PURE__ */ __name((value) => {
          endingSheets = value;
        }, "set")
      },
      prepareEndingArt: {
        get: /* @__PURE__ */ __name(() => prepareEndingArt, "get"),
        set: /* @__PURE__ */ __name((value) => {
          prepareEndingArt = value;
        }, "set")
      },
      prepareEndingEmerald: {
        get: /* @__PURE__ */ __name(() => prepareEndingEmerald, "get"),
        set: /* @__PURE__ */ __name((value) => {
          prepareEndingEmerald = value;
        }, "set")
      },
      endingArtReady: {
        get: /* @__PURE__ */ __name(() => endingArtReady, "get"),
        set: /* @__PURE__ */ __name((value) => {
          endingArtReady = value;
        }, "set")
      },
      retryEndingArt: {
        get: /* @__PURE__ */ __name(() => retryEndingArt, "get"),
        set: /* @__PURE__ */ __name((value) => {
          retryEndingArt = value;
        }, "set")
      },
      loadEndingArt: {
        get: /* @__PURE__ */ __name(() => loadEndingArt, "get"),
        set: /* @__PURE__ */ __name((value) => {
          loadEndingArt = value;
        }, "set")
      },
      endingGemAnchor: {
        get: /* @__PURE__ */ __name(() => endingGemAnchor, "get"),
        set: /* @__PURE__ */ __name((value) => {
          endingGemAnchor = value;
        }, "set")
      },
      endingActor: {
        get: /* @__PURE__ */ __name(() => endingActor, "get"),
        set: /* @__PURE__ */ __name((value) => {
          endingActor = value;
        }, "set")
      },
      endingStar: {
        get: /* @__PURE__ */ __name(() => endingStar, "get"),
        set: /* @__PURE__ */ __name((value) => {
          endingStar = value;
        }, "set")
      },
      endingBurst: {
        get: /* @__PURE__ */ __name(() => endingBurst, "get"),
        set: /* @__PURE__ */ __name((value) => {
          endingBurst = value;
        }, "set")
      },
      endingAura: {
        get: /* @__PURE__ */ __name(() => endingAura, "get"),
        set: /* @__PURE__ */ __name((value) => {
          endingAura = value;
        }, "set")
      },
      drawEndingScene: {
        get: /* @__PURE__ */ __name(() => drawEndingScene, "get"),
        set: /* @__PURE__ */ __name((value) => {
          drawEndingScene = value;
        }, "set")
      }
    };
  }
  __name(getRuntimeBindings19, "getRuntimeBindings");

  // src/boss-game.js
  function setupBossEncounter() {
    state.boss = null;
    state.bossCheckpoint = false;
    state.ending = null;
    $("#ending-loading").hidden = true;
    if (state.level.act !== 2) return;
    state.level.arena.boss = true;
    for (let i = 0; i < 12; i++)
      state.level.rings.push({
        x: state.level.arena.x + 460 + i * 22,
        y: state.level.arena.y - 38,
        taken: false,
        bossRing: true
      });
  }
  __name(setupBossEncounter, "setupBossEncounter");
  function bossOwnsControls() {
    return state.ending || state.boss && ["entrance", "destroyed", "defeated"].includes(state.boss.state);
  }
  __name(bossOwnsControls, "bossOwnsControls");
  function resetBossAttempt() {
    state.ending = null;
    $("#ending-loading").hidden = true;
    if (!state.bossCheckpoint || state.level.act !== 2) return;
    state.boss = createEggScorpion(state.level.arena);
    state.boss.state = "idle";
    state.boss.anchored = true;
    state.boss.age = 0;
    keys.clear();
    p.inv = 100;
    state.boost = BOOST_MAX;
  }
  __name(resetBossAttempt, "resetBossAttempt");
  function beginEndingScene() {
    if (state.ending || state.level.act !== 2) return;
    state.ending = createEndingScene(state.level.arena, p, {
      x: state.cam,
      y: state.camY,
      zoom: state.zoom
    });
    state.ending.waitFrames = 0;
    keys.clear();
    state.charge = 0;
    state.jumpBuffer = 0;
    p.vx = 0;
    p.vy = 0;
    p.boosting = false;
    state.shake = 0;
    state.toastTime = 0;
    $("#toast").style.display = "none";
    $("#ending-loading").hidden = endingArtReady();
    $("#ending-retry").onclick = retryEndingArt;
  }
  __name(beginEndingScene, "beginEndingScene");
  function updateEndingScene() {
    if (!endingArtReady()) {
      state.ending.waitFrames++;
      $("#ending-loading").hidden = false;
      $("#ending-retry").hidden = endingLoadErrors.size === 0;
      if (state.ending.waitFrames % 180 === 0) retryEndingArt();
      return;
    }
    $("#ending-loading").hidden = true;
    keys.clear();
    tickEndingScene(state.ending);
    const cues = {
      rocketFire: "endingRocket",
      shadowTeleport: "endingTeleport",
      kickImpact: "endingKick",
      podExplosion: "endingExplosion",
      jetpack: "endingJetpack",
      emeraldOffer: "endingEmerald",
      chaosCharge: "endingCharge",
      chaosWarp: "endingWarp",
      relievedSigh: "endingSigh"
    };
    for (const event of state.ending.events) gameSound(cues[event]);
    if (state.ending.done) finishAct();
  }
  __name(updateEndingScene, "updateEndingScene");
  function updateBossEncounter() {
    if (state.level.act !== 2) return;
    if (!state.boss) {
      if (p.ground && p.surface?.id === "summit-arena" && p.x >= state.level.arena.x + 330) {
        state.boss = createEggScorpion(state.level.arena);
        state.boss.arrivalTime = state.clock;
        state.bossCheckpoint = true;
        const c = {
          x: state.level.arena.x + 410,
          y: state.level.arena.y,
          surfaceId: "summit-arena",
          name: "EGG SCORPION",
          hint: "Jump at the eyes after the bite."
        };
        state.level.checkpoints.push(c);
        state.checkpoint = state.level.checkpoints.length - 1;
        keys.clear();
        state.charge = 0;
        p.vx = 0;
        p.vy = 0;
        p.boosting = false;
        notify("EGG SCORPION");
        gameSound("bossReveal");
      }
      return;
    }
    tickEggScorpion(state.boss, p);
    if (state.boss.event === "idle" && state.boss.sequence === 1) {
      gameSound("bossAnchor");
      state.shake = 6;
      sparks(state.boss.x - 155, state.boss.y, 18, "#b2b5c2");
      sparks(state.boss.x + 155, state.boss.y, 18, "#b2b5c2");
      notify("Dodge the strikes \u2022 Jump at the eyes after a bite");
    }
    if (["tail-windup", "bite-windup", "laser-windup"].includes(state.boss.event))
      gameSound("warning");
    if (state.boss.event === "tail-strike") {
      gameSound("bossStrike");
      state.shake = 3;
    }
    if (state.boss.state === "tail-strike" && state.boss.age === 9) {
      state.shake = 5;
      sparks(state.boss.target.x, state.boss.y, 20, "#ffbd76");
    }
    if (state.boss.event === "bite-lunge") gameSound("bossBite");
    if (state.boss.event === "laser-fire") gameSound("bossLaser");
    if (damageEggScorpion(state.boss, p)) {
      state.score += 1500;
      p.vy = -9;
      p.jumpAttack = false;
      p.poseJumpFrame = state.runFrames;
      p.inv = Math.max(p.inv, 24);
      state.shake = 5;
      gameSound("bossHit");
      const g = scorpionGeometry(state.boss);
      sparks(g.head.x, g.head.y, 24, "#6de7ff");
      if (state.boss.hits === 2) notify("GLASS SHATTERED \u2022 LASER TAIL ONLINE");
      if (state.boss.hits === 3) {
        keys.clear();
        p.vx = 0;
        state.charge = 0;
        gameSound("bossBreak");
      }
    } else if (!p.inv && scorpionDanger(state.boss, p))
      hurt(scorpionGeometry(state.boss).head.x);
    if (bossOwnsControls()) {
      keys.clear();
      state.charge = 0;
      p.vx = 0;
      p.boosting = false;
    } else {
      const left = state.level.arena.x + 250, right = state.level.arena.x + 1300;
      if (p.x < left) {
        p.x = left;
        p.vx = Math.max(0, p.vx);
      }
      if (p.x > right) {
        p.x = right;
        p.vx = Math.min(0, p.vx);
      }
    }
  }
  __name(updateBossEncounter, "updateBossEncounter");
  function frameBossCamera() {
    if (!state.boss) return false;
    if (state.ending) {
      state.cam = state.ending.camera.x;
      state.camY = state.ending.camera.y;
      state.zoom = state.ending.camera.zoom;
      return true;
    }
    const targetZoom = 0.8;
    state.zoom += (targetZoom - state.zoom) * 0.035;
    const targetX = state.level.arena.x + 210, targetY = state.level.arena.y - 505;
    state.cam += Math.max(-14, Math.min(14, (targetX - state.cam) * 0.07));
    state.camY += Math.max(-12, Math.min(12, (targetY - state.camY) * 0.07));
    return true;
  }
  __name(frameBossCamera, "frameBossCamera");
  function drawBossEncounter() {
    if (!state.boss || state.ending) return;
    renderEggScorpion(state.boss);
    if (!["entrance", "destroyed", "defeated"].includes(state.boss.state)) {
      drawPixelSign(
        state.level.arena.x + 760,
        state.level.arena.y - 400,
        "EGG SCORPION",
        "danger"
      );
      for (let i = 0; i < 3; i++)
        cityPixelRect(
          state.level.arena.x + 690 + i * 48,
          state.level.arena.y - 380,
          36,
          6,
          i < 3 - state.boss.hits ? "#ff614d" : "#354052"
        );
    }
  }
  __name(drawBossEncounter, "drawBossEncounter");
  function initializeRuntimeModule20() {
    state.boss = null;
    state.bossCheckpoint = false;
    state.ending = null;
  }
  __name(initializeRuntimeModule20, "initializeRuntimeModule");
  function getRuntimeBindings20() {
    return {
      setupBossEncounter: {
        get: /* @__PURE__ */ __name(() => setupBossEncounter, "get"),
        set: /* @__PURE__ */ __name((value) => {
          setupBossEncounter = value;
        }, "set")
      },
      bossOwnsControls: {
        get: /* @__PURE__ */ __name(() => bossOwnsControls, "get"),
        set: /* @__PURE__ */ __name((value) => {
          bossOwnsControls = value;
        }, "set")
      },
      resetBossAttempt: {
        get: /* @__PURE__ */ __name(() => resetBossAttempt, "get"),
        set: /* @__PURE__ */ __name((value) => {
          resetBossAttempt = value;
        }, "set")
      },
      beginEndingScene: {
        get: /* @__PURE__ */ __name(() => beginEndingScene, "get"),
        set: /* @__PURE__ */ __name((value) => {
          beginEndingScene = value;
        }, "set")
      },
      updateEndingScene: {
        get: /* @__PURE__ */ __name(() => updateEndingScene, "get"),
        set: /* @__PURE__ */ __name((value) => {
          updateEndingScene = value;
        }, "set")
      },
      updateBossEncounter: {
        get: /* @__PURE__ */ __name(() => updateBossEncounter, "get"),
        set: /* @__PURE__ */ __name((value) => {
          updateBossEncounter = value;
        }, "set")
      },
      frameBossCamera: {
        get: /* @__PURE__ */ __name(() => frameBossCamera, "get"),
        set: /* @__PURE__ */ __name((value) => {
          frameBossCamera = value;
        }, "set")
      },
      drawBossEncounter: {
        get: /* @__PURE__ */ __name(() => drawBossEncounter, "get"),
        set: /* @__PURE__ */ __name((value) => {
          drawBossEncounter = value;
        }, "set")
      }
    };
  }
  __name(getRuntimeBindings20, "getRuntimeBindings");

  // src/stage-runtime.js
  var neonExpressAct1Runtime;
  var neonExpressAct2Runtime;
  function selectStageRuntime() {
    if (state.level.act === 1 || state.level.act === void 0 && state.selectedAct === 1)
      state.stageRuntime = neonExpressAct1Runtime;
    else if (state.level.act === 2) state.stageRuntime = neonExpressAct2Runtime;
    else throw Error("Unsupported stage act: " + state.level.act);
  }
  __name(selectStageRuntime, "selectStageRuntime");
  function resetStageRuntime() {
    state.stageRuntime.reset();
  }
  __name(resetStageRuntime, "resetStageRuntime");
  function updateStageMotion() {
    return state.stageRuntime.motion();
  }
  __name(updateStageMotion, "updateStageMotion");
  function beforeStageLanding(s) {
    state.stageRuntime.beforeLanding(s);
  }
  __name(beforeStageLanding, "beforeStageLanding");
  function afterStageLanding(s) {
    state.stageRuntime.afterLanding(s);
  }
  __name(afterStageLanding, "afterStageLanding");
  function updateStageWorld() {
    state.stageRuntime.updateWorld();
  }
  __name(updateStageWorld, "updateStageWorld");
  function handleStageEnemyDamage(e) {
    state.stageRuntime.enemyDamage(e);
  }
  __name(handleStageEnemyDamage, "handleStageEnemyDamage");
  function stageDeathLimit() {
    return state.stageRuntime.deathLimit();
  }
  __name(stageDeathLimit, "stageDeathLimit");
  function updateStageCompletion() {
    state.stageRuntime.completion();
  }
  __name(updateStageCompletion, "updateStageCompletion");
  function initializeRuntimeModule21() {
    state.stageRuntime = null;
    neonExpressAct1Runtime = {
      reset() {
      },
      motion() {
        return false;
      },
      beforeLanding(s) {
      },
      afterLanding(s) {
      },
      updateWorld() {
      },
      enemyDamage(e) {
      },
      deathLimit() {
        return 800;
      },
      completion() {
        if (p.x >= state.END && (p.ground && p.surface?.kind === "main" || p.landFrame === state.runFrames && p.landKind === "main"))
          finishAct();
      }
    };
    neonExpressAct2Runtime = {
      reset() {
        resetAct2();
        resetBlimpRoute();
      },
      motion() {
        return updateMiddleMotion();
      },
      beforeLanding(s) {
        if (p.wrongRouteDrop && s.fallen) {
          p.wrongRouteDrop = false;
          p.vx = 0;
        }
      },
      afterLanding(s) {
        onBlimpLanding(s);
        if (s.poolCurve) {
          p.poolApproach = false;
          p.rolling = true;
          p.roll = true;
          p.rollAge = 0;
          p.lowRollFrames = 0;
        }
      },
      updateWorld() {
        updateAct2();
        updateMiddleSection();
      },
      enemyDamage(e) {
        if (e.id === "mid-wrong-way-guard" && p.hurt && state.mode === "playing")
          beginWrongRouteDrop();
      },
      deathLimit() {
        return state.level.floorAt(p.x) + 950;
      },
      completion() {
        if (state.boss?.state === "defeated") beginEndingScene();
      }
    };
  }
  __name(initializeRuntimeModule21, "initializeRuntimeModule");
  function getRuntimeBindings21() {
    return {
      neonExpressAct1Runtime: {
        get: /* @__PURE__ */ __name(() => neonExpressAct1Runtime, "get"),
        set: /* @__PURE__ */ __name((value) => {
          neonExpressAct1Runtime = value;
        }, "set")
      },
      neonExpressAct2Runtime: {
        get: /* @__PURE__ */ __name(() => neonExpressAct2Runtime, "get"),
        set: /* @__PURE__ */ __name((value) => {
          neonExpressAct2Runtime = value;
        }, "set")
      },
      selectStageRuntime: {
        get: /* @__PURE__ */ __name(() => selectStageRuntime, "get"),
        set: /* @__PURE__ */ __name((value) => {
          selectStageRuntime = value;
        }, "set")
      },
      resetStageRuntime: {
        get: /* @__PURE__ */ __name(() => resetStageRuntime, "get"),
        set: /* @__PURE__ */ __name((value) => {
          resetStageRuntime = value;
        }, "set")
      },
      updateStageMotion: {
        get: /* @__PURE__ */ __name(() => updateStageMotion, "get"),
        set: /* @__PURE__ */ __name((value) => {
          updateStageMotion = value;
        }, "set")
      },
      beforeStageLanding: {
        get: /* @__PURE__ */ __name(() => beforeStageLanding, "get"),
        set: /* @__PURE__ */ __name((value) => {
          beforeStageLanding = value;
        }, "set")
      },
      afterStageLanding: {
        get: /* @__PURE__ */ __name(() => afterStageLanding, "get"),
        set: /* @__PURE__ */ __name((value) => {
          afterStageLanding = value;
        }, "set")
      },
      updateStageWorld: {
        get: /* @__PURE__ */ __name(() => updateStageWorld, "get"),
        set: /* @__PURE__ */ __name((value) => {
          updateStageWorld = value;
        }, "set")
      },
      handleStageEnemyDamage: {
        get: /* @__PURE__ */ __name(() => handleStageEnemyDamage, "get"),
        set: /* @__PURE__ */ __name((value) => {
          handleStageEnemyDamage = value;
        }, "set")
      },
      stageDeathLimit: {
        get: /* @__PURE__ */ __name(() => stageDeathLimit, "get"),
        set: /* @__PURE__ */ __name((value) => {
          stageDeathLimit = value;
        }, "set")
      },
      updateStageCompletion: {
        get: /* @__PURE__ */ __name(() => updateStageCompletion, "get"),
        set: /* @__PURE__ */ __name((value) => {
          updateStageCompletion = value;
        }, "set")
      }
    };
  }
  __name(getRuntimeBindings21, "getRuntimeBindings");

  // src/player-movement.js
  function jump() {
    if (usesAct1Motion()) {
      adoptAct1Interaction(p.act1Motion);
      if (p.act1Motion.mode === "grounded") {
        releaseAct1(p.act1Motion, "jump", true, state.runFrames);
        projectAct1Motion(p.act1Motion);
      }
      return;
    }
    p.scriptedLaunch = false;
    p.jumpAttack = true;
    if (p.surface?.grindable) p.grindExitFrame = state.runFrames;
    p.poseJumpFrame = state.runFrames;
    if (p.ground && p.surface?.contactMode === "oriented") {
      const b = surfaceBasis(p.surface), carry2 = surfaceVelocity(p.surface), speed2 = p.contactSpeed;
      const impulse2 = (p.jumpCut ? 6.8 : 13.4 + Math.min(2.4, Math.max(0, Math.abs(speed2) - 14) * 0.25)) * (p.underwater ? 7 / 13 : 1);
      p.vx = speed2 * b.tx + carry2.x + impulse2 * b.nx;
      p.vy = speed2 * b.ty + carry2.y + impulse2 * b.ny;
      p.jumpReleaseVy = speed2 * b.ty + carry2.y + (p.underwater ? 2.5 : 5) * b.ny;
      p.ground = false;
      p.surface = null;
      p.contactSpeed = null;
      state.coyote = 0;
      state.jumpBuffer = 0;
      state.stats.jumps++;
      gameSound("jump");
      return;
    }
    const surface = p.ground ? p.surface : null, slope = surface ? pose(surface).slope : 0, norm = Math.hypot(1, slope), speed = p.vx * norm;
    recordBlimpJump(surface, speed);
    const lift = p.jumpCut ? 6.8 : 13.4 + Math.min(2.4, Math.max(0, Math.abs(speed) - 14) * 0.25), impulse = lift * (p.underwater ? 7 / 13 : 1);
    const carry = surface ? surfaceVelocity(surface) : { x: 0, y: 0 };
    const inherited = (surface ? p.vx * slope : state.coyote > 0 ? p.coyoteLaunchVy ?? 0 : 0) + carry.y;
    p.vy = inherited - impulse;
    p.vx += carry.x;
    p.jumpReleaseVy = inherited - (p.underwater ? 2.5 : 5);
    p.ground = false;
    p.surface = null;
    state.coyote = 0;
    state.jumpBuffer = 0;
    state.stats.jumps++;
    gameSound("jump");
  }
  __name(jump, "jump");
  function stopRollAtRest() {
    if (p.rolling && p.ground && !state.charge && Math.abs(surfaceTravelSpeed()) < 0.03 && p.rollAge > 1 && canStand()) {
      p.rolling = false;
      p.roll = false;
      p.dashRolling = false;
      p.rollSpent = true;
    }
  }
  __name(stopRollAtRest, "stopRollAtRest");
  function updateRoll(down) {
    if (!p.rolling) p.dashRolling = false;
    if (down && !p.downHeld) {
      p.rollBuffer = 6;
      p.rollSpent = false;
    }
    if (!down) p.rollSpent = false;
    p.downHeld = down;
    if (p.ground && !p.surface?.grindable && p.rollBuffer > 0 && !p.rollSpent && !p.rolling) {
      p.rolling = true;
      p.rollAge = 0;
      p.lowRollFrames = 0;
      p.rollBuffer = 0;
      state.stats.rolls++;
    }
    if (p.rollBuffer > 0) p.rollBuffer--;
    if (p.rolling) {
      p.rollAge++;
      stopRollAtRest();
    }
    p.roll = p.rolling || state.charge > 0 || !p.ground;
  }
  __name(updateRoll, "updateRoll");
  function updateMovement() {
    if (usesAct1Motion()) return updateAct1Movement();
    updateWaterState();
    if (updateStageMotion()) return true;
    if (p.loop) return updateLoop();
    const waterScale = p.underwater ? 0.5 : 1, runSpeed = 14 * waterScale, beforeSpeed = Math.abs(p.vx), recoveryGrip = p.ground && ["recovery", "lower"].includes(p.surface?.kind);
    const down = keys.has("ArrowDown") || keys.has("KeyS");
    const dir = Number(keys.has("ArrowRight") || keys.has("KeyD")) - Number(keys.has("ArrowLeft") || keys.has("KeyA"));
    updateRoll(down);
    if (p.ground) state.coyote = tuning.coyote;
    else if (state.coyote > 0) state.coyote--;
    if (state.jumpBuffer > 0 && state.coyote > 0 && !state.charge) jump();
    else if (state.jumpBuffer > 0) state.jumpBuffer--;
    if (state.charge && down && JUMP_KEYS.some((k) => keys.has(k))) {
      state.charge = Math.min(20, state.charge + 0.2);
      if (state.runFrames % 10 === 0) {
        sparks(p.x - 15 * p.face, p.y + 18, 3, "#69efff");
        if (typeof gameSound === "function")
          gameSound("spindashCharge", { charge: state.charge / 20 });
      }
    }
    if (state.charge && !down) {
      gameSound("spindashRelease", { charge: state.charge / 20 });
      const releaseSpeed = p.face * (12 + state.charge * 0.35);
      if (p.surface?.contactMode === "oriented") p.contactSpeed = releaseSpeed;
      else p.vx = releaseSpeed / Math.hypot(1, p.surface ? pose(p.surface).slope : 0);
      state.charge = 0;
      p.rolling = true;
      p.dashRolling = true;
      p.rollAge = 0;
      p.lowRollFrames = 0;
      sparks(p.x, p.y + 15, 10, "#4bd9ff");
    }
    const wantBoost = keys.has("ShiftLeft") || keys.has("ShiftRight") || keys.has("KeyX") || keys.has("MouseBoost");
    if (!wantBoost) p.boostLocked = false;
    updateBoostState(wantBoost);
    const controlSurface = p.ground && !p.surface?.grindable ? p.surface : null, oriented = controlSurface?.contactMode === "oriented", basis = oriented ? surfaceBasis(controlSurface) : null, controlSlope = oriented ? basis.ty / Math.max(1e-6, Math.abs(basis.tx)) : controlSurface ? pose(controlSurface).slope : 0, controlNorm = oriented ? 1 : Math.hypot(1, controlSlope);
    if (oriented) p.vx = p.contactSpeed;
    else if (controlSurface) p.vx *= controlNorm;
    const uphillTractionLost = controlSurface && !p.scriptedLaunch && !p.wrongRouteDrop && !p.surface?.boostExit && dir * controlSlope < 0 && Math.abs(controlSlope) >= 1 && Math.abs(p.vx) < runSpeed * (2.5 / 6);
    if (p.boosting) {
      if (dir && Math.sign(p.vx) === dir) p.face = dir;
      if (p.vx * p.face < 23) p.vx += (p.face * 23 - p.vx) * 0.14;
      if (state.runFrames % 3 === 0)
        state.particles.push({
          x: p.x - 25 * p.face,
          y: p.y,
          vx: -p.face * 2,
          vy: 0,
          life: 14,
          color: "#43e5ff",
          trail: true
        });
    } else if (p.ground && p.surface?.grindable) {
      p.rolling = false;
      p.roll = false;
      state.charge = 0;
      if (dir && dir !== Math.sign(p.vx)) p.vx += dir * 0.45;
      else if (dir && Math.abs(p.vx) < 14) p.vx += dir * 0.08;
    } else if (state.charge) p.vx *= 0.66;
    else {
      const precisionBrake = !p.rolling && !p.scriptedLaunch && !p.wrongRouteDrop && (!p.surface?.boostExit || p.surface.kind === "main");
      if (!p.hurt && dir) {
        if (p.ground && p.rolling) {
          if (dir !== Math.sign(p.vx) && Math.abs(p.vx) > 0) {
            p.vx += dir * Math.min(
              Math.abs(p.vx),
              waterScale * (Math.abs(p.vx) <= 8 ? recoveryGrip ? 1.3 : 0.85 : recoveryGrip ? 1.1 : 0.5)
            );
            p.face = dir;
          } else if (Math.abs(p.vx) < 3 && !uphillTractionLost)
            p.vx = Math.max(-3, Math.min(3, p.vx + dir * 0.16 * waterScale));
        } else if (Math.abs(p.vx) < runSpeed || dir !== Math.sign(p.vx)) {
          const speed = Math.min(1, Math.abs(p.vx) / runSpeed), opposing = dir !== Math.sign(p.vx) && Math.abs(p.vx) > (precisionBrake ? 0 : 0.1);
          let a = p.ground ? opposing ? recoveryGrip ? Math.abs(p.vx) <= 14 ? 2.5 : 1.4 : Math.abs(p.vx) < 8 ? 1 : 0.82 : 0.52 * Math.pow(1 - speed, 1.5) + 0.035 : opposing ? 0.2 : 0.12;
          a *= waterScale / (opposing ? 1 : controlNorm);
          if (!opposing && uphillTractionLost) a = 0;
          if (opposing && precisionBrake)
            a = Math.min(Math.abs(p.vx), a * movementTuning.counterBrake);
          p.vx += dir * a;
          p.face = dir;
          if (Math.abs(p.vx) > runSpeed && dir === Math.sign(p.vx)) p.vx = dir * runSpeed;
        }
      } else if (p.ground) {
        if (!p.rolling) {
          const drag = precisionBrake && Math.abs(p.vx) < movementTuning.precisionSpeed ? recoveryGrip ? movementTuning.recoveryGrip : movementTuning.groundGrip : Math.abs(p.vx) <= 8 ? recoveryGrip ? 0.65 : 0.5 : recoveryGrip ? 0.4 : 0.22 + (Math.abs(p.vx) - 8) * 2e-3;
          p.vx = Math.sign(p.vx) * Math.max(0, Math.abs(p.vx) - drag * waterScale);
        }
      }
      if (Math.abs(p.vx) > 14 && !p.surface?.boostExit && (!p.ground || !p.rolling))
        p.vx *= p.ground ? 0.998 : 0.999;
    }
    if (p.ground && p.rolling) {
      p.vx = Math.sign(p.vx) * Math.max(0, Math.abs(p.vx) - 0.0234375 * 14 / 6 * waterScale);
      p.vx *= 0.9985;
    }
    if (controlSurface) {
      p.vx /= controlNorm;
    }
    if (oriented) {
      p.contactSpeed = p.vx;
      p.vx = p.contactSpeed * basis.tx;
      p.vy = p.contactSpeed * basis.ty;
    }
    applySurfaceMotion();
    if (Math.abs(p.vx) < 0.03) p.vx = 0;
    state.stats.maxSpeed = Math.max(
      state.stats.maxSpeed,
      Math.abs(p.surface?.contactMode === "oriented" ? p.contactSpeed : p.vx)
    );
    state.anim += Math.abs(p.surface?.contactMode === "oriented" ? p.contactSpeed : p.vx) * 0.08;
    if (!p.ground && p.airSpeedLimit)
      p.vx = Math.max(-p.airSpeedLimit, Math.min(p.airSpeedLimit, p.vx));
    moveAndResolveSurfaces();
    stopRollAtRest();
    updateBrakingPose(dir, beforeSpeed);
    if (p.ground && p.surface?.grindable && Math.abs(p.vx) > 2 && state.runFrames % 3 === 0) {
      const fast = p.boosting || Math.abs(p.vx) > 18;
      state.particles.push({
        x: p.x + 7 * Math.sign(p.vx),
        y: feet() - 1,
        vx: -Math.sign(p.vx) * (fast ? 4 : 2),
        vy: fast ? -1.5 : -0.7,
        life: fast ? 12 : 8,
        color: fast ? "#ffdb72" : "#ffe4a4",
        grind: true,
        trail: false
      });
      if (fast && state.runFrames % 6 === 0)
        state.particles.push({
          x: p.x - 10 * Math.sign(p.vx),
          y: feet() + 1,
          vx: -Math.sign(p.vx) * 5,
          vy: 0,
          life: 7,
          color: "#ffa65b",
          grind: true,
          trail: true
        });
    }
    if (state.level.deathZones?.some((z) => p.x >= z.x1 && p.x <= z.x2 && feet() > z.y)) {
      die();
      return false;
    }
    if (feet() > stageDeathLimit()) {
      die();
      return false;
    }
    return true;
  }
  __name(updateMovement, "updateMovement");
  function updateBrakingPose(dir, incoming) {
    const speed = Math.abs(p.vx), opposing = dir && dir !== Math.sign(p.vx), resisting = p.ground && !p.surface?.grindable && !p.rolling && !state.charge && !p.boosting && !p.hurt && (!dir || opposing);
    if (resisting && (speed > 0.03 || p.brakeActive)) {
      if (!p.brakeActive) {
        p.brakeAge = 0;
        p.brakeSpeed = incoming;
        p.brakeFace = Math.sign(p.vx) || p.face;
      }
      p.brakeActive = speed > 0.03;
      p.brakeAge++;
      p.brakeSpeed = Math.max(p.brakeSpeed || 0, incoming);
      if (!speed) {
        p.stopFrame = state.runFrames;
        p.brakeActive = false;
      }
      if (speed > 2 && (p.brakeAge === 1 || state.runFrames % 3 === 0)) {
        const force = Math.min(1, p.brakeSpeed / 23);
        state.particles.push({
          x: p.x + 8 * p.brakeFace,
          y: feet() - 2,
          vx: -p.brakeFace * (0.5 + force * 2),
          vy: -0.5 - force * 0.9,
          life: 12 + force * 8,
          color: "#bbc0cd",
          skid: true,
          size: 3 + force * 4
        });
        if (force > 0.5)
          state.particles.push({
            x: p.x,
            y: feet() - 1,
            vx: -p.brakeFace,
            vy: 0,
            life: 9,
            color: "#ffe1a0",
            trail: true,
            skid: true
          });
      }
    } else {
      p.brakeActive = false;
      if (dir || !p.ground || p.rolling || p.boosting || p.hurt) p.stopFrame = -100;
    }
  }
  __name(updateBrakingPose, "updateBrakingPose");
  function waterAt(x, y) {
    const pool = state.level.middleSection?.pool;
    if (!pool || x < pool.x1 || x > pool.x2 || y <= pool.y) return null;
    let floor = pool.floor;
    for (const id of pool.deckIds) {
      const s = surfaceById(id);
      if (s && x >= s.x1 && x <= s.x2) {
        floor = yOn(s, x);
        break;
      }
    }
    return y < floor ? pool : null;
  }
  __name(waterAt, "waterAt");
  function resetPlayerAbilities() {
    Object.assign(p, {
      shield: null,
      bubbleSlam: false,
      underwater: false,
      airRemaining: 1800,
      airBoostUsed: false,
      airBoostFrames: 0,
      airBoostActive: false,
      airBoostRequested: false,
      groundBoostHeld: false,
      jumpReleaseVy: null,
      coyoteLaunchVy: null,
      dashRolling: false
    });
  }
  __name(resetPlayerAbilities, "resetPlayerAbilities");
  function updateWaterState() {
    const wet = !!waterAt(p.x, p.y), wasWet = !!p.underwater;
    if (wet && !wasWet) {
      p.vx *= 0.5;
      p.vy *= 0.25;
      gameSound("pool");
    } else if (!wet && wasWet) {
      const pool = state.level.middleSection?.pool;
      if (pool && p.y <= pool.y && p.vy < 0) p.vy = Math.max(-13.4 * 16 / 6.5, p.vy * 2);
      gameSound("pool");
    }
    p.underwater = wet;
  }
  __name(updateWaterState, "updateWaterState");
  function updateBreathing() {
    if (!waterAt(p.x, p.y - 10) || p.shield === "bubble") {
      p.airRemaining = 1800;
      return true;
    }
    p.airRemaining = Math.max(0, (p.airRemaining ?? 1800) - 1);
    if (!p.airRemaining) {
      die();
      return false;
    }
    if (p.airRemaining === 1500 || p.airRemaining === 1200 || p.airRemaining === 900 || p.airRemaining <= 720 && p.airRemaining % 60 === 0)
      gameSound("airWarning");
    return true;
  }
  __name(updateBreathing, "updateBreathing");
  function beginBubbleSlam() {
    p.bubbleSlam = true;
    p.jumpReleaseVy = null;
    p.airBoostFrames = 0;
    p.airBoostActive = false;
    p.airBoostRequested = false;
    p.groundBoostHeld = false;
    p.boosting = false;
    p.scriptedLaunch = false;
    p.airSpeedLimit = null;
    p.airLaunchUntil = 0;
    p.vy = p.underwater ? 8 : 16;
    p.jumpAttack = true;
    p.rolling = false;
    p.roll = true;
    state.charge = 0;
    state.coyote = 0;
    state.jumpBuffer = 0;
    gameSound("bubbleBounce");
  }
  __name(beginBubbleSlam, "beginBubbleSlam");
  function reboundBubbleShield() {
    if (!p.bubbleSlam || p.shield !== "bubble") return false;
    p.bubbleSlam = false;
    p.jumpReleaseVy = null;
    p.vy = -13.4 * (p.underwater ? 7 / 13 : 1);
    p.ground = false;
    p.surface = null;
    p.jumpAttack = true;
    p.airBoostUsed = false;
    p.airBoostFrames = 0;
    p.airBoostActive = false;
    p.poseJumpFrame = state.runFrames;
    p.airLaunchUntil = state.runFrames + 8;
    state.coyote = 0;
    state.jumpBuffer = 0;
    gameSound("bubbleBounce");
    return true;
  }
  __name(reboundBubbleShield, "reboundBubbleShield");
  function initializeRuntimeModule22() {
  }
  __name(initializeRuntimeModule22, "initializeRuntimeModule");
  function getRuntimeBindings22() {
    return {
      jump: {
        get: /* @__PURE__ */ __name(() => jump, "get"),
        set: /* @__PURE__ */ __name((value) => {
          jump = value;
        }, "set")
      },
      updateRoll: {
        get: /* @__PURE__ */ __name(() => updateRoll, "get"),
        set: /* @__PURE__ */ __name((value) => {
          updateRoll = value;
        }, "set")
      },
      updateMovement: {
        get: /* @__PURE__ */ __name(() => updateMovement, "get"),
        set: /* @__PURE__ */ __name((value) => {
          updateMovement = value;
        }, "set")
      },
      updateBrakingPose: {
        get: /* @__PURE__ */ __name(() => updateBrakingPose, "get"),
        set: /* @__PURE__ */ __name((value) => {
          updateBrakingPose = value;
        }, "set")
      },
      waterAt: {
        get: /* @__PURE__ */ __name(() => waterAt, "get"),
        set: /* @__PURE__ */ __name((value) => {
          waterAt = value;
        }, "set")
      },
      resetPlayerAbilities: {
        get: /* @__PURE__ */ __name(() => resetPlayerAbilities, "get"),
        set: /* @__PURE__ */ __name((value) => {
          resetPlayerAbilities = value;
        }, "set")
      },
      updateWaterState: {
        get: /* @__PURE__ */ __name(() => updateWaterState, "get"),
        set: /* @__PURE__ */ __name((value) => {
          updateWaterState = value;
        }, "set")
      },
      updateBreathing: {
        get: /* @__PURE__ */ __name(() => updateBreathing, "get"),
        set: /* @__PURE__ */ __name((value) => {
          updateBreathing = value;
        }, "set")
      },
      beginBubbleSlam: {
        get: /* @__PURE__ */ __name(() => beginBubbleSlam, "get"),
        set: /* @__PURE__ */ __name((value) => {
          beginBubbleSlam = value;
        }, "set")
      },
      reboundBubbleShield: {
        get: /* @__PURE__ */ __name(() => reboundBubbleShield, "get"),
        set: /* @__PURE__ */ __name((value) => {
          reboundBubbleShield = value;
        }, "set")
      }
    };
  }
  __name(getRuntimeBindings22, "getRuntimeBindings");

  // src/world-interactions.js
  var world_interactions_exports = {};
  __export(world_interactions_exports, {
    activateWorldDevices: () => activateWorldDevices,
    collectWorldRings: () => collectWorldRings,
    configureDirectionalSpikes: () => configureDirectionalSpikes,
    getRuntimeBindings: () => getRuntimeBindings23,
    initializeRuntimeModule: () => initializeRuntimeModule23,
    resolveMotionInteractions: () => resolveMotionInteractions,
    resolveSpringContact: () => resolveSpringContact,
    springFace: () => springFace,
    updateWorldCheckpoints: () => updateWorldCheckpoints,
    updateWorldEnemies: () => updateWorldEnemies,
    updateWorldPlatforms: () => updateWorldPlatforms
  });
  function configureDirectionalSpikes(level) {
    level.hazards = level.hazards.flatMap((h) => {
      if (h.type !== "spikes" || h.direction || !(/^spike-\d+$/.test(h.id) || ["under-attack-spike-1", "split-skyline-spike-204"].includes(h.id)))
        return [h];
      const floor = h.y + h.h, depth = 12, height = 32;
      return [
        { ...h, direction: "left", y: floor - height, w: depth, h: height },
        {
          id: h.id + "-mount",
          type: "bulkhead",
          spikeMount: true,
          x: h.x + depth,
          y: floor - height,
          w: h.w - 2 * depth,
          h: height,
          kind: "solid",
          x1: h.x + depth,
          x2: h.x + h.w - depth,
          y1: floor - height,
          y2: floor - height
        },
        {
          ...h,
          id: h.id + "-right",
          direction: "right",
          x: h.x + h.w - depth,
          y: floor - height,
          w: depth,
          h: height
        }
      ];
    });
    return level;
  }
  __name(configureDirectionalSpikes, "configureDirectionalSpikes");
  function updateWorldPlatforms() {
    for (const s of state.level.surfaces) {
      if (s.restoreAt && state.runFrames >= s.restoreAt) {
        s.restoreAt = 0;
        s.crumbleTimer = -1;
      }
      if (s.crumbleTimer >= 0 && !s.restoreAt) {
        s.crumbleTimer--;
        if (s.crumbleTimer === 0) {
          s.restoreAt = state.runFrames + 240;
          s.crumbleTimer = -1;
          sparks((s.x1 + s.x2) / 2, s.y1, 10, "#ffac54");
        }
      }
    }
  }
  __name(updateWorldPlatforms, "updateWorldPlatforms");
  function collectWorldRings(oldX = p.x, oldY = p.y) {
    for (const r of state.rings)
      if (!r.taken && (!r.sealedBy || state.level.hazards.find((h) => h.id === r.sealedBy)?.broken) && sweptCircleTime(oldX, oldY, p.x, p.y, r.x, r.y, 29) !== null) {
        r.taken = true;
        state.count++;
        state.score += 100;
        gameSound("ring");
        sparks(r.x, r.y, 3);
      }
  }
  __name(collectWorldRings, "collectWorldRings");
  function activateWorldDevices() {
    for (const pad of state.level.pads)
      if (p.ground && Math.abs(p.x - pad.x) < 25 && Math.abs(feet() - pad.y) < 8 && (pad.cityVent || pad.poolBooster || p.vx > 0) && (!pad.sealedBy || state.level.hazards.find((h) => h.id === pad.sealedBy)?.broken)) {
        if (pad.poolBooster) {
          p.vx = Math.max(p.vx, pad.launchX);
          p.rolling = true;
          p.roll = true;
          p.rollAge = 0;
          p.poolExit = true;
          pad.firedAt = state.runFrames;
          gameSound("pool", { launch: true });
        } else if (pad.cityVent) launchAirDevice(pad);
        else p.vx = Math.max(p.vx, 18.5);
      }
  }
  __name(activateWorldDevices, "activateWorldDevices");
  function springFace(d, t = state.runFrames) {
    const { x, y } = airDevicePose(d, t);
    const angle = polishDirection(d) * Math.PI / 8, nx = Math.sin(angle), ny = -Math.cos(angle);
    const offset = 40 - [0, 4, -9, -6, -3, 1][polishedSpringFrame(d)] * 2;
    return { x: x + nx * offset, y: y + ny * offset, nx, ny, tx: -ny, ty: nx };
  }
  __name(springFace, "springFace");
  function resolveSpringContact(oldX, oldY, t0 = 0, t1 = 1) {
    if (p.loop || p.wrongRouteDrop || bossOwnsControls()) return;
    const half = bodyHeight() / 2, centerY = p.y + 20 - half, oldCenterY = oldY + 20 - half;
    let hit = null;
    for (const d of state.level.springs || []) {
      if (d.id === "blimp-entry-spring" && !qualifyingBlimpEntry()) continue;
      if (d.id === "blimp-return-spring" && !state.level.blimpRoute?.entered) continue;
      const b = springFace(d, state.runFrames - 1 + t0), c = springFace(d, state.runFrames - 1 + t1);
      const radius = Math.abs(c.nx) * 13 + Math.abs(c.ny) * half;
      const before = (oldX - b.x) * c.nx + (oldCenterY - b.y) * c.ny - radius, after = (p.x - c.x) * c.nx + (centerY - c.y) * c.ny - radius;
      const flush = p.ground && Math.abs(before) < 1e-8 && Math.abs(after) < 1e-8;
      if (!flush && (before < -0.01 || after > 0 || after >= before)) continue;
      const vx = Math.abs(c.nx) < 1e-8 ? 0 : -Math.sign(c.nx) * 13, vy = Math.abs(c.ny) < 1e-8 ? 0 : -Math.sign(c.ny) * half;
      const edge = (Math.abs(c.nx) < 1e-8 ? 13 * Math.abs(c.tx) : 0) + (Math.abs(c.ny) < 1e-8 ? half * Math.abs(c.ty) : 0);
      const from = (oldX + vx - b.x) * c.tx + (oldCenterY + vy - b.y) * c.ty, to = (p.x + vx - c.x) * c.tx + (centerY + vy - c.y) * c.ty;
      const t = flush ? sweptBoxTime(from, 0, to, 0, -24 - edge, -1, 24 + edge, 1) : before / (before - after);
      if (t === null) continue;
      const x = oldX + (p.x - oldX) * t, y = oldCenterY + (centerY - oldCenterY) * t, tangent = from + (to - from) * t;
      if (Math.abs(tangent) > 24 + edge || hit && hit.t <= t) continue;
      hit = { d, t, x, y: y - 20 + half };
    }
    if (!hit) return;
    p.x = hit.x;
    p.y = hit.y;
    if (hit.d.id === "blimp-entry-spring") state.level.blimpRoute.entered = true;
    launchAirDevice(hit.d);
  }
  __name(resolveSpringContact, "resolveSpringContact");
  function resolveMotionInteractions(oldX, oldY, oldSurface = null) {
    if (bossOwnsControls()) return;
    const deaths = state.stats.deaths;
    p.interactionsFrame = state.runFrames;
    collectWorldRings(oldX, oldY);
    if (!p.loop) activateWorldDevices();
    collectBoostMonitors(oldX, oldY);
    updateWorldEnemies(oldX, oldY);
    if (state.stats.deaths === deaths) updateWorldCheckpoints(oldX, oldY, oldSurface);
  }
  __name(resolveMotionInteractions, "resolveMotionInteractions");
  function updateWorldEnemies(oldX = p.x, oldY = p.y) {
    for (const e of state.enemies) {
      if (!e.alive) continue;
      e.x = e.base + Math.sin(state.runFrames * 0.018 + e.phase) * e.range;
      e.y = e.baseY + (e.kind === "drone" ? Math.sin(state.runFrames * 0.027 + e.phase) * 12 : 0);
      const contact = sweptCircleTime(oldX, oldY, p.x, p.y, e.x, e.y, 33);
      if (contact !== null) {
        const stomp = p.vy > 0 && oldY + (p.y - oldY) * contact + 20 <= e.y + 12 && !e.jumpImmune, jumpHit = !p.ground && p.jumpAttack && p.hurt === 0 && !e.jumpImmune;
        if (p.boosting || p.ground && p.roll && Math.abs(p.vx) > 3 || stomp || jumpHit) {
          e.alive = false;
          state.score += 500;
          sparks(e.x, e.y, 14, "#ff9556");
          if (stomp && !p.boosting && e.rebound !== false) {
            p.vy = p.jumpHeld ? -16 : -8;
            p.poseJumpFrame = state.runFrames;
            p.ground = false;
            p.surface = null;
            state.stats.rebound++;
            gameSound("enemy");
          } else gameSound("enemy");
        } else if (!p.inv) {
          hurt(e.x);
          handleStageEnemyDamage(e);
        }
      }
    }
  }
  __name(updateWorldEnemies, "updateWorldEnemies");
  function updateWorldCheckpoints(oldX = p.x, oldY = p.y, oldSurface = null) {
    for (let i = state.checkpoint + 1; i < state.level.checkpoints.length; i++) {
      const c = state.level.checkpoints[i];
      const crossed = oldSurface && oldX <= c.x && p.x >= c.x && ["main", "express"].includes(oldSurface.kind) && (!state.level.verticalCity || oldSurface.id === c.surfaceId) && c.x >= pose(oldSurface).x1 && c.x <= pose(oldSurface).x2 && Math.abs(yOn(oldSurface, c.x) - c.y) < 150;
      if (crossed || p.x >= c.x && p.ground && ["main", "express"].includes(p.surface?.kind) && (!state.level.verticalCity || p.surface.id === c.surfaceId) && Math.abs(feet() - c.y) < 150) {
        state.checkpoint = i;
        state.stage = i;
        if (state.level.act !== 2)
          notify(
            c.hint || state.level.sectors[state.level.sectors.findLastIndex((s) => s.x <= c.x)].hint
          );
        gameSound("checkpoint");
      }
    }
    state.stage = Math.max(
      0,
      state.level.sectors.findLastIndex((s) => p.x >= s.x)
    );
  }
  __name(updateWorldCheckpoints, "updateWorldCheckpoints");
  function initializeRuntimeModule23() {
  }
  __name(initializeRuntimeModule23, "initializeRuntimeModule");
  function getRuntimeBindings23() {
    return {
      updateWorldPlatforms: {
        get: /* @__PURE__ */ __name(() => updateWorldPlatforms, "get"),
        set: /* @__PURE__ */ __name((value) => {
          updateWorldPlatforms = value;
        }, "set")
      },
      collectWorldRings: {
        get: /* @__PURE__ */ __name(() => collectWorldRings, "get"),
        set: /* @__PURE__ */ __name((value) => {
          collectWorldRings = value;
        }, "set")
      },
      activateWorldDevices: {
        get: /* @__PURE__ */ __name(() => activateWorldDevices, "get"),
        set: /* @__PURE__ */ __name((value) => {
          activateWorldDevices = value;
        }, "set")
      },
      updateWorldEnemies: {
        get: /* @__PURE__ */ __name(() => updateWorldEnemies, "get"),
        set: /* @__PURE__ */ __name((value) => {
          updateWorldEnemies = value;
        }, "set")
      },
      updateWorldCheckpoints: {
        get: /* @__PURE__ */ __name(() => updateWorldCheckpoints, "get"),
        set: /* @__PURE__ */ __name((value) => {
          updateWorldCheckpoints = value;
        }, "set")
      }
    };
  }
  __name(getRuntimeBindings23, "getRuntimeBindings");

  // src/surface-collision.js
  var staticSurfacePoses;
  function pose(s, t = state.runFrames) {
    if (!s.motion) {
      const cached = staticSurfacePoses.get(s);
      if (cached && cached.x1 === s.x1 && cached.x2 === s.x2 && cached.y1 === s.y1 && cached.y2 === s.y2)
        return cached;
      const q = {
        x1: s.x1 + 0,
        x2: s.x2 + 0,
        y1: s.y1 + 0,
        y2: s.y2 + 0,
        slope: (s.y2 - s.y1) / (s.x2 - s.x1)
      };
      staticSurfacePoses.set(s, q);
      return q;
    }
    let dx = 0, dy = 0;
    if (s.motion) {
      const m = s.motion, n = m.type === "flight" ? m.startedAt === null ? 0 : Math.sign(m.distance) * Math.min(Math.abs(m.distance), Math.max(0, t - m.startedAt) * m.speed) : Math.sin(t / m.period * Math.PI * 2 + m.phase) * m.amp;
      if (s.motion.axis === "x") dx = n;
      else dy = n;
    }
    return {
      x1: s.x1 + dx,
      x2: s.x2 + dx,
      y1: s.y1 + dy,
      y2: s.y2 + dy,
      slope: (s.y2 - s.y1) / (s.x2 - s.x1)
    };
  }
  __name(pose, "pose");
  function surfaceBasis(s, t = state.runFrames) {
    const q = pose(s, t), dx = q.x2 - q.x1, dy = q.y2 - q.y1, length = Math.hypot(dx, dy);
    if (length < 1e-8) return null;
    return { ...q, length, tx: dx / length, ty: dy / length, nx: dy / length, ny: -dx / length };
  }
  __name(surfaceBasis, "surfaceBasis");
  function surfaceTravelSpeed() {
    if (p.loop) return p.loop.speed;
    if (p.ground && p.surface?.contactMode === "oriented") return p.contactSpeed ?? 0;
    return p.ground && p.surface ? p.vx * Math.hypot(1, pose(p.surface).slope) : p.vx;
  }
  __name(surfaceTravelSpeed, "surfaceTravelSpeed");
  function groundSlopeForce(rolling, speed, tangentY) {
    return rolling ? speed * tangentY < 0 ? 0.145 : 0.58 : 0.232;
  }
  __name(groundSlopeForce, "groundSlopeForce");
  function surfaceNormalReaction(speed, curvature, normalY, gravity) {
    return -speed * speed * curvature - gravity * normalY;
  }
  __name(surfaceNormalReaction, "surfaceNormalReaction");
  function loopPhysics(l) {
    if (l.profile === "advanced") return { gravity: l.gravity ?? 0.58, drag: 15e-4 };
    return {
      gravity: Math.min(groundSlopeForce(false, 0, 0), 14 * 14 / (6.5 * l.r)),
      drag: 15e-4 * Math.min(1, 130 / l.r)
    };
  }
  __name(loopPhysics, "loopPhysics");
  function surfaceVelocity(s) {
    const a = pose(s, state.runFrames - 1), b = pose(s);
    return { x: b.x1 - a.x1, y: b.y1 - a.y1 };
  }
  __name(surfaceVelocity, "surfaceVelocity");
  function yOn(s, x, t = state.runFrames) {
    const q = pose(s, t);
    return q.y1 + (x - q.x1) * q.slope;
  }
  __name(yOn, "yOn");
  function active(s) {
    return (!s.sealedBy || state.level.hazards.find((h) => h.id === s.sealedBy)?.broken) && (!s.restoreAt || state.runFrames >= s.restoreAt);
  }
  __name(active, "active");
  function surfaceOverlaps(s, left, right) {
    let x1 = Math.min(s.x1, s.x2), x2 = Math.max(s.x1, s.x2);
    const m = s.motion;
    if (m?.axis === "x") {
      if (m.type === "flight") {
        x1 += Math.min(0, m.distance);
        x2 += Math.max(0, m.distance);
      } else {
        const reach = Math.abs(m.amp);
        x1 -= reach;
        x2 += reach;
      }
    }
    return right >= x1 && left <= x2;
  }
  __name(surfaceOverlaps, "surfaceOverlaps");
  function topAt(x, below = -Infinity) {
    let result = null;
    for (const s of state.level.surfaces) {
      if (s.contactMode === "oriented" || !surfaceOverlaps(s, x, x) || !active(s)) continue;
      const q = pose(s);
      if (x >= q.x1 && x <= q.x2) {
        const y = yOn(s, x);
        if (y >= below && (!result || y < result.y)) result = { s, y };
      }
    }
    return result;
  }
  __name(topAt, "topAt");
  function bodyHeight() {
    if (state.selectedAct === 1 && p.act1Motion)
      return p.act1Motion.posture === "rolling" ? 38 : 48;
    return p.ground && p.roll ? 26 : !p.ground ? 38 : 48;
  }
  __name(bodyHeight, "bodyHeight");
  function feet() {
    return p.y + 20;
  }
  __name(feet, "feet");
  function resetPlatforms() {
    for (const s of state.level.surfaces) {
      s.crumbleTimer = -1;
      s.restoreAt = 0;
    }
  }
  __name(resetPlatforms, "resetPlatforms");
  function land(s, y, contact = null) {
    const oriented = s.contactMode === "oriented", basis = oriented ? surfaceBasis(s) : null;
    const contactSpeed = oriented ? contact?.speed ?? p.vx * basis.tx + p.vy * basis.ty : 0;
    p.scriptedLaunch = false;
    p.jumpReleaseVy = null;
    p.coyoteLaunchVy = null;
    p.airBoostUsed = false;
    p.airBoostFrames = 0;
    p.airBoostActive = false;
    beforeStageLanding(s);
    if (!s.grindable && !oriented) {
      const slope = pose(s).slope, norm = Math.hypot(1, slope);
      if (p.ground && p.surface?.contactMode === "oriented") p.vx = p.contactSpeed / norm;
      else if (p.ground && p.surface) {
        p.vx *= Math.hypot(1, pose(p.surface).slope) / norm;
      } else if (!p.wrongRouteDrop) {
        const carry = surfaceVelocity(s);
        p.vx = (p.vx - carry.x + (p.vy - carry.y) * slope) / (norm * norm);
      }
    }
    if (s.grindable && p.surface !== s) {
      p.grindEntryFrame = state.runFrames;
      p.grindFromFast = p.boosting || Math.abs(p.vx) > 17;
      p.grindFast = Math.abs(p.vx) > 18 || p.boosting;
      p.rolling = false;
      p.roll = false;
      p.brakeActive = false;
      p.stopFrame = -100;
      state.charge = 0;
    } else if (p.surface?.grindable && !s.grindable) {
      p.grindExitFrame = state.runFrames;
    }
    if (!p.ground) {
      p.poseLandingFrame = state.runFrames;
      gameSound(s.grindable ? "grind" : "land", { speed: Math.abs(p.vx), volume: 0.7 });
    }
    p.landFrame = state.runFrames;
    p.landKind = s.kind;
    const changed = p.surface !== s || !p.ground;
    p.y = y - 20;
    p.vy = 0;
    p.ground = true;
    p.jumpAttack = false;
    p.airSpeedLimit = null;
    p.surface = s;
    if (oriented) {
      p.contactSpeed = contactSpeed;
      p.x = (contact?.x ?? p.x - basis.nx * 20) + basis.nx * 20;
      p.y = (contact?.y ?? y) + basis.ny * 20;
      p.vx = contactSpeed * basis.tx;
      p.vy = contactSpeed * basis.ty;
    } else p.contactSpeed = null;
    afterStageLanding(s);
    recordSurfaceLanding(s, changed);
    if (!reboundBubbleShield() && changed && state.jumpBuffer > 0) jump();
  }
  __name(land, "land");
  function recordSurfaceLanding(s, changed) {
    if (changed && !state.visited.has(s.id)) {
      state.visited.add(s.id);
      if (s.kind === "express") {
        state.stats.expressLandings++;
        state.score += 400;
        sparks(p.x, p.y + 20, 5, "#ffdf72");
      }
      if (s.kind === "recovery" || s.kind === "lower") state.stats.recoveries++;
    }
    if (s.kind === "crumble" && s.crumbleTimer < 0) s.crumbleTimer = s.crumbleDelay;
    for (const group of state.level.collapseGroups || [])
      if (group.entryId === s.id && !group.triggered) {
        group.triggered = true;
        for (const id of group.tailIds) {
          const tail = state.level.surfaces.find((v) => v.id === id);
          if (tail) tail.crumbleTimer = group.delay;
        }
      }
  }
  __name(recordSurfaceLanding, "recordSurfaceLanding");
  function canStand() {
    const foot = feet();
    return !state.level.hazards.some(
      (h) => h.type === "gate" && p.x + 13 > h.x && p.x - 13 < h.x + h.w && foot > h.y && foot - 48 < h.y + h.h
    );
  }
  __name(canStand, "canStand");
  function sweptBoxTime(ax, ay, bx, by, left, top, right, bottom) {
    let enter = 0, exit = 1;
    for (let axis = 0; axis < 2; axis++) {
      const a = axis ? ay : ax, d = axis ? by - ay : bx - ax, lo = axis ? top : left, hi = axis ? bottom : right;
      if (Math.abs(d) < 1e-10) {
        if (a < lo || a > hi) return null;
        continue;
      }
      const u = (lo - a) / d, v = (hi - a) / d;
      enter = Math.max(enter, Math.min(u, v));
      exit = Math.min(exit, Math.max(u, v));
      if (enter > exit) return null;
    }
    return enter;
  }
  __name(sweptBoxTime, "sweptBoxTime");
  function sweptCircleTime(ax, ay, bx, by, cx, cy, radius) {
    const x = ax - cx, y = ay - cy, dx = bx - ax, dy = by - ay, c = x * x + y * y - radius * radius;
    if (c <= 0) return 0;
    const a = dx * dx + dy * dy;
    if (a < 1e-10) return null;
    const b = x * dx + y * dy, disc = b * b - a * c;
    if (disc < 0) return null;
    const t = (-b - Math.sqrt(disc)) / a;
    return t >= 0 && t <= 1 ? t : null;
  }
  __name(sweptCircleTime, "sweptCircleTime");
  function spikeContact(h, oldX, oldY) {
    const direction = h.direction ?? "up", height = bodyHeight(), halfWidth = state.selectedAct === 1 && p.act1Motion ? p.act1Motion.posture === "rolling" ? 19 : 11 : 13;
    const nx = direction === "left" ? -1 : direction === "right" ? 1 : 0, ny = direction === "up" ? -1 : direction === "down" ? 1 : 0;
    const cx = nx < 0 ? h.x : nx > 0 ? h.x + h.w : h.x + h.w / 2, cy = ny < 0 ? h.y : ny > 0 ? h.y + h.h : h.y + h.h / 2;
    const half = height / 2, radius = Math.abs(nx) * halfWidth + Math.abs(ny) * half;
    const before = (oldX - cx) * nx + (oldY + 20 - half - cy) * ny - radius, after = (p.x - cx) * nx + (p.y + 20 - half - cy) * ny - radius;
    if (before < -0.01 || after > 0 || after > before) return false;
    const t = before === after ? 0 : before / (before - after), x = oldX + (p.x - oldX) * t, y = oldY + (p.y - oldY) * t + 20 - half;
    const along = nx ? y - cy : x - cx, span = nx ? h.h : h.w, extent = nx ? half : halfWidth;
    for (let start2 = 0; start2 < span; start2 += 20) {
      const tip = -span / 2 + start2 + Math.min(20, span - start2) / 2;
      if (Math.abs(along - tip) <= extent) return true;
    }
    return false;
  }
  __name(spikeContact, "spikeContact");
  function resolveHazards(oldX, oldY) {
    for (const h of state.level.hazards) {
      if (h.broken) continue;
      if (h.type === "spikes") {
        if (spikeContact(h, oldX, oldY)) hurt(h.x + h.w / 2);
        continue;
      }
      if (p.x + 13 < h.x || p.x - 13 > h.x + h.w) continue;
      const foot = feet(), height = bodyHeight(), top = foot - height;
      if (foot <= h.y || top >= h.y + h.h) continue;
      if (h.type === "breakable" && (p.boosting || !h.boostOnly && Math.abs(p.vx) >= h.threshold)) {
        h.broken = true;
        gameSound("hazard");
        state.score += 350;
        state.stats.barriers = (state.stats.barriers || 0) + 1;
        sparks(h.x, h.floor - 40, 18, "#ffcc70");
        continue;
      }
      const previousTop = oldY + 20 - height;
      if (oldY + 20 <= h.y && p.vy >= 0) {
        if (h.spikeMount) land(h, h.y);
        else {
          p.y = h.y - 20;
          p.vy = 0;
          p.ground = false;
          reboundBubbleShield();
        }
      } else if (previousTop >= h.y + h.h && p.vy < 0) {
        p.y = h.y + h.h + height - 20;
        p.vy = 1;
      } else {
        const fromLeft = oldX < h.x + h.w / 2;
        p.x = fromLeft ? h.x - 14 : h.x + h.w + 14;
        p.vx = 0;
        p.boosting = false;
      }
    }
  }
  __name(resolveHazards, "resolveHazards");
  function applySurfaceMotion() {
    if (p.ground && p.surface?.contactMode === "oriented") {
      const b = surfaceBasis(p.surface);
      p.contactSpeed += groundSlopeForce(p.rolling, p.contactSpeed, b.ty) * b.ty * (p.underwater ? 2 / 7 : 1);
      p.vx = p.contactSpeed * b.tx;
      p.vy = p.contactSpeed * b.ty;
      const carry = surfaceVelocity(p.surface);
      p.x += carry.x;
      p.y += carry.y;
      if (b.ny >= -Math.SQRT1_2 && Math.abs(p.contactSpeed) < 14 * (2.5 / 6) * (p.underwater ? 0.5 : 1))
        leaveSurface(p.surface);
      return;
    }
    if (p.ground && p.surface) {
      const slope = pose(p.surface).slope, norm = Math.hypot(1, slope), dir = Number(keys.has("ArrowRight") || keys.has("KeyD")) - Number(keys.has("ArrowLeft") || keys.has("KeyA"));
      if (!p.surface.grindable && !state.charge && (p.rolling || p.boosting || dir || Math.abs(p.vx * norm) >= 3)) {
        const wet = p.underwater ? 2 / 7 : 1;
        const force = groundSlopeForce(p.rolling, p.vx, slope);
        p.vx += force * slope * wet / (norm * norm);
      }
      const carry = surfaceVelocity(p.surface);
      p.x += carry.x;
      p.y += carry.y;
    }
  }
  __name(applySurfaceMotion, "applySurfaceMotion");
  function leaveSurface(s) {
    recordBlimpDeparture(s);
    if (s.contactMode === "oriented") {
      const b = surfaceBasis(s), carry2 = surfaceVelocity(s);
      p.vx = p.contactSpeed * b.tx + carry2.x;
      p.vy = p.contactSpeed * b.ty + carry2.y;
      p.coyoteLaunchVy = p.vy;
      p.ground = false;
      p.surface = null;
      p.contactSpeed = null;
      return;
    }
    const slope = pose(s).slope, carry = surfaceVelocity(s);
    p.vy = p.vx * slope + carry.y;
    p.coyoteLaunchVy = p.vy;
    p.vx += carry.x;
    p.ground = false;
    p.surface = null;
  }
  __name(leaveSurface, "leaveSurface");
  function moveAndResolveSurfaces() {
    const surfaceVy = p.ground && p.surface && p.surface.contactMode !== "oriented" ? p.vx * pose(p.surface).slope : 0;
    const count = Math.max(
      1,
      Math.ceil(Math.max(Math.abs(p.vx), Math.abs(p.vy), Math.abs(surfaceVy)) / 24)
    ), dt = 1 / count;
    const lastX = p.x, lastY = p.y, deaths = state.stats.deaths;
    for (let i = 0; i < count; i++) {
      const oldX = p.x, oldY = p.y, oldSurface = p.ground ? p.surface : null;
      integrateSurfaceStep(dt);
      resolveSpringContact(oldX, oldY, i / count, (i + 1) / count);
      resolveHazards(oldX, oldY);
      if (state.stats.deaths !== deaths) break;
      resolveMotionInteractions(oldX, oldY, oldSurface);
      if (state.stats.deaths !== deaths) break;
    }
    p.lastX = lastX;
    p.lastY = lastY;
  }
  __name(moveAndResolveSurfaces, "moveAndResolveSurfaces");
  function moveOrientedSurface(dt) {
    let remaining = p.contactSpeed * dt, s = p.surface;
    for (let joins = 0; joins <= state.level.surfaces.length; joins++) {
      if (!active(s)) {
        leaveSurface(s);
        return;
      }
      const b = surfaceBasis(s), pointX = p.x - b.nx * 20, pointY = p.y - b.ny * 20;
      const along = (pointX - b.x1) * b.tx + (pointY - b.y1) * b.ty;
      const next = along + remaining;
      if (next >= 0 && next <= b.length) {
        p.x = b.x1 + b.tx * next + b.nx * 20;
        p.y = b.y1 + b.ty * next + b.ny * 20;
        return;
      }
      const forward = remaining > 0, endX = forward ? b.x2 : b.x1, endY = forward ? b.y2 : b.y1;
      const beyond = forward ? next - b.length : next;
      let join = null;
      for (const candidate of state.level.surfaces) {
        if (candidate === s || !active(candidate)) continue;
        const c = surfaceBasis(candidate);
        if (!c) continue;
        if (Math.hypot((forward ? c.x1 : c.x2) - endX, (forward ? c.y1 : c.y2) - endY) < 2) {
          join = { s: candidate, b: c };
          break;
        }
      }
      if (!join) {
        const time = Math.min(dt, Math.abs(beyond) / Math.max(1e-3, Math.abs(p.contactSpeed)));
        p.x = endX + b.nx * 20;
        p.y = endY + b.ny * 20;
        leaveSurface(s);
        p.x += p.vx * time;
        p.y += p.vy * time + 0.29 * (p.underwater ? 2 / 7 : 1) * time * time;
        p.vy += 0.58 * (p.underwater ? 2 / 7 : 1) * time;
        return;
      }
      const speed = p.contactSpeed;
      const turn = Math.atan2(
        b.tx * join.b.ty - b.ty * join.b.tx,
        b.tx * join.b.tx + b.ty * join.b.ty
      );
      const curvature = turn / ((b.length + join.b.length) * 0.5);
      if (Math.abs(turn) > 1e-5 && surfaceNormalReaction(speed, curvature, join.b.ny, groundSlopeForce(false, 0, 0)) < 0) {
        const time = Math.min(dt, Math.abs(beyond) / Math.max(1e-3, Math.abs(speed)));
        p.x = endX + b.nx * 20;
        p.y = endY + b.ny * 20;
        leaveSurface(s);
        p.x += p.vx * time;
        p.y += p.vy * time + 0.29 * (p.underwater ? 2 / 7 : 1) * time * time;
        p.vy += 0.58 * (p.underwater ? 2 / 7 : 1) * time;
        return;
      }
      if (join.s.contactMode !== "oriented") {
        p.x = endX;
        p.y = endY - 20;
        land(join.s, endY);
        p.vx = speed / Math.hypot(1, pose(join.s).slope);
        p.x += beyond * join.b.tx;
        p.y = yOn(join.s, p.x) - 20;
        return;
      }
      p.x = endX + join.b.nx * 20;
      p.y = endY + join.b.ny * 20;
      land(join.s, endY, { x: endX, y: endY, speed });
      s = join.s;
      remaining = beyond;
      if (join.b.ny >= -Math.SQRT1_2 && Math.abs(speed) < 14 * (2.5 / 6) * (p.underwater ? 0.5 : 1)) {
        leaveSurface(s);
        return;
      }
    }
    leaveSurface(s);
  }
  __name(moveOrientedSurface, "moveOrientedSurface");
  function sweptOrientedContact(oldX, oldY) {
    let hit = null;
    for (const s of state.level.surfaces) {
      if (s.contactMode !== "oriented" || !active(s)) continue;
      const b = surfaceBasis(s), old = surfaceBasis(s, state.runFrames - 1);
      if (!b || !old) continue;
      const before = (oldX - old.x1) * old.nx + (oldY - old.y1) * old.ny - 20;
      const after = (p.x - b.x1) * b.nx + (p.y - b.y1) * b.ny - 20;
      if (before < -0.01 || after > 0 || after >= before) continue;
      const t = Math.max(0, before / (before - after)), x = oldX + (p.x - oldX) * t, y = oldY + (p.y - oldY) * t;
      const along = (x - (old.x1 + (b.x1 - old.x1) * t)) * b.tx + (y - (old.y1 + (b.y1 - old.y1) * t)) * b.ty;
      if (along < 0 || along > b.length || hit && hit.t <= t) continue;
      const carry = surfaceVelocity(s), speed = (p.vx - carry.x) * b.tx + (p.vy - carry.y) * b.ty;
      if (b.ny >= -Math.SQRT1_2 && Math.abs(speed) < 14 * (2.5 / 6) * (p.underwater ? 0.5 : 1))
        continue;
      hit = { s, t, x: b.x1 + along * b.tx, y: b.y1 + along * b.ty, speed };
    }
    return hit;
  }
  __name(sweptOrientedContact, "sweptOrientedContact");
  function integrateSurfaceStep(dt) {
    if (p.ground && p.surface?.contactMode === "oriented") {
      p.lastX = p.x;
      p.lastY = p.y;
      moveOrientedSurface(dt);
      p.roll = p.rolling || state.charge > 0 || !p.ground;
      return;
    }
    const oldX = p.x, oldY = p.y, oldFoot = feet(), oldSurface = p.surface, wasGround = p.ground;
    p.lastX = oldX;
    p.lastY = oldY;
    const nextX = p.x + p.vx * dt;
    p.x = Math.max(24, Math.min(state.END + 250, nextX));
    if (p.x !== nextX) p.vx = 0;
    if (wasGround && oldSurface && active(oldSurface)) {
      const q = pose(oldSurface);
      if (p.x >= q.x1 - FOOT_RADIUS && p.x <= q.x2 + FOOT_RADIUS) {
        p.y = yOn(oldSurface, Math.max(q.x1, Math.min(q.x2, p.x))) - 20;
        p.vy = 0;
      } else {
        let join = null;
        for (const s of state.level.surfaces) {
          if (s.contactMode === "oriented" || !surfaceOverlaps(s, p.x, p.x) || !active(s)) continue;
          const z = pose(s), y = yOn(s, p.x);
          const seam = p.vx >= 0 ? q.x2 : q.x1, edgeY = p.vx >= 0 ? q.y2 : q.y1, connected = seam >= z.x1 - 2 && seam <= z.x2 + 2 && Math.abs(yOn(s, seam) - edgeY) < 2;
          if (p.x >= z.x1 && p.x <= z.x2 && (Math.abs(y - oldFoot) < 11 || connected)) {
            join = { s, y };
            break;
          }
        }
        if (join) land(join.s, join.y);
        else {
          const forward = p.vx >= 0, edgeX = forward ? q.x2 : q.x1, edgeY = forward ? q.y2 : q.y1;
          const directed = state.level.surfaces.find(
            (s) => s.contactMode === "oriented" && active(s) && Math.hypot((forward ? s.x1 : s.x2) - edgeX, (forward ? s.y1 : s.y2) - edgeY) < 2
          );
          if (directed) {
            const speed = p.vx * Math.hypot(1, q.slope), b = surfaceBasis(directed), remainingTime = Math.min(
              dt,
              Math.abs((p.x - edgeX) * Math.hypot(1, q.slope) / speed)
            );
            land(directed, edgeY, { x: edgeX, y: edgeY, speed });
            if (b.ny >= -Math.SQRT1_2 && Math.abs(speed) < 14 * (2.5 / 6) * (p.underwater ? 0.5 : 1))
              leaveSurface(directed);
            else {
              moveOrientedSurface(remainingTime);
              return;
            }
          } else leaveSurface(oldSurface);
        }
      }
    } else {
      if (wasGround && oldSurface) leaveSurface(oldSurface);
      else {
        p.ground = false;
        p.surface = null;
      }
    }
    if (!p.ground) {
      p.vy = p.airBoostActive ? 0 : p.vy > 20 ? 20 + (p.vy - 20) * Math.pow(0.999, dt) : Math.min(20, p.vy + 0.58 * (p.underwater ? 2 / 7 : 1) * dt);
      p.y += p.vy * dt;
      let hit = null;
      const directedHit = sweptOrientedContact(oldX, oldY);
      for (const s of state.level.surfaces) {
        if (s.contactMode === "oriented") continue;
        if (!surfaceOverlaps(s, Math.min(oldX, p.x) - FOOT_RADIUS, Math.max(oldX, p.x) + FOOT_RADIUS))
          continue;
        if (p.wrongRouteDrop && !s.fallen) continue;
        if (!active(s) || s.entrySpeed && !s.solidAtAnySpeed && (Math.abs(p.vx) < s.entrySpeed || s.entryDirection && Math.sign(p.vx) !== s.entryDirection))
          continue;
        const q = pose(s), oldQ = pose(s, state.runFrames - 1);
        const oldFloor = oldQ.y1 + (oldX - oldQ.x1) * oldQ.slope, newFloor = yOn(s, p.x), d0 = oldFoot - oldFloor, d1 = feet() - newFloor;
        if (d0 > 5 || d1 < 0 || d1 - d0 <= 0) continue;
        const t = Math.max(0, -d0 / (d1 - d0)), crossX = oldX + (p.x - oldX) * t;
        const left = oldQ.x1 + (q.x1 - oldQ.x1) * t, right = oldQ.x2 + (q.x2 - oldQ.x2) * t;
        if (t <= 1 && crossX >= left - FOOT_RADIUS && crossX <= right + FOOT_RADIUS && (!hit || t < hit.t))
          hit = { s, q, t };
      }
      if (directedHit && (!hit || directedHit.t < hit.t)) {
        land(directedHit.s, directedHit.y, directedHit);
      } else if (hit) {
        const x = Math.max(hit.q.x1, Math.min(hit.q.x2, p.x));
        land(hit.s, yOn(hit.s, x));
        if (p.ground && (p.x < hit.q.x1 - FOOT_RADIUS || p.x > hit.q.x2 + FOOT_RADIUS)) {
          leaveSurface(hit.s);
          state.coyote = tuning.coyote;
        }
        if (p.ground && p.rollBuffer > 0 && !p.rollSpent) {
          p.rolling = true;
          p.rollAge = 0;
          p.lowRollFrames = 0;
          p.rollBuffer = 0;
          state.stats.rolls++;
        }
      }
    }
    p.roll = p.rolling || state.charge > 0 || !p.ground;
  }
  __name(integrateSurfaceStep, "integrateSurfaceStep");
  function initializeRuntimeModule24() {
    staticSurfacePoses = /* @__PURE__ */ new WeakMap();
  }
  __name(initializeRuntimeModule24, "initializeRuntimeModule");
  function getRuntimeBindings24() {
    return {
      staticSurfacePoses: {
        get: /* @__PURE__ */ __name(() => staticSurfacePoses, "get"),
        set: /* @__PURE__ */ __name((value) => {
          staticSurfacePoses = value;
        }, "set")
      },
      pose: {
        get: /* @__PURE__ */ __name(() => pose, "get"),
        set: /* @__PURE__ */ __name((value) => {
          pose = value;
        }, "set")
      },
      surfaceVelocity: {
        get: /* @__PURE__ */ __name(() => surfaceVelocity, "get"),
        set: /* @__PURE__ */ __name((value) => {
          surfaceVelocity = value;
        }, "set")
      },
      yOn: {
        get: /* @__PURE__ */ __name(() => yOn, "get"),
        set: /* @__PURE__ */ __name((value) => {
          yOn = value;
        }, "set")
      },
      active: {
        get: /* @__PURE__ */ __name(() => active, "get"),
        set: /* @__PURE__ */ __name((value) => {
          active = value;
        }, "set")
      },
      surfaceOverlaps: {
        get: /* @__PURE__ */ __name(() => surfaceOverlaps, "get"),
        set: /* @__PURE__ */ __name((value) => {
          surfaceOverlaps = value;
        }, "set")
      },
      topAt: {
        get: /* @__PURE__ */ __name(() => topAt, "get"),
        set: /* @__PURE__ */ __name((value) => {
          topAt = value;
        }, "set")
      },
      bodyHeight: {
        get: /* @__PURE__ */ __name(() => bodyHeight, "get"),
        set: /* @__PURE__ */ __name((value) => {
          bodyHeight = value;
        }, "set")
      },
      feet: {
        get: /* @__PURE__ */ __name(() => feet, "get"),
        set: /* @__PURE__ */ __name((value) => {
          feet = value;
        }, "set")
      },
      resetPlatforms: {
        get: /* @__PURE__ */ __name(() => resetPlatforms, "get"),
        set: /* @__PURE__ */ __name((value) => {
          resetPlatforms = value;
        }, "set")
      },
      land: {
        get: /* @__PURE__ */ __name(() => land, "get"),
        set: /* @__PURE__ */ __name((value) => {
          land = value;
        }, "set")
      },
      canStand: {
        get: /* @__PURE__ */ __name(() => canStand, "get"),
        set: /* @__PURE__ */ __name((value) => {
          canStand = value;
        }, "set")
      },
      resolveHazards: {
        get: /* @__PURE__ */ __name(() => resolveHazards, "get"),
        set: /* @__PURE__ */ __name((value) => {
          resolveHazards = value;
        }, "set")
      },
      applySurfaceMotion: {
        get: /* @__PURE__ */ __name(() => applySurfaceMotion, "get"),
        set: /* @__PURE__ */ __name((value) => {
          applySurfaceMotion = value;
        }, "set")
      },
      leaveSurface: {
        get: /* @__PURE__ */ __name(() => leaveSurface, "get"),
        set: /* @__PURE__ */ __name((value) => {
          leaveSurface = value;
        }, "set")
      },
      moveAndResolveSurfaces: {
        get: /* @__PURE__ */ __name(() => moveAndResolveSurfaces, "get"),
        set: /* @__PURE__ */ __name((value) => {
          moveAndResolveSurfaces = value;
        }, "set")
      },
      integrateSurfaceStep: {
        get: /* @__PURE__ */ __name(() => integrateSurfaceStep, "get"),
        set: /* @__PURE__ */ __name((value) => {
          integrateSurfaceStep = value;
        }, "set")
      }
    };
  }
  __name(getRuntimeBindings24, "getRuntimeBindings");

  // src/act1-motion.js
  function usesAct1Motion() {
    return state.selectedAct === 1 && !!p.act1Motion;
  }
  __name(usesAct1Motion, "usesAct1Motion");
  function act1Surface(s, x, time = state.runFrames) {
    const tick = Math.floor(time), f = time - tick, a = pose(s, tick), b = pose(s, tick + 1);
    const x1 = a.x1 + (b.x1 - a.x1) * f, y1 = a.y1 + (b.y1 - a.y1) * f;
    const slope = a.slope, norm = Math.hypot(1, slope);
    return {
      id: s.id,
      x,
      y: y1 + (x - x1) * slope,
      x1,
      x2: x1 + a.x2 - a.x1,
      tx: 1 / norm,
      ty: slope / norm,
      nx: slope / norm,
      ny: -1 / norm,
      angle: Math.atan(slope),
      curvature: 0,
      vx: b.x1 - a.x1,
      vy: b.y1 - a.y1
    };
  }
  __name(act1Surface, "act1Surface");
  function act1Body(m = p.act1Motion, posture = m.posture, time = state.runFrames) {
    const height = posture === "rolling" ? groundTuning.rollDiameter : groundTuning.standHeight;
    const surface = m.mode === "grounded" && m.surface ? act1Surface(m.surface, m.x, time) : null;
    return {
      x: surface ? m.x + surface.nx * height / 2 : m.x,
      y: surface ? surface.y + surface.ny * height / 2 : m.y,
      hw: posture === "rolling" ? height / 2 : groundTuning.standWidth / 2,
      hh: height / 2,
      circle: posture === "rolling",
      angle: surface?.angle || 0
    };
  }
  __name(act1Body, "act1Body");
  function act1Solids() {
    return state.level.hazards.filter((h) => !h.broken && h.type !== "spikes");
  }
  __name(act1Solids, "act1Solids");
  function act1Box(h) {
    return { x1: h.x, x2: h.x + h.w, y1: h.y, y2: h.y + h.h };
  }
  __name(act1Box, "act1Box");
  function act1Clear(m, posture, time = state.runFrames) {
    const body = act1Body(m, posture, time);
    return act1Solids().every(
      (h) => bodyBoxDistance(body, act1Box(h)).distance >= -motionTuning.skin
    );
  }
  __name(act1Clear, "act1Clear");
  function resetAct1Motion() {
    if (state.selectedAct !== 1) {
      p.act1Motion = null;
      return;
    }
    const m = {
      ...createGroundPlayer(),
      scenario: "act1",
      x: p.x,
      y: p.y + 20,
      mode: p.ground && p.surface ? "grounded" : "airborne",
      surface: p.surface,
      boost: createExperimentalBoost(state.boost),
      dash: null,
      air: null,
      pendingJump: false,
      rollBuffer: 0,
      pendingBoost: false,
      pressAirborne: false,
      coyote: 0,
      jumpBuffer: 0,
      updates: 0,
      latestTransition: "checkpoint reset",
      posture: p.rolling ? "rolling" : "standing",
      facing: p.face
    };
    if (m.mode === "grounded") {
      const s = act1Surface(m.surface, m.x);
      m.speed = (p.vx - s.vx) / s.tx;
    } else {
      m.y = p.y + 20 - (m.posture === "rolling" ? 19 : 24);
      m.speed = null;
      m.air = { vx: p.vx, vy: p.vy, cutEligible: false, jumpLift: 0 };
    }
    p.act1Motion = m;
    projectAct1Motion(m);
  }
  __name(resetAct1Motion, "resetAct1Motion");
  function clearAct1Input() {
    const m = p.act1Motion;
    if (!m) return;
    m.pendingJump = m.pendingBoost = false;
    m.jumpBuffer = 0;
    m.rollBuffer = 0;
    m.dash = null;
    Object.assign(m.boost, { held: false, remaining: 0, active: false });
    if (m.air) {
      m.air.cutEligible = false;
      m.air.jumpLift = 0;
    }
  }
  __name(clearAct1Input, "clearAct1Input");
  function inputAct1Motion(k, pressed) {
    const m = p.act1Motion;
    adoptAct1Interaction(m);
    const boostKeys = ["ShiftLeft", "ShiftRight", "KeyX", "MouseBoost"];
    if (pressed && !keys.has(k)) {
      if (k === "ArrowDown" || k === "KeyS") m.rollBuffer = 6;
      if (JUMP_KEYS.includes(k) && !JUMP_KEYS.some((code) => keys.has(code))) {
        if (m.mode === "airborne" && p.shield === "bubble" && !p.hurt && !p.bubbleSlam) {
          beginBubbleSlam();
          adoptAct1Interaction(m);
        } else {
          m.pendingJump = true;
          m.jumpBuffer = tuning.buffer;
        }
      }
      if (boostKeys.includes(k) && !boostKeys.some((code) => keys.has(code))) {
        m.pendingBoost = true;
        m.pressAirborne = m.mode === "airborne";
      }
    }
    if (pressed) keys.add(k);
    else keys.delete(k);
  }
  __name(inputAct1Motion, "inputAct1Motion");
  function projectAct1Motion(m, time = state.runFrames) {
    const grounded = m.mode === "grounded", body = act1Body(m, m.posture, time);
    const s = grounded ? act1Surface(m.surface, m.x, time) : null;
    Object.assign(p, {
      x: grounded ? m.x : body.x,
      y: grounded ? s.y - 20 : body.y + body.hh - 20,
      vx: grounded ? m.speed * s.tx + s.vx : m.air.vx,
      vy: grounded ? 0 : m.air.vy,
      ground: grounded,
      surface: grounded ? m.surface : null,
      roll: m.posture === "rolling",
      rolling: m.posture === "rolling" && grounded,
      face: m.facing,
      contactSpeed: null,
      loop: null,
      boosting: m.boost.active,
      airBoostUsed: m.boost.airUsed,
      airBoostFrames: m.boost.remaining,
      airBoostActive: !grounded && m.boost.active,
      boostLocked: m.boost.locked,
      jumpHeld: JUMP_KEYS.some((code) => keys.has(code))
    });
    state.boost = m.boost.meter;
    state.charge = m.dash ? m.dash.charge * 20 / 30 : 0;
    m.worldVelocity = grounded ? { vx: m.speed * s.tx + s.vx, vy: m.speed * s.ty + s.vy } : { vx: m.air.vx, vy: m.air.vy };
    m.projection = {
      x: p.x,
      y: p.y,
      vx: p.vx,
      vy: p.vy,
      ground: p.ground,
      surface: p.surface,
      rolling: p.rolling,
      roll: p.roll
    };
  }
  __name(projectAct1Motion, "projectAct1Motion");
  function adoptAct1Interaction(m) {
    const q = m.projection;
    if (!q) return;
    const changed = ["x", "y", "vx", "vy", "ground", "surface", "rolling", "roll"].some(
      (k) => p[k] !== q[k]
    );
    if (state.boost > m.boost.meter && !p.boostLocked) m.boost.locked = false;
    m.boost.meter = state.boost;
    if (!changed) return;
    m.posture = p.rolling || p.roll ? "rolling" : "standing";
    m.facing = p.face;
    m.boost.airUsed = p.airBoostUsed;
    if (p.ground && p.surface) {
      m.mode = "grounded";
      m.surface = p.surface;
      m.x = p.x;
      m.y = p.y + 20;
      const s = act1Surface(m.surface, m.x);
      m.speed = (p.vx - s.vx) / s.tx;
      m.air = null;
    } else {
      const height = m.posture === "rolling" ? 38 : 48;
      Object.assign(m, {
        mode: "airborne",
        surface: null,
        x: p.x,
        y: p.y + 20 - height / 2,
        speed: null,
        air: { vx: p.vx, vy: p.vy, cutEligible: false, jumpLift: 0 }
      });
      m.boost.remaining = 0;
      m.boost.active = false;
      m.dash = null;
    }
    m.latestTransition = p.hurt ? "damage handoff" : "interaction handoff";
  }
  __name(adoptAct1Interaction, "adoptAct1Interaction");
  function releaseAct1(m, reason, jump2, time) {
    const s = act1Surface(m.surface, m.x, time), oldPosture = m.posture;
    if (jump2 && act1Clear(m, "rolling", time)) m.posture = "rolling";
    const body = act1Body(m, m.posture, time), impulse = jump2 ? motionTuning.jumpImpulse : 0;
    const vx = m.speed * s.tx + s.vx + impulse * s.nx;
    const vy = m.speed * s.ty + s.vy + impulse * s.ny;
    m.lastTakeoff = { reason, vx, vy, speed: m.speed, carrier: { vx: s.vx, vy: s.vy } };
    Object.assign(m, {
      x: body.x,
      y: body.y,
      speed: null,
      surface: null,
      mode: "airborne",
      dash: null,
      air: {
        vx,
        vy,
        cutEligible: jump2,
        jumpLift: Math.max(0, -impulse * s.ny),
        restorePosture: oldPosture
      },
      latestTransition: reason,
      coyote: jump2 ? 0 : tuning.coyote
    });
    if (jump2) {
      p.jumpAttack = true;
      p.poseJumpFrame = state.runFrames;
      state.stats.jumps++;
      gameSound("jump");
      m.jumpBuffer = 0;
    }
  }
  __name(releaseAct1, "releaseAct1");
  function attachAct1(m, surface, x, incoming, time, seam = false) {
    const s = act1Surface(surface, x, time), previous = m.surface;
    const speed = seam ? m.speed : (incoming.vx - s.vx) * s.tx + (incoming.vy - s.vy) * s.ty;
    const candidate = { ...m, mode: "grounded", surface, x, y: s.y, speed, air: null };
    const restore = m.air?.restorePosture || "standing";
    if (!seam) candidate.posture = act1Clear(candidate, restore, time) ? restore : "rolling";
    if (!act1Clear(candidate, candidate.posture, time)) return false;
    Object.assign(m, candidate);
    m.restTicks = 0;
    m.latestTransition = seam ? "surface join" : "landing";
    if (!seam) resetExperimentalAirBoost(m);
    beforeStageLanding(surface);
    projectAct1Motion(m, time);
    p.landFrame = state.runFrames;
    p.landKind = surface.kind;
    if (!seam) {
      p.poseLandingFrame = state.runFrames;
      gameSound("land", { speed: Math.abs(speed), volume: 0.7 });
    }
    p.jumpAttack = false;
    p.scriptedLaunch = false;
    afterStageLanding(surface);
    recordSurfaceLanding(surface, previous !== surface || !seam);
    if (reboundBubbleShield()) adoptAct1Interaction(m);
    else if (m.mode === "grounded" && m.jumpBuffer > 0 && !m.dash)
      releaseAct1(m, "buffered jump", true, time);
    return true;
  }
  __name(attachAct1, "attachAct1");
  function act1SolidImpact(m, body, vx, vy, ax, ay, duration) {
    let hit = null;
    for (const h of act1Solids()) {
      if (h.type === "breakable" && (m.boost.active || !h.boostOnly && Math.abs(vx) >= h.threshold))
        continue;
      const face = {
        x: h.x + h.w / 2,
        y: h.y,
        half: h.w / 2,
        depth: h.h,
        nx: 0,
        ny: -1,
        tx: 1,
        ty: 0
      };
      const result = experimentalDeviceImpact(
        body,
        vx,
        vy,
        ax,
        ay,
        duration,
        face,
        motionTuning.skin
      );
      if (result && (!hit || result.time < hit.time)) hit = { ...result, h };
    }
    return hit;
  }
  __name(act1SolidImpact, "act1SolidImpact");
  function moveAct1Air(m, direction, braking, duration, time) {
    let { ax, ay, bursting } = motionAirForces(m, direction, braking, duration);
    if (bursting) m.boost.active = true;
    const body = act1Body(m), a = m.air;
    a.blocked = (a.blocked || []).filter(
      (n2) => bodyBoxDistance(body, act1Box(n2.h)).distance <= motionTuning.skin * 3
    );
    for (const n2 of a.blocked) {
      const into2 = ax * n2.nx + ay * n2.ny;
      if (into2 < 0) {
        ax -= into2 * n2.nx;
        ay -= into2 * n2.ny;
      }
    }
    let hit = act1SolidImpact(m, body, a.vx, a.vy, ax, ay, duration);
    for (const s of state.level.surfaces) {
      if (!active(s)) continue;
      if (s.entrySpeed && !s.solidAtAnySpeed && (Math.abs(a.vx) < s.entrySpeed || s.entryDirection && Math.sign(a.vx) !== s.entryDirection))
        continue;
      const q = act1Surface(s, body.x, time);
      const extent = body.circle ? body.hh : Math.abs(q.nx) * body.hw + Math.abs(q.ny) * body.hh;
      const distance = (body.x - q.x1) * q.nx + (body.y - (q.y + (q.x1 - q.x) * q.ty / q.tx)) * q.ny - extent;
      const vn = (a.vx - q.vx) * q.nx + (a.vy - q.vy) * q.ny;
      const an = ax * q.nx + ay * q.ny;
      if (distance < -motionTuning.skin * 2) continue;
      for (const t of pathPolynomialRoots([distance, vn, an / 2], 0, duration)) {
        if (vn + an * t >= -1e-8 || hit && t >= hit.time) continue;
        const cx = m.x + a.vx * t + ax * t * t / 2 - q.vx * t;
        const contactX = cx - q.nx * extent;
        if (contactX < q.x1 - 1e-6 || contactX > q.x2 + 1e-6) continue;
        hit = { time: t, s, x: contactX + q.vx * t, q: { nx: q.nx, ny: q.ny } };
        break;
      }
    }
    const dt = hit ? hit.time : duration;
    m.x += a.vx * dt + ax * dt * dt / 2;
    m.y += a.vy * dt + ay * dt * dt / 2;
    a.vx += ax * dt;
    a.vy += ay * dt;
    a.jumpLift = Math.max(0, (a.jumpLift || 0) - groundTuning.gravity * dt);
    if (!hit) return duration;
    if (hit.s && attachAct1(m, hit.s, hit.x, { vx: a.vx, vy: a.vy }, time + dt)) return dt;
    const n = hit.q, into = a.vx * n.nx + a.vy * n.ny;
    if (into < 0) {
      a.vx -= into * n.nx;
      a.vy -= into * n.ny;
    }
    m.x += n.nx * motionTuning.skin * 2;
    m.y += n.ny * motionTuning.skin * 2;
    if (n.ny > 0) {
      a.jumpLift = 0;
      a.cutEligible = false;
    }
    if (hit.h) a.blocked.push({ h: hit.h, nx: n.nx, ny: n.ny });
    if (hit.h && n.ny < -0.999) {
      const h = hit.h;
      const top = {
        id: h.id || "solid-top",
        x1: h.x,
        x2: h.x + h.w,
        y1: h.y,
        y2: h.y,
        kind: "solid"
      };
      attachAct1(m, top, m.x, { vx: a.vx, vy: a.vy }, time + dt);
    }
    return dt;
  }
  __name(moveAct1Air, "moveAct1Air");
  function moveAct1Ground(m, controls, duration, time) {
    const surface = m.surface;
    if (!active(surface)) {
      releaseAct1(m, "crumbling deck", false, time);
      return 0;
    }
    const q = act1Surface(surface, m.x, time), before = act1Body(m, m.posture, time);
    const sampler = /* @__PURE__ */ __name((_scenario, x) => act1Surface(surface, x, time), "sampler");
    let local = { ...controls };
    const boosted = experimentalGroundBoost(m, surface) && !p.hurt && !p.bubbleSlam;
    m.boost.active = boosted;
    if (boosted) local.boost = { ...experimentalBoostTuning, facing: m.facing };
    let dt = duration;
    if (boosted && !(surface.grindable && surface.infiniteBoost))
      dt = Math.min(dt, m.boost.meter / experimentalBoostTuning.groundCost);
    const advance = /* @__PURE__ */ __name((target, t) => {
      if (t <= 0) return;
      advanceGroundSubstep(target, local, t, sampler);
      target.x += q.vx * t;
      target.y = act1Surface(surface, target.x, time + t).y;
    }, "advance");
    let candidate = { ...m };
    advance(candidate, dt);
    let edge = null, forward = candidate.x > q.x2 + q.vx * dt;
    if (forward || candidate.x < q.x1 + q.vx * dt) {
      const end = forward ? q.x2 : q.x1;
      let lo = 0, hi = dt;
      for (let i = 0; i < 30; i++) {
        const mid = (lo + hi) / 2, c = { ...m };
        advance(c, mid);
        if ((forward ? 1 : -1) * (c.x - end - q.vx * mid) > 0) hi = mid;
        else lo = mid;
      }
      dt = (lo + hi) / 2;
      candidate = { ...m };
      advance(candidate, dt);
      edge = forward ? "right" : "left";
    }
    let block = null;
    for (const h of act1Solids()) {
      if (h.type === "breakable" && (boosted || !h.boostOnly && Math.abs(m.speed * q.tx) >= h.threshold))
        continue;
      const result = sweepGroundBox(
        before,
        act1Body(candidate, candidate.posture, time + dt),
        act1Box(h),
        dt
      );
      if (result && (!block || result.time < block.time)) block = result;
    }
    if (block) {
      dt = block.time;
      candidate = { ...m };
      advance(candidate, dt);
      edge = null;
    }
    Object.assign(m, candidate);
    if (boosted) {
      m.boost.active = true;
      if (!(surface.grindable && surface.infiniteBoost)) {
        m.boost.meter = Math.max(0, m.boost.meter - experimentalBoostTuning.groundCost * dt);
        if (m.boost.meter < 1e-9) {
          m.boost.meter = 0;
          m.boost.locked = true;
        }
      }
    }
    if (block) {
      m.speed = 0;
      const rest = duration - dt;
      m.x += q.vx * rest;
      m.y = act1Surface(surface, m.x, time + duration).y;
      if (boosted)
        m.boost.meter = Math.max(0, m.boost.meter - experimentalBoostTuning.groundCost * rest);
      if (boosted && m.boost.meter === 0) m.boost.locked = true;
      return duration;
    }
    if (edge) {
      const at = act1Surface(surface, m.x, time + dt);
      let join = null;
      for (const s of state.level.surfaces) {
        if (s === surface || !active(s)) continue;
        const z2 = act1Surface(s, m.x, time + dt);
        if (m.x >= z2.x1 - 1e-4 && m.x <= z2.x2 + 1e-4 && Math.abs(z2.y - at.y) < 1e-4) {
          join = s;
          break;
        }
      }
      const z = join && act1Surface(join, m.x, time + dt);
      const convex = z && Math.sign(m.speed) * (z.angle - q.angle) > 1e-7;
      if (!(join && !(m.posture === "rolling" && convex) && attachAct1(m, join, m.x, null, time + dt, true)))
        releaseAct1(m, join ? "rolled crest" : "ledge", false, time + dt);
    }
    return dt;
  }
  __name(moveAct1Ground, "moveAct1Ground");
  function updateAct1Movement() {
    const m = p.act1Motion;
    if (updateStageMotion()) {
      adoptAct1Interaction(m);
      return true;
    }
    adoptAct1Interaction(m);
    const direction = Number(keys.has("ArrowRight") || keys.has("KeyD")) - Number(keys.has("ArrowLeft") || keys.has("KeyA"));
    const input = {
      direction: p.hurt ? 0 : direction,
      down: keys.has("ArrowDown") || keys.has("KeyS") || m.rollBuffer > 0,
      jumpHeld: JUMP_KEYS.some((code) => keys.has(code)),
      jumpPressed: m.pendingJump,
      boostHeld: !p.hurt && !p.bubbleSlam && ["ShiftLeft", "ShiftRight", "KeyX", "MouseBoost"].some((code) => keys.has(code)),
      boostPressed: m.pendingBoost,
      boostPressAirborne: m.pressAirborne
    };
    const startedGrounded = m.mode === "grounded", startSpeed = startedGrounded ? Math.abs(m.speed) : Math.abs(m.air.vx);
    const surface = startedGrounded ? act1Surface(m.surface, m.x, state.runFrames - 1) : null;
    const previousPosture = m.posture;
    if (startedGrounded && m.rollBuffer > 0) m.downHeld = false;
    const dash = updateExperimentalDash(m, input, surface, () => act1Clear(m, "rolling"));
    if (dash) m.jumpBuffer = 0;
    let controls = startedGrounded ? beginGroundTick(m, input, act1Clear(m, "rolling")) : null;
    if (m.dash) controls = { direction: 0, rolling: false, braking: true };
    if (previousPosture !== "rolling" && m.posture === "rolling") state.stats.rolls++;
    if (startedGrounded && m.posture === "rolling") m.rollBuffer = 0;
    if (startedGrounded) m.coyote = tuning.coyote;
    if (startedGrounded && m.jumpBuffer > 0 && !dash)
      releaseAct1(m, "jump", true, state.runFrames - 1);
    else if (!startedGrounded && m.jumpBuffer > 0 && m.coyote > 0 && m.pendingJump) {
      m.air.vy -= motionTuning.jumpImpulse;
      m.air.jumpLift = motionTuning.jumpImpulse;
      m.air.cutEligible = true;
      m.posture = "rolling";
      m.coyote = 0;
      m.jumpBuffer = 0;
      p.jumpAttack = true;
      state.stats.jumps++;
      gameSound("jump");
    }
    beginExperimentalBoost(m, input, startedGrounded);
    if (m.air?.cutEligible && !input.jumpHeld) {
      if (m.air.vy < 0 && m.air.jumpLift > 0)
        m.air.vy += m.air.jumpLift * (1 - motionTuning.cutRatio);
      m.air.cutEligible = false;
      m.air.jumpLift = 0;
    }
    m.pendingJump = m.pendingBoost = false;
    let elapsed = 0, iterations = 0, burst = false, airBraking = null;
    const deaths = state.stats.deaths;
    while (elapsed < 1 - 1e-9) {
      if (++iterations > 128) throw Error("Act 1 movement failed to converge");
      const time = state.runFrames - 1 + elapsed;
      const speed = m.mode === "grounded" ? Math.abs(m.speed) : Math.hypot(m.air.vx, m.air.vy);
      const dt = Math.min(1 - elapsed, 0.25, 8 / Math.max(1, speed));
      const oldX = p.x, oldY = p.y, oldSurface = p.surface;
      let consumed;
      if (m.mode === "grounded") {
        controls ??= {
          direction: input.direction,
          rolling: m.posture === "rolling",
          braking: input.direction * m.speed < 0
        };
        consumed = moveAct1Ground(m, controls, dt, time);
      } else {
        airBraking ??= input.direction * m.air.vx < 0;
        consumed = moveAct1Air(m, input.direction, airBraking, dt, time);
        burst ||= m.boost.active && m.boost.remaining > 0;
        if (m.mode === "grounded") controls = null;
      }
      elapsed += consumed;
      projectAct1Motion(m, time + consumed);
      for (const h of state.level.hazards) {
        if (h.type === "spikes" && spikeContact(h, oldX, oldY)) hurt(h.x + h.w / 2);
        if (h.type === "breakable" && !h.broken && m.boost.active && bodyBoxDistance(act1Body(m, m.posture, time + consumed), act1Box(h)).distance <= 0) {
          h.broken = true;
          state.score += 350;
          state.stats.barriers = (state.stats.barriers || 0) + 1;
          gameSound("hazard");
        }
      }
      if (deaths !== state.stats.deaths || state.mode !== "playing") return false;
      resolveMotionInteractions(oldX, oldY, oldSurface);
      if (deaths !== state.stats.deaths || p.act1Motion !== m) return false;
      adoptAct1Interaction(m);
      if (m.mode === "airborne") controls = null;
      if (p.y + 20 > stageDeathLimit()) {
        die();
        return false;
      }
    }
    if (burst && m.boost.remaining > 0) m.boost.remaining--;
    if (m.mode === "grounded") {
      finishGroundTick(
        m,
        controls || { rolling: m.posture === "rolling" },
        (_s, x) => act1Surface(m.surface, x),
        act1Clear(m, "standing"),
        () => Infinity
      );
      m.boundary = null;
    } else {
      m.ticks++;
      if (Math.abs(m.air.vx) > 0.02) m.facing = Math.sign(m.air.vx);
    }
    m.coyote = Math.max(0, m.coyote - 1);
    m.jumpBuffer = Math.max(0, m.jumpBuffer - 1);
    m.rollBuffer = Math.max(0, m.rollBuffer - 1);
    m.updates++;
    if (!Number.isFinite(m.x) || !Number.isFinite(m.y) || !Number.isFinite(m.speed ?? m.air?.vx))
      throw Error("Non-finite Act 1 motion");
    const clamped = Math.max(24, Math.min(state.END + 250, m.x));
    if (clamped !== m.x) {
      m.x = clamped;
      if (m.mode === "grounded") m.speed = 0;
      else m.air.vx = 0;
    }
    projectAct1Motion(m);
    updateBrakingPose(direction, startSpeed);
    state.stats.maxSpeed = Math.max(
      state.stats.maxSpeed,
      Math.abs(m.speed ?? m.air.vx)
    );
    state.anim += Math.abs(m.speed ?? m.air.vx) * 0.08;
    return true;
  }
  __name(updateAct1Movement, "updateAct1Movement");
  function initializeRuntimeModule25() {
  }
  __name(initializeRuntimeModule25, "initializeRuntimeModule");
  function getRuntimeBindings25() {
    return {};
  }
  __name(getRuntimeBindings25, "getRuntimeBindings");

  // src/hud.js
  var hud_exports = {};
  __export(hud_exports, {
    drawPixelBoostBar: () => drawPixelBoostBar,
    getRuntimeBindings: () => getRuntimeBindings26,
    initializeRuntimeModule: () => initializeRuntimeModule26,
    toggleGameFullscreen: () => toggleGameFullscreen,
    updatePixelHud: () => updatePixelHud
  });
  var updatePixelHud;
  var drawPixelBoostBar;
  var toggleGameFullscreen;
  function initializeRuntimeModule26() {
    (function() {
      "use strict";
      const W2 = 320, H2 = 84;
      const shape = [
        [20, 5],
        [263, 15],
        [280, 17],
        [295, 20],
        [309, 26],
        [294, 30],
        [287, 34],
        [296, 43],
        [306, 55],
        [311, 63],
        [292, 57],
        [283, 57],
        [294, 78],
        [277, 69],
        [260, 64],
        [251, 65],
        [242, 64],
        [231, 59],
        [226, 55],
        [224, 49],
        [220, 46],
        [219, 41],
        [3, 33]
      ];
      const mask = new Uint8Array(W2 * H2), depth = new Uint8Array(W2 * H2), cache = /* @__PURE__ */ new WeakMap();
      const glyphs = {
        0: ["111", "101", "101", "101", "111"],
        1: ["010", "110", "010", "010", "111"],
        2: ["111", "001", "111", "100", "111"],
        3: ["111", "001", "111", "001", "111"],
        4: ["101", "101", "111", "001", "001"],
        5: ["111", "100", "111", "001", "111"],
        6: ["111", "100", "111", "101", "111"],
        7: ["111", "001", "010", "010", "010"],
        8: ["111", "101", "111", "101", "111"],
        9: ["111", "101", "111", "001", "111"],
        ":": ["0", "1", "0", "1", "0"],
        X: ["101", "101", "010", "101", "101"],
        S: ["111", "100", "111", "001", "111"],
        P: ["110", "101", "110", "100", "100"],
        D: ["110", "101", "101", "101", "110"],
        B: ["110", "101", "110", "101", "110"],
        O: ["111", "101", "101", "101", "111"],
        T: ["111", "010", "010", "010", "010"],
        "/": ["001", "001", "010", "100", "100"],
        " ": ["0", "0", "0", "0", "0"]
      };
      function inside(x, y) {
        let on = false;
        for (let i = 0, j = shape.length - 1; i < shape.length; j = i++) {
          const a = shape[i], b = shape[j];
          if (a[1] > y !== b[1] > y && x < (b[0] - a[0]) * (y - a[1]) / (b[1] - a[1]) + a[0])
            on = !on;
        }
        return on;
      }
      __name(inside, "inside");
      for (let y = 0; y < H2; y++)
        for (let x = 0; x < W2; x++) mask[y * W2 + x] = inside(x + 0.5, y + 0.5) ? 1 : 0;
      function at(x, y) {
        return x >= 0 && x < W2 && y >= 0 && y < H2 && mask[y * W2 + x];
      }
      __name(at, "at");
      for (let y = 0; y < H2; y++)
        for (let x = 0; x < W2; x++)
          if (at(x, y)) {
            depth[y * W2 + x] = !at(x - 1, y) || !at(x + 1, y) || !at(x, y - 1) || !at(x, y + 1) ? 1 : !at(x - 2, y) || !at(x + 2, y) || !at(x, y - 2) || !at(x, y + 2) ? 2 : 3;
          }
      function line(pixels, a, b, color, thickness, limit) {
        let x = a[0], y = a[1];
        const dx = Math.abs(b[0] - x), sx = x < b[0] ? 1 : -1, dy = -Math.abs(b[1] - y), sy = y < b[1] ? 1 : -1;
        let e = dx + dy;
        for (; ; ) {
          for (let iy = y - thickness; iy <= y + thickness; iy++)
            for (let ix = x - thickness; ix <= x + thickness; ix++)
              if (ix >= 0 && ix < W2 && iy >= 0 && iy < H2 && ix <= limit && depth[iy * W2 + ix] > 2)
                pixels[iy * W2 + ix] = color;
          if (x === b[0] && y === b[1]) break;
          const e2 = e * 2;
          if (e2 >= dy) {
            e += dy;
            x += sx;
          }
          if (e2 <= dx) {
            e += dx;
            y += sy;
          }
        }
      }
      __name(line, "line");
      function raster(ctx2, pixels) {
        for (let y = 0; y < H2; y++)
          for (let x = 0; x < W2; ) {
            const color = pixels[y * W2 + x];
            if (!color) {
              x++;
              continue;
            }
            let end = x + 1;
            while (end < W2 && pixels[y * W2 + end] === color) end++;
            ctx2.fillStyle = color;
            ctx2.fillRect(x, y, end - x, 1);
            x = end;
          }
      }
      __name(raster, "raster");
      function drawPixelBoostBar2(canvas2, fraction, frame2 = 0) {
        if (!canvas2 || !canvas2.getContext) return;
        const value = Math.max(0, Math.min(1, Number.isFinite(fraction) ? fraction : 0));
        const filled = Math.round(value * W2), phase = Math.floor((Number.isFinite(frame2) ? frame2 : 0) / 6) % 12, key = filled + ":" + (filled ? phase : 0);
        if (cache.get(canvas2) === key) return;
        if (canvas2.width !== W2) canvas2.width = W2;
        if (canvas2.height !== H2) canvas2.height = H2;
        const ctx2 = canvas2.getContext("2d");
        ctx2.imageSmoothingEnabled = false;
        ctx2.clearRect(0, 0, W2, H2);
        const pixels = new Array(W2 * H2), limit = filled ? Math.max(4, filled - 1) : -1;
        for (let y = 0; y < H2; y++)
          for (let x = 0; x < W2; x++)
            if (mask[y * W2 + x]) {
              const d = depth[y * W2 + x];
              pixels[y * W2 + x] = d === 1 ? "#afcce8" : d === 2 ? "#364d87" : x <= limit ? y < 23 ? "#28226e" : y < 43 ? "#211c61" : "#19164d" : "#0c1530";
              if (d > 2 && (x + y * 3) % 79 < 11 && y > 12 && y < 39)
                pixels[y * W2 + x] = x <= limit ? "#121443" : "#16233f";
            }
        line(pixels, [8, 32], [265, 43], "#47568d", 0, W2);
        if (filled) {
          const wiggle = [0, 1, 2, 1, 0, -1, -2, -1, 0, 1, 0, -1][phase];
          const paths = [
            [
              [17, 23],
              [90, 17 + wiggle],
              [160, 17],
              [145, 30 - wiggle],
              [217, 23],
              [280, 22 + wiggle]
            ],
            [
              [265, 30],
              [278, 26 + wiggle],
              [287, 27],
              [302, 25]
            ],
            [
              [253, 44],
              [266, 52 + wiggle],
              [277, 50],
              [305, 60]
            ],
            [
              [264, 54],
              [269, 62],
              [278, 62 + wiggle],
              [289, 73]
            ]
          ];
          for (const path of paths) {
            for (let i = 1; i < path.length; i++)
              line(pixels, path[i - 1], path[i], "#076fab", 2, limit);
            for (let i = 1; i < path.length; i++)
              line(pixels, path[i - 1], path[i], "#20caff", 1, limit);
            for (let i = 1; i < path.length; i++)
              line(pixels, path[i - 1], path[i], "#8fffff", 0, limit);
          }
          if (phase % 3 === 0) {
            line(pixels, [102, 22], [109, 26 + wiggle], "#8fffff", 0, limit);
            line(pixels, [198, 19], [204, 15], "#20caff", 0, limit);
          }
        }
        raster(ctx2, pixels);
        cache.set(canvas2, key);
        canvas2.setAttribute("aria-valuenow", String(Math.round(value * 100)));
        canvas2.setAttribute("aria-valuetext", Math.round(value * 100) + " percent boost remaining");
      }
      __name(drawPixelBoostBar2, "drawPixelBoostBar");
      function text(ctx2, value, x, y, scale = 2, color = "#f4f6ff") {
        for (const character of String(value)) {
          const rows = glyphs[character] || glyphs[" "];
          for (let row = 0; row < rows.length; row++)
            for (let col = 0; col < rows[row].length; col++)
              if (rows[row][col] === "1") {
                ctx2.fillStyle = "#080c2c";
                ctx2.fillRect(x + col * scale + 1, y + row * scale + 1, scale, scale);
                ctx2.fillStyle = color;
                ctx2.fillRect(x + col * scale, y + row * scale, scale, scale);
              }
          x += (rows[0].length + 1) * scale;
        }
      }
      __name(text, "text");
      function bitmap(ctx2, rows, x, y, palette) {
        for (let iy = 0; iy < rows.length; iy++)
          for (let ix = 0; ix < rows[iy].length; ix++) {
            const color = palette[rows[iy][ix]];
            if (color) {
              ctx2.fillStyle = color;
              ctx2.fillRect(x + ix, y + iy, 1, 1);
            }
          }
      }
      __name(bitmap, "bitmap");
      const ring2 = [
        ".....333333.....",
        "...3344444433...",
        "..344222222443..",
        ".34221....12243.",
        ".3421......1243.",
        "3421........1243",
        "3421........1243",
        "3421........1243",
        "3421........1243",
        "3421........1243",
        "3421........1243",
        ".3421......1243.",
        ".34221....12243.",
        "..344222222443..",
        "...3344444433...",
        ".....333333....."
      ];
      const stats = /* @__PURE__ */ new Map(), state2 = {
        rings: 0,
        lives: 3,
        time: 0,
        score: 0,
        boost: 0,
        maxBoost: 90,
        speed: 0,
        mode: "ready",
        frame: 0
      };
      function element(id) {
        return document.getElementById(id);
      }
      __name(element, "element");
      function stat(id, value, paint) {
        const canvas2 = element(id);
        if (!canvas2 || stats.get(id) === value) return;
        const ctx2 = canvas2.getContext("2d");
        ctx2.imageSmoothingEnabled = false;
        ctx2.clearRect(0, 0, canvas2.width, canvas2.height);
        paint(ctx2);
        stats.set(id, value);
      }
      __name(stat, "stat");
      function updatePixelHud2(values = {}) {
        Object.assign(state2, values);
        const r = String(Math.max(0, Math.floor(state2.rings))).padStart(3, "0"), l = String(Math.max(0, Math.floor(state2.lives))).padStart(2, "0"), seconds = Math.max(0, Math.floor(state2.time)), t = Math.floor(seconds / 60) + ":" + String(seconds % 60).padStart(2, "0");
        for (const [id, value] of [
          ["rings", r],
          ["lives", l],
          ["time", t],
          ["score", String(Math.max(0, Math.floor(state2.score))).padStart(6, "0")],
          ["speed", String(Math.max(0, Math.round(state2.speed)))]
        ]) {
          const node = element(id);
          if (node && node.textContent !== value) node.textContent = value;
        }
        const score = element("score");
        if (score) score.hidden = state2.mode !== "win";
        const pause2 = element("pause");
        if (pause2) {
          pause2.setAttribute("data-paused", String(state2.mode === "paused"));
          pause2.setAttribute("aria-label", state2.mode === "paused" ? "Resume game" : "Pause game");
        }
        stat("ring-stat", r, (ctx2) => {
          bitmap(ctx2, ring2, 0, 2, { 1: "#88541c", 2: "#e69824", 3: "#fff3a1", 4: "#ffcf35" });
          text(ctx2, r, 24, 6, 2);
        });
        stat("timer-stat", t, (ctx2) => {
          const width = [...t].reduce((n, c) => n + ((glyphs[c] || glyphs[" "])[0].length + 1) * 2, 0) - 2;
          text(ctx2, t, Math.max(0, Math.floor((72 - width) / 2)), 3, 2);
        });
        stat("life-stat", l + (state2.lifeImage ? "/sprite" : "/loading"), (ctx2) => {
          if (state2.lifeImage) ctx2.drawImage(state2.lifeImage, 20, 362, 131, 87, 0, 1, 27, 18);
          text(ctx2, "X", 32, 6, 1, "#b3cced");
          text(ctx2, l, 40, 6, 2);
        });
        stat(
          "speed-stat",
          String(Math.round(state2.speed)),
          (ctx2) => text(ctx2, "SPD " + String(Math.max(0, Math.round(state2.speed))), 0, 1, 1, "#98eaff")
        );
        drawPixelBoostBar2(
          element("pixel-boost"),
          state2.maxBoost > 0 ? state2.boost / state2.maxBoost : 0,
          state2.frame
        );
      }
      __name(updatePixelHud2, "updatePixelHud");
      function shell() {
        return element("game-shell");
      }
      __name(shell, "shell");
      function nativeFullscreen() {
        return document.fullscreenElement || document.webkitFullscreenElement;
      }
      __name(nativeFullscreen, "nativeFullscreen");
      function syncFullscreen() {
        const box = shell(), button = element("fullscreen");
        if (!box || !button) return;
        const active2 = Boolean(nativeFullscreen() || box.classList.contains("viewport-fullscreen"));
        button.setAttribute("aria-pressed", String(active2));
        button.setAttribute("aria-label", active2 ? "Exit fullscreen" : "Enter fullscreen");
        button.textContent = active2 ? "EXIT FULLSCREEN" : "FULLSCREEN";
      }
      __name(syncFullscreen, "syncFullscreen");
      async function toggleGameFullscreen2() {
        const box = shell();
        if (!box) return;
        if (nativeFullscreen()) {
          const exit = document.exitFullscreen || document.webkitExitFullscreen;
          if (exit) await exit.call(document);
        } else if (box.classList.contains("viewport-fullscreen")) {
          box.classList.toggle("viewport-fullscreen", false);
        } else {
          const request = box.requestFullscreen || box.webkitRequestFullscreen;
          if (request) {
            try {
              await request.call(box);
            } catch (_) {
              box.classList.toggle("viewport-fullscreen", true);
            }
          } else box.classList.toggle("viewport-fullscreen", true);
        }
        syncFullscreen();
        const game = element("game");
        if (game) game.focus({ preventScroll: true });
      }
      __name(toggleGameFullscreen2, "toggleGameFullscreen");
      const fullscreen = element("fullscreen");
      if (fullscreen)
        fullscreen.addEventListener(
          "click",
          () => toggleGameFullscreen2().catch(() => syncFullscreen())
        );
      document.addEventListener("fullscreenchange", syncFullscreen);
      document.addEventListener("webkitfullscreenchange", syncFullscreen);
      window.addEventListener(
        "keydown",
        (event) => {
          if (event.code === "KeyF" && !event.repeat && !/INPUT|TEXTAREA|SELECT/.test(event.target?.tagName || "")) {
            event.preventDefault();
            toggleGameFullscreen2().catch(() => syncFullscreen());
          } else if (event.code === "Escape" && shell()?.classList.contains("viewport-fullscreen")) {
            shell().classList.toggle("viewport-fullscreen", false);
            syncFullscreen();
          }
        },
        true
      );
      window.updatePixelHud = updatePixelHud2;
      window.drawPixelBoostBar = drawPixelBoostBar2;
      window.toggleGameFullscreen = toggleGameFullscreen2;
      if (typeof globalThis !== "undefined") {
        globalThis.updatePixelHud = updatePixelHud2;
        globalThis.drawPixelBoostBar = drawPixelBoostBar2;
        globalThis.toggleGameFullscreen = toggleGameFullscreen2;
      }
    })();
  }
  __name(initializeRuntimeModule26, "initializeRuntimeModule");
  function getRuntimeBindings26() {
    return {
      updatePixelHud: {
        get: /* @__PURE__ */ __name(() => updatePixelHud, "get"),
        set: /* @__PURE__ */ __name((value) => {
          updatePixelHud = value;
        }, "set")
      },
      drawPixelBoostBar: {
        get: /* @__PURE__ */ __name(() => drawPixelBoostBar, "get"),
        set: /* @__PURE__ */ __name((value) => {
          drawPixelBoostBar = value;
        }, "set")
      },
      toggleGameFullscreen: {
        get: /* @__PURE__ */ __name(() => toggleGameFullscreen, "get"),
        set: /* @__PURE__ */ __name((value) => {
          toggleGameFullscreen = value;
        }, "set")
      }
    };
  }
  __name(getRuntimeBindings26, "getRuntimeBindings");

  // src/game-music.js
  var game_music_exports = {};
  __export(game_music_exports, {
    getRuntimeBindings: () => getRuntimeBindings27,
    initializeRuntimeModule: () => initializeRuntimeModule27,
    setGameMusicVolume: () => setGameMusicVolume,
    syncGameMusic: () => syncGameMusic
  });
  var syncGameMusic;
  var setGameMusicVolume;
  function initializeRuntimeModule27() {
    (function(root) {
      "use strict";
      const SOURCES = { 1: "assets/neon-express-act1-music.mp3", 2: "assets/city-music.mp3" }, MAX_VOLUME = 0.3;
      let source = SOURCES[2];
      let player = null, wanted = false, blocked = false, failed = false, pending = null;
      let volume = MAX_VOLUME, resetPending = false, generation = 0;
      function pause2() {
        if (player)
          try {
            player.pause();
          } catch {
          }
      }
      __name(pause2, "pause");
      function applyReset() {
        if (!player || !resetPending) return;
        try {
          player.currentTime = 0;
          resetPending = false;
        } catch {
        }
      }
      __name(applyReset, "applyReset");
      function prepare() {
        if (player) return true;
        if (failed || typeof root.Audio !== "function") return false;
        try {
          player = new root.Audio(source);
          player.loop = true;
          player.preload = "metadata";
          player.volume = volume;
          player.addEventListener("error", () => {
            failed = true;
            blocked = false;
            pause2();
          });
          player.addEventListener("loadedmetadata", applyReset);
          applyReset();
          return true;
        } catch {
          failed = true;
          player = null;
          return false;
        }
      }
      __name(prepare, "prepare");
      function attemptPlay() {
        if (!wanted || blocked || failed || !prepare()) return false;
        if (pending || !player.paused && !player.ended) return true;
        applyReset();
        const request = { generation };
        pending = request;
        try {
          const result = player.play();
          Promise.resolve(result).then(
            () => {
              if (!wanted || failed) pause2();
            },
            () => {
              if (request.generation === generation && wanted && !failed) blocked = true;
            }
          ).finally(() => {
            if (pending === request) pending = null;
            if (request.generation !== generation && wanted && !blocked && !failed) attemptPlay();
          });
          return true;
        } catch {
          pending = null;
          blocked = true;
          return false;
        }
      }
      __name(attemptPlay, "attemptPlay");
      function setGameMusicVolume2(value) {
        if (Number.isFinite(value)) volume = Math.max(0, Math.min(MAX_VOLUME, value));
        if (player)
          try {
            player.volume = volume;
          } catch {
          }
        return volume;
      }
      __name(setGameMusicVolume2, "setGameMusicVolume");
      function syncGameMusic2(state2 = {}) {
        state2 = state2 && typeof state2 === "object" ? state2 : {};
        const requested = SOURCES[state2.act] || source;
        if (requested !== source) {
          generation++;
          source = requested;
          blocked = false;
          failed = false;
          resetPending = true;
          pause2();
          if (player) {
            player.src = source;
            try {
              player.load?.();
            } catch {
            }
            applyReset();
          }
        }
        const next = state2.enabled === true && state2.mode === "playing";
        if (next !== wanted) {
          generation++;
          blocked = false;
        }
        wanted = next;
        if (Number.isFinite(state2.volume)) setGameMusicVolume2(state2.volume);
        if (state2.restart === true) {
          generation++;
          resetPending = true;
          applyReset();
        }
        if (!wanted) {
          pause2();
          return false;
        }
        if (state2.gesture === true) blocked = false;
        return attemptPlay();
      }
      __name(syncGameMusic2, "syncGameMusic");
      function retryFromGesture() {
        if (!wanted || failed) return;
        blocked = false;
        attemptPlay();
      }
      __name(retryFromGesture, "retryFromGesture");
      if (typeof root.addEventListener === "function") {
        root.addEventListener("pointerdown", retryFromGesture, { capture: true, passive: true });
        root.addEventListener("keydown", retryFromGesture, { capture: true, passive: true });
      }
      root.syncGameMusic = syncGameMusic2;
      root.setGameMusicVolume = setGameMusicVolume2;
    })(window);
  }
  __name(initializeRuntimeModule27, "initializeRuntimeModule");
  function getRuntimeBindings27() {
    return {
      syncGameMusic: {
        get: /* @__PURE__ */ __name(() => syncGameMusic, "get"),
        set: /* @__PURE__ */ __name((value) => {
          syncGameMusic = value;
        }, "set")
      },
      setGameMusicVolume: {
        get: /* @__PURE__ */ __name(() => setGameMusicVolume, "get"),
        set: /* @__PURE__ */ __name((value) => {
          setGameMusicVolume = value;
        }, "set")
      }
    };
  }
  __name(getRuntimeBindings27, "getRuntimeBindings");

  // src/game-audio.js
  var game_audio_exports = {};
  __export(game_audio_exports, {
    getRuntimeBindings: () => getRuntimeBindings28,
    initializeRuntimeModule: () => initializeRuntimeModule28,
    playGameSound: () => playGameSound,
    setGameSoundEnabled: () => setGameSoundEnabled
  });
  var setGameSoundEnabled;
  var playGameSound;
  function initializeRuntimeModule28() {
    (function(root) {
      "use strict";
      const MAX_VOICES = 18, MAX_EVENTS = 8, MASTER_LEVEL = 0.22;
      let enabled = false, context = null, master = null, noiseBuffer = null, pendingResume = null;
      const active2 = /* @__PURE__ */ new Set(), lastPlayed = /* @__PURE__ */ new Map();
      const clamp = /* @__PURE__ */ __name((value, min, max, fallback) => Number.isFinite(value) ? Math.max(min, Math.min(max, value)) : fallback, "clamp");
      const tone = /* @__PURE__ */ __name((from, to, duration, amplitude, type = "triangle", delay = 0) => ({
        from,
        to,
        duration,
        amplitude,
        type,
        delay
      }), "tone");
      const hiss = /* @__PURE__ */ __name((from, to, duration, amplitude, delay = 0, filter = "bandpass") => ({
        from,
        to,
        duration,
        amplitude,
        delay,
        noise: true,
        filter
      }), "hiss");
      const cues = {
        airWarning: {
          interval: 0.45,
          priority: 4,
          voices: /* @__PURE__ */ __name(() => [
            tone(880, 880, 0.1, 0.16, "square"),
            tone(1100, 1100, 0.1, 0.14, "triangle", 0.14)
          ], "voices")
        },
        bubbleBounce: {
          interval: 0.12,
          priority: 3,
          voices: /* @__PURE__ */ __name(() => [
            tone(480, 150, 0.12, 0.16, "sine"),
            tone(190, 440, 0.16, 0.12, "triangle", 0.06)
          ], "voices")
        },
        shieldBreak: {
          interval: 0.2,
          priority: 4,
          voices: /* @__PURE__ */ __name(() => [hiss(3200, 700, 0.2, 0.18), tone(950, 210, 0.18, 0.16, "sine")], "voices")
        },
        endingRocket: {
          interval: 0.3,
          priority: 3,
          voices: /* @__PURE__ */ __name(() => [hiss(500, 3600, 0.65, 0.22), tone(180, 600, 0.45, 0.13, "sawtooth")], "voices")
        },
        endingTeleport: {
          interval: 0.3,
          priority: 4,
          voices: /* @__PURE__ */ __name(() => [
            tone(420, 1900, 0.24, 0.17, "sine"),
            tone(1470, 320, 0.28, 0.14, "triangle"),
            hiss(2400, 900, 0.18, 0.12)
          ], "voices")
        },
        endingKick: {
          interval: 0.2,
          priority: 4,
          voices: /* @__PURE__ */ __name(() => [
            tone(190, 45, 0.13, 0.26, "triangle"),
            hiss(4100, 680, 0.18, 0.24),
            tone(980, 1300, 0.08, 0.1, "sine")
          ], "voices")
        },
        endingExplosion: {
          interval: 0.6,
          priority: 4,
          voices: /* @__PURE__ */ __name(() => [
            hiss(3300, 110, 0.8, 0.3, 0, "lowpass"),
            tone(105, 24, 0.65, 0.27, "sawtooth"),
            hiss(1200, 280, 0.45, 0.15, 0.16)
          ], "voices")
        },
        endingJetpack: {
          interval: 0.4,
          priority: 3,
          voices: /* @__PURE__ */ __name(() => [hiss(700, 3200, 1.1, 0.18), tone(180, 580, 1.05, 0.1, "sawtooth")], "voices")
        },
        endingEmerald: {
          interval: 0.3,
          priority: 2,
          voices: /* @__PURE__ */ __name(() => [
            tone(990, 1005, 0.3, 0.11, "sine"),
            tone(1490, 1510, 0.36, 0.08, "sine", 0.06)
          ], "voices")
        },
        endingCharge: {
          interval: 0.4,
          priority: 3,
          voices: /* @__PURE__ */ __name(() => [
            tone(220, 1260, 0.85, 0.14, "triangle"),
            tone(660, 1980, 0.8, 0.09, "sine"),
            hiss(800, 2900, 0.75, 0.1)
          ], "voices")
        },
        endingWarp: {
          interval: 0.4,
          priority: 4,
          voices: /* @__PURE__ */ __name(() => [
            tone(1800, 240, 0.42, 0.18, "sine"),
            tone(630, 2100, 0.3, 0.12, "triangle"),
            hiss(3800, 400, 0.38, 0.12)
          ], "voices")
        },
        endingSigh: {
          interval: 0.5,
          priority: 1,
          voices: /* @__PURE__ */ __name(() => [
            hiss(600, 190, 0.38, 0.06, 0, "lowpass"),
            hiss(1100, 300, 0.25, 0.025, 0.08)
          ], "voices")
        },
        bossReveal: {
          interval: 1,
          priority: 4,
          voices: /* @__PURE__ */ __name(() => [tone(65, 32, 0.9, 0.3, "sawtooth"), hiss(500, 90, 0.8, 0.2, 0, "lowpass")], "voices")
        },
        bossAnchor: {
          interval: 0.4,
          priority: 4,
          voices: /* @__PURE__ */ __name(() => [
            tone(115, 28, 0.35, 0.32, "triangle"),
            hiss(1900, 130, 0.45, 0.3, 0, "lowpass")
          ], "voices")
        },
        bossStrike: {
          interval: 0.25,
          priority: 3,
          voices: /* @__PURE__ */ __name(() => [tone(280, 38, 0.2, 0.28, "square"), hiss(2500, 150, 0.28, 0.24)], "voices")
        },
        bossBite: {
          interval: 0.25,
          priority: 3,
          voices: /* @__PURE__ */ __name(() => [tone(170, 65, 0.28, 0.26, "sawtooth"), hiss(1800, 440, 0.2, 0.23)], "voices")
        },
        bossLaser: {
          interval: 0.3,
          priority: 3,
          voices: /* @__PURE__ */ __name(() => [
            tone(1500, 330, 0.48, 0.22, "sawtooth"),
            tone(2300, 630, 0.38, 0.13, "square"),
            hiss(3200, 1800, 0.4, 0.13)
          ], "voices")
        },
        bossHit: {
          interval: 0.3,
          priority: 4,
          voices: /* @__PURE__ */ __name(() => [
            hiss(5600, 700, 0.35, 0.28),
            tone(670, 110, 0.22, 0.24, "square"),
            tone(1400, 1900, 0.15, 0.13, "sine", 0.04)
          ], "voices")
        },
        bossBreak: {
          interval: 1,
          priority: 4,
          voices: /* @__PURE__ */ __name(() => [
            tone(140, 25, 0.8, 0.3, "sawtooth"),
            hiss(2900, 100, 0.85, 0.32),
            tone(85, 30, 0.6, 0.2, "triangle", 0.2)
          ], "voices")
        },
        start: {
          interval: 0.5,
          priority: 2,
          voices: /* @__PURE__ */ __name(() => [
            tone(340, 345, 0.13, 0.24, "triangle"),
            tone(430, 438, 0.15, 0.23, "triangle", 0.085),
            tone(540, 552, 0.18, 0.21, "triangle", 0.17),
            tone(675, 680, 0.26, 0.22, "sine", 0.255)
          ], "voices")
        },
        jump: {
          interval: 0.075,
          priority: 2,
          voices: /* @__PURE__ */ __name(() => [
            tone(270, 820, 0.14, 0.25, "square"),
            tone(960, 570, 0.1, 0.16, "sine", 0.035),
            hiss(1500, 3100, 0.06, 0.11)
          ], "voices")
        },
        land: {
          interval: 0.1,
          priority: 1,
          voices: /* @__PURE__ */ __name(() => [
            tone(125, 53, 0.085, 0.24, "triangle"),
            hiss(1050, 180, 0.075, 0.17, 0, "lowpass")
          ], "voices")
        },
        run: {
          interval: 0.16,
          priority: 0,
          voices: /* @__PURE__ */ __name((o) => [
            tone(92 + o.speed * 45, 56, 0.055, 0.07, "triangle"),
            hiss(1200 + o.speed * 900, 500, 0.055, 0.07)
          ], "voices")
        },
        brake: {
          interval: 0.16,
          priority: 0,
          voices: /* @__PURE__ */ __name((o) => [
            tone(1180 + o.speed * 900, 470, 0.14, 0.075, "square"),
            hiss(3500, 1100, 0.15, 0.16)
          ], "voices")
        },
        spindashCharge: {
          interval: 0.12,
          priority: 0,
          voices: /* @__PURE__ */ __name((o) => [
            tone(185 + o.charge * 540, 280 + o.charge * 790, 0.12, 0.19, "sawtooth"),
            tone(285 + o.charge * 650, 385 + o.charge * 920, 0.1, 0.12, "triangle", 0.014),
            hiss(1100, 2200, 0.075, 0.08)
          ], "voices")
        },
        spindashRelease: {
          interval: 0.16,
          priority: 2,
          voices: /* @__PURE__ */ __name((o) => [
            tone(800 + o.charge * 600, 170, 0.26, 0.26, "sawtooth"),
            tone(280, 76, 0.18, 0.24, "triangle"),
            hiss(4300, 700, 0.25, 0.23, 0, "highpass")
          ], "voices")
        },
        boost: {
          interval: 0.2,
          priority: 0,
          voices: /* @__PURE__ */ __name((o) => [
            tone(140 + o.speed * 110, 96, 0.19, 0.11, "sawtooth"),
            tone(450, 630, 0.18, 0.07, "triangle"),
            hiss(2100, 4400, 0.2, 0.18, 0, "highpass")
          ], "voices")
        },
        grind: {
          interval: 0.19,
          priority: 0,
          voices: /* @__PURE__ */ __name((o) => [
            tone(1050 + o.speed * 800, 870, 0.13, 0.065, "square"),
            tone(1670, 1830, 0.095, 0.055, "triangle", 0.025),
            hiss(3200, 1700, 0.16, 0.11)
          ], "voices")
        },
        spring: {
          interval: 0.12,
          priority: 2,
          voices: /* @__PURE__ */ __name(() => [
            tone(170, 1170, 0.22, 0.27, "triangle"),
            tone(690, 1460, 0.18, 0.14, "square", 0.035),
            tone(1120, 690, 0.13, 0.12, "sine", 0.12)
          ], "voices")
        },
        vent: {
          interval: 0.18,
          priority: 2,
          voices: /* @__PURE__ */ __name(() => [
            hiss(360, 2300, 0.31, 0.3, 0, "lowpass"),
            tone(96, 250, 0.25, 0.18, "triangle"),
            hiss(2600, 4900, 0.2, 0.1, 0.06, "highpass")
          ], "voices")
        },
        pool: {
          interval: 0.25,
          priority: 2,
          voices: /* @__PURE__ */ __name((o) => o.launch ? [
            tone(160, 1130, 0.25, 0.24, "triangle"),
            tone(510, 1440, 0.19, 0.13, "square", 0.04),
            hiss(420, 3100, 0.26, 0.26, 0, "lowpass"),
            hiss(2800, 900, 0.16, 0.12, 0.11)
          ] : [
            hiss(600, 210, 0.27, 0.27, 0, "lowpass"),
            tone(720, 130, 0.11, 0.16, "sine"),
            tone(470, 105, 0.12, 0.14, "sine", 0.065),
            tone(290, 85, 0.14, 0.12, "sine", 0.12)
          ], "voices")
        },
        ring: {
          interval: 0.045,
          priority: 2,
          voices: /* @__PURE__ */ __name(() => [
            tone(1515, 1523, 0.18, 0.21, "sine"),
            tone(2175, 2188, 0.16, 0.13, "sine", 0.025)
          ], "voices")
        },
        monitor: {
          interval: 0.18,
          priority: 3,
          voices: /* @__PURE__ */ __name(() => [
            hiss(2200, 500, 0.1, 0.21),
            tone(245, 73, 0.09, 0.23, "triangle"),
            tone(720, 738, 0.18, 0.2, "square", 0.055),
            tone(1160, 1180, 0.24, 0.17, "sine", 0.115)
          ], "voices")
        },
        enemy: {
          interval: 0.065,
          priority: 2,
          voices: /* @__PURE__ */ __name(() => [
            tone(210, 52, 0.12, 0.28, "square"),
            hiss(2800, 340, 0.18, 0.25),
            tone(430, 90, 0.085, 0.1, "triangle", 0.015)
          ], "voices")
        },
        hazard: {
          interval: 0.12,
          priority: 2,
          voices: /* @__PURE__ */ __name(() => [
            hiss(1800, 320, 0.2, 0.24),
            tone(160, 42, 0.17, 0.23, "triangle"),
            tone(670, 210, 0.07, 0.09, "square")
          ], "voices")
        },
        warning: {
          interval: 0.3,
          priority: 3,
          voices: /* @__PURE__ */ __name(() => [
            tone(590, 530, 0.09, 0.22, "square"),
            tone(750, 670, 0.09, 0.23, "square", 0.12),
            tone(970, 870, 0.12, 0.2, "triangle", 0.24)
          ], "voices")
        },
        hurt: {
          interval: 0.22,
          priority: 3,
          voices: /* @__PURE__ */ __name(() => [
            tone(420, 84, 0.25, 0.29, "sawtooth"),
            tone(940, 160, 0.2, 0.17, "square", 0.012),
            hiss(3100, 700, 0.18, 0.23)
          ], "voices")
        },
        death: {
          interval: 0.6,
          priority: 4,
          voices: /* @__PURE__ */ __name(() => [
            tone(380, 155, 0.3, 0.24, "triangle"),
            tone(235, 66, 0.4, 0.24, "square", 0.2),
            tone(120, 38, 0.45, 0.18, "triangle", 0.43),
            hiss(950, 150, 0.25, 0.11, 0.3, "lowpass")
          ], "voices")
        },
        checkpoint: {
          interval: 0.4,
          priority: 3,
          voices: /* @__PURE__ */ __name(() => [
            tone(570, 582, 0.17, 0.23, "triangle"),
            tone(855, 876, 0.21, 0.2, "sine", 0.08),
            tone(1080, 1100, 0.27, 0.18, "sine", 0.16),
            tone(1440, 1456, 0.22, 0.09, "sine", 0.21)
          ], "voices")
        },
        pause: {
          interval: 0.15,
          priority: 2,
          voices: /* @__PURE__ */ __name(() => [
            tone(520, 500, 0.11, 0.18, "triangle"),
            tone(355, 340, 0.15, 0.15, "sine", 0.07)
          ], "voices")
        },
        menu: {
          interval: 0.075,
          priority: 2,
          voices: /* @__PURE__ */ __name(() => [
            tone(470, 610, 0.075, 0.18, "triangle"),
            tone(810, 830, 0.09, 0.12, "sine", 0.025)
          ], "voices")
        },
        clear: {
          interval: 1.2,
          priority: 4,
          voices: /* @__PURE__ */ __name(() => [
            tone(355, 358, 0.2, 0.22, "triangle"),
            tone(475, 480, 0.23, 0.2, "triangle", 0.12),
            tone(620, 624, 0.24, 0.2, "triangle", 0.25),
            tone(785, 794, 0.31, 0.2, "triangle", 0.38),
            tone(1045, 1055, 0.45, 0.19, "sine", 0.54),
            tone(1310, 1325, 0.4, 0.11, "sine", 0.63)
          ], "voices")
        }
      };
      function disconnect(node) {
        try {
          node.disconnect();
        } catch {
        }
      }
      __name(disconnect, "disconnect");
      function cleanEvent(event, stop = false) {
        if (event.cleaned) return;
        event.cleaned = true;
        active2.delete(event);
        if (stop)
          for (const source of event.sources) {
            source.onended = null;
            try {
              source.stop(context.currentTime);
            } catch {
            }
          }
        for (const node of event.nodes) disconnect(node);
      }
      __name(cleanEvent, "cleanEvent");
      function mute() {
        enabled = false;
        lastPlayed.clear();
        if (master && context) {
          try {
            master.gain.cancelScheduledValues(context.currentTime);
            master.gain.setValueAtTime(0, context.currentTime);
          } catch {
          }
        }
        for (const event of [...active2]) cleanEvent(event, true);
      }
      __name(mute, "mute");
      function unlock() {
        if (context.state === "running" || pendingResume) return;
        try {
          pendingResume = Promise.resolve(context.resume()).catch(() => {
            mute();
          }).finally(() => {
            pendingResume = null;
          });
        } catch {
          mute();
        }
      }
      __name(unlock, "unlock");
      function prepare() {
        if (context && context.state !== "closed") return true;
        if (context) mute();
        const Context = root.AudioContext || root.webkitAudioContext;
        if (!Context) return false;
        try {
          context = new Context();
          master = context.createGain();
          master.gain.setValueAtTime(0, context.currentTime);
          if (context.createDynamicsCompressor) {
            const limiter = context.createDynamicsCompressor();
            limiter.threshold.value = -18;
            limiter.knee.value = 10;
            limiter.ratio.value = 5;
            limiter.attack.value = 3e-3;
            limiter.release.value = 0.12;
            master.connect(limiter);
            limiter.connect(context.destination);
          } else master.connect(context.destination);
          noiseBuffer = null;
          pendingResume = null;
          lastPlayed.clear();
          return true;
        } catch {
          context = null;
          master = null;
          return false;
        }
      }
      __name(prepare, "prepare");
      function setGameSoundEnabled2(value) {
        if (!value) {
          mute();
          return false;
        }
        if (!prepare()) {
          mute();
          return false;
        }
        enabled = true;
        try {
          master.gain.cancelScheduledValues(context.currentTime);
          master.gain.setValueAtTime(MASTER_LEVEL, context.currentTime);
          unlock();
        } catch {
          mute();
        }
        return enabled;
      }
      __name(setGameSoundEnabled2, "setGameSoundEnabled");
      function getNoise() {
        if (noiseBuffer) return noiseBuffer;
        noiseBuffer = context.createBuffer(
          1,
          Math.ceil(context.sampleRate * 0.45),
          context.sampleRate
        );
        const data = noiseBuffer.getChannelData(0);
        let seed = 99267633;
        for (let i = 0; i < data.length; i++) {
          seed = Math.imul(seed, 1664525) + 1013904223 >>> 0;
          data[i] = seed / 4294967296 * 2 - 1;
        }
        return noiseBuffer;
      }
      __name(getNoise, "getNoise");
      function addVoice(event, voice, options, now, bus) {
        const source = voice.noise ? context.createBufferSource() : context.createOscillator();
        event.sources.push(source);
        event.nodes.push(source);
        const envelope = context.createGain();
        event.nodes.push(envelope);
        const begin = now + voice.delay, end = begin + voice.duration;
        const attack = Math.min(8e-3, voice.duration * 0.15), peak = voice.amplitude * options.volume;
        envelope.gain.setValueAtTime(1e-4, begin);
        envelope.gain.linearRampToValueAtTime(peak, begin + attack);
        envelope.gain.exponentialRampToValueAtTime(
          Math.max(1e-4, peak * 0.55),
          begin + voice.duration * 0.45
        );
        envelope.gain.exponentialRampToValueAtTime(1e-4, end);
        source.connect(envelope);
        if (voice.noise) {
          source.buffer = getNoise();
          source.loop = true;
          const filter = context.createBiquadFilter();
          event.nodes.push(filter);
          filter.type = voice.filter;
          filter.Q.value = voice.filter === "bandpass" ? 0.8 : 0.55;
          filter.frequency.setValueAtTime(voice.from, begin);
          filter.frequency.exponentialRampToValueAtTime(voice.to, end);
          envelope.connect(filter);
          filter.connect(bus);
        } else {
          source.type = voice.type;
          source.frequency.setValueAtTime(voice.from, begin);
          source.frequency.exponentialRampToValueAtTime(voice.to, end);
          envelope.connect(bus);
        }
        source.onended = () => {
          disconnect(source);
          disconnect(envelope);
          event.remaining--;
          if (event.remaining === 0) cleanEvent(event);
        };
        source.start(begin);
        source.stop(end + 0.018);
        event.end = Math.max(event.end, end + 0.02);
      }
      __name(addVoice, "addVoice");
      function makeRoom(size, priority, now) {
        for (const event of [...active2]) if (event.end <= now) cleanEvent(event);
        let voices = 0;
        for (const event of active2) voices += event.remaining;
        while (voices + size > MAX_VOICES || active2.size >= MAX_EVENTS) {
          let victim = null;
          for (const event of active2)
            if (event.priority < priority || event.priority === priority && priority >= 2) {
              if (!victim || event.priority < victim.priority) victim = event;
            }
          if (!victim) return false;
          voices -= victim.remaining;
          cleanEvent(victim, true);
        }
        return true;
      }
      __name(makeRoom, "makeRoom");
      function playGameSound2(name, options = {}) {
        const cue = Object.prototype.hasOwnProperty.call(cues, name) ? cues[name] : null;
        if (!enabled || !context || !cue || context.state === "closed") return false;
        options = options && typeof options === "object" ? options : {};
        const opts = {
          volume: clamp(options.volume, 0, 1, 1),
          charge: clamp(options.charge, 0, 1, 0),
          speed: clamp(Math.abs(options.speed), 0, 32, 0) / 32,
          pan: clamp(options.pan, -1, 1, 0),
          launch: options.launch === true
        };
        if (opts.volume === 0) return false;
        const now = context.currentTime;
        if (now - (lastPlayed.get(name) ?? -Infinity) < cue.interval) return false;
        const voices = cue.voices(opts);
        if (!makeRoom(voices.length, cue.priority, now)) return false;
        const event = {
          sources: [],
          nodes: [],
          remaining: voices.length,
          end: now,
          priority: cue.priority,
          cleaned: false
        };
        try {
          unlock();
          if (!enabled) return false;
          let bus = master;
          if (context.createStereoPanner) {
            bus = context.createStereoPanner();
            bus.pan.setValueAtTime(opts.pan, now);
            bus.connect(master);
            event.nodes.push(bus);
          }
          active2.add(event);
          for (const voice of voices) addVoice(event, voice, opts, now, bus);
          lastPlayed.set(name, now);
          return true;
        } catch {
          cleanEvent(event, true);
          return false;
        }
      }
      __name(playGameSound2, "playGameSound");
      root.setGameSoundEnabled = setGameSoundEnabled2;
      root.playGameSound = playGameSound2;
    })(window);
  }
  __name(initializeRuntimeModule28, "initializeRuntimeModule");
  function getRuntimeBindings28() {
    return {
      setGameSoundEnabled: {
        get: /* @__PURE__ */ __name(() => setGameSoundEnabled, "get"),
        set: /* @__PURE__ */ __name((value) => {
          setGameSoundEnabled = value;
        }, "set")
      },
      playGameSound: {
        get: /* @__PURE__ */ __name(() => playGameSound, "get"),
        set: /* @__PURE__ */ __name((value) => {
          playGameSound = value;
        }, "set")
      }
    };
  }
  __name(getRuntimeBindings28, "getRuntimeBindings");

  // src/level2.js
  var level2_exports = {};
  __export(level2_exports, {
    act2LevelTemplate: () => act2LevelTemplate,
    getRuntimeBindings: () => getRuntimeBindings29,
    initializeRuntimeModule: () => initializeRuntimeModule29,
    makeLevel2: () => makeLevel2
  });
  var act2LevelTemplate;
  function makeLevel2() {
    const level = JSON.parse(JSON.stringify(act2LevelTemplate));
    level.challenges = level.routeChallenges;
    level.ventSections = [level.routeChallenges[1]];
    const sectors = level.sectors;
    level.floorAt = function(x) {
      const sector = sectors[Math.max(
        0,
        sectors.findLastIndex((s) => s.x <= x)
      )];
      return sector.y;
    };
    return level;
  }
  __name(makeLevel2, "makeLevel2");
  function initializeRuntimeModule29() {
    act2LevelTemplate = {
      blimpRoute: {
        entered: false,
        departureFrame: -100,
        departureSpeed: 0,
        entryId: "blimp-entry",
        movingId: "blimp-moving",
        rewardId: "blimp-reward",
        exitId: "draw-hall-exit",
        blimps: [
          {
            id: "damaged",
            surfaces: [
              "blimp-curve-0",
              "blimp-curve-1",
              "blimp-curve-2",
              "blimp-curve-3",
              "blimp-curve-4",
              "blimp-curve-5",
              "blimp-curve-6",
              "blimp-curve-7"
            ],
            damaged: true
          },
          {
            id: "moving",
            surfaces: ["blimp-moving"]
          },
          {
            id: "reward",
            surfaces: ["blimp-reward"]
          }
        ]
      },
      monitors: [
        {
          id: "blimp-life",
          item: "life",
          x: 28561,
          y: -3690,
          surfaceId: "blimp-reward",
          broken: false
        },
        {
          id: "blimp-shield",
          item: "bubble",
          x: 28481,
          y: -3690,
          surfaceId: "blimp-reward",
          broken: false
        }
      ],
      act: 2,
      title: "NEON EXPRESS",
      verticalCity: true,
      end: 65090,
      arena: {
        x: 64090,
        y: -9340,
        w: 1460,
        boss: false
      },
      restoredSections: [
        {
          name: "CITY UNDER ATTACK",
          prefix: "under-attack",
          x1: 0,
          x2: 8500,
          entryId: "under-attack-act2-0",
          exitId: "under-attack-act2-27"
        },
        {
          name: "SKYLINE FORK",
          prefix: "skyline-fork",
          x1: 8500,
          x2: 16500,
          entryId: "skyline-fork-act2-29",
          exitId: "skyline-fork-act2-62"
        },
        {
          name: "SPLIT SKYLINE",
          prefix: "split-skyline",
          x1: 36500,
          x2: 46600,
          entryId: "split-skyline-act2-179",
          exitId: "split-skyline-act2-218"
        },
        {
          name: "CITY-COLLAPSE CLIMAX",
          prefix: "city-climax",
          x1: 54790,
          x2: 64090,
          entryId: "summit-entry",
          exitId: "city-climax-act2-247"
        }
      ],
      surfaces: [
        {
          id: "arrival",
          x1: 16500,
          x2: 17170,
          y1: -1300,
          y2: -1300,
          kind: "main",
          cityType: "rooftop"
        },
        {
          id: "approach-1",
          x1: 17380,
          x2: 17690,
          y1: -1400,
          y2: -1400,
          kind: "main",
          cityType: "rooftop"
        },
        {
          id: "approach-2",
          x1: 17890,
          x2: 18230,
          y1: -1510,
          y2: -1510,
          kind: "main",
          cityType: "rooftop"
        },
        {
          id: "approach-3",
          x1: 18410,
          x2: 18800,
          y1: -1620,
          y2: -1620,
          kind: "main",
          cityType: "rooftop"
        },
        {
          id: "vent-entry",
          x1: 18960,
          x2: 19410,
          y1: -1640,
          y2: -1640,
          kind: "main",
          cityType: "ventilation"
        },
        {
          id: "vent-upper-roof",
          x1: 19850,
          x2: 21050,
          y1: -1820,
          y2: -1820,
          kind: "express",
          cityType: "rooftop",
          boostExit: true
        },
        {
          id: "vent-upper-step",
          x1: 20520,
          x2: 20880,
          y1: -1860,
          y2: -1860,
          kind: "express",
          cityType: "rooftop"
        },
        {
          id: "vent-upper-tail",
          x1: 21050,
          x2: 21440,
          y1: -1800,
          y2: -1800,
          kind: "express",
          cityType: "rooftop"
        },
        {
          id: "vent-later-merge",
          x1: 21560,
          x2: 21950,
          y1: -1640,
          y2: -1640,
          kind: "main",
          cityType: "rooftop"
        },
        {
          id: "vent-lower-1",
          x1: 19570,
          x2: 20240,
          y1: -1470,
          y2: -1470,
          kind: "lower",
          cityType: "rooftop"
        },
        {
          id: "vent-lower-2",
          x1: 20400,
          x2: 20660,
          y1: -1410,
          y2: -1410,
          kind: "lower",
          cityType: "fire-escape"
        },
        {
          id: "vent-lower-3",
          x1: 20840,
          x2: 21080,
          y1: -1490,
          y2: -1490,
          kind: "lower",
          cityType: "rooftop"
        },
        {
          id: "vent-lower-lift",
          x1: 21360,
          x2: 21720,
          y1: -1587.5,
          y2: -1587.5,
          kind: "moving",
          cityType: "freight-lift",
          motion: {
            axis: "y",
            amp: 92.5,
            period: 360,
            phase: 1.5707963267948966
          }
        },
        {
          id: "draw-stair-0",
          x1: 21950,
          x2: 22550,
          y1: -1640,
          y2: -1640,
          kind: "main",
          cityType: "rooftop"
        },
        {
          id: "draw-stair-1",
          x1: 22740,
          x2: 23070,
          y1: -1740,
          y2: -1740,
          kind: "main",
          cityType: "rooftop"
        },
        {
          id: "draw-stair-2",
          x1: 23260,
          x2: 23590,
          y1: -1840,
          y2: -1840,
          kind: "main",
          cityType: "rooftop"
        },
        {
          id: "draw-glass-approach",
          x1: 23780,
          x2: 24360,
          y1: -1940,
          y2: -1940,
          kind: "main",
          cityType: "rooftop"
        },
        {
          id: "draw-glass-hall",
          x1: 24360,
          x2: 24840,
          y1: -1940,
          y2: -1940,
          kind: "main",
          cityType: "interior",
          sealedBy: "teaching-glass"
        },
        {
          id: "draw-downhill",
          x1: 24840,
          x2: 25540,
          y1: -1940,
          y2: -1660,
          kind: "main",
          cityType: "ventilation",
          sealedBy: "teaching-glass"
        },
        {
          id: "draw-fire-escape-1",
          x1: 26440,
          x2: 27690,
          y1: -2190,
          y2: -2190,
          kind: "main",
          cityType: "fire-escape"
        },
        {
          id: "draw-left-ledge",
          x1: 26640,
          x2: 26920,
          y1: -2300,
          y2: -2300,
          kind: "main",
          cityType: "fire-escape"
        },
        {
          id: "draw-fire-escape-2",
          x1: 27200,
          x2: 27690,
          y1: -2410,
          y2: -2410,
          kind: "main",
          cityType: "fire-escape"
        },
        {
          id: "draw-blocked-left",
          x1: 26730,
          x2: 27030,
          y1: -2520,
          y2: -2520,
          kind: "main",
          cityType: "fire-escape"
        },
        {
          id: "draw-interior-room",
          x1: 27690,
          x2: 28100,
          y1: -2410,
          y2: -2410,
          kind: "main",
          cityType: "interior",
          sealedBy: "draw-interior-wall"
        },
        {
          id: "draw-checkpoint-roof",
          x1: 27690,
          x2: 28470,
          y1: -2950,
          y2: -2950,
          kind: "main",
          cityType: "rooftop"
        },
        {
          id: "draw-drop-vent-roof",
          x1: 28620,
          x2: 29010,
          y1: -2790,
          y2: -2790,
          kind: "main",
          cityType: "ventilation"
        },
        {
          id: "draw-loop-roof",
          x1: 29500,
          x2: 3e4,
          y1: -3220,
          y2: -3220,
          kind: "main",
          cityType: "rooftop"
        },
        {
          id: "draw-loop-descent",
          x1: 3e4,
          x2: 30180,
          y1: -3220,
          y2: -2750,
          kind: "main",
          cityType: "concrete-ramp"
        },
        {
          id: "draw-loop-flat-1",
          x1: 30180,
          x2: 30550,
          y1: -2750,
          y2: -2750,
          kind: "main",
          cityType: "rooftop"
        },
        {
          id: "draw-loop-link",
          x1: 30550,
          x2: 30680,
          y1: -2750,
          y2: -2800,
          kind: "main",
          cityType: "concrete-ramp"
        },
        {
          id: "draw-loop-flat-2",
          x1: 30680,
          x2: 31e3,
          y1: -2800,
          y2: -2800,
          kind: "main",
          cityType: "rooftop"
        },
        {
          id: "draw-loop-launch",
          x1: 31e3,
          x2: 31127,
          y1: -2800,
          y2: -3020,
          kind: "main",
          cityType: "concrete-ramp"
        },
        {
          id: "draw-loop-catch",
          x1: 31400,
          x2: 31700,
          y1: -2940,
          y2: -2940,
          kind: "main",
          cityType: "rooftop"
        },
        {
          id: "draw-loop-return",
          x1: 31700,
          x2: 32e3,
          y1: -2940,
          y2: -3180,
          kind: "main",
          cityType: "concrete-ramp"
        },
        {
          id: "draw-loop-payoff-roof",
          x1: 32e3,
          x2: 32600,
          y1: -3180,
          y2: -3180,
          kind: "main",
          cityType: "rooftop"
        },
        {
          id: "draw-next-roof",
          x1: 32800,
          x2: 33220,
          y1: -3260,
          y2: -3260,
          kind: "main",
          cityType: "rooftop"
        },
        {
          id: "draw-burning-approach",
          x1: 33420,
          x2: 33900,
          y1: -3340,
          y2: -3340,
          kind: "main",
          cityType: "rooftop"
        },
        {
          id: "draw-burning-left",
          x1: 33070,
          x2: 33370,
          y1: -3450,
          y2: -3450,
          kind: "main",
          cityType: "fire-escape"
        },
        {
          id: "draw-burning-right",
          x1: 33590,
          x2: 33910,
          y1: -3560,
          y2: -3560,
          kind: "main",
          cityType: "fire-escape"
        },
        {
          id: "draw-burning-top",
          x1: 33150,
          x2: 33500,
          y1: -3670,
          y2: -3670,
          kind: "main",
          cityType: "fire-escape"
        },
        {
          id: "draw-moving-carrier",
          x1: 33650,
          x2: 34100,
          y1: -3790,
          y2: -3790,
          kind: "moving",
          cityType: "crane-hoist",
          motion: {
            axis: "x",
            amp: 480,
            period: 420,
            phase: -1.5707963267948966
          }
        },
        {
          id: "draw-hazard-hall",
          x1: 34450,
          x2: 36150,
          y1: -3790,
          y2: -3790,
          kind: "main",
          cityType: "interior"
        },
        {
          id: "draw-hidden-pit-grate",
          x1: 33930,
          x2: 34400,
          y1: -2840,
          y2: -2840,
          kind: "main",
          cityType: "ventilation",
          pitSecret: true
        },
        {
          id: "draw-hall-exit",
          x1: 36150,
          x2: 36500,
          y1: -3790,
          y2: -3900,
          kind: "main",
          cityType: "concrete-ramp"
        },
        {
          id: "secret-rail-entry",
          x1: 46600,
          x2: 47160,
          y1: -4650,
          y2: -4890,
          kind: "express",
          cityType: "grind-rail",
          grindable: true
        },
        {
          id: "secret-rail-tail",
          x1: 47160,
          x2: 47310,
          y1: -4890,
          y2: -4970,
          kind: "crumble",
          cityType: "grind-rail",
          grindable: true,
          crumbleDelay: 90,
          crumbleTimer: -1,
          restoreAt: 0
        },
        {
          id: "secret-wall-platform",
          x1: 47600,
          x2: 48040,
          y1: -5040,
          y2: -5040,
          kind: "main",
          cityType: "rooftop"
        },
        {
          id: "secret-normal-1",
          x1: 47500,
          x2: 47850,
          y1: -5150,
          y2: -5150,
          kind: "main",
          cityType: "fire-escape"
        },
        {
          id: "secret-spike-step",
          x1: 47130,
          x2: 47480,
          y1: -5260,
          y2: -5260,
          kind: "main",
          cityType: "fire-escape"
        },
        {
          id: "secret-vertical-lift",
          x1: 47580,
          x2: 47970,
          y1: -5420,
          y2: -5420,
          kind: "moving",
          cityType: "freight-lift",
          motion: {
            axis: "y",
            amp: 85,
            period: 280,
            phase: 1.5707963267948966
          }
        },
        {
          id: "secret-right-ledge",
          x1: 48130,
          x2: 48460,
          y1: -5550,
          y2: -5550,
          kind: "main",
          cityType: "fire-escape"
        },
        {
          id: "secret-shared-rooftop",
          x1: 48640,
          x2: 50320,
          y1: -5660,
          y2: -5660,
          kind: "main",
          cityType: "rooftop"
        },
        {
          id: "secret-rail-down",
          x1: 48040,
          x2: 48400,
          y1: -5040,
          y2: -4850,
          kind: "express",
          cityType: "grind-rail",
          grindable: true,
          sealedBy: "secret-facade-wall"
        },
        {
          id: "secret-rail-bottom",
          x1: 48400,
          x2: 48700,
          y1: -4850,
          y2: -4850,
          kind: "express",
          cityType: "grind-rail",
          grindable: true,
          sealedBy: "secret-facade-wall"
        },
        {
          id: "secret-rail-up",
          x1: 48700,
          x2: 49120,
          y1: -4850,
          y2: -5660,
          kind: "express",
          cityType: "grind-rail",
          grindable: true,
          sealedBy: "secret-facade-wall"
        },
        {
          id: "secret-rail-merge",
          x1: 49120,
          x2: 49260,
          y1: -5660,
          y2: -5660,
          kind: "express",
          cityType: "grind-rail",
          grindable: true,
          sealedBy: "secret-facade-wall"
        },
        {
          id: "neon-0",
          x1: 50500,
          x2: 50800,
          y1: -5770,
          y2: -5770,
          kind: "main",
          cityType: "scaffold"
        },
        {
          id: "neon-1",
          x1: 50980,
          x2: 51280,
          y1: -5880,
          y2: -5880,
          kind: "main",
          cityType: "fire-escape"
        },
        {
          id: "neon-2",
          x1: 50610,
          x2: 50910,
          y1: -5990,
          y2: -5990,
          kind: "moving",
          cityType: "scaffold",
          motion: {
            axis: "x",
            amp: 32,
            period: 240,
            phase: 0
          }
        },
        {
          id: "neon-3",
          x1: 50250,
          x2: 50550,
          y1: -6100,
          y2: -6100,
          kind: "main",
          cityType: "fire-escape"
        },
        {
          id: "neon-4",
          x1: 50600,
          x2: 50900,
          y1: -6210,
          y2: -6210,
          kind: "main",
          cityType: "scaffold"
        },
        {
          id: "neon-5",
          x1: 51e3,
          x2: 51300,
          y1: -6320,
          y2: -6320,
          kind: "main",
          cityType: "fire-escape"
        },
        {
          id: "neon-vent-roof",
          x1: 51480,
          x2: 51950,
          y1: -6430,
          y2: -6430,
          kind: "main",
          cityType: "ventilation"
        },
        {
          id: "neon-high-crown",
          x1: 52150,
          x2: 52630,
          y1: -7070,
          y2: -7070,
          kind: "main",
          cityType: "rooftop"
        },
        {
          id: "fracture-0",
          x1: 52770,
          x2: 53050,
          y1: -7180,
          y2: -7180,
          kind: "main",
          cityType: "fire-escape"
        },
        {
          id: "fracture-1",
          x1: 53120,
          x2: 53400,
          y1: -7290,
          y2: -7290,
          kind: "crumble",
          cityType: "broken-bridge",
          crumbleDelay: 90,
          crumbleTimer: -1,
          restoreAt: 0
        },
        {
          id: "fracture-2",
          x1: 52720,
          x2: 53e3,
          y1: -7400,
          y2: -7400,
          kind: "main",
          cityType: "fire-escape"
        },
        {
          id: "fracture-3",
          x1: 53170,
          x2: 53450,
          y1: -7510,
          y2: -7510,
          kind: "main",
          cityType: "fire-escape"
        },
        {
          id: "fracture-hoist",
          x1: 53560,
          x2: 53910,
          y1: -7640,
          y2: -7640,
          kind: "moving",
          cityType: "crane-hoist",
          motion: {
            axis: "y",
            amp: 45,
            period: 270,
            phase: 0
          }
        },
        {
          id: "fracture-vent-roof",
          x1: 54090,
          x2: 54580,
          y1: -7750,
          y2: -7750,
          kind: "main",
          cityType: "ventilation"
        },
        {
          id: "secret-exit-uphill-link",
          x1: 50320,
          x2: 50500,
          y1: -5660,
          y2: -5770,
          kind: "main",
          cityType: "concrete-ramp"
        },
        {
          id: "under-attack-act2-0",
          x1: 0,
          x2: 1300,
          y1: 420,
          y2: 420,
          kind: "main",
          cityType: "highway"
        },
        {
          id: "under-attack-act2-2",
          x1: 1300,
          x2: 1580,
          y1: 420,
          y2: 280,
          kind: "main",
          cityType: "concrete-ramp",
          damaged: true
        },
        {
          id: "under-attack-act2-3",
          x1: 1580,
          x2: 2150,
          y1: 280,
          y2: 280,
          kind: "main",
          cityType: "scaffold"
        },
        {
          id: "under-attack-act2-4",
          x1: 2480,
          x2: 3e3,
          y1: 250,
          y2: 250,
          kind: "main",
          cityType: "fire-escape"
        },
        {
          id: "under-attack-act2-6",
          x1: 2100,
          x2: 2450,
          y1: 520,
          y2: 520,
          kind: "lower",
          routeType: "lower",
          cityType: "ruined-walkway"
        },
        {
          id: "under-attack-act2-7",
          x1: 2630,
          x2: 2850,
          y1: 420,
          y2: 420,
          kind: "lower",
          routeType: "lower",
          cityType: "ruined-walkway"
        },
        {
          id: "under-attack-act2-8",
          x1: 2920,
          x2: 3140,
          y1: 330,
          y2: 330,
          kind: "lower",
          routeType: "lower",
          cityType: "ruined-walkway"
        },
        {
          id: "under-attack-act2-9",
          x1: 3190,
          x2: 3440,
          y1: 230,
          y2: 230,
          kind: "lower",
          routeType: "lower",
          cityType: "ruined-walkway"
        },
        {
          id: "under-attack-act2-10",
          x1: 3e3,
          x2: 3300,
          y1: 250,
          y2: 100,
          kind: "main",
          cityType: "concrete-ramp",
          damaged: true
        },
        {
          id: "under-attack-act2-11",
          x1: 3300,
          x2: 4e3,
          y1: 100,
          y2: 100,
          kind: "main",
          cityType: "highway"
        },
        {
          id: "under-attack-act2-12",
          x1: 4e3,
          x2: 4500,
          y1: 100,
          y2: 100,
          kind: "main",
          cityType: "scaffold"
        },
        {
          id: "under-attack-act2-13",
          x1: 4580,
          x2: 4800,
          y1: 10,
          y2: 10,
          kind: "main",
          roof: true,
          cityType: "fire-escape"
        },
        {
          id: "under-attack-act2-14",
          x1: 4850,
          x2: 5060,
          y1: -130,
          y2: -165,
          kind: "main",
          roof: true,
          cityType: "fire-escape",
          damaged: true
        },
        {
          id: "under-attack-act2-15",
          x1: 5230,
          x2: 5510,
          y1: -210,
          y2: -210,
          kind: "moving",
          motion: {
            axis: "y",
            amp: 9,
            period: 210,
            phase: 0
          },
          cityType: "scaffold",
          facade: {
            x: 5240,
            y: 335,
            bottom: 350
          }
        },
        {
          id: "under-attack-act2-16",
          x1: 5540,
          x2: 5740,
          y1: -320,
          y2: -320,
          kind: "main",
          roof: true,
          cityType: "rooftop"
        },
        {
          id: "under-attack-act2-17",
          x1: 5790,
          x2: 6070,
          y1: -410,
          y2: -410,
          kind: "main",
          roof: true,
          cityType: "rooftop"
        },
        {
          id: "under-attack-act2-18",
          x1: 6090,
          x2: 6590,
          y1: -500,
          y2: -500,
          kind: "main",
          cityType: "scaffold"
        },
        {
          id: "under-attack-act2-19",
          x1: 3930,
          x2: 5510,
          y1: 340,
          y2: 340,
          kind: "lower",
          routeType: "lower",
          cityType: "ruined-walkway"
        },
        {
          id: "under-attack-act2-20",
          x1: 5690,
          x2: 5910,
          y1: 230,
          y2: 230,
          kind: "lower",
          routeType: "lower",
          cityType: "ruined-walkway"
        },
        {
          id: "under-attack-act2-22",
          x1: 6075,
          x2: 6120,
          y1: -440,
          y2: -440,
          kind: "main",
          wallCap: true,
          faceId: "under-attack-tower-face-21",
          cityType: "tower-cap"
        },
        {
          id: "under-attack-service-transit-stack",
          x1: 5920,
          x2: 6190,
          y1: 140,
          y2: 140,
          kind: "lower",
          routeType: "lower",
          cityType: "fire-escape"
        },
        {
          id: "under-attack-lift-service-transit-stack",
          x1: 6280,
          x2: 6480,
          y1: -142.5,
          y2: -142.5,
          kind: "moving",
          routeType: "lower",
          cityType: "freight-lift",
          motion: {
            axis: "y",
            amp: 282.5,
            period: 420,
            phase: 1.5707963267948966
          }
        },
        {
          id: "under-attack-act2-24",
          x1: 6590,
          x2: 7400,
          y1: -500,
          y2: -500,
          kind: "main",
          cityType: "rooftop"
        },
        {
          id: "under-attack-act2-26",
          x1: 7400,
          x2: 7670,
          y1: -500,
          y2: -600,
          kind: "main",
          cityType: "concrete-ramp",
          damaged: true
        },
        {
          id: "under-attack-act2-27",
          x1: 7670,
          x2: 8500,
          y1: -600,
          y2: -450,
          kind: "main",
          cityType: "concrete-ramp"
        },
        {
          id: "skyline-fork-act2-29",
          x1: 8500,
          x2: 9450,
          y1: -450,
          y2: -450,
          kind: "main",
          cityType: "rooftop"
        },
        {
          id: "skyline-fork-act2-30",
          x1: 9450,
          x2: 9750,
          y1: -450,
          y2: -600,
          kind: "main",
          cityType: "concrete-ramp"
        },
        {
          id: "skyline-fork-act2-31",
          x1: 10080,
          x2: 10800,
          y1: -580,
          y2: -580,
          kind: "main",
          cityType: "highway"
        },
        {
          id: "skyline-fork-act2-32",
          x1: 11130,
          x2: 11420,
          y1: -610,
          y2: -610,
          kind: "main",
          cityType: "scaffold"
        },
        {
          id: "skyline-fork-act2-33",
          x1: 11580,
          x2: 11800,
          y1: -520,
          y2: -520,
          kind: "main",
          cityType: "fire-escape"
        },
        {
          id: "skyline-fork-act2-34",
          x1: 11930,
          x2: 12150,
          y1: -610,
          y2: -610,
          kind: "main",
          cityType: "scaffold"
        },
        {
          id: "skyline-fork-skyline-service-0",
          x1: 12300,
          x2: 12530,
          y1: -710,
          y2: -710,
          kind: "main",
          cityType: "rooftop"
        },
        {
          id: "skyline-fork-skyline-service-1",
          x1: 12650,
          x2: 12920,
          y1: -650,
          y2: -650,
          kind: "main",
          cityType: "fire-escape"
        },
        {
          id: "skyline-fork-skyline-service-2",
          x1: 13200,
          x2: 13500,
          y1: -650,
          y2: -650,
          kind: "main",
          cityType: "rooftop"
        },
        {
          id: "skyline-fork-act2-35",
          x1: 10050,
          x2: 10850,
          y1: -735,
          y2: -780,
          kind: "express",
          routeType: "skill",
          solidAtAnySpeed: true,
          cityType: "concrete-ramp"
        },
        {
          id: "skyline-fork-act2-36",
          x1: 11180,
          x2: 12e3,
          y1: -780,
          y2: -825,
          kind: "express",
          routeType: "skill",
          solidAtAnySpeed: true,
          cityType: "concrete-ramp"
        },
        {
          id: "skyline-fork-act2-37",
          x1: 12350,
          x2: 13100,
          y1: -825,
          y2: -780,
          kind: "express",
          routeType: "skill",
          solidAtAnySpeed: true,
          cityType: "concrete-ramp"
        },
        {
          id: "skyline-fork-act2-38",
          x1: 13100,
          x2: 13500,
          y1: -780,
          y2: -650,
          kind: "express",
          routeType: "skill",
          solidAtAnySpeed: true,
          cityType: "concrete-ramp"
        },
        {
          id: "skyline-fork-act2-41",
          x1: 9790,
          x2: 10500,
          y1: -250,
          y2: -250,
          kind: "lower",
          routeType: "lower",
          cityType: "ruined-walkway"
        },
        {
          id: "skyline-fork-act2-42",
          x1: 10710,
          x2: 11500,
          y1: -250,
          y2: -340,
          kind: "lower",
          routeType: "lower",
          cityType: "ruined-walkway"
        },
        {
          id: "skyline-fork-act2-43",
          x1: 11700,
          x2: 12100,
          y1: -340,
          y2: -340,
          kind: "lower",
          routeType: "lower",
          cityType: "ruined-walkway"
        },
        {
          id: "skyline-fork-act2-44",
          x1: 12300,
          x2: 12650,
          y1: -440,
          y2: -440,
          kind: "lower",
          routeType: "lower",
          cityType: "ruined-walkway"
        },
        {
          id: "skyline-fork-act2-45",
          x1: 12800,
          x2: 13100,
          y1: -540,
          y2: -540,
          kind: "lower",
          routeType: "lower",
          cityType: "ruined-walkway"
        },
        {
          id: "skyline-fork-act2-46",
          x1: 13200,
          x2: 13500,
          y1: -640,
          y2: -640,
          kind: "lower",
          routeType: "lower",
          cityType: "ruined-walkway"
        },
        {
          id: "skyline-fork-act2-48",
          x1: 13500,
          x2: 14e3,
          y1: -650,
          y2: -650,
          kind: "main",
          cityType: "scaffold"
        },
        {
          id: "skyline-fork-act2-49",
          x1: 14160,
          x2: 14370,
          y1: -750,
          y2: -750,
          kind: "main",
          roof: false,
          cityType: "scaffold",
          facade: {
            x: 14020,
            y: -1285,
            bottom: -430
          }
        },
        {
          id: "skyline-fork-act2-50",
          x1: 14450,
          x2: 14660,
          y1: -850,
          y2: -850,
          kind: "main",
          roof: false,
          cityType: "fire-escape",
          facade: {
            x: 14020,
            y: -1285,
            bottom: -430
          }
        },
        {
          id: "skyline-fork-act2-51",
          x1: 14160,
          x2: 14370,
          y1: -950,
          y2: -950,
          kind: "moving",
          motion: {
            axis: "y",
            amp: 9,
            period: 210,
            phase: 0
          },
          cityType: "scaffold",
          facade: {
            x: 14020,
            y: -1285,
            bottom: -430
          },
          roof: false
        },
        {
          id: "skyline-fork-act2-52",
          x1: 13860,
          x2: 14070,
          y1: -1050,
          y2: -1050,
          kind: "main",
          roof: false,
          cityType: "fire-escape",
          facade: {
            x: 14020,
            y: -1285,
            bottom: -430
          }
        },
        {
          id: "skyline-fork-act2-53",
          x1: 14160,
          x2: 14370,
          y1: -1150,
          y2: -1150,
          kind: "main",
          roof: false,
          cityType: "scaffold",
          facade: {
            x: 14020,
            y: -1285,
            bottom: -430
          }
        },
        {
          id: "skyline-fork-act2-54",
          x1: 14450,
          x2: 14680,
          y1: -1250,
          y2: -1250,
          kind: "main",
          roof: false,
          cityType: "fire-escape",
          facade: {
            x: 14020,
            y: -1285,
            bottom: -430
          }
        },
        {
          id: "skyline-fork-act2-55",
          x1: 14770,
          x2: 15270,
          y1: -1350,
          y2: -1350,
          kind: "main",
          cityType: "fire-escape"
        },
        {
          id: "skyline-fork-act2-56",
          x1: 13430,
          x2: 14190,
          y1: -410,
          y2: -410,
          kind: "lower",
          routeType: "lower",
          cityType: "ruined-walkway"
        },
        {
          id: "skyline-fork-act2-57",
          x1: 14370,
          x2: 14590,
          y1: -520,
          y2: -520,
          kind: "lower",
          routeType: "lower",
          cityType: "ruined-walkway"
        },
        {
          id: "skyline-fork-act2-59",
          x1: 14755,
          x2: 14800,
          y1: -1290,
          y2: -1290,
          kind: "main",
          wallCap: true,
          faceId: "skyline-fork-tower-face-58",
          cityType: "tower-cap"
        },
        {
          id: "skyline-fork-service-broadcast-tower",
          x1: 14710,
          x2: 14870,
          y1: -610,
          y2: -610,
          kind: "lower",
          routeType: "lower",
          cityType: "ventilation"
        },
        {
          id: "skyline-fork-lift-service-broadcast-tower",
          x1: 14960,
          x2: 15160,
          y1: -942.5,
          y2: -942.5,
          kind: "moving",
          routeType: "lower",
          cityType: "freight-lift",
          motion: {
            axis: "y",
            amp: 332.5,
            period: 360,
            phase: 1.5707963267948966
          }
        },
        {
          id: "skyline-fork-act2-61",
          x1: 15270,
          x2: 16e3,
          y1: -1350,
          y2: -1350,
          kind: "main",
          cityType: "highway"
        },
        {
          id: "skyline-fork-act2-62",
          x1: 16e3,
          x2: 16500,
          y1: -1350,
          y2: -1300,
          kind: "main",
          cityType: "concrete-ramp"
        },
        {
          id: "split-skyline-act2-179",
          x1: 36500,
          x2: 37900,
          y1: -3900,
          y2: -3900,
          kind: "main",
          cityType: "rooftop"
        },
        {
          id: "split-skyline-act2-180",
          x1: 37900,
          x2: 38200,
          y1: -3900,
          y2: -4050,
          kind: "main",
          cityType: "concrete-ramp"
        },
        {
          id: "split-skyline-act2-181",
          x1: 38530,
          x2: 39200,
          y1: -4030,
          y2: -4030,
          kind: "main",
          cityType: "highway"
        },
        {
          id: "split-skyline-act2-182",
          x1: 39500,
          x2: 40200,
          y1: -4070,
          y2: -4070,
          kind: "main",
          cityType: "rooftop"
        },
        {
          id: "split-skyline-act2-183",
          x1: 40570,
          x2: 41180,
          y1: -4020,
          y2: -4020,
          kind: "main",
          cityType: "fire-escape"
        },
        {
          id: "split-skyline-act2-184",
          x1: 41550,
          x2: 42300,
          y1: -4100,
          y2: -4100,
          kind: "main",
          cityType: "highway"
        },
        {
          id: "split-skyline-act2-185",
          x1: 42660,
          x2: 43300,
          y1: -4050,
          y2: -4050,
          kind: "main",
          cityType: "fire-escape"
        },
        {
          id: "split-skyline-act2-186",
          x1: 38500,
          x2: 39150,
          y1: -4200,
          y2: -4200,
          kind: "express",
          routeType: "skill",
          solidAtAnySpeed: true,
          cityType: "billboard"
        },
        {
          id: "split-skyline-act2-187",
          x1: 39500,
          x2: 40100,
          y1: -4260,
          y2: -4260,
          kind: "express",
          routeType: "skill",
          solidAtAnySpeed: true,
          cityType: "billboard"
        },
        {
          id: "split-skyline-act2-188",
          x1: 40500,
          x2: 41150,
          y1: -4200,
          y2: -4200,
          kind: "express",
          routeType: "skill",
          solidAtAnySpeed: true,
          cityType: "billboard"
        },
        {
          id: "split-skyline-act2-189",
          x1: 41550,
          x2: 42200,
          y1: -4270,
          y2: -4270,
          kind: "express",
          routeType: "skill",
          solidAtAnySpeed: true,
          cityType: "billboard"
        },
        {
          id: "split-skyline-act2-190",
          x1: 42600,
          x2: 43300,
          y1: -4270,
          y2: -4050,
          kind: "express",
          routeType: "skill",
          solidAtAnySpeed: true,
          cityType: "concrete-ramp"
        },
        {
          id: "split-skyline-act2-193",
          x1: 39300,
          x2: 39600,
          y1: -4290,
          y2: -4400,
          kind: "express",
          routeType: "boost",
          solidAtAnySpeed: true,
          entrySpeed: 19,
          cityType: "ruined-tunnel"
        },
        {
          id: "split-skyline-act2-194",
          x1: 39600,
          x2: 43e3,
          y1: -4400,
          y2: -4660,
          kind: "express",
          routeType: "boost",
          solidAtAnySpeed: true,
          entrySpeed: 19,
          boostExit: true,
          cityType: "ruined-tunnel"
        },
        {
          id: "split-skyline-act2-196",
          x1: 43e3,
          x2: 45690,
          y1: -4660,
          y2: -4750,
          kind: "express",
          routeType: "boost",
          solidAtAnySpeed: true,
          grindable: true,
          cityType: "grind-rail",
          boostExit: true
        },
        {
          id: "split-skyline-act2-197",
          x1: 38100,
          x2: 38900,
          y1: -3680,
          y2: -3680,
          kind: "lower",
          routeType: "lower",
          cityType: "ruined-walkway"
        },
        {
          id: "split-skyline-act2-198",
          x1: 39100,
          x2: 40100,
          y1: -3680,
          y2: -3750,
          kind: "lower",
          routeType: "lower",
          cityType: "ruined-walkway"
        },
        {
          id: "split-skyline-act2-199",
          x1: 40300,
          x2: 40800,
          y1: -3750,
          y2: -3750,
          kind: "lower",
          routeType: "lower",
          cityType: "ruined-walkway"
        },
        {
          id: "split-skyline-act2-200",
          x1: 41e3,
          x2: 41450,
          y1: -3850,
          y2: -3850,
          kind: "lower",
          routeType: "lower",
          cityType: "ruined-walkway"
        },
        {
          id: "split-skyline-act2-201",
          x1: 41640,
          x2: 42e3,
          y1: -3950,
          y2: -3950,
          kind: "lower",
          routeType: "lower",
          cityType: "ruined-walkway"
        },
        {
          id: "split-skyline-act2-202",
          x1: 42200,
          x2: 43300,
          y1: -3950,
          y2: -4050,
          kind: "lower",
          routeType: "lower",
          cityType: "ruined-walkway"
        },
        {
          id: "split-skyline-act2-205",
          x1: 43300,
          x2: 43800,
          y1: -4050,
          y2: -4050,
          kind: "main",
          cityType: "scaffold"
        },
        {
          id: "split-skyline-act2-206",
          x1: 43880,
          x2: 44110,
          y1: -4160,
          y2: -4160,
          kind: "main",
          roof: false,
          cityType: "billboard",
          facade: {
            x: 43820,
            y: -4685,
            bottom: -3830
          }
        },
        {
          id: "split-skyline-act2-207",
          x1: 44260,
          x2: 44560,
          y1: -4240,
          y2: -4240,
          kind: "main",
          roof: false,
          cityType: "fire-escape",
          facade: {
            x: 43820,
            y: -4685,
            bottom: -3830
          }
        },
        {
          id: "split-skyline-act2-208",
          x1: 44620,
          x2: 44840,
          y1: -4350,
          y2: -4350,
          kind: "moving",
          motion: {
            axis: "x",
            amp: 12,
            period: 210,
            phase: 0
          },
          cityType: "scaffold",
          facade: {
            x: 43820,
            y: -4685,
            bottom: -3830
          },
          roof: false
        },
        {
          id: "split-skyline-act2-209",
          x1: 44360,
          x2: 44610,
          y1: -4490,
          y2: -4490,
          kind: "main",
          roof: false,
          cityType: "billboard",
          facade: {
            x: 43820,
            y: -4685,
            bottom: -3830
          }
        },
        {
          id: "split-skyline-act2-210",
          x1: 44830,
          x2: 45090,
          y1: -4580,
          y2: -4580,
          kind: "crumble",
          roof: false,
          cityType: "broken-bridge",
          crumbleDelay: 110,
          crumbleTimer: -1,
          restoreAt: 0,
          facade: {
            x: 43820,
            y: -4685,
            bottom: -3830
          }
        },
        {
          id: "split-skyline-act2-211",
          x1: 45300,
          x2: 45580,
          y1: -4660,
          y2: -4660,
          kind: "main",
          roof: false,
          cityType: "rooftop",
          facade: {
            x: 43820,
            y: -4685,
            bottom: -3830
          }
        },
        {
          id: "split-skyline-act2-212",
          x1: 45690,
          x2: 46190,
          y1: -4750,
          y2: -4750,
          kind: "main",
          cityType: "fire-escape"
        },
        {
          id: "split-skyline-act2-213",
          x1: 43230,
          x2: 45110,
          y1: -3810,
          y2: -3810,
          kind: "lower",
          routeType: "lower",
          cityType: "ruined-walkway"
        },
        {
          id: "split-skyline-act2-214",
          x1: 45290,
          x2: 45510,
          y1: -3920,
          y2: -3920,
          kind: "lower",
          routeType: "lower",
          cityType: "ruined-walkway"
        },
        {
          id: "split-skyline-act2-216",
          x1: 45675,
          x2: 45720,
          y1: -4690,
          y2: -4690,
          kind: "main",
          wallCap: true,
          faceId: "split-skyline-tower-face-215",
          cityType: "tower-cap"
        },
        {
          id: "split-skyline-service-skyline-crown",
          x1: 45520,
          x2: 45790,
          y1: -4010,
          y2: -4010,
          kind: "lower",
          routeType: "lower",
          cityType: "fire-escape"
        },
        {
          id: "split-skyline-lift-service-skyline-crown",
          x1: 45880,
          x2: 46080,
          y1: -4342.5,
          y2: -4342.5,
          kind: "moving",
          routeType: "lower",
          cityType: "freight-lift",
          motion: {
            axis: "y",
            amp: 332.5,
            period: 420,
            phase: 1.5707963267948966
          }
        },
        {
          id: "split-skyline-act2-218",
          x1: 46190,
          x2: 46600,
          y1: -4750,
          y2: -4650,
          kind: "main",
          cityType: "concrete-ramp"
        },
        {
          id: "summit-entry",
          x1: 54790,
          x2: 55690,
          y1: -8390,
          y2: -8390,
          kind: "main",
          cityType: "highway"
        },
        {
          id: "city-climax-act2-220",
          x1: 55690,
          x2: 55990,
          y1: -8390,
          y2: -8540,
          kind: "main",
          cityType: "concrete-ramp"
        },
        {
          id: "city-climax-act2-221",
          x1: 55990,
          x2: 56690,
          y1: -8540,
          y2: -8540,
          kind: "main",
          cityType: "rooftop"
        },
        {
          id: "city-climax-act2-222",
          x1: 56290,
          x2: 56930,
          y1: -8540,
          y2: -8540,
          kind: "main",
          cityType: "fire-escape"
        },
        {
          id: "city-climax-act2-223",
          x1: 57280,
          x2: 57510,
          y1: -8585,
          y2: -8585,
          kind: "crumble",
          crumbleDelay: 55,
          crumbleTimer: -1,
          restoreAt: 0,
          cityType: "broken-bridge"
        },
        {
          id: "city-climax-act2-224",
          x1: 57930,
          x2: 58210,
          y1: -8520,
          y2: -8520,
          kind: "crumble",
          crumbleDelay: 55,
          crumbleTimer: -1,
          restoreAt: 0,
          cityType: "exposed-floor"
        },
        {
          id: "city-climax-act2-225",
          x1: 58490,
          x2: 58720,
          y1: -8600,
          y2: -8600,
          kind: "crumble",
          crumbleDelay: 55,
          crumbleTimer: -1,
          restoreAt: 0,
          cityType: "broken-bridge"
        },
        {
          id: "city-climax-act2-226",
          x1: 59020,
          x2: 59520,
          y1: -8540,
          y2: -8540,
          kind: "main",
          cityType: "fire-escape"
        },
        {
          id: "city-climax-act2-227",
          x1: 56890,
          x2: 57660,
          y1: -8290,
          y2: -8290,
          kind: "lower",
          routeType: "lower",
          cityType: "ruined-walkway"
        },
        {
          id: "city-climax-act2-228",
          x1: 57820,
          x2: 58430,
          y1: -8290,
          y2: -8290,
          kind: "lower",
          routeType: "lower",
          cityType: "ruined-walkway"
        },
        {
          id: "city-climax-act2-229",
          x1: 58590,
          x2: 58800,
          y1: -8380,
          y2: -8380,
          kind: "lower",
          routeType: "lower",
          cityType: "ruined-walkway"
        },
        {
          id: "city-climax-act2-230",
          x1: 58970,
          x2: 59200,
          y1: -8460,
          y2: -8460,
          kind: "lower",
          routeType: "lower",
          cityType: "ruined-walkway"
        },
        {
          id: "city-climax-act2-231",
          x1: 59520,
          x2: 59590,
          y1: -8540,
          y2: -8640,
          kind: "main",
          cityType: "concrete-ramp"
        },
        {
          id: "city-climax-act2-233",
          x1: 59590,
          x2: 60090,
          y1: -8640,
          y2: -8640,
          kind: "main",
          cityType: "fire-escape"
        },
        {
          id: "city-climax-act2-234",
          x1: 60170,
          x2: 60430,
          y1: -8730,
          y2: -8730,
          kind: "main",
          roof: false,
          cityType: "broken-bridge",
          facade: {
            x: 60110,
            y: -9275,
            bottom: -8420
          }
        },
        {
          id: "city-climax-act2-235",
          x1: 60500,
          x2: 60800,
          y1: -8850,
          y2: -8910,
          kind: "main",
          roof: false,
          cityType: "concrete-ramp",
          facade: {
            x: 60110,
            y: -9275,
            bottom: -8420
          }
        },
        {
          id: "city-climax-act2-236",
          x1: 60850,
          x2: 61100,
          y1: -8930,
          y2: -8930,
          kind: "moving",
          motion: {
            axis: "y",
            amp: 6,
            period: 210,
            phase: 0
          },
          cityType: "crane-hoist",
          facade: {
            x: 60110,
            y: -9275,
            bottom: -8420
          },
          roof: false
        },
        {
          id: "city-climax-act2-237",
          x1: 61110,
          x2: 61390,
          y1: -9070,
          y2: -9070,
          kind: "main",
          roof: false,
          cityType: "ventilation",
          facade: {
            x: 60110,
            y: -9275,
            bottom: -8420
          }
        },
        {
          id: "city-climax-act2-238",
          x1: 61440,
          x2: 61650,
          y1: -9160,
          y2: -9160,
          kind: "crumble",
          roof: false,
          cityType: "broken-bridge",
          crumbleDelay: 110,
          crumbleTimer: -1,
          restoreAt: 0,
          facade: {
            x: 60110,
            y: -9275,
            bottom: -8420
          }
        },
        {
          id: "city-climax-act2-239",
          x1: 61610,
          x2: 61870,
          y1: -9250,
          y2: -9250,
          kind: "main",
          roof: false,
          cityType: "rooftop",
          facade: {
            x: 60110,
            y: -9275,
            bottom: -8420
          }
        },
        {
          id: "city-climax-act2-240",
          x1: 61980,
          x2: 62480,
          y1: -9340,
          y2: -9340,
          kind: "main",
          cityType: "scaffold"
        },
        {
          id: "city-climax-act2-241",
          x1: 59520,
          x2: 61400,
          y1: -8400,
          y2: -8400,
          kind: "lower",
          routeType: "lower",
          cityType: "ruined-walkway"
        },
        {
          id: "city-climax-act2-242",
          x1: 61580,
          x2: 61800,
          y1: -8510,
          y2: -8510,
          kind: "lower",
          routeType: "lower",
          cityType: "ruined-walkway"
        },
        {
          id: "city-climax-act2-244",
          x1: 61965,
          x2: 62010,
          y1: -9280,
          y2: -9280,
          kind: "main",
          wallCap: true,
          faceId: "city-climax-tower-face-243",
          cityType: "tower-cap"
        },
        {
          id: "city-climax-service-collapse-pylon",
          x1: 61920,
          x2: 62080,
          y1: -8600,
          y2: -8600,
          kind: "lower",
          routeType: "lower",
          cityType: "ventilation"
        },
        {
          id: "city-climax-lift-service-collapse-pylon",
          x1: 62170,
          x2: 62370,
          y1: -8932.5,
          y2: -8932.5,
          kind: "moving",
          routeType: "lower",
          cityType: "freight-lift",
          motion: {
            axis: "y",
            amp: 332.5,
            period: 360,
            phase: 1.5707963267948966
          }
        },
        {
          id: "city-climax-act2-246",
          x1: 62480,
          x2: 62890,
          y1: -9340,
          y2: -9340,
          kind: "main",
          cityType: "scaffold"
        },
        {
          id: "city-climax-act2-247",
          x1: 62890,
          x2: 64090,
          y1: -9340,
          y2: -9340,
          kind: "main",
          cityType: "highway"
        },
        {
          id: "summit-arena",
          x1: 64090,
          x2: 65550,
          y1: -9340,
          y2: -9340,
          kind: "main",
          cityType: "rooftop"
        },
        {
          id: "blimp-entry",
          x1: 31931,
          x2: 31989,
          y1: -3320,
          y2: -3320,
          kind: "main",
          cityType: "blimp-anchor"
        },
        {
          id: "blimp-curve-0",
          x1: 30716,
          x2: 30816,
          y1: -3850,
          y2: -3770,
          kind: "main",
          cityType: "blimp"
        },
        {
          id: "blimp-curve-1",
          x1: 30816,
          x2: 30916,
          y1: -3770,
          y2: -3720,
          kind: "main",
          cityType: "blimp"
        },
        {
          id: "blimp-curve-2",
          x1: 30916,
          x2: 31016,
          y1: -3720,
          y2: -3700,
          kind: "main",
          cityType: "blimp"
        },
        {
          id: "blimp-curve-3",
          x1: 31016,
          x2: 31116,
          y1: -3700,
          y2: -3700,
          kind: "main",
          cityType: "blimp"
        },
        {
          id: "blimp-curve-4",
          x1: 31116,
          x2: 31216,
          y1: -3700,
          y2: -3720,
          kind: "main",
          cityType: "blimp"
        },
        {
          id: "blimp-curve-5",
          x1: 31216,
          x2: 31316,
          y1: -3720,
          y2: -3750,
          kind: "main",
          cityType: "blimp"
        },
        {
          id: "blimp-curve-6",
          x1: 31316,
          x2: 31416,
          y1: -3750,
          y2: -3780,
          kind: "main",
          cityType: "blimp"
        },
        {
          id: "blimp-curve-7",
          x1: 31416,
          x2: 31586,
          y1: -3780,
          y2: -3810,
          kind: "main",
          cityType: "blimp"
        },
        {
          id: "blimp-moving",
          x1: 29836,
          x2: 30336,
          y1: -3810,
          y2: -3810,
          kind: "moving",
          cityType: "blimp",
          motion: {
            type: "flight",
            axis: "x",
            distance: -710,
            speed: 3,
            startedAt: null
          }
        },
        {
          id: "blimp-reward",
          x1: 28386,
          x2: 29036,
          y1: -3690,
          y2: -3690,
          kind: "main",
          cityType: "blimp"
        },
        {
          id: "blimp-return-rail",
          x1: 30016,
          x2: 34800,
          y1: -4400,
          y2: -4400,
          kind: "express",
          cityType: "grind-rail",
          grindable: true,
          blimpRail: true
        },
        {
          id: "blimp-return-descent",
          x1: 34800,
          x2: 36500,
          y1: -4400,
          y2: -3900,
          kind: "express",
          cityType: "grind-rail",
          grindable: true,
          blimpRail: true
        }
      ],
      hazards: [
        {
          id: "teaching-glass",
          type: "breakable",
          x: 24360,
          y: -2072,
          w: 32,
          h: 132,
          floor: -1940,
          threshold: 20,
          boostOnly: true,
          style: "glass",
          secret: false,
          broken: false
        },
        {
          id: "glass-upper-face",
          type: "bulkhead",
          x: 24360,
          y: -2320,
          w: 32,
          h: 248
        },
        {
          id: "glass-lower-face",
          type: "bulkhead",
          x: 24360,
          y: -1940,
          w: 32,
          h: 550
        },
        {
          id: "draw-left-spikes",
          type: "spikes",
          x: 26730,
          y: -2545,
          w: 300,
          h: 25
        },
        {
          id: "draw-interior-wall",
          type: "breakable",
          x: 27690,
          y: -2542,
          w: 32,
          h: 132,
          floor: -2410,
          threshold: 20,
          boostOnly: true,
          style: "masonry",
          secret: false,
          broken: false
        },
        {
          id: "draw-right-duct",
          type: "bulkhead",
          x: 28100,
          y: -2930,
          w: 32,
          h: 520
        },
        {
          id: "draw-wall-upper",
          type: "bulkhead",
          x: 27690,
          y: -2950,
          w: 32,
          h: 408
        },
        {
          id: "draw-wall-lower",
          type: "bulkhead",
          x: 27690,
          y: -2410,
          w: 32,
          h: 700
        },
        {
          id: "secret-facade-wall",
          type: "breakable",
          x: 48040,
          y: -5172,
          w: 32,
          h: 132,
          floor: -5040,
          threshold: 20,
          boostOnly: true,
          style: "masonry",
          secret: true,
          broken: false
        },
        {
          id: "secret-climb-spike",
          type: "spikes",
          x: 47190,
          y: -5285,
          w: 50,
          h: 25
        },
        {
          id: "secret-upper-facade",
          type: "bulkhead",
          x: 48040,
          y: -5460,
          w: 32,
          h: 288
        },
        {
          id: "secret-lower-facade",
          type: "bulkhead",
          x: 48040,
          y: -5040,
          w: 32,
          h: 1300
        },
        {
          id: "under-attack-spike-1",
          type: "spikes",
          x: 865,
          y: 395,
          w: 70,
          h: 25
        },
        {
          id: "under-attack-tower-face-21",
          type: "bulkhead",
          x: 6075,
          y: -440,
          w: 45,
          h: 100
        },
        {
          id: "skyline-fork-tower-face-58",
          type: "bulkhead",
          x: 14755,
          y: -1290,
          w: 45,
          h: 100
        },
        {
          id: "split-skyline-crack-195",
          type: "breakable",
          x: 40800,
          y: -4603.764705882353,
          w: 52,
          h: 112,
          floor: -4491.764705882353,
          broken: false,
          threshold: 20
        },
        {
          id: "split-skyline-spike-204",
          type: "spikes",
          x: 41662.5,
          y: -3975,
          w: 55,
          h: 25
        },
        {
          id: "split-skyline-tower-face-215",
          type: "bulkhead",
          x: 45675,
          y: -4690,
          w: 45,
          h: 100
        },
        {
          id: "city-climax-tower-face-243",
          type: "bulkhead",
          x: 61965,
          y: -9280,
          w: 45,
          h: 100
        }
      ],
      enemies: [
        {
          id: "approach-guard",
          x: 18110,
          base: 18110,
          y: -1528,
          baseY: -1528,
          kind: "crab",
          range: 65,
          rebound: false
        },
        {
          id: "hall-guard-1",
          x: 34800,
          base: 34800,
          y: -3808,
          baseY: -3808,
          kind: "crab",
          range: 8
        },
        {
          id: "hall-guard-2",
          x: 35740,
          base: 35740,
          y: -3808,
          baseY: -3808,
          kind: "crab",
          range: 8
        },
        {
          id: "fracture-drone",
          x: 53200,
          base: 53200,
          y: -7368,
          baseY: -7368,
          kind: "drone",
          range: 12
        },
        {
          id: "under-attack-a2bot-5",
          x: 2760,
          base: 2760,
          y: 232,
          baseY: 232,
          kind: "crab",
          range: 14
        },
        {
          id: "under-attack-a2bot-25",
          x: 6940,
          base: 6940,
          y: -518,
          baseY: -518,
          kind: "crab",
          range: 14
        },
        {
          id: "under-attack-a2bot-265",
          x: 3500,
          base: 3500,
          y: 82,
          baseY: 82,
          kind: "crab",
          range: 14
        },
        {
          id: "skyline-fork-a2bot-39",
          x: 11680,
          base: 11680,
          y: -828,
          baseY: -828,
          kind: "drone",
          range: 24,
          bounceRoute: true
        },
        {
          id: "skyline-fork-a2bot-47",
          x: 11300,
          base: 11300,
          y: -336,
          baseY: -336,
          kind: "crab",
          range: 14
        },
        {
          id: "skyline-fork-a2bot-266",
          x: 9e3,
          base: 9e3,
          y: -468,
          baseY: -468,
          kind: "crab",
          range: 14
        },
        {
          id: "skyline-fork-a2bot-267",
          x: 11470,
          base: 11470,
          y: -628,
          baseY: -628,
          kind: "crab",
          range: 14
        },
        {
          id: "skyline-fork-a2bot-268",
          x: 12780,
          base: 12780,
          y: -588,
          baseY: -588,
          kind: "crab",
          range: 14
        },
        {
          id: "split-skyline-a2bot-191",
          x: 39900,
          base: 39900,
          y: -4278,
          baseY: -4278,
          kind: "drone",
          range: 24,
          bounceRoute: true
        },
        {
          id: "split-skyline-a2bot-192",
          x: 41900,
          base: 41900,
          y: -4288,
          baseY: -4288,
          kind: "crab",
          range: 14
        },
        {
          id: "split-skyline-a2bot-203",
          x: 40600,
          base: 40600,
          y: -3768,
          baseY: -3768,
          kind: "crab",
          range: 14
        },
        {
          id: "split-skyline-a2bot-280",
          x: 36800,
          base: 36800,
          y: -3918,
          baseY: -3918,
          kind: "crab",
          range: 14
        },
        {
          id: "split-skyline-a2bot-281",
          x: 38800,
          base: 38800,
          y: -4048,
          baseY: -4048,
          kind: "crab",
          range: 14
        },
        {
          id: "split-skyline-a2bot-282",
          x: 40900,
          base: 40900,
          y: -4038,
          baseY: -4038,
          kind: "crab",
          range: 14
        },
        {
          id: "split-skyline-a2bot-283",
          x: 41900,
          base: 41900,
          y: -4118,
          baseY: -4118,
          kind: "crab",
          range: 14
        },
        {
          id: "split-skyline-a2bot-284",
          x: 43e3,
          base: 43e3,
          y: -4068,
          baseY: -4068,
          kind: "crab",
          range: 14
        },
        {
          id: "split-skyline-a2bot-292",
          x: 44600,
          base: 44600,
          y: -4438,
          baseY: -4438,
          kind: "drone",
          range: 10,
          bounceRoute: true
        },
        {
          id: "city-climax-a2bot-285",
          x: 55190,
          base: 55190,
          y: -8408,
          baseY: -8408,
          kind: "crab",
          range: 14
        },
        {
          id: "city-climax-a2bot-286",
          x: 56390,
          base: 56390,
          y: -8558,
          baseY: -8558,
          kind: "crab",
          range: 14
        },
        {
          id: "city-climax-a2bot-287",
          x: 59390,
          base: 59390,
          y: -8608,
          baseY: -8608,
          kind: "crab",
          range: 14
        },
        {
          id: "city-climax-a2bot-288",
          x: 63090,
          base: 63090,
          y: -9358,
          baseY: -9358,
          kind: "crab",
          range: 14
        },
        {
          id: "city-climax-a2bot-293",
          x: 60890,
          base: 60890,
          y: -9028,
          baseY: -9028,
          kind: "drone",
          range: 10,
          bounceRoute: true
        }
      ],
      pads: [
        {
          id: "momentum-vent",
          x: 19200,
          y: -1640,
          cityVent: true,
          surfaceId: "vent-entry",
          power: 18.8,
          targetId: "vent-upper-roof"
        },
        {
          id: "draw-downhill-vent",
          x: 25490,
          y: -1680,
          cityVent: true,
          surfaceId: "draw-downhill",
          power: 29,
          targetId: "draw-fire-escape-1"
        },
        {
          id: "draw-interior-vent",
          x: 27970,
          y: -2410,
          cityVent: true,
          surfaceId: "draw-interior-room",
          power: 29,
          targetId: "draw-checkpoint-roof",
          sealedBy: "draw-interior-wall"
        },
        {
          id: "draw-drop-vent",
          x: 28800,
          y: -2790,
          cityVent: true,
          surfaceId: "draw-drop-vent-roof",
          power: 25.5,
          targetId: "draw-loop-roof"
        },
        {
          id: "draw-hidden-pit-vent",
          x: 34220,
          y: -2840,
          cityVent: true,
          surfaceId: "draw-hidden-pit-grate",
          power: 36,
          targetId: "draw-hazard-hall",
          hidden: true,
          pitSecret: true
        },
        {
          id: "neon-roof-vent",
          x: 51760,
          y: -6430,
          cityVent: true,
          surfaceId: "neon-vent-roof",
          power: 31,
          targetId: "neon-high-crown",
          airSpeedLimit: 6.5
        },
        {
          id: "fracture-high-vent",
          x: 54380,
          y: -7750,
          cityVent: true,
          surfaceId: "fracture-vent-roof",
          power: 31,
          targetId: "summit-entry"
        }
      ],
      springs: [
        {
          id: "vent-lower-spring",
          x: 21050,
          y: -1490,
          surfaceId: "vent-lower-3",
          power: 17.2
        },
        {
          id: "blimp-entry-spring",
          surfaceId: "blimp-entry",
          x: 31960,
          y: -3320,
          power: 21,
          launchX: -20
        },
        {
          id: "blimp-return-spring",
          surfaceId: "blimp-reward",
          x: 28416,
          y: -3690,
          power: 32,
          launchX: 28
        }
      ],
      rings: [
        {
          x: 30330,
          y: -2774,
          taken: false
        },
        {
          x: 30370.5644438307,
          y: -2782.0687695538036,
          taken: false
        },
        {
          x: 30404.953318805776,
          y: -2805.046681194226,
          taken: false
        },
        {
          x: 30427.931230446196,
          y: -2839.4355561693005,
          taken: false
        },
        {
          x: 30436,
          y: -2880,
          taken: false
        },
        {
          x: 30427.931230446196,
          y: -2920.5644438306995,
          taken: false
        },
        {
          x: 30404.953318805776,
          y: -2954.953318805774,
          taken: false
        },
        {
          x: 30370.5644438307,
          y: -2977.9312304461964,
          taken: false
        },
        {
          x: 30330,
          y: -2986,
          taken: false
        },
        {
          x: 30289.4355561693,
          y: -2977.9312304461964,
          taken: false
        },
        {
          x: 30255.046681194224,
          y: -2954.953318805774,
          taken: false
        },
        {
          x: 30232.068769553804,
          y: -2920.5644438306995,
          taken: false
        },
        {
          x: 30224,
          y: -2880,
          taken: false
        },
        {
          x: 30232.068769553804,
          y: -2839.4355561693005,
          taken: false
        },
        {
          x: 30255.046681194224,
          y: -2805.046681194226,
          taken: false
        },
        {
          x: 30289.4355561693,
          y: -2782.0687695538036,
          taken: false
        },
        {
          x: 30860,
          y: -2824,
          taken: false
        },
        {
          x: 30887.17052369792,
          y: -2829.4045531916986,
          taken: false
        },
        {
          x: 30910.204581464244,
          y: -2844.795418535755,
          taken: false
        },
        {
          x: 30925.5954468083,
          y: -2867.8294763020785,
          taken: false
        },
        {
          x: 30931,
          y: -2895,
          taken: false
        },
        {
          x: 30925.5954468083,
          y: -2922.1705236979215,
          taken: false
        },
        {
          x: 30910.204581464244,
          y: -2945.204581464245,
          taken: false
        },
        {
          x: 30887.17052369792,
          y: -2960.5954468083014,
          taken: false
        },
        {
          x: 30860,
          y: -2966,
          taken: false
        },
        {
          x: 30832.82947630208,
          y: -2960.5954468083014,
          taken: false
        },
        {
          x: 30809.795418535756,
          y: -2945.204581464245,
          taken: false
        },
        {
          x: 30794.4045531917,
          y: -2922.1705236979215,
          taken: false
        },
        {
          x: 30789,
          y: -2895,
          taken: false
        },
        {
          x: 30794.4045531917,
          y: -2867.8294763020785,
          taken: false
        },
        {
          x: 30809.795418535756,
          y: -2844.795418535755,
          taken: false
        },
        {
          x: 30832.82947630208,
          y: -2829.4045531916986,
          taken: false
        },
        {
          x: 300,
          y: 382,
          taken: false
        },
        {
          x: 385,
          y: 382,
          taken: false
        },
        {
          x: 470,
          y: 382,
          taken: false
        },
        {
          x: 555,
          y: 382,
          taken: false
        },
        {
          x: 640,
          y: 382,
          taken: false
        },
        {
          x: 4615,
          y: -28,
          taken: false
        },
        {
          x: 4680,
          y: -28,
          taken: false
        },
        {
          x: 4745,
          y: -28,
          taken: false
        },
        {
          x: 4885,
          y: -168,
          taken: false
        },
        {
          x: 4950,
          y: -168,
          taken: false
        },
        {
          x: 5015,
          y: -168,
          taken: false
        },
        {
          x: 5265,
          y: -248,
          taken: false
        },
        {
          x: 5330,
          y: -248,
          taken: false
        },
        {
          x: 5395,
          y: -248,
          taken: false
        },
        {
          x: 5460,
          y: -248,
          taken: false
        },
        {
          x: 5575,
          y: -358,
          taken: false
        },
        {
          x: 5640,
          y: -358,
          taken: false
        },
        {
          x: 5705,
          y: -358,
          taken: false
        },
        {
          x: 5825,
          y: -448,
          taken: false
        },
        {
          x: 5890,
          y: -448,
          taken: false
        },
        {
          x: 5955,
          y: -448,
          taken: false
        },
        {
          x: 6020,
          y: -448,
          taken: false
        },
        {
          x: 155,
          y: 382,
          taken: false
        },
        {
          x: 210,
          y: 382,
          taken: false
        },
        {
          x: 265,
          y: 382,
          taken: false
        },
        {
          x: 320,
          y: 382,
          taken: false
        },
        {
          x: 375,
          y: 382,
          taken: false
        },
        {
          x: 6255,
          y: -538,
          taken: false
        },
        {
          x: 6310,
          y: -538,
          taken: false
        },
        {
          x: 6365,
          y: -538,
          taken: false
        },
        {
          x: 6420,
          y: -538,
          taken: false
        },
        {
          x: 6475,
          y: -538,
          taken: false
        },
        {
          x: 10200,
          y: -800,
          taken: false
        },
        {
          x: 10285,
          y: -800,
          taken: false
        },
        {
          x: 10370,
          y: -800,
          taken: false
        },
        {
          x: 10455,
          y: -800,
          taken: false
        },
        {
          x: 10540,
          y: -800,
          taken: false
        },
        {
          x: 10625,
          y: -800,
          taken: false
        },
        {
          x: 10710,
          y: -800,
          taken: false
        },
        {
          x: 14195,
          y: -788,
          taken: false
        },
        {
          x: 14260,
          y: -788,
          taken: false
        },
        {
          x: 14325,
          y: -788,
          taken: false
        },
        {
          x: 14485,
          y: -888,
          taken: false
        },
        {
          x: 14550,
          y: -888,
          taken: false
        },
        {
          x: 14615,
          y: -888,
          taken: false
        },
        {
          x: 14195,
          y: -988,
          taken: false
        },
        {
          x: 14260,
          y: -988,
          taken: false
        },
        {
          x: 14325,
          y: -988,
          taken: false
        },
        {
          x: 13895,
          y: -1088,
          taken: false
        },
        {
          x: 13960,
          y: -1088,
          taken: false
        },
        {
          x: 14025,
          y: -1088,
          taken: false
        },
        {
          x: 14195,
          y: -1188,
          taken: false
        },
        {
          x: 14260,
          y: -1188,
          taken: false
        },
        {
          x: 14325,
          y: -1188,
          taken: false
        },
        {
          x: 14485,
          y: -1288,
          taken: false
        },
        {
          x: 14550,
          y: -1288,
          taken: false
        },
        {
          x: 14615,
          y: -1288,
          taken: false
        },
        {
          x: 8655,
          y: -488,
          taken: false
        },
        {
          x: 8710,
          y: -488,
          taken: false
        },
        {
          x: 8765,
          y: -488,
          taken: false
        },
        {
          x: 8820,
          y: -488,
          taken: false
        },
        {
          x: 8875,
          y: -488,
          taken: false
        },
        {
          x: 14935,
          y: -1388,
          taken: false
        },
        {
          x: 14990,
          y: -1388,
          taken: false
        },
        {
          x: 15045,
          y: -1388,
          taken: false
        },
        {
          x: 15100,
          y: -1388,
          taken: false
        },
        {
          x: 15155,
          y: -1388,
          taken: false
        },
        {
          x: 38600,
          y: -4240,
          taken: false
        },
        {
          x: 38685,
          y: -4240,
          taken: false
        },
        {
          x: 38770,
          y: -4240,
          taken: false
        },
        {
          x: 38855,
          y: -4240,
          taken: false
        },
        {
          x: 38940,
          y: -4240,
          taken: false
        },
        {
          x: 39025,
          y: -4240,
          taken: false
        },
        {
          x: 39900,
          y: -4460.941176470588,
          taken: false
        },
        {
          x: 40035,
          y: -4471.264705882353,
          taken: false
        },
        {
          x: 40170,
          y: -4481.588235294118,
          taken: false
        },
        {
          x: 40305,
          y: -4491.911764705882,
          taken: false
        },
        {
          x: 40440,
          y: -4502.235294117647,
          taken: false
        },
        {
          x: 40575,
          y: -4512.558823529412,
          taken: false
        },
        {
          x: 40710,
          y: -4522.882352941177,
          taken: false
        },
        {
          x: 40845,
          y: -4533.205882352941,
          taken: false
        },
        {
          x: 40980,
          y: -4543.529411764706,
          taken: false
        },
        {
          x: 41115,
          y: -4553.85294117647,
          taken: false
        },
        {
          x: 41250,
          y: -4564.176470588235,
          taken: false
        },
        {
          x: 41385,
          y: -4574.5,
          taken: false
        },
        {
          x: 41520,
          y: -4584.823529411765,
          taken: false
        },
        {
          x: 41655,
          y: -4595.14705882353,
          taken: false
        },
        {
          x: 41790,
          y: -4605.470588235294,
          taken: false
        },
        {
          x: 41925,
          y: -4615.794117647059,
          taken: false
        },
        {
          x: 42060,
          y: -4626.117647058823,
          taken: false
        },
        {
          x: 42195,
          y: -4636.441176470588,
          taken: false
        },
        {
          x: 42330,
          y: -4646.764705882353,
          taken: false
        },
        {
          x: 42465,
          y: -4657.088235294118,
          taken: false
        },
        {
          x: 42600,
          y: -4667.411764705882,
          taken: false
        },
        {
          x: 42735,
          y: -4677.735294117647,
          taken: false
        },
        {
          x: 43915,
          y: -4198,
          taken: false
        },
        {
          x: 43980,
          y: -4198,
          taken: false
        },
        {
          x: 44045,
          y: -4198,
          taken: false
        },
        {
          x: 44295,
          y: -4278,
          taken: false
        },
        {
          x: 44360,
          y: -4278,
          taken: false
        },
        {
          x: 44425,
          y: -4278,
          taken: false
        },
        {
          x: 44490,
          y: -4278,
          taken: false
        },
        {
          x: 44655,
          y: -4388,
          taken: false
        },
        {
          x: 44720,
          y: -4388,
          taken: false
        },
        {
          x: 44785,
          y: -4388,
          taken: false
        },
        {
          x: 44395,
          y: -4528,
          taken: false
        },
        {
          x: 44460,
          y: -4528,
          taken: false
        },
        {
          x: 44525,
          y: -4528,
          taken: false
        },
        {
          x: 44865,
          y: -4618,
          taken: false
        },
        {
          x: 44930,
          y: -4618,
          taken: false
        },
        {
          x: 44995,
          y: -4618,
          taken: false
        },
        {
          x: 45060,
          y: -4618,
          taken: false
        },
        {
          x: 45335,
          y: -4698,
          taken: false
        },
        {
          x: 45400,
          y: -4698,
          taken: false
        },
        {
          x: 45465,
          y: -4698,
          taken: false
        },
        {
          x: 45530,
          y: -4698,
          taken: false
        },
        {
          x: 36655,
          y: -3938,
          taken: false
        },
        {
          x: 36710,
          y: -3938,
          taken: false
        },
        {
          x: 36765,
          y: -3938,
          taken: false
        },
        {
          x: 36820,
          y: -3938,
          taken: false
        },
        {
          x: 36875,
          y: -3938,
          taken: false
        },
        {
          x: 45855,
          y: -4788,
          taken: false
        },
        {
          x: 45910,
          y: -4788,
          taken: false
        },
        {
          x: 45965,
          y: -4788,
          taken: false
        },
        {
          x: 46020,
          y: -4788,
          taken: false
        },
        {
          x: 46075,
          y: -4788,
          taken: false
        },
        {
          x: 57315,
          y: -8625,
          taken: false
        },
        {
          x: 57380,
          y: -8625,
          taken: false
        },
        {
          x: 57445,
          y: -8625,
          taken: false
        },
        {
          x: 57965,
          y: -8560,
          taken: false
        },
        {
          x: 58030,
          y: -8560,
          taken: false
        },
        {
          x: 58095,
          y: -8560,
          taken: false
        },
        {
          x: 58160,
          y: -8560,
          taken: false
        },
        {
          x: 58525,
          y: -8640,
          taken: false
        },
        {
          x: 58590,
          y: -8640,
          taken: false
        },
        {
          x: 58655,
          y: -8640,
          taken: false
        },
        {
          x: 60205,
          y: -8768,
          taken: false
        },
        {
          x: 60270,
          y: -8768,
          taken: false
        },
        {
          x: 60335,
          y: -8768,
          taken: false
        },
        {
          x: 60400,
          y: -8768,
          taken: false
        },
        {
          x: 60535,
          y: -8888,
          taken: false
        },
        {
          x: 60600,
          y: -8888,
          taken: false
        },
        {
          x: 60665,
          y: -8888,
          taken: false
        },
        {
          x: 60730,
          y: -8888,
          taken: false
        },
        {
          x: 60885,
          y: -8968,
          taken: false
        },
        {
          x: 60950,
          y: -8968,
          taken: false
        },
        {
          x: 61015,
          y: -8968,
          taken: false
        },
        {
          x: 61145,
          y: -9108,
          taken: false
        },
        {
          x: 61210,
          y: -9108,
          taken: false
        },
        {
          x: 61275,
          y: -9108,
          taken: false
        },
        {
          x: 61340,
          y: -9108,
          taken: false
        },
        {
          x: 61475,
          y: -9198,
          taken: false
        },
        {
          x: 61540,
          y: -9198,
          taken: false
        },
        {
          x: 61605,
          y: -9198,
          taken: false
        },
        {
          x: 61645,
          y: -9288,
          taken: false
        },
        {
          x: 61710,
          y: -9288,
          taken: false
        },
        {
          x: 61775,
          y: -9288,
          taken: false
        },
        {
          x: 61840,
          y: -9288,
          taken: false
        },
        {
          x: 63590,
          y: -9365,
          taken: false
        },
        {
          x: 63616.40515683319,
          y: -9370.252312256722,
          taken: false
        },
        {
          x: 63638.79036790188,
          y: -9385.209632098129,
          taken: false
        },
        {
          x: 63653.74768774328,
          y: -9407.594843166808,
          taken: false
        },
        {
          x: 63659,
          y: -9434,
          taken: false
        },
        {
          x: 63653.74768774328,
          y: -9460.405156833192,
          taken: false
        },
        {
          x: 63638.79036790188,
          y: -9482.790367901871,
          taken: false
        },
        {
          x: 63616.40515683319,
          y: -9497.747687743278,
          taken: false
        },
        {
          x: 63590,
          y: -9503,
          taken: false
        },
        {
          x: 63563.59484316681,
          y: -9497.747687743278,
          taken: false
        },
        {
          x: 63541.20963209812,
          y: -9482.790367901871,
          taken: false
        },
        {
          x: 63526.25231225672,
          y: -9460.405156833192,
          taken: false
        },
        {
          x: 63521,
          y: -9434,
          taken: false
        },
        {
          x: 63526.25231225672,
          y: -9407.594843166808,
          taken: false
        },
        {
          x: 63541.20963209812,
          y: -9385.209632098129,
          taken: false
        },
        {
          x: 63563.59484316681,
          y: -9370.252312256722,
          taken: false
        },
        {
          x: 54945,
          y: -8428,
          taken: false
        },
        {
          x: 55e3,
          y: -8428,
          taken: false
        },
        {
          x: 55055,
          y: -8428,
          taken: false
        },
        {
          x: 55110,
          y: -8428,
          taken: false
        },
        {
          x: 55165,
          y: -8428,
          taken: false
        },
        {
          x: 62145,
          y: -9378,
          taken: false
        },
        {
          x: 62200,
          y: -9378,
          taken: false
        },
        {
          x: 62255,
          y: -9378,
          taken: false
        },
        {
          x: 62310,
          y: -9378,
          taken: false
        },
        {
          x: 62365,
          y: -9378,
          taken: false
        },
        {
          x: 28756,
          y: -3728,
          taken: false
        },
        {
          x: 28832,
          y: -3728,
          taken: false
        },
        {
          x: 28908,
          y: -3728,
          taken: false
        },
        {
          x: 28984,
          y: -3728,
          taken: false
        },
        {
          x: 16540,
          y: -1338,
          taken: false
        },
        {
          x: 16640,
          y: -1338,
          taken: false
        },
        {
          x: 16740,
          y: -1338,
          taken: false
        },
        {
          x: 16840,
          y: -1338,
          taken: false
        },
        {
          x: 16940,
          y: -1338,
          taken: false
        },
        {
          x: 17040,
          y: -1338,
          taken: false
        },
        {
          x: 17140,
          y: -1338,
          taken: false
        },
        {
          x: 17420,
          y: -1438,
          taken: false
        },
        {
          x: 17488,
          y: -1438,
          taken: false
        },
        {
          x: 17556,
          y: -1438,
          taken: false
        },
        {
          x: 17624,
          y: -1438,
          taken: false
        },
        {
          x: 17930,
          y: -1548,
          taken: false
        },
        {
          x: 17998,
          y: -1548,
          taken: false
        },
        {
          x: 18066,
          y: -1548,
          taken: false
        },
        {
          x: 18134,
          y: -1548,
          taken: false
        },
        {
          x: 18202,
          y: -1548,
          taken: false
        },
        {
          x: 18450,
          y: -1658,
          taken: false
        },
        {
          x: 18518,
          y: -1658,
          taken: false
        },
        {
          x: 18586,
          y: -1658,
          taken: false
        },
        {
          x: 18654,
          y: -1658,
          taken: false
        },
        {
          x: 18722,
          y: -1658,
          taken: false
        },
        {
          x: 19e3,
          y: -1678,
          taken: false
        },
        {
          x: 19068,
          y: -1678,
          taken: false
        },
        {
          x: 19136,
          y: -1678,
          taken: false
        },
        {
          x: 19204,
          y: -1678,
          taken: false
        },
        {
          x: 19272,
          y: -1678,
          taken: false
        },
        {
          x: 19340,
          y: -1678,
          taken: false
        },
        {
          x: 19890,
          y: -1858,
          taken: false
        },
        {
          x: 19990,
          y: -1858,
          taken: false
        },
        {
          x: 20090,
          y: -1858,
          taken: false
        },
        {
          x: 20190,
          y: -1858,
          taken: false
        },
        {
          x: 20290,
          y: -1858,
          taken: false
        },
        {
          x: 20390,
          y: -1858,
          taken: false
        },
        {
          x: 20490,
          y: -1858,
          taken: false
        },
        {
          x: 20590,
          y: -1858,
          taken: false
        },
        {
          x: 20690,
          y: -1858,
          taken: false
        },
        {
          x: 20790,
          y: -1858,
          taken: false
        },
        {
          x: 20890,
          y: -1858,
          taken: false
        },
        {
          x: 20990,
          y: -1858,
          taken: false
        },
        {
          x: 20560,
          y: -1898,
          taken: false
        },
        {
          x: 20628,
          y: -1898,
          taken: false
        },
        {
          x: 20696,
          y: -1898,
          taken: false
        },
        {
          x: 20764,
          y: -1898,
          taken: false
        },
        {
          x: 20832,
          y: -1898,
          taken: false
        },
        {
          x: 21090,
          y: -1838,
          taken: false
        },
        {
          x: 21158,
          y: -1838,
          taken: false
        },
        {
          x: 21226,
          y: -1838,
          taken: false
        },
        {
          x: 21294,
          y: -1838,
          taken: false
        },
        {
          x: 21362,
          y: -1838,
          taken: false
        },
        {
          x: 21600,
          y: -1678,
          taken: false
        },
        {
          x: 21668,
          y: -1678,
          taken: false
        },
        {
          x: 21736,
          y: -1678,
          taken: false
        },
        {
          x: 21804,
          y: -1678,
          taken: false
        },
        {
          x: 21872,
          y: -1678,
          taken: false
        },
        {
          x: 19610,
          y: -1508,
          taken: false
        },
        {
          x: 19710,
          y: -1508,
          taken: false
        },
        {
          x: 19810,
          y: -1508,
          taken: false
        },
        {
          x: 19910,
          y: -1508,
          taken: false
        },
        {
          x: 20010,
          y: -1508,
          taken: false
        },
        {
          x: 20110,
          y: -1508,
          taken: false
        },
        {
          x: 20210,
          y: -1508,
          taken: false
        },
        {
          x: 20440,
          y: -1448,
          taken: false
        },
        {
          x: 20508,
          y: -1448,
          taken: false
        },
        {
          x: 20576,
          y: -1448,
          taken: false
        },
        {
          x: 20880,
          y: -1528,
          taken: false
        },
        {
          x: 20948,
          y: -1528,
          taken: false
        },
        {
          x: 21016,
          y: -1528,
          taken: false
        },
        {
          x: 21400,
          y: -1625.5,
          taken: false
        },
        {
          x: 21468,
          y: -1625.5,
          taken: false
        },
        {
          x: 21536,
          y: -1625.5,
          taken: false
        },
        {
          x: 21604,
          y: -1625.5,
          taken: false
        },
        {
          x: 21672,
          y: -1625.5,
          taken: false
        },
        {
          x: 21990,
          y: -1678,
          taken: false
        },
        {
          x: 22058,
          y: -1678,
          taken: false
        },
        {
          x: 22126,
          y: -1678,
          taken: false
        },
        {
          x: 22194,
          y: -1678,
          taken: false
        },
        {
          x: 22262,
          y: -1678,
          taken: false
        },
        {
          x: 22330,
          y: -1678,
          taken: false
        },
        {
          x: 22398,
          y: -1678,
          taken: false
        },
        {
          x: 22466,
          y: -1678,
          taken: false
        },
        {
          x: 22780,
          y: -1778,
          taken: false
        },
        {
          x: 22848,
          y: -1778,
          taken: false
        },
        {
          x: 22916,
          y: -1778,
          taken: false
        },
        {
          x: 22984,
          y: -1778,
          taken: false
        },
        {
          x: 23300,
          y: -1878,
          taken: false
        },
        {
          x: 23368,
          y: -1878,
          taken: false
        },
        {
          x: 23436,
          y: -1878,
          taken: false
        },
        {
          x: 23504,
          y: -1878,
          taken: false
        },
        {
          x: 23820,
          y: -1978,
          taken: false
        },
        {
          x: 23888,
          y: -1978,
          taken: false
        },
        {
          x: 23956,
          y: -1978,
          taken: false
        },
        {
          x: 24024,
          y: -1978,
          taken: false
        },
        {
          x: 24092,
          y: -1978,
          taken: false
        },
        {
          x: 24160,
          y: -1978,
          taken: false
        },
        {
          x: 24228,
          y: -1978,
          taken: false
        },
        {
          x: 24296,
          y: -1978,
          taken: false
        },
        {
          x: 24400,
          y: -1978,
          taken: false,
          sealedBy: "teaching-glass"
        },
        {
          x: 24468,
          y: -1978,
          taken: false,
          sealedBy: "teaching-glass"
        },
        {
          x: 24536,
          y: -1978,
          taken: false,
          sealedBy: "teaching-glass"
        },
        {
          x: 24604,
          y: -1978,
          taken: false,
          sealedBy: "teaching-glass"
        },
        {
          x: 24672,
          y: -1978,
          taken: false,
          sealedBy: "teaching-glass"
        },
        {
          x: 24740,
          y: -1978,
          taken: false,
          sealedBy: "teaching-glass"
        },
        {
          x: 24808,
          y: -1978,
          taken: false,
          sealedBy: "teaching-glass"
        },
        {
          x: 24880,
          y: -1962,
          taken: false,
          sealedBy: "teaching-glass"
        },
        {
          x: 24980,
          y: -1922,
          taken: false,
          sealedBy: "teaching-glass"
        },
        {
          x: 25080,
          y: -1882,
          taken: false,
          sealedBy: "teaching-glass"
        },
        {
          x: 25180,
          y: -1842,
          taken: false,
          sealedBy: "teaching-glass"
        },
        {
          x: 25280,
          y: -1802,
          taken: false,
          sealedBy: "teaching-glass"
        },
        {
          x: 25380,
          y: -1762,
          taken: false,
          sealedBy: "teaching-glass"
        },
        {
          x: 25480,
          y: -1722,
          taken: false,
          sealedBy: "teaching-glass"
        },
        {
          x: 26480,
          y: -2228,
          taken: false
        },
        {
          x: 26580,
          y: -2228,
          taken: false
        },
        {
          x: 26680,
          y: -2228,
          taken: false
        },
        {
          x: 26780,
          y: -2228,
          taken: false
        },
        {
          x: 26880,
          y: -2228,
          taken: false
        },
        {
          x: 26980,
          y: -2228,
          taken: false
        },
        {
          x: 27080,
          y: -2228,
          taken: false
        },
        {
          x: 27180,
          y: -2228,
          taken: false
        },
        {
          x: 27280,
          y: -2228,
          taken: false
        },
        {
          x: 27380,
          y: -2228,
          taken: false
        },
        {
          x: 27480,
          y: -2228,
          taken: false
        },
        {
          x: 27580,
          y: -2228,
          taken: false
        },
        {
          x: 26680,
          y: -2338,
          taken: false
        },
        {
          x: 26748,
          y: -2338,
          taken: false
        },
        {
          x: 26816,
          y: -2338,
          taken: false
        },
        {
          x: 26884,
          y: -2338,
          taken: false
        },
        {
          x: 27240,
          y: -2448,
          taken: false
        },
        {
          x: 27308,
          y: -2448,
          taken: false
        },
        {
          x: 27376,
          y: -2448,
          taken: false
        },
        {
          x: 27444,
          y: -2448,
          taken: false
        },
        {
          x: 27512,
          y: -2448,
          taken: false
        },
        {
          x: 27580,
          y: -2448,
          taken: false
        },
        {
          x: 27648,
          y: -2448,
          taken: false
        },
        {
          x: 26770,
          y: -2558,
          taken: false
        },
        {
          x: 26838,
          y: -2558,
          taken: false
        },
        {
          x: 26906,
          y: -2558,
          taken: false
        },
        {
          x: 26974,
          y: -2558,
          taken: false
        },
        {
          x: 27730,
          y: -2448,
          taken: false,
          sealedBy: "draw-interior-wall"
        },
        {
          x: 27798,
          y: -2448,
          taken: false,
          sealedBy: "draw-interior-wall"
        },
        {
          x: 27866,
          y: -2448,
          taken: false,
          sealedBy: "draw-interior-wall"
        },
        {
          x: 27934,
          y: -2448,
          taken: false,
          sealedBy: "draw-interior-wall"
        },
        {
          x: 28002,
          y: -2448,
          taken: false,
          sealedBy: "draw-interior-wall"
        },
        {
          x: 28070,
          y: -2448,
          taken: false,
          sealedBy: "draw-interior-wall"
        },
        {
          x: 27730,
          y: -2988,
          taken: false
        },
        {
          x: 27830,
          y: -2988,
          taken: false
        },
        {
          x: 27930,
          y: -2988,
          taken: false
        },
        {
          x: 28030,
          y: -2988,
          taken: false
        },
        {
          x: 28130,
          y: -2988,
          taken: false
        },
        {
          x: 28230,
          y: -2988,
          taken: false
        },
        {
          x: 28330,
          y: -2988,
          taken: false
        },
        {
          x: 28430,
          y: -2988,
          taken: false
        },
        {
          x: 28660,
          y: -2828,
          taken: false
        },
        {
          x: 28728,
          y: -2828,
          taken: false
        },
        {
          x: 28796,
          y: -2828,
          taken: false
        },
        {
          x: 28864,
          y: -2828,
          taken: false
        },
        {
          x: 28932,
          y: -2828,
          taken: false
        },
        {
          x: 29540,
          y: -3258,
          taken: false
        },
        {
          x: 29608,
          y: -3258,
          taken: false
        },
        {
          x: 29676,
          y: -3258,
          taken: false
        },
        {
          x: 29744,
          y: -3258,
          taken: false
        },
        {
          x: 29812,
          y: -3258,
          taken: false
        },
        {
          x: 29880,
          y: -3258,
          taken: false
        },
        {
          x: 29948,
          y: -3258,
          taken: false
        },
        {
          x: 30040,
          y: -3153.5555555555557,
          taken: false
        },
        {
          x: 30108,
          y: -2976,
          taken: false
        },
        {
          x: 30220,
          y: -2788,
          taken: false
        },
        {
          x: 30288,
          y: -2788,
          taken: false
        },
        {
          x: 30356,
          y: -2788,
          taken: false
        },
        {
          x: 30424,
          y: -2788,
          taken: false
        },
        {
          x: 30492,
          y: -2788,
          taken: false
        },
        {
          x: 30590,
          y: -2803.3846153846152,
          taken: false
        },
        {
          x: 30720,
          y: -2838,
          taken: false
        },
        {
          x: 30788,
          y: -2838,
          taken: false
        },
        {
          x: 30856,
          y: -2838,
          taken: false
        },
        {
          x: 30924,
          y: -2838,
          taken: false
        },
        {
          x: 31040,
          y: -2867.3333333333335,
          taken: false
        },
        {
          x: 31108,
          y: -2917.2,
          taken: false
        },
        {
          x: 31176,
          y: -2967.0666666666666,
          taken: false
        },
        {
          x: 31244,
          y: -3016.9333333333334,
          taken: false
        },
        {
          x: 32040,
          y: -3218,
          taken: false
        },
        {
          x: 32108,
          y: -3218,
          taken: false
        },
        {
          x: 32176,
          y: -3218,
          taken: false
        },
        {
          x: 32244,
          y: -3218,
          taken: false
        },
        {
          x: 32312,
          y: -3218,
          taken: false
        },
        {
          x: 32380,
          y: -3218,
          taken: false
        },
        {
          x: 32448,
          y: -3218,
          taken: false
        },
        {
          x: 32516,
          y: -3218,
          taken: false
        },
        {
          x: 32840,
          y: -3298,
          taken: false
        },
        {
          x: 32908,
          y: -3298,
          taken: false
        },
        {
          x: 32976,
          y: -3298,
          taken: false
        },
        {
          x: 33044,
          y: -3298,
          taken: false
        },
        {
          x: 33112,
          y: -3298,
          taken: false
        },
        {
          x: 33180,
          y: -3298,
          taken: false
        },
        {
          x: 33460,
          y: -3378,
          taken: false
        },
        {
          x: 33528,
          y: -3378,
          taken: false
        },
        {
          x: 33596,
          y: -3378,
          taken: false
        },
        {
          x: 33664,
          y: -3378,
          taken: false
        },
        {
          x: 33732,
          y: -3378,
          taken: false
        },
        {
          x: 33800,
          y: -3378,
          taken: false
        },
        {
          x: 33868,
          y: -3378,
          taken: false
        },
        {
          x: 33110,
          y: -3488,
          taken: false
        },
        {
          x: 33178,
          y: -3488,
          taken: false
        },
        {
          x: 33246,
          y: -3488,
          taken: false
        },
        {
          x: 33314,
          y: -3488,
          taken: false
        },
        {
          x: 33630,
          y: -3598,
          taken: false
        },
        {
          x: 33698,
          y: -3598,
          taken: false
        },
        {
          x: 33766,
          y: -3598,
          taken: false
        },
        {
          x: 33834,
          y: -3598,
          taken: false
        },
        {
          x: 33190,
          y: -3708,
          taken: false
        },
        {
          x: 33258,
          y: -3708,
          taken: false
        },
        {
          x: 33326,
          y: -3708,
          taken: false
        },
        {
          x: 33394,
          y: -3708,
          taken: false
        },
        {
          x: 33462,
          y: -3708,
          taken: false
        },
        {
          x: 33690,
          y: -3828,
          taken: false
        },
        {
          x: 33758,
          y: -3828,
          taken: false
        },
        {
          x: 33826,
          y: -3828,
          taken: false
        },
        {
          x: 33894,
          y: -3828,
          taken: false
        },
        {
          x: 33962,
          y: -3828,
          taken: false
        },
        {
          x: 34030,
          y: -3828,
          taken: false
        },
        {
          x: 34490,
          y: -3828,
          taken: false
        },
        {
          x: 34590,
          y: -3828,
          taken: false
        },
        {
          x: 34690,
          y: -3828,
          taken: false
        },
        {
          x: 34790,
          y: -3828,
          taken: false
        },
        {
          x: 34890,
          y: -3828,
          taken: false
        },
        {
          x: 34990,
          y: -3828,
          taken: false
        },
        {
          x: 35090,
          y: -3828,
          taken: false
        },
        {
          x: 35190,
          y: -3828,
          taken: false
        },
        {
          x: 35290,
          y: -3828,
          taken: false
        },
        {
          x: 35390,
          y: -3828,
          taken: false
        },
        {
          x: 35490,
          y: -3828,
          taken: false
        },
        {
          x: 35590,
          y: -3828,
          taken: false
        },
        {
          x: 35690,
          y: -3828,
          taken: false
        },
        {
          x: 35790,
          y: -3828,
          taken: false
        },
        {
          x: 35890,
          y: -3828,
          taken: false
        },
        {
          x: 35990,
          y: -3828,
          taken: false
        },
        {
          x: 36090,
          y: -3828,
          taken: false
        },
        {
          x: 36190,
          y: -3840.5714285714284,
          taken: false
        },
        {
          x: 36258,
          y: -3861.942857142857,
          taken: false
        },
        {
          x: 36326,
          y: -3883.3142857142857,
          taken: false
        },
        {
          x: 36394,
          y: -3904.6857142857143,
          taken: false
        },
        {
          x: 36462,
          y: -3926.057142857143,
          taken: false
        },
        {
          x: 46640,
          y: -4705.142857142857,
          taken: false
        },
        {
          x: 46708,
          y: -4734.285714285715,
          taken: false
        },
        {
          x: 46776,
          y: -4763.428571428572,
          taken: false
        },
        {
          x: 46844,
          y: -4792.571428571428,
          taken: false
        },
        {
          x: 46912,
          y: -4821.714285714285,
          taken: false
        },
        {
          x: 46980,
          y: -4850.857142857143,
          taken: false
        },
        {
          x: 47048,
          y: -4880,
          taken: false
        },
        {
          x: 47116,
          y: -4909.142857142857,
          taken: false
        },
        {
          x: 47200,
          y: -4949.333333333333,
          taken: false
        },
        {
          x: 47268,
          y: -4985.6,
          taken: false
        },
        {
          x: 47640,
          y: -5078,
          taken: false
        },
        {
          x: 47708,
          y: -5078,
          taken: false
        },
        {
          x: 47776,
          y: -5078,
          taken: false
        },
        {
          x: 47844,
          y: -5078,
          taken: false
        },
        {
          x: 47912,
          y: -5078,
          taken: false
        },
        {
          x: 47980,
          y: -5078,
          taken: false
        },
        {
          x: 47540,
          y: -5188,
          taken: false
        },
        {
          x: 47608,
          y: -5188,
          taken: false
        },
        {
          x: 47676,
          y: -5188,
          taken: false
        },
        {
          x: 47744,
          y: -5188,
          taken: false
        },
        {
          x: 47812,
          y: -5188,
          taken: false
        },
        {
          x: 47170,
          y: -5298,
          taken: false
        },
        {
          x: 47238,
          y: -5298,
          taken: false
        },
        {
          x: 47306,
          y: -5298,
          taken: false
        },
        {
          x: 47374,
          y: -5298,
          taken: false
        },
        {
          x: 47442,
          y: -5298,
          taken: false
        },
        {
          x: 47620,
          y: -5458,
          taken: false
        },
        {
          x: 47688,
          y: -5458,
          taken: false
        },
        {
          x: 47756,
          y: -5458,
          taken: false
        },
        {
          x: 47824,
          y: -5458,
          taken: false
        },
        {
          x: 47892,
          y: -5458,
          taken: false
        },
        {
          x: 48170,
          y: -5588,
          taken: false
        },
        {
          x: 48238,
          y: -5588,
          taken: false
        },
        {
          x: 48306,
          y: -5588,
          taken: false
        },
        {
          x: 48374,
          y: -5588,
          taken: false
        },
        {
          x: 48680,
          y: -5698,
          taken: false
        },
        {
          x: 48780,
          y: -5698,
          taken: false
        },
        {
          x: 48880,
          y: -5698,
          taken: false
        },
        {
          x: 48980,
          y: -5698,
          taken: false
        },
        {
          x: 49080,
          y: -5698,
          taken: false
        },
        {
          x: 49180,
          y: -5698,
          taken: false
        },
        {
          x: 49280,
          y: -5698,
          taken: false
        },
        {
          x: 49380,
          y: -5698,
          taken: false
        },
        {
          x: 49480,
          y: -5698,
          taken: false
        },
        {
          x: 49580,
          y: -5698,
          taken: false
        },
        {
          x: 49680,
          y: -5698,
          taken: false
        },
        {
          x: 49780,
          y: -5698,
          taken: false
        },
        {
          x: 49880,
          y: -5698,
          taken: false
        },
        {
          x: 49980,
          y: -5698,
          taken: false
        },
        {
          x: 50080,
          y: -5698,
          taken: false
        },
        {
          x: 50180,
          y: -5698,
          taken: false
        },
        {
          x: 50280,
          y: -5698,
          taken: false
        },
        {
          x: 48080,
          y: -5056.888888888889,
          taken: false,
          sealedBy: "secret-facade-wall"
        },
        {
          x: 48148,
          y: -5021,
          taken: false,
          sealedBy: "secret-facade-wall"
        },
        {
          x: 48216,
          y: -4985.111111111111,
          taken: false,
          sealedBy: "secret-facade-wall"
        },
        {
          x: 48284,
          y: -4949.222222222223,
          taken: false,
          sealedBy: "secret-facade-wall"
        },
        {
          x: 48352,
          y: -4913.333333333333,
          taken: false,
          sealedBy: "secret-facade-wall"
        },
        {
          x: 48440,
          y: -4888,
          taken: false,
          sealedBy: "secret-facade-wall"
        },
        {
          x: 48508,
          y: -4888,
          taken: false,
          sealedBy: "secret-facade-wall"
        },
        {
          x: 48576,
          y: -4888,
          taken: false,
          sealedBy: "secret-facade-wall"
        },
        {
          x: 48644,
          y: -4888,
          taken: false,
          sealedBy: "secret-facade-wall"
        },
        {
          x: 48740,
          y: -4965.142857142857,
          taken: false,
          sealedBy: "secret-facade-wall"
        },
        {
          x: 48808,
          y: -5096.285714285715,
          taken: false,
          sealedBy: "secret-facade-wall"
        },
        {
          x: 48876,
          y: -5227.428571428572,
          taken: false,
          sealedBy: "secret-facade-wall"
        },
        {
          x: 48944,
          y: -5358.571428571428,
          taken: false,
          sealedBy: "secret-facade-wall"
        },
        {
          x: 49012,
          y: -5489.714285714285,
          taken: false,
          sealedBy: "secret-facade-wall"
        },
        {
          x: 49080,
          y: -5620.857142857143,
          taken: false,
          sealedBy: "secret-facade-wall"
        },
        {
          x: 49160,
          y: -5698,
          taken: false,
          sealedBy: "secret-facade-wall"
        },
        {
          x: 49228,
          y: -5698,
          taken: false,
          sealedBy: "secret-facade-wall"
        },
        {
          x: 50540,
          y: -5808,
          taken: false
        },
        {
          x: 50608,
          y: -5808,
          taken: false
        },
        {
          x: 50676,
          y: -5808,
          taken: false
        },
        {
          x: 50744,
          y: -5808,
          taken: false
        },
        {
          x: 51020,
          y: -5918,
          taken: false
        },
        {
          x: 51088,
          y: -5918,
          taken: false
        },
        {
          x: 51156,
          y: -5918,
          taken: false
        },
        {
          x: 51224,
          y: -5918,
          taken: false
        },
        {
          x: 50650,
          y: -6028,
          taken: false
        },
        {
          x: 50718,
          y: -6028,
          taken: false
        },
        {
          x: 50786,
          y: -6028,
          taken: false
        },
        {
          x: 50854,
          y: -6028,
          taken: false
        },
        {
          x: 50290,
          y: -6138,
          taken: false
        },
        {
          x: 50358,
          y: -6138,
          taken: false
        },
        {
          x: 50426,
          y: -6138,
          taken: false
        },
        {
          x: 50494,
          y: -6138,
          taken: false
        },
        {
          x: 50640,
          y: -6248,
          taken: false
        },
        {
          x: 50708,
          y: -6248,
          taken: false
        },
        {
          x: 50776,
          y: -6248,
          taken: false
        },
        {
          x: 50844,
          y: -6248,
          taken: false
        },
        {
          x: 51040,
          y: -6358,
          taken: false
        },
        {
          x: 51108,
          y: -6358,
          taken: false
        },
        {
          x: 51176,
          y: -6358,
          taken: false
        },
        {
          x: 51244,
          y: -6358,
          taken: false
        },
        {
          x: 51520,
          y: -6468,
          taken: false
        },
        {
          x: 51588,
          y: -6468,
          taken: false
        },
        {
          x: 51656,
          y: -6468,
          taken: false
        },
        {
          x: 51724,
          y: -6468,
          taken: false
        },
        {
          x: 51792,
          y: -6468,
          taken: false
        },
        {
          x: 51860,
          y: -6468,
          taken: false
        },
        {
          x: 52190,
          y: -7108,
          taken: false
        },
        {
          x: 52258,
          y: -7108,
          taken: false
        },
        {
          x: 52326,
          y: -7108,
          taken: false
        },
        {
          x: 52394,
          y: -7108,
          taken: false
        },
        {
          x: 52462,
          y: -7108,
          taken: false
        },
        {
          x: 52530,
          y: -7108,
          taken: false
        },
        {
          x: 52598,
          y: -7108,
          taken: false
        },
        {
          x: 52810,
          y: -7218,
          taken: false
        },
        {
          x: 52878,
          y: -7218,
          taken: false
        },
        {
          x: 52946,
          y: -7218,
          taken: false
        },
        {
          x: 53014,
          y: -7218,
          taken: false
        },
        {
          x: 53160,
          y: -7328,
          taken: false
        },
        {
          x: 53228,
          y: -7328,
          taken: false
        },
        {
          x: 53296,
          y: -7328,
          taken: false
        },
        {
          x: 53364,
          y: -7328,
          taken: false
        },
        {
          x: 52760,
          y: -7438,
          taken: false
        },
        {
          x: 52828,
          y: -7438,
          taken: false
        },
        {
          x: 52896,
          y: -7438,
          taken: false
        },
        {
          x: 52964,
          y: -7438,
          taken: false
        },
        {
          x: 53210,
          y: -7548,
          taken: false
        },
        {
          x: 53278,
          y: -7548,
          taken: false
        },
        {
          x: 53346,
          y: -7548,
          taken: false
        },
        {
          x: 53414,
          y: -7548,
          taken: false
        },
        {
          x: 53600,
          y: -7678,
          taken: false
        },
        {
          x: 53668,
          y: -7678,
          taken: false
        },
        {
          x: 53736,
          y: -7678,
          taken: false
        },
        {
          x: 53804,
          y: -7678,
          taken: false
        },
        {
          x: 53872,
          y: -7678,
          taken: false
        },
        {
          x: 54130,
          y: -7788,
          taken: false
        },
        {
          x: 54198,
          y: -7788,
          taken: false
        },
        {
          x: 54266,
          y: -7788,
          taken: false
        },
        {
          x: 54334,
          y: -7788,
          taken: false
        },
        {
          x: 54402,
          y: -7788,
          taken: false
        },
        {
          x: 54470,
          y: -7788,
          taken: false
        },
        {
          x: 54538,
          y: -7788,
          taken: false
        },
        {
          x: 50360,
          y: -5722.444444444444,
          taken: false
        },
        {
          x: 50428,
          y: -5764,
          taken: false
        },
        {
          x: 54830,
          y: -8428,
          taken: false
        },
        {
          x: 54930,
          y: -8428,
          taken: false
        },
        {
          x: 55030,
          y: -8428,
          taken: false
        },
        {
          x: 55130,
          y: -8428,
          taken: false
        },
        {
          x: 55230,
          y: -8428,
          taken: false
        },
        {
          x: 55330,
          y: -8428,
          taken: false
        },
        {
          x: 55430,
          y: -8428,
          taken: false
        },
        {
          x: 55530,
          y: -8428,
          taken: false
        },
        {
          x: 55630,
          y: -8428,
          taken: false
        },
        {
          x: 64130,
          y: -9378,
          taken: false
        },
        {
          x: 64230,
          y: -9378,
          taken: false
        },
        {
          x: 64330,
          y: -9378,
          taken: false
        },
        {
          x: 64430,
          y: -9378,
          taken: false
        },
        {
          x: 64530,
          y: -9378,
          taken: false
        },
        {
          x: 64630,
          y: -9378,
          taken: false
        },
        {
          x: 64730,
          y: -9378,
          taken: false
        },
        {
          x: 64830,
          y: -9378,
          taken: false
        },
        {
          x: 64930,
          y: -9378,
          taken: false
        },
        {
          x: 65030,
          y: -9378,
          taken: false
        },
        {
          x: 65130,
          y: -9378,
          taken: false
        },
        {
          x: 65230,
          y: -9378,
          taken: false
        },
        {
          x: 65330,
          y: -9378,
          taken: false
        },
        {
          x: 65430,
          y: -9378,
          taken: false
        },
        {
          x: 31540,
          y: -3856,
          taken: false
        },
        {
          x: 31640,
          y: -3788,
          taken: false
        },
        {
          x: 31740,
          y: -3750,
          taken: false
        },
        {
          x: 31840,
          y: -3738,
          taken: false
        },
        {
          x: 31940,
          y: -3746,
          taken: false
        },
        {
          x: 32040,
          y: -3770,
          taken: false
        },
        {
          x: 32140,
          y: -3800,
          taken: false
        },
        {
          x: 32240,
          y: -3825.0588235294117,
          taken: false
        },
        {
          x: 32308,
          y: -3837.0588235294117,
          taken: false
        },
        {
          x: 30660,
          y: -3848,
          taken: false
        },
        {
          x: 30728,
          y: -3848,
          taken: false
        },
        {
          x: 30796,
          y: -3848,
          taken: false
        },
        {
          x: 30864,
          y: -3848,
          taken: false
        },
        {
          x: 30932,
          y: -3848,
          taken: false
        },
        {
          x: 31e3,
          y: -3848,
          taken: false
        },
        {
          x: 31068,
          y: -3848,
          taken: false
        },
        {
          x: 30840,
          y: -4438,
          taken: false
        },
        {
          x: 30940,
          y: -4438,
          taken: false
        },
        {
          x: 31040,
          y: -4438,
          taken: false
        },
        {
          x: 31140,
          y: -4438,
          taken: false
        },
        {
          x: 31240,
          y: -4438,
          taken: false
        },
        {
          x: 31340,
          y: -4438,
          taken: false
        },
        {
          x: 31440,
          y: -4438,
          taken: false
        },
        {
          x: 31540,
          y: -4438,
          taken: false
        },
        {
          x: 31640,
          y: -4438,
          taken: false
        },
        {
          x: 31740,
          y: -4438,
          taken: false
        },
        {
          x: 31840,
          y: -4438,
          taken: false
        },
        {
          x: 31940,
          y: -4438,
          taken: false
        },
        {
          x: 32040,
          y: -4438,
          taken: false
        },
        {
          x: 32140,
          y: -4438,
          taken: false
        },
        {
          x: 32240,
          y: -4438,
          taken: false
        },
        {
          x: 32340,
          y: -4438,
          taken: false
        },
        {
          x: 32440,
          y: -4438,
          taken: false
        },
        {
          x: 32540,
          y: -4438,
          taken: false
        },
        {
          x: 32640,
          y: -4438,
          taken: false
        },
        {
          x: 32740,
          y: -4438,
          taken: false
        },
        {
          x: 32840,
          y: -4438,
          taken: false
        },
        {
          x: 32940,
          y: -4438,
          taken: false
        },
        {
          x: 33040,
          y: -4438,
          taken: false
        },
        {
          x: 33140,
          y: -4438,
          taken: false
        },
        {
          x: 33240,
          y: -4438,
          taken: false
        },
        {
          x: 33340,
          y: -4438,
          taken: false
        },
        {
          x: 33440,
          y: -4438,
          taken: false
        },
        {
          x: 33540,
          y: -4438,
          taken: false
        },
        {
          x: 33640,
          y: -4438,
          taken: false
        },
        {
          x: 33740,
          y: -4438,
          taken: false
        },
        {
          x: 33840,
          y: -4438,
          taken: false
        },
        {
          x: 33940,
          y: -4438,
          taken: false
        },
        {
          x: 34040,
          y: -4438,
          taken: false
        },
        {
          x: 34140,
          y: -4438,
          taken: false
        },
        {
          x: 34240,
          y: -4438,
          taken: false
        },
        {
          x: 34340,
          y: -4438,
          taken: false
        },
        {
          x: 34440,
          y: -4438,
          taken: false
        },
        {
          x: 34540,
          y: -4438,
          taken: false
        },
        {
          x: 34640,
          y: -4438,
          taken: false
        },
        {
          x: 34740,
          y: -4438,
          taken: false
        },
        {
          x: 34840,
          y: -4426.235294117647,
          taken: false
        },
        {
          x: 34940,
          y: -4396.823529411765,
          taken: false
        },
        {
          x: 35040,
          y: -4367.411764705882,
          taken: false
        },
        {
          x: 35140,
          y: -4338,
          taken: false
        },
        {
          x: 35240,
          y: -4308.588235294118,
          taken: false
        },
        {
          x: 35340,
          y: -4279.176470588235,
          taken: false
        },
        {
          x: 35440,
          y: -4249.764705882353,
          taken: false
        },
        {
          x: 35540,
          y: -4220.35294117647,
          taken: false
        },
        {
          x: 35640,
          y: -4190.941176470588,
          taken: false
        },
        {
          x: 35740,
          y: -4161.529411764706,
          taken: false
        },
        {
          x: 35840,
          y: -4132.117647058823,
          taken: false
        },
        {
          x: 35940,
          y: -4102.7058823529405,
          taken: false
        },
        {
          x: 36040,
          y: -4073.294117647059,
          taken: false
        },
        {
          x: 36140,
          y: -4043.8823529411766,
          taken: false
        },
        {
          x: 36240,
          y: -4014.470588235294,
          taken: false
        },
        {
          x: 36340,
          y: -3985.0588235294117,
          taken: false
        },
        {
          x: 36440,
          y: -3955.6470588235293,
          taken: false
        }
      ],
      signs: [
        {
          x: 320,
          y: 320,
          text: "01 / CITY UNDER ATTACK",
          type: "sector"
        },
        {
          x: 8820,
          y: -550,
          text: "02 / SKYLINE FORK",
          type: "sector"
        },
        {
          x: 36820,
          y: -4e3,
          text: "08 / SPLIT SKYLINE",
          type: "sector"
        },
        {
          x: 55110,
          y: -8490,
          text: "11 / CITY-COLLAPSE CLIMAX",
          type: "sector"
        }
      ],
      checkpoints: [
        {
          x: 100,
          y: 420,
          name: "01 / CITY UNDER ATTACK",
          hint: "Broken rails lead into a real rooftop climb. Speed alone cannot reach the crown.",
          surfaceId: "under-attack-act2-0"
        },
        {
          x: 6200,
          y: -500,
          name: "TRANSIT STACK / CROWN",
          hint: "Climb cleared. Earned speed ahead.",
          surfaceId: "under-attack-act2-18"
        },
        {
          x: 8600,
          y: -450,
          name: "02 / SKYLINE FORK",
          hint: "Earn the high rail with a full jump. Both city routes reconnect at a switchback tower.",
          surfaceId: "skyline-fork-act2-29"
        },
        {
          x: 14880,
          y: -1350,
          name: "BROADCAST TOWER / CROWN",
          hint: "Climb cleared. Earned speed ahead.",
          surfaceId: "skyline-fork-act2-55"
        },
        {
          x: 16620,
          y: -1300,
          name: "03 / ROOFTOP APPROACH",
          surfaceId: "arrival"
        },
        {
          x: 21710,
          y: -1640,
          name: "04 / GLASSWORKS",
          surfaceId: "vent-later-merge"
        },
        {
          x: 28210,
          y: -2950,
          name: "05 / UPPER GLASSWORKS",
          surfaceId: "draw-checkpoint-roof"
        },
        {
          x: 32140,
          y: -3180,
          name: "06 / BURNING QUARTER",
          surfaceId: "draw-loop-payoff-roof"
        },
        {
          x: 35950,
          y: -3790,
          name: "07 / AERIAL TRANSIT",
          surfaceId: "draw-hazard-hall"
        },
        {
          x: 36600,
          y: -3900,
          name: "08 / SPLIT SKYLINE",
          hint: "Earn the upper skyline transfer or follow the slower streets below.",
          surfaceId: "split-skyline-act2-179"
        },
        {
          x: 45800,
          y: -4750,
          name: "SKYLINE CROWN / CROWN",
          hint: "Climb cleared. Earned speed ahead.",
          surfaceId: "split-skyline-act2-212"
        },
        {
          x: 49300,
          y: -5660,
          name: "09 / NEON SWITCHBACK",
          surfaceId: "secret-shared-rooftop"
        },
        {
          x: 52330,
          y: -7070,
          name: "10 / FRACTURE CROWN",
          surfaceId: "neon-high-crown"
        },
        {
          x: 54890,
          y: -8390,
          name: "11 / CITY-COLLAPSE CLIMAX",
          hint: "Jump the failing rails, then scale the last exposed pylon as the city falls beneath you.",
          surfaceId: "summit-entry"
        },
        {
          x: 62090,
          y: -9340,
          name: "COLLAPSE PYLON / CROWN",
          hint: "Climb cleared. Earned speed ahead.",
          surfaceId: "city-climax-act2-240"
        }
      ],
      sectors: [
        {
          x: 0,
          y: 420,
          name: "01 / CITY UNDER ATTACK",
          hint: "Broken rails lead into a real rooftop climb. Speed alone cannot reach the crown."
        },
        {
          x: 8500,
          y: -450,
          name: "02 / SKYLINE FORK",
          hint: "Earn the high rail with a full jump. Both city routes reconnect at a switchback tower."
        },
        {
          x: 16500,
          y: -1300,
          name: "03 / ROOFTOP APPROACH",
          hint: ""
        },
        {
          x: 21560,
          y: -1640,
          name: "04 / GLASSWORKS",
          hint: ""
        },
        {
          x: 27690,
          y: -2950,
          name: "05 / UPPER GLASSWORKS",
          hint: ""
        },
        {
          x: 32e3,
          y: -3180,
          name: "06 / BURNING QUARTER",
          hint: ""
        },
        {
          x: 34450,
          y: -3790,
          name: "07 / AERIAL TRANSIT",
          hint: ""
        },
        {
          x: 36500,
          y: -3900,
          name: "08 / SPLIT SKYLINE",
          hint: "Earn the upper skyline transfer or follow the slower streets below."
        },
        {
          x: 48640,
          y: -5660,
          name: "09 / NEON SWITCHBACK",
          hint: ""
        },
        {
          x: 52150,
          y: -7070,
          name: "10 / FRACTURE CROWN",
          hint: ""
        },
        {
          x: 54790,
          y: -8390,
          name: "11 / CITY-COLLAPSE CLIMAX",
          hint: "Jump the failing rails, then scale the last exposed pylon as the city falls beneath you."
        }
      ],
      loops: [
        {
          id: "draw-loop-1",
          x: 30330,
          y: -2750,
          r: 130,
          used: false
        },
        {
          id: "draw-loop-2",
          x: 30860,
          y: -2800,
          r: 95,
          used: false
        },
        {
          id: "city-climax-loop-248",
          x: 63590,
          y: -9340,
          r: 94,
          used: false
        }
      ],
      debris: [
        {
          id: "hall-debris-1",
          x: 35140,
          y: -3790,
          entryX: 34450,
          w: 64,
          warn: 48,
          fall: 18,
          triggered: false,
          age: 0
        },
        {
          id: "hall-debris-2",
          x: 35510,
          y: -3790,
          entryX: 34450,
          w: 64,
          warn: 48,
          fall: 18,
          triggered: false,
          age: 0
        },
        {
          id: "under-attack-debris-28",
          x: 7100,
          y: -500,
          w: 76,
          warn: 42,
          fall: 16,
          triggered: false,
          age: 0
        },
        {
          id: "skyline-fork-debris-63",
          x: 15700,
          y: -1350,
          w: 76,
          warn: 42,
          fall: 16,
          triggered: false,
          age: 0
        },
        {
          id: "city-climax-debris-232",
          x: 59190,
          y: -8540,
          w: 76,
          warn: 42,
          fall: 16,
          triggered: false,
          age: 0
        },
        {
          id: "city-climax-debris-249",
          x: 63890,
          y: -9340,
          w: 76,
          warn: 42,
          fall: 16,
          triggered: false,
          age: 0
        }
      ],
      events: [
        {
          x: 57090,
          y: -8540,
          type: "bridge",
          trigger: 58620,
          width: 1900,
          age: -1
        },
        {
          x: 62190,
          y: -9340,
          type: "tower",
          trigger: 62890,
          width: 550,
          age: -1
        }
      ],
      buildings: [
        {
          id: "glass-tower",
          x: 24360,
          y: -2320,
          w: 540,
          h: 2e3,
          seed: 2,
          exposed: true,
          gateId: "teaching-glass",
          rooms: [
            {
              x1: 24360,
              x2: 24840,
              y: -1940
            }
          ]
        },
        {
          id: "fire-escape-tower",
          x: 27690,
          y: -2950,
          w: 812,
          h: 2e3,
          seed: 7,
          exposed: true,
          gateId: "draw-interior-wall",
          rooms: [
            {
              x1: 27690,
              x2: 28100,
              y: -2410
            }
          ],
          duct: {
            x: 28040,
            y1: -2950,
            y2: -2410
          }
        },
        {
          id: "burning-tower",
          x: 34450,
          y: -4e3,
          w: 1740,
          h: 2e3,
          seed: 12,
          exposed: true,
          burning: true,
          rooms: [
            {
              x1: 34450,
              x2: 36150,
              y: -3790
            }
          ]
        },
        {
          id: "secret-transit-building",
          x: 48040,
          y: -5740,
          w: 1420,
          h: 2e3,
          seed: 17,
          exposed: true,
          gateId: "secret-facade-wall",
          secret: true,
          rooms: [
            {
              x1: 48040,
              x2: 49120,
              y: -5050,
              bottom: -4800,
              sloped: true
            }
          ]
        },
        {
          id: "neon-tower",
          x: 50600,
          y: -6440,
          w: 780,
          h: 2e3,
          seed: 22,
          exposed: true,
          landmark: "NEON WORKS"
        },
        {
          id: "fracture-building",
          x: 53250,
          y: -7760,
          w: 540,
          h: 2e3,
          seed: 27,
          exposed: true,
          landmark: "EAST WORKSITE"
        },
        {
          x: 4584,
          y: 34,
          w: 212,
          h: 301,
          roofId: "under-attack-act2-13",
          seed: 24,
          damage: 0.3
        },
        {
          x: 4854,
          y: -106,
          w: 202,
          h: 441,
          roofId: "under-attack-act2-14",
          seed: 31,
          damage: 0.38
        },
        {
          x: 5544,
          y: -296,
          w: 192,
          h: 631,
          roofId: "under-attack-act2-16",
          seed: 45,
          damage: 0.54
        },
        {
          x: 5794,
          y: -386,
          w: 272,
          h: 721,
          roofId: "under-attack-act2-17",
          seed: 52,
          damage: 0.62
        },
        {
          x: 14020,
          y: -1285,
          w: 710,
          h: 855,
          exposed: true,
          attachmentIds: [
            "skyline-fork-act2-49",
            "skyline-fork-act2-50",
            "skyline-fork-act2-51",
            "skyline-fork-act2-52",
            "skyline-fork-act2-53",
            "skyline-fork-act2-54"
          ],
          seed: 61,
          damage: 0.65
        },
        {
          x: 43820,
          y: -4685,
          w: 1830,
          h: 855,
          exposed: true,
          attachmentIds: [
            "split-skyline-act2-206",
            "split-skyline-act2-207",
            "split-skyline-act2-208",
            "split-skyline-act2-209",
            "split-skyline-act2-210",
            "split-skyline-act2-211"
          ],
          seed: 218,
          damage: 0.65
        },
        {
          x: 60110,
          y: -9275,
          w: 1830,
          h: 855,
          exposed: true,
          attachmentIds: [
            "city-climax-act2-234",
            "city-climax-act2-235",
            "city-climax-act2-236",
            "city-climax-act2-237",
            "city-climax-act2-238",
            "city-climax-act2-239"
          ],
          seed: 246,
          damage: 0.65,
          style: 0
        }
      ],
      routeChallenges: [
        {
          id: "arrival-climb",
          name: "ROOFTOP APPROACH",
          entryId: "arrival",
          steps: ["arrival", "approach-1", "approach-2", "approach-3", "vent-entry"],
          exitX: 18960,
          exitY: -1640,
          entryX: 16540,
          x1: 16500,
          x2: 19410
        },
        {
          id: "vent-drawing",
          name: "MOMENTUM ROOF",
          entryId: "vent-entry",
          steps: [
            "vent-entry",
            "vent-upper-roof",
            "vent-upper-step",
            "vent-upper-tail",
            "vent-later-merge"
          ],
          ventId: "momentum-vent",
          lowerBranch: {
            steps: [
              "vent-lower-1",
              "vent-lower-2",
              "vent-lower-3",
              "vent-lower-lift",
              "vent-later-merge"
            ],
            liftId: "vent-lower-lift",
            springId: "vent-lower-spring"
          },
          exitX: 21560,
          exitY: -1640,
          entryX: 19e3,
          x1: 18960,
          x2: 21950
        },
        {
          id: "draw-roof-stairs",
          name: "GLASSWORKS ROOFS",
          entryId: "vent-later-merge",
          steps: [
            "vent-later-merge",
            "draw-stair-0",
            "draw-stair-1",
            "draw-stair-2",
            "draw-glass-approach"
          ],
          exitX: 23780,
          exitY: -1940,
          entryX: 21600,
          x1: 21560,
          x2: 24360
        },
        {
          id: "draw-fire-climb",
          name: "FIRE ESCAPE TURN",
          entryId: "draw-fire-escape-1",
          steps: ["draw-fire-escape-1", "draw-left-ledge", "draw-fire-escape-2"],
          exitX: 27200,
          exitY: -2410,
          entryX: 26480,
          x1: 26440,
          x2: 27690
        },
        {
          id: "draw-light-roofs",
          name: "BURNING QUARTER",
          entryId: "draw-loop-payoff-roof",
          steps: ["draw-loop-payoff-roof", "draw-next-roof", "draw-burning-approach"],
          exitX: 33420,
          exitY: -3340,
          entryX: 32040,
          x1: 32e3,
          x2: 33900
        },
        {
          id: "draw-burning-climb",
          name: "BURNING QUARTER ASCENT",
          entryId: "draw-burning-approach",
          steps: [
            "draw-burning-approach",
            "draw-burning-left",
            "draw-burning-right",
            "draw-burning-top",
            "draw-moving-carrier",
            "draw-hazard-hall"
          ],
          exitX: 34450,
          exitY: -3790,
          entryX: 33460,
          x1: 33070,
          x2: 36150
        },
        {
          id: "secret-normal-climb",
          name: "TRANSIT SERVICE CLIMB",
          entryId: "secret-wall-platform",
          steps: [
            "secret-wall-platform",
            "secret-normal-1",
            "secret-spike-step",
            "secret-vertical-lift",
            "secret-right-ledge",
            "secret-shared-rooftop"
          ],
          exitX: 48640,
          exitY: -5660,
          entryX: 47640,
          x1: 47130,
          x2: 50320
        },
        {
          id: "neon-climb",
          name: "NEON SWITCHBACK",
          entryId: "secret-shared-rooftop",
          steps: [
            "secret-shared-rooftop",
            "secret-exit-uphill-link",
            "neon-0",
            "neon-1",
            "neon-2",
            "neon-3",
            "neon-4",
            "neon-5",
            "neon-vent-roof"
          ],
          exitX: 51480,
          exitY: -6430,
          entryX: 48680,
          x1: 48640,
          x2: 51950
        },
        {
          id: "fracture-climb",
          name: "FRACTURE CROWN",
          entryId: "neon-high-crown",
          steps: [
            "neon-high-crown",
            "fracture-0",
            "fracture-1",
            "fracture-2",
            "fracture-3",
            "fracture-hoist",
            "fracture-vent-roof"
          ],
          exitX: 54090,
          exitY: -7750,
          entryX: 52190,
          x1: 52150,
          x2: 54580
        },
        {
          id: "under-attack-climb-23",
          name: "TRANSIT STACK",
          kind: "stairs",
          x1: 4580,
          x2: 6590,
          entryId: "under-attack-act2-12",
          entryX: 4040,
          exitX: 6090,
          exitY: -500,
          steps: [
            "under-attack-act2-13",
            "under-attack-act2-14",
            "under-attack-act2-15",
            "under-attack-act2-16",
            "under-attack-act2-17",
            "under-attack-act2-18"
          ],
          lowerBranch: {
            steps: [
              "under-attack-act2-19",
              "under-attack-act2-20",
              "under-attack-service-transit-stack",
              "under-attack-lift-service-transit-stack",
              "under-attack-act2-18"
            ],
            liftId: "under-attack-lift-service-transit-stack",
            springId: null
          }
        },
        {
          id: "skyline-fork-climb-60",
          name: "BROADCAST TOWER",
          kind: "switchback",
          x1: 13860,
          x2: 15270,
          entryId: "skyline-fork-act2-48",
          entryX: 13540,
          exitX: 14770,
          exitY: -1350,
          steps: [
            "skyline-fork-act2-49",
            "skyline-fork-act2-50",
            "skyline-fork-act2-51",
            "skyline-fork-act2-52",
            "skyline-fork-act2-53",
            "skyline-fork-act2-54",
            "skyline-fork-act2-55"
          ],
          lowerBranch: {
            steps: [
              "skyline-fork-act2-56",
              "skyline-fork-act2-57",
              "skyline-fork-service-broadcast-tower",
              "skyline-fork-lift-service-broadcast-tower",
              "skyline-fork-act2-55"
            ],
            liftId: "skyline-fork-lift-service-broadcast-tower",
            springId: null
          }
        },
        {
          id: "split-skyline-climb-217",
          name: "SKYLINE CROWN",
          kind: "stairs",
          x1: 43880,
          x2: 46190,
          entryId: "split-skyline-act2-205",
          entryX: 43340,
          exitX: 45690,
          exitY: -4750,
          steps: [
            "split-skyline-act2-206",
            "split-skyline-act2-207",
            "split-skyline-act2-208",
            "split-skyline-act2-209",
            "split-skyline-act2-210",
            "split-skyline-act2-211",
            "split-skyline-act2-212"
          ],
          lowerBranch: {
            steps: [
              "split-skyline-act2-213",
              "split-skyline-act2-214",
              "split-skyline-service-skyline-crown",
              "split-skyline-lift-service-skyline-crown",
              "split-skyline-act2-212"
            ],
            liftId: "split-skyline-lift-service-skyline-crown",
            springId: null
          }
        },
        {
          id: "city-climax-climb-245",
          name: "COLLAPSE PYLON",
          kind: "stairs",
          x1: 60170,
          x2: 62480,
          entryId: "city-climax-act2-233",
          entryX: 59630,
          exitX: 61980,
          exitY: -9340,
          steps: [
            "city-climax-act2-234",
            "city-climax-act2-235",
            "city-climax-act2-236",
            "city-climax-act2-237",
            "city-climax-act2-238",
            "city-climax-act2-239",
            "city-climax-act2-240"
          ],
          lowerBranch: {
            steps: [
              "city-climax-act2-241",
              "city-climax-act2-242",
              "city-climax-service-collapse-pylon",
              "city-climax-lift-service-collapse-pylon",
              "city-climax-act2-240"
            ],
            liftId: "city-climax-lift-service-collapse-pylon",
            springId: null
          }
        }
      ],
      challenges: null,
      ventSections: null,
      drawnSections: [
        {
          id: "full-user-section",
          entryId: "draw-stair-0",
          exitId: "draw-hall-exit",
          glassId: "teaching-glass",
          interiorWallId: "draw-interior-wall",
          checkpointId: "draw-checkpoint-roof",
          upperForkId: "draw-burning-climb",
          secretVentId: "draw-hidden-pit-vent",
          hallwayId: "draw-hazard-hall",
          loopIds: ["draw-loop-1", "draw-loop-2"]
        }
      ],
      routeCues: [
        {
          id: "arrival",
          nextId: "approach-1"
        },
        {
          id: "approach-1",
          nextId: "approach-2"
        },
        {
          id: "approach-2",
          nextId: "approach-3"
        },
        {
          id: "approach-3",
          nextId: "vent-entry"
        },
        {
          id: "vent-entry",
          nextId: "vent-upper-roof"
        },
        {
          id: "vent-upper-roof",
          nextId: "vent-upper-step"
        },
        {
          id: "vent-upper-step",
          nextId: "vent-upper-tail"
        },
        {
          id: "vent-upper-tail",
          nextId: "vent-later-merge"
        },
        {
          id: "vent-later-merge",
          nextId: "draw-stair-0"
        },
        {
          id: "draw-stair-0",
          nextId: "draw-stair-1"
        },
        {
          id: "draw-stair-1",
          nextId: "draw-stair-2"
        },
        {
          id: "draw-stair-2",
          nextId: "draw-glass-approach"
        },
        {
          id: "draw-fire-escape-1",
          nextId: "draw-left-ledge"
        },
        {
          id: "draw-left-ledge",
          nextId: "draw-fire-escape-2"
        },
        {
          id: "draw-loop-payoff-roof",
          nextId: "draw-next-roof"
        },
        {
          id: "draw-next-roof",
          nextId: "draw-burning-approach"
        },
        {
          id: "draw-burning-approach",
          nextId: "draw-burning-left"
        },
        {
          id: "draw-burning-left",
          nextId: "draw-burning-right"
        },
        {
          id: "draw-burning-right",
          nextId: "draw-burning-top"
        },
        {
          id: "draw-burning-top",
          nextId: "draw-moving-carrier"
        },
        {
          id: "draw-moving-carrier",
          nextId: "draw-hazard-hall"
        },
        {
          id: "secret-wall-platform",
          nextId: "secret-normal-1"
        },
        {
          id: "secret-normal-1",
          nextId: "secret-spike-step"
        },
        {
          id: "secret-spike-step",
          nextId: "secret-vertical-lift"
        },
        {
          id: "secret-vertical-lift",
          nextId: "secret-right-ledge"
        },
        {
          id: "secret-right-ledge",
          nextId: "secret-shared-rooftop"
        },
        {
          id: "secret-shared-rooftop",
          nextId: "secret-exit-uphill-link"
        },
        {
          id: "secret-exit-uphill-link",
          nextId: "neon-0"
        },
        {
          id: "neon-0",
          nextId: "neon-1"
        },
        {
          id: "neon-1",
          nextId: "neon-2"
        },
        {
          id: "neon-2",
          nextId: "neon-3"
        },
        {
          id: "neon-3",
          nextId: "neon-4"
        },
        {
          id: "neon-4",
          nextId: "neon-5"
        },
        {
          id: "neon-5",
          nextId: "neon-vent-roof"
        },
        {
          id: "neon-high-crown",
          nextId: "fracture-0"
        },
        {
          id: "fracture-0",
          nextId: "fracture-1"
        },
        {
          id: "fracture-1",
          nextId: "fracture-2"
        },
        {
          id: "fracture-2",
          nextId: "fracture-3"
        },
        {
          id: "fracture-3",
          nextId: "fracture-hoist"
        },
        {
          id: "fracture-hoist",
          nextId: "fracture-vent-roof"
        },
        {
          id: "under-attack-act2-13",
          nextId: "under-attack-act2-14"
        },
        {
          id: "under-attack-act2-14",
          nextId: "under-attack-act2-15"
        },
        {
          id: "under-attack-act2-15",
          nextId: "under-attack-act2-16"
        },
        {
          id: "under-attack-act2-16",
          nextId: "under-attack-act2-17"
        },
        {
          id: "under-attack-act2-17",
          nextId: "under-attack-act2-18"
        },
        {
          id: "skyline-fork-act2-49",
          nextId: "skyline-fork-act2-50"
        },
        {
          id: "skyline-fork-act2-50",
          nextId: "skyline-fork-act2-51"
        },
        {
          id: "skyline-fork-act2-51",
          nextId: "skyline-fork-act2-52"
        },
        {
          id: "skyline-fork-act2-52",
          nextId: "skyline-fork-act2-53"
        },
        {
          id: "skyline-fork-act2-53",
          nextId: "skyline-fork-act2-54"
        },
        {
          id: "skyline-fork-act2-54",
          nextId: "skyline-fork-act2-55"
        },
        {
          id: "split-skyline-act2-206",
          nextId: "split-skyline-act2-207"
        },
        {
          id: "split-skyline-act2-207",
          nextId: "split-skyline-act2-208"
        },
        {
          id: "split-skyline-act2-208",
          nextId: "split-skyline-act2-209"
        },
        {
          id: "split-skyline-act2-209",
          nextId: "split-skyline-act2-210"
        },
        {
          id: "split-skyline-act2-210",
          nextId: "split-skyline-act2-211"
        },
        {
          id: "split-skyline-act2-211",
          nextId: "split-skyline-act2-212"
        },
        {
          id: "city-climax-act2-234",
          nextId: "city-climax-act2-235"
        },
        {
          id: "city-climax-act2-235",
          nextId: "city-climax-act2-236"
        },
        {
          id: "city-climax-act2-236",
          nextId: "city-climax-act2-237"
        },
        {
          id: "city-climax-act2-237",
          nextId: "city-climax-act2-238"
        },
        {
          id: "city-climax-act2-238",
          nextId: "city-climax-act2-239"
        },
        {
          id: "city-climax-act2-239",
          nextId: "city-climax-act2-240"
        }
      ],
      deathZones: [
        {
          x1: 17170,
          x2: 18960,
          y: -1070
        },
        {
          x1: 19410,
          x2: 21560,
          y: -1070
        },
        {
          x1: 22550,
          x2: 23780,
          y: -1330
        },
        {
          x1: 28470,
          x2: 29500,
          y: -2140
        },
        {
          x1: 31300,
          x2: 32e3,
          y: -2540
        },
        {
          x1: 32600,
          x2: 33420,
          y: -2830
        },
        {
          x1: 33420,
          x2: 34450,
          y: -2330
        },
        {
          x1: 47310,
          x2: 47600,
          y: -4570
        },
        {
          x1: 50320,
          x2: 51480,
          y: -5390
        },
        {
          x1: 51950,
          x2: 52150,
          y: -5890
        },
        {
          x1: 52630,
          x2: 54090,
          y: -6700
        },
        {
          x1: 54580,
          x2: 54790,
          y: -7220
        }
      ],
      collapseGroups: [
        {
          entryId: "secret-rail-entry",
          tailIds: ["secret-rail-tail"],
          delay: 52,
          triggered: false
        }
      ]
    };
  }
  __name(initializeRuntimeModule29, "initializeRuntimeModule");
  function getRuntimeBindings29() {
    return {
      act2LevelTemplate: {
        get: /* @__PURE__ */ __name(() => act2LevelTemplate, "get"),
        set: /* @__PURE__ */ __name((value) => {
          act2LevelTemplate = value;
        }, "set")
      },
      makeLevel2: {
        get: /* @__PURE__ */ __name(() => makeLevel2, "get"),
        set: /* @__PURE__ */ __name((value) => {
          makeLevel2 = value;
        }, "set")
      }
    };
  }
  __name(getRuntimeBindings29, "getRuntimeBindings");

  // src/traversal-animations.js
  var traversal_animations_exports = {};
  __export(traversal_animations_exports, {
    beginTraversalLaunch: () => beginTraversalLaunch,
    getRuntimeBindings: () => getRuntimeBindings30,
    initializeRuntimeModule: () => initializeRuntimeModule30,
    resetTraversalAnimation: () => resetTraversalAnimation,
    traversalAnimation: () => traversalAnimation,
    traversalGroundState: () => traversalGroundState,
    traversalLaunchValid: () => traversalLaunchValid,
    traversalSonicPose: () => traversalSonicPose,
    updateTraversalAnimation: () => updateTraversalAnimation
  });
  var traversalAnimation;
  function resetTraversalAnimation() {
    traversalAnimation.state = null;
    traversalAnimation.since = 0;
    traversalAnimation.launch = null;
  }
  __name(resetTraversalAnimation, "resetTraversalAnimation");
  function beginTraversalLaunch(device) {
    traversalAnimation.launch = {
      kind: device.cityVent ? "vent-launch" : "spring-launch",
      since: state.runFrames,
      face: p.face
    };
  }
  __name(beginTraversalLaunch, "beginTraversalLaunch");
  function traversalLaunchValid() {
    const launch = traversalAnimation.launch;
    return launch && !p.ground && p.scriptedLaunch && launch.since === p.poseJumpFrame && p.vy < 3 && !p.hurt && !p.airBoostActive && !p.bubbleSlam;
  }
  __name(traversalLaunchValid, "traversalLaunchValid");
  function traversalGroundState() {
    if (!p.ground || !p.surface || p.surface.grindable || p.loop || p.hurt || p.boosting || p.rolling || state.charge || p.bubbleSlam || p.airBoostActive)
      return null;
    if (state.runFrames - p.poseLandingFrame >= 0 && state.runFrames - p.poseLandingFrame < 6)
      return null;
    const dir = Number(keys.has("ArrowRight") || keys.has("KeyD")) - Number(keys.has("ArrowLeft") || keys.has("KeyA"));
    if (dir) {
      const foot = feet(), top = foot - bodyHeight();
      for (const h of state.level.hazards) {
        if (h.broken || h.type === "spikes" || foot <= h.y + 2 || top >= h.y + h.h - 2) continue;
        const wall = dir > 0 ? h.x : h.x + h.w;
        if (Math.abs(p.x + dir * 14 - wall) < 1.1) return "push";
      }
      return null;
    }
    if (Math.abs(p.vx) > 0.5 || !active(p.surface) || Math.abs(pose(p.surface).slope) > 0.25)
      return null;
    let left = false, right = false;
    for (const s of state.level.surfaces) {
      if (!active(s)) continue;
      const q = pose(s);
      const supports = /* @__PURE__ */ __name((x) => x >= q.x1 && x <= q.x2 && Math.abs(q.y1 + (x - q.x1) * q.slope - feet()) < 3, "supports");
      left ||= supports(p.x - FOOT_RADIUS);
      right ||= supports(p.x + FOOT_RADIUS);
      if (left && right) return null;
    }
    if (left === right) return null;
    const edge = left ? 1 : -1;
    return edge === p.face ? "balance-forward" : "balance-backward";
  }
  __name(traversalGroundState, "traversalGroundState");
  function updateTraversalAnimation() {
    if (!traversalLaunchValid()) traversalAnimation.launch = null;
    const state2 = traversalGroundState();
    if (state2 !== traversalAnimation.state) {
      traversalAnimation.state = state2;
      traversalAnimation.since = state.runFrames;
    }
  }
  __name(updateTraversalAnimation, "updateTraversalAnimation");
  function traversalSonicPose() {
    if (p.hurt || p.airBoostActive || p.bubbleSlam || state.charge || p.rolling) return null;
    const out = /* @__PURE__ */ __name((state3, sheet, frame3, extra = {}) => ({
      state: state3,
      sheet,
      frame: frame3,
      face: p.face,
      rotation: 0,
      ball: false,
      ...extra
    }), "out");
    const turns = p.surface?.spiralTurns;
    if (art.traversalLaunch && p.ground && p.surface?.grindable && Number.isFinite(turns) && turns !== 0) {
      const q = pose(p.surface), progress = Math.max(0, Math.min(1, (p.x - q.x1) / (q.x2 - q.x1))), phase = (progress * turns % 1 + 1) % 1;
      return out("grind-spiral", "traversalLaunch", 16 + Math.floor(phase * 16), {
        face: Math.sign(p.vx) || p.face,
        pivotY: 0,
        rotation: Math.atan(q.slope) * (Math.sign(p.vx) || p.face)
      });
    }
    if (art.traversalLaunch && traversalLaunchValid()) {
      const launch = traversalAnimation.launch, frame3 = Math.floor((state.runFrames - launch.since) / 3) % 8;
      if (launch.kind === "vent-launch")
        return out(launch.kind, "traversalLaunch", 8 + frame3, { face: -launch.face, pivotY: 0 });
      return out(launch.kind, "traversalLaunch", frame3, { face: launch.face });
    }
    if (!art.traversalActing) return null;
    const state2 = traversalGroundState();
    if (!state2) return null;
    const age = state2 === traversalAnimation.state ? Math.max(0, state.runFrames - traversalAnimation.since) : 0;
    const frame2 = Math.floor(age / (state2 === "push" ? 4 : 5)) % 8;
    return out(
      state2,
      "traversalActing",
      (state2 === "push" ? 16 : state2 === "balance-backward" ? 8 : 0) + frame2
    );
  }
  __name(traversalSonicPose, "traversalSonicPose");
  function initializeRuntimeModule30() {
    traversalAnimation = { state: null, since: 0, launch: null };
  }
  __name(initializeRuntimeModule30, "initializeRuntimeModule");
  function getRuntimeBindings30() {
    return {
      traversalAnimation: {
        get: /* @__PURE__ */ __name(() => traversalAnimation, "get"),
        set: /* @__PURE__ */ __name((value) => {
          traversalAnimation = value;
        }, "set")
      },
      resetTraversalAnimation: {
        get: /* @__PURE__ */ __name(() => resetTraversalAnimation, "get"),
        set: /* @__PURE__ */ __name((value) => {
          resetTraversalAnimation = value;
        }, "set")
      },
      beginTraversalLaunch: {
        get: /* @__PURE__ */ __name(() => beginTraversalLaunch, "get"),
        set: /* @__PURE__ */ __name((value) => {
          beginTraversalLaunch = value;
        }, "set")
      },
      traversalLaunchValid: {
        get: /* @__PURE__ */ __name(() => traversalLaunchValid, "get"),
        set: /* @__PURE__ */ __name((value) => {
          traversalLaunchValid = value;
        }, "set")
      },
      traversalGroundState: {
        get: /* @__PURE__ */ __name(() => traversalGroundState, "get"),
        set: /* @__PURE__ */ __name((value) => {
          traversalGroundState = value;
        }, "set")
      },
      updateTraversalAnimation: {
        get: /* @__PURE__ */ __name(() => updateTraversalAnimation, "get"),
        set: /* @__PURE__ */ __name((value) => {
          updateTraversalAnimation = value;
        }, "set")
      },
      traversalSonicPose: {
        get: /* @__PURE__ */ __name(() => traversalSonicPose, "get"),
        set: /* @__PURE__ */ __name((value) => {
          traversalSonicPose = value;
        }, "set")
      }
    };
  }
  __name(getRuntimeBindings30, "getRuntimeBindings");

  // src/game.js
  var canvas;
  var ctx;
  var $;
  var W;
  var H;
  var SONIC_VISUAL_SCALE;
  var FOOT_RADIUS;
  var keys;
  var JUMP_KEYS;
  var tuning;
  var BOOST_MAX;
  var movementTuning;
  var p;
  var extraMotion;
  var artFiles;
  var art;
  var artLoads;
  var failedArt;
  var sharedArt;
  var legacySonicArt;
  var cityTextureCache;
  var citySkyHeights;
  var backdropScaleCache;
  var cityCloudLayers;
  var sonicFrames;
  var motionFrames;
  var grindFrames;
  var brakeFrames;
  var boostFrames;
  var testInputCodes;
  function loadArt(name) {
    if (artLoads.has(name)) return artLoads.get(name);
    const image = new Image();
    const loading = new Promise((resolve) => {
      image.onload = () => {
        art[name] = image;
        if (name === "scorpion") prepareScorpionArt(image);
        resolve(true);
      };
      image.onerror = () => {
        failedArt.add(name);
        if (name === "recoveredCity") loadArt("collapse");
        if (name === "collapse") loadArt("city");
        if (failedArt.has("recoveredSpeedster") && failedArt.has("recoveredPeelout"))
          for (const fallback of legacySonicArt) loadArt(fallback);
        resolve(false);
      };
    });
    artLoads.set(name, loading);
    image.src = "assets/" + artFiles[name];
    return loading;
  }
  __name(loadArt, "loadArt");
  function loadActArt(act) {
    for (const name of sharedArt) loadArt(name);
    for (const name of act === 2 ? ["recoveredCity", "scorpion"] : ["city"]) loadArt(name);
  }
  __name(loadActArt, "loadActArt");
  function reconstructPixels(source, w, h) {
    const out = new Uint32Array(w * h * 4), ow = w * 2;
    for (let y = 0; y < h; y++)
      for (let x = 0; x < w; x++) {
        const e = source[y * w + x], b = source[Math.max(0, y - 1) * w + x], d = source[y * w + Math.max(0, x - 1)], f = source[y * w + Math.min(w - 1, x + 1)], v = source[Math.min(h - 1, y + 1) * w + x], i = y * 2 * ow + x * 2, edge = b !== v && d !== f;
        out[i] = edge && d === b ? d : e;
        out[i + 1] = edge && b === f ? f : e;
        out[i + ow] = edge && d === v ? d : e;
        out[i + ow + 1] = edge && v === f ? f : e;
      }
    return out;
  }
  __name(reconstructPixels, "reconstructPixels");
  function cityTexture(im) {
    if (cityTextureCache.has(im)) return cityTextureCache.get(im);
    if (!document.createElement) return im;
    try {
      const source = document.createElement("canvas");
      source.width = im.width;
      source.height = im.height;
      const sc = source.getContext("2d", { willReadFrequently: true });
      sc.drawImage(im, 0, 0);
      const pixels = sc.getImageData(0, 0, im.width, im.height), sharp = document.createElement("canvas");
      sharp.width = im.width * 2;
      sharp.height = im.height * 2;
      const dc = sharp.getContext("2d"), result = dc.createImageData(sharp.width, sharp.height);
      new Uint32Array(result.data.buffer).set(
        reconstructPixels(new Uint32Array(pixels.data.buffer), im.width, im.height)
      );
      dc.putImageData(result, 0, 0);
      cityTextureCache.set(im, sharp);
      return sharp;
    } catch (error) {
      cityTextureCache.set(im, im);
      return im;
    }
  }
  __name(cityTexture, "cityTexture");
  function sizedCityBackdrop(im, w, h) {
    if (!document.createElement) return cityTexture(im);
    const width = Math.round(w * canvas.width / W), height = Math.round(h * canvas.height / H), key = width + "x" + height;
    let entries = backdropScaleCache.get(im);
    if (!entries) {
      entries = /* @__PURE__ */ new Map();
      backdropScaleCache.set(im, entries);
    }
    if (entries.has(key)) return entries.get(key);
    const c = document.createElement("canvas");
    c.width = width;
    c.height = height;
    const dc = c.getContext("2d");
    dc.imageSmoothingEnabled = false;
    dc.drawImage(cityTexture(im), 0, 0, width, height);
    entries.set(key, c);
    return c;
  }
  __name(sizedCityBackdrop, "sizedCityBackdrop");
  function drawCityBackdrop(im, x, y, w, h, mirrored = false, layered = false) {
    const texture = sizedCityBackdrop(im, w, h), drift = Math.sin(state.step * 4e-3) * 18, unit = w / citySkyHeights.length;
    if (layered) {
      ctx.save();
      if (mirrored) {
        ctx.translate(x + w, y);
        ctx.scale(-1, 1);
        ctx.drawImage(texture, 0, 0, w, h);
      } else ctx.drawImage(texture, x, y, w, h);
      ctx.restore();
      return;
    }
    ctx.drawImage(texture, x, y, w, h);
    ctx.save();
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(x + w, y);
    for (let i = citySkyHeights.length - 1; i >= 0; i--) {
      const bottom = y + h * citySkyHeights[i] / 1024;
      ctx.lineTo(x + (i + 1) * unit, bottom);
      ctx.lineTo(x + i * unit, bottom);
    }
    ctx.closePath();
    ctx.clip();
    ctx.drawImage(texture, x + drift, y, w, h);
    if (drift > 0) ctx.drawImage(texture, x + drift - w, y, w, h);
    else if (drift < 0) ctx.drawImage(texture, x + drift + w, y, w, h);
    ctx.restore();
  }
  __name(drawCityBackdrop, "drawCityBackdrop");
  function cityCloudLayer(im, w, h) {
    const texture = sizedCityBackdrop(im, w, h);
    if (!document.createElement) return null;
    let layer = cityCloudLayers.get(texture);
    if (layer) return layer;
    const image = document.createElement("canvas");
    image.width = texture.width;
    image.height = Math.floor(texture.height * 220 / im.height / 4) * 4;
    const dc = image.getContext("2d");
    dc.imageSmoothingEnabled = false;
    dc.drawImage(texture, 0, 0);
    dc.globalCompositeOperation = "destination-out";
    const fade = 64;
    for (let y = Math.max(0, image.height - fade); y < image.height; y += 4) {
      dc.globalAlpha = (y - image.height + fade) / (fade - 4);
      dc.fillRect(0, y, image.width, 4);
    }
    layer = { image, height: image.height / (canvas.height / H) };
    cityCloudLayers.set(texture, layer);
    return layer;
  }
  __name(cityCloudLayer, "cityCloudLayer");
  function drawCityClouds(im, w, h, top) {
    const layer = cityCloudLayer(im, w, h);
    if (!layer) return;
    const scroll = Math.round(state.cam * 0.035 + state.step * 0.1), first = Math.floor(scroll / w);
    for (let tile = first - 1; tile <= first + 1; tile++) {
      const left = tile * w - scroll;
      if (left + w < 0 || left > W) continue;
      ctx.save();
      if (tile % 2) {
        ctx.translate(left + w, top);
        ctx.scale(-1, 1);
        ctx.drawImage(layer.image, 0, 0, w, layer.height);
      } else ctx.drawImage(layer.image, left, top, w, layer.height);
      ctx.restore();
    }
  }
  __name(drawCityClouds, "drawCityClouds");
  function gameSound(name, options) {
    return playGameSound?.(name, options) ?? false;
  }
  __name(gameSound, "gameSound");
  function notify(t) {
    $("#toast").textContent = t;
    state.toastTime = 160;
    $("#toast").style.display = "block";
  }
  __name(notify, "notify");
  function sparks(x, y, n = 8, color = "#ffda56") {
    for (let i = 0; i < n; i++)
      state.particles.push({
        x,
        y,
        vx: (Math.random() - 0.5) * 7,
        vy: -Math.random() * 6,
        life: 25,
        color
      });
  }
  __name(sparks, "sparks");
  function setup() {
    p.act1Motion = null;
    if (isPlaytest()) {
      setupPlaytest();
      return;
    }
    exitPlaytest();
    loadActArt(state.selectedAct);
    syncGameMusic?.({
      enabled: state.sound,
      mode: "ready",
      act: state.selectedAct,
      restart: true
    });
    state.testControlled = false;
    state.level = configureBoostMonitors(
      state.selectedAct === 2 ? addMiddleSection(makeLevel2()) : makeLevel()
    );
    configureDirectionalSpikes(state.level);
    selectStageRuntime();
    state.END = state.level.end;
    setupBossEncounter();
    state.rings = state.level.rings;
    state.enemies = state.level.enemies.map((e, i) => ({
      ...e,
      alive: true,
      phase: i * 1.3
    }));
    state.particles = [];
    state.clock = 0;
    state.runFrames = 0;
    state.count = 0;
    state.score = 0;
    state.lives = tuning.lives;
    state.checkpoint = 0;
    state.charge = 0;
    state.cam = 0;
    state.camY = 0;
    state.zoom = 1;
    state.boost = BOOST_MAX;
    state.stage = 0;
    state.shake = 0;
    keys.clear();
    state.visited.clear();
    state.stats = {
      jumps: 0,
      rolls: 0,
      hits: 0,
      deaths: 0,
      expressLandings: 0,
      recoveries: 0,
      rebound: 0,
      maxSpeed: 0,
      loops: 0,
      barriers: 0
    };
    respawn();
    updateHud();
    $("#toast").style.display = "none";
    $("#act-title").textContent = state.level.title || "NEON EXPRESS";
    $(".brand-sub").textContent = state.level.title || "NEON EXPRESS";
    $("#act-select").value = String(state.selectedAct);
  }
  __name(setup, "setup");
  function respawn() {
    resetTraversalAnimation();
    const c = state.level.checkpoints[state.checkpoint];
    resetPlatforms();
    Object.assign(p, {
      x: c.x,
      y: c.y - 20,
      vx: 0,
      vy: 0,
      ground: true,
      face: 1,
      inv: 80,
      roll: false,
      boosting: false,
      surface: state.level.surfaces.find((s) => s.id === c.surfaceId) ?? state.level.surfaces.find(
        (s) => c.x >= s.x1 && c.x <= s.x2 && Math.abs(yOn(s, c.x) - c.y) < 2
      ) ?? topAt(c.x)?.s ?? null,
      hurt: 0,
      jumpAttack: false,
      airSpeedLimit: null,
      scriptedLaunch: false,
      jumpHeld: false,
      jumpCut: false,
      boostLocked: false,
      rolling: false,
      dashRolling: false,
      contactSpeed: null,
      interactionsFrame: -1,
      rollAge: 0,
      lowRollFrames: 0,
      rollSpent: false,
      downHeld: false,
      rollBuffer: 0,
      brakeActive: false,
      brakeAge: 0,
      brakeSpeed: 0,
      brakeFace: 1,
      stopFrame: -100,
      landFrame: -1,
      landKind: null,
      poseJumpFrame: -100,
      poseLandingFrame: -100,
      grindEntryFrame: -100,
      grindExitFrame: -100,
      grindFast: false,
      grindFromFast: false,
      loop: null,
      airLaunchUntil: 0,
      lastX: c.x,
      lastY: c.y - 20
    });
    state.charge = 0;
    resetPlayerAbilities();
    p.poolTransfer = null;
    p.wrongRouteDrop = false;
    p.poolApproach = false;
    p.poolExit = false;
    resetBoostMonitors();
    state.coyote = tuning.coyote;
    state.jumpBuffer = 0;
    state.cam = Math.max(0, p.x - 230);
    state.camY = state.level.act === 2 ? p.y - H * 0.6 : 0;
    resetStageRuntime();
    resetCameraTracking();
    resetBossAttempt();
    resetAct1Motion();
    state.visited.clear();
    for (const r of state.rings) if (r.x >= c.x && r.x < c.x + 550) r.taken = false;
  }
  __name(respawn, "respawn");
  function start() {
    state.testControlled = false;
    if (state.mode === "over" && state.bossCheckpoint) {
      state.lives = tuning.lives;
      respawn();
    } else if (["ready", "over", "win"].includes(state.mode)) setup();
    state.mode = "playing";
    $("#overlay").classList.add("hidden");
    $("#pause").textContent = "\u2161";
    if (isPlaytest()) clearPlaytestInput();
    else {
      keys.clear();
      clearAct1Input();
    }
    canvas.focus();
    gameSound("start");
    updateHud();
  }
  __name(start, "start");
  function show(title, text, label) {
    $("#overlay").classList.remove("hidden");
    $(".intro").innerHTML = `<span class="eyebrow">${isPlaytest() ? "PLAYTEST" : `${state.level.title || "NEON EXPRESS"} ACT ${state.selectedAct}`}</span><h1>${title}</h1><p>${text}</p><button id="play" class="primary">${label} <span>\u25B6</span></button><span class="start-note">${isPlaytest() ? "\u2190 \u2192 / A D: move \xB7 Space: jump \xB7 Down: roll \xB7 P: pause \xB7 R: reset" : "Tap / hold Space: jump height \xB7 Down: roll \xB7 Left click / Shift / X: boost"}</span>`;
    $("#play").onclick = start;
  }
  __name(show, "show");
  function pause() {
    if (state.mode === "playing") {
      state.mode = "paused";
      keys.clear();
      clearAct1Input();
      show(
        isPlaytest() ? "PLAYTEST<br><em>paused.</em>" : "Catch your<br><em>breath.</em>",
        isPlaytest() ? "Static-surface experiment paused. Your movement state is preserved." : "Your run is paused.",
        "RESUME"
      );
      $("#pause").textContent = "\u25B6";
      gameSound("pause");
      updateHud();
    } else if (state.mode === "paused") start();
  }
  __name(pause, "pause");
  function die() {
    gameSound("death");
    state.lives--;
    state.stats.deaths++;
    state.count = 0;
    p.boosting = false;
    keys.clear();
    state.particles = state.particles.filter((a) => !a.ring);
    if (state.lives <= 0) {
      state.mode = "over";
      show(
        "Another<br><em>shot?</em>",
        "Tap Jump for short hops. Roll under gantries.<br>Gold rails reward speed; blue lower rails offer another chance.",
        "TRY AGAIN"
      );
    } else {
      respawn();
      notify("Checkpoint \u2022 " + state.level.checkpoints[state.checkpoint].name);
    }
    updateHud();
  }
  __name(die, "die");
  function hurt(x, gate = false) {
    if (p.inv > 0) return;
    state.stats.hits++;
    state.shake = 8;
    p.boosting = false;
    p.hurt = 22;
    p.jumpAttack = false;
    p.airSpeedLimit = null;
    p.airBoostFrames = 0;
    p.airBoostActive = false;
    p.bubbleSlam = false;
    if (p.shield === "bubble") {
      p.shield = null;
      p.inv = tuning.inv;
      p.vx = p.x < x ? -4 : 4;
      if (!gate) {
        p.vy = -6;
        p.ground = false;
        p.surface = null;
      }
      gameSound("shieldBreak");
      return;
    }
    if (state.count) {
      const n = Math.min(state.count, 16);
      for (let i = 0; i < n; i++)
        state.particles.push({
          x: p.x,
          y: p.y,
          vx: Math.cos(i * Math.PI / 8) * 5,
          vy: -4 - Math.abs(Math.sin(i)) * 5,
          life: 220,
          ring: true,
          age: 0
        });
      state.count = 0;
      p.inv = tuning.inv;
      p.vx = p.x < x ? -4 : 4;
      if (!gate) {
        p.vy = -6;
        p.ground = false;
        p.surface = null;
      }
      gameSound("hurt");
    } else die();
  }
  __name(hurt, "hurt");
  function press(k, automated = false) {
    if (!automated) state.testControlled = false;
    if (isPlaytest()) {
      handlePlaytestInput(k, true);
      return;
    }
    if (!usesAct1Motion() && (k === "ArrowDown" || k === "KeyS") && !keys.has(k) && state.mode === "playing") {
      p.rollBuffer = 6;
      p.rollSpent = false;
    }
    if (k === "KeyP" || k === "Escape") {
      pause();
      return;
    }
    if (k === "KeyR") {
      restart();
      return;
    }
    if (bossOwnsControls() && state.mode === "playing") return;
    if (usesAct1Motion() && state.mode === "playing") {
      inputAct1Motion(k, true);
      return;
    }
    if (["ShiftLeft", "ShiftRight", "KeyX", "MouseBoost"].includes(k) && state.mode === "playing" && !["ShiftLeft", "ShiftRight", "KeyX", "MouseBoost"].some((code) => keys.has(code))) {
      if (p.ground) p.groundBoostHeld = true;
      else p.airBoostRequested = true;
    }
    if (JUMP_KEYS.includes(k)) {
      if (["ready", "over", "win"].includes(state.mode)) {
        start();
        return;
      }
      if (state.mode === "playing") {
        const secondPress = !JUMP_KEYS.some((code) => keys.has(code));
        p.jumpHeld = true;
        p.jumpCut = false;
        if (secondPress && !p.ground && p.shield === "bubble" && !p.hurt && !p.wrongRouteDrop && !p.bubbleSlam) {
          beginBubbleSlam();
          keys.add(k);
          return;
        }
        if ((keys.has("ArrowDown") || keys.has("KeyS")) && p.ground && !p.surface?.grindable && Math.abs(p.vx) < 3) {
          state.charge = Math.min(16, state.charge + 4);
          sparks(p.x - 15 * p.face, p.y + 18, 4, "#69efff");
          gameSound("spindashCharge", { charge: state.charge / 20 });
        } else state.jumpBuffer = tuning.buffer;
      }
    }
    keys.add(k);
  }
  __name(press, "press");
  function release(k, automated = false) {
    if (!automated) state.testControlled = false;
    if (isPlaytest()) {
      handlePlaytestInput(k, false);
      return;
    }
    if (usesAct1Motion()) {
      inputAct1Motion(k, false);
      return;
    }
    keys.delete(k);
    if (["ShiftLeft", "ShiftRight", "KeyX", "MouseBoost"].includes(k) && !["ShiftLeft", "ShiftRight", "KeyX", "MouseBoost"].some((code) => keys.has(code))) {
      p.airBoostRequested = false;
      p.groundBoostHeld = false;
      p.airBoostFrames = 0;
      p.airBoostActive = false;
    }
    if (JUMP_KEYS.includes(k)) {
      p.jumpHeld = false;
      p.jumpCut = true;
      const cut = p.jumpReleaseVy ?? (p.underwater ? -2.5 : -5);
      if (p.vy < cut && state.runFrames >= (p.airLaunchUntil || 0)) p.vy = cut;
    }
  }
  __name(release, "release");
  function restart() {
    if (isPlaytest()) {
      resetPlaytest();
      state.testControlled = false;
      state.mode = "playing";
      $("#overlay").classList.add("hidden");
      $("#pause").textContent = "\u2161";
      updatePlaytestHud();
      canvas.focus();
      return;
    }
    setup();
    state.mode = "playing";
    $("#overlay").classList.add("hidden");
    $("#pause").textContent = "\u2161";
    canvas.focus();
    gameSound("start");
    updateHud();
  }
  __name(restart, "restart");
  function updateHud() {
    if (isPlaytest()) {
      updatePlaytestHud();
      return;
    }
    syncGameMusic?.({
      enabled: state.sound,
      mode: state.mode,
      act: state.selectedAct
    });
    if (typeof updatePixelHud === "function")
      updatePixelHud({
        rings: state.count,
        lives: state.lives,
        lifeImage: art.recoveredSpeedster,
        time: state.clock,
        score: state.score,
        boost: state.boost,
        maxBoost: BOOST_MAX,
        speed: Math.round(measurementSpeed() * 60),
        mode: state.mode,
        frame: state.step
      });
    $("#progress-fill").style.width = (state.mode === "win" ? 100 : Math.min(100, p.x / state.END * 100)) + "%";
  }
  __name(updateHud, "updateHud");
  function update() {
    if (isPlaytest()) {
      updatePlaytest();
      return;
    }
    state.step++;
    if (state.mode !== "playing") return;
    if (state.ending) {
      updateEndingScene();
      updateHud();
      return;
    }
    state.clock += 1 / 60;
    state.runFrames++;
    if (p.inv > 0) p.inv--;
    if (p.hurt > 0) p.hurt--;
    if (state.shake > 0) state.shake--;
    if (state.toastTime > 0 && !--state.toastTime) $("#toast").style.display = "none";
    updateWorldPlatforms();
    if (bossOwnsControls()) {
      if (state.boss.state === "destroyed") updateMovement();
      updateParticles();
      updateBossEncounter();
      if (state.boss?.state === "defeated") beginEndingScene();
      updateCamera();
      updateHud();
      return;
    }
    if (!(usesAct1Motion() ? updateAct1Movement() : updateMovement()) || state.mode !== "playing") {
      updateHud();
      return;
    }
    updateStageWorld();
    updateCityInteriors();
    if (state.mode !== "playing") {
      updateHud();
      return;
    }
    updateWaterState();
    if (!updateBreathing()) {
      updateHud();
      return;
    }
    const motionHandled = p.interactionsFrame === state.runFrames;
    if (!motionHandled) {
      collectWorldRings();
      activateWorldDevices();
      collectBoostMonitors();
    }
    updateBossEncounter();
    if (!motionHandled) {
      updateWorldEnemies();
      updateWorldCheckpoints();
    }
    updateStageCompletion();
    updateTraversalAnimation();
    updateParticles();
    if (state.charge) gameSound("spindashCharge", { charge: state.charge / 20 });
    else if (p.brakeActive) gameSound("brake", { speed: Math.abs(p.vx) });
    else if (p.boosting) gameSound("boost", { speed: measurementSpeed() });
    else if (p.ground && p.surface?.grindable) gameSound("grind", { speed: measurementSpeed() });
    else if (p.ground && !p.roll && Math.abs(p.vx) > 2) gameSound("run", { speed: Math.abs(p.vx) });
    updateCamera();
    updateHud();
  }
  __name(update, "update");
  function updateParticles() {
    for (const a of state.particles) {
      a.x += a.vx;
      a.y += a.vy;
      if (!a.trail) a.vy += 0.22;
      if (a.ring) {
        a.age++;
        const floor = topAt(a.x, a.y - 18);
        if (floor && a.y > floor.y - 10 && a.vy > 0) {
          a.y = floor.y - 10;
          a.vy = -Math.abs(a.vy) * 0.6;
        }
        if (a.age > 32 && Math.hypot(a.x - p.x, a.y - p.y) < 28) {
          state.count++;
          a.life = 0;
          gameSound("ring");
        }
      }
      a.life--;
    }
    state.particles = state.particles.filter((a) => a.life > 0);
  }
  __name(updateParticles, "updateParticles");
  function finishAct() {
    state.mode = "win";
    const rank = state.stats.deaths === 0 && state.stats.hits <= 1 && state.clock < (state.level.act === 2 ? 175 : 70) ? "S" : state.stats.deaths === 0 && state.clock < (state.level.act === 2 ? 220 : 100) ? "A" : "B";
    show(
      "Neon Express<br><em>cleared!</em>",
      `Rank ${rank} \xB7 ${state.count} rings \xB7 ${Math.floor(state.clock / 60)}:${String(Math.floor(state.clock % 60)).padStart(2, "0")}<br>${state.stats.expressLandings} express landings \xB7 ${state.stats.hits} hits \xB7 ${state.stats.deaths} falls`,
      "RUN AGAIN"
    );
    if (state.level.act === 1) {
      $(".intro").innerHTML += '<button id="next-act" class="secondary">CONTINUE TO ACT 2 \u2192</button>';
      $("#play").onclick = start;
      $("#next-act").onclick = () => {
        selectAct(2);
        start();
      };
    }
    gameSound("clear");
  }
  __name(finishAct, "finishAct");
  function ellipse(x, y, rx, ry, color) {
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.ellipse(x, y, rx, ry, 0, 0, Math.PI * 2);
    ctx.fill();
  }
  __name(ellipse, "ellipse");
  function ring(x, y, scale = 1) {
    drawPixelRing(x, y, scale);
  }
  __name(ring, "ring");
  function sonicPose() {
    const traversal = traversalSonicPose();
    if (traversal) return traversal;
    if (art.recoveredSpeedster || art.recoveredPeelout) return recoveredSonicPose();
    const speed = p.loop ? Math.abs(p.loop.speed) : Math.abs(p.surface?.contactMode === "oriented" ? p.contactSpeed : p.vx), face = p.face, age = state.runFrames - p.poseLandingFrame;
    const out = /* @__PURE__ */ __name((state2, frame3, extra2 = {}) => ({
      state: state2,
      frame: frame3,
      face,
      scale: 58 / 254,
      stretchX: 1,
      stretchY: 1,
      rotation: 0,
      ball: false,
      sheet: "sonic",
      ...extra2
    }), "out");
    const extra = /* @__PURE__ */ __name((state2, sheet, frame3, options = {}) => out(state2, frame3, { sheet, scale: extraMotion[sheet].scales[frame3], pivot: 0.58, ...options }), "extra");
    if (p.hurt) {
      const phase2 = Math.floor(state.runFrames / 2) % 5;
      return phase2 === 0 ? out("hurt", 18, { scale: 48 / 254 }) : extra("hurt", "transitions", 3 + phase2);
    }
    if (p.airBoostActive)
      return out("boost", Math.floor(state.runFrames / 2) % 8, {
        sheet: "boost",
        scale: 52 / 336
      });
    if (p.ground && p.surface?.grindable) {
      const fast = p.boosting || speed > 18 || p.grindFast && speed > 16;
      const phase2 = Math.floor(state.runFrames / 2) % 10;
      if (phase2 >= 4)
        return extra(fast ? "grind-fast" : "grind", "wind", (fast ? 12 : 6) + phase2 - 4, {
          face: Math.sign(p.vx) || face,
          rotation: Math.atan(pose(p.surface).slope) * (Math.sign(p.vx) || face)
        });
      return out(fast ? "grind-fast" : "grind", (fast ? 4 : 0) + phase2, {
        sheet: "grind",
        scale: 58 / 344,
        face: Math.sign(p.vx) || face,
        rotation: Math.atan(pose(p.surface).slope) * (Math.sign(p.vx) || face),
        stretchY: 1 - Math.min(1, (state.runFrames - (p.grindEntryFrame ?? -100)) / 5) * 0.015
      });
    }
    if (p.rolling || state.charge || p.bubbleSlam) {
      const phase2 = Math.floor(state.anim * 0.6) % 6;
      if (phase2 >= 2)
        return extra("roll", "transitions", 8 + phase2 - 2, {
          ball: true,
          diameter: 38,
          rotation: state.anim * 0.22,
          face: Math.sign(p.vx) || face
        });
      return out("roll", 22 + phase2, {
        ball: true,
        diameter: 38,
        rotation: state.anim * 0.22,
        face: Math.sign(p.vx) || face
      });
    }
    if (!p.ground) {
      const ja = state.runFrames - p.poseJumpFrame;
      if (ja >= 0 && ja < 4 && p.vy < 0) {
        if (ja === 0 || ja === 2)
          return out("takeoff", ja === 0 ? 12 : 13, { sheet: "motion", scale: 50 / 254 });
        const frame3 = ja === 1 ? 12 : 13;
        return extra("takeoff", "detail", frame3, {
          scale: extraMotion.detail.scales[frame3] * 50 / 58
        });
      }
      if (p.vy < -3) {
        if (p.vy >= -10.5 && p.vy < -9.5)
          return extra("rise", "detail", 14, { scale: extraMotion.detail.scales[14] * 50 / 58 });
        if (p.vy >= -7.5 && p.vy < -6.5)
          return extra("rise", "detail", 15, {
            ball: true,
            diameter: 38,
            rotation: state.anim * 0.04
          });
        return out("rise", p.vy < -9.5 ? 14 : p.vy < -6.5 ? 15 : 16, {
          sheet: "motion",
          scale: 50 / 254
        });
      }
      if (p.vy < 3) {
        const phase2 = Math.floor(ja / 2) % 4;
        if (phase2 === 1)
          return extra("apex", "detail", 15, {
            ball: true,
            diameter: 38,
            rotation: state.anim * 0.04
          });
        return out("apex", [17, 17, 18, 19][phase2], {
          sheet: "motion",
          ball: true,
          diameter: 38,
          rotation: state.anim * 0.04
        });
      }
      if (p.vy >= 4 && p.vy < 6)
        return extra("fall", "detail", 16, { scale: extraMotion.detail.scales[16] * 50 / 58 });
      if (p.vy >= 8 && p.vy < 10)
        return extra("fall", "detail", 17, { scale: extraMotion.detail.scales[17] * 50 / 58 });
      return out("fall", p.vy < 4 ? 20 : p.vy < 8 ? 21 : 22, { sheet: "motion", scale: 50 / 254 });
    }
    const dir = Number(keys.has("ArrowRight") || keys.has("KeyD")) - Number(keys.has("ArrowLeft") || keys.has("KeyA"));
    if (!p.loop && !p.boosting && (p.brakeActive && speed > 0.03 || dir && speed > 2 && dir !== Math.sign(p.vx))) {
      const age2 = p.brakeAge || 0, frame3 = age2 < 4 ? 0 : speed > 8 ? 1 : speed > 3 ? 2 : 3;
      return out("brake", frame3, {
        sheet: "brake",
        face: p.brakeActive ? p.brakeFace : Math.sign(p.vx),
        scale: 58 / 344
      });
    }
    if (!p.loop && !dir && !p.boosting && speed < 0.5 && state.runFrames - p.stopFrame < 12) {
      return out("stop", state.runFrames - p.stopFrame < 6 ? 4 : 5, {
        sheet: "brake",
        face: p.brakeFace,
        scale: 58 / 344
      });
    }
    if (age >= 0 && age < 6) {
      if (age === 0) return out("land", 23, { sheet: "motion" });
      if (age === 5) return out("land", 17);
      return extra("land", "transitions", age - 1, { stretchY: age < 3 ? 0.97 : 1 });
    }
    if (p.boosting || speed > 17) {
      const phase2 = Math.floor(state.runFrames * 14 / 16) % 14;
      if (phase2 >= 8)
        return extra("boost", "wind", phase2 - 8, {
          scale: extraMotion.wind.scales[phase2 - 8] * 52 / 58,
          pivot: 0.57
        });
      return out("boost", phase2, { sheet: "boost", scale: 52 / 336 });
    }
    if (speed > 0.5) {
      const frame3 = Math.floor(state.anim * 0.48) % 12;
      return out("run", frame3, { sheet: "motion" });
    }
    const phase = state.runFrames % 360, frame2 = phase < 140 ? Math.floor(state.runFrames / 38) % 2 : phase < 174 ? 2 : phase < 210 ? 3 : phase < 258 ? 4 : phase < 300 ? 5 : 0;
    if (phase < 140) return extra("idle", "detail", Math.floor(state.runFrames / 8) % 6);
    return out("idle", frame2, { stretchY: 1 + Math.sin(state.runFrames * 0.075) * 8e-3 });
  }
  __name(sonicPose, "sonicPose");
  function spritePixel(value, axis = "x") {
    const pixels = state.zoom * (axis === "x" ? canvas.width / W : canvas.height / H);
    return Math.round(value * pixels) / pixels;
  }
  __name(spritePixel, "spritePixel");
  function drawSonicFrame(q) {
    if (recoveredSpriteFrames[q.sheet] && art[q.sheet] && document.createElement)
      return drawRecoveredSonicFrame(q);
    const sheet = q.sheet || "sonic", im = art[sheet] || art.sonic, frames = art[sheet] ? extraMotion[sheet] ? extraMotion[sheet].frames : sheet === "motion" ? motionFrames : sheet === "boost" ? boostFrames : sheet === "brake" ? brakeFrames : sheet === "grind" ? grindFrames : sonicFrames : sonicFrames;
    const frame2 = art[sheet] ? q.frame : q.ball ? 22 : q.state === "run" ? 6 : q.state === "land" ? 16 : q.state === "boost" ? 20 : q.state === "brake" ? 18 : q.state === "stop" ? 19 : q.state.startsWith("grind") ? 12 : q.state === "idle" ? 0 : 13;
    const [l, t, r, b] = frames[frame2], sw = r - l, sh = b - t;
    if (q.ball) {
      const scale2 = q.diameter / Math.max(sw, sh), dw2 = spritePixel(sw * scale2), dh2 = spritePixel(sh * scale2, "y");
      ctx.translate(0, p.ground ? 20 - dh2 / 2 : 1);
      ctx.rotate(q.rotation);
      ctx.drawImage(im, l, t, sw, sh, spritePixel(-dw2 / 2), spritePixel(-dh2 / 2, "y"), dw2, dh2);
      return;
    }
    const scale = (sheet !== "sonic" && !art[sheet] ? 58 / 254 : q.scale) * SONIC_VISUAL_SCALE, dw = spritePixel(sw * scale * q.stretchX), dh = spritePixel(sh * scale * q.stretchY, "y");
    const pivots = [
      0.6,
      0.6,
      0.6,
      0.6,
      0.53,
      0.6,
      0.6,
      0.57,
      0.59,
      0.57,
      0.6,
      0.6,
      0.59,
      0.57,
      0.5,
      0.55,
      0.6,
      0.61,
      0.53,
      0.57,
      0.58,
      0.58
    ];
    const pivot = extraMotion[sheet] && art[sheet] ? q.pivot ?? 0.58 : sheet === "grind" && art.grind ? 0.56 : sheet === "brake" && art.brake ? 0.58 : sheet === "boost" && art.boost ? [215, 201, 193, 198, 215, 201, 179, 198][frame2] / sw : sheet === "motion" && art.motion ? [
      0.57,
      0.59,
      0.6,
      0.6,
      0.57,
      0.6,
      0.59,
      0.57,
      0.6,
      0.57,
      0.6,
      0.58,
      0.59,
      0.57,
      0.58,
      0.56,
      0.5,
      0.5,
      0.5,
      0.5,
      0.56,
      0.56,
      0.56,
      0.59
    ][frame2] : pivots[frame2];
    if (q.state === "brake" || q.state.startsWith("grind")) {
      ctx.translate(0, 20);
      ctx.rotate(q.rotation || 0);
      ctx.translate(0, -20);
    }
    ctx.drawImage(im, l, t, sw, sh, spritePixel(-dw * pivot), spritePixel(20, "y") - dh, dw, dh);
  }
  __name(drawSonicFrame, "drawSonicFrame");
  function sonic() {
    if (p.inv > 0 && state.step % 10 < 4 && state.mode === "playing") return;
    const q = sonicPose();
    ctx.save();
    if (usesAct1Motion()) {
      const body = act1Body();
      ctx.translate(body.x, body.y + (p.ground ? body.hh - 20 : -1));
      if (p.ground) {
        ctx.translate(0, 20 - body.hh);
        ctx.rotate(body.angle);
        ctx.translate(0, body.hh - 20);
      }
    } else ctx.translate(p.x, p.y);
    const transform = ctx.getTransform?.();
    if (transform)
      ctx.setTransform(
        transform.a,
        transform.b,
        transform.c,
        transform.d,
        Math.round(transform.e),
        Math.round(transform.f)
      );
    if (p.loop) {
      ctx.translate(0, 20);
      ctx.rotate(-p.loop.theta);
      ctx.translate(0, -20);
    }
    if (p.ground && p.surface?.contactMode === "oriented")
      ctx.rotate(Math.atan2(p.surface.y2 - p.surface.y1, p.surface.x2 - p.surface.x1));
    ctx.scale(q.face, 1);
    if (p.boosting && !p.surface?.grindable) {
      cityPixelOval(-14, 1, 42, 18, "#22caff44");
      for (let i = 0; i < 12; i++) {
        const a = -1.2 + i * 0.2, b = a + 0.2;
        cityPixelLine(
          Math.cos(a) * 25,
          Math.sin(a) * 25,
          Math.cos(b) * 25,
          Math.sin(b) * 25,
          "#81eeff",
          2
        );
      }
    }
    if (art.recoveredSpeedster || art.recoveredPeelout || art.sonic) {
      const entry = state.runFrames - p.grindEntryFrame;
      if (!recoveredSpriteFrames[q.sheet] && q.state.startsWith("grind") && entry >= 0 && entry < 5) {
        const a = (entry + 1) / 5;
        ctx.globalAlpha = 1 - a;
        drawSonicFrame({
          ...q,
          state: p.grindFromFast ? "boost" : "run",
          sheet: p.grindFromFast ? "boost" : "motion",
          frame: p.grindFromFast ? Math.floor(state.runFrames / 2) % 8 : 6,
          scale: p.grindFromFast ? 52 / 336 : 58 / 254,
          rotation: 0
        });
        ctx.globalAlpha = a;
        drawSonicFrame(q);
        ctx.globalAlpha = 1;
      } else drawSonicFrame(q);
    } else {
      ellipse(0, 0, 18, 23, "#1679ee");
      ellipse(10, -10, 8, 12, "white");
      ellipse(14, -9, 3, 7, "#13334c");
      ellipse(12, 1, 12, 7, "#f6c999");
      ellipse(23, -3, 4, 3, "#101d39");
      ellipse(-10, 20, 14, 6, "#ee2856");
      ellipse(12, 20, 14, 6, "#ee2856");
    }
    ctx.restore();
  }
  __name(sonic, "sonic");
  function sign(x, y, text, type) {
    drawPixelSign(x, y, text, type);
  }
  __name(sign, "sign");
  function drawRail(s) {
    if (s.secretDepth > 4 && !state.level.middleSection?.secretRevealed) return;
    if (s.sealedBy && !active(s)) return;
    const q = pose(s), left = Math.max(q.x1, state.cam - 30), right = Math.min(q.x2, state.cam + W / state.zoom + 30);
    if (left >= right || Math.min(q.y1, q.y2) > state.camY + H / state.zoom + 80 || Math.max(q.y1, q.y2) + 52 < state.camY - 80)
      return;
    ctx.save();
    if (!active(s)) ctx.globalAlpha = 0.14;
    drawAct2Supports(s, left, right);
    ctx.restore();
  }
  __name(drawRail, "drawRail");
  function draw() {
    if (isPlaytest()) {
      drawPlaytest();
      return;
    }
    ctx.save();
    ctx.scale(canvas.width / W, canvas.height / H);
    ctx.imageSmoothingEnabled = false;
    ctx.fillStyle = "#0d082d";
    ctx.fillRect(0, 0, W, H);
    if (state.level.act === 2) drawAct2Background();
    else if (art.city) {
      const bw = art.city.width / art.city.height * H, offset = state.cam * 0.18 % bw;
      drawCityBackdrop(art.city, -offset, 0, bw, H);
      drawCityBackdrop(art.city, bw - offset, 0, bw, H);
    }
    ctx.fillStyle = "#130d3280";
    ctx.fillRect(0, 0, W, 75);
    ctx.save();
    ctx.scale(state.zoom, state.zoom);
    ctx.translate(
      -state.cam + (state.shake ? Math.sin(state.step * 3) * state.shake * 0.3 : 0),
      -state.camY + (state.shake ? Math.cos(state.step * 2) * state.shake * 0.2 : 0)
    );
    if (state.level.act === 2) {
      drawAct2Structures();
      drawMiddleSection();
    } else drawPixelCityStructures();
    drawCityDetails();
    for (const s of state.level.surfaces) drawRail(s);
    if (state.level.act === 2) drawAct2World();
    drawBossEncounter();
    for (const h of state.level.hazards) {
      if (h.broken) continue;
      if (h.x + h.w < state.cam - 100 || h.x > state.cam + W / state.zoom + 100)
        continue;
      if (h.type === "bulkhead") {
        drawAct2Bulkhead(h);
        continue;
      }
      if (h.type === "breakable") {
        drawCityBreakable(h);
      } else if (h.type === "spikes") {
        drawPixelSpikes(h);
      } else {
        ctx.fillStyle = "#171c40";
        ctx.fillRect(h.x, h.y, h.w, h.h);
        ctx.fillStyle = "#364971";
        ctx.fillRect(h.x, h.y, h.w, 12);
        ctx.fillStyle = "#a32776";
        ctx.fillRect(h.x, h.y + h.h - 12, h.w, 12);
        ctx.fillStyle = "#ff91d1";
        ctx.fillRect(h.x, h.y + h.h - 3, h.w, 3);
        for (let x = h.x + 8; x < h.x + h.w; x += 26) {
          ctx.fillStyle = "#342547";
          ctx.fillRect(x, h.y + 20, 12, h.h - 40);
          ctx.fillStyle = "#ffaedd";
          ctx.fillRect(x, h.y + h.h - 10, 13, 3);
        }
        drawPixelSign(h.x + h.w / 2, h.y + h.h - 28, "ROLL", "roll");
        ctx.fillStyle = "#ff8ad72b";
        ctx.fillRect(h.x, h.y + h.h, h.w, h.floor - h.y - h.h);
      }
    }
    for (const pad of state.level.pads) {
      if (pad.sealedBy && !state.level.hazards.find((h) => h.id === pad.sealedBy)?.broken)
        continue;
      if (pad.x < state.cam - 60 || pad.x > state.cam + W / state.zoom + 60)
        continue;
      if (pad.poolBooster) continue;
      if (pad.cityVent) {
        drawPolishedVent(pad);
        continue;
      }
      drawPoolBooster({ ...pad, launchX: 18, power: 0 });
    }
    for (const spring of state.level.springs || []) drawPolishedSpring(airDevicePose(spring));
    for (const monitor of state.level.monitors || []) drawBoostMonitor(monitorPose(monitor));
    for (const s of state.level.signs)
      if (s.x > state.cam - 200 && s.x < state.cam + W / state.zoom + 200)
        sign(s.x, s.y, s.text, s.type);
    for (const r of state.rings)
      if (!r.taken && (!r.sealedBy || state.level.hazards.find((h) => h.id === r.sealedBy)?.broken) && r.x > state.cam - 30 && r.x < state.cam + W / state.zoom + 30)
        ring(r.x, r.y, 0.35 + 0.65 * Math.abs(Math.cos(state.step * 0.065)));
    for (const e of state.enemies)
      if (e.alive && e.x > state.cam - 60 && e.x < state.cam + W / state.zoom + 60) {
        drawPixelEnemy(e);
      }
    for (const [i, c] of state.level.checkpoints.entries()) {
      ctx.fillStyle = "#5988b9";
      ctx.fillRect(c.x, c.y - 75, 4, 75);
      cityPixelOval(c.x + 2, c.y - 77, 12, 12, "#14253d");
      cityPixelOval(c.x + 2, c.y - 77, 9, 9, state.checkpoint >= i ? "#ffdc58" : "#fd4db9");
    }
    const goalY = state.level.act === 2 ? state.level.arena.y - 70 : 325;
    if (state.level.act !== 2) sign(state.END, goalY, "GOAL", "express");
    for (let x = state.END - 24; state.level.act !== 2 && x < state.END + 24; x += 8)
      for (let y = goalY - 20; y < goalY + 55; y += 8) {
        ctx.fillStyle = (Math.floor(x / 8) + Math.floor(y / 8)) % 2 ? "#fcf5ff" : "#19264a";
        ctx.fillRect(x, y, 8, 8);
      }
    for (const a of state.particles) {
      if (a.x < state.cam - 100 || a.x > state.cam + W / state.zoom + 100)
        continue;
      ctx.globalAlpha = Math.min(1, a.life / 16);
      if (a.ring) ring(a.x, a.y, 0.8);
      else if (a.grind) {
        cityPixelLine(
          a.x,
          a.y,
          a.x - Math.sign(a.vx) * (a.trail ? 10 : 3),
          a.y + (a.trail ? 0 : 2),
          a.color,
          2
        );
      } else if (a.skid && !a.trail) {
        const size = a.size * (1 + (20 - a.life) * 0.025);
        cityPixelRect(a.x - size / 2, a.y - size / 2, size, size, a.color);
        cityPixelRect(a.x - size * 0.75, a.y, size * 1.5, size * 0.6, a.color);
      } else {
        cityPixelRect(a.x, a.y, a.trail ? 24 : 4, a.trail ? 8 : 4, a.color);
      }
      ctx.globalAlpha = 1;
    }
    if (state.ending && endingArtReady()) drawEndingScene(state.ending);
    else {
      if (p.ground) cityPixelOval(p.x, p.y + 21, 17, 4, "#060c2466");
      sonic();
      drawPlayerAbilities();
    }
    ctx.restore();
    ctx.restore();
    if (state.mode !== "playing") updateHud();
  }
  __name(draw, "draw");
  function frame(t) {
    if (isPlaytest()) {
      framePlaytest(t);
      return;
    }
    if (!state.last) state.last = t;
    state.acc += Math.min(100, t - state.last);
    state.last = t;
    let updated = false;
    while (state.acc >= 1e3 / 60) {
      if (!state.testControlled) {
        update();
        updated = true;
      }
      state.acc -= 1e3 / 60;
    }
    if (updated || state.testControlled || state.mode !== "playing") draw();
    requestAnimationFrame(frame);
  }
  __name(frame, "frame");
  function readGameState() {
    if (isPlaytest()) return readPlaytestState();
    return {
      status: state.mode,
      act: state.selectedAct,
      route: p.surface?.kind ?? "air",
      rings: state.count,
      lives: state.lives,
      boost: Math.round(state.boost),
      progress: Math.round(p.x / state.END * 100),
      timeSeconds: Math.floor(state.clock),
      frame: state.runFrames,
      x: p.x,
      y: p.y,
      vx: p.vx,
      vy: p.vy,
      grounded: p.ground,
      shield: p.shield,
      underwater: p.underwater,
      airSeconds: Math.ceil(p.airRemaining / 60),
      airBoostAvailable: !p.airBoostUsed,
      checkpoint: state.checkpoint,
      sector: state.level.sectors[state.stage].name,
      testControlled: state.testControlled,
      ending: state.ending ? {
        beat: state.ending.beat,
        frame: state.ending.frame,
        done: state.ending.done
      } : null,
      boss: state.boss ? {
        state: state.boss.state,
        hits: state.boss.hits,
        bites: state.boss.bites,
        laserMode: state.boss.laserMode
      } : null,
      ...state.stats
    };
  }
  __name(readGameState, "readGameState");
  function stepGameFrames(input) {
    if (!input || typeof input !== "object" || Array.isArray(input) || Object.keys(input).some((k) => !["keys", "frames"].includes(k)) || !Array.isArray(input.keys) || input.keys.some((k) => !Object.hasOwn(testInputCodes, k)) || new Set(input.keys).size !== input.keys.length || !Number.isInteger(input.frames) || input.frames < 1 || input.frames > 600)
      throw Error("Expected keys from left/right/jump/down/boost and integer frames from 1 to 600");
    if (input.keys.includes("left") && input.keys.includes("right"))
      throw Error("Choose one movement direction");
    if (!["playing", "paused"].includes(state.mode))
      throw Error("Start or restart the game before stepping");
    if (state.mode === "paused") start();
    for (const key of [...keys]) release(key, true);
    state.testControlled = true;
    const codes = input.keys.map((k) => testInputCodes[k]), deathsBefore = state.stats.deaths;
    let framesAdvanced = 0;
    try {
      codes.sort((a, b) => Number(b === "ArrowDown") - Number(a === "ArrowDown"));
      for (const key of codes) press(key, true);
      for (; framesAdvanced < input.frames && state.mode === "playing"; ) {
        update();
        framesAdvanced++;
        if (state.stats.deaths !== deathsBefore) break;
      }
    } finally {
      for (const key of [...keys]) release(key, true);
    }
    updateHud();
    draw();
    return { ...readGameState(), framesAdvanced };
  }
  __name(stepGameFrames, "stepGameFrames");
  function initializeRuntimeModule31() {
    canvas = document.querySelector("#game");
    ctx = canvas.getContext("2d");
    $ = /* @__PURE__ */ __name((s) => document.querySelector(s), "$");
    W = 960;
    H = 540;
    SONIC_VISUAL_SCALE = 1.07;
    FOOT_RADIUS = 9;
    keys = /* @__PURE__ */ new Set();
    JUMP_KEYS = ["Space", "ArrowUp", "KeyW"];
    tuning = { lives: 3, inv: 78, coyote: 6, buffer: 8 };
    BOOST_MAX = 90;
    movementTuning = {
      counterBrake: 1.25,
      precisionSpeed: 3,
      groundGrip: 0.65,
      recoveryGrip: 0.8
    };
    state.testControlled = false;
    state.selectedAct = window.DEFAULT_ACT === 2 ? 2 : 1;
    state.level = void 0;
    state.END = 29e3;
    state.mode = "ready";
    state.cam = 0;
    state.camY = 0;
    state.zoom = 1;
    state.clock = 0;
    state.lives = 3;
    state.count = 0;
    state.score = 0;
    state.charge = 0;
    state.checkpoint = 0;
    state.toastTime = 0;
    state.sound = false;
    state.particles = [];
    state.rings = [];
    state.enemies = [];
    state.last = 0;
    state.acc = 0;
    state.step = 0;
    state.boost = BOOST_MAX;
    state.shake = 0;
    state.anim = 0;
    state.jumpBuffer = 0;
    state.coyote = 0;
    state.stage = 0;
    state.runFrames = 0;
    state.stats = {
      jumps: 0,
      rolls: 0,
      hits: 0,
      deaths: 0,
      expressLandings: 0,
      recoveries: 0,
      rebound: 0,
      maxSpeed: 0,
      loops: 0,
      barriers: 0
    };
    state.visited = /* @__PURE__ */ new Set();
    p = {
      x: 120,
      y: 400,
      vx: 0,
      vy: 0,
      ground: false,
      face: 1,
      inv: 0,
      roll: false,
      boosting: false,
      surface: null,
      hurt: 0,
      jumpAttack: false,
      airSpeedLimit: null,
      scriptedLaunch: false,
      jumpHeld: false,
      jumpCut: false,
      boostLocked: false,
      rolling: false,
      dashRolling: false,
      contactSpeed: null,
      interactionsFrame: -1,
      rollAge: 0,
      lowRollFrames: 0,
      rollSpent: false,
      downHeld: false,
      rollBuffer: 0
    };
    extraMotion = { "detail": { "frames": [[39, 53, 253, 320], [299, 52, 504, 320], [553, 52, 751, 320], [805, 52, 1012, 320], [1057, 50, 1262, 320], [1308, 47, 1510, 320], [31, 365, 256, 630], [294, 364, 512, 635], [568, 363, 760, 631], [779, 365, 1024, 639], [1071, 363, 1267, 635], [1301, 365, 1514, 635], [28, 727, 249, 936], [307, 682, 512, 957], [565, 682, 768, 957], [808, 734, 1017, 942], [1044, 712, 1271, 957], [1280, 717, 1525, 958]], "scales": [0.21245421245421245, 0.21245421245421245, 0.21245421245421245, 0.21245421245421245, 0.21245421245421245, 0.21245421245421245, 0.2116788321167883, 0.2116788321167883, 0.2116788321167883, 0.2116788321167883, 0.2116788321167883, 0.2116788321167883, 0.2109090909090909, 0.2109090909090909, 0.2109090909090909, 0.2109090909090909, 0.2109090909090909, 0.2109090909090909] }, "wind": { "frames": [[21, 37, 251, 250], [272, 42, 509, 251], [527, 36, 759, 253], [776, 36, 1009, 253], [1031, 37, 1265, 251], [1287, 35, 1514, 251], [24, 285, 256, 501], [285, 292, 512, 501], [543, 292, 760, 501], [784, 292, 1012, 501], [1048, 285, 1263, 501], [1299, 292, 1509, 501], [14, 526, 256, 736], [287, 534, 512, 738], [527, 532, 768, 738], [796, 535, 1024, 738], [1050, 527, 1274, 738], [1290, 539, 1527, 738], [23, 775, 256, 993], [275, 770, 512, 1002], [535, 775, 768, 994], [815, 784, 1024, 994], [1074, 775, 1277, 998], [1309, 769, 1500, 999]], "scales": [0.2672811059907834, 0.2672811059907834, 0.2672811059907834, 0.2672811059907834, 0.2672811059907834, 0.2672811059907834, 0.26851851851851855, 0.26851851851851855, 0.26851851851851855, 0.26851851851851855, 0.26851851851851855, 0.26851851851851855, 0.27488151658767773, 0.27488151658767773, 0.27488151658767773, 0.27488151658767773, 0.27488151658767773, 0.27488151658767773, 0.25, 0.25, 0.25, 0.25, 0.25, 0.25] }, "transitions": { "frames": [[55, 37, 352, 362], [403, 119, 697, 362], [763, 76, 1044, 362], [1144, 48, 1403, 362], [34, 420, 362, 724], [427, 441, 685, 724], [754, 425, 1085, 724], [1147, 422, 1416, 724], [67, 772, 325, 1024], [421, 770, 677, 1024], [776, 770, 1033, 1024], [1141, 770, 1397, 1026]], "scales": [0.17846153846153845, 0.17846153846153845, 0.17846153846153845, 0.17846153846153845, 0.19078947368421054, 0.19078947368421054, 0.19078947368421054, 0.19078947368421054, 0.2265625, 0.2265625, 0.2265625, 0.2265625] } };
    artFiles = {
      recoveredCity: "city-recovered-burning.png",
      recoveredSpeedster: "sonic-recovered-speedster.png",
      recoveredPeelout: "sonic-recovered-peelout.png",
      city: "city.png",
      collapse: "city-collapse.png",
      sonic: "sonic-expressive.png",
      motion: "sonic-motion.png",
      boost: "sonic-boost.png",
      brake: "sonic-brake.png",
      grind: "sonic-grind.png",
      detail: "sonic-detail.png",
      wind: "sonic-wind.png",
      transitions: "sonic-transitions.png",
      supplemental: "sonic-supplemental.png",
      peeloutCycle: "sonic-peelout-cycle.png",
      traversalActing: "sonic-traversal-acting.png",
      traversalLaunch: "sonic-traversal-launch.png",
      scorpion: "egg-scorpion-parts.png"
    };
    art = Object.fromEntries(Object.keys(artFiles).map((name) => [name, null]));
    artLoads = /* @__PURE__ */ new Map();
    failedArt = /* @__PURE__ */ new Set();
    sharedArt = [
      "recoveredSpeedster",
      "recoveredPeelout",
      "supplemental",
      "peeloutCycle",
      "traversalActing",
      "traversalLaunch"
    ];
    legacySonicArt = ["sonic", "motion", "boost", "brake", "grind", "detail", "wind", "transitions"];
    loadActArt(state.selectedAct);
    cityTextureCache = /* @__PURE__ */ new WeakMap();
    citySkyHeights = [350, 350, 240, 240, 240, 305, 305, 350, 400, 420, 395, 395, 270, 270, 270, 315];
    backdropScaleCache = /* @__PURE__ */ new WeakMap();
    cityCloudLayers = /* @__PURE__ */ new WeakMap();
    sonicFrames = [
      [37, 15, 235, 269],
      [287, 17, 481, 269],
      [547, 15, 728, 269],
      [800, 15, 987, 269],
      [1048, 17, 1264, 269],
      [1309, 15, 1495, 269],
      [32, 290, 246, 542],
      [279, 293, 521, 538],
      [564, 295, 749, 538],
      [783, 294, 1044, 542],
      [1077, 290, 1261, 541],
      [1316, 294, 1509, 540],
      [35, 588, 235, 775],
      [296, 544, 518, 789],
      [557, 590, 747, 771],
      [780, 545, 1012, 781],
      [1048, 587, 1285, 781],
      [1306, 562, 1515, 778],
      [10, 790, 265, 1009],
      [281, 790, 508, 1010],
      [533, 800, 798, 1009],
      [809, 800, 1050, 1008],
      [1085, 822, 1265, 1001],
      [1327, 820, 1505, 998]
    ];
    motionFrames = [
      [30, 18, 282, 259],
      [320, 23, 506, 261],
      [566, 22, 745, 263],
      [820, 18, 1011, 263],
      [1054, 28, 1297, 261],
      [1320, 20, 1526, 263],
      [25, 287, 256, 537],
      [298, 288, 536, 544],
      [561, 288, 749, 541],
      [786, 285, 1052, 521],
      [1073, 291, 1271, 541],
      [1309, 288, 1536, 541],
      [27, 586, 235, 777],
      [296, 556, 516, 795],
      [554, 552, 749, 795],
      [808, 565, 1032, 779],
      [1078, 586, 1277, 769],
      [1327, 594, 1512, 775],
      [44, 809, 235, 999],
      [292, 811, 487, 999],
      [547, 805, 777, 1003],
      [797, 806, 1035, 1016],
      [1045, 795, 1293, 1007],
      [1313, 816, 1511, 1005]
    ];
    grindFrames = [
      [62, 46, 418, 380],
      [537, 53, 903, 380],
      [1021, 71, 1379, 380],
      [1500, 53, 1859, 380],
      [1935, 61, 2384, 380],
      [2432, 82, 2848, 380],
      [2907, 84, 3332, 380],
      [3393, 77, 3807, 380]
    ];
    brakeFrames = [
      [42, 20, 405, 368],
      [469, 33, 875, 368],
      [928, 36, 1311, 368],
      [1383, 32, 1752, 368],
      [1873, 36, 2158, 368],
      [2338, 24, 2590, 368]
    ];
    boostFrames = [
      [32, 80, 451, 410],
      [486, 80, 893, 410],
      [944, 80, 1320, 414],
      [1389, 80, 1747, 416],
      [32, 517, 451, 842],
      [486, 517, 896, 843],
      [958, 517, 1311, 845],
      [1389, 517, 1744, 844]
    ];
    $("#act-select").onchange = (e) => {
      selectAct(e.target.value === "playtest" ? "playtest" : Number(e.target.value));
      canvas.focus();
    };
    $("#play").onclick = start;
    $("#pause").onclick = pause;
    $("#restart").onclick = restart;
    $("#sound").onclick = () => {
      state.sound = setGameSoundEnabled?.(!state.sound) ?? false;
      $("#sound").textContent = state.sound ? "Sound on" : "Sound off";
      $("#sound").setAttribute("aria-label", state.sound ? "Disable sound" : "Enable sound");
      gameSound("menu");
      syncGameMusic?.({
        enabled: state.sound && !isPlaytest(),
        mode: state.mode,
        act: state.selectedAct,
        gesture: true
      });
      canvas.focus();
    };
    canvas.addEventListener("pointerdown", (e) => {
      if (e.pointerType !== "mouse" || e.button !== 0 || state.mode !== "playing") return;
      e.preventDefault();
      canvas.focus();
      canvas.setPointerCapture(e.pointerId);
      press("MouseBoost");
    });
    for (const name of ["pointerup", "pointercancel", "lostpointercapture"])
      canvas.addEventListener(name, (e) => {
        if (e.pointerType === "mouse") release("MouseBoost");
      });
    window.addEventListener("keydown", (e) => {
      if ([
        "ArrowLeft",
        "ArrowRight",
        "ArrowUp",
        "ArrowDown",
        "Space",
        "KeyW",
        "KeyA",
        "KeyS",
        "KeyD",
        "Escape",
        "KeyP",
        "KeyR",
        "ShiftLeft",
        "ShiftRight",
        "KeyX"
      ].includes(e.code) && !e.target.matches("button,a,select")) {
        e.preventDefault();
        if (!e.repeat) press(e.code);
      }
    });
    window.addEventListener("keyup", (e) => release(e.code));
    window.addEventListener("blur", () => {
      keys.clear();
      if (state.mode === "playing") pause();
    });
    testInputCodes = {
      left: "ArrowLeft",
      right: "ArrowRight",
      jump: "Space",
      down: "ArrowDown",
      boost: "ShiftLeft"
    };
    if (document.modelContext?.registerTool) {
      const life = new AbortController();
      for (const tool of [
        {
          name: "read_game_state",
          description: "Read route, rings, lives, boost, progress and run statistics.",
          inputSchema: { type: "object", properties: {}, additionalProperties: false },
          annotations: { readOnlyHint: true },
          execute: readGameState
        },
        {
          name: "step_game_frames",
          description: "Hold controls for 1\u2013600 fixed 60 Hz physics frames, then release all inputs and freeze for inspection. Use keys [] to coast. Stops on death or stage end. Physical input or restart restores real-time play.",
          inputSchema: {
            type: "object",
            properties: {
              keys: {
                type: "array",
                items: { type: "string", enum: ["left", "right", "jump", "down", "boost"] },
                uniqueItems: true
              },
              frames: { type: "integer", minimum: 1, maximum: 600 }
            },
            required: ["keys", "frames"],
            additionalProperties: false
          },
          annotations: { readOnlyHint: false },
          execute: stepGameFrames
        },
        {
          name: "restart_game",
          description: "Restart the tutorial.",
          inputSchema: { type: "object", properties: {}, additionalProperties: false },
          annotations: { readOnlyHint: false },
          execute: /* @__PURE__ */ __name((input) => {
            if (!input || Object.keys(input).length) throw Error("Expected an empty object");
            restart();
            return { status: state.mode, lives: state.lives };
          }, "execute")
        }
      ])
        try {
          Promise.resolve(document.modelContext.registerTool(tool, { signal: life.signal })).catch(
            () => {
            }
          );
        } catch {
        }
      window.addEventListener("pagehide", () => life.abort());
    }
    setup();
    p.inv = 0;
    if (state.selectedAct === 2) selectAct(2);
    requestAnimationFrame(frame);
  }
  __name(initializeRuntimeModule31, "initializeRuntimeModule");
  function getRuntimeBindings31() {
    return {
      canvas: {
        get: /* @__PURE__ */ __name(() => canvas, "get"),
        set: /* @__PURE__ */ __name((value) => {
          canvas = value;
        }, "set")
      },
      ctx: {
        get: /* @__PURE__ */ __name(() => ctx, "get"),
        set: /* @__PURE__ */ __name((value) => {
          ctx = value;
        }, "set")
      },
      $: {
        get: /* @__PURE__ */ __name(() => $, "get"),
        set: /* @__PURE__ */ __name((value) => {
          $ = value;
        }, "set")
      },
      W: {
        get: /* @__PURE__ */ __name(() => W, "get"),
        set: /* @__PURE__ */ __name((value) => {
          W = value;
        }, "set")
      },
      H: {
        get: /* @__PURE__ */ __name(() => H, "get"),
        set: /* @__PURE__ */ __name((value) => {
          H = value;
        }, "set")
      },
      SONIC_VISUAL_SCALE: {
        get: /* @__PURE__ */ __name(() => SONIC_VISUAL_SCALE, "get"),
        set: /* @__PURE__ */ __name((value) => {
          SONIC_VISUAL_SCALE = value;
        }, "set")
      },
      FOOT_RADIUS: {
        get: /* @__PURE__ */ __name(() => FOOT_RADIUS, "get"),
        set: /* @__PURE__ */ __name((value) => {
          FOOT_RADIUS = value;
        }, "set")
      },
      keys: {
        get: /* @__PURE__ */ __name(() => keys, "get"),
        set: /* @__PURE__ */ __name((value) => {
          keys = value;
        }, "set")
      },
      JUMP_KEYS: {
        get: /* @__PURE__ */ __name(() => JUMP_KEYS, "get"),
        set: /* @__PURE__ */ __name((value) => {
          JUMP_KEYS = value;
        }, "set")
      },
      tuning: {
        get: /* @__PURE__ */ __name(() => tuning, "get"),
        set: /* @__PURE__ */ __name((value) => {
          tuning = value;
        }, "set")
      },
      BOOST_MAX: {
        get: /* @__PURE__ */ __name(() => BOOST_MAX, "get"),
        set: /* @__PURE__ */ __name((value) => {
          BOOST_MAX = value;
        }, "set")
      },
      movementTuning: {
        get: /* @__PURE__ */ __name(() => movementTuning, "get"),
        set: /* @__PURE__ */ __name((value) => {
          movementTuning = value;
        }, "set")
      },
      p: {
        get: /* @__PURE__ */ __name(() => p, "get"),
        set: /* @__PURE__ */ __name((value) => {
          p = value;
        }, "set")
      },
      extraMotion: {
        get: /* @__PURE__ */ __name(() => extraMotion, "get"),
        set: /* @__PURE__ */ __name((value) => {
          extraMotion = value;
        }, "set")
      },
      artFiles: {
        get: /* @__PURE__ */ __name(() => artFiles, "get"),
        set: /* @__PURE__ */ __name((value) => {
          artFiles = value;
        }, "set")
      },
      art: {
        get: /* @__PURE__ */ __name(() => art, "get"),
        set: /* @__PURE__ */ __name((value) => {
          art = value;
        }, "set")
      },
      artLoads: {
        get: /* @__PURE__ */ __name(() => artLoads, "get"),
        set: /* @__PURE__ */ __name((value) => {
          artLoads = value;
        }, "set")
      },
      failedArt: {
        get: /* @__PURE__ */ __name(() => failedArt, "get"),
        set: /* @__PURE__ */ __name((value) => {
          failedArt = value;
        }, "set")
      },
      sharedArt: {
        get: /* @__PURE__ */ __name(() => sharedArt, "get"),
        set: /* @__PURE__ */ __name((value) => {
          sharedArt = value;
        }, "set")
      },
      legacySonicArt: {
        get: /* @__PURE__ */ __name(() => legacySonicArt, "get"),
        set: /* @__PURE__ */ __name((value) => {
          legacySonicArt = value;
        }, "set")
      },
      loadArt: {
        get: /* @__PURE__ */ __name(() => loadArt, "get"),
        set: /* @__PURE__ */ __name((value) => {
          loadArt = value;
        }, "set")
      },
      loadActArt: {
        get: /* @__PURE__ */ __name(() => loadActArt, "get"),
        set: /* @__PURE__ */ __name((value) => {
          loadActArt = value;
        }, "set")
      },
      reconstructPixels: {
        get: /* @__PURE__ */ __name(() => reconstructPixels, "get"),
        set: /* @__PURE__ */ __name((value) => {
          reconstructPixels = value;
        }, "set")
      },
      cityTextureCache: {
        get: /* @__PURE__ */ __name(() => cityTextureCache, "get"),
        set: /* @__PURE__ */ __name((value) => {
          cityTextureCache = value;
        }, "set")
      },
      cityTexture: {
        get: /* @__PURE__ */ __name(() => cityTexture, "get"),
        set: /* @__PURE__ */ __name((value) => {
          cityTexture = value;
        }, "set")
      },
      citySkyHeights: {
        get: /* @__PURE__ */ __name(() => citySkyHeights, "get"),
        set: /* @__PURE__ */ __name((value) => {
          citySkyHeights = value;
        }, "set")
      },
      backdropScaleCache: {
        get: /* @__PURE__ */ __name(() => backdropScaleCache, "get"),
        set: /* @__PURE__ */ __name((value) => {
          backdropScaleCache = value;
        }, "set")
      },
      sizedCityBackdrop: {
        get: /* @__PURE__ */ __name(() => sizedCityBackdrop, "get"),
        set: /* @__PURE__ */ __name((value) => {
          sizedCityBackdrop = value;
        }, "set")
      },
      drawCityBackdrop: {
        get: /* @__PURE__ */ __name(() => drawCityBackdrop, "get"),
        set: /* @__PURE__ */ __name((value) => {
          drawCityBackdrop = value;
        }, "set")
      },
      cityCloudLayers: {
        get: /* @__PURE__ */ __name(() => cityCloudLayers, "get"),
        set: /* @__PURE__ */ __name((value) => {
          cityCloudLayers = value;
        }, "set")
      },
      cityCloudLayer: {
        get: /* @__PURE__ */ __name(() => cityCloudLayer, "get"),
        set: /* @__PURE__ */ __name((value) => {
          cityCloudLayer = value;
        }, "set")
      },
      drawCityClouds: {
        get: /* @__PURE__ */ __name(() => drawCityClouds, "get"),
        set: /* @__PURE__ */ __name((value) => {
          drawCityClouds = value;
        }, "set")
      },
      gameSound: {
        get: /* @__PURE__ */ __name(() => gameSound, "get"),
        set: /* @__PURE__ */ __name((value) => {
          gameSound = value;
        }, "set")
      },
      notify: {
        get: /* @__PURE__ */ __name(() => notify, "get"),
        set: /* @__PURE__ */ __name((value) => {
          notify = value;
        }, "set")
      },
      sparks: {
        get: /* @__PURE__ */ __name(() => sparks, "get"),
        set: /* @__PURE__ */ __name((value) => {
          sparks = value;
        }, "set")
      },
      setup: {
        get: /* @__PURE__ */ __name(() => setup, "get"),
        set: /* @__PURE__ */ __name((value) => {
          setup = value;
        }, "set")
      },
      respawn: {
        get: /* @__PURE__ */ __name(() => respawn, "get"),
        set: /* @__PURE__ */ __name((value) => {
          respawn = value;
        }, "set")
      },
      start: {
        get: /* @__PURE__ */ __name(() => start, "get"),
        set: /* @__PURE__ */ __name((value) => {
          start = value;
        }, "set")
      },
      show: {
        get: /* @__PURE__ */ __name(() => show, "get"),
        set: /* @__PURE__ */ __name((value) => {
          show = value;
        }, "set")
      },
      pause: {
        get: /* @__PURE__ */ __name(() => pause, "get"),
        set: /* @__PURE__ */ __name((value) => {
          pause = value;
        }, "set")
      },
      die: {
        get: /* @__PURE__ */ __name(() => die, "get"),
        set: /* @__PURE__ */ __name((value) => {
          die = value;
        }, "set")
      },
      hurt: {
        get: /* @__PURE__ */ __name(() => hurt, "get"),
        set: /* @__PURE__ */ __name((value) => {
          hurt = value;
        }, "set")
      },
      press: {
        get: /* @__PURE__ */ __name(() => press, "get"),
        set: /* @__PURE__ */ __name((value) => {
          press = value;
        }, "set")
      },
      release: {
        get: /* @__PURE__ */ __name(() => release, "get"),
        set: /* @__PURE__ */ __name((value) => {
          release = value;
        }, "set")
      },
      restart: {
        get: /* @__PURE__ */ __name(() => restart, "get"),
        set: /* @__PURE__ */ __name((value) => {
          restart = value;
        }, "set")
      },
      updateHud: {
        get: /* @__PURE__ */ __name(() => updateHud, "get"),
        set: /* @__PURE__ */ __name((value) => {
          updateHud = value;
        }, "set")
      },
      update: {
        get: /* @__PURE__ */ __name(() => update, "get"),
        set: /* @__PURE__ */ __name((value) => {
          update = value;
        }, "set")
      },
      updateParticles: {
        get: /* @__PURE__ */ __name(() => updateParticles, "get"),
        set: /* @__PURE__ */ __name((value) => {
          updateParticles = value;
        }, "set")
      },
      finishAct: {
        get: /* @__PURE__ */ __name(() => finishAct, "get"),
        set: /* @__PURE__ */ __name((value) => {
          finishAct = value;
        }, "set")
      },
      ellipse: {
        get: /* @__PURE__ */ __name(() => ellipse, "get"),
        set: /* @__PURE__ */ __name((value) => {
          ellipse = value;
        }, "set")
      },
      ring: {
        get: /* @__PURE__ */ __name(() => ring, "get"),
        set: /* @__PURE__ */ __name((value) => {
          ring = value;
        }, "set")
      },
      sonicFrames: {
        get: /* @__PURE__ */ __name(() => sonicFrames, "get"),
        set: /* @__PURE__ */ __name((value) => {
          sonicFrames = value;
        }, "set")
      },
      motionFrames: {
        get: /* @__PURE__ */ __name(() => motionFrames, "get"),
        set: /* @__PURE__ */ __name((value) => {
          motionFrames = value;
        }, "set")
      },
      grindFrames: {
        get: /* @__PURE__ */ __name(() => grindFrames, "get"),
        set: /* @__PURE__ */ __name((value) => {
          grindFrames = value;
        }, "set")
      },
      brakeFrames: {
        get: /* @__PURE__ */ __name(() => brakeFrames, "get"),
        set: /* @__PURE__ */ __name((value) => {
          brakeFrames = value;
        }, "set")
      },
      boostFrames: {
        get: /* @__PURE__ */ __name(() => boostFrames, "get"),
        set: /* @__PURE__ */ __name((value) => {
          boostFrames = value;
        }, "set")
      },
      sonicPose: {
        get: /* @__PURE__ */ __name(() => sonicPose, "get"),
        set: /* @__PURE__ */ __name((value) => {
          sonicPose = value;
        }, "set")
      },
      spritePixel: {
        get: /* @__PURE__ */ __name(() => spritePixel, "get"),
        set: /* @__PURE__ */ __name((value) => {
          spritePixel = value;
        }, "set")
      },
      drawSonicFrame: {
        get: /* @__PURE__ */ __name(() => drawSonicFrame, "get"),
        set: /* @__PURE__ */ __name((value) => {
          drawSonicFrame = value;
        }, "set")
      },
      sonic: {
        get: /* @__PURE__ */ __name(() => sonic, "get"),
        set: /* @__PURE__ */ __name((value) => {
          sonic = value;
        }, "set")
      },
      sign: {
        get: /* @__PURE__ */ __name(() => sign, "get"),
        set: /* @__PURE__ */ __name((value) => {
          sign = value;
        }, "set")
      },
      drawRail: {
        get: /* @__PURE__ */ __name(() => drawRail, "get"),
        set: /* @__PURE__ */ __name((value) => {
          drawRail = value;
        }, "set")
      },
      draw: {
        get: /* @__PURE__ */ __name(() => draw, "get"),
        set: /* @__PURE__ */ __name((value) => {
          draw = value;
        }, "set")
      },
      frame: {
        get: /* @__PURE__ */ __name(() => frame, "get"),
        set: /* @__PURE__ */ __name((value) => {
          frame = value;
        }, "set")
      },
      testInputCodes: {
        get: /* @__PURE__ */ __name(() => testInputCodes, "get"),
        set: /* @__PURE__ */ __name((value) => {
          testInputCodes = value;
        }, "set")
      },
      readGameState: {
        get: /* @__PURE__ */ __name(() => readGameState, "get"),
        set: /* @__PURE__ */ __name((value) => {
          readGameState = value;
        }, "set")
      },
      stepGameFrames: {
        get: /* @__PURE__ */ __name(() => stepGameFrames, "get"),
        set: /* @__PURE__ */ __name((value) => {
          stepGameFrames = value;
        }, "set")
      }
    };
  }
  __name(getRuntimeBindings31, "getRuntimeBindings");

  // src/playtest.js
  var playtestState;
  function isPlaytest() {
    return state.selectedAct === "playtest";
  }
  __name(isPlaytest, "isPlaytest");
  function clearPlaytestInput() {
    keys.clear();
    if (playtestState) {
      playtestState.player.dash = null;
      Object.assign(playtestState.player.boost, { held: false, active: false, remaining: 0 });
      playtestState.boostPressed = false;
      playtestState.boostPressAirborne = false;
      playtestState.rollPressed = false;
      playtestState.jumpPressed = false;
      if (playtestState.player.air) {
        playtestState.player.air.cutEligible = false;
        playtestState.player.air.jumpLift = 0;
      }
    }
  }
  __name(clearPlaytestInput, "clearPlaytestInput");
  function resetPlaytest(scenario = playtestState.player?.scenario || "flat", reason = "manual reset") {
    keys.clear();
    const spawn = motionSpawn(scenario);
    Object.assign(playtestState, {
      frames: 0,
      rollPressed: false,
      jumpPressed: false,
      boostPressed: false,
      boostPressAirborne: false,
      player: createMotionPlayer(scenario),
      camera: {
        x: spawn.x - W / 2,
        y: spawn.y - H * 0.66,
        zoom: 1
      },
      resetCount: (playtestState.resetCount ?? -1) + 1,
      resetReason: reason
    });
    state.last = 0;
    state.acc = 0;
    updatePlaytestHud();
  }
  __name(resetPlaytest, "resetPlaytest");
  function setupPlaytest() {
    const previousCanvasLabel = playtestState?.previousCanvasLabel ?? canvas.getAttribute?.("aria-label");
    playtestState = { previousCanvasLabel };
    state.level = { act: "playtest", title: "PLAYTEST" };
    state.stageRuntime = null;
    state.boss = null;
    state.bossCheckpoint = null;
    state.ending = null;
    state.charge = 0;
    state.jumpBuffer = 0;
    state.coyote = 0;
    state.cam = 0;
    state.camY = 0;
    state.zoom = 1;
    Object.assign(p, {
      jumpHeld: false,
      downHeld: false,
      airBoostRequested: false,
      groundBoostHeld: false,
      airBoostFrames: 0,
      airBoostActive: false,
      boosting: false,
      loop: null
    });
    $("#game-shell").classList.add("playtest");
    $("#playtest-status").hidden = false;
    $("#playtest-status").textContent = "Static-surface + devices experiment \xB7 Space: jump \xB7 Down: roll \xB7 At rest: hold Down + Space to charge, release Down to Spin Dash \xB7 Shift/X: Boost \xB7 gold rail = free Boost. R resets.";
    $("#game-controls").hidden = true;
    $("#playtest-controls").hidden = false;
    $("#game-hint").hidden = true;
    $("#ending-loading").hidden = true;
    $("#score").hidden = true;
    $("#toast").style.display = "none";
    $(".brand-sub").textContent = "PLAYTEST";
    $("#act-title").textContent = "PLAYTEST";
    $("#act-select").value = "playtest";
    canvas.setAttribute(
      "aria-label",
      "PLAYTEST static terrain experiment. Left and right move, Down rolls, Space jumps; release for a short hop. P pauses, R resets. Buttons select flat, valley, crest, gap, wall or low ceiling. Down + Space charges Spin Dash at rest; release Down to launch. Shift or X uses Boost; gold rail sections have free Boost. STAGE returns to either act."
    );
    for (const scenario of Object.keys(motionFixtures))
      $("#playtest-" + scenario).onclick = () => {
        resetPlaytest(scenario);
        canvas.focus();
      };
    syncGameMusic?.({ enabled: false, mode: "ready" });
    resetPlaytest();
  }
  __name(setupPlaytest, "setupPlaytest");
  function exitPlaytest() {
    if (!playtestState) return;
    keys.clear();
    state.charge = 0;
    state.jumpBuffer = 0;
    $("#game-shell").classList.remove("playtest");
    $("#playtest-status").hidden = true;
    $("#game-controls").hidden = false;
    $("#playtest-controls").hidden = true;
    $("#game-hint").hidden = false;
    if (playtestState.previousCanvasLabel)
      canvas.setAttribute("aria-label", playtestState.previousCanvasLabel);
    playtestState = null;
  }
  __name(exitPlaytest, "exitPlaytest");
  function handlePlaytestInput(code, pressed) {
    if (!pressed) {
      keys.delete(code);
      updatePlaytestHud();
      return;
    }
    if (code === "KeyP" || code === "Escape") {
      pause();
      return;
    }
    if (code === "KeyR") {
      restart();
      return;
    }
    if (state.mode === "playing") {
      if (["ShiftLeft", "ShiftRight", "KeyX", "MouseBoost"].includes(code) && !["ShiftLeft", "ShiftRight", "KeyX", "MouseBoost"].some((k) => keys.has(k))) {
        playtestState.boostPressed = true;
        playtestState.boostPressAirborne = playtestState.player.mode === "airborne";
      }
      if (["Space", "ArrowUp", "KeyW"].includes(code) && !["Space", "ArrowUp", "KeyW"].some((k) => keys.has(k)) && playtestState.player.mode === "grounded")
        playtestState.jumpPressed = true;
      if ((code === "ArrowDown" || code === "KeyS") && !keys.has(code))
        playtestState.rollPressed = true;
      keys.add(code);
    }
    updatePlaytestHud();
  }
  __name(handlePlaytestInput, "handlePlaytestInput");
  function updatePlaytest() {
    if (state.mode === "playing") {
      const direction = Number(keys.has("ArrowRight") || keys.has("KeyD")) - Number(keys.has("ArrowLeft") || keys.has("KeyA"));
      const player = playtestState.player;
      stepMotionPlayer(player, {
        direction,
        down: playtestState.rollPressed || keys.has("ArrowDown") || keys.has("KeyS"),
        jumpPressed: playtestState.jumpPressed,
        jumpHeld: ["Space", "ArrowUp", "KeyW"].some((k) => keys.has(k)),
        boostHeld: ["ShiftLeft", "ShiftRight", "KeyX", "MouseBoost"].some((k) => keys.has(k)),
        boostPressed: playtestState.boostPressed,
        boostPressAirborne: playtestState.boostPressAirborne
      });
      playtestState.rollPressed = false;
      playtestState.jumpPressed = false;
      playtestState.boostPressed = false;
      playtestState.boostPressAirborne = false;
      playtestState.frames++;
      if (player.boundary) resetPlaytest(player.scenario, player.boundary);
      else {
        const contact = motionContact(player), camera = playtestState.camera;
        const path = motionFixtures[player.scenario].path;
        const look = path ? Math.max(-W * 0.25, Math.min(W * 0.25, contact.vx * 8)) : contact.vx * 8;
        camera.x += (contact.x - W / 2 + look - camera.x) * 0.12;
        camera.y += (contact.y - H * 0.66 - camera.y) * 0.12;
        if (path) {
          camera.x = Math.max(
            contact.center.x - W * 0.9,
            Math.min(contact.center.x - W * 0.1, camera.x)
          );
          camera.y = Math.max(
            contact.center.y - H * 0.85,
            Math.min(contact.center.y - H * 0.42, camera.y)
          );
        }
      }
    }
    updatePlaytestHud();
  }
  __name(updatePlaytest, "updatePlaytest");
  function framePlaytest(time) {
    if (!state.last) state.last = time;
    const elapsed = Math.min(250, Math.max(0, time - state.last));
    state.last = time;
    if (state.mode === "playing" && !state.testControlled) {
      state.acc += elapsed;
      const tick = 1e3 / groundTuning.hz;
      while (state.acc + 1e-7 >= tick) {
        state.acc = Math.max(0, state.acc - tick);
        updatePlaytest();
      }
    } else state.acc = 0;
    drawPlaytest();
    requestAnimationFrame(frame);
  }
  __name(framePlaytest, "framePlaytest");
  function updatePlaytestHud() {
    const player = playtestState.player, c = motionContact(player);
    $("#playtest-mode").textContent = String(state.mode).toUpperCase() + " / " + player.mode.toUpperCase() + " / " + (player.railId ? "GRINDING" : player.posture.toUpperCase()) + (player.dash ? " / CHARGING" : "");
    $("#playtest-frame").textContent = String(playtestState.frames);
    $("#playtest-input").textContent = [...keys].join(", ") || "none";
    $("#playtest-debug").textContent = `${motionTuning.revision} \xB7 ${player.scenario} \xB7 gsp ${c.grounded ? c.speed.toFixed(3) : "\u2014"} \xB7 v(${c.vx.toFixed(3)}, ${c.vy.toFixed(3)}) \xB7 angle ${((c.surfaceAngle ?? c.angle) * 180 / Math.PI).toFixed(2)}\xB0
${c.grounded ? "CONTACT" : "AIR REF"} (${c.x.toFixed(2)}, ${c.y.toFixed(2)}) \xB7 body ${c.width}\xD7${c.height} \xB7 center (${c.center.x.toFixed(2)}, ${c.center.y.toFixed(2)}) \xB7 normal ${c.grounded ? `(${c.nx.toFixed(3)}, ${c.ny.toFixed(3)})` : "none"} \xB7 N ${c.normalReaction.toFixed(3)}${c.uprightGrip ? " \xB7 UPRIGHT CREST GRIP" : ""}${c.steepGrip ? " \xB7 STEEP GRIP \u22652.5" : ""}
Boost ${player.boost.meter.toFixed(2)}/90${c.infiniteBoost && player.railId ? " FREE RAIL" : ""} \xB7 burst ${player.boost.remaining}/18 \xB7 air ${player.boost.airUsed ? "used" : "ready"} \xB7 rail ${player.railId || "none"} \xB7 dash ${player.dash?.charge || 0}/30 \xB7 support ${player.supportId || "terrain / air"} \xB7 springs ${player.springLaunches} \xB7 ${player.pathS != null ? "path s " + player.pathS.toFixed(2) + " \xB7 " : ""}${player.latestTransition} \xB7 controller ticks ${player.ticks} \xB7 reset ${playtestState.resetCount}: ${playtestState.resetReason}`;
  }
  __name(updatePlaytestHud, "updatePlaytestHud");
  function readPlaytestState() {
    const player = playtestState.player;
    return {
      act: "playtest",
      status: state.mode,
      movementImplemented: true,
      tuning: motionTuning.revision,
      frame: playtestState.frames,
      player: { ...player },
      contact: motionContact(player),
      energy: player.mode === "grounded" ? motionFixtures[player.scenario].path ? player.speed ** 2 / 2 + groundTuning.gravity * (650 - player.y) : groundEnergy(player, sampleMotionExtension) : null,
      camera: { ...playtestState.camera },
      inputs: [...keys],
      resetCount: playtestState.resetCount,
      resetReason: playtestState.resetReason
    };
  }
  __name(readPlaytestState, "readPlaytestState");
  function drawGroundPlayer(player) {
    const c = motionContact(player), rolling = player.posture === "rolling";
    ctx.save();
    const footShift = c.grounded ? Math.hypot(c.center.x - c.x, c.center.y - c.y) - c.height / 2 : 0;
    ctx.translate(c.x + c.nx * footShift, c.y + c.ny * footShift);
    ctx.rotate(c.angle);
    const sheet = (player.railId || player.boost.active) && art.supplemental ? "supplemental" : art.recoveredSpeedster ? "recoveredSpeedster" : "recoveredPeelout";
    const index = sheet === "supplemental" ? (player.railId ? 16 : 8) + Math.floor(player.ticks / 3) % 8 : rolling ? 26 + Math.floor(player.dash ? player.ticks / 2 : player.distance / 10) % 3 : Math.abs(player.speed) > 0.1 ? Math.floor(player.distance / 12) % 8 : 16;
    const im = art[sheet], descriptor = recoveredSpriteFrames[sheet]?.[index];
    if (im && descriptor) {
      const [left, top, right, bottom] = descriptor.bounds, sw = right - left, sh = bottom - top;
      const scale = rolling ? 38 / Math.max(sw, sh) : 48 / sh;
      const width = sw * scale, height = sh * scale;
      ctx.save();
      ctx.scale(player.facing, 1);
      ctx.drawImage(
        im,
        left,
        top,
        sw,
        sh,
        -width / 2,
        rolling ? -19 - height / 2 : -48,
        width,
        height
      );
      ctx.restore();
    } else {
      ctx.fillStyle = "#1c52cc";
      ctx.fillRect(-c.width / 2, -c.height, c.width, c.height);
    }
    ctx.strokeStyle = "#61d9f1";
    ctx.lineWidth = 1;
    if (rolling) {
      ctx.beginPath();
      ctx.arc(0, -19, 19, 0, Math.PI * 2);
      ctx.stroke();
    } else ctx.strokeRect(-c.width / 2, -c.height, c.width, c.height);
    ctx.fillStyle = c.grounded ? "#ffd54a" : "#f48bdf";
    ctx.fillRect(-3, c.grounded ? footShift - 3 : -c.height / 2 - 3, 6, 6);
    if (c.grounded) {
      ctx.beginPath();
      ctx.moveTo(0, footShift);
      ctx.lineTo(0, footShift - 65);
      ctx.stroke();
    }
    ctx.restore();
  }
  __name(drawGroundPlayer, "drawGroundPlayer");
  function drawPlaytest() {
    ctx.save();
    ctx.scale(canvas.width / W, canvas.height / H);
    ctx.imageSmoothingEnabled = false;
    ctx.fillStyle = "#0d082d";
    ctx.fillRect(0, 0, W, H);
    const camera = playtestState.camera, player = playtestState.player;
    ctx.translate(-camera.x, -camera.y);
    const left = Math.floor(camera.x / 4) * 4, right = camera.x + W + 4;
    ctx.fillStyle = "#242142";
    for (let x = Math.floor(left / 100) * 100; x <= right; x += 100) {
      ctx.fillRect(x, camera.y, 1, H);
      ctx.fillStyle = "#b4b9d2";
      ctx.font = "12px monospace";
      ctx.fillText(String(x), x + 4, camera.y + H - 20);
      ctx.fillStyle = "#242142";
    }
    for (const span of motionSpans(player.scenario)) {
      const a = Math.max(left, span[0]), b = Math.min(right, span[1]);
      if (a > b) continue;
      ctx.beginPath();
      ctx.moveTo(a, camera.y + H + 2e3);
      for (let x = a; x < b; x += 4) ctx.lineTo(x, sampleMotionExtension(player.scenario, x).y);
      ctx.lineTo(b, sampleMotionExtension(player.scenario, b).y);
      ctx.lineTo(b, camera.y + H + 2e3);
      ctx.closePath();
      ctx.fillStyle = "#242142";
      ctx.fill();
      ctx.strokeStyle = "#61d9f1";
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(a, sampleMotionExtension(player.scenario, a).y);
      for (let x = a + 4; x < b; x += 4) ctx.lineTo(x, sampleMotionExtension(player.scenario, x).y);
      ctx.lineTo(b, sampleMotionExtension(player.scenario, b).y);
      ctx.stroke();
    }
    const path = motionFixtures[player.scenario].path;
    if (path)
      for (const piece of path.pieces) {
        const samples = [];
        for (let s = piece.start; s < piece.end; s += 4) samples.push(samplePath(path, s));
        samples.push(samplePath(path, piece.end));
        ctx.beginPath();
        samples.forEach((p2, i) => i ? ctx.lineTo(p2.x, p2.y) : ctx.moveTo(p2.x, p2.y));
        for (const p2 of [...samples].reverse())
          ctx.lineTo(p2.x - p2.nx * path.thickness, p2.y - p2.ny * path.thickness);
        ctx.closePath();
        ctx.fillStyle = "#39355f";
        ctx.fill();
        ctx.beginPath();
        samples.forEach((p2, i) => i ? ctx.lineTo(p2.x, p2.y) : ctx.moveTo(p2.x, p2.y));
        ctx.strokeStyle = "#61d9f1";
        ctx.lineWidth = 3;
        ctx.stroke();
      }
    for (const box of motionFixtures[player.scenario].boxes) {
      ctx.fillStyle = "#6d396c";
      ctx.fillRect(box.x1, box.y1, box.x2 - box.x1, box.y2 - box.y1);
      ctx.strokeStyle = "#ffae44";
      ctx.strokeRect(box.x1, box.y1, box.x2 - box.x1, box.y2 - box.y1);
    }
    const fixture = motionFixtures[player.scenario];
    for (const rail of fixture.rails || [])
      for (const piece of rail.pieces) {
        ctx.beginPath();
        ctx.moveTo(piece.x1, sampleExperimentalRail(rail, piece.x1).y);
        for (let x = piece.x1 + 4; x < piece.x2; x += 4)
          ctx.lineTo(x, sampleExperimentalRail(rail, x).y);
        ctx.lineTo(piece.x2, sampleExperimentalRail(rail, piece.x2).y);
        ctx.strokeStyle = piece.infiniteBoost ? "#ffd54a" : "#61d9f1";
        ctx.lineWidth = 5;
        ctx.stroke();
        ctx.fillStyle = piece.infiniteBoost ? "#ffd54a" : "#b4b9d2";
        ctx.font = "12px monospace";
        ctx.fillText(
          piece.infiniteBoost ? "FREE BOOST" : "GRIND RAIL",
          (piece.x1 + piece.x2) / 2,
          sampleExperimentalRail(rail, (piece.x1 + piece.x2) / 2).y + 30
        );
      }
    for (const platform of fixture.platforms || []) {
      const box = experimentalPlatformPose(platform, player.ticks);
      ctx.fillStyle = "#39355f";
      ctx.fillRect(box.x1, box.y1, box.x2 - box.x1, box.y2 - box.y1);
      ctx.strokeStyle = "#61d9f1";
      ctx.strokeRect(box.x1, box.y1, box.x2 - box.x1, box.y2 - box.y1);
      ctx.fillStyle = "#b4b9d2";
      ctx.fillText(platform.id, (box.x1 + box.x2) / 2, box.y2 + 18);
    }
    for (const spring of fixture.springs || []) {
      const face = experimentalSpringPose(spring, player.ticks, fixture);
      ctx.save();
      ctx.translate(face.x, face.y);
      ctx.rotate(Math.atan2(face.ty, face.tx));
      ctx.fillStyle = "#6d396c";
      ctx.fillRect(-24, 0, 48, 20);
      ctx.strokeStyle = "#b4b9d2";
      ctx.beginPath();
      ctx.moveTo(-10, 18);
      for (let y = 16; y > 2; y -= 3) ctx.lineTo(y % 2 ? -10 : 10, y);
      ctx.stroke();
      ctx.fillStyle = "#ffd54a";
      ctx.fillRect(-24, 0, 48, 5);
      ctx.fillStyle = "#ffffff";
      ctx.font = "12px monospace";
      ctx.textAlign = "center";
      ctx.fillText("\u2191", 0, -8);
      ctx.restore();
    }
    const limit = motionBounds(player.scenario);
    ctx.textAlign = "center";
    ctx.font = "14px monospace";
    for (const x of [-limit, limit]) {
      const marker = path ? samplePath(path, x < 0 ? 0 : path.length) : sampleMotionExtension(player.scenario, x);
      const markerX = marker.x, y = marker.y;
      ctx.fillStyle = "#ffae44";
      ctx.fillRect(markerX - 2, y - 170, 4, 170);
      ctx.fillText("TEST BOUNDARY \u2192 RESET", markerX - Math.sign(x) * 120, y - 130);
    }
    const spawn = motionSpawn(player.scenario);
    ctx.fillStyle = "#b4b9d2";
    ctx.fillText("SAFE SPAWN \xB7 R RESET", spawn.x, spawn.y + 45);
    drawGroundPlayer(player);
    ctx.restore();
  }
  __name(drawPlaytest, "drawPlaytest");
  function initializeRuntimeModule32() {
    playtestState = null;
  }
  __name(initializeRuntimeModule32, "initializeRuntimeModule");
  function getRuntimeBindings32() {
    return {
      playtestState: {
        get: /* @__PURE__ */ __name(() => playtestState, "get"),
        set: /* @__PURE__ */ __name((value) => {
          playtestState = value;
        }, "set")
      }
    };
  }
  __name(getRuntimeBindings32, "getRuntimeBindings");

  // src/act2.js
  var cameraTracking;
  var skylineSmokeSprites;
  function selectAct(act) {
    state.selectedAct = act === "playtest" ? "playtest" : act === 2 ? 2 : 1;
    setup();
    state.mode = "ready";
    if (isPlaytest()) {
      updatePlaytestHud();
      show(
        "PLAYTEST",
        "Isolated static-surface experiment.<br>Ground, air and curved-surface fixtures \xB7 No boost or Spin Dash.",
        "OPEN PLAYTEST"
      );
      return;
    }
    show(
      state.selectedAct === 2 ? "City on<br><em>the brink.</em>" : "Ready.<br><em>Gotta go.</em>",
      state.selectedAct === 2 ? "Through ruined streets and exposed towers.<br>Reach the rooftop helipad." : "Build momentum. Jump the rails and roll through tunnels.",
      state.selectedAct === 2 ? "PLAY ACT 2" : "PLAY ACT 1"
    );
    $("#act-select").value = String(state.selectedAct);
  }
  __name(selectAct, "selectAct");
  function resetAct2() {
    if (state.level.act !== 2) return;
    for (const group of state.level.collapseGroups || []) group.triggered = false;
    for (const d of state.level.debris) {
      d.triggered = d.x < state.level.checkpoints[state.checkpoint].x;
      d.age = d.triggered ? 240 : 0;
    }
    for (const e of state.level.events)
      e.age = e.trigger < state.level.checkpoints[state.checkpoint].x ? 150 : -1;
    for (const l of state.level.loops) {
      l.used = false;
      l.entryLocked = false;
      l.solved = false;
    }
    for (const h of state.level.hazards)
      if (h.type === "breakable")
        h.broken = !!h.broken && h.x < state.level.checkpoints[state.checkpoint].x;
  }
  __name(resetAct2, "resetAct2");
  function launchAirDevice(device) {
    p.airBoostFrames = 0;
    p.airBoostActive = false;
    p.boosting = false;
    p.scriptedLaunch = true;
    p.jumpReleaseVy = null;
    p.coyoteLaunchVy = null;
    if (device.launchX !== void 0) p.vx = device.launchX;
    if (device.id === "mid-low-spring") p.poolApproach = true;
    if (device.poolBooster) p.poolExit = true;
    p.airSpeedLimit = device.airSpeedLimit ?? null;
    if (p.airSpeedLimit) p.vx = Math.max(-p.airSpeedLimit, Math.min(p.airSpeedLimit, p.vx));
    p.jumpAttack = true;
    p.vy = -device.power;
    p.ground = false;
    p.surface = null;
    p.rolling = false;
    p.roll = true;
    p.poseJumpFrame = state.runFrames;
    p.brakeActive = false;
    p.stopFrame = -100;
    state.coyote = 0;
    state.jumpBuffer = 0;
    p.airLaunchUntil = state.runFrames + Math.ceil(device.power / 0.58);
    device.firedAt = state.runFrames;
    const anchor = airDevicePose(device);
    sparks(anchor.x, anchor.y - 10, 6, device.cityVent ? "#9be3ef" : "#ffe68b");
    gameSound(device.poolBooster ? "pool" : device.cityVent ? "vent" : "spring", {
      launch: !!device.poolBooster
    });
    beginTraversalLaunch(device);
  }
  __name(launchAirDevice, "launchAirDevice");
  function beginLoop(l) {
    if (!Number.isFinite(l.r) || l.r <= 0) return false;
    p.brakeActive = false;
    p.brakeAge = 0;
    p.stopFrame = -100;
    p.loop = {
      id: l.id,
      theta: 0,
      speed: surfaceTravelSpeed(),
      direction: Math.sign(surfaceTravelSpeed()) || 1,
      ...loopPhysics(l)
    };
    p.x = l.x;
    p.y = l.y - 20;
    p.vy = 0;
    p.ground = true;
    p.surface = null;
    l.used = true;
  }
  __name(beginLoop, "beginLoop");
  function updateLoop() {
    const l = state.level.loops.find((l2) => l2.id === p.loop.id), q = p.loop;
    p.lastX = p.x;
    p.lastY = p.y;
    const want = keys.has("ShiftLeft") || keys.has("ShiftRight") || keys.has("KeyX") || keys.has("MouseBoost");
    updateBoostState(want);
    const dir = Number(keys.has("ArrowRight") || keys.has("KeyD")) - Number(keys.has("ArrowLeft") || keys.has("KeyA")), gravity = q.gravity;
    const steps = Math.max(4, Math.ceil(Math.abs(q.speed) / l.r / 0.04)), dt = 1 / steps;
    for (let i = 0; i < steps; i++) {
      const previous = q.speed, drag = q.speed * q.drag, drive = p.boosting && q.speed * p.face < 23 ? (p.face * 23 - q.speed) * 0.14 : dir && (Math.abs(q.speed) < 14 || dir !== Math.sign(q.speed)) ? dir * 0.06 * Math.max(0, Math.cos(q.theta)) : 0;
      const tangentY = -Math.sin(q.theta), slopeForce = l.profile === "advanced" ? gravity : groundSlopeForce(p.rolling, q.speed, tangentY) * (gravity / groundSlopeForce(false, 0, 0));
      q.speed += (slopeForce * tangentY - drag + drive) * dt;
      const oldX = p.x, oldY = p.y, deaths = state.stats.deaths;
      q.theta += (previous + q.speed) * 0.5 / l.r * dt;
      p.x = l.x + Math.sin(q.theta) * l.r;
      p.y = l.y - l.r + Math.cos(q.theta) * l.r - 20;
      p.vx = Math.cos(q.theta) * q.speed;
      p.vy = -Math.sin(q.theta) * q.speed;
      resolveMotionInteractions(oldX, oldY);
      if (state.stats.deaths !== deaths) return true;
      if (!p.ground) {
        p.loop = null;
        l.used = false;
        l.entryLocked = true;
        return true;
      }
      if (state.jumpBuffer > 0 || surfaceNormalReaction(q.speed, -1 / l.r, -Math.cos(q.theta), gravity) < 0) {
        p.vx = Math.cos(q.theta) * q.speed;
        p.vy = -Math.sin(q.theta) * q.speed;
        if (state.jumpBuffer) {
          p.vx -= Math.sin(q.theta) * 13.4;
          p.vy -= Math.cos(q.theta) * 13.4;
          p.jumpReleaseVy = -Math.sin(q.theta) * q.speed - Math.cos(q.theta) * 5;
          p.jumpAttack = true;
          state.stats.jumps++;
          p.poseJumpFrame = state.runFrames;
          gameSound("jump");
        }
        state.jumpBuffer = 0;
        p.loop = null;
        l.used = false;
        l.entryLocked = true;
        p.ground = false;
        p.surface = null;
        return true;
      }
      if (q.theta * q.direction >= Math.PI * 2 || q.theta * q.direction < 0) {
        const complete = q.theta * q.direction >= Math.PI * 2;
        if (complete && !l.solved) {
          l.solved = true;
          state.stats.loops++;
          state.score += 500;
        }
        l.used = false;
        l.entryLocked = true;
        p.loop = null;
        p.x = l.x;
        p.y = l.y - 20;
        p.vx = q.speed;
        p.vy = 0;
        p.surface = state.level.surfaces.find(
          (s) => active(s) && p.x >= s.x1 && p.x <= s.x2 && Math.abs(yOn(s, p.x) - l.y) < 12
        ) || null;
        p.ground = !!p.surface;
        return true;
      }
    }
    state.anim += Math.abs(q.speed) * 0.08;
    state.stats.maxSpeed = Math.max(state.stats.maxSpeed, Math.abs(q.speed));
    p.vx = Math.cos(q.theta) * q.speed;
    p.vy = -Math.sin(q.theta) * q.speed;
    p.face = Math.sign(q.speed) || 1;
    p.ground = true;
    return true;
  }
  __name(updateLoop, "updateLoop");
  function updateAct2() {
    if (state.level.act !== 2) return;
    for (const l of state.level.loops) {
      if (p.loop?.id === l.id) continue;
      if (l.entryLocked) {
        if (Math.hypot(p.x - l.x, feet() - l.y) > FOOT_RADIUS + 18) l.entryLocked = false;
        continue;
      }
      const direction = Math.sign(p.vx);
      if (!p.loop && !l.entryLocked && !l.used && p.ground && direction && (p.lastX - l.x) * direction <= 0 && (p.x - l.x) * direction >= 0 && Math.abs(feet() - l.y) < 18)
        beginLoop(l);
    }
    for (const e of state.level.events)
      if (e.age < 0 && p.x > e.trigger) {
        e.age = 0;
        sparks(e.x, e.y, 12, "#ff894d");
        state.shake = Math.max(state.shake, 4);
      } else if (e.age >= 0 && e.age < 180) e.age++;
    for (const d of state.level.debris) {
      if (!d.triggered && (!d.entryX || p.x >= d.entryX) && d.x - p.x > 0 && d.x - p.x < Math.max(900, Math.abs(p.vx) * 70) && Math.abs(p.y - d.y) < 550) {
        d.triggered = true;
        d.age = 0;
        gameSound("warning", { pan: Math.max(-1, Math.min(1, (d.x - p.x) / 600)) });
      }
      if (!d.triggered || d.age >= d.warn + d.fall + 120) continue;
      d.age++;
      if (d.age >= d.warn) {
        const t = Math.min(1, (d.age - d.warn) / d.fall), y = d.y - 460 + 460 * t * t;
        if (p.x + 13 > d.x - d.w / 2 && p.x - 13 < d.x + d.w / 2 && feet() > y - 44 && feet() - bodyHeight() < y)
          hurt(d.x);
        if (d.age === d.warn + d.fall) {
          if (Math.abs(d.x - p.x) < 800) gameSound("hazard");
          sparks(d.x, d.y, 10, "#ffb356");
          state.shake = Math.max(state.shake, 3);
        }
      }
    }
  }
  __name(updateAct2, "updateAct2");
  function predictLanding() {
    if (state.level.act !== 2 || p.ground || p.loop || Math.abs(p.vx) < 9) return null;
    let best = null;
    for (const s of state.level.surfaces) {
      if (!active(s) || s.entrySpeed && !s.solidAtAnySpeed && (Math.abs(p.vx) < s.entrySpeed || s.entryDirection && Math.sign(p.vx) !== s.entryDirection))
        continue;
      const q = pose(s), floor = q.y1 + (p.x - q.x1) * q.slope, b = p.vy + 0.29 - q.slope * p.vx, c = feet() - floor, d = b * b - 1.16 * c;
      if (d < 0) continue;
      let t = (-b + Math.sqrt(d)) / 0.58;
      const cap = Math.max(0, (20 - p.vy) / 0.58);
      if (t > cap) {
        const rise = p.vy * cap + 0.29 * cap * (cap + 1), den = 20 - q.slope * p.vx;
        if (den <= 0) continue;
        t = (floor - feet() - rise + 20 * cap) / den;
      }
      const x = p.x + p.vx * t;
      if (t < 0.5 || t > 60 || x < q.x1 - FOOT_RADIUS || x > q.x2 + FOOT_RADIUS) continue;
      if (!best || t < best.t) best = { id: s.id, x, y: yOn(s, x), t };
    }
    return best;
  }
  __name(predictLanding, "predictLanding");
  function resetCameraTracking() {
    cameraTracking.anchor = 0.64;
    cameraTracking.lift = 0;
    cameraTracking.prediction = 0;
    cameraTracking.velocity = 0;
    cameraTracking.lastY = p.y;
  }
  __name(resetCameraTracking, "resetCameraTracking");
  function updateCamera() {
    if (frameBossCamera()) return;
    const speed = p.loop ? p.loop.speed : Math.abs(p.vx), act2 = state.level.act === 2;
    const speedBlend = Math.max(0, Math.min(1, (speed - 8) / 16)), targetZoom = 0.94 - 0.18 * speedBlend * speedBlend * (3 - 2 * speedBlend);
    state.zoom += (targetZoom - state.zoom) * 0.025;
    const vw = W / state.zoom, lead = Math.min(act2 ? 340 : 230, Math.max(-180, p.vx * (act2 ? 12 : 9))), anchor = act2 ? W / state.zoom * 0.38 : 280;
    state.cam += (Math.max(0, Math.min(state.END - vw + 260, p.x - anchor + lead)) - state.cam) * 0.15;
    const groundBlend = Math.max(0, Math.min(1, (speed - 6) / 6)), groundAnchor = 0.68 - 0.08 * groundBlend * groundBlend * (3 - 2 * groundBlend);
    if (!act2) {
      state.camY += (Math.max(-110, Math.min(190, p.y - 350)) - state.camY) * 0.08;
      return;
    }
    cameraTracking.anchor += ((p.ground ? groundAnchor : 0.6) - cameraTracking.anchor) * 0.05;
    cameraTracking.lift += (Math.max(-100, Math.min(0, p.vy * 6)) - cameraTracking.lift) * 0.08;
    const baseY = p.y - H / state.zoom * cameraTracking.anchor + cameraTracking.lift, landing = predictLanding();
    let prediction = 0;
    if (landing) {
      const confidence = Math.max(0, Math.min(1, (speed - 9) / 5));
      const framed = Math.min(
        p.y - H / state.zoom * 0.3,
        Math.max(baseY, landing.y - H / state.zoom * 0.82)
      );
      prediction = (framed - baseY) * confidence * confidence * (3 - 2 * confidence);
    }
    cameraTracking.prediction += (prediction - cameraTracking.prediction) * 0.045;
    let targetY = baseY + cameraTracking.prediction;
    if (state.level.verticalCity)
      targetY = Math.max(
        p.y - H / state.zoom * 0.78,
        Math.min(p.y - H / state.zoom * 0.25, targetY)
      );
    const movement = cameraTracking.lastY === null ? 0 : p.y - cameraTracking.lastY;
    cameraTracking.lastY = p.y;
    const limit = Math.min(25, Math.max(3, Math.max(Math.abs(p.vy), Math.abs(movement)) * 1.05 + 2));
    cameraTracking.velocity += (Math.max(-limit, Math.min(limit, (targetY - state.camY) * 0.14)) - cameraTracking.velocity) * 0.3;
    state.camY += Math.max(-limit, Math.min(limit, cameraTracking.velocity));
  }
  __name(updateCamera, "updateCamera");
  function cityFlame(x, y, w, h, seed = 0, alpha = 1) {
    const beat = Math.floor(state.step / 2), unit = 1;
    ctx.save();
    ctx.globalAlpha = alpha;
    for (let i = 0; i < 8; i++) {
      const pulse = 0.57 + 0.43 * (Math.sin(beat * 0.71 + i * 2.31 + seed) + 1) / 2, fh = Math.round(h * pulse / unit) * unit, xx = Math.round((x - w / 2 + i * w / 8) / unit) * unit, ww = Math.max(1, Math.round(w / 8 / unit) * unit);
      ctx.fillStyle = "#ff5d2f";
      ctx.fillRect(xx, y - fh, ww, fh);
      ctx.fillStyle = "#ffad3d";
      ctx.fillRect(xx + unit, y - fh * 0.72, Math.max(unit, ww - unit), fh * 0.72);
      ctx.fillStyle = "#ffe483";
      ctx.fillRect(xx + unit, y - fh * 0.36, Math.max(unit, ww - unit * 2), fh * 0.36);
      ctx.fillStyle = "#ffaf5060";
      const age = (state.step * 0.015 + i * 0.21 + seed * 0.13) % 1;
      ctx.fillRect(xx + Math.sin(age * 6 + seed) * 9, y - h - age * h * 0.8, 3, 3);
    }
    ctx.restore();
  }
  __name(cityFlame, "cityFlame");
  function citySmoke(x, y, size, seed = 0, alpha = 0.2) {
    ctx.save();
    for (let j = 0; j < 8; j++) {
      const t = (state.step * 22e-4 + j / 8 + seed * 0.071) % 1, drift = t * size * 0.75 + Math.sin(t * 5 + seed) * size * 0.16, cx = Math.round((x + drift) / 2) * 2, cy = Math.round((y - t * size * 3) / 2) * 2, r = Math.round(size * (0.25 + t * 0.6) / 2) * 2;
      ctx.globalAlpha = alpha * (1 - t) * 0.8;
      ctx.fillStyle = j % 2 ? "#392441" : "#221733";
      ctx.fillRect(cx - r, cy - r * 0.4, r * 2, r);
      ctx.fillRect(cx - r * 0.7, cy - r * 0.8, r * 1.5, r * 1.7);
      ctx.fillStyle = "#74526a";
      ctx.globalAlpha = alpha * (1 - t) * 0.22;
      ctx.fillRect(cx - r * 0.65, cy - r * 0.75, r, r * 0.4);
    }
    ctx.restore();
  }
  __name(citySmoke, "citySmoke");
  function drawSkylineSmoke(x, y, size, seed, alpha) {
    if (!document.createElement) return citySmoke(x, y, size, seed, alpha);
    const variant = seed % 8;
    let texture = skylineSmokeSprites.get(variant);
    if (!texture) {
      texture = document.createElement("canvas");
      texture.width = texture.height = 64;
      const dc = texture.getContext("2d"), lobes = [
        [22, 30, 19],
        [40, 25, 17],
        [32, 15, 13],
        [42, 40, 16],
        [22, 43, 14]
      ], colors = ["#211032", "#30143f", "#421a4b", "#582154"];
      for (let yy = 0; yy < 64; yy += 2)
        for (let xx = 0; xx < 64; xx += 2) {
          if (!lobes.some(([cx, cy, r]) => (xx - cx) ** 2 + (yy - cy) ** 2 < r * r)) continue;
          const grain = Math.sin(xx * 0.53 + yy * 0.31 + variant * 2.1);
          dc.fillStyle = colors[Math.max(0, Math.min(3, Math.floor(1.5 + grain + (32 - yy) * 0.025)))];
          dc.fillRect(xx, yy, 2, 2);
        }
      skylineSmokeSprites.set(variant, texture);
    }
    ctx.save();
    for (let j = 0; j < 6; j++) {
      const t = (state.step * 26e-4 + j / 6 + seed * 0.073) % 1, span = Math.round(size * (0.65 + t * 1.1) / 2) * 2, cx = Math.round((x + t * size * 0.8 + Math.sin(t * 5 + seed) * size * 0.2) / 2) * 2, cy = Math.round((y - t * size * 3.2) / 2) * 2;
      ctx.globalAlpha = alpha * Math.min(1, t * 8) * (1 - t);
      ctx.drawImage(texture, cx - span / 2, cy - span / 2, span, span);
    }
    ctx.restore();
  }
  __name(drawSkylineSmoke, "drawSkylineSmoke");
  function drawAct2Background() {
    const progress = Math.max(0, Math.min(1, p.x / state.END)), im = art.recoveredCity || art.collapse || art.city;
    ctx.fillStyle = "#100e30";
    ctx.fillRect(0, 0, W, H);
    if (im) {
      const w = W * 1.4, h = w * im.height / im.width, scroll = Math.round(state.cam * 0.095), first = Math.floor(scroll / w), rise = Math.max(0, Math.min(1, -state.camY / 6950)) * 220, top = Math.round(-145 + rise);
      const fires = art.recoveredCity ? [
        [345, 321, 22, 70],
        [142, 488, 28, 60],
        [633, 468, 24, 64],
        [1380, 616, 32, 82],
        [1480, 890, 27, 52],
        [40, 690, 20, 55],
        [840, 780, 25, 45],
        [285, 847, 24, 42],
        [962, 940, 34, 48],
        [1120, 760, 28, 48]
      ] : [
        [353, 363, 23, 65],
        [151, 469, 25, 51],
        [1058, 550, 28, 58],
        [1300, 370, 25, 71],
        [1293, 577, 29, 48],
        [632, 644, 35, 39],
        [646, 839, 39, 32],
        [183, 702, 32, 45],
        [808, 815, 33, 42],
        [960, 932, 44, 58],
        [1115, 741, 27, 54],
        [1455, 796, 32, 42],
        [550, 432, 18, 38]
      ];
      for (let tile = first - 1; tile <= first + 1; tile++) {
        const left = tile * w - scroll;
        if (left + w < 0 || left > W) continue;
        drawCityBackdrop(im, left, top, w, h, tile % 2 !== 0, true);
      }
      drawCityClouds(im, w, h, top);
      for (let tile = first - 1; tile <= first + 1; tile++) {
        const left = tile * w - scroll;
        if (left + w < -140 || left > W + 140) continue;
        const scale = w / 1536, mirrored = tile % 2 !== 0;
        for (let i = 0; i < fires.length; i++) {
          const [fx, fy, fw, fh] = fires[i], x = Math.round(left + (mirrored ? 1536 - fx : fx) * scale), y = Math.round(top + fy * scale), seed = i + (tile % 32 + 32) % 32 * 17;
          if (x < -90 || x > W + 90 || y < 0 || y > H + 140) continue;
          drawSkylineSmoke(x, y - fh * scale, 42 * scale, seed, 0.55 + progress * 0.1);
          cityFlame(x, y, fw * scale * 1.15, fh * scale, seed, 0.94);
        }
      }
    }
    ctx.fillStyle = `rgba(32,9,38,${0.05 + progress * 0.07})`;
    ctx.fillRect(0, 0, W, H);
    for (let i = 0; i < 16 + progress * 18; i++) {
      const x = ((i * 137 - state.cam * 0.18 + Math.sin(state.step * 0.012 + i) * 8) % W + W) % W, y = ((i * 91 - state.step * (0.5 + progress * 0.6)) % H + H) % H;
      ctx.fillStyle = i % 3 ? "#ffb54c70" : "#ff6b3160";
      ctx.fillRect(x, y, 2, 3);
    }
  }
  __name(drawAct2Background, "drawAct2Background");
  function drawAct2Structures() {
    for (const b of state.level.buildings) drawCityCutaways(b);
    drawPixelCityStructures();
    drawBlimpRoute();
  }
  __name(drawAct2Structures, "drawAct2Structures");
  function drawAct2Bulkhead(h) {
    const bottom = Math.min(h.y + h.h, state.camY + H / state.zoom + 50), top = Math.max(h.y, state.camY - 40), x = h.x;
    if (bottom <= top) return;
    ctx.fillStyle = "#18233d";
    ctx.fillRect(x, top, h.w, bottom - top);
    ctx.fillStyle = "#53647e";
    ctx.fillRect(x, top, 5, bottom - top);
    ctx.fillStyle = "#8c5972";
    ctx.fillRect(x + h.w - 5, top, 5, bottom - top);
    ctx.fillStyle = "#77c8dc";
    ctx.fillRect(x, h.y, h.w, 3);
    for (let y = Math.ceil(top / 64) * 64; y < bottom; y += 64) {
      cityPixelLine(x + 8, y, x + h.w - 8, y + 54, "#7891a155", 2);
      cityPixelLine(x + h.w - 8, y, x + 8, y + 54, "#7891a155", 2);
      cityPixelRect(x + 5, y, 4, 4, "#8ba8b1");
      cityPixelRect(x + h.w - 9, y, 4, 4, "#8ba8b1");
    }
  }
  __name(drawAct2Bulkhead, "drawAct2Bulkhead");
  function drawAct2Supports(s, left, right) {
    if (s.grindable) drawGrindRail(s, left, right);
    else if (s.cityType === "blimp-anchor") {
      cityPixelRect(left, yOn(s, left), right - left, 8, "#799eac");
      cityPixelRect(left, yOn(s, left) + 8, right - left, 8, "#28374e");
    } else if (s.cityType !== "blimp") drawPixelCityDeck(s, left, right);
  }
  __name(drawAct2Supports, "drawAct2Supports");
  function drawAct2World() {
    for (const l of state.level.loops) {
      if (l.x + l.r < state.cam - 50 || l.x - l.r > state.cam + W / state.zoom + 50)
        continue;
      drawPixelCityLoop(l);
    }
    for (const d of state.level.debris) {
      if (!d.triggered || d.age > d.warn + d.fall + 120 || d.x < state.cam - 100 || d.x > state.cam + W / state.zoom + 100)
        continue;
      if (d.age < d.warn) drawDebrisWarning(d);
      else drawPixelDebris(d);
    }
    for (const e of state.level.events) {
      if (e.age < 0 || e.age > 150 || e.x + e.width < state.cam || e.x > state.cam + W / state.zoom)
        continue;
      for (let i = 0; i < 8; i++) {
        const x = e.x + i * e.width / 8, y = e.y + e.age * e.age * 0.035 + i % 3 * 15;
        cityPixelRect(x - 26, y - 8, 70, 18, i % 2 ? "#644060" : "#203551");
        cityPixelRect(x - 26, y - 8, 70, 3, "#fb956e");
        cityPixelLine(x - 12, y - 4, x + 8, y + 8, "#121d30", 4);
      }
    }
    const a = state.level.arena;
    if (a.x < state.cam + W / state.zoom + 100 && a.x + a.w > state.cam) {
      for (let i = 0; i < 64; i++) {
        const t = i * Math.PI / 32, u = (i + 1) * Math.PI / 32;
        cityPixelLine(
          a.x + 850 + Math.cos(t) * 240,
          a.y + 6 + Math.sin(t) * 19,
          a.x + 850 + Math.cos(u) * 240,
          a.y + 6 + Math.sin(u) * 19,
          "#ffe694",
          2
        );
      }
      cityPixelRect(a.x + 838, a.y - 16, 6, 28, "#ffe694");
      cityPixelRect(a.x + 858, a.y - 16, 6, 28, "#ffe694");
      cityPixelRect(a.x + 838, a.y - 5, 26, 6, "#ffe694");
      for (const x of [a.x + 80, a.x + a.w - 180]) {
        ctx.fillStyle = "#565272";
        ctx.fillRect(x, a.y - 150, 8, 150);
        cityPixelOval(x + 4, a.y - 153, 7, 7, state.step % 60 < 30 ? "#ff6851" : "#ffbd64");
      }
      sign(a.x + 1200, a.y - 140, "ROOFTOP HELIPAD", "sector");
    }
  }
  __name(drawAct2World, "drawAct2World");
  function drawGrindRail(s, left, right) {
    for (let x = Math.floor(left / 2) * 2; x < right; x += 2) {
      const y = yOn(s, x);
      cityPixelRect(x, y, 2, 12, "#29364b");
      cityPixelRect(x, y + 2, 2, 3, "#ffe1a0");
      cityPixelRect(x, y + 5, 2, 4, "#bd855b");
      cityPixelRect(x, y + 9, 2, 3, "#74505a");
    }
  }
  __name(drawGrindRail, "drawGrindRail");
  function drawClimbCue(s, left, right) {
    const cue = state.level.routeCues?.find((c) => c.id === s.id);
    if (!cue || right - left < 70) return;
    const next = state.level.surfaces.find((v) => v.id === cue.nextId), q = pose(s), dir = next.x1 + next.x2 < q.x1 + q.x2 ? -1 : 1, x = Math.max(left + 30, Math.min(right - 30, (q.x1 + q.x2) / 2)), y = yOn(s, x) + 14;
    ctx.fillStyle = "#152033";
    ctx.fillRect(x - 23, y - 6, 46, 13);
    ctx.strokeStyle = s.kind === "moving" ? "#91fcbb" : s.kind === "crumble" ? "#ffae55" : "#91ccdb";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(x - 6 * dir, y - 3);
    ctx.lineTo(x + 2 * dir, y);
    ctx.lineTo(x - 6 * dir, y + 3);
    ctx.moveTo(x + 3 * dir, y - 3);
    ctx.lineTo(x + 11 * dir, y);
    ctx.lineTo(x + 3 * dir, y + 3);
    ctx.stroke();
  }
  __name(drawClimbCue, "drawClimbCue");
  function initializeRuntimeModule33() {
    cameraTracking = { anchor: 0.64, lift: 0, prediction: 0, velocity: 0, lastY: null };
    skylineSmokeSprites = /* @__PURE__ */ new Map();
  }
  __name(initializeRuntimeModule33, "initializeRuntimeModule");
  function getRuntimeBindings33() {
    return {
      selectAct: {
        get: /* @__PURE__ */ __name(() => selectAct, "get"),
        set: /* @__PURE__ */ __name((value) => {
          selectAct = value;
        }, "set")
      },
      resetAct2: {
        get: /* @__PURE__ */ __name(() => resetAct2, "get"),
        set: /* @__PURE__ */ __name((value) => {
          resetAct2 = value;
        }, "set")
      },
      launchAirDevice: {
        get: /* @__PURE__ */ __name(() => launchAirDevice, "get"),
        set: /* @__PURE__ */ __name((value) => {
          launchAirDevice = value;
        }, "set")
      },
      beginLoop: {
        get: /* @__PURE__ */ __name(() => beginLoop, "get"),
        set: /* @__PURE__ */ __name((value) => {
          beginLoop = value;
        }, "set")
      },
      updateLoop: {
        get: /* @__PURE__ */ __name(() => updateLoop, "get"),
        set: /* @__PURE__ */ __name((value) => {
          updateLoop = value;
        }, "set")
      },
      updateAct2: {
        get: /* @__PURE__ */ __name(() => updateAct2, "get"),
        set: /* @__PURE__ */ __name((value) => {
          updateAct2 = value;
        }, "set")
      },
      predictLanding: {
        get: /* @__PURE__ */ __name(() => predictLanding, "get"),
        set: /* @__PURE__ */ __name((value) => {
          predictLanding = value;
        }, "set")
      },
      cameraTracking: {
        get: /* @__PURE__ */ __name(() => cameraTracking, "get"),
        set: /* @__PURE__ */ __name((value) => {
          cameraTracking = value;
        }, "set")
      },
      resetCameraTracking: {
        get: /* @__PURE__ */ __name(() => resetCameraTracking, "get"),
        set: /* @__PURE__ */ __name((value) => {
          resetCameraTracking = value;
        }, "set")
      },
      updateCamera: {
        get: /* @__PURE__ */ __name(() => updateCamera, "get"),
        set: /* @__PURE__ */ __name((value) => {
          updateCamera = value;
        }, "set")
      },
      cityFlame: {
        get: /* @__PURE__ */ __name(() => cityFlame, "get"),
        set: /* @__PURE__ */ __name((value) => {
          cityFlame = value;
        }, "set")
      },
      citySmoke: {
        get: /* @__PURE__ */ __name(() => citySmoke, "get"),
        set: /* @__PURE__ */ __name((value) => {
          citySmoke = value;
        }, "set")
      },
      skylineSmokeSprites: {
        get: /* @__PURE__ */ __name(() => skylineSmokeSprites, "get"),
        set: /* @__PURE__ */ __name((value) => {
          skylineSmokeSprites = value;
        }, "set")
      },
      drawSkylineSmoke: {
        get: /* @__PURE__ */ __name(() => drawSkylineSmoke, "get"),
        set: /* @__PURE__ */ __name((value) => {
          drawSkylineSmoke = value;
        }, "set")
      },
      drawAct2Background: {
        get: /* @__PURE__ */ __name(() => drawAct2Background, "get"),
        set: /* @__PURE__ */ __name((value) => {
          drawAct2Background = value;
        }, "set")
      },
      drawAct2Structures: {
        get: /* @__PURE__ */ __name(() => drawAct2Structures, "get"),
        set: /* @__PURE__ */ __name((value) => {
          drawAct2Structures = value;
        }, "set")
      },
      drawAct2Bulkhead: {
        get: /* @__PURE__ */ __name(() => drawAct2Bulkhead, "get"),
        set: /* @__PURE__ */ __name((value) => {
          drawAct2Bulkhead = value;
        }, "set")
      },
      drawAct2Supports: {
        get: /* @__PURE__ */ __name(() => drawAct2Supports, "get"),
        set: /* @__PURE__ */ __name((value) => {
          drawAct2Supports = value;
        }, "set")
      },
      drawAct2World: {
        get: /* @__PURE__ */ __name(() => drawAct2World, "get"),
        set: /* @__PURE__ */ __name((value) => {
          drawAct2World = value;
        }, "set")
      },
      drawGrindRail: {
        get: /* @__PURE__ */ __name(() => drawGrindRail, "get"),
        set: /* @__PURE__ */ __name((value) => {
          drawGrindRail = value;
        }, "set")
      },
      drawClimbCue: {
        get: /* @__PURE__ */ __name(() => drawClimbCue, "get"),
        set: /* @__PURE__ */ __name((value) => {
          drawClimbCue = value;
        }, "set")
      }
    };
  }
  __name(getRuntimeBindings33, "getRuntimeBindings");

  // src/midsection.js
  function addMiddleSection(l) {
    if (l.middleSection) return l;
    const link = l.surfaces.find((s) => s.id === "secret-exit-uphill-link"), tower = l.surfaces.find((s) => s.id === "neon-0");
    if (!link || !tower) throw Error("Neon Switchback approach not found");
    const start2 = link.x1, base = link.y1, length = 7600;
    const downstreamDecks = l.surfaces.filter((s) => s.x1 >= start2 || s.id.startsWith("neon-")).map((s) => ({ ...s }));
    const downstreamIds = new Set(downstreamDecks.map((s) => s.id));
    const belongs = /* @__PURE__ */ __name((o) => downstreamIds.has(o.id) || downstreamIds.has(o.surfaceId) || downstreamIds.has(o.roofId) || o.id === "neon-tower" || downstreamDecks.some(
      (s) => o.x >= s.x1 && o.x <= s.x2 && Math.abs((o.y ?? o.baseY) - s.y1) < 100
    ), "belongs");
    const shift = /* @__PURE__ */ __name((o) => {
      if (Array.isArray(o)) {
        o.forEach(shift);
        return;
      }
      if (!o || typeof o !== "object") return;
      for (const k of ["x", "x1", "x2", "base", "entryX", "exitX", "trigger"])
        if (typeof o[k] === "number") o[k] += length;
      for (const [k, v] of Object.entries(o))
        if (!["motion", "facade"].includes(k) && v && typeof v === "object") shift(v);
    }, "shift");
    for (const key of [
      "surfaces",
      "hazards",
      "enemies",
      "pads",
      "springs",
      "rings",
      "signs",
      "checkpoints",
      "sectors",
      "loops",
      "debris",
      "events",
      "buildings",
      "deathZones"
    ])
      for (const o of l[key] || []) {
        const x = o.x1 ?? o.x ?? o.entryX;
        if (x >= start2 || belongs(o)) shift(o);
      }
    l.end += length;
    l.arena.x += length;
    const deck = /* @__PURE__ */ __name((id, a, b, y, z = y, extra = {}) => {
      const s = {
        id: "mid-" + id,
        x1: start2 + a,
        x2: start2 + b,
        y1: base + y,
        y2: base + z,
        kind: "main",
        cityType: "rooftop",
        ...extra
      };
      l.surfaces.push(s);
      return s;
    }, "deck");
    const spring = /* @__PURE__ */ __name((id, s, x, power, launchX, targetId) => {
      const d = {
        id: "mid-" + id,
        surfaceId: s.id,
        x: start2 + x,
        y: s.y1 + (start2 + x - s.x1) * (s.y2 - s.y1) / (s.x2 - s.x1),
        power,
        launchX,
        targetId
      };
      l.springs.push(d);
      return d;
    }, "spring");
    const body = /* @__PURE__ */ __name((s, style, extra = {}) => {
      s.roof = true;
      return l.buildings.push({
        id: s.id + "-body",
        x: s.x1,
        y: Math.min(s.y1, s.y2) + 26,
        w: s.x2 - s.x1,
        h: 2e3,
        seed: 47 + l.buildings.length,
        roofId: s.id,
        style,
        ...extra
      });
    }, "body");
    const bot = /* @__PURE__ */ __name((id, s, x, extra = {}) => {
      const y = s.y1 + (start2 + x - s.x1) * (s.y2 - s.y1) / (s.x2 - s.x1) - 18;
      l.enemies.push({
        id: "mid-" + id,
        x: start2 + x,
        base: start2 + x,
        y,
        baseY: y,
        kind: "crab",
        range: 8,
        ...extra
      });
    }, "bot");
    const approach = deck("approach", 0, 320, 0), fallen = deck("fallen-building", 320, 940, 0, -90, { cityType: "concrete-ramp", fallen: true });
    body(fallen, "fallen", { damage: 1 });
    const upper = deck("upper-choice", 761, 819, -185, -185, {
      cityType: "fire-escape",
      kind: "express",
      routeType: "skill"
    });
    const bowlY = /* @__PURE__ */ __name((x) => 220 - (x <= 1800 ? 380 : 290) * Math.pow((x - 1800) / 400, 2), "bowlY"), poolDecks = [];
    for (let x = 1400; x < 2200; x += 40)
      poolDecks.push(
        deck(x === 1800 ? "pool-floor" : "pool-curve-" + x, x, x + 40, bowlY(x), bowlY(x + 40), {
          kind: "lower",
          cityType: "glass-pool",
          poolCurve: true,
          boostExit: true
        })
      );
    const poolFloor = poolDecks.find((s) => s.id === "mid-pool-floor");
    const tilted = deck("tilted-glass-roof", 2200, 2800, -70, -180, {
      cityType: "concrete-ramp",
      glass: true
    });
    body(tilted, "glass", { scenery: true });
    const roofExit = deck("pool-roof-exit", 2800, 2980, -180), right = deck("right-guard-roof", 3650, 3930, -400);
    body(right, 0);
    bot("low-guard", right, 3780);
    const low1 = deck("low-transfer-1", 3170, 3410, -290), low2 = deck("low-transfer-2", 4200, 4490, -280), low3 = deck("low-transfer-3", 4750, 5150, -160, -160);
    [low1, low2, low3].forEach((s) => body(s, 2));
    const upper1 = deck("spring-step-1", 921, 979, -470, -470, {
      kind: "express",
      routeType: "skill",
      cityType: "fire-escape"
    }), upper2 = deck("spring-step-2", 761, 819, -750, -750, {
      kind: "express",
      routeType: "skill",
      cityType: "fire-escape"
    }), upper3 = deck("spring-aim-step", 981, 1039, -1090, -1090, {
      kind: "express",
      routeType: "skill",
      cityType: "billboard"
    });
    const left = deck("left-decision", 1161, 1219, -1430, -1430, {
      kind: "express",
      routeType: "skill",
      cityType: "fire-escape"
    }), wrong = deck("wrong-decision", 1551, 1609, -1390, -1390, { cityType: "fire-escape" });
    bot("wrong-way-guard", wrong, 1580, { jumpImmune: true, rebound: false });
    const moving = deck("moving-spring-hoist", 1161, 1219, -1720, -1720, {
      kind: "moving",
      routeType: "skill",
      cityType: "crane-hoist",
      motion: { axis: "x", amp: 180, period: 300, phase: 0 }
    });
    const railExtras = {
      kind: "express",
      routeType: "boost",
      grindable: true,
      infiniteBoost: true,
      solidAtAnySpeed: true,
      boostExit: true,
      cityType: "grind-rail"
    };
    const rails = [
      deck("rail-entry", 1430, 2350, -1920, -1900, railExtras),
      deck("rail-top", 2350, 3e3, -1900, -1650, railExtras),
      deck("rail-descent", 3e3, 4700, -1650, -300, railExtras),
      deck("rail-exit", 4700, 5400, -300, 220, railExtras)
    ];
    const junction = deck("junction", 5400, 6700, 220, 220, { boostExit: true });
    body(junction, 2);
    const stair1 = deck("junction-building-1", 6840, 7040, 110), stair2 = deck("junction-building-2", 7190, 7450, 0);
    [stair1, stair2].forEach((s) => body(s, 1));
    bot("rail-guard-1", rails[1], 2700);
    bot("rail-guard-2", rails[2], 3650);
    bot("rail-guard-3", rails[2], 4500);
    spring("low-spring", fallen, 920, 18, 9, "mid-pool-floor").airSpeedLimit = 9;
    spring("upper-spring", upper, 790, 22, 0, upper1.id);
    spring("spring-1", upper1, 950, 22, 0, upper2.id);
    spring("spring-2", upper2, 790, 23, 0, upper3.id);
    spring("aim-spring", upper3, 1010, 22, 0, left.id);
    spring("left-spring", left, 1190, 21, 0, moving.id);
    spring("moving-spring", moving, 1190, 24, 0, rails[0].id);
    const pool = {
      id: "mid-pool",
      x1: start2 + 1400,
      x2: start2 + 2200,
      y: base + 40,
      floor: base + 220,
      surfaceId: poolFloor.id,
      deckIds: poolDecks.map((s) => s.id),
      booster: {
        id: "mid-pool-booster",
        x: start2 + 1810,
        y: poolFloor.y1 + (poolFloor.y2 - poolFloor.y1) / 4,
        surfaceId: poolFloor.id,
        power: 0,
        launchX: 22,
        poolBooster: true,
        targetId: tilted.id
      }
    };
    l.pads.push(pool.booster);
    l.buildings.push(
      {
        id: "mid-burned-glass-tower",
        x: start2 + 1230,
        y: base - 360,
        w: 170,
        h: 2e3,
        seed: 61,
        glass: true,
        burning: true,
        scenery: true
      },
      {
        id: "mid-tilted-glass-tower",
        x: tilted.x1,
        y: tilted.y2 + 26,
        w: tilted.x2 - tilted.x1,
        h: 2e3,
        seed: 67,
        glass: true,
        scenery: true
      }
    );
    const secret = [];
    for (const [i, x, y] of [
      [1, 2910, -400],
      [2, 2630, -510],
      [3, 2830, -620],
      [4, 2450, -730]
    ]) {
      const s = deck("secret-" + i, x, x + (i === 3 ? 430 : 210), y, y, {
        cityType: "fire-escape",
        secretDepth: i
      });
      secret.push(s);
    }
    l.monitors ??= [];
    l.monitors.push(
      {
        id: "mid-secret-monitor",
        x: start2 + 3040,
        y: base - 620,
        surfaceId: secret[2].id,
        broken: false,
        secret: true
      }
    );
    l.checkpoints.push({
      x: junction.x1 + 190,
      y: junction.y1,
      name: "GLASS CANYON / JUNCTION",
      surfaceId: junction.id
    });
    l.sectors.push(
      { x: start2, y: base, name: "GLASS CANYON", hint: "" },
      { x: tower.x1 - 30, y: tower.y1, name: "09 / NEON SWITCHBACK", hint: "" }
    );
    l.sectors.sort((a, b) => a.x - b.x);
    l.checkpoints.sort((a, b) => a.x - b.x);
    l.deathZones.push({ x1: start2, x2: start2 + length, y: base + 700 });
    for (const s of [approach, fallen, tilted, roofExit, right, low1, low2, low3, stair1, stair2])
      for (let x = s.x1 + 50; x < s.x2 - 30; x += 85)
        l.rings.push({
          x,
          y: s.y1 + (x - s.x1) * (s.y2 - s.y1) / (s.x2 - s.x1) - 38,
          taken: false
        });
    l.middleSection = {
      start: start2,
      base,
      length,
      junction,
      pool,
      lowSteps: [fallen.id, poolFloor.id, tilted.id, roofExit.id, right.id],
      highSteps: [
        upper.id,
        upper1.id,
        upper2.id,
        upper3.id,
        left.id,
        moving.id,
        ...rails.map((s) => s.id),
        junction.id
      ],
      secretRevealed: false,
      towerEntryId: tower.id
    };
    for (const c of l.routeChallenges || []) {
      const steps = c.steps.map((id) => l.surfaces.find((s) => s.id === id)).filter(Boolean);
      if (!steps.length) continue;
      c.x1 = Math.min(...steps.map((s) => s.x1));
      c.x2 = Math.max(...steps.map((s) => s.x2));
      c.exitX = steps.at(-1).x1;
      c.exitY = steps.at(-1).y1;
    }
    return l;
  }
  __name(addMiddleSection, "addMiddleSection");
  function beginWrongRouteDrop() {
    p.wrongRouteDrop = true;
    p.poolApproach = false;
    p.poolTransfer = null;
    p.vx = -18;
    p.vy = 3;
    p.ground = false;
    p.surface = null;
    state.coyote = 0;
    state.jumpBuffer = 0;
  }
  __name(beginWrongRouteDrop, "beginWrongRouteDrop");
  function updateMiddleMotion() {
    if (p.wrongRouteDrop) {
      const spring = state.level.springs.find((d) => d.id === "mid-low-spring");
      p.vx = p.x > spring.x + 2 ? -18 : 0;
    }
    return false;
  }
  __name(updateMiddleMotion, "updateMiddleMotion");
  function updateMiddleSection() {
    const m = state.level.middleSection;
    if (!m) return;
    if (!m.secretRevealed && p.x < m.start + 3300 && p.x > m.start && p.surface?.secretDepth >= 3)
      m.secretRevealed = true;
  }
  __name(updateMiddleSection, "updateMiddleSection");
  function drawMiddleSection() {
    const m = state.level.middleSection;
    if (!m) return;
    const pool = m.pool, glassRoof = surfaceById(pool.booster.targetId), smokeTop = m.base - 360 - 204;
    if (glassRoof.x2 < state.cam - 100 || pool.x1 - 400 > state.cam + W / state.zoom + 100 || smokeTop > state.camY + H / state.zoom + 100)
      return;
    const left = pool.x1 - 170;
    for (const [x, w, top, burn] of [[left, 170, m.base - 360, true]]) {
      const bottom2 = state.camY + H / state.zoom + 80, first2 = Math.max(top, state.camY - 40);
      cityPixelRect(x, first2, w, bottom2 - first2, "#18263f");
      cityPixelRect(x, first2, 6, bottom2 - first2, "#76bccb");
      cityPixelRect(x + w - 8, first2, 8, bottom2 - first2, "#40577f");
      for (let y = Math.ceil(first2 / 44) * 44; y < bottom2; y += 44) {
        cityPixelRect(x + 10, y, w - 20, 34, "#305276");
        cityPixelRect(x + 12, y, w - 24, 4, "#699dad");
        for (let xx = x + 24; xx < x + w - 16; xx += 44) cityPixelRect(xx, y, 4, 34, "#16233c");
      }
      if (burn) {
        cityFlame(x + 50, top + 30, 75, 100, 7, 0.9);
        citySmoke(x + 80, top, 54, 7, 0.25);
        for (let i = 0; i < 4; i++)
          cityPixelRect(x + i * 32, top - 12 + i % 2 * 18, 24, 12, "#13192c");
        for (let y = first2 + 28; y < bottom2; y += 154) {
          cityPixelLine(x + 20, y, x + 90, y + 30, "#0e192c", 6);
          cityPixelLine(x + 90, y + 30, x + 50, y + 54, "#0e192c", 4);
        }
      }
    }
    const roof = surfaceById(pool.booster.targetId), bottom = state.camY + H / state.zoom + 80, first = Math.max(Math.min(roof.y1, roof.y2) + 26, state.camY - 40), width = roof.x2 - roof.x1;
    ctx.save();
    ctx.beginPath();
    ctx.moveTo(roof.x1 - 400, bottom);
    for (let x = roof.x1; x <= roof.x2; x += 2) {
      const y = Math.floor((yOn(roof, x) + 26) / 2) * 2;
      ctx.lineTo(x, y);
      ctx.lineTo(x + 2, y);
    }
    ctx.lineTo(roof.x2, bottom);
    ctx.closePath();
    ctx.clip();
    for (let y = Math.floor(first / 44) * 44; y < bottom; y += 44) {
      const x = roof.x1 + Math.round((roof.y1 + 26 - y) * 0.16 / 2) * 2;
      cityPixelRect(x, y, width, 44, "#18263f");
      cityPixelRect(x, y, 6, 44, "#79b9c5");
      cityPixelRect(x + width - 8, y, 8, 44, "#40577f");
      cityPixelRect(x + 10, y + 4, width - 24, 34, "#305276");
      cityPixelRect(x + 12, y + 4, width - 28, 4, "#699dad");
      for (let xx = x + 24; xx < x + width - 16; xx += 48) {
        cityPixelRect(xx, y + 4, 4, 34, "#16233c");
        cityPixelRect(xx + 4, y + 12, 20, 2, "#456f91");
      }
    }
    ctx.restore();
    const bowl = pool.deckIds.map(surfaceById);
    ctx.save();
    ctx.beginPath();
    ctx.moveTo(pool.x1, pool.y);
    ctx.lineTo(pool.x2, pool.y);
    ctx.lineTo(bowl.at(-1).x2, bowl.at(-1).y2);
    for (const s of [...bowl].reverse()) ctx.lineTo(s.x1, s.y1);
    ctx.closePath();
    ctx.clip();
    cityPixelRect(pool.x1, pool.y, pool.x2 - pool.x1, pool.floor - pool.y, "#163c668c");
    for (let x = pool.x1; x < pool.x2; x += 8) {
      const y = pool.y + Math.round(Math.sin(x * 0.04 + state.step * 0.08)) * 2;
      cityPixelRect(x, y, 8, 4, "#84eff6");
      if (Math.floor((x + state.step * 2) / 16) % 3 === 0)
        cityPixelRect(x + 2, y + 6, 4, 2, "#408dbe");
    }
    for (let i = 0; i < 16; i++) {
      const x = pool.x1 + 30 + i * 37 % (pool.x2 - pool.x1 - 60), y = pool.floor - (state.step * 0.8 + i * 17) % (pool.floor - pool.y);
      cityPixelRect(x, y, 4, 4, "#91dae578");
      cityPixelRect(x + 2, y, 2, 2, "#d5fdff");
    }
    ctx.restore();
    if (typeof drawPoolBooster === "function") drawPoolBooster(airDevicePose(pool.booster));
  }
  __name(drawMiddleSection, "drawMiddleSection");
  function initializeRuntimeModule34() {
  }
  __name(initializeRuntimeModule34, "initializeRuntimeModule");
  function getRuntimeBindings34() {
    return {
      addMiddleSection: {
        get: /* @__PURE__ */ __name(() => addMiddleSection, "get"),
        set: /* @__PURE__ */ __name((value) => {
          addMiddleSection = value;
        }, "set")
      },
      beginWrongRouteDrop: {
        get: /* @__PURE__ */ __name(() => beginWrongRouteDrop, "get"),
        set: /* @__PURE__ */ __name((value) => {
          beginWrongRouteDrop = value;
        }, "set")
      },
      updateMiddleMotion: {
        get: /* @__PURE__ */ __name(() => updateMiddleMotion, "get"),
        set: /* @__PURE__ */ __name((value) => {
          updateMiddleMotion = value;
        }, "set")
      },
      updateMiddleSection: {
        get: /* @__PURE__ */ __name(() => updateMiddleSection, "get"),
        set: /* @__PURE__ */ __name((value) => {
          updateMiddleSection = value;
        }, "set")
      },
      drawMiddleSection: {
        get: /* @__PURE__ */ __name(() => drawMiddleSection, "get"),
        set: /* @__PURE__ */ __name((value) => {
          drawMiddleSection = value;
        }, "set")
      }
    };
  }
  __name(getRuntimeBindings34, "getRuntimeBindings");

  // src/ending-polish-frames.js
  var ending_polish_frames_exports = {};
  __export(ending_polish_frames_exports, {
    getRuntimeBindings: () => getRuntimeBindings35,
    initializeRuntimeModule: () => initializeRuntimeModule35
  });
  function initializeRuntimeModule35() {
    Object.assign(endingFrames, { "sonic-polish": [{ "bounds": [38, 23, 207, 242], "seed": [109, 23], "anchor": [136, 242], "scale": 0.27802690582959644 }, { "bounds": [289, 23, 465, 242], "seed": [359, 23], "anchor": [393.5, 242], "scale": 0.27802690582959644 }, { "bounds": [551, 23, 721, 242], "seed": [620, 23], "anchor": [648.5, 242], "scale": 0.27802690582959644 }, { "bounds": [802, 20, 1016, 242], "seed": [873, 20], "anchor": [904.5, 242], "scale": 0.27802690582959644 }, { "bounds": [1063, 21, 1249, 242], "seed": [1133, 21], "anchor": [1160.5, 242], "scale": 0.27802690582959644 }, { "bounds": [1320, 25, 1491, 243], "seed": [1394, 25], "anchor": [1408, 243], "scale": 0.27802690582959644 }, { "bounds": [38, 267, 212, 492], "seed": [111, 267], "anchor": [137, 492], "scale": 0.27802690582959644 }, { "bounds": [296, 268, 477, 492], "seed": [367, 268], "anchor": [402.5, 492], "scale": 0.27802690582959644 }, { "bounds": [550, 267, 726, 492], "seed": [621, 267], "anchor": [652, 492], "scale": 0.27802690582959644 }, { "bounds": [801, 267, 1007, 492], "seed": [873, 267], "anchor": [907, 492], "scale": 0.27802690582959644 }, { "bounds": [1056, 267, 1272, 493], "seed": [1126, 267], "anchor": [1163.5, 493], "scale": 0.27802690582959644 }, { "bounds": [1312, 280, 1513, 493], "seed": [1388, 280], "anchor": [1411.5, 493], "scale": 0.27802690582959644 }, { "bounds": [37, 523, 217, 749], "seed": [108, 523], "anchor": [143.5, 749], "scale": 0.27802690582959644 }, { "bounds": [293, 520, 474, 749], "seed": [427, 520], "anchor": [400.5, 749], "scale": 0.27802690582959644 }, { "bounds": [556, 514, 737, 749], "seed": [614, 514], "anchor": [662.5, 749], "scale": 0.27802690582959644 }, { "bounds": [804, 523, 984, 749], "seed": [877, 523], "anchor": [910, 749], "scale": 0.27802690582959644 }, { "bounds": [1078, 523, 1253, 749], "seed": [1147, 523], "anchor": [1165.5, 749], "scale": 0.27802690582959644 }, { "bounds": [1320, 523, 1496, 749], "seed": [1389, 523], "anchor": [1422.5, 749], "scale": 0.27802690582959644 }, { "bounds": [36, 777, 214, 1004], "seed": [106, 777], "anchor": [137, 1004], "scale": 0.27802690582959644 }, { "bounds": [291, 777, 477, 1004], "seed": [362, 777], "anchor": [397.5, 1004], "scale": 0.27802690582959644 }, { "bounds": [554, 774, 762, 1004], "seed": [623, 774], "anchor": [657.5, 1004], "scale": 0.27802690582959644 }, { "bounds": [808, 762, 1021, 1001], "seed": [882, 762], "anchor": [878, 1001], "scale": 0.27802690582959644 }, { "bounds": [1075, 763, 1279, 993], "seed": [1138, 763], "anchor": [1150.5, 993], "scale": 0.27802690582959644 }, { "bounds": [1326, 760, 1515, 993], "seed": [1391, 760], "anchor": [1427, 993], "scale": 0.27802690582959644 }], "shadow-polish": [{ "bounds": [33, 23, 206, 234], "seed": [131, 23], "anchor": [96, 234], "scale": 0.26 }, { "bounds": [266, 32, 465, 267], "seed": [354, 32], "anchor": [325.5, 267], "scale": 0.26 }, { "bounds": [483, 22, 745, 260], "seed": [578, 22], "anchor": [551.5, 260], "scale": 0.26 }, { "bounds": [766, 29, 962, 262], "seed": [854, 29], "anchor": [912, 262], "scale": 0.26 }, { "bounds": [980, 35, 1184, 269], "seed": [1073, 35], "anchor": [1133, 269], "scale": 0.26 }, { "bounds": [1239, 70, 1415, 266], "seed": [1319, 70], "anchor": [1332.5, 266], "scale": 0.26 }, { "bounds": [24, 323, 223, 514], "seed": [117, 323], "anchor": [118, 514], "scale": 0.26 }, { "bounds": [266, 294, 448, 519], "seed": [342, 294], "anchor": [357, 519], "scale": 0.26 }, { "bounds": [522, 289, 694, 514], "seed": [580, 289], "anchor": [615, 514], "scale": 0.26 }, { "bounds": [740, 289, 917, 522], "seed": [841, 289], "anchor": [817, 522], "scale": 0.26 }, { "bounds": [966, 289, 1165, 525], "seed": [1089, 289], "anchor": [1069, 525], "scale": 0.26 }, { "bounds": [1244, 289, 1428, 524], "seed": [1352, 289], "anchor": [1329.5, 524], "scale": 0.26, "gem": [1276, 397] }, { "bounds": [28, 543, 216, 779], "seed": [139, 543], "anchor": [113, 779], "scale": 0.26, "gem": [59, 666] }, { "bounds": [265, 541, 454, 777], "seed": [386, 541], "anchor": [352.5, 777], "scale": 0.26, "gem": [295, 690] }, { "bounds": [479, 540, 698, 777], "seed": [621, 540], "anchor": [586.5, 777], "scale": 0.26, "gem": [507, 605] }, { "bounds": [727, 551, 944, 779], "seed": [858, 551], "anchor": [829.5, 779], "scale": 0.26, "gem": [753, 610] }, { "bounds": [977, 547, 1178, 779], "seed": [1102, 547], "anchor": [1073, 779], "scale": 0.26, "gem": [1002, 566] }, { "bounds": [1235, 544, 1429, 780], "seed": [1350, 544], "anchor": [1330, 780], "scale": 0.26, "gem": [1266, 658] }, { "bounds": [21, 796, 217, 1049], "seed": [135, 796], "anchor": [116, 1049], "scale": 0.243, "gem": [53, 925] }, { "bounds": [271, 796, 459, 1049], "seed": [379, 796], "anchor": [361, 1049], "scale": 0.243, "gem": [303, 930] }, { "bounds": [498, 800, 694, 1050], "seed": [604, 800], "anchor": [588.5, 1050], "scale": 0.243, "gem": [532, 932] }, { "bounds": [740, 798, 929, 1050], "seed": [847, 798], "anchor": [831, 1050], "scale": 0.243, "gem": [774, 940] }, { "bounds": [983, 801, 1167, 1050], "seed": [1080, 801], "anchor": [1073.5, 1050], "scale": 0.243, "gem": [1015, 958] }, { "bounds": [1230, 802, 1421, 1050], "seed": [1336, 802], "anchor": [1321.5, 1050], "scale": 0.243, "gem": [1263, 951] }], "eggman-polish": [{ "bounds": [22, 58, 410, 473], "seed": [164, 58], "anchor": [216, 473], "scale": 0.246 }, { "bounds": [443, 59, 826, 473], "seed": [581, 59], "anchor": [634.5, 473], "scale": 0.246 }, { "bounds": [833, 59, 1223, 474], "seed": [973, 59], "anchor": [1028, 474], "scale": 0.246 }, { "bounds": [1246, 59, 1638, 475], "seed": [1387, 59], "anchor": [1442, 475], "scale": 0.246 }, { "bounds": [20, 497, 410, 914], "seed": [164, 497], "anchor": [215, 914], "scale": 0.246 }, { "bounds": [436, 498, 830, 914], "seed": [581, 498], "anchor": [633, 914], "scale": 0.246 }, { "bounds": [843, 499, 1239, 916], "seed": [992, 499], "anchor": [1041, 916], "scale": 0.246 }, { "bounds": [1266, 499, 1656, 914], "seed": [1423, 499], "anchor": [1461, 914], "scale": 0.246 }] });
  }
  __name(initializeRuntimeModule35, "initializeRuntimeModule");
  function getRuntimeBindings35() {
    return {};
  }
  __name(getRuntimeBindings35, "getRuntimeBindings");

  // src/main.js
  var modules = [
    level_exports,
    midsection_exports,
    blimp_route_exports,
    level2_exports,
    act2_exports,
    pixel_world_exports,
    city_polish_exports,
    supplemental_frames_exports,
    traversal_frames_exports,
    traversal_animations_exports,
    recovered_art_exports,
    boost_rules_exports,
    game_audio_exports,
    game_music_exports,
    hud_exports,
    egg_scorpion_exports,
    boss_art_exports,
    ending_scene_exports,
    ending_frames_exports,
    ending_polish_frames_exports,
    ending_art_exports,
    boss_game_exports,
    surface_collision_exports,
    player_movement_exports,
    world_interactions_exports,
    stage_runtime_exports,
    playtest_ground_exports,
    playtest_path_exports,
    playtest_devices_exports,
    playtest_rails_exports,
    playtest_boost_exports,
    playtest_motion_exports,
    playtest_exports,
    act1_motion_exports,
    game_exports
  ];
  for (const module2 of modules) {
    for (const [name, descriptor] of Object.entries(module2.getRuntimeBindings()))
      Object.defineProperty(globalThis, name, { ...descriptor, configurable: true });
  }
  for (const name of [
    "cityRasterContext",
    "cityPillarPass",
    "boss",
    "bossCheckpoint",
    "ending",
    "stageRuntime",
    "testControlled",
    "selectedAct",
    "level",
    "END",
    "mode",
    "cam",
    "camY",
    "zoom",
    "clock",
    "lives",
    "count",
    "score",
    "charge",
    "checkpoint",
    "toastTime",
    "sound",
    "particles",
    "rings",
    "enemies",
    "last",
    "acc",
    "step",
    "boost",
    "shake",
    "anim",
    "jumpBuffer",
    "coyote",
    "stage",
    "runFrames",
    "stats",
    "visited"
  ])
    Object.defineProperty(globalThis, name, {
      get: /* @__PURE__ */ __name(() => state[name], "get"),
      set: /* @__PURE__ */ __name((value) => {
        state[name] = value;
      }, "set"),
      configurable: true
    });
  for (const module2 of modules) module2.initializeRuntimeModule();
})();
