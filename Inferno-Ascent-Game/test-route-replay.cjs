const {test}=require('node:test');
const assert=require('node:assert/strict');
const {boot}=require('./test-support.cjs');
// One initial placement skips the long existing approach; every transfer below
// uses ordinary movement, jump presses/releases, collision and enemy rules.
function begin(a){a.run(`const roof=surfaceById('mid-pool-roof-exit');p.x=roof.x1+100;p.y=yOn(roof,p.x)-20;p.surface=roof;p.ground=true;p.vx=0;p.vy=0;p.inv=0;boost=0;count=20;keys.clear();
function transferTo(id,vertical=false){const target=surfaceById(id);for(let f=0;f<240;f++){
 keys.delete('ArrowLeft');keys.delete('ArrowRight');
 if(p.ground&&p.surface.id===id){release('Space',true);return f}
 if(stats.deaths)throw Error('Death before '+id);
 if(p.ground){release('Space',true);const s=p.surface,dir=target.x1+target.x2>s.x1+s.x2?1:-1,edge=vertical?p.x:dir>0?s.x2-45:s.x1+45;
 const joined=dir>0?Math.abs(s.x2-target.x1)<2&&Math.abs(s.y2-target.y1)<2:Math.abs(s.x1-target.x2)<2&&Math.abs(s.y1-target.y2)<2;
 if(joined)keys.add(dir>0?'ArrowRight':'ArrowLeft');
 else if(vertical||dir*(edge-p.x)<4){press('Space',true);if(!vertical)keys.add(dir>0?'ArrowRight':'ArrowLeft')}
 else {const speed=p.vx*dir;if(speed<6.8)keys.add(dir>0?'ArrowRight':'ArrowLeft');else if(speed>7.4)keys.add(dir>0?'ArrowLeft':'ArrowRight')}
 }else{if(feet()<target.y1&&p.vy< -5&&target.y1>feet()+110)release('Space',true);
 const error=(target.x1+target.x2)/2-p.x;if(Math.abs(error)>35)keys.add(error>0?'ArrowRight':'ArrowLeft');else if(Math.abs(p.vx)>2)keys.add(p.vx>0?'ArrowLeft':'ArrowRight')}
 update();
 }throw Error('Unreachable '+id+' from '+p.surface?.id);
}`)}
test('secret exploration collects its monitor and returns through the low route to the retained tower using ordinary input',()=>{
 const a=boot();begin(a);
 a.run("transferTo('mid-secret-1',true)");for(let i=2;i<=6;i++)a.run(`transferTo('mid-secret-${i}')`);
 assert.equal(a.run('boost'),90);assert.equal(a.run('level.middleSection.secretRevealed'),true);
 for(const id of ['mid-secret-5','mid-secret-4','mid-secret-3','mid-secret-2','mid-secret-1','mid-tilted-glass-roof','mid-pool-roof-exit','mid-right-guard-roof','mid-low-transfer-1','mid-low-transfer-2','mid-low-transfer-3','mid-junction','mid-junction-building-1','mid-junction-building-2','secret-exit-uphill-link','neon-0'])a.run(`transferTo('${id}')`);
 assert.equal(a.run('stats.deaths'),0);assert.equal(a.run('p.surface.id'),'neon-0');assert.ok(a.run("level.checkpoints[checkpoint].surfaceId==='mid-junction'"));
 a.run('boost=0;die()');assert.equal(a.run('p.surface.id'),'mid-junction');assert.equal(a.run('boost'),0);assert.equal(a.run('p.wrongRouteDrop'),false);
 for(const monitor of a.run('level.monitors'))assert.equal(monitor.broken,false);
});
test('lower and moving recovery decks allow low-speed stops without sliding off',()=>{
 for(const kind of ['lower','recovery','moving']){const a=boot();a.run(`const s={id:'precision',x1:100,x2:380,y1:420,y2:420,kind:'${kind}'};level.surfaces=[s];level.rings=[];rings=[];enemies=[];level.pads=[];level.springs=[];level.monitors=[];level.hazards=[];level.deathZones=[];p.surface=s;p.x=180;p.y=400;p.ground=true;p.vx=5;keys.clear()`);a.call('step_game_frames',{keys:[],frames:35});assert.equal(a.run('p.surface.id'),'precision');assert.equal(a.run('p.vx'),0);assert.ok(a.run('p.x')<205)}
});
