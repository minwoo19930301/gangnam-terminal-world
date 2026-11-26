// Pack static, vertex-coloured Blender furnishings for the close-up loader.
// node tools/pack_display.mjs exported.glb
import {NodeIO} from '@gltf-transform/core';
import {ALL_EXTENSIONS} from '@gltf-transform/extensions';
import {quantize, simplify, weld} from '@gltf-transform/functions';
import {MeshoptDecoder, MeshoptEncoder, MeshoptSimplifier} from 'meshoptimizer';

await Promise.all([MeshoptDecoder.ready, MeshoptEncoder.ready, MeshoptSimplifier.ready]);
const io = new NodeIO().registerExtensions(ALL_EXTENSIONS).registerDependencies({
  'meshopt.decoder': MeshoptDecoder, 'meshopt.encoder': MeshoptEncoder,
});
const file = process.argv[2];
if (!file?.endsWith('.glb') || process.argv.length !== 3) throw new Error('Expected one .glb path');
const doc = await io.read(file);
await doc.transform(weld(), simplify({simplifier:MeshoptSimplifier, ratio:.66, error:.00065}),
  quantize({quantizePosition:14, quantizeNormal:8}), weld());
await io.write(file, doc);
