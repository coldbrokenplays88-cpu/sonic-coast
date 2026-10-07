const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const scriptPath=path.join(__dirname,'game-music.js');
const flush=()=>new Promise(resolve=>setImmediate(resolve));
function boot({unsupported=false,rejected=false,deferred=false}={}){
 const instances=[],listeners=new Map(),requests=[];
 class Audio{
  constructor(src){this.src=src;this.currentTime=0;this.volume=1;this.paused=true;this.ended=false;this.listeners=new Map();this.plays=0;this.pauses=0;instances.push(this);}
  addEventListener(name,callback){this.listeners.set(name,callback);}
  emit(name){this.listeners.get(name)?.();}
  play(){this.plays++;if(this.rejectPlay??rejected){this.paused=true;return Promise.reject(new Error('NotAllowedError'));}this.paused=false;
   if(deferred)return new Promise((resolve,reject)=>requests.push({resolve,reject}));return Promise.resolve();}
  pause(){this.pauses++;this.paused=true;}
 }
 const window={addEventListener:(name,callback)=>listeners.set(name,callback)};
 if(!unsupported)window.Audio=Audio;
 assert.ok(fs.existsSync(scriptPath),'The music lifecycle module is not implemented yet');
 vm.runInNewContext(fs.readFileSync(scriptPath,'utf8'),{window,console,Promise},{filename:'game-music.js'});
 return {window,instances,listeners,requests,audio:()=>instances[0],sync:state=>window.syncGameMusic(state),gesture:name=>listeners.get(name)?.({key:'Space'})};
}
test('music is opt-in and does not allocate or load while muted or ready',()=>{
 const a=boot();assert.equal(a.sync({enabled:false,mode:'playing'}),false);assert.equal(a.sync({enabled:true,mode:'ready'}),false);assert.equal(a.instances.length,0);
});
test('enabled gameplay creates one looped native stream with quiet capped volume',async()=>{
 const a=boot();assert.equal(a.sync({enabled:true,mode:'playing'}),true);await flush();
 assert.equal(a.audio().src,'assets/city-music.mp3');assert.equal(a.audio().loop,true);assert.equal(a.audio().volume,.3);assert.equal(a.audio().paused,false);
 assert.equal(a.audio().preload,'metadata');for(let i=0;i<100;i++)a.sync({enabled:true,mode:'playing'});
 assert.equal(a.instances.length,1);assert.equal(a.audio().plays,1);
});
test('pause and resume preserve the current playhead',async()=>{
 const a=boot();a.sync({enabled:true,mode:'playing'});await flush();a.audio().currentTime=37;
 assert.equal(a.sync({enabled:true,mode:'paused'}),false);assert.equal(a.audio().paused,true);assert.equal(a.audio().currentTime,37);
 a.sync({enabled:true,mode:'playing'});await flush();assert.equal(a.audio().paused,false);assert.equal(a.audio().currentTime,37);
});
for(const mode of ['ready','over','win'])test('music pauses in '+mode+' mode without resetting',async()=>{
 const a=boot();a.sync({enabled:true,mode:'playing'});await flush();a.audio().currentTime=71;
 a.sync({enabled:true,mode});assert.equal(a.audio().paused,true);assert.equal(a.audio().currentTime,71);
});
test('disabling sound preserves progress and reenabling resumes it',async()=>{
 const a=boot();a.sync({enabled:true,mode:'playing'});await flush();a.audio().currentTime=40;
 a.sync({enabled:false,mode:'playing'});assert.equal(a.audio().paused,true);assert.equal(a.audio().currentTime,40);
 a.sync({enabled:true,mode:'playing'});await flush();assert.equal(a.audio().paused,false);assert.equal(a.audio().currentTime,40);
});
test('explicit fresh-act restart resets once while ordinary death retry keeps time',async()=>{
 const a=boot();a.sync({enabled:true,mode:'playing'});await flush();a.audio().currentTime=90;
 a.sync({enabled:true,mode:'playing'});assert.equal(a.audio().currentTime,90);
 a.sync({enabled:true,mode:'playing',restart:true});assert.equal(a.audio().currentTime,0);assert.equal(a.instances.length,1);
});
test('reset requested while muted applies before next play',async()=>{
 const a=boot();a.sync({enabled:true,mode:'playing'});await flush();a.audio().currentTime=95;
 a.sync({enabled:false,mode:'playing',restart:true});assert.equal(a.audio().currentTime,0);assert.equal(a.audio().paused,true);
 a.sync({enabled:true,mode:'playing'});await flush();assert.equal(a.audio().currentTime,0);
});
test('volume control clamps loud values, honors zero and ignores invalid values',async()=>{
 const a=boot();assert.equal(a.window.setGameMusicVolume(.12),.12);a.sync({enabled:true,mode:'playing'});await flush();assert.equal(a.audio().volume,.12);
 a.sync({enabled:true,mode:'playing',volume:10});assert.equal(a.audio().volume,.3);
 a.window.setGameMusicVolume(0);assert.equal(a.audio().volume,0);assert.equal(a.audio().paused,false);
 assert.equal(a.window.setGameMusicVolume(NaN),0);assert.equal(a.audio().volume,0);
});
test('unsupported music leaves normal gameplay unblocked',()=>{
 const a=boot({unsupported:true});assert.equal(a.sync({enabled:true,mode:'playing'}),false);assert.equal(a.instances.length,0);
});
test('autoplay rejection is handled once and a later gesture can retry',async()=>{
 const a=boot({rejected:true});a.sync({enabled:true,mode:'playing'});await flush();
 for(let i=0;i<100;i++)assert.equal(a.sync({enabled:true,mode:'playing'}),false);assert.equal(a.audio().plays,1);
 a.audio().rejectPlay=false;a.gesture('pointerdown');await flush();assert.equal(a.audio().plays,2);assert.equal(a.audio().paused,false);
});
test('explicit gesture retry supports Sound or Play button integration',async()=>{
 const a=boot({rejected:true});a.sync({enabled:true,mode:'playing'});await flush();a.audio().rejectPlay=false;
 assert.equal(a.sync({enabled:true,mode:'playing',gesture:true}),true);await flush();assert.equal(a.audio().paused,false);
});
test('a disabled player stays paused when an earlier play promise resolves',async()=>{
 const a=boot({deferred:true});a.sync({enabled:true,mode:'playing'});a.sync({enabled:false,mode:'playing'});
 a.audio().paused=false;a.requests[0].resolve();await flush();assert.equal(a.audio().paused,true);
});
test('failed media load pauses safely and does not repeat play attempts',async()=>{
 const a=boot();a.sync({enabled:true,mode:'playing'});await flush();a.audio().emit('error');assert.equal(a.audio().paused,true);
 for(let i=0;i<50;i++)assert.equal(a.sync({enabled:true,mode:'playing',gesture:true}),false);assert.equal(a.audio().plays,1);
});
test('delayed seek applies on metadata availability',async()=>{
 const a=boot();a.sync({enabled:true,mode:'playing'});await flush();let time=45,loaded=false;
 Object.defineProperty(a.audio(),'currentTime',{get:()=>time,set:value=>{if(!loaded)throw Error('No seek yet');time=value;}});
 a.sync({enabled:true,mode:'playing',restart:true});assert.equal(time,45);loaded=true;a.audio().emit('loadedmetadata');assert.equal(time,0);
});
