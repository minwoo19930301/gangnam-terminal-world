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
    junctions: JUNCTIONS.filter(j => j.a === id || j.b === id).map(j => ({ id: j.id, other: j.a === id ? j.b : j.a, x: r((j.pa[0] + j.pb[0]) / 2), z: r((j.pa[1] + j.pb[1]) / 2), y: j.y, also: j.alsoY || [] })),
  };
}
// ---- entrances: where you can walk from outside into a building module's indoor zones at street level ----
// One world with every module, the city and the ground; sample each indoor zone's outline every 0.75 m and keep spots
// where 1.2 m inside is this module's zone under a roof, 1.2 m outside is not, both have a floor at the same height and
// the walk across is free. Neighbouring spots join into openings (≥1 m wide). The browser draws a "virtual door" with
// a sign there and reloads into the other area when you walk through it.
{
  const { buildCity } = await import('../js/city.js');
  const { OUTDOOR } = await import('../js/areas.js');
  const phys = createPhysics(); const K = createKit(THREE, new THREE.Scene(), { osm, phys }); K.onNight = () => { };
  const cl = { b: new Set(), r: new Set(), a: new Set() }; const mods = [];
  for (const id of PLACES) { const m = await import(url.pathToFileURL(path.join(ROOT, 'js/places', id + '.js')).href); mods.push([id, m]); for (const c of m.meta?.claims || []) cl.b.add(c); for (const c of m.meta?.claimRoads || []) cl.r.add(c); for (const c of m.meta?.claimAreas || []) cl.a.add(c); }
  for (const [id, m] of mods) { K._.setCurrent(id, m.meta); m.build(K); }
  K._.setCurrent('city'); buildCity(K, osm, { claimedBuildings: cl.b, claimedRoads: cl.r, claimedAreas: cl.a });
  const [bx0, bz0, bx1, bz1] = osm.bbox; phys.addSurface([[bx0, bz0], [bx1, bz0], [bx1, bz1], [bx0, bz1]], -0.04, { holes: K._.groundHoles.map(h => h.poly) });
  const R = 0.32, H = 1.75, STEP = 0.5;
  const free = (x, z, y) => { const p = { x, z }; phys.resolve(p, R, y, y + H, STEP); return Math.hypot(p.x - x, p.z - z) < 0.05; };
  const floorAt = (x, z, y) => phys.support(x, z, y + STEP).y;
  const ownerAt = (x, y, z) => { const zn = phys.zoneAt(x, y + 0.1, z); return zn && zn.place && zn.place !== 'city' && !OUTDOOR.has(zn.place) ? zn.place : null; };
  for (const [id] of mods) {
    if (OUTDOOR.has(id) || !out[id]) continue;
    const spots = [];
    for (const zn of K._.zonesList.filter(z => z.place === id && z.y0 > -1.6 && z.y0 < 1.6)) {
      const P = zn.poly, n = P.length; let area2 = 0; for (let i = 0; i < n; i++) { const a = P[i], b = P[(i + 1) % n]; area2 += a[0] * b[1] - b[0] * a[1]; }
      const sg = area2 > 0 ? 1 : -1;
      for (let i = 0; i < n; i++) {
        const a = P[i], b = P[(i + 1) % n], L = Math.hypot(b[0] - a[0], b[1] - a[1]); if (L < 0.5) continue;
        const dx = (b[0] - a[0]) / L, dz = (b[1] - a[1]) / L, nx = dz * sg, nz = -dx * sg; // outward normal
        for (let t = 0.375; t < L; t += 0.75) {
          const x = a[0] + dx * t, z = a[1] + dz * t, yIn = floorAt(x - nx * 1.2, z - nz * 1.2, zn.y0 + 0.5), yOut = floorAt(x + nx * 1.2, z + nz * 1.2, zn.y0 + 0.5);
          if (!isFinite(yIn) || !isFinite(yOut) || Math.abs(yIn - yOut) > 0.6 || Math.abs(yIn - zn.y0) > 1.2) continue;
          if (ownerAt(x - nx * 1.2, yIn, z - nz * 1.2) !== id || ownerAt(x + nx * 1.2, yOut, z + nz * 1.2) === id) continue;
          if (phys.ceilingAbove(x - nx * 1.2, z - nz * 1.2, yIn + 0.5, yIn + 15) === Infinity) continue;
          let ok = true; for (const f of [-1.2, -0.6, 0, 0.6, 1.2]) { const yy = floorAt(x + nx * f, z + nz * f, yIn + 0.5); if (!isFinite(yy) || !free(x + nx * f, z + nz * f, yy)) { ok = false; break; } }
          if (ok) spots.push({ x, z, y: Math.max(yIn, yOut), nx, nz, dx, dz, other: ownerAt(x + nx * 1.2, yOut, z + nz * 1.2) });
        }
      }
    }
    // join neighbouring spots (same direction, ≤1.2 m apart) into openings
    const used = new Set(), opens = [];
    for (let i = 0; i < spots.length; i++) {
      if (used.has(i)) continue; const g = [spots[i]]; used.add(i);
      for (let grow = true; grow;) { grow = false; for (let j = 0; j < spots.length; j++) { if (used.has(j)) continue; const s = spots[j]; if (s.nx * g[0].nx + s.nz * g[0].nz < 0.9 || Math.abs(s.y - g[0].y) > 0.6) continue; if (g.some(q => Math.hypot(q.x - s.x, q.z - s.z) < 1.2)) { g.push(s); used.add(j); grow = true; } } }
      if (g.length < 2) continue;
      const cx = g.reduce((a, s) => a + s.x, 0) / g.length, cz = g.reduce((a, s) => a + s.z, 0) / g.length;
      const proj = g.map(s => (s.x - cx) * g[0].dx + (s.z - cz) * g[0].dz), w = Math.max(...proj) - Math.min(...proj) + 0.75;
      const mid = (Math.max(...proj) + Math.min(...proj)) / 2;
      opens.push({ x: Math.round((cx + g[0].dx * mid) * 10) / 10, z: Math.round((cz + g[0].dz * mid) * 10) / 10, y: Math.round(g[0].y * 10) / 10, w: Math.round(w * 10) / 10, nx: Math.round(g[0].nx * 1000) / 1000, nz: Math.round(g[0].nz * 1000) / 1000, other: g[0].other || null });
    }
    out[id].entrances = opens.filter(o => o.w >= 1);
  }
  // junction directions (pa → pb) for the corridor doors
  for (const [id, v] of Object.entries(out)) for (const j of v.junctions) { const jj = JUNCTIONS.find(q => q.id === j.id); if (jj) { const dx = jj.pb[0] - jj.pa[0], dz = jj.pb[1] - jj.pa[1], L = Math.hypot(dx, dz) || 1; const s = jj.a === id ? 1 : -1; j.nx = Math.round(dx / L * s * 1000) / 1000; j.nz = Math.round(dz / L * s * 1000) / 1000; } }
}
fs.writeFileSync(path.join(ROOT, 'js/places/_meta.json'), JSON.stringify(out));
for (const [id, v] of Object.entries(out)) console.log(id.padEnd(20), JSON.stringify(v.box), JSON.stringify(v.y), v.floors.length + ' floors', v.junctions.length + ' junctions', (v.entrances || []).length + ' entrances');
