// Check public park transects, signed bridge widths and a normal walking capsule.
import assert from 'node:assert/strict';
import fs from 'node:fs';
import * as THREE from 'three';
import { createKit } from '../js/kit.js';
import { createPhysics, createPlayer } from '../js/physics.js';
import { relief } from '../js/banpo_relief.js';
import { waterHeight } from '../js/banpo_dem.js';
import { buildCity } from '../js/city.js';
import { build, meta, fountainScheduled } from '../js/places/hangang.js';

const ctx = new Proxy({}, {get(target,key) {
  if (key==='measureText') return s=>({width:String(s).length*10});
  if (['createLinearGradient','createRadialGradient','createPattern'].includes(key)) return ()=>({addColorStop(){}});
  if (key==='getImageData') return ()=>({data:new Uint8ClampedArray(4)});
  return target[key] ?? (()=>{});
}});
globalThis.__makeCanvas=(width,height)=>({width,height,style:{},getContext:()=>ctx});
const osm=JSON.parse(fs.readFileSync(new URL('../data/osm.json',import.meta.url)));
const scene=new THREE.Scene(), phys=createPhysics(), kit=createKit(THREE,scene,{osm,phys});
let onNight;
kit.onNight=fn=>{onNight=fn;fn(true);};
kit._.setCurrent('hangang',meta);
build(kit);
kit._.setCurrent('city');
buildCity(kit,osm,{claimedBuildings:new Set(meta.claims),claimedRoads:new Set(meta.claimRoads),claimedAreas:new Set(meta.claimAreas)});
kit._.buildAllDetail();
assert.deepEqual(kit._.detailErrors,[]);
const bank=kit._.zonesList.find(z=>z.place==='hangang' && z.name==='반포한강공원').poly;
// Total distance read from the real Naver ruler, ±4 m for picking edges.
for (const [x,north,width] of [[-803.01,-687.91,216.0],[-570.88,-853.48,225.5],[-390.86,-907.10,176.2]]) {
  const crossings=[];
  bank.forEach((a,i)=>{
    const b=bank[(i+1)%bank.length];
    if (Math.min(a[0],b[0])<=x && x<Math.max(a[0],b[0]))
      crossings.push(a[1]+(x-a[0])*(b[1]-a[1])/(b[0]-a[0]));
  });
  crossings.sort((a,b)=>a-b);
  assert.equal(crossings.length,2);
  assert.ok(Math.abs(crossings[0]-north)<4 && Math.abs(crossings[1]-crossings[0]-width)<4,'public bank transect at '+x);
}
const player=createPlayer(phys);
function walk(name,from,to) {
  const yaw=Math.atan2(from[0]-to[0],from[1]-to[1]);
  player.teleport(from[0],0,from[1],yaw);
  const length=Math.hypot(to[0]-from[0],to[1]-from[1]);
  for(let i=0;i<Math.ceil(length*50);i++){
    if(Math.hypot(player.x-to[0],player.z-to[1])<.22) return;
    player.update(1/60,{f:1,s:0});
    assert.ok(player.y>-.6,name+' lost deck support');
  }
  assert.fail(name+' stopped at '+[player.x,player.y,player.z].map(x=>x.toFixed(2)));
}
for(const [name,a,b,w] of [
  ['가빛 주도교',[-827.27,-669.485],[-855.25,-724.8],6],
  ['가빛–솔빛',[-880.2,-779.2],[-890.4,-813.1],4.3],
  ['솔빛–채빛',[-868.1,-833.8],[-824,-827.1],4.3],
]) {
  const distance=Math.hypot(b[0]-a[0],b[1]-a[1]);
  const nx=-(b[1]-a[1])/distance,nz=(b[0]-a[0])/distance;
  for(const side of [-1,1]){
    // A walker near each rail must fit; outside it the river lies below the deck.
    const offset=side*(w/2-.7);
    const at=(t,o)=>[a[0]+(b[0]-a[0])*t+nx*o,a[1]+(b[1]-a[1])*t+nz*o];
    walk(name,at(.1,offset),at(.9,offset));
    const outside=at(.3,side*(w/2+.6));
    assert.ok(phys.support(...outside,.45).y<-.6,name+' extends beyond the listed width');
  }
  walk(name+' centre',a,b);
}

// Seoul's construction notice reserves at least 6 m for public passage.
const start=[-694.02,-920.79],end=[-762.57,-1098.77];
const dx=end[0]-start[0],dz=end[1]-start[1],length=Math.hypot(dx,dz);
for (const lateral of [-2.7,0,2.7]) for(let i=0;i<=20;i++){
  const x=start[0]+dx*i/20-dz*lateral/length, z=start[1]+dz*i/20+dx*lateral/length;
  const expected=waterHeight+2.7-relief(x,z), y=phys.support(x,z,expected+.45).y, q={x,z};
  assert.ok(Math.abs(expected-y)<.45,'Jamsu lower deck support');
  phys.resolve(q,.32,y,y+1.75,.5);
  assert.ok(Math.hypot(q.x-x,q.z-z)<.03,'Jamsu six-metre walking corridor');
}
const date=iso=>Date.parse('2026-'+iso+'+09:00');
for(const [iso,open] of [
  ['03-14T12:10',false],['03-15T12:00',true],['03-15T12:20',false],
  ['05-01T21:35',false],['06-01T21:35',true],['09-30T21:49',true],
  ['10-31T21:19',true],['10-31T21:20',false],['11-01T19:45',false],
])assert.equal(fountainScheduled(date(iso)),open,iso);
const fountain=scene.getObjectByName('달빛무지개분수');
assert.ok(fountain && onNight);
for(const [iso,visible] of [['11-26T21:00',false],['06-10T12:10',true],['06-10T12:20',false]]){
  scene.userData.solarTime=date(iso);
  onNight(true);
  for(const fn of kit._.frameFns)fn(.016,1,player);
  assert.equal(fountain.visible,visible,iso+' display');
}
console.log('OK 3 park transects, 3 pier widths, 9 player crossings, 63 Jamsu clearance samples and Seoul fountain schedule');
