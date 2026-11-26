import {loadArchitecture} from '../interior-architecture/model.js';
import {placeSingleDetail} from '../interior-architecture/single-detail.js';
import {boxSilhouette} from '../interior-architecture/box-silhouette.js';
import {relief} from '../../../js/banpo_relief.js';

const food={
  fried:{name:'한입새우튀김 포장',w:.228,d:.163,paper:0xb98f69},
  sushi:{name:'새우롤 포장',w:.246,d:.154,paper:0x353530},
  maki:{name:'김가루 롤 포장',w:.246,d:.154,paper:0x393b31},
  salad:{name:'팔각 양장피 포장',w:.226,d:.207,paper:0x373732},
};

// The six cases already have walkable aisles around their individual footprints.
export const dishes=['maki','fried','sushi','salad','fried','sushi'];

function boxProxy(T,kind){
  const {w,d,paper}=food[kind],outline=[];
  if(kind==='salad'){
    for(let i=0;i<8;i++){
      const a=(i+.5)*Math.PI/4;outline.push([w*.5*Math.cos(a),d*.5*Math.sin(a)]);
    }
  }else for(const [i,[x,z]] of [[w/2-.015,d/2-.015],[-w/2+.015,d/2-.015],[-w/2+.015,-d/2+.015],[w/2-.015,-d/2+.015]].entries()){
    for(let j=0;j<4;j++){
      const a=(i+j/3)*Math.PI/2;outline.push([x+.015*Math.cos(a),z+.015*Math.sin(a)]);
    }
  }
  const verts=[],uv=[],rgb=[],idx=[],body=new T.Color(paper),lip=new T.Color(kind==='fried'?0xd5b699:0x696952);
  function vertex(x,y,z,mapped,colour){
    verts.push(x,y,z);
    uv.push(...(mapped?[.5+x/(w*1.06),.5-z/(d*1.06)]:[.010,.010]));
    rgb.push(colour.r,colour.g,colour.b);
    return verts.length/3-1;
  }
  const white=new T.Color(0xffffff);
  const rings=[];
  for(const [scale,y,mapped,colour] of [[.87,.001,false,body],[1,.030,false,body],[1,.032,false,lip],
    [1,.032,true,white],[.89,.057,true,white]]){
    rings.push(outline.map(([x,z])=>vertex(x*scale,y,z*scale,mapped,colour)));
  }
  for(const j of [0,1,3])for(let i=0;i<outline.length;i++){
    const next=(i+1)%outline.length,a=rings[j][i],b=rings[j][next],c=rings[j+1][i],d=rings[j+1][next];
    idx.push(a,c,b,b,c,d);
  }
  const center=vertex(0,.06,0,true,white);
  for(let i=0;i<outline.length;i++)idx.push(rings[4][(i+1)%outline.length],rings[4][i],center);
  const geom=new T.BufferGeometry();
  geom.setAttribute('position',new T.Float32BufferAttribute(verts,3));geom.setAttribute('uv',new T.Float32BufferAttribute(uv,2));
  geom.setAttribute('color',new T.Float32BufferAttribute(rgb,3));geom.setIndex(idx);geom.computeVertexNormals();
  return geom;
}

// Long cold-case light strips reflected by the sloping PET shoulders. The
// shared transparent material uses the viewing direction and original Blender
// facet normals. It adds one instanced pass only for the packages at hand.
function coldCaseLid(T){
  return new T.ShaderMaterial({
    transparent:true,depthWrite:false,
    vertexShader:`
      varying vec3 wPosition;
      varying vec3 wNormal;
      void main(){
        mat4 placement=modelMatrix*instanceMatrix;
        vec4 point=placement*vec4(position,1.);
        wPosition=point.xyz;
        wNormal=normalize(mat3(placement)*normal);
        gl_Position=projectionMatrix*viewMatrix*point;
      }`,
    fragmentShader:`
      varying vec3 wPosition;
      varying vec3 wNormal;
      void main(){
        vec3 normal=normalize(wNormal);
        vec3 eye=normalize(cameraPosition-wPosition);
        vec3 reflected=reflect(-eye,normal);
        // Parallel lights run along the longer axis of the supermarket.
        vec2 dir=vec2(.390546,.920583);
        float crossA=dot(reflected.xz,dir);
        float strip=1.-smoothstep(.015,.065,abs(crossA-.24));
        float rim=pow(1.-max(dot(eye,normal),0.),3.);
        float overhead=smoothstep(.03,.55,reflected.y);
        gl_FragColor=vec4(.97,.955,.88,.024+.27*strip*overhead+.14*rim);
        #include <tonemapping_fragment>
        #include <colorspace_fragment>
      }`,
  });
}

const cache=new Map();
function appearance(T,kind){
  if(cache.has(kind))return cache.get(kind);
  const state={
    proxy:boxProxy(T,kind),paint:new T.MeshBasicMaterial({color:0xcfb593,vertexColors:true,side:T.DoubleSide}),
    texturePending:false,textureRetry:0,source:null,lid:null,clear:coldCaseLid(T),modelPending:false,modelRetry:0,
  };
  state.thumbnail=()=>{
    if(state.paint.map||state.texturePending||performance.now()<state.textureRetry)return;
    state.texturePending=true;
    new T.TextureLoader().load(new URL('./'+kind+'-top.webp',import.meta.url).href,tex=>{
      tex.colorSpace=T.SRGBColorSpace;tex.anisotropy=4;
      state.paint.map=tex;state.paint.color.set(0xffffff);state.paint.needsUpdate=true;
    },undefined,()=>{state.texturePending=false;state.textureRetry=performance.now()+10000;});
  };
  state.high=()=>{
    if(state.source||state.modelPending||performance.now()<state.modelRetry)return;
    state.modelPending=true;
    loadArchitecture('../kims-deli/'+kind+'.glb').then(parts=>{
      const source=parts.find(part=>part.name===kind),lid=parts.find(part=>part.name==='Lid_'+kind);
      if(!source?.material.map||!lid)throw Error('Incomplete deli package '+kind);
      source.updateWorldMatrix(true,false);lid.updateWorldMatrix(true,false);
      state.source=source;state.lid=lid;
    }).catch(()=>{state.modelRetry=performance.now()+10000;}).finally(()=>{state.modelPending=false;});
  };
  cache.set(kind,state);
  return state;
}

function islandPlacements(index){
  const stock=[];
  for(let row=0;row<4;row++)for(let col=0;col<8;col++){
    if((col+3*row+index)%17===0)continue;
    const x=(col-3.5)*.328+Math.sin(index*4+row+col)*.014;
    const h=row>=2?1.095:.860;
    const z=[-.410,-.174,.285,.492][row]+Math.cos(col*7+row)*.008;
    const angle=.085*Math.sin(col*7+row+index);
    stock.push([x,h,z,angle]);
    if((index+row*3+col)%7===0)stock.push([x,h+.069,z,angle]);
  }
  return stock;
}
function chilledPlacements(){
  const stock=[];
  for(let shelf=0;shelf<3;shelf++){
    for(let i=0;i<6;i++){
      stock.push([(i-2.5)*.304,.738+shelf*.242,-.170+shelf*.107,.025*Math.sin(i*3)]);
      if((i+shelf)%3!==0)stock.push([(i-2.5)*.304,.738+shelf*.242,.084+shelf*.080,.038*Math.cos(i)]);
    }
  }
  return stock;
}

function portions(K,kind,at,angle,display,stock){
  const T=K.THREE,state=appearance(T,kind),root=new T.Group();
  root.name='킴스클럽 델리 · '+food[kind].name+' · '+display;
  root.position.set(...at);root.rotation.y=angle;
  const poses=stock.map(([x,h,z,yaw])=>{
    const matrix=new T.Matrix4().makeRotationY(yaw);matrix.setPosition(x,h,z);
    return {matrix,center:new T.Vector3(x,h+.037,z)};
  });
  const far=new T.InstancedMesh(state.proxy,state.paint,poses.length);
  const near=new T.InstancedMesh(state.proxy,state.paint,poses.length);
  const lid=new T.InstancedMesh(state.proxy,state.clear,poses.length);
  far.name='킴스클럽 델리 · '+food[kind].name;far.userData.nativePlacementInstances=true;
  near.name=far.name+' · 가까운 식품 표면';lid.name=far.name+' · 투명 덮개';lid.count=0;
  poses.forEach(({matrix},i)=>far.setMatrixAt(i,matrix));near.count=0;
  const bounds=new T.Sphere(new T.Vector3(0,1,0),1.62);
  far.boundingSphere=bounds;near.boundingSphere=bounds;lid.boundingSphere=bounds;root.add(far,near,lid);
  const view=new T.Matrix4(),frustum=new T.Frustum(),inverse=new T.Matrix4(),model=new T.Matrix4();
  const eye=new T.Vector3(),sphere=new T.Sphere(new T.Vector3(),.169);
  const ground=relief(at[0],at[2]);
  let frame=-1,lastSource=null;
  const previousView=new T.Matrix4();
  function update(renderer,_scene,camera){
    if(frame===renderer.info.render.frame)return;
    frame=renderer.info.render.frame;
    model.copy(root.matrixWorld);model.elements[13]+=ground;
    view.multiplyMatrices(camera.projectionMatrix,camera.matrixWorldInverse).multiply(model);
    const changed=!previousView.equals(view)||lastSource!==state.source;
    // Retry failed visible resources when the visitor stands still or turns back.
    if(!changed&&state.source&&state.paint.map)return;
    lastSource=state.source;previousView.copy(view);
    frustum.setFromProjectionMatrix(view);
    inverse.copy(model).invert();eye.copy(camera.position).applyMatrix4(inverse);
    far.count=0;near.count=0;lid.count=0;
    if(state.source){near.geometry=state.source.geometry;near.material=state.source.material;lid.geometry=state.lid.geometry;}
    let needHigh=false;
    for(const pack of poses){
      sphere.center.copy(pack.center);
      if(!frustum.intersectsSphere(sphere))continue;
      const distance=eye.distanceToSquared(pack.center);
      if(distance<2.55**2)needHigh=true;
      if(state.source&&distance<2.55**2){
        model.multiplyMatrices(pack.matrix,state.source.matrixWorld);near.setMatrixAt(near.count++,model);
        model.multiplyMatrices(pack.matrix,state.lid.matrixWorld);lid.setMatrixAt(lid.count++,model);
      }else far.setMatrixAt(far.count++,pack.matrix);
    }
    if(needHigh)state.high();if(far.count)state.thumbnail();
    far.instanceMatrix.needsUpdate=true;near.instanceMatrix.needsUpdate=true;lid.instanceMatrix.needsUpdate=true;
  }
  far.onBeforeRender=update;near.onBeforeRender=update;return K.addMesh(root);
}

export function registerDeli(F,y,v,cart){
  const {K,P,Q,angle}=F,T=K.THREE;
  const paint=new T.MeshLambertMaterial({vertexColors:true,side:T.DoubleSide});
  const body=boxSilhouette(T,[[0,.11,0,2.81,.68,1.13,0x9c7856],[0,.786,0,2.90,.073,1.265,0xb58a66],
    [0,.855,.38,2.84,.24,.44,0xa17c57]]);
  const wall=boxSilhouette(T,[[0,.05,0,8.38,1.58,.86,0x9b805e],[0,1.82,.19,8.32,1.33,.18,0xad967a]]);
  const origin=P(0,0),c=Math.cos(angle),s=Math.sin(angle);
  function visibleFrom(u,v,width,depth,top){
    return (wx,eye,wz)=>{
      const dx=wx-origin[0],dz=wz-origin[1],px=c*dx-s*dz,pz=s*dx+c*dz;
      if(eye<y-.13||Math.abs(px)>F.L/2||pz<0||pz>F.W)return false;
      if(eye<=y+3.65)return true;
      if(eye>2.35)return false;
      // A passenger on the two cart walks can see into B1 through their slot
      // in both the lowered ceiling and the structural slab at street level.
      function through(level){
        const t=(eye-level)/(eye-top),cx=px+(u-px)*t,cz=pz+(v-pz)*t;
        return Math.abs(cx-cart.u)<=cart.run/2+width*t/2 && Math.abs(cz-cart.v)<=1.52+depth*t/2;
      }
      return through(y+3.65)&&(eye<=0||through(0));
    };
  }
  const shared={angle,material:paint,fallbackMaterial:paint,floorTolerance:2.7};
  dishes.forEach((kind,i)=>{
    const u=i*5,[x,z]=P(u,v);
    K.detail({name:'킴스클럽 델리 · '+(i+1)+'번 매대',poly:Q(u-1.46,v-.67,u+1.46,v+.67),floor:'B1',y0:y,y1:y+1.46,visibleFrom:visibleFrom(u,v,2.92,1.34,y+1.07)},()=>{
      placeSingleDetail(K,{...shared,at:[x,y,z],name:'킴스클럽 델리 · 나무 포장식품 매대',file:'../kims-deli/island.glb',
        fallback:body,range:12,exitRange:15,eyeHeight:1.01});
      portions(K,kind,[x,y,z],angle,(i+1)+'번 매대',islandPlacements(i));
    });
  });
  const wallU=-6,wallV=F.W-.60,[wx,wz]=P(wallU,wallV);
  for(const [i,kind] of ['sushi','maki','salad','sushi'].entries()){
    const u=wallU+(i-1.5)*2.06,[x,z]=P(u,wallV);
    K.detail({name:'델리 냉장 진열 · '+(i+1),poly:Q(u-1.02,wallV-.39,u+1.02,wallV+.41),floor:'B1',y0:y+.70,y1:y+1.53,visibleFrom:visibleFrom(u,wallV,2.04,.83,y+1.18)},()=>{
      portions(K,kind,[x,y,z],angle,'냉장 '+(i+1)+'번 선반',chilledPlacements());
    });
  }
  K.detail({name:'델리 by 애슐리 · 후레시 스시',poly:Q(wallU-4.23,wallV-.48,wallU+4.23,wallV+.48),floor:'B1',y0:y,y1:y+3.32,visibleFrom:visibleFrom(wallU,wallV,8.46,.96,y+2.16)},()=>{
    placeSingleDetail(K,{...shared,at:[wx,y,wz],name:'킴스클럽 델리 · 후레시 스시 벽장과 간판',file:'../kims-deli/wall.glb',
      fallback:wall,range:18,exitRange:22,eyeHeight:1.65});
  });
}
