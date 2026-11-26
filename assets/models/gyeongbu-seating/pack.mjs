// Fit the runtime mesh to millimetre-scale bench parts without shipping edit geometry.
import {NodeIO} from '@gltf-transform/core';
import {ALL_EXTENSIONS} from '@gltf-transform/extensions';
import {quantize, simplify, weld} from '@gltf-transform/functions';
import {MeshoptDecoder, MeshoptEncoder, MeshoptSimplifier} from 'meshoptimizer';

await Promise.all([MeshoptDecoder.ready, MeshoptEncoder.ready, MeshoptSimplifier.ready]);
const io = new NodeIO().registerExtensions(ALL_EXTENSIONS).registerDependencies({
  'meshopt.decoder':MeshoptDecoder,'meshopt.encoder':MeshoptEncoder,
});
const file = process.argv[2];
const doc = await io.read(file);
await doc.transform(weld(),simplify({simplifier:MeshoptSimplifier,ratio:.62,error:.001}),
  quantize({quantizePosition:14,quantizeNormal:8}),weld());
await io.write(file,doc);
