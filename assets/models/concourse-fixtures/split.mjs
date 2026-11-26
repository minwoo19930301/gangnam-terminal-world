// Preserve the combined export for existing consumers and pack the two independently visited floors.
import {fileURLToPath} from 'node:url';
import {NodeIO} from '@gltf-transform/core';
import {ALL_EXTENSIONS,EXTMeshoptCompression} from '@gltf-transform/extensions';
import {prune} from '@gltf-transform/functions';
import {MeshoptEncoder,MeshoptDecoder} from 'meshoptimizer';

await Promise.all([MeshoptEncoder.ready,MeshoptDecoder.ready]);
const io=new NodeIO().registerExtensions(ALL_EXTENSIONS).registerDependencies({
  'meshopt.encoder':MeshoptEncoder,'meshopt.decoder':MeshoptDecoder
});
const file=name=>fileURLToPath(new URL(name,import.meta.url));
for(const [filename,accept] of [
  ['ticket-kiosk.glb',name=>name==='TicketKiosk'],['cushions.glb',name=>name.startsWith('Cushion')]
]){
  const doc=await io.read(file('fixtures.glb'));
  for(const node of doc.getRoot().listNodes())if(node.getMesh()&&!accept(node.getName()))node.dispose();
  await doc.transform(prune());
  doc.createExtension(EXTMeshoptCompression).setRequired(true)
    .setEncoderOptions({method:EXTMeshoptCompression.EncoderMethod.QUANTIZE});
  await io.write(file(filename),doc);
}
