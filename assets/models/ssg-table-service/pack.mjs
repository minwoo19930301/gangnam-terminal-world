import sharp from 'sharp';
import {NodeIO} from '@gltf-transform/core';
import {ALL_EXTENSIONS} from '@gltf-transform/extensions';
import {meshopt,weld} from '@gltf-transform/functions';
import {MeshoptEncoder,MeshoptDecoder} from 'meshoptimizer';
import {fileURLToPath} from 'node:url';

await Promise.all([MeshoptEncoder.ready,MeshoptDecoder.ready]);
const io=new NodeIO().registerExtensions(ALL_EXTENSIONS).registerDependencies({
  'meshopt.encoder':MeshoptEncoder,'meshopt.decoder':MeshoptDecoder
});
const path=fileURLToPath(new URL('gallery.glb',import.meta.url));
const doc=await io.read(path);
for (const texture of doc.getRoot().listTextures()) {
  let image=sharp(texture.getImage());
  if (texture.getName().includes('요철')) {
    texture.setImage(await image.resize(512,512).png({palette:true,colours:192,dither:0}).toBuffer());
  } else {
    texture.setMimeType('image/jpeg');
    texture.setImage(await image.jpeg({quality:88,mozjpeg:true,chromaSubsampling:'4:4:4'}).toBuffer());
  }
}
await doc.transform(weld(),meshopt({encoder:MeshoptEncoder,level:'medium',quantizePosition:16}));
await io.write(path,doc);
