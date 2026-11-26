// Check the visible Blender treads and the open garden above the main atrium.
import assert from 'node:assert/strict';
import {chromium} from 'playwright';
import {serve} from './serve.mjs';

const server = await serve();
const browser = await chromium.launch(process.argv.includes('--gpu')
  ? {channel:'chromium',args:['--use-angle=metal','--enable-gpu','--ignore-gpu-blocklist']}
  : {args:['--use-angle=swiftshader','--enable-unsafe-swiftshader']});

try {
  const views = [
    ['6F', [-62.84244,26.2,14.99407,20.7,9]],
    ['9F', [-31.16769,40.6,77.71579,200.79,0]],
  ];
  for (const [floor, pose] of views) {
    const page = await browser.newPage({viewport:{width:960,height:600}});
    try {
      await page.addInitScript(() => sessionStorage.setItem('sky-mode','night'));
      await page.goto('http://127.0.0.1:'+server.address().port+'/?fixedres=1&traffic=0#/shinsegae/'+floor+'?p='+pose.join(','));
      await page.waitForFunction(() => window.__world?.ready, null, {timeout:120000});
      await page.locator('#start').click();
      await page.waitForFunction(() => {
        let found = false;
        __world.scene.traverseVisible(o => { if (o.isMesh && o.name.includes(' · Tread')) found = true; });
        return found;
      }, null, {timeout:90000});
      const {samples,roof,errors} = await page.evaluate(() => {
        const {K,scene,camera,renderer} = __world, T = K.THREE;
        const uniforms = T.ShaderLib.lambert.uniforms;
        const {width,height,depth,data} = uniforms.roomLightMap.value.image;
        const origin = uniforms.roomOrigin.value, inverse = uniforms.roomInverseSize.value;
        function lightAt(p) {
          const i = Math.floor((p.x-origin.x)*inverse.x*width);
          const j = Math.floor((p.z-origin.y)*inverse.y*height);
          const k = Math.floor((p.y-origin.z)*inverse.z*depth);
          return data[(k*height+j)*width+i];
        }
        renderer.render(scene,camera);
        const canvas = document.createElement('canvas');
        canvas.width=240; canvas.height=150;
        const ctx=canvas.getContext('2d',{willReadFrequently:true});
        ctx.drawImage(renderer.domElement,0,0,240,150);
        const pixels=ctx.getImageData(0,0,240,150).data, meshes=[];
        scene.traverseVisible(o => {
          if(o.isMesh && o!==__world.daylight.sky && o.layers.test(camera.layers) && o.material?.colorWrite!==false) meshes.push(o);
        });
        const ray = new T.Raycaster();
        ray.far=65;
        const samples=[];
        for(const x of [-.21,0,.21]) for(const y of [-.42,-.22,0,.18]) {
          ray.setFromCamera(new T.Vector2(x,y),camera);
          const hit=ray.intersectObjects(meshes,false)[0];
          if(!hit?.object.name.includes(' · Tread')) continue;
          const normal=hit.face.normal.clone().applyNormalMatrix(new T.Matrix3().getNormalMatrix(hit.object.matrixWorld));
          const cell=4*(Math.floor((1-y)*75)*240+Math.floor((1+x)*120));
          const luma=.2126*pixels[cell]+.7152*pixels[cell+1]+.0722*pixels[cell+2];
          samples.push({room:lightAt(hit.point.clone().addScaledVector(normal,.48)),luma});
        }
        // 11F S Garden, directly over the 10F atrium's solid ceiling.
        const roof=lightAt(new T.Vector3(-60.18,52.6,1.74));
        return {samples,roof,errors:[...__world.errors,...K._.detailErrors]};
      });
      assert.ok(samples.length>=2,'No visible steps at the '+floor+' public landing');
      assert.ok(samples.every(s=>s.room>220 && s.luma>22),'Unlit visible steps at '+floor+': '+JSON.stringify(samples));
      assert.equal(roof,0,'Indoor lighting extended above the garden floor');
      assert.deepEqual(errors,[]);
      console.log(floor,JSON.stringify(samples));
    } finally {await page.close();}
  }
} finally {
  await browser.close();
  await new Promise(resolve=>server.close(resolve));
}
