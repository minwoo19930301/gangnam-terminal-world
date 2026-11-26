import {loadArchitecture} from './model.js';
import {relief} from '../../../js/banpo_relief.js';

const models = new Map();

// One draw at either distance. Quantized glTFs store their decode transform on
// the node. Keep that separate from the architectural placement transform.
export function placeSingleDetail(K, {name, file, at, angle, fallback, fallbackMaterial,
                                      material, range, exitRange, floorTolerance, eyeHeight=0, viewBounds}) {
  const T = K.THREE;
  let state = models.get(file);
  if (!state) {
    state = {surface:null, pending:null, retryAfter:0};
    models.set(file,state);
  }
  const [x,y,z] = at;
  const root = new T.Group(), item = new T.Mesh(fallback,fallbackMaterial);
  root.name = name;
  root.position.set(x,y,z);
  root.rotation.y = angle;
  root.add(item);
  const ground = relief(x,z);
  const center = new T.Vector3(x,y+ground+eyeHeight,z);
  const frustum=new T.Frustum(), matrix=new T.Matrix4(), globalPlacement=new T.Matrix4();
  fallback.computeBoundingBox();
  const bounds=viewBounds??[fallback.boundingBox];
  function inView(camera) {
    globalPlacement.copy(root.matrixWorld);
    globalPlacement.elements[13]+=ground;
    matrix.multiplyMatrices(camera.projectionMatrix,camera.matrixWorldInverse).multiply(globalPlacement);
    frustum.setFromProjectionMatrix(matrix);
    return bounds.some(box=>frustum.intersectsBox(box));
  }
  item.onBeforeRender = (_renderer,_scene,camera) => {
    const radius=item.geometry===fallback?range:exitRange;
    const within = Math.abs(camera.position.y-center.y)<floorTolerance &&
      camera.position.distanceToSquared(center)<radius*radius;
    if (within && !state.surface && !state.pending && performance.now()>=state.retryAfter && inView(camera)) {
      state.pending=loadArchitecture(file).then(([surface])=>{
        surface.updateWorldMatrix(true,false);
        state.surface=surface;
      }).catch(()=>{state.retryAfter=performance.now()+10000;}).finally(()=>{state.pending=null;});
    }
    const surface=within?state.surface:null;
    const geometry=surface?.geometry??fallback;
    if(item.geometry===geometry)return;
    item.geometry=geometry;
    item.material=surface?material:fallbackMaterial;
    item.matrixAutoUpdate=false;
    if(surface)item.matrix.copy(surface.matrixWorld);
    else item.matrix.identity();
    item.updateWorldMatrix(true,false);
  };
  return K.addMesh(root);
}
