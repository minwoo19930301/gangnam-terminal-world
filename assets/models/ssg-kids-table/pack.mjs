import {NodeIO} from '@gltf-transform/core';
import {ALL_EXTENSIONS} from '@gltf-transform/extensions';
import {meshopt,weld} from '@gltf-transform/functions';
import {MeshoptEncoder} from 'meshoptimizer';
import {fileURLToPath} from 'node:url';

await MeshoptEncoder.ready;
const io=new NodeIO().registerExtensions(ALL_EXTENSIONS).registerDependencies({'meshopt.encoder':MeshoptEncoder});
const file=fileURLToPath(new URL('gallery.glb',import.meta.url));
const doc=await io.read(file);
// All authored polygons use flat shading. The glTF flat-normal rule preserves
// the shaped bevels and allows neighbouring facets to share position data.
for (const mesh of doc.getRoot().listMeshes()) {
  for (const primitive of mesh.listPrimitives()) primitive.setAttribute('NORMAL',null);
}
await doc.transform(weld(),meshopt({encoder:MeshoptEncoder,level:'medium',quantizePosition:16}));
await io.write(file,doc);
