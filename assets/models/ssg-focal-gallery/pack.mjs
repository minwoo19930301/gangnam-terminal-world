import {NodeIO} from '@gltf-transform/core';
import {ALL_EXTENSIONS} from '@gltf-transform/extensions';
import {meshopt,weld} from '@gltf-transform/functions';
import {MeshoptDecoder,MeshoptEncoder} from 'meshoptimizer';
import {fileURLToPath} from 'node:url';
await Promise.all([MeshoptEncoder.ready,MeshoptDecoder.ready]);
const io=new NodeIO().registerExtensions(ALL_EXTENSIONS).registerDependencies({'meshopt.encoder':MeshoptEncoder,'meshopt.decoder':MeshoptDecoder});
const file=fileURLToPath(new URL('gallery.glb',import.meta.url));
const doc=await io.read(file);
// The mascot is built of orthogonal flat terraces. Triangle derivatives
// restore their normals exactly in the shader. Remove unused UVs on the
// untextured merchandise and cabinet before welding.
for(const node of doc.getRoot().listNodes()) {
  const primitive=node.getMesh()?.listPrimitives()[0];
  if(!primitive) continue;
  const name=node.getName();
  if(name==='GangnamLegoPuuvilla') primitive.setAttribute('NORMAL',null);
  if(['GangnamLegoEditions','GangnamLegoCabinet'].includes(name))
    primitive.setAttribute('TEXCOORD_0',null);
  if(name==='GangnamLegoCartons') primitive.setAttribute('COLOR_0',null);
}
await doc.transform(weld(),meshopt({encoder:MeshoptEncoder,level:'medium',quantizePosition:16}));
await io.write(file,doc);
for(const mesh of doc.getRoot().listMeshes()) console.log(mesh.getName(),mesh.listPrimitives().map(p=>p.getIndices().getCount()/3));
