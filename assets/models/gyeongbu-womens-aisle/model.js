import {placeMarketDisplay} from '../gyeongbu/market-display.js';

export function placeWomensAisle(K,x,y,z,angle){
  return placeMarketDisplay(K,{
    name:'경부선 8층 · 식물무늬 니트와 집게 바지 및 외투 마네킹',
    file:'../gyeongbu-womens-aisle/womens-aisle.glb',at:[x,y,z],angle,
    focus:[[-2.90,.31,-2.75,-.84,2.59,2.85],[1.01,.40,-2.83,3.00,2.77,2.89]],
    silhouette:new URL('./proxy.js',import.meta.url)
  });
}
