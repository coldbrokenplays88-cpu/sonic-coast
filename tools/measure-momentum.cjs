// Repeatable measurements of the actual controller on declared constant grades.
// No copied force equations, level edits, benchmark respawns or wall-clock timing.
const fs=require('node:fs'),path=require('node:path');
function groundProbe(spec={}){
 const angle=(spec.angle||0)*Math.PI/180;
 const sample=(_scenario,x)=>({x,y:400+x*Math.tan(angle),angle,tx:Math.cos(angle),ty:Math.sin(angle),nx:Math.sin(angle),ny:-Math.cos(angle),curvature:0});
 const q=createGroundPlayer('flat',0,spec.speed||0,spec.posture||'standing');
 let peak=Math.abs(q.speed),ticks=0;
 for(;ticks<(spec.ticks??600);){
  const controls=beginGroundTick(q,spec.input||{});
  if(spec.physics)controls.physics={...groundTuning,...spec.physics};
  for(let i=0;i<groundTuning.substeps;i++)advanceGroundSubstep(q,controls,1/groundTuning.substeps,sample);
  finishGroundTick(q,controls,sample,true,()=>Infinity);ticks++;peak=Math.max(peak,Math.abs(q.speed));
  if(spec.stopAtRest&&Math.abs(q.speed)<1e-8)break;
  if(spec.stopUphill&&q.speed<=0)break;
  if(spec.target!==undefined&&q.speed*(spec.input?.direction||1)>=spec.target-1e-8)break;
 }
 return {speed:q.speed,x:q.x,peak,ticks,posture:q.posture};
}
function measurementSuite(){
 const rows=[];
 for(const target of [3,10,13.9])rows.push({test:`Flat acceleration to ${target}`,value:groundProbe({input:{direction:1},target}).ticks,unit:'ticks'});
 for(const speed of [8,14,23])rows.push({test:`Coast to rest from ${speed}`,value:groundProbe({speed,stopAtRest:true}).ticks,unit:'ticks'});
 for(const angle of [10,20,30,45]){
  const q=groundProbe({angle,ticks:300});
  rows.push({test:`Idle ${angle}° / 300 ticks: speed`,value:q.speed,unit:'speed'});
  rows.push({test:`Idle ${angle}° / 300 ticks: travel`,value:q.x,unit:'pixels'});
 }
 for(const angle of [20,30,45])rows.push({test:`Roll downhill ${angle}° / 600 ticks: peak`,value:groundProbe({angle,speed:8,posture:'rolling',ticks:600}).peak,unit:'speed'});
 for(const direction of [1,-1]){
  const q=createMotionPlayer('flat');q.mode='airborne';q.surface=null;q.air={vx:direction===1?5:10,vy:0};
  const initial=q.air.vx;
  for(let i=0;i<30;i++){const f=motionAirForces(q,direction,direction<0,1);q.air.vx+=f.ax;q.air.vy+=f.ay;}
  rows.push({test:`Air 30 ticks: ${direction===1?'forward gain':'countersteer reduction'}`,value:Math.abs(q.air.vx-initial),unit:'speed'});
 }
 rows.push({test:'Brake from 14',value:groundProbe({speed:14,input:{direction:-1},stopAtRest:true}).ticks,unit:'ticks'});
 rows.push({test:'Reverse 14 to -13.9',value:groundProbe({speed:14,input:{direction:-1},target:13.9}).ticks,unit:'ticks'});
 rows.push({test:'Roll uphill 30° from 19 to rest',value:groundProbe({angle:-30,speed:19,posture:'rolling',stopUphill:true}).ticks,unit:'ticks'});
 const jump=createMotionPlayer('flat');let apex=400,airtime=0;
 stepMotionPlayer(jump,{jumpPressed:true,jumpHeld:true});
 do {const c=motionContact(jump);apex=Math.min(apex,c.center.y+c.height/2);airtime++;stepMotionPlayer(jump,{jumpHeld:true})}while(jump.mode!=='grounded'&&airtime<150);
 rows.push({test:'Held jump height',value:400-apex,unit:'pixels'});
 rows.push({test:'Held jump airtime',value:airtime,unit:'ticks'});
 return rows;
}
function measure(){
 const cwd=process.cwd();
 try{process.chdir(path.resolve(__dirname,'../Inferno-Ascent-Game'));const a=require('../Inferno-Ascent-Game/test-support.cjs').boot();
 a.run('var groundProbe='+groundProbe.toString());return JSON.parse(a.run('JSON.stringify(('+measurementSuite.toString()+')())'));
 }finally{process.chdir(cwd)}
}
function table(rows,before){
 const fmt=x=>Number.isInteger(x)?String(x):x.toFixed(6).replace(/0+$/,'').replace(/\.$/,'');
 return ['| Measurement | '+(before?'Before | After':'Value')+' | Units |','|---|'+(before?'---:|---:':'---:')+'|---|',...rows.map((r,i)=>`| ${r.test} | ${before?fmt(before[i].value)+' | ':''}${fmt(r.value)} | ${r.unit} |`)].join('\n');
}
module.exports={groundProbe,measure,table};
if(require.main===module){const rows=measure(),args=process.argv.slice(2);const save=args.indexOf('--save'),compare=args.indexOf('--compare');if(save>=0)fs.writeFileSync(args[save+1],JSON.stringify(rows,null,2)+'\n');console.log(table(rows,compare>=0?JSON.parse(fs.readFileSync(args[compare+1],'utf8')):null))}
