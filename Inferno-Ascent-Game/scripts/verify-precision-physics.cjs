// Optional Chromium comparison against the approved pre-physics-update build.
// Start the game server, then run node scripts/verify-precision-physics.cjs [URL].
const assert=require('node:assert/strict'),fs=require('node:fs');
const {execFileSync}=require('node:child_process');
const {chromium}=require('playwright');
const {transferSource,aimHighSource}=require('../route-test-helpers.cjs');
const baselineRef='9f94cc4';
const baselineSources=Object.fromEntries(['game.js','act2.js'].map(file=>[file,execFileSync('git',['show',`${baselineRef}:Inferno-Ascent-Game/${file}`],{encoding:'utf8'})]));

(async()=>{
 const browser=await chromium.launch({executablePath:process.env.SONIC_CHROMIUM||'/usr/bin/chromium',headless:true,args:['--no-sandbox']});
 const results={},errors=[];
 try{
  for(const version of ['before','after']){
   const page=await browser.newPage({viewport:{width:1440,height:1000}});
   page.on('pageerror',e=>errors.push(`${version}: ${e.message}`));
   if(version==='before')for(const [file,body]of Object.entries(baselineSources))await page.route(`**/${file}?*`,route=>route.fulfill({status:200,contentType:'text/javascript',body}));
   await page.goto(process.argv[2]||'http://127.0.0.1:8003');
   await page.waitForFunction(()=>art.recoveredSpeedster&&art.scorpion&&typeof updateMovement==='function');
   results[version]=[];
   for(const act of [1,2]){
    const metrics=await page.evaluate(act=>{
     function place({speed=0,air=false}={}){
      selectAct(act);start();testControlled=true;const s=level.surfaces.find(s=>s.id===(act===1?'rail-0':'under-attack-act2-0'));
      Object.assign(p,{x:300,y:air?-1400:yOn(s,300)-20,vx:speed,vy:0,ground:!air,surface:air?null:s,inv:10000});keys.clear();
     }
     const ground={};
     for(const speed of [14,23]){
      place({speed});const x=p.x;press('ArrowLeft',true);let frames=0;
      while(p.vx>0&&frames<120){update();frames++;}
      ground[speed]={frames,distance:p.x-x,vx:p.vx,grounded:p.ground};
     }
     place({speed:10,air:true});press('ArrowLeft',true);const airStart=p.x;
     for(let f=0;f<20;f++)update();const air={distance:p.x-airStart,vx:p.vx,vy:p.vy};
     place({speed:23,air:true});for(let f=0;f<60;f++)update();const neutral={x:p.x,y:p.y,vx:p.vx,vy:p.vy};
     place();press('ArrowRight',true);for(let f=0;f<40;f++)update();const run={x:p.x,y:p.y,vx:p.vx};
     place();const footStart=p.x;press('ArrowRight',true);update();release('ArrowRight',true);for(let f=0;f<8;f++)update();const footstep={distance:p.x-footStart,vx:p.vx};
     place();press('ShiftLeft',true);press('ArrowRight',true);for(let f=0;f<35;f++)update();release('ShiftLeft',true);const gauge=boost;for(let f=0;f<10;f++)update();const boosted={x:p.x,y:p.y,vx:p.vx,boost,gauge};
     place();press('ArrowDown',true);press('Space',true);for(let f=0;f<80;f++)update();release('ArrowDown',true);release('Space',true);for(let f=0;f<6;f++)update();const dash={x:p.x,y:p.y,vx:p.vx,rolling:p.rolling};
     place({speed:8});press('Space',true);const jumpStart=p.y;let minY=p.y;for(let f=0;f<60;f++){update();minY=Math.min(minY,p.y);if(p.ground)break;}const jump={height:jumpStart-minY,x:p.x,grounded:p.ground};
     return {act,ground,air,neutral,run,footstep,boosted,dash,jump};
    },act);
    results[version].push(metrics);
   }
   // Actual Act 2 platforms, hazards, springs, moving hoist, and connected rails.
   const routes=await page.evaluate(({transferSource,aimHighSource})=>{
    selectAct(2);start();testControlled=true;count=20;boost=0;
    const first=surfaceById('neon-0');p.x=(first.x1+first.x2)/2;p.y=yOn(first,p.x)-20;p.surface=first;p.ground=true;p.vx=0;p.vy=0;keys.clear();
    eval(transferSource+';window.physicsTransferTo=transferTo');
    const climb=[];for(const id of ['neon-1','neon-2','neon-3','neon-4','neon-5']){
     const frames=window.physicsTransferTo(id);climb.push({id,frames,x:p.x,vx:p.vx});draw();
    }
    const launches=[];
    for(const id of ['mid-upper-spring','momentum-vent']){
     restart();testControlled=true;count=20;const d=[...level.springs,...level.pads].find(d=>d.id===id);
     p.x=d.x;p.y=d.y-20;p.surface=surfaceById(d.surfaceId);p.ground=true;p.vx=id==='momentum-vent'?23:9.25;launchAirDevice(d);
     const trace=[];for(let f=0;f<100;f++){
      keys.clear();if(f<8||(p.vy>0&&f<48))keys.add('ArrowLeft');update();trace.push({x:p.x,y:p.y,vx:p.vx,vy:p.vy,ground:p.ground});
      if(p.ground||stats.deaths||level.springs.some(d=>d.id!==id&&d.firedAt===runFrames))break;
     }launches.push({id,trace});
    }
    restart();testControlled=true;count=20;const d=level.springs.find(d=>d.id==='mid-upper-spring');p.x=d.x;p.y=d.y-20;p.surface=surfaceById(d.surfaceId);p.ground=true;p.vx=0;
    eval(aimHighSource+';window.physicsAimHigh=aimHigh');
    let highFrames=0;for(;highFrames<1100;highFrames++){window.physicsAimHigh();update();if(p.surface?.grindable)break;}
    if(!p.surface?.grindable)throw Error('Six-spring skill route did not reach its rail');
    const high={frames:highFrames,springs:level.springs.filter(d=>d.id.startsWith('mid-')&&d.firedAt!==undefined).map(d=>d.id),deaths:stats.deaths};
    boost=0;keys.clear();keys.add('ShiftLeft');keys.add('ArrowRight');let railFrames=0;
    for(;railFrames<400;railFrames++){update();if(p.ground&&p.surface?.id==='mid-junction')break;}
    const rail={frames:railFrames,surface:p.surface?.id,vx:p.vx,boost,deaths:stats.deaths};
    draw();return {climb,launches,high,rail};
   },{transferSource,aimHighSource});
   results[version+'Routes']=routes;
   if(version==='after'){
    // A descending fast landing on an existing 300-unit tower step.
    const landing=await page.evaluate(()=>{
     restart();testControlled=true;count=20;const s=surfaceById('neon-1');
     p.x=s.x1+40;p.y=s.y1-38;p.vx=14;p.vy=12;p.ground=false;p.surface=null;keys.clear();
     zoom=.94;cam=p.x-W/zoom*.38;camY=p.y-H/zoom*.64;resetCameraTracking();press('ArrowLeft',true);
     let landingSpeed=null,frames=0;for(;frames<60;frames++){update();if(p.ground&&landingSpeed===null)landingSpeed=p.vx;if(landingSpeed!==null&&p.vx<=0)break;}
     keys.clear();draw();return {surface:p.surface?.id,vx:p.vx,x:p.x,left:s.x1,right:s.x2,frames,landingSpeed,deaths:stats.deaths};
    });
    assert.equal(landing.surface,'neon-1');assert.ok(landing.landingSpeed>12,'fast landing remains fast');assert.equal(landing.vx,0);assert.equal(landing.deaths,0);
    results.highSpeedLanding=landing;
    await page.locator('#game').screenshot({path:'../docs/validation/precision-landing.png'});
    // Actual native keyboard dispatch and real-time update loop, outside stepping.
    await page.evaluate(()=>{selectAct(1);start();testControlled=true;p.vx=10;p.x=300;});
    await page.keyboard.down('ArrowLeft');await page.waitForFunction(()=>p.vx<6);await page.keyboard.up('ArrowLeft');
    assert.ok(await page.evaluate(()=>p.ground));await page.evaluate(()=>testControlled=true);
    results.nativeKeyboardBraking=true;
   }
   await page.close();
  }
  for(let i=0;i<2;i++){
   const old=results.before[i],now=results.after[i];
   for(const speed of [14,23]){assert.ok(now.ground[speed].distance<old.ground[speed].distance*.85);assert.equal(now.ground[speed].vx,0);assert.ok(now.ground[speed].grounded);}
   assert.ok(now.air.distance<old.air.distance);assert.ok(now.air.vx<old.air.vx);assert.equal(now.air.vy,old.air.vy);
   assert.ok(now.footstep.distance<old.footstep.distance);assert.equal(now.footstep.vx,0);
   for(const key of ['neutral','run','boosted','dash','jump'])assert.deepEqual(now[key],old[key],`act ${now.act}: unchanged ${key}`);
  }
  assert.deepEqual(results.afterRoutes.launches,results.beforeRoutes.launches,'spring/vent launch trajectories retain original countersteering');
  assert.equal(results.afterRoutes.high.deaths,0);assert.equal(results.afterRoutes.high.springs.length,6);
  assert.equal(results.afterRoutes.rail.surface,'mid-junction');assert.ok(results.afterRoutes.rail.vx>20);assert.equal(results.afterRoutes.rail.boost,0);assert.equal(results.afterRoutes.rail.deaths,0);
  assert.deepEqual(errors,[]);
  results.baselineRef=baselineRef;results.browser='Chromium';results.pageErrors=errors;
  fs.writeFileSync('../docs/validation/precision-physics-replay.json',JSON.stringify(results,null,2)+'\n');
  const summary={};for(const act of [1,2]){const old=results.before[act-1],now=results.after[act-1];summary['act'+act]={ground14:{before:old.ground[14],after:now.ground[14]},ground23:{before:old.ground[23],after:now.ground[23]},air20Frames:{before:old.air,after:now.air},footstep:{before:old.footstep,after:now.footstep}};}
  console.log(JSON.stringify(summary,null,2));
  console.log('Passed: both-act before/after physics comparison; unchanged run/boost/dash/jump/air-coast; actual switchback climb, six narrow springs, moving hoist, empty-gauge rail exit, launch steering and fast landing; native keyboard braking; zero page errors.');
 }finally{await browser.close();}
})().catch(error=>{console.error(error);process.exitCode=1});
