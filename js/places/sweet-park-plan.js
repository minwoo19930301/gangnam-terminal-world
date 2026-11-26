import {b1Plan,departmentPoint} from './shinsegae-b1-plan.js';

export const terminalOrigin=[-135.7,9.9];
export const terminalRotation=Math.atan2(.3639,.9315);
const sin=Math.sin(terminalRotation),cos=Math.cos(terminalRotation);
export function terminalPoint(s,t){
  return [terminalOrigin[0]+sin*s+cos*t,terminalOrigin[1]+cos*s-sin*t];
}
export const sweetParkLocal=(px,py)=>[74.05068+.13*(px-1032),75.24268-.13*(py-477)];
export const sweetParkPoint=(px,py)=>terminalPoint(...sweetParkLocal(px,py));

// On the B1 visitor plan the black wall at x=1032 stops at y=457 and resumes at y=480.
export const gate9Plan = [1032, (457+480)/2];
export const gate9MarketApproach = [-43.82,37.99];

// Both operators display the same B1 customer guide. The nine-gate and
// market fits have different scales. The café thresholds east of Intelligentsia
// span the difference, ending on exactly the same edge as Sweet Park.
export function cafeAislePoint(px,py){
  const west=departmentPoint(...b1Plan(px,py));
  if(px<=903)return west;
  const edge=departmentPoint(...b1Plan(1032,py)),east=sweetParkPoint(1032,py);
  const fraction=Math.min(1,(px-903)/(1032-903));
  return [west[0]+fraction*(east[0]-edge[0]),west[1]+fraction*(east[1]-edge[1])];
}
