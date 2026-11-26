import {b1Plan,departmentPoint} from '../../../js/places/shinsegae-b1-plan.js';
export const angle=.3631-Math.PI/2;
const a=b1Plan(531.4,400.99),b=b1Plan(551.46,451.11);
export const origin=departmentPoint(b[0]+.75,(a[1]+b[1])/2);
export function point(x,depth){
  return [origin[0]+x*Math.cos(angle)-depth*Math.sin(angle),
    origin[1]-x*Math.sin(angle)-depth*Math.cos(angle)];
}
