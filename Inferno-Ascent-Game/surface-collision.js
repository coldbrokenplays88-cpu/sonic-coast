// Generated from src/surface-collision.js; run npm run build:compat after source edits.
'use strict';
function pose(s, t = runFrames) {
  if (!s.motion) {
    const cached = staticSurfacePoses.get(s);
    if (
      cached &&
      cached.x1 === s.x1 &&
      cached.x2 === s.x2 &&
      cached.y1 === s.y1 &&
      cached.y2 === s.y2
    )
      return cached;
    const q = {
      x1: s.x1 + 0,
      x2: s.x2 + 0,
      y1: s.y1 + 0,
      y2: s.y2 + 0,
      slope: (s.y2 - s.y1) / (s.x2 - s.x1),
    };
    staticSurfacePoses.set(s, q);
    return q;
  }
  let dx = 0,
    dy = 0;
  if (s.motion) {
    const m = s.motion,
      n =
        m.type === 'flight'
          ? m.startedAt === null
            ? 0
            : Math.sign(m.distance) *
              Math.min(Math.abs(m.distance), Math.max(0, t - m.startedAt) * m.speed)
          : Math.sin((t / m.period) * Math.PI * 2 + m.phase) * m.amp;
    if (s.motion.axis === 'x') dx = n;
    else dy = n;
  }
  return {
    x1: s.x1 + dx,
    x2: s.x2 + dx,
    y1: s.y1 + dy,
    y2: s.y2 + dy,
    slope: (s.y2 - s.y1) / (s.x2 - s.x1),
  };
}

function surfaceVelocity(s) {
  const a = pose(s, runFrames - 1),
    b = pose(s);
  return { x: b.x1 - a.x1, y: b.y1 - a.y1 };
}

function yOn(s, x, t = runFrames) {
  const q = pose(s, t);
  return q.y1 + (x - q.x1) * q.slope;
}

function active(s) {
  return (
    (!s.sealedBy || level.hazards.find((h) => h.id === s.sealedBy)?.broken) &&
    (!s.restoreAt || runFrames >= s.restoreAt)
  );
}

function surfaceOverlaps(s, left, right) {
  let x1 = s.x1,
    x2 = s.x2;
  const m = s.motion;
  if (m?.axis === 'x') {
    if (m.type === 'flight') {
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

function topAt(x, below = -Infinity) {
  let result = null;
  for (const s of level.surfaces) {
    if (!surfaceOverlaps(s, x, x) || !active(s)) continue;
    const q = pose(s);
    if (x >= q.x1 && x <= q.x2) {
      const y = yOn(s, x);
      if (y >= below && (!result || y < result.y)) result = { s, y };
    }
  }
  return result;
}

function bodyHeight() {
  return p.ground && p.roll ? 26 : !p.ground ? 38 : 48;
}

function feet() {
  return p.y + 20;
}

function resetPlatforms() {
  for (const s of level.surfaces) {
    s.crumbleTimer = -1;
    s.restoreAt = 0;
  }
}

function land(s, y) {
  p.scriptedLaunch = false;
  p.jumpReleaseVy = null;
  p.coyoteLaunchVy = null;
  p.airBoostUsed = false;
  p.airBoostFrames = 0;
  p.airBoostActive = false;
  beforeStageLanding(s);
  if (!s.grindable) {
    const slope = pose(s).slope,
      norm = Math.hypot(1, slope);
    if (p.ground && p.surface) {
      p.vx *= Math.hypot(1, pose(p.surface).slope) / norm;
    } else if (!p.wrongRouteDrop) {
      const carry = surfaceVelocity(s);
      p.vx = (p.vx - carry.x + (p.vy - carry.y) * slope) / (norm * norm);
    }
  }
  if (s.grindable && p.surface !== s) {
    p.grindEntryFrame = runFrames;
    p.grindFromFast = p.boosting || Math.abs(p.vx) > 17;
    p.grindFast = Math.abs(p.vx) > 18 || p.boosting;
    p.rolling = false;
    p.roll = false;
    p.brakeActive = false;
    p.stopFrame = -100;
    charge = 0;
  } else if (p.surface?.grindable && !s.grindable) {
    p.grindExitFrame = runFrames;
  }
  if (!p.ground) {
    p.poseLandingFrame = runFrames;
    gameSound(s.grindable ? 'grind' : 'land', { speed: Math.abs(p.vx), volume: 0.7 });
  }
  p.landFrame = runFrames;
  p.landKind = s.kind;
  const changed = p.surface !== s || !p.ground;
  p.y = y - 20;
  p.vy = 0;
  p.ground = true;
  p.jumpAttack = false;
  p.airSpeedLimit = null;
  p.surface = s;
  afterStageLanding(s);
  if (changed && !visited.has(s.id)) {
    visited.add(s.id);
    if (s.kind === 'express') {
      stats.expressLandings++;
      score += 400;
      sparks(p.x, p.y + 20, 5, '#ffdf72');
    }
    if (s.kind === 'recovery' || s.kind === 'lower') stats.recoveries++;
  }
  if (s.kind === 'crumble' && s.crumbleTimer < 0) s.crumbleTimer = s.crumbleDelay;
  for (const group of level.collapseGroups || [])
    if (group.entryId === s.id && !group.triggered) {
      group.triggered = true;
      for (const id of group.tailIds) {
        const tail = level.surfaces.find((v) => v.id === id);
        if (tail) tail.crumbleTimer = group.delay;
      }
    }
  if (!reboundBubbleShield() && changed && jumpBuffer > 0) jump();
}

function canStand() {
  const foot = feet();
  return !level.hazards.some(
    (h) =>
      h.type === 'gate' &&
      p.x + 13 > h.x &&
      p.x - 13 < h.x + h.w &&
      foot > h.y &&
      foot - 48 < h.y + h.h
  );
}

function resolveHazards(oldX, oldY) {
  for (const h of level.hazards) {
    if (h.broken) continue;
    if (p.x + 13 < h.x || p.x - 13 > h.x + h.w) continue;
    const foot = feet(),
      height = bodyHeight(),
      top = foot - height;
    if (foot <= h.y || top >= h.y + h.h) continue;
    if (h.type === 'breakable' && (p.boosting || (!h.boostOnly && Math.abs(p.vx) >= h.threshold))) {
      h.broken = true;
      gameSound('hazard');
      score += 350;
      stats.barriers = (stats.barriers || 0) + 1;
      sparks(h.x, h.floor - 40, 18, '#ffcc70');
      continue;
    }
    if (h.type === 'spikes') {
      hurt(h.x + h.w / 2);
      continue;
    }
    // Gantries remain solid during damage immunity. A correct roll keeps every bit of speed.
    const previousTop = oldY + 20 - height;
    if (oldY + 20 <= h.y && p.vy >= 0) {
      p.y = h.y - 20;
      p.vy = 0;
      p.ground = false;
      reboundBubbleShield();
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

function applySurfaceMotion() {
  if (p.ground && p.surface) {
    const slope = pose(p.surface).slope,
      norm = Math.hypot(1, slope),
      dir =
        Number(keys.has('ArrowRight') || keys.has('KeyD')) -
        Number(keys.has('ArrowLeft') || keys.has('KeyA'));
    // Releasing direction can hold a precise stance; active travel and rolling feel gravity.
    if (
      !p.surface.grindable &&
      !charge &&
      (p.rolling || p.boosting || dir || Math.abs(p.vx * norm) >= 3)
    ) {
      // Sonic 1/2 slope-force ratios: walk .125, roll downhill .3125,
      // roll uphill .078125. Scale together to retain our .58 downhill roll.
      const wet = p.underwater ? 2 / 7 : 1,
        uphill = p.vx * slope < 0;
      const force = p.rolling ? (uphill ? 0.145 : 0.58) : 0.232;
      p.vx += (force * slope * wet) / (norm * norm);
    }
    const carry = surfaceVelocity(p.surface);
    p.x += carry.x;
    p.y += carry.y;
  }
}

function leaveSurface(s) {
  recordBlimpDeparture(s);
  const slope = pose(s).slope,
    carry = surfaceVelocity(s);
  p.vy = p.vx * slope + carry.y;
  p.coyoteLaunchVy = p.vy;
  p.vx += carry.x;
  p.ground = false;
  p.surface = null;
}

function moveAndResolveSurfaces() {
  const surfaceVy = p.ground && p.surface ? p.vx * pose(p.surface).slope : 0;
  const count = Math.max(
      1,
      Math.ceil(Math.max(Math.abs(p.vx), Math.abs(p.vy), Math.abs(surfaceVy)) / 24)
    ),
    dt = 1 / count;
  const lastX = p.x,
    lastY = p.y,
    deaths = stats.deaths;
  for (let i = 0; i < count; i++) {
    integrateSurfaceStep(dt);
    if (count > 1) resolveHazards(p.lastX, p.lastY);
    if (stats.deaths !== deaths) break;
  }
  p.lastX = lastX;
  p.lastY = lastY;
}

function integrateSurfaceStep(dt) {
  const oldX = p.x,
    oldY = p.y,
    oldFoot = feet(),
    oldSurface = p.surface,
    wasGround = p.ground;
  p.lastX = oldX;
  p.lastY = oldY;
  const nextX = p.x + p.vx * dt;
  p.x = Math.max(24, Math.min(END + 250, nextX));
  if (p.x !== nextX) p.vx = 0;
  // Follow connected slopes without launching or snapping across a void.
  if (wasGround && oldSurface && active(oldSurface)) {
    const q = pose(oldSurface);
    if (p.x >= q.x1 - FOOT_RADIUS && p.x <= q.x2 + FOOT_RADIUS) {
      p.y = yOn(oldSurface, Math.max(q.x1, Math.min(q.x2, p.x))) - 20;
      p.vy = 0;
    } else {
      let join = null;
      for (const s of level.surfaces) {
        if (!surfaceOverlaps(s, p.x, p.x) || !active(s)) continue;
        const z = pose(s),
          y = yOn(s, p.x);
        const seam = p.vx >= 0 ? q.x2 : q.x1,
          edgeY = p.vx >= 0 ? q.y2 : q.y1,
          connected = seam >= z.x1 - 2 && seam <= z.x2 + 2 && Math.abs(yOn(s, seam) - edgeY) < 2;
        if (p.x >= z.x1 && p.x <= z.x2 && (Math.abs(y - oldFoot) < 11 || connected)) {
          join = { s, y };
          break;
        }
      }
      if (join) land(join.s, join.y);
      else {
        leaveSurface(oldSurface);
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
    p.vy = p.airBoostActive
      ? 0
      : p.vy > 20
        ? 20 + (p.vy - 20) * Math.pow(0.999, dt)
        : Math.min(20, p.vy + 0.58 * (p.underwater ? 2 / 7 : 1) * dt);
    p.y += p.vy * dt;
    let hit = null;
    for (const s of level.surfaces) {
      if (!surfaceOverlaps(s, Math.min(oldX, p.x) - FOOT_RADIUS, Math.max(oldX, p.x) + FOOT_RADIUS))
        continue;
      if (p.wrongRouteDrop && !s.fallen) continue;
      if (
        !active(s) ||
        (s.entrySpeed &&
          !s.solidAtAnySpeed &&
          (Math.abs(p.vx) < s.entrySpeed ||
            (s.entryDirection && Math.sign(p.vx) !== s.entryDirection)))
      )
        continue;
      const q = pose(s),
        oldQ = pose(s, runFrames - 1);
      const oldFloor = oldQ.y1 + (oldX - oldQ.x1) * oldQ.slope,
        newFloor = yOn(s, p.x),
        d0 = oldFoot - oldFloor,
        d1 = feet() - newFloor;
      if (d0 > 5 || d1 < 0 || d1 - d0 <= 0) continue;
      const t = Math.max(0, -d0 / (d1 - d0)),
        crossX = oldX + (p.x - oldX) * t;
      const left = oldQ.x1 + (q.x1 - oldQ.x1) * t,
        right = oldQ.x2 + (q.x2 - oldQ.x2) * t;
      if (
        t <= 1 &&
        crossX >= left - FOOT_RADIUS &&
        crossX <= right + FOOT_RADIUS &&
        (!hit || t < hit.t)
      )
        hit = { s, q, t };
    }
    if (hit) {
      const x = Math.max(hit.q.x1, Math.min(hit.q.x2, p.x));
      land(hit.s, yOn(hit.s, x));
      if (p.ground && (p.x < hit.q.x1 - FOOT_RADIUS || p.x > hit.q.x2 + FOOT_RADIUS)) {
        leaveSurface(hit.s);
        coyote = tuning.coyote;
      }
      if (p.ground && p.rollBuffer > 0 && !p.rollSpent) {
        p.rolling = true;
        p.rollAge = 0;
        p.lowRollFrames = 0;
        p.rollBuffer = 0;
        stats.rolls++;
      }
    }
  }
  p.roll = p.rolling || charge > 0 || !p.ground;
}

const staticSurfacePoses = new WeakMap();
