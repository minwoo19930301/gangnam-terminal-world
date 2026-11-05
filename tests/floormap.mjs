// Debug: top-down walkability map at floor y (white free, pink blocked, grey no floor, green reachable from start, walls coloured by module).
// usage: node tests/floormap.mjs y x0 z0 x1 z1 out.png [startX startZ] [mods,comma,separated]
import * as THREE from 'three';
import fs from 'node:fs'; import zlib from 'node:zlib'; import path from 'node:path'; import url from 'node:url';
const ROOT = path.resolve(path.dirname(url.fileURLToPath(import.meta.url)), '..');
const ctx = new Proxy({}, { get: (t, k) => k === 'measureText' ? (s => ({ width: String(s).length * 10 })) : k === 'createLinearGradient' || k === 'createRadialGradient' || k === 'createPattern' ? (() => ({ addColorStop() { } })) : k === 'getImageData' ? (() => ({ data: new Uint8ClampedArray(4) })) : (typeof k === 'string' && /^[a-z]/.test(k) && !['canvas', 'font', 'fillStyle', 'strokeStyle', 'lineWidth', 'textAlign', 'textBaseline', 'globalAlpha', 'globalCompositeOperation', 'shadowColor', 'shadowBlur', 'lineCap', 'lineJoin', 'filter', 'imageSmoothingEnabled'].includes(k) ? () => { } : t[k]), set: (t, k, v) => { t[k] = v; return true; } });
globalThis.__makeCanvas = (w, h) => ({ width: w, height: h, getContext: () => ctx, style: {} });
const { createPhysics } = await import('../js/physics.js'); const { createKit } = await import('../js/kit.js'); const { PLACES } = await import('../js/places/index.js');
const osm = JSON.parse(fs.readFileSync(path.join(ROOT, 'data/osm.json'), 'utf8'));
const [Y, X0, Z0, X1, Z1, OUT, SX, SZ, MODS] = process.argv.slice(2); const y = +Y, x0 = +X0, z0 = +Z0, x1 = +X1, z1 = +Z1;
const phys = createPhysics(); const walls = []; const ow = phys.addWall.bind(phys); let cur = '';
phys.addWall = (ax, az, bx, bz, a, b, r, tag) => { walls.push({ ax, az, bx, bz, y0: a, y1: b, cur }); return ow(ax, az, bx, bz, a, b, r, tag); };
const K = createKit(THREE, new THREE.Scene(), { osm, phys }); K.onNight = () => { };
for (const id of (MODS ? MODS.split(',') : PLACES)) { cur = id; const m = await import(url.pathToFileURL(path.join(ROOT, 'js/places', id + '.js')).href); K._.setCurrent(id, m.meta); m.build(K); }
const S = 4; // px per metre
const W = Math.round((x1 - x0) * S), H = Math.round((z1 - z0) * S); const img = Buffer.alloc(W * H * 3, 255);
const R = 0.32; const set = (i, j, c) => { if (i < 0 || j < 0 || i >= W || j >= H) return; const o = (j * W + i) * 3; img[o] = c[0]; img[o + 1] = c[1]; img[o + 2] = c[2]; };
const free = (x, z, fy) => { const p = { x, z }; phys.resolve(p, R, fy, fy + 1.75, 0.5); return Math.hypot(p.x - x, p.z - z) < 0.03; };
const grid = new Int8Array(W * H);
for (let j = 0; j < H; j++) for (let i = 0; i < W; i++) {
  const x = x0 + (i + 0.5) / S, z = z0 + (j + 0.5) / S; const s = phys.support(x, z, y + 0.5);
  if (!isFinite(s.y) || Math.abs(s.y - y) > 0.6) { set(i, j, [150, 150, 150]); grid[j * W + i] = 0; continue; }
  if (!free(x, z, s.y)) { set(i, j, [255, 200, 200]); grid[j * W + i] = 0; continue; }
  grid[j * W + i] = 1; set(i, j, [255, 255, 255]);
}
if (SX) { const si = Math.floor((+SX - x0) * S), sj = Math.floor((+SZ - z0) * S); const q = [[si, sj]]; const seen = new Uint8Array(W * H); seen[sj * W + si] = 1;
  while (q.length) { const [i, j] = q.pop(); set(i, j, [170, 235, 170]); for (const [di, dj] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) { const ni = i + di, nj = j + dj; if (ni < 0 || nj < 0 || ni >= W || nj >= H) continue; const k = nj * W + ni; if (seen[k] || !grid[k]) continue; seen[k] = 1; q.push([ni, nj]); } } }
const COL = { gotomall: [220, 30, 30], station: [30, 30, 220], shinsegae: [200, 120, 0], centralcity: [0, 150, 0], gyeongbu: [150, 0, 150], jwmarriott: [0, 150, 150], banpo_shoppingtown: [120, 80, 40], streets: [0, 0, 0], hangang: [0, 100, 200] };
for (const w of walls) { if (y + 0.5 >= w.y1 || y + 1.75 <= w.y0) continue; const L = Math.hypot(w.bx - w.ax, w.bz - w.az) * S * 2 + 1; for (let t = 0; t <= L; t++) { const x = w.ax + (w.bx - w.ax) * t / L, z = w.az + (w.bz - w.az) * t / L; set(Math.floor((x - x0) * S), Math.floor((z - z0) * S), COL[w.cur] || [0, 0, 0]); } }
// grid lines every 10 m
for (let gx = Math.ceil(x0 / 10) * 10; gx < x1; gx += 10) for (let j = 0; j < H; j += 3) set(Math.floor((gx - x0) * S), j, [200, 200, 255]);
for (let gz = Math.ceil(z0 / 10) * 10; gz < z1; gz += 10) for (let i = 0; i < W; i += 3) set(i, Math.floor((gz - z0) * S), [200, 200, 255]);
// png
const raw = Buffer.alloc((W * 3 + 1) * H); for (let j = 0; j < H; j++) { raw[j * (W * 3 + 1)] = 0; img.copy(raw, j * (W * 3 + 1) + 1, j * W * 3, (j + 1) * W * 3); }
const crc = (b) => { let c, t = []; for (let n = 0; n < 256; n++) { c = n; for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1; t[n] = c >>> 0; } let r = 0xffffffff; for (const x of b) r = t[(r ^ x) & 255] ^ (r >>> 8); return (r ^ 0xffffffff) >>> 0; };
const chunk = (ty, d) => { const l = Buffer.alloc(4); l.writeUInt32BE(d.length); const td = Buffer.concat([Buffer.from(ty), d]); const c = Buffer.alloc(4); c.writeUInt32BE(crc(td)); return Buffer.concat([l, td, c]); };
const ih = Buffer.alloc(13); ih.writeUInt32BE(W, 0); ih.writeUInt32BE(H, 4); ih[8] = 8; ih[9] = 2;
fs.writeFileSync(OUT, Buffer.concat([Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]), chunk('IHDR', ih), chunk('IDAT', zlib.deflateSync(raw)), chunk('IEND', Buffer.alloc(0))]));
console.log('wrote', OUT, W, H);
