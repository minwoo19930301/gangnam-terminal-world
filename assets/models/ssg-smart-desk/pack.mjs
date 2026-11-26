import {NodeIO} from '@gltf-transform/core';
import {ALL_EXTENSIONS} from '@gltf-transform/extensions';
import {weld,meshopt} from '@gltf-transform/functions';
import {MeshoptEncoder,MeshoptDecoder} from 'meshoptimizer';
import {fileURLToPath} from 'node:url';
await Promise.all([MeshoptEncoder.ready,MeshoptDecoder.ready]);
const io=new NodeIO().registerExtensions(ALL_EXTENSIONS).registerDependencies({
  'meshopt.encoder':MeshoptEncoder,'meshopt.decoder':MeshoptDecoder
});
const file=fileURLToPath(new URL('gallery.glb',import.meta.url));
const doc=await io.read(file);
// All native faces are flat. Derivative normals retain those facets and let
// the welded export share vertices along the tiny key and packaging edges.
for(const mesh of doc.getRoot().listMeshes())
  for(const primitive of mesh.listPrimitives()) primitive.setAttribute('NORMAL',null);
await doc.transform(weld(),meshopt({encoder:MeshoptEncoder,level:'medium',quantizePosition:16}));
await io.write(file,doc);
