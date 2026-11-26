import {b1Plan,departmentPoint} from '../../../js/places/shinsegae-b1-plan.js';
export const angle=.3631-Math.PI/2;
const a=b1Plan(499.5,490.3);
export const centreUV=[a[0]-.54,a[1]+18];
export const origin=departmentPoint(...centreUV);
export function point(x,depth){
  return [origin[0]+x*Math.cos(angle)-depth*Math.sin(angle),
    origin[1]-x*Math.sin(angle)-depth*Math.cos(angle)];
}
