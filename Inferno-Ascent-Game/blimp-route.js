'use strict';
// Optional flight above Burning Quarter. Coordinates derive from the existing
// loop ramp and hallway seam; none of the original city geometry is moved.
function addBlimpRoute(l) {
  const ramp = l.surfaces.find((s) => s.id === 'draw-loop-launch'),
    exit = l.surfaces.find((s) => s.id === 'draw-hall-exit');
  const ox = ramp.x2 - 31300,
    oy = ramp.y2 + 3020;
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
  const entry = add('blimp-entry', 32715, 32773, -3750, -3750, { cityType: 'blimp-anchor' });
  const points = [
    [31500, -3850],
    [31600, -3770],
    [31700, -3720],
    [31800, -3700],
    [31900, -3700],
    [32000, -3720],
    [32100, -3750],
    [32200, -3780],
    [32370, -3810],
  ];
  const curve = [];
  for (let i = 0; i < points.length - 1; i++)
    curve.push(
      add('blimp-curve-' + i, points[i][0], points[i + 1][0], points[i][1], points[i + 1][1])
    );
  const moving = add('blimp-moving', 30620, 31120, -3810, -3810, {
    kind: 'moving',
    motion: { type: 'flight', axis: 'x', distance: -710, speed: 3, startedAt: null },
  });
  const reward = add('blimp-reward', 29170, 29820, -3690);
  l.springs.push(
    {
      id: 'blimp-entry-spring',
      surfaceId: entry.id,
      x: 32744 + ox,
      y: entry.y1,
      power: 11,
      launchX: -20,
    },
    {
      id: 'blimp-return-spring',
      surfaceId: reward.id,
      x: 29200 + ox,
      y: reward.y1,
      power: 32,
      launchX: 28,
    }
  );
  // Stay above the first jump and blimps, then meet the hallway exit exactly.
  // The endpoint meets the far end of the existing hallway-exit roof.
  add('blimp-return-rail', 30800, 34800, -4400, -4400, {
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
    ['blimp-life', 'life', 29345],
    ['blimp-shield', 'bubble', 29265],
  ])
    l.monitors.push({ id, item, x: x + ox, y: reward.y1, surfaceId: reward.id, broken: false });
  // Keep rings clear of the monitor screens and the return spring.
  for (let x = reward.x1 + 370; x < reward.x2 - 40; x += 76)
    l.rings.push({ x, y: reward.y1 - 38, taken: false });
  l.blimpRoute = {
    entered: false,
    entryJumpFrame: -1,
    entryJumpSpeed: 0,
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
function resetBlimpRoute() {
  const s = level.blimpRoute && surfaceById(level.blimpRoute.movingId);
  if (s) {
    s.motion.startedAt = null;
    Object.assign(level.blimpRoute, {
      entered: false,
      entryJumpFrame: -1,
      entryJumpSpeed: 0,
      departureFrame: -100,
      departureSpeed: 0,
    });
    for (const d of level.springs)
      if (d.id === 'blimp-entry-spring' || d.id === 'blimp-return-spring') delete d.firedAt;
  }
}
function recordBlimpJump(surface, speed) {
  const r = level.blimpRoute;
  if (!r) return;
  const fromRamp =
    surface?.id === 'draw-loop-launch' ||
    (!surface && coyote > 0 && runFrames - r.departureFrame <= tuning.coyote);
  r.entryJumpFrame = fromRamp ? runFrames : -1;
  r.entryJumpSpeed = surface ? Math.abs(speed) : r.departureSpeed;
}
function recordBlimpDeparture(s) {
  const r = level.blimpRoute;
  if (r && s.id === 'draw-loop-launch') {
    r.departureFrame = runFrames;
    r.departureSpeed = Math.abs(p.vx) * Math.hypot(1, pose(s).slope);
  }
}
function onBlimpLanding(s) {
  const r = level.blimpRoute;
  if (!r) return;
  if (s.id !== r.entryId) r.entryJumpFrame = -1;
  if (s.id === r.movingId && s.motion.startedAt === null) s.motion.startedAt = runFrames;
}
function qualifyingBlimpEntry() {
  const r = level.blimpRoute;
  return r && r.entryJumpFrame === p.poseJumpFrame && r.entryJumpSpeed >= 24 && !p.airBoostUsed;
}
function blimpSpringContact(d) {
  // Sweep the player's collision rectangle against the rendered angled cap.
  // The raster's cap is 40 units above its pivot with a 24-unit half width.
  const a = (polishDirection(d) * Math.PI) / 8,
    tx = Math.cos(a),
    ty = Math.sin(a),
    nx = ty,
    ny = -tx;
  const cx = d.x + nx * 40,
    cy = d.y + ny * 40,
    normalRadius = Math.abs(nx) * 13;
  const before = (p.lastX - cx) * nx + (p.lastY + 20 - cy) * ny - normalRadius,
    after = (p.x - cx) * nx + (feet() - cy) * ny - normalRadius;
  if (before < -8 || after > 0 || after >= before) return false;
  const t = Math.max(0, Math.min(1, before / (before - after))),
    x = p.lastX + (p.x - p.lastX) * t,
    y = p.lastY + 20 + (feet() - p.lastY - 20) * t;
  const halfHeight = bodyHeight() / 2,
    tangent = (x - cx) * tx + (y - halfHeight - cy) * ty;
  return Math.abs(tangent) <= 24 + Math.abs(tx) * 13 + Math.abs(ty) * halfHeight;
}

const blimpTextures = new Map();
function drawBlimpRoute() {
  for (const b of level.blimpRoute?.blimps || []) {
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
      right + side < cam - 40 ||
      x - side > cam + W / zoom + 40 ||
      bottom < camY - 40 ||
      effectTop > camY + H / zoom + 40
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
        cityPixelRect(xx - 2, yy - 6 + (Math.floor(runFrames / 3) % 3) * 4, 4, 12, '#c4d9dd');
      }
  }
}
