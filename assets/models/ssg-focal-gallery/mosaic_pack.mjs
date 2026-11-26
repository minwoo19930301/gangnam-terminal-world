import {NodeIO} from '@gltf-transform/core';
import {ALL_EXTENSIONS} from '@gltf-transform/extensions';
import {weld,meshopt} from '@gltf-transform/functions';
import {MeshoptEncoder} from 'meshoptimizer';
import {fileURLToPath} from 'node:url';
import sharp from 'sharp';
await MeshoptEncoder.ready;
const io=new NodeIO().registerExtensions(ALL_EXTENSIONS).registerDependencies({'meshopt.encoder':MeshoptEncoder});
const file=fileURLToPath(new URL('./mosaic.glb',import.meta.url)),doc=await io.read(file);
for(const tx of doc.getRoot().listTextures()){
 const colours=tx.getName().includes('bevel')?28:tx.getName().includes('light')?64:200;
 tx.setImage(await sharp(tx.getImage()).png({palette:true,colours,dither:0}).toBuffer()).setMimeType('image/png');
}
await doc.transform(weld(),meshopt({encoder:MeshoptEncoder,level:'medium',quantizePosition:16,quantizeNormal:10,quantizeTexcoord:14}));
await io.write(file,doc);
console.log(doc.getRoot().listMeshes().map(m=>[m.getName(),m.listPrimitives().reduce((n,p)=>n+p.getIndices().getCount()/3,0)]));
