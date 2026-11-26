// The same Blender visitor can be drawn in a single instanced call with a
// different shirt, trousers, hair and bag for every person.
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js';
import { visitors } from '../assets/models/visitors/geometry.js';

const shirts = [0x2b3a55,0xf2f2f2,0x9b2c2c,0x1d1d1d,0xc9b28a,0x4a6b3a,0x7a5aa0,0xe8a0a0,0x3b6ea8,0x6a6a6a,0xd9cbb3,0x8a3b4f,0xf0e3c8,0x2f5e5a];
const pants = [0x1e2430,0x2b2b2b,0x4a4a55,0x22314f,0x7a6a55,0xc8bba4,0x3a3a3a,0x5d6b7a];
const skins = [0xe0b896,0xd8ab84,0xecc8a6,0xe6bf9b];
const hairs = [0x15110e,0x231a14,0x3a2a1e,0x1c1c1c,0x5a4636,0x8a8a86,0x2a2420];
const bags = [0xf4efe6,0xc8a15a,0x1b1b1b,0xd94c3d,0x9fb7c9,0xffffff];
const colorNames = ['trousers','shirt','skin','hair','bag'];
const templates = new Map();
let material;

function template(THREE, pose, far) {
  const key = pose + (far ? 'Far' : '');
  if (templates.has(key)) return templates.get(key);
  const names = pose === 'seated' ? ['sitLegs','sitShoes','sitTop','sitSkin','sitHair'] : ['legs','shoes','top','skin','hair'];
  if (pose === 'carrying') names.push('bag');
  const parts = names.map(name => visitors[name + (far ? 'Far' : '')]);
  const g = mergeGeometries(parts);
  const roles = new Uint8Array(g.attributes.position.count);
  let offset = 0;
  parts.forEach((p,i) => {
    roles.fill(i,offset,offset+p.attributes.position.count);
    offset += p.attributes.position.count;
  });
  g.setAttribute('clothingPart',new THREE.BufferAttribute(roles,1));
  g.name = key;
  templates.set(key,g);
  return g;
}

function visitorMaterial(THREE) {
  if (material) return material;
  material = new THREE.MeshLambertMaterial({vertexColors:true});
  const shoe = new THREE.Color(0x232323).r;
  material.onBeforeCompile = shader => {
    shader.vertexShader = 'attribute float clothingPart;\n' +
      colorNames.map(n => 'attribute vec3 '+n+'Color;').join('\n') + '\n' +
      shader.vertexShader.replace('#include <color_vertex>', `#include <color_vertex>
        vec3 tint = trousersColor;
        if (clothingPart == 1.0) tint = vec3(${shoe});
        else if (clothingPart == 2.0) tint = shirtColor;
        else if (clothingPart == 3.0) tint = skinColor;
        else if (clothingPart == 4.0) tint = hairColor;
        else if (clothingPart == 5.0) tint = bagColor;
        vColor.rgb *= tint;`);
  };
  return material;
}

export function visitorInstances(THREE, people, indices) {
  const poses = new Map(), meshes = [];
  for (const i of indices) {
    const pose = people[i].sit ? 'seated' : ((i*2654435761 >>> 0)%5 < 2 ? 'carrying' : 'standing');
    if (!poses.has(pose)) poses.set(pose,[]);
    poses.get(pose).push(i);
  }
  const matrix = new THREE.Matrix4(), rotation = new THREE.Quaternion(), up = new THREE.Vector3(0,1,0);
  const point = new THREE.Vector3(), scale = new THREE.Vector3(), color = new THREE.Color();
  for (const [pose, group] of poses) {
    const tints = colorNames.map(() => new THREE.InstancedBufferAttribute(new Float32Array(group.length*3),3));
    const lod = [false,true].map(far => {
      const src = template(THREE,pose,far);
      const g = new THREE.BufferGeometry();
      g.name = src.name;
      g.setIndex(src.index);
      for (const [name,attr] of Object.entries(src.attributes)) g.setAttribute(name,attr);
      colorNames.forEach((name,i) => g.setAttribute(name+'Color',tints[i]));
      return g;
    });
    const mesh = new THREE.InstancedMesh(lod[0],visitorMaterial(THREE),group.length);
    mesh.name = 'Visitors '+pose;
    mesh.userData.lod = lod;
    mesh.userData.lodDistance = 40;
    mesh.userData.split = true;
    group.forEach((i,j) => {
      const p = people[i], hash = i*2654435761 >>> 0;
      matrix.compose(point.set(p.x,p.y,p.z),rotation.setFromAxisAngle(up,p.rotY || 0),scale.setScalar(p.h/1.7));
      mesh.setMatrixAt(j,matrix);
      const palette = [p.pants ?? pants[hash%pants.length],p.shirt ?? shirts[(hash>>>3)%shirts.length],
        skins[(hash>>>7)%skins.length],hairs[(hash>>>11)%hairs.length],bags[(hash>>>5)%bags.length]];
      palette.forEach((hex,k) => { color.setHex(hex); tints[k].setXYZ(j,color.r,color.g,color.b); });
    });
    mesh.instanceMatrix.needsUpdate = true;
    meshes.push(mesh);
  }
  return meshes;
}
