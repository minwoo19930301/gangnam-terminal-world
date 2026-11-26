import {rotaryPreview} from '../cinema-rotary/layout.js';
import {pointInPoly,polyBBox} from '../../../js/physics.js';
import {cafeAislePoint as plan} from '../../../js/places/sweet-park-plan.js';
export const origin=plan(730,939);
const start=plan(697,969),end=plan(760,911);
const length=Math.hypot(end[0]-start[0],end[1]-start[1]);
export const normal=[(end[1]-start[1])/length,(start[0]-end[0])/length];
export const angle=Math.atan2(normal[0],normal[1]);
export const point=(x,z)=>[origin[0]+normal[1]*x+normal[0]*z,origin[1]-normal[0]*x+normal[1]*z];

// Editable north edge of the east cross-aisle on the B1 customer guide.
export const transverseNorth = 777;
export const transverseGuide=[[840,transverseNorth],[1032,transverseNorth],[1032,798],[840,798]];
export const transverseFloor=transverseGuide.map(([px,py])=>plan(px,py));
export const transverseEastEdge=[transverseFloor[1],transverseFloor[2]];
export const publicAisle=[[678,950],[821,815],[821,725],[840,725],[840,814],[842,837],[696,971]].map(([px,py])=>plan(px,py));

// The other mall page filters by face centroid. Include both shop returns and
// the soffit along the diagonal so walls stay attached to the shared aisle.
const northPreview=Math.min(774,transverseNorth-3);
const arcadePreview=[[[722,northPreview],[1033,northPreview],[1033,813],[904,813],[904,841],[840,841],[840,812],[722,812]],
  [[904,760],[1033,760],[1033,northPreview],[904,northPreview]],
  [[816,723],[846,723],[846,838],[696,975],[673,950],[816,812]]]
  .map(outline=>outline.map(([px,py])=>plan(px,py))).map(poly=>({poly,box:polyBBox(poly)}));

// Keep the fitted shop visible when approaching from the adjacent Central City
// page, whose normal neighbour rendering is otherwise restricted to junctions.
export function cinemaPreview(x,y,z){
  if(rotaryPreview(x,y,z))return true;
  if(y < -6.25 || y > -1.45)return false;
  const dx=x-origin[0],dz=z-origin[1];
  const along=dx*normal[1]-dz*normal[0],out=dx*normal[0]+dz*normal[1];
  if(Math.abs(along)<6.5 && out>=-5.4 && out<=6.7)return true;
  return arcadePreview.some(({poly,box:[x0,z0,x1,z1]})=>
    x>=x0 && x<=x1 && z>=z0 && z<=z1 && pointInPoly(x,z,poly));
}
