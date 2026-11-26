import sharp from 'sharp';
import {NodeIO} from '@gltf-transform/core';
import {ALL_EXTENSIONS} from '@gltf-transform/extensions';
import {meshopt,simplify,weld} from '@gltf-transform/functions';
import {MeshoptEncoder,MeshoptSimplifier} from 'meshoptimizer';
import {fileURLToPath} from 'node:url';

await Promise.all([MeshoptEncoder.ready,MeshoptSimplifier.ready]);
const io = new NodeIO().registerExtensions(ALL_EXTENSIONS)
  .registerDependencies({'meshopt.encoder':MeshoptEncoder});
const path = fileURLToPath(new URL('snoopy-place.glb',import.meta.url));
const doc = await io.read(path);
for (const texture of doc.getRoot().listTextures()) {
  const key=texture.getName();
  const image=sharp(texture.getImage());
  if (key.includes('제품과 타일')) {
    texture.setMimeType('image/jpeg');
    texture.setImage(await image.jpeg({quality:91,mozjpeg:true,chromaSubsampling:'4:4:4'}).toBuffer());
  } else if (key.includes('섬유 요철')) {
    texture.setImage(await image.resize(512,352).png({palette:true,colours:160,dither:0}).toBuffer());
  } else if (key.includes('거칠기')) {
    texture.setImage(await image.resize(256,176,{kernel:'nearest'}).png({palette:true,colours:64,dither:0}).toBuffer());
  }
}
// Collapse near-coincident pole rings and collinear lettering edges after
// authoring the miniature goods at their dedicated runtime tessellation.
await doc.transform(weld(),simplify({simplifier:MeshoptSimplifier,ratio:.72,error:.00014}),meshopt({encoder:MeshoptEncoder,level:'medium',quantizePosition:16}));
await io.write(path,doc);
