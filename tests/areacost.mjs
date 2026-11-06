// Triangles and build time per area (area loading, js/areas.js) vs everything. usage: node tests/areacost.mjs [areaId ...]
import * as THREE from 'three';
import fs from 'node:fs'; import path from 'node:path'; import url from 'node:url';
const ROOT = path.resolve(path.dirname(url.fileURLToPath(import.meta.url)), '..');
const ctx = new Proxy({}, { get: (t, k) => k === 'measureText' ? (s => ({ width: String(s).length * 10 })) : k === 'createLinearGradient' || k === 'createRadialGradient' || k === 'createPattern' ? (() => ({ addColorStop() { } })) : k === 'getImageData' ? (() => ({ data: new Uint8ClampedArray(4) })) : (typeof k === 'string' && /^[a-z]/.test(k) && !['canvas', 'font', 'fillStyle', 'strokeStyle', 'lineWidth', 'textAlign', 'textBaseline', 'globalAlpha', 'globalCompositeOperation', 'shadowColor', 'shadowBlur', 'lineCap', 'lineJoin', 'filter', 'imageSmoothingEnabled'].includes(k) ? () => { } : t[k]), set: (t, k, v) => { t[k] = v; return true; } });
globalThis.__makeCanvas = (w, h) => ({ width: w, height: h, getContext: () => ctx, style: {} });
const { createPhysics } = await import('../js/physics.js');
const { createKit } = await import('../js/kit.js');
const { buildCity } = await import('../js/city.js');
const { PLACES } = await import('../js/places/index.js');
const { JUNCTIONS } = await import('../js/places/_junctions.js');
const { planArea } = await import('../js/areas.js');
const osm = JSON.parse(fs.readFileSync(path.join(ROOT, 'data/osm.json'), 'utf8'));
const META = JSON.parse(fs.readFileSync(path.join(ROOT, 'js/places/_meta.json'), 'utf8'));
const tris = sc => sc.children.reduce((a, o) => a + ((o.isMesh || o.isInstancedMesh) ? (o.geometry.index ? o.geometry.index.count : o.geometry.attributes.position.count) / 3 * (o.isInstancedMesh ? o.count : 1) : 0), 0);
const ids = process.argv.slice(2).length ? process.argv.slice(2) : ['all', 'out:core', 'out:jamwon', 'out:banpo', 'in:shinsegae', 'in:gotomall+station', 'in:gyeongbu', 'in:newcore'];
const rows = [];
for (const id of ids) {
  const A = planArea(id, META, JUNCTIONS);
  const scene = new THREE.Scene(); const K = createKit(THREE, scene, { osm, phys: createPhysics(), keep: A.keep, keepDetail: A.keepDetail }); K.onNight = () => { }; K._.stats.byOwner = {};
  const cl = { b: new Set(), r: new Set(), a: new Set() }; for (const v of Object.values(META)) { v.claims.forEach(c => cl.b.add(c)); v.claimRoads.forEach(c => cl.r.add(c)); v.claimAreas.forEach(c => cl.a.add(c)); }
  let t = performance.now(); let bytes = 0;
  for (const m of PLACES.filter(p => A.modules.includes(p))) { bytes += fs.statSync(path.join(ROOT, 'js/places', m + '.js')).size; const mod = await import(url.pathToFileURL(path.join(ROOT, 'js/places', m + '.js')).href); K._.setCurrent(m, mod.meta); mod.build(K); }
  K._.setCurrent('city'); buildCity(K, osm, { claimedBuildings: cl.b, claimedRoads: cl.r, claimedAreas: cl.a });
  K._.finalize(); const build = performance.now() - t; const e = tris(scene);
  K._.buildAllDetail(); const d = tris(scene) - e;
  console.log(id, Object.entries(K._.stats.byOwner).sort((a, b) => b[1] - a[1]).map(([k, v]) => k + ' ' + Math.round(v / 1000) + 'k').join(', '));
  rows.push({ area: id, modules: A.modules.length, moduleKB: Math.round(bytes / 1024), buildMs: Math.round(build), eagerKTri: Math.round(e / 1000), detailKTri: Math.round(d / 1000), groups: K._.details.filter(g => !A.keepDetail || A.keepDetail(g)).length, meshes: scene.children.length });
}
console.table(rows);
