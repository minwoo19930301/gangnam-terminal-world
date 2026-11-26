import {NodeIO} from '@gltf-transform/core';
import {ALL_EXTENSIONS} from '@gltf-transform/extensions';
import {weld,simplify,meshopt} from '@gltf-transform/functions';
import {MeshoptEncoder,MeshoptSimplifier} from 'meshoptimizer';
import sharp from 'sharp';
import {fileURLToPath} from 'node:url';
const file=fileURLToPath(new URL('figurine.glb',import.meta.url));
await Promise.all([MeshoptEncoder.ready,MeshoptSimplifier.ready]);
const io=new NodeIO().registerExtensions(ALL_EXTENSIONS).registerDependencies({'meshopt.encoder':MeshoptEncoder});
const doc=await io.read(file);
for(const t of doc.getRoot().listTextures()){
  const image=await sharp(t.getImage()).resize(768,768).jpeg({quality:84,chromaSubsampling:'4:2:0',mozjpeg:true}).toBuffer();
  t.setImage(image).setMimeType('image/jpeg').setURI('porcelain-enamel.jpg');
}
await doc.transform(weld(),simplify({simplifier:MeshoptSimplifier,ratio:.47,error:.00065}),meshopt({encoder:MeshoptEncoder,level:'medium',quantizePosition:15,quantizeTexcoord:13}));
await io.write(file,doc);
