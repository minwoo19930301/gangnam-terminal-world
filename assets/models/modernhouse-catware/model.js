// Low-detail dishes and the photographed cup sticker share one draw before the GLB arrives.
import {mergeGeometries} from 'three/addons/utils/BufferGeometryUtils.js';
import {boxSilhouette} from '../interior-architecture/box-silhouette.js';
import {makeCanvas} from '../../../js/textures.js';
import {placeSingleDetail} from '../interior-architecture/single-detail.js';

function distantCatware(T){
  const trim=0x625f59;
  const parts=[boxSilhouette(T,[
    [0,.747,0,2.25,.053,.78,trim],[0,.265,0,2.19,.035,.72,trim],
    [-1.075,0,0,.072,.747,.71,trim],[1.075,0,0,.072,.747,.71,trim],
    [0,.8,-.217,2.08,.108,.308,0xba9d77],[0,.908,-.30,1.96,.47,.106,0xb99b70],
    [.46,.908,-.233,.28,.40,.022,0xe7aa9b,-.25],[.78,.908,-.234,.28,.39,.022,0xe9ca88,-.25],
  ])];
  function tint(geometry,tone){
    const color=new T.Color(tone),rgb=new Float32Array(geometry.attributes.position.count*3);
    for(let i=0;i<rgb.length;i+=3)color.toArray(rgb,i);
    geometry.setAttribute('color',new T.BufferAttribute(rgb,3));parts.push(geometry);
    return geometry;
  }
  function profile(x,y,z,points,tone){
    const geo=new T.LatheGeometry(points.map(([r,h])=>new T.Vector2(r,h)),10);
    geo.translate(x,y,z);return tint(geo,tone);
  }
  for(const [x,z,r,h] of [[-.66,.215,.119,.13],[-.33,.2,.124,.15],[0,.2,.107,.062],
                           [.315,.198,.109,.11],[.64,.20,.115,.12],[-.28,-.04,.104,.12],[.05,-.05,.109,.12]]){
    profile(x,.8,z,[[r*.53,0],[r,h-.005],[r*.93,h],[r*.32,h*.59]],0xeee3ce);
  }
  for(const [x,wrap,lip] of [[-.27,0xd9af73,0xa0bca9],[-.087,0xd68a73,0xabc176]]){
    profile(x,.908,-.156,[[.063,0],[.075,.203]],wrap);
    profile(x,1.111,-.156,[[.075,0],[.076,.052],[.069,.052]],lip);
  }
  const canvas=makeCanvas(132,64),ctx=canvas.getContext('2d');
  ctx.fillStyle='#4b453b';ctx.fillRect(0,0,128,64);
  ctx.fillStyle='#fff';ctx.fillRect(128,0,4,64);
  ctx.fillStyle='#f8f3db';ctx.textAlign='center';ctx.textBaseline='middle';
  ctx.font='bold 25px sans-serif';ctx.fillText('15,900',64,15);
  ctx.font='bold 24px sans-serif';ctx.fillText('4P',64,47);
  for(const geo of parts){
    const uv=geo.attributes.uv;
    for(let i=0;i<uv.count;i++)uv.setXY(i,130/132,.5);
  }
  for(const [cy,w,h,v0,v1] of [[1.078,.088,.032,0,.49],[1.041,.051,.026,.51,1]]){
    const label=new T.PlaneGeometry(w,h),uv=label.attributes.uv;
    for(let i=0;i<uv.count;i++)uv.setXY(i,(1+126*uv.getX(i))/132,1-v1+(v1-v0)*uv.getY(i));
    label.translate(-.27,cy,-.076);tint(label,0xffffff);
  }
  const map=new T.CanvasTexture(canvas);map.colorSpace=T.SRGBColorSpace;
  const mesh=mergeGeometries(parts);
  parts.forEach(geo=>geo.dispose());
  return {mesh,mat:new T.MeshPhongMaterial({map,vertexColors:true,side:T.DoubleSide,specular:0x20201c,shininess:30})};
}

export function registerCatTable(F,u,y,v,bayView){
  const {K}=F,T=K.THREE,[x,z]=F.P(u,v),name='모던하우스 · 고양이 식기 진열대';
  const front=(p)=>(p.x-x)*Math.sin(F.angle)+(p.z-z)*Math.cos(F.angle)>-.32;
  const poly=F.Q(u-1.125,v-.39,u+1.125,v+.39);
  // Use the existing homewares fixture's collision footprint.
  F.B(u,y,v,2.25,.74,.78,0x625f59,{skip:['top','bottom','n','s','e','w']});
  K.detail({name,floor:'4F',poly,y0:y,y1:y+1.52,visualOnly:true,silhouetteDistance:20,visibleFrom:bayView},()=>{
    const fallback=distantCatware(T);
    const mat=new T.MeshPhongMaterial({vertexColors:true,specular:0x2d2d28,shininess:38});
    return placeSingleDetail(K,{name,file:'../modernhouse-catware/catware.glb',at:[x,y,z],angle:F.angle,
      fallback:fallback.mesh,fallbackMaterial:fallback.mat,material:mat,range:8.5,exitRange:11,
      floorTolerance:2.50,eyeHeight:1.1,closeVisibleFrom:front});
  });
}
