// Generated from src/playtest-path.js; run npm run build:compat after source edits.
'use strict';
function makePath(id, radius, chamber = false) {
  const pieces = [];
  let length = 0;
  const add = (p) => {
    p.start = length;
    length += p.length;
    p.end = length;
    p.id = id + '-' + pieces.length;
    pieces.push(p);
  };
  const line = (x, y, x2, y2) => {
    const d = Math.hypot(x2 - x, y2 - y);
    add({ kind: 'line', x, y, tx: (x2 - x) / d, ty: (y2 - y) / d, length: d });
  };
  const arc = (cx, cy, a, b) =>
    add({ kind: 'arc', cx, cy, r: radius, a, b, length: radius * (b - a) });
  const floor = chamber ? 440 : 600;
  line(-1000, floor, 0, floor);
  const entry = length;
  let ceiling = null;
  if (!chamber) arc(0, floor - radius, 0, Math.PI * 2);
  else {
    arc(0, floor - radius, 0, Math.PI / 2);
    line(radius, floor - radius, radius, 260);
    arc(0, 260, Math.PI / 2, Math.PI);
    line(0, 260 - radius, -360, 260 - radius);
    ceiling = length - 180;
    arc(-360, 260, Math.PI, Math.PI * 1.5);
    line(-360 - radius, 260, -360 - radius, floor - radius);
    arc(-360, floor - radius, Math.PI * 1.5, Math.PI * 2);
  }
  const exit = length;
  line(chamber ? -360 : 0, floor, 1000, floor);
  return { id, pieces, length, entry, exit, ceiling, thickness: 12 };
}

function samplePath(path, distance) {
  const s = Math.max(0, Math.min(path.length, distance));
  const p = path.pieces.find((p) => s < p.end - 1e-9) || path.pieces.at(-1),
    u = s - p.start;
  let x,
    y,
    tx,
    ty,
    curvature = 0;
  if (p.kind === 'line') {
    x = p.x + u * p.tx;
    y = p.y + u * p.ty;
    tx = p.tx;
    ty = p.ty;
  } else {
    const angle = p.a + u / p.r;
    x = p.cx + p.r * Math.sin(angle);
    y = p.cy + p.r * Math.cos(angle);
    tx = Math.cos(angle);
    ty = -Math.sin(angle);
    curvature = -1 / p.r;
  }
  return {
    x,
    y,
    tx,
    ty,
    nx: ty,
    ny: -tx,
    angle: Math.atan2(ty, tx),
    curvature,
    id: p.id,
    pathS: s,
    piece: p,
  };
}

function pathCorners(body) {
  const c = Math.cos(body.angle),
    s = Math.sin(body.angle),
    out = [];
  for (const x of [-body.hw, body.hw])
    for (const y of [-body.hh, body.hh])
      out.push({ x: body.x + c * x - s * y, y: body.y + s * x + c * y });
  return out;
}

function pathLineDistance(body, p, path) {
  const nx = p.ty,
    ny = -p.tx,
    dx = body.x - p.x,
    dy = body.y - p.y;
  const u = dx * p.tx + dy * p.ty,
    v = dx * nx + dy * ny;
  let distance,
    normalX,
    normalY,
    front = false;
  if (body.circle) {
    const cu = Math.max(0, Math.min(p.length, u)),
      cv = Math.max(-path.thickness, Math.min(0, v));
    const du = u - cu,
      dv = v - cv,
      d = Math.hypot(du, dv);
    if (d > 1e-10) {
      distance = d - body.hw;
      normalX = (du * p.tx + dv * nx) / d;
      normalY = (du * p.ty + dv * ny) / d;
      front = cv === 0 && v >= 0;
    } else {
      const faces = [
        { d: -v, x: nx, y: ny, front: true },
        { d: v + path.thickness, x: -nx, y: -ny },
        { d: u, x: -p.tx, y: -p.ty },
        { d: p.length - u, x: p.tx, y: p.ty },
      ].sort((a, b) => a.d - b.d);
      distance = -faces[0].d - body.hw;
      normalX = faces[0].x;
      normalY = faces[0].y;
      front = !!faces[0].front;
    }
  } else {
    const c = Math.cos(body.angle),
      s = Math.sin(body.angle),
      cx = p.x + (p.tx * p.length) / 2 - (nx * path.thickness) / 2,
      cy = p.y + (p.ty * p.length) / 2 - (ny * path.thickness) / 2;
    distance = -Infinity;
    for (const [ax, ay] of [
      [1, 0],
      [0, 1],
      [c, s],
      [-s, c],
      [p.tx, p.ty],
      [nx, ny],
    ]) {
      const offset = (body.x - cx) * ax + (body.y - cy) * ay;
      const extent =
        body.hw * Math.abs(c * ax + s * ay) +
        body.hh * Math.abs(-s * ax + c * ay) +
        (p.length / 2) * Math.abs(p.tx * ax + p.ty * ay) +
        (path.thickness / 2) * Math.abs(nx * ax + ny * ay);
      const gap = Math.abs(offset) - extent;
      if (gap > distance) {
        distance = gap;
        normalX = Math.sign(offset) * ax;
        normalY = Math.sign(offset) * ay;
      }
    }
    front = normalX * nx + normalY * ny > 0.999;
  }
  const surface = samplePath(path, p.start + Math.max(0, Math.min(p.length, u)));
  return {
    distance,
    nx: normalX,
    ny: normalY,
    curvature: 0.04,
    kind: 'floor',
    canLand: front,
    surface,
    id: p.id,
    convex: true,
  };
}

function pathArcFaceDistance(body, p, path) {
  const dx = body.x - p.cx,
    dy = body.y - p.cy;
  const inside = Math.hypot(dx, dy) < p.r + path.thickness / 2;
  let point, extent;
  if (body.circle) {
    point = { x: body.x, y: body.y };
    extent = body.hw;
  } else if (inside) {
    point = pathCorners(body).sort(
      (a, b) => Math.hypot(b.x - p.cx, b.y - p.cy) - Math.hypot(a.x - p.cx, a.y - p.cy)
    )[0];
    extent = 0;
  } else {
    const c = Math.cos(body.angle),
      s = Math.sin(body.angle),
      u = (p.cx - body.x) * c + (p.cy - body.y) * s,
      v = -(p.cx - body.x) * s + (p.cy - body.y) * c;
    const x = Math.max(-body.hw, Math.min(body.hw, u)),
      y = Math.max(-body.hh, Math.min(body.hh, v));
    point = { x: body.x + c * x - s * y, y: body.y + s * x + c * y };
    extent = 0;
  }
  let angle = Math.atan2(point.x - p.cx, point.y - p.cy);
  while (angle < p.a - 1e-9) angle += Math.PI * 2;
  if (angle > p.b + 1e-9) return null;
  angle = Math.max(p.a, Math.min(p.b, angle));
  const radial = Math.hypot(point.x - p.cx, point.y - p.cy),
    rx = Math.sin(angle),
    ry = Math.cos(angle);
  const surface = samplePath(path, p.start + (angle - p.a) * p.r);
  return {
    distance: (inside ? p.r - radial : radial - p.r - path.thickness) - extent,
    nx: inside ? -rx : rx,
    ny: inside ? -ry : ry,
    curvature: 0.04,
    kind: 'floor',
    canLand: inside,
    surface,
    id: p.id,
    convex: !inside,
  };
}

function pathArcDistance(body, p, path) {
  const candidates = [];
  const face = pathArcFaceDistance(body, p, path);
  if (face) candidates.push(face);
  // Finite sector endcaps keep the distance query defined when a fast body
  // starts outside the angular span but enters it during the sweep.
  if (p.b - p.a < Math.PI * 2 - 1e-8)
    for (const angle of [p.a, p.b]) {
      const rx = Math.sin(angle),
        ry = Math.cos(angle);
      const cap = {
        kind: 'line',
        x: p.cx + p.r * rx,
        y: p.cy + p.r * ry,
        tx: rx,
        ty: ry,
        length: path.thickness,
        start: p.start,
        id: p.id,
      };
      const q = pathLineDistance(body, cap, { ...path, thickness: 0 });
      // An endcap's local separating plane need not separate the curved face.
      candidates.push({ ...q, canLand: false, kind: 'box', convex: false });
    }
  if (!candidates.length) return null;
  const q = candidates.sort((a, b) => a.distance - b.distance)[0];
  return { ...q, curvature: 0.08, far: q.distance > 2 };
}

function pathDistances(path, body, nearS = null) {
  const results = [];
  for (const original of path.pieces) {
    let p = original;
    if (nearS != null) {
      const reach = body.hw + body.hh + path.thickness + 2;
      const lo = Math.max(p.start, nearS - reach),
        hi = Math.min(p.end, nearS + reach);
      if (lo >= hi) continue;
      if (p.kind === 'arc')
        p = {
          ...p,
          start: lo,
          end: hi,
          length: hi - lo,
          a: p.a + (lo - p.start) / p.r,
          b: p.a + (hi - p.start) / p.r,
        };
      else
        p = {
          ...p,
          start: lo,
          end: hi,
          length: hi - lo,
          x: p.x + (lo - p.start) * p.tx,
          y: p.y + (lo - p.start) * p.ty,
        };
    }
    const q = p.kind === 'line' ? pathLineDistance(body, p, path) : pathArcDistance(body, p, path);
    if (q) results.push(q);
  }
  return results;
}

function pathBody(player, posture = player.posture) {
  const path = playtestPaths[player.scenario],
    s = samplePath(path, player.pathS),
    height = posture === 'rolling' ? 38 : 48;
  const body = {
    x: s.x + (s.nx * height) / 2,
    y: s.y + (s.ny * height) / 2,
    hw: (posture === 'rolling' ? 38 : 22) / 2,
    hh: height / 2,
    circle: posture === 'rolling',
    angle: s.angle,
  };
  if (!body.circle) {
    // Rounded terrain meets a flat foot at its corners. Find the small normal
    // clearance against all adjoining front faces, smoothly across C1 joins.
    const clear = (shift) => {
      const b = { ...body, x: body.x + s.nx * shift, y: body.y + s.ny * shift };
      return pathDistances(path, b, player.pathS).every((q) => q.distance >= -1e-7);
    };
    if (!clear(0)) {
      let lo = 0,
        hi = 2;
      for (let i = 0; i < 20; i++) {
        const mid = (lo + hi) / 2;
        if (clear(mid)) hi = mid;
        else lo = mid;
      }
      body.x += s.nx * hi;
      body.y += s.ny * hi;
    }
  }
  return body;
}

function syncPathPlayer(player) {
  const s = samplePath(playtestPaths[player.scenario], player.pathS);
  player.x = s.x;
  player.y = s.y;
}

function pathPolynomialRoots(coefficients, lo, hi) {
  const c = [...coefficients];
  while (c.length > 1 && Math.abs(c.at(-1)) < 1e-14) c.pop();
  const value = (t) => c.reduceRight((v, x) => v * t + x, 0);
  if (c.length <= 1) return [];
  if (c.length === 2) {
    const r = -c[0] / c[1];
    return r >= lo - 1e-10 && r <= hi + 1e-10 ? [Math.max(lo, Math.min(hi, r))] : [];
  }
  const points = [
      lo,
      ...pathPolynomialRoots(
        c.slice(1).map((x, i) => x * (i + 1)),
        lo,
        hi
      ),
      hi,
    ],
    roots = [];
  for (const t of points) if (Math.abs(value(t)) < 1e-8) roots.push(t);
  for (let i = 1; i < points.length; i++) {
    let a = points[i - 1],
      b = points[i],
      fa = value(a),
      fb = value(b);
    if (fa * fb >= 0) continue;
    for (let n = 0; n < 48; n++) {
      const m = (a + b) / 2,
        fm = value(m);
      if (fa * fm <= 0) {
        b = m;
        fb = fm;
      } else {
        a = m;
        fa = fm;
      }
    }
    roots.push((a + b) / 2);
  }
  return roots.sort((a, b) => a - b).filter((x, i, a) => !i || x - a[i - 1] > 1e-9);
}

function pathArcImpact(body, vx, vy, ax, ay, duration, p, path, skin, accept) {
  const times = [0],
    x = body.x - p.cx,
    y = body.y - p.cy;
  const circle = (dx, dy, r) =>
    times.push(
      ...pathPolynomialRoots(
        [
          dx * dx + dy * dy - r * r,
          2 * (dx * vx + dy * vy),
          vx * vx + vy * vy + dx * ax + dy * ay,
          vx * ax + vy * ay,
          (ax * ax + ay * ay) / 4,
        ],
        0,
        duration
      )
    );
  if (body.circle) {
    circle(x, y, p.r - body.hw);
    circle(x, y, p.r + path.thickness + body.hw);
  } else {
    for (const corner of pathCorners(body)) {
      circle(corner.x - p.cx, corner.y - p.cy, p.r);
      circle(corner.x - p.cx, corner.y - p.cy, p.r + path.thickness);
    }
    const r = p.r + path.thickness;
    for (const sign of [-1, 1]) {
      times.push(...pathPolynomialRoots([x - sign * (r + body.hw), vx, ax / 2], 0, duration));
      times.push(...pathPolynomialRoots([y - sign * (r + body.hh), vy, ay / 2], 0, duration));
    }
  }
  for (const time of times.sort((a, b) => a - b)) {
    const at = {
      ...body,
      x: body.x + vx * time + (ax * time * time) / 2,
      y: body.y + vy * time + (ay * time * time) / 2,
    };
    const q = pathArcFaceDistance(at, p, path);
    if (!q || !accept(q)) continue;
    const into = (vx + ax * time) * q.nx + (vy + ay * time) * q.ny;
    if (
      (time === 0 && q.distance < -skin) ||
      (Math.abs(q.distance) <= skin + 1e-6 &&
        (into < -1e-8 || (Math.abs(into) < 1e-8 && ax * q.nx + ay * q.ny < -1e-8)))
    )
      return { time, q };
  }
  return null;
}

function pathArcCaps(p, path) {
  if (p.b - p.a >= Math.PI * 2 - 1e-8) return [];
  return [p.a, p.b].map((angle) => {
    const tx = Math.sin(angle),
      ty = Math.cos(angle);
    return {
      kind: 'line',
      x: p.cx + p.r * tx,
      y: p.cy + p.r * ty,
      tx,
      ty,
      length: path.thickness,
      start: p.start,
      id: p.id,
    };
  });
}

const loop = makePath('loop', 96),
    wide = makePath('loop-wide', 140),
    chamber = makePath('wall-ceiling', 120, true);
const playtestPaths = Object.freeze({
    loop,
    'loop-reverse': loop,
    'loop-wide': wide,
    'wall-ceiling': chamber,
    'wall-ceiling-reverse': chamber,
  });
