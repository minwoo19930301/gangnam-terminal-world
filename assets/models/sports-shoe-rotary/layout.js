import {plan} from '../cinema-rotary/layout.js';

// A short entrance bay within the labelled sales floor, facing the existing
// rotary-side break in the guide. The drawing does not mark a door centre.
export const origin=plan(601,1068);
const inward=plan(601,1069);
export const yaw=Math.atan2(origin[0]-inward[0],origin[1]-inward[1]);
export const steps={left:-1.35,right:2.38,start:.27,tread:.27,rise:.15,count:7,landingEnd:3.83};
export function point(x,depth){
  return [origin[0]+x*Math.cos(yaw)-depth*Math.sin(yaw),
    origin[1]-x*Math.sin(yaw)-depth*Math.cos(yaw)];
}
