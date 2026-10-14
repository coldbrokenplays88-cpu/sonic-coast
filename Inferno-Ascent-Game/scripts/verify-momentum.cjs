// Temporary browser physics fixtures; production levels are never modified on disk.
const {chromium}=require('playwright'),assert=require('node:assert/strict'),fs=require('node:fs');
const {transferSource,aimHighSource}=require('../route-test-helpers.cjs');
const output=process.env.MOMENTUM_OUTPUT||'/tmp/sonic-momentum-validation';
(async()=>{
 fs.mkdirSync(output,{recursive:true});const browser=await chromium.launch({executablePath:process.env.SONIC_CHROMIUM||'/usr/bin/chromium',headless:true,args:['--no-sandbox']});const report={errors:[],versions:{}};
 try{
  for(const [name,url]of [['before',process.argv[2]||'http://127.0.0.1:8013'],['after',process.argv[3]||'http://127.0.0.1:8014']]){
   const page=await browser.newPage({viewport:{width:1440,height:1000}});await page.addInitScript(()=>{window.requestAnimationFrame=()=>0});page.on('pageerror',e=>report.errors.push(name+': '+e.message));await page.goto(url);await page.waitForFunction(()=>art.recoveredSpeedster&&art.supplemental&&art.recoveredCity);
   const values=await page.evaluate(()=>{
    const results=[];
    for(const act of [1,2]){
     function fixture(slope=0,speed=0,rolling=false){selectAct(act);start();const s={id:'probe',x1:0,x2:100000,y1:-40000,y2:-40000+slope*100000,kind:'main',cityType:'concrete-ramp'};level.surfaces=[s];level.hazards=[];level.deathZones=[];level.pads=[];level.springs=[];level.loops=[];level.floorAt=()=>1e6;END=200000;Object.assign(p,{x:2000,y:yOn(s,2000)-20,vx:speed/Math.hypot(1,slope),vy:0,ground:true,surface:s,rolling,rollAge:0,lowRollFrames:0,inv:0});keys.clear();if(rolling)keys.add('ArrowDown');}
     const tick=n=>{for(let f=0;f<n;f++){runFrames++;updateMovement()}};
     fixture();keys.add('ArrowRight');tick(120);const atTwoSeconds=p.vx;tick(120);const run={atTwoSeconds,top:p.vx};
     fixture();charge=20;tick(1);const initialDash=p.vx;keys.add('ArrowRight');tick(60);const dash={initial:initialDash,afterOneSecond:p.vx};
     fixture(.65,14,true);tick(60);const atOneSecond=measurementSpeed();tick(120);const rollingDescent={atOneSecond,atThreeSeconds:measurementSpeed(),worldVx:p.vx};
     fixture(.65,14);keys.add('ArrowRight');tick(180);const runningDescent={atThreeSeconds:measurementSpeed()};
     fixture(-2);keys.add('ArrowRight');tick(90);const steepLow={distance:p.x-2000,speed:measurementSpeed()};
     fixture(-2,26,true);tick(20);const steepFast={distance:p.x-2000,speed:measurementSpeed()};
     fixture(0,23);keys.add('ArrowLeft');let f=0;for(;f<120&&p.vx>0;f++)tick(1);const braking={distance:p.x-2000,ticks:f,vx:p.vx};
     fixture();keys.add('ArrowRight');tick(1);keys.clear();tick(8);const precision={distance:p.x-2000,vx:p.vx};
     fixture();p.ground=false;p.surface=null;p.y=-50000;p.vx=23;tick(60);const airCoasting=p.vx;
     fixture();p.ground=false;p.surface=null;p.y=-50000;p.vx=14;keys.add('ArrowLeft');tick(20);const airCountersteering=p.vx;
     results.push({act,run,dash,rollingDescent,runningDescent,steepLow,steepFast,braking,precision,airCoasting,airCountersteering});
    }
    const loops=[];selectAct(2);start();
    for(const speed of [2,14,20,26]){keys.clear();p.loop=null;stats.loops=0;boost=90;p.vx=speed;p.surface=null;beginLoop(level.loops[0]);let frames=0;for(;frames<200&&p.loop;frames++){runFrames++;updateLoop()}loops.push({entry:speed,frames,completed:stats.loops===1,exitSpeed:Math.hypot(p.vx,p.vy),boost});}
    return {metrics:results,loops};
   });report.versions[name]=values;
   if(name==='after'){
    const routes=[];
    for(const [speed,tap,coyoteJump]of [[14,true,false],[26,true,false],[14,true,true]]){
     await page.evaluate(speed=>{selectAct(2);start();const roof=surfaceById('draw-loop-roof');Object.assign(p,{x:roof.x2-160,y:roof.y2-20,vx:speed,vy:0,ground:true,surface:roof,rolling:true,rollAge:0,lowRollFrames:0,inv:0});boost=0;count=30;keys.clear();keys.add('ArrowRight');keys.add('ArrowDown');window.routeJump=-1;window.leftLaunch=false;},speed);
     let landed=false,captured=false;
     for(let f=0;f<450;f++){
      const state=await page.evaluate(({tap,coyoteJump})=>{if(p.surface?.id==='draw-loop-launch')window.leftLaunch=true;const canJump=coyoteJump?!p.ground&&window.leftLaunch:p.ground&&p.surface?.id==='draw-loop-launch'&&p.x>=p.surface.x2-45;if(window.routeJump<0&&canJump){press('Space',true);window.routeJump=runFrames;}if(tap&&window.routeJump>=0&&runFrames===window.routeJump+1)release('Space',true);update();cam=p.x-400;camY=p.y-300;zoom=1;draw();return {surface:p.surface?.id,loop:p.loop?.theta,deaths:stats.deaths,vx:p.vx,loops:stats.loops,boost}}, {tap,coyoteJump});
      assert.equal(state.deaths,0);
      if(!captured&&state.loop>2.6){await page.locator('#game').screenshot({path:`${output}/loop-${speed}-${coyoteJump?'coyote':'ground'}.png`});captured=true;}
      if(state.surface==='draw-loop-payoff-roof'){landed=true;routes.push({speed,tap,coyoteJump,ticks:f+1,...state});await page.locator('#game').screenshot({path:`${output}/landing-${speed}-${coyoteJump?'coyote':'ground'}.png`});break;}
     }
     assert.ok(landed);assert.equal(routes.at(-1).loops,2);assert.equal(routes.at(-1).boost,0);
    }
    report.authoredLoopRoutes=routes;
    report.platforming=await page.evaluate(({transferSource,aimHighSource})=>{
     selectAct(2);start();count=20;boost=0;const s=surfaceById('neon-0');Object.assign(p,{x:(s.x1+s.x2)/2,y:yOn(s,p.x)-20,vx:0,vy:0,ground:true,surface:s});p.y=yOn(s,p.x)-20;keys.clear();eval(transferSource+';window.transfer=transferTo');const climb=[];for(const id of ['neon-1','neon-2','neon-3','neon-4','neon-5'])climb.push({id,ticks:window.transfer(id)});
     restart();count=20;const spring=level.springs.find(d=>d.id==='mid-upper-spring');Object.assign(p,{x:spring.x,y:spring.y-20,vx:0,vy:0,ground:true,surface:surfaceById(spring.surfaceId)});eval(aimHighSource+';window.aim=aimHigh');let frames=0;for(;frames<900;frames++){window.aim();update();if(p.surface?.grindable)break;}if(!p.surface?.grindable)throw Error('High spring route failed');keys.clear();keys.add('ShiftLeft');keys.add('ArrowRight');boost=0;for(let f=0;f<400;f++){update();if(p.surface?.id==='mid-junction')break;}
     return {climb,highRouteFrames:frames,railSurface:p.surface?.id,railSpeed:p.vx,boost,deaths:stats.deaths};
    },{transferSource,aimHighSource});assert.equal(report.platforming.railSurface,'mid-junction');assert.equal(report.platforming.deaths,0);assert.equal(report.platforming.boost,0);assert.ok(report.platforming.railSpeed>20);
    for(const viewport of [{width:1024,height:768},{width:1440,height:900}]){await page.setViewportSize(viewport);await page.evaluate(()=>draw());assert.equal(await page.evaluate(()=>canvas.width),1920);}
   }
   await page.close();
  }
  for(let i=0;i<2;i++){
   const a=report.versions.before.metrics[i],b=report.versions.after.metrics[i];
   for(const field of ['run','braking','precision','airCoasting','airCountersteering'])assert.deepEqual(b[field],a[field],`preserve act ${b.act} ${field}`);
   assert.ok(b.dash.initial>a.dash.initial+3);assert.ok(b.rollingDescent.atThreeSeconds>a.rollingDescent.atThreeSeconds+5);assert.ok(b.rollingDescent.atThreeSeconds>b.runningDescent.atThreeSeconds+6);assert.ok(b.steepLow.distance<=0);assert.ok(b.steepFast.distance>100);
  }
  assert.ok(report.versions.after.loops.filter(l=>l.entry>=20).every(l=>l.completed&&l.boost===90));assert.ok(report.versions.after.loops.filter(l=>l.entry<=14).every(l=>!l.completed));assert.deepEqual(report.errors,[]);
  fs.writeFileSync(`${output}/results.json`,JSON.stringify(report,null,2)+'\n');console.log(JSON.stringify(report,null,2));
 }finally{await browser.close()}
})().catch(e=>{console.error(e);process.exitCode=1});
