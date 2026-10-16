// Run against a local static server. Art preview uses the real native-cel renderer.
const {chromium}=require('playwright'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const out=process.env.TRAVERSAL_OUTPUT||'/tmp/sonic-traversal-validation';fs.mkdirSync(out,{recursive:true});
const save=(name,data)=>fs.writeFileSync(path.join(out,name),Buffer.from(data.split(',')[1],'base64'));
(async()=>{const browser=await chromium.launch({executablePath:process.env.SONIC_CHROMIUM||'/usr/bin/chromium',headless:true,args:['--no-sandbox']});
try{const page=await browser.newPage({viewport:{width:1440,height:1000}}),errors=[],results=[];page.on('pageerror',e=>errors.push(e.message));
await page.goto(process.argv[2]||'http://127.0.0.1:8014');await page.waitForFunction(()=>art.traversalActing&&art.traversalLaunch&&art.recoveredSpeedster&&art.supplemental);
for(const act of [1,2]){
 const checks=await page.evaluate(act=>{
  selectAct(act);start();testControlled=true;p.inv=0;
  function place(s,x){const q=pose(s);Object.assign(p,{x,y:yOn(s,x)-20,vx:0,vy:0,surface:s,ground:true,face:1,rolling:false,roll:false,boosting:false,hurt:0,brakeActive:false,poseLandingFrame:-100});}
  let edge=null;for(const s of level.surfaces){const q=pose(s);if(s.grindable||Math.abs(q.slope)>.01||!active(s))continue;place(s,q.x2-3);if(traversalGroundState()==='balance-forward'){edge=s;break;}}
  if(!edge)throw new Error('No exposed roof edge');updateTraversalAnimation();const forward=sonicPose().state;p.face=-1;updateTraversalAnimation();const backward=sonicPose().state;
  // Walk away from the edge: the animation must release as soon as movement resumes.
  keys.add('ArrowLeft');for(let n=0;n<5;n++)update();const moving=sonicPose().state;keys.clear();
  let wall=null;for(const h of level.hazards){if(h.type==='spikes'||h.broken||!Number.isFinite(h.floor))continue;const s=topAt(h.x-14,h.floor-2)?.s;if(!s)continue;place(s,h.x-14);keys.add('ArrowRight');update();if(sonicPose().state==='push'){wall=h.id;break;}keys.clear();}
  const pushing=sonicPose().state;keys.clear();update();const released=sonicPose().state;
  return {act,edge:edge.id,forward,backward,moving,wall,pushing,released};
 },act);
 assert.equal(checks.forward,'balance-forward');assert.equal(checks.backward,'balance-backward');assert.notEqual(checks.moving,'balance-backward');assert.ok(checks.wall);assert.equal(checks.pushing,'push');assert.notEqual(checks.released,'push');results.push(checks);
}
const launch=await page.evaluate(()=>{
 selectAct(2);start();testControlled=true;
 const record=[];for(const device of [level.springs.find(s=>s.id==='vent-lower-spring'),level.pads.find(s=>s.cityVent)]){
  const s=level.surfaces.find(s=>s.id===device.surfaceId),q=airDevicePose(device);Object.assign(p,{x:q.x,y:q.y-20,vx:0,vy:0,ground:true,surface:s,inv:0,hurt:0,rolling:false,roll:false});keys.clear();
  activateWorldDevices();updateTraversalAnimation();const states=[];for(let n=0;n<12;n++){states.push(sonicPose().state);update();}
  record.push({device:device.id,states});
 }
 return record;
});assert.ok(launch[0].states.every(s=>s==='spring-launch'));assert.ok(launch[1].states.every(s=>s==='vent-launch'));results.push({launch});
// Actual game camera, real exposed roof and solid wall; no layout modifications.
for(const kind of ['balance','push','spring','vent']){
 const png=await page.evaluate(kind=>{
  selectAct(2);start();testControlled=true;p.inv=0;keys.clear();boss=null;ending=null;
  if(kind==='balance'){
   for(const s of level.surfaces){if(s.grindable||Math.abs(pose(s).slope)>.01||!active(s))continue;Object.assign(p,{x:pose(s).x2-3,y:pose(s).y2-20,vx:0,vy:0,surface:s,ground:true,poseLandingFrame:-100});if(traversalGroundState()==='balance-forward')break;}
   updateTraversalAnimation();runFrames+=15;
  }else if(kind==='push'){
   const h=level.hazards.find(h=>h.id==='teaching-glass'),s=topAt(h.x-14,h.floor-2).s;Object.assign(p,{x:h.x-14,y:yOn(s,h.x-14)-20,vx:0,vy:0,surface:s,ground:true,poseLandingFrame:-100});keys.add('ArrowRight');updateTraversalAnimation();runFrames+=12;
  }else{
   const d=kind==='spring'?level.springs.find(s=>s.id==='vent-lower-spring'):level.pads.find(s=>s.cityVent);p.x=d.x;p.y=d.y-20;p.vx=0;launchAirDevice(d);for(let n=0;n<9;n++)update();
  }
  cam=Math.max(0,p.x-420);camY=p.y-300;zoom=1;draw();return canvas.toDataURL();
 },kind);save(`game-${kind}.png`,png);
}
// Preview all authored cycles at 2x gameplay scale with the current renderer.
const count=process.env.TRAVERSAL_VIDEO==='1'?240:1;
for(let f=0;f<count;f++){
 const png=await page.evaluate(f=>{
  testControlled=true;ctx.save();ctx.setTransform(1,0,0,1,0,0);ctx.fillStyle='#151027';ctx.fillRect(0,0,canvas.width,canvas.height);
  const scenes=[['Forward ledge','traversalActing',0,8,5],['Backward ledge','traversalActing',8,8,5],['Pushing','traversalActing',16,8,4],['Spring launch','traversalLaunch',0,8,3],['Vent launch','traversalLaunch',8,8,3],['Spiral grind — reserved','traversalLaunch',16,16,3]];
  scenes.forEach(([label,sheet,start,frames,hold],i)=>{
   const x=i%3*640,y=Math.floor(i/3)*540,frame=start+Math.floor(f*2/hold)%frames;
   ctx.setTransform(1,0,0,1,0,0);ctx.fillStyle='#fff';ctx.font='26px sans-serif';ctx.fillText(label,x+36,y+54);ctx.fillStyle='#9ab2cf';ctx.font='20px sans-serif';ctx.fillText(`${frames} distinct poses · 2× gameplay size`,x+36,y+88);
   ctx.setTransform(4,0,0,4,x+320,y+320);drawRecoveredSonicFrame({sheet,frame,pivotY:i>=4?0:20});
   // A normal-size sample confirms the artwork also reads without enlarging it.
   ctx.setTransform(2,0,0,2,x+545,y+430);drawRecoveredSonicFrame({sheet,frame,pivotY:i>=4?0:20});
  });ctx.restore();return canvas.toDataURL();
 },f);save(count===1?'cycles.png':`frame-${String(f).padStart(4,'0')}.png`,png);
}
// Warm-cache render cost: isolate character drawing from the unchanged game world.
const perf=await page.evaluate(()=>{
 const cases=[['recoveredSpeedster',16],['traversalActing',24],['traversalLaunch',32]],samples=[];
 for(const [sheet,count]of cases){for(let i=0;i<count;i++)drawRecoveredSonicFrame({sheet,frame:i,pivotY:0});const times=[];
  for(let j=0;j<120;j++){const t=performance.now();for(let i=0;i<50;i++)drawRecoveredSonicFrame({sheet,frame:i%count,pivotY:0});times.push((performance.now()-t)/50);}
  times.sort((a,b)=>a-b);samples.push({sheet,medianMs:times[60],p95Ms:times[114]});
 }return samples;
});assert.deepEqual(errors,[]);fs.writeFileSync(path.join(out,'results.json'),JSON.stringify({results,perf,errors,previewFrames:count},null,2));console.log(JSON.stringify({results,perf,errors,output:out},null,2));
}finally{await browser.close();}})().catch(e=>{console.error(e);process.exitCode=1});
