import {NodeIO} from '@gltf-transform/core';
import {ALL_EXTENSIONS} from '@gltf-transform/extensions';
import {meshopt, simplify, weld} from '@gltf-transform/functions';
import {MeshoptEncoder,MeshoptSimplifier} from 'meshoptimizer';
import {fileURLToPath} from 'node:url';

await Promise.all([MeshoptEncoder.ready,MeshoptSimplifier.ready]);
const io=new NodeIO().registerExtensions(ALL_EXTENSIONS).registerDependencies({'meshopt.encoder':MeshoptEncoder});
const file=fileURLToPath(new URL('gallery.glb',import.meta.url));
const doc=await io.read(file);
for (const mesh of doc.getRoot().listMeshes()) {
  console.log(mesh.getName(),mesh.listPrimitives().map(p=>p.getIndices().getCount()/3));
}
await doc.transform(weld(),simplify({simplifier:MeshoptSimplifier,ratio:.57,error:.0002}),
  meshopt({encoder:MeshoptEncoder,level:'medium',quantizePosition:16}));
await io.write(file,doc);
console.log('Packed triangles',doc.getRoot().listMeshes().flatMap(m=>m.listPrimitives()).reduce((n,p)=>n+p.getIndices().getCount()/3,0));
