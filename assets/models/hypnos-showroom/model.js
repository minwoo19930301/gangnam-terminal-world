import {loadFixtureScene} from '../onebailey/load.js';

// Basic silhouettes remain visible without downloading the near furnishings.
function makeProxy(T) {
  // centre x, depth into the store, bottom, width, depth, height, finish
  const blocks = [
    [1.91,4.86,.13,1.6,2.05,.26,0x243851], [1.91,4.86,.39,1.6,2.05,.30,0xe8e3d3],
    [1.91,5.87,.31,1.67,.13,1.23,0x243851], [1.91,5.51,.69,1.30,.36,.25,0xf2ecdf],
    [.93,1.68,.13,1.29,1.90,.26,0xe5dfca], [.93,1.68,.39,1.29,1.90,.30,0xe8e3d3],
    [.93,2.62,.31,1.36,.13,1.06,0xe5dfca], [.93,1.01,.69,1.30,.45,.025,0x243851],
    [.93,2.28,.69,1.06,.32,.23,0xf2ecdf], [1.886,6.10,.03,3.4,.105,3.20,0xddd1b9],
    [.30,3.55,1.28,.20,1.96,1.28,0x69503b], [3.45,4.17,.04,.26,1.04,1.89,0xcac4b0],
    [1.89,4.40,3.065,2.60,2.94,.05,0xf0e7d3],
  ];
  const unit = new T.BoxGeometry(1,1,1).toNonIndexed();
  const pos = unit.getAttribute('position'), normal = unit.getAttribute('normal');
  const pts = [], normals = [], colors = [], color = new T.Color();
  for (const [x, b, y, w, d, h, rgb] of blocks) {
    color.setHex(rgb);
    for (let i=0; i<pos.count; i++) {
      pts.push(x + w*pos.getX(i), y + h*(pos.getY(i)+.5), -b + d*pos.getZ(i));
      normals.push(normal.getX(i), normal.getY(i), normal.getZ(i));
      colors.push(color.r, color.g, color.b);
    }
  }
  unit.dispose();
  const g = new T.BufferGeometry();
  for (const [name, values] of [['position',pts],['normal',normals],['color',colors]]) {
    g.setAttribute(name,new T.Float32BufferAttribute(values,3));
  }
  g.computeBoundingSphere();
  return g;
}

export function placeHypnos(K, point) {
  const T = K.THREE;
  const frame = new T.Group();
  const origin = new T.Vector3(...point(0,0));
  const dx = new T.Vector3(...point(1,0)).sub(origin);
  const dz = new T.Vector3(...point(0,-1)).sub(origin);
  frame.matrix.makeBasis(dx, new T.Vector3(0,1,0), dz).setPosition(origin);
  frame.matrixAutoUpdate = false;
  const lod = new T.LOD();
  lod.position.set(1.89,.7,-3.17);
  frame.add(lod);

  const proxy = makeProxy(T);
  const matte = new T.MeshLambertMaterial({vertexColors:true});
  const coarse = new T.Mesh(proxy,matte), preview = new T.Mesh(proxy,matte);
  const near = new T.Group();
  near.add(preview);
  for (const level of [coarse,near]) level.position.copy(lod.position).negate();
  lod.addLevel(near,0);
  lod.addLevel(coarse,21,.12);
  coarse.name = preview.name = '히프노스 침대 · 원거리';

  // Register concrete slots before the floor's lazy callback returns. The same
  // layer switches must reach a mesh even when its GLB resolves afterwards.
  const slots = {};
  for (const finish of ['cloth','wood','metal','light']) {
    const slot = new T.Mesh(new T.BufferGeometry(),matte);
    slot.visible = false;
    near.add(slot);
    slots[finish] = slot;
  }
  K.addMesh(frame);
  let pending = false, retryAt = 0;
  preview.onBeforeRender = (_renderer,_scene,camera) => {
    if (pending || performance.now()<retryAt || Math.abs(camera.position.y-origin.y)>4.4) return;
    pending = true;
    loadFixtureScene(new URL('./showroom.glb',import.meta.url)).then(library => {
      const finishes = {
        cloth:new T.MeshStandardMaterial({vertexColors:true,roughness:.88,side:T.DoubleSide}),
        wood:new T.MeshStandardMaterial({vertexColors:true,roughness:.50,side:T.DoubleSide}),
        metal:new T.MeshStandardMaterial({vertexColors:true,roughness:.34,metalness:.43,side:T.DoubleSide}),
        light:new T.MeshBasicMaterial({vertexColors:true,side:T.DoubleSide}),
      };
      for (const [key,slot] of Object.entries(slots)) {
        const source = library.getObjectByName(key);
        slot.geometry.dispose();
        slot.geometry = source.geometry;
        slot.material = finishes[key];
        slot.matrix.copy(source.matrixWorld);
        slot.matrixAutoUpdate = false;
        slot.matrixWorldNeedsUpdate = true;
        slot.name = '히프노스 9F · '+key;
        slot.visible = true;
      }
      preview.visible = false;
    }).catch(() => {
      pending = false;
      retryAt = performance.now()+10000;
    });
  };
}
