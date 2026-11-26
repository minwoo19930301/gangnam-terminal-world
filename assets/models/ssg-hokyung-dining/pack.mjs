import {NodeIO} from '@gltf-transform/core';
import {ALL_EXTENSIONS} from '@gltf-transform/extensions';
import {meshopt,weld} from '@gltf-transform/functions';
import {MeshoptEncoder} from 'meshoptimizer';
import sharp from 'sharp';
import {fileURLToPath} from 'node:url';
const file=fileURLToPath(new URL('gallery.glb',import.meta.url));
await MeshoptEncoder.ready;
const io=new NodeIO().registerExtensions(ALL_EXTENSIONS).registerDependencies({'meshopt.encoder':MeshoptEncoder});
const doc=await io.read(file);
for(const tex of doc.getRoot().listTextures()){
  tex.setImage(await sharp(tex.getImage()).jpeg({quality:85,mozjpeg:true}).toBuffer()).setMimeType('image/jpeg');
}
await doc.transform(weld(),meshopt({encoder:MeshoptEncoder,level:'medium',quantizePosition:16,quantizeTexcoord:13}));
await io.write(file,doc);
console.log(doc.getRoot().listMeshes().map(m=>[m.getName(),m.listPrimitives().reduce((n,p)=>n+p.getIndices().getCount()/3,0)]));
