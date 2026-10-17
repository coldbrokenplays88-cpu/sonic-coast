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
test('slope gravity slows uphill travel and accelerates downhill in both directions; rest rolls back', () => {
  const a=scene();
  for(const side of [-1,1]) {
    const downhill=simulate(a,'valley',side*1700,-side*6,'rolling',{},30);
    assert.ok(-side*downhill.speed>6);
    const uphill=simulate(a,'valley',side*1700,side*6,'rolling',{},30);
    assert.ok(side*uphill.speed<6);
    const rest=simulate(a,'valley',side*1700,0,'standing',{},60);
    assert.ok(-side*rest.speed>4, 'designated steep grade overcomes standing friction');
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
test('no-input valley run dissipates energy, crosses joins smoothly, and respects contact', () => {
  const a=scene();
  a.run(`trial=createGroundPlayer('valley',-1800,0,'rolling');var energy0=groundEnergy(trial),lastContact=groundContact(trial),maxGain=0,maxStep=0,maxJump=0,peak=0,maxX=-1800;
    for(let i=0;i<600;i++){stepGroundPlayer(trial,{});let c=groundContact(trial);maxX=Math.max(maxX,c.x);maxGain=Math.max(maxGain,groundEnergy(trial)-energy0);maxStep=Math.max(maxStep,Math.hypot(c.x-lastContact.x,c.y-lastContact.y));maxJump=Math.max(maxJump,Math.abs(c.angle-lastContact.angle));peak=Math.max(peak,Math.abs(c.speed));if(!Number.isFinite(c.speed)||trial.boundary||c.normalReaction<=0)throw Error('invalid/unsupported valley traversal');lastContact=c}`);
  assert.ok(a.run('maxX')>1000,'run crosses the bottom and climbs the other side, regardless of final oscillation phase');
  assert.ok(a.run('maxGain')<0.05,'energy growth budget <0.05 unit²/tick² (~0.02% of start)');
  assert.ok(a.run('groundEnergy(trial)')<a.run('energy0')-20,'intentional friction dissipates energy');
  assert.ok(a.run('Math.abs(energy0-groundEnergy(trial)-groundTuning.rollResistance*trial.distance)')<0.05,'lost energy agrees with friction work, within integration error');
  assert.ok(a.run('maxStep')<35,'no position discontinuities within supported speed envelope');
  assert.ok(a.run('maxJump')<0.04,'no abrupt tangent/pose jumps');
  assert.equal(a.run('trial.ticks'),600);
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
