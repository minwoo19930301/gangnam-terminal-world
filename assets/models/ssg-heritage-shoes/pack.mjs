import sharp from 'sharp';
import {NodeIO} from '@gltf-transform/core';
import {ALL_EXTENSIONS} from '@gltf-transform/extensions';
import {meshopt, simplify, weld} from '@gltf-transform/functions';
import {MeshoptEncoder,MeshoptSimplifier} from 'meshoptimizer';
import {fileURLToPath} from 'node:url';

await Promise.all([MeshoptEncoder.ready,MeshoptSimplifier.ready]);
const io=new NodeIO().registerExtensions(ALL_EXTENSIONS).registerDependencies({'meshopt.encoder':MeshoptEncoder});
const file=fileURLToPath(new URL('gallery.glb',import.meta.url));
const doc=await io.read(file);
for (const texture of doc.getRoot().listTextures()) {
  const name=texture.getName(),image=sharp(texture.getImage());
  if (name.includes('brushed suede')) {
    texture.setImage(await image.jpeg({quality:91,mozjpeg:true}).toBuffer());
    texture.setMimeType('image/jpeg');
  } else if (name.includes('woven elastic')) {
    texture.setImage(await image.resize(384,288).png({palette:true,colours:92,dither:0}).toBuffer());
  } else if (name.includes('surface response')) {
    texture.setImage(await image.resize(192,144,{kernel:'nearest'}).png({palette:true,colours:80,dither:0}).toBuffer());
  }
}
await doc.transform(weld(),simplify({simplifier:MeshoptSimplifier,ratio:.44,error:.00029}),
  meshopt({encoder:MeshoptEncoder,level:'medium',quantizePosition:15,quantizeNormal:8,quantizeTexcoord:12}));
await io.write(file,doc);
console.log('Packed triangles',doc.getRoot().listMeshes().flatMap(m=>m.listPrimitives()).reduce((n,p)=>n+p.getIndices().getCount()/3,0));
