// Normal button steering; never change player position after the initial setup.
const aimHighSource=`function aimHigh(){keys.clear();const launched=level.springs.filter(d=>d.id.startsWith('mid-')&&d.firedAt!==undefined).sort((a,b)=>b.firedAt-a.firedAt)[0];
 const target=surfaceById(launched?.targetId??'mid-upper-choice');if(!target)return;
 if(p.ground){const d=level.springs.find(d=>d.surfaceId===p.surface.id);if(d){const x=airDevicePose(d).x;if(Math.abs(x-p.x)>8)keys.add(x>p.x?'ArrowRight':'ArrowLeft')}return}
 const b=p.vy+.29,c=feet()-target.y1,dis=b*b-1.16*c;let t=dis>=0?(-b+Math.sqrt(dis))/.58:25;t=Math.max(1,t);
 const q=pose(target,runFrames+t),x=(q.x1+q.x2)/2,error=x-(p.x+p.vx*t);
 if(Math.abs(error)>7)keys.add(error>0?'ArrowRight':'ArrowLeft');
}`;
const clearGuardSource=`function clearGuard(){const e=enemies.find(e=>e.id==='mid-low-guard');for(let i=0;i<240;i++){keys.clear();if(!e.alive&&p.ground){release('Space',true);return}if(p.ground){if(Math.abs(p.vx)>1)keys.add(p.vx>0?'ArrowLeft':'ArrowRight');else press('Space',true)}else{const error=e.x-p.x;if(Math.abs(error)>12)keys.add(error>0?'ArrowRight':'ArrowLeft');else if(Math.abs(p.vx)>.3)keys.add(p.vx>0?'ArrowLeft':'ArrowRight')}update()}throw Error('guard');}clearGuard();`;
const transferSource=`function transferTo(id,vertical=false){const target=surfaceById(id);for(let f=0;f<240;f++){
 keys.delete('ArrowLeft');keys.delete('ArrowRight');
 if(level.springs.some(d=>d.surfaceId===id&&d.firedAt===runFrames)){release('Space',true);return f}
 if(p.ground&&p.surface.id===id){release('Space',true);return f}
 if(stats.deaths)throw Error('Death before '+id);
 if(p.ground){release('Space',true);const s=p.surface,dir=target.x1+target.x2>s.x1+s.x2?1:-1,edge=vertical?p.x:dir>0?s.x2-45:s.x1+45;
 const joined=dir>0?Math.abs(s.x2-target.x1)<2&&Math.abs(s.y2-target.y1)<2:Math.abs(s.x1-target.x2)<2&&Math.abs(s.y1-target.y2)<2;
 if(joined)keys.add(dir>0?'ArrowRight':'ArrowLeft');
 else if(vertical||dir*(edge-p.x)<4){press('Space',true);if(!vertical)keys.add(dir>0?'ArrowRight':'ArrowLeft')}
 else {const speed=p.vx*dir;if(speed<6.8)keys.add(dir>0?'ArrowRight':'ArrowLeft');else if(speed>7.4)keys.add(dir>0?'ArrowLeft':'ArrowRight')}
 }else{if(feet()<target.y1&&p.vy< -5&&target.y1>feet()+110&&Math.abs((target.x1+target.x2)/2-p.x)<180)release('Space',true);
 const error=(target.x1+target.x2)/2-p.x;if(Math.abs(error)>35)keys.add(error>0?'ArrowRight':'ArrowLeft');else if(Math.abs(p.vx)>2)keys.add(p.vx>0?'ArrowLeft':'ArrowRight')}
 update();
 }throw Error('Unreachable '+id+' from '+p.surface?.id);
}`;
module.exports={aimHighSource,clearGuardSource,transferSource};
