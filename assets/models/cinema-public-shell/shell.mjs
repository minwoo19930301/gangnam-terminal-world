// Capture the same kit calls as both normal indoor pages, without loading shop GLBs.
import * as THREE from 'three';
import {readFileSync,writeFileSync} from 'node:fs';
import {boutiqueLobby} from '../megabox-central/place.js';
import {transverseFloor,transverseGuide,transverseNorth} from '../megabox-central/layout.js';
import {plan} from '../cinema-rotary/layout.js';
import {relief} from '../../../js/banpo_relief.js';
import {pathToFileURL} from 'node:url';

export const floorName='East cross-aisle floor';

export function captureShell() {
  const planes=[],walls=[],zones=[],supports=[];
  const ignore=()=>{};
  // The structural mesh uses the rendered face elevation; walkable support sits
  // millimetres lower. Furniture, text and the separate shopfront libraries stay separate.
  const K={THREE,texture:ignore,box:ignore,quad:ignore,sign:ignore,spawn:ignore,addMesh:ignore,
    zone:zone=>zones.push(zone),
    hpoly:(mat,poly,y,up)=>planes.push({mat,poly,y,up}),
    wall:(ax,az,bx,bz,bottom,top,options)=>{
      if(options.solid!==false)walls.push({a:[ax,az],b:[bx,bz],bottom,top,width:options.thick??.2,mat:options.mat});
    },
    phys:{addSurface:(poly,y)=>supports.push({poly,y}),addCeiling:ignore,addWall:ignore}
  };
  boutiqueLobby(K,-6);
  const key=poly=>JSON.stringify(poly);
  const byPoly=new Map(zones.map(zone=>[key(zone.poly),zone.name]));
  const floorAt=new Map(supports.map(s=>[key(s.poly),s.y]));
  const surfaces=[];
  for(const {poly,y,mat,up} of planes){
    const id=key(poly),support=floorAt.get(id);
    if(up && support===undefined)continue; // omit inlaid decorative strips
    if(!up && support===undefined && mat!=='ssg_ceil')continue;
    const east=id===key(transverseFloor);
    const name=east&&up?floorName:(byPoly.get(id)??'Arcade soffit')+(up?' · floor':' · ceiling');
    const faces=THREE.ShapeUtils.triangulateShape(poly.map(([x,z])=>new THREE.Vector2(x,z)),[]);
    // Blender Y is -game Z. Earcut makes positive signed area in game X/Z.
    surfaces.push({name,points:poly.map(([x,z])=>[x,-z,y+relief(x,z)]),
      faces:faces.map(f=>up?[...f].reverse():f),y,up,support:up?support:null,mat});
  }
  const partitions=walls.map(({a,b,bottom,top,width,mat})=>{
    const dx=b[0]-a[0],dz=b[1]-a[1],scale=width/(2*Math.hypot(dx,dz));
    const ring=[[a[0]-dz*scale,a[1]+dx*scale],[b[0]-dz*scale,b[1]+dx*scale],
      [b[0]+dz*scale,b[1]-dx*scale],[a[0]+dz*scale,a[1]-dx*scale]];
    return {points:[bottom,top].flatMap(y=>ring.map(([x,z])=>[x,-z,y+relief(x,z)])),mat};
  });
  return {surfaces,walls:partitions};
}

function writeEdge(vertices,output) {
  if(vertices.length!==transverseGuide.length || vertices.flat().some(v=>!Number.isFinite(v)))throw Error('Expected the original floor contour.');
  const row=(p,px)=>{
    const [x,z]=plan(px,transverseNorth),[u,v]=plan(px,transverseNorth+1);
    return transverseNorth+((p[0]-x)*(u-x)+(p[1]-z)*(v-z))/((u-x)**2+(v-z)**2);
  };
  const north=transverseGuide.filter(p=>p[1]===transverseNorth);
  const next=Math.round(north.reduce((sum,[x],i)=>sum+row(vertices[i],x),0)/north.length);
  // The operator tracing uses integer pixels. Allow half a pixel of snapping,
  // while preserving the side walls, fixed south shopfronts and north rear wall.
  if(next<770||next>783)throw Error('Keep the fixed shop backs and the joining aisle clear (north guide rows 770–783).');
  for(const [i,[px,py]] of transverseGuide.entries()){
    const moving=py===transverseNorth;
    if(Math.hypot(...plan(px,moving?next:py).map((v,k)=>v-vertices[i][k]))>(moving?.078:.001))
      throw Error('Move the north-edge vertices together; keep the east/west limits and south edge fixed.');
  }
  const file=new URL('../megabox-central/layout.js',import.meta.url),source=readFileSync(file,'utf8');
  const field='export const transverseNorth = '+transverseNorth+';';
  if(source.split(field).length!==2)throw Error('Cannot identify a unique north-edge control.');
  writeFileSync(output??file,source.replace(field,'export const transverseNorth = '+next+';'));
}

if(process.argv[1]&&import.meta.url===pathToFileURL(process.argv[1]).href){
  if(process.argv[2]==='read')console.log(JSON.stringify(captureShell()));
  else if(process.argv[2]==='write')writeEdge(JSON.parse(readFileSync(0,'utf8')),process.argv[3]);
  else throw Error('Expected read or write.');
}
