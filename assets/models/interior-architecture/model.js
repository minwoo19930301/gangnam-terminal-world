import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { MeshoptDecoder } from 'three/addons/libs/meshopt_decoder.module.js';

export async function loadArchitecture(file) {
  const url = new URL(file, import.meta.url);
  const bytes = url.protocol === 'file:' ? await (await import('node:fs/promises')).readFile(url)
    : new Uint8Array(await (await fetch(url)).arrayBuffer());
  const loader = new GLTFLoader().setMeshoptDecoder(MeshoptDecoder);
  const gltf = await loader.parseAsync(bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength), '');
  const parts = [];
  gltf.scene.traverse(mesh => { if (mesh.isMesh) parts.push(mesh); });
  return parts;
}

// One material and draw per surface finish, with all repeating pieces instanced.
export function placeArchitecture(K, parts, name, placements, {skylight=false}={}) {
  const { THREE } = K;
  for (const part of parts) {
    const lamp = part.name === 'Diffuser';
    const material = lamp ? new THREE.MeshBasicMaterial({vertexColors:true, side:THREE.DoubleSide})
      : new THREE.MeshLambertMaterial({vertexColors:true, side:THREE.DoubleSide});
    if (lamp && skylight) {
      // Alpha identifies the daylight panes inside the existing diffuser batch.
      // Wall lamps keep their original electric light through the solar cycle.
      const daylight = {value:1};
      K.onSolarAltitude?.(altitude=>{
        const t=THREE.MathUtils.smoothstep(altitude,-7,14);
        daylight.value=.065+.935*t;
      });
      material.onBeforeCompile=shader=>{
        shader.uniforms.rooflightDay=daylight;
        shader.fragmentShader='uniform float rooflightDay;\n'+shader.fragmentShader.replace(
          '#include <color_fragment>', `#include <color_fragment>
          diffuseColor.rgb *= mix(rooflightDay, 1.0, vColor.a);
          diffuseColor.a = opacity;`);
      };
      material.customProgramCacheKey=()=>'daylit-roof-glass';
    }
    const group = new THREE.InstancedMesh(part.geometry, material, placements.length);
    group.name = name + (lamp ? ' · 발광면' : '');
    material.name = group.name;
    const pose = new THREE.Object3D();
    placements.forEach(([x,y,z,angle,sx=1,sy=1,sz=1], i) => {
      pose.position.set(x,y,z); pose.rotation.y=angle; pose.scale.set(sx,sy,sz);
      pose.updateMatrix();
      group.setMatrixAt(i,pose.matrix);
    });
    group.computeBoundingSphere();
    K.addMesh(group);
  }
}
