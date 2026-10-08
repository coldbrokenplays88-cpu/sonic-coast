/* Glue to existing movement, checkpoint, camera and result systems. */
let boss=null,bossCheckpoint=false;
function setupBossEncounter(){boss=null;bossCheckpoint=false;if(level.act!==2)return;level.arena.boss=true;
 for(let i=0;i<12;i++)level.rings.push({x:level.arena.x+460+i*22,y:level.arena.y-38,taken:false,bossRing:true});
}
function bossOwnsControls(){return boss&&['entrance','destroyed','defeated'].includes(boss.state);}
function resetBossAttempt(){if(!bossCheckpoint||level.act!==2)return;
 boss=window.createEggScorpion(level.arena);boss.state='idle';boss.anchored=true;boss.age=0;keys.clear();p.inv=100;boost=BOOST_MAX;
}
function updateBossEncounter(){
 if(level.act!==2)return;
 if(!boss){if(p.ground&&p.surface?.id==='summit-arena'&&p.x>=level.arena.x+330){
   boss=window.createEggScorpion(level.arena);boss.arrivalTime=clock;bossCheckpoint=true;
   const c={x:level.arena.x+410,y:level.arena.y,surfaceId:'summit-arena',name:'EGG SCORPION',hint:'Jump at the eyes after the bite.'};
   level.checkpoints.push(c);checkpoint=level.checkpoints.length-1;keys.clear();charge=0;p.vx=0;p.vy=0;p.boosting=false;
   notify('EGG SCORPION');gameSound('bossReveal');
  }return;
 }
 window.tickEggScorpion(boss,p);
 if(boss.event==='idle'&&boss.sequence===1){gameSound('bossAnchor');shake=6;sparks(boss.x-155,boss.y,18,'#b2b5c2');sparks(boss.x+155,boss.y,18,'#b2b5c2');notify('Dodge the strikes • Jump at the eyes after a bite');}
 if(['tail-windup','bite-windup','laser-windup'].includes(boss.event))gameSound('warning');
 if(boss.event==='tail-strike'){gameSound('bossStrike');shake=3;}
 if(boss.state==='tail-strike'&&boss.age===9){shake=5;sparks(boss.target.x,boss.y,20,'#ffbd76');}
 if(boss.event==='bite-lunge')gameSound('bossBite');
 if(boss.event==='laser-fire')gameSound('bossLaser');
 if(window.damageEggScorpion(boss,p)){score+=1500;p.vy=-9;p.jumpAttack=false;p.poseJumpFrame=runFrames;p.inv=Math.max(p.inv,24);shake=5;gameSound('bossHit');const g=window.scorpionGeometry(boss);sparks(g.head.x,g.head.y,24,'#6de7ff');
  if(boss.hits===2)notify('GLASS SHATTERED • LASER TAIL ONLINE');if(boss.hits===3){keys.clear();p.vx=0;charge=0;gameSound('bossBreak');}
 }else if(!p.inv&&window.scorpionDanger(boss,p))hurt(window.scorpionGeometry(boss).head.x);
 if(bossOwnsControls()){keys.clear();charge=0;p.vx=0;p.boosting=false;}
 else {const left=level.arena.x+250,right=level.arena.x+1300;if(p.x<left){p.x=left;p.vx=Math.max(0,p.vx);}if(p.x>right){p.x=right;p.vx=Math.min(0,p.vx);}}
}
function frameBossCamera(){if(!boss)return false;
 const targetZoom=.80;zoom+=(targetZoom-zoom)*.035;const targetX=level.arena.x+210,targetY=level.arena.y-505;
 cam+=Math.max(-14,Math.min(14,(targetX-cam)*.07));camY+=Math.max(-12,Math.min(12,(targetY-camY)*.07));return true;
}
function drawBossEncounter(){if(!boss)return;renderEggScorpion(boss);
 if(!['entrance','destroyed','defeated'].includes(boss.state)){drawPixelSign(level.arena.x+760,level.arena.y-400,'EGG SCORPION','danger');for(let i=0;i<3;i++)cityPixelRect(level.arena.x+690+i*48,level.arena.y-380,36,6,i<3-boss.hits?'#ff614d':'#354052');}
}
