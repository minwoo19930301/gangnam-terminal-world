// Spatial-hash collision world: vertical walls (2D segments w/ y-range) + walkable surfaces (polys, ramps).
// Ground at y=0 everywhere except inside groundHoles. Pure JS, no THREE dependency (unit-testable).

export function pointInPoly(x, z, poly) {
  let inside = false;
  for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
    const xi = poly[i][0], zi = poly[i][1], xj = poly[j][0], zj = poly[j][1];
    if ((zi > z) !== (zj > z) && x < (xj - xi) * (z - zi) / (zj - zi) + xi) inside = !inside;
  }
  return inside;
}
export function polyBBox(poly) {
  let x0 = Infinity, z0 = Infinity, x1 = -Infinity, z1 = -Infinity;
  for (const [x, z] of poly) { if (x < x0) x0 = x; if (x > x1) x1 = x; if (z < z0) z0 = z; if (z > z1) z1 = z; }
  return [x0, z0, x1, z1];
}
export function polyArea(poly) {
  let a = 0; for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) a += (poly[j][0] + poly[i][0]) * (poly[j][1] - poly[i][1]);
  return Math.abs(a / 2);
}

class Grid {
  constructor(cell) { this.cell = cell; this.m = new Map(); }
  key(i, j) { return i * 100003 + j; }
  insert(item, x0, z0, x1, z1) {
    const c = this.cell;
    const i0 = Math.floor(x0 / c), i1 = Math.floor(x1 / c), j0 = Math.floor(z0 / c), j1 = Math.floor(z1 / c);
    if ((i1 - i0 + 1) * (j1 - j0 + 1) > 40000) { (this.big ||= []).push(item); return; }
    for (let i = i0; i <= i1; i++) for (let j = j0; j <= j1; j++) {
      const k = this.key(i, j); let a = this.m.get(k); if (!a) this.m.set(k, a = []); a.push(item);
    }
  }
  at(x, z) { const a = this.m.get(this.key(Math.floor(x / this.cell), Math.floor(z / this.cell))); return this.big ? (a ? a.concat(this.big) : this.big) : (a || EMPTY); }
  near(x, z, r, out) {
    const c = this.cell; out.clear();
    for (let i = Math.floor((x - r) / c); i <= Math.floor((x + r) / c); i++) for (let j = Math.floor((z - r) / c); j <= Math.floor((z + r) / c); j++) {
      const a = this.m.get(this.key(i, j)); if (a) for (const it of a) out.add(it);
    }
    if (this.big) for (const it of this.big) out.add(it);
    return out;
  }
}
const EMPTY = [];

export function createPhysics() {
  const walls = new Grid(8), surfs = new Grid(8), holes = new Grid(16), zones = new Grid(16), ceilings = new Grid(8);
  const stats = { walls: 0, surfaces: 0, holes: 0, zones: 0 };
  const P = {
    stats,
    addWall(ax, az, bx, bz, y0, y1, r = 0.12, tag) {
      const w = { ax, az, bx, bz, y0, y1, r, tag };
      walls.insert(w, Math.min(ax, bx) - r, Math.min(az, bz) - r, Math.max(ax, bx) + r, Math.max(az, bz) + r); stats.walls++;
      return w;
    },
    addPolyWalls(poly, y0, y1, r = 0.12, tag) { for (let i = 0; i < poly.length; i++) { const a = poly[i], b = poly[(i + 1) % poly.length]; P.addWall(a[0], a[1], b[0], b[1], y0, y1, r, tag); } },
    // walkable horizontal polygon at height y (top surface). holes: array of polys.
    addSurface(poly, y, opts = {}) {
      const bb = polyBBox(poly);
      const s = { kind: 'poly', poly, holes: opts.holes || null, y, bb, slow: opts.slow || 0, tag: opts.tag, move: opts.move || null };
      surfs.insert(s, bb[0], bb[1], bb[2], bb[3]); stats.surfaces++; return s;
    },
    // inclined strip from A(ya) to B(yb), half-width hw. move: [vx,vz] conveyor (escalator)
    addRamp(ax, az, bx, bz, hw, ya, yb, opts = {}) {
      const dx = bx - ax, dz = bz - az, L = Math.hypot(dx, dz) || 1;
      const s = { kind: 'ramp', ax, az, ux: dx / L, uz: dz / L, L, hw, ya, yb, move: opts.move || null, tag: opts.tag };
      surfs.insert(s, Math.min(ax, bx) - hw, Math.min(az, bz) - hw, Math.max(ax, bx) + hw, Math.max(az, bz) + hw); stats.surfaces++; return s;
    },
    addCeiling(poly, y, opts = {}) { const bb = polyBBox(poly); const c = { poly, holes: opts.holes || null, y, bb }; ceilings.insert(c, ...bb); return c; },
    addGroundHole(poly, inner) { const bb = polyBBox(poly); const h = { poly, bb, inner: inner && inner.length ? inner : null }; holes.insert(h, ...bb); stats.holes++; return h; },
    addZone(z) { const bb = z.bb || polyBBox(z.poly); z.bb = bb; z.area ??= polyArea(z.poly); zones.insert(z, ...bb); stats.zones++; return z; },
    groundHole(x, z) {
      for (const h of holes.at(x, z)) if (x >= h.bb[0] && x <= h.bb[2] && z >= h.bb[1] && z <= h.bb[3] && pointInPoly(x, z, h.poly)) {
        if (h.inner && h.inner.some(q => pointInPoly(x, z, q))) continue;
        return true;
      }
      return false;
    },
    // returns {y, s} : highest walkable surface at (x,z) with y <= maxY
    support(x, z, maxY) {
      let best = -Infinity, bs = null;
      if (0 <= maxY && !P.groundHole(x, z)) { best = 0; bs = GROUND; }
      for (const s of surfs.at(x, z)) {
        let y;
        if (s.kind === 'poly') {
          if (s.y > maxY || s.y <= best) continue;
          if (x < s.bb[0] || x > s.bb[2] || z < s.bb[1] || z > s.bb[3]) continue;
          if (!pointInPoly(x, z, s.poly)) continue;
          if (s.holes && s.holes.some(h => pointInPoly(x, z, h))) continue;
          y = s.y;
        } else {
          const px = x - s.ax, pz = z - s.az, t = px * s.ux + pz * s.uz;
          if (t < -0.05 || t > s.L + 0.05) continue;
          if (Math.abs(-px * s.uz + pz * s.ux) > s.hw) continue;
          y = s.ya + (s.yb - s.ya) * Math.min(1, Math.max(0, t / s.L));
          if (y > maxY || y <= best) continue;
        }
        best = y; bs = s;
      }
      return { y: best, s: bs };
    },
    ceilingAbove(x, z, fromY, toY) {
      let lo = Infinity;
      for (const c of ceilings.at(x, z)) {
        if (c.y <= fromY || c.y >= toY || c.y >= lo) continue;
        if (x < c.bb[0] || x > c.bb[2] || z < c.bb[1] || z > c.bb[3] || !pointInPoly(x, z, c.poly)) continue;
        if (c.holes && c.holes.some(h => pointInPoly(x, z, h))) continue;
        lo = c.y;
      }
      return lo;
    },
    zoneAt(x, y, z) {
      let best = null;
      for (const zn of zones.at(x, z)) {
        if (y < zn.y0 - 0.3 || y > zn.y1) continue;
        if (x < zn.bb[0] || x > zn.bb[2] || z < zn.bb[1] || z > zn.bb[3] || !pointInPoly(x, z, zn.poly)) continue;
        if (!best || (zn.priority || 0) > (best.priority || 0) || ((zn.priority || 0) === (best.priority || 0) && zn.area < best.area)) best = zn;
      }
      return best;
    },
    // push circle (x,z,r) out of walls overlapping the vertical span [feet+step, head]
    resolve(pos, r, feet, head, step) {
      const near = P._near || (P._near = new Set());
      walls.near(pos.x, pos.z, r + 1, near);
      for (let it = 0; it < 3; it++) {
        let moved = false;
        for (const w of near) {
          if (feet + step >= w.y1 || head <= w.y0) continue;
          const dx = w.bx - w.ax, dz = w.bz - w.az, L2 = dx * dx + dz * dz || 1e-9;
          let t = ((pos.x - w.ax) * dx + (pos.z - w.az) * dz) / L2; t = t < 0 ? 0 : t > 1 ? 1 : t;
          const cx = w.ax + dx * t, cz = w.az + dz * t;
          let ex = pos.x - cx, ez = pos.z - cz; const d = Math.hypot(ex, ez), min = r + w.r;
          if (d < min) {
            if (d < 1e-6) { ex = -dz; ez = dx; const l = Math.hypot(ex, ez) || 1; ex /= l; ez /= l; } else { ex /= d; ez /= d; }
            pos.x = cx + ex * min; pos.z = cz + ez * min; moved = true;
          }
        }
        if (!moved) break;
      }
    },
  };
  return P;
}
const GROUND = { kind: 'ground', y: 0 };

// ---------------- player controller ----------------
export function createPlayer(phys, opts = {}) {
  const pl = {
    x: 0, y: 0, z: 0, // y = feet
    vy: 0, yaw: 0, pitch: 0, eye: 1.62, r: 0.32, height: 1.75, step: 0.5,
    fly: false, grounded: false, speed: 4.2, run: 11, surface: null,
    respawn: opts.respawn || { x: 0, y: 0, z: 0, yaw: 0 },
  };
  pl.teleport = (x, y, z, yaw) => { pl.x = x; pl.z = z; pl.y = y; pl.vy = 0; if (yaw !== undefined) pl.yaw = yaw; const s = phys.support(x, z, y + 1.0); if (s.s) pl.y = s.y; };
  pl.update = (dt, input) => {
    const sp = (input.run ? pl.run : pl.speed) * (pl.surface && pl.surface.slow ? (1 - pl.surface.slow) : 1);
    const fx = -Math.sin(pl.yaw), fz = -Math.cos(pl.yaw), rx = Math.cos(pl.yaw), rz = -Math.sin(pl.yaw);
    let mx = (fx * input.f + rx * input.s), mz = (fz * input.f + rz * input.s);
    const ml = Math.hypot(mx, mz); if (ml > 1) { mx /= ml; mz /= ml; }
    if (pl.fly) {
      const fs = (input.run ? 60 : 18);
      pl.x += mx * fs * dt; pl.z += mz * fs * dt; pl.y += ((input.up ? 1 : 0) - (input.down ? 1 : 0)) * fs * dt;
      return;
    }
    let dx = mx * sp * dt, dz = mz * sp * dt;
    if (pl.grounded && pl.surface && pl.surface.move) { dx += pl.surface.move[0] * dt; dz += pl.surface.move[1] * dt; }
    const n = Math.max(1, Math.ceil(Math.hypot(dx, dz) / 0.2));
    const pos = { x: pl.x, z: pl.z };
    for (let i = 0; i < n; i++) {
      const ox = pos.x, oz = pos.z;
      pos.x += dx / n; pos.z += dz / n;
      phys.resolve(pos, pl.r, pl.y, pl.y + pl.height, pl.step);
      // don't walk off into a step taller than step-up (handled by walls) — but block walking into a much higher floor without wall
      const sup = phys.support(pos.x, pos.z, pl.y + pl.step);
      if (sup.y === -Infinity && pl.grounded && pl.y > -200) { /* void: allow falling */ }
      if (!isFinite(pos.x)) { pos.x = ox; pos.z = oz; }
    }
    pl.x = pos.x; pl.z = pos.z;
    // vertical
    const sup = phys.support(pl.x, pl.z, pl.y + pl.step);
    if (input.jump && pl.grounded) { pl.vy = 5.2; pl.grounded = false; }
    pl.vy -= 18 * dt; if (pl.vy < -40) pl.vy = -40;
    let ny = pl.y + pl.vy * dt;
    if (pl.vy > 0) { const c = phys.ceilingAbove(pl.x, pl.z, pl.y + pl.height - 0.05, ny + pl.height + 0.01); if (c < Infinity) { ny = c - pl.height - 0.01; pl.vy = 0; } }
    if (ny <= sup.y) { ny = sup.y; pl.vy = 0; pl.grounded = true; pl.surface = sup.s; }
    else if (pl.grounded && sup.y > -Infinity && pl.y - sup.y < 0.6 && pl.vy <= 0) { ny = sup.y; pl.vy = 0; pl.surface = sup.s; } // stick to ramps/stairs going down
    else { pl.grounded = false; }
    pl.y = ny;
    if (pl.y < -150) { const r = pl.respawn; pl.teleport(r.x, r.y, r.z, r.yaw); }
  };
  return pl;
}
