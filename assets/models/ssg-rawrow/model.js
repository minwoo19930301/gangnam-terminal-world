import {boxSilhouette} from '../interior-architecture/box-silhouette.js';
import {placeSingleDetail} from '../interior-architecture/single-detail.js';

export function rawrowDisplay(K, x,y,z,angle){
  const T=K.THREE,material=new T.MeshStandardMaterial({vertexColors:true,side:T.DoubleSide,roughness:.56,metalness:.12});
  const fallback=boxSilhouette(T,[[-.73,.07,.82,.37,.07,1.74,0xc0c3bd],
    [-.73,1.08,.82,.37,.04,1.74,0xc0c3bd],[.73,.10,-1.29,.36,.43,1.62,0xafb4ae],
    [0,2.21,-2.48,1.74,.33,.07,0xed4c2d]]);
  const box=new T.Box3(new T.Vector3(-.96,0,-2.53),new T.Vector3(.96,2.60,1.8));
  const forwardX=Math.sin(angle),forwardZ=Math.cos(angle);
  placeSingleDetail(K,{name:'8층 로우로우 · 트렁크와 가방 진열',file:'../ssg-rawrow/front.glb',at:[x,y,z],angle,
    fallback,material,fallbackMaterial:material,range:12,exitRange:15,floorTolerance:3.1,eyeHeight:1.65,viewBounds:[box],
    closeVisibleFrom:p=>{
      const dx=p.x-x,dz=p.z-z,depth=dx*forwardX+dz*forwardZ,side=dx*forwardZ-dz*forwardX;
      return depth>-3.0&&Math.abs(side)<(depth>1.6?6:1.15);
    }});
}
