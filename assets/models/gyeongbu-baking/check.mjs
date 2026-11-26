// The annex is 4.2 metres above the street; the main building's second floor is higher.
import {checkShowroom} from '../gyeongbu/check-showroom.mjs';

await checkShowroom({
  asset:'gyeongbu-baking',file:'baking-shop',root:'경부선 부속상가 · 비앤씨마켓 반죽기와 제과 도구',
  floor:'2F',height:4.2,otherFloor:['1F',0],zone:'브레드가든',front:[311.12,16.18,0,-1],inside:[311.12,3.58],
  hiddenSide:[307.18,8.55,4,-.55],farPose:[286.1,16.18,25.05,-8.18],farTriangles:[250,1900],nearTriangles:[18000,46000],aisle:[303.40,16.16,313.30,16.16],
  lanes:[310.88,311.00,311.13].map(u=>[u,16.18,u,3.58]),
  contacts:[[310.01,9.36],[312.97,8.18],[311.20,2.70],[309.21,5.00]]
});
