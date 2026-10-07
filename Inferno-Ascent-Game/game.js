'use strict';
const canvas=document.querySelector('#game'),ctx=canvas.getContext('2d'),$=s=>document.querySelector(s);
const W=960,H=540,SONIC_VISUAL_SCALE=1.07,FOOT_RADIUS=9,keys=new Set(),JUMP_KEYS=['Space','ArrowUp','KeyW'];
const tuning={lives:3,inv:78,coyote:6,buffer:8},BOOST_MAX=90;
let testControlled=false;
let selectedAct=window.DEFAULT_ACT===2?2:1;
let level,END=29000,mode='ready',cam=0,camY=0,zoom=1,clock=0,lives=3,count=0,score=0,charge=0,checkpoint=0,toastTime=0,audio=null,sound=false,particles=[],rings=[],enemies=[],last=0,acc=0,step=0,boost=BOOST_MAX,shake=0,anim=0,jumpBuffer=0,coyote=0,stage=0,runFrames=0;
let stats={jumps:0,rolls:0,hits:0,deaths:0,expressLandings:0,recoveries:0,rebound:0,maxSpeed:0,loops:0,barriers:0},visited=new Set();
const p={x:120,y:400,vx:0,vy:0,ground:false,face:1,inv:0,roll:false,boosting:false,surface:null,hurt:0,jumpAttack:false,airSpeedLimit:null,jumpHeld:false,jumpCut:false,boostLocked:false,rolling:false,rollAge:0,lowRollFrames:0,rollSpent:false,downHeld:false,rollBuffer:0};
const extraMotion={"detail":{"frames":[[39,53,253,320],[299,52,504,320],[553,52,751,320],[805,52,1012,320],[1057,50,1262,320],[1308,47,1510,320],[31,365,256,630],[294,364,512,635],[568,363,760,631],[779,365,1024,639],[1071,363,1267,635],[1301,365,1514,635],[28,727,249,936],[307,682,512,957],[565,682,768,957],[808,734,1017,942],[1044,712,1271,957],[1280,717,1525,958]],"scales":[0.21245421245421245,0.21245421245421245,0.21245421245421245,0.21245421245421245,0.21245421245421245,0.21245421245421245,0.2116788321167883,0.2116788321167883,0.2116788321167883,0.2116788321167883,0.2116788321167883,0.2116788321167883,0.2109090909090909,0.2109090909090909,0.2109090909090909,0.2109090909090909,0.2109090909090909,0.2109090909090909]},"wind":{"frames":[[21,37,251,250],[272,42,509,251],[527,36,759,253],[776,36,1009,253],[1031,37,1265,251],[1287,35,1514,251],[24,285,256,501],[285,292,512,501],[543,292,760,501],[784,292,1012,501],[1048,285,1263,501],[1299,292,1509,501],[14,526,256,736],[287,534,512,738],[527,532,768,738],[796,535,1024,738],[1050,527,1274,738],[1290,539,1527,738],[23,775,256,993],[275,770,512,1002],[535,775,768,994],[815,784,1024,994],[1074,775,1277,998],[1309,769,1500,999]],"scales":[0.2672811059907834,0.2672811059907834,0.2672811059907834,0.2672811059907834,0.2672811059907834,0.2672811059907834,0.26851851851851855,0.26851851851851855,0.26851851851851855,0.26851851851851855,0.26851851851851855,0.26851851851851855,0.27488151658767773,0.27488151658767773,0.27488151658767773,0.27488151658767773,0.27488151658767773,0.27488151658767773,0.25,0.25,0.25,0.25,0.25,0.25]},"transitions":{"frames":[[55,37,352,362],[403,119,697,362],[763,76,1044,362],[1144,48,1403,362],[34,420,362,724],[427,441,685,724],[754,425,1085,724],[1147,422,1416,724],[67,772,325,1024],[421,770,677,1024],[776,770,1033,1024],[1141,770,1397,1026]],"scales":[0.17846153846153845,0.17846153846153845,0.17846153846153845,0.17846153846153845,0.19078947368421054,0.19078947368421054,0.19078947368421054,0.19078947368421054,0.2265625,0.2265625,0.2265625,0.2265625]}};
const art={};for(const [name,file]of Object.entries({city:'city.png',collapse:'city-collapse.png',sonic:'sonic-expressive.png',motion:'sonic-motion.png',boost:'sonic-boost.png',brake:'sonic-brake.png',grind:'sonic-grind.png',detail:'sonic-detail.png',wind:'sonic-wind.png',transitions:'sonic-transitions.png',objects:'objects.png',supplemental:'sonic-supplemental.png',peeloutCycle:'sonic-peelout-cycle.png',recoveredSpeedster:'sonic-recovered-speedster.png',recoveredPeelout:'sonic-recovered-peelout.png',recoveredCity:'city-recovered-burning.png'})){const image=new Image();image.onload=()=>{art[name]=image;if(name==='city'||name==='collapse'||name==='recoveredCity')cityTexture(image);if(name==='objects')art.objectOutline=makeObjectOutline(image)};image.src='assets/'+file}
// Scale2x reconstructs corners using existing colors only; no soft interpolation.
function reconstructPixels(source,w,h){const out=new Uint32Array(w*h*4),ow=w*2;for(let y=0;y<h;y++)for(let x=0;x<w;x++){const e=source[y*w+x],b=source[Math.max(0,y-1)*w+x],d=source[y*w+Math.max(0,x-1)],f=source[y*w+Math.min(w-1,x+1)],v=source[Math.min(h-1,y+1)*w+x],i=y*2*ow+x*2,edge=b!==v&&d!==f;out[i]=edge&&d===b?d:e;out[i+1]=edge&&b===f?f:e;out[i+ow]=edge&&d===v?d:e;out[i+ow+1]=edge&&v===f?f:e}return out}
const cityTextureCache=new WeakMap();
function cityTexture(im){if(cityTextureCache.has(im))return cityTextureCache.get(im);if(!document.createElement)return im;try{const source=document.createElement('canvas');source.width=im.width;source.height=im.height;const sc=source.getContext('2d',{willReadFrequently:true});sc.drawImage(im,0,0);const pixels=sc.getImageData(0,0,im.width,im.height),sharp=document.createElement('canvas');sharp.width=im.width*2;sharp.height=im.height*2;const dc=sharp.getContext('2d'),result=dc.createImageData(sharp.width,sharp.height);new Uint32Array(result.data.buffer).set(reconstructPixels(new Uint32Array(pixels.data.buffer),im.width,im.height));dc.putImageData(result,0,0);cityTextureCache.set(im,sharp);return sharp}catch(error){cityTextureCache.set(im,im);return im}}
// Conservative sky envelope, in source-art pixels: leave towers and antennas fixed.
const citySkyHeights=[350,350,240,240,240,305,305,350,400,420,395,395,270,270,270,315];
const backdropScaleCache=new WeakMap();
function sizedCityBackdrop(im,w,h){if(!document.createElement)return cityTexture(im);const width=Math.round(w*canvas.width/W),height=Math.round(h*canvas.height/H),key=width+'x'+height;let entries=backdropScaleCache.get(im);if(!entries){entries=new Map();backdropScaleCache.set(im,entries)}if(entries.has(key))return entries.get(key);const c=document.createElement('canvas');c.width=width;c.height=height;const dc=c.getContext('2d');dc.imageSmoothingEnabled=false;dc.drawImage(cityTexture(im),0,0,width,height);entries.set(key,c);return c}
function drawCityBackdrop(im,x,y,w,h,mirrored=false,layered=false){const texture=sizedCityBackdrop(im,w,h),drift=Math.sin(step*.004)*18,unit=w/citySkyHeights.length;
 if(layered){ctx.save();if(mirrored){ctx.translate(x+w,y);ctx.scale(-1,1);ctx.drawImage(texture,0,0,w,h)}else ctx.drawImage(texture,x,y,w,h);ctx.restore();return}
 ctx.drawImage(texture,x,y,w,h);ctx.save();ctx.beginPath();ctx.moveTo(x,y);ctx.lineTo(x+w,y);
 for(let i=citySkyHeights.length-1;i>=0;i--){const bottom=y+h*citySkyHeights[i]/1024;ctx.lineTo(x+(i+1)*unit,bottom);ctx.lineTo(x+i*unit,bottom)}
 ctx.closePath();ctx.clip();ctx.drawImage(texture,x+drift,y,w,h);
 // Neighboring tiles fill the narrow edges without seams or per-frame allocations.
 if(drift>0)ctx.drawImage(texture,x+drift-w,y,w,h);else if(drift<0)ctx.drawImage(texture,x+drift+w,y,w,h);ctx.restore()
}
const cityCloudLayers=new WeakMap();
function cityCloudLayer(im,w,h){
 const texture=sizedCityBackdrop(im,w,h);if(!document.createElement)return null;
 let layer=cityCloudLayers.get(texture);if(layer)return layer;
 const image=document.createElement('canvas');image.width=texture.width;image.height=Math.floor(texture.height*220/im.height/4)*4;
 const dc=image.getContext('2d');dc.imageSmoothingEnabled=false;dc.drawImage(texture,0,0);dc.globalCompositeOperation='destination-out';
 // Fade source-pixel rows; nearest-neighbor sampling keeps their edges sharp.
 const fade=64;
 for(let y=Math.max(0,image.height-fade);y<image.height;y+=4){dc.globalAlpha=(y-image.height+fade)/(fade-4);dc.fillRect(0,y,image.width,4)}
 layer={image,height:image.height/(canvas.height/H)};cityCloudLayers.set(texture,layer);return layer;
}
function drawCityClouds(im,w,h,top){
 const layer=cityCloudLayer(im,w,h);if(!layer)return;
 const scroll=Math.round(cam*.035+step*.10),first=Math.floor(scroll/w);
 for(let tile=first-1;tile<=first+1;tile++){const left=tile*w-scroll;if(left+w<0||left>W)continue;ctx.save();if(tile%2){ctx.translate(left+w,top);ctx.scale(-1,1);ctx.drawImage(layer.image,0,0,w,layer.height)}else ctx.drawImage(layer.image,left,top,w,layer.height);ctx.restore()}
}
function makeObjectOutline(im){if(!document.createElement)return null;const c=document.createElement('canvas');c.width=im.width;c.height=im.height;const dc=c.getContext('2d');dc.fillStyle='#091426';dc.fillRect(0,0,c.width,c.height);dc.globalCompositeOperation='destination-in';dc.drawImage(im,0,0);dc.globalCompositeOperation='source-over';return c}
function gameSound(name,options){return window.playGameSound?.(name,options)??false}
function notify(t){$('#toast').textContent=t;toastTime=160;$('#toast').style.display='block'}
function sparks(x,y,n=8,color='#ffda56'){for(let i=0;i<n;i++)particles.push({x,y,vx:(Math.random()-.5)*7,vy:-Math.random()*6,life:25,color})}
function pose(s,t=runFrames){let dx=0,dy=0;if(s.motion){const n=Math.sin(t/s.motion.period*Math.PI*2+s.motion.phase)*s.motion.amp;if(s.motion.axis==='x')dx=n;else dy=n}return {x1:s.x1+dx,x2:s.x2+dx,y1:s.y1+dy,y2:s.y2+dy,slope:(s.y2-s.y1)/(s.x2-s.x1)}}
function yOn(s,x,t=runFrames){const q=pose(s,t);return q.y1+(x-q.x1)*q.slope}
function active(s){return (!s.sealedBy||level.hazards.find(h=>h.id===s.sealedBy)?.broken)&&(!s.restoreAt||runFrames>=s.restoreAt)}
function topAt(x,below=-Infinity){let result=null;for(const s of level.surfaces){const q=pose(s);if(active(s)&&x>=q.x1&&x<=q.x2){const y=yOn(s,x);if(y>=below&&(!result||y<result.y))result={s,y}}}return result}
function bodyHeight(){return p.ground&&p.roll?26:!p.ground?38:48}
function feet(){return p.y+20}
function resetPlatforms(){for(const s of level.surfaces){s.crumbleTimer=-1;s.restoreAt=0}}
function setup(){window.syncGameMusic?.({enabled:sound,mode:'ready',restart:true});testControlled=false;level=configureBoostMonitors(selectedAct===2?addMiddleSection(makeLevel2()):makeLevel());END=level.end;rings=level.rings;enemies=level.enemies.map((e,i)=>({...e,alive:true,phase:i*1.3}));particles=[];clock=0;runFrames=0;count=0;score=0;lives=tuning.lives;checkpoint=0;charge=0;cam=0;camY=0;zoom=1;boost=BOOST_MAX;stage=0;shake=0;keys.clear();visited.clear();stats={jumps:0,rolls:0,hits:0,deaths:0,expressLandings:0,recoveries:0,rebound:0,maxSpeed:0,loops:0,barriers:0};respawn();updateHud();$('#toast').style.display='none';$('#act-title').textContent=level.title||'NEON EXPRESS';$('.brand-sub').textContent=level.title||'NEON EXPRESS';$('#act-select').value=String(selectedAct)}
function respawn(){const c=level.checkpoints[checkpoint];resetPlatforms();Object.assign(p,{x:c.x,y:c.y-20,vx:0,vy:0,ground:true,face:1,inv:80,roll:false,boosting:false,surface:level.surfaces.find(s=>s.id===c.surfaceId)??level.surfaces.find(s=>c.x>=s.x1&&c.x<=s.x2&&Math.abs(yOn(s,c.x)-c.y)<2)??topAt(c.x)?.s??null,hurt:0,jumpAttack:false,airSpeedLimit:null,jumpHeld:false,jumpCut:false,boostLocked:false,rolling:false,rollAge:0,lowRollFrames:0,rollSpent:false,downHeld:false,rollBuffer:0,brakeActive:false,brakeAge:0,brakeSpeed:0,brakeFace:1,stopFrame:-100,landFrame:-1,landKind:null,poseJumpFrame:-100,poseLandingFrame:-100,grindEntryFrame:-100,grindExitFrame:-100,grindFast:false,grindFromFast:false,loop:null,airLaunchUntil:0,lastX:c.x,lastY:c.y-20});charge=0;p.poolTransfer=null;p.wrongRouteDrop=false;p.poolApproach=false;p.poolExit=false;resetBoostMonitors();coyote=tuning.coyote;jumpBuffer=0;cam=Math.max(0,p.x-230);camY=level.act===2?p.y-H*.6:0;resetAct2();visited.clear();for(const r of rings)if(r.x>=c.x&&r.x<c.x+550)r.taken=false}
function start(){testControlled=false;if(['ready','over','win'].includes(mode))setup();mode='playing';$('#overlay').classList.add('hidden');$('#pause').textContent='Ⅱ';keys.clear();canvas.focus();gameSound('start');updateHud()}
function show(title,text,label){$('#overlay').classList.remove('hidden');$('.intro').innerHTML=`<span class="eyebrow">${level.title||'NEON EXPRESS'} / ACT 0${selectedAct}</span><h1>${title}</h1><p>${text}</p><button id="play" class="primary">${label} <span>▶</span></button><span class="start-note">Tap / hold Space: jump height · Down: roll · Left click / Shift / X: boost</span>`;$('#play').onclick=start}
function pause(){if(mode==='playing'){mode='paused';keys.clear();show('Catch your<br><em>breath.</em>','Your run is paused.','RESUME');$('#pause').textContent='▶';gameSound('pause');updateHud()}else if(mode==='paused')start()}
function die(){gameSound('death');lives--;stats.deaths++;count=0;p.boosting=false;keys.clear();particles=particles.filter(a=>!a.ring);if(lives<=0){mode='over';show('Another<br><em>shot?</em>','Tap Jump for short hops. Roll under gantries.<br>Gold rails reward speed; blue lower rails offer another chance.','TRY AGAIN')}else{respawn();notify('Checkpoint • '+level.checkpoints[checkpoint].name)}updateHud()}
function hurt(x,gate=false){if(p.inv>0)return;stats.hits++;shake=8;p.boosting=false;p.hurt=22;p.jumpAttack=false;p.airSpeedLimit=null;if(count){const n=Math.min(count,16);for(let i=0;i<n;i++)particles.push({x:p.x,y:p.y,vx:Math.cos(i*Math.PI/8)*5,vy:-4-Math.abs(Math.sin(i))*5,life:220,ring:true,age:0});count=0;p.inv=tuning.inv;p.vx=p.x<x?-4:4;if(!gate){p.vy=-6;p.ground=false;p.surface=null}gameSound('hurt')}else die()}
function press(k,automated=false){if(!automated)testControlled=false;if((k==='ArrowDown'||k==='KeyS')&&!keys.has(k)&&mode==='playing'){p.rollBuffer=6;p.rollSpent=false}if(k==='KeyP'||k==='Escape'){pause();return}if(k==='KeyR'){restart();return}if(JUMP_KEYS.includes(k)){if(['ready','over','win'].includes(mode)){start();return}if(mode==='playing'){p.jumpHeld=true;p.jumpCut=false;if((keys.has('ArrowDown')||keys.has('KeyS'))&&p.ground&&!p.surface?.grindable&&Math.abs(p.vx)<3){charge=Math.min(16,charge+4);sparks(p.x-15*p.face,p.y+18,4,'#69efff');gameSound('spindashCharge',{charge:charge/20})}else jumpBuffer=tuning.buffer}}keys.add(k)}
function release(k,automated=false){if(!automated)testControlled=false;keys.delete(k);if(JUMP_KEYS.includes(k)){p.jumpHeld=false;p.jumpCut=true;if(p.vy<-5&&runFrames>=(p.airLaunchUntil||0))p.vy=-5}}
function restart(){setup();mode='playing';$('#overlay').classList.add('hidden');$('#pause').textContent='Ⅱ';canvas.focus();gameSound('start');updateHud()}
function updateHud(){window.syncGameMusic?.({enabled:sound,mode});if(typeof window.updatePixelHud==='function')window.updatePixelHud({rings:count,lives,lifeImage:art.recoveredSpeedster,time:clock,score,boost,maxBoost:BOOST_MAX,speed:Math.round(measurementSpeed()*60),mode,frame:step});$('#progress-fill').style.width=Math.min(100,p.x/END*100)+'%'}
function jump(){p.jumpAttack=true;if(p.surface?.grindable)p.grindExitFrame=runFrames;p.poseJumpFrame=runFrames;const slope=p.surface?pose(p.surface).slope:0;const speedLift=Math.max(0,Math.abs(p.vx)-14)*.25;p.vy=-(13.4+Math.min(2.4,speedLift))+Math.max(-3.5,Math.min(0,slope*p.vx*.45));if(p.jumpCut)p.vy=-6.8;p.ground=false;p.surface=null;coyote=0;jumpBuffer=0;stats.jumps++;gameSound('jump')}
function land(s,y){if(p.wrongRouteDrop&&s.fallen){p.wrongRouteDrop=false;p.vx=0;}if(s.grindable&&p.surface!==s){p.grindEntryFrame=runFrames;p.grindFromFast=p.boosting||Math.abs(p.vx)>17;p.grindFast=Math.abs(p.vx)>18||p.boosting;p.rolling=false;p.roll=false;p.brakeActive=false;p.stopFrame=-100;charge=0}else if(p.surface?.grindable&&!s.grindable){p.grindExitFrame=runFrames;}if(!p.ground){p.poseLandingFrame=runFrames;gameSound(s.grindable?'grind':'land',{speed:Math.abs(p.vx),volume:.7})}p.landFrame=runFrames;p.landKind=s.kind;const changed=p.surface!==s||!p.ground;p.y=y-20;p.vy=0;p.ground=true;p.jumpAttack=false;p.airSpeedLimit=null;p.surface=s;if(changed&&!visited.has(s.id)){visited.add(s.id);if(s.kind==='express'){stats.expressLandings++;score+=400;sparks(p.x,p.y+20,5,'#ffdf72')}if(s.kind==='recovery'||s.kind==='lower')stats.recoveries++}if(s.kind==='crumble'&&s.crumbleTimer<0)s.crumbleTimer=s.crumbleDelay;for(const group of level.collapseGroups||[])if(group.entryId===s.id&&!group.triggered){group.triggered=true;for(const id of group.tailIds){const tail=level.surfaces.find(v=>v.id===id);if(tail)tail.crumbleTimer=group.delay}}if(changed&&jumpBuffer>0)jump()}
function canStand(){const foot=feet();return !level.hazards.some(h=>h.type==='gate'&&p.x+13>h.x&&p.x-13<h.x+h.w&&foot>h.y&&foot-48<h.y+h.h)}
function updateRoll(down){
 if(down&&!p.downHeld){p.rollBuffer=6;p.rollSpent=false}if(!down)p.rollSpent=false;p.downHeld=down;
 if(p.ground&&!p.surface?.grindable&&p.rollBuffer>0&&!p.rollSpent&&!p.rolling){p.rolling=true;p.rollAge=0;p.lowRollFrames=0;p.rollBuffer=0;stats.rolls++}
 if(p.rollBuffer>0)p.rollBuffer--;
 if(p.rolling){p.rollAge++;if(p.ground&&Math.abs(p.vx)<7)p.lowRollFrames++;else if(Math.abs(p.vx)>=7)p.lowRollFrames=0;
  const expired=p.lowRollFrames>=90||p.rollAge>=240;
  if(((!down&&p.rollAge>6)||expired)&&canStand()){p.rolling=false;if(expired)p.rollSpent=true}}
 p.roll=p.rolling||charge>0||!p.ground;
}
function updateMovement(){if(updateMiddleMotion())return true;if(p.loop)return updateLoop();const beforeSpeed=Math.abs(p.vx),recoveryGrip=p.ground&&['recovery','lower'].includes(p.surface?.kind);const down=keys.has('ArrowDown')||keys.has('KeyS');const dir=Number(keys.has('ArrowRight')||keys.has('KeyD'))-Number(keys.has('ArrowLeft')||keys.has('KeyA'));updateRoll(down);
 if(p.ground)coyote=tuning.coyote;else if(coyote>0)coyote--;
 if(jumpBuffer>0&&coyote>0&&!charge)jump();else if(jumpBuffer>0)jumpBuffer--;
 if(charge&&down&&JUMP_KEYS.some(k=>keys.has(k))){charge=Math.min(20,charge+.2);if(runFrames%10===0){sparks(p.x-15*p.face,p.y+18,3,'#69efff');if(typeof gameSound==='function')gameSound('spindashCharge',{charge:charge/20})}}
 if(charge&&!down){gameSound('spindashRelease',{charge:charge/20});p.vx=p.face*(12+charge*.55);charge=0;p.rolling=true;p.rollAge=0;p.lowRollFrames=0;sparks(p.x,p.y+15,10,'#4bd9ff')}
 const wantBoost=keys.has('ShiftLeft')||keys.has('ShiftRight')||keys.has('KeyX')||keys.has('MouseBoost');if(!wantBoost)p.boostLocked=false;
 updateBoostState(wantBoost);
 if(p.boosting){if(dir&&Math.sign(p.vx)===dir)p.face=dir;p.vx+=(p.face*23-p.vx)*.14;if(runFrames%3===0)particles.push({x:p.x-25*p.face,y:p.y,vx:-p.face*2,vy:0,life:14,color:'#43e5ff',trail:true})}
 else if(p.ground&&p.surface?.grindable){p.rolling=false;p.roll=false;charge=0;if(dir&&dir!==Math.sign(p.vx))p.vx+=dir*.45;else if(dir&&Math.abs(p.vx)<14)p.vx+=dir*.08;}
 else if(charge)p.vx*=.66;
 else{if(!p.hurt&&dir){if(p.ground&&p.rolling){if(dir!==Math.sign(p.vx)&&Math.abs(p.vx)>.1){p.vx+=dir*(Math.abs(p.vx)<=8?(recoveryGrip?1.3:.85):(recoveryGrip?1.1:.5));p.face=dir}else if(Math.abs(p.vx)<3)p.vx=Math.max(-3,Math.min(3,p.vx+dir*.16));}
   else if(Math.abs(p.vx)<14||dir!==Math.sign(p.vx)){const speed=Math.min(1,Math.abs(p.vx)/14),opposing=dir!==Math.sign(p.vx)&&Math.abs(p.vx)>.1,a=p.ground?(opposing?(recoveryGrip?(Math.abs(p.vx)<=14?2.5:1.4):(Math.abs(p.vx)<8?1:.82)):.52*Math.pow(1-speed,1.5)+.035):(opposing?.2:.12);p.vx+=dir*a;p.face=dir;if(Math.abs(p.vx)>14&&dir===Math.sign(p.vx))p.vx=dir*14}}
  else if(p.ground){if(p.rolling)p.vx*=.997;else{const drag=Math.abs(p.vx)<=8?(recoveryGrip?.65:.5):(recoveryGrip?.4:.22+(Math.abs(p.vx)-8)*.002);p.vx=Math.sign(p.vx)*Math.max(0,Math.abs(p.vx)-drag)}}
  if(Math.abs(p.vx)>14&&!p.surface?.boostExit)p.vx*=p.ground?.998:.999;}
 if(p.ground&&p.rolling){const drag=.0015+Math.min(.022,Math.max(0,p.rollAge-90)*.00016);p.vx*=1-drag}
 if(p.ground&&p.surface){const slope=pose(p.surface).slope;if(!p.surface.grindable&&Math.abs(p.vx)>1)p.vx+=slope*(p.rolling?.65:p.surface.boostExit?.08:.28);const prev=pose(p.surface,runFrames-1),now=pose(p.surface);p.x+=now.x1-prev.x1;p.y+=now.y1-prev.y1}
 p.vx=Math.max(-24,Math.min(24,p.vx));if(Math.abs(p.vx)<.03)p.vx=0;stats.maxSpeed=Math.max(stats.maxSpeed,Math.abs(p.vx));anim+=Math.abs(p.vx)*.08;
 if(!p.ground&&p.airSpeedLimit)p.vx=Math.max(-p.airSpeedLimit,Math.min(p.airSpeedLimit,p.vx));
 const oldX=p.x,oldY=p.y,oldFoot=feet(),oldSurface=p.surface,wasGround=p.ground;p.lastX=oldX;p.lastY=oldY;p.x=Math.max(24,Math.min(END+250,p.x+p.vx));
 // Follow connected slopes without launching or snapping across a void.
 if(wasGround&&oldSurface&&active(oldSurface)){const q=pose(oldSurface);if(p.x>=q.x1-FOOT_RADIUS&&p.x<=q.x2+FOOT_RADIUS){p.y=yOn(oldSurface,Math.max(q.x1,Math.min(q.x2,p.x)))-20;p.vy=0}else{let join=null;for(const s of level.surfaces){const z=pose(s),y=yOn(s,p.x);const seam=p.vx>=0?q.x2:q.x1,edgeY=p.vx>=0?q.y2:q.y1,connected=seam>=z.x1-2&&seam<=z.x2+2&&Math.abs(yOn(s,seam)-edgeY)<2;if(active(s)&&p.x>=z.x1&&p.x<=z.x2&&(Math.abs(y-oldFoot)<11||connected)){join={s,y};break}}if(join)land(join.s,join.y);else{p.ground=false;p.surface=null;p.vy=Math.min(0,q.slope*p.vx)}}}else{p.ground=false;p.surface=null}
 if(!p.ground){p.vy=Math.min(20,p.vy+.58);p.y+=p.vy;let hit=null;
  for(const s of level.surfaces){if(p.wrongRouteDrop&&!s.fallen)continue;if(!active(s)||(s.entrySpeed&&!s.solidAtAnySpeed&&Math.abs(p.vx)<s.entrySpeed))continue;const q=pose(s),oldQ=pose(s,runFrames-1);
   const oldFloor=oldQ.y1+(oldX-oldQ.x1)*oldQ.slope,newFloor=yOn(s,p.x),d0=oldFoot-oldFloor,d1=feet()-newFloor;
   if(d0>5||d1<0||d1-d0<=0)continue;const t=Math.max(0,-d0/(d1-d0)),crossX=oldX+(p.x-oldX)*t;
   const left=oldQ.x1+(q.x1-oldQ.x1)*t,right=oldQ.x2+(q.x2-oldQ.x2)*t;
   if(t<=1&&crossX>=left-FOOT_RADIUS&&crossX<=right+FOOT_RADIUS&&(!hit||t<hit.t))hit={s,q,t};}
  if(hit){const x=Math.max(hit.q.x1,Math.min(hit.q.x2,p.x));land(hit.s,yOn(hit.s,x));
   if(p.ground&&(p.x<hit.q.x1-FOOT_RADIUS||p.x>hit.q.x2+FOOT_RADIUS)){p.ground=false;p.surface=null;p.vy=Math.min(0,hit.q.slope*p.vx);coyote=tuning.coyote}
   if(p.ground&&p.rollBuffer>0&&!p.rollSpent){p.rolling=true;p.rollAge=0;p.lowRollFrames=0;p.rollBuffer=0;stats.rolls++}}}
 p.roll=p.rolling||charge>0||!p.ground;
 resolveHazards(oldX,oldY);updateBrakingPose(dir,beforeSpeed);if(p.ground&&p.surface?.grindable&&Math.abs(p.vx)>2&&runFrames%3===0){const fast=p.boosting||Math.abs(p.vx)>18;particles.push({x:p.x+7*Math.sign(p.vx),y:feet()-1,vx:-Math.sign(p.vx)*(fast?4:2),vy:fast?-1.5:-.7,life:fast?12:8,color:fast?'#ffdb72':'#ffe4a4',grind:true,trail:false});if(fast&&runFrames%6===0)particles.push({x:p.x-10*Math.sign(p.vx),y:feet()+1,vx:-Math.sign(p.vx)*5,vy:0,life:7,color:'#ffa65b',grind:true,trail:true})}
 if(level.deathZones?.some(z=>p.x>=z.x1&&p.x<=z.x2&&feet()>z.y)){die();return false}if(feet()>(level.act===2?level.floorAt(p.x)+950:800)){die();return false}return true}
// Visual state tracks resisted momentum; it never gates jump, roll, or direction inputs.
function updateBrakingPose(dir,incoming){
 const speed=Math.abs(p.vx),opposing=dir&&dir!==Math.sign(p.vx),resisting=p.ground&&!p.surface?.grindable&&!p.rolling&&!charge&&!p.boosting&&!p.hurt&&(!dir||opposing);
 if(resisting&&(speed>.03||p.brakeActive)){
  if(!p.brakeActive){p.brakeAge=0;p.brakeSpeed=incoming;p.brakeFace=Math.sign(p.vx)||p.face}p.brakeActive=speed>.03;p.brakeAge++;p.brakeSpeed=Math.max(p.brakeSpeed||0,incoming);
  if(!speed){p.stopFrame=runFrames;p.brakeActive=false}
  if(speed>2&&(p.brakeAge===1||runFrames%3===0)){const force=Math.min(1,p.brakeSpeed/23);particles.push({x:p.x+8*p.brakeFace,y:feet()-2,vx:-p.brakeFace*(.5+force*2),vy:-.5-force*.9,life:12+force*8,color:'#bbc0cd',skid:true,size:3+force*4});if(force>.5)particles.push({x:p.x,y:feet()-1,vx:-p.brakeFace,vy:0,life:9,color:'#ffe1a0',trail:true,skid:true})}
 }else{p.brakeActive=false;if(dir||!p.ground||p.rolling||p.boosting||p.hurt)p.stopFrame=-100}
}
function resolveHazards(oldX,oldY){for(const h of level.hazards){if(h.broken)continue;if(p.x+13<h.x||p.x-13>h.x+h.w)continue;const foot=feet(),height=bodyHeight(),top=foot-height;if(foot<=h.y||top>=h.y+h.h)continue;if(h.type==='breakable'&&(p.boosting||!h.boostOnly&&Math.abs(p.vx)>=h.threshold)){h.broken=true;gameSound('hazard');score+=350;stats.barriers=(stats.barriers||0)+1;sparks(h.x,h.floor-40,18,'#ffcc70');continue}if(h.type==='spikes'){hurt(h.x+h.w/2);continue}
 // Gantries remain solid during damage immunity. A correct roll keeps every bit of speed.
 const previousTop=oldY+20-height;if(oldY+20<=h.y&&p.vy>=0){p.y=h.y-20;p.vy=0;p.ground=false}
 else if(previousTop>=h.y+h.h&&p.vy<0){p.y=h.y+h.h+height-20;p.vy=1}
 else{const fromLeft=oldX<h.x+h.w/2;p.x=fromLeft?h.x-14:h.x+h.w+14;p.vx=0;p.boosting=false}
}}
function update(){step++;if(mode!=='playing')return;clock+=1/60;runFrames++;if(p.inv>0)p.inv--;if(p.hurt>0)p.hurt--;if(shake>0)shake--;if(toastTime>0&&!--toastTime)$('#toast').style.display='none';
 for(const s of level.surfaces){if(s.restoreAt&&runFrames>=s.restoreAt){s.restoreAt=0;s.crumbleTimer=-1}if(s.crumbleTimer>=0&&!s.restoreAt){s.crumbleTimer--;if(s.crumbleTimer===0){s.restoreAt=runFrames+240;s.crumbleTimer=-1;sparks((s.x1+s.x2)/2,s.y1,10,'#ffac54')}}}
 if(!updateMovement()||mode!=='playing'){updateHud();return}updateAct2();updateMiddleSection();updateCityInteriors();if(mode!=='playing'){updateHud();return}
 for(const r of rings)if(!r.taken&&(!r.sealedBy||level.hazards.find(h=>h.id===r.sealedBy)?.broken)&&Math.hypot(r.x-p.x,r.y-p.y)<29){r.taken=true;count++;score+=100;gameSound('ring');sparks(r.x,r.y,3)}
 for(const pad of level.pads)if(p.ground&&Math.abs(p.x-pad.x)<25&&Math.abs(feet()-pad.y)<8&&(pad.cityVent||pad.poolBooster||p.vx>0)&&(!pad.sealedBy||level.hazards.find(h=>h.id===pad.sealedBy)?.broken)){if(pad.cityVent||pad.poolBooster)launchAirDevice(pad);else p.vx=Math.max(p.vx,18.5)}
 for(const spring of level.springs||[]){const device=airDevicePose(spring);if(p.ground&&p.surface?.id===spring.surfaceId&&Math.abs(p.x-device.x)<23)launchAirDevice(spring);}
 collectBoostMonitors();
 for(const e of enemies){if(!e.alive)continue;e.x=e.base+Math.sin(runFrames*.018+e.phase)*e.range;e.y=e.baseY+(e.kind==='drone'?Math.sin(runFrames*.027+e.phase)*12:0);if(Math.hypot(p.x-e.x,p.y-e.y)<33){const stomp=p.vy>0&&feet()<=e.y+12&&!e.jumpImmune,jumpHit=!p.ground&&p.jumpAttack&&p.hurt===0&&!e.jumpImmune;if(p.boosting||p.ground&&p.roll&&Math.abs(p.vx)>3||stomp||jumpHit){e.alive=false;score+=500;sparks(e.x,e.y,14,'#ff9556');if(stomp&&!p.boosting&&e.rebound!==false){p.vy=p.jumpHeld?-16:-8;p.poseJumpFrame=runFrames;p.ground=false;p.surface=null;stats.rebound++;gameSound('enemy')}else gameSound('enemy')}else if(!p.inv){hurt(e.x);if(e.id==='mid-wrong-way-guard'&&p.hurt&&mode==='playing')beginWrongRouteDrop()}}}
 // Checkpoints require a safe main-road landing, so falling past a marker cannot skip a challenge.
 for(let i=checkpoint+1;i<level.checkpoints.length;i++){const c=level.checkpoints[i];if(p.x>=c.x&&p.ground&&['main','express'].includes(p.surface?.kind)&&(!level.verticalCity||p.surface.id===c.surfaceId)&&Math.abs(feet()-c.y)<150){checkpoint=i;stage=i;if(level.act!==2)notify(c.hint||level.sectors[level.sectors.findLastIndex(s=>s.x<=c.x)].hint);gameSound('checkpoint')}}
 stage=Math.max(0,level.sectors.findLastIndex(s=>p.x>=s.x));
 if(p.x>=END&&(level.act!==2||Math.abs(feet()-level.arena.y)<30)&&((p.ground&&p.surface?.kind==='main')||(p.landFrame===runFrames&&p.landKind==='main'))){mode='win';const rank=stats.deaths===0&&stats.hits<=1&&clock<(level.act===2?175:70)?'S':stats.deaths===0&&clock<(level.act===2?220:100)?'A':'B';show(level.act===2?'Summit<br><em>reached!</em>':'Express<br><em>cleared!</em>',`Rank ${rank} · ${count} rings · ${Math.floor(clock/60)}:${String(Math.floor(clock%60)).padStart(2,'0')}<br>${stats.expressLandings} express landings · ${stats.hits} hits · ${stats.deaths} falls`,'RUN AGAIN');if(level.act===2){$('.intro p').innerHTML+= '<br>Boss-ready arena reached · Boss encounter coming later.'}else{$('.intro').innerHTML+='<button id="next-act" class="secondary">CONTINUE TO ACT 02 →</button>';$('#play').onclick=start;$('#next-act').onclick=()=>{selectAct(2);start()}}gameSound('clear')}
 for(const a of particles){a.x+=a.vx;a.y+=a.vy;if(!a.trail)a.vy+=.22;if(a.ring){a.age++;const floor=topAt(a.x,a.y-18);if(floor&&a.y>floor.y-10&&a.vy>0){a.y=floor.y-10;a.vy=-Math.abs(a.vy)*.6}if(a.age>32&&Math.hypot(a.x-p.x,a.y-p.y)<28){count++;a.life=0;gameSound('ring')}}a.life--}particles=particles.filter(a=>a.life>0);
 if(charge)gameSound('spindashCharge',{charge:charge/20});else if(p.brakeActive)gameSound('brake',{speed:Math.abs(p.vx)});else if(p.boosting)gameSound('boost',{speed:measurementSpeed()});else if(p.ground&&p.surface?.grindable)gameSound('grind',{speed:measurementSpeed()});else if(p.ground&&!p.roll&&Math.abs(p.vx)>2)gameSound('run',{speed:Math.abs(p.vx)});updateCamera();updateHud()}
function ellipse(x,y,rx,ry,color){ctx.fillStyle=color;ctx.beginPath();ctx.ellipse(x,y,rx,ry,0,0,Math.PI*2);ctx.fill()}
function ring(x,y,scale=1){drawPixelRing(x,y,scale)}
// Authored atlas bounds; fixed world scale keeps head size stable across poses.
const sonicFrames=[
 [37,15,235,269],[287,17,481,269],[547,15,728,269],[800,15,987,269],[1048,17,1264,269],[1309,15,1495,269],
 [32,290,246,542],[279,293,521,538],[564,295,749,538],[783,294,1044,542],[1077,290,1261,541],[1316,294,1509,540],
 [35,588,235,775],[296,544,518,789],[557,590,747,771],[780,545,1012,781],[1048,587,1285,781],[1306,562,1515,778],
 [10,790,265,1009],[281,790,508,1010],[533,800,798,1009],[809,800,1050,1008],[1085,822,1265,1001],[1327,820,1505,998]
];
// Expanded running and jump transitions use the same character design.
const motionFrames=[
 [30,18,282,259],[320,23,506,261],[566,22,745,263],[820,18,1011,263],[1054,28,1297,261],[1320,20,1526,263],
 [25,287,256,537],[298,288,536,544],[561,288,749,541],[786,285,1052,521],[1073,291,1271,541],[1309,288,1536,541],
 [27,586,235,777],[296,556,516,795],[554,552,749,795],[808,565,1032,779],[1078,586,1277,769],[1327,594,1512,775],
 [44,809,235,999],[292,811,487,999],[547,805,777,1003],[797,806,1035,1016],[1045,795,1293,1007],[1313,816,1511,1005]
];
const grindFrames=[[62, 46, 418, 380], [537, 53, 903, 380], [1021, 71, 1379, 380], [1500, 53, 1859, 380], [1935, 61, 2384, 380], [2432, 82, 2848, 380], [2907, 84, 3332, 380], [3393, 77, 3807, 380]];
const brakeFrames=[[42,20,405,368],[469,33,875,368],[928,36,1311,368],[1383,32,1752,368],[1873,36,2158,368],[2338,24,2590,368]];
const boostFrames=[[32,80,451,410],[486,80,893,410],[944,80,1320,414],[1389,80,1747,416],[32,517,451,842],[486,517,896,843],[958,517,1311,845],[1389,517,1744,844]];
const spriteBounds={objects:[[49,200,640,550],[657,158,1102,550],[1209,215,1561,562],[1683,158,2094,566]]};
function sprite(sheet,i,x,y,w,h){const im=art[sheet];if(!im)return false;const [l,t,r,b]=spriteBounds[sheet][i],sw=r-l,sh=b-t,scale=Math.min(w/sw,h/sh),dw=sw*scale,dh=sh*scale;if(sheet==='objects'&&level.act===2&&art.objectOutline)for(const [dx,dy]of [[-1.5,0],[1.5,0],[0,-1.5],[0,1.5]])ctx.drawImage(art.objectOutline,l,t,sw,sh,x-dw/2+dx,y-dh/2+dy,dw,dh);ctx.drawImage(im,l,t,sw,sh,x-dw/2,y-dh/2,dw,dh);return true}
// Pure visual selection: never adds input delays or changes the collision body.
function sonicPose(){
 if(art.recoveredSpeedster||art.recoveredPeelout)return recoveredSonicPose();
 const speed=p.loop?p.loop.speed:Math.abs(p.vx),face=p.face,age=runFrames-p.poseLandingFrame;
 const out=(state,frame,extra={})=>({state,frame,face,scale:58/254,stretchX:1,stretchY:1,rotation:0,ball:false,sheet:'sonic',...extra});
 const extra=(state,sheet,frame,options={})=>out(state,frame,{sheet,scale:extraMotion[sheet].scales[frame],pivot:.58,...options});
 if(p.hurt){const phase=Math.floor(runFrames/2)%5;return phase===0?out('hurt',18,{scale:48/254}):extra('hurt','transitions',3+phase)}
 if(p.ground&&p.surface?.grindable){const fast=p.boosting||speed>18||(p.grindFast&&speed>16);const phase=Math.floor(runFrames/2)%10;if(phase>=4)return extra(fast?'grind-fast':'grind','wind',(fast?12:6)+phase-4,{face:Math.sign(p.vx)||face,rotation:Math.atan(pose(p.surface).slope)*(Math.sign(p.vx)||face)});return out(fast?'grind-fast':'grind',(fast?4:0)+phase,{sheet:'grind',scale:58/344,face:Math.sign(p.vx)||face,rotation:Math.atan(pose(p.surface).slope)*(Math.sign(p.vx)||face),stretchY:1-Math.min(1,(runFrames-(p.grindEntryFrame??-100))/5)*.015})}
 if(p.rolling||charge){const phase=Math.floor(anim*.6)%6;if(phase>=2)return extra('roll','transitions',8+phase-2,{ball:true,diameter:p.ground?28:38,rotation:anim*.22,face:Math.sign(p.vx)||face});return out('roll',22+phase,{ball:true,diameter:p.ground?28:38,rotation:anim*.22,face:Math.sign(p.vx)||face})}
 if(!p.ground){
  const ja=runFrames-p.poseJumpFrame;
  if(ja>=0&&ja<4&&p.vy<0){if(ja===0||ja===2)return out('takeoff',ja===0?12:13,{sheet:'motion',scale:50/254});const frame=ja===1?12:13;return extra('takeoff','detail',frame,{scale:extraMotion.detail.scales[frame]*50/58})}
  if(p.vy<-3){if(p.vy>=-10.5&&p.vy<-9.5)return extra('rise','detail',14,{scale:extraMotion.detail.scales[14]*50/58});if(p.vy>=-7.5&&p.vy<-6.5)return extra('rise','detail',15,{ball:true,diameter:38,rotation:anim*.04});return out('rise',p.vy<-9.5?14:p.vy<-6.5?15:16,{sheet:'motion',scale:50/254})}
  if(p.vy<3){const phase=Math.floor(ja/2)%4;if(phase===1)return extra('apex','detail',15,{ball:true,diameter:38,rotation:anim*.04});return out('apex',[17,17,18,19][phase],{sheet:'motion',ball:true,diameter:38,rotation:anim*.04})}
  if(p.vy>=4&&p.vy<6)return extra('fall','detail',16,{scale:extraMotion.detail.scales[16]*50/58});
  if(p.vy>=8&&p.vy<10)return extra('fall','detail',17,{scale:extraMotion.detail.scales[17]*50/58});
  return out('fall',p.vy<4?20:p.vy<8?21:22,{sheet:'motion',scale:50/254});
 }
 const dir=Number(keys.has('ArrowRight')||keys.has('KeyD'))-Number(keys.has('ArrowLeft')||keys.has('KeyA'));
 if(!p.loop&&!p.boosting&&((p.brakeActive&&speed>.03)||(dir&&speed>2&&dir!==Math.sign(p.vx)))){const age=p.brakeAge||0,frame=age<4?0:speed>8?1:speed>3?2:3;return out('brake',frame,{sheet:'brake',face:p.brakeActive?p.brakeFace:Math.sign(p.vx),scale:58/344})}
 if(!p.loop&&!dir&&!p.boosting&&speed<.5&&runFrames-p.stopFrame<12){return out('stop',runFrames-p.stopFrame<6?4:5,{sheet:'brake',face:p.brakeFace,scale:58/344})}
 if(age>=0&&age<6){if(age===0)return out('land',23,{sheet:'motion'});if(age===5)return out('land',17);return extra('land','transitions',age-1,{stretchY:age<3?.97:1})}
 if(p.boosting||speed>17){const phase=Math.floor(runFrames*14/16)%14;if(phase>=8)return extra('boost','wind',phase-8,{scale:extraMotion.wind.scales[phase-8]*52/58,pivot:.57});return out('boost',phase,{sheet:'boost',scale:52/336})}
 // One atlas, one body scale and a distance-based stride. Poses hold for several ticks.
 if(speed>.5){const frame=Math.floor(anim*.48)%12;return out('run',frame,{sheet:'motion'})}
 const phase=runFrames%360,frame=phase<140?Math.floor(runFrames/38)%2:phase<174?2:phase<210?3:phase<258?4:phase<300?5:0;
 if(phase<140)return extra('idle','detail',Math.floor(runFrames/8)%6);return out('idle',frame,{stretchY:1+Math.sin(runFrames*.075)*.008});
}
// Round to backing-store pixels, independent of responsive CSS size and camera zoom.
function spritePixel(value,axis='x'){const pixels=zoom*(axis==='x'?canvas.width/W:canvas.height/H);return Math.round(value*pixels)/pixels}
function drawSonicFrame(q){
 if(recoveredSpriteFrames[q.sheet]&&art[q.sheet]&&document.createElement)return drawRecoveredSonicFrame(q);
 const sheet=q.sheet||'sonic',im=art[sheet]||art.sonic,frames=art[sheet]? (extraMotion[sheet]?extraMotion[sheet].frames:sheet==='motion'?motionFrames:sheet==='boost'?boostFrames:sheet==='brake'?brakeFrames:sheet==='grind'?grindFrames:sonicFrames):sonicFrames;
 // If the expansion has not loaded, use a clean original pose instead of an unrelated frame.
 const frame=art[sheet]?q.frame:q.ball?22:q.state==='run'?6:q.state==='land'?16:q.state==='boost'?20:q.state==='brake'?18:q.state==='stop'?19:q.state.startsWith('grind')?12:q.state==='idle'?0:13;
 const [l,t,r,b]=frames[frame],sw=r-l,sh=b-t;
 if(q.ball){const scale=q.diameter/Math.max(sw,sh),dw=spritePixel(sw*scale),dh=spritePixel(sh*scale,'y');ctx.translate(0,p.ground?6:1);ctx.rotate(q.rotation);ctx.drawImage(im,l,t,sw,sh,spritePixel(-dw/2),spritePixel(-dh/2,'y'),dw,dh);return}
 const scale=(sheet!=='sonic'&&!art[sheet]?58/254:q.scale)*SONIC_VISUAL_SCALE,dw=spritePixel(sw*scale*q.stretchX),dh=spritePixel(sh*scale*q.stretchY,'y');
 // Pivot beneath the eye/body, rather than the changing glove or quill extents.
 const pivots=[.60,.60,.60,.60,.53,.60,.60,.57,.59,.57,.60,.60,.59,.57,.5,.55,.60,.61,.53,.57,.58,.58];
 const pivot=extraMotion[sheet]&&art[sheet]?(q.pivot??.58):sheet==='grind'&&art.grind?.56:sheet==='brake'&&art.brake?.58:sheet==='boost'&&art.boost?[215,201,193,198,215,201,179,198][frame]/sw:sheet==='motion'&&art.motion? [ .57,.59,.60,.60,.57,.60,.59,.57,.60,.57,.60,.58,.59,.57,.58,.56,.5,.5,.5,.5,.56,.56,.56,.59 ][frame]:pivots[frame];
 if(q.state==='brake'||q.state.startsWith('grind')){ctx.translate(0,20);ctx.rotate(q.rotation||0);ctx.translate(0,-20)}ctx.drawImage(im,l,t,sw,sh,spritePixel(-dw*pivot),spritePixel(20,'y')-dh,dw,dh);
}
function sonic(){if(p.inv>0&&step%10<4&&mode==='playing')return;const q=sonicPose();ctx.save();ctx.translate(p.x,p.y);const transform=ctx.getTransform?.();if(transform)ctx.setTransform(transform.a,transform.b,transform.c,transform.d,Math.round(transform.e),Math.round(transform.f));if(p.loop){ctx.translate(0,20);ctx.rotate(-p.loop.theta);ctx.translate(0,-20)}ctx.scale(q.face,1);
 if(p.boosting&&!p.surface?.grindable){cityPixelOval(-14,1,42,18,'#22caff44');for(let i=0;i<12;i++){const a=-1.2+i*.2,b=a+.2;cityPixelLine(Math.cos(a)*25,Math.sin(a)*25,Math.cos(b)*25,Math.sin(b)*25,'#81eeff',2)}}
 if(art.recoveredSpeedster||art.recoveredPeelout||art.sonic){const entry=runFrames-p.grindEntryFrame;if(!recoveredSpriteFrames[q.sheet]&&q.state.startsWith('grind')&&entry>=0&&entry<5){const a=(entry+1)/5;ctx.globalAlpha=1-a;drawSonicFrame({...q,state:p.grindFromFast?'boost':'run',sheet:p.grindFromFast?'boost':'motion',frame:p.grindFromFast?Math.floor(runFrames/2)%8:6,scale:p.grindFromFast?52/336:58/254,rotation:0});ctx.globalAlpha=a;drawSonicFrame(q);ctx.globalAlpha=1}else drawSonicFrame(q)}else{ellipse(0,0,18,23,'#1679ee');ellipse(10,-10,8,12,'white');ellipse(14,-9,3,7,'#13334c');ellipse(12,1,12,7,'#f6c999');ellipse(23,-3,4,3,'#101d39');ellipse(-10,20,14,6,'#ee2856');ellipse(12,20,14,6,'#ee2856')}ctx.restore()
}
function sign(x,y,text,type){drawPixelSign(x,y,text,type)}
function drawRail(s){if(s.secretDepth>4&&!level.middleSection?.secretRevealed)return;if(s.sealedBy&&!active(s))return;const q=pose(s),left=Math.max(q.x1,cam-30),right=Math.min(q.x2,cam+W/zoom+30);if(left>=right||Math.min(q.y1,q.y2)>camY+H/zoom+80||Math.max(q.y1,q.y2)+52<camY-80)return;ctx.save();if(!active(s))ctx.globalAlpha=.14;drawAct2Supports(s,left,right);ctx.restore()}

function draw(){ctx.save();ctx.scale(canvas.width/W,canvas.height/H);ctx.imageSmoothingEnabled=false;ctx.fillStyle='#0d082d';ctx.fillRect(0,0,W,H);if(level.act===2)drawAct2Background();else if(art.city){const bw=art.city.width/art.city.height*H,offset=(cam*.18)%bw;drawCityBackdrop(art.city,-offset,0,bw,H);drawCityBackdrop(art.city,bw-offset,0,bw,H)}ctx.fillStyle='#130d3280';ctx.fillRect(0,0,W,75);ctx.save();ctx.scale(zoom,zoom);ctx.translate(-cam+(shake?Math.sin(step*3)*shake*.3:0),-camY+(shake?Math.cos(step*2)*shake*.2:0));
 if(level.act===2){drawAct2Structures();drawMiddleSection()}else drawPixelCityStructures();drawCityDetails();for(const s of level.surfaces)drawRail(s);if(level.act===2)drawAct2World();
 for(const h of level.hazards){if(h.broken)continue;if(h.x+h.w<cam-100||h.x>cam+W/zoom+100)continue;if(h.type==='bulkhead'){drawAct2Bulkhead(h);continue}if(h.type==='breakable'&&level.verticalCity){drawCityBreakable(h);continue}if(h.type==='breakable'){drawCityBreakable(h)}else if(h.type==='spikes'){drawPixelSpikes(h)}else{ctx.fillStyle='#171c40';ctx.fillRect(h.x,h.y,h.w,h.h);ctx.fillStyle='#364971';ctx.fillRect(h.x,h.y,h.w,12);ctx.fillStyle='#a32776';ctx.fillRect(h.x,h.y+h.h-12,h.w,12);ctx.fillStyle='#ff91d1';ctx.fillRect(h.x,h.y+h.h-3,h.w,3);for(let x=h.x+8;x<h.x+h.w;x+=26){ctx.fillStyle='#342547';ctx.fillRect(x,h.y+20,12,h.h-40);ctx.fillStyle='#ffaedd';ctx.fillRect(x,h.y+h.h-10,13,3)}drawPixelSign(h.x+h.w/2,h.y+h.h-28,'ROLL','roll');ctx.fillStyle='#ff8ad72b';ctx.fillRect(h.x,h.y+h.h,h.w,h.floor-h.y-h.h)}}
 for(const pad of level.pads){if(pad.sealedBy&&!level.hazards.find(h=>h.id===pad.sealedBy)?.broken)continue;if(pad.x<cam-60||pad.x>cam+W/zoom+60)continue;if(pad.poolBooster)continue;if(pad.cityVent){drawPolishedVent(pad);continue}drawPoolBooster({...pad,launchX:18,power:0})}
 for(const spring of level.springs||[])drawPolishedSpring(airDevicePose(spring));for(const monitor of level.monitors||[])drawBoostMonitor(monitorPose(monitor));
 for(const s of level.signs)if(s.x>cam-200&&s.x<cam+W/zoom+200)sign(s.x,s.y,s.text,s.type);
 for(const r of rings)if(!r.taken&&(!r.sealedBy||level.hazards.find(h=>h.id===r.sealedBy)?.broken)&&r.x>cam-30&&r.x<cam+W/zoom+30)ring(r.x,r.y,.35+.65*Math.abs(Math.cos(step*.065)));
 for(const e of enemies)if(e.alive&&e.x>cam-60&&e.x<cam+W/zoom+60){drawPixelEnemy(e)}
 for(const [i,c]of level.checkpoints.entries()){ctx.fillStyle='#5988b9';ctx.fillRect(c.x,c.y-75,4,75);cityPixelOval(c.x+2,c.y-77,12,12,'#14253d');cityPixelOval(c.x+2,c.y-77,9,9,checkpoint>=i?'#ffdc58':'#fd4db9')}
 const goalY=level.act===2?level.arena.y-70:325;sign(END,goalY,level.act===2?'ARENA':'GOAL','express');for(let x=END-24;x<END+24;x+=8)for(let y=goalY-20;y<goalY+55;y+=8){ctx.fillStyle=(Math.floor(x/8)+Math.floor(y/8))%2?'#fcf5ff':'#19264a';ctx.fillRect(x,y,8,8)}
 for(const a of particles){if(a.x<cam-100||a.x>cam+W/zoom+100)continue;ctx.globalAlpha=Math.min(1,a.life/16);if(a.ring)ring(a.x,a.y,.8);else if(a.grind){cityPixelLine(a.x,a.y,a.x-Math.sign(a.vx)*(a.trail?10:3),a.y+(a.trail?0:2),a.color,2)}else if(a.skid&&!a.trail){const size=a.size*(1+(20-a.life)*.025);cityPixelRect(a.x-size/2,a.y-size/2,size,size,a.color);cityPixelRect(a.x-size*.75,a.y,size*1.5,size*.6,a.color)}else{cityPixelRect(a.x,a.y,a.trail?24:4,a.trail?8:4,a.color)}ctx.globalAlpha=1}if(p.ground)cityPixelOval(p.x,p.y+21,17,4,'#060c2466');sonic();ctx.restore();ctx.restore();if(mode!=='playing')updateHud()}
function frame(t){if(!last)last=t;acc+=Math.min(100,t-last);last=t;while(acc>=1000/60){if(!testControlled)update();acc-=1000/60}draw();requestAnimationFrame(frame)}
$('#act-select').onchange=e=>selectAct(Number(e.target.value));
$('#play').onclick=start;$('#pause').onclick=pause;$('#restart').onclick=restart;$('#sound').onclick=()=>{sound=window.setGameSoundEnabled?.(!sound)??false;$('#sound').textContent=sound?'Sound on':'Sound off';$('#sound').setAttribute('aria-label',sound?'Disable sound':'Enable sound');gameSound('menu');window.syncGameMusic?.({enabled:sound,mode,gesture:true})};
canvas.addEventListener('pointerdown',e=>{if(e.pointerType!=='mouse'||e.button!==0||mode!=='playing')return;e.preventDefault();canvas.focus();canvas.setPointerCapture(e.pointerId);press('MouseBoost')});
for(const name of ['pointerup','pointercancel','lostpointercapture'])canvas.addEventListener(name,e=>{if(e.pointerType==='mouse')release('MouseBoost')});
window.addEventListener('keydown',e=>{if(['ArrowLeft','ArrowRight','ArrowUp','ArrowDown','Space','KeyW','KeyA','KeyS','KeyD','Escape','KeyP','KeyR','ShiftLeft','ShiftRight','KeyX'].includes(e.code)&&!e.target.matches('button,a,select')){e.preventDefault();if(!e.repeat)press(e.code)}});window.addEventListener('keyup',e=>release(e.code));window.addEventListener('blur',()=>{keys.clear();if(mode==='playing')pause()});document.querySelectorAll('[data-key]').forEach(b=>{b.addEventListener('pointerdown',e=>{e.preventDefault();b.setPointerCapture(e.pointerId);press(b.dataset.key)});for(const name of ['pointerup','pointercancel','lostpointercapture'])b.addEventListener(name,()=>release(b.dataset.key))});
// Testing commands use the normal input handlers and fixed physics tick.
// Freeze between commands so screenshots and model latency cannot advance a run.
const testInputCodes={left:'ArrowLeft',right:'ArrowRight',jump:'Space',down:'ArrowDown',boost:'ShiftLeft'};
function readGameState(){return {status:mode,act:selectedAct,route:p.surface?.kind??'air',rings:count,lives,boost:Math.round(boost),progress:Math.round(p.x/END*100),timeSeconds:Math.floor(clock),frame:runFrames,x:p.x,y:p.y,vx:p.vx,vy:p.vy,grounded:p.ground,checkpoint,sector:level.sectors[stage].name,testControlled,...stats}}
function stepGameFrames(input){
 if(!input||typeof input!=='object'||Array.isArray(input)||Object.keys(input).some(k=>!['keys','frames'].includes(k))||!Array.isArray(input.keys)||input.keys.some(k=>!Object.hasOwn(testInputCodes,k))||new Set(input.keys).size!==input.keys.length||!Number.isInteger(input.frames)||input.frames<1||input.frames>600)throw Error('Expected keys from left/right/jump/down/boost and integer frames from 1 to 600');
 if(input.keys.includes('left')&&input.keys.includes('right'))throw Error('Choose one movement direction');
 if(!['playing','paused'].includes(mode))throw Error('Start or restart the game before stepping');
 if(mode==='paused')start();
 for(const key of [...keys])release(key,true);
 testControlled=true;
 const codes=input.keys.map(k=>testInputCodes[k]),deathsBefore=stats.deaths;
 let framesAdvanced=0;
 try{
  // Down must precede Jump for a spin dash, regardless of request ordering.
  codes.sort((a,b)=>Number(b==='ArrowDown')-Number(a==='ArrowDown'));
  for(const key of codes)press(key,true);
  for(;framesAdvanced<input.frames&&mode==='playing';){
   update();framesAdvanced++;
   if(stats.deaths!==deathsBefore)break;
  }
 }finally{for(const key of [...keys])release(key,true)}
 updateHud();draw();
 return {...readGameState(),framesAdvanced};
}

if(document.modelContext?.registerTool){const life=new AbortController();for(const tool of [{name:'read_game_state',description:'Read route, rings, lives, boost, progress and run statistics.',inputSchema:{type:'object',properties:{},additionalProperties:false},annotations:{readOnlyHint:true},execute:readGameState},{name:'step_game_frames',description:'Hold controls for 1–600 fixed 60 Hz physics frames, then release all inputs and freeze for inspection. Use keys [] to coast. Stops on death or stage end. Physical input or restart restores real-time play.',inputSchema:{type:'object',properties:{keys:{type:'array',items:{type:'string',enum:['left','right','jump','down','boost']},uniqueItems:true},frames:{type:'integer',minimum:1,maximum:600}},required:['keys','frames'],additionalProperties:false},annotations:{readOnlyHint:false},execute:stepGameFrames},{name:'restart_game',description:'Restart the tutorial.',inputSchema:{type:'object',properties:{},additionalProperties:false},annotations:{readOnlyHint:false},execute:input=>{if(!input||Object.keys(input).length)throw Error('Expected an empty object');restart();return{status:mode,lives}}}])try{Promise.resolve(document.modelContext.registerTool(tool,{signal:life.signal})).catch(()=>{})}catch{}window.addEventListener('pagehide',()=>life.abort())}
setup();p.inv=0;if(selectedAct===2)selectAct(2);requestAnimationFrame(frame);
