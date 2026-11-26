import fs from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
import path from 'node:path';
import {NodeIO} from '@gltf-transform/core';
import {ALL_EXTENSIONS,EXTMeshoptCompression} from '@gltf-transform/extensions';
import {quantize,simplify,weld,reorder} from '@gltf-transform/functions';
import {MeshoptEncoder,MeshoptDecoder,MeshoptSimplifier} from 'meshoptimizer';

await Promise.all([MeshoptEncoder.ready,MeshoptDecoder.ready,MeshoptSimplifier.ready]);
const io=new NodeIO().registerExtensions(ALL_EXTENSIONS).registerDependencies({
  'meshopt.encoder':MeshoptEncoder,'meshopt.decoder':MeshoptDecoder,
});
const out=fileURLToPath(new URL('./',import.meta.url)), input=process.argv[2];
for(const key of ['hessed','distant']){
  const doc=await io.read(path.join(input,key+'.glb'));
  const far=key==='distant';
  await doc.transform(weld(),simplify({simplifier:MeshoptSimplifier,ratio:far ? .06 : .47,error:far ? .034 : .00115}),
    reorder({encoder:MeshoptEncoder,target:'size'}),
    quantize({quantizePosition:far?11:14,quantizeNormal:8}),weld());
  doc.createExtension(EXTMeshoptCompression).setRequired(true).setEncoderOptions({method:EXTMeshoptCompression.EncoderMethod.QUANTIZE});
  const bytes=await io.writeBinary(doc);
  await fs.writeFile(path.join(out,key+'.glb'),bytes);
  console.log(key+' '+bytes.length+' bytes');
}
