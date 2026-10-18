import {
  createExperimentalRail,
  sampleExperimentalRail,
  experimentalRailImpact,
  experimentalRailTuning,
} from './playtest-rails.js';
import {
  createExperimentalBoost,
  beginExperimentalBoost,
  experimentalGroundBoost,
  experimentalBoostTuning,
  resetExperimentalAirBoost,
} from './playtest-boost.js';
import {
  experimentalDeviceTuning,
  experimentalPlatformPose,
  experimentalPlatformImpact,
  experimentalSpringPose,
  experimentalSpringDistance,
  experimentalDeviceImpact,
} from './playtest-devices.js';
// Isolated kinematic character controller for upright static benchmark terrain.
import {
  advanceGroundSubstep,
  beginGroundTick,
  createGroundPlayer,
  finishGroundTick,
  groundContact,
  groundTuning,
  landingGroundPosture,
  sampleGround,
} from './playtest-ground.js';
import {
  playtestPaths,
  samplePath,
  pathBody,
  pathDistances,
  syncPathPlayer,
  pathArcImpact,
  pathArcCaps,
  pathLineDistance,
} from './playtest-path.js';
export let motionTuning, motionFixtures;

export function motionBounds(scenario) {
  const fixture = motionFixtures[scenario];
  if (!fixture) throw Error('Unknown PLAYTEST fixture');
  return fixture.bounds;
}

export function motionSpans(scenario) {
  if (playtestPaths[scenario]) return [];
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
  const path = playtestPaths[scenario];
  const spawn = path ? samplePath(path, x) : sampleMotionExtension(scenario, x);
  return {
    ...createGroundPlayer(),
    scenario,
    x: spawn.x,
    y: spawn.y,
    ...(path ? { pathS: x } : {}),
    mode: 'grounded',
    air: null,
    supportId: null,
    railId: null,
    boost: createExperimentalBoost(motionFixtures[scenario].meter ?? 90),
    dash: null,
    springLaunches: 0,
    latestTransition: 'reset',
    transitionCount: 0,
    lastTakeoff: null,
    lastLanding: null,
  };
}

export function motionSpawn(scenario) {
  return playtestPaths[scenario]
    ? samplePath(playtestPaths[scenario], motionFixtures[scenario].spawn)
    : sampleMotionExtension(scenario, motionFixtures[scenario].spawn);
}
export function motionSupport(player, time = player.ticks) {
  const platform = motionFixtures[player.scenario].platforms?.find(
    (p) => p.id === player.supportId
  );
  return platform ? experimentalPlatformPose(platform, time) : null;
}
export function motionRail(player) {
  return motionFixtures[player.scenario].rails?.find((r) => r.id === player.railId);
}
export function motionSurface(player, time = player.ticks) {
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
      vy: support.vy,
    };
  return playtestPaths[player.scenario]
    ? samplePath(playtestPaths[player.scenario], player.pathS)
    : sampleMotionGround(player.scenario, player.x);
}
export function sampleMotionPath(scenario, s) {
  return samplePath(playtestPaths[scenario], s);
}
export function advanceMotionGround(player, controls, dt, time = player.ticks) {
  if (controls.groundBlocked) {
    const support = motionSupport(player, time);
    if (support) {
      player.x += support.vx * dt;
      player.y = motionSupport(player, time + dt).y1;
    }
    return;
  }
  const rail = motionRail(player),
    surface = motionSurface(player, time);
  const boosted = experimentalGroundBoost(player, surface || {});
  if (rail || boosted)
    controls = {
      ...controls,
      ...(rail ? { physics: experimentalRailTuning, rolling: false, standingGrip: false } : {}),
      ...(boosted ? { boost: { ...experimentalBoostTuning, facing: player.facing } } : {}),
    };
  if (rail) {
    advanceGroundSubstep(player, controls, dt, (_scenario, x) =>
      sampleExperimentalRail(rail, x, Math.sign(player.speed))
    );
    player.y = sampleExperimentalRail(rail, player.x).y;
    return;
  }
  const support = motionSupport(player, time);
  if (support) {
    advanceGroundSubstep(player, controls, dt, (_scenario, x) => ({
      ...motionSurface(player, time),
      x,
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
  if (!surface) return false;
  // Explicit upright crest grip requested for this experiment. Rolling still
  // requires nonnegative physical support; no grip extends across open ledges.
  if (surface.pathS !== undefined) {
    const steep = surface.ny >= -Math.SQRT1_2;
    if (steep && Math.abs(player.speed) < motionTuning.steepGripSpeed) return false;
    if (steep && Math.abs(surface.curvature) < 1e-9) return true;
    return (
      (player.posture === 'standing' && surface.ny < -Math.SQRT1_2 && surface.curvature >= 0) ||
      motionReaction(player, surface) >= -1e-6
    );
  }
  return player.posture === 'standing' || motionReaction(player, surface) >= -1e-6;
}

export function motionContact(player, time = player.ticks) {
  if (player.mode === 'grounded') {
    const path = playtestPaths[player.scenario];
    const support = motionSupport(player, time);
    const rail = motionRail(player);
    if (rail) {
      const surface = motionSurface(player, time);
      return {
        ...surface,
        surfaceAngle: surface.angle,
        angle: 0,
        grounded: true,
        anchor: { x: player.x, y: player.y },
        center: { x: player.x, y: player.y - 24 },
        width: 22,
        height: 48,
        speed: player.speed,
        vx: player.speed * surface.tx,
        vy: player.speed * surface.ty,
        normalReaction: motionReaction(player, surface),
      };
    }
    if (support) {
      const surface = motionSurface(player, time),
        height = player.posture === 'rolling' ? 38 : 48;
      return {
        ...surface,
        grounded: true,
        anchor: { x: player.x, y: player.y },
        center: { x: player.x, y: player.y - height / 2 },
        width: player.posture === 'rolling' ? 38 : 22,
        height,
        speed: player.speed,
        vx: player.speed + support.vx,
        vy: support.vy,
        normalReaction: groundTuning.gravity,
      };
    }
    const surface = path ? motionSurface(player) : null;
    const body = path ? pathBody(player) : null;
    const c = path
      ? {
          ...surface,
          anchor: { x: surface.x, y: surface.y },
          center: { x: body.x, y: body.y },
          width: body.hw * 2,
          height: body.hh * 2,
          speed: player.speed,
          vx: player.speed * surface.tx,
          vy: player.speed * surface.ty,
        }
      : groundContact(player, sampleMotionExtension);
    const reaction = motionReaction(player, c);
    return {
      ...c,
      grounded: true,
      normalReaction: reaction,
      uprightGrip: player.posture === 'standing' && c.ny < -Math.SQRT1_2 && reaction < -1e-6,
      steepGrip: !!path && c.ny >= -Math.SQRT1_2 && Math.abs(c.curvature) < 1e-9,
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

export function motionBody(player, posture = player.posture, time = player.ticks) {
  if (player.mode === 'grounded' && motionRail(player))
    return {
      x: player.x,
      y: player.y - (posture === 'rolling' ? 19 : 24),
      hw: posture === 'rolling' ? 19 : 11,
      hh: posture === 'rolling' ? 19 : 24,
      circle: posture === 'rolling',
      angle: 0,
    };
  if (player.mode === 'grounded' && playtestPaths[player.scenario])
    return pathBody(player, posture);
  const height = posture === 'rolling' ? 38 : 48,
    width = posture === 'rolling' ? 38 : 22;
  const s =
    player.mode === 'grounded'
      ? motionSurface(player, time) || sampleMotionExtension(player.scenario, player.x)
      : null;
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

export function motionPostureClear(player, posture, time = player.ticks) {
  const body = motionBody(player, posture, time),
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
  for (const spring of motionFixtures[player.scenario].springs || [])
    if (
      experimentalSpringDistance(
        body,
        experimentalSpringPose(spring, time, motionFixtures[player.scenario])
      ).distance < -motionTuning.skin
    )
      return false;
  if (
    playtestPaths[player.scenario] &&
    pathDistances(
      playtestPaths[player.scenario],
      body,
      player.mode === 'grounded' ? player.pathS : null
    ).some((q) => q.distance < -motionTuning.skin)
  )
    return false;
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

export function firstAirImpact(player, ax, ay, duration, time = player.ticks) {
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
  const path = playtestPaths[player.scenario];
  if (path)
    for (const piece of path.pieces) {
      const accept = (q) => {
        if (a.departure?.includes(q.id) && Math.abs(q.surface.pathS - a.pathOrigin) > a.pathReach)
          return false;
        return !(
          a.separation?.id === q.id &&
          !a.separation.cleared &&
          Math.abs(q.distance) <= motionTuning.separation
        );
      };
      if (piece.kind === 'arc') {
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
                kind: 'box',
                canLand: false,
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

export function releaseMotion(player, reason, jump = false, time = player.ticks) {
  const c = motionContact(player, time),
    previous = player.posture;
  const before = { vx: c.vx, vy: c.vy };
  let center = c.center;
  if (jump && motionPostureClear(player, 'rolling', time)) {
    player.posture = 'rolling';
    const body = motionBody(player, player.posture, time);
    center = { x: body.x, y: body.y };
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
  const path = playtestPaths[player.scenario];
  const pathOrigin = player.pathS;
  const shape = motionBody(player);
  const pathReach = shape.hw + shape.hh + (path?.thickness || 0) + 2;
  const departure = path
    ? pathDistances(path, { ...motionBody(player), x: center.x, y: center.y, angle: 0 })
        .filter((q) => q.distance < 0 && Math.abs(q.surface.pathS - player.pathS) > pathReach)
        .map((q) => q.id)
    : [];
  if (path) player.pathS = null;
  player.x = center.x;
  player.y = center.y;
  player.speed = null;
  if (player.boost.remaining <= 0) player.boost.active = false;
  const railDeparture = player.railId;
  player.supportId = null;
  player.railId = null;
  player.dash = null;
  player.mode = 'airborne';
  player.air = {
    ...after,
    railDeparture,
    departure,
    ...(path ? { pathOrigin, pathReach } : {}),
    jumpLift: Math.max(0, -c.ny * impulse),
    cutEligible: jump,
    restorePosture: previous,
    separation: { id: c.id, cleared: false },
  };
  player.latestTransition = reason;
  player.transitionCount++;
}

export function moveAirTime(player, ax, ay, time, clockTime = player.ticks) {
  const a = player.air;
  player.x += a.vx * time + (ax * time * time) / 2;
  player.y += a.vy * time + (ay * time * time) / 2;
  player.distance += Math.hypot(a.vx, a.vy) * time;
  a.vx += ax * time;
  a.vy += ay * time;
  a.jumpLift = Math.max(0, (a.jumpLift || 0) - groundTuning.gravity * time);
  const path = playtestPaths[player.scenario];
  if (path && a.departure?.length) {
    const distances = pathDistances(path, motionBody(player));
    a.departure = a.departure.filter((id) =>
      distances.some((q) => q.id === id && q.distance <= motionTuning.separation)
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
      (p) => p.id === a.separation.id
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
      const q = pathDistances(playtestPaths[player.scenario], motionBody(player)).find(
        (q) => q.id === a.separation.id
      );
      if (!q || q.distance > motionTuning.separation) a.separation.cleared = true;
      return;
    }
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

export function landMotion(player, hit, incoming, time = player.ticks) {
  if (hit.kind === 'rail') {
    const rail = motionFixtures[player.scenario].rails.find((r) => r.id === hit.railId),
      surface = sampleExperimentalRail(rail, player.x);
    const speed = incoming.vx * surface.tx + incoming.vy * surface.ty;
    const candidate = {
      ...player,
      mode: 'grounded',
      railId: rail.id,
      supportId: null,
      posture: 'standing',
      x: player.x,
      y: surface.y,
      speed,
      air: null,
      restTicks: 0,
      dash: null,
    };
    if (!motionPostureClear(candidate, 'standing', time)) return false;
    Object.assign(player, candidate, {
      latestTransition: 'rail capture',
      transitionCount: player.transitionCount + 1,
    });
    player.lastLanding = {
      incoming,
      speed,
      tx: surface.tx,
      ty: surface.ty,
      anchor: { x: player.x, y: surface.y },
    };
    resetExperimentalAirBoost(player);
    return true;
  }
  if (hit.kind === 'platform') {
    const support = hit.platform,
      relative = incoming.vx - support.vx;
    const candidate = {
      ...player,
      mode: 'grounded',
      air: null,
      supportId: support.id,
      speed: relative,
      y: support.y1,
      restTicks: 0,
    };
    const posture = landingGroundPosture((posture) =>
      motionPostureClear({ ...candidate, posture }, posture, time)
    );
    if (!posture) return false;
    Object.assign(player, candidate, {
      posture,
      latestTransition: 'platform landing',
      transitionCount: player.transitionCount + 1,
    });
    player.lastLanding = {
      incoming,
      speed: relative,
      tx: 1,
      ty: 0,
      platformVelocity: { vx: support.vx, vy: support.vy },
      anchor: { x: player.x, y: support.y1 },
    };
    resetExperimentalAirBoost(player);
    return true;
  }
  const path = playtestPaths[player.scenario];
  if (path) {
    const piece = hit.surface.piece;
    let pathS;
    if (piece.kind === 'line')
      pathS =
        piece.start +
        Math.max(
          0,
          Math.min(piece.length, (player.x - piece.x) * piece.tx + (player.y - piece.y) * piece.ty)
        );
    else {
      let angle = Math.atan2(player.x - piece.cx, player.y - piece.cy);
      while (angle < piece.a - 1e-9) angle += Math.PI * 2;
      angle = Math.max(piece.a, Math.min(piece.b, angle));
      pathS = piece.start + (angle - piece.a) * piece.r;
    }
    const surface = samplePath(path, pathS),
      speed = incoming.vx * surface.tx + incoming.vy * surface.ty;
    const candidate = {
      ...player,
      pathS,
      x: surface.x,
      y: surface.y,
      mode: 'grounded',
      air: null,
      speed,
    };
    const posture = landingGroundPosture((posture) => {
      candidate.posture = posture;
      return motionSupported(candidate, surface) && motionPostureClear(candidate, posture);
    });
    if (!posture) return false;
    Object.assign(player, candidate, {
      posture,
      restTicks: 0,
      latestTransition: 'landing',
      transitionCount: player.transitionCount + 1,
    });
    player.lastLanding = {
      incoming,
      speed,
      tx: surface.tx,
      ty: surface.ty,
      normal: { x: surface.nx, y: surface.ny },
      anchor: { x: surface.x, y: surface.y },
    };
    resetExperimentalAirBoost(player);
    return true;
  }
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
  // Posture expansion must not grant upright grip immediately after a rolled
  // crest departure, before physical separation from the departing surface.
  if (
    player.posture === 'rolling' &&
    player.air.separation?.id === s.id &&
    !player.air.separation.cleared &&
    !motionSupported({ ...candidate, posture: 'rolling' }, s)
  )
    return false;
  const posture = landingGroundPosture((posture) => {
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
  resetExperimentalAirBoost(player);
  return true;
}

// One time owner: these helpers only query geometry or resolve a contact at the
// fractional tick supplied by stepMotionPlayer.
export function firstDeviceImpact(player, body, vx, vy, ax, ay, duration, time) {
  const fixture = motionFixtures[player.scenario];
  let hit = null;
  for (const platform of fixture.platforms || []) {
    if (
      platform.id === player.supportId ||
      (player.air?.separation?.id === platform.id && !player.air.separation.cleared)
    )
      continue;
    const pose = experimentalPlatformPose(platform, time);
    const result = experimentalPlatformImpact(
      body,
      vx,
      vy,
      ax,
      ay,
      duration,
      pose,
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
        kind: 'spring',
        id: spring.id,
        velocity: { vx: face.vx, vy: face.vy },
      });
    if (player.mode === 'grounded') {
      const surface = motionSurface(player, time);
      const radius = body.circle
        ? body.hw
        : Math.abs(Math.cos(body.angle) * face.nx + Math.sin(body.angle) * face.ny) * body.hw +
          Math.abs(-Math.sin(body.angle) * face.nx + Math.cos(body.angle) * face.ny) * body.hh;
      const distance = (body.x - face.x) * face.nx + (body.y - face.y) * face.ny - radius;
      if (
        surface.nx * face.nx + surface.ny * face.ny > 0.999 &&
        Math.abs(distance) < motionTuning.skin * 2
      ) {
        const tangent = (body.x - face.x) * face.tx + (body.y - face.y) * face.ty;
        const along = (vx - face.vx) * face.tx + (vy - face.vy) * face.ty;
        const extent = body.circle ? 0 : body.hw;
        const lo = -face.half - extent,
          hi = face.half + extent;
        const t =
          tangent >= lo && tangent <= hi
            ? 0
            : along
              ? (Math.sign(along) > 0 ? lo - tangent : hi - tangent) / along
              : Infinity;
        if (t >= 0 && t <= duration && (!result || t <= result.time + motionTuning.skin))
          result = {
            time: t,
            q: { distance: 0, nx: face.nx, ny: face.ny, kind: 'spring', id: spring.id },
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

export function firstGroundDeviceImpact(player, candidate, duration, time) {
  const before = motionBody(player, player.posture, time),
    after = motionBody(candidate, candidate.posture, time + duration);
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

export function launchExperimentalSpring(player, face, time) {
  const c = motionContact(player, time),
    vx = c.vx - face.vx,
    vy = c.vy - face.vy;
  const tangent = vx * face.tx + vy * face.ty;
  const normal = Math.max(experimentalDeviceTuning.springSpeed, vx * face.nx + vy * face.ny);
  const world = {
    vx: tangent * face.tx + normal * face.nx + face.vx,
    vy: tangent * face.ty + normal * face.ny + face.vy,
  };
  player.boost.remaining = 0;
  player.boost.active = false;
  const center = c.center,
    restore = player.air?.restorePosture || player.posture;
  Object.assign(player, {
    mode: 'airborne',
    speed: null,
    supportId: null,
    railId: null,
    dash: null,
    x: center.x,
    y: center.y,
    air: { ...world, restorePosture: restore, cutEligible: false, jumpLift: 0 },
    springLaunches: player.springLaunches + 1,
    latestTransition: 'spring ' + face.id,
    transitionCount: player.transitionCount + 1,
    lastSpring: { id: face.id, time, relativeTangent: tangent, normalSpeed: normal, world },
  });
}

export function updateExperimentalDash(player, input, surface = null, canRoll = null) {
  const t = experimentalDeviceTuning,
    direction = Math.sign(input.direction || 0);
  if (player.mode !== 'grounded' || player.railId) {
    player.dash = null;
    return false;
  }
  if (player.dash) {
    if (direction && direction !== player.dash.facing) {
      player.dash = null;
      player.latestTransition = 'Spin Dash cancelled';
      return true;
    }
    if (!input.down) {
      const dash = player.dash,
        release = t.dashMin + ((t.dashMax - t.dashMin) * dash.charge) / t.dashChargeTicks;
      // An external carrier never becomes competing ground speed; aligned earned
      // tangent speed is retained if it already exceeds the charged release.
      if (Math.abs(player.speed) < release) player.speed = dash.facing * release;
      player.dash = null;
      player.posture = 'rolling';
      player.restTicks = 0;
      player.latestTransition = 'Spin Dash release';
      return true;
    }
    if (input.jumpHeld || input.jumpPressed)
      player.dash.charge = Math.min(t.dashChargeTicks, player.dash.charge + 1);
    return true;
  }
  if (
    input.down &&
    input.jumpPressed &&
    Math.abs(player.speed) <= t.dashEntrySpeed &&
    (surface || motionSurface(player)).ny < -0.7 &&
    (canRoll ? canRoll() : motionPostureClear(player, 'rolling'))
  ) {
    player.dash = { charge: 1, facing: player.facing };
    player.posture = 'rolling';
    player.restTicks = 0;
    player.latestTransition = 'Spin Dash charging';
    return true;
  }
  return false;
}

// Shared airborne forces; each scene's movement owner supplies elapsed time.
export function motionAirForces(player, direction, braking, dt) {
  const a = player.air;
  let target = a.vx;
  if (direction)
    target = braking
      ? Math.sign(a.vx) * Math.max(0, Math.abs(a.vx) - motionTuning.airBrake * dt)
      : a.vx +
        direction *
          Math.min(
            motionTuning.airAcceleration * dt,
            Math.max(0, motionTuning.airRange - direction * a.vx)
          );
  const bursting = player.boost.held && player.boost.remaining > 0;
  return {
    ax: bursting ? 0 : (target - a.vx) / dt,
    ay: bursting ? 0 : groundTuning.gravity,
    bursting,
  };
}

export function stepMotionPlayer(player, input = {}) {
  const direction = Math.sign(input.direction || 0);
  const startedGrounded = player.mode === 'grounded';
  let burstAdvanced = false;
  const dashAction = updateExperimentalDash(player, input);
  let controls = null,
    airBraking = null;
  if (player.mode === 'grounded') {
    controls = beginGroundTick(
      player,
      input,
      !player.railId && motionPostureClear(player, 'rolling'),
      motionPostureClear(player, 'standing')
    );
    if (player.dash) controls = { direction: 0, rolling: false, braking: true };
    if (input.jumpPressed && !dashAction) releaseMotion(player, 'jump', true);
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
      if (iteration >= 12) throw Error('PLAYTEST transition iteration did not converge');
      const clockTime = player.ticks + (sub + 1) / groundTuning.substeps - remaining;
      const fixture = motionFixtures[player.scenario];
      const untilTurn = Math.min(
        Infinity,
        ...(fixture.platforms || []).map((p) => experimentalPlatformPose(p, clockTime).nextTurn)
      );
      const slice = Math.min(remaining, untilTurn);
      if (player.mode === 'grounded') {
        controls ??= {
          direction,
          rolling: player.posture === 'rolling',
          braking: direction * player.speed < 0,
        };
        const path = playtestPaths[player.scenario];
        const rail = motionRail(player);
        const current = motionSurface(player, clockTime);
        if (!current) {
          releaseMotion(player, 'ledge', false, clockTime);
          continue;
        }
        if (!motionSupported(player, current)) {
          releaseMotion(player, path ? 'lost support / traction' : 'crest', false, clockTime);
          continue;
        }
        const groundBoost = experimentalGroundBoost(player, current);
        const freeBoost = !!(current.grindable && current.infiniteBoost);
        player.boost.active = groundBoost;
        const resourceSlice =
          groundBoost && !freeBoost
            ? Math.min(slice, player.boost.meter / experimentalBoostTuning.groundCost)
            : slice;
        const duration = path
          ? Math.min(
              resourceSlice,
              0.04 / Math.max(1e-9, Math.abs(player.speed) * Math.abs(current.curvature))
            )
          : resourceSlice;
        const candidate = { ...player };
        advanceMotionGround(candidate, controls, duration, clockTime);
        const position = (p) => (path ? p.pathS : p.x);
        const carrier = motionSupport(player, clockTime);
        const span = rail
          ? [rail.x1, rail.x2]
          : carrier
            ? [carrier.x1, carrier.x2]
            : path
              ? [0, path.length]
              : motionSpans(player.scenario).find(([a, b]) => player.x >= a && player.x <= b);
        let event = null,
          blockNormal = null,
          blockedBox = null,
          time = duration;
        const beyond =
          position(candidate) - (carrier?.vx || 0) * duration < span[0] ||
          position(candidate) - (carrier?.vx || 0) * duration > span[1];
        const supported = motionSupported(
          candidate,
          path
            ? sampleMotionPath(player.scenario, candidate.pathS)
            : motionSurface(candidate, clockTime + duration)
        );
        if (beyond || !supported) {
          let lo = 0,
            hi = duration;
          for (let n = 0; n < 30; n++) {
            const mid = (lo + hi) / 2,
              q = { ...player };
            advanceMotionGround(q, controls, mid, clockTime);
            if (
              position(q) - (carrier?.vx || 0) * mid < span[0] ||
              position(q) - (carrier?.vx || 0) * mid > span[1] ||
              !motionSupported(
                q,
                path ? sampleMotionPath(q.scenario, q.pathS) : motionSurface(q, clockTime + mid)
              )
            )
              hi = mid;
            else lo = mid;
          }
          time = hi;
          event = beyond
            ? path
              ? 'path boundary'
              : 'ledge'
            : path
              ? 'lost support / traction'
              : 'crest';
        }
        if (rail) {
          const target = player.speed >= 0 ? current.piece.x2 : current.piece.x1;
          if (
            target > rail.x1 &&
            target < rail.x2 &&
            (candidate.x - target) * Math.sign(player.speed) >= 0 &&
            Math.abs(player.x - target) > 1e-8
          ) {
            let lo = 0,
              hi = duration;
            for (let i = 0; i < 30; i++) {
              const mid = (lo + hi) / 2,
                q = { ...player };
              advanceMotionGround(q, controls, mid, clockTime);
              if ((q.x - target) * Math.sign(player.speed) >= 0) hi = mid;
              else lo = mid;
            }
            if (hi < time) {
              time = hi;
              event = 'rail join';
            }
          }
        }
        for (const box of motionFixtures[player.scenario].boxes) {
          // Retain the resolved resting contact while its relative normal motion
          // is separating/tangent. Other obstacles and a carrier reversing into
          // this contact still sweep normally; no relative drive is re-applied.
          if (
            controls.groundBlocked &&
            controls.blockedBox === box &&
            (!carrier ||
              carrier.vx * controls.blockedNormal.nx + carrier.vy * controls.blockedNormal.ny >=
                -1e-8)
          )
            continue;
          const hit = sweepGroundBox(
            motionBody(player, player.posture, clockTime),
            motionBody(candidate, candidate.posture, clockTime + duration),
            box,
            duration
          );
          if (hit && hit.time <= time) {
            time = hit.time;
            event = 'block';
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
        if (event === 'rail join') continue;
        if (event && typeof event === 'object') {
          if (event.kind === 'spring' && event.active) {
            launchExperimentalSpring(player, event.face, clockTime + time);
            controls = null;
          } else {
            player.speed = 0;
            player.latestTransition = 'device casing block';
            const relativeInto =
              ((carrier?.vx || 0) - (event.velocity?.vx || 0)) * event.nx +
              ((carrier?.vy || 0) - (event.velocity?.vy || 0)) * event.ny;
            if (relativeInto < -1e-8) player.boundary = 'moving device blocked clearance reset';
            if (!player.boundary)
              controls = {
                direction: 0,
                rolling: player.posture === 'rolling',
                braking: false,
                groundBlocked: true,
              };
            else remaining = 0;
          }
        } else if (event === 'block') {
          player.speed = 0;
          player.latestTransition = 'wall / clearance block';
          if (carrier && carrier.vx * blockNormal.nx + carrier.vy * blockNormal.ny < -1e-8)
            player.boundary = 'moving support blocked clearance reset';
          // A side block stops relative walking, not the carrier's remaining time.
          if (!player.boundary)
            controls = {
              direction: 0,
              rolling: player.posture === 'rolling',
              braking: false,
              groundBlocked: true,
              blockedBox,
              blockedNormal: blockNormal,
            };
          else remaining = 0;
        } else if (event === 'path boundary') {
          player.boundary = 'test path boundary reset';
          remaining = 0;
        } else if (event)
          releaseMotion(
            player,
            rail && event === 'ledge' ? 'rail end' : event,
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
        for (const n of blocked) {
          const into = ax * n.nx + ay * n.ny;
          if (into < 0) {
            ax -= into * n.nx;
            ay -= into * n.ny;
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
        if (hit.q.kind === 'spring' && hit.q.active) {
          launchExperimentalSpring(player, hit.q.face, clockTime + hit.time);
          airBraking = null;
          continue;
        }
        const n = hit.q,
          incoming = { vx: a.vx, vy: a.vy },
          into = (a.vx - (n.velocity?.vx || 0)) * n.nx + (a.vy - (n.velocity?.vy || 0)) * n.ny;
        if (into < 0) {
          a.vx -= into * n.nx;
          a.vy -= into * n.ny;
        }
        if (['floor', 'platform', 'rail'].includes(n.kind) && n.canLand) {
          if (landMotion(player, n, incoming, clockTime + hit.time)) {
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
  if (burstAdvanced && player.boost.remaining > 0) player.boost.remaining--;
  if (player.mode === 'grounded')
    finishGroundTick(
      player,
      controls || { rolling: player.posture === 'rolling' },
      playtestPaths[player.scenario]
        ? sampleMotionPath
        : (scenario, x) => ({ ...motionSurface(player, player.ticks + 1), x }),
      motionPostureClear(player, 'standing'),
      motionBounds,
      !!playtestPaths[player.scenario]
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
    revision: 'RAIL-BOOST-1 / DEVICES-2 / PATH-1 / AIR-2 / GROUND-6',
    steepGripSpeed: 2.5,
    jumpImpulse: 10.5,
    cutRatio: 0.4,
    airAcceleration: 0.16,
    airBrake: 0.2,
    airRange: 14,
    skin: 1e-5,
    separation: 0.002,
  });
  motionFixtures = Object.freeze({
    ...Object.fromEntries(
      Object.entries(playtestPaths).map(([id, path]) => [
        id,
        { bounds: 1300, spawn: id.endsWith('reverse') ? path.length - 140 : 140, boxes: [], path },
      ])
    ),
    rails: {
      bounds: 2000,
      spawn: -780,
      boxes: [],
      rails: [
        createExperimentalRail(),
        {
          id: 'gap-rail',
          x1: 1000,
          x2: 1400,
          pieces: [
            {
              id: 'gap-rail-piece',
              x1: 1000,
              x2: 1400,
              y: 300,
              c: [300, 0, 0, 0],
              grindable: true,
              infiniteBoost: false,
            },
          ],
        },
      ],
    },
    'rails-empty': {
      bounds: 2000,
      spawn: -780,
      boxes: [],
      meter: 0,
      rails: [createExperimentalRail()],
    },
    springs: {
      bounds: 1800,
      spawn: -160,
      boxes: [],
      springs: [
        { id: 'up-spring', x: 120, y: 376, angle: 0 },
        { id: 'right-spring', x: 450, y: 300, angle: Math.PI / 2 },
        { id: 'diagonal-spring', x: 750, y: 360, angle: Math.PI / 4 },
        { id: 'left-spring', x: -650, y: 300, angle: -Math.PI / 2 },
      ],
    },
    platforms: {
      bounds: 1800,
      spawn: -280,
      boxes: [],
      platforms: [
        {
          id: 'ferry',
          x: 0,
          y: 280,
          width: 180,
          depth: 20,
          motion: { axis: 'x', amplitude: 120, period: 240 },
        },
        {
          id: 'elevator',
          x: 500,
          y: 280,
          width: 180,
          depth: 20,
          motion: { axis: 'y', amplitude: 70, period: 180 },
        },
      ],
    },
    'moving-spring': {
      bounds: 1800,
      spawn: -280,
      boxes: [],
      platforms: [
        {
          id: 'spring-ferry',
          x: 0,
          y: 280,
          width: 180,
          depth: 20,
          motion: { axis: 'x', amplitude: 120, period: 240 },
        },
      ],
      springs: [{ id: 'moving-cap', platform: 'spring-ferry', x: 0, y: -24, angle: 0 }],
    },
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
