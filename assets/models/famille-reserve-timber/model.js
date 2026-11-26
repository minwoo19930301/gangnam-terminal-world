import {loadArchitecture} from '../interior-architecture/model.js';
import {placeSingleDetail} from '../interior-architecture/single-detail.js';

// Local café deck coordinates (east, south, height). The Blender builder reads the same three placements.
const columns = [[-7.7,3.5,5.4],[-7.8,-7.25,5.05],[12.1,-2.5,4.34]];

export function placeReserveTimber(K,cx,cz,floor) {
  const T=K.THREE, positions=[], bounds=[];
  for(const [x,z,h] of columns) {
    const shaft=new T.CylinderGeometry(.23,.25,h-.78,8).toNonIndexed();
    shaft.translate(x,(h-.78)/2,z); positions.push(...shaft.attributes.position.array);
    const cap=new T.CylinderGeometry(1.05,.23,.78,4).toNonIndexed();
    cap.translate(x,h-.39,z); positions.push(...cap.attributes.position.array);
    // All fittings are overhead except the columns themselves.
    K.phys.addPolyWalls(Array.from({length:12},(_,i)=>[cx+x+.26*Math.cos(i*Math.PI/6),
      cz+z+.26*Math.sin(i*Math.PI/6)]),floor,floor+h,.01,'centralcity');
    bounds.push(new T.Box3(new T.Vector3(x-2.1,0,z-2.1),new T.Vector3(x+2.1,h+.13,z+2.1)));
  }
  const backbar=new T.BoxGeometry(.27,.98,4.8).toNonIndexed().translate(15.35,2.30,-.90);
  positions.push(...backbar.attributes.position.array);
  const caseRail=new T.BoxGeometry(.86,.11,2.18).toNonIndexed().translate(13.99,1.115,-2.03);
  positions.push(...caseRail.attributes.position.array);
  bounds.push(new T.Box3(new T.Vector3(13.54,1.06,-3.35),new T.Vector3(15.65,3.24,1.55)));
  const fallback=new T.BufferGeometry();
  fallback.setAttribute('position',new T.Float32BufferAttribute(positions,3));fallback.computeVertexNormals();
  async function load(file){
    const [surface]=await loadArchitecture(file);
    const material=new T.MeshLambertMaterial({vertexColors:true,map:surface.material.map,alphaTest:.42});
    material.onBeforeCompile=shader=>{
      shader.fragmentShader=shader.fragmentShader.replace('#include <emissivemap_fragment>',
        '#include <emissivemap_fragment>\n totalEmissiveRadiance += diffuseColor.rgb * (.28 * smoothstep(.69,.90,diffuseColor.r) * smoothstep(.50,.78,diffuseColor.g));');
    };
    surface.material=material;return [surface];
  }
  return placeSingleDetail(K,{
    name:'파미에파크R · 목재 기둥과 구형 조명',file:'../famille-reserve-timber/coffee-trees.glb',
    at:[cx,floor,cz],angle:0,fallback,viewBounds:bounds,
    fallbackMaterial:new T.MeshLambertMaterial({color:0x854e35}),
    loadSurface:load,
    eyeHeight:1.60,floorTolerance:1.85,range:21,exitRange:24,
  });
}
