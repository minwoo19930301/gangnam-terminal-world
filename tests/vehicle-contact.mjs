// Run with node tests/vehicle-contact.mjs.
import assert from 'node:assert/strict';
import * as THREE from 'three';
import { createKit } from '../js/kit.js';
import { createPhysics } from '../js/physics.js';
import { relief } from '../js/banpo_relief.js';
import { createTraffic } from '../js/city.js';
import { vehicleContacts } from '../js/fleet.js';

function near(actual, expected, label, tolerance = 1e-4) {
  assert.ok(Math.abs(actual-expected) < tolerance, label + ': ' + actual + ' / ' + expected);
}

// Four wheel pads at the join between two slopes. Another deck above and the
// surface below must not pull a parked car off its own level.
const phys = createPhysics(), scene = new THREE.Scene();
const K = createKit(THREE, scene, { osm: {}, phys });
const cx=150, cz=30, y=9, tires=[];
const [track,axle]=vehicleContacts('car');
K.withTerrainSurface(0, () => {
  for (const along of [-axle,axle]) for (const across of [-track,track]) {
    const x=cx+across, z=cz+along, height=y+.08*along+.1*across+.04*across*along;
    const pad=[[x-.6,z-.6],[x+.6,z-.6],[x+.6,z+.6],[x-.6,z+.6]];
    for (const h of [height-4,height,height+3]) phys.addSurface(pad,h);
    tires.push({x,z,height});
  }
  K.vehicle({x:cx,y,z:cz,solid:true});
});
K._.finalize();
const parked=scene.children.find(o=>o.name==='car wheels' && o.userData.parkedFleet);
assert.equal(parked?.count,4,'four separately placed Blender tyres');
const matrix=new THREE.Matrix4(), contact=new THREE.Vector3(), rendered=new THREE.Vector3();
const vertices=parked.geometry.getAttribute('position');
assert.ok(vertices.count>12,'render the curved tyre and hub');
for (let i=0;i<tires.length;i++) {
  const tire=tires[i];
  parked.getMatrixAt(i,matrix);
  contact.setFromMatrixPosition(matrix);
  near(contact.x,tire.x,'Blender axle X'); near(contact.z,tire.z,'Blender axle Z');
  near(contact.y,tire.height,'parked tyre datum');
  let lowest=Infinity;
  for(let j=0;j<vertices.count;j++) {
    rendered.fromBufferAttribute(vertices,j).applyMatrix4(matrix);
    lowest=Math.min(lowest,rendered.y);
  }
  // The upright tyre touches at its authoring origin. Its tread rolls
  // fractionally lower when tilted to the local chassis grade.
  near(lowest,tire.height,'parked rendered tread at grade',.035);
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
const movingMeshes = detailScene.children.filter(o => o.userData.dynamic);
assert.ok(movingMeshes.length>=3,'live paint, trim and independent wheels');
detailKit._.finalize();
for (const mesh of movingMeshes) assert.equal(mesh.parent,detailScene,'live fleet during detail load');
