const {test}=require('node:test');
const assert=require('node:assert/strict');
const {boot}=require('./test-support.cjs');

test('crossing into the pool changes velocity and plays splash on the crossing tick',()=>{
 const a=boot(2);
 a.run(`var heard=[];gameSound=name=>heard.push(name);const pool=level.middleSection.pool;
 p.x=(pool.x1+pool.x2)/2;p.y=pool.y-1;p.vx=8;p.vy=4;p.ground=false;p.surface=null;p.underwater=false;keys.clear();update()`);
 assert.equal(a.run('p.underwater'),true);
 assert.equal(a.run('p.vx'),4);
 assert.ok(Math.abs(a.run('p.vy')-1.145)<1e-10);
 assert.equal(a.run("heard.filter(n=>n==='pool').length"),1);
});

test('a player placed inside the pool gets water physics before moving',()=>{
 const a=boot(2);
 a.run(`var heard=[];gameSound=name=>heard.push(name);const pool=level.middleSection.pool;
 p.x=(pool.x1+pool.x2)/2;p.y=pool.y+10;p.vx=8;p.vy=0;p.ground=false;p.surface=null;p.underwater=false;keys.clear();var startX=p.x;updateMovement()`);
 assert.equal(a.run('p.x-startX'),4);
 assert.ok(Math.abs(a.run('p.vy')-.58*2/7)<1e-10);
 assert.equal(a.run("heard.filter(n=>n==='pool').length"),1);
});
