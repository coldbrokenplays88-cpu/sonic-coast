'use strict';
// Shared surface queries and contact resolution; no stage initialization here.

function pose(s,t=runFrames){let dx=0,dy=0;if(s.motion){const n=Math.sin(t/s.motion.period*Math.PI*2+s.motion.phase)*s.motion.amp;if(s.motion.axis==='x')dx=n;else dy=n}return {x1:s.x1+dx,x2:s.x2+dx,y1:s.y1+dy,y2:s.y2+dy,slope:(s.y2-s.y1)/(s.x2-s.x1)}}

function yOn(s,x,t=runFrames){const q=pose(s,t);return q.y1+(x-q.x1)*q.slope}

function active(s){return (!s.sealedBy||level.hazards.find(h=>h.id===s.sealedBy)?.broken)&&(!s.restoreAt||runFrames>=s.restoreAt)}

function topAt(x,below=-Infinity){let result=null;for(const s of level.surfaces){const q=pose(s);if(active(s)&&x>=q.x1&&x<=q.x2){const y=yOn(s,x);if(y>=below&&(!result||y<result.y))result={s,y}}}return result}

function bodyHeight(){return p.ground&&p.roll?26:!p.ground?38:48}

function feet(){return p.y+20}

function resetPlatforms(){for(const s of level.surfaces){s.crumbleTimer=-1;s.restoreAt=0}}

function land(s,y){p.scriptedLaunch=false;p.airBoostUsed=false;p.airBoostFrames=0;p.airBoostActive=false;beforeStageLanding(s);if(s.grindable&&p.surface!==s){p.grindEntryFrame=runFrames;p.grindFromFast=p.boosting||Math.abs(p.vx)>17;p.grindFast=Math.abs(p.vx)>18||p.boosting;p.rolling=false;p.roll=false;p.brakeActive=false;p.stopFrame=-100;charge=0}else if(p.surface?.grindable&&!s.grindable){p.grindExitFrame=runFrames;}if(!p.ground){p.poseLandingFrame=runFrames;gameSound(s.grindable?'grind':'land',{speed:Math.abs(p.vx),volume:.7})}p.landFrame=runFrames;p.landKind=s.kind;const changed=p.surface!==s||!p.ground;p.y=y-20;p.vy=0;p.ground=true;p.jumpAttack=false;p.airSpeedLimit=null;p.surface=s;afterStageLanding(s);if(changed&&!visited.has(s.id)){visited.add(s.id);if(s.kind==='express'){stats.expressLandings++;score+=400;sparks(p.x,p.y+20,5,'#ffdf72')}if(s.kind==='recovery'||s.kind==='lower')stats.recoveries++}if(s.kind==='crumble'&&s.crumbleTimer<0)s.crumbleTimer=s.crumbleDelay;for(const group of level.collapseGroups||[])if(group.entryId===s.id&&!group.triggered){group.triggered=true;for(const id of group.tailIds){const tail=level.surfaces.find(v=>v.id===id);if(tail)tail.crumbleTimer=group.delay}}if(!reboundBubbleShield()&&changed&&jumpBuffer>0)jump()}

function canStand(){const foot=feet();return !level.hazards.some(h=>h.type==='gate'&&p.x+13>h.x&&p.x-13<h.x+h.w&&foot>h.y&&foot-48<h.y+h.h)}

function resolveHazards(oldX,oldY){for(const h of level.hazards){if(h.broken)continue;if(p.x+13<h.x||p.x-13>h.x+h.w)continue;const foot=feet(),height=bodyHeight(),top=foot-height;if(foot<=h.y||top>=h.y+h.h)continue;if(h.type==='breakable'&&(p.boosting||!h.boostOnly&&Math.abs(p.vx)>=h.threshold)){h.broken=true;gameSound('hazard');score+=350;stats.barriers=(stats.barriers||0)+1;sparks(h.x,h.floor-40,18,'#ffcc70');continue}if(h.type==='spikes'){hurt(h.x+h.w/2);continue}
 // Gantries remain solid during damage immunity. A correct roll keeps every bit of speed.
 const previousTop=oldY+20-height;if(oldY+20<=h.y&&p.vy>=0){p.y=h.y-20;p.vy=0;p.ground=false;reboundBubbleShield()}
 else if(previousTop>=h.y+h.h&&p.vy<0){p.y=h.y+h.h+height-20;p.vy=1}
 else{const fromLeft=oldX<h.x+h.w/2;p.x=fromLeft?h.x-14:h.x+h.w+14;p.vx=0;p.boosting=false}
}}

// Surface carry and gravity/contact integration run at distinct movement phases.
function applySurfaceMotion(){
 if(p.ground&&p.surface){const slope=pose(p.surface).slope;if(!p.surface.grindable&&Math.abs(p.vx)>1)p.vx+=slope*(p.rolling?.65:p.surface.boostExit?.08:.28);const prev=pose(p.surface,runFrames-1),now=pose(p.surface);p.x+=now.x1-prev.x1;p.y+=now.y1-prev.y1}
}

function moveAndResolveSurfaces(){
 const oldX=p.x,oldY=p.y,oldFoot=feet(),oldSurface=p.surface,wasGround=p.ground;p.lastX=oldX;p.lastY=oldY;p.x=Math.max(24,Math.min(END+250,p.x+p.vx));
 // Follow connected slopes without launching or snapping across a void.
 if(wasGround&&oldSurface&&active(oldSurface)){const q=pose(oldSurface);if(p.x>=q.x1-FOOT_RADIUS&&p.x<=q.x2+FOOT_RADIUS){p.y=yOn(oldSurface,Math.max(q.x1,Math.min(q.x2,p.x)))-20;p.vy=0}else{let join=null;for(const s of level.surfaces){const z=pose(s),y=yOn(s,p.x);const seam=p.vx>=0?q.x2:q.x1,edgeY=p.vx>=0?q.y2:q.y1,connected=seam>=z.x1-2&&seam<=z.x2+2&&Math.abs(yOn(s,seam)-edgeY)<2;if(active(s)&&p.x>=z.x1&&p.x<=z.x2&&(Math.abs(y-oldFoot)<11||connected)){join={s,y};break}}if(join)land(join.s,join.y);else{p.ground=false;p.surface=null;p.vy=Math.min(0,q.slope*p.vx)}}}else{p.ground=false;p.surface=null}
 if(!p.ground){p.vy=p.airBoostActive?0:Math.min(20,p.vy+.58*(p.underwater?2/7:1));p.y+=p.vy;let hit=null;
  for(const s of level.surfaces){if(p.wrongRouteDrop&&!s.fallen)continue;if(!active(s)||(s.entrySpeed&&!s.solidAtAnySpeed&&Math.abs(p.vx)<s.entrySpeed))continue;const q=pose(s),oldQ=pose(s,runFrames-1);
   const oldFloor=oldQ.y1+(oldX-oldQ.x1)*oldQ.slope,newFloor=yOn(s,p.x),d0=oldFoot-oldFloor,d1=feet()-newFloor;
   if(d0>5||d1<0||d1-d0<=0)continue;const t=Math.max(0,-d0/(d1-d0)),crossX=oldX+(p.x-oldX)*t;
   const left=oldQ.x1+(q.x1-oldQ.x1)*t,right=oldQ.x2+(q.x2-oldQ.x2)*t;
   if(t<=1&&crossX>=left-FOOT_RADIUS&&crossX<=right+FOOT_RADIUS&&(!hit||t<hit.t))hit={s,q,t};}
  if(hit){const x=Math.max(hit.q.x1,Math.min(hit.q.x2,p.x));land(hit.s,yOn(hit.s,x));
   if(p.ground&&(p.x<hit.q.x1-FOOT_RADIUS||p.x>hit.q.x2+FOOT_RADIUS)){p.ground=false;p.surface=null;p.vy=Math.min(0,hit.q.slope*p.vx);coyote=tuning.coyote}
   if(p.ground&&p.rollBuffer>0&&!p.rollSpent){p.rolling=true;p.rollAge=0;p.lowRollFrames=0;p.rollBuffer=0;stats.rolls++}}}
 p.roll=p.rolling||charge>0||!p.ground;
}
