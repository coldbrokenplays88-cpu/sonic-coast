/* Crisp, low-resolution HUD art. No game state or input physics live here. */
(function () {
 'use strict';
 const W=320,H=84;
 const shape=[[20,5],[263,15],[280,17],[295,20],[309,26],[294,30],[287,34],[296,43],[306,55],[311,63],[292,57],[283,57],[294,78],[277,69],[260,64],[251,65],[242,64],[231,59],[226,55],[224,49],[220,46],[219,41],[3,33]];
 const mask=new Uint8Array(W*H),depth=new Uint8Array(W*H),cache=new WeakMap();
 const glyphs={
  '0':['111','101','101','101','111'],'1':['010','110','010','010','111'],'2':['111','001','111','100','111'],
  '3':['111','001','111','001','111'],'4':['101','101','111','001','001'],'5':['111','100','111','001','111'],
  '6':['111','100','111','101','111'],'7':['111','001','010','010','010'],'8':['111','101','111','101','111'],
  '9':['111','101','111','001','111'],':':['0','1','0','1','0'],'X':['101','101','010','101','101'],
  'S':['111','100','111','001','111'],'P':['110','101','110','100','100'],'D':['110','101','101','101','110'],
  'B':['110','101','110','101','110'],'O':['111','101','101','101','111'],'T':['111','010','010','010','010'],
  '/':['001','001','010','100','100'],' ':['0','0','0','0','0']
 };
 function inside(x,y){let on=false;for(let i=0,j=shape.length-1;i<shape.length;j=i++){const a=shape[i],b=shape[j];if((a[1]>y)!==(b[1]>y)&&x<(b[0]-a[0])*(y-a[1])/(b[1]-a[1])+a[0])on=!on;}return on;}
 for(let y=0;y<H;y++)for(let x=0;x<W;x++)mask[y*W+x]=inside(x+.5,y+.5)?1:0;
 function at(x,y){return x>=0&&x<W&&y>=0&&y<H&&mask[y*W+x];}
 for(let y=0;y<H;y++)for(let x=0;x<W;x++)if(at(x,y)){depth[y*W+x]=!at(x-1,y)||!at(x+1,y)||!at(x,y-1)||!at(x,y+1)?1:!at(x-2,y)||!at(x+2,y)||!at(x,y-2)||!at(x,y+2)?2:3;}
 function line(pixels,a,b,color,thickness,limit){
  let x=a[0],y=a[1];const dx=Math.abs(b[0]-x),sx=x<b[0]?1:-1,dy=-Math.abs(b[1]-y),sy=y<b[1]?1:-1;let e=dx+dy;
  for(;;){for(let iy=y-thickness;iy<=y+thickness;iy++)for(let ix=x-thickness;ix<=x+thickness;ix++)if(ix>=0&&ix<W&&iy>=0&&iy<H&&ix<=limit&&depth[iy*W+ix]>2)pixels[iy*W+ix]=color;if(x===b[0]&&y===b[1])break;const e2=e*2;if(e2>=dy){e+=dy;x+=sx;}if(e2<=dx){e+=dx;y+=sy;}}
 }
 function raster(ctx,pixels){for(let y=0;y<H;y++)for(let x=0;x<W;){const color=pixels[y*W+x];if(!color){x++;continue;}let end=x+1;while(end<W&&pixels[y*W+end]===color)end++;ctx.fillStyle=color;ctx.fillRect(x,y,end-x,1);x=end;}}
 function drawPixelBoostBar(canvas,fraction,frame=0){
  if(!canvas||!canvas.getContext)return;
  const value=Math.max(0,Math.min(1,Number.isFinite(fraction)?fraction:0));
  const filled=Math.round(value*W),phase=Math.floor((Number.isFinite(frame)?frame:0)/6)%12,key=filled+':'+(filled?phase:0);
  if(cache.get(canvas)===key)return;
  if(canvas.width!==W)canvas.width=W;if(canvas.height!==H)canvas.height=H;
  const ctx=canvas.getContext('2d');ctx.imageSmoothingEnabled=false;ctx.clearRect(0,0,W,H);
  const pixels=new Array(W*H),limit=filled?Math.max(4,filled-1):-1;
  for(let y=0;y<H;y++)for(let x=0;x<W;x++)if(mask[y*W+x]){
   const d=depth[y*W+x];pixels[y*W+x]=d===1?'#afcce8':d===2?'#364d87':x<=limit?(y<23?'#28226e':y<43?'#211c61':'#19164d'):'#0c1530';
   if(d>2&&((x+y*3)%79<11)&&y>12&&y<39)pixels[y*W+x]=x<=limit?'#121443':'#16233f';
  }
  // The streak's lower edge carries into the head, as in the supplied drawing.
  line(pixels,[8,32],[265,43],'#47568d',0,W);
  if(filled){
   const wiggle=[0,1,2,1,0,-1,-2,-1,0,1,0,-1][phase];
   const paths=[[[17,23],[90,17+wiggle],[160,17],[145,30-wiggle],[217,23],[280,22+wiggle]],[[265,30],[278,26+wiggle],[287,27],[302,25]],[[253,44],[266,52+wiggle],[277,50],[305,60]],[[264,54],[269,62],[278,62+wiggle],[289,73]]];
   for(const path of paths){for(let i=1;i<path.length;i++)line(pixels,path[i-1],path[i],'#076fab',2,limit);for(let i=1;i<path.length;i++)line(pixels,path[i-1],path[i],'#20caff',1,limit);for(let i=1;i<path.length;i++)line(pixels,path[i-1],path[i],'#8fffff',0,limit);}
   if(phase%3===0){line(pixels,[102,22],[109,26+wiggle],'#8fffff',0,limit);line(pixels,[198,19],[204,15],'#20caff',0,limit);}
  }
  raster(ctx,pixels);cache.set(canvas,key);
  canvas.setAttribute('aria-valuenow',String(Math.round(value*100)));
  canvas.setAttribute('aria-valuetext',Math.round(value*100)+' percent boost remaining');
 }
 function text(ctx,value,x,y,scale=2,color='#f4f6ff'){
  for(const character of String(value)){const rows=glyphs[character]||glyphs[' '];for(let row=0;row<rows.length;row++)for(let col=0;col<rows[row].length;col++)if(rows[row][col]==='1'){ctx.fillStyle='#080c2c';ctx.fillRect(x+col*scale+1,y+row*scale+1,scale,scale);ctx.fillStyle=color;ctx.fillRect(x+col*scale,y+row*scale,scale,scale);}x+=(rows[0].length+1)*scale;}
 }
 function bitmap(ctx,rows,x,y,palette){for(let iy=0;iy<rows.length;iy++)for(let ix=0;ix<rows[iy].length;ix++){const color=palette[rows[iy][ix]];if(color){ctx.fillStyle=color;ctx.fillRect(x+ix,y+iy,1,1);}}}
 const ring=['.....333333.....','...3344444433...','..344222222443..','.34221....12243.','.3421......1243.','3421........1243','3421........1243','3421........1243','3421........1243','3421........1243','3421........1243','.3421......1243.','.34221....12243.','..344222222443..','...3344444433...','.....333333.....'];
 const stats=new Map(),state={rings:0,lives:3,time:0,score:0,boost:0,maxBoost:90,speed:0,mode:'ready',frame:0};
 function element(id){return document.getElementById(id);}
 function stat(id,value,paint){const canvas=element(id);if(!canvas||stats.get(id)===value)return;const ctx=canvas.getContext('2d');ctx.imageSmoothingEnabled=false;ctx.clearRect(0,0,canvas.width,canvas.height);paint(ctx);stats.set(id,value);}
 function updatePixelHud(values={}){
  Object.assign(state,values);
  const r=String(Math.max(0,Math.floor(state.rings))).padStart(3,'0'),l=String(Math.max(0,Math.floor(state.lives))).padStart(2,'0'),seconds=Math.max(0,Math.floor(state.time)),t=Math.floor(seconds/60)+':'+String(seconds%60).padStart(2,'0');
  for(const [id,value]of [['rings',r],['lives',l],['time',t],['score',String(Math.max(0,Math.floor(state.score))).padStart(6,'0')],['speed',String(Math.max(0,Math.round(state.speed)))]]){const node=element(id);if(node&&node.textContent!==value)node.textContent=value;}
  const score=element('score');if(score)score.hidden=state.mode!=='win';
  const pause=element('pause');if(pause){pause.setAttribute('data-paused',String(state.mode==='paused'));pause.setAttribute('aria-label',state.mode==='paused'?'Resume game':'Pause game');}
  stat('ring-stat',r,ctx=>{bitmap(ctx,ring,0,2,{'1':'#88541c','2':'#e69824','3':'#fff3a1','4':'#ffcf35'});text(ctx,r,24,6,2);});
  stat('timer-stat',t,ctx=>{const width=[...t].reduce((n,c)=>n+((glyphs[c]||glyphs[' '])[0].length+1)*2,0)-2;text(ctx,t,Math.max(0,Math.floor((72-width)/2)),3,2);});
  // Crop the standing pose's actual head from the recovered October 7 atlas.
  // Include image readiness in the key so unchanged lives repaint after loading.
  stat('life-stat',l+(state.lifeImage?'/sprite':'/loading'),ctx=>{if(state.lifeImage)ctx.drawImage(state.lifeImage,20,362,131,87,0,1,27,18);text(ctx,'X',32,6,1,'#b3cced');text(ctx,l,40,6,2);});
  stat('speed-stat',String(Math.round(state.speed)),ctx=>text(ctx,'SPD '+String(Math.max(0,Math.round(state.speed))),0,1,1,'#98eaff'));
  drawPixelBoostBar(element('pixel-boost'),state.maxBoost>0?state.boost/state.maxBoost:0,state.frame);
 }
 function shell(){return element('game-shell');}
 function nativeFullscreen(){return document.fullscreenElement||document.webkitFullscreenElement;}
 function syncFullscreen(){const box=shell(),button=element('fullscreen');if(!box||!button)return;const active=Boolean(nativeFullscreen()||box.classList.contains('viewport-fullscreen'));button.setAttribute('aria-pressed',String(active));button.setAttribute('aria-label',active?'Exit fullscreen':'Enter fullscreen');button.textContent=active?'EXIT FULLSCREEN':'FULLSCREEN';}
 async function toggleGameFullscreen(){
  const box=shell();if(!box)return;
  if(nativeFullscreen()){const exit=document.exitFullscreen||document.webkitExitFullscreen;if(exit)await exit.call(document);}
  else if(box.classList.contains('viewport-fullscreen')){box.classList.toggle('viewport-fullscreen',false);}
  else{const request=box.requestFullscreen||box.webkitRequestFullscreen;if(request){try{await request.call(box);}catch(_){box.classList.toggle('viewport-fullscreen',true);}}else box.classList.toggle('viewport-fullscreen',true);}
  syncFullscreen();const game=element('game');if(game)game.focus({preventScroll:true});
 }
 const fullscreen=element('fullscreen');if(fullscreen)fullscreen.addEventListener('click',()=>toggleGameFullscreen().catch(()=>syncFullscreen()));
 document.addEventListener('fullscreenchange',syncFullscreen);document.addEventListener('webkitfullscreenchange',syncFullscreen);
 window.addEventListener('keydown',event=>{if(event.code==='KeyF'&&!event.repeat&&!/INPUT|TEXTAREA|SELECT/.test(event.target?.tagName||'')){event.preventDefault();toggleGameFullscreen().catch(()=>syncFullscreen());}else if(event.code==='Escape'&&shell()?.classList.contains('viewport-fullscreen')){shell().classList.toggle('viewport-fullscreen',false);syncFullscreen();}},true);
 window.updatePixelHud=updatePixelHud;window.drawPixelBoostBar=drawPixelBoostBar;window.toggleGameFullscreen=toggleGameFullscreen;
 // Classic-script globals are deliberately available to game.js.
 if(typeof globalThis!=='undefined'){globalThis.updatePixelHud=updatePixelHud;globalThis.drawPixelBoostBar=drawPixelBoostBar;globalThis.toggleGameFullscreen=toggleGameFullscreen;}
})();
