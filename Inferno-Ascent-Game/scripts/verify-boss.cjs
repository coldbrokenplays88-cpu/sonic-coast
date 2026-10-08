const assert=require('node:assert/strict'),fs=require('node:fs');const {chromium}=require('playwright');
(async()=>{const browser=await chromium.launch({executablePath:process.env.SONIC_CHROMIUM||'/usr/bin/chromium',headless:true,args:['--no-sandbox']});
try{const page=await browser.newPage({viewport:{width:1440,height:1000}}),errors=[];await page.addInitScript(()=>{const AudioNative=window.Audio;window.musicCheck=[];window.Audio=function(...args){const a=new AudioNative(...args);window.musicCheck.push(a);return a;};window.Audio.prototype=AudioNative.prototype;});page.on('pageerror',e=>errors.push(e.message));await page.goto(process.argv[2]||'http://127.0.0.1:8002');await page.waitForFunction(()=>art.scorpion&&scorpionParts.size===8);
await page.evaluate(()=>{start();testControlled=true;const d=level.surfaces.find(s=>s.id==='summit-arena');p.x=level.arena.x+540;p.y=d.y1-20;p.vx=0;p.vy=0;p.ground=true;p.surface=d;p.inv=0;cam=level.arena.x+210;camY=level.arena.y-505;update();});
const stages=[];for(const [state,age,name]of [['entrance',80,'boss-entrance'],['idle',0,'boss-armored'],['bite-open',20,'boss-bite']]){
 await page.evaluate(([state,age])=>{boss.state=state;boss.age=age;boss.biteX=level.arena.x+640;boss.anchored=state!=='entrance';for(let i=0;i<100;i++)updateCamera();p.inv=0;draw();},[state,age]);
 await page.locator('#game').screenshot({path:'../docs/validation/'+name+'.png'});stages.push(name);
}
// Reset to the same entry, then only use normal directional/jump controls.
const result=await page.evaluate(()=>{restart();testControlled=true;const d=level.surfaces.find(s=>s.id==='summit-arena');p.x=level.arena.x+540;p.y=d.y1-20;p.vx=0;p.vy=0;p.ground=true;p.surface=d;p.inv=0;cam=level.arena.x+210;camY=level.arena.y-505;update();const history=[],visited=new Set(),attacks={tail:0,laser:0};window.bossSnapshots=[];
 const held=new Set();function inputs(next){for(const k of held)if(!next.includes(k)){release(k,true);held.delete(k);}for(const k of next)if(!held.has(k)){press(k,true);held.add(k);}}
 for(let f=0;f<3600&&mode==='playing';f++){
  const g=window.scorpionGeometry(boss),s=boss.state;let target=level.arena.x+500,buttons=[];
  if(s==='tail-windup'||s==='tail-strike'||s==='tail-retract')target=boss.target.x>level.arena.x+500?level.arena.x+420:level.arena.x+650;
  if(s==='laser-windup'||s==='laser-fire'||s==='laser-cool')target=boss.target.x<level.arena.x+500?level.arena.x+650:level.arena.x+330;
  if(['bite-windup','bite-lunge','bite-hold'].includes(s))target=boss.biteX-145;
  if(s==='bite-open')target=g.eyes[boss.hits===1?1:0].x;
  if(!bossOwnsControls()){
   const gap=target-p.x,lead=p.ground?p.vx*Math.abs(p.vx)/1.6:p.vx*8,error=gap-lead;
   if(Math.abs(error)>8)buttons.push(error>0?'ArrowRight':'ArrowLeft');
   if(s==='bite-open'&&p.ground&&Math.abs(gap)<75&&!keys.has('Space'))buttons.push('Space');
   if(!p.ground&&p.jumpAttack)buttons.push('Space');
  }
  inputs(buttons);update();if(boss.event==='tail-strike')attacks.tail++;if(boss.event==='laser-fire')attacks.laser++;if(['laser-fire','hit'].includes(boss.state)&&boss.age===1)window.bossSnapshots.push({boss:JSON.parse(JSON.stringify(boss)),player:{x:p.x,y:p.y},frame:runFrames});if(!visited.has(s)){visited.add(s);history.push({frame:f,state:s,x:Math.round(p.x-level.arena.x),hits:boss.hits});}
 }inputs([]);draw();return {status:mode,hits:boss.hits,bites:boss.bites,deaths:stats.deaths,damage:stats.hits,history,cache:scorpionStamps.size,frames:runFrames,tailStrikes:attacks.tail,laserShots:attacks.laser};});
console.log(JSON.stringify(result,null,2));assert.equal(result.status,'win','normal input controller must finish the boss');assert.equal(result.hits,3);assert.equal(result.bites,3);assert.equal(result.tailStrikes,4);assert.equal(result.laserShots,3);assert.equal(result.deaths,0);assert.ok(result.cache<260);assert.deepEqual(errors,[]);
await page.locator('#game').screenshot({path:'../docs/validation/boss-defeated.png'});fs.writeFileSync('../docs/validation/boss-replay.json',JSON.stringify(result,null,2)+'\n');
for(const [i,name]of [[0,'boss-first-glass'],[1,'boss-broken-glass'],[2,'boss-laser']]){await page.evaluate(i=>{const snap=window.bossSnapshots[i];boss=snap.boss;Object.assign(p,snap.player);p.inv=0;runFrames=snap.frame;mode='playing';$('#overlay').classList.add('hidden');updateHud();draw();},i);await page.locator('#game').screenshot({path:'../docs/validation/'+name+'.png'});}
await page.evaluate(()=>{selectAct(1);start();testControlled=true});await page.locator('#sound').click();await page.waitForFunction(()=>window.musicCheck[0]?.currentTime>0);
assert.ok(await page.evaluate(()=>window.musicCheck[0].src.endsWith('neon-express-act1-music.mp3')));
await page.evaluate(()=>{selectAct(2);start();testControlled=true});await page.waitForFunction(()=>window.musicCheck[0]?.src.endsWith('city-music.mp3')&&window.musicCheck[0].currentTime>0);assert.equal(await page.evaluate(()=>window.musicCheck.length),1);assert.deepEqual(errors,[]);
console.log('Boss browser replay, phase screenshots and both actual music tracks passed.');
}finally{await browser.close();}})().catch(e=>{console.error(e);process.exitCode=1});
