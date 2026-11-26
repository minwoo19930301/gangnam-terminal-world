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

const streamingPhysics = createPhysics();
const streamed = createKit(THREE,new THREE.Scene(),{osm:{},phys:streamingPhysics});
const camera = new THREE.PerspectiveCamera(70,1.4,.1,300);
camera.position.set(0,1.65,0);
const loaded = [];
for (const [name,rect,y0,y1] of [
  ['front', [-2,-26,2,-21], 0,3],
  ['behind', [-2,21,2,26], 0,3],
  ['at elbow', [-2,3,2,6], 0,3],
  ['covered level', [-2,-26,2,-21], -4,-.5],
  ['atrium level', [15,-26,17,-21], -4,-.5],
]) {
  streamed.detail({name,rect,y0,y1}, () => loaded.push(name));
}
streamingPhysics.addCeiling([[-40,-50],[40,-50],[40,50],[-40,50]],0,{
  holes: [[[6,-20],[12,-20],[12,-7],[6,-7]]],
});
assert.ok(streamingPhysics.ceilingBlocksView(0,1.65,0,0,-1.5,-24), 'covered sightline');
assert.equal(streamingPhysics.ceilingBlocksView(0,1.65,0,16,-1.5,-24),false,'opening in the same slab');
const updateView = () => streamed._.ensureDetail(0,1.65,0,48,Infinity,camera);
updateView();
assert.deepEqual([...loaded].sort(), ['at elbow','atrium level','front']);
camera.rotation.y = Math.PI;
updateView();
assert.equal(loaded.at(-1),'behind','turning on the spot reveals the storefront');
camera.rotation.y = 0;
assert.equal(updateView(),0,'a return visit reuses previously loaded furnishing');
assert.ok(!loaded.includes('covered level'),'opaque floor separates the cellar');
streamed._.buildAllDetail();
assert.equal(loaded.at(-1),'covered level','all-detail exports still build concealed floors');
console.log('OK — camera direction, nearby collision, opaque floor, open atrium and all-detail mode');

// A central bus stop comes within 48 m of the department store's bounding box
// while still more than 50 m from its nearest rotated facade.
const streetKit=createKit(THREE,new THREE.Scene(),{osm:{},phys:createPhysics()});
const wing=[[-107.07,-24.31],[-44.46,-48.08],[-14.35,31.08],[-76.64,54.72]];
let wingBuilt=0;
streetKit.detail({poly:wing,floor:'1F',y0:0,y1:7},()=>wingBuilt++);
function approach(x,z){
  camera.position.set(x,1.65,z);camera.lookAt(-65,1.65,-35);camera.updateMatrixWorld(true);
  streetKit._.ensureDetail(x,1.65,z,48,Infinity,camera);
}
approach(-70.86,-96);assert.equal(wingBuilt,0,'disjoint physical footprint');
approach(-70.86,-72);assert.equal(wingBuilt,1,'store enters reach');
approach(-70,-69);assert.equal(wingBuilt,1,'reuse the visited shop');
console.log('OK — crossing the actual rotated retail footprint range');
