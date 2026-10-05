 'use strict';
// Relocate whole authored districts, preserving their slopes, enemies and route choices.
function relocateCity(value,dx,dy,idMap=new Map()){
 if(Array.isArray(value))return value.map(v=>relocateCity(v,dx,dy,idMap));
 if(typeof value==='string')return idMap.get(value)||value;
 if(!value||typeof value!=='object')return value;
 const out={};for(const [k,v]of Object.entries(value))out[k]=typeof v==='number'&&['x','x1','x2','base','entryX','exitX','trigger'].includes(k)?v+dx:typeof v==='number'&&['y','y1','y2','baseY','floor','top','bottom','exitY'].includes(k)?v+dy:relocateCity(v,dx,dy,idMap);return out;
}
function restoreCityDistricts(a){
 // Keep the complete current design intact, apart from its unsafe rail exit and finale.
 for(const list of Object.values(a))if(Array.isArray(list))for(let i=list.length-1;i>=0;i--){const o=list[i],x=o.x1??o.x??o.entryX;
  if((o.id||'').startsWith('summit-')||o.id==='summit-climb'||o.landmark==='HELIPAD ACCESS'||(list===a.checkpoints||list===a.sectors)&&x>=27290||list===a.deathZones&&o.x1===27790){list.splice(i,1);continue}
  if(x===undefined)continue;const after=x>=20000,neon=x>=22820||(o.id||'').startsWith('neon-');Object.assign(o,relocateCity(o,16500+(after?10100:0)+(neon?900:0),-1720-(after?750:0)));
 }
 const roof=a.surfaces.find(s=>s.id==='secret-shared-rooftop');roof.x2+=900;
 const first=a.surfaces.find(s=>s.id==='neon-0');a.surfaces.push({id:'secret-exit-uphill-link',x1:roof.x2,x2:first.x1,y1:roof.y2,y2:first.y1,kind:'main',cityType:'concrete-ramp'});
 a.routeChallenges.find(c=>c.id==='neon-climb').steps.splice(1,0,'secret-exit-uphill-link');
 const source=makeOriginalCity(),restored=[];
 function add(name,from,to,x,y,prefix,entryId){
  const dx=x-from,dy=y-source.surfaces.find(s=>s.x1===from&&s.kind==='main').y1,selected=source.surfaces.filter(s=>s.x1>=from&&s.x1<to&&s.x2<=to),ids=new Set(selected.map(s=>s.id)),map=new Map();
  for(const list of Object.values(source))if(Array.isArray(list))for(const o of list)if(o.id)map.set(o.id,prefix+'-'+o.id);
  if(entryId)map.set(selected[0].id,entryId);
  for(const key of ['surfaces','hazards','enemies','pads','springs','rings','signs','checkpoints','sectors','loops','debris','events','buildings','challenges']){
   const dest=key==='challenges'?a.routeChallenges:a[key];if(!dest)continue;
   for(const o of source[key]){const xx=o.x1??o.x??o.entryX;if(xx===undefined||xx<from||xx>=to)continue;
    if(key==='surfaces'&&!ids.has(o.id)||key==='challenges'&&!o.steps.every(id=>ids.has(id))||key==='checkpoints'&&!ids.has(o.surfaceId)||['pads','springs'].includes(key)&&!ids.has(o.surfaceId)||key==='signs'&&o.type!=='sector')continue;
    const copy=relocateCity(o,dx,dy,map);if(copy.name)copy.name=copy.name.replace(/^\d+ \/ /,'');dest.push(copy);
   }
  }
  const endSurface=selected.filter(s=>s.kind==='main'&&s.x2===to).at(-1);
  const section={name,prefix,x1:x,x2:x+to-from,entryId:map.get(selected[0].id),exitId:map.get(endSurface.id)};restored.push(section);return section;
 }
 add('CITY UNDER ATTACK',0,8500,0,420,'under-attack');
 add('SKYLINE FORK',8500,16500,8500,-450,'skyline-fork');
 add('SPLIT SKYLINE',50500,60600,a.surfaces.find(s=>s.id==='draw-hall-exit').x2,a.surfaces.find(s=>s.id==='draw-hall-exit').y2,'split-skyline');
 const climaxX=27290+16500+10100+900,climaxY=-5920-2470;
 const climax=add('CITY-COLLAPSE CLIMAX',60600,69900,climaxX,climaxY,'city-climax','summit-entry');
 // The existing vent now lands at the restored climax entry rather than the removed summit climb.
 const exit=a.surfaces.find(s=>s.id===climax.exitId),arena={x:climax.x2,y:exit.y2,w:1460,boss:false};
 a.surfaces.push({id:'summit-arena',x1:arena.x,x2:arena.x+1460,y1:arena.y,y2:arena.y,kind:'main',cityType:'rooftop'});
 a.checkpoints.sort((u,v)=>u.x-v.x);a.sectors.sort((u,v)=>u.x-v.x);
 for(let i=0;i<a.sectors.length;i++)a.sectors[i].name=String(i+1).padStart(2,'0')+' / '+a.sectors[i].name.replace(/^\d+ \/ /,'');
 // Remove the crowded express landing hazard and automatic launches on tiny service ledges.
 a.hazards.splice(a.hazards.findIndex(h=>h.id==='skyline-fork-spike-40'),1);
 for(const c of a.routeChallenges)if(c.id.startsWith('under-attack-')||c.id.startsWith('split-skyline-')){
  const branch=c.lowerBranch;if(!branch?.springId)continue;
  const spring=a.springs.find(s=>s.id===branch.springId),deck=a.surfaces.find(s=>s.id===spring.surfaceId);
  deck.x1-=110;a.springs.splice(a.springs.indexOf(spring),1);branch.springId=null;
 }
 const plain=name=>name.replace(/^\d+ \/ /,'');
 for(const c of a.checkpoints){const sector=a.sectors.find(s=>plain(s.name)===plain(c.name));if(sector)c.name=sector.name}
 for(const sign of a.signs)if(sign.type==='sector'){const sector=a.sectors.find(s=>plain(s.name)===plain(sign.text));if(sector)sign.text=sector.name}
 return {restoredSections:restored,end:arena.x+1000,arena};
}
