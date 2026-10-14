const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const{chromium}=require('playwright');
const{startLoopSource,blimpReplaySource}=require('../blimp-test-helpers.cjs');
(async()=>{
 const browser=await chromium.launch({executablePath:process.env.SONIC_CHROMIUM||'/usr/bin/chromium',headless:true,args:['--no-sandbox']});
 try{
  const page=await browser.newPage({viewport:{width:1440,height:1000}}),errors=[];
  page.on('pageerror',e=>errors.push(e.message));await page.addInitScript(()=>window.requestAnimationFrame=()=>0);
  await page.goto(process.argv[2]||'http://127.0.0.1:8014');await page.waitForFunction(()=>art.recoveredSpeedster&&art.recoveredCity);
  await page.evaluate(source=>(0,eval)(source),startLoopSource+blimpReplaySource);
  for(const style of ['dash','boost'])for(const cautious of [false,true]){
   const result=await page.evaluate(({style,cautious})=>{restart();startLoop(0,style);testControlled=true;const r=replayBlimps(cautious);draw();return {...r,hits:stats.hits,deaths:stats.deaths}}, {style,cautious});
   assert.equal(result.hits+result.deaths,0);assert.equal(result.life,true);assert.equal(result.shield,'bubble');
  }
  // Render every second simulation tick. Capture native canvas pixels, avoiding
  // browser screenshot waits or any scaling of the improved sprite pipeline.
  await page.evaluate(()=>{restart();startLoop();testControlled=true;cam=p.x-400;camY=p.y-300;zoom=.8;window.blimpCapture={jumped:false,turned:false,returned:false};});
  const dir=process.env.BLIMP_CAPTURE_DIR;if(dir)fs.mkdirSync(dir,{recursive:true});let done=false,drawTotal=0,maxDraw=0,rendered=0;
  for(let f=0;f<850;f+=2){
   const result=await page.evaluate(()=>{
    const state=window.blimpCapture;
    for(let i=0;i<2;i++){
     if(!state.jumped&&p.surface?.id==='draw-loop-launch'&&p.x>=p.surface.x2-45){press('Space',true);state.jumped=true;}
     if(!state.turned&&level.springs.find(s=>s.id==='blimp-entry-spring').firedAt!==undefined){release('Space',true);release('ArrowRight',true);press('ArrowLeft',true);state.turned=true;}
     if(state.turned&&!state.returned&&!p.ground&&p.x<surfaceById('blimp-curve-7').x2&&p.vy>0&&feet()>surfaceById('blimp-curve-4').y1-60)press('ArrowDown',true);
     if(!state.returned&&level.springs.find(s=>s.id==='blimp-return-spring').firedAt!==undefined){release('Space',true);release('ArrowLeft',true);release('ArrowDown',true);press('ArrowRight',true);state.returned=true;}
     update();
    }
    const begin=performance.now();draw();return {drawMs:performance.now()-begin,done:p.x>surfaceById('draw-hall-exit').x2+FOOT_RADIUS&&p.ground,deaths:stats.deaths};
   });
   assert.equal(result.deaths,0);drawTotal+=result.drawMs;maxDraw=Math.max(maxDraw,result.drawMs);rendered++;
   if(dir){const png=await page.evaluate(()=>canvas.toDataURL('image/png').split(',')[1]);fs.writeFileSync(path.join(dir,'frame-'+String(f/2).padStart(4,'0')+'.png'),Buffer.from(png,'base64'));}
   if(result.done){done=true;break;}
  }
  assert.ok(done,'rendered route reaches its original continuation');assert.deepEqual(errors,[]);
  // Re-render at a laptop viewport using the same full-resolution canvas.
  await page.setViewportSize({width:1280,height:800});await page.evaluate(()=>{restart();startLoop();replayBlimps();draw()});assert.deepEqual(errors,[]);
  console.log(JSON.stringify({desktop:'dash and boost, fast and cautious, both rewards, zero hits/deaths',laptop:'route and final render passed',renderedFrames:rendered,meanDrawMs:Math.round(drawTotal/rendered*100)/100,maxDrawMs:Math.round(maxDraw*100)/100,errors},null,2));
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1});
