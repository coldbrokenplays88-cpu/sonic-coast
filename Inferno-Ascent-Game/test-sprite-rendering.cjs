const {test}=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
function renderer(){
 const draws=[],canvases=[];
 const context={imageSmoothingEnabled:true,getTransform:()=>({a:1.6,b:0,c:0,d:1.6,e:320.4,f:200.7}),save(){},restore(){},setTransform(...v){this.transform=v},translate(){},scale(){},rotate(){},drawImage(...v){draws.push(v)},getImageData(x,y,w,h){return {data:new Uint8ClampedArray(w*h*4).fill(255)}},putImageData(){}};
 const document={createElement(){const c={width:0,height:0,getContext:()=>context};canvases.push(c);return c;}};
 const c=vm.createContext({document,ctx:context,art:{recoveredSpeedster:{}},p:{ground:true},supplementalSpriteFrames:{},Image:class{}});
 for(const f of ['recovered-art.js','ending-frames.js','ending-art.js','boss-art.js'])vm.runInContext(fs.readFileSync(f,'utf8'),c,{filename:f});
 return {run:s=>vm.runInContext(s,c),draws,canvases,context};
}
test('gameplay crops retain source pixels instead of shrinking before display',()=>{
 const r=renderer();r.run("drawRecoveredSonicFrame({sheet:'recoveredSpeedster',frame:16})");
 assert.deepEqual(r.canvases.map(c=>[c.width,c.height]),[[131,178]]);
 const draw=r.draws.at(-1);assert.deepEqual(draw.slice(-4),[-25,-59,44,59],'the standing pose keeps its exact prior footprint');
 assert.equal(r.context.imageSmoothingEnabled,false);
});
test('rolling keeps its diameter and foot position while retaining source crop detail',()=>{
 const r=renderer();r.run("drawRecoveredSonicFrame({sheet:'recoveredSpeedster',frame:26,ball:true,diameter:38,rotation:.2})");
 assert.deepEqual(r.canvases.map(c=>[c.width,c.height]),[[119,114]]);
 assert.deepEqual(r.draws.at(-1).slice(-4),[-19,-18,38,36]);
 assert.deepEqual(r.context.transform,[2,0,0,2,320,210]);
});
test('cutscene cache retains source-resolution cels without changing anchors or size',()=>{
 const r=renderer();r.run("prepareEndingArt('sonic',{width:1536,height:1024});endingActor({visible:true,sheet:'sonic',frame:0,x:0,y:0})");
 assert.deepEqual(r.run('JSON.stringify([endingSprites.get("sonic")[0].image.width,endingSprites.get("sonic")[0].image.height])'),'[168,220]');
 assert.deepEqual(r.draws.at(-1).slice(-4),[-27,-62,47,62]);
});
test('boss armor crops retain full resolution for direct final rendering',()=>{
 const r=renderer();r.run('prepareScorpionArt({width:1536,height:1024})');
 assert.deepEqual(r.canvases.map(c=>[c.width,c.height])[0],[414,378]);
});
test('boss rendering preserves the previous odd-height part anchor',()=>{
 const r=renderer();r.run("prepareScorpionArt({width:1536,height:1024});scorpionPart('body',400,200)");
 assert.deepEqual(r.draws.at(-1).slice(-4),[-132,-120,264,242]);
});
test('warm gameplay and boss frames allocate no extra canvases',()=>{
 const r=renderer();r.run("prepareScorpionArt({width:1536,height:1024});drawRecoveredSonicFrame({sheet:'recoveredSpeedster',frame:16});scorpionPart('jaw',400,200,.65)");const count=r.canvases.length;
 r.run("for(let i=0;i<60;i++){drawRecoveredSonicFrame({sheet:'recoveredSpeedster',frame:16});scorpionPart('jaw',400,200,.65)}");assert.equal(r.canvases.length,count);
});
