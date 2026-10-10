const {test}=require('node:test'),assert=require('node:assert/strict');const {boot}=require('./test-support.cjs');
function defeated(ready=true){const a=boot();a.run(`endingArtReady=()=>${ready};const roof=surfaceById('summit-arena');p.x=level.arena.x+650;p.y=roof.y1-20;p.surface=roof;p.ground=true;update();boss.state='defeated';boss.hits=3;update();`);return a;}
test('boss defeat starts the ending before results and completes only after every beat',()=>{
 const a=defeated();assert.equal(a.run("typeof ending!=='undefined'&&ending?.beat"),'escape');assert.equal(a.run('mode'),'playing');
 const total=a.run('window.ENDING_BEATS.reduce((n,b)=>n+b.duration,0)');a.run(`for(let i=0;i<${total-1};i++)update()`);assert.equal(a.run('mode'),'playing');a.run('update()');assert.equal(a.run('mode'),'win');assert.equal(a.run('ending.done'),true);
});
test('ending locks gameplay, timer, statistics and camera while actors keep animating',()=>{
 const a=defeated();const before=a.run('JSON.stringify({clock,runFrames,cam,camY,zoom,x:p.x,y:p.y,boost,stats})');
 a.run("press('ArrowRight');press('Space');press('ShiftLeft');for(let i=0;i<240;i++)update()");
 assert.equal(a.run('JSON.stringify({clock,runFrames,cam,camY,zoom,x:p.x,y:p.y,boost,stats})'),before);assert.equal(a.run('keys.size'),0);assert.equal(a.run('ending.frame'),240);
});
test('pausing and resuming an ending keeps the same frame and cannot repeat its trigger',()=>{
 const a=defeated();a.run('for(let i=0;i<230;i++)update();pause()');const frame=a.run('ending.frame');a.run('for(let i=0;i<100;i++)update()');assert.equal(a.run('ending.frame'),frame);a.run('start();update()');assert.equal(a.run('ending.frame'),frame+1);assert.equal(a.run('mode'),'playing');
});
test('late images hold the initial scene and gameplay timer, then resume once ready',()=>{
 const a=defeated(false);const clock=a.run('clock');a.run('for(let i=0;i<180;i++)update()');assert.equal(a.run("typeof ending!=='undefined'&&ending?.frame"),0);assert.equal(a.run('clock'),clock);assert.equal(a.run('mode'),'playing');
 a.run('endingArtReady=()=>true;update()');assert.equal(a.run('ending.frame'),1);
});
test('restart and act selection discard the ending and release controls',()=>{
 for(const command of ['restart()','selectAct(1);start()']){const a=defeated();a.run(command);assert.equal(a.run("typeof ending!=='undefined'&&ending"),null);assert.equal(a.run('bossOwnsControls()'),null);const x=a.run('p.x');a.run("press('ArrowRight');for(let i=0;i<10;i++)update()");assert.ok(a.run('p.x')>x);}
});
test('a normal boss retry cannot retain ending state or skip combat',()=>{
 const a=defeated();a.run('respawn()');assert.equal(a.run("typeof ending!=='undefined'&&ending"),null);assert.equal(a.run('boss.state'),'idle');assert.equal(a.run('boss.hits'),0);
});
test('missing reused run atlas does not crash ending actor rendering',()=>{
 const a=boot();a.run("drawRecoveredSonicFrame=()=>{throw new Error('Missing run atlas')}");
 assert.doesNotThrow(()=>a.run("endingActor({visible:true,alpha:1,sheet:'recovered',frame:0,x:0,y:0})"));
});
