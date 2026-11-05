// Headless screenshots for visual checking.
// usage: node tests/shot.mjs --out shots/foo --views "name:x,y,z,yawDeg,pitchDeg;name2:..." [--places a,b] [--city 0] [--night] [--w 1280 --h 720] [--fly]
// yaw: 0 = looking north (-z), 90 = looking west, 180 = south, -90/270 = east.  pitch: + up / - down (deg)
import { chromium } from 'playwright';
import fs from 'node:fs'; import path from 'node:path';
import { serve } from './serve.mjs';
const A = process.argv.slice(2); const arg = (k, d) => { const i = A.indexOf('--' + k); return i >= 0 ? A[i + 1] : d; };
const out = arg('out', 'shots/tmp'); fs.mkdirSync(out, { recursive: true });
const views = (arg('views', 'origin:6,0,-125,200,0')).split(';').filter(Boolean).map(v => { const [n, rest] = v.split(':'); const [x, y, z, yaw = 0, pitch = 0] = rest.split(',').map(Number); return { n, x, y, z, yaw, pitch }; });
const W = +arg('w', 1280), H = +arg('h', 720);
const srv = await serve(0); const port = srv.address().port;
const browser = await chromium.launch({ args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] });
const page = await browser.newPage({ viewport: { width: W, height: H } });
const logs = [];
page.on('console', m => { if (m.type() === 'error' || m.type() === 'warning') logs.push(`[${m.type()}] ${m.text()}`); });
page.on('pageerror', e => logs.push('[pageerror] ' + e.message));
const v0 = views[0];
const q = new URLSearchParams({ shot: '1', pos: `${v0.x},${v0.y},${v0.z}`, yaw: v0.yaw, pitch: v0.pitch });
if (arg('places')) q.set('places', arg('places'));
if (arg('city')) q.set('city', arg('city'));
if (A.includes('--night')) q.set('night', '1');
if (A.includes('--fly')) q.set('fly', '1');
q.set('traffic', arg('traffic', '1'));
const t0 = Date.now();
await page.goto(`http://127.0.0.1:${port}/index.html?${q}`, { waitUntil: 'load' });
await page.waitForFunction(() => window.__world && (window.__world.ready || window.__world.errors.some(e => e.startsWith('boot'))), null, { timeout: 240000 });
const info = await page.evaluate(() => ({ errors: window.__world.errors, places: window.__world.places, stats: window.__world.stats && { ...window.__world.stats, draw: undefined } }));
console.log('load ms', Date.now() - t0, JSON.stringify(info));
for (const v of views) {
  await page.evaluate(v => { const p = window.__world.player; p.x = v.x; p.y = v.y; p.z = v.z; p.vy = 0; p.yaw = v.yaw * Math.PI / 180; p.pitch = v.pitch * Math.PI / 180; p.fly = true; }, v);
  await page.waitForTimeout(700);
  const zone = await page.evaluate(() => document.getElementById('zone').textContent);
  const f = path.join(out, `${v.n}.png`);
  await page.screenshot({ path: f });
  console.log('shot', f, '| zone:', zone);
}
if (logs.length) console.log('console:\n' + [...new Set(logs)].slice(0, 30).join('\n'));
await browser.close(); srv.close();
