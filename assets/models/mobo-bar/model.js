import {placeSingleDetail} from '../interior-architecture/single-detail.js';
import {boxSilhouette} from '../interior-architecture/box-silhouette.js';

export const seatX=[-4.28,-2.89,-1.46,-.05,1.39,2.83,4.23];
const shelfX=[-3.20,-.07,3.08];
const profiles={
  stone:{label:'석재 바닥과 접촉 그림자',range:18,exit:21,eye:0,boxes:[[0,.019,0,15.74,.005,23.57,0xb0a89b]]},
  counter:{label:'목재 카운터와 창 블라인드',range:17,exit:21,eye:1.58,boxes:[
    [0,.12,0,10.08,.87,.72,0x928470],[0,.98,.012,10.13,.10,1.08,0xa49178],
    [0,.08,2.54,10.10,.95,.83,0x45463f],
    ...Array.from({length:6},(_,i)=>[-5.10+2.04*i,.04,3.105,.08,4.06,.12,0x303332]),
    ...Array.from({length:16},(_,i)=>[0,1.64+i*.150,3.07,10.12,.044,.065,0x9a846e]),
  ]},
  chair:{label:'새들 가죽 하이체어',range:8.4,exit:10,eye:.89,boxes:[
    [0,.747,0,.48,.033,.44,0xa57453],[0,.805,-.237,.48,.38,.031,0x926648],
    [0,.25,.209,.46,.020,.020,0x393b36],[0,.25,-.207,.46,.020,.020,0x393b36],
    ...[-.23,.23].map(x=>[x,.25,0,.021,.020,.42,0x393b36]),
    ...[-.226,.226].flatMap(x=>[-.204,.206].map(z=>[x,.012,z,.025,.745,.025,0x393b36])),
  ]},
  bottles:{label:'증류주 병과 유리잔',range:7.2,exit:9.3,eye:.32},
  lamps:{label:'호박빛 전구 갓',range:13,exit:16,eye:.06,boxes:[
    ...[-4.10,-1.37,1.37,4.10].map(x=>[x,-.025,0,.088,.16,.086,0xffe1a4]),
  ]},
  service:{label:'칵테일과 바 도구',range:4.7,exit:6.5,eye:.10,boxes:[
    [.08,0,.01,.50,.006,.28,0xdfd7c4],[-.40,0,.16,.069,.17,.072,0xb98a68],
    [-.045,.081,0,.112,.058,.10,0xe3b65d],
  ]},
  herbs:{label:'철제 선반의 허브 화분',range:8.5,exit:11,eye:1.61},
};

// An orthographic bake of the three native shelves retains the spaces between
// glasses. It is shared by all three displays and first requested when rendered.
function bakedPanel(T,kind){
  const panel=new T.MeshLambertMaterial({color:0xffffff,transparent:true,alphaTest:.28,opacity:0,side:T.DoubleSide});
  const loader=new T.TextureLoader(),url=new URL('./'+kind+'-front.webp',import.meta.url);
  let pending=false,retry=0;
  panel.onBeforeRender=()=>{
    if(pending||performance.now()<retry)return;
    pending=true;
    loader.load(url.href,tex=>{
      tex.colorSpace=T.SRGBColorSpace;tex.anisotropy=4;panel.map=tex;panel.opacity=1;
      panel.transparent=false;panel.needsUpdate=true;panel.onBeforeRender=()=>{};
    },undefined,()=>{pending=false;retry=performance.now()+10000;});
  };
  return panel;
}

export function registerMobo(K,{P,rect,angle,y}){
  const T=K.THREE,origin=P(0,0),c=Math.cos(angle),s=Math.sin(angle);
  const paint=new T.MeshPhongMaterial({vertexColors:true,side:T.DoubleSide,shininess:17,specular:0x302c23});
  const far={};
  const panels={bottles:bakedPanel(T,'bottles'),herbs:bakedPanel(T,'herbs')};
  const bulbs=new T.MeshPhongMaterial({color:0xffdf98,emissive:0x6a441a,specular:0xffe7bc,
    shininess:92,transparent:true,opacity:.22,depthWrite:false});
  function part(kind,x,d,h,width,depth,y1,turn=0){
    const spec=profiles[kind],u=12+d,v=14.25-x,at=P(u,v);
    const name='모보 바 · '+spec.label;
    // The public garden is visible through three glass sides. The partition
    // at v=22 only admits views through the existing 3 m entrance.
    function visible(wx,eye,wz){
      if(eye<y-.10||eye>y+4.85)return false;
      const dx=wx-origin[0],dz=wz-origin[1],pu=dx*c-dz*s,pv=dx*s+dz*c;
      if(pv<=22)return true;
      if(pv>40)return false;
      const fraction=(pv-22)/(pv-v);
      const cross=pu+(u-pu)*fraction;
      return cross+depth*.5*fraction>=-1.35 && cross-depth*.5*fraction<=1.65;
    }
    far[kind]??=kind==='bottles'?new T.PlaneGeometry(2.90,.613).rotateY(Math.PI).translate(0,.286,0)
      :kind==='herbs'?new T.PlaneGeometry(2.32,3.38).rotateY(Math.PI).translate(0,1.68,0):boxSilhouette(T,spec.boxes);
    // The counter has a deep window end, so its bounds extend beyond the centre of the top.
    const u0=kind==='counter'?u-.55:u-depth/2,u1=kind==='counter'?u+3.18:u+depth/2;
    K.detail({name,poly:rect(u0,v-width/2,u1,v+width/2),floor:'7F',y0:y+h,y1:y+h+y1,visibleFrom:visible},()=>{
      placeSingleDetail(K,{name,file:'../mobo-bar/'+kind+'.glb',at:[at[0],y+h,at[1]],angle:angle+Math.PI/2+turn,
        material:kind==='stone'?undefined:kind==='lamps'?bulbs:paint,fallback:far[kind],
        fallbackMaterial:panels[kind]??(kind==='lamps'?bulbs:paint),range:spec.range,exitRange:spec.exit,floorTolerance:3.1,eyeHeight:spec.eye});
    });
  }
  part('stone',.205,-8,0,15.74,23.57,.045);
  part('counter',0,0,0,10.28,3.73,4.13);
  part('lamps',0,-.16,1.90,8.40,.21,.21);
  seatX.forEach(x=>part('chair',x,-.99,0,.50,.58,1.25));
  shelfX.forEach(x=>part('bottles',x,2.54,1.03,2.86,.64,.59));
  part('service',1.35,-.13,1.075,1.22,.42,.21);
  for(const d of [-3.78,-1.47,.84])part('herbs',-6.45,d,0,.49,2.29,3.35,Math.PI/2);
}
