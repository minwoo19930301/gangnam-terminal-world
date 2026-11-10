// Floor height and clearance of every photo pose of the user's walk, measured in the model's real collision geometry.
// usage: node tools/pose_floor.mjs refs/user_walk/<date> [out.json]
// Reads <dir>/places.json (i, floor, x, z, module). For each photo it looks for a walkable floor within 2.3 m of the
// nominal floor level (B1 -6, 1F 0, 1M 3.6, 2F 7/5) and checks that a standing player fits there.
// Writes <dir>/pose_floor.json: { "<i>": { y, nominal, floor: true|false, free: true|false, push } }.
//   floor=false  -> no floor near the nominal level at that spot (the place is not built there, or the pose is wrong)
//   free=false   -> a player cannot stand there (inside a wall or a solid object); push = metres the physics moves it
// tools/photo_compare.py uses y so cameras stand on the model's real floor (다이소 is at -4, stairs, escalators).
import * as THREE from 'three';
import fs from 'node:fs'; import path from 'node:path'; import url from 'node:url';
const ROOT = path.resolve(path.dirname(url.fileURLToPath(import.meta.url)), '..');
const ctx = new Proxy({}, { get: (t, k) => k === 'measureText' ? (s => ({ width: String(s).length * 10 })) : k === 'createLinearGradient' || k === 'createRadialGradient' || k === 'createPattern' ? (() => ({ addColorStop() { } })) : k === 'getImageData' ? (() => ({ data: new Uint8ClampedArray(4) })) : (typeof k === 'string' && /^[a-z]/.test(k) && !(k in t) ? () => { } : t[k]), set: (t, k, v) => { t[k] = v; return true; } });
globalThis.__makeCanvas = (w, h) => ({ width: w, height: h, getContext: () => ctx, style: {} });
const { createPhysics } = await import('../js/physics.js');
const { createKit } = await import('../js/kit.js');
const { buildCity } = await import('../js/city.js');
const { PLACES } = await import('../js/places/index.js');
const osm = JSON.parse(fs.readFileSync(path.join(ROOT, 'data/osm.json'), 'utf8'));
const dir = path.join(ROOT, process.argv[2] || 'refs/user_walk/20261107');
const out = process.argv[3] ? path.join(ROOT, process.argv[3]) : path.join(dir, 'pose_floor.json');
const phys = createPhysics(); const K = createKit(THREE, new THREE.Scene(), { osm, phys }); K.onNight = () => { };
const claimed = { b: new Set(), r: new Set(), a: new Set() }; const mods = [];
for (const id of PLACES) { const m = await import(url.pathToFileURL(path.join(ROOT, 'js/places', id + '.js')).href); mods.push([id, m]); for (const c of m.meta?.claims || []) claimed.b.add(c); for (const c of m.meta?.claimRoads || []) claimed.r.add(c); for (const c of m.meta?.claimAreas || []) claimed.a.add(c); }
for (const [id, m] of mods) { K._.setCurrent(id, m.meta); m.build(K); }
K._.setCurrent('city'); buildCity(K, osm, { claimedBuildings: claimed.b, claimedRoads: claimed.r, claimedAreas: claimed.a });
K._.buildAllDetail();
const LV = { B2: -11, B1: -6, '1F': 0, '1M': 3.6, '2F': 7, out: 0 }, MOD_LV = { centralcity: { '2F': 5 }, famille: { '2F': 5 }, parking: { '2F': 5 } };
const R = 0.32, H = 1.75, STEP = 0.5, TOL = 2.3;
const photos = JSON.parse(fs.readFileSync(path.join(dir, 'places.json'), 'utf8')).photos;
const res = {}; let nf = 0, nb = 0;
for (const p of photos) {
  if (p.module === 'car' || p.x == null) continue;
  const nominal = MOD_LV[p.module]?.[p.floor] ?? LV[p.floor] ?? 0;
  // the best floor within TOL of the nominal level: the highest support below nominal+TOL, tried from a few heights
  let y = null;
  for (const top of [nominal + 0.6, nominal + 1.4, nominal + TOL]) { const s = phys.support(p.x, p.z, top); if (s && isFinite(s.y) && Math.abs(s.y - nominal) <= TOL && (y === null || Math.abs(s.y - nominal) < Math.abs(y - nominal))) y = s.y; }
  const floor = y !== null; const yy = floor ? y : nominal;
  const q = { x: p.x, z: p.z }; phys.resolve(q, R, yy, yy + H, STEP); const push = Math.hypot(q.x - p.x, q.z - p.z);
  const free = push < 0.05;
  if (!floor) nf++; if (!free) nb++;
  res[p.i] = { y: Math.round(yy * 100) / 100, nominal, floor, free, push: Math.round(push * 100) / 100 };
}
fs.writeFileSync(out, JSON.stringify(res, null, 0));
console.log(`${Object.keys(res).length} poses -> ${path.relative(ROOT, out)}; no floor: ${nf}; blocked (inside a wall/object): ${nb}`);
