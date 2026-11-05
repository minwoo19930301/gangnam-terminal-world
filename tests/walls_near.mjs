// Debug: list physics walls within RAD metres of (X,Z) that block a player standing at floor Y, with the code that made them.
// usage: node tests/walls_near.mjs gotomall,station X Z Y [RAD]
import * as THREE from 'three';
import fs from 'node:fs'; import path from 'node:path'; import url from 'node:url';
const ROOT = path.resolve(path.dirname(url.fileURLToPath(import.meta.url)), '..');
const ctx = new Proxy({}, { get: (t, k) => k === 'measureText' ? (s => ({ width: String(s).length * 10 })) : k === 'createLinearGradient' || k === 'createRadialGradient' || k === 'createPattern' ? (() => ({ addColorStop() { } })) : k === 'getImageData' ? (() => ({ data: new Uint8ClampedArray(4) })) : (typeof k === 'string' && /^[a-z]/.test(k) && !['canvas', 'font', 'fillStyle', 'strokeStyle', 'lineWidth', 'textAlign', 'textBaseline', 'globalAlpha', 'globalCompositeOperation', 'shadowColor', 'shadowBlur', 'lineCap', 'lineJoin', 'filter', 'imageSmoothingEnabled'].includes(k) ? () => { } : t[k]), set: (t, k, v) => { t[k] = v; return true; } });
globalThis.__makeCanvas = (w, h) => ({ width: w, height: h, getContext: () => ctx, style: {} });
const { createPhysics } = await import(ROOT + '/js/physics.js');
const { createKit } = await import(ROOT + '/js/kit.js');
const osm = JSON.parse(fs.readFileSync(ROOT + '/data/osm.json', 'utf8'));
const phys = createPhysics(); const all = []; const ow = phys.addWall.bind(phys);
phys.addWall = (ax, az, bx, bz, y0, y1, r, tag) => { all.push({ ax, az, bx, bz, y0, y1, r, tag, stack: new Error().stack.split('\n').slice(2, 7).map(s => s.trim().replace(/.*places\//, '').replace(/.*js\//, '')).join(' < ') }); return ow(ax, az, bx, bz, y0, y1, r, tag); };
const K = createKit(THREE, new THREE.Scene(), { osm, phys }); K.onNight = () => { };
const [ids, X, Z, Y, RAD] = process.argv.slice(2); for (const id of ids.split(',')) { const m = await import(ROOT + '/js/places/' + id + '.js'); K._.setCurrent(id, m.meta); m.build(K); }
const x = +X, z = +Z, y = +Y, rad = +(RAD || 1.6);
for (const w of all) {
  if (y + 0.5 >= w.y1 || y + 1.75 <= w.y0) continue;
  const dx = w.bx - w.ax, dz = w.bz - w.az, L2 = dx * dx + dz * dz || 1e-9; let t = ((x - w.ax) * dx + (z - w.az) * dz) / L2; t = Math.max(0, Math.min(1, t));
  const d = Math.hypot(x - (w.ax + dx * t), z - (w.az + dz * t)); if (d > rad) continue;
  console.log(d.toFixed(2), `(${w.ax.toFixed(2)},${w.az.toFixed(2)})->(${w.bx.toFixed(2)},${w.bz.toFixed(2)}) y ${w.y0.toFixed(2)}..${w.y1.toFixed(2)} r${w.r}`, w.stack);
}
