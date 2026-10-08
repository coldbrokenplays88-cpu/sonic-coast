'use strict';
function selectAct(act){selectedAct=act===2?2:1;setup();mode='ready';show(selectedAct===2?'City on<br><em>the brink.</em>':'Ready.<br><em>Gotta go.</em>',selectedAct===2?'Through ruined streets and exposed towers.<br>Reach the rooftop helipad.':'Build momentum. Jump the rails and roll through tunnels.',selectedAct===2?'PLAY ACT 02':'PLAY ACT 01');$('#act-select').value=String(selectedAct)}
function resetAct2(){if(level.act!==2)return;for(const group of level.collapseGroups||[])group.triggered=false;for(const d of level.debris){d.triggered=d.x<level.checkpoints[checkpoint].x;d.age=d.triggered?240:0}for(const e of level.events)e.age=e.trigger<level.checkpoints[checkpoint].x?150:-1;for(const l of level.loops){l.used=l.x<level.checkpoints[checkpoint].x;l.solved=false}for(const h of level.hazards)if(h.type==='breakable')h.broken=!!h.broken&&h.x<level.checkpoints[checkpoint].x}
function launchAirDevice(device){
 if(device.launchX!==undefined)p.vx=device.launchX;if(device.id==='mid-low-spring')p.poolApproach=true;if(device.poolBooster)p.poolExit=true;
 p.airSpeedLimit=device.airSpeedLimit??null;if(p.airSpeedLimit)p.vx=Math.max(-p.airSpeedLimit,Math.min(p.airSpeedLimit,p.vx));p.jumpAttack=true;p.vy=-device.power;p.ground=false;p.surface=null;p.rolling=false;p.roll=true;p.poseJumpFrame=runFrames;p.brakeActive=false;p.stopFrame=-100;coyote=0;jumpBuffer=0;p.airLaunchUntil=runFrames+Math.ceil(device.power/.58);device.firedAt=runFrames;sparks(device.x,device.y-10,6,device.cityVent?'#9be3ef':'#ffe68b');gameSound(device.poolBooster?'pool':device.cityVent?'vent':'spring',{launch:!!device.poolBooster});
}
function beginLoop(l){p.brakeActive=false;p.brakeAge=0;p.stopFrame=-100;p.loop={id:l.id,theta:0,speed:Math.abs(p.vx)};p.x=l.x;p.y=l.y-20;p.vy=0;p.ground=true;p.surface=null;l.used=true}
function updateLoop(){const l=level.loops.find(l=>l.id===p.loop.id),q=p.loop;p.lastX=p.x;p.lastY=p.y;
 const want=keys.has('ShiftLeft')||keys.has('ShiftRight')||keys.has('KeyX')||keys.has('MouseBoost');updateBoostState(want);
 if(p.boosting){q.speed+=(23-q.speed)*.14;}else{q.speed+=-.58*Math.sin(q.theta)-.012+(keys.has('ArrowRight')||keys.has('KeyD')?.06:0);}
 q.speed=Math.min(24,q.speed);
 const detach=jumpBuffer>0||(q.speed<5.5&&q.theta>Math.PI*.3&&q.theta<Math.PI*1.3);
 if(detach){p.vx=Math.cos(q.theta)*Math.max(5,q.speed);p.vy=-Math.sin(q.theta)*q.speed-(jumpBuffer?8:0);if(jumpBuffer){p.jumpAttack=true;stats.jumps++;p.poseJumpFrame=runFrames}jumpBuffer=0;p.loop=null;p.ground=false;p.surface=null;return true}
 q.theta+=Math.max(4,q.speed)/l.r;anim+=q.speed*.08;stats.maxSpeed=Math.max(stats.maxSpeed,q.speed);
 if(q.theta>=Math.PI*2){p.loop=null;l.solved=true;stats.loops++;score+=500;p.x=l.x+24;p.y=l.y-20;p.vx=Math.min(24,Math.max(10,q.speed));p.vy=0;p.ground=true;p.surface=level.surfaces.find(s=>active(s)&&p.x>=s.x1&&p.x<=s.x2&&Math.abs(yOn(s,p.x)-l.y)<12)||null;return true}
 p.x=l.x+Math.sin(q.theta)*l.r;p.y=l.y-l.r+Math.cos(q.theta)*l.r-20;p.vx=Math.cos(q.theta)*q.speed;p.vy=-Math.sin(q.theta)*q.speed;p.face=1;p.ground=true;return true
}
function updateAct2(){if(level.act!==2)return;
 for(const l of level.loops)if(!p.loop&&!l.used&&p.ground&&p.vx>9&&p.lastX<=l.x&&p.x>=l.x&&Math.abs(feet()-l.y)<18)beginLoop(l);
 for(const e of level.events)if(e.age<0&&p.x>e.trigger){e.age=0;sparks(e.x,e.y,12,'#ff894d');shake=Math.max(shake,4)}else if(e.age>=0&&e.age<180)e.age++;
 for(const d of level.debris){if(!d.triggered&&(!d.entryX||p.x>=d.entryX)&&d.x-p.x>0&&d.x-p.x<Math.max(900,Math.abs(p.vx)*70)&&Math.abs(p.y-d.y)<550){d.triggered=true;d.age=0;gameSound('warning',{pan:Math.max(-1,Math.min(1,(d.x-p.x)/600))})}
  if(!d.triggered||d.age>=d.warn+d.fall+120)continue;d.age++;
  if(d.age>=d.warn){const t=Math.min(1,(d.age-d.warn)/d.fall),y=d.y-460+(460)*t*t;
   if(p.x+13>d.x-d.w/2&&p.x-13<d.x+d.w/2&&feet()>y-44&&feet()-bodyHeight()<y)hurt(d.x);
   if(d.age===d.warn+d.fall){if(Math.abs(d.x-p.x)<800)gameSound('hazard');sparks(d.x,d.y,10,'#ffb356');shake=Math.max(shake,3)}
  }
 }
}
// Predict an upcoming foot crossing for framing only; never alter movement or landing.
function predictLanding(){if(level.act!==2||p.ground||p.loop||Math.abs(p.vx)<9)return null;let best=null;
 for(const s of level.surfaces){if(!active(s)||(s.entrySpeed&&!s.solidAtAnySpeed&&Math.abs(p.vx)<s.entrySpeed))continue;const q=pose(s),floor=q.y1+(p.x-q.x1)*q.slope,b=p.vy+.29-q.slope*p.vx,c=feet()-floor,d=b*b-1.16*c;if(d<0)continue;let t=(-b+Math.sqrt(d))/.58;
  const cap=Math.max(0,(20-p.vy)/.58);if(t>cap){const rise=p.vy*cap+.29*cap*(cap+1),den=20-q.slope*p.vx;if(den<=0)continue;t=(floor-feet()-rise+20*cap)/den}
  const x=p.x+p.vx*t;if(t<.5||t>60||x<q.x1-FOOT_RADIUS||x>q.x2+FOOT_RADIUS)continue;if(!best||t<best.t)best={id:s.id,x,y:yOn(s,x),t};
 }return best
}
function updateCamera(){const speed=p.loop?p.loop.speed:Math.abs(p.vx),act2=level.act===2;
 // Ease across the speed range, including the old threshold, without a target jump.
 const speedBlend=Math.max(0,Math.min(1,(speed-8)/16)),targetZoom=.94-.18*speedBlend*speedBlend*(3-2*speedBlend);zoom+=(targetZoom-zoom)*.025;
 const vw=W/zoom,lead=Math.min(act2?340:230,Math.max(-180,p.vx*(act2?12:9))),anchor=act2?W/zoom*.38:280;
 cam+=(Math.max(0,Math.min(END-vw+260,p.x-anchor+lead))-cam)*.15;
 // Ground framing must ease too: the former speed<9 switch jerked the
 // entire scene during ordinary acceleration and braking, despite smooth zoom.
 const groundBlend=Math.max(0,Math.min(1,(speed-6)/6)),verticalAnchor=p.ground?.68-.08*groundBlend*groundBlend*(3-2*groundBlend):.60;
 let targetY=act2?p.y-H/zoom*verticalAnchor+Math.min(0,p.vy*8):Math.max(-110,Math.min(190,p.y-350));
 if(act2){const landing=predictLanding();if(landing)targetY=Math.min(p.y-H/zoom*.26,Math.max(targetY,landing.y-H/zoom*.84))}
 if(act2&&level.verticalCity)targetY=Math.max(p.y-H/zoom*.78,Math.min(p.y-H/zoom*.25,targetY));camY+=(targetY-camY)*(act2?.18:.08)
}
// Small deterministic pixel effects keep fire and smoke anchored to the artwork.
function cityFlame(x,y,w,h,seed=0,alpha=1){const beat=Math.floor(step/2),unit=1;ctx.save();ctx.globalAlpha=alpha;
 for(let i=0;i<8;i++){const pulse=.57+.43*(Math.sin(beat*.71+i*2.31+seed)+1)/2,fh=Math.round(h*pulse/unit)*unit,xx=Math.round((x-w/2+i*w/8)/unit)*unit,ww=Math.max(1,Math.round(w/8/unit)*unit);
  ctx.fillStyle='#ff5d2f';ctx.fillRect(xx,y-fh,ww,fh);ctx.fillStyle='#ffad3d';ctx.fillRect(xx+unit,y-fh*.72,Math.max(unit,ww-unit),fh*.72);ctx.fillStyle='#ffe483';ctx.fillRect(xx+unit,y-fh*.36,Math.max(unit,ww-unit*2),fh*.36);
  ctx.fillStyle='#ffaf5060';const age=(step*.015+i*.21+seed*.13)%1;ctx.fillRect(xx+Math.sin(age*6+seed)*9,y-h-age*h*.8,3,3);
 }ctx.restore()}
function citySmoke(x,y,size,seed=0,alpha=.2){ctx.save();for(let j=0;j<8;j++){const t=(step*.0022+j/8+seed*.071)%1,drift=t*size*.75+Math.sin(t*5+seed)*size*.16,cx=Math.round((x+drift)/2)*2,cy=Math.round((y-t*size*3)/2)*2,r=Math.round((size*(.25+t*.6))/2)*2;
 ctx.globalAlpha=alpha*(1-t)*.8;ctx.fillStyle=j%2?'#392441':'#221733';ctx.fillRect(cx-r,cy-r*.4,r*2,r);ctx.fillRect(cx-r*.7,cy-r*.8,r*1.5,r*1.7);ctx.fillStyle='#74526a';ctx.globalAlpha=alpha*(1-t)*.22;ctx.fillRect(cx-r*.65,cy-r*.75,r,r*.4);
 }ctx.restore()}
const skylineSmokeSprites=new Map();
function drawSkylineSmoke(x,y,size,seed,alpha){
 if(!document.createElement)return citySmoke(x,y,size,seed,alpha);
 const variant=seed%8;let texture=skylineSmokeSprites.get(variant);
 if(!texture){texture=document.createElement('canvas');texture.width=texture.height=64;const dc=texture.getContext('2d'),lobes=[[22,30,19],[40,25,17],[32,15,13],[42,40,16],[22,43,14]],colors=['#211032','#30143f','#421a4b','#582154'];
  for(let yy=0;yy<64;yy+=2)for(let xx=0;xx<64;xx+=2){if(!lobes.some(([cx,cy,r])=>(xx-cx)**2+(yy-cy)**2<r*r))continue;const grain=Math.sin(xx*.53+yy*.31+variant*2.1);dc.fillStyle=colors[Math.max(0,Math.min(3,Math.floor(1.5+grain+(32-yy)*.025)))];dc.fillRect(xx,yy,2,2)}skylineSmokeSprites.set(variant,texture);
 }
 ctx.save();for(let j=0;j<6;j++){const t=(step*.0026+j/6+seed*.073)%1,span=Math.round(size*(.65+t*1.1)/2)*2,cx=Math.round((x+t*size*.8+Math.sin(t*5+seed)*size*.2)/2)*2,cy=Math.round((y-t*size*3.2)/2)*2;ctx.globalAlpha=alpha*Math.min(1,t*8)*(1-t);ctx.drawImage(texture,cx-span/2,cy-span/2,span,span)}ctx.restore();
}
function drawAct2Background(){const progress=Math.max(0,Math.min(1,p.x/END)),im=art.recoveredCity||art.collapse||art.city;
 ctx.fillStyle='#100e30';ctx.fillRect(0,0,W,H);
 if(im){const w=W*1.4,h=w*im.height/im.width,scroll=Math.round(cam*.095),first=Math.floor(scroll/w),rise=Math.max(0,Math.min(1,-camY/6950))*220,top=Math.round(-145+rise);
  const fires=art.recoveredCity?[[345,321,22,70],[142,488,28,60],[633,468,24,64],[1380,616,32,82],[1480,890,27,52],[40,690,20,55],[840,780,25,45],[285,847,24,42],[962,940,34,48],[1120,760,28,48]]:[[353,363,23,65],[151,469,25,51],[1058,550,28,58],[1300,370,25,71],[1293,577,29,48],[632,644,35,39],[646,839,39,32],[183,702,32,45],[808,815,33,42],[960,932,44,58],[1115,741,27,54],[1455,796,32,42],[550,432,18,38]];
  // Alternate reflected panoramas so adjacent edge columns match exactly.
  // Global tile indices keep animation phases stable when the camera wraps.
  for(let tile=first-1;tile<=first+1;tile++){const left=tile*w-scroll;if(left+w<0||left>W)continue;drawCityBackdrop(im,left,top,w,h,tile%2!==0,true)}
  drawCityClouds(im,w,h,top);
  for(let tile=first-1;tile<=first+1;tile++){const left=tile*w-scroll;if(left+w<-140||left>W+140)continue;const scale=w/1536,mirrored=tile%2!==0;
   // Overlay only the real fire sites in the city image, with independent phases.
   for(let i=0;i<fires.length;i++){const [fx,fy,fw,fh]=fires[i],x=Math.round(left+(mirrored?1536-fx:fx)*scale),y=Math.round(top+fy*scale),seed=i+((tile%32+32)%32)*17;if(x<-90||x>W+90||y<0||y>H+140)continue;drawSkylineSmoke(x,y-fh*scale,42*scale,seed,.55+progress*.10);cityFlame(x,y,fw*scale*1.15,fh*scale,seed,.94)}
  }
 }
 ctx.fillStyle=`rgba(32,9,38,${.05+progress*.07})`;ctx.fillRect(0,0,W,H);
 for(let i=0;i<16+progress*18;i++){const x=((i*137-cam*.18+Math.sin(step*.012+i)*8)%W+W)%W,y=((i*91-step*(.5+progress*.6))%H+H)%H;ctx.fillStyle=i%3?'#ffb54c70':'#ff6b3160';ctx.fillRect(x,y,2,3)}
}
function drawAct2Structures(){for(const b of level.buildings)drawCityCutaways(b);drawPixelCityStructures()}
function drawAct2ServiceStructures(){for(const h of level.hazards.filter(h=>h.type==='breakable')){const left=h.x-200,right=h.x+850,top=h.floor-205;if(right<cam-50||left>cam+W/zoom+50||h.floor<camY-60||top>camY+H/zoom+60)continue;
 ctx.save();ctx.globalAlpha=.68;ctx.fillStyle='#171c35';ctx.beginPath();ctx.moveTo(left,h.floor+36);ctx.lineTo(left,top+95);ctx.lineTo(left+80,top+15);ctx.lineTo(right-100,top);ctx.lineTo(right,top+80);ctx.lineTo(right,h.floor+36);ctx.closePath();ctx.fill();ctx.strokeStyle='#6d4d64';ctx.lineWidth=8;ctx.beginPath();ctx.moveTo(left+20,h.floor);ctx.lineTo(left+20,top+95);ctx.lineTo(left+85,top+30);ctx.lineTo(right-110,top+15);ctx.lineTo(right-20,top+85);ctx.lineTo(right-20,h.floor);ctx.stroke();
 ctx.fillStyle='#38415a';for(let x=left+75;x<right-80;x+=125){ctx.fillRect(x,top+45,6,135);ctx.fillStyle='#764960';ctx.fillRect(x+6,top+45,3,135);ctx.fillStyle='#38415a'}ctx.fillStyle='#a97964';ctx.font='bold 17px monospace';ctx.fillText('RUINED SERVICE PASSAGE',left+220,top+68);ctx.fillStyle='#11172a';ctx.fillRect(left+100,top+90,right-left-250,15);ctx.restore()
}}
function drawAct2Bulkhead(h){const bottom=Math.min(h.y+h.h,camY+H/zoom+50),top=Math.max(h.y,camY-40),x=h.x;if(bottom<=top)return;
 ctx.fillStyle='#18233d';ctx.fillRect(x,top,h.w,bottom-top);ctx.fillStyle='#53647e';ctx.fillRect(x,top,5,bottom-top);ctx.fillStyle='#8c5972';ctx.fillRect(x+h.w-5,top,5,bottom-top);ctx.fillStyle='#77c8dc';ctx.fillRect(x,h.y,h.w,3);
 for(let y=Math.ceil(top/64)*64;y<bottom;y+=64){cityPixelLine(x+8,y,x+h.w-8,y+54,'#7891a155',2);cityPixelLine(x+h.w-8,y,x+8,y+54,'#7891a155',2);cityPixelRect(x+5,y,4,4,'#8ba8b1');cityPixelRect(x+h.w-9,y,4,4,'#8ba8b1')}
}
// Surface skins reuse collision tops; every solid highlight follows yOn exactly.
function drawAct2CityDeck(s,left,right){drawPixelCityDeck(s,left,right)}
function drawAct2Supports(s,left,right){if(s.grindable)drawGrindRail(s,left,right);else drawPixelCityDeck(s,left,right)}
function drawAct2World(){
 for(const l of level.loops){if(l.x+l.r<cam-50||l.x-l.r>cam+W/zoom+50)continue;drawPixelCityLoop(l)}
 for(const d of level.debris){if(!d.triggered||d.age>d.warn+d.fall+120||d.x<cam-100||d.x>cam+W/zoom+100)continue;
  if(d.age<d.warn)drawDebrisWarning(d);else drawPixelDebris(d);
 }
 for(const e of level.events){if(e.age<0||e.age>150||e.x+e.width<cam||e.x>cam+W/zoom)continue;for(let i=0;i<8;i++){const x=e.x+i*e.width/8,y=e.y+e.age*e.age*.035+(i%3)*15;cityPixelRect(x-26,y-8,70,18,i%2?'#644060':'#203551');cityPixelRect(x-26,y-8,70,3,'#fb956e');cityPixelLine(x-12,y-4,x+8,y+8,'#121d30',4)}}
 const a=level.arena;if(a.x<cam+W/zoom+100&&a.x+a.w>cam){for(let i=0;i<64;i++){const t=i*Math.PI/32,u=(i+1)*Math.PI/32;cityPixelLine(a.x+850+Math.cos(t)*240,a.y+6+Math.sin(t)*19,a.x+850+Math.cos(u)*240,a.y+6+Math.sin(u)*19,'#ffe694',2)}cityPixelRect(a.x+838,a.y-16,6,28,'#ffe694');cityPixelRect(a.x+858,a.y-16,6,28,'#ffe694');cityPixelRect(a.x+838,a.y-5,26,6,'#ffe694');for(const x of [a.x+80,a.x+a.w-180]){ctx.fillStyle='#565272';ctx.fillRect(x,a.y-150,8,150);cityPixelOval(x+4,a.y-153,7,7,step%60<30?'#ff6851':'#ffbd64')}sign(a.x+1200,a.y-140,'ROOFTOP HELIPAD','sector')}
}

// The gold rounded tube is a real collision surface, reserved for the skyline shortcut.
function drawGrindRail(s,left,right){for(let x=Math.floor(left/2)*2;x<right;x+=2){const y=yOn(s,x);cityPixelRect(x,y,2,12,'#29364b');cityPixelRect(x,y+2,2,3,'#ffe1a0');cityPixelRect(x,y+5,2,4,'#bd855b');cityPixelRect(x,y+9,2,3,'#74505a')}}

// Paint and structural detail always sit below the real collision edge.
function drawRoofFrontage(s,left,right,height){const style=Math.floor(s.x1/7100)%3;
 for(let x=Math.ceil(left/110)*110;x<right-28;x+=110){const y=yOn(s,x);ctx.fillStyle=style===1?'#182335':'#232b43';ctx.fillRect(x,y+30,36,height-50);
  if(style===1){ctx.strokeStyle='#596072';ctx.lineWidth=3;ctx.beginPath();ctx.moveTo(x+2,y+35);ctx.lineTo(x+32,y+height-26);ctx.moveTo(x+32,y+35);ctx.lineTo(x+2,y+height-26);ctx.stroke()}
  else for(let row=0;row<Math.floor((height-70)/38);row++){ctx.fillStyle=(row+Math.floor(x/110))%3?'#557788':'#7b687e';ctx.fillRect(x+5,y+39+row*38,style===2?24:10,style===2?8:17)}
 }
 ctx.strokeStyle='#677083';ctx.lineWidth=5;ctx.beginPath();ctx.moveTo(left,yOn(s,left)+height-14);ctx.lineTo(right,yOn(s,right)+height-14);ctx.stroke();
 if(style===2){ctx.strokeStyle='#48576b';ctx.lineWidth=4;for(let x=Math.ceil(left/350)*350;x<right-80;x+=350){const y=yOn(s,x);ctx.beginPath();ctx.moveTo(x,y+25);ctx.lineTo(x,y+145);ctx.lineTo(x+50,y+145);ctx.stroke();ctx.fillStyle='#9b805f';ctx.fillRect(x-7,y+82,14,5)}}
}
function drawClimbCue(s,left,right){const cue=level.routeCues?.find(c=>c.id===s.id);if(!cue||right-left<70)return;const next=level.surfaces.find(v=>v.id===cue.nextId),q=pose(s),dir=next.x1+next.x2<q.x1+q.x2?-1:1,x=Math.max(left+30,Math.min(right-30,(q.x1+q.x2)/2)),y=yOn(s,x)+14;
 ctx.fillStyle='#152033';ctx.fillRect(x-23,y-6,46,13);ctx.strokeStyle=s.kind==='moving'?'#91fcbb':s.kind==='crumble'?'#ffae55':'#91ccdb';ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(x-6*dir,y-3);ctx.lineTo(x+2*dir,y);ctx.lineTo(x-6*dir,y+3);ctx.moveTo(x+3*dir,y-3);ctx.lineTo(x+11*dir,y);ctx.lineTo(x+3*dir,y+3);ctx.stroke()
}
function drawFacadeBays(b){if(!b.exposed||!b.attachmentIds)return;for(const id of b.attachmentIds){const s=level.surfaces.find(s=>s.id===id),q=pose(s),left=Math.max(q.x1-10,b.x+9),right=Math.min(q.x2+10,b.x+b.w-15);if(left>=right)continue;const y=yOn(s,left);if(y<camY-120||y>camY+H/zoom+120)continue;
 ctx.fillStyle='#0b1426';ctx.fillRect(left,y-86,right-left,112);ctx.fillStyle='#344151';ctx.fillRect(left-4,y-86,5,112);ctx.fillRect(right-4,y-86,5,112);ctx.fillStyle='#6b5a66';for(let x=left+12;x<right-8;x+=63)ctx.fillRect(x,y-83,22,4);
 ctx.strokeStyle='#566478';ctx.lineWidth=3;ctx.beginPath();ctx.moveTo(left,yOn(s,left)+26);ctx.lineTo(right,yOn(s,right)+26);ctx.moveTo(left,yOn(s,left)+26);ctx.lineTo(Math.min(left+45,right),yOn(s,left)+62);ctx.stroke()
 }
 if(b.landmark&&b.y>camY-80&&b.y<camY+H/zoom){ctx.fillStyle='#152039';ctx.fillRect(b.x+14,b.y+8,Math.min(210,b.w-28),27);ctx.fillStyle='#b09079';ctx.font='bold 15px monospace';ctx.fillText(b.landmark,b.x+24,b.y+27)}
}

// Large, muted structural forms identify towers without suggesting new collision edges.
function drawDistrictArchitecture(b){if(!b.exposed||!b.landmark)return;const left=b.x,top=Math.max(b.y,camY-100),bottom=Math.min(b.y+b.h,camY+H/zoom+100),w=b.w;
 if(bottom<=top)return;ctx.save();
 if(b.landmark==='BROADCAST RELAY'){
  const x=left+w*.76;ctx.fillStyle='#142437';ctx.fillRect(x-34,top,75,bottom-top);ctx.fillStyle='#536878';ctx.fillRect(x-8,top,16,bottom-top);
  for(let y=b.y+45+Math.max(0,Math.floor((top-b.y)/115))*115;y<bottom;y+=115){ctx.strokeStyle='#75818c';ctx.lineWidth=3;ctx.beginPath();ctx.moveTo(x-8,y);ctx.lineTo(x+8,y+45);ctx.moveTo(x+8,y);ctx.lineTo(x-8,y+45);ctx.stroke();const dir=Math.floor((y-b.y)/115)%2?1:-1;ctx.strokeStyle='#4f657b';ctx.lineWidth=5;ctx.beginPath();ctx.moveTo(x,y+30);ctx.lineTo(x+dir*45,y+45);ctx.stroke();ctx.fillStyle='#667a86';ctx.beginPath();ctx.ellipse(x+dir*48,y+42,22,13,dir*.45,0,Math.PI*2);ctx.fill();ctx.fillStyle='#23394b';ctx.beginPath();ctx.ellipse(x+dir*48,y+42,15,8,dir*.45,0,Math.PI*2);ctx.fill()}
 }else if(b.landmark==='NEON WORKS'){
  for(const x of [left+24,left+w-105]){ctx.fillStyle='#172136';ctx.fillRect(x,top,80,bottom-top);ctx.fillStyle='#7b487e';ctx.fillRect(x+4,top,4,bottom-top);ctx.fillStyle='#47798b';ctx.fillRect(x+68,top,4,bottom-top);
   for(let y=b.y+35+Math.max(0,Math.floor((top-b.y)/105))*105;y<bottom;y+=105){ctx.fillStyle='#35283f';ctx.fillRect(x+12,y,48,73);ctx.strokeStyle=Math.floor((y-b.y)/105)%3?'#906084':'#6595a0';ctx.lineWidth=3;ctx.beginPath();ctx.moveTo(x+23,y+13);ctx.lineTo(x+46,y+25);ctx.lineTo(x+23,y+40);ctx.lineTo(x+46,y+54);ctx.stroke()}}
 }else if(b.landmark==='WEST TOWER'){
  const x=left+w*.45;ctx.fillStyle='#0b1628';ctx.beginPath();ctx.moveTo(left+20,top);ctx.lineTo(x+55,top);for(let y=top;y<bottom;y+=95){ctx.lineTo(x+(Math.floor((y-b.y)/95)%2?55:5),y);ctx.lineTo(x-35,y+48)}ctx.lineTo(x+20,bottom);ctx.lineTo(left+20,bottom);ctx.closePath();ctx.fill();
  ctx.fillStyle='#625668';ctx.fillRect(x+55,top,12,bottom-top);for(let y=b.y+50+Math.max(0,Math.floor((top-b.y)/120))*120;y<bottom;y+=120){ctx.strokeStyle='#594958';ctx.lineWidth=9;ctx.beginPath();ctx.moveTo(left+32,y);ctx.lineTo(x+58,y+75);ctx.stroke();ctx.fillStyle='#746471';ctx.fillRect(x+51,y+64,18,13)}
 }else if(b.landmark==='TRANSIT CONTROL'){
  for(const x of [left+w*.15,left+w*.78]){ctx.fillStyle='#3e4554';ctx.fillRect(x,top,65,bottom-top);ctx.fillStyle='#252e40';ctx.fillRect(x+14,top,37,bottom-top);for(let y=b.y+70+Math.max(0,Math.floor((top-b.y)/140))*140;y<bottom;y+=140){ctx.fillStyle='#59616a';ctx.fillRect(x-6,y,77,14)}}
 }else if(b.landmark==='EAST WORKSITE'){
  const x=left+w-75;ctx.fillStyle='#363441';ctx.fillRect(x-22,top,44,bottom-top);ctx.strokeStyle='#8a7355';ctx.lineWidth=4;for(let y=top;y<bottom;y+=65){ctx.beginPath();ctx.moveTo(x-18,y);ctx.lineTo(x+18,y+54);ctx.moveTo(x+18,y);ctx.lineTo(x-18,y+54);ctx.stroke()}
  ctx.strokeStyle='#746351';ctx.lineWidth=8;ctx.beginPath();ctx.moveTo(left+25,b.y+14);ctx.lineTo(x,b.y+14);ctx.stroke();ctx.lineWidth=3;ctx.beginPath();ctx.moveTo(x,b.y+14);ctx.lineTo(left+25,b.y+65);ctx.stroke();
 }else if(b.landmark==='HELIPAD ACCESS'){
  const x=left+w*.62;ctx.fillStyle='#293946';ctx.fillRect(x,top,73,bottom-top);ctx.fillStyle='#63747c';ctx.fillRect(x+8,top,7,bottom-top);for(let y=top+20;y<bottom;y+=78){ctx.fillStyle='#53646e';ctx.fillRect(x+4,y,65,6)}ctx.strokeStyle='#56647b';ctx.lineWidth=7;ctx.beginPath();ctx.moveTo(left+25,top);ctx.lineTo(left+25,bottom);ctx.stroke();
 }
 ctx.restore()
}
function drawDebrisBeacon(d){const y=d.y-124;ctx.fillStyle='#14203be8';ctx.beginPath();ctx.moveTo(d.x,y-20);ctx.lineTo(d.x-20,y+15);ctx.lineTo(d.x+20,y+15);ctx.closePath();ctx.fill();ctx.strokeStyle='#ffd158';ctx.lineWidth=2;ctx.stroke();ctx.fillStyle='#ffe09c';ctx.fillRect(d.x-2,y-10,4,12);ctx.fillRect(d.x-2,y+6,4,4);for(let i=0;i<2;i++){const yy=y+26+i*15+step%15*.5;ctx.strokeStyle='#ffd15890';ctx.beginPath();ctx.moveTo(d.x-7,yy);ctx.lineTo(d.x,yy+5);ctx.lineTo(d.x+7,yy);ctx.stroke()}}

function drawExposedFloorBody(s,left,right){const q=pose(s),center=(q.x1+q.x2)/2,lower=level.surfaces.find(v=>v.kind==='recovery'&&center>=v.x1&&center<=v.x2&&v.y1>q.y1&&v.y1-q.y1<350);if(!lower)return;const top=yOn(s,center)+46,bottom=yOn(lower,center);ctx.save();ctx.globalAlpha=.8;ctx.fillStyle='#20273b';for(const x of [q.x1+4,q.x2-20]){ctx.fillRect(x,top,16,bottom-top);ctx.fillStyle='#5a5364';ctx.fillRect(x,top,3,bottom-top);ctx.fillStyle='#20273b'}ctx.fillStyle='#2d3045';ctx.fillRect(q.x1+20,top,Math.min(52,q.x2-q.x1-40),Math.max(35,bottom-top-44));ctx.strokeStyle='#765c65';ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(q.x1+25,top+30);ctx.lineTo(q.x1+65,top+42);ctx.lineTo(q.x1+42,top+69);ctx.stroke();ctx.restore()}
