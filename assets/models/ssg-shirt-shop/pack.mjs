import {NodeIO} from '@gltf-transform/core';
import {ALL_EXTENSIONS} from '@gltf-transform/extensions';
import {meshopt, weld, simplifyPrimitive} from '@gltf-transform/functions';
import {MeshoptEncoder, MeshoptDecoder, MeshoptSimplifier} from 'meshoptimizer';
import sharp from 'sharp';
import {fileURLToPath} from 'node:url';

await Promise.all([MeshoptEncoder.ready, MeshoptDecoder.ready, MeshoptSimplifier.ready]);
const io = new NodeIO().registerExtensions(ALL_EXTENSIONS).registerDependencies({
  'meshopt.encoder': MeshoptEncoder, 'meshopt.decoder': MeshoptDecoder
});
const path = fileURLToPath(new URL('gallery.glb',import.meta.url));
const doc = await io.read(path);
// Oak grain is an opaque colour map. Preserve the full UV layout in JPEG.
for (const texture of doc.getRoot().listTextures()) {
  const image=await sharp(texture.getImage()).jpeg({quality:85}).toBuffer();
  texture.setImage(image).setMimeType('image/jpeg');
}
await doc.transform(weld());
// Reduce the dense intermediate quilt rings only. Preserve the separate
// zipper, hood, pocket, case and shelf silhouettes in the editable library.
const jackets=doc.getRoot().listNodes().find(n=>n.getName()==='HernoGangnamNylon');
for(const primitive of jackets.getMesh().listPrimitives()){
  simplifyPrimitive(primitive,{simplifier:MeshoptSimplifier,ratio:.80,error:.00025});
}
await doc.transform(meshopt({encoder:MeshoptEncoder,level:'medium',quantizePosition:16}));
await io.write(path,doc);
