// Capture just the five hand-authored groups from the live place and kit.
// Never include the separately linked three globe lamps, surrounding arcade or photo references.
import fs from 'node:fs';
import * as THREE from 'three';
import {createKit} from '../../../js/kit.js';
import {createPhysics} from '../../../js/physics.js';
import {installRelief,relief} from '../../../js/banpo_relief.js';
import {build,meta} from '../../../js/places/centralcity.js';

const ctx=new Proxy({measureText:t=>({width:String(t).length*10}),
  createLinearGradient:()=>({addColorStop(){}}),createRadialGradient:()=>({addColorStop(){}}),
  createPattern:()=>({}),getImageData:(_x,_y,w,h)=>({data:new Uint8ClampedArray(4*w*h)})},
  {get:(o,k)=>o[k]??(()=>{})});
globalThis.__makeCanvas=(width,height)=>({width,height,style:{},getContext:()=>ctx});
const osm=JSON.parse(fs.readFileSync(new URL('../../../data/osm.json',import.meta.url)));
installRelief(THREE,true);
const K=createKit(THREE,new THREE.Scene(),{osm,phys:createPhysics(),keep:()=>false});
K._.setCurrent(meta.id,meta);
K.onNight=()=>{};
let frame;
K.recordHonamFrame=([x,z],angle)=>{
  frame=new THREE.Matrix4().makeRotationY(angle).setPosition(x,relief(x,z),z);
};

const parts=[];
K.captureHonamPart=(name,draw)=>{
  const scene=new THREE.Scene(),part=createKit(THREE,scene,{osm,phys:createPhysics()});
  part._.setCurrent(meta.id,meta);
  const methods=['slab','ramp','stairs','quad','box','cyl'];
  const original=methods.map(key=>K[key]);
  try{
    for(const key of methods)K[key]=part[key];
    draw();
  }finally{
    methods.forEach((key,i)=>{K[key]=original[i];});
  }
  const inverse=frame.clone().invert(),positions=[],faces=[],colors=[],uvs=[];
  for(const mesh of part._.finalize()){
    const g=mesh.geometry,p=g.attributes.position,c=g.attributes.color,uv=g.attributes.uv;
    const offset=positions.length;
    for(let i=0;i<p.count;i++){
      const v=new THREE.Vector3().fromBufferAttribute(p,i).applyMatrix4(inverse);
      positions.push([v.x,-v.z,v.y]);uvs.push([uv.getX(i),uv.getY(i)]);
    }
    for(let i=0;i<g.index.count;i+=3){
      const a=g.index.getX(i),b=g.index.getX(i+1),d=g.index.getX(i+2);
      faces.push([offset+a,offset+b,offset+d]);
      colors.push([c.getX(a),c.getY(a),c.getZ(a)]);
    }
  }
  if(!faces.length)throw Error('No game geometry '+name);
  parts.push({name,positions,uvs,faces,colors});
};
build(K);
await K._.buildAllDetail();
if(K._.detailErrors.length)throw Error(K._.detailErrors.join('\n'));
if(parts.length!==5||new Set(parts.map(p=>p.name)).size!==5)throw Error('Expected five stair assemblies');
const target=process.argv[2];
if(!target)throw Error('Usage: node capture.mjs <output.json>');
fs.writeFileSync(target,JSON.stringify({parts,frame:frame.toArray()}));
