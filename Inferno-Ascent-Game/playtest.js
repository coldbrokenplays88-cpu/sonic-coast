// Generated from src/playtest.js; run npm run build:compat after source edits.
'use strict';
function isPlaytest() {
  return selectedAct === 'playtest';
}

function clearPlaytestInput() {
  keys.clear();
  if (playtestState) {
    playtestState.player.dash = null;
    Object.assign(playtestState.player.boost, { held: false, active: false, remaining: 0 });
    playtestState.boostPressed = false;
    playtestState.boostPressAirborne = false;
    playtestState.rollPressed = false;
    playtestState.jumpPressed = false;
    if (playtestState.player.air) {
      playtestState.player.air.cutEligible = false;
      playtestState.player.air.jumpLift = 0;
    }
  }
}

function resetPlaytest(
  scenario = playtestState.player?.scenario || 'flat',
  reason = 'manual reset'
) {
  keys.clear();
  const spawn = motionSpawn(scenario);
  Object.assign(playtestState, {
    frames: 0,
    rollPressed: false,
    jumpPressed: false,
    boostPressed: false,
    boostPressAirborne: false,
    player: createMotionPlayer(scenario),
    camera: {
      x: spawn.x - W / 2,
      y: spawn.y - H * 0.66,
      zoom: 1,
    },
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
    'Static-surface + devices experiment · Space: jump · Down: roll · At rest: hold Down + Space to charge, release Down to Spin Dash · Shift/X: Boost · gold rail = free Boost. R resets.';
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
    'PLAYTEST static terrain experiment. Left and right move, Down rolls, Space jumps; release for a short hop. P pauses, R resets. Buttons select flat, valley, crest, gap, wall or low ceiling. Down + Space charges Spin Dash at rest; release Down to launch. Shift or X uses Boost; gold rail sections have free Boost. STAGE returns to either act.'
  );
  for (const scenario of Object.keys(motionFixtures))
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
    if (
      ['ShiftLeft', 'ShiftRight', 'KeyX', 'MouseBoost'].includes(code) &&
      !['ShiftLeft', 'ShiftRight', 'KeyX', 'MouseBoost'].some((k) => keys.has(k))
    ) {
      playtestState.boostPressed = true;
      playtestState.boostPressAirborne = playtestState.player.mode === 'airborne';
    }
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

function updatePlaytest() {
  if (mode === 'playing') {
    const direction =
      Number(keys.has('ArrowRight') || keys.has('KeyD')) -
      Number(keys.has('ArrowLeft') || keys.has('KeyA'));
    const player = playtestState.player;
    stepMotionPlayer(player, {
      direction,
      down: playtestState.rollPressed || keys.has('ArrowDown') || keys.has('KeyS'),
      jumpPressed: playtestState.jumpPressed,
      jumpHeld: ['Space', 'ArrowUp', 'KeyW'].some((k) => keys.has(k)),
      boostHeld: ['ShiftLeft', 'ShiftRight', 'KeyX', 'MouseBoost'].some((k) => keys.has(k)),
      boostPressed: playtestState.boostPressed,
      boostPressAirborne: playtestState.boostPressAirborne,
    });
    playtestState.rollPressed = false;
    playtestState.jumpPressed = false;
    playtestState.boostPressed = false;
    playtestState.boostPressAirborne = false;
    playtestState.frames++;
    if (player.boundary) resetPlaytest(player.scenario, player.boundary);
    else {
      const contact = motionContact(player),
        camera = playtestState.camera;
      // Tick-based following: render schedules cannot alter camera or physics.
      const path = motionFixtures[player.scenario].path;
      const look = path ? Math.max(-W * 0.25, Math.min(W * 0.25, contact.vx * 8)) : contact.vx * 8;
      camera.x += (contact.x - W / 2 + look - camera.x) * 0.12;
      camera.y += (contact.y - H * 0.66 - camera.y) * 0.12;
      if (path) {
        camera.x = Math.max(
          contact.center.x - W * 0.9,
          Math.min(contact.center.x - W * 0.1, camera.x)
        );
        camera.y = Math.max(
          contact.center.y - H * 0.85,
          Math.min(contact.center.y - H * 0.42, camera.y)
        );
      }
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
    c = motionContact(player);
  $('#playtest-mode').textContent =
    String(mode).toUpperCase() +
    ' / ' +
    player.mode.toUpperCase() +
    ' / ' +
    (player.railId ? 'GRINDING' : player.posture.toUpperCase()) +
    (player.dash ? ' / CHARGING' : '');
  $('#playtest-frame').textContent = String(playtestState.frames);
  $('#playtest-input').textContent = [...keys].join(', ') || 'none';
  $('#playtest-debug').textContent =
    `${motionTuning.revision} · ${player.scenario} · gsp ${c.grounded ? c.speed.toFixed(3) : '—'} · v(${c.vx.toFixed(3)}, ${c.vy.toFixed(3)}) · angle ${(((c.surfaceAngle ?? c.angle) * 180) / Math.PI).toFixed(2)}°\n` +
    `${c.grounded ? 'CONTACT' : 'AIR REF'} (${c.x.toFixed(2)}, ${c.y.toFixed(2)}) · body ${c.width}×${c.height} · center (${c.center.x.toFixed(2)}, ${c.center.y.toFixed(2)}) · normal ${c.grounded ? `(${c.nx.toFixed(3)}, ${c.ny.toFixed(3)})` : 'none'} · N ${c.normalReaction.toFixed(3)}${c.uprightGrip ? ' · UPRIGHT CREST GRIP' : ''}${c.steepGrip ? ' · STEEP GRIP ≥2.5' : ''}\n` +
    `Boost ${player.boost.meter.toFixed(2)}/90${c.infiniteBoost && player.railId ? ' FREE RAIL' : ''} · burst ${player.boost.remaining}/18 · air ${player.boost.airUsed ? 'used' : 'ready'} · rail ${player.railId || 'none'} · dash ${player.dash?.charge || 0}/30 · support ${player.supportId || 'terrain / air'} · springs ${player.springLaunches} · ${player.pathS != null ? 'path s ' + player.pathS.toFixed(2) + ' · ' : ''}${player.latestTransition} · controller ticks ${player.ticks} · reset ${playtestState.resetCount}: ${playtestState.resetReason}`;
}

function readPlaytestState() {
  const player = playtestState.player;
  return {
    act: 'playtest',
    status: mode,
    movementImplemented: true,
    tuning: motionTuning.revision,
    frame: playtestState.frames,
    player: { ...player },
    contact: motionContact(player),
    energy:
      player.mode === 'grounded'
        ? motionFixtures[player.scenario].path
          ? player.speed ** 2 / 2 + groundTuning.gravity * (650 - player.y)
          : groundEnergy(player, sampleMotionExtension)
        : null,
    camera: { ...playtestState.camera },
    inputs: [...keys],
    resetCount: playtestState.resetCount,
    resetReason: playtestState.resetReason,
  };
}

function drawGroundPlayer(player) {
  const c = motionContact(player),
    rolling = player.posture === 'rolling';
  ctx.save();
  const footShift = c.grounded ? Math.hypot(c.center.x - c.x, c.center.y - c.y) - c.height / 2 : 0;
  ctx.translate(c.x + c.nx * footShift, c.y + c.ny * footShift);
  ctx.rotate(c.angle);
  const sheet =
    (player.railId || player.boost.active) && art.supplemental
      ? 'supplemental'
      : art.recoveredSpeedster
        ? 'recoveredSpeedster'
        : 'recoveredPeelout';
  const index =
    sheet === 'supplemental'
      ? (player.railId ? 16 : 8) + (Math.floor(player.ticks / 3) % 8)
      : rolling
        ? 26 + (Math.floor(player.dash ? player.ticks / 2 : player.distance / 10) % 3)
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
  ctx.fillRect(-3, c.grounded ? footShift - 3 : -c.height / 2 - 3, 6, 6);
  if (c.grounded) {
    ctx.beginPath();
    ctx.moveTo(0, footShift);
    ctx.lineTo(0, footShift - 65);
    ctx.stroke();
  }
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
  const path = motionFixtures[player.scenario].path;
  if (path)
    for (const piece of path.pieces) {
      const samples = [];
      for (let s = piece.start; s < piece.end; s += 4) samples.push(samplePath(path, s));
      samples.push(samplePath(path, piece.end));
      ctx.beginPath();
      samples.forEach((p, i) => (i ? ctx.lineTo(p.x, p.y) : ctx.moveTo(p.x, p.y)));
      for (const p of [...samples].reverse())
        ctx.lineTo(p.x - p.nx * path.thickness, p.y - p.ny * path.thickness);
      ctx.closePath();
      ctx.fillStyle = '#39355f';
      ctx.fill();
      ctx.beginPath();
      samples.forEach((p, i) => (i ? ctx.lineTo(p.x, p.y) : ctx.moveTo(p.x, p.y)));
      ctx.strokeStyle = '#61d9f1';
      ctx.lineWidth = 3;
      ctx.stroke();
    }
  for (const box of motionFixtures[player.scenario].boxes) {
    ctx.fillStyle = '#6d396c';
    ctx.fillRect(box.x1, box.y1, box.x2 - box.x1, box.y2 - box.y1);
    ctx.strokeStyle = '#ffae44';
    ctx.strokeRect(box.x1, box.y1, box.x2 - box.x1, box.y2 - box.y1);
  }
  const fixture = motionFixtures[player.scenario];
  for (const rail of fixture.rails || [])
    for (const piece of rail.pieces) {
      ctx.beginPath();
      ctx.moveTo(piece.x1, sampleExperimentalRail(rail, piece.x1).y);
      for (let x = piece.x1 + 4; x < piece.x2; x += 4)
        ctx.lineTo(x, sampleExperimentalRail(rail, x).y);
      ctx.lineTo(piece.x2, sampleExperimentalRail(rail, piece.x2).y);
      ctx.strokeStyle = piece.infiniteBoost ? '#ffd54a' : '#61d9f1';
      ctx.lineWidth = 5;
      ctx.stroke();
      ctx.fillStyle = piece.infiniteBoost ? '#ffd54a' : '#b4b9d2';
      ctx.font = '12px monospace';
      ctx.fillText(
        piece.infiniteBoost ? 'FREE BOOST' : 'GRIND RAIL',
        (piece.x1 + piece.x2) / 2,
        sampleExperimentalRail(rail, (piece.x1 + piece.x2) / 2).y + 30
      );
    }
  for (const platform of fixture.platforms || []) {
    const box = experimentalPlatformPose(platform, player.ticks);
    ctx.fillStyle = '#39355f';
    ctx.fillRect(box.x1, box.y1, box.x2 - box.x1, box.y2 - box.y1);
    ctx.strokeStyle = '#61d9f1';
    ctx.strokeRect(box.x1, box.y1, box.x2 - box.x1, box.y2 - box.y1);
    ctx.fillStyle = '#b4b9d2';
    ctx.fillText(platform.id, (box.x1 + box.x2) / 2, box.y2 + 18);
  }
  for (const spring of fixture.springs || []) {
    const face = experimentalSpringPose(spring, player.ticks, fixture);
    ctx.save();
    ctx.translate(face.x, face.y);
    ctx.rotate(Math.atan2(face.ty, face.tx));
    ctx.fillStyle = '#6d396c';
    ctx.fillRect(-24, 0, 48, 20);
    ctx.strokeStyle = '#b4b9d2';
    ctx.beginPath();
    ctx.moveTo(-10, 18);
    for (let y = 16; y > 2; y -= 3) ctx.lineTo(y % 2 ? -10 : 10, y);
    ctx.stroke();
    ctx.fillStyle = '#ffd54a';
    ctx.fillRect(-24, 0, 48, 5);
    ctx.fillStyle = '#ffffff';
    ctx.font = '12px monospace';
    ctx.textAlign = 'center';
    ctx.fillText('↑', 0, -8);
    ctx.restore();
  }
  const limit = motionBounds(player.scenario);
  ctx.textAlign = 'center';
  ctx.font = '14px monospace';
  for (const x of [-limit, limit]) {
    const marker = path
      ? samplePath(path, x < 0 ? 0 : path.length)
      : sampleMotionExtension(player.scenario, x);
    const markerX = marker.x,
      y = marker.y;
    ctx.fillStyle = '#ffae44';
    ctx.fillRect(markerX - 2, y - 170, 4, 170);
    ctx.fillText('TEST BOUNDARY → RESET', markerX - Math.sign(x) * 120, y - 130);
  }
  const spawn = motionSpawn(player.scenario);
  ctx.fillStyle = '#b4b9d2';
  ctx.fillText('SAFE SPAWN · R RESET', spawn.x, spawn.y + 45);
  drawGroundPlayer(player);
  ctx.restore();
}

let playtestState = null;
