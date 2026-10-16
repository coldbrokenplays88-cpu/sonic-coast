// Generated from src/world-interactions.js; run npm run build:compat after source edits.
'use strict';
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

function collectWorldRings() {
  for (const r of rings)
    if (
      !r.taken &&
      (!r.sealedBy || level.hazards.find((h) => h.id === r.sealedBy)?.broken) &&
      Math.hypot(r.x - p.x, r.y - p.y) < 29
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
  for (const spring of level.springs || []) {
    const device = airDevicePose(spring);
    const grounded =
      p.ground && p.surface?.id === spring.surfaceId && Math.abs(p.x - device.x) < 23;
    if (spring.id === 'blimp-entry-spring') {
      if (qualifyingBlimpEntry() && (grounded || blimpSpringContact(device))) {
        level.blimpRoute.entered = true;
        launchAirDevice(spring);
      }
    } else if (
      grounded &&
      (spring.id !== 'blimp-return-spring' || level.blimpRoute?.entered)
    )
      launchAirDevice(spring);
  }
}

function updateWorldEnemies() {
  for (const e of enemies) {
    if (!e.alive) continue;
    e.x = e.base + Math.sin(runFrames * 0.018 + e.phase) * e.range;
    e.y =
      e.baseY + (e.kind === 'drone' ? Math.sin(runFrames * 0.027 + e.phase) * 12 : 0);
    if (Math.hypot(p.x - e.x, p.y - e.y) < 33) {
      const stomp = p.vy > 0 && feet() <= e.y + 12 && !e.jumpImmune,
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

function updateWorldCheckpoints() {
  for (let i = checkpoint + 1; i < level.checkpoints.length; i++) {
    const c = level.checkpoints[i];
    if (
      p.x >= c.x &&
      p.ground &&
      ['main', 'express'].includes(p.surface?.kind) &&
      (!level.verticalCity || p.surface.id === c.surfaceId) &&
      Math.abs(feet() - c.y) < 150
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
