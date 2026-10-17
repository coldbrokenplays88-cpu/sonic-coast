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
    assert.equal(state.tuning, 'RAIL-BOOST-1 / DEVICES-2 / PATH-1 / AIR-2 / GROUND-5', 'the extracted package must contain the current tuning');
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
    assert.equal((await page.evaluate(() => readGameState())).player.dash.charge,30,'Down + Jump charges only the isolated controller');
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
    const downhill=[];
    for(const posture of ['standing','rolling']) {
      await page.click('#playtest-valley');
      downhill.push(await page.evaluate((posture) => {
        Object.assign(playtestState.player,{x:1700,speed:-14,posture});
        keys.add('ArrowLeft');for(let i=0;i<30;i++)update();keys.clear();draw();
        return {x:playtestState.player.x,speed:playtestState.player.speed};
      },posture));
    }
    assert.ok(downhill[1].speed < downhill[0].speed-5,'downhill roll outpaces powered running');
    assert.ok(downhill[1].x < downhill[0].x-50,'speed advantage affects actual travel');
    await page.click('#playtest-flat');
    await page.evaluate(() => Object.assign(playtestState.player,{speed:12,posture:'rolling'}));
    await page.keyboard.down('ArrowLeft');
    await page.evaluate(() => { for(let i=0;i<60;i++)update(); draw(); });
    await page.keyboard.up('ArrowLeft');
    const rollTurn = await page.evaluate(() => readGameState());
    assert.equal(rollTurn.player.posture,'standing');
    assert.ok(rollTurn.player.speed<0,'roll countersteer now uncurls and reverses within one second');
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
    assert.equal(crest.player.mode, 'grounded');
    assert.equal(crest.player.posture, 'standing');
    assert.equal(crest.player.transitionCount, 0);
    assert.equal(crest.player.lastTakeoff, null);
    assert.match(await page.locator('#playtest-debug').textContent(), /UPRIGHT CREST GRIP/);
    if(process.env.PLAYTEST_CAPTURE)await page.screenshot({path:process.env.PLAYTEST_CAPTURE});
    await page.click('#playtest-crest');
    await page.evaluate(() => { playtestState.player.speed=14; });
    await page.keyboard.down('ArrowRight');
    await page.keyboard.press('ArrowDown');
    await page.evaluate(() => { for(let i=0;i<50;i++)update(); draw(); });
    await page.keyboard.up('ArrowRight');
    const rolledCrest = await page.evaluate(() => readGameState());
    assert.equal(rolledCrest.player.mode,'airborne');
    assert.equal(rolledCrest.player.posture,'rolling');
    assert.equal(rolledCrest.player.lastTakeoff.reason,'crest');
    assert.equal(rolledCrest.player.transitionCount,1);
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
    const pathChecks=[];
    for(const scenario of ['loop','loop-reverse','loop-wide','wall-ceiling','wall-ceiling-reverse']){
      await page.click('#playtest-'+scenario);
      const direction=scenario.endsWith('reverse')?'ArrowLeft':'ArrowRight';
      await page.keyboard.down(direction);
      const result=await page.evaluate((scenario)=>{
        let seenInverted=false,seenWall=false,worst=0;
        const ticks=scenario.startsWith('wall')?240:180;
        const entryResets=readGameState().resetCount;
        for(let i=0;i<ticks;i++){
          const t=performance.now();update();worst=Math.max(worst,performance.now()-t);
          const state=readGameState();
          if(state.player.mode==='grounded'){
            if(state.contact.ny>.8)seenInverted=true;
            if(Math.abs(state.contact.nx)>.95)seenWall=true;
          }
          if(state.resetCount!==entryResets)break;
        }
        draw();return {state:readGameState(),seenInverted,seenWall,worst,entryResets};
      },scenario);
      await page.keyboard.up(direction);
      assert.equal(result.state.player.scenario,scenario);
      assert.equal(result.state.player.mode,'grounded');
      assert.equal(result.state.player.transitionCount,0,'earned running remains supported through intended path');
      assert.equal(result.state.resetCount,result.entryResets,'fixture did not secretly reset during traversal');
      assert.ok(result.seenInverted&&result.seenWall,'actual route visited wall and ceiling');
      assert.equal(result.state.contact.piece.kind,'line','exited curved portion');

      pathChecks.push({scenario,frames:result.state.frame,worstUpdateMs:result.worst});
    }
    if(process.env.PLAYTEST_PATH_CAPTURE){
      await page.click('#playtest-wall-ceiling');await page.keyboard.down('ArrowRight');
      await page.evaluate(()=>{for(let i=0;i<180;i++){update();const s=readGameState();if(s.player.mode==='grounded'&&s.contact.ny>.99)break;}draw();});
      await page.keyboard.up('ArrowRight');await page.screenshot({path:process.env.PLAYTEST_PATH_CAPTURE});
    }
    await page.click('#playtest-loop');
    await page.evaluate(()=>Object.assign(playtestState.player,{pathS:1002,speed:3,posture:'rolling'}));
    const failure=await page.evaluate(()=>{let reversed=false;for(let i=0;i<80;i++){update();if(playtestState.player.mode==='airborne'||playtestState.player.speed<0)reversed=true;}draw();return {reversed,state:readGameState()};});
    assert.ok(failure.reversed,'insufficient momentum visibly fails rather than auto-completing');
    await page.keyboard.down('Space');
    await page.evaluate(()=>update());
    await page.keyboard.up('Space');
    assert.equal((await page.evaluate(()=>readGameState())).player.mode,'airborne');
    await page.keyboard.press('KeyP');
    await page.click('#play');
    await page.click('#restart');
    assert.equal((await page.evaluate(()=>readGameState())).player.ticks,0);
    const deviceChecks = [];
    await page.click('#playtest-springs');
    await page.evaluate(() => {
      Object.assign(playtestState.player, {
        mode: 'airborne',
        speed: null,
        x: 120,
        y: 330,
        air: { vx: 0, vy: 35, jumpLift: 0, cutEligible: false, restorePosture: 'standing' },
      });
      update();
      draw();
    });
    const fired = await page.evaluate(() => readGameState());
    assert.equal(fired.player.springLaunches, 1);
    assert.ok(fired.player.air.vy < -17);
    await page.keyboard.press('Space');
    await page.evaluate(() => update());
    const springContinued = await page.evaluate(() => readGameState());
    assert.ok(
      Math.abs(springContinued.player.air.vy - fired.player.air.vy - 0.35) < 1e-7,
      'jump release never cuts spring lift'
    );
    deviceChecks.push({
      fixture: 'springs',
      launches: fired.player.springLaunches,
      vy: fired.player.air.vy,
    });
    if (process.env.PLAYTEST_DEVICE_CAPTURE)
      await page.screenshot({ path: process.env.PLAYTEST_DEVICE_CAPTURE });
    await page.click('#playtest-platforms');
    await page.evaluate(() => {
      Object.assign(playtestState.player, {
        mode: 'airborne',
        speed: null,
        x: 0,
        y: 230,
        air: { vx: 2, vy: 35, jumpLift: 0, cutEligible: false, restorePosture: 'standing' },
      });
      for (let i = 0; i < 125; i++) update();
      draw();
    });
    const rider = await page.evaluate(() => readGameState());
    assert.equal(rider.player.supportId, 'ferry');
    assert.ok(Math.abs(rider.player.speed) < 1e-7);
    assert.equal(rider.player.ticks, 125);
    await page.keyboard.down('Space');
    await page.evaluate(() => {
      update();
      draw();
    });
    await page.keyboard.up('Space');
    const departed = await page.evaluate(() => readGameState());
    assert.equal(departed.player.mode, 'airborne');
    assert.equal(departed.player.supportId, null);
    assert.ok(
      Math.abs(departed.player.air.vx + 2) < 1e-7,
      'reversed carrier velocity inherited once'
    );
    deviceChecks.push({
      fixture: 'platforms',
      ridingTicks: rider.player.ticks,
      jumpVx: departed.player.air.vx,
    });
    await page.click('#playtest-moving-spring');
    await page.evaluate(() => {
      Object.assign(playtestState.player, {
        mode: 'airborne',
        speed: null,
        x: 0,
        y: 206,
        posture: 'rolling',
        air: { vx: 2, vy: 40, jumpLift: 0, cutEligible: false, restorePosture: 'rolling' },
      });
      for (let i = 0; i < 3; i++) update();
      draw();
    });
    const movingCap = await page.evaluate(() => readGameState());
    assert.equal(movingCap.player.springLaunches, 1);
    assert.ok(Math.abs(movingCap.player.lastSpring.world.vx - 2) < 1e-7);
    deviceChecks.push({ fixture: 'moving-spring', vx: movingCap.player.lastSpring.world.vx });
    for(const x of [-65,0,65]){
      await page.click('#playtest-moving-spring');
      const pass=await page.evaluate((x)=>{
        Object.assign(playtestState.player,{mode:'airborne',speed:null,x,y:330,posture:'rolling',air:{vx:2,vy:-12,jumpLift:0,cutEligible:false,restorePosture:'rolling'}});
        let above=false,landed=false;
        for(let i=0;i<90;i++){
          update();const p=readGameState().player;
          if(p.mode==='airborne'&&p.y<240&&p.air.vy<0)above=true;
          if(p.supportId){landed=true;break;}
        }
        draw();return {above,landed,launches:readGameState().player.springLaunches};
      },x);
      assert.equal(pass.above,x!==0,'only the mounted spring footprint blocks the ascent');
      assert.equal(pass.landed,x!==0,'both unobstructed deck sections are landable');
      assert.equal(pass.launches,0);
      deviceChecks.push({fixture:'jump-through platform',x,...pass});
    }
    for(const scenario of ['rails','rails-empty']){
      await page.click('#playtest-'+scenario);
      await page.keyboard.down('ArrowRight');
      await page.evaluate(()=>{for(let i=0;i<40;i++)update();});
      await page.keyboard.down('Space');
      await page.evaluate(()=>{for(let i=0;i<50;i++)update();draw();});
      await page.keyboard.up('Space');
      const entry=await page.evaluate(()=>readGameState());
      assert.equal(entry.player.railId,'test-rail','ordinary run and jump earns rail access');
      await page.keyboard.down('ShiftLeft');
      await page.evaluate(()=>{for(let i=0;i<12;i++)update();draw();});
      const boosted=await page.evaluate(()=>readGameState());
      assert.ok(boosted.player.speed>20);assert.equal(boosted.player.boost.meter,scenario==='rails'?90:0);
      assert.match(await page.locator('#playtest-debug').textContent(),/FREE RAIL/);
      deviceChecks.push({fixture:scenario,earnedCapture:true,boostSpeed:boosted.player.speed,meter:boosted.player.boost.meter});
      if(process.env.PLAYTEST_RAIL_CAPTURE && scenario==='rails-empty')await page.screenshot({path:process.env.PLAYTEST_RAIL_CAPTURE});
      await page.keyboard.up('ShiftLeft');await page.keyboard.up('ArrowRight');
    }
    await page.click('#playtest-flat');
    await page.keyboard.down('ShiftLeft');
    await page.evaluate(()=>{for(let i=0;i<30;i++)update();});
    const groundBoost=await page.evaluate(()=>readGameState());assert.equal(groundBoost.player.boost.meter,75);assert.ok(groundBoost.player.speed>22);
    await page.keyboard.down('Space');await page.evaluate(()=>update());await page.keyboard.up('Space');
    assert.equal((await page.evaluate(()=>readGameState())).player.boost.airUsed,false,'held ground Boost cannot silently purchase air burst');
    await page.keyboard.up('ShiftLeft');await page.evaluate(()=>update());
    await page.keyboard.down('KeyX');await page.evaluate(()=>update());
    const burst=await page.evaluate(()=>readGameState());assert.equal(burst.player.boost.meter,52.5);assert.equal(burst.player.air.vy,0);
    await page.evaluate(()=>{for(let i=1;i<18;i++)update();draw();});
    const endedBurst=await page.evaluate(()=>readGameState());assert.equal(endedBurst.player.boost.remaining,0);assert.equal(endedBurst.player.boost.meter,52.5);
    await page.keyboard.up('KeyX');
    deviceChecks.push({fixture:'ground and air Boost',groundMeter:75,burstMeter:52.5,burstTicks:18});
    await page.click('#playtest-flat');
    await page.keyboard.down('ArrowDown');
    await page.keyboard.down('Space');
    await page.evaluate(() => {
      for (let i = 0; i < 30; i++) update();
      draw();
    });
    assert.equal((await page.evaluate(() => readGameState())).player.dash.charge, 30);
    await page.keyboard.up('ArrowDown');
    await page.keyboard.up('Space');
    await page.evaluate(() => {
      update();
      draw();
    });
    const dash = await page.evaluate(() => readGameState());
    assert.equal(dash.player.dash, null);
    assert.equal(dash.player.posture, 'rolling');
    assert.ok(dash.player.speed > 18.9);
    deviceChecks.push({ fixture: 'flat dash', releaseSpeed: dash.player.speed });
    await page.click('#playtest-flat');
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
      pathChecks,
      deviceChecks,
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
