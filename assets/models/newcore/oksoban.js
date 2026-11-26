import {boxes} from './oksoban-base.js';
import {loadFixtureScene} from '../onebailey/load.js';

const footprintOnly = {skip: ['top', 'bottom', 'n', 's', 'e', 'w']};

export function registerOksobanTable(F, u, y, v) {
  const {K} = F;
  const footprint = F.Q(u - 1.1, v - 1.1, u + 1.1, v + 1.1);
  K.detail({name: '옥소반 · 샤브샤브 식탁', floor: '5F', poly: footprint, y0: y, y1: y + 1.25}, () => {
    for (const [x, bottom, z, width, height, depth, chamfer, color] of boxes) {
      const a = width / 2000, b = depth / 2000, k = chamfer / 1000;
      const cx = u + x / 1000, cz = v + z / 1000, floor = y + bottom / 1000;
      if (!k) {
        F.B(cx, floor, cz, 2*a, height/1000, 2*b, color, {solid: false});
        continue;
      }
      const corners = [[-a+k,-b],[a-k,-b],[a,-b+k],[a,b-k],[a-k,b],[-a+k,b],[-a,b-k],[-a,-b+k]];
      const outline = corners.map(([i,j]) => F.P(cx+i,cz+j));
      K.prism(outline, floor, floor + height/1000, {mat: color, solid: false});
    }
    F.B(u, y, v, 1.83, .74, 1.8, 0x49372d, footprintOnly);

    const T = K.THREE;
    const lod = new T.LOD();
    const [x, z] = F.P(u, v);
    lod.position.set(x, y, z);
    lod.rotation.y = F.angle;
    const plate = new T.BoxGeometry(.415, .012, .416);
    plate.translate(.115, .806, .005);
    const matte = new T.MeshLambertMaterial({color: 0x24272a});
    const near = new T.Mesh(plate, matte), far = new T.Mesh(plate, matte);
    near.name = '옥소반 · 인덕션';
    far.name = near.name;
    lod.addLevel(near, 0);
    lod.addLevel(far, 13, .12);
    // Register both meshes during the detail callback so floor visibility controls both distances.
    K.addMesh(lod);
    let pending = false, retryAfter = 0;
    near.onBeforeRender = (renderer, scene, camera) => {
      if (pending || performance.now() < retryAfter || Math.abs(camera.position.y - y) > 3.5) return;
      pending = true;
      loadFixtureScene(new URL('./oksoban-setting.glb', import.meta.url)).then(library => {
        const source = library.getObjectByName('Surface');
        near.geometry = source.geometry;
        near.material = new T.MeshLambertMaterial({vertexColors: true, side: T.DoubleSide});
        // The exported mesh stores its quantization scale and origin on the glTF node.
        near.matrix.copy(source.matrixWorld);
        near.matrixAutoUpdate = false;
        near.matrixWorldNeedsUpdate = true;
        near.name = '옥소반 샤브샤브 상차림';
        near.onBeforeRender = () => {};
      }).catch(() => {
        pending = false;
        retryAfter = performance.now() + 10000;
      });
    };
  });
}
