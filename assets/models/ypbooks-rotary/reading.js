import {bookAngle,bookOrigin,bookPoint} from '../cinema-rotary/layout.js';
import {boxSilhouette} from '../interior-architecture/box-silhouette.js';
import {placeSingleDetail} from '../interior-architecture/single-detail.js';

export function bookReadingBay(K,y){
  const stepWidth=2.54,run=.31,rise=.16;
  const steps=[];
  for(let i=0;i<3;i++){
    const front=2.08+run*i,back=i===2?4.92:front+run;
    const poly=[[-2.5,front],[.04,front],[.04,back],[-2.5,back]].map(p=>bookPoint(...p));
    K.phys.addSurface(poly,y+rise*(i+1));
    steps.push([-1.23,i*rise,-(front+back)/2,stepWidth,rise,back-front,0xa77d52]);
  }
  // Public display furniture stands on the landing rather than in the steps.
  for(const [x1,d1,x2,d2,h,r] of [[-2.33,2.91,-2.33,4.68,2.75,.17],
    [-2.13,4.71,-.01,4.71,2.75,.18],[-1.15,3.64,-.70,3.64,.45,.22]])
    K.phys.addWall(...bookPoint(x1,d1),...bookPoint(x2,d2),y+.48,y+.48+h,r);
  const T=K.THREE,material=new T.MeshLambertMaterial({vertexColors:true,side:T.DoubleSide});
  // The branch's top shelf lights wash the page blocks and timber faces.
  material.onBeforeCompile=shader=>{
    shader.fragmentShader=shader.fragmentShader.replace('#include <emissivemap_fragment>',
      `#include <emissivemap_fragment>
       totalEmissiveRadiance+=vColor.rgb*(.12+.50*smoothstep(.80,.94,vColor.g));`);
  };
  const fallback=boxSilhouette(T,[...steps,[-1.20,.48,-4.72,2.4,2.46,.36,0xc7aa80]]);
  placeSingleDetail(K,{name:'영풍문고 · 계단식 독서 공간',file:'../ypbooks-rotary/reading.glb',at:[bookOrigin[0],y,bookOrigin[1]],
    angle:bookAngle,fallback,material,fallbackMaterial:material,range:8.5,exitRange:10.5,eyeHeight:1.5,floorTolerance:3.0,
    viewBounds:[new T.Box3(new T.Vector3(-2.52,.02,-4.93),new T.Vector3(.13,3.25,-2.06))],
    closeVisibleFrom:p=>{
      const dx=p.x-bookOrigin[0],dz=p.z-bookOrigin[1];
      const depth=-(dx*Math.sin(bookAngle)+dz*Math.cos(bookAngle));
      const side=dx*Math.cos(bookAngle)-dz*Math.sin(bookAngle);
      return depth> -1.5 && depth<5.05 && side> -2.65 && side<2.60;
    }});
}
