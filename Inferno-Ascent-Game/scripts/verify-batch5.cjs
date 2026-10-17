// Serve `npm run package` output, then pass its URL. No screenshots or reports are written.
const assert = require('node:assert/strict');
const { chromium } = require('playwright');
(async () => {
  const browser = await chromium.launch({
    executablePath: process.env.SONIC_CHROMIUM || '/usr/bin/chromium',
    headless: true, args: ['--no-sandbox'],
  });
  try {
    const page = await browser.newPage({ viewport: { width: 1440, height: 1000 } });
    const errors = [];
    page.on('pageerror', e => errors.push(e.message));
    await page.addInitScript(() => { window.requestAnimationFrame = () => 0; });
    await page.goto(process.argv[2] || 'http://127.0.0.1:8023');
    await page.waitForFunction(() => art.recoveredSpeedster && art.recoveredCity);
    assert.equal(await page.evaluate(() => [...document.scripts].filter(s => /runtime-/.test(s.src)).length), 1);
    const loops = [];
    for (const id of ['city-climax-loop-248', 'draw-loop-1', 'draw-loop-2']) {
      for (const speed of [4, 14, 23]) {
        const result = await page.evaluate(({ id, speed }) => {
          selectAct(2); start(); testControlled = true;
          const l = level.loops.find(l => l.id === id);
          const s = level.surfaces.find(s => s.x1 <= l.x - 6 && s.x2 >= l.x && Math.abs(yOn(s, l.x) - l.y) < 2);
          Object.assign(p, { x: l.x - 6, y: l.y - 20, vx: speed, vy: 0, ground: true, surface: s });
          boost = 0; keys.clear(); press('ArrowRight', true);
          let entered = false, ticks = 0;
          for (; ticks < 300; ticks++) {
            update();
            if (p.loop?.id === id) entered = true;
            if (ticks % 3 === 0) draw();
            if (entered && p.loop?.id !== id) break;
          }
          return { entered, completed: !!l.solved, ticks, deaths: stats.deaths };
        }, { id, speed });
        assert.ok(result.entered, `${id} at ${speed} must attempt the loop`);
        assert.equal(result.completed, speed >= 14, `${id} at ${speed}`);
        assert.equal(result.deaths, 0);
        loops.push({ id, speed, ...result });
      }
      assert.ok(loops.at(-1).ticks < loops.at(-2).ticks, 'earned speed must shorten traversal');
    }
    const spring = await page.evaluate(() => {
      selectAct(2); start(); testControlled = true;
      const d = level.springs.find(d => d.id === 'mid-low-spring'), q = airDevicePose(d);
      // Match the uncompressed visible cap orientation when setting up the approach.
      const angle = Math.round(Math.atan2(d.launchX, d.power) * 8 / Math.PI) * Math.PI / 8;
      const nx = Math.sin(angle), ny = -Math.cos(angle), r = Math.abs(nx) * 13 + Math.abs(ny) * 19;
      Object.assign(p, { x: q.x + nx * (40 + r + 2), y: q.y + ny * (40 + r + 2) - 1,
        vx: -23, vy: 0, face: -1, ground: false, surface: null, inv: 0 });
      keys.clear(); count = 20; press('ShiftLeft'); update();
      const fired = d.firedAt === runFrames, y = p.y; update(); draw();
      const result = { fired, rose: p.y < y, vy: p.vy, gauge: boost, used: p.airBoostUsed, active: p.airBoostActive };
      release('ShiftLeft'); press('ShiftLeft'); update();
      return { ...result, repeatActive: p.airBoostActive, repeatGauge: boost };
    });
    assert.ok(spring.fired && spring.rose);
    assert.ok(spring.vy < -17);
    assert.equal(spring.active, false); assert.equal(spring.used, true);
    assert.equal(spring.gauge, 67.5); assert.equal(spring.repeatGauge, 67.5);
    assert.equal(spring.repeatActive, false);
    const completion = await page.evaluate(() => {
      selectAct(1); start(); testControlled = true;
      const s = level.surfaces.find(s => s.kind === 'main' && s.x1 <= END && s.x2 >= END);
      Object.assign(p, { x: END - 30, y: yOn(s, END - 30) - 20, vx: 14, vy: 0, ground: true, surface: s });
      keys.clear(); press('ArrowRight');
      for (let i = 0; i < 20 && mode === 'playing'; i++) update();
      draw(); const won = mode === 'win'; restart();
      return { won, restarted: mode === 'playing' && p.x < END - 30 && !p.airBoostUsed };
    });
    assert.ok(completion.won && completion.restarted);
    assert.deepEqual(errors, []);
    console.log(JSON.stringify({ loops, spring, completion, errors }, null, 2));
  } finally { await browser.close(); }
})().catch(error => { console.error(error); process.exitCode = 1; });
