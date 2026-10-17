// Canonical runtime module. Classic VM compatibility is generated from this source.
import { state as runtimeState } from './state.js';
import {
  usesAct1Motion,
  updateAct1Movement,
  releaseAct1,
  projectAct1Motion,
  adoptAct1Interaction,
} from './act1-motion.js';
import { updateLoop } from './act2.js';
import { recordBlimpJump } from './blimp-route.js';
import { surfaceById, updateBoostState } from './boost-rules.js';
import { JUMP_KEYS, die, gameSound, keys, movementTuning, p, sparks, tuning } from './game.js';
import { stageDeathLimit, updateStageMotion } from './stage-runtime.js';
import {
  applySurfaceMotion,
  canStand,
  feet,
  moveAndResolveSurfaces,
  pose,
  surfaceVelocity,
  surfaceBasis,
  surfaceTravelSpeed,
  yOn,
} from './surface-collision.js';

// Shared player movement. State and the fixed-tick controller remain in game.js.

export function jump() {
  if (usesAct1Motion()) {
    adoptAct1Interaction(p.act1Motion);
    if (p.act1Motion.mode === 'grounded') {
      releaseAct1(p.act1Motion, 'jump', true, runtimeState.runFrames);
      projectAct1Motion(p.act1Motion);
    }
    return;
  }
  p.scriptedLaunch = false;
  p.jumpAttack = true;
  if (p.surface?.grindable) p.grindExitFrame = runtimeState.runFrames;
  p.poseJumpFrame = runtimeState.runFrames;
  if (p.ground && p.surface?.contactMode === 'oriented') {
    const b = surfaceBasis(p.surface),
      carry = surfaceVelocity(p.surface),
      speed = p.contactSpeed;
    const impulse =
      (p.jumpCut ? 6.8 : 13.4 + Math.min(2.4, Math.max(0, Math.abs(speed) - 14) * 0.25)) *
      (p.underwater ? 7 / 13 : 1);
    p.vx = speed * b.tx + carry.x + impulse * b.nx;
    p.vy = speed * b.ty + carry.y + impulse * b.ny;
    p.jumpReleaseVy = speed * b.ty + carry.y + (p.underwater ? 2.5 : 5) * b.ny;
    p.ground = false;
    p.surface = null;
    p.contactSpeed = null;
    runtimeState.coyote = 0;
    runtimeState.jumpBuffer = 0;
    runtimeState.stats.jumps++;
    gameSound('jump');
    return;
  }
  const surface = p.ground ? p.surface : null,
    slope = surface ? pose(surface).slope : 0,
    norm = Math.hypot(1, slope),
    speed = p.vx * norm;
  recordBlimpJump(surface, speed);
  const lift = p.jumpCut ? 6.8 : 13.4 + Math.min(2.4, Math.max(0, Math.abs(speed) - 14) * 0.25),
    impulse = lift * (p.underwater ? 7 / 13 : 1);
  // Keep the full surface/platform velocity; an upright jump adds vertical lift.
  const carry = surface ? surfaceVelocity(surface) : { x: 0, y: 0 };
  const inherited =
    (surface ? p.vx * slope : runtimeState.coyote > 0 ? (p.coyoteLaunchVy ?? 0) : 0) + carry.y;
  p.vy = inherited - impulse;
  p.vx += carry.x;
  p.jumpReleaseVy = inherited - (p.underwater ? 2.5 : 5);
  p.ground = false;
  p.surface = null;
  runtimeState.coyote = 0;
  runtimeState.jumpBuffer = 0;
  runtimeState.stats.jumps++;
  gameSound('jump');
}

export function stopRollAtRest() {
  // Sonic 2 RollSpeed: Down release does not uncurl; grounded rest does.
  if (
    p.rolling &&
    p.ground &&
    !runtimeState.charge &&
    Math.abs(surfaceTravelSpeed()) < 0.03 &&
    p.rollAge > 1 &&
    canStand()
  ) {
    p.rolling = false;
    p.roll = false;
    p.dashRolling = false;
    p.rollSpent = true;
  }
}

export function updateRoll(down) {
  if (!p.rolling) p.dashRolling = false;
  if (down && !p.downHeld) {
    p.rollBuffer = 6;
    p.rollSpent = false;
  }
  if (!down) p.rollSpent = false;
  p.downHeld = down;
  if (p.ground && !p.surface?.grindable && p.rollBuffer > 0 && !p.rollSpent && !p.rolling) {
    p.rolling = true;
    p.rollAge = 0;
    p.lowRollFrames = 0;
    p.rollBuffer = 0;
    runtimeState.stats.rolls++;
  }
  if (p.rollBuffer > 0) p.rollBuffer--;
  if (p.rolling) {
    p.rollAge++;
    stopRollAtRest();
  }
  p.roll = p.rolling || runtimeState.charge > 0 || !p.ground;
}

export function updateMovement() {
  if (usesAct1Motion()) return updateAct1Movement();
  updateWaterState();
  if (updateStageMotion()) return true;
  if (p.loop) return updateLoop();
  const waterScale = p.underwater ? 0.5 : 1,
    runSpeed = 14 * waterScale,
    beforeSpeed = Math.abs(p.vx),
    recoveryGrip = p.ground && ['recovery', 'lower'].includes(p.surface?.kind);
  const down = keys.has('ArrowDown') || keys.has('KeyS');
  const dir =
    Number(keys.has('ArrowRight') || keys.has('KeyD')) -
    Number(keys.has('ArrowLeft') || keys.has('KeyA'));
  updateRoll(down);
  if (p.ground) runtimeState.coyote = tuning.coyote;
  else if (runtimeState.coyote > 0) runtimeState.coyote--;
  if (runtimeState.jumpBuffer > 0 && runtimeState.coyote > 0 && !runtimeState.charge) jump();
  else if (runtimeState.jumpBuffer > 0) runtimeState.jumpBuffer--;
  if (runtimeState.charge && down && JUMP_KEYS.some((k) => keys.has(k))) {
    runtimeState.charge = Math.min(20, runtimeState.charge + 0.2);
    if (runtimeState.runFrames % 10 === 0) {
      sparks(p.x - 15 * p.face, p.y + 18, 3, '#69efff');
      if (typeof gameSound === 'function')
        gameSound('spindashCharge', { charge: runtimeState.charge / 20 });
    }
  }
  if (runtimeState.charge && !down) {
    gameSound('spindashRelease', { charge: runtimeState.charge / 20 });
    const releaseSpeed = p.face * (12 + runtimeState.charge * 0.35);
    if (p.surface?.contactMode === 'oriented') p.contactSpeed = releaseSpeed;
    else p.vx = releaseSpeed / Math.hypot(1, p.surface ? pose(p.surface).slope : 0);
    runtimeState.charge = 0;
    p.rolling = true;
    p.dashRolling = true;
    p.rollAge = 0;
    p.lowRollFrames = 0;
    sparks(p.x, p.y + 15, 10, '#4bd9ff');
  }
  const wantBoost =
    keys.has('ShiftLeft') || keys.has('ShiftRight') || keys.has('KeyX') || keys.has('MouseBoost');
  if (!wantBoost) p.boostLocked = false;
  updateBoostState(wantBoost);
  // Controls act on speed along the ground; vx stays world-horizontal outside this block.
  const controlSurface = p.ground && !p.surface?.grindable ? p.surface : null,
    oriented = controlSurface?.contactMode === 'oriented',
    basis = oriented ? surfaceBasis(controlSurface) : null,
    controlSlope = oriented
      ? basis.ty / Math.max(0.000001, Math.abs(basis.tx))
      : controlSurface
        ? pose(controlSurface).slope
        : 0,
    controlNorm = oriented ? 1 : Math.hypot(1, controlSlope);
  if (oriented) p.vx = p.contactSpeed;
  else if (controlSurface) p.vx *= controlNorm;
  // Classic Sonic loses uphill traction above 45 degrees at low ground speed.
  // Our one-way slope contacts slide back instead of imposing a forced input lock.
  const uphillTractionLost =
    controlSurface &&
    !p.scriptedLaunch &&
    !p.wrongRouteDrop &&
    !p.surface?.boostExit &&
    dir * controlSlope < 0 &&
    Math.abs(controlSlope) >= 1 &&
    Math.abs(p.vx) < runSpeed * (2.5 / 6);
  if (p.boosting) {
    if (dir && Math.sign(p.vx) === dir) p.face = dir;
    if (p.vx * p.face < 23) p.vx += (p.face * 23 - p.vx) * 0.14;
    if (runtimeState.runFrames % 3 === 0)
      runtimeState.particles.push({
        x: p.x - 25 * p.face,
        y: p.y,
        vx: -p.face * 2,
        vy: 0,
        life: 14,
        color: '#43e5ff',
        trail: true,
      });
  } else if (p.ground && p.surface?.grindable) {
    p.rolling = false;
    p.roll = false;
    runtimeState.charge = 0;
    if (dir && dir !== Math.sign(p.vx)) p.vx += dir * 0.45;
    else if (dir && Math.abs(p.vx) < 14) p.vx += dir * 0.08;
  } else if (runtimeState.charge) p.vx *= 0.66;
  else {
    const precisionBrake =
      !p.rolling &&
      !p.scriptedLaunch &&
      !p.wrongRouteDrop &&
      (!p.surface?.boostExit || p.surface.kind === 'main');
    if (!p.hurt && dir) {
      if (p.ground && p.rolling) {
        if (dir !== Math.sign(p.vx) && Math.abs(p.vx) > 0) {
          p.vx +=
            dir *
            Math.min(
              Math.abs(p.vx),
              waterScale *
                (Math.abs(p.vx) <= 8 ? (recoveryGrip ? 1.3 : 0.85) : recoveryGrip ? 1.1 : 0.5)
            );
          p.face = dir;
        } else if (Math.abs(p.vx) < 3 && !uphillTractionLost)
          p.vx = Math.max(-3, Math.min(3, p.vx + dir * 0.16 * waterScale));
      } else if (Math.abs(p.vx) < runSpeed || dir !== Math.sign(p.vx)) {
        const speed = Math.min(1, Math.abs(p.vx) / runSpeed),
          opposing = dir !== Math.sign(p.vx) && Math.abs(p.vx) > (precisionBrake ? 0 : 0.1);
        let a = p.ground
          ? opposing
            ? recoveryGrip
              ? Math.abs(p.vx) <= 14
                ? 2.5
                : 1.4
              : Math.abs(p.vx) < 8
                ? 1
                : 0.82
            : 0.52 * Math.pow(1 - speed, 1.5) + 0.035
          : opposing
            ? 0.2
            : 0.12;
        // Countersteering stops at zero; normal acceleration begins on the next frame.
        // Intentional propulsion retains its previous steering and friction.
        // Uphill propulsion weakens with inclination; deliberate braking keeps its tuned strength.
        a *= waterScale / (opposing ? 1 : controlNorm);
        if (!opposing && uphillTractionLost) a = 0;
        if (opposing && precisionBrake)
          a = Math.min(Math.abs(p.vx), a * movementTuning.counterBrake);
        p.vx += dir * a;
        p.face = dir;
        if (Math.abs(p.vx) > runSpeed && dir === Math.sign(p.vx)) p.vx = dir * runSpeed;
      }
    } else if (p.ground) {
      if (!p.rolling) {
        const drag =
          precisionBrake && Math.abs(p.vx) < movementTuning.precisionSpeed
            ? recoveryGrip
              ? movementTuning.recoveryGrip
              : movementTuning.groundGrip
            : Math.abs(p.vx) <= 8
              ? recoveryGrip
                ? 0.65
                : 0.5
              : recoveryGrip
                ? 0.4
                : 0.22 + (Math.abs(p.vx) - 8) * 0.002;
        p.vx = Math.sign(p.vx) * Math.max(0, Math.abs(p.vx) - drag * waterScale);
      }
    }
    if (Math.abs(p.vx) > 14 && !p.surface?.boostExit && (!p.ground || !p.rolling))
      p.vx *= p.ground ? 0.998 : 0.999;
  }
  if (p.ground && p.rolling) {
    // Classic rolling friction is .0234375; scale by our 14/6 running baseline.
    // Retain the existing speed-proportional loss as well; never reverse at rest.
    p.vx = Math.sign(p.vx) * Math.max(0, Math.abs(p.vx) - ((0.0234375 * 14) / 6) * waterScale);
    p.vx *= 0.9985;
  }
  // Normal controls cannot accelerate past run speed; existing rolling friction
  // bounds long descents without an arbitrary terrain-speed threshold.
  if (controlSurface) {
    p.vx /= controlNorm;
  }
  if (oriented) {
    p.contactSpeed = p.vx;
    p.vx = p.contactSpeed * basis.tx;
    p.vy = p.contactSpeed * basis.ty;
  }
  applySurfaceMotion();
  if (Math.abs(p.vx) < 0.03) p.vx = 0;
  runtimeState.stats.maxSpeed = Math.max(
    runtimeState.stats.maxSpeed,
    Math.abs(p.surface?.contactMode === 'oriented' ? p.contactSpeed : p.vx)
  );
  runtimeState.anim +=
    Math.abs(p.surface?.contactMode === 'oriented' ? p.contactSpeed : p.vx) * 0.08;
  if (!p.ground && p.airSpeedLimit)
    p.vx = Math.max(-p.airSpeedLimit, Math.min(p.airSpeedLimit, p.vx));
  moveAndResolveSurfaces();
  stopRollAtRest();
  updateBrakingPose(dir, beforeSpeed);
  if (p.ground && p.surface?.grindable && Math.abs(p.vx) > 2 && runtimeState.runFrames % 3 === 0) {
    const fast = p.boosting || Math.abs(p.vx) > 18;
    runtimeState.particles.push({
      x: p.x + 7 * Math.sign(p.vx),
      y: feet() - 1,
      vx: -Math.sign(p.vx) * (fast ? 4 : 2),
      vy: fast ? -1.5 : -0.7,
      life: fast ? 12 : 8,
      color: fast ? '#ffdb72' : '#ffe4a4',
      grind: true,
      trail: false,
    });
    if (fast && runtimeState.runFrames % 6 === 0)
      runtimeState.particles.push({
        x: p.x - 10 * Math.sign(p.vx),
        y: feet() + 1,
        vx: -Math.sign(p.vx) * 5,
        vy: 0,
        life: 7,
        color: '#ffa65b',
        grind: true,
        trail: true,
      });
  }
  if (runtimeState.level.deathZones?.some((z) => p.x >= z.x1 && p.x <= z.x2 && feet() > z.y)) {
    die();
    return false;
  }
  if (feet() > stageDeathLimit()) {
    die();
    return false;
  }
  return true;
}

// Visual state tracks resisted momentum; it never gates jump, roll, or direction inputs.
export function updateBrakingPose(dir, incoming) {
  const speed = Math.abs(p.vx),
    opposing = dir && dir !== Math.sign(p.vx),
    resisting =
      p.ground &&
      !p.surface?.grindable &&
      !p.rolling &&
      !runtimeState.charge &&
      !p.boosting &&
      !p.hurt &&
      (!dir || opposing);
  if (resisting && (speed > 0.03 || p.brakeActive)) {
    if (!p.brakeActive) {
      p.brakeAge = 0;
      p.brakeSpeed = incoming;
      p.brakeFace = Math.sign(p.vx) || p.face;
    }
    p.brakeActive = speed > 0.03;
    p.brakeAge++;
    p.brakeSpeed = Math.max(p.brakeSpeed || 0, incoming);
    if (!speed) {
      p.stopFrame = runtimeState.runFrames;
      p.brakeActive = false;
    }
    if (speed > 2 && (p.brakeAge === 1 || runtimeState.runFrames % 3 === 0)) {
      const force = Math.min(1, p.brakeSpeed / 23);
      runtimeState.particles.push({
        x: p.x + 8 * p.brakeFace,
        y: feet() - 2,
        vx: -p.brakeFace * (0.5 + force * 2),
        vy: -0.5 - force * 0.9,
        life: 12 + force * 8,
        color: '#bbc0cd',
        skid: true,
        size: 3 + force * 4,
      });
      if (force > 0.5)
        runtimeState.particles.push({
          x: p.x,
          y: feet() - 1,
          vx: -p.brakeFace,
          vy: 0,
          life: 9,
          color: '#ffe1a0',
          trail: true,
          skid: true,
        });
    }
  } else {
    p.brakeActive = false;
    if (dir || !p.ground || p.rolling || p.boosting || p.hurt) p.stopFrame = -100;
  }
}

// Water follows the existing bowl collision profile, including its dry raised edges.
// Classic ratios: Sonic 1 Sonic_Water / Sonic_Jump / Sonic_JumpHeight (s1disasm).
export function waterAt(x, y) {
  const pool = runtimeState.level.middleSection?.pool;
  if (!pool || x < pool.x1 || x > pool.x2 || y <= pool.y) return null;
  let floor = pool.floor;
  for (const id of pool.deckIds) {
    const s = surfaceById(id);
    if (s && x >= s.x1 && x <= s.x2) {
      floor = yOn(s, x);
      break;
    }
  }
  return y < floor ? pool : null;
}

export function resetPlayerAbilities() {
  Object.assign(p, {
    shield: null,
    bubbleSlam: false,
    underwater: false,
    airRemaining: 1800,
    airBoostUsed: false,
    airBoostFrames: 0,
    airBoostActive: false,
    airBoostRequested: false,
    groundBoostHeld: false,
    jumpReleaseVy: null,
    coyoteLaunchVy: null,
    dashRolling: false,
  });
}

export function updateWaterState() {
  const wet = !!waterAt(p.x, p.y),
    wasWet = !!p.underwater;
  if (wet && !wasWet) {
    p.vx *= 0.5;
    p.vy *= 0.25;
    gameSound('pool');
  } else if (!wet && wasWet) {
    // Only crossing the water surface restores upward velocity, never side/floor exits.
    const pool = runtimeState.level.middleSection?.pool;
    if (pool && p.y <= pool.y && p.vy < 0) p.vy = Math.max((-13.4 * 16) / 6.5, p.vy * 2);
    gameSound('pool');
  }
  p.underwater = wet;
}

export function updateBreathing() {
  if (!waterAt(p.x, p.y - 10) || p.shield === 'bubble') {
    p.airRemaining = 1800;
    return true;
  }
  p.airRemaining = Math.max(0, (p.airRemaining ?? 1800) - 1);
  if (!p.airRemaining) {
    die();
    return false;
  }
  if (
    p.airRemaining === 1500 ||
    p.airRemaining === 1200 ||
    p.airRemaining === 900 ||
    (p.airRemaining <= 720 && p.airRemaining % 60 === 0)
  )
    gameSound('airWarning');
  return true;
}

export function beginBubbleSlam() {
  p.bubbleSlam = true;
  p.jumpReleaseVy = null;
  p.airBoostFrames = 0;
  p.airBoostActive = false;
  p.airBoostRequested = false;
  p.groundBoostHeld = false;
  p.boosting = false;
  p.scriptedLaunch = false;
  p.airSpeedLimit = null;
  p.airLaunchUntil = 0;
  p.vy = p.underwater ? 8 : 16;
  p.jumpAttack = true;
  p.rolling = false;
  p.roll = true;
  runtimeState.charge = 0;
  runtimeState.coyote = 0;
  runtimeState.jumpBuffer = 0;
  gameSound('bubbleBounce');
}

export function reboundBubbleShield() {
  if (!p.bubbleSlam || p.shield !== 'bubble') return false;
  p.bubbleSlam = false;
  p.jumpReleaseVy = null;
  p.vy = -13.4 * (p.underwater ? 7 / 13 : 1);
  p.ground = false;
  p.surface = null;
  p.jumpAttack = true;
  p.airBoostUsed = false;
  p.airBoostFrames = 0;
  p.airBoostActive = false;
  p.poseJumpFrame = runtimeState.runFrames;
  p.airLaunchUntil = runtimeState.runFrames + 8;
  runtimeState.coyote = 0;
  runtimeState.jumpBuffer = 0;
  gameSound('bubbleBounce');
  return true;
}
export function initializeRuntimeModule() {}
export function getRuntimeBindings() {
  return {
    jump: {
      get: () => jump,
      set: (value) => {
        jump = value;
      },
    },
    updateRoll: {
      get: () => updateRoll,
      set: (value) => {
        updateRoll = value;
      },
    },
    updateMovement: {
      get: () => updateMovement,
      set: (value) => {
        updateMovement = value;
      },
    },
    updateBrakingPose: {
      get: () => updateBrakingPose,
      set: (value) => {
        updateBrakingPose = value;
      },
    },
    waterAt: {
      get: () => waterAt,
      set: (value) => {
        waterAt = value;
      },
    },
    resetPlayerAbilities: {
      get: () => resetPlayerAbilities,
      set: (value) => {
        resetPlayerAbilities = value;
      },
    },
    updateWaterState: {
      get: () => updateWaterState,
      set: (value) => {
        updateWaterState = value;
      },
    },
    updateBreathing: {
      get: () => updateBreathing,
      set: (value) => {
        updateBreathing = value;
      },
    },
    beginBubbleSlam: {
      get: () => beginBubbleSlam,
      set: (value) => {
        beginBubbleSlam = value;
      },
    },
    reboundBubbleShield: {
      get: () => reboundBubbleShield,
      set: (value) => {
        reboundBubbleShield = value;
      },
    },
  };
}
