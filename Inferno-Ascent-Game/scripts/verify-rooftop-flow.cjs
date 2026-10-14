const {chromium}=require('playwright'),assert=require('node:assert/strict'),fs=require('node:fs');
const {rooftopFlowSource,rooftopRecoverySource}=require('../route-test-helpers.cjs');
const output=process.env.ROOFTOP_OUTPUT||'/tmp/sonic-rooftop-flow';
(async()=>{
 fs.mkdirSync(output,{recursive:true});const browser=await chromium.launch({executablePath:process.env.SONIC_CHROMIUM||'/usr/bin/chromium',headless:true,args:['--no-sandbox']});
 const report={errors:[],versions:{}};
 try{
  for(const [name,url]of [['before',process.argv[2]||'http://127.0.0.1:8016'],['after',process.argv[3]||'http://127.0.0.1:8014']]){
   const page=await browser.newPage({viewport:{width:1440,height:1000}});await page.addInitScript(()=>{window.requestAnimationFrame=()=>0});page.on('pageerror',e=>report.errors.push(`${name}: ${e.message}`));
   await page.goto(url);await page.waitForFunction(()=>art.recoveredSpeedster&&art.recoveredCity);
   const geometry=await page.evaluate(()=>({surfaces:level.surfaces.map(s=>({id:s.id,x1:s.x1,x2:s.x2,y1:s.y1,y2:s.y2,kind:s.kind})),hazards:level.hazards,springs:level.springs,pads:level.pads,loops:level.loops.map(({used,solved,...l})=>l),checkpoints:level.checkpoints,enemies:enemies.map(e=>({id:e.id,base:e.base,baseY:e.baseY}))}));
   await page.evaluate(source=>(0,eval)(source),rooftopFlowSource+'\n'+rooftopRecoverySource);
   async function prepare(speed=20,id='draw-loop-payoff-roof',rolling=false,charge=false){
    await page.evaluate(({speed,id,rolling,charge})=>{selectAct(2);start();const s=surfaceById(id);Object.assign(p,{x:s.x1+80,y:s.y1-20,vx:charge?0:speed,vy:0,ground:true,surface:s,inv:0,rolling,dashRolling:rolling});boost=0;count=30;keys.clear();if(charge){press('ArrowDown');press('Space');for(let i=0;i<80;i++)update();release('ArrowDown');release('Space');}press('ArrowRight');delete window.rooftopReplay;delete window.rooftopRecovery;cam=p.x-W*.25;camY=p.y-H*.65;zoom=1;resetCameraTracking();},{speed,id,rolling,charge});
   }
   async function run({speed=20,hold=8,offset=0,miss=false,id='draw-loop-payoff-roof',rolling=false,charge=false,capture}={}){
    await prepare(speed,id,rolling,charge);let trace={},caught=false,frame=0;const folder=capture&&`${output}/${capture}`;if(folder){fs.rmSync(folder,{recursive:true,force:true});fs.mkdirSync(folder,{recursive:true});}
    for(let f=0;f<600;f++){
     trace=await page.evaluate(({hold,offset,miss})=>{if(miss)stepRooftopRecovery();else stepRooftopFlow(hold,offset);draw();return {id:p.surface?.id,x:p.x,y:p.y,vx:p.vx,deaths:stats.deaths,jumps:stats.jumps,boost,hits:stats.hits,replay:window.rooftopReplay};},{hold,offset,miss});
     if(trace.id?.startsWith('draw-roof-recovery'))caught=true;
     if(folder&&f%2===0)await page.locator('#game').screenshot({path:`${folder}/frame-${String(frame++).padStart(4,'0')}.png`});
     if(trace.deaths||trace.id==='draw-burning-approach'){
      if(folder)await page.locator('#game').screenshot({path:`${output}/${capture}-finish.png`});
      return {speed,hold,offset,miss,rolling,charge,from:id,ticks:f+1,caught,...trace};
     }
    }return {speed,hold,offset,miss,rolling,charge,from:id,ticks:600,caught,timedOut:true,...trace};
   }
   const runs=[];
   if(name==='before'){for(const [speed,hold]of [[14,6],[26,10]])runs.push(await run({speed,hold}));runs.push(await run({speed:20,miss:true}));}
   else {
    for(const speed of [14,18,20,23,26])for(const hold of [6,8,10])runs.push(await run({speed,hold,capture:process.env.ROOFTOP_CAPTURE&&speed===20&&hold===8?'flow':undefined}));
    for(const speed of [14,20,26])for(const offset of [-50,50])runs.push(await run({speed,hold:8,offset}));
    for(const id of ['draw-loop-payoff-roof','draw-next-roof'])for(const speed of [14,20,26])for(const rolling of [false,true])runs.push(await run({speed,miss:true,id,rolling,capture:process.env.ROOFTOP_CAPTURE&&id==='draw-loop-payoff-roof'&&speed===20&&!rolling?'recovery':undefined}));
    runs.push(await run({speed:26,miss:true,id:'draw-next-roof',charge:true}));
    for(const r of runs){assert.equal(r.id,'draw-burning-approach');assert.equal(r.deaths,0);assert.equal(r.hits,0);assert.equal(r.boost,0);assert.equal(r.jumps,r.miss?1:2);if(r.miss)assert.equal(r.caught,true);else assert.ok(r.replay.minSpeed>=14-1e-8);}
    for(const size of [{width:1024,height:768},{width:1440,height:900}]){await page.setViewportSize(size);await page.evaluate(()=>draw());assert.equal(await page.evaluate(()=>canvas.width),1920);}
   }
   report.versions[name]={geometry,runs};await page.close();
  }
  const before=report.versions.before.geometry,after=report.versions.after.geometry,changed=new Set(['draw-next-roof','draw-burning-approach']);
  for(const s of before.surfaces)if(!changed.has(s.id))assert.deepEqual(after.surfaces.find(a=>a.id===s.id),s,`preserve ${s.id}`);
  for(const field of ['hazards','springs','pads','loops','checkpoints','enemies'])assert.deepEqual(after[field],before[field],`preserve ${field}`);
  assert.equal(after.surfaces.length,before.surfaces.length+3);assert.deepEqual(report.errors,[]);
  fs.writeFileSync(`${output}/results.json`,JSON.stringify(report,null,2)+'\n');
  console.log(JSON.stringify({errors:report.errors,versions:Object.fromEntries(Object.entries(report.versions).map(([name,v])=>[name,{cases:v.runs.length,successful:v.runs.filter(r=>r.id==='draw-burning-approach'&&!r.deaths).length,runs:v.runs.map(({replay,...r})=>r)}]))},null,2));
 }finally{await browser.close()}
})().catch(e=>{console.error(e);process.exitCode=1});
