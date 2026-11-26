import {mergeGeometries} from 'three/addons/utils/BufferGeometryUtils.js';
import {loadFixtureScene} from '../onebailey/load.js';

// Baked by export.py from the editable native glyph outlines. No texture request.
const giltMask = '/wD/AKEDgIABAwQMwAGAAQEMRAQ4gQMYAglwwAHAARwwzHFAEIA8ggP8/w/AwAHgBx4wzHFBBDmEAzgBCgbAwQHgDw/wz39BBbmNAzgHAQmAwwHAsQcwzHFBD7uPAzjHAYDDAcDBAzDMcUEFv48DOMcBCYTDEcBxHjDMcUEFv50DOMcBCbDDP8AFHDDMcQsR4HjnOcLxh+OcHzjOvXPnfjglBTuYAzjHAQngx3/A/wswzHELERARghAjIkRECBGQBBgRIgQQJAaA/58DOMcBCYCDB8CBA3Dc8QwQEYIQAyIkBAwBQIQIGRIEECUFuJsDOMcCAccBBsCBA3De8QsRgBGCkAIjIY4HAUAEDw0aJBAlBTiZAzjHAQIwLgEDwP8DAQJEMAsH4PCD0MLhIQEJBAdABQUNDjwQJQU4mAM4xwEJcB4OwIEjgAMCCwcwEIJQYiAhAQkGASAEBREKJBAkBoD//w85xwEJ8P8P2IE7gAMOCxEQEYIwIiIgBAMRIAYGERJEkCUPThsGOMcecBwO8IF/gP8PCxEQMYIQIiJCBAIRMAYCGSJEkiUPzhgCOMcMcBwO4Lh+gAMOCwFAAwGAAgEBLgLGGQECOMcBCfD/D8A5D4ADDkECwRgBAjjHAQlwHA6AnwOAAw5AA4D/fwECOMcBA3AcDgEBjwEDgAMOQQW43Q84xwEDcBwOAQFOAQOAAw5BATgBAQcBBccB8P8fAQFcAQOA/w9BARgBAQIBAcMBARABAQYBATwBAYABAQb/AP8A/wBFAA==';

function lintelTexture(T){
  const width=640,height=40,bits=new Uint8Array(width*height/8),packed=atob(giltMask);
  let cursor=0,offset=0;
  while(cursor<packed.length){
    offset+=packed.charCodeAt(cursor++);
    const length=packed.charCodeAt(cursor++);
    for(let i=0;i<length;i++)bits[offset++]=packed.charCodeAt(cursor++);
  }
  // One extra white row lets the other portal faces use their vertex paint.
  const rgba=new Uint8Array(width*(height+1)*4).fill(255);
  const gilt=[249,218,147,255],stone=[72,66,60,255];
  for(let i=0;i<width*height;i++){
    const ink=bits[i>>3]&(1<<(i%8));
    rgba.set(ink?gilt:stone,i*4);
  }
  const map=new T.DataTexture(rgba,width,height+1,T.RGBAFormat);
  map.colorSpace=T.SRGBColorSpace;
  map.magFilter=T.LinearFilter;map.minFilter=T.LinearMipmapLinearFilter;
  map.generateMipmaps=true;map.needsUpdate=true;
  return map;
}

let source;
function loadSurface(T){
  source??=loadFixtureScene(new URL('./entrance.glb',import.meta.url)).then(scene=>{
    const part=scene.getObjectByName('Surface'),geo=part.geometry;
    // Bake the meshopt decode matrix in float space once, shared across area reloads.
    for(const name of ['position','normal']){
      const a=geo.getAttribute(name);
      if(!a.normalized)continue;
      const values=new Float32Array(a.count*3);
      for(let i=0;i<a.count;i++)values.set([a.getX(i),a.getY(i),a.getZ(i)],i*3);
      geo.setAttribute(name,new T.Float32BufferAttribute(values,3));
    }
    return geo.applyMatrix4(part.matrixWorld);
  }).catch(error=>{source=null;throw error;});
  return source;
}

export function marketEntrance(K,x,y,z,angle){
  const T=K.THREE,parts=[];
  function piece(geometry,x,y,z,color){
    geometry.translate(x,y,z);
    const paint=new T.Color(color),colors=new Float32Array(geometry.attributes.position.count*3);
    for(let i=0;i<colors.length;i+=3)paint.toArray(colors,i);
    geometry.setAttribute('color',new T.Float32BufferAttribute(colors,3));
    parts.push(geometry);
  }
  for(const side of [-2.9,2.9]){
    piece(new T.BoxGeometry(.93,.21,.77),0,.105,side,0xe3ddce);
    for(const depth of [-.227,.227]){
      piece(new T.CylinderGeometry(.177,.195,2.81,8),depth,1.67,side,0x201e23);
      piece(new T.CylinderGeometry(.247,.178,.4,8),depth,3.24,side,0xb18b52);
    }
  }
  piece(new T.BoxGeometry(.9,.40,6.6),0,3.64,0,0x48423c);
  const proxy=mergeGeometries(parts);
  parts.forEach(g=>g.dispose());
  // The +X fascia is the only printed face; mesh coordinates preserve letter size and position.
  const {position,normal,uv,color}=proxy.attributes;
  for(let i=0;i<position.count;i++){
    const face=normal.getX(i)>.99 && Math.abs(position.getX(i)-.45)<.001 && position.getY(i)>3.42;
    if(face){
      uv.setXY(i,.5-position.getZ(i)/6.6,(position.getY(i)-3.44)/.4*40/41);
      color.setXYZ(i,1,1,1);
    }else uv.setXY(i,.5,40.5/41);
  }
  const detailedMaterial=new T.MeshPhongMaterial({vertexColors:true,side:T.DoubleSide,specular:0x28241e,shininess:39});
  const proxyMaterial=detailedMaterial.clone();
  proxyMaterial.map=lintelTexture(T);
  const mesh=new T.Mesh(proxy,proxyMaterial);
  mesh.name='신세계 마켓 · 동측 대리석 출입구';
  mesh.position.set(x,y,z);
  mesh.rotation.y=angle;
  mesh.userData.split=true;
  const center=new T.Vector3(),frustum=new T.Frustum(),clip=new T.Matrix4();
  // The wide, shallow portal's bounding sphere surrounds a shopper just past it.
  // Test the box in portal space before fetching detail behind their camera.
  const bounds=new T.Box3(new T.Vector3(-.52,0,-3.32),new T.Vector3(.52,3.84,3.32));
  const lastEye=new T.Vector3(Infinity,Infinity,Infinity),probe=new T.Vector3();
  let hiddenByDeck=false;
  function coveredFrom(camera){
    const eye=camera.position;
    // Same-floor arrivals do not perform any slab queries.
    if(eye.y<=center.y+2.05 && eye.y>=center.y-2.2)return false;
    if(eye.distanceToSquared(lastEye)<.04)return hiddenByDeck;
    lastEye.copy(eye);
    // A visible edge through an opening keeps the original demand. Test the two
    // fascia planes separately because this is a wide, shallow entrance.
    for(const dx of [-.48,.48])for(const height of [.10,2,3.82])for(const dz of [-3.25,0,3.25]){
      probe.set(dx,height,dz).applyMatrix4(mesh.matrixWorld);
      if(!K.phys.ceilingBlocksView(eye.x,eye.y,eye.z,probe.x,probe.y,probe.z)){
        hiddenByDeck=false;
        return false;
      }
    }
    hiddenByDeck=true;
    return true;
  }
  let detailed=false,nextDetailed=false,surface,pending=false,retryAt=0;
  mesh.onBeforeRender=(_renderer,_scene,camera)=>{
    center.set(0,2,0).applyMatrix4(mesh.matrixWorld);
    clip.multiplyMatrices(camera.projectionMatrix,camera.matrixWorldInverse).multiply(mesh.matrixWorld);
    const range=detailed?26:23;
    const near=camera.position.distanceToSquared(center)<range*range&&frustum.setFromProjectionMatrix(clip).intersectsBox(bounds)&&!coveredFrom(camera);
    if(near&&!surface&&!pending&&performance.now()>=retryAt){
      pending=true;
      loadSurface(T).then(g=>{surface=g;}).catch(()=>{retryAt=performance.now()+10000;}).finally(()=>{pending=false;});
    }
    nextDetailed=Boolean(surface && near);
  };
  // Three resolves the draw material before onBeforeRender. Change geometry
  // and material together after drawing to avoid a mismatched transition frame.
  mesh.onAfterRender=()=>{
    if(nextDetailed!==detailed){
      mesh.geometry=nextDetailed?surface:proxy;
      mesh.material=nextDetailed?detailedMaterial:proxyMaterial;
      detailed=nextDetailed;
    }
  };
  K.addMesh(mesh);
}
