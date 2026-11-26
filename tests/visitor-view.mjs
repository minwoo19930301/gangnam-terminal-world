import assert from 'node:assert/strict';
import * as T from 'three';
import {visitorInstances} from '../js/visitors.js';
import {treeInstances} from '../js/streetscape.js';
import {visitorView} from '../js/visitor-view.js';

const scene=new T.Scene(),terrain=(x,z)=>.12*x+.018*z,attach=visitorView(T,scene,terrain);
const visitors=Array.from({length:96},(_,i)=>({x:(i%8-3.5)*2.1,y:0,z:(i<48?-1:1)*(9+Math.floor(i%48/8)*2),
  h:1.6+.02*(i%8),rotY:.13*i,shirt:i*67123%0xffffff,sit:false}));
const group=visitorInstances(T,visitors,visitors.map((_,i)=>i));
const trees=Array.from({length:24},(_,i)=>({
  x:i%6-2.5,y:0,z:(i<12?-1:1)*(22+i%12),kind:'zelkova',h:6+i%4
}));
group.push(...treeInstances(T,trees));
const original=new Map();
for(const mesh of group){
  scene.add(mesh);mesh.computeBoundingSphere();attach(mesh);
  const attrs=[mesh.instanceMatrix,...(mesh.instanceColor?[mesh.instanceColor]:[]),...Object.values(mesh.geometry.attributes).filter(a=>a.isInstancedBufferAttribute)];
  original.set(mesh,attrs.map(a=>[a,a.array.slice()]));
}
const camera=new T.PerspectiveCamera(80,1.66,.1,80);camera.position.set(0,1.8,0);
function draw(z){camera.lookAt(0,1.8,z);camera.updateMatrixWorld();scene.updateMatrixWorld();scene.onBeforeRender(null,scene,camera,null);}
for(const direction of [-1,1,-1,1]){
  draw(direction*15);
  for(const mesh of group){
    const [[mat,matrices],...attributes]=original.get(mesh);
    const indices=[];
    for(let i=0;i<matrices.length/16;i++)if(direction*matrices[i*16+14]>0)indices.push(i);
    assert.equal(mesh.count,indices.length);
    for(const [dest,src] of indices.entries()){
      assert.deepEqual(mat.array.slice(dest*16,dest*16+16),matrices.slice(src*16,src*16+16));
      for(const [target,initial] of attributes)assert.deepEqual(target.array.slice(dest*3,dest*3+3),initial.slice(src*3,src*3+3));
    }
    const version=mesh.instanceMatrix.version;draw(direction*15);assert.equal(mesh.instanceMatrix.version,version);
  }
}
for(const mesh of group)mesh.position.x=3;
draw(15);
for(const mesh of group){
  assert.equal(mesh.count,original.get(mesh)[0][1].length/16);
  for(const [attr,initial] of original.get(mesh))assert.deepEqual(attr.array,initial);
}
console.log('OK — tree tints, visitor colours and transforms survive repeated camera reversal, stationary frames and a moved batch');
