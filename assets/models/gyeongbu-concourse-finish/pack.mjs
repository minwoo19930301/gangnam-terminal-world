// Keep the manually baked surface lighting and its colour texture in a single draw.
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {NodeIO} from '@gltf-transform/core';
import {ALL_EXTENSIONS,KHRMaterialsUnlit,EXTMeshoptCompression} from '@gltf-transform/extensions';
import {quantize,reorder,weld} from '@gltf-transform/functions';
import {MeshoptDecoder,MeshoptEncoder} from 'meshoptimizer';

const file=path.join(path.dirname(fileURLToPath(import.meta.url)),'concourse-finish.glb');
await Promise.all([MeshoptDecoder.ready,MeshoptEncoder.ready]);
const io=new NodeIO().registerExtensions(ALL_EXTENSIONS).registerDependencies({
  'meshopt.decoder':MeshoptDecoder,'meshopt.encoder':MeshoptEncoder,
});
const doc=await io.read(file);
const unlit=doc.createExtension(KHRMaterialsUnlit);
for(const mat of doc.getRoot().listMaterials())mat.setExtension('KHR_materials_unlit',unlit.createUnlit()).setDoubleSided(false);
await doc.transform(weld(),quantize({quantizePosition:14,quantizeTexcoord:13}),weld(),reorder({encoder:MeshoptEncoder,target:'size'}));
doc.createExtension(EXTMeshoptCompression).setRequired(true).setEncoderOptions({method:EXTMeshoptCompression.EncoderMethod.QUANTIZE});
await io.write(file,doc);
