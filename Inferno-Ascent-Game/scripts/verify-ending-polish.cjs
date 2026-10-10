// Optional browser comparison against the unchanged checkout.
// Serve both games, then: node scripts/verify-ending-polish.cjs <before URL> <after URL>
const {chromium}=require('playwright'),assert=require('node:assert/strict');
const samples=[['kick',18],['return',26],['swing',31],['realize',25],['sigh',40]];
(async()=>{
 const browser=await chromium.launch({executablePath:process.env.SONIC_CHROMIUM||'/usr/bin/chromium',args:['--no-sandbox']});
 const output={note:'Chromium batch-average drawing times on this cloud machine; not hardware FPS guarantees.'};
 try{
  for(const [label,url]of [['before',process.argv[2]],['after',process.argv[3]]]){
   if(!url)throw Error('Both baseline and working URLs are required');output[label]={};
   for(const [screen,width,height,dpr]of [['desktop',1440,1000,1],['laptop',1280,800,2]]){
    const page=await browser.newPage({viewport:{width,height},deviceScaleFactor:dpr}),errors=[];
    page.on('pageerror',e=>errors.push(e.message));await page.goto(url);
    await page.waitForFunction(()=>endingArtReady()&&art.recoveredSpeedster&&art.scorpion);
    await page.evaluate(()=>{
     start();testControlled=true;const roof=surfaceById('summit-arena');
     p.x=level.arena.x+650;p.y=roof.y1-20;p.surface=roof;p.ground=true;
     update();boss.state='defeated';boss.hits=3;cam=level.arena.x+210;camY=level.arena.y-505;zoom=.8;update();
    });
    const result=await page.evaluate(({samples,label})=>{
     const camera=[cam,camY,zoom],scene=ending,poses=[],used=new Set();
     let nativeBytes=0,canvasCount=0;const canvasOrigins=[];for(const frames of endingSprites.values())for(const cel of frames)nativeBytes+=cel.image.width*cel.image.height*4;
     const nativeCreate=document.createElement.bind(document);
     document.createElement=function(tag,...args){if(tag==='canvas'){canvasCount++;canvasOrigins.push(new Error().stack);}return nativeCreate(tag,...args);};
     try{
      // Validate every exposed cel, not only the benchmark samples.
      while(!scene.done){const q=window.endingPose(scene);
       for(const actor of [q.sonic,q.shadow,q.pod,q.eggman,q.rocket].filter(Boolean))if(actor.visible!==false&&actor.sheet!=='recovered'){
        const cel=endingSprites.get(actor.sheet)?.[actor.frame];
        if(!cel)throw Error('missing cel '+actor.sheet+':'+actor.frame);used.add(actor.sheet+':'+actor.frame);
        if(!(cel.image.width>0&&cel.image.height>0))throw Error('empty cel');
       }
       window.tickEndingScene(scene);
      }
      for(const [beat,age]of samples){
       ending=window.createEndingScene(level.arena,p,{x:cam,y:camY,zoom});
       while(ending.beat!==beat)window.tickEndingScene(ending);while(ending.age<age)window.tickEndingScene(ending);
       for(let i=0;i<90;i++){step++;draw();}const warmCount=canvasCount,times=[];
       for(let batch=0;batch<5;batch++){const t=performance.now();for(let i=0;i<30;i++){step++;draw();}times.push((performance.now()-t)/30);}
       times.sort((a,b)=>a-b);
       const origins=canvasOrigins.slice(warmCount),endingAllocations=origins.filter(s=>/prepareEndingArt|prepareEndingEmerald/.test(s)).length;
       if(endingAllocations)throw Error('warm ending draw allocated a cel');
       poses.push({beat,age,medianMs:times[2],maxBatchMs:times.at(-1),extraWorldCanvases:canvasCount-warmCount,extraEndingCanvases:endingAllocations});
      }
      return {camera,cameraAfter:[cam,camY,zoom],nativeCelBytes:nativeBytes,exposedCels:used.size,supplementalCels:[...used].filter(k=>k.includes('-polish')).length,poses};
     }finally{document.createElement=nativeCreate;ending=scene;}
    },{samples,label});
    assert.deepEqual(result.cameraAfter,result.camera);assert.deepEqual(errors,[]);
    if(label==='after')assert.equal(result.supplementalCels,56,'all authored supplemental cels must be reachable');
    output[label][screen]=result;await page.close();
   }
  }
  // A missing supplemental download must hold playback and support retry too.
  const page=await browser.newPage();let fail=true;
  await page.route('**/assets/ending-shadow-polish.png*',r=>fail?r.abort():r.continue());
  await page.goto(process.argv[3]);await page.waitForFunction(()=>endingLoadErrors.has('shadow-polish'));
  await page.evaluate(()=>{start();testControlled=true;const roof=surfaceById('summit-arena');p.x=level.arena.x+650;p.y=roof.y1-20;p.surface=roof;p.ground=true;update();boss.state='defeated';boss.hits=3;update();for(let i=0;i<120;i++)update();});
  assert.equal(await page.evaluate(()=>ending.frame),0);fail=false;await page.locator('#ending-retry').click();await page.waitForFunction(()=>endingArtReady());
  assert.equal(await page.evaluate(()=>{update();return ending.frame;}),1);output.supplementalRetry=true;
  console.log(JSON.stringify(output,null,2));
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
