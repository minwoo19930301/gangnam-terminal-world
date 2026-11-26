// Check real collision geometry for the G11 stairs and 9GATE corridor.
import * as THREE from 'three';
import fs from 'node:fs';
import { createPhysics } from '../js/physics.js';
import { createKit } from '../js/kit.js';
import { buildCity } from '../js/city.js';
import * as gotomall from '../js/places/gotomall.js';
import * as gyeongbu from '../js/places/gyeongbu.js';
import * as shinsegae from '../js/places/shinsegae.js';
import * as centralcity from '../js/places/centralcity.js';
import * as jwmarriott from '../js/places/jwmarriott.js';
import {plan as foodHallPoint} from '../assets/models/cinema-rotary/layout.js';
import {sweetParkPoint} from '../js/places/sweet-park-plan.js';
import {point as cinemaPoint} from '../assets/models/megabox-central/layout.js';
import { JUNCTIONS } from '../js/places/_junctions.js';

const context = new Proxy({}, {
  get: (target, key) => key === 'measureText' ? text => ({width: String(text).length * 10}) :
    key === 'createLinearGradient' || key === 'createRadialGradient' || key === 'createPattern' ? () => ({addColorStop() {}}) :
    key === 'getImageData' ? () => ({data: new Uint8ClampedArray(4)}) :
    typeof key === 'string' && /^[a-z]/.test(key) && !(key in target) ? () => {} : target[key],
  set: (target, key, value) => { target[key] = value; return true; },
});
globalThis.__makeCanvas = () => ({getContext: () => context, style: {}});

const osm = JSON.parse(fs.readFileSync(new URL('../data/osm.json', import.meta.url), 'utf8'));
const phys = createPhysics();
const kit = createKit(THREE, new THREE.Scene(), {osm, phys});
const claimed = {b: new Set(), r: new Set(), a: new Set()};
for (const mod of [gotomall, gyeongbu, shinsegae, centralcity, jwmarriott]) {
  kit._.setCurrent(mod.meta.id, mod.meta);
  mod.build(kit);
  for (const id of mod.meta.claims || []) claimed.b.add(id);
  for (const id of mod.meta.claimRoads || []) claimed.r.add(id);
  for (const id of mod.meta.claimAreas || []) claimed.a.add(id);
}
kit._.setCurrent('city');
buildCity(kit, osm, {claimedBuildings: claimed.b, claimedRoads: claimed.r, claimedAreas: claimed.a});
kit._.buildAllDetail();

const step = .5, grid = .25, radius = .32, height = 1.75;
function floorAt(x, z, y) {
  return Math.max(...[[0,0],[.12,0],[-.12,0],[0,.12],[0,-.12]].map(([dx,dz]) => phys.support(x + dx, z + dz, y + step).y));
}
function canWalk(from, to, away = false) {
  const [x0,z0,y0] = from;
  const bounds = [Math.min(x0,to[0])-25,Math.min(z0,to[1])-25,Math.max(x0,to[0])+25,Math.max(z0,to[1])+25];
  const yStart = floorAt(x0,z0,y0);
  if (!Number.isFinite(yStart) || Math.abs(yStart-y0) > .7) return false;
  const queue = [[0,0,yStart]], seen = new Set([`0,0,${Math.round(yStart*2)}`]);
  for (let i = 0; i < queue.length && i < 100000; i++) {
    const [ix,iz,y] = queue[i], x = x0 + ix*grid, z = z0 + iz*grid;
    const distance = Math.hypot(x-to[0], z-to[1]);
    if ((away ? distance > 4 : distance < .6) && Math.abs(y-to[2]) < .7) return true;
    for (const [dx,dz] of [[1,0],[-1,0],[0,1],[0,-1]]) {
      const nx = x + dx*grid, nz = z + dz*grid;
      if (nx < bounds[0] || nx > bounds[2] || nz < bounds[1] || nz > bounds[3]) continue;
      const ny = floorAt(nx,nz,y);
      if (!Number.isFinite(ny) || ny < y-.6 || ny > y+step) continue;
      const key = `${ix+dx},${iz+dz},${Math.round(ny*2)}`;
      if (seen.has(key)) continue;
      seen.add(key);
      const pos = {x:nx,z:nz};
      phys.resolve(pos,radius,ny,ny+height,step);
      if (Math.hypot(pos.x-nx,pos.z-nz) < .03) queue.push([ix+dx,iz+dz,ny]);
    }
  }
  return false;
}

// The entrance axis must stay on the floor and clear at walking height, so
// displays in the central pop-up do not block the view to the opposite door.
for (let v=6; v<=84; v+=.25) {
  const a=33.2/67, b=v/84.7;
  const x=-107.07+62.61*a+30.43*b-.32*a*b, z=-24.31-23.77*a+79.03*b+.13*a*b;
  const y=floorAt(x,z,0), pos={x,z};
  if (Number.isFinite(y)) phys.resolve(pos,radius,y,y+height,step);
  if (!Number.isFinite(y) || Math.abs(y)>.5 || Math.hypot(pos.x-x,pos.z-z)>=.03)
    throw new Error(`Shinsegae entrance axis obstructed at v=${v}`);
}
console.log('OK Shinsegae entrance axis');

// Walk the published white aisles directly. A pathfinder is free to detour
// around a blocking partition or escalator, which would miss this regression.
for(const [label,path] of [
  ['market to cinema lobby',[[833,547],[826,574],[835,585],[835,601],[832,608],[832,670],[832,749],[830,817],[793,855]].map(p=>foodHallPoint(...p)).concat([cinemaPoint(0,2),cinemaPoint(0,-2)])],
  ['food hall transverse café aisle',[[830,787],[871,787],[933,787],[990,787],[1026,787]].map(p=>foodHallPoint(...p))],
  ['café aisle into the Sweet Park dessert hall',[foodHallPoint(1026,787),...[[1032,787],[1146,787],[1213.5,787],[1213.5,755]].map(p=>sweetParkPoint(...p))]],
]){
  for(let i=1;i<path.length;i++){
    const [x,z]=path[i-1],[endX,endZ]=path[i];
    const n=Math.ceil(Math.hypot(endX-x,endZ-z)/.20);
    for(let j=0;j<=n;j++){
      const px=x+(endX-x)*j/n,pz=z+(endZ-z)*j/n,pos={x:px,z:pz};
      const floor=floorAt(px,pz,-6),ceiling=phys.ceilingAbove(px,pz,-5.9,-.1);
      phys.resolve(pos,radius,-6,-6+height,step);
      if(Math.abs(floor+6)>.04 || !Number.isFinite(ceiling) || ceiling<=-6+height || Math.hypot(pos.x-px,pos.z-pz)>.05)
        throw new Error(`${label} interrupted on segment ${i} at (${px.toFixed(2)}, ${pz.toFixed(2)})`);
    }
  }
  console.log('OK '+label);
}


for (const [name,from,to] of [
  ['user link to Central City atrium', [-52.1,109.8,0], [-36,72,0]],
  ['Shinsegae 3GATE to Central City atrium', [-44,47,0], [-36,72,0]],
  ['Central City atrium to 1M escalator landing', [-36,72,0], [-30.59,92.25,3.6]],
  ['G11 door to Daiso hall', [244.8,-181.5,-6], [246.5,-170,-4]],
  ['Daiso hall to store', [246.5,-170,-4], [238,-167,-4]],
  ['Daiso hall to street', [246.5,-170,-4], [254.5,-171,0]],
  ['market to 9GATE', [-43.82,37.99,-6], [-38.67,51.495,-6]],
  ['9GATE to Sweet Park aisle', [-38.67,51.495,-6], [-37,90,-6]],
]) {
  if (!canWalk(from,to)) throw new Error(`${name}: no walkable route`);
  console.log(`OK ${name}`);
}

// These lifts use a different arrival offset on different floors. Check the
// destination itself and a path out instead of the original car location.
const suspect = kit._.elevators.filter(el => /연결부|북서 고객/.test(el.name));
for (const el of suspect) for (const floor of el.floors) {
  if (!(/연결부/.test(el.name) && floor.label==='1M') &&
      !(/북서 고객/.test(el.name) && floor.label==='11F')) continue;
  const destination=[el.x+(floor.dx||0),el.z+(floor.dz||0),floor.y];
  if (!canWalk(destination,destination,true)) throw new Error(`${el.name} ${floor.label}: cannot leave destination`);
  console.log(`OK ${el.name} ${floor.label} arrival`);
}

// Multiple connections join Shinsegae and Central City. Verify the published
// area-switch direction belongs to this 9GATE, not another connection's pair.
const meta = JSON.parse(fs.readFileSync(new URL('../js/places/_meta.json', import.meta.url), 'utf8'));
const gate = JUNCTIONS.find(j => j.id === 'J_CC_9GATE');
const dx=gate.pb[0]-gate.pa[0], dz=gate.pb[1]-gate.pa[1], length=Math.hypot(dx,dz);
for (const [place,sign] of [[gate.a,1],[gate.b,-1]]) {
  const j=meta[place].junctions.find(j => j.id === gate.id);
  if (!j || Math.abs(j.nx-sign*dx/length)>.001 || Math.abs(j.nz-sign*dz/length)>.001)
    throw new Error(`${place}: wrong 9GATE area-switch direction; regenerate metadata`);
}
console.log('OK 9GATE area-switch directions');
