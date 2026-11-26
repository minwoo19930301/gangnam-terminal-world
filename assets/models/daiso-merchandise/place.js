import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js';
import { loadFixtureScene } from '../onebailey/load.js';

const libraries = new Map();

function shelfSilhouette(THREE, kitchen) {
  const pieces = [], accent = kitchen ? 0x4c7768 : 0x7696a7;
  function box(x, y, z, width, height, depth, tone) {
    const g = new THREE.BoxGeometry(width,height,depth).translate(x,y,z);
    const c = new THREE.Color(tone), rgb = new Float32Array(g.attributes.position.count * 3);
    for (let i = 0; i < rgb.length; i += 3) c.toArray(rgb,i);
    g.setAttribute('color',new THREE.BufferAttribute(rgb,3));
    pieces.push(g);
  }
  box(0,1.01,.015,1.05,1.89,.04,0xf3f0e6);
  box(0,1.865,.07,1.04,.14,.06,accent);
  for (const y of [.16,.29,.71]) box(0,y,.12,1.06,.03,.24,accent);
  for (const y of [1.50,1.04,.52]) for (let i = 0; i < 4; i++) {
    const x = (i-1.5)*.245;
    box(x,y,.11,kitchen ? .07 : .15,.23,.025,[accent,0xb8afa2,0xae8f86,0x84999e][i]);
  }
  const merged = mergeGeometries(pieces);
  pieces.forEach(part => part.dispose());
  return merged;
}

export function placeDaisoEndcap(K, key, x, y, z, angle) {
  const {THREE} = K;
  const shelf = new THREE.LOD(), coarse = shelfSilhouette(THREE,key === 'kitchen');
  const material = new THREE.MeshLambertMaterial({vertexColors:true,side:THREE.DoubleSide});
  const near = new THREE.Mesh(coarse,material), far = new THREE.Mesh(coarse,material);
  near.name = 'Daiso '+key;
  shelf.position.set(x,y,z);
  shelf.rotation.y = angle;
  shelf.addLevel(near,0);
  shelf.addLevel(far,12,.12);
  // The render loop requests a shelf only when its front enters view on the same floor.
  // A distant customer always sees the simple stocked silhouette, including on a failed transfer.
  let retryAt = 0, waiting = false;
  const forward = new THREE.Vector3(Math.sin(angle),0,Math.cos(angle));
  near.onBeforeRender = (renderer,scene,camera) => {
    const eye = camera.position;
    if (waiting || performance.now() < retryAt || eye.y < shelf.position.y-.12 || eye.y > shelf.position.y+3.3 ||
        (eye.x-x)*forward.x + (eye.z-z)*forward.z < -.25) return;
    waiting = true;
    if (!libraries.has(key)) {
      const request = loadFixtureScene(new URL(key+'.glb',import.meta.url)).catch(error => {
        libraries.delete(key);
        throw error;
      });
      libraries.set(key,request);
    }
    libraries.get(key).then(library => {
      const source = library.getObjectByProperty('isMesh',true);
      near.geometry = source.geometry;
      near.matrix.copy(source.matrixWorld);
      near.matrixAutoUpdate = false;
      near.matrixWorldNeedsUpdate = true;
      near.userData.loaded = true;
      near.onBeforeRender = () => {};
    }).catch(() => {
      waiting = false;
      retryAt = performance.now()+10000;
    });
  };
  K.addMesh(shelf);
}
