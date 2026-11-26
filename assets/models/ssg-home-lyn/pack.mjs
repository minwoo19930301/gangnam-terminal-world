import {NodeIO} from '@gltf-transform/core';
import {ALL_EXTENSIONS} from '@gltf-transform/extensions';
import {meshopt, weld} from '@gltf-transform/functions';
import {MeshoptDecoder, MeshoptEncoder} from 'meshoptimizer';
import sharp from 'sharp';
import {fileURLToPath} from 'node:url';

await Promise.all([MeshoptEncoder.ready, MeshoptDecoder.ready]);
const io = new NodeIO().registerExtensions(ALL_EXTENSIONS).registerDependencies({
  'meshopt.encoder': MeshoptEncoder, 'meshopt.decoder': MeshoptDecoder
});
const path = fileURLToPath(new URL('haller.glb', import.meta.url));
const doc = await io.read(path);
for (const tex of doc.getRoot().listTextures()) {
  tex.setImage(await sharp(tex.getImage()).jpeg({quality:87, chromaSubsampling:'4:4:4'}).toBuffer());
  tex.setMimeType('image/jpeg');
}
await doc.transform(weld(), meshopt({encoder:MeshoptEncoder, level:'medium', quantizePosition:16}));
await io.write(path,doc);
