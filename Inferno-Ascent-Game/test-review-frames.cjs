const {test}=require('node:test');
const assert=require('node:assert/strict');
const {boot}=require('./test-support.cjs');
function frames(mode='playing',controlled=false){
 const a=boot(1);a.run(`mode='${mode}';testControlled=${controlled};var draws=0,updates=0;draw=()=>draws++;update=()=>updates++;last=100;acc=0;`);return a;
}
test('a playing frame draws only after at least one fixed update',()=>{
 const a=frames();a.run('frame(108)');assert.equal(a.run('draws'),0);assert.equal(a.run('updates'),0);
 a.run('frame(117)');assert.equal(a.run('draws'),1);assert.equal(a.run('updates'),1);
 a.run('frame(125)');assert.equal(a.run('draws'),1);
 a.run('frame(180)');assert.equal(a.run('draws'),2);assert.ok(a.run('updates')>2,'multiple catch-up updates still draw once');
});
test('test-controlled and non-playing frames always draw',()=>{
 for(const [mode,controlled]of [['playing',true],['ready',false],['paused',false],['win',false],['over',false]]){
  const a=frames(mode,controlled);a.run('frame(108)');assert.equal(a.run('draws'),1,`${mode} ${controlled}`);
 }
});
