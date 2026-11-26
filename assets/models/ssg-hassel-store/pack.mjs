import {NodeIO} from '@gltf-transform/core';
import {ALL_EXTENSIONS} from '@gltf-transform/extensions';
import {meshopt,weld} from '@gltf-transform/functions';
import {MeshoptEncoder, MeshoptDecoder} from 'meshoptimizer';
import {fileURLToPath} from 'node:url';
import {stat} from 'node:fs/promises';

await Promise.all([MeshoptEncoder.ready,MeshoptDecoder.ready]);
const io=new NodeIO().registerExtensions(ALL_EXTENSIONS).registerDependencies({
  'meshopt.encoder':MeshoptEncoder,'meshopt.decoder':MeshoptDecoder
});
const path=fileURLToPath(new URL('gallery.glb',import.meta.url));
const doc=await io.read(path);
await doc.transform(weld(),meshopt({encoder:MeshoptEncoder,level:'medium',quantizePosition:16}));
await io.write(path,doc);
const glb=await io.read(path);
const primitives=glb.getRoot().listMeshes().flatMap(mesh=>mesh.listPrimitives());
console.log({bytes:(await stat(path)).size,triangles:primitives.reduce((sum,p)=>sum+p.getIndices().getCount()/3,0),draws:primitives.length});
