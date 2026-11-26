import {NodeIO} from '@gltf-transform/core';
import {ALL_EXTENSIONS} from '@gltf-transform/extensions';
import {meshopt, simplify, weld} from '@gltf-transform/functions';
import {MeshoptEncoder, MeshoptDecoder, MeshoptSimplifier} from 'meshoptimizer';
import sharp from 'sharp';
import {fileURLToPath} from 'node:url';

await Promise.all([MeshoptEncoder.ready, MeshoptDecoder.ready, MeshoptSimplifier.ready]);
const io = new NodeIO().registerExtensions(ALL_EXTENSIONS).registerDependencies({
  'meshopt.encoder': MeshoptEncoder, 'meshopt.decoder': MeshoptDecoder
});
const path = fileURLToPath(new URL('gallery.glb',import.meta.url));
const doc = await io.read(path);
for(const tx of doc.getRoot().listTextures()){
  if(tx.getName().includes('vessel-colour')||tx.getName().includes('tent reflection'))tx.setImage(await sharp(tx.getImage()).jpeg({quality:86,chromaSubsampling:'4:4:4'}).toBuffer()).setMimeType('image/jpeg');
  else if(tx.getName().includes('vessel-response'))tx.setImage(await sharp(tx.getImage()).resize(512,384,{kernel:'nearest'}).png({palette:true,colours:24,dither:0}).toBuffer()).setMimeType('image/png');
}
await doc.transform(weld(),simplify({simplifier:MeshoptSimplifier,ratio:.55,error:.00036}),meshopt({
  encoder:MeshoptEncoder,level:'medium',quantizePosition:16,quantizeNormal:10,quantizeTexcoord:13
}));
await io.write(path,doc);

console.log('Triangles',doc.getRoot().listMeshes().flatMap(m=>m.listPrimitives()).reduce((n,p)=>n+p.getIndices().getCount()/3,0));
