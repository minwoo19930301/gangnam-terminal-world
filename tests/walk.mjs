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
let ids = args.filter(a => !a.startsWith('--')); if (!ids.length) ids = PLACES;
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
const fails = [], oks = [];
for (const j of JUNCTIONS) {
  if (!ids.includes(j.a) || !ids.includes(j.b)) continue;
  for (const y of [j.y, ...(j.alsoY || [])]) {
    const [ax, az] = j.pa, [bx, bz] = j.pb; const pad = 30;
    const bb = [Math.min(ax, bx) - pad, Math.min(az, bz) - pad, Math.max(ax, bx) + pad, Math.max(az, bz) + pad];
    const r = search(ax, az, y, (x, z, yy) => Math.hypot(x - bx, z - bz) < 0.6 && Math.abs(yy - y) < 0.7, bb);
    (r.ok ? oks : fails).push(`junction ${j.id} ${j.a}→${j.b} y=${y}: ${r.ok ? 'walkable' : r.why}`);
  }
}
for (const el of K._.elevators) for (const f of el.floors) {
  const cx = el.x + (f.dx || 0), cz = el.z + (f.dz || 0);
  const bb = [el.x - 12, el.z - 12, el.x + 12, el.z + 12];
  const r = search(cx, cz, f.y, (x, z, yy) => Math.hypot(x - el.x, z - el.z) > 4 && Math.abs(yy - f.y) < 0.7, bb, 60000);
  (r.ok ? oks : fails).push(`elevator ${el.place} "${el.name}" ${f.label}: ${r.ok ? 'can walk out' : r.why}`);
  if (!r.ok && args.includes('--debug')) {
    const rows = [];
    for (const d of [1.2, 2, 3, 4.5]) for (let k = 0; k < 8; k++) { const a = k / 8 * Math.PI * 2, x = cx + Math.cos(a) * d, z = cz + Math.sin(a) * d; const y = floorAt(x, z, f.y); rows.push(`d${d} a${k * 45}: floor ${isFinite(y) ? y.toFixed(2) : y} free ${isFinite(y) ? free(x, z, y) : '-'}`); }
    console.log(`DEBUG ${el.name} ${f.label} car (${cx.toFixed(1)},${cz.toFixed(1)}) y=${f.y}\n  ` + rows.join('\n  '));
  }
}
for (const s of K._.spawns) {
  const bb = [s.x - 10, s.z - 10, s.x + 10, s.z + 10];
  const r = search(s.x, s.z, s.y ?? 0, (x, z) => Math.hypot(x - s.x, z - s.z) > 3, bb, 30000);
  (r.ok ? oks : fails).push(`spawn ${s.place} "${s.name}": ${r.ok ? 'can move' : r.why}`);
}
// long routes along the underground mall and between modules (consecutive pairs must connect on foot)
const ROUTES = [
  { name: '고투몰 서편→동편', y: -6, pts: [[-314.2, -12.9], [-189.3, -61.5], [-68.1, -102.9], [-20.6, -112.7], [-2.3, -121.2], [189.5, -190.6], [345.3, -257.8]], need: ['gotomall'] },
  { name: '고투몰→3호선 B2', y: null, pts: [[-68.1, -102.9, -6], [-79, -151, -11]], need: ['gotomall', 'station'] },
  { name: '센트럴시티 B1→파미에 B1→7호선', y: -6, pts: [[-93.4, 57.8], [-60.5, 169.5], [-16.3, 174.5]], need: ['centralcity', 'station'] },
  { name: '고터→뉴코아 (신반포로·잠원로)', y: 0, pts: [[60, -128], [200, -200], [300, -240], [330, -320]], need: ['streets', 'newcore'] },
  { name: '고터→반원상가 (신반포로23길)', y: 0, pts: [[-60, -150], [-120, -300], [-159, -400]], need: ['streets', 'banwon'] },
  { name: '뉴코아→잠원한강공원 (잠원역·신잠원나들목)', y: 0, pts: [[333.4, -315.8], [248.9, -519.5], [175.3, -685.8], [105.6, -853.2], [237.0, -1032.3], [362.8, -1182.8], [399.9, -1250.4], [344.24, -1268.03], [283.79, -1330.92], [190.22, -1424.12, 0.065]], need: ['newcore', 'jamwon_hangang'] },
  { name: '반포한강공원→잠수교 남단 아래→잠원한강공원→서울웨이브', y: 0, pts: [[-704.5, -793.1, 0.065], [-556.3, -809.7, 0.065], [-427.3, -871.1, 0.065], [-284.9, -921.7, 0.065], [-165.7, -1004.4, 0.065], [-41.9, -1110.4, 0.065], [7.1, -1263.9, 0.065], [80.5, -1369.6, 0.065], [238.4, -1472.6, 0.065], [178, -1528, 0.12]], need: ['hangang', 'jamwon_hangang'] },
  { name: '원베일리 보행로 본체→반포나들목→반포한강공원', y: -6, pts: [[-410, -45], [-475, -212], [-540, -380], [-567.98, -603.7, 0], [-592, -625, 0]], need: ['onebailey', 'hangang'] },
  { name: '고터→르본시티 1F 귀금속타운', y: 0, pts: [[-150, -40], [-232, -8], [-232, 20]], need: ['streets', 'lebon'] },
  // Round20: approved photo walk, with 3GATE on the Shinsegae south wall.
  { name: '1F 동선: 1GATE→신세계 홀→3GATE→센트럴시티 홀→호남선', y: 0, pts: [[-75.765, -36.195], [-66, -11], [-55, 15], [-52.5, 27], [-48, 39], [-46, 43.1], [-44.4, 49], [-41.9, 55.7], [-36.5, 69.7], [-49.3, 67.1], [-52.6, 69.5], [-65.5, 80.8], [-66.9, 85.6]], need: ['shinsegae', 'centralcity', 'jwmarriott'] },
  { name: '1F 동선: 센트럴시티 홀→스위트 가든→B1 스위트 파크→하우스 오브 신세계', y: null, pts: [[-36.5, 69.7, 0], [-23, 90, 0], [-27, 80, -6], [-32, 77, -6], [-15, 82, -6], [-4, 85, -6], [0, 95, -6], [6, 112, -6], [3, 126, -6], [7.8, 138.3, -6]], need: ['centralcity', 'jwmarriott'] },
  // ---- the user's own route (2026-11-07): every leg must be walkable ----
  { name: '사용자 루트 1: 반포역→뉴코아 1관→고투몰 동편', y: 0, pts: [[453, -316], [295.2, -362.1], [330, -300], [400, -243], [345.3, -257.8, -6]], need: ['newcore', 'gotomall'], pad: 60 },
  { name: '사용자 루트 2: 고투몰 동편→G11→다이소 GATE4→매장→GATE1', y: -6, pts: [[345.3, -257.8], [189.5, -190.5], [138.2, -170.7], [141.7, -109], [225.8, -118.5], [258.1, -150.2]], need: ['gotomall', 'gyeongbu'] },
  { name: '사용자 루트 3: 다이소 GATE1→경부선 1F 대합실→3F 꽃시장', y: null, pts: [[258.1, -150.2, -6], [149, -132.1, 0], [99.8, -1.1, 0], [70.5, 21.8, 11]], need: ['gyeongbu'] },
  { name: '사용자 루트 4: 경부선 정문→고투몰 중앙→신세계 B1→1F 홀', y: null, pts: [[149, -132.1, 0], [-2.3, -121.2, -6], [-70, -89, -6], [-70, -35, -6], [-75, -10, 0]], need: ['gyeongbu', 'gotomall', 'shinsegae'] },
  { name: '사용자 루트 5: 호남선 홀→르본시티 귀금속타운→고투몰 G2→원베일리', y: null, pts: [[-102.1, 52.0, 0], [-209.1, 11.5, 0], [-239.5, -2.8, 0], [-235.8, 8.7, 0], [-332, -66, -6], [-411.8, -49.7, -6]], need: ['centralcity', 'lebon', 'gotomall', 'onebailey'] },
  { name: '사용자 루트 6: 원베일리→반포한강공원→달빛광장→세빛섬 가빛섬', y: null, pts: [[-536.6, -371.3, -6], [-568, -603.7, 0], [-629, -736, 0.1], [-882, -723, 0]], need: ['onebailey', 'hangang'], pad: 160 },
  { name: '사용자 루트 7: 세빛섬→잠수교', y: null, pts: [[-882, -723, 0], [-704.5, -793.1, 0.065], [-700, -934, 1.6]], need: ['hangang'], pad: 200 },
  { name: '고터→반포한강공원 (반포대로·반포나들목)', y: 0, pts: [[-371, -136], [-345, -450], [-330, -620], [-297.9, -791.1], [-629, -736]], need: ['streets', 'hangang'] },
];
for (const rt of ROUTES) {
  if (!rt.need.every(n => ids.includes(n))) continue;
  for (let i = 0; i < rt.pts.length - 1; i++) {
    const [ax, az, ay = rt.y] = rt.pts[i], [bx, bz, by = rt.y] = rt.pts[i + 1]; const pad = rt.pad || 40;
    const bb = [Math.min(ax, bx) - pad, Math.min(az, bz) - pad, Math.max(ax, bx) + pad, Math.max(az, bz) + pad];
    const r = search(ax, az, ay, (x, z, yy) => Math.hypot(x - bx, z - bz) < 1.0 && Math.abs(yy - by) < 0.7, bb, 2500000);
    (r.ok ? oks : fails).push(`route ${rt.name} [${i}→${i + 1}] (${ax},${az})→(${bx},${bz}): ${r.ok ? 'walkable' : r.why}`);
  }
}
console.log(`walk: ${oks.length} ok, ${fails.length} blocked`);
for (const f of fails) console.log('BLOCKED', f);
if (args.includes('--verbose')) for (const o of oks) console.log('ok', o);
process.exitCode = fails.length ? 1 : 0;
