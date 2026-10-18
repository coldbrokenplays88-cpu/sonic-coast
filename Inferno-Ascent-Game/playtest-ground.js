// Generated from src/playtest-ground.js; run npm run build:compat after source edits.
'use strict';
function sampleGround(scenario, x) {
  if (scenario === 'flat')
    return { x, y: 400, angle: 0, tx: 1, ty: 0, nx: 0, ny: -1, curvature: 0 };
  if (scenario !== 'valley') throw Error('Unknown PLAYTEST ground scenario');
  // Flat center, smooth curvature transitions, then long inclined approaches.
  // y is positive DOWN. All curvature is concave toward the supported player.
  const u = Math.max(0, Math.abs(x) - 200),
    t = Math.min(1, u / 800),
    grade = 0.65;
  const height = u < 800 ? grade * 800 * (t ** 3 - 0.5 * t ** 4) : grade * (u - 400);
  const slope = -Math.sign(x) * grade * (3 * t * t - 2 * t ** 3);
  const second = u < 800 ? (-grade * 6 * t * (1 - t)) / 800 : 0;
  const norm = Math.hypot(1, slope);
  return {
    x,
    y: 650 - height,
    angle: Math.atan(slope),
    tx: 1 / norm,
    ty: slope / norm,
    nx: slope / norm,
    ny: -1 / norm,
    curvature: second / norm ** 3,
  };
}

function groundBounds(scenario) {
  if (scenario === 'flat') return 5000;
  if (scenario === 'valley') return 2400;
  throw Error('Unknown PLAYTEST ground scenario');
}

function createGroundPlayer(scenario = 'flat', x = 0, speed = 0, posture = 'standing') {
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
    boundary: null,
  };
}

function groundContact(player, sampler = sampleGround) {
  const surface = sampler(player.scenario, player.x);
  const height =
    player.posture === 'rolling' ? groundTuning.rollDiameter : groundTuning.standHeight;
  return {
    ...surface,
    speed: player.speed,
    vx: player.speed * surface.tx,
    vy: player.speed * surface.ty,
    anchor: { x: surface.x, y: surface.y },
    height,
    width: player.posture === 'rolling' ? height : groundTuning.standWidth,
    center: { x: surface.x + (surface.nx * height) / 2, y: surface.y + (surface.ny * height) / 2 },
    normalReaction: -groundTuning.gravity * surface.ny - player.speed ** 2 * surface.curvature,
  };
}

function groundEnergy(player, sampler = sampleGround) {
  // Unit mass. Potential zero at the valley bottom; positive y points down.
  return (
    player.speed ** 2 / 2 + groundTuning.gravity * (650 - sampler(player.scenario, player.x).y)
  );
}

function groundResist(speed, amount) {
  return Math.sign(speed) * Math.max(0, Math.abs(speed) - amount);
}

function beginGroundTick(player, input = {}, allowRoll = true, canStand = true) {
  const t = groundTuning,
    direction = Math.sign(input.direction || 0),
    down = !!input.down;
  const unrolled =
    player.posture === 'rolling' && direction * player.speed < 0 && !player.dash && canStand;
  if (unrolled) {
    player.posture = 'standing';
    player.restTicks = 0;
  } else if (down && !player.downHeld && Math.abs(player.speed) >= t.rollEntrySpeed && allowRoll) {
    player.posture = 'rolling';
    player.restTicks = 0;
  }
  player.downHeld = down;
  const rolling = player.posture === 'rolling';
  // A standing braking tick cannot become reverse propulsion partway through.
  const braking = direction * player.speed < 0;
  player.braking = braking && !rolling;
  player.brakeTicks = player.braking ? (player.brakeTicks || 0) + 1 : 0;
  return { direction, rolling, braking, unrolled };
}

function landingGroundPosture(canOccupy) {
  return ['standing', 'rolling'].find(canOccupy);
}

function advanceGroundSubstep(
  player,
  controls,
  dt,
  sampler = sampleGround,
  arcLength = false
) {
  const t = controls.physics || groundTuning,
    { direction, rolling, braking } = controls;
  const position = arcLength ? player.pathS : player.x;
  const before = sampler(player.scenario, position);
  // Static grip is a standing contact rule, not extra resistance while moving.
  // Rails opt out: grinding must still roll back under its own slope forces.
  if (
    !rolling && !direction && !controls.boost && controls.standingGrip !== false &&
    before.ty !== 0 && Math.abs(player.speed) < t.standingGripSpeed &&
    Math.abs(before.angle) <= t.standingGripAngle
  ) {
    player.speed = 0;
    return;
  }
  // Keep flat braking, but continuously relieve countersteer with inclination.
  // Braking strength is independent of the downhill rolling slope factor.
  // The near-rest fade also prevents extra static friction on gentle grades.
  const rollBrake =
    direction * player.speed < 0
      ? t.rollBrake *
        (1 - Math.abs(before.ty)) *
        Math.min(1, Math.abs(player.speed) / t.rollBrakeFadeSpeed)
      : 0;
  const resistance = controls.boost
    ? rolling
      ? t.rollResistance
      : 0
    : rolling
      ? t.rollResistance + rollBrake
      : (direction ? 0 : t.coastResistance) + (braking ? t.brake : 0);
  const drive = controls.boost
    ? (controls.boost.facing *
        Math.max(0, controls.boost.speed - player.speed * controls.boost.facing) *
        (1 - (1 - controls.boost.response) ** dt)) /
      dt
    : !rolling && direction && !braking
      ? direction *
        Math.min(t.acceleration, Math.max(0, t.runRange - player.speed * direction) / dt)
      : 0;
  const midpointX = position + (player.speed * (arcLength ? 1 : before.tx) * dt) / 2;
  const midpoint = sampler(player.scenario, midpointX);
  // Sonic 2 uses 0x50 downhill roll / 0x20 running slope force. Preserve
  // approved uphill loss: only velocity aligned with downhill gets the ratio.
  const slopeFactor = rolling && player.speed * midpoint.ty > 0 ? t.rollDownhillMultiplier : 1;
  let slopeStep = t.gravity * midpoint.ty * slopeFactor * dt;
  // Limit only gravity's addition to a roll, never externally supplied speed.
  // Include this substep's friction in the allowance so sustained rolling can
  // settle at the cap without a sawtooth speed or an artificial launch.
  if (rolling && player.speed * slopeStep >= 0) {
    const cap = t.rollSpeedCap ?? Infinity;
    const allowance = Math.abs(player.speed) > cap ? 0 : cap - Math.abs(player.speed) + resistance * dt;
    slopeStep = Math.sign(slopeStep) * Math.min(Math.abs(slopeStep), allowance);
  }
  const nextSpeed = groundResist(
    player.speed + slopeStep + drive * dt,
    resistance * dt
  );
  // Trapezoidal travel plus midpoint tangent; all velocities derive from speed.
  if (arcLength) player.pathS += (player.speed + nextSpeed) * 0.5 * dt;
  else player.x += (player.speed + nextSpeed) * 0.5 * midpoint.tx * dt;
  player.distance += Math.abs((player.speed + nextSpeed) * 0.5 * dt);
  player.speed = nextSpeed;
}

function finishGroundTick(
  player,
  controls,
  sampler = sampleGround,
  canStand = true,
  bounds = groundBounds,
  arcLength = false
) {
  const t = groundTuning,
    { rolling } = controls;
  player.ticks++;
  if (Math.abs(player.speed) > 0.02) player.facing = Math.sign(player.speed);
  const slopeForce = Math.abs(
    t.gravity * sampler(player.scenario, arcLength ? player.pathS : player.x).ty
  );
  const turning =
    controls.direction * player.facing < 0 && Math.abs(player.speed) <= t.rollTurnSpeed;
  // Deliberate turns can stand before the passive rest timer, retaining the
  // remaining velocity. A steep gravity-driven reversal must stay rolled.
  if (rolling && turning && slopeForce <= t.rollResistance && canStand) {
    player.posture = 'standing';
    player.restTicks = 0;
  } else if (rolling && Math.abs(player.speed) < t.restSpeed && slopeForce <= t.rollResistance) {
    player.restTicks++;
    if (player.restTicks >= t.uncurlTicks && canStand) {
      player.posture = 'standing';
      player.restTicks = 0;
    }
  } else player.restTicks = 0;
  if (
    !Number.isFinite(player.x) ||
    !Number.isFinite(player.speed) ||
    Math.abs(player.speed) > t.safetySpeed
  )
    player.boundary = 'numerical safety reset (outside benchmark range)';
  else if (Math.abs(player.x) > bounds(player.scenario)) player.boundary = 'test boundary reset';
}

function stepGroundPlayer(player, input = {}) {
  const controls = beginGroundTick(player, input);
  for (let i = 0; i < groundTuning.substeps; i++)
    advanceGroundSubstep(player, controls, 1 / groundTuning.substeps);
  finishGroundTick(player, controls);
}

const groundTuning = Object.freeze({
    revision: 'GROUND-6',
    hz: 60,
    substeps: 4,
    runRange: 14,
    acceleration: 0.16,
    brake: 0.9,
    coastResistance: 0.1,
    standingGripSpeed: 0.3,
    standingGripAngle: (38 * Math.PI) / 180,
    gravity: 0.35,
    rollResistance: 0.025,
    rollSpeedCap: 32,
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
    rollDiameter: 38,
  });
