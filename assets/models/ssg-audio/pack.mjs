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
  const name = texture.getName();
  let image = sharp(texture.getImage());
  if (name.includes('요철')) image = image.resize(320,240);
  if (name.includes('금속성')) image = image.resize(80,60,{kernel:'nearest'});
  texture.setImage(await image.png({palette:true,colours:192,dither:0}).toBuffer());
}
await doc.transform(weld());
const products=doc.getRoot().listNodes().find(node=>node.getName()==='SchezadeHeadphones');
for (const primitive of products.getMesh().listPrimitives()) {
  simplifyPrimitive(primitive,{simplifier:MeshoptSimplifier,ratio:.77,error:.00045});
}
await doc.transform(meshopt({encoder:MeshoptEncoder,level:'medium',quantizePosition:16}));
await io.write(path,doc);
