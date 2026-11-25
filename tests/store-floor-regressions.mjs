// Gangnam store guides and floor maps: https://www.shinsegae.com/store/floor.do?storeCd=SC00002
// Expected landmarks are fixed independently of the zones and ramps under test.
import assert from 'node:assert/strict';
import fs from 'node:fs';
import * as THREE from 'three';
import { createPhysics, pointInPoly } from '../js/physics.js';
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
// Standard and custom shallow escalators both register a moving physics ramp.
const addRamp = phys.addRamp;
phys.addRamp = function (ax, az, bx, bz, halfWidth, ya, yb, options) {
  const surface = addRamp(ax, az, bx, bz, halfWidth, ya, yb, options);
  if (surface.tag === 'shinsegae' && surface.move) {
    const along = surface.ux * surface.move[0] + surface.uz * surface.move[1];
    escalators.push({ surface, ax, az, bx, bz, ya, yb, dir: along * (yb - ya) > 0 ? 'up' : 'down' });
  }
  return surface;
};
const claimed = { b: new Set(), r: new Set(), a: new Set() };
for (const mod of [shinsegae, centralcity, jwmarriott]) {
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
]) {
  const candidates = zones.filter(zone => zone.place === 'shinsegae' && zone.floor === floor && zone.name === name);
  assert.ok(candidates.some(zone => Math.abs(zone.y0 - levels[floor]) < .05 &&
    Math.hypot((zone.bb[0]+zone.bb[2])/2 - x, (zone.bb[1]+zone.bb[3])/2 - z) < tolerance), `${floor} ${name}: missing or misplaced`);
  console.log(`OK ${floor} ${name}`);
}
// On 2026-11-25 the 2000×1500 guide label centres were digitised on the
// registered map. The comments give the source pixels for each control;
// a label must land inside its named footprint, including irregular shop bays.
for (const [floor, name, x, z] of [
  ['2F', '불가리', -13.21, 89.52],         // (1859, 650), above Tiffany by the JW passage
  ['2F', '티파니앤코', -42.51, 100.64],   // (1859, 1048)
  ['3F', '오메가', -51.02, 53.15],        // (1197, 979)
  ['3F', '까르띠에', -62.65, 77.94],      // (1463, 1203)
  ['4F', 'R13', -40.93, 20.52],           // (821, 728)
  ['4F', '케이스스터디', -39.40, 31.51],  // (972, 757)
  ['4F', '어그 맨&키즈', -38.21, 86.44],  // (1695, 973)
  ['5F', '디에스퍼', -41.11, 40.50],      // (1081, 855)
  ['5F', '룰루레몬', -58.84, 38.50],      // (967, 1021)
]) {
  assert.ok(zones.some(zone => zone.place === 'shinsegae' && zone.floor === floor &&
    zone.name === name && Math.abs(zone.y0 - levels[floor]) < .05 && pointInPoly(x, z, zone.poly)),
    `${floor} ${name}: guide label falls outside the store footprint`);
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
  for (const [x,z,height] of [from,to]) {
    const y = floorAt(x,z,height), p = {x,z};
    if (!Number.isFinite(y) || Math.abs(y-height) > .7) return false;
    phys.resolve(p,radius,y,y+playerHeight,step);
    if (Math.hypot(p.x-x,p.z-z) >= .03) return false;
  }
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
  ['2F main west escalator landing to Tiffany frontage', [-64.39,15.96,7], [-43.8,96.61,7]],
  ['2F annex escalator landing to Tiffany frontage', [-25.89,87.50,7], [-43.8,96.61,7]],
  ['2F annex lift lobby to Tiffany frontage', [-25.58,97.22,7], [-43.8,96.61,7]],
  ['2F annex lift lobby to Bulgari frontage', [-25.58,97.22,7], [-14.86,85.63,7]],
]) {
  assert.ok(reachable(from,to), `${name}: no clear walkable path`);
  console.log(`OK ${name}`);
}

// The public guides show two escalator symbols around the main atrium and
// one in the annex. Fixed approximate world centres distinguish their banks.
const banks = [
  { name: 'main west', x: -66, z: 9, first: 0 },
  { name: 'main east', x: -53, z: 4, first: 0 },
  { name: 'annex', x: -30, z: 83, first: 7 },
];
for (const [lower, upper] of [[0,7], [7,11.8], [11.8,16.6], [16.6,21.4]]) {
  const flights = escalators.filter(e => Math.abs(Math.min(e.ya,e.yb)-lower) < .01 &&
    Math.abs(Math.max(e.ya,e.yb)-upper) < .01);
  for (const bank of banks.filter(bank => lower >= bank.first)) {
    const lanes = flights.filter(e => Math.hypot((e.ax+e.bx)/2 - bank.x, (e.az+e.bz)/2 - bank.z) < 5);
    for (const direction of ['up','down']) {
      const matches = lanes.filter(e => e.dir === direction);
      const label = `${bank.name} ${lower}–${upper} ${direction}`;
      assert.equal(matches.length, 1, `${label}: expected one powered flight`);
      const e = matches[0];
      for (let i=0; i<=20; i++) {
        const t=i/20, x=e.ax+(e.bx-e.ax)*t, z=e.az+(e.bz-e.az)*t, expected=e.ya+(e.yb-e.ya)*t;
        const y=floorAt(x,z,expected), p={x,z};
        assert.ok(Number.isFinite(y) && Math.abs(y-expected)<.7, `${label}: missing support at ${i*5}%`);
        phys.resolve(p,radius,y,y+playerHeight,step);
        assert.ok(Math.hypot(p.x-x,p.z-z)<.15, `${label}: blocked at ${i*5}%`);
        // The level comb plates can take over support at either end.
        if (i>0 && i<20) {
          assert.equal(phys.support(x,z,expected+step).s, e.surface, `${label}: covered tread at ${i*5}%`);
        }
      }
    }
    console.log(`OK ${bank.name} ${lower}–${upper} both directions`);
  }
}
