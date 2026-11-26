import {seatPlaces,seatColours} from './seat-places.js';

export function attachCitySeats(T,root,parts,cabinMaterial){
  // Keep the decoded mesh transform separate from each seat's authored origin.
  const pose=new T.Object3D(),mx=new T.Matrix4(),colour=new T.Color();
  return parts.map(part=>{
    const coloured=part.name==='SeatPad';
    const surface=coloured?cabinMaterial.clone():cabinMaterial;
    if(coloured){surface.vertexColors=false;surface.onBeforeCompile=cabinMaterial.onBeforeCompile;}
    const seats=new T.InstancedMesh(part.geometry,surface,seatPlaces.length);
    seats.name=coloured?'간선버스 · 좌석 색상':'간선버스 · 좌석 프레임';
    for(const [i,[x,y,z,angle,shade]] of seatPlaces.entries()){
      pose.position.set(x,y,z);pose.rotation.y=angle;pose.updateMatrix();
      seats.setMatrixAt(i,mx.copy(pose.matrix).multiply(part.matrixWorld));
      if(coloured)seats.setColorAt(i,colour.set(seatColours[shade]));
    }
    seats.computeBoundingBox();seats.computeBoundingSphere();root.add(seats);seats.updateWorldMatrix(true,false);
    return seats;
  });
}
