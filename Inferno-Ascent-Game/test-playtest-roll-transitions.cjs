const {test}=require('node:test');
const assert=require('node:assert/strict');
const {boot}=require('./test-support.cjs');

test('shared momentum countersteering uncurls at speed, using standing brake and preserving the anchor',()=>{
 const a=boot();
 for(const side of [-1,1]){
  a.run(`var q=createMotionPlayer('flat');Object.assign(q,{x:0,speed:${14*side},posture:'rolling'});stepMotionPlayer(q,{direction:${-side}})`);
  assert.equal(a.run('q.posture'),'standing');
  assert.ok(Math.abs(a.run('q.speed')-side*13.5)<1e-8);
  assert.equal(a.run('motionContact(q).anchor.y'),400);
  assert.equal(a.run('q.braking'),true);
 }
});

test('ground, curved-path and moving-platform landings prefer standing instead of restoring a stale roll',()=>{
 const a=boot();
 for(const scenario of ['flat','loop','platforms']){
  a.run(`var q=createMotionPlayer('${scenario}');q.posture='rolling';q.speed=0;releaseMotion(q,'jump',true);q.air.restorePosture='rolling'`);
  if(scenario==='platforms'){
   a.run(`var deck=experimentalPlatformPose(motionFixtures.platforms.platforms[0],q.ticks);q.x=(deck.x1+deck.x2)/2;q.y=deck.y1-40;q.air.vx=deck.vx;q.air.vy=12;`);
  }else a.run('q.air.vy=5');
  a.run(`for(let i=0;i<25&&q.mode==='airborne';i++)stepMotionPlayer(q,{})`);
  assert.equal(a.run('q.mode'),'grounded',scenario);
  assert.equal(a.run('q.posture'),'standing',scenario);
 }
});

test('standing brake respects low-ceiling clearance and held Down cannot undo a valid uncurl',()=>{
 const a=boot();
 a.run(`var q=createMotionPlayer('ceiling');Object.assign(q,{x:300,speed:10,posture:'rolling'});stepMotionPlayer(q,{direction:-1})`);
 assert.equal(a.run('q.posture'),'rolling');
 a.run(`q=createMotionPlayer('flat');q.speed=14;q.posture='rolling';for(let i=0;i<5;i++)stepMotionPlayer(q,{direction:-1,down:true})`);
 assert.equal(a.run('q.posture'),'standing');
});
