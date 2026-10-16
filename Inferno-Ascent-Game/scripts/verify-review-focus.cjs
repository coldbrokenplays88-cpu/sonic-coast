const {chromium}=require('playwright');
const assert=require('node:assert/strict');
(async()=>{
 const browser=await chromium.launch({executablePath:'/usr/bin/chromium',headless:true,args:['--no-sandbox']});
 try{
 const page=await browser.newPage(); await page.goto(process.argv[2]);
 await page.waitForFunction(()=>art.recoveredSpeedster&&art.recoveredPeelout);
 await page.evaluate(()=>{selectAct(1);start();testControlled=true});
 await page.locator('#sound').click();
 const soundFocus=await page.evaluate(()=>document.activeElement.id);
 await page.keyboard.down('ArrowRight');
 const arrow=await page.evaluate(()=>({held:keys.has('ArrowRight'),controlled:testControlled}));
 await page.keyboard.up('ArrowRight');
 const before=await page.evaluate(()=>sound);await page.keyboard.press('Space');
 const after=await page.evaluate(()=>sound);
 await page.locator('#act-select').focus();await page.locator('#act-select').selectOption('2');
 const actFocus=await page.evaluate(()=>document.activeElement.id);
 console.log(JSON.stringify({soundFocus,arrow,soundBeforeSpace:before,soundAfterSpace:after,actFocus}));
 {assert.equal(soundFocus,'game');assert.equal(arrow.held,true);assert.equal(after,before);assert.equal(actFocus,'game');}
 }finally{await browser.close()}
})().catch(e=>{console.error(e);process.exitCode=1});
