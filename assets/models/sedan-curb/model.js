import {loadArchitecture} from '../interior-architecture/model.js';

let pending;

// Reuse the supported chassis poses. Wheels, collisions and distant car meshes
// remain owned by the fleet. All nearby car colours share a single draw.
export function parkSedanTrim(K, cars, apron) {
  if (!cars.length) return;
  const T = K.THREE;
  const axis = new T.Vector3(0, 1, 0), scale = new T.Vector3(1, 1, 1);
  const poses = cars.map(car => new T.Matrix4().compose(
    new T.Vector3(car.x, car.wheels.height, car.z),
    new T.Quaternion().setFromAxisAngle(axis, car.rotY).premultiply(car.tilt), scale));
  const visible = [], previous = [], scratch = new T.Matrix4(), paint = new T.Color();
  let mesh, local, loading = false, retry = 0;

  function install(part) {
    part.updateWorldMatrix(true, false);
    local = part.matrixWorld.clone();
    const material = new T.MeshLambertMaterial({vertexColors:true, side:T.DoubleSide});
    material.defines = {BANPO_RIGID:1}; // The wheel contacts already include terrain relief.
    material.onBeforeCompile = shader => {
      shader.vertexShader = shader.vertexShader.replace('#include <color_vertex>',
        'vColor = vec4(mix(instanceColor, color.rgb, color.a), 1.0);');
    };
    material.customProgramCacheKey = () => 'parked-sedan-paint-and-trim';
    mesh = new T.InstancedMesh(part.geometry, material, cars.length);
    mesh.name = '신세계 동문 · 승용차 근접 외장';
    mesh.count = 0;
    mesh.visible = false;
    mesh.frustumCulled = false;
    mesh.userData.owner = cars[0].place;
    mesh.userData.terrainApplied = true;
    mesh.setColorAt(0, paint);
    K.addMesh(mesh);
  }

  K.onFrame((_dt, t, eye) => {
    if (!K.pointInPoly(eye.x, eye.z, apron)) {
      if (mesh) { mesh.visible = false; mesh.count = 0; previous.length = 0; }
      return;
    }
    visible.length = 0;
    const horizontal = Math.cos(eye.pitch), fy = Math.sin(eye.pitch);
    const fx = -Math.sin(eye.yaw)*horizontal, fz = -Math.cos(eye.yaw)*horizontal;
    for (let i = 0; i < cars.length; i++) {
      const car = cars[i], dx = car.x-eye.x, dz = car.z-eye.z;
      if (Math.abs(eye.y-car.y) > 3) continue;
      const dy = car.y + .8 - eye.y - eye.eye;
      const distanceSq = dx*dx + dz*dz + dy*dy;
      if (distanceSq > 13*13) continue;
      // Keep a partially visible close bumper as its centre crosses the view edge.
      if (fx*dx + fy*dy + fz*dz + 2.4 < Math.sqrt(distanceSq)*.55) continue;
      visible.push(i);
    }
    if (!mesh) {
      if (visible.length && !loading && t >= retry) {
        loading = true;
        pending ??= loadArchitecture('../sedan-curb/sedan-curb.glb');
        pending.then(([part]) => install(part)).catch(() => {
          pending = undefined;
          retry = t + 2;
        }).finally(() => { loading = false; });
      }
      return;
    }
    if (visible.length === previous.length && visible.every((id, i) => id === previous[i])) return;
    previous.length = 0;
    previous.push(...visible);
    mesh.count = visible.length;
    mesh.visible = visible.length > 0;
    for (let slot = 0; slot < visible.length; slot++) {
      const i = visible[slot];
      mesh.setMatrixAt(slot, scratch.multiplyMatrices(poses[i], local));
      mesh.setColorAt(slot, paint.setHex(cars[i].color));
    }
    if (visible.length) {
      mesh.instanceMatrix.needsUpdate = true;
      mesh.instanceColor.needsUpdate = true;
    }
  });
}
