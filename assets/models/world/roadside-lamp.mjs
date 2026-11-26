// Capture the same four primitives as the street renderer, once at the surveyed corner.
import {BoxGeometry,CylinderGeometry,Quaternion,Vector3} from 'three';
import {roadsideLampShape} from '../../../js/places/streets.js';

export function nativeRoadsideLamp(site){
  const {mast,arm,hood,lens}=roadsideLampShape(site.lamp[0],.15,site.lamp[1],site.yaw);
  const ring=(r,h,n)=>new CylinderGeometry(r,r,h,n);
  const shaft=ring(mast.r,mast.h,mast.seg).translate(mast.x,mast.y+mast.h/2,mast.z);
  const a=new Vector3(...arm[0]),b=new Vector3(...arm[1]);
  const span=new Vector3().subVectors(b,a);
  const tube=ring(arm[2],span.length(),6);
  const orientation=new Quaternion().setFromUnitVectors(new Vector3(0,1,0),span.normalize());
  tube.applyQuaternion(orientation).translate((a.x+b.x)/2,(a.y+b.y)/2,(a.z+b.z)/2);
  const box=o=>new BoxGeometry(o.w,o.h,o.d).rotateY(o.rotY).translate(o.x,o.y+o.h/2,o.z);
  return [['지주',shaft],['등기구 팔',tube],['등기구 몸체',box(hood)],['렌즈',box(lens)]].map(([name,g])=>{
    const coords=g.getAttribute('position'),points=[];
    for(let i=0;i<coords.count;i++)points.push([coords.getX(i),coords.getY(i),coords.getZ(i)]);
    const triangles=[];for(let i=0;i<g.index.count;i+=3)triangles.push([g.index.getX(i),g.index.getX(i+1),g.index.getX(i+2)]);
    return {name,points,triangles};
  });
}
