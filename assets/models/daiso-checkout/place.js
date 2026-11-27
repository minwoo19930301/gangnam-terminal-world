import {boxSilhouette} from '../interior-architecture/box-silhouette.js';
import {placeSingleDetail} from '../interior-architecture/single-detail.js';

const name='다이소 · 셀프계산과 포장 봉투';
let silhouette, material;

export function placePackingCheckout(K,at,angle){
  if(!silhouette){
    silhouette=boxSilhouette(K.THREE,[
      [.03,.02,0,.69,.80,.66,0xe6e2d8],[0,.83,0,.96,.052,.76,0xb7bab6],
      [.03,.88,.10,.29,.44,.21,0xebe9df],[.035,1.30,.12,.51,.35,.08,0x333735],
      [.035,1.33,.065,.47,.29,.008,0xebebe5],[-.655,.045,0,.34,.14,.42,0xe7e6dd],
      [-.655,.46,0,.34,.17,.42,0xe7e6dd],[-.655,.61,-.22,.34,.17,.014,0xdddcd4],
    ]);
    material=new K.THREE.MeshLambertMaterial({vertexColors:true,side:K.THREE.DoubleSide});
  }
  return placeSingleDetail(K,{name,file:'../daiso-checkout/counter.glb',at,angle,
    fallback:silhouette,fallbackMaterial:material,material,range:8,exitRange:11,floorTolerance:2.15,eyeHeight:1.1});
}
