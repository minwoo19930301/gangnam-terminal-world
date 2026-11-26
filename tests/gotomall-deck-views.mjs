// Render each live camera twice in the same animation tick and compare every RGB pixel.
import assert from 'node:assert/strict';
import {mkdir,writeFile} from 'node:fs/promises';
import {join} from 'node:path';
import {chromium} from 'playwright';
import {serve} from './serve.mjs';
import {compareDeckFrame} from './deck-frame-pair.mjs';
const out=process.env.GTW_VIEW_IMAGES;if(out)await mkdir(out,{recursive:true});
const axis=Math.hypot(1,.3745),U=[1/axis,-.3745/axis],V=[-U[1],U[0]];
const uv=(u,v)=>[u*U[0]+v*V[0],-126.3+u*U[1]+v*V[1]];
const shop=(x,d)=>uv(-377.4-d,1.72+x);
const views=[
  ['요거트월드-회랑',shop(.03,3.76),shop(.09,.05),1,-6],
  ['요거트월드-측창',shop(0,.55),shop(2.15,3.36),-2,-6],
  ['서편-긴복도',shop(3.70,2.37),shop(6.43,-.30),-1,-6],
  ['반에반-집기',shop(-4.49,.37),shop(-5.67,1.0),7,-6],
  ['사진관-열린출입구',shop(6.23,1.63),shop(6.12,-3.83),0,-6],
  ['사진관-거울',shop(6.39,1.744),shop(6.84,2.87),-11,-6],
  ['G1-하부에서-계단',uv(-380.3,24.6),uv(-380.3,35),11,-6],
  ['G2-하부에서-계단',uv(-380.4,-25.5),uv(-390,-26),11,-6],
  ['서편-두-상가열',uv(-284.4,3.68),uv(-247,3.5),0,-6],
  ['3호선-공용개구',[-79,-88.6],[-79,-99],-32,-6],
  ['9호선-공용개구',[10,-126.5],[11,-132],-33,-6],
  ['G13-접근-통로',uv(354,7),uv(355,13.8),4,-6],
];
const server=await serve(0);
const browser=await chromium.launch({channel:'chromium',headless:true,args:['--use-angle=metal','--enable-gpu','--ignore-gpu-blocklist']});
try{
 const page=await browser.newPage({viewport:{width:1000,height:640}}),errors=[];
 page.on('pageerror',e=>errors.push(e.message));
 const [startX,startZ]=shop(0,1);
 await page.goto('http://127.0.0.1:'+server.address().port+'/index.html#/gotomall/B1?p='+[startX,-6,startZ,0].join(','));
 await page.waitForFunction(()=>window.__world?.ready,null,{timeout:90000});await page.locator('#start').click();
 await page.evaluate(()=>{__world.setTimeMode('day');document.body.classList.add('shot');});
 await page.addStyleTag({content:'#toast,#prompt,#hud,#center,#cross,#tip{display:none!important}'});
 const result=[];
 for(const [label,[x,z],[tx,tz],pitch,floor] of views){
   await page.evaluate(([x,z,yaw,pitch,floor])=>{const p=__world.player;p.teleport(x,floor,z,yaw);p.pitch=pitch;},[x,z,Math.atan2(x-tx,z-tz),pitch*Math.PI/180,floor]);
   await page.waitForTimeout(760);
   const pair=await page.evaluate(compareDeckFrame);
   if(['요거트월드-회랑','서편-긴복도','서편-두-상가열'].includes(label)){
     pair.live=await page.evaluate(async()=>{
       const w=__world,kit=w.K._,deck=kit.deckVisibility,old=deck.update;
       async function intervals(){
         const ms=[],calls=[],triangles=[];let last;
         await new Promise(done=>{function next(t){if(last!==undefined){ms.push(t-last);calls.push(w.renderer.info.render.calls);triangles.push(w.renderer.info.render.triangles);}last=t;
           if(ms.length>=72)done();else requestAnimationFrame(next);}requestAnimationFrame(next);});
         const sorted=items=>items.sort((a,b)=>a-b);
         return {p95:+sorted(ms)[68].toFixed(2),calls:sorted(calls)[36],tri:sorted(triangles)[36]};
       }
       try{
         deck.update=()=>old(null);kit.cull(w.player.x,w.player.y+w.player.eye,w.player.z,true,w.camera);
         const before=await intervals();
         deck.update=old;kit.cull(w.player.x,w.player.y+w.player.eye,w.player.z,true,w.camera);
         return [before,await intervals()];
       }finally{deck.update=old;}
     });
   }
   if(out)await page.screenshot({path:join(out,label+'.png')});
   result.push({label,...pair});console.log(label,JSON.stringify(pair));
 }
 assert.deepEqual(errors,[]);assert.ok(result.some(v=>v.active&&v.after[1]<v.before[1]),'fewer submitted triangles in a real indoor view');
 if(out)await writeFile(join(out,'metrics.json'),JSON.stringify(result,null,2));
 for(const row of result)assert.equal(row.different,0,row.label+' visible pixel changed');
}finally{await browser.close();await new Promise(resolve=>server.close(resolve));}
