import assert from 'node:assert/strict';
import {readFile,writeFile} from 'node:fs/promises';
import {chromium,devices} from 'playwright';
import {serve} from './serve.mjs';

const data = JSON.parse(await readFile(new URL('../data/osm.json',import.meta.url)));
const models = JSON.parse(await readFile(new URL('../js/places/_re_models.json',import.meta.url))).models;
const portrait = process.argv.includes('--portrait');
async function openMap(page) {
  if (portrait) {
    await page.locator('#btn-map').tap();
    if (!await page.locator('#map-search').isVisible()) await page.locator('.gt-panel-toggle').tap();
  } else await page.keyboard.press('m');
}

const server = await serve();
const browser = await chromium.launch({channel:'chromium',args:['--use-angle=metal','--enable-gpu','--ignore-gpu-blocklist']});
try {
  const cases = [
    ['신반포4차','apt-a13790828'], ['반포르엘','apt-a10023673'], ['반포센트럴자이','apt-a10024913','반센자이']
  ];
  for (const [name,id,alias] of cases) {
    const page = await browser.newPage(portrait
      ? {...devices['Pixel 7'],viewport:{width:390,height:844},deviceScaleFactor:1.5}
      : {viewport:{width:800,height:480}});
    const errors = [], fetched = [], gateResponses = [];
    page.on('pageerror',e=>errors.push(e.message));
    page.on('response',r=>{
      if (r.url().endsWith('/'+id+'.glb')) fetched.push(r.status());
      if (r.url().endsWith('/xi-portal.glb')) gateResponses.push(r.status());
    });
    await page.goto('http://127.0.0.1:'+server.address().port+'/?q=low&traffic=0&fixedres=1#/newcore/3F');
    await page.waitForFunction(()=>window.__world?.ready,null,{timeout:120000});
    assert.equal(await page.evaluate(()=>__world.area),'in:newcore');
    assert.equal(fetched.length,0);
    if (portrait) await page.locator('#start button').tap();
    else await page.locator('#start').click();
    await openMap(page);
    for (const query of [name,alias || name]) {
      await page.locator('#map-search').fill(query);
      assert.equal(await page.locator('.gt-result b').first().innerText(),name);
    }
    await page.locator('.gt-result').first().click();
    await page.locator('.gt-teleport').click();
    await page.waitForFunction(id=>window.__world?.ready && __world.scene.children.some(o=>o.visible && o.userData.re?.id===id),id,{timeout:120000});
    const model=models.find(m=>m.id===id);
    const vertex=data.buildings.find(b=>model.claims.includes(b.id)).poly[0];
    const metrics = await page.evaluate(async ({id,name,vertex,proof,portrait})=>{
      const {LANDMARKS} = await import('/js/landmarks.js');
      const landmark = LANDMARKS.find(row=>row.name===name);
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
      const [pinX,,pinZ]=landmark.roofPin;
      const pin=scene.children.find(o=>o.isSprite && Math.hypot(o.position.x-pinX,o.position.z-pinZ)<.01);
      if (!pin?.visible) throw Error('Missing rooftop name at the public sidewalk');
      const nameMask=[],underMinimap=[];
      const mini=document.querySelector('.gt-mini').getBoundingClientRect();
      const canvas=renderer.domElement.getBoundingClientRect();
      for (const mode of ['day','night']) {
        __world.setTimeMode(mode);
        const labelled=sample();
        pin.visible=false;
        const unlabelled=sample();
        pin.visible=true;
        let readable=0,covered=0;
        for(let i=0;i<labelled.length;i+=4) {
          if(Math.max(...[0,1,2].map(c=>Math.abs(labelled[i+c]-unlabelled[i+c])))<=32)continue;
          readable++;
          if(portrait){
            const x=canvas.left+(i/4%width+.5)*canvas.width/width;
            const y=canvas.top+(height-.5-Math.floor(i/4/width))*canvas.height/height;
            if(x>=mini.left && x<mini.right && y>=mini.top && y<mini.bottom)covered++;
          }
        }
        nameMask.push(readable); underMinimap.push(covered);
      }
      const point={x:p.x,z:p.z};
      phys.resolve(point,p.r,p.y,p.y+p.height,p.step);
      return {finished,baseline,pixels,nameMask,underMinimap,marker:[landmark.x,landmark.z],percent:100*pixels/(width*height),pitch:p.pitch*180/Math.PI,
        x:p.x,y:p.y,z:p.z,push:Math.hypot(point.x-p.x,point.z-p.z),errors:__world.errors};
    },{id,name,vertex,portrait,proof:!!process.env.PROOF_DIR});
    if (process.env.PROOF_DIR) {
      for (const type of ['finished','baseline']) {
        await writeFile(process.env.PROOF_DIR+'/'+id+'-'+type+'.png',Buffer.from(metrics[type].split(',')[1],'base64'));
      }
    }
    delete metrics.finished;
    delete metrics.baseline;
    console.log(name,JSON.stringify(metrics));
    const [px,pz]=metrics.marker, [[west,north],,[east,south]]=model.rect;
    assert.ok(px>=west && px<=east && pz>=north && pz<=south, name+' map marker outside its complex');
    assert.ok(metrics.nameMask.every(value=>value>60), name+' rooftop label hidden from the arrival view');
    if(portrait)assert.deepEqual(metrics.underMinimap,[0,0],name+' rooftop label overlaps the minimap');
    assert.ok(metrics.percent>2 && metrics.pitch>5 && metrics.push<.05);
    assert.deepEqual([...metrics.errors,...errors],[]);
    assert.deepEqual(fetched,[200]);
    if(id==='apt-a10024913'){
      assert.deepEqual(gateResponses,[],'the apartment skyline does not request the gate finish');
      await openMap(page);
      const search=page.locator('#map-search');
      for(const query of ['반포센트럴자이 문주','은빛 문주']){
        await search.fill(query);
        assert.deepEqual(await page.locator('.gt-result b').allInnerTexts(),['반포센트럴자이 문주']);
      }
      await page.locator('.gt-result').click();
      await page.locator('.gt-teleport').click();
      const gateView=portrait?[-179.37,-86.65,13.82]:[-186.61,-103.16,4.57];
      await page.waitForFunction(([x,z,yaw])=>{
        const w=__world,p=w.player,gate=w.scene.getObjectByName('반포센트럴자이 · 은빛 문주');
        return Math.hypot(p.x-x,p.z-z)<.08 && Math.abs(p.yaw*180/Math.PI-yaw)<.6 &&
          gate?.children[0].geometry.index.count>288;
      },gateView,{timeout:45000});
      const feetInFrame=await page.evaluate(async()=>{
        const {rings}=await import('/assets/models/banpo-xi-portal/profile.js');
        const T=await import('three'),w=__world,gate=w.scene.getObjectByName('반포센트럴자이 · 은빛 문주');
        return [rings[0],rings.at(-1)].flat().every(v=>{
          const p=new T.Vector3(...v).applyMatrix4(gate.matrixWorld).project(w.camera);
          return Math.abs(p.x)<1&&Math.abs(p.y)<1;
        });
      });
      assert.ok(feetInFrame,'both feet of the silver gate fit the search arrival view');
      assert.deepEqual(gateResponses,[200]);
      assert.deepEqual(errors,[]);
    }
    await page.close();
  }
} finally { await browser.close(); await new Promise(resolve=>server.close(resolve)); }
