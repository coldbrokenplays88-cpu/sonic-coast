const {test}=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
function renderer(){
 const draws=[],canvases=[];
 const context={imageSmoothingEnabled:true,getTransform:()=>({a:1.6,b:0,c:0,d:1.6,e:320.4,f:200.7}),save(){},restore(){},setTransform(...v){this.transform=v},translate(){},scale(){},rotate(){},drawImage(...v){draws.push(v)},getImageData(x,y,w,h){return {data:new Uint8ClampedArray(w*h*4).fill(255)}},putImageData(){}};
 const document={createElement(){const c={width:0,height:0,getContext:()=>context};canvases.push(c);return c;}};
 const c=vm.createContext({document,ctx:context,art:{recoveredSpeedster:{}},p:{ground:true},supplementalSpriteFrames:{},Image:class{}});
 for(const f of ['recovered-art.js','ending-frames.js','ending-polish-frames.js','ending-art.js','boss-art.js'])vm.runInContext(fs.readFileSync(f,'utf8'),c,{filename:f});
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
test('the rocket rotates around its nose so the interception point is visible',()=>{
 const r=renderer();r.run("prepareEndingArt('eggman',{width:1448,height:1086});endingActor({visible:true,sheet:'eggman',frame:9,x:0,y:0,angle:0,nose:true})");
 assert.deepEqual(r.draws.at(-1).slice(-4),[0,-13.5,63,27]);
});
test('the rocket smoke begins behind the visible tail after changing to a nose anchor',()=>{
 const r=renderer();const first=r.run(`
 prepareEndingArt('eggman',{width:1448,height:1086});
 const smoke=[];cityPixelOval=(...v)=>smoke.push(v);cityPixelRect=()=>{};
 window={endingPose:()=>({frame:0,age:0,sonic:{visible:false},shadow:{visible:false},pod:{visible:false},eggman:{visible:false},emerald:{visible:false},effects:{},rocket:{sheet:'eggman',frame:9,x:0,y:0,angle:0,nose:true}})};
 drawEndingScene({arena:{y:0}});smoke[0][0];`);
 assert.ok(first>63*1.25,'smoke must start beyond the full rendered nose-anchored rocket');
});
test('supplemental art is required before playback and keeps native cels cached',()=>{
 const r=renderer();r.run("for(const name of ['sonic','shadow','eggman'])prepareEndingArt(name,{width:1536,height:1086})");
 assert.equal(r.run('endingArtReady()'),false,'missing supplemental atlases must hold playback');
 r.run("for(const name of ['sonic-polish','shadow-polish','eggman-polish'])prepareEndingArt(name,{width:1672,height:1086})");
 assert.equal(r.run('endingArtReady()'),true);
 assert.equal(r.run('endingSprites.get("shadow-polish")[14].image.width'),219);
 const count=r.canvases.length;
 r.run("for(let i=0;i<60;i++){endingActor({visible:true,sheet:'shadow-polish',frame:14,x:0,y:0});endingActor({visible:true,sheet:'emerald',frame:0,x:0,y:0})}");
 assert.equal(r.canvases.length,count,'warm toss playback must allocate no canvases');
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
