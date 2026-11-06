// Generic city layer from OpenStreetMap: everything not claimed by a detailed place module.
import { pointInPoly, polyBBox, polyArea } from './physics.js';

const CAR = new Set(['motorway', 'trunk', 'trunk_link', 'primary', 'primary_link', 'secondary', 'secondary_link', 'tertiary', 'tertiary_link', 'residential', 'unclassified', 'service', 'busway', 'living_street', 'construction']);
const MAJOR = new Set(['trunk', 'primary', 'secondary', 'motorway']);
const SIGNAL_ROADS = new Set(['primary', 'secondary', 'tertiary']);
const PAINT = { white: 0xf4f1e6, yellow: 0xf2c329, blue: 0x238bd2, pink: 0xe477a1, mint: 0x50cbb1 };
const LAYER_H = 7.5;

export function buildCity(K, osm, { claimedBuildings = new Set(), claimedRoads = new Set(), claimedAreas = new Set(), log = () => {} } = {}) {
  const { THREE } = K;
  const rnd = K.rand(42);
  // ---------- building index (for tree/POI placement tests) ----------
  const bGrid = new Map(); const CELL = 40;
  const bkey = (i, j) => i * 10007 + j;
  for (const b of osm.buildings) {
    const bb = polyBBox(b.poly); b._bb = bb;
    for (let i = Math.floor(bb[0] / CELL); i <= Math.floor(bb[2] / CELL); i++) for (let j = Math.floor(bb[1] / CELL); j <= Math.floor(bb[3] / CELL); j++) {
      const k = bkey(i, j); if (!bGrid.has(k)) bGrid.set(k, []); bGrid.get(k).push(b);
    }
  }
  const buildingAt = (x, z, pad = 0) => {
    for (const b of bGrid.get(bkey(Math.floor(x / CELL), Math.floor(z / CELL))) || []) {
      if (x < b._bb[0] - pad || x > b._bb[2] + pad || z < b._bb[1] - pad || z > b._bb[3] + pad) continue;
      if (pointInPoly(x, z, b.poly)) return b;
      if (pad > 0) for (let i = 0; i < b.poly.length; i++) { const a = b.poly[i], c = b.poly[(i + 1) % b.poly.length]; if (segDist(x, z, a, c) < pad) return b; }
    }
    return null;
  };
  // ---------- road index ----------
  const roads = osm.roads.filter(r => !claimedRoads.has(r.id));
  const rGrid = new Map(); const RC = 30;
  for (const r of roads) {
    if (r.tunnel) continue;
    for (let i = 0; i < r.pts.length - 1; i++) {
      const a = r.pts[i], b = r.pts[i + 1];
      const x0 = Math.min(a[0], b[0]) - r.width, x1 = Math.max(a[0], b[0]) + r.width, z0 = Math.min(a[1], b[1]) - r.width, z1 = Math.max(a[1], b[1]) + r.width;
      for (let gi = Math.floor(x0 / RC); gi <= Math.floor(x1 / RC); gi++) for (let gj = Math.floor(z0 / RC); gj <= Math.floor(z1 / RC); gj++) {
        const k = bkey(gi, gj); if (!rGrid.has(k)) rGrid.set(k, []); rGrid.get(k).push({ r, a, b });
      }
    }
  }
  const onRoad = (x, z, carOnly = true, pad = 0.5) => {
    for (const s of rGrid.get(bkey(Math.floor(x / RC), Math.floor(z / RC))) || []) {
      if (carOnly && !CAR.has(s.r.hw)) continue;
      if (segDist(x, z, s.a, s.b) < s.r.width / 2 + pad) return s;
    }
    return null;
  };

  // Include claimed roads in topology/clearance, but never paint their approaches.
  const layout = roadLayout(osm, claimedRoads);
  const roadStats = { junctions: layout.junctions.length, signalised: layout.junctions.filter(j => j.signal).length,
    renderedSignalised: 0, approaches: 0, crosswalks: 0, reusedCrosswalks: 0, signalAssemblies: 0,
    signalHeads: 0, pedestrianSignals: 0, missingPedestrianSignals: 0, guidePaths: 0,
    approachArrows: 0, dualCarriagewayWays: 0, quads: 0 };
  const countRoadDetail = fn => { const before = K._.stats.quads; fn(); roadStats.quads += K._.stats.quads - before; };
  const poleSites = [], crossingSites = [];
  // The ground-road index includes claimed ways and excludes flyovers; an
  // elevated carriageway's map footprint is not a lane at a sidewalk landing.
  const clearFurniture = (x, z, pad = 0.45) => !layout.allCarAt(x, z, pad) && !buildingAt(x, z, pad);
  K.texture('city-tactile', 64, 64, (g, w, h) => {
    g.fillStyle = '#d4ae32'; g.fillRect(0, 0, w, h); g.fillStyle = '#f6ce52';
    for (let x = 8; x < w; x += 16) for (let y = 8; y < h; y += 16) { g.beginPath(); g.arc(x, y, 3, 0, Math.PI * 2); g.fill(); }
  }, [0.4, 0.4]);

  // ---------- elevation for bridges / flyovers ----------
  const endCount = new Map(); const ek = p => Math.round(p[0] * 2) + ',' + Math.round(p[1] * 2);
  for (const r of roads) if (r.bridge || r.layer > 0) for (const p of [r.pts[0], r.pts[r.pts.length - 1]]) endCount.set(ek(p), (endCount.get(ek(p)) || 0) + 1);
  function heights(r) {
    const n = r.pts.length; const hs = new Array(n).fill(0);
    if (!(r.bridge || r.layer > 0) || r.tunnel) return hs;
    const H = Math.max(1, r.layer || 1) * LAYER_H;
    const cum = [0]; for (let i = 1; i < n; i++) cum.push(cum[i - 1] + Math.hypot(r.pts[i][0] - r.pts[i - 1][0], r.pts[i][1] - r.pts[i - 1][1]));
    const L = cum[n - 1]; const freeA = (endCount.get(ek(r.pts[0])) || 0) < 2, freeB = (endCount.get(ek(r.pts[n - 1])) || 0) < 2;
    const ramp = Math.min(80, L / 2.2);
    for (let i = 0; i < n; i++) {
      let h = H;
      if (freeA && cum[i] < ramp) h = Math.min(h, H * cum[i] / ramp);
      if (freeB && L - cum[i] < ramp) h = Math.min(h, H * (L - cum[i]) / ramp);
      hs[i] = h;
    }
    return hs;
  }

  // ---------- areas ----------
  const areaMat = {
    'leisure:park': 'grass', 'landuse:grass': 'grass', 'leisure:garden': 'grass', 'natural:grassland': 'grass', 'landuse:forest': { tex: 'grass', color: 0xb0d0a0 },
    'natural:wood': { tex: 'grass', color: 0xa8c898 }, 'leisure:pitch': { tex: 'grass', color: 0xcfe8b0 }, 'leisure:playground': { tex: 'sidewalk', color: 0xe8d8c0 },
    'amenity:parking': { tex: 'asphalt', color: 0xdddddd }, 'leisure:track': { tex: 'concrete', color: 0xd88870 }, 'place:islet': { tex: 'grass', color: 0xd8e0b0 },
    'man_made:pier': 'wood', 'leisure:schoolyard': { tex: 'concrete', color: 0xe0c8a8 }, 'leisure:sports_centre': { tex: 'concrete', color: 0xd0d0c8 },
    'highway:pedestrian': 'sidewalk', 'leisure:fitness_station': 'sidewalk', 'landuse:construction': { tex: 'concrete', color: 0xc8b090 },
  };
  const areaY = { 'amenity:parking': 0.018, 'leisure:pitch': 0.016, 'leisure:track': 0.017, 'leisure:playground': 0.017, 'man_made:pier': 0.25 };
  for (const a of osm.areas) {
    if (claimedAreas.has(a.id)) continue;
    if (a.kind === 'natural:water') {
      const big = polyArea(a.poly) > 20000;
      const wy = big ? -1.4 : -0.5;
      K.groundHole(a.poly, a.holes);
      K.hpoly('water', a.poly, wy, true, a.holes);
      K.phys.addSurface(a.poly, wy - 0.7, { holes: a.holes, slow: 0.7, tag: 'water' });
      // revetment skirt
      const ns = K.orient(a.poly);
      for (let i = 0; i < a.poly.length; i++) { const p = a.poly[i], q = a.poly[(i + 1) % a.poly.length]; K.quad({ tex: 'concrete', color: 0x9a9890 }, [[p[0], wy - 1, p[1]], [q[0], wy - 1, q[1]], [q[0], 0.01, q[1]], [p[0], 0.01, p[1]]], [-ns[i][0], 0, -ns[i][1]]); }
      for (const h of a.holes || []) K.hpoly({ tex: 'grass', color: 0xd8e0b0 }, h, 0.0, true);
      continue;
    }
    const m = areaMat[a.kind];
    if (!m) continue;
    const y = areaY[a.kind] ?? 0.012;
    K.hpoly(m, a.poly, y, true, a.holes);
    if (a.kind === 'man_made:pier') K.phys.addSurface(a.poly, y, {});
    if (a.kind === 'amenity:parking' && polyArea(a.poly) > 300) parkingLines(a);
    if (/park|forest|wood|grass|garden/.test(a.kind)) fillTrees(a.poly, a.holes, a.kind.includes('forest') || a.kind.includes('wood') ? 90 : 260);
  }
  function parkingLines(a) {
    // stall lines along the longest edge direction
    let best = 0, dir = [1, 0];
    for (let i = 0; i < a.poly.length; i++) { const p = a.poly[i], q = a.poly[(i + 1) % a.poly.length]; const L = Math.hypot(q[0] - p[0], q[1] - p[1]); if (L > best) { best = L; dir = [(q[0] - p[0]) / L, (q[1] - p[1]) / L]; } }
    const bb = polyBBox(a.poly); const cx = (bb[0] + bb[2]) / 2, cz = (bb[1] + bb[3]) / 2; const R = Math.hypot(bb[2] - bb[0], bb[3] - bb[1]) / 2;
    const nx = -dir[1], nz = dir[0];
    for (let row = -R; row < R; row += 11) for (let t = -R; t < R; t += 2.5) {
      const x = cx + dir[0] * t + nx * row, z = cz + dir[1] * t + nz * row;
      if (!pointInPoly(x, z, a.poly) || !pointInPoly(x + nx * 5, z + nz * 5, a.poly)) continue;
      K.quad(0xf2f2f2, [[x, 0.022, z], [x + nx * 5, 0.022, z + nz * 5], [x + nx * 5 + dir[0] * 0.12, 0.022, z + nz * 5 + dir[1] * 0.12], [x + dir[0] * 0.12, 0.022, z + dir[1] * 0.12]], [0, 1, 0]);
      if (rnd() < 0.55 && pointInPoly(x + nx * 2.5 + dir[0] * 1.25, z + nz * 2.5 + dir[1] * 1.25, a.poly)) K.vehicle({ x: x + nx * 2.5 + dir[0] * 1.25, z: z + nz * 2.5 + dir[1] * 1.25, rotY: Math.atan2(nx, nz), kind: rnd() < 0.15 ? 'van' : 'car', solid: true });
    }
  }
  function fillTrees(poly, holes, perTree) {
    const n = Math.min(400, Math.floor(polyArea(poly) / perTree)); const bb = polyBBox(poly); let k = 0, g = 0;
    while (k < n && g++ < n * 8) {
      const x = bb[0] + rnd() * (bb[2] - bb[0]), z = bb[1] + rnd() * (bb[3] - bb[1]);
      if (!pointInPoly(x, z, poly) || (holes && holes.some(h => pointInPoly(x, z, h))) || buildingAt(x, z, 2) || onRoad(x, z, false, 1)) continue;
      K.tree(x, z, { kind: rnd() < 0.2 ? 'pine' : rnd() < 0.5 ? 'cherry' : 'zelkova', h: 6 + rnd() * 6 }); k++;
    }
  }
  // residential landuse: apartment complex greenery
  for (const a of osm.areas) if (a.kind === 'landuse:residential' && !claimedAreas.has(a.id)) fillTrees(a.poly, a.holes, 420);

  // ---------- roads ----------
  const roadMat = { tex: 'asphalt' };
  const busMat = { tex: 'asphalt', color: 0xd88870 };
  for (const r of roads) {
    if (r.tunnel || r.pts.length < 2) continue;
    if (r.hw === 'corridor' || (r.level && r.level.startsWith('-'))) continue;
    const car = CAR.has(r.hw);
    const hs = heights(r);
    const elevated = hs.some(h => h > 0.5);
    let mat, y0;
    if (car) { mat = r.hw === 'busway' ? busMat : roadMat; y0 = r.hw === 'service' ? 0.02 : 0.03; }
    else if (r.hw === 'cycleway') { mat = { tex: 'asphalt', color: 0xc07060 }; y0 = 0.045; }
    else if (r.hw === 'steps') { mat = 'darkstone'; y0 = 0.05; }
    else if (r.footway === 'crossing') { mat = null; y0 = 0.05; }
    else { mat = 'sidewalk'; y0 = 0.05; }
    const w = r.footway === 'crossing' ? 0 : (car ? r.width : Math.max(1.5, r.width));
    if (mat && w > 0) ribbon(r.pts, hs, w, mat, y0, elevated);
    if (elevated) elevatedExtras(r, hs, w || r.width);
    if (car && !elevated && layout.byRoad.has(r.id) && r.width >= 6) countRoadDetail(() => markings(r, y0 + 0.012));
    if (r.footway === 'crossing') countRoadDetail(() => zebra(r.pts, hs));
    if (MAJOR.has(r.hw) && !elevated && !r.bridge) streetside(r);
  }
  function ribbon(pts, hs, w, mat, y0, elevated) {
    const n = pts.length; const L = [], R = [];
    for (let i = 0; i < n; i++) {
      const p = pts[i]; const a = pts[Math.max(0, i - 1)], b = pts[Math.min(n - 1, i + 1)];
      let dx = b[0] - a[0], dz = b[1] - a[1]; const l = Math.hypot(dx, dz) || 1; dx /= l; dz /= l;
      let nx = -dz, nz = dx; let scale = 1;
      if (i > 0 && i < n - 1) { // miter
        const d1 = norm(p[0] - pts[i - 1][0], p[1] - pts[i - 1][1]), d2 = norm(pts[i + 1][0] - p[0], pts[i + 1][1] - p[1]);
        const m = norm(-(d1[1] + d2[1]), d1[0] + d2[0]); const dot = m[0] * -d1[1] + m[1] * d1[0]; if (dot > 0.3) { nx = m[0]; nz = m[1]; scale = 1 / dot; }
      }
      L.push([p[0] + nx * w / 2 * scale, p[1] + nz * w / 2 * scale]); R.push([p[0] - nx * w / 2 * scale, p[1] - nz * w / 2 * scale]);
    }
    let u = 0;
    for (let i = 0; i < n - 1; i++) {
      const seg = Math.hypot(pts[i + 1][0] - pts[i][0], pts[i + 1][1] - pts[i][1]);
      const ya = hs[i] + y0, yb = hs[i + 1] + y0;
      K.quad(mat, [[L[i][0], ya, L[i][1]], [L[i + 1][0], yb, L[i + 1][1]], [R[i + 1][0], yb, R[i + 1][1]], [R[i][0], ya, R[i][1]]], [0, 1, 0], [[u / 6, 0], [(u + seg) / 6, 0], [(u + seg) / 6, w / 6], [u / 6, w / 6]]);
      if (elevated) {
        K.quad(0x8f8c86, [[R[i][0], ya - 1.2, R[i][1]], [R[i + 1][0], yb - 1.2, R[i + 1][1]], [L[i + 1][0], yb - 1.2, L[i + 1][1]], [L[i][0], ya - 1.2, L[i][1]]], [0, -1, 0]);
        for (const [A, B, s] of [[L, L, 1], [R, R, -1]]) {
          K.quad({ tex: 'concrete', color: 0xc8c4bc }, [[A[i][0], ya - 1.2, A[i][1]], [B[i + 1][0], yb - 1.2, B[i + 1][1]], [B[i + 1][0], yb + 0.9, B[i + 1][1]], [A[i][0], ya + 0.9, A[i][1]]], [s * -(pts[i + 1][1] - pts[i][1]), 0, s * (pts[i + 1][0] - pts[i][0])]);
        }
        const mx = (pts[i][0] + pts[i + 1][0]) / 2, mz = (pts[i][1] + pts[i + 1][1]) / 2;
        K.phys.addRamp(pts[i][0], pts[i][1], pts[i + 1][0], pts[i + 1][1], w / 2, ya, yb, { tag: 'road' });
        K.phys.addWall(L[i][0], L[i][1], L[i + 1][0], L[i + 1][1], Math.min(ya, yb) - 0.2, Math.max(ya, yb) + 0.9, 0.1, 'rail');
        K.phys.addWall(R[i][0], R[i][1], R[i + 1][0], R[i + 1][1], Math.min(ya, yb) - 0.2, Math.max(ya, yb) + 0.9, 0.1, 'rail');
      }
      u += seg;
    }
  }
  function elevatedExtras(r, hs, w) {
    let acc = 0;
    for (let i = 0; i < r.pts.length - 1; i++) {
      const a = r.pts[i], b = r.pts[i + 1]; const seg = Math.hypot(b[0] - a[0], b[1] - a[1]);
      for (let t = (30 - acc % 30); t < seg; t += 30) {
        const h = hs[i] + (hs[i + 1] - hs[i]) * t / seg; if (h < 3) continue;
        const x = a[0] + (b[0] - a[0]) * t / seg, z = a[1] + (b[1] - a[1]) * t / seg;
        if (buildingAt(x, z)) continue;
        K.cyl({ x, z, y: -1.5, r: Math.min(1.4, w / 8), h: h - 1.2 + 1.5, mat: { tex: 'concrete', color: 0xc8c4bc }, seg: 10 });
      }
      acc += seg;
    }
  }
  function markings(r, y) {
    const lanes = laneCount(r), w = r.width, lw = w / lanes;
    const centre = -w / 2 + Math.floor(lanes / 2) * lw;
    const edges = layout.byRoad.get(r.id);
    if (edges.some(e => e.medianSide)) roadStats.dualCarriagewayWays++;
    for (const e of edges) {
      if (!r.oneway) for (const delta of [-0.15, 0.15]) paintRange(e, 0, e.L, centre + delta, 0.15, PAINT.yellow, y);
      else if (e.medianSide) for (const inset of [0.22, 0.52]) paintRange(e, 0, e.L, e.medianSide * (w / 2 - inset), 0.15, PAINT.yellow, y);
      for (const side of [-1, 1]) {
        if (r.oneway && side === e.medianSide) continue;
        if (r.hw === 'busway') {
          const nearStop = osm.pois.some(p => (p.kind === 'platform' || p.kind === 'stop') && segDist(p.x, p.z, e.a, e.b) < 12);
          for (const inset of nearStop ? [0.22, 0.52] : [0.22]) {
            if (nearStop) paintRange(e, 0, e.L, side * (w / 2 - inset), 0.15, PAINT.blue, y);
            else dashed(e, side * (w / 2 - inset), PAINT.blue, y);
          }
        } else paintRange(e, 0, e.L, side * (w / 2 - 0.18), 0.15, PAINT.white, y);
      }
      for (let k = 1; k < lanes; k++) {
        const off = -w / 2 + k * lw;
        if (!r.oneway && k === Math.floor(lanes / 2)) continue;
        dashed(e, off, PAINT.white, y);
      }
      if (r.hw === 'busway') for (let s = 35 - e.start % 90; s + 3 < e.L; s += 90) {
        if (e.cuts.some(([a, b]) => s + 3 > a && s - 3 < b)) continue;
        K.floorText(['버스', '전용'], { x: e.a[0] + e.dx * s, z: e.a[1] + e.dz * s, y: y + 0.005,
          w: 2, h: 5, rotY: Math.atan2(-e.dx, -e.dz), fg: '#f4f1e6' });
      }
    }
  }
  function laneCount(r) {
    return r.lanes || (r.oneway ? Math.max(1, Math.round(r.width / 3.3)) : Math.max(2, Math.round(r.width / 6.6) * 2));
  }
  function subtractRanges(a, b, cuts) {
    let spans = [[a, b]];
    for (const [lo, hi] of cuts) spans = spans.flatMap(([s, t]) => hi <= s || lo >= t ? [[s, t]] : [[s, Math.min(t, lo)], [Math.max(s, hi), t]].filter(([u, v]) => v - u > 0.02));
    return spans;
  }
  function paintRange(e, a, b, off, width, color, y, extraCuts = []) {
    if (e.claimed || b - a < 0.02) return;
    // Offset lines must also stay outside the circle, including on acute corners.
    const cuts = [...e.cuts, ...extraCuts], x = e.a[0] - e.dz * off, z = e.a[1] + e.dx * off;
    for (const j of e.nearJunctions || (e.nearJunctions = layout.junctions.filter(j => segDist(j.x, j.z, e.a, e.b) < j.radius + e.r.width))) {
      const along = (j.x - x) * e.dx + (j.z - z) * e.dz, across = (j.x - x) * -e.dz + (j.z - z) * e.dx;
      const r = j.radius + width / 2;
      if (Math.abs(across) < r) { const d = Math.sqrt(r * r - across * across); cuts.push([along - d, along + d]); }
    }
    for (const [s, t] of subtractRanges(a, b, cuts)) strip(x + e.dx * s, z + e.dz * s, e.dx, e.dz, 0, 0, t - s, width, color, y);
  }
  function dashed(e, off, color, y) {
    // Continuous 3 m / 5 m phase over every vertex of an OSM way.
    for (let s = -e.start % 8; s < e.L; s += 8) paintRange(e, Math.max(0, s), Math.min(e.L, s + 3), off, 0.15, color, y, e.solid);
    for (const [a, b] of mergeRanges(e.solid)) paintRange(e, Math.max(0, a), Math.min(e.L, b), off, 0.15, color, y);
  }
  function mergeRanges(ranges) {
    const merged = [];
    for (const [a, b] of [...ranges].sort((a, b) => a[0] - b[0])) {
      const last = merged[merged.length - 1];
      if (last && a <= last[1]) last[1] = Math.max(last[1], b); else merged.push([a, b]);
    }
    return merged;
  }
  function strip(x, z, dx, dz, ox, oz, len, wd, col, y) {
    const nx = -dz * wd / 2, nz = dx * wd / 2; const sx = x + ox, sz = z + oz;
    K.quad(col, [[sx + nx, y, sz + nz], [sx + dx * len + nx, y, sz + dz * len + nz], [sx + dx * len - nx, y, sz + dz * len - nz], [sx - nx, y, sz - nz]], [0, 1, 0]);
  }
  function zebra(pts, hs) {
    // A surveyed crossing can have several vertices; its two landings belong
    // to the whole crossing, not to each tiny OSM segment in the carriageway.
    const first = pts[0], last = pts[pts.length - 1], [ux, uz] = norm(last[0] - first[0], last[1] - first[1]);
    roadStats.crosswalks++;
    crossingSites.push({ x: (first[0] + last[0]) / 2, z: (first[1] + last[1]) / 2, dx: -uz, dz: ux,
      width: Math.hypot(last[0] - first[0], last[1] - first[1]), y: hs[0] || 0 });
    walk(pts, (x, z, dx, dz, segL, i) => {
      const nx = -dz, nz = dx;
      for (let s = 0.3; s < segL - 0.2; s += 0.9) {
        const cx = x + dx * s, cz = z + dz * s, y = (hs[i] || 0) + 0.05;
        K.quad(0xf6f6f6, [[cx + nx * 2.2, y, cz + nz * 2.2], [cx + nx * 2.2 + dx * 0.45, y, cz + nz * 2.2 + dz * 0.45], [cx - nx * 2.2 + dx * 0.45, y, cz - nz * 2.2 + dz * 0.45], [cx - nx * 2.2, y, cz - nz * 2.2]], [0, 1, 0]);
      }
    });
  }
  function streetside(r) {
    walk(r.pts, (x, z, dx, dz, segL) => {
      const nx = -dz, nz = dx; const off = r.width / 2 + 2.2;
      for (let s = 4; s < segL; s += 10) for (const sg of [1, -1]) {
        const tx = x + dx * s + nx * off * sg, tz = z + dz * s + nz * off * sg;
        if (buildingAt(tx, tz, 1.5) || onRoad(tx, tz, true, 0.6)) continue;
        K.tree(tx, tz, { kind: r.hw === 'primary' ? 'ginkgo' : 'zelkova', h: 7 + rnd() * 3 });
        if (Math.round(s) % 30 < 10) { // street lamp
          const lx = tx + dx * 5, lz = tz + dz * 5;
          if (!buildingAt(lx, lz, 1)) { K.cyl({ x: lx, z: lz, r: 0.09, h: 9, mat: 0x6d7378, seg: 6, solid: false }); K.box({ x: lx - nx * sg * 1.2, y: 8.8, z: lz - nz * sg * 1.2, w: 0.35, h: 0.18, d: 2.4, rotY: Math.atan2(nx, nz), mat: 0x5a6066, solid: false }); }
        }
      }
    });
  }
  function walk(pts, fn) {
    for (let i = 0; i < pts.length - 1; i++) {
      const a = pts[i], b = pts[i + 1]; const L = Math.hypot(b[0] - a[0], b[1] - a[1]); if (L < 0.1) continue;
      fn(a[0], a[1], (b[0] - a[0]) / L, (b[1] - a[1]) / L, L, i);
    }
  }

  // ---------- junction approaches / signals ----------
  countRoadDetail(() => {
    for (const j of layout.junctions) {
      if (!j.signal) continue;
      const arms = j.arms.filter(a => !a.claimed && SIGNAL_ROADS.has(a.r.hw));
      if (!arms.length) continue;
      roadStats.renderedSignalised++;
      for (const a of arms) {
        if (a.crosswalk !== false) junctionCrossing(j, a);
        if (!a.incoming || a.length < a.stopS + 0.5) continue;
        roadStats.approaches++;
        const p = a.at(a.stopS), band = incomingBand(a);
        strip(p.x, p.z, -p.dz, p.dx, -p.dz * band[0], p.dx * band[0], band[1] - band[0], 0.45, PAINT.white, 0.061);
        approachMarkings(a);
        const n = Math.max(1, Math.round((band[1] - band[0]) / (a.r.width / laneCount(a.r))));
        const destinations = j.arms.filter(b => b !== a && (!b.r.oneway || !b.incoming));
        const hasLeft = destinations.some(b => { const q = b.at(0); return p.dx * q.dz - p.dz * q.dx > 0.45; });
        const hasRight = destinations.some(b => { const q = b.at(0); return p.dx * q.dz - p.dz * q.dx < -0.45; });
        for (const back of [8, 25]) for (let k = 0; k < n; k++) {
          if (a.stopS + back + 3 > a.length) continue;
          const arrowS = a.stopS + back;
          if (a.legs.some(leg => [...leg.edge.traceCuts, ...leg.edge.crossingCuts].some(([lo, hi]) => {
            const dir = Math.sign(leg.to - leg.from), s = leg.start + dir * (lo - leg.from), t = leg.start + dir * (hi - leg.from);
            return Math.max(leg.start, Math.min(s, t)) < arrowS + 2.7 && Math.min(leg.start + leg.length, Math.max(s, t)) > arrowS - 2.7;
          }))) continue;
          const q = a.at(a.stopS + back), off = band[0] + (k + 0.5) * (band[1] - band[0]) / n;
          if (layout.junctions.some(other => other !== j && other.signal && Math.hypot(q.x - other.x, q.z - other.z) < other.radius + 3)) continue;
          const kind = k === n - 1 && n > 1 && hasLeft ? 'left' : k === 0 && hasRight ? (n > 2 ? 'right' : 'straightRight') : 'straight';
          roadArrow(q.x - q.dz * off, q.z + q.dx * off, -q.dx, -q.dz, kind);
        }
        mastSignal(j, a);
      }
      guideLines(j);
    }
    crossingNodes();
    for (const p of crossingSites) crossingSignals(p);
  });
  function approachMarkings(a) {
    // Small driveway junction masks must not erase the last 30 m of an
    // approach. Retain only real zebra strips and other signalised boxes.
    for (const leg of a.legs) {
      const lo = Math.max(a.stopS, leg.start), hi = Math.min(a.stopS + 30, leg.start + leg.length);
      if (hi <= lo || leg.edge.claimed) continue;
      const e = leg.edge, dir = Math.sign(leg.to - leg.from), r = e.r, lanes = laneCount(r), lw = r.width / lanes;
      const from = leg.from + dir * (lo - leg.start), to = leg.from + dir * (hi - leg.start);
      const spans = subtractRanges(Math.min(from, to), Math.max(from, to), [...e.traceCuts, ...e.crossingCuts]);
      const line = (off, color) => {
        for (const [s, t] of spans) strip(e.a[0] + e.dx * s - e.dz * off, e.a[1] + e.dz * s + e.dx * off, e.dx, e.dz, 0, 0, t - s, 0.15, color, 0.062);
      };
      const centre = -r.width / 2 + Math.floor(lanes / 2) * lw;
      if (!r.oneway) for (const d of [-0.15, 0.15]) line(centre + d, PAINT.yellow);
      else if (e.medianSide) for (const inset of [0.22, 0.52]) line(e.medianSide * (r.width / 2 - inset), PAINT.yellow);
      for (let k = 1; k < lanes; k++) {
        const off = -r.width / 2 + k * lw;
        if (!r.oneway && (dir > 0 ? off >= centre : off <= centre)) continue;
        line(off, PAINT.white);
      }
    }
  }
  function incomingBand(a) {
    const lanes = laneCount(a.r), w = a.r.width;
    return [-w / 2 + 0.2, a.r.oneway ? w / 2 - 0.2 : (-w / 2 + Math.floor(lanes / 2) * w / lanes) * a.dir - 0.22];
  }
  function roadArrow(x, z, dx, dz, kind) {
    roadStats.approachArrows++;
    // Arrow polygons, not fonts: readable at grazing roadview angles.
    const nx = -dz, nz = dx, P = (u, v) => [x + nx * u + dx * v, 0.064, z + nz * u + dz * v];
    const quad = ps => K.quad(PAINT.white, ps.map(([u, v]) => P(u, v)), [0, 1, 0]);
    quad([[-0.13, -2.5], [0.13, -2.5], [0.13, 0.6], [-0.13, 0.6]]);
    if (kind.startsWith('straight')) {
      quad([[-0.13, 0.6], [0.13, 0.6], [0.13, 1.45], [-0.13, 1.45]]);
      quad([[-0.65, 1.2], [0, 2.65], [0.65, 1.2], [0, 1.45]]);
    }
    if (kind !== 'straight') {
      const side = kind === 'left' ? -1 : 1;
      quad([[0, 0.35], [side * 0.9, 0.35], [side * 0.9, 0.65], [0, 0.65]]);
      quad([[side * 0.65, -0.02], [side * 1.35, 0.5], [side * 0.65, 1.02], [side * 0.8, 0.5]]);
    }
  }
  function junctionCrossing(j, a) {
    if (!a.crossing && a.length < a.crossS + 2.5) return;
    const p = a.at(a.crossS);
    if (a.crossing) roadStats.reusedCrosswalks++;
    else {
      roadStats.crosswalks++;
      for (let off = -a.r.width / 2 + 0.2; off + 0.48 < a.r.width / 2 - 0.1; off += 0.96)
        strip(p.x - p.dx * 2.5, p.z - p.dz * 2.5, p.dx, p.dz, -p.dz * (off + 0.24), p.dx * (off + 0.24), 5, 0.48, PAINT.white, 0.06);
    }
    const existing = a.crossing && crossingSites.find(q => Math.hypot(q.x - p.x, q.z - p.z) < a.r.width / 2 + 3 && Math.abs(q.dx * p.dx + q.dz * p.dz) > 0.8);
    const site = existing || { x: p.x, z: p.z, dx: p.dx, dz: p.dz, width: a.r.width };
    site.green = !signalGreen(j, a);
    if (!existing) crossingSites.push(site);
    for (const side of [-1, 1]) {
      const tx = p.x - p.dz * side * (a.r.width / 2 + 0.8), tz = p.z + p.dx * side * (a.r.width / 2 + 0.8);
      if ([-2.5, 2.5].every(t => clearFurniture(tx + p.dx * t, tz + p.dz * t, 0.1))) {
        K.box({ x: tx, z: tz, y: 0, w: 1.1, h: 0.15, d: 5.3, rotY: Math.atan2(p.dx, p.dz), mat: 0xb6b4ab, solid: false });
        const P = (u, v) => [tx + p.dx * u - p.dz * v, 0.157, tz + p.dz * u + p.dx * v];
        K.quad('city-tactile', [P(-2.35, -0.275), P(2.35, -0.275), P(2.35, 0.275), P(-2.35, 0.275)], [0, 1, 0], [[0, 0], [11.75, 0], [11.75, 1.375], [0, 1.375]]);
        for (const end of [-3, 3]) {
          const x = tx + p.dx * end, z = tz + p.dz * end;
          if (!clearFurniture(x, z)) continue;
          K.cyl({ x, z, y: 0.15, r: 0.07, h: 0.85, seg: 6, mat: 0x626b70, solid: false });
          K.cyl({ x, z, y: 0.77, r: 0.074, h: 0.12, seg: 6, mat: PAINT.yellow, solid: false });
        }
      }
    }
  }
  function crossingSignals(p) {
    // Mapped crossing ways and node-only zebras need the same two signals as
    // generated junction crossings. Search beyond overlapping road envelopes
    // to reach a real curb, leaving the full crossing landing unobstructed.
    p.pedestrianSites = [];
    const backs = [];
    for (let back = 3.2; back <= 10.2; back += 0.5) backs.push(back, -back);
    for (const side of [-1, 1]) {
      let site;
      landing: for (let inset = 0.9; inset <= 32; inset += 0.5) for (const back of backs) {
        const x = p.x - p.dz * side * (p.width / 2 + inset) + p.dx * back;
        const z = p.z + p.dx * side * (p.width / 2 + inset) + p.dz * back;
        if (!clearFurniture(x, z) || poleSites.some(q => Math.hypot(q.x - x, q.z - z) < 0.6)) continue;
        site = { x, z }; break landing;
      }
      if (!site) { roadStats.missingPedestrianSignals++; continue; }
      pedestrianSignal(site.x, site.z, p.dz * side, -p.dx * side, !!p.green);
      p.pedestrianSites.push(site);
    }
  }
  function signalGreen(j, a) {
    const main = j.arms.find(b => SIGNAL_ROADS.has(b.r.hw)) || a, p = main.at(0), q = a.at(0);
    return Math.abs(p.dx * q.dx + p.dz * q.dz) > 0.72;
  }
  function mastSignal(j, a) {
    const p = a.at(0), nx = -p.dz, nz = p.dx, band = incomingBand(a);
    // Anchor the head over the actual far-side receiving carriageway first.
    // A radial corner estimate alone can leave heads hanging above a verge.
    const far = j.arms.filter(b => b !== a && (!b.r.oneway || !b.incoming) && b.length > 2)
      .map(b => ({ b, dot: b.dx * p.dx + b.dz * p.dz })).filter(v => v.dot < -0.65).sort((a, b) => a.dot - b.dot)[0]?.b;
    const targets = [];
    if (far) for (const s of [j.midblock ? 4 : 1, 3, -1, 5, 8, 11, 14, 17]) for (const offset of far.r.oneway ? [0, 0.25, -0.25] : [0.25, 0.38, 0.12]) {
      const q = far.at(s), off = far.r.width * offset;
      targets.push({ x: q.x - q.dz * off, z: q.z + q.dx * off });
    }
    // A T junction has no opposite arm. Its far-side signal spans the box.
    for (const distance of [j.radius, j.radius - 3, j.radius - 6, 3].filter(v => v > 0)) for (const off of [(band[0] + band[1]) / 2, band[0] + 1, band[1] - 1])
      targets.push({ x: j.x - p.dx * distance + nx * off, z: j.z - p.dz * distance + nz * off });
    let pole;
    search: for (const target of targets) {
      if (!layout.allCarAt(target.x, target.z, -0.6)) continue;
      for (const angle of [0, 0.25, 0.5, 0.75, 1]) for (const side of [-1, 1]) for (const reach of [6, 7.5, 9, 10.5, 12]) {
        // Skewed/T junctions need a diagonal cantilever from the far curb;
        // head facing remains independent of the steel arm's bearing.
        const ux = -nx * side * Math.cos(angle) + p.dx * Math.sin(angle), uz = -nz * side * Math.cos(angle) + p.dz * Math.sin(angle);
        const x = target.x - ux * (reach - 0.65), z = target.z - uz * (reach - 0.65);
        if (!clearFurniture(x, z, 0.7) || poleSites.some(q => Math.hypot(q.x - x, q.z - z) < 0.8)) continue;
        pole = { x, z, ux, uz, reach }; break search;
      }
    }
    if (!pole) return;
    a.signalPole = { x: pole.x, z: pole.z };
    poleSites.push({ x: pole.x, z: pole.z, kind: 'mast' });
    roadStats.signalAssemblies++;
    const { ux, uz } = pole;
    const reach = pole.reach;
    K.cyl({ x: pole.x, z: pole.z, r: 0.14, h: 6.6, seg: 8, mat: 0x929ca3, solid: false });
    K.box({ x: pole.x + ux * reach / 2, z: pole.z + uz * reach / 2, y: 6.3, w: 0.16, h: 0.2, d: reach,
      rotY: Math.atan2(ux, uz), mat: 0x929ca3, solid: false });
    const green = signalGreen(j, a), rotY = Math.atan2(p.dx, p.dz);
    const headAt = reach - 0.65;
    for (const t of a.r.width >= 12 ? [headAt, Math.max(1.1, headAt - 3)] : [headAt]) {
      const x = pole.x + ux * t, z = pole.z + uz * t;
      if (!layout.allCarAt(x, z, -0.6)) continue;
      roadStats.signalHeads++;
      // The lens centre is 5.8 m above the lanes. The projecting backplate
      // separates the silhouette from the sky; each lamp has its own hood.
      const cy = 5.8;
      K.box({ x, z, y: cy + 0.21, w: 0.055, h: 6.3 - cy - 0.21, d: 0.055, rotY, mat: 0x737e85, solid: false });
      K.box({ x: x - p.dx * 0.18, z: z - p.dz * 0.18, y: cy - 0.32,
        w: 1.49, h: 0.64, d: 0.045, rotY, mat: 0x141a1d, solid: false });
      K.box({ x, z, y: cy - 0.21, w: 1.25, h: 0.42, d: 0.3, rotY, mat: 0x242a2d, solid: false });
      for (let k = 0; k < 4; k++) {
        const off = (k - 1.5) * 0.3, hx = x + p.dz * off + p.dx * 0.16, hz = z - p.dx * off + p.dz * 0.16;
        const color = k === 0 ? (green ? 0x421e1b : 0xff4135) : k === 1 ? 0x493b16 : k === 2 ? 0x163c2a : (green ? 0x39e88a : 0x163c2a);
        if (k === 2) K.sign('←', { x: hx, z: hz, y: cy, w: 0.23, h: 0.23, rotY, bg: '#101a17', fg: '#265b3d' });
        else lens(hx, cy, hz, p.dx, p.dz, 0.115, { tex: 'emit', color });
        K.box({ x: hx + p.dx * 0.1, z: hz + p.dz * 0.1, y: cy + 0.135,
          w: 0.275, h: 0.035, d: 0.26, rotY, mat: 0x141a1d, solid: false });
        for (const side of [-1, 1]) K.box({ x: hx + p.dx * 0.1 + p.dz * side * 0.126,
          z: hz + p.dz * 0.1 - p.dx * side * 0.126, y: cy - 0.12,
          w: 0.023, h: 0.255, d: 0.26, rotY, mat: 0x141a1d, solid: false });
      }
    }
    if (a.r.name) K.sign(a.r.name, { x: pole.x + ux * 1.5, z: pole.z + uz * 1.5, y: 5.82, w: 2.6, h: 0.48,
      rotY, bg: '#175f9a', fg: '#fff', box: 0.08 });
  }
  function lens(x, y, z, dx, dz, radius, mat) {
    // Eight-sided lens, two triangles per quad; all heads share the emit bucket.
    for (let k = 0; k < 4; k++) {
      const ps = [k * Math.PI / 2, (k * 2 + 1) * Math.PI / 4, (k + 1) * Math.PI / 2].map(a => [x + dz * Math.cos(a) * radius, y + Math.sin(a) * radius, z - dx * Math.cos(a) * radius]);
      K.quad(mat, [[x, y, z], ...ps], [dx, 0, dz]);
    }
  }
  function pedestrianSignal(x, z, dx, dz, green) {
    roadStats.pedestrianSignals++; poleSites.push({ x, z, kind: 'pedestrian' });
    const rotY = Math.atan2(dx, dz);
    K.cyl({ x, z, r: 0.065, h: 3.1, seg: 6, mat: 0x737e85, solid: false });
    K.box({ x: x - dx * 0.01, z: z - dz * 0.01, y: 2.19, w: 0.44, h: 0.84, d: 0.04, rotY, mat: 0x141a1d, solid: false });
    K.box({ x: x + dx * 0.13, z: z + dz * 0.13, y: 2.25, w: 0.34, h: 0.72, d: 0.24, rotY, mat: 0x202629, solid: false });
    for (const [walking, cy, lit] of [[false, 2.78, !green], [true, 2.44, green]]) {
      const mat = { tex: 'emit', color: lit ? (walking ? 0x42ed96 : 0xff4439) : 0x17322b };
      const P = (u, v) => [x + dx * 0.257 + dz * u * 1.15, cy + v * 1.15, z + dz * 0.257 - dx * u * 1.15];
      lens(x + dx * 0.253, cy, z + dz * 0.253, dx, dz, 0.139, 0x0c1619);
      lens(...P(0, 0.078), dx, dz, 0.037, mat);
      K.box({ x: x + dx * 0.34, z: z + dz * 0.34, y: cy + 0.145,
        w: 0.3, h: 0.025, d: 0.2, rotY, mat: 0x141a1d, solid: false });
      for (const side of [-1, 1]) K.box({ x: x + dx * 0.34 + dz * side * 0.14,
        z: z + dz * 0.34 - dx * side * 0.14, y: cy - 0.135,
        w: 0.02, h: 0.28, d: 0.2, rotY, mat: 0x141a1d, solid: false });
      const limb = (u, v, a, b, width = 0.025) => {
        const L = Math.hypot(a - u, b - v), ox = -(b - v) / L * width / 2, oy = (a - u) / L * width / 2;
        K.quad(mat, [P(u + ox, v + oy), P(a + ox, b + oy), P(a - ox, b - oy), P(u - ox, v - oy)], [dx, 0, dz]);
      };
      limb(0, 0.035, 0, -0.035, 0.045);
      limb(0, 0.02, walking ? -0.075 : -0.045, walking ? -0.015 : -0.045);
      limb(0, 0.02, walking ? 0.075 : 0.045, walking ? 0.045 : -0.045);
      limb(-0.012, -0.03, walking ? -0.06 : -0.025, -0.105);
      limb(0.012, -0.03, walking ? 0.075 : 0.025, -0.105);
    }
  }
  function guideLines(j) {
    // A wide/skewed box may need one left-turn guide and one right/bent-through
    // guide. Never mirror every movement across the box or guide claimed roads.
    const arms = j.arms.filter(a => ['primary', 'secondary'].includes(a.r.hw));
    const directions = [];
    for (const a of arms) if (!directions.some(b => a.dx * b.dx + a.dz * b.dz > 0.88)) directions.push(a);
    if (j.midblock || directions.length < 3 || j.radius < 12) return;
    const candidates = [];
    for (const a of arms.filter(a => !a.claimed && a.incoming && a.length > a.stopS + 3)) {
      const p = a.at(a.stopS - 0.3), band = incomingBand(a), lw = a.r.width / laneCount(a.r);
      if (band[1] - band[0] < lw * 1.6) continue;
      for (const b of arms.filter(b => b !== a && !b.claimed && (!b.r.oneway || !b.incoming) && b.length > b.stopS + 3)) {
        const q = b.at(b.stopS - 0.3), dot = p.dx * q.dx + p.dz * q.dz, cross = p.dx * q.dz - p.dz * q.dx;
        const turn = cross > 0.55 ? 'left' : cross < -0.55 ? 'right' : dot < -0.8 ? 'through' : null;
        if (!turn) continue;
        const outLanes = laneCount(b.r), outWidth = b.r.width / outLanes;
        const outLo = b.r.oneway ? -b.r.width / 2 : (-b.r.width / 2 + Math.floor(outLanes / 2) * outWidth) * b.dir;
        // Use the dividing edge of the innermost left-turn / outermost right
        // lane, rather than connecting two arbitrary points at lane centres.
        const inOff = turn === 'left' ? band[1] + 0.22 - lw : -a.r.width / 2 + lw;
        const outOff = turn === 'left' ? outLo + outWidth : b.r.width / 2 - outWidth;
        const A = [p.x - p.dz * inOff, p.z + p.dx * inOff], D = [q.x - q.dz * outOff, q.z + q.dx * outOff];
        const distance = Math.hypot(D[0] - A[0], D[1] - A[1]);
        const lateral = Math.abs((D[0] - A[0]) * -p.dz + (D[1] - A[1]) * p.dx);
        // A straight, aligned lane is already clear; do not paint a diagonal
        // merely because the junction has four arms.
        if (turn === 'through' && dot < -0.98 && lateral < lw) continue;
        if (turn !== 'through' && j.radius < 16 && Math.abs(dot) < 0.2) continue;
        if (distance < 20) continue;
        let h0 = distance * 0.38, h1 = h0;
        if (turn !== 'through') {
          const den = -cross, vx = D[0] - A[0], vz = D[1] - A[1];
          const t = (vx * q.dz - vz * q.dx) / den;
          const u = (-p.dx * vz + p.dz * vx) / den;
          if (t <= 0 || u <= 0) continue;
          h0 = t * 0.5523; h1 = u * 0.5523;
        }
        const B = [A[0] - p.dx * h0, A[1] - p.dz * h0], C = [D[0] - q.dx * h1, D[1] - q.dz * h1];
        const points = [], sections = [], steps = Math.max(24, Math.ceil(distance / 1.2));
        for (let k = 0; k <= steps; k++) {
          const t = k / steps, u = 1 - t;
          const P = [0, 1].map(i => u ** 3 * A[i] + 3 * u * u * t * B[i] + 3 * u * t * t * C[i] + t ** 3 * D[i]);
          const tangent = [0, 1].map(i => 3 * u * u * (B[i] - A[i]) + 6 * u * t * (C[i] - B[i]) + 3 * t * t * (D[i] - C[i]));
          const [dx, dz] = norm(...tangent);
          points.push(P); sections.push([[P[0] - dz * 0.225, 0.049, P[1] + dx * 0.225], [P[0] + dz * 0.225, 0.049, P[1] - dx * 0.225]]);
        }
        if (sections.some(pair => pair.some(P => !layout.allCarAt(P[0], P[2], 0)))) continue;
        candidates.push({ a, b, turn, points, sections, score: a.r.width + b.r.width + (turn === 'left' ? 100 : 0) + Math.abs(cross) });
      }
    }
    const selected = [], used = new Set();
    const cross = (a, b, c) => (b[0] - a[0]) * (c[1] - a[1]) - (b[1] - a[1]) * (c[0] - a[0]);
    for (const candidate of candidates.sort((a, b) => b.score - a.score)) {
      const color = candidate.turn === 'left' ? PAINT.pink : PAINT.mint;
      if (used.has(color)) continue;
      // Also reject intersecting guidance from different incoming arms.
      if (selected.some(path => path.points.slice(1).some((b, i) => candidate.points.slice(1).some((d, k) => {
        const a = path.points[i], c = candidate.points[k];
        return cross(a, b, c) * cross(a, b, d) < 0 && cross(c, d, a) * cross(c, d, b) < 0;
      })))) continue;
      for (let k = 1; k < candidate.sections.length; k++) {
        const prev = candidate.sections[k - 1], next = candidate.sections[k];
        K.quad(color, [prev[0], next[0], next[1], prev[1]], [0, 1, 0]);
      }
      selected.push(candidate); used.add(color); roadStats.guidePaths++;
    }
    j.guides = selected.map(({ a, b, turn, points }) => ({ from: a.r.id, to: b.r.id, turn, points }));
  }
  function crossingNodes() {
    // OSM often records a crossing node without a footway. Use the road normal,
    // never a diagonal zebra through the junction box.
    for (const nd of osm.nodes.filter(n => n.k === 'crossing')) {
      if (layout.crossings.some(r => r.pts.slice(1).some((b, i) => segDist(nd.x, nd.z, r.pts[i], b) < 7))) continue;
      if (crossingSites.some(p => Math.hypot(nd.x - p.x, nd.z - p.z) < 10)) continue;
      let e, dist = 3;
      for (const candidate of layout.edges) { const d = segDist(nd.x, nd.z, candidate.a, candidate.b); if (d < dist) { e = candidate; dist = d; } }
      if (!e || e.claimed || layout.junctions.some(j => Math.hypot(nd.x - j.x, nd.z - j.z) < j.radius)) continue;
      const s = Math.max(0, Math.min(e.L, (nd.x - e.a[0]) * e.dx + (nd.z - e.a[1]) * e.dz));
      const x = e.a[0] + e.dx * s, z = e.a[1] + e.dz * s;
      zebra([[x + e.dz * e.r.width / 2, z - e.dx * e.r.width / 2], [x - e.dz * e.r.width / 2, z + e.dx * e.r.width / 2]], [0, 0]);
    }
  }

  // ---------- bus stops (existing shelters retained) ----------
  const stopNames = new Map();
  for (const p of osm.pois) if ((p.kind === 'platform' || p.kind === 'stop') && p.ref && /^\d{5}$/.test(p.ref)) stopNames.set(Math.round(p.x / 3) + ',' + Math.round(p.z / 3), p);
  for (const p of stopNames.values()) {
    if (buildingAt(p.x, p.z)) continue;
    const s = onRoad(p.x, p.z, true, 8); let ang = 0; if (s) ang = Math.atan2(s.b[0] - s.a[0], s.b[1] - s.a[1]) + Math.PI / 2;
    const c = Math.cos(ang), sn = Math.sin(ang);
    K.box({ x: p.x, y: 2.6, z: p.z, w: 4.2, h: 0.12, d: 1.8, rotY: ang, mat: 0x404850, solid: false });
    K.box({ x: p.x - sn * 0.8, y: 0, z: p.z - c * 0.8, w: 4.2, h: 2.5, d: 0.06, rotY: ang, mat: 'glass', solid: true });
    for (const lx of [-2, 2]) K.box({ x: p.x + c * lx, y: 0, z: p.z - sn * lx, w: 0.1, h: 2.6, d: 0.1, rotY: ang, mat: 0x404850, solid: false });
    K.box({ x: p.x - sn * 0.55, y: 0.45, z: p.z - c * 0.55, w: 2.6, h: 0.08, d: 0.4, rotY: ang, mat: 0x9a7a55, solid: false });
    K.sign([p.name, p.ref], { x: p.x + c * 2.4, y: 2.2, z: p.z - sn * 2.4, w: 1.1, h: 0.8, rotY: ang, bg: '#1a4d8f', fg: '#fff', twoSided: true });
  }

  // ---------- buildings ----------
  let nb = 0;
  for (const b of osm.buildings) {
    if (claimedBuildings.has(b.id) || b.layer < 0 || b.type === 'no' || b.type === 'roof') continue;
    const facade = facadeFor(b);
    const lv = b.levels || Math.max(1, Math.round(b.height / 3.3));
    const floorH = Math.max(2.6, (b.height - b.minHeight) / lv);
    const tint = b.type === 'apartments' ? [0xf4f2ec, 0xeceae2, 0xf0ece4, 0xe6e6e0][b.id % 4] : [0xffffff, 0xf0ece6, 0xe8e4dc, 0xf6f0e8, 0xe0e4e8][b.id % 5];
    K.prism(b.poly, b.minHeight, b.height, { mat: { tex: facade, color: tint }, top: { tex: 'roofgravel' }, bottom: false, floorH, holes: b.holes });
    // parapet
    if (b.height > 8) for (let i = 0; i < b.poly.length; i++) { const p = b.poly[i], q = b.poly[(i + 1) % b.poly.length]; K.wall(p[0], p[1], q[0], q[1], b.height, b.height + 0.9, { thick: 0.25, mat: 0xd8d6d0, solid: false }); }
    if (b.type === 'apartments' && b.height > 20) apartmentExtras(b, floorH);
    nb++;
  }
  function facadeFor(b) {
    const n = b.name || '';
    if (b.type === 'apartments' || b.type === 'residential') return 'apt';
    if (b.type === 'hotel') return 'hotel';
    if (b.type === 'school' || b.type === 'university' || b.type === 'kindergarten') return 'school';
    if (/상가|쇼핑|빌딩|센터|프라자|아케이드/.test(n) && b.height < 30) return 'oldshop';
    if (b.height >= 30) return 'office';
    return b.id % 3 === 0 ? 'oldshop' : 'shop';
  }
  function apartmentExtras(b, floorH) {
    // rooftop machine room + giant 동 number near the top of the longest wall (both faces)
    let best = 0, bi = 0; for (let i = 0; i < b.poly.length; i++) { const p = b.poly[i], q = b.poly[(i + 1) % b.poly.length]; const L = Math.hypot(q[0] - p[0], q[1] - p[1]); if (L > best) { best = L; bi = i; } }
    const ns = K.orient(b.poly);
    const cx = b.poly.reduce((s, p) => s + p[0], 0) / b.poly.length, cz = b.poly.reduce((s, p) => s + p[1], 0) / b.poly.length;
    K.box({ x: cx, y: b.height, z: cz, w: 6, h: 4, d: 5, rotY: Math.atan2(ns[bi][0], ns[bi][1]), mat: 0xe4e2dc, solid: false });
    const label = (b.name || '').match(/\d+\s*동?|[A-Z]동?/);
    if (label && best > 15) {
      const txt = /동$/.test(label[0]) ? label[0] : label[0] + '동';
      for (let i = 0; i < b.poly.length; i++) {
        const p = b.poly[i], q = b.poly[(i + 1) % b.poly.length]; const L = Math.hypot(q[0] - p[0], q[1] - p[1]);
        if (L < best * 0.7 && L < 14) continue;
        const mx = (p[0] + q[0]) / 2, mz = (p[1] + q[1]) / 2;
        K.sign(txt, { x: mx, y: b.height - floorH * 1.3, z: mz, w: Math.min(9, L * 0.4), h: 3.2, rotY: Math.atan2(ns[i][0], ns[i][1]), bg: null, fg: '#3e4a5c', offset: 0.08 });
      }
    }
  }
  // ---------- POI storefront signs on unclaimed buildings ----------
  const signColors = { restaurant: ['#b8322a', '#fff'], cafe: ['#2d5a3d', '#fff'], hairdresser: ['#222', '#f2d7b0'], beauty: ['#f2d0d8', '#6a2a3a'], bank: ['#1f4e9c', '#fff'], convenience: ['#ffffff', '#1f6f3f'], supermarket: ['#e04030', '#fff'], fast_food: ['#e8a020', '#222'], doctors: ['#ffffff', '#1a6a9a'], dentist: ['#ffffff', '#1a6a9a'], prep_school: ['#ffd84a', '#222'], bar: ['#3a2a4a', '#ffd'] };
  const byBuilding = new Map();
  for (const p of osm.pois) {
    if (!signColors[p.kind] && !['pub', 'pastry', 'bakery', 'fitness_centre', 'optician', 'pharmacy', 'florist', 'clothes', 'furniture', 'variety_store', 'electronics', 'health_food', 'theatre', 'cinema', 'sauna', 'post_office'].includes(p.kind)) continue;
    const b = buildingAt(p.x, p.z, 6); if (!b || claimedBuildings.has(b.id)) continue;
    if (!byBuilding.has(b)) byBuilding.set(b, []); byBuilding.get(b).push(p);
  }
  for (const [b, list] of byBuilding) {
    const ns = K.orient(b.poly);
    const lv = b.levels || Math.max(1, Math.round(b.height / 3.3)); const fh = Math.max(3, (b.height - b.minHeight) / lv);
    list.forEach((p, k) => {
      // nearest edge
      let bi = 0, bd = Infinity, bt = 0.5;
      for (let i = 0; i < b.poly.length; i++) { const a = b.poly[i], c = b.poly[(i + 1) % b.poly.length]; const dx = c[0] - a[0], dz = c[1] - a[1], L2 = dx * dx + dz * dz || 1; let t = ((p.x - a[0]) * dx + (p.z - a[1]) * dz) / L2; t = Math.max(0.1, Math.min(0.9, t)); const d = Math.hypot(a[0] + dx * t - p.x, a[1] + dz * t - p.z); if (d < bd) { bd = d; bi = i; bt = t; } }
      const a = b.poly[bi], c = b.poly[(bi + 1) % b.poly.length]; const L = Math.hypot(c[0] - a[0], c[1] - a[1]);
      const floor = Math.min(lv - 1, Math.floor(k / Math.max(1, Math.floor(L / 5))));
      const slot = k % Math.max(1, Math.floor(L / 5));
      const t = Math.max(0.08, Math.min(0.92, (slot + 0.5) * 5 / L));
      const x = a[0] + (c[0] - a[0]) * t, z = a[1] + (c[1] - a[1]) * t;
      const [bg, fg] = signColors[p.kind] || ['#333', '#fff'];
      K.sign(p.name.replace(/\(.*?\)/g, '').trim().slice(0, 18), { x, y: b.minHeight + floor * fh + (floor === 0 ? 3.0 : fh * 0.5), z, w: Math.min(4.6, L * 0.85), h: 0.75, rotY: Math.atan2(ns[bi][0], ns[bi][1]), bg, fg, offset: 0.12 });
    });
  }
  // OSM trees
  for (const [x, z] of osm.trees) K.tree(x, z, { kind: 'zelkova' });
  log(`city: ${nb} buildings, ${roads.length} roads; ${roadStats.junctions} junctions, ${roadStats.signalised} signalised (${roadStats.renderedSignalised} unclaimed), ${roadStats.quads} road-detail quads`);
  return { buildingAt, onRoad, roads, roadStats, junctions: layout.junctions, poleSites, crossingSites };
}

function norm(x, z) { const l = Math.hypot(x, z) || 1; return [x / l, z / l]; }
function segDist(x, z, a, b) {
  const dx = b[0] - a[0], dz = b[1] - a[1], L2 = dx * dx + dz * dz || 1e-9;
  let t = ((x - a[0]) * dx + (z - a[1]) * dz) / L2; t = t < 0 ? 0 : t > 1 ? 1 : t;
  return Math.hypot(a[0] + dx * t - x, a[1] + dz * t - z);
}

// moving traffic on major ground roads (instanced)
export function createTraffic(K, roadsInfo, n = 160) {
  const { THREE } = K, rnd = K.rand(7);
  n = Math.max(0, Math.floor(n));
  if (!n) return null;
  const major = r => MAJOR.has(r.hw) && !r.tunnel && !r.bridge && !(r.layer > 0);
  const lanes = r => r.lanes || (r.oneway ? Math.max(1, Math.round(r.width / 3.3)) : Math.max(2, Math.round(r.width / 6.6) * 2));
  const cars = [], routes = [];
  const counts = { cars: 0, taxis: 0, cityBuses: 0, villageBuses: 0, junctions: 0, junctionVehicles: 0 };
  function path(pts) {
    const cum = [0];
    for (let i = 1; i < pts.length; i++) cum.push(cum[i - 1] + Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]));
    return { pts, cum, L: cum[cum.length - 1] };
  }
  function lanePoint(a, s, outbound, lane) {
    const p = a.at(s), r = p.r || a.r, count = lanes(r), laneW = r.width / count;
    const available = r.oneway ? count : Math.floor(count / 2);
    const off = (outbound ? 1 : -1) * (r.width / 2 - (Math.min(lane, available - 1) + 0.5) * laneW);
    return [p.x - p.dz * off, p.z + p.dx * off];
  }
  function junctionRoute(a, b, lane) {
    const pts = [], approach = Math.min(80, a.length), departure = Math.min(80, b.length);
    for (let s = approach; s > 0; s -= 2) pts.push(lanePoint(a, s, false, lane));
    const A = lanePoint(a, 0, false, lane), D = lanePoint(b, 0, true, lane), p = a.at(0), q = b.at(0);
    pts.push(A);
    const entry = path(pts).L, handle = Math.hypot(D[0] - A[0], D[1] - A[1]) / 3;
    const B = [A[0] - p.dx * handle, A[1] - p.dz * handle], C = [D[0] - q.dx * handle, D[1] - q.dz * handle];
    for (let k = 1; k <= 24; k++) {
      const t = k / 24, u = 1 - t;
      pts.push([0, 1].map(i => u * u * u * A[i] + 3 * u * u * t * B[i] + 3 * u * t * t * C[i] + t * t * t * D[i]));
    }
    const exit = path(pts).L;
    for (let s = 2; s <= departure; s += 2) pts.push(lanePoint(b, s, true, lane));
    return { ...path(pts), entry, exit };
  }
  const palette = [0xf2f2f2, 0x20242a, 0x89919a, 0x263a50, 0x982f32, 0xd9d9d9];
  function add(route, t, speed, kind, junction = false) {
    if (cars.length >= n) return;
    const color = kind === 'bus' ? 0x146dc0 : kind === 'minibus' ? 0x65b82e : kind === 'taxi' ? (counts.taxis % 2 ? 0xf6f4e9 : 0xed862c) : palette[cars.length % palette.length];
    cars.push({ route, t, speed, kind, color, index: 0 });
    counts[kind === 'bus' ? 'cityBuses' : kind === 'minibus' ? 'villageBuses' : kind === 'taxi' ? 'taxis' : 'cars']++;
    if (junction) counts.junctionVehicles++;
  }
  // Module-owned asphalt still carries city traffic. Trace the actual approach
  // legs across OSM way splits, then join the corresponding receiving lane.
  const junctions = (roadsInfo.junctions || []).filter(j => j.signal && !j.midblock && j.arms.filter(a => major(a.r)).length >= 3)
    .sort((a, b) => Math.hypot(a.x, a.z) - Math.hypot(b.x, b.z));
  for (const j of junctions) {
    const arms = j.arms.filter(a => major(a.r) && a.length >= 25), main = j.arms.find(a => SIGNAL_ROADS.has(a.r.hw));
    if (!main) continue;
    let seeded = 0;
    for (const a of arms.filter(a => a.incoming)) {
      const b = arms.filter(b => b !== a && (!b.r.oneway || !b.incoming))
        .map(b => ({ b, dot: a.dx * b.dx + a.dz * b.dz })).filter(v => v.dot < -0.75)
        .sort((u, v) => u.dot - v.dot)[0]?.b;
      if (!b || cars.length >= Math.floor(n * 0.7)) continue;
      const green = Math.abs(main.dx * a.dx + main.dz * a.dz) > 0.72;
      const route = junctionRoute(a, b, 0); routes.push(route);
      const kind = seeded === 0 ? 'bus' : seeded === 1 ? 'taxi' : seeded === 2 ? 'minibus' : 'car';
      const halfLength = kind === 'bus' ? 5.5 : kind === 'minibus' ? 4.2 : 2.25;
      const atStop = Math.max(0, route.entry - a.stopS - halfLength - 1.5);
      add(route, green ? route.entry + (route.exit - route.entry) * 0.48 : atStop, green ? 7 : 0, kind, true);
      // Opposing green lanes keep flowing; red approaches visibly queue behind
      // the stop line. Two vehicles on a route avoid a vacant junction on wrap.
      add(route, green ? Math.max(1, atStop - 19) : Math.max(1, atStop - halfLength - 7), green ? 7 : 0, 'car', true);
      seeded++;
    }
    if (seeded) counts.junctions++;
  }
  // Background traffic uses unclaimed major ways; the dense junction routes
  // above are independent of which place module owns the road surface.
  const ways = roadsInfo.roads.filter(r => major(r) && r.pts.length >= 2)
    .map(r => ({ r, ...path(r.pts) })).filter(r => r.L > 60);
  const total = ways.reduce((sum, r) => sum + r.L, 0);
  while (cars.length < n && total > 0) {
    let pick = rnd() * total, source = ways[0];
    for (const r of ways) { if (pick < r.L) { source = r; break; } pick -= r.L; }
    const r = source.r, count = lanes(r), lane = Math.floor(rnd() * count), dir = r.oneway || lane >= Math.floor(count / 2) ? 1 : -1;
    const off = -r.width / 2 + (lane + 0.5) * r.width / count;
    const pts = r.pts.map((p, i) => {
      const a = r.pts[Math.max(0, i - 1)], b = r.pts[Math.min(r.pts.length - 1, i + 1)], L = Math.hypot(b[0] - a[0], b[1] - a[1]) || 1;
      return [p[0] - (b[1] - a[1]) / L * off, p[1] + (b[0] - a[0]) / L * off];
    });
    if (dir < 0) pts.reverse();
    const route = path(pts); routes.push(route);
    add(route, rnd() * route.L, 9 + rnd() * 5, cars.length % 9 === 0 ? 'taxi' : 'car');
  }
  if (!cars.length) return null;

  // Two instanced meshes per fleet: a tintable body and fixed-colour windows,
  // wheels, lamps and trim. The Seoul bus envelope is 11 x 2.5 x 3 metres.
  const bodyMat = new THREE.MeshLambertMaterial({ color: 0xffffff });
  const detailMat = new THREE.MeshLambertMaterial({ vertexColors: true });
  const box = (w, h, d, x, y, z, color = 0xffffff) => ({ w, h, d, x, y, z, color });
  function geometry(parts) {
    const positions = [], normals = [], colors = [], color = new THREE.Color();
    for (const part of parts) {
      let g;
      if (part.wheel) { g = new THREE.CylinderGeometry(part.wheel, part.wheel, part.w, 10).toNonIndexed(); g.rotateZ(Math.PI / 2); }
      else g = new THREE.BoxGeometry(part.w, part.h, part.d).toNonIndexed();
      g.translate(part.x, part.y, part.z); color.setHex(part.color);
      positions.push(...g.attributes.position.array); normals.push(...g.attributes.normal.array);
      for (let i = 0; i < g.attributes.position.count; i++) colors.push(color.r, color.g, color.b);
      g.dispose();
    }
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
    g.setAttribute('normal', new THREE.Float32BufferAttribute(normals, 3));
    g.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));
    return g;
  }
  const fleets = [];
  for (const kind of ['car', 'taxi', 'bus', 'minibus']) {
    const list = cars.filter(c => c.kind === kind); if (!list.length) continue;
    const bus = kind === 'bus' || kind === 'minibus', w = kind === 'bus' ? 2.5 : kind === 'minibus' ? 2.35 : 1.8;
    const h = kind === 'bus' ? 3 : kind === 'minibus' ? 2.9 : 1.55, d = kind === 'bus' ? 11 : kind === 'minibus' ? 8.4 : 4.5;
    const shell = bus ? [box(w, h - 0.55, d, 0, (h + 0.35) / 2, 0)] : [box(w, 0.7, d, 0, 0.68, 0), box(1.62, 0.18, 2.3, 0, 1.45, 0.05)];
    const detail = [];
    if (bus) {
      detail.push(box(w - 0.08, 0.16, d - 0.06, 0, h - 0.08, 0, 0xe8edf0));
      // Individual window bays and front/rear glass leave visible body pillars.
      for (let z = -d / 2 + 0.75; z < d / 2 - 0.7; z += 1.45) for (const side of [-1, 1])
        detail.push(box(0.025, 1.02, 1.28, side * (w / 2 + 0.008), h - 0.81, z, 0x223b48));
      for (const end of [-1, 1]) detail.push(box(w - 0.2, 1.2, 0.025, 0, h - 0.92, end * (d / 2 + 0.01), 0x263f4b));
      detail.push(box(w + 0.02, 0.19, d + 0.02, 0, 1.16, 0, 0xe9f0ef));
      detail.push(box(0.035, 1.86, 1.05, -w / 2 - 0.02, 1.5, d / 2 - 1.3, 0x172c35));
      detail.push(box(1.4, 0.23, 0.04, 0, h - 0.36, d / 2 + 0.03, 0xd6e5b1));
    } else {
      detail.push(box(1.59, 0.47, 2.24, 0, 1.2, 0.05, 0x263b47));
      for (const side of [-1, 1]) detail.push(box(0.025, 0.48, 0.13, side * 0.81, 1.23, 0, 0x5b6265));
      if (kind === 'taxi') detail.push(box(0.57, 0.22, 0.3, 0, 1.65, 0.15, 0xe9efdc));
    }
    const radius = bus ? 0.44 : 0.31;
    for (const side of [-1, 1]) for (const end of [-1, 1]) {
      detail.push({ wheel: radius, w: 0.18, x: side * w / 2, y: radius, z: end * d * 0.32, color: 0x181c21 });
      detail.push({ wheel: radius * 0.5, w: 0.19, x: side * (w / 2 + 0.01), y: radius, z: end * d * 0.32, color: 0x9ba5ac });
    }
    for (const side of [-1, 1]) {
      detail.push(box(bus ? 0.34 : 0.32, 0.15, 0.035, side * w * 0.34, 0.72, d / 2 + 0.025, 0xf7efc3));
      detail.push(box(0.24, 0.2, 0.035, side * w * 0.36, 0.75, -d / 2 - 0.025, 0xb92e23));
    }
    const meshes = [new THREE.InstancedMesh(geometry(shell), bodyMat, list.length), new THREE.InstancedMesh(geometry(detail), detailMat, list.length)];
    const color = new THREE.Color();
    list.forEach((c, i) => { c.index = i; c.fleet = meshes; meshes[0].setColorAt(i, color.setHex(c.color)); });
    for (const mesh of meshes) { mesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage); mesh.frustumCulled = false; K.scene.add(mesh); }
    fleets.push(meshes);
  }
  const M = new THREE.Matrix4(), Q = new THREE.Quaternion(), V = new THREE.Vector3(), S = new THREE.Vector3(1, 1, 1), Y = new THREE.Vector3(0, 1, 0);
  function update(dt) {
    for (const c of cars) {
      const r = c.route; c.t = (c.t + c.speed * dt) % r.L;
      let k = 1; while (k < r.cum.length - 1 && r.cum[k] < c.t) k++;
      const a = r.pts[k - 1], b = r.pts[k], length = r.cum[k] - r.cum[k - 1] || 1, t = (c.t - r.cum[k - 1]) / length;
      const x = a[0] + (b[0] - a[0]) * t, z = a[1] + (b[1] - a[1]) * t;
      M.compose(V.set(x, 0.055, z), Q.setFromAxisAngle(Y, Math.atan2(b[0] - a[0], b[1] - a[1])), S);
      c.fleet[0].setMatrixAt(c.index, M); c.fleet[1].setMatrixAt(c.index, M);
    }
    for (const meshes of fleets) for (const mesh of meshes) mesh.instanceMatrix.needsUpdate = true;
  }
  update(0);
  return { update, counts };
}

// Geometry-only road graph. Claimed ways participate in topology/clearance, but
// the caller owns rendering and must only draw unclaimed edges and approaches.
function roadLayout(osm, claimedRoads) {
  const SIGNAL = new Set(['primary', 'secondary', 'tertiary']);
  const surface = r => !r.tunnel && !r.bridge && !(r.layer > 0) && !(r.level && String(r.level).startsWith('-'));
  const crossings = osm.roads.filter(r => surface(r) && r.footway === 'crossing');
  const edges = [], byRoad = new Map(), vertices = [], vertexGrid = new Map(), edgeGrid = new Map();
  const cell = 32, key = (x, z) => x + ',' + z;
  function vertex(p, layer) {
    const ix = Math.floor(p[0] * 2), iz = Math.floor(p[1] * 2);
    for (let x = ix - 1; x <= ix + 1; x++) for (let z = iz - 1; z <= iz + 1; z++) {
      for (const v of vertexGrid.get(key(x, z)) || []) if (v.layer === layer && Math.hypot(v.x - p[0], v.z - p[1]) <= 0.5) return v;
    }
    const v = { x: p[0], z: p[1], layer, roads: new Set(), out: [] };
    vertices.push(v); const k = key(ix, iz);
    if (!vertexGrid.has(k)) vertexGrid.set(k, []); vertexGrid.get(k).push(v);
    return v;
  }
  for (const r of osm.roads) {
    if (!CAR.has(r.hw) || !surface(r)) continue;
    const list = []; let start = 0;
    for (let i = 0; i < r.pts.length - 1; i++) {
      const a = r.pts[i], b = r.pts[i + 1], L = Math.hypot(b[0] - a[0], b[1] - a[1]);
      if (L < 0.01) { start += L; continue; }
      const av = vertex(a, r.layer || 0), bv = vertex(b, r.layer || 0);
      const e = { r, i, a, b, L, dx: (b[0] - a[0]) / L, dz: (b[1] - a[1]) / L, start,
        claimed: claimedRoads.has(r.id), cuts: [], traceCuts: [], crossingCuts: [], solid: [], medianSide: 0, av, bv };
      edges.push(e); list.push(e); start += L;
      av.roads.add(r); bv.roads.add(r); av.out.push({ edge: e, dir: 1 }); bv.out.push({ edge: e, dir: -1 });
      const pad = r.width / 2 + 1;
      for (let x = Math.floor((Math.min(a[0], b[0]) - pad) / cell); x <= Math.floor((Math.max(a[0], b[0]) + pad) / cell); x++) {
        for (let z = Math.floor((Math.min(a[1], b[1]) - pad) / cell); z <= Math.floor((Math.max(a[1], b[1]) + pad) / cell); z++) {
          const k = key(x, z); if (!edgeGrid.has(k)) edgeGrid.set(k, []); edgeGrid.get(k).push(e);
        }
      }
    }
    byRoad.set(r.id, list);
  }
  function nearby(x, z, radius = 0) {
    const found = new Set();
    for (let i = Math.floor((x - radius) / cell); i <= Math.floor((x + radius) / cell); i++) {
      for (let j = Math.floor((z - radius) / cell); j <= Math.floor((z + radius) / cell); j++) {
        for (const e of edgeGrid.get(key(i, j)) || []) found.add(e);
      }
    }
    return found;
  }
  function project(e, x, z) { return Math.max(0, Math.min(e.L, (x - e.a[0]) * e.dx + (z - e.a[1]) * e.dz)); }
  function allCarAt(x, z, pad = 0.5) {
    for (const e of nearby(x, z, Math.max(0, pad))) if (segDist(x, z, e.a, e.b) < e.r.width / 2 + pad) return e;
    return null;
  }
  function merged(ranges) {
    const result = [];
    for (const v of ranges.sort((a, b) => a[0] - b[0])) {
      if (v[1] - v[0] < 0.001) continue;
      const last = result[result.length - 1];
      if (last && v[0] <= last[1] + 0.02) last[1] = Math.max(last[1], v[1]); else result.push(v.slice());
    }
    return result;
  }
  // A way split is not a physical junction. Count distinct outward bearings,
  // including interior vertices, instead of simply counting OSM way IDs.
  const seeds = [];
  for (const v of vertices) {
    if (v.roads.size < 2) continue;
    const dirs = [];
    for (const o of v.out) {
      const d = [o.edge.dx * o.dir, o.edge.dz * o.dir];
      if (!dirs.some(q => q[0] * d[0] + q[1] * d[1] > 0.985)) dirs.push(d);
    }
    if (dirs.length < 3) continue;
    seeds.push({ x: v.x, z: v.z, layer: v.layer, width: Math.max(...[...v.roads].map(r => r.width)), roads: v.roads });
  }
  // Opposite carriageways have separate OSM intersections. Join short,
  // connected clusters, with a diameter cap to avoid swallowing whole blocks.
  const groups = [];
  for (const s of seeds.sort((a, b) => b.width - a.width)) {
    const g = groups.find(g => g.layer === s.layer && g.seeds.every(q => Math.hypot(s.x - q.x, s.z - q.z) <= 25)
      && g.seeds.some(q => Math.hypot(s.x - q.x, s.z - q.z) <= Math.min(25, (s.width + q.width) / 2 + 3)
        && [...s.roads].some(r => q.roads.has(r))));
    if (g) g.seeds.push(s); else groups.push({ layer: s.layer, seeds: [s] });
  }
  const junctions = groups.map(g => {
    const x = g.seeds.reduce((sum, s) => sum + s.x, 0) / g.seeds.length;
    const z = g.seeds.reduce((sum, s) => sum + s.z, 0) / g.seeds.length;
    return { x, z, layer: g.layer, radius: Math.max(...g.seeds.map(s => Math.hypot(s.x - x, s.z - z) + s.width / 2 + 2.5)),
      signal: false, midblock: false, arms: [], eligible: g.seeds.some(s => [...s.roads].some(r => SIGNAL.has(r.hw))) };
  });
  const cross2 = (ax, az, bx, bz) => ax * bz - az * bx;
  function crossingNear(x, z, dx, dz, wanted = 3.5, reach = 10) {
    let best = null, score = Infinity;
    for (const r of crossings) for (let i = 1; i < r.pts.length; i++) {
      const a = r.pts[i - 1], b = r.pts[i], cx = b[0] - a[0], cz = b[1] - a[1], L = Math.hypot(cx, cz);
      if (L < 0.1 || Math.abs((cx * dx + cz * dz) / L) > 0.55) continue;
      const den = cross2(dx, dz, cx, cz), px = a[0] - x, pz = a[1] - z;
      const s = cross2(px, pz, cx, cz) / den, u = cross2(px, pz, dx, dz) / den;
      if (u < -0.12 || u > 1.12 || Math.abs(s - wanted) > reach) continue;
      const d = Math.abs(s - wanted); if (d < score) { score = d; best = { r, s, x: x + dx * s, z: z + dz * s }; }
    }
    return best;
  }
  const signalNodes = osm.nodes.filter(nd => nd.k === 'traffic_signals' || (nd.k === 'crossing' && nd.crossing === 'traffic_signals'))
    .sort((a, b) => Number(b.k === 'traffic_signals') - Number(a.k === 'traffic_signals'));
  for (const nd of signalNodes) {
    // Crossing nodes at the outer edge of a wide box describe the same signal
    // installation as the carriageway nodes already associated with that box.
    if (nd.k === 'crossing' && junctions.some(j => j.signal && !j.midblock
      && Math.hypot(nd.x - j.x, nd.z - j.z) <= j.radius + 14)) continue;
    let nearest = null, distance = 25;
    for (const j of junctions) if (j.eligible && !j.midblock) {
      const d = Math.hypot(nd.x - j.x, nd.z - j.z); if (d < distance) { distance = d; nearest = j; }
    }
    if (nearest) { nearest.signal = true; continue; }
    let road = null, at = 0; distance = 25;
    for (const e of nearby(nd.x, nd.z, 25)) {
      if (!SIGNAL.has(e.r.hw)) continue;
      const t = project(e, nd.x, nd.z), d = Math.hypot(e.a[0] + e.dx * t - nd.x, e.a[1] + e.dz * t - nd.z);
      if (d < distance) { distance = d; road = e; at = t; }
    }
    if (!road || distance > road.r.width / 2 + 3) continue;
    let x = road.a[0] + road.dx * at, z = road.a[1] + road.dz * at;
    const cross = crossingNear(x, z, road.dx, road.dz, 0, 12);
    if (cross) { x = cross.x; z = cross.z; }
    const mouthOwner = cross && junctions.filter(j => !j.midblock && j.eligible
      && Math.hypot(x - j.x, z - j.z) <= j.radius + 14
      && (byRoad.get(road.r.id) || []).some(e => segDist(j.x, j.z, e.a, e.b) < j.radius + 0.5))
      .sort((a, b) => Math.hypot(x - a.x, z - a.z) - a.radius - (Math.hypot(x - b.x, z - b.z) - b.radius))[0];
    if (mouthOwner) { mouthOwner.signal = true; continue; }
    if (junctions.some(j => j.midblock && Math.hypot(j.x - x, j.z - z) < 20
      && Math.abs((j.x - x) * -road.dz + (j.z - z) * road.dx) < 1)) continue;
    junctions.push({ x, z, layer: road.r.layer || 0, radius: 0, signal: true, midblock: true, eligible: true, crossing: cross?.r, arms: [] });
  }
  // Circle intersections clip every road through a junction, including short
  // connector ways. Boundary crossings, not individual OSM nodes, define arms.
  for (const j of junctions) {
    const mouths = [];
    for (const e of nearby(j.x, j.z, j.radius + 1)) {
      if ((e.r.layer || 0) !== j.layer) continue;
      const along = (j.x - e.a[0]) * e.dx + (j.z - e.a[1]) * e.dz;
      const side = (j.x - e.a[0]) * -e.dz + (j.z - e.a[1]) * e.dx;
      if (j.midblock) {
        if (Math.abs(side) > 0.5 || along < -0.02 || along > e.L + 0.02) continue;
        const t = Math.max(0, Math.min(e.L, along));
        if (t > 0.02) mouths.push({ edge: e, from: t, dir: -1 });
        if (t < e.L - 0.02) mouths.push({ edge: e, from: t, dir: 1 });
        continue;
      }
      if (Math.abs(side) >= j.radius) continue;
      const half = Math.sqrt(j.radius * j.radius - side * side), lo = along - half, hi = along + half;
      if (hi < 0 || lo > e.L) continue;
      const interval = [Math.max(0, lo), Math.min(e.L, hi)];
      e.cuts.push(interval); if (j.signal) e.traceCuts.push(interval.slice());
      if (lo > 0.02 && lo <= e.L + 0.02) mouths.push({ edge: e, from: Math.min(e.L, lo), dir: -1 });
      if (hi >= -0.02 && hi < e.L - 0.02) mouths.push({ edge: e, from: Math.max(0, hi), dir: 1 });
    }
    mouths.sort((a, b) => Number(b.edge.claimed) - Number(a.edge.claimed) || b.edge.r.width - a.edge.r.width);
    for (const m of mouths) {
      const e = m.edge, x = e.a[0] + e.dx * m.from, z = e.a[1] + e.dz * m.from;
      if (j.arms.some(a => Math.hypot(a.x - x, a.z - z) < 1 && a.dx * e.dx * m.dir + a.dz * e.dz * m.dir > 0.985)) continue;
      j.arms.push({ r: e.r, claimed: e.claimed, dir: m.dir, incoming: !e.r.oneway || m.dir < 0,
        x, z, dx: e.dx * m.dir, dz: e.dz * m.dir, first: m, legs: [], length: 0,
        crossS: j.midblock ? 0 : 3.5, stopS: j.midblock ? 5 : 8.5, crosswalk: true });
    }
  }
  for (const e of edges) { e.cuts = merged(e.cuts); e.traceCuts = merged(e.traceCuts); }
  function trace(arm) {
    let { edge: e, from, dir } = arm.first; const seen = new Set();
    while (e && arm.length < 85 && !seen.has(e)) {
      seen.add(e); let to = dir > 0 ? e.L : 0;
      // Minor access junctions still clip paint, but do not truncate the whole
      // approach route. The renderer can reject arrows in their clipped areas.
      for (const cut of e.traceCuts) {
        if (dir > 0 && cut[1] > from + 0.05 && cut[0] < to) to = Math.max(from, cut[0]);
        if (dir < 0 && cut[0] < from - 0.05 && cut[1] > to) to = Math.min(from, cut[1]);
      }
      const available = Math.abs(to - from), length = Math.min(available, 85 - arm.length);
      if (length > 0.01) {
        arm.legs.push({ edge: e, from, to: from + dir * length, start: arm.length, length }); arm.length += length;
      }
      if (length < available - 0.01 || (dir > 0 ? to < e.L - 0.02 : to > 0.02)) break;
      const v = dir > 0 ? e.bv : e.av, old = e, dx = e.dx * dir, dz = e.dz * dir;
      let next = null, score = -Infinity;
      for (const o of v.out) {
        const q = o.edge; if (seen.has(q) || q.claimed !== arm.claimed || q.r.oneway !== arm.r.oneway) continue;
        if (q.r.oneway && (o.dir < 0) !== arm.incoming) continue;
        const dot = dx * q.dx * o.dir + dz * q.dz * o.dir;
        if (dot < 0.65 || Math.abs(q.r.width - old.r.width) > 4) continue;
        const sameWay = q.r.id === old.r.id, sameName = q.r.name && q.r.name === old.r.name;
        if (!sameWay && !sameName && q.r.hw !== old.r.hw) continue;
        const value = dot + (sameWay ? 3 : sameName ? 1 : 0);
        if (value > score) { score = value; next = o; }
      }
      if (!next) break;
      e = next.edge; dir = next.dir; from = dir > 0 ? 0 : e.L;
    }
    arm.at = s => {
      const leg = arm.legs.find(l => s <= l.start + l.length + 0.001) || arm.legs[arm.legs.length - 1];
      if (!leg) return { x: arm.x, z: arm.z, dx: arm.dx, dz: arm.dz, r: arm.r };
      const dir = Math.sign(leg.to - leg.from), t = leg.from + dir * (Math.min(arm.length, s) - leg.start), e = leg.edge;
      return { x: e.a[0] + e.dx * t, z: e.a[1] + e.dz * t, dx: e.dx * dir, dz: e.dz * dir, r: e.r };
    };
    delete arm.first;
  }
  for (const j of junctions) for (const a of j.arms) trace(a);
  function onLegs(arm, from, to, field) {
    for (const leg of arm.legs) {
      const lo = Math.max(from, leg.start), hi = Math.min(to, leg.start + leg.length); if (hi <= lo) continue;
      const dir = Math.sign(leg.to - leg.from), x = leg.from + dir * (lo - leg.start), y = leg.from + dir * (hi - leg.start);
      leg.edge[field].push([Math.min(x, y), Math.max(x, y)]);
    }
  }
  for (const j of junctions) {
    if (!j.signal) continue;
    let crossingOwner = false;
    for (const a of j.arms) {
      if (!SIGNAL.has(a.r.hw)) continue;
      const cross = j.midblock ? null : crossingNear(a.x, a.z, a.dx, a.dz);
      if (j.crossing) a.crossing = j.crossing;
      else if (cross && cross.s >= -1) { a.crossing = cross.r; a.crossS = Math.max(0, cross.s); a.stopS = a.crossS + 5; }
      if (j.midblock && !a.claimed) { a.crosswalk = !crossingOwner; crossingOwner = true; }
      onLegs(a, 0, a.stopS, 'cuts');
      if (a.crosswalk !== false) onLegs(a, Math.max(0, a.crossS - 2.5), a.crossS + 2.5, 'crossingCuts');
      if (a.incoming) onLegs(a, a.stopS, a.stopS + 30, 'solid');
    }
  }
  // A paired carriageway's median lies toward its opposite-direction partner.
  // Exclude embedded busways and same-lane overlaps from the pairing search.
  for (const e of edges) {
    if (!e.r.oneway || e.r.hw === 'busway') continue;
    const x = (e.a[0] + e.b[0]) / 2, z = (e.a[1] + e.b[1]) / 2; let best = 25;
    for (const q of nearby(x, z, 25)) {
      if (q.r.id === e.r.id || !q.r.oneway || q.r.hw === 'busway' || (q.r.layer || 0) !== (e.r.layer || 0)) continue;
      if (e.dx * q.dx + e.dz * q.dz > -0.9 || (e.r.name && q.r.name && e.r.name !== q.r.name)) continue;
      const t = (x - q.a[0]) * q.dx + (z - q.a[1]) * q.dz; if (t < 0 || t > q.L) continue;
      const px = q.a[0] + q.dx * t - x, pz = q.a[1] + q.dz * t - z, d = Math.hypot(px, pz);
      const side = px * -e.dz + pz * e.dx;
      if (d < Math.max(3, (e.r.width + q.r.width) * 0.35) || d >= best || Math.abs(side) < d * 0.9) continue;
      best = d; e.medianSide = Math.sign(side);
    }
  }
  // Keep centre/lane/edge paint clear of mapped zebras even at unsignalised
  // crossings. Do this after tracing so a crossing does not sever an approach.
  for (const r of crossings) for (let i = 1; i < r.pts.length; i++) {
    const a = r.pts[i - 1], b = r.pts[i], dx = b[0] - a[0], dz = b[1] - a[1], L = Math.hypot(dx, dz);
    if (L < 0.1) continue;
    for (const e of nearby((a[0] + b[0]) / 2, (a[1] + b[1]) / 2, L / 2 + 3)) {
      if (Math.abs((dx * e.dx + dz * e.dz) / L) > 0.55) continue;
      const den = cross2(e.dx, e.dz, dx, dz), px = a[0] - e.a[0], pz = a[1] - e.a[1];
      const s = cross2(px, pz, dx, dz) / den, u = cross2(px, pz, e.dx, e.dz) / den;
      if (u < 0 || u > 1 || s < -2.5 || s > e.L + 2.5) continue;
      e.cuts.push([Math.max(0, s - 2.5), Math.min(e.L, s + 2.5)]);
      e.crossingCuts.push([Math.max(0, s - 2.5), Math.min(e.L, s + 2.5)]);
    }
  }
  for (const nd of osm.nodes) {
    if (nd.k !== 'crossing') continue;
    const candidates = [...nearby(nd.x, nd.z, 3)]; let nearest = null, distance = 3;
    for (const e of candidates) {
      const d = segDist(nd.x, nd.z, e.a, e.b); if (d <= distance) { distance = d; nearest = e; }
    }
    if (!nearest) continue;
    for (const e of candidates) {
      if (Math.abs(e.dx * nearest.dx + e.dz * nearest.dz) < 0.9 || segDist(nd.x, nd.z, e.a, e.b) > distance + 0.1) continue;
      const s = (nd.x - e.a[0]) * e.dx + (nd.z - e.a[1]) * e.dz;
      if (s >= -2.5 && s <= e.L + 2.5) {
        const cut = [Math.max(0, s - 2.5), Math.min(e.L, s + 2.5)];
        e.cuts.push(cut); e.crossingCuts.push(cut);
      }
    }
  }
  for (const e of edges) { e.cuts = merged(e.cuts); e.solid = merged(e.solid); }
  return { edges, byRoad, junctions, crossings, allCarAt };
}
