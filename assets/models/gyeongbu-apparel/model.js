import {placeFixtureDisplay} from '../gyeongbu-fixtures/model.js';

export function placeUpperShowroom(K,key,source,x,y,z,yaw,visibleFrom){
  const file=source.slice(source.lastIndexOf('/')+1);
  return placeFixtureDisplay(K,key,'경부선 도매 점포 · '+key,[[x,y,z,yaw]],{
    file,visibleFrom,url:new URL('../'+source+'.glb',import.meta.url)
  });
}
