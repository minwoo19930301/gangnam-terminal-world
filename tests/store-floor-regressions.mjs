// Check the floor and approximate physical placement of representative stores
// against the Gangnam store guides verified on 2026-11-10. The expected world
// coordinates are independent landmarks, not re-derived from model plan data.
import assert from 'node:assert/strict';
import fs from 'node:fs';
import * as THREE from 'three';
import { createPhysics } from '../js/physics.js';
import { createKit } from '../js/kit.js';
import { buildCity } from '../js/city.js';
import * as shinsegae from '../js/places/shinsegae.js';
import * as centralcity from '../js/places/centralcity.js';
import * as jwmarriott from '../js/places/jwmarriott.js';

const ctx = new Proxy({}, {
  get: (target, key) => key === 'measureText' ? text => ({ width: String(text).length * 10 }) :
    key === 'createLinearGradient' || key === 'createRadialGradient' || key === 'createPattern' ? () => ({ addColorStop() {} }) :
    key === 'getImageData' ? () => ({ data: new Uint8ClampedArray(4) }) :
    typeof key === 'string' && /^[a-z]/.test(key) && !(key in target) ? () => {} : target[key],
  set: (target, key, value) => { target[key] = value; return true; }
});
globalThis.__makeCanvas = () => ({ getContext: () => ctx, style: {} });
const osm = JSON.parse(fs.readFileSync(new URL('../data/osm.json', import.meta.url), 'utf8'));
const phys = createPhysics();
const kit = createKit(THREE, new THREE.Scene(), { osm, phys });
const signs = [];
const originalSign = kit.sign;
kit.sign = (text, options) => { signs.push({ text: Array.isArray(text) ? text.join(' ') : String(text), ...options }); return originalSign(text, options); };
const escalators = [];
const originalEscalator = kit.escalator;
let currentPlace = '';
kit.escalator = (ax, az, bx, bz, options) => {
  if (currentPlace === 'shinsegae') escalators.push({ ax, az, bx, bz, ...options });
  return originalEscalator(ax, az, bx, bz, options);
};
const claimed = { b: new Set(), r: new Set(), a: new Set() };
for (const mod of [shinsegae, centralcity, jwmarriott]) {
  currentPlace = mod.meta.id;
  kit._.setCurrent(mod.meta.id, mod.meta);
  mod.build(kit);
  for (const id of mod.meta.claims || []) claimed.b.add(id);
  for (const id of mod.meta.claimRoads || []) claimed.r.add(id);
  for (const id of mod.meta.claimAreas || []) claimed.a.add(id);
}
kit._.setCurrent('city');
buildCity(kit, osm, { claimedBuildings: claimed.b, claimedRoads: claimed.r, claimedAreas: claimed.a });
kit._.buildAllDetail();
assert.deepEqual(kit._.detailErrors, [], 'floor details must build without errors');
const zones = kit._.zonesList;
const levels = { '1F': 0, '1M': 3.6, '2F': 7, '3F': 11.8, '4F': 16.6, '5F': 21.4 };
// Names and approximate store centres taken from the official floor guides;
// y is independently checked so a matching label on another level cannot pass.
for (const [floor, name, x, z, tolerance] of [
  ['1F', '딥티크', -43.46, -26.76, 3],
  ['1F', '케이스스터디', -66.06, 23.26, 3],
  ['1M', '멤버스바', -30.01, 31.03, 3],
  ['1M', '베키아에누보', -81.76, 29.05, 3],
  ['2F', '불가리', -34.50, 34.77, 3],
  ['2F', '티파니앤코', -63.56, 45.80, 3],
  ['3F', '오메가', -64.43, 17.70, 3],
  ['3F', '까르띠에', -78.88, 34.97, 3],
  ['4F', 'R13', -50.18, -3.56, 3],
  ['4F', '케이스스터디', -50.68, 3.62, 3],
  ['4F', '어그 맨&키즈', -57.11, 36.53, 3],
  ['5F', '디에스퍼', -53.09, 9.41, 3],
  ['5F', '룰루레몬', -70.66, 10.91, 3],
]) {
  const candidates = zones.filter(zone => zone.place === 'shinsegae' && zone.floor === floor && zone.name === name);
  assert.ok(candidates.some(zone => Math.abs(zone.y0 - levels[floor]) < .05 &&
    Math.hypot((zone.bb[0]+zone.bb[2])/2 - x, (zone.bb[1]+zone.bb[3])/2 - z) < tolerance), `${floor} ${name}: missing or misplaced`);
  console.log(`OK ${floor} ${name}`);
}
const bvlgari = zones.find(z => z.place === 'shinsegae' && z.floor === '2F' && z.name === '불가리');
const tiffany = zones.find(z => z.place === 'shinsegae' && z.floor === '2F' && z.name === '티파니앤코');
assert.ok((bvlgari.bb[0] + bvlgari.bb[2]) / 2 > (tiffany.bb[0] + tiffany.bb[2]) / 2 + 20, '2F Bulgari and Tiffany must preserve the guide order');
const ccMezz = zones.find(z => z.place === 'centralcity' && z.floor === '1M' && z.name === '센트럴시티 중층 갤러리');
assert.ok(ccMezz && Math.abs(ccMezz.y0 - 3.6) < .05, 'Central City mezzanine floor missing');
assert.ok(zones.some(z => z.place === 'centralcity' && z.floor === '1M' && z.name === '분더샵 메자닌'), 'House of Shinsegae mezzanine must be distinct');
assert.ok(signs.some(s => s.text === '순대실록' && s.y >= 3.6 && s.y < 7), '순대실록 mezzanine storefront sign missing');
console.log('OK Central City mezzanine, 순대실록 and separate House mezzanine');

// Real physics geometry, including furniture, not a hand-drawn line on the map.
const step = .5, grid = .25, radius = .32, playerHeight = 1.75;
function floorAt(x, z, y) {
  return Math.max(...[[0,0],[.12,0],[-.12,0],[0,.12],[0,-.12]].map(([dx,dz]) => phys.support(x+dx,z+dz,y+step).y));
}
function reachable(from, to) {
  const [x0,z0,y0] = from, startY = floorAt(x0,z0,y0);
  if (!Number.isFinite(startY) || Math.abs(startY-y0) > .7) return false;
  const bounds=[Math.min(x0,to[0])-55,Math.min(z0,to[1])-55,Math.max(x0,to[0])+55,Math.max(z0,to[1])+55];
  const todo=[[0,0,startY]], seen=new Set([`0,0,${Math.round(startY*2)}`]);
  for(let i=0;i<todo.length&&i<500000;i++){
    const [ix,iz,y]=todo[i], x=x0+ix*grid, z=z0+iz*grid;
    if(Math.hypot(x-to[0],z-to[1])<.9 && Math.abs(y-to[2])<.7) return true;
    for(const [dx,dz] of [[1,0],[-1,0],[0,1],[0,-1]]){
      const nx=x+dx*grid,nz=z+dz*grid;
      if(nx<bounds[0]||nx>bounds[2]||nz<bounds[1]||nz>bounds[3])continue;
      const ny=floorAt(nx,nz,y); if(!Number.isFinite(ny)||ny<y-.6||ny>y+step||Math.abs(ny-y0)>.7)continue;
      const key=`${ix+dx},${iz+dz},${Math.round(ny*2)}`; if(seen.has(key))continue;
      const p={x:nx,z:nz};phys.resolve(p,radius,ny,ny+playerHeight,step);
      if(Math.hypot(p.x-nx,p.z-nz)<.03){seen.add(key);todo.push([ix+dx,iz+dz,ny]);}
    }
  }
  return false;
}
for (const [name, from, to] of [
  ['1M Shinsegae-to-Central City bridge', [-45.7,54,3.6], [-42.7,59.2,3.6]],
  ['2F west escalator landing to Tiffany frontage', [-59.151,17.389,7], [-65.29,42.66,7]],
  ['2F lift lobby to Tiffany frontage', [-49.646,39.984,7], [-65.29,42.66,7]],
  ['2F lift lobby to Bulgari frontage', [-49.646,39.984,7], [-32.72,30.35,7]],
]) {
  assert.ok(reachable(from,to), `${name}: no clear walkable path`);
  console.log(`OK ${name}`);
}

// Both the main and annex escalator banks must connect every successive
// department-store floor through 5F. Check the physical support and walking
// capsule at 21 points on every flight, including both up and down lanes.
for (const [lower, upper] of [[7, 11.8], [11.8, 16.6], [16.6, 21.4]]) {
  const flights = escalators.filter(e => Math.abs(e.ya - lower) < .01 && Math.abs(e.yb - upper) < .01);
  assert.equal(flights.filter(e => e.dir === 'up').length, 2, `${lower}–${upper}: missing up lane`);
  assert.equal(flights.filter(e => e.dir === 'down').length, 2, `${lower}–${upper}: missing down lane`);
  for (const e of flights) for (let i=0; i<=20; i++) {
    const t=i/20, x=e.ax+(e.bx-e.ax)*t, z=e.az+(e.bz-e.az)*t, expected=lower+(upper-lower)*t;
    const y=floorAt(x,z,expected), p={x,z};
    assert.ok(Number.isFinite(y) && Math.abs(y-expected)<.7, `${lower}–${upper}: missing support at ${i*5}%`);
    phys.resolve(p,radius,y,y+playerHeight,step);
    assert.ok(Math.hypot(p.x-x,p.z-z)<.15, `${lower}–${upper}: blocked at ${i*5}%`);
  }
  console.log(`OK ${lower}–${upper} both escalator banks`);
}
// The 1F-to-2F escalators have walkable support throughout their climb.
// The sample points are the centres of the two actual escalators, not visual
// arrows; this catches a floor slab accidentally sealing an escalator shaft.
for (const [name, from, to] of [
  ['east escalator 1F–2F', [-51.778,10.313,0], [-56.063,-.894,7]],
  ['west escalator 1F–2F', [-65.632,7.016,0], [-59.151,17.389,7]],
]) {
  for (let i=0;i<=20;i++) {
    const t=i/20, x=from[0]*(1-t)+to[0]*t, z=from[1]*(1-t)+to[1]*t, expected=from[2]*(1-t)+to[2]*t;
    const y=floorAt(x,z,expected), p={x,z};
    assert.ok(Number.isFinite(y) && Math.abs(y-expected)<.7, `${name}: missing support at ${Math.round(t*100)}%`);
    phys.resolve(p,radius,y,y+playerHeight,step);
    assert.ok(Math.hypot(p.x-x,p.z-z)<.15, `${name}: blocked at ${Math.round(t*100)}%`);
  }
  console.log(`OK ${name}`);
}
