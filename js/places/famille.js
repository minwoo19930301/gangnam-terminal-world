import {galleryShopfronts} from '../../assets/models/famille-shopfront/model.js';
import {FA,FB,upperPoint as FP,diningSpan} from './_familleUpperPlan.js';
import {placeCharDining} from '../../assets/models/char-dining/place.js';
import { loadArchitecture, placeArchitecture } from '../../assets/models/interior-architecture/model.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { MeshoptDecoder } from 'three/addons/libs/meshopt_decoder.module.js';
import { placeKervanCase, placeKervanLamp, placeKervanMeal, placeKervanWindow } from '../../assets/models/kervan/model.js';
import { gardenSurface, gardenStation } from './_gardenGrade.js';
import { relief } from '../banpo_relief.js';

// Local route tests and the browser share the two meshes exported from gallery.blend.
const fixtureURL = new URL('../../assets/models/famille/gallery.glb', import.meta.url);
const fixtureBytes = fixtureURL.protocol === 'file:'
  ? await (await import('node:fs/promises')).readFile(fixtureURL)
  : new Uint8Array(await (await fetch(fixtureURL)).arrayBuffer());
const galleryFixtures = (await new GLTFLoader().setMeshoptDecoder(MeshoptDecoder).parseAsync(
  fixtureBytes.buffer.slice(fixtureBytes.byteOffset, fixtureBytes.byteOffset + fixtureBytes.byteLength), ''
)).scene;

// Round 20. The user's 2026-11-07 photographs override the older GPS/plan fit.
// The indoor restaurant street meets parking 2F. The garden is above parking 3F.
const galleryRib = await loadArchitecture('gallery-rib.glb');

export const meta = {
  id: 'famille', name: '파미에스테이션 동관', claims: [414891732],
  claimRoads: [],
  additionalEntrances: [{"x":37.18,"z":142.98,"y":0,"w":2.7,"nx":0.933,"nz":-0.361,"other":null},{"x":74.47,"z":148.36,"y":12.6,"w":3.4,"nx":-0.956,"nz":0.295,"other":null},{"x":73.44,"z":147.19,"y":9,"w":5,"nx":-0.896,"nz":0.445,"other":null},{"x":261.26,"z":86.28,"y":12.6,"w":10,"nx":0.896,"nz":-0.445,"other":null}],
  sources: [
    'refs/user_walk/20261107/manifest.json', 'refs/user_walk/20261107/places.json',
    '.codex-jobs/evidence/up20_famille.json',
    '.codex-jobs/evidence/centralcity_r19_snapshot.js', 'data/research/famille.json',
  ],
};
const FR = (a,b,c,d) => [FP(a,b),FP(c,b),FP(c,d),FP(a,d)];
const FROT = Math.atan2(FB,FA);

export function build(K) {
  familleMaterials(K);
  buildDeck(K);
  buildHall(K);
  buildUpper(K);
}

function familleMaterials(K){
  K.texture('famille-buff',512,512,(g,w,h)=>{
    g.fillStyle='#e6dfd2';g.fillRect(0,0,w,h);
    const colors=['#bf946b','#c09c78','#b78e68','#c7a27e','#c39b76'];
    for(let r=0;r<16;r++)for(let c=-1;c<7;c++){
      g.fillStyle=colors[((r*7+c)%5+5)%5];g.fillRect(c*86+(r%2)*43+2,r*32+2,82,28);
    }
  },[1.56,1.04]);
  K.texture('famille-plank',512,512,(g,w,h)=>{
    g.fillStyle='#aba9a3';g.fillRect(0,0,w,h);
    for(let r=0;r<16;r++)for(let c=-1;c<5;c++){
      const v=192+(r*17+c*7+100)%17;g.fillStyle=`rgb(${v},${v},${v-4})`;
      g.fillRect(c*128+(r%4)*32+1,r*32+1,126,30);
    }
  },[2.4,2.4]);
  K.texture('famille-gingham',64,64,(g,w,h)=>{
    g.fillStyle='#f4e3d5';g.fillRect(0,0,w,h);
    g.fillStyle='#e7b6ac';g.fillRect(0,0,w/2,h);g.fillRect(0,0,w,h/2);
    g.fillStyle='#d99e97';g.fillRect(0,0,w/2,h/2);
  },[.19,.19]);
  K.texture('famille-mint-tiles',64,64,(g,w,h)=>{
    g.fillStyle='#b5cdc1';g.fillRect(0,0,w,h);
    g.fillStyle='#95b3a7';g.fillRect(1,1,w-2,h-2);
  },[.095,.095]);
  // Port the r19 food-led poster vocabulary with original procedural artwork.
  K.texture('famille-ebt-menu',256,320,(g,w,h)=>{
    g.fillStyle='#e7b956';g.fillRect(0,0,w,h);
    for(const[cx,cy,rr,bread]of [[.26,.23,.23,true],[.73,.47,.27,false],[.27,.77,.22,true]]){
      const x=cx*w,y=cy*h,r=rr*w;g.fillStyle='#b27b3e';g.beginPath();g.ellipse(x,y,r,r*(bread?.76:1),0,0,Math.PI*2);g.fill();
      g.fillStyle='#f4cf72';g.beginPath();g.ellipse(x,y,r*.91,r*(bread?.65:.91),0,0,Math.PI*2);g.fill();
      for(let i=0;i<17;i++){const a=i*2.4,d=r*.73*Math.sqrt((i+.5)/17);g.fillStyle=['#a64d32','#6e7042','#ede0a2'][i%3];g.beginPath();g.ellipse(x+Math.cos(a)*d,y+Math.sin(a)*d,4+i%3,3+i%2,a,0,Math.PI*2);g.fill();}
    }
  },[1.4,1]);
}
function buildUpper(K){
  const B=(u,v,y,w,d,h,mat,extra={})=>{const[x,z]=FP(u,v);return K.box({x,z,y,w,d,h,rotY:FROT,mat,...extra});};
  const W=(a,b,c,d,lo,hi,mat,extra={})=>K.wall(...FP(a,b),...FP(c,d),lo,hi,{mat,thick:.16,...extra});
  const S=(text,u,v,y,w,h,normal='v',o={})=>{const[x,z]=FP(u,v);K.sign(text,{x,z,y,w,h,rotY:normal==='v'?FROT:normal==='-v'?FROT+Math.PI:normal==='u'?FROT-Math.PI/2:FROT+Math.PI/2,bg:null,fg:'#eee8d9',...o});};
  const slab=(a,b,c,d,y,mat,opts={})=>K.slab(FR(a,b,c,d),y,{mat,thick:.22,under:'ceiling',...opts});
  // L1/L4/L5/L12: survey-photo stations, not percentages of an old plan.
  slab(-41,17.9,-28.1,21.1,5,{tex:'carpet',color:0x6a625b});
  slab(-28.1,17.9,-14,21.1,5,'famille-plank');
  slab(-27,11.8,4.2,17.9,5,'famille-plank'); // north restaurant bays
  slab(-14,17.9,4.2,25.2,5,'famille-plank');
  slab(4.2,13,8.35,25.2,5,'famille-plank'); // west hall / arched window
  slab(8.35,19.3,14.4,25.2,5,'famille-plank'); // landing behind escalator heads
  // Upper public stair is the granite bay beside (north of) the deck door.
  slab(-41,17.71,-36.2,17.9,5,{tex:'concrete',color:0xbebdb6});
  const sa=[70.3,147],sb=[59.5,141.8];
  K.stairs(...sa,...sb,{ya:5,yb:0,w:2.5,mat:{tex:'concrete',color:0xbebdb6},railMat:0x625241});
  K.slab([[57.4,140.1],[60.3,138.8],[63.1,142.5],[59.3,144.1]],0,{mat:'tile',thick:.18});
  // A narrow matching canopy follows the stair; it never fills station B1.
  for(let j=0;j<12;j++){
    const t=(j+.5)/12,x=sa[0]+(sb[0]-sa[0])*t,z=sa[1]+(sb[1]-sa[1])*t;
    K.box({x,z,y:8.1-5*t,w:2.9,d:1.05,h:.12,rotY:Math.atan2(sb[0]-sa[0],sb[1]-sa[1]),mat:0xe6e4da,solid:false});
  }
  // No ground slab below the elevated east street: exits 2/7 and the exit-3
  // stair/canopy retain their own ground holes and headroom under +5 m.
  W(-41,21.1,-27.8,21.1,5,7.85,0xe9e3dc,{openings:[{at:6.4,w:2.5,y0:5,y1:7.5}]});
  W(-36.2,17.9,-28.1,17.9,5,7.85,0xe9e3dc);
  W(-28.1,17.9,-28.1,21.1,5,7.85,0x1c1b19,{openings:[{at:1.6,w:2.6,y0:5,y1:7.55}]});
  W(-28.1,21.1,-14,21.1,5,8.65,'famille-buff');
  W(-27,11.8,4.2,11.8,5,9.55,'famille-buff');
  W(-14,25.2,14.4,25.2,5,9.6,'famille-buff');
  W(-27,11.8,-27,17.9,5,8.65,'famille-buff');
  W(14.4,19.3,14.4,25.2,5,9.6,'famille-buff');
  // The dead-end directory wall stops short of the restaurant street's
  // northern opening: the photographed slight northward turn remains open.
  W(-13.8,19.9,-13.8,21.15,5,8.5,'famille-buff');
  slab(-41,17.9,-28.1,21.1,7.85,{tex:'wood',color:0x3a2a22},{under:{tex:'wood',color:0x3a2a22},walk:false});
  slab(-28.1,11.8,-14,21.1,8.65,0x171717,{under:0x141414,walk:false});
  slab(-14,11.8,8.35,25.2,9.55,0x171717,{under:0x141414,walk:false});
  slab(8.35,20,14.4,25.2,9.55,0x2a201a,{under:0x2a201a,walk:false});
  // L6: K.escalator expects low -> high even for the down conveyor.
  K.escalator(22,155.5,25.9,165.8,{ya:0,yb:5,w:1.1,dir:'down'});
  K.escalator(20.2,156.2,24.1,166.5,{ya:0,yb:5,w:1.1,dir:'up'});
  // Head comb plates bridge the 9 cm v-coordinate difference, without filling
  // any of the descending void below v=19.2.
  slab(8.35,18.7,9.95,20.05,5,'famille-plank',{thick:.16});
  slab(9.95,19.16,11.55,20.05,5,'metal',{thick:.04});
  slab(11.85,19.18,13.4,20.05,5,'metal',{thick:.04});
  W(8.35,13,8.35,19.3,5,5.83,'famille-buff');
  W(8.35,13,8.35,13.25,5,9.55,'famille-buff');
  W(8.35,19.05,8.35,19.3,5,9.55,'famille-buff');
  // Broad arch is a real opening/glazed view over the hall, not a painted arch.
  for(let i=0;i<24;i++){
    const a=i*Math.PI/24,b=(i+1)*Math.PI/24;
    const v0=16.15+2.9*Math.cos(a),v1=16.15+2.9*Math.cos(b);
    const y0=5.83+2.8*Math.sin(a),y1=5.83+2.8*Math.sin(b);
    const p=FP(8.35,v0),q=FP(8.35,v1);
    K.quad('famille-buff',[[p[0],y0,p[1]],[q[0],y1,q[1]],[q[0],9.55,q[1]],[p[0],9.55,p[1]]],[-FA,0,FB]);
    K.quad('famille-buff',[[p[0],9.55,p[1]],[q[0],9.55,q[1]],[q[0],y1,q[1]],[p[0],y0,p[1]]],[FA,0,-FB]);
    for(let r=0;r<3;r++)fBeam(K,[p[0]+.08*FA,y0+r*.16,p[1]-.08*FB],[q[0]+.08*FA,y1+r*.16,q[1]-.08*FB],.12,0xe9e1cf);
    const c=FP(8.36,16.15);K.quad('glass',[[c[0],5.83,c[1]],[p[0],y0,p[1]],[q[0],y1,q[1]],[c[0],5.83,c[1]]],[-FA,0,FB]);
  }
  // Accessibility lift placed in the entrance/service bay; exact shaft is
  // unphotographed and explicitly recorded as inferred in research.
  const ex=69.4,ez=152.5;
  K.slab([[67.1,150.2],[71.7,150.2],[71.7,154.8],[67.1,154.8]],0,{mat:'tile',thick:.18});
  K.slab([[67.1,150.2],[71.7,150.2],[71.7,154.8],[67.1,154.8]],5,{mat:'carpet',thick:.2});
  K.elevator({name:'파미에 동관 승강기',x:ex,z:ez,rotY:FROT+Math.PI,w:2.2,d:2.1,floors:[{label:'1F',y:0,name:'지상 출입구'},{label:'2F',y:5,name:'식당가 · 주차장'}]});
  K.zone({name:'파미에스테이션 동관',floor:'2F',sub:'차알 · 소이연남 · 케르반 · 이비티',poly:FR(-41,11.8,14.4,25.2),y0:4.8,y1:9.65,priority:15});
  K.spawn({name:'파미에 2층 식당가',x:47.8,y:5,z:157.7,yaw:111*Math.PI/180,group:'파미에스테이션'});
  K.spawn({name:'파미에 에스컬레이터 상단',x:25.5,y:5,z:167.2,yaw:21*Math.PI/180,group:'파미에스테이션'});

  W(-27,17.9,-5.5,17.9,5,6.1,'glass',{thick:.035,openings:[{at:3.6,w:1.2,y0:5,y1:6.1},{at:13.2,w:1.2,y0:5,y1:6.1},{at:18.6,w:1.2,y0:5,y1:6.1}]});
  // The 2F indoor dining span has a continuous floor and structural ceiling.
  for(const yy of [5,8.43])K.occludingSlab({poly:FR(...diningSpan),y:yy,eyeMin:5.05,eyeMax:8.37});
  placeCharDining(K,FP,FROT);
  upperDetails(K,{B,W,S,slab});
}
// Small faceted rods merge into the kit batches (no per-object draw calls).
function fBeam(K,a,b,r,mat){
  const d=b.map((n,i)=>n-a[i]),l=Math.hypot(...d);if(l<1e-5)return;
  const t=d.map(n=>n/l),e=Math.abs(t[1])>.9?[1,0,0]:[0,1,0];
  let n=[t[1]*e[2]-t[2]*e[1],t[2]*e[0]-t[0]*e[2],t[0]*e[1]-t[1]*e[0]],nl=Math.hypot(...n);n=n.map(x=>x/nl*r/2);
  const m=[t[1]*n[2]-t[2]*n[1],t[2]*n[0]-t[0]*n[2],t[0]*n[1]-t[1]*n[0]];
  const pp=(p,s,q)=>p.map((x,i)=>x+s*n[i]+q*m[i]);
  const ca=[pp(a,1,1),pp(a,-1,1),pp(a,-1,-1),pp(a,1,-1)],cb=[pp(b,1,1),pp(b,-1,1),pp(b,-1,-1),pp(b,1,-1)];
  for(let j=0;j<4;j++){const normal=a.map((x,i)=>(ca[j][i]+ca[(j+1)%4][i])/2-x),len=Math.hypot(...normal);K.quad(mat,[ca[j],cb[j],cb[(j+1)%4],ca[(j+1)%4]],normal.map(x=>x/len));}
}
function upperDetails(K,{B,W,S,slab}){
  const Q=(u,v,y)=>{const[x,z]=FP(u,v);return[x,y,z];};
  const rod=(u,v,y,a,b,c,r=.04,mat=0x20201e)=>fBeam(K,Q(u,v,y),Q(a,b,c),r,mat);
  const C=(u,v,y,r,h,mat,o={})=>{const[x,z]=FP(u,v);K.cyl({x,z,y,r,h,mat,solid:false,...o});};
  const bulb=(u,v,y,r=.065)=>{const[x,z]=FP(u,v);K.dome({x,z,y,rx:r,ry:r*1.45,rz:r,hemi:false,seg:8,rings:5,mat:{tex:'emit',color:0xffe3a5}});};
  const plant=(u,v,y,r=.45,h=1.8)=>{
    C(u,v,y,r,.52,0xe5e2d7);C(u,v,y+.52,r*.85,.03,0x423c2f);
    C(u,v,y+.53,.055,h*.8,0x71644c);
    for(let j=0;j<9;j++){const a=j*2.4;const[x,z]=FP(u+Math.cos(a)*r*.6,v+Math.sin(a)*r*.6);K.dome({x,z,y:y+.8+(j%3)*h*.27,rx:r*.6,ry:h*.27,rz:r*.5,hemi:false,seg:7,rings:4,mat:[0x41623d,0x536f44,0x647b49][j%3]});}
  };
  const chair=(u,v,y,col=0x282624)=>{
    B(u,v,y+.44,.45,.46,.06,col,{solid:false});B(u,v+.2,y+.5,.44,.055,.45,col,{solid:false});
    for(const a of [-.17,.17])for(const b of [-.17,.17])B(u+a,v+b,y,.035,.035,.44,0x85827a,{solid:false});
  };
  const table=(u,v,y,service=true)=>{
    C(u,v,y,.055,.73,0x292b29);C(u,v,y+.73,.45,.05,0xd7b17c);
    if(service){C(u,v,y+.8,.09,.02,0xf4eee0);C(u+.2,v,y+.79,.04,.14,0xe5e2d8);}
    chair(u,v-.75,y);chair(u,v+.75,y);
  };
  const bench=(u,v,y,l=2.8)=>{B(u,v,y+.44,l,.52,.08,{tex:'wood',color:0xc89952});for(const du of [-l*.42,l*.42]){B(u+du,v,y,.06,.5,.44,0x202321,{solid:false});B(u+du,v,y,.42,.06,.05,0x202321,{solid:false});}};
  const railing=(a,b,v,y)=>{
    for(const h of [.15,1.02])rod(a,v,y+h,b,v,y+h,.06);
    for(let u=a;u<b;u+=.72){rod(u,v,y,u,v,y+1.03,.045);for(let j=0;j<10;j++){const aa=j*Math.PI/10,bb=(j+1)*Math.PI/10;rod(u+.34+.30*Math.cos(aa),v,y+.68+.30*Math.sin(aa),u+.34+.30*Math.cos(bb),v,y+.68+.30*Math.sin(bb),.023);}}
  };
  K.detail({name:'파미에 2층 사진 기반 마감과 점포',floor:'2F',y0:5,y1:9.65,poly:FR(-41,11.8,14.4,25.2)},()=>{
    // D2: tall bronze-edged entrance panel, granite stair bay and carpet.
    B(-39.2,17.8,5,1.15,.18,2.65,0x282722,{solid:false});
    for(const du of [-.52,.52])B(-39.2+du,17.91,5.18,.022,.025,2.27,0xb7a06c,{solid:false});
    for(const yy of [5.18,7.45])B(-39.2,17.91,yy,1.06,.025,.022,0xb7a06c,{solid:false});
    S(['FAMILLE STATION','EPICURES'],-39.2,17.91,6.45,1,.32,'v',{fg:'#e6d6ae'});
    B(-38.5,15.4,5.012,2.8,.55,.018,0xe6bd39,{solid:false});
    for(let u=-40;u<-36.2;u+=.36)B(u,16.1,8.05,.05,3.4,.12,0xd1d2cb,{solid:false});
    for(const u of [-40,-37.8])B(u,16.1,7.99,1.05,1.05,.035,{tex:'emit',color:0xf9f9ee},{solid:false});
    for(let u=-40;u<-28.5;u+=2.2){
      C(u,19.5,7.58,.11,.05,0x938267);C(u,19.5,7.56,.075,.03,{tex:'emit',color:0xffe7bf});
      for(const [v,n]of [[18.02,'v'],[20.97,'-v']]){
        B(u,v,5.9,.85,.10,1.30,0x25211e,{solid:false});
        S(['파미에스테이션',u%4<2?'계절 메뉴':'오늘의 식탁'],u,v+(n==='v'?.065:-.065),6.58,.74,1.12,n,{bg:u%4<2?'#304e6a':'#a74e83',fg:'#ffffff'});
      }
    }
    // The four glass leaves are open around the 2.6 m clear centre.
    for(const v of [18.01,18.18,20.82,21])B(-28.15,v,5,.055,.055,2.65,0x1b1d1b,{solid:false});
    for(const v of [18.1,20.9])B(-28.2,v,5.05,1.15,.025,2.48,'glass',{solid:false});
    B(-28.1,19.5,7.58,.09,3.2,.07,0x191b19,{solid:false});
    // D3: source's pink script is reproduced only as the photographed sign,
    // with no private photograph used as a texture.
    S('Here To Delight You!',-25,20.99,7.18,2.8,.36,'-v',{fg:'#ff4fd6',bold:false});
    B(-25,20.96,5.85,2,.10,.84,0x3b2433,{solid:false});
    for(const du of [-1,1])B(-25+du,20.89,5.85,.025,.025,.84,0xc9a86a,{solid:false});
    for(const yy of [5.85,6.69])B(-25,20.89,yy,2,.025,.025,0xc9a86a,{solid:false});
    S(['FAMILLE STATION','EPICURES'],-25,20.88,6.25,1.8,.45,'-v',{fg:'#c9a86a'});
    B(-26.7,20.85,7.58,1.3,.3,.29,0xe4e4dd,{solid:false});
    S('FAMILLE STATION',-28.22,20.9,5.85,1.1,.15,'u',{fg:'#e7e4dc',bold:false});
    for(let u=-27;u<8;u+=.48)B(u,18.5,u<-14?8.43:9.32,.035,u<-14?6.4:13,.12,0x242424,{solid:false});
    for(let u=-26;u<7;u+=3.8)B(u,19.4,u<-14?8.37:9.27,1.45,.14,.045,{tex:'emit',color:0xf6f2df},{solid:false});
    for(const [a,b] of [[-27,-24],[-22.8,-14.4],[-13.2,-9],[-7.8,-5.5]])railing(a,b,17.84,5);
    // Photo #249: 15 individual brass plaques, retained as a directory rather
    // than incorrectly treating their plan numbers as geographic positions.
    const names=['KEY COFFEE COMPANY','FOURB ROASTERY BAGEL','hoho','한우리','CREAM LABEL','天津包子','오장동 함흥냉면','와라쿠 샤샤','crispy fresh',"Buddha’s Belly",'FAMILLE STATION','갓덴스시','CENTRAL YONSEI','Mi&Mi','JAJU'];
    names.forEach((n,i)=>{const u=-18.4+(i%5)*.72,y=7.15-Math.floor(i/5)*.57;B(u,20.98,y-.24,.64,.07,.49,0xb99a66,{solid:false});S(n,u,20.93,y,.59,.38,'-v',{bg:'#dfc495',fg:'#3c3327',bold:false});});
    bench(-16.9,20.53,5,3.6);B(-14.5,20.58,5,.43,.43,.8,0x292823,{solid:false});
    C(-26.7,20.7,5,.13,.45,0xb82c22);S('소화기',-26.7,20.88,6.35,.22,.6,'-v',{bg:'#b9382b',fg:'#fff4e7'});
    // D4: black Warren trusses follow the street, not transverse rafters.
    for(const v of [17.5,23.5]){
      for(const yy of [8.55,9.23])rod(-14,v,yy,4,v,yy,.12,0x292725);
      for(let u=-14;u<4;u+=1.5){rod(u,v,8.55,u+1.5,v,9.23,.09,0x292725);rod(u+1.5,v,9.23,u+1.5,v,8.55,.065,0x292725);}
    }
    for(const u of [-12,-7]){
      // The end of the second Soi bar meets the lockers beside Kervan.
      const barU=u===-7 ? -7.72 : u, width=u===-7 ? 3.32 : 5.3;
      B(barU,15.6,5,width,.65,1,0x514337);B(barU,15.6,6,width,.72,.08,0x332e27,{solid:false});
      for(let j=0;j<6;j++){
        S(['소이연남',j%2?'쌀국수':'태국 요리'],u-2.2+j*.87,12.05,7.48,.78,1.02,'v',{bg:['#9b5e43','#8b8b4f','#c18c69'][j%3],fg:'#f2e5cf'});
        for(let k=0;k<3;k++)C(u-2.1+j*.85,12.45+k*.22,6.37,.045,.26,[0x4b714a,0x769264,0x324c35][k]);
      }
      B(u,12.45,6.3,5.5,.8,.08,0x302b24,{solid:false});
      for(const t of [-.30,0,.30])chair(barU+t*width,16.65,5);
    }
    // Preserve the snapshot's ten-table Soi fitout in the corrected north bay.
    for(let row=0;row<2;row++)for(let col=0;col<5;col++){
      const u=-13.5+col*1.65,v=13.25+row*1.9;table(u,v,5);
      const occupied=row===0?2:col<2?1:0;
      for(let seat=0;seat<occupied;seat++){const[x,z]=FP(u,v+(seat?.75:-.75));K.person(x,5,z,{sit:true,rotY:seat?FROT+Math.PI:FROT,shirt:row?0x989286:0x555c50,pants:0x373936});}
    }
    S('소이연남',-11,17.49,8.58,2.7,.5,'v',{fg:'#ff59ba'});
    for(let j=0;j<5;j++){const u=-12.2+j*.48;S('소이',u,17.45,7.97,.43,.55,'v',{bg:['#d2aa51','#e1d8bd','#528e87','#b6708c','#b6bb63'][j],fg:'#222b27'});}
    // Keep the four locker columns inside Soi's edge; the previous row crossed the pastry case.
    for(let i=0;i<8;i++)B(-5.77,14.95+(i%4)*.48,5+Math.floor(i/4)*.55,.36,.46,.53,i%2?0xd9d8d0:0x242927,{solid:false});
    placeKervanWindow(K,Q(-.9,12.3,5),FROT+Math.PI);
    for(const u of [-12,-8,-4]){bench(u,23.8,5,2.5);plant(u+1.6,23.9,5);}
    for(let u=-13;u<4;u+=2.8){rod(u,17.4,8.55,u,17.4,8.13,.018,0x4b4437);bulb(u,17.4,8.1);const[x,z]=FP(u,17.1);K.dome({x,z,y:8.8,rx:.46,ry:.3,rz:.4,seg:8,rings:5,mat:0x4c6d40});}
    // D5: KERVAN is north, ebt's striped court is south, as photographed.
    S('KERVAN',-3.6,16.8,8.15,1.05,.7,'-u',{bg:'#422e21',fg:'#ede6d6'});
    // The photographed east-gallery case keeps its original contact footprint.
    B(-3.7,16.25,5,3.5,1.05,.95,0,{skip:['top','bottom','n','s','e','w']});
    placeKervanCase(K,Q(-3.7,16.25,5),FROT+Math.PI);
    S('PİŞMANİYE',-5.03,16.617,5.936,.53,.066,'v',{fg:'#ebce8c',pxPerM:450});
    for(const [x,v,title] of [[-1.49,.37,'PİŞMANİYE'],[-.98,.37,'LOKUM'],[-.45,.40,'BAKLAVA']]){
      S(title,-3.7+x,16.25-v+.01,5.966,.27,.051,'v',{fg:'#2e5847',pxPerM:800});
    }
    // KERVAN's eight furnished dining tables and mosaic canopy survive the move.
    for(let row=0;row<2;row++)for(let col=0;col<4;col++){
      const u=-4.7+col*2.3,v=12.9+row*1.8,meal=row===1 && col===2;
      table(u,v,5,!meal);
      if(meal)placeKervanMeal(K,Q(u,v,5.781),FROT+Math.PI);
      C(u,v,8.4,.012,.8,0x655344);const[x,z]=FP(u,v);
      K.dome({x,z,y:8.25,rx:.13,ry:.18,rz:.13,hemi:false,mat:[0x65a4ad,0xdbaa5b,0xa66d6e][(row+col)%3],seg:10,rings:6});
      const occupied=row===0||col%2===0?2:1;for(let seat=0;seat<occupied;seat++){const q=FP(u,v+(seat?.75:-.75));K.person(q[0],5,q[1],{sit:true,rotY:seat?FROT+Math.PI:FROT,shirt:seat?0x514f42:0xb5a28d,pants:0x413b36});}
    }

    for(const [i,u] of [-4.8,-3.7,-2.6].entries())placeKervanLamp(K,Q(u,15.4,8.03),FROT+Math.PI+i*.28);
    S(['좌석 안내','대기선'],-2.1,17.25,6.1,.65,.6,'u',{bg:'#42382d',fg:'#eee0c8'});
    for(const u of [3.6,6.7]){table(u,23.5,5);plant(u-1,24,5,.45,2.1);}
    S('ebt PIZZA',3.3,25.03,7.65,2.9,.38,'-v',{fg:'#f8eee2'});
    for(let j=0;j<22;j++)B(-.4+j*.42,24.55,7.34,.42,1.25,.2,j%2?0xf3e8dc:0xc8453a,{solid:false});
    for(const u of [.3,4,7.7]){B(u,25.03,5,2.4,.04,2.05,'glass',{solid:false});B(u,25.01,5.88,2.45,.04,.05,0xf0e4cf,{solid:false});}
    for(let u=0;u<13;u+=1.1)for(let v=21.4;v<24.9;v+=1.1){B(u,v,9.28,1.04,1.04,.025,{color:0x665f50,gloss:.7},{solid:false});bulb(u,v,9.02,.055);}
    for(const u of [1.7,6.9]){
      const a=Q(u-.35,24.96,5.8),b=Q(u+.35,24.96,5.8);K.quad('famille-ebt-menu',[a,b,[b[0],6.8,b[2]],[a[0],6.8,a[2]]],[-FB,0,-FA]);
      for(const dv of [-.65,.65]){chair(u,23.4+dv,5,0xeeeae1);for(const du of [-.16,.16])rod(u+du,23.4+dv-.2,5,u+du,23.4+dv+.2,5.44,.025,0xeeeae1);}
      for(const du of [-.7,.7])C(u+du,23,5,.035,.93,0xb1b6b2);
      B(u,23,5.88,1.4,.045,.07,0xa42d32,{solid:false});
    }
    B(3.4,24.6,5,1.8,.65,1.0,0xd7c5a3,{top:0xe9e1d0});B(3.4,24.55,6,.25,.25,.28,0x242927,{solid:false});
    for(const u of [-11,-7,-3,1,3.4]){B(u,12.4,6,.3,.3,.35,0x242927,{solid:false});for(let j=0;j<5;j++)C(u+j*.16,12.6,6.12,.045,.17,0xded4bc);}
    for(let j=0;j<5;j++)chair(.5,23.2,5+j*.16,0xeee9df);
    plant(6.6,18.7,5,.55,2);plant(4.5,21,5,.5,2.3);
    // Cream multilayer arch / glazing mullions and Victorian balustrade.
    for(const v of [13.3,14.6,16.15,17.7,19])rod(8.28,v,5.83,8.28,v,7.1,.055,0x33332f);
    for(const [a,b]of [[8.35,9.9],[13.4,14.4]])railing(a,b,19.26,5);
    B(8.4,19.4,5,.1,.1,3.2,0x252825,{solid:false});B(8.4,22.4,5,.1,.1,3.2,0x252825,{solid:false});
    B(8.4,20.9,8.12,.1,3.1,.1,0x252825,{solid:false});
    // T2 directories at the two photographed locations, outside clear paths.
    for(const [u,v,y]of [[-24,18.2,5]]){
      B(u,v,y,.52,.32,2.15,0x272925);S(['↑ 2층 식당가 · 뷰티살롱','차알 · 무월식탁 · 매우매오','ebt PIZZA · KERVAN','BEAN BROTHERS · halff coffee'],u,v+.18,y+1.25,.8,1.2,'v',{bg:'#272925',fg:'#eee6d3'});
    }
    for(const [u,v,shirt]of [[-9,19.3,0x404841],[-2,20.5,0xb9a88a],[5.5,20.2,0x5f5852],[-18.52,19.70,0x656768]]){const[x,z]=FP(u,v);K.person(x,5,z,{shirt,pants:0x3a3937,rotY:FROT});}
    S('1층 ↓',11.5,20.7,8.6,1.2,.3,'-v',{bg:'#278878',fg:'#f8fff3'});
  });
}

// Photo-led covered parking: OSM 414891732, same y5 datum as Famille 2F.
function buildDeck(K) {
  const PI=Math.PI, ex=.89563,ez=-.4448,nx=.4448,nz=.89563;
  const P=(s,v)=>[71.26+ex*s+nx*v,143.25+ez*s+nz*v];
  const R=(s0,v0,s1,v1)=>[P(s0,v0),P(s1,v0),P(s1,v1),P(s0,v1)];
  const rot=Math.atan2(-ez,ex), faceSouth=Math.atan2(nx,nz), faceEast=Math.atan2(ex,ez);
  const box=(s,v,y,w,h,d,mat,solid=false)=>{const [x,z]=P(s,v);K.box({x,z,y,w,h,d,rotY:rot,mat,solid});};
  const wall=(s0,v0,s1,v1,y0,y1,o={})=>K.wall(...P(s0,v0),...P(s1,v1),y0,y1,o);
  const sign=(text,s,v,y,w,h,face=faceSouth,bg='#eeeeea',fg='#2c6db4')=>{const [x,z]=P(s,v);K.sign(text,{x,z,y,w,h,rotY:face,bg,fg,twoSided:true});};
  const poly=K.osmBuilding(414891732)[0]?.poly||[[76.39,153.44],[82.23,150.54],[84.82,155.7],[172.9,111.97],[165.18,96.61],[71.26,143.25]];
  const floor={tex:'concrete',color:0x8e918c,gloss:.3},concrete={tex:'concrete',color:0x5f5c57};
  // Structure. Thin slabs keep the station's underground network unobstructed.
  K.slab(poly,0,{mat:floor,under:concrete,thick:.18});
  K.slab(poly,5,{mat:floor,under:concrete,thick:.32,holes:[R(48,3,62,5.5)]});
  K.stairs(...P(48,4.25),...P(62,4.25),{ya:0,yb:5,w:1.9,mat:'metal',rails:true});
  // A3 white steel staircase visible in #227 climbs to the roof through this hole.
  const roofHole=R(33.7,.8,44.5,3.4);
  K.slab(poly,9,{mat:'parking',under:concrete,thick:1,holes:[roofHole]});
  for(const y of [0,5]){
    wall(0,0,0,2.5,y,y+3,{mat:0x303333,thick:.25});
    wall(0,6.4,0,11.1,y,y+3,{mat:0x303333,thick:.25});
    wall(104.8,0,104.8,17.1,y,y+3,{mat:0xd8d7d0,thick:.25,openings:[{at:9,w:7,y0:y,y1:y+3}]});
    // West toilets are the only full-height internal white wall.
    wall(11,5.25,22,5.25,y,y+2.85,{mat:0xeeeeea,thick:.15,openings:[{at:5,w:2.1,y0:y,y1:y+2.35}]});
    wall(11,.5,11,5.25,y,y+2.85,{mat:0xeeeeea,thick:.15});
    wall(22,.5,22,5.25,y,y+2.85,{mat:0xeeeeea,thick:.15});
    wall(22,13.8,104.4,13.8,y,y+1.0,{mat:0xeeeeea,thick:.16});
    wall(0,11.1,6.6,11.1,y,y+1.0,{mat:0xeeeeea,thick:.18});
    wall(6.6,11.1,6.6,16.8,y,y+1.0,{mat:0xeeeeea,thick:.18});
    wall(6.6,16.8,104.4,16.8,y,y+1.0,{mat:0xeeeeea,thick:.18});
    // North edge is open steel railing under deep concrete beams.
    wall(.3,.22,104.5,.22,y,y+1.05,{mat:'glass',thick:.035});
    for(let s=.5;s<105;s+=2.4)box(s,.22,y,.055,1.08,.065,0x474b49,true);
    for(const h of [.28,.62,1.05])box(52.4,.22,y+h,104.2,.045,.045,0x474b49);
    for(let s=3;s<104;s+=8){
      for(const v of [.6,s<7?10.7:16.3])box(s,v,y,.55,y===0?4.68:3,.55,0xe5e3dc,true);
      box(s,s<7?5.5:8.4,y+(y===0?4.43:2.75),.4,.25,s<7?11:16.8,concrete);
    }
  }
  // Column family is keyed to the photographed A1/A2/A3 locations, then an ~8m grid.
  const columns=[[11.4,8.8,'A1'],[26.7,8.8,'A2'],[33.4,8.8,'A3']];
  for(let s=42,n=5;s<104;s+=8,n++)columns.push([s,8.8,'A'+n]);
  for(const [s,v,n] of columns)box(s,v,5,.65,2.8,.65,n==='A1'?0x3b3b3b:0xeeeeea,true);
  const a=P(34.1,2.1),b=P(43.7,2.1);
  K.stairs(...a,...b,{ya:5,yb:9,w:1.8,mat:0xdedfd9,rails:true});
  K.slab(R(43.7,.8,46,3.4),9,{mat:'metal',thick:.12});
  wall(33.8,.8,44.5,.8,9,10.1,{mat:'glass',thick:.05});
  wall(33.8,3.4,44.5,3.4,9,10.1,{mat:'glass',thick:.05});
  // Sunken planting follows the north edge, not an axis-aligned rectangle.
  // No full underground foundation is added near station passages.
  const trench=R(4.5,-6,43,-.2);K.groundHole(trench);
  K.slab(trench,-2,{mat:{tex:'grass',color:0x3a4430},under:'concrete',thick:.15});
  wall(4.5,-6,43,-6,-2,0,{mat:{tex:'concrete',color:0xb9bbaf},thick:.3});
  wall(4.5,-6,4.5,-.2,-2,0,{mat:0xb9bbaf,thick:.2});
  wall(43,-6,43,-.2,-2,0,{mat:0xb9bbaf,thick:.2});
  K.zone({name:'파미에 주차장',floor:'1F',sub:'주차 구역',poly,y0:0,y1:4.7,priority:5});
  K.zone({name:'파미에 주차장',floor:'2F',sub:'파미에스테이션 · 주차 구역 A',poly,y0:5,y1:8,priority:5});
  K.zone({name:'파미에 주차장',floor:'3F',sub:'A구역 · 파미에가든 계단',poly,y0:8.95,y1:12.4,priority:6});
  const garden=12.6;
  K.slab(poly,garden,{mat:'sidewalk',under:concrete,thick:.24,holes:[R(61,3,72.5,5.5)]});
  K.stairs(...P(61,4.25),...P(72.5,4.25),{ya:9,yb:garden,w:1.9,mat:'metal',rails:true});
  for (const v of [3,5.5]) wall(61,v,72.5,v,garden,garden+1.0,{mat:'metal',thick:.07});
  // Rail the open roof edge, leaving the west bridge and east path free at their ends.
  for(let i=0;i<poly.length;i++){
    const a=poly[i], b=poly[(i+1)%poly.length];
    if(Math.hypot(b[0]-a[0],b[1]-a[1])>40) K.wall(...a,...b,garden,garden+1,{mat:'glass',thick:.08});
  }
  for (let s=8;s<104;s+=8) {
    box(s,.65,9,.55,3.36,.55,concrete,true);
    box(s,15.7,9,.55,3.36,.55,concrete,true);
    for(const v of [1,10]) box(s,v,9.015,.09,.025,4.2,0xe0d9ba);
  }
  K.zone({name:'파미에가든',floor:'4F',sub:'주차장 상부 · 텍사스데브라질 · 데블스도어 방면',poly,y0:garden-.12,y1:garden+4,priority:12});
  wall(65,1,88,1,garden,garden+3.5,{mat:0x48372f,thick:.2});
  wall(88,1,88,7,garden,garden+3.5,{mat:0x634536,thick:.2});
  box(79,7,garden+2.8,16,.7,.3,0x47352e);
  sign('텍사스데브라질',79,7.19,garden+3.14,5,.43,faceSouth,'#47352e','#f5dbac');
  for (const s of [72.5,85.5]) {
    box(s,7,garden,2.6,2.8,.12,{tex:'glass',color:0x7b7770},true);
    for (const v of [3.3,5.7]) {
      box(s,v,garden+.73,1.35,.09,.76,0x876441);
      box(s,v,garden,.18,.73,.28,0x493f35);
    }
  }
  // The walk from the restaurant roof ends at the upper parking apron.
  // The approach across the next block and the hotel canopy is a separate
  // vehicular court, owned by streets, with its own kerbs and crossings.
  const roofExit=P(4,11), apron=P(4,20);
  K.ramp(...roofExit,...apron,{ya:garden,yb:gardenSurface(4,20),w:2.1,mat:'sidewalk',rails:false});
  // Keep the public car park continuous past the short OSM western building.
  // Bend the garden aisle around the separate transverse block at station 197.
  const extension=[P(104,1),P(160,1),P(196,26),P(196,41),P(156,17),P(104,17)];
  // The upper drive cuts across this garage wing. Its wearing course and
  // the planted deck share a surveyed grade; the three decks below stay level.
  // Preserve the restaurant sill and the joint to the older west building.
  const roofDatum=(x,z)=>{
    const s=gardenStation(x,z),v=nx*(x-71.26)+nz*(z-143.25);
    const blend=Math.min(1,Math.max(0,(v-9)/7))*Math.min(1,Math.max(0,(s-104)/8));
    return relief(x,z)+blend*(gardenSurface(s,v)-garden-.03);
  };
  for(const level of [0,5,9,garden]) {
    if(level===garden) K.withTerrainSurface(roofDatum,()=>K.slab(extension,garden,{mat:'sidewalk',thick:.24,under:concrete}));
    else K.slab(extension,level,{mat:floor,thick:.24,under:concrete});
    K.zone({name:level===garden?'파미에가든':'파미에 주차장',floor:String([0,5,9,garden].indexOf(level)+1)+'F',
      sub:'동측 주차 구역 · 식당가',poly:extension,y0:level-.08,y1:level+2.8,priority:7});
  }
  K.withTerrainSurface(roofDatum,()=>{
    for(const edge of [[196,41,156,17],[156,17,104,17]]) wall(...edge,-.1,garden-.24,{mat:concrete,thick:.2});
  });
  wall(6.6,16.8,104.4,16.8,0,9,{mat:concrete,thick:.18});
  for(let s=111;s<156;s+=4) for(const level of [0,5,9]){
    box(s,3.6,level+.01,.1,.025,4.3,0xe5dcb6);
    box(s,14.3,level+.01,.1,.025,4.3,0xe5dcb6);
  }
  for(const [s,name] of [[139,'모던눌랑']]){
    K.slab(R(s-7,1.5,s+7,7),garden+3.55,{mat:0x585046,thick:.22});
    wall(s-7,1.5,s+7,1.5,garden,garden+3.55,{mat:0x685446});
    for(const side of [-1,1]){
      wall(s+side*7,1.5,s+side*7,7,garden,garden+3.55,{mat:0xa6967e});
      box(s+side*4.4,7,garden,5,2.9,.09,{tex:'glass',color:0x72807d},true);
      box(s+side*3,4,garden+.72,1.5,.12,.84,0x8a6348);
    }
    box(s,7,garden+2.9,14,.68,.24,0x453c34);
    sign(name,s,7.15,garden+3.25,3.5,.41,faceSouth,'#453c34','#f5e9cf');
  }
  sign('데블스도어 · 더 바이킹 →',283,39,gardenSurface(283,39)+1.65,4.6,.4,faceEast+PI);
  const start=P(72.8,8);
  K.spawn({name:'파미에 주차장 4층 · 파미에가든',x:start[0],z:start[1],y:garden,yaw:faceEast,group:'파미에스테이션'});
  K.spawn({name:'파미에 주차장 2층',x:103.9,y:5,z:135.3,yaw:103.1*PI/180,group:'파미에스테이션'});

  K.detail({name:'파미에 주차장 설비와 주차칸',floor:'2F',poly,y0:5,y1:9},()=>{
    // Repeating concrete ceiling ribs, tray, suspended pipes and fluorescent fittings.
    for(const v of [4.1,13.2])box(52,v,7.82,104,.18,.34,concrete);
    for(const [v,y,d,c] of [[5.5,7.58,.11,0xe2b42b],[6,7.35,.2,0x2a5fb0],[6.5,7.53,.16,0x9a9b92],[13.1,7.55,.12,0xc9cbc5]])box(52.2,v,y,103.6,d,d,c);
    box(52,10.5,7.67,102,.07,.65,0x4b4e4a);
    for(let s=3;s<104;s+=4){
      box(s,10.5,7.64,.045,.05,.66,0x92958f);
      box(s,10.4,7.5,.09,.08,1.55,'emit');
      box(s,6,7.55,.035,.4,.035,0x646862);
      for(const v of [2.8,14.9])box(s,v,7.55,1.25,.06,.1,'emit');
    }
    // Green driving strip bends towards the west door; floor markings are decals.
    K.hpoly({color:0x3d8a5f,gloss:.3},R(23,8.5,104,13.5),5.012,true);
    K.hpoly({color:0x3d8a5f,gloss:.3},[P(2,4.3),P(7,3.3),P(26,8.5),P(26,13.5),P(6,8.8)],5.012,true);
    for(const v of [8.1,13.55])box(58,v,5.025,91,.012,.1,0xe9b51f);
    for(let s=24;s<104;s+=13){const [x,z]=P(s,11.2);K.floorText('↑',{x,z,y:5.035,w:1.45,h:3.2,rotY:faceEast-PI,fg:'#ffffff'});}
    // North parking bays and photographed western accessible bays.
    for(let s=25;s<102;s+=2.8){
      box(s,4.2,5.025,.1,.01,6.8,0xe9b51f);
      box(s+1.2,1.65,5.04,1.55,.13,.25,0x363b3b);
      if(s<36){
        box(s+1.25,6.3,5.04,1.4,.012,1.4,0x337bb4);
        const [x,z]=P(s+1.25,6.3);K.floorText('♿',{x,z,y:5.06,w:1.15,h:1.15,rotY:faceSouth,fg:'#ffffff'});
      }else if(s>=46&&(Math.round(s*10)%4)!==0){
        const [x,z]=P(s+1.25,3.6);K.vehicle({x,z,y:5,rotY:faceSouth,kind:'car',color:[0xe5e7e4,0x26292c,0x777b7e,0xeae5dc][Math.round(s)%4]});
      }
    }
    for(let s=8;s<36;s+=1.2){const p=[P(s,7.25),P(s+.3,7.25),P(s+1.5,8.5),P(s+1.2,8.5)];K.hpoly(0xeeeae0,p,5.027,true);}
    // South stalls remain behind the low white partition east of the service pocket.
    for(let s=27;s<103;s+=4.8){
      const [x,z]=P(s,15.2);K.vehicle({x,z,y:5,rotY:faceSouth+PI/2,kind:'car',color:[0xf2f1ec,0x252a2e,0x747b7d][Math.round(s)%3]});
      box(s-2.2,15.2,5.02,.09,.01,3.2,0xe9b51f);
      box(s,13.3,5,.1,.85,.1,0xd06b45);
    }
    // Recessed west service wall and photographed toilet graphics.
    sign('〈〈  여자 화장실',13.5,5.37,6.35,4.5,.65,faceSouth,'#2c6db4','#ffffff');
    sign('남자 화장실  〉〉',20,5.37,6.35,2.4,.65,faceSouth,'#2c6db4','#ffffff');
    box(21,5.5,5.65,.65,.8,.24,0xa52924);
    box(21,5.65,5.78,.45,.52,.03,0x292e2c);
    sign('소화기',21,5.72,6.3,.48,.18,faceSouth,'#a52924','#ffffff');
    // Door bay is open at s0,v2.5..6.4; leaf glazing is parked against jambs.
    sign('FAMILLE STATION',.08,4.45,7.55,4.1,.46,faceEast,'#26292b','#ffffff');
    sign(['파미에스테이션','신세계아카데미  〉〉'],.13,8.6,6.4,4.4,.9,faceEast,'#303333','#ffffff');
    for(const v of [2.7,6.2])box(.18,v,5,.12,2.35,.75,'glass');
    box(1.5,4.5,5.02,3,.012,4.1,0x383b38);
    for(const [s,v,n] of columns){
      sign([n[0],n.slice(1)],s-.36,v,6.25,.55,1.45,faceEast+PI,n==='A1'?'#3b3b3b':'#eeeeea',n==='A1'?'#ffffff':'#2c6db4');
      sign(n==='A2'?'↑ 센트럴시티':'↑ 파미에스테이션',s-.37,v,5.98,.62,.2,faceEast+PI,'#51534d','#ffffff');
      box(s,v+.34,5.1,.65,2.5,.025,n==='A1'?0x3b3b3b:0x2c6db4);
      sign('2층',s,v+.37,6.25,.45,.6,faceSouth,'#2c6db4','#ffffff');
      for(const side of [-1,1])for(let j=0;j<6;j++)box(s+side*.31,v-.34,5.14+j*.13,.12,.12,.05,j%2?0x292d2c:0xe7bd35);
    }
    sign('←  주차 ♿',37,11,7.4,1.7,.65,faceEast+PI,'#eeeeea','#255fa1');
    for(let s=46,n=6;s<103;s+=8,n++)sign(['B',String(n)],s,13.68,6.15,.6,1.1,faceSouth+PI,'#eeeeea','#2c6db4');
    // Red prepayment kiosk at the west end, outside the clear walking line.
    box(31,15,5,.8,1.9,.65,0xaa2c2c,true);box(31,14.65,5.9,.54,.5,.035,0x263537);
    sign('사전정산',31,14.6,6.64,.67,.25,faceSouth+PI,'#b52e32','#ffffff');
    for(const s of [4,7,10]){const v=s===4?10.3:12.9;box(s,v,5,.65,.07,.65,0x262a29);box(s,v,5.08,.05,.85,.05,0x535852);sign('주차금지',s,v,5.6,.55,.45,faceEast,'#f4f3eb','#c42e24');}
    // Yellow hatch and black grate immediately before the threshold.
    for(let v=2.3;v<10;v+=.35)box(2,v,5.03,.68,.012,.07,0x1f2625);
    for(let s=2;s<8;s+=1.4)K.hpoly(0xe9b51f,[P(s,3),P(s+.16,3),P(s+2,8),P(s+1.84,8)],5.035,true);
  });
  K.detail({name:'파미에 선큰 식재',floor:'1F',poly:trench,y0:-2,y1:3},()=>{
    for(let s=6;s<42;s+=3){const [x,z]=P(s,-3.2+(s%2)*.7);K.dome({x,z,y:-1.8,rx:1,ry:1.2,rz:.7,mat:0x52683d});const p=P(s+.9,-1.7);K.dome({x:p[0],z:p[1],y:-1.95,rx:.65,ry:.45,rz:.48,mat:0x7c8073});}
    for(const s of [9,21,34]){const [x,z]=P(s,-4.6);K.tree(x,z,{y:-2,h:4.3,kind:'zelkova'});}
  });
}

// Photo-first east hall and gallery, round 20. Geometry helpers are local to this function.
function buildHall(K) {
  const H=Math.hypot(62,24), C=62/H,S=24/H, R=Math.atan2(S,C), PI=Math.PI;
  const P=(u,v)=>[29-C*u+S*v,144+S*u+C*v];
  const rect=(u0,v0,u1,v1)=>[P(u0,v0),P(u1,v0),P(u1,v1),P(u0,v1)];
  const B=(u,v,y,w,d,h,mat,solid=false)=>{const[x,z]=P(u,v);return K.box({x,z,y,w,d,h,rotY:R,mat,solid});};
  const wall=(a,b,c,d,y0,y1,opts={})=>K.wall(...P(a,b),...P(c,d),y0,y1,{mat:'famille-buff',thick:.24,...opts});
  const sign=(text,u,v,y,w,h,face='v',opts={})=>{const[x,z]=P(u,v);K.sign(text,{x,z,y,w,h,rotY:face==='u'?R-PI/2:face==='-v'?R+PI:R,bg:null,fg:'#f6f1e5',...opts});};
  const cyl=(u,v,y,r,h,mat)=>{const[x,z]=P(u,v);K.cyl({x,z,y,r,h,mat,seg:12});};
  const dome=(u,v,y,rx,ry,rz,mat)=>{const[x,z]=P(u,v);K.dome({x,z,y,rx,ry,rz,mat,hemi:false,seg:12,rings:8});};
  const xyz=([u,v,y])=>{const[x,z]=P(u,v);return[x,y,z];};
  const beam=(a,b,t,mat)=>fBeam(K,xyz(a),xyz(b),t,mat);
  const brick='famille-buff',cream=0xe9e1cf,iron=0x282928,brass=0xb28e4e;
  const tile={tex:'tile',color:0xddd6c7,scale:[.6,.6],gloss:.3};
  const hall=rect(4,0,22,20),gallery=rect(22,0,70.56,11.5);
  // These slabs are shallow ceilings over the station, not masses that fill its B1/B2 voids.
  K.slab(hall,0,{mat:tile,under:'concrete',thick:.18});
  K.slab(gallery,0,{mat:tile,under:'concrete',thick:.18});
  // JF1 is a level 4 m doorway into centralcity's independently rebuilt HOS lobby.
  K.slab(rect(8.15,-3.5,12.25,1.35),0,{mat:{tex:'darkstone',color:0x282824,gloss:.3},thick:.12});
  // JF2 reaches the centreline seam only, without replacing centralcity's west gallery.
  K.slab(rect(69.9,2.75,73.7,7.25),0,{mat:tile,thick:.12});
  // Hall north facade: broad bronze-framed opening, with a fully clear central 4m door.
  wall(4,0,22,0,0,10,{openings:[{at:6.15,w:8,y0:0,y1:4.35},{at:14.3,w:6.1,y0:0,y1:3.8}]});
  // East JAJU / Agra frontage. Upper openings preserve sight into the 2F restaurants.
  wall(4,0,4,20,0,10,{openings:[{at:1.95,w:2.75,y0:0,y1:3.55},{at:7.2,w:5.8,y0:0,y1:4.25},{at:14.2,w:5.8,y0:0,y1:4.25},{at:7.2,w:5.6,y0:5,y1:8.65},{at:14.2,w:5.6,y0:5,y1:8.65},{at:19.2,w:1.6,y0:5,y1:9.45}]});
  K.slab(rect(-9,.52,4.2,3.37),0,{mat:tile,thick:.16});
  sign('나가는 곳',4.21,1.95,3.27,1.4,.24,'u');
  sign('하우스 오브 신세계',10.15,.31,3.1,3.6,.3,'v',{bg:'#332d27'});
  sign('호남선 터미널',68,7.6,2.9,2.4,.32,'u',{bg:'#33483e'});
  // South return stays under the upper landing; the upper doorway is open u8..14.
  wall(4,20,22,20,0,4.7);
  wall(4,20,8,20,4.7,10);wall(14,20,22,20,4.7,10);
  // Hall west is fully open to the gallery for its north 11.5m.
  wall(22,11.5,22,20,0,10);
  // Shallow public-facing shop shells avoid a new wall inside the station exits.
  K.slab(rect(-1,3.8,4,17.6),0,{mat:tile,thick:.18});
  K.slab(rect(-1,3.8,4,11.8),5,{mat:'famille-plank',under:'ceiling',thick:.22});
  wall(-1,3.8,-1,17.6,0,4.7);wall(-1,3.8,4,3.8,0,4.7);wall(-1,10.7,4,10.7,0,4.7);wall(-1,17.6,4,17.6,0,4.7);
  // Photo-proven Wafille bay, followed by architectural bays with names unassigned.
  wall(22,0,70.56,0,0,8,{openings:[{at:3.2,w:5.6,y0:0,y1:4.1},...Array.from({length:6},(_,i)=>({at:9.7+i*6.5,w:5.3,y0:0,y1:4.1})),...Array.from({length:7},(_,i)=>({at:3.2+i*6.5,w:5.3,y0:5,y1:7.9}))]});
  wall(22,11.5,70.56,11.5,0,8,{openings:[...Array.from({length:7},(_,i)=>({at:3.2+i*6.5,w:5.3,y0:0,y1:4.1})),...Array.from({length:7},(_,i)=>({at:3.2+i*6.5,w:5.3,y0:5,y1:7.9}))]});
  // Wafille's photographer faces a left-hand counter and a mint banquette along
  // the right wall. Fit the two-table vignette in a shallow bay clear of JF1.
  const cafe=rect(22.55,-2.44,27.85,.10);
  K.slab(cafe,.012,{mat:{tex:'wood',color:0xb29173},thick:.085});
  K.slab(cafe,3.33,{mat:cream,under:cream,walk:false,thick:.09});
  wall(22.55,-2.44,27.85,-2.44,.012,3.33,{mat:0x705442});
  wall(27.85,-2.44,27.85,0,.012,3.33,{mat:0x705442});
  wall(22.55,0,22.55,-2.44,.012,3.33,{mat:0x9dc0b7});
  B(22.695,-1.2,.83,.043,2.4,.49,'famille-mint-tiles');
  B(22.695,-1.2,1.32,.043,2.4,1.92,'famille-gingham');
  B(25.2,-2.31,2.65,5.12,.06,.61,'famille-gingham');
  K.zone({name:'와필레',floor:'1F',sub:'파미에스테이션 · 디저트 카페',poly:cafe,y0:0,y1:3.3,priority:21});
  // North shops remain shallow window displays at the shared JW boundary, not new interior claims.
  for(let u=38.5;u<69;u+=6.5){
    B(u,-.13,0,5.25,.10,4.1,0x272620);
    if(u>58) B(u,11.62,0,5.25,.10,4.1,0x302c26);
  }
  for(const u of [38.2,44.7,51.2,57.7]){
    K.slab(rect(u-2.7,11.4,u+2.7,14.6),0,{mat:tile,thick:.16});
    wall(u-2.7,14.6,u+2.7,14.6,0,4.1,{mat:0x856650});
    wall(u-2.7,11.5,u-2.7,14.6,0,4.1);
    K.slab(rect(u-2.7,11.4,u+2.7,14.6),4.1,{mat:cream,thick:.14});
  }
  B(31.7,-.13,0,5.3,.12,4.1,0x302c26,true);
  // The operator photograph shows rectangular casements across from the fanlights.
  // IDBR's gallery photograph places the Wafille sign on the arched side.
  const diningBays=[38.2,44.7,51.2,57.7];
  const diningPiers=[35.3,41.8,48.3,54.8,61.3];
  galleryShopfronts(K,P,R,diningBays,diningPiers);
  // Continuous cream cornices, matching the retained gallery's brick-pier / fanlight grammar.
  for(const v of [0,11.5])for(const[y,h,d]of [[4.45,.18,.44],[4.66,.14,.6],[7.8,.2,.46]]){
    const strips=v===11.5&&y<7?[[22,35.3],[61.3,70.56]]:[[22,70.56]];
    for(const [a,b] of strips)B((a+b)/2,v,y,b-a,d,h,cream);
  }
  for(const v of [0,20])for(const[y,h,d]of [[4.7,.16,.48],[4.88,.13,.62],[9.2,.18,.5]])B(13,v,y,18,d,h,cream);
  for(const[y,h,w]of [[4.7,.16,.48],[4.88,.13,.62],[9.2,.18,.5]])B(4,10,y,w,20,h,cream);
  // The gallery is a full-width white barrel vault, with glazing only in the central crown strip.
  const roof=(u0,u1)=>{
    for(let i=0;i<32;i++){
      const a=i*PI/32,b=(i+1)*PI/32,v0=5.75-5.75*Math.cos(a),v1=5.75-5.75*Math.cos(b),y0=8+3*Math.sin(a),y1=8+3*Math.sin(b);
      if(v0>=3.2&&v1<=8.3)continue; // Central rooflight and glazing bars belong to the native bay.
      K.quad(0xf1eee5,[xyz([u0,v0,y0]),xyz([u1,v0,y0]),xyz([u1,v1,y1]),xyz([u0,v1,y1])],[0,-1,0]);
      K.quad(0xe3e0d6,[xyz([u0,v0,y0+.1]),xyz([u1,v0,y0+.1]),xyz([u1,v1,y1+.1]),xyz([u0,v1,y1+.1])],[0,1,0]);
    }
    const spans=[];
    for(let u=u0;u<=u1+.01;u+=6.5) {
      const [x,z]=P(u,5.75); spans.push([x,8,z,R,Math.min(1,(u1-u)/6.5)]);
    }
    placeArchitecture(K,galleryRib,'파미에 갤러리 아치와 벽등',spans,{skylight:true});
  };roof(22,70.56);
  // Hall north shares the white vault; the escalator bay has the photographed luminous black-grid ceiling.
  // The electric-light volume follows these undersides through the double-height hall.
  const ceilingPanel=(u,v,y,w,d,h,mat)=>{
    const outline=B(u,v,y,w,d,h,mat);
    K.phys.addCeiling(outline,y);
  };
  for(let v=0;v<8;v+=.5){const y=9.8+.55*Math.sin(v*PI/8);ceilingPanel(13,v+.25,y,18,.53,.12,0xeeeae0);}
  for(let u=4;u<22;u+=3)for(let v=8;v<20;v+=2){ceilingPanel(u+1.5,v+1,9.85,2.92,1.92,.1,{tex:'emit',color:0xf2eddf});}
  for(let u=4;u<=22;u+=3)ceilingPanel(u,14,9.7,.13,12,.25,iron);
  for(let v=8;v<=20;v+=2)ceilingPanel(13,v,9.7,18,.13,.25,iron);
  // Architectural columns are solid in the permanent build and clear of every passage.
  for(const[u,v]of [[4,0],[4,3.7],[4,10.7],[4,17.7],[22,0],[22,11.5],[22,20],[4,20]]){
    const corner=u===4&&v===20;
    B(u,v,0,1.05,1.05,corner?4.7:9.3,brick,true);B(u,v,0,1.15,1.15,.3,cream);B(u,v,4.45,1.25,1.25,.45,cream);
    if(corner)B(u,v+.85,5,1.05,1.05,4.3,brick,true);
    B(u,v+(corner?.85:0),9.1,1.3,1.3,.22,cream);
  }
  for(const u of [28.8,...diningPiers,67.8])for(const v of [0,11.5]){
    B(u,v,0,.8,.65,8,brick,true);
    if(v===11.5&&diningPiers.includes(u))continue;
    B(u,v,0,1,.85,.23,cream);
    B(u,v,4.45,1.1,.9,.42,cream);
  }
  K.zone({name:'파미에스테이션',floor:'1F',sub:'벽돌 홀 · 하우스 오브 신세계 · JAJU · 아그라',poly:hall,y0:0,y1:4.8,priority:18});
  K.zone({name:'파미에스테이션',floor:'1F',sub:'유리 천창 갤러리 · 와필레',poly:gallery,y0:0,y1:8,priority:18});
  {const[x,z]=P(15,4);K.spawn({name:'파미에 1층 벽돌 홀',x,z,y:0,yaw:20*PI/180,group:'파미에스테이션'});}
  // Semicircular glass fanlight with three cream moulding courses, black fan muntins and plinth.
  const fan=(u,v,width,face='v')=>{
    const rad=width/2,base=5.05,ht=2.65;
    // Thin brick spandrels above the curved opening keep the arch silhouette exact.
    for(let i=0;i<28;i++){const a=-rad+width*i/28,b=-rad+width*(i+1)/28,ya=base+ht*Math.sqrt(Math.max(0,1-(a/rad)**2)),yb=base+ht*Math.sqrt(Math.max(0,1-(b/rad)**2));const q=(x,y)=>face==='u'?[u,v+x,y]:[u+x,v,y];K.quad(brick,[xyz(q(a,ya)),xyz(q(b,yb)),xyz(q(b,8.7)),xyz(q(a,8.7))],face==='u'?[-C,0,S]:v>5?[-S,0,-C]:[S,0,C]);}
    const pt=(a,y)=>face==='u'?[u,v+a,y]:[u+a,v,y];
    for(let i=0;i<24;i++){
      const a=i*PI/24,b=(i+1)*PI/24;
      K.quad('glass',[xyz(pt(0,base)),xyz(pt(rad*Math.cos(a),base+ht*Math.sin(a))),xyz(pt(rad*Math.cos(b),base+ht*Math.sin(b))),xyz(pt(0,base))],face==='u'?[-C,0,S]:v>5?[-S,0,-C]:[S,0,C]);
      for(let n=0;n<3;n++)beam(pt((rad+.10+n*.13)*Math.cos(a),base+(ht+.10+n*.13)*Math.sin(a)),pt((rad+.10+n*.13)*Math.cos(b),base+(ht+.10+n*.13)*Math.sin(b)),.12,cream);
    }
    beam(pt(-rad-.4,base-.05),pt(rad+.4,base-.05),.20,cream);
    for(const a of [PI/6,PI/3,PI/2,2*PI/3,5*PI/6])beam(pt(0,base),pt(rad*Math.cos(a),base+ht*Math.sin(a)),.065,iron);
  };
  // The long gallery's pairs of fanlights enter view progressively along the walk.
  for (let bay=0; bay<7; bay+=2) {
    const first=25.2+bay*6.5, last=25.2+Math.min(bay+1,6)*6.5;
    K.detail({name:'파미에 갤러리 반원창',floor:'1F',y0:0,y1:10,poly:rect(first-3,0,last+3,11.5)},()=>{
      for(let u=first;u<=last+.01;u+=6.5){
        fan(u,.18,5.25);
        if(!diningBays.includes(u))fan(u,11.32,5.25);
      }
    });
  }
  K.detail({name:'파미에 벽돌 홀 · 유리 천창 갤러리',floor:'1F',y0:0,y1:11,poly:[P(4,0),P(70.56,0),P(70.56,11.5),P(22,11.5),P(22,20),P(4,20)]},()=>{
    fan(4.2,7.2,5.5,'u');fan(4.2,14.2,5.5,'u');
    // Lower fascia and transom follow the brick bays; unnamed units receive no invented brand.
    for(let u=25.2;u<69;u+=6.5)for(const v of [.12,11.38]){
      if(v===11.38&&diningBays.includes(u))continue;
      B(u,v,3.3,5.5,.17,.65,0x151514);
      B(u,v,4.02,5.5,.13,.35,'glass');
    }
    for(const v of [7.2,14.2]){B(4.15,v,3.35,.20,5.8,.7,0x101217);B(4.15,v,4.1,.18,5.8,.42,'glass');}
    sign('JAJU',4.32,7.2,3.67,3.2,.48,'u',{fg:'#f7ffff'});sign('Agra',4.32,14.2,3.67,3.0,.48,'u',{fg:'#acdcff'});
    sign('Wafille',25.2,.27,3.62,3.0,.43,'v',{fg:'#b4e1ff'});
    // HOS facade uses central black entrance and brass grilles on both sides, never a door blocker.
    const hu=10.15;
    for(const u of [hu-4.12,hu+4.12])B(u,.12,0,.20,.24,4.45,brass);
    B(hu,.12,4.25,8.45,.24,.20,brass);
    for(const u of [hu-3.05,hu+3.05]){
      B(u,.1,0,2.0,.07,4.2,{tex:'glass',color:0x796c4b});
      for(let t=-.9;t<=.91;t+=.3)B(u+t,.22,0,.028,.055,4.2,brass);
      for(let y=.2;y<4.2;y+=.36)B(u,.23,y,2,.055,.025,brass);
    }
    sign('HOUSE OF SHINSEGAE',hu,.32,5.7,9.0,.5,'v',{fg:'#cfcac0',bold:false});
    // Unknown dark, brass-grille shop is directly west of the HOS entrance, as in #266/#275.
    B(18.3,-.06,0,5.7,.13,3.85,0x1e201d);B(18.3,.10,3.35,5.8,.12,.5,0x191b19);
    for(let u=15.6;u<21;u+=.4)B(u,.19,0,.035,.055,3.3,brass);
    for(let y=.25;y<3.3;y+=.38)B(18.3,.20,y,5.5,.055,.035,brass);
    dome(18.3,.25,2.6,.24,.24,.04,{tex:'emit',color:0x527eaa});
    // Agra's white arch and open French doors preserve the walkable entrance.
    const av=14.2;for(let i=0;i<20;i++){const a=i*PI/20,b=(i+1)*PI/20;beam([4.35,av+2.7*Math.cos(a),2.0+1.3*Math.sin(a)],[4.35,av+2.7*Math.cos(b),2.0+1.3*Math.sin(b)],.19,0xeee8df);}
    for(const v of [av-2.5,av+2.5]){
      B(4.32,v,0,.12,.12,2.4,0xf3eee4);
      B(3.8,v,0,1.05,.07,2.3,'glass');
      for(const u of [3.3,4.3])B(u,v,0,.05,.09,2.35,0xf2eee5);
      for(const y of [.05,.35,2.3])B(3.8,v,y,1.05,.10,.055,0xf2eee5);
    }
    B(5.0,av-2.4,0,.38,.38,.16,iron);B(5.0,av-2.4,.15,.16,.16,1.0,iron);sign('메뉴 · 대기 등록',5.05,av-2.4,1.3,.5,.38,'u',{bg:'#293e63',fg:'#d7eaff'});
    // JAJU entrance security gates and round homeware display tables.
    for(const v of [5.0,9.4]){B(3.8,v,0,.30,.15,1.4,0xa9aaa4);B(3.8,v,.15,.16,.07,1.1,'glass');}
    for(const[u,v,r]of [[1.5,7.2,.9],[0,5.5,.65],[0,8.8,.65]]){
      cyl(u,v,0,r,.12,0xe4dfcf);cyl(u,v,.12,.12,.65,0x8f8a7c);cyl(u,v,.77,r,.08,0xece6d7);
      for(let n=0;n<8;n++){const a=n*PI/4;cyl(u+Math.cos(a)*r*.6,v+Math.sin(a)*r*.6,.86,.10,.18,[0xebdfc8,0xa7ac9d,0xddd5c6][n%3]);}
    }
    for(let v=4.4;v<10;v+=1){B(-.65,v,.15,.4,.75,2.3,0xdfd7c8);for(const y of [.6,1.2,1.8]){B(-.4,v,y,.55,.8,.055,0xf0e9d9);for(let j=0;j<4;j++)B(-.35,v-.27+j*.18,y+.06,.18,.12,.22,[0xb5a68c,0xc4d0c3,0xd8cfbf][j%3]);}}
    // Dining set ported from r19: table, four legs, seats, crockery and a menu card.
    const dining=(u,v)=>{
      B(u,v,.72,.78,.78,.06,{color:0xe4d3b3,gloss:.3});
      for(const a of [-.29,.29])for(const b of [-.29,.29])B(u+a,v+b,0,.045,.045,.72,iron);
      for(const d of [-.64,.64]){B(u,v+d,.43,.44,.44,.08,0x6b5845);B(u,v+d+Math.sign(d)*.2,.5,.44,.06,.42,0x6b5845);for(const a of [-.16,.16])for(const b of [-.16,.16])B(u+a,v+d+b,0,.035,.035,.43,iron);cyl(u,v+Math.sign(d)*.22,.79,.13,.018,0xf2e8d7);cyl(u+.2,v+Math.sign(d)*.22,.79,.045,.12,0xe8dfc9);}
      B(u,v,.79,.04,.22,.22,0x2b3338);
    };
    dining(.7,12.2);dining(.7,15.7);dining(2.6,15.7);
    // Restaurant bays face the walk from JAJU to the Honam turn.
    for (const u of [38.2,44.7,51.2,57.7]) {
      B(u,13.96,.08,4.9,.44,.83,0x795741);
      B(u,13.92,.91,5.05,.56,.08,cream);
      B(u,14.4,1.6,1.48,.1,.8,'famille-ebt-menu');
      dining(u-1.15,9.15);
      dining(u+1.15,9.15);
    }
    // The ceiling strip, menu and side seating face the gallery in the operator's storefront photograph.
    const fixtureMat=new K.THREE.MeshLambertMaterial({vertexColors:true});
    function mountFixture(key,u,v,y){
      const source=galleryFixtures.getObjectByName(key), mesh=new K.THREE.Mesh(source.geometry,fixtureMat);
      const [x,z]=P(u,v);
      mesh.name=key;
      mesh.position.set(x,y,z);
      mesh.rotation.y=R;
      K.addMesh(mesh);
    }
    mountFixture('Wafille',25.2,0,.013);
    // Collision silhouettes follow the visible counter, bench and two tables.
    B(26.34,-.55,.012,2.40,.76,.97,0xb0d7cc,true);
    B(22.88,-.84,.012,.41,2.60,.38,0x7a503b,true);
    for(const v of [-.03,-1.32]) B(23.50,v,.67,.70,.71,.06,0xb0d7cc,true);
    B(27.09,-.52,1.1,.54,.48,.38,'glass');
    B(27.48,.02,.03,.60,.10,2.94,0x392f2a);
    B(27.48,.086,1.20,.47,.01,.76,'famille-ebt-menu');
    B(24.64,-2.285,1.70,3.75,.10,.68,0x463a32);
    for(let n=0;n<10;n++) B(23.04+n*.35,-2.205,1.78,.27,.09,.30, n%2?0xddd7c7:0xc5c7b3);
    for(const u of [23.66,25.05,26.44]) B(u,-1.14,3.205,1.0,.65,.05,{tex:'emit',color:0xffefda});
    mountFixture('GalleryClock',41.80,1.15,3.47);
    B(35.30,.37,2.32,.78,.062,.25,0x4c4237);
    sign('FAMILLE STATION',35.30,.411,2.445,.70,.11,'v',{fg:'#ded1b3',pxPerM:180});
    // Light architectural trim remains detailed: dentils, sconce stems, globes and leaf clusters.
    const plant=(u,v,h=3.5)=>{
      cyl(u,v,0,.54,.52,0xece9df);cyl(u,v,.52,.47,.08,0x756e56);cyl(u,v,.57,.075,h-.9,0x69553a);
      for(let i=0;i<12;i++){const a=i*2.4,yy=1.05+(i%4)*.55,rr=.35+(i%3)*.13;dome(u+Math.cos(a)*rr,v+Math.sin(a)*rr,yy,.35,.26,.28,[0x38543c,0x4c6545,0x657851][i%3]);}
    };
    const lamp=(u,v)=>{cyl(u,v,0,.20,.12,iron);cyl(u,v,.12,.07,2.65,iron);dome(u,v,2.9,.23,.23,.23,{tex:'emit',color:0xffedbc});for(let i=0;i<16;i++){const a=i*2*PI/16,b=(i+1)*2*PI/16;beam([u+.32*Math.cos(a),v,2.9+.38*Math.sin(a)],[u+.32*Math.cos(b),v,2.9+.38*Math.sin(b)],.035,iron);}cyl(u,v,3.31,.15,.05,iron);};
    for(const q of [[7,2.0],[14.6,2.2],[5.7,10.6],[5.8,17.5],[20.6,10.0]])plant(...q);
    for(const q of [[6.5,2.2],[14.8,2.2],[19.2,5.3],[6,18.1]])lamp(...q);
    for(let u=44.4;u<68;u+=13)plant(u,9.5,4.1);
    for(let u=4.5;u<22;u+=.65){B(u,.32,9.35,.20,.43,.4,cream);B(u,19.66,9.35,.20,.43,.4,cream);}
    for(let v=.5;v<20;v+=.65)B(4.34,v,9.35,.43,.20,.4,cream);
    for(let u=28.8;u<70;u+=6.5)for(const v of [.50,11]){
      beam([u,v,5.1],[u,v,5.8],.04,iron);beam([u,v,5.8],[u+.25,v,6.0],.04,iron);dome(u+.25,v,5.7,.17,.10,.17,{tex:'emit',color:0xfff4d8});
    }
    // Floor banding is flush, so no invented steps enter the approved walk.
    for(const v of [1.1,10.4])B(46.3,v,.006,48.5,.30,.008,0xa39b8e);
    for(let u=22;u<70;u+=6.5)B(u,5.75,.007,.32,11.5,.008,0xa39b8e);
    const du=15.7,dv=10.1;B(du,dv,0,.55,.5,2.7,0x24221f);sign(['↑ 2층 식당가 · 뷰티살롱','차알 · 무월식탁 · 매우매오','ebt PIZZA · KERVAN','BEAN BROTHERS · halff coffee'],du,dv+.29,1.68,.47,1.65,'v',{fg:'#eae2cd',bg:'#24221f'});
    // Population follows walls and shop recesses, leaving central route and escalator landings clear.
    for(const[u,v,shirt]of [[1,9,0xd6d0c3],[1,13,0x2d3332],[16.7,2.4,0xa89f8a],[26.5,2.3,0xb5a38c],[34.3,3.1,0x444943],[43,8.3,0xa58a77],[55,3.1,0x393d43],[64,8,0xc3b79e]]){const[x,z]=P(u,v);K.person(x,0,z,{shirt,rotY:R-PI/2});}
  });
}
