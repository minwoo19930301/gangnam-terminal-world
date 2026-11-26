import {relief} from '../../../js/banpo_relief.js';
import {boxSilhouette} from '../interior-architecture/box-silhouette.js';
import {placeSingleDetail} from '../interior-architecture/single-detail.js';

export function registerGlxyStudio(K,{x,y,z,angle,poly}){
  const T=K.THREE,co=Math.cos(angle),si=Math.sin(angle);
  const racks=[[-1.52,-1.58,3.05,.55],[1.46,-1.77,2.58,.55],[2.65,.32,.56,2.53],[-2.96,-.19,.56,1.8],[-1.15,-.72,2.66,.56]];
  const fixtures=[...racks.map(([a,b,w,d])=>[a,b,w,d,1.81]),
    [-.95,1.55,1.68,.84,.783],[.42,1.70,.68,.64,1.31],[0,-3.12,7.31,.13,3.19]];
  for(const [a,b,w,d,h] of fixtures){
    K.box({x:x+a*co+b*si,z:z-a*si+b*co,y,w,d,h,rotY:angle,mat:0xa69681,skip:['top','bottom','n','s','e','w']});
  }
  K.phys.addCeiling(poly,y+3.563);
  const visibleFrom=(px,eye,pz)=>{
    const dx=px-x,dz=pz-z,side=dx*co-dz*si,front=dx*si+dz*co;
    // The north aisle sees the right rack. A shorter view remains from the
    // front corner of the neighbouring shirt shop beyond its partial divider.
    return eye>=y-.12 && eye<=y+3.66 && front>=-3.23 && (side>=-3.85 || front>=-.30);
  };
  K.detail({floor:'7F',poly,y0:y,y1:y+3.61,name:'GLXY studio · G핏 바지와 진열대',visibleFrom},()=>{
    const proxy=boxSilhouette(T,[
      [0,.03,-3.12,7.31,3.16,.13,0xb58c64],[-.95,.04,1.55,1.68,.74,.84,0xc2c1ba],
      [.42,.16,1.70,.47,1,.23,0xbba586],...racks.map(([a,b,w,d])=>[a,.73,b,w,.91,d,0x4d5257]),
      [0,.012,.005,7.45,.016,6.48,0xdbd7cb],
    ]);
    const bounds=new T.Box3(new T.Vector3(-3.76,0,-3.26),new T.Vector3(3.76,3.61,3.26));
    proxy.boundingSphere=bounds.getBoundingSphere(new T.Sphere());
    const mat=new T.MeshLambertMaterial({vertexColors:true,side:T.DoubleSide});
    mat.onBeforeCompile=shader=>{
      shader.fragmentShader=shader.fragmentShader.replace('#include <emissivemap_fragment>',
        `#include <emissivemap_fragment>
          float logo=smoothstep(.988,.998,vColor.g)*smoothstep(.84,.9,vColor.b);
          float strip=smoothstep(.988,.998,vColor.r)*smoothstep(.85,.89,vColor.g)*(1.0-smoothstep(.69,.78,vColor.b));
          totalEmissiveRadiance+=vColor.rgb*(.85*logo+.65*strip);`);
    };
    placeSingleDetail(K,{name:'GLXY studio · G핏 바지와 진열대',file:'../ssg-glxy-studio/gallery.glb',at:[x,y,z],angle,rigidGround:relief(x,z),
      fallback:proxy,material:mat,fallbackMaterial:mat,range:23,exitRange:30,eyeHeight:1.62,floorTolerance:2.25,
      viewBounds:[bounds],nativeInstanceName:'GLXYStudio'});
  });
}
