import {mergeGeometries} from 'three/addons/utils/BufferGeometryUtils.js';
import {placeSingleDetail} from '../interior-architecture/single-detail.js';
import {loadArchitecture} from '../interior-architecture/model.js';
import {relief} from '../../../js/banpo_relief.js';

export function imDonut(K,x,y,z,angle){
  const T=K.THREE,pieces=[];
  function block(cx,cy,cz,w,h,d,color){
    const g=new T.BoxGeometry(w,h,d).translate(cx,cy,cz);
    const values=new Float32Array(g.attributes.position.count*3),shade=new T.Color(color);
    for(let i=0;i<values.length;i+=3)shade.toArray(values,i);
    g.setAttribute('color',new T.Float32BufferAttribute(values,3));pieces.push(g);
  }
  for(const side of [-1,1])block(side*4.13,1.39,0,.33,2.78,.17,0xad7f50);
  block(0,3.22,-.01,8.65,.17,.28,0x995f39);
  block(0,2.92,.02,3.44,.53,.16,0x29282b);
  block(0,1.56,-2.31,8.20,3.13,.14,0xeee3bd);
  block(2.49,1.70,-2.17,2.95,2.42,.13,0x87949b);
  block(0,.51,-.37,6.41,1.02,.95,0xac754e);
  for(const x of [-2.27,0,2.15])block(x,1.26,-.58,1.1,.34,.38,0xfbf7f2);
  const silhouette=mergeGeometries(pieces);pieces.forEach(g=>g.dispose());
  return placeSingleDetail(K,{
    name:'아임도넛 · 생도넛과 공개 조리창',file:'../im-donut/display.glb',at:[x,y,z],angle,
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
    viewBounds:[new T.Box3(new T.Vector3(-4.34,0,-2.45),new T.Vector3(4.34,3.35,.22))],
    closeVisibleFrom:p=>(p.x-x)*Math.sin(angle)+(p.z-z)*Math.cos(angle)>-.6
  });
}
