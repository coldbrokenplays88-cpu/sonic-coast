// Replays start on the same existing loop roof. All later motion uses buttons.
const startLoopSource=`function startLoop(phase=0,style='dash'){
 runFrames=phase;const roof=surfaceById('draw-loop-roof');p.x=roof.x1+100;p.y=roof.y1-20;p.surface=roof;p.ground=true;p.vx=['run','roll'].includes(style)?14:0;p.vy=0;p.inv=0;count=20;keys.clear();
 if(style==='dash'){press('ArrowDown',true);press('Space',true);for(let i=0;i<80;i++)update();release('ArrowDown',true);release('Space',true);}
 if(style==='roll')press('ArrowDown',true);press('ArrowRight',true);if(style==='boost'){press('ShiftLeft',true);press('ArrowDown',true);}
}`;
const blimpReplaySource=`function* blimpSteps(cautious=false,maxFrames=1200){
 let jumped=false,turned=false,returned=false,paused=false,crossed=false,entryBrake=0,returnJumpFrame=-1,crossJumpFrame=0,wait=0,landings=[],lastId='',secondInitiallyVisible=null,thirdVisibleAtJump=null,crossingSpeed=0;
 const begin=runFrames;
 for(let i=0;i<maxFrames;i++){
  if(!jumped&&p.surface?.id==='draw-loop-launch'&&p.x>=p.surface.x2-45){const boosted=keys.has('ShiftLeft');press('Space',true);jumped=true;if(boosted){release('ShiftLeft',true);release('ArrowRight',true);press('ArrowLeft',true);entryBrake=34;}}
  if(entryBrake>0&&--entryBrake===0){release('ArrowLeft',true);press('ArrowRight',true);}
  if(!turned&&level.springs.find(s=>s.id==='blimp-entry-spring').firedAt!==undefined){release('Space',true);release('ArrowRight',true);release('ShiftLeft',true);press('ArrowLeft',true);turned=true;}
  if(turned&&!returned){
   if(!p.ground&&p.x<surfaceById('blimp-curve-7').x2&&p.vy>0&&feet()>surfaceById('blimp-curve-4').y1-60)press('ArrowDown',true);
   if(p.surface?.id==='blimp-moving'){
    const q=pose(p.surface),third=pose(surfaceById('blimp-reward'));
    const visible=third.x2+40>=cam&&third.x1-40<=cam+W/zoom&&third.y1+234>=camY&&third.y1<=camY+H/zoom;
    if(secondInitiallyVisible===null)secondInitiallyVisible=visible;
    if(cautious&&!paused){release('ArrowDown',true);release('ArrowLeft',true);press('ArrowRight',true);paused=true;}
    if(cautious&&paused&&!crossed){
     if(p.vx<-.2&&wait===0){}else{release('ArrowRight',true);wait++;if(visible){press('ArrowLeft',true);if(p.x<q.x1+80){press('Space',true);crossed=true;crossJumpFrame=runFrames;thirdVisibleAtJump=visible;crossingSpeed=Math.abs(p.vx);}}}
    }else if(!cautious&&!crossed&&p.x<q.x1+35){press('Space',true);crossed=true;crossJumpFrame=runFrames;thirdVisibleAtJump=visible;crossingSpeed=Math.abs(p.vx);}
   }
   if(p.surface?.id==='blimp-reward'&&returnJumpFrame<0&&p.x<29490){release('Space',true);press('Space',true);returnJumpFrame=runFrames;}
   if(returnJumpFrame>=0&&runFrames===returnJumpFrame+1)release('Space',true);
   if(p.surface?.id==='blimp-reward'&&!p.rolling){release('ArrowDown',true);press('ArrowDown',true);}

  }
  if(cautious&&crossed&&runFrames-crossJumpFrame===8)release('Space',true);
  if(!returned&&level.springs.find(s=>s.id==='blimp-return-spring').firedAt!==undefined){release('Space',true);release('ArrowLeft',true);release('ArrowDown',true);release('ArrowRight',true);press('ArrowRight',true);returned=true;}
  update();const id=p.surface?.id||'air';if(id!==lastId){landings.push({id,frame:runFrames-begin,x:p.x,y:feet(),vx:p.vx});lastId=id;}
  yield;
  if(stats.deaths||mode!=='playing')throw Error('Failed blimp replay at '+id);
  if(p.x>surfaceById('draw-hall-exit').x2+FOOT_RADIUS&&p.ground)return {frames:runFrames-begin,landings,secondInitiallyVisible,thirdVisibleAtJump,crossingSpeed,wait,life:level.monitors.find(m=>m.id==='blimp-life').broken,shield:p.shield};
 }
 throw Error('Blimp replay timed out at '+p.surface?.id+' '+p.x+' '+feet());
}
function replayBlimps(cautious=false,maxFrames=1200){const steps=blimpSteps(cautious,maxFrames);let next;do{next=steps.next()}while(!next.done);return next.value;}
`;
module.exports={startLoopSource,blimpReplaySource};
