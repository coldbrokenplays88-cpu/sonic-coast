/* Deterministic boss choreography and shared collision geometry, at 60 Hz. */
(function(root){
 'use strict';
 const clamp=(v,a,z)=>Math.max(a,Math.min(z,v)),ease=t=>{t=clamp(t,0,1);return t*t*(3-2*t)},mix=(a,z,t)=>a+(z-a)*ease(t);
 const durations={entrance:240,idle:65,'tail-windup':65,'tail-strike':24,'tail-retract':45,'bite-windup':55,'bite-lunge':24,'bite-hold':22,'bite-open':100,'bite-retract':42,hit:55,'laser-windup':70,'laser-fire':32,'laser-cool':45,destroyed:150};
 function createEggScorpion(arena){return {arena:{...arena},x:arena.x+1170,y:arena.y,state:'entrance',age:0,hits:0,shattered:[false,false],bites:0,laserMode:false,anchored:false,target:null,beam:null,event:'',sequence:0};}
 function enter(b,state,p){b.state=state;b.age=0;b.sequence++;b.event=state;b.beam=null;
  if(state==='tail-windup'||state==='laser-windup')b.target={x:clamp(p.x,b.arena.x+260,b.x-115),y:b.y-20};
  if(state==='bite-windup'){b.biteX=clamp(p.x+90,b.arena.x+650,b.x-170);b.bites++;}
  if(state==='laser-fire'){const g=scorpionGeometry(b),a={...g.tip},dx=b.target.x-a.x,dy=b.target.y-a.y,t=(b.y+25-a.y)/dy;b.beam={a,z:{x:a.x+dx*t,y:b.y+25}};}
 }
 function tickEggScorpion(b,p){b.event='';if(b.state==='defeated')return b;b.age++;
  if(b.age<(durations[b.state]||1))return b;
  const next={entrance:'idle',idle:b.laserMode?'laser-windup':'tail-windup','tail-windup':'tail-strike','tail-strike':'tail-retract','tail-retract':'bite-windup','bite-windup':'bite-lunge','bite-lunge':'bite-hold','bite-hold':'bite-open','bite-open':'bite-retract','bite-retract':'idle',hit:'idle','laser-windup':'laser-fire','laser-fire':'laser-cool','laser-cool':'bite-windup',destroyed:'defeated'}[b.state]||'idle';
  if(b.state==='entrance')b.anchored=true;enter(b,next,p);return b;
 }
 function scorpionGeometry(b){
  const a=b.age,s=b.state,entry=s==='entrance'?1-ease((a-30)/160):0,offset=entry*360;
  let head={x:b.x-50,y:b.y-210+offset},tail={x:b.x+30,y:b.y-365+offset};
  if(s==='entrance'){head.y=a<105?mix(b.y+100,b.y-90,(a-25)/80):mix(b.y-90,b.y-210,(a-105)/85);tail.y=mix(b.y+250,b.y-365,(a-145)/80);}
  const low={x:b.biteX??b.x-260,y:b.y-90};
  if(s==='bite-windup'){head.x+=mix(0,35,a/55);head.y-=mix(0,20,a/55);}
  if(s==='bite-lunge'){head={x:mix(b.x-15,low.x,a/24),y:mix(b.y-230,low.y,a/24)};}
  if(['bite-hold','bite-open','hit'].includes(s))head={...low};
  if(s==='bite-retract')head={x:mix(low.x,b.x-50,a/42),y:mix(low.y,b.y-210,a/42)};
  if(s==='tail-windup')tail={x:mix(b.x+30,b.target.x,a/65),y:b.y-365-Math.sin(Math.min(1,a/65)*Math.PI)*35};
  if(s==='tail-strike')tail={x:b.target.x,y:mix(b.y-365,b.y-8,a/9)};
  if(s==='tail-retract')tail={x:mix(b.target.x,b.x+30,a/45),y:mix(b.y-8,b.y-365,a/45)};
  if(['laser-windup','laser-fire','laser-cool'].includes(s))tail={x:b.x-15,y:b.y-340};
  const lowering=['bite-lunge','bite-hold','bite-open','bite-retract','hit'].includes(s),bodyShift=lowering?(head.x-(b.x-50))*.65:0,bodyDrop=lowering?(head.y-(b.y-210))*.3:0;
  return {body:{x:b.x+30+bodyShift,y:s==='entrance'?mix(b.y+230,b.y-130,(a-85)/110):b.y-130+bodyDrop},head,eyes:[{x:head.x-37,y:head.y},{x:head.x+13,y:head.y}],tip:tail,claws:[{x:b.x-155,y:s==='entrance'?mix(b.y+110,b.y-36,(a-65)/90):b.y-36},{x:b.x+155,y:s==='entrance'?mix(b.y+110,b.y-36,(a-65)/90):b.y-36}],reveal:1-entry};
 }
 function damageEggScorpion(b,p){if(b.state!=='bite-open'||p.ground||!p.jumpAttack||p.hurt>0)return false;
  const g=scorpionGeometry(b),eye=g.eyes.findIndex((e,i)=>(b.hits>=2||!b.shattered[i])&&Math.abs(p.x-e.x)<34&&Math.abs(p.y-e.y)<34);if(eye<0)return false;
  if(b.hits<2)b.shattered[eye]=true;b.hits++;b.laserMode=b.hits>=2;enter(b,b.hits>=3?'destroyed':'hit',p);return true;
 }
 function segmentDistance(p,a,z){const dx=z.x-a.x,dy=z.y-a.y,t=clamp(((p.x-a.x)*dx+(p.y-a.y)*dy)/(dx*dx+dy*dy||1),0,1);return Math.hypot(p.x-a.x-dx*t,p.y-a.y-dy*t);}
 function scorpionDanger(b,p){const g=scorpionGeometry(b);
  if(b.state==='tail-strike'&&b.age>=7&&Math.abs(p.x-b.target.x)<36&&p.y+20>=g.tip.y-20)return true;
  if(['bite-lunge','bite-hold'].includes(b.state)&&Math.abs(p.x-g.head.x)<125&&Math.abs(p.y-(g.head.y+35))<50)return true;
  if(b.state==='laser-fire'&&b.beam&&(segmentDistance(p,b.beam.a,b.beam.z)<24||segmentDistance({x:p.x,y:p.y+15},b.beam.a,b.beam.z)<20))return true;
  if(!['entrance','hit','destroyed','defeated'].includes(b.state)){if(Math.abs(p.x-g.body.x)<90&&p.y+20>g.body.y-80&&p.y<b.y)return true;if(g.claws.some(c=>Math.abs(p.x-c.x)<32&&Math.abs(p.y-c.y)<65))return true;}
  return false;
 }
 const api={createEggScorpion,tickEggScorpion,scorpionGeometry,damageEggScorpion,scorpionDanger};
 if(typeof module!=='undefined'&&module.exports)module.exports=api;else Object.assign(root,api);
})(typeof window!=='undefined'?window:globalThis);
