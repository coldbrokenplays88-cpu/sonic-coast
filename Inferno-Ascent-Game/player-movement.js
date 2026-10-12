'use strict';
// Shared player movement. State and the fixed-tick controller remain in game.js.

function jump(){p.scriptedLaunch=false;p.jumpAttack=true;if(p.surface?.grindable)p.grindExitFrame=runFrames;p.poseJumpFrame=runFrames;const slope=p.surface?pose(p.surface).slope:0;const speedLift=Math.max(0,Math.abs(p.vx)-14)*.25;p.vy=-(13.4+Math.min(2.4,speedLift))+Math.max(-3.5,Math.min(0,slope*p.vx*.45));if(p.jumpCut)p.vy=-6.8;p.ground=false;p.surface=null;coyote=0;jumpBuffer=0;stats.jumps++;gameSound('jump')}

function updateRoll(down){
 if(down&&!p.downHeld){p.rollBuffer=6;p.rollSpent=false}if(!down)p.rollSpent=false;p.downHeld=down;
 if(p.ground&&!p.surface?.grindable&&p.rollBuffer>0&&!p.rollSpent&&!p.rolling){p.rolling=true;p.rollAge=0;p.lowRollFrames=0;p.rollBuffer=0;stats.rolls++}
 if(p.rollBuffer>0)p.rollBuffer--;
 if(p.rolling){p.rollAge++;if(p.ground&&Math.abs(p.vx)<7)p.lowRollFrames++;else if(Math.abs(p.vx)>=7)p.lowRollFrames=0;
  const expired=p.lowRollFrames>=90||p.rollAge>=240;
  if(((!down&&p.rollAge>6)||expired)&&canStand()){p.rolling=false;if(expired)p.rollSpent=true}}
 p.roll=p.rolling||charge>0||!p.ground;
}

function updateMovement(){if(updateStageMotion())return true;if(p.loop)return updateLoop();const beforeSpeed=Math.abs(p.vx),recoveryGrip=p.ground&&['recovery','lower'].includes(p.surface?.kind);const down=keys.has('ArrowDown')||keys.has('KeyS');const dir=Number(keys.has('ArrowRight')||keys.has('KeyD'))-Number(keys.has('ArrowLeft')||keys.has('KeyA'));updateRoll(down);
 if(p.ground)coyote=tuning.coyote;else if(coyote>0)coyote--;
 if(jumpBuffer>0&&coyote>0&&!charge)jump();else if(jumpBuffer>0)jumpBuffer--;
 if(charge&&down&&JUMP_KEYS.some(k=>keys.has(k))){charge=Math.min(20,charge+.2);if(runFrames%10===0){sparks(p.x-15*p.face,p.y+18,3,'#69efff');if(typeof gameSound==='function')gameSound('spindashCharge',{charge:charge/20})}}
 if(charge&&!down){gameSound('spindashRelease',{charge:charge/20});p.vx=p.face*(12+charge*.55);charge=0;p.rolling=true;p.rollAge=0;p.lowRollFrames=0;sparks(p.x,p.y+15,10,'#4bd9ff')}
 const wantBoost=keys.has('ShiftLeft')||keys.has('ShiftRight')||keys.has('KeyX')||keys.has('MouseBoost');if(!wantBoost)p.boostLocked=false;
 updateBoostState(wantBoost);
 if(p.boosting){if(dir&&Math.sign(p.vx)===dir)p.face=dir;p.vx+=(p.face*23-p.vx)*.14;if(runFrames%3===0)particles.push({x:p.x-25*p.face,y:p.y,vx:-p.face*2,vy:0,life:14,color:'#43e5ff',trail:true})}
 else if(p.ground&&p.surface?.grindable){p.rolling=false;p.roll=false;charge=0;if(dir&&dir!==Math.sign(p.vx))p.vx+=dir*.45;else if(dir&&Math.abs(p.vx)<14)p.vx+=dir*.08;}
 else if(charge)p.vx*=.66;
 else{const precisionBrake=!p.rolling&&!p.scriptedLaunch&&!p.wrongRouteDrop&&!p.surface?.boostExit;
  if(!p.hurt&&dir){if(p.ground&&p.rolling){if(dir!==Math.sign(p.vx)&&Math.abs(p.vx)>.1){p.vx+=dir*(Math.abs(p.vx)<=8?(recoveryGrip?1.3:.85):(recoveryGrip?1.1:.5));p.face=dir}else if(Math.abs(p.vx)<3)p.vx=Math.max(-3,Math.min(3,p.vx+dir*.16));}
   else if(Math.abs(p.vx)<14||dir!==Math.sign(p.vx)){
    const speed=Math.min(1,Math.abs(p.vx)/14),opposing=dir!==Math.sign(p.vx)&&Math.abs(p.vx)>(precisionBrake?0:.1);
    let a=p.ground?(opposing?(recoveryGrip?(Math.abs(p.vx)<=14?2.5:1.4):(Math.abs(p.vx)<8?1:.82)):.52*Math.pow(1-speed,1.5)+.035):(opposing?.2:.12);
    // Countersteering stops at zero; normal acceleration begins on the next frame.
    // Intentional propulsion retains its previous steering and friction.
    if(opposing&&precisionBrake)a=Math.min(Math.abs(p.vx),a*movementTuning.counterBrake);
    p.vx+=dir*a;p.face=dir;if(Math.abs(p.vx)>14&&dir===Math.sign(p.vx))p.vx=dir*14
   }}
  else if(p.ground){if(p.rolling)p.vx*=.997;else{const drag=precisionBrake&&Math.abs(p.vx)<movementTuning.precisionSpeed?(recoveryGrip?movementTuning.recoveryGrip:movementTuning.groundGrip):Math.abs(p.vx)<=8?(recoveryGrip?.65:.5):(recoveryGrip?.4:.22+(Math.abs(p.vx)-8)*.002);p.vx=Math.sign(p.vx)*Math.max(0,Math.abs(p.vx)-drag)}}
  if(Math.abs(p.vx)>14&&!p.surface?.boostExit)p.vx*=p.ground?.998:.999;}
 if(p.ground&&p.rolling){const drag=.0015+Math.min(.022,Math.max(0,p.rollAge-90)*.00016);p.vx*=1-drag}
 applySurfaceMotion();
 p.vx=Math.max(-24,Math.min(24,p.vx));if(Math.abs(p.vx)<.03)p.vx=0;stats.maxSpeed=Math.max(stats.maxSpeed,Math.abs(p.vx));anim+=Math.abs(p.vx)*.08;
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
