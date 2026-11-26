// Verify the 10F escalator ceiling and the public roof garden immediately above it.
import assert from 'node:assert/strict';
import {chromium} from 'playwright';
import {serve} from './serve.mjs';

const server = await serve(0);
const base = 'http://127.0.0.1:' + server.address().port;
const browser = await chromium.launch(process.argv.includes('--gpu')
  ? {channel:'chromium', args:['--use-angle=metal','--enable-gpu','--ignore-gpu-blocklist']}
  : {args:['--use-angle=swiftshader','--enable-unsafe-swiftshader']});
const u = 34.5 / 67, v = 41 / 84.7;
const garden = [-107.07 + 62.61*u + 30.43*v - .32*u*v, -24.31 - 23.77*u + 79.03*v + .13*u*v];

async function view(floor, pose, fixtureVisible) {
  const page = await browser.newPage({viewport:{width:850,height:530}});
  const statuses = [], errors = [];
  const isCeiling = response => new URL(response.url()).pathname.endsWith('/ssg-atrium-soffit/ceiling.glb');
  const detail = fixtureVisible ? page.waitForResponse(isCeiling, {timeout:120000}) : null;
  page.on('pageerror', error => errors.push(error.message));
  page.on('response', reply => {
    if (isCeiling(reply)) statuses.push(reply.status());
  });
  try {
    await page.addInitScript(() => sessionStorage.setItem('sky-mode','night'));
    await page.goto(base + '/?q=low&traffic=0#/shinsegae/' + floor + '?p=' + pose.join(','));
    await page.waitForFunction(() => window.__world?.ready, null, {timeout:120000});
    await page.locator('#start').click();
    if (detail) await detail;
    await page.waitForTimeout(600);
    const result = await page.evaluate(garden => {
      const w = __world, scene = w.scene, sky = w.daylight.sky, r = w.renderer;
      const canvas = document.createElement('canvas');
      canvas.width = 96; canvas.height = 60;
      const ctx = canvas.getContext('2d', {willReadFrequently:true});
      const background = scene.background, visible = sky.visible;
      function backdrop(color) {
        scene.background = new w.K.THREE.Color(color);
        r.render(scene,w.camera);
        ctx.drawImage(r.domElement,0,0,96,60);
        return ctx.getImageData(0,0,96,60).data;
      }
      let open = 0;
      try {
        sky.visible = false;
        const pink = backdrop(0xff00ff), green = backdrop(0x00ff00);
        for (let i=0; i<pink.length; i+=4) {
          if (pink[i]-green[i]>110 && green[i+1]-pink[i+1]>110) open++;
        }
      } finally {
        scene.background = background;
        sky.visible = visible;
      }
      return {sky:open/(96*60), roof:w.phys.support(garden[0],garden[1],50.3).y,
        ceiling:w.phys.ceilingAbove(garden[0],garden[1],46.4,54.5), foot:w.player.y,
        zone:document.querySelector('#zone').innerText, errors:[...w.errors,...w.K._.detailErrors]};
    }, garden);
    assert.deepEqual(statuses,fixtureVisible?[200]:[]);
    assert.deepEqual(errors.concat(result.errors),[]);
    assert.ok(Math.abs(result.roof-50.2)<.02);
    assert.ok(Math.abs(result.ceiling-49.6)<.02);
    return result;
  } finally { await page.close(); }
}

try {
  const inside = await view('10F',[-67.60033,45.4,2.57592,274.917,12],true);
  assert.ok(inside.sky<.001,'sky visible through the public garden floor');
  assert.match(inside.zone,/본관 아트리움/);
  const outside = await view('11F',[garden[0],50.2,garden[1],90,78],false);
  assert.ok(outside.sky>.70,'the outdoor garden is covered by an indoor ceiling');
  assert.ok(Math.abs(outside.foot-50.2)<.1);
  await view('10F',[-69.26,45.4,1.55,95,-8],false);
  console.log('The ceiling closes the 10F main escalator hall. The 11F garden remains walkable and open to the sky.');
} finally {
  await browser.close();
  await new Promise(resolve => server.close(resolve));
}
