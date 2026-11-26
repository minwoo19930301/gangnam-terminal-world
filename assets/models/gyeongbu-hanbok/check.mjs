// Walk from the public fourth-floor aisle across the showroom threshold and back.
import {checkShowroom} from '../gyeongbu/check-showroom.mjs';

await checkShowroom({
  asset:'gyeongbu-hanbok',file:'hanbok-showroom',root:'경부선 4층 · 고명재한복 치마와 저고리',
  floor:'4F',height:16,otherFloor:['3F',11],zone:'고명재한복',front:[38.64,118.05,-1,0],inside:[34.68,118.05],
  hiddenSide:[32.0,118.52,1,0],farPose:[38,89,-3.8,29.5],farTriangles:[200,1700],nearTriangles:[10000,32000],aisle:[38.1,113,38.1,124],
  lanes:[118.10,118.30,118.53].map(v=>[34.69,v,38.70,v]),
  contacts:[[35.46,120.36],[35.44,119.41],[35.39,116.89],[34.14,118.32]]
});
