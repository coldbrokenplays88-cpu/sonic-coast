// Deterministic Chromium input/render checks, using real level collision and sprites.
const {chromium}=require('playwright');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const output=process.env.PREREQUISITE_OUTPUT||'/tmp/sonic-prerequisite-browser';
(async()=>{
 fs.mkdirSync(output,{recursive:true});
 const browser=await chromium.launch({executablePath:process.env.SONIC_CHROMIUM||'/usr/bin/chromium',headless:true,args:['--no-sandbox']});
 const errors=[],report={acts:[],pool:{},screenshots:[],errors};
 try{
  const page=await browser.newPage({viewport:{width:1440,height:1000}});
  await page.addInitScript(()=>{window.requestAnimationFrame=()=>0});
  page.on('pageerror',e=>errors.push(e.message));
  page.on('response',r=>{if(r.status()>=400)errors.push(`${r.status()} ${r.url()}`)});
  await page.goto(process.argv[2]||'http://127.0.0.1:8014');
  await page.waitForFunction(()=>typeof start==='function'&&art.recoveredSpeedster&&art.recoveredCity);
  async function tick(n=1){await page.evaluate(n=>{for(let i=0;i<n;i++)update();draw()},n)}
  async function shot(name){await page.evaluate(()=>draw());await page.locator('#game').screenshot({path:`${output}/${name}.png`});report.screenshots.push(name+'.png')}
  for(const act of [1,2]){
   await page.evaluate(act=>{selectAct(act);start();p.inv=0;canvas.focus()},act);
   await page.keyboard.down('Space');await tick(7);await page.keyboard.up('Space');
   await page.keyboard.down('Shift');await tick();
   let state=await page.evaluate(()=>({used:p.airBoostUsed,vx:p.vx,vy:p.vy,boost}));
   assert.equal(state.used,true);assert.equal(state.vx,23);assert.equal(state.vy,0);
   await shot('act-'+act+'-air-boost');await tick(20);
   assert.equal(await page.evaluate(()=>p.boosting),false);
   await page.keyboard.up('Shift');await page.keyboard.down('Shift');await tick();
   // The burst cannot refill from a button release while still in the air.
   const repeated=await page.evaluate(()=>({ground:p.ground,active:p.airBoostActive}));
   if(!repeated.ground)assert.equal(repeated.active,false);
   await page.keyboard.up('Shift');
   report.acts.push({act,initialBurst:state});
  }
  await page.evaluate(()=>{selectAct(2);start();const m=level.monitors.find(m=>m.item==='bubble'),q=monitorPose(m);Object.assign(p,{x:q.x-38,y:q.y-20,vx:5,vy:0,ground:true,surface:surfaceById(m.surfaceId)});cam=p.x-450;camY=p.y-320;zoom=1;boost=11;});
  await shot('bubble-monitor');
  await page.keyboard.down('ArrowDown');await page.keyboard.down('ArrowRight');await tick(8);await page.keyboard.up('ArrowDown');await page.keyboard.up('ArrowRight');
  assert.equal(await page.evaluate(()=>p.shield),'bubble');assert.equal(await page.evaluate(()=>boost),11);
  await shot('bubble-shield');
  await page.keyboard.down('Space');await tick(8);await page.keyboard.up('Space');await page.keyboard.down('Space');await tick();
  assert.equal(await page.evaluate(()=>p.bubbleSlam),true);
  await shot('bubble-slam');await page.keyboard.up('Space');
  let bounced=false;
  for(let i=0;i<45;i++){await tick();if(await page.evaluate(()=>!p.bubbleSlam&&p.vy<0)){bounced=true;break}}
  assert.ok(bounced);report.shield={collected:true,gaugeUnchanged:true,slamRebounded:true};
  // Replay the authored low spring through water and the ramp with standard input.
  await page.evaluate(()=>{restart();const s=level.springs.find(s=>s.id==='mid-low-spring');Object.assign(p,{x:s.x,y:s.y-20,ground:true,surface:surfaceById(s.surfaceId),vx:8});cam=p.x-300;camY=p.y-250;keys.clear();keys.add('ArrowRight');keys.add('ArrowDown')});
  let entered=false,exited=false;
  for(let f=0;f<350;f++){
   await tick();const st=await page.evaluate(()=>({wet:p.underwater,surface:p.surface?.id,deaths:stats.deaths,air:p.airRemaining}));
   assert.equal(st.deaths,0);
   if(st.wet&&!entered){entered=true;await shot('pool-entry')}
   if(entered&&st.surface==='mid-pool-roof-exit'){exited=true;report.pool.travelFrames=f+1;break;}
  }
  assert.ok(entered&&exited);report.pool.authoredSpringRampExit=true;
  // Stationary breath countdown with real water volume, normal updates, pause and death.
  await page.evaluate(()=>{restart();const s=surfaceById('mid-pool-curve-1760');Object.assign(p,{x:s.x1+10,y:yOn(s,s.x1+10)-20,vx:0,vy:0,ground:true,surface:s,rolling:false,inv:0});keys.clear();updateWaterState();p.airRemaining=721;cam=p.x-450;camY=p.y-300;zoom=1;});
  await tick();await shot('drowning-warning');
  await page.evaluate(()=>pause());const before=await page.evaluate(()=>p.airRemaining);await tick(120);assert.equal(await page.evaluate(()=>p.airRemaining),before);
  await page.evaluate(()=>{start();p.airRemaining=1;});await tick();assert.equal(await page.evaluate(()=>stats.deaths),1);report.pool.drowningAndPause=true;
  await page.evaluate(()=>{restart();const s=surfaceById('mid-pool-curve-1760');Object.assign(p,{x:s.x1+10,y:yOn(s,s.x1+10)-20,vx:0,vy:0,ground:true,surface:s,shield:'bubble'});keys.clear()});
  await tick(1900);assert.equal(await page.evaluate(()=>stats.deaths),0);assert.equal(await page.evaluate(()=>p.airRemaining),1800);report.pool.shieldBreathing=true;
  for(const viewport of [{width:1024,height:768},{width:1440,height:900}]){await page.setViewportSize(viewport);await shot('shield-'+viewport.width);assert.equal(await page.evaluate(()=>canvas.width),1920);}
  assert.deepEqual(errors,[]);
  fs.writeFileSync(`${output}/results.json`,JSON.stringify(report,null,2));console.log(JSON.stringify(report,null,2));
 }finally{await browser.close()}
})().catch(e=>{console.error(e);process.exitCode=1});
