// Isolated static-surface experiment. Legacy player state is never advanced here.
import { state as runtimeState } from './state.js';
import { $, H, W, art, canvas, ctx, frame, keys, p, pause, restart } from './game.js';
import { syncGameMusic } from './game-music.js';
import { groundEnergy, groundTuning } from './playtest-ground.js';
import {
  createMotionPlayer,
  motionBounds,
  motionContact,
  motionFixtures,
  motionSpans,
  motionTuning,
  sampleMotionExtension,
  stepMotionPlayer,
} from './playtest-motion.js';
import { recoveredSpriteFrames } from './recovered-art.js';
export let playtestState;

export function isPlaytest() {
  return runtimeState.selectedAct === 'playtest';
}

export function clearPlaytestInput() {
  keys.clear();
  if (playtestState) {
    playtestState.rollPressed = false;
    playtestState.jumpPressed = false;
    if (playtestState.player.air) {
      playtestState.player.air.cutEligible = false;
      playtestState.player.air.jumpLift = 0;
    }
  }
}

export function resetPlaytest(
  scenario = playtestState.player?.scenario || 'flat',
  reason = 'manual reset'
) {
  keys.clear();
  Object.assign(playtestState, {
    frames: 0,
    rollPressed: false,
    jumpPressed: false,
    player: createMotionPlayer(scenario),
    camera: {
      x: motionFixtures[scenario].spawn - W / 2,
      y: sampleMotionExtension(scenario, motionFixtures[scenario].spawn).y - H * 0.66,
      zoom: 1,
    },
    resetCount: (playtestState.resetCount ?? -1) + 1,
    resetReason: reason,
  });
  runtimeState.last = 0;
  runtimeState.acc = 0;
  updatePlaytestHud();
}

export function setupPlaytest() {
  const previousCanvasLabel =
    playtestState?.previousCanvasLabel ?? canvas.getAttribute?.('aria-label');
  playtestState = { previousCanvasLabel };
  runtimeState.level = { act: 'playtest', title: 'PLAYTEST' };
  runtimeState.stageRuntime = null;
  runtimeState.boss = null;
  runtimeState.bossCheckpoint = null;
  runtimeState.ending = null;
  runtimeState.charge = 0;
  runtimeState.jumpBuffer = 0;
  runtimeState.coyote = 0;
  runtimeState.cam = 0;
  runtimeState.camY = 0;
  runtimeState.zoom = 1;
  Object.assign(p, {
    jumpHeld: false,
    downHeld: false,
    airBoostRequested: false,
    groundBoostHeld: false,
    airBoostFrames: 0,
    airBoostActive: false,
    boosting: false,
    loop: null,
  });
  $('#game-shell').classList.add('playtest');
  $('#playtest-status').hidden = false;
  $('#playtest-status').textContent =
    'Static-surface experiment · Space: jump / release: short hop · No boost or Spin Dash. R resets fixture.';
  $('#game-controls').hidden = true;
  $('#playtest-controls').hidden = false;
  $('#game-hint').hidden = true;
  $('#ending-loading').hidden = true;
  $('#score').hidden = true;
  $('#toast').style.display = 'none';
  $('.brand-sub').textContent = 'PLAYTEST';
  $('#act-title').textContent = 'PLAYTEST';
  $('#act-select').value = 'playtest';
  canvas.setAttribute(
    'aria-label',
    'PLAYTEST static terrain experiment. Left and right move, Down rolls, Space jumps; release for a short hop. P pauses, R resets. Buttons select flat, valley, crest, gap, wall or low ceiling. Boost and Spin Dash are disabled. STAGE returns to either act.'
  );
  for (const scenario of Object.keys(motionFixtures))
    $('#playtest-' + scenario).onclick = () => {
      resetPlaytest(scenario);
      canvas.focus();
    };
  syncGameMusic?.({ enabled: false, mode: 'ready' });
  resetPlaytest();
}

export function exitPlaytest() {
  if (!playtestState) return;
  keys.clear();
  runtimeState.charge = 0;
  runtimeState.jumpBuffer = 0;
  $('#game-shell').classList.remove('playtest');
  $('#playtest-status').hidden = true;
  $('#game-controls').hidden = false;
  $('#playtest-controls').hidden = true;
  $('#game-hint').hidden = false;
  if (playtestState.previousCanvasLabel)
    canvas.setAttribute('aria-label', playtestState.previousCanvasLabel);
  playtestState = null;
}

export function handlePlaytestInput(code, pressed) {
  if (!pressed) {
    keys.delete(code);
    updatePlaytestHud();
    return;
  }
  if (code === 'KeyP' || code === 'Escape') {
    pause();
    return;
  }
  if (code === 'KeyR') {
    restart();
    return;
  }
  if (runtimeState.mode === 'playing') {
    if (
      ['Space', 'ArrowUp', 'KeyW'].includes(code) &&
      !['Space', 'ArrowUp', 'KeyW'].some((k) => keys.has(k)) &&
      playtestState.player.mode === 'grounded'
    )
      playtestState.jumpPressed = true;
    if ((code === 'ArrowDown' || code === 'KeyS') && !keys.has(code))
      playtestState.rollPressed = true;
    keys.add(code);
  }
  updatePlaytestHud();
}

export function updatePlaytest() {
  if (runtimeState.mode === 'playing') {
    const direction =
      Number(keys.has('ArrowRight') || keys.has('KeyD')) -
      Number(keys.has('ArrowLeft') || keys.has('KeyA'));
    const player = playtestState.player;
    stepMotionPlayer(player, {
      direction,
      down: playtestState.rollPressed || keys.has('ArrowDown') || keys.has('KeyS'),
      jumpPressed: playtestState.jumpPressed,
      jumpHeld: ['Space', 'ArrowUp', 'KeyW'].some((k) => keys.has(k)),
    });
    playtestState.rollPressed = false;
    playtestState.jumpPressed = false;
    playtestState.frames++;
    if (player.boundary) resetPlaytest(player.scenario, player.boundary);
    else {
      const contact = motionContact(player),
        camera = playtestState.camera;
      // Tick-based following: render schedules cannot alter camera or physics.
      camera.x += (contact.x - W / 2 + contact.vx * 8 - camera.x) * 0.12;
      camera.y += (contact.y - H * 0.66 - camera.y) * 0.12;
    }
  }
  updatePlaytestHud();
}

export function framePlaytest(time) {
  if (!runtimeState.last) runtimeState.last = time;
  const elapsed = Math.min(250, Math.max(0, time - runtimeState.last));
  runtimeState.last = time;
  if (runtimeState.mode === 'playing' && !runtimeState.testControlled) {
    runtimeState.acc += elapsed;
    const tick = 1000 / groundTuning.hz;
    // Tolerance only removes floating-point loss at an exact tick boundary.
    while (runtimeState.acc + 1e-7 >= tick) {
      runtimeState.acc = Math.max(0, runtimeState.acc - tick);
      updatePlaytest();
    }
  } else runtimeState.acc = 0;
  drawPlaytest();
  requestAnimationFrame(frame);
}

export function updatePlaytestHud() {
  const player = playtestState.player,
    c = motionContact(player);
  $('#playtest-mode').textContent =
    String(runtimeState.mode).toUpperCase() +
    ' / ' +
    player.mode.toUpperCase() +
    ' / ' +
    player.posture.toUpperCase();
  $('#playtest-frame').textContent = String(playtestState.frames);
  $('#playtest-input').textContent = [...keys].join(', ') || 'none';
  $('#playtest-debug').textContent =
    `${motionTuning.revision} · ${player.scenario} · gsp ${c.grounded ? c.speed.toFixed(3) : '—'} · v(${c.vx.toFixed(3)}, ${c.vy.toFixed(3)}) · angle ${((c.angle * 180) / Math.PI).toFixed(2)}°\n` +
    `${c.grounded ? 'CONTACT' : 'AIR REF'} (${c.x.toFixed(2)}, ${c.y.toFixed(2)}) · body ${c.width}×${c.height} · center (${c.center.x.toFixed(2)}, ${c.center.y.toFixed(2)}) · normal ${c.grounded ? `(${c.nx.toFixed(3)}, ${c.ny.toFixed(3)})` : 'none'} · N ${c.normalReaction.toFixed(3)}${c.uprightGrip ? ' · UPRIGHT CREST GRIP' : ''}\n` +
    `${player.latestTransition} · controller ticks ${player.ticks} · reset ${playtestState.resetCount}: ${playtestState.resetReason}`;
}

export function readPlaytestState() {
  const player = playtestState.player;
  return {
    act: 'playtest',
    status: runtimeState.mode,
    movementImplemented: true,
    tuning: motionTuning.revision,
    frame: playtestState.frames,
    player: { ...player },
    contact: motionContact(player),
    energy: player.mode === 'grounded' ? groundEnergy(player, sampleMotionExtension) : null,
    camera: { ...playtestState.camera },
    inputs: [...keys],
    resetCount: playtestState.resetCount,
    resetReason: playtestState.resetReason,
  };
}

export function drawGroundPlayer(player) {
  const c = motionContact(player),
    rolling = player.posture === 'rolling';
  ctx.save();
  ctx.translate(c.x, c.y);
  ctx.rotate(c.angle);
  const sheet = art.recoveredSpeedster ? 'recoveredSpeedster' : 'recoveredPeelout';
  const index = rolling
    ? 26 + (Math.floor(player.distance / 10) % 3)
    : Math.abs(player.speed) > 0.1
      ? Math.floor(player.distance / 12) % 8
      : 16;
  const im = art[sheet],
    descriptor = recoveredSpriteFrames[sheet]?.[index];
  if (im && descriptor) {
    const [left, top, right, bottom] = descriptor.bounds,
      sw = right - left,
      sh = bottom - top;
    const scale = rolling ? 38 / Math.max(sw, sh) : 48 / sh;
    const width = sw * scale,
      height = sh * scale;
    ctx.save();
    ctx.scale(player.facing, 1);
    ctx.drawImage(
      im,
      left,
      top,
      sw,
      sh,
      -width / 2,
      rolling ? -19 - height / 2 : -48,
      width,
      height
    );
    ctx.restore();
  } else {
    ctx.fillStyle = '#1c52cc';
    ctx.fillRect(-c.width / 2, -c.height, c.width, c.height);
  }
  // Ground anchor and airborne body center are deliberately distinct markers.
  ctx.strokeStyle = '#61d9f1';
  ctx.lineWidth = 1;
  if (rolling) {
    ctx.beginPath();
    ctx.arc(0, -19, 19, 0, Math.PI * 2);
    ctx.stroke();
  } else ctx.strokeRect(-c.width / 2, -c.height, c.width, c.height);
  ctx.fillStyle = c.grounded ? '#ffd54a' : '#f48bdf';
  ctx.fillRect(-3, c.grounded ? -3 : -c.height / 2 - 3, 6, 6);
  if (c.grounded) {
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(0, -65);
    ctx.stroke();
  }
  ctx.restore();
}

export function drawPlaytest() {
  ctx.save();
  ctx.scale(canvas.width / W, canvas.height / H);
  ctx.imageSmoothingEnabled = false;
  ctx.fillStyle = '#0d082d';
  ctx.fillRect(0, 0, W, H);
  const camera = playtestState.camera,
    player = playtestState.player;
  ctx.translate(-camera.x, -camera.y);
  const left = Math.floor(camera.x / 4) * 4,
    right = camera.x + W + 4;
  ctx.fillStyle = '#242142';
  for (let x = Math.floor(left / 100) * 100; x <= right; x += 100) {
    ctx.fillRect(x, camera.y, 1, H);
    ctx.fillStyle = '#b4b9d2';
    ctx.font = '12px monospace';
    ctx.fillText(String(x), x + 4, camera.y + H - 20);
    ctx.fillStyle = '#242142';
  }
  for (const span of motionSpans(player.scenario)) {
    const a = Math.max(left, span[0]),
      b = Math.min(right, span[1]);
    if (a > b) continue;
    ctx.beginPath();
    ctx.moveTo(a, camera.y + H + 2000);
    for (let x = a; x < b; x += 4) ctx.lineTo(x, sampleMotionExtension(player.scenario, x).y);
    ctx.lineTo(b, sampleMotionExtension(player.scenario, b).y);
    ctx.lineTo(b, camera.y + H + 2000);
    ctx.closePath();
    ctx.fillStyle = '#242142';
    ctx.fill();
    ctx.strokeStyle = '#61d9f1';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(a, sampleMotionExtension(player.scenario, a).y);
    for (let x = a + 4; x < b; x += 4) ctx.lineTo(x, sampleMotionExtension(player.scenario, x).y);
    ctx.lineTo(b, sampleMotionExtension(player.scenario, b).y);
    ctx.stroke();
  }
  for (const box of motionFixtures[player.scenario].boxes) {
    ctx.fillStyle = '#6d396c';
    ctx.fillRect(box.x1, box.y1, box.x2 - box.x1, box.y2 - box.y1);
    ctx.strokeStyle = '#ffae44';
    ctx.strokeRect(box.x1, box.y1, box.x2 - box.x1, box.y2 - box.y1);
  }
  const limit = motionBounds(player.scenario);
  ctx.textAlign = 'center';
  ctx.font = '14px monospace';
  for (const x of [-limit, limit]) {
    const y = sampleMotionExtension(player.scenario, x).y;
    ctx.fillStyle = '#ffae44';
    ctx.fillRect(x - 2, y - 170, 4, 170);
    ctx.fillText('TEST BOUNDARY → RESET', x - Math.sign(x) * 120, y - 130);
  }
  const spawn = sampleMotionExtension(player.scenario, motionFixtures[player.scenario].spawn);
  ctx.fillStyle = '#b4b9d2';
  ctx.fillText('SAFE SPAWN · R RESET', spawn.x, spawn.y + 45);
  drawGroundPlayer(player);
  ctx.restore();
}

export function initializeRuntimeModule() {
  playtestState = null;
}

export function getRuntimeBindings() {
  return {
    playtestState: {
      get: () => playtestState,
      set: (value) => {
        playtestState = value;
      },
    },
  };
}
