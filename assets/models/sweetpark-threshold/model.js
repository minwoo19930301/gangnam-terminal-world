import {boxSilhouette} from '../interior-architecture/box-silhouette.js';
import {placeSingleDetail} from '../interior-architecture/single-detail.js';
import {plan} from '../cinema-rotary/layout.js';
import {transverseNorth} from '../megabox-central/layout.js';
import {mergeGeometries} from 'three/addons/utils/BufferGeometryUtils.js';

const left=plan(1025,transverseNorth),right=plan(1025,798);
const x=(left[0]+right[0])/2,z=(left[1]+right[1])/2;
const angle=Math.atan2(left[1]-right[1],right[0]-left[0]);
const letters='HAUADQAQAg8HDQcLBQcGCAkKCgsMDQwNDg8OERIRFxAaCx0EHQAaABYBFQYYChgLFgkSAQwACQEEJRcAGwAdAR0GIQ4jCyUFJQEmAC4BLwgyDjUINgE3AD4BPgQ7BzsJOgs6DTgONxI2FDUYNBkzHDEcMBspDCYSIxsgHBsSFwcVBBUBE0sAVAFUBksGSwtSC1EQTxBLEEsXSxdUF1QbUxxEHEQYRBhEAUsBFF8AbAFsBmQFYwZkC2oLaRBnEGMQYxdkF2wXbBtrHFwcWxtdFVwEWwEPdgCGAYYEhwSGBoAGfxWAFYEcfxx5HHoGcwZzAXYBEJgAoQCkAagGpw6kEJ8SnxihGqAclxyYGJgLmQuYBJcCGsoA0wDaBNsL2Q7ZD9cQ1xHaFNoV3xrfHNgc1hnUGNQX0hXRFdEY0xrSHMscyRvKF8oGyQEh5ADrAesI7AfsBu4F7gTxAfMA+AH4A/MG8wjvDO8O8RDyEvQU9BX1FvUX9xf5Gvkc8xzrE+sT6xzkHOMZ5BjkBuMBG7UBuAG7BbsHwhTCFsQawxy9HLsavBi7FrgWuBWzFrIXsxuxHKscqxmuE64RsA6xCrMHswW1BAWgBp8GnwuhC6EHBtIG0AbRDNMM1QrUBg==';

// Keep the photographed surface pattern and the bright ceiling present on
// the reverse approach, including a new tab in which no model was fetched.
function approachPlanes(T){
  const pos=[],normal=[],uv=[],rgb=[],indices=[];
  function quad(x0,x1,z0,z1,y,tone,up=true){
    const start=pos.length/3,c=new T.Color(tone);
    for(const [x,z] of [[x0,z0],[x0,z1],[x1,z1],[x1,z0]]){
      pos.push(x+.259*z,y,z);normal.push(0,up?1:-1,0);uv.push(0,0);rgb.push(c.r,c.g,c.b);
    }
    for(const i of (up?[0,1,2,0,2,3]:[0,2,1,0,3,2]))indices.push(start+i);
  }
  quad(-1.317,1.317,-.78,8.04,.023,0xdbd0bf);
  for(let row=0;row<18;row++){
    const z=8.04-row*.49;
    for(let col=0;col<4;col++){
      const x=-.98+col*.49;
      quad(x+.024,x+.466,z-.466,z-.024,.025,0xa39589);
    }
    for(let col=0;col<=4;col++){const x=-.98+col*.49;quad(x-.024,x+.024,z-.024,z+.024,.026,0x312c28);}
  }
  for(const side of [-1,1])for(const [c,w] of [[1.022,.042],[1.173,.06]])
    quad(side*c-w/2,side*c+w/2,-.78,8.04,.024,0x38312d);
  quad(-1.32,1.32,.42,6.10,4.12,0xd6cbb4,false);
  quad(-1.05,1.05,.63,5.89,4.115,0x635747,false);
  for(let row=0;row<8;row++)for(let col=0;col<4;col++){
    const x=-1.025+col*.5125,z=.655+row*.65125;
    quad(x+.009,x+.5035,z+.012,z+.63925,4.11,0xfff4df,false);
  }
  const geo=new T.BufferGeometry();
  for(const [n,a,size] of [['position',pos,3],['normal',normal,3],['uv',uv,2],['color',rgb,3]])
    geo.setAttribute(n,new T.Float32BufferAttribute(a,size));
  geo.setIndex(indices);return geo;
}

function firstView(T){
  const timber=boxSilhouette(T,[[-1.425,0,0,.105,3.42,.21,0x514237],
    [1.425,0,0,.105,3.42,.21,0x514237],[0,2.866,0,3,.55,.24,0x483a30],
    [-.95,2.975,.133,.72,.28,.012,0xa29c8e],[.95,2.975,.133,.72,.28,.012,0xa29c8e]]);
  const path=new T.ShapePath(),bytes=Uint8Array.from(atob(letters),c=>c.charCodeAt(0));
  for(let i=0;i<bytes.length;){
    const count=bytes[i++];
    for(let j=0;j<count;j++){
      const px=(bytes[i++]-124.5)*.665/249+.042,py=(14.5-bytes[i++])*.665/249+3.117;
      if(j===0)path.moveTo(px,py);else path.lineTo(px,py);
    }
    path.currentPath.closePath();
  }
  const text=new T.ShapeGeometry(path.toShapes(false));
  text.translate(0,0,.16);
  text.setAttribute('color',new T.Float32BufferAttribute(new Float32Array(text.attributes.position.count*3).fill(1),3));
  const planes=approachPlanes(T),geometry=mergeGeometries([timber,text,planes]);
  timber.dispose();text.dispose();planes.dispose();
  return geometry;
}

export function sweetParkCoffeeThreshold(K,y){
  const T=K.THREE,material=new T.MeshPhongMaterial({vertexColors:true,side:T.DoubleSide,shininess:19,specular:0x181512});
  material.onBeforeCompile=shader=>{
    shader.fragmentShader=shader.fragmentShader.replace('#include <emissivemap_fragment>',`#include <emissivemap_fragment>
      float lamp=smoothstep(.78,.94,diffuseColor.r)*smoothstep(.73,.90,diffuseColor.g);
      totalEmissiveRadiance+=diffuseColor.rgb*(.025+.72*lamp);`);
  };
  placeSingleDetail(K,{name:'스위트 파크 · 카페 통로 목재 입구',at:[x,y,z],angle,
    file:'../sweetpark-threshold/threshold.glb',fallback:firstView(T),material,fallbackMaterial:material,
    range:15,exitRange:19,floorTolerance:2.7,eyeHeight:1.62,
    viewBounds:[new T.Box3(new T.Vector3(-1.5,2.866,-.14),new T.Vector3(1.5,3.42,.17))],
    closeVisibleFrom:p=>{
      const dx=p.x-x,dz=p.z-z,depth=dx*Math.sin(angle)+dz*Math.cos(angle);
      const lateral=dx*Math.cos(angle)-dz*Math.sin(angle)-.259*depth;
      return depth>-.8 && Math.abs(lateral)<2.35;
    }});
}
