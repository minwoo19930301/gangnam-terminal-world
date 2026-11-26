import {pointInPoly, polyBBox} from './physics.js';

// The projection of a world-space box must fit entirely on one opaque surface.
// Open stairwells and balcony edges can expose objects several storeys away.
export function createDeckVisibility() {
  const slabs = [], active = [];
  let x = 0, y = 0, z = 0, lastCamera, lastCount = -1, version = 0;

  function register({poly, holes = [], y: height, eyeMin, eyeMax}) {
    const edges = [];
    let direction = 0, convex = true;
    for (let i = 0; i < poly.length; i++) {
      const a = poly[i], b = poly[(i+1) % poly.length], c = poly[(i+2) % poly.length];
      const dx = b[0]-a[0], dz = b[1]-a[1];
      const turn = Math.sign(dx*(c[1]-b[1]) - dz*(c[0]-b[0]));
      if (turn) {
        if (direction && turn !== direction) convex = false;
        else direction = turn;
      }
      edges.push({a, dx, dz, minX: Math.min(a[0],b[0]), minZ: Math.min(a[1],b[1]),
        maxX: Math.max(a[0],b[0]), maxZ: Math.max(a[1],b[1])});
    }
    if (direction) slabs.push({height,eyeMin,eyeMax,poly,edges,convex,direction,
      bounds: polyBBox(poly), openings: holes.map(polyBBox)});
  }

  function update(camera) {
    if (camera === lastCamera && lastCount === slabs.length && (!camera ||
        (x === camera.position.x && y === camera.position.y && z === camera.position.z))) return;
    const wasActive = active.length > 0;
    lastCamera = camera;
    lastCount = slabs.length;
    active.length = 0;
    if (camera?.isPerspectiveCamera) {
      ({x,y,z} = camera.position);
      for (const slab of slabs) {
        const b = slab.bounds;
        if (y < slab.eyeMin || y > slab.eyeMax || Math.abs(y-slab.height) < .04 ||
            x < b[0] || x > b[2] || z < b[1] || z > b[3]) continue;
        if (pointInPoly(x,z,slab.poly)) active.push(slab);
      }
    }
    if (wasActive || active.length) version++;
  }

  function covers(slab, left, bottom, right, top) {
    const bb = slab.bounds;
    if (left <= bb[0] || right >= bb[2] || bottom <= bb[1] || top >= bb[3]) return false;
    for (const opening of slab.openings) {
      if (left <= opening[2] && right >= opening[0] && bottom <= opening[3] && top >= opening[1]) return false;
    }
    if (slab.convex) {
      // Minimum inward distance over the rectangle for each boundary edge.
      for (const edge of slab.edges) {
        const nx = -edge.dz * slab.direction, nz = edge.dx * slab.direction;
        if (nx*((nx>0 ? left : right)-edge.a[0]) + nz*((nz>0 ? bottom : top)-edge.a[1]) <= 0) return false;
      }
      return true;
    }
    // A concave notch may enter even when all four corners lie inside.
    // Test the rectangle's axes and the segment's normal for separation.
    for (const edge of slab.edges) {
      if (left > edge.maxX || right < edge.minX || bottom > edge.maxZ || top < edge.minZ) continue;
      const nx = -edge.dz, nz = edge.dx;
      const min = nx*((nx>=0 ? left : right)-edge.a[0]) + nz*((nz>=0 ? bottom : top)-edge.a[1]);
      const max = nx*((nx>=0 ? right : left)-edge.a[0]) + nz*((nz>=0 ? top : bottom)-edge.a[1]);
      if (min <= 1e-6 && max >= -1e-6) return false;
    }
    return pointInPoly(left,bottom,slab.poly);
  }

  function hides(box) {
    for (const slab of active) {
      const sign = y > slab.height ? 1 : -1, eye = sign*y, plane = sign*slab.height;
      const lo = sign === 1 ? box.min.y : -box.max.y, hi = sign === 1 ? box.max.y : -box.min.y;
      if (hi >= plane-.025) continue;
      const near = (eye-plane)/(eye-lo), far = (eye-plane)/(eye-hi);
      // Projection is monotonic in each horizontal coordinate. The interval
      // includes all eight corners plus a 15 mm margin at cutouts and edges.
      const l = x + Math.min((box.min.x-x)*near,(box.min.x-x)*far) - .015;
      const r = x + Math.max((box.max.x-x)*near,(box.max.x-x)*far) + .015;
      const b = z + Math.min((box.min.z-z)*near,(box.min.z-z)*far) - .015;
      const t = z + Math.max((box.max.z-z)*near,(box.max.z-z)*far) + .015;
      if (covers(slab,l,b,r,t)) return true;
    }
    return false;
  }
  return {register, update, hides, get active() { return active.length > 0; }, get revision() { return version; }};
}
