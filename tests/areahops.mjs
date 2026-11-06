// How often would walking trigger an area reload? Samples points on outdoor zones (streets) and inside buildings, and
// compares the old rule (any building zone = enter) with the current rule (roofed, 3.5 m deep). usage: node tests/areahops.mjs
import * as THREE from 'three';
import fs from 'node:fs'; import path from 'node:path'; import url from 'node:url';
const ROOT = path.resolve(path.dirname(url.fileURLToPath(import.meta.url)), '..');
const ctx = new Proxy({}, { get: (t, k) => k === 'measureText' ? (s => ({ width: String(s).length * 10 })) : k === 'createLinearGradient' || k === 'createRadialGradient' || k === 'createPattern' ? (() => ({ addColorStop() { } })) : k === 'getImageData' ? (() => ({ data: new Uint8ClampedArray(4) })) : (typeof k === 'string' && /^[a-z]/.test(k) && !['canvas', 'font', 'fillStyle', 'strokeStyle', 'lineWidth', 'textAlign', 'textBaseline', 'globalAlpha', 'globalCompositeOperation', 'shadowColor', 'shadowBlur', 'lineCap', 'lineJoin', 'filter', 'imageSmoothingEnabled'].includes(k) ? () => { } : t[k]), set: (t, k, v) => { t[k] = v; return true; } });
globalThis.__makeCanvas = (w, h) => ({ width: w, height: h, getContext: () => ctx, style: {} });
const { createPhysics } = await import('../js/physics.js');
const { createKit } = await import('../js/kit.js');
const { buildCity } = await import('../js/city.js');
const { PLACES } = await import('../js/places/index.js');
const { areaIdAt, OUTDOOR } = await import('../js/areas.js');
const osm = JSON.parse(fs.readFileSync(path.join(ROOT, 'data/osm.json'), 'utf8'));
const phys = createPhysics(); const K = createKit(THREE, new THREE.Scene(), { osm, phys }); K.onNight = () => { };
const cl = { b: new Set(), r: new Set(), a: new Set() }; const mods = [];
for (const id of PLACES) { try { const m = await import(url.pathToFileURL(path.join(ROOT, 'js/places', id + '.js')).href); mods.push([id, m]); for (const c of m.meta?.claims || []) cl.b.add(c); for (const c of m.meta?.claimRoads || []) cl.r.add(c); for (const c of m.meta?.claimAreas || []) cl.a.add(c); } catch (e) { console.log('skip', id, e.message); } }
for (const [id, m] of mods) { K._.setCurrent(id, m.meta); try { m.build(K); } catch (e) { console.log('build failed', id, e.message); } }
K._.setCurrent('city'); buildCity(K, osm, { claimedBuildings: cl.b, claimedRoads: cl.r, claimedAreas: cl.a });
const bldgAt = (x, y, z) => { const zn = phys.zoneAt(x, y + 0.1, z); return zn && zn.place && zn.place !== 'city' && !OUTDOOR.has(zn.place) ? zn.place : null; };
const same = (a, b) => a && b && areaIdAt({ place: a }, 0, 0, 0) === areaIdAt({ place: b }, 0, 0, 0);
const ring = (x, y, z, r, test) => { for (let k = 0; k < 8; k++) { const a = k * Math.PI / 4; if (!test(bldgAt(x + Math.cos(a) * r, y, z + Math.sin(a) * r))) return false; } return test(bldgAt(x, y, z)); };
const enters = (x, y, z) => { const h = bldgAt(x, y, z); return !!h && ring(x, y, z, 3.5, p => same(p, h)) && phys.ceilingAbove(x, z, y + 0.5, y + 15) < Infinity; };
// sample: points on outdoor (streets) zones within 30 m of any building zone, at street level
const streetZones = K._.zonesList.filter(z => z.place === 'streets' && z.y0 > -1.5 && z.y0 < 1);
let rnd = 7; const R = () => (rnd = (rnd * 16807) % 2147483647) / 2147483647;
let n = 0, oldHit = 0, newHit = 0; const examples = [];
for (let i = 0; i < 200000 && n < 6000; i++) {
  const z = streetZones[Math.floor(R() * streetZones.length)]; const [x0, z0, x1, z1] = z.bb; const x = x0 + R() * (x1 - x0), zz = z0 + R() * (z1 - z0);
  if (!K.pointInPoly(x, zz, z.poly)) continue;
  const s = phys.support(x, zz, 1.5); if (!isFinite(s.y) || s.y < -1 || s.y > 2) continue;
  n++; const b = bldgAt(x, s.y, zz); if (b) { oldHit++; if (enters(x, s.y, zz)) { newHit++; if (examples.length < 8) examples.push(`${b} (${x.toFixed(0)},${zz.toFixed(0)}) zone "${phys.zoneAt(x, s.y + 0.1, zz).name}"`); } }
}
console.log(`street-level points on outdoor zones: ${n}; inside some building zone (old rule reloads): ${oldHit} (${(oldHit / n * 100).toFixed(1)}%); deep+roofed (new rule): ${newHit} (${(newHit / n * 100).toFixed(1)}%)`);
for (const e of examples) console.log('  new-rule enter at', e);
// and inside buildings: do we still enter? sample building zones' interior points
let m = 0, ok = 0;
for (const z of K._.zonesList.filter(z => z.place && !OUTDOOR.has(z.place) && z.place !== 'city' && (z.area || 0) > 150)) { for (let k = 0; k < 6; k++) { const [x0, z0, x1, z1] = z.bb; const x = x0 + R() * (x1 - x0), zz = z0 + R() * (z1 - z0); if (!K.pointInPoly(x, zz, z.poly)) continue; const s = phys.support(x, zz, z.y0 + 1.5); if (!isFinite(s.y) || Math.abs(s.y - z.y0) > 2) continue; m++; if (enters(x, s.y, zz)) ok++; } }
console.log(`points inside building rooms (>150 m²): ${m}; new rule recognises as inside: ${ok} (${(ok / m * 100).toFixed(1)}%)`);
// building-owned zones at street level without a roof (plazas, platforms, parking): the old rule reloaded on them
let u = 0, uOld = 0, uNew = 0; const names = new Map();
for (const z of K._.zonesList.filter(z => z.place && !OUTDOOR.has(z.place) && z.place !== 'city' && z.y0 > -1.5 && z.y0 < 1)) {
  for (let k = 0; k < 8; k++) { const [x0, z0, x1, z1] = z.bb; const x = x0 + R() * (x1 - x0), zz = z0 + R() * (z1 - z0); if (!K.pointInPoly(x, zz, z.poly)) continue; const s = phys.support(x, zz, 1.5); if (!isFinite(s.y) || Math.abs(s.y) > 1.5) continue;
    if (phys.ceilingAbove(x, zz, s.y + 0.5, s.y + 15) === Infinity) { u++; uOld++; if (enters(x, s.y, zz)) uNew++; names.set(z.place + ' / ' + z.name, (names.get(z.place + ' / ' + z.name) || 0) + 1); } }
}
console.log(`unroofed street-level points inside building zones: ${u} (old rule: reload on every one; new rule: ${uNew})`);
console.log('  most common:', [...names].sort((a, b) => b[1] - a[1]).slice(0, 12).map(([k, v]) => `${k} ${v}`).join(' | '));
// zone gaps inside buildings: points with a roof overhead but no zone (old rule: reload "out" from a building page)
let g = 0, gIn = 0;
for (const z of K._.zonesList.filter(z => z.place && !OUTDOOR.has(z.place) && z.place !== 'city' && (z.area || 0) > 80)) {
  for (let k = 0; k < 4; k++) { const [x0, z0, x1, z1] = z.bb; const x = x0 - 4 + R() * (x1 - x0 + 8), zz = z0 - 4 + R() * (z1 - z0 + 8); const s = phys.support(x, zz, z.y0 + 1.5); if (!isFinite(s.y) || Math.abs(s.y - z.y0) > 1.5) continue;
    if (phys.ceilingAbove(x, zz, s.y + 0.5, s.y + 8) === Infinity) continue; g++; if (!bldgAt(x, s.y, zz)) gIn++; }
}
console.log(`roofed points around building zones: ${g}; with no building zone (old rule: leave the building page): ${gIn} (${(gIn / g * 100).toFixed(1)}%)`);
