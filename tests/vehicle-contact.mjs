// Run with node tests/vehicle-contact.mjs.
import assert from 'node:assert/strict';
import * as THREE from 'three';
import { createKit } from '../js/kit.js';
import { createPhysics } from '../js/physics.js';
import { relief } from '../js/banpo_relief.js';
import { createTraffic } from '../js/city.js';

function near(actual, expected, label, tolerance = 1e-4) {
  assert.ok(Math.abs(actual-expected) < tolerance, label + ': ' + actual + ' / ' + expected);
}

// Four wheel pads at the join between two slopes. Another deck above and the
// surface below must not pull a parked car off its own level.
const phys = createPhysics(), scene = new THREE.Scene();
const K = createKit(THREE, scene, { osm: {}, phys });
const cx=150, cz=30, y=9, tires=[];
K.withTerrainSurface(0, () => {
  for (const along of [-1.45,1.45]) for (const across of [-.875,.875]) {
    const x=cx+across, z=cz+along, height=y+.08*along+.1*across+.04*across*along;
    const pad=[[x-.6,z-.6],[x+.6,z-.6],[x+.6,z+.6],[x-.6,z+.6]];
    for (const h of [height-4,height,height+3]) phys.addSurface(pad,h);
    tires.push({x,z,height});
  }
  K.vehicle({x:cx,y,z:cz,solid:true});
});
const tireColor = new THREE.Color(0x151515).r;
for (const tire of tires) {
  tire.bottom=new Map();
}
for (const mesh of K._.finalize()) {
  const {position,color}=mesh.geometry.attributes;
  for (let i=0; i<position.count; i++) {
    if (Math.abs(color.getX(i)-tireColor)>1e-6 || Math.abs(color.getZ(i)-tireColor)>1e-6) continue;
    const x=position.getX(i), h=position.getY(i), z=position.getZ(i);
    const tire=tires.find(t => Math.abs(t.x-x)<.5 && Math.abs(t.z-z)<.6 && h<t.height+.2);
    if (tire) tire.bottom.set([x,h,z].join(','),h);
  }
}
for (const tire of tires) {
  const values=[...tire.bottom.values()];
  assert.equal(values.length,4,'rendered wheel bottom corners');
  near(values.reduce((a,b)=>a+b,0)/4,tire.height,'parked tyre contact');
}
near(phys.support(cx,cz,y+2-relief(cx,cz)).y+relief(cx,cz), y+1.45,'chassis collision height');

// Exercise the normal moving-fleet path on a crowned road. The ground changes
// under each wheel as the car moves. A higher ramp at the same X/Z is level 2.
const trafficScene=new THREE.Scene(), roads=createPhysics();
const x0=600, z0=20, z1=140;
const asphalt=(x,z) => relief(x,z)+.12+.06*(x-x0)*Math.sin((z-z0)/7);
roads.withHeightOffset((x,z)=>asphalt(x,z)-relief(x,z),()=>{
  for (const level of [0,5]) roads.addRamp(x0,z0,x0,z1,4,level,level,{tag:'road'});
});
const traffic=createTraffic({THREE,phys:roads,scene:trafficScene,rand:()=>()=>.4}, {
  roads:[{pts:[[x0,z0],[x0,z1]],hw:'primary',width:4,lanes:1,oneway:true}]
},1);
const wheels=trafficScene.children.find(m=>m.isInstancedMesh && m.count===4);
assert.ok(wheels,'fleet has four independently placed wheels');
const m=new THREE.Matrix4(), p=new THREE.Vector3();
for (let i=0;i<40;i++) {
  traffic.update(.13);
  for(let wheel=0;wheel<4;wheel++) {
    wheels.getMatrixAt(wheel,m);p.setFromMatrixPosition(m);
    near(p.y,asphalt(p.x,p.z),'moving tyre contact');
  }
}
console.log('Rendered parked tyres, chassis collision and 160 moving wheel contacts passed.');

// Entering a new detail cell finalizes geometry again during normal play.
// Large fleets must keep the original matrices that their animator updates.
const detailScene = new THREE.Scene();
const detailKit = createKit(THREE,detailScene,{osm:{},phys:roads});
createTraffic(detailKit,{roads:[{pts:[[x0,z0],[x0,z1]],hw:'primary',width:4,lanes:1,oneway:true}]},90);
const movingMeshes = detailScene.children.filter(o => o.name.startsWith('traffic-'));
detailKit._.finalize();
for (const mesh of movingMeshes) assert.equal(mesh.parent,detailScene,'live fleet during detail load');
