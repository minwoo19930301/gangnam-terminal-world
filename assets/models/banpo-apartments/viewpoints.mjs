// Use the game's public map bookmarks and Seoul terrain for the Blender camera rig.
import {readFile} from 'node:fs/promises';
import {LANDMARKS} from '../../../js/landmarks.js';
import {relief} from '../../../js/banpo_relief.js';
import {createPlayer} from '../../../js/physics.js';
import {step} from '../../../js/banpo_dem.js';
import {dayCurve} from '../world/lighting.mjs';

const names=['신반포4차','반포르엘','반포센트럴자이'];
const {eye}=createPlayer({});
const views=names.map(name=>{
  const {x,z,yaw,pitch}=LANDMARKS.find(landmark=>landmark.name===name).exteriorView;
  // The sidewalk at each of the game's three verified arrival points is 15 cm high.
  return {name,x,north:-z,height:relief(x,z)+.15+eye,yaw,pitch};
});
const {origin}=JSON.parse(await readFile(new URL('../../../data/osm.json',import.meta.url)));
const {models}=JSON.parse(await readFile(new URL('../../../js/places/_re_models.json',import.meta.url)));
const sites=models.filter(m=>['apt-a13790828','apt-a10023673','apt-a10024913'].includes(m.id));
const bounds=sites.flatMap(site=>site.rect).concat(views.map(v=>[v.x,-v.north]));
const xs=bounds.map(p=>p[0]),zs=bounds.map(p=>p[1]);
const startX=(Math.floor(Math.min(...xs)/step)-4)*step, endX=(Math.ceil(Math.max(...xs)/step)+4)*step;
const startZ=(Math.floor(Math.min(...zs)/step)-4)*step, endZ=(Math.ceil(Math.max(...zs)/step)+4)*step;
const points=[];
for(let z=startZ;z<=endZ;z+=step){
  for(let x=startX;x<=endX;x+=step)points.push([x,-z,relief(x,z)]);
}
console.log(JSON.stringify({views,ground:{points,columns:(endX-startX)/step+1},sky:dayCurve(Date.now(),origin)}));
