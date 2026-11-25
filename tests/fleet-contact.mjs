// Cast real Jolt WASM rays against the triangles used by the browser vehicles.
// These four contact points drive the moving fleet's pitch and roll on the DEM.
import assert from 'node:assert/strict';
import initJolt from 'jolt-physics';
import { vehicles } from '../assets/models/fleet/meshes.js';
import { vehicleContacts } from '../js/fleet.js';

const Jolt = await initJolt();
const origin = new Jolt.RVec3(0,0,0), rotation = new Jolt.Quat(0,0,0,1), scale = new Jolt.Vec3(1,1,1);
const rayFrom = new Jolt.RVec3(0,0,0), upwards = new Jolt.Vec3(0,.5,0);
let count=0, maxError=0;
for (const [kind,{mm,faces}] of Object.entries(vehicles)) {
  const triangles = new Jolt.TriangleList();
  triangles.reserve(faces.length/4);
  const vertex = i => new Jolt.Vec3(mm[i*3]/1000,mm[i*3+1]/1000,mm[i*3+2]/1000);
  for (let i=0;i<faces.length;i+=4) {
    const a=vertex(faces[i]), b=vertex(faces[i+1]), c=vertex(faces[i+2]);
    const triangle = new Jolt.Triangle(a,b,c);
    triangles.push_back(triangle);
    for (const obj of [triangle,a,b,c]) Jolt.destroy(obj);
  }
  const settings=new Jolt.MeshShapeSettings(triangles), result=settings.Create();
  assert.ok(result.IsValid(),kind+' collision shape');
  const car=new Jolt.TransformedShape();
  car.mShape=result.Get();
  car.SetWorldTransform(origin,rotation,scale);
  const [halfTrack,halfWheelbase]=vehicleContacts(kind);
  for(const side of [-1,1]) for(const axle of [-1,1]) {
    rayFrom.Set(side*halfTrack,-.25,axle*halfWheelbase);
    const ray=new Jolt.RRayCast(rayFrom,upwards), hit=new Jolt.RayCastResult();
    hit.Reset();
    car.CastRay(ray,hit);
    const error=Math.abs(hit.mFraction*.5-.25);
    assert.ok(error<=.002,kind+' wheel misses Blender ground plane by '+error+' metres');
    maxError=Math.max(maxError,error); count++;
    Jolt.destroy(hit); Jolt.destroy(ray);
  }
  for(const obj of [car,result,settings,triangles]) Jolt.destroy(obj);
}
for(const obj of [rayFrom,upwards,origin,rotation,scale]) Jolt.destroy(obj);
console.log(count+' Jolt wheel contacts, maximum vertical error '+(maxError*1000).toFixed(2)+' mm');
