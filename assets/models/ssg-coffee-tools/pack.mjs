// Quantize hardware at sub-millimetre resolution and keep the veneered bar compact.
import {NodeIO} from '@gltf-transform/core';
import {ALL_EXTENSIONS} from '@gltf-transform/extensions';
import {meshopt, weld} from '@gltf-transform/functions';
import {MeshoptDecoder, MeshoptEncoder} from 'meshoptimizer';
import sharp from 'sharp';
import {fileURLToPath} from 'node:url';

await Promise.all([MeshoptDecoder.ready, MeshoptEncoder.ready]);
const io = new NodeIO().registerExtensions(ALL_EXTENSIONS).registerDependencies({
  'meshopt.encoder': MeshoptEncoder, 'meshopt.decoder': MeshoptDecoder
});
const file = fileURLToPath(new URL('gallery.glb',import.meta.url));
const doc = await io.read(file);
for (const texture of doc.getRoot().listTextures()) {
  texture.setImage(await sharp(texture.getImage()).jpeg({quality:84}).toBuffer()).setMimeType('image/jpeg');
}
await doc.transform(weld(), meshopt({encoder:MeshoptEncoder,level:'medium',quantizePosition:16,quantizeNormal:10}));
await io.write(file,doc);
