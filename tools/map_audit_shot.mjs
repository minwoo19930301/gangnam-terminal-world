// Screenshots with the system Chrome (no browser download) and three.js served from node_modules instead of the CDN.
// usage: node tools/map_audit_shot.mjs --out dir --views "name:x,y,z,yawDeg,pitchDeg;..." [--places a,b] [--city 0]
import { chromium } from 'playwright';
import fs from 'node:fs'; import path from 'node:path'; import url from 'node:url';
import { serve } from '../tests/serve.mjs';
const ROOT = path.resolve(path.dirname(url.fileURLToPath(import.meta.url)), '..');
const A = process.argv.slice(2); const arg = (k, d) => { const i = A.indexOf('--' + k); return i >= 0 ? A[i + 1] : d; };
const out = arg('out', 'shots/tmp'); fs.mkdirSync(out, { recursive: true });
const views = arg('views').split(';').filter(Boolean).map(v => { const [n, rest] = v.split(':'); const [x, y, z, yaw = 0, pitch = 0] = rest.split(',').map(Number); return { n, x, y, z, yaw, pitch }; });
const srv = await serve(0), port = srv.address().port;
const browser = await chromium.launch({ executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', headless: true, args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] });
const page = await browser.newPage({ viewport: { width: +arg('w', 1280), height: +arg('h', 720) } });
await page.route('https://cdn.jsdelivr.net/npm/three@0.160.0/**', r => { const p = new URL(r.request().url()).pathname.replace('/npm/three@0.160.0/', ''); const f = path.join(ROOT, 'node_modules/three', p); fs.existsSync(f) ? r.fulfill({ body: fs.readFileSync(f), contentType: 'text/javascript' }) : r.abort(); });
const logs = []; page.on('console', m => { if (m.type() === 'error') logs.push(m.text()); }); page.on('pageerror', e => logs.push('[pageerror] ' + e.message));
const v0 = views[0], q = new URLSearchParams({ shot: '1', pos: `${v0.x},${v0.y},${v0.z}`, yaw: v0.yaw, pitch: v0.pitch, traffic: '0' });
if (arg('places')) q.set('places', arg('places')); if (arg('city')) q.set('city', arg('city')); q.set('fly', '1');
await page.goto(`http://127.0.0.1:${port}/index.html?${q}`, { waitUntil: 'load' });
await page.waitForFunction(() => window.__world && (window.__world.ready || window.__world.errors.some(e => e.startsWith('boot'))), null, { timeout: 280000 });
console.log('errors', JSON.stringify(await page.evaluate(() => window.__world.errors)));
for (const v of views) {
  await page.evaluate(v => { const p = window.__world.player; p.x = v.x; p.y = v.y; p.z = v.z; p.vy = 0; p.yaw = v.yaw * Math.PI / 180; p.pitch = v.pitch * Math.PI / 180; p.fly = true; }, v);
  await page.waitForTimeout(900); await page.evaluate(() => new Promise(r => requestAnimationFrame(() => requestAnimationFrame(r))));
  const f = path.join(out, v.n + '.png'); await page.screenshot({ path: f }); console.log('shot', f, '|', await page.evaluate(() => document.getElementById('zone').textContent));
}
if (logs.length) console.log('console:', [...new Set(logs)].slice(0, 10).join('\n')); await browser.close(); srv.close();
