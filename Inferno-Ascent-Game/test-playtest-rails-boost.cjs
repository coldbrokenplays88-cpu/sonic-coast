const {test}=require('node:test'),assert=require('node:assert/strict');
const {boot}=require('./test-support.cjs');
function scene(){const a=boot();a.run(`selectAct('playtest');start()`);return a;}
function ride(a,x,speed){a.run(`var q=createMotionPlayer('rails'),r=motionFixtures.rails.rails[0],s=sampleExperimentalRail(r,${x});Object.assign(q,{railId:r.id,x:s.x,y:s.y,speed:${speed},facing:Math.sign(${speed})||1,posture:'standing'});`);}
function air(a,x,y,vx,vy){a.run(`var q=createMotionPlayer('rails');Object.assign(q,{mode:'airborne',speed:null,x:${x},y:${y},air:{vx:${vx},vy:${vy},jumpLift:0,cutEligible:false,restorePosture:'standing'}})`);}
test('rails capture high-speed descending feet in both directions without center snapping or speed grants',()=>{
 const a=scene();for(const vx of [-45,-12,12,45]){air(a,0,200,vx,40);a.run(`var hit=firstAirImpact(q,0,.35,1),point=motionTrajectory(motionBody(q),q.air.vx,q.air.vy,0,.35,hit.time);moveAirTime(q,0,.35,hit.time);var landed=landMotion(q,hit.q,{vx:q.air.vx,vy:q.air.vy},hit.time),c=motionContact(q)`);assert.equal(a.run('landed'),true);assert.equal(a.run('q.railId'),'test-rail');assert.ok(a.run('Math.hypot(c.center.x-point.x,c.center.y-point.y)')<.001);assert.ok(Math.abs(a.run('q.speed'))<=Math.hypot(vx,40.35));}
});
test('smooth rail joins retain signed momentum and account for gravity and friction',()=>{
 const a=scene();for(const sign of [-1,1]){ride(a,sign>0?-380:380,sign*20);a.run(`var maxJump=0,error=0,energy=q.speed*q.speed/2+.35*(650-q.y),d=q.distance;for(let i=0;i<35;i++){var old={x:q.x,y:q.y};stepMotionPlayer(q,{});maxJump=Math.max(maxJump,Math.hypot(q.x-old.x,q.y-old.y));error=Math.max(error,Math.abs(q.speed*q.speed/2+.35*(650-q.y)-energy+.025*(q.distance-d)));}`);assert.ok(a.run('maxJump')<25);assert.ok(a.run('error')<.08);assert.equal(a.run('q.ticks'),35);assert.equal(a.run('q.posture'),'standing');}
});
test('rail jumps reattach; either end releases its tangent velocity once',()=>{
 const a=scene();for(const sign of [-1,1]){ride(a,sign*100,sign*10);a.run(`var c=motionContact(q);stepMotionPlayer(q,{jumpPressed:true,jumpHeld:true});var t=q.lastTakeoff`);assert.equal(a.run('q.railId'),null);assert.ok(Math.abs(a.run('t.after.vx-c.vx-c.nx*10.5'))<1e-6);a.run(`var recaptured=false;for(let i=0;i<90;i++){stepMotionPlayer(q,{});if(q.railId){recaptured=true;break}}`);assert.equal(a.run('recaptured'),true);
 ride(a,sign>0?599.8:-599.8,sign*24);a.run(`stepMotionPlayer(q,{})`);assert.equal(a.run('q.railId'),null);assert.equal(a.run('q.mode'),'airborne');assert.match(a.run('q.lastTakeoff.reason'),/rail end/);assert.ok(Math.abs(a.run('q.air.vx-q.lastTakeoff.before.vx'))<1e-6);}
});
test('rail underside and gap approaches do not capture',()=>{const a=scene();air(a,0,310,10,-4);a.run(`for(let i=0;i<8;i++)stepMotionPlayer(q,{})`);assert.equal(a.run('q.railId'),null);air(a,800,200,0,50);a.run(`stepMotionPlayer(q,{})`);assert.equal(a.run('q.railId'),null);});
test('ground Boost costs .5 per tick without reducing stronger earned momentum',()=>{const a=scene();a.run(`var q=createMotionPlayer('flat');for(let i=0;i<30;i++)stepMotionPlayer(q,{direction:1,boostHeld:true});`);assert.equal(a.run('q.boost.meter'),75);assert.ok(a.run('q.speed')>22);a.run(`q.speed=35;stepMotionPlayer(q,{boostHeld:true})`);assert.ok(a.run('q.speed')>34.9);assert.equal(a.run('q.boost.meter'),74.5);});
test('infiniteBoost rail metadata works at zero gauge and stops being free at boundary',()=>{const a=scene();ride(a,-299,14);a.run(`q.boost.meter=0;for(let i=0;i<12;i++)stepMotionPlayer(q,{boostHeld:true,direction:1})`);assert.equal(a.run('q.boost.meter'),0);assert.ok(a.run('q.speed')>21);ride(a,299.8,20);a.run(`q.boost.meter=0;stepMotionPlayer(q,{boostHeld:true});stepMotionPlayer(q,{boostHeld:true})`);assert.equal(a.run('q.boost.active'),false);ride(a,299.8,20);a.run(`q.boost.meter=30;stepMotionPlayer(q,{boostHeld:true})`);assert.ok(a.run('q.boost.meter')<30&&a.run('q.boost.meter')>29.5);});
test('fresh air burst costs 22.5 exactly for eighteen ticks; no aligned speed clamp',()=>{const a=scene();air(a,0,0,30,-12);a.run(`stepMotionPlayer(q,{boostPressed:true,boostHeld:true});for(let i=1;i<18;i++)stepMotionPlayer(q,{boostHeld:true})`);assert.equal(a.run('q.boost.meter'),67.5);assert.equal(a.run('q.air.vx'),30);assert.equal(a.run('q.air.vy'),0);assert.equal(a.run('q.boost.remaining'),0);a.run(`stepMotionPlayer(q,{boostHeld:true})`);assert.ok(a.run('q.air.vy')>0);assert.equal(a.run('q.boost.meter'),67.5);});
test('held ground Boost or a ground press plus jump never silently buys an air burst',()=>{const a=scene();for(const press of [false,true]){a.run(`var q=createMotionPlayer('flat');stepMotionPlayer(q,{boostHeld:true,boostPressed:${press},jumpPressed:true,jumpHeld:true})`);assert.equal(a.run('q.boost.airUsed'),false);assert.ok(a.run('q.air.vy')<0);a.run(`stepMotionPlayer(q,{});stepMotionPlayer(q,{boostHeld:true,boostPressed:true})`);assert.equal(a.run('q.boost.airUsed'),true);assert.equal(a.run('q.air.vy'),0);}});
test('insufficient gauge and repeated press cannot purchase a partial or second air burst',()=>{const a=scene();for(const meter of [0,1,22.49]){air(a,0,0,10,0);a.run(`q.boost.meter=${meter};stepMotionPlayer(q,{boostHeld:true,boostPressed:true})`);assert.equal(a.run('q.boost.airUsed'),false);assert.equal(a.run('q.boost.meter'),meter);}air(a,0,0,10,0);a.run(`q.boost.meter=22.5;stepMotionPlayer(q,{boostHeld:true,boostPressed:true});stepMotionPlayer(q,{});q.boost.meter=90;stepMotionPlayer(q,{boostHeld:true,boostPressed:true})`);assert.equal(a.run('q.boost.meter'),90);assert.equal(a.run('q.boost.bursts'),1);});
test('Boost key aliases and pause cannot queue a second air burst or leak legacy state',()=>{const a=scene();a.run(`press('Space',true);update();press('ShiftLeft',true);update();press('KeyX',true);release('ShiftLeft',true);update()`);assert.equal(a.run('playtestState.player.boost.bursts'),1);a.run(`pause();start();update()`);assert.equal(a.run('playtestState.player.boost.remaining'),0);assert.equal(a.run('keys.size'),0);assert.equal(a.run('playtestState.player.boost.airUsed'),true);assert.equal(a.run('boost'),90);});
test('free-to-paid boundary charges the actual paid duration in both directions',()=>{
 const a=scene();for(const direction of [-1,1]){ride(a,direction*299.8,direction*20);a.run(`q.boost.meter=30;stepMotionPlayer(q,{boostHeld:true})`);assert.ok(a.run('q.boost.meter')>29.503&&a.run('q.boost.meter')<29.507,'~.99 ticks of paid travel costs ~.495; only the earned pre-boundary .2 units stay free');}
});
test('leaving a free rail with no meter does not carry free Boost into the air',()=>{
 const a=scene();ride(a,599.8,24);a.run(`r.pieces[3].infiniteBoost=true;q.boost.meter=0;stepMotionPlayer(q,{boostHeld:true})`);assert.equal(a.run('q.mode'),'airborne');assert.equal(a.run('q.boost.active'),false);assert.equal(a.run('q.boost.airUsed'),false);
});
test('holding Boost through a spring preserves lift; a qualifying midair repress deliberately levels it',()=>{
 const a=scene();a.run(`var q=createMotionPlayer('springs');Object.assign(q,{mode:'airborne',speed:null,x:120,y:330,air:{vx:0,vy:35,jumpLift:0,cutEligible:false,restorePosture:'standing'}});stepMotionPlayer(q,{boostHeld:true});var lift=q.air.vy;stepMotionPlayer(q,{boostHeld:true})`);assert.equal(a.run('q.springLaunches'),1);assert.ok(a.run('q.air.vy')<-17);assert.equal(a.run('q.boost.meter'),90);a.run(`stepMotionPlayer(q,{});stepMotionPlayer(q,{boostHeld:true,boostPressed:true})`);assert.equal(a.run('q.air.vy'),0);assert.equal(a.run('q.boost.meter'),67.5);
});
test('rail/floor/platform landings reset air allowance; spring contact alone does not',()=>{
 const a=scene();air(a,0,200,2,40);a.run(`q.boost.airUsed=true;stepMotionPlayer(q,{})`);assert.equal(a.run('q.railId'),'test-rail');assert.equal(a.run('q.boost.airUsed'),false);
 a.run(`q=createMotionPlayer('platforms');Object.assign(q,{mode:'airborne',speed:null,x:0,y:230,air:{vx:2,vy:35,jumpLift:0,cutEligible:false,restorePosture:'standing'}});q.boost.airUsed=true;stepMotionPlayer(q,{})`);assert.equal(a.run('q.supportId'),'ferry');assert.equal(a.run('q.boost.airUsed'),false);
 a.run(`q=createMotionPlayer('springs');Object.assign(q,{mode:'airborne',speed:null,x:120,y:330,air:{vx:0,vy:35,jumpLift:0,cutEligible:false,restorePosture:'standing'}});q.boost.airUsed=true;stepMotionPlayer(q,{})`);assert.equal(a.run('q.springLaunches'),1);assert.equal(a.run('q.boost.airUsed'),true);
});
test('Spin Dash charging excludes Boost and a stronger rolling release is never clamped',()=>{
 const a=scene();a.run(`var q=createMotionPlayer('flat');stepMotionPlayer(q,{down:true,jumpPressed:true,jumpHeld:true,boostHeld:true});for(let i=0;i<20;i++)stepMotionPlayer(q,{down:true,jumpHeld:true,boostHeld:true})`);assert.equal(a.run('q.boost.meter'),90);assert.ok(a.run('q.dash'));a.run(`q.dash=null;q.speed=35;q.posture='rolling';stepMotionPlayer(q,{boostHeld:true})`);assert.ok(a.run('q.speed')>34.9);
});

test('a spring struck during a valid burst cancels that burst while preserving its spent allowance',()=>{
 const a=scene();a.run(`var q=createMotionPlayer('springs');Object.assign(q,{mode:'airborne',speed:null,x:500,y:300,facing:-1,air:{vx:-10,vy:0,jumpLift:0,cutEligible:false,restorePosture:'standing'}});stepMotionPlayer(q,{boostHeld:true,boostPressed:true});for(let i=0;i<4 && !q.springLaunches;i++)stepMotionPlayer(q,{boostHeld:true})`);assert.equal(a.run('q.springLaunches'),1);assert.equal(a.run('q.boost.remaining'),0);assert.equal(a.run('q.boost.airUsed'),true);assert.equal(a.run('q.boost.meter'),67.5);assert.ok(a.run('q.air.vx')>17);
});
test('an earned downhill speed remains available when Boost is released and empty paid rails give no drive',()=>{
 const a=scene();ride(a,400,30);a.run(`q.boost.meter=0;stepMotionPlayer(q,{boostHeld:true});var after=q.speed;stepMotionPlayer(q,{})`);assert.equal(a.run('q.boost.active'),false);assert.ok(a.run('q.speed')>29);assert.equal(a.run('q.boost.meter'),0);
});
test('rail plus Boost timing remains identical under different rendering schedules and resets cleanly',()=>{
 const outputs=[];for(const schedule of [[1000/30],[1000/60],[1000/120],[7,23,11,39,20]]){
 const a=scene();a.run(`document.querySelector('#playtest-rails').onclick();Object.assign(playtestState.player,{x:-100,y:sampleExperimentalRail(motionFixtures.rails.rails[0],-100).y,speed:14,railId:'test-rail'});press('ShiftLeft',true);last=1000;acc=0`);
 let elapsed=0,i=0;while(elapsed<1000-1e-8){elapsed=Math.min(1000,elapsed+schedule[i++%schedule.length]);a.run(`frame(${1000+elapsed})`)}outputs.push(JSON.parse(a.run('JSON.stringify(playtestState.player)')));assert.equal(a.run('playtestState.frames'),60);
 a.run(`restart()`);assert.equal(a.run('playtestState.player.railId'),null);assert.equal(a.run('playtestState.player.boost.meter'),90);assert.equal(a.run('keys.size'),0);
 for(const act of [1,2]){a.run(`selectAct(${act});start();selectAct('playtest');start()`);assert.equal(a.run('playtestState.player.boost.airUsed'),false);assert.equal(a.run('playtestState.player.railId'),null);}
 }for(const value of outputs)assert.deepEqual(value,outputs[0]);
});
test('Boost at a safe elevator sidewall consumes time and meter without retrying a zero-time impact',()=>{
 const a=scene();a.run(`var q=createMotionPlayer('platforms');Object.assign(q,{supportId:'elevator',x:499,y:280,speed:0});motionFixtures.platforms.boxes.push({id:'boost-wall',x1:510,x2:530,y1:150,y2:400});for(let i=0;i<10;i++)stepMotionPlayer(q,{direction:1,boostHeld:true})`);assert.equal(a.run('q.boost.meter'),85);assert.equal(a.run('q.ticks'),10);assert.ok(Math.abs(a.run('q.y-experimentalPlatformPose(motionFixtures.platforms.platforms[1],10).y1'))<1e-6);assert.equal(a.run('q.boundary'),null);
});
test('pressing Boost against a static wall still pays normal ground cost for all elapsed time',()=>{
 const a=scene();a.run(`var q=createMotionPlayer('flat');q.x=89;motionFixtures.flat.boxes.push({id:'boost-wall',x1:100,x2:120,y1:300,y2:400});for(let i=0;i<10;i++)stepMotionPlayer(q,{direction:1,boostHeld:true})`);assert.equal(a.run('q.boost.meter'),85);assert.ok(a.run('q.x')<=89.001);assert.equal(a.run('q.ticks'),10);
});

test('Boosting into the spring on a moving carrier remains a solid block, without a loop or free Boost',()=>{
 const a=scene();a.run(`var q=createMotionPlayer('moving-spring');q.ticks=10;Object.assign(q,{supportId:'spring-ferry',x:-50,y:280,speed:12});for(let i=0;i<10;i++)stepMotionPlayer(q,{direction:1,boostHeld:true})`);assert.equal(a.run('q.boost.meter'),85);assert.equal(a.run('q.boundary'),null);assert.equal(a.run('q.supportId'),'spring-ferry');assert.equal(a.run('q.springLaunches'),0);
});
test('both rail fixtures are reachable from safe reset through ordinary run and jump, including empty meter',()=>{
 const a=scene();for(const scenario of ['rails','rails-empty']){a.run(`document.querySelector('#playtest-${scenario}').onclick();press('ArrowRight',true);for(let i=0;i<40;i++)update();press('Space',true);for(let i=0;i<50;i++)update();release('Space',true)`);assert.equal(a.run('playtestState.player.railId'),'test-rail');a.run(`press('ShiftLeft',true);for(let i=0;i<12;i++)update()`);assert.ok(a.run('playtestState.player.speed')>20);assert.equal(a.run('playtestState.player.boost.meter'),scenario==='rails'?90:0);assert.equal(a.run('playtestState.player.boost.active'),true);}
});
test('fractional ground gauge is consumed once and locks paid Boost, but never locks infinite-Boost metadata',()=>{
 const a=scene();a.run(`var q=createMotionPlayer('flat');q.boost.meter=.2;stepMotionPlayer(q,{boostHeld:true})`);assert.equal(a.run('q.boost.meter'),0);assert.equal(a.run('q.boost.locked'),true);a.run(`stepMotionPlayer(q,{boostHeld:true})`);assert.equal(a.run('q.boost.active'),false);ride(a,-200,14);a.run(`q.boost.meter=0;q.boost.locked=true;stepMotionPlayer(q,{boostHeld:true})`);assert.equal(a.run('q.boost.active'),true);assert.ok(a.run('q.speed')>14);
});
