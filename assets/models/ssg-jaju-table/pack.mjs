import {NodeIO} from '@gltf-transform/core';
import {ALL_EXTENSIONS} from '@gltf-transform/extensions';
import {meshopt, weld} from '@gltf-transform/functions';
import {MeshoptEncoder, MeshoptDecoder} from 'meshoptimizer';
import sharp from 'sharp';
import {fileURLToPath} from 'node:url';

await Promise.all([MeshoptEncoder.ready, MeshoptDecoder.ready]);
const io = new NodeIO().registerExtensions(ALL_EXTENSIONS).registerDependencies({
  'meshopt.encoder':MeshoptEncoder, 'meshopt.decoder':MeshoptDecoder
});
const path = fileURLToPath(new URL('gallery.glb',import.meta.url));
const doc = await io.read(path);
for (const tex of doc.getRoot().listTextures()) {
  const jpeg = await sharp(tex.getImage()).jpeg({quality:86,chromaSubsampling:'4:4:4'}).toBuffer();
  tex.setImage(jpeg).setMimeType('image/jpeg');
}
await doc.transform(weld(),meshopt({encoder:MeshoptEncoder,level:'medium',quantizePosition:16}));
await io.write(path,doc);
for (const mesh of doc.getRoot().listMeshes()) {
  console.log(mesh.getName(), mesh.listPrimitives().map(p=>p.getIndices().getCount()/3));
}
