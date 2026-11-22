// Step 1 of the map audit: build every place module headless (same stubs as tests/smoke.mjs) and record
// what each one puts into the collision world (walls, walkable surfaces, ramps, ceilings, ground holes,
// zones, spawns, elevators), tagged by module. Read-only: nothing in js/ is modified.
// usage: node tools/map_audit_extract.mjs [out.json]
import * as THREE from 'three';
import fs from 'node:fs'; import path from 'node:path'; import url from 'node:url';
const ROOT = path.resolve(path.dirname(url.fileURLToPath(import.meta.url)), '..');
const out = process.argv[2] || path.join(ROOT, 'docs/map-audit/built.json');
const ctx = new Proxy({}, { get: (t, k) => k === 'measureText' ? (s => ({ width: String(s).length * 10 })) : k === 'createLinearGradient' || k === 'createRadialGradient' || k === 'createPattern' ? (() => ({ addColorStop() { } })) : k === 'getImageData' ? (() => ({ data: new Uint8ClampedArray(4) })) : (typeof k === 'string' && /^[a-z]/.test(k) && !['canvas', 'font', 'fillStyle', 'strokeStyle', 'lineWidth', 'textAlign', 'textBaseline', 'globalAlpha', 'globalCompositeOperation', 'shadowColor', 'shadowBlur', 'lineCap', 'lineJoin', 'filter', 'imageSmoothingEnabled'].includes(k) ? () => { } : t[k]), set: (t, k, v) => { t[k] = v; return true; } });
globalThis.__makeCanvas = (w, h) => ({ width: w, height: h, getContext: () => ctx, style: {} });
const { createPhysics } = await import('../js/physics.js');
const { createKit } = await import('../js/kit.js');
const { PLACES } = await import('../js/places/index.js');
const osm = JSON.parse(fs.readFileSync(path.join(ROOT, 'data/osm.json'), 'utf8'));
const phys = createPhysics(); const scene = new THREE.Scene();
const K = createKit(THREE, scene, { osm, phys }); K.onNight = () => { };
let cur = 'city';
const rec = {};
const R = id => rec[id] ||= { walls: [], surfs: [], ramps: [], ceils: [], holes: [], zones: [], spawns: [], elevators: [], meta: null };
const r2 = v => Math.round(v * 100) / 100, rp = p => p.map(q => [r2(q[0]), r2(q[1])]);
// call site (js/places/<file>:line) of the module code that issued the call
const site = () => { const st = new Error().stack.split('\n'); for (const l of st) { const m = l.match(/js\/places\/([^/]+\.js):(\d+)/); if (m) return m[1] + ':' + m[2]; } return null; };
const o = { addWall: phys.addWall, addSurface: phys.addSurface, addRamp: phys.addRamp, addCeiling: phys.addCeiling, addGroundHole: phys.addGroundHole };
phys.addWall = (ax, az, bx, bz, y0, y1, r, tag) => { R(tag || cur).walls.push([r2(ax), r2(az), r2(bx), r2(bz), r2(y0), r2(y1)]); return o.addWall(ax, az, bx, bz, y0, y1, r, tag); };
phys.addSurface = (poly, y, opts = {}) => { R(opts.tag || cur).surfs.push({ y: r2(y), poly: rp(poly), holes: (opts.holes || []).map(rp), tagged: !!opts.tag, at: (poly.length > 2 && y >= 1.5) || y <= -2 ? site() : null }); return o.addSurface(poly, y, opts); };
phys.addRamp = (ax, az, bx, bz, hw, ya, yb, opts = {}) => { R(opts.tag || cur).ramps.push({ a: [r2(ax), r2(az)], b: [r2(bx), r2(bz)], hw: r2(hw), ya: r2(ya), yb: r2(yb), move: !!opts.move, at: Math.min(ya, yb) < -2 ? site() : null }); return o.addRamp(ax, az, bx, bz, hw, ya, yb, opts); };
phys.addCeiling = (poly, y, opts = {}) => { R(cur).ceils.push({ y: r2(y), poly: rp(poly) }); return o.addCeiling(poly, y, opts); };
phys.addGroundHole = (poly, inner) => { R(cur).holes.push({ poly: rp(poly), inner: (inner || []).map(rp) }); return o.addGroundHole(poly, inner); };
const sc = K._.setCurrent; K._.setCurrent = (id, meta) => { cur = id; return sc(id, meta); };
// ground paint (asphalt / sidewalk) and wall openings (doors), recorded by wrapping the public K calls
const isRoad = m => { const t = typeof m === 'string' ? m : JSON.stringify(m || ''); return /asphalt/.test(t) ? 'asphalt' : /sidewalk/.test(t) ? 'sidewalk' : null; };
const gr = id => (R(id).ground ||= []), dr = id => (R(id).doors ||= []);
const kRamp = K.ramp, kSlab = K.slab, kHpoly = K.hpoly, kBox = K.box, kPrism = K.prism, kWall = K.wall, kPoly = K.polyWalls;
const vis = (poly, y) => { if (y >= 2 && poly.length > 2) (R(cur).vis ||= []).push({ y: r2(y), poly: rp(poly), at: site() }); };
K.ramp = (ax, az, bx, bz, o = {}) => { const t = isRoad(o.mat); if (t) gr(cur).push({ at: site(), t, kind: 'strip', a: [r2(ax), r2(az)], b: [r2(bx), r2(bz)], w: r2(o.w ?? 2), ya: r2(o.ya ?? 0), yb: r2(o.yb ?? 0) }); return kRamp(ax, az, bx, bz, o); };
K.slab = (poly, y, o = {}) => { vis(poly, y); const t = isRoad(o.mat ?? 'tile'); if (t) gr(cur).push({ at: site(), t, kind: 'poly', y: r2(y), poly: rp(poly) }); return kSlab(poly, y, o); };
K.hpoly = (mat, poly, y, up, holes) => { vis(poly, y); const t = isRoad(mat); if (t) gr(cur).push({ at: site(), t, kind: 'poly', y: r2(y), poly: rp(poly) }); return kHpoly(mat, poly, y, up, holes); };
K.prism = (poly, y0, y1, o = {}) => { vis(poly, y1); const t = isRoad(o.top) || isRoad(o.mat); if (t && y1 - y0 < 1) gr(cur).push({ at: site(), t, kind: 'poly', y: r2(y1), poly: rp(poly) }); return kPrism(poly, y0, y1, o); };
K.box = (o = {}) => { const t = isRoad(o.top) || isRoad(o.mat); if (t && (o.h ?? 1) < 1) { const c = Math.cos(o.rotY || 0), s = Math.sin(o.rotY || 0), hw = o.w / 2, hd = o.d / 2; const P = (lx, lz) => [o.x + lx * c + lz * s, o.z - lx * s + lz * c]; gr(cur).push({ at: site(), t, kind: 'poly', y: r2((o.y ?? 0) + (o.h ?? 0)), poly: rp([P(-hw, -hd), P(hw, -hd), P(hw, hd), P(-hw, hd)]) }); } return kBox(o); };
K.wall = (ax, az, bx, bz, y0, y1, o = {}) => { const L = Math.hypot(bx - ax, bz - az) || 1; for (const op of o.openings || []) dr(cur).push({ at: site(), x: r2(ax + (bx - ax) * op.at / L), z: r2(az + (bz - az) * op.at / L), w: op.w, y0: r2(y0 + (op.y0 ?? 0)), y1: r2(y0 + (op.y1 ?? 2.4)), wy: r2(y0) }); return kWall(ax, az, bx, bz, y0, y1, o); };
K.polyWalls = (poly, y0, y1, o = {}) => { for (const op of o.openings || []) dr(cur).push({ at: site(), x: r2(op.x), z: r2(op.z), w: op.w, y0: r2(y0 + (op.y0 ?? 0)), y1: r2(y0 + (op.y1 ?? 2.4)), wy: r2(y0) }); return kPoly(poly, y0, y1, o); };
for (const id of PLACES) {
  const m = await import(url.pathToFileURL(path.join(ROOT, 'js/places', id + '.js')).href);
  K._.setCurrent(id, m.meta); R(id).meta = { name: m.meta.name, claims: m.meta.claims || [], claimRoads: m.meta.claimRoads || [], claimAreas: m.meta.claimAreas || [] };
  try { m.build(K); } catch (e) { R(id).error = String(e); }
}
for (const z of K._.zonesList) R(z.place).zones.push({ name: z.name, floor: z.floor, sub: z.sub, y0: z.y0, y1: z.y1, poly: rp(z.poly) });
for (const s of K._.spawns) R(s.place).spawns.push({ name: s.name, x: r2(s.x), y: r2(s.y ?? 0), z: r2(s.z), group: s.group });
for (const e of K._.elevators) R(e.place).elevators.push({ name: e.name, x: r2(e.x), z: r2(e.z), floors: e.floors.map(f => [f.label, f.y]) });
// probe helper data: junction floors as the engine sees them
const { JUNCTIONS, WELLS } = await import('../js/places/_junctions.js');
const probes = {};
const pr = (x, z, y) => { const s = phys.support(x, z, y + 0.5); return s.y; };
for (const j of JUNCTIONS) probes[j.id] = [j.pa, j.pb].map(p => pr(p[0], p[1], j.y));
// straight-line walk pa -> pb with the real collision (player capsule r=.32, h=1.75, step .5)
const walks = {};
for (const j of JUNCTIONS) {
  const [a, b] = [j.pa || [j.x, j.z], j.pb || [j.x, j.z]]; const L = Math.hypot(b[0] - a[0], b[1] - a[1]);
  const w = { len: r2(L), fa: pr(a[0], a[1], j.y), fb: pr(b[0], b[1], j.y), blockedAt: null, floorLostAt: null, maxDy: 0 };
  let y = Number.isFinite(w.fa) ? w.fa : j.y, n = Math.max(1, Math.ceil(L / 0.2));
  for (let i = 1; i <= n; i++) {
    const t = i / n, tx = a[0] + (b[0] - a[0]) * t, tz = a[1] + (b[1] - a[1]) * t;
    const pos = { x: tx, z: tz }; phys.resolve(pos, 0.32, y, y + 1.75, 0.5);
    if (w.blockedAt === null && Math.hypot(pos.x - tx, pos.z - tz) > 0.05) w.blockedAt = r2(t * L);
    const sup = phys.support(tx, tz, y + 0.5);
    if (sup.y === -Infinity || sup.y < y - 0.6) { if (w.floorLostAt === null) w.floorLostAt = r2(t * L); } else { w.maxDy = Math.max(w.maxDy, Math.abs(sup.y - y)); y = sup.y; }
  }
  walks[j.id] = w;
}
// raw ground / stairs heads: ramps ending at street level are recorded in rec[*].ramps
fs.writeFileSync(out, JSON.stringify({ places: rec, probes, walks, junctions: JUNCTIONS, wells: WELLS }));
const sz = fs.statSync(out).size;
console.log('wrote', out, (sz / 1e6).toFixed(1) + 'MB', Object.entries(rec).map(([k, v]) => `${k}:${v.walls.length}w/${v.surfs.length}s/${v.ramps.length}r`).join(' '));
