import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js';

let loaderPromise;
const cameraViews = new WeakMap();

function cameraProjection(T, camera, frameTime) {
  let view = cameraViews.get(camera);
  if (!view) {
    view = {time:undefined, matrix:new T.Matrix4()};
    cameraViews.set(camera,view);
  }
  if (frameTime !== view.time) {
    camera.updateWorldMatrix(true,false);
    view.matrix.multiplyMatrices(camera.projectionMatrix,camera.matrixWorldInverse);
    view.time = frameTime;
  }
  return view.matrix;
}

function getLoader() {
  if (!loaderPromise) {
    loaderPromise = Promise.all([
      import('three/addons/loaders/GLTFLoader.js'),
      import('three/addons/libs/meshopt_decoder.module.js')
    ]).then(([{GLTFLoader}, {MeshoptDecoder}]) =>
      new GLTFLoader().setMeshoptDecoder(MeshoptDecoder)
    ).catch(error => {
      loaderPromise = undefined;
      throw error;
    });
  }
  return loaderPromise;
}

// The root already carries the CPU terrain height in full-world views.
function rigidMaterial(material) {
  for (const part of Array.isArray(material) ? material : [material]) {
    if (part.defines?.BANPO_RIGID === 1) continue;
    part.defines = {...part.defines, BANPO_RIGID:1};
    part.needsUpdate = true;
  }
  return material;
}

// The coarse displays consist of opaque, solid-color shop fixtures. Bake their
// transforms and colors together before K.detail captures layer ownership.
function batchFallback(T, group) {
  const pieces = group.children;
  if (pieces.length < 2 || !pieces.every(p => p.isMesh && !p.children.length &&
      p.material?.color && !p.material.map && !p.material.transparent &&
      !p.geometry.getAttribute('color') && p.geometry.getAttribute('normal'))) return;

  const geometryParts = pieces.map(piece => {
    piece.updateMatrix();
    const geometry = piece.geometry.index ? piece.geometry.toNonIndexed() : piece.geometry.clone();
    geometry.applyMatrix4(piece.matrix);
    for (const attribute of Object.keys(geometry.attributes)) {
      if (attribute !== 'position' && attribute !== 'normal') geometry.deleteAttribute(attribute);
    }
    const colors = new Float32Array(geometry.getAttribute('position').count * 3);
    for (let index = 0; index < colors.length; index += 3) piece.material.color.toArray(colors,index);
    geometry.setAttribute('color', new T.BufferAttribute(colors,3));
    return geometry;
  });
  const geometry = mergeGeometries(geometryParts);
  geometryParts.forEach(part => part.dispose());
  if (!geometry) return;
  const material = new T.MeshStandardMaterial({vertexColors:true,side:T.DoubleSide});
  group.clear();
  group.add(new T.Mesh(geometry,material));
}

export function mountRetailDisplay(K, {root, fallback, source, batches, x, y, z}) {
  const T = K.THREE;
  root.userData.terrainApplied = true;
  root.updateWorldMatrix(true,true);
  const worldToLocal = fallback.matrixWorld.clone().invert();
  const localBounds = [];
  const viewMatrix = new T.Matrix4(), viewFrustum = new T.Frustum();
  fallback.traverse(part => {
    if (!part.isMesh) return;
    if (!part.geometry.boundingBox) part.geometry.computeBoundingBox();
    viewMatrix.multiplyMatrices(worldToLocal,part.matrixWorld);
    localBounds.push(part.geometry.boundingBox.clone().applyMatrix4(viewMatrix).expandByScalar(.025));
  });
  batchFallback(T, fallback);
  const empty = new T.BufferGeometry();
  const temporaryMaterial = rigidMaterial(new T.MeshBasicMaterial());
  const slots = batches.map(name => {
    const mesh = new T.Mesh(empty,temporaryMaterial);
    mesh.name = name;
    mesh.visible = false;
    root.add(mesh);
    return mesh;
  });
  K.addMesh(root);

  let ready = false, loading = false, near = false, retryAt = 0;
  async function load() {
    loading = true;
    try {
      const loader = await getLoader();
      const {scene} = await loader.loadAsync(source.href);
      scene.updateMatrixWorld(true);
      const parts = batches.map(name => scene.getObjectByName(name));
      if (!parts.every(part => part?.isMesh && part.geometry.getAttribute('position'))) {
        throw new Error('Invalid retail model ' + source.pathname);
      }
      for (const [index, part] of parts.entries()) {
        const mesh = slots[index];
        mesh.geometry = part.geometry;
        mesh.material = rigidMaterial(part.material);
        mesh.matrix.copy(part.matrixWorld);
        mesh.matrixAutoUpdate = false;
        mesh.matrixWorldNeedsUpdate = true;
      }
      empty.dispose();
      temporaryMaterial.dispose();
      ready = true;
    } catch {
      retryAt = performance.now() + 5000;
    } finally {
      loading = false;
    }
  }

  // Three calls this only for an enabled, potentially visible mesh. Check the
  // tighter display box too, e.g. when a wide shelf sphere surrounds the eye.
  fallback.traverse(part => {
    if (!part.isMesh) return;
    rigidMaterial(part.material);
    const previous = part.onBeforeRender;
    part.onBeforeRender = function(renderer,scene,camera,...rest) {
      previous.call(this,renderer,scene,camera,...rest);
      if (!near || ready || loading || performance.now() < retryAt) return;
      viewMatrix.multiplyMatrices(cameraProjection(T,camera,renderer.info.render.frame),fallback.matrixWorld);
      viewFrustum.setFromProjectionMatrix(viewMatrix);
      if (localBounds.some(box => viewFrustum.intersectsBox(box))) void load();
    };
  });

  K.onFrame((_dt,_time,player) => {
    const dx = x - player.x, dz = z - player.z, distanceSq = dx*dx + dz*dz;
    const sameFloor = player.y >= y-.20 && player.y < y+4.6;
    root.visible = sameFloor && distanceSq < 22*22;
    near = root.visible && distanceSq < 11*11;
    fallback.visible = !(ready && near);
    for (const mesh of slots) mesh.visible = ready && near;
  });
}
