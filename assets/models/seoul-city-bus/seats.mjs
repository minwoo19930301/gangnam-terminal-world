// The metal and plastic shell shares one prototype. The other primitive receives
// a per-seat upholstery colour when its 28 transforms are sent to the GPU.
import {NodeIO} from '@gltf-transform/core';
import {ALL_EXTENSIONS,EXTMeshoptCompression} from '@gltf-transform/extensions';
import {mergeDocuments,unpartition,weld,reorder} from '@gltf-transform/functions';
import {MeshoptDecoder,MeshoptEncoder} from 'meshoptimizer';
await Promise.all([MeshoptDecoder.ready,MeshoptEncoder.ready]);
const [frame,pad,out]=process.argv.slice(2);
const io=new NodeIO().registerExtensions(ALL_EXTENSIONS).registerDependencies({'meshopt.decoder':MeshoptDecoder,'meshopt.encoder':MeshoptEncoder});
const target=await io.read(frame),other=await io.read(pad);
mergeDocuments(target,other);
const [scene,...extra]=target.getRoot().listScenes();
for(const s of extra){for(const n of [...s.listChildren()])scene.addChild(n);s.dispose();}
target.getRoot().setDefaultScene(scene);
await target.transform(unpartition(),weld(),reorder({encoder:MeshoptEncoder,target:'size'}));
target.createExtension(EXTMeshoptCompression).setRequired(true).setEncoderOptions({method:EXTMeshoptCompression.EncoderMethod.QUANTIZE});
await io.write(out,target);
