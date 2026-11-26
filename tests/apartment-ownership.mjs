// Check the shipped mesh, not just its catalog. Pass the five original GLBs'
// directory to also compare the world coordinates of every source roof corner.
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {NodeIO} from '@gltf-transform/core';
import {ALL_EXTENSIONS} from '@gltf-transform/extensions';
import {MeshoptDecoder} from 'meshoptimizer';
import {Matrix4,Vector3} from 'three';
import {pointInPoly} from '../js/physics.js';

const root=new URL('../',import.meta.url);
const read=async file=>JSON.parse(await readFile(new URL(file,root)));
const claims=await read('assets/models/banpo-apartments/towers.json');
const catalog=(await read('js/places/_re_models.json')).models;
const buildings=new Map((await read('data/osm.json')).buildings.map(b=>[b.id,b]));
const meta=await read('js/places/_meta.json');
const io=new NodeIO().registerExtensions(ALL_EXTENSIONS).registerDependencies({'meshopt.decoder':MeshoptDecoder});
await MeshoptDecoder.ready;
const corners=[],original=[],towerAreas=new Map();
for(const [id,towers] of Object.entries(claims)){
  const model=catalog.find(m=>m.id===id);
  assert.deepEqual(model.claims,towers);
  for(const tower of towers){
    assert.deepEqual(catalog.filter(m=>m.claims.includes(tower)).map(m=>m.id),[id]);
    assert.ok(!Object.values(meta).some(m=>m.claims.includes(tower)));
  }
  const sources=[[fileURLToPath(new URL(model.file,root)),corners]];
  if(process.argv[2])sources.push([path.join(process.argv[2],id+'.glb'),original]);
  for(const [file,points] of sources){
    const doc=await io.read(file);
    for(const node of doc.getRoot().listNodes()){
      const matrix=new Matrix4().fromArray(node.getWorldMatrix());
      for(const prim of node.getMesh()?.listPrimitives()??[]){
        if(!prim.getMaterial()?.getName().startsWith('Roof and parapet'))continue;
        const pos=prim.getAttribute('POSITION'),indices=prim.getIndices().getArray();
        for(let i=0;i<indices.length;i+=3){
          const tri=Array.from(indices.subarray(i,i+3),k=>{
            const p=new Vector3().fromArray(pos.getElement(k,[])).applyMatrix4(matrix);
            return [model.x+p.x,model.y+p.y,model.z+p.z];
          });
          points.push(...tri);
          if(points!==corners)continue;
          const [a,b,c]=tri;
          const area=Math.abs((b[0]-a[0])*(c[2]-a[2])-(b[2]-a[2])*(c[0]-a[0]))/2;
          if(area<1 || a[1]<15 || Math.max(...tri.map(p=>Math.abs(p[1]-a[1])))>.02)continue;
          const x=(a[0]+b[0]+c[0])/3,z=(a[2]+b[2]+c[2])/3;
          for(const [owner,list] of Object.entries(claims)){
            const tower=list.find(t=>pointInPoly(x,z,buildings.get(t).poly));
            if(tower){
              assert.equal(owner,id,`Roof of ${buildings.get(tower).name} (${tower}) in ${id}`);
              towerAreas.set(tower,(towerAreas.get(tower)??0)+area);
            }
          }
        }
      }
    }
  }
}
for(const tower of Object.values(claims).flat())assert.ok(towerAreas.get(tower)>100,`No mapped roof area at ${tower}`);
for(const id of [413354849,413354836,413354837,562507245,413367427,413367428,413354820,1137867811])
  assert.ok(!catalog.some(m=>m.claims.includes(id)),`Unrelated OSM building hidden: ${id}`);
if(original.length){
  const key=p=>p.map(n=>Math.round(n*100)).join(',');
  const bucket=new Map();
  for(const point of corners){const tag=key(point);if(!bucket.has(tag))bucket.set(tag,[]);bucket.get(tag).push(point);}
  for(const point of original){
    const matches=bucket.get(key(point))??[];
    const index=matches.findIndex(p=>Math.hypot(...point.map((v,i)=>v-p[i]))<.001);
    assert.notEqual(index,-1,`Moved or missing source roof corner: ${point}`);
    matches.splice(index,1);
  }
  assert.equal(corners.length,original.length);
}
console.log(`${towerAreas.size} independently mapped tower roofs; ${corners.length} roof/parapet corners${original.length?' match the original GLBs within 1 mm':''}.`);
