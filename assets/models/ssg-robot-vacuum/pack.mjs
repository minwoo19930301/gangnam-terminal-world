import {NodeIO} from '@gltf-transform/core';
import {ALL_EXTENSIONS} from '@gltf-transform/extensions';
import {meshopt, weld, simplify} from '@gltf-transform/functions';
import {MeshoptDecoder, MeshoptEncoder, MeshoptSimplifier} from 'meshoptimizer';
import sharp from 'sharp';
import {fileURLToPath} from 'node:url';

await Promise.all([MeshoptDecoder.ready, MeshoptEncoder.ready, MeshoptSimplifier.ready]);
const io = new NodeIO().registerExtensions(ALL_EXTENSIONS).registerDependencies({
  'meshopt.encoder': MeshoptEncoder, 'meshopt.decoder': MeshoptDecoder
});
const file = fileURLToPath(new URL('gallery.glb',import.meta.url));
const doc = await io.read(file);
// Painted plastic and optics use vertex colour. Discard the generated cube UV
// islands so the matching smooth vertices can weld before compression.
for (const node of doc.getRoot().listNodes()) {
  if (node.getName() === 'RoborockOak') continue;
  for (const primitive of node.getMesh()?.listPrimitives() ?? []) {
    primitive.setAttribute('TEXCOORD_0',null);
  }
}
for (const texture of doc.getRoot().listTextures()) {
  if (texture.getName().includes('normal')) {
    texture.setImage(await sharp(texture.getImage()).resize(768,576).png({palette:true,colours:110,dither:0}).toBuffer()).setMimeType('image/png');
  } else {
    texture.setImage(await sharp(texture.getImage()).jpeg({quality:87,chromaSubsampling:'4:4:4'}).toBuffer()).setMimeType('image/jpeg');
  }
}
await doc.transform(weld(), simplify({simplifier:MeshoptSimplifier,ratio:.66,error:.00018}), meshopt({encoder:MeshoptEncoder,level:'medium',quantizePosition:16,quantizeNormal:10}));
await io.write(file,doc);

console.log('Runtime triangles', doc.getRoot().listMeshes().flatMap(m=>m.listPrimitives()).reduce((s,p)=>s+p.getIndices().getCount()/3,0));
