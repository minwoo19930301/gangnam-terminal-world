// Measures sign-atlas demand per module (draws, pixel area, pages).  usage: node tests/atlas_stats.mjs
import * as THREE from 'three';
import fs from 'node:fs'; import path from 'node:path'; import url from 'node:url';
const ROOT = path.resolve(path.dirname(url.fileURLToPath(import.meta.url)), '..');
const ctx = new Proxy({}, { get: (t, k) => k === 'measureText' ? (s => ({ width: String(s).length * 10 })) : k === 'createLinearGradient' || k === 'createRadialGradient' || k === 'createPattern' ? (() => ({ addColorStop() { } })) : k === 'getImageData' ? (() => ({ data: new Uint8ClampedArray(4) })) : (typeof k === 'string' && /^[a-z]/.test(k) && !['canvas', 'font', 'fillStyle', 'strokeStyle', 'lineWidth', 'textAlign', 'textBaseline', 'globalAlpha', 'globalCompositeOperation', 'shadowColor', 'shadowBlur', 'lineCap', 'lineJoin', 'filter', 'imageSmoothingEnabled'].includes(k) ? () => { } : t[k]), set: (t, k, v) => { t[k] = v; return true; } });
globalThis.__makeCanvas = (w, h) => ({ width: w, height: h, getContext: () => ctx, style: {} });
const { createPhysics } = await import('../js/physics.js');
const { createKit } = await import('../js/kit.js');
const { buildCity } = await import('../js/city.js');
const { PLACES } = await import('../js/places/index.js');
const osm = JSON.parse(fs.readFileSync(path.join(ROOT, 'data/osm.json'), 'utf8'));
const phys = createPhysics(); const scene = new THREE.Scene();
const K = createKit(THREE, scene, { osm, phys }); K.onNight = () => {};
const A = K._.atlas, orig = A.draw; const log = []; let cur = '';
A.draw = (lines, o = {}) => { const w = o.w ?? 2, h = o.h ?? 0.5, p = o.pxPerM ?? 96; log.push({ cur, key: JSON.stringify([lines, o]), pw: Math.min(1024, Math.round(w * p)), ph: Math.min(512, Math.round(h * p)) }); return orig(lines, o); };
const claimed = { b: new Set(), r: new Set(), a: new Set() };
const mods = [];
for (const id of PLACES) { const m = await import(url.pathToFileURL(path.join(ROOT, 'js/places', id + '.js')).href); mods.push([id, m]); for (const c of m.meta?.claims || []) claimed.b.add(c); for (const c of m.meta?.claimRoads || []) claimed.r.add(c); for (const c of m.meta?.claimAreas || []) claimed.a.add(c); }
for (const [id, m] of mods) { cur = id; K._.setCurrent(id, m.meta); m.build(K); console.log(id, 'pages so far', A.pages.length); }
cur = 'city'; K._.setCurrent('city'); buildCity(K, osm, { claimedBuildings: claimed.b, claimedRoads: claimed.r, claimedAreas: claimed.a });
console.log('total pages', A.pages.length, 'draws', log.length);
const by = {}; for (const l of log) { const b = by[l.cur] ||= { n: 0, area: 0, uniq: new Set(), uarea: 0 }; b.n++; b.area += l.pw * l.ph; if (!b.uniq.has(l.key)) { b.uniq.add(l.key); b.uarea += l.pw * l.ph; } }
for (const [k, b] of Object.entries(by)) console.log(k.padEnd(20), 'draws', b.n, 'uniq', b.uniq.size, 'Mpx', (b.area / 1e6).toFixed(1), 'uniqMpx', (b.uarea / 1e6).toFixed(1));
const tot = log.reduce((s, l) => s + l.pw * l.ph, 0); console.log('total Mpx', (tot / 1e6).toFixed(1), 'page Mpx', 4.19);
const big = [...log].sort((a, b) => b.pw * b.ph - a.pw * a.ph).slice(0, 15); for (const l of big) console.log(l.cur, l.pw, l.ph, l.key.slice(0, 120));
// histogram of ph
const hh = {}; for (const l of log) { const k = l.ph < 32 ? '<32' : l.ph < 64 ? '<64' : l.ph < 128 ? '<128' : l.ph < 256 ? '<256' : '>=256'; hh[k] = (hh[k] || 0) + 1; } console.log(hh);
// simulate: appearance dedupe + per-line pixel cap
for (const CAP of [64, 80, 96, 128]) {
  const seen = new Set(); let tot = 0, n = 0;
  for (const l of log) {
    const [lines, o] = JSON.parse(l.key); const { x, y, z, rotY, twoSided, box, offset, ...ap } = o; const k = JSON.stringify([lines, ap]);
    if (seen.has(k)) continue; seen.add(k); n++;
    const w = o.w ?? 2, h = o.h ?? 0.5, p = o.pxPerM ?? 96; const nl = [].concat(lines).length + (o.sub ? 0.6 : 0);
    let pw = w * p, ph = h * p; const s = Math.min(1, CAP * nl * 1.2 / ph, 1024 / pw, 512 / ph); pw = Math.max(16, Math.round(pw * s)); ph = Math.max(8, Math.round(ph * s));
    tot += pw * ph;
  }
  console.log('CAP', CAP, 'unique', n, 'Mpx', (tot / 1e6).toFixed(1), '≈pages', (tot / 4.19e6 / 0.8).toFixed(1));
}
{
  const seen = new Set(); const by = {}; const sizes = [];
  for (const l of log) {
    const [lines, o] = JSON.parse(l.key); const { x, y, z, rotY, twoSided, box, offset, ...ap } = o; const k = JSON.stringify([lines, ap]);
    if (seen.has(k)) continue; seen.add(k);
    const w = o.w ?? 2, h = o.h ?? 0.5, p = o.pxPerM ?? 96; const nl = [].concat(lines).length + (o.sub ? 0.6 : 0);
    let pw = w * p, ph = h * p; const s = Math.min(1, 64 * nl * 1.2 / ph, 1024 / pw, 512 / ph); pw = Math.round(pw * s); ph = Math.round(ph * s);
    const b = by[l.cur] ||= { n: 0, a: 0 }; b.n++; b.a += pw * ph; sizes.push([pw * ph, l.cur, pw, ph, w, h, p, JSON.stringify(lines).slice(0, 40)]);
  }
  for (const [k, b] of Object.entries(by)) console.log(k.padEnd(20), b.n, (b.a / 1e6).toFixed(1), 'Mpx avg', Math.round(b.a / b.n));
  sizes.sort((a, b) => b[0] - a[0]); for (const s of sizes.slice(0, 25)) console.log(s.join(' | '));
}
