import {displayCase} from '../gyeongbu/display-case.js';

export const placeWarmer=displayCase({
  url:new URL('./pretzel-warmer.glb',import.meta.url),
  name:'앤티앤스 · 프레즐 진열대',bodyName:'Warmer',
  width:6.05,height:.90,depth:.76,baseColor:0x005689,
});
