import { streetBatchView } from './static-view.js';
import { visitorInstances } from './visitors.js';
import {visitorView} from './visitor-view.js';
import { drawHardware } from '../assets/models/street-and-lift/draw.js';
import { makeStep, drawStepRails } from '../assets/models/staircase/render.js';
import { createEscalatorRenderer } from '../assets/models/escalator/render.js';
import { treeInstances } from './streetscape.js';
import { createRiverWater } from './river-water.js';
import { fleetInstances, vehicleContacts, vehicleSize } from './fleet.js';
import { relief, terrainPieces } from './banpo_relief.js';
import { wheelContacts } from './vehicle_ground.js';
// K = construction kit handed to every place module.  See docs/PLACE_API.md for the contract.
// Coordinates: x=east, z=south, y=up, meters. Origin = 고속터미널역. Street level y=0.
import { createTextures, createSignAtlas, makeCanvas } from './textures.js';
import { pointInPoly, polyBBox, polyArea, distanceToPolygonSq } from './physics.js';

export const LEVELS = { B1: -6, B2: -11, B3: -16, B4: -21, B5: -26, B6: -31 };
const TILE = 320;

export function createKit(THREE, scene, { osm, phys, maxAniso = 8, maxTex = 4096, low = false, keep = null, keepDetail = null, streetView = false } = {}) {
  // Area loading (js/areas.js): keep(owner, x, y, z, ny) drops primitives/meshes/trees/people outside the loaded area,
  // keepDetail(group) skips lazy detail groups the area does not show. Both null = build everything.
  const staticVisibility = streetBatchView(THREE,scene);
  const streetVisibility = streetView ? staticVisibility : null;
  const clipVisitors=visitorView(THREE,scene,relief);
  const T = createTextures(THREE, { maxAniso });
  // big atlas pages mean fewer materials → fewer draw calls (the bottleneck on slow CPUs); low tier draws signs
  // at a lower pixel density (resolution only — every sign is still there)
  const PAGE = Math.min(4096, maxTex);
  const atlas = createSignAtlas(THREE, { size: PAGE, quality: low ? 0.55 : 0.72 });
  const buckets = new Map();
  const materials = new Map();
  const tmpC = new THREE.Color();
  const frameFns = [], interactables = [], spawns = [], zonesList = [], elevators = [], claims = new Set(), mapMarks = [];
  const trees = [], people = [], parked = [];
  const groundHoles = [];
  const stats = { boxes: 0, quads: 0, signs: 0 };
  let current = null; // current place id (for attribution in stats/errors)
  const perPlace = {};

  // ---------- materials ----------
  function matFor(key) {
    if (materials.has(key)) return materials.get(key);
    let m;
    if (key === 'vc') m = new THREE.MeshLambertMaterial({ vertexColors: true });
    else if (key === 'glass') m = new THREE.MeshLambertMaterial({ vertexColors: true, transparent: true, opacity: 0.32, depthWrite: false, side: THREE.DoubleSide });
    else if (key === 'emit') m = new THREE.MeshBasicMaterial({ vertexColors: true });
    else if (key === 'hanRiver') m = createRiverWater(THREE,scene,onFrame);
    else if (key === 'water') { const s = T.surface('water'); m = new THREE.MeshLambertMaterial({ map: s.tex, vertexColors: true, transparent: true, opacity: 0.92 }); }
    else if (key.startsWith('sign:')) { const p = atlas.pages[+key.slice(5)]; m = new THREE.MeshBasicMaterial({ map: p.t, side: THREE.FrontSide, alphaTest: 0.35 }); }
    else if (key.startsWith('arr:')) { m = new THREE.MeshLambertMaterial({ map: dummyMap, vertexColors: true }); m.userData.arr = texArrays[+key.slice(4)]; addBounce(m, '', true); materials.set(key, m); return m; }
    else if (key.startsWith('tex:')) { const s = T.surface(key.slice(4)); m = new THREE.MeshLambertMaterial({ map: s.tex, vertexColors: true }); }
    else if (key.startsWith('ctex:')) { const s = customTex.get(key.slice(5)); m = new THREE.MeshLambertMaterial({ map: s.tex, vertexColors: true, transparent: !!s.transparent, alphaTest: s.transparent ? 0.3 : 0, side: s.doubleSide ? THREE.DoubleSide : THREE.FrontSide }); }
    else if (/^gl\d+:/.test(key)) { // polished surface: the base material plus a blurred warm-interior reflection
      const i = key.indexOf(':'), g = +key.slice(2, i) / 10, base = key.slice(i + 1);
      if (base === 'vc') m = new THREE.MeshLambertMaterial({ vertexColors: true });
      else if (base.startsWith('tex:')) m = new THREE.MeshLambertMaterial({ map: T.surface(base.slice(4)).tex, vertexColors: true });
      else if (base.startsWith('ctex:')) m = new THREE.MeshLambertMaterial({ map: customTex.get(base.slice(5)).tex, vertexColors: true });
      else throw new Error('gloss needs a colour or texture material, got ' + base);
      m.envMap = glossEnv(); m.combine = THREE.MixOperation; m.reflectivity = 0.5 * g;
    }
    else throw new Error('unknown material key ' + key);
    if (m.isMeshLambertMaterial) addBounce(m);
    materials.set(key, m); return m;
  }
  // Shared reflection map for polished floors/stone ({ gloss }): a soft interior — bright ceiling with downlight pools,
  // warm walls fading to a darker floor. Not a mirror of the actual room, but it gives marble/terrazzo/lacquer their sheen.
  let glossCube = null;
  function glossEnv() {
    if (glossCube) return glossCube;
    const S = 128, faces = [];
    for (let f = 0; f < 6; f++) {
      const cv = makeCanvas(S, S), g = cv.getContext('2d');
      if (f === 2) { // +y ceiling
        g.fillStyle = '#e9e1d4'; g.fillRect(0, 0, S, S);
        for (let i = 0; i < 4; i++) for (let j = 0; j < 4; j++) { const x = (i + 0.5) * S / 4, y = (j + 0.5) * S / 4, r = g.createRadialGradient ? g.createRadialGradient(x, y, 0, x, y, S / 7) : null; if (r && r.addColorStop) { r.addColorStop(0, '#fffaf0'); r.addColorStop(1, 'rgba(255,250,240,0)'); g.fillStyle = r; } else g.fillStyle = '#fffaf0'; g.fillRect(x - S / 7, y - S / 7, S / 3.5, S / 3.5); }
      } else if (f === 3) { g.fillStyle = '#5a5248'; g.fillRect(0, 0, S, S); } // -y floor
      else { // sides: light top band (ceiling edge), warm walls, darker bottom
        const lg = g.createLinearGradient ? g.createLinearGradient(0, 0, 0, S) : null;
        if (lg && lg.addColorStop) { lg.addColorStop(0, '#f4eee4'); lg.addColorStop(0.35, '#c9b9a2'); lg.addColorStop(0.6, '#8d7d6a'); lg.addColorStop(1, '#4e463d'); g.fillStyle = lg; } else g.fillStyle = '#a89886';
        g.fillRect(0, 0, S, S);
        g.fillStyle = 'rgba(255,248,235,0.4)'; for (let i = 0; i < 3; i++) g.fillRect((i + 0.3) * S / 3, S * 0.38, S / 9, S * 0.16); // shop windows
      }
      faces.push(cv);
    }
    glossCube = new THREE.CubeTexture(faces); glossCube.colorSpace = THREE.SRGBColorSpace; glossCube.needsUpdate = true;
    return glossCube;
  }
  // Bounce light for downward faces. Lambert ceilings only see the hemisphere's ground colour (divided by pi),
  // so lit interiors read grey; real ceilings get light reflected from floors and fixtures. This adds a
  // diffuse term scaled by how much the surface faces down (world space). bounce.value is set by main.js
  // (lower at night).
  const bounce = { value: 0.55 };
  // Texture arrays: textures of the same size share one sampler2DArray (one material, one draw call per tile);
  // each vertex carries its layer. Repeat wrapping and mipmaps work per layer exactly as with separate textures.
  const ARRAY_MAP = `#ifdef USE_MAP
  vec4 sampledDiffuseColor = texture(uTexArr, vec3(vMapUv, vLayer));
  diffuseColor *= sampledDiffuseColor;
#endif`;
  function addBounce(m, extra = '', isAtlas = false) {
    m.onBeforeCompile = (sh) => {
      sh.uniforms.uBounce = bounce;
      if (isAtlas) {
        sh.uniforms.uTexArr = { value: m.userData.arr };
        sh.vertexShader = sh.vertexShader.replace('#include <common>', '#include <common>\nattribute float layer;\nvarying float vLayer;').replace('#include <uv_vertex>', '#include <uv_vertex>\nvLayer = layer;');
        sh.fragmentShader = sh.fragmentShader.replace('#include <common>', '#include <common>\nprecision highp sampler2DArray;\nuniform sampler2DArray uTexArr;\nvarying float vLayer;').replace('#include <map_fragment>', ARRAY_MAP);
      }
      sh.vertexShader = sh.vertexShader.replace('#include <common>', '#include <common>\nvarying float vDown;')
        .replace('#include <beginnormal_vertex>', '#include <beginnormal_vertex>\nvDown = -normalize(mat3(modelMatrix) * objectNormal).y;');
      sh.fragmentShader = sh.fragmentShader.replace('#include <common>', '#include <common>\nvarying float vDown;\nuniform float uBounce;')
        .replace('#include <opaque_fragment>', 'outgoingLight += diffuseColor.rgb * uBounce * smoothstep(0.35, 0.95, vDown);\n' + extra + '#include <opaque_fragment>');
    };
    m.customProgramCacheKey = () => 'bounce1' + (extra ? 'g' : '') + (isAtlas ? 'arr' : '');
  }
  const customTex = new Map();
  const customMats = new Map();
  // mat spec -> {key, color:[r,g,b], scale:[su,sv], facade}
  function spec(mat, color) {
    if (mat === undefined || mat === null) mat = 0xcccccc;
    if (typeof mat === 'number') { tmpC.setHex(mat); return { key: 'vc', c: [tmpC.r, tmpC.g, tmpC.b], scale: [1, 1] }; }
    if (typeof mat === 'string') mat = { tex: mat };
    let c = [1, 1, 1];
    const col = mat.color ?? color;
    if (col !== undefined) { tmpC.setHex(col); c = [tmpC.r, tmpC.g, tmpC.b]; }
    const name = mat.tex;
    if (name === 'glass') { if (col === undefined) { tmpC.setHex(0x9fc4dc); c = [tmpC.r, tmpC.g, tmpC.b]; } return { key: 'glass', c, scale: [1, 1] }; }
    if (name === 'emit' || name === 'light') { if (col === undefined) c = [1, 1, 0.97]; return { key: 'emit', c, scale: [1, 1] }; }
    if (name === 'hanRiver') return { key: 'hanRiver', c, scale:[1,1] };
    if (name === 'water') return { key: 'water', c, scale: T.surface('water').scale };
    if (customMats.has(name)) return { key: 'cm:' + name, c, scale: mat.scale || [1, 1] };
    const gl = mat.gloss ? 'gl' + Math.max(1, Math.min(10, Math.round((mat.gloss === true ? 0.45 : +mat.gloss) * 10))) + ':' : '';
    if (gl && name === undefined) return { key: gl + 'vc', c, scale: [1, 1] };
    if (customTex.has(name)) { const s = customTex.get(name); if (gl && (s.transparent || s.doubleSide)) throw new Error('gloss on a transparent texture'); return { key: gl + 'ctex:' + name, c, scale: mat.scale || s.scale, facade: s.facade }; }
    const s = T.surface(name);
    return { key: gl + 'tex:' + name, c, scale: mat.scale || s.scale, facade: s.facade };
  }

  // A road deck or building can share a surveyed anchor across its entire
  // footprint. Physics stores the same offset in terrain-relative coordinates.
  let anchorHeight = null;
  let parkedPose = null;
  function terrainAt(surface, x, z) {
    if (typeof surface === 'number') return surface;
    return (surface ?? relief)(x,z);
  }
  function withTerrainSurface(surface, build) {
    const previous = anchorHeight;
    anchorHeight = surface;
    try { return phys.withHeightOffset((x,z) => terrainAt(surface,x,z) - relief(x,z), build); }
    finally { anchorHeight = previous; }
  }
  function withTerrainAnchor(x, z, build) {
    return withTerrainSurface(relief(x,z),build);
  }
  function withParkedVehicle(x, y, z, yaw, halfTrack, halfAxle, grade, build) {
    const prior = anchorHeight, sin = Math.sin(yaw), cos = Math.cos(yaw);
    const expected = (px, pz) => terrainAt(prior, px, pz) + y + grade * ((px-x)*sin + (pz-z)*cos);
    const wheels = wheelContacts(phys, x, z, sin, cos, halfTrack, halfAxle, expected, []);
    const gx = wheels.right*cos + wheels.forward*sin, gz = wheels.forward*cos - wheels.right*sin;
    const plane = (px, pz) => wheels.height - y + gx*(px-x) + gz*(pz-z);
    // Rotate the whole chassis onto the supporting plane. Wheels can travel
    // independently when the pavement changes slope between the two axles.
    const normal = new THREE.Vector3(-gx, 1, -gz).normalize();
    const tilt = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0,1,0), normal);
    const v = new THREE.Vector3();
    let travel = 0;
    const previous = parkedPose;
    parkedPose = (points, n) => {
      const corners = points.map(([px, py, pz]) => {
        v.set(px-x, py-y, pz-z).applyQuaternion(tilt);
        const tx = x+v.x, tz = z+v.z;
        return [tx, wheels.height + v.y + travel - plane(tx,tz), tz];
      });
      return [corners, v.fromArray(n).applyQuaternion(tilt).toArray()];
    };
    const atWheel = (i, draw) => {
      const across = (i%2 ? 1 : -1)*halfTrack, along = (i<2 ? -1 : 1)*halfAxle;
      v.set(across*cos + along*sin, 0, along*cos - across*sin).applyQuaternion(tilt);
      travel = wheels[i] - wheels.height - v.y;
      try { draw(); } finally { travel = 0; }
    };
    try { return withTerrainSurface(plane, () => build(atWheel, wheels, tilt)); }
    finally { parkedPose = previous; }
  }
  // Input faces have one normal, one colour and one winding. Expand those
  // directly into the final GPU buffers after their output tiles are known.
  function recordFace(bucket, surface, normal, signedCount) {
    if (anchorHeight !== null) (bucket.anchors ||= new Map()).set(bucket.prim.length, anchorHeight);
    bucket.nor.push(normal[0], normal[1], normal[2]);
    bucket.col.push(surface.c[0], surface.c[1], surface.c[2]);
    bucket.prim.push(signedCount);
    bucket.own.push(current);
  }

  // ---------- buckets ----------
  function bucket(key, x, z) {
    const tk = key + '|' + Math.floor(x / TILE) + ',' + Math.floor(z / TILE);
    let b = buckets.get(tk);
    if (!b) { b = { key, pos: [], nor: [], uv: [], col: [], prim: [], own: [] }; buckets.set(tk, b); }
    return b;
  }
  function splitTerrainFace(sp, p, n, uvs) {
    if (typeof anchorHeight === 'number') return false;
    const pieces = terrainPieces(p, uvs);
    if (!pieces) return false;
    for (const poly of pieces) for (let i = 1; i + 1 < poly.length; i++) {
      const corners = [poly[0], poly[i], poly[i+1]];
      tri(sp, corners.map(v => v.slice(0,3)), n, corners.map(v => v.slice(3)), false);
    }
    return true;
  }
  // The area predicate is immutable for this page. Drop hidden faces before
  // allocating positions, colours and UVs, using the same post-split centroid
  // as the tile builder. Collision and zone registration are independent.
  function outsideArea(p, ny) {
    let x = 0, y = 0, z = 0;
    for (const v of p) { x += v[0]; y += v[1]; z += v[2]; }
    if (keep(current, x/p.length, y/p.length, z/p.length, ny)) return false;
    stats.areaDropped = (stats.areaDropped || 0) + 1;
    return true;
  }
  // emit a quad. p: 4 points [x,y,z], n: intended normal, uvs: 4 [u,v]
  function quad(sp, p, n, uvs, split = true) {
    if (parkedPose) [p,n] = parkedPose(p,n);
    else if (split && splitTerrainFace(sp, p, n, uvs)) return;
    if (keep && outsideArea(p, n[1])) return;
    const b = bucket(sp.key, p[0][0], p[0][2]);
    // winding check
    const ax = p[1][0] - p[0][0], ay = p[1][1] - p[0][1], az = p[1][2] - p[0][2];
    const bx = p[2][0] - p[0][0], by = p[2][1] - p[0][1], bz = p[2][2] - p[0][2];
    const cx = ay * bz - az * by, cy = az * bx - ax * bz, cz = ax * by - ay * bx;
    const flip = cx * n[0] + cy * n[1] + cz * n[2] < 0;
    for (let i = 0; i < 4; i++) {
      b.pos.push(p[i][0], p[i][1], p[i][2]);
      b.uv.push(uvs[i][0], uvs[i][1]);
    }
    recordFace(b, sp, n, flip ? -4 : 4);
    stats.quads++;
  }
  function tri(sp, p, n, uvs, split = true) {
    if (parkedPose) [p,n] = parkedPose(p,n);
    else if (split && splitTerrainFace(sp, p, n, uvs)) return;
    if (keep && outsideArea(p, n[1])) return;
    const b = bucket(sp.key, p[0][0], p[0][2]);
    const ax = p[1][0] - p[0][0], ay = p[1][1] - p[0][1], az = p[1][2] - p[0][2];
    const bx = p[2][0] - p[0][0], by = p[2][1] - p[0][1], bz = p[2][2] - p[0][2];
    const cx = ay * bz - az * by, cy = az * bx - ax * bz, cz = ax * by - ay * bx;
    const flip = cx * n[0] + cy * n[1] + cz * n[2] < 0;
    for (let i = 0; i < 3; i++) {
      b.pos.push(p[i][0], p[i][1], p[i][2]);
      b.uv.push(uvs[i][0], uvs[i][1]);
    }
    recordFace(b, sp, n, flip ? -3 : 3);
  }
  // vertical face from (ax,az)->(bx,bz), y0..y1, normal given. u along length from uOff.
  function vface(sp, ax, az, bx, bz, y0, y1, nx, nz, uOff = 0, floorH = 0, vBase = 0) {
    const L = Math.hypot(bx - ax, bz - az);
    const su = sp.scale[0], sv = sp.facade ? (floorH || 3.5) : sp.scale[1];
    const u0 = uOff / su, u1 = (uOff + L) / su, v0 = (y0 - vBase) / sv, v1 = (y1 - vBase) / sv;
    quad(sp, [[ax, y0, az], [bx, y0, bz], [bx, y1, bz], [ax, y1, az]], [nx, 0, nz], [[u0, v0], [u1, v0], [u1, v1], [u0, v1]]);
  }
  // horizontal polygon (with holes) at y. up=true -> normal +y
  function hpoly(sp, poly, y, up = true, holes = null, rotUV = 0) {
    const V = THREE.Vector2;
    const contour = poly.map(p => new V(p[0], p[1]));
    const hs = (holes || []).map(h => h.map(p => new V(p[0], p[1])));
    let faces;
    try { faces = THREE.ShapeUtils.triangulateShape(contour, hs); } catch (e) { return; }
    const all = contour.concat(...hs);
    const su = sp.scale[0], sv = sp.scale[1], cr = Math.cos(rotUV), sr = Math.sin(rotUV);
    const n = up ? [0, 1, 0] : [0, -1, 0];
    for (const f of faces) {
      const p = f.map(i => [all[i].x, y, all[i].y]);
      const uv = f.map(i => { const x = all[i].x, z = all[i].y; return [(x * cr - z * sr) / su, -(x * sr + z * cr) / sv]; });
      tri(sp, p, n, uv);
    }
  }

  // ---------- primitives ----------
  // box: y = bottom. rotY rotates around (x,z). faces can be skipped via skip:['top','bottom','n','s','e','w'] (local)
  function box(o) {
    const { x = 0, y = 0, z = 0, w = 1, h = 1, d = 1, rotY = 0 } = o;
    const sp = spec(o.mat, o.color);
    const spTop = o.top !== undefined ? spec(o.top) : sp, spSide = o.side !== undefined ? spec(o.side) : sp;
    const c = Math.cos(rotY), s = Math.sin(rotY);
    const P = (lx, lz) => [x + lx * c + lz * s, z - lx * s + lz * c];
    const hw = w / 2, hd = d / 2;
    const corners = [P(-hw, -hd), P(hw, -hd), P(hw, hd), P(-hw, hd)]; // NW, NE, SE, SW (local)
    const skip = new Set(o.skip || []);
    const y1 = y + h;
    // side normals (local): n:-z, e:+x, s:+z, w:-x
    const nrm = { n: [-s, -c], e: [c, -s], s: [s, c], w: [-c, s] };
    const edges = { n: [corners[0], corners[1]], e: [corners[1], corners[2]], s: [corners[2], corners[3]], w: [corners[3], corners[0]] };
    for (const k of ['n', 'e', 's', 'w']) {
      if (skip.has(k)) continue;
      const [a, b] = edges[k];
      vface(spSide, a[0], a[1], b[0], b[1], y, y1, nrm[k][0], nrm[k][1], 0, o.floorH, o.vBase ?? y);
    }
    if (!skip.has('top')) hpoly(spTop, corners, y1, true, null, rotY);
    if (!skip.has('bottom')) hpoly(o.bottom !== undefined ? spec(o.bottom) : sp, corners, y, false, null, rotY);
    stats.boxes++;
    if (o.solid !== false && h > 0.05) {
      if (h > 0.45 || o.solid === true) phys.addPolyWalls(corners, y, y1, 0.02, current);
      phys.addSurface(corners, y1, { tag: current });
      if (o.ceil !== false && h > 1.8) phys.addCeiling(corners, y, {});
    } else if (o.walk) phys.addSurface(corners, y1, { tag: current });
    return corners;
  }
  function orient(poly) { // returns per-edge outward normal
    return poly.map((a, i) => {
      const b = poly[(i + 1) % poly.length]; let nx = b[1] - a[1], nz = -(b[0] - a[0]); const L = Math.hypot(nx, nz) || 1; nx /= L; nz /= L;
      const mx = (a[0] + b[0]) / 2 + nx * 0.05, mz = (a[1] + b[1]) / 2 + nz * 0.05;
      return pointInPoly(mx, mz, poly) ? [-nx, -nz] : [nx, nz];
    });
  }
  // extruded polygon. opts: mat, top, bottom (false to skip), side, holes, solid(default true), walkTop(default=solid), floorH
  function prism(poly, y0, y1, o = {}) {
    const sp = spec(o.mat, o.color);
    const spSide = o.side === undefined || o.side === false ? sp : spec(o.side);
    const ns = orient(poly);
    let u = 0;
    if (o.side !== false) for (let i = 0; i < poly.length; i++) {
      const a = poly[i], b = poly[(i + 1) % poly.length];
      vface(spSide, a[0], a[1], b[0], b[1], y0, y1, ns[i][0], ns[i][1], u, o.floorH, o.vBase ?? y0);
      u += Math.hypot(b[0] - a[0], b[1] - a[1]);
    }
    if (o.holes && o.side !== false) for (const hl of o.holes) {
      const hn = orient(hl);
      for (let i = 0; i < hl.length; i++) { const a = hl[i], b = hl[(i + 1) % hl.length]; vface(spSide, a[0], a[1], b[0], b[1], y0, y1, -hn[i][0], -hn[i][1], 0, o.floorH, o.vBase ?? y0); }
    }
    if (o.top !== false) hpoly(o.top !== undefined ? spec(o.top) : sp, poly, y1, true, o.holes);
    if (o.bottom !== false) hpoly(o.bottom !== undefined ? spec(o.bottom) : sp, poly, y0, false, o.holes);
    if (o.solid !== false) {
      phys.addPolyWalls(poly, y0, y1, 0.02, current);
      if (o.holes) for (const hl of o.holes) phys.addPolyWalls(hl, y0, y1, 0.02, current);
      if (o.walkTop !== false) phys.addSurface(poly, y1, { holes: o.holes, tag: current });
      if (y1 - y0 > 1.8) phys.addCeiling(poly, y0, { holes: o.holes });
    }
  }
  // floor slab: walkable top at y, thickness down. under: material for ceiling side seen from below.
  function slab(poly, y, o = {}) {
    const th = o.thick ?? 0.3;
    const sp = spec(o.mat ?? 'tile');
    hpoly(sp, poly, y, true, o.holes, o.uvRot || 0);
    if (o.under !== false) hpoly(spec(o.under ?? 'ceiling'), poly, y - th, false, o.holes);
    if (o.edge !== false) {
      const se = spec(o.edgeMat ?? 0xb8b4ac); const ns = orient(poly);
      for (let i = 0; i < poly.length; i++) { const a = poly[i], b = poly[(i + 1) % poly.length]; vface(se, a[0], a[1], b[0], b[1], y - th, y, ns[i][0], ns[i][1]); }
      if (o.holes) for (const hl of o.holes) { const hn = orient(hl); for (let i = 0; i < hl.length; i++) { const a = hl[i], b = hl[(i + 1) % hl.length]; vface(se, a[0], a[1], b[0], b[1], y - th, y, -hn[i][0], -hn[i][1]); } }
    }
    if (o.walk !== false) phys.addSurface(poly, y, { holes: o.holes, tag: current, slow: o.slow });
    if (o.ceil !== false) phys.addCeiling(poly, y - th, { holes: o.holes });
  }
  // straight wall from A to B with openings [{at, w, y0?, y1?}] (at = distance from A to opening center)
  function wall(ax, az, bx, bz, y0, y1, o = {}) {
    const th = o.thick ?? 0.2, L = Math.hypot(bx - ax, bz - az);
    if (L < 0.01) return;
    const ux = (bx - ax) / L, uz = (bz - az) / L, nx = -uz, nz = ux;
    const sp = spec(o.mat ?? 0xe6e2da), sp2 = o.mat2 !== undefined ? spec(o.mat2) : sp;
    const ops = (o.openings || []).map(p => ({ a: Math.max(0, p.at - p.w / 2), b: Math.min(L, p.at + p.w / 2), y0: Math.max(y0, p.y0 ?? y0), y1: Math.min(y1, p.y1 ?? Math.min(y1, y0 + 2.4)) })).filter(p => p.b > p.a && p.y1 > p.y0);
    // build list of pieces [s,e,ya,yb]: cut the wall at every opening edge, then per interval
    // subtract the union of all openings covering it (so stacked openings at the same `at` all stay open)
    const xs = [...new Set([0, L, ...ops.flatMap(p => [p.a, p.b])])].sort((p, q) => p - q);
    const pieces = [];
    for (let i = 0; i < xs.length - 1; i++) {
      const s0 = xs[i], s1 = xs[i + 1]; if (s1 - s0 < 1e-4) continue;
      const mid = (s0 + s1) / 2;
      const gaps = ops.filter(p => p.a <= mid && p.b >= mid).map(p => [p.y0, p.y1]).sort((p, q) => p[0] - q[0]);
      let cy = y0; const solids = [];
      for (const [g0, g1] of gaps) { if (g0 > cy) solids.push([cy, g0]); cy = Math.max(cy, g1); }
      if (cy < y1) solids.push([cy, y1]);
      for (const [ya, yb] of solids) {
        if (yb - ya < 1e-3) continue;
        let last = null; for (let k = pieces.length - 1; k >= 0; k--) { const q = pieces[k]; if (Math.abs(q[1] - s0) < 1e-6 && Math.abs(q[2] - ya) < 1e-6 && Math.abs(q[3] - yb) < 1e-6) { last = q; break; } }
        if (last) last[1] = s1; else pieces.push([s0, s1, ya, yb]);
      }
    }
    const glass = o.mat === 'glass' || (o.mat && o.mat.tex === 'glass');
    for (const [s0, s1, ya, yb] of pieces) {
      const x0 = ax + ux * s0, z0 = az + uz * s0, x1 = ax + ux * s1, z1 = az + uz * s1;
      const ox = nx * th / 2, oz = nz * th / 2;
      vface(sp, x0 + ox, z0 + oz, x1 + ox, z1 + oz, ya, yb, nx, nz, s0, o.floorH, o.vBase ?? y0);
      if (!glass || th > 0.05) vface(sp2, x1 - ox, z1 - oz, x0 - ox, z0 - oz, ya, yb, -nx, -nz, L - s1, o.floorH, o.vBase ?? y0);
      if (th > 0.05) {
        const se = spec(o.capMat ?? (typeof o.mat === 'number' ? o.mat : 0xd8d4cc));
        quad(se, [[x0 + ox, yb, z0 + oz], [x1 + ox, yb, z1 + oz], [x1 - ox, yb, z1 - oz], [x0 - ox, yb, z0 - oz]], [0, 1, 0], [[0, 0], [1, 0], [1, 1], [0, 1]]);
        quad(se, [[x0 - ox, ya, z0 - oz], [x1 - ox, ya, z1 - oz], [x1 + ox, ya, z1 + oz], [x0 + ox, ya, z0 + oz]], [0, -1, 0], [[0, 0], [1, 0], [1, 1], [0, 1]]);
        quad(se, [[x0 - ox, ya, z0 - oz], [x0 + ox, ya, z0 + oz], [x0 + ox, yb, z0 + oz], [x0 - ox, yb, z0 - oz]], [-ux, 0, -uz], [[0, 0], [1, 0], [1, 1], [0, 1]]);
        quad(se, [[x1 + ox, ya, z1 + oz], [x1 - ox, ya, z1 - oz], [x1 - ox, yb, z1 - oz], [x1 + ox, yb, z1 + oz]], [ux, 0, uz], [[0, 0], [1, 0], [1, 1], [0, 1]]);
      }
      if (o.solid !== false) phys.addWall(x0, z0, x1, z1, ya, yb, Math.max(0.06, th / 2), current);
    }
  }
  // walls along a polygon outline. openings: [{x,z,w,y0,y1}] snapped to nearest edge, or {edge,at,w}
  function polyWalls(poly, y0, y1, o = {}) {
    const ns = orient(poly);
    const per = poly.map(() => []);
    for (const op of (o.openings || [])) {
      if (op.edge !== undefined) { per[op.edge].push(op); continue; }
      let best = -1, bd = Infinity, bat = 0;
      for (let i = 0; i < poly.length; i++) {
        const a = poly[i], b = poly[(i + 1) % poly.length], dx = b[0] - a[0], dz = b[1] - a[1], L2 = dx * dx + dz * dz;
        let t = ((op.x - a[0]) * dx + (op.z - a[1]) * dz) / L2; t = Math.max(0, Math.min(1, t));
        const d = Math.hypot(a[0] + dx * t - op.x, a[1] + dz * t - op.z);
        if (d < bd) { bd = d; best = i; bat = t * Math.sqrt(L2); }
      }
      if (best >= 0) per[best].push({ ...op, at: bat });
    }
    for (let i = 0; i < poly.length; i++) {
      const a = poly[i], b = poly[(i + 1) % poly.length];
      // inset wall by thick/2 so outer face lies on the footprint line
      const th = o.thick ?? 0.25, ix = -ns[i][0] * th / 2, iz = -ns[i][1] * th / 2;
      // wall() puts mat on the +n side where n = (-uz, ux). Choose so that 'mat' faces outward.
      const L = Math.hypot(b[0] - a[0], b[1] - a[1]); const ux = (b[0] - a[0]) / L, uz = (b[1] - a[1]) / L;
      const outwardIsPlus = (-uz * ns[i][0] + ux * ns[i][1]) > 0;
      const oo = { ...o, openings: per[i] };
      if (!outwardIsPlus) { oo.mat = o.inner ?? o.mat; oo.mat2 = o.mat; } else { oo.mat = o.mat; oo.mat2 = o.inner ?? o.mat; }
      wall(a[0] + ix, a[1] + iz, b[0] + ix, b[1] + iz, y0, y1, oo);
    }
  }
  // side collision for sloped runs (escalators, stair rails): short vertical pieces that follow the slope,
  // so the floor below the run stays walkable wherever there is head room.
  function slopedWall(ax, az, bx, bz, ya, yb, top) {
    const L = Math.hypot(bx - ax, bz - az), n = Math.max(1, Math.ceil(L / 1.0));
    for (let i = 0; i < n; i++) {
      const t0 = i / n, t1 = (i + 1) / n, y0 = ya + (yb - ya) * t0, y1 = ya + (yb - ya) * t1;
      phys.addWall(ax + (bx - ax) * t0, az + (bz - az) * t0, ax + (bx - ax) * t1, az + (bz - az) * t1, Math.min(y0, y1) - 1.3, Math.max(y0, y1) + top, 0.05, current);
    }
  }
  // ramp / stairs. A at height ya to B at height yb, width w.
  function ramp(ax, az, bx, bz, o = {}) {
    const w = o.w ?? 2, ya = o.ya ?? 0, yb = o.yb ?? 1, L = Math.hypot(bx - ax, bz - az);
    const ux = (bx - ax) / L, uz = (bz - az) / L, nx = -uz * w / 2, nz = ux * w / 2;
    const sp = spec(o.mat ?? (o.steps ? 'darkstone' : 'concrete'));
    if (o.steps) {
      const rise = Math.abs(yb - ya), n = Math.max(1, Math.round(rise / 0.17)), run = L / n, dir = Math.sign(yb - ya) || 1;
      const nosing = o.nosing === undefined ? null : spec(o.nosing);
      const drawStep = o.blenderTreads || o.move ? null : makeStep(quad,tri,w,run,rise/n,dir,ux,uz,sp,nosing);
      for (let i = 0; i < n; i++) {
        const t0 = i * run, t1 = (i + 1) * run; const yTop = ya + dir * (i + 1) * rise / n; const yLow = Math.min(ya, yb) - 0.2;
        const cx0 = ax + ux * t0, cz0 = az + uz * t0, cx1 = ax + ux * t1, cz1 = az + uz * t1;
        const stepY = dir > 0 ? yTop : ya + dir * i * rise / n;
        if (drawStep) drawStep(dir>0 ? cx0 : cx1,stepY,dir>0 ? cz0 : cz1);
        else if (!o.blenderTreads) {
          // Legacy place-authored moving steps keep their independent treads and motion.
          quad(sp, [[cx0 + nx, stepY, cz0 + nz], [cx1 + nx, stepY, cz1 + nz], [cx1 - nx, stepY, cz1 - nz], [cx0 - nx, stepY, cz0 - nz]], [0, 1, 0], [[0, 0], [w, 0], [w, run], [0, run]]);
          if (nosing) {
            const edge = dir > 0 ? t0 : t1, inset = Math.min(.029, run * .13) * dir;
            const P = (along, side) => [ax + ux * along + nx * side, stepY + .003, az + uz * along + nz * side];
            quad(nosing, [P(edge,-1), P(edge,1), P(edge+inset,1), P(edge+inset,-1)], [0,1,0], [[0,0],[1,0],[1,1],[0,1]]);
          }
          // riser (front)
          const rx = dir > 0 ? cx0 : cx1, rz = dir > 0 ? cz0 : cz1, rLow = stepY - rise / n;
          quad(sp, [[rx - nx, rLow, rz - nz], [rx + nx, rLow, rz + nz], [rx + nx, stepY, rz + nz], [rx - nx, stepY, rz - nz]], [-ux * dir, 0, -uz * dir], [[0, 0], [1, 0], [1, 0.2], [0, 0.2]]);
        }
        // side skirts
        const ss = spec(o.sideMat ?? 0x8c8882);
        quad(ss, [[cx0 + nx, yLow, cz0 + nz], [cx1 + nx, yLow, cz1 + nz], [cx1 + nx, stepY, cz1 + nz], [cx0 + nx, stepY, cz0 + nz]], [nx, 0, nz], [[0, 0], [1, 0], [1, 1], [0, 1]]);
        quad(ss, [[cx1 - nx, yLow, cz1 - nz], [cx0 - nx, yLow, cz0 - nz], [cx0 - nx, stepY, cz0 - nz], [cx1 - nx, stepY, cz1 - nz]], [-nx, 0, -nz], [[0, 0], [1, 0], [1, 1], [0, 1]]);
      }
      // close the block: bottom face and the back face at the high end
      const ss = spec(o.sideMat ?? 0x8c8882), yLow = Math.min(ya, yb) - 0.2, yHigh = Math.max(ya, yb);
      quad(ss, [[ax - nx, yLow, az - nz], [bx - nx, yLow, bz - nz], [bx + nx, yLow, bz + nz], [ax + nx, yLow, az + nz]], [0, -1, 0], [[0, 0], [1, 0], [1, 1], [0, 1]]);
      const ex = yb >= ya ? bx : ax, ez = yb >= ya ? bz : az, es = yb >= ya ? 1 : -1;
      quad(ss, [[ex - nx, yLow, ez - nz], [ex + nx, yLow, ez + nz], [ex + nx, yHigh, ez + nz], [ex - nx, yHigh, ez - nz]], [ux * es, 0, uz * es], [[0, 0], [1, 0], [1, 1], [0, 1]]);
    } else {
      quad(sp, [[ax + nx, ya, az + nz], [bx + nx, yb, bz + nz], [bx - nx, yb, bz - nz], [ax - nx, ya, az - nz]], [0, 1, 0], [[0, 0], [L / sp.scale[0], 0], [L / sp.scale[0], w / sp.scale[1]], [0, w / sp.scale[1]]]);
      quad(spec(o.under ?? 0x9a968f), [[ax - nx, ya - 0.25, az - nz], [bx - nx, yb - 0.25, bz - nz], [bx + nx, yb - 0.25, bz + nz], [ax + nx, ya - 0.25, az + nz]], [0, -1, 0], [[0, 0], [1, 0], [1, 1], [0, 1]]);
    }
    if (o.rails !== false) {
      const rm = spec(o.railMat ?? 0x8a9096);
      const profiled = o.steps && !o.blenderTreads && !o.move;
      if (profiled) drawStepRails(quad,tri,ax,az,bx,bz,ya,yb,w,ux,uz,rm);
      for (const sgn of [1, -1]) {
        const ox = nx * sgn, oz = nz * sgn;
        if (!profiled) quad(rm, [[ax + ox, ya + 0.9, az + oz], [bx + ox, yb + 0.9, bz + oz], [bx + ox, yb + 1.0, bz + oz], [ax + ox, ya + 1.0, az + oz]], [ox, 0, oz], [[0, 0], [1, 0], [1, 1], [0, 1]]);
        if (o.railWalls !== false) slopedWall(ax + ox, az + oz, bx + ox, bz + oz, ya, yb, 1.0);
      }
    }
    const mv = o.move ? [ux * o.move, uz * o.move] : null;
    phys.addRamp(ax, az, bx, bz, w / 2, ya, yb, { move: mv, tag: current });
  }
  const fixedEscalators = [];
  const drawEscalator = createEscalatorRenderer(THREE, (mesh,moving) => {
    addMesh(mesh);
    if (streetVisibility) {
      if (moving) streetVisibility.flight(mesh,true,relief);
      else fixedEscalators.push(mesh);
    }
  }, onFrame);
  function escalator(ax, az, bx, bz, o = {}) {
    const w = o.w ?? 1.1, ya = o.ya ?? 0, yb = o.yb ?? 5;
    const L = Math.hypot(bx - ax, bz - az), ux = (bx - ax) / L, uz = (bz - az) / L;
    ramp(ax, az, bx, bz, {w, ya, yb, steps:true, blenderTreads:true, sideMat:o.sideMat ?? 0xc7ccd1, rails:false});
    const a = [ax, ya + terrainAt(anchorHeight,ax,az), az], b = [bx, yb + terrainAt(anchorHeight,bx,bz), bz];
    const tread = o.mat != null ? spec(o.mat) : null;
    const map = tread && tread.key !== 'vc' ? matFor(tread.key).map : null;
    const tint = typeof o.mat === 'number' || o.mat?.color != null ? tread.c : null;
    const steps = Math.max(2, Math.round(Math.abs(yb-ya)/.17));
    const speed = (o.dir === 'down' ? -1 : 1) * (o.speed ?? .6);
    drawEscalator(ya <= yb ? a : b, ya <= yb ? b : a, w, steps, speed, tint, map);
    const nx = -uz * (w / 2 + 0.08), nz = ux * (w / 2 + 0.08);
    const gl = spec('glass');
    for (const s of [1, -1]) {
      const ox = nx * s, oz = nz * s;
      quad(gl, [[ax + ox, ya, az + oz], [bx + ox, yb, bz + oz], [bx + ox, yb + 0.95, bz + oz], [ax + ox, ya + 0.95, az + oz]], [ox, 0, oz], [[0, 0], [1, 0], [1, 1], [0, 1]]);
      slopedWall(ax + ox, az + oz, bx + ox, bz + oz, ya, yb, 1.05);
    }
    // underside truss
    const tb = spec(o.truss ?? 0xb9bec4); const dx = -uz * w / 2, dz = ux * w / 2;
    quad(tb, [[ax - dx, ya - 0.9, az - dz], [bx - dx, yb - 0.9, bz - dz], [bx + dx, yb - 0.9, bz + dz], [ax + dx, ya - 0.9, az + dz]], [0, -1, 0], [[0, 0], [1, 0], [1, 1], [0, 1]]);
    // A caller may give the higher endpoint first. Up always increases elevation.
    const dir = (o.dir === 'down' ? -1 : 1) * (Math.sign(yb-ya) || 1);
    phys.addRamp(ax, az, bx, bz, w / 2, ya + 0.001, yb + 0.001, { move: [ux * dir * (o.speed ?? 0.6), uz * dir * (o.speed ?? 0.6)], tag: current });
  }
  function cyl(o) {
    const { x = 0, y = 0, z = 0, r = 0.4, h = 3, seg = 12 } = o; const sp = spec(o.mat ?? 0xdedad2);
    const pts = []; for (let i = 0; i < seg; i++) { const a = i / seg * Math.PI * 2; pts.push([x + Math.cos(a) * r, z + Math.sin(a) * r]); }
    for (let i = 0; i < seg; i++) {
      const a = pts[i], b = pts[(i + 1) % seg], am = (i + 0.5) / seg * Math.PI * 2;
      vface(sp, a[0], a[1], b[0], b[1], y, y + h, Math.cos(am), Math.sin(am), i * 2 * Math.PI * r / seg);
    }
    if (o.caps !== false) { hpoly(sp, pts, y + h, true); hpoly(sp, pts, y, false); }
    if (o.solid !== false) { phys.addPolyWalls(pts, y, y + h, 0.02, current); if (o.walkTop) phys.addSurface(pts, y + h, {}); }
    return pts;
  }
  // dome / ellipsoid cap. o: x,y,z, rx, ry, rz, seg, rings, hemi(default true)
  function dome(o) {
    const { x = 0, y = 0, z = 0, rx = 5, ry = 5, rz = rx, seg = 24, rings = 10 } = o; const sp = spec(o.mat ?? 0xffffff);
    const hemi = o.hemi !== false; const t0 = hemi ? 0 : -Math.PI / 2;
    for (let j = 0; j < rings; j++) {
      const a0 = t0 + (Math.PI / 2 - t0) * j / rings, a1 = t0 + (Math.PI / 2 - t0) * (j + 1) / rings;
      for (let i = 0; i < seg; i++) {
        const b0 = i / seg * Math.PI * 2, b1 = (i + 1) / seg * Math.PI * 2;
        const P = (a, b) => [x + Math.cos(a) * Math.cos(b) * rx, y + Math.sin(a) * ry, z + Math.cos(a) * Math.sin(b) * rz];
        const p = [P(a0, b0), P(a0, b1), P(a1, b1), P(a1, b0)];
        const am = (a0 + a1) / 2, bm = (b0 + b1) / 2;
        quad(sp, p, [Math.cos(am) * Math.cos(bm), Math.sin(am), Math.cos(am) * Math.sin(bm)], [[i / seg, j / rings], [(i + 1) / seg, j / rings], [(i + 1) / seg, (j + 1) / rings], [i / seg, (j + 1) / rings]]);
      }
    }
    if (o.solid) { const pts = []; for (let i = 0; i < 16; i++) { const b = i / 16 * Math.PI * 2; pts.push([x + Math.cos(b) * rx, z + Math.sin(b) * rz]); } phys.addPolyWalls(pts, y, y + ry * 0.8, 0.05, current); }
  }
  // text sign: vertical plane. rotY=0 faces +z (south). twoSided draws mirrored-correct back.
  function sign(text, o = {}) {
    const { x = 0, y = 2, z = 0, w = 2, h = 0.5, rotY = 0 } = o;
    const r = atlas.draw(text, { ...o, w, h });
    const sp = { key: 'sign:' + r.page.index, c: [1, 1, 1], scale: [1, 1] };
    const nx = Math.sin(rotY), nz = Math.cos(rotY), ux = Math.cos(rotY), uz = -Math.sin(rotY);
    const off = o.offset ?? 0.02;
    const cx = x + nx * off, cz = z + nz * off;
    const [u0, v0, u1, v1] = r.uv;
    const p = [[cx - ux * w / 2, y - h / 2, cz - uz * w / 2], [cx + ux * w / 2, y - h / 2, cz + uz * w / 2], [cx + ux * w / 2, y + h / 2, cz + uz * w / 2], [cx - ux * w / 2, y + h / 2, cz - uz * w / 2]];
    quad(sp, p, [nx, 0, nz], [[u0, v0], [u1, v0], [u1, v1], [u0, v1]]);
    if (o.twoSided) {
      const bx = x - nx * off, bz = z - nz * off;
      const q = [[bx + ux * w / 2, y - h / 2, bz + uz * w / 2], [bx - ux * w / 2, y - h / 2, bz - uz * w / 2], [bx - ux * w / 2, y + h / 2, bz - uz * w / 2], [bx + ux * w / 2, y + h / 2, bz + uz * w / 2]];
      quad(sp, q, [-nx, 0, -nz], [[u0, v0], [u1, v0], [u1, v1], [u0, v1]]);
    }
    if (o.box) box({ x, y: y - h / 2 - 0.02, z: z - nz * (o.box / 2), w: w + 0.06, h: h + 0.04, d: o.box, rotY, mat: o.boxMat ?? 0x2a2a2a, solid: false });
    stats.signs++;
  }
  // horizontal text on a floor / road (reads when looking down, top of text toward -z rotated by rotY)
  function floorText(text, o = {}) {
    const { x = 0, y = 0.02, z = 0, w = 2, h = 1, rotY = 0 } = o;
    const r = atlas.draw(text, { bg: null, ...o, w, h });
    const sp = { key: 'sign:' + r.page.index, c: [1, 1, 1], scale: [1, 1] };
    const c = Math.cos(rotY), s = Math.sin(rotY); const P = (lx, lz) => [x + lx * c + lz * s, y, z - lx * s + lz * c];
    const [u0, v0, u1, v1] = r.uv;
    quad(sp, [P(-w / 2, h / 2), P(w / 2, h / 2), P(w / 2, -h / 2), P(-w / 2, -h / 2)], [0, 1, 0], [[u0, v0], [u1, v0], [u1, v1], [u0, v1]]);
  }
  // instanced things
  // trees count as ground clutter (ny 1) for area filtering
  function tree(x, z, o = {}) {
    if (keep && !keep(current, x, o.y ?? 0, z, 1)) return;
    const [sourceX, sourceZ] = o.sourceXZ ?? [x, z];
    const y = (o.y ?? 0) + (anchorHeight === null ? 0 : terrainAt(anchorHeight,x,z) - relief(x,z));
    const t = { place: current, x, z, y, h: o.h ?? (6 + ((sourceX * 13.7 + sourceZ * 7.3) % 3)), kind: o.kind ?? 'zelkova' };
    if (o.sourceXZ) t.sourceXZ = o.sourceXZ;
    trees.push(t);
  }
  function person(x, y, z, o = {}) { if (keep && !keep(current, x, y, z, 1)) return; people.push({ place: current, x, y:y + (anchorHeight===null ? 0 : terrainAt(anchorHeight,x,z)-relief(x,z)), z, rotY: o.rotY ?? ((x * 7 + z * 3) % 6.28), shirt: o.shirt, pants: o.pants, h: o.h ?? (1.6 + ((x * 31 + z * 17) % 0.25)), sit: !!o.sit }); }
  function crowd(poly, y, n, o = {}) { const rnd = rand(o.seed ?? (poly[0][0] * 1000 + poly[0][1])); const bb = polyBBox(poly); let k = 0, guard = 0; while (k < n && guard++ < n * 30) { const x = bb[0] + rnd() * (bb[2] - bb[0]), z = bb[1] + rnd() * (bb[3] - bb[1]); if (pointInPoly(x, z, poly)) { person(x, y, z, { rotY: rnd() * 6.28 }); k++; } } }
  // Parked vehicles share the traffic meshes. kind: car|taxi|bus|cityBus|truck|van
  function vehicle(o) {
    const { x = 0, y = 0, z = 0, rotY = 0, kind = 'car' } = o;
    const [w, h, d] = vehicleSize(kind), [halfTrack, halfAxle] = vehicleContacts(kind);
    const c = Math.cos(rotY), s = Math.sin(rotY);
    const color = o.color ?? ({ taxi: 0xf2a33a, bus: 0x2a5aa8, cityBus: 0x3a9d4a, truck: 0xe8e8e8 }[kind] ?? [0xf2f2f2, 0x1c1c1c, 0x8a9096, 0x24324a, 0x9b1b1b, 0xd9d9d9][Math.abs(Math.round(x * 3 + z * 7)) % 6]);
    withParkedVehicle(x, y, z, rotY, halfTrack, halfAxle, 0, (_atWheel, wheels, tilt) => {
      if (!keep || keep(current, x, y + h / 2, z, 0)) {
        parked.push({ x, y, z, rotY, kind, color, wheels, tilt, place: current });
      }
      if (o.label && (kind === 'bus' || kind === 'cityBus')) {
        sign(o.label, { x: x + (d / 2 + .09) * s, y: y + h - .30, z: z + (d / 2 + .09) * c, w: 1.9, h: .27, rotY, bg: '#111', fg: '#ffb000' });
      }
      if (o.solid !== false) {
        const P = (lx,lz) => [x + lx*c + lz*s, z - lx*s + lz*c];
        const poly = [P(-w/2,-d/2), P(w/2,-d/2), P(w/2,d/2), P(-w/2,d/2)];
        phys.addPolyWalls(poly, y, y+h, .02, current);
        phys.addSurface(poly, y+h, {});
      }
    });
  }
  // ---------- gameplay registrations ----------
  function zone(o) {
    let poly = o.poly; if (!poly && o.rect) { const [x0, z0, x1, z1] = o.rect; poly = [[x0, z0], [x1, z0], [x1, z1], [x0, z1]]; }
    const z = { name: o.name, sub: o.sub || '', floor: o.floor || '', poly, y0: o.y0 ?? -1, y1: o.y1 ?? 4, priority: o.priority || 0, place: o.place || current, color: o.color };
    if (o.streetAccess === false) z.streetAccess = false;
    phys.addZone(z); zonesList.push(z); return z;
  }
  function spawn(o) { spawns.push({ group: o.group || perPlace[current]?.name || current, place: current, ...o }); }
  function interact(o) { interactables.push({ r: 1.8, place: current, ...o }); }
  function portal(o) { interact({ ...o, label: o.label || '이동', onUse: (pl) => pl.teleport(o.to.x, o.to.y, o.to.z, o.to.yaw) }); }
  function elevator(o) {
    const { x, z, rotY = 0, w = 2.0, d = 2.0, floors } = o;
    const name = o.name || '엘리베이터';
    const el = { name, x, z, floors, place: current };
    elevators.push(el);
    const nx = Math.sin(rotY), nz = Math.cos(rotY);
    if (o.shaft !== false) {
      const c = Math.cos(rotY), s = Math.sin(rotY); const P = (lx, lz) => [x + lx * c + lz * s, z - lx * s + lz * c];
      const poly = [P(-w / 2, -d / 2), P(w / 2, -d / 2), P(w / 2, d / 2), P(-w / 2, d / 2)];
      const ys = floors.map(f => f.y).sort((a, b) => a - b); const top = ys[ys.length - 1] + (o.topH ?? 3.2), bot = ys[0];
      // three walls (back/sides) solid, front has a door opening per floor
      wall(poly[0][0], poly[0][1], poly[1][0], poly[1][1], bot, top, { mat: o.mat ?? 0xb9bcc0, thick: 0.15, solid: true });
      wall(poly[1][0], poly[1][1], poly[2][0], poly[2][1], bot, top, { mat: o.mat ?? 0xb9bcc0, thick: 0.15 });
      wall(poly[3][0], poly[3][1], poly[0][0], poly[0][1], bot, top, { mat: o.mat ?? 0xb9bcc0, thick: 0.15 });
      for (const f of floors) {
        const fx = (poly[2][0] + poly[3][0]) / 2 + nx * 0.09, fz = (poly[2][1] + poly[3][1]) / 2 + nz * 0.09;
        sign([f.label], { x: fx + nx * 0.02, y: f.y + 2.45, z: fz + nz * 0.02, w: 0.5, h: 0.25, rotY, bg: '#111', fg: '#ff5a2a' });
        const doorWidth = Math.min(1.2, w-.3), tx = Math.cos(rotY), tz = -Math.sin(rotY);
        for (const sign of [-1,1]) {
          const offset=sign*(doorWidth/2+.045);
          drawHardware(K,'LiftJamb',fx+tx*offset,f.y,fz+tz*offset,rotY,sign);
        }
        drawHardware(K,'LiftHead',fx,f.y,fz,rotY,doorWidth+.15);
        const side = doorWidth/2 + .195;
        drawHardware(K,'LiftCallPlate',fx+tx*side,f.y,fz+tz*side,rotY);
        const buttons = [];
        if (f.y < ys.at(-1)) buttons.push('▲');
        if (f.y > ys[0]) buttons.push('▼');
        if (buttons.length) sign(buttons, { x:fx+tx*side+nx*.066, z:fz+tz*side+nz*.066,
          y:f.y+1.12,w:.135,h:.225,rotY,bg:'#474f55',fg:'#f1d797',padding:.01,pxPerM:160 });
        slab(poly, f.y, { mat: 'metal', thick: 0.05, edge: false, ceil: false });
      }
      // front wall (door side) with openings at each floor
      wall(poly[2][0], poly[2][1], poly[3][0], poly[3][1], bot, top, { mat: o.doorMat ?? 0x9aa3ab, thick: 0.15, openings: floors.map(f => ({ at: w / 2, w: Math.min(1.2, w - 0.3), y0: f.y, y1: f.y + 2.4 })) });
    }
    interact({ x, z, y: null, r: Math.max(w, d) * 0.8 + 0.6, label: name, elevator: el, place: current });
    return el;
  }
  function groundHole(poly, inner) { phys.addGroundHole(poly, inner); groundHoles.push({ poly, inner }); }
  function onFrame(fn) { frameFns.push(fn); }
  // Detail batches keep their normal scene parents so place animations retain control of visibility.
  let detailObjects = null;
  function addMesh(mesh) {
    detailObjects?.add(mesh);
    mesh.userData.owner ??= current;
    if (mesh.isPointLight) mesh.position.y += terrainAt(anchorHeight,mesh.position.x,mesh.position.z);
    scene.add(mesh);
    return mesh;
  }
  function texture(key, w, h, draw, scale = [1, 1], opts = {}) { if (!customTex.has(key)) { const r = T.custom(key, w, h, draw, scale, opts); customTex.set(key, { ...r, transparent: !!opts.transparent, doubleSide: !!opts.doubleSide }); } return key; }
  function material(key, m) { customMats.set(key, m); materials.set('cm:' + key, m); return key; }
  function mapMark(o) { mapMarks.push({ place: current, ...o }); }
  function osmBuilding(id) { return osm.buildings.filter(b => b.id === id); }
  function osmFind(pred) { return osm.buildings.filter(pred); }
  function claim(ids) { for (const id of [].concat(ids)) claims.add(id); }
  function rand(seed = 1) { let s = Math.abs(Math.floor(seed * 9301 + 49297)) % 233280 || 1; return () => (s = (s * 9301 + 49297) % 233280) / 233280; }

  // ---------- finalize ----------
  // ---------- render cells ----------
  // Every face is sorted into a cell so the renderer can skip what the camera cannot see, without removing any
  // geometry: 'U' = enclosed underground space of an indoor place (face centre below -1.5 m, a ceiling above it,
  // built by one of the INDOOR modules — open road underpasses, river passages and open ramps stay outside),
  // 'o' = everything else. cull() hides 'U' from far above ground and far outdoor tiles while you are deep inside
  // an enclosed underground space. (An upper-floor interior class was tried and dropped: from the street it
  // hid facade glass, terraces and interiors seen through glass.)
  const INDOOR = new Set(['gotomall', 'station', 'shinsegae', 'centralcity', 'gyeongbu', 'jwmarriott', 'banpo_shoppingtown', 'newcore', 'banwon', 'gyeongbu_east']);
  const CELL_TILE = 128;
  function classify(cx, cy, cz, owner) {
    if (cy >= -1.5 || !INDOOR.has(owner)) return 'o';
    return phys.ceilingAbove(cx, cz, cy + 0.05, cy + 9) < Infinity ? 'U' : 'o';
  }
  const cullList = [];
  function track(m, cell) {
    detailObjects?.add(m);
    if (!m.geometry.boundingBox) m.geometry.computeBoundingBox();
    let bb = m.geometry.boundingBox;
    if (m.isInstancedMesh) {
      m.computeBoundingBox(); m.computeBoundingSphere(); bb = m.boundingBox;
      // Kit batches store world-space instance origins under an identity root.
      // The shader moves each rigid tree/person by the grade at that origin.
      const matrices = m.instanceMatrix.array;
      let low = Infinity, high = -Infinity;
      for (let i = 0; i < m.count; i++) {
        const h = relief(matrices[16*i+12], matrices[16*i+14]);
        low = Math.min(low,h); high = Math.max(high,h);
      }
      if (m.count) {
        m.boundingSphere.center.y += (low+high)/2;
        m.boundingSphere.radius += (high-low)/2;
        bb.min.y += low; bb.max.y += high;
      }
    }
    m.userData.cell = cell; m.userData.bb = [bb.min.x, bb.min.z, bb.max.x, bb.max.z];
    cullList.push(m);
  }
  let last = { x: 1e9, y: 1e9, z: 1e9, n: 0 }, under = false;
  // x, y, z = camera (eye) position. "Underground" means: eye below -1 m, a ceiling over the head and standing in a
  // zone of an indoor place — so stairs, open ramps and road underpasses never count.
  const lodList = [], wheelBatches = [];
  // Keep the original garage batch intact until a covered interior first needs
  // per-car visibility. Include all four separately levelled wheel transforms.
  function prepareParkedBounds(group) {
    const {paint, trim, near, far, source, vehicles} = group;
    group.bodyMatrices = paint.instanceMatrix.array.slice();
    group.bodyColors = paint.instanceColor.array.slice();
    group.shown = new Uint8Array(vehicles.length).fill(1);
    const body = new THREE.Box3(), wheel = new THREE.Box3();
    for (const [mesh, shape] of [[paint,body], [trim,body], [near,wheel], [far,wheel]]) {
      if (!mesh.geometry.boundingBox) mesh.geometry.computeBoundingBox();
      shape.union(mesh.geometry.boundingBox);
    }
    const matrix = new THREE.Matrix4(), transformed = new THREE.Box3();
    group.bounds = vehicles.map((_, index) => {
      const box = body.clone().applyMatrix4(matrix.fromArray(group.bodyMatrices, 16*index));
      for (let j = 0; j < 4; j++) {
        matrix.fromArray(source, 16*(4*index+j));
        box.union(transformed.copy(wheel).applyMatrix4(matrix));
      }
      return box.expandByScalar(.015);
    });
  }

  function updateParkedFleet(x, z, frustum) {
    // Share visibility across each car's parts. Track its tire LOD even while
    // hidden so a camera turn preserves the original distance hysteresis.
    for (const group of wheelBatches) {
      const {paint,trim,near,far,source,vehicles,close} = group;
      if (frustum && !group.bounds) prepareParkedBounds(group);
      let changed = false, bodyChanged = false;
      for (let i=0;i<vehicles.length;i++) {
        const car = vehicles[i], dx = car.x-x, dz = car.z-z;
        const nearWheel = Number(dx*dx+dz*dz < (close[i] === 1 ? 68 : 62)**2);
        if (close[i] !== nearWheel) { close[i] = nearWheel; changed = true; }
        if (group.shown) {
          const shown = Number(!frustum || frustum.intersectsBox(group.bounds[i]));
          if (group.shown[i] !== shown) { group.shown[i] = shown; bodyChanged = changed = true; }
        }
      }
      if (!changed) continue;
      near.count = far.count = 0;
      if (bodyChanged) paint.count = trim.count = 0;
      for (let i=0;i<vehicles.length;i++) {
        if (group.shown && !group.shown[i]) continue;
        if (bodyChanged) {
          const matrix = group.bodyMatrices.subarray(16*i, 16*(i+1));
          paint.instanceMatrix.array.set(matrix, 16*paint.count);
          trim.instanceMatrix.array.set(matrix, 16*trim.count);
          paint.instanceColor.array.set(group.bodyColors.subarray(3*i, 3*(i+1)), 3*paint.count);
          paint.count++;
          trim.count++;
        }
        const batch = close[i] ? near : far;
        batch.instanceMatrix.array.set(source.subarray(64*i,64*(i+1)),16*batch.count);
        batch.count += 4;
      }
      near.instanceMatrix.needsUpdate = far.instanceMatrix.needsUpdate = true;
      if (bodyChanged) {
        paint.instanceMatrix.needsUpdate = trim.instanceMatrix.needsUpdate = true;
        paint.instanceColor.needsUpdate = true;
      }
    }
  }

  const parkedFrustum = new THREE.Frustum(), projection = new THREE.Matrix4(), lastProjection = new THREE.Matrix4();
  let clippedParkedFleet = false;
  let roofX, roofY, roofZ;
  function updateParkedView(x, z, camera, refresh) {
    if (camera && (under || streetView)) {
      camera.updateWorldMatrix(true, false);
      projection.multiplyMatrices(camera.projectionMatrix, camera.matrixWorldInverse);
      if (!refresh && clippedParkedFleet && projection.equals(lastProjection)) return;
      lastProjection.copy(projection);
      parkedFrustum.setFromProjectionMatrix(projection);
      updateParkedFleet(x, z, parkedFrustum);
      clippedParkedFleet = true;
    } else if (refresh || clippedParkedFleet) {
      updateParkedFleet(x, z, null);
      clippedParkedFleet = false;
    }
  }

  function lodUpdate(x, z) {
    for (const m of lodList) {
      const bb = m.userData.bb || m.userData.lodBB || (m.userData.lodBB = (() => { const b = new THREE.Box3(), M = new THREE.Matrix4(), V = new THREE.Vector3(); for (let i = 0; i < m.count; i++) { m.getMatrixAt(i, M); b.expandByPoint(V.setFromMatrixPosition(M)); } return [b.min.x, b.min.z, b.max.x, b.max.z]; })());
      const dx = x < bb[0] ? bb[0] - x : x > bb[2] ? x - bb[2] : 0, dz = z < bb[1] ? bb[1] - z : z > bb[3] ? z - bb[3] : 0;
      const g = Math.hypot(dx, dz) > (m.userData.lodDistance ?? 150) ? m.userData.lod[1] : m.userData.lod[0];
      if (m.geometry !== g) m.geometry = g;
    }
  }
  function cull(x, y, z, force = false, camera = null) {
    const refresh = force || Math.abs(x-last.x) + Math.abs(y-last.y) + Math.abs(z-last.z) >= 1.5 || ++last.n >= 30;
    // A step that leaves a narrow stair opening can be smaller than the tile
    // update interval. Check the actual eye position as it crosses that edge.
    if (refresh || ((under || (camera && y < -1)) && (x !== roofX || y !== roofY || z !== roofZ))) {
      const zone = y < -1 && phys.zoneAt(x, y-1.5, z);
      under = !!zone && INDOOR.has(zone.place) && phys.ceilingAbove(x, z, y, y+8) < Infinity;
      roofX = x; roofY = y; roofZ = z;
    }
    updateParkedView(x, z, camera, refresh);
    if (!refresh) return;
    last = { x, y, z, n: 0 };
    lodUpdate(x, z);
    updateDetailLayers(x, y, z);
    for (const m of cullList) {
      const d = m.userData, bb = d.bb;
      if (d.cell === 'o' && !under) { m.visible = true; continue; }
      const dx = x < bb[0] ? bb[0] - x : x > bb[2] ? x - bb[2] : 0, dz = z < bb[1] ? bb[1] - z : z > bb[3] ? z - bb[3] : 0, dist = Math.hypot(dx, dz);
      m.visible = d.cell === 'o' ? dist < 120 : (under ? dist < 320 : dist < 100);
    }
  }
  // ---------- texture arrays for opaque textures ----------
  const texArrays = [];
  const dummyMap = new THREE.DataTexture(new Uint8Array([255, 255, 255, 255]), 1, 1); dummyMap.needsUpdate = true;
  function buildTexArrays(keys) {
    const groups = new Map(), layers = new Map();
    for (const k of keys) {
      let src;
      if (k.startsWith('tex:')) src = T.surface(k.slice(4)).tex;
      else if (k.startsWith('ctex:')) { const c = customTex.get(k.slice(5)); if (!c || c.transparent || c.doubleSide) continue; src = c.tex; }
      else continue;
      const img = src.image; if (!img || !img.width || src.wrapS !== THREE.RepeatWrapping) continue;
      const gk = img.width + 'x' + img.height; if (!groups.has(gk)) groups.set(gk, []); groups.get(gk).push({ k, img });
    }
    for (const [, list] of groups) {
      if (list.length < 3) continue; // tiny groups gain nothing; they keep their own texture
      const w = list[0].img.width, h = list[0].img.height, data = new Uint8Array(w * h * 4 * list.length);
      list.forEach(({ k, img }, li) => {
        const px = img.getContext('2d').getImageData(0, 0, w, h).data;
        if (px.length === w * h * 4) for (let r = 0; r < h; r++) data.set(px.subarray(r * w * 4, (r + 1) * w * 4), (li * h + (h - 1 - r)) * w * 4); // flip: canvas top = v 1
        layers.set(k, { arr: texArrays.length, layer: li });
      });
      const t = new THREE.DataArrayTexture(data, w, h, list.length);
      t.wrapS = t.wrapT = THREE.RepeatWrapping; t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = maxAniso;
      t.generateMipmaps = true; t.minFilter = THREE.LinearMipmapLinearFilter; t.magFilter = THREE.LinearFilter; t.needsUpdate = true;
      texArrays.push(t);
    }
    return layers;
  }
  // These batches have plain, world-space Float32 positions and no morph targets.
  // Use the same box centre and furthest vertex as Three, sharing the box pass.
  function setStaticBounds(geometry, positions) {
    let minX = Infinity, minY = Infinity, minZ = Infinity;
    let maxX = -Infinity, maxY = -Infinity, maxZ = -Infinity;
    for (let i = 0; i < positions.length; i += 3) {
      const x = positions[i], y = positions[i+1], z = positions[i+2];
      minX = Math.min(minX, x); minY = Math.min(minY, y); minZ = Math.min(minZ, z);
      maxX = Math.max(maxX, x); maxY = Math.max(maxY, y); maxZ = Math.max(maxZ, z);
    }
    const box = new THREE.Box3(new THREE.Vector3(minX, minY, minZ), new THREE.Vector3(maxX, maxY, maxZ));
    const center = box.getCenter(new THREE.Vector3());
    let maxRadiusSq = 0;
    for (let i = 0; i < positions.length; i += 3) {
      const dx = positions[i]-center.x, dy = positions[i+1]-center.y, dz = positions[i+2]-center.z;
      maxRadiusSq = Math.max(maxRadiusSq, dx*dx + dy*dy + dz*dz);
    }
    geometry.boundingBox = box;
    geometry.boundingSphere = new THREE.Sphere(center, Math.sqrt(maxRadiusSq));
  }
  const aLayers = new Map();
  function finalize() { for (const p of atlas.pages) p.t.needsUpdate = true; return flush(); }
  // merge everything emitted since the last flush into meshes (the initial build, then each lazy detail group)
  function flush() {
    const usedKeys = new Set(); for (const [, b] of buckets) if (!aLayers.has(b.key)) usedKeys.add(b.key);
    for (const [k, v] of buildTexArrays(usedKeys)) aLayers.set(k, v);
    // two passes: classify every primitive and count, then fill typed arrays directly (no big JS arrays)
    const subs = new Map(), plan = [];
    for (const [, b] of buckets) {
      if (!b.prim.length) continue;
      const P = b.pos, ar = aLayers.get(b.key) || null, which = new Array(b.prim.length);
      const materialKey = ar ? 'arr:' + ar.arr : b.key;
      let previousCell, previousX, previousZ, sub;
      let vo = 0, pi = 0;
      for (const signedCount of b.prim) {
        const nv = Math.abs(signedCount);
        let cx = 0, cy = 0, cz = 0; for (let k = 0; k < nv; k++) { cx += P[(vo + k) * 3]; cy += P[(vo + k) * 3 + 1]; cz += P[(vo + k) * 3 + 2]; }
        cx /= nv; cy /= nv; cz /= nv;
        const cell = classify(cx, cy, cz, b.own[pi]);
        if (stats.byOwner) stats.byOwner[b.own[pi]] = (stats.byOwner[b.own[pi]] || 0) + (nv === 4 ? 2 : 1);
        // Buckets already group by the first vertex's tile. Most successive
        // face centres land in the same output cell, including faces on a wall.
        const tileSize = cell === 'o' ? TILE : CELL_TILE;
        const tileX = Math.floor(cx/tileSize), tileZ = Math.floor(cz/tileSize);
        if (cell !== previousCell || tileX !== previousX || tileZ !== previousZ) {
          const key = materialKey + '|' + cell + '|' + tileX + ',' + tileZ;
          sub = subs.get(key);
          if (!sub) {
            sub = { key: materialKey, cell, nv: 0, ni: 0, rect: !!ar };
            subs.set(key, sub);
          }
          previousCell = cell; previousX = tileX; previousZ = tileZ;
        }
        sub.nv += nv; sub.ni += nv === 4 ? 6 : 3; which[pi++] = sub; vo += nv;
      }
      plan.push({ b, ar, which });
    }
    for (const [, s] of subs) {
      s.pos = new Float32Array(s.nv * 3); s.nor = new Float32Array(s.nv * 3); s.uv = new Float32Array(s.nv * 2); s.col = new Float32Array(s.nv * 3);
      s.idx = s.nv > 65535 ? new Uint32Array(s.ni) : new Uint16Array(s.ni); if (s.rect) s.rect = new Float32Array(s.nv);
      s.v = 0; s.i = 0;
    }
    for (const { b, ar, which } of plan) {
      const P = b.pos, N = b.nor, U = b.uv, C = b.col;
      let vo = 0, pi = 0;
      for (const signedCount of b.prim) {
        const nv = Math.abs(signedCount);
        const faceOffset = pi*3, s = which[pi++];
        const base = s.v, datum = b.anchors?.get(pi-1);
        for (let k = 0; k < nv; k++) {
          const v = vo + k, d = s.v++;
          s.pos[d * 3] = P[v * 3]; s.pos[d * 3 + 1] = P[v * 3 + 1] + terrainAt(datum,P[v*3],P[v*3+2]); s.pos[d * 3 + 2] = P[v * 3 + 2];
          s.nor[d * 3] = N[faceOffset]; s.nor[d * 3 + 1] = N[faceOffset+1]; s.nor[d * 3 + 2] = N[faceOffset+2];
          s.uv[d * 2] = U[v * 2]; s.uv[d * 2 + 1] = U[v * 2 + 1];
          s.col[d * 3] = C[faceOffset]; s.col[d * 3 + 1] = C[faceOffset+1]; s.col[d * 3 + 2] = C[faceOffset+2];
          if (ar) s.rect[d] = ar.layer;
        }
        // Grade the lighting of level road, paving, roofs and park faces as
        // well as their silhouette. Survey clipping made each such face planar.
        if (datum === undefined && Math.abs(N[faceOffset+1]) > .999 && P[vo*3+1] === P[vo*3+4] && P[vo*3+1] === P[vo*3+7]) {
          const v = 3*base, p = s.pos;
          const ax = p[v+3]-p[v], ay = p[v+4]-p[v+1], az = p[v+5]-p[v+2];
          const bx = p[v+6]-p[v], by = p[v+7]-p[v+1], bz = p[v+8]-p[v+2];
          if (ay || by) {
            const nx = ay*bz-az*by, ny = az*bx-ax*bz, nz = ax*by-ay*bx;
            const length = Math.hypot(nx,ny,nz);
            if (Math.abs(ny) > 1e-8 && length) {
              const scale = Math.sign(ny * N[faceOffset+1]) / length;
              for (let d=v; d<v+3*nv; d+=3) {
                s.nor[d] = nx*scale; s.nor[d+1] = ny*scale; s.nor[d+2] = nz*scale;
              }
            }
          }
        }
        const flip = signedCount < 0;
        s.idx[s.i++] = base;
        s.idx[s.i++] = base + (flip ? 2 : 1);
        s.idx[s.i++] = base + (flip ? 1 : 2);
        if (nv === 4) {
          s.idx[s.i++] = base;
          s.idx[s.i++] = base + (flip ? 3 : 2);
          s.idx[s.i++] = base + (flip ? 2 : 3);
        }
        vo += nv;
      }
    }
    buckets.clear();
    const out = [];
    for (const [, s] of subs) {
      const g = new THREE.BufferGeometry();
      g.setAttribute('position', new THREE.BufferAttribute(s.pos, 3));
      g.setAttribute('normal', new THREE.BufferAttribute(s.nor, 3));
      g.setAttribute('uv', new THREE.BufferAttribute(s.uv, 2));
      g.setAttribute('color', new THREE.BufferAttribute(s.col, 3));
      if (s.rect) g.setAttribute('layer', new THREE.BufferAttribute(s.rect, 1));
      g.setIndex(new THREE.BufferAttribute(s.idx, 1));
      setStaticBounds(g, s.pos);
      // Static coordinates now include their surveyed elevation. Culling,
      // bounding volumes and rendering all use the same world-space mesh.
      const material = matFor(s.key);
      material.defines ||= {};
      material.defines.BANPO_RIGID = 1;
      const m = new THREE.Mesh(g, material);
      if (s.key === 'glass' || s.key === 'water') m.renderOrder = 2;
      m.matrixAutoUpdate = false; m.updateMatrix();
      // Custom shader materials may move their vertices beyond the kit bounds.
      if (!s.key.startsWith('cm:') && s.key !== 'hanRiver') {
        // A whole sales floor can share one material batch. Keep Three's ordinary
        // culling for small interior meshes, then clip long runs in the large ones.
        staticVisibility.attach(m,!streetView || s.cell !== 'o');
      }
      scene.add(m); out.push(m); track(m, s.cell);
    }
    pruneMeshes();
    streetVisibility?.batchLandings(fixedEscalators,detailObjects,relief);
    splitModuleInstances();
    buildInstanced();
    return out;
  }
  let treesDone = 0, peopleDone = 0, parkedDone = 0;
  // group instances by cell + tile so each group can be frustum-culled and cell-culled on its own
  function groupBy(n, at, tile = TILE) {
    const groups = new Map();
    for (let i = 0; i < n; i++) {
      const [x, y, z, owner] = at(i); const cell = classify(x, y + 0.9, z, owner), T2 = cell === 'o' ? tile : Math.min(CELL_TILE, tile);
      const k = cell + '|' + Math.floor(x / T2) + ',' + Math.floor(z / T2); if (!groups.has(k)) groups.set(k, { cell, idx: [] }); groups.get(k).idx.push(i);
    }
    return [...groups.values()];
  }
  // meshes a module added itself (K.addMesh / instanced props): drop those outside the area, compact instanced ones
  function pruneMeshes() {
    if (!keep) return;
    const M = new THREE.Matrix4(), V = new THREE.Vector3(), C = new THREE.Color();
    for (const o of detailObjects || scene.children.slice()) {
      if (!o.userData.owner || o.userData.areaChecked || !(o.isMesh || o.isInstancedMesh || o.isGroup || o.isObject3D) || o.isLight || o.isCamera) continue;
      o.userData.areaChecked = true; o.updateMatrixWorld(true);
      const own = o.userData.owner;
      if (o.isInstancedMesh && !o.userData.dynamic) {
        const kept = [];
        for (let i = 0; i < o.count; i++) { o.getMatrixAt(i, M); V.setFromMatrixPosition(M).applyMatrix4(o.matrixWorld); if (keep(own, V.x, V.y, V.z, 0)) kept.push(i); }
        if (!kept.length) { scene.remove(o); continue; }
        if (kept.length < o.count) { kept.forEach((src, j) => { o.getMatrixAt(src, M); o.setMatrixAt(j, M); if (o.instanceColor) { o.getColorAt(src, C); o.setColorAt(j, C); } }); o.count = kept.length; o.instanceMatrix.needsUpdate = true; if (o.instanceColor) o.instanceColor.needsUpdate = true; }
        continue;
      }
      const box = new THREE.Box3().setFromObject(o); if (box.isEmpty()) continue;
      box.getCenter(V);
      if (!keep(own, V.x, V.y, V.z, 0) && !keep(own, V.x, box.max.y, V.z, 0)) scene.remove(o);
    }
  }
  function splitModuleInstances() {
    const M = new THREE.Matrix4(), C = new THREE.Color();
    for (const im of detailObjects || scene.children.slice()) {
      if (im.parent !== scene || !im.isInstancedMesh || im.count < 64 || im.userData.dynamic || im.userData.split) continue;
      const e = im.instanceMatrix.array;
      for (const g of groupBy(im.count, i => [e[i * 16 + 12], e[i * 16 + 13], e[i * 16 + 14], im.userData.owner])) {
        const nm = new THREE.InstancedMesh(im.geometry, im.material, g.idx.length);
        g.idx.forEach((src, j) => { im.getMatrixAt(src, M); nm.setMatrixAt(j, M); if (im.instanceColor) { im.getColorAt(src, C); nm.setColorAt(j, C); } });
        nm.instanceMatrix.needsUpdate = true; if (nm.instanceColor) nm.instanceColor.needsUpdate = true;
        nm.frustumCulled = im.frustumCulled; nm.renderOrder = im.renderOrder; nm.userData.split = true; scene.add(nm); track(nm, g.cell);
      }
      scene.remove(im);
    }
  }
  function buildInstanced() {
    const M = new THREE.Matrix4(), Q = new THREE.Quaternion(), S = new THREE.Vector3(), V = new THREE.Vector3(), C = new THREE.Color();
    if (parked.length > parkedDone) {
      const start = parkedDone;
      parkedDone = parked.length;
      const axis = new THREE.Vector3(0, 1, 0);
      const groups = groupBy(parked.length - start, i => {
        const v = parked[start + i]; return [v.x, v.y, v.z, v.place];
      });
      for (const group of groups) {
        const kinds = new Map();
        for (const i of group.idx) {
          const v = parked[start + i];
          if (!kinds.has(v.kind)) kinds.set(v.kind, []);
          kinds.get(v.kind).push(v);
        }
        for (const [kind, list] of kinds) {
          const meshes = fleetInstances(THREE, kind, list.length, {separateWheels:true});
          const [paint,trim,tires] = meshes;
          tires.name = kind + ' wheels';
          const [halfTrack,halfAxle] = vehicleContacts(kind);
          const hubTurn = new THREE.Quaternion().setFromAxisAngle(axis, Math.PI);
          const leftFacing = new THREE.Quaternion();
          S.set(1,1,1);
          list.forEach((v, i) => {
            Q.setFromAxisAngle(axis,v.rotY).premultiply(v.tilt);
            M.compose(V.set(v.x,v.wheels.height,v.z),Q,S);
            paint.setMatrixAt(i,M); trim.setMatrixAt(i,M);
            paint.setColorAt(i,C.setHex(v.color));
            leftFacing.copy(Q).multiply(hubTurn);
            const sin=Math.sin(v.rotY), cos=Math.cos(v.rotY);
            for (let j=0; j<4; j++) {
              const across=(j%2 ? 1 : -1)*halfTrack, along=(j<2 ? -1 : 1)*halfAxle;
              V.set(v.x+across*cos+along*sin,v.wheels[j],v.z-across*sin+along*cos);
              tires.setMatrixAt(i*4+j,M.compose(V,j%2 ? Q : leftFacing,S));
            }
          });
          for (const mesh of meshes) {
            mesh.userData.parkedFleet = true;
            mesh.userData.split = true;
            mesh.computeBoundingSphere();
            scene.add(mesh);
            track(mesh, group.cell);
            if (mesh === tires) {
              const far = new THREE.InstancedMesh(mesh.userData.lod[1],mesh.material,mesh.count);
              far.name = kind + ' distant wheels';
              far.userData.parkedFleet = far.userData.split = true;
              far.instanceMatrix.array.set(mesh.instanceMatrix.array);
              scene.add(far);
              track(far,group.cell);
              far.count = 0;
              wheelBatches.push({paint,trim,near:mesh,far,source:mesh.instanceMatrix.array.slice(),vehicles:list,close:new Uint8Array(list.length).fill(255)});
            }
          }
        }
      }
    }
    if (trees.length > treesDone) {
      const first = treesDone;
      treesDone = trees.length;
      for (const group of groupBy(treesDone - first, i => {
        const t = trees[first + i]; return [t.x, t.y, t.z, t.place];
      })) {
        for (const mesh of treeInstances(THREE, group.idx.map(i => trees[first + i]))) {
          scene.add(mesh);
          track(mesh, group.cell);
          lodList.push(mesh);
        }
      }
    }
    if (people.length > peopleDone) {
      const start = peopleDone;
      peopleDone = people.length;
      for (const group of groupBy(peopleDone-start, i => {
        const p = people[start+i]; return [p.x,p.y,p.z,p.place];
      }, 96)) {
        for (const mesh of visitorInstances(THREE,people,group.idx.map(i => start+i))) {
          scene.add(mesh);
          track(mesh,group.cell);
          clipVisitors(mesh);
          lodList.push(mesh);
        }
      }
    }
  }

  // ---------- lazy detail groups ----------
  // K.detail({floor, y0, y1, poly|rect}, fn): fn builds furnishing detail (stock, furniture, fixtures, signage,
  // people) for one floor area and runs only when the camera comes near — floors stay light until visited.
  // Structure that must exist before you arrive (slabs, walls, stairs, escalators, elevators, zones, spawns,
  // junctions) belongs in the normal build, not in a detail group. An optional
  // visibleFrom(x,y,z) tests a solid room partition in the same terrain-relative frame as y0/y1.
  const details = []; const detailErrors = [];
  function detail(o, fn) {
    let poly = o.poly; if (!poly && o.rect) { const [x0, z0, x1, z1] = o.rect; poly = [[x0, z0], [x1, z0], [x1, z1], [x0, z1]]; }
    const bb = poly ? polyBBox(poly) : [-1e9, -1e9, 1e9, 1e9];
    const datum = anchorHeight;
    if (datum !== null) {
      const draw = fn;
      fn = kit => withTerrainSurface(datum,() => draw(kit));
    }
    const rectangular=poly?.length===4 && poly.every(([x,z])=>(x===bb[0]||x===bb[2]) && (z===bb[1]||z===bb[3]));
    details.push({ poly, exactDistance:!!poly&&!rectangular, owner: current, meta: perPlace[current], floor: o.floor || '', y0: o.y0 ?? -1e9, y1: o.y1 ?? 1e9, bb, fn, built: false, name: o.name || '', visibleFrom: o.visibleFrom });
  }
  function buildDetail(d) {
    if (d.built) return []; d.built = true;
    const prev = current; current = d.owner;
    detailObjects = new Set();
    try { d.fn(K); } catch (e) { detailErrors.push(`${d.owner} ${d.floor}: ${e.message}`); console.error('detail', d.owner, d.floor, e); }
    d.fn = null;
    current = prev;
    try {
      const meshes = flush();
      d.renderables = [];
      for (const root of detailObjects) {
        if (!root.parent) continue; // discarded by area pruning or replaced by a tiled instance batch
        root.traverse(o => {
          if ((o.isMesh || o.isSprite || o.isLine || o.isLight || o.isPoints) && o.layers.isEnabled(0)) d.renderables.push(o);
        });
      }
      return meshes;
    } finally {
      detailObjects = null;
    }
  }
  function updateDetailLayers(x, y, z) {
    for (const d of details) {
      if (!d.renderables?.length) continue;
      // Floors on either side of a hotel atrium remain visible through its void. A solid
      // intervening slab can occlude furniture several storeys below or above the eye.
      const dx = Math.max(0, d.bb[0] - x, x - d.bb[2]), dz = Math.max(0, d.bb[1] - z, z - d.bb[3]);
      let hidden = !!d.visibleFrom && !d.visibleFrom(x,y,z);
      if (!hidden && dx === 0 && dz === 0) {
        if (y > d.y1 + 10) hidden = phys.ceilingAbove(x, z, d.y1 + .1, y) < Infinity;
        else if (y < d.y0 - 10) hidden = phys.ceilingAbove(x, z, y, d.y0 - .1) < Infinity;
      }
      if (!!d.hidden === hidden) continue;
      d.hidden = hidden;
      for (const o of d.renderables) {
        if (hidden) o.layers.disable(0);
        else o.layers.enable(0);
      }
    }
  }
  const viewFrustum = new THREE.Frustum(), viewMatrix = new THREE.Matrix4(), viewBox = new THREE.Box3();
  let waiting = [], lastView = null;
  function visibleDetail(d, x, y, z, camera, distance, vertical) {
    const [x0,z0,x1,z1] = d.bb;
    const shift = camera.position.y - y;
    // A little space around the view preloads a storefront as it turns into
    // frame. Always prepare furniture directly beside the player for collision.
    if (distance > 8*8 || vertical > 0) {
      viewBox.min.set(x0-3, d.y0+shift-2, z0-3);
      viewBox.max.set(x1+3, d.y1+shift+2, z1+3);
      if (!viewFrustum.intersectsBox(viewBox)) return false;
    }
    if (vertical <= .25 || !d.poly) return true;
    const targetY = y < d.y0 ? d.y0+.3 : Math.max(d.y0+.2,d.y1-1);
    const cx = (x0+x1)/2, cz = (z0+z1)/2;
    if (!phys.ceilingBlocksView(x,y,z,cx,targetY,cz)) return true;
    for (const [px,pz] of d.poly) {
      if (!phys.ceilingBlocksView(x,y,z,px*.92+cx*.08,targetY,pz*.92+cz*.08)) return true;
    }
    return false;
  }
  // Unrestricted callers (fixtures, stills and all-detail checks) use the
  // geometry range alone. Interactive callers also supply their actual camera.
  function ensureDetail(x, y, z, reach = 45, budgetMs = Infinity, camera = null) {
    const t0 = performance.now();
    const viewChanged = !camera || !lastView || lastView.count !== details.length ||
      lastView.reach !== reach || Math.hypot(x-lastView.x,z-lastView.z) > 1.25 ||
      Math.abs(y-lastView.y) > .35 || camera.quaternion.angleTo(lastView.direction) > .065 ||
      camera.aspect !== lastView.aspect || camera.fov !== lastView.fov;
    if (viewChanged) {
      if (camera) {
        camera.updateWorldMatrix(true,false);
        viewFrustum.setFromProjectionMatrix(viewMatrix.multiplyMatrices(camera.projectionMatrix,camera.matrixWorldInverse));
        lastView = {x,y,z,reach,count:details.length,direction:camera.quaternion.clone(),aspect:camera.aspect,fov:camera.fov};
      } else lastView = null;
      waiting = [];
      for (const d of details) {
        if (d.built || (keepDetail && !keepDetail(d))) continue;
        const dx = Math.max(0, d.bb[0]-x, x-d.bb[2]), dz = Math.max(0, d.bb[1]-z, z-d.bb[3]);
        const vertical = Math.max(0, d.y0-y, y-d.y1);
        let distance = dx*dx+dz*dz;
        if (distance > reach*reach || vertical > 8) continue;
        if (camera && d.exactDistance) {
          distance=distanceToPolygonSq(x,z,d.poly);
          if(distance>reach*reach)continue;
        }
        if (camera && ((d.visibleFrom && !d.visibleFrom(x,y,z)) || !visibleDetail(d,x,y,z,camera,distance,vertical))) continue;
        waiting.push({d,vertical,distance});
      }
      // Pop from the end while preserving registration order for equal priorities.
      waiting.reverse().sort((a,b) => b.vertical-a.vertical || b.distance-a.distance);
    }
    let n = 0;
    while (waiting.length) {
      const {d} = waiting.pop();
      if (d.built) continue;
      buildDetail(d); n++;
      if (performance.now() - t0 >= budgetMs) break;
    }
    if (n) cull(x,y,z,true);
    return n;
  }
  function buildAllDetail() { for (const d of details) if (!keepDetail || keepDetail(d)) buildDetail(d); }

  const K = {
    THREE, scene, phys, osm, LEVELS, T, withTerrainAnchor, withTerrainSurface, withParkedVehicle,
    box, prism, slab, wall, polyWalls, ramp, stairs: (ax, az, bx, bz, o = {}) => ramp(ax, az, bx, bz, { ...o, steps: true }), escalator, cyl, dome, sign, floorText,
    tree, person, crowd, vehicle, zone, spawn, interact, portal, elevator, groundHole, onFrame, addMesh, texture, material, mapMark, detail,
    osmBuilding, osmFind, claim, rand, quad: (mat, p, n, uvs) => quad(spec(mat), p, n, uvs || [[0, 0], [1, 0], [1, 1], [0, 1]]), hpoly: (mat, poly, y, up = true, holes) => hpoly(spec(mat), poly, y, up, holes),
    triangle: (mat, points, normal, uv) => tri(spec(mat), points, normal, uv),
    pointInPoly, polyBBox, polyArea, orient,
    // internals for engine
    _: { bounce, cull, cullList, finalize, details, detailErrors, ensureDetail, buildAllDetail, frameFns, interactables, spawns, zonesList, elevators, claims, mapMarks, groundHoles, stats, atlas, trees, people, setCurrent: (id, meta) => { current = id; if (meta) perPlace[id] = meta; } },
  };
  return K;
}
