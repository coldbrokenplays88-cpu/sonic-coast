const test=require('node:test'),assert=require('node:assert/strict');
const {boot}=require('./test-support.cjs');

test('the blimp stays still in view, starts on boarding, carries its rider and resets',()=>{
 const a=boot();a.run(`const s=surfaceById('blimp-moving');zoom=1;cam=s.x1-100;camY=s.y1-100;runFrames=100;updateStageWorld()`);
 assert.equal(a.run('s.motion.startedAt'),null,'visibility must not start flight');
 a.run('p.x=s.x1+300;p.vx=-14;p.vy=8;p.ground=false;land(s,s.y1)');assert.equal(a.run('s.motion.startedAt'),100);
 a.run('runFrames=110;p.x=s.x1+300;p.y=s.y1-20;p.surface=s;p.ground=true;p.vx=0;keys.clear();const oldX=p.x;applySurfaceMotion()');assert.equal(a.run('p.x-oldX'),-3);
 a.run('runFrames=400');assert.equal(a.run('pose(s).x1-s.x1'),-710);
 a.run('resetBlimpRoute()');assert.equal(a.run('pose(s).x1'),a.run('s.x1'));
});

test('the blimp rewards give a life and Bubble Shield without refilling boost',()=>{
 const a=boot();
 a.run(`boost=0;const initialLives=lives;for(const id of ['blimp-life','blimp-shield']){const m=level.monitors.find(m=>m.id===id);p.x=m.x;p.y=m.y-20;p.ground=true;p.rolling=true;p.vx=-14;collectBoostMonitors()}`);
 assert.equal(a.run('lives-initialLives'),1);assert.equal(a.run('p.shield'),'bubble');assert.equal(a.run('boost'),0);
});

const {startLoopSource,blimpReplaySource}=require('./blimp-test-helpers.cjs');
for(const style of ['dash','boost'])test(`${style}: the actual loop jump clears all three blimps, earns both rewards and rejoins the original hallway exit`,()=>{
 const a=boot();a.run(startLoopSource+blimpReplaySource);a.run(`startLoop(0,'${style}')`);const r=a.run('replayBlimps()');
 assert.equal(r.secondInitiallyVisible,false);assert.equal(r.thirdVisibleAtJump,false,'fast jump starts before the third blimp is visible');assert.equal(r.life,true);assert.equal(r.shield,'bubble');assert.equal(a.run('stats.jumps'),3);assert.equal(a.run('stats.loops'),2);assert.equal(a.run('stats.hits'),0);
 for(const id of ['blimp-curve-0','blimp-moving','blimp-reward','blimp-return-rail','blimp-return-descent'])assert.ok(r.landings.some(l=>l.id===id),id);
 assert.ok(a.run('p.vx')>23,'return retains momentum');
});
test('stopping on the first blimp still permits a slower jump and both rewards',()=>{
 const a=boot();a.run(startLoopSource+blimpReplaySource);a.run('startLoop()');const r=a.run('replayBlimps(true)');
 assert.equal(a.run('stats.jumps'),3);assert.ok(r.wait>100);assert.equal(r.thirdVisibleAtJump,true,'cautious jump follows the reveal');assert.equal(r.life,true);assert.equal(r.shield,'bubble');assert.equal(a.run('stats.hits'),0);
});
test('ordinary loop momentum and a prematurely released high jump fall short of the entry spring',()=>{
 for(const style of ['roll','dash']){const a=boot();a.run(startLoopSource);a.run(`startLoop(0,'${style}');let launchFrame=null;for(let i=0;i<310;i++){if(launchFrame===null&&p.surface?.id==='draw-loop-launch'&&p.x>=p.surface.x2-45){press('Space',true);launchFrame=runFrames;}if('${style}'==='dash'&&launchFrame!==null&&runFrames-launchFrame===10)release('Space',true);update();}`);
 assert.equal(a.run("level.springs.find(d=>d.id==='blimp-entry-spring').firedAt"),undefined);
 }
});
test('the moving blimp closes the gap enough for a standing jump after docking',()=>{
 const a=boot();a.run(`const s=surfaceById('blimp-moving');s.motion.startedAt=0;runFrames=300;const q=pose(s);p.x=q.x1+16;p.y=q.y1-20;p.surface=s;p.ground=true;p.vx=0;p.vy=0;keys.clear();press('ArrowLeft',true);press('Space',true);`);
 let landed=false;for(let i=0;i<70;i++){a.run('update()');if(a.run("p.surface?.id==='blimp-reward'")){landed=true;break}}
 assert.ok(landed);assert.equal(a.run('stats.deaths'),0);
});
test('a reverse jump from the original upper roof cannot activate the loop-entry spring',()=>{
 const a=boot();a.run(`const s=surfaceById('draw-burning-top');p.x=s.x1+10;p.y=s.y1-20;p.surface=s;p.ground=true;p.vx=-26;keys.clear();press('ArrowLeft',true);press('Space',true);for(let i=0;i<60;i++)update()`);
 assert.equal(a.run("level.springs.find(d=>d.id==='blimp-entry-spring').firedAt"),undefined);
});

test('the later-roof air-boost entry cannot activate the spring',()=>{
 const a=boot();a.run(`const s=surfaceById('draw-burning-top');p.x=s.x1+1;p.y=s.y1-20;p.surface=s;p.ground=true;p.vx=-14;p.face=-1;keys.clear();press('ArrowLeft',true);press('Space',true);for(let i=0;i<65;i++){if(i===37){release('ArrowLeft',true);press('ArrowRight',true)}if(i===38)press('ShiftLeft',true);if(i===39)release('ShiftLeft',true);update()}`);
 assert.equal(a.run("level.springs.find(d=>d.id==='blimp-entry-spring').firedAt"),undefined);
});
for(const speed of [0,7,14,23])test(`the original hidden vent has the same flight and hallway landing at entry speed ${speed}`,()=>{
 const current=boot(),original=boot();
 original.run(`level.surfaces=level.surfaces.filter(s=>!s.id.startsWith('blimp-'));level.springs=level.springs.filter(s=>!s.id.startsWith('blimp-'));level.blimpRoute=null;level.surfaceIndex=new Map(level.surfaces.map(s=>[s.id,s]));`);
 for(const a of [current,original])a.run(`const s=surfaceById('draw-hidden-pit-grate');p.x=34210;p.y=s.y1-20;p.surface=s;p.ground=true;p.vx=${speed};p.vy=0;keys.clear();press('ArrowRight',true);`);
 let landed=false;for(let i=0;i<150;i++){for(const a of [current,original])a.run('update()');
  const state=a=>a.run('JSON.stringify({x:p.x,y:p.y,vx:p.vx,vy:p.vy,s:p.surface?.id,ground:p.ground,deaths:stats.deaths})');assert.equal(state(current),state(original));
  if(original.run("p.surface?.id==='draw-hazard-hall'")){landed=true;break}
 }
 assert.ok(landed,'original secret lands on its original hallway target');
});
test('the original missed-building jump still reveals and activates the hidden vent',()=>{
 const a=boot();a.run(`const s=surfaceById('draw-burning-approach');p.x=s.x2-20;p.y=s.y2-20;p.surface=s;p.ground=true;p.vx=7;p.vy=0;keys.clear();`);
 let found=false;for(let i=0;i<180;i++){a.run(`if(p.surface?.id==='draw-hidden-pit-grate')press('ArrowRight',true);update()`);if(a.run("level.pads.find(d=>d.id==='draw-hidden-pit-vent').firedAt!==undefined")){found=true;break}}
 assert.ok(found);assert.equal(a.run('stats.deaths'),0);
});

test('the entry deck stays solid when aiming slows or reverses horizontal speed',()=>{
 for(const vx of [0,6,17,18,-8]){const a=boot();a.run(`const s=surfaceById('blimp-entry');p.x=(s.x1+s.x2)/2-(${vx})/2;p.y=s.y1-24;p.vx=${vx};p.vy=8;p.ground=false;p.surface=null;runFrames++;moveAndResolveSurfaces()`);
 assert.equal(a.run('p.surface?.id'),'blimp-entry','speed '+vx);assert.equal(a.run('feet()'),a.run('s.y1'));}
});
test('a qualifying flight contacts the angled visible spring cap before reaching its base',()=>{
 const a=boot();a.run(`const d=level.springs.find(d=>d.id==='blimp-entry-spring');Object.assign(level.blimpRoute,{entryJumpFrame:runFrames,entryJumpSpeed:26});p.poseJumpFrame=runFrames;p.airBoostUsed=false;p.x=d.x-65;p.y=d.y-43;p.vx=30;p.vy=8;p.ground=false;p.surface=null;keys.clear();update()`);
 assert.ok(a.run("level.springs.find(d=>d.id==='blimp-entry-spring').firedAt")>0);
});
test('contact at the entry spring remains reliable across varied aiming speeds',()=>{
 for(const vx of [0,4,8,12,17,-4,-8]){const a=boot();a.run(`const d=level.springs.find(d=>d.id==='blimp-entry-spring');Object.assign(level.blimpRoute,{entryJumpFrame:runFrames,entryJumpSpeed:26});p.poseJumpFrame=runFrames;p.airBoostUsed=false;const f=springFace(d),r=Math.abs(f.nx)*13+Math.abs(f.ny)*19;p.x=f.x+f.nx*(r+.5);p.y=f.y+f.ny*(r+.5)-1;p.vx=${vx};p.vy=32;p.ground=false;p.surface=null;keys.clear();update()`);
 assert.ok(a.run("level.springs.find(d=>d.id==='blimp-entry-spring').firedAt")>0,'aiming speed '+vx);}
});
test('jumping into the blimps from a later roof cannot use their return spring',()=>{
 const a=boot();a.run(`const s=surfaceById('draw-burning-top');p.x=s.x1+1;p.y=s.y1-20;p.surface=s;p.ground=true;p.vx=-14;p.face=-1;keys.clear();press('ArrowLeft',true);press('Space',true);for(let i=0;i<80;i++){if(i===24)press('ShiftLeft',true);if(i===42){release('ShiftLeft',true);release('Space',true);press('ArrowDown',true);}update()}`);
 assert.ok(a.run("visited.has('blimp-curve-4')"),'reproduce the former direct air-boost entry');
 a.run(`const reward=surfaceById('blimp-reward');p.x=29200;p.y=reward.y1-20;p.surface=reward;p.ground=true;p.vx=-8;activateWorldDevices()`);
 assert.equal(a.run("level.springs.find(d=>d.id==='blimp-return-spring').firedAt"),undefined);
});
for(const [name,speed,jump,success] of [['momentum jump',14,true,true],['standing jump',0,true,false],['running without jumping',14,false,false]])test('before the third blimp is visible: '+name,()=>{
 const a=boot();a.run(`const s=surfaceById('blimp-moving');s.motion.startedAt=0;runFrames=20;const q=pose(s);p.x=q.x1+20;p.y=q.y1-20;p.surface=s;p.ground=true;p.vx=-${speed};p.vy=0;keys.clear();press('ArrowLeft',true);${jump?"press('Space',true);":''}`);
 for(let i=0;i<65;i++)a.run('update()');assert.equal(a.run("visited.has('blimp-reward')"),success);
});
