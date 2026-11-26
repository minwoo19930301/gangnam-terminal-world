import {boxSilhouette} from '../interior-architecture/box-silhouette.js';
import {loadArchitecture} from '../interior-architecture/model.js';
import {placeSingleDetail} from '../interior-architecture/single-detail.js';
import {relief} from '../../../js/banpo_relief.js';

const file='../margaux-woodfire/hearth.glb';
let bundle;
function loadPart(name){
  bundle??=loadArchitecture(file).catch(error=>{bundle=null;throw error});
  return bundle.then(meshes=>[meshes.find(part=>part.name===name)]);
}

// Re-use the same three draws at either distance. The coarse, open front leaves
// the coals visible from the guest side even before the detailed file arrives.
const silhouettes={
  HearthMasonry:[[0,.96,-.86,5.8,1.99,.11,0x735141],[-2.87,.96,-.38,.11,1.99,1.14,0x715548],
    [2.87,.96,-.38,.11,1.99,1.14,0x715548],[0,.96,0,5.72,.09,1.52,0x4e423a]],
  HearthIron:[[0,2.92,0,5.98,.43,2.22,0x79736c],
    ...[-1.72,1.72].flatMap(x=>[1.77,2.39].map(h=>[x,h,-.58,1.89,.065,.54,0xaca397])),
    ...[-.63,.63].map(x=>[x,1.36,.35,.05,1.10,.05,0x49382a]),
    ...[1.37,1.68,1.99,2.30].map(h=>[0,h,.35,1.27,.045,.04,0x49382a])],
  HearthEmbers:[[0,1.09,.04,1.06,.07,.48,0xbf3e0c],[-.12,1.19,-.05,.47,.31,.22,0xeb811f],
    [.15,1.22,.05,.27,.40,.18,0xf8ac44]],
};

export function registerMargauxHearth(K,{P,rect,angle,y}){
  const T=K.THREE,[x,z]=P(14.6,49),c=Math.cos(angle),s=Math.sin(angle);
  const entries=[['HearthMasonry','벽돌과 숯받이'],['HearthIron','쇠바구니와 선반'],['HearthEmbers','숯불']];
  function visible(px,py,pz){
    const dx=px-x,dz=pz-z,u=dx*c-dz*s,v=dx*s+dz*c;
    return py>=y-.14 && py<y+4.45 && u>=-22.5 && u<=1.25 && Math.abs(v)<=9.09;
  }
  K.detail({floor:'7F',poly:rect(13.40,46,15.78,52),y0:y,y1:y+4.38,
    name:'더 마고 그릴 · 공개 화덕',visibleFrom:visible},()=>{
    const materials=[
      new T.MeshLambertMaterial({vertexColors:true,side:T.DoubleSide}),
      new T.MeshPhongMaterial({vertexColors:true,specular:0x55524a,shininess:29,side:T.DoubleSide}),
      new T.MeshBasicMaterial({vertexColors:true,transparent:true,depthWrite:false,side:T.DoubleSide}),
    ];
    const fire=materials[2];
    fire.forceSinglePass=true;
    const time={value:0};
    // Only the visible flame mesh samples the moving turbulence. Fully opaque
    // embers stay still, and there is no update or light on the room.
    fire.onBeforeCompile=shader=>{
      shader.uniforms.hearthSeconds=time;
      shader.vertexShader='uniform float hearthSeconds; varying vec3 hearthWorld;\n'+shader.vertexShader
        .replace('#include <project_vertex>', `#include <project_vertex>
          hearthWorld=(modelMatrix*vec4(transformed,1.)).xyz;
          #ifdef USE_COLOR_ALPHA
            float tip=pow(1.-color.a,1.5);
            float curl=.036*tip*sin(6.2*hearthWorld.y+hearthSeconds*3.+hearthWorld.x*4.);
            mvPosition.xyz+=mat3(viewMatrix)*vec3(curl,.006*tip*sin(hearthSeconds*4.3+hearthWorld.z),curl*.23);
            gl_Position=projectionMatrix*mvPosition;
          #endif`);
      shader.fragmentShader=`uniform float hearthSeconds;
        varying vec3 hearthWorld;
        float hearthHash(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}
        float hearthNoise(vec2 p){
          vec2 i=floor(p),f=fract(p);f=f*f*(3.-2.*f);
          return mix(mix(hearthHash(i),hearthHash(i+vec2(1,0)),f.x),
            mix(hearthHash(i+vec2(0,1)),hearthHash(i+vec2(1,1)),f.x),f.y);
        }
        `+shader.fragmentShader.replace('#include <color_fragment>',`#include <color_fragment>
          #ifdef USE_COLOR_ALPHA
            if(vColor.a<.995){
              vec2 p=vec2(hearthWorld.x*.59+hearthWorld.z*.81,hearthWorld.y);
              float flow=hearthNoise(p*vec2(6.,3.7)-vec2(-.24,1.52)*hearthSeconds);
              float fine=hearthNoise(p*vec2(13.,8.)-vec2(.42,2.11)*hearthSeconds);
              float t=smoothstep(.17,.80,.66*flow+.34*fine);
              float core=clamp((vColor.g-.25)*1.9,0.,1.);
              diffuseColor.rgb=mix(diffuseColor.rgb,vec3(1.,.90,.51),core*(.32+.50*t));
              diffuseColor.a*=mix(.37,1.,t);
            }
          #endif`);
    };
    fire.customProgramCacheKey=()=>'margaux-visible-hearth';
    fire.onBeforeRender=()=>{time.value=performance.now()*.001;};
    entries.forEach(([part,label],i)=>{
      const name='더 마고 그릴 · 화덕 '+label;
      placeSingleDetail(K,{name,file:file+'#'+part,at:[x,y,z],angle:angle-Math.PI/2,
        fallback:boxSilhouette(T,silhouettes[part]),material:i===0?undefined:materials[i],fallbackMaterial:materials[i],
        loadSurface:()=>loadPart(part),range:15.5,exitRange:18,eyeHeight:1.82,floorTolerance:3,
        closeVisibleFrom:e=>visible(e.x,e.y-relief(e.x,e.z),e.z)});
    });
  });
}
