// Build cost per owner: eager triangles, lazy-detail triangles and build ms, for planning area loading.
// usage: node tests/cost.mjs
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
const tris = sc => sc.children.reduce((a, o) => a + ((o.isMesh || o.isInstancedMesh) ? (o.geometry.index ? o.geometry.index.count : o.geometry.attributes.position.count) / 3 * (o.isInstancedMesh ? o.count : 1) : 0), 0);
const claimed = { b: new Set(), r: new Set(), a: new Set() }; const mods = [];
for (const id of PLACES) { const m = await import(url.pathToFileURL(path.join(ROOT, 'js/places', id + '.js')).href); mods.push([id, m]); for (const c of m.meta?.claims || []) claimed.b.add(c); for (const c of m.meta?.claimRoads || []) claimed.r.add(c); for (const c of m.meta?.claimAreas || []) claimed.a.add(c); }
const rows = [];
for (const [id, m] of [...mods, ['city', null]]) {
  const scene = new THREE.Scene(); const K = createKit(THREE, scene, { osm, phys: createPhysics() }); K.onNight = () => { };
  K._.setCurrent(id, m?.meta); let t = performance.now();
  if (m) m.build(K); else buildCity(K, osm, { claimedBuildings: claimed.b, claimedRoads: claimed.r, claimedAreas: claimed.a });
  const b = performance.now() - t; t = performance.now(); K._.finalize(); const f = performance.now() - t; const e = tris(scene);
  t = performance.now(); K._.buildAllDetail(); const d = performance.now() - t;
  rows.push({ owner: id, buildMs: Math.round(b), finalizeMs: Math.round(f), eagerKTri: Math.round(e / 1000), detailKTri: Math.round((tris(scene) - e) / 1000), detailMs: Math.round(d), groups: K._.details.length });
}
rows.sort((a, b) => b.eagerKTri - a.eagerKTri); console.table(rows);
console.log('sum eager kTri', rows.reduce((a, r) => a + r.eagerKTri, 0), 'sum build+finalize ms', rows.reduce((a, r) => a + r.buildMs + r.finalizeMs, 0));
