// Compare the merged momentum implementation with the uphill correction in Chromium.
const {chromium}=require('playwright'),assert=require('node:assert/strict'),fs=require('node:fs');
const output=process.env.UPHILL_OUTPUT||'/tmp/sonic-uphill-validation';
(async()=>{
 fs.mkdirSync(output,{recursive:true});
 const browser=await chromium.launch({executablePath:process.env.SONIC_CHROMIUM||'/usr/bin/chromium',headless:true,args:['--no-sandbox']});
 const report={errors:[],versions:{}};
 try{
  for(const [name,url]of [['before',process.argv[2]||'http://127.0.0.1:8015'],['after',process.argv[3]||'http://127.0.0.1:8014']]){
   const page=await browser.newPage({viewport:{width:1440,height:1000}});
   await page.addInitScript(()=>{window.requestAnimationFrame=()=>0});
   page.on('pageerror',e=>report.errors.push(`${name}: ${e.message}`));
   await page.goto(url);await page.waitForFunction(()=>art.recoveredSpeedster&&art.supplemental&&art.recoveredCity);
   const metrics=await page.evaluate(()=>{
    const results=[];
    for(const act of [1,2]){
     function fixture(slope=0,speed=0,rolling=false){selectAct(act);start();const s={id:'probe',x1:0,x2:100000,y1:-40000,y2:-40000+slope*100000,kind:'main'};level.surfaces=[s];level.hazards=[];level.deathZones=[];level.pads=[];level.springs=[];level.loops=[];level.floorAt=()=>1e6;END=200000;Object.assign(p,{x:2000,y:yOn(s,2000)-20,vx:speed/Math.hypot(1,slope),vy:0,ground:true,surface:s,rolling,rollAge:0,lowRollFrames:0,inv:0});keys.clear();if(rolling)keys.add('ArrowDown');}
     const tick=n=>{for(let f=0;f<n;f++){runFrames++;updateMovement()}};
     fixture();keys.add('ArrowRight');tick(240);const run=p.vx;
     fixture(0,23);keys.add('ArrowLeft');let frames=0;for(;frames<120&&p.vx>0;frames++)tick(1);const braking={frames,distance:p.x-2000,vx:p.vx};
     fixture();keys.add('ArrowRight');tick(1);keys.clear();tick(8);const precision={distance:p.x-2000,vx:p.vx};
     fixture();p.ground=false;p.surface=null;p.y=-50000;p.vx=23;tick(60);const airCoasting=p.vx;
     fixture();p.ground=false;p.surface=null;p.y=-50000;p.vx=14;keys.add('ArrowLeft');tick(20);const airBraking=p.vx;
     fixture(-.733333,26,true);tick(20);const rollingUphill={distance:p.x-2000,speed:measurementSpeed()};
     fixture(-.733333,26);keys.add('ArrowRight');tick(20);const runningUphill={distance:p.x-2000,speed:measurementSpeed()};
     fixture(.65,14,true);tick(180);const rollingDownhill=measurementSpeed();
     fixture(-2);keys.add('ArrowRight');tick(90);const steepLow={distance:p.x-2000,speed:measurementSpeed()};
     fixture();press('ArrowDown');press('Space');tick(80);release('ArrowDown');release('Space');keys.add('ArrowRight');tick(60);const releasedDash={speed:p.vx,rolling:p.rolling};
     results.push({act,run,braking,precision,airCoasting,airBraking,rollingUphill,runningUphill,rollingDownhill,steepLow,releasedDash});
    }return results;
   });
   await page.evaluate(()=>{selectAct(2);start();const roof=surfaceById('draw-loop-roof');Object.assign(p,{x:roof.x1+100,y:roof.y1-20,vx:0,vy:0,ground:true,surface:roof,inv:0});boost=0;count=4;keys.clear();cam=p.x-230;camY=p.y-H*.6;resetCameraTracking();press('ArrowDown');press('Space');});
   const route={chargeFrames:80,releaseFrames:0,landed:false,launch:null};let priorLaunch=false,capture=0;
   for(let f=0;f<530;f++){
    const state=await page.evaluate(f=>{
     if(f===80){release('ArrowDown');release('Space');press('ArrowRight');}
     const launch=p.surface?.id==='draw-loop-launch';update();draw();
     return {x:p.x,y:p.y,vx:p.vx,vy:p.vy,ground:p.ground,rolling:p.rolling,surface:p.surface?.id,onLaunch:launch,loops:stats.loops,deaths:stats.deaths,jumps:stats.jumps,boost};
    },f);
    if(process.env.UPHILL_CAPTURE&&name==='after'&&f%2===0)await page.locator('#game').screenshot({path:`${output}/frame-${String(capture++).padStart(4,'0')}.png`});
    if(priorLaunch&&!state.ground&&!route.launch){route.launch=state;await page.locator('#game').screenshot({path:`${output}/${name}-launch.png`});}
    priorLaunch=state.onLaunch;
    if(state.surface==='draw-loop-payoff-roof'||state.deaths){Object.assign(route,{releaseFrames:f+1-80,landed:state.surface==='draw-loop-payoff-roof',finish:state});await page.locator('#game').screenshot({path:`${output}/${name}-finish.png`});break;}
   }
   report.versions[name]={metrics,route};await page.close();
  }
  for(let i=0;i<2;i++){
   const a=report.versions.before.metrics[i],b=report.versions.after.metrics[i];
   for(const field of ['run','braking','precision','airCoasting','airBraking'])assert.deepEqual(b[field],a[field],`preserve act ${b.act} ${field}`);
   assert.ok(Math.abs(b.rollingDownhill-a.rollingDownhill)<1e-8);
   assert.ok(b.rollingUphill.speed>a.rollingUphill.speed+4);assert.ok(b.runningUphill.speed>a.runningUphill.speed+5);
   assert.ok(b.steepLow.distance<=0);assert.equal(b.releasedDash.rolling,true);assert.ok(b.releasedDash.speed>23);
  }
  assert.equal(report.versions.before.route.landed,false);assert.equal(report.versions.after.route.landed,true);
  const finish=report.versions.after.route.finish;assert.equal(finish.loops,2);assert.equal(finish.deaths,0);assert.equal(finish.jumps,0);assert.equal(finish.boost,0);
  assert.deepEqual(report.errors,[]);fs.writeFileSync(`${output}/results.json`,JSON.stringify(report,null,2)+'\n');console.log(JSON.stringify(report,null,2));
 }finally{await browser.close()}
})().catch(e=>{console.error(e);process.exitCode=1});
