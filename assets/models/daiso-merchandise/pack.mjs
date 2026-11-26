// Preserve submillimetre label marks and remove triangles below the scale of the shelf hardware.
import {fileURLToPath} from 'node:url';
import {NodeIO} from '@gltf-transform/core';
import {ALL_EXTENSIONS} from '@gltf-transform/extensions';
import {quantize, simplify, weld} from '@gltf-transform/functions';
import {MeshoptDecoder, MeshoptEncoder, MeshoptSimplifier} from 'meshoptimizer';

await Promise.all([MeshoptDecoder.ready,MeshoptEncoder.ready,MeshoptSimplifier.ready]);
const io = new NodeIO().registerExtensions(ALL_EXTENSIONS).registerDependencies({
  'meshopt.decoder':MeshoptDecoder, 'meshopt.encoder':MeshoptEncoder,
});
for (const key of ['kitchen','stationery']) {
  const path = fileURLToPath(new URL(key+'.glb',import.meta.url));
  const doc = await io.read(path);
  await doc.transform(weld(),simplify({simplifier:MeshoptSimplifier,ratio:.72,error:.0006}),
    quantize({quantizePosition:14,quantizeNormal:8}),weld());
  await io.write(path,doc);
}
