import {mergeGeometries} from 'three/addons/utils/BufferGeometryUtils.js';
import {boxSilhouette} from '../interior-architecture/box-silhouette.js';
import {placeSingleDetail} from '../interior-architecture/single-detail.js';
import {glazing} from './glass.js';

const pieces={
  entry:'체크 바닥과 검은 상호 외벽',gifts:'물결 선반과 선물 상자',counter:'둥근 주문대와 사선 견본장',
  chocolates:'통초콜릿과 잘라 보인 단면',pops:'개별 포장 롤리팝과 사탕',stand:'둥근 전시대의 포장 선물',
  windows:'둥근 정면 쇼윈도 유리',case:'견본장의 사선 보호유리'
};
const proxy=new Map(),glassShapes=new Map();
let paint,glassPaint;
function getProxy(T,key){
  if(proxy.has(key))return proxy.get(key);
  const white=0xeee9dc,ivory=0xe7e1d5,dark=0x262421,steel=0xb2b7b3;
  let p=[];
  if(key==='entry'){
    // Tile colours continue beyond the distance at which the trim and raised lettering are needed.
    for(let i=0;i<17;i++)for(let j=0;j<16;j++){
      const a=-4.24+i*.475,b=Math.min(a+.475,3.64),c=.015+j*.475,d=Math.min(c+.475,7.22);
      if(b-a>.01&&d-c>.01)p.push([(a+b)/2,.034,(c+d)/2,b-a,.012,d-c,(i+j)%2?0x27272a:0xe7e4da]);
    }
    for(const [a,b] of [[-4.24,-3.72],[-.02,.35],[2.52,2.77],[3.46,3.64]])p.push([(a+b)/2,.035,0,b-a,2.78,.155,ivory]);
    for(const[a,b] of [[-3.72,-.02],[.35,2.52],[2.77,3.46]])p.push([(a+b)/2,2.67,0,b-a,.15,.155,ivory]);
    p.push([-.3,2.82,0,7.99,.82,.226,dark],[-4.24,2.82,3.65,.238,.82,7.32,dark],
      [-4.24,.035,.32,.15,2.79,.64,ivory],[-4.24,.035,6.95,.15,2.79,.55,ivory]);
  }else if(key==='gifts'){
    p.push([0,.05,.02,5.68,.12,.69,white],[0,.17,.30,5.58,.64,.04,0xb1ccdf],[0,.81,.018,5.72,.086,.70,white],
      [0,.9,.29,5.64,1.45,.06,white],[0,1.61,.095,5.65,.047,.40,white],[0,2.15,.15,5.65,.047,.28,white]);
    const tones=[0xd5c387,0xe7e1d5,0xb4a1b1,0xad4237,0xddd9c8,0x423e39];
    for(let i=0;i<15;i++)for(let tier=0;tier<3;tier++)p.push([(i-7)*.367,[.17,.90,1.66][tier],.018,.25,.2+(i%2)*.09,.20,tones[(tier+i)%6]]);
    for(let i=0;i<7;i++)p.push([(i-3)*.785,2.22,.244,.74,.38,.055,0x655f54]);
  }else if(key==='counter')p=[[0,.05,0,4.31,.09,.88,0xb6ac98],[0,.14,0,4.43,.795,.974,ivory],
    [0,.935,0,4.48,.079,1,white],[-.515,1.015,0,3.16,.068,.85,steel],[-.515,1.517,-.307,3.16,.023,.025,steel],
    [-2.08,1.07,.38,.023,.45,.022,steel],[1.05,1.07,.38,.023,.45,.022,steel],[1.36,1.16,.26,.34,.20,.042,dark]];
  else if(key==='chocolates'){
    for(let j=0;j<3;j++)for(let i=0;i<9;i++){
      const x=(i-4)*.315,z=-.238+j*.245,y=.017+j*.051;
      p.push([x,y,z,.143,.01,.087,white],[x-.025,y+.01,z,.052,.04,.049,i%2?0x594333:0x6f4f3a],
        [x+.040,y+.01,z,.054,.035,.029,i%3?0x917253:0xceb687]);
    }
  }else if(key==='pops'){
    p=[[0,.005,0,.66,.053,.287,0xddd9c8]];
    for(let i=0;i<4;i++)for(let j=0;j<3;j++)p.push([(i-1.5)*.162+(j-1)*.041,.048,.025,.038,.072,.037,
      [0xd5b747,0x483831,0x8b6247,0xe7ca95][i]],[(i-1.5)*.162+(j-1)*.041,.12,.025,.008,.16,.008,white]);
  }else{
    p=[];
    for(let j=0;j<2;j++)for(let i=0;i<7;i++){
      const a=i*Math.PI*2/7;p.push([.32*Math.cos(a),.445+j*.392,.32*Math.sin(a),.095,.129,.084,[0xc9a960,0xc6c5ba,0xa4baba][i%3]]);
    }
  }
  let geo=boxSilhouette(T,p);
  if(key==='stand'){
    const shapes=[geo];
    for(const [r,y,h,color] of [[.43,.05,.34,ivory],[.497,.39,.05,white],[.15,.42,.37,ivory],[.534,.78,.056,white]]){
      const g=new T.CylinderGeometry(r,r,h,18);g.translate(0,y+h/2,0);
      const colorAttr=new Float32Array(g.attributes.position.count*3),c=new T.Color(color);
      for(let j=0;j<colorAttr.length;j+=3)c.toArray(colorAttr,j);
      g.setAttribute('color',new T.BufferAttribute(colorAttr,3));shapes.push(g);
    }
    geo=mergeGeometries(shapes);shapes.forEach(g=>g.dispose());
  }
  proxy.set(key,geo);return geo;
}
function glass(K,key,at,angle){
  const T=K.THREE;
  if(!glassShapes.has(key)){
    const data=glazing[key],g=new T.BufferGeometry();
    g.setAttribute('position',new T.Float32BufferAttribute(data.positions,3));g.setIndex(data.indices);g.computeVertexNormals();
    glassShapes.set(key,g);
  }
  glassPaint??=new T.MeshLambertMaterial({color:0xc9e0de,opacity:.105,transparent:true,depthWrite:false,side:T.DoubleSide});
  glassPaint.forceSinglePass=true;
  const mesh=new T.Mesh(glassShapes.get(key),glassPaint);
  mesh.position.set(...at);mesh.rotation.y=angle;mesh.name='씨즈캔디 · '+pieces[key];return K.addMesh(mesh);
}
export function seesShop(K,{P,R,lbox,lwall,lzone},s0,t0,s1,t1){
  const T=K.THREE,sCenter=s1-4.24,angle=R+Math.PI/2;
  const W=(x,d)=>P(sCenter-x,t0+d),at=(x,d,h)=>{const[xx,zz]=W(x,d);return[xx,h,zz]};
  const poly=(x0,d0,x1,d1)=>[W(x0,d0),W(x0,d1),W(x1,d1),W(x1,d0)];
  const minX=-4.24,maxX=3.64,depth=7.22,[ox,oz]=W(0,0),cs=Math.cos(angle),sn=Math.sin(angle);
  const local=(x,z)=>[(x-ox)*cs-(z-oz)*sn,(x-ox)*sn+(z-oz)*cs];
  const wall=(a,b,c,d,mat)=>lwall(sCenter-a,t0+b,sCenter-c,t0+d,0,3.72,{mat,thick:.116});
  // The published plan fixes the cell and its neighbours. Preserve the entire outside partition,
  // with the photographed public counter occupying the corner on the gallery side.
  wall(sCenter-s0,0,sCenter-s0,t1-t0,0xe4ddd2);
  wall(sCenter-s0,t1-t0,minX,t1-t0,0xe4ddd2);
  wall(maxX,0,sCenter-s0,0,'ccFamBuffBrick');
  wall(maxX,0,maxX,depth,0xe9e4d9);wall(maxX,depth,minX,depth,0xe9e4d9);
  const inv={skip:['top','bottom','n','s','e','w']};
  function collider(x,d,w,dep,base,h){lbox(sCenter-x,t0+d,w,dep,base,h,0,inv);}
  // Front window panes and fascia keep collision when their render detail has not been built.
  for(const[a,b] of [[minX,.35],[2.52,maxX]])collider((a+b)/2,0,b-a,.155,.03,2.80);
  collider(1.435,0,2.17,.155,2.70,.95);
  for(const[a,b] of [[0,.64],[6.67,depth]])collider(minX,(a+b)/2,.15,b-a,.03,2.80);
  collider(3.18,3.66,.70,5.72,.04,2.61);collider(-2.99,4.28,1,4.46,.04,1.48);
  collider(-1.87,.66,.96,.50,.05,.80);collider(-1.87,.66,.50,.96,.05,.80);
  lzone(sCenter-maxX,t0,s1,t0+depth,{name:'씨즈캔디',floor:'1F',sub:'파미에스테이션 FP-104',y0:0,y1:4.6,priority:9});
  function throughOpening(x,d,tx,td){
    if(x>=minX-.05&&x<=maxX+.05&&d>=-.08&&d<=depth+.06)return true;
    const vx=tx-x,vd=td-d;
    if(d<0&&vd>0){
      const u=x+vx*(-d/vd);
      if((u>-3.70&&u<-.04)||(u>.345&&u<2.53)||(u>2.77&&u<3.46))return true;
    }
    if(x<minX&&vx>0){
      const v=d+vd*(minX-x)/vx;
      if(v>.64&&v<6.67)return true;
    }
    return false;
  }
  const groups=[
    ['entry',0,0,.003,0,[minX-.17,-.17,maxX+.08,depth],32,39,1.65,[[0,.14],[-4.06,3.66]]],
    ['gifts',3.18,3.66,.045,Math.PI/2,[2.79,.79,3.59,6.53],10.5,12,1.32,[[3,2.04],[3,5.28]]],
    ['counter',-2.99,4.28,.045,Math.PI/2,[-3.50,2.03,-2.48,6.53],12.5,15,1.1,[[-3.28,3.0],[-3.28,5.65]]],
    ['chocolates',-2.99,4.795,1.127,Math.PI/2,[-3.39,3.29,-2.63,6.27],5.65,6.75,.11,[[-3.12,3.70],[-3.12,5.85]]],
    ['pops',-3.20,2.77,1.06,Math.PI/2,[-3.39,2.15,-3.01,3.41],4.6,5.6,.15,[[-3.20,2.77]]],
    ['stand',-1.87,.66,0,0,[-2.43,.10,-1.31,1.22],6.0,7.2,.62,[[-1.87,.66]]]
  ];
  paint??=new T.MeshLambertMaterial({vertexColors:true,side:T.DoubleSide});
  for(const [key,x,d,h,turn,bounds,range,exitRange,eyeHeight,targets] of groups){
    const visible=p=>{const[lx,ld]=local(p.x,p.z);return targets.some(([a,b])=>throughOpening(lx,ld,a,b));};
    K.detail({name:'씨즈캔디 '+pieces[key],floor:'1F',poly:poly(...bounds),y0:0,y1:3.72,
      visibleFrom:(px,eye,pz)=>{
        if(eye<-.35||eye>4.85)return false;
        return key==='entry'||visible({x:px,z:pz});
      }},()=>{
      placeSingleDetail(K,{name:'씨즈캔디 · '+pieces[key],file:'../sees/'+key+'.glb',at:at(x,d,h),angle:angle+turn,
        fallback:getProxy(T,key),fallbackMaterial:paint,material:paint,range,exitRange,eyeHeight,floorTolerance:key==='entry'?3:2.45,
        closeVisibleFrom:key==='entry'?p=>{const[a,b]=local(p.x,p.z);return a<maxX+1.6&&b<depth+.62;}:visible});
      if(key==='entry')glass(K,'windows',at(x,d,h),angle+turn);
      if(key==='counter')glass(K,'case',at(x,d,h),angle+turn);
    });
  }
}
