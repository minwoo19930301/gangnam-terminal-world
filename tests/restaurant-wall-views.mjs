// Compare fixed, ordinary player views, including the through-window view to the west WC corridor.
import assert from 'node:assert/strict';
import {chromium} from 'playwright';
import {serve} from './serve.mjs';
import {compareDeckFrame} from './deck-frame-pair.mjs';
import {footprint} from '../assets/models/gotomall-yogurtworld/layout.js';
import {bay} from '../assets/models/gotomall-madang/layout.js';

const len=Math.hypot(1,.3745),a=1/len,b=.3745/len;
const terminalShop=({front,mid})=>(x,d)=>[(front-d)*a+(mid+x)*b,-126.3-(front-d)*b+(mid+x)*a];
const rot=Math.atan2(.3639,.9315),sr=Math.sin(rot),cr=Math.cos(rot),centre=(187.343347639485+175.25751072961373)/2;
const tianjin=(x,d)=>[-135.7+sr*(centre+x)+cr*(-13.31800332778702-d),9.9+cr*(centre+x)-sr*(-13.31800332778702-d)];
const locations=[
  ['마당','gotomall/B1',-6,terminalShop(bay),[
    ['hall',.02,-1.77,0,2.13,.03], ['heart',.12,2.64,2.65,2.85,.11], ['bibimbap',.47,1.2,1.66,1.26,-.57],
    ['left menu',-.73,2.73,-2.73,2.43,.14], ['service',-.73,4.46,.52,5.22,.06], ['return',.10,2.75,.04,-1.68,0]]],
  ['요거트월드','gotomall/B1',-6,terminalShop(footprint),[
    ['hall',.03,-1.98,0,2.12,.03], ['opposite glass',-.02,2.67,-2.31,2.38,.07], ['rear',.02,3.72,.12,5.41,.09],
    ['WC through window',.12,2.58,4.9,2.78,.01], ['stools under sill',.34,2.72,2.31,2.78,-.59], ['corridor outside glass',3.42,2.11,.06,4.35,.01]]],
  ['천진포자','famille/1F',0,tianjin,[
    ['hall',.03,-2.87,0,1.84,.15], ['carved wall',-4.25,3.78,-5.9,5.08,.18], ['kitchen',3.61,5.82,5.02,5.82,-.11],
    ['rear',-.09,6.48,-.46,9.55,.03], ['ceiling',-.37,3.11,1.77,4.21,.57], ['lattice and glass',.05,1.97,.21,-4.11,.06]]],
];

const server=await serve(0),browser=await chromium.launch({channel:'chromium',headless:true,args:['--use-angle=metal','--enable-gpu','--ignore-gpu-blocklist']});
try{
  for(const [name,address,y,W,views] of locations){
    const page=await browser.newPage({viewport:{width:900,height:560}}),errors=[];
    page.on('pageerror',e=>errors.push(e.message));
    try{
      const [sx,sz]=W(.04,-2.16);
      await page.goto('http://127.0.0.1:'+server.address().port+'/index.html#/'+address+'?p='+[sx,y,sz,0].join(','));
      await page.waitForFunction(()=>window.__world?.ready,null,{timeout:90000});await page.locator('#start').click();
      let anySaved=false;
      for(const light of ['day','night']){
        await page.evaluate(v=>__world.setTimeMode(v),light);
        for(const [label,x,d,tx,td,p] of views){
          const [xx,zz]=W(x,d),[gx,gz]=W(tx,td);
          await page.evaluate(([x,y,z,rotation,pitch])=>{const player=__world.player;player.teleport(x,y,z,rotation);player.pitch=pitch;},[xx,y,zz,Math.atan2(xx-gx,zz-gz),p]);
          await page.waitForTimeout(420);
          const pair=await page.evaluate(compareDeckFrame,'walls');
          assert.equal(pair.different,0,[name,label,light,pair.different,pair.max].join(' '));
          const combined=await page.evaluate(compareDeckFrame);
          assert.equal(combined.different,0,[name,label,light,'with slabs',combined.different,combined.max].join(' '));
          if(label==='hall'||label==='corridor outside glass')assert.deepEqual(pair.before,pair.after,label+' stays outside the room');
          anySaved ||= pair.after[1]<pair.before[1];
          console.log(JSON.stringify({name,light,label,previous:pair.before,withWalls:pair.after,withoutOcclusion:combined.before,pixels:pair.different}));
        }
      }
      assert.ok(anySaved,name+' wall subtraction');assert.deepEqual(errors,[]);
    }finally{await page.close();}
  }
}finally{await browser.close();await new Promise(resolve=>server.close(resolve));}
