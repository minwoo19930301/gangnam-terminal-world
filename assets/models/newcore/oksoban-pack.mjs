// Quantize the single place setting to 0.1 mm precision across the tabletop.
import {NodeIO} from '@gltf-transform/core';
import {ALL_EXTENSIONS} from '@gltf-transform/extensions';
import {quantize, simplify, weld} from '@gltf-transform/functions';
import {MeshoptEncoder, MeshoptDecoder, MeshoptSimplifier} from 'meshoptimizer';
import {fileURLToPath} from 'node:url';

await Promise.all([MeshoptDecoder.ready, MeshoptEncoder.ready, MeshoptSimplifier.ready]);
const io = new NodeIO().registerExtensions(ALL_EXTENSIONS).registerDependencies({
  'meshopt.encoder': MeshoptEncoder, 'meshopt.decoder': MeshoptDecoder,
});
const file = fileURLToPath(new URL('./oksoban-setting.glb', import.meta.url));
const scene = await io.read(file);
await scene.transform(
  simplify({simplifier:MeshoptSimplifier, ratio:.65, error:.0012}),
  quantize({quantizePosition:14, quantizeNormal:8}), weld(),
);
await io.write(file, scene);
