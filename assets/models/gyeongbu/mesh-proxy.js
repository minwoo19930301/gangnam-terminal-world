// Compact native display silhouette. Local positions are encoded in centimetres.
export function distantGeometry(T,source){
  const decode=text=>Uint8Array.from(atob(text),s=>s.charCodeAt(0));
  const data=decode(source.vertices),r=new DataView(data.buffer);
  const n=data.length/9,pos=new Float32Array(n*3),color=new Uint8Array(n*3);
  for(let i=0;i<n;i++){
    for(let k=0;k<3;k++)pos[3*i+k]=r.getInt16(9*i+2*k,true)/100;
    color.set(data.subarray(9*i+6,9*i+9),3*i);
  }
  const inds=new DataView(decode(source.triangles).buffer),ix=new Uint16Array(inds.byteLength/2);
  for(let i=0;i<ix.length;i++)ix[i]=inds.getUint16(2*i,true);
  const g=new T.BufferGeometry();
  g.setAttribute('position',new T.BufferAttribute(pos,3));g.setAttribute('color',new T.BufferAttribute(color,3,true));
  g.setIndex(new T.BufferAttribute(ix,1));g.computeVertexNormals();g.computeBoundingBox();g.computeBoundingSphere();
  return g;
}
