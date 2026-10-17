// Generated from src/playtest-rails.js; run npm run build:compat after source edits.
'use strict';
function createExperimentalRail() {
  const points = [
    [-600, 300, 0],
    [-300, 260, -0.1],
    [0, 240, 0],
    [300, 260, 0.1],
    [600, 300, 0],
  ];
  const pieces = points.slice(0, -1).map(([x, y, m], i) => {
    const [x2, y2, m2] = points[i + 1],
      w = x2 - x;
    return {
      id: 'rail-piece-' + i,
      x1: x,
      x2,
      y,
      c: [y, m, ((3 * (y2 - y)) / w - 2 * m - m2) / w, ((2 * (y - y2)) / w + m + m2) / (w * w)],
      grindable: true,
      routeType: i === 1 || i === 2 ? 'boost' : 'skill',
      infiniteBoost: i === 1 || i === 2,
    };
  });
  return { id: 'test-rail', pieces, x1: -600, x2: 600 };
}

function sampleExperimentalRail(rail, x, direction = 1) {
  const p =
      rail.pieces.find((p) => (direction < 0 ? x <= p.x2 + 1e-9 : x < p.x2 - 1e-9)) ||
      rail.pieces.at(-1),
    u = x - p.x1;
  const [a, b, c, d] = p.c,
    y = a + b * u + c * u * u + d * u * u * u,
    slope = b + 2 * c * u + 3 * d * u * u;
  const n = Math.hypot(1, slope);
  return {
    x,
    y,
    tx: 1 / n,
    ty: slope / n,
    nx: slope / n,
    ny: -1 / n,
    angle: Math.atan(slope),
    curvature: (2 * c + 6 * d * u) / (n * n * n),
    id: p.id,
    railId: rail.id,
    grindable: p.grindable,
    infiniteBoost: p.infiniteBoost,
    piece: p,
  };
}

function multiplyRailPolynomial(a, b) {
  const out = Array(a.length + b.length - 1).fill(0);
  for (let i = 0; i < a.length; i++) for (let j = 0; j < b.length; j++) out[i + j] += a[i] * b[j];
  return out;
}

function experimentalRailImpact(rail, body, vx, vy, ax, ay, duration, skin) {
  const extent = body.hh;
  let first = null;
  for (const p of rail.pieces) {
    const u = [body.x - p.x1, vx, ax / 2],
      u2 = multiplyRailPolynomial(u, u),
      u3 = multiplyRailPolynomial(u2, u);
    const c = [body.y + extent - p.c[0] + skin, vy, ay / 2, 0, 0, 0, 0];
    for (const [poly, k] of [
      [u, p.c[1]],
      [u2, p.c[2]],
      [u3, p.c[3]],
    ])
      for (let i = 0; i < poly.length; i++) c[i] -= poly[i] * k;
    for (const time of pathPolynomialRoots(c, 0, duration)) {
      const x = body.x + vx * time + (ax * time * time) / 2;
      if (x < p.x1 - 1e-7 || x > p.x2 + 1e-7) continue;
      const surface = sampleExperimentalRail(rail, x),
        into = (vx + ax * time) * surface.nx + (vy + ay * time) * surface.ny;
      if (into >= -1e-8) continue;
      const hit = { time, q: { ...surface, kind: 'rail', surface, canLand: true, distance: skin } };
      if (!first || time < first.time) first = hit;
    }
  }
  return first;
}

const experimentalRailTuning = Object.freeze({
    ...groundTuning,
    acceleration: 0.08,
    brake: 0.45,
    coastResistance: 0.025,
  });
