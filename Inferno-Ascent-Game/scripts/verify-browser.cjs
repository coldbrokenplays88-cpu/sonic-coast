// Optional cloud/browser check: requires Playwright and a Chromium executable.
// Run the static server, then node scripts/verify-browser.cjs [base URL].
const assert=require('node:assert/strict');
const {chromium}=require('playwright');
(async()=>{
 const browser=await chromium.launch({executablePath:process.env.SONIC_CHROMIUM||'/usr/bin/chromium',headless:true,args:['--no-sandbox']});
 try{
  const page=await browser.newPage({viewport:{width:1440,height:1000}}),errors=[];
  await page.addInitScript(()=>{const NativeAudio=window.Audio;window.testMusicPlayers=[];window.Audio=function(...args){const audio=new NativeAudio(...args);window.testMusicPlayers.push(audio);return audio};window.Audio.prototype=NativeAudio.prototype});
  page.on('pageerror',e=>errors.push(e.message));
  await page.goto(process.argv[2]||'http://127.0.0.1:8000');
  await page.waitForFunction(()=>typeof start==='function'&&art.supplemental&&art.peeloutCycle&&Object.keys(art).length>=16);
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
   cam=0;camY=-128;zoom=1;ctx.save();ctx.setTransform(1,0,0,1,0,128);ctx.imageSmoothingEnabled=false;
   let different=0;
   for(const label of [null,'NEON WORKS','WEST TOWER','BROADCAST RELAY','EAST WORKSITE','HELIPAD ACCESS']){
    ctx.clearRect(0,-128,1920,1080);paintCityFacade(13,789,-110,51,true,label);
    const a=ctx.getImageData(0,0,960,540).data;
    ctx.clearRect(0,-128,1920,1080);cityFacade(13,789,-110,51,true,label);
    const b=ctx.getImageData(0,0,960,540).data;
    for(let i=0;i<a.length;i++)if(a[i]!==b[i])different++;
   }
   ctx.restore();return different;
  });assert.equal(parity,0,'facade tile seams or changed pixels');
  const pillarParity=await page.evaluate(()=>{
   cam=0;camY=0;zoom=1;ctx.save();ctx.setTransform(1,0,0,1,0,0);ctx.imageSmoothingEnabled=false;let different=0;
   for(const steel of [false,true]){
    ctx.clearRect(0,0,W,H);paintCityPillar(180,0,520,steel);const a=ctx.getImageData(0,0,W,H).data;
    ctx.clearRect(0,0,W,H);cityPillar(180,0,520,steel);const b=ctx.getImageData(0,0,W,H).data;
    for(let i=0;i<a.length;i++)if(a[i]!==b[i])different++;
   }ctx.restore();return {different,variants:cityPillarTextures.size};
  });assert.equal(pillarParity.different,0,'cached pillars must preserve the source pixel pattern');assert.equal(pillarParity.variants,2);
  await page.evaluate(()=>{selectAct(2);start();testControlled=true;const d=level.springs.find(d=>d.id==='mid-low-spring');p.x=d.x;p.y=d.y-20;p.surface=surfaceById(d.surfaceId);p.ground=true;launchAirDevice(d);for(let i=0;i<160;i++){update();if(p.surface?.id==='mid-tilted-glass-roof')break}draw()});
  assert.equal(await page.evaluate(()=>p.surface?.id),'mid-tilted-glass-roof');
  await page.locator('#sound').click();assert.equal(await page.evaluate(()=>sound),true);
  await page.waitForFunction(()=>testMusicPlayers.length===1&&!testMusicPlayers[0].paused&&testMusicPlayers[0].currentTime>.1);
  const music=await page.evaluate(()=>{const a=testMusicPlayers[0];pause();draw();return {paused:a.paused,time:a.currentTime,loop:a.loop,volume:a.volume,source:a.src}});
  assert.equal(music.paused,true);assert.equal(music.loop,true);assert.equal(music.volume,.3);assert.ok(music.source.endsWith('/assets/city-music.mp3'));
  await page.waitForTimeout(200);assert.ok(Math.abs(await page.evaluate(()=>testMusicPlayers[0].currentTime)-music.time)<.03);
  await page.evaluate(()=>{pause();draw()});await page.waitForFunction(()=>!testMusicPlayers[0].paused&&testMusicPlayers[0].currentTime>.15);
  await page.locator('#sound').click();assert.equal(await page.evaluate(()=>testMusicPlayers[0].paused),true);
  await page.locator('#sound').click();await page.waitForFunction(()=>!testMusicPlayers[0].paused);
  await page.evaluate(()=>{restart();testControlled=true;draw()});assert.ok(await page.evaluate(()=>testMusicPlayers[0].currentTime)<.15);
  assert.equal(await page.evaluate(()=>testMusicPlayers.length),1);
  const audio=await page.evaluate(()=>{const original=window.playGameSound,heard=[];window.playGameSound=(name,options)=>{heard.push(name);return original(name,options)};selectAct(1);start();testControlled=true;stepGameFrames({keys:['jump'],frames:24});stepGameFrames({keys:[],frames:40});window.playGameSound=original;return heard});
  assert.ok(audio.includes('jump')&&audio.includes('land'));
  await page.evaluate(()=>toggleGameFullscreen());assert.equal(await page.locator('#fullscreen').getAttribute('aria-pressed'),'true');
  await page.evaluate(()=>toggleGameFullscreen());assert.equal(await page.locator('#fullscreen').getAttribute('aria-pressed'),'false');
  for(const viewport of [{width:1024,height:768},{width:390,height:844}]){await page.setViewportSize(viewport);await page.evaluate(()=>draw());const box=await page.locator('#game-shell').boundingBox();assert.ok(box.width<=viewport.width)}
  await page.evaluate(()=>{selectAct(1);start();testControlled=true});
  const keyboardStart=await page.evaluate(()=>p.x);await page.keyboard.down('ArrowRight');await page.waitForFunction(x=>p.x>x+12,keyboardStart);await page.keyboard.up('ArrowRight');await page.evaluate(()=>testControlled=true);
  await page.keyboard.press('KeyP');assert.equal(await page.evaluate(()=>mode),'paused');await page.keyboard.press('KeyP');assert.equal(await page.evaluate(()=>mode),'playing');await page.evaluate(()=>testControlled=true);
  await page.keyboard.press('KeyF');assert.equal(await page.locator('#fullscreen').getAttribute('aria-pressed'),'true');await page.keyboard.press('KeyF');assert.equal(await page.locator('#fullscreen').getAttribute('aria-pressed'),'false');
  assert.equal(await page.locator('[data-key]').count(),0);assert.deepEqual(errors,[]);
  console.log('Browser checks passed: both acts, release gauge, pause HUD, six facade pixel comparisons, pool arc, new atlases, actual MP3 play/pause/mute/restart and real sound-effect wiring, fullscreen, native keyboard movement/pause/fullscreen, tablet/mobile layout; zero page errors.');
 }finally{await browser.close()}
})().catch(error=>{console.error(error);process.exitCode=1});
