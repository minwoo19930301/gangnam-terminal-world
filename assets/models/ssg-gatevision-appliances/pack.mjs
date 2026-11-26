import {NodeIO} from '@gltf-transform/core';
import {ALL_EXTENSIONS} from '@gltf-transform/extensions';
import {meshopt,weld} from '@gltf-transform/functions';
import {MeshoptEncoder} from 'meshoptimizer';
import {fileURLToPath} from 'node:url';

await MeshoptEncoder.ready;
const io=new NodeIO().registerExtensions(ALL_EXTENSIONS)
  .registerDependencies({'meshopt.encoder':MeshoptEncoder});
const path=fileURLToPath(new URL('./boutique.glb',import.meta.url));
const doc=await io.read(path);
await doc.transform(weld(),meshopt({encoder:MeshoptEncoder,level:'medium',quantizePosition:16}));
await io.write(path,doc);
