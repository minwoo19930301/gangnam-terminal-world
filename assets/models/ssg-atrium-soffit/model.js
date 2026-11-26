import {boxSilhouette} from '../interior-architecture/box-silhouette.js';
import {placeSingleDetail} from '../interior-architecture/single-detail.js';

export function placeAtriumCeiling(K, x, y, z, angle) {
  const T = K.THREE;
  const finish = new T.MeshLambertMaterial({vertexColors:true, emissive:0x6e6354});
  // Only the opal lenses emit light. The backing board and frames receive the room's light.
  finish.onBeforeCompile = shader => {
    shader.fragmentShader = shader.fragmentShader.replace('#include <emissivemap_fragment>', `#include <emissivemap_fragment>
      #ifdef USE_COLOR_ALPHA
        totalEmissiveRadiance += diffuseColor.rgb * (1.0 - vColor.a) * 1.1;
        diffuseColor.a = opacity;
      #endif`);
  };
  finish.customProgramCacheKey = () => 'atrium-opal-lenses';
  const fallback = boxSilhouette(T, [
    [0, -.028, 0, 17.35, .027, 11.90, 0xe3e0d5],
    ...[-8.675, 8.675].map(edge => [edge, -.09, 0, .055, .065, 11.90, 0xa4a49b]),
    ...[-5.95, 5.95].map(edge => [0, -.09, edge, 17.35, .065, .055, 0xa4a49b]),
  ]);
  return placeSingleDetail(K, {
    name: '신세계 본관 10층 · 에스컬레이터 위 천장',
    file: '../ssg-atrium-soffit/ceiling.glb',
    at: [x, y, z], angle, fallback, fallbackMaterial: finish, material: finish,
    range: 24, exitRange: 27, eyeHeight: -2.58, floorTolerance: 2.15,
  });
}
