// Walk through the public G010 dining aisle and test its streamed fixtures and permit footprint.
import assert from 'node:assert/strict';
import {chromium} from 'playwright';
import {serve} from '../../../tests/serve.mjs';
import {bay,outline,parts} from './layout.js';
import {readFile} from 'node:fs/promises';
import {pointInPoly} from '../../../js/physics.js';
const floor=-6,len=Math.hypot(1,.3745),du=[1/len,-.3745/len],dv=[-du[1],du[0]],{front,mid}=bay;
const point=(x,d)=>[(front-d)*du[0]+(mid+x)*dv[0],-126.3+(front-d)*du[1]+(mid+x)*dv[1]];
const local=(x,z)=>[x*dv[0]+(z+126.3)*dv[1]-mid,front-x*du[0]-(z+126.3)*du[1]];
const osm=JSON.parse(await readFile(new URL('../../../data/osm.json',import.meta.url)));
const polygon=osm.buildings.find(building=>building.id===1354860678).poly;
let signedArea=0;
for(let i=0;i<outline.length;i++){
  const [x,d]=outline[i],[nx,nd]=outline[(i+1)%outline.length];signedArea+=x*nd-nx*d;
  for(let step=0;step<=100;step++){const t=step/100;assert.ok(pointInPoly(...point(x+t*(nx-x),d+t*(nd-d)),polygon),'outside OSM mall');}
}
assert.ok(Math.abs(Math.abs(signedArea/2)-53.53)<1e-8,'Seocho licensed area');
const server=await serve(0),browser=await chromium.launch({channel:'chromium',headless:true,args:['--use-angle=metal','--enable-gpu','--ignore-gpu-blocklist']});
try{
  const page=await browser.newPage({viewport:{width:1000,height:640}}),files=[],errors=[];
  page.on('pageerror',e=>errors.push(e.message));page.on('request',r=>{
    if(r.url().includes('/gotomall-madang/')&&/\.(glb|webp)$/.test(r.url()))files.push(r.url().split('/').pop());
  });
  const [xx,zz]=point(12,-27);
  await page.goto('http://127.0.0.1:'+server.address().port+'/index.html#/gotomall/B1?p='+[xx,floor,zz,0].join(','));
  await page.waitForFunction(()=>window.__world?.ready,null,{timeout:90000});await page.locator('#start').click();
  async function pose(x,d,tx,td,pitch=0){
    const [a,b]=point(x,d),[c,e]=point(tx,td);
    await page.evaluate(([x,z,r,p])=>{__world.player.teleport(x,-6,z,r);__world.player.pitch=p;},[a,b,Math.atan2(a-c,b-e),pitch]);
    await page.waitForTimeout(380);
  }
  async function look(x,d,pitch=0){await page.evaluate(([x,z,p])=>{const v=__world.player;v.yaw=Math.atan2(v.x-x,v.z-z);v.pitch=p;},[...point(x,d),pitch]);}
  async function here(){const [x,z,y,n]=await page.evaluate(()=>{const w=__world,p=w.player;return[p.x,p.z,p.y,w.phys.zoneAt(p.x,p.y+.12,p.z)?.name];});return [...local(x,z),y,n];}
  async function walk(x,d){
    await look(x,d);await page.keyboard.down('w');
    try{await page.waitForFunction(([x,z])=>{const p=__world.player;if(Math.hypot(p.x-x,p.z-z)<.125)return true;p.yaw=Math.atan2(p.x-x,p.z-z);return false;},point(x,d),{timeout:5600});}
    catch(error){throw Error('Could not walk to '+[x,d]+' from current position '+await here(),{cause:error});}
    finally{await page.keyboard.up('w');}
    const pos=await here();assert.ok(Math.abs(floor-pos[2])<.033,'continuous B1 floor '+pos);return pos;
  }

  async function high(key,min){
    try{await page.waitForFunction(([name,min])=>{let ok=false;__world.scene.traverse(o=>{if(o.name===name){
      const n=o.children[0]?.geometry?.index?.count??0;if(n>=min*3)ok=true;
    }});return ok;},[parts[key][0],min],{timeout:4500});}
    catch(e){throw Error('No detailed '+key+' at '+await here(),{cause:e});}
  }
  async function contact(x,d,time){
    await look(x,d);await page.keyboard.down('w');await page.waitForTimeout(time);await page.keyboard.up('w');return await here();
  }
  await pose(4.73,2.46,0,2.3);await pose(.04,10.26,0,4.05);await pose(.02,-3.31,.02,-7.3);
  assert.deepEqual(files,[],'adjacent, behind and facing away');
  await pose(.04,-13,.06,.15,.07);await high('front',2200);
  assert.ok(!files.some(name=>/bibimbap|plates|tools|cooker/.test(name)),'small merchandise stays unloaded in the corridor');
  await pose(.03,-2,.03,1.77);await walk(.03,-1.12);await walk(.02,.65);const inside=await here();assert.equal(inside[3],'마당');
  await look(1.65,1.26,-.52);await high('bibimbap',6100);await high('table',1600);await high('tools',1530);
  await look(2.58,2.87,.06);await high('heart',850);await high('menu',2100);await high('room',7000);
  await walk(-.01,2.59);await walk(-.72,3.15);await look(.18,3.84,-.45);await high('plates',2700);await high('trolley',2700);
  await look(-1.46,4.15,-.27);await high('cooker',1700);await walk(-.73,3.80);await walk(-.74,4.46);
  await look(.04,5.22,-.11);await high('kitchen',7500);const hatch=await contact(-.74,5.64,670);
  assert.ok(hatch[1]>4.56&&hatch[1]<4.76,'public service counter '+hatch);
  await walk(-.74,3.69);await walk(-.02,2.76);await walk(.02,-1.25);const hall=await here();assert.match(hall[3],/서편/);
  await pose(4.73,2.46,0,2.3);await page.waitForTimeout(250);
  const active=await page.evaluate(names=>__world.K._.details.filter(group=>names.includes(group.name)&&!group.hidden).map(group=>group.name),Object.entries(parts).filter(([key])=>key!=='room').map(([,v])=>v[0]));
  assert.deepEqual(active,[]);assert.deepEqual(errors,[]);assert.equal(new Set(files).size,files.length);
  for(const key of Object.keys(parts))assert.ok(files.includes(key+'.glb'),key);
  for(const key of ['room','kitchen'])assert.ok(files.includes(key+'-light.webp'));
  console.log(JSON.stringify({area:Math.abs(signedArea/2),cold:0,inside,hatch,hall,files}));
}finally{await browser.close();await new Promise(r=>server.close(r));}
