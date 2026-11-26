import {b1Plan,departmentPoint} from '../../../js/places/shinsegae-b1-plan.js';
export const angle=.3631;
const a=b1Plan(449.37,443.82),b=b1Plan(468.51,515.81);
export const centreUV=[(a[0]+b[0])/2,b[1]-.75];
export const origin=departmentPoint(...centreUV);
export function point(x,depth){
  return [origin[0]+x*Math.cos(angle)-depth*Math.sin(angle),
    origin[1]-x*Math.sin(angle)-depth*Math.cos(angle)];
}

// The department map accepts positions inside the cell. Use its free end apron
// and face the display, keeping the common aisle and the case footprint intact.
const [x,z]=point(-4.15,-.64),[tx,tz]=point(-.6,.04);
export const shopArrival={x,z,yaw:Math.atan2(x-tx,z-tz)};
