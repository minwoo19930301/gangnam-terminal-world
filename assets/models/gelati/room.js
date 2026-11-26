import {boxSilhouette} from '../interior-architecture/box-silhouette.js';
import {placeSingleDetail} from '../interior-architecture/single-detail.js';
import {glass} from './glass.js';
import {loadArchitecture} from '../interior-architecture/model.js';
import {mergeGeometries} from 'three/addons/utils/BufferGeometryUtils.js';

const names={shell:'검은 액자와 원형 펜던트',stock:'목제 유리장 속 겹친 와플콘',bar:'돌상판과 황동 난간 주문대',
  wells:'스테인리스 뚜껑과 맛 이름표',menu:'황동 고정 메뉴와 스무 맛',brand:'청록 상호와 두 색 콘 심벌',
  back:'에스프레소 머신과 뒤 작업대',packs:'포장 컵·보냉 상자와 계산대',lights:'유백 구형 펜던트의 빛',serve:'두 맛 컵과 와플콘·젤라또라떼',glass:'주문대 보호유리'};
let paint,glow,glazing;
const proxies=new Map();
function silhouette(T,key){
  if(proxies.has(key))return proxies.get(key);
  const dark=0x302d28,walnut=0x635043,ivory=0xf1eddf;
  let parts=[];
  if(key==='shell'){
    parts=[[0,3.08,0,7.416,.288,.29,dark],[0,3.13,2.51,7.25,.12,4.98,ivory],
      [0,.018,5.02,7.23,3.11,.054,0xa58b70],[0,1.76,4.86,6.84,1.27,.18,walnut]];
    for(const x of [-3.636,3.636])parts.push([x,.028,0,.144,3.17,.305,dark],[x,.03,1.99,.138,.98,4,dark]);
  }else if(key==='lights'){
    const balls=[];
    for(let i=0;i<6;i++){
      const g=new T.SphereGeometry(.164,10,6);g.translate((i-2.5)*1.04,.166,0);
      const cols=new Float32Array(g.attributes.position.count*3),color=new T.Color(0xfff7df);
      for(let j=0;j<cols.length;j+=3)color.toArray(cols,j);
      g.setAttribute('color',new T.BufferAttribute(cols,3));balls.push(g);
    }
    const g=mergeGeometries(balls);balls.forEach(ball=>ball.dispose());proxies.set(key,g);return g;
  }else if(key==='stock'){
    for(let i=0;i<50;i++)for(let j=0;j<2;j++)parts.push([(Math.floor(i/5)-4.5)*.683+(i%5-2)*.113,.021+j*.579,0,.092,.380,.082,0xe5d888]);
  }else if(key==='bar'){
    parts=[[0,.02,0,6.02,.89,1.025,walnut],[0,.912,-.022,6.08,.121,1.101,0xc5ada3],
      [0,1.027,-.022,6.095,.039,1.115,0xd7c2b6],[0,.541,-.696,5.54,.028,.027,0xbc9961],
      [-.575,1.581,-.235,4.47,.014,.014,0x718f86]];
    for(let j=0;j<8;j++)parts.push([(j-3.5)*.741,.158,-.533,.682,.56,.062,0x967c6a]);
  }else if(key==='wells'){
    for(let i=0;i<10;i++)for(let j=0;j<2;j++)parts.push([(4.5-i)*.425,.009,(j-.5)*.39,.29,.065,.27,0xadb5af],
      [(4.5-i)*.425,.074,(j-.5)*.39,.06,.042,.052,0xe3e6da],[(4.5-i)*.425+(j?.109:-.098),.024,-.411,.174,.114,.008,ivory]);
  }else if(key==='menu'){
    parts=[[0,0,0,3.2,.79,.083,walnut]];
    for(let i=0;i<20;i++)parts.push([(2-i%5)*.617,.577-Math.floor(i/5)*.167,-.059,.581,.117,.018,0xf6edce]);
  }else if(key==='brand'){
    parts=[[.78,.147,0,1.21,.15,.021,0x79dff3],[-.78,.147,0,1.21,.15,.021,0x79dff3],
      [0,.207,-.008,.20,.143,.028,0xe3a2b2],[0,.066,-.008,.14,.13,.028,0xecdeb0]];
  }else if(key==='back'){
    parts=[[0,.019,0,6.64,.906,.72,0x6c5745],[0,.919,-.007,6.72,.044,.755,0xa6aea8],
      [1.91,.967,0,.91,.5,.47,0xa6aea8],[1.185,.965,0,.21,.47,.26,dark],[.54,.965,0,.78,.182,.25,ivory]];
  }else if(key==='packs'){
    parts=[[-2.61,.014,.16,.13,.31,.13,ivory],[-2.44,.014,.16,.13,.31,.13,0x19314b],
      [2.4,.19,.1,.38,.27,.07,ivory],[2.4,.236,.059,.315,.186,.005,0x354445],
      [-.52,.039,.306,.314,.374,.018,0xf6edce]];
    for(let j=0;j<4;j++)parts.push([.78,.014+j*.095,.27,.258,.095,.172,ivory],[.78,.027+j*.095,.179,.113,.073,.006,j%2?0x19314b:0xd99180]);
  }else parts=[[.035,.012,-.033,.114,.107,.114,0x19314b],[.064,.111,-.033,.077,.066,.09,0x9eba78],
    [.01,.111,-.033,.077,.072,.09,0xd78b9e],[-.197,.04,.007,.06,.16,.06,0xc89c55],
    [-.197,.20,.007,.104,.083,.103,0xf1e6c7],[.24,.008,.027,.102,.14,.102,0x775b45]];
  const g=boxSilhouette(T,parts);proxies.set(key,g);return g;
}
async function coneDisplay(T,file){
  const [[surface],{poses}]=await Promise.all([loadArchitecture(file),import('./stock-layout.js')]);
  if(!poses.length)return [surface];
  surface.updateWorldMatrix(true,false);
  const prototype=surface.geometry.clone();
  // The decode matrices in a quantized glTF may put the source point outside the [-1, 1] integer range.
  for(const attr of ['position','normal']){
    const packed=prototype.getAttribute(attr);
    if(!packed||packed.array instanceof Float32Array)continue;
    const values=new Float32Array(3*packed.count);
    for(let j=0;j<packed.count;j++){
      values[j*3]=packed.getX(j);values[j*3+1]=packed.getY(j);values[j*3+2]=packed.getZ(j);
    }
    prototype.setAttribute(attr,new T.BufferAttribute(values,3));
  }
  prototype.applyMatrix4(surface.matrixWorld);
  const move=new T.Matrix4(),copies=poses.map(values=>{
    if(values.length===3)move.makeTranslation(...values);
    else move.fromArray(values);
    return prototype.clone().applyMatrix4(move);
  });
  const assembled=mergeGeometries(copies);
  for(const copy of copies)copy.dispose();
  prototype.dispose();
  return [new T.Mesh(assembled,surface.material)];
}
function counterGlass(K,where,angle){
  const T=K.THREE;
  if(!glazing){
    const geo=new T.BufferGeometry();geo.setAttribute('position',new T.Float32BufferAttribute(glass.vertices,3));geo.setIndex(glass.indices);geo.computeVertexNormals();
    const mat=new T.MeshLambertMaterial({color:0xc6dfd7,opacity:.093,transparent:true,depthWrite:false,side:T.DoubleSide});
    mat.forceSinglePass=true;glazing=new T.Mesh(geo,mat);
  }
  const mesh=glazing.clone();mesh.name='젤라띠 · '+names.glass;mesh.position.set(...where);mesh.rotation.y=angle;K.addMesh(mesh);
}
export function gelatiShop(K,{P,R,lbox,lwall,lzone},s0,t0,s1,t1){
  const T=K.THREE,mid=(s0+s1)/2,hwidth=(s1-s0)/2,depth=t1-t0,angle=R+Math.PI/2;
  const W=(x,d)=>P(mid-x,t0+d),at=(x,d,h)=>{const[xx,zz]=W(x,d);return[xx,h,zz];};
  const poly=(lo,a,hi,b)=>[W(lo,a),W(lo,b),W(hi,b),W(hi,a)];
  const [ox,oz]=W(0,0),cs=Math.cos(angle),sn=Math.sin(angle);
  const local=p=>[(p.x-ox)*cs-(p.z-oz)*sn,(p.x-ox)*sn+(p.z-oz)*cs];
  for(const x of [-hwidth,hwidth])lwall(mid-x,t0,mid-x,t1,0,3.5,{mat:0x423932,thick:.112});
  lwall(s0,t1,s1,t1,0,3.5,{mat:0x876d54,thick:.112});
  const inv={skip:['top','bottom','n','s','e','w']};
  function solid(x,d,w,dep,base,height){lbox(mid-x,t0+d,w,dep,base,height,0,inv);}
  solid(-.15,1.75,6.09,1.115,.035,1.05);
  const [railLeft,railRight]=[W(-2.92,1.054),W(2.62,1.054)];
  K.phys.addWall(...railLeft,...railRight,.575,.605,.018,'centralcity');
  solid(-.715,1.62,4.49,.63,1.073,.515);solid(0,4.37,6.71,.75,.022,.949);
  // A customer can approach the whole open counter. A low side return marks the staff opening.
  lbox(mid-3.22,t0+2.49,.96,.137,.03,.99,0x302d28);
  lzone(s0,t0,s1,t1,{name:'젤라띠젤라띠',floor:'1F',sub:'파미에스테이션 1층 22번',y0:0,y1:3.72,priority:9});
  const groups=[
    ['shell',0,0,.003,26,32,1.64,[-hwidth,-.15,hwidth,depth],[[0,.12],[2.5,.23],[-2.5,.23]]],
    ['brand',1.73,.14,2.42,24,29,.25,[.28,.095,3.18,.20],[[1.73,.14]]],
    ['lights',0,2.27,2.418,11.8,13.5,.17,[-2.80,2.09,2.80,2.45],[[-2.2,2.27],[0,2.27],[2.2,2.27]]],
    ['bar',-.15,1.75,.035,13,15.5,1.04,[-3.25,1.01,2.92,2.34],[[-2.5,1.26],[1.91,1.26]]],
    ['wells',-.72,1.735,1.106,5.1,6.10,.10,[-2.85,1.26,1.40,2.16],[[-2.12,1.52],[.90,1.52]]],
    ['menu',-1.43,1.77,2.007,9.8,11.5,.39,[-3.08,1.65,.19,1.83],[[-1.43,1.65]]],
    ['stock',0,4.704,1.811,10.6,12.0,.53,[-3.46,4.63,3.46,4.79],[[-2.24,4.70],[0,4.70],[2.24,4.70]]],
    ['back',0,4.37,.025,8.6,10.1,.83,[-3.4,3.29,3.4,4.76],[[-2.31,4.01],[1.72,4.01]]],
    ['packs',-.15,1.75,1.107,6.5,7.8,.21,[-2.88,1.80,2.52,2.11],[[-2.7,1.91],[-.62,2.04],[2.25,1.84]]],
    ['serve',1.84,1.273,1.107,3.9,4.75,.14,[1.56,1.14,2.18,1.42],[[1.84,1.27]]]
  ];
  paint??=new T.MeshLambertMaterial({vertexColors:true,side:T.DoubleSide});
  glow??=new T.MeshBasicMaterial({vertexColors:true,side:T.DoubleSide});
  function sight(x,d,targets){
    if(d<=0)return targets.some(([tx,td])=>{const xx=x+(tx-x)*(-d)/(td-d);return Math.abs(xx)<hwidth-.155;});
    return Math.abs(x)<hwidth-.042&&d<depth-.028;
  }
  for(const[key,x,d,h,range,exitRange,eyeHeight,bounds,targets]of groups){
    const visible=p=>{const[x,d]=local(p);return sight(x,d,targets);};
    K.detail({name:'젤라띠 '+names[key],floor:'1F',poly:poly(...bounds),y0:0,y1:3.5,
      visibleFrom:(px,eye,pz)=>eye>-.35&&eye<4.42&&(key==='shell'||visible({x:px,z:pz}))},()=>{
      const mat=key==='brand'||key==='lights'?glow:paint;
      placeSingleDetail(K,{name:'젤라띠 · '+names[key],file:'../gelati/'+key+'.glb',at:at(x,d,h),angle,
        fallback:silhouette(T,key),fallbackMaterial:mat,material:mat,range,exitRange,eyeHeight,
        floorTolerance:key==='brand'||key==='shell'?3.4:2.5,closeVisibleFrom:visible,
        loadSurface:key==='stock'?file=>coneDisplay(T,file):loadArchitecture});
      if(key==='bar')counterGlass(K,at(x,d,h),angle);
    });
  }
}
