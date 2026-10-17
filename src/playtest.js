// Diagnostic scene only. Experimental movement has not been implemented.
import { state as runtimeState } from './state.js';
import { $, H, W, canvas, ctx, keys, p, pause, restart } from './game.js';
import { syncGameMusic } from './game-music.js';
export let playtestState;

export function isPlaytest() {
  return runtimeState.selectedAct === 'playtest';
}

export function resetPlaytest() {
  keys.clear();
  Object.assign(playtestState, {
    frames: 0,
    marker: { x: 480, y: 340 },
    camera: { x: 0, y: 0, zoom: 1 },
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
    'Experimental movement is not implemented yet. The player marker is stationary.';
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
    'PLAYTEST diagnostic scene. Stationary player marker; movement is not implemented. P pauses or resumes, R resets, F toggles fullscreen. Use the stage selector to return to either act.'
  );
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
  if (runtimeState.mode === 'playing') keys.add(code);
  updatePlaytestHud();
}

export function updatePlaytest() {
  if (runtimeState.mode === 'playing') playtestState.frames++;
  updatePlaytestHud();
}

export function updatePlaytestHud() {
  $('#playtest-mode').textContent = String(runtimeState.mode).toUpperCase();
  $('#playtest-frame').textContent = String(playtestState.frames);
  $('#playtest-input').textContent = [...keys].join(', ') || 'none';
}

export function readPlaytestState() {
  return {
    act: 'playtest',
    status: runtimeState.mode,
    movementImplemented: false,
    frame: playtestState.frames,
    marker: { ...playtestState.marker },
    camera: { ...playtestState.camera },
    inputs: [...keys],
  };
}

export function drawPlaytest() {
  ctx.save();
  ctx.scale(canvas.width / W, canvas.height / H);
  ctx.imageSmoothingEnabled = false;
  ctx.fillStyle = '#0d082d';
  ctx.fillRect(0, 0, W, H);
  const camera = playtestState.camera;
  ctx.scale(camera.zoom, camera.zoom);
  ctx.translate(-camera.x, -camera.y);
  ctx.fillStyle = '#242142';
  for (let x = 0; x < W; x += 32) ctx.fillRect(x, 130, 1, H - 130);
  for (let y = 140; y < H; y += 32) ctx.fillRect(0, y, W, 1);
  ctx.textAlign = 'center';
  ctx.fillStyle = '#ffd54a';
  ctx.font = 'bold 32px monospace';
  ctx.fillText('PLAYTEST', W / 2, 190);
  ctx.fillStyle = '#ffffff';
  ctx.font = '16px monospace';
  ctx.fillText('Isolated momentum prototype scaffold', W / 2, 222);
  const { x, y } = playtestState.marker;
  ctx.fillStyle = '#61d9f1';
  ctx.fillRect(x - 18, y - 30, 36, 60);
  ctx.fillStyle = '#1c52cc';
  ctx.fillRect(x - 12, y - 24, 24, 48);
  ctx.fillStyle = '#ffd54a';
  ctx.fillRect(x - 4, y - 4, 8, 8);
  ctx.fillStyle = '#ffffff';
  ctx.fillText('PLAYER MARKER · STATIONARY', x, y + 65);
  ctx.fillStyle = '#b4b9d2';
  ctx.font = '14px monospace';
  ctx.fillText('Fixed camera (0, 0) · Zoom 1.0 · No movement controller', W / 2, H - 65);
  ctx.fillText('Use STAGE above to return to Act 1 or Act 2', W / 2, H - 35);
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
