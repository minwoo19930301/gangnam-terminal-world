import {NodeIO} from '@gltf-transform/core';
import {ALL_EXTENSIONS} from '@gltf-transform/extensions';
import {meshopt,simplify,weld} from '@gltf-transform/functions';
import {MeshoptEncoder,MeshoptDecoder,MeshoptSimplifier} from 'meshoptimizer';
import {fileURLToPath} from 'node:url';

await Promise.all([MeshoptEncoder.ready,MeshoptDecoder.ready,MeshoptSimplifier.ready]);
const io=new NodeIO().registerExtensions(ALL_EXTENSIONS).registerDependencies({
  'meshopt.encoder':MeshoptEncoder,'meshopt.decoder':MeshoptDecoder
});
const path=fileURLToPath(new URL('gallery.glb',import.meta.url));
const doc=await io.read(path);
// Preserve the collar and garment borders. The submillimetre error budget mainly
// removes tessellation on buttons, aligned cylindrical ribs and plush limbs.
await doc.transform(weld(),simplify({simplifier:MeshoptSimplifier,ratio:.52,error:.00022}),
  meshopt({encoder:MeshoptEncoder,level:'medium',quantizePosition:16}));
await io.write(path,doc);
for(const node of doc.getRoot().listNodes()) {
  const mesh=node.getMesh();
  if(mesh)console.log(node.getName(),mesh.listPrimitives().map(p=>p.getIndices().getCount()/3));
}
