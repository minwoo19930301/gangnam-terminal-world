import {NodeIO} from '@gltf-transform/core';
import {ALL_EXTENSIONS} from '@gltf-transform/extensions';
import {meshopt, simplify, weld} from '@gltf-transform/functions';
import {MeshoptEncoder, MeshoptSimplifier} from 'meshoptimizer';
import sharp from 'sharp';
import {fileURLToPath} from 'node:url';

await Promise.all([MeshoptEncoder.ready,MeshoptSimplifier.ready]);
const io=new NodeIO().registerExtensions(ALL_EXTENSIONS).registerDependencies({'meshopt.encoder':MeshoptEncoder});
const file=fileURLToPath(new URL('workshop.glb',import.meta.url)),doc=await io.read(file);
for(const texture of doc.getRoot().listTextures()){
  const isResponse=texture.getName().includes('response');
  const src=sharp(texture.getImage());
  if(isResponse)src.resize(640,512,{kernel:'nearest'});
  texture.setImage(await src.png({palette:true,colours:isResponse?24:230,dither:0}).toBuffer()).setMimeType('image/png');
}
await doc.transform(weld(),simplify({simplifier:MeshoptSimplifier,ratio:.61,error:.00016}),meshopt({
  encoder:MeshoptEncoder,level:'medium',quantizePosition:16,quantizeNormal:9,quantizeTexcoord:13
}));
await io.write(file,doc);
console.log('Packed triangles',doc.getRoot().listMeshes().flatMap(m=>m.listPrimitives()).reduce((sum,p)=>sum+p.getIndices().getCount()/3,0));
