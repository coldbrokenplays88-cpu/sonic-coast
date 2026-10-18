// Canonical runtime module. Classic VM compatibility is generated from this source.
import { state as runtimeState } from './state.js';
import { FOOT_RADIUS, art, keys, p } from './game.js';
import { active, bodyHeight, feet, pose } from './surface-collision.js';
export let traversalAnimation;

export function resetTraversalAnimation() {
  traversalAnimation.state = null;
  traversalAnimation.since = 0;
  traversalAnimation.launch = null;
}

export function beginTraversalLaunch(device) {
  traversalAnimation.launch = {
    kind: device.cityVent ? 'vent-launch' : 'spring-launch',
    since: runtimeState.runFrames,
    face: p.face,
  };
}

export function traversalLaunchValid() {
  const launch = traversalAnimation.launch;
  return (
    launch &&
    !p.ground &&
    p.scriptedLaunch &&
    launch.since === p.poseJumpFrame &&
    p.vy < 3 &&
    !p.hurt &&
    !p.airBoostActive &&
    !p.bubbleSlam
  );
}

export function traversalGroundState() {
  if (
    !p.ground ||
    !p.surface ||
    p.surface.grindable ||
    p.loop ||
    p.hurt ||
    p.boosting ||
    p.rolling ||
    runtimeState.charge ||
    p.bubbleSlam ||
    p.airBoostActive
  )
    return null;
  if (
    runtimeState.runFrames - p.poseLandingFrame >= 0 &&
    runtimeState.runFrames - p.poseLandingFrame < 6
  )
    return null;
  const dir =
    Number(keys.has('ArrowRight') || keys.has('KeyD')) -
    Number(keys.has('ArrowLeft') || keys.has('KeyA'));
  if (dir) {
    const foot = feet(),
      top = foot - bodyHeight();
    for (const h of runtimeState.level.hazards) {
      if (h.broken || h.type === 'spikes' || foot <= h.y + 2 || top >= h.y + h.h - 2) continue;
      const wall = dir > 0 ? h.x : h.x + h.w;
      const halfWidth = p.act1Motion?.act === runtimeState.selectedAct ? 11 : 14;
      if (Math.abs(p.x + dir * halfWidth - wall) < 1.1) return 'push';
    }
    return null;
  }
  if (Math.abs(p.vx) > 0.5 || !active(p.surface) || Math.abs(pose(p.surface).slope) > 0.25)
    return null;
  // Test actual neighboring support, including moving decks and connected roofs.
  let left = false,
    right = false;
  for (const s of runtimeState.level.surfaces) {
    if (!active(s)) continue;
    const q = pose(s);
    const supports = (x) =>
      x >= q.x1 && x <= q.x2 && Math.abs(q.y1 + (x - q.x1) * q.slope - feet()) < 3;
    left ||= supports(p.x - FOOT_RADIUS);
    right ||= supports(p.x + FOOT_RADIUS);
    if (left && right) return null;
  }
  if (left === right) return null;
  const edge = left ? 1 : -1;
  return edge === p.face ? 'balance-forward' : 'balance-backward';
}

export function updateTraversalAnimation() {
  if (!traversalLaunchValid()) traversalAnimation.launch = null;
  const state = traversalGroundState();
  if (state !== traversalAnimation.state) {
    traversalAnimation.state = state;
    traversalAnimation.since = runtimeState.runFrames;
  }
}

export function traversalSonicPose() {
  if (p.hurt || p.airBoostActive || p.bubbleSlam || runtimeState.charge || p.rolling) return null;
  const out = (state, sheet, frame, extra = {}) => ({
    state,
    sheet,
    frame,
    face: p.face,
    rotation: 0,
    ball: false,
    ...extra,
  });
  // Explicit opt-in for future spiral rails; existing straight rails are untouched.
  const turns = p.surface?.spiralTurns;
  if (
    art.traversalLaunch &&
    p.ground &&
    p.surface?.grindable &&
    Number.isFinite(turns) &&
    turns !== 0
  ) {
    const q = pose(p.surface),
      progress = Math.max(0, Math.min(1, (p.x - q.x1) / (q.x2 - q.x1))),
      phase = (((progress * turns) % 1) + 1) % 1;
    return out('grind-spiral', 'traversalLaunch', 16 + Math.floor(phase * 16), {
      face: Math.sign(p.vx) || p.face,
      pivotY: 0,
      rotation: Math.atan(q.slope) * (Math.sign(p.vx) || p.face),
    });
  }
  if (art.traversalLaunch && traversalLaunchValid()) {
    const launch = traversalAnimation.launch,
      frame = Math.floor((runtimeState.runFrames - launch.since) / 3) % 8;
    // Vent cels are authored head-left and horizontal; vertical lift must not rotate them upright.
    if (launch.kind === 'vent-launch')
      return out(launch.kind, 'traversalLaunch', 8 + frame, { face: -launch.face, pivotY: 0 });
    return out(launch.kind, 'traversalLaunch', frame, { face: launch.face });
  }
  if (!art.traversalActing) return null;
  const state = traversalGroundState();
  if (!state) return null;
  const age =
    state === traversalAnimation.state
      ? Math.max(0, runtimeState.runFrames - traversalAnimation.since)
      : 0;
  const frame = Math.floor(age / (state === 'push' ? 4 : 5)) % 8;
  return out(
    state,
    'traversalActing',
    (state === 'push' ? 16 : state === 'balance-backward' ? 8 : 0) + frame
  );
}
export function initializeRuntimeModule() {
  // Cosmetic state only. Never writes player motion, contacts, controls or terrain.
  traversalAnimation = { state: null, since: 0, launch: null };
}
export function getRuntimeBindings() {
  return {
    traversalAnimation: {
      get: () => traversalAnimation,
      set: (value) => {
        traversalAnimation = value;
      },
    },
    resetTraversalAnimation: {
      get: () => resetTraversalAnimation,
      set: (value) => {
        resetTraversalAnimation = value;
      },
    },
    beginTraversalLaunch: {
      get: () => beginTraversalLaunch,
      set: (value) => {
        beginTraversalLaunch = value;
      },
    },
    traversalLaunchValid: {
      get: () => traversalLaunchValid,
      set: (value) => {
        traversalLaunchValid = value;
      },
    },
    traversalGroundState: {
      get: () => traversalGroundState,
      set: (value) => {
        traversalGroundState = value;
      },
    },
    updateTraversalAnimation: {
      get: () => updateTraversalAnimation,
      set: (value) => {
        updateTraversalAnimation = value;
      },
    },
    traversalSonicPose: {
      get: () => traversalSonicPose,
      set: (value) => {
        traversalSonicPose = value;
      },
    },
  };
}
