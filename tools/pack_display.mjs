// Pack static, vertex-coloured Blender furnishings for the close-up loader.
// node tools/pack_display.mjs exported.glb [targetRatio maximumError]
import {NodeIO} from '@gltf-transform/core';
import {ALL_EXTENSIONS} from '@gltf-transform/extensions';
import {quantize, simplify, weld} from '@gltf-transform/functions';
import {MeshoptDecoder, MeshoptEncoder, MeshoptSimplifier} from 'meshoptimizer';

await Promise.all([MeshoptDecoder.ready, MeshoptEncoder.ready, MeshoptSimplifier.ready]);
const io = new NodeIO().registerExtensions(ALL_EXTENSIONS).registerDependencies({
  'meshopt.decoder': MeshoptDecoder, 'meshopt.encoder': MeshoptEncoder,
});
const file = process.argv[2];
const ratio=Number(process.argv[3]??.66),error=Number(process.argv[4]??.00065);
if(!file?.endsWith('.glb')||![3,5].includes(process.argv.length)||!(ratio>0&&ratio<=1&&error>0&&error<=1)) {
  throw new Error('Expected a .glb path and optional simplification ratio and error in (0,1]');
}
const doc = await io.read(file);
await doc.transform(weld(), simplify({simplifier:MeshoptSimplifier, ratio, error}),
  quantize({quantizePosition:14, quantizeNormal:8}), weld());
await io.write(file, doc);
