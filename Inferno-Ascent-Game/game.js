// Generated from src/game.js; run npm run build:compat after source edits.
'use strict';
function loadArt(name) {
  if (artLoads.has(name)) return artLoads.get(name);
  const image = new Image();
  const loading = new Promise((resolve) => {
    image.onload = () => {
      art[name] = image;
      if (name === 'scorpion') prepareScorpionArt(image);
      resolve(true);
    };
    image.onerror = () => {
      failedArt.add(name);
      if (name === 'recoveredCity') loadArt('collapse');
      if (name === 'collapse') loadArt('city');
      if (failedArt.has('recoveredSpeedster') && failedArt.has('recoveredPeelout'))
        for (const fallback of legacySonicArt) loadArt(fallback);
      resolve(false);
    };
  });
  artLoads.set(name, loading);
  image.src = 'assets/' + artFiles[name];
  return loading;
}

function loadActArt(act) {
  for (const name of sharedArt) loadArt(name);
  for (const name of act === 2 ? ['recoveredCity', 'scorpion'] : ['city']) loadArt(name);
}

function reconstructPixels(source, w, h) {
  const out = new Uint32Array(w * h * 4),
    ow = w * 2;
  for (let y = 0; y < h; y++)
    for (let x = 0; x < w; x++) {
      const e = source[y * w + x],
        b = source[Math.max(0, y - 1) * w + x],
        d = source[y * w + Math.max(0, x - 1)],
        f = source[y * w + Math.min(w - 1, x + 1)],
        v = source[Math.min(h - 1, y + 1) * w + x],
        i = y * 2 * ow + x * 2,
        edge = b !== v && d !== f;
      out[i] = edge && d === b ? d : e;
      out[i + 1] = edge && b === f ? f : e;
      out[i + ow] = edge && d === v ? d : e;
      out[i + ow + 1] = edge && v === f ? f : e;
    }
  return out;
}

function cityTexture(im) {
  if (cityTextureCache.has(im)) return cityTextureCache.get(im);
  if (!document.createElement) return im;
  try {
    const source = document.createElement('canvas');
    source.width = im.width;
    source.height = im.height;
    const sc = source.getContext('2d', { willReadFrequently: true });
    sc.drawImage(im, 0, 0);
    const pixels = sc.getImageData(0, 0, im.width, im.height),
      sharp = document.createElement('canvas');
    sharp.width = im.width * 2;
    sharp.height = im.height * 2;
    const dc = sharp.getContext('2d'),
      result = dc.createImageData(sharp.width, sharp.height);
    new Uint32Array(result.data.buffer).set(
      reconstructPixels(new Uint32Array(pixels.data.buffer), im.width, im.height)
    );
    dc.putImageData(result, 0, 0);
    cityTextureCache.set(im, sharp);
    return sharp;
  } catch (error) {
    cityTextureCache.set(im, im);
    return im;
  }
}

function sizedCityBackdrop(im, w, h) {
  if (!document.createElement) return cityTexture(im);
  const width = Math.round((w * canvas.width) / W),
    height = Math.round((h * canvas.height) / H),
    key = width + 'x' + height;
  let entries = backdropScaleCache.get(im);
  if (!entries) {
    entries = new Map();
    backdropScaleCache.set(im, entries);
  }
  if (entries.has(key)) return entries.get(key);
  const c = document.createElement('canvas');
  c.width = width;
  c.height = height;
  const dc = c.getContext('2d');
  dc.imageSmoothingEnabled = false;
  dc.drawImage(cityTexture(im), 0, 0, width, height);
  entries.set(key, c);
  return c;
}

function drawCityBackdrop(im, x, y, w, h, mirrored = false, layered = false) {
  const texture = sizedCityBackdrop(im, w, h),
    drift = Math.sin(step * 0.004) * 18,
    unit = w / citySkyHeights.length;
  if (layered) {
    ctx.save();
    if (mirrored) {
      ctx.translate(x + w, y);
      ctx.scale(-1, 1);
      ctx.drawImage(texture, 0, 0, w, h);
    } else ctx.drawImage(texture, x, y, w, h);
    ctx.restore();
    return;
  }
  ctx.drawImage(texture, x, y, w, h);
  ctx.save();
  ctx.beginPath();
  ctx.moveTo(x, y);
  ctx.lineTo(x + w, y);
  for (let i = citySkyHeights.length - 1; i >= 0; i--) {
    const bottom = y + (h * citySkyHeights[i]) / 1024;
    ctx.lineTo(x + (i + 1) * unit, bottom);
    ctx.lineTo(x + i * unit, bottom);
  }
  ctx.closePath();
  ctx.clip();
  ctx.drawImage(texture, x + drift, y, w, h);
  // Neighboring tiles fill the narrow edges without seams or per-frame allocations.
  if (drift > 0) ctx.drawImage(texture, x + drift - w, y, w, h);
  else if (drift < 0) ctx.drawImage(texture, x + drift + w, y, w, h);
  ctx.restore();
}

function cityCloudLayer(im, w, h) {
  const texture = sizedCityBackdrop(im, w, h);
  if (!document.createElement) return null;
  let layer = cityCloudLayers.get(texture);
  if (layer) return layer;
  const image = document.createElement('canvas');
  image.width = texture.width;
  image.height = Math.floor((texture.height * 220) / im.height / 4) * 4;
  const dc = image.getContext('2d');
  dc.imageSmoothingEnabled = false;
  dc.drawImage(texture, 0, 0);
  dc.globalCompositeOperation = 'destination-out';
  // Fade source-pixel rows; nearest-neighbor sampling keeps their edges sharp.
  const fade = 64;
  for (let y = Math.max(0, image.height - fade); y < image.height; y += 4) {
    dc.globalAlpha = (y - image.height + fade) / (fade - 4);
    dc.fillRect(0, y, image.width, 4);
  }
  layer = { image, height: image.height / (canvas.height / H) };
  cityCloudLayers.set(texture, layer);
  return layer;
}

function drawCityClouds(im, w, h, top) {
  const layer = cityCloudLayer(im, w, h);
  if (!layer) return;
  const scroll = Math.round(cam * 0.035 + step * 0.1),
    first = Math.floor(scroll / w);
  for (let tile = first - 1; tile <= first + 1; tile++) {
    const left = tile * w - scroll;
    if (left + w < 0 || left > W) continue;
    ctx.save();
    if (tile % 2) {
      ctx.translate(left + w, top);
      ctx.scale(-1, 1);
      ctx.drawImage(layer.image, 0, 0, w, layer.height);
    } else ctx.drawImage(layer.image, left, top, w, layer.height);
    ctx.restore();
  }
}

function gameSound(name, options) {
  return window.playGameSound?.(name, options) ?? false;
}

function notify(t) {
  $('#toast').textContent = t;
  toastTime = 160;
  $('#toast').style.display = 'block';
}

function sparks(x, y, n = 8, color = '#ffda56') {
  for (let i = 0; i < n; i++)
    particles.push({
      x,
      y,
      vx: (Math.random() - 0.5) * 7,
      vy: -Math.random() * 6,
      life: 25,
      color,
    });
}

function setup() {
  p.act1Motion = null;
  if (isPlaytest()) {
    setupPlaytest();
    return;
  }
  exitPlaytest();
  loadActArt(selectedAct);
  window.syncGameMusic?.({
    enabled: sound,
    mode: 'ready',
    act: selectedAct,
    restart: true,
  });
  testControlled = false;
  level = configureBoostMonitors(
    selectedAct === 2 ? addMiddleSection(makeLevel2()) : makeLevel()
  );
  configureDirectionalSpikes(level);
  selectStageRuntime();
  END = level.end;
  setupBossEncounter();
  rings = level.rings;
  enemies = level.enemies.map((e, i) => ({
    ...e,
    alive: true,
    phase: i * 1.3,
  }));
  particles = [];
  clock = 0;
  runFrames = 0;
  count = 0;
  score = 0;
  lives = tuning.lives;
  checkpoint = 0;
  charge = 0;
  cam = 0;
  camY = 0;
  zoom = 1;
  boost = BOOST_MAX;
  stage = 0;
  shake = 0;
  keys.clear();
  visited.clear();
  stats = {
    jumps: 0,
    rolls: 0,
    hits: 0,
    deaths: 0,
    expressLandings: 0,
    recoveries: 0,
    rebound: 0,
    maxSpeed: 0,
    loops: 0,
    barriers: 0,
  };
  respawn();
  updateHud();
  $('#toast').style.display = 'none';
  $('#act-title').textContent = level.title || 'NEON EXPRESS';
  $('.brand-sub').textContent = level.title || 'NEON EXPRESS';
  $('#act-select').value = String(selectedAct);
}

function respawn() {
  resetTraversalAnimation();
  const c = level.checkpoints[checkpoint];
  resetPlatforms();
  Object.assign(p, {
    x: c.x,
    y: c.y - 20,
    vx: 0,
    vy: 0,
    ground: true,
    face: 1,
    inv: 80,
    roll: false,
    boosting: false,
    surface:
      level.surfaces.find((s) => s.id === c.surfaceId) ??
      level.surfaces.find(
        (s) => c.x >= s.x1 && c.x <= s.x2 && Math.abs(yOn(s, c.x) - c.y) < 2
      ) ??
      topAt(c.x)?.s ??
      null,
    hurt: 0,
    jumpAttack: false,
    airSpeedLimit: null,
    scriptedLaunch: false,
    jumpHeld: false,
    jumpCut: false,
    boostLocked: false,
    rolling: false,
    dashRolling: false,
    contactSpeed: null,
    interactionsFrame: -1,
    rollAge: 0,
    lowRollFrames: 0,
    rollSpent: false,
    downHeld: false,
    rollBuffer: 0,
    brakeActive: false,
    brakeAge: 0,
    brakeSpeed: 0,
    brakeFace: 1,
    stopFrame: -100,
    landFrame: -1,
    landKind: null,
    poseJumpFrame: -100,
    poseLandingFrame: -100,
    grindEntryFrame: -100,
    grindExitFrame: -100,
    grindFast: false,
    grindFromFast: false,
    loop: null,
    airLaunchUntil: 0,
    lastX: c.x,
    lastY: c.y - 20,
  });
  charge = 0;
  resetPlayerAbilities();
  p.poolTransfer = null;
  p.wrongRouteDrop = false;
  p.poolApproach = false;
  p.poolExit = false;
  resetBoostMonitors();
  coyote = tuning.coyote;
  jumpBuffer = 0;
  cam = Math.max(0, p.x - 230);
  camY = level.act === 2 ? p.y - H * 0.6 : 0;
  resetStageRuntime();
  resetCameraTracking();
  resetBossAttempt();
  resetAct1Motion();
  visited.clear();
  for (const r of rings) if (r.x >= c.x && r.x < c.x + 550) r.taken = false;
}

function start() {
  testControlled = false;
  if (mode === 'over' && bossCheckpoint) {
    lives = tuning.lives;
    respawn();
  } else if (['ready', 'over', 'win'].includes(mode)) setup();
  mode = 'playing';
  $('#overlay').classList.add('hidden');
  $('#pause').textContent = 'Ⅱ';
  if (isPlaytest()) clearPlaytestInput();
  else {
    keys.clear();
    clearAct1Input();
  }
  canvas.focus();
  gameSound('start');
  updateHud();
}

function show(title, text, label) {
  $('#overlay').classList.remove('hidden');
  $('.intro').innerHTML =
    `<span class="eyebrow">${isPlaytest() ? 'PLAYTEST' : `${level.title || 'NEON EXPRESS'} ACT ${selectedAct}`}</span><h1>${title}</h1><p>${text}</p><button id="play" class="primary">${label} <span>▶</span></button><span class="start-note">${isPlaytest() ? '← → / A D: move · Space: jump · Down: roll · P: pause · R: reset' : 'Tap / hold Space: jump height · Down: roll · Left click / Shift / X: boost'}</span>`;
  $('#play').onclick = start;
}

function pause() {
  if (mode === 'playing') {
    mode = 'paused';
    keys.clear();
    clearAct1Input();
    show(
      isPlaytest() ? 'PLAYTEST<br><em>paused.</em>' : 'Catch your<br><em>breath.</em>',
      isPlaytest()
        ? 'Static-surface experiment paused. Your movement state is preserved.'
        : 'Your run is paused.',
      'RESUME'
    );
    $('#pause').textContent = '▶';
    gameSound('pause');
    updateHud();
  } else if (mode === 'paused') start();
}

function die() {
  gameSound('death');
  lives--;
  stats.deaths++;
  count = 0;
  p.boosting = false;
  keys.clear();
  particles = particles.filter((a) => !a.ring);
  if (lives <= 0) {
    mode = 'over';
    show(
      'Another<br><em>shot?</em>',
      'Tap Jump for short hops. Roll under gantries.<br>Gold rails reward speed; blue lower rails offer another chance.',
      'TRY AGAIN'
    );
  } else {
    respawn();
    notify('Checkpoint • ' + level.checkpoints[checkpoint].name);
  }
  updateHud();
}

function hurt(x, gate = false) {
  if (p.inv > 0) return;
  stats.hits++;
  shake = 8;
  p.boosting = false;
  p.hurt = 22;
  p.jumpAttack = false;
  p.airSpeedLimit = null;
  p.airBoostFrames = 0;
  p.airBoostActive = false;
  p.bubbleSlam = false;
  if (p.shield === 'bubble') {
    p.shield = null;
    p.inv = tuning.inv;
    p.vx = p.x < x ? -4 : 4;
    if (!gate) {
      p.vy = -6;
      p.ground = false;
      p.surface = null;
    }
    gameSound('shieldBreak');
    return;
  }
  if (count) {
    const n = Math.min(count, 16);
    for (let i = 0; i < n; i++)
      particles.push({
        x: p.x,
        y: p.y,
        vx: Math.cos((i * Math.PI) / 8) * 5,
        vy: -4 - Math.abs(Math.sin(i)) * 5,
        life: 220,
        ring: true,
        age: 0,
      });
    count = 0;
    p.inv = tuning.inv;
    p.vx = p.x < x ? -4 : 4;
    if (!gate) {
      p.vy = -6;
      p.ground = false;
      p.surface = null;
    }
    gameSound('hurt');
  } else die();
}

function press(k, automated = false) {
  if (!automated) testControlled = false;
  if (isPlaytest()) {
    handlePlaytestInput(k, true);
    return;
  }
  if (
    !usesAct1Motion() &&
    (k === 'ArrowDown' || k === 'KeyS') &&
    !keys.has(k) &&
    mode === 'playing'
  ) {
    p.rollBuffer = 6;
    p.rollSpent = false;
  }
  if (k === 'KeyP' || k === 'Escape') {
    pause();
    return;
  }
  if (k === 'KeyR') {
    restart();
    return;
  }
  if (bossOwnsControls() && mode === 'playing') return;
  if (usesAct1Motion() && mode === 'playing') {
    inputAct1Motion(k, true);
    return;
  }
  if (
    ['ShiftLeft', 'ShiftRight', 'KeyX', 'MouseBoost'].includes(k) &&
    mode === 'playing' &&
    !['ShiftLeft', 'ShiftRight', 'KeyX', 'MouseBoost'].some((code) => keys.has(code))
  ) {
    if (p.ground) p.groundBoostHeld = true;
    else p.airBoostRequested = true;
  }
  if (JUMP_KEYS.includes(k)) {
    if (['ready', 'over', 'win'].includes(mode)) {
      start();
      return;
    }
    if (mode === 'playing') {
      const secondPress = !JUMP_KEYS.some((code) => keys.has(code));
      p.jumpHeld = true;
      p.jumpCut = false;
      if (
        secondPress &&
        !p.ground &&
        p.shield === 'bubble' &&
        !p.hurt &&
        !p.wrongRouteDrop &&
        !p.bubbleSlam
      ) {
        beginBubbleSlam();
        keys.add(k);
        return;
      }
      if (
        (keys.has('ArrowDown') || keys.has('KeyS')) &&
        p.ground &&
        !p.surface?.grindable &&
        Math.abs(p.vx) < 3
      ) {
        charge = Math.min(16, charge + 4);
        sparks(p.x - 15 * p.face, p.y + 18, 4, '#69efff');
        gameSound('spindashCharge', { charge: charge / 20 });
      } else jumpBuffer = tuning.buffer;
    }
  }
  keys.add(k);
}

function release(k, automated = false) {
  if (!automated) testControlled = false;
  if (isPlaytest()) {
    handlePlaytestInput(k, false);
    return;
  }
  if (usesAct1Motion()) {
    inputAct1Motion(k, false);
    return;
  }
  keys.delete(k);
  if (
    ['ShiftLeft', 'ShiftRight', 'KeyX', 'MouseBoost'].includes(k) &&
    !['ShiftLeft', 'ShiftRight', 'KeyX', 'MouseBoost'].some((code) => keys.has(code))
  ) {
    p.airBoostRequested = false;
    p.groundBoostHeld = false;
    p.airBoostFrames = 0;
    p.airBoostActive = false;
  }
  if (JUMP_KEYS.includes(k)) {
    p.jumpHeld = false;
    p.jumpCut = true;
    const cut = p.jumpReleaseVy ?? (p.underwater ? -2.5 : -5);
    if (p.vy < cut && runFrames >= (p.airLaunchUntil || 0)) p.vy = cut;
  }
}

function restart() {
  if (isPlaytest()) {
    resetPlaytest();
    testControlled = false;
    mode = 'playing';
    $('#overlay').classList.add('hidden');
    $('#pause').textContent = 'Ⅱ';
    updatePlaytestHud();
    canvas.focus();
    return;
  }
  setup();
  mode = 'playing';
  $('#overlay').classList.add('hidden');
  $('#pause').textContent = 'Ⅱ';
  canvas.focus();
  gameSound('start');
  updateHud();
}

function updateHud() {
  if (isPlaytest()) {
    updatePlaytestHud();
    return;
  }
  window.syncGameMusic?.({
    enabled: sound,
    mode: mode,
    act: selectedAct,
  });
  if (typeof window.updatePixelHud === 'function')
    window.updatePixelHud({
      rings: count,
      lives: lives,
      lifeImage: art.recoveredSpeedster,
      time: clock,
      score: score,
      boost: boost,
      maxBoost: BOOST_MAX,
      speed: Math.round(measurementSpeed() * 60),
      mode: mode,
      frame: step,
    });
  $('#progress-fill').style.width =
    (mode === 'win' ? 100 : Math.min(100, (p.x / END) * 100)) + '%';
}

function update() {
  if (isPlaytest()) {
    updatePlaytest();
    return;
  }
  step++;
  if (mode !== 'playing') return;
  if (ending) {
    updateEndingScene();
    updateHud();
    return;
  }
  clock += 1 / 60;
  runFrames++;
  if (p.inv > 0) p.inv--;
  if (p.hurt > 0) p.hurt--;
  if (shake > 0) shake--;
  if (toastTime > 0 && !--toastTime) $('#toast').style.display = 'none';
  updateWorldPlatforms();
  if (bossOwnsControls()) {
    if (boss.state === 'destroyed') updateMovement();
    updateParticles();
    updateBossEncounter();
    if (boss?.state === 'defeated') beginEndingScene();
    updateCamera();
    updateHud();
    return;
  }
  if (
    !(usesAct1Motion() ? updateAct1Movement() : updateMovement()) ||
    mode !== 'playing'
  ) {
    updateHud();
    return;
  }
  updateStageWorld();
  updateCityInteriors();
  if (mode !== 'playing') {
    updateHud();
    return;
  }
  updateWaterState();
  if (!updateBreathing()) {
    updateHud();
    return;
  }
  const motionHandled = p.interactionsFrame === runFrames;
  if (!motionHandled) {
    collectWorldRings();
    activateWorldDevices();
    collectBoostMonitors();
  }
  updateBossEncounter();
  if (!motionHandled) {
    updateWorldEnemies();
    updateWorldCheckpoints();
  }
  updateStageCompletion();
  updateTraversalAnimation();
  updateParticles();
  if (charge) gameSound('spindashCharge', { charge: charge / 20 });
  else if (p.brakeActive) gameSound('brake', { speed: Math.abs(p.vx) });
  else if (p.boosting) gameSound('boost', { speed: measurementSpeed() });
  else if (p.ground && p.surface?.grindable) gameSound('grind', { speed: measurementSpeed() });
  else if (p.ground && !p.roll && Math.abs(p.vx) > 2) gameSound('run', { speed: Math.abs(p.vx) });
  updateCamera();
  updateHud();
}

function updateParticles() {
  for (const a of particles) {
    a.x += a.vx;
    a.y += a.vy;
    if (!a.trail) a.vy += 0.22;
    if (a.ring) {
      a.age++;
      const floor = topAt(a.x, a.y - 18);
      if (floor && a.y > floor.y - 10 && a.vy > 0) {
        a.y = floor.y - 10;
        a.vy = -Math.abs(a.vy) * 0.6;
      }
      if (a.age > 32 && Math.hypot(a.x - p.x, a.y - p.y) < 28) {
        count++;
        a.life = 0;
        gameSound('ring');
      }
    }
    a.life--;
  }
  particles = particles.filter((a) => a.life > 0);
}

function finishAct() {
  mode = 'win';
  const rank =
    stats.deaths === 0 &&
    stats.hits <= 1 &&
    clock < (level.act === 2 ? 175 : 70)
      ? 'S'
      : stats.deaths === 0 &&
          clock < (level.act === 2 ? 220 : 100)
        ? 'A'
        : 'B';
  show(
    'Neon Express<br><em>cleared!</em>',
    `Rank ${rank} · ${count} rings · ${Math.floor(clock / 60)}:${String(Math.floor(clock % 60)).padStart(2, '0')}<br>${stats.expressLandings} express landings · ${stats.hits} hits · ${stats.deaths} falls`,
    'RUN AGAIN'
  );
  if (level.act === 1) {
    $('.intro').innerHTML += '<button id="next-act" class="secondary">CONTINUE TO ACT 2 →</button>';
    $('#play').onclick = start;
    $('#next-act').onclick = () => {
      selectAct(2);
      start();
    };
  }
  gameSound('clear');
}

function ellipse(x, y, rx, ry, color) {
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.ellipse(x, y, rx, ry, 0, 0, Math.PI * 2);
  ctx.fill();
}

function ring(x, y, scale = 1) {
  drawPixelRing(x, y, scale);
}

function sonicPose() {
  const traversal = traversalSonicPose();
  if (traversal) return traversal;
  if (art.recoveredSpeedster || art.recoveredPeelout) return recoveredSonicPose();
  const speed = p.loop
      ? Math.abs(p.loop.speed)
      : Math.abs(p.surface?.contactMode === 'oriented' ? p.contactSpeed : p.vx),
    face = p.face,
    age = runFrames - p.poseLandingFrame;
  const out = (state, frame, extra = {}) => ({
    state,
    frame,
    face,
    scale: 58 / 254,
    stretchX: 1,
    stretchY: 1,
    rotation: 0,
    ball: false,
    sheet: 'sonic',
    ...extra,
  });
  const extra = (state, sheet, frame, options = {}) =>
    out(state, frame, { sheet, scale: extraMotion[sheet].scales[frame], pivot: 0.58, ...options });
  if (p.hurt) {
    const phase = Math.floor(runFrames / 2) % 5;
    return phase === 0
      ? out('hurt', 18, { scale: 48 / 254 })
      : extra('hurt', 'transitions', 3 + phase);
  }
  if (p.airBoostActive)
    return out('boost', Math.floor(runFrames / 2) % 8, {
      sheet: 'boost',
      scale: 52 / 336,
    });
  if (p.ground && p.surface?.grindable) {
    const fast = p.boosting || speed > 18 || (p.grindFast && speed > 16);
    const phase = Math.floor(runFrames / 2) % 10;
    if (phase >= 4)
      return extra(fast ? 'grind-fast' : 'grind', 'wind', (fast ? 12 : 6) + phase - 4, {
        face: Math.sign(p.vx) || face,
        rotation: Math.atan(pose(p.surface).slope) * (Math.sign(p.vx) || face),
      });
    return out(fast ? 'grind-fast' : 'grind', (fast ? 4 : 0) + phase, {
      sheet: 'grind',
      scale: 58 / 344,
      face: Math.sign(p.vx) || face,
      rotation: Math.atan(pose(p.surface).slope) * (Math.sign(p.vx) || face),
      stretchY: 1 - Math.min(1, (runFrames - (p.grindEntryFrame ?? -100)) / 5) * 0.015,
    });
  }
  if (p.rolling || charge || p.bubbleSlam) {
    const phase = Math.floor(anim * 0.6) % 6;
    if (phase >= 2)
      return extra('roll', 'transitions', 8 + phase - 2, {
        ball: true,
        diameter: 38,
        rotation: anim * 0.22,
        face: Math.sign(p.vx) || face,
      });
    return out('roll', 22 + phase, {
      ball: true,
      diameter: 38,
      rotation: anim * 0.22,
      face: Math.sign(p.vx) || face,
    });
  }
  if (!p.ground) {
    const ja = runFrames - p.poseJumpFrame;
    if (ja >= 0 && ja < 4 && p.vy < 0) {
      if (ja === 0 || ja === 2)
        return out('takeoff', ja === 0 ? 12 : 13, { sheet: 'motion', scale: 50 / 254 });
      const frame = ja === 1 ? 12 : 13;
      return extra('takeoff', 'detail', frame, {
        scale: (extraMotion.detail.scales[frame] * 50) / 58,
      });
    }
    if (p.vy < -3) {
      if (p.vy >= -10.5 && p.vy < -9.5)
        return extra('rise', 'detail', 14, { scale: (extraMotion.detail.scales[14] * 50) / 58 });
      if (p.vy >= -7.5 && p.vy < -6.5)
        return extra('rise', 'detail', 15, {
          ball: true,
          diameter: 38,
          rotation: anim * 0.04,
        });
      return out('rise', p.vy < -9.5 ? 14 : p.vy < -6.5 ? 15 : 16, {
        sheet: 'motion',
        scale: 50 / 254,
      });
    }
    if (p.vy < 3) {
      const phase = Math.floor(ja / 2) % 4;
      if (phase === 1)
        return extra('apex', 'detail', 15, {
          ball: true,
          diameter: 38,
          rotation: anim * 0.04,
        });
      return out('apex', [17, 17, 18, 19][phase], {
        sheet: 'motion',
        ball: true,
        diameter: 38,
        rotation: anim * 0.04,
      });
    }
    if (p.vy >= 4 && p.vy < 6)
      return extra('fall', 'detail', 16, { scale: (extraMotion.detail.scales[16] * 50) / 58 });
    if (p.vy >= 8 && p.vy < 10)
      return extra('fall', 'detail', 17, { scale: (extraMotion.detail.scales[17] * 50) / 58 });
    return out('fall', p.vy < 4 ? 20 : p.vy < 8 ? 21 : 22, { sheet: 'motion', scale: 50 / 254 });
  }
  const dir =
    Number(keys.has('ArrowRight') || keys.has('KeyD')) -
    Number(keys.has('ArrowLeft') || keys.has('KeyA'));
  if (
    !p.loop &&
    !p.boosting &&
    ((p.brakeActive && speed > 0.03) || (dir && speed > 2 && dir !== Math.sign(p.vx)))
  ) {
    const age = p.brakeAge || 0,
      frame = age < 4 ? 0 : speed > 8 ? 1 : speed > 3 ? 2 : 3;
    return out('brake', frame, {
      sheet: 'brake',
      face: p.brakeActive ? p.brakeFace : Math.sign(p.vx),
      scale: 58 / 344,
    });
  }
  if (!p.loop && !dir && !p.boosting && speed < 0.5 && runFrames - p.stopFrame < 12) {
    return out('stop', runFrames - p.stopFrame < 6 ? 4 : 5, {
      sheet: 'brake',
      face: p.brakeFace,
      scale: 58 / 344,
    });
  }
  if (age >= 0 && age < 6) {
    if (age === 0) return out('land', 23, { sheet: 'motion' });
    if (age === 5) return out('land', 17);
    return extra('land', 'transitions', age - 1, { stretchY: age < 3 ? 0.97 : 1 });
  }
  if (p.boosting || speed > 17) {
    const phase = Math.floor((runFrames * 14) / 16) % 14;
    if (phase >= 8)
      return extra('boost', 'wind', phase - 8, {
        scale: (extraMotion.wind.scales[phase - 8] * 52) / 58,
        pivot: 0.57,
      });
    return out('boost', phase, { sheet: 'boost', scale: 52 / 336 });
  }
  // One atlas, one body scale and a distance-based stride. Poses hold for several ticks.
  if (speed > 0.5) {
    const frame = Math.floor(anim * 0.48) % 12;
    return out('run', frame, { sheet: 'motion' });
  }
  const phase = runFrames % 360,
    frame =
      phase < 140
        ? Math.floor(runFrames / 38) % 2
        : phase < 174
          ? 2
          : phase < 210
            ? 3
            : phase < 258
              ? 4
              : phase < 300
                ? 5
                : 0;
  if (phase < 140) return extra('idle', 'detail', Math.floor(runFrames / 8) % 6);
  return out('idle', frame, { stretchY: 1 + Math.sin(runFrames * 0.075) * 0.008 });
}

function spritePixel(value, axis = 'x') {
  const pixels = zoom * (axis === 'x' ? canvas.width / W : canvas.height / H);
  return Math.round(value * pixels) / pixels;
}

function drawSonicFrame(q) {
  if (recoveredSpriteFrames[q.sheet] && art[q.sheet] && document.createElement)
    return drawRecoveredSonicFrame(q);
  const sheet = q.sheet || 'sonic',
    im = art[sheet] || art.sonic,
    frames = art[sheet]
      ? extraMotion[sheet]
        ? extraMotion[sheet].frames
        : sheet === 'motion'
          ? motionFrames
          : sheet === 'boost'
            ? boostFrames
            : sheet === 'brake'
              ? brakeFrames
              : sheet === 'grind'
                ? grindFrames
                : sonicFrames
      : sonicFrames;
  // If the expansion has not loaded, use a clean original pose instead of an unrelated frame.
  const frame = art[sheet]
    ? q.frame
    : q.ball
      ? 22
      : q.state === 'run'
        ? 6
        : q.state === 'land'
          ? 16
          : q.state === 'boost'
            ? 20
            : q.state === 'brake'
              ? 18
              : q.state === 'stop'
                ? 19
                : q.state.startsWith('grind')
                  ? 12
                  : q.state === 'idle'
                    ? 0
                    : 13;
  const [l, t, r, b] = frames[frame],
    sw = r - l,
    sh = b - t;
  if (q.ball) {
    const scale = q.diameter / Math.max(sw, sh),
      dw = spritePixel(sw * scale),
      dh = spritePixel(sh * scale, 'y');
    ctx.translate(0, p.ground ? 20 - dh / 2 : 1);
    ctx.rotate(q.rotation);
    ctx.drawImage(im, l, t, sw, sh, spritePixel(-dw / 2), spritePixel(-dh / 2, 'y'), dw, dh);
    return;
  }
  const scale = (sheet !== 'sonic' && !art[sheet] ? 58 / 254 : q.scale) * SONIC_VISUAL_SCALE,
    dw = spritePixel(sw * scale * q.stretchX),
    dh = spritePixel(sh * scale * q.stretchY, 'y');
  // Pivot beneath the eye/body, rather than the changing glove or quill extents.
  const pivots = [
    0.6, 0.6, 0.6, 0.6, 0.53, 0.6, 0.6, 0.57, 0.59, 0.57, 0.6, 0.6, 0.59, 0.57, 0.5, 0.55, 0.6,
    0.61, 0.53, 0.57, 0.58, 0.58,
  ];
  const pivot =
    extraMotion[sheet] && art[sheet]
      ? (q.pivot ?? 0.58)
      : sheet === 'grind' && art.grind
        ? 0.56
        : sheet === 'brake' && art.brake
          ? 0.58
          : sheet === 'boost' && art.boost
            ? [215, 201, 193, 198, 215, 201, 179, 198][frame] / sw
            : sheet === 'motion' && art.motion
              ? [
                  0.57, 0.59, 0.6, 0.6, 0.57, 0.6, 0.59, 0.57, 0.6, 0.57, 0.6, 0.58, 0.59, 0.57,
                  0.58, 0.56, 0.5, 0.5, 0.5, 0.5, 0.56, 0.56, 0.56, 0.59,
                ][frame]
              : pivots[frame];
  if (q.state === 'brake' || q.state.startsWith('grind')) {
    ctx.translate(0, 20);
    ctx.rotate(q.rotation || 0);
    ctx.translate(0, -20);
  }
  ctx.drawImage(im, l, t, sw, sh, spritePixel(-dw * pivot), spritePixel(20, 'y') - dh, dw, dh);
}

function sonic() {
  if (p.inv > 0 && step % 10 < 4 && mode === 'playing') return;
  const q = sonicPose();
  ctx.save();
  if (usesAct1Motion()) {
    const body = act1Body();
    ctx.translate(body.x, body.y + (p.ground ? body.hh - 20 : -1));
    if (p.ground) {
      ctx.translate(0, 20 - body.hh);
      ctx.rotate(body.angle);
      ctx.translate(0, body.hh - 20);
    }
  } else ctx.translate(p.x, p.y);
  const transform = ctx.getTransform?.();
  if (transform)
    ctx.setTransform(
      transform.a,
      transform.b,
      transform.c,
      transform.d,
      Math.round(transform.e),
      Math.round(transform.f)
    );
  if (p.loop) {
    ctx.translate(0, 20);
    ctx.rotate(-p.loop.theta);
    ctx.translate(0, -20);
  }
  if (p.ground && p.surface?.contactMode === 'oriented')
    ctx.rotate(Math.atan2(p.surface.y2 - p.surface.y1, p.surface.x2 - p.surface.x1));
  ctx.scale(q.face, 1);
  if (p.boosting && !p.surface?.grindable) {
    cityPixelOval(-14, 1, 42, 18, '#22caff44');
    for (let i = 0; i < 12; i++) {
      const a = -1.2 + i * 0.2,
        b = a + 0.2;
      cityPixelLine(
        Math.cos(a) * 25,
        Math.sin(a) * 25,
        Math.cos(b) * 25,
        Math.sin(b) * 25,
        '#81eeff',
        2
      );
    }
  }
  if (art.recoveredSpeedster || art.recoveredPeelout || art.sonic) {
    const entry = runFrames - p.grindEntryFrame;
    if (!recoveredSpriteFrames[q.sheet] && q.state.startsWith('grind') && entry >= 0 && entry < 5) {
      const a = (entry + 1) / 5;
      ctx.globalAlpha = 1 - a;
      drawSonicFrame({
        ...q,
        state: p.grindFromFast ? 'boost' : 'run',
        sheet: p.grindFromFast ? 'boost' : 'motion',
        frame: p.grindFromFast ? Math.floor(runFrames / 2) % 8 : 6,
        scale: p.grindFromFast ? 52 / 336 : 58 / 254,
        rotation: 0,
      });
      ctx.globalAlpha = a;
      drawSonicFrame(q);
      ctx.globalAlpha = 1;
    } else drawSonicFrame(q);
  } else {
    ellipse(0, 0, 18, 23, '#1679ee');
    ellipse(10, -10, 8, 12, 'white');
    ellipse(14, -9, 3, 7, '#13334c');
    ellipse(12, 1, 12, 7, '#f6c999');
    ellipse(23, -3, 4, 3, '#101d39');
    ellipse(-10, 20, 14, 6, '#ee2856');
    ellipse(12, 20, 14, 6, '#ee2856');
  }
  ctx.restore();
}

function sign(x, y, text, type) {
  drawPixelSign(x, y, text, type);
}

function drawRail(s) {
  if (s.secretDepth > 4 && !level.middleSection?.secretRevealed) return;
  if (s.sealedBy && !active(s)) return;
  const q = pose(s),
    left = Math.max(q.x1, cam - 30),
    right = Math.min(q.x2, cam + W / zoom + 30);
  if (
    left >= right ||
    Math.min(q.y1, q.y2) > camY + H / zoom + 80 ||
    Math.max(q.y1, q.y2) + 52 < camY - 80
  )
    return;
  ctx.save();
  if (!active(s)) ctx.globalAlpha = 0.14;
  drawAct2Supports(s, left, right);
  ctx.restore();
}

function draw() {
  if (isPlaytest()) {
    drawPlaytest();
    return;
  }
  ctx.save();
  ctx.scale(canvas.width / W, canvas.height / H);
  ctx.imageSmoothingEnabled = false;
  ctx.fillStyle = '#0d082d';
  ctx.fillRect(0, 0, W, H);
  if (level.act === 2) drawAct2Background();
  else if (art.city) {
    const bw = (art.city.width / art.city.height) * H,
      offset = (cam * 0.18) % bw;
    drawCityBackdrop(art.city, -offset, 0, bw, H);
    drawCityBackdrop(art.city, bw - offset, 0, bw, H);
  }
  ctx.fillStyle = '#130d3280';
  ctx.fillRect(0, 0, W, 75);
  ctx.save();
  ctx.scale(zoom, zoom);
  ctx.translate(
    -cam +
      (shake ? Math.sin(step * 3) * shake * 0.3 : 0),
    -camY +
      (shake ? Math.cos(step * 2) * shake * 0.2 : 0)
  );
  if (level.act === 2) {
    drawAct2Structures();
    drawMiddleSection();
  } else drawPixelCityStructures();
  drawCityDetails();
  for (const s of level.surfaces) drawRail(s);
  if (level.act === 2) drawAct2World();
  drawBossEncounter();
  for (const h of level.hazards) {
    if (h.broken) continue;
    if (h.x + h.w < cam - 100 || h.x > cam + W / zoom + 100)
      continue;
    if (h.type === 'bulkhead') {
      drawAct2Bulkhead(h);
      continue;
    }
    if (h.type === 'breakable') {
      drawCityBreakable(h);
    } else if (h.type === 'spikes') {
      drawPixelSpikes(h);
    } else {
      ctx.fillStyle = '#171c40';
      ctx.fillRect(h.x, h.y, h.w, h.h);
      ctx.fillStyle = '#364971';
      ctx.fillRect(h.x, h.y, h.w, 12);
      ctx.fillStyle = '#a32776';
      ctx.fillRect(h.x, h.y + h.h - 12, h.w, 12);
      ctx.fillStyle = '#ff91d1';
      ctx.fillRect(h.x, h.y + h.h - 3, h.w, 3);
      for (let x = h.x + 8; x < h.x + h.w; x += 26) {
        ctx.fillStyle = '#342547';
        ctx.fillRect(x, h.y + 20, 12, h.h - 40);
        ctx.fillStyle = '#ffaedd';
        ctx.fillRect(x, h.y + h.h - 10, 13, 3);
      }
      drawPixelSign(h.x + h.w / 2, h.y + h.h - 28, 'ROLL', 'roll');
      ctx.fillStyle = '#ff8ad72b';
      ctx.fillRect(h.x, h.y + h.h, h.w, h.floor - h.y - h.h);
    }
  }
  for (const pad of level.pads) {
    if (pad.sealedBy && !level.hazards.find((h) => h.id === pad.sealedBy)?.broken)
      continue;
    if (pad.x < cam - 60 || pad.x > cam + W / zoom + 60)
      continue;
    if (pad.poolBooster) continue;
    if (pad.cityVent) {
      drawPolishedVent(pad);
      continue;
    }
    drawPoolBooster({ ...pad, launchX: 18, power: 0 });
  }
  for (const spring of level.springs || []) drawPolishedSpring(airDevicePose(spring));
  for (const monitor of level.monitors || []) drawBoostMonitor(monitorPose(monitor));
  for (const s of level.signs)
    if (s.x > cam - 200 && s.x < cam + W / zoom + 200)
      sign(s.x, s.y, s.text, s.type);
  for (const r of rings)
    if (
      !r.taken &&
      (!r.sealedBy || level.hazards.find((h) => h.id === r.sealedBy)?.broken) &&
      r.x > cam - 30 &&
      r.x < cam + W / zoom + 30
    )
      ring(r.x, r.y, 0.35 + 0.65 * Math.abs(Math.cos(step * 0.065)));
  for (const e of enemies)
    if (
      e.alive &&
      e.x > cam - 60 &&
      e.x < cam + W / zoom + 60
    ) {
      drawPixelEnemy(e);
    }
  for (const [i, c] of level.checkpoints.entries()) {
    ctx.fillStyle = '#5988b9';
    ctx.fillRect(c.x, c.y - 75, 4, 75);
    cityPixelOval(c.x + 2, c.y - 77, 12, 12, '#14253d');
    cityPixelOval(c.x + 2, c.y - 77, 9, 9, checkpoint >= i ? '#ffdc58' : '#fd4db9');
  }
  const goalY = level.act === 2 ? level.arena.y - 70 : 325;
  if (level.act !== 2) sign(END, goalY, 'GOAL', 'express');
  for (
    let x = END - 24;
    level.act !== 2 && x < END + 24;
    x += 8
  )
    for (let y = goalY - 20; y < goalY + 55; y += 8) {
      ctx.fillStyle = (Math.floor(x / 8) + Math.floor(y / 8)) % 2 ? '#fcf5ff' : '#19264a';
      ctx.fillRect(x, y, 8, 8);
    }
  for (const a of particles) {
    if (a.x < cam - 100 || a.x > cam + W / zoom + 100)
      continue;
    ctx.globalAlpha = Math.min(1, a.life / 16);
    if (a.ring) ring(a.x, a.y, 0.8);
    else if (a.grind) {
      cityPixelLine(
        a.x,
        a.y,
        a.x - Math.sign(a.vx) * (a.trail ? 10 : 3),
        a.y + (a.trail ? 0 : 2),
        a.color,
        2
      );
    } else if (a.skid && !a.trail) {
      const size = a.size * (1 + (20 - a.life) * 0.025);
      cityPixelRect(a.x - size / 2, a.y - size / 2, size, size, a.color);
      cityPixelRect(a.x - size * 0.75, a.y, size * 1.5, size * 0.6, a.color);
    } else {
      cityPixelRect(a.x, a.y, a.trail ? 24 : 4, a.trail ? 8 : 4, a.color);
    }
    ctx.globalAlpha = 1;
  }
  if (ending && endingArtReady()) drawEndingScene(ending);
  else {
    if (p.ground) cityPixelOval(p.x, p.y + 21, 17, 4, '#060c2466');
    sonic();
    drawPlayerAbilities();
  }
  ctx.restore();
  ctx.restore();
  if (mode !== 'playing') updateHud();
}

function frame(t) {
  if (isPlaytest()) {
    framePlaytest(t);
    return;
  }
  if (!last) last = t;
  acc += Math.min(100, t - last);
  last = t;
  let updated = false;
  while (acc >= 1000 / 60) {
    if (!testControlled) {
      update();
      updated = true;
    }
    acc -= 1000 / 60;
  }
  if (updated || testControlled || mode !== 'playing') draw();
  requestAnimationFrame(frame);
}

function readGameState() {
  if (isPlaytest()) return readPlaytestState();
  return {
    status: mode,
    act: selectedAct,
    route: p.surface?.kind ?? 'air',
    rings: count,
    lives: lives,
    boost: Math.round(boost),
    progress: Math.round((p.x / END) * 100),
    timeSeconds: Math.floor(clock),
    frame: runFrames,
    x: p.x,
    y: p.y,
    vx: p.vx,
    vy: p.vy,
    grounded: p.ground,
    shield: p.shield,
    underwater: p.underwater,
    airSeconds: Math.ceil(p.airRemaining / 60),
    airBoostAvailable: !p.airBoostUsed,
    checkpoint: checkpoint,
    sector: level.sectors[stage].name,
    testControlled: testControlled,
    ending: ending
      ? {
          beat: ending.beat,
          frame: ending.frame,
          done: ending.done,
        }
      : null,
    boss: boss
      ? {
          state: boss.state,
          hits: boss.hits,
          bites: boss.bites,
          laserMode: boss.laserMode,
        }
      : null,
    ...stats,
  };
}

function stepGameFrames(input) {
  if (
    !input ||
    typeof input !== 'object' ||
    Array.isArray(input) ||
    Object.keys(input).some((k) => !['keys', 'frames'].includes(k)) ||
    !Array.isArray(input.keys) ||
    input.keys.some((k) => !Object.hasOwn(testInputCodes, k)) ||
    new Set(input.keys).size !== input.keys.length ||
    !Number.isInteger(input.frames) ||
    input.frames < 1 ||
    input.frames > 600
  )
    throw Error('Expected keys from left/right/jump/down/boost and integer frames from 1 to 600');
  if (input.keys.includes('left') && input.keys.includes('right'))
    throw Error('Choose one movement direction');
  if (!['playing', 'paused'].includes(mode))
    throw Error('Start or restart the game before stepping');
  if (mode === 'paused') start();
  for (const key of [...keys]) release(key, true);
  testControlled = true;
  const codes = input.keys.map((k) => testInputCodes[k]),
    deathsBefore = stats.deaths;
  let framesAdvanced = 0;
  try {
    // Down must precede Jump for a spin dash, regardless of request ordering.
    codes.sort((a, b) => Number(b === 'ArrowDown') - Number(a === 'ArrowDown'));
    for (const key of codes) press(key, true);
    for (; framesAdvanced < input.frames && mode === 'playing'; ) {
      update();
      framesAdvanced++;
      if (stats.deaths !== deathsBefore) break;
    }
  } finally {
    for (const key of [...keys]) release(key, true);
  }
  updateHud();
  draw();
  return { ...readGameState(), framesAdvanced };
}

const canvas = document.querySelector('#game');
const ctx = canvas.getContext('2d');
const $ = (s) => document.querySelector(s);
const W = 960;
const H = 540;
const SONIC_VISUAL_SCALE = 1.07;
const FOOT_RADIUS = 9;
const keys = new Set();
const JUMP_KEYS = ['Space', 'ArrowUp', 'KeyW'];
const tuning = { lives: 3, inv: 78, coyote: 6, buffer: 8 };
const BOOST_MAX = 90;
const movementTuning = {
    counterBrake: 1.25,
    precisionSpeed: 3,
    groundGrip: 0.65,
    recoveryGrip: 0.8,
  };
let testControlled = false;
let selectedAct = window.DEFAULT_ACT === 2 ? 2 : 1;
let level = undefined;
let END = 29000;
let mode = 'ready';
let cam = 0;
let camY = 0;
let zoom = 1;
let clock = 0;
let lives = 3;
let count = 0;
let score = 0;
let charge = 0;
let checkpoint = 0;
let toastTime = 0;
let sound = false;
let particles = [];
let rings = [];
let enemies = [];
let last = 0;
let acc = 0;
let step = 0;
let boost = BOOST_MAX;
let shake = 0;
let anim = 0;
let jumpBuffer = 0;
let coyote = 0;
let stage = 0;
let runFrames = 0;
let stats = {
    jumps: 0,
    rolls: 0,
    hits: 0,
    deaths: 0,
    expressLandings: 0,
    recoveries: 0,
    rebound: 0,
    maxSpeed: 0,
    loops: 0,
    barriers: 0,
  };
let visited = new Set();
const p = {
    x: 120,
    y: 400,
    vx: 0,
    vy: 0,
    ground: false,
    face: 1,
    inv: 0,
    roll: false,
    boosting: false,
    surface: null,
    hurt: 0,
    jumpAttack: false,
    airSpeedLimit: null,
    scriptedLaunch: false,
    jumpHeld: false,
    jumpCut: false,
    boostLocked: false,
    rolling: false,
    dashRolling: false,
    contactSpeed: null,
    interactionsFrame: -1,
    rollAge: 0,
    lowRollFrames: 0,
    rollSpent: false,
    downHeld: false,
    rollBuffer: 0,
  };
const extraMotion = {"detail":{"frames":[[39,53,253,320],[299,52,504,320],[553,52,751,320],[805,52,1012,320],[1057,50,1262,320],[1308,47,1510,320],[31,365,256,630],[294,364,512,635],[568,363,760,631],[779,365,1024,639],[1071,363,1267,635],[1301,365,1514,635],[28,727,249,936],[307,682,512,957],[565,682,768,957],[808,734,1017,942],[1044,712,1271,957],[1280,717,1525,958]],"scales":[0.21245421245421245,0.21245421245421245,0.21245421245421245,0.21245421245421245,0.21245421245421245,0.21245421245421245,0.2116788321167883,0.2116788321167883,0.2116788321167883,0.2116788321167883,0.2116788321167883,0.2116788321167883,0.2109090909090909,0.2109090909090909,0.2109090909090909,0.2109090909090909,0.2109090909090909,0.2109090909090909]},"wind":{"frames":[[21,37,251,250],[272,42,509,251],[527,36,759,253],[776,36,1009,253],[1031,37,1265,251],[1287,35,1514,251],[24,285,256,501],[285,292,512,501],[543,292,760,501],[784,292,1012,501],[1048,285,1263,501],[1299,292,1509,501],[14,526,256,736],[287,534,512,738],[527,532,768,738],[796,535,1024,738],[1050,527,1274,738],[1290,539,1527,738],[23,775,256,993],[275,770,512,1002],[535,775,768,994],[815,784,1024,994],[1074,775,1277,998],[1309,769,1500,999]],"scales":[0.2672811059907834,0.2672811059907834,0.2672811059907834,0.2672811059907834,0.2672811059907834,0.2672811059907834,0.26851851851851855,0.26851851851851855,0.26851851851851855,0.26851851851851855,0.26851851851851855,0.26851851851851855,0.27488151658767773,0.27488151658767773,0.27488151658767773,0.27488151658767773,0.27488151658767773,0.27488151658767773,0.25,0.25,0.25,0.25,0.25,0.25]},"transitions":{"frames":[[55,37,352,362],[403,119,697,362],[763,76,1044,362],[1144,48,1403,362],[34,420,362,724],[427,441,685,724],[754,425,1085,724],[1147,422,1416,724],[67,772,325,1024],[421,770,677,1024],[776,770,1033,1024],[1141,770,1397,1026]],"scales":[0.17846153846153845,0.17846153846153845,0.17846153846153845,0.17846153846153845,0.19078947368421054,0.19078947368421054,0.19078947368421054,0.19078947368421054,0.2265625,0.2265625,0.2265625,0.2265625]}};
const artFiles = {
    recoveredCity: 'city-recovered-burning.png',
    recoveredSpeedster: 'sonic-recovered-speedster.png',
    recoveredPeelout: 'sonic-recovered-peelout.png',
    city: 'city.png',
    collapse: 'city-collapse.png',
    sonic: 'sonic-expressive.png',
    motion: 'sonic-motion.png',
    boost: 'sonic-boost.png',
    brake: 'sonic-brake.png',
    grind: 'sonic-grind.png',
    detail: 'sonic-detail.png',
    wind: 'sonic-wind.png',
    transitions: 'sonic-transitions.png',
    supplemental: 'sonic-supplemental.png',
    peeloutCycle: 'sonic-peelout-cycle.png',
    traversalActing: 'sonic-traversal-acting.png',
    traversalLaunch: 'sonic-traversal-launch.png',
    scorpion: 'egg-scorpion-parts.png',
  };
const art = Object.fromEntries(Object.keys(artFiles).map((name) => [name, null]));
const artLoads = new Map();
const failedArt = new Set();
const sharedArt = [
    'recoveredSpeedster',
    'recoveredPeelout',
    'supplemental',
    'peeloutCycle',
    'traversalActing',
    'traversalLaunch',
  ];
const legacySonicArt = ['sonic', 'motion', 'boost', 'brake', 'grind', 'detail', 'wind', 'transitions'];
loadActArt(selectedAct);
const cityTextureCache = new WeakMap();
const citySkyHeights = [350, 350, 240, 240, 240, 305, 305, 350, 400, 420, 395, 395, 270, 270, 270, 315];
const backdropScaleCache = new WeakMap();
const cityCloudLayers = new WeakMap();
const sonicFrames = [
    [37, 15, 235, 269],
    [287, 17, 481, 269],
    [547, 15, 728, 269],
    [800, 15, 987, 269],
    [1048, 17, 1264, 269],
    [1309, 15, 1495, 269],
    [32, 290, 246, 542],
    [279, 293, 521, 538],
    [564, 295, 749, 538],
    [783, 294, 1044, 542],
    [1077, 290, 1261, 541],
    [1316, 294, 1509, 540],
    [35, 588, 235, 775],
    [296, 544, 518, 789],
    [557, 590, 747, 771],
    [780, 545, 1012, 781],
    [1048, 587, 1285, 781],
    [1306, 562, 1515, 778],
    [10, 790, 265, 1009],
    [281, 790, 508, 1010],
    [533, 800, 798, 1009],
    [809, 800, 1050, 1008],
    [1085, 822, 1265, 1001],
    [1327, 820, 1505, 998],
  ];
const motionFrames = [
    [30, 18, 282, 259],
    [320, 23, 506, 261],
    [566, 22, 745, 263],
    [820, 18, 1011, 263],
    [1054, 28, 1297, 261],
    [1320, 20, 1526, 263],
    [25, 287, 256, 537],
    [298, 288, 536, 544],
    [561, 288, 749, 541],
    [786, 285, 1052, 521],
    [1073, 291, 1271, 541],
    [1309, 288, 1536, 541],
    [27, 586, 235, 777],
    [296, 556, 516, 795],
    [554, 552, 749, 795],
    [808, 565, 1032, 779],
    [1078, 586, 1277, 769],
    [1327, 594, 1512, 775],
    [44, 809, 235, 999],
    [292, 811, 487, 999],
    [547, 805, 777, 1003],
    [797, 806, 1035, 1016],
    [1045, 795, 1293, 1007],
    [1313, 816, 1511, 1005],
  ];
const grindFrames = [
    [62, 46, 418, 380],
    [537, 53, 903, 380],
    [1021, 71, 1379, 380],
    [1500, 53, 1859, 380],
    [1935, 61, 2384, 380],
    [2432, 82, 2848, 380],
    [2907, 84, 3332, 380],
    [3393, 77, 3807, 380],
  ];
const brakeFrames = [
    [42, 20, 405, 368],
    [469, 33, 875, 368],
    [928, 36, 1311, 368],
    [1383, 32, 1752, 368],
    [1873, 36, 2158, 368],
    [2338, 24, 2590, 368],
  ];
const boostFrames = [
    [32, 80, 451, 410],
    [486, 80, 893, 410],
    [944, 80, 1320, 414],
    [1389, 80, 1747, 416],
    [32, 517, 451, 842],
    [486, 517, 896, 843],
    [958, 517, 1311, 845],
    [1389, 517, 1744, 844],
  ];
$('#act-select').onchange = (e) => {
    selectAct(e.target.value === 'playtest' ? 'playtest' : Number(e.target.value));
    canvas.focus();
  };
$('#play').onclick = start;
$('#pause').onclick = pause;
$('#restart').onclick = restart;
$('#sound').onclick = () => {
    sound = window.setGameSoundEnabled?.(!sound) ?? false;
    $('#sound').textContent = sound ? 'Sound on' : 'Sound off';
    $('#sound').setAttribute('aria-label', sound ? 'Disable sound' : 'Enable sound');
    gameSound('menu');
    window.syncGameMusic?.({
      enabled: sound && !isPlaytest(),
      mode: mode,
      act: selectedAct,
      gesture: true,
    });
    canvas.focus();
  };
canvas.addEventListener('pointerdown', (e) => {
    if (e.pointerType !== 'mouse' || e.button !== 0 || mode !== 'playing') return;
    e.preventDefault();
    canvas.focus();
    canvas.setPointerCapture(e.pointerId);
    press('MouseBoost');
  });
for (const name of ['pointerup', 'pointercancel', 'lostpointercapture'])
    canvas.addEventListener(name, (e) => {
      if (e.pointerType === 'mouse') release('MouseBoost');
    });
window.addEventListener('keydown', (e) => {
    if (
      [
        'ArrowLeft',
        'ArrowRight',
        'ArrowUp',
        'ArrowDown',
        'Space',
        'KeyW',
        'KeyA',
        'KeyS',
        'KeyD',
        'Escape',
        'KeyP',
        'KeyR',
        'ShiftLeft',
        'ShiftRight',
        'KeyX',
      ].includes(e.code) &&
      !e.target.matches('button,a,select')
    ) {
      e.preventDefault();
      if (!e.repeat) press(e.code);
    }
  });
window.addEventListener('keyup', (e) => release(e.code));
window.addEventListener('blur', () => {
    keys.clear();
    if (mode === 'playing') pause();
  });
const testInputCodes = {
    left: 'ArrowLeft',
    right: 'ArrowRight',
    jump: 'Space',
    down: 'ArrowDown',
    boost: 'ShiftLeft',
  };
if (document.modelContext?.registerTool) {
    const life = new AbortController();
    for (const tool of [
      {
        name: 'read_game_state',
        description: 'Read route, rings, lives, boost, progress and run statistics.',
        inputSchema: { type: 'object', properties: {}, additionalProperties: false },
        annotations: { readOnlyHint: true },
        execute: readGameState,
      },
      {
        name: 'step_game_frames',
        description:
          'Hold controls for 1–600 fixed 60 Hz physics frames, then release all inputs and freeze for inspection. Use keys [] to coast. Stops on death or stage end. Physical input or restart restores real-time play.',
        inputSchema: {
          type: 'object',
          properties: {
            keys: {
              type: 'array',
              items: { type: 'string', enum: ['left', 'right', 'jump', 'down', 'boost'] },
              uniqueItems: true,
            },
            frames: { type: 'integer', minimum: 1, maximum: 600 },
          },
          required: ['keys', 'frames'],
          additionalProperties: false,
        },
        annotations: { readOnlyHint: false },
        execute: stepGameFrames,
      },
      {
        name: 'restart_game',
        description: 'Restart the tutorial.',
        inputSchema: { type: 'object', properties: {}, additionalProperties: false },
        annotations: { readOnlyHint: false },
        execute: (input) => {
          if (!input || Object.keys(input).length) throw Error('Expected an empty object');
          restart();
          return { status: mode, lives: lives };
        },
      },
    ])
      try {
        Promise.resolve(document.modelContext.registerTool(tool, { signal: life.signal })).catch(
          () => {}
        );
      } catch {}
    window.addEventListener('pagehide', () => life.abort());
  }
setup();
p.inv = 0;
if (selectedAct === 2) selectAct(2);
requestAnimationFrame(frame);
