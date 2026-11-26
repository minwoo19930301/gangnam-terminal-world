import {loadFixtureScene} from '../onebailey/load.js';
import {seoulClock} from '../../../js/daylight.js';
import {relief} from '../../../js/banpo_relief.js';
import {makeCanvas,FONT} from '../../../js/textures.js';

let library,loading,retryAt=0;
function requestPortal(){
  if(library||loading||performance.now()<retryAt)return;
  loading=loadFixtureScene(new URL('./departure-portal.glb',import.meta.url)).then(scene=>{
    library={casework:scene.getObjectByName('Housing'),posters:scene.getObjectByName('Lightboxes')};
  }).catch(()=>{retryAt=performance.now()+10000;}).finally(()=>{loading=null;});
}

// The historical display photo supplies the eight sample times and bay numbers.
// The public operator guide supplies the representative destination for each bay.
const departures=[
  ['14:10','구미','Gumi','10'],['14:20','동대구','Dongdaegu','7·8'],
  ['14:20','동대구','Dongdaegu','7·8'],['14:25','진주','Jinju','5'],
  ['14:25','진주','Jinju','5'],['14:25','울산','Ulsan','6'],
  ['14:25','김해','Gimhae','6'],['14:30','포항','Pohang','9'],
];

function departureFace(T,clock){
  const width=330,height=1100,canvas=makeCanvas(width,height),ctx=canvas.getContext('2d');
  const texture=new T.CanvasTexture(canvas);
  texture.colorSpace=T.SRGBColorSpace;texture.anisotropy=4;
  const band=(y,h,color)=>{ctx.fillStyle=color;ctx.fillRect(0,y,width,h);};
  function type(str,x,y,size,color='#fff',weight=600,align='left'){
    ctx.font=weight+' '+size+'px '+FONT;ctx.fillStyle=color;ctx.textAlign=align;
    ctx.textBaseline='middle';ctx.fillText(str,x,y);
  }
  band(0,height,'#253441');
  const header=ctx.createLinearGradient(0,0,0,68);
  header.addColorStop(0,'#7b8284');header.addColorStop(1,'#474f53');band(0,69,header);
  type('승차홈',width/2,29,33,'#fff',750,'center');type('Platform',width/2,53,13,'#e3e7e5',500,'center');
  for(let i=0;i<6;i++){
    ctx.fillStyle=i%2?'#8d9393':'#979b99';ctx.fillRect(55*i,72,54,42);
    type(String(i+5),27.5+i*55,93,26,'#fff',700,'center');
  }
  band(116,135,'#182228');
  type('서울 시각    SEOUL',width/2,136,16,'#d6e2e6',600,'center');
  band(250,39,'#344956');
  type('출발 안내 · 예시',12,270,19,'#fff',650);
  type('승차홈',width-11,270,16,'#d6e4ea',550,'right');
  for(let i=0;i<departures.length;i++){
    const [time,destination,latin,bays]=departures[i],y=290+i*101;
    band(y,100,i===0?'#91aebd':i%2?'#4f6779':'#587282');
    ctx.fillStyle=i===0?'#6d919f':'#3a5061';ctx.fillRect(253,y,77,100);
    type(time,11,y+32,35,i===0?'#142a37':'#fff',750);
    type(destination,121,y+32,22,i===0?'#172f3d':'#f7faf8',650);
    type(latin,12,y+66,17,i===0?'#2a4655':'#d4e3e9',500);
    type(bays,291,y+45,31,'#f9f6da',700,'center');
    type('홈',291,y+77,14,'#e7e9dc',500,'center');
  }
  const material=new T.MeshBasicMaterial({map:texture,toneMapped:false});
  const mesh=new T.Mesh(new T.PlaneGeometry(.657,2.201),material);
  mesh.name='승차홈 5~10 · 출발안내 화면';mesh.position.set(0,1.4115,.148);
  function refresh(){
    const next=clock();
    if(mesh.userData.clock===next)return;
    band(155,92,'#182228');type(next,width/2,201,76,'#eaf7ff',750,'center');
    mesh.userData.clock=next;texture.needsUpdate=true;
  }
  refresh();
  mesh.onBeforeRender=refresh;
  return mesh;
}

export function placeDeparturePortal(K,x,z,angle){
  const T=K.THREE,group=new T.Group();
  group.name='경부선 · 5~10번 승차홈 전광판';
  group.position.set(x,0,z);group.rotation.y=angle;
  const floor=relief(x,z);
  // All three blocks remain legible in a long aisle view, even while the near housing downloads.
  const proxyMaterial=new T.MeshLambertMaterial({color:0x26292b});
  const proxy=new T.Group();
  for(const [cx,width] of [[0,.92],[-3.50,1.21],[3.52,1.29]]){
    const mesh=new T.Mesh(new T.BoxGeometry(width,2.97,.25),proxyMaterial);
    mesh.position.set(cx,1.485,cx===0?0:.70);proxy.add(mesh);
  }
  const face=departureFace(T,K.displayClock??(()=>seoulClock(Date.now())));
  const full=new T.Group();
  full.visible=false;
  group.add(proxy,full,face);
  function select(_renderer,_scene,camera){
    const p=camera.position;
    const limit=full.visible?19:15;
    const near=p.y>floor-.35&&p.y<floor+3.8&&(p.x-x)**2+(p.z-z)**2<limit*limit;
    if(near&&!library)requestPortal();
    if(near&&library&&!full.children.length){
      const parts=[[library.casework,new T.MeshLambertMaterial({vertexColors:true,side:T.DoubleSide})],
        [library.posters,new T.MeshBasicMaterial({vertexColors:true,side:T.DoubleSide,toneMapped:false})]];
      for(const [source,material] of parts){
        const mesh=new T.Mesh(source.geometry,material);mesh.matrixAutoUpdate=false;
        mesh.matrix.copy(source.matrixWorld);mesh.onBeforeRender=select;full.add(mesh);
      }
    }
    full.visible=near&&full.children.length>0;proxy.visible=!full.visible;
  }
  for(const part of proxy.children)part.onBeforeRender=select;
  K.addMesh(group);
}
