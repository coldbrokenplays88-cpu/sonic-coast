// Normal button steering; never change player position after the initial setup.
const aimHighSource=`function aimHigh(capAtEntry=false){keys.clear();const launched=level.springs.filter(d=>d.id.startsWith('mid-')&&d.firedAt!==undefined).sort((a,b)=>b.firedAt-a.firedAt)[0];
 const target=surfaceById(launched?.targetId??'mid-upper-choice');if(!target)return;
 if(!launched&&(p.act1Motion?.pendingJump||(!p.ground&&p.act1Motion?.air?.cutEligible)))keys.add('Space');
 if(p.ground){const d=level.springs.find(d=>d.surfaceId===p.surface.id);if(d){const x=airDevicePose(d).x;if(Math.abs(x-p.x)>8)keys.add(x>p.x?'ArrowRight':'ArrowLeft');else press('Space',true)}return}
 const spring=(launched||capAtEntry)?level.springs.find(d=>d.surfaceId===target.id):null,face=spring?springFace(spring):null;
 const gravity=p.act1Motion?.act===selectedAct? .35 : .58;
 const targetY=face?face.y:target.y1,c=feet()-targetY,dis=p.vy*p.vy-2*gravity*c;
 let t=dis>=0?(-p.vy+Math.sqrt(dis))/gravity:25;t=Math.max(1,t);
 const radius=0;

 const q=pose(target,runFrames+t),future=spring?springFace(spring,runFrames+t):null;let x=future?future.x+future.nx*radius:target.grindable?q.x1+80:(q.x1+q.x2)/2;
 // Wait on the upright lower spring when the hoist is too far left for the rail transfer.
 if(target.id==='mid-moving-spring-hoist'){
  const lower=level.springs.find(d=>d.id==='mid-left-spring');
  if(aimHigh.flight!==launched.firedAt){
   aimHigh.flight=launched.firedAt;
   const top=feet()-bodyHeight(),height=top-target.y1,root=p.vy*p.vy-2*gravity*height;
   const up=root>=0?Math.max(0,(-p.vy-Math.sqrt(root))/gravity):0;
   const obstacle=springFace(spring,runFrames+up),aim=p.x+p.vx*up+Math.sign(x-p.x)*.08*up*up;
   aimHigh.wait=x<lower.x-60||Math.abs(obstacle.x-aim)<48;
  }
  if(aimHigh.wait)x=lower.x;
 }
 const error=x-p.x,brake=.2,stopping=p.vx*p.vx/(2*brake);
 // Arrive with a controlled horizontal velocity; a standard spring does not
 // secretly zero it before the next alternating transfer.
 const steer=error*p.vx<0?Math.sign(error):Math.abs(error)<stopping+3?-Math.sign(p.vx):Math.abs(error)>3?Math.sign(error):0;
 if(steer)keys.add(steer>0?'ArrowRight':'ArrowLeft');
}`;
const clearGuardSource=`function clearGuard(){const e=enemies.find(e=>e.id==='mid-low-guard');for(let i=0;i<240;i++){keys.clear();if(!e.alive&&p.ground){release('Space',true);return}if(p.ground){if(Math.abs(p.vx)>1)keys.add(p.vx>0?'ArrowLeft':'ArrowRight');else press('Space',true)}else{if(p.vy<0)keys.add('Space');const error=e.x-p.x,stopping=p.vx*p.vx/.4;const steer=error*p.vx<0?Math.sign(error):Math.abs(error)<stopping+3?-Math.sign(p.vx):Math.abs(error)>3?Math.sign(error):0;if(steer)keys.add(steer>0?'ArrowRight':'ArrowLeft')}update()}throw Error('guard');}clearGuard();`;
const transferSource=`function transferTo(id,vertical=false){const target=surfaceById(id);for(let f=0;f<240;f++){
 keys.delete('ArrowLeft');keys.delete('ArrowRight');
 if(level.springs.some(d=>d.surfaceId===id&&d.firedAt===runFrames)){release('Space',true);return f}
 if(p.ground&&p.surface.id===id){release('Space',true);return f}
 if(stats.deaths)throw Error('Death before '+id);
 if(p.ground){release('Space',true);const s=p.surface,dir=target.x1+target.x2>s.x1+s.x2?1:-1,edge=vertical?p.x:dir>0?s.x2-12:s.x1+12;
 const joined=dir>0?Math.abs(s.x2-target.x1)<2&&Math.abs(s.y2-target.y1)<2:Math.abs(s.x1-target.x2)<2&&Math.abs(s.y1-target.y2)<2;
 if(joined&&Math.abs(p.vx)<3&&Math.abs(pose(s).slope)>.5){
  press('ArrowDown',true);press('Space',true);for(let n=0;n<30;n++)update();release('Space',true);release('ArrowDown',true);
 }else if(joined)keys.add(dir>0?'ArrowRight':'ArrowLeft');
 else if(vertical||dir*(edge-p.x)<4){press('Space',true);if(!vertical)keys.add(dir>0?'ArrowRight':'ArrowLeft')}
 else {const speed=p.vx*dir;if(speed<6.8)keys.add(dir>0?'ArrowRight':'ArrowLeft');else if(speed>7.4)keys.add(dir>0?'ArrowLeft':'ArrowRight')}
 }else{if(feet()<target.y1&&p.vy< -5&&target.y1>feet()+110&&Math.abs((target.x1+target.x2)/2-p.x)<180)release('Space',true);
 const landingX=target.id==='mid-right-guard-roof'?target.x1+40:(target.x1+target.x2)/2;
 const error=landingX-p.x,stopping=p.vx*p.vx/.4;
 const dir=error*p.vx<0?Math.sign(error):Math.abs(error)<stopping+3?-Math.sign(p.vx):Math.abs(error)>3?Math.sign(error):0;
 if(dir)keys.add(dir>0?'ArrowRight':'ArrowLeft')}
 update();
 }throw Error('Unreachable '+id+' from '+p.surface?.id);
}`;
module.exports={aimHighSource,clearGuardSource,transferSource};
