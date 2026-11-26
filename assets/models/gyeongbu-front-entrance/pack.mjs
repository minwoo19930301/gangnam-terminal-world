// Preserve physical outdoor materials, daylight normals and a single packed image per landmark.
import {fileURLToPath} from 'node:url';
import {NodeIO} from '@gltf-transform/core';
import {ALL_EXTENSIONS,EXTMeshoptCompression} from '@gltf-transform/extensions';
import {weld,quantize,reorder} from '@gltf-transform/functions';
import {MeshoptDecoder,MeshoptEncoder} from 'meshoptimizer';
await Promise.all([MeshoptDecoder.ready,MeshoptEncoder.ready]);
const io=new NodeIO().registerExtensions(ALL_EXTENSIONS).registerDependencies({'meshopt.decoder':MeshoptDecoder,'meshopt.encoder':MeshoptEncoder});
for(const file of ['portal.glb','tower.glb']){
  const path=fileURLToPath(new URL(file,import.meta.url)),doc=await io.read(path);
  await doc.transform(weld(),quantize({quantizePosition:15,quantizeNormal:9,quantizeTexcoord:13}),weld(),reorder({encoder:MeshoptEncoder,target:'size'}));
  doc.createExtension(EXTMeshoptCompression).setRequired(true).setEncoderOptions({method:EXTMeshoptCompression.EncoderMethod.QUANTIZE});
  await io.write(path,doc);
}
