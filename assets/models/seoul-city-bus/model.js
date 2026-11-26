import {vertexData,indexData} from './distant.js';
import {boxSilhouette} from '../interior-architecture/box-silhouette.js';
import {loadArchitecture} from '../interior-architecture/model.js';
import {relief} from '../../../js/banpo_relief.js';
import {attachCitySeats} from './seats.js';
import {cityBusGlass} from './glass.js';
import {makeCanvas,FONT} from '../../../js/textures.js';

const surfaces=new Map(),kits=new WeakMap();

function geometry(T){
  const bytes=Uint8Array.from(atob(vertexData),v=>v.charCodeAt(0)),data=new DataView(bytes.buffer);
  const n=bytes.length/9,positions=new Float32Array(n*3),rgb=new Float32Array(n*3),col=new T.Color();
  for(let i=0;i<n;i++){
    for(let a=0;a<3;a++)positions[i*3+a]=data.getInt16(i*9+a*2,true)/100;
    col.setRGB(bytes[i*9+6]/255,bytes[i*9+7]/255,bytes[i*9+8]/255,T.SRGBColorSpace).toArray(rgb,3*i);
  }
  const indices=Uint8Array.from(atob(indexData),v=>v.charCodeAt(0)),read=new DataView(indices.buffer);
  const ix=Uint16Array.from({length:indices.length/2},(_,i)=>read.getUint16(2*i,true));
  const g=new T.BufferGeometry();g.setAttribute('position',new T.BufferAttribute(positions,3));
  g.setAttribute('color',new T.BufferAttribute(rgb,3));g.setIndex(new T.BufferAttribute(ix,1));
  g.computeVertexNormals();g.computeBoundingBox();g.computeBoundingSphere();return g;
}
function request(file){
  let state=surfaces.get(file);
  if(!state){state={parts:null,loading:false,next:0};surfaces.set(file,state);}
  if(!state.parts&&!state.loading&&performance.now()>=state.next){
    state.loading=true;
    loadArchitecture('../seoul-city-bus/'+file+'.glb').then(parts=>{
      for(const part of parts)part.updateWorldMatrix(true,false);
      state.parts=parts;
    }).catch(()=>{state.next=performance.now()+10000;}).finally(()=>{state.loading=false;});
  }
  return state.parts;
}
function makeResources(K){
  const T=K.THREE,level={value:0};
  K.onSolarAltitude?.(alt=>{const f=T.MathUtils.clamp((4-alt)/9,0,1);level.value=f*f*(3-2*f);});
  // Materials are rigid. Their transforms already contain the actual four-wheel road slope.
  const rigid=mat=>{mat.defines={...mat.defines,BANPO_RIGID:1};return mat;};
  const shell=rigid(new T.MeshPhongMaterial({vertexColors:true,shininess:18,specular:0x252c2f,side:T.DoubleSide}));
  const cabin=rigid(new T.MeshLambertMaterial({vertexColors:true,side:T.DoubleSide}));
  cabin.onBeforeCompile=shader=>{
    shader.uniforms.busCabinLamps=level;shader.fragmentShader='uniform float busCabinLamps;\n'+shader.fragmentShader.replace(
      '#include <opaque_fragment>','outgoingLight+=diffuseColor.rgb*busCabinLamps*.56;\n#include <opaque_fragment>');
  };
  const blank=new T.DataTexture(new Uint8Array([19,25,28,255]),1,1);blank.needsUpdate=true;
  const probe={texture:{value:blank},ready:{value:0},next:0,loading:false};
  const shadow=new T.MeshBasicMaterial({color:0xffffff,blending:T.MultiplyBlending,transparent:true,depthWrite:false,side:T.DoubleSide});
  rigid(shadow);let shadowPending=false,shadowRetry=0;
  const beam=rigid(new T.MeshBasicMaterial({map:blank,blending:T.AdditiveBlending,transparent:true,depthWrite:false,
    side:T.DoubleSide,toneMapped:false}));
  const lenses=rigid(new T.MeshBasicMaterial({vertexColors:true,toneMapped:false,transparent:true,depthWrite:false,side:T.DoubleSide}));
  let beamPending=false,beamRetry=0;
  function acquireBeam(){
    if(beam.map!==blank||beamPending||performance.now()<beamRetry)return;
    beamPending=true;new T.TextureLoader().load(new URL('./beams.webp',import.meta.url).href,t=>{
      t.colorSpace=T.SRGBColorSpace;t.anisotropy=4;beam.map=t;beam.needsUpdate=true;
    },undefined,()=>{beamPending=false;beamRetry=performance.now()+10000;});
  }
  function acquireImages(){
    if(!probe.ready.value&&!probe.loading&&performance.now()>=probe.next){
      probe.loading=true;
      new T.TextureLoader().load(new URL('./reflections.webp',import.meta.url).href,tex=>{
        tex.colorSpace=T.SRGBColorSpace;tex.wrapS=T.RepeatWrapping;
        probe.texture.value=tex;probe.ready.value=1;
      },undefined,()=>{probe.loading=false;probe.next=performance.now()+10000;});
    }
    if(!shadow.map&&!shadowPending&&performance.now()>=shadowRetry){
      shadowPending=true;
      new T.TextureLoader().load(new URL('./contact.webp',import.meta.url).href,tex=>{
        // The grayscale receiver stores linear occlusion. Flat white borders do not change the street.
        shadow.map=tex;shadow.needsUpdate=true;
      },undefined,()=>{shadowPending=false;shadowRetry=performance.now()+10000;});
    }
  }
  const lowCabin=[];
  for(const x of [-.86,.86])for(const d of [-4.70,-3.82,-2.77,-1.81,-.95,.57,1.55,2.69]){
    const base=d<-2.45?.84:.46;lowCabin.push([x,base+.32,d,.55,.10,.45,0x677e82],[x,base+.39,d-.17,.51,.40,.072,0x70888b]);
  }
  lowCabin.push([0,.33,0,2.28,.06,10.2,0x535e62],[0,2.62,0,2.21,.04,10.2,0xd6ddd7]);
  return {far:geometry(T),shell,glass:new Map(),cabin,lowCabin:boxSilhouette(T,lowCabin),rigid,route:new Map(),
    probe,level,acquireImages,shadow,beam,lenses,acquireBeam};
}
function routeFaces(K,R,route){
  if(!R.route.has(route)){
    const T=K.THREE,canvas=makeCanvas(320,64),ctx=canvas.getContext('2d');
    ctx.fillStyle='#152022';ctx.fillRect(0,0,320,64);ctx.textBaseline='middle';
    ctx.font='bold 53px monospace';ctx.fillStyle='#efbc62';ctx.fillText(route,6,35);
    ctx.font='bold 32px '+FONT;ctx.fillStyle='#a2dfac';ctx.fillText('고속터미널',112,34);
    const tex=new T.CanvasTexture(canvas);tex.colorSpace=T.SRGBColorSpace;
    const mat=R.rigid(new T.MeshBasicMaterial({map:tex,toneMapped:false,side:T.DoubleSide}));
    const vs=[],uv=[],idx=[];
    for(const s of [-1,1]){
      const a=vs.length/3,d=s*5.498;
      vs.push(-s*.90,2.605,d,s*.90,2.605,d,s*.90,2.829,d,-s*.90,2.829,d);
      uv.push(0,0,1,0,1,1,0,1);idx.push(a,a+1,a+2,a,a+2,a+3);
    }
    const g=new T.BufferGeometry();g.setAttribute('position',new T.Float32BufferAttribute(vs,3));
    g.setAttribute('uv',new T.Float32BufferAttribute(uv,2));g.setIndex(idx);R.route.set(route,{geometry:g,material:mat});
  }
  return R.route.get(route);
}
function apply(mesh,surface,defaultShape,material){
  const shape=surface?.geometry??defaultShape;
  if(mesh.geometry===shape&&mesh.material===material)return;
  mesh.geometry=shape;mesh.material=material;
  if(surface)mesh.matrix.copy(surface.matrixWorld);else mesh.matrix.identity();
  mesh.updateWorldMatrix(true,false);
}

export function placeSeoulCityBus(K,stop,roadY,route){
  const {x,z,rot}=stop,T=K.THREE;
  let R=kits.get(K);if(!R){R=makeResources(K);kits.set(K,R);}
  const {geometry:lowSign,material:signPaint}=routeFaces(K,R,route);
  return K.withParkedVehicle(x,roadY,z,rot,.985,2.70,0,(_atWheel,wheels,tilt)=>{
    const root=new T.Group();root.name='신반포로 간선버스 · '+route+'번';root.position.set(x,wheels.height,z);
    root.rotation.y=rot;root.quaternion.premultiply(tilt);root.userData.terrainApplied=true;
    const make=(name,geometry,material)=>{
      const m=new T.Mesh(geometry,material);m.name=name;m.matrixAutoUpdate=false;root.add(m);return m;
    };
    const bus=make('간선버스 · 차체와 휠',R.far,R.shell);
    if(!R.glass.has(route))R.glass.set(route,cityBusGlass(T,route,R.probe,R.level));
    const glassMaterial=R.glass.get(route);
    const glass=make('간선버스 · 유리',R.far,glassMaterial),cabin=make('간선버스 · 승객석',R.lowCabin,R.cabin);
    glass.visible=cabin.visible=false;
    const receiver=new T.PlaneGeometry(5.8,14);receiver.rotateX(-Math.PI/2);
    const shade=make('간선버스 · 바퀴와 차대 밑 그늘',receiver,R.shadow);
    shade.matrix.makeTranslation(0,.013,0);shade.visible=false;
    const road=new T.PlaneGeometry(7,8);road.rotateX(-Math.PI/2);
    const lightPatch=make('간선버스 · 도로를 비추는 하향등',road,R.beam);
    lightPatch.matrix.makeTranslation(0,.021,8.95);lightPatch.visible=false;
    const lenses=make('간선버스 · 차폭등과 전조등 렌즈',lowSign,R.lenses);
    lenses.visible=false;
    const sign=make('간선버스 · 노선 전광판',lowSign,signPaint);
    const print=make('간선버스 · 차체 인쇄',lowSign,signPaint);print.visible=false;
    const bounds=new T.Box3(new T.Vector3(-1.5,.22,-5.51),new T.Vector3(1.5,3.40,5.51));
    const frustum=new T.Frustum(),mx=new T.Matrix4();
    let full=false,inside=false,seats=null;
    bus.onBeforeRender=(_renderer,_scene,camera)=>{
      const eye=camera.position,dist=(eye.x-x)**2+(eye.z-z)**2;
      const h=eye.y-relief(eye.x,eye.z);
      let inView=false;
      if(h>=-.05&&h<10.5&&dist<52*52){
        mx.multiplyMatrices(camera.projectionMatrix,camera.matrixWorldInverse).multiply(root.matrixWorld);
        frustum.setFromProjectionMatrix(mx);inView=frustum.intersectsBox(bounds);
      }
      const near=inView&&dist<(full?47:40)**2;
      const hull=near?request('body')?.[0]:null,glazing=near?request('glass')?.[0]:null;
      full=!!(hull&&glazing);
      apply(bus,full?hull:null,R.far,R.shell);
      glass.visible=cabin.visible=full;
      if(inView)R.acquireImages();
      shade.visible=!!R.shadow.map;
      const evening=R.level.value;
      const lit=inView&&evening>.003;
      const lamps=lit?request('lamps')?.[0]:null;
      if(lit)R.acquireBeam();
      R.lenses.opacity=evening;R.beam.opacity=evening;
      lenses.visible=!!lamps;lightPatch.visible=lit;
      if(lamps)apply(lenses,lamps,lowSign,R.lenses);
      if(full){
        apply(glass,glazing,R.far,glassMaterial);
        const close=dist<(inside?25:20)**2;
        const furnishings=close?request('cabin')?.[0]:null,chairParts=close?request('seats'):null;
        inside=!!(furnishings&&chairParts);
        apply(cabin,inside?furnishings:null,R.lowCabin,R.cabin);
        if(inside&&!seats)seats=attachCitySeats(T,root,chairParts,R.cabin);
      }else inside=false;
      if(seats)for(const bank of seats)bank.visible=inside;
      const lettering=inView&&dist<44**2?request(route):null;
      const light=lettering?.find(p=>p.material.emissiveMap),stencil=lettering?.find(p=>!p.material.emissiveMap);
      if(light&&!light.userData.roadSignMaterial){
        light.userData.roadSignMaterial=R.rigid(new T.MeshBasicMaterial({map:light.material.map,side:T.DoubleSide,toneMapped:false}));
        stencil.userData.roadSignMaterial=R.rigid(new T.MeshLambertMaterial({map:stencil.material.map,alphaTest:.35,side:T.DoubleSide}));
      }
      apply(sign,light,lowSign,light?.userData.roadSignMaterial??signPaint);
      print.visible=!!stencil;
      if(stencil)apply(print,stencil,lowSign,stencil.userData.roadSignMaterial);
    };
    const s=Math.sin(rot),c=Math.cos(rot),p=(u,v)=>[x+c*u+s*v,z-s*u+c*v];
    const poly=[p(-1.245,-5.4975),p(1.245,-5.4975),p(1.245,5.4975),p(-1.245,5.4975)];
    K.phys.addPolyWalls(poly,roadY,roadY+3.40,.02,'streets');K.phys.addSurface(poly,roadY+3.4,{});
    return K.addMesh(root);
  });
}
