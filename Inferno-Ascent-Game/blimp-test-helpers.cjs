// Replays start on the same existing loop roof. All later motion uses buttons.
const startLoopSource=`function startLoop(phase=0,style='dash'){
 runFrames=phase;const roof=surfaceById('draw-loop-roof');p.x=roof.x1+100;p.y=roof.y1-20;p.surface=roof;p.ground=true;p.vx=['run','roll'].includes(style)?14:0;p.vy=0;p.inv=0;count=20;keys.clear();
 if(style==='dash'){press('ArrowDown',true);press('Space',true);for(let i=0;i<80;i++)update();release('ArrowDown',true);release('Space',true);}
 if(style==='roll')press('ArrowDown',true);press('ArrowRight',true);if(style==='boost'){press('ShiftLeft',true);press('ArrowDown',true);}
 if(p.act1Motion&&['dash','boost'].includes(style)){
  let setupStage=0;
  for(let i=0;i<350&&!level.blimpRoute.entered&&!stats.deaths;i++){
   // Stand before the sharp crest, roll down the actual descent, then stand
   // before its following convex seam. These are ordinary button inputs.
   if((setupStage===0&&p.x>29950&&p.ground)||(setupStage===2&&p.surface?.id==='draw-loop-flat-1')){
    release('ArrowRight',true);press('ArrowLeft',true);update();release('ArrowLeft',true);press('ArrowRight',true);setupStage++;
   }
   if(setupStage===1&&p.surface?.id==='draw-loop-descent'){release('ArrowDown',true);press('ArrowDown',true);setupStage=2;}
   if(level.blimpRoute.departureFrame>=0&&!p.ground&&!p.loop){
    release('ShiftLeft',true);release('ArrowDown',true);
    const error=31960-p.x,stopping=p.vx*p.vx/.32;
    release('ArrowRight',true);release('ArrowLeft',true);
    const dir=error*p.vx<0?Math.sign(error):Math.abs(error)<stopping+2?-Math.sign(p.vx):Math.abs(error)>2?Math.sign(error):0;
    if(dir)press(dir>0?'ArrowRight':'ArrowLeft',true);
   }
   update();
  }
 }

}`;
const blimpReplaySource=`function* blimpSteps(cautious=false,maxFrames=1200){
 let departed=false,boostedEntry=false,turned=false,returned=false,paused=false,crossed=false,entryBrake=0,returnJumpFrame=-1,crossJumpFrame=0,wait=0,landings=[],lastId='',secondInitiallyVisible=null,thirdVisibleAtJump=null,crossingSpeed=0;
 const begin=runFrames;
 for(let i=0;i<maxFrames;i++){
  if(!departed&&!p.ground&&!p.loop&&level.blimpRoute.departureFrame>=0){departed=true;boostedEntry=keys.has('ShiftLeft');release('ShiftLeft',true);if(boostedEntry){release('ArrowRight',true);press('ArrowLeft',true);entryBrake=32;}}
  if(entryBrake>0&&--entryBrake===0){release('ArrowLeft',true);press('ArrowRight',true);}
  if(!turned&&level.pads.find(s=>s.id==='blimp-entry-spring').firedAt!==undefined){release('Space',true);release('ArrowRight',true);release('ShiftLeft',true);press('ArrowLeft',true);turned=true;}
  if(turned&&!returned){
   if(cautious&&!paused&&!p.ground&&p.act1Motion?.latestTransition==='ledge'&&p.x<30550&&p.vy>0){release('ArrowLeft',true);if(p.vx < -9)press('ArrowRight',true);else release('ArrowRight',true);}

   if(!p.ground&&p.x<surfaceById('blimp-curve-7').x2&&p.vy>0&&feet()>surfaceById('blimp-curve-4').y1-60)press('ArrowDown',true);
   if(p.surface?.id==='blimp-moving'){
    const q=pose(p.surface),third=pose(surfaceById('blimp-reward'));
    const visible=third.x2+40>=cam&&third.x1-40<=cam+W/zoom&&third.y1+234>=camY&&third.y1<=camY+H/zoom;
    if(secondInitiallyVisible===null)secondInitiallyVisible=visible;
    if(cautious&&!paused){release('ArrowDown',true);release('ArrowLeft',true);press('ArrowRight',true);paused=true;}
    if(cautious&&paused&&!crossed){
     if((p.act1Motion?.speed??p.vx)<-.2&&wait===0){}else{release('ArrowRight',true);wait++;if(visible){press('ArrowLeft',true);if(p.x<q.x1+80){press('Space',true);crossed=true;crossJumpFrame=runFrames;thirdVisibleAtJump=visible;crossingSpeed=Math.abs(p.vx);}}}
    }else if(!cautious&&!crossed&&p.x<q.x1+35){press('Space',true);crossed=true;crossJumpFrame=runFrames;thirdVisibleAtJump=visible;crossingSpeed=Math.abs(p.vx);}
   }
   // Roll through both monitors on the reward deck, then reach its vent grate.
   if(p.surface?.id==='blimp-reward')release('Space',true);
   if(p.surface?.id==='blimp-reward'&&!p.rolling){release('ArrowDown',true);press('ArrowDown',true);}

  }
  if(cautious&&crossed&&runFrames-crossJumpFrame===8)release('Space',true);
  if(!returned&&level.pads.find(s=>s.id==='blimp-return-spring').firedAt!==undefined){release('Space',true);release('ArrowLeft',true);release('ArrowDown',true);release('ArrowRight',true);press('ArrowRight',true);returned=true;}
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
