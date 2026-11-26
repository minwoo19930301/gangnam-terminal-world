import {NodeIO} from '@gltf-transform/core';
import {ALL_EXTENSIONS} from '@gltf-transform/extensions';
import {weld,simplify,meshopt} from '@gltf-transform/functions';
import {MeshoptEncoder,MeshoptSimplifier} from 'meshoptimizer';
import {fileURLToPath} from 'node:url';
import sharp from 'sharp';
await Promise.all([MeshoptEncoder.ready,MeshoptSimplifier.ready]);
const io=new NodeIO().registerExtensions(ALL_EXTENSIONS).registerDependencies({'meshopt.encoder':MeshoptEncoder});
const file=fileURLToPath(new URL('./niche.glb',import.meta.url)),doc=await io.read(file);
for(const image of doc.getRoot().listTextures()){
 const input=sharp(image.getImage());
 if(image.getName().includes('niche-metal'))image.setImage(await input.resize(512,384,{kernel:'nearest'}).png({palette:true,colours:64,dither:0}).toBuffer()).setMimeType('image/png');
 else image.setImage(await input.jpeg({quality:89,chromaSubsampling:'4:4:4'}).toBuffer()).setMimeType('image/jpeg');
}
await doc.transform(weld(),simplify({simplifier:MeshoptSimplifier,ratio:.35,error:.00018}),meshopt({
 encoder:MeshoptEncoder,level:'medium',quantizePosition:16,quantizeNormal:10,quantizeTexcoord:13
}));
await io.write(file,doc);
console.log('Niche triangles',doc.getRoot().listMeshes().flatMap(m=>m.listPrimitives()).reduce((n,p)=>n+p.getIndices().getCount()/3,0));
