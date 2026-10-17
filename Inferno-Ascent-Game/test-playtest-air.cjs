const {test}=require('node:test');
const assert=require('node:assert/strict');
const {boot}=require('./test-support.cjs');
const json=(a,s)=>JSON.parse(a.run(`JSON.stringify(${s})`));
function scene(){const a=boot();a.run(`selectAct('playtest');start()`);assert.equal(a.run('playtestState.player.mode'),'grounded','air slice must have explicit movement modes');return a;}
function make(a,scenario='flat',x=0,speed=0,posture='standing'){a.run(`var q=createMotionPlayer(${JSON.stringify(scenario)});Object.assign(q,{x:${x},speed:${speed},posture:${JSON.stringify(posture)}})`);}
function airborne(a,scenario,x,y,vx,vy,restore='standing'){make(a,scenario);a.run(`Object.assign(q,{x:${x},y:${y},speed:null,posture:'rolling',mode:'airborne',air:{vx:${vx},vy:${vy},jumpLift:0,cutEligible:false,restorePosture:'${restore}',separation:null}})`);}
function tick(a,input={},n=1){a.run(`for(let i=0;i<${n};i++)stepMotionPlayer(q,${JSON.stringify(input)})`);}

test('ground controller remains identical to approved GROUND-3 without transitions',()=>{
 const a=scene();for(const scenario of ['flat','valley']){make(a,scenario,0,0);a.run(`var reference=createGroundPlayer('${scenario}');for(let i=0;i<120;i++){let input={direction:1,down:i===50};stepGroundPlayer(reference,input);stepMotionPlayer(q,input)}`);assert.deepEqual(json(a,'({x:q.x,speed:q.speed,posture:q.posture,distance:q.distance})'),json(a,'({x:reference.x,speed:reference.speed,posture:reference.posture,distance:reference.distance})'));}
});
test('jump converts signed tangent momentum and adds only the outward normal impulse',()=>{
 const a=scene();for(const [scenario,x] of [['flat',0],['valley',-1700],['valley',1700]])for(const speed of [-22,22]){make(a,scenario,x,speed);const c=json(a,'motionContact(q)');tick(a,{jumpPressed:true,jumpHeld:true});const t=json(a,'q.lastTakeoff');assert.equal(a.run('q.mode'),'airborne');assert.equal(a.run('q.speed'),null);assert.ok(Math.abs(t.before.vx-c.vx)<1e-9&&Math.abs(t.before.vy-c.vy)<1e-9);assert.ok(Math.abs(t.after.vx-c.vx-c.nx*10.5)<1e-9&&Math.abs(t.after.vy-c.vy-c.ny*10.5)<1e-9);assert.equal(a.run('q.ticks'),1);}
});
test('hold jumps rise higher than tap jumps on flat and both travel directions of both slopes',()=>{
 const a=scene();for(const [scenario,x] of [['flat',0],['valley',-1700],['valley',1700]])for(const speed of [-8,8]){const peaks=[];for(const hold of [true,false]){make(a,scenario,x,speed);tick(a,{jumpPressed:true,jumpHeld:hold});a.run(`var initialY=motionContact(q).center.y,peakY=initialY;for(let i=0;i<40;i++){stepMotionPlayer(q,{jumpHeld:${hold}});peakY=Math.min(peakY,motionContact(q).center.y)}`);peaks.push(a.run('initialY-peakY'));}assert.ok(peaks[0]>peaks[1]+5,`${scenario} x=${x} speed=${speed}: hold ${peaks[0]}, tap ${peaks[1]}`);}
});
test('short-hop release preserves inherited uphill velocity above the drive range and expires',()=>{
 const a=scene();for(const side of [-1,1]){make(a,'valley',side*1700,side*22);tick(a,{jumpPressed:true,jumpHeld:true});a.run('var held=JSON.parse(JSON.stringify(q)),lift=q.air.jumpLift');tick(a,{jumpHeld:false});a.run('stepMotionPlayer(held,{jumpHeld:true})');assert.ok(Math.abs(a.run('q.air.vy-held.air.vy')-a.run('lift')*0.6)<1e-8);assert.equal(a.run('q.air.vx'),a.run('held.air.vx'));assert.ok(a.run('q.air.vy')<-10,'cut must retain inherited slope lift');make(a,'valley',side*1700,side*22);tick(a,{jumpPressed:true,jumpHeld:true});tick(a,{jumpHeld:true},32);assert.equal(a.run('q.air.jumpLift'),0);a.run('held=JSON.parse(JSON.stringify(q))');tick(a,{jumpHeld:false});a.run('stepMotionPlayer(held,{jumpHeld:true})');assert.equal(a.run('q.air.vy'),a.run('held.air.vy'));}
});
test('no-input air motion conserves horizontal momentum; countersteer brakes without a cap',()=>{
 const a=scene();for(const direction of [-1,1]){airborne(a,'flat',0,0,direction*30,0);tick(a,{},30);assert.equal(a.run('q.air.vx'),direction*30);airborne(a,'flat',0,0,direction*30,0);tick(a,{direction},30);assert.equal(a.run('q.air.vx'),direction*30);airborne(a,'flat',0,0,direction*30,0);tick(a,{direction:-direction},30);assert.ok(direction*a.run('q.air.vx')<27&&direction*a.run('q.air.vx')>24);}
});
test('ledge and high-speed crest releases retain momentum; low-speed crest contact stays stable',()=>{
 const a=scene();make(a,'gap',99,14);tick(a,{direction:1});assert.equal(a.run('q.mode'),'airborne');assert.equal(a.run('q.lastTakeoff.reason'),'ledge');assert.ok(Math.abs(a.run('q.lastTakeoff.after.vx')-14)<1e-8);assert.equal(a.run('q.lastTakeoff.after.vy'),0);tick(a,{},5);assert.equal(a.run('q.transitionCount'),1);
 for(const side of [-1,1]){make(a,'crest',-side*20,side*4);tick(a,{},20);assert.equal(a.run('q.mode'),'grounded');assert.equal(a.run('q.transitionCount'),0);make(a,'crest',-side*20,side*22);tick(a,{},20);assert.equal(a.run('q.mode'),'airborne');assert.equal(a.run('q.lastTakeoff.reason'),'crest');assert.equal(a.run('q.transitionCount'),1,'no immediate reattachment/chatter');assert.deepEqual(json(a,'q.lastTakeoff.before'),json(a,'q.lastTakeoff.after'));make(a,'crest',-side*600,side*14);tick(a,{direction:side},50);assert.equal(a.run('q.lastTakeoff.reason'),'crest');assert.equal(a.run('q.transitionCount'),1);assert.ok(Math.abs(a.run('q.lastTakeoff.reaction'))<0.000002,'continuous approach releases at zero support, not a fixed position gate');}
});
test('flat and sloped landings remove normal velocity without increasing tangent speed',()=>{
 const a=scene();for(const [scenario,x] of [['flat',0],['valley',-1500],['valley',1500]])for(const direction of [-1,1]){make(a,scenario,x,0);a.run(`var s=sampleMotionGround('${scenario}',${x});Object.assign(q,{mode:'airborne',x:s.x+s.nx*65,y:s.y+s.ny*65,speed:null,posture:'rolling',air:{vx:s.tx*${direction*6}-s.nx*8,vy:s.ty*${direction*6}-s.ny*8,jumpLift:0,cutEligible:false,restorePosture:'standing',separation:null}});for(let i=0;i<20&&!q.lastLanding;i++)stepMotionPlayer(q,{})`);const l=json(a,'q.lastLanding');assert.ok(l,'landing must occur');assert.ok(l.incoming.vx*l.normal.x+l.incoming.vy*l.normal.y < -0.1,'record actual incoming normal velocity before it is removed');assert.ok(Math.abs(l.speed-(l.incoming.vx*l.tx+l.incoming.vy*l.ty))<1e-8);assert.ok(Math.abs(l.speed)<=Math.hypot(l.incoming.vx,l.incoming.vy)+1e-8);assert.equal(a.run('q.air'),null);assert.equal(a.run('q.mode'),'grounded');}
});
test('swept wall and ceiling collisions block the entire body at benchmark and stress speeds',()=>{
 const a=scene();for(const speed of [14,35,70]){airborne(a,'wall',300,300,speed,0);tick(a,{},5);assert.ok(a.run('q.x')<=331.002,'circle cannot tunnel through wall');assert.ok(Math.abs(a.run('motionContact(q).vx'))<1e-6);make(a,'wall',300,speed);tick(a,{direction:1},5);assert.ok(a.run('motionContact(q).center.x')<=339.002,'standing body cannot tunnel');}
 airborne(a,'ceiling',300,380,0,-40,'rolling');a.run('q.air.jumpLift=10;q.air.cutEligible=true');tick(a,{jumpHeld:true});assert.ok(a.run('q.y')>=375.998);assert.equal(a.run('q.air.jumpLift'),0);assert.match(a.run('q.latestTransition'),/ceiling/);
});
test('blocked uncurl preserves anchor and body until there is standing clearance',()=>{
 const a=scene();make(a,'ceiling',300,0,'rolling');tick(a,{},60);assert.equal(a.run('q.posture'),'rolling');assert.equal(a.run('q.x'),300);assert.equal(a.run('motionContact(q).anchor.y'),400);a.run('q.x=500');tick(a,{},12);assert.equal(a.run('q.posture'),'standing');assert.equal(a.run('motionContact(q).anchor.y'),400);
});
test('upright jumps beside either wall land without horizontal snapping or posture penetration',()=>{
 const a=scene();for(const x of [339,401]){make(a,'wall',x,0);tick(a,{jumpPressed:true,jumpHeld:true});assert.equal(a.run('q.posture'),'standing','wider curled body must be denied beside wall');for(let i=1;i<65;i++)tick(a,{jumpHeld:i<20});assert.equal(a.run('q.mode'),'grounded');assert.ok(Math.abs(a.run('q.x')-x)<0.0001,'zero horizontal velocity cannot cause a sideways landing');assert.equal(a.run('q.posture'),'standing');assert.ok(a.run('bodyBoxDistance(motionBody(q),motionFixtures.wall.boxes[0]).distance')>=-0.0001);}
});
test('airborne presses do not become buffered landing jumps; unrelated falls cannot be jump-cut',()=>{
 const a=scene();airborne(a,'flat',0,330,0,5);tick(a,{jumpPressed:true,jumpHeld:true});tick(a,{jumpHeld:true},60);assert.equal(a.run('q.mode'),'grounded');assert.equal(a.run('q.lastTakeoff'),null);const c=json(a,'motionContact(q)');tick(a,{jumpHeld:false});assert.equal(a.run('q.mode'),'grounded');assert.deepEqual(json(a,'motionContact(q).anchor'),c.anchor);
});
test('flight reset, pause/resume and act switching clear pending jump/contact state',()=>{
 const a=scene();a.run(`press('Space',true);update();release('Space',true);pause();start();update()`);assert.equal(a.run('playtestState.player.mode'),'airborne');assert.equal(a.run('playtestState.player.air.cutEligible'),false);a.run('restart()');assert.equal(a.run('playtestState.player.mode'),'grounded');assert.equal(a.run('playtestState.player.lastTakeoff'),null);for(const act of [1,2]){a.run(`press('Space',true);update();selectAct(${act});start()`);assert.equal(a.run('playtestState'),null);assert.equal(a.run('keys.size'),0);assert.equal(a.run('jumpBuffer'),0);a.run(`selectAct('playtest');start()`);assert.equal(a.run('playtestState.player.air'),null);}
});
test('air simulation is render-schedule independent and one controller advances each tick',()=>{
 const results=[];for(const schedule of [[1000/30],[1000/60],[1000/120],[7,23,11,39,20]]){const a=scene();a.run(`press('ArrowRight',true);press('Space',true);last=1000;acc=0`);let elapsed=0,i=0;while(elapsed<1500-1e-8){elapsed=Math.min(1500,elapsed+schedule[i++%schedule.length]);a.run(`frame(${1000+elapsed})`)}results.push(json(a,'({player:playtestState.player,frame:readGameState().frame})'));}for(const r of results){assert.equal(r.frame,90);assert.equal(r.player.ticks,90);assert.deepEqual(r,results[0]);}
});
test('fixture sweeps remain clear across deterministic fast run, roll and jump approaches',()=>{
 const a=scene();
 for(const scenario of ['flat','valley','crest','gap','wall','ceiling'])for(const speed of [-30,-14,14,30])for(const jump of [false,true]) {
  a.run(`q=createMotionPlayer('${scenario}');q.speed=${speed};var overlaps=0;for(let i=0;i<100;i++){stepMotionPlayer(q,{direction:${Math.sign(speed)},down:i===10,jumpPressed:${jump}&&i===0,jumpHeld:i<20});for(const box of motionFixtures[q.scenario].boxes)if(bodyBoxDistance(motionBody(q),box).distance < -0.003)overlaps++;if(q.boundary)break}`);
  assert.equal(a.run('overlaps'),0,`${scenario} speed ${speed} jump ${jump}: body penetrated a box`);
 }
});
