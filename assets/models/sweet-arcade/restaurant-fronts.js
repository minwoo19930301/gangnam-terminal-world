import {boxSilhouette} from '../interior-architecture/box-silhouette.js';
import {placeSingleDetail} from '../interior-architecture/single-detail.js';

const fronts={
  chipotle:{
    name:'치폴레 강남신세계점 · 주문대',file:'../chipotle-gangnam/counter.glb',
    bounds:[[-3.55,0,-1.84],[3.55,3.46,.47]],back:2.5,
    parts:[[-.17,0,0,6.13,.89,.80,0x999791],[0,1.99,-.49,6.39,.70,.105,0xc2cacc],
      [-.04,2.75,-.39,2.84,.47,.17,0x722b26],[0,0,-1.77,6.88,2.69,.10,0x938c7c]]
  },
  fiveGuys:{
    name:'파이브가이즈 고속터미널 · 창과 음료대',file:'../five-guys-gangnam/front.glb',
    bounds:[[-3.01,0,-3.25],[3.01,3.69,.25]],back:3.45,
    parts:[[-.69,2.52,-.10,3.80,.48,.34,0x302a27],[1.88,2.72,-.19,1.44,.32,.37,0x302a27],
      [2.53,0,-.14,.125,2.90,.34,0x9c662e],[-.76,0,-1.87,2.72,.80,.69,0xa93b38]]
  }
};

export function restaurantFront(K,brand,x,y,z,angle){
  const T=K.THREE,{name,file,bounds,back,parts}=fronts[brand],fallback=boxSilhouette(T,parts);
  const material=new T.MeshLambertMaterial({vertexColors:true,side:T.DoubleSide});
  material.onBeforeCompile=shader=>{
    shader.fragmentShader=shader.fragmentShader.replace('#include <emissivemap_fragment>',
      '#include <emissivemap_fragment>\n totalEmissiveRadiance+=vColor.rgb*.23*smoothstep(.73,.94,min(vColor.r,min(vColor.g,vColor.b)));');
  };
  placeSingleDetail(K,{name,file,at:[x,y,z],angle,fallback,material,fallbackMaterial:material,
    range:13,exitRange:16,floorTolerance:2.25,eyeHeight:1.62,
    viewBounds:[new T.Box3(...bounds.map(p=>new T.Vector3(...p)))],
    closeVisibleFrom:p=>(p.x-x)*Math.sin(angle)+(p.z-z)*Math.cos(angle)>-back});
}
