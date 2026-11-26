import {boxSilhouette} from '../interior-architecture/box-silhouette.js';
import {placeSingleDetail} from '../interior-architecture/single-detail.js';
import {loadBakedSurface} from '../interior-architecture/baked-surface.js';
import {footprint,names,anchors,tablePositions} from './layout.js';
import {glass} from './glass.js';

const geometries=new Map(),name=k=>'요거트월드 · '+names[k];
let paint,glow,clear;
function silhouette(T,key){
  if(geometries.has(key))return geometries.get(key);
  const white=0xf6f5ef,steel=0xb5bcb8,blue=0x0875c7,oat=0xc8aa70;
  let q=[];
  switch(key){
    case 'room':
      q=[[0,.012,3.1,4.44,.029,6.2,0xa9aba3],[-2.186,.04,3.1,.072,2.77,6.20,white],[0,.04,6.165,4.44,2.77,.07,white],
        [2.178,.04,3.10,.085,.812,6.20,0xd5c9ac],[2.053,.85,3.04,.315,.061,5.94,0xcca56c],[2.017,.04,.13,.37,2.758,.32,0xd5c9ac],
        [-2.137,.05,2.59,.041,.941,5.07,0xb29060],[0,2.809,3.12,4.44,.076,6.17,0xeee7d3],[0,2.68,.017,4.44,.131,.29,0xeee7d3],
        [-3.83,2.81,5.193,3.24,.076,2.014,0xeee7d3],[-5.42,.04,5.193,.073,2.77,2.014,0xeee8da],[-3.838,.04,4.217,3.236,2.77,.065,0xeee8da],[-3.838,.04,6.165,3.236,2.77,.07,0xeee8da],[2.17,2.603,3.1,.10,.15,6.2,white],[-.04,.045,.22,1.08,.008,.57,0x172f58]];
      for(const z of [.07,1.52,3,4.49,6.1])q.push([2.174,.861,z,.078,1.745,.045,white]);
      break;
    case 'front':
      q=[[0,2.226,-.015,3.34,.255,.057,blue],[1.965,2.057,-.225,.069,.361,.415,0x151c23],[2.015,2.365,-.035,.218,.207,.016,blue]];break;
    case 'kiosk':
      q=[[0,.053,0,.48,.042,.40,steel],[0,.093,.016,.329,.591,.178,white],[0,.645,.018,.401,.946,.173,white],[0,.79,-.075,.34,.718,.021,0x151c23],
        [-3.19,.051,.09,.464,.049,.42,0x333a3c],[-3.19,.142,.108,.473,1.581,.026,0x80cce2]];break;
    case 'display':
      q=[[0,.822,-.089,.310,.655,.007,0xf1c4ce],[-3.19,1.51,.085,.39,.099,.006,white]];break;
    case 'tables':
      q=[[0,.712,0,.812,.039,.601,white],[0,.05,0,.087,.655,.087,steel],[0,.044,0,.36,.012,.329,steel]];
      for(const s of [-1,1])q.push([0,.454,s*.506,.393,.035,.374,0xcca56c],[0,.525,s*.690,.408,.198,.039,0xcca56c],
        [-.14,.05,s*.50,.026,.40,.257,steel],[.14,.05,s*.50,.026,.40,.257,steel]);break;
    case 'wall':
      q=[[0,0,0,.032,.46,1.32,0x172f58],[.022,.22,0,.007,.11,.97,blue]];
      for(const z of [-1.06,1.06])q.push([0,-.055,z,.035,.66,.549,0xece7da]);break;
    case 'service':
      q=[[0,.043,0,.620,.814,.663,white],[0,.846,0,.637,.026,.678,white],[0,.871,.167,.59,.20,.26,white],
        [-.153,.873,-.132,.211,.008,.211,steel],[.145,.871,-.121,.234,.047,.287,white]];
      for(const x of [-.174,0,.174])q.push([x,1.07,.165,.119,.008,.119,0x333a3c]);break;
    case 'counter':
      q=[[0,.044,0,4.080,.857,.719,white],[0,.901,-.003,4.142,.036,.782,white],[-.84,.97,.20,.615,.348,.390,steel],
        [-.84,1.187,-.025,.627,.117,.106,steel],[-1.511,1.116,.009,.292,.178,.069,0x333a3c],[.978,1.34,.119,.344,.015,.274,steel]];break;
    case 'screens':
      for(const s of [-1,1])q.push([s*.435,1.996,0,.85,.472,.067,s<0?white:0x252e49],[s*.435,2.468,.02,.024,.287,.024,0x151c23]);break;
    case 'plants':
      q=[[0,.002,-.425,.112,.112,.112,white],[0,.112,-.425,.185,.27,.19,0x448058],[0,.002,.31,.109,.112,.109,0x448058],[0,.122,.31,.19,.113,.19,0xa74449]];break;
    case 'blueberry':
      q=[[0,.004,0,.133,.064,.13,white],[-.017,.047,.014,.058,.031,.055,0xf7eed9],[.031,.05,.019,.050,.020,.045,0x434966],[0,.050,-.03,.073,.014,.042,oat]];break;
    case 'honey':
      q=[[0,.004,0,.133,.064,.13,0x80cce2],[0,.049,.023,.079,.026,.056,0xefb137],[-.003,.05,-.029,.081,.017,.036,0xb8833d]];break;
  }
  const g=boxSilhouette(T,q);geometries.set(key,g);return g;
}
export function placeYogurtWorld(K,P,rotation,y){
  const T=K.THREE,angle=rotation-Math.PI/2,mid=footprint.mid,front=footprint.front;
  const W=(x,d)=>P(front-d,mid+x),at=(x,d,h)=>{const [xx,zz]=W(x,d);return[xx,y+h,zz];};
  const rect=(a,b,c,d)=>[W(a,b),W(c,b),W(c,d),W(a,d)];
  const [ox,oz]=W(0,0),co=Math.cos(angle),si=Math.sin(angle);
  const local=(px,pz)=>[(px-ox)*co-(pz-oz)*si,(px-ox)*si+(pz-oz)*co];
  const wall=(a,b,c,d,bottom,top,r=.024)=>K.phys.addWall(...W(a,b),...W(c,d),y+bottom,y+top,r,'gotomall');
  const solid=(a,b,c,d,h)=>K.phys.addPolyWalls(rect(a,b,c,d),y,y+h,.018,'gotomall');
  wall(-2.186,.02,-2.186,6.16,0,2.81);wall(-2.186,6.16,2.178,6.16,0,2.81);wall(2.178,.09,2.178,6.16,0,2.81);
  wall(-5.42,4.217,-2.186,4.217,0,2.81);wall(-5.42,4.217,-5.42,6.16,0,2.81);wall(-5.42,6.16,-2.18,6.16,0,2.81);
  solid(1.835,-.031,2.201,.290,2.78);wall(1.13,.01,1.838,.01,0,2.65);wall(-1.969,-.65,-1.969,-.017,0,2.31);
  solid(1.342,-.417,1.742,-.205,1.59);solid(-1.882,-.383,-1.415,-.015,1.75);
  solid(-1.886,3.818,-1.251,4.488,1.08);solid(-2.037,5.116,2.037,5.842,.942);
  for(const [x,d] of tablePositions){
    solid(x-.404,d-.298,x+.404,d+.298,.751);
    for(const s of [-1,1]){
      const cd=d+s*.506;
      const seat=rect(x-.183,cd-.178,x+.183,cd+.178);
      K.phys.addSurface(seat,y+.473,{tag:'gotomall'});K.phys.addPolyWalls(seat,y,y+.473,.015,'gotomall');
      wall(x-.195,cd+s*.183,x+.195,cd+s*.183,.47,.704);
    }
  }
  K.phys.addSurface(rect(-2.16,-.01,2.17,6.12),y,{tag:'gotomall'});
  K.zone({name:'요거트월드 반포고투몰점',floor:'B1',sub:'서편 G-012 · 요거트 아이스크림과 그릭요거트',poly:rect(-2.19,-.02,2.19,6.19),y0:y,y1:y+2.82,priority:12});
  function from(x,d,tx,td,exterior){
    if(x>=-2.19&&x<=2.18&&d>=0&&d<=6.16)return !exterior||d<=1.58;
    if(exterior)return d<=0||x>2.18&&d<1.54;
    if(d<0){
      const atFront=x+(tx-x)*d/(d-td);
      if(atFront>-2.15&&atFront<2.15)return true;
    }
    if(x>2.18){
      const atGlass=d+(td-d)*(2.18-x)/(tx-x);
      return atGlass>.14&&atGlass<6.07;
    }
    return false;
  }
  paint??=new T.MeshLambertMaterial({vertexColors:true,side:T.DoubleSide});
  glow??=new T.MeshBasicMaterial({vertexColors:true,side:T.DoubleSide});
  if(!clear){
    const g=new T.BufferGeometry();g.setAttribute('position',new T.Float32BufferAttribute(glass.positions,3));g.setIndex(glass.indices);g.computeVertexNormals();
    const mat=new T.MeshLambertMaterial({color:0xbfd0ce,transparent:true,opacity:.055,side:T.DoubleSide,depthWrite:false});mat.forceSinglePass=true;
    clear={g,mat};
  }
  const window=new T.Mesh(clear.g,clear.mat);window.name=name('glass');window.position.set(...at(0,0,0));window.rotation.y=angle;K.addMesh(window);
  function put(key,pos,bounds,range,exit,eye,targets,moves){
    const ex=key==='front'||key==='kiosk'||key==='display';
    const seen=(px,pz)=>{const [x,d]=local(px,pz);return targets.some(([tx,td])=>from(x,d,tx,td,ex));};
    K.detail({name:name(key),floor:'B1',poly:rect(...bounds),y0:y,y1:y+2.86,
      visibleFrom:(px,py,pz)=>py>y-.55&&py<y+3.42&&(key==='room'||seen(px,pz))},()=>{
      const baked=key==='room'||key==='counter',mat=['front','wall','screens','display'].includes(key)?glow:paint;
      placeSingleDetail(K,{name:name(key),file:'../gotomall-yogurtworld/'+key+'.glb',at:at(...pos),angle,
        fallback:silhouette(T,key),fallbackMaterial:mat,material:baked?null:mat,loadSurface:baked?q=>loadBakedSurface(T,q):undefined,
        range,exitRange:exit,floorTolerance:3.26,eyeHeight:eye,translations:moves,closeVisibleFrom:p=>seen(p.x,p.z)});
    });
  }
  for(const [key,box,range,exit,eye,points] of [
    ['room',[-5.46,-.66,2.23,6.21],12.2,15.5,1.32,[[0,.10],[0,3],[1.9,4.81]]],
    ['front',[-1.82,-.46,2.13,.09],19,23,2.33,[[0,.01],[1.96,-.22]]],
    ['kiosk',[-1.91,-.53,1.80,.0],9,11,.95,[[1.54,-.32],[-1.65,-.21]]],
    ['display',[-1.91,-.43,1.76,-.15],5.25,7.1,1.13,[[1.54,-.42],[-1.65,-.23]]],
    ['wall',[-2.18,.83,-2.06,3.59],8.2,10,.22,[[-2.12,2.21]]],
    ['service',[-1.9,3.80,-1.24,4.5],5.5,7.1,.92,[[-1.57,4.10]]],
    ['counter',[-2.08,5.04,2.08,5.90],9.5,12,1.11,[[0,5.14],[1.62,5.43]]],
    ['screens',[-.88,5.40,.88,5.55],9.3,11.2,2.23,[[0,5.48]]],
    ['plants',[1.84,2.70,2.17,3.65],6.2,8.0,.22,[[2.015,2.80],[2.015,3.50]]],
    ['blueberry',[1.30,1.79,1.48,1.97],3.25,4.1,.067,[[1.39,1.88]]],
    ['honey',[-1.47,2.21,-1.29,2.39],3.25,4.1,.067,[[-1.38,2.30]]],
  ])put(key,anchors[key],box,range,exit,eye,points);
  for(const t of [-1,1]){
    const points=tablePositions.filter(([x])=>x*t>0),x=points[0][0],zs=points.map(p=>p[1]);
    put('tables',[x,0,0],[x-.42,Math.min(...zs)-.73,x+.42,Math.max(...zs)+.73],8.9,10.5,.71,points,points.map(([,d])=>[0,0,d]));
  }
}
