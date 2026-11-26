import {boxSilhouette} from '../interior-architecture/box-silhouette.js';
import {placeSingleDetail} from '../interior-architecture/single-detail.js';
import {relief} from '../../../js/banpo_relief.js';

export function chageeCounter(K,x,y,z,angle){
  const T=K.THREE,ground=relief(x,z);
  const proxy=boxSilhouette(T,[
    [0,.025,0,6.26,.91,1.36,0xbdac97],[0,.924,0,6.31,.073,1.41,0xd3c3aa],
    [0,.02,-2.55,6.44,3.12,.11,0xbaa88e],[.18,2.39,-.66,4.86,.68,.69,0xffe7b4],
    [-2.62,1.03,-.46,.78,2.05,1.06,0xffe7b4],[-.80,.99,-1.19,.67,1.4,.58,0xe5dfd0]
  ]);
  const paint=new T.MeshLambertMaterial({vertexColors:true,side:T.DoubleSide});
  paint.defines={BANPO_RIGID:1};
  paint.onBeforeCompile=shader=>{
    shader.uniforms.teaOrigin={value:new T.Vector3(x,y+ground,z)};
    shader.uniforms.teaAxes={value:new T.Vector2(Math.cos(angle),Math.sin(angle))};
    shader.vertexShader='uniform vec3 teaOrigin;uniform vec2 teaAxes;varying vec3 teaPoint;\n'+shader.vertexShader.replace('#include <project_vertex>',
      `#include <project_vertex>
       vec3 delta=(modelMatrix*vec4(transformed,1.)).xyz-teaOrigin;
       teaPoint=vec3(dot(delta.xz,vec2(teaAxes.x,-teaAxes.y)),delta.y,dot(delta.xz,teaAxes.yx));`);
    shader.fragmentShader='varying vec3 teaPoint;\n'+shader.fragmentShader.replace('#include <color_fragment>',
      `#include <color_fragment>
       // Soft variations in the grey stone slab and the warm backlit paper.
       float stone=step(teaPoint.y,1.005)*(1.-smoothstep(.02,.15,distance(vColor.rgb,vec3(.51,.412,.31))));
       float vein=sin(7.*teaPoint.x+4.*teaPoint.y+3.*teaPoint.z+1.8*sin(5.*teaPoint.y+2.4*teaPoint.x));
       diffuseColor.rgb*=1.+stone*(.025*vein-.082*smoothstep(.93,1.,vein));
       float leaf=1.-smoothstep(.035,.09,distance(vColor.rgb,vec3(1.,.799,.456)));
       float bay=pow(abs(sin(teaPoint.x*10.33)),.8);
       diffuseColor.rgb*=1.+leaf*(.08*bay-.06);`);
    shader.fragmentShader=shader.fragmentShader.replace('#include <emissivemap_fragment>',
      `#include <emissivemap_fragment>
       float paper=smoothstep(.90,.99,vColor.r)*smoothstep(.12,.19,vColor.g-vColor.b);
       float shelf=exp(-.90*abs(teaPoint.z+2.20))*smoothstep(.7,1.15,teaPoint.y);
       float wash=exp(-.62*distance(teaPoint,vec3(.05,2.28,-.75)));
       totalEmissiveRadiance+=diffuseColor.rgb*(.055+.16*wash+.14*shelf+.47*paper);`);
  };
  return placeSingleDetail(K,{name:'스위트 파크 · 차지 목재 격자 티 바',file:'../sweet-chagee/counter.glb',
    at:[x,y,z],angle,rigidGround:ground,fallback:proxy,fallbackMaterial:paint,material:paint,
    range:11,exitRange:15,eyeHeight:1.56,floorTolerance:2.5,
    viewBounds:[new T.Box3(new T.Vector3(-3.23,0,-2.62),new T.Vector3(3.23,3.15,.72))],
    closeVisibleFrom:p=>(p.x-x)*Math.sin(angle)+(p.z-z)*Math.cos(angle)>-.75});
}
