const {test}=require('node:test'),assert=require('node:assert/strict');
const {ENDING_BEATS,createEndingScene,tickEndingScene,endingPose}=require('./ending-scene.js');
function playback(){const s=createEndingScene({x:1000,y:-500},{x:1600},{x:1210,y:-1005,zoom:.8}),frames=[];while(!s.done){frames.push(endingPose(s));tickEndingScene(s);}return frames;}
const frames=playback(),at=(beat,age)=>frames.find(p=>p.beat===beat&&p.age===age),key=a=>a.sheet+':'+a.frame;
function longestHold(poses,cel){let n=0,max=0;for(const p of poses){n=key(p.sonic)===cel?n+1:0;max=Math.max(max,n);}return max;}
// Pin reviewed storyboard keys and readable exposures. Cel count and successful
// execution cannot substitute for visual review of the actual character acting.
test('Sonic notices the interception and holds the existing strong disappointed face',()=>{
 const reaction=frames.filter(p=>['kick','return','explode','jetpack'].includes(p.beat));
 assert.equal(at('return',10).sonic.action,'disappointed','reaction should begin while the reflected rocket travels');
 assert.ok(longestHold(reaction,'sonic-polish:5')>=24,'clear frown needs at least .4 seconds, not a six-tick flash');
 assert.ok(longestHold(reaction,'sonic:8')>=60,'original disappointed side-eye must read through Eggman escaping');
 assert.ok(reaction.filter(p=>p.sonic.action==='disappointed').every(p=>!['sonic-polish:0','sonic-polish:1','sonic-polish:2'].includes(key(p.sonic))),'no smiling blink during disappointment');
});
test('Sonic accepts the offer with his original broad shrug and energetic nod gestures',()=>{
 const offer=frames.filter(p=>p.beat==='offer');
 assert.ok(longestHold(offer,'sonic:11')>=24,'original two-handed shrug needs a readable hold');
 const keys=new Set(frames.filter(p=>p.beat==='nod').map(p=>key(p.sonic)));
 for(const cel of ['sonic:10','sonic:11','sonic:13','sonic:14','sonic-polish:12','sonic-polish:15','sonic-polish:16','sonic-polish:17'])assert.ok(keys.has(cel),'keep clean expressive aside / closed-eye nod key '+cel);
 assert.ok(frames.filter(p=>['annoy','swing'].includes(p.beat)).every(p=>p.sonic.action==='nod'),'Sonic stays obliviously cocky until the charge');
});
test('Sonic never exposes the original nod drawings with three glove hands',()=>{
 const malformed=new Set(['sonic:12','sonic:15','sonic:16','sonic:17']);
 assert.ok(frames.every(p=>!malformed.has(key(p.sonic))),'source inspection confirms hip fist, chest fist and open palm in these original cels');
});
test('the Emerald remains on the same screen side through Shadow’s relieved sigh',()=>{
 const fs=require('node:fs'),vm=require('node:vm');
 const metadata=vm.runInNewContext(fs.readFileSync(__dirname+'/ending-frames.js','utf8')+';'+fs.readFileSync(__dirname+'/ending-polish-frames.js','utf8')+';endingFrames');
 const sigh=frames.filter(p=>p.beat==='sigh');
 for(const q of sigh){const d=metadata[q.shadow.sheet][q.shadow.frame];if(d.gem)assert.ok((d.gem[0]-d.anchor[0])*(q.shadow.flip?-1:1)<0,'the held gem must stay in the front screen-left hand at sigh '+q.age);}
});
test('confusion and teleport use reviewed original faces, never the malformed floating cel',()=>{
 const reactions=frames.filter(p=>['realize','vanish'].includes(p.beat)&&p.sonic.visible),keys=new Set(reactions.map(p=>key(p.sonic)));
 for(const i of [18,19,20,21,22,23])assert.ok(keys.has('sonic:'+i),'keep expressive original confusion key '+i);
 assert.ok(reactions.every(p=>p.sonic.action==='confused'));
 assert.ok(frames.every(p=>key(p.sonic)!=='sonic-polish:23'),'supplemental 23 has a duplicated eye-shaped white region in source artwork');
});
test('Shadow becomes annoyed, raises the caught Emerald and ends in original relieved rest',()=>{
 const annoyed=new Set(frames.filter(p=>p.beat==='annoy').map(p=>key(p.shadow)));
 assert.ok(annoyed.has('shadow:23'),'retain original strongest annoyed expression before tossing');
 const charge=at('swing',65);assert.equal(charge.emerald.phase,'held');assert.equal(charge.effects.teleport,true);
 assert.ok(charge.shadow.sheet==='shadow'&&[26,27].includes(charge.shadow.frame)&&charge.shadow.flip,'caught Emerald arm rises above the head to activate Chaos Control');
 const finish=at('end',20);assert.equal(key(finish.shadow),'shadow:31');assert.equal(finish.shadow.flip,true);assert.equal(finish.sonic.visible,false);
});
test('refinement keeps full length, story beats and all nine sound cues',()=>{
 assert.equal(ENDING_BEATS.reduce((n,b)=>n+b.duration,0),966);
 const s=createEndingScene({x:1000,y:-500},{x:1600},{x:1210,y:-1005,zoom:.8}),events=[];while(!s.done){tickEndingScene(s);events.push(...s.events);}
 assert.equal(events.length,9);assert.equal(new Set(events).size,9);
});
