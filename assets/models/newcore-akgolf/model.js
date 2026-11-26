import {boxSilhouette} from '../interior-architecture/box-silhouette.js';
import {placeSingleDetail} from '../interior-architecture/single-detail.js';
import {relief} from '../../../js/banpo_relief.js';

export function akGolfSalesFloor(F,u,y,front,depth,width,visibleFrom){
  const {K}=F,T=K.THREE,[x,z]=F.P(u,front),ground=relief(x,z);
  const fallback=boxSilhouette(T,[
    [0,.03,9.68,5.38,3.31,.12,0x292a2d],[0,.04,9.53,1.77,2.77,.12,0x805c42],
    [-1.41,.025,2.64,1.93,.12,.90,0x34363a],[-1.41,.83,2.64,1.85,.15,.68,0x999da0],
    [1.47,.03,3.48,1.82,.095,1.14,0x464850],
    ...[-.55,-.03,.50].map((off,i)=>[1.47+off,.13,3.67,.31,.91,.24,[0xdedccd,0x414249,0x4d5b72][i]]),
    ...[.69,1,1.31,1.62].map(h=>[1.72,h,9.26,1.56,.04,.43,0x464850])
  ]);
  const paint=new T.MeshPhongMaterial({vertexColors:true,side:T.DoubleSide,shininess:32,specular:0x4d4b47});
  paint.defines={BANPO_RIGID:1};
  paint.onBeforeCompile=shader=>{
    shader.uniforms.akOrigin={value:new T.Vector3(x,y+ground,z)};
    shader.uniforms.akDepth={value:new T.Vector2(Math.sin(F.angle),Math.cos(F.angle))};
    shader.vertexShader='uniform vec3 akOrigin;uniform vec2 akDepth;varying vec3 akWorld;varying vec2 akBay;\n'+shader.vertexShader.replace('#include <project_vertex>',
      `#include <project_vertex>
       akWorld=(modelMatrix*vec4(transformed,1.)).xyz;
       vec2 p=akWorld.xz-akOrigin.xz;
       akBay=vec2(dot(p,vec2(akDepth.y,-akDepth.x)),dot(p,akDepth));`);
    shader.fragmentShader='varying vec3 akWorld;varying vec2 akBay;\n'+shader.fragmentShader.replace('#include <emissivemap_fragment>',
      `#include <emissivemap_fragment>
       float lamp=smoothstep(.93,1.,vColor.r)*smoothstep(.04,.11,vColor.g-vColor.b);
       float clubs=step(akBay.x,-.42)*step(2.06,akBay.y)*step(akBay.y,3.11);
       float steel=smoothstep(.12,.40,vColor.g)*(1.-smoothstep(.06,.15,abs(vColor.g-vColor.b)));
       vec3 r=reflect(normalize(akWorld-cameraPosition),inverseTransformDirection(normal,viewMatrix));
       float glint=pow(max(dot(r,normalize(vec3(-.4,.84,-.35))),0.),12.);
       totalEmissiveRadiance+=vColor.rgb*(.08+.80*lamp)+clubs*steel*glint*vec3(.46,.43,.39);`);
  };
  placeSingleDetail(K,{name:'뉴코아 2관 5층 · AK골프 클럽 매장',file:'../newcore-akgolf/showroom.glb',
    at:[x,y,z],angle:F.angle,rigidGround:ground,fallback,fallbackMaterial:paint,material:paint,
    range:15,exitRange:19,eyeHeight:1.5,floorTolerance:2.5,
    viewBounds:[new T.Box3(new T.Vector3(-2.74,0,.65),new T.Vector3(2.74,3.55,9.79))],
    closeVisibleFrom:p=>visibleFrom(p.x,p.y,p.z)});
  for(const [du,dv,w,d,h] of [[-1.41,2.64,1.93,.90,1.58],[1.47,3.48,1.82,1.14,1.1],[0,9.48,5.38,.53,3.32]])
    K.phys.addPolyWalls(F.Q(u+du-w/2,front+dv-d/2,u+du+w/2,front+dv+d/2),y,y+h,.02,'newcore');
  K.zone({name:'AK골프 강남뉴코아점',sub:'뉴코아 2관 5층 · 클럽과 골프용품',floor:'5F',
    poly:F.Q(u-width/2+.15,front+.06,u+width/2-.15,front+depth-.15),y0:y-.12,y1:y+3.48,priority:5});
  const [ax,az]=F.P(u+.16,front-1.05),[tx,tz]=F.P(u-.37,front+5);
  K.spawn({name:'AK골프 강남뉴코아점 입구',place:'newcore',floor:'5F',mapDestination:true,
    aliases:['AK골프','AK 골프','AKGOLF','에이케이골프'],x:ax,y:y-.034,z:az,
    yaw:Math.atan2(ax-tx,az-tz),pitchDeg:-2});
}
