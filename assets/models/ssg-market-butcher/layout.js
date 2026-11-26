import {b1Plan,departmentPoint} from '../../../js/places/shinsegae-b1-plan.js';
export const angle=.3631+Math.PI/2;
const a=b1Plan(499.5,490.3),b=b1Plan(818.53,774.63);
export const origin=departmentPoint(Math.max(0,b[0])+1.8,Math.max(0,a[1])+9.1);
export function point(x,depth){
  return [origin[0]+x*Math.cos(angle)-depth*Math.sin(angle),
    origin[1]-x*Math.sin(angle)-depth*Math.cos(angle)];
}
