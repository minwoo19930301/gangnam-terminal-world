// Underground, exits, junctions, roads, landmarks and entrances analyses for tools/map_audit.mjs.
import { Grid, polyArea, bboxOf, centroidOf, distToRing, distToPolyline, segDist, bearingDeg, compass, pip } from './map_audit_lib.mjs';
import { builtMask, osmGrid } from './map_audit_fp.mjs';
const r1 = v => Math.round(v * 10) / 10, r2 = v => Math.round(v * 100) / 100;
const distPoly = (x, z, poly) => pip(x, z, poly) ? 0 : distToRing(x, z, poly);

// ---------------- stair heads and ground holes ----------------
export function stairHeads(built) {
  const heads = [];
  for (const [mod, r] of Object.entries(built.places)) for (const p of r.ramps) {
    const lo = Math.min(p.ya, p.yb), hi = Math.max(p.ya, p.yb), L = Math.hypot(p.b[0] - p.a[0], p.b[1] - p.a[1]);
    if (lo > -2.5 || hi < -0.6 || p.hw * 2 > 9 || L > 48) continue;   // stair / escalator shaped: drops ≥ 2.5 m, ≤ 9 m wide, ≤ 48 m long
    const top = p.ya > p.yb ? p.a : p.b, bot = p.ya > p.yb ? p.b : p.a;
    heads.push({ module: mod, x: top[0], z: top[1], bottom: bot, yBottom: lo, yTop: hi, w: r2(p.hw * 2), len: r1(L), escalator: p.move, at: p.at });
  }
  return heads;
}
export function exitsAudit(osm, built, heads) {
  const holes = Object.entries(built.places).flatMap(([m, r]) => r.holes.map(h => ({ module: m, poly: h.poly, area: polyArea(h.poly), c: centroidOf(h.poly) }))).filter(h => h.area < 500);
  const rows = [];
  for (const e of osm.exits) {
    let bh = null, bd = 1e9; for (const h of heads) { const d = Math.hypot(h.x - e.x, h.z - e.z); if (d < bd) { bd = d; bh = h; } }
    let bo = null, bod = 1e9; for (const h of holes) { const d = distPoly(e.x, e.z, h.poly); if (d < bod) { bod = d; bo = h; } }
    const row = { ref: e.ref, osmId: e.id, x: e.x, z: e.z, nearestHead: bh && bd < 400 ? { module: bh.module, x: r1(bh.x), z: r1(bh.z), distM: r1(bd), dx: r1(bh.x - e.x), dz: r1(bh.z - e.z), dir: compass(bearingDeg(bh.x - e.x, bh.z - e.z)), yBottom: bh.yBottom, w: bh.w } : null,
      nearestHole: bo && bod < 400 ? { module: bo.module, distM: r1(bod), c: [r1(bo.c[0]), r1(bo.c[1])], area: Math.round(bo.area) } : null };
    row.status = !row.nearestHead ? 'outside_modelled_area' : bd <= 6 ? 'ok' : bd <= 15 ? 'offset' : 'missing_or_misplaced';
    rows.push(row);
  }
  return rows;
}

// ---------------- underground ----------------
const lineSamples = (pts, step = 1) => { const out = []; for (let i = 1; i < pts.length; i++) { const a = pts[i - 1], b = pts[i], L = Math.hypot(b[0] - a[0], b[1] - a[1]), n = Math.max(1, Math.ceil(L / step)); for (let s = 0; s < n; s++) { const t = s / n; out.push([a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, Math.atan2(b[1] - a[1], b[0] - a[0])]); } } return out; };
export function undergroundAudit(osm, built) {
  const out = { gotomall: {}, station: [] };
  // gotomall B1 arcade axis vs 신반포로
  const g = built.places.gotomall, band = osm.buildings.find(b => b.id === 1354860678), bb0 = bboxOf(band.poly), bb = [bb0[0] - 40, bb0[1] - 40, bb0[2] + 40, bb0[3] + 40];
  const B = builtMask(g, bb, 'b1'), O = osmGrid(band, bb);
  const road = osm.roads.filter(r => r.name === '신반포로' && !r.tunnel && !r.bridge && !['footway', 'steps', 'cycleway'].includes(r.hw) && r.pts.some(p => p[0] > bb[0] && p[0] < bb[2] && p[1] > bb[1] && p[1] < bb[3]));
  const mainB = B.components(50).sort((a, b) => b.area - a.area)[0], mainO = O.components(50).sort((a, b) => b.area - a.area)[0];
  const ax = Math.cos(mainO.axis), az = Math.sin(mainO.axis), nx = -az, nz = ax; // along / across unit vectors (OSM band axis)
  const slice = (G, comp, s0, s1) => { let n = 0, sum = 0, mn = 1e9, mx = -1e9; const set = new Set(comp.cells); for (const c of comp.cells) { const x = G.cx(c % G.nx), z = G.cz((c - c % G.nx) / G.nx); const s = (x - mainO.cx) * ax + (z - mainO.cz) * az; if (s < s0 || s >= s1) continue; const t = (x - mainO.cx) * nx + (z - mainO.cz) * nz; n++; sum += t; if (t < mn) mn = t; if (t > mx) mx = t; } return n ? { mid: sum / n, width: n * 0.25 / (s1 - s0), span: mx - mn, n } : null; };
  let sMin = 1e9, sMax = -1e9; for (const c of mainO.cells) { const x = O.cx(c % O.nx), z = O.cz((c - c % O.nx) / O.nx); const s = (x - mainO.cx) * ax + (z - mainO.cz) * az; sMin = Math.min(sMin, s); sMax = Math.max(sMax, s); }
  const rows = [];
  for (let s = Math.ceil(sMin / 20) * 20; s < sMax - 10; s += 20) {
    const sb = slice(B, mainB, s, s + 10), so = slice(O, mainO, s, s + 10); if (!sb || !so) continue;
    const wx = mainO.cx + ax * (s + 5), wz = mainO.cz + az * (s + 5);
    const mb = [wx + nx * sb.mid, wz + nz * sb.mid], mo = [wx + nx * so.mid, wz + nz * so.mid];
    const dr = pt => { let best = 1e9; for (const r of road) best = Math.min(best, distToPolyline(pt[0], pt[1], r.pts).d); return best; };
    rows.push({ s: Math.round(s), x: r1(mb[0]), z: r1(mb[1]), builtWidth: r1(sb.width), osmWidth: r1(so.width), builtMidOffsetFromOsmM: r1(sb.mid - so.mid), builtToRoadM: r1(dr(mb)), osmBandToRoadM: r1(dr(mo)) });
  }
  const med = a => { const s = [...a].sort((p, q) => p - q); return s.length ? s[Math.floor(s.length / 2)] : null; };
  out.gotomall = { axisDeg: { built: r1(((mainB.axis * 180 / Math.PI) % 180 + 180) % 180), osm: r1(((mainO.axis * 180 / Math.PI) % 180 + 180) % 180) }, lengthM: { osm: r1(sMax - sMin) }, medianWidthM: { built: med(rows.map(r => r.builtWidth)), osm: med(rows.map(r => r.osmWidth)) }, medianMidOffsetM: med(rows.map(r => Math.abs(r.builtMidOffsetFromOsmM))), medianToRoad: { built: med(rows.map(r => r.builtToRoadM)), osmBand: med(rows.map(r => r.osmBandToRoadM)) }, slices: rows, roadWayIds: road.map(r => r.id) };
  // station: per level (B1..B4) masks vs rail geometry
  const st = built.places.station, sb = [-240, -260, 120, 320], BANDS = { B1: [-7, -5], B2: [-12.6, -10.4], B3: [-17.6, -15.4], B4: [-22.6, -20.4] };
  out.stationMasks = {};
  for (const [lab, [lo, hi]] of Object.entries(BANDS)) {
    const G = new Grid(sb, 0.5); for (const s of st.surfs) if (s.y >= lo && s.y <= hi && polyArea(s.poly) >= 8) G.fillRings([s.poly]);
    if (G.area() < 300) continue; out.stationMasks[lab] = G; const D = G.edt(); const comps = G.components(100).sort((a, b) => b.area - a.area);
    const row = { level: lab, y: [lo, hi], area: Math.round(G.area()), mainAxisDeg: r1(((comps[0].axis * 180 / Math.PI) % 180 + 180) % 180), mainBbox: bboxOf(comps[0].cells.map(c => [G.cx(c % G.nx), G.cz((c - c % G.nx) / G.nx)])).map(r1), lines: {} };
    for (const ln of ['3호선', '7호선', '9호선']) {
      let n = 0, inside = 0; const ds = [], sx = [], sz = [];
      for (const w of osm.rail.filter(r => r.name === ln && r.kind === 'subway')) for (const [x, z, th] of lineSamples(w.pts, 1)) { if (x < sb[0] + 2 || x > sb[2] - 2 || z < sb[1] + 2 || z > sb[3] - 2) continue; const d = D[Math.floor((z - sb[1]) / 0.5) * G.nx + Math.floor((x - sb[0]) / 0.5)]; if (d > 40) continue; n++; if (d === 0) inside++; ds.push(d); sx.push(Math.cos(2 * th)); sz.push(Math.sin(2 * th)); }
      const railAx = n ? 0.5 * Math.atan2(sz.reduce((a, b) => a + b, 0), sx.reduce((a, b) => a + b, 0)) : null;
      let dd = railAx === null ? null : Math.abs(((railAx - comps[0].axis) * 180 / Math.PI) % 180); if (dd !== null && dd > 90) dd = 180 - dd;
      row.lines[ln] = { railSamplesNearMask: n, insideMaskPct: n ? Math.round(inside / n * 100) : null, medianDistToMaskM: n ? r1(med(ds)) : null, railVsMaskAxisDeg: dd === null ? null : r1(dd) };
    }
    out.station.push(row);
  }
  // platform zones (K.zone named '<n>호선 승강장') vs the OSM station stop nodes (ref 339 / 923 / 734 = station codes of lines 3 / 9 / 7)
  out.platforms = {};
  for (const [ln, ref] of [['3호선', '339'], ['7호선', '734'], ['9호선', '923']]) {
    const zs = st.zones.filter(z => z.name.endsWith(ln + ' 승강장'));
    const stops = osm.pois.filter(p => p.kind === 'stop' && p.ref === ref && p.name === '고속터미널');
    if (!zs.length || !stops.length) continue;
    const per = stops.map(sp => ({ id: sp.id, x: sp.x, z: sp.z, distToPlatformZoneM: r1(Math.min(...zs.map(z => distPoly(sp.x, sp.z, z.poly)))) }));
    const bb = bboxOf(zs.flatMap(z => z.poly)), c = [(bb[0] + bb[2]) / 2, (bb[1] + bb[3]) / 2], sc = [stops.reduce((a, b) => a + b.x, 0) / stops.length, stops.reduce((a, b) => a + b.z, 0) / stops.length];
    // rail samples within 100 m of the stop nodes: how much of the real rail lies inside the platform zone, and the axis difference
    const G = new Grid([sc[0] - 140, sc[1] - 140, sc[0] + 140, sc[1] + 140], 0.5); for (const z of zs) G.fillRings([z.poly]);
    let n = 0, ins = 0; const cs = [], sn = []; for (const w of osm.rail.filter(r => r.name === ln && r.kind === 'subway')) for (const [x, z, th] of lineSamples(w.pts, 1)) { if (Math.hypot(x - sc[0], z - sc[1]) > 100) continue; n++; if (G.a[Math.floor((z - G.z0) / 0.5) * G.nx + Math.floor((x - G.x0) / 0.5)]) ins++; cs.push(Math.cos(2 * th)); sn.push(Math.sin(2 * th)); }
    const comp = G.components(100).sort((a, b) => b.area - a.area)[0], railAx = 0.5 * Math.atan2(sn.reduce((a, b) => a + b, 0), cs.reduce((a, b) => a + b, 0)); let ad = comp ? Math.abs(((railAx - comp.axis) * 180 / Math.PI) % 180) : null; if (ad !== null && ad > 90) ad = 180 - ad;
    out.platforms[ln] = { railWithin100mOfStopInsidePlatformZonePct: n ? Math.round(ins / n * 100) : null, platformAxisVsRailDeg: ad === null ? null : r1(ad), zones: zs.map(z => ({ name: z.name, floor: z.floor })), zoneBbox: bb.map(r1), zoneCentre: c.map(r1), stopCentre: sc.map(r1), centreToStopM: r1(Math.hypot(c[0] - sc[0], c[1] - sc[1])), stops: per };
  }
  return out;
}

// ---------------- junctions ----------------
export function junctionsAudit(built, osm) {
  const zonesOf = m => built.places[m]?.zones || [], inZone = (m, x, z, y) => zonesOf(m).some(zn => y >= zn.y0 - 0.5 && y <= zn.y1 + 0.5 && pip(x, z, zn.poly));
  const rows = [];
  for (const j of built.junctions) {
    const w = built.walks[j.id], pa = j.pa || [j.x, j.z], pb = j.pb || [j.x, j.z];
    const dist = Math.hypot(pb[0] - pa[0], pb[1] - pa[1]);
    const row = { id: j.id, a: j.a, b: j.b, y: j.y, owner: j.owner, pa, pb, lengthM: r1(dist), widthM: j.width, floorAtPa: built.probes[j.id][0], floorAtPb: built.probes[j.id][1],
      paInZoneOfA: inZone(j.a, pa[0], pa[1], j.y), pbInZoneOfB: inZone(j.b, pb[0], pb[1], j.y), paInZoneOfB: inZone(j.b, pa[0], pa[1], j.y), pbInZoneOfA: inZone(j.a, pb[0], pb[1], j.y), walk: w };
    const yFix = v => v === null || !Number.isFinite(v) ? null : v;
    row.levelGapA = yFix(row.floorAtPa) === null ? null : r2(Math.abs(row.floorAtPa - j.y)); row.levelGapB = yFix(row.floorAtPb) === null ? null : r2(Math.abs(row.floorAtPb - j.y));
    row.levelStepM = r2(Math.abs((row.floorAtPa ?? 0) - (row.floorAtPb ?? 0)));
    row.issues = [];
    if (row.levelGapA === null || row.levelGapA > 0.3) row.issues.push('no floor at pa'); if (row.levelGapB === null || row.levelGapB > 0.3) row.issues.push('no floor at pb');
    if (row.levelStepM > 0.15) row.issues.push(`level step ${row.levelStepM} m`);
    if (w.blockedAt !== null) row.issues.push(`straight walk blocked at ${w.blockedAt} m`); if (w.floorLostAt !== null) row.issues.push(`floor lost at ${w.floorLostAt} m of ${row.lengthM}`);
    if (j.width > 0 && !(row.paInZoneOfA && row.pbInZoneOfB)) row.issues.push(`endpoint outside its module zone (a:${row.paInZoneOfA} b:${row.pbInZoneOfB})`);
    rows.push(row);
  }
  // wells: does the floor owner leave a hole, and does the well owner build a descent that really reaches the bottom?
  const wells = [];
  for (const wl of built.wells) {
    const [x0, z0, x1, z1] = wl.rect, cx = (x0 + x1) / 2, cz = (z0 + z1) / 2, fo = built.places[wl.floorOwner], wo = built.places[wl.wellOwner];
    const slabAtCenter = fo.surfs.some(s => Math.abs(s.y - wl.top) < 0.3 && pip(cx, cz, s.poly) && !(s.holes || []).some(h => pip(cx, cz, h)));
    const ramps = wo.ramps.filter(r => { const mx = (r.a[0] + r.b[0]) / 2, mz = (r.a[1] + r.b[1]) / 2; return mx >= x0 - 3 && mx <= x1 + 3 && mz >= z0 - 3 && mz <= z1 + 3 && Math.min(r.ya, r.yb) < wl.top - 1; });
    const lowest = ramps.reduce((m, r) => Math.min(m, r.ya, r.yb), 0);
    const line = wl.id === 'W3' ? '3호선' : wl.id === 'W9' ? '9호선' : null; let rd = null;
    if (line) { rd = 1e9; for (const r of osm.rail.filter(r => r.name === line && r.kind === 'subway')) rd = Math.min(rd, distToPolyline(cx, cz, r.pts).d); }
    wells.push({ id: wl.id, rect: wl.rect, top: wl.top, bottom: wl.bottom, floorOwnerHasSlabInWell: slabAtCenter, wellRampCount: ramps.length, lowestRampY: lowest, reachesBottom: lowest <= wl.bottom + 0.6, distToOsmRailM: rd === null ? null : r1(rd) });
  }
  return { junctions: rows, wells };
}

// ---------------- roads and ground ----------------
const CARRIAGE = new Set(['primary', 'secondary', 'tertiary', 'residential', 'unclassified', 'trunk', 'busway', 'primary_link', 'secondary_link', 'trunk_link']);
export function roadsAudit(osm, built, fpMasks) {
  const ways = osm.roads.filter(r => CARRIAGE.has(r.hw) && !r.tunnel && !r.bridge && r.layer <= 0 && !r.covered);
  const polyNear = (x, z, R) => ways.filter(r => r.pts.some(p => Math.abs(p[0] - x) < R + 80 && Math.abs(p[1] - z) < R + 80));
  const out = { stripOffsets: [], asphaltOutsideOsm: [], intrusions: [], note: 'OSM widths for most ways are default guesses (primary 20, service 5, residential 7 m), so width disagreements are weak evidence.' };
  // (a) hand-built asphalt strips vs the closest OSM road way
  const allRoad = osm.roads.filter(r => !['footway', 'steps', 'cycleway', 'path', 'pedestrian'].includes(r.hw) && !r.tunnel && !r.bridge);
  for (const [mod, r] of Object.entries(built.places)) {
    const strips = (r.ground || []).filter(g => g.kind === 'strip' && g.t === 'asphalt'); if (!strips.length) continue;
    const rows = [];
    for (const s of strips) {
      const mx = (s.a[0] + s.b[0]) / 2, mz = (s.a[1] + s.b[1]) / 2, th = Math.atan2(s.b[1] - s.a[1], s.b[0] - s.a[0]), L = Math.hypot(s.b[0] - s.a[0], s.b[1] - s.a[1]); if (L < 2) continue;
      let best = null; for (const w of allRoad) { const q = distToPolyline(mx, mz, w.pts); if (!best || q.d < best.d) best = { d: q.d, w, i: q.i }; }
      if (!best || best.d > 25) { rows.push({ at: s.at, module: mod, mid: [r1(mx), r1(mz)], lenM: r1(L), widthM: s.w, noOsmRoadWithin25m: true }); continue; }
      const a = best.w.pts[best.i], b = best.w.pts[best.i + 1], ro = Math.atan2(b[1] - a[1], b[0] - a[0]); let da = Math.abs(((th - ro) * 180 / Math.PI) % 180); if (da > 90) da = 180 - da;
      rows.push({ at: s.at, module: mod, mid: [r1(mx), r1(mz)], lenM: r1(L), widthM: s.w, osmWay: best.w.id, osmName: best.w.name, osmHw: best.w.hw, osmWidth: best.w.width, lateralOffsetM: r1(best.d), angleDiffDeg: r1(da), widthDiffM: r1(s.w - best.w.width) });
    }
    const flagged = rows.filter(x => x.noOsmRoadWithin25m || x.lateralOffsetM > 1.5 || x.angleDiffDeg > 10);
    out.stripOffsets.push({ module: mod, strips: rows.length, within1p5mAnd10deg: rows.length - flagged.length, flagged: flagged.sort((p, q) => (q.lateralOffsetM || 99) - (p.lateralOffsetM || 99)).slice(0, 25) });
  }
  // (b) asphalt polygons outside any OSM carriageway / parking / service corridor
  const legit = [...ways, ...osm.roads.filter(r => ['service', 'living_street', 'pedestrian'].includes(r.hw) && !r.tunnel)];
  for (const [mod, r] of Object.entries(built.places)) {
    const polys = (r.ground || []).filter(g => g.kind === 'poly' && g.t === 'asphalt' && polyArea(g.poly) >= 20 && g.y >= -0.5 && g.y < 1.5); if (!polys.length) continue;
    const bb0 = bboxOf(polys.flatMap(p => p.poly)), bb = [bb0[0] - 5, bb0[1] - 5, bb0[2] + 5, bb0[3] + 5]; if ((bb[2] - bb[0]) * (bb[3] - bb[1]) > 4e6) continue;
    const A = new Grid(bb, 1); for (const p of polys) A.fillRings([p.poly]);
    const L = new Grid(bb, 1); for (const w of legit) for (let i = 1; i < w.pts.length; i++) { const a = w.pts[i - 1], b = w.pts[i]; if (Math.max(a[0], b[0]) < bb[0] - 30 || Math.min(a[0], b[0]) > bb[2] + 30 || Math.max(a[1], b[1]) < bb[1] - 30 || Math.min(a[1], b[1]) > bb[3] + 30) continue; const hw = Math.max(2.5, (w.width || 5) / 2) + 2; const dx = b[0] - a[0], dz = b[1] - a[1], l = Math.hypot(dx, dz) || 1, nx = -dz / l * hw, nz = dx / l * hw; L.fillRings([[[a[0] + nx, a[1] + nz], [b[0] + nx, b[1] + nz], [b[0] - nx, b[1] - nz], [a[0] - nx, a[1] - nz]]]); }
    const claimedAreas = new Set(Object.values(built.places).flatMap(r => r.meta?.claimAreas || []));
    for (const ar of osm.areas) if ((ar.kind === 'amenity:parking' || ar.kind === 'highway:pedestrian' || ar.kind === 'place:square' || claimedAreas.has(ar.id)) && ar.poly.some(p => p[0] > bb[0] && p[0] < bb[2] && p[1] > bb[1] && p[1] < bb[3])) L.fillRings([ar.poly]);
    const off = A.minus(L).erode(1.5); const comps = off.components(40).sort((a, b) => b.area - a.area).slice(0, 6);
    out.asphaltOutsideOsm.push({ module: mod, asphaltAreaM2: Math.round(A.area()), outsideOsmCorridorM2: Math.round(A.minus(L).area()), biggest: comps.map(c => ({ area: Math.round(c.area), cx: r1(c.cx), cz: r1(c.cz) })) });
  }
  // (c) built mass inside OSM carriageway corridors, beyond what the OSM footprint itself already does
  for (const [mod, fp] of Object.entries(fpMasks)) {
    if (mod === 'streets') continue; const { A, own, bb } = fp, cor = new Grid(bb, 0.5);
    for (const w of polyNear((bb[0] + bb[2]) / 2, (bb[1] + bb[3]) / 2, Math.hypot(bb[2] - bb[0], bb[3] - bb[1]) / 2)) for (let i = 1; i < w.pts.length; i++) { const a = w.pts[i - 1], b = w.pts[i]; if (Math.max(a[0], b[0]) < bb[0] || Math.min(a[0], b[0]) > bb[2] || Math.max(a[1], b[1]) < bb[1] || Math.min(a[1], b[1]) > bb[3]) continue; const hw = (w.width || 7) / 2, dx = b[0] - a[0], dz = b[1] - a[1], l = Math.hypot(dx, dz) || 1, nx = -dz / l * hw, nz = dx / l * hw; cor.fillRings([[[a[0] + nx, a[1] + nz], [b[0] + nx, b[1] + nz], [b[0] - nx, b[1] - nz], [a[0] - nx, a[1] - nz]]]); }
    const inCor = A.and(cor), base = own.and(cor); const extra = inCor.minus(own.dilate(0.5)); const e = extra.erode(0.6); const comps = e.components(15).sort((a, b) => b.area - a.area).slice(0, 5);
    const corEdt = (() => { const inv = cor.clone(); for (let k = 0; k < inv.a.length; k++) inv.a[k] ^= 1; return inv.edt(); })();
    out.intrusions.push({ module: mod, corridorCellsM2InWindow: Math.round(cor.area()), builtInCorridorM2: Math.round(inCor.area()), osmFootprintItselfInCorridorM2: Math.round(base.area()), extraM2: Math.round(extra.area()), blobs: comps.map(c => { let md = 0; for (const k of c.cells) md = Math.max(md, corEdt[k]); return { area: Math.round(c.area), cx: r1(c.cx), cz: r1(c.cz), maxDepthIntoRoadM: r1(md) }; }) });
  }
  return out;
}

// ---------------- landmarks and entrances ----------------
const norm = s => (s || '').replace(/[\s·()\-]/g, '').toLowerCase();
export function landmarksAudit(osm, built, LANDMARKS, META) {
  const rows = [];
  for (const L of LANDMARKS) {
    const rec = built.places[L.place], claims = (rec?.meta?.claims || []).map(id => osm.buildings.filter(b => b.id === id)).flat();
    const row = { name: L.name, place: L.place, x: L.x, z: L.z };
    const nm = norm(L.name), poi = osm.pois.filter(p => p.name && (norm(p.name).includes(nm) || nm.includes(norm(p.name))) && norm(p.name).length >= 3).map(p => ({ id: p.id, name: p.name, kind: p.kind, x: p.x, z: p.z, d: Math.hypot(p.x - L.x, p.z - L.z) })).sort((a, b) => a.d - b.d)[0];
    if (poi) row.osmPoi = { ...poi, d: r1(poi.d) };
    const bn = osm.buildings.filter(b => b.name && (norm(b.name).includes(nm) || nm.includes(norm(b.name))) && norm(b.name).length >= 3).map(b => ({ id: b.id, name: b.name, d: distPoly(L.x, L.z, b.poly), c: centroidOf(b.poly) })).sort((a, b) => a.d - b.d)[0];
    if (bn) row.osmBuildingByName = { id: bn.id, name: bn.name, pinToPolyM: r1(bn.d), pinToCentroidM: r1(Math.hypot(bn.c[0] - L.x, bn.c[1] - L.z)) };
    if (claims.length) { const d = Math.min(...claims.map(b => distPoly(L.x, L.z, b.poly))); row.pinToClaimedFootprintM = r1(d); const cc = claims.map(b => centroidOf(b.poly)).sort((a, b) => Math.hypot(a[0] - L.x, a[1] - L.z) - Math.hypot(b[0] - L.x, b[1] - L.z))[0]; row.pinToNearestClaimCentroidM = r1(Math.hypot(cc[0] - L.x, cc[1] - L.z)); row.nearestClaimCentroid = [r1(cc[0]), r1(cc[1])]; }
    const zs = (rec?.zones || []); if (zs.length) { const d = Math.min(...zs.map(z => distPoly(L.x, L.z, z.poly))); row.pinToModuleZonesM = r1(d); }
    rows.push(row);
  }
  const nearestDoor = (mod, e) => { let b = null, bd = 1e9; for (const d of built.places[mod]?.doors || []) { if (d.wy > 1.5) continue; const dd = Math.hypot(d.x - e.x, d.z - e.z); if (dd < bd) { bd = dd; b = d; } } return b ? { distM: r1(bd), x: b.x, z: b.z, at: b.at } : null; };
  // entrances declared in _meta.json vs the real footprint wall
  const ent = [];
  for (const [mod, m] of Object.entries(META)) {
    const claims = (m.claims || []).map(id => osm.buildings.filter(b => b.id === id)).flat(); if (!claims.length || !(m.entrances || []).length) continue;
    const bad = [], n = { ground: 0, onWall: 0, door: [] };
    for (const e of m.entrances) { if (e.y > 1.5) continue; n.ground++; { const nd = nearestDoor(mod, e); if (nd) n.door.push(nd.distM); } const ds = claims.map(b => ({ d: distToRing(e.x, e.z, b.poly), ins: pip(e.x, e.z, b.poly), id: b.id })).sort((a, b) => a.d - b.d)[0]; if (ds.d <= 3) n.onWall++; else bad.push({ nearestDoor: nearestDoor(mod, e), x: e.x, z: e.z, w: e.w, distToOsmWallM: r1(ds.d), side: ds.ins ? 'inside' : 'outside', osmId: ds.id, other: e.other }); }
    ent.push({ module: mod, metaEntranceToNearestExtractedDoor: { n: n.door.length, maxM: n.door.length ? Math.max(...n.door) : null, over3m: n.door.filter(d => d > 3).length }, groundEntrances: n.ground, within3mOfOsmWall: n.onWall, offWall: bad.sort((a, b) => b.distToOsmWallM - a.distToOsmWallM).slice(0, 12) });
  }
  return { pins: rows, entrances: ent };
}
