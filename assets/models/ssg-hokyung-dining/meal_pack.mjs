import {NodeIO} from '@gltf-transform/core';
import {ALL_EXTENSIONS} from '@gltf-transform/extensions';
import {weld,simplify,meshopt} from '@gltf-transform/functions';
import {MeshoptEncoder,MeshoptSimplifier} from 'meshoptimizer';
import {fileURLToPath} from 'node:url';
import sharp from 'sharp';
await Promise.all([MeshoptEncoder.ready,MeshoptSimplifier.ready]);
const io=new NodeIO().registerExtensions(ALL_EXTENSIONS).registerDependencies({'meshopt.encoder':MeshoptEncoder});
const file=fileURLToPath(new URL('meal.glb',import.meta.url)),doc=await io.read(file);
for(const tx of doc.getRoot().listTextures()){
 const src=sharp(tx.getImage());const n=tx.getName();
 if(n.includes('table-finish'))tx.setImage(await src.resize(128,128,{kernel:"nearest"}).png({palette:true,colours:24,dither:0}).toBuffer()).setMimeType('image/png');
 else if(n.includes('food-grain'))tx.setImage(await src.resize(384,384).jpeg({quality:74,chromaSubsampling:'4:4:4'}).toBuffer()).setMimeType('image/jpeg');
 else tx.setImage(await src.jpeg({quality:84,chromaSubsampling:'4:4:4'}).toBuffer()).setMimeType('image/jpeg');
}
await doc.transform(weld(),simplify({simplifier:MeshoptSimplifier,ratio:.17,error:.0028}),meshopt({encoder:MeshoptEncoder,level:'medium',quantizePosition:16,quantizeNormal:9,quantizeTexcoord:11}));
await io.write(file,doc);
console.log('Meal triangles',doc.getRoot().listMeshes().flatMap(m=>m.listPrimitives()).reduce((n,p)=>n+p.getIndices().getCount()/3,0));
