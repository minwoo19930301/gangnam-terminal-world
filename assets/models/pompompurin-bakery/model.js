import {mergeGeometries} from 'three/addons/utils/BufferGeometryUtils.js';
import {loadArchitecture} from '../interior-architecture/model.js';
import {placeSingleDetail} from '../interior-architecture/single-detail.js';
import {relief} from '../../../js/banpo_relief.js';

export function bakeryCafe(K,x,y,z,angle){
  const T=K.THREE;
  // Keep the yellow oven, dark mouth and golden chef readable across the hall.
  const pieces=[];
  function paint(geometry,cx,cy,cz,color){
    geometry.translate(cx,cy,cz);
    const rgb=new T.Color(color),values=new Float32Array(geometry.attributes.position.count*3);
    for(let i=0;i<values.length;i+=3)rgb.toArray(values,i);
    geometry.setAttribute('color',new T.Float32BufferAttribute(values,3));
    pieces.push(geometry);
  }
  function oval(cx,cy,cz,rx,ry,rz,color,segments=12,rings=8){
    paint(new T.SphereGeometry(1,segments,rings).scale(rx,ry,rz),cx,cy,cz,color);
  }
  paint(new T.BoxGeometry(4.32,.98,1.07),0,.49,-.15,0xd3ae79);
  for(const dx of [-2.37,2.37])paint(new T.BoxGeometry(1.46,3.10,.15),dx,1.55,-1.17,0xdfc599);
  paint(new T.BoxGeometry(1.10,2.24,.02),-2.39,1.72,-1.06,0xc9d7db);
  paint(new T.BoxGeometry(3.34,1.21,.40),0,1.43,-.82,0xe8c463);
  oval(0,1.91,-.82,1.67,1.08,.20,0xe8c463);
  oval(0,1.55,-.58,1.19,.64,.08,0x796246);
  oval(-.49,1.45,-.21,.45,.43,.29,0xfaebcd);
  oval(-.49,1.96,-.20,.56,.36,.30,0xffde72);
  for(const dx of [-.46,.46])oval(-.49+dx,1.93,-.18,.19,.13,.17,0xffde72);
  oval(-.49,2.34,-.20,.22,.12,.16,0xe9aa49);
  for(const side of [-1,1]){
    oval(-.49+side*.19,2.00,.086,.026,.028,.02,0x614132,8,4);
    oval(-.49+side*.32,1.91,.055,.062,.027,.018,0xeaaca0,8,4);
  }
  oval(-.49,1.95,.106,.048,.025,.018,0x614132,8,4);
  oval(.67,2.64,-.49,.76,.22,.035,0x795865);
  const silhouette=mergeGeometries(pieces);
  pieces.forEach(g=>g.dispose());
  async function loadCounter(file){
    const [surface]=await loadArchitecture(file);
    const finish=new T.MeshPhongMaterial({map:surface.material.map,vertexColors:true,shininess:20});
    // Warm, diffuse display illumination on the printed goods and the oven's pale joinery.
    finish.onBeforeCompile=shader=>{
      shader.fragmentShader=shader.fragmentShader.replace('#include <emissivemap_fragment>',
        '#include <emissivemap_fragment>\n totalEmissiveRadiance += diffuseColor.rgb * vec3(0.18,0.16,0.13);');
    };
    surface.material=finish;return [surface];
  }
  return placeSingleDetail(K,{
    name:'폼폼푸린 · 오븐과 캐릭터 빵',file:'../pompompurin-bakery/display.glb',
    at:[x,y,z],angle,rigidGround:relief(x,z),
    fallback:silhouette,
    fallbackMaterial:new T.MeshLambertMaterial({vertexColors:true}),
    loadSurface:loadCounter,
    range:12,exitRange:15,eyeHeight:1.55,floorTolerance:2.15,
    viewBounds:[new T.Box3(new T.Vector3(-3.12,0,-1.25),new T.Vector3(3.12,3.12,.45))],
    closeVisibleFrom:p=>(p.x-x)*Math.sin(angle)+(p.z-z)*Math.cos(angle)>-.48
  });
}
