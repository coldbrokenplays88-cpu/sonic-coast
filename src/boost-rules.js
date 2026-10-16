// Canonical runtime module. Classic VM compatibility is generated from this source.
import { state as runtimeState } from './state.js';
import { BOOST_MAX, gameSound, p, sparks } from './game.js';
import { bodyHeight, pose, yOn, sweptBoxTime } from './surface-collision.js';

export function freeRailBoost() {
  return !!(p.ground && p.surface?.grindable && p.surface.infiniteBoost);
}

export function updateBoostState(want) {
  if (!want) {
    p.boostLocked = false;
    p.groundBoostHeld = false;
    p.airBoostFrames = 0;
  }
  if (p.ground) {
    p.airBoostUsed = false;
    p.airBoostFrames = 0;
    p.groundBoostHeld = want;
  }
  const free = freeRailBoost(),
    eligible = !runtimeState.charge && !p.hurt && !p.wrongRouteDrop && !p.bubbleSlam;
  if (
    p.airBoostRequested &&
    want &&
    !p.ground &&
    !p.airBoostUsed &&
    runtimeState.boost >= BOOST_MAX / 4 &&
    !p.boostLocked &&
    eligible
  ) {
    runtimeState.boost -= BOOST_MAX / 4;
    p.airBoostUsed = true;
    p.airBoostFrames = 18;
    p.groundBoostHeld = false;
    p.scriptedLaunch = false;
    p.airSpeedLimit = null;
    p.airLaunchUntil = 0;
    p.vx = p.face * Math.max(23, p.vx * p.face);
    p.vy = 0;
    p.jumpReleaseVy = null;
    p.jumpAttack = true;
  }
  p.airBoostRequested = false;
  p.boosting = !!(
    want &&
    (p.ground ? free || (runtimeState.boost > 0 && !p.boostLocked) : p.airBoostFrames > 0) &&
    eligible
  );
  if (p.boosting && p.airBoostFrames > 0) {
    p.vy = 0;
    p.airBoostFrames--;
    p.airBoostActive = true;
  } else p.airBoostActive = false;
  if (p.boosting && p.ground && !free) {
    runtimeState.boost = Math.max(0, runtimeState.boost - 0.5);
    if (!runtimeState.boost) p.boostLocked = true;
  }
  return p.boosting;
}

export function measurementSpeed() {
  if (p.loop) return Math.abs(p.loop.speed);
  if (p.ground && p.surface?.contactMode === 'oriented') return Math.abs(p.contactSpeed);
  if (p.ground && p.surface) return Math.abs(p.vx) * Math.hypot(1, pose(p.surface).slope);
  return Math.hypot(p.vx, p.vy);
}

export function configureBoostMonitors(l) {
  l.monitors ??= [];
  l.surfaceIndex = new Map(l.surfaces.map((s) => [s.id, s]));
  if (l.act !== 2) {
    l.buildings ??= [];
    for (const s of l.surfaces) {
      s.cityType =
        s.y1 !== s.y2
          ? 'concrete-ramp'
          : s.kind === 'main'
            ? 'rooftop'
            : s.kind === 'moving'
              ? 'freight-lift'
              : s.kind === 'crumble'
                ? 'broken-bridge'
                : 'fire-escape';
      if (s.kind === 'main') {
        s.roof = true;
        l.buildings.push({
          x: s.x1,
          y: Math.min(s.y1, s.y2) + 26,
          w: s.x2 - s.x1,
          h: 1000,
          seed: Math.floor(s.x1 / 1800),
          roofId: s.id,
        });
      }
    }
  }
  const shield = l.monitors.find((m) => m.id === 'mid-secret-monitor' && !m.required);
  if (shield) shield.item = 'bubble';
  const add = (id, s, x, required = false) => {
    if (!s || l.monitors.some((m) => m.id === id)) return;
    l.monitors.push({
      id,
      x,
      y: s.y1 + ((x - s.x1) * (s.y2 - s.y1)) / (s.x2 - s.x1),
      surfaceId: s.id,
      broken: false,
      required,
    });
  };
  // Required pickups are on safe approach decks, before a mandatory wall or boost launch.
  for (const h of l.hazards.filter((h) => h.type === 'breakable' && !h.secret)) {
    const s = l.surfaces
      .filter(
        (s) =>
          !s.sealedBy &&
          s.x1 < h.x &&
          s.x2 >= h.x - 500 &&
          Math.abs((s.y1 + s.y2) / 2 - h.floor) < 200
      )
      .sort((a, b) => b.x2 - a.x2)[0];
    if (s)
      add('boost-before-' + h.id, s, Math.max(s.x1 + 45, Math.min(s.x2 - 60, h.x - 240)), true);
  }
  for (const s of l.surfaces.filter((s) => s.routeType === 'boost' && s.entrySpeed)) {
    const approach = l.surfaces
      .filter(
        (a) =>
          !a.sealedBy &&
          a.kind === 'main' &&
          a.x1 < s.x1 &&
          a.x2 >= s.x1 - 700 &&
          Math.abs(a.y2 - s.y1) < 400
      )
      .sort((a, b) => b.x2 - a.x2)[0];
    if (approach)
      add(
        'boost-route-' + s.id,
        approach,
        Math.max(approach.x1 + 55, Math.min(approach.x2 - 60, s.x1 - 200)),
        true
      );
  }
  // Any grind route marked as a true boost express is an explicit skip rail.
  for (const s of l.surfaces) if (s.grindable && s.routeType === 'boost') s.infiniteBoost = true;
  return l;
}

export function surfaceById(id) {
  return (
    runtimeState.level.surfaceIndex?.get(id) || runtimeState.level.surfaces.find((s) => s.id === id)
  );
}

export function monitorPose(m) {
  const s = m.surfaceId && surfaceById(m.surfaceId);
  if (!s) return m;
  const q = pose(s);
  return { ...m, x: m.x + q.x1 - s.x1, y: yOn(s, m.x + q.x1 - s.x1) };
}

export function collectBoostMonitors(oldX = p.x, oldY = p.y) {
  for (const m of runtimeState.level.monitors || []) {
    if (m.broken) continue;
    const q = monitorPose(m);
    const height = bodyHeight();
    if (
      sweptBoxTime(oldX, oldY, p.x, p.y, q.x - 34, q.y - 78, q.x + 34, q.y - 20 + height) === null
    )
      continue;
    const attacking =
      p.boosting || (p.rolling && Math.abs(p.vx) > 2) || (!p.ground && p.jumpAttack);
    if (!attacking) continue;
    m.broken = true;
    m.brokenAt = runtimeState.runFrames;
    if (m.item === 'bubble') {
      p.shield = 'bubble';
      p.airRemaining = 1800;
    } else if (m.item === 'life') {
      runtimeState.lives++;
    } else {
      runtimeState.boost = BOOST_MAX;
      p.boostLocked = false;
    }
    runtimeState.score += 100;
    runtimeState.stats.monitors = (runtimeState.stats.monitors || 0) + 1;
    sparks(q.x, q.y - 28, 12, '#9deaff');
    if (typeof gameSound === 'function') gameSound('monitor');
  }
}

export function resetBoostMonitors() {
  for (const m of runtimeState.level.monitors || []) m.broken = false;
}

export function airDevicePose(d) {
  const s = d.surfaceId && surfaceById(d.surfaceId);
  if (!s) return d;
  const q = pose(s);
  return { ...d, x: d.x + q.x1 - s.x1, y: yOn(s, d.x + q.x1 - s.x1) };
}
export function initializeRuntimeModule() {}
export function getRuntimeBindings() {
  return {
    freeRailBoost: {
      get: () => freeRailBoost,
      set: (value) => {
        freeRailBoost = value;
      },
    },
    updateBoostState: {
      get: () => updateBoostState,
      set: (value) => {
        updateBoostState = value;
      },
    },
    measurementSpeed: {
      get: () => measurementSpeed,
      set: (value) => {
        measurementSpeed = value;
      },
    },
    configureBoostMonitors: {
      get: () => configureBoostMonitors,
      set: (value) => {
        configureBoostMonitors = value;
      },
    },
    surfaceById: {
      get: () => surfaceById,
      set: (value) => {
        surfaceById = value;
      },
    },
    monitorPose: {
      get: () => monitorPose,
      set: (value) => {
        monitorPose = value;
      },
    },
    collectBoostMonitors: {
      get: () => collectBoostMonitors,
      set: (value) => {
        collectBoostMonitors = value;
      },
    },
    resetBoostMonitors: {
      get: () => resetBoostMonitors,
      set: (value) => {
        resetBoostMonitors = value;
      },
    },
    airDevicePose: {
      get: () => airDevicePose,
      set: (value) => {
        airDevicePose = value;
      },
    },
  };
}
