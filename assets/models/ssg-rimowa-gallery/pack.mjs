import {NodeIO} from '@gltf-transform/core';
import {ALL_EXTENSIONS} from '@gltf-transform/extensions';
import {meshopt, simplifyPrimitive, weld} from '@gltf-transform/functions';
import {MeshoptEncoder, MeshoptDecoder, MeshoptSimplifier} from 'meshoptimizer';
import sharp from 'sharp';
import {fileURLToPath} from 'node:url';

await Promise.all([MeshoptEncoder.ready,MeshoptDecoder.ready,MeshoptSimplifier.ready]);
const io=new NodeIO().registerExtensions(ALL_EXTENSIONS).registerDependencies({
  'meshopt.encoder':MeshoptEncoder,'meshopt.decoder':MeshoptDecoder
});
const path=fileURLToPath(new URL('gallery.glb',import.meta.url));
const doc=await io.read(path);
await doc.transform(weld());
// The long constant-section ribs and the piping around the fabric ovals
// have many nearly collinear segments. Preserve the rectangular latch faces.
for (const node of doc.getRoot().listNodes()) {
  const metal=node.getName()==='RimowaGangnamAluminium';
  if (!metal && node.getName()!=='RimowaGangnamTextiles') continue;
  for (const prim of node.getMesh().listPrimitives()) {
    simplifyPrimitive(prim,{simplifier:MeshoptSimplifier,ratio:metal?.32:.39,error:metal?.00045:.00065});
  }
}
for (const tex of doc.getRoot().listTextures()) {
  if(tex.getMimeType()!=='image/jpeg')continue;
  tex.setImage(await sharp(tex.getImage()).resize({width:768}).jpeg({quality:79}).toBuffer());
}
await doc.transform(meshopt({encoder:MeshoptEncoder,level:'medium',quantizePosition:16}));
await io.write(path,doc);

await import('./niche_pack.mjs');
