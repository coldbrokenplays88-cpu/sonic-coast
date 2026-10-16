const {test}=require('node:test');
const assert=require('node:assert/strict');
const {boot}=require('./test-support.cjs');

test('Act 1: holding Left for 200 ticks stops at the world edge with zero velocity',()=>{
 const a=boot(1);
 a.run("keys.add('ArrowLeft');for(let i=0;i<200;i++)update()");
 assert.equal(a.run('p.x'),24);
 assert.equal(a.run('p.vx'),0);
 a.run("keys.clear();keys.add('ArrowRight');update()");
 assert.ok(a.run('p.x')>24,'turning away from the edge must move immediately');
});

test('both world edges clear horizontal velocity only when position is clamped',()=>{
 const a=boot(1);
 for(const [x,vx,expected] of [[25,-12,24],[a.run('END')+249,12,a.run('END')+250]]){
  a.run(`Object.assign(p,{x:${x},y:-2000,vx:${vx},vy:0,ground:false,surface:null});integrateSurfaceStep(1)`);
  assert.equal(a.run('p.x'),expected);
  assert.equal(a.run('p.vx'),0);
 }
 a.run('p.x=500;p.vx=12;integrateSurfaceStep(1)');
 assert.equal(a.run('p.vx'),12,'free movement keeps its velocity');
});
