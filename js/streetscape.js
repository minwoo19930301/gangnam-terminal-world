// Shared Blender geometry. Materials follow the scene's terrain and daylight shaders.
import { foliageTile, palette, shapes } from '../assets/models/streetscape/meshes.js';

const library = new WeakMap();
function geometry(THREE, name) {
  let cache = library.get(THREE);
  if (!cache) { cache = new Map(); library.set(THREE, cache); }
  if (cache.has(name)) return cache.get(name);
  const { mm, faces, uv256 } = shapes[name];
  const indexed = new THREE.BufferGeometry();
  indexed.setAttribute('position', new THREE.Float32BufferAttribute(mm.map(v => v / 1000), 3));
  const indices = [], colors = [], materials = palette.map(hex => new THREE.Color(hex));
  for (let i = 0; i < faces.length; i += 4) {
    indices.push(faces[i], faces[i + 1], faces[i + 2]);
    const color = materials[Math.abs(faces[i + 3]) - 1];
    for (let j = 0; j < 3; j++) colors.push(color.r, color.g, color.b);
  }
  indexed.setIndex(indices);
  indexed.computeVertexNormals();
  const result = indexed.toNonIndexed();
  result.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));
  if (uv256) {
    const encoded = Uint8Array.from(atob(uv256), ch => ch.charCodeAt(0));
    const view = new DataView(encoded.buffer);
    const uv = Float32Array.from({ length: encoded.length / 2 }, (_, i) => view.getInt16(i * 2, true) / 256);
    result.setAttribute('uv', new THREE.BufferAttribute(uv, 2));
  }
  // Canopies and tapered tubes share vertex normals; cast lamp housing facets stay flat.
  const pos = result.attributes.position, normals = result.attributes.normal;
  const a = new THREE.Vector3(), b = new THREE.Vector3(), c = new THREE.Vector3();
  for (let i = 0; i < faces.length; i += 4) {
    if (faces[i + 3] > 0) continue;
    const j = i / 4 * 3;
    a.fromBufferAttribute(pos, j); b.fromBufferAttribute(pos, j + 1); c.fromBufferAttribute(pos, j + 2);
    b.sub(a).cross(c.sub(a)).normalize();
    for (let k = j; k < j + 3; k++) normals.setXYZ(k, b.x, b.y, b.z);
  }
  result.name = name;
  result.computeBoundingSphere();
  cache.set(name, result);
  return result;
}

const species = new Set(['zelkova', 'ginkgo', 'pine', 'cherry', 'maple']);
export function treeInstances(THREE, trees) {
  const grouped = new Map();
  for (const tree of trees) {
    const kind = species.has(tree.kind) ? tree.kind : 'zelkova';
    if (!grouped.has(kind)) grouped.set(kind, []);
    grouped.get(kind).push(tree);
  }
  const M = new THREE.Matrix4(), Q = new THREE.Quaternion(), V = new THREE.Vector3(), S = new THREE.Vector3();
  const axis = new THREE.Vector3(0, 1, 0), tint = new THREE.Color(), meshes = [];
  const material = canopyMaterial(THREE);
  for (const [kind, group] of grouped) {
    const near = geometry(THREE, kind), far = geometry(THREE, kind + 'Far');
    const mesh = new THREE.InstancedMesh(near, material, group.length);
    mesh.name = 'street tree ' + kind;
    mesh.userData.lod = [near, far];
    mesh.userData.split = true;
    group.forEach(({ x, y, z, h, sourceXZ }, i) => {
      const [sourceX, sourceZ] = sourceXZ ?? [x, z];
      const spread = kind === 'ginkgo' || kind === 'pine' ? 1 : h / 8;
      M.compose(V.set(x, y, z), Q.setFromAxisAngle(axis, (sourceX * 3 + sourceZ) % 6), S.set(spread, h / 8, spread));
      mesh.setMatrixAt(i, M);
      mesh.setColorAt(i, tint.setScalar(.85 + (Math.abs(Math.round(sourceX * 7 + sourceZ * 3)) % 11) * .025));
    });
    mesh.instanceMatrix.needsUpdate = mesh.instanceColor.needsUpdate = true;
    meshes.push(mesh);
  }
  return meshes;
}

const canopyMaterials = new WeakMap();
function canopyMaterial(THREE) {
  if (!canopyMaterials.has(THREE)) {
    const gray = atob(foliageTile), rgba = new Uint8Array(gray.length * 4);
    for (let i = 0; i < gray.length; i++) {
      rgba.fill(gray.charCodeAt(i), i * 4, i * 4 + 3); rgba[i * 4 + 3] = 255;
    }
    const size = Math.sqrt(gray.length);
    const map = new THREE.DataTexture(rgba, size, size);
    map.wrapS = map.wrapT = THREE.RepeatWrapping;
    map.magFilter = THREE.LinearFilter; map.minFilter = THREE.LinearMipmapLinearFilter;
    map.generateMipmaps = true; map.needsUpdate = true;
    canopyMaterials.set(THREE, new THREE.MeshLambertMaterial({ map, vertexColors: true }));
  }
  return canopyMaterials.get(THREE);
}

const streetMaterials = new WeakMap();
function streetMaterial(THREE) {
  if (!streetMaterials.has(THREE))
    streetMaterials.set(THREE, new THREE.MeshLambertMaterial({ vertexColors: true }));
  return streetMaterials.get(THREE);
}

export function addStreetLamps(K, sites, lensMaterial) {
  if (!sites.length) return;
  const { THREE } = K;
  const body = new THREE.InstancedMesh(geometry(THREE, 'roadLamp'), streetMaterial(THREE), sites.length);
  const lens = new THREE.InstancedMesh(geometry(THREE, 'roadLampLens'), lensMaterial, sites.length);
  body.name = '가로등'; lens.name = '가로등 발광렌즈';
  const M = new THREE.Matrix4();
  sites.forEach(([x, z, yaw, y = 0], i) => {
    M.makeRotationY(yaw).setPosition(x, y, z);
    body.setMatrixAt(i, M); lens.setMatrixAt(i, M);
  });
  for (const mesh of [body, lens]) {
    mesh.instanceMatrix.needsUpdate = true;
    mesh.computeBoundingSphere();
    K.addMesh(mesh);
  }
}
