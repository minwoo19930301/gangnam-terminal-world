// Apartment and neighbourhood models reused from the user's seoul-real-estate-map (js/places/_re_models.json, assets/re/*.glb,
// made by tools/import_re_models.mjs). Exterior only: you do not walk into them; the OSM outlines they replace stay solid.
// A light silhouette is present immediately. Detailed geometry streams when its footprint appears in the view.
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js';
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

// The imported apartment palette uses one Lambert material per paint colour.
// Pack the small opaque pieces of each tower into one vertex-coloured draw,
// preserving the geometry, vertex shades and per-footprint terrain data.
function* batchFacadeParts(THREE, root, parts, terrain, level) {
  const groups = new Map(), inverse = root.matrixWorld.clone().invert();
  for (const mesh of parts) {
    const {geometry,material} = mesh;
    if (Array.isArray(material) || material.transparent || !geometry.index || !geometry.attributes.normal ||
        geometry.attributes.position.count > 12000 || mesh.matrixWorld.determinant() < 0) continue;
    yield;
    const box = new THREE.Box3().setFromObject(mesh);
    const key = [material.side, Math.floor((box.min.x+box.max.x)/240), Math.floor((box.min.z+box.max.z)/240)].join(',');
    if (!groups.has(key)) groups.set(key,[]);
    groups.get(key).push(mesh);
  }
  for (const list of groups.values()) {
    if (list.length < 2) continue;
    const vertices = list.reduce((n,m) => n+m.geometry.attributes.position.count,0);
    const indexCount = list.reduce((n,m) => n+m.geometry.index.count,0);
    const pos = new Float32Array(vertices*3), normals = new Float32Array(vertices*3);
    const colorSize = list.some(m => m.material.vertexColors && m.geometry.attributes.color?.itemSize === 4) ? 4 : 3;
    const colors = new Float32Array(vertices*colorSize);
    const foundation = list[0].geometry.attributes.foundationLevel ? new Float32Array(vertices) : null;
    const index = vertices > 65535 ? new Uint32Array(indexCount) : new Uint16Array(indexCount);
    const matrix = new THREE.Matrix4(), normal = new THREE.Matrix3(), v = new THREE.Vector3();
    let vertex = 0, face = 0;
    for (const mesh of list) {
      const g = mesh.geometry, a = g.attributes, tint = mesh.material.color;
      matrix.multiplyMatrices(inverse,mesh.matrixWorld);
      normal.getNormalMatrix(matrix);
      for (let i=0;i<a.position.count;i++) {
        if ((i & 1023) === 0) yield;
        const j=3*(vertex+i);
        v.fromBufferAttribute(a.position,i).applyMatrix4(matrix).toArray(pos,j);
        v.fromBufferAttribute(a.normal,i).applyNormalMatrix(normal).toArray(normals,j);
        if (mesh.material.vertexColors && a.color) v.fromBufferAttribute(a.color,i);
        else v.set(1,1,1);
        const k = (vertex+i)*colorSize;
        colors[k]=v.x*tint.r; colors[k+1]=v.y*tint.g; colors[k+2]=v.z*tint.b;
        if (colorSize === 4) colors[k+3] = a.color?.itemSize === 4 && mesh.material.vertexColors ? a.color.getW(i) : 1;
        if (foundation) foundation[vertex+i]=a.foundationLevel.getX(i);
      }
      for (let i=0;i<g.index.count;i++) index[face++]=vertex+g.index.getX(i);
      vertex+=a.position.count;
      mesh.removeFromParent();
    }
    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position',new THREE.BufferAttribute(pos,3));
    geometry.setAttribute('normal',new THREE.BufferAttribute(normals,3));
    geometry.setAttribute('color',new THREE.BufferAttribute(colors,colorSize));
    if (foundation) geometry.setAttribute('foundationLevel',new THREE.BufferAttribute(foundation,1));
    geometry.setIndex(new THREE.BufferAttribute(index,1));
    const material = new THREE.MeshLambertMaterial({vertexColors:true,side:list[0].material.side});
    if (terrain) facadeMaterial(material,level);
    const batch = new THREE.Mesh(geometry,material);
    batch.name = 'Apartment facade';
    batch.matrixAutoUpdate = false;
    root.add(batch);
  }
}

// which models this page uses: everything whose footprint is near the area
export function pickReModels(data, box, margin) {
  if (!data || !data.models) return [];
  if (!box) return data.models;
  return data.models.filter(m => {
    const [x0,z0,x1,z1] = polyBBox(m.rect);
    return x1>=box[0]-margin && x0<=box[2]+margin && z1>=box[1]-margin && z0<=box[3]+margin;
  });
}

// Towers without an OSM polygon carry a tiny simplified version of the source mesh.
function skylineGeometry(THREE, model) {
  const [coordinates, triangles] = model.silhouette.map(base64 => Uint8Array.from(atob(base64), c=>c.charCodeAt(0)));
  const view = new DataView(coordinates.buffer), xyz = new Float32Array(coordinates.length/2);
  for (let i=0;i<xyz.length;i++) xyz[i]=view.getInt16(i*2,true)/4;
  const indexed = new THREE.BufferGeometry();
  indexed.setAttribute('position',new THREE.BufferAttribute(xyz,3));
  indexed.setIndex(new THREE.BufferAttribute(triangles,1));
  const geometry = indexed.toNonIndexed();
  geometry.computeVertexNormals();
  geometry.rotateY((model.yaw || 0)*Math.PI/180);
  geometry.translate(model.x,model.y || 0,model.z);
  return geometry;
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
    if (!geos.length && m.silhouette) {
      const g = skylineGeometry(THREE,m);
      if (terrain) g.setAttribute('foundationLevel',new THREE.BufferAttribute(
        new Float32Array(g.attributes.position.count).fill(relief(m.x,m.z)),1));
      geos.push(g);
    }
    if (!geos.length) continue;
    const mesh = new THREE.Mesh(geos.length === 1 ? geos[0] : mergeGeometries(geos),mat);
    if (terrain) fitTerrainBounds(THREE,mesh,sites.length ? sites.map(site=>site.level) : [relief(m.x,m.z)]);
    mesh.userData.sites = sites;
    scene.add(mesh); stand.set(m.id, mesh);
  }
  return stand;
}

// Budget the decoded geometry work as well as the network requests. Multi-tower
// files need per-vertex terrain anchors and several initially separate meshes.
function* prepareModel(THREE, gltf, m, stand, terrain) {
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
  const fittings = [], shell = [];
  const meshes = [];
  root.traverse(o => { if (o.isMesh) meshes.push(o); });
  for (const o of meshes) {
    yield;
    if (/window[ _]frames?|window[ _]mullions?|unequal[ _]sash|cladding[ _]joint/i.test(o.name)) fittings.push(o);
    else if (!m.sourceMaterial) shell.push(o);
    if (levels) {
      if (o.geometry.hasAttribute('foundationLevel')) o.geometry = o.geometry.clone();
      const pos = o.geometry.attributes.position, values = new Float32Array(pos.count);
      for (let i=0;i<pos.count;i++) {
        if ((i & 511) === 0) yield;
        point.fromBufferAttribute(pos,i).applyMatrix4(o.matrixWorld);
        values[i] = levels(point.x,point.z);
      }
      o.geometry.setAttribute('foundationLevel',new THREE.BufferAttribute(values,1));
    }
    o.material = Array.isArray(o.material) ? o.material.map(material) : material(o.material);
    o.matrixAutoUpdate = false;
  }
  yield* batchFacadeParts(THREE,root,shell,terrain,level);
  if (terrain) fitTerrainBounds(THREE, root, levels ? sites.map(site => site.level) : [level]);
  root.userData.re = m;
  root.userData.fittings = fittings;
  return root;
}

// A handful of conservative bounding boxes use the depth of the normal opaque pass.
// Query results arrive in later frames. Looking through a window works naturally,
// and a solid indoor wall prevents the apartment behind it from being requested.
function visibilityProbes(THREE, renderer, scene) {
  const gl = renderer.getContext();
  if (!renderer.capabilities.isWebGL2) return null;
  const geometry = new THREE.BoxGeometry(1,1,1);
  const material = new THREE.MeshBasicMaterial({colorWrite:false, depthWrite:false, side:THREE.DoubleSide});
  material.defines = {BANPO_RIGID:1}; // the query bounds already include terrain
  const slots = Array.from({length:3}, () => {
    const box = new THREE.Mesh(geometry,material);
    box.name = 'Apartment visibility query';
    box.visible = false;
    box.renderOrder = 100000;
    box.frustumCulled = false;
    scene.add(box);
    const slot = {box, query:null, record:null, issued:false};
    box.onBeforeRender = () => {
      gl.beginQuery(gl.ANY_SAMPLES_PASSED_CONSERVATIVE,slot.query);
      slot.issued = true;
    };
    box.onAfterRender = () => gl.endQuery(gl.ANY_SAMPLES_PASSED_CONSERVATIVE);
    return slot;
  });
  renderer.domElement.addEventListener('webglcontextrestored', () => {
    for (const slot of slots) {
      if (slot.record) slot.record.testing = false;
      Object.assign(slot,{query:null,record:null,issued:false});
      slot.box.visible = false;
    }
  });
  return {
    poll(now) {
      for (const slot of slots) {
        if (!slot.issued) continue;
        slot.box.visible = false;
        if (!gl.getQueryParameter(slot.query,gl.QUERY_RESULT_AVAILABLE)) continue;
        const r = slot.record;
        r.seen = !!gl.getQueryParameter(slot.query,gl.QUERY_RESULT);
        r.checkAgain = now + (r.seen ? 3000 : 1100);
        r.testing = false;
        slot.record = null;
        slot.issued = false;
      }
    },
    test(r) {
      const slot = slots.find(s => !s.record);
      if (!slot) return false;
      slot.query ??= gl.createQuery();
      if (!slot.query) return false;
      r.testing = true;
      slot.record = r;
      r.box.getSize(slot.box.scale);
      r.box.getCenter(slot.box.position);
      slot.box.visible = true;
      return true;
    },
  };
}

export function loadReModels({ THREE, scene, models, stand, renderer, terrain = true }) {
  const loader = new GLTFLoader().setMeshoptDecoder(MeshoptDecoder);
  const probes = visibilityProbes(THREE,renderer,scene);
  const frustum = new THREE.Frustum(), matrix = new THREE.Matrix4();
  const last = new THREE.Vector3(Infinity,0,0), rotation = new THREE.Quaternion();
  const records = models.map(model => {
    const [x0,z0,x1,z1] = polyBBox(model.rect);
    const pad = terrain ? maxReliefInBounds(x0,z0,x1,z1) : 0;
    const box = new THREE.Box3(new THREE.Vector3(x0-1,model.y-pad-1,z0-1),
      new THREE.Vector3(x1+1,model.y+model.height+pad+1,z1+1));
    return {model,box,seen:false,testing:false,checkAgain:0,retryAt:0,root:null};
  });
  let nextScan = 0, loading = false, preparing = null, workersStarted = false;
  function request(r) {
    loading = true;
    if (!workersStarted && MeshoptDecoder.useWorkers) {
      workersStarted = true;
      try { MeshoptDecoder.useWorkers(1); } catch { /* local browser can still decode synchronously */ }
    }
    loader.load(r.model.file, gltf => {
      preparing = {r, steps:prepareModel(THREE,gltf,r.model,stand,terrain)};
    }, undefined, () => {
      r.retryAt = performance.now()+10000;
      loading = false;
    });
  }
  function work() {
    if (!preparing) return;
    const until = performance.now()+2;
    const {r,steps} = preparing;
    do {
      let result;
      try { result = steps.next(); }
      catch (error) {
        console.warn('Could not prepare apartment',r.model.id,error);
        r.retryAt = performance.now()+10000;
        loading = false;
        preparing = null;
        return;
      }
      if (!result.done) continue;
      r.root = result.value;
      r.root.visible = false;
      scene.add(r.root);
      loading = false;
      preparing = null;
      nextScan = 0;
      return;
    } while (performance.now()<until);
  }
  return {
    update(camera, now = performance.now()) {
      work();
      probes?.poll(now);
      if (now < nextScan) return;
      nextScan = now+100;
      camera.updateWorldMatrix(true,false);
      frustum.setFromProjectionMatrix(matrix.multiplyMatrices(camera.projectionMatrix,camera.matrixWorldInverse));
      const moved = last.distanceToSquared(camera.position)>9 || rotation.angleTo(camera.quaternion)>.10;
      if (moved) { last.copy(camera.position); rotation.copy(camera.quaternion); }
      const candidates = [], cached = [];
      for (const r of records) {
        const dist = r.box.distanceToPoint(camera.position);
        // Measure to the nearest face of each estate, including high-floor windows.
        // Hysteresis avoids swapping facades on every step at the detail boundary.
        const inView = dist <= (r.root?.visible ? 460 : 400) && frustum.intersectsBox(r.box);
        if (moved) r.checkAgain = Math.min(r.checkAgain,(r.lastTest || 0)+350);
        if (!inView) { r.seen = false; r.checkAgain = 0; }
        else if (dist===0 || !probes) r.seen = true;
        if (inView) candidates.push({r,dist});
        if (!r.root) continue;
        const show = inView && r.seen;
        r.root.visible = show;
        const simple = stand.get(r.model.id);
        if (simple) simple.visible = !show;
        if (!show) { cached.push(r); continue; }
        r.lastSeen = now;
        if (!r.root.userData.fittings.length) continue;
        const near = dist < (r.root.userData.fittingsVisible ? 235 : 210);
        if (near !== r.root.userData.fittingsVisible) {
          r.root.userData.fittingsVisible = near;
          for (const part of r.root.userData.fittings) part.visible = near;
        }
      }
      // Keep recently visited buildings warm when turning around. A long walk
      // across the district should not retain every decoded GLB in GPU memory.
      cached.sort((a,b)=>(b.lastSeen ?? 0)-(a.lastSeen ?? 0));
      for (const r of cached.slice(8)) {
        scene.remove(r.root);
        const materials = new Set(), geometries = new Set(), textures = new Set();
        r.root.traverse(o=>{
          if (!o.isMesh) return;
          geometries.add(o.geometry);
          for (const m of Array.isArray(o.material) ? o.material : [o.material]) materials.add(m);
        });
        for (const m of materials) for (const value of Object.values(m)) if (value?.isTexture) textures.add(value);
        for (const resource of [...geometries,...materials,...textures]) resource.dispose();
        r.root = null;
      }
      candidates.sort((a,b) => a.dist-b.dist);
      for (const {r,dist} of candidates) {
        if (probes && dist>0 && !r.testing && r.checkAgain<=now && probes.test(r)) r.lastTest=now;
        if (!loading && r.seen && !r.root && r.retryAt<=now) request(r);
      }
    }
  };
}
