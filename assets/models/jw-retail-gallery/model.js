import {loadArchitecture} from '../interior-architecture/model.js';
import {boxSilhouette} from '../interior-architecture/box-silhouette.js';
import {placeSingleDetail} from '../interior-architecture/single-detail.js';

let displayPromise;
function portrait(T,file){
  displayPromise??=Promise.all([loadArchitecture(file),
    new T.TextureLoader().loadAsync(new URL('./pearl-silk.webp',import.meta.url).href)]).then(([[mesh],photo])=>{
    photo.colorSpace=T.SRGBColorSpace;
    mesh.updateWorldMatrix(true,false);
    const points=mesh.geometry.getAttribute('position'),uv=new Float32Array(points.count*2),p=new T.Vector3();
    for(let i=0;i<points.count;i++){
      p.fromBufferAttribute(points,i).applyMatrix4(mesh.matrixWorld);
      uv[2*i]=p.x/.932+.5;uv[2*i+1]=(p.y-.960)/1.548;
    }
    mesh.geometry.setAttribute('uv',new T.BufferAttribute(uv,2));
    const material=new T.MeshBasicMaterial({vertexColors:true,side:T.DoubleSide,map:photo});
    material.onBeforeCompile=shader=>{
      shader.fragmentShader=shader.fragmentShader.replace('#include <map_fragment>', '')
        .replace('#include <color_fragment>',`
          #include <color_fragment>
          if(vColor.g>vColor.r*2. && vColor.b>vColor.r*2.)
            diffuseColor.rgb=texture2D(map,vMapUv).rgb;
        `);
    };
    mesh.material=material;
    return [mesh];
  }).catch(error=>{displayPromise=null;throw error;});
  return displayPromise;
}

export const fittings={
  showcase:['신세계 연결 갤러리 · 보석 진열창','JewelryShadowbox'],
  screen:['신세계 연결 갤러리 · 세로형 광고 화면','RetailPortrait'],
  lights:['신세계 연결 갤러리 · 사각 매입등','SquareDownlightPair'],
};

export function registerRetailGallery(K,P,RECT,R,deck){
  const T=K.THREE;
  const rotation=R,cos=Math.cos(R),sin=Math.sin(R),[ox,oz]=P(0,0);
  const inPassage=p=>{
    const dx=p.x-ox,dz=p.z-oz,u=dx*cos-dz*sin,v=dx*sin+dz*cos;
    return (u>-.95&&u<27.2&&v>56.42&&v<60.54)||(u>24.02&&u<27.2&&v>29.05&&v<56.52);
  };
  const [arrivalX,arrivalZ]=P(14.07,58.47);
  K.spawn({name:'JW 메리어트 백화점 연결통로',aliases:['호텔 신세계 연결통로','JW 신세계백화점 연결통로'],
    place:'jwmarriott',floor:'3F',arrivalFloor:'3F',mapDestination:true,x:arrivalX,y:deck+.032,z:arrivalZ,
    yaw:R,pitchDeg:2});
  // Use the existing walls. Fittings stop clear of the adjoining door and stair openings.
  K.detail({name:'JW 메리어트 · 백화점 연결 전시',floor:'3F',poly:RECT(-.9,29.15,27.05,60.45),
    y0:deck,y1:deck+3.8,visibleFrom:(x,y,z)=>y>deck-.1&&y<deck+3.5&&inPassage({x,z})},()=>{
    const paint=new T.MeshPhongMaterial({vertexColors:true,side:T.DoubleSide,shininess:40,specular:0x5b554d});
    const screenPaint=new T.MeshBasicMaterial({vertexColors:true,side:T.DoubleSide});
    const proxies={
      showcase:boxSilhouette(T,[[0,.80,.04,1.23,.91,.105,0x423d38],[0,.85,.099,1.125,.80,.022,0x675f54],[-.11,.91,.13,.15,.23,.05,0x37373a]]),
      screen:boxSilhouette(T,[[0,.94,.012,.97,1.59,.08,0x343431],[0,.963,.060,.92,1.54,.006,0x285768],
        [-.03,1.24,.065,.48,.83,.005,0x427b93]]),
      lights:boxSilhouette(T,[-.54,.54].flatMap(x=>[[x,-.032,0,.13,.021,.13,0x675f53],[x,-.036,0,.084,.005,.084,0xffedbc]])),
    };
    function place(key,u,v,h,angle,translations){
      const [x,z]=P(u,v),name=fittings[key][0],isLamp=key==='lights';
      const mat=key==='showcase'?paint:screenPaint;
      const visible=eye=>{
        if(!inPassage(eye))return false;
        return isLamp||Math.sin(angle)*(eye.x-x)+Math.cos(angle)*(eye.z-z)>-.06;
      };
      placeSingleDetail(K,{name,file:'../jw-retail-gallery/'+key+'.glb',
        at:[x,deck+h,z],angle,translations,range:isLamp?10:6,exitRange:isLamp?12:8,
        fallback:proxies[key],material:key==='screen'?null:mat,fallbackMaterial:mat,
        loadSurface:key==='screen'?file=>portrait(T,file):undefined,eyeHeight:1.62-h,
        floorTolerance:2.05,closeVisibleFrom:visible});
    }
    for(const u of [6.55,14.07])place('screen',u,56.63,0,rotation);
    for(const u of [9.02,15.17,21.33])place('showcase',u,60.415,0,rotation+Math.PI);
    for(const v of [43.72,50.14])place('showcase',27.013,v,0,rotation-Math.PI/2);
    place('screen',24.38,47.09,0,rotation+Math.PI/2);
    place('screen',24.38,52.88,0,rotation+Math.PI/2);
    // Group pairs in short runs so their close detail appears along the visitor's view.
    for(const u of [4.4,13.1,21.8])place('lights',u,58.47,3.39,rotation+Math.PI/2,[-2.90,0,2.90].map(z=>[0,0,z]));
    for(const v of [33.54,42.24,50.94])place('lights',v<45?26.05:25.67,v,3.39,rotation,[-2.90,0,2.90].map(z=>[0,0,z]));
  });
}
