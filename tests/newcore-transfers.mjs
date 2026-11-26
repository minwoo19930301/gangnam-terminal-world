// Runs the full NewCore module, including retail fixtures, without a renderer.
import assert from 'node:assert/strict';
import fs from 'node:fs';
import * as THREE from 'three';
import { createKit } from '../js/kit.js';
import { createPhysics, createPlayer } from '../js/physics.js';
import * as newcore from '../js/places/newcore.js';

const context = new Proxy({}, {
  get(target, name) {
    if (name === 'measureText') return text => ({width: String(text).length*10});
    if (['createLinearGradient','createRadialGradient','createPattern'].includes(name)) return () => ({addColorStop() {}});
    if (name === 'getImageData') return () => ({data: new Uint8ClampedArray(4)});
    return target[name] ?? (() => {});
  },
});
globalThis.__makeCanvas = (width,height) => ({width,height,style:{},getContext:() => context});
const osm = JSON.parse(fs.readFileSync(new URL('../data/osm.json',import.meta.url)));
const phys = createPhysics(), lanes = [];
const addRamp = phys.addRamp;
phys.addRamp = (...args) => {
  const s = addRamp(...args);
  if (s.move) lanes.push(s);
  return s;
};
const kit = createKit(THREE,new THREE.Scene(),{osm,phys});
kit.onNight = () => {};
kit._.setCurrent('newcore',newcore.meta);
newcore.build(kit);
kit._.buildAllDetail();

assert.equal(lanes.length,20,'9 escalator pairs and one pair of cart belts');
assert.equal(kit._.detailErrors.length,0,'deferred shop fixtures loaded');
for (const [index,s] of lanes.entries()) {
  const dir = Math.sign(s.ux*s.move[0]+s.uz*s.move[1]);
  const speed = Math.hypot(...s.move);
  const point = t => {
    const k = dir === 1 ? t : 1-t;
    const x = s.ax+k*s.ux*s.L, z = s.az+k*s.uz*s.L;
    return {x,z,y:s.ya+k*(s.yb-s.ya)+(s.heightOffset?.(x,z) ?? 0)};
  };
  const label = 'lane '+(index+1);
  for (let n=0;n<=100;n++) {
    const p = point(n/100), q = {...p};
    const floor = phys.support(p.x,p.z,p.y+.25).y;
    assert.ok(Math.abs(floor-p.y)<.27,label+' floor at '+n+'%');
    phys.resolve(q,.32,floor,floor+1.75,.5);
    assert.ok(Math.hypot(q.x-p.x,q.z-p.z)<.03,label+' capsule at '+n+'%');
    assert.ok(!Number.isFinite(phys.ceilingAbove(p.x,p.z,floor+.01,floor+1.75)),label+' headroom at '+n+'%');
  }
  const rider = createPlayer(phys);
  const start = point(.03), end = point(.97);
  rider.teleport(start.x,start.y,start.z,0);
  const near = (player,p) => Math.hypot(player.x-p.x,player.z-p.z)<.12;
  for (let i=0;i<Math.ceil(s.L/speed*60)+3 && !near(rider,end);i++) rider.update(1/60,{f:0,s:0});
  assert.ok(near(rider,end) && Math.abs(rider.y-end.y)<.25,label+' standing ride');

  const entry = point(-.75/s.L), exit = point(1+.75/s.L), walker = createPlayer(phys);
  walker.teleport(entry.x,point(0).y,entry.z,Math.atan2(entry.x-exit.x,entry.z-exit.z));
  for (let i=0;i<Math.ceil((s.L+4)/2*60) && !near(walker,exit);i++) walker.update(1/60,{f:1,s:0});
  assert.ok(near(walker,exit) && Math.abs(walker.y-point(1).y)<.25,label+' entry and exit');
}
console.log(lanes.length+' powered rides and landings passed, '+(lanes.length*101)+' clearance samples passed');
