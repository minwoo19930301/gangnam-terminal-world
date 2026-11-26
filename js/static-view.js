// Kit triangles and quads own consecutive vertices in emission order. Small
// runs of consecutive pavement, facade, shop wall or furniture faces have much tighter
// bounds than an entire 320 m material tile.
const CHUNK = 384 * 3;
const MIN_INDICES = CHUNK * 12;

function chunkBounds(positions, indices) {
  const chunks = Math.ceil(indices.length / CHUNK);
  const bounds = new Float32Array(chunks * 6);
  for (let i = 0; i < chunks; i++) {
    const start = i * CHUNK, end = Math.min(start + CHUNK, indices.length);
    // Either half of a quad starts at its base, even for reversed winding.
    const first = indices[start], last = Math.max(indices[end-1], indices[end-2], indices[end-3]);
    let x0 = Infinity, y0 = Infinity, z0 = Infinity;
    let x1 = -Infinity, y1 = -Infinity, z1 = -Infinity;
    for (let v = first * 3; v <= last * 3; v += 3) {
      const x = positions[v], y = positions[v+1], z = positions[v+2];
      x0 = Math.min(x0,x); y0 = Math.min(y0,y); z0 = Math.min(z0,z);
      x1 = Math.max(x1,x); y1 = Math.max(y1,y); z1 = Math.max(z1,z);
    }
    bounds.set([x0,y0,z0,x1,y1,z1],i*6);
  }
  return bounds;
}

export function streetBatchView(THREE, scene, deck = null) {
  const projection = new THREE.Matrix4(), previous = new THREE.Matrix4();
  const view = new THREE.Frustum(), identity = new THREE.Matrix4();
  const extensions = new WeakMap();
  let generation = 0, sceneCamera, deckRevision = -1;
  const beforeScene = scene.onBeforeRender;
  scene.onBeforeRender = function(renderer, world, camera, ...args) {
    beforeScene.call(this,renderer,world,camera,...args);
    sceneCamera = camera;
    if (!camera.isPerspectiveCamera) return;
    projection.multiplyMatrices(camera.projectionMatrix,camera.matrixWorldInverse);
    if (previous.equals(projection) && deckRevision === (deck?.revision ?? 0)) return;
    deckRevision = deck?.revision ?? 0;
    previous.copy(projection);
    view.setFromProjectionMatrix(projection);
    generation++;
  };

  function multiDraw(renderer) {
    if (!extensions.has(renderer)) {
      extensions.set(renderer,renderer.getContext().getExtension('WEBGL_multi_draw'));
      renderer.domElement.addEventListener('webglcontextrestored',() => extensions.delete(renderer),{once:true});
    }
    return extensions.get(renderer);
  }

  function flightBounds(mesh, moving, relief) {
    const geometry = mesh.geometry;
    if (!geometry.boundingBox) geometry.computeBoundingBox();
    const part = geometry.boundingBox.clone(), bounds = new THREE.Box3();
    // The shader advances a tread by at most one local run and one riser.
    if (moving) { part.max.z += 1; part.max.y += 1; part.min.y -= 1; }
    const matrix = new THREE.Matrix4(), box = new THREE.Box3();
    for (let i = 0; i < mesh.count; i++) {
      mesh.getMatrixAt(i,matrix);
      const grade = relief(matrix.elements[12],matrix.elements[14]);
      box.copy(part).applyMatrix4(matrix);
      box.min.y += grade; box.max.y += grade;
      bounds.union(box);
    }
    return bounds;
  }
  function flight(mesh, moving, relief) {
    const bounds = flightBounds(mesh,moving,relief);
    let total;
    mesh.onBeforeRender = (renderer, world, camera) => {
      total = mesh.count;
      if (camera === sceneCamera && camera.isPerspectiveCamera && mesh.matrixWorld.equals(identity) && !view.intersectsBox(bounds)) mesh.count = 0;
    };
    mesh.onAfterRender = () => { mesh.count = total; };
  }

  function batchLandings(meshes, detailObjects, relief) {
    const groups = new Map();
    for (const mesh of meshes) {
      if (mesh.parent !== scene || !mesh.count) continue;
      const c = mesh.boundingSphere.center;
      const key = [mesh.geometry.id,mesh.material.id,mesh.userData.owner,
        Math.floor(c.x / 48),Math.floor(c.y / 14),Math.floor(c.z / 48)].join('|');
      if (!groups.has(key)) groups.set(key,[]);
      groups.get(key).push(mesh);
    }
    for (const pieces of groups.values()) {
      if (pieces.length === 1) { flight(pieces[0],false,relief); continue; }
      const first = pieces[0], total = pieces.reduce((n,mesh) => n + mesh.count,0);
      const batch = new THREE.InstancedMesh(first.geometry,first.material,total);
      batch.name = first.name;
      Object.assign(batch.userData,first.userData);
      let offset = 0;
      for (const mesh of pieces) {
        batch.instanceMatrix.array.set(mesh.instanceMatrix.array.subarray(0,mesh.count*16),offset);
        offset += mesh.count*16;
        scene.remove(mesh);
        detailObjects?.delete(mesh);
      }
      batch.computeBoundingSphere();
      scene.add(batch);
      detailObjects?.add(batch);
      flight(batch,false,relief);
    }
    meshes.length = 0;
  }

  function attach(mesh, largeOnly=false) {
    const g = mesh.geometry, source = g.index;
    if (!source || mesh.material.transparent || (largeOnly && source.count < MIN_INDICES)) return;
    function ordinary(camera, material, group) {
      return camera === sceneCamera && camera.isPerspectiveCamera && !group && !material.wireframe &&
        mesh.matrixWorld.equals(identity) && g.drawRange.start === 0 && g.drawRange.count === Infinity;
    }
    if (source.count < MIN_INDICES) {
      let hidden;
      mesh.onBeforeRender = (renderer, world, camera, geometry, material, group) => {
        hidden = ordinary(camera,material,group) && !view.intersectsBox(g.boundingBox);
        if (hidden) g.setDrawRange(0,-1);
      };
      mesh.onAfterRender = () => { if (hidden) g.setDrawRange(0,Infinity); };
      return;
    }

    const bounds = chunkBounds(g.attributes.position.array,source.array);
    const chunks = bounds.length / 6, box = new THREE.Box3();
    const starts = new Int32Array(chunks), counts = new Int32Array(chunks);
    // A turn changes the frustum but leaves projections onto fixed floors and walls unchanged.
    const coverage = deck ? new Int32Array(chunks) : null;
    const bytes = source.array.BYTES_PER_ELEMENT;
    let cached = -1, ext, spans = 0, extraIndices = 0, active = false;
    function select() {
      const gaps = [];
      let start = -1, end = 0;
      const stamp = deck?.active ? deck.revision+1 : 0;
      for (let i = 0; i < chunks; i++) {
        box.min.fromArray(bounds,6*i); box.max.fromArray(bounds,6*i+3);
        if (!view.intersectsBox(box)) continue;
        if (stamp) {
          if (coverage[i] === -stamp) continue;
          if (coverage[i] !== stamp) {
            const hidden = deck.hides(box);
            coverage[i] = hidden ? -stamp : stamp;
            if (hidden) continue;
          }
        }
        const offset = i * CHUNK;
        if (start < 0) start = offset;
        else if (offset-end >= CHUNK * (ext ? 2 : 8)) gaps.push([end,offset]);
        end = Math.min(offset+CHUNK,source.count);
      }
      spans = 0; extraIndices = 0;
      if (start < 0) return;
      // Some devices need one submission per span. Keep only the three
      // largest gaps on those devices so one tile costs at most four draws.
      if (!ext && gaps.length > 3) {
        gaps.sort((a,b) => (b[1]-b[0]) - (a[1]-a[0])); gaps.length = 3;
        gaps.sort((a,b) => a[0]-b[0]);
      }
      for (const [from,to] of gaps) {
        starts[spans] = start*bytes; counts[spans++] = from-start;
        start = to;
      }
      starts[spans] = start*bytes; counts[spans++] = end-start;
      for (let i = 1; i < spans; i++) extraIndices += counts[i];
    }
    mesh.onBeforeRender = (renderer, world, camera, geometry, material, group) => {
      active = ordinary(camera,material,group);
      if (!active) return;
      const extension = multiDraw(renderer);
      if (cached !== generation || ext !== extension) {
        cached = generation; ext = extension; select();
      }
      g.setDrawRange(spans ? starts[0]/bytes : 0,spans ? counts[0] : -1);
    };
    mesh.onAfterRender = (renderer, world, camera, geometry, material, group) => {
      if (!active) return;
      if (spans > 1 && ext) {
        // Three has bound the VAO, immutable index and material for the first
        // span. The extension submits the rest under the same WebGL state.
        const gl = renderer.getContext();
        ext.multiDrawElementsWEBGL(gl.TRIANGLES,counts,1,bytes === 2 ? gl.UNSIGNED_SHORT : gl.UNSIGNED_INT,starts,1,spans-1);
        renderer.info.update(extraIndices,gl.TRIANGLES,1);
      } else {
        for (let i = 1; i < spans; i++) {
          g.setDrawRange(starts[i]/bytes,counts[i]);
          renderer.renderBufferDirect(camera,world,g,material,mesh,group);
        }
      }
      g.setDrawRange(0,Infinity);
    };
  }
  return {attach,flight,flightBounds,batchLandings};
}
