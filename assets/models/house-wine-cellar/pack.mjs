// Preserve local lamp gradients while reducing the planar backing and repeated bottle bodies.
import {NodeIO} from '@gltf-transform/core';
import {ALL_EXTENSIONS,EXTMeshoptCompression} from '@gltf-transform/extensions';
import {prune,quantize,reorder,weld} from '@gltf-transform/functions';
import {MeshoptEncoder,MeshoptSimplifier} from 'meshoptimizer';

const [source,destination,key]=process.argv.slice(2);
await Promise.all([MeshoptEncoder.ready,MeshoptSimplifier.ready]);
const io=new NodeIO().registerExtensions(ALL_EXTENSIONS).registerDependencies({'meshopt.encoder':MeshoptEncoder});
const doc=await io.read(source);
const prim=doc.getRoot().listMeshes()[0].listPrimitives()[0];
const colors=prim.getAttribute('COLOR_0'),rgba=[];
for(let i=0;i<colors.getCount();i++){
  colors.getElement(i,rgba);
  for(let j=0;j<3;j++)rgba[j]=Math.round(Math.sqrt(Math.max(0,rgba[j]))*90)**2/8100;
  colors.setElement(i,rgba);
}
await doc.transform(weld());
const pos=prim.getAttribute('POSITION'),col=prim.getAttribute('COLOR_0'),rgb=new Float32Array(pos.getCount()*3);
for(let i=0;i<pos.getCount();i++){col.getElement(i,rgba);rgb.set(rgba.slice(0,3),i*3);}
const index=prim.getIndices(),n=index.getCount();
const ratio={gallery:.45,wall:.43,desk:.56,island:.48,ceiling:.83}[key];
if(!ratio)throw Error('Unknown public fitting '+key);
const [indices]=MeshoptSimplifier.simplifyWithAttributes(Uint32Array.from(index.getArray()),pos.getArray(),3,rgb,3,
  [.32,.46,.25],null,3*Math.floor(n*ratio/3),.0030);
index.setArray(indices);
await doc.transform(prune(),quantize({quantizePosition:14}),weld(),reorder({encoder:MeshoptEncoder,target:'size'}));
doc.createExtension(EXTMeshoptCompression).setRequired(true);
await io.write(destination,doc);
console.log(key,n/3,'triangles to',indices.length/3);
