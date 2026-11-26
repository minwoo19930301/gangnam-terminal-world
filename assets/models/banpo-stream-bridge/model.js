import {bay} from './rail.js';
import {bridgeLayout,surfaceColors} from './layout.js';
const uv=[[0,0],[0,1],[1,1],[1,0]];
export function drawStreamBridge(K,roads){
  const layout=bridgeLayout(roads);
  if(!layout)return false;
  const mats={...surfaceColors,asphalt:'asphalt',sidewalk:'sidewalk'};
  K.withTerrainSurface(0,()=>{
    for(const {mat,points,normal} of layout.faces){
      const length=Math.hypot(points[1][0]-points[0][0],points[1][2]-points[0][2]);
      const width=Math.hypot(points[3][0]-points[0][0],points[3][2]-points[0][2]);
      K.quad(mats[mat],points,normal,[[0,0],[0,length/5],[width/5,length/5],[width/5,0]]);
    }
    for(const {points,kind} of layout.supports){
      const [p,q,r,s]=points;
      // The two triangles interpolate the same four heights as the rendered top.
      for(const tri of [[p,q,r],[p,r,s]]){
        const [a,b,c]=tri,ux=b[0]-a[0],uz=b[2]-a[2],vx=c[0]-a[0],vz=c[2]-a[2],det=ux*vz-uz*vx;
        const sy=((b[1]-a[1])*vz-(c[1]-a[1])*uz)/det,sz=(ux*(c[1]-a[1])-vx*(b[1]-a[1]))/det;
        K.withTerrainSurface((x,z)=>a[1]+sy*(x-a[0])+sz*(z-a[2]),()=>{
          const footprint=tri.map(([x,,z])=>[x,z]);
          K.phys.addSurface(footprint,0,{tag:kind==='road'?'stream-road':kind});
          K.phys.addCeiling(footprint,-.65-(kind==='sidewalk'?.105:0));
        });
      }
    }
    for(const [a,b] of layout.guards)K.phys.addWall(a[0],a[2],b[0],b[2],a[1],a[1]+1,.065,'rail',b[1]-a[1]);
    const v=new K.THREE.Vector3(),u=new K.THREE.Vector3(),w=new K.THREE.Vector3();
    for(const [a,b] of layout.panels){
      const dx=b[0]-a[0],dz=b[2]-a[2],dy=b[1]-a[1],len=Math.hypot(dx,dz);
      for(const [color,vertices,faces] of bay){
        const pts=vertices.map(([x,y,z])=>[a[0]+x*dx/2000-z*dz/(len*1000),a[1]+y/1000+x*dy/2000,a[2]+x*dz/2000+z*dx/(len*1000)]);
        for(const [i,j,k] of faces){
          v.fromArray(pts[i]);u.fromArray(pts[j]).sub(v);w.fromArray(pts[k]).sub(v);
          K.triangle(color,[pts[i],pts[j],pts[k]],u.cross(w).normalize().toArray(),uv);
        }
      }
    }
  });
  return true;
}
