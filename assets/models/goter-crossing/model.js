import {dotCenters,guideCenters,tiles} from './tactile.js';
import {loadArchitecture} from '../interior-architecture/model.js';
import {placeSingleDetail} from '../interior-architecture/single-detail.js';
import {boxSilhouette} from '../interior-architecture/box-silhouette.js';
import {relief} from '../../../js/banpo_relief.js';
import {angle,apron,origin,parts,prefix,rows,toWorld,walk} from './layout.js';

const brown=0x514644,black=0x252a2c,blue=0x254681;
function silhouettes(T){
  const boxes={
    booms:[[.04,2.025,5.112,11.7,.13,.13,brown],[5.722,2.05,0,.13,.13,10.2,brown]],
    mast:[[0,0,0,.32,.17,.32,0x5d554f],[0,.13,0,.241,6.87,.241,brown]],
    walker:[0,1,2].map(i=>[0,.018+i*.341,0,.33,.329,.208,black]),
    pixels:[[0,0,0,.252,.938,.008,0x26312f],[0,.735,-.006,.044,.153,.012,0xed4031]],
    sound:[[0,0,0,.14,.47,.106,0x474d4f],[0,.152,-.059,.064,.064,.022,0xe4b03b]],
    sinbanpo:[[0,0,0,1.09,.306,.059,blue]],jamwon:[[0,0,0,.93,.285,.059,blue]],
    four:[-.552,-.184,.184,.552].map(x=>[x,.043,0,.357,.357,.21,black]),
    lens:[-.552,-.184,.184,.552].map((x,i)=>[x,.03,0,.243,.246,.009,i===0?0xf04435:0x29332e]),
    bollard:[[0,0,0,.103,.84,.103,black],...[.543,.673].map(y=>[0,y,0,.109,.064,.109,0xdbded8])],
    tactile:tiles.map(({x,d})=>[x-.82,0,d-1.32,.293,.014,.293,0xd6a946]),
  };
  const geometries=Object.fromEntries(Object.entries(boxes).map(([k,v])=>[k,boxSilhouette(T,v)]));
  const shape=new T.Shape(apron.map(([x,d])=>new T.Vector2(x-4.65,-d+4.95)));
  const pavement=new T.ExtrudeGeometry(shape,{depth:.144,bevelEnabled:false}).rotateX(-Math.PI/2);
  const tint=new T.Color(0xadada5),rgb=new Float32Array(pavement.attributes.position.count*3);
  for(let i=0;i<rgb.length;i+=3)tint.toArray(rgb,i);
  pavement.setAttribute('color',new T.BufferAttribute(rgb,3));geometries.stone=pavement;
  return geometries;
}
const range={stone:20,tactile:8,mast:23,booms:30,walker:20,pixels:20,sound:5,sinbanpo:25,jamwon:25,four:27,lens:28,bollard:9};
export function placeGoterCrossing(K){
  const T=K.THREE,poly=apron.map(([x,d])=>toWorld(x,d));
  K.withTerrainAnchor(...origin,()=>{
    K.phys.addSurface(poly,walk+.009,{tag:'streets'});
    for(const [x,d,r] of [[0,0,.14],...rows.filter(p=>p.key==='bollard').map(p=>[p.x,p.d,.057])]){
      const [a,b]=toWorld(x,d);K.phys.addWall(a-.002,b,a+.002,b,walk,walk+(r>.1?7.0:.85),r,'streets');
    }
  });
  const paint=new T.MeshLambertMaterial({vertexColors:true,side:T.DoubleSide});
  const lamps=new T.MeshBasicMaterial({vertexColors:true,side:T.DoubleSide,toneMapped:false});
  // CPU frustum bounds and physical ground share the same fixed mast height.
  paint.defines={BANPO_RIGID:1};lamps.defines={BANPO_RIGID:1};
  const daylight={value:1};
  K.onSolarAltitude?.(altitude=>{daylight.value=T.MathUtils.smoothstep(altitude,-7,4);});
  lamps.onBeforeCompile=shader=>{
    shader.uniforms.crossingDaylight=daylight;
    shader.fragmentShader=shader.fragmentShader.replace('#include <common>','#include <common>\nuniform float crossingDaylight;')
      .replace('#include <color_fragment>',`#include <color_fragment>
        float activeLED=smoothstep(.08,.29,diffuseColor.r-diffuseColor.g);
        diffuseColor.rgb*=mix(mix(.075,2.2,activeLED),1.,crossingDaylight);`);
  };
  const geometry=silhouettes(T);
  const terrain=relief(...origin);
  const granite=paint.clone();granite.defines={BANPO_RIGID:1};
  granite.onBeforeCompile=shader=>{
    shader.vertexShader=shader.vertexShader.replace('#include <common>','#include <common>\nvarying vec3 granitePosition;')
      .replace('#include <project_vertex>','#include <project_vertex>\ngranitePosition=(modelMatrix*vec4(transformed,1.)).xyz;');
    shader.fragmentShader=shader.fragmentShader.replace('#include <common>','#include <common>\nvarying vec3 granitePosition;')
      .replace('#include <color_fragment>',`#include <color_fragment>
        vec2 xy=granitePosition.xz*295.;vec2 p=fract(floor(xy)*vec2(.1031,.11369));
        float grain=fract((p.x+p.y+.33)*(dot(p,p.yx+19.19)+p.x));
        float weight=1.-smoothstep(.24,2.2,max(fwidth(xy.x),fwidth(xy.y)));
        diffuseColor.rgb*=1.+weight*((grain-.5)*.34+smoothstep(.87,1.,grain)*.21);`);
  };
  for(const {key,x,d,y,yaw} of rows){
    const [wx,wz]=toWorld(x,d),rot=angle+yaw,at=[wx,walk+y,wz];
    const [label,w,depth,h]=parts[key],name=prefix+label;
    const isFace=key==='pixels'||key==='lens',close=range[key];
    const visible=eye=>{
      if(eye.y-relief(eye.x,eye.z)<-.25)return false;
      return !isFace||((eye.x-wx)*Math.sin(rot)+(eye.z-wz)*Math.cos(rot))<.03;
    };
    const mat=key==='stone'?granite:isFace?lamps:paint;
    const root=placeSingleDetail(K,{name,at,rigidGround:terrain,angle:rot,file:'../goter-crossing/'+key+'.glb',range:close,exitRange:close+4,
      floorTolerance:key==='booms'||key==='four'||key==='lens'?9:7,eyeHeight:h/2,closeVisibleFrom:visible,
      viewBounds:[new T.Box3(new T.Vector3(-w/2,key==='walker'?-.22:-.01,-depth/2),new T.Vector3(w/2,h,depth/2))],
      fallback:geometry[key],fallbackMaterial:mat,material:mat});
    if(key==='tactile')addTactileRelief(T,root,geometry[key],paint);
  }
}

function addTactileRelief(T,root,fallback,mat){
  const board=root.children[0],select=board.onBeforeRender,groups=[];
  let pending=false,retry=0;
  board.onBeforeRender=(...args)=>{
    select(...args);
    const close=board.geometry!==fallback;
    if(groups.length){for(const group of groups)group.visible=close;return;}
    if(!close||pending||performance.now()<retry)return;
    pending=true;
    Promise.all(['dot','guide'].map(key=>loadArchitecture('../goter-crossing/'+key+'.glb'))).then(surfaces=>{
      for(const [index,[source]] of surfaces.entries()){
        const coords=index===0?dotCenters:guideCenters;
        source.updateWorldMatrix(true,false);
        const mesh=new T.InstancedMesh(source.geometry,mat,coords.length);
        const m=new T.Matrix4(),turn=new T.Matrix4();
        coords.forEach(([x,y,d,angle=0],i)=>mesh.setMatrixAt(i,
          m.makeTranslation(x,y,d).multiply(turn.makeRotationY(angle)).multiply(source.matrixWorld)));
        mesh.name=index===0?'화강석 보도 · 점자블록의 촉지 돌기':'화강석 보도 · 선형블록의 촉지 돌기';
        mesh.computeBoundingSphere();groups.push(mesh);root.add(mesh);
      }
    }).catch(()=>{retry=performance.now()+10000;}).finally(()=>{pending=false;});
  };
}
