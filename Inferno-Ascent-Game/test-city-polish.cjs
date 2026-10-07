const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs'),vm=require('node:vm'),path=require('node:path');
function scene(){
 const rects=[],ctx={fillStyle:'',globalAlpha:1,fillRect(...args){rects.push([...args,this.fillStyle,this.globalAlpha]);}};
 const c=vm.createContext({ctx,Math,console,cam:0,camY:0,W:960,H:540,zoom:1,runFrames:100,step:100,level:{buildings:[],surfaces:[],hazards:[]},p:{x:0,y:0}});
 vm.runInContext(fs.readFileSync(path.join(__dirname,'pixel-world.js'),'utf8'),c);
 const module=path.join(__dirname,'city-polish.js');
 if(fs.existsSync(module))vm.runInContext(fs.readFileSync(module,'utf8'),c);
 const run=code=>vm.runInContext(code,c);
 const render=code=>{rects.length=0;run(code);return rects.map(a=>[...a]);};
 return {run,render,rects};
}
test('world objects expose the integration API',()=>{
 const s=scene();for(const name of ['drawPolishedSpring','drawBoostMonitor','drawPoolBooster','drawPixelEnemy','drawPixelSpikes','drawDebrisWarning','drawPixelSign','drawCityDetails','updateCityInteriors'])assert.equal(s.run('typeof '+name),'function',name);
});
test('spring cap compresses, extends, settles without moving the physics anchor',()=>{
 const s=scene();s.run('var device={x:120,y:260,firedAt:100,power:25};');
 const rest=s.render('runFrames=99;drawPolishedSpring(device)'),compressed=s.render('runFrames=101;drawPolishedSpring(device)'),extended=s.render('runFrames=105;drawPolishedSpring(device)');
 const capTop=rs=>Math.min(...rs.filter(r=>r[4]==='#ffcc45').map(r=>r[1]));
 assert.ok(capTop(compressed)>capTop(rest));assert.ok(capTop(extended)<capTop(rest));
 assert.deepEqual(s.render('runFrames=125;drawPolishedSpring(device)'),rest);assert.equal(s.run('device.y'),260);
 for(const r of extended)for(const n of r.slice(0,4))assert.equal(n%2,0);
});
test('directional spring cap tilts toward its actual launch vector',()=>{
 const s=scene();const up=s.render('drawPolishedSpring({x:120,y:260,power:25})'),right=s.render('drawPolishedSpring({x:120,y:260,launchX:28,power:20})');
 assert.notDeepEqual(right,up);
 const gold=right.filter(r=>r[4]==='#ffcc45');
 assert.ok(Math.max(...gold.map(r=>r[0]))>120,'diagonal cap visibly extends toward launch direction');
});
test('monitor lightning disappears when broken and intact monitor stays crisp',()=>{
 const s=scene();const intact=s.render('drawBoostMonitor({x:120,y:260})'),broken=s.render('drawBoostMonitor({x:120,y:260,broken:true})');
 assert.ok(intact.some(r=>r[4]==='#edfaff'));assert.ok(!broken.some(r=>r[4]==='#edfaff'));assert.notDeepEqual(intact,broken);
 for(const r of intact)for(const n of r.slice(0,4))assert.equal(n%2,0);
});
test('underwater launcher animates chevrons and mechanism without shifting its anchor',()=>{
 const s=scene();const a=s.render('runFrames=0;drawPoolBooster({x:220,y:260})'),b=s.render('runFrames=8;drawPoolBooster({x:220,y:260})');
 assert.notDeepEqual(a,b);assert.ok(a.some(r=>r[4]==='#e84b58'));assert.ok(a.some(r=>r[4]==='#d9e8eb'));
 const center=rs=>(Math.min(...rs.map(r=>r[0]))+Math.max(...rs.map(r=>r[0]+r[2])))/2;
 assert.equal(center(a),center(b));
});
test('enemy silhouettes are distinct and hostile eyes stay high contrast',()=>{
 const s=scene();const crab=s.render('drawPixelEnemy({x:120,y:260,kind:"crab",alive:true})'),drone=s.render('drawPixelEnemy({x:120,y:260,kind:"drone",alive:true})');
 assert.notDeepEqual(crab,drone);for(const rs of [crab,drone])assert.ok(rs.some(r=>r[4]==='#ff5c52'));
 for(const r of [...crab,...drone])for(const n of r.slice(0,4))assert.equal(n%2,0);
});
test('debris warning highlights the whole collision corridor and animates before impact',()=>{
 const s=scene();const a=s.render('drawDebrisWarning({x:320,y:300,w:88,warn:48,age:2,triggered:true})'),b=s.render('runFrames=108;drawDebrisWarning({x:320,y:300,w:88,warn:48,age:10,triggered:true})');
 assert.notDeepEqual(a,b);assert.ok(a.some(r=>r[0]<=276&&r[0]+r[2]>=364&&r[1]>=286));
 assert.equal(s.render('drawDebrisWarning({x:320,y:300,w:88,warn:48,age:48,triggered:true})').length,0);
 assert.equal(s.render('drawDebrisWarning({x:320,y:300,w:88,warn:48,age:0,triggered:false})').length,0);
});
test('closed secrets remain opaque and accessible interiors fade smoothly both ways',()=>{
 const s=scene();s.run('level.buildings=[{id:"secret",x:100,y:100,w:180,gateId:"gate",rooms:[{x1:100,x2:280,y:300}]}];level.hazards=[{id:"gate",broken:false}];p={x:180,y:250};updateCityInteriors();');
 assert.equal(s.run('level.buildings[0].interiorOpacity'),1);
 s.run('level.hazards[0].broken=true;updateCityInteriors();');
 const first=s.run('level.buildings[0].interiorOpacity');assert.ok(first<1&&first>.24);
 s.run('for(let i=0;i<60;i++)updateCityInteriors();');assert.ok(s.run('level.buildings[0].interiorOpacity')<.25);
 s.run('p.x=400;updateCityInteriors();');const leaving=s.run('level.buildings[0].interiorOpacity');assert.ok(leaving>.24&&leaving<1);
 s.run('for(let i=0;i<60;i++)updateCityInteriors();');assert.ok(s.run('level.buildings[0].interiorOpacity')>.99);
});
test('city details cull distant buildings and never draw across their collision roof',()=>{
 const s=scene();s.run('level.buildings=[{id:"near",x:100,y:180,w:300,seed:12},{id:"far",x:4000,y:0,w:300,seed:9}];');
 const rs=s.render('drawCityDetails()');assert.ok(rs.length>0);assert.ok(rs.every(r=>r[0]<1000));assert.ok(rs.every(r=>r[1]>=180));
 assert.equal(s.render('cam=4000;camY=-1000;drawCityDetails()').length,0);
});
test('all object renderers cull outside both camera axes',()=>{
 const s=scene();for(const name of ['drawPolishedSpring','drawBoostMonitor','drawPoolBooster','drawPixelEnemy'])assert.equal(s.render(name+'({x:5000,y:260,kind:"crab"})').length,0,name);
 assert.equal(s.render('drawPixelSpikes({x:120,y:4000,w:80,h:30})').length,0);
 assert.equal(s.render('drawPixelSign(120,4000,"BOOST","express")').length,0);
});
test('vent updraft animates above a stable detailed grate',()=>{
 const s=scene();const a=s.render('runFrames=0;drawPolishedVent({x:120,y:260})'),b=s.render('runFrames=8;drawPolishedVent({x:120,y:260})');
 assert.notDeepEqual(a,b);const base=rs=>rs.filter(r=>r[1]>=246);assert.deepEqual(base(a),base(b));
 assert.equal(s.render('drawPolishedVent({x:120,y:4000})').length,0);
});
test('falling debris remains pixel detailed and follows the existing fall trajectory',()=>{
 const s=scene();const a=s.render('drawPixelDebris({x:320,y:520,w:88,warn:48,fall:18,age:49,triggered:true})'),b=s.render('drawPixelDebris({x:320,y:520,w:88,warn:48,fall:18,age:56,triggered:true})');
 assert.ok(a.length>10);const top=rs=>Math.min(...rs.map(r=>r[1]));assert.ok(top(b)>top(a));
 assert.equal(s.render('drawPixelDebris({x:320,y:520,w:88,warn:48,fall:18,age:48,triggered:false})').length,0);
});
test('sprite cache keeps repeated world objects within its documented bound',()=>{
 const s=scene();for(let i=0;i<230;i++)s.run('drawPixelSign(400,200,"DISTRICT '+i+'","express")');
 assert.ok(s.run('polishSpriteCache.size')<=192);
});
test('warm world sprites draw one cached canvas with no geometry repaint',()=>{
 const s=scene();s.run('var texturePaints=0,textureCreates=0,images=[];document={createElement(){textureCreates++;return {getContext(){return {fillRect(){texturePaints++}}}}}};ctx.drawImage=(...args)=>images.push(args);');
 s.run('runFrames=99;drawPolishedSpring({x:120,y:260,power:25});');const paints=s.run('texturePaints');assert.ok(paints>0);
 s.run('drawPolishedSpring({x:220,y:260,power:25});');assert.equal(s.run('texturePaints'),paints);assert.equal(s.run('textureCreates'),1);assert.equal(s.run('images.length'),2);assert.equal(s.run('images[0][0]===images[1][0]'),true);
});

test('fallen and damaged roofs show broken supports below their collision edge, with distant damage culled',()=>{const s=scene();s.run('level.surfaces=[{x1:100,x2:620,y1:200,y2:100,fallen:true}];');const rs=s.render('drawCityDetails()');assert.ok(rs.length>20,'destroyed building must have visible cracks, supports and rubble');for(const r of rs)assert.ok(r[1]>=200+(r[0]-100)*(-100/520)+20,'details below roof');s.run('level.surfaces[0].fallen=false');assert.equal(s.render('drawCityDetails()').length,0);s.run('level.surfaces[0].damaged=true');assert.ok(s.render('drawCityDetails()').length>20);assert.equal(s.render('cam=4000;drawCityDetails()').length,0)});
