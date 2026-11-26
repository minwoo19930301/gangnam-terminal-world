import assert from 'node:assert/strict';
import {chromium} from 'playwright';
import {serve} from '../../../tests/serve.mjs';

const names={booth:'상점 마감과 면사 울사 전문도매 표지',yarn:'종이띠를 두른 면사와 울사 실타래',
  wrap:'도매 묶음의 투명 봉투와 접힌 이음매',dresses:'새틴 허리띠와 자수 주름 아동 드레스'};
const position=(width,depth)=>{const u=34.2+depth,v=118.5-width;return [2.3+u*.9348+v*.3552,-59.24-u*.3552+v*.9348];};
function pose(width,depth,target,far,y=25){
  const[x,z]=position(width,depth),[a,b]=position(target,far);return{x,z,y,vy:0,yaw:Math.atan2(x-a,z-b),pitch:-.10};
}
const server=await serve(0),browser=await chromium.launch({channel:'chromium',args:['--use-angle=metal','--enable-gpu','--ignore-gpu-blocklist']});
try{
  const page=await browser.newPage({viewport:{width:1110,height:735},deviceScaleFactor:1}),requests={},errors=[];
  page.on('pageerror',e=>errors.push(e.message));
  page.on('response',r=>{
    if(r.url().includes('/gyeongbu-yarn-and-dresses/')&&/\.(glb|webp)$/.test(r.url())){
      const key=r.url().split('/').at(-1);(requests[key]??=[]).push(r.status());
    }
  });
  async function enter(floor,c){
    await page.goto('about:blank');
    await page.goto('http://127.0.0.1:'+server.address().port+'/index.html?fixedres=1#/gyeongbu/'+floor+'?p='+[c.x,c.y,c.z,c.yaw*180/Math.PI].join(','));
    await page.waitForFunction(()=>window.__world?.ready,null,{timeout:140000});
    await page.locator('#start').click();await page.waitForTimeout(550);
  }
  async function camera(c){
    await page.evaluate(c=>Object.assign(__world.player,c),c);await page.waitForTimeout(360);
  }
  async function part(key){
    const name='경부선 6층 · '+names[key];
    await page.waitForFunction(({name,key})=>{const m=__world.scene.getObjectByName(name)?.children[0]?.material;return key==='wrap'?m?.envMap:m?.normalMap;},{name,key});
    return page.evaluate(n=>{
      const o=__world.scene.getObjectByName(n),m=o.children[0].material;
      return {draws:o.children.length,tri:o.children[0].geometry.index.count/3,map:m.map?.uuid,
        blended:m.transparent,sizes:[m.map,m.normalMap,m.roughnessMap,m.emissiveMap].filter(Boolean).map(t=>t.image.width)};
    },name);
  }
  await enter('7F',pose(-.06,1.65,1.55,.85,29.5));assert.deepEqual(requests,{});
  await enter('6F',pose(-.06,1.65,-.06,4.65));assert.deepEqual(requests,{});
  await camera(pose(-.06,1.65,1.55,.95));
  const parts={yarn:await part('yarn'),wrap:await part('wrap')};
  assert.equal(requests['dresses.glb'],undefined,'left-hand dresses stay unloaded from the right-hand yarn view');
  const rightOnly=structuredClone(requests);
  await camera(pose(-.12,2.87,-.97,-.37));
  parts.dresses=await part('dresses');parts.booth=await part('booth');
  assert.ok(parts.yarn.tri<28000&&parts.dresses.tri<20000);
  for(const [key,p] of Object.entries(parts)){
    assert.equal(p.draws,1,key);
    if(key!=='wrap'){assert.equal(p.map,parts.yarn.map,key);assert.deepEqual(p.sizes,[768,384,192,192]);}
    else assert.equal(p.blended,true);
  }
  const lane=await page.evaluate(()=>{
    const w=__world,result=[];
    for(let v=114.3;v<=122;v+=.16)for(const u of [36.52,37.02,37.52]){
      const x=2.3+u*.9348+v*.3552,z=-59.24-u*.3552+v*.9348,p={x,z};
      w.phys.resolve(p,.32,25,26.75,.5);
      if(Math.hypot(p.x-x,p.z-z)>.06||Math.abs(w.phys.support(x,z,25.45).y-25)>.06)result.push([u,v]);
    }
    return result;
  });assert.deepEqual(lane,[],'three lanes through this part of the public market');
  const start=pose(3.37,2.85,-3.1,2.85);await camera(start);
  await page.keyboard.down('w');
  const distance=await page.evaluate(()=>new Promise(done=>{
    const p=__world.player,[x,z]=[p.x,p.z];let frames=0;
    function sample(){const d=Math.hypot(p.x-x,p.z-z);if(d>=6.2||frames++>=240)done(d);else requestAnimationFrame(sample);}sample();
  }));
  await page.keyboard.up('w');assert.ok(distance>=6.2,'walked through the frontage');
  for(const mode of ['day','sunrise','sunset','night','live'])assert.equal(await page.evaluate(m=>{__world.setTimeMode(m);return __world.daylight.state.mode;},mode),mode);
  await camera(pose(-.15,2.9,0,-.4));await part('yarn');
  for(const key of [...Object.keys(names).map(k=>k+'.glb'),'surface.webp','weave-normal.webp','metal-rough.webp','lamp.webp'])
    assert.deepEqual(requests[key],[200],key+' requested once');
  assert.deepEqual(errors,[]);console.log(JSON.stringify({rightOnly,parts,distance,lane,requests,errors},null,2));
}finally{await browser.close();await new Promise(done=>server.close(done));}
