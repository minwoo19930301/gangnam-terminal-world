import {loadArchitecture} from '../interior-architecture/model.js';
import {relief} from '../../../js/banpo_relief.js';

let model, pending, retryAt = 0;
function loadDesserts() {
  if (model || pending || performance.now() < retryAt) return;
  pending = loadArchitecture('../patisserie/desserts.glb').then(([surface]) => {
    surface.updateWorldMatrix(true,false);
    model = surface;
  }).catch(() => { retryAt = performance.now() + 10000; }).finally(() => { pending = null; });
}

export function placeDesserts(K, x, y, z, angle) {
  const {THREE} = K;
  const stand = new THREE.Group();
  stand.name = '파티세리 · 플랑과 마카롱';
  stand.position.set(x,y,z);
  stand.rotation.y = angle;
  const proxy = new THREE.BoxGeometry(1.5,.018,.35).translate(0,.009,0);
  const board = new THREE.MeshLambertMaterial({color:0xe5d3b5});
  const glaze = new THREE.MeshLambertMaterial({vertexColors:true});
  const item = new THREE.Mesh(proxy, board);
  stand.add(item);
  const eyeTarget = new THREE.Vector3(x, y+relief(x,z), z);
  item.onBeforeRender = (_renderer,_scene,camera) => {
    const distance = camera.position.distanceToSquared(eyeTarget);
    const near = Math.abs(camera.position.y-eyeTarget.y) < 2.7 &&
      distance < (item.geometry === proxy ? 12*12 : 15*15);
    if (near && !model) loadDesserts();
    if (near && model && item.geometry !== model.geometry) {
      item.geometry = model.geometry;
      item.material = glaze;
      item.matrixAutoUpdate = false;
      item.matrix.copy(model.matrixWorld);
      item.updateWorldMatrix(true,false);
    } else if (!near && item.geometry !== proxy) {
      item.geometry = proxy;
      item.material = board;
      item.matrix.identity();
      item.updateWorldMatrix(true,false);
    }
  };
  K.addMesh(stand);
}
