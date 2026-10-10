/* Cached native-pixel cels. No filtering, per-frame image reads, or camera cuts. */
const endingSprites=new Map(),endingLoadErrors=new Set();
const endingSheets=['sonic','shadow','eggman','sonic-polish','shadow-polish','eggman-polish'];
function prepareEndingArt(name,image){
 const source=document.createElement('canvas');source.width=image.width;source.height=image.height;
 const sc=source.getContext('2d',{willReadFrequently:true});sc.drawImage(image,0,0);
 const frames=[];
 for(const d of endingFrames[name]){
  const [l,t,r,b]=d.bounds,w=r-l,h=b-t,data=sc.getImageData(l,t,w,h),pixels=data.data;
  // A connected-component mask prevents neighboring extended limbs leaking
  // into a crop even when generated cel bounds overlap. Keep every hard pixel.
  const keep=new Uint8Array(w*h);
  if(d.islands){for(let i=0;i<keep.length;i++)keep[i]=pixels[i*4+3]>160?1:0;}
  else{
   const queue=new Int32Array(w*h),seed=(d.seed[1]-t)*w+d.seed[0]-l;let head=0,tail=1;queue[0]=seed;keep[seed]=1;
   while(head<tail){const i=queue[head++],x=i%w;for(const j of [x?i-1:-1,x<w-1?i+1:-1,i-w,i+w])if(j>=0&&j<keep.length&&!keep[j]&&pixels[j*4+3]>160){keep[j]=1;queue[tail++]=j;}}
  }
  for(let i=0;i<keep.length;i++)pixels[i*4+3]=keep[i]?255:0;
  const crop=document.createElement('canvas');crop.width=w;crop.height=h;crop.getContext('2d').putImageData(data,0,0);
  // Retain the complete masked source crop. Scale only in the final draw.
  const width=Math.ceil(w*d.scale),height=Math.ceil(h*d.scale);
  frames.push({image:crop,width,height,x:Math.round((d.anchor[0]-l)*d.scale),y:height,gem:d.gem?{x:Math.round((d.gem[0]-d.anchor[0])*d.scale),y:Math.round((d.gem[1]-b)*d.scale)}:null});
 }
 endingSprites.set(name,frames);endingLoadErrors.delete(name);
 if(name==='shadow')prepareEndingEmerald(source);
}
function prepareEndingEmerald(source){
 // Extract the existing yellow Emerald at native resolution; the source PNG
 // stays unchanged. This silhouette excludes the supporting glove and ring.
 const crop=document.createElement('canvas');crop.width=50;crop.height=40;
 const c=crop.getContext('2d');c.drawImage(source,738,622,50,40,0,0,50,40);
 const data=c.getImageData(0,0,50,40),poly=[[12,7],[15,5],[33,5],[44,16],[44,18],[41,22],[36,28],[32,32],[23,35],[21,35],[12,27],[11,26],[4,18],[4,16],[6,13]];
 for(let y=0;y<40;y++)for(let x=0;x<50;x++){
  let inside=false;for(let i=0,j=poly.length-1;i<poly.length;j=i++){
   const [xi,yi]=poly[i],[xj,yj]=poly[j];if((yi>y)!==(yj>y)&&x<(xj-xi)*(y-yi)/(yj-yi)+xi)inside=!inside;
  }
  data.data[(y*50+x)*4+3]=inside&&data.data[(y*50+x)*4+3]>160?255:0;
 }
 c.putImageData(data,0,0);
 endingSprites.set('emerald',[{image:crop,width:14,height:12,x:7,y:6}]);
}
function endingArtReady(){return endingSheets.every(name=>endingSprites.has(name));}
function retryEndingArt(){for(const name of endingLoadErrors){endingLoadErrors.delete(name);loadEndingArt(name,true);}}
function loadEndingArt(name,retry=false){const im=new Image();im.onload=()=>prepareEndingArt(name,im);im.onerror=()=>endingLoadErrors.add(name);im.src='assets/ending-'+name+'.png'+(retry?'?retry='+Date.now():'');}
for(const name of endingSheets)loadEndingArt(name);
function endingGemAnchor(actor,frame=actor.frame,sheet=actor.sheet){
 const cel=endingSprites.get(sheet)?.[frame];if(!cel?.gem)return null;
 const tr=ctx.getTransform(),worldScale=Math.hypot(tr.a,tr.b),ratio=Math.max(1,Math.round(worldScale))/worldScale;
 return {x:actor.x+cel.gem.x*ratio*(actor.flip?-1:1),y:actor.y+cel.gem.y*ratio};
}
function endingActor(actor){
 if(!actor.visible||actor.alpha===0)return null;
 if(actor.sheet==='recovered'&&!art.recoveredSpeedster)actor={...actor,sheet:'sonic',frame:0};
 if(actor.sheet==='recovered'){
  ctx.save();ctx.translate(actor.x,actor.y-20);ctx.scale(actor.flip?-1:1,1);drawRecoveredSonicFrame({sheet:'recoveredSpeedster',frame:actor.frame,ball:false});ctx.restore();return null;
 }
 const cel=endingSprites.get(actor.sheet)?.[actor.frame];if(!cel)return null;
 const tr=ctx.getTransform(),worldScale=Math.hypot(tr.a,tr.b),pixelScale=Math.max(1,Math.round(worldScale)),ratio=pixelScale/worldScale;
 const px=Math.round(tr.a*actor.x+tr.c*actor.y+tr.e),py=Math.round(tr.b*actor.x+tr.d*actor.y+tr.f);
 ctx.save();ctx.setTransform(tr.a*ratio,tr.b*ratio,tr.c*ratio,tr.d*ratio,px,py);ctx.imageSmoothingEnabled=false;ctx.globalAlpha=actor.alpha??1;
 if(actor.flip)ctx.scale(-1,1);
 if(actor.angle!==undefined){
  // Quantize the same angle, but rotate source pixels directly on the game canvas.
  const turn=Math.round(actor.angle/(Math.PI/32));ctx.rotate(turn*Math.PI/32);
  ctx.drawImage(cel.image,actor.nose?0:-cel.width/2,-cel.height/2,cel.width,cel.height);
 }else ctx.drawImage(cel.image,-cel.x,-cel.y,cel.width,cel.height);
 ctx.restore();return endingGemAnchor(actor);
}
function endingStar(x,y,size,color){cityPixelRect(x-size,y-1,size*2+2,2,color);cityPixelRect(x-1,y-size,2,size*2+2,color);cityPixelRect(x-3,y-3,6,6,color);}
function endingBurst(x,y,age,life=54){
 const t=Math.max(0,Math.min(1,age/life));
 for(let i=0;i<10;i++){const a=i*2.399,dist=t*(40+i*7),xx=x+Math.cos(a)*dist,yy=y+Math.sin(a)*dist+t*t*55;
  const size=Math.max(2,(1-t)*(12+i%3*6));cityPixelOval(xx,yy,size,size,'#a92849');cityPixelOval(xx,yy,size*.75,size*.75,'#ff6f32');cityPixelOval(xx,yy,size*.4,size*.4,'#ffeeb0');
 }
 for(let i=0;i<9;i++){const a=i*2.4,dist=t*(80+i*12);cityPixelRect(x+Math.cos(a)*dist,y+Math.sin(a)*dist+t*t*120,6,4,i%2?'#8297b6':'#e2463b');}
}
function endingAura(x,y,frame,power=1){
 const radius=32+Math.sin(frame*.22)*4;
 for(let i=0;i<22;i++){
  const a=i*Math.PI*2/22+frame*.11,xx=x+Math.cos(a)*radius*power,yy=y-40+Math.sin(a)*56*power;
  cityPixelRect(xx,yy,2+(i%3)*2,4,i%3?'#ffe259':'#fff5c2');
  if(i%4===0)cityPixelLine(xx,yy,xx+Math.sin(a)*7,yy-12,'#fff9df',2);
 }
}
function drawEndingScene(s){
 const q=window.endingPose(s),f=q.frame,ground=s.arena.y;
 if(q.sonic.visible)cityPixelOval(q.sonic.x,ground+1,17,3,'#060c2466');
 if(q.shadow.visible)cityPixelOval(q.shadow.x,ground+1,18,3,'#060c2466');
 if(q.effects.teleport)endingAura(q.sonic.x,q.sonic.y,f,q.beat==='swing'?.6+.4*(q.age-52)/14:1);
 endingActor(q.pod);
 if(q.pod.visible){for(let i=0;i<2;i++){const x=q.pod.x-24+i*48,fire=8+Math.floor(f/3+i)%3*4;cityPixelOval(x,q.pod.y+fire/2,5,fire,'#227add');cityPixelRect(x-2,q.pod.y,4,fire,'#a5f9ff');}}
 if(q.rocket){
  const r=q.rocket,tr=ctx.getTransform(),scale=Math.hypot(tr.a,tr.b),ratio=Math.max(1,Math.round(scale))/scale;
  const tail=(endingSprites.get(r.sheet)?.[r.frame]?.width??63)*ratio*(r.nose?1:.5),dx=-Math.cos(r.angle),dy=-Math.sin(r.angle);
  for(let i=1;i<7;i++){const distance=tail+i*11,x=r.x-dx*distance,y=r.y-dy*distance;cityPixelOval(x,y,4+i*.6,3+i*.5,i%2?'#67708690':'#d9d4d580');}
  endingActor({...r,visible:true});
 }
 if(q.eggman.visible){const e=q.eggman;const fire=16+(Math.floor(f/3)%3)*5;cityPixelOval(e.x+25,e.y-24+fire/2,7,fire,'#fa6932');cityPixelOval(e.x+25,e.y-26,4,fire*.6,'#fff0a2');for(let i=0;i<5;i++)cityPixelOval(e.x+25-i*5,e.y+10+i*15,5+i*2,5+i*2,'#7b819b80');endingActor(e);}
 if(q.effects.explosion)endingBurst(q.blast.x,q.blast.y,q.age);
 endingActor(q.sonic);
 let gem=endingActor(q.shadow);
 if(q.emerald.overlay){
  if(q.emerald.phase==='airborne'){
   const from=endingGemAnchor(q.shadow,14,'shadow-polish'),to=endingGemAnchor(q.shadow,16,'shadow-polish'),t=q.emerald.progress;
   if(from&&to)gem={x:from.x+(to.x-from.x)*t,y:from.y+(to.y-from.y)*t-4*44*t*(1-t)};
  }
  if(gem)endingActor({sheet:'emerald',frame:0,visible:true,x:gem.x,y:gem.y});
 }
 if(q.beat==='swing'&&q.age===39&&gem)endingStar(gem.x,gem.y,5,'#fffbd4');
 if(q.effects.arrival){endingAura(q.shadow.x,q.shadow.y,f,1-q.age/18);endingStar(q.shadow.x,q.shadow.y-35,35-q.age*2,'#fff3c2');}
 if(q.effects.kick)endingStar(q.contact.x,q.contact.y,19-(q.age-18)*2,'#fff9dd');
 if(gem&&q.emerald.visible){if(f%28<7)endingStar(gem.x+4,gem.y-4,3,'#fffbd4');if(q.effects.teleport)for(let i=0;i<3;i++){const y=q.sonic.y-25-i*17;cityPixelLine(gem.x,gem.y,(gem.x+q.sonic.x)/2,gem.y-8+i*5,'#ffdc6b80',2);cityPixelLine((gem.x+q.sonic.x)/2,gem.y-8+i*5,q.sonic.x,y,'#fff0a180',2);}}
 if(q.effects.warp){const t=q.age/24;endingStar(q.sonic.x,q.sonic.y-35,Math.max(2,48*(1-t)),'#fffbd6');for(let i=0;i<8;i++){const a=i*Math.PI/4;endingStar(q.sonic.x+Math.cos(a)*t*65,q.sonic.y-35+Math.sin(a)*t*65,Math.max(1,4-t*4),'#ffd65c');}}
 if(q.effects.dust)for(let i=0;i<4;i++)cityPixelOval(q.sonic.x-20-i*12,ground-2-i%2*3,5+i,3,'#b7c2d47a');
 if(q.effects.sigh){const t=(q.age-30)/35;for(let i=0;i<3;i++)cityPixelRect(q.shadow.x-25-t*20-i*5,q.shadow.y-43+t*8+i*2,4,2,'#dceaf399');}
}
