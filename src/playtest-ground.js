// Ground-only experiment. No dependency on legacy player or collision state.
export let groundTuning;

export function sampleGround(scenario, x) {
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

export function groundBounds(scenario) {
  if (scenario === 'flat') return 5000;
  if (scenario === 'valley') return 2400;
  throw Error('Unknown PLAYTEST ground scenario');
}

export function createGroundPlayer(scenario = 'flat', x = 0, speed = 0, posture = 'standing') {
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

export function groundContact(player) {
  const surface = sampleGround(player.scenario, player.x);
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

export function groundEnergy(player) {
  // Unit mass. Potential zero at the valley bottom; positive y points down.
  return (
    player.speed ** 2 / 2 + groundTuning.gravity * (650 - sampleGround(player.scenario, player.x).y)
  );
}

export function groundResist(speed, amount) {
  return Math.sign(speed) * Math.max(0, Math.abs(speed) - amount);
}

export function stepGroundPlayer(player, input = {}) {
  const t = groundTuning,
    direction = Math.sign(input.direction || 0),
    down = !!input.down;
  if (down && !player.downHeld && Math.abs(player.speed) >= t.rollEntrySpeed) {
    player.posture = 'rolling';
    player.restTicks = 0;
  }
  player.downHeld = down;
  const rolling = player.posture === 'rolling';
  // A standing braking tick cannot become reverse propulsion partway through.
  const braking = direction * player.speed < 0;
  const dt = 1 / t.substeps;
  for (let i = 0; i < t.substeps; i++) {
    const before = sampleGround(player.scenario, player.x);
    // Keep flat braking, but continuously relieve countersteer with inclination.
    // Gravity remains unchanged; this only weakens the opposing control force.
    // The near-rest fade also prevents extra static friction on gentle grades.
    const rollBrake = direction * player.speed < 0
      ? t.rollBrake * (1 - Math.abs(before.ty)) * Math.min(1, Math.abs(player.speed) / t.rollBrakeFadeSpeed)
      : 0;
    const resistance = rolling
      ? t.rollResistance + rollBrake
      : (direction ? 0 : t.coastResistance) + (braking ? t.brake : 0);
    const drive =
      !rolling && direction && !braking
        ? direction *
          Math.min(t.acceleration, Math.max(0, t.runRange - player.speed * direction) / dt)
        : 0;
    const midpointX = player.x + (player.speed * before.tx * dt) / 2;
    const midpoint = sampleGround(player.scenario, midpointX);
    const nextSpeed = groundResist(
      player.speed + (t.gravity * midpoint.ty + drive) * dt,
      resistance * dt
    );
    // Trapezoidal travel plus midpoint tangent; all velocities derive from speed.
    player.x += (player.speed + nextSpeed) * 0.5 * midpoint.tx * dt;
    player.distance += Math.abs((player.speed + nextSpeed) * 0.5 * dt);
    player.speed = nextSpeed;
  }
  player.ticks++;
  if (Math.abs(player.speed) > 0.02) player.facing = Math.sign(player.speed);
  const slopeForce = Math.abs(t.gravity * sampleGround(player.scenario, player.x).ty);
  if (rolling && Math.abs(player.speed) < t.restSpeed && slopeForce <= t.rollResistance) {
    player.restTicks++;
    if (player.restTicks >= t.uncurlTicks) {
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
  else if (Math.abs(player.x) > groundBounds(player.scenario))
    player.boundary = 'test boundary reset';
}

export function initializeRuntimeModule() {
  groundTuning = Object.freeze({
    revision: 'GROUND-3',
    hz: 60,
    substeps: 4,
    runRange: 14,
    acceleration: 0.16,
    brake: 0.5,
    coastResistance: 0.1,
    gravity: 0.35,
    rollResistance: 0.025,
    rollBrake: 0.18,
    rollBrakeFadeSpeed: 2,
    rollEntrySpeed: 2,
    restSpeed: 0.08,
    uncurlTicks: 12,
    safetySpeed: 80,
    standHeight: 48,
    standWidth: 22,
    rollDiameter: 38,
  });
}

export function getRuntimeBindings() {
  return {};
}
