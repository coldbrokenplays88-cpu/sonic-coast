/* Fixed-step, dialogue-free storyboard. Coordinates are world-space foot anchors. */
(function(root){
 'use strict';
 const ENDING_BEATS=Object.freeze([
  ['escape',108],['aim',48],['rocket',54],['kick',30],['return',30],['explode',54],
  ['jetpack',84],['offer',90],['approach',42],['nod',108],['annoy',42],['swing',66],
  ['realize',60],['vanish',24],['sigh',96],['end',30]
 ].map(([name,duration])=>Object.freeze({name,duration})));
 const starts={};let total=0;for(const b of ENDING_BEATS){starts[b.name]=total;total+=b.duration;}
 const clamp=(v,a=0,b=1)=>Math.max(a,Math.min(b,v)),ease=t=>{t=clamp(t);return t*t*(3-2*t);},mix=(a,b,t)=>a+(b-a)*clamp(t);
 // Exposures are authored holds, not interpolated drawings. Existing key poses
 // remain the accents; supplemental cels supply anticipation and follow-through.
 function pose(actor,age,cels,sheet=actor.sheet){
  actor.sheet=sheet;let end=0;
  for(const [frame,hold] of cels){end+=hold;actor.frame=frame;if(age<end)return;}
 }
 function createEndingScene(arena,player,camera){return {arena:{...arena},camera:Object.freeze({...camera}),startX:player.x,sonicX:clamp(player.x,arena.x+490,arena.x+630),index:0,beat:'escape',age:0,frame:0,done:false,events:[]};}
 function tickEndingScene(s){
  s.events=[];if(s.done)return s;s.frame++;s.age++;
  if(s.age>=ENDING_BEATS[s.index].duration){if(s.index===ENDING_BEATS.length-1){s.done=true;return s;}s.index++;s.beat=ENDING_BEATS[s.index].name;s.age=0;}
  const entry={rocket:'rocketFire',kick:'shadowTeleport',explode:'podExplosion',jetpack:'jetpack',offer:'emeraldOffer',vanish:'chaosWarp'};
  if(s.age===0&&entry[s.beat])s.events.push(entry[s.beat]);
  if(s.beat==='kick'&&s.age===18)s.events.push('kickImpact');
  if(s.beat==='swing'&&s.age===52)s.events.push('chaosCharge');
  if(s.beat==='sigh'&&s.age===30)s.events.push('relievedSigh');return s;
 }
 function endingPose(s){
  const {beat:b,age:a,frame:f}=s,roof=s.arena.y,sx=s.sonicX,shadowX=sx+235,podX=s.arena.x+1100;
  const since=name=>f-starts[name],past=name=>f>=starts[name],cycle=(n,d=6)=>Math.floor(a/d)%n;
  const sonic={x:sx,y:roof,visible:!past('sigh'),action:'confident',sheet:'sonic',frame:0,flip:false,alpha:1};
  const shadow={x:shadowX,y:roof,visible:past('kick'),action:'neutral',sheet:'shadow',frame:15,flip:false,alpha:1};
  const pod={x:podX,y:roof-210+Math.sin(f*.065)*3,visible:!past('explode'),sheet:'eggman',frame:0,alpha:1};
  const eggman={x:podX,y:roof-210,visible:past('explode')&&!past('offer'),sheet:'eggman',frame:4,alpha:1};
  // Meet the preserved forward-boot key cel; the projectile uses its nose as
  // its anchor so the impact does not pass through Shadow's torso.
  const contact={x:sx+171,y:roof-92},blast={x:podX-20,y:roof-265};
  const effects={arrival:b==='kick'&&a<14,kick:b==='kick'&&a>=18&&a<25,explosion:b==='explode',teleport:(b==='swing'&&a>=52||past('realize'))&&!past('sigh'),warp:b==='vanish',dust:b==='approach'&&a>24,sigh:b==='sigh'&&a>=30&&a<65};
  if(b==='escape'){
   pod.y=mix(roof+30,roof-210,ease(a/85));
   pose(sonic,a,[[2,42],[0,4],[1,4],[0,3],[2,55]],'sonic-polish');
   if(a<6){sonic.sheet='sonic';sonic.frame=0;}
   if(Math.abs(s.startX-sx)>5&&a<36){sonic.x=mix(s.startX,sx,ease(a/36));sonic.action='run';sonic.sheet='recovered';sonic.frame=cycle(8,3);sonic.flip=s.startX>sx;}
  }
  if(b==='aim'){
   pose(pod,a,[[0,10],[1,18],[2,20]],'eggman-polish');
   if(a<8)pose(sonic,a,[[3,8]],'sonic-polish');else pose(sonic,a-8,[[1,16],[2,24]],'sonic');
  }
  if(['rocket','kick','return'].includes(b)){
   const t=since('rocket');sonic.action='grin';
   if(t<8)pose(sonic,t,[[4,8]],'sonic-polish');else pose(sonic,t-8,[[3,7],[4,15],[5,100]],'sonic');
   if(t<30)pose(pod,t,[[3,5],[4,6],[3,7],[2,12]],'eggman-polish');
   else if(b==='rocket')pose(pod,a-30,[[5,24]],'eggman-polish');
   else pose(pod,since('kick'),[[5,8],[6,12],[7,40]],'eggman-polish');
  }
  if(['explode','jetpack'].includes(b)){
   const t=since('explode');sonic.action='disappointed';
   if(t<12)pose(shadow,t,[[8,6],[9,6]],'shadow-polish');else shadow.frame=16;
   if(t<14)pose(sonic,t,[[5,6],[6,8]],'sonic-polish');
   else if(t<50)pose(sonic,t-14,[[7,9],[8,27]],'sonic');
   else pose(sonic,t-50,[[7,24],[0,4],[1,4],[0,3],[7,54]],'sonic-polish');
  }
  if(b==='offer'){
   sonic.action='unbothered';shadow.action='offer';
   pose(sonic,a,[[8,12],[9,7],[10,8],[9,8],[8,55]],'sonic-polish');
   if(a<25)pose(shadow,a,[[9,6],[10,8],[11,5],[10,6]],'shadow-polish');
   else pose(shadow,a-25,[[19,7],[20,58]],'shadow');
  }
  if(b==='approach'){
   sonic.x=mix(sx,shadowX-88,ease(a/30));sonic.action=a<30?'run':'unbothered';
   if(a<30){sonic.sheet='recovered';sonic.frame=cycle(8,2);}
   else pose(sonic,a-30,[[11,4],[8,4],[12,4]],'sonic-polish');shadow.frame=20;
  }
  if(past('nod')){
   sonic.x=shadowX-88;sonic.action='nod';shadow.frame=20;
   pose(sonic,since('nod')%42,[[12,6],[13,5],[14,7],[13,5],[15,6],[16,7],[17,6]],'sonic-polish');
   if(b==='nod'&&a>=48&&a<58)pose(shadow,a-48,[[11,4],[17,6]],'shadow-polish');
  }
  if(b==='annoy'){
   shadow.action='annoyed';
   if(a<18)pose(shadow,a,[[21,9],[22,9]],'shadow');else pose(shadow,a-18,[[12,24]],'shadow-polish');
  }
  if(b==='swing'){
   shadow.action='swing';
   if(a<40)pose(shadow,a,[[12,6],[13,6],[14,6],[15,14],[16,8]],'shadow-polish');
   else if(a<46){shadow.frame=25;shadow.flip=true;}
   else pose(shadow,a-46,[[17,6],[18,14]],'shadow-polish');
  }
  if(b==='realize'){
   sonic.action='confused';sonic.y=roof-ease(a/50)*16;shadow.action='smirk';
   pose(sonic,a,[[18,5],[19,6],[20,8],[21,8],[22,9],[23,24]],'sonic-polish');
   pose(shadow,a,[[18,36],[19,4],[18,20]],'shadow-polish');
  }
  if(b==='vanish'){
   sonic.action='confused';sonic.sheet='sonic-polish';sonic.frame=22+cycle(2,5);sonic.y=roof-16-a*.3;sonic.alpha=1-ease(a/18);sonic.visible=a<20;
   shadow.action='smirk';shadow.sheet='shadow-polish';shadow.frame=18;
  }
  if(b==='sigh'||b==='end'){
   shadow.action='sigh';sonic.visible=false;
   pose(shadow,b==='end'?96:a,[[18,16],[19,7],[20,12],[21,10],[22,22],[23,4],[22,55]],'shadow-polish');
  }
  if(b==='kick'){
   shadow.action='kick';shadow.x=mix(sx+105,sx+128,ease(a/18));shadow.y=roof-14-Math.sin(clamp(a/30)*Math.PI)*23;
   if(a<12)pose(shadow,a,[[0,4],[1,4],[2,4]],'shadow-polish');
   else if(a<20)pose(shadow,a-12,[[3,5],[4,3]],'shadow');
   else pose(shadow,a-20,[[3,5],[4,5]],'shadow-polish');
   shadow.alpha=a<6?a/6:1;
  }
  if(b==='return'){
   shadow.action='land';shadow.x=mix(sx+128,shadowX,ease(a/22));
   shadow.y=roof-14*(1-ease(a/22))-Math.sin(clamp(a/22)*Math.PI)*20;
   pose(shadow,a,[[4,14],[5,8],[6,4],[7,4]],'shadow-polish');
  }
  if(eggman.visible){const t=since('explode');eggman.frame=t<18?4:5+Math.floor(t/9)%3;eggman.x=podX+Math.max(0,t-22)*3.6;eggman.y=roof-205-Math.min(t,22)*2.4-Math.max(0,t-22)*3.2;}
  const emerald={color:'yellow',visible:past('offer'),phase:'held',overlay:false,progress:0,x:shadow.x-25,y:shadow.y-36};
  if(b==='swing'&&a>=6&&a<12){emerald.overlay=true;emerald.phase='lowered';}
  if(b==='swing'&&a>=12&&a<=39){
   emerald.phase='airborne';emerald.overlay=true;emerald.progress=(a-12)/27;
   emerald.y=mix(shadow.y-46,shadow.y-55,emerald.progress)-4*44*emerald.progress*(1-emerald.progress);
  }
  let rocket=null;
  const launch=starts.rocket,hit=starts.kick+18,impact=starts.explode;
  if(f>=launch&&f<impact){
   const from=f<=hit?{x:podX-65,y:roof-226}:contact,to=f<=hit?contact:blast;
   const t=f<=hit?(f-launch)/(hit-launch):(f-hit)/(impact-hit);
   rocket={x:mix(from.x,to.x,t),y:mix(from.y,to.y,t),angle:Math.atan2(to.y-from.y,to.x-from.x)-Math.PI,sheet:'eggman',frame:9,nose:true,alpha:1};
  }
  return {beat:b,age:a,frame:f,sonic,shadow,pod,eggman,emerald,rocket,contact,blast,effects};
 }
 const api={ENDING_BEATS,createEndingScene,tickEndingScene,endingPose};
 if(typeof module!=='undefined'&&module.exports)module.exports=api;else Object.assign(root,api);
})(typeof window!=='undefined'?window:globalThis);
