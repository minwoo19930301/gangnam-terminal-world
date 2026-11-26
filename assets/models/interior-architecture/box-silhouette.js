import {mergeGeometries} from 'three/addons/utils/BufferGeometryUtils.js';

// One vertex-coloured, low-detail mesh. Each box uses a bottom elevation.
export function boxSilhouette(T, parts) {
  const geometries=parts.map(([x,y,z,width,height,depth,tone,slope=0])=>{
    const geo=new T.BoxGeometry(width,height,depth);
    if(slope)geo.rotateX(slope);
    geo.translate(x,y+height/2,z);
    const rgb=new Float32Array(geo.attributes.position.count*3),color=new T.Color(tone);
    for(let i=0;i<rgb.length;i+=3)color.toArray(rgb,i);
    geo.setAttribute('color',new T.BufferAttribute(rgb,3));
    return geo;
  });
  const mesh=mergeGeometries(geometries);
  geometries.forEach(geo=>geo.dispose());
  return mesh;
}
