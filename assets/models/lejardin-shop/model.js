import * as T from 'three';
import {loadReflectionAtlas} from '../interior-architecture/reflection-atlas.js';
import {placeSingleDetail} from '../interior-architecture/single-detail.js';
import {loadArchitecture} from '../interior-architecture/model.js';
import {relief} from '../../../js/banpo_relief.js';
import {parts,prefix,rows} from './layout.js';
import {texture,bank,instances,lights} from './flowers.js';
import {proxy} from './proxies.js';

const textured=new Set(['shell','front','case','counter','cards','parcels']);
const clear=new Set(['clear','vases']);
const paint=new T.MeshLambertMaterial({vertexColors:true,side:T.DoubleSide});
const glass=new T.MeshPhongMaterial({color:0xe2eee6,transparent:true,opacity:.09,specular:0xe1e7df,shininess:85,depthWrite:false,side:T.DoubleSide});
const ranges={shell:13,front:19,brand:25,case:11,clear:4.2,vases:4.4,gold:4.6,lilac:4.6,pink:4.6,counter:8,
 blueWrap:3.55,mixedWrap:3.55,pineHigh:11,pineMid:10,pineLow:9,bulbs:16,parcels:8,cards:5.0};
async function surface(file){
  const key=file.split('/').at(-1).slice(0,-4);
  const base=key==='bulbs'?[new T.Mesh(proxy('bulbs').clone())]:loadArchitecture(file);
  const [[mesh],map,arrangement,points,env]=await Promise.all([base,textured.has(key)?texture(key+'-finish.webp'):null,bank(key),key==='bulbs'?lights():null,
    (clear.has(key)||key==='case')?loadReflectionAtlas(new URL('./cooler-reflection.webp',import.meta.url).href):null]);
  let mat;
  if(map){map.flipY=false;map.needsUpdate=true;mat=new T.MeshPhongMaterial({map,side:T.DoubleSide,color:0xffffff,specular:key==='case'?0x3c3c37:0x252321,shininess:key==='case'?40:18});}
  else if(clear.has(key)){
    mat=glass.clone();mat.envMap=env;mat.combine=T.MixOperation;mat.reflectivity=.66;mat.opacity=key==='vases'?.19:.060;
    mat.onBeforeCompile=shader=>{shader.fragmentShader=shader.fragmentShader.replace('#include <opaque_fragment>',
      'diffuseColor.a+=.28*pow(1.-abs(dot(normal,normalize(vViewPosition))),2.7);\n#include <opaque_fragment>');};
  }
  else if(key==='brand'||key==='bulbs'){mat=new T.MeshBasicMaterial({color:key==='brand'?0xfff8e9:0xffe29a,vertexColors:key==='bulbs',side:T.DoubleSide});}
  else mat=paint.clone();
  if(key==='bulbs'){mesh.geometry.setDrawRange(0,0);mat.colorWrite=false;mat.depthWrite=false;}
  if(key==='case'){
    mat.envMap=env;mat.combine=T.MixOperation;mat.reflectivity=.46;mat.vertexColors=true;
    mat.onBeforeCompile=shader=>{
      shader.fragmentShader=shader.fragmentShader.replace('#include <color_fragment>','').replace('#include <specularmap_fragment>',
        '#include <specularmap_fragment>\n#ifdef USE_COLOR_ALPHA\n specularStrength*=vColor.a;\n#endif');
    };
  }
  mat.userData.arrangement=arrangement;mat.userData.points=points;mesh.material=mat;return [mesh];
}
export function placeLejardin(K,P,angle){
  const position=(x,d)=>P(33+d,-8.5+x),[ox,oz]=position(0,0),c=Math.cos(angle),s=Math.sin(angle);
  const local=(wx,wz)=>{const dx=wx-ox,dz=wz-oz;return [c*dx-s*dz,s*dx+c*dz];};
  const segment=(x0,d0,x1,d1,y0,y1,w)=>K.phys.addWall(...position(x0,d0),...position(x1,d1),y0,y1,w,'centralcity');
  function edges(x,d,w,depth,h){
    for(const sign of [-1,1]){
      segment(x-w/2,d+sign*depth/2,x+w/2,d+sign*depth/2,0,h,.035);
      segment(x+sign*w/2,d-depth/2,x+sign*w/2,d+depth/2,0,h,.035);
    }
  }
  edges(-.95,1.89,3.10,.80,2.13);edges(1.16,4.05,2.70,.72,.99);edges(2.84,-.12,.41,.33,1.58);
  for(const [x,d,r] of [[-1.38,-.335,.255],[-2.59,-.21,.187],[-1.99,-.46,.147]]) edges(x,d,r*2,r*2,1.26);
  for(const side of [-1,1])segment(side*1.905,.105,side*3.45,.105,0,2.63,.14);
  for(const [key,x,d,y] of rows){
    const [label,width,depth,height]=parts[key],name=prefix+label,[wx,wz]=position(x,d);
    const outer=['shell','front','brand','parcels','bulbs','cards'].includes(key)||key.startsWith('pine');
    const chilled=['clear','vases','gold','lilac','pink'].includes(key);
    const own=(px,ey,pz)=>{
      if(ey<-.20||ey>3.37)return false;
      const [u,v]=local(px,pz);
      if(v>5.04||(v>.11&&Math.abs(u)>3.51))return false;
      if(v<-.01&&!outer){
        const k=-v/(d-v);const center=u+(x-u)*k,extent=Math.max(.12,width*.48)*k;
        if(center-extent>1.94||center+extent< -1.94)return false;
      }
      if(chilled&&v>2.34&&u> -2.57&&u<.64)return false;
      return v> -37&&Math.abs(u)<34;
    };
    const poly=[position(x-width/2,d-depth/2),position(x+width/2,d-depth/2),
      position(x+width/2,d+depth/2),position(x-width/2,d+depth/2)];
    K.detail({name,floor:'1F',poly,y0:y,y1:y+height,visibleFrom:own},()=>{
      const g=proxy(key),range=ranges[key];
      const obj=placeSingleDetail(K,{name,file:'../lejardin-shop/'+key+'.glb',at:[wx,y,wz],angle,fallback:g,
        fallbackMaterial:clear.has(key)?glass:paint,loadSurface:surface,range,exitRange:range+1.8,eyeHeight:height*.48,
        floorTolerance:4.30,viewBounds:[new T.Box3(new T.Vector3(-width*.53,-.045,-depth*.57),new T.Vector3(width*.53,height+.08,depth*.57))],
        closeVisibleFrom:p=>own(p.x,p.y-relief(p.x,p.z),p.z)});
      instances(obj,key,g);return obj;
    });
  }
}
