// Isolated kinematic character controller for upright static benchmark terrain.
import {
  advanceGroundSubstep,
  beginGroundTick,
  createGroundPlayer,
  finishGroundTick,
  groundContact,
  groundTuning,
  sampleGround,
} from './playtest-ground.js';
export let motionTuning, motionFixtures;

export function motionBounds(scenario) {
  const fixture = motionFixtures[scenario];
  if (!fixture) throw Error('Unknown PLAYTEST fixture');
  return fixture.bounds;
}

export function motionSpans(scenario) {
  const b = motionBounds(scenario);
  return scenario === 'gap'
    ? [
        [-b, 100],
        [300, b],
      ]
    : [[-b, b]];
}

export function sampleMotionExtension(scenario, x) {
  let s;
  if (scenario === 'flat' || scenario === 'valley') s = sampleGround(scenario, x);
  else {
    let y = 400,
      slope = 0,
      second = 0;
    if (scenario === 'crest' && Math.abs(x) < 360) {
      const u = x / 360,
        w = 1 - u * u;
      y -= 100 * w * w * w;
      slope = (600 * x * w * w) / (360 * 360);
      second = (600 / (360 * 360)) * w * (1 - 5 * u * u);
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
      curvature: second / norm ** 3,
    };
  }
  return { ...s, id: scenario + '-floor-' + (scenario === 'gap' && x >= 300 ? 1 : 0) };
}

export function sampleMotionGround(scenario, x) {
  if (!motionSpans(scenario).some(([a, b]) => x >= a && x <= b)) return null;
  return sampleMotionExtension(scenario, x);
}

export function createMotionPlayer(scenario = 'flat') {
  motionBounds(scenario);
  const x = motionFixtures[scenario].spawn;
  return {
    ...createGroundPlayer(),
    scenario,
    x,
    y: sampleMotionExtension(scenario, x).y,
    mode: 'grounded',
    air: null,
    latestTransition: 'reset',
    transitionCount: 0,
    lastTakeoff: null,
    lastLanding: null,
  };
}

export function motionReaction(player, surface) {
  const radius = player.posture === 'rolling' ? 19 : 24;
  // speed measures travel of the contact anchor. The normal-offset center
  // travels (1 + radius*k) times as fast on curvature k, so its normal
  // acceleration is speed²*k*(1 + radius*k), not speed²*k/(1 + radius*k).
  const normalAcceleration =
    player.speed * player.speed * surface.curvature * (1 + radius * surface.curvature);
  return -normalAcceleration - groundTuning.gravity * surface.ny;
}

export function motionSupported(player, surface) {
  // Explicit upright crest grip requested for this experiment. Rolling still
  // requires nonnegative physical support; no grip extends across open ledges.
  return player.posture === 'standing' || motionReaction(player, surface) >= -1e-6;
}

export function motionContact(player) {
  if (player.mode === 'grounded') {
    const c = groundContact(player, sampleMotionExtension);
    const reaction = motionReaction(player, c);
    return {
      ...c,
      grounded: true,
      normalReaction: reaction,
      uprightGrip: player.posture === 'standing' && reaction < -1e-6,
    };
  }
  const height = player.posture === 'rolling' ? 38 : 48,
    width = player.posture === 'rolling' ? 38 : 22;
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
    vy: player.air.vy,
  };
}

export function motionBody(player, posture = player.posture) {
  const height = posture === 'rolling' ? 38 : 48,
    width = posture === 'rolling' ? 38 : 22;
  const s = player.mode === 'grounded' ? sampleMotionExtension(player.scenario, player.x) : null;
  return {
    x: s ? s.x + (s.nx * height) / 2 : player.x,
    y: s ? s.y + (s.ny * height) / 2 : player.y,
    hw: width / 2,
    hh: height / 2,
    circle: posture === 'rolling',
    angle: s ? s.angle : 0,
  };
}

export function bodyBoxDistance(body, box) {
  if (body.circle) {
    const px = Math.max(box.x1, Math.min(box.x2, body.x)),
      py = Math.max(box.y1, Math.min(box.y2, body.y));
    const dx = body.x - px,
      dy = body.y - py,
      length = Math.hypot(dx, dy);
    if (length > 1e-12)
      return {
        distance: length - body.hw,
        nx: dx / length,
        ny: dy / length,
        curvature: 1 / body.hw,
      };
    const faces = [
      { distance: body.x - box.x1, nx: -1, ny: 0 },
      { distance: box.x2 - body.x, nx: 1, ny: 0 },
      { distance: body.y - box.y1, nx: 0, ny: -1 },
      { distance: box.y2 - body.y, nx: 0, ny: 1 },
    ].sort((a, b) => a.distance - b.distance);
    return { ...faces[0], distance: -faces[0].distance - body.hw, curvature: 1 / body.hw };
  }
  const dx = Math.abs(body.x - (box.x1 + box.x2) / 2) - (box.x2 - box.x1) / 2 - body.hw;
  const dy = Math.abs(body.y - (box.y1 + box.y2) / 2) - (box.y2 - box.y1) / 2 - body.hh;
  return dx > dy
    ? { distance: dx, nx: Math.sign(body.x - (box.x1 + box.x2) / 2), ny: 0, curvature: 0 }
    : { distance: dy, nx: 0, ny: Math.sign(body.y - (box.y1 + box.y2) / 2), curvature: 0 };
}

export function motionPostureClear(player, posture) {
  const body = motionBody(player, posture),
    c = Math.cos(body.angle),
    s = Math.sin(body.angle);
  for (const box of motionFixtures[player.scenario].boxes) {
    if (body.circle) {
      if (bodyBoxDistance(body, box).distance < -motionTuning.skin) return false;
      continue;
    }
    const dx = body.x - (box.x1 + box.x2) / 2,
      dy = body.y - (box.y1 + box.y2) / 2,
      bw = (box.x2 - box.x1) / 2,
      bh = (box.y2 - box.y1) / 2;
    const axes = [
      [1, 0],
      [0, 1],
      [c, s],
      [-s, c],
    ];
    if (
      axes.every(
        ([x, y]) =>
          Math.abs(dx * x + dy * y) <
          body.hw * Math.abs(c * x + s * y) +
            body.hh * Math.abs(-s * x + c * y) +
            bw * Math.abs(x) +
            bh * Math.abs(y) -
            motionTuning.skin
      )
    )
      return false;
  }
  return true;
}

export function floorBodyDistance(scenario, body, span, index) {
  const [left, right] = span;
  if (!body.circle) {
    const a = Math.max(left, body.x - body.hw),
      b = Math.min(right, body.x + body.hw);
    if (a > b) return null;
    const candidates = [a, b];
    if (a <= 0 && b >= 0) candidates.push(0);
    const q = candidates
      .map((x) => sampleMotionExtension(scenario, x))
      .sort((a, b) => a.y - b.y)[0];
    return {
      distance: q.y - body.y - body.hh,
      nx: q.nx,
      ny: q.ny,
      gradient: Math.hypot(1, q.ty / q.tx),
      curvature: 0.02,
      surface: q,
      id: scenario + '-floor-' + index,
      kind: 'floor',
      canLand: true,
    };
  }
  let x = Math.max(left, Math.min(right, body.x));
  const initial = sampleMotionExtension(scenario, x),
    vertical = initial.y - body.y;
  if (body.x >= left && body.x <= right && vertical > 45)
    return {
      distance: vertical / Math.hypot(1, 0.65) - body.hw,
      nx: initial.nx,
      ny: initial.ny,
      curvature: 0.02,
      far: true,
    };
  // Near contact, these gentle curves have a unique closest point: distance²
  // has positive second derivative over this radius-sized search interval.
  const lo = Math.max(left, body.x - body.hw - 2),
    hi = Math.min(right, body.x + body.hw + 2);
  if (lo <= hi)
    for (let i = 0; i < 10; i++) {
      const q = sampleMotionExtension(scenario, x),
        slope = q.ty / q.tx,
        second = q.curvature / q.tx ** 3;
      const next = Math.max(
        lo,
        Math.min(
          hi,
          x - (x - body.x + (q.y - body.y) * slope) / (1 + slope * slope + (q.y - body.y) * second)
        )
      );
      if (Math.abs(next - x) < 1e-9) {
        x = next;
        break;
      }
      x = next;
    }
  const q = sampleMotionExtension(scenario, x),
    dx = body.x - q.x,
    dy = body.y - q.y,
    len = Math.hypot(dx, dy);
  const interior = x > left + 1e-6 && x < right - 1e-6;
  if (!interior && body.y > q.y && (body.x < left || body.x > right)) return null; // vertical gap faces are solid boxes
  const outside = dx * q.nx + dy * q.ny >= 0 || !interior;
  return {
    distance: (outside ? len : -len) - body.hw,
    nx: outside && len > 1e-9 ? dx / len : q.nx,
    ny: outside && len > 1e-9 ? dy / len : q.ny,
    curvature: 0.02,
    convex: !interior,
    surface: q,
    id: scenario + '-floor-' + index,
    kind: 'floor',
    canLand: interior,
  };
}

export function motionTrajectory(body, vx, vy, ax, ay, t) {
  return { ...body, x: body.x + vx * t + (ax * t * t) / 2, y: body.y + vy * t + (ay * t * t) / 2 };
}

export function sweepMotionDistance(body, vx, vy, ax, ay, duration, query, convex = false) {
  let time = 0;
  for (let i = 0; i < 96; i++) {
    const at = motionTrajectory(body, vx, vy, ax, ay, time),
      q = query(at);
    if (!q) return null;
    const ux = vx + ax * time,
      uy = vy + ay * time,
      remaining = duration - time;
    const vn = ux * q.nx + uy * q.ny,
      an = ax * q.nx + ay * q.ny;
    const convexHere = convex || q.convex;
    if (q.distance <= motionTuning.skin + 1e-8) {
      if (vn < -1e-8 || (Math.abs(vn) <= 1e-8 && an < -1e-8) || q.distance < -motionTuning.skin)
        return { time, q };
      // This convex support plane separates the entire remaining parabola.
      if (convexHere && vn >= -1e-8 && vn + (an * remaining) / 2 >= -1e-8) return null;
    }
    if (remaining <= 1e-10) return null;
    const speed = Math.hypot(ux, uy) + Math.hypot(ax, ay) * remaining;
    const gradient = q.gradient || 1;
    // Outside a convex box the distance Hessian is positive semidefinite:
    // tangent travel cannot increase closing speed. Only acceleration can.
    const closing =
      Math.max(0, -vn) * gradient +
      (Math.hypot(ax, ay) * gradient + (convexHere ? 0 : q.curvature || 0) * speed * speed) *
        remaining;
    const bound = q.far ? speed : Math.min(speed * gradient, closing);
    if (bound < 1e-12) return null;
    const advance = Math.max(1e-8, (q.distance - motionTuning.skin) / bound);
    if (advance > remaining) return null;
    time += Math.min(remaining, advance);
  }
  // Never advance unchecked through a collider when numerical convergence fails.
  throw Error('PLAYTEST continuous collision did not converge');
}

export function firstAirImpact(player, ax, ay, duration) {
  const body = motionBody(player),
    a = player.air;
  let hit = null;
  for (const box of motionFixtures[player.scenario].boxes) {
    const result = sweepMotionDistance(
      body,
      a.vx,
      a.vy,
      ax,
      ay,
      duration,
      (b) => ({ ...bodyBoxDistance(b, box), kind: 'box', id: box.id }),
      true
    );
    if (result && (!hit || result.time < hit.time)) hit = result;
  }
  for (const [index, span] of motionSpans(player.scenario).entries()) {
    const result = sweepMotionDistance(body, a.vx, a.vy, ax, ay, duration, (b) => {
      const q = floorBodyDistance(player.scenario, b, span, index);
      if (
        q &&
        a.separation &&
        a.separation.id === q.id &&
        !a.separation.cleared &&
        Math.abs(q.distance) <= motionTuning.separation
      )
        return null;
      return q;
    });
    if (result && (!hit || result.time < hit.time)) hit = result;
  }
  return hit;
}

export function sweepGroundBox(before, after, box, duration) {
  const extentX = (b) =>
    b.circle ? b.hw : Math.abs(Math.cos(b.angle)) * b.hw + Math.abs(Math.sin(b.angle)) * b.hh;
  const extentY = (b) =>
    b.circle ? b.hh : Math.abs(Math.sin(b.angle)) * b.hw + Math.abs(Math.cos(b.angle)) * b.hh;
  if (
    Math.max(before.y + extentY(before), after.y + extentY(after)) <= box.y1 + motionTuning.skin ||
    Math.min(before.y - extentY(before), after.y - extentY(after)) >= box.y2 - motionTuning.skin ||
    Math.max(before.x + extentX(before), after.x + extentX(after)) < box.x1 ||
    Math.min(before.x - extentX(before), after.x - extentX(after)) > box.x2
  )
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
  const c = Math.cos(before.angle),
    s = Math.sin(before.angle),
    dx = after.x - before.x,
    dy = after.y - before.y;
  let enter = 0,
    exit = 1,
    normal = null;
  for (const [x, y] of [
    [1, 0],
    [0, 1],
    [c, s],
    [-s, c],
  ]) {
    const extent =
      before.hw * Math.abs(c * x + s * y) +
      before.hh * Math.abs(-s * x + c * y) +
      ((box.x2 - box.x1) / 2) * Math.abs(x) +
      ((box.y2 - box.y1) / 2) * Math.abs(y);
    const offset = (before.x - (box.x1 + box.x2) / 2) * x + (before.y - (box.y1 + box.y2) / 2) * y,
      travel = dx * x + dy * y;
    if (Math.abs(travel) < 1e-12) {
      if (Math.abs(offset) >= extent - motionTuning.skin) return null;
      continue;
    }
    let a = (-extent - offset) / travel,
      b = (extent - offset) / travel;
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

export function releaseMotion(player, reason, jump = false) {
  const c = motionContact(player),
    previous = player.posture;
  const before = { vx: c.vx, vy: c.vy };
  let center = c.center;
  if (jump && motionPostureClear(player, 'rolling')) {
    player.posture = 'rolling';
    center = { x: c.x + c.nx * 19, y: c.y + c.ny * 19 };
  }
  const impulse = jump ? motionTuning.jumpImpulse : 0;
  const after = { vx: before.vx + c.nx * impulse, vy: before.vy + c.ny * impulse };
  player.lastTakeoff = {
    reason,
    before,
    after,
    normal: { x: c.nx, y: c.ny },
    anchor: c.anchor,
    reaction: c.normalReaction,
  };
  player.x = center.x;
  player.y = center.y;
  player.speed = null;
  player.mode = 'airborne';
  player.air = {
    ...after,
    jumpLift: Math.max(0, -c.ny * impulse),
    cutEligible: jump,
    restorePosture: previous,
    separation: { id: c.id, cleared: false },
  };
  player.latestTransition = reason;
  player.transitionCount++;
}

export function moveAirTime(player, ax, ay, time) {
  const a = player.air;
  player.x += a.vx * time + (ax * time * time) / 2;
  player.y += a.vy * time + (ay * time * time) / 2;
  player.distance += Math.hypot(a.vx, a.vy) * time;
  a.vx += ax * time;
  a.vy += ay * time;
  a.jumpLift = Math.max(0, a.jumpLift - groundTuning.gravity * time);
  if (a.separation && !a.separation.cleared) {
    const span = motionSpans(player.scenario).find(
      (s, i) => player.scenario + '-floor-' + i === a.separation.id
    );
    const q = span
      ? floorBodyDistance(
          player.scenario,
          motionBody(player),
          span,
          Number(a.separation.id.slice(-1))
        )
      : null;
    if (!q || q.distance > motionTuning.separation) a.separation.cleared = true;
  }
}

export function landMotion(player, hit, incoming) {
  const restore = player.air.restorePosture;
  let x = hit.surface.x;
  if (player.posture === 'standing') {
    // The upright sweep reports the first bottom-corner contact. That witness
    // is not the body's center or its future ground anchor. Preserve center x
    // when rotating into ground posture instead of snapping to that corner.
    x = player.x;
    for (let i = 0; i < 12; i++) {
      const s = sampleMotionExtension(player.scenario, x);
      const error = x + s.nx * 24 - player.x;
      x -= error / (1 + 24 * s.curvature);
      if (Math.abs(error) < 1e-9) break;
    }
  }
  const s = sampleMotionGround(player.scenario, x);
  if (!s) return false;
  const speed = incoming.vx * s.tx + incoming.vy * s.ty;
  const candidate = { ...player, mode: 'grounded', x, y: s.y, speed, air: null };
  const posture = [restore, player.posture].find((posture) => {
    candidate.posture = posture;
    return motionPostureClear(candidate, posture) && motionSupported(candidate, s);
  });
  if (!posture) return false;
  Object.assign(player, { mode: 'grounded', x, y: s.y, speed, air: null, posture });
  player.restTicks = 0;
  player.latestTransition = 'landing';
  player.transitionCount++;
  player.lastLanding = {
    incoming,
    speed,
    tx: s.tx,
    ty: s.ty,
    normal: { x: s.nx, y: s.ny },
    anchor: { x: s.x, y: s.y },
  };
  return true;
}

export function stepMotionPlayer(player, input = {}) {
  const direction = Math.sign(input.direction || 0);
  let controls = null,
    airBraking = null;
  if (player.mode === 'grounded') {
    controls = beginGroundTick(player, input, motionPostureClear(player, 'rolling'));
    if (input.jumpPressed) releaseMotion(player, 'jump', true);
  } else player.downHeld = !!input.down;
  if (player.air?.cutEligible && !input.jumpHeld) {
    if (player.air.vy < 0 && player.air.jumpLift > 0)
      player.air.vy += player.air.jumpLift * (1 - motionTuning.cutRatio);
    player.air.jumpLift = 0;
    player.air.cutEligible = false;
  }
  for (let sub = 0; sub < groundTuning.substeps; sub++) {
    let remaining = 1 / groundTuning.substeps;
    const blocked = [];
    for (let iteration = 0; remaining > 1e-9; iteration++) {
      if (iteration >= 12) throw Error('PLAYTEST transition iteration did not converge');
      if (player.mode === 'grounded') {
        controls ??= {
          direction,
          rolling: player.posture === 'rolling',
          braking: direction * player.speed < 0,
        };
        const current = sampleMotionGround(player.scenario, player.x);
        if (!current) {
          releaseMotion(player, 'ledge');
          continue;
        }
        if (!motionSupported(player, current)) {
          releaseMotion(player, 'crest');
          continue;
        }
        const candidate = { ...player };
        advanceGroundSubstep(candidate, controls, remaining, sampleMotionExtension);
        const span = motionSpans(player.scenario).find(([a, b]) => player.x >= a && player.x <= b);
        let event = null,
          time = remaining;
        const beyond = candidate.x < span[0] || candidate.x > span[1];
        const supported = motionSupported(
          candidate,
          sampleMotionExtension(player.scenario, candidate.x)
        );
        if (beyond || !supported) {
          let lo = 0,
            hi = remaining;
          for (let n = 0; n < 30; n++) {
            const mid = (lo + hi) / 2,
              q = { ...player };
            advanceGroundSubstep(q, controls, mid, sampleMotionExtension);
            if (
              q.x < span[0] ||
              q.x > span[1] ||
              !motionSupported(q, sampleMotionExtension(q.scenario, q.x))
            )
              hi = mid;
            else lo = mid;
          }
          time = hi;
          event = beyond ? 'ledge' : 'crest';
        }
        for (const box of motionFixtures[player.scenario].boxes) {
          const hit = sweepGroundBox(motionBody(player), motionBody(candidate), box, remaining);
          if (hit && hit.time <= time) {
            time = hit.time;
            event = 'block';
          }
        }
        if (time > 0) advanceGroundSubstep(player, controls, time, sampleMotionExtension);
        player.y = sampleMotionExtension(player.scenario, player.x).y;
        remaining -= time;
        if (event === 'block') {
          player.speed = 0;
          player.latestTransition = 'wall / clearance block';
          remaining = 0;
        } else if (event) releaseMotion(player, event);
      } else {
        const a = player.air;
        airBraking ??= direction * a.vx < 0;
        let target = a.vx;
        if (direction)
          target = airBraking
            ? Math.sign(a.vx) * Math.max(0, Math.abs(a.vx) - motionTuning.airBrake * remaining)
            : a.vx +
              direction *
                Math.min(
                  motionTuning.airAcceleration * remaining,
                  Math.max(0, motionTuning.airRange - direction * a.vx)
                );
        let ax = (target - a.vx) / remaining,
          ay = groundTuning.gravity;
        for (const n of blocked) {
          const into = ax * n.nx + ay * n.ny;
          if (into < 0) {
            ax -= into * n.nx;
            ay -= into * n.ny;
          }
        }
        const hit = firstAirImpact(player, ax, ay, remaining);
        if (!hit) {
          moveAirTime(player, ax, ay, remaining);
          remaining = 0;
          continue;
        }
        moveAirTime(player, ax, ay, hit.time);
        remaining -= hit.time;
        const n = hit.q,
          incoming = { vx: a.vx, vy: a.vy },
          into = a.vx * n.nx + a.vy * n.ny;
        if (into < 0) {
          a.vx -= into * n.nx;
          a.vy -= into * n.ny;
        }
        if (n.kind === 'floor' && n.canLand) {
          if (landMotion(player, n, incoming)) {
            controls = null;
            continue;
          }
          a.separation = { id: n.id, cleared: false };
          player.latestTransition = 'unsupported floor impact';
        } else {
          blocked.push(n);
          player.latestTransition = n.ny > 0.5 ? 'ceiling impact' : 'wall impact';
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
  if (player.mode === 'grounded')
    finishGroundTick(
      player,
      controls || { rolling: player.posture === 'rolling' },
      sampleMotionExtension,
      motionPostureClear(player, 'standing'),
      motionBounds
    );
  else {
    player.ticks++;
    if (Math.abs(player.air.vx) > 0.02) player.facing = Math.sign(player.air.vx);
  }
  const view = motionContact(player);
  if (
    !Number.isFinite(view.center.x) ||
    !Number.isFinite(view.center.y) ||
    !Number.isFinite(view.vx) ||
    !Number.isFinite(view.vy) ||
    Math.hypot(view.vx, view.vy) > groundTuning.safetySpeed
  )
    player.boundary = 'numerical safety reset';
  else if (Math.abs(view.center.x) > motionBounds(player.scenario) || view.center.y > 1350)
    player.boundary = 'test boundary / fall recovery reset';
}

export function initializeRuntimeModule() {
  motionTuning = Object.freeze({
    revision: 'AIR-2 / GROUND-4',
    jumpImpulse: 10.5,
    cutRatio: 0.4,
    airAcceleration: 0.08,
    airBrake: 0.16,
    airRange: 14,
    skin: 1e-5,
    separation: 0.002,
  });
  motionFixtures = Object.freeze({
    flat: { bounds: 5000, spawn: 0, boxes: [] },
    valley: { bounds: 2400, spawn: 0, boxes: [] },
    crest: { bounds: 1800, spawn: -600, boxes: [] },
    gap: {
      bounds: 1800,
      spawn: -250,
      boxes: [
        { id: 'gap-left-face', x1: 60, x2: 100, y1: 400, y2: 1500 },
        { id: 'gap-right-face', x1: 300, x2: 340, y1: 400, y2: 1500 },
      ],
    },
    wall: { bounds: 1800, spawn: 0, boxes: [{ id: 'wall', x1: 350, x2: 390, y1: 150, y2: 400 }] },
    ceiling: {
      bounds: 1800,
      spawn: 0,
      boxes: [{ id: 'ceiling', x1: 200, x2: 420, y1: 320, y2: 357 }],
    },
  });
}

export function getRuntimeBindings() {
  return {};
}
