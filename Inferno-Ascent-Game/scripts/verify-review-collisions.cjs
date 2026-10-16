// Compare the optimized contacts against the pre-optimization source supplied as argv[2].
// Run from the game directory; no baseline source is copied into the game.
const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
const {boot}=require('../test-support.cjs');
let comparisons=0,queries=0;
for(const act of [1,2]){
 const old=boot(act),next=boot(act);
 vm.runInContext(fs.readFileSync(process.argv[2],'utf8'),old.c);
 const n=old.run('level.surfaces.length');
 for(let index=0;index<n;index++)for(const phase of [0,40,80,120,180,240,280]){
  for(const [ground,speed,offset]of [[true,8,-1],[true,-23,1],[false,0,-8],[false,23,8],[false,-60,-9],[false,100,9]]){
   const source=`respawn();runFrames=${phase};var s=level.surfaces[${index}],q=pose(s);p.x=${ground?'(q.x1+q.x2)/2':speed>=0?'q.x1':'q.x2'}+${offset};p.y=yOn(s,p.x)-${ground?20:23};p.vx=${speed};p.vy=${ground?0:8};p.ground=${ground};p.surface=${ground?'s':'null'};p.inv=999;keys.clear();moveAndResolveSurfaces();JSON.stringify({...p,surface:p.surface?.id??null})`;
   assert.equal(next.run(source),old.run(source),`act ${act}, surface ${index}, phase ${phase}, speed ${speed}, ground ${ground}`);comparisons++;
  }
  for(const edge of ['q.x1','q.x2','q.x1-10','q.x2+10']){
   const source=`var s=level.surfaces[${index}],q=pose(s);JSON.stringify((()=>{const hit=topAt(${edge});return hit?{id:hit.s.id,y:hit.y}:null})())`;
   assert.equal(next.run(source),old.run(source),`query act ${act}, surface ${index}, phase ${phase}`);queries++;
  }
 }
}
console.log(JSON.stringify({collisionStatesIdentical:comparisons,surfaceQueriesIdentical:queries}));
