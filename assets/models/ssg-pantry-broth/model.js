import {relief} from '../../../js/banpo_relief.js';
import {mountRetailDisplay} from '../../../js/places/shinsegae-retail-display.js';

export function brothWells(K, x, floorY, z, angle, width, depth) {
  const T = K.THREE;
  const root = new T.Group();
  root.name = '발효:곳간 · 육수 재료 진열대';
  root.position.set(x, floorY+.892+relief(x,z), z);
  root.rotation.y = angle;
  root.scale.set(Math.min(1,width/3), 1, Math.min(1,depth/.8));
  const fallback = new T.Group();
  root.add(fallback);
  const deck = new T.Mesh(new T.BoxGeometry(2.98,.065,.79),new T.MeshStandardMaterial({color:0x646560}));
  deck.position.y = .033;
  fallback.add(deck);
  const colors = [0xba7552,0x969767,0x9c815f,0x9e9884,0xb1a58a,0xc9b988,0x847655,0xb9a379];
  for (const [i,color] of colors.entries()) {
    const well = new T.Mesh(new T.BoxGeometry(.62,.012,.29),new T.MeshStandardMaterial({color}));
    well.position.set((i%4-1.5)*.745,.069,(Math.floor(i/4)-.5)*.397);
    fallback.add(well);
  }
  mountRetailDisplay(K, {
    root, fallback, source:new URL('./broth-wells.glb',import.meta.url),
    batches:['BrothIngredients'], x, y:floorY, z, nearDistance:10, displayDistance:22,
  });
}
