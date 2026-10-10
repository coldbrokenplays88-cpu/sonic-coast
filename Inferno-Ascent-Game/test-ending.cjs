const {test}=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs');
function api(){assert.ok(fs.existsSync('./ending-scene.js'),'ending scene timeline must exist');return require('./ending-scene.js');}
function scene(){return api().createEndingScene({x:1000,y:-500,w:1460},{x:1600},{x:1210,y:-1005,zoom:.8});}
function at(name,age=0){const s=scene(),a=api();while(s.beat!==name&&!s.done)a.tickEndingScene(s);for(let i=0;i<age;i++)a.tickEndingScene(s);return {s,pose:a.endingPose(s)};}
test('the continuous ending follows every approved beat exactly once before finishing',()=>{
 const a=api(),s=scene(),order=[s.beat];for(let i=0;i<2000&&!s.done;i++){const before=s.beat;a.tickEndingScene(s);if(s.beat!==before)order.push(s.beat);}
 assert.deepEqual(order,['escape','aim','rocket','kick','return','explode','jetpack','offer','approach','nod','annoy','swing','realize','vanish','sigh','end']);assert.equal(s.done,true);assert.ok(s.frame>=900&&s.frame<1200);
 const frame=s.frame;a.tickEndingScene(s);assert.equal(s.frame,frame,'terminal scene must not replay');
});
test('rocket meets the high kick then returns to the pod without a position discontinuity',()=>{
 const a=api(),{s,pose}=at('kick',18);assert.ok(pose.rocket);assert.equal(pose.effects.kick,true);assert.ok(Math.hypot(pose.rocket.x-pose.contact.x,pose.rocket.y-pose.contact.y)<.01);
 const position=pose.rocket;a.tickEndingScene(s);const next=a.endingPose(s).rocket;assert.ok(next.x>position.x);assert.ok(next.y<position.y);
 const impact=at('explode').pose;assert.equal(impact.pod.visible,false);assert.equal(impact.effects.explosion,true);assert.equal(impact.sonic.action,'disappointed');
});
test('the emerald is yellow and activation swings upward while Sonic is still confidently nodding',()=>{
 const invitation=at('offer',50).pose;assert.equal(invitation.emerald.color,'yellow');assert.equal(invitation.sonic.action,'unbothered');
 const early=at('swing',0).pose,late=at('swing',35).pose;
 assert.ok(late.emerald.y<early.emerald.y-25);assert.equal(early.sonic.action,'nod');assert.equal(late.sonic.action,'nod');assert.equal(late.effects.teleport,true);
 assert.equal(at('realize',25).pose.sonic.action,'confused');assert.equal(at('realize',25).pose.shadow.action,'smirk');
});
test('Sonic nods through a real frame cycle and only Sonic disappears',()=>{
 const frames=new Set();for(let age=0;age<48;age++)frames.add(at('nod',age).pose.sonic.frame);assert.ok(frames.size>=5);
 const pose=at('sigh',40).pose;assert.equal(pose.sonic.visible,false);assert.equal(pose.shadow.visible,true);assert.equal(pose.shadow.action,'sigh');assert.equal(pose.eggman.visible,false);
});
test('the rooftop camera is captured once and all actor coordinates stay finite',()=>{
 const a=api(),camera={x:1210,y:-1005,zoom:.8},s=a.createEndingScene({x:1000,y:-500},{x:1900},camera),saved={...s.camera};camera.x=0;
 for(let i=0;i<1100&&!s.done;i++){const pose=a.endingPose(s);for(const actor of [pose.sonic,pose.shadow,pose.pod,pose.eggman,pose.emerald]){assert.ok(Number.isFinite(actor.x));assert.ok(Number.isFinite(actor.y));}assert.deepEqual(s.camera,saved);a.tickEndingScene(s);}
});
test('event cues happen once at their exact timeline boundaries',()=>{
 const a=api(),s=scene(),events=[];while(!s.done){a.tickEndingScene(s);events.push(...s.events);}
 for(const cue of ['rocketFire','shadowTeleport','kickImpact','podExplosion','jetpack','emeraldOffer','chaosCharge','chaosWarp','relievedSigh'])assert.equal(events.filter(e=>e===cue).length,1,cue);
});
