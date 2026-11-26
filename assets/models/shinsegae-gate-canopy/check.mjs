// Run node assets/models/shinsegae-gate-canopy/check.mjs from the project root.
// Guard the public threshold and the slab ends visible through the street elevation.
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import * as THREE from 'three';
import {createKit} from '../../../js/kit.js';
import {createPhysics} from '../../../js/physics.js';
import {departmentPoint} from '../../../js/places/shinsegae-b1-plan.js';
import {loadArchitecture} from '../interior-architecture/model.js';
import {points} from './silhouette.js';

const [part]=await loadArchitecture('../shinsegae-gate-canopy/gate-canopy.glb');
part.updateWorldMatrix(true,false);
const native=new Set(), vector=new THREE.Vector3();
const xyz=part.geometry.getAttribute('position');
for(let i=0;i<xyz.count;i++){
  vector.fromBufferAttribute(xyz,i).applyMatrix4(part.matrixWorld);
  native.add(vector.toArray().map(x=>Math.round(x*1000)).join(','));
}
for(let i=0;i<points.length;i+=3)
  assert.ok(native.has(points.slice(i,i+3).join(',')),'distant pane vertex must come from the exported skin');

const gradient=()=>({addColorStop(){}});
const ctx=new Proxy({measureText:t=>({width:t.length*10}),createLinearGradient:gradient,createRadialGradient:gradient,
  getImageData:()=>({data:new Uint8ClampedArray(4)})},{get:(o,k)=>o[k]??(()=>{})});
globalThis.__makeCanvas=(width,height)=>({width,height,getContext:()=>ctx,style:{}});
const {build,meta}=await import('../../../js/places/shinsegae.js');
const osm=JSON.parse(await readFile(new URL('../../../data/osm.json',import.meta.url),'utf8'));
const phys=createPhysics(), kit=createKit(THREE,new THREE.Scene(),{osm,phys,keep:()=>false});
kit.onNight=()=>{};
kit._.setCurrent('shinsegae',meta);
build(kit);
function height(u,v,y){
  const [x,z]=departmentPoint(u,v);
  return phys.support(x,z,y+.3).y;
}
for(const y of [3.6,7,11.8,16.6,21.4])assert.ok(height(33.5,3,y)<.1,'slab extends over the exterior doorway');
for(const y of [7,11.8,16.6,21.4])assert.equal(height(33.5,8.6,y),y,'interior floor behind the glass');
assert.equal(height(33.5,3,26.2),26.2,'upper projecting bay');
console.log('OK — 40 distant pane vertices, 5 exterior clearances, 4 interior floors and the upper bay');
