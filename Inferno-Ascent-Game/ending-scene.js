/* Fixed-step, dialogue-free storyboard. Coordinates are world-space foot anchors. */
(function(root){
 'use strict';
 const ENDING_BEATS=Object.freeze([
  ['escape',108],['aim',48],['rocket',54],['kick',30],['return',30],['explode',54],
  ['jetpack',84],['offer',108],['approach',42],['nod',120],['annoy',42],['swing',36],
  ['realize',60],['vanish',24],['sigh',96],['end',30]
 ].map(([name,duration])=>Object.freeze({name,duration})));
 const starts={};let total=0;for(const b of ENDING_BEATS){starts[b.name]=total;total+=b.duration;}
 const clamp=(v,a=0,b=1)=>Math.max(a,Math.min(b,v)),ease=t=>{t=clamp(t);return t*t*(3-2*t);},mix=(a,b,t)=>a+(b-a)*clamp(t);
 function createEndingScene(arena,player,camera){return {arena:{...arena},camera:Object.freeze({...camera}),startX:player.x,sonicX:clamp(player.x,arena.x+490,arena.x+630),index:0,beat:'escape',age:0,frame:0,done:false,events:[]};}
 function tickEndingScene(s){
  s.events=[];if(s.done)return s;s.frame++;s.age++;
  if(s.age>=ENDING_BEATS[s.index].duration){if(s.index===ENDING_BEATS.length-1){s.done=true;return s;}s.index++;s.beat=ENDING_BEATS[s.index].name;s.age=0;}
  const entry={rocket:'rocketFire',kick:'shadowTeleport',explode:'podExplosion',jetpack:'jetpack',offer:'emeraldOffer',vanish:'chaosWarp'};
  if(s.age===0&&entry[s.beat])s.events.push(entry[s.beat]);
  if(s.beat==='kick'&&s.age===18)s.events.push('kickImpact');
  if(s.beat==='swing'&&s.age===18)s.events.push('chaosCharge');
  if(s.beat==='sigh'&&s.age===30)s.events.push('relievedSigh');return s;
 }
 function endingPose(s){
  const {beat:b,age:a,frame:f}=s,roof=s.arena.y,sx=s.sonicX,shadowX=sx+235,podX=s.arena.x+1100;
  const since=name=>f-starts[name],past=name=>f>=starts[name],cycle=(n,d=6)=>Math.floor(a/d)%n;
  const sonic={x:sx,y:roof,visible:!past('sigh'),action:'confident',sheet:'sonic',frame:0,flip:false,alpha:1};
  const shadow={x:shadowX,y:roof,visible:past('kick'),action:'neutral',sheet:'shadow',frame:15,flip:false,alpha:1};
  const pod={x:podX,y:roof-210+Math.sin(f*.065)*3,visible:!past('explode'),sheet:'eggman',frame:0,alpha:1};
  const eggman={x:podX,y:roof-210,visible:past('explode')&&!past('offer'),sheet:'eggman',frame:4,alpha:1};
  const contact={x:sx+151,y:roof-73},blast={x:podX-20,y:roof-265};
  const effects={arrival:b==='kick'&&a<14,kick:b==='kick'&&a>=18&&a<25,explosion:b==='explode',teleport:past('swing')&&!past('sigh'),warp:b==='vanish',dust:b==='approach'&&a>24,sigh:b==='sigh'&&a>=30&&a<65};
  if(b==='escape'){
   pod.y=mix(roof+30,roof-210,ease(a/85));
   if(Math.abs(s.startX-sx)>5&&a<36){sonic.x=mix(s.startX,sx,ease(a/36));sonic.action='run';sonic.sheet='recovered';sonic.frame=cycle(8,3);sonic.flip=s.startX>sx;}
  }
  if(b==='aim'){pod.frame=a<16?1:a<32?2:3;sonic.frame=Math.min(2,Math.floor(a/16));}
  if(['rocket','kick','return'].includes(b)){sonic.action='grin';sonic.frame=3+Math.min(2,Math.floor(since('rocket')/10));pod.frame=3;}
  if(['explode','jetpack'].includes(b)){sonic.action='disappointed';sonic.frame=6+Math.min(2,Math.floor(since('explode')/9));}
  if(b==='offer'){sonic.action='unbothered';sonic.frame=9+Math.min(2,Math.floor(a/15));shadow.action='offer';shadow.frame=16+Math.min(4,Math.floor(a/10));}
  if(b==='approach'){
   sonic.x=mix(sx,shadowX-88,ease(a/34));sonic.action=a<30?'run':'unbothered';sonic.sheet=a<30?'recovered':'sonic';sonic.frame=a<30?cycle(8,2):11;shadow.frame=20;
  }
  if(past('nod')){sonic.x=shadowX-88;sonic.action='nod';sonic.frame=12+Math.floor(since('nod')/7)%6;shadow.frame=20;}
  if(b==='annoy'){shadow.action='annoyed';shadow.frame=21+Math.min(2,Math.floor(a/14));}
  if(b==='swing'){shadow.action='swing';shadow.frame=24+Math.min(3,Math.floor(a/9));shadow.flip=shadow.frame>=25;}
  if(b==='realize'){sonic.action='confused';sonic.frame=18+Math.min(5,Math.floor(a/10));sonic.y=roof-ease(a/50)*16;shadow.action='smirk';shadow.frame=28;shadow.flip=true;}
  if(b==='vanish'){sonic.action='confused';sonic.frame=22+cycle(2,4);sonic.y=roof-16-a*.3;sonic.alpha=1-ease(a/18);sonic.visible=a<20;shadow.action='smirk';shadow.frame=28;shadow.flip=true;}
  if(b==='sigh'||b==='end'){shadow.action='sigh';shadow.frame=b==='end'?31:a<22?29:a<42?30:31;shadow.flip=true;sonic.visible=false;}
  if(b==='kick'){
   shadow.action='kick';shadow.x=mix(sx+105,sx+128,ease(a/18));shadow.y=roof-14-Math.sin(clamp(a/30)*Math.PI)*23;
   shadow.frame=a<=18?Math.min(4,Math.floor(a/4.5)):5+Math.min(2,Math.floor((a-19)/4));
   shadow.alpha=a<6?a/6:1;
  }
  if(b==='return'){
   shadow.action='land';shadow.x=mix(sx+128,shadowX,ease(a/30));shadow.y=roof-14*(1-ease(a/12));shadow.frame=8+Math.min(7,Math.floor(a/4));
  }
  if(eggman.visible){const t=since('explode');eggman.frame=t<18?4:5+Math.floor(t/9)%3;eggman.x=podX+Math.max(0,t-22)*3.6;eggman.y=roof-205-Math.min(t,22)*2.4-Math.max(0,t-22)*3.2;}
  const raised=b==='swing'?ease(a/27):0;
  const emerald={color:'yellow',visible:past('offer'),x:shadow.x-25+raised*13,y:shadow.y-36-raised*44};
  let rocket=null;
  const launch=starts.rocket,hit=starts.kick+18,impact=starts.explode;
  if(f>=launch&&f<impact){
   const from=f<=hit?{x:podX-65,y:roof-226}:contact,to=f<=hit?contact:blast;
   const t=f<=hit?(f-launch)/(hit-launch):(f-hit)/(impact-hit);
   rocket={x:mix(from.x,to.x,t),y:mix(from.y,to.y,t),angle:Math.atan2(to.y-from.y,to.x-from.x)-Math.PI,sheet:'eggman',frame:9,alpha:1};
  }
  return {beat:b,age:a,frame:f,sonic,shadow,pod,eggman,emerald,rocket,contact,blast,effects};
 }
 const api={ENDING_BEATS,createEndingScene,tickEndingScene,endingPose};
 if(typeof module!=='undefined'&&module.exports)module.exports=api;else Object.assign(root,api);
})(typeof window!=='undefined'?window:globalThis);
