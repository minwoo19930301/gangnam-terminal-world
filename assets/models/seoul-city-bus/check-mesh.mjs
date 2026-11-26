// The four tyre centres are the manufacturer's front and rear track widths.
// Cast against the same compressed body a pedestrian sees, after its glTF decode transform.
import assert from 'node:assert/strict';
import * as T from 'three';
import JoltWasm from 'jolt-physics';
import {loadArchitecture} from '../interior-architecture/model.js';
const [body]=await loadArchitecture('../seoul-city-bus/body.glb');
body.updateWorldMatrix(true,false);const geom=body.geometry,positions=geom.attributes.position,ix=geom.index;
const J=await JoltWasm(),tris=new J.TriangleList(),v=new T.Vector3();
const vert=i=>{
  v.fromBufferAttribute(positions,i).applyMatrix4(body.matrixWorld);return new J.Vec3(v.x,v.y,v.z);
};
for(let i=0;i<ix.count;i+=3){
  const a=vert(ix.getX(i)),b=vert(ix.getX(i+1)),c=vert(ix.getX(i+2));
  const bounds=[a,b,c];if(bounds.some(p=>p.GetY()<.23)){
    const triangle=new J.Triangle(a,b,c);tris.push_back(triangle);J.destroy(triangle);
  }
  for(const p of bounds)J.destroy(p);
}
const settings=new J.MeshShapeSettings(tris),result=settings.Create();
assert.ok(result.IsValid());const t=new J.TransformedShape();t.mShape=result.Get();
const origin=new J.RVec3(0,0,0),q=new J.Quat(0,0,0,1),scale=new J.Vec3(1,1,1);
t.SetWorldTransform(origin,q,scale);
const distances=[];
for(const axle of [-2.7,2.7])for(const s of [-1,1]){
  const start=new J.RVec3(s*(axle>0?1.040:.9275),-.20,axle),up=new J.Vec3(0,.50,0);
  const ray=new J.RRayCast(start,up),hit=new J.RayCastResult();hit.Reset();t.CastRay(ray,hit);
  const offset=hit.mFraction*.5-.20;
  assert.ok(Math.abs(offset)<.0021,JSON.stringify({s,axle,offset}));distances.push(+offset.toFixed(6));
  for(const p of [hit,ray,up,start])J.destroy(p);
}
for(const p of [t,result,settings,tris,origin,q,scale])J.destroy(p);
console.log(JSON.stringify({triangles:ix.count/3,tyrePlaneOffsetsMetres:distances}));
