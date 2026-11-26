import {boxSilhouette} from '../interior-architecture/box-silhouette.js';
import {placeSingleDetail} from '../interior-architecture/single-detail.js';
import {names,anchors} from './layout.js';
import {glass} from './glass.js';
import {loadBakedSurface} from '../interior-architecture/baked-surface.js';

let paint,glow,windowMesh;
const proxies=new Map();
const black=0x282b2a,wood=0xb38a5b,stone=0xe2d9c3,silver=0xa3aaa4;

function silhouette(T,key){
  if(proxies.has(key))return proxies.get(key);
  let parts=[];
  switch(key){
    case 'entry':
      parts=[[0,2.42,0,4.36,.39,.18,black],[0,2.825,.016,4.36,.407,.13,0xb39e81],
        [.682,.019,.025,.33,2.39,.105,stone],[1.49,.014,.028,1.30,.673,.105,wood],
        [-.95,.018,.026,.49,2.38,.118,stone],[-1.51,2.20,.07,1.27,.20,.101,stone]];
      for(const x of [-2.14,-1.247,-.68,.49,.845,1.466,2.14])parts.push([x,.019,.006,.05,2.39,.133,black]);
      for(const [lo,hi] of [[.49,2.14],[-1.22,-.70]])
        for(let x=lo+.034;x<hi;x+=.095)parts.push([x,.046,-.05,.028,.642,.039,0xc39b6e]);
      break;
    case 'brand':
      parts=[[-.32,.12,0,.74,.10,.018,0xf3eeee],[.66,.05,0,.32,.23,.016,0xf3eeee],
        [.028,.077,0,.238,.213,.022,0xd94d41]];
      break;
    case 'room':
      parts=[[0,.004,1.38,4.32,.019,2.75,0x64675e],[0,.019,2.719,4.30,2.85,.069,stone],
        [2.135,.019,1.38,.064,2.85,2.76,stone],[-2.144,.02,1.38,.051,2.84,2.76,0xb6ab95],
        [-.803,.02,1.055,.064,2.84,1.69,stone],[0,2.86,1.38,4.30,.075,2.75,stone],
        [2.09,.69,1.38,.03,.47,2.68,0x62645c]];
      break;
    case 'lamps':
      parts=[[2.041,2.832,1.51,.026,.009,2.30,0xffeed0]];
      for(const [x,d] of [[.05,.63],[.05,1.59],[.05,2.48],[1.49,1.13],[1.49,2.37]])parts.push([x,2.842,d,.069,.005,.069,0xffeed0]);
      break;
    case 'table':
      parts=[[0,.724,0,.888,.045,1.154,0xc8a371],[.597,.06,.005,.338,.33,1.63,0x674a37],
        [.58,.38,.005,.48,.104,1.61,0x55534b],[.796,.465,.005,.105,.396,1.61,0x777368],
        [-.575,.423,.178,.355,.038,.376,wood],[-.79,.62,.178,.037,.177,.367,wood]];
      for(const [x,d] of [[-.214,-.193],[.214,.209]])parts.push([x,.769,d,.267,.005,.267,black]);
      for(const x of [-.338,.338])for(const d of [-.479,.479])parts.push([x,.02,d,.056,.703,.06,0x76533e]);
      break;
    case 'service':
      parts=[[0,.001,.032,.29,.012,.136,black],[-.087,.014,.031,.073,.097,.09,wood],
        [-.087,.113,.031,.050,.058,.052,stone],[.09,.015,.071,.113,.10,.062,black],[-.208,.003,.041,.065,.199,.066,silver]];
      break;
    case 'cabinet':
      parts=[[0,.015,.014,.927,.126,.341,black],[0,.14,.175,.926,1.99,.029,black],[0,1.35,.11,.60,.255,.043,black]];
      for(const x of [-.455,.455])parts.push([x,.131,-.004,.026,1.996,.366,black]);
      for(const h of [.268,.59,.922,1.266,1.676,2.095])parts.push([0,h,-.005,.896,.023,.342,wood]);
      break;
    case 'samples':
      for(let i=0;i<3;i++)for(let j=0;j<2;j++)parts.push([(i-1)*.249,.316+j*.335,-.036,.166,.088,.098,0xe2d7bc]);
      parts.push([.122,.954,-.038,.217,.012,.130,black],[.123,.968,-.046,.167,.046,.084,0xbf7464]);
      break;
    case 'menu':
      parts=[[0,.004,.013,.304,.022,.239,black],[0,.026,.022,.041,.84,.042,black],
        [0,.876,-.041,.367,.27,.014,stone,.50]];
      break;
    case 'pot':
      parts=[[0,.005,0,.19,.076,.18,black],[-.013,.075,0,.112,.036,.093,0xc8cb94],[.042,.077,-.021,.052,.038,.058,0xbb7668]];
      break;
    case 'zaru':
      parts=[[0,.001,0,.177,.018,.215,0x884e40],[0,.022,0,.157,.014,.194,0xd1bf89],
        [0,.035,0,.115,.019,.152,0xe7d8ad],[-.153,.002,.003,.105,.01,.186,black],[-.153,.016,0,.080,.027,.09,0xb6544c]];
      break;
    default:
      parts=[[0,.004,0,.183,.062,.181,0xe3ddcb],[0,.052,0,.156,.009,.153,0x795b3e],
        [0,.073,-.005,.117,.044,.039,0xce9d5d],[.012,.092,0,.037,.043,.095,0xe0b46f]];
  }
  const result=boxSilhouette(T,parts);proxies.set(key,result);return result;
}

function addGlass(K,origin,angle){
  const T=K.THREE;
  if(!windowMesh){
    const geometry=new T.BufferGeometry();
    geometry.setAttribute('position',new T.Float32BufferAttribute(glass.vertices,3));
    geometry.setIndex(glass.indices);geometry.computeVertexNormals();
    const material=new T.MeshLambertMaterial({color:0xb6c8bd,opacity:.076,transparent:true,depthWrite:false,side:T.DoubleSide});
    material.forceSinglePass=true;windowMesh=new T.Mesh(geometry,material);
  }
  const part=windowMesh.clone();part.name='와라쿠 · '+names.glass;part.position.set(...origin);part.rotation.y=angle;
  K.addMesh(part);
}

export function warakuShop(K,{P,R,lzone},s0,t0,s1,t1){
  const T=K.THREE,front=s1+.42,mid=(t0+t1-.34)/2,angle=R+Math.PI;
  const W=(x,d)=>P(front-d,mid-x),at=(x,d,h)=>{const [xx,zz]=W(x,d);return [xx,h,zz];};
  const poly=(x0,d0,x1,d1)=>[W(x0,d0),W(x1,d0),W(x1,d1),W(x0,d1)];
  const [ox,oz]=W(0,0),c=Math.cos(angle),s=Math.sin(angle);
  const local=p=>[(p.x-ox)*c-(p.z-oz)*s,(p.x-ox)*s+(p.z-oz)*c];
  // The right edge meets an established gate column. All restaurant fixtures stay on its shop side.
  function wall(x,d,xx,dd,top,rad=.023,base=0){K.phys.addWall(...W(x,d),...W(xx,dd),base,top,rad,'centralcity');}
  function solid(x0,d0,x1,d1,h){K.phys.addPolyWalls(poly(x0,d0,x1,d1),0,h,.017,'centralcity');}
  wall(-2.15,.01,-.64,.01,2.42);wall(.46,.01,2.15,.01,2.42);
  wall(-2.15,.04,-2.15,2.73,2.85);wall(2.145,.04,2.145,2.73,2.85);wall(-2.15,2.73,2.15,2.73,2.85);
  wall(-.803,.21,-.803,1.90,2.85);
  solid(-2.111,-.247,-1.193,.104,2.12);
  solid(-1.073,-.46,-.76,-.209,1.12);
  solid(.774,1.19,1.64,2.34,.793);solid(1.55,.96,2.04,2.565,.882);
  solid(.39,1.73,.82,2.15,.844);
  K.phys.addSurface(poly(-2.17,-.08,2.17,front-s0+.04),0,{tag:'centralcity'});
  lzone(front-2.75,mid-2.16,front,mid+2.15,{name:'와라쿠샤샤',place:'famille',floor:'1F',sub:'파미에스테이션 114호 · 앞쪽 2인석',y0:0,y1:3.36,priority:23});

  const pieces=[
    ['entry',21,25,1.48,[-2.18,-.02,2.18,.31],[[0,.06]]],
    ['brand',20,25,.17,[-.89,-.13,.99,-.08],[[.05,-.10]]],
    ['room',12,14.8,1.22,[-2.17,.01,2.17,2.77],[[1.19,1.70],[-.10,1.88]]],
    ['lamps',9.1,11.3,2.84,[0,.59,2.08,2.54],[[.05,1.59],[1.49,1.13]]],
    ['table',10.3,12.1,.66,[.38,.93,2.04,2.61],[[1.22,1.46],[1.43,1.93]]],
    ['service',4.1,5.3,.12,[.88,2.13,1.30,2.31],[[1.06,2.18]]],
    ['pot',3.7,4.7,.079,[.84,1.44,1.13,1.70],[[.986,1.567]]],
    ['zaru',3.7,4.7,.03,[1.12,1.21,1.61,1.61],[[1.45,1.47]]],
    ['tempura',3.7,4.7,.07,[1.30,1.84,1.53,2.09],[[1.414,1.969]]],
    ['cabinet',10.2,13,1.0,[-2.12,-.26,-1.18,.12],[[-1.65,-.26]]],
    ['samples',4.1,5.4,.74,[-2.03,-.21,-1.27,.08],[[-1.65,-.17]]],
    ['menu',5.8,7.3,.91,[-1.11,-.52,-.73,-.20],[[-.92,-.36]]]
  ];
  const outside=new Set(['entry','brand','cabinet','samples','menu']);
  function seen(key,p,targets){
    const [x,d]=local(p);
    if(outside.has(key))return d<.16;
    if(d<.04)return targets.some(([tx,td])=>{
      const edge=x+(tx-x)*(.04-d)/(td-d);
      return(edge>-.614&&edge<.429)||(edge>.864&&edge<2.11);
    });
    return x>-.816&&x<2.11&&d<2.696;
  }
  paint??=new T.MeshLambertMaterial({vertexColors:true,side:T.DoubleSide});
  glow??=new T.MeshBasicMaterial({vertexColors:true,side:T.DoubleSide});
  for(const [key,range,exitRange,eyeHeight,bounds,targets] of pieces){
    const [x,d,h]=anchors[key];
    const visible=p=>seen(key,p,targets);
    K.detail({name:'와라쿠 '+names[key],floor:'1F',poly:poly(...bounds),y0:0,y1:3.43,
      visibleFrom:(px,eye,pz)=>eye>-.52&&eye<4.01&&(key==='entry'||visible({x:px,z:pz}))},()=>{
      const material=key==='brand'||key==='lamps'?glow:paint;
      const baked=key==='room'||key==='table';
      placeSingleDetail(K,{name:'와라쿠 · '+names[key],file:'../waraku/'+key+'.glb',at:at(x,d,h),angle,
        fallback:silhouette(T,key),fallbackMaterial:material,material:baked?null:material,range,exitRange,eyeHeight,
        loadSurface:baked?file=>loadBakedSurface(T,file):undefined,
        floorTolerance:key==='brand'||key==='entry'?3.25:2.25,closeVisibleFrom:visible});
      if(key==='entry')addGlass(K,at(...anchors.glass),angle);
    });
  }
}
