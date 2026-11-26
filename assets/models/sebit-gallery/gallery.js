import {boxSilhouette} from '../interior-architecture/box-silhouette.js';
import {placeSingleDetail} from '../interior-architecture/single-detail.js';
import {screen} from './screen.js';

export const labels={
  blue:'파란 절곡 벤치',white:'흰 절곡 벤치','screen-body':'홍보 모니터 프레임',film:'홍보 모니터 표시 면',
  channel:'선형 LED 받침',striplamp:'청록·보라·연황색 선형등',track:'벽화 조명 레일과 회전등',
};
const title=key=>'피카소 벽화길 · '+labels[key];
const proxies=new Map();
let matte,emit,media;
function coarse(T,key){
  if(proxies.has(key))return proxies.get(key);
  let pieces;
  if(key==='blue'||key==='white'){
    const color=key==='blue'?0x277bb3:0xecebe4;
    pieces=[[0,.411,0,1.98,.055,.455,color],[-.962,.01,0,.055,.41,.455,color],[.962,.01,0,.055,.41,.455,color]];
  }else if(key==='screen-body')pieces=[[0,.162,.046,4.69,2.78,.195,0x42474d],[0,.20,-.042,4.64,2.697,.152,0x24282c],[0,.33,-.130,4.445,2.42,.012,0x0e1015]];
  else if(key==='film')pieces=[[0,.343,-.142,1.48,2.397,.001,0x8378a2],[0,.72,-.145,1.12,1.36,.002,0xb0a3cf],[0,.86,-.147,.52,.53,.002,0x423763]];
  else if(key==='channel')pieces=[[0,.146,.025,.75,2.819,.12,0x34383c],[0,.349,-.048,.134,2.367,.043,0x515859]];
  else if(key==='striplamp'){
    const colors=[0x75f3e8,0x72dce9,0x80aff5,0xb693ed,0xe5a3dc,0xefd5bd,0xf4f2c3];
    pieces=colors.map((c,i)=>[0,.366+i*2.338/7,-.084,.101,2.338/7,.024,c]);
  }else{
    pieces=[[0,3.28,0,7.998,.075,.068,0xe5e3d8]];
    for(const x of [-3.05,-1.55,.02,1.63,3.24])pieces.push([x,3.05,-.09,.13,.19,.15,0xe5e3d8]);
  }
  const result=boxSilhouette(T,pieces);proxies.set(key,result);return result;
}
function display(T){
  media??=(async()=>{
    const map=await new T.TextureLoader().loadAsync(new URL('./program.webp',import.meta.url).href);
    map.colorSpace=T.SRGBColorSpace;map.repeat.set(1/3,1);map.anisotropy=4;
    const geo=new T.BufferGeometry();geo.setAttribute('position',new T.Float32BufferAttribute(screen.vertices,3));
    geo.setAttribute('uv',new T.Float32BufferAttribute(screen.uv,2));geo.computeVertexNormals();
    const mat=new T.MeshBasicMaterial({map,side:T.DoubleSide});
    // Update only when the screen is being drawn. The loop uses the current time across area changes.
    mat.onBeforeRender=()=>{const card=Math.floor(Date.now()/6500)%3;map.offset.x=card/3;};
    return [new T.Mesh(geo,mat)];
  })().catch(error=>{media=null;throw error;});
  return media;
}

const wing=[-1.5,-.75,0,.75,1.5].map(x=>[x,0,0]);
const benches=[[298,'blue'],[322,'white'],[338,'blue']];
export function buildSebitGallery(K,{P,R,F,C,ROT}){
  const T=K.THREE,angle=ROT+Math.PI/2;
  const [ox,oz]=P(0,0),[vx,vz]=P(0,1),t=p=>(p.x-ox)*(vx-ox)+(p.z-oz)*(vz-oz);
  matte??=new T.MeshLambertMaterial({vertexColors:true,side:T.DoubleSide});
  emit??=new T.MeshBasicMaterial({vertexColors:true,side:T.DoubleSide});
  function place(key,s,v,halfLength,range,exitRange,eyeHeight,translations){
    const wall=v>6,lo=wall?6.68:v-.35,hi=wall?6.99:v+.35,[x,z]=P(s,v);
    const seen=p=>t(p)<6.84;
    K.detail({name:title(key),floor:'B1',poly:R(s-halfLength,lo,s+halfLength,hi),y0:F,y1:C,
      visibleFrom:wall?(px,y,pz)=>seen({x:px,z:pz}):undefined},()=>{
      const lit=key==='striplamp'||key==='film';
      placeSingleDetail(K,{name:title(key),file:'../sebit-gallery/'+(key==='film'?'program.webp':key+'.glb'),
        at:[x,F,z],angle,range,exitRange,eyeHeight,floorTolerance:3.55,fallback:coarse(T,key),
        fallbackMaterial:lit?emit:matte,material:key==='film'?null:lit?emit:matte,
        loadSurface:key==='film'?()=>display(T):undefined,translations,closeVisibleFrom:wall?seen:undefined});
    });
  }
  for(const [s,key] of benches){
    const v=-4.2;
    const top=R(s-.99,v-.2275,s+.99,v+.2275);
    K.phys.addSurface(top,F+.466,{tag:'onebailey'});
    K.phys.addPolyWalls(top,F,F+.466,.016,'onebailey');
    place(key,s,v,1.05,9,11,.38);
  }
  for(let s=286;s<=342;s+=8)place('track',s,-5.88,4.05,10,13,3.17);
  for(const [key,range,exitRange] of [['screen-body',18,22],['film',18,22]])
    place(key,306.3,6.805,key==='film'?.74:2.35,range,exitRange,1.56);
  // Two independent banks. Their five repeated aluminium/diffuser modules share one mesh and draw per bank.
  for(const s of [302.095,310.505]){
    place('channel',s,6.805,1.90,12,15,1.55,wing);
    place('striplamp',s,6.805,1.90,13,16,1.55,wing);
  }
}
