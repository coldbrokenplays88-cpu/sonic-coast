'use strict';
function addMiddleSection(l){
 if(l.middleSection)return l;
 const link=l.surfaces.find(s=>s.id==='secret-exit-uphill-link'),tower=l.surfaces.find(s=>s.id==='neon-0');
 if(!link||!tower)throw Error('Neon Switchback approach not found');
 const start=link.x1,base=link.y1,length=7600;
 const downstreamDecks=l.surfaces.filter(s=>s.x1>=start||s.id.startsWith('neon-')).map(s=>({...s}));
 const downstreamIds=new Set(downstreamDecks.map(s=>s.id));
 const belongs=o=>downstreamIds.has(o.id)||downstreamIds.has(o.surfaceId)||downstreamIds.has(o.roofId)||o.id==='neon-tower'||downstreamDecks.some(s=>o.x>=s.x1&&o.x<=s.x2&&Math.abs((o.y??o.baseY)-s.y1)<100);
 const shift=o=>{if(Array.isArray(o)){o.forEach(shift);return}if(!o||typeof o!=='object')return;for(const k of ['x','x1','x2','base','entryX','exitX','trigger'])if(typeof o[k]==='number')o[k]+=length;for(const [k,v]of Object.entries(o))if(!['motion','facade'].includes(k)&&v&&typeof v==='object')shift(v)};
 for(const key of ['surfaces','hazards','enemies','pads','springs','rings','signs','checkpoints','sectors','loops','debris','events','buildings','deathZones'])for(const o of l[key]||[]){const x=o.x1??o.x??o.entryX;if(x>=start||belongs(o))shift(o)}
 l.end+=length;l.arena.x+=length;
 const deck=(id,a,b,y,z=y,extra={})=>{const s={id:'mid-'+id,x1:start+a,x2:start+b,y1:base+y,y2:base+z,kind:'main',cityType:'rooftop',...extra};l.surfaces.push(s);return s};
 const spring=(id,s,x,power,launchX,targetId)=>{const d={id:'mid-'+id,surfaceId:s.id,x:start+x,y:s.y1+(start+x-s.x1)*(s.y2-s.y1)/(s.x2-s.x1),power,launchX,targetId};l.springs.push(d);return d};
 const body=(s,style,extra={})=>{s.roof=true;return l.buildings.push({id:s.id+'-body',x:s.x1,y:Math.min(s.y1,s.y2)+26,w:s.x2-s.x1,h:2000,seed:47+l.buildings.length,roofId:s.id,style,...extra})};
 const bot=(id,s,x,extra={})=>{const y=s.y1+(start+x-s.x1)*(s.y2-s.y1)/(s.x2-s.x1)-18;l.enemies.push({id:'mid-'+id,x:start+x,base:start+x,y,baseY:y,kind:'crab',range:8,...extra})};
 const approach=deck('approach',0,320,0),fallen=deck('fallen-building',320,940,0,-90,{cityType:'concrete-ramp',fallen:true});body(fallen,'fallen',{damage:1});
 const upper=deck('upper-choice',640,900,-185,-185,{cityType:'fire-escape',kind:'express',routeType:'skill'});
 const poolFloor=deck('pool-floor',1400,1990,190,190,{kind:'lower',cityType:'glass-pool'});
 const tilted=deck('tilted-glass-roof',2080,2700,-70,-180,{cityType:'concrete-ramp',glass:true});body(tilted,'glass',{scenery:true});
 const roofExit=deck('pool-roof-exit',2700,2970,-180),right=deck('right-guard-roof',3180,3680,-180);body(right,0);bot('low-guard',right,3420);
 const low1=deck('low-transfer-1',3890,4250,-110),low2=deck('low-transfer-2',4450,4810,30),low3=deck('low-transfer-3',4990,5400,140,220);[low1,low2,low3].forEach(s=>body(s,2));
 const upper1=deck('spring-step-1',1010,1320,-470,-470,{kind:'express',routeType:'skill',cityType:'fire-escape'}),upper2=deck('spring-step-2',700,980,-750,-750,{kind:'express',routeType:'skill',cityType:'fire-escape'}),upper3=deck('spring-aim-step',1240,1460,-1090,-1090,{kind:'express',routeType:'skill',cityType:'billboard'});
 const left=deck('left-decision',1480,1820,-1430,-1430,{kind:'express',routeType:'skill',cityType:'fire-escape'}),wrong=deck('wrong-decision',1880,2130,-1390,-1390,{cityType:'fire-escape'});bot('wrong-way-guard',wrong,2000,{jumpImmune:true,rebound:false});
 const moving=deck('moving-spring-hoist',1510,1710,-1720,-1720,{kind:'moving',routeType:'skill',cityType:'crane-hoist',motion:{axis:'x',amp:180,period:300,phase:0}});
 const railExtras={kind:'express',routeType:'boost',grindable:true,infiniteBoost:true,solidAtAnySpeed:true,boostExit:true,cityType:'grind-rail'};
 const rails=[deck('rail-entry',2070,2350,-1920,-1900,railExtras),deck('rail-top',2350,3000,-1900,-1650,railExtras),deck('rail-descent',3000,4700,-1650,-300,railExtras),deck('rail-exit',4700,5400,-300,220,railExtras)];
 const junction=deck('junction',5400,6700,220,220,{boostExit:true});body(junction,2);
 const stair1=deck('junction-building-1',6840,7040,110),stair2=deck('junction-building-2',7190,7450,0);[stair1,stair2].forEach(s=>body(s,1));
 bot('rail-guard-1',rails[1],2700);bot('rail-guard-2',rails[2],3650);bot('rail-guard-3',rails[2],4500);
 spring('low-spring',fallen,920,18,8,'mid-pool-floor');
 spring('upper-spring',upper,790,20,7.2,upper1.id);spring('spring-1',upper1,1160,20,-6,upper2.id);spring('spring-2',upper2,860,22,9,upper3.id);
 spring('aim-spring',upper3,1340,22,4,left.id);spring('left-spring',left,1610,21,0,moving.id);spring('moving-spring',moving,1610,20,12,rails[0].id);
 const pool={id:'mid-pool',x1:start+1400,x2:start+1990,y:base+80,floor:base+190,surfaceId:poolFloor.id,booster:{id:'mid-pool-booster',x:start+1740,y:base+190,surfaceId:poolFloor.id,power:23,launchX:8,poolBooster:true,targetId:tilted.id}};
 l.pads.push(pool.booster);
 l.buildings.push({id:'mid-burned-glass-tower',x:start+1360,y:base-360,w:170,h:2000,seed:61,glass:true,burning:true,scenery:true},{id:'mid-tilted-glass-tower',x:tilted.x1,y:tilted.y2+26,w:tilted.x2-tilted.x1,h:2000,seed:67,glass:true,scenery:true});
 const secret=[];for(const [i,x,y]of [[1,2700,-290],[2,2410,-400],[3,2130,-510],[4,1830,-620],[5,1540,-730],[6,1260,-840]]){const s=deck('secret-'+i,x,x+210,y,y,{cityType:'fire-escape',secretDepth:i});secret.push(s)}
 l.monitors??=[];l.monitors.push({id:'mid-secret-monitor',x:start+1370,y:base-840,surfaceId:secret.at(-1).id,broken:false,secret:true},{id:'mid-rail-monitor',x:start+1550,y:base-1430,surfaceId:left.id,broken:false,required:true});
 l.checkpoints.push({x:junction.x1+190,y:junction.y1,name:'GLASS CANYON / JUNCTION',surfaceId:junction.id});
 l.sectors.push({x:start,y:base,name:'GLASS CANYON',hint:''},{x:tower.x1-30,y:tower.y1,name:'09 / NEON SWITCHBACK',hint:''});l.sectors.sort((a,b)=>a.x-b.x);l.checkpoints.sort((a,b)=>a.x-b.x);
 l.deathZones.push({x1:start,x2:start+length,y:base+700});
 for(const s of [approach,fallen,tilted,roofExit,right,low1,low2,low3,stair1,stair2])for(let x=s.x1+50;x<s.x2-30;x+=85)l.rings.push({x,y:s.y1+(x-s.x1)*(s.y2-s.y1)/(s.x2-s.x1)-38,taken:false});
 l.middleSection={start,base,length,junction,pool,lowSteps:[fallen.id,poolFloor.id,tilted.id,roofExit.id,right.id],highSteps:[upper.id,upper1.id,upper2.id,upper3.id,left.id,moving.id,...rails.map(s=>s.id),junction.id],secretRevealed:false,towerEntryId:tower.id};
 // Recompute descriptive bounds of retained challenges after shifting their referenced decks.
 for(const c of l.routeChallenges||[]){const steps=c.steps.map(id=>l.surfaces.find(s=>s.id===id)).filter(Boolean);if(!steps.length)continue;c.x1=Math.min(...steps.map(s=>s.x1));c.x2=Math.max(...steps.map(s=>s.x2));c.exitX=steps.at(-1).x1;c.exitY=steps.at(-1).y1}
 return l;
}
function updateMiddleMotion(){
 const t=p.poolTransfer;if(!t)return false;
 t.age++;const u=Math.min(1,t.age/24),ease=u*u*(3-2*u);p.x=t.x+(t.targetX-t.x)*ease;p.y=t.y+(t.targetY-t.y)*ease;p.vx=0;p.vy=0;p.ground=false;p.surface=null;p.inv=Math.max(p.inv,2);
 if(u===1){const floor=level.surfaces.find(s=>s.id===level.middleSection.pool.surfaceId);p.poolTransfer=null;p.poolApproach=false;land(floor,level.middleSection.pool.floor);if(typeof gameSound==='function')gameSound('pool')}
 return true;
}
function updateMiddleSection(){const m=level.middleSection;if(!m)return;
 if(!m.secretRevealed&&p.x<m.start+2460&&p.x>m.start&&p.surface?.secretDepth>=3)m.secretRevealed=true;
 if(p.poolApproach&&!p.poolTransfer&&p.x>=m.pool.x1-100&&p.vy>=0){p.poolTransfer={age:0,x:p.x,y:p.y,targetX:m.pool.booster.x,targetY:m.pool.floor-20};p.ground=false;p.surface=null}
}
function drawMiddleSection(){const m=level.middleSection;if(!m)return;const pool=m.pool,glassRoof=surfaceById(pool.booster.targetId);if(glassRoof.x2<cam-100||pool.x1-400>cam+W/zoom+100||m.base-360>camY+H/zoom+100)return;
 // Broken left tower and leaning right tower frame an H-shaped sky pool.
 const left=pool.x1-40,right=pool.x2+90;
 for(const [x,w,top,burn]of [[left,170,m.base-360,true]]){
  const bottom=camY+H/zoom+80,first=Math.max(top,camY-40);cityPixelRect(x,first,w,bottom-first,'#18263f');cityPixelRect(x,first,6,bottom-first,'#76bccb');cityPixelRect(x+w-8,first,8,bottom-first,'#40577f');
  for(let y=Math.ceil(first/44)*44;y<bottom;y+=44){cityPixelRect(x+10,y,w-20,34,'#305276');cityPixelRect(x+12,y,w-24,4,'#699dad');for(let xx=x+24;xx<x+w-16;xx+=44)cityPixelRect(xx,y,4,34,'#16233c')}
  if(burn){cityFlame(x+50,top+30,75,100,7,.9);citySmoke(x+80,top,54,7,.25);for(let i=0;i<4;i++)cityPixelRect(x+i*32,top-12+(i%2)*18,24,12,'#13192c');for(let y=first+28;y<bottom;y+=154){cityPixelLine(x+20,y,x+90,y+30,'#0e192c',6);cityPixelLine(x+90,y+30,x+50,y+54,'#0e192c',4)}}
 }
 const roof=surfaceById(pool.booster.targetId),bottom=camY+H/zoom+80,first=Math.max(Math.min(roof.y1,roof.y2)+26,camY-40),width=roof.x2-roof.x1;
 ctx.save();ctx.beginPath();ctx.moveTo(roof.x1-400,bottom);for(let x=roof.x1;x<=roof.x2;x+=2){const y=Math.floor((yOn(roof,x)+26)/2)*2;ctx.lineTo(x,y);ctx.lineTo(x+2,y)}ctx.lineTo(roof.x2,bottom);ctx.closePath();ctx.clip();
 for(let y=Math.floor(first/44)*44;y<bottom;y+=44){const x=roof.x1+Math.round((roof.y1+26-y)*.16/2)*2;cityPixelRect(x,y,width,44,'#18263f');cityPixelRect(x,y,6,44,'#79b9c5');cityPixelRect(x+width-8,y,8,44,'#40577f');cityPixelRect(x+10,y+4,width-24,34,'#305276');cityPixelRect(x+12,y+4,width-28,4,'#699dad');for(let xx=x+24;xx<x+width-16;xx+=48){cityPixelRect(xx,y+4,4,34,'#16233c');cityPixelRect(xx+4,y+12,20,2,'#456f91')}}ctx.restore();
 cityPixelRect(pool.x1,pool.y,pool.x2-pool.x1,pool.floor-pool.y,'#163c668c');
 for(let x=pool.x1;x<pool.x2;x+=8){const y=pool.y+Math.round(Math.sin(x*.04+step*.08))*2;cityPixelRect(x,y,8,4,'#84eff6');if(Math.floor((x+step*2)/16)%3===0)cityPixelRect(x+2,y+6,4,2,'#408dbe')}
 for(let i=0;i<16;i++){const x=pool.x1+30+(i*37)%(pool.x2-pool.x1-60),y=pool.floor-((step*.8+i*17)%(pool.floor-pool.y));cityPixelRect(x,y,4,4,'#91dae578');cityPixelRect(x+2,y,2,2,'#d5fdff')}
 if(typeof drawPoolBooster==='function')drawPoolBooster(airDevicePose(pool.booster));
}
