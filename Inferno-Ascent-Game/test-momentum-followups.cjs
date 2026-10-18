const {test}=require('node:test'),assert=require('node:assert/strict');
const {boot}=require('./test-support.cjs');
const {groundProbe}=require('../tools/measure-momentum.cjs');
function probe(spec){const a=boot();a.run('var groundProbe='+groundProbe.toString());return JSON.parse(a.run('JSON.stringify(groundProbe('+JSON.stringify(spec)+'))'))}

test('rolling slope force stays at or below32 on long downhill grades in both directions',()=>{
 for(const side of [-1,1])for(const angle of [20,30,45]){
  const r=probe({angle:side*angle,speed:side*8,posture:'rolling',ticks:600});
  assert.ok(r.peak<=32+1e-8,JSON.stringify({side,angle,...r}));
  assert.ok(Math.abs(r.speed)>31.9,'cap still allows sustained fast rolling');
 }
});
test('rolling cap preserves externally earned excess speed and does not alter ordinary running',()=>{
 const a=boot();a.run(`var q=createGroundPlayer('flat',0,50,'rolling');var controls=beginGroundTick(q,{});for(let i=0;i<4;i++)advanceGroundSubstep(q,controls,.25,(_s,x)=>({x,y:x,tx:Math.SQRT1_2,ty:Math.SQRT1_2}));`);
 assert.ok(a.run('q.speed')>49.9&&a.run('q.speed')<=50,'retain external speed, apply friction, add no downhill speed');
 for(const posture of ['standing','rolling']){
  const spec={angle:20,speed:8,posture,ticks:10,input:{direction:1}};
  assert.deepEqual(probe(spec),probe({...spec,physics:{rollSpeedCap:null}}),'below-cap behavior remains identical');
 }
});

test('idle standing grip holds exact contact through38 degrees and permits steeper sliding',()=>{
 for(const side of [-1,1]){
  for(const angle of [10,20,30,38])for(const speed of [0,side*.29]){
   const r=probe({angle:side*angle,speed,ticks:300});
   assert.equal(r.speed,0);assert.equal(r.x,0,`${side*angle}°`);
  }
  assert.ok(side*probe({angle:side*45,ticks:300}).speed>20,'45-degree floor still slides');
 }
});
test('standing grip does not change deliberate input or rolling rollback',()=>{
 for(const posture of ['standing','rolling'])for(const angle of [20,30]){
  const spec={angle,speed:0,posture,ticks:30,input:posture==='standing'?{direction:-1}:{}};
  assert.deepEqual(probe(spec),probe({...spec,physics:{standingGripSpeed:0}}));
 }
 assert.ok(probe({angle:30,posture:'rolling',ticks:30}).speed>0,'a stationary roll accelerates downhill');
 assert.deepEqual(probe({speed:.29,ticks:1}),probe({speed:.29,ticks:1,physics:{standingGripSpeed:0}}),'flat coasting remains unchanged');
});

test('air input gains4.8 or brakes6 over30 ticks in both actual acts',()=>{
 for(const act of [1,2])for(const direction of [-1,1]){
  const a=boot(act),initial=direction>0?5:10;
  a.run(`Object.assign(p,{x:300,y:-10000,vx:${initial},vy:0,ground:false,surface:null,rolling:false,roll:false,inv:9999});resetAct1Motion();press('${direction>0?'ArrowRight':'ArrowLeft'}',true);for(let i=0;i<30;i++)update()`);
  assert.ok(Math.abs(a.run('p.vx')-(direction>0?9.8:4))<1e-8,`act ${act}`);
  assert.ok(Math.abs(a.run('p.vy')-10.5)<1e-8,'unchanged gravity');
 }
});
test('air control preserves jump dimensions and coasting momentum',()=>{
 const {measure}=require('../tools/measure-momentum.cjs');
 const baseline=require('../docs/momentum-followups-before.json'),after=measure();
 for(const name of ['Held jump height','Held jump airtime'])assert.deepEqual(after.find(r=>r.test===name),baseline.find(r=>r.test===name));
 const a=boot();a.run(`var q=createMotionPlayer('flat');q.mode='airborne';q.y=-1000;q.air={vx:23,vy:0};for(let i=0;i<30;i++)stepMotionPlayer(q,{})`);
 assert.equal(a.run('q.air.vx'),23,'no automatic air friction');
 assert.equal(a.run('motionTuning.jumpImpulse'),10.5);assert.equal(a.run('motionTuning.cutRatio'),.4);assert.equal(a.run('motionTuning.airRange'),14);
});

test('standing braking stops14 in16 ticks and reverses within115 in both directions',()=>{
 for(const side of [-1,1]){
  assert.equal(probe({speed:side*14,input:{direction:-side},stopAtRest:true}).ticks,16);
  assert.ok(probe({speed:side*14,input:{direction:-side},target:13.9}).ticks<=115);
 }
});
test('stronger standing braking leaves constrained rolling braking unchanged',()=>{
 const a=boot();a.run(`var q=createGroundPlayer('flat',0,10,'rolling');var c=beginGroundTick(q,{direction:-1},true,false);for(let i=0;i<4;i++)advanceGroundSubstep(q,c,.25)`);
 assert.ok(Math.abs(a.run('q.speed')-9.795)<1e-8);
 assert.equal(a.run('groundTuning.rollBrake'),.18);
 assert.equal(a.run('groundTuning.acceleration'),.16);
});
