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
// The shoe shells were authored with flat faces. Generate facet normals in the
// shader so identical rim vertices can weld before simplifying the tiny shoes.
const footwear = doc.getRoot().listNodes().find(node => node.getName() === 'ToeboxFootwear').getMesh();
for (const primitive of footwear.listPrimitives()) primitive.setAttribute('NORMAL',null);
await doc.transform(
  weld(),
  simplify({simplifier:MeshoptSimplifier,ratio:.35,error:.0003}),
  meshopt({encoder:MeshoptEncoder,level:'medium',quantizePosition:16})
);
await io.write(path,doc);
