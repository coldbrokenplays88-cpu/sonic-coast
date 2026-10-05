'use strict';
// Two world-unit pixels, a small material palette, and world-anchored patterns.
// Geometry remains in the physics builder; all architectural bodies render behind decks.
const CITY_PIXEL=2;
let cityRasterContext=null;
function cityPixelRect(x,y,w,h,color){if(w<=0||h<=0)return;const dc=cityRasterContext||ctx;dc.fillStyle=color;dc.fillRect(Math.floor(x/2)*2,Math.floor(y/2)*2,Math.ceil(w/2)*2,Math.ceil(h/2)*2)}
function cityPixelLine(x1,y1,x2,y2,color,width=2){const steps=Math.max(1,Math.ceil(Math.max(Math.abs(x2-x1),Math.abs(y2-y1))/2));for(let i=0;i<=steps;i++){const t=i/steps;cityPixelRect(x1+(x2-x1)*t-width/2,y1+(y2-y1)*t-width/2,width,width,color)}}
function cityPixelOval(x,y,rx,ry,color){for(let yy=-Math.ceil(ry/2);yy<=ry/2;yy++){const dy=yy*2,w=Math.floor(rx*Math.sqrt(Math.max(0,1-dy*dy/(ry*ry)))/2)*2;cityPixelRect(x-w,y+dy,w*2,2,color)}}
const cityMaterials=[
 {body:'#25223e',shade:'#151b30',light:'#57536f',edge:'#8b758b',window:'#d280ac',glow:'#e6aecb',cool:'#6189a5'},
 {body:'#2c2441',shade:'#181b30',light:'#625173',edge:'#a87b94',window:'#c773a6',glow:'#f2b0cb',cool:'#657b9d'},
 {body:'#283046',shade:'#151e31',light:'#53607a',edge:'#819099',window:'#769ab0',glow:'#b6d0d6',cool:'#c987a3'},
 {body:'#332b43',shade:'#1c1f32',light:'#65566d',edge:'#ac8b89',window:'#c48c77',glow:'#ebbd86',cool:'#777fa3'}
];
function cityFacade(left,right,roofY,seed=0,exposed=false,landmark=null){
 const p=cityMaterials[Math.abs(seed)%4],x1=Math.max(left,cam-40),x2=Math.min(right,cam+W/zoom+40),top=Math.max(roofY,camY-40),bottom=camY+H/zoom+80;if(x2<=x1||bottom<=top)return;
 cityPixelRect(x1,top,x2-x1,bottom-top,p.body);
 // Solid side faces and masonry texture: no transparent foreground silhouettes.
 for(let yy=Math.ceil(top/32)*32;yy<bottom;yy+=32){cityPixelRect(x1,yy,x2-x1,2,p.shade);for(let xx=Math.ceil((x1-(Math.floor(yy/32)%2)*24)/48)*48+(Math.floor(yy/32)%2)*24;xx<x2;xx+=48){const k=Math.abs(Math.floor(xx/48)*7+Math.floor(yy/32)*13+seed)%7;cityPixelRect(xx+10,yy+12,6,2,k===0?p.edge:p.light);cityPixelRect(xx+29,yy+23,8,2,p.shade)}}
 const width=right-left,bay=exposed?150:110,start=Math.ceil((x1-left-12)/bay);
 for(let c=start;c*bay+left+12<x2;c++){const x=left+12+c*bay,wide=Math.min(bay-18,right-x-12);if(wide<16)continue;
  cityPixelRect(x,top,wide,bottom-top,p.shade);cityPixelRect(x-4,top,4,bottom-top,p.light);cityPixelRect(x+wide,top,4,bottom-top,p.light);
  for(let y=roofY+24+Math.max(0,Math.floor((top-roofY-24)/96))*96;y<bottom;y+=96){const key=Math.abs(c*17+Math.floor((y-roofY)/64)*11+seed)%13;
   cityPixelRect(x,y-4,wide+4,6,p.light);cityPixelRect(x+4,y+5,wide-8,40,'#11192c');
   if(exposed&&key%3===0){cityPixelLine(x+6,y+8,x+wide-8,y+43,p.light,4);cityPixelRect(x+8,y+10,10,4,p.edge)}
   else{for(let j=0;j<2;j++){const wx=x+8+j*(wide-14)/2,ww=Math.max(8,(wide-26)/2),lit=key%5!==0;cityPixelRect(wx,y+8,ww,30,lit?(key%2?p.window:p.cool):'#22243a');if(lit){cityPixelRect(wx,y+8,ww,4,p.glow);cityPixelRect(wx+2,y+14,2,18,p.light);cityPixelRect(wx+ww-4,y+22,4,16,p.shade);cityPixelRect(wx+4,y+23,ww-8,2,p.body)}}}
   if(key===0&&seed>35){cityPixelRect(x+wide/2,y+30,10,12,'#ff742e');cityPixelRect(x+wide/2+2,y+25,6,12,'#ffb747');cityPixelRect(x+wide/2+4,y+32,2,8,'#ffe39c')}
  }
 }
 if(left>=cam-40){cityPixelRect(left,top,6,bottom-top,p.edge);cityPixelRect(left+6,top,8,bottom-top,p.light)}
 if(right<cam+W/zoom+40){cityPixelRect(right-18,top,14,bottom-top,p.shade);cityPixelRect(right-4,top,4,bottom-top,'#0d1428')}
 if(landmark==='BROADCAST RELAY'){const x=right-66;for(let y=roofY+34+Math.max(0,Math.floor((top-roofY)/120))*120;y<bottom;y+=120){cityPixelRect(x,y,6,98,p.edge);cityPixelLine(x,y+30,x-30,y+45,p.light,6);cityPixelOval(x-34,y+45,24,12,p.edge);cityPixelOval(x-34,y+43,18,6,p.shade);cityPixelRect(x-36,y+30,4,14,p.cool)}}
 else if(landmark==='NEON WORKS'){const x=left+24;cityPixelRect(x,top,54,bottom-top,p.shade);for(let y=roofY+34+Math.max(0,Math.floor((top-roofY)/96))*96;y<bottom;y+=96){cityPixelRect(x+8,y,36,56,p.body);cityPixelLine(x+17,y+8,x+32,y+22,'#c67baf',4);cityPixelLine(x+32,y+22,x+17,y+36,'#c67baf',4);cityPixelRect(x+8,y+48,32,2,'#6db1ba')}}
 else if(landmark==='WEST TOWER'){const x=left+width*.45;cityPixelRect(x,top,46,bottom-top,'#11182b');for(let y=Math.ceil(top/96)*96;y<bottom;y+=96){cityPixelRect(x-12,y+30,58,28,p.shade);cityPixelLine(x-30,y,x+45,y+70,p.edge,6)}}
 else if(landmark==='EAST WORKSITE'){const x=right-58;cityPixelRect(x,top,24,bottom-top,'#6a554a');for(let y=Math.ceil(top/64)*64;y<bottom;y+=64){cityPixelLine(x,y,x+22,y+54,'#c59562',4);cityPixelLine(x+22,y,x,y+54,'#a77958',4)}}
 else if(landmark==='HELIPAD ACCESS'){const x=right-95;cityPixelRect(x,top,54,bottom-top,'#343d4f');for(let y=Math.ceil(top/48)*48;y<bottom;y+=48){cityPixelRect(x+4,y,46,6,p.edge);cityPixelRect(x+12,y+10,26,24,p.shade)}}
}
function cityPillar(x,y,bottom,steel=false){const p=cityMaterials[steel?2:0];cityPixelRect(x,y,steel?16:30,bottom-y,p.shade);cityPixelRect(x,y,steel?4:6,bottom-y,p.edge);cityPixelRect(x+6,y,steel?6:16,bottom-y,p.body);for(let yy=Math.ceil(y/52)*52;yy<bottom;yy+=52){cityPixelRect(x-4,yy,steel?24:38,6,p.light);if(steel)cityPixelLine(x+4,yy+8,x+12,yy+45,p.light,2)}}
function drawPixelCityStructures(){
 for(const b of level.buildings){if(b.scenery)continue;const roof=b.roofId&&level.surfaces.find(s=>s.id===b.roofId),top=roof?yOn(roof,b.x)+26:b.y;if(b.x+b.w<cam-40||b.x>cam+W/zoom+40)continue;cityFacade(b.x,b.x+b.w,top,b.seed,!!b.exposed,b.landmark)}
 for(const s of level.surfaces){if(!active(s)||s.wallCap)continue;const q=pose(s),left=Math.max(q.x1,cam-40),right=Math.min(q.x2,cam+W/zoom+40),type=s.cityType,bottom=camY+H/zoom+80;if(right<=left||Math.min(q.y1,q.y2)>bottom||type==='interior')continue;
  if(type==='rooftop'&&!s.facade&&!s.roof){cityFacade(q.x1,q.x2,Math.min(q.y1,q.y2)+26,Math.floor(s.x1/810),false);continue}
  if(s.roof||s.facade){if(s.facade){for(const x of [q.x1+12,q.x2-24]){const y=yOn(s,x)+26;cityPixelLine(x,y,x+26,y+48,'#68778b',4);cityPixelRect(x+22,y+43,12,8,'#a28287')}}continue}
  if(s.kind==='moving'){
   const horizontal=s.motion?.axis==='x',top=horizontal?s.y1-115:s.y1-(s.motion?.amp||0)-40,railBottom=s.y1+(s.motion?.amp||0)+60;
   if(horizontal){const spanLeft=Math.max(s.x1-s.motion.amp,cam-40),spanRight=Math.min(s.x2+s.motion.amp,cam+W/zoom+40);cityPixelRect(spanLeft,top,spanRight-spanLeft,8,'#405066');cityPixelRect(spanLeft,top,spanRight-spanLeft,2,'#a2968a');for(const x of [q.x1+8,q.x2-12]){cityPixelRect(x-4,top+2,12,10,'#697b8e');cityPixelLine(x,q.y1+14,x,Math.max(top+10,camY-40),'#697b8e',2)}}
   else for(const x of [s.x1+8,s.x2-12]){const visibleTop=Math.max(top,camY-40),visibleBottom=Math.min(railBottom,bottom);cityPixelRect(x,visibleTop,4,visibleBottom-visibleTop,'#405066');cityPixelRect(x+4,visibleTop,2,visibleBottom-visibleTop,'#a2968a');cityPixelLine(x,yOn(s,x)+14,x,visibleTop,'#697b8e',2)}continue
  }
  if(s.grindable){for(let x=Math.ceil(left/260)*260;x<right;x+=260)cityPillar(x,yOn(s,x)+10,bottom,true);continue}
  const spacing=type==='highway'||type==='concrete-ramp'?240:160;
  for(let x=Math.ceil((left-24)/spacing)*spacing;x<right;x+=spacing){if(x<q.x1+6||x>q.x2-24)continue;const y=yOn(s,x)+26;cityPillar(x,Math.max(y,camY-40),bottom,type!=='highway');const x2=Math.min(x+90,q.x2-8);cityPixelLine(x+4,y,x2,yOn(s,x2)+100,'#526277',4)}
 }
}
const cityDeckTextures=new Map();
const cityLoopTextures=new Map();
function paintPixelCityLoop(cx,cy,r){
 for(let y=-r-14;y<=r+14;y+=2)for(let x=-r-14;x<=r+14;x+=2){const radius=Math.hypot(x+1,y+1),offset=radius-r;if(Math.abs(offset)>12)continue;
  const color=offset>9?'#111b31':offset>6?'#7696ad':offset>3?'#4e657e':offset>-7?'#25354d':offset>-10?'#88c7d1':'#3c667d';cityPixelRect(cx+x,cy+y,2,2,color);
 }
}
function drawPixelCityLoop(l){
 if(!document.createElement){paintPixelCityLoop(l.x,l.y-l.r,l.r);return}
 let texture=cityLoopTextures.get(l.r);if(!texture){const diameter=l.r*2+28;texture=document.createElement('canvas');texture.width=diameter/2;texture.height=diameter/2;const dc=texture.getContext('2d');dc.scale(.5,.5);cityRasterContext=dc;try{paintPixelCityLoop(l.r+14,l.r+14,l.r)}finally{cityRasterContext=null}cityLoopTextures.set(l.r,texture)}
 ctx.drawImage(texture,l.x-l.r-14,l.y-l.r*2-14,texture.width*2,texture.height*2);
}
function drawPixelCityDeck(s,left,right){
 const q=pose(s),width=q.x2-q.x1,delta=q.y2-q.y1,key=[width,delta,s.cityType,s.kind].join('/');
 if(document.createElement){let texture=cityDeckTextures.get(key);
  if(!texture){texture=document.createElement('canvas');texture.width=Math.ceil((width+2)/2);texture.height=Math.ceil((Math.abs(delta)+52)/2);const dc=texture.getContext('2d');dc.scale(.5,.5);cityRasterContext=dc;
   try{paintPixelCityDeck({x1:0,x2:width,y1:Math.max(0,-delta),y2:Math.max(0,delta),kind:s.kind,cityType:s.cityType,crumbleTimer:-1},0,width)}finally{cityRasterContext=null}
   cityDeckTextures.set(key,texture);
  }
  const cut=Math.max(0,left-q.x1),span=Math.min(right-left,width-cut),offset=s.crumbleTimer>0&&s.crumbleTimer<16?Math.round(Math.sin(runFrames*3))*2:0;
  ctx.drawImage(texture,cut/2,0,span/2,texture.height,left,Math.min(q.y1,q.y2)+offset,span,texture.height*2);drawClimbCue(s,left,right);return;
 }
 paintPixelCityDeck(s,left,right);drawClimbCue(s,left,right);
}
function paintPixelCityDeck(s,left,right){
 const q=pose(s),type=s.cityType||'scaffold',concrete=['rooftop','concrete-ramp','highway','ruined-walkway','broken-bridge','exposed-floor','tower-cap'].includes(type),height=type==='ventilation'?38:type==='billboard'?46:concrete?32:24,edge=s.kind==='express'?'#e1b875':s.kind==='lower'?'#7796b0':s.kind==='crumble'?'#c89468':s.kind==='moving'?'#83b3b5':'#8cafbd';
 const shakeOffset=s.crumbleTimer>0&&s.crumbleTimer<16?Math.round(Math.sin(runFrames*3))*2:0;
 for(let x=Math.floor(left/2)*2;x<right;x+=2){const y=Math.round((yOn(s,x)+shakeOffset)/2)*2;cityPixelRect(x,y,2,height,concrete?'#4f4c62':'#35455b');cityPixelRect(x,y,2,2,edge);cityPixelRect(x,y+2,2,4,'#b0a2a4');cityPixelRect(x,y+6,2,4,concrete?'#70637b':'#607486');cityPixelRect(x,y+height-8,2,6,'#23283f');cityPixelRect(x,y+height-2,2,2,'#111a2f')}
 for(let x=Math.ceil(left/32)*32;x<right-12;x+=32){const y=yOn(s,x)+shakeOffset,k=Math.abs(Math.floor(x/32))%5;
  cityPixelRect(x,y+10,2,height-18,'#24293e');cityPixelRect(x+2,y+12,8,2,k===1?'#9b8292':'#746c83');cityPixelRect(x+16,y+18,6,2,'#2b3047');cityPixelRect(x+24,y+12,2,2,'#c0aa99');
  if(type==='ventilation'){for(const xx of [x+8,x+16,x+24]){cityPixelRect(xx,y+12,4,16,'#172b3c');cityPixelRect(xx+4,y+12,2,14,'#648899')}}
  else if(!concrete&&type!=='billboard'){cityPixelLine(x+4,y+10,x+20,y+height-8,'#698299',2);cityPixelLine(x+20,y+10,x+4,y+height-8,'#485f76',2)}
  if(s.kind==='crumble'||type==='broken-bridge'){cityPixelRect(x+11,y+6,2,8,'#1b2138');cityPixelRect(x+13,y+12,6,2,'#1b2138');cityPixelRect(x+17,y+14,2,10,'#1b2138')}
 }
 if(type==='billboard'&&right-left>100){const x=Math.max(q.x1+10,left+6),y=yOn(s,x)+14;cityPixelRect(x,y,76,20,'#28263f');for(let i=0;i<5;i++)cityPixelRect(x+8+i*12,y+4,6,10,i%2?'#bd85a9':'#778fae')}
}
const ringPixels=[
 '.....gggggg.....','...ggwwwwwwgg...','..gwyyyyyywwgg..','.gwyggssssgywgg.','.wygs......sgwg.','gwyg........gywg','gyg..........gyg','gyg..........gyg','gyg..........gyg','gyg..........gyg','gwg..........gwg','.gwg........gwg.','.gywg......gwyg.','..gywwyyyywwyg..','...ggwwwwwwgg...','.....ssssss.....'
],ringPalette={g:'#efa900',y:'#f4ef00',w:'#f4f1ec',s:'#954100'};
function drawPixelRing(x,y,scale=1){const width=Math.max(4,Math.round(16*scale)),left=Math.round(x-width/2),top=Math.round(y-12);for(let row=0;row<16;row++)for(let col=0;col<16;col++){const key=ringPixels[row][col];if(key==='.')continue;const a=left+Math.round(col*width/16),b=left+Math.round((col+1)*width/16);if(b>a){ctx.fillStyle=ringPalette[key];ctx.fillRect(a,top+Math.floor(row*1.5),b-a,Math.ceil((row+1)*1.5)-Math.floor(row*1.5))}}}
function drawPixelAirDevice(d,spring=false){const pulse=runFrames-(d.firedAt??-100),y=d.y;if(d.hidden){for(let i=0;i<3;i++){const age=(runFrames*.003+i/3)%1;cityPixelRect(d.x-10+i*9,y-18-age*250,2,4,i%2?'#ac7e62':'#d59a64')}cityPixelRect(d.x-26,y-8,52,8,'#343342');for(let i=0;i<6;i++)cityPixelRect(d.x-22+i*8,y-7,4,5,'#171e30');return}
 if(spring){cityPixelRect(d.x-18,y-8,36,8,'#8b3f60');cityPixelRect(d.x-16,y-10,32,4,'#e7b883');for(let j=0;j<3;j++)cityPixelRect(d.x-11+j*7,y-5,4,5,'#e6dcb5');return}
 cityPixelRect(d.x-28,y-12,56,12,'#252c45');cityPixelRect(d.x-26,y-14,52,4,'#9aa8ac');cityPixelRect(d.x-26,y-10,52,4,'#5e7688');for(let x=d.x-20;x<d.x+22;x+=8){cityPixelRect(x,y-10,4,8,'#152438');cityPixelRect(x,y-10,4,2,'#b1bbc1')}
 for(let i=0;i<4;i++){const rise=(runFrames*.7+i*13)%56,xx=d.x-18+i*12;cityPixelRect(xx,y-20-rise,2,8,'#82b8c5');cityPixelRect(xx-2,y-22-rise,6,2,'#c3d7d8')}
 if(pulse>=0&&pulse<12){cityPixelRect(d.x-22,y-18,44,2,'#c3eef0');cityPixelRect(d.x-16,y-26-pulse*2,32,2,'#82b8c5')}
}

// Opaque frontage hides undiscovered routes; breaches reveal a restrained cutaway.
function drawCityCutaways(b){
 if(b.x+b.w<cam-40||b.x>cam+W/zoom+40)return;
 const gate=b.gateId&&level.hazards.find(h=>h.id===b.gateId);if(gate&&!gate.broken)return;
 for(const r of b.rooms||[]){const top=r.sloped?b.y+24:r.y-170,bottom=r.sloped?r.bottom:r.y+12,left=Math.max(r.x1,cam-40),right=Math.min(r.x2,cam+W/zoom+40);if(right<=left||bottom<camY-40||top>camY+H/zoom+40)continue;
  cityPixelRect(left,Math.max(top,camY-40),right-left,Math.min(bottom,camY+H/zoom+40)-Math.max(top,camY-40),'#10182b');
  cityPixelRect(left,top,right-left,8,'#62596b');for(let x=Math.ceil(left/200)*200;x<right;x+=200){cityPixelRect(x,top+10,8,bottom-top-18,'#29344a');cityPixelRect(x+16,top+26,36,4,'#77657b')}
  if(!r.sloped){cityPixelRect(left,r.y-55,right-left,3,'#3d455b');for(let x=Math.ceil(left/120)*120;x<right;x+=120)cityPixelRect(x,r.y-110,18,4,'#73828d')}
 }
 if(b.duct){const d=b.duct;cityPixelRect(d.x-25,d.y1+20,50,d.y2-d.y1-30,'#111b2c');cityPixelRect(d.x-31,d.y1+20,6,d.y2-d.y1-30,'#596b7b');cityPixelRect(d.x+25,d.y1+20,6,d.y2-d.y1-30,'#596b7b');for(let y=d.y1+60;y<d.y2;y+=90){cityPixelRect(d.x-20,y,40,3,'#354b61')}}
 if(b.burning){for(const x of [b.x+80,b.x+b.w-110]){cityFlame(x,b.y+28,40,85,Math.floor(x/100),.9);citySmoke(x,b.y-40,40,2,.25)}}
}
function drawCityBreakable(h){
 if(h.style==='glass'){
  cityPixelRect(h.x,h.y,h.w,h.h,'#315675');cityPixelRect(h.x,h.y,4,h.h,'#a3c4d0');cityPixelRect(h.x+h.w-4,h.y,4,h.h,'#7699ac');for(let y=h.y+8;y<h.y+h.h-8;y+=24){cityPixelRect(h.x+5,y,h.w-10,2,'#87aebc');cityPixelLine(h.x+6,y+3,h.x+h.w-6,y+18,'#567e9c',2)}
 }else{
  cityPixelRect(h.x,h.y,h.w,h.h,'#283046');for(let y=h.y+10;y<h.y+h.h;y+=32){cityPixelRect(h.x,y,h.w,2,'#151e31');cityPixelRect(h.x+4,y+12,6,2,'#53607a')}
  // One low-contrast crack, no border, arrows, glow, label or doorway shape.
  const x=h.x+12,y=h.y+74;cityPixelRect(x,y,2,8,'#1c2539');cityPixelRect(x+2,y+6,4,2,'#1c2539');cityPixelRect(x+4,y+8,2,10,'#1c2539');
  if(!h.secret){cityPixelRect(h.x+4,h.y+16,h.w-8,4,'#8c9ca4');cityPixelRect(h.x+4,h.y+h.h-8,h.w-8,4,'#7c8993')}
 }
}
