import sharp from 'sharp';
import {NodeIO} from '@gltf-transform/core';
import {ALL_EXTENSIONS} from '@gltf-transform/extensions';
import {meshopt,simplify,weld} from '@gltf-transform/functions';
import {MeshoptDecoder,MeshoptEncoder,MeshoptSimplifier} from 'meshoptimizer';
import {fileURLToPath} from 'node:url';

await Promise.all([MeshoptDecoder.ready,MeshoptEncoder.ready,MeshoptSimplifier.ready]);
const io=new NodeIO().registerExtensions(ALL_EXTENSIONS).registerDependencies({
  'meshopt.encoder': MeshoptEncoder, 'meshopt.decoder': MeshoptDecoder
});
const file=fileURLToPath(new URL('lightnow.glb',import.meta.url));
const doc=await io.read(file);
for (const tex of doc.getRoot().listTextures()) {
  const name=tex.getName(),image=sharp(tex.getImage());
  if (name.includes('reclaimed timber')) {
    tex.setImage(await image.jpeg({quality:89,mozjpeg:true,chromaSubsampling:'4:4:4'}).toBuffer());
    tex.setMimeType('image/jpeg');
  } else if (name.includes('sawn plank')) {
    tex.setImage(await image.resize(512,384).png({palette:true,colours:128,dither:0}).toBuffer());
  } else if (name.includes('surface response')) {
    tex.setImage(await image.resize(512,384,{kernel:'nearest'}).png({palette:true,colours:96,dither:0}).toBuffer());
  }
}
await doc.transform(weld(),simplify({simplifier:MeshoptSimplifier,ratio:.51,error:.00017}),meshopt({encoder:MeshoptEncoder,level:'medium',quantizePosition:16,quantizeNormal:10}));
await io.write(file,doc);
