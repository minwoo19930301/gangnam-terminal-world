import {mergeGeometries} from 'three/addons/utils/BufferGeometryUtils.js';
import {placeSingleDetail} from '../interior-architecture/single-detail.js';
import {loadArchitecture} from '../interior-architecture/model.js';
import {relief} from '../../../js/banpo_relief.js';

export function vanLeeuwen(K,x,y,z,angle){
  const T=K.THREE,pieces=[];
  function block(cx,cy,cz,w,h,d,color){
    const g=new T.BoxGeometry(w,h,d).translate(cx,cy,cz);
    const values=new Float32Array(g.attributes.position.count*3),shade=new T.Color(color);
    for(let i=0;i<values.length;i+=3)shade.toArray(values,i);
    g.setAttribute('color',new T.Float32BufferAttribute(values,3));pieces.push(g);
  }
  for(const side of [-1,1])block(side*3.08,1.48,-.05,.75,2.96,.11,0xb17d4a);
  block(0,3.13,-.05,6.95,.16,.31,0x945f37);
  block(0,2.83,0,2.36,.43,.10,0x302c28);
  block(0,1.48,-2.24,6.48,2.96,.15,0xf2e6c8);
  block(0,2.36,-2.11,3.75,.73,.12,0xd9e2d2);
  block(0,.51,-.40,5.40,1.02,.91,0xdec7a3);
  block(-.68,1.59,-.74,1.15,.97,.105,0xc9e6db);
  const silhouette=mergeGeometries(pieces);pieces.forEach(g=>g.dispose());
  return placeSingleDetail(K,{
    name:'밴루엔 · 아이스크림과 밀크셰이크',file:'../van-leeuwen/display.glb',at:[x,y,z],angle,
    rigidGround:relief(x,z),fallback:silhouette,fallbackMaterial:new T.MeshLambertMaterial({vertexColors:true}),
    async loadSurface(file){
      const [surface]=await loadArchitecture(file);
      surface.material=new T.MeshPhongMaterial({map:surface.material.map,vertexColors:true,shininess:15});
      surface.material.onBeforeCompile=shader=>{
        shader.fragmentShader=shader.fragmentShader.replace('#include <emissivemap_fragment>',
          '#include <emissivemap_fragment>\n totalEmissiveRadiance += diffuseColor.rgb * vec3(.22,.20,.16);');
      };
      return [surface];
    },
    range:12,exitRange:15,eyeHeight:1.5,floorTolerance:2.1,
    viewBounds:[new T.Box3(new T.Vector3(-3.5,0,-2.4),new T.Vector3(3.5,3.25,.15))],
    closeVisibleFrom:p=>(p.x-x)*Math.sin(angle)+(p.z-z)*Math.cos(angle)>-.6
  });
}
