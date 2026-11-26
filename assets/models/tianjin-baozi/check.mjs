// Visit the Naver-listed shop from the public gallery, inspect both service sides, and leave through the same doorway.
import assert from 'node:assert/strict';
import {chromium} from 'playwright';
import {serve} from '../../../tests/serve.mjs';
import {names} from './layout.js';
const r=Math.atan2(.3639,.9315),a=Math.sin(r),b=Math.cos(r),mid=(187.343347639485+175.25751072961373)/2,front=-13.31800332778702;
const point=(x,d)=>[-135.7+a*(mid+x)+b*(front-d),9.9+b*(mid+x)-a*(front-d)];
const local=(x,z)=>[(x+135.7)*a+(z-9.9)*b-mid,front-(x+135.7)*b+(z-9.9)*a];
const server=await serve(0),browser=await chromium.launch({channel:'chromium',headless:true,args:['--use-angle=metal','--enable-gpu','--ignore-gpu-blocklist']});
try{
  const page=await browser.newPage({viewport:{width:1000,height:640}}),downloads=[],errors=[];
  page.on('pageerror',e=>errors.push(e.message));page.on('request',r=>{
    if(r.url().includes('/models/tianjin-baozi/')&&/\.(glb|webp)$/.test(r.url()))downloads.push(r.url().split('/').pop());
  });
  const from=point(7.8,-25);await page.goto('http://127.0.0.1:'+server.address().port+'/index.html#/famille/1F?p='+[from[0],0,from[1],0].join(','));
  await page.waitForFunction(()=>window.__world?.ready,null,{timeout:90000});await page.locator('#start').click();
  async function pose(x,d,tx,td,pitch=0){
    const [xx,zz]=point(x,d),[u,v]=point(tx,td);
    await page.evaluate(([x,z,a,p])=>{__world.player.teleport(x,0,z,a);__world.player.pitch=p;},[xx,zz,Math.atan2(xx-u,zz-v),pitch]);
    await page.waitForTimeout(470);
  }
  async function look(x,d,pitch=0){await page.evaluate(([x,z,pitch])=>{const p=__world.player;p.yaw=Math.atan2(p.x-x,p.z-z);p.pitch=pitch;},[...point(x,d),pitch]);}
  async function here(){
    const [x,y,z,f,n]=await page.evaluate(()=>{const w=__world,p=w.player;return[p.x,p.y,p.z,w.phys.support(p.x,p.z,p.y+1.22).y,w.phys.zoneAt(p.x,p.y+.10,p.z)?.name];});
    return [...local(x,z),y,f,n];
  }
  async function walk(x,d){
    await look(x,d);await page.keyboard.down('w');
    try{await page.waitForFunction(([x,z])=>Math.hypot(__world.player.x-x,__world.player.z-z)<.125,point(x,d),{timeout:8000});}
    catch(error){throw Error('Walk to '+[x,d]+' stopped at '+await here(),{cause:error});}
    finally{await page.keyboard.up('w');}
    const stop=await here();assert.ok(Math.abs(stop[2])<.025,'public floor '+stop);return stop;
  }
  async function high(key,min){
    const label='천진포자 · '+names[key];await page.waitForFunction(([n,min])=>{
      const all=[];__world.scene.traverse(o=>{if(o.name===n)all.push(o);});
      return all.some(o=>(o.children[0]?.geometry.index?.count??0)>3*min);
    },[label,min],{timeout:7500});
  }
  await pose(7.7,4.7,3,4.7);await pose(-6.9,4.7,-4.3,4.7);await pose(0,10.32,0,8.3);await pose(0,-3.0,0,-8.0);
  assert.deepEqual(downloads,[],'cold wall, adjacent shop, rear and facing away');
  await pose(0,-10,0,.1,.11);await high('brand',2000);
  assert.ok(!downloads.some(f=>/buns|fried|noodles|drinks|jar/.test(f)),'merchandise at ten metres');
  await pose(7.76,-3.52,.1,-.82);
  const approach=await walk(4.65,-3.52);await walk(1.54,-1.46);await look(1.54,1);
  await page.keyboard.down('w');await page.waitForTimeout(520);await page.keyboard.up('w');
  const stone=await here();assert.ok(stone[1]<-.85&&stone[1]>-1.03,'stone plinth contact '+stone);
  await look(1.54,-.25,.18);await high('keeperL',2000);await look(-1.57,-.25,.10);await high('keeperR',2000);
  await walk(.02,-1.37);await walk(.02,.65);const dining=await here();assert.equal(dining[4],'천진포자');
  await look(0,.03,.10);await high('entry',300);await look(3.4,.02,0);await high('grille',170);
  await look(-2.62,-.29,-.25);await high('menu',700);
  await walk(2.63,.80);await look(3.27,1.60,-.29);await high('cooler',500);await high('drinks',1500);
  await walk(2.24,1.15);await look(1.08,2.00,-.28);await high('refill',900);await high('jar',170);
  await walk(-.14,1.03);await walk(-4.23,1.03);await walk(-4.23,1.40);
  await look(-4.26,2.33,-.71);await high('buns',3200);await high('walltable',450);
  await walk(-2.38,1.12);await walk(-2.38,3.77);await walk(-4.25,3.78);
  await look(-4.28,4.98,-.61);await high('noodles',3500);await look(-5.86,5.08,.20);await high('plaque',500);
  await walk(-2.39,3.78);await walk(.07,4.07);await look(1.37,3.86,-.58);await high('fried',600);
  await look(1.75,5.05,-.15);await high('communal',1000);await high('stool',110);
  await look(1.83,3.83,.64);await high('stock',400);
  await look(-4.28,5.02,.32);await high('light',350);
  await walk(.08,2.9);await walk(3.53,2.89);await walk(3.61,5.82);await look(4.84,5.83,-.32);await high('pass',900);await high('shell',1200);
  await look(5.0,5.82);await page.keyboard.down('w');await page.waitForTimeout(520);await page.keyboard.up('w');
  const counter=await here();assert.ok(counter[0]>4.02&&counter[0]<4.16,'open counter frontage '+counter);
  await walk(3.61,5.82);await walk(3.61,2.85);await walk(2.72,2.81);await look(3.27,1.60,.03);await page.waitForTimeout(280);
  const fridgeRear=await page.evaluate(n=>__world.K._.details.find(d=>d.name===n).hidden,'천진포자 · '+names.drinks);
  assert.ok(fridgeRear,'opaque fridge after caching');
  await walk(2.09,2.79);await walk(.23,2.81);await walk(.09,.72);await walk(.05,-1.63);await walk(4.75,-3.52);
  const gallery=await walk(7.72,-3.52);assert.equal(gallery[4],'파미에스테이션 실내 거리');
  await pose(7.7,4.7,.2,4.7);
  const hidden=await page.evaluate(n=>__world.K._.details.filter(d=>d.name.startsWith('천진포자 · ')&&!n.includes(d.name)).every(d=>d.hidden),
    ['천진포자 · '+names.shell,'천진포자 · '+names.entry]);
  assert.ok(hidden,'warmed opaque side');
  await pose(0,-2,0,.05,.47);await high('brand',1500);
  const expected=Object.keys(names).filter(k=>!['glass','coolerGlass'].includes(k)).map(k=>k+'.glb').concat('shell-light.webp','communal-light.webp').sort();
  assert.deepEqual(downloads.toSorted(),expected);assert.deepEqual([...errors,...await page.evaluate(()=>[...__world.errors,...__world.K._.detailErrors])],[]);
  console.log(JSON.stringify({coldOpaqueAndAway:0,approach,stone,dining,counter,gallery,fridgeRear,hidden,downloads}));
}finally{await browser.close();await new Promise(r=>server.close(r));}
