// Bounded ending-asset checks against the freshly extracted player build.
const assert = require('node:assert/strict');
const expected = require('../Inferno-Ascent-Game/assets/ending-cache.json').pixels;
function enterEnding() {
  selectAct(2);
  start();
  const roof = surfaceById('summit-arena');
  Object.assign(p, {
    x: level.arena.x + 650,
    y: roof.y1 - 20,
    surface: roof,
    ground: true,
    vx: 0,
    vy: 0,
  });
  update();
  boss.state = 'defeated';
  update();
}
function finishEnding() {
  const beats = new Set();
  for (let i = 0; i < 1100 && mode === 'playing'; i++) {
    update();
    beats.add(ending.beat);
    if (i % 12 === 0) draw();
  }
  return { mode, frames: ending.frame, beats: [...beats] };
}
async function verifyEndingCache(browser, url) {
  const page = await browser.newPage(),
    errors = [];
  page.on('pageerror', (e) => errors.push(e.message));
  await page.addInitScript(() => {
    requestAnimationFrame = () => 0;
  });
  try {
    await page.goto(url);
    await page.waitForFunction(() => endingArtReady());
    const actual = await page.evaluate(async () => {
      const result = {};
      for (const name of endingSheets) {
        result[name] = [];
        const cels = [...endingSprites.get(name)];
        if (name === 'shadow') cels.push(endingSprites.get('emerald')[0]);
        for (const cel of cels) {
          const pixels = cel.image
            .getContext('2d')
            .getImageData(0, 0, cel.image.width, cel.image.height).data;
          const digest = await crypto.subtle.digest('SHA-256', pixels);
          result[name].push(
            [...new Uint8Array(digest)].map((x) => x.toString(16).padStart(2, '0')).join('')
          );
        }
      }
      return result;
    });
    assert.deepEqual(
      actual,
      expected,
      'every native cel must match the prior renderer pixel-for-pixel'
    );
    assert.deepEqual(errors, []);
  } finally {
    await page.close();
  }

  const denied = await browser.newPage(),
    deniedErrors = [];
  denied.on('pageerror', (e) => deniedErrors.push(e.message));
  await denied.addInitScript(() => {
    requestAnimationFrame = () => 0;
    CanvasRenderingContext2D.prototype.getImageData = () => {
      throw new DOMException('Canvas pixel reads denied', 'SecurityError');
    };
  });
  let readback;
  try {
    await denied.goto(url);
    await denied.waitForFunction(() => endingArtReady());
    await denied.evaluate(enterEnding);
    readback = await denied.evaluate(finishEnding);
    assert.equal(readback.mode, 'win');
    assert.equal(readback.beats.length, 16);
    assert.deepEqual(deniedErrors, []);
  } finally {
    await denied.close();
  }

  const retry = await browser.newPage(),
    retryErrors = [];
  let fail = true;
  retry.on('pageerror', (e) => retryErrors.push(e.message));
  await retry.addInitScript(() => {
    requestAnimationFrame = () => 0;
  });
  await retry.route('**/assets/ending-shadow-cache.png*', (r) => (fail ? r.abort() : r.continue()));
  try {
    await retry.goto(url);
    await retry.waitForFunction(() => endingLoadErrors.has('shadow'));
    await retry.evaluate(enterEnding);
    const waiting = await retry.evaluate(() => {
      for (let i = 0; i < 30; i++) update();
      return ending.frame;
    });
    assert.equal(waiting, 0);
    assert.equal(await retry.locator('#ending-retry').isVisible(), true);
    fail = false;
    await retry.locator('#ending-retry').click();
    await retry.waitForFunction(() => endingArtReady(), null, { polling: 50 });
    assert.equal((await retry.evaluate(finishEnding)).mode, 'win');
    assert.deepEqual(retryErrors, []);
  } finally {
    await retry.close();
  }
  return {
    pixelPerfectCels: Object.values(expected).reduce((n, cels) => n + cels.length, 0),
    deniedReadback: readback,
    assetRetry: true,
  };
}
module.exports = { verifyEndingCache };
