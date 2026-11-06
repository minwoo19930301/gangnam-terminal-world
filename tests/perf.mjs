// Frame-rate probe on the real GPU (headless Chromium, Metal/ANGLE), optionally with CPU throttling to mimic a slow laptop.
// usage: node tests/perf.mjs [--cpu 4] [--w 1280 --h 720] [--dpr 1] [--query "q=low"]
// Prints, per view: fps over 2.5 s, draw calls, triangles (thousands), and the renderer pixel ratio at the end.
import { chromium } from 'playwright';
import { serve } from './serve.mjs';
const A = process.argv.slice(2); const arg = (k, d) => { const i = A.indexOf('--' + k); return i >= 0 ? A[i + 1] : d; };
const VIEWS = { aerial: [-60, 260, 380, 0, -38], street: [-75, 0.2, -96, 290, 4], terminal: [160, 0, -165, 105, 8], mall: [-20.5, -6, -112.6, 291, 0], gbHall: [99.8, 0, -1.1, 21, 0], ssgB1: [-78.7, -6, 2.1, 201, 0], jw8F: [-11.6, 35.5, 127.1, 84, 0], hangang: [-629, 0.1, -736, 20, 2] };
const srv = await serve(0); const port = srv.address().port;
const browser = await chromium.launch({ channel: 'chromium', args: ['--use-angle=metal', '--ignore-gpu-blocklist', '--enable-gpu', '--disable-gpu-vsync', '--disable-frame-rate-limit'] });
const ctx = await browser.newContext({ viewport: { width: +arg('w', 1280), height: +arg('h', 720) }, deviceScaleFactor: +arg('dpr', 1) });
const page = await ctx.newPage();
if (arg('cpu')) { const cdp = await ctx.newCDPSession(page); await cdp.send('Emulation.setCPUThrottlingRate', { rate: +arg('cpu') }); }
const t0 = Date.now();
await page.goto(`http://127.0.0.1:${port}/index.html?${arg('query', '')}`);
await page.waitForFunction(() => window.__world && window.__world.ready, null, { timeout: 600000 });
const load = Date.now() - t0;
const timing = await page.evaluate(() => window.__world.timing);
// wait for the progressive sign painting to finish, then warm up (shaders, uploads) before measuring
const t1 = Date.now(); await page.waitForFunction(() => !window.__world.K._.atlas.pending(), null, { timeout: 600000 }); const signs_ms = Date.now() - t1;
// warm-up: let shaders compile and textures upload before measuring
await page.evaluate(() => new Promise(r => { let n = 0; const f = () => (++n < 90 ? requestAnimationFrame(f) : r()); requestAnimationFrame(f); }));
const out = await page.evaluate(async (VIEWS) => {
  const w = window.__world; document.getElementById('start').classList.add('hidden');
  const res = {};
  for (const [n, [x, y, z, yaw, pitch]] of Object.entries(VIEWS)) {
    const p = w.player; p.x = x; p.y = y; p.z = z; p.yaw = yaw * Math.PI / 180; p.pitch = pitch * Math.PI / 180; p.fly = true;
    await new Promise(r => setTimeout(r, 1500));
    let n2 = 0; const t = performance.now(); await new Promise(r => { const f = () => { n2++; if (performance.now() - t < 2500) requestAnimationFrame(f); else r(); }; requestAnimationFrame(f); });
    const ri = w.renderer.info.render; res[n] = { fps: Math.round(n2 / ((performance.now() - t) / 1000)), calls: ri.calls, ktris: Math.round(ri.triangles / 1000), pr: +w.renderer.getPixelRatio().toFixed(2) };
  }
  return res;
}, VIEWS);
console.log(JSON.stringify({ load_ms: load, signs_ms, timing, cpu: arg('cpu', 1), ...out }));
await browser.close(); srv.close();
