import {mergeGeometries} from 'three/addons/utils/BufferGeometryUtils.js';
import {loadFixtureScene} from '../onebailey/load.js';
import {relief} from '../../../js/banpo_relief.js';

const simple = new Map();
let full, pending, retryAt=0, colored, film;
const swatches={Ivory:0xf5edd8,Pink:0xee9bb5,Violet:0x995bb7,Sunflower:0xffc328};

function distant(T,type) {
  if(simple.has(type))return simple.get(type);
  const parts=[];
  function tint(g,c,x,y,z) {
    g.translate(x,y,z);
    const color=new T.Color(c), value=new Float32Array(g.attributes.position.count*3);
    for(let i=0;i<value.length;i+=3)color.toArray(value,i);
    g.setAttribute('color',new T.BufferAttribute(value,3));
    parts.push(g);
  }
  if(type==='WorkPapers'){
    tint(new T.BoxGeometry(.34,.035,.21),0xd3cbb5,0,.017,0);
  }else if(type==='BlackStack'){
    tint(new T.CylinderGeometry(.145,.10,.48,8),0x434844,0,.24,0);
  }else if(type==='Riser'){
    tint(new T.CylinderGeometry(.11,.157,.29,9),0x995447,0,.145,0);
  }else if(type==='Sleeve'){
    tint(new T.CylinderGeometry(.20,.09,.34,8,1,true),0xffffff,0,.70,0);
  }else{
    tint(new T.CylinderGeometry(.146,.112,.39,8),type==='Sunflower'?0x344884:0x363d39,0,.195,0);
    tint(new T.CylinderGeometry(.12,.047,.41,6),0x52804a,0,.575,0);
    for(let i=0;i<7;i++){
      const a=i*2.40,dist=i?.104:0;
      const g=new T.SphereGeometry(1,6,3);
      g.scale(.076,.049,.076);
      tint(g,swatches[type],dist*Math.cos(a),i?.815:.86,dist*Math.sin(a));
    }
  }
  const g=mergeGeometries(parts);
  parts.forEach(p=>p.dispose());
  g.name='먼 거리 · '+type;
  simple.set(type,g);
  return g;
}

function requestStock(T) {
  if(pending || full || performance.now()<retryAt)return;
  pending=loadFixtureScene(new URL('./cutflowers.glb',import.meta.url)).then(scene=>{
    const meshes=new Map(), vertex=new T.Vector3();
    scene.traverse(part=>{
      if(!part.isMesh)return;
      const g=part.geometry, pos=g.attributes.position, coords=new Float32Array(pos.count*3);
      for(let i=0;i<pos.count;i++)vertex.fromBufferAttribute(pos,i).applyMatrix4(part.matrixWorld).toArray(coords,3*i);
      g.setAttribute('position',new T.BufferAttribute(coords,3));
      g.computeVertexNormals();
      g.computeBoundingSphere();
      g.name='절화 도매 진열 · '+part.name;
      meshes.set(part.name,g);
    });
    full=meshes;
  }).catch(()=>{retryAt=performance.now()+10000;}).finally(()=>{pending=null;});
}

export function placeCutFlowers(K,lots) {
  const T=K.THREE;
  colored??=new T.MeshLambertMaterial({vertexColors:true,side:T.DoubleSide});
  film??=new T.MeshPhongMaterial({color:0xe8f1ed,transparent:true,opacity:.13,depthWrite:false,
    side:T.DoubleSide,specular:0xffffff,shininess:70});
  const center=new T.Vector3(), pose=new T.Object3D();
  const groups=new Map();
  function add(type,row) {
    if(!groups.has(type))groups.set(type,[]);
    groups.get(type).push(row);
  }
  for(const row of lots) {
    add(row.type,row);
    if(row.type==='Pink')add('Sleeve',row);
    if(row.riser)add('Riser',{...row,y:row.y-.29});
    center.add(new T.Vector3(row.x,row.y+relief(row.x,row.z)+.58,row.z));
  }
  center.divideScalar(lots.length);
  for(const [type,rows] of groups) {
    const coarse=distant(T,type);
    const mesh=new T.InstancedMesh(coarse,type==='Sleeve'?film:colored,rows.length);
    mesh.name='생화상가 · '+type;
    rows.forEach(({x,y,z,yaw,scale},i)=>{
      pose.position.set(x,y,z);pose.rotation.y=yaw;pose.scale.setScalar(type==='Riser'?1:scale);
      pose.updateMatrix();mesh.setMatrixAt(i,pose.matrix);
    });
    mesh.computeBoundingSphere();mesh.boundingSphere.radius+=.18;
    mesh.onBeforeRender=(_renderer,_scene,camera)=>{
      const limit=full&&mesh.geometry===full.get(type)?16:12;
      const near=Math.abs(camera.position.y-center.y)<3 && camera.position.distanceToSquared(center)<limit*limit;
      if(near&&!full)requestStock(T);
      mesh.geometry=near&&full?full.get(type):coarse;
    };
    K.addMesh(mesh);
  }
}
