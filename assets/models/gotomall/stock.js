// The department GLBs use the same editable shop collections as the Blender layout.
// Keep a small silhouette in distant frontages and download each finish just once.
import {mergeGeometries} from 'three/addons/utils/BufferGeometryUtils.js';
import {loadFixtureScene} from '../onebailey/load.js';
import {relief} from '../../../js/banpo_relief.js';

const files = new Map(), silhouettes = new Map();
const finishes = {
  apparel: [0x5c637a,0xbf777c], junior: [0x947765,0xe0b5a0],
  linen: [0x829599,0xc7bba2], kitchen: [0xafa99f,0xe4d5c7],
  flowers: [0x50724c,0xc79e94], tarot: [0x755151,0xbf937e],
  Emet: [0x866875,0xb59795], AnHouse: [0x969aaa,0xc3b8a7],
};

function silhouette(T, key, depthSign) {
  if (silhouettes.has(key)) return silhouettes.get(key);
  const woods = finishes[key], pieces = [];
  function block(x,y,z,w,h,d,color) {
    const g = new T.BoxGeometry(w,h,d).translate(x,y,z*depthSign), tint = new T.Color(color);
    const colors = new Float32Array(g.attributes.position.count*3);
    for (let i=0; i<colors.length; i+=3) tint.toArray(colors,i);
    g.setAttribute('color',new T.BufferAttribute(colors,3));
    pieces.push(g);
  }
  for (const side of [-1,1]) {
    block(side*1.08,.43,.7,.75,.76,.61,woods[0]);
    block(side*1.08,.88,.7,.79,.14,.64,woods[1]);
  }
  for (const y of [.55,1.22,1.9]) {
    block(0,y,2.79,2.9,.06,.31,0x8b8580);
    for (let i=0;i<6;i++) block(-1.19+i*.47,y+.18,2.74,.33,.29,.18,woods[i%2]);
  }
  const geometry = mergeGeometries(pieces);
  for (const p of pieces) p.dispose();
  silhouettes.set(key,geometry);
  return geometry;
}

function load(file) {
  if (!files.has(file)) files.set(file,loadFixtureScene(new URL(file,import.meta.url)).catch(error=>{
    files.delete(file);
    throw error;
  }));
  return files.get(file);
}

function loadOnView(mesh, file, key, visible, apply) {
  let pending = false, retryAt = 0;
  mesh.onBeforeRender = (_renderer,_scene,camera) => {
    if (pending || performance.now()<retryAt || !visible(camera)) return;
    pending = true;
    load(file).then(scene=>{
      const part = scene.getObjectByName(key);
      if (!part?.isMesh) throw new Error('Missing Goto Mall fixture '+key);
      apply(part);
      mesh.userData.loaded = true;
      mesh.onBeforeRender = () => {};
    }).catch(()=>{
      pending = false;
      retryAt = performance.now()+10000;
    });
  };
}

export function placeShopStock(K, key, position, yaw, scale) {
  const T = K.THREE, textile = key === 'Emet' || key === 'AnHouse';
  const file = textile ? '../onebailey/west.glb' : './'+key+'.glb';
  const depthSign = textile ? -1 : 1;
  const display = new T.LOD(), coarse = silhouette(T,key,depthSign);
  display.name = '고투몰 진열 · '+key;
  display.position.set(...position); display.rotation.y = yaw; display.scale.set(...scale);
  const material = new T.MeshLambertMaterial({vertexColors:true});
  const item = new T.Mesh(coarse,material);
  display.addLevel(item,0);
  display.addLevel(new T.Mesh(coarse,material),39,.08);
  const eye = new T.Vector3();
  loadOnView(item,file,key,camera=>{
    eye.copy(camera.position);
    eye.y -= relief(eye.x,eye.z);
    display.worldToLocal(eye);
    const depth = eye.z*depthSign;
    // Side and back walls are full height. The public opening faces negative depth.
    return eye.y >= -.18 && eye.y <= 3.3 && depth <= 3.1 && (depth <= .12 || Math.abs(eye.x) <= 1.86);
  },part=>{
    item.geometry = part.geometry;
    item.matrix.copy(part.matrixWorld); // quantized glTF position decoder
    item.matrixAutoUpdate = false;
    item.matrixWorldNeedsUpdate = true;
  });
  K.addMesh(display);
}

// These small Blender parts repeat across shops. Their instance matrices stay
// in world metres; defer the one shared surface until a shopper can see a batch.
export function streamAislePart(batch,file,key) {
  batch.computeBoundingSphere();
  const {center,radius} = batch.boundingSphere;
  loadOnView(batch,file,key,camera=>{
    const eye = camera.position;
    return Math.abs(eye.y-relief(eye.x,eye.z)-center.y) <= 4 &&
      Math.hypot(eye.x-center.x,eye.z-center.z) <= 42+radius;
  },part=>{
    // Both assets have one untransformed surface per named glTF node.
    batch.geometry = part.geometry;
    batch.computeBoundingBox();
    batch.computeBoundingSphere();
  });
}

export function fixtureSilhouette(T,key) {
  if (silhouettes.has(key)) return silhouettes.get(key);
  let geometry, tone;
  if (key==='hat') {
    const brim=new T.CylinderGeometry(.26,.26,.025,10).translate(0,.018,0);
    const crown=new T.CylinderGeometry(.15,.19,.12,10).translate(0,.08,0);
    geometry=mergeGeometries([brim,crown]);
    brim.dispose(); crown.dispose();
    tone=0xffffff;
  } else {
    const lamp=key==='Diffuser';
    geometry = new T.BoxGeometry(lamp ? 5.8 : 5.85, .055, lamp ? .16 : 3.45)
      .translate(0, lamp ? -.04 : .07, 0);
    tone=lamp?0xffedeb:0xba979f;
  }
  const shade=new T.Color(tone), colors=new Float32Array(geometry.attributes.position.count*3);
  for(let i=0;i<colors.length;i+=3) shade.toArray(colors,i);
  geometry.setAttribute('color',new T.BufferAttribute(colors,3));
  silhouettes.set(key,geometry);
  return geometry;
}
