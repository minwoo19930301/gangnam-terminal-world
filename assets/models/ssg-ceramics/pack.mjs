import sharp from 'sharp';
import {NodeIO} from '@gltf-transform/core';
import {ALL_EXTENSIONS} from '@gltf-transform/extensions';
import {meshopt,simplify,weld} from '@gltf-transform/functions';
import {MeshoptEncoder,MeshoptSimplifier} from 'meshoptimizer';
import {fileURLToPath} from 'node:url';

await Promise.all([MeshoptEncoder.ready,MeshoptSimplifier.ready]);
const io=new NodeIO().registerExtensions(ALL_EXTENSIONS).registerDependencies({'meshopt.encoder':MeshoptEncoder});
const file=fileURLToPath(new URL('showroom.glb',import.meta.url));
const doc=await io.read(file);
const service=doc.getRoot().listMaterials().find(m=>m.getName()==='KwangjuyoCraftSurfaces');
const colour=service.getBaseColorTexture(),normal=service.getNormalTexture(),rough=service.getMetallicRoughnessTexture();
colour.setImage(await sharp(colour.getImage()).jpeg({quality:89,mozjpeg:true}).toBuffer()).setMimeType('image/jpeg');
normal.setImage(await sharp(normal.getImage()).resize(384,320).png({palette:true,colours:112,dither:0}).toBuffer());
rough.setImage(await sharp(rough.getImage()).resize(288,240).png({palette:true,colours:96,dither:0}).toBuffer());
await doc.transform(weld(),simplify({simplifier:MeshoptSimplifier,ratio:.45,error:.00032}),
  meshopt({encoder:MeshoptEncoder,level:'medium',quantizePosition:16,quantizeNormal:9,quantizeTexcoord:13}));
await io.write(file,doc);
console.log('Packed triangles',doc.getRoot().listMeshes().flatMap(m=>m.listPrimitives()).reduce((n,p)=>n+p.getIndices().getCount()/3,0));
