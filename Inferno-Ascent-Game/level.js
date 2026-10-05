'use strict';
// Distances and positions use the game's 960 × 540 world units.
// Each district has an authored fast route and a recoverable lower route.
function makeLevel(){
 const surfaces=[],hazards=[],enemies=[],pads=[],rings=[],signs=[],checkpoints=[],sectors=[];
 let serial=0;
 function rail(x1,x2,y1=420,y2=y1,kind='main',extra={}){const s={id:'rail-'+serial++,x1,x2,y1,y2,kind,...extra};surfaces.push(s);return s}
 function line(x1,x2,y,kind='main',extra={}){return rail(x1,x2,y,y,kind,extra)}
 function ringLine(x1,x2,y,spacing=65){for(let x=x1;x<x2;x+=spacing)rings.push({x,y,taken:false})}
 function arc(x1,x2,y,height=105){for(let i=0;i<=7;i++)rings.push({x:x1+(x2-x1)*i/7,y:y-35-Math.sin(i*Math.PI/7)*height,taken:false})}
 function label(x,y,text,type='jump'){signs.push({x,y,text,type})}
 function spikes(x,y,w=90){hazards.push({id:'spike-'+serial++,type:'spikes',x:x-w/2,y:y-25,w,h:25});label(x-600,y-85,'JUMP','jump')}
 function gate(x1,x2,y){hazards.push({id:'gate-'+serial++,type:'gate',x:x1,y:y-210,w:x2-x1,h:177,floor:y});label(x1-650,y-76,'ROLL  ↓','roll')}
 function crab(x,y,extra={}){enemies.push({id:'bot-'+serial++,kind:'crab',base:x,x,y,baseY:y,range:18,...extra})}
 function drone(x,y,extra={}){enemies.push({id:'bot-'+serial++,kind:'drone',base:x,x,y,baseY:y,range:26,...extra})}
 function boostPad(x,y){pads.push({x,y});}
 function recovery(a,b,y=550){return line(a,b,y,'recovery')}
 function upper(a,b,y,extra={}){return line(a,b,y,'express',extra)}
 function sector(x,name,hint){sectors.push({x,name,hint});checkpoints.push({x:x+100,y:420,name});label(x+260,340,name,'sector')}

 // Existing districts, with teaching moments separated by real jump/reaction distances.
 sector(0,'01 / SWITCHBACK','Build speed. Jump the spikes, then roll through the pink tunnel.');
 line(0,2500);rail(2500,2750,420,355);line(3100,4400);
 spikes(900,420,86);gate(2250,2470,420);
 upper(3000,3800,230,{routeType:'skill'});rail(3800,4140,230,420,'express',{routeType:'skill'});
 recovery(2810,3180,550);rail(3180,3530,550,420,'recovery');
 label(2530,280,'HOLD JUMP / HIGH ROAD','express');arc(2710,3220,355,90);
 ringLine(350,680,378);ringLine(1250,1850,378,90);ringLine(3110,3720,188,72);crab(3890,402);

 sector(4400,'02 / BROKEN BEAT','Hold Jump to take the high road. Short hops keep you on the amber bridge.');
 line(4400,5400);rail(5400,5650,420,360);line(5990,6290,390,'crumble');line(6620,8800);
 spikes(4950,420,86);
 upper(6000,7050,220,{routeType:'skill'});rail(7050,7450,220,420,'express',{routeType:'skill'});
 recovery(5710,6040,550);recovery(6350,6720,550);rail(6720,7070,550,420,'recovery');
 label(5470,280,'CHOOSE YOUR JUMP','express');arc(5610,6080,360,80);arc(6250,6700,390,85);
 gate(7600,7830,420);spikes(8500,420,86);
 ringLine(4570,4790,378);ringLine(6090,6890,178,80);ringLine(6870,7230,378);ringLine(7980,8270,378);

 sector(8800,'03 / LONG SHOT','Save boost for the launch. Gold express rails give you room to enjoy your speed.');
 line(8800,10000);rail(10000,10250,420,345);line(10600,11350);line(11700,11950,400,'crumble');line(12300,14500);
 spikes(9350,420,86);
 upper(11000,13700,205,{routeType:'boost',entrySpeed:20});rail(13700,14250,205,420,'express',{routeType:'boost'});
 recovery(10300,10670,545);rail(10670,11020,545,420,'recovery');
 recovery(11400,11760,550);recovery(12000,12380,550);rail(12380,12800,550,420,'recovery');
 label(9750,280,'SAVE BOOST / LONG SHOT','express');label(10940,155,'BOOST EXPRESS','express');arc(10220,11200,345,155);
 label(10950,345,'NORMAL ROAD / TWO JUMPS','jump');arc(11310,11780,420,90);arc(11900,12450,400,95);
 gate(13400,13620,420);crab(15150,402);
 ringLine(8930,9190,378);ringLine(9610,9940,378);ringLine(11120,13570,163,180);ringLine(12500,12700,378);

 sector(14500,'04 / ROBOT RELAY','Jump onto the marked drone. Hold Jump on impact to rebound onto the skill route.');
 line(14500,15500);rail(15500,15750,420,360);line(16100,16400,410,'crumble');line(16740,17580);
 line(17880,18100,390,'crumble');line(18420,19200);
 upper(16400,17400,205,{routeType:'skill'});rail(17400,18420,205,420,'express',{routeType:'skill'});
 recovery(15810,16190,550);recovery(16460,16820,550);rail(16820,17180,550,420,'recovery');
 recovery(17640,17990,550);recovery(18160,18520,550);rail(18520,18820,550,420,'recovery');
 drone(16330,290,{bounceRoute:true,range:12});crab(17100,402);
 label(15400,290,'ENEMY REBOUND / HIGH ROAD','express');arc(15710,16200,360,95);arc(17540,18000,420,85);
 ringLine(14800,15280,378);ringLine(16520,17300,163,80);ringLine(16830,17000,378);ringLine(18560,18730,378);

 sector(19200,'05 / SHIFTING SKY','Roll, then release. Jump across the green rails; missed landings have a lower way back.');
 line(19200,20400);rail(20400,20650,420,355);line(22200,22800);
 gate(19600,19800,420);
 line(20800,21240,390,'moving',{motion:{axis:'y',amp:18,period:220,phase:.3}});
 line(21500,21920,390,'moving',{motion:{axis:'x',amp:35,period:240,phase:1.1}});
 upper(21100,21900,245,{routeType:'skill'});rail(21900,22520,245,420,'express',{routeType:'skill'});
 recovery(20700,21290,560);recovery(21300,21970,560);rail(21970,22400,560,420,'recovery');
 label(20350,280,'JUMP / MOVING RAILS','jump');arc(20610,21090,355,85);arc(21200,21620,390,90);
 ringLine(19350,19530,378);ringLine(19900,20280,378);ringLine(21320,21820,203,75);ringLine(22450,22680,378);

 sector(22800,'06 / FINAL TRANSFER','Choose the normal bridge or spend saved boost for the final express run.');
 line(22800,23800);rail(23800,24100,420,350);line(24450,25000);line(25300,25600,395,'crumble');
 line(25930,27180);line(27500,27820,390,'crumble');line(28150,29400);
 gate(23350,23580,420);
 upper(24980,28000,205,{routeType:'boost',entrySpeed:20});rail(28000,28600,205,420,'express',{routeType:'boost'});
 recovery(24150,24520,550);rail(24520,24870,550,420,'recovery');
 recovery(25060,25380,550);recovery(25660,26010,550);rail(26010,26400,550,420,'recovery');
 recovery(27240,27570,550);recovery(27880,28240,550);rail(28240,28600,550,420,'recovery');
 label(23580,280,'FINAL LAUNCH / SAVE BOOST','express');arc(24060,25080,350,155);
 label(24800,325,'NORMAL BRIDGE','jump');arc(24960,25410,420,85);arc(25560,26050,395,90);arc(27140,27600,420,90);
 ringLine(23000,23160,378);ringLine(23500,23700,378);ringLine(25120,27800,163,170);ringLine(26150,26650,378,90);ringLine(28720,29000,378);
 for(const s of surfaces)if(s.kind==='crumble'){s.crumbleDelay=42;s.crumbleTimer=-1;s.restoreAt=0}
 return {end:29000,surfaces,hazards,enemies,pads,rings,signs,checkpoints,sectors};
}
