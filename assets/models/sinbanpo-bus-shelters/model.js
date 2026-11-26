import {placeSingleDetail} from '../interior-architecture/single-detail.js';
import {boxSilhouette} from '../interior-architecture/box-silhouette.js';
import {paintClock} from './clock-face.js';
import {makeCanvas} from '../../../js/textures.js';
import {relief} from '../../../js/banpo_relief.js';
import {seoulClock} from '../../../js/daylight.js';

const structural='중앙차로 승차대 · 검은 강재 차양과 승객 벤치';
const glazed='중앙차로 승차대 · 강화유리와 반투명 수평 띠';
const prints='중앙차로 승차대 · 한강과 서래섬 포스터';
const display='중앙차로 승차대 · 승객용 전광판과 안내 케이스';
const unseen=['n','e','s','w','top','bottom'];
const byKit=new WeakMap();

function artFaces(T){
  const pts=[],uv=[],idx=[];
  for(const [i,x] of [-2.66,2.66].entries())for(const side of [-1,1]){
    const d=-.875+side*.106,w=1.132,h=1.824,b=.208,n=pts.length/3;
    pts.push(x-w/2,b,d,x+w/2,b,d,x+w/2,b+h,d,x-w/2,b+h,d);
    const a=side>0?i/2:(i+1)/2,z=side>0?(i+1)/2:i/2;
    uv.push(a,0,z,0,z,1,a,1);
    if(side>0)idx.push(n,n+1,n+2,n,n+2,n+3);else idx.push(n,n+2,n+1,n,n+3,n+2);
  }
  const g=new T.BufferGeometry();g.setAttribute('position',new T.Float32BufferAttribute(pts,3));
  g.setAttribute('uv',new T.Float32BufferAttribute(uv,2));g.setIndex(idx);g.computeVertexNormals();
  return g;
}

function resources(T){
  const frame=boxSilhouette(T,[
    [0,2.71,-.04,6.86,.09,2.11,0x343b3d],
    [0,2.21,-.89,6.62,.31,.115,0x343b3d],
    ...[-3.30,-2.02,-.67,.67,2.02,3.30].map(x=>[x,.035,-.89,.087,2.64,.13,0x404647]),
    ...[-2.66,2.66].map(x=>[x,.089,-.875,1.235,2.15,.165,0x303739]),
    ...[-1,1].flatMap(side=>[
      [-1.45,2.34,-.89+side*.061,.88,.045,.006,0x6084a6],
      [-.46,2.34,-.89+side*.061,.88,.045,.006,0x65947e],
      [ .58,2.34,-.89+side*.061,.88,.045,.006,0xae9566],
    ]),
    [0,.412,-.45,3.55,.051,.495,0x89694d],
    ...[-1.49,1.49].map(x=>[x,.024,-.415,.13,.39,.49,0x444c4a]),
  ]);
  const glass=boxSilhouette(T,[[0,.165,-.89,3.94,1.94,.021,0xc0d5d4]]);
  const board=boxSilhouette(T,[[0,2.015,-.424,1.188,.367,.142,0x323a3d]]);
  const framePaint=new T.MeshLambertMaterial({vertexColors:true,side:T.DoubleSide});
  const glassPaint=new T.MeshLambertMaterial({vertexColors:true,transparent:true,opacity:.16,depthWrite:false});
  const signPaint=new T.MeshBasicMaterial({color:0x91a29b,toneMapped:false});
  let pending=false,retry=0;
  function smallPrint(){
    if(signPaint.map||pending||performance.now()<retry)return;
    pending=true;
    new T.TextureLoader().load(new URL('./posters-small.webp',import.meta.url).href,t=>{
      t.colorSpace=T.SRGBColorSpace;t.anisotropy=4;signPaint.map=t;signPaint.color.set(0xffffff);signPaint.needsUpdate=true;
    },undefined,()=>{pending=false;retry=performance.now()+10000;});
  }
  return {frame,glass,board,poster:artFaces(T),framePaint,glassPaint,signPaint,smallPrint};
}

function pavementGlow(T){
  const xyz=[],uv=[],rgb=[],idx=[],tint=new T.Color(0xffeed5);
  function rect(x,z,w,d,height,coords,color){
    const n=xyz.length/3;
    for(const [i,[sx,sz]] of [[-1,1],[1,1],[1,-1],[-1,-1]].entries()){
      xyz.push(x+sx*w/2,height,z+sz*d/2);uv.push(...coords[i]);rgb.push(color.r,color.g,color.b);
    }
    idx.push(n,n+1,n+2,n,n+2,n+3);
  }
  const extent=3.11/4.35*.5;
  rect(0,0,8.40,3.11,.023,[[0,.5-extent],[1,.5-extent],[1,.5+extent],[0,.5+extent]],new T.Color(0xf4f1e9));
  // Continue diffuse spill down to the road, below the top of each granite kerb.
  for(const sign of [-1,1]){
    const near=1.61,far=2.175,mid=sign*(near+far)/2;
    const front=.5-(mid+(far-near)/2)/4.35,back=.5-(mid-(far-near)/2)/4.35;
    rect(0,mid,8.40,far-near,-.091,[[0,front],[1,front],[1,back],[0,back]],new T.Color(0x706e68));
  }
  const white=Array.from({length:4},()=>[7/896,1-7/464]);
  for(const x of [-2.24,0,2.24])for(const d of [-.51,.603])rect(x,d,2.097,.038,2.672,white,tint);
  const g=new T.BufferGeometry();g.setAttribute('position',new T.Float32BufferAttribute(xyz,3));
  g.setAttribute('uv',new T.Float32BufferAttribute(uv,2));g.setAttribute('color',new T.Float32BufferAttribute(rgb,3));g.setIndex(idx);
  return g;
}
function lighting(K){
  const T=K.THREE,geom=pavementGlow(T),group=[],level={value:0};
  const black=new T.DataTexture(new Uint8Array([0,0,0,255]),1,1);black.needsUpdate=true;
  const mat=new T.MeshBasicMaterial({map:black,vertexColors:true,blending:T.AdditiveBlending,
    transparent:true,depthWrite:false,side:T.DoubleSide,toneMapped:false});
  const quietPaint=mat.clone(),roadsideOff={value:0};
  const textures=new Map();
  function change(altitude){
    const f=T.MathUtils.clamp((4-altitude)/9,0,1);level.value=f*f*(3-2*f);
    roadsideOff.value=(K.displayClock?.()??seoulClock(Date.now())).startsWith('03:')?1:0;
    mat.opacity=quietPaint.opacity=level.value;
    for(const mesh of group)mesh.visible=level.value>.002;
  }
  function pavement(file,paint){
    let state=textures.get(file);
    if(!state){state={pending:false,retry:0};textures.set(file,state);}
    if(state.texture){
      if(paint.map!==state.texture){paint.map=state.texture;paint.needsUpdate=true;}
      return;
    }
    if(state.pending||performance.now()<state.retry)return;
    state.pending=true;
    new T.TextureLoader().load(new URL(file,import.meta.url).href,tex=>{
      tex.colorSpace=T.SRGBColorSpace;tex.anisotropy=4;state.texture=tex;state.pending=false;
    },undefined,()=>{state.pending=false;state.retry=performance.now()+10000;});
  }
  function place(at,angle,scheduled){
    const root=new T.Group();root.name='중앙차로 승차대 · 차양등과 보도 빛'+(scheduled?' 22-020':'');
    root.rotation.y=angle;root.position.set(...at);
    const mesh=new T.Mesh(geom,mat);mesh.name='보도에 비친 차양등';mesh.visible=level.value>.002;
    mesh.onBeforeRender=(_renderer,_scene,camera)=>{
      if(Math.abs(camera.position.y-at[1]-relief(at[0],at[2]))>6||
        (camera.position.x-at[0])**2+(camera.position.z-at[2])**2>65**2)return;
      const off=scheduled&&roadsideOff.value;
      mesh.material=off?quietPaint:mat;
      pavement(off?'./paving-roadside-off.webp':'./paving-light.webp',mesh.material);
    };
    group.push(mesh);root.add(mesh);return K.addMesh(root);
  }
  K.onSolarAltitude?.(change);
  return {level,place,roadsideOff};
}

// These two printed faces share one geometry and draw. Only the road-side
// face of island 22-020 loses its backlight during the operator's off hour.
function timedPosterMaterial(source,off,coarse){
  const paint=source.clone();
  paint.onBeforeCompile=shader=>{
    shader.uniforms.roadsideOff=off;
    shader.vertexShader='varying float roadPrint;\n'+shader.vertexShader.replace(
      '#include <begin_vertex>','#include <begin_vertex>\nroadPrint=step(.5,-normal.z);');
    const slot=coarse?'map_fragment':'emissivemap_fragment';
    const attenuate=coarse?'diffuseColor.rgb *= mix(1.0,.22,roadPrint*roadsideOff);':
      'totalEmissiveRadiance *= 1.0-roadPrint*roadsideOff;';
    shader.fragmentShader='varying float roadPrint;\nuniform float roadsideOff;\n'+
      shader.fragmentShader.replace('#include <'+slot+'>','#include <'+slot+'>\n'+attenuate);
  };
  paint.customProgramCacheKey=()=>coarse?'scheduled-print-far':'scheduled-print-near';
  return paint;
}

function platformBoard(K,at,angle,id,res,visible){
  const T=K.THREE;
  placeSingleDetail(K,{name:display,file:'../sinbanpo-bus-shelters/display.glb',at,angle,
    range:12,exitRange:15,floorTolerance:3.2,eyeHeight:2.22,fallback:res.board,
    fallbackMaterial:res.framePaint,material:res.framePaint,closeVisibleFrom:visible});
  const canvas=makeCanvas(512,128),ctx=canvas.getContext('2d');
  const tex=new T.CanvasTexture(canvas);tex.colorSpace=T.SRGBColorSpace;tex.anisotropy=4;
  const face=new T.Mesh(new T.PlaneGeometry(1.071,.251),new T.MeshBasicMaterial({map:tex,toneMapped:false}));
  face.name='정류소 '+id+' · 서울 시각';face.position.set(0,2.186,-.270);
  // The public display gives a real Seoul clock. Printed stop codes and destinations
  // remain stable when the network is offline and do not imply live bus arrivals.
  let lastMinute='';
  face.onBeforeRender=()=>{
    const now=K.displayClock?.()??seoulClock(Date.now());if(now===lastMinute)return;lastMinute=now;
    paintClock(ctx,id,now);tex.needsUpdate=true;
  };
  face.onBeforeRender();
  const screen=new T.Group();screen.name='중앙차로 승차대 · 전광판 '+id;
  screen.position.set(...at);screen.rotation.y=angle;screen.add(face);K.addMesh(screen);
}

export function placeMedianShelters(K,P,angle,id,platformY){
  const T=K.THREE;
  let shared=byKit.get(K);
  if(!shared){shared={res:resources(T),light:lighting(K)};byKit.set(K,shared);}
  const {res,light}=shared;
  K.spawn({name:'고속터미널 중앙정류소 · '+id.slice(0,2)+'-'+id.slice(2),...P(0,.80),
    y:platformY,yaw:angle,group:'고속터미널 거리'});
  for(const u of [-8.3,0,8.3]){
    const {x,z}=P(u,0),at=[x,platformY,z];
    const luminaire=P(u,.11);
    K.streetLight?.(luminaire.x,platformY+2.65,luminaire.z,.057);
    const props={angle,at,floorTolerance:4.1};
    const visible=eye=>{
      const y=eye.y-relief(eye.x,eye.z);
      return y>=platformY-.07||!K.phys.ceilingBlocksView(eye.x,y,eye.z,x,platformY+1.9,z);
    };
    const frame=placeSingleDetail(K,{...props,name:structural,file:'../sinbanpo-bus-shelters/frame.glb',
      fallback:res.frame,fallbackMaterial:res.framePaint,range:18,exitRange:22,eyeHeight:1.65,closeVisibleFrom:visible});
    const steel=frame.children[0],selectFrame=steel.onBeforeRender;
    steel.onBeforeRender=(renderer,scene,camera)=>{
      selectFrame(renderer,scene,camera);
      const material=steel.material;
      if(steel.geometry!==res.frame&&!material.userData.shelterFill){
        material.userData.shelterFill=true;
        material.onBeforeCompile=shader=>{
          shader.uniforms.shelterLamps=light.level;
          shader.fragmentShader='uniform float shelterLamps;\n'+shader.fragmentShader.replace(
            '#include <opaque_fragment>','outgoingLight+=diffuseColor.rgb*shelterLamps*.34;\n#include <opaque_fragment>');
        };
        material.needsUpdate=true;
      }
    };
    const scheduled=id==='22020';
    light.place(at,angle,scheduled);
    placeSingleDetail(K,{...props,name:glazed,file:'../sinbanpo-bus-shelters/glass.glb',
      fallback:res.glass,fallbackMaterial:res.glassPaint,range:25,exitRange:30,eyeHeight:1.44,closeVisibleFrom:visible});
    const posters=placeSingleDetail(K,{...props,name:prints+(scheduled?' 22-020':''),file:'../sinbanpo-bus-shelters/posters.glb',
      fallback:res.poster,fallbackMaterial:res.signPaint,range:25,exitRange:30,eyeHeight:1.28,closeVisibleFrom:visible});
    const item=posters.children[0],select=item.onBeforeRender;
    item.onBeforeRender=(renderer,scene,camera)=>{
      select(renderer,scene,camera);
      if(scheduled&&light.roadsideOff.value){
        const coarse=item.geometry===res.poster;
        const original=item.material,key=coarse?'timedFallback':'timedSurface';
        const paint=res[key]??=timedPosterMaterial(original,light.roadsideOff,coarse);
        if(coarse&&paint.map!==res.signPaint.map){
          paint.map=res.signPaint.map;paint.color.copy(res.signPaint.color);paint.needsUpdate=true;
        }
        item.material=paint;
      }
      if(item.material.emissiveMap)item.material.emissiveIntensity=1+light.level.value*1.35;
      if(item.geometry===res.poster&&Math.abs(camera.position.y-(platformY+1.44+relief(x,z)))<7&&
          (camera.position.x-x)**2+(camera.position.z-z)**2<75**2&&visible(camera.position))res.smallPrint();
    };
    if(u===0)platformBoard(K,at,angle,id,res,visible);
    // Keep the glazed rear and the walkable faces at the same footprint as the native mesh.
    K.withTerrainAnchor(x,z,()=>{
      const [a,b]=[-3.31,3.31].map(o=>P(u+o,-.89));
      K.phys.addWall(a.x,a.z,b.x,b.z,platformY+.02,platformY+2.60,.060,'streets');
      const p=P(u,-.443);
      K.box({...p,y:platformY,w:3.55,d:.495,h:.463,rotY:angle,skip:unseen,mat:0x675342});
    });
  }
}
