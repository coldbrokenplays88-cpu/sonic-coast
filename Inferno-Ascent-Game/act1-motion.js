// Generated from src/act1-motion.js; run npm run build:compat after source edits.
'use strict';
function usesAct1Motion() {
  return selectedAct === 1 && !!p.act1Motion;
}

function usesStageMovement() {
  return !!p.act1Motion && p.act1Motion.act === selectedAct;
}

function configureAct2Launches(level) {
  if (level.act !== 2) return level;
  const custom = new Set(['blimp-entry-spring', 'blimp-return-spring', 'mid-low-spring']);
  const retained = [];
  for (const d of level.springs) {
    if (custom.has(d.id)) level.pads.push({ ...d, cityVent: true, replacesSpring: true });
    else {
      d.authoredPower = d.power;
      if (d.launchX !== undefined) d.authoredLaunchX = d.launchX;
      d.power = experimentalDeviceTuning.springSpeed;
      delete d.launchX;
      retained.push(d);
    }
  }
  level.springs = retained;
  // Match each authored vent's old apex under the approved .35 gravity.
  // No speed-dependent aiming or changes to carried momentum are introduced.
  const scale = Math.sqrt(groundTuning.gravity / 0.58);
  for (const d of level.pads)
    if (d.cityVent) {
      d.authoredPower = d.power;
      // A replacement grate emits at deck height, whereas the old spring cap
      // stood above it. Include that fixed height in the authored apex budget.
      const oldAngle =
        (Math.round(Math.atan2(d.launchX || 0, d.power) / (Math.PI / 8)) * Math.PI) / 8;
      const capRise = d.replacesSpring ? 40 * Math.cos(oldAngle) : 0;
      d.power = Math.sqrt(d.power ** 2 * scale ** 2 + 2 * groundTuning.gravity * capRise);
      if (d.launchX !== undefined) {
        d.authoredLaunchX = d.launchX;
      }
      if (d.id === 'mid-low-spring') {
        // Land before the existing pool dash panel; its former nine-unit arc
        // now flies longer under .35 gravity and otherwise passes that panel.
        d.launchX = 7.5;
        d.authoredAirSpeedLimit = d.airSpeedLimit;
        d.airSpeedLimit = 7.5;
      }
    }
  return level;
}

function act1Contact(m, time = runFrames) {
  return m.loop
    ? { ...samplePath(m.loopPath, m.pathS), vx: 0, vy: 0 }
    : act1Surface(m.surface, m.x, time);
}

function act1Surface(s, x, time = runFrames) {
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

function act1Body(m = p.act1Motion, posture = m.posture, time = runFrames) {
  const height = posture === 'rolling' ? groundTuning.rollDiameter : groundTuning.standHeight;
  const surface = m.mode === 'grounded' ? act1Contact(m, time) : null;
  const rail = m.surface?.grindable && !m.loop;
  return {
    x: surface && !rail ? m.x + (surface.nx * height) / 2 : m.x,
    y: surface ? surface.y + (rail ? -height / 2 : (surface.ny * height) / 2) : m.y,
    hw: posture === 'rolling' ? height / 2 : groundTuning.standWidth / 2,
    hh: height / 2,
    circle: posture === 'rolling',
    angle: rail ? 0 : surface?.angle || 0,
  };
}

function act1Solids() {
  return level.hazards.filter((h) => !h.broken && h.type !== 'spikes');
}

function act1Box(h) {
  return { x1: h.x, x2: h.x + h.w, y1: h.y, y2: h.y + h.h };
}

function act1Clear(m, posture, time = runFrames) {
  const body = act1Body(m, posture, time);
  return (
    act1Solids().every((h) => bodyBoxDistance(body, act1Box(h)).distance >= -motionTuning.skin) &&
    (level.springs || []).every(
      (d) =>
        experimentalSpringDistance(body, act1SpringFace(d, time)).distance >= -motionTuning.skin
    )
  );
}

function act1SpringFace(d, time) {
  const tick = Math.floor(time),
    fraction = time - tick;
  const start = springFace(d, tick),
    end = springFace(d, tick + 1);
  const f = {
    ...start,
    x: start.x + (end.x - start.x) * fraction,
    y: start.y + (end.y - start.y) * fraction,
  };
  const base = airDevicePose(d, time);
  const carrier = d.surfaceId && level.surfaces.find((s) => s.id === d.surfaceId);
  const v = carrier ? act1Surface(carrier, base.x, time) : { vx: 0, vy: 0 };
  return { ...f, half: 24, depth: Math.hypot(f.x - base.x, f.y - base.y), vx: v.vx, vy: v.vy };
}

function act1SpringEnabled(d) {
  return (
    !p.wrongRouteDrop &&
    (d.id !== 'blimp-entry-spring' || qualifyingBlimpEntry()) &&
    (d.id !== 'blimp-return-spring' || level.blimpRoute?.entered)
  );
}

function act1SpringImpact(body, vx, vy, ax, ay, duration, time) {
  let first = null;
  for (const d of level.springs || []) {
    const face = act1SpringFace(d, time);
    const reach = body.hw + body.hh + face.half + face.depth + motionTuning.skin;
    if (
      Math.abs(body.x - face.x) >
        reach + Math.abs(vx - face.vx) * duration + (Math.abs(ax) * duration ** 2) / 2 ||
      Math.abs(body.y - face.y) >
        reach + Math.abs(vy - face.vy) * duration + (Math.abs(ay) * duration ** 2) / 2
    )
      continue;
    const hit = experimentalDeviceImpact(
      body,
      vx - face.vx,
      vy - face.vy,
      ax,
      ay,
      duration,
      face,
      motionTuning.skin
    );
    if (!hit || (first && hit.time >= first.time)) continue;
    const at = {
      ...body,
      x: body.x + (vx - face.vx) * hit.time + (ax * hit.time ** 2) / 2,
      y: body.y + (vy - face.vy) * hit.time + (ay * hit.time ** 2) / 2,
    };
    const c = Math.cos(body.angle),
      s = Math.sin(body.angle);
    const extent = body.circle
      ? body.hh
      : body.hw * Math.abs(c * face.nx + s * face.ny) +
        body.hh * Math.abs(-s * face.nx + c * face.ny);
    const gap = (at.x - face.x) * face.nx + (at.y - face.y) * face.ny - extent;
    const activeFace =
      hit.q.nx * face.nx + hit.q.ny * face.ny > 0.999 ||
      (Math.abs(gap) < motionTuning.skin * 2 &&
        (vx - face.vx) * face.nx + (vy - face.vy) * face.ny <= 1e-8);
    const normalVelocity =
      (vx - face.vx + ax * hit.time) * face.nx + (vy - face.vy + ay * hit.time) * face.ny;
    first = { ...hit, d, face, fire: activeFace && normalVelocity <= 1e-8 && act1SpringEnabled(d) };
  }
  return first;
}

function acceptAct1Launch(device, time = runFrames) {
  if (!usesStageMovement()) return;
  const m = p.act1Motion;
  if (m.loop) leaveAuthoredLoop(m);
  const carrier =
    device.surfaceId && level.surfaces.find((s) => s.id === device.surfaceId);
  const v = carrier ? act1Surface(carrier, p.x, time) : { vx: 0, vy: 0 };
  let vx = p.vx + (device.launchX !== undefined ? v.vx : 0),
    vy = p.vy + v.vy;
  if (!device.cityVent && level.springs?.includes(device)) {
    const face = act1SpringFace(device, time);
    const incoming = m.mode === 'grounded' ? m.worldVelocity : m.air;
    const tangent = (incoming.vx - v.vx) * face.tx + (incoming.vy - v.vy) * face.ty;
    vx = tangent * face.tx + experimentalDeviceTuning.springSpeed * face.nx + v.vx;
    vy = tangent * face.ty + experimentalDeviceTuning.springSpeed * face.ny + v.vy;
  }
  m.posture = 'rolling';
  Object.assign(m, {
    mode: 'airborne',
    surface: null,
    railId: null,
    speed: null,
    x: p.x,
    y: p.y + 20 - 19,
    dash: null,
    coyote: 0,
    jumpBuffer: 0,
    air: { vx, vy, cutEligible: false, jumpLift: 0 },
    latestTransition: 'authored launch ' + device.id,
  });
  m.boost.remaining = 0;
  m.boost.active = false;
  m.launches = (m.launches || 0) + 1;
  projectAct1Motion(m, time);
}

function authoredLoopPath(l) {
  const length = Math.PI * 2 * l.r;
  return {
    id: l.id,
    length,
    thickness: 12,
    pieces: [
      {
        id: l.id,
        kind: 'arc',
        cx: l.x,
        cy: l.y - l.r,
        r: l.r,
        a: 0,
        b: Math.PI * 2,
        start: 0,
        end: length,
        length,
      },
    ],
  };
}

function enterAuthoredLoop(m, l, time, pathS = null, incoming = null) {
  const path = authoredLoopPath(l);
  const contact = pathS !== null ? samplePath(path, pathS) : null;
  const direction =
    Math.sign(
      incoming && contact ? incoming.vx * contact.tx + incoming.vy * contact.ty : m.speed
    ) || 1;
  const s = samplePath(path, pathS ?? (direction > 0 ? 0 : path.length));
  const candidate = {
    ...m,
    mode: 'grounded',
    loop: l,
    loopPath: path,
    pathS: s.pathS,
    x: s.x,
    y: s.y,
    railId: null,
    speed: incoming ? incoming.vx * s.tx + incoming.vy * s.ty : m.speed,
    air: null,
    loopDirection: direction,
  };
  if (!motionSupported(candidate, s) || !act1Clear(candidate, candidate.posture, time))
    return false;
  Object.assign(m, candidate);
  l.used = true;
  m.latestTransition = 'loop contact ' + l.id;
  if (incoming) resetExperimentalAirBoost(m);
  return true;
}

function leaveAuthoredLoop(m) {
  if (!m.loop) return;
  m.loop.used = false;
  m.loop.entryLocked = true;
  m.loop = null;
  m.pathS = null;
  m.loopPath = null;
}

function moveAuthoredLoop(m, controls, duration, time) {
  const l = m.loop,
    path = m.loopPath;
  const boosted = experimentalGroundBoost(m, l) && !p.hurt;
  const local = boosted
    ? { ...controls, boost: { ...experimentalBoostTuning, facing: m.facing } }
    : controls;
  m.boost.active = boosted;
  if (boosted) duration = Math.min(duration, m.boost.meter / experimentalBoostTuning.groundCost);
  const sampler = (_scenario, s) => samplePath(path, s);
  const advance = (c, dt) => {
    if (dt > 0) advanceGroundSubstep(c, local, dt, sampler, true);
    const s = sampler(null, c.pathS);
    c.x = s.x;
    c.y = s.y;
  };
  if (!motionSupported(m, act1Contact(m, time))) {
    releaseAct1(m, 'loop contact lost', false, time);
    return 0;
  }
  let dt = duration,
    c = { ...m };
  advance(c, dt);
  const ended = c.pathS < 0 || c.pathS > path.length;
  const unsupported = !motionSupported(c, sampler(null, c.pathS));
  if (ended || unsupported) {
    let lo = 0,
      hi = dt;
    for (let i = 0; i < 32; i++) {
      const mid = (lo + hi) / 2,
        trial = { ...m };
      advance(trial, mid);
      if (
        trial.pathS < 0 ||
        trial.pathS > path.length ||
        !motionSupported(trial, sampler(null, trial.pathS))
      )
        hi = mid;
      else lo = mid;
    }
    dt = (lo + hi) / 2;
    c = { ...m };
    advance(c, dt);
  }
  Object.assign(m, c);
  if (boosted) {
    m.boost.meter = Math.max(0, m.boost.meter - experimentalBoostTuning.groundCost * dt);
    if (m.boost.meter < 1e-9) {
      m.boost.meter = 0;
      m.boost.locked = true;
    }
  }
  if (ended && (m.pathS < 1e-5 || m.pathS > path.length - 1e-5)) {
    const complete = m.loopDirection > 0 ? m.pathS > path.length - 1e-5 : m.pathS < 1e-5;
    if (complete && !l.solved) {
      l.solved = true;
      stats.loops++;
      score += 500;
    }
    const incoming = { vx: m.speed, vy: 0 };
    const floor = level.surfaces.find(
      (s) =>
        active(s) &&
        l.x >= s.x1 &&
        l.x <= s.x2 &&
        Math.abs(act1Surface(s, l.x, time + dt).y - l.y) < 1e-4
    );
    if (floor) {
      leaveAuthoredLoop(m);
      attachAct1(m, floor, l.x, incoming, time + dt, true);
    } else releaseAct1(m, 'loop exit', false, time + dt);
  } else if (unsupported) releaseAct1(m, 'loop contact lost', false, time + dt);
  return dt;
}

function resetAct1Motion() {
  if (p.act1Motion?.loop) leaveAuthoredLoop(p.act1Motion);
  if (![1, 2].includes(selectedAct)) {
    p.act1Motion = null;
    return;
  }
  const m = {
    ...createGroundPlayer(),
    act: selectedAct,
    scenario: 'act' + selectedAct,
    x: p.x,
    y: p.y + 20,
    mode: p.ground && p.surface ? 'grounded' : 'airborne',
    surface: p.surface,
    boost: createExperimentalBoost(boost),
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
    loop: null,
    pathS: null,
    railId: p.surface?.grindable ? p.surface.id : null,
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

function inputAct1Motion(k, pressed) {
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
  p.jumpHeld = JUMP_KEYS.some((code) => keys.has(code));
}

function projectAct1Motion(m, time = runFrames) {
  const grounded = m.mode === 'grounded',
    body = act1Body(m, m.posture, time);
  const s = grounded ? act1Contact(m, time) : null;
  // p.y keeps its established feet-minus-20 convention for gameplay queries.
  // p.vy=0 on contact preserves legacy stomp semantics; world velocity is below.
  Object.assign(p, {
    x: grounded ? m.x : body.x,
    y: grounded ? s.y - 20 : body.y + body.hh - 20,
    vx: grounded ? m.speed * s.tx + s.vx : m.air.vx,
    vy: grounded ? 0 : m.air.vy,
    ground: grounded,
    surface: grounded && !m.loop ? m.surface : null,
    roll: m.posture === 'rolling',
    rolling: m.posture === 'rolling' && grounded,
    face: m.facing,
    contactSpeed: null,
    // Render/event projection only; m.speed remains the sole contact authority.
    loop: m.loop
      ? { id: m.loop.id, theta: m.pathS / m.loop.r, speed: m.speed, derived: true }
      : null,
    boosting: m.boost.active,
    airBoostUsed: m.boost.airUsed,
    airBoostFrames: m.boost.remaining,
    airBoostActive: !grounded && m.boost.active,
    boostLocked: m.boost.locked,
    jumpHeld: JUMP_KEYS.some((code) => keys.has(code)),
  });
  boost = m.boost.meter;
  charge = m.dash ? (m.dash.charge * 20) / 30 : 0;
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

function adoptAct1Interaction(m) {
  const q = m.projection;
  if (!q) return;
  const changed = ['x', 'y', 'vx', 'vy', 'ground', 'surface', 'rolling', 'roll'].some(
    (k) => p[k] !== q[k]
  );
  if (boost > m.boost.meter && !p.boostLocked) m.boost.locked = false;
  m.boost.meter = boost;
  if (!changed) return;
  if (m.loop) leaveAuthoredLoop(m);
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
    m.railId = m.surface.grindable ? m.surface.id : null;
  } else {
    const height = m.posture === 'rolling' ? 38 : 48;
    Object.assign(m, {
      mode: 'airborne',
      surface: null,
      x: p.x,
      y: p.y + 20 - height / 2,
      speed: null,
      air: { vx: p.vx, vy: p.vy, cutEligible: false, jumpLift: 0 },
      railId: null,
    });
    m.boost.remaining = 0;
    m.boost.active = false;
    m.dash = null;
  }
  m.latestTransition = p.hurt ? 'damage handoff' : 'interaction handoff';
}

function syncActWater(m) {
  const wasWet = !!p.underwater,
    beforeVy = p.vy;
  const air = m.air && { cutEligible: m.air.cutEligible, jumpLift: m.air.jumpLift };
  const remaining = m.boost.remaining,
    boosting = m.boost.active;
  updateWaterState();
  if (wasWet === !!p.underwater) return;
  const liftRatio = p.underwater ? 0.25 : beforeVy < 0 ? p.vy / beforeVy : 1;
  adoptAct1Interaction(m);
  // A medium crossing scales velocity, not input eligibility or purchased time.
  m.boost.remaining = remaining;
  m.boost.active = boosting;
  if (air && m.air) {
    m.air.cutEligible = air.cutEligible;
    m.air.jumpLift = air.jumpLift * liftRatio;
  }
  projectAct1Motion(m);
}

function releaseAct1(m, reason, jump, time) {
  const s = act1Contact(m, time),
    oldPosture = m.posture;
  if (m.act === 2 && !m.loop) {
    projectAct1Motion(m, time);
    if (jump) recordBlimpJump(m.surface, m.speed);
    else recordBlimpDeparture(m.surface);
  }
  if (jump && act1Clear(m, 'rolling', time)) m.posture = 'rolling';
  const body = act1Body(m, m.posture, time),
    impulse = jump ? motionTuning.jumpImpulse * (p.underwater ? 7 / 13 : 1) : 0;
  const vx = m.speed * s.tx + s.vx + impulse * s.nx;
  const vy = m.speed * s.ty + s.vy + impulse * s.ny;
  m.lastTakeoff = { reason, vx, vy, speed: m.speed, carrier: { vx: s.vx, vy: s.vy } };
  const departingLoop = m.loop;
  if (departingLoop) leaveAuthoredLoop(m);
  Object.assign(m, {
    x: body.x,
    y: body.y,
    speed: null,
    surface: null,
    railId: null,
    mode: 'airborne',
    dash: null,
    air: {
      vx,
      vy,
      cutEligible: jump,
      jumpLift: Math.max(0, -impulse * s.ny),
      restorePosture: oldPosture,
      separatedLoop: departingLoop?.id,
    },
    latestTransition: reason,
    coyote: jump ? 0 : tuning.coyote,
  });
  if (jump) {
    p.jumpAttack = true;
    p.poseJumpFrame = runFrames;
    stats.jumps++;
    gameSound('jump');
    m.jumpBuffer = 0;
  }
}

function attachAct1(m, surface, x, incoming, time, seam = false) {
  const s = act1Surface(surface, x, time),
    previous = m.surface;
  const speed = seam ? m.speed : (incoming.vx - s.vx) * s.tx + (incoming.vy - s.vy) * s.ty;
  // A swept body can still overlap a block after its contact anchor has left
  // the finite top. Reattaching at an outward-moving endpoint would release
  // again at time zero, then repeatedly recapture that same top without time
  // advancing. Keep the solid collision response, but do not ground there.
  if (
    x < s.x1 - 1e-6 ||
    x > s.x2 + 1e-6 ||
    (speed > 0 && x >= s.x2 - 1e-6) ||
    (speed < 0 && x <= s.x1 + 1e-6)
  )
    return false;
  const candidate = {
    ...m,
    mode: 'grounded',
    surface,
    x,
    y: s.y,
    speed,
    air: null,
    loop: null,
    pathS: null,
    railId: surface.grindable ? surface.id : null,
  };
  if (!seam)
    candidate.posture = landingGroundPosture((posture) => act1Clear(candidate, posture, time));
  if (!candidate.posture) return false;
  if (!act1Clear(candidate, candidate.posture, time)) return false;
  Object.assign(m, candidate);
  m.restTicks = 0;
  m.latestTransition = seam ? 'surface join' : 'landing';
  if (!seam) resetExperimentalAirBoost(m);
  projectAct1Motion(m, time);
  beforeStageLanding(surface);
  // Stage hooks may deliberately cancel a wrong-route landing's velocity.
  if (p.vx !== m.projection.vx) m.speed = (p.vx - s.vx) / s.tx;
  projectAct1Motion(m, time);
  p.landFrame = runFrames;
  p.landKind = surface.kind;
  if (!seam) {
    p.poseLandingFrame = runFrames;
    gameSound('land', { speed: Math.abs(speed), volume: 0.7 });
  }
  p.jumpAttack = false;
  p.scriptedLaunch = false;
  p.airSpeedLimit = null;
  if (surface.grindable && !previous?.grindable) {
    p.grindEntryFrame = runFrames;
    p.grindFromFast = m.boost.active || Math.abs(m.speed) > 17;
    p.grindFast = Math.abs(m.speed) > 18 || m.boost.active;
    p.brakeActive = false;
    p.stopFrame = -100;
    m.posture = 'standing';
    m.dash = null;
    projectAct1Motion(m, time);
  } else if (previous?.grindable && !surface.grindable) p.grindExitFrame = runFrames;
  afterStageLanding(surface);
  recordSurfaceLanding(surface, previous !== surface || !seam);
  adoptAct1Interaction(m);
  if (reboundBubbleShield()) adoptAct1Interaction(m);
  else if (m.mode === 'grounded' && m.jumpBuffer > 0 && !m.dash)
    releaseAct1(m, 'buffered jump', true, time);
  return true;
}

function act1SolidImpact(m, body, vx, vy, ax, ay, duration, time = runFrames) {
  let hit = act1SpringImpact(body, vx, vy, ax, ay, duration, time);
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

function moveAct1Air(m, direction, braking, duration, time) {
  let { ax, ay, bursting } = motionAirForces(m, direction, braking, duration);
  if (p.underwater) {
    ax *= 0.5;
    ay *= 2 / 7;
  }
  if (p.airSpeedLimit && !bursting) {
    const next = Math.max(-p.airSpeedLimit, Math.min(p.airSpeedLimit, m.air.vx + ax * duration));
    ax = (next - m.air.vx) / duration;
  }
  if (bursting) m.boost.active = true;
  const body = act1Body(m),
    a = m.air;
  a.blocked = (a.blocked || []).filter(
    (n) =>
      (n.d
        ? experimentalSpringDistance(body, act1SpringFace(n.d, time))
        : bodyBoxDistance(body, act1Box(n.h))
      ).distance <=
      motionTuning.skin * 3
  );
  for (const n of a.blocked) {
    const into = ax * n.nx + ay * n.ny;
    if (into < 0) {
      ax -= into * n.nx;
      ay -= into * n.ny;
    }
  }
  let hit = act1SolidImpact(m, body, a.vx, a.vy, ax, ay, duration, time);
  for (const l of level.loops || []) {
    if (
      Math.abs(body.x - l.x) >
        l.r + body.hh + Math.abs(a.vx) * duration + (Math.abs(ax) * duration ** 2) / 2 ||
      Math.abs(body.y - (l.y - l.r)) >
        l.r + body.hh + Math.abs(a.vy) * duration + (Math.abs(ay) * duration ** 2) / 2
    )
      continue;
    if (a.separatedLoop === l.id) {
      const centerDistance = Math.hypot(m.x - l.x, m.y - (l.y - l.r));
      if (Math.abs(centerDistance - (l.r - body.hh)) < 2) continue;
      a.separatedLoop = null;
    }
    const path = authoredLoopPath(l);
    const result = pathArcImpact(
      body,
      a.vx,
      a.vy,
      ax,
      ay,
      duration,
      path.pieces[0],
      path,
      motionTuning.skin,
      (q) => q.canLand
    );
    if (result && (!hit || result.time < hit.time)) {
      const s = result.q.surface,
        speed = (a.vx + ax * result.time) * s.tx + (a.vy + ay * result.time) * s.ty;
      if (motionSupported({ ...m, speed }, s)) hit = { ...result, l };
    }
  }
  for (const s of level.surfaces) {
    const travel =
      Math.abs(a.vx) * duration + (Math.abs(ax) * duration ** 2) / 2 + body.hw + body.hh;
    if (!surfaceOverlaps(s, body.x - travel, body.x + travel)) continue;
    if (!active(s)) continue;
    if (
      s.entrySpeed &&
      !s.solidAtAnySpeed &&
      (Math.abs(a.vx) < s.entrySpeed || (s.entryDirection && Math.sign(a.vx) !== s.entryDirection))
    )
      continue;
    const q = act1Surface(s, body.x, time);
    const rail = s.grindable;
    const extent = rail
      ? -q.ny * body.hh
      : body.circle
        ? body.hh
        : Math.abs(q.nx) * body.hw + Math.abs(q.ny) * body.hh;
    const distance =
      (body.x - q.x1) * q.nx + (body.y - (q.y + ((q.x1 - q.x) * q.ty) / q.tx)) * q.ny - extent;
    const vn = (a.vx - q.vx) * q.nx + (a.vy - q.vy) * q.ny;
    const an = ax * q.nx + ay * q.ny;
    if (distance < -motionTuning.skin * 2) continue;
    for (const t of pathPolynomialRoots([distance, vn, an / 2], 0, duration)) {
      if (vn + an * t >= -1e-8 || (hit && t >= hit.time)) continue;
      const cx = m.x + a.vx * t + (ax * t * t) / 2 - q.vx * t;
      const contactX = rail ? cx : cx - q.nx * extent;
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
  a.jumpLift = Math.max(
    0,
    (a.jumpLift || 0) - groundTuning.gravity * (p.underwater ? 2 / 7 : 1) * dt
  );
  if (!hit) return duration;
  if (hit.l && enterAuthoredLoop(m, hit.l, time + dt, hit.q.surface.pathS, { vx: a.vx, vy: a.vy }))
    return dt;
  if (hit.fire) {
    projectAct1Motion(m, time + dt);
    if (hit.d.id === 'blimp-entry-spring') level.blimpRoute.entered = true;
    launchAirDevice(hit.d, time + dt);
    return dt;
  }
  if (hit.s && attachAct1(m, hit.s, hit.x, { vx: a.vx, vy: a.vy }, time + dt)) return dt;
  const n = hit.q,
    into = (a.vx - (hit.face?.vx || 0)) * n.nx + (a.vy - (hit.face?.vy || 0)) * n.ny;
  if (into < 0) {
    a.vx -= into * n.nx;
    a.vy -= into * n.ny;
  }
  const correction = Math.max(motionTuning.skin * 2, motionTuning.skin - (n.distance || 0));
  m.x += n.nx * correction;
  m.y += n.ny * correction;
  if (n.ny > 0) {
    a.jumpLift = 0;
    a.cutEligible = false;
  }
  if (hit.h) a.blocked.push({ h: hit.h, nx: n.nx, ny: n.ny });
  if (hit.d) a.blocked.push({ d: hit.d, nx: n.nx, ny: n.ny });
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

function moveAct1Ground(m, controls, duration, time) {
  if (m.loop) return moveAuthoredLoop(m, controls, duration, time);
  const surface = m.surface;
  if (!active(surface)) {
    releaseAct1(m, 'crumbling deck', false, time);
    return 0;
  }
  const q = act1Surface(surface, m.x, time),
    before = act1Body(m, m.posture, time);
  const sampler = (_scenario, x) => act1Surface(surface, x, time);
  let local = { ...controls };
  if (surface.grindable) {
    local.physics = experimentalRailTuning;
    local.rolling = false;
    local.standingGrip = false;
    m.posture = 'standing';
  }
  if (p.underwater) {
    const t = local.physics || groundTuning;
    local.physics = {
      ...t,
      gravity: (t.gravity * 2) / 7,
      runRange: t.runRange / 2,
      acceleration: t.acceleration / 2,
      brake: t.brake / 2,
      coastResistance: t.coastResistance / 2,
      rollResistance: t.rollResistance / 2,
      rollBrake: t.rollBrake / 2,
    };
  }
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
  let loopEntry = null;
  for (const l of level.loops || []) {
    if (
      l.entryLocked ||
      l.used ||
      surface.grindable ||
      (m.x - l.x) * (candidate.x - l.x) > 0 ||
      Math.abs(candidate.x - m.x) < 1e-9 ||
      Math.abs(act1Surface(surface, l.x, time).y - l.y) > 1e-4
    )
      continue;
    let lo = 0,
      hi = dt,
      direction = Math.sign(candidate.x - m.x);
    for (let i = 0; i < 30; i++) {
      const mid = (lo + hi) / 2,
        c = { ...m };
      advance(c, mid);
      if ((c.x - l.x) * direction >= 0) hi = mid;
      else lo = mid;
    }
    dt = (lo + hi) / 2;
    candidate = { ...m };
    advance(candidate, dt);
    loopEntry = l;
  }
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
    loopEntry = null;
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
  const afterBody = act1Body(candidate, candidate.posture, time + dt);
  const device =
    dt > 0
      ? act1SpringImpact(
          before,
          (afterBody.x - before.x) / dt,
          (afterBody.y - before.y) / dt,
          0,
          0,
          dt,
          time
        )
      : null;
  if (device && (!block || device.time < block.time)) block = { ...device, device: true };
  if (block) {
    dt = block.time;
    candidate = { ...m };
    advance(candidate, dt);
    edge = null;
    loopEntry = null;
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
    if (block.fire) {
      projectAct1Motion(m, time + dt);
      if (block.d.id === 'blimp-entry-spring') level.blimpRoute.entered = true;
      launchAirDevice(block.d, time + dt);
      return dt;
    }
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
  if (loopEntry) {
    enterAuthoredLoop(m, loopEntry, time + dt);
    return dt;
  }
  if (edge) {
    const at = act1Surface(surface, m.x, time + dt);
    let join = null;
    for (const s of level.surfaces) {
      if (s === surface || !active(s)) continue;
      const z = act1Surface(s, m.x, time + dt);
      // An overlapping deck ending here is not a continuation in this
      // direction. Keep searching for the surface extending past the seam.
      if ((m.speed > 0 && z.x2 <= m.x + 1e-4) || (m.speed < 0 && z.x1 >= m.x - 1e-4))
        continue;
      if (m.x >= z.x1 - 1e-4 && m.x <= z.x2 + 1e-4 && Math.abs(z.y - at.y) < 1e-4) {
        join = s;
        break;
      }
    }
    const z = join && act1Surface(join, m.x, time + dt);
    // Upright crest grip is approved; rolled bodies leave a sharp convex lip.
    const convex = !surface.grindable && z && Math.sign(m.speed) * (z.angle - q.angle) > 1e-7;
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

function updateAct1Movement() {
  const m = p.act1Motion;
  p.lastX = p.x;
  p.lastY = p.y;
  if (updateStageMotion()) {
    adoptAct1Interaction(m);
    return true;
  }
  adoptAct1Interaction(m);
  // Water changes velocity only at an actual boundary, not on every wet tick.
  if (m.act === 2) syncActWater(m);
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
      !p.wrongRouteDrop &&
      !p.bubbleSlam &&
      ['ShiftLeft', 'ShiftRight', 'KeyX', 'MouseBoost'].some((code) => keys.has(code)),
    boostPressed: m.pendingBoost,
    boostPressAirborne: m.pressAirborne,
  };
  const startedGrounded = m.mode === 'grounded',
    startSpeed = startedGrounded ? Math.abs(m.speed) : Math.abs(m.air.vx);
  const surface = startedGrounded ? act1Contact(m, runFrames - 1) : null;
  const previousPosture = m.posture;
  if (startedGrounded && m.rollBuffer > 0) m.downHeld = false;
  const dash = updateExperimentalDash(m, input, surface, () => act1Clear(m, 'rolling'));
  if (dash) m.jumpBuffer = 0;
  let controls = startedGrounded
    ? beginGroundTick(m, input, act1Clear(m, 'rolling'), act1Clear(m, 'standing'))
    : null;
  if (controls?.unrolled) m.rollBuffer = 0;
  if (m.dash) controls = { direction: 0, rolling: false, braking: true };
  if (previousPosture !== 'rolling' && m.posture === 'rolling') stats.rolls++;
  if (startedGrounded && m.posture === 'rolling') m.rollBuffer = 0;
  if (startedGrounded) m.coyote = tuning.coyote;
  if (startedGrounded && m.jumpBuffer > 0 && !dash)
    releaseAct1(m, 'jump', true, runFrames - 1);
  else if (!startedGrounded && m.jumpBuffer > 0 && m.coyote > 0 && m.pendingJump) {
    const impulse = motionTuning.jumpImpulse * (p.underwater ? 7 / 13 : 1);
    m.air.vy -= impulse;
    m.air.jumpLift = impulse;
    m.air.cutEligible = true;
    m.posture = 'rolling';
    m.coyote = 0;
    m.jumpBuffer = 0;
    p.jumpAttack = true;
    stats.jumps++;
    gameSound('jump');
  }
  const bursts = m.boost.bursts;
  beginExperimentalBoost(m, input, startedGrounded);
  if (m.boost.bursts !== bursts) {
    p.jumpAttack = true;
    p.scriptedLaunch = false;
    p.airSpeedLimit = null;
    p.airLaunchUntil = 0;
    if (m.act === 2) invalidateBlimpEntry();
  }
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
  const deaths = stats.deaths;
  while (elapsed < 1 - 1e-9) {
    if (++iterations > 128) throw Error('Authored movement failed to converge');
    const time = runFrames - 1 + elapsed;
    const speed = m.mode === 'grounded' ? Math.abs(m.speed) : Math.hypot(m.air.vx, m.air.vy);
    const dt = Math.min(
      1 - elapsed,
      0.25,
      8 / Math.max(1, speed),
      m.loop ? (0.04 * m.loop.r) / Math.max(1, speed) : Infinity
    );
    const oldX = p.x,
      oldY = p.y,
      oldVx = p.vx,
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
    for (const h of level.hazards) {
      if (h.type === 'spikes' && spikeContact(h, oldX, oldY)) hurt(h.x + h.w / 2);
      if (
        h.type === 'breakable' &&
        !h.broken &&
        (m.boost.active ||
          (!h.boostOnly && Math.max(Math.abs(oldVx), Math.abs(p.vx)) >= h.threshold)) &&
        bodyBoxDistance(act1Body(m, m.posture, time + consumed), act1Box(h)).distance <= 0
      ) {
        h.broken = true;
        score += 350;
        stats.barriers = (stats.barriers || 0) + 1;
        gameSound('hazard');
      }
    }
    if (deaths !== stats.deaths || mode !== 'playing') return false;
    resolveMotionInteractions(oldX, oldY, oldSurface);
    if (deaths !== stats.deaths || p.act1Motion !== m) return false;
    adoptAct1Interaction(m);
    if (m.act === 2) syncActWater(m);
    if (m.mode === 'airborne') controls = null;
    if (
      level.deathZones?.some((z) => p.x >= z.x1 && p.x <= z.x2 && p.y + 20 > z.y) ||
      p.y + 20 > stageDeathLimit()
    ) {
      die();
      return false;
    }
  }
  if (burst && m.boost.remaining > 0) m.boost.remaining--;
  if (m.mode === 'grounded') {
    finishGroundTick(
      m,
      controls || { rolling: m.posture === 'rolling' },
      (_s, x) => (m.loop ? samplePath(m.loopPath, x) : act1Surface(m.surface, x)),
      act1Clear(m, 'standing'),
      () => Infinity,
      !!m.loop
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
    throw Error('Non-finite authored motion');
  const clamped = Math.max(24, Math.min(END + 250, m.x));
  if (clamped !== m.x) {
    m.x = clamped;
    if (m.mode === 'grounded') m.speed = 0;
    else m.air.vx = 0;
  }
  projectAct1Motion(m);
  updateBrakingPose(direction, startSpeed);
  stats.maxSpeed = Math.max(
    stats.maxSpeed,
    Math.abs(m.speed ?? m.air.vx)
  );
  anim += Math.abs(m.speed ?? m.air.vx) * 0.08;
  return true;
}
