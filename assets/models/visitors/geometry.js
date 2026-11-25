import {loadFixtureScene} from '../onebailey/load.js';

const model=await loadFixtureScene(new URL('./visitors.glb',import.meta.url));
const keys=['legs','shoes','top','skin','hair','bag','sitLegs','sitShoes','sitTop','sitSkin','sitHair'];
export const visitors=Object.fromEntries(keys.flatMap(key=>[key,key+'Far']).map(key=>{
  const meshes=[];
  model.getObjectByName(key)?.traverse(part=>{if(part.isMesh) meshes.push(part);});
  if(meshes.length!==1) throw new Error('Invalid visitor clothing group '+key);
  const mesh=meshes[0], geometry=mesh.geometry.clone().applyMatrix4(mesh.matrixWorld);
  geometry.name=key;
  geometry.computeBoundingSphere();
  return [key,geometry];
}));
