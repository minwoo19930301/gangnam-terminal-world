import {boxSilhouette} from '../interior-architecture/box-silhouette.js';
import {placeSingleDetail} from '../interior-architecture/single-detail.js';

const columns=[[-315.4,-.15],[-304.3,-.15]];
const seats=columns.flatMap(([u,v])=>[0,2*Math.PI/3,4*Math.PI/3].map(angle=>({u,v,angle})));
seats.push({u:-310.0,v:-.70,angle:Math.PI},{u:-310.0,v:.48,angle:0});

function arcProfile(outer,inner,angle){
  const points=[];
  function edge(radius,direction){
    for(let i=0;i<=16;i++){
      const a=angle+direction*(-46+92*i/16)*Math.PI/180;
      points.push([Math.sin(a)*radius,Math.cos(a)*radius]);
    }
  }
  edge(outer,1);edge(inner,-1);
  return points;
}

let proxies;
function distant(T){
  if(proxies)return proxies;
  function geom(build){
    const pos=[],rgb=[],indices=[];
    const strip=(points,tone)=>{
      const start=pos.length/3,c=new T.Color(tone);
      for(const [x,y,z] of points){pos.push(x,y,z);rgb.push(c.r,c.g,c.b);}
      for(let i=0;i<points.length-2;i+=2){
        const p=start+i;indices.push(p,p+1,p+2,p+1,p+3,p+2);
      }
    };
    build(strip);
    const g=new T.BufferGeometry();
    g.setAttribute('position',new T.Float32BufferAttribute(pos,3));g.setAttribute('color',new T.Float32BufferAttribute(rgb,3));
    g.setIndex(indices);g.computeVertexNormals();return g;
  }
  const seat=geom(strip=>{
    for(const [inner,y0,outer,y1,col] of [[1.375,.455,2.142,.455,0x514f4b],
      [2.145,.19,2.15,.455,0x494945],[2.145,.075,2.15,.19,0xada99f],
      [1.375,.19,1.375,.455,0x494945],[1.38,.075,1.38,.19,0xada99f],
      [2.06,.018,2.06,.078,0x353733]]){
      const verts=[];
      for(let i=0;i<=13;i++){
        const a=(-46+92*i/13)*Math.PI/180,sa=Math.sin(a),ca=Math.cos(a);
        verts.push([inner*sa,y0,inner*ca],[outer*sa,y1,outer*ca]);
      }
      strip(verts,col);
    }
    for(const side of [-1,1]){
      const a=side*46*Math.PI/180,sa=Math.sin(a),ca=Math.cos(a);
      for(const [y,h,col] of [[.08,.11,0xada99f],[.19,.264,0x494945]])
        strip([[1.38*sa,y,1.38*ca],[2.145*sa,y,2.145*ca],[1.38*sa,y+h,1.38*ca],[2.145*sa,y+h,2.145*ca]],col);
    }
  });
  const column=boxSilhouette(T,[[0,.018,0,.64,.104,.64,0x3d403a],[0,.12,0,.27,1.76,.27,0x9b937e],
    [0,1.88,0,.74,.15,.74,0x373b36],[0,2.03,0,.59,.13,.59,0x9d8a65],[0,2.16,0,.64,.21,.60,0x5a6d3f]]);
  const glass=geom(strip=>{
    const pts=[];for(let i=0;i<=18;i++){
      const a=Math.PI*2*i/18,x=.311*Math.sin(a),z=.311*Math.cos(a);
      pts.push([x,.177,z],[x,1.859,z]);
    }
    strip(pts,0xb9c6ac);
  });
  const inlay=geom(strip=>{
    for(const [x,z,rx,rz] of [[-5.5,-.52,3.62,2.53],[2.5,.03,4.58,3.16],[7.75,-.86,3.19,2.31]]){
      const pts=[];for(let i=0;i<=32;i++){
        const a=2*Math.PI*i/32,sa=Math.sin(a),ca=Math.cos(a);
        pts.push([Math.min(10.92,x+(rx-.065)*sa),.03,z+(rz-.065)*ca],[Math.min(10.92,x+(rx+.065)*sa),.03,z+(rz+.065)*ca]);
      }
      strip(pts,0xd3d0c2);
    }
  });
  // Native curved glass carries the Blender material alpha in COLOR_0. Its fallback carries RGB only.
  const glaze=o=>new T.MeshLambertMaterial({vertexColors:true,transparent:true,opacity:o,depthWrite:false,side:T.DoubleSide});
  proxies={seat,column,glass,inlay,paint:new T.MeshLambertMaterial({vertexColors:true,side:T.DoubleSide}),
    paving:new T.MeshPhongMaterial({vertexColors:true,side:T.DoubleSide,shininess:52,specular:0x575751}),
    nativeGlass:glaze(.86),proxyGlass:glaze(.31)};
  return proxies;
}

export function westSeatCollisions(K,P,y){
  const invisible={top:false,bottom:false,side:false};
  for(const {u,v,angle} of seats){
    K.prism(arcProfile(2.15,1.375,angle).map(([x,z])=>P(u+x,v+z)),y,y+.455,invisible);
  }
  for(const [u,v] of columns){
    const base=Array.from({length:16},(_,i)=>{const a=i*Math.PI/8;return P(u+.345*Math.sin(a),v+.345*Math.cos(a));});
    K.prism(base,y,y+2.16,{...invisible,walkTop:false});
  }
}

export function westSeatFixtures(K,P,rot,y){
  const f=distant(K.THREE);
  function put(file,label,u,v,a,range,exitRange,eyeHeight){
    const [x,z]=P(u,v),glass=file==='glass';
    placeSingleDetail(K,{name:'고투몰 서편 · '+label,file:'../gotomall-west-seats/'+file+'.glb',at:[x,y,z],
      angle:rot+a,fallback:f[file],fallbackMaterial:glass?f.proxyGlass:f.paint,
      material:glass?f.nativeGlass:file==='inlay'?f.paving:f.paint,range,exitRange,eyeHeight,floorTolerance:2.50});
  }
  for(const [i,{u,v,angle}] of seats.entries()){
    put('seat','두 줄 석재의 곡선 벤치',u,v,angle,9.0,11.5,.72);
    for(const [j,along] of (i%3===0?[-.36,.40]:i%3===1?[.17]:[-.22]).entries()){
      const a=angle+along,[x,z]=P(u+1.82*Math.sin(a),v+1.82*Math.cos(a));
      K.person(x,y,z,{sit:true,rotY:rot+a,shirt:[0x465656,0x6b4652,0x898375,0x4a5869,0x534d45][(i*2+j)%5]});
    }
  }
  for(const [u,v] of columns){
    put('column','기둥 금속틀과 식재',u,v,0,13,16.0,1.27);
    put('glass','기둥의 곡면 유리',u,v,0,12,15.5,1.27);
  }
  put('inlay','바닥의 밝은 석재 상감',-309.5,.2,0,20,24,1.05);
}
