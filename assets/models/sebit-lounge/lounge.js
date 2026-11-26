import {boxSilhouette} from '../interior-architecture/box-silhouette.js';
import {placeSingleDetail} from '../interior-architecture/single-detail.js';

let models;
function silhouettes(T){
  if(!models){
    const stone=0xc0b9af, white=0xf3f1e9;
    const terrace=[[0,0,.225,5.64,.16,.45,stone],[0,0,.675,5.64,.32,.45,stone],
      [0,0,1.79,5.64,.48,1.78,stone],[-.405,.48,1.56,1.00,.28,.79,0xb52543]];
    for(const x of [-1.44,1.45])terrace.push([x,.48,1.56,.88,.29,.81,white],[x,.74,1.94,.88,.30,.09,white]);
    for(const [x,z] of [[-.90,2.30],[1.78,2.35]])terrace.push([x,.48,z,.052,.70,.052,white],[x,1.16,z,.48,.048,.48,white]);
    const pot=[[0,0,0,1.11,.274,.67,white],[0,.27,0,.94,.32,.54,0x798552]];
    for(const [x,z,c] of [[-.29,.03,0xe7c5c4],[0,-.09,0xdecbb9],[.28,.06,0xd6b1b3]])
      pot.push([x,.59,z,.19,.29,.17,c]);
    const panel=[[0,1.06,0,.90,1.49,.008,0xa4bacb],[0,1.065,-.008,.90,.68,.008,0x779cae],[0,3.29,-.77,5.68,.052,.046,white]];
    models={projection:boxSilhouette(T,panel),terrace:boxSilhouette(T,terrace),pot:boxSilhouette(T,pot),
      mat:new T.MeshLambertMaterial({vertexColors:true}),sheet:new T.MeshLambertMaterial({vertexColors:true,side:T.DoubleSide})};
  }
  return models;
}

// P's first coordinate follows the park passage. The Blender furniture's X points
// back toward the gallery and its depth points toward the near wall.
const S=351.7,V=3.08;
const planters=[[-2.36,1.7],[2.36,1.7]];
export function buildSebitLounge(K,{P,R,F,C,ROT,sign}){
  const local=(x,d)=>P(S-x,V+d), angle=ROT+Math.PI/2;
  const rect=(x,d,w,h)=>[local(x-w/2,d-h/2),local(x+w/2,d-h/2),local(x+w/2,d+h/2),local(x-w/2,d+h/2)];
  const solid=(x,d,w,h,y,top)=>K.phys.addPolyWalls(rect(x,d,w,h),F+y,F+top,.025,'onebailey');
  for(const [near,far,y] of [[0,.45,.16],[.45,.9,.32],[.9,2.68,.48]])
    K.phys.addSurface(rect(0,(near+far)/2,5.64,far-near),F+y,{tag:'onebailey'});
  for(const x of [-1.44,1.45])solid(x,1.59,.88,.82,.48,1.06);
  solid(-.405,1.56,1.00,.79,.48,.76);
  for(const [x,d] of [[-.90,2.30],[1.78,2.35]])solid(x,d,.36,.36,.48,1.21);
  for(const [x,d] of planters)solid(x,d,.67,1.11,.48,.82);
  K.phys.addWall(...local(2.77,.17),...local(2.77,2.55),F+.16,F+1.26,.028,'onebailey');
  K.detail({name:'관광특구 라운지',floor:'B1',poly:R(345,-7,360,7),y0:F,y1:C},()=>{
    const f=silhouettes(K.THREE);
    function place(name,file,x,d,y,shape,range,exitRange,height,spin=0){
      const [px,pz]=local(x,d);
      placeSingleDetail(K,{name,file:'../sebit-lounge/'+file+'.glb',at:[px,F+y,pz],angle:angle+spin,
        fallback:shape,fallbackMaterial:f.mat,material:shape===f.terrace?f.mat:f.sheet,range,exitRange,eyeHeight:height,floorTolerance:2.5});
    }
    place('고터·세빛 라운지 · 계단식 휴게 좌석','terrace',0,0,0,f.terrace,18,22,1);
    for(const [x,d] of planters)place('고터·세빛 라운지 · 꽃이삭 화분','plumes',x,d,.48,f.pot,10,13,.55,Math.PI/2);
    place('고터·세빛 라운지 · 벽면 투사와 조명 레일','projection',S-347.6,-6.84-V,0,f.projection,15,18,1.9,Math.PI);
    // Photo shows the burgundy lettering looking back toward the gallery.
    sign(['Goteo-Sebit','Special Tourist Zone'],350,-6.82,F+2.04,3.10,.64,ROT+Math.PI/2,{bg:null,fg:'#b54957',pxPerM:120});
    sign('고터·세빛 관광특구',354,-6.82,F+2.03,2.45,.40,ROT+Math.PI/2,{bg:null,fg:'#b54957',pxPerM:120});
  });
}
