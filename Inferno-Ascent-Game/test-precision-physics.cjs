const {test}=require('node:test');
const assert=require('node:assert/strict');
const {boot}=require('./test-support.cjs');

// Controlled floors isolate steering from slopes, hazards, and launch devices.
// All assertions exercise the game's fixed-step movement and collision code.
function fixture(act,{speed=0,ground=true,kind='main',rolling=false,boostExit=false,grindable=false}={}){
 const a=boot(act);
 a.run(`level.surfaces=[{id:'control-floor',x1:0,x2:20000,y1:420,y2:420,kind:${JSON.stringify(kind)},boostExit:${boostExit},grindable:${grindable}}];
 level.hazards=[];level.deathZones=[];level.floorAt=()=>1e6;
 Object.assign(p,{x:5000,y:${ground?400:-4000},vx:${speed},vy:0,ground:${ground},surface:${ground?'level.surfaces[0]':'null'},rolling:${rolling},rollAge:0,lowRollFrames:0,face:1,hurt:0});keys.clear();`);
 return a;
}
function advance(a,dir=0,frames=1){
 a.run(`keys.delete('ArrowLeft');keys.delete('ArrowRight');${dir?`keys.add('${dir<0?'ArrowLeft':'ArrowRight'}');`:''}for(let i=0;i<${frames};i++){runFrames++;updateMovement()}`);
 return a.run('p.vx');
}
function close(actual,expected,message){assert.ok(Math.abs(actual-expected)<1e-9,`${message}: ${actual} vs ${expected}`)}

for(const act of [1,2]){
 test(`act ${act}: countersteering brakes ordinary ground momentum 25% harder`,()=>{
  for(const [speed,oldBrake]of [[6,1],[12,.82],[20,.82],[-12,.82]]){
   const a=fixture(act,{speed}),dir=-Math.sign(speed);
   const drag=Math.abs(speed)>14?.998:1;
   close(advance(a,dir),(speed+dir*oldBrake*1.25)*drag,'ground countersteering');
  }
 });
 test(`act ${act}: recovery grip retains its advantage with the same 25% brake increase`,()=>{
  for(const [speed,oldBrake]of [[10,2.5],[20,1.4]]){
   const a=fixture(act,{speed,kind:'recovery'});
   close(advance(a,-1),(speed-oldBrake*1.25)*(speed>14?.998:1),'recovery countersteering');
  }
 });
 test(`act ${act}: air countersteering reduces momentum without an immediate reversal`,()=>{
  for(const speed of [10,-10]){const a=fixture(act,{speed,ground:false});close(advance(a,-Math.sign(speed)),speed-Math.sign(speed)*.25,'air brake');}
  const a=fixture(act,{speed:2,ground:false});
  assert.ok(advance(a,-1,7)>0);close(advance(a,-1),0,'stop before reversing');
  assert.ok(advance(a,-1)<0&&a.run('p.vx')>=-.12,'ordinary air acceleration resumes after stopping');
 });
 test(`act ${act}: countersteering first stops low ground velocity instead of kicking across zero`,()=>{
  for(const kind of ['main','recovery'])for(const speed of [.8,.05,-.8,-.05]){
   const a=fixture(act,{speed,kind});close(advance(a,-Math.sign(speed)),0,'stop on countersteer');
   close(advance(a,-Math.sign(speed)),-Math.sign(speed)*.555,'normal acceleration after stop');
  }
 });
 test(`act ${act}: released low-speed footsteps settle sooner on ordinary and recovery floors`,()=>{
  for(const [kind,drag]of [['main',.65],['recovery',.8]]){
   const a=fixture(act,{speed:2,kind});close(advance(a),2-drag,'low-speed grip');
  }
  const a=fixture(act);const x=a.run('p.x');advance(a,1);advance(a);
  close(a.run('p.x')-x,.555,'one-frame positional adjustment');close(a.run('p.vx'),0,'no residual footstep drift');
 });
 test(`act ${act}: neutral air momentum keeps the existing drag and has no extra precision friction`,()=>{
  for(const speed of [10,23,-23]){
   const a=fixture(act,{speed,ground:false});const vx=advance(a,0,60);
   close(vx,Math.abs(speed)<=14?speed:speed*Math.pow(.999,60),'neutral air momentum');
  }
 });
 test(`act ${act}: same-direction run acceleration, maximum speed, and faster coasting are unchanged`,()=>{
  const a=fixture(act);let expected=0;
  for(let f=0;f<600;f++){
   if(expected<14)expected=Math.min(14,expected+.52*Math.pow(1-Math.min(1,expected/14),1.5)+.035);
   close(advance(a,1),expected,'ordinary acceleration frame '+f);
  }
  close(a.run('p.vx'),14,'normal top speed');
  for(const speed of [4,12,23]){
   const b=fixture(act,{speed});const drag=speed<=8?.5:.22+(speed-8)*.002;
   close(advance(b),(speed-drag)*(speed>14?.998:1),'higher-speed coast');
  }
 });
 test(`act ${act}: launch countersteering remains unchanged through ascent and descent`,()=>{
  const a=fixture(act,{ground:false});
  a.run('launchAirDevice({x:p.x,y:feet(),power:18,launchX:9})');
  close(advance(a,-1),8.8,'early launch steering');
  advance(a,0,38);assert.ok(a.run('p.vy')>0,'launch is descending beyond the old jump-cut guard');
  a.run('p.vx=9');close(advance(a,-1),8.8,'descending launch steering');
  a.run('land(level.surfaces[0],420);p.vx=9');
  close(advance(a,-1),7.975,'landing alone restores stronger ground steering');
  // Call the normal-jump handler with an active device flight separately,
  // so this assertion cannot pass merely because land() cleared its guard.
  a.run('launchAirDevice({x:p.x,y:feet(),power:18,launchX:9});jump();p.vx=9');
  close(advance(a,-1),8.75,'ordinary jump after landing restores stronger air steering');
 });
 test(`act ${act}: retry clears propulsion protection and restores ordinary ground control`,()=>{
  const a=fixture(act);a.run('launchAirDevice({x:p.x,y:feet(),power:18,launchX:9});respawn();p.vx=9');
  close(advance(a,-1),7.975,'respawn restores ground countersteering');
 });
 test(`act ${act}: rolling, charged spin dash, boost exits and grind braking retain existing strength`,()=>{
  const roll=fixture(act,{speed:10,rolling:true});roll.run("keys.add('ArrowDown')");
  close(advance(roll,-1),9.5*.9985,'rolling brake');
  const exit=fixture(act,{speed:10,boostExit:true});close(advance(exit,-1),9.18,'boost exit brake');
  const rail=fixture(act,{speed:10,grindable:true});close(advance(rail,-1),9.55,'grind brake');
  const dash=fixture(act);dash.run('charge=20;');advance(dash);close(dash.run('p.vx'),23*.997*.998*.9985,'full spin dash release');
 });
 test(`act ${act}: boosting keeps its velocity response, charge drain and release gauge`,()=>{
  const a=fixture(act,{speed:10});a.run("keys.add('ShiftLeft')");
  close(advance(a,-1),10+(23-10)*.14,'boost acceleration');close(a.run('boost'),89.5,'boost cost');
  a.run("keys.delete('ShiftLeft')");advance(a);close(a.run('boost'),89.5,'release preserves remaining gauge');
 });
 test(`act ${act}: normal jump impulse, gravity, and short-hop release remain unchanged`,()=>{
  const a=fixture(act,{speed:10});a.run('jump()');close(a.run('p.vy'),-13.4,'jump impulse');
  advance(a,0);close(a.run('p.vy'),-12.82,'gravity');
  a.run("release('Space',true)");close(a.run('p.vy'),-5,'short hop release');
 });
}
