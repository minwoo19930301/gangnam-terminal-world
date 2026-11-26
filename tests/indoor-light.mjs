// Normal public-floor entry. Sample specific materials so a bright sign or floor
// cannot hide a black shop soffit. Run with --gpu to use Metal Chromium.
import assert from 'node:assert/strict';
import { chromium } from 'playwright';
import { serve } from './serve.mjs';

const server = await serve(0);
const gpu = process.argv.includes('--gpu');
const browser = await chromium.launch(gpu
  ? { channel: 'chromium', args: ['--use-angle=metal', '--enable-gpu', '--ignore-gpu-blocklist'] }
  : { args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader'] });
const probes = [
  // Right-hand overhead fascia beyond the first set of black grocery shelving.
  { route: '/#/shinsegae/B1', zone: '신세계 마켓', region: [.85,.12,.97,.21], min: .4, max: .95, modes: ['day','night'] },
  { route: '/?pitch=-29#/jwmarriott/2F?p=-26.3945,6,124.0341,-65.87',
    zone: '파티세리 · 티 바', region: [.2,.35,.8,.8], min: .75, max: 1.5, modes: ['day','sunrise','sunset','night'] },
  { route: '/#/famille/4F', zone: '파미에가든', region: [.2,.35,.8,.8], min: 0, max: .15, modes: ['day','night'] },
];
try {
  for (const { route, zone, region, modes, min, max } of probes) {
    const page = await browser.newPage({viewport:{width:900,height:552}});
    await page.goto('http://127.0.0.1:' + server.address().port + route);
    await page.waitForFunction(() => window.__world?.ready);
    await page.locator('#start').click();
    await page.waitForTimeout(750);
    const values = {};
    for (const mode of modes) {
      await page.selectOption('#sky-mode', mode);
      const read = await page.evaluate(async ([left,top,right,bottom]) => {
        await new Promise(r => requestAnimationFrame(() => requestAnimationFrame(r)));
        const { renderer, scene, camera, phys, player } = window.__world;
        renderer.render(scene,camera);
        const gl = renderer.getContext();
        const w = gl.drawingBufferWidth, h = gl.drawingBufferHeight;
        const width = Math.floor((right-left)*w), height = Math.floor((bottom-top)*h);
        const pixels = new Uint8Array(width*height*4);
        gl.readPixels(Math.floor(left*w),Math.floor((1-bottom)*h),width,height,gl.RGBA,gl.UNSIGNED_BYTE,pixels);
        const linear = Array.from({length:256}, (_,i) => {
          const s = i/255;
          return s <= .04045 ? s/12.92 : ((s+.055)/1.055)**2.4;
        });
        const samples = [];
        for (let i=0; i<pixels.length; i+=16) {
          samples.push(.2126*linear[pixels[i]]+.7152*linear[pixels[i+1]]+.0722*linear[pixels[i+2]]);
        }
        samples.sort((a,b) => a-b);
        return { y:samples[Math.floor(samples.length/2)], zone:phys.zoneAt(player.x,player.y+.1,player.z)?.name };
      },region);
      assert.equal(read.zone,zone);
      values[mode] = read.y;
    }
    console.log(zone, values);
    for (const mode of modes.slice(1)) {
      const ratio = values[mode]/values.day;
      assert.ok(ratio > min && ratio < max, zone + ' ' + mode + ' material luminance ratio ' + ratio);
    }
    await page.close();
  }
} finally {
  await browser.close();
  await new Promise(resolve => server.close(resolve));
}
