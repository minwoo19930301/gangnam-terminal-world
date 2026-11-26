import sharp from 'sharp';
import {NodeIO} from '@gltf-transform/core';
import {ALL_EXTENSIONS} from '@gltf-transform/extensions';
import {meshopt,simplify,weld} from '@gltf-transform/functions';
import {MeshoptEncoder,MeshoptSimplifier} from 'meshoptimizer';
import {fileURLToPath} from 'node:url';
await Promise.all([MeshoptEncoder.ready,MeshoptSimplifier.ready]);
const io=new NodeIO().registerExtensions(ALL_EXTENSIONS).registerDependencies({'meshopt.encoder':MeshoptEncoder});
const file=fileURLToPath(new URL('gallery.glb',import.meta.url)),doc=await io.read(file);
const mat=doc.getRoot().listMaterials().find(m=>m.getName()==='GarminGangnamWatches');
for(const [tex,dim,n] of [[mat.getBaseColorTexture(),[1024,768],230],[mat.getEmissiveTexture(),[512,384],120]]){
  tex.setImage(await sharp(tex.getImage()).resize(...dim).png({palette:true,colours:n,dither:0}).toBuffer()).setMimeType('image/png');
}
for(const mesh of doc.getRoot().listMeshes()){
  for(const prim of mesh.listPrimitives()){
    if(prim.getMaterial()?.getName()==='GarminGangnamFixtures'){
      prim.setAttribute('TEXCOORD_0',null);
      prim.setAttribute('NORMAL',null);
    }
  }
}
await doc.transform(weld(),simplify({simplifier:MeshoptSimplifier,ratio:.47,error:.00027}),
  meshopt({encoder:MeshoptEncoder,level:'medium',quantizePosition:16,quantizeNormal:9,quantizeTexcoord:13}));
await io.write(file,doc);
console.log('Packed triangles',doc.getRoot().listMeshes().flatMap(m=>m.listPrimitives()).reduce((n,p)=>n+p.getIndices().getCount()/3,0));
