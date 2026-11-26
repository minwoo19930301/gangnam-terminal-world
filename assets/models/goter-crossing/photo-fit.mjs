import assert from 'node:assert/strict';
import fs from 'node:fs';
import {applyRoadEdits} from '../../../js/blender-roads.js';
import {origin,toWorld,apron,angle} from './layout.js';

// Street View centres and measured mast bearings. Heights and edge dimensions were inferred.
const observation=[
  {id:'HK5BFh1JiYwO0LFmRGUw-A',lon:127.0092228,lat:37.5073114,bearing:24.4},
  {id:'Xj8lR0my1cNJYr0iBlNBng',lon:127.0091589,lat:37.5074002,bearing:131.25},
];
const cross=(a,b)=>a[0]*b[1]-a[1]*b[0];
const diff=(a,b)=>[a[0]-b[0],a[1]-b[1]];
const position=p=>[(p.lon-127.0049222)*88310.29798,-(p.lat-37.5050371)*110540];
const ray=p=>[Math.sin(p.bearing*Math.PI/180),-Math.cos(p.bearing*Math.PI/180)];
const [a,b]=observation.map(position),[u,v]=observation.map(ray);
const dist=cross(diff(b,a),v)/cross(u,v);
const fit=a.map((e,i)=>e+dist*u[i]),residual=Math.hypot(...diff(fit,origin));
assert.ok(residual<.025,JSON.stringify({fit,origin,residual}));
assert.ok(Math.abs(Math.hypot(...diff(toWorld(-11.70,0),origin))-11.70)<1e-8);
// Keep the raised island clear of the 4.3 m slip lane on the OSM carriageway.
const osm=applyRoadEdits(JSON.parse(fs.readFileSync(new URL('../../../data/osm.json',import.meta.url))));
const road=osm.roads.find(r=>r.id===1263366778);
const slip=road.pts.map(([x,z])=>[(x-origin[0])*Math.cos(angle)-(z-origin[1])*Math.sin(angle),(x-origin[0])*Math.sin(angle)+(z-origin[1])*Math.cos(angle)]);
function segmentDistance(p,a,b){
  const [u,v]=diff(b,a);const t=Math.max(0,Math.min(1,((p[0]-a[0])*u+(p[1]-a[1])*v)/(u*u+v*v)));
  return Math.hypot(p[0]-a[0]-t*u,p[1]-a[1]-t*v);
}
const slipClearance=Math.min(...apron.flatMap(p=>slip.slice(1).map((b,i)=>segmentDistance(p,slip[i],b))))-road.width/2;
assert.ok(slipClearance>.08,JSON.stringify({slipClearance}));
console.log(JSON.stringify({views:observation.map(o=>o.id),slipClearanceMetres:slipClearance,projectedMast:fit,roundingMetres:residual,viewDistances:[a,b].map(p=>Math.hypot(...diff(fit,p)))}));
