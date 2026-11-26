// Both parked vehicles and moving traffic share the Blender library in metres.
import { palette, vehicles } from '../assets/models/fleet/meshes.js';

export function vehicleSize(kind) {
  return (vehicles[kind] || vehicles.car).size;
}

export function vehicleContacts(kind) {
  return (vehicles[kind] || vehicles.car).contacts;
}

const caches = new WeakMap();

function buildGeometries(THREE, vehicle, colors, separateWheels) {
  const { mm, faces, wheels } = vehicle;
  const parts = Array.from({length: separateWheels ? 3 : 2}, () => ({ positions:[], colors:[] }));
  // The editable tyre has one outside hub face. Use the right rear wheel as
  // the prototype; a half turn about Y exposes the hub on a left-hand wheel.
  const prototype = separateWheels && wheels.find(([, , x, , z]) => x > 0 && z < 0);
  for (let i = 0; i < faces.length; i += 4) {
    const material = faces[i+3];
    const wheel = separateWheels && wheels.find(([first, end]) => i >= 4*first && i < 4*end);
    if (wheel && wheel !== prototype) continue;
    const part = parts[wheel ? 2 : material === 0 ? 0 : 1];
    for (let k = i; k < i+3; k++) {
      const vertex = faces[k]*3;
      for (let axis = 0; axis < 3; axis++) {
        // Wheel origins are the actual tread contact extracted from Blender.
        part.positions.push((mm[vertex+axis] - (wheel ? wheel[2+axis] : 0)) / 1000);
      }
      if (wheel || material !== 0) {
        const color = colors[material];
        part.colors.push(color.r,color.g,color.b);
      }
    }
  }
  return parts.map(({positions,colors}) => {
    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions,3));
    if (colors.length) geometry.setAttribute('color', new THREE.Float32BufferAttribute(colors,3));
    geometry.computeVertexNormals();
    geometry.computeBoundingSphere();
    return geometry;
  });
}

export function fleetInstances(THREE, kind, count, {separateWheels=false} = {}) {
  let library = caches.get(THREE);
  if (!library) {
    const paint = new THREE.MeshLambertMaterial();
    const trim = new THREE.MeshLambertMaterial({vertexColors:true});
    for (const m of [paint,trim]) m.defines = {BANPO_RIGID:1};
    library = { materials:[paint,trim,trim], colors:palette.map(hex => new THREE.Color(hex)), geometries:new Map() };
    caches.set(THREE, library);
  }
  const key = kind + (separateWheels ? '/wheels' : '/complete');
  if (!library.geometries.has(key)) {
    library.geometries.set(key, buildGeometries(THREE, vehicles[kind] || vehicles.car, library.colors, separateWheels));
  }
  return library.geometries.get(key).map((geometry,i) => {
    const mesh = new THREE.InstancedMesh(geometry, library.materials[i], i === 2 ? count*4 : count);
    mesh.name = kind + [' paint',' trim',' wheels'][i];
    return mesh;
  });
}
