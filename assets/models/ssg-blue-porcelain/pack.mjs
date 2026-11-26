// Preserve the fluted profiles and all painted UV islands. Compress shared
// normal/UV tuples and quantize positions to 16 bits across the 4.56m display.
import {NodeIO} from '@gltf-transform/core';
import {ALL_EXTENSIONS} from '@gltf-transform/extensions';
import {meshopt,weld} from '@gltf-transform/functions';
import {MeshoptEncoder} from 'meshoptimizer';
import {fileURLToPath} from 'node:url';
await MeshoptEncoder.ready;
const path=fileURLToPath(new URL('display.glb',import.meta.url));
const io=new NodeIO().registerExtensions(ALL_EXTENSIONS).registerDependencies({'meshopt.encoder':MeshoptEncoder});
const doc=await io.read(path);
await doc.transform(weld(),meshopt({encoder:MeshoptEncoder,level:'medium',quantizePosition:16,quantizeTexcoord:14}));
await io.write(path,doc);
await import('./figurine_pack.mjs');
