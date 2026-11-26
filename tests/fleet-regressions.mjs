// Parked and moving batches must survive lazy floor flushes and terrain anchors.
import assert from 'node:assert/strict';
import * as THREE from 'three';
import { createTraffic } from '../js/city.js';
import { createKit } from '../js/kit.js';
import { createPhysics } from '../js/physics.js';
import { relief } from '../js/banpo_relief.js';
import { fleetInstances, vehicleSize } from '../js/fleet.js';

const ctx = new Proxy({}, { get: (_, key) => key === 'measureText' ? text => ({width: String(text).length*10}) : () => {} });
globalThis.__makeCanvas = (width, height) => ({ width, height, getContext: () => ctx });
const scene = new THREE.Scene(), phys = createPhysics();
const kit = createKit(THREE, scene, { osm: {}, phys });
for (const kind of ['car','taxi','van','truck','bus','cityBus','minibus']) {
  for (const mesh of fleetInstances(THREE, kind, 1)) {
    const g = mesh.geometry;
    assert.ok(g.getAttribute('position').count > 0);
    g.computeBoundingBox();
    assert.ok(g.boundingBox.max.y < vehicleSize(kind)[1] + .25);
    assert.ok(g.boundingBox.min.y >= -.001);
    assert.ok(Array.from(g.getAttribute('normal').array).every(Number.isFinite));
  }
}
kit._.setCurrent('gyeongbu');
kit.withTerrainSurface(4.2, () => kit.vehicle({ x: 30, y: 1, z: 20, rotY: .35, color: 0xf0a438 }));
const traffic = createTraffic(kit, { roads: [{hw:'primary',width:15,pts:[[0,0],[350,0]]}] }, 120);
const cityPaint = scene.children.find(m => m.name === 'car paint');
assert.ok(cityPaint.count >= 64);
const start = cityPaint.instanceMatrix.array.slice();
kit._.finalize();
assert.ok(scene.children.includes(cityPaint), 'city fleet detached on flush');
traffic.update(.25);
assert.notDeepEqual(cityPaint.instanceMatrix.array, start);
const parked = scene.children.find(m => m.name === 'car paint' && !m.userData.dynamic);
const matrix = new THREE.Matrix4();
parked.getMatrixAt(0, matrix);
assert.ok(Math.abs(matrix.elements[13]-5.2) < .001);
const color = new THREE.Color();
parked.getColorAt(0, color);
assert.equal(color.getHex(), 0xf0a438);
assert.ok(Math.abs(phys.support(30,20,8-relief(30,20)).y+relief(30,20)-6.65) < .001);
kit._.finalize();
assert.equal(scene.children.filter(m => m.name === 'car paint' && !m.userData.dynamic).length, 1);
const wheel = scene.children.find(m => m.name === 'car wheels' && m.userData.parkedFleet);
const [nearWheel, farWheel] = wheel.userData.lod;
farWheel.computeBoundingBox();
assert.ok(nearWheel.boundingBox.equals(farWheel.boundingBox), 'distant tread contact and silhouette');
assert.ok(farWheel.attributes.position.count < nearWheel.attributes.position.count / 2);
kit._.cull(600,2,0,true);
const distant = scene.children.find(m => m.name === 'car distant wheels' && m.userData.parkedFleet);
assert.equal(distant.geometry,farWheel);
assert.equal(wheel.count,0);
assert.equal(distant.count,4);
kit._.cull(30,2,20,true);
assert.equal(wheel.geometry,nearWheel);
assert.equal(wheel.count,4);
assert.equal(distant.count,0);
console.log('OK — 7 Blender models, 120 moving vehicles, colour, parked collision and anchored height');

// One garage batch spans both sides of a covered underground viewer. A camera
// turn without a step must restore its other car, colour and all four wheels.
const basementScene = new THREE.Scene(), basementPhysics = createPhysics();
const basement = createKit(THREE, basementScene, {osm:{}, phys:basementPhysics});
basement._.setCurrent('gyeongbu');
basement.zone({name:'basement', floor:'B1', rect:[35,25,70,75], y0:-4, y1:0});
const opening = [[57,47],[63,47],[63,53],[57,53]];
basement.slab([[35,25],[70,25],[70,75],[35,75]], 0, {holes:[opening]});
for (const [z,color] of [[35,0xe04937],[65,0x52a978]]) basement.vehicle({x:50,y:0,z,color});
basement._.finalize();
const parkedPart = name => basementScene.children.find(m => m.userData.parkedFleet && m.name === name);
const paint = parkedPart('car paint'), trim = parkedPart('car trim'), tires = parkedPart('car wheels');
const originalPaint = paint.instanceMatrix.array.slice(), originalColors = paint.instanceColor.array.slice();
const view = new THREE.PerspectiveCamera(60,1,.05,500);
view.position.set(50,-2.38,50);
function face(direction,expectedIndex) {
  view.lookAt(50,0,50+direction);
  basement._.cull(...view.position.toArray(),false,view);
  assert.equal(paint.count,1);
  assert.equal(trim.count,1);
  assert.equal(tires.count,4);
  const matrix = originalPaint.slice(16*expectedIndex,16*(expectedIndex+1));
  assert.deepEqual(paint.instanceMatrix.array.slice(0,16),matrix);
  assert.deepEqual(trim.instanceMatrix.array.slice(0,16),matrix);
  assert.deepEqual(paint.instanceColor.array.slice(0,3),originalColors.slice(3*expectedIndex,3*(expectedIndex+1)));
}
face(-15,0);
face(15,1);
face(-15,0);
view.position.x = 60;
basement._.cull(...view.position.toArray(),true,view);
assert.equal(paint.count,2,'an open atrium keeps the original batch');
assert.equal(tires.count,8);
assert.deepEqual(paint.instanceMatrix.array,originalPaint);
assert.deepEqual(paint.instanceColor.array,originalColors);
console.log('OK — covered garage view, camera turn, wheel and color restoration, open atrium');
