import {loadArchitecture} from '../interior-architecture/model.js';

export async function loadPlazaPlanter(T,file){
  const [surface]=await loadArchitecture(file);
  const paint=new T.MeshLambertMaterial({vertexColors:true,map:surface.material.map});
  paint.defines={BANPO_RIGID:1,STREET_TREE:1};
  surface.material=paint;
  return [surface];
}
