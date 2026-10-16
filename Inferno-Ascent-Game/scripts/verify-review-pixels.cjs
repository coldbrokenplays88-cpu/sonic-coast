// Compare raw canvas pixels after artwork settles, including download failures.
const {chromium}=require('playwright');
const assert=require('node:assert/strict');
const cases={normal:[],oneSonic:['sonic-recovered-speedster.png'],bothSonic:['sonic-recovered-speedster.png','sonic-recovered-peelout.png'],noSonic:['sonic-recovered-speedster.png','sonic-recovered-peelout.png','sonic-expressive.png','sonic-motion.png','sonic-boost.png','sonic-brake.png','sonic-grind.png','sonic-detail.png','sonic-wind.png','sonic-transitions.png','sonic-supplemental.png','sonic-peelout-cycle.png','sonic-traversal-acting.png','sonic-traversal-launch.png'],oldCity:['city-recovered-burning.png'],oldestCity:['city-recovered-burning.png','city-collapse.png'],noCity:['city-recovered-burning.png','city-collapse.png','city.png'],noSupplemental:['sonic-supplemental.png','sonic-peelout-cycle.png'],noTraversal:['sonic-traversal-acting.png','sonic-traversal-launch.png']};
(async()=>{
 const browser=await chromium.launch({executablePath:process.env.SONIC_CHROMIUM||'/usr/bin/chromium',headless:true,args:['--no-sandbox']});
 const results=[];
 try{
 for(const [name,missing]of Object.entries(cases))for(const act of [1,2]){
  const captures=[];
  for(const url of process.argv.slice(2,4)){
   const page=await browser.newPage({viewport:{width:1440,height:1000}}),errors=[];
   page.on('pageerror',e=>errors.push(e.message));
   await page.addInitScript(()=>{requestAnimationFrame=()=>0;window.pixelSeed=1;Math.random=()=>{pixelSeed=(pixelSeed*1664525+1013904223)>>>0;return pixelSeed/4294967296}});
   await page.route('**/assets/*.png',r=>missing.includes(r.request().url().split('/').pop())?r.abort():r.continue());
   await page.goto(url);await page.waitForLoadState('networkidle');
   await page.evaluate(act=>{selectAct(act);start();testControlled=true},act);await page.waitForLoadState('networkidle');
   await page.evaluate(async()=>{if(typeof artLoads!=='undefined'){let size;do{size=artLoads.size;await Promise.all(artLoads.values())}while(size!==artLoads.size)}});
   const hashes=await page.evaluate(async()=>{
    const hashes=[];
    for(let i=0;i<20;i++){
     const s=level.surfaces[Math.floor(i*(level.surfaces.length-1)/19)],q=pose(s);
     step=180;runFrames=120;clock=2;shake=0;anim=32;particles=[];pixelSeed=123;
     Object.assign(p,{x:(q.x1+q.x2)/2,y:(q.y1+q.y2)/2-20,vx:0,vy:0,ground:true,surface:s,inv:0,hurt:0,rolling:false,roll:false,boosting:false,poseLandingFrame:-100,grindEntryFrame:-100,grindExitFrame:-100});
     if(i%5===1)p.vx=13;if(i%5===2){p.ground=false;p.surface=null;p.vy=-8;p.y-=60}if(i%5===3){p.vx=20;p.boosting=true}if(i%5===4){p.rolling=true;p.roll=true;p.vx=6}
     keys.clear();cam=Math.max(0,p.x-320);camY=level.act===2?p.y-280:0;zoom=1;
     draw();const data=ctx.getImageData(0,0,canvas.width,canvas.height).data;
     hashes.push(Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256',data))).map(v=>v.toString(16).padStart(2,'0')).join(''));
    }
    return hashes;
   });
   assert.deepEqual(errors,[],`${name} act ${act}: page errors`);captures.push(hashes);await page.close();
  }
  assert.deepEqual(captures[1],captures[0],`${name} act ${act}: changed pixels`);results.push({name,act,matchingFrames:captures[0].length});console.log(`${name} act ${act}: ${captures[0].length} identical frames`);
 }
 console.log(JSON.stringify({comparisons:results,matchingFrames:results.reduce((n,r)=>n+r.matchingFrames,0),pageErrors:0}));
 }finally{await browser.close()}
})().catch(e=>{console.error(e);process.exitCode=1});
