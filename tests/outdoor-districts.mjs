import assert from 'node:assert/strict';
import fs from 'node:fs';
import { districtAt, areaIdForKey, areaIdAt, planArea } from '../js/areas.js';

const osm=JSON.parse(fs.readFileSync(new URL('../data/osm.json',import.meta.url)));
const plans=new Map();
function check(x,z) {
  const id=areaIdForKey('street',[x,0,z],{});
  assert.equal(id,areaIdAt(null,x,0,z));
  if(!plans.has(id)) plans.set(id,planArea(id,{}));
  const plan=plans.get(id);
  for(const owner of ['city','streets']) assert.ok(plan.keep(owner,x,.04,z,1),'missing '+owner+' at '+[x,z]);
}
const [west,north,east,south]=osm.bbox;
for(let x=west+5;x<east;x+=10) for(let z=north+5;z<south;z+=10) check(x,z);
for(const road of osm.roads) for(const [x,z] of road.pts) check(x,z);
for(const [x,z] of [[-70,-2670],[300,-2800],[1450,-2750]]) check(x,z);
assert.equal(districtAt(794,280).id,'core');
assert.equal(districtAt(925,448).id,'core');
console.log('Outdoor district geometry retained at every 10 m cell, road vertex and upper river approach.');
