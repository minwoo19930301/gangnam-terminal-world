// The editable lining should be seen from the third-floor rail before and after a delayed download.
import assert from 'node:assert/strict';
import {chromium} from 'playwright';
import {serve} from './serve.mjs';

const server=await serve(0);
const root='http://127.0.0.1:'+server.address().port;
const browser=await chromium.launch({channel:'chromium',args:['--use-angle=metal','--enable-gpu','--ignore-gpu-blocklist']});
const groupName='파미에파크 · 돔 안쪽 삼각 천장';
const errors=[];
function triangles(name){
  const geometry=__world.scene.getObjectByName(name)?.children[0]?.geometry;
  return geometry?(geometry.index?.count??geometry.attributes.position.count)/3:0;
}
try{
  for(const [address,near] of [
    ['shinsegae/B1?destination=sweet-park',false],
    ['centralcity/B1?destination=sweet-park',false],
    ['famille/3F?p=-47,9.6,222.3,0,39',true],
  ]){
    const page=await browser.newPage({viewport:{width:960,height:600}});
    page.on('pageerror',e=>errors.push(e.message));
    let requests=0,release;
    const gate=new Promise(resolve=>{release=resolve;});
    await page.route('**/famille-dome/lining.glb',async route=>{requests++;await gate;await route.continue();});
    try{
      await page.goto(root+'/?traffic=0&fixedres=1&q=low#/'+address);
      await page.waitForFunction(()=>__world?.ready,null,{timeout:90000});await page.locator('#start').click();
      await page.selectOption('#sky-mode','night',{force:true});await page.waitForTimeout(600);
      const initial=await page.evaluate(triangles,groupName);
      assert.equal(requests,Number(near));
      if(near){
        assert.ok(initial>35&&initial<200,'pavilion proxy missing');
        release();
        await page.waitForFunction(name=>{
          const g=__world.scene.getObjectByName(name).children[0].geometry;
          return (g.index?.count??g.attributes.position.count)/3>1000;
        },groupName);
        const full=await page.evaluate(triangles,groupName);assert.equal(requests,1);
        assert.match(await page.locator('#zone').innerText(),/파미에파크R.*3F/);
        console.log('pavilion rail',initial,full,requests);
      }
      assert.deepEqual(await page.evaluate(()=>[...__world.errors,...__world.K._.detailErrors]),[]);
    } finally { release(); await page.close(); }
  }
  assert.deepEqual(errors,[]);
}finally{await browser.close();await new Promise(resolve=>server.close(resolve));}
