import {displayCase} from '../gyeongbu/display-case.js';

export const placePharmacy=displayCase({
  url:new URL('./corner-pharmacy.glb',import.meta.url),
  name:'고속터미널약국 · 곡면 입구와 쇼윈도',bodyName:'Pharmacy',lightName:'Lit',
  // The permanent walls give the shop its distant silhouette. The small coarse probe sits at the threshold.
  width:.08,height:.022,depth:.045,baseColor:0xe6e1d6,enter:11,leave:16,
  visibleBounds:[[-2.35,.025,-4.48],[2.47,3.23,.73]],
});
