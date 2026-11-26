import {checkShowroom} from '../gyeongbu/check-showroom.mjs';

await checkShowroom({
  asset:'gyeongbu-uniqlo',file:'entrance-fashion',root:'경부선 유니클로 · 에어리즘과 입구 코디',
  floor:'1F',height:0,otherFloor:['2F',6],zone:'유니클로 서울고속버스터미널점',
  front:[67.6,14.95,-1,0],inside:[52.85,14.95],hiddenSide:[56.80,4.75,0,1],
  farPose:[82.15,14.95,-25,2],farTriangles:[400,1900],nearTriangles:[20000,105000],
  aisle:[62.66,13.1,51.71,13.1],
  lanes:[[67.20,14.82,52.8,14.82],[62.63,13.10,51.70,13.10],[59.12,18.11,54.09,18.11]],
  contacts:[[56.4,15.90],[60.02,20.66],[60.02,19.31]]
});
