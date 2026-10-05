const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs'),vm=require('node:vm');
function boot(act=2){
 const tools=new Map(),elements=new Map(),events=new Map();
 const ctx=new Proxy({},{get:(_,name)=>name==='getTransform'?undefined:name==='createLinearGradient'?()=>({addColorStop(){}}):()=>{}});
 const element=()=>({style:{},classList:{add(){},remove(){}},getContext:()=>ctx,focus(){},addEventListener(){},setAttribute(){},matches:()=>false});
 const document={querySelector:s=>{if(!elements.has(s))elements.set(s,element());return elements.get(s)},querySelectorAll:()=>[],modelContext:{registerTool:t=>tools.set(t.name,t)}};
 const window={DEFAULT_ACT:act,addEventListener:(n,f)=>events.set(n,f)};
 const c=vm.createContext({document,window,Image:class{},AbortController,requestAnimationFrame(){},console});
 for(const file of ['level.js','level2-original.js','level2-restoration.js','level2.js','act2.js','pixel-world.js','game.js'])vm.runInContext(fs.readFileSync(file,'utf8'),c,{filename:file});
 vm.runInContext('start()',c);
 return {c,tools,events,run:s=>vm.runInContext(s,c),call:(name,arg={})=>{assert.ok(tools.has(name),'Missing tool: '+name);return tools.get(name).execute(arg)}};
}
test('registers timed input tool',()=>{assert.ok(boot().tools.has('step_game_frames'));});
for(const act of [1,2])test('held movement uses exact normal physics in act '+act,()=>{
 const a=boot(act),b=boot(act);
 const r=a.call('step_game_frames',{keys:['right'],frames:60});
 b.run("press('ArrowRight');for(let i=0;i<60;i++)update();release('ArrowRight')");
 assert.equal(r.x,b.run('p.x'));assert.equal(r.vx,b.run('p.vx'));
 assert.equal(r.framesAdvanced,60);assert.equal(a.run('keys.size'),0);
 assert.ok(r.x>120);assert.equal(a.run('runFrames'),60);
});
test('held jump rises higher than a tap',()=>{
 const a=boot(),b=boot();
 const held=a.call('step_game_frames',{keys:['jump'],frames:12});
 b.call('step_game_frames',{keys:['jump'],frames:1});
 const tap=b.call('step_game_frames',{keys:[],frames:11});
 assert.ok(held.y<tap.y);assert.equal(held.jumps,1);assert.equal(a.run('p.jumpHeld'),false);
});
test('boost accelerates and consumes boost',()=>{
 const a=boot();const r=a.call('step_game_frames',{keys:['right','boost'],frames:10});
 assert.ok(r.vx>15);assert.ok(r.boost<90);assert.equal(a.run('keys.size'),0);
});
test('roll and spin dash use the existing handlers',()=>{
 const a=boot();a.call('step_game_frames',{keys:['down','jump'],frames:1});
 const r=a.call('step_game_frames',{keys:[],frames:1});
 assert.ok(r.vx>10);assert.ok(r.rolls>=1);
});
test('inspection freezes simulation and physical input restores it',()=>{
 const a=boot();a.call('step_game_frames',{keys:['right'],frames:30});
 const x=a.run('p.x');a.run('frame(1000);frame(1100)');
 assert.equal(a.run('p.x'),x);a.run("press('ArrowRight');frame(1200)");
 assert.ok(a.run('p.x')>x);
});
test('invalid requests fail before changing state',()=>{
 const a=boot();for(const input of [{keys:['teleport'],frames:1},{keys:['right'],frames:0},{keys:[],frames:601},{keys:[],frames:1.5},{keys:[],frames:1,extra:true},{keys:['left','right'],frames:1}]){
 assert.throws(()=>a.call('step_game_frames',input));assert.equal(a.run('runFrames'),0);
 }
});
test('stops on death and releases all controls',()=>{
 const a=boot();a.run('p.x=2000;p.y=10000;p.ground=false;p.surface=null');
 const r=a.call('step_game_frames',{keys:['right','boost'],frames:60});
 assert.equal(r.deaths,1);assert.equal(r.framesAdvanced,1);assert.equal(a.run('keys.size'),0);
});
test('restart restores ordinary playback',()=>{
 const a=boot();a.call('step_game_frames',{keys:[],frames:1});a.call('restart_game');
 assert.equal(a.run('testControlled'),false);assert.equal(a.run('runFrames'),0);
});
