import {displayCase} from '../gyeongbu/display-case.js';

export const placeLuggageCounter=displayCase({
  url:new URL('./luggage-counter.glb',import.meta.url),
  name:'짐캐리 · 수하물보관과 운송 창구',bodyName:'LuggageCounter',lightName:'Lit',
  width:.08,height:.045,depth:.06,baseColor:0xd9d8cc,enter:12,leave:17,
  visibleBounds:[[-2.17,.016,-1.86],[2.13,3.01,1.04]],
});
