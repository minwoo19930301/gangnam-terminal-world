import {NodeIO} from '@gltf-transform/core';
import {ALL_EXTENSIONS} from '@gltf-transform/extensions';
import {meshopt,weld,simplify} from '@gltf-transform/functions';
import {MeshoptEncoder,MeshoptDecoder,MeshoptSimplifier} from 'meshoptimizer';
import sharp from 'sharp';
import {fileURLToPath} from 'node:url';

await Promise.all([MeshoptEncoder.ready,MeshoptDecoder.ready,MeshoptSimplifier.ready]);
const io=new NodeIO().registerExtensions(ALL_EXTENSIONS).registerDependencies({
  'meshopt.encoder':MeshoptEncoder,'meshopt.decoder':MeshoptDecoder
});
const path=fileURLToPath(new URL('gallery.glb',import.meta.url));
const document=await io.read(path);
await document.transform(weld(),meshopt({encoder:MeshoptEncoder,level:'medium',quantizePosition:16}));
await io.write(path,document);

const screen=fileURLToPath(new URL('frontage.glb',import.meta.url)), facade=await io.read(screen);
for(const image of facade.getRoot().listTextures()){
  if(image.getName().includes('showroom reflections')){
    image.setImage(await sharp(image.getImage()).jpeg({quality:85,chromaSubsampling:'4:4:4'}).toBuffer()).setMimeType('image/jpeg');
  }
}
await facade.transform(weld(),simplify({simplifier:MeshoptSimplifier,ratio:.195,error:.0018}),meshopt({
  encoder:MeshoptEncoder,level:'medium',quantizePosition:15,quantizeNormal:9,quantizeTexcoord:11
}));
await io.write(screen,facade);
console.log('Shopfront triangles',facade.getRoot().listMeshes().flatMap(m=>m.listPrimitives()).reduce((n,p)=>n+p.getIndices().getCount()/3,0));
