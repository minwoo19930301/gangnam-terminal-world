import {placeSingleDetail} from '../interior-architecture/single-detail.js';
import {relief} from '../../../js/banpo_relief.js';
import {distantGeometry} from './mesh-proxy.js';

const displays=new Map();

// A tiny floor, ceiling and two rack faces are available on the first frame.
// The camera can show them while the floor's full silhouette arrives.
function starter(T) {
  const positions=[],colours=[],indices=[];
  function panel(vertices,rgb){
    const first=positions.length/3;
    const c=new T.Color(rgb);
    for(const v of vertices){positions.push(...v);colours.push(c.r,c.g,c.b);}
    indices.push(first,first+1,first+2,first,first+2,first+3);
  }
  panel([[-2.45,.05,-12.8],[-2.45,.05,20.8],[2.45,.05,20.8],[2.45,.05,-12.8]],0x474a43);
  panel([[-2.45,2.963,-12.8],[2.45,2.963,-12.8],[2.45,2.963,20.8],[-2.45,2.963,20.8]],0xcec9b7);
  for(const side of [-1,1]){
    const x=1.68*side;
    const corners=[[x,.62,-2.59],[x,.62,2.59],[x,2.64,2.59],[x,2.64,-2.59]];
    panel(side<0?corners.slice().reverse():corners,side<0?0x555758:0x81786b);
  }
  const geometry=new T.BufferGeometry();
  geometry.setAttribute('position',new T.Float32BufferAttribute(positions,3));
  geometry.setAttribute('color',new T.Float32BufferAttribute(colours,3));
  geometry.setIndex(indices);geometry.computeVertexNormals();
  geometry.computeBoundingBox();geometry.computeBoundingSphere();
  return geometry;
}

function swapGeometry(target,source){
  target.dispose();
  for(const [name,attribute] of Object.entries(source.attributes))target.setAttribute(name,attribute);
  target.setIndex(source.index);
  target.boundingBox=source.boundingBox;
  target.boundingSphere=source.boundingSphere;
}

export function placeMarketDisplay(K,{name,file,at,angle,focus,silhouette}){
  const T=K.THREE;
  let state=displays.get(file);
  if(!state){
    state={geometry:starter(T),ready:false,pending:null,retry:0,failed:0};
    displays.set(file,state);
  }
  const viewBounds=focus.map(b=>new T.Box3(new T.Vector3(...b.slice(0,3)),new T.Vector3(...b.slice(3))));
  const root=placeSingleDetail(K,{name,file,at,angle,viewBounds,fallback:state.geometry,
    fallbackMaterial:new T.MeshLambertMaterial({vertexColors:true}),range:16,exitRange:22,eyeHeight:1.6,floorTolerance:2.0});
  const [x,y,z]=at,ground=relief(x,z),eye=y+ground+1.6;
  const item=root.children[0],near=item.onBeforeRender;
  const frustum=new T.Frustum(),projection=new T.Matrix4(),world=new T.Matrix4();
  item.onBeforeRender=(renderer,scene,camera,...rest)=>{
    if(!state.ready&&!state.pending&&performance.now()>=state.retry&&Math.abs(camera.position.y-eye)<2&&
       Math.hypot(camera.position.x-x,camera.position.z-z)<54){
      world.copy(root.matrixWorld);world.elements[13]+=ground;
      projection.multiplyMatrices(camera.projectionMatrix,camera.matrixWorldInverse).multiply(world);
      frustum.setFromProjectionMatrix(projection,camera.coordinateSystem);
      if(viewBounds.some(b=>frustum.intersectsBox(b))){
        // Browsers can remember failed ES module fetches. A retry gets its own
        // URL while ordinary arrivals keep the same HTTP and module cache key.
        const url=new URL(silhouette);
        if(state.failed)url.searchParams.set('attempt',String(state.failed));
        state.pending=import(url.href).then(source=>{
          swapGeometry(state.geometry,distantGeometry(T,source));
          state.ready=true;
        }).catch(()=>{state.failed++;state.retry=performance.now()+5000;}).finally(()=>{state.pending=null;});
      }
    }
    near(renderer,scene,camera,...rest);
  };
  return root;
}
