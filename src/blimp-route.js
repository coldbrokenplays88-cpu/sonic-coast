// Canonical runtime module. Classic VM compatibility is generated from this source.
import { state as runtimeState } from './state.js';
import { cityFlame, citySmoke } from './act2.js';
import { surfaceById } from './boost-rules.js';
import { H, W, ctx, p, tuning } from './game.js';
import { cityPixelRect } from './pixel-world.js';
import { pose, yOn } from './surface-collision.js';
export let blimpTextures;

// Optional flight above Burning Quarter. Coordinates derive from the existing
// loop approach and hallway seam. Both choices use the shared movement physics.
export function addBlimpRoute(l) {
  const ramp = l.surfaces.find((s) => s.id === 'draw-loop-launch'),
    exit = l.surfaces.find((s) => s.id === 'draw-hall-exit');
  const ox = ramp.x1 - 31000,
    oy = ramp.y1 + 2800;
  const add = (id, x1, x2, y1, y2 = y1, extra = {}) => {
    const s = {
      id,
      x1: x1 + ox,
      x2: x2 + ox,
      y1: y1 + oy,
      y2: y2 + oy,
      kind: 'main',
      cityType: 'blimp',
      ...extra,
    };
    l.surfaces.push(s);
    return s;
  };
  const entry = add('blimp-entry', 31931, 31989, -3320, -3320, { cityType: 'blimp-anchor' });
  const points = [
    [30716, -3850],
    [30816, -3770],
    [30916, -3720],
    [31016, -3700],
    [31116, -3700],
    [31216, -3720],
    [31316, -3750],
    [31416, -3780],
    [31586, -3810],
  ];
  const curve = [];
  for (let i = 0; i < points.length - 1; i++)
    curve.push(
      add('blimp-curve-' + i, points[i][0], points[i + 1][0], points[i][1], points[i + 1][1])
    );
  const moving = add('blimp-moving', 29836, 30336, -3810, -3810, {
    kind: 'moving',
    motion: { type: 'flight', axis: 'x', distance: -710, speed: 3, startedAt: null },
  });
  const reward = add('blimp-reward', 28386, 29036, -3690);
  l.springs.push(
    {
      id: 'blimp-entry-spring',
      surfaceId: entry.id,
      x: 31960 + ox,
      y: entry.y1,
      power: 21,
      launchX: -20,
    },
    {
      id: 'blimp-return-spring',
      surfaceId: reward.id,
      x: 28416 + ox,
      y: reward.y1,
      power: 32,
      launchX: 28,
    }
  );
  // Stay above the first jump and blimps, then meet the hallway exit exactly.
  // The endpoint meets the far end of the existing hallway-exit roof.
  add('blimp-return-rail', 30016, 34800, -4400, -4400, {
    kind: 'express',
    grindable: true,
    cityType: 'grind-rail',
    blimpRail: true,
  });
  add('blimp-return-descent', 34800, 36500, -4400, exit.y2 - oy, {
    kind: 'express',
    grindable: true,
    cityType: 'grind-rail',
    blimpRail: true,
  });
  l.monitors ??= [];
  for (const [id, item, x] of [
    ['blimp-life', 'life', 28561],
    ['blimp-shield', 'bubble', 28481],
  ])
    l.monitors.push({ id, item, x: x + ox, y: reward.y1, surfaceId: reward.id, broken: false });
  // Keep rings clear of the monitor screens and the return spring.
  for (let x = reward.x1 + 370; x < reward.x2 - 40; x += 76)
    l.rings.push({ x, y: reward.y1 - 38, taken: false });
  l.blimpRoute = {
    entered: false,
    departureFrame: -100,
    departureSpeed: 0,
    entryId: entry.id,
    movingId: moving.id,
    rewardId: reward.id,
    exitId: exit.id,
    blimps: [
      { id: 'damaged', surfaces: curve.map((s) => s.id), damaged: true },
      { id: 'moving', surfaces: [moving.id] },
      { id: 'reward', surfaces: [reward.id] },
    ],
  };
  return l;
}

export function resetBlimpRoute() {
  const s = runtimeState.level.blimpRoute && surfaceById(runtimeState.level.blimpRoute.movingId);
  if (s) {
    s.motion.startedAt = null;
    Object.assign(runtimeState.level.blimpRoute, {
      entered: false,
      departureFrame: -100,
      departureSpeed: 0,
    });
    for (const d of [...runtimeState.level.springs, ...runtimeState.level.pads])
      if (d.id === 'blimp-entry-spring' || d.id === 'blimp-return-spring') delete d.firedAt;
  }
}

export function recordBlimpJump(surface, speed) {
  const r = runtimeState.level.blimpRoute;
  if (!r) return;
  const fromRamp =
    surface?.id === 'draw-loop-launch' ||
    (!surface &&
      runtimeState.coyote > 0 &&
      runtimeState.runFrames - r.departureFrame <= tuning.coyote);
  if (fromRamp && surface) {
    r.departureFrame = runtimeState.runFrames;
    r.departureSpeed = Math.abs(speed);
  } else if (!fromRamp) invalidateBlimpEntry();
}

export function invalidateBlimpEntry() {
  const r = runtimeState.level.blimpRoute;
  if (r) {
    r.departureFrame = -100;
    r.departureSpeed = 0;
  }
}

export function recordBlimpDeparture(s) {
  const r = runtimeState.level.blimpRoute;
  if (r && s.id === 'draw-loop-launch') {
    r.departureFrame = runtimeState.runFrames;
    r.departureSpeed = Math.abs(p.vx) * Math.hypot(1, pose(s).slope);
  }
}

export function onBlimpLanding(s) {
  const r = runtimeState.level.blimpRoute;
  if (!r) return;
  if (s.id !== r.entryId) invalidateBlimpEntry();
  if (s.id === r.movingId && s.motion.startedAt === null)
    s.motion.startedAt = runtimeState.runFrames;
}

export function qualifyingBlimpEntry() {
  const r = runtimeState.level.blimpRoute;
  return !!(r && r.departureFrame >= 0 && r.departureSpeed >= 24 && !p.airBoostUsed);
}

export function drawBlimpRoute() {
  for (const b of runtimeState.level.blimpRoute?.blimps || []) {
    const surfaces = b.surfaces.map(surfaceById),
      first = pose(surfaces[0]),
      last = pose(surfaces.at(-1)),
      x = first.x1,
      right = last.x2,
      top = Math.min(...surfaces.map((s) => Math.min(s.y1, s.y2))),
      bottom = Math.max(...surfaces.map((s) => Math.max(s.y1, s.y2))) + (b.damaged ? 154 : 234);
    // Wreck smoke rises above the hull and drifts beyond its fins.
    const side = b.damaged ? 80 : 42,
      effectTop = top - (b.damaged ? 224 : 0);
    if (
      right + side < runtimeState.cam - 40 ||
      x - side > runtimeState.cam + W / runtimeState.zoom + 40 ||
      bottom < runtimeState.camY - 40 ||
      effectTop > runtimeState.camY + H / runtimeState.zoom + 40
    )
      continue;
    let texture = blimpTextures.get(b.id);
    if (!texture && document.createElement) {
      texture = document.createElement('canvas');
      texture.width = Math.ceil((right - x + 84) / 2);
      texture.height = Math.ceil((bottom - top + 2) / 2);
      const dc = texture.getContext('2d');
      dc.imageSmoothingEnabled = false;
      // Two-world-unit native pixels match the city's shared grid. Collision
      // tops are sampled directly, so the curved wreck's outline is its terrain.
      const w = right - x,
        localTop = (xx) => {
          const s = surfaces.find((s) => xx + x <= s.x2) || surfaces.at(-1);
          return s.y1 + ((xx + x - s.x1) * (s.y2 - s.y1)) / (s.x2 - s.x1) - top;
        };
      const box = (xx, yy, ww, hh, color) => {
        dc.fillStyle = color;
        dc.fillRect(
          Math.floor((xx + 42) / 2),
          Math.floor(yy / 2),
          Math.ceil(ww / 2),
          Math.ceil(hh / 2)
        );
      };
      for (let xx = 0; xx < w; xx += 2) {
        const u = xx / w,
          roof = localTop(xx),
          depth = b.damaged ? 35 + 30 * Math.sin(u * Math.PI) : 24 + 150 * Math.sin(u * Math.PI);
        for (let yy = 0; yy < depth; yy += 2) {
          const shade = yy / depth,
            color =
              yy < 4
                ? '#d8e8de'
                : yy < 8
                  ? '#7fa6ab'
                  : shade < 0.22
                    ? '#91a9b1'
                    : shade < 0.5
                      ? '#607a91'
                      : shade < 0.8
                        ? '#3b536d'
                        : '#25364d';
          box(xx, roof + yy, 2, 2, color);
        }
        box(xx, roof + depth, 2, 4, '#101c32');
        if (Math.floor(xx / 92) % 2 === 0)
          box(xx, roof + Math.min(26, depth * 0.35), 2, 8, '#d95369');
        if (xx % 92 < 4) box(xx, roof + 8, 2, Math.max(2, depth - 14), '#445b73');
        if (b.damaged && ((xx * 17) % 138 < 44 || u < 0.12 || u > 0.88)) {
          box(xx, roof + 10, 2, depth * 0.6, '#252737');
          if (xx % 18 < 2) box(xx, roof + 8, 2, 6, '#975450');
        }
      }
      // Tail fins, keel, cabin, reinforced seams, lamps and engine nacelles.
      const mid = w * 0.52,
        base = localTop(mid) + (b.damaged ? 54 : 180);
      for (let i = 0; i < 20; i++) {
        box(-36 + i * 2, localTop(0) + 18 + i, 38 - i * 2, 4, i < 4 ? '#d66777' : '#3e5572');
        box(w - 2, localTop(w) + 20 + i, 40 - i * 2, 4, i < 4 ? '#d66777' : '#3e5572');
      }
      box(mid - 48, base, 96, 26, '#17253c');
      box(mid - 44, base + 2, 88, 4, '#7796a0');
      box(mid - 32, base + 8, 18, 8, '#58cbdf');
      box(mid - 8, base + 8, 18, 8, '#58cbdf');
      box(mid + 16, base + 8, 18, 8, '#58cbdf');
      box(mid - 48, base + 26, 96, 4, '#ae5770');
      for (const xx of [w * 0.25, w * 0.76]) {
        const yy = localTop(xx) + (b.damaged ? 44 : 150);
        box(xx - 18, yy, 36, 16, '#182a42');
        box(xx - 14, yy + 2, 28, 4, '#708c9e');
        box(xx + 10, yy + 6, 10, 6, '#e5ac6a');
        box(xx - 12, yy + 14, 28, 2, '#c65f78');
      }
      blimpTextures.set(b.id, texture);
    }
    if (texture)
      ctx.drawImage(
        texture,
        Math.round((x - 42) / 2) * 2,
        Math.round(top / 2) * 2,
        texture.width * 2,
        texture.height * 2
      );
    if (b.damaged) {
      for (const s of [surfaces[0], surfaces.at(-1)]) {
        const xx = s === surfaces[0] ? s.x1 + 20 : s.x2 - 20,
          yy = yOn(s, xx);
        cityFlame(xx, yy + 24, 34, 56, Math.floor(xx / 10));
        citySmoke(xx, yy - 50, 44, Math.floor(xx / 10), 0.45);
      }
    } else
      for (const xx of [(first.x1 + first.x2) / 2]) {
        const yy = first.y1 + 210;
        cityPixelRect(xx - 16, yy, 32, 4, '#32465e');
        cityPixelRect(
          xx - 2,
          yy - 6 + (Math.floor(runtimeState.runFrames / 3) % 3) * 4,
          4,
          12,
          '#c4d9dd'
        );
      }
  }
}
export function initializeRuntimeModule() {
  blimpTextures = new Map();
}
export function getRuntimeBindings() {
  return {
    addBlimpRoute: {
      get: () => addBlimpRoute,
      set: (value) => {
        addBlimpRoute = value;
      },
    },
    resetBlimpRoute: {
      get: () => resetBlimpRoute,
      set: (value) => {
        resetBlimpRoute = value;
      },
    },
    recordBlimpJump: {
      get: () => recordBlimpJump,
      set: (value) => {
        recordBlimpJump = value;
      },
    },
    recordBlimpDeparture: {
      get: () => recordBlimpDeparture,
      set: (value) => {
        recordBlimpDeparture = value;
      },
    },
    onBlimpLanding: {
      get: () => onBlimpLanding,
      set: (value) => {
        onBlimpLanding = value;
      },
    },
    qualifyingBlimpEntry: {
      get: () => qualifyingBlimpEntry,
      set: (value) => {
        qualifyingBlimpEntry = value;
      },
    },
    drawBlimpRoute: {
      get: () => drawBlimpRoute,
      set: (value) => {
        drawBlimpRoute = value;
      },
    },
  };
}
