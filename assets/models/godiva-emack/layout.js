import {b1Plan,departmentPoint} from '../../../js/places/shinsegae-b1-plan.js';
export const angle=.3631+Math.PI/2;
const a=b1Plan(865.92,488.47),b=b1Plan(919.7,524.93);
export const origin=departmentPoint(Math.max(a[0],b[0])-.75,(a[1]+b[1])/2);
export function point(x,depth){
  return [origin[0]+x*Math.cos(angle)-depth*Math.sin(angle),
    origin[1]-x*Math.sin(angle)-depth*Math.cos(angle)];
}
