// Generated from src/playtest.js; run npm run build:compat after source edits.
'use strict';
function isPlaytest() {
  return selectedAct === 'playtest';
}

function resetPlaytest() {
  keys.clear();
  Object.assign(playtestState, {
    frames: 0,
    marker: { x: 480, y: 340 },
    camera: { x: 0, y: 0, zoom: 1 },
  });
  last = 0;
  acc = 0;
  updatePlaytestHud();
}

function setupPlaytest() {
  const previousCanvasLabel =
    playtestState?.previousCanvasLabel ?? canvas.getAttribute?.('aria-label');
  playtestState = { previousCanvasLabel };
  level = { act: 'playtest', title: 'PLAYTEST' };
  stageRuntime = null;
  boss = null;
  bossCheckpoint = null;
  ending = null;
  charge = 0;
  jumpBuffer = 0;
  coyote = 0;
  cam = 0;
  camY = 0;
  zoom = 1;
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
  window.syncGameMusic?.({ enabled: false, mode: 'ready' });
  resetPlaytest();
}

function exitPlaytest() {
  if (!playtestState) return;
  keys.clear();
  charge = 0;
  jumpBuffer = 0;
  $('#game-shell').classList.remove('playtest');
  $('#playtest-status').hidden = true;
  $('#game-controls').hidden = false;
  $('#playtest-controls').hidden = true;
  $('#game-hint').hidden = false;
  if (playtestState.previousCanvasLabel)
    canvas.setAttribute('aria-label', playtestState.previousCanvasLabel);
  playtestState = null;
}

function handlePlaytestInput(code, pressed) {
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
  if (mode === 'playing') keys.add(code);
  updatePlaytestHud();
}

function updatePlaytest() {
  if (mode === 'playing') playtestState.frames++;
  updatePlaytestHud();
}

function updatePlaytestHud() {
  $('#playtest-mode').textContent = String(mode).toUpperCase();
  $('#playtest-frame').textContent = String(playtestState.frames);
  $('#playtest-input').textContent = [...keys].join(', ') || 'none';
}

function readPlaytestState() {
  return {
    act: 'playtest',
    status: mode,
    movementImplemented: false,
    frame: playtestState.frames,
    marker: { ...playtestState.marker },
    camera: { ...playtestState.camera },
    inputs: [...keys],
  };
}

function drawPlaytest() {
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

let playtestState = null;
