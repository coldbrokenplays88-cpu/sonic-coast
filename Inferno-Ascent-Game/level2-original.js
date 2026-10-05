// Original authored v22 districts, retained for selective restoration.
'use strict';
// Platforming earns the speed: compact climbs replace the former ramp bypasses.
function makeOriginalCity(){
 const surfaces=[],hazards=[],enemies=[],pads=[],rings=[],signs=[],checkpoints=[],sectors=[],loops=[],debris=[],events=[],buildings=[],challenges=[],springs=[];let n=0;
 const rail=(a,b,y,z=y,kind='main',extra={})=>{const s={id:'act2-'+n++,x1:a,x2:b,y1:y,y2:z,kind,...extra};if(kind==='crumble')Object.assign(s,{crumbleDelay:Math.max(55,Math.ceil((b-a)/10)+12),crumbleTimer:-1,restoreAt:0});surfaces.push(s);return s};
 const label=(x,y,text,type='jump')=>signs.push({x,y,text,type});
 const gems=(a,b,y,space=85)=>{for(let x=a;x<b;x+=space)rings.push({x,y,taken:false})};
 const bot=(x,y,kind='crab',extra={})=>enemies.push({id:'a2bot-'+n++,x,base:x,y:y-18,baseY:y-18,kind,range:kind==='drone'?24:14,...extra});
 const spike=(x,y,w=70)=>{hazards.push({id:'spike-'+n++,type:'spikes',x:x-w/2,y:y-25,w,h:25});label(x-460,y-85,'JUMP','jump')};
 const high=(a,b,y,z=y,extra={})=>rail(a,b,y,z,'express',{routeType:'skill',solidAtAnySpeed:true,...extra});
 const low=(a,b,y,z=y)=>rail(a,b,y,z,'lower',{routeType:'lower'});
 const cp=(x,y,name,hint)=>checkpoints.push({x,y,name,hint});
 const district=(x,y,name,hint)=>{sectors.push({x,y,name,hint});cp(x+100,y,name,hint);label(x+320,y-100,name,'sector')};
 const rubble=(x,y)=>debris.push({id:'debris-'+n++,x,y,w:76,warn:42,fall:16,triggered:false,age:0});
 const loop=(x,y,r=94)=>{loops.push({id:'loop-'+n++,x,y,r,used:false});label(x-470,y-100,'CARRY SPEED / LOOP TRANSFER','express');for(let i=0;i<16;i++)rings.push({x:x+Math.sin(i*Math.PI/8)*(r-25),y:y-r+Math.cos(i*Math.PI/8)*(r-25),taken:false})};
 const wall=(x,y)=>{hazards.push({id:'crack-'+n++,type:'breakable',x,y:y-112,w:52,h:112,floor:y,broken:false,threshold:20});label(x-480,y-150,'CRACKED / BOOST OR SAVED SPEED','express')};
 // A real tower face prevents running out below the crown. It has no input lock or timed gate.
 const towerFace=(x,top,bottom)=>{const face={id:'tower-face-'+n++,type:'bulkhead',x,y:top,w:45,h:bottom-top};hazards.push(face);rail(x,x+45,top,top,'main',{wallCap:true,faceId:face.id})};
 function climb(x,y,name,kind='stairs',count=6){
  const entry=rail(x-260,x+240,y),steps=[];
  // Replace selected ledges in place; keep tower bounds, count and approach intact.
  const profiles={
   'TRANSIT STACK':{offsets:[320,590,970,1280,1530],heights:[90,230,310,420,510],widths:[220,210,280,200,280],types:['fire-escape','fire-escape','scaffold','rooftop','rooftop'],slope:1,slant:35},
   'VIADUCT PYLON':{offsets:[320,660,920,760,1240,1700],heights:[80,180,300,390,510,610],widths:[260,320,320,240,240,300],types:['scaffold','concrete-ramp','scaffold','fire-escape','broken-bridge','rooftop'],slope:1,slant:80,horizontal:14,crumble:4},
   'FRACTURE CROWN':{offsets:[320,650,1020,1210],heights:[80,200,340,420],widths:[280,300,220,260],types:['ventilation','concrete-ramp','scaffold','rooftop'],slope:1,slant:60},
   'COLLAPSE PYLON':{offsets:[320,650,1000,1260,1590,1760],heights:[90,210,290,430,520,610],widths:[260,300,250,280,210,260],types:['broken-bridge','concrete-ramp','scaffold','ventilation','broken-bridge','rooftop'],slope:1,slant:60,horizontal:18,crumble:4,facadeStyle:0},
   'SUMMIT TRANSFER':{offsets:[320,600,910],heights:[70,200,290],widths:[230,300,280],types:['fire-escape','concrete-ramp','rooftop'],slope:1,slant:45,attach:true,facadeStyle:3},
   'NEON SWITCHBACK':{offsets:[380,690,470,140,420,730],heights:[90,190,300,380,520,600],widths:[240,240,250,230,270,240],types:['billboard','fire-escape','scaffold','fire-escape','concrete-ramp','rooftop'],slope:4,slant:40,horizontal:16,facadeStyle:1},
   'BROKEN TOWER':{offsets:[350,660,390,120,460,720],heights:[80,210,300,430,500,620],widths:[250,220,280,240,220,250],types:['ventilation','fire-escape','scaffold','concrete-ramp','billboard','broken-bridge'],slope:3,slant:30,crumble:5,facadeStyle:3},
   'SKYLINE CROWN':{offsets:[320,700,1060,800,1270,1740],heights:[110,190,300,440,530,610],widths:[230,300,220,250,260,280],types:['billboard','fire-escape','scaffold','billboard','broken-bridge','rooftop'],horizontal:12,crumble:4}
  },profile=profiles[name];
  for(let i=0;i<count;i++){
   const offsets=kind==='switchback'?[400,690,400,100,400,690]:null;
   const a=x+(profile?profile.offsets[i]:offsets?offsets[i]:320+i*300),w=profile?profile.widths[i]:offsets?(i===5?230:210):(i===count-1?230:180),z=y-(profile?profile.heights[i]:(i+1)*100),slant=profile?.slope===i?profile.slant:0,fragile=profile?.crumble===i;
   const extra=i===2?{motion:{axis:profile?.horizontal?'x':'y',amp:profile?.horizontal||9,period:210,phase:0}}:{roof:!fragile};
   if(profile)extra.cityType=profile.types[i];else if(kind==='switchback')extra.cityType=i%2?'fire-escape':'scaffold';
   if(name==='COLLAPSE PYLON'&&i===2){extra.motion={axis:'y',amp:6,period:210,phase:0};extra.cityType='crane-hoist'}
   const s=rail(a,a+w,z,z-slant,i===2?'moving':fragile?'crumble':'main',extra);if(fragile)s.crumbleDelay=110;steps.push(s.id);gems(a+35,a+w-20,z-38,65);
  }
  const exitX=x+(kind==='switchback'?1010:count*300+330),exitY=y-(count+1)*100;
  const exit=rail(exitX,exitX+500,exitY);steps.push(exit.id);
  // A miss loses the fast climb, but the service branch makes forward progress.
  const catchDeck=low(x-330,exitX-580,y+240),returnStep=low(exitX-400,exitX-180,y+130);towerFace(exitX-15,exitY+60,exitY+160);
  label(x-650,y-100,kind==='switchback'?'BRAKE / CLIMB / TURN LEFT':'BRAKE / ROOFTOP CLIMB','jump');label(x-280,y+145,'RECOVER LEFT / CLIMB AGAIN','recovery');
  if(kind==='switchback'){if(profile){for(const i of [1,3]){const left=profile.offsets[i+1]<profile.offsets[i];label(x+profile.offsets[i]+profile.widths[i]/2,y-profile.heights[i]-60,left?'← NEXT LEDGE':'NEXT LEDGE →','jump')}}else{label(x+760,y-250,'← NEXT LEDGE','jump');label(x+170,y-450,'NEXT LEDGE →','jump')}}else if(profile?.offsets.some((v,i,a)=>i&&v<a[i-1])){label(x+profile.offsets[2]+80,y-profile.heights[2]-60,'← RETURN LEDGE','jump');label(x+profile.offsets[3]+70,y-profile.heights[3]-60,'UP / RIGHT →','jump')}
  const variant=challenges.length%3,service={id:'service-'+name.toLowerCase().replaceAll(' ','-'),x1:exitX-60,x2:exitX+100,y1:y+40,y2:y+40,kind:'lower',routeType:'lower',cityType:variant===1?'ventilation':'fire-escape'},bottom=y+40,top=exitY+75;
  const lift={id:'lift-'+service.id,x1:exitX+190,x2:exitX+390,y1:(top+bottom)/2,y2:(top+bottom)/2,kind:'moving',routeType:'lower',cityType:'freight-lift',motion:{axis:'y',amp:(bottom-top)/2,period:variant===1?360:420,phase:Math.PI/2}};
  surfaces.push(service,lift);if(variant!==1)springs.push({id:'spring-'+service.id,x:exitX+45,y:bottom,surfaceId:service.id,power:17.2});
  challenges.push({id:'climb-'+n++,name,kind,x1:x-330,x2:exitX+500,entryId:entry.id,entryX:x-150,exitX,exitY,steps,lowerBranch:{steps:[catchDeck.id,returnStep.id,service.id,lift.id,exit.id],liftId:lift.id,springId:variant!==1?'spring-'+service.id:null}});
  cp(exitX+110,exitY,name+' / CROWN','Climb cleared. Earned speed ahead.');
  if(kind==='switchback'||profile?.horizontal||profile?.attach){const body={x:x+260,y:exitY+65,w:exitX-x-300,h:y+220-(exitY+65),exposed:true,attachmentIds:steps.slice(0,-1),seed:n,damage:.65,...(profile?.facadeStyle!==undefined?{style:profile.facadeStyle}:{})};buildings.push(body);for(const id of body.attachmentIds){const s=surfaces.find(s=>s.id===id);s.facade={x:body.x,y:body.y,bottom:body.y+body.h};s.roof=false}}
  else for(let i=0;i<count;i++){const s=surfaces.find(s=>s.id===steps[i]);if(s.roof)buildings.push({x:s.x1+4,y:Math.max(s.y1,s.y2)+24,w:s.x2-s.x1-8,h:y+235-(Math.max(s.y1,s.y2)+24),roofId:s.id,seed:n+i*7,damage:.3+i*.08});else s.facade={x:s.x1+10,y:y+235,bottom:y+250}}
  return {x:exit.x2,y:exitY};
 }
 function transfers(x,y,name,crumble=false){
  rail(x-400,x+240,y);let cursor=x+240;const steps=[];
  const gaps=[350,420,280,460],heights=[-45,20,-60,0];
  for(let i=0;i<3;i++){cursor+=gaps[i];const z=y+heights[i],s=rail(cursor,cursor+(i%2?280:230),z,z,crumble?'crumble':i===2?'moving':'main',i===2&&!crumble?{motion:{axis:'x',amp:18,period:220,phase:0}}:{});if(name==='COLLAPSE GAUNTLET'&&i===1){s.cityType='exposed-floor'}steps.push(s.id);gems(s.x1+35,s.x2-15,z-40,65);cursor=s.x2;}
  const exitX=cursor+300,exit=rail(exitX,exitX+500,y);steps.push(exit.id);
  // The lower branch still requires jumps and a three-step ascent back to the exit.
  low(x+200,x+970,y+250);low(x+1130,x+1740,y+250);low(x+1900,x+2110,y+160);low(x+2280,x+2510,y+80);
  label(x-640,y-100,'BROKEN RAILS / TIME EACH JUMP','jump');label(x+1920,y+100,'RECOVERY / STEP UP','recovery');
  if(crumble)events.push({x:x+400,y,type:'bridge',trigger:cursor-100,width:1900,age:-1});
  return {x:exit.x2,y,exitX,steps};
 }

 district(0,420,'01 / CITY UNDER ATTACK','Broken rails lead into a real rooftop climb. Speed alone cannot reach the crown.');
 rail(0,1300,420);spike(900,420);gems(300,700,382);
 rail(1300,1580,420,280);rail(1580,2150,280);rail(2480,3000,250);bot(2760,250);low(2100,2450,520);low(2630,2850,420);low(2920,3140,330);low(3190,3440,230);
 rail(3000,3300,250,100);rail(3300,4000,100);climb(4260,100,'TRANSIT STACK','stairs',5);
 rail(6590,7400,-500);bot(6940,-500);rail(7400,7670,-500,-600);rail(7670,8500,-600,-450);rubble(7100,-500);

 district(8500,-450,'02 / SKYLINE FORK','Earn the high rail with a full jump. Both city routes reconnect at a switchback tower.');
 rail(8500,9450,-450);rail(9450,9750,-450,-600);rail(10080,10800,-580);rail(11130,11420,-610);rail(11580,11800,-520);rail(11930,12150,-610);
 for(const [i,a,b,y] of [[0,12300,12530,-710],[1,12650,12920,-650],[2,13200,13500,-650]])surfaces.push({id:'skyline-service-'+i,x1:a,x2:b,y1:y,y2:y,kind:'main',cityType:i===1?'fire-escape':'rooftop'});
 high(10050,10850,-735,-780);high(11180,12000,-780,-825);high(12350,13100,-825,-780);high(13100,13500,-780,-650);bot(11680,-810,'drone',{bounceRoute:true});spike(12550,-812);gems(10200,10750,-800);
 label(9800,-710,'UPPER SKILL / NO BOOST NEEDED','jump');label(9800,-390,'NORMAL / ROOFTOP TRANSFERS','jump');
 low(9790,10500,-250);low(10710,11500,-250,-340);low(11700,12100,-340);low(12300,12650,-440);low(12800,13100,-540);low(13200,13500,-640);bot(11300,-318);
 climb(13760,-650,'BROADCAST TOWER','switchback');rail(15270,16000,-1350);rail(16000,16500,-1350,-1300);rubble(15700,-1350);

 district(16500,-1300,'03 / COLLAPSING INFRASTRUCTURE','A loop feeds unstable rail transfers. The catch decks also require controlled jumps.');
 rail(16500,17000,-1300,-1200);rail(17000,18000,-1200);loop(17400,-1200);rail(18000,18500,-1200,-1400);
 const bridge=transfers(18900,-1400,'FALLING VIADUCT',true);rail(bridge.x,21800,-1400,-1500);rubble(21100,-1400);
 climb(22060,-1500,'VIADUCT PYLON','stairs',6);rail(24690,25000,-2200);

 district(25000,-2200,'04 / ROOFTOP ASCENT','Brake before the tower. Follow the ledges right, left, then right; no road bypasses the climb.');
 rail(25000,26200,-2200);bot(25700,-2200);rail(26200,26500,-2200,-2320);rail(26500,27600,-2320,-2250);
 climb(27860,-2250,'NEON SWITCHBACK','switchback');rail(29370,30100,-2950);rail(30100,30400,-2950,-2830);rail(30400,31600,-2830);loop(31000,-2830,100);
 rail(31600,31900,-2830,-3010);rail(32240,33500,-3000);low(31800,32200,-2730);low(32320,32530,-2830);low(32700,32900,-2930);rubble(33100,-3000);

 district(33500,-3000,'05 / FRACTURE EXPRESS','Earn the launch, then smash a cracked route above the broken rails. Both paths still climb the crown.');
 rail(33500,34900,-3000);bot(34300,-3000);rail(34900,35200,-3000,-3150);rail(35200,35900,-3150);
 const fracture=transfers(36300,-3150,'FRACTURE TRANSFERS');rail(fracture.x,39800,-3150,-3200);
 high(35500,35800,-3260,-3360,{routeType:'boost',entrySpeed:19});high(35800,40060,-3360,-3690,{routeType:'boost',entrySpeed:19,cityType:'concrete-ramp',boostExit:true});wall(36000,-3375.5);for(let x=36200;x<39700;x+=130)rings.push({x,y:-3360-(x-35800)*330/4260-38,taken:false});high(40060,41590,-3690,-3700,{routeType:'boost',cityType:'concrete-ramp',solidAtAnySpeed:true,boostExit:true});label(39200,-3750,'RAMP / ROOFTOP MERGE','express');
 climb(40060,-3200,'FRACTURE CROWN','stairs',4);rail(42090,42500,-3700,-3800);

 district(42500,-3800,'06 / BROKEN TOWER','Narrow tower ledges require controlled speed. Land cleanly to reach the downhill loop payoff.');
 rail(42500,43800,-3800);spike(43300,-3800);rail(43800,44100,-3800,-3950);rail(44100,44900,-3950);
 climb(45160,-3950,'BROKEN TOWER','switchback');rail(46670,47600,-4650);bot(47000,-4650);rail(47600,47900,-4650,-4530);rail(47900,49000,-4530);loop(48400,-4530,106);rail(49000,49300,-4530,-4710);rail(49630,50500,-4700);low(49200,49600,-4260);low(49740,49940,-4370);low(50100,50300,-4480);low(50400,50600,-4580);rubble(48800,-4530);

 district(50500,-4700,'07 / SPLIT SKYLINE','Earn the upper skyline transfer or follow the slower streets below.');
 rail(50500,51900,-4700);rail(51900,52200,-4700,-4850);rail(52530,53200,-4830);rail(53500,54200,-4870);rail(54570,55180,-4820);rail(55550,56300,-4900);rail(56660,57300,-4850);
 high(52500,53150,-5000);high(53500,54100,-5060);high(54500,55150,-5000);high(55550,56200,-5070);high(56600,57300,-5070,-4850);bot(53900,-5060,'drone',{bounceRoute:true});bot(55900,-5070);gems(52600,53100,-5040);
 label(52300,-5070,'UPPER SKILL / NO BOOST NEEDED','jump');label(53200,-5350,'BOOST / CRACKED SERVICE TUNNEL','express');
 high(53300,53600,-5090,-5200,{routeType:'boost',entrySpeed:19});high(53600,57000,-5200,-5460,{routeType:'boost',entrySpeed:19,boostExit:true});wall(54800,-5200-(54800-53600)*260/3400);high(57000,59690,-5460,-5550,{routeType:'boost',grindable:true,cityType:'grind-rail',solidAtAnySpeed:true,boostExit:true});label(56300,-5510,'GRIND / JUMP TO LEAVE','express');label(59000,-5520,'WIDE ROOFTOP AHEAD','express');for(let x=53900;x<56800;x+=135)rings.push({x,y:-5200-(x-53600)*260/3400-38,taken:false});
 low(52100,52900,-4480);low(53100,54100,-4480,-4550);low(54300,54800,-4550);low(55000,55450,-4650);low(55640,56000,-4750);low(56200,57300,-4750,-4850);bot(54600,-4550);spike(55690,-4750,55);
 climb(57560,-4850,'SKYLINE CROWN','stairs',6);rail(60190,60600,-5550,-5450);

 district(60600,-5450,'08 / CITY-COLLAPSE CLIMAX','Jump the failing rails, then scale the last exposed pylon as the city falls beneath you.');
 rail(60600,61500,-5450);rail(61500,61800,-5450,-5600);rail(61800,62500,-5600);
 const finale=transfers(62500,-5600,'COLLAPSE GAUNTLET',true);rail(finale.x,65400,-5600,-5700);rubble(65000,-5600);
 climb(65660,-5700,'COLLAPSE PYLON','stairs',6);rail(68290,68700,-6400);rail(68700,69900,-6400);loop(69400,-6400,94);
 events.push({x:68000,y:-6400,type:'tower',trigger:68700,width:550,age:-1});rubble(69700,-6400);

 district(69900,-6400,'09 / SUMMIT ARENA','A final fire escape and tilted rooftop transfer lead to the empty boss-ready helipad.');
 rail(69900,70600,-6400);rail(70600,70900,-6400,-6550);rail(70900,71200,-6550);bot(70300,-6400);
 climb(71460,-6550,'SUMMIT TRANSFER','stairs',3);rail(73190,74700,-6950);gems(73500,74200,-6990,100);label(73850,-7080,'BOSS ARENA / ROOFTOP HELIPAD','sector');

 // Guards pressure approaches and landings; earned straightaways stay free of enemy walls.
 for(const [x,y]of [[3500,100],[9000,-450],[11470,-610],[12780,-570],[16670,-1266],[21600,-1465],[25300,-2200],[26900,-2300],[29800,-2950],[33700,-3000],[35800,-3150],[39700,-3190],[42800,-3800],[44600,-3950],[47300,-4650],[50800,-4700],[52800,-4830],[54900,-4820],[55900,-4900],[57000,-4850],[61000,-5450],[62200,-5600],[65200,-5650],[68900,-6400],[71000,-6550]])bot(x,y);
 // Optional drone rebounds reward clean arcs without being necessary to solve a climb.
 for(const c of challenges.filter(c=>c.kind==='stairs').slice(1)){const entry=surfaces.find(s=>s.id===c.entryId);bot(c.entryX+1190,entry.y1-370,'drone',{bounceRoute:true,range:10})}
 // The backdrop supplies distant buildings. Foreground structures attach to real roofs.
 for(const c of checkpoints){const s=surfaces.filter(s=>c.x>=s.x1&&c.x<=s.x2&&s.kind==='main').sort((a,b)=>Math.abs(a.y1+(c.x-a.x1)*(a.y2-a.y1)/(a.x2-a.x1)-c.y)-Math.abs(b.y1+(c.x-b.x1)*(b.y2-b.y1)/(b.x2-b.x1)-c.y))[0];if(s){c.y=s.y1+(c.x-s.x1)*(s.y2-s.y1)/(s.x2-s.x1);c.surfaceId=s.id;for(let i=1;i<=5;i++){const x=c.x+i*55;if(x<s.x2-20)rings.push({x,y:s.y1+(x-s.x1)*(s.y2-s.y1)/(s.x2-s.x1)-38,taken:false})}}}
 for(let i=0;i<surfaces.length;i++){const s=surfaces[i];if(!s.cityType)s.cityType=s.wallCap?'tower-cap':s.routeType==='boost'?'ruined-tunnel':s.kind==='moving'?'scaffold':s.kind==='crumble'?'broken-bridge':s.kind==='lower'?'ruined-walkway':s.roof?'rooftop':s.y1!==s.y2?'concrete-ramp':s.x2-s.x1>650?(i%3?'rooftop':'highway'):s.routeType==='skill'?'billboard':i%2?'fire-escape':'scaffold'}
 const routeCues=challenges.flatMap(c=>c.steps.slice(0,-1).map((id,i)=>({id,nextId:c.steps[i+1]})));
 return {surfaces,hazards,enemies,pads,rings,signs,checkpoints,sectors,loops,debris,events,buildings,challenges,springs};
}
