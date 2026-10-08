// Start both routes at the same fallen-building position and speed. Apart
// from that initial placement, use normal inputs and collision throughout.
const assert=require('node:assert/strict');
const {boot}=require('../test-support.cjs');
const {aimHighSource,transferSource}=require('../route-test-helpers.cjs');
function startAtEntry(a,phase){a.run(`runFrames=${phase};const entry=surfaceById('mid-fallen-building');p.x=level.middleSection.start+600;p.y=yOn(entry,p.x)-20;p.surface=entry;p.ground=true;p.vx=8;p.inv=0;boost=0;count=20;keys.clear()`)}
const results=[];
for(const phase of [0,40,80,120,180,240,280]){
 const low=boot();startAtEntry(low,phase);low.run(transferSource);low.run("keys.add('ArrowRight')");
 let roof=false;for(let f=0;f<350;f++){low.run('update()');if(low.run("p.surface?.id==='mid-pool-roof-exit'")){roof=true;break}}
 assert.ok(roof,'natural pool exit');
 for(const id of ['mid-low-transfer-1','mid-right-guard-roof','mid-low-transfer-2','mid-low-transfer-3','mid-junction'])low.run(`if('${id}'==='mid-low-transfer-2')keys.add('ArrowDown');transferTo('${id}');keys.delete('ArrowDown')`);
 assert.equal(low.run('stats.deaths'),0);assert.equal(low.run('stats.hits'),0);
 const high=boot();startAtEntry(high,phase);high.run(aimHighSource);high.run("press('Space',true)");
 let junction=false;for(let f=0;f<800;f++){high.run("aimHigh();if(p.surface?.grindable){keys.clear();keys.add('ShiftLeft');keys.add('ArrowRight')}update()");if(high.run("p.surface?.id==='mid-junction'")){junction=true;break}assert.equal(high.run('stats.deaths'),0)}
 assert.ok(junction,'high route reaches the same junction');
 const lowFrames=low.run('runFrames')-phase,highFrames=high.run('runFrames')-phase;
 assert.ok(highFrames<lowFrames*.9,'clean high route must earn a clear timing advantage');
 results.push({phase,lowFrames,highFrames,lowSeconds:lowFrames/60,highSeconds:highFrames/60,savedSeconds:(lowFrames-highFrames)/60});
}
console.log(JSON.stringify({note:'Representative button-driven replays; these are not an optimal-speed proof or human playtest.',results},null,2));
