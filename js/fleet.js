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

// Beyond walking distance the tyre sidewall bevels are smaller than a pixel.
// Keep the Blender tread/contact bounds and hub colour in a single octagonal wheel.
function distantWheel(THREE, wheel) {
  wheel.computeBoundingBox();
  const {min, max} = wheel.boundingBox, radius = (max.y-min.y)/2;
  const original = wheel.attributes.color;
  const rubber = new THREE.Color().fromBufferAttribute(original,0);
  const silver = new THREE.Color().fromBufferAttribute(original,original.count-1);
  const positions = [], colors = [];
  function ring(x, r, step) {
    const angle = step*Math.PI/4;
    return [x, min.y+radius+r*Math.sin(angle), r*Math.cos(angle)];
  }
  function triangle(a,b,c,color) {
    positions.push(...a,...b,...c);
    for (let i=0;i<3;i++) colors.push(color.r,color.g,color.b);
  }
  for (let i=0;i<8;i++) {
    const a=ring(min.x,radius,i), b=ring(min.x,radius,i+1);
    const c=ring(max.x,radius,i), d=ring(max.x,radius,i+1);
    const e=ring(max.x,radius*.57,i), f=ring(max.x,radius*.57,i+1);
    triangle(a,c,b,rubber); triangle(c,d,b,rubber);
    triangle(c,e,d,rubber); triangle(e,f,d,rubber);
    triangle(e,ring(max.x,0,0),f,silver);
    triangle(a,b,ring(min.x,0,0),rubber);
  }
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position',new THREE.Float32BufferAttribute(positions,3));
  geometry.setAttribute('color',new THREE.Float32BufferAttribute(colors,3));
  geometry.computeVertexNormals();
  return geometry;
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
    if (i === 2) {
      geometry.userData.distantWheel ??= distantWheel(THREE, geometry);
      mesh.userData.lod = [geometry, geometry.userData.distantWheel];
      mesh.userData.lodDistance = 65;
    }
    return mesh;
  });
}
