import {NodeIO} from '@gltf-transform/core';
import {ALL_EXTENSIONS} from '@gltf-transform/extensions';
import {meshopt,simplifyPrimitive,weld} from '@gltf-transform/functions';
import {MeshoptDecoder,MeshoptEncoder,MeshoptSimplifier} from 'meshoptimizer';
import {fileURLToPath} from 'node:url';
await Promise.all([MeshoptEncoder.ready,MeshoptDecoder.ready]);
const io=new NodeIO().registerExtensions(ALL_EXTENSIONS).registerDependencies({
  'meshopt.encoder':MeshoptEncoder,'meshopt.decoder':MeshoptDecoder
});
const path=fileURLToPath(new URL('gallery.glb',import.meta.url));
const doc=await io.read(path);
const ink=doc.getRoot().listMaterials().find(m=>m.getName()==='CdgGangnamInk');
ink.setAlphaMode('MASK').setAlphaCutoff(.45);
await doc.transform(weld());
for(const node of doc.getRoot().listNodes()) {
  if(node.getName()!=='CdgGangnamCutAndSewn')continue;
  for(const p of node.getMesh().listPrimitives()) {
    simplifyPrimitive(p,{simplifier:MeshoptSimplifier,ratio:.73,error:.0008});
  }
}
await doc.transform(meshopt({encoder:MeshoptEncoder,level:'medium',quantizePosition:16}));
await io.write(path,doc);
