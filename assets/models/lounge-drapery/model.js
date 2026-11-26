import {placeSingleDetail} from '../interior-architecture/single-detail.js';

function coarseCloth(T) {
  const levels=[[.03,.90],[1.42,.36],[2.2,.77],[3.10,1.18],[4.14,1.73],[5.09,2.30]];
  const positions=[],indices=[],folds=10;
  for(const side of [-1,1]){
    const offset=positions.length/3;
    for(const [y,width] of levels){
      for(let i=0;i<=folds;i++) {
        const u=i/folds;
        positions.push(side*(2.27-width*u),y,.061*Math.cos(Math.PI*i));
      }
    }
    for(let j=0;j<levels.length-1;j++)for(let i=0;i<folds;i++){
      const a=offset+j*(folds+1)+i,b=a+folds+1;
      indices.push(a,a+1,b+1,a,b+1,b);
    }
  }
  const geometry=new T.BufferGeometry();
  geometry.setAttribute('position',new T.Float32BufferAttribute(positions,3));
  geometry.setIndex(indices);
  geometry.computeVertexNormals();
  return geometry;
}

export function placeDrapery(K,x,y,z,angle) {
  const T=K.THREE;
  return placeSingleDetail(K,{
    name:'더 라운지 · 묶은 주름 커튼',file:'../lounge-drapery/gathered.glb',at:[x,y,z],angle,
    fallback:coarseCloth(T),fallbackMaterial:new T.MeshLambertMaterial({color:0xada0a4,side:T.DoubleSide}),
    material:new T.MeshPhongMaterial({vertexColors:true,shininess:12,specular:0x221c1c,side:T.DoubleSide}),
    range:15,exitRange:20,floorTolerance:3.05,eyeHeight:2.35,
  });
}
