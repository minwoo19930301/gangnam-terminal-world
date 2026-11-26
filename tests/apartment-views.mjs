import assert from 'node:assert/strict';
import {readFile,writeFile} from 'node:fs/promises';
import {chromium} from 'playwright';
import {serve} from './serve.mjs';

const data = JSON.parse(await readFile(new URL('../data/osm.json',import.meta.url)));
const models = JSON.parse(await readFile(new URL('../js/places/_re_models.json',import.meta.url))).models;
const server = await serve();
const browser = await chromium.launch({channel:'chromium',args:['--use-angle=metal','--enable-gpu','--ignore-gpu-blocklist']});
try {
  const cases = [
    ['신반포4차','apt-a13790828'], ['반포르엘','apt-a10023673'], ['반포센트럴자이','apt-a10024913','반센자이']
  ];
  for (const [name,id,alias] of cases) {
    const page = await browser.newPage({viewport:{width:800,height:480}});
    const errors = [], fetched = [];
    page.on('pageerror',e=>errors.push(e.message));
    page.on('response',r=>{ if (r.url().endsWith('/'+id+'.glb')) fetched.push(r.status()); });
    await page.goto('http://127.0.0.1:'+server.address().port+'/?q=low&traffic=0&fixedres=1#/newcore/3F');
    await page.waitForFunction(()=>window.__world?.ready,null,{timeout:120000});
    assert.equal(await page.evaluate(()=>__world.area),'in:newcore');
    assert.equal(fetched.length,0);
    await page.locator('#start').click();
    await page.keyboard.press('m');
    for (const query of [name,alias || name]) {
      await page.locator('#map-search').fill(query);
      assert.equal(await page.locator('.gt-result b').first().innerText(),name);
    }
    await page.locator('.gt-result').first().click();
    await page.locator('.gt-teleport').click();
    await page.waitForFunction(id=>window.__world?.ready && __world.scene.children.some(o=>o.visible && o.userData.re?.id===id),id,{timeout:120000});
    const model=models.find(m=>m.id===id);
    const vertex=data.buildings.find(b=>model.claims.includes(b.id)).poly[0];
    const metrics = await page.evaluate(({id,vertex,proof})=>{
      const {renderer,scene,camera,player:p,phys}=__world;
      __world.setTimeMode('day');
      const object=scene.children.find(o=>o.visible && o.userData.re?.id===id);
      const stand=scene.children.find(o=>o.userData.sites?.some(s=>s.poly[0][0]===vertex[0] && s.poly[0][1]===vertex[1]));
      if (!stand || stand.visible) throw Error('Expected detailed model to replace its public building silhouette');
      const gl=renderer.getContext(),width=gl.drawingBufferWidth,height=gl.drawingBufferHeight;
      function sample(){
        renderer.render(scene,camera);
        const bytes=new Uint8Array(width*height*4);
        gl.readPixels(0,0,width,height,gl.RGBA,gl.UNSIGNED_BYTE,bytes);
        return bytes;
      }
      const normal=sample();
      const finished=proof ? renderer.domElement.toDataURL('image/png') : null;
      object.visible=false;
      stand.visible=true;
      const hidden=sample();
      const baseline=proof ? renderer.domElement.toDataURL('image/png') : null;
      stand.visible=false;
      object.visible=true;
      sample();
      let pixels=0;
      for(let i=0;i<normal.length;i+=4)
        if(Math.max(...[0,1,2].map(c=>Math.abs(normal[i+c]-hidden[i+c])))>8) pixels++;
      const point={x:p.x,z:p.z};
      phys.resolve(point,p.r,p.y,p.y+p.height,p.step);
      return {finished,baseline,pixels,percent:100*pixels/(width*height),pitch:p.pitch*180/Math.PI,
        x:p.x,y:p.y,z:p.z,push:Math.hypot(point.x-p.x,point.z-p.z),errors:__world.errors};
    },{id,vertex,proof:!!process.env.PROOF_DIR});
    if (process.env.PROOF_DIR) {
      for (const type of ['finished','baseline']) {
        await writeFile(process.env.PROOF_DIR+'/'+id+'-'+type+'.png',Buffer.from(metrics[type].split(',')[1],'base64'));
      }
    }
    delete metrics.finished;
    delete metrics.baseline;
    console.log(name,JSON.stringify(metrics));
    assert.ok(metrics.percent>2 && metrics.pitch>5 && metrics.push<.05);
    assert.deepEqual([...metrics.errors,...errors],[]);
    assert.deepEqual(fetched,[200]);
    await page.close();
  }
} finally { await browser.close(); await new Promise(resolve=>server.close(resolve)); }
