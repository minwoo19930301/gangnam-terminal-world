import {plan} from '../cinema-rotary/layout.js';
export const outline=[[904,798],[967,798],[967,839],[904,839]];
const left=plan(...outline[0]),right=plan(...outline[1]);
export const origin=plan(935.5,798);
export const angle=Math.atan2(right[1]-left[1],left[0]-right[0]);
export function point(x,depth){
  return [origin[0]+x*Math.cos(angle)-depth*Math.sin(angle),
    origin[1]-x*Math.sin(angle)-depth*Math.cos(angle)];
}
