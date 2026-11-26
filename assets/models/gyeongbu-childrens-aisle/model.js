import {placeMarketDisplay} from '../gyeongbu/market-display.js';
import {polishedAisle} from '../gyeongbu-aisle-reflections/material.js';

const loadSurface=polishedAisle('children');

export function placeChildrensAisle(K,x,y,z,angle){
  return placeMarketDisplay(K,{
    name:'경부선 6층 · 아동복 철망 진열과 접은 상품',file:'../gyeongbu-childrens-aisle/childrens-aisle.glb',
    at:[x,y,z],angle,loadSurface,
    focus:[[-1.83,.53,-2.70,-1.43,2.54,2.70],[1.26,.71,-2.78,4.92,2.49,2.80]],
    silhouette:new URL('./proxy.js',import.meta.url)
  });
}
