import {placeSingleDetail} from '../interior-architecture/single-detail.js';

export function placeStageMedia(K, x, z, rotation, positions) {
  const T = K.THREE;
  // Three boxes share the same eight instance transforms as the edited cabinets.
  const coordinates=[], normals=[], colors=[];
  for(const [width,base,top,finish] of [
    [1.60,0,.76,0x25252a], [1.60,4.44,5.27,0x222227], [1.12,5.27,6.2,0xe2e0da],
  ]) {
    const box=new T.BoxGeometry(width,top-base,width).toNonIndexed();
    box.translate(0,(base+top)/2,0);
    coordinates.push(...box.attributes.position.array);
    normals.push(...box.attributes.normal.array);
    const color=new T.Color(finish);
    for(let i=0;i<box.attributes.position.count;i++)colors.push(color.r,color.g,color.b);
  }
  const fallback = new T.BufferGeometry();
  fallback.setAttribute('position',new T.Float32BufferAttribute(coordinates,3));
  fallback.setAttribute('normal',new T.Float32BufferAttribute(normals,3));
  fallback.setAttribute('color',new T.Float32BufferAttribute(colors,3));
  const bounds = positions.map(([u,,v]) => new T.Box3(
    new T.Vector3(u-.81,0,v-.81), new T.Vector3(u+.81,6.2,v+.81)));
  const material = new T.MeshLambertMaterial({vertexColors:true});
  return placeSingleDetail(K,{
    name:'오픈 스테이지 · 미디어 기둥 외장', file:'../open-stage-media/cabinet.glb',
    at:[x,0,z], angle:rotation, translations:positions, viewBounds:bounds,
    fallback, fallbackMaterial:material, material,
    eyeHeight:1.6, floorTolerance:2.1, range:25, exitRange:29,
  });
}
