import {NodeIO} from '@gltf-transform/core';
import {ALL_EXTENSIONS} from '@gltf-transform/extensions';
import {meshopt} from '@gltf-transform/functions';
import {MeshoptEncoder} from 'meshoptimizer';

await MeshoptEncoder.ready;
const io=new NodeIO().registerExtensions(ALL_EXTENSIONS).registerDependencies({'meshopt.encoder':MeshoptEncoder});
const doc=await io.read(process.argv[2]);
await doc.transform(meshopt({encoder:MeshoptEncoder,level:'medium',quantizePosition:12,quantizeNormal:8}));
await io.write(process.argv[3],doc);
