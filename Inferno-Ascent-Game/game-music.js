/* User-supplied music, streamed through one native media element.
   Sound is opt-in. This adds no Web Audio nodes and keeps pause positions. */
(function(root){
 'use strict';
 const SOURCES={1:'assets/neon-express-act1-music.mp3',2:'assets/city-music.mp3'},MAX_VOLUME=.3;
 let source=SOURCES[2];
 let player=null,wanted=false,blocked=false,failed=false,pending=null;
 let volume=MAX_VOLUME,resetPending=false,generation=0;

 function pause(){if(player)try{player.pause();}catch{}}
 function applyReset(){
  if(!player||!resetPending)return;
  try{player.currentTime=0;resetPending=false;}catch{}
 }
 function prepare(){
  if(player)return true;
  if(failed||typeof root.Audio!=='function')return false;
  try{
   player=new root.Audio(source);player.loop=true;player.preload='metadata';player.volume=volume;
   player.addEventListener('error',()=>{failed=true;blocked=false;pause();});
   player.addEventListener('loadedmetadata',applyReset);
   applyReset();return true;
  }catch{failed=true;player=null;return false;}
 }
 function attemptPlay(){
  if(!wanted||blocked||failed||!prepare())return false;
  if(pending||!player.paused&&!player.ended)return true;
  applyReset();
  const request={generation};pending=request;
  try{
   // Initiate play synchronously when called by a user gesture. Handle rejection
   // once, then wait for a genuine later gesture instead of retrying every frame.
   const result=player.play();
   Promise.resolve(result).then(()=>{
    if(!wanted||failed)pause();
   },()=>{
    // An intentional pause may abort an old play request. It must not block a
    // newer playing state; an autoplay failure in the current state does block.
    if(request.generation===generation&&wanted&&!failed)blocked=true;
   }).finally(()=>{
    if(pending===request)pending=null;
    if(request.generation!==generation&&wanted&&!blocked&&!failed)attemptPlay();
   });
   return true;
  }catch{pending=null;blocked=true;return false;}
 }
 function setGameMusicVolume(value){
  if(Number.isFinite(value))volume=Math.max(0,Math.min(MAX_VOLUME,value));
  if(player)try{player.volume=volume;}catch{}
  return volume;
 }
 function syncGameMusic(state={}){
  state=state&&typeof state==='object'?state:{};
  const requested=SOURCES[state.act]||source;
  if(requested!==source){generation++;source=requested;blocked=false;failed=false;resetPending=true;pause();if(player){player.src=source;try{player.load?.();}catch{}applyReset();}}
  const next=state.enabled===true&&state.mode==='playing';
  if(next!==wanted){generation++;blocked=false;}
  wanted=next;
  if(Number.isFinite(state.volume))setGameMusicVolume(state.volume);
  if(state.restart===true){generation++;resetPending=true;applyReset();}
  if(!wanted){pause();return false;}
  if(state.gesture===true)blocked=false;
  return attemptPlay();
 }
 function retryFromGesture(){
  if(!wanted||failed)return;
  blocked=false;attemptPlay();
 }
 // These also handle an iPad returning from an interrupted media session. They
 // never enable Sound, start a ready level, or restart an already-playing song.
 if(typeof root.addEventListener==='function'){
  root.addEventListener('pointerdown',retryFromGesture,{capture:true,passive:true});
  root.addEventListener('keydown',retryFromGesture,{capture:true,passive:true});
 }
 root.syncGameMusic=syncGameMusic;
 root.setGameMusicVolume=setGameMusicVolume;
})(window);
