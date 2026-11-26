import {plan} from '../cinema-rotary/layout.js';

// Orient the frontage to the guide edge; its projection is not orthogonal.
const left=plan(968,776),right=plan(1019,776);
export const origin=plan(993.5,776);
export const angle=Math.atan2(left[1]-right[1],right[0]-left[0]);
export const point=(x,depth)=>[origin[0]+x*Math.cos(angle)-depth*Math.sin(angle),
  origin[1]-x*Math.sin(angle)-depth*Math.cos(angle)];
