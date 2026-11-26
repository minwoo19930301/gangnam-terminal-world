import {cafeAislePoint as plan} from '../../../js/places/sweet-park-plan.js';
import {pointInPoly,polyBBox} from '../../../js/physics.js';

export {plan};
const radial=(degrees)=>[649+64*Math.cos(degrees*Math.PI/180),1009+65*Math.sin(degrees*Math.PI/180)];
export const arc=(a,b,n)=>Array.from({length:n+1},(_,i)=>radial(a+(b-a)*i/n));
// The official white court meets the diagonal on this chord. Keep the two
// shared vertices exact so neither surface projects under the other.
export const cafeArc=[[710,1028],...arc(22,52,5),[686,1063]].map(p=>plan(...p));
const circleGuide=[[696,971], ...arc(-32,13,8), [710,1028],...arc(22,52,5),[686,1063],...arc(61,130,11),...arc(135,218,15),...arc(223,227,2), [623,950],
  [634,946],[646,944],[659,945],[669,948],[678,950]];
export const court=circleGuide.map(p=>plan(...p));
export const centre=plan(649,1009);
export const bookEdge=arc(61,130,11).map(p=>plan(...p)).slice(2,8);
export function outward(pt,depth){
  const x=pt[0]-centre[0],z=pt[1]-centre[1],l=Math.hypot(x,z);
  return [pt[0]+x/l*depth,pt[1]+z/l*depth];
}
// The shoe hall adjoins the bookshop at the south edge of the rotary. The
// black shopfront line stops at the start of the rounded, open showroom edge.
export const shoeFront=[plan(593,1057),...arc(135,130,2).map(p=>plan(...p)),...arc(61,130,11).slice(10,11).map(p=>plan(...p))];
// Widen only behind the published sales-hall boundary. Keep the public
// rotary arc and the adjacent bookstore threshold on their original vertices.
export const shoeRear=[[581,1069],[581,1095],[620,1095],[620,1065]].map(p=>plan(...p));
export const shoeThreshold=[...shoeFront,...[...shoeRear].reverse()];
export const bookFloor=[...bookEdge,...bookEdge.map(p=>outward(p,1.65)).reverse()];
const ends=[[710,1028],[686,1063]].map(p=>plan(...p));
export const cafeFront=[(ends[0][0]+ends[1][0])/2,(ends[0][1]+ends[1][1])/2];
const facing=Math.atan2(centre[0]-cafeFront[0],centre[1]-cafeFront[1]);
const tangentAngle=Math.atan2(-(ends[1][1]-ends[0][1]),ends[1][0]-ends[0][0]);
export const rotation=Math.cos(tangentAngle-facing)>0?tangentAngle:tangentAngle+Math.PI;
export function cafePoint(x,z) {
  return [cafeFront[0]+Math.cos(rotation)*x+Math.sin(rotation)*z,
    cafeFront[1]-Math.sin(rotation)*x+Math.cos(rotation)*z];
}
const right=cafePoint(3.16,-2.22),left=cafePoint(-3.16,-2.22);
const first=cafeArc[0];
export const cafeFloor=[...cafeArc,...(Math.hypot(right[0]-first[0],right[1]-first[1])>Math.hypot(left[0]-first[0],left[1]-first[1])?[right,left]:[left,right])];
// White west-side floor between the labelled event/accessory units and shoes.
// The north return ends on the existing department B1 slab; the west end is
// the guide margin. The eastern market-to-cinema diagonal is a separate polygon.
const inner=[...arc(135,218,15)].reverse();
export const westApron=[...inner,[434,1057],[406,1030],[372,1030],[372,998],[570,998],
  [548,984],[519,963],[496,943],[480,922],[470,896],[467,872],[467,726.6543779747],
  [498,726.6543779747],[498,872],[502,894],[513,915],[530,932],[552,947],[575,958],[594,961]].map(p=>plan(...p));
const regions=[court,cafeFloor,bookFloor,shoeThreshold,westApron].map(poly=>({poly,box:polyBBox(poly)}));
export function rotaryPreview(x,y,z){
  if(y< -6.25 || y> -1.42)return false;
  return regions.some(({poly,box:[x0,z0,x1,z1]})=>x>=x0-.65 && x<=x1+.65 &&
    z>=z0-.65 && z<=z1+.65 && (pointInPoly(x,z,poly) || poly.some(([px,pz],i)=>{
      const [qx,qz]=poly[(i+1)%poly.length],dx=qx-px,dz=qz-pz;
      const t=Math.max(0,Math.min(1,((x-px)*dx+(z-pz)*dz)/(dx*dx+dz*dz)));
      return (x-px-t*dx)**2+(z-pz-t*dz)**2<.65**2;
    })));
}

// Intersect the old above-ground podium edge with the two touching white
// basement floor areas. Only their common public span gets an opening.
export function publicFloorOpening(ax,az,bx,bz,polygons){
  const dx=bx-ax,dz=bz-az,L=Math.hypot(dx,dz),hits=[];
  for(const poly of polygons)for(let i=0;i<poly.length;i++){
    const [x,z]=poly[i],[u,v]=poly[(i+1)%poly.length],sx=u-x,sz=v-z;
    const cross=dx*sz-dz*sx;
    if(Math.abs(cross)<1e-9)continue;
    const t=((x-ax)*sz-(z-az)*sx)/cross,s=((x-ax)*dz-(z-az)*dx)/cross;
    if(t>=0&&t<=1&&s>=0&&s<=1)hits.push(t*L);
  }
  if(!hits.length)return null;
  const low=Math.min(...hits),high=Math.max(...hits);
  return {at:(high+low)/2,w:high-low};
}
