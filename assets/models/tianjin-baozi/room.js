import {placeSingleDetail} from '../interior-architecture/single-detail.js';
import {boxSilhouette} from '../interior-architecture/box-silhouette.js';
import {loadBakedSurface} from '../interior-architecture/baked-surface.js';
import {names,anchors,panes,wallTables,stoolRows,rotations} from './layout.js';
import {glass,coolerGlass} from './glass.js';

const coarse=new Map(),name=key=>'천진포자 · '+names[key];
let paint,emission,glazing,water;
function proxy(T,key){
  if(coarse.has(key))return coarse.get(key);
  const wood=0xa8794a,honey=0xb98f60,brass=0xb49151,cream=0xe6dfca,stone=0xae9e86,ink=0x263635;
  let p=[];
  switch(key){
    case 'shell':
      p=[[0,.020,4.815,12.06,.027,9.63,0xb6a78f],[0,.045,9.56,12.06,3.5,.098,cream],
        [5.755,.045,4.815,.105,3.5,9.63,cream],[-5.985,.045,4.815,.074,3.50,9.63,cream],
        [0,3.532,4.815,12.06,.115,9.63,0xe4d9c2],[-5.50,.05,5.045,.78,.427,7.96,0xd4c9ad],[-5.836,.454,5.05,.16,.47,7.97,0xd4c9ad]];
      break;
    case 'entry':
      p=[[0,2.677,.016,12.04,.902,.237,0x233738],[0,2.614,-.081,12.05,.073,.114,wood],
        [0,.048,.392,1.68,.008,.46,0x404348]];
      for(const x of [-6,-.99,.99,6])p.push([x,.047,.032,.075,2.58,.116,wood]);
      for(const side of [-1,1]){
        p.push([side*3.5,.042,0,5.02,.083,.124,wood]);
        for(let i=1;i<5;i++)p.push([side*(.99+i),.106,.026,.044,2.506,.09,wood]);
      }
      break;
    case 'brand':
      p=[[0,-.02,.024,2.65,.75,.115,ink],[-.01,.161,-.057,1.59,.256,.012,0xd7b77d]];break;
    case 'grille':
      for(const x of [-.43,.43])p.push([x,.166,-.028,.015,2.38,.014,brass]);
      for(const h of [.17,.61,.68,.825,1.44,2.32,2.54])p.push([0,h,-.028,.85,.016,.014,brass]);
      break;
    case 'keeperL':case 'keeperR':
      p=[[0,.032,0,.762,.304,.656,0x303a39],[0,.335,0,.52,1.29,.44,stone],[0,1.63,0,.41,.42,.36,stone],
        [0,2.02,0,.54,.25,.43,stone],[0,1.15,-.218,.29,.22,.13,stone]];break;
    case 'communal':
      p=[[0,.878,0,1.22,.055,3.94,honey]];
      for(const d of [-1.91,0,1.91])for(const x of [-.55,.55])p.push([x,.05,d,.068,2.91,.08,wood]);
      for(const h of [1.865,2.624])for(const x of [-.55,.55])p.push([x,h,0,.06,.087,3.91,wood]);
      break;
    case 'stock':
      p=[[.08,2.67,-1.39,.34,.36,.21,0xcab181],[-.09,2.66,1.48,.31,.33,.17,0xcab181],[.37,.935,1.61,.20,.06,.20,0xece7d2]];break;
    case 'cooler':
      p=[[0,.049,0,.68,.253,.625,0xe9e7de],[0,.054,.287,.678,1.62,.063,cream],[0,1.63,.001,.68,.061,.62,cream]];
      for(const x of [-.32,.32])p.push([x,.05,.004,.043,1.62,.61,cream]);
      for(const h of [.342,.621,.902,1.180])p.push([0,h,0,.547,.015,.44,0x9ca49c]);break;
    case 'drinks':
      for(let j=0;j<4;j++)for(let i=0;i<5;i++)p.push([(i-2)*.096,.365+j*.28,-.14,.074,.141,.072,[0xa9544e,0xb7a66d,0x709061,0xb8c6ad][(j+i)%4]]);
      break;
    case 'plaque':
      p=[[0,.273,0,2.95,.074,.083,0x684c33],[0,-.03,0,.54,.28,.07,0x79553a],
        [-.93,.026,0,1.04,.057,.079,0x76553b],[.93,.026,0,1.04,.057,.079,0x76553b]];break;
    case 'stool':
      p=[[0,.57,0,.367,.044,.367,honey]];for(const x of [-.14,.14])for(const d of [-.14,.14])p.push([x,.05,d,.041,.52,.041,wood]);break;
    case 'walltable':
      p=[[0,.717,0,.96,.052,1.10,honey],[.903,.44,0,.42,.08,.431,0x5b5346],[1.13,.61,0,.04,.22,.415,wood]];
      for(const x of [-.42,.42])for(const d of [-.47,.47])p.push([x,.05,d,.059,.672,.06,wood]);
      break;
    case 'light':
      for(const [x,d] of [[-4.28,2.34],[-4.28,5.02],[-4.28,7.72],[1.78,4.2],[1.78,6.18]])p.push([x,2.46,d,.49,.38,.49,brass],[x,2.46,d,.47,.01,.47,0xffecd1]);
      break;
    case 'refill':
      p=[[0,.807,0,1.00,.064,.684,wood],[-.186,1.388,-.026,.24,.046,.24,0xb5b7ab],[.18,.872,-.006,.28,.20,.31,0x737e77]];
      for(const x of [-.433,.433])for(const d of [-.277,.277])p.push([x,.05,d,.068,.78,.071,wood]);break;
    case 'jar':
      p=[[-.186,.996,-.026,.245,.39,.245,0xc4d8d2]];break;
    case 'buns':
      p=[[0,.01,0,.343,.071,.343,0xc2a57b],[0,.041,0,.216,.042,.213,0xe8dbbb]];break;
    case 'fried':
      p=[[0,.002,0,.368,.019,.215,0xede7d4]];
      for(let i=0;i<6;i++)p.push([-.11+i*.043,.016,0,.039,.031,.105,0xd1ae71]);break;
    case 'noodles':
      p=[[0,.001,0,.32,.021,.281,0xeee8d9],[0,.017,0,.215,.053,.185,0xb18a48],[-.216,.004,-.041,.082,.018,.073,0xeee8d9]];break;
    case 'pass':
      p=[[0,.053,.16,4.1,.798,.88,0xa3aaa5],[0,.848,.16,4.245,.055,1.019,0xc8d1c9],
        [0,2.55,.509,4.28,.409,.845,0xa8b0ac],[-.57,.904,-.03,1.19,.03,.561,honey],[.6,.904,.14,1.02,.32,.40,0xd1b480]];
      for(const x of [-2.12,2.12])p.push([x,.048,.452,.085,2.958,.117,wood]);break;
    default:p=[[0,.051,.04,.39,.034,.317,ink],[0,.08,.02,.048,.79,.05,ink],[0,.865,-.04,.62,.446,.035,cream]];
  }
  const geo=boxSilhouette(T,p);coarse.set(key,geo);return geo;
}

function placeWindows(K,at,angle){
  const T=K.THREE;
  if(!glazing){
    const close=source=>{const g=new T.BufferGeometry();g.setAttribute('position',new T.Float32BufferAttribute(source.vertices,3));
      g.setIndex(source.indices);g.computeVertexNormals();return g;};
    const material=new T.MeshLambertMaterial({color:0xbacbc9,opacity:.057,transparent:true,side:T.DoubleSide,depthWrite:false});
    material.forceSinglePass=true;glazing={glass:close(glass),coolerGlass:close(coolerGlass),material};
  }
  const matrix=new T.Matrix4();
  for(const [key,moves] of [['glass',panes.filter(x=>x<0).map(x=>[x,0,0])],
    ['glass',panes.filter(x=>x>0).map(x=>[x,0,0])],['coolerGlass',[[0,0,0]]]]){
    const group=new T.InstancedMesh(glazing[key],glazing.material,moves.length);
    group.name=name(key);group.position.set(...at(...anchors[key]));group.rotation.y=angle;
    moves.forEach((p,i)=>group.setMatrixAt(i,matrix.makeTranslation(...p)));group.computeBoundingSphere();
    group.userData.nativePlacementInstances=true;K.addMesh(group);
  }
}
export function tianjinShop(K,{P,R,lzone},s0,t0,s1,t1){
  const T=K.THREE,mid=(s0+s1)/2,angle=R-Math.PI/2;
  const W=(x,d)=>P(mid+x,t1-d),at=(x,d,h)=>{const [xx,zz]=W(x,d);return[xx,h,zz];};
  const rect=(a,d,b,e)=>[W(a,d),W(b,d),W(b,e),W(a,e)];
  const [ox,oz]=W(0,0),c=Math.cos(angle),s=Math.sin(angle);
  const local=p=>[(p.x-ox)*c-(p.z-oz)*s,(p.x-ox)*s+(p.z-oz)*c];
  const wall=(x,d,xx,dd,top,r=.035)=>K.phys.addWall(...W(x,d),...W(xx,dd),0,top,r,'centralcity');
  const solid=(x,d,xx,dd,top)=>K.phys.addPolyWalls(rect(x,d,xx,dd),0,top,.021,'centralcity');
  const seat=(x,d,xx,dd,h)=>{const p=rect(x,d,xx,dd);K.phys.addSurface(p,h,{tag:'centralcity'});K.phys.addPolyWalls(p,0,h,.016,'centralcity');};
  wall(-6,.028,-.99,.028,2.68);wall(.99,.028,6,.028,2.68);
  wall(-6,.03,-6,9.59,3.54);wall(5.755,.03,5.755,9.59,3.54);wall(-6,9.59,6,9.59,3.54);
  for(const key of ['keeperL','keeperR']){const [x,d]=anchors[key];solid(x-.371,d-.32,x+.371,d+.32,2.27);}
  solid(-2.81,-.43,-2.43,-.14,1.31);solid(.75,1.69,1.76,2.37,1.46);
  solid(1.10,3.23,2.36,7.19,2.95);solid(4.43,3.71,5.57,7.94,1.06);solid(2.93,1.48,3.61,2.12,1.69);
  for(const [x,d] of wallTables){solid(x-.48,d-.55,x+.48,d+.55,.77);seat(x+.69,d-.212,x+1.12,d+.212,.521);wall(x+1.13,d-.20,x+1.13,d+.20,.82);}
  for(const d of [2.34,5.02,7.72])seat(-5.89,d-1.26,-5.09,d+1.26,.477);
  for(const [x,d] of stoolRows)solid(1.73+x-.154,5.21+d-.154,1.73+x+.154,5.21+d+.154,.613);
  K.phys.addSurface(rect(-5.98,-.04,5.98,9.59),0,{tag:'centralcity'});
  lzone(s0,t0,s1,t1,{name:'천진포자',place:'famille',floor:'1F',sub:'파미에스테이션 116호 · 만두 전문점',y0:0,y1:3.75,priority:23});
  const inside=(x,d)=>x>-5.99&&x<5.78&&d<9.57;
  function sees(p,tx,td,exterior){
    const [x,d]=local(p);
    if(d>=.025)return inside(x,d)&&(exterior?d<4.5:true);
    if(exterior)return true;
    const projected=x+(tx-x)*(.025-d)/(td-d);
    return projected>-5.94&&projected<5.94;
  }
  paint??=new T.MeshLambertMaterial({vertexColors:true,side:T.DoubleSide});
  emission??=new T.MeshBasicMaterial({vertexColors:true,side:T.DoubleSide});
  water??=new T.MeshLambertMaterial({vertexColors:true,transparent:true,opacity:.29,side:T.DoubleSide,depthWrite:false});water.forceSinglePass=true;
  function place(key,x,d,h,bounds,range,exitRange,eyeHeight,targets,translations){
    const exterior=['entry','brand','grille','keeperL','keeperR','menu'].includes(key);
    const visible=p=>{
      if(key==='drinks'&&local(p)[1]>anchors.cooler[1]-.19)return false;
      return targets.some(([tx,td])=>sees(p,tx,td,exterior));
    };
    const baked=key==='shell'||key==='communal',lit=key==='brand',mat=key==='jar'?water:lit?emission:paint;
    K.detail({name:name(key),floor:'1F',poly:rect(...bounds),y0:0,y1:3.68,
      visibleFrom:(px,y,pz)=>y>-.52&&y<4.12&&(key==='shell'||key==='entry'||visible({x:px,z:pz}))},()=>{
      placeSingleDetail(K,{name:name(key),file:'../tianjin-baozi/'+key+'.glb',at:at(x,d,h),angle:angle+(rotations[key]??0),translations,
        fallback:proxy(T,key),fallbackMaterial:mat,material:baked?null:mat,loadSurface:baked?file=>loadBakedSurface(T,file):undefined,
        range,exitRange,eyeHeight,floorTolerance:3.68,closeVisibleFrom:visible});
    });
  }
  for(const [key,bounds,range,exit,height,targets] of [
    ['entry',[-6,-.18,6,.22],20,25,1.8,[[0,.1]]],['brand',[-1.32,-.30,1.40,-.10],21,25,.33,[[.05,-.16]]],
    ['shell',[-6,.01,6,9.61],17,20,1.56,[[0,2],[2.1,4.5],[-3.2,5.8]]],
    ['keeperL',[1.16,-.58,1.93,.1],8.8,11,1.35,[[1.54,-.25]]],['keeperR',[-1.95,-.58,-1.18,.1],8.8,11,1.35,[[-1.57,-.25]]],
    ['communal',[1.10,3.22,2.36,7.21],10.7,13,.99,[[1.73,3.35],[1.73,6.7]]],
    ['stock',[1.23,3.46,2.25,6.95],6.8,8.4,2.49,[[1.81,3.83],[1.64,6.70]]],
    ['cooler',[2.91,1.42,3.63,2.13],8,10,.97,[[3.27,1.50]]],['drinks',[2.98,1.56,3.56,1.96],4.7,5.9,.92,[[3.27,1.64]]],
    ['plaque',[-5.91,3.60,-5.77,6.55],8.8,11,.16,[[-5.85,5.08]]],
    ['light',[-4.6,.8,5.1,7.92],14,17,2.85,[[-4.28,2.34],[1.78,4.2]]],
    ['refill',[.74,1.68,1.78,2.41],7.2,9,.94,[[1.26,2.03]]],['jar',[.91,1.85,1.23,2.17],5.1,6.6,1.18,[[1.08,2.00]]],
    ['buns',[-4.46,2.12,-4.05,2.56],4.1,5.3,.055,[[-4.26,2.33]]],['fried',[1.16,3.72,1.58,4.0],4.1,5.3,.032,[[1.37,3.86]]],
    ['noodles',[-4.57,4.80,-4.02,5.15],4.15,5.4,.066,[[-4.28,4.98]]],['pass',[4.43,3.62,5.60,8.03],8.7,11,1.53,[[4.65,4.45],[4.65,7.12]]],
    ['menu',[-2.94,-.55,-2.3,-.12],6,8,1.03,[[-2.62,-.29]]],
  ]){const [x,d,h]=anchors[key];place(key,x,d,h,bounds,range,exit,height,targets);}
  for(const side of [-1,1]){
    const points=panes.filter(x=>x*side>0),center=side*3.49;
    place('grille',center,0,0,[Math.min(...points)-.48,-.05,Math.max(...points)+.48,.05],12,15,1.36,[[center,0]],
      points.map(x=>[x-center,0,0]));
  }
  const [cx,cd]=anchors.communal;
  for(const side of [-1,1]){
    const rows=stoolRows.filter(([x])=>x*side>0),sx=cx+rows[0][0];
    place('stool',sx,cd,0,[sx-.21,cd-1.65,sx+.21,cd+1.66],8,10,.46,[[sx,cd-1.33],[sx,cd+1.34]],rows.map(([,d])=>[0,0,d]));
  }
  for(const [x,d] of wallTables)place('walltable',x,d,0,[x-.51,d-.58,x+1.18,d+.58],9.5,12,.70,[[x,d]]);
  placeWindows(K,at,angle);
}
