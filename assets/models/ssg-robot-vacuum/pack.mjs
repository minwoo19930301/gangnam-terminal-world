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
// Painted plastic and optics use vertex colour. Discard the generated cube UV
// islands so the matching smooth vertices can weld before compression.
for (const node of doc.getRoot().listNodes()) {
  if (node.getName() === 'RoborockOak') continue;
  for (const primitive of node.getMesh()?.listPrimitives() ?? []) {
    primitive.setAttribute('TEXCOORD_0',null);
  }
}
for (const texture of doc.getRoot().listTextures()) {
  texture.setImage(await sharp(texture.getImage()).jpeg({quality:84}).toBuffer()).setMimeType('image/jpeg');
}
await doc.transform(weld(), meshopt({encoder:MeshoptEncoder,level:'medium',quantizePosition:16,quantizeNormal:10}));
await io.write(file,doc);
