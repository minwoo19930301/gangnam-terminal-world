import {NodeIO} from '@gltf-transform/core';
import {ALL_EXTENSIONS} from '@gltf-transform/extensions';
import {meshopt,simplify,weld} from '@gltf-transform/functions';
import {MeshoptEncoder,MeshoptSimplifier} from 'meshoptimizer';
await Promise.all([MeshoptEncoder.ready,MeshoptSimplifier.ready]);
const io=new NodeIO().registerExtensions(ALL_EXTENSIONS).registerDependencies({'meshopt.encoder':MeshoptEncoder});
const doc=await io.read(process.argv[2]);
await doc.transform(weld(),simplify({simplifier:MeshoptSimplifier,ratio:.54,error:.004}),meshopt({encoder:MeshoptEncoder,level:'medium',quantizePosition:13,quantizeNormal:8}));
await io.write(process.argv[3],doc);
