const {test}=require('node:test');
const assert=require('node:assert/strict');
const {boot}=require('./test-support.cjs');

test('static surface poses are reused and refresh when authored coordinates change',()=>{
 const a=boot(1);
 assert.equal(a.run('pose(level.surfaces[0])===pose(level.surfaces[0])'),true);
 a.run('var s=level.surfaces[0];var beforePose=pose(s);s.y2+=12');
 assert.equal(a.run('pose(s).y2'),a.run('s.y2'));
 assert.notEqual(a.run('pose(s).slope'),a.run('beforePose.slope'));
});

test('topAt rejects distant roofs without computing their poses',()=>{
 const a=boot(2);
 a.run('var calls=0,originalPose=pose;pose=(...args)=>{calls++;return originalPose(...args)};topAt(-100000)');
 assert.equal(a.run('calls'),0);
});

test('air collision rejects distant roofs before pose calculations',()=>{
 const a=boot(2);
 a.run('p.x=500;p.y=-1000;p.vx=8;p.vy=1;p.ground=false;p.surface=null;var calls=0,originalPose=pose;pose=(...args)=>{calls++;return originalPose(...args)};integrateSurfaceStep(1)');
 assert.ok(a.run('calls')<40,'nearby candidates should replace a full scan of poses');
});

test('moving roofs remain candidates throughout oscillation and signed flights',()=>{
 for(const [motion,t]of [[{axis:'x',amp:400,period:100,phase:0},25],[{axis:'x',type:'flight',startedAt:0,distance:-400,speed:20},20]]){
  const a=boot(1);
  a.run(`level.surfaces=[{id:'moving',x1:600,x2:650,y1:100,y2:100,motion:${JSON.stringify(motion)}}];runFrames=${t};var q=pose(level.surfaces[0]);var x=(q.x1+q.x2)/2`);
  assert.equal(a.run("topAt(x)?.s.id"),'moving');
  a.run('p.x=x;p.y=78;p.vx=0;p.vy=4;p.surface=null;p.ground=false;integrateSurfaceStep(1)');
  assert.equal(a.run('p.ground'),true);
  assert.equal(a.run("p.surface?.id"),'moving');
 }
});

test('air sweep still lands at a platform edge within the foot radius',()=>{
 const a=boot(1);
 a.run("level.surfaces=[{id:'edge',x1:600,x2:650,y1:100,y2:100}];p.x=592;p.y=78;p.vx=0;p.vy=4;p.surface=null;p.ground=false;integrateSurfaceStep(1)");
 assert.equal(a.run("p.surface?.id"),'edge');
});
