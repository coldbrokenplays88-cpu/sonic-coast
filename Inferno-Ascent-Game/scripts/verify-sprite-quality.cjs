// Serve the unchanged checkout and working game separately; captures use identical state.
const {chromium}=require('playwright'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const out=process.env.SPRITE_OUTPUT||'/tmp/sonic-sprite-quality';fs.mkdirSync(out,{recursive:true});
const scenes=[['idle','recoveredSpeedster',16],['run','recoveredSpeedster',3],['boost','supplemental',11],['brake','recoveredSpeedster',35],['grind','supplemental',20],['roll','recoveredSpeedster',26],['kick','kick',18],['offer','offer',60],['nod','nod',15],['swing','swing',27],['confused','realize',35],['eggman','jetpack',4]];
(async()=>{const browser=await chromium.launch({executablePath:'/usr/bin/chromium',headless:true,args:['--no-sandbox']});const result={};try{for(const [label,url]of [['before',process.argv[2]||'http://127.0.0.1:8005'],['after',process.argv[3]||'http://127.0.0.1:8004']]){
 result[label]=[];
 for(const [screen,width,height,dpr]of [['desktop',1440,1000,1],['retina',1440,1000,2],['tablet',768,1024,1],['phone',390,844,3],['fullscreen',1920,1080,1]]){
  const page=await browser.newPage({viewport:{width,height},deviceScaleFactor:dpr});const errors=[];page.on('pageerror',e=>errors.push(e.message));await page.goto(url);await page.waitForFunction(()=>endingArtReady()&&art.recoveredSpeedster&&art.supplemental&&art.peeloutCycle&&scorpionParts.size===8);
  await page.evaluate(screen=>{start();testControlled=true;if(screen==='fullscreen')$('#game-shell').classList.add('viewport-fullscreen');},screen);
  const checks=[];
  for(let i=0;i<scenes.length;i++){
   const [name,what,frame]=scenes[i];
   const info=await page.evaluate(({i,name,what,frame})=>{
    const roof=surfaceById('summit-arena');p.x=level.arena.x+650;p.y=roof.y1-20;p.ground=true;p.surface=roof;p.vx=0;p.vy=0;p.inv=0;cam=level.arena.x+210;camY=level.arena.y-505;zoom=.8;step=120;runFrames=240;anim=12;boss=null;ending=null;
    let pose;const ordinary=sonic;
    if(i<6){pose={sheet:what,frame,face:1,ball:name==='roll',diameter:38,rotation:name==='grind'?.2:name==='roll'?.3:0};sonic=()=>{ctx.save();ctx.translate(p.x,p.y);drawRecoveredSonicFrame(pose);ctx.restore()};}
    else{ending=window.createEndingScene(level.arena,p,{x:cam,y:camY,zoom});while(ending.beat!==what)window.tickEndingScene(ending);while(ending.age<frame)window.tickEndingScene(ending);pose=window.endingPose(ending);}
    draw();sonic=ordinary;
    const actor=i<6?null:name==='eggman'?pose.eggman:['kick','offer','swing'].includes(name)?pose.shadow:pose.sonic;
    const crop=i<6?recoveredSpriteTextures.get(what+'/'+frame+'/'+(name==='roll'?38:0)):endingSprites.get(actor.sheet)[actor.frame];
    const r=canvas.getBoundingClientRect();
    const measure=document.createElement('canvas');measure.width=192;measure.height=180;const mc=measure.getContext('2d');mc.imageSmoothingEnabled=false;
    // Isolate a cel at the exact current backing-pixel footprint for detail counts.
    if(crop){const w=(crop.width??crop.image.width)*2,h=(crop.height??crop.image.height)*2;mc.drawImage(crop.image,0,0,w,h);}
    const pixels=mc.getImageData(0,0,measure.width,measure.height).data,colors=new Set();let occupied=0;
    for(let n=0;n<pixels.length;n+=4)if(pixels[n+3]){occupied++;colors.add((pixels[n]<<16)|(pixels[n+1]<<8)|pixels[n+2]);}
    return {name,pose,cache:[crop?.image.width,crop?.image.height],displayCel:[crop?.width??crop?.image.width,crop?.height??crop?.image.height],colors:colors.size,occupied,backing:[canvas.width,canvas.height],display:[r.width,r.height],camera:[cam,camY,zoom]};
   },{i,name,what,frame});checks.push(info);
   if(!process.env.SPRITE_SKIP_CAPTURE&&['desktop','phone','fullscreen'].includes(screen))await page.locator('#game').screenshot({path:path.join(out,`${label}-${screen}-${name}.png`),scale:'css'});
  }
  assert.deepEqual(errors,[]);result[label].push({screen,dpr,checks,errors});await page.close();
 }
}
for(let s=0;s<result.before.length;s++)for(let i=0;i<scenes.length;i++){
 const b=result.before[s].checks[i],a=result.after[s].checks[i];assert.deepEqual(a.pose,b.pose,'animation poses must be unchanged');assert.deepEqual(a.camera,b.camera);assert.deepEqual(a.display,b.display);assert.deepEqual(a.displayCel,b.displayCel,'sprite footprint must be unchanged');
}
fs.writeFileSync(path.join(out,'measurements.json'),JSON.stringify(result,null,2)+'\n');console.log('Both renderers compared across 5 viewports / 12 identical poses. Camera, display footprint, frame selections and zero errors verified.');
}finally{await browser.close();}})().catch(e=>{console.error(e);process.exitCode=1});
