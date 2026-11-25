// Run with node tests/terrain-regressions.mjs.
import assert from 'node:assert/strict';
import * as THREE from 'three';
import { installRelief, relief, surveyElevation } from '../js/banpo_relief.js';
import { gardenForkAxis, gardenForkProfile } from '../js/garden_fork.js';
import { terminalSurveyHeight } from '../js/banpo_dem.js';
import { createKit } from '../js/kit.js';
import { createPhysics } from '../js/physics.js';

function near(actual, expected, tolerance, label) {
  assert.ok(Math.abs(actual-expected) < tolerance, label + ': ' + actual + ' vs ' + expected);
}
installRelief(THREE);
near(relief(0,0), 0, .01, 'terminal reference');
near(relief(496.9,6.1), 4.43, .15, 'reported Sapyeong-daero viewpoint');
assert.ok(relief(500,400) - relief(500,-800) > 8, 'rise from north Banpo to south Banpo');

// The raw DEM looks down on the upper road. The garage and the lane below
// it need a separate base, while the public carriageway stays on the survey.
near(surveyElevation(329.81,71.89)+11.838,17.67,.08,'original DEM at F002 road mark');
near(relief(373.17,14.53)+9.3+11.838,19.09,.05,'east pub datum');
near(relief(8.56,168.75)+11.5+11.838,19.08,.05,'west hotel datum');
near(relief(351.48,74.25),surveyElevation(351.48,74.25),.02,'public arterial footway');

// A 25m terrain triangle used to cut through the east fork's asphalt and
// stripes. Test the full slip width through the bend, not only its centre.
for(let i=1;i<gardenForkAxis.length;i++) {
  const [ax,az]=gardenForkAxis[i-1], [bx,bz]=gardenForkAxis[i];
  const dx=bx-ax,dz=bz-az,length=Math.hypot(dx,dz);
  for(let d=0;d<=length;d+=.5) for(const offset of [-3.5,0,3.5]) {
    const x=ax+(dx*d-dz*offset)/length, z=az+(dz*d+dx*offset)/length;
    assert.ok(relief(x,z)+terminalSurveyHeight<=gardenForkProfile(x,z).height+.01,'earth intersects fork at '+[x,z]);
  }
}
near(relief(450.06,-48.43)+terminalSurveyHeight+.041,10.20,.04,'shared low junction');
const scene = new THREE.Scene();
const phys = createPhysics();
const K = createKit(THREE, scene, { osm: {}, phys });
const pavement = [[440,-18],[542,-18],[542,47],[440,47]];
const deck = [[465,-10],[528,-10],[528,35],[465,35]];
K.hpoly(0x777777, pavement, .08);
phys.addSurface(pavement,.08);
const deckHeight = 7;
K.withTerrainAnchor(500,0,() => {
  K.hpoly(0xbbbbbb, deck, deckHeight);
  phys.addSurface(deck,deckHeight);
});
const lowerSite = [[394,10],[424,10],[424,38],[394,38]];
K.hpoly(0x777777, lowerSite, .08);
phys.addSurface(lowerSite,.08);
const meshes = K._.finalize();
scene.updateMatrixWorld(true);
const level = relief(500,0) + deckHeight;
const ray = new THREE.Raycaster();
for (const [x,z] of [[468.1,-6.7],[475.1,16.2],[492.3,8.5],[496.9,6.1],[501.3,31.6],[523.2,18.1]]) {
  ray.set(new THREE.Vector3(x,100,z),new THREE.Vector3(0,-1,0));
  const hits = ray.intersectObjects(meshes,false);
  assert.ok(hits.length >= 2, 'road beneath deck must render at ' + [x,z]);
  near(hits[0].point.y, level, .0001, 'rigid deck');
  const low = hits.at(-1).point.y;
  near(low, relief(x,z) + .08, .0001, 'interpolated road mesh');
  near(phys.support(x,z,20).y + relief(x,z), level, .0001, 'walking on deck');
  near(phys.support(x,z,.5).y + relief(x,z), low, .0001, 'walking below deck');
}
for (const [x,z] of [[400.7,25.3],[407.2,27.7],[418.9,31.2],[414.7,15.4]]) {
  ray.set(new THREE.Vector3(x,100,z),new THREE.Vector3(0,-1,0));
  const hits=ray.intersectObjects(meshes,false);
  const floor=phys.support(x,z,.2).y+relief(x,z);
  near(hits[0].point.y, floor,.001,'fine site mesh / support registration');
}
console.log('Terrain: terminal and Banpo survey, road triangles, rigid deck and collision levels passed.');
