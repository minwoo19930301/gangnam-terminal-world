// Node smoke test: builds place modules with the real kit (no WebGL) and checks the contract.
// usage: node tests/smoke.mjs [placeId ...] [--city] [--quiet]
import * as THREE from 'three';
import fs from 'node:fs'; import path from 'node:path'; import url from 'node:url';
const ROOT = path.resolve(path.dirname(url.fileURLToPath(import.meta.url)), '..');

// ---- canvas stub ----
const ctx = new Proxy({}, { get: (t, k) => k === 'measureText' ? (s => ({ width: String(s).length * 10 })) : k === 'createLinearGradient' || k === 'createRadialGradient' || k === 'createPattern' ? (() => ({ addColorStop() { } })) : k === 'getImageData' ? (() => ({ data: new Uint8ClampedArray(4) })) : (typeof k === 'string' && /^[a-z]/.test(k) && !['canvas', 'font', 'fillStyle', 'strokeStyle', 'lineWidth', 'textAlign', 'textBaseline', 'globalAlpha', 'globalCompositeOperation', 'shadowColor', 'shadowBlur', 'lineCap', 'lineJoin', 'filter', 'imageSmoothingEnabled'].includes(k) ? () => { } : t[k]), set: (t, k, v) => { t[k] = v; return true; } });
globalThis.__makeCanvas = (w, h) => ({ width: w, height: h, getContext: () => ctx, style: {} });

const { createPhysics } = await import('../js/physics.js');
const { createKit } = await import('../js/kit.js');
const { buildCity } = await import('../js/city.js');
const { PLACES } = await import('../js/places/index.js');
const osm = JSON.parse(fs.readFileSync(path.join(ROOT, 'data/osm.json'), 'utf8'));

const args = process.argv.slice(2);
const withCity = args.includes('--city'); const quiet = args.includes('--quiet'); const dump = args.includes('--dump');
let ids = args.filter(a => !a.startsWith('--')); if (!ids.length) ids = PLACES;
const phys = createPhysics(); const scene = new THREE.Scene();
const K = createKit(THREE, scene, { osm, phys });
K.onNight = () => { };
const problems = [], warnings = [];
const report = {};
const osmIds = new Set(osm.buildings.map(b => b.id)), roadIds = new Set(osm.roads.map(r => r.id)), areaIds = new Set(osm.areas.map(a => a.id));
const claimed = { b: new Set(), r: new Set(), a: new Set() };
const loaded = new Set(); const metaOf = new Map();

for (const id of ids) {
  const f = path.join(ROOT, 'js/places', id + '.js');
  if (!fs.existsSync(f)) { warnings.push(`${id}: module file missing (skipped)`); continue; }
  let m; try { m = await import(url.pathToFileURL(f).href); } catch (e) { problems.push(`${id}: import failed: ${e.stack || e}`); continue; }
  if (!m.meta || !m.meta.id || !m.meta.name) problems.push(`${id}: meta.id/meta.name missing`);
  if (m.meta && m.meta.id !== id) problems.push(`${id}: meta.id (${m.meta.id}) must equal file name`);
  if (typeof m.build !== 'function') { problems.push(`${id}: build() missing`); continue; }
  metaOf.set(id, m.meta);
  for (const c of m.meta?.claims || []) { if (!osmIds.has(c)) problems.push(`${id}: claims unknown OSM building ${c}`); if (claimed.b.has(c)) problems.push(`${id}: building ${c} claimed twice`); claimed.b.add(c); }
  for (const c of m.meta?.claimRoads || []) { if (!roadIds.has(c)) warnings.push(`${id}: claimRoads unknown ${c}`); claimed.r.add(c); }
  for (const c of m.meta?.claimAreas || []) { if (!areaIds.has(c)) warnings.push(`${id}: claimAreas unknown ${c}`); claimed.a.add(c); }
  const before = { ...K._.stats, sp: K._.spawns.length, zn: K._.zonesList.length, el: K._.elevators.length, people: K._.people.length, trees: K._.trees.length, walls: phys.stats.walls, surf: phys.stats.surfaces };
  K._.setCurrent(id, m.meta);
  const t0 = performance.now();
  try { m.build(K); } catch (e) { problems.push(`${id}: build threw: ${e.stack || e}`); continue; }
  const ms = performance.now() - t0; loaded.add(id);
  const S = K._.stats;
  report[id] = { ms: Math.round(ms), quads: S.quads - before.quads, boxes: S.boxes - before.boxes, signs: S.signs - before.signs, spawns: K._.spawns.length - before.sp, zones: K._.zonesList.length - before.zn, elevators: K._.elevators.length - before.el, people: K._.people.length - before.people, trees: K._.trees.length - before.trees, walls: phys.stats.walls - before.walls, surfaces: phys.stats.surfaces - before.surf };
  if (!report[id].spawns) problems.push(`${id}: no K.spawn() registered`);
  if (!report[id].zones) problems.push(`${id}: no K.zone() registered`);
}
if (withCity) { K._.setCurrent('city'); try { buildCity(K, osm, { claimedBuildings: claimed.b, claimedRoads: claimed.r, claimedAreas: claimed.a }); } catch (e) { problems.push('city threw: ' + (e.stack || e)); } }

// ---- walkability checks ----
for (const s of K._.spawns) {
  const sup = phys.support(s.x, s.z, (s.y ?? 0) + 1.0);
  if (sup.y === -Infinity || Math.abs(sup.y - (s.y ?? 0)) > 1.6) problems.push(`${s.place}: spawn "${s.name}" (${s.x},${s.y},${s.z}) has no floor near y=${s.y} (found ${sup.y})`);
}
for (const el of K._.elevators) for (const f of el.floors) {
  const sup = phys.support(el.x + (f.dx || 0), el.z + (f.dz || 0), f.y + 0.5);
  if (sup.y === -Infinity || Math.abs(sup.y - f.y) > 0.6) problems.push(`${el.place}: elevator "${el.name}" floor ${f.label} (y=${f.y}) not walkable at car position (found ${sup.y})`);
  // can you walk out? sample 2.2m around the car for a floor at the same level
  let ok = false; for (let a = 0; a < 16 && !ok; a++) { const x = el.x + (f.dx || 0) + Math.cos(a / 16 * 6.283) * 2.3, z = el.z + (f.dz || 0) + Math.sin(a / 16 * 6.283) * 2.3; const s2 = phys.support(x, z, f.y + 0.5); if (Math.abs(s2.y - f.y) < 0.6) ok = true; }
  if (!ok) warnings.push(`${el.place}: elevator "${el.name}" floor ${f.label}: no floor found just outside the car`);
}
// junction checks
const { JUNCTIONS, WELLS } = await import('../js/places/_junctions.js');
for (const j of JUNCTIONS) {
  if (!loaded.has(j.a) || !loaded.has(j.b)) continue;
  for (const [px, pz] of [j.pa || [j.x, j.z], j.pb || [j.x, j.z]]) {
    const sup = phys.support(px, pz, j.y + 0.5);
    if (Math.abs(sup.y - j.y) > 0.6) problems.push(`junction ${j.id} (${j.a}<->${j.b}) at (${px},${pz}) y=${j.y}: no walkable floor (found ${sup.y})`);
  }
}
for (const w of WELLS) {
  const [x0, z0, x1, z1] = w.rect; const cx = (x0 + x1) / 2, cz = (z0 + z1) / 2;
  if (loaded.has(w.floorOwner) && !loaded.has(w.wellOwner)) {
    // floor owner must leave a hole: no floor at `top` in the middle of the well
    const s = phys.support(cx, cz, w.top + 0.3);
    if (Math.abs(s.y - w.top) < 0.2) problems.push(`well ${w.id}: ${w.floorOwner} must leave a hole at y=${w.top} inside rect ${w.rect} (found floor)`);
  }
  if (loaded.has(w.wellOwner)) {
    // something walkable must exist inside the well between top and bottom, and floor at bottom near the well
    let ok = false; for (let k = 0; k <= 10 && !ok; k++) { const t = k / 10; const s = phys.support(x0 + (x1 - x0) * t, z0 + (z1 - z0) * t, w.top + 0.3); if (s.y < w.top - 0.3 && s.y >= w.bottom - 0.3) ok = true; }
    if (!ok) problems.push(`well ${w.id}: ${w.wellOwner} must build stairs/escalators inside rect ${w.rect} from y=${w.top} down to ${w.bottom}`);
  }
}
K._.finalize();
K._.buildAllDetail(); // lazy floor detail groups too
for (const e of K._.detailErrors) problems.push('detail group threw: ' + e);
// area loading reads js/places/_meta.json: warn when a module's claims are not what it says (run node tools/gen_meta.mjs)
try {
  const META = JSON.parse(fs.readFileSync(path.join(ROOT, 'js/places/_meta.json'), 'utf8'));
  for (const [id, mm] of metaOf) { const m = { meta: mm }; const v = META[id]; const same = (a, b) => JSON.stringify([...(a || [])].sort()) === JSON.stringify([...(b || [])].sort());
    if (!v) warnings.push(`${id}: missing from js/places/_meta.json (run node tools/gen_meta.mjs)`);
    else if (!same(v.claims, m.meta?.claims) || !same(v.claimRoads, m.meta?.claimRoads) || !same(v.claimAreas, m.meta?.claimAreas)) warnings.push(`${id}: claims changed since js/places/_meta.json (run node tools/gen_meta.mjs)`); }
} catch (e) { warnings.push('js/places/_meta.json unreadable: ' + e.message); }
const meshes = scene.children.filter(o => o.isMesh || o.isInstancedMesh);
const tris = meshes.reduce((a, m) => a + (m.geometry.index ? m.geometry.index.count / 3 : 0) * (m.isInstancedMesh ? m.count : 1), 0);
if (!quiet) console.table(report);
if (dump) {
  const r = v => Math.round(v * 10) / 10;
  console.log('SPAWNS', JSON.stringify(K._.spawns.map(s => ({ place: s.place, name: s.name, x: r(s.x), y: r(s.y ?? 0), z: r(s.z), yawDeg: Math.round((s.yaw || 0) * 180 / Math.PI) }))));
  console.log('ZONES', JSON.stringify(K._.zonesList.map(z => { const bb = K.polyBBox(z.poly); return { place: z.place, name: z.name, floor: z.floor, sub: z.sub, y0: z.y0, y1: z.y1, center: [r((bb[0] + bb[2]) / 2), r((bb[1] + bb[3]) / 2)], size: [r(bb[2] - bb[0]), r(bb[3] - bb[1])] }; })));
  console.log('ELEVATORS', JSON.stringify(K._.elevators.map(e => ({ place: e.place, name: e.name, x: r(e.x), z: r(e.z), floors: e.floors.map(f => f.label + '@' + f.y) }))));
}
console.log(`meshes ${meshes.length}, triangles ~${Math.round(tris / 1000)}k, sign atlas pages ${K._.atlas.pages.length}, walls ${phys.stats.walls}, surfaces ${phys.stats.surfaces}, zones ${phys.stats.zones}`);
for (const w of warnings) console.log('WARN', w);
for (const p of problems) console.log('FAIL', p);
console.log(problems.length ? `\n${problems.length} problem(s)` : '\nOK');
// exitCode (not process.exit) so large --dump lines are fully flushed when stdout is a pipe
process.exitCode = problems.length ? 1 : 0;
