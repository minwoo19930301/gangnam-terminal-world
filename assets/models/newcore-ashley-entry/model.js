import {mergeGeometries} from 'three/addons/utils/BufferGeometryUtils.js';
import {boxSilhouette} from '../interior-architecture/box-silhouette.js';
import {placeSingleDetail} from '../interior-architecture/single-detail.js';
import {makeCanvas} from '../../../js/textures.js';

function distantPortal(T){
  const body=boxSilhouette(T,[
    [-2.8,0,0,.70,3.42,.57,0x313c3d],[2.8,0,0,.70,3.42,.57,0x313c3d],
    [0,2.69,0,5.74,.63,.53,0x313c3d],[0,3.32,0,5.9,.093,.72,0x495353],
    [2.04,0,-.83,.64,1.05,.45,0x313c3d],[-2.17,.64,.02,.42,.68,.04,0x242c2d],
  ]);
  // Every solid samples a single white texel. The front quad shares its draw and
  // uses the rest of this canvas while the editable letter mesh is out of range.
  const canvas=makeCanvas(260,80),ctx=canvas.getContext('2d');
  ctx.fillStyle='#313c3d';ctx.fillRect(0,0,256,80);
  ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillStyle='#ffdf8b';
  ctx.font='bold 24px Georgia,serif';ctx.fillText('ASHLEY',127,19);
  ctx.font='bold 40px Georgia,serif';ctx.fillText('QUEENS',127,51);
  ctx.fillStyle='#fff';ctx.fillRect(256,0,4,80);
  const uv=body.attributes.uv;
  for(let i=0;i<uv.count;i++)uv.setXY(i,258/260,.5);
  const sign=new T.PlaneGeometry(2.18,.56);sign.translate(0,2.955,.33);
  const quadUV=sign.attributes.uv;
  for(let i=0;i<quadUV.count;i++)quadUV.setX(i,(.5+255*quadUV.getX(i))/260);
  sign.setAttribute('color',new T.Float32BufferAttribute(new Float32Array(12).fill(1),3));
  const tex=new T.CanvasTexture(canvas);tex.colorSpace=T.SRGBColorSpace;
  const geometry=mergeGeometries([body,sign]);body.dispose();sign.dispose();
  return {geometry,material:new T.MeshLambertMaterial({map:tex,vertexColors:true,side:T.DoubleSide})};
}

export function ashleyEntrance(F,u,y,front,bayView){
  const {K}=F,T=K.THREE,[x,z]=F.P(u,front),name='뉴코아 1관 5층 · 애슐리퀸즈 몰딩 입구';
  const inFront=(px,pz)=>(px-x)*Math.sin(F.angle)+(pz-z)*Math.cos(F.angle)>-.25;
  K.detail({name,floor:'5F',poly:F.Q(u-3.24,front-1.78,u+3.24,front+.38),y0:y,y1:y+3.45,
    visualOnly:true,silhouetteDistance:38,visibleFrom:bayView},()=>{
    const proxy=distantPortal(T);
    const mat=new T.MeshLambertMaterial({vertexColors:true,side:T.DoubleSide});
    mat.onBeforeCompile=shader=>{
      shader.fragmentShader=shader.fragmentShader.replace('#include <emissivemap_fragment>',
        '#include <emissivemap_fragment>\n totalEmissiveRadiance += vColor.rgb * .80 * smoothstep(.93,1.0,vColor.r) * smoothstep(.50,.64,vColor.g);');
    };
    placeSingleDetail(K,{name,file:'../newcore-ashley-entry/entrance.glb',at:[x,y,z],angle:F.angle,
      fallback:proxy.geometry,fallbackMaterial:proxy.material,material:mat,range:16,exitRange:19,
      eyeHeight:1.66,floorTolerance:2.95,closeVisibleFrom:p=>inFront(p.x,p.z)});
  });
  for(const [dx,d,w,depth,h] of [[-2.8,0,.72,.57,3.37],[2.8,0,.72,.57,3.37],
                                   [2.04,-.83,.65,.46,1.05],[-2.17,.02,.42,.32,1.32]]){
    K.phys.addWall(...F.P(u+dx-w/2,front+d),...F.P(u+dx+w/2,front+d),y,y+h,depth);
  }
}
