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
  page.on('pageerror', (error) => errors.push(error.message));
  // Exercise actual packaged code and DOM inputs with a bounded number of ticks.
  await page.addInitScript(() => {
    window.requestAnimationFrame = () => 0;
  });
  try {
    await page.goto(url);
    await page.waitForFunction(() => typeof window.readGameState === 'function');
    assert.equal(await page.locator('#act-select option[value="playtest"]').count(), 1);
    await page.selectOption('#act-select', 'playtest');
    await page.click('#play');
    await page.evaluate(async () => {
      await Promise.all(artLoads.values());
      draw();
    });
    assert.equal(await page.locator('#playtest-status').isVisible(), true);
    assert.match(await page.locator('#playtest-status').textContent(), /Static-surface/);
    const state = await page.evaluate(() => readGameState());
    assert.equal(state.act, 'playtest');
    assert.equal(state.tuning, 'AIR-1 / GROUND-3', 'the extracted package must contain the current tuning');
    assert.equal(state.movementImplemented, true);
    assert.equal(state.player.x, 0);
    assert.equal(state.contact.height, 48);
    assert.ok(await page.evaluate(() => !!art.recoveredSpeedster), 'existing Sonic art loaded');
    assert.deepEqual(
      await page.evaluate(() => {
        const canvas = document.querySelector('#game');
        const state = readGameState(),
          x = ((state.contact.x - state.camera.x) * canvas.width) / 960,
          y = ((state.contact.y - state.camera.y) * canvas.height) / 540;
        return [...canvas.getContext('2d').getImageData(x + 3, y + 2, 1, 1).data];
      }),
      [255, 213, 74, 255],
      'ground contact anchor is actually rendered'
    );
    const snapshot = () =>
      page.evaluate(() => JSON.stringify({ p, charge, boost, clock, runFrames, score, stats }));
    const before = await snapshot();
    for (const key of ['ArrowRight', 'ArrowDown', 'Space', 'ShiftLeft'])
      await page.keyboard.down(key);
    await page.evaluate(() => {
      for (let i = 0; i < 30; i++) update();
      draw();
    });
    for (const key of ['ArrowRight', 'ArrowDown', 'Space', 'ShiftLeft'])
      await page.keyboard.up(key);
    assert.equal(await snapshot(), before, 'experimental input cannot mutate legacy gameplay');
    assert.equal(await page.locator('#playtest-frame').textContent(), '30');
    assert.ok((await page.evaluate(() => readGameState())).player.x > 0);
    assert.equal((await page.evaluate(() => readGameState())).player.ticks, 30);
    await page.keyboard.press('KeyP');
    await page.evaluate(() => {
      for (let i = 0; i < 10; i++) update();
    });
    assert.equal((await page.evaluate(() => readGameState())).status, 'paused');
    assert.equal((await page.evaluate(() => readGameState())).frame, 30);
    await page.click('#play');
    await page.evaluate(() => {
      update();
      update();
      update();
    });
    assert.equal((await page.evaluate(() => readGameState())).frame, 33);
    await page.click('#restart');
    assert.equal((await page.evaluate(() => readGameState())).frame, 0);
    assert.deepEqual((await page.evaluate(() => readGameState())).inputs, []);
    await page.keyboard.down('ArrowRight');
    await page.evaluate(() => {
      for (let i = 0; i < 60; i++) update();
    });
    await page.keyboard.up('ArrowRight');
    await page.keyboard.press('ArrowDown');
    // A short physical tap is buffered for the next experimental tick.
    await page.evaluate(() => {
      update();
      draw();
    });
    assert.equal((await page.evaluate(() => readGameState())).player.posture, 'rolling');
    await page.click('#playtest-valley');
    await page.evaluate(() => draw());
    assert.equal((await page.evaluate(() => readGameState())).player.scenario, 'valley');
    await page.keyboard.down('ArrowRight');
    await page.evaluate(() => {
      for (let i = 0; i < 180; i++) update();
      draw();
    });
    await page.keyboard.up('ArrowRight');
    const slope = await page.evaluate(() => readGameState());
    assert.ok(slope.contact.angle < -0.4, 'reached the right incline');
    assert.ok(
      slope.camera.x > 0 && slope.camera.y < state.camera.y,
      'experimental camera follows both axes'
    );
    await page.evaluate(() => {
      for (let i = 0; i < 180; i++) update();
      draw();
    });
    assert.ok(
      (await page.evaluate(() => readGameState())).player.speed < 0,
      'released uphill run rolls back'
    );
    await page.click('#restart');
    assert.deepEqual((await page.evaluate(() => readGameState())).contact.anchor, { x: 0, y: 650 });
    // Reproduce held uphill countersteering on supported ground, through the real scene update.
    await page.evaluate(() => Object.assign(playtestState.player, { x: 1700, speed: -4, posture: 'rolling' }));
    await page.keyboard.down('ArrowRight');
    await page.evaluate(() => { for(let i=0;i<60;i++)update(); draw(); });
    await page.keyboard.up('ArrowRight');
    const countersteer = await page.evaluate(() => readGameState());
    assert.ok(countersteer.player.speed < -8, 'held countersteer must allow useful downhill acceleration');
    assert.ok(countersteer.contact.vx < -6, 'world-horizontal travel must be substantial, not near zero');
    await page.click('#playtest-flat');
    await page.keyboard.down('Space');
    await page.evaluate(() => { for(let i=0;i<8;i++)update(); });
    const heldJump = await page.evaluate(() => readGameState());
    assert.equal(heldJump.player.mode, 'airborne');
    await page.keyboard.up('Space');
    await page.evaluate(() => update());
    const cutJump = await page.evaluate(() => readGameState());
    assert.ok(cutJump.player.air.vy > heldJump.player.air.vy + 4, 'release cuts remaining jump lift');
    await page.evaluate(() => { for(let i=0;i<70;i++)update(); draw(); });
    assert.equal((await page.evaluate(() => readGameState())).player.mode, 'grounded');
    await page.click('#playtest-crest');
    await page.evaluate(() => { playtestState.player.speed=14; });
    await page.keyboard.down('ArrowRight');
    await page.evaluate(() => { for(let i=0;i<50;i++)update(); draw(); });
    await page.keyboard.up('ArrowRight');
    const crest = await page.evaluate(() => readGameState());
    assert.equal(crest.player.mode, 'airborne');
    assert.equal(crest.player.lastTakeoff.reason, 'crest');
    assert.equal(crest.player.transitionCount, 1);
    assert.equal(crest.contact.anchor, null);
    if(process.env.PLAYTEST_CAPTURE)await page.screenshot({path:process.env.PLAYTEST_CAPTURE});
    await page.click('#playtest-gap');
    await page.evaluate(() => { playtestState.player.speed=14; for(let i=0;i<20;i++)update(); });
    await page.keyboard.down('Space');
    await page.evaluate(() => { for(let i=0;i<30;i++)update(); });
    await page.keyboard.up('Space');
    assert.ok((await page.evaluate(() => readGameState())).player.x > 300, 'real jump crosses gap');
    await page.evaluate(() => { for(let i=0;i<40;i++)update(); draw(); });
    assert.equal((await page.evaluate(() => readGameState())).player.mode, 'grounded');
    await page.click('#playtest-wall');
    await page.evaluate(() => { playtestState.player.speed=35; for(let i=0;i<20;i++)update(); draw(); });
    const wall = await page.evaluate(() => readGameState());
    assert.ok(wall.contact.center.x+wall.contact.width/2 <= 350.001, 'fast standing body stops at wall');
    await page.keyboard.down('Space');
    await page.evaluate(() => update());
    await page.keyboard.up('Space');
    assert.equal((await page.evaluate(() => readGameState())).player.posture, 'standing', 'jump beside wall cannot expand into wider ball');
    await page.evaluate(() => { for(let i=0;i<65;i++)update(); draw(); });
    const wallLanded=await page.evaluate(() => readGameState());
    assert.equal(wallLanded.player.mode,'grounded');
    assert.ok(Math.abs(wallLanded.player.x-wall.player.x)<0.001,'no sideways landing snap');
    await page.click('#playtest-ceiling');
    await page.evaluate(() => {
      Object.assign(playtestState.player,{x:300,speed:0,posture:'rolling'});
      for(let i=0;i<30;i++)update(); draw();
    });
    assert.equal((await page.evaluate(() => readGameState())).player.posture,'rolling','ceiling blocks uncurl');
    await page.keyboard.down('Space');
    await page.evaluate(() => { update(); draw(); });
    await page.keyboard.up('Space');
    const ceiling=await page.evaluate(() => readGameState());
    assert.equal(ceiling.player.air.jumpLift,0,'head impact clears lift budget');
    assert.ok(ceiling.player.y>=375.999,'ceiling blocks circle body');
    await page.click('#restart');
    for (const act of ['1', '2']) {
      await page.keyboard.down('Space');
      await page.evaluate(() => update());
      await page.keyboard.down('ShiftLeft');
      await page.selectOption('#act-select', act);
      await page.keyboard.up('Space');
      await page.keyboard.up('ShiftLeft');
      await page.click('#play');
      const entry = await page.evaluate(() => ({
        state: readGameState(),
        experimental: playtestState,
        inputs: [...keys],
        charge,
      }));
      assert.equal(entry.state.act, Number(act));
      assert.equal(entry.experimental, null);
      assert.deepEqual(entry.inputs, []);
      assert.equal(entry.charge, 0);
      await page.keyboard.down('ArrowRight');
      await page.evaluate(() => {
        for (let i = 0; i < 20; i++) update();
        draw();
      });
      await page.keyboard.up('ArrowRight');
      assert.ok(
        (await page.evaluate(() => readGameState())).x > entry.state.x,
        `Act ${act} still runs`
      );
      const running = await page.evaluate(() => readGameState());
      await page.keyboard.down('Space');
      await page.evaluate(() => {
        for (let i = 0; i < 6; i++) update();
        draw();
      });
      await page.keyboard.up('Space');
      const jumping = await page.evaluate(() => readGameState());
      assert.ok(jumping.y < running.y && !jumping.grounded, `Act ${act} still jumps`);
      // Existing acts require a fresh midair press; ground boost+jump is not an air burst.
      await page.keyboard.down('ShiftLeft');
      await page.evaluate(() => { for(let i=0;i<6;i++)update(); draw(); });
      await page.keyboard.up('ShiftLeft');
      assert.ok((await page.evaluate(() => readGameState())).boost < jumping.boost, `Act ${act} still boosts`);
      await page.selectOption('#act-select', 'playtest');
      await page.click('#play');
      await page.evaluate(() => draw());
      const returned = await page.evaluate(() => readGameState());
      assert.equal(returned.frame, 0);
      assert.deepEqual(returned.inputs, []);
      assert.equal(returned.player.x, 0);
      assert.equal(returned.player.speed, 0);
      assert.equal(returned.player.scenario, 'flat');
    }
    assert.deepEqual(errors, []);
    return {
      url,
      result: 'PASS',
      checks:
        'selection, rendered Sonic/contact, approved ground/rollback, held/tap jump, crest detachment, gap landing, swept wall, upright landing, ceiling/uncurl, two-axis camera, isolation, pause/resume/reset, flight exit, Act 1/2 running/jump/boost, clean return',
      pageErrors: errors,
    };
  } finally {
    await page.close();
  }
}

async function main() {
  const root = path.resolve(process.argv[2] || '');
  assert.ok(process.argv[2], 'Pass the freshly extracted Neon-Express directory');
  const browser = await chromium.launch({
    executablePath: process.env.CHROMIUM_PATH || '/usr/bin/chromium',
    args: ['--no-sandbox'],
  });
  let server;
  try {
    const results = [];
    try {
      results.push(await smoke(browser, pathToFileURL(path.join(root, 'index.html')).href));
    } catch (error) {
      results.push({ method: 'file', result: 'FAIL', error: error.stack });
    }
    server = spawn('python3', [
      '-u',
      '-m',
      'http.server',
      '0',
      '--bind',
      '127.0.0.1',
      '--directory',
      root,
    ]);
    const port = await new Promise((resolve, reject) => {
      const timeout = setTimeout(() => reject(Error('Python server startup timed out')), 10000);
      server.on('error', (error) => {
        clearTimeout(timeout);
        reject(error);
      });
      server.on('exit', (code) => {
        clearTimeout(timeout);
        reject(Error(`Python server exited ${code}`));
      });
      server.stdout.on('data', (data) => {
        const match = String(data).match(/port (\d+)/);
        if (match) {
          clearTimeout(timeout);
          resolve(match[1]);
        }
      });
    });
    results.push(await smoke(browser, `http://127.0.0.1:${port}/`));
    console.log(
      JSON.stringify({ chromium: browser.version(), extractedDirectory: root, results }, null, 2)
    );
  } finally {
    server?.kill();
    await browser.close();
  }
}
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
