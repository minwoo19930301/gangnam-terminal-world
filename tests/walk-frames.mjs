// Frame times during the first 82 m of a normal walk through Famille 1F.
// Run with node tests/walk-frames.mjs [repetitions] on a Mac with Metal Chromium.
import assert from 'node:assert/strict';
import { chromium } from 'playwright';
import { serve } from './serve.mjs';

const repetitions = Number(process.argv[2] ?? 2);
assert.ok(Number.isInteger(repetitions) && repetitions > 0, 'expected a positive repetition count');
const server = await serve(0);
const browser = await chromium.launch({
  channel: 'chromium', args: ['--use-angle=metal','--enable-gpu','--ignore-gpu-blocklist'],
});
// Start at the south end of the straight aisle, facing along its length.
const norm = Math.hypot(.3639,.9315), ax = .3639/norm, az = .9315/norm;
const x = -135.7 + 189.5*ax - 80*az, z = 9.9 + 189.5*az + 80*ax;
const yaw = Math.atan2(-az,ax)*180/Math.PI;
const url = 'http://127.0.0.1:' + server.address().port + '/index.html?fixedres=1#/famille/1F?p=' + [x,0,z,yaw].join(',');

try {
  for (let run=1; run<=repetitions; run++) {
    const page = await browser.newPage({viewport:{width:960,height:600},deviceScaleFactor:1});
    const errors = [];
    page.on('pageerror', e => errors.push(e.message));
    await page.addInitScript(() => {
      sessionStorage.setItem('sky-mode','day');
      const frames = [];
      let start, prev, startX, startZ;
      function keys(type) {
        for (const code of ['KeyW','ShiftLeft']) document.dispatchEvent(new KeyboardEvent(type,{code,bubbles:true}));
      }
      function sample(t) {
        const w = window.__world;
        if (w?.ready) {
          const {x,z} = w.player;
          if (start === undefined) {
            start=t; startX=x; startZ=z;
            document.getElementById('start').click();
            keys('keydown');
          } else {
            frames.push(t-prev);
            const distance = Math.hypot(x-startX,z-startZ);
            if (distance >= 82 || t-start>35000) {
              keys('keyup');
              window.walkResult = {distance,frames,area:w.area,errors:w.errors};
              return;
            }
          }
          prev=t;
        }
        requestAnimationFrame(sample);
      }
      requestAnimationFrame(sample);
    });
    await page.goto(url,{waitUntil:'domcontentloaded'});
    await page.waitForFunction(() => window.walkResult, null, {timeout:90000});
    const result = await page.evaluate(() => window.walkResult);
    assert.deepEqual([...errors,...result.errors],[]);
    assert.equal(result.area,'in:famille+centralcity');
    assert.ok(result.distance>=82, 'walk stopped at ' + result.distance.toFixed(2) + ' m');
    const frames = result.frames.sort((a,b)=>a-b);
    const percentile = p => Number(frames[Math.floor(p*(frames.length-1))].toFixed(1));
    console.log(JSON.stringify({run,distance:Number(result.distance.toFixed(1)),frames:frames.length,
      medianMs:percentile(.50),p95Ms:percentile(.95),p99Ms:percentile(.99),maxMs:percentile(1),
      over50ms:frames.filter(ms=>ms>50.1).length}));
    await page.close();
  }
} finally {
  await browser.close();
  await new Promise(resolve => server.close(resolve));
}
