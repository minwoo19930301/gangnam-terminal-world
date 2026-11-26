import * as THREE from 'three';
import {relief} from '../../../js/banpo_relief.js';
import {loadArchitecture} from '../interior-architecture/model.js';
import {placeSingleDetail} from '../interior-architecture/single-detail.js';
import {boxSilhouette} from '../interior-architecture/box-silhouette.js';
import {parts,furniture} from './layout.js';
import {placeRow} from './rows.js';

const settings={
  sushi:[15,18,1.30],teppan:[13,16,1.43],tea:[12,15,1.45],chair:[6.2,7.9,.51],teaChair:[6.2,7.9,.48],
  setting:[3.8,5.1,.06],sushiDish:[3.8,5.1,.04],teppanDish:[3.6,5.1,.03],teaSet:[4.5,5.9,.09],
  floor:[14,17,.08],room:[16,18,1.83],entry:[11,14,1.55],
};
const shapes={
  sushi:[[0,.15,.09,6.42,.58,.51,0x967554],[0,.725,0,6.67,.101,.86,0xe4c79c],[0,.03,1.66,6.66,3.06,.102,0xe5dacf]],
  teppan:[[0,.02,.15,3.42,.72,1.85,0x524538],[0,.74,.09,3.67,.06,1.92,0x313236],[0,.792,.38,2.26,.012,1.21,0xa7a5a0],
    [0,.03,1.50,3.68,2.78,.10,0x99856d],[0,2.30,.26,3.66,.85,1.79,0xad835b]],
  tea:[[0,.04,.02,3.57,.69,.60,0x62452e],[0,.726,0,3.85,.086,.78,0xbc8d56],[0,.03,1.34,3.84,2.86,.079,0xe2d5bd],
    [0,.06,1.09,3.79,.72,.43,0x79573b],[.15,1.55,1.12,2.90,.034,.29,0x62452e],[.15,2.09,1.12,2.48,.034,.29,0x62452e]],
  chair:[[0,.406,0,.48,.083,.44,0xe1d6c3],[0,.47,-.19,.45,.32,.078,0xd8cbb7],
    ...[-.19,.19].flatMap(x=>[-.17,.17].map(z=>[x,.025,z,.038,.40,.038,0xb6926a]))],
  teaChair:[[0,.40,0,.41,.08,.39,0x494841],[0,.73,-.21,.45,.065,.032,0xb8986d],
    ...[-.187,.187].flatMap(x=>[-.174,.174].map(d=>[x,.015,d,.031,d<0?.75:.405,.034,0x927147]))],
  setting:[[-.013,.001,0,.394,.003,.245,0xaa9b88],[-.038,.009,0,.17,.027,.11,0xece5d5]],
  sushiDish:[[0,0,0,.394,.012,.185,0xeee9de],[-.068,.014,0,.22,.025,.040,0xd09c79]],
  teppanDish:[[0,.002,0,.255,.014,.18,0x53534c],[0,.017,0,.17,.021,.061,0x82503b]],
  teaSet:[[-.12,.002,.006,.49,.012,.276,0x493b32],[-.21,.016,.031,.14,.13,.14,0x8ca99a],[.20,.003,0,.112,.055,.112,0x74879c]],
  floor:[[0,.020,-2.71,10.40,.006,6.96,0x514d49],[0,.020,3.48,10.40,.006,5.42,0xb7ab9d]],
  room:[[0,3.315,0,10.40,.075,12.38,0xe1d6c8],[-5.15,.02,0,.09,3.30,12.38,0x886e55]],
  entry:[[-2.26,.05,-.17,2.25,2.74,.13,0xad855d],[2.05,.04,-.16,1.82,2.75,.10,0x654b36],[-.19,2.82,-.11,6.38,.24,.14,0xac8c66]],
};
const bakedParts=new Set(['sushi','tea','teppan','room','entry']);
const images=new Map();
function texture(file){
  if(!images.has(file))images.set(file,new THREE.TextureLoader().loadAsync(new URL('./'+file,import.meta.url).href)
    .then(tex=>{const light=file.endsWith('-light.webp');tex.colorSpace=light?THREE.NoColorSpace:THREE.SRGBColorSpace;tex.channel=light?1:0;tex.flipY=false;tex.anisotropy=4;return tex;})
    .catch(error=>{images.delete(file);throw error;}));
  return images.get(file);
}
const materials=new Map();
async function loadSurface(file){
  const key=file.split('/').at(-1).slice(0,-4),stone=key==='floor';
  const lit=bakedParts.has(key);
  const [surfaces,map,lightMap]=await Promise.all([loadArchitecture(file),texture(stone?'stone.webp':'finishes.webp'),
    lit?texture(key+'-light.webp'):null]);
  if(!materials.has(key)){
    const glossy=['teppan','teaSet','sushiDish','teppanDish'].includes(key);
    const mat=new THREE.MeshPhongMaterial({map,lightMap,lightMapIntensity:0,vertexColors:!stone&&!lit,side:THREE.DoubleSide,
      shininess:glossy?39:15,specular:glossy?0x373229:0x181715});
    if(!stone){
      // Only the atlas cell for the lamp diffuser glows. The other swatches retain indoor lighting.
      mat.onBeforeCompile=shader=>{
        if(lit)shader.fragmentShader=shader.fragmentShader.replace('#include <map_fragment>',
          '#include <map_fragment>\ndiffuseColor.rgb *= 2.0*texture2D(lightMap,vLightMapUv).rgb;');
        shader.fragmentShader=shader.fragmentShader.replace('#include <emissivemap_fragment>',
          '#include <emissivemap_fragment>\nif (floor(vMapUv.x*8.0)==7.0 && floor(vMapUv.y*7.0)==2.0) totalEmissiveRadiance+=vec3(.53,.34,.17);');
      };
      mat.customProgramCacheKey=()=>lit?'tamayura-cycles-v1':'tamayura-diffuser-v1';
    }
    materials.set(key,mat);
  }
  surfaces[0].material=materials.get(key);return surfaces;
}

export function registerTamayura(K,{point,rotation,y}){
  const T=K.THREE,origin=point(0,0),c=Math.cos(rotation),s=Math.sin(rotation);
  const farPaint=new T.MeshLambertMaterial({vertexColors:true,side:T.DoubleSide});
  const fallbacks={};
  function corner(p,x,d){
    return point(p.u+Math.cos(p.turn)*x+Math.sin(p.turn)*d,p.v-Math.sin(p.turn)*x+Math.cos(p.turn)*d);
  }
  function poly(p,x0,d0,x1,d1){
    return [[x0,d0],[x1,d0],[x1,d1],[x0,d1]].map(([x,d])=>corner(p,x,d));
  }
  function wall(p,x0,d0,x1,d1,height){
    K.phys.addPolyWalls(poly(p,x0,d0,x1,d1),y,y+height,.026,'jwmarriott');
  }
  const batches=new Map();
  for(const p of furniture){
    const key=p.key,[label,width,depth,height]=parts[key];
    if(key==='sushi'){wall(p,-3.32,-.41,3.32,.41,.825);wall(p,-3.31,1.60,3.31,1.73,3.09);}
    if(key==='teppan'){wall(p,-1.81,-.89,1.81,1.05,.804);wall(p,-1.83,1.43,1.83,1.58,2.85);}
    if(key==='tea'){wall(p,-1.91,-.38,1.91,.38,.81);wall(p,-1.88,.86,1.88,1.39,2.89);}
    if(key==='chair'||key==='teaChair')wall(p,-width*.37,-depth*.37,width*.37,depth*.37,.72);
    if(key==='entry')wall(p,1.22,-.54,1.47,-.26,.51);
    const extent={sushi:[-.45,1.74],teppan:[-.91,1.59],tea:[-.40,1.39],entry:[-.58,.45]}[key]??[-depth/2,depth/2];
    const name='타마유라 · '+label,at=point(p.u,p.v);
    const own=(wx,eye,wz)=>{
      if(eye<y-.09||eye>y+4.8)return false;
      const dx=wx-origin[0],dz=wz-origin[1],u=dx*c-dz*s,v=dx*s+dz*c;
      if(key==='entry' && v<=43.16)return u>6&&u<38&&v>29;
      if(u<16.93||u>27.62||v>55.57||v<30)return false;
      if(key==='entry'||v>=43)return true;
      // The opaque entrance only admits views through the opening already in the hotel shell.
      const t=(43-v)/Math.max(.01,p.v-v),cross=u+(p.u-u)*t;
      const radius=(Math.abs(Math.cos(p.turn))*width+Math.abs(Math.sin(p.turn))*depth)*.5*t;
      return cross+radius>=19.36&&cross-radius<=21.64;
    };
    const [range,exitRange,eyeHeight]=settings[key];
    if(key==='chair'||key==='teaChair'||key==='setting'){
      const id=p.bar+'/'+key;
      if(!batches.has(id))batches.set(id,[]);
      batches.get(id).push({p,own});
      continue;
    }
    K.detail({name,floor:'2F',poly:poly(p,-width/2,extent[0],width/2,extent[1]),y0:y+p.h,y1:y+p.h+height,
      visibleFrom:own},()=>{
      const fallback=fallbacks[key]??=boxSilhouette(T,shapes[key]);
      // Three can finish the previous draw after an onBeforeRender LOD swap. Both layouts
      // must expose the UV channel consumed by the baked-light shader during that frame.
      if(bakedParts.has(key)&&!fallback.getAttribute('uv1'))fallback.setAttribute('uv1',fallback.getAttribute('uv'));
      const viewBounds=[new T.Box3(new T.Vector3(-width/2,-.01,extent[0]),new T.Vector3(width/2,height,extent[1]))];
      placeSingleDetail(K,{name,file:'../tamayura/'+key+'.glb',loadSurface,at:[at[0],y+p.h,at[1]],
        angle:rotation+p.turn,fallback,fallbackMaterial:farPaint,range,exitRange,eyeHeight,
        viewBounds,floorTolerance:4.15,closeVisibleFrom:pos=>own(pos.x,pos.y-relief(pos.x,pos.z),pos.z)});
    });
  }
  for(const entries of batches.values()){
    const rows=entries.map(e=>e.p),key=rows[0].key,[label,w,d,h]=parts[key];
    const us=rows.map(p=>p.u),vs=rows.map(p=>p.v);
    const u0=Math.min(...us)-w/2,u1=Math.max(...us)+w/2,v0=Math.min(...vs)-d/2,v1=Math.max(...vs)+d/2;
    const center=[(u0+u1)/2,(v0+v1)/2],height=rows[0].h;
    const name='타마유라 · '+label,[range,exitRange,eyeHeight]=settings[key];
    K.detail({name:name+' · '+rows[0].bar,floor:'2F',poly:[point(u0,v0),point(u1,v0),point(u1,v1),point(u0,v1)],
      y0:y+height,y1:y+height+h,visibleFrom:(x,eye,z)=>entries.some(e=>e.own(x,eye,z))},()=>{
      const proxy=fallbacks[key]??=boxSilhouette(T,shapes[key]);
      placeRow(K,{key,name,rows,center,point,rotation,y,proxy,paint:farPaint,range,exitRange,eyeHeight,
        radius:Math.hypot(w/2,d/2,Math.max(eyeHeight,h-eyeHeight)),visible:entries.map(e=>e.own),loadSurface});
    });
  }
}
