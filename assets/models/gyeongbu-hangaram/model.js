import {boxSilhouette} from '../interior-architecture/box-silhouette.js';
import {placeSingleDetail} from '../interior-architecture/single-detail.js';

let paint,coarse,hidden,probe;
export function placeFramingShop(K,at,angle){
  const T=K.THREE;
  paint??=new T.MeshLambertMaterial({vertexColors:true,side:T.DoubleSide});
  coarse??=boxSilhouette(T,[
    [0,2.36,-.04,6.39,.426,.12,0x733041],[-2.20,.08,-.42,1.65,2.15,.08,0xd8d0ae],
    [1.75,.10,-.44,2.66,2.12,.08,0xddcfaa],[0,.05,-4.45,5.91,.46,.69,0xe0dac5],
  ]);
  hidden??=new T.MeshBasicMaterial({colorWrite:false,depthWrite:false});
  probe??=new T.BoxGeometry(6.31,2.5,4.64).translate(0,1.27,-2.52);
  const atShop={at,angle,material:paint,eyeHeight:1.35,floorTolerance:1.95};
  placeSingleDetail(K,{...atShop,name:'한가람문구 · 맞춤액자 코너',file:'../gyeongbu-hangaram/frame-room.glb',
    fallback:coarse,fallbackMaterial:paint,range:15,exitRange:21,
    viewBounds:[new T.Box3(new T.Vector3(-3.18,.02,-4.98),new T.Vector3(3.19,2.79,.96))]});
  placeSingleDetail(K,{...atShop,name:'한가람문구 · 액자 금박과 견본화',file:'../gyeongbu-hangaram/frame-inlay.glb',
    fallback:probe,fallbackMaterial:hidden,range:5.75,exitRange:8.25,
    viewBounds:[new T.Box3(new T.Vector3(-3.03,.15,-.45),new T.Vector3(2.95,2.36,-.22)),
      new T.Box3(new T.Vector3(-3.04,.13,-4.96),new T.Vector3(3.03,2.31,-1.48))]});
}
