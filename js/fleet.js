// Both parked vehicles and moving traffic share the Blender library in metres.
import { palette, vehicles } from '../assets/models/fleet/meshes.js';

export function vehicleSize(kind) {
  return (vehicles[kind] || vehicles.car).size;
}

const caches = new WeakMap();
export function fleetInstances(THREE, kind, count) {
  let library = caches.get(THREE);
  if (!library) {
    const materials = [new THREE.MeshLambertMaterial(), new THREE.MeshLambertMaterial({ vertexColors: true })];
    for (const m of materials) m.defines = { BANPO_RIGID: 1 };
    library = { materials, geometries: new Map() };
    caches.set(THREE, library);
  }
  if (!library.geometries.has(kind)) {
    const { mm, faces } = vehicles[kind] || vehicles.car;
    const parts = [{ positions: [], colors: [] }, { positions: [], colors: [] }];
    const colors = palette.map(hex => new THREE.Color(hex));
    for (let i = 0; i < faces.length; i += 4) {
      const material = faces[i + 3], part = parts[material === 0 ? 0 : 1];
      for (let k = i; k < i + 3; k++) {
        const j = faces[k] * 3;
        part.positions.push(mm[j] / 1000, mm[j + 1] / 1000, mm[j + 2] / 1000);
        if (material) part.colors.push(colors[material].r, colors[material].g, colors[material].b);
      }
    }
    library.geometries.set(kind, parts.map(({ positions, colors }) => {
      const geometry = new THREE.BufferGeometry();
      geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
      if (colors.length) geometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));
      geometry.computeVertexNormals();
      geometry.computeBoundingSphere();
      return geometry;
    }));
  }
  return library.geometries.get(kind).map((g, i) => {
    const mesh = new THREE.InstancedMesh(g, library.materials[i], count);
    mesh.name = kind + (i ? ' trim' : ' paint');
    return mesh;
  });
}
