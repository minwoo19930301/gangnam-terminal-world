import {boxSilhouette} from '../interior-architecture/box-silhouette.js';
import {placeSingleDetail} from '../interior-architecture/single-detail.js';

import {plate} from './perforations.js';

const names={shelf:'흰 다섯 단 서가와 여행 책자',reader:'다국어 책장과 세로 열람 화면',
  desk:'곡면 방문 안내대와 상담 집기',sign:'삼색 상호와 은색 안내 벽',arrival:'천장 매입등과 입구 문턱'};
const geometry=new Map();
let paint,metalPlate;
function perforations(T){
  if(!metalPlate){
    const size=16,rgba=new Uint8Array(size*size*4),[u,v]=plate.fill;
    const back=[197,191,180],hole=[169,167,159];
    for(let j=0;j<size;j++)for(let i=0;i<size;i++){
      const within=Math.abs((i+.5)/size-.5)<u/2&&Math.abs((j+.5)/size-.5)<v/2;
      rgba.set([...(within?hole:back),255],(j*size+i)*4);
    }
    const tile=new T.DataTexture(rgba,size,size);
    tile.colorSpace=T.SRGBColorSpace;tile.wrapS=tile.wrapT=T.RepeatWrapping;tile.repeat.set(...plate.repeat);
    tile.generateMipmaps=true;tile.minFilter=T.LinearMipmapLinearFilter;tile.magFilter=T.LinearFilter;tile.needsUpdate=true;
    metalPlate=new T.Mesh(new T.PlaneGeometry(plate.w,plate.h),new T.MeshLambertMaterial({map:tile,side:T.DoubleSide}));
    metalPlate.position.set(plate.x,plate.y,plate.z);
  }
  return metalPlate.clone();
}
function silhouette(T,key){
  if(geometry.has(key))return geometry.get(key);
  const white=0xf5f3eb,ivory=0xe9e6db,ink=0x353937;
  let parts=[];
  if(key==='shelf'||key==='reader'){
    const bays=key==='shelf'?5:1,w=key==='shelf'?5.05:1.32;
    parts=[[0,.05,.228,w,2.41,.062,ivory],[0,.11,.035,w,.382,.392,white]];
    for(let i=0;i<=bays;i++)parts.push([(i/bays-.5)*w,.476,.047,.036,2.00,.352,white]);
    for(let j=0;j<=5;j++)parts.push([0,.485+j*.378,.045,w+.036,.033,.372,white]);
    const tones=[0xeeeade,0xadd6dc,0xede2c1,0xdbe6d1,0xcf8093];
    for(let j=0;j<5;j++)for(let i=0;i<bays*4;i++){
      const x=(i-(bays*4-1)/2)*w/(bays*4),z=.529+j*.378;
      parts.push([x,z,-.091,.178,.245,.054,(key==='shelf'?tones[(j+Math.floor(i/3))%5]:white)],
        [x,z+.024,-.122,.143,.084,.007,[0x71a37d,0xc5bfb4,0x80bfc6][(j+i)%3]]);
    }
    if(key==='reader')parts.push([-1.18,.035,.062,1.03,2.423,.384,white],[-1.18,.632,-.146,.82,1.55,.043,ink],
      [-1.18,.664,-.169,.758,1.481,.006,0x256aab],[-1.18,1.804,-.173,.758,.34,.006,0x152534]);
  }else if(key==='desk'){
    parts=[[0,.015,.03,5.03,.081,.99,0xd2cfc5],[0,.088,0,5.13,.849,1.04,ivory],[0,.936,0,5.20,.080,1.075,white]];
    for(const x of [-1.59,0,1.59])parts.push([x,1.115,.37,.52,.283,.046,ink],[x,.506,1.115,.48,.412,.060,0xa9a79f]);
  }else if(key==='arrival'){
    parts=[[.005,2.799,0,12.99,.105,9.30,white],[2.2,-.110,-4.684,2.01,.109,.044,0xf1d51f]];
    for(const [x,z] of [[0,-.21],[3.65,1.92]])parts.push([x,2.760,z,1.18,.04,1.18,ivory]);
  }else parts=[[0,.033,.02,5.68,2.66,.135,ivory],[0,.088,-.07,5.68,.676,.147,white],
    [0,.787,-.071,5.63,1.836,.054,0xc5bfb4],[2.22,1.87,-.105,.40,.27,.01,0xc53486],
    [1.95,1.71,-.105,.32,.25,.01,0xf1d51f],[2.28,1.43,-.105,.42,.29,.01,0x0094bd]];
  const g=boxSilhouette(T,parts);geometry.set(key,g);return g;
}
export function buildSebitInformation(K,{P,R,ROT,F,C}){
  const T=K.THREE,angle=ROT+Math.PI/2,cs=Math.cos(ROT),sn=Math.sin(ROT),[originX,originZ]=P(0,0);
  const local=p=>[(p.x-originX)*sn+(p.z-originZ)*cs,(p.x-originX)*cs-(p.z-originZ)*sn];
  function solid(s0,v0,s1,v1,y,top){
    const rect=R(s0,v0,s1,v1);
    K.phys.addPolyWalls(rect,F+y,F+top,.016,'onebailey');
    K.phys.addSurface(rect,F+top,{tag:'onebailey'});
  }
  // Photo registration puts the main shelf to a visitor's left, with the embedded reader to the desk's right.
  solid(163.07,9.956,163.52,15.05,.12,2.61);
  solid(171.72,15.82,174.15,16.32,.12,2.59);
  solid(164.735,12.36,169.96,13.43,.12,1.137);
  solid(164.90,13.45,169.82,13.87,.12,.875);
  const groups=[
    ['arrival',169.2,11.75,0,11,13,1.40,[162.69,7.03,175.72,16.44],[[167.0,7.12],[169.2,11.54]]],
    ['shelf',163.34,12.50,Math.PI/2,7.8,9.3,1.25,[163.08,9.92,163.58,15.08],[[163.44,10.77],[163.44,14.32]]],
    ['reader',172.40,16.04,0,7.0,8.4,1.37,[171.71,15.84,174.14,16.31],[[172.4,15.9],[173.58,15.89]]],
    ['desk',167.35,12.90,0,11,12.5,1.0,[164.72,12.34,169.99,14.09],[[165.41,12.57],[169.15,12.56]]],
    ['sign',167.27,16.04,0,15,16.5,1.65,[164.40,15.86,170.13,16.14],[[165.0,15.93],[169.20,15.93]]]
  ];
  paint??=new T.MeshLambertMaterial({vertexColors:true,side:T.DoubleSide});
  // At the frontage the centre glass doors and the right-hand reader bay are open to view.
  // The lower tourist posters and shutter still cover the other side of the window.
  function sight(s,v,targets){
    if(s<162.65||s>175.75||v>16.53){if(v>=7)return false;}
    if(v>=7)return true;
    return targets.some(([ts,tv])=>{
      const at=s+(ts-s)*(7-v)/(tv-v);
      return (at>165.95&&at<168.06)||(at>169.96&&at<174.94);
    });
  }
  for(const [key,s,v,turn,range,exitRange,eyeHeight,bounds,targets] of groups){
    const visible=p=>{
      const [s0,v0]=local(p);
      return key==='arrival'&&v0<7.07 ? s0>161.80&&s0<175.85 : sight(s0,v0,targets);
    };
    K.detail({name:'고터·세빛 안내센터 '+names[key],floor:'B1',poly:R(...bounds),y0:F,y1:C,
      visibleFrom:(x,y,z)=>y>F-.40&&y<C+.35&&visible({x,z})},()=>{
      const [x,z]=P(s,v);
      const root=placeSingleDetail(K,{name:'세빛 안내 · '+names[key],file:'../sebit-information/'+key+'.glb',
        at:[x,F+.12,z],angle:angle+turn,fallback:silhouette(T,key),fallbackMaterial:paint,material:paint,
        range,exitRange,eyeHeight,floorTolerance:2.8,closeVisibleFrom:visible});
      if(key==='sign')root.add(perforations(T));
    });
  }
}
