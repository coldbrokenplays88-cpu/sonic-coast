// Actual Chromium parity checks against an immutable served baseline.
// Usage: node scripts/verify-stage-runtime.cjs <baseline URL> <working URL>
// Requires Playwright/Chromium; output defaults to /tmp, never existing previews.
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto');
const digest=value=>crypto.createHash('sha256').update(JSON.stringify(value)).digest('hex');

function compareSnapshots(before,after){
 assert.deepEqual(before.errors,[],'baseline page errors');
 assert.deepEqual(after.errors,[],'working page errors');
 assert.equal(before.finalMode,'win','baseline ending must complete');
 assert.equal(after.finalMode,'win','working ending must complete');
 for(const field of ['acts','renders','ending','endingPoses','traces','sounds','fallbacks','requests'])
  assert.deepEqual(after[field],before[field],field+' changed from the baseline');
 return {
  acts:before.acts.map(({act,surfaces,enemies,checkpoints,geometry})=>({act,surfaces,enemies,checkpoints,geometrySha256:digest(geometry)})),
  renderedViews:before.renders.length,
  pixelHashesMatched:before.renders.length+before.ending.length,
  endingFrames:before.ending.length,
  endingPoseTicksMatched:before.endingPoses.length,
  movementTicksMatched:before.traces.reduce((n,t)=>n+t.states.length,0),
  soundCallsMatched:before.sounds.length,
  fallbackFramesMatched:before.fallbacks.reduce((n,c)=>n+c.frames.length,0),
  fallbackCases:before.fallbacks.map(c=>c.name),
  renderHashesSha256:digest(before.renders),endingPixelsSha256:digest(before.ending),
  movementTraceSha256:digest(before.traces),soundCallsSha256:digest(before.sounds),
  fallbackSha256:digest(before.fallbacks),assetRequestsIdentical:true,pageErrors:[],endingResult:'win'
 };
}

async function captureMain(browser,url){
 const page=await browser.newPage({viewport:{width:1440,height:1000}}),errors=[],requests=[];
 try{
  page.on('pageerror',e=>errors.push(e.message));
  page.on('request',r=>{if(r.url().includes('/assets/'))requests.push(new URL(r.url()).pathname.split('/').pop());});
  await page.addInitScript(()=>{window.requestAnimationFrame=()=>0;let seed=0x518aeab;Math.random=()=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed/4294967296;};});
  await page.goto(url);
  await page.waitForFunction(()=>endingArtReady()&&['recoveredCity','recoveredSpeedster','recoveredPeelout','city','collapse','sonic','motion','boost','brake','grind','detail','wind','transitions','supplemental','peeloutCycle','scorpion'].every(k=>art[k]));
 const result=await page.evaluate(async()=>{
  const hash=async()=>Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256',ctx.getImageData(0,0,canvas.width,canvas.height).data))).map(n=>n.toString(16).padStart(2,'0')).join('');
  const result={acts:[],renders:[],ending:[],endingPoses:[],traces:[],sounds:[]};const emit=gameSound;gameSound=(name,options)=>{result.sounds.push({step,runFrames,name,options:options??null});return emit(name,options)};
  function place(s){p.x=(s.x1+s.x2)/2;p.y=yOn(s,p.x)-20;p.vx=7;p.vy=0;p.surface=s;p.ground=true;p.inv=0;p.hurt=0;p.rolling=false;p.roll=false;p.boosting=false;p.loop=null;cam=p.x-340;camY=p.y-330;zoom=.85;runFrames=120;step=120;keys.clear();boss=null;ending=null;}
  for(const act of [1,2]){
   selectAct(act);start();testControlled=true;
   const geometry=JSON.stringify(level);result.acts.push({act,geometry,surfaces:level.surfaces.length,enemies:level.enemies.length,checkpoints:level.checkpoints.length,monitors:level.monitors.length});
   for(const s of level.surfaces){place(s);draw();result.renders.push({act,id:s.id,hash:await hash()});}
   if(act===2){for(const h of level.hazards)if(h.type==='breakable')h.broken=true;level.middleSection.secretRevealed=true;for(const s of level.surfaces.filter(s=>s.sealedBy||s.secretDepth)){place(s);draw();result.renders.push({act,id:s.id+'/revealed',hash:await hash()});}}
   for(const action of ['run','ground-brake','air-brake','coast','boost-release','spindash','short-jump','full-jump']){
    selectAct(act);start();testControlled=true;count=20;p.inv=10000;const s=level.surfaces[0];p.x=300;p.y=yOn(s,300)-20;p.surface=s;p.ground=true;p.vx=['ground-brake','air-brake','coast'].includes(action)?23:0;p.vy=0;
    if(['air-brake','coast'].includes(action)){p.ground=false;p.surface=null;p.y=-1400;}
    if(['run','boost-release'].includes(action))press('ArrowRight',true);
    if(['ground-brake','air-brake'].includes(action))press('ArrowLeft',true);
    if(action==='boost-release')press('ShiftLeft',true);
    if(action==='spindash'){press('ArrowDown',true);press('Space',true);}
    if(action.endsWith('jump'))press('Space',true);
    const states=[];for(let tick=0;tick<90;tick++){if(action==='boost-release'&&tick===35)release('ShiftLeft',true);if(action==='spindash'&&tick===60){release('ArrowDown',true);release('Space',true);}if(action==='short-jump'&&tick===3)release('Space',true);update();states.push({p:{...p,surface:p.surface?.id??null},cam,camY,zoom,boost,charge,count,lives,checkpoint,clock,mode,stats:{...stats}});}
    keys.clear();result.traces.push({act,action,states});
   }
  }
  selectAct(2);start();testControlled=true;const s=surfaceById('summit-arena');p.x=level.arena.x+650;p.y=s.y1-20;p.surface=s;p.ground=true;update();boss.state='defeated';boss.hits=3;cam=level.arena.x+210;camY=level.arena.y-505;zoom=.8;update();
  while(!ending.done){result.endingPoses.push(window.endingPose(ending));draw();result.ending.push(await hash());update();}result.finalMode=mode;
  return result;
 });

  result.errors=errors;result.requests=[...new Set(requests)].sort();return result;
 }finally{await page.close()}
}

const cases=[['single-recovered-sheet-missing',['sonic-recovered-speedster.png']],['legacy-sonic',['sonic-recovered-speedster.png','sonic-recovered-peelout.png']],['procedural-sonic',['sonic-recovered-speedster.png','sonic-recovered-peelout.png','sonic-expressive.png','sonic-motion.png','sonic-boost.png','sonic-brake.png','sonic-grind.png','sonic-detail.png','sonic-wind.png','sonic-transitions.png','sonic-supplemental.png','sonic-peelout-cycle.png']],['older-city',['city-recovered-burning.png']],['no-city',['city-recovered-burning.png','city-collapse.png','city.png']]];
const names={recoveredCity:'city-recovered-burning.png',recoveredSpeedster:'sonic-recovered-speedster.png',recoveredPeelout:'sonic-recovered-peelout.png',city:'city.png',collapse:'city-collapse.png',sonic:'sonic-expressive.png',motion:'sonic-motion.png',boost:'sonic-boost.png',brake:'sonic-brake.png',grind:'sonic-grind.png',detail:'sonic-detail.png',wind:'sonic-wind.png',transitions:'sonic-transitions.png',supplemental:'sonic-supplemental.png',peeloutCycle:'sonic-peelout-cycle.png',scorpion:'egg-scorpion-parts.png'};

async function captureFallbacks(browser,url){
 const output=[];
 for(const [name,blocked]of cases){
  const page=await browser.newPage({viewport:{width:1440,height:1000}}),errors=[];
  try{
   page.on('pageerror',e=>errors.push(e.message));
   await page.addInitScript(()=>{window.requestAnimationFrame=()=>0;Math.random=()=>.25});
   await page.route('**/assets/*.png*',r=>blocked.includes(new URL(r.request().url()).pathname.split('/').pop())?r.abort():r.continue());
   await page.goto(url);
   await page.waitForFunction(keys=>endingArtReady()&&keys.every(k=>art[k]),Object.keys(names).filter(k=>!blocked.includes(names[k])));
const frames=await page.evaluate(async()=>{const output=[];for(const act of [1,2]){selectAct(act);start();testControlled=true;for(const state of ['idle','run','boost','brake','hurt','rise','fall','grind']){const s=state==='grind'?(level.surfaces.find(s=>s.grindable)||level.surfaces[0]):level.surfaces[0];Object.assign(p,{x:s.x1+120,y:yOn(s,s.x1+120)-20,vx:state==='run'?8:state==='idle'?0:20,vy:state==='rise'?-8:state==='fall'?10:0,ground:!['rise','fall'].includes(state),surface:s,inv:0,hurt:state==='hurt'?20:0,boosting:state==='boost',rolling:false,roll:false,loop:null,brakeActive:state==='brake',brakeAge:6,brakeFace:1});keys.clear();runFrames=122;step=120;cam=p.x-240;camY=p.y-330;zoom=.85;draw();const bytes=ctx.getImageData(0,0,canvas.width,canvas.height).data;const hash=Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256',bytes))).map(n=>n.toString(16).padStart(2,'0')).join('');output.push({act,state,hash});}}return output;});
   assert.deepEqual(errors,[],'fallback page errors: '+name);output.push({name,frames});
  }finally{await page.close()}
 }
 return output;
}

async function main(){
 const [baselineUrl,workingUrl]=process.argv.slice(2);
 if(!baselineUrl||!workingUrl)throw Error('Usage: node scripts/verify-stage-runtime.cjs <baseline URL> <working URL>');
 const {chromium}=require('playwright');
 const browser=await chromium.launch({executablePath:process.env.SONIC_CHROMIUM||'/usr/bin/chromium',headless:true,args:['--no-sandbox']});
 try{
  const before=await captureMain(browser,baselineUrl),after=await captureMain(browser,workingUrl);
  before.fallbacks=await captureFallbacks(browser,baselineUrl);after.fallbacks=await captureFallbacks(browser,workingUrl);
  const summary=compareSnapshots(before,after),out=process.env.STAGE_OUTPUT||'/tmp/sonic-stage-runtime-validation';
  fs.mkdirSync(out,{recursive:true});
  fs.writeFileSync(path.join(out,'baseline-snapshot.json'),JSON.stringify(before));
  fs.writeFileSync(path.join(out,'working-snapshot.json'),JSON.stringify(after));
  fs.writeFileSync(path.join(out,'parity-summary.json'),JSON.stringify(summary,null,2)+'\n');
  console.log(JSON.stringify(summary,null,2));
 }finally{await browser.close()}
}

module.exports={compareSnapshots};
if(require.main===module)main().catch(error=>{console.error(error);process.exitCode=1});
