import {boxSilhouette} from '../interior-architecture/box-silhouette.js';
import {placeSingleDetail} from '../interior-architecture/single-detail.js';

export function outbackFront(K,{P,R,lbox,lsign,lzone}){
  const T=K.THREE, angle=R+Math.PI, t=-26.5;
  const [doorX,doorZ]=P(193,t), [x,z]=P(191.72,t+.78), [lookX,lookZ]=P(195.68,t);
  const name='아웃백스테이크하우스 센트럴시티점';
  K.spawn({name,aliases:['아웃백','아웃백 센트럴시티점','OUTBACK STEAKHOUSE'],place:'centralcity',floor:'1M',
    mapDestination:true,poiIds:[12079247765],x,y:5,z,yaw:Math.atan2(x-lookX,z-lookZ)});
  lzone(193,-48,202,-5,{name,place:'centralcity',floor:'1M',sub:'파미에스테이션 중층',y0:5,y1:8.6,priority:12});

  lzone(158.85,-7.18,162.65,-4.82,{name:'파미에스테이션 엘리베이터 홀',place:'centralcity',floor:'2F',
    sub:'2층 식당가 · 중층 식당 연결',y0:4.88,y1:8.55,priority:9});

  // A ground-floor direction band is visible before the turn to the terminal;
  // the restaurant itself stays upstairs. Wrap the existing arcade pier.
  // The arrivals-side retail pier carries a dark band and a white tenant
  // mark in the visitor photograph. Put its two reading faces on the
  // existing pier, clear of both the level bypass and the half-flight.
  const pierS=170.8,pierT=-25.5;
  lbox(pierS,pierT,1.13,1.58,2.29,.49,0x202325,{solid:false});
  for(const [face,ds,dt,width] of [['S',.57,0,1.42],['E',0,.799,1.02],['N',-.57,0,1.42]]){
    lsign(['OUTBACK','M층  아웃백'],pierS+ds,pierT+dt,2.54,width,.39,face,
      {bg:null,fg:'#fff9ef',bold:true,pxPerM:200});
  }
  // The named mezzanine connects to the 2F lift landing over the existing
  // bridge. Show the destination where a shopper actually changes direction.
  lsign(['중층 식당','아웃백 · 딤딤섬'],190.04,22.15,5.62,1.68,.43,'E',
    {bg:'#292a28',fg:'#f8eedc',pxPerM:160});
  const frontMaterial=new T.MeshLambertMaterial({vertexColors:true});
  frontMaterial.onBeforeCompile=shader=>{
    shader.fragmentShader=shader.fragmentShader.replace('#include <emissivemap_fragment>',`
      #include <emissivemap_fragment>
      float lettering = smoothstep(.80,.94,vColor.r);
      totalEmissiveRadiance += .68 * lettering * vColor.rgb;
    `);
  };
  frontMaterial.customProgramCacheKey=()=>'outback-channel-letters';
  const [signX,signZ]=P(191.10,t);
  placeSingleDetail(K,{name:'아웃백 · 회랑 적색 간판',file:'../outback-central/gallery.glb',
    at:[signX,5.93,signZ],angle,material:frontMaterial,fallbackMaterial:frontMaterial,
    fallback:boxSilhouette(T,[[0,.01,-.075,3.36,.74,.15,0x2a2928]]),
    range:30,exitRange:34,floorTolerance:5.6,eyeHeight:.35,
    closeVisibleFrom:p=>p.y<9.2&&(p.x-signX)*Math.sin(R)+(p.z-signZ)*Math.cos(R)<0});
  const reception=boxSilhouette(T,[[0,.04,-2.68,5.37,.99,.69,0x48362b],[0,1.02,-2.67,5.52,.079,.81,0xa76c41],
    [0,2.69,-2.99,5.68,.18,2,0x242626],[-2.63,.46,-.63,2.58,.064,.4,0x242626],[-2.63,.46,-1.52,2.58,.064,.4,0x242626]]);
  placeSingleDetail(K,{name:'아웃백 · 접수 바와 대기 벤치',file:'../outback-central/reception.glb',
    at:[doorX,5,doorZ],angle,material:frontMaterial,fallbackMaterial:frontMaterial,fallback:reception,
    range:16,exitRange:19,eyeHeight:1.4,floorTolerance:2.2,
    closeVisibleFrom:p=>(p.x-doorX)*Math.sin(R)+(p.z-doorZ)*Math.cos(R)<6});
  // Match the new furnishings with fixed footprints without new visible surfaces.
  for(const [s,tt,w,d,h] of [[195.68,t,5.37,.69,1.099],[193.63,t+2.63,2.58,.40,.52],[194.52,t+2.63,2.58,.40,.52]]){
    lbox(s,tt,d,w,5,h,0x332b27,{skip:['top','bottom','n','s','e','w']});
  }
}
