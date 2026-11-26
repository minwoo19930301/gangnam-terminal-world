import {mergeGeometries} from 'three/addons/utils/BufferGeometryUtils.js';
import {loadFixtureScene} from '../onebailey/load.js';
import {relief} from '../../../js/banpo_relief.js';

const simple = new Map();
let detailed = null, loading = null, retryAt = 0, metal;

function silhouette(T,type) {
  if (simple.has(type)) return simple.get(type);
  const count = type === 'TerminalTwo' ? 2 : 4;
  const shapes = [];
  function piece(x,y,z,w,h,d,color,angle=0) {
    const g = new T.BoxGeometry(w,h,d);
    g.rotateX(angle);
    g.translate(x,y,z);
    const tint = new T.Color(color);
    const rgb = new Float32Array(g.attributes.position.count*3);
    for (let i=0;i<rgb.length;i+=3) tint.toArray(rgb,i);
    g.setAttribute('color',new T.BufferAttribute(rgb,3));
    shapes.push(g);
  }
  for (let i=0;i<count;i++) {
    const x = (i-(count-1)/2)*.57;
    piece(x,.45,-.032,.509,.052,.43,0xacb4b7);
    piece(x,.68,.192,.509,.46,.032,0xacb4b7,.14);
  }
  for (const sign of [-1,1]) {
    const x=sign*(count*.285-.17);
    for (const end of [-1,1]) piece(x,.18,end*.107,.052,.38,.052,0x939c9e,-end*.53);
  }
  piece(0,.329,0,count*.57-.09,.063,.081,0x555e60);
  if (type==='WindowFour') piece(count*.285+.157,.483,0,.33,.027,.38,0xbe9974);
  const geometry = mergeGeometries(shapes);
  shapes.forEach(g=>g.dispose());
  geometry.name='먼 거리 · '+type;
  simple.set(type,geometry);
  return geometry;
}

function requestBenches(T) {
  if (loading || detailed || performance.now()<retryAt) return;
  loading = loadFixtureScene(new URL('./waiting-benches.glb',import.meta.url)).then(library=>{
    const result = new Map(), vertex = new T.Vector3();
    for (const name of ['TerminalTwo','TerminalFour','WindowFour']) {
      const part = library.getObjectByName(name), g = part.geometry;
      // Quantized glTF carries its metre conversion on the node.
      const pos = g.attributes.position, xyz = new Float32Array(pos.count*3);
      for (let i=0;i<pos.count;i++) vertex.fromBufferAttribute(pos,i).applyMatrix4(part.matrixWorld).toArray(xyz,i*3);
      g.setAttribute('position',new T.BufferAttribute(xyz,3));
      g.computeVertexNormals();
      g.computeBoundingSphere();
      g.name='승차홈 철제 연결의자 · '+name;
      result.set(name,g);
    }
    detailed=result;
  }).catch(()=>{retryAt=performance.now()+10000;}).finally(()=>{loading=null;});
}

export function placeWaitingBenches(K,type,placements) {
  const T = K.THREE, coarse = silhouette(T,type);
  metal ??= new T.MeshLambertMaterial({vertexColors:true});
  const rows = new T.InstancedMesh(coarse,metal,placements.length);
  rows.name='경부선 승차홈 · '+type;
  const pose=new T.Object3D(), centers=[];
  placements.forEach(([x,z,yaw],i)=>{
    pose.position.set(x,.014,z);
    pose.rotation.y=yaw;
    pose.updateMatrix();
    rows.setMatrixAt(i,pose.matrix);
    centers.push(new T.Vector3(x,relief(x,z)+.48,z));
  });
  rows.computeBoundingSphere();
  rows.boundingSphere.radius+=.3;
  // The renderer already culled this small public seating bay. Fetch the shared
  // detailed fittings only when an approaching passenger can actually use them.
  rows.onBeforeRender=(_renderer,_scene,camera)=>{
    const limit = detailed && rows.geometry===detailed.get(type) ? 20 : 16;
    const near = centers.some(p=>Math.abs(camera.position.y-p.y)<4 && camera.position.distanceToSquared(p)<limit*limit);
    if (near && !detailed) requestBenches(T);
    rows.geometry=near && detailed ? detailed.get(type) : coarse;
  };
  K.addMesh(rows);
}
