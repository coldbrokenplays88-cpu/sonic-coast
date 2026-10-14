// Replays start on the same existing loop roof. All later motion uses buttons.
const startLoopSource=`function startLoop(phase=0,style='dash'){
 runFrames=phase;const roof=surfaceById('draw-loop-roof');p.x=roof.x1+100;p.y=roof.y1-20;p.surface=roof;p.ground=true;p.vx=['run','roll'].includes(style)?14:0;p.vy=0;p.inv=0;count=20;keys.clear();
 if(style==='dash'){press('ArrowDown',true);press('Space',true);for(let i=0;i<80;i++)update();release('ArrowDown',true);release('Space',true);}
 if(style==='roll')press('ArrowDown',true);press('ArrowRight',true);if(style==='boost')press('ShiftLeft',true);
}`;
const blimpReplaySource=`function replayBlimps(cautious=false,maxFrames=1200){
 let jumped=false,turned=false,returned=false,paused=false,crossed=false,crossJumpFrame=0,wait=0,landings=[],lastId='',secondInitiallyVisible=null;
 const begin=runFrames;
 for(let i=0;i<maxFrames;i++){
  if(!jumped&&p.surface?.id==='draw-loop-launch'&&p.x>=p.surface.x2-45){press('Space',true);jumped=true;}
  if(!turned&&level.springs.find(s=>s.id==='blimp-entry-spring').firedAt!==undefined){release('Space',true);release('ArrowRight',true);release('ShiftLeft',true);press('ArrowLeft',true);turned=true;}
  if(turned&&!returned){
   if(!p.ground&&p.x<surfaceById('blimp-curve-7').x2&&p.vy>0&&feet()>surfaceById('blimp-curve-4').y1-60)press('ArrowDown',true);
   if(p.surface?.id==='blimp-moving'){
    if(secondInitiallyVisible===null){const q=pose(surfaceById('blimp-reward'));secondInitiallyVisible=q.x2+42>=cam&&q.x1-42<=cam+W/zoom;}
    if(cautious&&!paused){release('ArrowDown',true);release('ArrowLeft',true);press('ArrowRight',true);paused=true;}
    if(cautious&&paused&&!crossed){
     if(wait>85){release('ArrowRight',true);press('ArrowLeft',true);const q=pose(p.surface);if(p.x<q.x1+100){press('Space',true);crossed=true;crossJumpFrame=runFrames;}}else if(p.vx>=-.2){release('ArrowRight',true);release('ArrowLeft',true);wait++;}
    }
   }
  }
  if(crossed&&runFrames-crossJumpFrame===8)release('Space',true);
  if(!returned&&level.springs.find(s=>s.id==='blimp-return-spring').firedAt!==undefined){release('Space',true);release('ArrowLeft',true);release('ArrowDown',true);release('ArrowRight',true);press('ArrowRight',true);returned=true;}
  update();const id=p.surface?.id||'air';if(id!==lastId){landings.push({id,frame:runFrames-begin,x:p.x,y:feet(),vx:p.vx});lastId=id;}
  if(stats.deaths||mode!=='playing')throw Error('Failed blimp replay at '+id);
  if(p.x>surfaceById('draw-hall-exit').x2+FOOT_RADIUS&&p.ground)return {frames:runFrames-begin,landings,secondInitiallyVisible,wait,life:level.monitors.find(m=>m.id==='blimp-life').broken,shield:p.shield};
 }
 throw Error('Blimp replay timed out at '+p.surface?.id+' '+p.x+' '+feet());
}`;
module.exports={startLoopSource,blimpReplaySource};
