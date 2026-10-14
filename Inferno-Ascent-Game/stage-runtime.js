'use strict';
// Explicit existing-stage integration. Adapters are selected once per setup;
// their methods execute synchronously at the controller's established phases.
let stageRuntime=null;

const neonExpressAct1Runtime={
 reset(){},
 motion(){return false},
 beforeLanding(s){},
 afterLanding(s){},
 updateWorld(){},
 enemyDamage(e){},
 deathLimit(){return 800},
 completion(){
  if(p.x>=END&&((p.ground&&p.surface?.kind==='main')||(p.landFrame===runFrames&&p.landKind==='main')))finishAct();
 }
};

const neonExpressAct2Runtime={
 reset(){resetAct2();resetBlimpRoute()},
 motion(){return updateMiddleMotion()},
 beforeLanding(s){
  if(p.wrongRouteDrop&&s.fallen){p.wrongRouteDrop=false;p.vx=0;}
 },
 afterLanding(s){
  onBlimpLanding(s);
  if(s.poolCurve){p.poolApproach=false;p.rolling=true;p.roll=true;p.rollAge=0;p.lowRollFrames=0;}
 },
 updateWorld(){updateAct2();updateMiddleSection()},
 enemyDamage(e){
  if(e.id==='mid-wrong-way-guard'&&p.hurt&&mode==='playing')beginWrongRouteDrop();
 },
 deathLimit(){return level.floorAt(p.x)+950},
 completion(){if(boss?.state==='defeated')beginEndingScene()}
};

function selectStageRuntime(){
 // The shipped Act 1 builder predates explicit act metadata; keep its schema.
 if(level.act===1||(level.act===undefined&&selectedAct===1))stageRuntime=neonExpressAct1Runtime;
 else if(level.act===2)stageRuntime=neonExpressAct2Runtime;
 else throw Error('Unsupported stage act: '+level.act);
}

function resetStageRuntime(){stageRuntime.reset()}
function updateStageMotion(){return stageRuntime.motion()}
function beforeStageLanding(s){stageRuntime.beforeLanding(s)}
function afterStageLanding(s){stageRuntime.afterLanding(s)}
function updateStageWorld(){stageRuntime.updateWorld()}
function handleStageEnemyDamage(e){stageRuntime.enemyDamage(e)}
function stageDeathLimit(){return stageRuntime.deathLimit()}
function updateStageCompletion(){stageRuntime.completion()}
