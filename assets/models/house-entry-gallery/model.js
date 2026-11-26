import {boxSilhouette} from '../interior-architecture/box-silhouette.js';
import {placeSingleDetail} from '../interior-architecture/single-detail.js';

function galleryFinish(T){
  const material=new T.MeshPhongMaterial({vertexColors:true,side:T.DoubleSide,shininess:31,specular:0x54493f});
  material.onBeforeCompile=shader=>{
    shader.fragmentShader=shader.fragmentShader.replace('#include <opaque_fragment>',`
      float lens=smoothstep(.94,.99,vColor.r)*(1.-smoothstep(.69,.85,vColor.b));
      outgoingLight+=vColor.rgb*lens*.56;
      #include <opaque_fragment>`);
  };
  return material;
}

export function houseEntryGallery(K,x,z,angle){
  const T=K.THREE;
  const fallback=boxSilhouette(T,[[-1.21,.021,-.934,1.76,.38,.246,0x625b49],
    [-1.21,.403,-.93,1.48,.49,.20,0x64714c]]);
  const material=galleryFinish(T);
  const sin=Math.sin(angle),cos=Math.cos(angle);
  placeSingleDetail(K,{name:'하우스 오브 신세계 · 청동 벽과 식재 입구',file:'../house-entry-gallery/vestibule.glb',
    at:[x,.008,z],angle,fallback,material,fallbackMaterial:material,range:12,exitRange:15,
    eyeHeight:1.62,floorTolerance:2.15,
    viewBounds:[new T.Box3(new T.Vector3(-2.34,0,-1.18),new T.Vector3(3.25,3.15,6.19))],
    closeVisibleFrom:camera=>{
      const dx=camera.x-x,dz=camera.z-z;
      const s=34.5+sin*dx+cos*dz,t=25.6+cos*dx-sin*dz;
      return s>32.9 && s<43.3 && t>21.6 && t<29.5;
    }});
}

export function houseEntryRamp(K,point,angle,start,end,mid,foot){
  const T=K.THREE,material=galleryFinish(T),length=(end-start)/6;
  const floorAt=s=>.008+(2.1-.008)*(s-foot)/(end-foot);
  const slope=(2.1-.008)/(end-foot);
  const coarse=boxSilhouette(T,[[0,3,0,2.54,.025,length*Math.hypot(1,slope),0xd3c4b1,-Math.atan(slope)]]);
  // Each pair shares a draw. The distant bay is represented by the corridor
  // walls and existing roof until the visitor looks into its part of the ramp.
  for(let i=0;i<6;i+=2){
    const s=start+length*(i+1),[x,z]=point(s,mid),y=floorAt(s);
    const shifts=[-.5,.5].map(k=>[0,floorAt(s+length*k)-y,length*k]);
    placeSingleDetail(K,{name:'하우스 오브 신세계 · 경사 통로 천장과 벽',file:'../house-entry-gallery/bay.glb',
      at:[x,y,z],angle,translations:shifts,fallback:coarse,material,fallbackMaterial:material,
      range:14,exitRange:17,floorTolerance:2.8,eyeHeight:1.62,
      viewBounds:[new T.Box3(new T.Vector3(-1.29,-.37,-length),new T.Vector3(1.29,3.41,length))],
      closeVisibleFrom:p=>{
        const dx=p.x-x,dz=p.z-z;
        return Math.abs(Math.cos(angle)*dx-Math.sin(angle)*dz)<1.9;
      }});
  }
}
