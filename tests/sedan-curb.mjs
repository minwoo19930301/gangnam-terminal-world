// Verify the edit-only trim shares the original parked chassis pose and never
// requests a second wheel or collision calculation. Run: node tests/sedan-curb.mjs
import assert from 'node:assert/strict';
import * as THREE from 'three';
import {parkSedanTrim} from '../assets/models/sedan-curb/model.js';
import {pointInPoly} from '../js/physics.js';

const scene = new THREE.Scene();
let frame;
const K = {THREE, pointInPoly, onFrame:fn => { frame=fn; }, addMesh:mesh => scene.add(mesh)};
const car = {x:0, y:.035, z:-5, wheels:{height:2.1}, rotY:.3, color:0x8b9193,
  tilt:new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(1,0,0), .09), place:'shinsegae'};
parkSedanTrim(K,[car],[[-3,-8],[3,-8],[3,5],[-3,5]]);
const eye = {x:0, y:.035, z:0, eye:1.6, yaw:Math.PI, pitch:0};
frame(0,0,eye);
assert.equal(scene.children.length,0);
eye.yaw=0;
for (let i=0; i<150 && !scene.children.length; i++) {
  frame(.016,i/60,eye);
  await new Promise(resolve => setTimeout(resolve,10));
}
frame(.016,3,eye);
const [mesh] = scene.children;
assert.equal(mesh.count,1);
assert.equal(mesh.material.defines.BANPO_RIGID,1);
const pose=new THREE.Matrix4(), attachment=new THREE.Vector3(), rotation=new THREE.Quaternion();
mesh.getMatrixAt(0,pose);
pose.decompose(attachment,rotation,new THREE.Vector3());
assert.ok(attachment.distanceTo(new THREE.Vector3(car.x,car.wheels.height,car.z))<1e-5);
const nativeRotation=new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0,1,0),car.rotY).premultiply(car.tilt);
assert.ok(1-Math.abs(nativeRotation.dot(rotation))<1e-6);
const version=mesh.instanceMatrix.version;
frame(.016,4,eye);
assert.equal(mesh.instanceMatrix.version,version);
eye.y=-6;
frame(.016,5,eye);
assert.equal(mesh.count,0);
eye.y=car.y;
frame(.016,6,eye);
assert.equal(mesh.count,1);
assert.equal(scene.children.length,1);
console.log('OK — one aligned rigid sedan trim instance, stable buffer, culled below grade and restored');
