import {placeSingleDetail} from '../interior-architecture/single-detail.js';
import {boxSilhouette} from '../interior-architecture/box-silhouette.js';

const panelUrl=new URL('./rack-front.webp',import.meta.url);

// The back and side faces use the dark timber border of the same image. The
// complete rack and its orthographic bake therefore each cost a single draw.
function rackProxy(T){
  const geometry=new T.BoxGeometry(1.96,2.43,.525).translate(0,1.215,0);
  const uv=geometry.getAttribute('uv');
  for(let face=0;face<6;face++){
    if(face===4)continue;
    for(let i=0;i<4;i++)uv.setXY(face*4+i,.015,.013);
  }
  geometry.clearGroups();
  return geometry;
}

function panelMaterial(T){
  const material=new T.MeshLambertMaterial({color:0x443734});
  const loader=new T.TextureLoader();
  let pending=false,retryAfter=0;
  material.onBeforeRender=()=>{
    if(pending||material.map||performance.now()<retryAfter)return;
    pending=true;
    loader.load(panelUrl.href,texture=>{
      texture.colorSpace=T.SRGBColorSpace;
      texture.anisotropy=4;
      material.map=texture;material.color.set(0xffffff);material.needsUpdate=true;
      material.onBeforeRender=()=>{};
    },undefined,()=>{pending=false;retryAfter=performance.now()+10000;});
  };
  return material;
}

const profiles={
  rack:{name:'병 선반',range:4.2,exit:5.55,eye:1.25},
  cases:{name:'나무 와인 상자',boxes:[[-.295,0,0,.566,.49,.44,0xb98e65],
    [.295,0,0,.566,.737,.44,0xb98e65],[-.295,.479,0,.49,.012,.35,0x484238],
    [.295,.726,0,.49,.012,.35,0x484238],
    ...[-.295,.295].flatMap((x,i)=>[.105,.35,...(i?[.60]:[])].map(h=>[x,h,.222,.54,.008,.005,0x947759])),
    ...[-.295,.295].flatMap((x,i)=>[-.165,-.055,.055,.165].map(dx=>[x+dx,i?.733:.486,0,.067,.014,.29,0x535748]))],range:6,exit:8,eye:.55},
  trolley:{name:'와인 진열 카트',boxes:[[0,.17,0,1.14,.044,.61,0xb59976],[0,.725,0,1.14,.044,.61,0xb59976],
    ...[-.54,.54].flatMap(x=>[-.274,.274].map(z=>[x,.095,z,.024,.792,.024,0x89724e])),
    ...[-.39,-.14,.12,.39].map(x=>[x,.77,-.10,.084,.28,.084,0x40423a])],range:7,exit:9,eye:.81},
  vault:{name:'벽돌 궁륭과 석재 바닥',range:13,exit:15,eye:1.85},
};

function distantVault(T){
  const pts=[],idx=[],r=3.34,d=6.83;
  for(let i=0;i<=12;i++){
    const t=Math.PI*i/12;
    for(const z of [-d,d])pts.push(r*Math.cos(t),2.53+1.17*Math.sin(t),z);
    if(i>0){const a=(i-1)*2;idx.push(a,a+2,a+3,a,a+3,a+1);}
  }
  const g=new T.BufferGeometry();
  g.setAttribute('position',new T.Float32BufferAttribute(pts,3));g.setIndex(idx);g.computeVertexNormals();
  return g;
}

export function registerCellar(K,{P,rect,angle,y}){
  const T=K.THREE,origin=P(0,0),c=Math.cos(angle),s=Math.sin(angle);
  // The foyer-facing wall and the two return walls are glazed. Guests in the foyer
  // or inside the cellar can see the displays; the solid west shell blocks the rear.
  function visible(x,_height,z){
    const dx=x-origin[0],dz=z-origin[1],u=dx*c-dz*s,v=dx*s+dz*c;
    return u>=-7.91 && u<=8.95 && v>=22.03 && v<=39.97;
  }
  const rackMaterial=panelMaterial(T);
  const far={},near=new T.MeshPhongMaterial({vertexColors:true,shininess:17,specular:0x302522,side:T.DoubleSide});
  const racks=[];
  for(const v of [25.40,27.44,29.48,31.52,33.56,35.60])racks.push([-7.44,v,angle+Math.PI/2]);
  for(const v of [25.34,27.40,34.53,36.60])racks.push([-1.42,v,angle-Math.PI/2]);
  for(const u of [-5.48,-3.38]) {
    racks.push([u,24.55,angle],[u,37.46,angle+Math.PI]);
  }
  function part(key,u,v,turn){
    const spec=profiles[key],name='더 마고 그릴 · '+spec.name,[x,z]=P(u,v);
    if(!far[key])far[key]=key==='vault'?distantVault(T):key==='rack'?rackProxy(T):boxSilhouette(T,spec.boxes);
    const endRack=key==='rack'&&(turn===angle||turn===angle+Math.PI);
    const bounds=key==='vault'?rect(-7.77,24.17,-1.09,37.83):
      endRack?rect(u-.99,v-.30,u+.99,v+.30):key==='rack'?rect(u-.30,v-.99,u+.30,v+.99):rect(u-.60,v-.32,u+.60,v+.32);
    K.detail({name,floor:'7F',poly:bounds,y0:y,y1:y+3.78,visibleFrom:visible},()=>{
      placeSingleDetail(K,{name,file:'../margaux-cellar/'+key+'.glb',at:[x,y,z],angle:turn,
        fallback:far[key],fallbackMaterial:key==='vault'?vaultMaterial:key==='rack'?rackMaterial:near,material:key==='vault'?undefined:near,
        range:spec.range,exitRange:spec.exit,floorTolerance:2.7,eyeHeight:spec.eye});
    });
  }
  const vaultMaterial=new T.MeshLambertMaterial({color:0xb19080,side:T.DoubleSide});
  for(const [u,v,turn] of racks)part('rack',u,v,turn);
  for(const v of [26.25,35.51])part('cases',-4.43,v,angle);
  part('trolley',-4.43,32.76,angle);
  part('vault',-4.43,31,angle);
  return racks;
}
