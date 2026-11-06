// Debug: where a floor at level Y is visually open to the level below. For every 0.5 m cell, the highest
// UP-facing rendered face between Y-14 and Y+0.6 is found. White = floor at Y, red = you look down onto
// something more than 1.5 m lower (a hole in the floor), black = nothing at all. Building outlines in cyan.
// usage: node tests/visfloor.mjs Y x0 z0 x1 z1 out.png [mods]
import * as THREE from 'three';
import fs from 'node:fs'; import zlib from 'node:zlib'; import path from 'node:path'; import url from 'node:url';
const ROOT = path.resolve(path.dirname(url.fileURLToPath(import.meta.url)), '..');
const ctx = new Proxy({}, { get: (t, k) => k === 'measureText' ? (s => ({ width: String(s).length * 10 })) : k === 'createLinearGradient' || k === 'createRadialGradient' || k === 'createPattern' ? (() => ({ addColorStop() { } })) : k === 'getImageData' ? (() => ({ data: new Uint8ClampedArray(4) })) : (typeof k === 'string' && /^[a-z]/.test(k) && !['canvas', 'font', 'fillStyle', 'strokeStyle', 'lineWidth', 'textAlign', 'textBaseline', 'globalAlpha', 'globalCompositeOperation', 'shadowColor', 'shadowBlur', 'lineCap', 'lineJoin', 'filter', 'imageSmoothingEnabled'].includes(k) ? () => { } : t[k]), set: (t, k, v) => { t[k] = v; return true; } });
globalThis.__makeCanvas = (w, h) => ({ width: w, height: h, getContext: () => ctx, style: {} });
const { createPhysics } = await import('../js/physics.js'); const { createKit } = await import('../js/kit.js'); const { PLACES } = await import('../js/places/index.js'); const { buildCity } = await import('../js/city.js');
const osm = JSON.parse(fs.readFileSync(path.join(ROOT, 'data/osm.json'), 'utf8'));
const [Y, X0, Z0, X1, Z1, OUT, MODS] = process.argv.slice(2); const y = +Y, x0 = +X0, z0 = +Z0, x1 = +X1, z1 = +Z1;
const phys = createPhysics(); const scene = new THREE.Scene(); const K = createKit(THREE, scene, { osm, phys }); K.onNight = () => { };
const cl = { b: new Set(), r: new Set(), a: new Set() };
for (const id of (MODS ? MODS.split(',') : PLACES)) { const m = await import(url.pathToFileURL(path.join(ROOT, 'js/places', id + '.js')).href); for (const c of m.meta?.claims || []) cl.b.add(c); for (const c of m.meta?.claimRoads || []) cl.r.add(c); for (const c of m.meta?.claimAreas || []) cl.a.add(c); K._.setCurrent(id, m.meta); m.build(K); }
// the street world too (as main.js does): city + ground plane with the registered holes
K._.setCurrent('city'); buildCity(K, osm, { claimedBuildings: cl.b, claimedRoads: cl.r, claimedAreas: cl.a });
const [bx0, bz0, bx1, bz1] = osm.bbox; K.hpoly({ tex: 'concrete', color: 0xc9c6bf }, [[bx0, bz0], [bx1, bz0], [bx1, bz1], [bx0, bz1]], -0.04, true, K._.groundHoles.map(h => h.poly));
const meshes = K._.finalize();
const S = 2, W = Math.round((x1 - x0) * S), H = Math.round((z1 - z0) * S); const top = new Float32Array(W * H).fill(-Infinity);
const A = new THREE.Vector3(), B = new THREE.Vector3(), C = new THREE.Vector3(), N = new THREE.Vector3();
for (const m of meshes) {
  if (m.material.transparent) continue; // glass does not count as floor
  const p = m.geometry.attributes.position.array, idx = m.geometry.index.array;
  for (let i = 0; i < idx.length; i += 3) {
    A.fromArray(p, idx[i] * 3); B.fromArray(p, idx[i + 1] * 3); C.fromArray(p, idx[i + 2] * 3);
    N.subVectors(B, A).cross(C.clone().sub(A)); const len = N.length(); if (len < 1e-9) continue; N.divideScalar(len);
    if (Math.abs(N.y) < 0.7) continue; const ty = (A.y + B.y + C.y) / 3; if (ty > y + 0.6 || ty < y - 14) continue;
    const minx = Math.max(0, Math.floor((Math.min(A.x, B.x, C.x) - x0) * S)), maxx = Math.min(W - 1, Math.floor((Math.max(A.x, B.x, C.x) - x0) * S));
    const minz = Math.max(0, Math.floor((Math.min(A.z, B.z, C.z) - z0) * S)), maxz = Math.min(H - 1, Math.floor((Math.max(A.z, B.z, C.z) - z0) * S));
    for (let j = minz; j <= maxz; j++) for (let k = minx; k <= maxx; k++) {
      const px = x0 + (k + 0.5) / S, pz = z0 + (j + 0.5) / S;
      const d1 = (px - B.x) * (A.z - B.z) - (A.x - B.x) * (pz - B.z), d2 = (px - C.x) * (B.z - C.z) - (B.x - C.x) * (pz - C.z), d3 = (px - A.x) * (C.z - A.z) - (C.x - A.x) * (pz - A.z);
      if ((d1 < 0 || d2 < 0 || d3 < 0) && (d1 > 0 || d2 > 0 || d3 > 0)) continue;
      const o = j * W + k; if (ty > top[o]) top[o] = ty;
    }
  }
}
const img = Buffer.alloc(W * H * 3);
let holes = 0;
for (let i = 0; i < W * H; i++) { const t = top[i]; let c; if (t === -Infinity) c = [0, 0, 0]; else if (t > y - 1.5) c = [235, 235, 235]; else { c = [220, 40, 40]; holes++; } img[i * 3] = c[0]; img[i * 3 + 1] = c[1]; img[i * 3 + 2] = c[2]; }
const set = (k, j, c) => { if (k < 0 || j < 0 || k >= W || j >= H) return; const o = (j * W + k) * 3; img[o] = c[0]; img[o + 1] = c[1]; img[o + 2] = c[2]; };
for (const b of osm.buildings) { const P = b.poly; for (let i = 0; i < P.length; i++) { const a = P[i], c = P[(i + 1) % P.length], L = Math.hypot(c[0] - a[0], c[1] - a[1]) * S * 2; for (let t = 0; t <= L; t++) set(Math.floor((a[0] + (c[0] - a[0]) * t / L - x0) * S), Math.floor((a[1] + (c[1] - a[1]) * t / L - z0) * S), [0, 200, 220]); } }
for (let gx = Math.ceil(x0 / 10) * 10; gx < x1; gx += 10) for (let j = 0; j < H; j += 4) set(Math.floor((gx - x0) * S), j, [120, 120, 255]);
for (let gz = Math.ceil(z0 / 10) * 10; gz < z1; gz += 10) for (let k = 0; k < W; k += 4) set(k, Math.floor((gz - z0) * S), [120, 120, 255]);
const raw = Buffer.alloc((W * 3 + 1) * H); for (let j = 0; j < H; j++) { raw[j * (W * 3 + 1)] = 0; img.copy(raw, j * (W * 3 + 1) + 1, j * W * 3, (j + 1) * W * 3); }
const crc = (b) => { let c, t = []; for (let n = 0; n < 256; n++) { c = n; for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1; t[n] = c >>> 0; } let r = 0xffffffff; for (const x of b) r = t[(r ^ x) & 255] ^ (r >>> 8); return (r ^ 0xffffffff) >>> 0; };
const chunk = (ty, d) => { const l = Buffer.alloc(4); l.writeUInt32BE(d.length); const td = Buffer.concat([Buffer.from(ty), d]); const c = Buffer.alloc(4); c.writeUInt32BE(crc(td)); return Buffer.concat([l, td, c]); };
const ih = Buffer.alloc(13); ih.writeUInt32BE(W, 0); ih.writeUInt32BE(H, 4); ih[8] = 8; ih[9] = 2;
fs.writeFileSync(OUT, Buffer.concat([Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]), chunk('IHDR', ih), chunk('IDAT', zlib.deflateSync(raw)), chunk('IEND', Buffer.alloc(0))]));
console.log('wrote', OUT, W, H, 'hole m2', holes / (S * S));
