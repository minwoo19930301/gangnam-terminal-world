import {pointInPoly,polyBBox} from '../../../js/physics.js';
import {b1Plan, departmentPoint} from '../../../js/places/shinsegae-b1-plan.js';
const plan=(px,py)=>departmentPoint(...b1Plan(px,py));
export const origin=plan(730,939);
const start=plan(697,969),end=plan(760,911);
const length=Math.hypot(end[0]-start[0],end[1]-start[1]);
export const normal=[(end[1]-start[1])/length,(start[0]-end[0])/length];
export const angle=Math.atan2(normal[0],normal[1]);
export const point=(x,z)=>[origin[0]+normal[1]*x+normal[0]*z,origin[1]-normal[0]*x+normal[1]*z];

export const publicAisle=[[678,950],[821,815],[821,725],[840,725],[840,814],[842,837],[696,971]].map(([px,py])=>plan(px,py));

const [x0,z0,x1,z1]=polyBBox(publicAisle);

// Keep the fitted shop visible when approaching from the adjacent Central City
// page, whose normal neighbour rendering is otherwise restricted to junctions.
export function cinemaPreview(x,y,z){
  if(y < -6.25 || y > -1.45)return false;
  const dx=x-origin[0],dz=z-origin[1];
  const along=dx*normal[1]-dz*normal[0],out=dx*normal[0]+dz*normal[1];
  if(Math.abs(along)<6.5 && out>=-5.4 && out<=6.7)return true;
  return x>=x0 && x<=x1 && z>=z0 && z<=z1 && pointInPoly(x,z,publicAisle);
}
