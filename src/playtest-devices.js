import { pathPolynomialRoots } from './playtest-path.js';
// Pure PLAYTEST device geometry. Time is supplied by stepMotionPlayer; no update loop.
export let experimentalDeviceTuning;

export function experimentalPlatformPose(platform, time) {
  const m = platform.motion;
  let offset = 0,
    velocity = 0,
    nextTurn = Infinity;
  if (m) {
    const u = ((((time + (m.phase || 0)) / m.period + 0.25) % 1) + 1) % 1;
    offset = m.amplitude * (u < 0.5 ? -1 + 4 * u : 3 - 4 * u);
    velocity = ((u < 0.5 ? 1 : -1) * 4 * m.amplitude) / m.period;
    nextTurn = (0.5 - (u % 0.5)) * m.period;
  }
  const dx = m?.axis === 'x' ? offset : 0,
    dy = m?.axis === 'y' ? offset : 0;
  return {
    id: platform.id,
    x1: platform.x - platform.width / 2 + dx,
    x2: platform.x + platform.width / 2 + dx,
    y1: platform.y + dy,
    y2: platform.y + dy + platform.depth,
    vx: m?.axis === 'x' ? velocity : 0,
    vy: m?.axis === 'y' ? velocity : 0,
    nextTurn,
  };
}

// One-way deck: only a descending foot crossing the top plane can attach.
// Solve in the translating platform's frame; ascending and underside crossings
// are never solid, even if an ascent/apex/descent fits within one interval.
export function experimentalPlatformImpact(body, vx, vy, ax, ay, duration, pose, skin) {
  const extentY = body.circle
    ? body.hh
    : Math.abs(Math.sin(body.angle)) * body.hw + Math.abs(Math.cos(body.angle)) * body.hh;
  const roots = pathPolynomialRoots(
    [body.y + extentY - pose.y1 + skin, vy - pose.vy, ay / 2],
    0,
    duration
  );
  for (const time of roots) {
    if (vy - pose.vy + ay * time <= 1e-8) continue;
    const x = body.x + (vx - pose.vx) * time + (ax * time * time) / 2;
    if (x < pose.x1 || x > pose.x2) continue;
    return {
      time,
      q: {
        distance: skin,
        nx: 0,
        ny: -1,
        kind: 'platform',
        id: pose.id,
        canLand: true,
        velocity: { vx: pose.vx, vy: pose.vy },
      },
    };
  }
  return null;
}

export function experimentalSpringPose(spring, time, fixture = {}) {
  const carrier = fixture.platforms?.find((p) => p.id === spring.platform);
  const pose = carrier ? experimentalPlatformPose(carrier, time) : null;
  const angle = spring.angle || 0,
    nx = Math.sin(angle),
    ny = -Math.cos(angle);
  return {
    ...spring,
    x: spring.x + (pose ? (pose.x1 + pose.x2) / 2 : 0),
    y: spring.y + (pose ? pose.y1 : 0),
    nx,
    ny,
    tx: -ny,
    ty: nx,
    half: 24,
    depth: 20,
    vx: pose?.vx || 0,
    vy: pose?.vy || 0,
  };
}

export function experimentalSpringDistance(body, face) {
  const dx = body.x - face.x,
    dy = body.y - face.y;
  const x = dx * face.tx + dy * face.ty;
  const y = -(dx * face.nx + dy * face.ny);
  let distance, nx, ny;
  if (body.circle) {
    const px = Math.max(-face.half, Math.min(face.half, x));
    const py = Math.max(0, Math.min(face.depth, y));
    const lx = x - px,
      ly = y - py,
      length = Math.hypot(lx, ly);
    if (length > 1e-12) {
      distance = length - body.hw;
      nx = lx / length;
      ny = ly / length;
    } else {
      const near = [
        { d: x + face.half, x: -1, y: 0 },
        { d: face.half - x, x: 1, y: 0 },
        { d: y, x: 0, y: -1 },
        { d: face.depth - y, x: 0, y: 1 },
      ].sort((a, b) => a.d - b.d)[0];
      distance = -near.d - body.hw;
      nx = near.x;
      ny = near.y;
    }
    return { distance, nx: nx * face.tx - ny * face.nx, ny: nx * face.ty - ny * face.ny };
  }
  // SAT separation for an oriented player box against the spring's oriented casing.
  const c = Math.cos(body.angle),
    s = Math.sin(body.angle);
  const cx = face.x - (face.nx * face.depth) / 2,
    cy = face.y - (face.ny * face.depth) / 2;
  let result = { distance: -Infinity };
  for (const [ax, ay] of [
    [face.tx, face.ty],
    [face.nx, face.ny],
    [c, s],
    [-s, c],
  ]) {
    const extent =
      body.hw * Math.abs(c * ax + s * ay) +
      body.hh * Math.abs(-s * ax + c * ay) +
      face.half * Math.abs(face.tx * ax + face.ty * ay) +
      (face.depth / 2) * Math.abs(face.nx * ax + face.ny * ay);
    const projection = (body.x - cx) * ax + (body.y - cy) * ay;
    const d = Math.abs(projection) - extent;
    if (d > result.distance)
      result = { distance: d, nx: Math.sign(projection) * ax, ny: Math.sign(projection) * ay };
  }
  return result;
}

// Exact candidate roots for parabolic travel against a convex oriented casing.
// Curled bodies use straight face hits plus rounded Minkowski corners. This
// avoids conservative-advancement stalls when braking tangent to a cap corner.
export function experimentalDeviceImpact(body, vx, vy, ax, ay, duration, face, skin) {
  const candidates = [0];
  const roots = (coefficients) =>
    candidates.push(...pathPolynomialRoots(coefficients, 0, duration));
  const dx = body.x - face.x,
    dy = body.y - face.y;
  if (body.circle) {
    const x = dx * face.tx + dy * face.ty,
      y = -dx * face.nx - dy * face.ny;
    const ux = vx * face.tx + vy * face.ty,
      uy = -vx * face.nx - vy * face.ny;
    const bx = (ax * face.tx + ay * face.ty) / 2,
      by = (-ax * face.nx - ay * face.ny) / 2;
    const radius = body.hw + skin;
    for (const edge of [-face.half - radius, face.half + radius]) roots([x - edge, ux, bx]);
    for (const edge of [-radius, face.depth + radius]) roots([y - edge, uy, by]);
    for (const cx of [-face.half, face.half])
      for (const cy of [0, face.depth]) {
        const px = x - cx,
          py = y - cy;
        roots([
          px * px + py * py - radius * radius,
          2 * (px * ux + py * uy),
          ux * ux + uy * uy + 2 * (px * bx + py * by),
          2 * (ux * bx + uy * by),
          bx * bx + by * by,
        ]);
      }
  } else {
    const c = Math.cos(body.angle),
      s = Math.sin(body.angle);
    for (const [nx, ny] of [
      [face.tx, face.ty],
      [face.nx, face.ny],
      [c, s],
      [-s, c],
    ]) {
      const extent =
        body.hw * Math.abs(c * nx + s * ny) +
        body.hh * Math.abs(-s * nx + c * ny) +
        face.half * Math.abs(face.tx * nx + face.ty * ny) +
        (face.depth / 2) * Math.abs(face.nx * nx + face.ny * ny) +
        skin;
      const offset =
        (dx + (face.nx * face.depth) / 2) * nx + (dy + (face.ny * face.depth) / 2) * ny;
      for (const sign of [-1, 1])
        roots([offset - sign * extent, vx * nx + vy * ny, (ax * nx + ay * ny) / 2]);
    }
  }
  candidates.sort((a, b) => a - b);
  for (const time of candidates) {
    const at = {
      ...body,
      x: body.x + vx * time + (ax * time * time) / 2,
      y: body.y + vy * time + (ay * time * time) / 2,
    };
    const q = experimentalSpringDistance(at, face);
    if (q.distance > skin + 1e-7) continue;
    const vn = (vx + ax * time) * q.nx + (vy + ay * time) * q.ny;
    const an = ax * q.nx + ay * q.ny;
    if (vn < -1e-8 || (Math.abs(vn) <= 1e-8 && an < -1e-8) || q.distance < -skin)
      return { time, q };
  }
  return null;
}

export function initializeRuntimeModule() {
  experimentalDeviceTuning = Object.freeze({
    springSpeed: 18,
    dashEntrySpeed: 0.5,
    dashMin: 12,
    dashMax: 19,
    dashChargeTicks: 30,
  });
}
export function getRuntimeBindings() {
  return {};
}
