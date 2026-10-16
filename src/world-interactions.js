// Canonical runtime module. Classic VM compatibility is generated from this source.
import { state as runtimeState } from './state.js';
import { launchAirDevice } from './act2.js';
import { blimpSpringContact, qualifyingBlimpEntry } from './blimp-route.js';
import { airDevicePose } from './boost-rules.js';
import { gameSound, hurt, notify, p, sparks } from './game.js';
import { handleStageEnemyDamage } from './stage-runtime.js';
import { feet } from './surface-collision.js';

// Existing world interactions, invoked synchronously in the controller's tick order.

export function updateWorldPlatforms() {
  for (const s of runtimeState.level.surfaces) {
    if (s.restoreAt && runtimeState.runFrames >= s.restoreAt) {
      s.restoreAt = 0;
      s.crumbleTimer = -1;
    }
    if (s.crumbleTimer >= 0 && !s.restoreAt) {
      s.crumbleTimer--;
      if (s.crumbleTimer === 0) {
        s.restoreAt = runtimeState.runFrames + 240;
        s.crumbleTimer = -1;
        sparks((s.x1 + s.x2) / 2, s.y1, 10, '#ffac54');
      }
    }
  }
}

export function collectWorldRings() {
  for (const r of runtimeState.rings)
    if (
      !r.taken &&
      (!r.sealedBy || runtimeState.level.hazards.find((h) => h.id === r.sealedBy)?.broken) &&
      Math.hypot(r.x - p.x, r.y - p.y) < 29
    ) {
      r.taken = true;
      runtimeState.count++;
      runtimeState.score += 100;
      gameSound('ring');
      sparks(r.x, r.y, 3);
    }
}

export function activateWorldDevices() {
  for (const pad of runtimeState.level.pads)
    if (
      p.ground &&
      Math.abs(p.x - pad.x) < 25 &&
      Math.abs(feet() - pad.y) < 8 &&
      (pad.cityVent || pad.poolBooster || p.vx > 0) &&
      (!pad.sealedBy || runtimeState.level.hazards.find((h) => h.id === pad.sealedBy)?.broken)
    ) {
      if (pad.poolBooster) {
        p.vx = Math.max(p.vx, pad.launchX);
        p.rolling = true;
        p.roll = true;
        p.rollAge = 0;
        p.poolExit = true;
        pad.firedAt = runtimeState.runFrames;
        gameSound('pool', { launch: true });
      } else if (pad.cityVent) launchAirDevice(pad);
      else p.vx = Math.max(p.vx, 18.5);
    }
  for (const spring of runtimeState.level.springs || []) {
    const device = airDevicePose(spring);
    const grounded =
      p.ground && p.surface?.id === spring.surfaceId && Math.abs(p.x - device.x) < 23;
    if (spring.id === 'blimp-entry-spring') {
      if (qualifyingBlimpEntry() && (grounded || blimpSpringContact(device))) {
        runtimeState.level.blimpRoute.entered = true;
        launchAirDevice(spring);
      }
    } else if (
      grounded &&
      (spring.id !== 'blimp-return-spring' || runtimeState.level.blimpRoute?.entered)
    )
      launchAirDevice(spring);
  }
}

export function updateWorldEnemies() {
  for (const e of runtimeState.enemies) {
    if (!e.alive) continue;
    e.x = e.base + Math.sin(runtimeState.runFrames * 0.018 + e.phase) * e.range;
    e.y =
      e.baseY + (e.kind === 'drone' ? Math.sin(runtimeState.runFrames * 0.027 + e.phase) * 12 : 0);
    if (Math.hypot(p.x - e.x, p.y - e.y) < 33) {
      const stomp = p.vy > 0 && feet() <= e.y + 12 && !e.jumpImmune,
        jumpHit = !p.ground && p.jumpAttack && p.hurt === 0 && !e.jumpImmune;
      if (p.boosting || (p.ground && p.roll && Math.abs(p.vx) > 3) || stomp || jumpHit) {
        e.alive = false;
        runtimeState.score += 500;
        sparks(e.x, e.y, 14, '#ff9556');
        if (stomp && !p.boosting && e.rebound !== false) {
          p.vy = p.jumpHeld ? -16 : -8;
          p.poseJumpFrame = runtimeState.runFrames;
          p.ground = false;
          p.surface = null;
          runtimeState.stats.rebound++;
          gameSound('enemy');
        } else gameSound('enemy');
      } else if (!p.inv) {
        hurt(e.x);
        handleStageEnemyDamage(e);
      }
    }
  }
}

// Checkpoints require a safe main-road landing; falling past a marker cannot skip a challenge.
export function updateWorldCheckpoints() {
  for (let i = runtimeState.checkpoint + 1; i < runtimeState.level.checkpoints.length; i++) {
    const c = runtimeState.level.checkpoints[i];
    if (
      p.x >= c.x &&
      p.ground &&
      ['main', 'express'].includes(p.surface?.kind) &&
      (!runtimeState.level.verticalCity || p.surface.id === c.surfaceId) &&
      Math.abs(feet() - c.y) < 150
    ) {
      runtimeState.checkpoint = i;
      runtimeState.stage = i;
      if (runtimeState.level.act !== 2)
        notify(
          c.hint ||
            runtimeState.level.sectors[runtimeState.level.sectors.findLastIndex((s) => s.x <= c.x)]
              .hint
        );
      gameSound('checkpoint');
    }
  }
  runtimeState.stage = Math.max(
    0,
    runtimeState.level.sectors.findLastIndex((s) => p.x >= s.x)
  );
}
export function initializeRuntimeModule() {}
export function getRuntimeBindings() {
  return {
    updateWorldPlatforms: {
      get: () => updateWorldPlatforms,
      set: (value) => {
        updateWorldPlatforms = value;
      },
    },
    collectWorldRings: {
      get: () => collectWorldRings,
      set: (value) => {
        collectWorldRings = value;
      },
    },
    activateWorldDevices: {
      get: () => activateWorldDevices,
      set: (value) => {
        activateWorldDevices = value;
      },
    },
    updateWorldEnemies: {
      get: () => updateWorldEnemies,
      set: (value) => {
        updateWorldEnemies = value;
      },
    },
    updateWorldCheckpoints: {
      get: () => updateWorldCheckpoints,
      set: (value) => {
        updateWorldCheckpoints = value;
      },
    },
  };
}
