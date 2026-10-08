const assert=require('node:assert/strict'),fs=require('node:fs'),{boot}=require('../test-support.cjs');
const a=boot(),samples=[];
// Compare original clip's two real rooftop ascents with the same physical input.
for(const [from,to]of [['under-attack-act2-12','under-attack-act2-13'],['under-attack-act2-13','under-attack-act2-14'],['under-attack-act2-14','under-attack-act2-15'],['skyline-fork-act2-30','skyline-fork-act2-31']]){
 a.run(`restart();var source=surfaceById('${from}'),destination=surfaceById('${to}');p.x=source.x2-55;p.y=yOn(source,p.x)-20;p.vx=7;p.vy=0;p.ground=true;p.surface=source;cam=p.x-W/.94*.38;zoom=.94;camY=p.y-H/zoom*.64;resetCameraTracking();p.inv=10000;`);
 a.run("press('Space',true);press('ArrowRight',true)");let maxShift=0,minScreen=1e9,maxScreen=0,landed=false,firstShift=0;
 for(let i=0;i<100;i++){
  const before=a.run('camY');a.run("{const target=destination;keys.delete('ArrowLeft');keys.delete('ArrowRight');const error=(target.x1+target.x2)/2-(p.x+p.vx*8);if(Math.abs(error)>12)keys.add(error>0?'ArrowRight':'ArrowLeft');update()}");
  const shift=Math.abs(a.run('camY')-before)*a.run('zoom');if(i===0)firstShift=shift;maxShift=Math.max(maxShift,shift);const screen=a.run('(p.y-camY)*zoom');minScreen=Math.min(minScreen,screen);maxScreen=Math.max(maxScreen,screen);
  if(a.run(`p.ground&&p.surface?.id==='${to}'`)){landed=true;break;}
 }
 assert.equal(landed,true,from+' to '+to+' must land');assert.ok(firstShift<5,'no takeoff snap');assert.ok(maxShift<16,'no vertical spike');assert.ok(minScreen>60&&maxScreen<490,'Sonic remains visible');samples.push({from,to,firstShift,maxShift,minScreen,maxScreen});
}
console.log(JSON.stringify(samples,null,2));fs.writeFileSync('../docs/validation/camera-replay.json',JSON.stringify(samples,null,2)+'\n');
