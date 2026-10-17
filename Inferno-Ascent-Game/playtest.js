// Generated from src/playtest.js; run npm run build:compat after source edits.
'use strict';
function isPlaytest() {
  return selectedAct === 'playtest';
}

function clearPlaytestInput() {
  keys.clear();
  if (playtestState) playtestState.rollPressed = false;
}

function resetPlaytest(
  scenario = playtestState.player?.scenario || 'flat',
  reason = 'manual reset'
) {
  keys.clear();
  Object.assign(playtestState, {
    frames: 0,
    rollPressed: false,
    player: createGroundPlayer(scenario),
    camera: { x: -W / 2, y: sampleGround(scenario, 0).y - H * 0.66, zoom: 1 },
    resetCount: (playtestState.resetCount ?? -1) + 1,
    resetReason: reason,
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
    'Ground-only experiment · No jump / boost / Spin Dash. Boundaries reset to the flat spawn.';
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
    'PLAYTEST ground experiment. Left and right move, Down enters a roll while moving. P pauses or resumes, R resets. Flat reset and Valley reset select benchmarks. Jump, boost and Spin Dash are disabled. Use the stage selector to return to either act.'
  );
  for (const scenario of ['flat', 'valley'])
    $('#playtest-' + scenario).onclick = () => {
      resetPlaytest(scenario);
      canvas.focus();
    };
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
  if (mode === 'playing') {
    if ((code === 'ArrowDown' || code === 'KeyS') && !keys.has(code))
      playtestState.rollPressed = true;
    keys.add(code);
  }
  updatePlaytestHud();
}

function updatePlaytest() {
  if (mode === 'playing') {
    const direction =
      Number(keys.has('ArrowRight') || keys.has('KeyD')) -
      Number(keys.has('ArrowLeft') || keys.has('KeyA'));
    const player = playtestState.player;
    stepGroundPlayer(player, {
      direction,
      down: playtestState.rollPressed || keys.has('ArrowDown') || keys.has('KeyS'),
    });
    playtestState.rollPressed = false;
    playtestState.frames++;
    if (player.boundary) resetPlaytest(player.scenario, player.boundary);
    else {
      const contact = groundContact(player),
        camera = playtestState.camera;
      // Tick-based following: render schedules cannot alter camera or physics.
      camera.x += (contact.x - W / 2 + contact.vx * 8 - camera.x) * 0.12;
      camera.y += (contact.y - H * 0.66 - camera.y) * 0.12;
    }
  }
  updatePlaytestHud();
}

function framePlaytest(time) {
  if (!last) last = time;
  const elapsed = Math.min(250, Math.max(0, time - last));
  last = time;
  if (mode === 'playing' && !testControlled) {
    acc += elapsed;
    const tick = 1000 / groundTuning.hz;
    // Tolerance only removes floating-point loss at an exact tick boundary.
    while (acc + 1e-7 >= tick) {
      acc = Math.max(0, acc - tick);
      updatePlaytest();
    }
  } else acc = 0;
  drawPlaytest();
  requestAnimationFrame(frame);
}

function updatePlaytestHud() {
  const player = playtestState.player,
    c = groundContact(player);
  $('#playtest-mode').textContent =
    String(mode).toUpperCase() + ' / ' + player.posture.toUpperCase();
  $('#playtest-frame').textContent = String(playtestState.frames);
  $('#playtest-input').textContent = [...keys].join(', ') || 'none';
  $('#playtest-debug').textContent =
    `${groundTuning.revision} · ${player.scenario} · speed ${c.speed.toFixed(3)} · v(${c.vx.toFixed(3)}, ${c.vy.toFixed(3)}) · angle ${((c.angle * 180) / Math.PI).toFixed(2)}°\n` +
    `CONTACT (${c.x.toFixed(2)}, ${c.y.toFixed(2)}) · body ${c.width}×${c.height} · center (${c.center.x.toFixed(2)}, ${c.center.y.toFixed(2)}) · N ${c.normalReaction.toFixed(3)}\n` +
    `controller ticks ${player.ticks} · reset ${playtestState.resetCount}: ${playtestState.resetReason}`;
}

function readPlaytestState() {
  const player = playtestState.player;
  return {
    act: 'playtest',
    status: mode,
    movementImplemented: true,
    tuning: groundTuning.revision,
    frame: playtestState.frames,
    player: { ...player },
    contact: groundContact(player),
    energy: groundEnergy(player),
    camera: { ...playtestState.camera },
    inputs: [...keys],
    resetCount: playtestState.resetCount,
    resetReason: playtestState.resetReason,
  };
}

function drawGroundPlayer(player) {
  const c = groundContact(player),
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
  // Collision overlay is deliberate: contact is the origin, never legacy p.y.
  ctx.strokeStyle = '#61d9f1';
  ctx.lineWidth = 1;
  if (rolling) {
    ctx.beginPath();
    ctx.arc(0, -19, 19, 0, Math.PI * 2);
    ctx.stroke();
  } else ctx.strokeRect(-c.width / 2, -c.height, c.width, c.height);
  ctx.fillStyle = '#ffd54a';
  ctx.fillRect(-3, -3, 6, 6);
  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.lineTo(0, -65);
  ctx.stroke();
  ctx.restore();
}

function drawPlaytest() {
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
  ctx.beginPath();
  ctx.moveTo(left, camera.y + H + 2000);
  for (let x = left; x <= right; x += 4) ctx.lineTo(x, sampleGround(player.scenario, x).y);
  ctx.lineTo(right, camera.y + H + 2000);
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = '#61d9f1';
  ctx.lineWidth = 3;
  ctx.beginPath();
  for (let x = left; x <= right; x += 4) {
    const y = sampleGround(player.scenario, x).y;
    if (x === left) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  }
  ctx.stroke();
  const limit = groundBounds(player.scenario);
  ctx.textAlign = 'center';
  ctx.font = '14px monospace';
  for (const x of [-limit, limit]) {
    const y = sampleGround(player.scenario, x).y;
    ctx.fillStyle = '#ffae44';
    ctx.fillRect(x - 2, y - 170, 4, 170);
    ctx.fillText('TEST BOUNDARY → RESET', x - Math.sign(x) * 120, y - 130);
  }
  const spawn = sampleGround(player.scenario, 0);
  ctx.fillStyle = '#b4b9d2';
  ctx.fillText('SAFE FLAT SPAWN · R RESET', 0, spawn.y + 45);
  drawGroundPlayer(player);
  ctx.restore();
}

let playtestState = null;
