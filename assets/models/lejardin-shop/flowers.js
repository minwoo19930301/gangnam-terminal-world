import * as THREE from 'three';
import {relief} from '../../../js/banpo_relief.js';
import {photographedHead,flowerDraws} from './flower-distance.js';

const flowersByPart={
 gold:['gerbera','creamRose','greenHydra','whiteLis','ranunculus'],
 pink:['rose','carnation','pinkMum','creamRose'],
 lilac:['whiteLis','hydrangea','lisianthus','creamRose'],
 blueWrap:['hydrangea','lisianthus','whiteLis','greenHydra'],
 mixedWrap:['gerbera','pinkMum','rose','anthurium','ranunculus','lisianthus','greenHydra'],
 pineHigh:['pineBough'],pineMid:['pineBough'],pineLow:['pineBough'],
};
const templates=new Map(),banks=new Map(),textures=new Map();
const petals=new THREE.MeshLambertMaterial({vertexColors:true,side:THREE.DoubleSide});
export function texture(key){
  if(!textures.has(key))textures.set(key,new THREE.TextureLoader().loadAsync(new URL('./'+key,import.meta.url).href).then(t=>{
    t.colorSpace=THREE.SRGBColorSpace;t.anisotropy=4;return t;
  }).catch(e=>{textures.delete(key);throw e;}));return textures.get(key);
}
async function pine(){
  const map=await texture('conifer.webp');
  const x=-.036,w=.474,h=w*320/512,z=.029;
  const p=[x,.023,h/2,x+w,.023,h/2,x+w,.023,-h/2,x,.023,-h/2,
    x,z-h/2,0,x+w,z-h/2,0,x+w,z+h/2,0,x,z+h/2,0];
  const geo=new THREE.BufferGeometry();geo.setAttribute('position',new THREE.Float32BufferAttribute(p,3));
  geo.setAttribute('uv',new THREE.Float32BufferAttribute([0,.5,1,.5,1,1,0,1,0,0,1,0,1,.5,0,.5],2));
  geo.setIndex([0,1,2,0,2,3,4,5,6,4,6,7]);geo.computeVertexNormals();
  const mat=new THREE.MeshLambertMaterial({map,alphaTest:.31,side:THREE.DoubleSide,alphaToCoverage:true});
  return new THREE.Mesh(geo,mat);
}
function flower(key){
  if(!templates.has(key))templates.set(key,(key==='pineBough'?pine():photographedHead(key,texture)).catch(e=>{templates.delete(key);throw e;}));return templates.get(key);
}
export function bank(key){
  if(!flowersByPart[key])return null;
  if(!banks.has(key))banks.set(key,(async()=>{
    const response=await fetch(new URL('./'+key+'-poses.json',import.meta.url));if(!response.ok)throw Error(response.statusText);
    const poses=await response.json();
    return Object.fromEntries(await Promise.all(Object.entries(poses).map(async([species,entries])=>[species,[await flower(species),entries]])));
  })().catch(e=>{banks.delete(key);throw e;}));return banks.get(key);
}

const empty=new THREE.BufferGeometry();empty.setAttribute('position',new THREE.Float32BufferAttribute([],3));
const particleMaterial=new THREE.ShaderMaterial({
  transparent:true,depthWrite:false,blending:THREE.AdditiveBlending,
  uniforms:{pixels:{value:640},terrainY:{value:0}},
  vertexShader:`#include <common>
    #include <logdepthbuf_pars_vertex>
    uniform float pixels;uniform float terrainY;varying float strength;
    void main(){vec4 v=modelViewMatrix*vec4(position,1.)+viewMatrix[1]*terrainY;
      gl_Position=projectionMatrix*v;gl_PointSize=clamp(pixels*.020/max(.18,-v.z),1.5,12.);
      strength=.64+.35*fract(sin(dot(position,vec3(43.,73.,29.)))*3171.12);
      #include <logdepthbuf_vertex>
    }`,
  fragmentShader:`#include <common>
    #include <logdepthbuf_pars_fragment>
    varying float strength;
    void main(){float d=length(gl_PointCoord-.5)*2.;if(d>1.)discard;
      #include <logdepthbuf_fragment>
      float a=exp(-4.6*d*d)*strength;gl_FragColor=vec4(1.,.82,.46,a);
    }`,
});
let sparkles;
export function lights(){
  sparkles??=fetch(new URL('./bulbs-mm.bin',import.meta.url)).then(r=>{if(!r.ok)throw Error(r.statusText);return r.arrayBuffer()}).then(b=>{
    const q=new Int16Array(b),positions=Float32Array.from(q,n=>n*.001);
    const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(positions,3));g.computeBoundingSphere();return g;
  }).catch(e=>{sparkles=null;throw e;});return sparkles;
}
// Register the secondary draws synchronously so the shared room/floor culler owns them too.
// Each distinct bloom or needle spray is uploaded once and drawn at its native Blender transforms.
export function instances(root,key,proxy){
  const species=flowersByPart[key],bulbs=key==='bulbs';if(!species&&!bulbs)return;
  const flowers=species&&!species.includes('pineBough')?flowerDraws(root,species):null;
  const children=new Map();let points,attached=false;
  if(species&&!flowers)for(const name of species){
    const count=name==='pineBough'?256:64,mesh=new THREE.InstancedMesh(empty,petals,count);mesh.count=0;mesh.visible=false;
    mesh.name='르자당 상품 · '+name;children.set(name,mesh);root.add(mesh);
  }
  if(bulbs){points=new THREE.Points(empty,particleMaterial);points.name='르자당 트리 · 작은 전구의 빛';points.visible=false;root.add(points);}
  const item=root.children[0];const update=item.onBeforeRender;item.frustumCulled=false;
  item.onBeforeRender=function(renderer,scene,camera,...other){
    update.call(this,renderer,scene,camera,...other);const high=this.geometry!==proxy;
    if(flowers){flowers(high,this.material.userData.arrangement,camera);return;}
    if(high&&!attached){
      const data=this.material.userData.arrangement;
      if(species&&data){
        const v=new THREE.Vector3(),q=new THREE.Quaternion(),s=new THREE.Vector3(),m=new THREE.Matrix4();
        for(const [name,[src,entries]] of Object.entries(data)){
          const child=children.get(name);child.geometry=src.geometry;child.material=src.material;child.count=entries.length;
          entries.forEach((row,i)=>{
            v.fromArray(row,0);q.fromArray(row,3);s.fromArray(row,7);m.compose(v,q,s).multiply(src.matrixWorld);child.setMatrixAt(i,m);
          });child.instanceMatrix.needsUpdate=true;child.computeBoundingSphere();
        }
        attached=true;
      }
      if(points&&this.material.userData.points){points.geometry=this.material.userData.points;attached=true;}
    }
    if(attached){for(const child of children.values())child.visible=high;if(points){points.visible=high;particleMaterial.uniforms.pixels.value=renderer.domElement.height;particleMaterial.uniforms.terrainY.value=relief(root.position.x,root.position.z);}}
  };
}
