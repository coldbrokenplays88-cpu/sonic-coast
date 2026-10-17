// Act 1's finite authored terrain adapter. This is its only movement integrator.
// Forces, posture rules, jump and resource tuning come from approved PLAYTEST.
import { state as runtimeState } from './state.js';
import { p, keys, JUMP_KEYS, gameSound, die, hurt, tuning } from './game.js';
import {
  createGroundPlayer,
  beginGroundTick,
  advanceGroundSubstep,
  finishGroundTick,
  groundTuning,
} from './playtest-ground.js';
import {
  motionTuning,
  bodyBoxDistance,
  sweepGroundBox,
  updateExperimentalDash,
  motionAirForces,
} from './playtest-motion.js';
import {
  createExperimentalBoost,
  beginExperimentalBoost,
  experimentalGroundBoost,
  experimentalBoostTuning,
  resetExperimentalAirBoost,
} from './playtest-boost.js';
import { experimentalDeviceImpact } from './playtest-devices.js';
import { pathPolynomialRoots } from './playtest-path.js';
import { pose, active, spikeContact, recordSurfaceLanding } from './surface-collision.js';
import {
  beforeStageLanding,
  afterStageLanding,
  stageDeathLimit,
  updateStageMotion,
} from './stage-runtime.js';
import { resolveMotionInteractions } from './world-interactions.js';
import { beginBubbleSlam, reboundBubbleShield, updateBrakingPose } from './player-movement.js';

export function usesAct1Motion() {
  return runtimeState.selectedAct === 1 && !!p.act1Motion;
}

// Interpolate the existing integer-tick poses. Rendering and collision agree at
// tick boundaries, and a carrier contributes its exact tick displacement once.
export function act1Surface(s, x, time = runtimeState.runFrames) {
  const tick = Math.floor(time),
    f = time - tick,
    a = pose(s, tick),
    b = pose(s, tick + 1);
  const x1 = a.x1 + (b.x1 - a.x1) * f,
    y1 = a.y1 + (b.y1 - a.y1) * f;
  const slope = a.slope,
    norm = Math.hypot(1, slope);
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
    vy: b.y1 - a.y1,
  };
}

export function act1Body(m = p.act1Motion, posture = m.posture, time = runtimeState.runFrames) {
  const height = posture === 'rolling' ? groundTuning.rollDiameter : groundTuning.standHeight;
  const surface = m.mode === 'grounded' && m.surface ? act1Surface(m.surface, m.x, time) : null;
  return {
    x: surface ? m.x + (surface.nx * height) / 2 : m.x,
    y: surface ? surface.y + (surface.ny * height) / 2 : m.y,
    hw: posture === 'rolling' ? height / 2 : groundTuning.standWidth / 2,
    hh: height / 2,
    circle: posture === 'rolling',
    angle: surface?.angle || 0,
  };
}

export function act1Solids() {
  return runtimeState.level.hazards.filter((h) => !h.broken && h.type !== 'spikes');
}
export function act1Box(h) {
  return { x1: h.x, x2: h.x + h.w, y1: h.y, y2: h.y + h.h };
}
export function act1Clear(m, posture, time = runtimeState.runFrames) {
  const body = act1Body(m, posture, time);
  return act1Solids().every(
    (h) => bodyBoxDistance(body, act1Box(h)).distance >= -motionTuning.skin
  );
}

export function resetAct1Motion() {
  if (runtimeState.selectedAct !== 1) {
    p.act1Motion = null;
    return;
  }
  const m = {
    ...createGroundPlayer(),
    scenario: 'act1',
    x: p.x,
    y: p.y + 20,
    mode: p.ground && p.surface ? 'grounded' : 'airborne',
    surface: p.surface,
    boost: createExperimentalBoost(runtimeState.boost),
    dash: null,
    air: null,
    pendingJump: false,
    rollBuffer: 0,
    pendingBoost: false,
    pressAirborne: false,
    coyote: 0,
    jumpBuffer: 0,
    updates: 0,
    latestTransition: 'checkpoint reset',
    posture: p.rolling ? 'rolling' : 'standing',
    facing: p.face,
  };
  if (m.mode === 'grounded') {
    const s = act1Surface(m.surface, m.x);
    m.speed = (p.vx - s.vx) / s.tx;
  } else {
    m.y = p.y + 20 - (m.posture === 'rolling' ? 19 : 24);
    m.speed = null;
    m.air = { vx: p.vx, vy: p.vy, cutEligible: false, jumpLift: 0 };
  }
  p.act1Motion = m;
  projectAct1Motion(m);
}

export function clearAct1Input() {
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

// Called before legacy input mutations. Pause/start/reset remain in game.js.
export function inputAct1Motion(k, pressed) {
  const m = p.act1Motion;
  adoptAct1Interaction(m);
  const boostKeys = ['ShiftLeft', 'ShiftRight', 'KeyX', 'MouseBoost'];
  if (pressed && !keys.has(k)) {
    if (k === 'ArrowDown' || k === 'KeyS') m.rollBuffer = 6;
    if (JUMP_KEYS.includes(k) && !JUMP_KEYS.some((code) => keys.has(code))) {
      if (m.mode === 'airborne' && p.shield === 'bubble' && !p.hurt && !p.bubbleSlam) {
        beginBubbleSlam();
        adoptAct1Interaction(m);
      } else {
        m.pendingJump = true;
        m.jumpBuffer = tuning.buffer;
      }
    }
    if (boostKeys.includes(k) && !boostKeys.some((code) => keys.has(code))) {
      m.pendingBoost = true;
      m.pressAirborne = m.mode === 'airborne';
    }
  }
  if (pressed) keys.add(k);
  else keys.delete(k);
}

export function projectAct1Motion(m, time = runtimeState.runFrames) {
  const grounded = m.mode === 'grounded',
    body = act1Body(m, m.posture, time);
  const s = grounded ? act1Surface(m.surface, m.x, time) : null;
  // p.y keeps its established feet-minus-20 convention for gameplay queries.
  // p.vy=0 on contact preserves legacy stomp semantics; world velocity is below.
  Object.assign(p, {
    x: grounded ? m.x : body.x,
    y: grounded ? s.y - 20 : body.y + body.hh - 20,
    vx: grounded ? m.speed * s.tx + s.vx : m.air.vx,
    vy: grounded ? 0 : m.air.vy,
    ground: grounded,
    surface: grounded ? m.surface : null,
    roll: m.posture === 'rolling',
    rolling: m.posture === 'rolling' && grounded,
    face: m.facing,
    contactSpeed: null,
    loop: null,
    boosting: m.boost.active,
    airBoostUsed: m.boost.airUsed,
    airBoostFrames: m.boost.remaining,
    airBoostActive: !grounded && m.boost.active,
    boostLocked: m.boost.locked,
    jumpHeld: JUMP_KEYS.some((code) => keys.has(code)),
  });
  runtimeState.boost = m.boost.meter;
  runtimeState.charge = m.dash ? (m.dash.charge * 20) / 30 : 0;
  m.worldVelocity = grounded
    ? { vx: m.speed * s.tx + s.vx, vy: m.speed * s.ty + s.vy }
    : { vx: m.air.vx, vy: m.air.vy };
  m.projection = {
    x: p.x,
    y: p.y,
    vx: p.vx,
    vy: p.vy,
    ground: p.ground,
    surface: p.surface,
    rolling: p.rolling,
    roll: p.roll,
  };
}

// Only explicit foreign changes (hurt, enemy rebound, scripted launch or test
// teleport) are adopted. Projected legacy velocities never advance movement.
export function adoptAct1Interaction(m) {
  const q = m.projection;
  if (!q) return;
  const changed = ['x', 'y', 'vx', 'vy', 'ground', 'surface', 'rolling', 'roll'].some(
    (k) => p[k] !== q[k]
  );
  if (runtimeState.boost > m.boost.meter && !p.boostLocked) m.boost.locked = false;
  m.boost.meter = runtimeState.boost;
  if (!changed) return;
  m.posture = p.rolling || p.roll ? 'rolling' : 'standing';
  m.facing = p.face;
  m.boost.airUsed = p.airBoostUsed;
  if (p.ground && p.surface) {
    m.mode = 'grounded';
    m.surface = p.surface;
    m.x = p.x;
    m.y = p.y + 20;
    const s = act1Surface(m.surface, m.x);
    m.speed = (p.vx - s.vx) / s.tx;
    m.air = null;
  } else {
    const height = m.posture === 'rolling' ? 38 : 48;
    Object.assign(m, {
      mode: 'airborne',
      surface: null,
      x: p.x,
      y: p.y + 20 - height / 2,
      speed: null,
      air: { vx: p.vx, vy: p.vy, cutEligible: false, jumpLift: 0 },
    });
    m.boost.remaining = 0;
    m.boost.active = false;
    m.dash = null;
  }
  m.latestTransition = p.hurt ? 'damage handoff' : 'interaction handoff';
}

export function releaseAct1(m, reason, jump, time) {
  const s = act1Surface(m.surface, m.x, time),
    oldPosture = m.posture;
  if (jump && act1Clear(m, 'rolling', time)) m.posture = 'rolling';
  const body = act1Body(m, m.posture, time),
    impulse = jump ? motionTuning.jumpImpulse : 0;
  const vx = m.speed * s.tx + s.vx + impulse * s.nx;
  const vy = m.speed * s.ty + s.vy + impulse * s.ny;
  m.lastTakeoff = { reason, vx, vy, speed: m.speed, carrier: { vx: s.vx, vy: s.vy } };
  Object.assign(m, {
    x: body.x,
    y: body.y,
    speed: null,
    surface: null,
    mode: 'airborne',
    dash: null,
    air: {
      vx,
      vy,
      cutEligible: jump,
      jumpLift: Math.max(0, -impulse * s.ny),
      restorePosture: oldPosture,
    },
    latestTransition: reason,
    coyote: jump ? 0 : tuning.coyote,
  });
  if (jump) {
    p.jumpAttack = true;
    p.poseJumpFrame = runtimeState.runFrames;
    runtimeState.stats.jumps++;
    gameSound('jump');
    m.jumpBuffer = 0;
  }
}

export function attachAct1(m, surface, x, incoming, time, seam = false) {
  const s = act1Surface(surface, x, time),
    previous = m.surface;
  const speed = seam ? m.speed : (incoming.vx - s.vx) * s.tx + (incoming.vy - s.vy) * s.ty;
  const candidate = { ...m, mode: 'grounded', surface, x, y: s.y, speed, air: null };
  const restore = m.air?.restorePosture || 'standing';
  if (!seam) candidate.posture = act1Clear(candidate, restore, time) ? restore : 'rolling';
  if (!act1Clear(candidate, candidate.posture, time)) return false;
  Object.assign(m, candidate);
  m.restTicks = 0;
  m.latestTransition = seam ? 'surface join' : 'landing';
  if (!seam) resetExperimentalAirBoost(m);
  beforeStageLanding(surface);
  projectAct1Motion(m, time);
  p.landFrame = runtimeState.runFrames;
  p.landKind = surface.kind;
  if (!seam) {
    p.poseLandingFrame = runtimeState.runFrames;
    gameSound('land', { speed: Math.abs(speed), volume: 0.7 });
  }
  p.jumpAttack = false;
  p.scriptedLaunch = false;
  afterStageLanding(surface);
  recordSurfaceLanding(surface, previous !== surface || !seam);
  if (reboundBubbleShield()) adoptAct1Interaction(m);
  else if (m.mode === 'grounded' && m.jumpBuffer > 0 && !m.dash)
    releaseAct1(m, 'buffered jump', true, time);
  return true;
}

export function act1SolidImpact(m, body, vx, vy, ax, ay, duration) {
  let hit = null;
  for (const h of act1Solids()) {
    if (h.type === 'breakable' && (m.boost.active || (!h.boostOnly && Math.abs(vx) >= h.threshold)))
      continue;
    const face = {
      x: h.x + h.w / 2,
      y: h.y,
      half: h.w / 2,
      depth: h.h,
      nx: 0,
      ny: -1,
      tx: 1,
      ty: 0,
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

export function moveAct1Air(m, direction, braking, duration, time) {
  let { ax, ay, bursting } = motionAirForces(m, direction, braking, duration);
  if (bursting) m.boost.active = true;
  const body = act1Body(m),
    a = m.air;
  a.blocked = (a.blocked || []).filter(
    (n) => bodyBoxDistance(body, act1Box(n.h)).distance <= motionTuning.skin * 3
  );
  for (const n of a.blocked) {
    const into = ax * n.nx + ay * n.ny;
    if (into < 0) {
      ax -= into * n.nx;
      ay -= into * n.ny;
    }
  }
  let hit = act1SolidImpact(m, body, a.vx, a.vy, ax, ay, duration);
  for (const s of runtimeState.level.surfaces) {
    if (!active(s)) continue;
    if (
      s.entrySpeed &&
      !s.solidAtAnySpeed &&
      (Math.abs(a.vx) < s.entrySpeed || (s.entryDirection && Math.sign(a.vx) !== s.entryDirection))
    )
      continue;
    const q = act1Surface(s, body.x, time);
    const extent = body.circle ? body.hh : Math.abs(q.nx) * body.hw + Math.abs(q.ny) * body.hh;
    const distance =
      (body.x - q.x1) * q.nx + (body.y - (q.y + ((q.x1 - q.x) * q.ty) / q.tx)) * q.ny - extent;
    const vn = (a.vx - q.vx) * q.nx + (a.vy - q.vy) * q.ny;
    const an = ax * q.nx + ay * q.ny;
    if (distance < -motionTuning.skin * 2) continue;
    for (const t of pathPolynomialRoots([distance, vn, an / 2], 0, duration)) {
      if (vn + an * t >= -1e-8 || (hit && t >= hit.time)) continue;
      const cx = m.x + a.vx * t + (ax * t * t) / 2 - q.vx * t;
      const contactX = cx - q.nx * extent;
      if (contactX < q.x1 - 1e-6 || contactX > q.x2 + 1e-6) continue;
      hit = { time: t, s, x: contactX + q.vx * t, q: { nx: q.nx, ny: q.ny } };
      break;
    }
  }
  const dt = hit ? hit.time : duration;
  m.x += a.vx * dt + (ax * dt * dt) / 2;
  m.y += a.vy * dt + (ay * dt * dt) / 2;
  a.vx += ax * dt;
  a.vy += ay * dt;
  a.jumpLift = Math.max(0, (a.jumpLift || 0) - groundTuning.gravity * dt);
  if (!hit) return duration;
  if (hit.s && attachAct1(m, hit.s, hit.x, { vx: a.vx, vy: a.vy }, time + dt)) return dt;
  const n = hit.q,
    into = a.vx * n.nx + a.vy * n.ny;
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
  // A physical block top can carry Sonic just as its visible surface does.
  if (hit.h && n.ny < -0.999) {
    const h = hit.h;
    const top = {
      id: h.id || 'solid-top',
      x1: h.x,
      x2: h.x + h.w,
      y1: h.y,
      y2: h.y,
      kind: 'solid',
    };
    attachAct1(m, top, m.x, { vx: a.vx, vy: a.vy }, time + dt);
  }
  return dt;
}

export function moveAct1Ground(m, controls, duration, time) {
  const surface = m.surface;
  if (!active(surface)) {
    releaseAct1(m, 'crumbling deck', false, time);
    return 0;
  }
  const q = act1Surface(surface, m.x, time),
    before = act1Body(m, m.posture, time);
  const sampler = (_scenario, x) => act1Surface(surface, x, time);
  let local = { ...controls };
  const boosted = experimentalGroundBoost(m, surface) && !p.hurt && !p.bubbleSlam;
  m.boost.active = boosted;
  if (boosted) local.boost = { ...experimentalBoostTuning, facing: m.facing };
  let dt = duration;
  if (boosted && !(surface.grindable && surface.infiniteBoost))
    dt = Math.min(dt, m.boost.meter / experimentalBoostTuning.groundCost);
  const advance = (target, t) => {
    if (t <= 0) return;
    advanceGroundSubstep(target, local, t, sampler);
    target.x += q.vx * t;
    target.y = act1Surface(surface, target.x, time + t).y;
  };
  let candidate = { ...m };
  advance(candidate, dt);
  let edge = null,
    forward = candidate.x > q.x2 + q.vx * dt;
  if (forward || candidate.x < q.x1 + q.vx * dt) {
    const end = forward ? q.x2 : q.x1;
    let lo = 0,
      hi = dt;
    for (let i = 0; i < 30; i++) {
      const mid = (lo + hi) / 2,
        c = { ...m };
      advance(c, mid);
      if ((forward ? 1 : -1) * (c.x - end - q.vx * mid) > 0) hi = mid;
      else lo = mid;
    }
    dt = (lo + hi) / 2;
    candidate = { ...m };
    advance(candidate, dt);
    edge = forward ? 'right' : 'left';
  }
  let block = null;
  for (const h of act1Solids()) {
    if (
      h.type === 'breakable' &&
      (boosted || (!h.boostOnly && Math.abs(m.speed * q.tx) >= h.threshold))
    )
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
    // Consume constrained time without applying propulsion into a solid again.
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
    for (const s of runtimeState.level.surfaces) {
      if (s === surface || !active(s)) continue;
      const z = act1Surface(s, m.x, time + dt);
      if (m.x >= z.x1 - 1e-4 && m.x <= z.x2 + 1e-4 && Math.abs(z.y - at.y) < 1e-4) {
        join = s;
        break;
      }
    }
    const z = join && act1Surface(join, m.x, time + dt);
    // Upright crest grip is approved; rolled bodies leave a sharp convex lip.
    const convex = z && Math.sign(m.speed) * (z.angle - q.angle) > 1e-7;
    if (
      !(
        join &&
        !(m.posture === 'rolling' && convex) &&
        attachAct1(m, join, m.x, null, time + dt, true)
      )
    )
      releaseAct1(m, join ? 'rolled crest' : 'ledge', false, time + dt);
  }
  return dt;
}

export function updateAct1Movement() {
  const m = p.act1Motion;
  if (updateStageMotion()) {
    adoptAct1Interaction(m);
    return true;
  }
  adoptAct1Interaction(m);
  const direction =
    Number(keys.has('ArrowRight') || keys.has('KeyD')) -
    Number(keys.has('ArrowLeft') || keys.has('KeyA'));
  const input = {
    direction: p.hurt ? 0 : direction,
    down: keys.has('ArrowDown') || keys.has('KeyS') || m.rollBuffer > 0,
    jumpHeld: JUMP_KEYS.some((code) => keys.has(code)),
    jumpPressed: m.pendingJump,
    boostHeld:
      !p.hurt &&
      !p.bubbleSlam &&
      ['ShiftLeft', 'ShiftRight', 'KeyX', 'MouseBoost'].some((code) => keys.has(code)),
    boostPressed: m.pendingBoost,
    boostPressAirborne: m.pressAirborne,
  };
  const startedGrounded = m.mode === 'grounded',
    startSpeed = startedGrounded ? Math.abs(m.speed) : Math.abs(m.air.vx);
  const surface = startedGrounded ? act1Surface(m.surface, m.x, runtimeState.runFrames - 1) : null;
  const previousPosture = m.posture;
  if (startedGrounded && m.rollBuffer > 0) m.downHeld = false;
  const dash = updateExperimentalDash(m, input, surface, () => act1Clear(m, 'rolling'));
  if (dash) m.jumpBuffer = 0;
  let controls = startedGrounded ? beginGroundTick(m, input, act1Clear(m, 'rolling')) : null;
  if (m.dash) controls = { direction: 0, rolling: false, braking: true };
  if (previousPosture !== 'rolling' && m.posture === 'rolling') runtimeState.stats.rolls++;
  if (startedGrounded && m.posture === 'rolling') m.rollBuffer = 0;
  if (startedGrounded) m.coyote = tuning.coyote;
  if (startedGrounded && m.jumpBuffer > 0 && !dash)
    releaseAct1(m, 'jump', true, runtimeState.runFrames - 1);
  else if (!startedGrounded && m.jumpBuffer > 0 && m.coyote > 0 && m.pendingJump) {
    m.air.vy -= motionTuning.jumpImpulse;
    m.air.jumpLift = motionTuning.jumpImpulse;
    m.air.cutEligible = true;
    m.posture = 'rolling';
    m.coyote = 0;
    m.jumpBuffer = 0;
    p.jumpAttack = true;
    runtimeState.stats.jumps++;
    gameSound('jump');
  }
  beginExperimentalBoost(m, input, startedGrounded);
  if (m.air?.cutEligible && !input.jumpHeld) {
    if (m.air.vy < 0 && m.air.jumpLift > 0)
      m.air.vy += m.air.jumpLift * (1 - motionTuning.cutRatio);
    m.air.cutEligible = false;
    m.air.jumpLift = 0;
  }
  m.pendingJump = m.pendingBoost = false;
  let elapsed = 0,
    iterations = 0,
    burst = false,
    airBraking = null;
  const deaths = runtimeState.stats.deaths;
  while (elapsed < 1 - 1e-9) {
    if (++iterations > 128) throw Error('Act 1 movement failed to converge');
    const time = runtimeState.runFrames - 1 + elapsed;
    const speed = m.mode === 'grounded' ? Math.abs(m.speed) : Math.hypot(m.air.vx, m.air.vy);
    const dt = Math.min(1 - elapsed, 0.25, 8 / Math.max(1, speed));
    const oldX = p.x,
      oldY = p.y,
      oldSurface = p.surface;
    let consumed;
    if (m.mode === 'grounded') {
      controls ??= {
        direction: input.direction,
        rolling: m.posture === 'rolling',
        braking: input.direction * m.speed < 0,
      };
      consumed = moveAct1Ground(m, controls, dt, time);
    } else {
      airBraking ??= input.direction * m.air.vx < 0;
      consumed = moveAct1Air(m, input.direction, airBraking, dt, time);
      burst ||= m.boost.active && m.boost.remaining > 0;
      if (m.mode === 'grounded') controls = null;
    }
    elapsed += consumed;
    projectAct1Motion(m, time + consumed);
    for (const h of runtimeState.level.hazards) {
      if (h.type === 'spikes' && spikeContact(h, oldX, oldY)) hurt(h.x + h.w / 2);
      if (
        h.type === 'breakable' &&
        !h.broken &&
        m.boost.active &&
        bodyBoxDistance(act1Body(m, m.posture, time + consumed), act1Box(h)).distance <= 0
      ) {
        h.broken = true;
        runtimeState.score += 350;
        runtimeState.stats.barriers = (runtimeState.stats.barriers || 0) + 1;
        gameSound('hazard');
      }
    }
    if (deaths !== runtimeState.stats.deaths || runtimeState.mode !== 'playing') return false;
    resolveMotionInteractions(oldX, oldY, oldSurface);
    if (deaths !== runtimeState.stats.deaths || p.act1Motion !== m) return false;
    adoptAct1Interaction(m);
    if (m.mode === 'airborne') controls = null;
    if (p.y + 20 > stageDeathLimit()) {
      die();
      return false;
    }
  }
  if (burst && m.boost.remaining > 0) m.boost.remaining--;
  if (m.mode === 'grounded') {
    finishGroundTick(
      m,
      controls || { rolling: m.posture === 'rolling' },
      (_s, x) => act1Surface(m.surface, x),
      act1Clear(m, 'standing'),
      () => Infinity
    );
    // PLAYTEST's diagnostic boundary reset is not a gameplay speed cap.
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
    throw Error('Non-finite Act 1 motion');
  const clamped = Math.max(24, Math.min(runtimeState.END + 250, m.x));
  if (clamped !== m.x) {
    m.x = clamped;
    if (m.mode === 'grounded') m.speed = 0;
    else m.air.vx = 0;
  }
  projectAct1Motion(m);
  updateBrakingPose(direction, startSpeed);
  runtimeState.stats.maxSpeed = Math.max(
    runtimeState.stats.maxSpeed,
    Math.abs(m.speed ?? m.air.vx)
  );
  runtimeState.anim += Math.abs(m.speed ?? m.air.vx) * 0.08;
  return true;
}

export function initializeRuntimeModule() {}
export function getRuntimeBindings() {
  return {};
}
