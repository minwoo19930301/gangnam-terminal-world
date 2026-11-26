import {mergeGeometries} from 'three/addons/utils/BufferGeometryUtils.js';
import {points,triangles} from './arrival-mark.js';
import {displayCase} from '../gyeongbu/display-case.js';
import {boxSilhouette} from '../interior-architecture/box-silhouette.js';

function shopSilhouette(T){
  const cabinet=boxSilhouette(T,[
    [0,.032,-2.88,7.63,.020,5.78,0xbf5932],[0,2.48,-.095,7.58,.67,.25,0xa77745],
    [0,2.58,.083,2.47,.435,.03,0x302d2a],[-1.57,.15,-2.40,3.88,.795,.83,0xa77745],
    [1.25,.15,-2.40,1.70,.795,.83,0xece7df],[0,.04,-5.78,7.57,3.12,.07,0xece7df],
  ]);
  const positions=[],colors=[],normal=[],uv=[],gold=new T.Color(0xfceab0);
  for(let i=0;i<points.length;i+=2){
    positions.push(points[i]/1000,points[i+1]/1000,.103);
    colors.push(gold.r,gold.g,gold.b);normal.push(0,0,1);uv.push(0,0);
  }
  const mark=new T.BufferGeometry();
  mark.setAttribute('position',new T.Float32BufferAttribute(positions,3));
  mark.setAttribute('color',new T.Float32BufferAttribute(colors,3));
  mark.setAttribute('normal',new T.Float32BufferAttribute(normal,3));
  mark.setAttribute('uv',new T.Float32BufferAttribute(uv,2));
  mark.setIndex(triangles);
  const front=mergeGeometries([cabinet,mark]);
  cabinet.dispose();mark.dispose();
  return front;
}

const display=displayCase({
  url:new URL('./biscuiterie.glb',import.meta.url),
  name:'비스퀴테리 M.O · 마들렌과 번호 틴 진열장',bodyName:'BiscuiterieBody',lightName:'Lit',
  baseColor:0xffffff,enter:12,leave:15,visibleBounds:[[-3.82,.027,-5.83],[3.82,4.32,.16]],
  proxy:shopSilhouette
});

export function biscuiterieShop(K,x,y,z,angle){
  const c=Math.cos(angle),s=Math.sin(angle);
  const point=(a,d)=>[x+a*c-d*s,z-a*s-d*c];
  const blocker=(left,front,right,back,top)=>K.phys.addPolyWalls(
    [[left,front],[right,front],[right,back],[left,back]].map(([a,d])=>point(a,d)),y,y+top,.013,'centralcity');
  blocker(-3.51,1.98,2.10,2.83,1.48);
  blocker(2.15,2.135,3.74,2.785,1.09);
  for(const a of [-3.77,3.77]){
    K.phys.addWall(...point(a,.07),...point(a,5.8),y,y+3.16,.047,'centralcity');
  }
  K.phys.addWall(...point(-3.77,5.78),...point(3.77,5.78),y,y+3.16,.04,'centralcity');
  display(K,x,z,angle,y);
}
