// Apartment and neighbourhood models reused from the user's seoul-real-estate-map (js/places/_re_models.json, assets/re/*.glb,
// made by tools/import_re_models.mjs). Exterior only: you do not walk into them; the OSM outlines they replace stay solid.
// The page shows a plain block for each model right away and swaps in the real model as it arrives (nearest first).
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { MeshoptDecoder } from 'three/addons/libs/meshopt_decoder.module.js';
import { maxReliefInBounds, relief } from './banpo_relief.js';
import { pointInPoly, polyBBox } from './physics.js';

// Keep windows, roof lines and adjoining facade panels on the same footing.
// Only the foot of the model follows the ground around its outline.
function facadeMaterial(mat, elevation) {
  mat.defines = { ...mat.defines, BANPO_RIGID: 1 };
  if (elevation === undefined) mat.defines.FOOTPRINT_HEIGHT_ATTRIBUTE = 1;
  mat.onBeforeCompile = shader => {
    shader.uniforms.foundationLevel = { value: elevation ?? 0 };
    shader.vertexShader = `#ifdef FOOTPRINT_HEIGHT_ATTRIBUTE
attribute float foundationLevel;
#else
uniform float foundationLevel;
#endif
` + shader.vertexShader.replace('#include <project_vertex>', `#include <project_vertex>
vec3 facadePoint = (modelMatrix * vec4(transformed, 1.0)).xyz;
float toe = banpoHeight(facadePoint.xz);
float plinth = max(1.0, abs(foundationLevel - toe) * 2.0);
mvPosition += viewMatrix[1] * mix(toe, foundationLevel, smoothstep(0.0, plinth, facadePoint.y));
gl_Position = projectionMatrix * mvPosition;`);
  };
  return mat;
}

// Three tests undeformed mesh bounds against the camera before running the
// vertex shader. Pad each instance in world metres, including podiums that
// share a foundation lying beyond their own bounds.
function fitTerrainBounds(THREE, root, levels) {
  const box = new THREE.Box3().setFromObject(root);
  if (box.isEmpty()) return;
  const pad = Math.max(maxReliefInBounds(box.min.x, box.min.z, box.max.x, box.max.z), ...levels.map(Math.abs));
  root.traverse(mesh => {
    if (!mesh.isMesh) return;
    const geometry = mesh.geometry;
    if (!geometry.boundingSphere) geometry.computeBoundingSphere();
    mesh.boundingSphere = geometry.boundingSphere.clone();
    const scale = mesh.matrixWorld.getMaxScaleOnAxis();
    if (scale > 0) mesh.boundingSphere.radius += pad / scale;
  });
}

function footprintLevel(poly) {
  const [x0,z0,x1,z1] = polyBBox(poly);
  return relief((x0+x1)/2, (z0+z1)/2);
}

// Some apartment GLBs merge several freestanding towers into one mesh.
// Attach facade vertices to the nearest mapped footprint, including balconies
// just outside the outline. Nearby vertices normally share the same metre cell.
function estateLevels(sites) {
  const cache = new Map();
  return (x,z) => {
    x = Math.floor(x) + .5;
    z = Math.floor(z) + .5;
    const key = x*65536 + z;
    if (cache.has(key)) return cache.get(key);
    let level, best = Infinity;
    for (const site of sites) {
      const poly = site.poly;
      if (pointInPoly(x,z,poly)) { level = site.level; break; }
      for (let i=0;i<poly.length;i++) {
        const a=poly[i], b=poly[(i+1)%poly.length];
        const dx=b[0]-a[0], dz=b[1]-a[1];
        const t=Math.max(0,Math.min(1,((x-a[0])*dx+(z-a[1])*dz)/(dx*dx+dz*dz || 1)));
        const dist=(x-a[0]-t*dx)**2 + (z-a[1]-t*dz)**2;
        if (dist<best) { best=dist; level=site.level; }
      }
    }
    cache.set(key,level);
    return level;
  };
}

// which models this page uses: everything whose footprint is near the area
export function pickReModels(data, box, margin) {
  if (!data || !data.models) return [];
  if (!box) return data.models;
  return data.models.filter(m => m.rect.some(([x, z]) => x >= box[0] - margin && x <= box[2] + margin && z >= box[1] - margin && z <= box[3] + margin));
}

// stand-ins (one merged mesh per model) and solid outlines; call before the first frame
export function reModelStandIns({ THREE, K, osm, scene, models, terrain = true }) {
  const byId = new Map(osm.buildings.map(b => [b.id, b]));
  const mat = new THREE.MeshLambertMaterial({ color: 0xd9d3c8 });
  if (terrain) facadeMaterial(mat);
  const stand = new Map();
  for (const m of models) {
    const geos = [];
    const sites = [];
    for (const id of m.claims) {
      const b = byId.get(id); if (!b) continue;
      const h = b.height || (b.levels ? b.levels * 3 : Math.max(9, m.height * 0.8));
      const P = b.poly;
      for (let i = 0; i < P.length; i++) { const a = P[i], c = P[(i + 1) % P.length]; K.phys.addWall(a[0], a[1], c[0], c[1], -0.5, h, 0.2, 'building'); }
      const shape = new THREE.Shape(P.map(([x, z]) => new THREE.Vector2(x, -z)));
      const g = new THREE.ExtrudeGeometry(shape, { depth: h, bevelEnabled: false });
      g.rotateX(-Math.PI / 2);
      if (terrain) {
        const level = footprintLevel(P);
        sites.push({poly:P, level});
        g.setAttribute('foundationLevel',new THREE.BufferAttribute(new Float32Array(g.attributes.position.count).fill(level),1));
      }
      geos.push(g);
    }
    if (!geos.length) continue;
    const mesh = new THREE.Group(); for (const g of geos) mesh.add(new THREE.Mesh(g, mat));
    if (terrain) fitTerrainBounds(THREE, mesh, sites.map(site => site.level));
    mesh.userData.sites = sites;
    scene.add(mesh); stand.set(m.id, mesh);
  }
  return stand;
}

// load the GLBs, nearest first, a few at a time; returns { update(x, z) } to hide far ones
export function loadReModels({ THREE, scene, models, stand, from, onProgress, terrain = true }) {
  const loader = new GLTFLoader(); loader.setMeshoptDecoder(MeshoptDecoder);
  const live = [];
  const queue = models.slice().sort((a, b) => Math.hypot(a.x - from.x, a.z - from.z) - Math.hypot(b.x - from.x, b.z - from.z));
  let done = 0, running = 0;
  const next = () => {
    while (running < 4 && queue.length) {
      const m = queue.shift(); running++;
      loader.load(m.file, gltf => {
        const root = gltf.scene;
        root.position.set(m.x, m.y || 0, m.z);
        root.rotation.y = (m.yaw || 0) * Math.PI / 180;
        root.updateMatrixWorld(true);
        const s = stand.get(m.id), sites = s?.userData.sites || [];
        const levels = sites.length > 1 ? estateLevels(sites) : null;
        const level = terrain && !levels ? sites[0]?.level ?? relief(m.x,m.z) : undefined;
        const point = new THREE.Vector3(), materials = new Map();
        function material(src) {
          if (materials.has(src)) return materials.get(src);
          const mat = m.sourceMaterial ? src : new THREE.MeshLambertMaterial({
            color:src.color,vertexColors:src.vertexColors,side:src.side,transparent:src.transparent,opacity:src.opacity
          });
          if (terrain) facadeMaterial(mat,level);
          materials.set(src,mat);
          return mat;
        }
        root.traverse(o => {
          if (!o.isMesh) return;
          if (levels) {
            if (o.geometry.hasAttribute('foundationLevel')) o.geometry = o.geometry.clone();
            const pos = o.geometry.attributes.position, values = new Float32Array(pos.count);
            for (let i=0;i<pos.count;i++) {
              point.fromBufferAttribute(pos,i).applyMatrix4(o.matrixWorld);
              values[i] = levels(point.x,point.z);
            }
            o.geometry.setAttribute('foundationLevel',new THREE.BufferAttribute(values,1));
          }
          o.material = Array.isArray(o.material) ? o.material.map(material) : material(o.material);
          o.matrixAutoUpdate = false;
        });
        if (terrain) fitTerrainBounds(THREE, root, levels ? sites.map(site => site.level) : [level]);
        root.userData.re = m; scene.add(root); live.push(root);
        if (s) { scene.remove(s); s.traverse(o => o.geometry && o.geometry.dispose()); stand.delete(m.id); }
        running--; done++; onProgress && onProgress(done, models.length); next();
      }, undefined, () => { running--; done++; onProgress && onProgress(done, models.length); next(); });
    }
  };
  next();
  return {
    update(x, z) { for (const r of live) { const m = r.userData.re; r.visible = Math.hypot(m.x - x, m.z - z) < 1400; } },
  };
}
