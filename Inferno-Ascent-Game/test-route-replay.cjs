const {test}=require('node:test');
const assert=require('node:assert/strict');
const {boot}=require('./test-support.cjs');const {clearGuardSource,transferSource,aimHighSource}=require('./route-test-helpers.cjs');
// One initial placement skips the long existing approach; every transfer below
// uses ordinary movement, jump presses/releases, collision and enemy rules.
function begin(a){a.run(`const roof=surfaceById('mid-pool-roof-exit');p.x=roof.x1+100;p.y=yOn(roof,p.x)-20;p.surface=roof;p.ground=true;p.vx=0;p.vy=0;p.inv=0;boost=0;count=20;keys.clear();`);a.run(transferSource)}
test('secret exploration collects its monitor and returns through the low route to the retained tower using ordinary input',()=>{
 const a=boot();begin(a);
 a.run("transferTo('mid-low-transfer-1')");a.run("transferTo('mid-secret-1')");for(let i=2;i<=3;i++)a.run(`transferTo('mid-secret-${i}')`);
 assert.equal(a.run('boost'),0);assert.equal(a.run('p.shield'),'bubble');assert.equal(a.run('level.middleSection.secretRevealed'),true);
 for(const id of ['mid-secret-2','mid-secret-1','mid-low-transfer-1','mid-right-guard-roof','mid-low-transfer-2','mid-low-transfer-3','mid-junction','mid-junction-building-1','mid-junction-building-2','secret-exit-uphill-link','neon-0']){if(id==='mid-low-transfer-2')a.run(clearGuardSource);a.run(`transferTo('${id}')`);}
 assert.equal(a.run('stats.deaths'),0);assert.equal(a.run('p.surface.id'),'neon-0');assert.ok(a.run("level.checkpoints[checkpoint].surfaceId==='mid-junction'"));
 a.run('boost=0;die()');assert.equal(a.run('p.surface.id'),'mid-junction');assert.equal(a.run('boost'),0);assert.equal(a.run('p.wrongRouteDrop'),false);
 for(const monitor of a.run('level.monitors'))assert.equal(monitor.broken,false);
});
test('the four-platform reward detour returns to the low route without invented safety ledges',()=>{
 const a=boot();a.run(transferSource);a.run("const s=surfaceById('mid-secret-3');p.x=s.x1+100;p.y=s.y1-20;p.surface=s;p.ground=true;p.vx=0;boost=0;count=20;keys.clear();level.middleSection.secretRevealed=true");
 for(const id of ['mid-secret-4','mid-secret-3','mid-secret-2','mid-secret-1','mid-low-transfer-1'])a.run(`transferTo('${id}')`);
 assert.equal(a.run('p.surface.id'),'mid-low-transfer-1');assert.equal(a.run('stats.deaths'),0);assert.equal(a.run('level.surfaces.some(s=>s.secretDepth>4)'),false);
});
test('lower and moving recovery decks allow low-speed stops without sliding off',()=>{
 for(const kind of ['lower','recovery','moving']){const a=boot();a.run(`const s={id:'precision',x1:100,x2:380,y1:420,y2:420,kind:'${kind}'};level.surfaces=[s];level.rings=[];rings=[];enemies=[];level.pads=[];level.springs=[];level.monitors=[];level.hazards=[];level.deathZones=[];p.surface=s;p.x=180;p.y=400;p.ground=true;p.vx=5;keys.clear()`);a.call('step_game_frames',{keys:[],frames:60});assert.equal(a.run('p.surface.id'),'precision');assert.equal(a.run('p.vx'),0);assert.ok(a.run('p.x')<310)}
});
