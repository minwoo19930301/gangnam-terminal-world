// The display includes finely fluted porcelain, gold rims, and cobalt painting.
// Preserve changes in shading and the painted UVs when decimating the curves.
import {NodeIO} from '@gltf-transform/core';
import {ALL_EXTENSIONS} from '@gltf-transform/extensions';
import {compactPrimitive,meshopt,weld} from '@gltf-transform/functions';
import {MeshoptEncoder,MeshoptSimplifier} from 'meshoptimizer';
import {fileURLToPath} from 'node:url';

await Promise.all([MeshoptEncoder.ready,MeshoptSimplifier.ready]);
const path=fileURLToPath(new URL('display.glb',import.meta.url));
const io=new NodeIO().registerExtensions(ALL_EXTENSIONS).registerDependencies({'meshopt.encoder':MeshoptEncoder});
const doc=await io.read(path);
await doc.transform(weld());

for(const mesh of doc.getRoot().listMeshes()) {
  for(const piece of mesh.listPrimitives()) {
    const positions=piece.getAttribute('POSITION').getArray();
    const normals=piece.getAttribute('NORMAL').getArray();
    const uv=piece.getAttribute('TEXCOORD_0').getArray();
    const index=piece.getIndices();
    const source=Uint32Array.from(index.getArray());
    const count=positions.length/3;
    const attributes=new Float32Array(count*5);
    for(let i=0;i<count;i++) {
      attributes.set(normals.subarray(3*i,3*i+3),5*i);
      attributes.set(uv.subarray(2*i,2*i+2),5*i+3);
    }
    const target=Math.floor(source.length*.5/3)*3;
    const [indices]=MeshoptSimplifier.simplifyWithAttributes(
      source,positions,3,attributes,5,[.05,.05,.05,.16,.16],null,target,.00055
    );
    index.setArray(indices);
    compactPrimitive(piece);
  }
}

await doc.transform(meshopt({encoder:MeshoptEncoder,level:'medium',quantizePosition:16,quantizeTexcoord:14}));
await io.write(path,doc);
await import('./figurine_pack.mjs');
