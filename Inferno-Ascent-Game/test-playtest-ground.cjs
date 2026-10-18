const { test } = require('node:test');
const assert = require('node:assert/strict');
const { boot } = require('./test-support.cjs');
const json = (a, expression) => JSON.parse(a.run(`JSON.stringify(${expression})`));
function scene() {
  const a = boot();
  a.run(`selectAct('playtest');start()`);
  assert.equal(a.run('readGameState().movementImplemented'), true, 'ground prototype must be active');
  return a;
}
function simulate(a, scenario, x, speed, posture, input, ticks) {
  a.run(`var trial=createGroundPlayer(${JSON.stringify(scenario)},${x},${speed},${JSON.stringify(posture)});
    for(let i=0;i<${ticks};i++)stepGroundPlayer(trial,${JSON.stringify(input)})`);
  return json(a, 'groundContact(trial)');
}
test('production controller accelerates symmetrically and brakes before reversing', () => {
  const a = scene();
  const r = simulate(a,'flat',0,0,'standing',{direction:1},60);
  const l = simulate(a,'flat',0,0,'standing',{direction:-1},60);
  assert.ok(r.speed > 8 && r.speed < 14, 'readable acceleration rather than instant maximum');
  assert.ok(Math.abs(r.x+l.x)<1e-8 && Math.abs(r.speed+l.speed)<1e-8);
  a.run(`var signs=[];for(let i=0;i<50;i++){stepGroundPlayer(trial,{direction:1});signs.push(trial.speed)}`);
  const signs = json(a,'signs');
  assert.ok(signs.some(v=>v===0), 'a braking tick reaches rest before propulsion reverses');
  assert.ok(signs.at(-1)>0);
});
test('flat coast reaches stable rest; rolling coasts farther and receives no forward propulsion', () => {
  const a=scene();
  const running=simulate(a,'flat',0,12,'standing',{},120);
  const rolling=simulate(a,'flat',0,12,'rolling',{},120);
  const held=simulate(a,'flat',0,12,'rolling',{direction:1},120);
  assert.equal(running.speed,0);
  assert.ok(rolling.speed>8 && rolling.x>running.x*1.5);
  assert.deepEqual(held,rolling,'holding travel direction cannot propel a roll');
  const reverse=simulate(a,'flat',0,-12,'standing',{},240);
  assert.equal(reverse.speed,0);
  assert.ok(Math.abs(reverse.x+running.x)<1e-8,'coast-down is symmetric and stays stopped');
  a.run(`for(let i=0;i<120;i++)stepGroundPlayer(trial,{})`);
  assert.ok(a.run('trial.speed')>=0);
  const over=simulate(a,'flat',0,22,'standing',{direction:1},20);
  assert.ok(over.speed>21, 'running input does not clamp earned speed to the drive range');
});
test('slope gravity slows uphill travel and accelerates downhill; idle standing grips the valley grade', () => {
  const a=scene();
  for(const side of [-1,1]) {
    const downhill=simulate(a,'valley',side*1700,-side*6,'rolling',{},30);
    assert.ok(-side*downhill.speed>6);
    const uphill=simulate(a,'valley',side*1700,side*6,'rolling',{},30);
    assert.ok(side*uphill.speed<6);
    const rest=simulate(a,'valley',side*1700,0,'standing',{},60);
    assert.equal(rest.speed,0,'the33-degree valley grade is below the38-degree standing threshold');
    assert.equal(rest.x,side*1700,'static grip preserves the contact anchor');
  }
});
test('a deliberate downhill roll beats powered running from identical starts without a velocity kick',()=>{
 const a=scene();for(const side of [-1,1])for(const initial of [6,14,22]){
 a.run(`var runner=createMotionPlayer('valley'),roller=createMotionPlayer('valley');Object.assign(runner,{x:${side*1900},speed:${-side*initial}});Object.assign(roller,{x:${side*1900},speed:${-side*initial}});stepMotionPlayer(roller,{direction:${-side},down:true});stepMotionPlayer(runner,{direction:${-side}})`);
 assert.ok(Math.abs(a.run('roller.speed'))<initial+1,'entering a roll applies finite force, not a speed assignment');
 a.run(`for(let i=1;i<30;i++){stepMotionPlayer(roller,{direction:${-side}});stepMotionPlayer(runner,{direction:${-side}})}`);
 assert.ok(-side*a.run('roller.speed')>-side*a.run('runner.speed')+1,'downhill rolling should build more speed than powered running');
 assert.ok(side*a.run('roller.x')<side*a.run('runner.x'),'extra speed produces actual extra downhill travel');
 assert.ok(Math.abs(a.run('roller.x'))>1000&&Math.abs(a.run('runner.x'))>1000,'comparison stays on one constant grade');
 }
});
test('downhill force tuning leaves flat rolling and uphill motion unchanged',()=>{
 const a=scene();for(const side of [-1,1]){
 const flat=simulate(a,'flat',0,side*12,'rolling',{},120);assert.ok(Math.abs(flat.speed-side*9)<1e-8);assert.ok(Math.abs(flat.x-side*1260)<1e-8);
 const uphill=simulate(a,'valley',side*1700,side*14,'rolling',{},30);assert.ok(Math.abs(uphill.speed-side*7.527622318748)<1e-8,'uphill loss retains approved value');
 }
});
test('a roll with blocked standing clearance keeps its downhill countersteer force',()=>{
 const a=scene();for(const side of [-1,1]){
 a.run(`var free=createGroundPlayer('valley'),braked=createGroundPlayer('valley');for(const q of [free,braked])Object.assign(q,{x:${side*1700},speed:${-side*14},posture:'rolling'});var ty=groundContact(free).ty;stepGroundPlayer(free,{});var controls=beginGroundTick(braked,{direction:${side}},true,false);for(let i=0;i<groundTuning.substeps;i++)advanceGroundSubstep(braked,controls,1/groundTuning.substeps);finishGroundTick(braked,controls,sampleGround,false)`);
 assert.ok(Math.abs(Math.abs(a.run('free.speed'))-Math.abs(a.run('braked.speed'))-0.18*(1-Math.abs(a.run('ty'))))<1e-8,'countersteer removes the same speed per tick on the constant grade');
 }
});
test('rolling survives a continuous downhill reversal but uncurls after sustained flat rest', () => {
  const a=scene();
  const reversed=simulate(a,'valley',1400,2,'rolling',{},60);
  assert.ok(reversed.speed<0);
  assert.equal(a.run('trial.posture'),'rolling');
  simulate(a,'flat',0,1,'rolling',{direction:-1,down:true},60);
  assert.equal(a.run('trial.posture'),'standing');
  assert.equal(a.run('trial.speed')<0,true,'running resumes only after uncurling');
  a.run(`trial=createGroundPlayer('flat',0,0,'rolling');for(let i=0;i<60;i++)stepGroundPlayer(trial,{down:true})`);
  assert.equal(a.run('trial.posture'),'standing','held down cannot repeatedly recurl at rest');
});
test('steep downhill countersteer still accelerates a roll when standing is obstructed', () => {
  const a=scene();
  for(const side of [-1,1]) {
    for(const initial of [0,4]) {
      a.run(`trial=createGroundPlayer('valley',${side*1700},${-side*initial},'rolling');var free=createGroundPlayer('valley',${side*1700},${-side*initial},'rolling'),backtracks=0,previousX=trial.x;
        for(let i=0;i<30;i++){var controls=beginGroundTick(trial,{direction:${side}},true,false);for(let j=0;j<groundTuning.substeps;j++)advanceGroundSubstep(trial,controls,1/groundTuning.substeps);finishGroundTick(trial,controls,sampleGround,false);stepGroundPlayer(free,{});if(${side}*(trial.x-previousX)>=0)backtracks++;previousX=trial.x}`);
      const gain=-side*a.run('trial.speed')-initial,freeGain=-side*a.run('free.speed')-initial;
      assert.ok(gain>=freeGain*0.4,'countersteer must preserve at least 40% of released acceleration on the designated steep grade');
      assert.ok(gain<freeGain,'opposite input must still brake');
      assert.equal(a.run('backtracks'),0,'no stop/start jitter or uphill propulsion');
      assert.equal(a.run('trial.posture'),'rolling');
      assert.ok(Math.abs(a.run('trial.x'))>1000,'comparison stays on the same constant-grade approach');
      assert.ok(a.run('groundEnergy(trial)')<=a.run('groundEnergy(free)')+0.001,'braking cannot add energy');
      const braked=a.run('trial.speed');
      a.run(`for(let i=0;i<30;i++)stepGroundPlayer(trial,{})`);
      assert.ok(-side*a.run('trial.speed')>-side*braked+2,'releasing the brake restores more downhill acceleration');
    }
  }
});
test('opposite roll input uncurls promptly at low speed without snapping velocity or bypassing clearance', () => {
 const a=scene();for(const direction of [-1,1]){
 a.run(`var q=createMotionPlayer('flat');Object.assign(q,{speed:${direction*0.8},posture:'rolling'});stepMotionPlayer(q,{direction:${-direction}})`);
 assert.equal(a.run('q.posture'),'standing','countersteer should not wait at near-rest');
 assert.equal(Math.abs(a.run('q.speed')),0,'the0.9 standing brake stops0.8 without an instantaneous reversal');
 a.run(`for(let i=0;i<8;i++)stepMotionPlayer(q,{direction:${-direction}})`);
 assert.ok(direction*a.run('q.speed')<0,'standing control reverses naturally after braking');
 a.run(`q=createMotionPlayer('flat');Object.assign(q,{speed:${direction*12},posture:'rolling'});var uncurl=null,reversal=null;for(let i=1;i<=90;i++){stepMotionPlayer(q,{direction:${-direction}});if(q.posture==='standing'&&uncurl===null)uncurl=i;if(${direction}*q.speed<0&&reversal===null)reversal=i}`);
 assert.ok(a.run('uncurl')<=65&&a.run('reversal')<=69,'full-speed roll turn avoids the old 81-tick uncurl delay');
 }
 a.run(`q=createMotionPlayer('ceiling');Object.assign(q,{x:300,speed:0.8,posture:'rolling'});stepMotionPlayer(q,{direction:-1})`);
 assert.equal(a.run('q.posture'),'rolling','intentional turn cannot expand into ceiling');
});
test('posture changes preserve contact; curve joins are continuous and share render/collision sampling', () => {
  const a=scene();
  a.run(`trial=createGroundPlayer('flat',0,6);var before=groundContact(trial);stepGroundPlayer(trial,{down:true});var after=groundContact(trial)`);
  const before=json(a,'before'),after=json(a,'after');
  assert.equal(after.anchor.y,before.anchor.y);
  assert.equal(after.height,38); assert.equal(before.height,48);
  assert.ok(Math.abs(after.center.y+19-after.anchor.y)<1e-10);
  for(const x of [-1000,-200,200,1000]) {
    const left=json(a,`sampleGround('valley',${x-1e-5})`),right=json(a,`sampleGround('valley',${x+1e-5})`);
    assert.ok(Math.abs(left.y-right.y)<0.00002);
    assert.ok(Math.abs(left.angle-right.angle)<0.000001);
    assert.ok(Math.abs(left.curvature-right.curvature)<0.000001);
  }
});
test('no-input valley energy accounts for authored downhill work and friction across smooth joins', () => {
  const a=scene();
  a.run(`var trial=createMotionPlayer('valley');Object.assign(trial,{x:-1800,posture:'rolling'});var energy0=groundEnergy(trial),lastContact=motionContact(trial),extraWork=0,maxError=0,maxGrowth=0,maxStep=0,maxJump=0,peak=0;
    for(let i=0;i<400;i++){const beforeEnergy=groundEnergy(trial),beforeDistance=trial.distance;stepMotionPlayer(trial,{});let c=motionContact(trial);const work=1.5*0.35*Math.max(0,c.y-lastContact.y);extraWork+=work;const residual=groundEnergy(trial)-beforeEnergy-work+0.025*(trial.distance-beforeDistance);maxGrowth=Math.max(maxGrowth,residual);if(Math.max(Math.abs(c.speed),Math.abs(lastContact.speed))<groundTuning.rollSpeedCap-1e-6)maxError=Math.max(maxError,Math.abs(residual));maxStep=Math.max(maxStep,Math.hypot(c.x-lastContact.x,c.y-lastContact.y));maxJump=Math.max(maxJump,Math.abs(c.angle-lastContact.angle));peak=Math.max(peak,Math.abs(c.speed));if(!Number.isFinite(c.speed)||trial.boundary||trial.mode!=='grounded'||c.normalReaction<=0)throw Error('invalid/unsupported valley traversal');lastContact=c;if(c.x>2200)break}`);
  assert.ok(a.run('trial.x')>2200,'crosses the valley and climbs the other side before the marked boundary');
  assert.ok(a.run('extraWork')>300,'extra downhill force supplies measurable work');
  assert.ok(a.run('maxError')<0.05,'below the cap, energy change equals force work minus friction within integration tolerance');
  assert.ok(a.run('groundEnergy(trial)')<a.run('energy0+extraWork')-20,'rolling friction still dissipates energy');
  assert.ok(a.run('maxGrowth')<0.05,'limiting slope work cannot create unexplained energy');
  assert.ok(a.run('peak')<=a.run('groundTuning.rollSpeedCap')+1e-8,'rolling stays within the slope-speed cap');
  assert.ok(a.run('maxStep')<33,'no position discontinuities at the32-unit cap');
  assert.ok(a.run('maxJump')<0.04,'no abrupt tangent/pose jumps');
  assert.equal(a.run('trial.transitionCount'),0);
});
test('scene advances exactly one controller tick, resets boundaries safely, and ignores excluded controls', () => {
  const a=scene();
  a.run(`press('ArrowRight',true);press('Space',true);press('ShiftLeft',true);for(let i=0;i<60;i++)update()`);
  assert.equal(a.run('playtestState.player.ticks'),60);
  assert.equal(a.run('readGameState().frame'),60);
  assert.equal(a.run('charge'),0);
  assert.ok(a.run('playtestState.player.x')>0);
  a.run(`release('ArrowRight',true);press('ArrowDown',true);release('ArrowDown',true);update()`);
  assert.equal(a.run('playtestState.player.posture'),'rolling','a short Down tap is buffered until the next tick');
  a.run(`restart();press('ArrowRight',true);for(let i=0;i<30;i++)update();release('ArrowRight',true);press('ArrowDown',true);pause();start();update()`);
  assert.equal(a.run('playtestState.player.posture'),'standing','resume discards unconsumed input edges');
  a.run(`playtestState.player.x=4999;playtestState.player.speed=20;update()`);
  assert.equal(a.run('playtestState.player.x'),0);
  assert.match(a.run('playtestState.resetReason'),/boundary/);
  assert.equal(a.run('keys.size'),0);
});
test('equal simulated time under 30/60/120 Hz and uneven rendering produces the same controller result', () => {
  const results=[];
  for(const schedule of [[1000/30],[1000/60],[1000/120],[7,23,11,39,20]]) {
    const a=scene();
    a.run(`press('ArrowRight',true);last=1000;acc=0`);
    let elapsed=0,i=0;
    while(elapsed<2000-1e-8){elapsed=Math.min(2000,elapsed+schedule[i++%schedule.length]);a.run(`frame(${1000+elapsed})`);}
    results.push(json(a,'({player:playtestState.player,frame:readGameState().frame})'));
  }
  for(const result of results){assert.equal(result.frame,120);assert.deepEqual(result,results[0]);}
});
