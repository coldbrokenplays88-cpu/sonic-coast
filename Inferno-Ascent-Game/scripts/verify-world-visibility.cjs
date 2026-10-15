// Serve the game, then run: node scripts/verify-world-visibility.cjs [URL].
// Optional: VISIBILITY_BASELINE_REF=<git ref> VISIBILITY_CAPTURE_DIR=<directory>.
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const {execFileSync}=require('node:child_process');
const {chromium}=require('playwright');
const functions=[['pixel-world.js','drawPixelCityStructures','const cityDeckTextures'],['blimp-route.js','drawBlimpRoute',null],['midsection.js','drawMiddleSection',null]];
const baseline=process.env.VISIBILITY_BASELINE_REF;
const before=baseline?functions.map(([file,name,end])=>{
 const source=execFileSync('git',['show',`${baseline}:Inferno-Ascent-Game/${file}`],{encoding:'utf8'});
 return source.slice(source.indexOf('function '+name+'('),end?source.indexOf(end):undefined);
}):null;

(async()=>{
 const browser=await chromium.launch({executablePath:process.env.SONIC_CHROMIUM||'/usr/bin/chromium',headless:true,args:['--no-sandbox']});
 try{
  const page=await browser.newPage({viewport:{width:1440,height:1000}}),errors=[],results=[];
  page.on('pageerror',e=>errors.push(e.message));await page.addInitScript(()=>window.requestAnimationFrame=()=>0);
  await page.goto(process.argv[2]||'http://127.0.0.1:8014');await page.waitForFunction(()=>art.recoveredCity&&art.recoveredSpeedster);
  const after=await page.evaluate(names=>names.map(name=>(0,eval)(name).toString()),functions.map(f=>f[1]));
  const dir=process.env.VISIBILITY_CAPTURE_DIR;if(dir)fs.mkdirSync(dir,{recursive:true});
  for(const viewport of [{width:1440,height:1000},{width:1280,height:800}]){
   await page.setViewportSize(viewport);
   for(const variant of before?['before','after']:['after']){
    await page.evaluate(sources=>sources.forEach(source=>(0,eval)(source)),variant==='before'?before:after);
    for(const zoom of [1,.94,.78])for(const kind of ['carrier','lift','wreck','tower']){
     const result=await page.evaluate(({kind,z})=>{
      selectAct(2);start();testControlled=true;zoom=z;step=100;runFrames=210;let render;
      if(kind==='carrier'){
       const s=surfaceById('draw-moving-carrier');level.surfaces=[s];level.buildings=[];
       cam=s.x1-s.motion.amp-W/zoom+300;camY=s.y1-240;render=drawPixelCityStructures;
      }else if(kind==='lift'){
       const s=surfaceById('skyline-fork-lift-service-broadcast-tower');level.surfaces=[s];level.buildings=[];runFrames=0;
       cam=s.x1-400;camY=s.y1-s.motion.amp-40-H/zoom+140;render=drawPixelCityStructures;
      }else if(kind==='wreck'){
       const s=surfaceById('blimp-curve-0');cam=s.x1-200;camY=s.y1-140-H/zoom;render=drawBlimpRoute;
      }else{
       const m=level.middleSection;cam=m.pool.x1-600;camY=m.base-510-H/zoom;render=drawMiddleSection;
      }
      ctx.resetTransform();ctx.clearRect(0,0,canvas.width,canvas.height);ctx.save();
      ctx.scale(canvas.width/W,canvas.height/H);ctx.scale(zoom,zoom);ctx.translate(-cam,-camY);render();ctx.restore();
      const pixels=ctx.getImageData(0,0,canvas.width,canvas.height).data;let visiblePixels=0;
      for(let i=3;i<pixels.length;i+=4)if(pixels[i])visiblePixels++;
      return {visiblePixels,width:canvas.width,height:canvas.height};
     },{kind,z:zoom});
     if(variant==='before')assert.equal(result.visiblePixels,0,kind+' must reproduce the original disappearance');
     else assert.ok(result.visiblePixels>0,kind+' must render while its deck/body is off screen');
     results.push({viewport,variant,zoom,kind,...result});
     if(dir&&zoom===.94&&viewport.width===1440){
      const png=await page.evaluate(()=>{ctx.save();ctx.globalCompositeOperation='destination-over';ctx.fillStyle='#0d082d';ctx.fillRect(0,0,canvas.width,canvas.height);ctx.restore();return canvas.toDataURL('image/png').split(',')[1]});
      fs.writeFileSync(path.join(dir,kind+'-'+variant+'.png'),Buffer.from(png,'base64'));
     }
    }
   }
  }
  await page.evaluate(()=>{selectAct(2);start();testControlled=true;for(let i=0;i<360;i++){keys.add('ArrowRight');update();draw()}keys.clear()});
  assert.deepEqual(errors,[]);console.log(JSON.stringify({cases:results.length,baseline:baseline||null,errors,results},null,2));
 }finally{await browser.close();}
})().catch(error=>{console.error(error);process.exitCode=1});
