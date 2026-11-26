// Retain the Blender exports as authors' libraries. The game fetches one named
// collection and a metric, colour-preserving distant silhouette as it approaches.
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import {NodeIO} from '@gltf-transform/core';
import {ALL_EXTENSIONS,EXTMeshoptCompression} from '@gltf-transform/extensions';
import {cloneDocument,prune} from '@gltf-transform/functions';
import {MeshoptDecoder,MeshoptEncoder,MeshoptSimplifier} from 'meshoptimizer';

await Promise.all([MeshoptDecoder.ready,MeshoptEncoder.ready,MeshoptSimplifier.ready]);
const io=new NodeIO().registerExtensions(ALL_EXTENSIONS).registerDependencies({'meshopt.decoder':MeshoptDecoder,'meshopt.encoder':MeshoptEncoder});
const directory=new URL('./',import.meta.url),manifest={};
const files=[['market','../gyeongbu/market.glb'],['daiso','../daiso/shop.glb']];
function singleMesh(node) {
  const result=[];node.traverse(child=>{if(child.getMesh())result.push(child);});
  assert.equal(result.length,1,'one native mesh per named collection');
  assert.equal(result[0].getMesh().listPrimitives().length,1);
  return result[0];
}
function silhouette(node,key) {
  const part=node.getMesh().listPrimitives()[0],positions=part.getAttribute('POSITION'),colours=part.getAttribute('COLOR_0');
  const xyz=new Float32Array(positions.getCount()*3),indices=Uint32Array.from(part.getIndices().getArray());
  const m=node.getWorldMatrix(),min=[Infinity,Infinity,Infinity],max=[-Infinity,-Infinity,-Infinity],p=[];
  for(let i=0;i<positions.getCount();i++){
    positions.getElement(i,p);
    for(let k=0;k<3;k++){
      const value=m[k]*p[0]+m[4+k]*p[1]+m[8+k]*p[2]+m[12+k];
      xyz[3*i+k]=value;min[k]=Math.min(value,min[k]);max[k]=Math.max(value,max[k]);
    }
  }
  const target=key==='DaisoSign'?95:key==='SelfCheckout'?140:210;
  const attrs=new Float32Array(3*positions.getCount());
  for(let i=0;i<positions.getCount();i++)attrs.set(colours.getElement(i,[]).slice(0,3),i*3);
  const [semantic]=MeshoptSimplifier.simplifyWithAttributes(indices,xyz,3,attrs,3,[.30,.30,.30],null,
    3*target,.22,['Permissive','Prune']);
  const [sloppy]=MeshoptSimplifier.simplifySloppy(indices,xyz,3,null,3*target,.38);
  let reduced=semantic;
  if(reduced.length<target*1.5||reduced.length>target*5){
    const [outline]=MeshoptSimplifier.simplifyWithAttributes(indices,xyz,3,attrs,3,[.22,.22,.22],null,
      target*3,.23,['Permissive']);
    reduced=outline.length<=3*target*1.6&&outline.length>sloppy.length?outline:sloppy;
  }
  assert.ok(reduced.length>=24,key+' lost its silhouette');
  const ids=new Map(),vertices=[];
  const compact=Array.from(reduced,index=>{
    const rgb=colours.getElement(index,[]);
    const item=[...xyz.subarray(index*3,index*3+3)].map(v=>Math.round(v*100));
    item.push(...rgb.slice(0,3).map(v=>Math.round(255*v)));
    const hash=item.join(',');
    if(!ids.has(hash)){ids.set(hash,vertices.length);vertices.push(item);}
    return ids.get(hash);
  });
  assert.ok(vertices.length<65536&&compact.length<65536);
  const binary=Buffer.alloc(8+9*vertices.length+2*compact.length);
  binary.write('GTFR');binary.writeUInt16LE(vertices.length,4);binary.writeUInt16LE(compact.length,6);
  let offset=8;
  for(const v of vertices){
    for(let k=0;k<3;k++){binary.writeInt16LE(v[k],offset);offset+=2;}
    for(const c of v.slice(3))binary[offset++]=c;
  }
  for(const id of compact){binary.writeUInt16LE(id,offset);offset+=2;}
  const bounds=[...min.map(v=>Math.floor(100*v)),...max.map(v=>Math.ceil(100*v))].map(v=>v/100);
  return {binary,bounds,triangles:compact.length/3};
}
for(const [library,source] of files){
  const input=await io.read(new URL(source,directory).pathname);
  for(const original of input.getRoot().getDefaultScene().listChildren()){
    const key=original.getName(),part=singleMesh(original),low=silhouette(part,key);
    await fs.writeFile(new URL(key+'.bin',directory),low.binary);
    const doc=cloneDocument(input),scene=doc.getRoot().getDefaultScene();
    for(const root of scene.listChildren())if(root.getName()!==key){
      const remove=[];root.traverse(n=>remove.push(n));
      for(const n of remove.reverse())n.dispose();
    }
    await doc.transform(prune());
    doc.createExtension(EXTMeshoptCompression).setRequired(true).setEncoderOptions({method:EXTMeshoptCompression.EncoderMethod.QUANTIZE});
    const path=new URL(key+'.glb',directory);
    await io.write(path.pathname,doc);
    const copy=await io.read(path.pathname),node=singleMesh(copy.getRoot().getDefaultScene().listChildren()[0]);
    assert.equal(copy.getRoot().listMeshes().length,1,key+' has another room in its download');
    assert.deepEqual(node.getWorldMatrix(),part.getWorldMatrix());
    const sourcePrimitive=part.getMesh().listPrimitives()[0],copied=node.getMesh().listPrimitives()[0];
    for(const name of sourcePrimitive.listSemantics())assert.deepEqual(copied.getAttribute(name).getArray(),sourcePrimitive.getAttribute(name).getArray(),key+' '+name);
    assert.deepEqual(copied.getIndices().getArray(),sourcePrimitive.getIndices().getArray(),key+' triangle order');
    manifest[key]={library,bounds:low.bounds};
    console.log(key,sourcePrimitive.getIndices().getCount()/3,'→',low.triangles,'distant triangles',low.binary.length,(await fs.stat(path)).size);
  }
}
await fs.writeFile(new URL('bounds.js',directory),'// Generated by split.mjs from the original Blender exports. Dimensions are metres.\nexport const fixtures='+JSON.stringify(manifest,null,2)+';\n');
