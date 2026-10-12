const {test}=require('node:test');
const assert=require('node:assert/strict');
const {boot}=require('./test-support.cjs');
const read=(a,expression)=>JSON.parse(a.run(`JSON.stringify(${expression})`));
const near=(actual,expected)=>assert.ok(Math.abs(actual-expected)<1e-9,`${actual} != ${expected}`);

for(const act of [1,2]){
 test(`surface solver chooses the earliest crossing in act ${act}`,()=>{
  const a=boot(act);
  a.run(`const late={id:'late',x1:0,x2:500,y1:420,y2:420,kind:'main'};
   const early={...late,id:'early',y1:414,y2:414};
   level.surfaces=[late,early];level.hazards=[];visited.clear();jumpBuffer=0;
   Object.assign(p,{x:200,y:390,vx:6,vy:15,ground:false,surface:null,rolling:false});
   moveAndResolveSurfaces();`);
  assert.deepEqual(read(a,'[p.x,p.y,p.vy,p.ground,p.surface.id,p.lastX,p.lastY]'),[206,394,0,true,'early',200,390]);
 });
 test(`surface solver follows a connected slope but leaves a gap in act ${act}`,()=>{
  const a=boot(act);
  a.run(`const left={id:'left',x1:0,x2:100,y1:400,y2:400,kind:'main'};
   const slope={...left,id:'slope',x1:100,x2:200,y2:380};
   level.surfaces=[left,slope];level.hazards=[];jumpBuffer=0;
   Object.assign(p,{x:98,y:380,vx:14,vy:0,ground:true,surface:left,rolling:false});
   moveAndResolveSurfaces();`);
  assert.equal(a.run('p.surface.id'),'slope');assert.equal(a.run('p.ground'),true);
  near(a.run('p.y'),377.6);assert.equal(a.run('p.vy'),0);
  a.run(`const gap={...left,id:'gap',x1:114,x2:214};level.surfaces=[left,gap];
   Object.assign(p,{x:98,y:380,vx:14,vy:0,ground:true,surface:left});
   moveAndResolveSurfaces();`);
  assert.equal(a.run('p.x'),112);assert.equal(a.run('p.ground'),false);assert.equal(a.run('p.surface'),null);
 });
 for(const axis of ['x','y'])test(`surface carry retains its contact on moving ${axis} platforms in act ${act}`,()=>{
  const a=boot(act);
  a.run(`const moving={id:'moving',x1:100,x2:300,y1:400,y2:400,kind:'moving',motion:{axis:'${axis}',amp:20,period:100,phase:.2}};
   level.surfaces=[moving];level.hazards=[];runFrames=12;jumpBuffer=0;
   const prev=pose(moving,11),now=pose(moving,12);
   Object.assign(p,{x:(prev.x1+prev.x2)/2,y:prev.y1-20,vx:0,vy:0,ground:true,surface:moving,rolling:false});
   applySurfaceMotion();moveAndResolveSurfaces();`);
  near(a.run('p.x'),a.run('(now.x1+now.x2)/2'));near(a.run('feet()'),a.run('now.y1'));
  assert.equal(a.run('p.ground'),true);assert.equal(a.run('p.surface.id'),'moving');
 });
}
