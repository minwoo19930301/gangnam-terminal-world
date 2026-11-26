import {mergeGeometries} from 'three/addons/utils/BufferGeometryUtils.js';
import {boxSilhouette} from '../interior-architecture/box-silhouette.js';
import {placeSingleDetail} from '../interior-architecture/single-detail.js';

const openings=[[-5.78,-1.72],[-.97,.52],[1.20,2.66],[3.36,4.81]];
const islands=[[-3.42,.29,2.59],[-.57,0,2.36],[2.72,-.12,2.96]];
const stools=[[-.57,-1.43],[1.20,-1.42],[3.08,-1.40],[4.53,-1.40],
  [3.52,1.78],[3.12,2.88],[3.83,6],[-3.85,2.60],[-2.90,2.09]];
const tables=[[.36,-.92],[2.35,-.91],[4.63,2.58],[4.48,5.53],[-3.54,1.92]];
const piers=[[-5.93,-5.78],[-1.72,-.97],[.52,1.20],[2.66,3.36],[4.81,5.93]];
let distant;

function silhouettes(T) {
  if(distant)return distant;
  const shellParts=[
    [0,0,7.185,11.88,3.43,.15,0x21465b],[0,1.74,7.086,8.52,.43,.07,0x173846],
    [0,3.44,3.59,11.89,.09,7.37,0xeeeae2],[0,.029,3.54,11.86,.003,7.27,0x967355],
    [0,3.0,.02,11.86,.51,.25,0x99542f],
  ];
  for (const [lo,hi] of piers)shellParts.push([(lo+hi)/2,0,.02,hi-lo,3.42,.25,0x99542f]);
  // At a distance preserve the curved tops of the openings, with open space underneath.
  for (const [lo,hi] of openings)for(let j=0;j<10;j++){
    const w=(hi-lo)/10,r=(hi-lo)/2,x=lo+(j+.5)*w;
    const bottom=2.34+Math.min(.66,r)*Math.sqrt(Math.max(0,1-((x-(lo+hi)/2)/r)**2));
    shellParts.push([x,bottom,.02,w,3.04-bottom,.25,0x99542f]);
  }
  for(const x of [5.90]){
    for(const d of [.13,2.35,4.57,6.79,7.15])shellParts.push([x,.09,d,.09,3.19,.06,0x252c38]);
    for(const y of [.1,1.04,2.55,3.27])shellParts.push([x,y,3.64,.09,.047,7.1,0x252c38]);
  }
  for(const [lo,hi] of [[.12,3.87],[5.53,7.18]])shellParts.push([-5.90,0,(lo+hi)/2,.15,3.44,hi-lo,0x99542f]);
  shellParts.push([-5.90,2.85,4.70,.15,.59,1.66,0x99542f]);
  for(const d of [1.42,4.94]){
    for(const sd of [-1,1])shellParts.push([17.53,.43,d+sd*1.51,.24,1.25,.19,0xddd6c8]);
    shellParts.push([17.54,3.38,d,.27,.09,3.52,0xddd6c8]);
  }
  function tinted(geometry,tone) {
    const rgb=new Float32Array(geometry.attributes.position.count*3),color=new T.Color(tone);
    for(let i=0;i<rgb.length;i+=3)color.toArray(rgb,i);
    geometry.setAttribute('color',new T.BufferAttribute(rgb,3));return geometry;
  }
  function combine(geometries) {
    const merged=mergeGeometries(geometries);geometries.forEach(g=>g.dispose());return merged;
  }
  const bar=[boxSilhouette(T,[[0,.03,1.78,9.94,.89,.65,0x173846],[0,.914,1.76,10.06,.071,.73,0xeeeae2],
    [-3.59,1.01,.28,.98,.40,.44,0xe3e3db],[-.76,1.01,.03,.98,.40,.44,0xe3e3db],
    [3.63,1.17,-.18,.36,.27,.07,0x777b7d]])];
  for(const [x,d,w] of islands){
    bar.push(tinted(new T.CylinderGeometry(1,1,.92,16).scale(.65,1,.65).translate(x-(w-1.3)/2,.55,d),0xdfdcd2),
      tinted(new T.CylinderGeometry(1,1,.92,16).scale(.65,1,.65).translate(x+(w-1.3)/2,.55,d),0xdfdcd2),
      boxSilhouette(T,[[x,.09,d,w-1.30,.92,1.30,0xdfdcd2]]));
  }
  const benches=[];
  for(const x of [-.16,2.03,4.22])benches.push([x,.423,-.32,2.09,.070,.48,0x244779]);
  for(const d of [1.42,3.63,5.92])benches.push([5.54,.423,d,.48,.070,2.05,0x186568]);
  const seat=[boxSilhouette(T,benches)];
  for(const [i,[x,d]] of stools.entries())seat.push(tinted(new T.CylinderGeometry(.219,.271,.464,8).translate(x,.246,d),i%3===1?0x244779:0x186568));
  for (const [x,d] of tables) seat.push(tinted(new T.CylinderGeometry(.34,.34,.025,12).translate(x,.405,d),0x182e41));
  const pastry=boxSilhouette(T,[[0,.008,0,1.34,.06,.50,0xeeeae2],[0,.545,0,1.34,.041,.50,0x947759],
    [-.645,.05,0,.032,.50,.47,0x947759],[.645,.05,0,.032,.50,.47,0x947759],
    [-.17,.081,-.02,.83,.08,.28,0xc4a170],[.29,.60,0,.5,.13,.21,0xb39675]]);
  const latte=combine([tinted(new T.CylinderGeometry(.052,.044,.168,9).translate(-.114,.088,.026),0xdac69e),
    tinted(new T.CylinderGeometry(.052,.044,.168,9).translate(.114,.088,.020),0xa2ac80),
    boxSilhouette(T,[[0,.008,-.13,.198,.039,.058,0xb98d58]])]);
  distant={arches:boxSilhouette(T,shellParts),bar:combine(bar),seats:combine(seat),pastry,latte,
    paint:new T.MeshLambertMaterial({vertexColors:true,side:T.DoubleSide})};
  for(const mesh of [distant.arches,distant.bar,distant.seats,distant.pastry,distant.latte]){
    // Match the native model's customer-right convention and preserve outward face winding.
    mesh.scale(-1,1,1);
    const index=mesh.index.array;
    for(let i=0;i<index.length;i+=3){const a=index[i];index[i]=index[i+1];index[i+1]=a;}
  }
  return distant;
}

export function halffCoffee(K,{P,RECT,lbox,lwall,lsign,lzone,R},s0,t0,s1,t1,y) {
  const mid=(t0+t1)/2,front=s1-1.34,angle=R+Math.PI,depth=7.26;
  const position=(x,d)=>P(front-d,mid+x);
  const [fx,fz]=position(0,0),sin=Math.sin(angle),cos=Math.cos(angle);
  const project=(x,z)=>[-(x-fx)*cos+(z-fz)*sin,(x-fx)*sin+(z-fz)*cos];
  const poly=RECT(front-depth,mid-6,front+1.66,mid+6);
  // Keep the original outer cell partitions and the continuous gallery around the smaller photographed room.
  lwall(s0,t0,s1,t0,y,y+3.84,{mat:'ccFamBuffBrick',thick:.13});
  const arcade=[1.42,4.94];
  lwall(s0,t1,s1,t1,y,y+3.84,{mat:'ccFamBuffBrick',thick:.13,
    openings:arcade.map(d=>({at:front-d-s0,w:2.83,y0:y+.55,y1:y+3.05}))});
  lwall(s0,t0,s0,t1,y,y+3.84,{mat:0xe3dcd1,thick:.13});
  K.hpoly(0x70604f,RECT(front-depth,mid-5.92,front+.11,mid+5.92),y+.025,true);
  // Original floor and the true building beyond the two shop windows stay visible.
  K.material('halffClearPane',new K.THREE.MeshLambertMaterial({color:0xb5cbd0,transparent:true,opacity:.082,depthWrite:false,side:K.THREE.DoubleSide}));
  const glass=(x,d,h,width,dd,hh)=>lbox(front-d,mid+x,dd,width,y+h,hh,'halffClearPane',{solid:false});
  function contact(x,d,w,dd,h) {
    lbox(front-d,mid+x,dd,w,y,h,0,{skip:['top','bottom','n','s','e','w']});
  }
  for(const d of arcade){
    // Preserve the original closed perimeter with clear glazing through the photographed arcade.
    const middle=front-d;
    lwall(middle-1.42,t1,middle+1.42,t1,y+.55,y+3.05,{mat:'halffClearPane',thick:.022});
    for(let i=0;i<18;i++){
      const lo=Math.PI*i/18,hi=Math.PI*(i+1)/18;
      const sa=middle-1.415*Math.cos(lo),sb=middle-1.415*Math.cos(hi);
      const ha=Math.min(3.05,1.64+1.42*Math.sin(lo)),hb=Math.min(3.05,1.64+1.42*Math.sin(hi));
      const aa=P(sa,t1-.065),bb=P(sb,t1-.065);
      K.quad('ccFamBuffBrick',[[aa[0],y+ha,aa[1]],[bb[0],y+hb,bb[1]],[bb[0],y+3.05,bb[1]],[aa[0],y+3.05,aa[1]]],
        [-Math.cos(R),0,Math.sin(R)],[[(sa-s0)/1.04,ha/.52],[(sb-s0)/1.04,hb/.52],[(sb-s0)/1.04,3.05/.52],[(sa-s0)/1.04,3.05/.52]]);
    }
  }
  const invisible={top:false,bottom:false,side:false};
  function ovalContact(x,d,w,dd,h) {
    const r=dd/2,side=Math.max(0,w/2-r),outline=[];
    for(const [shift,a] of [[side,-Math.PI/2],[-side,Math.PI/2]])
      for(let k=0;k<=10;k++)outline.push(position(x+shift+r*Math.cos(a+k*Math.PI/10),d+r*Math.sin(a+k*Math.PI/10)));
    K.prism(outline,y,y+h,invisible);
  }
  for(const [a,b] of piers)contact((a+b)/2,.025,b-a,.25,3.42);
  contact(0,7.185,11.87,.15,3.43);
  for(const [lo,hi] of [[.12,3.87],[5.53,7.18]])contact(-5.90,(lo+hi)/2,.15,hi-lo,3.44);
  for(const x of [5.90]){
    contact(x,3.61,.07,7.15,3.30);glass(x,3.61,.15,.018,7.02,3.11);
  }
  for(const [x,d,w] of islands)ovalContact(x,4.98+d,w,1.30,1.012);
  contact(0,6.75,10.02,.7,.983);
  for(const x of [-.16,2.03,4.22])contact(x,-.32,2.09,.46,.493);
  for(const d of [1.42,3.63,5.92])contact(5.54,d,.46,2.05,.493);
  for(const [x,d] of stools)ovalContact(x,d,.53,.53,.481);
  for(const [x,d] of tables)ovalContact(x,d,.68,.68,.417);
  // A narrow cabinet on the island has a glass front and sides; cups and wrapped bars are opaque meshes.
  const pastryX=2.61,pastryD=4.74,deck=1.011;
  glass(pastryX,pastryD-.235,deck+.09,1.26,.009,.46);
  for (const dx of [-.638,.638])glass(pastryX+dx,pastryD,deck+.09,.009,.46,.46);
  const roomSight=(x,eye,z)=>{
    if(eye<y-.25||eye>y+3.62)return false;
    const [cx,d]=project(x,z);
    if(d>depth+.1) return false;
    if(d<.19)return Math.abs(cx)<24&&d>-21;
    return cx>=-6.0 ? cx<17.5 : (cx> -13 && d>3.55 && d<5.86);
  };
  lzone(front-depth,mid-5.95,front+1.65,mid+5.95,{name:'하프커피',place:'famille',floor:'2F',
    sub:'파미에 FP212 · 버터크림라떼',y0:y,y1:y+3.6,priority:13});
  K.detail({name:'하프커피 FP212',floor:'2F',poly,y0:y,y1:y+3.51,visibleFrom:roomSight},()=>{
    const f=silhouettes(K.THREE);
    // A close object can be in the camera frustum yet fully hidden by one of the rust piers.
    // Intersect each object's footprint rays with the two opaque partitions. The right-hand window is clear.
    function unobstructed(cx,cd,tx,td) {
      if(cd<-.1 && td>-.1){
        const frontX=cx+(tx-cx)*(-.1-cd)/(td-cd);
        if(Math.abs(frontX)<5.95 && !openings.some(([lo,hi])=>frontX>lo-.035 && frontX<hi+.035))return false;
      }
      if(cx < -5.91 && tx > -5.91){
        const sideD=cd+(td-cd)*(-5.91-cx)/(tx-cx);
        if(sideD>0 && sideD<depth && (sideD<3.83 || sideD>5.57))return false;
      }
      return true;
    }
    function place(label,file,x,d,h,range,exitRange,eye) {
      const [px,pz]=position(x,d);
      const footprint=file==='bar' ? islands.flatMap(([ix,id,iw])=>[[ix-iw*.48,d+id],[ix+iw*.48,d+id]])
        : file==='seats' ? [...tables,...stools]
        : file==='pastry' ? [[x-.655,d-.237],[x+.655,d-.237],[x-.655,d+.234],[x+.655,d+.234]]
        : [[x-.195,d],[x+.195,d]];
      placeSingleDetail(K,{name:'하프커피 · '+label,file:'../halff/'+file+'.glb',at:[px,y+h,pz],angle,
        fallback:f[file],fallbackMaterial:f.paint,material:f.paint,range,exitRange,eyeHeight:eye,floorTolerance:2.6,
        closeVisibleFrom:camera=>{
          const [cx,cd]=project(camera.x,camera.z);
          return cd<depth+.11 && (file==='arches' || footprint.some(([tx,td])=>unobstructed(cx,cd,tx,td)));
        }});
    }
    place('갈색 아치와 청색 커피 벽','arches',0,0,0,20,23,1.5);
    place('흰 곡면 커피바와 추출 장비','bar',0,4.98,0,13.4,16,1.25);
    place('각진 스툴과 창가 금속 벤치','seats',0,0,0,14.5,17.5,.73);
    place('버터바와 약과 쿠키 진열장','pastry',pastryX,pastryD,deck,8.2,10,.26);
    for(const [x,d] of [[-3.54,1.92],[4.63,2.58],[.36,-.92]])
      place('버터크림라떼와 바통 휘낭시에','latte',x,d,.417,4.2,5.5,.13);
    lsign(['버터바','BUTTER BAR'],front-pastryD+.249,mid+pastryX,y+deck+.107,.32,.096,'S',
      {fg:'#393a3b',bg:'#f1ece1',pxPerM:550});
    lsign('c o f f e e',front-7.057,mid,y+2.368,.78,.105,'S',{bg:null,fg:'#b4b0a0',pxPerM:300});
    lsign('halff coffee',front-.047,mid+5.38,y+2.05,.79,.16,'S',
      {bg:null,fg:'#dfc48d',pxPerM:230});
  });
}
