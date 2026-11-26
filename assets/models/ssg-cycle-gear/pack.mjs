import sharp from 'sharp';
import {NodeIO} from '@gltf-transform/core';
import {ALL_EXTENSIONS} from '@gltf-transform/extensions';
import {meshopt, weld, simplify} from '@gltf-transform/functions';
import {MeshoptEncoder, MeshoptDecoder, MeshoptSimplifier} from 'meshoptimizer';
import {fileURLToPath} from 'node:url';

await Promise.all([MeshoptEncoder.ready, MeshoptDecoder.ready,MeshoptSimplifier.ready]);
const io = new NodeIO().registerExtensions(ALL_EXTENSIONS).registerDependencies({
  'meshopt.encoder': MeshoptEncoder, 'meshopt.decoder': MeshoptDecoder
});
const path = fileURLToPath(new URL('gallery.glb',import.meta.url));
const doc = await io.read(path);
for (const texture of doc.getRoot().listTextures()) {
  const key=texture.getName();
  const image=sharp(texture.getImage());
  if (key.includes('요철')) {
    texture.setImage(await image.resize(384,288).png({palette:true,colours:160,dither:0}).toBuffer());
  } else if (key.includes('표면')) {
    texture.setMimeType('image/jpeg');
    texture.setImage(await image.jpeg({quality:85,mozjpeg:true,chromaSubsampling:'4:4:4'}).toBuffer());
  } else {
    texture.setImage(await image.resize(192,144,{kernel:'nearest'}).png({palette:true,colours:96,dither:0}).toBuffer());
  }
}
await doc.transform(weld(),simplify({simplifier:MeshoptSimplifier,ratio:.68,error:.00018}),meshopt({encoder:MeshoptEncoder,level:'medium',quantizePosition:16}));
await io.write(path,doc);
