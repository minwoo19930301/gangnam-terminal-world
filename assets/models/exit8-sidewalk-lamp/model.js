import {parts} from './mesh.js';

const uv = [[0,0],[1,0],[0,1]];
export const name = '터미널 8번 출구 · 보도와 차도 등기구';

export function placeExit8Lamp(K,x,y,z,angle) {
  const sin=Math.sin(angle),cos=Math.cos(angle);
  K.withTerrainAnchor(x,z,()=>{
    const origin=new K.THREE.Vector3(), edge=new K.THREE.Vector3(), across=new K.THREE.Vector3();
    for(const [color,lit,points,faces] of parts) {
      const mat=lit?{tex:'emit',color}:color;
      const vertices=points.map(([a,b,c])=>[x+(a*cos+c*sin)/1000,y+b/1000,z+(c*cos-a*sin)/1000]);
      for(const face of faces) {
        const [a,b,c]=face.map(i=>vertices[i]);
        origin.fromArray(a);
        edge.fromArray(b).sub(origin);
        across.fromArray(c).sub(origin);
        K.triangle(mat,[a,b,c],edge.cross(across).normalize().toArray(),uv);
      }
    }
  });
  // Preserve the shared street pole's original unrotated eight-sided collision.
  const footprint=Array.from({length:8},(_,i)=>[x+.11*Math.cos(i*Math.PI/4),z+.11*Math.sin(i*Math.PI/4)]);
  K.phys.addPolyWalls(footprint,y,y+7.5,.02,'streets');
  const origin=new K.THREE.Group();
  origin.name=name;origin.position.set(x,y,z);origin.rotation.y=angle;
  K.addMesh(origin);
}
