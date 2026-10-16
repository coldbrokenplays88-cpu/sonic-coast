const test=require('node:test'),assert=require('node:assert/strict'),{boot}=require('./test-support.cjs');
function fixture(act=2){const a=boot(act);a.run(`
 art.recoveredSpeedster={};art.traversalActing={};art.traversalLaunch={};
 level.surfaces=[{id:'test-floor',x1:100,x2:400,y1:300,y2:300,kind:'main'}];level.hazards=[];
 Object.assign(p,{x:397,y:280,vx:0,vy:0,ground:true,surface:level.surfaces[0],face:1,inv:0,
 hurt:0,rolling:false,roll:false,boosting:false,brakeActive:false,poseLandingFrame:-100});
 `);return a}
function state(a){return a.run('updateTraversalAnimation();sonicPose().state')}
for(const act of [1,2])test(`Act ${act}: ledge balance distinguishes facing and connected roofs`,()=>{
 const a=fixture(act);assert.equal(state(a),'balance-forward');a.run('p.face=-1');assert.equal(state(a),'balance-backward');
 a.run("level.surfaces.push({id:'joined',x1:400,x2:600,y1:300,y2:300});");assert.equal(state(a),'idle');
 a.run('level.surfaces.pop();p.x=103');assert.equal(state(a),'balance-forward');a.run('p.face=1');assert.equal(state(a),'balance-backward');
 a.run('p.vx=12');assert.notEqual(state(a),'balance-backward');
});
test('pushing requires directional input into a solid side, never a spike or broken wall',()=>{
 const a=fixture();a.run("p.x=286;keys.add('ArrowRight');level.hazards=[{type:'gate',x:300,y:240,w:30,h:60}]");assert.equal(state(a),'push');
 a.run('keys.clear()');assert.notEqual(state(a),'push');a.run("keys.add('ArrowRight');level.hazards[0].broken=true");assert.notEqual(state(a),'push');
 a.run("level.hazards[0].broken=false;level.hazards[0].type='spikes'");assert.notEqual(state(a),'push');
 a.run("level.hazards[0].type='gate';level.hazards[0].y=180;level.hazards[0].h=20");assert.notEqual(state(a),'push');
});
test('new poses defer to hurt, charge, rolling, landing and unavailable artwork',()=>{
 const a=fixture();for(const flag of ['hurt','rolling','boosting','bubbleSlam','airBoostActive']){
  a.run(`p.${flag}=true`);assert.notEqual(state(a),'balance-forward');a.run(`p.${flag}=false`);
 }
 a.run('charge=4');assert.notEqual(state(a),'balance-forward');a.run('charge=0;p.poseLandingFrame=runFrames');assert.equal(state(a),'land');
 a.run('p.poseLandingFrame=-100;delete art.traversalActing');assert.equal(state(a),'idle');
});
test('sustained wall input advances all pushing frames across real collision ticks',()=>{
 const a=fixture();a.run("p.x=286;keys.add('ArrowRight');level.hazards=[{type:'gate',x:300,y:240,w:30,h:60}];updateTraversalAnimation()");
 const frames=new Set();for(let i=0;i<40;i++){
  a.run('runFrames++;updateMovement();updateTraversalAnimation()');
  assert.equal(a.run('sonicPose().state'),'push');frames.add(a.run('sonicPose().frame'));
 }assert.equal(frames.size,8);
});
test('spring and vent launches use distinct cycles and end at apex or interrupted flight',()=>{
 const a=fixture();a.run('launchAirDevice({x:p.x,y:300,power:20})');assert.equal(state(a),'spring-launch');
 const frames=new Set();for(let t=0;t<24;t+=3){a.run(`runFrames=${t};updateTraversalAnimation()`);frames.add(a.run('sonicPose().frame'))}assert.equal(frames.size,8);
 a.run('p.vy=3');assert.equal(state(a),'fall');a.run('launchAirDevice({x:p.x,y:300,power:30,cityVent:true})');assert.equal(state(a),'vent-launch');
 a.run('p.airBoostActive=true');assert.equal(state(a),'boost');a.run('p.airBoostActive=false');assert.notEqual(state(a),'vent-launch');
 a.run('launchAirDevice({x:p.x,y:300,power:30,cityVent:true});respawn()');assert.notEqual(state(a),'vent-launch');
});
test('straight rails retain existing grinding; spiral phase follows rail position, not time',()=>{
 const a=fixture();a.run('p.x=100;p.surface.grindable=true;p.vx=10;p.grindEntryFrame=-100');assert.equal(state(a),'grind');
 a.run('p.surface.spiralTurns=1');const frames=new Set();for(let n=0;n<16;n++){
  a.run(`p.x=100+300*${n}/16`);assert.equal(state(a),'grind-spiral');frames.add(a.run('sonicPose().frame'));
 }assert.equal(frames.size,16);const frame=a.run('sonicPose().frame');a.run('runFrames+=100');assert.equal(a.run('sonicPose().frame'),frame);
 a.run('p.ground=false;p.surface=null');assert.notEqual(state(a),'grind-spiral');
});
test('visual selection leaves every movement field and level geometry unchanged',()=>{
 const a=fixture();const before=a.run('JSON.stringify({p,level,boost,charge})');
 for(let i=0;i<30;i++)a.run('updateTraversalAnimation();sonicPose()');
 assert.equal(a.run('JSON.stringify({p,level,boost,charge})'),before);
});
