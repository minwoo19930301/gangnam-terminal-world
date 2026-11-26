import assert from 'node:assert/strict';
import fs from 'node:fs';
import * as T from 'three';
import {createKit} from '../js/kit.js';
import {createPhysics,createPlayer} from '../js/physics.js';
import {relief,installRelief,editableGroundGrids} from '../js/banpo_relief.js';
import {createTraffic} from '../js/city-scene.js';
import {vehicleContacts} from '../js/fleet.js';
import {wheelContacts} from '../js/vehicle_ground.js';
import {drawStreamBridge} from '../assets/models/banpo-stream-bridge/model.js';
import {bridgeLayout} from '../assets/models/banpo-stream-bridge/layout.js';

const ctx=new Proxy({}, {get:()=>()=>{}});
globalThis.__makeCanvas=(width,height)=>({width,height,getContext:()=>ctx});
installRelief(T,true);
const {city,creek}=editableGroundGrids();
const packed=T.ShaderLib.lambert.uniforms.cityCells.value.image.data;
const first=(city.width-1)*(city.height-1);
for(let z=0;z<creek.height-1;z++)for(let x=0;x<creek.width-1;x++){
  const index=z*creek.width+x,cell=4*(first+z*(creek.width-1)+x);
  for(const [channel,offset] of [0,1,creek.width,creek.width+1].entries()){
    assert.equal(packed[cell+channel],creek.rows[index+offset],'GPU and physical bank terrain differ');
  }
}
const osm=JSON.parse(fs.readFileSync(new URL('../data/osm.json',import.meta.url)));
const scene=new T.Scene(),phys=createPhysics(),K=createKit(T,scene,{osm,phys});
K._.setCurrent('city');
assert.equal(drawStreamBridge(K,osm.roads),true);
assert.equal(drawStreamBridge(K,osm.roads.filter(r=>r.id===604527964)),false);
const geometry=bridgeLayout(osm.roads);
const road=id=>osm.roads.find(r=>r.id===id).pts;
function walk(path,tag){
  const p=createPlayer(phys),[x,z]=path[0];p.teleport(x,0,z,0);
  let observed=false,travel=0;
  for(const [tx,tz] of path.slice(1)){
    const length=Math.hypot(tx-p.x,tz-p.z);
    p.yaw=Math.atan2(p.x-tx,p.z-tz);
    for(let i=0;i<Math.round(length/p.speed*60);i++){
      const previous=relief(p.x,p.z)+p.y;
      p.update(1/60,{f:1,s:0});
      assert.ok(Math.abs(relief(p.x,p.z)+p.y-previous)<.3,'unexpected layer change');
      observed ||= p.surface?.tag===tag;
      assert.equal(phys.ceilingAbove(p.x,p.z,p.y+.12,p.y+p.height),Infinity,'walking body intersects deck');
    }
    assert.ok(Math.hypot(p.x-tx,p.z-tz)<.14,'stopped or deflected');
    travel+=length;
  }
  if(tag)assert.ok(observed,'expected upper deck surface');
  return travel;
}
const green=road(604527966),start=green[3],dest=green[4],dir=Math.atan2(dest[1]-start[1],dest[0]-start[0]);
const section=[start,[start[0]+42*Math.cos(dir),start[1]+42*Math.sin(dir)]];
const totalLower=walk(section)+walk([...section].reverse());
let totalUpper=0;
for(const [id,tag] of [[604527964,'stream-road'],[1232132187,'sidewalk'],[1232132154,'sidewalk']]){
  const pts=road(id);
  totalUpper+=walk(pts,tag)+walk([...pts].reverse(),tag);
}
const [a,b]=road(604527964),len=Math.hypot(b[0]-a[0],b[1]-a[1]),sin=(b[0]-a[0])/len,cos=(b[1]-a[1])/len;
const [track,axle]=vehicleContacts('car'),wheels=[];
for(let dist=axle+.1;dist<len-axle;dist+=.5){
  const x=a[0]+dist*sin,z=a[1]+dist*cos;
  const expected=(x,z)=>{
    const ground=relief(x,z);
    return ground+phys.support(x,z,8-ground,s=>s.tag==='stream-road').y;
  };
  wheelContacts(phys,x,z,sin,cos,track,axle,expected,wheels,s=>s.tag==='stream-road');
  assert.ok(wheels.every(y=>Math.abs(y-4.16)<.2),'tyre misses road deck');
}
for(const [a,b] of geometry.guards){
  const x=(a[0]+b[0])/2,z=(a[2]+b[2])/2,y=(a[1]+b[1])/2-relief(x,z);
  const pos={x,z};
  phys.resolve(pos,.32,y,y+1.75,.5);
  assert.ok(Math.hypot(pos.x-x,pos.z-z)>.3,'outer guard no longer stops a pedestrian');
}
const traffic=createTraffic(K,{roads:osm.roads.filter(r=>[230071181,604527964,1569146467,604527965].includes(r.id))},1);
const paint=scene.getObjectByName('car paint');
assert.ok(paint && paint.count===1);
const position=new T.Vector3(),matrix=new T.Matrix4();let supported=0,departed=false;
for(let i=0;i<100;i++){
  traffic.update(.1);
  paint.getMatrixAt(0,matrix);position.setFromMatrixPosition(matrix);
  const y=relief(position.x,position.z),hit=phys.support(position.x,position.z,8-y,s=>s.tag==='stream-road');
  if(hit.s?.tag==='stream-road'){
    assert.ok(Math.abs(position.y-hit.y-y)<.18,'moving car leaves bridge surface');supported++;
  }else if(supported)departed=true;
}
assert.ok(supported>35 && departed,'moving car must cross the deck and rejoin its normal approach');
console.log('Game hills, upper road and both sidewalks, outer guards and wheel contacts passed.',Math.round(totalLower),'lower and',Math.round(totalUpper),'upper simulated metres.');
