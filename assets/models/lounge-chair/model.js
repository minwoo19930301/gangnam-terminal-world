import {loadArchitecture} from '../interior-architecture/model.js';
import {relief} from '../../../js/banpo_relief.js';
import {points, colors, indices} from './proxy.js';

const unpack = (value, Type) => new Type(Uint8Array.from(atob(value), c => c.charCodeAt(0)).buffer);
let silhouette, full, pending, retryAfter = 0;

function coarseChair(THREE) {
  if (silhouette) return silhouette;
  silhouette = new THREE.BufferGeometry();
  const positions = Float32Array.from(unpack(points, Int16Array), value => value / 1000);
  silhouette.setAttribute('position', new THREE.BufferAttribute(positions,3));
  silhouette.setAttribute('color', new THREE.BufferAttribute(unpack(colors, Uint8Array),3,true));
  silhouette.setIndex(new THREE.BufferAttribute(unpack(indices, Uint16Array),1));
  silhouette.computeVertexNormals();
  return silhouette;
}

function requestChair(THREE) {
  if (full || pending || performance.now() < retryAfter) return;
  pending = loadArchitecture('../lounge-chair/peacock.glb').then(([part]) => {
    part.updateWorldMatrix(true,false);
    const g = part.geometry;
    // glTF mesh quantization keeps the decode scale and origin on the node.
    // Put them back in metres so the same five instance matrices work at both distances.
    const positions = g.attributes.position, normals = g.attributes.normal, tint = g.attributes.color;
    const p = new Float32Array(positions.count*3), n = new Float32Array(normals.count*3);
    const rgb = new Uint8Array(positions.count*3);
    const v = new THREE.Vector3(), normalMatrix = new THREE.Matrix3().getNormalMatrix(part.matrixWorld);
    for (let i=0;i<positions.count;i++) {
      v.fromBufferAttribute(positions,i).applyMatrix4(part.matrixWorld).toArray(p,3*i);
      v.fromBufferAttribute(normals,i).applyNormalMatrix(normalMatrix).toArray(n,3*i);
      rgb.set([Math.round(tint.getX(i)*255),Math.round(tint.getY(i)*255),Math.round(tint.getZ(i)*255)],3*i);
    }
    g.setAttribute('position',new THREE.BufferAttribute(p,3));
    g.setAttribute('normal',new THREE.BufferAttribute(n,3));
    g.setAttribute('color',new THREE.BufferAttribute(rgb,3,true));
    g.computeBoundingSphere();
    full = g;
  }).catch(() => { retryAfter = performance.now()+10000; }).finally(() => { pending = null; });
}

export function placeLoungeChairs(K, placements) {
  const {THREE} = K, coarse = coarseChair(THREE);
  const group = new THREE.InstancedMesh(coarse,new THREE.MeshLambertMaterial({vertexColors:true}),placements.length);
  group.name = '더 라운지 · 피콕 라탄체어';
  const pose = new THREE.Object3D();
  const centers = placements.map(([x,y,z,angle],i) => {
    pose.position.set(x,y,z); pose.rotation.y=angle; pose.updateMatrix();
    group.setMatrixAt(i,pose.matrix);
    return new THREE.Sphere(new THREE.Vector3(x,y+relief(x,z)+1.05,z),1.18);
  });
  group.computeBoundingSphere();
  group.boundingSphere.radius += .15;
  const view = new THREE.Frustum(), projection = new THREE.Matrix4();
  group.onBeforeRender = (renderer,scene,camera) => {
    view.setFromProjectionMatrix(projection.multiplyMatrices(camera.projectionMatrix,camera.matrixWorldInverse));
    const limit = group.geometry === full ? 19 : 16;
    const near = centers.some(sphere =>
      camera.position.y >= sphere.center.y-1.1 && camera.position.y <= sphere.center.y+4.5 &&
      camera.position.distanceToSquared(sphere.center) < limit*limit && view.intersectsSphere(sphere));
    if (near && !full) requestChair(THREE);
    group.geometry = near && full ? full : coarse;
  };
  K.addMesh(group);
}
