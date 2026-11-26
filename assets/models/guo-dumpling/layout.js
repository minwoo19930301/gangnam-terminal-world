import {b1Plan,departmentPoint} from '../../../js/places/shinsegae-b1-plan.js';
export const angle=.3631;
const a=b1Plan(450.28,382.76),b=b1Plan(469.42,432.88);
export const centreUV=[(a[0]+b[0])/2,b[1]-.75];
export const origin=departmentPoint(...centreUV);
export function point(x,depth){
  return [origin[0]+x*Math.cos(angle)-depth*Math.sin(angle),
    origin[1]-x*Math.sin(angle)-depth*Math.cos(angle)];
}
