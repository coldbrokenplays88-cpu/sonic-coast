// Optional cloud/browser check: requires Playwright and a Chromium executable.
// Run the static server, then node scripts/verify-browser.cjs [base URL].
const assert=require('node:assert/strict');
const {chromium}=require('playwright');
(async()=>{
 const browser=await chromium.launch({executablePath:process.env.SONIC_CHROMIUM||'/usr/bin/chromium',headless:true,args:['--no-sandbox']});
 try{
  const page=await browser.newPage({viewport:{width:1440,height:1000}}),errors=[];
  page.on('pageerror',e=>errors.push(e.message));
  await page.goto(process.argv[2]||'http://127.0.0.1:8000');
  await page.waitForFunction(()=>typeof start==='function'&&Object.keys(art).length>=15);
  for(const act of [1,2]){
   await page.evaluate(act=>{selectAct(act);start();testControlled=true},act);
   const boosted=await page.evaluate(()=>stepGameFrames({keys:['right','boost'],frames:35}));
   assert.equal(boosted.status,'playing');assert.ok(boosted.boost<90);
   const stored=await page.evaluate(()=>boost);
   await page.evaluate(()=>stepGameFrames({keys:[],frames:10}));
   assert.equal(await page.evaluate(()=>boost),stored);
   await page.evaluate(()=>{pause();draw()});assert.equal(await page.locator('#pause').getAttribute('data-paused'),'true');
   await page.evaluate(()=>{start();testControlled=true;draw()});assert.equal(await page.locator('#pause').getAttribute('data-paused'),'false');
   assert.equal(await page.locator('#score').evaluate(e=>e.hidden),true);
  }
  const parity=await page.evaluate(()=>{
   cam=0;camY=-128;zoom=1;ctx.setTransform(1,0,0,1,0,128);ctx.imageSmoothingEnabled=false;
   let different=0;
   for(const label of [null,'NEON WORKS','WEST TOWER','BROADCAST RELAY','EAST WORKSITE','HELIPAD ACCESS']){
    ctx.clearRect(0,-128,1920,1080);paintCityFacade(13,789,-110,51,true,label);
    const a=ctx.getImageData(0,0,960,540).data;
    ctx.clearRect(0,-128,1920,1080);cityFacade(13,789,-110,51,true,label);
    const b=ctx.getImageData(0,0,960,540).data;
    for(let i=0;i<a.length;i++)if(a[i]!==b[i])different++;
   }
   return different;
  });assert.equal(parity,0,'facade tile seams or changed pixels');
  await page.evaluate(()=>{selectAct(2);start();testControlled=true;const d=level.springs.find(d=>d.id==='mid-low-spring');p.x=d.x;p.y=d.y-20;p.surface=surfaceById(d.surfaceId);p.ground=true;launchAirDevice(d);for(let i=0;i<160;i++){update();if(p.surface?.id==='mid-tilted-glass-roof')break}draw()});
  assert.equal(await page.evaluate(()=>p.surface?.id),'mid-tilted-glass-roof');
  await page.locator('#sound').click();assert.equal(await page.evaluate(()=>sound),true);
  const audio=await page.evaluate(()=>{const original=window.playGameSound,heard=[];window.playGameSound=(name,options)=>{heard.push(name);return original(name,options)};selectAct(1);start();testControlled=true;stepGameFrames({keys:['jump'],frames:24});stepGameFrames({keys:[],frames:40});window.playGameSound=original;return heard});
  assert.ok(audio.includes('jump')&&audio.includes('land'));
  await page.evaluate(()=>toggleGameFullscreen());assert.equal(await page.locator('#fullscreen').getAttribute('aria-pressed'),'true');
  await page.evaluate(()=>toggleGameFullscreen());assert.equal(await page.locator('#fullscreen').getAttribute('aria-pressed'),'false');
  for(const viewport of [{width:1024,height:768},{width:390,height:844}]){await page.setViewportSize(viewport);await page.evaluate(()=>draw());const box=await page.locator('#game-shell').boundingBox();assert.ok(box.width<=viewport.width)}
  assert.equal(await page.locator('[data-key]').count(),0);assert.deepEqual(errors,[]);
  console.log('Browser checks passed: both acts, release gauge, pause HUD, six facade pixel comparisons, pool arc, real audio wiring, fullscreen, tablet/mobile layout; zero page errors.');
 }finally{await browser.close()}
})().catch(error=>{console.error(error);process.exitCode=1});
