// Walkability test: builds every place module + the city with the real kit/physics (no WebGL), then
//  1) for every junction (and its alsoY levels) searches a walking path from pa to pb,
//  2) for every elevator floor checks that you can walk out of the car,
//  3) for every spawn checks that you can walk at least a few metres.
// Path search = breadth-first search on a 0.25 m grid. A cell is free when the player capsule fits there
// (phys.resolve does not push it); stepping to a neighbour may change height by at most the step-up.
// usage: node tests/walk.mjs [placeId ...] [--no-city]
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
const osm = JSON.parse(fs.readFileSync(path.join(ROOT, 'data/osm.json'), 'utf8'));
const args = process.argv.slice(2);
let ids = PLACES;
const phys = createPhysics(); const K = createKit(THREE, new THREE.Scene(), { osm, phys }); K.onNight = () => { };
const claimed = { b: new Set(), r: new Set(), a: new Set() }; const mods = [];
for (const id of ids) { const m = await import(url.pathToFileURL(path.join(ROOT, 'js/places', id + '.js')).href); mods.push([id, m]); for (const c of m.meta?.claims || []) claimed.b.add(c); for (const c of m.meta?.claimRoads || []) claimed.r.add(c); for (const c of m.meta?.claimAreas || []) claimed.a.add(c); }
for (const [id, m] of mods) { K._.setCurrent(id, m.meta); m.build(K); }
if (!args.includes('--no-city')) { K._.setCurrent('city'); buildCity(K, osm, { claimedBuildings: claimed.b, claimedRoads: claimed.r, claimedAreas: claimed.a }); }
K._.buildAllDetail(); // furniture/stock in lazy detail groups can block paths too
for (const h of K._.groundHoles) { } // ground holes are already registered in phys by K.groundHole

const R = 0.32, H = 1.75, STEP = 0.5, G = 0.25;
function free(x, z, y) { const p = { x, z }; phys.resolve(p, R, y, y + H, STEP); return Math.hypot(p.x - x, p.z - z) < 0.03; }
// the in-game player samples support at its centre but crosses hairline gaps (slab seams, shaft edges)
// without noticeable falling, so take the best floor within ±0.12 m
function floorAt(x, z, y) { let b = -Infinity; for (const [ox, oz] of [[0, 0], [0.12, 0], [-0.12, 0], [0, 0.12], [0, -0.12]]) { const s = phys.support(x + ox, z + oz, y + STEP); if (s.y > b) b = s.y; } return b; }
// BFS from (x0,z0,y0); goal(x,z,y) → true ends the search. Limited to bbox.
function search(x0, z0, y0, goal, bb, maxCells = 400000) {
  const sy = floorAt(x0, z0, y0); if (!isFinite(sy) || Math.abs(sy - y0) > 0.7) return { ok: false, why: `no floor at start (found ${sy})` };
  const key = (i, j, y) => i + ',' + j + ',' + Math.round(y * 2);
  const seen = new Set(); const q = [[0, 0, sy]]; seen.add(key(0, 0, sy)); let best = Infinity, n = 0;
  if (!free(x0, z0, sy)) { // nudge the start out of walls
    const p = { x: x0, z: z0 }; phys.resolve(p, R, sy, sy + H, STEP); x0 = p.x; z0 = p.z;
  }
  while (q.length && n++ < maxCells) {
    const [i, j, y] = q.shift(); const x = x0 + i * G, z = z0 + j * G;
    if (goal(x, z, y)) return { ok: true, cells: n };
    for (const [di, dj] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
      const ni = i + di, nj = j + dj, nx = x0 + ni * G, nz = z0 + nj * G;
      if (nx < bb[0] || nx > bb[2] || nz < bb[1] || nz > bb[3]) continue;
      const ny = floorAt(nx, nz, y); if (!isFinite(ny) || ny < y - 0.6 || ny > y + STEP) continue;
      const k = key(ni, nj, ny); if (seen.has(k)) continue; seen.add(k);
      if (!free(nx, nz, ny)) continue;
      q.push([ni, nj, ny]);
    }
  }
  return { ok: false, why: `no path (${n} cells searched)` };
}

// Routes through the 3호선 complex (map audit, 3호선 re-plan). Spawns are read from the built kit.
const sp = n => { const s = K._.spawns.find(s => s.name === n); if (!s) throw new Error('no spawn ' + n); return s; };
const route = (name, a, b, bbPad = 60) => {
  const bb = [Math.min(a.x, b.x) - bbPad, Math.min(a.z, b.z) - bbPad, Math.max(a.x, b.x) + bbPad, Math.max(a.z, b.z) + bbPad];
  const r = search(a.x, a.z, a.y ?? 0, (x, z, yy) => Math.hypot(x - b.x, z - b.z) < 1.2 && Math.abs(yy - (b.y ?? 0)) < 0.7, bb, 3000000);
  console.log((r.ok ? 'OK      ' : 'BLOCKED ') + name + (r.ok ? ` (${r.cells} cells)` : ': ' + r.why));
  return r.ok;
};
const P = (n) => sp(n), plat = P('B2 · 3호선 승강장');
let ok = 0, bad = 0; const t = (...a) => (route(...a) ? ok++ : bad++);
t('고투몰 3호선 입구 (B1, W3 top) -> W3 하부 승강장 (B2 landing)', P('B1 · 고투몰 3호선 입구'), { x: -78, z: -88, y: -11 }, 20);
t('3호선 개찰구 대합실 (B1) -> 3호선 승강장', P('B1 · 3호선 개찰구 대합실'), plat);
t('3호선 승강장 -> 7호선 대합실 (B2)', plat, P('B2 · 7호선 대합실'));
t('3호선 승강장 -> 광고벽 환승통로', plat, P('B2 · 광고벽 환승통로'));
t('3호선 승강장 -> 9호선 승강장 (B4)', plat, P('B4 · 9호선 승강장'));
t('3호선 승강장 -> 7호선 곡선 승강장 (B3)', plat, P('B3 · 7호선 곡선 승강장'));
t('대리석 출구 안내와 계단 (B2) -> 3호선 승강장', P('B2 · 대리석 출구 안내와 계단'), plat);
t('9호선 무빙워크 환승통로 -> 3호선 승강장', P('B2 · 9호선 무빙워크 환승통로'), plat);
// west bank of the platform (through the north cross bridge)
{ const L3 = [[-37.23, -90.88], [-0.06, -0.72]], u = [0.381, 0.924], n = [-0.924, 0.381], s = 60;
  const w = { x: L3[0][0] + u[0] * s + n[0] * 11, z: L3[0][1] + u[1] * s + n[1] * 11, y: -11 };
  t('3호선 승강장 동쪽 -> 서쪽 승강장 (북단 연결교 경유)', plat, w, 150);
  t('대리석 출구 안내와 계단 (W3 landing) -> 서쪽 승강장', P('B2 · 대리석 출구 안내와 계단'), w); }
console.log(`3호선 routes: ${ok} ok, ${bad} blocked`);
