import {makeCanvas} from '../../../js/textures.js';
import {printDirectory} from './print.js';
import {vertices,indices} from './surface.js';

function words(data){
  const bytes=Uint8Array.from(atob(data),c=>c.charCodeAt(0));
  return new Int16Array(bytes.buffer);
}

export function placeDirectory(K,name,x,y,z,angle){
  const T=K.THREE,buffer=words(vertices);
  const positions=[],uv=[];
  for(let i=0;i<buffer.length;i+=5){
    positions.push(buffer[i]/10000,buffer[i+1]/10000,buffer[i+2]/10000);
    uv.push(buffer[i+3]/8192,buffer[i+4]/8192);
  }
  const geometry=new T.BufferGeometry();
  geometry.setAttribute('position',new T.Float32BufferAttribute(positions,3));
  geometry.setAttribute('uv',new T.Float32BufferAttribute(uv,2));
  geometry.setIndex(Array.from(words(indices)));geometry.computeVertexNormals();
  const art=makeCanvas(768,768);
  printDirectory(art.getContext('2d'),art.width,art.height);
  const texture=new T.CanvasTexture(art);texture.colorSpace=T.SRGBColorSpace;
  texture.anisotropy=4;
  const mesh=new T.Mesh(geometry,new T.MeshLambertMaterial({map:texture}));
  mesh.name=name;mesh.position.set(x,y,z);mesh.rotation.y=angle;
  K.addMesh(mesh);
}
