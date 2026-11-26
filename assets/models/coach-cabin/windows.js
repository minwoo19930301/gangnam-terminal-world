import {relief} from '../../../js/banpo_relief.js';

const panels = new URL('./windows.webp', import.meta.url);

// The parking bays share a single texture. A distant outdoor tile can contain
// many coaches, so test the actual cabin bounds as well as the tile callback.
export function coachGlazing(K) {
  const T = K.THREE;
  const material = new T.MeshLambertMaterial({color: 0x1d3039});
  material.name = '경부선 고속버스 · 차창';
  const key = K.material('gbCoachGlazing', material);
  const frustum = new T.Frustum(), projection = new T.Matrix4(), cabins = [];
  let nextCheck = 0, pending = false;
  material.onBeforeRender = (_renderer, _scene, camera) => {
    const now = performance.now();
    if (material.map || pending || now < nextCheck) return;
    nextCheck = now + 125;
    frustum.setFromProjectionMatrix(projection.multiplyMatrices(camera.projectionMatrix, camera.matrixWorldInverse));
    if (!cabins.some(bounds => bounds.distanceToPoint(camera.position) < 26 && frustum.intersectsBox(bounds))) return;
    pending = true;
    new T.TextureLoader().load(panels.href, tex => {
      tex.colorSpace = T.SRGBColorSpace;
      tex.anisotropy = 4;
      material.map = tex;
      material.color.set(0xc0cdd2);
      material.needsUpdate = true;
      material.onBeforeRender = () => {};
    }, undefined, () => {
      pending = false;
      nextCheck = performance.now() + 10000;
    });
  };
  return {
    register(x, z, deck, cos, sin) {
      const ht = relief(x, z) + deck;
      const dx = 1.27 * Math.abs(cos) + 5.55 * Math.abs(sin);
      const dz = 1.27 * Math.abs(sin) + 5.55 * Math.abs(cos);
      cabins.push(new T.Box3(new T.Vector3(x - dx, ht + 1.67, z - dz),
                             new T.Vector3(x + dx, ht + 3.12, z + dz)));
    },
    panel(points, normal, side) {
      const first = side > 0 ? 1 : 0, last = 1 - first;
      const low = (side > 0 ? .5 : 0) + .5 / 432, high = low + .5 - 1 / 432;
      K.quad(key, points, normal, [[first,low],[last,low],[last,high],[first,high]]);
    }
  };
}
