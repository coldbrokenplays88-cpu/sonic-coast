const {test}=require('node:test');
const assert=require('node:assert/strict');
const {boot}=require('./test-support.cjs');
const json=(a,s)=>JSON.parse(a.run(`JSON.stringify(${s})`));

test('Act 1 uses the approved force integrator exactly once, without legacy movement',()=>{
 const a=boot(1);
 assert.ok(a.run('p.act1Motion'),'Act 1 needs an explicit movement owner');
 a.run(`updateMovement=()=>{throw Error('legacy movement')};applySurfaceMotion=()=>{throw Error('legacy gravity')};integrateSurfaceStep=()=>{throw Error('legacy integration')};press('ArrowRight',true);for(let i=0;i<50;i++)update()`);
 const reference=boot();
 reference.run(`selectAct('playtest');start();press('ArrowRight',true);for(let i=0;i<50;i++)update()`);
 assert.ok(Math.abs(a.run('p.act1Motion.speed')-reference.run('playtestState.player.speed'))<1e-10);
 assert.ok(Math.abs(a.run('p.x')-100-reference.run('playtestState.player.x'))<1e-8);
 assert.equal(a.run('p.act1Motion.ticks'),50);
});

test('only the five approved Act 1 tunnel ceilings change, clearing the 38-unit roll',()=>{
 const a=boot(1), gates=json(a,"level.hazards.filter(h=>h.type==='gate')");
 assert.equal(gates.length,5);
 for(const h of gates){
  assert.equal(h.floor-h.y-h.h,40,'38-unit roll plus two units clearance');
  a.run(`Object.assign(p,{x:${h.x-100},y:${h.floor-20},vx:14,vy:0,ground:true,rolling:true,roll:true,surface:level.surfaces.find(s=>s.x1<=${h.x}&&s.x2>=${h.x}&&s.kind==='main')});resetAct1Motion();keys.add('ArrowRight');for(let i=0;i<32;i++)update();keys.clear()`);
  assert.ok(a.run('p.x')>h.x+h.w,'rolled player clears the actual authored tunnel');
  assert.equal(a.run('p.act1Motion.posture'),'rolling');
  assert.equal(a.run('bodyHeight()'),38);
 }
});

test('Both authored acts use explicit owners and PLAYTEST remains independent',()=>{
 const a=boot(2);
 assert.equal(a.run('p.act1Motion.act'),2);
 a.run(`press('ArrowRight',true);for(let i=0;i<20;i++)update()`);
 assert.ok(a.run('p.vx')>0);
 a.run(`selectAct(1);start();press('ArrowRight',true);update();selectAct('playtest');start()`);
 assert.equal(a.run('p.act1Motion ?? null'),null);
 assert.equal(a.run('playtestState.player.ticks'),0);
 a.run(`selectAct(2);start()`);
 assert.equal(a.run('p.act1Motion.act'),2);
});

function place(a,x,speed=14,rolling=false){
 a.run(`Object.assign(p,{x:${x},vx:${speed},vy:0,ground:true,rolling:${rolling},roll:${rolling},surface:level.surfaces.find(s=>s.x1<=${x}&&s.x2>=${x}&&s.kind==='main')});p.y=yOn(p.surface,p.x)-20;resetAct1Motion();p.inv=9999`);
}

test('authored first ramp preserves earned takeoff velocity and reaches the skill route',()=>{
 const a=boot(1);place(a,2660,19);
 a.run(`press('ArrowRight',true);while(p.ground)update()`);
 const t=json(a,'p.act1Motion.lastTakeoff');
 assert.equal(t.reason,'ledge');
 assert.ok(t.vy<-4,'ramp supplies upward world velocity without pressing jump');
 assert.ok(Math.abs(Math.hypot(t.vx,t.vy)-t.speed)<1e-7);
 place(a,2690,14);
 a.run(`press('Space',true);for(let i=0;i<72;i++)update()`);
 assert.ok(a.run("p.ground&&p.surface.kind==='express'"),'actual high-road landing');
 assert.ok(a.run('stats.expressLandings')>0);
});

test('approved downhill rolling force and deliberate low-speed uncurl work on Act 1 surfaces',()=>{
 const results=[];
 for(const rolling of [false,true]){
  const a=boot(1);
  a.run(`Object.assign(p,{x:3840,y:yOn(level.surfaces.find(s=>s.x1===3800),3840)-20,vx:6,vy:0,ground:true,surface:level.surfaces.find(s=>s.x1===3800),rolling:${rolling}});resetAct1Motion();for(let i=0;i<15;i++)update()`);
  results.push(a.run('p.act1Motion.speed'));
 }
 assert.ok(results[1]>results[0]+2,JSON.stringify(results));
 const a=boot(1);place(a,450,3,true);
 a.run(`press('ArrowLeft',true);for(let i=0;i<50;i++)update()`);
 assert.equal(a.run('p.act1Motion.posture'),'standing');
 assert.ok(a.run('p.act1Motion.speed')<0,'brakes, uncurls and reverses');
});

test('an airborne player countersteering into a tunnel wall remains blocked without zero-time retries',()=>{
 const a=boot(1);
 a.run(`Object.assign(p,{x:2200,y:330,vx:30,vy:0,ground:false,surface:null,rolling:false});resetAct1Motion();press('ArrowRight',true);for(let i=0;i<30;i++)update()`);
 assert.ok(a.run('p.x')<2250,'cannot enter gantry material');
 assert.equal(a.run('stats.deaths'),0);
});

test('moving decks carry once and transfer their measured velocity once on jump',()=>{
 const a=boot(1);
 a.run(`var deck=level.surfaces.find(s=>s.kind==='moving'&&s.motion.axis==='x');runFrames=31;Object.assign(p,{x:(pose(deck).x1+pose(deck).x2)/2,y:yOn(deck,(pose(deck).x1+pose(deck).x2)/2)-20,vx:act1Surface(deck,0,runFrames).vx,vy:0,ground:true,surface:deck,rolling:false});resetAct1Motion()`);
 const offset=a.run('p.x-pose(p.surface).x1');
 a.run('for(let i=0;i<70;i++)update()');
 assert.ok(Math.abs(a.run('p.x-pose(p.surface).x1')-offset)<1e-6);
 const expected=a.run('act1Surface(p.surface,p.act1Motion.x,runFrames).vx');
 a.run(`press('Space',true);update()`);
 assert.ok(Math.abs(a.run('p.act1Motion.lastTakeoff.vx')-expected)<1e-6);
 assert.equal(a.run('p.act1Motion.updates'),71);
});

test('air Boost keeps fresh-press and quarter-meter rules on an actual Act 1 ramp jump',()=>{
 const a=boot(1);place(a,2690,14);
 a.run(`press('ShiftLeft',true);press('Space',true);update()`);
 assert.equal(a.run('p.act1Motion.boost.airUsed'),false);
 assert.ok(a.run('p.vy')<0);
 const meter=a.run('boost');
 a.run(`release('ShiftLeft',true);for(let i=0;i<10;i++)update();press('ShiftLeft',true);update()`);
 assert.equal(a.run('p.act1Motion.boost.airUsed'),true);
 assert.equal(a.run('boost'),meter-22.5);
 assert.equal(a.run('p.vy'),0);
 a.run(`for(let i=0;i<10;i++)update();release('ShiftLeft',true);press('ShiftLeft',true);update()`);
 assert.equal(a.run('boost'),meter-22.5);
});

test('enemy rebound, damage, checkpoint death and pause hand control back without stale input',()=>{
 const a=boot(1);place(a,100,0);
 a.run(`count=5;p.inv=0;hurt(200);update()`);
 assert.equal(a.run('count'),0);
 assert.equal(a.run('p.ground'),false);
 assert.ok(a.run('p.vx')<0);
 a.run(`checkpoint=2;die()`);
 assert.equal(a.run('p.x'),8900);
 assert.equal(a.run('p.act1Motion.ticks'),0);
 assert.equal(a.run('keys.size'),0);
 a.run(`press('ArrowDown',true);press('Space',true);update();pause()`);
 const ticks=a.run('p.act1Motion.ticks');
 a.run('update();update();start();update()');
 assert.equal(a.run('p.act1Motion.ticks'),ticks+1);
 assert.equal(a.run('p.act1Motion.dash'),null);
 assert.equal(a.run('p.act1Motion.pendingJump'),false);
});

test('a short Spin Dash charge cannot leave a buffered ordinary jump behind',()=>{
 const a=boot(1);
 a.run(`press('ArrowDown',true);press('Space',true);update();release('ArrowDown',true);for(let i=0;i<4;i++)update()`);
 assert.equal(a.run('p.ground'),true);
 assert.equal(a.run('p.act1Motion.posture'),'rolling');
 assert.equal(a.run('stats.jumps'),0);
});

test('a descending express ramp joins the overlapping main roof without a false ledge',()=>{
 const a=boot(1);
 a.run(`var ramp=level.surfaces.find(s=>s.x1===3800);Object.assign(p,{x:4137,y:yOn(ramp,4137)-20,vx:10,vy:0,ground:true,surface:ramp,rolling:false});resetAct1Motion();press('ArrowRight',true);update()`);
 assert.equal(a.run('p.ground'),true);
 assert.equal(a.run('p.surface.kind'),'main');
 assert.equal(a.run('p.act1Motion.lastTakeoff ?? null'),null);
});

test('actual rebound drone transfers its authored impulse to the new air owner',()=>{
 const a=boot(1);
 a.run(`Object.assign(p,{x:16330,y:225,vx:0,vy:8,ground:false,surface:null,rolling:false});resetAct1Motion();keys.add('Space');p.jumpHeld=true;p.inv=9999;for(let i=0;i<12&&stats.rebound===0;i++)update()`);
 assert.equal(a.run('stats.rebound'),1);
 assert.ok(a.run('p.act1Motion.air.vy')<-15);
 assert.ok(a.run('p.vy')<-15);
});

test('Act 1 scripted ownership excludes movement, then returns to the same owner once',()=>{
 const a=boot(1);
 a.run(`var original=stageRuntime.motion;stageRuntime.motion=()=>{p.x+=2;return true};for(let i=0;i<5;i++)update()`);
 assert.equal(a.run('p.x'),110);
 assert.equal(a.run('p.act1Motion.ticks'),0);
 a.run(`stageRuntime.motion=original;press('ArrowRight',true);update()`);
 assert.equal(a.run('p.act1Motion.ticks'),1);
 assert.ok(a.run('p.x')>110);
});

test('Spin Dash, coast, braking and zero-meter air rules use the approved PLAYTEST tuning',()=>{
 const a=boot(1);
 a.run(`press('ArrowDown',true);press('Space',true);for(let i=0;i<30;i++)update();release('ArrowDown',true);release('Space',true);update()`);
 assert.ok(a.run('p.act1Motion.speed')>18.9&&a.run('p.act1Motion.speed')<=19);
 a.run(`press('ArrowRight',true);for(let i=0;i<20;i++)update()`);
 assert.ok(a.run('p.act1Motion.speed')>18,'ordinary input cannot cap earned speed to 14');
 for(const meter of [0,22.4,22.5,90]){
  const b=boot(1);
  b.run(`press('Space',true);for(let i=0;i<10;i++)update();boost=${meter};press('KeyX',true);update()`);
  const eligible=meter>=22.5;
  assert.equal(b.run('p.act1Motion.boost.airUsed'),eligible);
  assert.ok(Math.abs(b.run('boost')-(eligible?meter-22.5:meter))<1e-8);
 }
});

test('foreign spring launches preserve their impulse and spent air allowance until a qualifying repress',()=>{
 const a=boot(1);
 a.run(`press('Space',true);for(let i=0;i<10;i++)update();press('ShiftLeft',true);update();launchAirDevice({x:p.x,y:feet(),power:18,launchX:9});update()`);
 assert.equal(a.run('p.act1Motion.boost.airUsed'),true);
 assert.ok(a.run('p.vy')<-17,'held boost cannot flatten a spring/vent launch');
 const meter=a.run('boost');
 a.run(`release('ShiftLeft',true);press('ShiftLeft',true);update()`);
 assert.equal(a.run('boost'),meter,'spent airborne allowance survives launch');
});

test('a physical roll tap between simulation ticks still curls the moving player',()=>{
 const a=boot(1);place(a,400,10);
 a.run(`press('ArrowDown',true);release('ArrowDown',true);update()`);
 assert.equal(a.run('p.act1Motion.posture'),'rolling');
});

test('holding full-speed upright input into either side of a tunnel stays finite and solid',()=>{
 for(const [x,speed,direction] of [[2239,14,'ArrowRight'],[2481,-20,'ArrowLeft']]){
  const a=boot(1);place(a,x,speed);
  a.run(`press('${direction}',true);for(let i=0;i<60;i++)update()`);
  assert.ok(Number.isFinite(a.run('p.x')));
  assert.equal(a.run('p.vx'),0);
  assert.equal(a.run('p.ground'),true);
 }
});

test('Act 1 preserves the existing input buffer and jumps at the actual landing contact',()=>{
 const a=boot(1);
 a.run(`Object.assign(p,{x:400,y:395,vx:0,vy:5,ground:false,surface:null,rolling:false,roll:false});resetAct1Motion();press('Space',true)`);
 assert.equal(a.run('p.act1Motion.jumpBuffer'),a.run('tuning.buffer'));
 a.run('update()');
 assert.equal(a.run('p.ground'),false);
 assert.ok(a.run('p.vy')<0,'landing consumes the buffered jump within this tick');
 assert.equal(a.run('stats.jumps'),1);
});

test('airborne map-edge collision preserves the existing world bounds',()=>{
 const a=boot(1);
 a.run(`Object.assign(p,{x:25,y:100,vx:-10,vy:0,ground:false,surface:null,roll:false,rolling:false});resetAct1Motion();update()`);
 assert.equal(a.run('p.x'),24);
 assert.equal(a.run('p.vx'),0);
});

test('an actual Boost monitor refills and unlocks an exhausted held Boost',()=>{
 const a=boot(1);
 a.run(`var mon=level.monitors[0],support=level.surfaces.find(s=>s.id===mon.surfaceId);Object.assign(p,{x:mon.x-40,y:yOn(support,mon.x-40)-20,vx:10,vy:0,ground:true,surface:support,roll:true,rolling:true});boost=0;resetAct1Motion();p.act1Motion.boost.locked=true;p.boostLocked=true;press('ShiftLeft',true);for(let i=0;i<3;i++)update()`);
 assert.equal(a.run('level.monitors[0].broken'),true);
 assert.ok(a.run('boost')>=90-3*.5&&a.run('boost')<=90,'refill minus at most three ticks of ordinary paid Boost');
 assert.equal(a.run('p.act1Motion.boost.locked'),false);
 assert.equal(a.run('p.boosting'),true);
});

test('input-only replay completes Act 1 and both authored Boost express routes remain reachable',()=>{
 const {act1RouteReplay,act1ExpressReplay}=require('../tools/act1-route-replay.cjs');
 const a=boot(1),result=json(a,`(${act1RouteReplay})()`);
 assert.equal(result.state.status,'win');
 assert.equal(result.state.hits,0);
 assert.equal(result.state.deaths,0);
 assert.equal(result.state.checkpoint,5);
 assert.ok(result.state.expressLandings>=2&&result.state.recoveries>=2);
 for(const checkpoint of [2,5]){
  const b=boot(1),route=json(b,`(${act1ExpressReplay})(${checkpoint})`);
  assert.equal(route.state.route,'express');
  assert.equal(route.state.hits,0);
  assert.equal(route.state.deaths,0);
  assert.equal(route.burst,true);
 }
});

test('countersteering a fast roll immediately enters standing braking in either direction',()=>{
 for(const direction of [-1,1]){
  const a=boot(1);place(a,1500,14*direction,true);
  a.run(`art.recoveredSpeedster={};press('${direction===1?'ArrowLeft':'ArrowRight'}',true);update()`);
  assert.equal(a.run('p.act1Motion.posture'),'standing');
  assert.equal(a.run('p.rolling'),false);
  assert.equal(a.run('recoveredSonicPose().state'),'brake');
  assert.ok(Math.abs(a.run('p.act1Motion.speed')-13.1*direction)<1e-8,'normal .9 standing brake, without reversal or speed replacement');
 }
});

test('held Down cannot immediately recurl a countersteering standing brake',()=>{
 const a=boot(1);place(a,1500,14,true);
 a.run(`press('ArrowDown',true);press('ArrowLeft',true);for(let i=0;i<10;i++)update()`);
 assert.equal(a.run('p.act1Motion.posture'),'standing');
 assert.ok(a.run('p.act1Motion.speed')>0);
});

test('landing after an upright falling animation clears the stale pre-jump roll',()=>{
 const a=boot(1);place(a,1200,10,true);
 a.run(`art.recoveredSpeedster={};press('ArrowRight',true);press('Space',true);while(p.vy<3)update()`);
 assert.equal(a.run('recoveredSonicPose().state'),'fall');
 a.run(`while(!p.ground)update()`);
 assert.equal(a.run('p.act1Motion.posture'),'standing');
 assert.equal(a.run('p.rolling'),false);
 assert.equal(a.run('bodyHeight()'),48);
 assert.ok(a.run('p.act1Motion.speed')>=10,'landing preserves earned horizontal momentum');
});

test('countersteer keeps a safe rolled collider inside a tunnel, then stands when clear',()=>{
 const a=boot(1);place(a,2300,10,true);
 a.run(`press('ArrowLeft',true);update()`);
 assert.equal(a.run('p.act1Motion.posture'),'rolling','standing cannot fit beneath this ceiling');
 assert.equal(a.run('bodyHeight()'),38);
 place(a,2500,10,true);
 a.run('update()');
 assert.equal(a.run('p.act1Motion.posture'),'standing');
});
