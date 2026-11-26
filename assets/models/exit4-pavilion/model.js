import {relief} from '../../../js/banpo_relief.js';
import {boxSilhouette} from '../interior-architecture/box-silhouette.js';
import {placeSingleDetail} from '../interior-architecture/single-detail.js';

export const pavilionName='4번 출구 · 유리 승강장과 돌출 차양';
export const leafName='4번 출구 · 관찰창이 있는 승강기 문짝';

export function placeExitFourPavilion(K,x,z,angle) {
  const T=K.THREE;
  const cos=Math.cos(angle),sin=Math.sin(angle);
  const point=(across,front)=>[x+across*cos+front*sin,z-across*sin+front*cos];
  const shader=new T.MeshPhongMaterial({vertexColors:true,side:T.DoubleSide,shininess:45,specular:0x767d7b});
  shader.defines={BANPO_RIGID:1};
  // Preserve the opal glow of the canopy lamps when the surrounding park turns dark.
  shader.onBeforeCompile=program=>{
    // Bake the four downlights' short reach into the pavilion material.
    // Use asset-local metres so moving a door or the entire pavilion keeps the lighting attached.
    program.vertexShader=program.vertexShader.replace('#include <common>','#include <common>\nvarying vec3 vLiftLocal;')
      .replace('#include <begin_vertex>','#include <begin_vertex>\nvLiftLocal=position;');
    program.fragmentShader=program.fragmentShader.replace('#include <common>','#include <common>\nvarying vec3 vLiftLocal;');
    program.fragmentShader=program.fragmentShader.replace('#include <emissivemap_fragment>',`
      #include <emissivemap_fragment>
      float opal=smoothstep(.9,.98,vColor.r)*smoothstep(.80,.89,vColor.g)*(1.-smoothstep(.76,.90,vColor.b));
      float belowHood=1.-smoothstep(2.90,3.20,vLiftLocal.y);
      float canopyLight=belowHood*(.075+.065*smoothstep(.15,2.65,vLiftLocal.y));
      float lettering=smoothstep(.76,.86,min(vColor.r,min(vColor.g,vColor.b)));
      totalEmissiveRadiance+=vColor.rgb*(.018+canopyLight+opal*.82+lettering*.19);
    `);
  };
  shader.customProgramCacheKey=()=>'exit-four-canopy-glass';
  const near={angle,rigidGround:relief(x,z),material:shader,fallbackMaterial:shader,eyeHeight:1.8,floorTolerance:4.9,range:30,exitRange:38};

  const proxy=[[0,3.78,0,2.68,.55,2.55,0x69767a],[0,2.91,1.9,3.04,.095,1.39,0xafb9bd],
    [0,3.09,1.27,2.54,.48,.04,0x35414c],[0,2.27,1.24,1.72,.22,.17,0xabb3b1]];
  for(const side of [-1,1]) {
    proxy.push([side*.79,0,1.24,.15,2.3,.18,0xabb3b1]);
    for(const depth of [-1,1])proxy.push([side*1.30,.02,depth*1.25,.09,4.27,.09,0xafb9bd]);
  }
  placeSingleDetail(K,{...near,name:pavilionName,file:'../exit4-pavilion/pavilion.glb',
    at:[x,0,z],fallback:boxSilhouette(T,proxy)});

  const doorProxy=boxSilhouette(T,[[0,0,0,.674,2.239,.048,0xabb3b1],[0,.79,.038,.232,.86,.024,0x354346]]);
  const doors=[-1,1].map(side=>{
    const [leafX,leafZ]=point(side*.342,1.197);
    return {side,leafX,leafZ,root:placeSingleDetail(K,{...near,name:leafName,file:'../exit4-pavilion/leaf.glb',
      at:[leafX,.018,leafZ],fallback:doorProxy})};
  });
  let opening=0;
  K.onFrame((dt,_time,player)=>{
    const dx=player.x-x,dz=player.z-z;
    const inFront=dx*sin+dz*cos, across=dx*cos-dz*sin;
    const target=Math.abs(player.y)<1.5 && inFront>-1.45 && inFront<3.4 && Math.abs(across)<1.45 ? 1 : 0;
    if(opening===target)return;
    opening+=Math.sign(target-opening)*Math.min(Math.abs(target-opening),dt/.70);
    for(const {side,leafX,leafZ,root} of doors) {
      root.position.x=leafX+cos*side*.674*opening;
      root.position.z=leafZ-sin*side*.674*opening;
    }
  });
}
