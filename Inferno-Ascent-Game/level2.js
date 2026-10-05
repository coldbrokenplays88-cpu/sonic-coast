'use strict';
// A compact city built around buildings, height, and authored transfers.
function makeLevel2(){
 const surfaces=[],hazards=[],enemies=[],pads=[],springs=[],rings=[],signs=[],checkpoints=[],sectors=[],loops=[],debris=[],events=[],buildings=[],routeChallenges=[],deathZones=[],collapseGroups=[];
 const deck=(id,x1,x2,y1,y2=y1,extra={})=>{const s={id,x1,x2,y1,y2,kind:'main',cityType:'rooftop',...extra};if(s.kind==='crumble')Object.assign(s,{crumbleDelay:90,crumbleTimer:-1,restoreAt:0});surfaces.push(s);return s};
 const ledge=(id,a,b,y,extra={})=>deck(id,a,b,y,y,{cityType:'fire-escape',...extra});
 const line=(s,gap=68)=>{for(let x=s.x1+40;x<s.x2-25;x+=gap)rings.push({x,y:s.y1+(x-s.x1)*(s.y2-s.y1)/(s.x2-s.x1)-38,taken:false,...(s.sealedBy?{sealedBy:s.sealedBy}:{})})};
 const challenge=(id,name,steps,extra={})=>{const c={id,name,entryId:steps[0],steps,...extra};routeChallenges.push(c);return c};
 const mark=(s,x,name)=>{const y=s.y1+(x-s.x1)*(s.y2-s.y1)/(s.x2-s.x1);checkpoints.push({x,y,name,surfaceId:s.id});sectors.push({x:s.x1,y,name,hint:''})};
 const pit=(a,b,y)=>deathZones.push({x1:a,x2:b,y});
 const vent=(id,s,x,power,target,extra={})=>{const v={id,x,y:s.y1+(x-s.x1)*(s.y2-s.y1)/(s.x2-s.x1),cityVent:true,surfaceId:s.id,power,targetId:target.id,...extra};pads.push(v);s.cityType=s.cityType==='interior'?'interior':'ventilation';return v};
 const face=(id,x,y,w,h)=>hazards.push({id,type:'bulkhead',x,y,w,h});
 const barrier=(id,x,floor,style='masonry',secret=false)=>{const h={id,type:'breakable',x,y:floor-132,w:32,h:132,floor,threshold:20,boostOnly:true,style,secret,broken:false};hazards.push(h);return h};
 const spike=(id,x,y,w=52)=>hazards.push({id,type:'spikes',x,y:y-25,w,h:25});
 const bot=(id,x,y,kind='crab')=>enemies.push({id,x,base:x,y:y-18,baseY:y-18,kind,range:kind==='drone'?12:8});
 const chunk=(id,x,y)=>debris.push({id,x,y,entryX:17950,w:64,warn:48,fall:18,triggered:false,age:0});
 const body=(id,x,y,w,extra={})=>buildings.push({id,x,y,w,h:2000,seed:buildings.length*5+2,exposed:true,...extra});
 const coil=(id,x,y,r)=>{loops.push({id,x,y,r,used:false});for(let i=0;i<16;i++)rings.push({x:x+Math.sin(i*Math.PI/8)*(r-24),y:y-r+Math.cos(i*Math.PI/8)*(r-24),taken:false})};

 // Opening: rising rooftops establish braking and accurate full jumps.
 const start=deck('arrival',0,670,420);mark(start,120,'01 / ROOFTOP APPROACH');
 const a=deck('approach-1',880,1190,320),b=deck('approach-2',1390,1730,210),c=deck('approach-3',1910,2300,100),d=deck('vent-entry',2460,2910,80);
 challenge('arrival-climb','ROOFTOP APPROACH',[start.id,a.id,b.id,c.id,d.id]);bot('approach-guard',1610,210);Object.assign(enemies.at(-1),{range:65,rebound:false});pit(670,2460,650);

 // The earlier vent drawing is retained once, compactly, with meaningful failure.
 const roof=deck('vent-upper-roof',3350,3830,-100,-100,{kind:'express'}),upper1=deck('vent-upper-step',4020,4380,-140,-140,{kind:'express'}),upper2=deck('vent-upper-tail',4550,4940,-80,-80,{kind:'express'}),merge=deck('vent-later-merge',5060,5450,80);
 const entryVent=vent('momentum-vent',d,2700,18.8,roof);
 const lows=[deck('vent-lower-1',3070,3740,250,250,{kind:'lower'}),ledge('vent-lower-2',3900,4160,310,{kind:'lower'}),deck('vent-lower-3',4340,4580,230,230,{kind:'lower'})];
 const lift=ledge('vent-lower-lift',4860,5220,132.5,{kind:'moving',cityType:'freight-lift',motion:{axis:'y',amp:92.5,period:360,phase:Math.PI/2}});
 springs.push({id:'vent-lower-spring',x:4550,y:230,surfaceId:lows[2].id,power:17.2});
 const ventSection=challenge('vent-drawing','MOMENTUM ROOF',[d.id,roof.id,upper1.id,upper2.id,merge.id],{ventId:entryVent.id,lowerBranch:{steps:[...lows.map(s=>s.id),lift.id,merge.id],liftId:lift.id,springId:'vent-lower-spring'}});
 pit(2910,5060,650);mark(merge,5210,'02 / GLASSWORKS');

 // All six drawings form ONE connected section, in their supplied order.
 const s0=deck('draw-stair-0',5450,6050,80),s1=deck('draw-stair-1',6240,6570,-20),s2=deck('draw-stair-2',6760,7090,-120),s3=deck('draw-glass-approach',7280,7860,-220);
 challenge('draw-roof-stairs','GLASSWORKS ROOFS',[merge.id,s0.id,s1.id,s2.id,s3.id]);pit(6050,7280,390);
 const glass=barrier('teaching-glass',7860,-220,'glass');face('glass-upper-face',7860,-600,32,248);face('glass-lower-face',7860,-220,32,550);
 const inside=deck('draw-glass-hall',7860,8340,-220,-220,{cityType:'interior',sealedBy:glass.id});
 const downhill=deck('draw-downhill',8340,9040,-220,60,{cityType:'concrete-ramp',sealedBy:glass.id});
 body('glass-tower',7860,-600,540,{gateId:glass.id,rooms:[{x1:7860,x2:8340,y:-220}]});
 const escape1=ledge('draw-fire-escape-1',10480,11190,-470),left1=ledge('draw-left-ledge',10140,10420,-580),escape2=ledge('draw-fire-escape-2',10700,11190,-690);
 vent('draw-downhill-vent',downhill,8990,29,escape1);
 challenge('draw-fire-climb','FIRE ESCAPE TURN',[escape1.id,left1.id,escape2.id]);
 const blocked=ledge('draw-blocked-left',10230,10530,-800);spike('draw-left-spikes',10230,-800,300);
 const interiorWall=barrier('draw-interior-wall',11190,-690);
 const room=deck('draw-interior-room',11190,11600,-690,-690,{cityType:'interior',sealedBy:interiorWall.id});
 const roofCp=deck('draw-checkpoint-roof',11190,11970,-1230);
 face('draw-right-duct',11600,-1210,32,520);face('draw-wall-upper',11190,-1230,32,408);face('draw-wall-lower',11190,-690,32,700);
 body('fire-escape-tower',11190,-1230,812,{gateId:interiorWall.id,rooms:[{x1:11190,x2:11600,y:-690}],duct:{x:11540,y1:-1230,y2:-690}});
 vent('draw-interior-vent',room,11470,29,roofCp,{sealedBy:interiorWall.id});mark(roofCp,11710,'03 / UPPER GLASSWORKS');
 const drop=deck('draw-drop-vent-roof',12120,12510,-1070),loopRoof=deck('draw-loop-roof',13000,13500,-1500);
 vent('draw-drop-vent',drop,12300,25.5,loopRoof);pit(11970,13000,-420);
 const descent=deck('draw-loop-descent',13500,13680,-1500,-1030,{cityType:'concrete-ramp'}),loopFlat1=deck('draw-loop-flat-1',13680,14050,-1030),loopLink=deck('draw-loop-link',14050,14180,-1030,-1080,{cityType:'concrete-ramp'}),loopFlat2=deck('draw-loop-flat-2',14180,14500,-1080),launch=deck('draw-loop-launch',14500,14800,-1080,-1300,{cityType:'concrete-ramp'});
 coil('draw-loop-1',13830,-1030,130);coil('draw-loop-2',14360,-1080,95);
 const loopLanding=deck('draw-loop-payoff-roof',15500,16100,-1460);pit(14800,15500,-820);
 const next1=deck('draw-next-roof',16300,16720,-1540),burnApproach=deck('draw-burning-approach',16920,17400,-1620);
 challenge('draw-light-roofs','BURNING QUARTER',[loopLanding.id,next1.id,burnApproach.id]);mark(loopLanding,15640,'04 / BURNING QUARTER');pit(16100,16920,-1110);
 const burnLeft=ledge('draw-burning-left',16570,16870,-1730),burnRight=ledge('draw-burning-right',17090,17410,-1840),burnTop=ledge('draw-burning-top',16650,17000,-1950);
 const carrier=ledge('draw-moving-carrier',17150,17600,-2070,{kind:'moving',cityType:'crane-hoist',motion:{axis:'x',amp:480,period:420,phase:-Math.PI/2}});
 const hallway=deck('draw-hazard-hall',17950,19650,-2070,-2070,{cityType:'interior'});
 challenge('draw-burning-climb','BURNING QUARTER ASCENT',[burnApproach.id,burnLeft.id,burnRight.id,burnTop.id,carrier.id,hallway.id]);
 const secretCatch=deck('draw-hidden-pit-grate',17430,17900,-1120,-1120,{cityType:'ventilation',pitSecret:true});
 vent('draw-hidden-pit-vent',secretCatch,17720,36,hallway,{hidden:true,pitSecret:true});
 pit(16920,17950,-610);body('burning-tower',17950,-2280,1740,{burning:true,rooms:[{x1:17950,x2:19650,y:-2070}]});
 bot('hall-guard-1',18300,-2070);bot('hall-guard-2',19240,-2070);chunk('hall-debris-1',18640,-2070);chunk('hall-debris-2',19010,-2070);
 const hallExit=deck('draw-hall-exit',19650,20000,-2070,-2180,{cityType:'concrete-ramp'});mark(hallway,19450,'05 / AERIAL TRANSIT');
 const drawnSections=[{id:'full-user-section',entryId:s0.id,exitId:hallExit.id,glassId:glass.id,interiorWallId:interiorWall.id,checkpointId:roofCp.id,upperForkId:'draw-burning-climb',secretVentId:'draw-hidden-pit-vent',hallwayId:hallway.id,loopIds:['draw-loop-1','draw-loop-2']}];

 // Earlier rail sketch once: grind tail collapse and genuinely concealed shortcut.
 const railEntry=deck('secret-rail-entry',20000,20560,-2180,-2420,{kind:'express',grindable:true,cityType:'grind-rail'}),railTail=deck('secret-rail-tail',20560,20710,-2420,-2500,{kind:'crumble',grindable:true,cityType:'grind-rail'});
 collapseGroups.push({entryId:railEntry.id,tailIds:[railTail.id],delay:52,triggered:false});
 const wallRoof=deck('secret-wall-platform',21000,21440,-2570),hiddenWall=barrier('secret-facade-wall',21440,-2570,'masonry',true);pit(20710,21000,-2100);
 const climb1=ledge('secret-normal-1',20900,21250,-2680),climb2=ledge('secret-spike-step',20530,20880,-2790);spike('secret-climb-spike',20590,-2790,50);
 const verticalLift=ledge('secret-vertical-lift',20980,21370,-2950,{kind:'moving',cityType:'freight-lift',motion:{axis:'y',amp:85,period:280,phase:Math.PI/2}});
 const climbRight=ledge('secret-right-ledge',21530,21860,-3080),secretExit=deck('secret-shared-rooftop',22040,22820,-3190);
 challenge('secret-normal-climb','TRANSIT SERVICE CLIMB',[wallRoof.id,climb1.id,climb2.id,verticalLift.id,climbRight.id,secretExit.id]);
 const hidden1=deck('secret-rail-down',21440,21800,-2570,-2380,{kind:'express',grindable:true,cityType:'grind-rail',sealedBy:hiddenWall.id}),hidden2=deck('secret-rail-bottom',21800,22100,-2380,-2380,{kind:'express',grindable:true,cityType:'grind-rail',sealedBy:hiddenWall.id}),hidden3=deck('secret-rail-up',22100,22520,-2380,-3190,{kind:'express',grindable:true,cityType:'grind-rail',sealedBy:hiddenWall.id});
 // End at the rooftop seam rather than fling the player out of its far edge.
 deck('secret-rail-merge',22520,22660,-3190,-3190,{kind:'express',grindable:true,cityType:'grind-rail',sealedBy:hiddenWall.id});
 body('secret-transit-building',21440,-3270,1420,{gateId:hiddenWall.id,secret:true,rooms:[{x1:21440,x2:22520,y:-2580,bottom:-2330,sloped:true}]});
 face('secret-upper-facade',21440,-2990,32,288);face('secret-lower-facade',21440,-2570,32,1300);mark(secretExit,22700,'06 / NEON SWITCHBACK');

 // Original compact switchback: no lower rescue; alternating direction gains height.
 const neonSteps=[secretExit.id];for(const [i,x,y] of [[0,23000,-3300],[1,23480,-3410],[2,23110,-3520],[3,22750,-3630],[4,23100,-3740],[5,23500,-3850]]){const s=ledge('neon-'+i,x,x+300,y,{...(i===2?{kind:'moving',motion:{axis:'x',amp:32,period:240,phase:0}}:{}),cityType:i%2?'fire-escape':'scaffold'});neonSteps.push(s.id)}
 const neonVentRoof=deck('neon-vent-roof',23980,24450,-3960);neonSteps.push(neonVentRoof.id);challenge('neon-climb','NEON SWITCHBACK',neonSteps);
 body('neon-tower',23100,-3970,780,{landmark:'NEON WORKS'});pit(22820,23980,-2920);
 const crown=deck('neon-high-crown',24650,25130,-4600);vent('neon-roof-vent',neonVentRoof,24260,31,crown,{airSpeedLimit:6.5});pit(24450,24650,-3420);mark(crown,24830,'07 / FRACTURE CROWN');
 const fractureSteps=[crown.id];for(const [i,x,y] of [[0,25270,-4710],[1,25620,-4820],[2,25220,-4930],[3,25670,-5040]]){const s=ledge('fracture-'+i,x,x+280,y,{kind:i===1?'crumble':'main',cityType:i===1?'broken-bridge':'fire-escape'});fractureSteps.push(s.id)}
 const hoist=ledge('fracture-hoist',26060,26410,-5170,{kind:'moving',cityType:'crane-hoist',motion:{axis:'y',amp:45,period:270,phase:0}}),roofLaunch=deck('fracture-vent-roof',26590,27080,-5280);fractureSteps.push(hoist.id,roofLaunch.id);challenge('fracture-climb','FRACTURE CROWN',fractureSteps);pit(25130,26590,-4230);
 body('fracture-building',25750,-5290,540,{landmark:'EAST WORKSITE'});bot('fracture-drone',25700,-4880,'drone');
 const summitEntry=deck('summit-entry',27290,27790,-5920);vent('fracture-high-vent',roofLaunch,26880,31,summitEntry);mark(summitEntry,27500,'08 / SUMMIT TRANSFER');pit(27080,27290,-4750);
 const sum1=ledge('summit-1',27930,28200,-6030),sum2=ledge('summit-2',27600,27900,-6140),sum3=ledge('summit-3',28080,28380,-6250),arenaDeck=deck('summit-arena',28540,30000,-6360);
 challenge('summit-climb','SUMMIT TRANSFER',[summitEntry.id,sum1.id,sum2.id,sum3.id,arenaDeck.id]);pit(27790,28540,-5500);body('summit-access',28100,-6370,320,{landmark:'HELIPAD ACCESS'});

 const restored=restoreCityDistricts({surfaces,hazards,enemies,pads,springs,rings,signs,checkpoints,sectors,loops,debris,events,buildings,routeChallenges,deathZones,collapseGroups});
 for(const s of surfaces)if(!s.pitSecret&&!s.id.match(/^(under-attack|skyline-fork|split-skyline|city-climax)-/))line(s,s.x2-s.x1>650?100:68);
 for(const c of routeChallenges){const last=surfaces.find(s=>s.id===c.steps.at(-1));c.exitX=last.x1;c.exitY=last.y1;const first=surfaces.find(s=>s.id===c.entryId);c.entryX=first.x1+40;c.x1=Math.min(...c.steps.map(id=>surfaces.find(s=>s.id===id).x1));c.x2=Math.max(...c.steps.map(id=>surfaces.find(s=>s.id===id).x2));}
 const routeCues=routeChallenges.flatMap(c=>c.steps.slice(0,-1).map((id,i)=>({id,nextId:c.steps[i+1]})));
 const {end,arena,restoredSections}=restored;
 return {act:2,title:'INFERNO ASCENT',verticalCity:true,end,arena,restoredSections,surfaces,hazards,enemies,pads,springs,rings,signs,checkpoints,sectors,loops,debris,events,buildings,routeChallenges,challenges:routeChallenges,ventSections:[ventSection],drawnSections,routeCues,deathZones,collapseGroups,
 floorAt(x){const a=sectors[Math.max(0,sectors.findLastIndex(s=>s.x<=x))];return a.y}}
}
