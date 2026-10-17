const {test}=require('node:test');
const assert=require('node:assert/strict');
const {boot}=require('./test-support.cjs');
function scene(){const a=boot();a.run(`selectAct('playtest');start()`);return a;}
const json=(a,s)=>JSON.parse(a.run(`JSON.stringify(${s})`));
test('connected path joins share positions and tangents without replacing speed',()=>{
 const a=scene();for(const fixture of ['loop','loop-wide','wall-ceiling']){
 a.run(`var q=createMotionPlayer('${fixture}'),path=motionFixtures[q.scenario].path`);
 for(const end of json(a,'path.pieces.slice(0,-1).map(p=>p.end)')){a.run(`var l=samplePath(path,${end}-1e-6),r=samplePath(path,${end}+1e-6)`);assert.ok(a.run('Math.hypot(l.x-r.x,l.y-r.y)')<0.00001);assert.ok(a.run('Math.hypot(l.tx-r.tx,l.ty-r.ty)')<0.00001);}
 }
});
test('earned ordinary running traverses standard loops in either direction; faster entries finish sooner',()=>{
 const a=scene();for(const fixture of ['loop','loop-wide'])for(const direction of [-1,1]){
 const times=[];for(const speed of [14,24]){a.run(`var q=createMotionPlayer('${fixture}'),path=motionFixtures[q.scenario].path;Object.assign(q,{pathS:${direction}>0?path.entry-20:path.exit+20,speed:${direction*speed}});syncPathPlayer(q);var done=0;for(let i=1;i<=240;i++){stepMotionPlayer(q,{direction:${direction}});if(q.mode==='grounded'&&(${direction}>0?q.pathS>path.exit+30:q.pathS<path.entry-30)){done=i;break}if(q.boundary)break}`);assert.ok(a.run('done')>0,`${fixture} dir${direction} v${speed} must finish without boost`);assert.equal(a.run('q.transitionCount'),0);times.push(a.run('done'));}assert.ok(times[1]<times[0]);
 }
 a.run(`q=createMotionPlayer('loop');var completed=false;for(let i=0;i<300;i++){stepMotionPlayer(q,{direction:1});if(q.mode==='grounded'&&q.pathS>motionFixtures.loop.path.exit+30){completed=true;break}}`);assert.equal(a.run('completed'),true,'actual flat acceleration earns the entry speed');
});
test('low entry rolls back or detaches without floor grip leaking onto walls and ceilings',()=>{
 const a=scene();for(const direction of [-1,1]){a.run(`var q=createMotionPlayer('loop'),path=motionFixtures.loop.path;Object.assign(q,{pathS:${direction}>0?path.entry+2:path.exit-2,speed:${direction*3},posture:'rolling'});syncPathPlayer(q);var failed=false;for(let i=0;i<120;i++){stepMotionPlayer(q,{});if(q.mode==='airborne'||q.speed*${direction}<0){failed=true;break}}`);assert.equal(a.run('failed'),true);}
 a.run(`q=createMotionPlayer('wall-ceiling');path=motionFixtures[q.scenario].path;Object.assign(q,{pathS:path.ceiling,speed:1});syncPathPlayer(q);stepMotionPlayer(q,{})`);assert.equal(a.run('q.mode'),'airborne');assert.match(a.run('q.latestTransition'),/support|traction/);
});
test('jumping from curved walls and ceiling preserves tangent momentum and outward impulse',()=>{
 const a=scene();for(const direction of [-1,1])for(const fraction of [0.25,0.5,0.75]){a.run(`var q=createMotionPlayer('loop'),path=motionFixtures.loop.path;Object.assign(q,{pathS:path.entry+(path.exit-path.entry)*${fraction},speed:${direction*16}});syncPathPlayer(q);var before=motionContact(q);stepMotionPlayer(q,{jumpPressed:true,jumpHeld:true});`);const c=json(a,'before'),t=json(a,'q.lastTakeoff');assert.equal(a.run('q.mode'),'airborne');assert.ok(Math.abs(t.after.vx-c.vx-10.5*c.nx)<1e-8);assert.ok(Math.abs(t.after.vy-c.vy-10.5*c.ny)<1e-8);assert.equal(a.run('q.ticks'),1);}
});
test('connected walls and straight ceiling traverse both directions with conditional grip',()=>{
 const a=scene();for(const direction of [-1,1]){a.run(`var q=createMotionPlayer('wall-ceiling'),path=motionFixtures[q.scenario].path;Object.assign(q,{pathS:${direction}>0?path.entry-20:path.exit+20,speed:${direction*24}});syncPathPlayer(q);var seenCeiling=false,done=false;for(let i=0;i<260;i++){stepMotionPlayer(q,{direction:${direction}});if(q.mode==='grounded'&&motionContact(q).ny>0.99)seenCeiling=true;if(q.mode==='grounded'&&(${direction}>0?q.pathS>path.exit+30:q.pathS<path.entry-30)){done=true;break}if(q.boundary)break}`);assert.equal(a.run('seenCeiling'),true);assert.equal(a.run('done'),true);}
});
test('detachment reattaches without speed gifts or rapid chatter; path state clears on lifecycle changes',()=>{
 const a=scene();a.run(`var q=createMotionPlayer('loop'),path=motionFixtures.loop.path;Object.assign(q,{pathS:path.entry+(path.exit-path.entry)/2,speed:1});syncPathPlayer(q);for(let i=0;i<140;i++)stepMotionPlayer(q,{});`);assert.ok(a.run('q.lastLanding'));assert.ok(a.run('q.transitionCount')<=3);const l=json(a,'q.lastLanding');assert.ok(Math.abs(l.speed)<=Math.hypot(l.incoming.vx,l.incoming.vy)+1e-7);
 a.run(`selectAct('playtest');start();document.querySelector('#playtest-loop').onclick();press('ArrowRight',true);update();pause();start();update();restart()`);assert.equal(a.run('playtestState.player.ticks'),0);assert.equal(a.run('keys.size'),0);for(const act of [1,2]){a.run(`selectAct(${act});start()`);assert.equal(a.run('playtestState'),null);a.run(`selectAct('playtest');start()`);assert.equal(a.run('playtestState.player.pathS'),undefined);}
});
test('fast bodies hit finite arc endpoints rather than tunneling into the sector',()=>{
 const a=scene();for(const [x,y,vx,vy] of [[158,263,-32,-64],[100.5,260.01,-.4,-79]]){a.run(`var q=createMotionPlayer('wall-ceiling');Object.assign(q,{mode:'airborne',pathS:null,x:${x},y:${y},speed:null,posture:'rolling',air:{vx:${vx},vy:${vy},restorePosture:'rolling'}});var hit=firstAirImpact(q,0,0,.25)`);assert.ok(a.run('hit'),'a separating endcap plane must not skip the inward-curving face');assert.ok(a.run('hit.time')>0&&a.run('hit.time')<0.25);a.run(`stepMotionPlayer(q,{jumpHeld:true})`);assert.ok(a.run('Math.hypot(motionContact(q).vx,motionContact(q).vy)')<=Math.hypot(vx,vy)+.35,'impact cannot add velocity beyond actual gravity');}
});
test('fast standing and rolling bodies stay clear of active path material through both-direction joins',()=>{
 const a=scene();for(const fixture of ['loop','loop-wide','wall-ceiling'])for(const speed of [-60,-24,24,60])for(const posture of ['standing','rolling']){
 a.run(`var q=createMotionPlayer('${fixture}'),path=motionFixtures[q.scenario].path;Object.assign(q,{pathS:${speed}>0?path.entry-40:path.exit+40,speed:${speed},posture:'${posture}'});syncPathPlayer(q);var overlap=0;for(let i=0;i<140;i++){stepMotionPlayer(q,{direction:${Math.sign(speed)}});if(q.mode==='grounded')for(const d of pathDistances(path,motionBody(q),q.pathS))if(d.distance < -0.003)overlap++;if(q.boundary)break}`);
 assert.equal(a.run('overlap'),0,`${fixture} ${speed} ${posture}: active body penetration`);
 }
});
test('path jumps around the loop crossover separate cleanly and can land again',()=>{
 const a=scene();for(const x of [-45,-10,10,45])for(const direction of [-1,1]){
 a.run(`var q=createMotionPlayer('loop'),path=motionFixtures.loop.path;Object.assign(q,{pathS:${x}<0?path.entry+${x}:path.exit+${x},speed:${direction*14}});syncPathPlayer(q);stepMotionPlayer(q,{jumpPressed:true,jumpHeld:true});for(let i=0;i<80;i++){stepMotionPlayer(q,{jumpHeld:i<10});if(q.boundary)break}`);
 assert.ok(a.run('q.lastTakeoff'));assert.ok(a.run('q.transitionCount')<8,'no rapid contact chatter at the crossover');
 }
});
test('a no-input loop traversal accounts for friction work and repeated entry needs no reset',()=>{
 const a=scene();a.run(`var q=createMotionPlayer('loop'),path=motionFixtures.loop.path;Object.assign(q,{pathS:path.entry-20,speed:24});syncPathPlayer(q);var energy0=q.speed*q.speed/2+.35*(650-q.y),d0=q.distance,err=0,done=false;for(let i=0;i<160;i++){stepMotionPlayer(q,{});err=Math.max(err,Math.abs(q.speed*q.speed/2+.35*(650-q.y)-energy0+.1*(q.distance-d0)));if(q.mode==='grounded'&&q.pathS>path.exit+30){done=true;break}}`);assert.equal(a.run('done'),true);assert.ok(a.run('err')<0.05,'joins/contact must not add unexplained energy');
 a.run(`var reverseDone=false;for(let i=0;i<400;i++){stepMotionPlayer(q,{direction:-1});if(q.mode==='grounded'&&q.pathS<path.entry-30){reverseDone=true;break}if(q.boundary)break}`);assert.equal(a.run('reverseDone'),true,'same loop supports deliberate reverse re-entry');
});
test('curved traversal remains identical across rendering schedules with one simulation tick owner',()=>{
 const results=[];for(const schedule of [[1000/30],[1000/60],[1000/120],[7,23,11,39,20]]){const a=scene();a.run(`document.querySelector('#playtest-loop').onclick();press('ArrowRight',true);last=1000;acc=0`);let elapsed=0,i=0;while(elapsed<3000-1e-8){elapsed=Math.min(3000,elapsed+schedule[i++%schedule.length]);a.run(`frame(${1000+elapsed})`)}results.push(json(a,'({player:playtestState.player,frames:playtestState.frames,camera:playtestState.camera})'));}for(const r of results){assert.equal(r.player.ticks,180);assert.equal(r.frames,180);assert.deepEqual(r,results[0]);}
});
test('fast upright and rolled airborne bodies hit and reattach to curved faces in both directions',()=>{
 const a=scene();for(const fraction of [.25,.5,.75])for(const posture of ['standing','rolling'])for(const direction of [-1,1]){
 a.run(`var q=createMotionPlayer('loop'),path=motionFixtures.loop.path,s=samplePath(path,path.entry+(path.exit-path.entry)*${fraction});Object.assign(q,{mode:'airborne',pathS:null,speed:null,x:s.x+s.nx*60,y:s.y+s.ny*60,posture:'${posture}',air:{vx:s.tx*${direction*40}-s.nx*20,vy:s.ty*${direction*40}-s.ny*20,restorePosture:'${posture}'}});var overlap=0;for(let i=0;i<5;i++){stepMotionPlayer(q,{});for(const d of pathDistances(path,motionBody(q),q.mode==='grounded'?q.pathS:null))if(d.distance<-.003)overlap++;}`);
 assert.equal(a.run('overlap'),0,`${fraction} ${posture} ${direction}: air sweep penetrated track`);assert.ok(a.run('q.lastLanding'),'curved face accepts a momentum-supported reattachment');
 }
});
