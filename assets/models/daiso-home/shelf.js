import {mergeGeometries} from 'three/addons/utils/BufferGeometryUtils.js';
import {boxSilhouette} from '../interior-architecture/box-silhouette.js';
import {placeSingleDetail} from '../interior-architecture/single-detail.js';

const names = {jars:'다이소 · 달항아리와 압화 액자 진열', wood:'다이소 · 나무 소반과 컵받침·카드꽂이'};
const silhouettes = new Map();
let paint;

function forms(T,key) {
  const width=key==='jars'?1.79:1.82;
  const parts=[[0,.014,.01,width,.211,.563,0xdedfd8],[0,.226,.255,width-.028,1.88,.036,0xc9d0c8]];
  const shelves=key==='jars'?[.22,.89]:[.22,.74,1.135];
  for(const elevation of shelves) parts.push([0,elevation,-.016,width,.032,.58,0xe7e7df]);
  for(const x of [-.85,.85]) parts.push([x,.124,.225,.032,1.98,.078,0xb5bcb5]);
  if(key==='wood') {
    parts.push([0,1.887,.10,1.59,.222,.026,0xd8c7a2]);
    for(let i=0;i<5;i++) {
      const x=(i-2)*.295;
      parts.push([x,1.487,-.03,.186,.172,.018,0xbca580],[x,1.663,-.039,.198,.083,.019,0xdeca9f]);
    }
    for(const x of [-.03,.223,.480,.724]) {
      parts.push([x,1.164,-.046,.213,.034,.476,0xe9e9df]);
      for(let i=0;i<6;i++) parts.push([x,1.187,-.235+i*.07,.175,.18,.024,i%2?0xb6966a:0xc7ab80]);
    }
    // Across the aisle, keep the stepped shoulder and narrow side handle.
    parts.push([-.645,.773,-.08,.33,.24,.20,0xc2a375],[-.408,.857,-.08,.145,.073,.20,0xba996d]);
    for(const x of [-.65,-.438,-.23]) parts.push([x,1.171,-.065,.173,.105,.385,0xb4976e]);
    for(const [x,z,count,tone] of [[.58,.768,3,0x765741],[.132,.768,2,0xb5956c],[-.52,.251,3,0x93724d],[-.024,.251,2,0xac906a]])
      for(let i=0;i<count;i++) parts.push([x,z+i*.084+.051,-.021,.35,.034,.253,tone],[x,z+i*.084,-.021,.19,.052,.132,tone]);
    return boxSilhouette(T,parts);
  }
  parts.push([.025,1.342,.088,1.65,.055,.273,0xc8a97d],[0,1.84,.11,1.59,.305,.025,0xece8da],[0,.27,.229,1.70,1.54,.012,0xb6c9c0]);
  for(const [x,w,h,tone] of [[.25,.31,.345,0xe1e0d5],[.622,.385,.437,0x505852]])
    parts.push([x,.25,.013,w,h,.035,tone],[x,.27,-.012,w-.037,h-.04,.012,0xeae7dc]);
  const shapes=[boxSilhouette(T,parts)];
  const rows=[
    [1.397,.086,[[-.649,.297,.137],[-.342,.318,.141],[-.04,.236,.118],[.260,.306,.145],[.605,.335,.154]]],
    [.918,-.092,[[-.680,.326,.146],[-.349,.370,.179],[-.014,.241,.119],[.318,.386,.181],[.668,.345,.161]]],
    [.25,-.010,[[-.68,.366,.176],[-.372,.285,.144],[-.187,.343,.162]]]
  ];
  for(const [base,depth,vases] of rows) {
    for(const [x,h,r] of vases) {
      const profile=[[.34,0],[.46,.075],[.92,.35],[1,.56],[.8,.80],[.42,.93],[.45,.99],[.36,1],[.32,.91]];
      const g=new T.LatheGeometry(profile.map(([rad,z])=>new T.Vector2(rad*r,z*h)),10);
      g.translate(x,base,depth);
      const colors=new Float32Array(3*g.attributes.position.count),tone=new T.Color(0xe1e1d6);
      for(let i=0;i<colors.length;i+=3) tone.toArray(colors,i);
      g.setAttribute('color',new T.BufferAttribute(colors,3));
      shapes.push(g);
    }
  }
  const result=mergeGeometries(shapes);
  shapes.forEach(geometry=>geometry.dispose());
  return result;
}

export function homeShelf(K,kind,at,angle) {
  if(!silhouettes.has(kind)) silhouettes.set(kind,forms(K.THREE,kind));
  paint??=new K.THREE.MeshLambertMaterial({vertexColors:true,side:K.THREE.DoubleSide});
  const dx=Math.sin(angle),dz=Math.cos(angle);
  return placeSingleDetail(K,{
    name:names[kind],file:'../daiso-home/'+kind+'.glb',at,angle,
    fallback:silhouettes.get(kind),fallbackMaterial:paint,material:paint,
    range:6.6,exitRange:8.2,eyeHeight:1.24,floorTolerance:2.2,
    closeVisibleFrom:p=>(p.x-at[0])*dx+(p.z-at[2])*dz<.055
  });
}
