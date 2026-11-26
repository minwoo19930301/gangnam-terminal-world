import {NodeIO} from '@gltf-transform/core';
import {ALL_EXTENSIONS} from '@gltf-transform/extensions';
import {meshopt,weld} from '@gltf-transform/functions';
import {MeshoptEncoder,MeshoptDecoder} from 'meshoptimizer';
import {fileURLToPath} from 'node:url';

await Promise.all([MeshoptEncoder.ready,MeshoptDecoder.ready]);
const io=new NodeIO().registerExtensions(ALL_EXTENSIONS).registerDependencies({
  'meshopt.encoder':MeshoptEncoder,'meshopt.decoder':MeshoptDecoder
});
const file=fileURLToPath(new URL('atelier.glb',import.meta.url));
const doc=await io.read(file);
const fixtures=doc.getRoot().listNodes().find(node=>node.getName()==='ChouxJoinery').getMesh();
for(const prim of fixtures.listPrimitives())prim.setAttribute('TEXCOORD_0',null);
await doc.transform(weld(),meshopt({encoder:MeshoptEncoder,level:'medium',quantizePosition:16}));
await io.write(file,doc);
