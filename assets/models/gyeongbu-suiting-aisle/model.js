import {placeMarketDisplay} from '../gyeongbu/market-display.js';

export function placeSuitingAisle(K,x,y,z,angle){
  return placeMarketDisplay(K,{
    name:'경부선 7층 · 이단 신사복 행거와 소매 상품표',file:'../gyeongbu-suiting-aisle/suiting-aisle.glb',
    at:[x,y,z],angle,
    focus:[[-2.22,.27,-3.12,-1.09,2.74,2.88],[1.10,.24,-3.10,2.24,2.75,2.92]],
    silhouette:new URL('./proxy.js',import.meta.url)
  });
}
