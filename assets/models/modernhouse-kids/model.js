import {boxSilhouette} from '../interior-architecture/box-silhouette.js';
import {placeSingleDetail} from '../interior-architecture/single-detail.js';

const fixtures={
  arches:{name:'노란 아치와 침대',bounds:[-3.52,-.21,3.52,1.94],height:3.38,range:11,
    boxes:[[-3.29,0,0,.39,3.38,.22,0xebc852],[0,0,0,.70,3.38,.22,0xebc852],
      [3.27,0,0,.45,3.38,.22,0xebc852],[0,2.98,0,7,.4,.22,0xebc852],
      [-1.76,.035,-.17,2.6,2.97,.04,0xd5d1c5],[1.75,.29,.98,1.55,.42,1.85,0xf6e7d5]]},
  pillows:{name:'베개 진열대',bounds:[-1.72,-.54,1.72,.54],height:1.19,range:10,
    boxes:[[0,.10,0,2.9,.80,.79,0xf3db72],[0,.84,0,3.43,.10,1.07,0xf1e8cc],
      [-1.02,.92,.03,.87,.16,.60,0xb7d9ec],[0,.94,.03,.85,.16,.57,0xedc9d0],[1.04,.92,.04,.83,.16,.61,0xf6e7d5]]},
  gifts:{name:'물병과 도시락',bounds:[-1.24,-.4,1.24,.4],height:1.28,range:9,
    boxes:[[0,.085,0,2.12,.83,.68,0xf0d16a],[0,.9125,0,2.47,.055,.80,0xf3db72],
      [-.63,.97,.11,.67,.20,.25,0xbadeca],[.58,.975,.03,.66,.23,.29,0xedc9d0]]},
};

export function registerKidsFixture(F,key,u,y,v,visibleFrom){
  const {K}=F,T=K.THREE,part=fixtures[key],name='모던하우스 키즈 · '+part.name;
  const [x,z]=F.P(u,v),[a,b,c,d]=part.bounds;
  const solid={skip:['top','bottom','n','s','e','w']};
  if(key==='arches'){
    F.B(u,y,v,6.98,3.38,.34,0xebc852,solid);
    F.B(u+1.75,y,v+.99,1.55,.74,1.87,0xf6e7d5,solid);
  }else F.B(u,y,v,c-a,.95,d-b,0xf3db72,solid);
  K.detail({name,floor:'4F',y0:y,y1:y+part.height,poly:F.Q(u+a,v+b,u+c,v+d),visibleFrom},()=>{
    const material=new T.MeshLambertMaterial({vertexColors:true,side:T.DoubleSide});
    return placeSingleDetail(K,{name,file:'../modernhouse-kids/'+key+'.glb',at:[x,y,z],angle:F.angle,
      fallback:boxSilhouette(T,part.boxes),fallbackMaterial:material,material,
      range:part.range,exitRange:part.range+3,floorTolerance:2.75,eyeHeight:part.height*.55});
  });
}
