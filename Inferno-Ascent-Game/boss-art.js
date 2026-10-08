/* Articulated pixel sprites. Source is retained; stamps use a fixed 2-world-unit grid. */
const scorpionParts=new Map(),scorpionStamps=new Map();
const scorpionBounds={body:[16,125,430,503,132],head:[455,88,811,460,84],jaw:[800,177,1184,485,64],claw:[1198,54,1534,506,58],tail:[65,520,327,991,46],stinger:[369,573,779,958,65],cannon:[796,562,1169,966,65],eyes:[1176,674,1535,991,74]};
function prepareScorpionArt(image){
 for(const [name,[x,y,r,b,width]]of Object.entries(scorpionBounds)){
  const c=document.createElement('canvas');c.width=width;c.height=Math.round((b-y)*width/(r-x));const dc=c.getContext('2d');dc.imageSmoothingEnabled=false;dc.drawImage(image,x,y,r-x,b-y,0,0,c.width,c.height);scorpionParts.set(name,c);
 }
}
function scorpionStamp(name,angle=0,mirror=false){
 const part=scorpionParts.get(name);if(!part)return null;
 const turn=Math.round(angle/(Math.PI/16)),key=name+':'+turn+':'+mirror;if(scorpionStamps.has(key))return scorpionStamps.get(key);
 const c=document.createElement('canvas'),size=Math.ceil(Math.hypot(part.width,part.height))+4;c.width=size;c.height=size;
 const dc=c.getContext('2d');dc.imageSmoothingEnabled=false;dc.translate(Math.floor(size/2),Math.floor(size/2));dc.rotate(turn*Math.PI/16);if(mirror)dc.scale(-1,1);dc.drawImage(part,-Math.floor(part.width/2),-Math.floor(part.height/2));scorpionStamps.set(key,c);return c;
}
function scorpionPart(name,x,y,angle=0,mirror=false){const stamp=scorpionStamp(name,angle,mirror);if(!stamp)return;ctx.drawImage(stamp,Math.round(x/2)*2-stamp.width,Math.round(y/2)*2-stamp.height,stamp.width*2,stamp.height*2);}
function drawScorpionLink(a,z,width=20){cityPixelLine(a.x,a.y,z.x,z.y,'#07101d',width+8);cityPixelLine(a.x,a.y,z.x,z.y,'#354254',width);cityPixelLine(a.x-4,a.y-3,z.x-4,z.y-3,'#72869a',4);cityPixelLine(a.x+7,a.y,z.x+7,z.y,'#c91d2b',4);}
function renderEggScorpion(b){
 const g=window.scorpionGeometry(b),s=b.state,roof=b.y;
 ctx.save();ctx.beginPath();ctx.rect(b.arena.x,roof-560,b.arena.w,560);ctx.clip();
 if(s==='destroyed'||s==='defeated'){
  const t=Math.min(1,b.age/100);for(let i=0;i<12;i++){const a=i*2.4,x=b.x+Math.cos(a)*t*(110+i*12),y=roof-120+Math.sin(a)*t*140+t*t*160;cityPixelRect(x,y,12,8,i%2?'#d92a32':'#718295');}
  if(s==='destroyed'&&b.age<110){ctx.globalAlpha=1-t;scorpionPart('body',g.body.x,g.body.y);ctx.globalAlpha=1;for(let i=0;i<5;i++){const x=b.x-160+i*70,y=roof-60-Math.sin(b.age*.11+i)*90;cityPixelOval(x,y,24+(b.age%12),24,'#fd492a');cityPixelOval(x,y,14,14,'#ffe98c');}}
  ctx.restore();return;
 }
 // Steel tail follows the attack's collision tip, not an unrelated animation.
 const base={x:g.body.x+65,y:g.body.y-20},control={x:b.x+180,y:b.state==='entrance'?Math.max(g.tip.y,roof-370):roof-370};let last=base;
 for(let i=1;i<=9;i++){const t=i/9,z={x:(1-t)*(1-t)*base.x+2*(1-t)*t*control.x+t*t*g.tip.x,y:(1-t)*(1-t)*base.y+2*(1-t)*t*control.y+t*t*g.tip.y};drawScorpionLink(last,z,26-i);cityPixelOval(z.x,z.y,10,10,'#07101d');cityPixelOval(z.x,z.y,6,6,'#dd2631');last=z;}
 scorpionPart(b.laserMode?'cannon':'stinger',g.tip.x,g.tip.y,s==='tail-strike'?-.5:0);
 // Legs and torso are behind the head; arms stay visibly anchored through lunges.
 scorpionPart('body',g.body.x,g.body.y+Math.sin(b.age*.045)*2);
 for(let i=0;i<2;i++){const c=g.claws[i],shoulder={x:g.body.x+(i?80:-80),y:g.body.y-20};drawScorpionLink(shoulder,{x:c.x,y:c.y-80},24);scorpionPart('claw',c.x,c.y-30,0,i===1);
  if(b.anchored){for(let j=0;j<3;j++)cityPixelLine(c.x,c.y+30,c.x+(j-1)*22,roof,'#0c1424',4);cityPixelRect(c.x-15,roof-4,30,4,'#f19b79');}}
 const h=g.head,neck={x:g.body.x-70,y:g.body.y-20};drawScorpionLink({x:g.body.x-30,y:g.body.y-10},neck,36);drawScorpionLink(neck,{x:h.x+20,y:h.y+35},30);
 const bite=['bite-windup','bite-lunge','bite-hold'].includes(s),jawAngle=bite?(s==='bite-windup'?Math.min(1,b.age/45)*.65:.65):s==='bite-open'?.15:0;
 scorpionPart('jaw',h.x-75,h.y+43,-jawAngle);scorpionPart('jaw',h.x+75,h.y+43,jawAngle,true);
 scorpionPart('head',h.x,h.y);
 for(let i=0;i<2;i++)if(b.shattered[i]){const e=g.eyes[i];cityPixelOval(e.x,e.y,27,29,'#09101b');cityPixelLine(e.x-13,e.y-12,e.x+12,e.y+10,'#586a7b',4);cityPixelRect(e.x-3,e.y-5,6,8,'#ff4b3a');}
 if(s==='bite-open'){const pulse=Math.floor(b.age/10)%2;for(const [i,e]of g.eyes.entries()){if(b.hits<2&&b.shattered[i])continue;cityPixelRect(e.x-24,e.y-30,12,2,pulse?'#fff5bb':'#ffd149');cityPixelRect(e.x+12,e.y+28,12,2,'#ffd149');}}
 if(s==='hit'&&b.age%6<3){ctx.globalAlpha=.45;cityPixelOval(h.x,h.y-15,72,65,'#eafaff');ctx.globalAlpha=1;}
 if(['tail-windup','tail-strike'].includes(s)){const x=b.target.x,pulse=Math.floor(b.age/6)%2;cityPixelRect(x-38,roof-4,76,4,pulse?'#ffe088':'#ff4037');for(let i=-1;i<=1;i++)cityPixelRect(x+i*22-4,roof-14,8,6,'#ff6650');if(s==='tail-windup')cityPixelLine(x,roof-30,x,roof-80,'#ff4e4960',4);}
 if(s==='laser-windup'){const z=b.target;cityPixelLine(g.tip.x,g.tip.y,z.x,z.y,'#ff3f5860',2);cityPixelOval(g.tip.x-12,g.tip.y-10,6+b.age/14,6+b.age/14,'#ffe799');}
 if(s==='laser-fire'&&b.beam){cityPixelLine(b.beam.a.x,b.beam.a.y,b.beam.z.x,b.beam.z.y,'#ad1f58',22);cityPixelLine(b.beam.a.x,b.beam.a.y,b.beam.z.x,b.beam.z.y,'#ff5155',12);cityPixelLine(b.beam.a.x,b.beam.a.y,b.beam.z.x,b.beam.z.y,'#fff4c2',4);}
 ctx.restore();
}
