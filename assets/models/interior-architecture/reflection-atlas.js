import {CubeTexture,ImageLoader,SRGBColorSpace} from 'three';

const environments=new Map();
// The six faces are in Three.js CubeCamera order, stored in a 3 by 2 WebP sheet.
export function loadReflectionAtlas(url){
  if(!environments.has(url))environments.set(url,new ImageLoader().loadAsync(url).then(image=>{
    const size=image.width/3;
    const faces=Array.from({length:6},(_,i)=>{
      const canvas=document.createElement('canvas');canvas.width=canvas.height=size;
      canvas.getContext('2d').drawImage(image,i%3*size,Math.floor(i/3)*size,size,size,0,0,size,size);
      return canvas;
    });
    const cube=new CubeTexture(faces);cube.colorSpace=SRGBColorSpace;cube.needsUpdate=true;return cube;
  }).catch(error=>{environments.delete(url);throw error;}));
  return environments.get(url);
}
