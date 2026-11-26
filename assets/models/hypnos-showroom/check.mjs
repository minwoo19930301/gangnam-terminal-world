// Run with node from the repository root. Exercise startup, floor culling and a shop approach.
import assert from 'node:assert/strict';
import {chromium} from 'playwright';
import {serve} from '../../../tests/serve.mjs';

const server = await serve(0);
const base = 'http://127.0.0.1:'+server.address().port;
const browser = await chromium.launch({channel:'chromium',args:['--enable-gpu','--ignore-gpu-blocklist','--use-angle=metal']});
const camera = [-49.79861,40.6,-24.88186,-59.468];
const distant = [-23,40.6,14,-8];
const prefix = '히프노스 9F · ';
const route = (floor,[x,y,z,yaw]) => base+'/?pos='+[x,y,z]+'&yaw='+yaw+'&pitch=-6#/shinsegae/'+floor;
const ready = page => page.waitForFunction(() => window.__world?.ready,null,{timeout:90000});
async function teleport(page,[x,y,z,yaw]) {
  await page.evaluate(([x,y,z,yaw]) => {
    window.__world.player.teleport(x,y,z,yaw*Math.PI/180);
  },[x,y,z,yaw]);
  await page.waitForTimeout(600);
}
try {
  const page = await browser.newPage();
  const errors = [];
  let fetches = 0;
  page.on('pageerror',error=>errors.push(error.message));
  page.on('request',request=>{if(request.url().endsWith('/hypnos-showroom/showroom.glb')) fetches++;});
  await page.goto(route('8F',[camera[0],35.8,camera[2],camera[3]]));
  await ready(page);
  await page.waitForTimeout(500);
  assert.equal(fetches,0,'same location on 8F');
  await page.goto(route('9F',distant));
  await ready(page);
  await page.waitForTimeout(500);
  assert.equal(fetches,0,'distant showroom on 9F');
  await teleport(page,camera);
  await page.waitForFunction(prefix=>window.__world.scene.getObjectByName(prefix+'cloth')?.visible,prefix);
  assert.equal(fetches,1);
  const close = await page.evaluate(prefix=>window.__world.scene.getObjectByName(prefix+'cloth').parent.children
    .filter(mesh=>mesh.visible&&mesh.isMesh).length,prefix);
  assert.equal(close,4);
  const endpointError = await page.evaluate(async () => {
    const {createPlayer} = await import('/js/physics.js');
    const point = (a,b) => [-53.1922104+.35638990*a+.93349956*b, -26.2138896+.93422708*a-.35437878*b];
    const [x,z] = point(2.45,-.85), [tx,tz] = point(2.45,3);
    const p = createPlayer(window.__world.phys);
    p.teleport(x,40.6,z,Math.atan2(x-tx,z-tz));
    for(let i=0;i<300&&Math.hypot(p.x-tx,p.z-tz)>.07;i++) p.update(1/60,{f:1,s:0});
    return Math.max(Math.abs(p.y-40.6),Math.hypot(p.x-tx,p.z-tz));
  });
  assert.ok(endpointError<.08,'walk from aisle to central display');
  await teleport(page,distant);
  assert.equal(await page.evaluate(prefix=>window.__world.scene.getObjectByName(prefix+'cloth').parent.visible,prefix),false);
  await teleport(page,camera);
  assert.equal(await page.evaluate(prefix=>window.__world.scene.getObjectByName(prefix+'cloth').parent.visible,prefix),true);
  assert.equal(fetches,1);
  assert.deepEqual(errors,[]);

  const offline = await browser.newPage();
  await offline.route('**/hypnos-showroom/showroom.glb',request=>request.abort());
  await offline.goto(route('9F',camera));
  await ready(offline);
  await offline.waitForTimeout(500);
  assert.equal(await offline.evaluate(()=>window.__world.scene.getObjectByName('히프노스 침대 · 원거리')
    .geometry.getAttribute('position').count/3),156);
  console.log('Hypnos 9F passed: four near draws, one download on return, 156-triangle fallback and customer aisle walk.');
} finally {
  await browser.close();
  await new Promise(resolve=>server.close(resolve));
}
