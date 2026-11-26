// Use the normal gallery, two-person table and adjacent Gate 1 in both directions.
import assert from 'node:assert/strict';
import {chromium} from 'playwright';
import {serve} from '../../../tests/serve.mjs';
import {names} from './layout.js';
const r=Math.atan2(.3639,.9315),a=Math.sin(r),b=Math.cos(r),front=171.62,mid=-33.51941763727121;
const world=(x,d)=>[-135.7+a*(front-d)+b*(mid-x),9.9+b*(front-d)-a*(mid-x)];
const local=(x,z)=>[mid-(x+135.7)*b+(z-9.9)*a,front-(x+135.7)*a-(z-9.9)*b];
const server=await serve(0),browser=await chromium.launch({channel:'chromium',headless:true,
  args:['--use-angle=metal','--enable-gpu','--ignore-gpu-blocklist']});
try{
  const page=await browser.newPage({viewport:{width:1000,height:640}}),requests=[],errors=[];
  page.on('pageerror',e=>errors.push(e.message));
  page.on('request',q=>{if(q.url().includes('/models/waraku/')&&/\.(glb|webp)$/.test(q.url()))requests.push(q.url().split('/').pop());});
  const [x,z]=world(13,-19);
  await page.goto('http://127.0.0.1:'+server.address().port+'/index.html#/famille/1F?p='+[x,0,z,0].join(','));
  await page.waitForFunction(()=>window.__world?.ready,null,{timeout:90000});await page.locator('#start').click();
  async function pose(x,d,tx,td,pitch=0){
    const [xx,zz]=world(x,d),[u,v]=world(tx,td);
    await page.evaluate(([x,z,yaw,pitch])=>{const p=__world.player;p.teleport(x,0,z,yaw);p.pitch=pitch;},[xx,zz,Math.atan2(xx-u,zz-v),pitch]);
    await page.waitForTimeout(420);
  }
  async function look(x,d,pitch=0){await page.evaluate(([x,z,pitch])=>{const p=__world.player;p.yaw=Math.atan2(p.x-x,p.z-z);p.pitch=pitch;},[...world(x,d),pitch]);}
  async function where(){
    const [x,z,y,zone]=await page.evaluate(()=>{const {x,z,y}=__world.player;return[x,z,y,__world.phys.zoneAt(x,y+.10,z)?.name];});
    return [...local(x,z),y,zone];
  }
  async function walk(x,d){
    await look(x,d);await page.keyboard.down('w');
    try{await page.waitForFunction(([x,z])=>Math.hypot(__world.player.x-x,__world.player.z-z)<.12,world(x,d),{timeout:7500});}
    catch(error){throw new Error('Walk to '+[x,d]+' stopped at '+await where(),{cause:error});}
    finally{await page.keyboard.up('w');}
    const here=await where();assert.ok(Math.abs(here[2])<.065,'flat public gallery and room '+here);return here;
  }
  async function high(key,min){
    await page.waitForFunction(([label,min])=>{
      const m=__world.K.scene.getObjectByName('와라쿠 · '+label)?.children[0];
      return (m?.geometry.index?.count??0)>min*3;
    },[names[key],min],{timeout:6500});
  }
  await pose(13,-19,16,-22);
  await pose(0,3.35,0,1.12);
  await pose(2.87,1.50,1.34,1.50);
  await pose(-4.82,1.34,-1.62,0);
  await pose(0,-2.8,0,-6.1);
  assert.deepEqual(requests,[],'distant, away and behind the restaurant or gate column');
  await pose(.03,-14,.04,.03,.063);await high('brand',500);
  assert.ok(!requests.some(n=>/light\.webp|pot\.glb|samples\.glb/.test(n)),'only the long-range frontage');
  await pose(-1.65,-2.40,-1.65,-.16,-.27);await high('cabinet',650);await high('samples',3000);
  await look(-.92,-.35,-.26);await high('menu',400);
  await walk(-.11,-1.02);await walk(-.11,.51);
  const inside=await where();assert.equal(inside[3],'와라쿠샤샤');
  await look(1.38,1.91,-.3);await high('table',1100);await high('room',950);
  await look(1.49,1.13,.74);await high('lamps',150);
  await walk(.96,.82);await look(.986,1.567,-.80);await high('pot',2500);
  await look(1.46,1.47,-.77);await high('zaru',2400);
  await look(1.414,1.969,-.55);await high('tempura',2400);
  await look(1.13,2.20,-.46);await high('service',540);
  await look(.96,1.87);await page.keyboard.down('w');await page.waitForTimeout(460);await page.keyboard.up('w');
  const tableEdge=await where();assert.ok(tableEdge[1]>.79&&tableEdge[1]<.94,'table edge '+tableEdge);
  await walk(-.12,.75);await walk(-.12,1.95);await walk(-.12,.47);await walk(-.12,-1.25);
  await walk(-1.65,-.93);await look(-1.65,.10);await page.keyboard.down('w');await page.waitForTimeout(550);await page.keyboard.up('w');
  const glassEdge=await where();assert.ok(glassEdge[1]>-.66&&glassEdge[1]<-.50,'sample case '+glassEdge);
  await walk(-1.65,-1.42);await walk(-4.82,-1.8);
  const gateIn=await walk(-4.82,1.82);const gateOut=await walk(-4.82,3.29);await walk(-4.82,-1.8);
  await pose(0,3.43,0,1.62);
  const hidden=await page.evaluate(()=>__world.K._.details.filter(d=>d.name.startsWith('와라쿠 ')&&!d.name.includes('목재 창살')).map(d=>d.hidden));
  assert.ok(hidden.length===11&&hidden.every(Boolean),'the opaque rear after caching');
  await pose(-.12,.44,1.16,1.89,-.33);await high('table',1100);
  const light=await page.evaluate(names=>Object.fromEntries(['room','table'].map(k=>{
    const mat=__world.K.scene.getObjectByName('와라쿠 · '+names[k]).children[0].material;
    return[k,[mat.map.image.width,mat.map.image.height,mat.color.r,mat.map.flipY]];
  })),names);
  assert.deepEqual(light,{room:[640,640,2,false],table:[512,512,2,false]});
  await page.evaluate(()=>__world.setTimeMode('night'));await pose(.12,-2.4,.04,.02,.35);await high('brand',500);
  const glow=await page.evaluate(label=>__world.K.scene.getObjectByName('와라쿠 · '+label).children[0].material.isMeshBasicMaterial,names.brand);
  assert.equal(glow,true);
  assert.deepEqual(requests.toSorted(),[...Object.keys(names).filter(k=>k!=='glass').map(k=>k+'.glb'),'room-light.webp','table-light.webp'].sort());
  assert.deepEqual([...errors,...await page.evaluate(()=>[...__world.errors,...__world.K._.detailErrors])],[]);
  console.log(JSON.stringify({coldRearGateWall:0,coldLookingAway:0,warmRearHidden:hidden.length,inside,tableEdge,glassEdge,gateIn,gateOut,light,requests}));
}finally{await browser.close();await new Promise(resolve=>server.close(resolve));}
