'use strict';
function freeRailBoost(){return !!(p.ground&&p.surface?.grindable&&p.surface.infiniteBoost)}
function updateBoostState(want){
 if(!want)p.boostLocked=false;
 const free=freeRailBoost();
 p.boosting=!!(want&&(free||boost>0&&!p.boostLocked)&&!charge&&!p.hurt);
 if(p.boosting&&!free){boost=Math.max(0,boost-.5);if(!boost)p.boostLocked=true}
 return p.boosting;
}
function measurementSpeed(){if(p.loop)return Math.abs(p.loop.speed);if(p.ground&&p.surface)return Math.abs(p.vx)*Math.hypot(1,pose(p.surface).slope);return Math.hypot(p.vx,p.vy)}
function configureBoostMonitors(l){
 l.monitors??=[];l.surfaceIndex=new Map(l.surfaces.map(s=>[s.id,s]));
 if(l.act!==2){l.buildings??=[];for(const s of l.surfaces){s.cityType=s.y1!==s.y2?'concrete-ramp':s.kind==='main'?'rooftop':s.kind==='moving'?'freight-lift':s.kind==='crumble'?'broken-bridge':'fire-escape';if(s.kind==='main'){s.roof=true;l.buildings.push({x:s.x1,y:Math.min(s.y1,s.y2)+26,w:s.x2-s.x1,h:1000,seed:Math.floor(s.x1/1800),roofId:s.id})}}}
 const add=(id,s,x,required=false)=>{if(!s||l.monitors.some(m=>m.id===id))return;l.monitors.push({id,x,y:s.y1+(x-s.x1)*(s.y2-s.y1)/(s.x2-s.x1),surfaceId:s.id,broken:false,required})};
 // Required pickups are on safe approach decks, before a mandatory wall or boost launch.
 for(const h of l.hazards.filter(h=>h.type==='breakable'&&!h.secret)){
  const s=l.surfaces.filter(s=>!s.sealedBy&&s.x1<h.x&&s.x2>=h.x-500&&Math.abs((s.y1+s.y2)/2-h.floor)<200).sort((a,b)=>b.x2-a.x2)[0];
  if(s)add('boost-before-'+h.id,s,Math.max(s.x1+45,Math.min(s.x2-60,h.x-240)),true);
 }
 for(const s of l.surfaces.filter(s=>s.routeType==='boost'&&s.entrySpeed)){
  const approach=l.surfaces.filter(a=>!a.sealedBy&&a.kind==='main'&&a.x1<s.x1&&a.x2>=s.x1-700&&Math.abs(a.y2-s.y1)<400).sort((a,b)=>b.x2-a.x2)[0];
  if(approach)add('boost-route-'+s.id,approach,Math.max(approach.x1+55,Math.min(approach.x2-60,s.x1-200)),true);
 }
 // Any grind route marked as a true boost express is an explicit skip rail.
 for(const s of l.surfaces)if(s.grindable&&s.routeType==='boost')s.infiniteBoost=true;
 return l;
}
function surfaceById(id){return level.surfaceIndex?.get(id)||level.surfaces.find(s=>s.id===id)}
function monitorPose(m){const s=m.surfaceId&&surfaceById(m.surfaceId);if(!s)return m;const q=pose(s);return {...m,x:m.x+q.x1-s.x1,y:yOn(s,m.x+q.x1-s.x1)}}
function collectBoostMonitors(){for(const m of level.monitors||[]){if(m.broken)continue;const q=monitorPose(m);if(Math.abs(p.x-q.x)>34||feet()<q.y-58||feet()-bodyHeight()>q.y)continue;
 const attacking=p.boosting||p.rolling&&Math.abs(p.vx)>2||!p.ground&&p.jumpAttack;
 if(!attacking)continue;
 m.broken=true;m.brokenAt=runFrames;boost=BOOST_MAX;p.boostLocked=false;score+=100;stats.monitors=(stats.monitors||0)+1;sparks(q.x,q.y-28,12,'#9deaff');
 if(typeof gameSound==='function')gameSound('monitor');
}}
function resetBoostMonitors(){for(const m of level.monitors||[])m.broken=false}
function airDevicePose(d){const s=d.surfaceId&&surfaceById(d.surfaceId);if(!s)return d;const q=pose(s);return {...d,x:d.x+q.x1-s.x1,y:yOn(s,d.x+q.x1-s.x1)}}
