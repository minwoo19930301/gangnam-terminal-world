import { JUNCTIONS, WELLS } from './_junctions.js';

export const meta = {
  id: 'station', name: '고속터미널역 · 3·7·9호선', claims: [],
  sources: [
    'https://mediahub.seoul.go.kr/archives/2016717',
    'https://mediahub.seoul.go.kr/archives/162098',
    'https://mediahub.seoul.go.kr/archives/1139258',
    'https://itwiki.kr/w/고속터미널역',
    'https://www.ssyenc.com/upload/brochure/478dee260676480b9f7e26b0eb55d7d0.pdf',
  ],
};

// Reconstruction assumptions: B1 is the contract's public connection mezzanine;
// the real Line 7 fare concourse is also represented at B2 (Seoul, 2026-01-09).
// B4=-21 follows the shared world, not the approximately 30 m real Line 9 depth.
// Unsurveyed passage alignments, exit stair orientations and platform lengths are
// inferred. Line 3's 200 m hall extends the brief's schematic central segment to
// accommodate ten 19 m cars. Line 9 uses six cars; no speculative eight-car train.
// All retail destinations are directions to researched neighbours, not invented
// tenants inside the station. No claimed building or other module is modified.
// Entrance paving, furniture and information kiosks are inferred streetscape;
// the station remains entirely underground. The unsurveyed 3↔9 stair bay is
// south of the Line 9 platform envelope so no stair skirt occupies its aisle.
export function build(K) {
  const { B1, B2, B3, B4 } = K.LEVELS;
  const C = { 3: 0xef7c1c, 7: 0x747f00, 9: 0xbdb092 };
  const CSS = { 3: '#ef7c1c', 7: '#747f00', 9: '#a89b78' };
  const rect = (x0, z0, x1, z1) => [[x0,z0],[x1,z0],[x1,z1],[x0,z1]];
  const box = o => K.box({ solid: false, ...o });
  const paint = (color) => ({ tex: 'emit', color });
  const sign = (text, x, y, z, w, h, rotY=0, bg='#172532', fg='#ffffff') => {
    // A centered backing avoids the kit's rotated/two-sided box hiding letters.
    box({x,y:y-h/2-.02,z,w:w+.06,h:h+.04,d:.09,rotY,mat:0x172532});
    K.sign(text, {x,y,z,w,h,rotY,bg,fg:['#e9e8df','#e8e6dc'].includes(bg)?'#243742':fg,twoSided:true,offset:.07});
  };

  K.texture('station-ceramic', 512, 512, (g,w,h) => {
    g.fillStyle='#dddcd3'; g.fillRect(0,0,w,h);
    for(let row=0;row<8;row++) for(let col=0;col<4;col++) {
      g.fillStyle=['#f0eee5','#e6e4dc','#eae8df'][(row+col)%3];
      g.fillRect(col*128+2,row*64+2,124,60);
      g.fillStyle='#ffffff'; g.fillRect(col*128+3,row*64+3,122,1);
    }
  }, [2.4,2.4]);
  K.texture('station-granite', 512, 512, (g,w,h) => {
    g.fillStyle='#bdc3c2'; g.fillRect(0,0,w,h);
    const r=K.rand(339734);
    for(let i=0;i<6000;i++) { g.fillStyle=i%2?'#9da7a8':'#d8dcda'; g.fillRect(r()*w,r()*h,1.3,1.3); }
    g.strokeStyle='#858f92'; g.lineWidth=2;
    for(let i=0;i<=4;i++){g.beginPath();g.moveTo(i*128,0);g.lineTo(i*128,512);g.stroke();g.beginPath();g.moveTo(0,i*128);g.lineTo(512,i*128);g.stroke();}
  }, [2.4,2.4]);
  K.texture('station-tactile', 128, 128, (g,w,h) => {
    g.fillStyle='#e2bc46';g.fillRect(0,0,w,h);
    for(let i=0;i<5;i++) for(let j=0;j<5;j++) {g.fillStyle='#a78322';g.beginPath();g.arc(12+i*25,12+j*25,4,0,Math.PI*2);g.fill();g.fillStyle='#f6d66c';g.beginPath();g.arc(11+i*25,10+j*25,3,0,Math.PI*2);g.fill();}
  },[0.6,0.6]);
  K.texture('station-ribbed',128,128,(g,w,h)=>{
    g.fillStyle='#bcc3c5';g.fillRect(0,0,w,h);for(let x=0;x<w;x+=8){g.fillStyle='#7d878c';g.fillRect(x,0,2,h);g.fillStyle='#e3e7e8';g.fillRect(x+3,0,1,h);}
  },[1.2,1.2]);

  // An arc-length frame keeps curved platforms, rails, doors and cars aligned.
  function frame(points) {
    const lengths=[0]; for(let i=1;i<points.length;i++) lengths.push(lengths[i-1]+Math.hypot(points[i][0]-points[i-1][0],points[i][1]-points[i-1][1]));
    const length=lengths.at(-1);
    function at(s,v=0) {
      let i=0; while(i<points.length-2 && lengths[i+1]<s) i++;
      const a=points[i],b=points[i+1],l=lengths[i+1]-lengths[i],u=(s-lengths[i])/l;
      const ux=(b[0]-a[0])/l,uz=(b[1]-a[1])/l,nx=-uz,nz=ux;
      return {x:a[0]+(b[0]-a[0])*u+nx*v,z:a[1]+(b[1]-a[1])*u+nz*v,ux,uz,nx,nz,rot:Math.atan2(ux,uz)};
    }
    const edge = v => points.map((p,i)=>{
      const a=at(Math.max(0,lengths[i]-.01),v),b=at(Math.min(length,lengths[i]+.01),v);
      // Miter joins; adjacent segments share exact coordinates and slab edges.
      if(!i||i===points.length-1)return [b.x,b.z];
      const p0=at(lengths[i]-.01),p1=at(lengths[i]+.01);
      const nx=p0.nx+p1.nx,nz=p0.nz+p1.nz,d=nx*p1.nx+nz*p1.nz;
      return [p[0]+v*nx/d,p[1]+v*nz/d];
    });
    const poly=(a,b)=>[...edge(a),...edge(b).reverse()];
    return {at,length,poly,edge,points,lengths};
  }
  function localBox(f,s,v,y,w,h,d,mat,solid=false) {
    const p=f.at(s,v);box({x:p.x,z:p.z,y,w,h,d,rotY:p.rot,mat,solid});
  }
  function localSign(f,s,v,y,text,w=5,h=.65,along=false,bg='#172532') {
    const p=f.at(s,v);sign(text,p.x,y,p.z,w,h,p.rot+(along?Math.PI/2:0),bg);
  }
  function localSlab(f,s0,s1,v0,v1,y,mat='station-granite') {
    const p=[f.at(s0,v0),f.at(s1,v0),f.at(s1,v1),f.at(s0,v1)].map(p=>[p.x,p.z]);
    K.slab(p,y,{mat});return p;
  }
  // Clip rectangular voids even where they meet an irregular hall boundary.
  // This prevents a partly-outside hole from invalidating Earcut's floor.
  function split(poly,axis,value,greater) {
    const out=[];
    for(let i=0;i<poly.length;i++) {
      const a=poly[i],b=poly[(i+1)%poly.length],aa=greater?a[axis]>=value:a[axis]<=value,bb=greater?b[axis]>=value:b[axis]<=value;
      if(aa)out.push(a);
      if(aa!==bb){const t=(value-a[axis])/(b[axis]-a[axis]);out.push([a[0]+t*(b[0]-a[0]),a[1]+t*(b[1]-a[1])]);}
    }return out;
  }
  function cutSlab(poly,y,holes=[],opts={}) {
    let pieces=[poly];
    for(const r of holes) {
      const next=[];
      for(const p of pieces) {
        let inside=p;
        for(const [axis,value,keepGreater] of [[0,r[0],true],[0,r[2],false],[1,r[1],true],[1,r[3],false]]) {
          if(inside.length<3)break;
          const outside=split(inside,axis,value,!keepGreater);
          if(outside.length>=3&&Math.abs(K.polyArea(outside))>.001)next.push(outside);
          inside=split(inside,axis,value,keepGreater);
        }
      }pieces=next;
    }
    for(const p of pieces)K.slab(p,y,{mat:'station-granite',...opts});
  }
  function lineWall(f,v,y,h,openings=[]) {
    const e=f.edge(v);
    for(let i=0;i<e.length-1;i++) {
      const a=e[i],b=e[i+1],len=Math.hypot(b[0]-a[0],b[1]-a[1]);
      const ops=[];
      for(const o of openings){
        const t=((o.x-a[0])*(b[0]-a[0])+(o.z-a[1])*(b[1]-a[1]))/(len*len);
        const dist=Math.hypot(a[0]+t*(b[0]-a[0])-o.x,a[1]+t*(b[1]-a[1])-o.z);
        if(t>=-.05&&t<=1.05&&dist<o.w)ops.push({at:t*len,w:o.w,y0:y,y1:y+(o.full?h:3.2)});
      }
      K.wall(...a,...b,y,y+h,{mat:'station-ceramic',thick:.18,openings:ops});
    }
  }
  function strip(f,s,v,y,w,len,mat){localBox(f,s,v,y,w,.018,len,mat);}
  function light(f,s,v,y,length=3){localBox(f,s,v,y,.38,.075,length,paint(0xf8f3dc));}
  function beam(a,b,r,mat=0x9ba7ad,seg=8) {
    const dx=b[0]-a[0],dy=b[1]-a[1],dz=b[2]-a[2],l=Math.hypot(dx,dy,dz),u=[dx/l,dy/l,dz/l];
    let v=Math.abs(u[1])<.95?[u[2],0,-u[0]]:[1,0,0];const vl=Math.hypot(...v);v=v.map(n=>n/vl);
    const w=[u[1]*v[2]-u[2]*v[1],u[2]*v[0]-u[0]*v[2],u[0]*v[1]-u[1]*v[0]];
    const p=(q,t)=>q.map((c,j)=>c+r*(v[j]*Math.cos(t)+w[j]*Math.sin(t)));
    for(let i=0;i<seg;i++){const t=i/seg*Math.PI*2,tt=(i+1)/seg*Math.PI*2,n=v.map((c,j)=>c*Math.cos((t+tt)/2)+w[j]*Math.sin((t+tt)/2));K.quad(mat,[p(a,t),p(b,t),p(b,tt),p(a,tt)],n);}
  }
  function bench(f,s,v,y) {
    localBox(f,s,v,y+.42,.65,.11,3.5,'metal',true);
    localBox(f,s,v+.28,y+.55,.09,.55,3.5,0x8d9ca3);
    for(const q of [-1.3,1.3])localBox(f,s+q,v,y,.38,.42,.12,0x394951);
    for(let q=-1.4;q<1.5;q+=.7)localBox(f,s+q,v,y+.54,.62,.025,.035,0x5e6b70);
  }
  function facilities(f,s,v,y) {
    localBox(f,s,v,y,.65,1.35,.7,0xdadbce,true);
    localSign(f,s,v-.36,y+1,'비상통화',.6,.25,true,'#a62f23');
    localBox(f,s+1.4,v,y,.7,1.7,.9,0xb33025,true);
    localSign(f,s+1.4,v-.46,y+1.1,['소화전','비상용'],.65,.48,true,'#ad332a');
  }
  function gates(f,s,y,n=7) {
    for(let i=0;i<n;i++){
      const v=(i-(n-1)/2)*1.4;
      localBox(f,s,v,y,.38,.95,1.65,'metal',true);
      localBox(f,s+.44,v,y+.98,.25,.09,.3,0x182c32);
      localBox(f,s+.62,v,y+.72,.18,.12,.06,paint(0x79d6a1));
      localBox(f,s-.05,v+.35,y+.48,.28,.26,.08,'glass');
    }
    localSign(f,s,0,y+2.8,'타는 곳  ↓     교통카드를 대 주세요',9,.65);
  }
  function ticketBank(f,s,v,y) {
    for(let i=0;i<4;i++){
      const p=f.at(s+i*1.35,v);
      localBox(f,s+i*1.35,v,y,1,1.85,.85,i<2?0x79898e:0xc0bcb1,true);
      localBox(f,s+i*1.35,v-.44,y+.9,.035,.6,.8,0x142831);
      localSign(f,s+i*1.35,v-.46,y+1.29,i<2?'승차권 발매':'교통카드 충전',.78,.3,true,'#194c60');
      localSign(f,s+i*1.35,v-.47,y+.74,'현금 · 카드',.7,.16,true,'#e8e6dc');
      box({x:p.x,y:y+1.84,z:p.z,w:.8,h:.025,d:.6,mat:paint(0xeee9dc)});
    }
    localSign(f,s+2,v-.5,y+2.35,'승차권 발매 · 교통카드 충전',5.8,.45,true);
  }
  function room(f,s,v,y,label) {
    const p=f.at(s,v),q=f.at(s,v+1.65),r=f.at(s,v-1.65);
    localBox(f,s,v,y,3.1,2.9,7,'station-ceramic',true);
    // Recessed service frontage; booths themselves are not a circulation route.
    localBox(f,s,v-1.57,y+.92,.04,1.25,5.7,'glass');
    localSign(f,s,v-1.63,y+2.45,label,5.8,.5,true);
    localBox(f,s,v-1.68,y+.87,.45,.13,5.8,0x535d5d);
  }
  function hall(points,width,y,opts={}) {
    const f=frame(points),poly=f.poly(-width/2,width/2),holes=opts.holes||[];
    cutSlab(poly,y,holes);
    // A thin finish at shared floor joints avoids coplanar neighbour tiles;
    // the registered walking surface stays exactly on the shared level.
    if(opts.jointFinish)K.hpoly('station-granite',poly,y+.02,true,holes.map(r=>rect(...r)));
    cutSlab(poly,y+(opts.h||4.7),opts.roofHoles||[],{mat:'concrete',under:'ceiling',walk:false});
    lineWall(f,-width/2,y,opts.h||4.7,opts.openings||[]);lineWall(f,width/2,y,opts.h||4.7,opts.openings||[]);
    for(let s=4;s<f.length-3;s+=6){light(f,s,-width*.26,y+3.65,3.4);light(f,s,width*.26,y+3.65,3.4);strip(f,s,0,y+.012,.42,6,'station-tactile');}
    for(let s=9;s<f.length-3;s+=22){localSign(f,s,0,y+2.85,opts.label||'3·7·9호선  환승 →',Math.min(width-1,8),.64);}
    if(opts.floor)K.zone({name:opts.name||'고속터미널역',floor:opts.floor,sub:opts.sub||opts.label,poly,y0:y,y1:y+4.8});
    return f;
  }

  // Public B1 band stays outside the hotel and skirts the north of the rotunda.
  const b1Path=[[45,150],[-45,186],[-68,195],[-88,220],[-175,262]];
  const b1Voids=[[17,145,25,163],[-126,235,-118,251]];
  const exitSpecs=[
    ['2',55.11,124.19,0,1, [45,150],'경부선 · 신세계백화점'],
    ['7',37.5,131.19,0,1,[37,153],'JW메리어트 · 센트럴시티'],
    ['3',52.11,179.03,0,-1,[45,153],'파미에스테이션 · 센트럴시티'],
    ['4',-130.48,250.07,-.89,.455,[-148,248],'국립중앙도서관 · 누에다리'],
    ['5',-185.64,276.89,.89,-.455,[-174,261],'서래마을 방면'],
    ['6',-195.26,261.52,.89,-.455,[-173,255],'반포대로 방면'],
  ];
  // the concourse's north wall borders 파미에스테이션 B1 (센트럴시티): two open fronts into the food street
  const publicOpen=[{x:-42.6,z:177.2,w:8},{x:-61.3,z:184.4,w:8},{x:-133,z:249,w:12},{x:-45,z:191,w:12},{x:20,z:156,w:13},{x:-122,z:242,w:13},...exitSpecs.map(e=>({x:e[5][0],z:e[5][1],w:14}))];
  const b1=hall(b1Path,14,B1,{floor:'B1',name:'고속터미널역 연결 대합실',sub:'2~7번 출구 · 파미에스테이션 · 센트럴시티 · 신세계',label:'2–7 출구  |  센트럴시티 · 신세계 · JW메리어트',holes:b1Voids,openings:publicOpen});
  // bridge the seam between this concourse and the 파미에스테이션 B1 floor at the two open fronts
  // (slightly raised finish so it does not z-fight either floor; ceiling strip closes the slot above)
  for(const q of [[-42.6,177.2],[-61.3,184.4]]){const ux=.9314,uz=-.3639,nx=-uz,nz=ux;const Q=(a,b)=>[q[0]+ux*a+nx*b,q[1]+uz*a+nz*b];const r=[Q(-4.3,-2.2),Q(4.3,-2.2),Q(4.3,2.2),Q(-4.3,2.2)];K.slab(r,B1+.015,{mat:'station-granite',thick:.05,under:false,edge:false,ceil:false});K.hpoly('ceiling',r,B1+4.69,false);}
  for(let s=15;s<b1.length-5;s+=18){const p=b1.at(s,5.7);K.cyl({x:p.x,z:p.z,y:B1,r:.36,h:4.45,mat:'station-ceramic'});localSign(b1,s,5.2,B1+1.8,'고속터미널',1.1,.3,true);}
  ticketBank(b1,29,5.7,B1);room(b1,62,5.7,B1,'역무실 · 고객안내');
  localSign(b1,101,0,B1+2.7,'파미에스테이션  ↑    3번 출구',9,.65);
  for(const s of [10,83,180])bench(b1,s,-5.5,B1);
  for(let i=0;i<20;i++){const p=b1.at(8+i*11,(i%3-1)*2.2);K.person(p.x,B1,p.z,{shirt:[0x313e50,0xb3936d,0x575c46][i%3]});}

  const j=JUNCTIONS.find(j=>j.id==='J7');
  const jhall=hall([[-45,186],j.pa,[j.pb[0],j.pb[1]+.5]],j.width,B1,{label:'파미에스테이션  ↑',jointFinish:true,openings:[{x:-45,z:191,w:10}]});
  // Floor continues to pb; the neighbour owns its rotunda wall opening.
  sign('파미에스테이션 · 센트럴시티',-45,B1+2.7,200,7.7,.75,Math.PI,'#373b32');

  function exit(e) {
    const [number,x,z,ux,uz,target,dest]=e,rot=Math.atan2(ux,uz),nx=-uz,nz=ux;
    const P=(s,v)=>[x+ux*s+nx*v,z+uz*s+nz*v];
    const poly=[P(-.1,-2.8),P(15,-2.8),P(15,2.8),P(-.1,2.8)];
    K.groundHole(poly);
    const a=P(0,-1.25),b=P(14,-1.25),c=P(0,1.2),d=P(14,1.2);
    K.stairs(...a,...b,{ya:0,yb:B1,w:2.5,mat:'darkstone'});
    K.escalator(...d,...c,{ya:B1,yb:0,w:1.65,dir:'up'});
    const bot=P(16,0),landing=frame([P(13.8,0),bot]);
    K.slab(landing.poly(-3,3),B1,{mat:'station-granite'});
    hall([bot,target],6,B1,{label:'7호선 타는 곳 ↓',openings:[{x:bot[0],z:bot[1],w:10,full:true},{x:target[0],z:target[1],w:10}]});
    for(const v of [-2.9,2.9]){
      const l=P(0,v),r=P(14.6,v);
      K.wall(...l,...r,B1,1,{mat:0xa7adb0,thick:.22,openings:number==='4'?[{at:5,w:10,y0:B1,y1:B1+3.2}]:[]});
      K.wall(...l,...r,.25,1.15,{mat:'glass',thick:.04});
      for(const s of [0,4.8,9.6,14.3]){const p=P(s,v);K.cyl({x:p[0],z:p[1],y:.15,r:.065,h:2.9,mat:'metal',seg:8});}
      beam([l[0],3.1,l[1]],[r[0],3.1,r[1]],.1,0x6d7d83);
    }
    const roof=frame([P(-.8,0),P(15,0)]);
    localBox(roof,roof.length/2,0,3.04,6.2,.12,roof.length,'glass');
    for(let s=0;s<15;s+=2.5){const a=P(s,-3.1),b=P(s,3.1);beam([a[0],3.06,a[1]],[b[0],3.06,b[1]],.06);}
    const head=P(-.45,0);sign(`${number}  고속터미널역`,head[0],2.5,head[1],5.9,.92,rot+Math.PI,'#182a36');
    sign('3 · 7 · 9호선',head[0],1.85,head[1],3.6,.34,rot+Math.PI,'#182a36');
    for(let k=0;k<3;k++){const p=P(-.6,k*1.45-1.45);box({x:p[0],z:p[1],y:3.2,w:1.4,h:.13,d:.25,rotY:rot,mat:paint(C[[3,7,9][k]])});}
    const pole=P(-1.2,4.2);box({x:pole[0],z:pole[1],y:0,w:.2,h:3.3,d:.2,mat:0x445560});
    sign([number+'번 출구','고속터미널'],pole[0]-ux*.17,3,pole[1]-uz*.17,1.8,1.25,rot+Math.PI,'#243340','#f3dd82');
    const info=P(8,2.65);sign(dest,info[0],.4,info[1],5,.45,rot+Math.PI/2,'#33434c');
    // A modest paved forecourt and two narrow side aprons give each real OSM
    // entrance a street address without inventing an above-ground station hall.
    const apron=frame([P(-8,0),P(-.12,0)]);
    localSlab(apron,0,apron.length,-5.2,5.2,.025,'sidewalk');
    for(const side of [-1,1]){
      const edge=frame([P(-.12,side*4),P(15.4,side*4)]);
      localSlab(edge,0,edge.length,-1.05,1.05,.025,'sidewalk');
      strip(edge,edge.length/2,side*.98,.035,.1,edge.length,'darkstone');
    }
    strip(apron,apron.length-1,0,.048,5.15,.6,'station-tactile');
    strip(apron,3.2,0,.048,.6,6.4,'station-tactile');
    for(const v of [-4.6,4.6]){
      const p=P(-6.8,v);
      K.cyl({x:p[0],y:.025,z:p[1],r:.12,h:.85,mat:0x45535b,seg:10});
      K.cyl({x:p[0],y:.65,z:p[1],r:.125,h:.12,mat:paint(0xd8d9c8),seg:10,solid:false});
    }
    // Thin canopy fascia, gutter and underside lighting retain the transparent
    // roof while making the entrance readable from the pedestrian approach.
    for(const v of [-3.06,3.06]){
      const f=frame([P(-.8,v),P(15,v)]);
      localBox(f,f.length/2,0,3.04,.14,.22,f.length,0x465a65);
      localBox(f,f.length/2,0,2.99,.08,.04,f.length-.8,paint(0xffedbb));
    }
    if(['2','3','4'].includes(number)){
      const p=P(-3.1,4.2), face=rot+Math.PI;
      box({x:p[0],z:p[1],y:.025,w:1.22,h:2.3,d:.32,rotY:rot,mat:0x344b59,solid:true});
      sign(['주변 안내',...dest.split(' · '),'3 · 7 · 9호선'],p[0]-ux*.2,1.42,p[1]-uz*.2,1.02,1.42,face,'#e9e8df');
      const seat=frame([P(6,-4.15),P(10,-4.15)]);
      bench(seat,2,0,.025);
      const planter=P(12.7,-4.15);
      box({x:planter[0],y:.025,z:planter[1],w:1.55,h:.45,d:1.55,mat:'darkstone',solid:true});
      box({x:planter[0],y:.475,z:planter[1],w:1.3,h:.2,d:1.3,mat:0x557043});
      const person=P(-5,-2.8);K.person(person[0],.025,person[1],{shirt:0x657b8c});
    }
    if(number==='3'){
      const p=P(-5,4.85);K.cyl({x:p[0],y:0,z:p[1],r:.065,h:3.8,mat:0x4f5e65,seg:8});
      box({x:p[0],y:2.95,z:p[1],w:.31,h:.65,d:.22,rotY:rot,mat:0x263238});
      sign('보행 신호',p[0]-ux*.15,3.32,p[1]-uz*.15,.3,.12,rot+Math.PI,'#172532');
      sign('●',p[0]-ux*.15,3.12,p[1]-uz*.15,.21,.21,rot+Math.PI,'#172532','#ed6554');
    }
    K.zone({name:'고속터미널역 '+number+'번 출구',floor:'지상',sub:dest,poly:roof.poly(-5,5),y0:-.1,y1:4,priority:5});
  }
  exitSpecs.forEach(exit);

  // Real Line 7 curve, sampled from the two OSM track ways.
  const l7=frame([[49,130],[34.86,135.7],[4.24,146],[-22.5,160],[-40.4,172.4],[-73.2,198.1],[-112,238],[-133,264]]);
  const l3=frame([[-90,-225],[-90,-25]]);
  const l9=frame([[42,-142],[-71.16,-99],[-171.42,-61.66]]);

  // Train bodies sit beyond continuous platform screen doors. Car lengths are
  // full size; curved Line 7 cars each take the local tangent of the real track.
  function train(f,y,line,cars,side) {
    const carLen=19.2,gap=.55,total=cars*(carLen+gap),start=(f.length-total)/2;
    for(let c=0;c<cars;c++) {
      const s=start+c*(carLen+gap)+carLen/2,base=f.at(s,side*2.7),rot=base.rot;
      const at=(ls,v)=>({x:base.x+base.ux*ls+base.nx*v,z:base.z+base.uz*ls+base.nz*v});
      const cb=(ls,v,yy,w,h,d,mat)=>box({...at(ls,v),y:yy,w,h,d,rotY:rot,mat});
      cb(0,0,y-.6,2.85,3.7,carLen,0xb9c2c5);
      cb(0,0,y+2.95,2.6,.22,carLen-.25,0xd7dbd9);
      cb(0,0,y+.43,2.91,.36,carLen-.2,C[line]);
      cb(0,0,y-.85,2.45,.35,carLen-.6,0x303b42);
      for(const v of [-1.44,1.44]) {
        for(let door=0;door<4;door++) {
          const ls=-7.1+door*4.7;
          cb(ls,v,y+.08,.035,2.3,1.3,0xdce1e1);
          cb(ls,v*1.008,y+.84,.04,1.1,1.05,0x192c35);
          cb(ls,v*1.015,y+.15,.05,2.12,.035,0x8b999e);
          cb(ls,v*1.02,y+2.44,.035,.13,1.3,paint(line===9?0xe7c268:0xdde8cf));
        }
        for(const ls of [-8.7,-4.75,0,4.7,8.8])cb(ls,v,y+.96,.045,1.15,1.9,0x243c49);
      }
      for(const ls of [-6.1,6.1]) {
        cb(ls,0,y-.98,2.45,.4,2.4,0x283038);
        for(const v of [-1.12,1.12])for(const ds of [-.8,.8])cb(ls+ds,v,y-.99,.15,.52,.6,0x151d22);
      }
      if(c<cars-1)cb(carLen/2+.27,0,y+.2,2.25,2.55,.5,0x273239);
      if(c===0||c===cars-1){
        const ls=(c===0?-1:1)*(carLen/2+.03);cb(ls,0,y+.9,2.3,1.1,.06,0x1a2c36);
        for(const v of [-.95,.95])cb(ls,v,y+.2,.22,.18,.07,paint(c===0?0xececc8:0xdf342f));
        const p=at(ls,0);sign(line+'호선  고속터미널',p.x,y+2.27,p.z,2.45,.32,rot+(c===0?Math.PI:0),'#16232a','#e8d595');
      }
    }
  }
  function platform(f,y,line,opts={}) {
    const width=opts.width||14.8,edge=5.1,roofH=line===9?5:4.55;
    const openings=opts.openings||[];
    const clearOfDoors=(s,v,pad=2)=>{
      const p=f.at(s,v);
      return openings.every(o=>Math.hypot(p.x-o.x,p.z-o.z)>o.w/2+pad);
    };
    for(const side of [-1,1]){
      cutSlab(f.poly(side<0?-width:edge,side<0?-edge:width),y,opts.holes||[]);
      lineWall(f,side*width,y,roofH,openings);
      // Texture and colour band make the long spaces readable at walking scale.
      for(let s=1.3;s<f.length-1.3;s+=2.55) {
        if(line===9&&s<30)continue;
        strip(f,s,side*5.7,y+.015,.6,2.55,'station-tactile');
        localBox(f,s,side*5.13,y, .12,2.7,2.5,'glass',true);
        for(const ds of [-1.25,0,1.25])localBox(f,s+ds,side*5.13,y,.065,2.72,.065,0x748388);
        localBox(f,s,side*5.13,y+.04,.15,.19,2.5,0x596a73);
        localBox(f,s,side*5.13,y+2.7,.18,.23,2.5,0x4f626b);
        localBox(f,s,side*5.13,y+2.92,.2,.13,2.5,C[line]);
        localBox(f,s,side*5.15,y+1.08,.13,.06,2.48,0xd9dfd9);
        const p=f.at(s,side*5.25);
        if(Math.round(s/2.55)%3===0)sign('발빠짐 주의',p.x,y+.35,p.z,1.7,.2,f.at(s).rot+Math.PI/2,'#efc551','#2f302a');
      }
      for(let s=8;s<f.length-5;s+=12.5){
        light(f,s,side*8.5,y+3.8,6);
        if(line!==9&&!(line===3&&side===-1&&s>120&&s<140)){const p=f.at(s,side*11.6);K.cyl({x:p.x,z:p.z,y,r:.42,h:4.48,mat:'station-ceramic'});localBox(f,s,side*11.6,y+1.65,.87,.3,.87,C[line]);}
      }
      for(let s=14;s<f.length-6;s+=31){
        const p=f.at(s,side*(width-.15));
        sign([`${{3:'339',7:'734',9:'923'}[line]}   고속터미널`,({3:'잠원  ←   3호선   →  교대',7:'반포  ←   7호선   →  내방',9:'신반포  ←   9호선   →  사평'})[line]],p.x,y+2.08,p.z,7,1.05,f.at(s).rot+Math.PI/2,CSS[line]);
        localSign(f,s+6,side*9,y+3.05,line+'호선  '+(side<0?({3:'잠원 방면',7:'반포 방면',9:'사평 방면'})[line]:({3:'교대 방면',7:'내방 방면',9:'신반포 방면'})[line]),5,.6);
        if(clearOfDoors(s+5,side*(width-1.1))&&(line!==7||[75,175].every(c=>Math.abs(s+5-c)>10)))bench(f,s+5,side*(width-1.1),y);
      }
      for(let s=20;s<f.length-10;s+=43){
        const p=f.at(s,side*8.7);K.person(p.x,y,p.z,{shirt:side<0?0x405775:0xb39c7b});
        const q=f.at(s+3.2,side*10.3);K.person(q.x,y,q.z,{shirt:0x363942});
        if(clearOfDoors(s+11,side*(width-1),3)&&(line!==7||[75,175].every(c=>Math.abs(s+11-c)>10)))facilities(f,s+11,side*(width-1),y);
      }
      train(f,y,line,line===3?10:line===7?8:6,side);
    }
    if(line===9){
      localSlab(f,-8,31,-width,width,y);
      localBox(f,31,0,y,10.1,1.1,.22,0x6b7a7d,true);
      localSign(f,30.8,0,y+1.7,'타는 곳  ←    →  일반 · 급행',9,.55);
    }
    // Track beds, sleepers, running rails and a restrained central cable trough.
    K.slab(f.poly(-5.05,5.05),y-1.2,{mat:0x353e43,under:0x34393d});
    for(let s=.4;s<f.length;s+=.72){localBox(f,s,0,y-1.1,8.8,.14,.22,0x737c7c);}
    for(const v of [-3.45,-1.95,1.95,3.45])for(let i=0;i<f.points.length-1;i++){
      const a=f.at(f.lengths[i],v),b=f.at(f.lengths[i+1]-.005,v);
      beam([a.x,y-.9,a.z],[b.x,y-.9,b.z],.065,0x9eaaac,6);
    }
    if(line!==9)cutSlab(f.poly(-width,width),y+4.7,opts.roofHoles||[],{mat:'concrete',under:'ceiling',walk:false});
    else {
      // A broad pipe-rib vault, its crown lowered locally beneath Line 3.
      for(let s=1;s<f.length;s+=4.4){
        const p=f.at(s);let last;
        for(let j=0;j<=22;j++){
          const theta=j/22*Math.PI,v=Math.cos(theta)*width;
          const crown=Math.abs(p.x+90)<17?7.8:12;
          const q=f.at(s,v),pt=[q.x,y+3.8+Math.sin(theta)*(crown-3.8),q.z];
          const inWell=q=>q[0]>-3&&q[0]<36&&q[2]>-140&&q[2]<-125;
          if(last&&!inWell(last)&&!inWell(pt))beam(last,pt,.23,0xa7b0b0,10);last=pt;
        }
      }
      // Inner vault skin uses inward-facing quads; interruptions leave the W9
      // inclined access shaft open and keep the shared Line 3 crossing readable.
      for(let s=0;s<f.length;s+=4.4){
        for(let j=0;j<22;j++){
          const t0=j/22*Math.PI,t1=(j+1)/22*Math.PI;
          const pts=[];
          for(const [ss,t] of [[s,t0],[Math.min(s+4.4,f.length),t0],[Math.min(s+4.4,f.length),t1],[s,t1]]){
            const p=f.at(ss),v=Math.cos(t)*width,q=f.at(ss,v),crown=Math.abs(p.x+90)<17?7.8:12;
            pts.push([q.x,y+4+Math.sin(t)*(crown-3.8),q.z]);
          }
          if(pts.some(p=>p[0]>-3&&p[0]<36&&p[2]>-140&&p[2]<-125))continue;
          const m=f.at(s),t=(t0+t1)/2;
          K.quad({tex:'station-ribbed',color:0xadb5b6},pts,[-Math.cos(t)*m.nx,-Math.sin(t),-Math.cos(t)*m.nz]);
        }
      }
      for(let s=5;s<f.length;s+=8){light(f,s,-4,y+6.2,5);light(f,s,4,y+6.2,5);}
      // Close the high vault above the low cross-platform end passages.
      for(const s of [0,f.length])for(let j=0;j<22;j++){
        const a=j/22*Math.PI,b=(j+1)/22*Math.PI,p=f.at(s),u=f.at(s,Math.cos(a)*width),v=f.at(s,Math.cos(b)*width),dir=s===0?1:-1;
        K.quad('station-ribbed',[[u.x,y+3.8,u.z],[v.x,y+3.8,v.z],[v.x,y+4+Math.sin(b)*8.2,v.z],[u.x,y+4+Math.sin(a)*8.2,u.z]],[dir*p.ux,0,dir*p.uz]);
      }
    }
    // At either end a cross-platform bridge precedes the dark tunnel mouths.
    for(const s of [-4,f.length+4]){
      localSlab(f,s-4,s+4,-width,width,y);
      const end=s+(s<0?-4:4),a=f.at(end,-width),b=f.at(end,width);
      K.wall(a.x,a.z,b.x,b.z,y,y+4.7,{mat:'station-ceramic',thick:.2});
      for(const v of [-width,width]){const a=f.at(s-4,v),b=f.at(s+4,v);K.wall(a.x,a.z,b.x,b.z,y,y+4.7,{mat:'station-ceramic',thick:.2});}
      for(const side of [-1,1]){
        const p=f.at(s+ (s<0?-1:1)*4,side*2.7);
        localBox(f,s+(s<0?-1:1)*4.05,side*2.7,y-1.2,4.4,4.6,.18,0x131e25,true);
        sign('선로 출입금지',p.x,y+1.2,p.z,3.2,.5,f.at(s).rot,'#442b28');
      }
      const poly=[f.at(s-4,-width),f.at(s+4,-width),f.at(s+4,width),f.at(s-4,width)].map(p=>[p.x,p.z]);
      K.slab(poly,y+4.7,{walk:false,mat:'concrete',under:'ceiling'});
      localSign(f,s,0,y+2.8,'타는 곳  ←    →  반대편 타는 곳',11,.65);
    }
    K.zone({name:'고속터미널역 '+line+'호선 승강장',floor:{3:'B2',7:'B3',9:'B4'}[line],sub:({3:'339 · 잠원 ↔ 교대 · 10량',7:'734 · 반포 ↔ 내방 · 곡선 승강장',9:'923 · 신반포 ↔ 사평 · 일반·급행'})[line],poly:f.poly(-width,width),y0:y,y1:y+4.7,priority:3});
  }

  const lowerCoreStations=[75,175];
  const lowerCoreVoids=lowerCoreStations.map(s=>{
    const p=[l7.at(s-1.6,-1),l7.at(s+5.3,-1),l7.at(s+5.3,14),l7.at(s-1.6,14)].map(p=>[p.x,p.z]);
    return K.polyBBox(p);
  });
  const well3=WELLS.find(w=>w.id==='W3'),well9=WELLS.find(w=>w.id==='W9');
  platform(l3,B2,3,{width:17,roofHoles:[well3.rect],openings:[{x:-73,z:-27,w:12},{x:-73,z:-85,w:12}]});
  platform(l7,B3,7,{width:14.8,openings:[{x:-126,z:250,w:14},{x:20,z:145,w:18}],roofHoles:lowerCoreVoids});
  platform(l9,B4,9,{width:14.8,openings:[{x:32,z:-132,w:15},{x:-29,z:-100,w:11},{x:-76,z:-82,w:10},{x:-69,z:-85,w:10}]});

  // Line 7's actual B2 concourse sits over its tracks with two distributed cores.
  const b2Holes=lowerCoreVoids;
  const concourse7=hall(l7.points,29.6,B2,{floor:'B2',name:'고속터미널역 7호선 대합실',sub:'734 · 승차권 발매 · 역무실 · 화장실 · 3·9호선 환승',label:'7호선 타는 곳  ↓     3·9호선 환승  →',holes:b2Holes,roofHoles:b1Voids,openings:[{x:20,z:157,w:16,full:true},{x:-122,z:245,w:16,full:true},{x:41,z:150,w:16}]});
  for(const s of [0,concourse7.length]){
    const a=concourse7.at(s,-14.8),b=concourse7.at(s,14.8);
    K.wall(a.x,a.z,b.x,b.z,B2,B2+4.7,{mat:'station-ceramic'});
  }
  gates(concourse7,57,B2,8);ticketBank(concourse7,119,12.8,B2);
  room(concourse7,103,12.4,B2,'역무실 · 고객안내');room(concourse7,148,12.4,B2,'화장실 · 수유실');
  for(let s=14;s<concourse7.length-12;s+=15){const p=concourse7.at(s,11);K.cyl({x:p.x,z:p.z,y:B2,r:.45,h:4.6,mat:'station-ceramic'});}
  for(let i=0;i<16;i++){const p=concourse7.at(12+i*12,(i%2?1:-1)*5);K.person(p.x,B2,p.z);}

  // Every core has both walking stairs and powered escalators with open voids.
  const down=(ax,az,bx,bz,ya,yb,w=1.25)=>K.escalator(bx,bz,ax,az,{ya:yb,yb:ya,w,dir:'down'});
  const up=(ax,az,bx,bz,ya,yb,w=1.25)=>K.escalator(bx,bz,ax,az,{ya:yb,yb:ya,w,dir:'up'});
  function core(x,z,top,bottom) {
    K.stairs(x,z,x,z-13,{ya:top,yb:bottom,w:2.2,mat:'darkstone'});
    down(x+2,z,x+2,z-13,top,bottom);up(x+3.65,z,x+3.65,z-13,top,bottom);
    sign('7호선 타는 곳 ↓',x+1.5,top+2.3,z+1,7,.65,Math.PI,CSS[7]);
    for(const xx of [x-1.2,x+4.6])K.wall(xx,z,xx,z-13,bottom,top+.95,{mat:'glass',thick:.03});
  }
  K.slab(rect(17.5,162,24.5,166),B1,{mat:'station-granite'});
  K.slab(rect(-126,250,-118,254),B1,{mat:'station-granite'});
  hall([[-120,252],[-115,240]],6,B1,{label:'7호선 타는 곳 ↓',holes:b1Voids,openings:[{x:-120,z:246,w:22,full:true}]});
  core(19,162,B1,B2);core(-124,250,B1,B2);
  for(const s of lowerCoreStations){
    localSlab(l7,s-1.6,s+5.3,-5,0,B2);
    for(const [ds,w,kind] of [[0,2.2,'stairs'],[2.05,1.25,'down'],[3.7,1.25,'up']]){
      const a=l7.at(s+ds,0),b=l7.at(s+ds,12.8);
      if(kind==='stairs')K.stairs(a.x,a.z,b.x,b.z,{ya:B2,yb:B3,w,mat:'darkstone'});
      else (kind==='down'?down:up)(a.x,a.z,b.x,b.z,B2,B3,w);
    }
    localSign(l7,s+1.6,-1,B2+2.5,'7호선 타는 곳 ↓',6,.6);
  }
  // Landing extensions join the cores to the side platforms without a track crossing.
  for(const [r,y] of [[rect(15,145,27,150),B2],[rect(-128,233,-116,239),B2]])K.slab(r,y,{mat:'station-granite'});

  // Shared mall wells. The collar is outside the open well at its entry side.
  K.slab(rect(-84,-108,-74,-104),B1,{mat:'station-granite'});
  K.hpoly('station-granite',rect(-84,-108,-74,-104),B1+.02);
  K.stairs(-77.2,-104,-77.2,-90,{ya:B1,yb:B2,w:1.8,mat:'darkstone'});
  down(-80.55,-104,-80.55,-90,B1,B2,1.3);up(-79,-104,-79,-90,B1,B2,1.3);
  K.slab(rect(-83,-90,-73,-86),B2,{mat:'station-granite'});
  sign('3  고속터미널  |  타는 곳 ↓',-79,B1+2.3,-104.7,5.8,.85,0,CSS[3]);
  K.slab(rect(-5,-138,0,-126),B1,{mat:'station-granite'});
  K.hpoly('station-granite',rect(-5,-138,0,-126),B1+.02);
  K.stairs(0,-129.3,30,-129.3,{ya:B1,yb:B4,w:1.8,mat:'darkstone'});
  down(0,-134.4,30,-134.4,B1,B4,1.4);up(0,-132.3,30,-132.3,B1,B4,1.4);
  K.slab(rect(30,-138,40,-124),B4,{mat:'station-granite'});
  sign('9  고속터미널  |  타는 곳 ↓',-1.1,B1+2.4,-132,7.3,.85,-Math.PI/2,CSS[9]);
  // Inclined walls/ceiling around the long W9 well, rather than an opaque lid.
  for(const z of [-136.2,-127.8]){
    K.quad('station-ceramic',[[0,B1,z],[30,B4,z],[30,B4+4.6,z],[0,B1+4.6,z]],[0,0,z<-132?1:-1]);
  }
  K.quad('ceiling',[[0,B1+4.6,-136.2],[30,B4+4.6,-136.2],[30,B4+4.6,-127.8],[0,B1+4.6,-127.8]],[0,-1,0]);
  for(let i=2;i<30;i+=4){box({x:i,y:B1-i/2+3.8,z:-132,w:.3,h:.1,d:6.8,mat:paint(0xf8efdb)});}

  // Mall-side B1 galleries end at the wells; their small footprint avoids
  // duplicating the neighbouring module's entire shopping mall slab.
  // When 고투몰 (built earlier in PLACES order) already owns this B1 floor, its own fare-gate halls
  // stand here, so the station adds no walls/ceilings of its own inside the mall.
  const mallHere=(()=>{const s=K.phys.support(-40,-110,B1+.5);return Math.abs(s.y-B1)<.3;})();
  if(!mallHere)hall([[-79,-106],[-79,-113],[-5,-113],[-5,-132]],5,B1,{floor:'B1',name:'고속터미널역 3·9호선 연결부',sub:'고투몰 · 1·8·8-1·8-2번 출구',label:'1·8·8-1·8-2 출구 → 고투몰 / 경부선',jointFinish:true,openings:[{x:-79,z:-106,w:8},{x:-5,z:-132,w:8}]});
  sign('9호선 열차 안내  |  일반 · 급행',-26,B1+2.8,-113,7,.65,0,'#152e33','#d6bd72');

  // 3↔7: a continuous paid passage around the east side of the main complex.
  const transfer=hall([[-79,-27],[40,-27],[40,151]],7,B2,{floor:'B2',name:'고속터미널역 환승통로',sub:'3호선 ↔ 7호선 · 9호선 연결',label:'7호선 환승  ↑    3·9호선  ↓',openings:[{x:-79,z:-27,w:9},{x:40,z:151,w:12}]});
  for(const s of [22,50,80,145,177,210,245]){const p=transfer.at(s,2);K.person(p.x,B2,p.z,{shirt:s%2?0x57554f:0xa0a8ad});}
  // Two moving walks occupy one side, preserving a full pedestrian aisle.
  for(const ends of [[35,85],[157,212]]){
    const a=transfer.at(ends[0],-1.6),b=transfer.at(ends[1],-1.6);
    K.ramp(a.x,a.z,b.x,b.z,{ya:B2+.03,yb:B2+.03,w:1.4,mat:0x49555c,move:.65,rails:true});
    localSign(transfer,ends[0]-2,-1.6,B2+2.35,'무빙워크  ↑',2.5,.45);
  }
  // The entire 3↔9 flight is outside the south platform wall. Previously its
  // solid step skirts rose through the platform aisle at the B4 spawn.
  hall([[-76,-85],[-65,-85]],7,B2,{label:'9호선 환승  ↓',openings:[{x:-76,z:-85,w:9},{x:-65,z:-82,w:12,full:true}]});
  const t39top=rect(-67,-88.5,-63,-77.5);K.slab(t39top,B2,{mat:'station-granite'});
  K.slab(t39top,B2+4.2,{mat:'concrete',under:'ceiling',walk:false});
  K.wall(-67,-88.5,-67,-77.5,B2,B2+4.2,{mat:'station-ceramic',openings:[{at:3.5,w:7,y0:B2,y1:B2+3.5}]});
  K.wall(-67,-77.5,-63,-77.5,B2,B2+4.2,{mat:'station-ceramic'});
  K.stairs(-63,-79.5,-33,-79.5,{ya:B2,yb:B4,w:2.0,mat:'darkstone'});
  down(-63,-84.4,-33,-84.4,B2,B4,1.5);up(-63,-82.2,-33,-82.2,B2,B4,1.5);
  K.slab(rect(-34,-87,-25,-77),B4,{mat:'station-granite'});
  K.slab(rect(-34,-87,-25,-77),B4+4.5,{mat:'concrete',under:'ceiling',walk:false});
  K.wall(-34,-77,-25,-77,B4,B4+4.5,{mat:'station-ceramic'});
  hall([[-29,-82],[-29,-103]],8,B4,{label:'9호선 타는 곳  ↑',openings:[{x:-33,z:-82,w:10,full:true},{x:-29,z:-100,w:12,full:true}]});
  for(const z of [-86,-78])K.quad('station-ceramic',[[-63,B2,z],[-33,B4,z],[-33,B4+3.9,z],[-63,B2+3.9,z]],[0,0,z<-82?1:-1]);
  K.quad('ceiling',[[-63,B2+3.9,-86],[-33,B4+3.9,-86],[-33,B4+3.9,-78],[-63,B2+3.9,-78]],[0,-1,0]);
  for(let i=2;i<30;i+=5)box({x:-63+i,y:B2-i/3+3.5,z:-82,w:.3,h:.08,d:6.5,mat:paint(0xf8efdb)});
  sign('9호선  일반 · 급행  ↓',-64,B2+2.4,-82,7.5,.7,-Math.PI/2,CSS[9]);
  sign('3호선 환승  ↑',-31.8,B4+2.7,-82,6,.6,Math.PI/2,CSS[3]);

  // Accessible routes. Each lift door has a real landing and all line levels;
  // Line 7's Exit 4 lift explicitly includes the verified 1F/B2/B3 stops.
  function lift(x,z,rot,floors,name) {
    const w=2.6,d=2.5,c=Math.cos(rot),s=Math.sin(rot);
    const P=(lx,lz)=>[x+lx*c+lz*s,z-lx*s+lz*c];
    const poly=[P(-w/2,-d/2),P(w/2,-d/2),P(w/2,d/2),P(-w/2,d/2)];
    const ordered=[...floors].sort((a,b)=>a.y-b.y),bottom=ordered[0].y,top=ordered.at(-1).y+3.2;
    const part=(lx,lz,y,ww,h,dd,mat)=>{const p=P(lx,lz);box({x:p[0],z:p[1],y,w:ww,h,d:dd,rotY:rot,mat});};
    // The kit's generic multi-floor front overlaps its vertically stacked
    // openings. Keep its interaction, but build one open doorway per storey.
    K.elevator({name,x,z,rotY:rot,w,d,floors,shaft:false});
    for(const [a,b] of [[0,1],[1,2],[3,0]])K.wall(...poly[a],...poly[b],bottom,top,{mat:'station-ribbed',thick:.15});
    for(let i=0;i<ordered.length;i++){
      const f=ordered[i],next=ordered[i+1]?.y??top;
      // The street landing must stay north of Exit 4's adjacent open stairwell.
      const half=f.y===0?1.35:2.6;
      K.slab([P(-half,-1.35),P(half,-1.35),P(half,3.4),P(-half,3.4)],f.y,{mat:'station-granite'});
      K.slab(poly,f.y,{mat:'metal',thick:.05,edge:false,ceil:false});
      K.wall(...poly[2],...poly[3],f.y,next,{mat:'station-ribbed',thick:.15,openings:[{at:w/2,w:1.4,y0:f.y,y1:f.y+2.25}]});
      for(const lx of [-.75,.75])part(lx,d/2+.09,f.y,.09,2.33,.1,0x384f5b);
      part(0,d/2+.09,f.y+2.25,1.59,.09,.1,0x384f5b);
      part(0,d/2+.09,f.y+2.34,1.4,.045,.12,paint(0xe5efda));
      part(0,2.3,f.y+.016,1.8,.018,.6,'station-tactile');
      const indicator=P(0,d/2+.15),panel=P(1.65,d/2+.1),back=P(0,-d/2+.11);
      const label=f.label==='지상'?'지상':`지하 ${f.label.slice(1)}층`;
      sign(label+' · 엘리베이터',indicator[0],f.y+2.66,indicator[1],2.55,.34,rot,'#193640','#f0db8d');
      sign([label,f.name],back[0],f.y+1.65,back[1],2.15,.62,rot,'#e8e6dc');
      part(1.65,d/2+.07,f.y+.83,.26,.58,.1,0x52666f);
      sign('호출',panel[0],f.y+1.3,panel[1],.42,.18,rot,'#193640');
      part(1.65,d/2+.15,f.y+1.01,.1,.1,.04,paint(0xf0dca0));
    }
    K.slab(poly,top,{mat:'metal',under:'ceiling',walk:false});
  }
  lift(-76,-82,0,[{label:'B1',y:B1,name:'고투몰 연결'},{label:'B2',y:B2,name:'3호선 승강장'},{label:'B4',y:B4,name:'9호선 연결'}],'3·9호선 환승 엘리베이터');
  // B1 lift landing reaches the W3 gallery; B4 landing reaches Line 9's south side.
  if(!mallHere)hall([[-79,-79],[-70,-79],[-70,-106],[-79,-106]],5,B1,{label:'3·9호선 엘리베이터',openings:[{x:-76,z:-80.75,w:3},{x:-79,z:-106,w:10}]});
  hall([[-79,-79],[-69,-79],[-69,-90]],5,B4,{label:'9호선 타는 곳',openings:[{x:-76,z:-80.75,w:3},{x:-69,z:-86,w:11,full:true}]});
  for(const y of mallHere?[B4]:[B1,B4])K.wall(-79,-81.5,-79,-76.5,y,y+4.7,{mat:'station-ceramic'});
  lift(36,-124,0,[{label:'B1',y:B1,name:'고투몰 연결'},{label:'B4',y:B4,name:'9호선 승강장'}],'9호선 엘리베이터');
  if(!mallHere)hall([[-5,-132],[-5,-121],[36,-121]],5,B1,{label:'9호선 엘리베이터 →',openings:[{x:-5,z:-132,w:8},{x:36,z:-122.75,w:3.5}]});
  lift(-136,248,Math.PI/2,[{label:'지상',y:0,name:'4번 출구'},{label:'B1',y:B1,name:'연결 대합실'},{label:'B2',y:B2,name:'7호선 대합실'},{label:'B3',y:B3,name:'7호선 승강장'}],'4번 출구 · 7호선 엘리베이터');
  hall([[-136,248],[-130,248]],5,B2,{label:'7호선 대합실',openings:[{x:-123,z:248,w:10}]});
  hall([[-136,248],[-130,248]],5,B3,{label:'7호선 타는 곳',openings:[{x:-123,z:248,w:10}]});
  // Ground lift canopy, glass side panels and legible street marker.
  box({x:-136,y:3.3,z:248,w:3.2,h:.18,d:3.2,mat:0x4f626c});
  sign('고속터미널역  7호선',-134.6,2.75,248,3.3,.48,Math.PI/2,'#747f00');
  sign('엘리베이터',-134.6,2.15,248,2.3,.4,Math.PI/2);

  // Network diagrams and local orientation boards, with researched names only.
  for(const [f,s,v,y,line] of [[l3,105,-16.8,B2,3],[l7,98,-14.5,B3,7],[l9,95,-14.5,B4,9]]){
    localSign(f,s,v,y+2.2,[line+'호선 노선 안내',({3:'잠원 ━ 고속터미널 ━ 교대',7:'반포 ━ 고속터미널 ━ 내방',9:'신반포 ━ 고속터미널 ━ 사평'})[line]],7.5,1.1,true,'#e9e8df');
    localSign(f,s+10,v,y+1.8,['출구 안내','고투몰 · 경부선터미널','센트럴시티 · 신세계백화점','파미에스테이션 · JW메리어트'],5,1.7,true,'#2b404e');
  }
  K.spawn({name:'3번 출구 · 파미에스테이션 방면',x:52.1,y:0,z:185.5,yaw:0});
  K.spawn({name:'4번 출구 · 엘리베이터',x:-129,y:0,z:246,yaw:Math.PI/2});
  const p1=b1.at(66,0);K.spawn({name:'B1 · 센트럴시티 연결 대합실',x:p1.x,y:B1,z:p1.z,yaw:1.95});
  K.spawn({name:'B1 · 고투몰 3호선 입구',x:-79,y:B1,z:-106,yaw:Math.PI});
  K.spawn({name:'B2 · 3호선 승강장',x:-79,y:B2,z:-151,yaw:0});
  const p2=concourse7.at(105,-4);K.spawn({name:'B2 · 7호선 대합실',x:p2.x,y:B2,z:p2.z,yaw:2.1});
  const p3=l7.at(116,9);K.spawn({name:'B3 · 7호선 곡선 승강장',x:p3.x,y:B3,z:p3.z,yaw:2.34});
  const p4=l9.at(100,-9);K.spawn({name:'B4 · 9호선 아치 승강장',x:p4.x,y:B4,z:p4.z,yaw:1.21});
}
