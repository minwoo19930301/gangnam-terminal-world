import {boxSilhouette} from '../interior-architecture/box-silhouette.js';
import {loadArchitecture} from '../interior-architecture/model.js';
import {placeSingleDetail} from '../interior-architecture/single-detail.js';
import {relief} from '../../../js/banpo_relief.js';

const file='../margaux-garden-window/window.glb';
let packagePromise;
function surface(part) {
  packagePromise??=loadArchitecture(file).catch(error=>{packagePromise=null;throw error;});
  return packagePromise.then(meshes=>[meshes.find(mesh=>mesh.name===part)]);
}

function flutedGlass(T) {
  const mat=new T.MeshPhongMaterial({vertexColors:true,side:T.DoubleSide,transparent:true,
    opacity:.21,depthWrite:false,specular:0xd2ccba,shininess:85});
  // The thin pressed flutes return more of the room light at grazing angles.
  // Keep both the garden sky and the people behind the glass visible.
  mat.onBeforeCompile=shader=>{
    shader.fragmentShader=shader.fragmentShader.replace('#include <opaque_fragment>',`
      float grazing=pow(1.0-abs(dot(normalize(normal),normalize(vViewPosition))),2.0);
      outgoingLight+=vec3(.22,.20,.16)*grazing;
      diffuseColor.a+=.34*grazing;
      #include <opaque_fragment>`);
  };
  mat.customProgramCacheKey=()=>'margaux-fluted-glass';
  mat.forceSinglePass=true;
  return mat;
}

export function registerGardenWindow(K,{P,rect,angle,y}) {
  const T=K.THREE,[x,z]=P(4,49),cos=Math.cos(angle),sin=Math.sin(angle);
  function visible(px,height,pz) {
    if(height<y-.1||height>y+5)return false;
    const dx=px-x,dz=pz-z,u=dx*cos-dz*sin,v=dx*sin+dz*cos;
    // Inside, in the doorway from the foyer, or on the garden side of the glazing.
    return u>=-28 && u<=13 && v>=-10 && v<=12;
  }
  const name='더 마고 그릴 · 정원창';
  K.detail({name,floor:'7F',poly:rect(-9.9,40,16,58),y0:y,y1:y+4.75,visibleFrom:visible},()=>{
    const frame=new T.MeshPhongMaterial({vertexColors:true,side:T.DoubleSide,specular:0x44433b,shininess:25});
    const amber=new T.MeshBasicMaterial({vertexColors:true,side:T.DoubleSide});
    const proxy=[[-.02,4.585,0,23.85,.08,17.74,0x68594f],
      [-11.94,4.34,0,.18,.18,17.78,0x403e39],[0,4.34,8.935,23.84,.18,.18,0x403e39],
      [-13.87,3.65,0,.13,.14,17.78,0x484741]];
    for(const v of [-8.85,-6.64,-4.43,-2.22,-.20,2.20,4.41,6.62,8.85])
      for(const u of [-11.94,11.94])proxy.push([u,0,v,.15,4.48,.09,0x494741]);
    for(const u of [-11.92,-9.83,-7.74,-5.65,-3.56,-1.62,1.62,3.67,5.72,7.77,9.82,11.92])
      proxy.push([u,0,8.935,.09,4.48,.15,0x494741]);
    const shells=[[-4.30,2.54,7.63],[-3.85,2.81,7.42],[-3.43,2.64,7.60]];
    const glass=flutedGlass(T);
    const box=(lo,hi)=>new T.Box3(new T.Vector3(...lo),new T.Vector3(...hi));
    const settingsBounds=box([-9.95,.72,-5.85],[2.95,.89,6.85]);
    const frameBounds=[settingsBounds,box([-12.05,4.32,-8.92],[12.05,4.72,8.99]),
      box([-14,0,-8.92],[-11.8,4.52,8.99]),box([11.80,0,-8.92],[12.05,4.52,8.99]),box([-12,0,8.80],[12,4.52,9.05])];
    const glassBounds=[box([-13.95,3.6,-8.88],[-11.85,4.55,8.88]),box([-4.42,2.51,7.29],[-3.30,3.54,7.76]),settingsBounds];
    const parts=[
      ['GardenSteel','프레임과 천장',frame,proxy,frameBounds],
      ['GardenGlass','홈유리',glass,shells.map(([a,b,c])=>[a,b,c,.17,.67,.17,0xd9dbca]),glassBounds],
      ['GardenFloor','카펫과 석재',undefined,[[-3.40,.017,.03,16.83,.01,17.12,0xb59279],
        [8.4,.013,0,6.70,.009,17.78,0xc9b9a8]],[box([-11.86,.01,-8.91],[11.8,.04,8.865])]],
      ['GardenLight','펜던트 발광면',amber,shells.map(([a,b,c])=>[a,b+.49,c,.075,.045,.075,0xffdda0]),[glassBounds[1]]]
    ];
    for(const [part,label,material,boxes,bounds] of parts) {
      const fallback=boxSilhouette(T,boxes);
      // Include the sloping eave in the transparent draw's bounding volume.
      if(part==='GardenGlass'){
        fallback.computeBoundingSphere();
        for(const bound of glassBounds)fallback.boundingSphere.union(bound.getBoundingSphere(new T.Sphere()));
      }
      placeSingleDetail(K,{name:name+' '+label,file:file+'#'+part,at:[x,y,z],angle,
        fallback,fallbackMaterial:material??new T.MeshLambertMaterial({vertexColors:true}),material,loadSurface:()=>surface(part),
        range:24,exitRange:27,eyeHeight:2.8,floorTolerance:3.2,viewBounds:bounds,
        closeVisibleFrom:e=>visible(e.x,e.y-relief(e.x,e.z),e.z)});
    }
  });
}
