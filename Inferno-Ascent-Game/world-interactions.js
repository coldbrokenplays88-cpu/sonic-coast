// Generated from src/world-interactions.js; run npm run build:compat after source edits.
'use strict';
function configureDirectionalSpikes(level) {
  level.hazards = level.hazards.flatMap((h) => {
    if (
      h.type !== 'spikes' ||
      h.direction ||
      !(
        /^spike-\d+$/.test(h.id) ||
        ['under-attack-spike-1', 'split-skyline-spike-204'].includes(h.id)
      )
    )
      return [h];
    const floor = h.y + h.h,
      depth = 12,
      height = 32;
    return [
      { ...h, direction: 'left', y: floor - height, w: depth, h: height },
      {
        id: h.id + '-mount',
        type: 'bulkhead',
        spikeMount: true,
        x: h.x + depth,
        y: floor - height,
        w: h.w - 2 * depth,
        h: height,
        kind: 'solid',
        x1: h.x + depth,
        x2: h.x + h.w - depth,
        y1: floor - height,
        y2: floor - height,
      },
      {
        ...h,
        id: h.id + '-right',
        direction: 'right',
        x: h.x + h.w - depth,
        y: floor - height,
        w: depth,
        h: height,
      },
    ];
  });
  return level;
}

function updateWorldPlatforms() {
  for (const s of level.surfaces) {
    if (s.restoreAt && runFrames >= s.restoreAt) {
      s.restoreAt = 0;
      s.crumbleTimer = -1;
    }
    if (s.crumbleTimer >= 0 && !s.restoreAt) {
      s.crumbleTimer--;
      if (s.crumbleTimer === 0) {
        s.restoreAt = runFrames + 240;
        s.crumbleTimer = -1;
        sparks((s.x1 + s.x2) / 2, s.y1, 10, '#ffac54');
      }
    }
  }
}

function collectWorldRings(oldX = p.x, oldY = p.y) {
  for (const r of rings)
    if (
      !r.taken &&
      (!r.sealedBy || level.hazards.find((h) => h.id === r.sealedBy)?.broken) &&
      sweptCircleTime(oldX, oldY, p.x, p.y, r.x, r.y, 29) !== null
    ) {
      r.taken = true;
      count++;
      score += 100;
      gameSound('ring');
      sparks(r.x, r.y, 3);
    }
}

function activateWorldDevices() {
  for (const pad of level.pads)
    if (
      p.ground &&
      Math.abs(p.x - pad.x) < 25 &&
      Math.abs(feet() - pad.y) < 8 &&
      (pad.cityVent || pad.poolBooster || p.vx > 0) &&
      (!pad.sealedBy || level.hazards.find((h) => h.id === pad.sealedBy)?.broken)
    ) {
      if (pad.poolBooster) {
        p.vx = Math.max(p.vx, pad.launchX);
        p.rolling = true;
        p.roll = true;
        p.rollAge = 0;
        p.poolExit = true;
        pad.firedAt = runFrames;
        gameSound('pool', { launch: true });
      } else if (pad.cityVent) launchAirDevice(pad);
      else p.vx = Math.max(p.vx, 18.5);
    }
}

function springFace(d, t = runFrames) {
  const s = level.surfaces.find((s) => s.id === d.surfaceId),
    q = s ? pose(s, t) : null;
  const x = d.x + (q ? q.x1 - s.x1 : 0),
    y = q ? q.y1 + (d.x - s.x1) * q.slope : d.y;
  const angle = (polishDirection(d) * Math.PI) / 8,
    nx = Math.sin(angle),
    ny = -Math.cos(angle);
  const offset = 40 - [0, 4, -9, -6, -3, 1][polishedSpringFrame(d)] * 2;
  return { x: x + nx * offset, y: y + ny * offset, nx, ny, tx: -ny, ty: nx };
}

function resolveSpringContact(oldX, oldY, t0 = 0, t1 = 1) {
  if (p.loop || p.wrongRouteDrop || bossOwnsControls()) return;
  const half = bodyHeight() / 2,
    centerY = p.y + 20 - half,
    oldCenterY = oldY + 20 - half;
  let hit = null;
  for (const d of level.springs || []) {
    if (d.id === 'blimp-entry-spring' && !qualifyingBlimpEntry()) continue;
    if (d.id === 'blimp-return-spring' && !level.blimpRoute?.entered) continue;
    const b = springFace(d, runFrames - 1 + t0),
      c = springFace(d, runFrames - 1 + t1);
    const radius = Math.abs(c.nx) * 13 + Math.abs(c.ny) * half;
    const before = (oldX - b.x) * c.nx + (oldCenterY - b.y) * c.ny - radius,
      after = (p.x - c.x) * c.nx + (centerY - c.y) * c.ny - radius;
    const flush = p.ground && Math.abs(before) < 1e-8 && Math.abs(after) < 1e-8;
    if (!flush && (before < -0.01 || after > 0 || after >= before)) continue;
    // Only the body's leading point/edge can strike the cap. Casing-side overlaps do not count.
    const vx = Math.abs(c.nx) < 1e-8 ? 0 : -Math.sign(c.nx) * 13,
      vy = Math.abs(c.ny) < 1e-8 ? 0 : -Math.sign(c.ny) * half;
    const edge =
      (Math.abs(c.nx) < 1e-8 ? 13 * Math.abs(c.tx) : 0) +
      (Math.abs(c.ny) < 1e-8 ? half * Math.abs(c.ty) : 0);
    const from = (oldX + vx - b.x) * c.tx + (oldCenterY + vy - b.y) * c.ty,
      to = (p.x + vx - c.x) * c.tx + (centerY + vy - c.y) * c.ty;
    // A grounded, coplanar crossing must bounce too; it cannot run along the active cap.
    const t = flush
      ? sweptBoxTime(from, 0, to, 0, -24 - edge, -1, 24 + edge, 1)
      : before / (before - after);
    if (t === null) continue;
    const x = oldX + (p.x - oldX) * t,
      y = oldCenterY + (centerY - oldCenterY) * t,
      tangent = from + (to - from) * t;
    if (Math.abs(tangent) > 24 + edge || (hit && hit.t <= t)) continue;
    hit = { d, t, x, y: y - 20 + half };
  }
  if (!hit) return;
  p.x = hit.x;
  p.y = hit.y;
  if (hit.d.id === 'blimp-entry-spring') level.blimpRoute.entered = true;
  launchAirDevice(hit.d);
}

function resolveMotionInteractions(oldX, oldY, oldSurface = null) {
  if (bossOwnsControls()) return;
  const deaths = stats.deaths;
  p.interactionsFrame = runFrames;
  collectWorldRings(oldX, oldY);
  if (!p.loop) activateWorldDevices();
  collectBoostMonitors(oldX, oldY);
  updateWorldEnemies(oldX, oldY);
  if (stats.deaths === deaths) updateWorldCheckpoints(oldX, oldY, oldSurface);
}

function updateWorldEnemies(oldX = p.x, oldY = p.y) {
  for (const e of enemies) {
    if (!e.alive) continue;
    e.x = e.base + Math.sin(runFrames * 0.018 + e.phase) * e.range;
    e.y =
      e.baseY + (e.kind === 'drone' ? Math.sin(runFrames * 0.027 + e.phase) * 12 : 0);
    const contact = sweptCircleTime(oldX, oldY, p.x, p.y, e.x, e.y, 33);
    if (contact !== null) {
      const stomp = p.vy > 0 && oldY + (p.y - oldY) * contact + 20 <= e.y + 12 && !e.jumpImmune,
        jumpHit = !p.ground && p.jumpAttack && p.hurt === 0 && !e.jumpImmune;
      if (p.boosting || (p.ground && p.roll && Math.abs(p.vx) > 3) || stomp || jumpHit) {
        e.alive = false;
        score += 500;
        sparks(e.x, e.y, 14, '#ff9556');
        if (stomp && !p.boosting && e.rebound !== false) {
          p.vy = p.jumpHeld ? -16 : -8;
          p.poseJumpFrame = runFrames;
          p.ground = false;
          p.surface = null;
          stats.rebound++;
          gameSound('enemy');
        } else gameSound('enemy');
      } else if (!p.inv) {
        hurt(e.x);
        handleStageEnemyDamage(e);
      }
    }
  }
}

function updateWorldCheckpoints(oldX = p.x, oldY = p.y, oldSurface = null) {
  for (let i = checkpoint + 1; i < level.checkpoints.length; i++) {
    const c = level.checkpoints[i];
    const crossed =
      oldSurface &&
      oldX <= c.x &&
      p.x >= c.x &&
      ['main', 'express'].includes(oldSurface.kind) &&
      (!level.verticalCity || oldSurface.id === c.surfaceId) &&
      c.x >= pose(oldSurface).x1 &&
      c.x <= pose(oldSurface).x2 &&
      Math.abs(yOn(oldSurface, c.x) - c.y) < 150;
    if (
      crossed ||
      (p.x >= c.x &&
        p.ground &&
        ['main', 'express'].includes(p.surface?.kind) &&
        (!level.verticalCity || p.surface.id === c.surfaceId) &&
        Math.abs(feet() - c.y) < 150)
    ) {
      checkpoint = i;
      stage = i;
      if (level.act !== 2)
        notify(
          c.hint ||
            level.sectors[level.sectors.findLastIndex((s) => s.x <= c.x)]
              .hint
        );
      gameSound('checkpoint');
    }
  }
  stage = Math.max(
    0,
    level.sectors.findLastIndex((s) => p.x >= s.x)
  );
}
