const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs'),vm=require('node:vm');

function surface(width=320,height=84){
 const pixels=new Map();let draws=0;
 const ctx={fillStyle:'#000000',imageSmoothingEnabled:true,clearRect(){pixels.clear()},fillRect(x,y,w,h){draws++;assert.ok([x,y,w,h].every(Number.isInteger),'HUD pixels must use integer coordinates');for(let iy=y;iy<y+h;iy++)for(let ix=x;ix<x+w;ix++)if(ix>=0&&iy>=0&&ix<width&&iy<height)pixels.set(ix+','+iy,ctx.fillStyle)}};
 return {width,height,pixels,getContext:()=>ctx,setAttribute(){},get draws(){return draws}};
}
function boot(){
 assert.ok(fs.existsSync('hud.js'),'Pixel HUD module must exist');
 const elements=new Map();
 for(const id of ['rings','time','lives','score','speed','fullscreen','game-shell'])elements.set(id,{textContent:'',hidden:false,style:{},classList:{toggle(){},contains(){return false}},setAttribute(){},addEventListener(){}});
 for(const [id,w,h]of [['ring-stat',96,20],['timer-stat',72,16],['life-stat',72,20],['pixel-boost',320,84]])elements.set(id,surface(w,h));
 const doc={getElementById:id=>elements.get(id),querySelector:s=>elements.get(s.replace('#','')),addEventListener(){}};
 const context=vm.createContext({document:doc,window:{addEventListener(){}},console,Map,Math,Number});
 vm.runInContext(fs.readFileSync('hud.js','utf8'),context,{filename:'hud.js'});
 return {context,elements,run:s=>vm.runInContext(s,context)};
}
test('empty and full boost retain the same three-quill silhouette',()=>{
 const a=boot(),bar=surface();a.context.bar=bar;
 a.run('drawPixelBoostBar(bar,0,0)');const outline=new Map(bar.pixels);
 a.run('drawPixelBoostBar(bar,1,0)');
 // The outline is always visible; each rear quill reaches a different height.
 for(const [x,y]of [[304,25],[308,60],[291,74],[235,58]]){assert.ok(outline.has(x+','+y),`Missing Sonic silhouette at ${x},${y}`);assert.ok(bar.pixels.has(x+','+y));}
 assert.notEqual(outline.get('100,24'),bar.pixels.get('100,24'));
 assert.ok([...bar.pixels].some(([key,color])=>Number(key.split(',')[0])>265&&Number(key.split(',')[1])>44&&color==='#8fffff'),'Lightning must extend into the head');
});
test('boost lightning animates without altering its silhouette or spilling outside',()=>{
 const a=boot(),bar=surface();a.context.bar=bar;
 a.run('drawPixelBoostBar(bar,1,0)');const first=new Map(bar.pixels);
 a.run('drawPixelBoostBar(bar,1,30)');
 assert.deepEqual([...first.keys()].sort(),[...bar.pixels.keys()].sort());
 assert.notDeepEqual([...first.values()],[...bar.pixels.values()]);
});
test('boost rendering clamps invalid fractions to safe empty/full states',()=>{
 const a=boot(),bar=surface();a.context.bar=bar;
 a.run('drawPixelBoostBar(bar,0,0)');const empty=[...bar.pixels];
 a.run('drawPixelBoostBar(bar,NaN,0)');assert.deepEqual([...bar.pixels],empty);
 a.run('drawPixelBoostBar(bar,-3,0)');assert.deepEqual([...bar.pixels],empty);
 a.run('drawPixelBoostBar(bar,1,0)');const full=[...bar.pixels];
 a.run('drawPixelBoostBar(bar,12,0)');assert.deepEqual([...bar.pixels],full);
});
test('HUD shows accurate values, hides score until clear and avoids unchanged stat redraws',()=>{
 const a=boot();a.run('updatePixelHud({rings:17,lives:2,time:125.9,score:500,boost:45,maxBoost:90,speed:28,mode:"playing",frame:0})');
 assert.equal(a.elements.get('rings').textContent,'017');assert.equal(a.elements.get('time').textContent,'2:05');assert.equal(a.elements.get('lives').textContent,'02');assert.equal(a.elements.get('speed').textContent,'28');assert.equal(a.elements.get('score').hidden,true);
 const draws=a.elements.get('ring-stat').draws;a.run('updatePixelHud({rings:17,lives:2,time:125.9,score:500,boost:45,maxBoost:90,speed:28,mode:"playing",frame:3})');assert.equal(a.elements.get('ring-stat').draws,draws);
 assert.ok(a.elements.get('ring-stat').pixels.size>100,'Ring and count are actual pixels');
 a.run('updatePixelHud({score:500,mode:"win"})');assert.equal(a.elements.get('score').hidden,false);assert.equal(a.elements.get('score').textContent,'000500');
});
test('markup exposes fullscreen and HUD semantics without touchscreen controls',()=>{
 const html=fs.readFileSync('index.html','utf8');
 assert.match(html,/id="fullscreen"/);assert.match(html,/id="pixel-boost"/);assert.match(html,/src="hud\.js/);assert.doesNotMatch(html,/data-key=/);
 assert.ok(html.indexOf('src="hud.js')<html.indexOf('src="game.js'));
});
