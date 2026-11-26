import {SRGBColorSpace,TextureLoader} from 'three';
import {loadArchitecture} from '../interior-architecture/model.js';

// Independently streamed displays use one colour atlas, normal map, packed
// roughness/metalness and lamp mask per shop, including on return visits.
export function marketSurfaceLoader(baseURL) {
  let shared;
  function surfaces() {
    if (!shared) {
      const loader=new TextureLoader();
      shared=Promise.all(['surface','weave-normal','metal-rough','lamp'].map(async key=>{
        const texture=await loader.loadAsync(new URL('./'+key+'.webp',baseURL).href);
        texture.flipY=false;
        if(key==='surface'||key==='lamp')texture.colorSpace=SRGBColorSpace;
        return texture;
      })).catch(error=>{shared=undefined;throw error;});
    }
    return shared;
  }
  return async file=>{
    const [[mesh],[colour,normal,orm,emission]]=await Promise.all([loadArchitecture(file),surfaces()]);
    const material=mesh.material;
    material.map=colour;material.normalMap=normal;material.normalScale.set(.55,.55);
    material.roughnessMap=orm;material.metalnessMap=orm;material.emissiveMap=emission;
    return [mesh];
  };
}
