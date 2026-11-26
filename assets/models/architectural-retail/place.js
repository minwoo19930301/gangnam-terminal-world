import { loadFixtureScene } from '../onebailey/load.js';

export const loadArchitecture = file => loadFixtureScene(new URL(file,import.meta.url));

// Shop architecture mounts in the existing affine store frames. A transform
// from glTF quantization may already be on the source node or its ancestors.
export function fitArchitecture(K,library,name,point) {
  const T=K.THREE, origin=new T.Vector3(...point(0,0,0));
  const axis=(x,y,z)=>new T.Vector3(...point(x,y,z)).sub(origin);
  const root=new T.Group();
  root.name=name;
  root.matrix.makeBasis(axis(1,0,0),axis(0,1,0),axis(0,0,1)).setPosition(origin);
  root.matrixAutoUpdate=false;
  const material=new T.MeshLambertMaterial({vertexColors:true});
  library.getObjectByName(name).traverse(node=>{
    if(!node.isMesh)return;
    const mesh=new T.Mesh(node.geometry,material);
    mesh.matrix.copy(node.matrixWorld);
    mesh.matrixAutoUpdate=false;
    root.add(mesh);
  });
  K.addMesh(root);
}

// The terminal's existing relocated waiting lounge transforms kit faces in its
// own assembly context. Send the authored triangles through that same context.
const triangleCache=new WeakMap();
export function fitTerminalSeat(K,library,name,point) {
  const source=library.getObjectByName(name);
  let parts=triangleCache.get(source);
  if(!parts){
    parts=[];
    source.traverse(node=>{
      if(!node.isMesh)return;
      const g=node.geometry,v=g.getAttribute('position'),col=g.getAttribute('color');
      const verts=Array.from({length:v.count},(_,i)=>new K.THREE.Vector3().fromBufferAttribute(v,i).applyMatrix4(node.matrixWorld));
      const index=g.index,faces=[],color=new K.THREE.Color();
      const count=index?.count ?? v.count;
      const at=i=>index ? index.getX(i) : i;
      for(let i=0;i<count;i+=3){
        const a=at(i);
        color.setRGB(col.getX(a),col.getY(a),col.getZ(a));
        faces.push([a,at(i+1),at(i+2),color.getHex()]);
      }
      parts.push({verts,faces});
    });
    triangleCache.set(source,parts);
  }
  const edge=new K.THREE.Vector3(),normal=new K.THREE.Vector3();
  for(const part of parts){
    const vertices=part.verts.map(v=>new K.THREE.Vector3(...point(v.x,v.y,v.z)));
    for(const [a,b,c,colour] of part.faces){
      const pa=vertices[a],pb=vertices[b],pc=vertices[c];
      edge.subVectors(pb,pa);
      normal.subVectors(pc,pa).crossVectors(edge,normal).normalize();
      const last=pc.toArray();
      K.quad(colour,[pa.toArray(),pb.toArray(),last,last],normal.toArray());
    }
  }
}
