// Simplify the furniture as before, preserving coplanar Cycles light samples.
import {NodeIO} from '@gltf-transform/core';
import {ALL_EXTENSIONS,EXTMeshoptCompression} from '@gltf-transform/extensions';
import {joinPrimitives,prune,quantize,reorder,simplifyPrimitive,weld} from '@gltf-transform/functions';
import {MeshoptEncoder,MeshoptSimplifier} from 'meshoptimizer';
await Promise.all([MeshoptEncoder.ready,MeshoptSimplifier.ready]);
const io=new NodeIO().registerExtensions(ALL_EXTENSIONS).registerDependencies({'meshopt.encoder':MeshoptEncoder});
const doc=await io.read(process.argv[2]);
await doc.transform(weld());
const root=doc.getRoot(),nodes=root.listNodes();
const [bodyName, sampleName]=process.argv.slice(4);
const samples=nodes.find(n=>n.getName()===sampleName);
const body=nodes.find(n=>n.getName()===bodyName)?.getMesh();
if(!samples?.getMesh()||!body)throw new Error('Expected a solid display and its baked light samples');
for(const mesh of root.listMeshes()){
  if(mesh===samples.getMesh())continue;
  for(const primitive of mesh.listPrimitives())simplifyPrimitive(primitive,{simplifier:MeshoptSimplifier,ratio:.62,error:.001});
}
// A flat face can carry a strong reflection. Include RGB error when reducing
// these samples, so bright bands survive even with negligible position error.
const baked=samples.getMesh().listPrimitives()[0],positions=baked.getAttribute('POSITION');
const colors=baked.getAttribute('COLOR_0'),rgb=new Float32Array(positions.getCount()*3),c=[];
for(let i=0;i<positions.getCount();i++){
  colors.getElement(i,c);
  rgb.set(c.slice(0,3),i*3);
}
const indices=baked.getIndices(),count=indices.getCount();
const [reduced]=MeshoptSimplifier.simplifyWithAttributes(Uint32Array.from(indices.getArray()),
  positions.getArray(),3,rgb,3,[.9,.9,.9],null,3*Math.floor(count*.58/3),.0007);
indices.setArray(reduced);
const surface=body.listPrimitives()[0],merged=joinPrimitives([surface,baked]);
body.removePrimitive(surface).addPrimitive(merged);
samples.dispose();
await doc.transform(prune(),quantize({quantizePosition:14,quantizeNormal:8}),weld(),reorder({encoder:MeshoptEncoder,target:'size'}));
doc.createExtension(EXTMeshoptCompression).setRequired(true);
await io.write(process.argv[3],doc);
