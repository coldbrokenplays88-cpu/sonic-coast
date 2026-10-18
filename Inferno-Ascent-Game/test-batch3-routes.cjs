const {test}=require('node:test'),assert=require('node:assert/strict');
const {boot}=require('./test-support.cjs');
const {startLoopSource}=require('./blimp-test-helpers.cjs');

test('ordinary running clears both loops and reaches the normal roof without jumping',()=>{
 const a=boot();a.run(startLoopSource+"startLoop(0,'run');for(let i=0;i<650&&!visited.has('draw-loop-payoff-roof')&&!stats.deaths;i++)update()");
 assert.equal(a.run('stats.loops'),2);assert.equal(a.run('stats.jumps'),0);assert.equal(a.run('stats.deaths'),0);assert.ok(a.run("visited.has('draw-loop-payoff-roof')"));assert.equal(a.run('level.blimpRoute.entered'),false);
});
test('earned Spin Dash momentum activates the secret spring without a jump or boost',()=>{
 const a=boot();a.run(startLoopSource+"startLoop();for(let i=0;i<300&&!level.blimpRoute.entered&&!stats.deaths;i++)update()");
 assert.equal(a.run('stats.jumps'),0);assert.equal(a.run('stats.deaths'),0);assert.ok(a.run('level.blimpRoute.entered'));assert.ok(a.run('level.blimpRoute.departureSpeed')>=24);
});
test('upper springs are upright and no longer inject sideways launch velocity',()=>{
 const a=boot();a.run("var high=level.springs.filter(d=>d.id.startsWith('mid-')&&d.id!=='mid-low-spring')");assert.equal(a.run('high.length'),6);assert.equal(a.run('high.every(d=>polishDirection(d)===0&&(d.launchX??0)===0)'),true);
});
test('spring route contains only the four authored reward ledges and no spring boost box',()=>{
 const a=boot();assert.equal(a.run("level.surfaces.filter(s=>s.secretDepth).length"),4);assert.equal(a.run("level.monitors.some(m=>m.id==='mid-rail-monitor')"),false);assert.ok(a.run("level.monitors.some(m=>m.id==='mid-secret-monitor')"));assert.equal(a.run("surfaceById('mid-wrong-decision').x2-surfaceById('mid-wrong-decision').x1"),58);
});
test('moving spring pose, active face, and launch effects follow the same moving anchor',()=>{
 for(const t of [0,40,80,120,180,240,280]){const a=boot();a.run(`runFrames=${t};var d=level.springs.find(d=>d.id==='mid-moving-spring'),q=airDevicePose(d),f=springFace(d);particles=[];launchAirDevice(d)`);assert.equal(a.run('f.x'),a.run('q.x'));assert.equal(a.run('f.y'),a.run('q.y-40'));assert.equal(a.run('particles[0].x'),a.run('q.x'));assert.equal(a.run('particles[0].y'),a.run('q.y-10'));}
});
test('landing elsewhere or spending an air boost invalidates ramp qualification',()=>{
 const a=boot();a.run("var r=level.blimpRoute;Object.assign(r,{departureFrame:runFrames,departureSpeed:26});p.airBoostUsed=false");assert.ok(a.run('qualifyingBlimpEntry()'));
 a.run("onBlimpLanding(surfaceById('draw-loop-payoff-roof'))");assert.equal(a.run('qualifyingBlimpEntry()'),false);
 a.run("Object.assign(r,{departureFrame:runFrames,departureSpeed:26});p.ground=false;p.face=1;p.airBoostRequested=true;updateBoostState(true);p.airBoostUsed=false");assert.equal(a.run('qualifyingBlimpEntry()'),false,'air-boost qualification cannot return after landing resets its used flag');
});
test('Split Skyline express approach is physical at low speed and its rail remains free boost',()=>{
 const a=boot();a.run("var s=level.surfaces.find(s=>s.routeType==='boost'&&s.entrySpeed===19&&s.solidAtAnySpeed&&s.id.includes('194'));p.x=s.x1+60;p.y=yOn(s,p.x)-24;p.vx=2;p.vy=8;p.ground=false;p.surface=null;moveAndResolveSurfaces()");assert.equal(a.run('p.surface?.id'),a.run('s.id'));assert.ok(a.run('level.monitors.some(m=>m.required&&m.x<s.x1&&s.x1-m.x<1000)'));
 a.run("s=level.surfaces.find(s=>s.id.includes('196')&&s.grindable);p.surface=s;p.ground=true;boost=0;updateBoostState(true)");assert.ok(a.run('p.boosting'));assert.equal(a.run('boost'),0);
});

test('the upper route is reachable from the real choice entrance, including an unfavorable hoist phase',()=>{
 for(const phase of [0,120]){const a=boot();a.run(require('./route-test-helpers.cjs').aimHighSource+`runFrames=${phase};const entry=surfaceById('mid-fallen-building');p.x=level.middleSection.start+700;p.y=yOn(entry,p.x)-20;p.surface=entry;p.ground=true;p.vx=6;p.vy=0;p.inv=0;boost=0;count=20;keys.clear();press('ArrowRight',true);press('Space',true);for(let i=0;i<1000;i++){if(level.springs.find(d=>d.id==='mid-upper-spring').firedAt!==undefined)aimHigh();if(p.surface?.grindable){keys.clear();keys.add('ShiftLeft');keys.add('ArrowRight')}update();if(p.surface?.id==='mid-junction')break;}`);
 assert.equal(a.run('p.surface?.id'),'mid-junction');assert.equal(a.run('stats.hits+stats.deaths'),0);assert.equal(a.run("level.springs.filter(d=>d.id.startsWith('mid-')&&d.id!=='mid-low-spring'&&d.firedAt!==undefined).length"),6);}
});
