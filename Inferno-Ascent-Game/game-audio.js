/* Original procedural sound palette. No samples, external audio or copied songs.
   Keep this script before game.js. Sound starts disabled and unlocks on a click. */
(function (root) {
 'use strict';
 const MAX_VOICES=18, MAX_EVENTS=8, MASTER_LEVEL=.22;
 let enabled=false, context=null, master=null, noiseBuffer=null, pendingResume=null;
 const active=new Set(), lastPlayed=new Map();
 const clamp=(value,min,max,fallback)=>Number.isFinite(value)?Math.max(min,Math.min(max,value)):fallback;
 const tone=(from,to,duration,amplitude,type='triangle',delay=0)=>({from,to,duration,amplitude,type,delay});
 const hiss=(from,to,duration,amplitude,delay=0,filter='bandpass')=>({from,to,duration,amplitude,delay,noise:true,filter});

 // Short attacks give tactile cues; quieter noise underlies movement instead of
 // a competing melody. Frequencies and note sequences are authored for this game.
 const cues={
  start:{interval:.5,priority:2,voices:()=>[
   tone(340,345,.13,.24,'triangle'),tone(430,438,.15,.23,'triangle',.085),
   tone(540,552,.18,.21,'triangle',.17),tone(675,680,.26,.22,'sine',.255)]},
  jump:{interval:.075,priority:2,voices:()=>[
   tone(270,820,.14,.25,'square'),tone(960,570,.1,.16,'sine',.035),hiss(1500,3100,.06,.11)]},
  land:{interval:.1,priority:1,voices:()=>[
   tone(125,53,.085,.24,'triangle'),hiss(1050,180,.075,.17,0,'lowpass')]},
  run:{interval:.16,priority:0,voices:o=>[
   tone(92+o.speed*45,56,.055,.07,'triangle'),hiss(1200+o.speed*900,500,.055,.07)]},
  brake:{interval:.16,priority:0,voices:o=>[
   tone(1180+o.speed*900,470,.14,.075,'square'),hiss(3500,1100,.15,.16)]},
  spindashCharge:{interval:.12,priority:0,voices:o=>[
   tone(185+o.charge*540,280+o.charge*790,.12,.19,'sawtooth'),
   tone(285+o.charge*650,385+o.charge*920,.1,.12,'triangle',.014),hiss(1100,2200,.075,.08)]},
  spindashRelease:{interval:.16,priority:2,voices:o=>[
   tone(800+o.charge*600,170,.26,.26,'sawtooth'),tone(280,76,.18,.24,'triangle'),
   hiss(4300,700,.25,.23,0,'highpass')]},
  boost:{interval:.2,priority:0,voices:o=>[
   tone(140+o.speed*110,96,.19,.11,'sawtooth'),tone(450,630,.18,.07,'triangle'),
   hiss(2100,4400,.2,.18,0,'highpass')]},
  grind:{interval:.19,priority:0,voices:o=>[
   tone(1050+o.speed*800,870,.13,.065,'square'),tone(1670,1830,.095,.055,'triangle',.025),
   hiss(3200,1700,.16,.11)]},
  spring:{interval:.12,priority:2,voices:()=>[
   tone(170,1170,.22,.27,'triangle'),tone(690,1460,.18,.14,'square',.035),
   tone(1120,690,.13,.12,'sine',.12)]},
  vent:{interval:.18,priority:2,voices:()=>[
   hiss(360,2300,.31,.3,0,'lowpass'),tone(96,250,.25,.18,'triangle'),hiss(2600,4900,.2,.1,.06,'highpass')]},
  pool:{interval:.25,priority:2,voices:o=>o.launch?[
   tone(160,1130,.25,.24,'triangle'),tone(510,1440,.19,.13,'square',.04),
   hiss(420,3100,.26,.26,0,'lowpass'),hiss(2800,900,.16,.12,.11)]:[
   hiss(600,210,.27,.27,0,'lowpass'),tone(720,130,.11,.16,'sine'),
   tone(470,105,.12,.14,'sine',.065),tone(290,85,.14,.12,'sine',.12)]},
  ring:{interval:.045,priority:2,voices:()=>[
   tone(1515,1523,.18,.21,'sine'),tone(2175,2188,.16,.13,'sine',.025)]},
  monitor:{interval:.18,priority:3,voices:()=>[
   hiss(2200,500,.1,.21),tone(245,73,.09,.23,'triangle'),
   tone(720,738,.18,.2,'square',.055),tone(1160,1180,.24,.17,'sine',.115)]},
  enemy:{interval:.065,priority:2,voices:()=>[
   tone(210,52,.12,.28,'square'),hiss(2800,340,.18,.25),tone(430,90,.085,.1,'triangle',.015)]},
  hazard:{interval:.12,priority:2,voices:()=>[
   hiss(1800,320,.2,.24),tone(160,42,.17,.23,'triangle'),tone(670,210,.07,.09,'square')]},
  warning:{interval:.3,priority:3,voices:()=>[
   tone(590,530,.09,.22,'square'),tone(750,670,.09,.23,'square',.12),
   tone(970,870,.12,.2,'triangle',.24)]},
  hurt:{interval:.22,priority:3,voices:()=>[
   tone(420,84,.25,.29,'sawtooth'),tone(940,160,.2,.17,'square',.012),hiss(3100,700,.18,.23)]},
  death:{interval:.6,priority:4,voices:()=>[
   tone(380,155,.3,.24,'triangle'),tone(235,66,.4,.24,'square',.2),
   tone(120,38,.45,.18,'triangle',.43),hiss(950,150,.25,.11,.3,'lowpass')]},
  checkpoint:{interval:.4,priority:3,voices:()=>[
   tone(570,582,.17,.23,'triangle'),tone(855,876,.21,.2,'sine',.08),
   tone(1080,1100,.27,.18,'sine',.16),tone(1440,1456,.22,.09,'sine',.21)]},
  pause:{interval:.15,priority:2,voices:()=>[
   tone(520,500,.11,.18,'triangle'),tone(355,340,.15,.15,'sine',.07)]},
  menu:{interval:.075,priority:2,voices:()=>[
   tone(470,610,.075,.18,'triangle'),tone(810,830,.09,.12,'sine',.025)]},
  clear:{interval:1.2,priority:4,voices:()=>[
   tone(355,358,.2,.22,'triangle'),tone(475,480,.23,.2,'triangle',.12),
   tone(620,624,.24,.2,'triangle',.25),tone(785,794,.31,.2,'triangle',.38),
   tone(1045,1055,.45,.19,'sine',.54),tone(1310,1325,.4,.11,'sine',.63)]}
 };

 function disconnect(node){try{node.disconnect();}catch{}}
 function cleanEvent(event,stop=false){
  if(event.cleaned)return;
  event.cleaned=true;active.delete(event);
  if(stop)for(const source of event.sources){source.onended=null;try{source.stop(context.currentTime);}catch{}}
  for(const node of event.nodes)disconnect(node);
 }
 function mute(){
  enabled=false;lastPlayed.clear();
  if(master&&context){
   try{master.gain.cancelScheduledValues(context.currentTime);master.gain.setValueAtTime(0,context.currentTime);}catch{}
  }
  for(const event of [...active])cleanEvent(event,true);
 }
 function unlock(){
  if(context.state==='running'||pendingResume)return;
  // Calling resume immediately inside the Sound button gesture is required on
  // Safari/iPad; never await a promise before initiating it. Every rejection is caught.
  try{
   pendingResume=Promise.resolve(context.resume()).catch(()=>{mute();}).finally(()=>{pendingResume=null;});
  }catch{mute();}
 }
 function prepare(){
  if(context&&context.state!=='closed')return true;
  if(context)mute();
  const Context=root.AudioContext||root.webkitAudioContext;
  if(!Context)return false;
  try{
   context=new Context();master=context.createGain();master.gain.setValueAtTime(0,context.currentTime);
   if(context.createDynamicsCompressor){
    const limiter=context.createDynamicsCompressor();limiter.threshold.value=-18;limiter.knee.value=10;
    limiter.ratio.value=5;limiter.attack.value=.003;limiter.release.value=.12;
    master.connect(limiter);limiter.connect(context.destination);
   }else master.connect(context.destination);
   noiseBuffer=null;pendingResume=null;lastPlayed.clear();return true;
  }catch{context=null;master=null;return false;}
 }
 function setGameSoundEnabled(value){
  if(!value){mute();return false;}
  if(!prepare()){mute();return false;}
  enabled=true;
  try{master.gain.cancelScheduledValues(context.currentTime);master.gain.setValueAtTime(MASTER_LEVEL,context.currentTime);unlock();}
  catch{mute();}
  return enabled;
 }
 function getNoise(){
  if(noiseBuffer)return noiseBuffer;
  noiseBuffer=context.createBuffer(1,Math.ceil(context.sampleRate*.45),context.sampleRate);
  const data=noiseBuffer.getChannelData(0);let seed=0x5eab431;
  for(let i=0;i<data.length;i++){seed=(Math.imul(seed,1664525)+1013904223)>>>0;data[i]=(seed/4294967296)*2-1;}
  return noiseBuffer;
 }
 function addVoice(event,voice,options,now,bus){
  const source=voice.noise?context.createBufferSource():context.createOscillator();
  event.sources.push(source);event.nodes.push(source);
  const envelope=context.createGain();event.nodes.push(envelope);
  const begin=now+voice.delay, end=begin+voice.duration;
  const attack=Math.min(.008,voice.duration*.15),peak=voice.amplitude*options.volume;
  envelope.gain.setValueAtTime(.0001,begin);
  envelope.gain.linearRampToValueAtTime(peak,begin+attack);
  envelope.gain.exponentialRampToValueAtTime(Math.max(.0001,peak*.55),begin+voice.duration*.45);
  envelope.gain.exponentialRampToValueAtTime(.0001,end);
  source.connect(envelope);
  if(voice.noise){
   source.buffer=getNoise();source.loop=true;
   const filter=context.createBiquadFilter();event.nodes.push(filter);filter.type=voice.filter;
   filter.Q.value=voice.filter==='bandpass'?.8:.55;
   filter.frequency.setValueAtTime(voice.from,begin);filter.frequency.exponentialRampToValueAtTime(voice.to,end);
   envelope.connect(filter);filter.connect(bus);
  }else{
   source.type=voice.type;source.frequency.setValueAtTime(voice.from,begin);
   source.frequency.exponentialRampToValueAtTime(voice.to,end);envelope.connect(bus);
  }
  source.onended=()=>{
   disconnect(source);disconnect(envelope);
   event.remaining--;if(event.remaining===0)cleanEvent(event);
  };
  source.start(begin);source.stop(end+.018);event.end=Math.max(event.end,end+.02);
 }
 function makeRoom(size,priority,now){
  for(const event of [...active])if(event.end<=now)cleanEvent(event);
  let voices=0;for(const event of active)voices+=event.remaining;
  while(voices+size>MAX_VOICES||active.size>=MAX_EVENTS){
   // Important cues may replace older cues of the same importance. Ambient
   // motion never replaces a ring, warning, impact or checkpoint chime.
   let victim=null;
   for(const event of active)if(event.priority<priority||event.priority===priority&&priority>=2){
    if(!victim||event.priority<victim.priority)victim=event;
   }
   if(!victim)return false;
   voices-=victim.remaining;cleanEvent(victim,true);
  }
  return true;
 }
 function playGameSound(name,options={}){
  const cue=Object.prototype.hasOwnProperty.call(cues,name)?cues[name]:null;
  if(!enabled||!context||!cue||context.state==='closed')return false;
  options=options&&typeof options==='object'?options:{};
  const opts={volume:clamp(options.volume,0,1,1),charge:clamp(options.charge,0,1,0),
   speed:clamp(Math.abs(options.speed),0,32,0)/32,pan:clamp(options.pan,-1,1,0),launch:options.launch===true};
  if(opts.volume===0)return false;
  const now=context.currentTime;
  if(now-(lastPlayed.get(name)??-Infinity)<cue.interval)return false;
  const voices=cue.voices(opts);
  if(!makeRoom(voices.length,cue.priority,now))return false;
  const event={sources:[],nodes:[],remaining:voices.length,end:now,priority:cue.priority,cleaned:false};
  try{
   unlock();if(!enabled)return false;
   let bus=master;
   if(context.createStereoPanner){bus=context.createStereoPanner();bus.pan.setValueAtTime(opts.pan,now);bus.connect(master);event.nodes.push(bus);}
   active.add(event);
   for(const voice of voices)addVoice(event,voice,opts,now,bus);
   lastPlayed.set(name,now);return true;
  }catch{cleanEvent(event,true);return false;}
 }
 root.setGameSoundEnabled=setGameSoundEnabled;
 root.playGameSound=playGameSound;
})(window);
