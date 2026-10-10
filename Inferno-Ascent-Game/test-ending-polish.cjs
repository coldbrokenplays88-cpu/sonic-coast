const {test}=require('node:test'),assert=require('node:assert/strict');
const {ENDING_BEATS,createEndingScene,tickEndingScene,endingPose}=require('./ending-scene.js');
function at(beat,age=0){const s=createEndingScene({x:1000,y:-500},{x:1600},{x:1210,y:-1005,zoom:.8});while(s.beat!==beat)tickEndingScene(s);for(let i=0;i<age;i++)tickEndingScene(s);return endingPose(s);}
test('long holds include authored blink and reaction cels',()=>{
 const poses=new Set(Array.from({length:108},(_,a)=>{const p=at('escape',a).sonic;return p.sheet+':'+p.frame;}));
 assert.ok(poses.size>=4,'Sonic must blink and settle instead of holding one drawing');
 assert.equal(at('explode',3).sonic.sheet,'sonic-polish');
 assert.equal(at('rocket',4).pod.sheet,'eggman-polish');
});
test('the landing stays airborne until horizontal travel ends',()=>{
 const roof=-500;
 for(let a=0;a<29;a++){
  const now=at('return',a).shadow,next=at('return',a+1).shadow;
  if(now.y>=roof-.5)assert.ok(Math.abs(next.x-now.x)<.5,'planted feet must not slide along the roof');
 }
 assert.equal(at('return',26).shadow.y,roof);
 assert.equal(at('return',26).shadow.sheet,'shadow-polish');
});
test('Shadow turns through a three-quarter pose after landing',()=>{
 assert.equal(at('explode',0).shadow.sheet,'shadow-polish');
 assert.equal(at('explode',0).shadow.frame,8);
 assert.equal(at('explode',7).shadow.frame,9);
});
test('the rocket interception lands on the forward boot instead of the torso',()=>{
 const p=at('kick',18),fs=require('node:fs'),vm=require('node:vm');
 const d=vm.runInNewContext(fs.readFileSync('ending-frames.js','utf8')+';endingFrames.shadow[4]');
 const [l,t,r,b]=d.bounds,w=Math.ceil((r-l)*d.scale),h=Math.ceil((b-t)*d.scale),ratio=1.25;
 const boot={x:p.shadow.x+((905-l)/(r-l)*w-Math.round((d.anchor[0]-l)*d.scale))*ratio,y:p.shadow.y+((95-t)/(b-t)*h-h)*ratio};
 assert.ok(Math.hypot(p.contact.x-boot.x,p.contact.y-boot.y)<3,'impact must meet the sole at the preserved kick key pose');
});
test('Emerald release, flight and catch stay distinct from Chaos Control',()=>{
 const flight=[];for(let a=0;a<ENDING_BEATS.find(b=>b.name==='swing').duration;a++){
  const p=at('swing',a);assert.equal(p.sonic.action,'nod');
  if(p.emerald.phase==='airborne'){flight.push(p);assert.equal(p.effects.teleport,false,'teleport begins after catching the gem');}
 }
 assert.ok(flight.length>=20,'the gem must have a readable airborne arc');
 assert.equal(flight[0].emerald.progress,0);assert.equal(flight.at(-1).emerald.progress,1);
 assert.ok(Math.min(...flight.map(p=>p.emerald.y))<flight[0].emerald.y-20,'toss must rise above the release hand');
 const final=at('swing',ENDING_BEATS.find(b=>b.name==='swing').duration-1);
 assert.equal(final.emerald.phase,'held');assert.equal(final.effects.teleport,true);
});
test('new acting cels preserve nodding, yellow Emerald and the original duration',()=>{
 assert.equal(ENDING_BEATS.reduce((n,b)=>n+b.duration,0),966);
 const frames=new Set();for(let a=0;a<48;a++){const p=at('nod',a);assert.equal(p.sonic.sheet,'sonic-polish');frames.add(p.sonic.frame);}
 assert.ok(frames.size>=5);assert.equal(at('offer',50).emerald.color,'yellow');
 assert.equal(at('kick',18).effects.kick,true);assert.equal(at('sigh',40).sonic.visible,false);
});
