import {placeSingleDetail} from '../interior-architecture/single-detail.js';
import {boxSilhouette} from '../interior-architecture/box-silhouette.js';
import {loadArchitecture} from '../interior-architecture/model.js';
import {relief} from '../../../js/banpo_relief.js';
import {upperWell} from './model.js';
const [a,b,c,d]=upperWell;
export const ceilingZones=[
  [-31.60,42,-14.025,b,10.96],[-31.60,d,-14.025,55,10.96],
  [-31.60,b,a,d,10.96],[c,b,-14.025,d,10.96],[a,b,c,d,15.55],
];
export function registerCoffers(K,P,RECT,R){
  const T=K.THREE,paint=new T.MeshLambertMaterial({vertexColors:true,side:T.DoubleSide});
  const beams=boxSilhouette(T,[[-.44,.04,0,.045,.07,1.79,0x825e43],[.41,.04,0,.045,.07,1.79,0x765840],
    [0,0,-.31,1.8,.091,.06,0x917154],[0,0,.44,1.8,.091,.06,0x947455]]);
  const file='hotel-lattice.glb',name='현관 홀 월넛 격자 천장';
  const load=async file=>{const [m]=await loadArchitecture(file);m.material=paint;return [m];};
  const [ox,oz]=P(0,0),co=Math.cos(R),si=Math.sin(R);
  for(const [u,v,U,V,H] of ceilingZones){
    const nu=Math.max(1,Math.round((U-u)/1.75)),nv=Math.max(1,Math.round((V-v)/1.8)),w=(U-u)/nu,d=(V-v)/nv;
    const at=P(u+w/2,v+d/2),positions=Array.from({length:nu*nv},(_,i)=>[i%nu*1.8,0,Math.floor(i/nu)*1.8]);
    function visible(x,eye,z){
      const dx=x-ox,dz=z-oz,cu=dx*co-dz*si,cv=dx*si+dz*co;
      if(eye<-.3||eye>15.85)return false;
      if(eye>11.16)return H>12&&cu>=a-.2&&cu<=c+.2&&cv>=b-.2&&cv<=upperWell[3]+.2;
      return cu>=-33.25&&cu<-.8&&cv>=40.3&&cv<59.8;
    }
    K.detail({name,floor:'1F',poly:RECT(u,v,U,V),y0:0,y1:H+.24,visibleFrom:visible},()=>{
      const item=placeSingleDetail(K,{name,file,at:[at[0],H,at[1]],angle:R,fallback:beams,fallbackMaterial:paint,
        loadSurface:load,material:paint,translations:positions,range:29,exitRange:31,eyeHeight:0,floorTolerance:17,
        closeVisibleFrom:e=>visible(e.x,e.y-relief(e.x,e.z),e.z)});
      item.scale.set(w/1.8,1,d/1.8);
    });
  }
}
let pendant;
export function registerPendant(K,P,RECT,R,u,v,H){
  const T=K.THREE,name='JW 현관 유리 드롭 샹들리에',file='../interior-finish/hotel-pendant.glb',at=P(u,v);
  const visible=(x,eye,z)=>{
    if(eye<11.25||eye>20.32)return false;
    const dx=x-at[0],dz=z-at[1],cu=dx*Math.cos(R)-dz*Math.sin(R),cv=dx*Math.sin(R)+dz*Math.cos(R);
    return Math.abs(cu)<7.05&&cv>-5.3&&cv<6.2;
  };
  const p=boxSilhouette(T,[[0,-.11,0,2.01,.09,1.06,0x715a45]]);
  const paint=new T.MeshLambertMaterial({vertexColors:true,side:T.DoubleSide});
  K.detail({name,floor:'3F',poly:RECT(u-1.6,v-1.3,u+1.6,v+1.3),y0:11.45,y1:H+.2,visibleFrom:visible},()=>{
    const bounds=[new T.Box3(new T.Vector3(-1.44,-2.77,-1.05),new T.Vector3(1.44,.08,1.05))];
    for(const part of ['Surface','Diffuser']){
      const rootName=name+(part==='Diffuser'?' · 발광면':'');
      const mat=part==='Diffuser'?new T.MeshBasicMaterial({vertexColors:true,side:T.DoubleSide}):paint;
      const proxy=part==='Diffuser'?boxSilhouette(T,[[-.44,-.98,0,.07,.19,.07,0xffe6b5],[.09,-1.34,0,.08,.21,.08,0xffe2ad],[.47,-1.08,.20,.07,.18,.07,0xffe7bc]]):p;
      placeSingleDetail(K,{name:rootName,file:file+'#'+part,at:[at[0],H,at[1]],angle:R,fallback:proxy,fallbackMaterial:mat,material:mat,
        loadSurface:async()=>{pendant??=loadArchitecture(file).catch(e=>{pendant=null;throw e;});return [(await pendant).find(p=>p.name===part)];},
        range:18,exitRange:20,eyeHeight:-.75,floorTolerance:9.3,viewBounds:bounds,closeVisibleFrom:e=>visible(e.x,e.y-relief(e.x,e.z),e.z)});
    }
  });
}
