// Exercise the actual WebGL depth test and GLTFLoader while controlling a window,
// the viewing direction, and a teleport to another neighbourhood.
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { chromium } from 'playwright';
import { serve } from './serve.mjs';

const catalog = JSON.parse(await readFile(new URL('../js/places/_re_models.json', import.meta.url))).models;
for (const model of catalog.filter(m=>!m.claims.length)) {
  const [points,faces] = model.silhouette.map(value=>Buffer.from(value,'base64'));
  assert.ok(points.length && faces.length && points.length%6===0 && faces.length%3===0);
  assert.ok([...faces].every(i=>i<points.length/6),model.name);
}
const server = await serve(0), base='http://127.0.0.1:'+server.address().port;
const browser = await chromium.launch(process.argv.includes('--gpu')
  ? {channel:'chromium',args:['--use-angle=metal','--ignore-gpu-blocklist','--enable-gpu']}
  : {args:['--use-angle=swiftshader','--enable-unsafe-swiftshader']});
try {
  const page = await browser.newPage({viewport:{width:650,height:400}});
  const fetched = [], errors = [];
  page.on('pageerror',e=>errors.push(e.message));
  page.on('console',m=>{if(m.text().includes('Shader Error')) errors.push(m.text());});
  page.on('request',r=>{
    const u = new URL(r.url());
    if (u.searchParams.has('tower')) fetched.push(u.searchParams.get('tower'));
  });
  await page.route('**/estate-stream-test', route=>route.fulfill({
    contentType:'text/html',body:'<script type="importmap">'+JSON.stringify({imports:{
      three:'/assets/vendor/three-r160/three.module.min.js','three/addons/':'/assets/vendor/three-r160/'
    }})+'</script>'
  }));
  await page.goto(base+'/estate-stream-test');
  await page.evaluate(async()=>{
    const THREE = await import('three');
    const {loadReModels} = await import('/js/remodels.js');
    const scene = new THREE.Scene(), renderer = new THREE.WebGLRenderer({logarithmicDepthBuffer:true});
    renderer.setSize(650,400);
    document.body.append(renderer.domElement);
    const camera = new THREE.PerspectiveCamera(66,650/400,.1,1400);
    camera.position.set(0,3,0);
    const footprint=(id,x,z)=>({id,x,y:0,z,yaw:0,height:8,
      rect:[[x-3,z-3],[x+3,z-3],[x+3,z+3],[x-3,z+3]],claims:[],
      file:'/assets/re/apt-a10023462.glb?tower='+id});
    const wall=new THREE.Mesh(new THREE.BoxGeometry(20,24,.5),new THREE.MeshBasicMaterial());
    wall.position.set(0,4,-5);
    scene.add(wall);
    const models=[footprint('front',0,-35),footprint('back',0,35),footprint('next',1000,-35)];
    const streamer=loadReModels({THREE,scene,renderer,models,stand:new Map(),terrain:false});
    const step=now=>{streamer.update(camera,now);renderer.render(scene,camera);};
    window.testView={camera,wall,scene,renderer,step,paused:false};
    const frame=now=>{if(!testView.paused)step(now);requestAnimationFrame(frame);};
    requestAnimationFrame(frame);
  });
  await page.waitForTimeout(1700);
  assert.deepEqual(fetched,[],'an opaque wall, a reverse view, and a far district should not fetch');
  await page.evaluate(()=>{testView.wall.visible=false;});
  const shown=id=>page.waitForFunction(id=>testView.scene.children.some(m=>m.userData.re?.id===id&&m.visible),id,{timeout:15000});
  await shown('front');
  assert.deepEqual(fetched,['front']);
  // Turn while the previous frame's real depth query is in flight. The tower
  // stays in the frustum while the 21° turn makes that old result inapplicable.
  const retained=await page.evaluate(async()=>{
    const v=testView,gl=v.renderer.getContext(),now=performance.now()+5000;
    v.paused=true;
    try {
      const begin=gl.beginQuery.bind(gl);
      let pending;
      gl.beginQuery=(target,query)=>{pending=query;begin(target,query);};
      try{v.step(now);}finally{delete gl.beginQuery;}
      if(!pending)throw Error('Expected a repeat visibility probe for the loaded facade');
      const deadline=performance.now()+4500;
      while(!gl.getQueryParameter(pending,gl.QUERY_RESULT_AVAILABLE)) {
        if(performance.now()>deadline)throw Error('Timed out waiting for the GPU visibility probe');
        await new Promise(requestAnimationFrame);
      }
      v.camera.rotation.y=.37;
      v.camera.updateMatrixWorld(true);
      v.step(now+120);
      return v.scene.children.find(o=>o.userData.re?.id==='front').visible;
    } finally {v.paused=false;}
  });
  assert.equal(retained,true,'a stale probe must not replace a still-visible loaded facade with its silhouette');
  await page.evaluate(()=>{testView.camera.rotation.y=Math.PI;});
  await shown('back');
  assert.deepEqual(fetched,['front','back']);
  await page.evaluate(()=>{testView.camera.rotation.y=0;});
  await shown('front');
  assert.deepEqual(fetched,['front','back'],'revisiting a facade should reuse its geometry');
  await page.evaluate(()=>{testView.camera.position.x=1000;});
  await shown('next');
  assert.deepEqual(fetched,['front','back','next']);
  assert.deepEqual(errors,[]);
  console.log('Visible facade streaming passed for walls, openings, turns, warm returns, teleport and unclaimed skyline models.');

  if (process.argv.includes('--entries')) {
    const manifests = new Map(catalog.map(m=>['/'+m.file,m]));
    for (const [name,hash] of [['거리',''],['호텔 8층','#/jwmarriott/8F'],['파미에 1층','#/famille/1F']]) {
      const entry = await browser.newPage({viewport:{width:900,height:540}});
      const files = new Set();
      entry.on('request',request=>{
        const m = manifests.get(new URL(request.url()).pathname);
        if (m) files.add(m);
      });
      await entry.goto(base+'/index.html'+hash,{waitUntil:'domcontentloaded'});
      await entry.waitForFunction(()=>window.__world?.ready,null,{timeout:120000});
      await entry.waitForTimeout(12000);
      const bytes = [...files].reduce((total,m)=>total+m.bytes,0);
      console.log(name, files.size+' GLBs', (bytes/1048576).toFixed(3)+' MiB');
      assert.deepEqual(await entry.evaluate(()=>window.__world.errors),[]);
      if (!hash) assert.ok(files.size<catalog.length/3,'initial street view fetched distant estates');
      await entry.close();
    }
  }
} finally {
  await browser.close();
  await new Promise(resolve=>server.close(resolve));
}
