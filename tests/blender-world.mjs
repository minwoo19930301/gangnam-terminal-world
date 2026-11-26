// Native edit → export → engine. The Blender stage writes only to a temp directory.
import assert from 'node:assert/strict';
import {mkdtemp,readFile,rm} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import path from 'node:path';
import {fileURLToPath,pathToFileURL} from 'node:url';
import {gunzipSync} from 'node:zlib';
import {execFileSync} from 'node:child_process';
import {drawBlenderBuilding} from '../js/blender-buildings.js';
import {keyedRoads,applyRoadEdits} from '../js/blender-roads.js';

const root=fileURLToPath(new URL('../',import.meta.url)), dir=path.join(root,'assets/models/world');
const work=await mkdtemp(path.join(tmpdir(),'banpo-blender-check-'));
try {
  execFileSync(process.env.BLENDER ?? 'blender',['--factory-startup','--background',path.join(dir,'gangnam-terminal.blend'),
    '--python-exit-code','1','--python',path.join(dir,'check.py'),'--',work],{stdio:['ignore','pipe','inherit'],maxBuffer:16e6});
  const report=JSON.parse(await readFile(path.join(work,'summary.json')));
  const catalog=async file=>JSON.parse(gunzipSync(await readFile(path.join(work,file))));
  const [base,changed]=await Promise.all([catalog('original.gz'),catalog('changed.gz')]);
  const keys=Object.keys(base).filter(k=>JSON.stringify(base[k])!==JSON.stringify(changed[k]));
  assert.deepEqual(keys,[report.gameShell]);
  const name=keys[0];
  assert.deepEqual(base[name][1],changed[name][1]);
  assert.deepEqual(base[name][3],changed[name][3]);
  assert.deepEqual(changed[name][2],base[name][2].map((value,i)=>value+(i%3===1 ? 125 : 0)));
  const {roadEdits}=await import(pathToFileURL(path.join(work,'changed-roads.mjs')));
  const {heightEdits}=await import(pathToFileURL(path.join(work,'changed-height.mjs')));
  assert.deepEqual(Object.keys(roadEdits),[report.road]);
  assert.deepEqual(Object.keys(heightEdits.garden),[String(report.gardenSample)]);
  const osm=JSON.parse(await readFile(path.join(root,'data/osm.json')));
  const road=keyedRoads(osm.roads).find(([,k])=>k===report.road)[0];
  const oldWidth=road.width,oldX=road.pts[1][0];
  applyRoadEdits(osm,roadEdits);
  assert.ok(Math.abs(road.width-oldWidth-.5)<.001 && Math.abs(road.pts[1][0]-oldX-.75)<.001);
  let triangles=0;
  const kit={triangle(m,p,n,uv){
    assert.ok(m!==undefined && p.flat().every(Number.isFinite) && uv.flat().every(Number.isFinite));
    assert.ok(Math.abs(Math.hypot(...n)-1)<.0001);triangles++;
  }};
  for(const b of osm.buildings) {
    if(!drawBlenderBuilding(kit,b,0xffffff))drawBlenderBuilding(kit,b,0xffffff,'landmark');
  }
  assert.ok(report.facades>=26 && triangles>70000);
  console.log(JSON.stringify({...report,runtimeTriangles:triangles}));
} finally {await rm(work,{recursive:true,force:true});}
