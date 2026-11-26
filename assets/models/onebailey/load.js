import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

// Use the same exported mesh in browser graphics, headless tests and previews.
export async function loadFixtureScene(url) {
  const buffer = url.protocol === 'file:'
    ? await (await import('node:fs/promises')).readFile(url)
    : new Uint8Array(await (await fetch(url)).arrayBuffer());
  const gltf = await new GLTFLoader().parseAsync(
    buffer.buffer.slice(buffer.byteOffset,buffer.byteOffset+buffer.byteLength),'');
  gltf.scene.traverse(node => {
    if (!node.isMesh) return;
    const geometry=node.geometry;
    if (!geometry.hasAttribute('normal')) geometry.computeVertexNormals();
    geometry.computeBoundingSphere();
  });
  gltf.scene.updateMatrixWorld(true);
  return gltf.scene;
}

export function mountFixture(K,library,key,position,rotation,scale=[1,1,1]) {
  const group=new K.THREE.Group();
  group.name=key;
  group.position.set(...position);
  group.rotation.y=rotation;
  group.scale.set(...scale);
  const material=new K.THREE.MeshLambertMaterial({vertexColors:true});
  const source=library.getObjectByName(key);
  if (!source) throw new Error('Missing retail fixture '+key);
  source.traverse(node=>{
    if (!node.isMesh) return;
    const mesh=new K.THREE.Mesh(node.geometry,material);
    // Quantized glTF may put its position decoder on a mesh or an ancestor.
    mesh.matrix.copy(node.matrixWorld);
    mesh.matrixAutoUpdate=false;
    mesh.frustumCulled=false;
    group.add(mesh);
  });
  K.addMesh(group);
}
