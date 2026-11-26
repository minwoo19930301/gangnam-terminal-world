import {loadArchitecture} from './model.js';

// A Cycles irradiance atlas uses midpoint grey at neutral exposure. Keep the current room lighting on top.
export async function loadBakedSurface(T,file){
  const light=new URL(file.replace(/\.glb$/,'-light.webp'),import.meta.url);
  const [[surface],map]=await Promise.all([loadArchitecture(file),new T.TextureLoader().loadAsync(light.href)]);
  map.colorSpace=T.NoColorSpace;map.flipY=false;map.anisotropy=4;
  surface.material=new T.MeshLambertMaterial({color:new T.Color(2,2,2),map,vertexColors:true,side:T.DoubleSide});
  return [surface];
}
