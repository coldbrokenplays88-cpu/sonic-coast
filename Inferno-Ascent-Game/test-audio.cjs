const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs'),vm=require('node:vm'),path=require('node:path');
const modulePath=path.join(__dirname,'game-audio.js');
const names=['bossReveal','bossAnchor','bossStrike','bossBite','bossLaser','bossHit','bossBreak','start','jump','land','run','brake','spindashCharge','spindashRelease','boost','grind','spring','vent','pool','ring','monitor','enemy','hazard','warning','hurt','death','checkpoint','pause','menu','clear'];

// The fake models scheduled AudioParams, source lifetimes and connections: these
// are the browser-owned effects of the production audio graph, not internal mocks.
function boot({unsupported=false,rejectResume=false,suspended=false}={}){
 const instances=[];
 class Param{
  constructor(value=0){this.value=value;this.events=[];}
  write(method,value,time){assert.ok(Number.isFinite(value)&&Number.isFinite(time));if(method==='exponential')assert.ok(value>0);this.value=value;this.events.push({method,value,time});return this;}
  setValueAtTime(value,time){return this.write('set',value,time);}
  linearRampToValueAtTime(value,time){return this.write('linear',value,time);}
  exponentialRampToValueAtTime(value,time){return this.write('exponential',value,time);}
  cancelScheduledValues(time){this.events.push({method:'cancel',time});return this;}
 }
 class Node{
  constructor(context,type){this.context=context;this.kind=type;this.connections=[];this.disconnected=false;context.nodes.push(this);}
  connect(node){this.connections.push(node);return node;}
  disconnect(){this.connections=[];this.disconnected=true;}
 }
 class Source extends Node{
  constructor(context,type){super(context,type);this.frequency=new Param(440);this.playbackRate=new Param(1);context.sources.push(this);}
  start(time=0){assert.ok(Number.isFinite(time));this.startAt=time;}
  stop(time=0){assert.ok(Number.isFinite(time));this.stopAt=time;}
 }
 class AudioContext{
  constructor(){this.currentTime=0;this.sampleRate=24000;this.state=suspended?'suspended':'running';this.nodes=[];this.sources=[];this.destination={kind:'destination'};this.resumes=0;instances.push(this);}
  createGain(){const n=new Node(this,'gain');n.gain=new Param(1);return n;}
  createOscillator(){return new Source(this,'tone');}
  createBufferSource(){return new Source(this,'noise');}
  createBiquadFilter(){const n=new Node(this,'filter');n.frequency=new Param(350);n.Q=new Param(1);return n;}
  createStereoPanner(){const n=new Node(this,'pan');n.pan=new Param();return n;}
  createDynamicsCompressor(){const n=new Node(this,'limiter');for(const key of ['threshold','knee','ratio','attack','release'])n[key]=new Param();return n;}
  createBuffer(channels,length,sampleRate){assert.equal(channels,1);assert.ok(length>0&&length<=sampleRate);return {getChannelData:()=>new Float32Array(length),length,sampleRate};}
  resume(){this.resumes++;if(rejectResume)return Promise.reject(new Error('Autoplay blocked'));this.state='running';return Promise.resolve();}
  advance(seconds){this.currentTime+=seconds;for(const s of this.sources)if(!s.ended&&s.stopAt<=this.currentTime){s.ended=true;s.onended?.();}}
 }
 const window=unsupported?{}:{AudioContext};
 assert.ok(fs.existsSync(modulePath),'The original game audio module is not implemented yet');
 vm.runInNewContext(fs.readFileSync(modulePath,'utf8'),{window,console,Float32Array,Math,Promise},{filename:'game-audio.js'});
 return {window,instances,enable:()=>window.setGameSoundEnabled(true),play:(n,o)=>window.playGameSound(n,o),ctx:()=>instances[0]};
}

test('audio remains opt-in and allocates no context for muted actions',()=>{
 const a=boot();assert.equal(a.play('jump'),false);assert.equal(a.instances.length,0);
 assert.equal(a.window.setGameSoundEnabled(false),false);assert.equal(a.instances.length,0);
});
test('enabling unlocks one reusable context from the user gesture',()=>{
 const a=boot({suspended:true});assert.equal(a.enable(),true);assert.equal(a.ctx().resumes,1);
 assert.equal(a.play('jump'),true);a.enable();assert.equal(a.instances.length,1);
});
test('all named cues generate layered original sources with finite release envelopes',()=>{
 const a=boot();a.enable();
 for(const name of names){a.ctx().advance(3);const index=a.ctx().sources.length;assert.equal(a.play(name,{charge:.6,speed:20,pan:.2}),true,name);
  const sources=a.ctx().sources.slice(index);assert.ok(sources.length>=2&&sources.length<=6,name+' layering');
  for(const source of sources){assert.ok(source.stopAt>source.startAt&&source.stopAt-source.startAt<2,name+' bounded lifetime');
   const gain=source.connections.find(n=>n.kind==='gain');assert.ok(gain,name+' source envelope');
   assert.ok(gain.gain.events.some(e=>e.method==='exponential'&&e.value<=.001),name+' released to silence');
  }
 }
});
test('rapid rings and continuous movement cues cannot flood the source budget',()=>{
 const a=boot();a.enable();assert.equal(a.play('ring'),true);const initial=a.ctx().sources.length;
 for(let i=0;i<100;i++)assert.equal(a.play('ring'),false);
 assert.equal(a.ctx().sources.length,initial);
 for(let i=0;i<100;i++){a.ctx().advance(.016);for(const n of ['run','boost','grind','spindashCharge'])a.play(n,{speed:32});
  assert.ok(a.ctx().sources.filter(s=>!s.ended&&s.stopAt>a.ctx().currentTime).length<=18);
 }
});
test('important feedback interrupts movement ambience when channels are occupied',()=>{
 const a=boot();a.enable();for(const n of ['run','boost','grind','spindashCharge'])a.play(n);
 assert.equal(a.play('hurt'),true);assert.equal(a.play('checkpoint'),true);assert.equal(a.play('warning'),true);
 assert.ok(a.ctx().sources.filter(s=>!s.ended&&s.stopAt>a.ctx().currentTime).length<=18);
});
test('muting stops active sources and prevents later effects until reenabled',()=>{
 const a=boot();a.enable();a.play('clear');assert.equal(a.window.setGameSoundEnabled(false),false);
 for(const s of a.ctx().sources){assert.ok(s.stopAt<=a.ctx().currentTime+.025);assert.equal(s.disconnected,true);}
 const amount=a.ctx().sources.length;assert.equal(a.play('ring'),false);assert.equal(a.ctx().sources.length,amount);
 a.enable();assert.equal(a.play('ring'),true);assert.equal(a.instances.length,1);
});
test('ended voices disconnect and leave room for later events',()=>{
 const a=boot();a.enable();a.play('clear');const sources=[...a.ctx().sources];a.ctx().advance(3);
 for(const s of sources)assert.equal(s.disconnected,true);
 assert.equal(a.play('clear'),true);
});
test('charge strength raises the spin charge pitch without changing output limits',()=>{
 const a=boot();a.enable();a.play('spindashCharge',{charge:0});const low=a.ctx().sources.find(s=>s.kind==='tone').frequency.events[0].value;
 a.ctx().advance(1);const i=a.ctx().sources.length;a.play('spindashCharge',{charge:1});
 const high=a.ctx().sources.slice(i).find(s=>s.kind==='tone').frequency.events[0].value;assert.ok(high>low*1.5);
});
test('pool launcher uses a rising mechanical cue distinct from splash entry',()=>{
 const a=boot();a.enable();a.play('pool');
 const splash=a.ctx().sources.filter(s=>s.kind==='tone').map(s=>s.frequency.events);
 assert.ok(splash.every(events=>events.at(-1).value<events[0].value));
 a.ctx().advance(1);const i=a.ctx().sources.length;assert.equal(a.play('pool',{launch:true}),true);
 const launch=a.ctx().sources.slice(i).filter(s=>s.kind==='tone').map(s=>s.frequency.events);
 assert.ok(launch.some(events=>events.at(-1).value>events[0].value*2));
});
test('invalid options, unknown names and zero volume are harmless and silent',()=>{
 const a=boot();a.enable();assert.equal(a.play('typo'),false);assert.equal(a.play('ring',{volume:0}),false);
 assert.equal(a.ctx().sources.length,0);assert.equal(a.play('jump',{charge:NaN,speed:Infinity,pan:NaN,volume:NaN}),true);
});
test('unsupported audio fails gracefully without preventing game actions',()=>{
 const a=boot({unsupported:true});assert.equal(a.enable(),false);assert.equal(a.play('jump'),false);
});
test('an interrupted closed context is replaced without leaking old voices',()=>{
 const a=boot();a.enable();a.play('jump');const old=a.ctx();old.state='closed';
 assert.equal(a.enable(),true);assert.equal(a.instances.length,2);
 for(const s of old.sources)assert.equal(s.disconnected,true);
 assert.equal(a.play('ring'),true);
});
test('a failed graph allocation cleans already-created voices and later cues still work',()=>{
 const a=boot();a.enable();const createFilter=a.ctx().createBiquadFilter;
 a.ctx().createBiquadFilter=()=>{throw Error('Simulated exhausted device');};
 assert.equal(a.play('jump'),false);for(const s of a.ctx().sources)assert.equal(s.disconnected,true);
 a.ctx().createBiquadFilter=createFilter;assert.equal(a.play('ring'),true);
});
test('autoplay resume rejection is handled and stops pending sounds',async()=>{
 const a=boot({suspended:true,rejectResume:true});a.enable();a.play('jump');await new Promise(resolve=>setImmediate(resolve));
 assert.equal(a.play('ring'),false);for(const s of a.ctx().sources)assert.equal(s.disconnected,true);
});
