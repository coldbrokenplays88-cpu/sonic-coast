'use strict';
// Shared player movement. State and the fixed-tick controller remain in game.js.

function jump(){
 p.scriptedLaunch=false;p.jumpAttack=true;if(p.surface?.grindable)p.grindExitFrame=runFrames;p.poseJumpFrame=runFrames;
 const surface=p.ground?p.surface:null,slope=surface?pose(surface).slope:0,norm=Math.hypot(1,slope),speed=p.vx*norm;
 const lift=p.jumpCut?6.8:13.4+Math.min(2.4,Math.max(0,Math.abs(speed)-14)*.25),impulse=lift*(p.underwater?7/13:1);
 // Keep the full surface/platform velocity; an upright jump adds vertical lift.
 const carry=surface?surfaceVelocity(surface):{x:0,y:0};
 const inherited=(surface?p.vx*slope:coyote>0?(p.coyoteLaunchVy??0):0)+carry.y;
 p.vy=inherited-impulse;p.vx+=carry.x;p.jumpReleaseVy=inherited-(p.underwater?2.5:5);
 p.ground=false;p.surface=null;coyote=0;jumpBuffer=0;stats.jumps++;gameSound('jump');
}

function updateRoll(down){
 if(!p.rolling)p.dashRolling=false;
 if(down&&!p.downHeld){p.rollBuffer=6;p.rollSpent=false}if(!down)p.rollSpent=false;p.downHeld=down;
 if(p.ground&&!p.surface?.grindable&&p.rollBuffer>0&&!p.rollSpent&&!p.rolling){p.rolling=true;p.rollAge=0;p.lowRollFrames=0;p.rollBuffer=0;stats.rolls++}
 if(p.rollBuffer>0)p.rollBuffer--;
 if(p.rolling){p.rollAge++;const rollSpeed=p.ground&&p.surface?Math.abs(p.vx)*Math.hypot(1,pose(p.surface).slope):Math.abs(p.vx);if(p.ground&&rollSpeed<7)p.lowRollFrames++;else if(rollSpeed>=7)p.lowRollFrames=0;
  const expired=p.lowRollFrames>=90;
  // Releasing Down launches Spin Dash; it must not discard that fast roll.
  // Other rolls retain their release behavior, including the pool's forced roll.
  if(((!down&&(!p.dashRolling||rollSpeed<7)&&p.rollAge>6)||expired)&&canStand()){p.rolling=false;p.dashRolling=false;if(expired)p.rollSpent=true}}
 p.roll=p.rolling||charge>0||!p.ground;
}

function updateMovement(){updateWaterState();if(updateStageMotion())return true;if(p.loop)return updateLoop();const waterScale=p.underwater?.5:1,runSpeed=14*waterScale,beforeSpeed=Math.abs(p.vx),recoveryGrip=p.ground&&['recovery','lower'].includes(p.surface?.kind);const down=keys.has('ArrowDown')||keys.has('KeyS');const dir=Number(keys.has('ArrowRight')||keys.has('KeyD'))-Number(keys.has('ArrowLeft')||keys.has('KeyA'));updateRoll(down);
 if(p.ground)coyote=tuning.coyote;else if(coyote>0)coyote--;
 if(jumpBuffer>0&&coyote>0&&!charge)jump();else if(jumpBuffer>0)jumpBuffer--;
 if(charge&&down&&JUMP_KEYS.some(k=>keys.has(k))){charge=Math.min(20,charge+.2);if(runFrames%10===0){sparks(p.x-15*p.face,p.y+18,3,'#69efff');if(typeof gameSound==='function')gameSound('spindashCharge',{charge:charge/20})}}
 if(charge&&!down){gameSound('spindashRelease',{charge:charge/20});p.vx=p.face*(12+charge*.7)/Math.hypot(1,p.surface?pose(p.surface).slope:0);charge=0;p.rolling=true;p.dashRolling=true;p.rollAge=0;p.lowRollFrames=0;sparks(p.x,p.y+15,10,'#4bd9ff')}
 const wantBoost=keys.has('ShiftLeft')||keys.has('ShiftRight')||keys.has('KeyX')||keys.has('MouseBoost');if(!wantBoost)p.boostLocked=false;
 updateBoostState(wantBoost);
 // Controls act on speed along the ground; vx stays world-horizontal outside this block.
 const controlSurface=p.ground&&!p.surface?.grindable?p.surface:null,controlSlope=controlSurface?pose(controlSurface).slope:0,controlNorm=Math.hypot(1,controlSlope);
 if(controlSurface)p.vx*=controlNorm;
 // Classic Sonic loses uphill traction above 45 degrees at low ground speed.
 // Our one-way slope contacts slide back instead of imposing a forced input lock.
 const uphillTractionLost=controlSurface&&!p.scriptedLaunch&&!p.wrongRouteDrop&&!p.surface?.boostExit&&dir*controlSlope<0&&Math.abs(controlSlope)>=1&&Math.abs(p.vx)<runSpeed*(2.5/6);
 if(p.boosting){if(dir&&Math.sign(p.vx)===dir)p.face=dir;if(p.vx*p.face<23)p.vx+=(p.face*23-p.vx)*.14;if(runFrames%3===0)particles.push({x:p.x-25*p.face,y:p.y,vx:-p.face*2,vy:0,life:14,color:'#43e5ff',trail:true})}
 else if(p.ground&&p.surface?.grindable){p.rolling=false;p.roll=false;charge=0;if(dir&&dir!==Math.sign(p.vx))p.vx+=dir*.45;else if(dir&&Math.abs(p.vx)<14)p.vx+=dir*.08;}
 else if(charge)p.vx*=.66;
 else{const precisionBrake=!p.rolling&&!p.scriptedLaunch&&!p.wrongRouteDrop&&!p.surface?.boostExit;
  if(!p.hurt&&dir){if(p.ground&&p.rolling){if(dir!==Math.sign(p.vx)&&Math.abs(p.vx)>0){p.vx+=dir*Math.min(Math.abs(p.vx),waterScale*(Math.abs(p.vx)<=8?(recoveryGrip?1.3:.85):(recoveryGrip?1.1:.5)));p.face=dir}else if(Math.abs(p.vx)<3&&!uphillTractionLost)p.vx=Math.max(-3,Math.min(3,p.vx+dir*.16*waterScale));}
   else if(Math.abs(p.vx)<runSpeed||dir!==Math.sign(p.vx)){
    const speed=Math.min(1,Math.abs(p.vx)/runSpeed),opposing=dir!==Math.sign(p.vx)&&Math.abs(p.vx)>(precisionBrake?0:.1);
    let a=p.ground?(opposing?(recoveryGrip?(Math.abs(p.vx)<=14?2.5:1.4):(Math.abs(p.vx)<8?1:.82)):.52*Math.pow(1-speed,1.5)+.035):(opposing?.2:.12);
    // Countersteering stops at zero; normal acceleration begins on the next frame.
    // Intentional propulsion retains its previous steering and friction.
    // Uphill propulsion weakens with inclination; deliberate braking keeps its tuned strength.
    a*=waterScale/(opposing?1:controlNorm);
    if(!opposing&&uphillTractionLost)a=0;
    if(opposing&&precisionBrake)a=Math.min(Math.abs(p.vx),a*movementTuning.counterBrake);
    p.vx+=dir*a;p.face=dir;if(Math.abs(p.vx)>runSpeed&&dir===Math.sign(p.vx))p.vx=dir*runSpeed
   }}
  else if(p.ground){if(!p.rolling){const drag=precisionBrake&&Math.abs(p.vx)<movementTuning.precisionSpeed?(recoveryGrip?movementTuning.recoveryGrip:movementTuning.groundGrip):Math.abs(p.vx)<=8?(recoveryGrip?.65:.5):(recoveryGrip?.4:.22+(Math.abs(p.vx)-8)*.002);p.vx=Math.sign(p.vx)*Math.max(0,Math.abs(p.vx)-drag*waterScale)}}
  if(Math.abs(p.vx)>14&&!p.surface?.boostExit&&(!p.ground||!p.rolling))p.vx*=p.ground?.998:.999;}
 if(p.ground&&p.rolling){p.vx*=.9985}
 // Smooth drag bounds terrain speeds without clipping all earned speed at 24.
 if(controlSurface){const excess=Math.max(0,p.vx*p.vx-26*26);p.vx/=1+.0003*excess/Math.max(1,Math.abs(p.vx));p.vx/=controlNorm;}
 applySurfaceMotion();
 if(Math.abs(p.vx)<.03)p.vx=0;stats.maxSpeed=Math.max(stats.maxSpeed,Math.abs(p.vx));anim+=Math.abs(p.vx)*.08;
 if(!p.ground&&p.airSpeedLimit)p.vx=Math.max(-p.airSpeedLimit,Math.min(p.airSpeedLimit,p.vx));
 moveAndResolveSurfaces();
 resolveHazards(p.lastX,p.lastY);updateBrakingPose(dir,beforeSpeed);if(p.ground&&p.surface?.grindable&&Math.abs(p.vx)>2&&runFrames%3===0){const fast=p.boosting||Math.abs(p.vx)>18;particles.push({x:p.x+7*Math.sign(p.vx),y:feet()-1,vx:-Math.sign(p.vx)*(fast?4:2),vy:fast?-1.5:-.7,life:fast?12:8,color:fast?'#ffdb72':'#ffe4a4',grind:true,trail:false});if(fast&&runFrames%6===0)particles.push({x:p.x-10*Math.sign(p.vx),y:feet()+1,vx:-Math.sign(p.vx)*5,vy:0,life:7,color:'#ffa65b',grind:true,trail:true})}
 if(level.deathZones?.some(z=>p.x>=z.x1&&p.x<=z.x2&&feet()>z.y)){die();return false}if(feet()>stageDeathLimit()){die();return false}return true}

// Visual state tracks resisted momentum; it never gates jump, roll, or direction inputs.
function updateBrakingPose(dir,incoming){
 const speed=Math.abs(p.vx),opposing=dir&&dir!==Math.sign(p.vx),resisting=p.ground&&!p.surface?.grindable&&!p.rolling&&!charge&&!p.boosting&&!p.hurt&&(!dir||opposing);
 if(resisting&&(speed>.03||p.brakeActive)){
  if(!p.brakeActive){p.brakeAge=0;p.brakeSpeed=incoming;p.brakeFace=Math.sign(p.vx)||p.face}p.brakeActive=speed>.03;p.brakeAge++;p.brakeSpeed=Math.max(p.brakeSpeed||0,incoming);
  if(!speed){p.stopFrame=runFrames;p.brakeActive=false}
  if(speed>2&&(p.brakeAge===1||runFrames%3===0)){const force=Math.min(1,p.brakeSpeed/23);particles.push({x:p.x+8*p.brakeFace,y:feet()-2,vx:-p.brakeFace*(.5+force*2),vy:-.5-force*.9,life:12+force*8,color:'#bbc0cd',skid:true,size:3+force*4});if(force>.5)particles.push({x:p.x,y:feet()-1,vx:-p.brakeFace,vy:0,life:9,color:'#ffe1a0',trail:true,skid:true})}
 }else{p.brakeActive=false;if(dir||!p.ground||p.rolling||p.boosting||p.hurt)p.stopFrame=-100}
}

// Water follows the existing bowl collision profile, including its dry raised edges.
// Classic ratios: Sonic 1 Sonic_Water / Sonic_Jump / Sonic_JumpHeight (s1disasm).
function waterAt(x,y){
 const pool=level.middleSection?.pool;if(!pool||x<pool.x1||x>pool.x2||y<=pool.y)return null;
 let floor=pool.floor;
 for(const id of pool.deckIds){const s=surfaceById(id);if(s&&x>=s.x1&&x<=s.x2){floor=yOn(s,x);break;}}
 return y<floor?pool:null;
}
function resetPlayerAbilities(){
 Object.assign(p,{shield:null,bubbleSlam:false,underwater:false,airRemaining:1800,airBoostUsed:false,airBoostFrames:0,airBoostActive:false,airBoostRequested:false,groundBoostHeld:false,jumpReleaseVy:null,coyoteLaunchVy:null,dashRolling:false});
}
function updateWaterState(){
 const wet=!!waterAt(p.x,p.y),wasWet=!!p.underwater;
 if(wet&&!wasWet){p.vx*=.5;p.vy*=.25;gameSound('pool');}
 else if(!wet&&wasWet){
  // Only crossing the water surface restores upward velocity, never side/floor exits.
  const pool=level.middleSection?.pool;
  if(pool&&p.y<=pool.y&&p.vy<0)p.vy=Math.max(-13.4*16/6.5,p.vy*2);
  gameSound('pool');
 }
 p.underwater=wet;
}
function updateBreathing(){
 if(!waterAt(p.x,p.y-10)||p.shield==='bubble'){p.airRemaining=1800;return true;}
 p.airRemaining=Math.max(0,(p.airRemaining??1800)-1);
 if(!p.airRemaining){die();return false;}
 if(p.airRemaining===1500||p.airRemaining===1200||p.airRemaining===900||p.airRemaining<=720&&p.airRemaining%60===0)gameSound('airWarning');
 return true;
}
function beginBubbleSlam(){
 p.bubbleSlam=true;p.jumpReleaseVy=null;p.airBoostFrames=0;p.airBoostActive=false;p.airBoostRequested=false;p.groundBoostHeld=false;p.boosting=false;
 p.scriptedLaunch=false;p.airSpeedLimit=null;p.airLaunchUntil=0;p.vy=p.underwater?8:16;p.jumpAttack=true;p.rolling=false;p.roll=true;charge=0;coyote=0;jumpBuffer=0;
 gameSound('bubbleBounce');
}

function reboundBubbleShield(){
 if(!p.bubbleSlam||p.shield!=='bubble')return false;
 p.bubbleSlam=false;p.jumpReleaseVy=null;p.vy=-13.4*(p.underwater?7/13:1);p.ground=false;p.surface=null;p.jumpAttack=true;
 p.airBoostUsed=false;p.airBoostFrames=0;p.airBoostActive=false;p.poseJumpFrame=runFrames;p.airLaunchUntil=runFrames+8;
 coyote=0;jumpBuffer=0;gameSound('bubbleBounce');return true;
}
