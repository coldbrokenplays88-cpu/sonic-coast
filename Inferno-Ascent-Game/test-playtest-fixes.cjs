const {test}=require('node:test');
const assert=require('node:assert/strict');
const {boot}=require('./test-support.cjs');
test('skill spring decks match the spring foot width, including the moving hoist',()=>{
 const a=boot();
 for(const id of ['mid-upper-spring','mid-spring-1','mid-spring-2','mid-aim-spring','mid-left-spring','mid-moving-spring']){
  assert.equal(a.run(`surfaceById(level.springs.find(d=>d.id==='${id}').surfaceId).x2-surfaceById(level.springs.find(d=>d.id==='${id}').surfaceId).x1`),58,id);
 }
});
test('early spring jumps forgive neutral steering but the third landing needs aiming',()=>{
 const a=boot();a.run("const d=level.springs.find(d=>d.id==='mid-upper-spring');p.x=d.x;p.y=d.y-20;p.surface=surfaceById(d.surfaceId);p.ground=true;launchAirDevice(d);keys.clear();for(let i=0;i<135;i++)update()");
 assert.equal(a.run("visited.has('mid-spring-step-1')"),true);
 assert.equal(a.run("visited.has('mid-spring-step-2')"),true);
 assert.equal(a.run("visited.has('mid-spring-aim-step')"),false);
});
test('pool collision forms a connected bowl from burned tower to tilted roof',()=>{
 const a=boot();const segments=a.run('level.surfaces.filter(s=>s.poolCurve).sort((a,b)=>a.x1-b.x1)');
 assert.ok(segments.length>=16,'curved pool collision must exist');
 assert.ok(segments[0].y2>segments[0].y1);assert.ok(segments.at(-1).y2<segments.at(-1).y1);
 for(let i=1;i<segments.length;i++){assert.equal(segments[i-1].x2,segments[i].x1);assert.equal(segments[i-1].y2,segments[i].y1)}
 const roof=a.run("surfaceById('mid-tilted-glass-roof')");assert.equal(segments.at(-1).x2,roof.x1);assert.equal(segments.at(-1).y2,roof.y1);
});
test('a missed aimed spring falls naturally onto the lower roof without death',()=>{
 const a=boot();a.run("const d=level.springs.find(d=>d.id==='mid-spring-2');p.x=d.x;p.y=d.y-20;p.surface=surfaceById(d.surfaceId);p.ground=true;count=20;launchAirDevice(d);keys.clear()");
 for(let f=0;f<160;f++){a.run('update()');if(a.run('p.ground'))break}
 assert.equal(a.run('p.surface?.id'),'mid-tilted-glass-roof');assert.equal(a.run('stats.deaths'),0);
});
test('lower spring reaches the curved pool and exits by ground momentum without a midair pull',()=>{
 const a=boot();a.run("const d=level.springs.find(d=>d.id==='mid-low-spring');p.x=d.x;p.y=d.y-20;p.surface=surfaceById(d.surfaceId);p.ground=true;count=20;boost=0;launchAirDevice(d);keys.add('ArrowRight');keys.add('ArrowDown')");
 let entered=false,panel=false,exited=false;
 for(let i=0;i<260;i++){
  const before=a.run('p.x');a.run('update()');assert.ok(Math.abs(a.run('p.x')-before)<=24.01,'no scripted position pull');
  assert.ok(!a.run('p.poolTransfer'));if(a.run('p.surface?.poolCurve'))entered=true;
  if(a.run('p.poolExit')){panel=true;assert.equal(a.run('p.ground'),true,'dash panel must accelerate along the floor')}
  if(a.run("p.surface?.id==='mid-tilted-glass-roof'")){exited=true;break}
 }
 assert.ok(entered&&panel&&exited,'spring → bowl roll → dash panel → roof');assert.equal(a.run('stats.deaths'),0);
});
test('post-pool layout rises through the zigzag choice before the guard and junction stairs',()=>{
 const a=boot();const ids=['mid-pool-roof-exit','mid-low-transfer-1','mid-right-guard-roof','mid-low-transfer-2','mid-low-transfer-3'];
 const decks=ids.map(id=>a.run(`surfaceById('${id}')`));
 assert.ok(decks[1].y1<decks[0].y1,'first required jump goes upward');
 assert.ok(decks[2].y1<=decks[1].y1,'guard route is above the first transfer');
 for(const id of ['mid-secret-1','mid-secret-2','mid-secret-3','mid-secret-4'])assert.ok(a.run(`surfaceById('${id}').secretDepth<=4`));
 assert.ok(a.run("surfaceById('mid-secret-2').x1<surfaceById('mid-secret-1').x1"));
 assert.ok(a.run("surfaceById('mid-secret-3').x1>surfaceById('mid-secret-2').x1"));
});
