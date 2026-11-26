// Keep close-up product colours and thin sectional layers in one compact draw.
import {NodeIO} from '@gltf-transform/core';
import {ALL_EXTENSIONS} from '@gltf-transform/extensions';
import {quantize, simplify, weld} from '@gltf-transform/functions';
import {MeshoptDecoder, MeshoptEncoder, MeshoptSimplifier} from 'meshoptimizer';

await Promise.all([MeshoptDecoder.ready, MeshoptEncoder.ready, MeshoptSimplifier.ready]);
const io = new NodeIO().registerExtensions(ALL_EXTENSIONS).registerDependencies({
  'meshopt.decoder': MeshoptDecoder, 'meshopt.encoder': MeshoptEncoder,
});
const file = process.argv[2];
const doc = await io.read(file);
await doc.transform(weld(), simplify({simplifier:MeshoptSimplifier, ratio:.66, error:.00065}),
  quantize({quantizePosition:14, quantizeNormal:8}), weld());
await io.write(file, doc);
