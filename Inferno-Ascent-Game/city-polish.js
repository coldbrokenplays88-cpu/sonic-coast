'use strict';
// Original world sprites on the same two-unit grid as the recovered city art.
// Frames are compiled into horizontal pixel runs once; no image smoothing,
// gradients, path antialiasing, external assets, or per-frame rasterization.
const polishSpriteCache=new Map();
function polishVisible(x,y,w=80,h=120){return x+w>=cam-40&&x-w<=cam+W/zoom+40&&y+h>=camY-40&&y-h<=camY+H/zoom+40}
function polishRaster(width,height,paint){
 const pixels=new Array(width*height).fill(null);
 const dot=(x,y,color)=>{x=Math.round(x);y=Math.round(y);if(x>=0&&x<width&&y>=0&&y<height)pixels[y*width+x]=color};
 const box=(x,y,w,h,color)=>{for(let yy=y;yy<y+h;yy++)for(let xx=x;xx<x+w;xx++)dot(xx,yy,color)};
 const line=(x1,y1,x2,y2,color,thickness=1)=>{const n=Math.max(Math.abs(x2-x1),Math.abs(y2-y1),1);for(let i=0;i<=n;i++)box(Math.round(x1+(x2-x1)*i/n),Math.round(y1+(y2-y1)*i/n),thickness,thickness,color)};
 // Scan-converted rounded metal parts retain visibly stepped pixel edges.
 const disk=(cx,cy,rx,ry,color)=>{for(let y=-ry;y<=ry;y++){const span=Math.floor(rx*Math.sqrt(Math.max(0,1-y*y/(ry*ry))));box(cx-span,cy+y,span*2+1,1,color)}};
 paint({dot,box,line,disk});return {width,height,pixels};
}
function polishCompile(raster,angle=0,anchorX=0,anchorY=0){
 const runs=[],a=angle*Math.PI/8,c=Math.cos(a),s=Math.sin(a),rotated=angle!==0;
 const bound=rotated?Math.ceil(Math.hypot(raster.width,raster.height)):0;
 const left=rotated?-bound:-anchorX,top=rotated?-bound:-anchorY,right=rotated?bound:raster.width-anchorX,bottom=rotated?bound:raster.height-anchorY;
 for(let y=top;y<bottom;y++){
  let start=left,last=null;
  for(let x=left;x<=right;x++){
   const sx=rotated?Math.round(c*x+s*y+anchorX):x+anchorX,sy=rotated?Math.round(-s*x+c*y+anchorY):y+anchorY;
   const color=x===right||sx<0||sy<0||sx>=raster.width||sy>=raster.height?null:raster.pixels[sy*raster.width+sx];
   if(color!==last){if(last)runs.push([start*2,y*2,(x-start)*2,2,last]);start=x;last=color}
  }
 }
 return runs;
}
function polishCached(key,build){let sprite=polishSpriteCache.get(key);if(!sprite){sprite=build();if(polishSpriteCache.size>=192)polishSpriteCache.delete(polishSpriteCache.keys().next().value);polishSpriteCache.set(key,sprite)}return sprite}
function polishDraw(runs,x,y){
 x=Math.round(x/2)*2;y=Math.round(y/2)*2;
 if(!runs.length)return;
 if(typeof document!=='undefined'&&document.createElement&&typeof ctx.drawImage==='function'){
  if(!runs.texture){
   let left=Infinity,top=Infinity,right=-Infinity,bottom=-Infinity;
   for(const r of runs){left=Math.min(left,r[0]);top=Math.min(top,r[1]);right=Math.max(right,r[0]+r[2]);bottom=Math.max(bottom,r[1]+r[3])}
   const texture=document.createElement('canvas');texture.width=(right-left)/2;texture.height=(bottom-top)/2;const dc=texture.getContext('2d');
   if(dc){for(const r of runs){dc.fillStyle=r[4];dc.fillRect((r[0]-left)/2,(r[1]-top)/2,r[2]/2,r[3]/2)}runs.texture=texture;runs.left=left;runs.top=top}
  }
  if(runs.texture){ctx.drawImage(runs.texture,x+runs.left,y+runs.top,runs.texture.width*2,runs.texture.height*2);return}
 }
 for(const r of runs)cityPixelRect(x+r[0],y+r[1],r[2],r[3],r[4]);
}
function polishDirection(device){
 const horizontal=device.launchX??device.vx??0,vertical=-(device.power??device.up??25);
 return Math.round(Math.atan2(horizontal,-vertical)*8/Math.PI);
}
function polishedSpringFrame(device){
 const age=runFrames-(device.firedAt??-1000);
 if(age<0||age>=24)return 0;
 return age<3?1:age<6?2:age<10?3:age<15?4:age<20?5:0;
}
function drawPolishedSpring(device){
 if(!polishVisible(device.x,device.y,64,90))return;
 const frame=polishedSpringFrame(device),angle=polishDirection(device);
 const runs=polishCached('spring/'+frame+'/'+angle,()=>{
  const offsets=[0,4,-9,-6,-3,1],cap=12+offsets[frame];
  const raster=polishRaster(29,31,({box,disk,line})=>{
   // Heavy planted foot remains mechanically separate from the moving cap.
   box(5,27,19,3,'#152238');box(3,26,23,2,'#81243c');box(5,25,19,2,'#e4413e');box(7,25,15,1,'#ff9a5c');box(8,28,13,1,'#aebac2');
   box(12,cap+5,5,21-cap,'#3d485b');
   for(let y=cap+7;y<25;y+=3){line(9,y,19,y+2,'#8694a1');line(8,y,18,y+1,'#e2e5d7');box(8,y,2,1,'#ffffff');box(17,y+1,3,1,'#687887')}
   disk(14,cap+3,13,4,'#152238');disk(14,cap+2,12,3,'#9a243e');disk(14,cap+1,11,3,'#e8413a');
   box(5,cap,19,1,'#ff8a53');box(4,cap+1,3,3,'#ff563f');box(22,cap+2,3,2,'#bb273e');
   box(11,cap-1,7,5,'#ffcc45');box(12,cap-1,5,1,'#fff6a4');box(12,cap+1,5,3,'#ffe476');box(13,cap+4,3,1,'#a15c31');
   box(8,cap-2,4,1,'#64d1ee');box(17,cap-2,4,1,'#64d1ee');box(6,cap,2,1,'#ffe0a1');
  });
  return polishCompile(raster,angle,14,30);
 });
 polishDraw(runs,device.x,device.y);
}
function drawBoostMonitor(monitor){
 if(!polishVisible(monitor.x,monitor.y,42,70))return;
 const broken=!!monitor.broken,phase=Math.floor(runFrames/8)%3;
 const runs=polishCached('monitor/'+(broken?'broken':phase),()=>polishCompile(polishRaster(27,31,({box,line})=>{
  box(8,28,11,2,'#131c30');box(9,26,9,3,'#84909e');box(4,29,19,2,'#142036');box(5,28,17,1,'#b2bcc3');box(7,27,13,1,'#e1e4de');
  if(broken){
   box(3,20,21,5,'#424d63');box(2,21,3,4,'#9ca8b0');box(21,20,3,5,'#9ca8b0');box(6,22,15,3,'#172034');line(6,23,12,17,'#6b778b');line(13,24,17,18,'#8994a0');box(20,25,3,1,'#c6424a');return;
  }
  box(3,1,21,2,'#dde4e1');box(1,3,25,21,'#39445a');box(2,2,23,23,'#9aa4ac');box(3,3,21,1,'#d5dfdf');box(3,4,2,19,'#c7cfd0');box(23,4,1,19,'#576779');box(4,23,19,2,'#778795');
  box(5,5,17,17,'#202437');box(6,6,15,15,'#bc8438');box(7,7,13,13,'#141e35');box(7,6,13,1,'#ffda78');box(6,7,1,13,'#efbc56');box(20,7,1,13,'#987043');box(7,20,13,1,'#e5b150');
  // CRT glass: restrained cyan scanlines behind the unmistakable lightning.
  for(let y=9;y<19;y+=3)box(8,y,11,1,'#233248');box(8,8,9,1,'#39485d');box(8,9,1,5,'#56606b');
  const dx=phase===1?1:0;line(15+dx,9,10+dx,14,'#8bb8cf',2);line(14+dx,13,10+dx,18,'#8bb8cf',2);box(12+dx,12,5,2,'#8bb8cf');
  line(15+dx,8,10+dx,13,'#edfaff',2);box(11+dx,12,6,2,'#edfaff');line(15+dx,13,10+dx,18,'#edfaff',2);box(14+dx,8,4,1,'#edfaff');
  box(3,24,2,1,'#e94e5b');box(22,24,2,1,'#e94e5b');box(9,24,3,1,'#dae3df');box(14,24,3,1,'#dae3df');
 }),0,13,30));
 polishDraw(runs,monitor.x,monitor.y);
}
function drawPoolBooster(device){
 if(!polishVisible(device.x,device.y,58,90))return;
 if(device.poolBooster&&device.power===0){
  const phase=Math.floor(runFrames/4)%4;
  const runs=polishCached('ground-pool/'+phase,()=>polishCompile(polishRaster(37,13,({box,line,disk})=>{
   box(1,9,35,4,'#18263a');box(2,8,33,2,'#a7c6d3');box(4,10,29,2,'#46586f');
   box(9,2,19,6,'#992849');box(10,2,17,1,'#ef6970');box(10,7,17,1,'#4e253e');
   for(let i=0;i<3;i++){const x=11+i*5;line(x,3,x+2,5,phase===i?'#d8ffff':'#70cbdc');line(x+2,5,x,7,phase===i?'#d8ffff':'#70cbdc')}
   for(const x of [5,31]){disk(x,6,4,4,'#172639');disk(x,6,3,3,'#d6e6e8');disk(x,6,1,1,'#7a8592');const d=phase%2?1:0;line(x-2,6-d,x+2,6+d,'#b5344e')}
   box(2,11,3,1,'#e8eff0');box(32,11,3,1,'#e8eff0');
  }),0,18,12));
  polishDraw(runs,device.x,device.y);return;
 }
 const phase=Math.floor(runFrames/4)%4,angle=polishDirection(device);
 const runs=polishCached('pool/'+phase+'/'+angle,()=>polishCompile(polishRaster(37,32,({box,line,disk})=>{
  box(3,26,31,5,'#16223a');box(1,24,35,4,'#46566d');box(3,25,31,1,'#a5bdc7');box(5,28,27,2,'#28394e');
  box(6,20,25,5,'#971f43');box(7,20,23,2,'#e84b58');box(7,22,23,2,'#b52f4e');box(8,24,21,1,'#f18b74');
  for(const x of [7,29]){
   disk(x,17,6,7,'#15253b');disk(x,17,5,6,'#e84b58');disk(x,17,4,5,'#d9e8eb');disk(x,17,2,3,'#697e92');
   const a=phase*Math.PI/2,dx=Math.round(Math.cos(a)*4),dy=Math.round(Math.sin(a)*4);line(x-dx,17-dy,x+dx,17+dy,'#96334c');line(x+dy,17-dx,x-dy,17+dx,'#96334c');box(x,17,1,1,'#f8f6d6');
  }
  box(12,7,13,14,'#192c43');box(11,7,1,14,'#a8ced7');box(25,7,1,14,'#66879c');box(13,8,11,11,'#426a80');
  for(let i=0;i<3;i++){
   const y=8+((i*4+phase)%12);line(14,y+2,18,y-1,'#d9e8eb');line(18,y-1,22,y+2,'#d9e8eb');
  }
  box(14,20,9,1,'#7ce1ee');box(3,25,3,2,'#d9e8eb');box(31,25,3,2,'#d9e8eb');
 }),angle,18,31));
 polishDraw(runs,device.x,device.y);
}
function drawPolishedVent(device){
 if(!polishVisible(device.x,device.y,50,100))return;
 const phase=Math.floor(runFrames/4)%4,hidden=!!device.hidden;
 const runs=polishCached('vent/'+phase+'/'+hidden,()=>polishCompile(polishRaster(35,48,({box,line})=>{
  box(1,40,33,7,'#16243a');box(2,40,31,1,'#b3c4cc');box(3,41,29,2,'#687d93');box(2,46,31,1,'#3c4a62');
  for(let x=5;x<31;x+=4){box(x,42,2,4,'#14263b');box(x,42,2,1,'#95aab8')}
  box(2,43,2,3,'#c4d4d1');box(31,43,2,3,'#c4d4d1');
  for(let i=0;i<4;i++){
   const y=34-i*9-phase*2;
   if(hidden){box(8+i*5,y,1,2,i%2?'#b9866f':'#d2a889')}
   else{line(10,y+4,17,y,'#669aaf');line(17,y,24,y+4,'#669aaf');line(12,y+3,17,y,'#b9e4df');line(17,y,22,y+3,'#b9e4df')}
  }
 }),0,17,47));
 polishDraw(runs,device.x,device.y);
}
function drawPixelDebris(debris){
 if(!debris.triggered||debris.age<debris.warn||debris.age>debris.warn+debris.fall+120)return;
 const t=Math.min(1,(debris.age-debris.warn)/Math.max(1,debris.fall)),y=debris.y-460+460*t*t;
 if(!polishVisible(debris.x,y,debris.w/2+20,64))return;
 const width=Math.max(8,Math.round(debris.w/2));
 const runs=polishCached('debris/'+width,()=>polishCompile(polishRaster(width,24,({box,line})=>{
  box(2,2,width-4,20,'#172139');box(4,0,width-8,22,'#403349');box(2,2,width-4,2,'#a68b85');box(4,4,width-8,2,'#77657b');box(3,6,width-6,14,'#4c415a');box(2,20,width-4,3,'#241f35');
  for(let x=6;x<width-6;x+=9){box(x,7,6,9,'#1a283b');box(x+1,7,4,2,'#bf9187');box(x+1,10,2,5,'#e5a37c');box(x+4,10,1,5,'#556b85');box(x,17,6,1,'#796574')}
  line(1,14,7,18,'#172139',2);line(width-8,5,width-2,11,'#172139',2);box(3,1,3,2,'#ddd0ac');box(width-7,3,4,1,'#cfb596');
  for(let x=7;x<width-4;x+=13){box(x,19,7,3,'#a84b48');box(x+2,20,4,2,'#ef8b46');box(x+3,21,2,2,'#ffcf70')}
 }),0,Math.floor(width/2),23));
 polishDraw(runs,debris.x,y);
}
function drawPixelEnemy(enemy){
 if(enemy.alive===false||!polishVisible(enemy.x,enemy.y,48,60))return;
 const drone=enemy.kind==='drone',phase=Math.floor(runFrames/7+(enemy.phase||0))%2;
 const runs=polishCached('enemy/'+(drone?'drone/':'crab/')+phase,()=>polishCompile(polishRaster(35,28,({box,line,disk})=>{
  if(drone){
   // Twin engines and rigid swept wings remain visible over the orange skyline.
   for(const side of [0,1]){
    const x=side?25:3;box(x,7,7,3,'#122139');box(x+1,5,5,8,'#a4b8c4');box(x+2,6,4,2,'#f4ebcf');box(x+1,12,5,2,'#506b81');
    box(x+2,14,3,phase?5:3,'#74def0');box(x+3,14,1,phase?3:5,'#e9ffff');
    line(side?24:10,9,side?21:13,15,'#c8d6d6',2);line(side?25:9,9,side?22:12,14,'#687b94',2);
   }
   disk(17,14,9,9,'#0b192e');disk(17,13,8,7,'#50738c');disk(17,12,6,5,'#82a3b2');box(12,8,10,2,'#cbd8d6');box(13,7,8,1,'#e9eee0');
   box(11,12,13,6,'#0f2439');box(12,13,11,3,'#8c303d');box(13,13,3,2,'#ff5c52');box(19,13,3,2,'#ff5c52');box(13,13,1,1,'#ffe7b0');box(19,13,1,1,'#ffe7b0');
   box(15,18,5,2,'#b8c9c6');box(16,19,3,3,'#40526e');box(17,22,1,2,'#c38183');
  }else{
   // Ground mech: hard outlined red shell, separate claws and articulated legs.
   for(const side of [0,1]){
    const x=side?26:3;line(side?24:10,13,x+2,8,'#c7d6d7',2);line(x+2,9,x+2,5,'#606f88',2);
    disk(x+2,5,4,4,'#12213a');disk(x+2,4,3,3,'#db4554');box(x+1,2,3,1,'#ffad81');box(x+1,4,2,3,'#742438');box(x+2,3,2,1,'#f7e4bc');
    for(let i=0;i<2;i++){const start=side?23:11,outer=side?28+i*3:6-i*3,yy=19+i*2+(phase===i?1:0);line(start,17+i*2,outer,yy,'#bec8c8',2);line(outer,yy,outer+(side?2:-2),24,'#586e87',2);box(outer+(side?0:-4),24,6,2,'#14223b');box(outer+(side?1:-3),24,4,1,'#a8bbc6')}
   }
   disk(17,14,11,9,'#0c1930');disk(17,13,10,8,'#922443');disk(17,11,9,6,'#d94760');disk(17,9,7,3,'#fa795c');box(12,8,10,1,'#ffd099');
   box(10,13,15,6,'#10253b');box(11,14,13,1,'#7495a3');box(12,14,4,3,'#ff5c52');box(19,14,4,3,'#ff5c52');box(12,14,2,1,'#ffe7b0');box(19,14,2,1,'#ffe7b0');
   box(15,18,5,3,'#d5c8bd');box(16,19,3,2,'#75899b');box(14,22,7,2,'#3c4f6c');
  }
 }),0,17,14));
 polishDraw(runs,enemy.x,enemy.y);
 if(enemy.bounceRoute){const y=enemy.y-36;cityPixelRect(enemy.x-8,y+4,16,2,'#162237');cityPixelLine(enemy.x-8,y+2,enemy.x,y-6,'#ffe0a1',2);cityPixelLine(enemy.x,y-6,enemy.x+8,y+2,'#ffe0a1',2)}
}
function drawPixelSpikes(hazard){
 if(!polishVisible(hazard.x+hazard.w/2,hazard.y,hazard.w/2+20,hazard.h+20))return;
 const bottom=hazard.y+hazard.h,top=hazard.y,width=Math.min(20,hazard.w);
 cityPixelRect(hazard.x,bottom-6,hazard.w,6,'#152136');cityPixelRect(hazard.x,bottom-6,hazard.w,2,'#aa435f');
 for(let x=hazard.x;x<hazard.x+hazard.w;x+=width){
  const w=Math.min(width,hazard.x+hazard.w-x),middle=x+w/2;
  for(let y=top;y<bottom-6;y+=2){const half=Math.min(w/2-1,(y-top+2)/(bottom-6-top)*w/2);cityPixelRect(middle-half,y,half*2,2,'#47627c');cityPixelRect(middle-half,y,Math.max(2,half),2,'#a7cedb');cityPixelRect(middle-half,y,2,2,'#eff5e7')}
  cityPixelRect(x+2,bottom-6,w-4,2,'#7894a2');
 }
}
function drawDebrisWarning(debris){
 if(!debris.triggered||debris.age>=debris.warn||!polishVisible(debris.x,debris.y,debris.w/2+42,160))return;
 const pulse=Math.floor(runFrames/6)%2,bright=pulse?'#ff9750':'#ffe18a',left=debris.x-debris.w/2;
 // Dark-backed impact stripes span the actual hazard, with outward corner marks.
 cityPixelRect(left-8,debris.y-8,debris.w+16,8,'#182038');cityPixelRect(left,debris.y-6,debris.w,4,bright);
 for(let x=left;x<left+debris.w;x+=12)cityPixelRect(x,debris.y-6,4,4,'#7b3847');
 for(const side of [-1,1]){const x=debris.x+side*(debris.w/2+12);cityPixelRect(x-2,debris.y-20,4,18,bright);cityPixelRect(x+(side<0?0:-10),debris.y-20,12,4,bright)}
 const y=Math.max(camY+44,Math.min(debris.y-112,camY+H/zoom-126));
 for(let yy=0;yy<40;yy+=2){const half=Math.floor((yy/2+3)/2)*2;cityPixelRect(debris.x-half-4,y+yy,half*2+8,2,'#132038');cityPixelRect(debris.x-half,y+yy,half*2,2,bright);if(yy>8&&yy<34&&half>4)cityPixelRect(debris.x-half+4,y+yy,half*2-8,2,'#2d2c3e')}
 cityPixelRect(debris.x-2,y+16,4,12,'#fff4c2');cityPixelRect(debris.x-2,y+30,4,4,'#fff4c2');
 for(let i=0;i<3;i++){const yy=y+48+i*14+(Math.floor(runFrames/2)%7)*2;cityPixelLine(debris.x-10,yy,debris.x,yy+8,bright,4);cityPixelLine(debris.x,yy+8,debris.x+10,yy,bright,4)}
}
const polishFont={
 A:['01110','10001','10001','11111','10001','10001','10001'],B:['11110','10001','10001','11110','10001','10001','11110'],C:['01111','10000','10000','10000','10000','10000','01111'],D:['11110','10001','10001','10001','10001','10001','11110'],E:['11111','10000','10000','11110','10000','10000','11111'],F:['11111','10000','10000','11110','10000','10000','10000'],G:['01111','10000','10000','10111','10001','10001','01111'],H:['10001','10001','10001','11111','10001','10001','10001'],I:['11111','00100','00100','00100','00100','00100','11111'],J:['00111','00010','00010','00010','10010','10010','01100'],K:['10001','10010','10100','11000','10100','10010','10001'],L:['10000','10000','10000','10000','10000','10000','11111'],M:['10001','11011','10101','10101','10001','10001','10001'],N:['10001','11001','10101','10011','10001','10001','10001'],O:['01110','10001','10001','10001','10001','10001','01110'],P:['11110','10001','10001','11110','10000','10000','10000'],Q:['01110','10001','10001','10001','10101','10010','01101'],R:['11110','10001','10001','11110','10100','10010','10001'],S:['01111','10000','10000','01110','00001','00001','11110'],T:['11111','00100','00100','00100','00100','00100','00100'],U:['10001','10001','10001','10001','10001','10001','01110'],V:['10001','10001','10001','10001','10001','01010','00100'],W:['10001','10001','10001','10101','10101','10101','01010'],X:['10001','10001','01010','00100','01010','10001','10001'],Y:['10001','10001','01010','00100','00100','00100','00100'],Z:['11111','00001','00010','00100','01000','10000','11111'],
 '0':['01110','10001','10011','10101','11001','10001','01110'],'1':['00100','01100','00100','00100','00100','00100','01110'],'2':['01110','10001','00001','00010','00100','01000','11111'],'3':['11110','00001','00001','01110','00001','00001','11110'],'4':['00010','00110','01010','10010','11111','00010','00010'],'5':['11111','10000','10000','11110','00001','00001','11110'],'6':['01110','10000','10000','11110','10001','10001','01110'],'7':['11111','00001','00010','00100','01000','01000','01000'],'8':['01110','10001','10001','01110','10001','10001','01110'],'9':['01110','10001','10001','01111','00001','00001','01110'],
 '-':['00000','00000','00000','11111','00000','00000','00000'],'/':['00001','00001','00010','00100','01000','10000','10000'],'!':['00100','00100','00100','00100','00100','00000','00100'],'?':['01110','10001','00001','00010','00100','00000','00100'],'>':['10000','01000','00100','00010','00100','01000','10000'],'<':['00001','00010','00100','01000','00100','00010','00001'],':':['00000','00100','00100','00000','00100','00100','00000']
};
function drawPixelSign(x,y,text,type){
 text=String(text).toUpperCase().slice(0,40);const width=Math.max(72,text.length*12+16);
 if(!polishVisible(x,y,width/2,70))return;
 const color=type==='express'?'#f4d287':type==='roll'?'#eca0c6':type==='recovery'?'#97b9da':'#9ed5df';
 cityPixelRect(x-4,y,8,38,'#18243a');cityPixelRect(x-2,y,2,38,'#72889b');
 cityPixelRect(x-width/2-2,y-28,width+4,30,'#102034');cityPixelRect(x-width/2,y-26,width,26,'#4c526a');cityPixelRect(x-width/2+2,y-24,width-4,22,'#19273e');
 cityPixelRect(x-width/2+2,y-26,width-4,2,color);cityPixelRect(x-width/2+4,y-22,2,2,'#cad6cf');cityPixelRect(x+width/2-6,y-22,2,2,'#cad6cf');
 const runs=polishCached('sign/'+type+'/'+text,()=>polishCompile(polishRaster(text.length*6,7,({box})=>{for(let i=0;i<text.length;i++){const glyph=polishFont[text[i]];if(!glyph)continue;for(let yy=0;yy<7;yy++)for(let xx=0;xx<5;xx++)if(glyph[yy][xx]==='1')box(i*6+xx,yy,1,1,color)}})));
 polishDraw(runs,x-text.length*6+2,y-20);
}
function updateCityInteriors(){
 for(const building of level.buildings||[]){
  if(!building.rooms?.length)continue;
  const gate=building.gateId&&(level.hazards||[]).find(h=>h.id===building.gateId),open=!building.gateId||!!gate?.broken;
  let inside=false;
  if(open)for(const room of building.rooms){const top=room.sloped?building.y+24:room.y-170,bottom=room.sloped?(room.bottom??room.y+12):room.y+12;if(p.x>=room.x1-8&&p.x<=room.x2+8&&p.y+20>=top&&p.y-36<=bottom){inside=true;break}}
  if(open&&building.duct){const duct=building.duct;if(Math.abs(p.x-duct.x)<44&&p.y+20>=Math.min(duct.y1,duct.y2)&&p.y-36<=Math.max(duct.y1,duct.y2))inside=true}
  const target=inside ? .24 : 1,current=building.interiorOpacity??1;
  building.interiorOpacity=current+(target-current)*.12;
  if(Math.abs(building.interiorOpacity-target)<.001)building.interiorOpacity=target;
 }
}
function drawCityDetails(){
 for(const s of level.surfaces||[])if(s.fallen||s.damaged)drawDamagedRoof(s);
 if(!level.buildings)return;
 for(const building of level.buildings){
  if(building.scenery||building.x+building.w<cam-40||building.x>cam+W/zoom+40)continue;
  const roof=building.roofId&&(level.surfaces||[]).find(s=>s.id===building.roofId),roofY=roof&&typeof yOn==='function'?yOn(roof,building.x):building.y;
  const y=roofY+38,seed=Math.abs(building.seed||0),left=building.x+22,right=building.x+building.w-22;
  if(y>camY+H/zoom+40||y+160<camY-40||right-left<70)continue;
  const alpha=ctx.globalAlpha;ctx.globalAlpha=alpha*(building.interiorOpacity??1);
  // Service architecture below the collision edge: no ornamental top occluders.
  const panelX=left+16+(seed%3)*12,panelW=Math.min(74,right-panelX-8);
  if(polishVisible(panelX,y,panelW,92)){
   cityPixelRect(panelX,y,panelW,44,'#152136');cityPixelRect(panelX+2,y+2,panelW-4,40,'#59647b');cityPixelRect(panelX+4,y+4,panelW-8,2,'#99a6ae');cityPixelRect(panelX+4,y+8,panelW-8,30,'#343f56');
   for(let yy=y+10;yy<y+36;yy+=6){cityPixelRect(panelX+8,yy,panelW-16,2,'#19283d');cityPixelRect(panelX+8,yy+2,panelW-16,2,'#748294')}
   cityPixelRect(panelX+6,y+40,4,4,'#bdd0c8');cityPixelRect(panelX+panelW-10,y+40,4,4,'#bdd0c8');
  }
  const pipeX=right-16;cityPixelRect(pipeX,y,10,118,'#162238');cityPixelRect(pipeX+2,y,4,118,'#708297');cityPixelRect(pipeX+2,y,2,118,'#a4b5bf');
  for(let yy=y+10;yy<y+116;yy+=32){cityPixelRect(pipeX-4,yy,18,6,'#26324a');cityPixelRect(pipeX-2,yy,14,2,'#879ca8')}
  if(building.burning||building.exposed){
   const x=Math.min(right-36,panelX+panelW+20),yy=y+54;cityPixelLine(x,yy,x+18,yy+26,'#121e33',4);cityPixelLine(x+18,yy+26,x+8,yy+48,'#121e33',4);cityPixelRect(x+2,yy+4,4,10,'#8d7188');
   cityPixelRect(x-8,yy+66,32,8,'#17233a');cityPixelRect(x-6,yy+66,12,2,'#866d7b');cityPixelRect(x+10,yy+70,12,2,'#63758a');
  }
  ctx.globalAlpha=alpha;
 }
}
function drawDamagedRoof(s){
 const slope=(s.y2-s.y1)/(s.x2-s.x1),floor=x=>s.y1+(x-s.x1)*slope;
 if(s.x2<cam-40||s.x1>cam+W/zoom+40||Math.min(s.y1,s.y2)>camY+H/zoom+40||Math.max(s.y1,s.y2)+190<camY-40)return;
 // Fractured window bays, buckled steel and masonry stay below the solid roof.
 const first=Math.max(0,Math.floor((cam-40-s.x1-30)/120));
 for(let i=first,x=s.x1+30+i*120;x<s.x2-60&&x<cam+W/zoom+40;i++,x+=120){
  const y=Math.ceil((floor(x)+38)/2)*2;
  cityPixelRect(x,y,56,46,'#101a2d');cityPixelRect(x+2,y+2,52,4,'#71889a');
  cityPixelRect(x+4,y+10,18,26,'#456e86');cityPixelRect(x+34,y+8,16,18,'#35506b');
  cityPixelLine(x+18,y+4,x+30,y+18,'#101a2d',4);cityPixelLine(x+30,y+18,x+22,y+32,'#101a2d',4);
  for(const [dx,dy]of [[20,34],[28,40],[42,30]]){cityPixelRect(x+dx,y+dy,6,4,'#82b7c3');cityPixelRect(x+dx+2,y+dy,2,2,'#c9e2df')}
  const braceY=y+52;
  cityPixelLine(x+4,braceY,x+24,braceY+24,'#121c30',10);cityPixelLine(x+4,braceY,x+24,braceY+24,'#6f6b7b',4);
  cityPixelLine(x+28,braceY+40,x+48,braceY+56,'#121c30',10);cityPixelLine(x+28,braceY+40,x+48,braceY+56,'#9a7887',4);
  cityPixelRect(x+20,braceY+24,8,6,'#b39b96');cityPixelRect(x+26,braceY+36,6,6,'#8f94a1');
  cityPixelLine(x+64,y+10,x+72,y+30,'#0d172a',4);cityPixelLine(x+72,y+30,x+62,y+46,'#0d172a',4);
  cityPixelRect(x+6,y+126,60,8,'#172238');cityPixelRect(x+10,y+120,14,8,'#767084');cityPixelRect(x+34,y+116,20,12,'#544e68');cityPixelRect(x+38,y+116,12,2,'#9b7f8f');
 }
}
