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
