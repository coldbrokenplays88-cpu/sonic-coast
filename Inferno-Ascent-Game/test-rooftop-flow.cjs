const {test}=require('node:test'),assert=require('node:assert/strict');
const {boot}=require('./test-support.cjs'),{rooftopFlowSource,rooftopRecoverySource,transferSource}=require('./route-test-helpers.cjs');
function begin(speed=14,id='draw-loop-payoff-roof'){
 const a=boot();a.run(`const s=surfaceById('${id}');Object.assign(p,{x:s.x1+80,y:s.y1-20,vx:${speed},vy:0,ground:true,surface:s,inv:0});boost=0;count=30;keys.clear();press('ArrowRight');`);a.run(rooftopFlowSource);return a;
}
for(const speed of [14,18,20,23,26])for(const hold of [6,8,10])test(`rising rooftops preserve forward motion at ${speed} with ${hold}-tick jumps`,()=>{
 const a=begin(speed);let reached=false;for(let f=0;f<450;f++){reached=a.run(`stepRooftopFlow(${hold})`);assert.equal(a.run('stats.deaths'),0);if(reached)break;}
 assert.ok(reached);assert.equal(a.run('stats.jumps'),2);assert.equal(a.run('boost'),0);assert.equal(a.run('stats.hits'),0);assert.ok(a.run('window.rooftopReplay.minSpeed')>=14-1e-8);
 assert.ok(a.run("window.rooftopReplay.landings.some(l=>l.id==='draw-next-roof')"));
});
for(const speed of [14,20,26])for(const offset of [-50,0,50])test(`rooftop jumps at ${speed} tolerate takeoff offset ${offset} without countersteering`,()=>{
 const a=begin(speed);let reached=false;for(let f=0;f<450;f++){reached=a.run(`stepRooftopFlow(8,${offset})`);assert.equal(a.run('stats.deaths'),0);if(reached)break;}assert.ok(reached);assert.equal(a.run('stats.jumps'),2);
 const landing=a.run("window.rooftopReplay.landings.find(l=>l.id==='draw-next-roof')");if(speed===20)assert.ok(landing.room/landing.speed>=15,'at least 15 forward ticks of landing space');
});
for(const id of ['draw-loop-payoff-roof','draw-next-roof'])for(const speed of [14,20,26])for(const rolling of [false,true])test(`missed jump from ${id} at ${speed}, rolling ${rolling}, reaches the service path and rejoins`,()=>{
 const a=begin(speed,id);a.run(`p.rolling=${rolling};p.dashRolling=${rolling};`);a.run(rooftopRecoverySource);let caught=false,rejoined=false;for(let f=0;f<600;f++){rejoined=a.run('stepRooftopRecovery()');if(a.run("p.surface?.id?.startsWith('draw-roof-recovery')"))caught=true;if(rejoined)break;assert.equal(a.run('stats.deaths'),0);}
 assert.ok(caught);assert.ok(rejoined);assert.equal(a.run('stats.jumps'),1);assert.equal(a.run('boost'),0);assert.equal(a.run("visited.has('draw-hazard-hall')"),false);
});
test('the service ramp cannot intercept a valid upper-roof landing',()=>{
 const a=boot();a.run(`const r=surfaceById('draw-roof-recovery-ramp'),s=surfaceById('draw-burning-approach');Object.assign(p,{x:r.x2+2,y:s.y1-21,vx:14,vy:1,ground:false,surface:null,rolling:false,inv:0});moveAndResolveSurfaces()`);
 assert.equal(a.run('p.surface?.id'),'draw-burning-approach');assert.equal(a.run('p.ground'),true);assert.equal(a.run('p.vx'),14);assert.equal(a.run('p.vy'),0);
});
test('a fully charged Spin Dash miss can brake on the service terrace and jump back',()=>{
 const a=begin(0,'draw-next-roof');a.run(`keys.clear();press('ArrowDown');press('Space');for(let i=0;i<80;i++)update();release('ArrowDown');release('Space');press('ArrowRight');`);a.run(rooftopRecoverySource);
 let reached=false;for(let f=0;f<600;f++){reached=a.run('stepRooftopRecovery()');assert.equal(a.run('stats.deaths'),0);if(reached)break;}assert.ok(reached);assert.equal(a.run('stats.jumps'),1);assert.equal(a.run('boost'),0);
});
test('the existing hidden grate and vent remain reachable beyond the widened roof',()=>{
 const a=boot();a.run(`const s=surfaceById('draw-burning-approach');Object.assign(p,{x:s.x2+FOOT_RADIUS+1,y:s.y2-20,vx:0,vy:0,ground:false,surface:null,inv:0});count=30;boost=0;keys.clear();`);
 for(let f=0;f<120&&!a.run('p.ground');f++)a.run('update()');assert.equal(a.run('p.surface?.id'),'draw-hidden-pit-grate');assert.equal(a.run('stats.deaths'),0);
 a.run("press('ArrowLeft');");let fired=false;for(let f=0;f<100;f++){a.run('update()');if(a.run("level.pads.find(d=>d.id==='draw-hidden-pit-vent').firedAt!==undefined")){fired=true;break;}assert.equal(a.run('stats.deaths'),0);}assert.ok(fired);
});
test('actual Spin Dash and loop momentum carries through the two rooftop jumps',()=>{
 const a=boot();a.run(`const s=surfaceById('draw-loop-roof');Object.assign(p,{x:s.x1+100,y:s.y1-20,vx:0,vy:0,ground:true,surface:s,inv:0});boost=0;count=30;keys.clear();press('ArrowDown');press('Space');for(let f=0;f<80;f++)update();release('ArrowDown');release('Space');press('ArrowRight');`);
 for(let f=0;f<450&&a.run("p.surface?.id!=='draw-loop-payoff-roof'");f++){a.run('update()');assert.equal(a.run('stats.deaths'),0);}assert.equal(a.run('p.surface?.id'),'draw-loop-payoff-roof');
 a.run(rooftopFlowSource);let reached=false;for(let f=0;f<450;f++){reached=a.run('stepRooftopFlow(8)');if(reached)break;assert.equal(a.run('stats.deaths'),0);}
 assert.ok(reached);assert.equal(a.run('stats.loops'),2);assert.equal(a.run('stats.jumps'),2);assert.equal(a.run('boost'),0);assert.ok(a.run('window.rooftopReplay.minSpeed')>14);
});
test('the retained burning-quarter climb still connects to its moving carrier and hallway',()=>{
 const a=begin(20);for(let f=0;f<450;f++)if(a.run('stepRooftopFlow(8)'))break;
 a.run(transferSource);for(const id of ['draw-burning-left','draw-burning-right','draw-burning-top','draw-moving-carrier','draw-hazard-hall'])a.run(`transferTo('${id}')`);
 assert.equal(a.run('p.surface?.id'),'draw-hazard-hall');assert.equal(a.run('stats.deaths'),0);assert.equal(a.run('stats.hits'),0);assert.equal(a.run('boost'),0);
});
