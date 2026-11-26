import {mountRetailDisplay} from '../../../js/places/shinsegae-retail-display.js';
import {relief} from '../../../js/banpo_relief.js';

const source = new URL('./counter.glb',import.meta.url);

export function chefStageSigns(K,x,y,z,yaw,width,depth) {
  const T = K.THREE, root = new T.Group(), fallback = new T.Group();
  root.name = '스위트 파크 · 셰프스 스테이지와 르솔레이';
  root.position.set(x,y+relief(x,z),z);
  root.rotation.y = yaw;
  root.scale.set(width/4.55,1,depth/1.43);
  root.add(fallback);
  const geometry = new T.BoxGeometry();
  const bronze = new T.MeshStandardMaterial({color:0xa87c47});
  const black = new T.MeshStandardMaterial({color:0x292521});
  for (const [height,front,w,h] of [[1.62,-.35,1.29,.33],[1.347,.37,.7,.265]]) {
    for (const [offset,shrink,material] of [[0,0,bronze],[.045,.07,black]]) {
      const mesh = new T.Mesh(geometry,material);
      mesh.scale.set(w-shrink,h-shrink,.035);
      mesh.position.set(0,height,front+offset);
      fallback.add(mesh);
    }
  }
  mountRetailDisplay(K,{root,fallback,source,batches:['SweetParkChefsStage'],x,y,z,nearDistance:12,displayDistance:21});
}
