// Input-only authored-route replay, usable in the VM and extracted browser build.
// Reads authored geometry to choose inputs; never replaces player state/velocity.
function act1RouteReplay() {
  selectAct(1);
  start();
  const visited = new Set(),
    started = Date.now();
  let jumping = false,
    down = false,
    turning = false;
  press('ArrowRight', true);
  for (let i = 0; i < 4200 && mode === 'playing'; i++) {
    if (jumping && (p.ground || p.vy >= 0)) {
      release('Space', true);
      jumping = false;
    }
    const gate = level.hazards.find((h) => h.type === 'gate' && h.x + h.w > p.x && h.x - p.x < 100);
    if (!!gate !== down) {
      (gate ? press : release)('ArrowDown', true);
      down = !!gate;
    }
    if (gate && p.ground && !p.roll) {
      release('ArrowDown', true);
      press('ArrowDown', true);
    }
    if (!gate && p.ground && p.roll && Math.abs(p.vx) < 5) turning = true;
    if (turning && !p.roll) turning = false;
    const preciseBrake =
      p.ground &&
      p.vx > 14 &&
      level.hazards.some((h) => h.type === 'spikes' && h.x > p.x && h.x - p.x < 350);
    if (turning || preciseBrake) {
      release('ArrowRight', true);
      press('ArrowLeft', true);
    } else {
      release('ArrowLeft', true);
      press('ArrowRight', true);
    }
    if (p.ground && p.surface) {
      const q = pose(p.surface);
      const danger = level.hazards.some(
        (h) =>
          h.type === 'spikes' &&
          h.x > p.x &&
          h.x - p.x < 180 &&
          Math.abs(h.y + h.h - (p.y + 20)) < 35
      );
      const enemy = enemies.some(
        (e) => e.alive && e.x > p.x && e.x - p.x < 160 && Math.abs(e.y - p.y) < 65
      );
      const join = level.surfaces.some(
        (s) =>
          s !== p.surface &&
          active(s) &&
          pose(s).x1 <= q.x2 + 1 &&
          pose(s).x2 > q.x2 + 1 &&
          Math.abs(yOn(s, q.x2) - q.y2) < 1
      );
      if (
        !jumping &&
        !gate &&
        !turning &&
        !preciseBrake &&
        ((q.x2 - p.x < 60 && !join) || danger || enemy)
      ) {
        press('Space', true);
        jumping = true;
      }
    }
    update();
    if (i % 15 === 0) draw();
    if (p.surface) visited.add(p.surface.id);
    if (stats.deaths) break;
  }
  for (const key of ['ArrowRight', 'ArrowLeft', 'ArrowDown', 'Space']) release(key, true);
  draw();
  return { state: readGameState(), surfaces: [...visited], elapsedMs: Date.now() - started };
}
function act1ExpressReplay(sector = 2) {
  selectAct(1);
  start();
  checkpoint = sector;
  respawn();
  const final = sector === 5,
    boostX = final ? 23700 : 9850,
    jumpX = final ? 24020 : 10160,
    airX = final ? 24400 : 10600;
  let jumping = false,
    boosting = false,
    burst = false,
    down = false;
  press('ArrowRight', true);
  for (let i = 0; i < 450 && mode === 'playing'; i++) {
    if (jumping && (p.ground || p.vy >= 0)) {
      release('Space', true);
      jumping = false;
    }
    const gate = level.hazards.find((h) => h.type === 'gate' && h.x + h.w > p.x && h.x - p.x < 100);
    if (!!gate !== down) {
      (gate ? press : release)('ArrowDown', true);
      down = !!gate;
    }
    if (gate && p.ground && !p.roll) {
      release('ArrowDown', true);
      press('ArrowDown', true);
    }
    if (!final && !jumping && p.ground && p.x > 9140 && p.x < 9400) {
      press('Space', true);
      jumping = true;
    }
    if (!boosting && p.x > boostX) {
      press('ShiftLeft', true);
      boosting = true;
    }
    if (!jumping && p.ground && p.x > jumpX && p.x < jumpX + 100) {
      press('Space', true);
      jumping = true;
    }
    if (!burst && !p.ground && p.x > airX && p.y < 180) {
      release('ShiftLeft', true);
      press('ShiftLeft', true);
      burst = true;
    }
    update();
    if (p.ground && p.surface.routeType === 'boost') break;
    if (stats.deaths) break;
  }
  for (const key of ['ArrowRight', 'ArrowDown', 'Space', 'ShiftLeft']) release(key, true);
  draw();
  return { state: readGameState(), surface: p.surface?.id, burst };
}
module.exports = { act1RouteReplay, act1ExpressReplay };
