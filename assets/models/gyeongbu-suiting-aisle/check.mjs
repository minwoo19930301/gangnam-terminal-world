import {checkClothingAisle} from '../gyeongbu/check-clothing-aisle.mjs';

await checkClothingAisle({
  asset:'suiting',root:'경부선 7층 · 이단 신사복 행거와 소매 상품표',
  floor:'7F',height:29.5,otherFloor:'8F',otherHeight:34,
  clearLanes:[37.2,37.65,38.20,38.70],
  contacts:[[36.85,109.5],[39.15,109.5],[36.98,106.68],[39.05,106.78]]
},process.argv[2]);
