'use strict';
// Keep visual state separate from input, collision bodies and movement.
function recoveredSonicPose(){
 const speed=p.loop?p.loop.speed:Math.abs(p.vx),face=p.face;
 const sheet=art.recoveredSpeedster?'recoveredSpeedster':'recoveredPeelout';
 const out=(state,frame,extra={})=>({state,frame,face,sheet,rotation:0,ball:false,...extra});
 const fastSheet=art.recoveredPeelout?'recoveredPeelout':sheet;
 if(p.hurt)return out('hurt',39);
 if(p.ground&&p.surface?.grindable){const entry=runFrames-p.grindEntryFrame;if(art.supplemental&&entry>=0&&entry<4)return out('grind-entry',24+Math.floor(entry/2),{sheet:'supplemental',face:Math.sign(p.vx)||face,rotation:Math.atan(pose(p.surface).slope)*(Math.sign(p.vx)||face)});const fast=p.boosting||speed>18||(p.grindFast&&speed>16);return out(fast?'grind-fast':'grind',art.supplemental?16+Math.floor(runFrames/(fast?2:4))%8:[35,36,37][Math.floor(runFrames/3)%3],{sheet:art.supplemental?'supplemental':fastSheet,face:Math.sign(p.vx)||face,rotation:Math.atan(pose(p.surface).slope)*(Math.sign(p.vx)||face)})}
 if(charge&&art.supplemental)return out('charge',30+Math.floor(runFrames/4)%2,{sheet:'supplemental'});
 if(p.rolling||charge)return out('roll',26+Math.floor(charge?runFrames/2:anim*.6)%3,{ball:true,diameter:p.ground?28:38,rotation:anim*.22});
 if(!p.ground){const exit=runFrames-p.grindExitFrame;if(art.supplemental&&exit>=0&&exit<4)return out('grind-exit',26+Math.floor(exit/2),{sheet:'supplemental'});const age=runFrames-p.poseJumpFrame;
  if(age>=0&&age<4&&p.vy<0)return out('takeoff',25);
  if(p.vy<-3)return out('rise',26+Math.floor(runFrames/3)%3,{ball:true,diameter:38,rotation:anim*.04});
  if(p.vy<3)return out('apex',26+Math.floor(runFrames/3)%3,{ball:true,diameter:38,rotation:anim*.04});
  return out('fall',29+Math.floor(runFrames/5)%2);
 }
 const dir=Number(keys.has('ArrowRight')||keys.has('KeyD'))-Number(keys.has('ArrowLeft')||keys.has('KeyA'));
 if(!p.loop&&!p.boosting&&((p.brakeActive&&speed>.03)||(dir&&speed>2&&dir!==Math.sign(p.vx))))return out('brake',32+Math.min(5,Math.floor((p.brakeAge||0)/4)),{face:p.brakeActive?p.brakeFace:Math.sign(p.vx)});
 if(!p.loop&&!dir&&!p.boosting&&speed<.5&&runFrames-p.stopFrame<12)return out('stop',38);
 if(runFrames-p.poseLandingFrame>=0&&runFrames-p.poseLandingFrame<6)return art.supplemental?out('land',28+Math.floor((runFrames-p.poseLandingFrame)/3),{sheet:'supplemental'}):out('land',31);
 if(p.boosting)return out('boost',8+Math.floor(runFrames/2)%8,{sheet:art.supplemental?'supplemental':fastSheet});
 if(speed>=12&&art.peeloutCycle)return out('run-fast',Math.floor(anim*.6)%8,{sheet:'peeloutCycle'});
 if(speed>.5)return out('run',Math.floor(anim*.48)%8,{sheet:speed>12?fastSheet:sheet});
 const phase=runFrames%240;return out('idle',phase<180?16:phase<190?17:phase<220?18:19);
}

// Cache untouched source pixels; keep the established display dimensions and anchors.
// Original images stay intact; resizing never allocates work during a warm frame.
const recoveredSpriteTextures=new Map();
function drawRecoveredSonicFrame(q){
 const descriptor=recoveredSpriteFrames[q.sheet][q.frame],im=art[q.sheet];
 const [left,top,right,bottom]=descriptor.bounds,sw=right-left,sh=bottom-top;
 const key=q.sheet+'/'+q.frame+'/'+(q.ball?q.diameter:0);
 let sprite=recoveredSpriteTextures.get(key);
 if(!sprite){
  const scale=q.ball?q.diameter/Math.max(sw,sh):(descriptor.scale??1/3);
  const image=document.createElement('canvas');image.width=sw;image.height=sh;
  const width=Math.max(1,Math.round(sw*scale)),height=Math.max(1,Math.round(sh*scale));
  const dc=image.getContext('2d');dc.imageSmoothingEnabled=false;dc.drawImage(im,left,top,sw,sh,0,0,sw,sh);
  sprite={image,width,height,x:Math.round(descriptor.anchor[0]*scale),y:Math.round(descriptor.anchor[1]*scale)};recoveredSpriteTextures.set(key,sprite);
 }
 const transform=ctx.getTransform(),worldScale=Math.hypot(transform.a,transform.b),integerScale=Math.max(1,Math.round(worldScale)),ratio=integerScale/worldScale;
 const foot=q.ball?(p.ground?6:1):20;
 ctx.save();ctx.setTransform(transform.a*ratio,transform.b*ratio,transform.c*ratio,transform.d*ratio,Math.round(transform.e+transform.c*foot),Math.round(transform.f+transform.d*foot));
 if(q.rotation)ctx.rotate(q.rotation);
 ctx.imageSmoothingEnabled=false;
 ctx.drawImage(sprite.image,q.ball?-Math.round(sprite.width/2):-sprite.x,q.ball?-Math.round(sprite.height/2):-sprite.y,sprite.width,sprite.height);
 ctx.restore();
}
// Source rectangles and stable body/foot anchors for the untouched October 7 atlases.
const recoveredSpriteFrames={"recoveredSpeedster":[{"bounds":[20,30,168,175],"anchor":[79,153]},{"bounds":[197,29,346,183],"anchor":[83,154]},{"bounds":[382,29,536,185],"anchor":[84,154]},{"bounds":[560,28,710,183],"anchor":[90,155]},{"bounds":[737,30,891,183],"anchor":[92,153]},{"bounds":[916,26,1082,183],"anchor":[92,157]},{"bounds":[1107,28,1254,180],"anchor":[88,155]},{"bounds":[1282,24,1434,183],"anchor":[96,159]},{"bounds":[22,200,179,344],"anchor":[81,149]},{"bounds":[198,203,356,338],"anchor":[87,146]},{"bounds":[376,202,538,347],"anchor":[89,147]},{"bounds":[562,205,716,347],"anchor":[88,144]},{"bounds":[740,206,903,350],"anchor":[89,143]},{"bounds":[914,205,1078,350],"anchor":[95,144]},{"bounds":[1100,203,1256,350],"anchor":[94,146]},{"bounds":[1281,203,1431,351],"anchor":[89,146]},{"bounds":[20,362,151,540],"anchor":[74,177]},{"bounds":[202,360,344,540],"anchor":[76,179]},{"bounds":[385,364,527,541],"anchor":[78,175]},{"bounds":[558,364,709,541],"anchor":[89,175]},{"bounds":[737,363,913,540],"anchor":[89,176]},{"bounds":[919,364,1090,540],"anchor":[90,175]},{"bounds":[1103,360,1251,540],"anchor":[85,179]},{"bounds":[1284,370,1427,540],"anchor":[91,169]},{"bounds":[21,594,163,721],"anchor":[84,125]},{"bounds":[185,555,356,721],"anchor":[92,164]},{"bounds":[406,607,525,721],"anchor":[59,112]},{"bounds":[585,606,706,722],"anchor":[65,113]},{"bounds":[762,605,883,721],"anchor":[67,114]},{"bounds":[905,547,1086,713],"anchor":[98,172]},{"bounds":[1104,567,1258,718],"anchor":[96,152]},{"bounds":[1279,596,1434,721],"anchor":[91,123]},{"bounds":[20,734,171,880],"anchor":[80,147]},{"bounds":[190,732,365,882],"anchor":[92,149]},{"bounds":[372,734,547,882],"anchor":[94,147]},{"bounds":[551,747,744,882],"anchor":[94,134]},{"bounds":[744,735,921,877],"anchor":[81,146]},{"bounds":[914,745,1097,882],"anchor":[93,136]},{"bounds":[1112,732,1251,883],"anchor":[68,149]},{"bounds":[1271,743,1440,878],"anchor":[89,138]},{"bounds":[21,892,193,1073],"anchor":[74,181]},{"bounds":[208,889,342,1072],"anchor":[75,184]},{"bounds":[379,894,531,1072],"anchor":[88,179]},{"bounds":[555,901,722,1073],"anchor":[93,172]},{"bounds":[741,892,895,1073],"anchor":[86,181]},{"bounds":[929,890,1067,1075],"anchor":[79,183]},{"bounds":[1114,897,1243,1075],"anchor":[71,176]},{"bounds":[1273,899,1432,1075],"anchor":[102,174]}],"recoveredPeelout":[{"bounds":[18,29,174,177],"anchor":[81,154]},{"bounds":[193,27,354,184],"anchor":[87,156]},{"bounds":[375,27,541,187],"anchor":[91,156]},{"bounds":[555,28,713,187],"anchor":[95,155]},{"bounds":[732,29,895,184],"anchor":[97,154]},{"bounds":[911,26,1088,185],"anchor":[97,157]},{"bounds":[1099,27,1260,184],"anchor":[96,156]},{"bounds":[1270,25,1436,187],"anchor":[108,158]},{"bounds":[20,200,182,346],"anchor":[83,149]},{"bounds":[197,202,360,341],"anchor":[88,147]},{"bounds":[375,202,542,349],"anchor":[90,147]},{"bounds":[563,204,718,350],"anchor":[87,145]},{"bounds":[740,206,905,354],"anchor":[89,143]},{"bounds":[917,203,1084,354],"anchor":[92,146]},{"bounds":[1101,201,1261,352],"anchor":[93,148]},{"bounds":[1278,202,1432,356],"anchor":[92,147]},{"bounds":[19,362,156,541],"anchor":[75,177]},{"bounds":[199,360,350,542],"anchor":[79,179]},{"bounds":[386,364,531,543],"anchor":[77,175]},{"bounds":[557,364,713,543],"anchor":[90,175]},{"bounds":[739,363,915,542],"anchor":[87,176]},{"bounds":[923,364,1095,543],"anchor":[86,175]},{"bounds":[1107,363,1255,542],"anchor":[81,176]},{"bounds":[1282,371,1429,541],"anchor":[93,168]},{"bounds":[19,592,164,723],"anchor":[86,127]},{"bounds":[185,553,362,723],"anchor":[92,166]},{"bounds":[404,605,532,727],"anchor":[61,114]},{"bounds":[583,605,711,726],"anchor":[67,114]},{"bounds":[758,605,888,728],"anchor":[71,114]},{"bounds":[906,548,1091,715],"anchor":[97,171]},{"bounds":[1104,566,1261,720],"anchor":[96,153]},{"bounds":[1279,594,1436,722],"anchor":[91,125]},{"bounds":[18,733,174,880],"anchor":[82,148]},{"bounds":[188,733,370,885],"anchor":[94,148]},{"bounds":[372,735,551,885],"anchor":[94,146]},{"bounds":[550,746,750,884],"anchor":[95,135]},{"bounds":[746,735,925,879],"anchor":[79,146]},{"bounds":[915,744,1099,884],"anchor":[92,137]},{"bounds":[1115,732,1255,885],"anchor":[65,149]},{"bounds":[1273,740,1443,879],"anchor":[87,141]},{"bounds":[20,891,193,1074],"anchor":[75,182]},{"bounds":[207,889,348,1074],"anchor":[76,184]},{"bounds":[376,895,535,1074],"anchor":[91,178]},{"bounds":[555,899,725,1074],"anchor":[93,174]},{"bounds":[742,891,897,1074],"anchor":[85,182]},{"bounds":[928,891,1072,1076],"anchor":[80,182]},{"bounds":[1114,895,1246,1076],"anchor":[71,178]},{"bounds":[1275,898,1435,1076],"anchor":[100,175]}]};

Object.assign(recoveredSpriteFrames,supplementalSpriteFrames);
