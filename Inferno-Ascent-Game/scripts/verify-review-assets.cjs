const {chromium}=require('playwright');
const assert=require('node:assert/strict');
(async()=>{
 const browser=await chromium.launch({executablePath:process.env.SONIC_CHROMIUM||'/usr/bin/chromium',headless:true,args:['--no-sandbox']});
 try{
  for(const act of [1,2]){
   const page=await browser.newPage(),png=[];
   await page.route('**/*',async r=>{if(r.request().resourceType()==='document'){const response=await r.fetch();await r.fulfill({response,body:(await response.text()).replace('window.DEFAULT_ACT=2','window.DEFAULT_ACT='+act)})}else await r.continue()});
   page.on('request',r=>{if(/\.png$/.test(r.url()))png.push(r.url().split('/').pop())});
   await page.goto(process.argv[2]||'http://127.0.0.1:8000');
   await page.waitForFunction(()=>art.recoveredSpeedster&&art.recoveredPeelout&&art.supplemental&&art.peeloutCycle&&art.traversalActing&&art.traversalLaunch);
   // Exercise each startup act, then ensure repeated setup does not reload sheets.
   await page.evaluate(act=>selectAct(act),act);
   await page.waitForFunction(act=>act===1?!!art.city:!!art.recoveredCity,act);
   const legacy=['sonic-expressive.png','sonic-motion.png','sonic-boost.png','sonic-brake.png','sonic-grind.png','sonic-detail.png','sonic-wind.png','sonic-transitions.png','city-collapse.png'];
   assert.ok(!png.some(name=>legacy.includes(name)),'fallback-only artwork must not load without a failure');
   if(act===2)assert.ok(!png.includes('city.png'),'Act 2 does not need the Act 1 panorama');
   else assert.ok(!png.includes('city-recovered-burning.png')&&!png.includes('egg-scorpion-parts.png'),'Act 1 does not load Act 2-only artwork');
   const count=png.length;await page.evaluate(act=>{selectAct(act);start()},act);
   await page.waitForTimeout(100);assert.equal(png.length,count,'repeat setup must not redownload sheets');
   console.log(JSON.stringify({act,requests:png}));await page.close();
  }
 }finally{await browser.close()}
})().catch(e=>{console.error(e);process.exitCode=1});
