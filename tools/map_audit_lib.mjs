// Geometry helpers for tools/map_audit.mjs: raster masks, EDT, components, moments, polygon distances.
export const polyArea = p => { let a = 0; for (let i = 0, j = p.length - 1; i < p.length; j = i++) a += (p[j][0] + p[i][0]) * (p[j][1] - p[i][1]); return Math.abs(a / 2); };
export const bboxOf = pts => { let x0 = 1e18, z0 = 1e18, x1 = -1e18, z1 = -1e18; for (const [x, z] of pts) { if (x < x0) x0 = x; if (x > x1) x1 = x; if (z < z0) z0 = z; if (z > z1) z1 = z; } return [x0, z0, x1, z1]; };
export const pip = (x, z, poly) => { let c = false; for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) { const [xi, zi] = poly[i], [xj, zj] = poly[j]; if ((zi > z) !== (zj > z) && x < (xj - xi) * (z - zi) / (zj - zi) + xi) c = !c; } return c; };
export const centroidOf = poly => { let a = 0, cx = 0, cz = 0; for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) { const f = poly[j][0] * poly[i][1] - poly[i][0] * poly[j][1]; a += f; cx += (poly[j][0] + poly[i][0]) * f; cz += (poly[j][1] + poly[i][1]) * f; } a /= 2; return Math.abs(a) < 1e-9 ? poly[0] : [cx / (6 * a), cz / (6 * a)]; };
export function segDist(px, pz, ax, az, bx, bz) { const dx = bx - ax, dz = bz - az, L2 = dx * dx + dz * dz; let t = L2 ? ((px - ax) * dx + (pz - az) * dz) / L2 : 0; t = t < 0 ? 0 : t > 1 ? 1 : t; return Math.hypot(px - (ax + dx * t), pz - (az + dz * t)); }
export function distToRing(px, pz, ring) { let d = 1e18; for (let i = 0; i < ring.length; i++) { const a = ring[i], b = ring[(i + 1) % ring.length]; d = Math.min(d, segDist(px, pz, a[0], a[1], b[0], b[1])); } return d; }
export function distToPolyline(px, pz, pts) { let d = 1e18, bi = -1, bt = 0; for (let i = 1; i < pts.length; i++) { const a = pts[i - 1], b = pts[i]; const dd = segDist(px, pz, a[0], a[1], b[0], b[1]); if (dd < d) { d = dd; bi = i - 1; } } return { d, i: bi }; }
export const bearingDeg = (dx, dz) => (Math.round(((Math.atan2(dx, -dz) * 180 / Math.PI) + 360) % 360)); // compass: 0 = north (-z), 90 = east
export const compass = b => ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'][Math.round(b / 45) % 8];

export class Grid {
  constructor(bb, res = 0.5) { this.x0 = bb[0]; this.z0 = bb[1]; this.res = res; this.nx = Math.max(1, Math.ceil((bb[2] - bb[0]) / res)); this.nz = Math.max(1, Math.ceil((bb[3] - bb[1]) / res)); this.a = new Uint8Array(this.nx * this.nz); }
  cx(i) { return this.x0 + (i + 0.5) * this.res; } cz(j) { return this.z0 + (j + 0.5) * this.res; }
  clone() { const g = new Grid([this.x0, this.z0, this.x0 + this.nx * this.res, this.z0 + this.nz * this.res], this.res); g.a.set(this.a); return g; }
  count() { let n = 0; for (const v of this.a) n += v; return n; }
  area() { return this.count() * this.res * this.res; }
  fillRings(rings, v = 1) { // even-odd over all rings
    const { nx, nz, res } = this; const xs = [];
    for (let j = 0; j < nz; j++) {
      const z = this.cz(j); xs.length = 0;
      for (const r of rings) for (let k = 0, m = r.length - 1; k < r.length; m = k++) { const [x1, z1] = r[m], [x2, z2] = r[k]; if ((z1 > z) !== (z2 > z)) xs.push(x1 + (z - z1) / (z2 - z1) * (x2 - x1)); }
      if (xs.length < 2) continue; xs.sort((p, q) => p - q);
      for (let k = 0; k + 1 < xs.length; k += 2) { let i0 = Math.ceil((xs[k] - this.x0) / res - 0.5), i1 = Math.floor((xs[k + 1] - this.x0) / res - 0.5); if (i0 < 0) i0 = 0; if (i1 >= nx) i1 = nx - 1; for (let i = i0; i <= i1; i++) this.a[j * nx + i] = v; }
    }
  }
  line(ax, az, bx, bz, v = 1) { const n = Math.max(1, Math.ceil(Math.hypot(bx - ax, bz - az) / (this.res * 0.5))); for (let s = 0; s <= n; s++) { const x = ax + (bx - ax) * s / n, z = az + (bz - az) * s / n; const i = Math.floor((x - this.x0) / this.res), j = Math.floor((z - this.z0) / this.res); if (i >= 0 && j >= 0 && i < this.nx && j < this.nz) this.a[j * this.nx + i] = v; } }
  and(o) { const g = this.clone(); for (let k = 0; k < g.a.length; k++) g.a[k] = this.a[k] & o.a[k]; return g; }
  or(o) { const g = this.clone(); for (let k = 0; k < g.a.length; k++) g.a[k] = this.a[k] | o.a[k]; return g; }
  minus(o) { const g = this.clone(); for (let k = 0; k < g.a.length; k++) g.a[k] = this.a[k] & (o.a[k] ^ 1); return g; }
  // Euclidean distance (m) from every cell to the nearest SET cell
  edt() {
    const { nx, nz } = this, INF = 1e9, f = new Float64Array(Math.max(nx, nz)), d = new Float64Array(Math.max(nx, nz)), v = new Int32Array(Math.max(nx, nz) + 1), z = new Float64Array(Math.max(nx, nz) + 1);
    const out = new Float64Array(nx * nz);
    for (let k = 0; k < out.length; k++) out[k] = this.a[k] ? 0 : INF;
    const pass = (n, get, set) => {
      for (let q = 0; q < n; q++) f[q] = get(q);
      let k = 0; v[0] = 0; z[0] = -1e30; z[1] = 1e30;
      const inter = (q, p) => ((f[q] + q * q) - (f[p] + p * p)) / (2 * q - 2 * p);
      for (let q = 1; q < n; q++) { let s = inter(q, v[k]); while (s <= z[k]) { k--; s = inter(q, v[k]); } k++; v[k] = q; z[k] = s; z[k + 1] = 1e30; }
      k = 0; for (let q = 0; q < n; q++) { while (z[k + 1] < q) k++; const p = v[k]; set(q, (q - p) * (q - p) + f[p]); }
    };
    for (let i = 0; i < nx; i++) pass(nz, j => out[j * nx + i], (j, val) => { out[j * nx + i] = val; });
    for (let j = 0; j < nz; j++) pass(nx, i => out[j * nx + i], (i, val) => { out[j * nx + i] = val; });
    for (let k = 0; k < out.length; k++) out[k] = Math.sqrt(out[k]) * this.res;
    return out;
  }
  dilate(m) { const e = this.edt(), g = this.clone(); for (let k = 0; k < g.a.length; k++) g.a[k] = e[k] <= m + 1e-6 ? 1 : 0; return g; }
  erode(m) { const inv = this.clone(); for (let k = 0; k < inv.a.length; k++) inv.a[k] ^= 1; const e = inv.edt(), g = this.clone(); for (let k = 0; k < g.a.length; k++) g.a[k] = e[k] > m + 1e-6 ? 1 : 0; return g; }
  close(m) { return this.dilate(m).erode(m); }
  components(minArea = 0) {
    const { nx, nz } = this, lab = new Int32Array(nx * nz), res = []; let id = 0;
    for (let s = 0; s < lab.length; s++) {
      if (!this.a[s] || lab[s]) continue; id++; const st = [s]; lab[s] = id; const cells = [];
      while (st.length) { const c = st.pop(); cells.push(c); const i = c % nx, j = (c - i) / nx; for (let dj = -1; dj <= 1; dj++) for (let di = -1; di <= 1; di++) { if (!di && !dj) continue; const ii = i + di, jj = j + dj; if (ii < 0 || jj < 0 || ii >= nx || jj >= nz) continue; const n = jj * nx + ii; if (this.a[n] && !lab[n]) { lab[n] = id; st.push(n); } } }
      const area = cells.length * this.res * this.res; if (area < minArea) continue;
      res.push({ id, cells, area, ...this.moments(cells) });
    }
    return res;
  }
  moments(cells) {
    const { nx } = this; let sx = 0, sz = 0; for (const c of cells) { sx += this.cx(c % nx); sz += this.cz((c - c % nx) / nx); } const n = cells.length, mx = sx / n, mz = sz / n; let xx = 0, zz = 0, xz = 0;
    for (const c of cells) { const dx = this.cx(c % nx) - mx, dz = this.cz((c - c % nx) / nx) - mz; xx += dx * dx; zz += dz * dz; xz += dx * dz; } xx /= n; zz /= n; xz /= n;
    const tr = xx + zz, det = xx * zz - xz * xz, disc = Math.sqrt(Math.max(0, tr * tr / 4 - det)), l1 = tr / 2 + disc, l2 = Math.max(1e-9, tr / 2 - disc);
    const ang = 0.5 * Math.atan2(2 * xz, xx - zz); // major axis direction (x,z), radians
    return { cx: mx, cz: mz, l1, l2, ecc: Math.sqrt(l1 / l2), axis: ang };
  }
  fillHoles() { const { nx, nz } = this, seen = new Uint8Array(nx * nz), st = []; const push = k => { if (!this.a[k] && !seen[k]) { seen[k] = 1; st.push(k); } };
    for (let i = 0; i < nx; i++) { push(i); push((nz - 1) * nx + i); } for (let j = 0; j < nz; j++) { push(j * nx); push(j * nx + nx - 1); }
    while (st.length) { const c = st.pop(), i = c % nx, j = (c - i) / nx; if (i > 0) push(c - 1); if (i < nx - 1) push(c + 1); if (j > 0) push(c - nx); if (j < nz - 1) push(c + nx); }
    const g = this.clone(); for (let k = 0; k < g.a.length; k++) if (!seen[k]) g.a[k] = 1; return g; }
  cellsOf(mask) { const out = []; for (let k = 0; k < this.a.length; k++) if (this.a[k] && (!mask || mask[k])) out.push(k); return out; }
  boundaryPts() { const { nx, nz } = this, pts = []; for (let j = 0; j < nz; j++) for (let i = 0; i < nx; i++) { if (!this.a[j * nx + i]) continue; if (i === 0 || j === 0 || i === nx - 1 || j === nz - 1 || !this.a[j * nx + i - 1] || !this.a[j * nx + i + 1] || !this.a[(j - 1) * nx + i] || !this.a[(j + 1) * nx + i]) pts.push([this.cx(i), this.cz(j)]); } return pts; }
  // cell-edge segments of the mask outline (for drawing)
  edges() { const { nx, nz, res } = this, s = []; const at = (i, j) => (i < 0 || j < 0 || i >= nx || j >= nz) ? 0 : this.a[j * nx + i]; for (let j = 0; j < nz; j++) for (let i = 0; i < nx; i++) { if (!at(i, j)) continue; const x = this.x0 + i * res, z = this.z0 + j * res; if (!at(i, j - 1)) s.push([x, z, x + res, z]); if (!at(i, j + 1)) s.push([x, z + res, x + res, z + res]); if (!at(i - 1, j)) s.push([x, z, x, z + res]); if (!at(i + 1, j)) s.push([x + res, z, x + res, z + res]); } return s; }
}
export const angDiffDeg = (a, b) => { let d = ((a - b) * 180 / Math.PI) % 180; if (d > 90) d -= 180; if (d < -90) d += 180; return d; };
