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
console.log('OK — 7 Blender models, 120 moving vehicles, colour, parked collision and anchored height');
