// Protect the split between mapped parking, courtyard vegetation and underground openings.
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { buildCity } from '../js/city.js';
import { parcelCover } from '../js/parcel_cover.js';
import { pointInPoly, polyArea, polyBBox } from '../js/physics.js';

const osm = JSON.parse(fs.readFileSync(new URL('../data/osm.json',import.meta.url)));
const rect = (x,z,w,d) => [[x,z],[x+w,z],[x+w,z+d],[x,z+d]];
function trace(data, openings=[]) {
  const polys=[], trees=[], cars=[], stripes=[];
  const K = {
    _: {groundHoles:openings,stats:{quads:0}}, phys:{},
    texture() {}, rand:()=>()=>.25, hpoly:(mat,p,y)=>polys.push({mat,p,y}),
    tree:(x,z)=>trees.push([x,z]), vehicle:o=>cars.push(o), quad:(mat,p)=>stripes.push({mat,p}),
  };
  buildCity(K,data,{claimedBuildings:new Set(data.buildings.map(b=>b.id))});
  return {polys,trees,cars,stripes};
}
const park = {id:1,kind:'amenity:parking',layer:0,holes:[],poly:rect(0,0,40,70)};
const data = {bbox:[0,0,200,100],areas:[park],roads:[],trees:[],buildings:[],pois:[],nodes:[]};
const cut = {poly:rect(12,0,11,70)};
const surface=trace(data,[cut]);
assert.equal(surface.trees.length,0);
assert.ok(surface.cars.length && surface.stripes.length);
for (const {x,y,z} of surface.cars) {
  assert.equal(y,.018);
  assert.ok(!pointInPoly(x,z,cut.poly));
}
const area = surface.polys.reduce((sum,{p})=>sum+polyArea(p),0);
assert.ok(Math.abs(area-29*70)<1e-6);
for (const extra of [{parking:'underground'},{parking:'multi-storey'},{layer:1}]) {
  const t=trace({...data,areas:[{...park,...extra}]});
  assert.equal(t.polys.length+t.trees.length+t.cars.length+t.stripes.length,0);
}

const buildings=osm.buildings.filter(b=>!b.layer).map(b=>({b,bb:polyBBox(b.poly)}));
let trees=0,greenArea=0;
for (const [id,cover] of Object.entries(parcelCover)) {
  const a=osm.areas.find(a=>String(a.id)===id);
  assert.ok(a);
  for (const [outer,...holes] of cover.green) greenArea+=polyArea(outer)-holes.reduce((s,h)=>s+polyArea(h),0);
  for (const [x,z,h] of cover.trees) {
    assert.ok(pointInPoly(x,z,a.poly) && h>=4);
    for(const {b,bb} of buildings) {
      if(x<bb[0]||x>bb[2]||z<bb[1]||z>bb[3]) continue;
      assert.ok(!pointInPoly(x,z,b.poly) || b.holes.some(r=>pointInPoly(x,z,r)));
    }
    trees++;
  }
}
assert.ok(trees>300 && greenArea>400000);
console.log(trees+' canopy peaks and '+Math.round(greenArea)+' m² of mapped green cover. Surface parking and hole checks passed.');
