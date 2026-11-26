// Real entry URLs, including the time until a normal frame can service input.
// Run with node tests/entry-perf.mjs [repetitions] on a Mac with Metal Chromium.
import assert from 'node:assert/strict';
import { chromium } from 'playwright';
import { serve } from './serve.mjs';

const repetitions = Number(process.argv[2] ?? 3);
assert.ok(Number.isInteger(repetitions) && repetitions > 0, 'expected a positive repetition count');
const entries = [
  ['거리', '', 'out:core'],
  ['호텔 8층', '#/jwmarriott/8F', 'in:jwmarriott'],
  ['파미에 1층', '#/famille/1F', 'in:famille+centralcity'],
];
const server = await serve(0);
const browser = await chromium.launch({
  channel: 'chromium', args: ['--use-angle=metal', '--ignore-gpu-blocklist', '--enable-gpu'],
});
const url = 'http://127.0.0.1:' + server.address().port + '/index.html';
try {
  for (let run = 1; run <= repetitions; run++) {
    for (const [place, hash, area] of entries) {
      const page = await browser.newPage({viewport: {width: 1100, height: 650}, deviceScaleFactor: 1});
      const errors = [];
      page.on('pageerror', e => errors.push(e.message));
      await page.addInitScript(() => {
        sessionStorage.setItem('sky-mode','day');
        const loading=window.__entryFrames={count:0,longestGapMs:0};
        let last;
        function sample(){
          const now=performance.now();
          if(last!==undefined)loading.longestGapMs=Math.max(loading.longestGapMs,now-last);
          if(window.__world?.ready)return;
          if(document.getElementById('loading'))loading.count++;
          last=now;
          requestAnimationFrame(sample);
        }
        requestAnimationFrame(sample);
      });
      await page.goto(url + hash, {waitUntil: 'domcontentloaded'});
      await page.waitForFunction(() => window.__world?.ready || window.__world?.errors.length, null, {timeout: 180000});
      const observed = await page.evaluate(() => ({
        readyMs: Math.round(performance.now()), builtMs: window.__world.timing.ready,
        area: window.__world.area, errors: window.__world.errors,
        loadingFrames:window.__entryFrames.count, longestGapMs:Math.round(window.__entryFrames.longestGapMs),
      }));
      assert.deepEqual([...errors, ...observed.errors], []);
      assert.equal(observed.area, area);
      console.log(JSON.stringify({run, place, ...observed}));
      await page.close();
    }
  }
} finally {
  await browser.close();
  await new Promise(resolve => server.close(resolve));
}
