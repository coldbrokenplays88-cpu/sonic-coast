const {test}=require('node:test');
const assert=require('node:assert/strict');
const {boot}=require('./test-support.cjs');
function scene(){const a=boot();a.run(`selectAct('playtest');start()`);return a;}
const json=(a,s)=>JSON.parse(a.run(`JSON.stringify(${s})`));
function air(a,scenario,x,y,vx,vy,posture='standing'){
 a.run(`var q=createMotionPlayer('${scenario}');Object.assign(q,{mode:'airborne',speed:null,x:${x},y:${y},posture:'${posture}',air:{vx:${vx},vy:${vy},restorePosture:'${posture}',cutEligible:false}})`);
}
test('spring cap launches once with jump-independent lift and permits repeat landings',()=>{
 const a=scene();air(a,'springs',120,330,0,35);
 a.run(`stepMotionPlayer(q,{jumpHeld:false});var fired=q.springLaunches,vy=q.air.vy;stepMotionPlayer(q,{jumpHeld:false})`);
 assert.equal(a.run('fired'),1);assert.equal(a.run('q.springLaunches'),1);assert.ok(a.run('vy') < -17);assert.ok(Math.abs(a.run('q.air.vy-vy')-.35)<1e-7);
 a.run(`for(let i=0;i<120;i++)stepMotionPlayer(q,{})`);assert.ok(a.run('q.springLaunches')>=2,'return to the cap bounces again');
});
test('spring casing sides and back are solid and cannot fire the active cap',()=>{
 const a=scene();for(const [x,y,vx,vy] of [[70,380,40,0],[170,380,-40,0],[450,370,0,-60]]){
 air(a,'springs',x,y,vx,vy,'rolling');a.run(`stepMotionPlayer(q,{})`);assert.equal(a.run('q.springLaunches'),0);
 }
 // Horizontal spring: back approach stays blocked, frontal approach launches right.
 air(a,'springs',500,300,-60,0,'rolling');a.run(`stepMotionPlayer(q,{})`);assert.equal(a.run('q.springLaunches'),1);assert.ok(a.run('q.air.vx')>17);
 air(a,'springs',395,300,60,0,'rolling');a.run(`stepMotionPlayer(q,{})`);assert.equal(a.run('q.springLaunches'),0);assert.ok(a.run('q.x')<412);
});
test('diagonal spring face uses its visible normal and preserves relative tangent velocity',()=>{
 const a=scene();a.run(`var f=experimentalSpringPose(motionFixtures.springs.springs[2],0),q=createMotionPlayer('springs');Object.assign(q,{mode:'airborne',speed:null,posture:'rolling',x:f.x+f.nx*50,y:f.y+f.ny*50,air:{vx:-f.nx*60+f.tx*6,vy:-f.ny*60+f.ty*6,restorePosture:'rolling'}});stepMotionPlayer(q,{})`);
 assert.equal(a.run('q.springLaunches'),1);const t=json(a,'q.lastSpring');assert.ok(Math.abs(t.relativeTangent-6)<.35);assert.ok(Math.abs(t.normalSpeed-18)<1e-7);
});
test('moving platform landings store relative speed; riding follows reversals without accumulating velocity',()=>{
 const a=scene();air(a,'platforms',0,230,0,35);a.run(`stepMotionPlayer(q,{});var landed=q.supportId;`);assert.equal(a.run('landed'),'ferry');
 a.run(`q.speed=0;var maxError=0;for(let i=0;i<300;i++){stepMotionPlayer(q,{});var s=experimentalPlatformPose(motionFixtures.platforms.platforms[0],q.ticks);maxError=Math.max(maxError,Math.abs(q.y-s.y1));}`);
 assert.equal(a.run('q.supportId'),'ferry');assert.ok(a.run('maxError')<1e-6);assert.equal(a.run('q.speed'),0);assert.equal(a.run('q.ticks'),301);
});
test('platform jump and walkoff inherit instantaneous velocity exactly once in both directions',()=>{
 const a=scene();for(const tick of [10,130])for(const jump of [false,true]){
 a.run(`var q=createMotionPlayer('platforms');q.ticks=${tick};var platform=motionFixtures.platforms.platforms[0],s=experimentalPlatformPose(platform,q.ticks);Object.assign(q,{supportId:'ferry',x:${jump?'(s.x1+s.x2)/2':'s.x2-.2'},y:s.y1,speed:8});var vx0=8+s.vx;stepMotionPlayer(q,{jumpPressed:${jump},jumpHeld:true});`);
 assert.equal(a.run('q.mode'),'airborne');assert.ok(Math.abs(a.run('q.lastTakeoff.before.vx-vx0'))<.01,'coast drag before the edge is bounded');assert.ok(Math.abs(a.run('q.air.vx-q.lastTakeoff.before.vx'))<1e-6,'air inherits the actual takeoff vector once');assert.equal(a.run('q.supportId'),null);
 }
});
test('platform underside blocks ascending body and never attaches it to the top',()=>{
 const a=scene();air(a,'platforms',0,330,0,-65,'rolling');a.run(`stepMotionPlayer(q,{jumpHeld:true})`);assert.equal(a.run('q.mode'),'airborne');assert.equal(a.run('q.supportId'),null);assert.ok(a.run('q.y')>=319);assert.ok(a.run('q.air.vy')>=0);
});
test('moving spring inherits carrier velocity once; carrier and cap share one clock',()=>{
 const a=scene();a.run(`var q=createMotionPlayer('moving-spring');q.ticks=10;var cap=experimentalSpringPose(motionFixtures['moving-spring'].springs[0],10,motionFixtures['moving-spring']);Object.assign(q,{mode:'airborne',speed:null,x:cap.x,y:cap.y-50,posture:'rolling',air:{vx:cap.vx,vy:40,restorePosture:'rolling'}});stepMotionPlayer(q,{})`);
 assert.equal(a.run('q.springLaunches'),1);assert.ok(Math.abs(a.run('q.lastSpring.world.vx-cap.vx'))<1e-7);assert.equal(a.run('q.ticks'),11);
});
test('Spin Dash charges, releases along the slope tangent and does not replace earned momentum',()=>{
 const a=scene();for(const [scenario,x] of [['flat',0],['valley',-1700],['valley',1700]])for(const facing of [-1,1]){
 a.run(`var q=createMotionPlayer('${scenario}');Object.assign(q,{x:${x},facing:${facing}});stepMotionPlayer(q,{down:true,jumpPressed:true,jumpHeld:true});for(let i=0;i<29;i++)stepMotionPlayer(q,{down:true,jumpHeld:true});var charged=q.dash?.charge;stepMotionPlayer(q,{down:false,jumpHeld:false});var c=motionContact(q)`);
 assert.equal(a.run('charged'),30);assert.equal(a.run('q.posture'),'rolling');assert.equal(a.run('q.dash'),null);assert.ok(a.run('q.speed')*facing>18.7);assert.ok(a.run('q.speed')*facing<19.5);assert.ok(Math.abs(a.run('c.vx-c.speed*c.tx'))<1e-8);
 }
 a.run(`q=createMotionPlayer('flat');q.speed=30;stepMotionPlayer(q,{down:true,jumpPressed:true,jumpHeld:true});`);assert.equal(a.run('q.dash'),null);assert.ok(a.run('motionContact(q).vx')>29.9,'dash input cannot erase stronger momentum');
});
test('charge cancellation and lifecycle clearing never leak a deferred release or legacy charge',()=>{
 const a=scene();a.run(`press('ArrowDown',true);press('Space',true);for(let i=0;i<12;i++)update()`);assert.ok(a.run('playtestState.player.dash.charge')>0);assert.equal(a.run('charge'),0);
 a.run(`press('ArrowLeft',true);update()`);assert.equal(a.run('playtestState.player.dash'),null);a.run(`release('ArrowDown');update()`);assert.ok(Math.abs(a.run('playtestState.player.speed'))<1);
 a.run(`restart();press('ArrowDown',true);press('Space',true);update();pause();start();update()`);assert.equal(a.run('playtestState.player.dash'),null);
 for(const act of [1,2]){a.run(`selectAct(${act});start();selectAct('playtest');start()`);assert.equal(a.run('playtestState.player.dash'),null);assert.equal(a.run('playtestState.player.supportId'),null);assert.equal(a.run('keys.size'),0);}
});
test('device fixtures advance once per tick and remain identical across rendering schedules',()=>{
 const results=[];for(const schedule of [[1000/30],[1000/60],[1000/120],[7,23,11,39,20]]){const a=scene();a.run(`document.querySelector('#playtest-platforms').onclick();last=1000;acc=0;press('ArrowRight',true)`);let elapsed=0,i=0;while(elapsed<2000-1e-8){elapsed=Math.min(2000,elapsed+schedule[i++%schedule.length]);a.run(`frame(${1000+elapsed})`);}results.push(json(a,'({player:playtestState.player,frames:playtestState.frames})'));}for(const r of results){assert.equal(r.player.ticks,120);assert.equal(r.frames,120);assert.deepEqual(r,results[0]);}
});
test('a grounded coplanar crossing of the active spring cap bounces instead of running across it',()=>{
 const a=scene();a.run(`motionFixtures.springs.springs[0].y=400;var q=createMotionPlayer('springs');Object.assign(q,{x:65,speed:60});stepMotionPlayer(q,{direction:1});`);assert.equal(a.run('q.springLaunches'),1);assert.equal(a.run('q.mode'),'airborne');assert.ok(a.run('q.air.vy')<-17);
});
test('moving platform velocity is transferred once vertically, including jumps near a reversal',()=>{
 const a=scene();for(const tick of [10,44.9,45.1,100]){
 a.run(`var q=createMotionPlayer('platforms');q.ticks=${tick};var s=experimentalPlatformPose(motionFixtures.platforms.platforms[1],q.ticks);Object.assign(q,{supportId:'elevator',x:500,y:s.y1,speed:0});stepMotionPlayer(q,{jumpPressed:true,jumpHeld:true})`);
 assert.equal(a.run('q.mode'),'airborne');assert.ok(Math.abs(a.run('q.lastTakeoff.after.vy-(s.vy-10.5)'))<1e-7);assert.ok(Math.abs(a.run('q.air.vy-(s.vy-10.5+.35)'))<1e-6);
 }
});
test('moving support cannot carry a player through blocked overhead clearance',()=>{
 const a=scene();a.run(`var q=createMotionPlayer('platforms');q.ticks=90;var s=experimentalPlatformPose(motionFixtures.platforms.platforms[1],q.ticks);motionFixtures.platforms.boxes.push({id:'crush-test',x1:400,x2:600,y1:180,y2:230});Object.assign(q,{supportId:'elevator',x:500,y:s.y1,speed:0});var overlap=0;for(let i=0;i<30;i++){stepMotionPlayer(q,{});var b=motionBody(q);overlap=Math.max(overlap,230-(b.y-b.hh));if(q.boundary)break;}`);
 assert.match(a.run('q.boundary'),/clearance/);assert.ok(a.run('overlap')<.001,'reset occurs at the obstruction, never after penetration');
});
test('high-speed cap approaches and inactive casing contacts remain clear in both postures',()=>{
 const a=scene();for(const posture of ['standing','rolling'])for(const speed of [20,45,70]){
 air(a,'springs',120,300,0,speed,posture);a.run(`for(let i=0;i<6 && !q.springLaunches;i++)stepMotionPlayer(q,{})`);assert.equal(a.run('q.springLaunches'),1);assert.ok(a.run('q.air.vy')<0);
 for(const side of [-1,1]){air(a,'springs',120+side*100,375,-side*speed,0,posture);a.run(`for(let i=0;i<8;i++)stepMotionPlayer(q,{direction:${-side}})`);assert.equal(a.run('q.springLaunches'),0);assert.ok(a.run(`Math.abs(q.x-120)`)>34,'inactive side remains solid');}
 }
});
test('a charged release enters the approved loop without bypassing momentum/contact physics',()=>{
 const a=scene();for(const facing of [-1,1]){
 a.run(`var q=createMotionPlayer('loop'),path=motionFixtures.loop.path;Object.assign(q,{pathS:${facing}>0?path.entry-200:path.exit+200,facing:${facing}});syncPathPlayer(q);stepMotionPlayer(q,{down:true,jumpPressed:true,jumpHeld:true});for(let i=0;i<29;i++)stepMotionPlayer(q,{down:true,jumpHeld:true});stepMotionPlayer(q,{});var traversed=false;for(let i=0;i<160;i++){stepMotionPlayer(q,{});if(q.mode==='grounded'&&(${facing}>0?q.pathS>path.exit+20:q.pathS<path.entry-20)){traversed=true;break;}}`);
 assert.equal(a.run('traversed'),true);assert.equal(a.run('q.transitionCount'),0);
 }
});
test('ordinary rider braking at a wall does not count as crush when the carrier moves away',()=>{
 const a=scene();a.run(`var q=createMotionPlayer('platforms');q.ticks=130;var s=experimentalPlatformPose(motionFixtures.platforms.platforms[0],130);motionFixtures.platforms.boxes.push({id:'rider-wall',x1:50,x2:70,y1:190,y2:280});Object.assign(q,{supportId:'ferry',x:30,y:s.y1,speed:12});for(let i=0;i<3;i++)stepMotionPlayer(q,{direction:1});`);
 assert.equal(a.run('q.boundary'),null);assert.ok(a.run('motionBody(q).x+motionBody(q).hw')<=50.001);
});
test('jumping and walking off either platform edge preserves direction and one inherited vector',()=>{
 const a=scene();for(const direction of [-1,1])for(const tick of [10,130]){
 a.run(`var q=createMotionPlayer('platforms');q.ticks=${tick};var s=experimentalPlatformPose(motionFixtures.platforms.platforms[0],q.ticks);Object.assign(q,{supportId:'ferry',x:${direction}>0?s.x2-.2:s.x1+.2,y:s.y1,speed:${direction*8}});stepMotionPlayer(q,{direction:${direction}})`);
 assert.equal(a.run('q.mode'),'airborne');assert.ok(a.run('q.air.vx')*direction>5);assert.ok(Math.abs(a.run(`q.lastTakeoff.before.vx-(${direction*8}+s.vx)`))<.01);
 }
});
test('a rider meets its own moving spring casing as a solid block without a false crush reset',()=>{
 const a=scene();a.run(`var q=createMotionPlayer('moving-spring');q.ticks=10;Object.assign(q,{supportId:'spring-ferry',x:-50,y:280,speed:12});for(let i=0;i<3;i++)stepMotionPlayer(q,{direction:1});`);assert.equal(a.run('q.boundary'),null);assert.equal(a.run('q.springLaunches'),0);assert.equal(a.run('q.supportId'),'spring-ferry');
});
test('sidewall contact blocks relative walking while vertical carrier time continues',()=>{
 const a=scene();a.run(`var q=createMotionPlayer('platforms');Object.assign(q,{supportId:'elevator',x:499,y:280,speed:0});motionFixtures.platforms.boxes.push({id:'elevator-sidewall',x1:510,x2:530,y1:150,y2:400});var error=0;for(let i=0;i<10;i++){stepMotionPlayer(q,{direction:1});var s=experimentalPlatformPose(motionFixtures.platforms.platforms[1],q.ticks);error=Math.max(error,Math.abs(q.y-s.y1));}`);assert.equal(a.run('q.boundary'),null);assert.ok(a.run('error')<1e-6);assert.equal(a.run('q.supportId'),'elevator');
});
