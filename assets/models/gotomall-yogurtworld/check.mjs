// Enter G-012 from the west hall, inspect two real dishes, then walk beside the window to the WC entrances.
import assert from 'node:assert/strict';
import {chromium} from 'playwright';
import {serve} from '../../../tests/serve.mjs';
import {footprint,names} from './layout.js';
const floor=-6,len=Math.hypot(1,.3745),du=[1/len,-.3745/len],dv=[-du[1],du[0]],{front,mid}=footprint;
const point=(x,d)=>[(front-d)*du[0]+(mid+x)*dv[0],-126.3+(front-d)*du[1]+(mid+x)*dv[1]];
const local=(x,z)=>[x*dv[0]+(z+126.3)*dv[1]-mid,front-x*du[0]-(z+126.3)*du[1]];
const server=await serve(0),browser=await chromium.launch({channel:'chromium',headless:true,args:['--use-angle=metal','--enable-gpu','--ignore-gpu-blocklist']});
try{
  const page=await browser.newPage({viewport:{width:1000,height:640}}),files=[],errors=[];
  page.on('pageerror',e=>errors.push(e.message));page.on('request',r=>{
    if(r.url().includes('/gotomall-yogurtworld/')&&/\.(glb|webp)$/.test(r.url()))files.push(r.url().split('/').pop());
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
    try{await page.waitForFunction(([n,m])=>{const result=[];__world.scene.traverse(o=>{if(o.name===n)result.push(o);});
      return result.some(o=>(o.children[0]?.geometry.index?.count??0)>m*3);
    },['요거트월드 · '+names[key],min],{timeout:5000});}
    catch(error){throw Error('No detailed '+key+' at '+await here(),{cause:error});}
  }
  // Adjacent shop (north), rear wall and the shopper facing away from the entrance.
  await pose(-3.05,2.72,-1.21,2.33);await pose(-.04,6.91,0,4.34);await pose(0,-3.0,0,-8.1);
  assert.deepEqual(files,[]);
  await pose(.14,-12,.05,.04,.075);await high('front',1200);
  assert.ok(!files.some(v=>/blueberry|honey|plants|display/.test(v)),'no countertop food from the distant hall');
  await pose(4.05,3.1,.15,3.18);await high('room',1400);await high('plants',850);await high('tables',550);
  await look(2.18,3.1);await page.keyboard.down('w');await page.waitForTimeout(600);await page.keyboard.up('w');
  const windowContact=await here();assert.ok(windowContact[0]>2.45&&windowContact[0]<2.58,'side window collision '+windowContact);
  await walk(3.27,3.07);await walk(3.30,-1.52);await walk(.24,-1.49);
  await look(1.54,-.42,-.33);await high('kiosk',460);await high('display',1200);
  await walk(.15,.56);const room=await here();assert.equal(room[3],'요거트월드 반포고투몰점');
  await walk(.54,1.57);await look(1.39,1.88,-.82);await high('blueberry',2500);
  await walk(-.52,1.91);await look(-1.38,2.30,-.75);await high('honey',3000);
  await look(-2.145,2.21,.12);await high('wall',1000);
  await walk(.06,3.46);await look(-1.57,4.15,-.41);await high('service',650);
  await walk(.0,4.44);await look(.0,5.45,-.37);await high('counter',1100);
  await look(.0,5.45,.57);await high('screens',1300);
  await look(.01,5.55);await page.keyboard.down('w');await page.waitForTimeout(480);await page.keyboard.up('w');
  const counter=await here();assert.ok(counter[1]>4.71&&counter[1]<4.84,'counter edge '+counter);
  await walk(-.02,3.60);await walk(.07,.68);await walk(.08,-1.35);await walk(3.69,-1.32);await walk(3.71,4.78);
  const wc1=await walk(6.14,4.48);assert.equal(wc1[3],'화장실 · 수유실');
  await walk(3.75,4.48);await walk(3.72,7.25);const wc2=await walk(6.22,7.25);assert.equal(wc2[3],'화장실 · 수유실');
  await walk(3.72,7.25);const corridor=await walk(3.73,-1.02);assert.equal(corridor[3],'고투몰 서편 푸드코트');
  // Check the undisturbed public approach to the existing G1 and G2 stair landings on both sides of the block.
  const walkUV=([u,v])=>walk(v-mid,front-u);
  const south=[[-375.15,6.48],[-375.15,13.90],[-378.43,17.95],[-380.3,20.80],[-380.3,26.09]];
  for(const p of south)await walkUV(p);
  const g1=await here();
  for(const p of south.slice(0,-1).reverse())await walkUV(p);
  await walkUV([-375.16,1.92]);
  const north=[[-375.16,-4.42],[-375.21,-10.92],[-379.94,-12.87],[-380.03,-17.63],[-380.38,-22.52],[-380.38,-25.95]];
  for(const p of north)await walkUV(p);
  const g2=await here();
  for(const p of north.slice(0,-1).reverse())await walkUV(p);
  await walkUV([-375.16,1.92]);
  await pose(-3.0,2.68,0,2.68);
  const opaque=await page.evaluate(n=>__world.K._.details.filter(d=>d.name.startsWith('요거트월드 · ')&&d.name!==n).every(d=>d.hidden),'요거트월드 · '+names.room);
  assert.ok(opaque,'warm adjacent storefront wall');
  await pose(.03,-2.18,0,0,.31);await high('front',1100);
  const expected=Object.keys(names).filter(k=>k!=='glass').map(k=>k+'.glb').concat('room-light.webp','counter-light.webp').sort();
  assert.deepEqual(files.toSorted(),expected);assert.deepEqual([...errors,...await page.evaluate(()=>[...__world.errors,...__world.K._.detailErrors])],[]);
  console.log(JSON.stringify({cold:0,windowContact,room,counter,wc1,wc2,corridor,g1,g2,opaque,downloads:files}));
}finally{await browser.close();await new Promise(resolve=>server.close(resolve));}
