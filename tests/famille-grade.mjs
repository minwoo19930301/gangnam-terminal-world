// Walk the real connected place modules in the indoor and exterior elevation frames.
import assert from 'node:assert/strict';
import fs from 'node:fs';
import * as THREE from 'three';
import { createKit } from '../js/kit.js';
import { createPhysics, createPlayer } from '../js/physics.js';
import { installRelief, relief, surveyElevation } from '../js/banpo_relief.js';
import * as central from '../js/places/centralcity.js';
import * as east from '../js/places/famille.js';

const context = new Proxy({}, {get(target, name) {
  if (name === 'measureText') return text => ({width:String(text).length*10});
  if (['createLinearGradient','createRadialGradient','createPattern'].includes(name)) return () => ({addColorStop() {}});
  if (name === 'getImageData') return () => ({data:new Uint8ClampedArray(4)});
  return target[name] ?? (() => {});
}});
globalThis.__makeCanvas = (width,height) => ({width,height,style:{},getContext:() => context});
const osm = JSON.parse(fs.readFileSync(new URL('../data/osm.json',import.meta.url)));
const angle = Math.atan2(.3639,.9315), ax = Math.sin(angle), az = Math.cos(angle);
const point = (s,t) => [-135.7+ax*s+az*t,9.9+az*s-ax*t];
const near = (a,b,eps,msg) => assert.ok(Math.abs(a-b)<=eps,msg+' ('+a+' vs '+b+')');

function checkWalk(phys,start,end,expected,label) {
  const [x,z]=point(...start), [bx,bz]=point(...end);
  const player=createPlayer(phys);
  player.teleport(x,expected(0),z,Math.atan2(x-bx,z-bz));
  const length=Math.hypot(bx-x,bz-z);
  let distance=0;
  for(let i=0;i<Math.ceil((length+1)/player.speed*60);i++) {
    distance=Math.hypot(player.x-x,player.z-z);
    near(player.y,expected(Math.min(1,distance/length)),.08,label+' floor at '+distance.toFixed(1));
    assert.ok(Number.isFinite(player.y) && !Number.isFinite(phys.ceilingAbove(player.x,player.z,player.y+.1,player.y+1.75)),label+' headroom');
    if(distance>=length-.07 && Math.hypot(player.x-bx,player.z-bz)<.6) return;
    player.update(1/60,{f:1,s:0});
  }
  assert.fail(label+' stopped after '+distance.toFixed(1)+' of '+length.toFixed(1)+' metres at offset '+Math.hypot(player.x-bx,player.z-bz).toFixed(2));
}

for(const exterior of [true,false]) {
  installRelief(THREE,exterior);
  const phys=createPhysics(), kit=createKit(THREE,new THREE.Scene(),{osm,phys});
  kit.onNight=()=>{};
  for(const place of [east,central]) {
    kit._.setCurrent(place.meta.id,place.meta);
    place.build(kit);
  }
  const datum=relief(...point(190,68));
  for(let t=-93;t<=68;t+=.5) {
    const [x,z]=point(190,t), surface=phys.support(x,z,.25).y+relief(x,z);
    near(surface,datum,.09,'finished ground floor along the gallery');
  }
  // Representative shop fronts and seating areas on both sides of the arcade.
  for(const s of [169,173,184,195,198,201]) for(const t of [-81,-69,-48,-20,-5,10,22]) {
    near(relief(...point(s,t)),datum,.06,'shop finish shares the gallery level');
  }
  const pavilion=osm.buildings.find(b=>b.id===593858530);
  for(const [x,z] of pavilion.poly) near(relief(x,z),datum,.06,'level floor at circular pavilion rim');
  const profile=s=>s<149.4 || s>172.28 ? 0 : s<164.4 ? .015+(s-149.4)*(1.36-.015)/15 : s<169.4 ? 1.36 : (172.28-s)*1.36/2.88;
  for(const [start,end] of [[148.5,173],[173,148.5]]) {
    checkWalk(phys,[start,22],[end,22],t=>profile(start+(end-start)*t),'Honam half-flight');
    checkWalk(phys,[start,24.5],[end,24.5],()=>0,'level bypass');
  }
  checkWalk(phys,[189.5,37],[189.5,-82],()=>0,'continuous Famille walk');
  assert.equal(kit._.detailErrors.length,0);
  if(exterior) {
    // Pre-existing grades at the closest edges of adjacent service lanes.
    for(const [s,t,level] of [[157.14,-28.61,3.321],[164.73,-101.98,3.310],
      [206.65,-100.70,6.301],[213.78,34.78,-1.064],[228.53,34.77,-.523]]) {
      near(relief(...point(s,t)),level,.025,'outside service lane edge');
    }
    const road=osm.roads.find(r=>r.id===1232132183);
    for(let i=1;i<road.pts.length;i++) {
      const [x,z]=road.pts[i-1], [bx,bz]=road.pts[i], length=Math.hypot(bx-x,bz-z);
      for(let d=0;d<length;d++) {
        const px=x+(bx-x)*d/length,pz=z+(bz-z)*d/length;
        if(px >= -170 && px <= -100 && pz >= 190 && pz <= 260)
          near(relief(px,pz),surveyElevation(px,pz),.025,'outside cycleway grade');
      }
    }
  }
}
console.log('Famille level floor, public gallery walk, short Honam stairs and bypass passed in both elevation frames.');
