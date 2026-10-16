// Optional packaged-browser replay; uses the same Playwright installation as verify-ui.cjs.
const { chromium } = require('playwright'),
  assert = require('node:assert/strict'),
  fs = require('node:fs'),
  path = require('node:path');
(async () => {
  const out = path.resolve(process.argv[3] || 'docs/validation/batch1-momentum');
  fs.mkdirSync(out, { recursive: true });
  const browser = await chromium.launch({
    executablePath: process.env.SONIC_CHROMIUM || '/usr/bin/chromium',
    headless: true,
    args: ['--no-sandbox'],
  });
  const page = await browser.newPage({ viewport: { width: 1440, height: 1000 } }),
    errors = [],
    responses = [];
  page.on('pageerror', (e) => errors.push(e.message));
  page.on('response', (r) => {
    if (r.status() >= 400) responses.push({ url: r.url(), status: r.status() });
  });
  await page.addInitScript(() => {
    requestAnimationFrame = () => 0;
  });
  try {
    await page.goto(process.argv[2] || 'http://127.0.0.1:8018/');
    await page.waitForLoadState('networkidle');
    const runtime = await page.evaluate(() =>
      [...document.scripts].map((s) => s.src).filter((s) => /runtime-/.test(s))
    );
    assert.equal(runtime.length, 1);
    const result = [];
    let frame = 0;
    async function load(act = 2) {
      await page.evaluate(async (act) => {
        selectAct(act);
        start();
        testControlled = true;
        for (let n = 0; n < 3; n++) await Promise.all(artLoads.values());
      }, act);
    }
    async function capture(label) {
      await page.evaluate((label) => {
        draw();
        const c = document.querySelector('#game'),
          x = c.getContext('2d');
        x.save();
        x.fillStyle = '#080e20dd';
        x.fillRect(12, c.height - 44, Math.min(c.width - 24, 820), 32);
        x.fillStyle = '#ffffff';
        x.font = '18px monospace';
        x.fillText(label, 22, c.height - 22);
        x.restore();
      }, label);
      await page
        .locator('#game')
        .screenshot({ path: path.join(out, `frame-${String(frame++).padStart(4, '0')}.png`) });
    }
    for (const scenario of [
      { id: 'city-climax-loop-248', speed: 14 },
      { id: 'city-climax-loop-248', speed: 23 },
      { id: 'draw-loop-1', speed: 14 },
      { id: 'draw-loop-2', speed: 14 },
    ]) {
      await load();
      const setup = await page.evaluate(({ id, speed }) => {
        const l = level.loops.find((l) => l.id === id),
          s = level.surfaces.find(
            (s) => s.x1 <= l.x - 80 && s.x2 >= l.x && Math.abs(yOn(s, l.x) - l.y) < 2
          );
        Object.assign(p, {
          x: l.x - 70,
          y: l.y - 20,
          vx: speed,
          vy: 0,
          ground: true,
          surface: s,
          rolling: false,
          inv: 0,
        });
        boost = 0;
        keys.clear();
        press('ArrowRight', true);
        cam = p.x - W * 0.35;
        camY = p.y - H * 0.5;
        zoom = 1;
        window.loopId = id;
        return { radius: l.r, surface: s.id };
      }, scenario);
      let entered = false,
        entrySpeed = null,
        ticks = 0,
        completed = false;
      const label = `${scenario.id} | approach ${scenario.speed} | no boost / jump`;
      await capture(label);
      for (; ticks < 250; ticks++) {
        const q = await page.evaluate(() => {
          update();
          return {
            loop: p.loop?.id,
            speed: p.loop?.speed,
            complete: level.loops.find((l) => l.id === window.loopId).solved,
            deaths: stats.deaths,
            x: p.x,
            y: p.y,
          };
        });
        assert.equal(q.deaths, 0);
        if (q.loop === scenario.id && !entered) {
          entered = true;
          entrySpeed = q.speed;
        }
        if (ticks % 2 === 0) await capture(label);
        if (entered && !q.loop) {
          completed = q.complete;
          break;
        }
      }
      assert.ok(entered && completed, JSON.stringify(scenario));
      result.push({ ...scenario, ...setup, entrySpeed, ticks: ticks + 1, completed });
      for (let n = 0; n < 18; n++) {
        await page.evaluate(() => {
          update();
          update();
        });
        await capture(label);
      }
    }
    // Actual Spin Dash route: charge with buttons, release, then no jump or boost.
    await load();
    await page.evaluate(() => {
      const s = surfaceById('draw-loop-roof');
      Object.assign(p, {
        x: s.x1 + 100,
        y: s.y1 - 20,
        vx: 0,
        vy: 0,
        ground: true,
        surface: s,
        inv: 0,
      });
      boost = 0;
      keys.clear();
      press('ArrowDown', true);
      press('Space', true);
      for (let n = 0; n < 80; n++) update();
      release('ArrowDown', true);
      release('Space', true);
      press('ArrowRight', true);
      cam = p.x - W * 0.35;
      camY = p.y - H * 0.5;
      zoom = 1;
    });
    let roof = false,
      max = 0;
    for (let n = 0; n < 300; n++) {
      const q = await page.evaluate(() => {
        update();
        return {
          s: p.surface?.id,
          speed: Math.hypot(p.vx, p.vy),
          deaths: stats.deaths,
          jumps: stats.jumps,
          loops: stats.loops,
        };
      });
      assert.equal(q.deaths, 0);
      assert.equal(q.jumps, 0);
      max = Math.max(max, q.speed);
      if (n % 2 === 0)
        await capture('Spin Dash 19 -> downhill momentum -> two loops -> passive ramp launch');
      if (q.s === 'draw-loop-payoff-roof') {
        roof = true;
        result.push({
          scenario: 'Spin Dash terrain route',
          ticks: n + 1,
          loops: q.loops,
          maxSpeed: max,
          passiveRoofLanding: true,
        });
        break;
      }
    }
    assert.ok(roof);
    // Both acts: real movement control, boost and free-air retention on isolated flat fixtures.
    for (const act of [1, 2]) {
      await load(act);
      const q = await page.evaluate(() => {
        const s = { id: 'browser-flat', x1: 100, x2: 8000, y1: -2000, y2: -2000, kind: 'main' };
        level.surfaces = [s];
        level.hazards = [];
        level.springs = [];
        level.pads = [];
        level.loops = [];
        level.deathZones = [];
        Object.assign(p, { x: 2000, y: -2020, vx: 14, vy: 0, ground: true, surface: s });
        keys.clear();
        press('ArrowLeft', true);
        for (let i = 0; i < 15; i++) {
          runFrames++;
          updateMovement();
        }
        const brake = p.vx;
        keys.clear();
        p.vx = 19;
        p.rolling = true;
        p.dashRolling = true;
        for (let i = 0; i < 500; i++) {
          runFrames++;
          updateMovement();
        }
        const stopped = { vx: p.vx, rolling: p.rolling };
        Object.assign(p, { x: 2000, y: -2020, vx: 14, vy: 0, ground: true, surface: s, face: 1 });
        boost = 90;
        press('ShiftLeft', true);
        for (let i = 0; i < 30; i++) {
          runFrames++;
          updateMovement();
        }
        const boosted = p.vx;
        keys.clear();
        Object.assign(p, { x: 2000, y: -10000, vx: 20, vy: 0, ground: false, surface: null });
        for (let i = 0; i < 30; i++) {
          runFrames++;
          updateMovement();
        }
        return { brake, stopped, boosted, airRetained: p.vx };
      });
      assert.ok(Math.abs(q.brake) < 2);
      assert.equal(q.stopped.rolling, false);
      assert.equal(q.stopped.vx, 0);
      assert.ok(q.boosted > 22);
      assert.ok(q.airRetained > 19);
      result.push({ act, ...q });
    }
    // Fullscreen/widescreen resizing keeps runtime usable, with no camera changes in this batch.
    for (const viewport of [
      { width: 1024, height: 768 },
      { width: 1920, height: 1080 },
    ]) {
      await page.setViewportSize(viewport);
      await load(2);
      await page.evaluate(() => {
        for (let i = 0; i < 60; i++) update();
        draw();
      });
    }
    assert.deepEqual(errors, []);
    assert.deepEqual(responses, []);
    fs.writeFileSync(
      path.join(out, 'browser-results.json'),
      JSON.stringify(
        {
          runtime,
          result,
          pageErrors: errors,
          failedRequests: responses,
          frames: frame,
          automatedBrowserReplay: true,
          humanPlaytest: false,
        },
        null,
        2
      ) + '\n'
    );
    console.log(JSON.stringify({ result, frames: frame, pageErrors: errors.length }, null, 2));
  } finally {
    await browser.close();
  }
})().catch((e) => {
  console.error(e);
  process.exitCode = 1;
});
