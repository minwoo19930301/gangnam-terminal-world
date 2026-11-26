// Both the native multi-draw and the four-draw fallback must keep every
// source triangle that can intersect the camera frustum.
import assert from 'node:assert/strict';
import * as THREE from 'three';
import { streetBatchView } from '../js/static-view.js';

const positions = [], indices = [];
function quad(x, reverse, wide = false) {
  const base = positions.length / 3;
  positions.push(x,0,-10, x+.2,0,-10, x+.2,.2,-10, wide ? 0 : x,.2,-10);
  indices.push(...(reverse ? [0,2,1,0,3,2] : [0,1,2,0,2,3]).map(i => base+i));
}
for (let b = 0; b < 12; b++) {
  for (let j = 0; j < 1700; j++) quad(b % 2 ? 50 : 0,j%2===0,b===5 && j===430);
  const first = positions.length/3, x = b%2 ? 50 : 0;
  positions.push(x,0,-10,x+.1,0,-10,x,.1,-10);
  indices.push(first,first+1,first+2); // chunk boundaries can bisect a quad
}

const geometry = new THREE.BufferGeometry();
geometry.setAttribute('position',new THREE.Float32BufferAttribute(positions,3));
geometry.setIndex(indices);
geometry.computeBoundingBox();
const scene = new THREE.Scene(), mesh = new THREE.Mesh(geometry,new THREE.MeshBasicMaterial());
scene.add(mesh);
streetBatchView(THREE,scene).attach(mesh);
const camera = new THREE.PerspectiveCamera(72,1.5,.08,4000);
const frustum = new THREE.Frustum(), projection = new THREE.Matrix4(), box = new THREE.Box3();
const v = new THREE.Vector3(), source = geometry.index.array;

for (const supported of [true,false]) {
  const draws = [];
  const gl = {TRIANGLES:4,UNSIGNED_SHORT:5123,UNSIGNED_INT:5125};
  gl.getExtension = () => supported ? {
    multiDrawElementsWEBGL(mode,counts,first,type,starts,offset,n) {
      assert.equal(mode,gl.TRIANGLES);
      assert.equal(type,source.BYTES_PER_ELEMENT===2 ? gl.UNSIGNED_SHORT : gl.UNSIGNED_INT);
      for (let i=0;i<n;i++) draws.push([starts[offset+i]/source.BYTES_PER_ELEMENT,counts[first+i]]);
    }
  } : null;
  const renderer = {getContext:() => gl,domElement:new EventTarget(),info:{update(){}},
    renderBufferDirect() { draws.push([geometry.drawRange.start,geometry.drawRange.count]); }};
  for (const yaw of [0,-Math.PI/2,0]) {
    camera.rotation.y = yaw;
    camera.updateWorldMatrix(true,false);
    frustum.setFromProjectionMatrix(projection.multiplyMatrices(camera.projectionMatrix,camera.matrixWorldInverse));
    scene.onBeforeRender(renderer,scene,camera);
    draws.length = 0;
    mesh.onBeforeRender(renderer,scene,camera,geometry,mesh.material,null);
    if (geometry.drawRange.count>0) draws.push([geometry.drawRange.start,geometry.drawRange.count]);
    mesh.onAfterRender(renderer,scene,camera,geometry,mesh.material,null);
    assert.deepEqual(geometry.drawRange,{start:0,count:Infinity});
    assert.equal(geometry.index.array,source);
    assert.ok(supported || draws.length<=4);
    if (yaw===0) assert.ok(draws.length>=2);
    const submitted = new Uint8Array(indices.length/3);
    let end=0;
    for (const [start,count] of draws) {
      assert.ok(start>=end && start+count<=indices.length);
      submitted.fill(1,start/3,(start+count)/3);
      end=start+count;
    }
    assert.ok(submitted.includes(0));
    for (let i=0;i<indices.length;i+=3) {
      box.makeEmpty();
      for(let j=0;j<3;j++) box.expandByPoint(v.fromBufferAttribute(geometry.attributes.position,indices[i+j]));
      if (frustum.intersectsBox(box)) assert.equal(submitted[i/3],1,'a potentially visible source triangle was dropped');
    }
  }
}

// Rendering tools can request a custom subset of indices.
geometry.setDrawRange(3,6);
mesh.onBeforeRender({},scene,camera,geometry,mesh.material,null);
mesh.onAfterRender({},scene,camera,geometry,mesh.material,null);
assert.deepEqual(geometry.drawRange,{start:3,count:6});
console.log('Street index ranges preserve winding, partial quads, custom ranges and the WebGL fallback.');
