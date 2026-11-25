// Sample the game's Seoul sun and sky so the Blender scene uses the same clock.
import * as THREE from 'three';
import {readFile} from 'node:fs/promises';
import {pathToFileURL} from 'node:url';
import {createDaylight,horizonTime,seoulClock} from '../../../js/daylight.js';

export function dayCurve(ms,site) {
  const day=new Date(ms+9*3600000).toISOString().slice(0,10);
  const start=Date.parse(day+'T00:00:00+09:00');
  const scene=new THREE.Scene(), clock=createDaylight(THREE,scene,site,{value:0},'live',()=>{});
  const sun=scene.children.find(o=>o.isDirectionalLight);
  const hemi=scene.children.find(o=>o.isHemisphereLight);
  const keys=[];
  for(let minute=0;minute<=1440;minute+=5) {
    clock.sync(start+minute*60000,true);
    keys.push([minute,sun.position.clone().normalize().toArray(),sun.color.toArray(),sun.intensity,
      scene.fog.color.toArray(),hemi.intensity]);
  }
  const events={};
  for(const [mode,time] of [['아침',horizonTime(ms,site,true)+14*60000],['낮',start+750*60000],
    ['노을',horizonTime(ms,site,false)-14*60000],['밤',start+1320*60000]]) {
    events[mode+' · '+seoulClock(time)]=Math.round((time-start)/60000);
  }
  return {day,events,keys};
}

if (process.argv[1] && import.meta.url===pathToFileURL(process.argv[1]).href) {
  const osm=JSON.parse(await readFile(new URL('../../../data/osm.json',import.meta.url)));
  console.log(JSON.stringify(dayCurve(Date.now(),osm.origin)));
}
