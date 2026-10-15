const {test}=require('node:test');
const assert=require('node:assert/strict');
const {boot}=require('./test-support.cjs');

function visibleRects(a){
 const b=a.run('({left:cam,top:camY,right:cam+W/zoom,bottom:camY+H/zoom})');
 return a.rects.filter(([x,y,w,h])=>w>0&&h>0&&x+w>b.left&&x<b.right&&y+h>b.top&&y<b.bottom);
}

for(const zoom of [1,.94,.78]){
test(`zoom ${zoom}: carrier overhead track remains visible while its moving deck is off screen`,()=>{
 const a=boot();a.run(`const s=surfaceById('draw-moving-carrier');level.surfaces=[s];level.buildings=[];
  zoom=${zoom};runFrames=210;cam=s.x1-s.motion.amp-W/zoom+300;camY=s.y1-240;
  if(pose(s).x1<=cam+W/zoom)throw Error('deck must be off screen');drawPixelCityStructures();`);
 assert.ok(visibleRects(a).length>0,'visible fixed track must not depend on deck visibility');
});

test(`zoom ${zoom}: lift guides remain visible when the lift is below the viewport`,()=>{
 const a=boot();a.run(`const s=surfaceById('skyline-fork-lift-service-broadcast-tower');level.surfaces=[s];level.buildings=[];
  zoom=${zoom};runFrames=0;cam=s.x1-400;camY=s.y1-s.motion.amp-40-H/zoom+140;
  if(pose(s).y1<=camY+H/zoom)throw Error('deck must be below screen');drawPixelCityStructures();`);
 assert.ok(visibleRects(a).length>0,'visible guide rails must survive deck culling');
});

test(`zoom ${zoom}: wreck smoke remains visible before the blimp body enters the bottom of the viewport`,()=>{
 const a=boot();a.run(`const s=surfaceById('blimp-curve-0');zoom=${zoom};step=100;
  cam=s.x1-200;camY=s.y1-140-H/zoom;drawBlimpRoute();`);
 assert.ok(visibleRects(a).length>0,'smoke above the wreck must be drawn independently of body visibility');
});

test(`zoom ${zoom}: pool tower smoke remains visible before the tower roof enters the viewport`,()=>{
 const a=boot();a.run(`const m=level.middleSection;zoom=${zoom};step=100;
  cam=m.pool.x1-600;camY=m.base-510-H/zoom;drawMiddleSection();`);
 assert.ok(visibleRects(a).length>0,'tower smoke must not pop in with the roof');
});
}

test('moving support structures still cull when their entire travel range is off screen',()=>{
 for(const id of ['draw-moving-carrier','skyline-fork-lift-service-broadcast-tower']){
  const a=boot();a.run(`const s=surfaceById('${id}');level.surfaces=[s];level.buildings=[];
   cam=s.x2+3000;camY=s.y1-200;drawPixelCityStructures();`);
  assert.equal(a.rects.length,0,id);
 }
});

test('undiscovered secret platforms remain hidden by both structure and deck renderers',()=>{
 const a=boot();a.run(`const s=level.surfaces.find(s=>s.secretDepth===5);level.surfaces=[s];level.buildings=[];
  cam=s.x1-200;camY=s.y1-200;zoom=1;drawPixelCityStructures();drawRail(s);`);
 assert.equal(a.rects.length,0);
 a.run('level.middleSection.secretRevealed=true;drawPixelCityStructures();drawRail(s)');
 assert.ok(visibleRects(a).length>0);
});
