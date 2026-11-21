// Footprint analysis: built mask per module vs the OSM footprints it claims.
import { Grid, polyArea, bboxOf, centroidOf, distToRing, bearingDeg, compass, angDiffDeg, pip } from './map_audit_lib.mjs';
const RES = 0.5;
const clipBB = (poly, bb) => { const p = bboxOf(poly); return !(p[2] < bb[0] || p[0] > bb[2] || p[3] < bb[1] || p[1] > bb[3]); };
// built mask: 'above' = slabs/roofs at y>=2 plus regions enclosed by tall walls; 'b1' = slabs at B1 (-6)
export function builtMask(rec, bb, mode) {
  const g = new Grid(bb, RES);
  if (mode === 'b1') {
    for (const s of rec.surfs) if (s.y >= -6.7 && s.y <= -5.3 && clipBB(s.poly, bb) && polyArea(s.poly) >= 8) g.fillRings([s.poly]);
    return g;
  }
  for (const s of rec.surfs) if (s.y >= 2 && s.tagged && clipBB(s.poly, bb) && polyArea(s.poly) >= 20) g.fillRings([s.poly]);   // untagged = vehicle / furniture tops
  for (const s of rec.vis || []) if (clipBB(s.poly, bb) && polyArea(s.poly) >= 20) g.fillRings([s.poly]);          // roofs / canopies without collision
  const wallG = new Grid(bb, RES);
  for (const [ax, az, bx, bz, y0, y1] of rec.walls) if (y0 <= 1.5 && y1 >= 4 && (Math.min(ax, bx) < bb[2] && Math.max(ax, bx) > bb[0] && Math.min(az, bz) < bb[3] && Math.max(az, bz) > bb[1])) wallG.line(ax, az, bx, bz);
  const blocked = wallG.dilate(RES * 0.6), { nx, nz } = g, seen = new Uint8Array(nx * nz), st = [];
  for (let i = 0; i < nx; i++) for (const j of [0, nz - 1]) { const k = j * nx + i; if (!blocked.a[k] && !seen[k]) { seen[k] = 1; st.push(k); } }
  for (let j = 0; j < nz; j++) for (const i of [0, nx - 1]) { const k = j * nx + i; if (!blocked.a[k] && !seen[k]) { seen[k] = 1; st.push(k); } }
  while (st.length) { const c = st.pop(), i = c % nx, j = (c - i) / nx; for (const [di, dj] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) { const ii = i + di, jj = j + dj; if (ii < 0 || jj < 0 || ii >= nx || jj >= nz) continue; const n = jj * nx + ii; if (!blocked.a[n] && !seen[n]) { seen[n] = 1; st.push(n); } } }
  for (let k = 0; k < g.a.length; k++) if (!seen[k]) g.a[k] = 1; // enclosed or wall cells
  return g;
}
export const osmGrid = (b, bb) => { const g = new Grid(bb, RES); g.fillRings([b.poly]); return g; }; // outer ring only: courtyards/atria are not footprint differences
const comps = (g, minA, tag) => g.components(minA).map(c => ({ area: Math.round(c.area), cx: +c.cx.toFixed(1), cz: +c.cz.toFixed(1), ...tag })).sort((a, b) => b.area - a.area);
export function analyzeClaims(modId, rec, osm, ownerOf, allRecs = {}) {
  const claims = (rec.meta.claims || []).map(id => osm.buildings.filter(b => b.id === id)).flat();
  if (!claims.length) return null;
  const all = claims.flatMap(b => b.poly);
  const m0 = bboxOf(all), bb = [m0[0] - 30, m0[1] - 30, m0[2] + 30, m0[3] + 30];
  const A = builtMask(rec, bb, 'above'), U = builtMask(rec, bb, 'b1');
  const others = new Grid(bb, RES); // OSM footprints claimed by anything else
  for (const b of osm.buildings) if (ownerOf.get(b.id) && ownerOf.get(b.id) !== modId && clipBB(b.poly, bb)) others.fillRings([b.poly]);
  const own = new Grid(bb, RES); for (const b of claims) own.fillRings([b.poly]);
  // union of everything ANY module builds in this window, and per-module masks, to attribute areas this module leaves empty
  const inWin = r => r.surfs.some(sf => sf.y >= 2 && clipBB(sf.poly, bb)) || (r.vis || []).some(sf => clipBB(sf.poly, bb));
  const near = claims.every(b => b.layer < 0) ? [] : Object.entries(allRecs).filter(([k, r]) => k !== modId && inWin(r)).map(([k, r]) => [k, builtMask(r, bb, 'above')]);
  const Aall = A.clone(); for (const [, m] of near) for (let k = 0; k < Aall.a.length; k++) Aall.a[k] |= m.a[k];
  const out = { module: modId, window: bb.map(v => +v.toFixed(1)), buildings: [], outsideClaims: [], floors: [] };
  for (const b of claims) {
    const under = b.layer < 0, B = under ? U : A;
    const O = osmGrid(b, bb), Od = O.dilate(8), Br = B.and(Od).minus(others).minus(own.minus(O));
    // keep only the connected parts of Br that touch this footprint
    let keep = new Grid(bb, RES); for (const c of Br.components(0)) if (c.cells.some(k => O.a[k])) for (const k of c.cells) keep.a[k] = 1; keep = keep.fillHoles().and(Od); // atria / ring voids are interior, not footprint
    const nO = O.count(), nB = keep.count(), inter = keep.and(O).count(), uni = keep.or(O).count();
    const row = { module: modId, osmId: b.id, name: b.name, layer: b.layer, levels: b.levels, stratum: under ? 'B1' : 'above', osmArea: Math.round(nO * RES * RES), builtArea: Math.round(nB * RES * RES) };
    row.iou = uni ? +(inter / uni).toFixed(3) : 0; row.areaRatio = nO ? +(nB / nO).toFixed(3) : 0; row.coverage = nO ? +(inter / nO).toFixed(3) : 0;
    if (nB > 0) {
      const mO = O.components(0).sort((a, c) => c.area - a.area)[0], mB = keep.components(0).sort((a, c) => c.area - a.area);
      // centroid of all kept cells
      const allC = keep.cellsOf(); const mb = keep.moments(allC), mo = O.moments(O.cellsOf());
      const dx = mb.cx - mo.cx, dz = mb.cz - mo.cz; row.centroidOffset = { dx: +dx.toFixed(2), dz: +dz.toFixed(2), m: +Math.hypot(dx, dz).toFixed(2), bearing: bearingDeg(dx, dz), dir: compass(bearingDeg(dx, dz)) };
      row.osmCentroid = [+mo.cx.toFixed(1), +mo.cz.toFixed(1)]; row.builtCentroid = [+mb.cx.toFixed(1), +mb.cz.toFixed(1)];
      row.osmAxisDeg = +(((mo.axis * 180 / Math.PI) % 180 + 180) % 180).toFixed(1); row.builtAxisDeg = +(((mb.axis * 180 / Math.PI) % 180 + 180) % 180).toFixed(1);
      row.osmEcc = +mo.ecc.toFixed(2); row.builtEcc = +mb.ecc.toFixed(2);
      row.rotDiffDeg = (mo.ecc > 1.4 && mb.ecc > 1.4) ? +angDiffDeg(mb.axis, mo.axis).toFixed(1) : null;
      // edge deviation (both directions)
      const rings = [b.poly], bp = keep.boundaryPts(); const dev = bp.map(([x, z]) => Math.min(...rings.map(r => distToRing(x, z, r)))).sort((p, q) => p - q);
      const eB = keep.clone(); const kb = new Grid(bb, RES); for (const [x, z] of bp) { const i = Math.floor((x - bb[0]) / RES), j = Math.floor((z - bb[1]) / RES); kb.a[j * kb.nx + i] = 1; }
      const ed = kb.edt(); const od = []; for (const r of rings) for (let i = 0; i < r.length; i++) { const a = r[i], c = r[(i + 1) % r.length], L = Math.hypot(c[0] - a[0], c[1] - a[1]); for (let s = 0; s <= L; s += RES) { const x = a[0] + (c[0] - a[0]) * s / L, z = a[1] + (c[1] - a[1]) * s / L; const ii = Math.floor((x - bb[0]) / RES), jj = Math.floor((z - bb[1]) / RES); if (ii >= 0 && jj >= 0 && ii < kb.nx && jj < kb.nz) od.push(ed[jj * kb.nx + ii]); } } od.sort((p, q) => p - q);
      const q = (a, f) => a.length ? a[Math.min(a.length - 1, Math.floor(a.length * f))] : 0;
      row.builtToOsmMax = +q(dev, 1).toFixed(1); row.builtToOsmP95 = +q(dev, .95).toFixed(1); row.osmToBuiltMax = +q(od, 1).toFixed(1); row.osmToBuiltP95 = +q(od, .95).toFixed(1);
      row.maxEdgeDev = +Math.max(row.builtToOsmMax, row.osmToBuiltMax).toFixed(1); row.p95EdgeDev = +Math.max(row.builtToOsmP95, row.osmToBuiltP95).toFixed(1);
      row.empty = comps(O.minus(keep).erode(0.6), 12, {});
      const resid = O.minus(keep).minus(Aall.fillHoles()); row.emptyAfterOtherModulesM2 = Math.round(resid.erode(0.6).area());
      row.emptyFilledBy = near.map(([k, m]) => [k, Math.round(O.minus(keep).and(m.fillHoles()).area())]).filter(([, a]) => a >= 10).sort((p, q) => q[1] - p[1]);
      row.spill = comps(keep.minus(O).erode(0.6), 12, {});
    } else { row.empty = [{ area: row.osmArea }]; row.spill = []; }
    out.buildings.push(row);
  }
  // built mass that belongs to no claim of this module (above ground, nothing of the neighbours' claims)
  const cl1 = own.dilate(1.5); const free = A.minus(cl1).minus(others);
  out.outsideClaims = comps(free.erode(0.6), 30, { module: modId });
  // per-level slab summary (surfaces ≥ 20 m², grouped by y)
  const lv = new Map(); for (const s of rec.surfs) { if (!clipBB(s.poly, bb)) continue; const a = polyArea(s.poly); if (a < 20) continue; const k = (Math.round(s.y * 2) / 2).toFixed(1); (lv.get(k) || lv.set(k, []).get(k)).push(s); }
  for (const [k, ss] of [...lv].sort((a, b) => +a[0] - +b[0])) { const g = new Grid(bb, RES); for (const s of ss) g.fillRings([s.poly]); const n = g.count(); if (n * RES * RES < 60) continue; const bbx = bboxOf(ss.flatMap(s => s.poly)); const inO = g.and(own).count();
    out.floors.push({ y: +k, area: Math.round(n * RES * RES), bbox: bbx.map(v => +v.toFixed(1)), insideClaimPct: +(inO / n * 100).toFixed(0), outsideArea: Math.round((n - inO) * RES * RES) }); }
  out._masks = { A, U, own, bb };
  return out;
}
