import {mergeGeometries} from 'three/addons/utils/BufferGeometryUtils.js';
import {boxSilhouette} from '../interior-architecture/box-silhouette.js';
import {placeSingleDetail} from '../interior-architecture/single-detail.js';
import {loadBakedSurface} from '../interior-architecture/baked-surface.js';
import {bay,outline,parts,tables} from './layout.js';
const white=0xeeeee5,red=0xb75b4c,oak=0xc8a569,metal=0xb3bab8,black=0x303338;
const shapes={

 front:[[0,2.393,-.028,5.19,.329,.065,white],[.59,2.51,-.067,1.78,.073,.006,0x3e4649],[-1.31,2.52,-.067,.44,.079,.01,0x3e4649],[2.59,2.26,-.01,.218,.17,.032,0x6b889b]],
 heart:[[-.011,1.34,0,.034,.43,.60,white],[-.011,1.22,0,.034,.13,.27,white],[-.011,1.76,-.22,.034,.145,.34,white],[-.011,1.76,.22,.034,.145,.34,white],[-.125,1.55,-.018,.14,.12,.14,0xb39450]],
 menu:[[2.66,1.22,1.38,.021,.73,1.46,white],[-2.66,1.13,1.95,.021,.99,2.52,white]],
 table:[[0,.685,0,1.25,.074,.72,oak],[.16,.761,.012,.54,.008,.397,0xb78754]],
 tools:[[-.425,.008,-.155,.095,.103,.095,metal],[-.425,.108,-.15,.095,.09,.062,metal],[.44,.013,.199,.083,.162,.083,metal]],
 kitchen:[[0,.93,.424,4.74,1.25,.035,0x545e60],[0,2.09,.23,4.74,.37,.49,metal],[.04,.754,.08,4.47,.061,.59,metal],[.04,1.31,.11,3.69,.038,.411,metal],[-2.37,1.11,.13,.52,.77,.48,metal]],
 cooker:[[0,.66,0,.70,.043,.52,oak],[0,.704,0,.396,.287,.40,metal],[0,.991,0,.43,.072,.43,black],[0,.78,-.21,.157,.139,.016,white]],
 trolley:[[0,.254,0,.954,.032,.62,metal],[0,.785,0,.954,.032,.62,metal],[-.449,.10,-.274,.032,.69,.03,metal],[.449,.10,.274,.032,.69,.03,metal]],
 bibimbap:[[0,.015,0,.212,.082,.212,black],[0,.096,0,.164,.011,.167,0xece0ba],[.003,.108,.014,.078,.010,.067,white],[.004,.117,.015,.033,.01,.033,0xe4ad32]],
 plates:[[.06,.003,.01,.65,.013,.345,metal],[.06,.017,.01,.53,.015,.23,0xe7cd77]],
};
for(const side of [-1,1]){
  shapes.table.push([0,.413,side*.558,.421,.047,.369,0xa44945],[0,.631,side*.752,.422,.18,.028,oak]);
  for(const x of [-.548,.548])shapes.table.push([x,.046,side*.279,.047,.64,.047,black]);
}
const geometry=new Map();let paint,glow;
function roomProxy(T){
  const shapes=[],shape=new T.Shape(outline.map(([x,d])=>new T.Vector2(x,-d)));
  function tint(g,hex){
    const color=new T.Color(hex),values=new Float32Array(g.attributes.position.count*3);
    for(let i=0;i<values.length;i+=3)color.toArray(values,i);
    g.setAttribute('color',new T.BufferAttribute(values,3));shapes.push(g);
  }
  for(const [h,col] of [[.037,0x74777a],[2.766,white]]){
    const surface=new T.ShapeGeometry(shape);surface.rotateX(-Math.PI/2);surface.translate(0,h,0);tint(surface,col);
  }
  for(let i=1;i<outline.length;i++){
    const [a,b]=outline[i],[c,d]=outline[(i+1)%outline.length],dx=c-a,dz=d-b;
    const w=new T.BoxGeometry(Math.hypot(dx,dz),2.73,.055);w.rotateY(-Math.atan2(dz,dx));w.translate((a+c)/2,1.405,(b+d)/2);tint(w,i===1?red:white);
  }
  const merged=mergeGeometries(shapes);shapes.forEach(g=>g.dispose());return merged;
}
export function placeMadang(K,P,rotation,y){
  const T=K.THREE,angle=rotation-Math.PI/2,W=(x,d)=>P(bay.front-d,bay.mid+x);
  const at=(x,d,h)=>{const [a,b]=W(x,d);return[a,y+h,b];};
  const rect=(a,b,c,d)=>[W(a,b),W(c,b),W(c,d),W(a,d)];
  const [ox,oz]=W(0,0),co=Math.cos(angle),si=Math.sin(angle);
  const local=(x,z)=>[(x-ox)*co-(z-oz)*si,(x-ox)*si+(z-oz)*co];
  const wall=(a,b,c,d,bottom,top)=>K.phys.addWall(...W(a,b),...W(c,d),y+bottom,y+top,.022,'gotomall');
  const eyePoly=rect(-2.69,.04,2.69,5.99);
  const register=(a,b)=>K.occludingWall({a,b,y0:y+.065,y1:y+2.74,eyePoly,eyeMin:y+.075,eyeMax:y+2.72});
  register(W(-2.752,.04),W(-2.752,6.10));
  register(W(2.752,.04),W(2.752,4.15));
  register(W(...outline[4]),W(...outline[5]));
  const block=(a,b,c,d,h)=>K.phys.addPolyWalls(rect(a,b,c,d),y,y+h,.017,'gotomall');
  for(let i=1;i<outline.length;i++){const [a,b]=outline[i],[c,d]=outline[(i+1)%outline.length];wall(a,b,c,d,0,2.77);}
  block(-2.20,4.998,2.28,5.56,.818);block(-1.82,3.89,-1.11,4.41,1.13);block(-.301,3.529,.661,4.151,.827);
  for(const [x,d] of tables){
    block(x-.625,d-.360,x+.625,d+.360,.763);
    for(const side of [-1,1]){
      const cd=d+side*.558,seat=rect(x-.215,cd-.18,x+.19,cd+.18);
      K.phys.addSurface(seat,y+.459,{tag:'gotomall'});K.phys.addPolyWalls(seat,y,y+.459,.014,'gotomall');
      wall(x-.218,cd+side*.189,x+.202,cd+side*.189,.46,.82);
    }
  }
  K.zone({name:'마당',floor:'B1',sub:'서편 G-010 · 한식',poly:outline.map(([a,b])=>W(a,b)),y0:y,y1:y+2.82,priority:12});
  const within=(x,d)=>x>=-2.733&&x<=2.733&&d>=-.012&&d<6.118;
  function sees(px,pz,targets,exterior){
    const [x,d]=local(px,pz);
    if(within(x,d))return !exterior||d<.86;
    if(d>=0)return false;
    if(exterior)return true;
    return targets.some(([tx,td])=>{
      const cross=x+(tx-x)*(-d)/(td-d);
      return cross>=-2.707&&cross<=2.707;
    });
  }
  paint??=new T.MeshLambertMaterial({vertexColors:true,side:T.DoubleSide});
  glow??=new T.MeshBasicMaterial({vertexColors:true,side:T.DoubleSide});
  function place(key,point,bounds,range,exitRange,eyeHeight,targets,translations){
    const name=parts[key][0],front=key==='front',seen=p=>sees(p.x,p.z,targets,front),shell=key==='room',baked=shell||key==='kitchen';
    K.detail({name,floor:'B1',poly:rect(...bounds),y0:y,y1:y+2.84,visibleFrom:(x,yy,z)=>yy>=y-.48&&yy<=y+3.32&&(shell||sees(x,z,targets,front))},()=>{
      if(shell)K.occludingSlab({poly:rect(-2.758,.008,2.758,6.14),y:y+2.766,eyeMin:y+.05,eyeMax:y+2.71});
      if(!geometry.has(key))geometry.set(key,shell?roomProxy(T):boxSilhouette(T,shapes[key]));
      const material=front?glow:paint;
      placeSingleDetail(K,{name,file:'../gotomall-madang/'+key+'.glb',at:at(...point),angle,
        fallback:geometry.get(key),fallbackMaterial:material,material:baked?null:material,
        loadSurface:baked?file=>loadBakedSurface(T,file):undefined,eyeHeight,floorTolerance:3.11,range,exitRange,
        translations,closeVisibleFrom:seen});
    });
  }
  const cfg=[
    ['room',[-2.77,-.03,3.67,9.64],12.0,15.2,1.3,[[-1.93,.05],[0,2],[1.93,1.45]]],
    ['front',[-2.61,-.10,2.72,.02],18.0,22,2.55,[[0,-.067]]],
    ['heart',[2.51,2.36,2.73,3.38],7.7,9.4,1.6,[[2.58,2.86]]],
    ['menu',[-2.72,.49,2.72,4.44],7.5,9.2,1.62,[[-2.58,1.2],[2.61,1.7],[2.6,2.08]]],
    ['kitchen',[-2.68,4.94,2.66,5.77],9.2,11.1,1.38,[[0,5.15],[1.92,5.20],[-1.99,5.20]]],
    ['cooker',[-1.83,3.86,-1.09,4.43],6.1,7.8,.91,[[-1.46,4.12]]],
    ['trolley',[-.313,3.52,.675,4.16],6.8,8.1,.59,[[.18,3.84]]],
    ['bibimbap',[1.52,1.13,1.78,1.39],3.45,4.15,.085,[[1.65,1.26]]],
    ['plates',[-.11,3.64,.59,4.04],4.3,5.5,.11,[[.18,3.84]]],
  ];
  for(const [key,box,r,exit,eye,targets] of cfg)place(key,parts[key].slice(1),box,r,exit,eye,targets);
  // Opposite dining rows can leave the view independently. Every table and utensil holder has one source.
  for(const sign of [-1,1]){
    const rows=tables.filter(([x])=>x*sign>0),center=rows[0][0],zs=rows.map(p=>p[1]);
    for(const key of ['table','tools']){
      const isSet=key==='table';
      place(key,[center,0,parts[key][3]],[center-.66,Math.min(...zs)-.77,center+.66,Math.max(...zs)+.77],
        isSet?8.5:5.25,isSet?10.2:6.7,isSet?.72:.16,rows,rows.map(([x,d])=>[x-center,0,d]));
    }
  }
}
