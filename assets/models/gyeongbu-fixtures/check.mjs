// Cold entries, camera direction, adjacent floors and a round trip through the public Daiso aisle.
import assert from 'node:assert/strict';
import {chromium} from 'playwright';
import {serve} from '../../../tests/serve.mjs';

const server=await serve(0),base='http://127.0.0.1:'+server.address().port+'/index.html?fixedres=1#/';
const browser=await chromium.launch({channel:'chromium',args:['--use-angle=metal','--enable-gpu','--ignore-gpu-blocklist']});
const page=await browser.newPage({viewport:{width:960,height:640},deviceScaleFactor:1});
const full=[],distant=[],old=[],errors=[];
page.on('pageerror',e=>errors.push(e.message));
page.on('response',r=>{
  const pathname=new URL(r.url()).pathname;
  if(pathname.endsWith('/gyeongbu/market.glb')||pathname.endsWith('/daiso/shop.glb'))old.push(pathname);
  if(!pathname.includes('/gyeongbu-fixtures/'))return;
  const file=pathname.split('/').at(-1);
  if(file.endsWith('.bin'))distant.push(file);
  if(file.endsWith('.glb'))full.push(file);
});
const coord=(u,v)=>[2.3+u*.9348+v*.3552,-59.24-u*.3552+v*.9348];
const direction=(du,dv)=>Math.atan2(-(du*.9348+dv*.3552),-(-du*.3552+dv*.9348))*180/Math.PI;
async function visit(floor,u,v,y,du,dv){
  full.length=0;distant.length=0;
  const [x,z]=coord(u,v),angle=direction(du,dv);
  await page.goto('about:blank');await page.goto(base+floor+'?p='+[x,y,z,angle].join(','));
  await page.waitForFunction(()=>window.__world?.ready,null,{timeout:150000});
  await page.evaluate(()=>{document.getElementById('start').click();window.__world.setTimeMode('day');});
  await page.waitForTimeout(400);
}
async function pose(u,v,y,du,dv){
  const [x,z]=coord(u,v),angle=direction(du,dv);
  await page.evaluate(p=>Object.assign(window.__world.player,p),{x,z,y,vy:0,yaw:angle*Math.PI/180,pitch:-.06});
  await page.waitForTimeout(260);
}
async function ready(name,lod){
  await page.waitForFunction(([name,lod])=>{
    const objects=window.__world.scene.getObjectsByProperty('name',name);
    return objects.some(o=>o.userData.fixtureDetail===lod);
  },[name,lod],{timeout:15000});
}
try{
  await visit('street',165,-19,0,0,1);
  assert.deepEqual(full,[]);assert.deepEqual(distant,[],'street requested concealed retail shelves');
  await visit('gyeongbu/3F',56,74,11,0,-1);
  assert.deepEqual(full,[]);assert.deepEqual(distant,[],'flower floor requested Daiso or clothing');
  await visit('gyeongbu/8F',38,104.72,34,0,1);
  await ready('경부 8F 여성복 · 의류','native');
  assert.deepEqual(full,['Womenswear.glb']);assert.deepEqual(distant,['Womenswear.bin']);
  const upper={native:[...full],distant:[...distant]};
  let paperAttempts=0;
  await page.route('**/gyeongbu-fixtures/PaperGoods.glb',route=>{
    paperAttempts++;
    return paperAttempts===1?route.abort('failed'):route.continue();
  });
  await visit('gyeongbu/B1',175.5,6.65,-4,0,1);
  assert.ok(!full.includes('PaperGoods.glb')&&!distant.includes('PaperGoods.bin'),'behind the player');
  await pose(175.5,6.65,-4,0,-1);
  const shelf='다이소 문구 · 사무';
  await ready(shelf,'distant');
  await ready(shelf,'native');
  assert.equal(paperAttempts,2,'the silhouette stays visible through a transient native asset failure');
  assert.ok(!full.includes('Tableware.glb')&&!full.includes('Organizers.glb'));
  const mesh=await page.evaluate(name=>{
    const o=window.__world.scene.getObjectByName(name);
    return {triangles:o.geometry.index.count/3,vertices:o.geometry.attributes.position.count,draws:o.count};
  },shelf);
  assert.equal(mesh.triangles,14882);
  await pose(205.7,6.65,-4,-30.2,-2.19);await ready(shelf,'distant');
  await pose(175.5,6.65,-4,0,-1);await ready(shelf,'native');
  assert.equal(full.filter(f=>f==='PaperGoods.glb').length,1);
  assert.equal(distant.filter(f=>f==='PaperGoods.bin').length,1);
  for(const [u,v,tu,tv,file,label] of [[188.7,6.65,188.7,4.46,'GiftWrap','선물 · 포장'],
    [201.9,6.65,201.9,4.46,'Snacks','스낵 · 간식'],[238.5,6.65,238.5,4.46,'CosmeticPads','뷰티 · 스킨케어'],
    [257.4,8.67,257.4,10.88,'Tableware','도자기 · 식기'],[280.85,3.34,280.85,.94,'Organizers','수납 · 정리']]){
    await pose(u,v,-4,tu-u,tv-v);await ready('다이소 '+label,'native');
    assert.equal(full.filter(f=>f===file+'.glb').length,1);
  }
  await pose(174.25,12.82,-4,.1,2.38);await ready('다이소 셀프 계산대','native');
  await pose(172.80,5.95,-4,-2.96,.05);await ready('다이소 1번 출입구 간판','native');
  const basement={native:[...full],distant:[...distant],mesh};
  for(const [floor,y,key] of [['2F',6,'Bedding'],['4F',16,'Curtains'],['6F',25,'Children'],['7F',29.5,'Suits'],['8F',34,'Womenswear']]){
    await visit('gyeongbu/'+floor,37.4,100.5,y,-1,0);
    await ready('경부선 도매 점포 · '+key,'featured');
    assert.ok(full.every(file=>file===key+'.glb'));
  }
  await visit('gyeongbu/1F',166,25.25,0,0,-1);
  await ready('경부 1F 무인발권기','native');assert.deepEqual(full,['Tickets.glb']);
  assert.deepEqual(old,[]);assert.deepEqual(errors,[]);
  console.log(JSON.stringify({upper,basement,old,errors},null,2));
}finally{await browser.close();await new Promise(resolve=>server.close(resolve));}
