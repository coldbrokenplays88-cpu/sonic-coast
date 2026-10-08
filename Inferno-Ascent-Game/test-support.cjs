const assert=require('node:assert/strict');
const fs=require('node:fs'),vm=require('node:vm');
function boot(act=2){
 const tools=new Map(),elements=new Map(),events=new Map(),rects=[];
 const ctx=new Proxy({},{get:(_,name)=>name==='fillRect'?(...args)=>rects.push(args):name==='getTransform'?undefined:name==='createLinearGradient'?()=>({addColorStop(){}}):()=>{}});
 const element=()=>({style:{},classList:{add(){},remove(){}},getContext:()=>ctx,focus(){},addEventListener(){},setAttribute(){},matches:()=>false});
 const document={querySelector:s=>{if(!elements.has(s))elements.set(s,element());return elements.get(s)},querySelectorAll:()=>[],modelContext:{registerTool:t=>tools.set(t.name,t)}};
 const window={DEFAULT_ACT:act,addEventListener:(n,f)=>events.set(n,f)};
 const c=vm.createContext({document,window,Image:class{},AbortController,requestAnimationFrame(){},console});
 for(const file of ['level.js','level2-original.js','level2-restoration.js','midsection.js','level2.js','act2.js','pixel-world.js','city-polish.js','supplemental-frames.js','recovered-art.js','boost-rules.js','egg-scorpion.js','boss-art.js','boss-game.js','game.js'])vm.runInContext(fs.readFileSync(file,'utf8'),c,{filename:file});
 vm.runInContext('start()',c);
 return {c,tools,events,rects,run:s=>vm.runInContext(s,c),call:(name,arg={})=>{assert.ok(tools.has(name),'Missing tool: '+name);return tools.get(name).execute(arg)}};
}
module.exports={boot};
