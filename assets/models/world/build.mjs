import {crossingWay,markingFaces} from '../banpo-stop-crossing/layout.js';
import {bridgeLayout,surfaceColors} from '../banpo-stream-bridge/layout.js';
import {streamDeckIds,streamWaterBase} from '../../../js/banpo_stream_profile.js';
// Seed an editable city scene from the project's map and its own facade textures.
// Run from any directory: node assets/models/world/build.mjs /path/to/blender
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { ShapeUtils, Vector2 } from 'three';
import { chromium } from 'playwright';
import { applyRoadEdits, keyedRoads } from '../../../js/blender-roads.js';
import { parcelCover } from '../../../js/parcel_cover.js';
import { dayCurve } from './lighting.mjs';
import { writeStreetLayout } from './street-layout.mjs';
import { serve } from '../../../tests/serve.mjs';
import { relief, editableGroundGrids, terrainPieces } from '../../../js/banpo_relief.js';
import { waterHeight, jamwonRiverExtension } from '../../../js/banpo_dem.js';
import { withJamwonInlet } from '../../../js/river-water.js';
const here=path.dirname(fileURLToPath(import.meta.url)), root=path.resolve(here,'../../..');
const osm=JSON.parse(await fs.readFile(path.join(root,'data/osm.json'))), meta=JSON.parse(await fs.readFile(path.join(root,'js/places/_meta.json')));
const temp=await fs.mkdtemp(path.join(os.tmpdir(),'banpo-world-'));
function triangles(poly,holes=[]) {
  const v=p=>p.map(([x,z])=>new Vector2(x,z));
  return ShapeUtils.triangulateShape(v(poly),holes.map(v));
}
const idCounts=new Map();
for(const b of osm.buildings)idCounts.set(b.id,(idCounts.get(b.id)||0)+1);
const buildings=osm.buildings.filter(b=>b.layer>=0 && b.type!=='no').map(b=>{
  const xs=b.poly.map(p=>p[0]), zs=b.poly.map(p=>p[1]);
  const x=(Math.min(...xs)+Math.max(...xs))/2, z=(Math.min(...zs)+Math.max(...zs))/2;
  const owner=Object.keys(meta).find(k=>meta[k].claims.includes(b.id))||'city';
  const key=idCounts.get(b.id)===1 ? String(b.id) : [b.id,...b.poly[0].map(v=>Math.round(v*100))].join(':');
  return {...b,key,origin:[x,z,relief(x,z)],owner,roof:triangles(b.poly,b.holes)};
});
const roadBase=new Map(keyedRoads(osm.roads).map(([r,key])=>[r,{key,base:[r.pts,r.width]}]));
applyRoadEdits(osm);
const surfaceRoads=osm.roads.filter(r=>!r.tunnel && r.layer>=0 && ['primary','primary_link','secondary','secondary_link','tertiary','tertiary_link','trunk','trunk_link','residential','living_street','busway','cycleway','pedestrian','motorway','motorway_link','unclassified','service','footway','path','steps','track'].includes(r.hw) && (!['footway','path','steps','track'].includes(r.hw)||(!r.covered && r.level==null)));
const streamBridge=bridgeLayout(osm.roads);streamBridge.colors=surfaceColors;
const bridgeTop=streamBridge.faces.filter(f=>f.mat==='asphalt').flatMap(f=>f.points);
const bridgeY=bridgeTop.reduce((sum,p)=>sum+p[1],0)/bridgeTop.length;
const roads=surfaceRoads.map(r=>({...r,...roadBase.get(r),pts:r.pts.map(([x,z])=>[x,z,streamDeckIds.has(r.id)?bridgeY+.08:relief(x,z)+(r.layer>0 ? 7.5*r.layer : r.bridge ? 1.5 : 0)+.14])}));
const land=osm.areas.filter(a=>a.layer>=0 && /^(natural:water|leisure:park|landuse:grass|natural:wood|natural:grassland|leisure:garden|landuse:forest|leisure:pitch)$/.test(a.kind)).map(a=>{
  const poly=a.id===152336?withJamwonInlet(a.poly):a.poly, holes=a.holes||[];
  const ring=[...poly,...holes.flat()];
  if(a.id===248405787){
    // The game's river surface follows the same local terrain triangles as its banks.
    const xyz=[],faces=[];
    for(const face of triangles(poly,holes)){
      const tri=face.map(i=>[ring[i][0],0,ring[i][1]]);
      for(const piece of terrainPieces(tri,[[0,0],[0,0],[0,0]])??[tri]){
        const first=xyz.length;
        for(const [x,,z] of piece)xyz.push([x,z,streamWaterBase(x,z,relief(x,z))-.5]);
        for(let j=1;j<piece.length-1;j++)faces.push([first,first+j,first+j+1]);
      }
    }
    return {id:a.id,kind:a.kind,name:a.name,xyz,faces,outline:poly,holes};
  }
  return {id:a.id,kind:a.kind,name:a.name,xyz:ring.map(([x,z])=>[x,z,a.kind==='natural:water'?(a.id===152336?waterHeight:relief(x,z)-.35):relief(x,z)+.065]),faces:triangles(poly,holes),outline:poly,holes};
});
// Satellite vegetation polygons are already clipped to public parcel boundaries.
for(const parcel of Object.values(parcelCover)) {
  for(const [outline,...holes] of parcel.green) land.push({kind:'parcel:green',outline,holes});
}
land.push({kind:'natural:water',name:'한강 상류',xyz:jamwonRiverExtension.map(([x,z])=>[x,z,waterHeight]),faces:triangles(jamwonRiverExtension),outline:jamwonRiverExtension,holes:[]});
const stopCrossing=surfaceRoads.find(r=>r.id===crossingWay);
const banpoCrossing=stopCrossing&&{way:crossingWay,faces:markingFaces(stopCrossing.pts[0],stopCrossing.pts.at(-1))};
const groundGrids=editableGroundGrids(), ground=groundGrids.city;
const server=await serve(0); let browser;
try {
  browser=await chromium.launch();
  const page=await browser.newPage();
  await page.goto('http://127.0.0.1:'+server.address().port+'/data/osm.json');
  const images=await page.evaluate(async()=>{
    const {createTextures}=await import('/js/textures.js'), three=await import('/node_modules/three/build/three.module.js');
    const textures=createTextures(three);
    return Object.fromEntries(['apt','office','hotel','school','oldshop','shop','roofgravel'].map(name=>{
      const {tex,scale}=textures.surface(name), source=tex.image;
      const entry={png:source.toDataURL().split(',')[1],scale};
      if(name!=='roofgravel'){
        const mask=document.createElement('canvas');mask.width=source.width;mask.height=source.height;
        const ctx=mask.getContext('2d');ctx.drawImage(source,0,0);
        const img=ctx.getImageData(0,0,mask.width,mask.height);
        for(let i=0;i<img.data.length;i+=4){
          const r=img.data[i],g=img.data[i+1],b=img.data[i+2];
          const glass=b>r+10 && b>g+3 && (name!=='office'||r>112);
          img.data[i]=img.data[i+1]=img.data[i+2]=glass?255:0;
        }
        ctx.putImageData(img,0,0);entry.lit=mask.toDataURL().split(',')[1];
      }
      return [name,entry];
    }));
  });
  const scales={};
  for(const [k,v] of Object.entries(images)){await fs.writeFile(path.join(temp,k+'.png'),Buffer.from(v.png,'base64'));if(v.lit)await fs.writeFile(path.join(temp,k+'-windows.png'),Buffer.from(v.lit,'base64'));scales[k]=v.scale;}
  await fs.writeFile(path.join(temp,'seed.json'),JSON.stringify({buildings,roads,banpoCrossing,land,ground,groundGrids,streamBridge,scales,lighting:dayCurve(Date.now(),osm.origin),sites:Object.fromEntries(Object.entries(meta).map(([k,v])=>[k,v.name]))}));
  await writeStreetLayout(temp);
  execFileSync('uv',['run','--with','shapely>=2.1,<3','python',path.join(here,'terrain.py'),temp],{stdio:'inherit'});
  const blender=process.argv[2]||'blender';
  execFileSync(blender,['--background','--factory-startup','--python-exit-code','1','--python',path.join(here,'build.py'),'--',temp],{stdio:'inherit'});
  execFileSync(blender,['--background','--factory-startup',path.join(here,'gangnam-terminal.blend'),'--python-exit-code','1','--python',path.join(here,'export.py')],{stdio:'inherit'});
} finally {if(browser)await browser.close();await new Promise(r=>server.close(r));await fs.rm(temp,{recursive:true,force:true});}
