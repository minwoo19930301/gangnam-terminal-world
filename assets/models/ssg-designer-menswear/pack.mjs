import {NodeIO} from '@gltf-transform/core';
import {ALL_EXTENSIONS} from '@gltf-transform/extensions';
import {meshopt, simplifyPrimitive, weld} from '@gltf-transform/functions';
import {MeshoptEncoder, MeshoptDecoder, MeshoptSimplifier} from 'meshoptimizer';
import {fileURLToPath} from 'node:url';
import sharp from 'sharp';

await Promise.all([MeshoptEncoder.ready, MeshoptDecoder.ready, MeshoptSimplifier.ready]);
const io = new NodeIO().registerExtensions(ALL_EXTENSIONS).registerDependencies({
  'meshopt.encoder': MeshoptEncoder, 'meshopt.decoder': MeshoptDecoder
});
const path = fileURLToPath(new URL('gallery.glb',import.meta.url));
const doc = await io.read(path);
for (const texture of doc.getRoot().listTextures()) {
  const reduced = await sharp(texture.getImage()).png({palette:true,colours:128,quality:90,dither:0}).toBuffer();
  texture.setImage(reduced);
}
await doc.transform(weld());
for (const node of doc.getRoot().listNodes()) {
  if (!['CucinelliTailoring','CucinelliCashmere','CucinelliSuede'].includes(node.getName())) continue;
  for (const part of node.getMesh().listPrimitives()) {
    simplifyPrimitive(part,{simplifier:MeshoptSimplifier,ratio:.58,error:.0014});
  }
}
await doc.transform(meshopt({encoder:MeshoptEncoder,level:'medium',quantizePosition:16}));
await io.write(path,doc);
