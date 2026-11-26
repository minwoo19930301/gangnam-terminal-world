import {boxSilhouette} from '../interior-architecture/box-silhouette.js';
import {loadArchitecture} from '../interior-architecture/model.js';
import {placeSingleDetail} from '../interior-architecture/single-detail.js';
import {poses} from './stock-layout.js';

const stockFile='../ssg-market-haenyeo/bento.glb';
let stock;
async function recipeMesh(name){
  stock??=loadArchitecture(stockFile).catch(error=>{stock=null;throw error;});
  const mesh=(await stock).find(part=>part.name==='MarketPack'+name);
  if(!mesh)throw new Error('Missing seafood pack '+name);
  return [mesh];
}

function packSilhouette(T,recipe){
  if(recipe==='Seaweed')return boxSilhouette(T,[
    [0,0,0,.145,.06,.145,0xe1dccd],[0,.06,0,.13,.008,.13,0x555941],
    [0,.068,0,.047,.003,.155,0xf0ead8]
  ]);
  const food={Nigiri:0xdc8d60,Ikura:0xd38c35,Abalone:0xb39871};
  return boxSilhouette(T,[
    [0,0,0,.34,.075,.23,recipe==='Ikura'?0x883b31:0xc39c71],
    [0,.075,0,.29,.013,.185,0x575445],[-.057,.087,0,.127,.01,.13,food[recipe]],
    [recipe==='Abalone'?-.065:.045,.098,0,.057,.003,.231,0xf1ecde]
  ]);
}

export function haenyeoSeafood(K,x,y,z,angle){
  const T=K.THREE;
  const material=new T.MeshPhongMaterial({vertexColors:true,side:T.DoubleSide,shininess:36,specular:0x524d43});
  const fallback=boxSilhouette(T,[
    [0,.02,0,4.34,.70,.98,0x2c3230],[0,.72,-.34,4.34,.63,.19,0x343432],
    [0,1.35,-.46,4.34,1.09,.07,0x949384],[-.79,1.37,-.19,1.20,.37,.05,0x262829]
  ]);
  const c=Math.cos(angle),s=Math.sin(angle);
  const facing=p=>s*(p.x-x)+c*(p.z-z)>-.25;
  const shared={at:[x,y,z],angle,material,fallbackMaterial:material,floorTolerance:1.85,eyeHeight:1.6,closeVisibleFrom:facing};
  placeSingleDetail(K,{...shared,name:'신세계 마켓 · 해녀의 신세계',file:'../ssg-market-haenyeo/counter.glb',
    fallback,range:9.7,exitRange:13.5,
    viewBounds:[new T.Box3(new T.Vector3(-2.2,0,-.52),new T.Vector3(2.2,2.5,.52))]});
  for(const [recipe,matrices] of Object.entries(poses)){
    placeSingleDetail(K,{...shared,name:'해녀의 신세계 · '+recipe,file:stockFile+'#'+recipe,
      loadSurface:()=>recipeMesh(recipe),fallback:packSilhouette(T,recipe),range:3.25,exitRange:4.75,
      instances:matrices.map(values=>({matrix:new T.Matrix4().fromArray(values)}))});
  }
}
