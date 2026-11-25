// Run with node tests/ground-coverage.mjs.
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { cutSurface } from '../js/ground.js';
import { createPhysics, pointInPoly, polyArea, polyBBox } from '../js/physics.js';
const rect=(x,z,u,v)=>[[x,z],[u,z],[u,v],[x,v]];
function audit(name,poly,cuts,spacing,tileSize=100) {
  const phys=createPhysics();
  for(const {poly,inner} of cuts) phys.addGroundHole(poly,inner);
  const cells=new Map(), extent=polyBBox(poly);
  let totalArea=0, samples=0;
  cutSurface(poly,cuts,p=>{
    totalArea+=polyArea(p);
    const [x,z,u,v]=polyBBox(p);
    for(let i=Math.floor(x/50);i<=Math.floor(u/50);i++) for(let j=Math.floor(z/50);j<=Math.floor(v/50);j++) {
      const key=i+','+j;
      if(!cells.has(key)) cells.set(key,[]);
      cells.get(key).push(p);
    }
  },tileSize);
  for(let x=extent[0]+spacing*.317;x<extent[2];x+=spacing)
    for(let z=extent[1]+spacing*.619;z<extent[3];z+=spacing) {
      const bucket=cells.get(Math.floor(x/50)+','+Math.floor(z/50)) || [];
      const count=bucket.filter(p=>pointInPoly(x,z,p)).length;
      assert.equal(count,Number(pointInPoly(x,z,poly) && !phys.groundHole(x,z)),name+' at '+[x,z]);
      samples++;
    }
  console.log(name+' passed at '+samples+' points.');
  return totalArea;
}
// An opening crosses the west rim and encloses an island; a real stair on
// that island still cuts it. A separate diagonal ramp intersects both cuts.
const city=rect(0,0,20,16);
const openings=[{poly:rect(-2,3,14,11),inner:[rect(3,5,10,9)]},
  {poly:rect(6,6,12,8)}, {poly:[[0,14],[18,4],[19,6],[1,16]]}];
audit('overlapping river, island, stair and ramp',city,openings,.19,4);
const wideHole=[{poly:rect(-1,5,23,11)}];
assert.ok(Math.abs(audit('horizontal cut across entire tiles',city,wideHole,.37,3)-200)<1e-7);
// Exercise the actual, border-clipped river relation and all its islands.
const osm=JSON.parse(fs.readFileSync(new URL('../data/osm.json',import.meta.url)));
const water=osm.areas.filter(a=>a.kind.includes('water'))
  .map(a=>({poly:a.poly,inner:a.holes}));
audit('OSM rivers, ponds and islands',rect(...osm.bbox),water,12.5);
