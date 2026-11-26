import assert from 'node:assert/strict';
import * as T from 'three';
import {createKit} from '../js/kit.js';
import {createPhysics} from '../js/physics.js';
import {installRelief} from '../js/banpo_relief.js';

installRelief(T,false);
const scene=new T.Scene(),kit=createKit(T,scene,{osm:{},phys:createPhysics(),interiorView:true});
kit.occludingSlab({poly:[[-7,-7],[7,-7],[7,7],[-7,7]],holes:[],y:4,eyeMin:4.1,eyeMax:8});
const camera=new T.PerspectiveCamera(60,1,.1,80),matrix=new T.Matrix4(),geom=new T.BoxGeometry(.2,.6,.2);
for(const count of [7,71]){
  const group=new T.InstancedMesh(geom,new T.MeshLambertMaterial(),count);group.name='fixed stock '+count;
  for(let i=0;i<count;i++)group.setMatrixAt(i,matrix.makeTranslation((i%7)*.18,.4,Math.floor(i/7)*.16));
  kit.addMesh(group,{stationaryInstances:true});
}
const other=new T.InstancedMesh(geom,new T.MeshBasicMaterial(),3);
other.name='display controlled by the caller';
for(let i=0;i<3;i++)other.setMatrixAt(i,matrix.makeTranslation(i*.2,.2,1));
kit.addMesh(other);
kit._.finalize();
function check(y,visible){
  camera.position.set(.2,y,2);camera.lookAt(.2,.8,0);kit._.cull(.2,y,2,true,camera);
  const stock=scene.children.filter(o=>o.name.startsWith('fixed stock'));
  assert.equal(stock.length,2);
  for(const mesh of stock)assert.equal(mesh.visible,visible,mesh.name+' at eye height '+y);
  assert.equal(other.visible,true,'ordinary custom mesh remains under caller control');
}
check(1.6,true);check(5.6,false);check(1.6,true);check(5.6,false);
kit._.cull(.2,5.6,2,true,null);
assert.ok(scene.children.filter(o=>o.name.startsWith('fixed stock')).every(o=>o.visible),'camera-free capture restores original geometry');
console.log('Small and spatially split stationary stock disappears behind a slab and returns intact.');
