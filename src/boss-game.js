import { createEndingScene, tickEndingScene } from './ending-scene.js';
import {
  createEggScorpion,
  tickEggScorpion,
  scorpionGeometry,
  damageEggScorpion,
  scorpionDanger,
} from './egg-scorpion.js';
// Canonical runtime module. Classic VM compatibility is generated from this source.
import { state as runtimeState } from './state.js';
import { renderEggScorpion } from './boss-art.js';
import { drawPixelSign } from './city-polish.js';
import { endingArtReady, endingLoadErrors, retryEndingArt } from './ending-art.js';
import { $, BOOST_MAX, finishAct, gameSound, hurt, keys, notify, p, sparks } from './game.js';
import { cityPixelRect } from './pixel-world.js';

export function setupBossEncounter() {
  runtimeState.boss = null;
  runtimeState.bossCheckpoint = false;
  runtimeState.ending = null;
  $('#ending-loading').hidden = true;
  if (runtimeState.level.act !== 2) return;
  runtimeState.level.arena.boss = true;
  for (let i = 0; i < 12; i++)
    runtimeState.level.rings.push({
      x: runtimeState.level.arena.x + 460 + i * 22,
      y: runtimeState.level.arena.y - 38,
      taken: false,
      bossRing: true,
    });
}

export function bossOwnsControls() {
  return (
    runtimeState.ending ||
    (runtimeState.boss && ['entrance', 'destroyed', 'defeated'].includes(runtimeState.boss.state))
  );
}

export function resetBossAttempt() {
  runtimeState.ending = null;
  $('#ending-loading').hidden = true;
  if (!runtimeState.bossCheckpoint || runtimeState.level.act !== 2) return;
  runtimeState.boss = createEggScorpion(runtimeState.level.arena);
  runtimeState.boss.state = 'idle';
  runtimeState.boss.anchored = true;
  runtimeState.boss.age = 0;
  keys.clear();
  p.inv = 100;
  runtimeState.boost = BOOST_MAX;
}

export function beginEndingScene() {
  if (runtimeState.ending || runtimeState.level.act !== 2) return;
  runtimeState.ending = createEndingScene(runtimeState.level.arena, p, {
    x: runtimeState.cam,
    y: runtimeState.camY,
    zoom: runtimeState.zoom,
  });
  runtimeState.ending.waitFrames = 0;
  keys.clear();
  runtimeState.charge = 0;
  runtimeState.jumpBuffer = 0;
  p.vx = 0;
  p.vy = 0;
  p.boosting = false;
  runtimeState.shake = 0;
  runtimeState.toastTime = 0;
  $('#toast').style.display = 'none';
  $('#ending-loading').hidden = endingArtReady();
  $('#ending-retry').onclick = retryEndingArt;
}

export function updateEndingScene() {
  if (!endingArtReady()) {
    runtimeState.ending.waitFrames++;
    $('#ending-loading').hidden = false;
    $('#ending-retry').hidden = endingLoadErrors.size === 0;
    if (runtimeState.ending.waitFrames % 180 === 0) retryEndingArt();
    return;
  }
  $('#ending-loading').hidden = true;
  keys.clear();
  tickEndingScene(runtimeState.ending);
  const cues = {
    rocketFire: 'endingRocket',
    shadowTeleport: 'endingTeleport',
    kickImpact: 'endingKick',
    podExplosion: 'endingExplosion',
    jetpack: 'endingJetpack',
    emeraldOffer: 'endingEmerald',
    chaosCharge: 'endingCharge',
    chaosWarp: 'endingWarp',
    relievedSigh: 'endingSigh',
  };
  for (const event of runtimeState.ending.events) gameSound(cues[event]);
  if (runtimeState.ending.done) finishAct();
}

export function updateBossEncounter() {
  if (runtimeState.level.act !== 2) return;
  if (!runtimeState.boss) {
    if (p.ground && p.surface?.id === 'summit-arena' && p.x >= runtimeState.level.arena.x + 330) {
      runtimeState.boss = createEggScorpion(runtimeState.level.arena);
      runtimeState.boss.arrivalTime = runtimeState.clock;
      runtimeState.bossCheckpoint = true;
      const c = {
        x: runtimeState.level.arena.x + 410,
        y: runtimeState.level.arena.y,
        surfaceId: 'summit-arena',
        name: 'EGG SCORPION',
        hint: 'Jump at the eyes after the bite.',
      };
      runtimeState.level.checkpoints.push(c);
      runtimeState.checkpoint = runtimeState.level.checkpoints.length - 1;
      keys.clear();
      runtimeState.charge = 0;
      p.vx = 0;
      p.vy = 0;
      p.boosting = false;
      notify('EGG SCORPION');
      gameSound('bossReveal');
    }
    return;
  }
  tickEggScorpion(runtimeState.boss, p);
  if (runtimeState.boss.event === 'idle' && runtimeState.boss.sequence === 1) {
    gameSound('bossAnchor');
    runtimeState.shake = 6;
    sparks(runtimeState.boss.x - 155, runtimeState.boss.y, 18, '#b2b5c2');
    sparks(runtimeState.boss.x + 155, runtimeState.boss.y, 18, '#b2b5c2');
    notify('Dodge the strikes • Jump at the eyes after a bite');
  }
  if (['tail-windup', 'bite-windup', 'laser-windup'].includes(runtimeState.boss.event))
    gameSound('warning');
  if (runtimeState.boss.event === 'tail-strike') {
    gameSound('bossStrike');
    runtimeState.shake = 3;
  }
  if (runtimeState.boss.state === 'tail-strike' && runtimeState.boss.age === 9) {
    runtimeState.shake = 5;
    sparks(runtimeState.boss.target.x, runtimeState.boss.y, 20, '#ffbd76');
  }
  if (runtimeState.boss.event === 'bite-lunge') gameSound('bossBite');
  if (runtimeState.boss.event === 'laser-fire') gameSound('bossLaser');
  if (damageEggScorpion(runtimeState.boss, p)) {
    runtimeState.score += 1500;
    p.vy = -9;
    p.jumpAttack = false;
    p.poseJumpFrame = runtimeState.runFrames;
    p.inv = Math.max(p.inv, 24);
    runtimeState.shake = 5;
    gameSound('bossHit');
    const g = scorpionGeometry(runtimeState.boss);
    sparks(g.head.x, g.head.y, 24, '#6de7ff');
    if (runtimeState.boss.hits === 2) notify('GLASS SHATTERED • LASER TAIL ONLINE');
    if (runtimeState.boss.hits === 3) {
      keys.clear();
      p.vx = 0;
      runtimeState.charge = 0;
      gameSound('bossBreak');
    }
  } else if (!p.inv && scorpionDanger(runtimeState.boss, p))
    hurt(scorpionGeometry(runtimeState.boss).head.x);
  if (bossOwnsControls()) {
    keys.clear();
    runtimeState.charge = 0;
    p.vx = 0;
    p.boosting = false;
  } else {
    const left = runtimeState.level.arena.x + 250,
      right = runtimeState.level.arena.x + 1300;
    if (p.x < left) {
      p.x = left;
      p.vx = Math.max(0, p.vx);
    }
    if (p.x > right) {
      p.x = right;
      p.vx = Math.min(0, p.vx);
    }
  }
}

export function frameBossCamera() {
  if (!runtimeState.boss) return false;
  if (runtimeState.ending) {
    runtimeState.cam = runtimeState.ending.camera.x;
    runtimeState.camY = runtimeState.ending.camera.y;
    runtimeState.zoom = runtimeState.ending.camera.zoom;
    return true;
  }
  const targetZoom = 0.8;
  runtimeState.zoom += (targetZoom - runtimeState.zoom) * 0.035;
  const targetX = runtimeState.level.arena.x + 210,
    targetY = runtimeState.level.arena.y - 505;
  runtimeState.cam += Math.max(-14, Math.min(14, (targetX - runtimeState.cam) * 0.07));
  runtimeState.camY += Math.max(-12, Math.min(12, (targetY - runtimeState.camY) * 0.07));
  return true;
}

export function drawBossEncounter() {
  if (!runtimeState.boss || runtimeState.ending) return;
  renderEggScorpion(runtimeState.boss);
  if (!['entrance', 'destroyed', 'defeated'].includes(runtimeState.boss.state)) {
    drawPixelSign(
      runtimeState.level.arena.x + 760,
      runtimeState.level.arena.y - 400,
      'EGG SCORPION',
      'danger'
    );
    for (let i = 0; i < 3; i++)
      cityPixelRect(
        runtimeState.level.arena.x + 690 + i * 48,
        runtimeState.level.arena.y - 380,
        36,
        6,
        i < 3 - runtimeState.boss.hits ? '#ff614d' : '#354052'
      );
  }
}
export function initializeRuntimeModule() {
  /* Glue to existing movement, checkpoint, camera and result systems. */
  runtimeState.boss = null;
  /* Glue to existing movement, checkpoint, camera and result systems. */
  runtimeState.bossCheckpoint = false;
  /* Glue to existing movement, checkpoint, camera and result systems. */
  runtimeState.ending = null;
}
export function getRuntimeBindings() {
  return {
    setupBossEncounter: {
      get: () => setupBossEncounter,
      set: (value) => {
        setupBossEncounter = value;
      },
    },
    bossOwnsControls: {
      get: () => bossOwnsControls,
      set: (value) => {
        bossOwnsControls = value;
      },
    },
    resetBossAttempt: {
      get: () => resetBossAttempt,
      set: (value) => {
        resetBossAttempt = value;
      },
    },
    beginEndingScene: {
      get: () => beginEndingScene,
      set: (value) => {
        beginEndingScene = value;
      },
    },
    updateEndingScene: {
      get: () => updateEndingScene,
      set: (value) => {
        updateEndingScene = value;
      },
    },
    updateBossEncounter: {
      get: () => updateBossEncounter,
      set: (value) => {
        updateBossEncounter = value;
      },
    },
    frameBossCamera: {
      get: () => frameBossCamera,
      set: (value) => {
        frameBossCamera = value;
      },
    },
    drawBossEncounter: {
      get: () => drawBossEncounter,
      set: (value) => {
        drawBossEncounter = value;
      },
    },
  };
}
