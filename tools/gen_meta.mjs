// Writes js/places/_meta.json: for every place module its claims, zone bounding box, levels and junction neighbours.
// The browser uses it to decide which modules an area needs WITHOUT downloading/building the others (area loading,
// js/areas.js). Re-run after a module changes its claims or footprint:  node tools/gen_meta.mjs
import * as THREE from 'three';
import fs from 'node:fs'; import path from 'node:path'; import url from 'node:url';
const ROOT = path.resolve(path.dirname(url.fileURLToPath(import.meta.url)), '..');
const ctx = new Proxy({}, { get: (t, k) => k === 'measureText' ? (s => ({ width: String(s).length * 10 })) : k === 'createLinearGradient' || k === 'createRadialGradient' || k === 'createPattern' ? (() => ({ addColorStop() { } })) : k === 'getImageData' ? (() => ({ data: new Uint8ClampedArray(4) })) : (typeof k === 'string' && /^[a-z]/.test(k) && !['canvas', 'font', 'fillStyle', 'strokeStyle', 'lineWidth', 'textAlign', 'textBaseline', 'globalAlpha', 'globalCompositeOperation', 'shadowColor', 'shadowBlur', 'lineCap', 'lineJoin', 'filter', 'imageSmoothingEnabled'].includes(k) ? () => { } : t[k]), set: (t, k, v) => { t[k] = v; return true; } });
globalThis.__makeCanvas = (w, h) => ({ width: w, height: h, getContext: () => ctx, style: {} });
const { createPhysics } = await import('../js/physics.js');
const { createKit } = await import('../js/kit.js');
const { PLACES } = await import('../js/places/index.js');
const { JUNCTIONS } = await import('../js/places/_junctions.js');
const osm = JSON.parse(fs.readFileSync(path.join(ROOT, 'data/osm.json'), 'utf8'));
const out = {};
for (const id of PLACES) {
  const m = await import(url.pathToFileURL(path.join(ROOT, 'js/places', id + '.js')).href);
  const K = createKit(THREE, new THREE.Scene(), { osm, phys: createPhysics() }); K.onNight = () => { };
  K._.setCurrent(id, m.meta); m.build(K);
  let x0 = Infinity, z0 = Infinity, x1 = -Infinity, z1 = -Infinity, y0 = Infinity, y1 = -Infinity;
  const grow = (x, z) => { x0 = Math.min(x0, x); z0 = Math.min(z0, z); x1 = Math.max(x1, x); z1 = Math.max(z1, z); };
  for (const zn of K._.zonesList) { for (const [x, z] of zn.poly) grow(x, z); y0 = Math.min(y0, zn.y0); y1 = Math.max(y1, zn.y1); }
  for (const bid of m.meta?.claims || []) for (const b of osm.buildings.filter(b => b.id === bid)) for (const [x, z] of b.poly) grow(x, z);
  const r = v => Math.round(v * 10) / 10;
  // 40 m occupancy cells (zones + claimed footprints): which parts of the map this module actually has something in
  const G = 40, cells = new Set();
  const { pointInPoly } = await import('../js/physics.js');
  const rasterize = poly => { let a = Infinity, b = Infinity, c = -Infinity, d = -Infinity; for (const [x, z] of poly) { a = Math.min(a, x); b = Math.min(b, z); c = Math.max(c, x); d = Math.max(d, z); }
    for (let i = Math.floor(a / G); i <= Math.floor(c / G); i++) for (let j = Math.floor(b / G); j <= Math.floor(d / G); j++) {
      const x0 = i * G, z0 = j * G; const hit = [[0.5, 0.5], [0.1, 0.1], [0.9, 0.1], [0.1, 0.9], [0.9, 0.9]].some(([u, v]) => pointInPoly(x0 + u * G, z0 + v * G, poly)) || poly.some(([x, z]) => x >= x0 && x < x0 + G && z >= z0 && z < z0 + G);
      if (hit) cells.add(i + ',' + j); } };
  for (const zn of K._.zonesList) rasterize(zn.poly);
  for (const bid of m.meta?.claims || []) for (const b of osm.buildings.filter(b => b.id === bid)) rasterize(b.poly);
  out[id] = {
    name: m.meta?.name || id,
    claims: m.meta?.claims || [], claimRoads: m.meta?.claimRoads || [], claimAreas: m.meta?.claimAreas || [],
    box: isFinite(x0) ? [r(x0), r(z0), r(x1), r(z1)] : null, y: isFinite(y0) ? [r(y0), r(y1)] : [0, 0],
    floors: [...new Set(K._.zonesList.map(z => z.floor || '1F'))], cells: [...cells],
    junctions: JUNCTIONS.filter(j => j.a === id || j.b === id).map(j => ({ other: j.a === id ? j.b : j.a, x: r((j.pa[0] + j.pb[0]) / 2), z: r((j.pa[1] + j.pb[1]) / 2), y: j.y, also: j.alsoY || [] })),
  };
}
fs.writeFileSync(path.join(ROOT, 'js/places/_meta.json'), JSON.stringify(out));
for (const [id, v] of Object.entries(out)) console.log(id.padEnd(20), JSON.stringify(v.box), JSON.stringify(v.y), v.floors.length + ' floors', v.junctions.length + ' junctions');
