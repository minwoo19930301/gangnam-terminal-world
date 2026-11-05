// Generic city layer from OpenStreetMap: everything not claimed by a detailed place module.
import { pointInPoly, polyBBox, polyArea } from './physics.js';

const CAR = new Set(['motorway', 'trunk', 'trunk_link', 'primary', 'primary_link', 'secondary', 'secondary_link', 'tertiary', 'tertiary_link', 'residential', 'unclassified', 'service', 'busway', 'living_street', 'construction']);
const MAJOR = new Set(['trunk', 'primary', 'secondary', 'motorway']);
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
    if (car && !elevated && (MAJOR.has(r.hw) || r.hw === 'tertiary')) markings(r, y0 + 0.006);
    if (r.footway === 'crossing') zebra(r.pts, hs);
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
    const lanes = r.lanes || Math.max(2, Math.round(r.width / 3.3));
    const w = r.width; const lw = w / lanes;
    walk(r.pts, (x, z, dx, dz, segL, t) => {
      const nx = -dz, nz = dx;
      // center double yellow for two-way roads
      if (!r.oneway) {
        for (const off of [-0.12, 0.12]) strip(x, z, dx, dz, nx * off, nz * off, segL, 0.1, 0xf2c200, y);
      }
      for (let k = 1; k < lanes; k++) {
        const off = -w / 2 + k * lw; if (!r.oneway && Math.abs(off) < 0.5) continue;
        for (let s = 0; s < segL - 3; s += 8) strip(x + dx * s, z + dz * s, dx, dz, nx * off, nz * off, 3, 0.12, 0xf4f4f4, y);
      }
    });
  }
  function strip(x, z, dx, dz, ox, oz, len, wd, col, y) {
    const nx = -dz * wd / 2, nz = dx * wd / 2; const sx = x + ox, sz = z + oz;
    K.quad(col, [[sx + nx, y, sz + nz], [sx + dx * len + nx, y, sz + dz * len + nz], [sx + dx * len - nx, y, sz + dz * len - nz], [sx - nx, y, sz - nz]], [0, 1, 0]);
  }
  function zebra(pts, hs) {
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

  // ---------- signals, bus stops ----------
  for (const nd of osm.nodes) {
    if (nd.k === 'traffic_signals') {
      const s = onRoad(nd.x, nd.z, true, 3); let dx = 1, dz = 0; if (s) { const L = Math.hypot(s.b[0] - s.a[0], s.b[1] - s.a[1]) || 1; dx = (s.b[0] - s.a[0]) / L; dz = (s.b[1] - s.a[1]) / L; }
      const w = s ? s.r.width : 10; const px = nd.x + -dz * (w / 2 + 1.2), pz = nd.z + dx * (w / 2 + 1.2);
      if (buildingAt(px, pz)) continue;
      K.cyl({ x: px, z: pz, r: 0.13, h: 6.2, mat: 0xa8adb2, seg: 8, solid: true });
      const ax = px - (-dz) * 3, az = pz - dx * 3;
      K.box({ x: (px + ax) / 2, y: 5.8, z: (pz + az) / 2, w: 0.14, h: 0.14, d: 6, rotY: Math.atan2(-dz, dx) + Math.PI / 2, mat: 0xa8adb2, solid: false });
      K.box({ x: ax, y: 5.2, z: az, w: 1.25, h: 0.42, d: 0.35, rotY: Math.atan2(dx, dz), mat: 0x22262a, solid: false });
      const lx = Math.cos(Math.atan2(dx, dz)), lz = -Math.sin(Math.atan2(dx, dz));
      [0xff3b30, 0xffb000, 0x30d158].forEach((c, k) => K.box({ x: ax + lx * (k - 1) * 0.38 + dx * 0.19, y: 5.27, z: az + lz * (k - 1) * 0.38 + dz * 0.19, w: 0.26, h: 0.26, d: 0.04, rotY: Math.atan2(dx, dz), mat: 'emit', color: k === 2 ? c : (c & 0x3f3f3f), solid: false }));
    }
  }
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
  log(`city: ${nb} buildings, ${roads.length} roads`);
  return { buildingAt, onRoad, roads };
}

function norm(x, z) { const l = Math.hypot(x, z) || 1; return [x / l, z / l]; }
function segDist(x, z, a, b) {
  const dx = b[0] - a[0], dz = b[1] - a[1], L2 = dx * dx + dz * dz || 1e-9;
  let t = ((x - a[0]) * dx + (z - a[1]) * dz) / L2; t = t < 0 ? 0 : t > 1 ? 1 : t;
  return Math.hypot(a[0] + dx * t - x, a[1] + dz * t - z);
}

// moving traffic on major ground roads (instanced)
export function createTraffic(K, roadsInfo, n = 160) {
  const { THREE } = K;
  const ways = roadsInfo.roads.filter(r => MAJOR.has(r.hw) && !r.tunnel && !r.bridge && r.layer <= 0 && r.pts.length >= 2);
  if (!ways.length) return null;
  const segs = ways.map(r => { const cum = [0]; for (let i = 1; i < r.pts.length; i++) cum.push(cum[i - 1] + Math.hypot(r.pts[i][0] - r.pts[i - 1][0], r.pts[i][1] - r.pts[i - 1][1])); return { r, cum, L: cum[cum.length - 1] }; }).filter(s => s.L > 40);
  const total = segs.reduce((a, s) => a + s.L, 0);
  const body = new THREE.BoxGeometry(1.8, 0.75, 4.5); body.translate(0, 0.65, 0);
  const cab = new THREE.BoxGeometry(1.6, 0.55, 2.3); cab.translate(0, 1.3, -0.2);
  const ib = new THREE.InstancedMesh(body, new THREE.MeshLambertMaterial({ color: 0xffffff }), n);
  const ic = new THREE.InstancedMesh(cab, new THREE.MeshLambertMaterial({ color: 0x1e2830 }), n);
  const cars = []; const rnd = K.rand(7); const C = new THREE.Color();
  const cols = [0xf2f2f2, 0x1c1c1c, 0x8a9096, 0x24324a, 0x9b1b1b, 0xd9d9d9, 0xf2a33a, 0x2a5aa8];
  for (let i = 0; i < n; i++) {
    let pick = rnd() * total, s = segs[0]; for (const sg of segs) { if (pick < sg.L) { s = sg; break; } pick -= sg.L; }
    const lanes = Math.max(2, s.r.lanes || Math.round(s.r.width / 3.3)); const lane = Math.floor(rnd() * lanes);
    const dir = s.r.oneway ? 1 : (lane < lanes / 2 ? -1 : 1);
    const off = -s.r.width / 2 + (lane + 0.5) * s.r.width / lanes;
    cars.push({ s, t: rnd() * s.L, v: (9 + rnd() * 6) * dir, off });
    ib.setColorAt(i, C.setHex(cols[i % cols.length]));
  }
  K.scene.add(ib, ic);
  const M = new THREE.Matrix4(), Q = new THREE.Quaternion(), V = new THREE.Vector3(), S = new THREE.Vector3(1, 1, 1), Y = new THREE.Vector3(0, 1, 0);
  function update(dt) {
    cars.forEach((c, i) => {
      c.t += c.v * dt; if (c.t > c.s.L) c.t -= c.s.L; if (c.t < 0) c.t += c.s.L;
      const { r, cum } = c.s; let k = 1; while (k < cum.length - 1 && cum[k] < c.t) k++;
      const a = r.pts[k - 1], b = r.pts[k]; const sl = cum[k] - cum[k - 1] || 1; const u = (c.t - cum[k - 1]) / sl;
      const dx = (b[0] - a[0]) / sl, dz = (b[1] - a[1]) / sl;
      const x = a[0] + (b[0] - a[0]) * u - dz * c.off, z = a[1] + (b[1] - a[1]) * u + dx * c.off;
      const ang = Math.atan2(dx, dz) + (c.v < 0 ? Math.PI : 0);
      M.compose(V.set(x, 0.03, z), Q.setFromAxisAngle(Y, ang), S); ib.setMatrixAt(i, M); ic.setMatrixAt(i, M);
    });
    ib.instanceMatrix.needsUpdate = ic.instanceMatrix.needsUpdate = true;
  }
  update(0);
  return { update };
}
