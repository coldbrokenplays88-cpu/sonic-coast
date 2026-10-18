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

function surfaceBasis(s, t = runFrames) {
  const q = pose(s, t),
    dx = q.x2 - q.x1,
    dy = q.y2 - q.y1,
    length = Math.hypot(dx, dy);
  if (length < 1e-8) return null;
  return { ...q, length, tx: dx / length, ty: dy / length, nx: dy / length, ny: -dx / length };
}

function surfaceTravelSpeed() {
  if (p.loop) return p.loop.speed;
  if (p.ground && p.surface?.contactMode === 'oriented') return p.contactSpeed ?? 0;
  return p.ground && p.surface ? p.vx * Math.hypot(1, pose(p.surface).slope) : p.vx;
}

function groundSlopeForce(rolling, speed, tangentY) {
  return rolling ? (speed * tangentY < 0 ? 0.145 : 0.58) : 0.232;
}

function surfaceNormalReaction(speed, curvature, normalY, gravity) {
  return -speed * speed * curvature - gravity * normalY;
}

function loopPhysics(l) {
  if (l.profile === 'advanced') return { gravity: l.gravity ?? 0.58, drag: 0.0015 };
  return {
    gravity: Math.min(groundSlopeForce(false, 0, 0), (14 * 14) / (6.5 * l.r)),
    drag: 0.0015 * Math.min(1, 130 / l.r),
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
  let x1 = Math.min(s.x1, s.x2),
    x2 = Math.max(s.x1, s.x2);
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
    if (s.contactMode === 'oriented' || !surfaceOverlaps(s, x, x) || !active(s)) continue;
    const q = pose(s);
    if (x >= q.x1 && x <= q.x2) {
      const y = yOn(s, x);
      if (y >= below && (!result || y < result.y)) result = { s, y };
    }
  }
  return result;
}

function bodyHeight() {
  if (p.act1Motion && p.act1Motion.act === selectedAct)
    return p.act1Motion.posture === 'rolling' ? 38 : 48;
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

function land(s, y, contact = null) {
  const oriented = s.contactMode === 'oriented',
    basis = oriented ? surfaceBasis(s) : null;
  const contactSpeed = oriented ? (contact?.speed ?? p.vx * basis.tx + p.vy * basis.ty) : 0;
  p.scriptedLaunch = false;
  p.jumpReleaseVy = null;
  p.coyoteLaunchVy = null;
  p.airBoostUsed = false;
  p.airBoostFrames = 0;
  p.airBoostActive = false;
  beforeStageLanding(s);
  if (!s.grindable && !oriented) {
    const slope = pose(s).slope,
      norm = Math.hypot(1, slope);
    if (p.ground && p.surface?.contactMode === 'oriented') p.vx = p.contactSpeed / norm;
    else if (p.ground && p.surface) {
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
  if (oriented) {
    p.contactSpeed = contactSpeed;
    p.x = (contact?.x ?? p.x - basis.nx * 20) + basis.nx * 20;
    p.y = (contact?.y ?? y) + basis.ny * 20;
    p.vx = contactSpeed * basis.tx;
    p.vy = contactSpeed * basis.ty;
  } else p.contactSpeed = null;
  afterStageLanding(s);
  recordSurfaceLanding(s, changed);
  if (!reboundBubbleShield() && changed && jumpBuffer > 0) jump();
}

function recordSurfaceLanding(s, changed) {
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

function sweptBoxTime(ax, ay, bx, by, left, top, right, bottom) {
  let enter = 0,
    exit = 1;
  for (let axis = 0; axis < 2; axis++) {
    const a = axis ? ay : ax,
      d = axis ? by - ay : bx - ax,
      lo = axis ? top : left,
      hi = axis ? bottom : right;
    if (Math.abs(d) < 1e-10) {
      if (a < lo || a > hi) return null;
      continue;
    }
    const u = (lo - a) / d,
      v = (hi - a) / d;
    enter = Math.max(enter, Math.min(u, v));
    exit = Math.min(exit, Math.max(u, v));
    if (enter > exit) return null;
  }
  return enter;
}

function sweptCircleTime(ax, ay, bx, by, cx, cy, radius) {
  const x = ax - cx,
    y = ay - cy,
    dx = bx - ax,
    dy = by - ay,
    c = x * x + y * y - radius * radius;
  if (c <= 0) return 0;
  const a = dx * dx + dy * dy;
  if (a < 1e-10) return null;
  const b = x * dx + y * dy,
    disc = b * b - a * c;
  if (disc < 0) return null;
  const t = (-b - Math.sqrt(disc)) / a;
  return t >= 0 && t <= 1 ? t : null;
}

function spikeContact(h, oldX, oldY) {
  const direction = h.direction ?? 'up',
    height = bodyHeight(),
    halfWidth =
      p.act1Motion && p.act1Motion.act === selectedAct
        ? p.act1Motion.posture === 'rolling'
          ? 19
          : 11
        : 13;
  const nx = direction === 'left' ? -1 : direction === 'right' ? 1 : 0,
    ny = direction === 'up' ? -1 : direction === 'down' ? 1 : 0;
  const cx = nx < 0 ? h.x : nx > 0 ? h.x + h.w : h.x + h.w / 2,
    cy = ny < 0 ? h.y : ny > 0 ? h.y + h.h : h.y + h.h / 2;
  const half = height / 2,
    radius = Math.abs(nx) * halfWidth + Math.abs(ny) * half;
  const before = (oldX - cx) * nx + (oldY + 20 - half - cy) * ny - radius,
    after = (p.x - cx) * nx + (p.y + 20 - half - cy) * ny - radius;
  if (before < -0.01 || after > 0 || after > before) return false;
  const t = before === after ? 0 : before / (before - after),
    x = oldX + (p.x - oldX) * t,
    y = oldY + (p.y - oldY) * t + 20 - half;
  const along = nx ? y - cy : x - cx,
    span = nx ? h.h : h.w,
    extent = nx ? half : halfWidth;
  // Test the actual visible tooth tips, rather than the harmless casing rectangle.
  for (let start = 0; start < span; start += 20) {
    const tip = -span / 2 + start + Math.min(20, span - start) / 2;
    if (Math.abs(along - tip) <= extent) return true;
  }
  return false;
}

function resolveHazards(oldX, oldY) {
  for (const h of level.hazards) {
    if (h.broken) continue;
    if (h.type === 'spikes') {
      if (spikeContact(h, oldX, oldY)) hurt(h.x + h.w / 2);
      continue;
    }
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
    // Gantries remain solid during damage immunity. A correct roll keeps every bit of speed.
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

function applySurfaceMotion() {
  if (p.ground && p.surface?.contactMode === 'oriented') {
    const b = surfaceBasis(p.surface);
    p.contactSpeed +=
      groundSlopeForce(p.rolling, p.contactSpeed, b.ty) * b.ty * (p.underwater ? 2 / 7 : 1);
    p.vx = p.contactSpeed * b.tx;
    p.vy = p.contactSpeed * b.ty;
    const carry = surfaceVelocity(p.surface);
    p.x += carry.x;
    p.y += carry.y;
    if (
      b.ny >= -Math.SQRT1_2 &&
      Math.abs(p.contactSpeed) < 14 * (2.5 / 6) * (p.underwater ? 0.5 : 1)
    )
      leaveSurface(p.surface);
    return;
  }
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
      const wet = p.underwater ? 2 / 7 : 1;
      const force = groundSlopeForce(p.rolling, p.vx, slope);
      p.vx += (force * slope * wet) / (norm * norm);
    }
    const carry = surfaceVelocity(p.surface);
    p.x += carry.x;
    p.y += carry.y;
  }
}

function leaveSurface(s) {
  recordBlimpDeparture(s);
  if (s.contactMode === 'oriented') {
    const b = surfaceBasis(s),
      carry = surfaceVelocity(s);
    p.vx = p.contactSpeed * b.tx + carry.x;
    p.vy = p.contactSpeed * b.ty + carry.y;
    p.coyoteLaunchVy = p.vy;
    p.ground = false;
    p.surface = null;
    p.contactSpeed = null;
    return;
  }
  const slope = pose(s).slope,
    carry = surfaceVelocity(s);
  p.vy = p.vx * slope + carry.y;
  p.coyoteLaunchVy = p.vy;
  p.vx += carry.x;
  p.ground = false;
  p.surface = null;
}

function moveAndResolveSurfaces() {
  const surfaceVy =
    p.ground && p.surface && p.surface.contactMode !== 'oriented'
      ? p.vx * pose(p.surface).slope
      : 0;
  const count = Math.max(
      1,
      Math.ceil(Math.max(Math.abs(p.vx), Math.abs(p.vy), Math.abs(surfaceVy)) / 24)
    ),
    dt = 1 / count;
  const lastX = p.x,
    lastY = p.y,
    deaths = stats.deaths;
  for (let i = 0; i < count; i++) {
    const oldX = p.x,
      oldY = p.y,
      oldSurface = p.ground ? p.surface : null;
    integrateSurfaceStep(dt);
    resolveSpringContact(oldX, oldY, i / count, (i + 1) / count);
    resolveHazards(oldX, oldY);
    if (stats.deaths !== deaths) break;
    resolveMotionInteractions(oldX, oldY, oldSurface);
    if (stats.deaths !== deaths) break;
  }
  p.lastX = lastX;
  p.lastY = lastY;
}

function moveOrientedSurface(dt) {
  let remaining = p.contactSpeed * dt,
    s = p.surface;
  for (let joins = 0; joins <= level.surfaces.length; joins++) {
    if (!active(s)) {
      leaveSurface(s);
      return;
    }
    const b = surfaceBasis(s),
      pointX = p.x - b.nx * 20,
      pointY = p.y - b.ny * 20;
    const along = (pointX - b.x1) * b.tx + (pointY - b.y1) * b.ty;
    const next = along + remaining;
    if (next >= 0 && next <= b.length) {
      p.x = b.x1 + b.tx * next + b.nx * 20;
      p.y = b.y1 + b.ty * next + b.ny * 20;
      return;
    }
    const forward = remaining > 0,
      endX = forward ? b.x2 : b.x1,
      endY = forward ? b.y2 : b.y1;
    const beyond = forward ? next - b.length : next;
    let join = null;
    for (const candidate of level.surfaces) {
      if (candidate === s || !active(candidate)) continue;
      const c = surfaceBasis(candidate);
      if (!c) continue;
      if (Math.hypot((forward ? c.x1 : c.x2) - endX, (forward ? c.y1 : c.y2) - endY) < 2) {
        join = { s: candidate, b: c };
        break;
      }
    }
    if (!join) {
      const time = Math.min(dt, Math.abs(beyond) / Math.max(0.001, Math.abs(p.contactSpeed)));
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
    if (
      Math.abs(turn) > 0.00001 &&
      surfaceNormalReaction(speed, curvature, join.b.ny, groundSlopeForce(false, 0, 0)) < 0
    ) {
      const time = Math.min(dt, Math.abs(beyond) / Math.max(0.001, Math.abs(speed)));
      p.x = endX + b.nx * 20;
      p.y = endY + b.ny * 20;
      leaveSurface(s);
      p.x += p.vx * time;
      p.y += p.vy * time + 0.29 * (p.underwater ? 2 / 7 : 1) * time * time;
      p.vy += 0.58 * (p.underwater ? 2 / 7 : 1) * time;
      return;
    }
    if (join.s.contactMode !== 'oriented') {
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
  // A malformed chain must release contact rather than hang the fixed-tick loop.
  leaveSurface(s);
}

function sweptOrientedContact(oldX, oldY) {
  let hit = null;
  for (const s of level.surfaces) {
    if (s.contactMode !== 'oriented' || !active(s)) continue;
    const b = surfaceBasis(s),
      old = surfaceBasis(s, runFrames - 1);
    if (!b || !old) continue;
    const before = (oldX - old.x1) * old.nx + (oldY - old.y1) * old.ny - 20;
    const after = (p.x - b.x1) * b.nx + (p.y - b.y1) * b.ny - 20;
    if (before < -0.01 || after > 0 || after >= before) continue;
    const t = Math.max(0, before / (before - after)),
      x = oldX + (p.x - oldX) * t,
      y = oldY + (p.y - oldY) * t;
    const along =
      (x - (old.x1 + (b.x1 - old.x1) * t)) * b.tx + (y - (old.y1 + (b.y1 - old.y1) * t)) * b.ty;
    if (along < 0 || along > b.length || (hit && hit.t <= t)) continue;
    const carry = surfaceVelocity(s),
      speed = (p.vx - carry.x) * b.tx + (p.vy - carry.y) * b.ty;
    if (b.ny >= -Math.SQRT1_2 && Math.abs(speed) < 14 * (2.5 / 6) * (p.underwater ? 0.5 : 1))
      continue;
    hit = { s, t, x: b.x1 + along * b.tx, y: b.y1 + along * b.ty, speed };
  }
  return hit;
}

function integrateSurfaceStep(dt) {
  if (p.ground && p.surface?.contactMode === 'oriented') {
    p.lastX = p.x;
    p.lastY = p.y;
    moveOrientedSurface(dt);
    p.roll = p.rolling || charge > 0 || !p.ground;
    return;
  }
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
        if (s.contactMode === 'oriented' || !surfaceOverlaps(s, p.x, p.x) || !active(s)) continue;
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
        const forward = p.vx >= 0,
          edgeX = forward ? q.x2 : q.x1,
          edgeY = forward ? q.y2 : q.y1;
        const directed = level.surfaces.find(
          (s) =>
            s.contactMode === 'oriented' &&
            active(s) &&
            Math.hypot((forward ? s.x1 : s.x2) - edgeX, (forward ? s.y1 : s.y2) - edgeY) < 2
        );
        if (directed) {
          const speed = p.vx * Math.hypot(1, q.slope),
            b = surfaceBasis(directed),
            remainingTime = Math.min(
              dt,
              Math.abs(((p.x - edgeX) * Math.hypot(1, q.slope)) / speed)
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
    p.vy = p.airBoostActive
      ? 0
      : p.vy > 20
        ? 20 + (p.vy - 20) * Math.pow(0.999, dt)
        : Math.min(20, p.vy + 0.58 * (p.underwater ? 2 / 7 : 1) * dt);
    p.y += p.vy * dt;
    let hit = null;
    const directedHit = sweptOrientedContact(oldX, oldY);
    for (const s of level.surfaces) {
      if (s.contactMode === 'oriented') continue;
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
    if (directedHit && (!hit || directedHit.t < hit.t)) {
      land(directedHit.s, directedHit.y, directedHit);
    } else if (hit) {
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
