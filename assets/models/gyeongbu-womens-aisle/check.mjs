import {checkClothingAisle} from '../gyeongbu/check-clothing-aisle.mjs';

await checkClothingAisle({
  asset:'womens',root:'경부선 8층 · 식물무늬 니트와 집게 바지 및 외투 마네킹',
  floor:'8F',height:34,otherFloor:'7F',otherHeight:29.5,
  clearLanes:[37.48,37.82,38.28,38.73],
  contacts:[[38.90,109.53],[37.27,107.26],[37.19,108.40],[35.82,110.68]]
},process.argv[2]);
