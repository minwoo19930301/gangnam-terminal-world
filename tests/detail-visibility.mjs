// Keep the detail built on a visited floor, including its original person batches.
import assert from 'node:assert/strict';
import * as THREE from 'three';
import { createKit } from '../js/kit.js';
import { createPhysics } from '../js/physics.js';

const scene = new THREE.Scene(), phys = createPhysics();
const ctx = new Proxy({}, {get: () => () => {}});
globalThis.__makeCanvas = (width,height) => ({width,height,getContext:() => ctx});
const kit = createKit(THREE,scene,{osm:{},phys});
const outline = [[1,1],[20,1],[20,20],[1,20]];
const atrium = [[6,6],[14,6],[14,14],[6,14]];
phys.addCeiling(outline,12,{holes:[atrium]});
kit._.setCurrent('jwmarriott');
kit.detail({poly:outline,y0:0,y1:4,floor:'1F'},() => {
  kit.box({x:4,z:4,y:0,w:1,h:1,d:1,mat:0xffffff});
  for (let i=0;i<80;i++) kit.person(2+i/50,0,3);
});
kit._.ensureDetail(3,2,3);
const floor = kit._.details[0];
const visitors = floor.renderables.filter(o => o.userData.lod);
assert.equal(visitors.length,2,'one draw per standing pose');
assert.equal(visitors.reduce((n,o) => n+o.count,0),80);
assert.ok(visitors.every(o => o.geometry.attributes.shirtColor.count === o.count));
kit._.finalize();
for (const o of visitors) assert.ok(o.parent, 'a second flush detached a visitor batch');
assert.ok(kit._.cullList.every(o => o.parent));
kit._.cull(3,24,3,true);
assert.ok(floor.renderables.every(o => !o.layers.isEnabled(0)), 'closed floor');
kit._.cull(10,24,10,true);
assert.ok(floor.renderables.every(o => o.layers.isEnabled(0)), 'view through atrium');
kit._.cull(3,24,3,true);
kit._.cull(3,2,3,true);
assert.ok(floor.renderables.every(o => o.layers.isEnabled(0)), 'return to first floor');
assert.ok(visitors.every(o => o.geometry === o.userData.lod[0]), 'original near geometry');
kit._.cull(200,2,3,true);
assert.ok(visitors.every(o => o.geometry === o.userData.lod[1]), 'distant silhouette');
console.log('OK — closed floors, open atrium, return visit and visitor batches');
