// Source tower coordinates remain full precision, including all roof vertices.
import {NodeIO} from '@gltf-transform/core';
import {ALL_EXTENSIONS} from '@gltf-transform/extensions';
import {prune,quantize} from '@gltf-transform/functions';
const io=new NodeIO().registerExtensions(ALL_EXTENSIONS);
const file=process.argv[2],doc=await io.read(file);
for(const mesh of doc.getRoot().listMeshes())for(const prim of mesh.listPrimitives()){
  if(!prim.getMaterial()?.getBaseColorTexture())prim.setAttribute('TEXCOORD_0',null);
}
await doc.transform(quantize({pattern:/^(NORMAL|COLOR_0)$/,quantizeNormal:8,quantizeColor:8}),prune());
await io.write(file,doc);
