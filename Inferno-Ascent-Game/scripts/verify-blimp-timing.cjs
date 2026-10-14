const assert=require('node:assert/strict'),fs=require('node:fs');
const {boot}=require('../test-support.cjs');
const {startLoopSource,blimpReplaySource}=require('../blimp-test-helpers.cjs');
const {transferSource}=require('../route-test-helpers.cjs');
// Predict the existing carrier's position at the descending part of the jump.
// These are representative clean button-driven runs, not optimal-speed proofs.
const movingTransfer=transferSource.replace('f<240','f<650')
 .replace("else if(vertical||dir*(edge-p.x)<4){press('Space',true);",`else if(vertical||dir*(edge-p.x)<4){if(target.motion){const q=pose(target,runFrames+34);if(q.x1>p.x+230||q.x2<p.x+370){if(p.vx>0)keys.add('ArrowLeft');else if(p.vx<0)keys.add('ArrowRight');update();continue;}}press('Space',true);`)
 .replace('const error=(target.x1+target.x2)/2-p.x;',`const q=pose(target,runFrames+Math.max(1,(13.4+p.vy)/.58)),error=(q.x1+q.x2)/2-p.x;`);
const results=[];
for(const phase of [120,180,240]){
 const normal=boot();normal.run(startLoopSource+movingTransfer);normal.run(`startLoop(${phase});const begin=runFrames;`);
 for(let f=0;f<500;f++){normal.run('update()');if(normal.run("p.surface?.id==='draw-loop-payoff-roof'"))break;}
 for(const id of ['draw-next-roof','draw-burning-approach','draw-burning-left','draw-burning-right','draw-burning-top','draw-moving-carrier','draw-hazard-hall'])normal.run(`transferTo('${id}')`);
 normal.run(`keys.clear();press('ArrowRight',true);press('ShiftLeft',true);for(let i=0;i<350&&p.x<=surfaceById('draw-hall-exit').x2+FOOT_RADIUS;i++)update()`);
 assert.ok(normal.run("p.x>surfaceById('draw-hall-exit').x2+FOOT_RADIUS&&p.ground"));assert.equal(normal.run('stats.hits+stats.deaths'),0);
 const fast=boot();fast.run(startLoopSource+blimpReplaySource);fast.run(`startLoop(${phase})`);const shortcut=fast.run('replayBlimps()');
 const normalFrames=normal.run('runFrames-begin'),saved=(normalFrames-shortcut.frames)/60;
 assert.ok(saved>0&&saved<=5,`saving ${saved} must stay within five seconds`);
 const cautious=boot();cautious.run(startLoopSource+blimpReplaySource);cautious.run(`startLoop(${phase})`);const careful=cautious.run('replayBlimps(true)');
 assert.ok(careful.frames>shortcut.frames);assert.equal(careful.life,true);assert.equal(careful.shield,'bubble');
 results.push({phase,normalFrames,blimpFrames:shortcut.frames,cautiousFrames:careful.frames,savedSeconds:Math.round(saved*100)/100});
}
const output={comparison:'Same loop-roof start, real full Spin Dash, same hallway-exit seam. Normal route uses its available boost through the guarded hallway; blimps use their return spring. Clean representative replays, not every possible human execution.',results};
if(process.env.BLIMP_TIMING_OUTPUT)fs.writeFileSync(process.env.BLIMP_TIMING_OUTPUT,JSON.stringify(output,null,2)+'\n');
console.log(JSON.stringify(output,null,2));
