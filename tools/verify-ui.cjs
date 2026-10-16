const { chromium } = require('playwright');
const assert = require('node:assert/strict'),
  crypto = require('node:crypto');
(async () => {
  const browser = await chromium.launch({
    executablePath: process.env.SONIC_CHROMIUM || '/usr/bin/chromium',
    headless: true,
    args: ['--no-sandbox'],
  });
  const captures = [];
  try {
    for (const url of process.argv.slice(2, 4)) {
      const page = await browser.newPage(),
        errors = [],
        hashes = [];
      page.on('pageerror', (e) => errors.push(e.message));
      await page.addInitScript(() => {
        requestAnimationFrame = () => 0;
        let seed = 1;
        Math.random = () => {
          seed = (seed * 1664525 + 1013904223) >>> 0;
          return seed / 4294967296;
        };
      });
      await page.goto(url);
      await page.waitForLoadState('networkidle');
      for (const viewport of [
        { width: 1440, height: 1000 },
        { width: 1024, height: 768 },
        { width: 640, height: 480 },
      ]) {
        await page.setViewportSize(viewport);
        for (const act of [1, 2])
          for (const modeName of ['ready', 'playing', 'paused', 'fullscreen']) {
            await page.evaluate(
              ({ act, modeName }) => {
                document.querySelector('#game-shell').classList.remove('viewport-fullscreen');
                selectAct(act);
                if (modeName !== 'ready') {
                  start();
                  testControlled = true;
                  if (modeName === 'paused') pause();
                  if (modeName === 'fullscreen')
                    document.querySelector('#game-shell').classList.add('viewport-fullscreen');
                }
                step = 120;
                runFrames = 120;
                clock = 2;
                shake = 0;
              },
              { act, modeName }
            );
            await page.evaluate(async () => {
              let count;
              do {
                count = artLoads.size;
                await Promise.all(artLoads.values());
              } while (count !== artLoads.size);
              await document.fonts.ready;
              updateHud();
              draw();
            });
            hashes.push({
              viewport,
              act,
              modeName,
              hash: crypto
                .createHash('sha256')
                .update(await page.screenshot({ animations: 'disabled' }))
                .digest('hex'),
            });
          }
      }
      assert.deepEqual(errors, []);
      captures.push(hashes);
      await page.close();
    }
    assert.equal(captures.length, 2, 'Supply baseline and built URLs');
    assert.deepEqual(captures[1], captures[0]);
    console.log(
      JSON.stringify({
        matchingWholePageScreenshots: captures[0].length,
        views: 'ready, playing, paused, fullscreen; both acts; 1440, 1024, 640 widths',
        pageErrors: 0,
      })
    );
  } finally {
    await browser.close();
  }
})().catch((e) => {
  console.error(e);
  process.exitCode = 1;
});
