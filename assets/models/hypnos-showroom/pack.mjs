import {fileURLToPath} from 'node:url';
import {NodeIO} from '@gltf-transform/core';
import {ALL_EXTENSIONS, EXTMeshoptCompression} from '@gltf-transform/extensions';
import {quantize, simplify, weld} from '@gltf-transform/functions';
import {MeshoptEncoder, MeshoptDecoder, MeshoptSimplifier} from 'meshoptimizer';

await Promise.all([MeshoptEncoder.ready, MeshoptDecoder.ready, MeshoptSimplifier.ready]);
const io = new NodeIO().registerExtensions(ALL_EXTENSIONS).registerDependencies({
  'meshopt.encoder': MeshoptEncoder, 'meshopt.decoder': MeshoptDecoder,
});
const doc = await io.read(process.argv[2]);
await doc.transform(weld(), simplify({simplifier:MeshoptSimplifier, ratio:.34, error:.0015}),
  quantize({quantizePosition:14, quantizeNormal:8}), weld());
doc.createExtension(EXTMeshoptCompression).setRequired(true)
  .setEncoderOptions({method:EXTMeshoptCompression.EncoderMethod.QUANTIZE});
await io.write(fileURLToPath(new URL('./showroom.glb',import.meta.url)),doc);
