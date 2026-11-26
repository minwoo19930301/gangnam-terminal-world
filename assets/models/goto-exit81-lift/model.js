import {boxSilhouette} from '../interior-architecture/box-silhouette.js';
import {placeSingleDetail} from '../interior-architecture/single-detail.js';
import {relief} from '../../../js/banpo_relief.js';

const name='고투몰 8-1 · 보도 승강기';

function cabinLight(material,origin,glazed){
  material.defines={BANPO_RIGID:1};
  material.customProgramCacheKey=()=>glazed?'exit81-glass':'exit81-metal';
  material.onBeforeCompile=shader=>{
    shader.uniforms.exit81Origin={value:origin};
    shader.vertexShader='varying vec3 liftPoint;\nuniform vec3 exit81Origin;\n'+shader.vertexShader.replace(
      '#include <project_vertex>','#include <project_vertex>\nliftPoint=(modelMatrix*vec4(transformed,1.)).xyz-exit81Origin;');
    const bounce=glazed?
      'totalEmissiveRadiance+=vec3(.24,.25,.21)*bounce;':
      'totalEmissiveRadiance+=diffuseColor.rgb*(.04+1.15*bounce);';
    shader.fragmentShader='varying vec3 liftPoint;\n'+shader.fragmentShader.replace('#include <emissivemap_fragment>',
      '#include <emissivemap_fragment>\nfloat bounce=exp(-.85*distance(liftPoint,vec3(0.,2.22,0.)))* (1.-smoothstep(2.32,2.85,liftPoint.y));\n'+bounce);
  };
}

export function placeExit81Lift(K,x,z){
  const T=K.THREE, half=1.25,ground=relief(x,z);
  const footprint=[[-half,-half],[half,-half],[half,half],[-half,half]].map(([a,b])=>[x+a,z+b]);
  K.slab(footprint,0,{mat:0x8e8f8c,thick:.06,ceil:false,edge:false});
  const positions=[],indices=[];
  function pane(ax,az,bx,bz,low,high,wallLow){
    if(wallLow!==undefined)K.phys.addWall(x+ax,z+az,x+bx,z+bz,wallLow,3.94,.06,'gotomall');
    const i=positions.length/3;
    positions.push(ax,low,az,bx,low,bz,bx,high,bz,ax,high,az);
    indices.push(i,i+1,i+2,i,i+2,i+3);
  }
  pane(-half,-half,half,-half,.40,3.90,0);
  for(const side of [-1,1]){
    pane(side*half,-half,side*half,half,.40,3.90,0);
    pane(side*.65,half,side*half,half,.40,3.90,0);
    pane(side*.01,half,side*.64,half,.025,2.165);
  }
  pane(-.65,half,.65,half,2.30,3.90,2.25);
  const geometry=new T.BufferGeometry();
  geometry.setAttribute('position',new T.Float32BufferAttribute(positions,3));
  geometry.setIndex(indices);geometry.computeVertexNormals();
  const origin=new T.Vector3(x,ground,z);
  const glass=new T.MeshLambertMaterial({color:0x9ab8a9,side:T.DoubleSide,transparent:true,opacity:.33,depthWrite:false});
  cabinLight(glass,origin,true);
  const shell=new T.Mesh(geometry,glass);
  shell.position.copy(origin);shell.userData.terrainApplied=true;
  K.addMesh(shell);
  K.detail({name,floor:'1F',poly:footprint,y0:0,y1:4,visualOnly:true,silhouetteDistance:90},kit=>{
    const proxy=[[0,3.88,0,2.57,.12,2.57,0x828c86],[0,2.21,0,2.12,.13,2.12,0xa5aaa0],
      [0,0,-1.25,2.5,.40,.10,0x80786c]];
    for(const side of [-1,1]){
      proxy.push([side*half,0,0,.10,.40,2.5,0x80786c]);
      for(const end of [-1,1])proxy.push([side*half,.38,end*half,.085,3.52,.085,0xa8b1ae]);
    }
    const paint=new T.MeshLambertMaterial({vertexColors:true});
    cabinLight(paint,origin,false);
    placeSingleDetail(kit,{name,file:'../goto-exit81-lift/lift.glb',at:[x,0,z],angle:0,rigidGround:ground,
      fallback:boxSilhouette(T,proxy),fallbackMaterial:paint,material:paint,range:24,exitRange:31,
      eyeHeight:1.55,floorTolerance:4.1,viewBounds:[new T.Box3(new T.Vector3(-1.32,0,-1.32),new T.Vector3(1.32,4,1.32))]});
  });
  return footprint;
}
