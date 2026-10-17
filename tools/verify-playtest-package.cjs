// Bounded browser smoke test of an already extracted player ZIP.
// Requires Playwright and Chromium in the verification environment, not to play.
const assert = require('node:assert/strict');
const path = require('node:path');
const { pathToFileURL } = require('node:url');
const { spawn } = require('node:child_process');
const { chromium } = require('playwright');

async function smoke(browser, url) {
  const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });
  const errors = [];
  page.on('pageerror', error => errors.push(error.message));
  // Exercise actual packaged code and DOM inputs with a bounded number of ticks.
  await page.addInitScript(() => { window.requestAnimationFrame = () => 0; });
  try {
    await page.goto(url);
    await page.waitForFunction(() => typeof window.readGameState === 'function');
    assert.equal(await page.locator('#act-select option[value="playtest"]').count(), 1);
    await page.selectOption('#act-select', 'playtest');
    await page.click('#play');
    await page.evaluate(() => draw());
    assert.equal(await page.locator('#playtest-status').isVisible(), true);
    assert.match(await page.locator('#playtest-status').textContent(), /not implemented/);
    const state = await page.evaluate(() => readGameState());
    assert.equal(state.act, 'playtest');
    assert.equal(state.movementImplemented, false);
    assert.deepEqual(state.marker, { x: 480, y: 340 });
    assert.deepEqual(state.camera, { x: 0, y: 0, zoom: 1 });
    assert.deepEqual(await page.evaluate(() => {
      const canvas = document.querySelector('#game');
      return [...canvas.getContext('2d').getImageData(472 * canvas.width / 960, 340 * canvas.height / 540, 1, 1).data];
    }), [28, 82, 204, 255], 'stationary marker is actually rendered');
    const snapshot = () => page.evaluate(() => JSON.stringify({ p, charge, boost, clock, runFrames, score, stats }));
    const before = await snapshot();
    for (const key of ['ArrowRight', 'ArrowDown', 'Space', 'ShiftLeft']) await page.keyboard.down(key);
    await page.evaluate(() => { for (let i = 0; i < 30; i++) update(); draw(); });
    for (const key of ['ArrowRight', 'ArrowDown', 'Space', 'ShiftLeft']) await page.keyboard.up(key);
    assert.equal(await snapshot(), before, 'diagnostic input cannot mutate legacy gameplay');
    assert.equal(await page.locator('#playtest-frame').textContent(), '30');
    await page.keyboard.press('KeyP');
    await page.evaluate(() => { for (let i = 0; i < 10; i++) update(); });
    assert.equal((await page.evaluate(() => readGameState())).status, 'paused');
    assert.equal((await page.evaluate(() => readGameState())).frame, 30);
    await page.click('#play');
    await page.evaluate(() => { update(); update(); update(); });
    assert.equal((await page.evaluate(() => readGameState())).frame, 33);
    await page.click('#restart');
    assert.equal((await page.evaluate(() => readGameState())).frame, 0);
    assert.deepEqual((await page.evaluate(() => readGameState())).inputs, []);
    for (const act of ['1', '2']) {
      await page.keyboard.down('ShiftLeft');
      await page.selectOption('#act-select', act);
      await page.keyboard.up('ShiftLeft');
      await page.click('#play');
      const entry = await page.evaluate(() => ({ state: readGameState(), experimental: playtestState, inputs: [...keys], charge }));
      assert.equal(entry.state.act, Number(act));
      assert.equal(entry.experimental, null);
      assert.deepEqual(entry.inputs, []);
      assert.equal(entry.charge, 0);
      await page.keyboard.down('ArrowRight');
      await page.evaluate(() => { for (let i = 0; i < 20; i++) update(); draw(); });
      await page.keyboard.up('ArrowRight');
      assert.ok((await page.evaluate(() => readGameState())).x > entry.state.x, `Act ${act} still runs`);
      await page.selectOption('#act-select', 'playtest');
      await page.click('#play');
      await page.evaluate(() => draw());
      const returned = await page.evaluate(() => readGameState());
      assert.equal(returned.frame, 0);
      assert.deepEqual(returned.inputs, []);
      assert.deepEqual(returned.marker, state.marker);
    }
    assert.deepEqual(errors, []);
    return { url, result: 'PASS', checks: 'selection, rendered marker/status, isolation, pause/resume/reset, Act 1/2 running, clean return', pageErrors: errors };
  } finally {
    await page.close();
  }
}

async function main() {
  const root = path.resolve(process.argv[2] || '');
  assert.ok(process.argv[2], 'Pass the freshly extracted Neon-Express directory');
  const browser = await chromium.launch({ executablePath: process.env.CHROMIUM_PATH || '/usr/bin/chromium', args: ['--no-sandbox'] });
  let server;
  try {
    const results = [];
    try { results.push(await smoke(browser, pathToFileURL(path.join(root, 'index.html')).href)); }
    catch (error) { results.push({ method: 'file', result: 'FAIL', error: error.stack }); }
    server = spawn('python3', ['-u', '-m', 'http.server', '0', '--bind', '127.0.0.1', '--directory', root]);
    const port = await new Promise((resolve, reject) => {
      const timeout = setTimeout(() => reject(Error('Python server startup timed out')), 10000);
      server.on('error', error => { clearTimeout(timeout); reject(error); });
      server.on('exit', code => { clearTimeout(timeout); reject(Error(`Python server exited ${code}`)); });
      server.stdout.on('data', data => {
        const match = String(data).match(/port (\d+)/);
        if (match) { clearTimeout(timeout); resolve(match[1]); }
      });
    });
    results.push(await smoke(browser, `http://127.0.0.1:${port}/`));
    console.log(JSON.stringify({ chromium: browser.version(), extractedDirectory: root, results }, null, 2));
  } finally {
    server?.kill();
    await browser.close();
  }
}
main().catch(error => { console.error(error); process.exitCode = 1; });
