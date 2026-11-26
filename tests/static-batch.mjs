// Exercise both windings of both face sizes in the same material/tile.
import assert from 'node:assert/strict';
import * as THREE from 'three';
import { createKit } from '../js/kit.js';
import { createPhysics } from '../js/physics.js';

const kit = () => createKit(THREE, new THREE.Scene(), {osm: {}, phys: createPhysics()});
const faces = [
  {x: 5, color: 0xff0000, normal: [0,0,1], triangles: 2},
  {x: 8, color: 0x00ff00, normal: [0,0,-1], triangles: 2},
  {x: 11, color: 0x0000ff, normal: [0,1,0], triangles: 1},
  {x: 14, color: 0xffffff, normal: [0,-1,0], triangles: 1},
];
function emitFaces(K) {
  K.withTerrainAnchor(0, 0, () => {
    for (const {x, color, normal, triangles} of faces) {
      if (triangles === 2) K.quad(color, [[x,1,1],[x+1,1,1],[x+1,2,1],[x,2,1]], normal);
      else K.hpoly(color, [[x,1],[x+1,1],[x+1,2]], 1, normal[1] > 0);
    }
  });
}
const K=kit();
emitFaces(K);
const [mesh] = K._.finalize();
const g = mesh.geometry;
assert.equal(g.index.count, 18);
const counts = new Map();
const vector = (attr, i) => new THREE.Vector3().fromBufferAttribute(g.attributes[attr], i);
for (let i=0; i<g.index.count; i+=3) {
  const indices = Array.from(g.index.array.slice(i, i+3));
  const [a,b,c] = indices.map(k => vector('position', k));
  const face = faces.find(f => Math.min(a.x,b.x,c.x) === f.x);
  const expectedNormal = new THREE.Vector3(...face.normal);
  counts.set(face, (counts.get(face) || 0) + 1);
  assert.ok(b.sub(a).cross(c.sub(a)).dot(expectedNormal) > 0, 'front face winding');
  for (const vertex of indices) {
    assert.deepEqual(vector('normal', vertex).toArray(), face.normal);
    assert.deepEqual(vector('color', vertex).toArray(), new THREE.Color(face.color).toArray());
  }
}
for (const face of faces) assert.equal(counts.get(face), face.triangles);
const {boundingBox, boundingSphere} = g;
g.boundingBox = null;
g.boundingSphere = null;
g.computeBoundingBox();
g.computeBoundingSphere();
assert.ok(g.boundingBox.equals(boundingBox));
assert.ok(g.boundingSphere.equals(boundingSphere));
const street=kit();
emitFaces(street);
const [arrival]=await street._.finalizeStreet();
assert.deepEqual(arrival.geometry.index.array,g.index.array);
for(const [key,attribute] of Object.entries(g.attributes)) {
  assert.deepEqual(arrival.geometry.attributes[key].array,attribute.array,key);
}
assert.ok(arrival.geometry.boundingBox.equals(g.boundingBox));
assert.ok(arrival.geometry.boundingSphere.equals(g.boundingSphere));
console.log('Static batch winding, vertex colors, normals and culling bounds passed.');
