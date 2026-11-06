// 르본시티, round 10. Surveyed shell; photograph-informed interiors, NOT a measured shop plan.
// Local u runs east along the 신반포로 frontage, v runs into the building (south).
export const meta = {
  id: 'lebon', name: '르본시티 · 강남귀금속타운', claims: [413280002],
  sources: ['data/osm.json', '.codex-jobs/evidence/research_lebon.json',
    'refs/interior/lebon/kakao_roadview_20260625_left.jpg',
    'refs/interior/lebon/blog_2026-09_yeboh_resetting_06.jpg',
    'refs/interior/lebon/blog_2026-09_yeboh_resetting_07.jpg',
    'refs/interior/lebon/blog_2026-09_honamseon_flower_02.jpg'],
};

export function build(K) {
  const PI = Math.PI, R = Math.atan2(14.04, 44.12), C = Math.cos(R), S = Math.sin(R);
  const W = Math.hypot(44.12, 14.04), D = 38.32, U = W / 2;
  const P = (u,v) => [-260.03 + C*u + S*v, 9.01 - S*u + C*v];
  const rect = (u0,v0,u1,v1) => [P(u0,v0),P(u1,v0),P(u1,v1),P(u0,v1)];
  const footprint = K.osmBuilding(413280002)[0].poly;
  const F = {N:R+PI,S:R,E:R+PI/2,W:R-PI/2};
  const box = (u,v,y,w,d,h,mat,o={}) => {const [x,z]=P(u,v); K.box({x,z,y,w,d,h,rotY:R,mat,...o});};
  const cyl = (u,v,y,r,h,mat,o={}) => {const [x,z]=P(u,v); K.cyl({x,z,y,r,h,mat,seg:10,...o});};
  const sign = (text,u,v,y,w,h,face='S',o={}) => {const [x,z]=P(u,v); K.sign(text,{x,z,y,w,h,rotY:F[face],bg:null,fg:'#292925',...o});};
  const wall = (a,b,c,d,y0,y1,o={}) => {const p=P(a,b),q=P(c,d);K.wall(...p,...q,y0,y1,o);};
  const slab = (a,b,c,d,y,o={}) => K.slab(rect(a,b,c,d),y,o);
  const stairs = (a,b,c,d,ya,yb,w=2.3) => {const p=P(a,b),q=P(c,d);K.stairs(...p,...q,{ya,yb,w,mat:'lebon-stone',railMat:0x514e48});};
  const at = (u,v,y) => {const [x,z]=P(u,v);return [x,y,z];};
  const beam = (a,b,width,mat) => {
    const A=new K.THREE.Vector3(...at(...a)), B=new K.THREE.Vector3(...at(...b));
    const d=B.clone().sub(A).normalize(), e=new K.THREE.Vector3(0,1,0).cross(d);
    if(e.lengthSq()<.01)e.set(1,0,0);else e.normalize();
    const f=d.clone().cross(e).normalize();
    const pts=c=>[[-1,-1],[1,-1],[1,1],[-1,1]].map(([j,k])=>c.clone().addScaledVector(e,j*width/2).addScaledVector(f,k*width/2).toArray());
    const aa=pts(A),bb=pts(B);
    for(let i=0;i<4;i++)K.quad(mat,[aa[i],aa[(i+1)%4],bb[(i+1)%4],bb[i]], [f.clone().negate(),e,f,e.clone().negate()][i].toArray());
  };
  const gold={color:0xdab44d,gloss:.7}, metal={color:0xb7bec2,gloss:.5}, wood={tex:'wood',color:0x97603c,gloss:.3};
  const stone='lebon-stone', cream=0xddd1b4, white=0xf2f0e9;
  K.texture(stone,256,256,(g,w,h)=>{
    g.fillStyle='#cdb894';g.fillRect(0,0,w,h);g.strokeStyle='#bba582';g.lineWidth=1;
    for(let y=0;y<=h;y+=64){g.beginPath();g.moveTo(0,y);g.lineTo(w,y);g.stroke();}
    for(let j=0;j<4;j++)for(let x=(j%2)*128;x<w;x+=256){g.beginPath();g.moveTo(x,j*64);g.lineTo(x,(j+1)*64);g.stroke();}
  },[3.2,2]);
  K.texture('lebon-travertine',256,256,(g,w,h)=>{
    g.fillStyle='#ded6c3';g.fillRect(0,0,w,h);const rnd=K.rand(41328);
    for(let i=0;i<210;i++){g.strokeStyle=`rgba(128,117,93,${.03+rnd()*.1})`;g.lineWidth=.3+rnd();const x=rnd()*w,y=rnd()*h;g.beginPath();g.moveTo(x,y);g.bezierCurveTo(x+4,y+12,x-4,y+25,x+1,y+40);g.stroke();}
    g.strokeStyle='#b9b2a3';g.lineWidth=1;g.strokeRect(0,0,w,h);
  },[.85,.85]);
  K.texture('lebon-cyan',128,64,(g,w,h)=>{
    g.fillStyle='#34bdd1';g.fillRect(0,0,w,h);g.fillStyle='#152c43';
    for(let x=-24;x<w;x+=32){g.beginPath();g.moveTo(x,0);g.lineTo(x+9,0);g.lineTo(x+33,h);g.lineTo(x+24,h);g.fill();}
  },[2.3,.65]);
  const polish={tex:'lebon-travertine',gloss:.5};
  const floors=[
    {label:'B1',y:K.LEVELS.B1,name:'토다이 반포점 · 영업 종료 / 기전실'},
    {label:'1F',y:0,name:'강남귀금속타운 · 공주방 · 상가관리실'},
    {label:'2F',y:5.5,name:'헬릭스동물메디컬센터 · 24시 동물응급센터'},
    {label:'3F',y:10.4,name:'강남꽃도매상가 · 생화 · 소재 · 바구니'},
    {label:'4F',y:15,name:'강남꽃도매상가 · 생화 · 소재 · 바구니'},
    {label:'5F',y:19.6,name:'강남꽃도매상가 · 조화 · 생화 · 화환'},
    {label:'6F',y:24.2,name:'강남꽃도매상가 · 조화 · 프리저브드플라워'},
    {label:'7F',y:28.8,name:'서초피브로한의원 · 학원 · 사무실'},
    {label:'8F',y:33.4,name:'사무실'},
  ];
  const stairHole=rect(35.25,25,43.95,35.8);
  K.groundHole(stairHole);
  for(let i=0;i<floors.length;i++){
    const f=floors[i], top=floors[i+1]?.y??38;
    K.slab(footprint,f.y,{mat:i===1?polish:{tex:'tile',color:i>2?0xd8d5c8:0xe5e3dd,gloss:.3},holes:i?[stairHole]:[],thick:.28,under:white});
    const openings=[];
    const opening=(u,v,w,y0,y1)=>{const [x,z]=P(u,v);openings.push({x,z,w,y0,y1});};
    if(i===1){opening(U,0,6.4,0,3.4);opening(W,17.8,4.4,0,3.2);}
    if(i===2){opening(16,0,2.6,f.y,f.y+3);opening(30.3,0,2.6,f.y,f.y+3);opening(U,0,10.6,f.y,f.y+3.8);}
    // Actual small windows, with real openings through the stone shell.
    if(i>0)for(const edge of ['N','S','W','E']){
      const front=edge==='N'||edge==='S', span=front?W:D, n=front?7:6;
      for(let k=0;k<n;k++){
        const t=4+(span-8)*(k+.5)/n;
        if(i===1&&((edge==='N'&&Math.abs(t-U)<5)||(edge==='E'&&Math.abs(t-17.8)<4)))continue;
        if(i===2&&edge==='N'&&t>13&&t<34)continue;
        const u=front?t:edge==='W'?0:W,v=front?(edge==='N'?0:D):t;
        const ww=i===1?3.0:3.2,hh=i===1?1.45:1.65, yy=f.y+1.75;
        opening(u,v,ww,yy,yy+hh);
        const off=edge==='N'?-.025:edge==='S'?.025:0;
        if(front){box(u,v+off,yy,ww,.06,hh,'glass',{solid:false});box(u,v+off,yy, .07,.14,hh,metal,{solid:false});box(u,v+off,yy+hh/2,ww,.12,.055,metal,{solid:false});}
        else{box(u+(edge==='W'?-.025:.025),v,yy,.06,ww,hh,'glass',{solid:false});box(u,v,yy,.14,.07,hh,metal,{solid:false});}
        const frame=front?[ww+.28,.22]:[.22,ww+.28];
        box(u,v,yy-.12,...frame,.12,cream,{solid:false});box(u,v,yy+hh,...frame,.12,cream,{solid:false});
      }
    }
    K.polyWalls(footprint,f.y,top,{mat:stone,inner:white,thick:.28,openings});
    K.zone({name:'르본시티',floor:f.label,sub:f.name,poly:footprint,y0:f.y,y1:top,priority:35});
    for(const u of [13.9,32])for(const v of [6.8,19.3,32.1])cyl(u,v,f.y,.32,top-f.y-.3,white);
    // Perimeter bands stay thin; never place an opaque solid prism through an interior.
    if(i>1){box(U,0,top-.45,W,.18,.18,cream,{solid:false});box(U,D,top-.45,W,.18,.18,cream,{solid:false});}
    // Stair enclosure, open west lobby access at every full landing.
    wall(34.6,23,34.6,37.5,f.y,top,{mat:white,openings:[{at:1.1,w:2,y0:f.y,y1:f.y+2.8}]});
    wall(34.6,37.5,45,37.5,f.y,top,{mat:white});
    wall(45,23,45,37.5,f.y,top,{mat:white});
    // Rails close the open slab edge but keep the two stair run ends open.
    for(const u of [35.25,43.95])wall(u,25,u,35.8,f.y,f.y+1.05,{mat:0x5e6260,thick:.055});
    wall(35.25,35.8,43.95,35.8,f.y,f.y+1.05,{mat:0x5e6260,thick:.055});
    wall(38.5,25,40.7,25,f.y,f.y+1.05,{mat:0x5e6260,thick:.055});
    if(i===floors.length-1)wall(35.25,25,38.5,25,f.y,f.y+1.05,{mat:0x5e6260,thick:.055});
    if(i<floors.length-1){
      const mid=(f.y+top)/2;
      stairs(37.1,25,37.1,33.5,f.y,mid,2.5);
      slab(35.4,33.5,43.8,35.7,mid,{mat:'tile',thick:.18});
      stairs(42.1,33.5,42.1,25,mid,top,2.5);
    }
  }
  K.slab(footprint,38,{mat:'roofgravel',under:white});
  // Lobby elevators as seen in the 2024 photo: paired stainless doors with a directory between.
  for(const u of [7,11.3]){const [x,z]=P(u,3.1);K.elevator({name:'르본시티 승강기',x,z,rotY:R,w:2.5,d:2.5,floors,mat:0xd5d1c5,doorMat:metal});}
  // Closed B1 premises; the circulation lobby and stairs remain accessible.
  wall(.7,12,31.8,12,-6,-.3,{mat:0x888984,openings:[]});
  // Animal hospital rooms are a restrained schematic; its actual plan is unavailable.
  wall(27,7,27,31,5.5,10.1,{mat:0xe4e9e5,openings:[{at:7,w:2.2,y0:5.5,y1:8.2},{at:17,w:2.2,y0:5.5,y1:8.2}]});
  for(const v of [7,19,31])wall(27,v,v===31?34.6:44.7,v,5.5,10.1,{mat:white});
  // Upper offices: actual names from the photographed directory, approximate room divisions.
  for(const f of floors.slice(7))for(const u of [15,31])wall(u,10,u,32,f.y,f.y+4.25,{mat:white,openings:[{at:7,w:2,y0:f.y,y1:f.y+2.7}]});

  // Forecourt / entrance bay. All public thresholds remain at street y=0.
  slab(0,-5.6,W,0,0,{mat:'sidewalk',thick:.08});
  slab(W,14.9,W+3,20.6,0,{mat:'sidewalk',thick:.08});
  slab(16,-4,30.3,.4,5.5,{mat:polish,thick:.28});
  K.zone({name:'르본시티',floor:'2F',sub:'헬릭스동물메디컬센터 입구',poly:rect(16,-4,30.3,.4),y0:5.5,y1:10.4,priority:36});
  stairs(3.8,-2.2,16,-2.2,0,5.5,2.4);stairs(42.5,-2.2,30.3,-2.2,0,5.5,2.4);
  for(const u of [17.2,29.1]){
    box(u,-3.1,0,1.65,1.65,.35,0x493b33);cyl(u,-3.1,.35,.65,.33,cream);
    cyl(u,-3.1,.68,.49,8.45,cream,{seg:18});cyl(u,-3.1,9.13,.7,.26,cream);
    box(u,-3.1,9.39,1.6,1.6,.32,cream,{solid:false});
    for(let k=0;k<12;k++){const a=k*PI/6;beam([u+.5*Math.cos(a),-3.1+.5*Math.sin(a),1],[u+.5*Math.cos(a),-3.1+.5*Math.sin(a),8.95],.045,0xc4b795);}
    for(const du of [-.56,.56])for(let k=0;k<13;k++){const a=k*PI/6,b=(k+1)*PI/6,rr=.24*(1-k/18);beam([u+du+rr*Math.cos(a),-3.64,9.2+rr*Math.sin(a)],[u+du+rr*Math.cos(b),-3.64,9.2+rr*Math.sin(b)],.065,cream);}
  }
  box(U,-2.15,9.72,15.6,4.8,.68,cream,{solid:false});
  box(U,-2.18,10.4,16.3,5,.25,cream,{solid:false});
  sign('르본시티',U,-4.6,10.02,7.2,.55,'N',{fg:'#6d5b38'});
  // Bowed glass bay and fascia, segmented around a shallow convex arc.
  for(let k=0;k<12;k++){
    const a=U-5.25+k*10.5/12,b=a+10.5/12;
    const curve=u=>-3.55-.65*Math.sin((u-(U-5.25))/10.5*PI);
    wall(a,curve(a),b,curve(b),5.5,9.65,{mat:'glass',thick:.04});
    beam([a,curve(a),5.5],[a,curve(a),9.65],.065,0x303a35);
    wall(a,curve(a)-.15,b,curve(b)-.15,4.0,5.5,{mat:0x777b79,thick:.12,solid:false});
    beam([a,curve(a)-.18,5.7],[b,curve(b)-.18,5.7],.06,0x222725);
    beam([a,curve(a)-.18,6.65],[b,curve(b)-.18,6.65],.06,0x222725);
    for(let j=0;j<3;j++){const u=a+j*(b-a)/3;beam([u,curve(u)-.18,5.7],[u,curve(u)-.18,6.65],.025,0x222725);}
  }
  sign('강남귀금속타운',U,-4.45,4.77,10.5,1.02,'N',{fg:'#fafaf1',bold:true});
  sign('순금 · 예물 · 보석 · 시계수리',U,-4.42,3.85,9.5,.32,'N',{bg:'#171918',fg:'#efa34c'});
  for(const u of [U-3.35,U+3.35])box(u,-.12,0,.12,.16,3.4,metal,{solid:false});
  box(U,-.12,3.15,6.8,.16,.2,metal,{solid:false});
  // Side glass leaves: open centre is a real doorway, not a glass collision plane.
  for(const du of [-2.6,2.6])box(U+du,.03,0,1.2,.06,3,'glass');
  for(const [u,w] of [[7.9,15.5],[38.2,15.7]]){
    box(u,-.55,9.9,w,1.3,.32,'lebon-cyan',{solid:false});
    sign('헬릭스동물메디컬센터',u,-1.22,10.65,w-.7,.65,'N',{fg:'#dddcd1'});
  }
  sign('24시 동물응급센터',39.8,-.18,9.35,11.8,.82,'N',{bg:'#bd294c',fg:'#fff'});
  box(W-2,-.1,13,2.7,.2,22,0xc6b08a,{solid:false});
  ['강','남','귀','금','속','타','운'].forEach((t,i)=>sign(t,W-2,-.22,33.5-i*3,2.3,2.4,'N',{fg:i<5?'#9d2733':'#28386b'}));
  sign(['강','남','꽃','도','매','상','가'],W+.2,3.4,23,2.6,22,'E',{fg:'#237c4b',bg:'#cfbb98'});
  sign(['꽃','강남 꽃도매상가','3층·4층 생화 · 소재 · 꽃자재','5층 화환 · 조화','6층 도자기 · 조화','← 상가 입구'],W-2.8,-.2,3.7,4.3,5.9,'N',{bg:'#17683f',fg:'#f2e8ad',box:.12});
  sign('르본시티상가 재개발 대상지 선정',8.8,-.21,8.8,13.2,.65,'N',{bg:'#f0ecdf',fg:'#96434b'});
  sign(['강남귀금속타운','후문 입구'],W+.21,17.8,3.7,4.8,.9,'E',{bg:'#555956',fg:'#fff'});
  sign(['강남 귀금속 타운','← 후문 입구'],W+2.1,19.9,1.25,2,1.8,'E',{bg:'#f2eee4',fg:'#25487c',twoSided:true,box:.1});
  // Photo01's planted, translucent side passage; this side assignment is inferred.
  slab(W,1.5,W+3.5,14.5,0,{mat:'sidewalk',thick:.08});
  box(W+3.05,8,0,.65,12,.7,'brick');
  for(let j=0;j<8;j++){
    const a=W+j*3.5/8,b=W+(j+1)*3.5/8,yy=u=>3.1+.48*Math.sin((u-W)/3.5*PI);
    K.quad('glass',[at(a,1.5,yy(a)),at(b,1.5,yy(b)),at(b,14.5,yy(b)),at(a,14.5,yy(a))],[0,1,0]);
    for(const v of [1.5,4.75,8,11.25,14.5])beam([a,v,yy(a)],[b,v,yy(b)],.06,0x454e49);
  }
  for(let j=0;j<9;j++){
    const v=2.3+j*1.35;cyl(W+3.03,v,.7,.28,.65,[0xe4e4d7,0x6d746c,0xc4c4b5][j%3]);
    beam([W+3.03,v,1.2],[W+3.03,v,2.7],.055,0x786344);
    for(let k=0;k<7;k++){
      const a=k*2.4,h=1.7+(k%3)*.32;
      K.quad(0x426c38,[at(W+3.03,v,h),at(W+3.03+Math.cos(a)*.6,v+Math.sin(a)*.6,h+.3),at(W+3.03+Math.cos(a+.3)*.65,v+Math.sin(a+.3)*.65,h+.42),at(W+3.03,v,h+.1)],[0,1,0]);
    }
  }
  // Parking sign / gate at the surveyed map pins; no new road or parking geometry claimed.
  K.box({x:-269.3,z:-6.7,y:0,w:5.8,d:3.4,h:3.2,rotY:R,mat:0x222b2b});
  K.box({x:-269.3,z:-6.7,y:3.2,w:6.3,d:3.8,h:.22,rotY:R,mat:0xc6c7b8});
  K.sign('TODAI 토다이',{x:-269.8,z:-8.5,y:4.1,w:7,h:1.3,rotY:F.N,bg:null,fg:'#254b89'});
  K.sign(['K-POP 롤러스케이트장','K-뷰티 카페 · 오픈 예정'],{x:-270,z:-8.55,y:2.35,w:5,h:.9,rotY:F.N,bg:'#ebe1ad',fg:'#3e3e3b'});
  K.box({x:-276.4,z:-10.1,y:0,w:2.1,d:2,h:2.6,mat:0xbec4b1});
  K.box({x:-276.4,z:-11.12,y:1.1,w:1.7,d:.04,h:1.15,mat:'glass',solid:false});
  K.box({x:-277.5,z:-13.3,y:0,w:.55,d:.55,h:1.1,mat:0xeebf35});
  K.box({x:-275.7,z:-13.3,y:.95,w:3.1,d:.12,h:.14,mat:0xf5f2df,solid:false});
  for(let i=0;i<5;i++)K.box({x:-276.8+i*.55,z:-13.3,y:.95,w:.2,d:.13,h:.15,mat:0xc12d2d,solid:false});

  // Furnishing helpers: static rings and leaves are merged raw faces, not hundreds of separate meshes.
  const ring=(u,v,y,r,mat=gold,vertical=false)=>{
    const n=10,th=.018;
    for(let k=0;k<n;k++){
      const a=k*PI*2/n,b=(k+1)*PI*2/n;
      const pt=(t,rr)=>vertical?at(u+Math.cos(t)*rr,v,y+Math.sin(t)*rr):at(u+Math.cos(t)*rr,v+Math.sin(t)*rr,y);
      K.quad(mat,[pt(a,r-th),pt(a,r),pt(b,r),pt(b,r-th)],vertical?[S,0,C]:[0,1,0]);
    }
  };
  const lamp=(u,v,y)=>{cyl(u,v,y,.14,.035,metal,{solid:false,seg:8});cyl(u,v,y-.012,.105,.02,{tex:'emit',color:0xf6f5de},{solid:false,seg:8});};
  const directory=(u,v,y,face='S')=>{
    sign('르본시티  REBORN CITY',u,v,y+2.85,3.3,.42,face,{fg:'#8a713a'});
    sign(['층별 안내','8층  사무실','7층  학원 · 한의원 · 사무실','6층  조화 · 프리저브드플라워','5층  조화 · 생화 · 화환','4층  생화 · 소재 · 바구니','3층  생화 · 소재 · 바구니','2층  헬릭스동물메디컬센터','1층  강남귀금속타운 · 공주방','지하1층  토다이 · 기전실'],u,v,y+1.65,3.1,2.1,face,{bg:'#e0dfd3',fg:'#283b5b',box:.08});
  };
  const named=new Map([[15,'아뜨리에주얼리'],[19,'에덴쥬얼리'],[21,'홍보석'],[25,'그랑프리'],[31,'승보주얼리'],[32,'에스더'],[34,'사라쥬얼리'],[37,'영쥬얼리'],[41,'쥬얼리예보'],[43,'삼보사'],[69,'예성쥬얼리'],[122,'보다쥬얼리']]);
  const extra=['러브스톤','삼정보석','윤보석','비비드','금보사','실비아쥬얼리','코아주얼리','라보떼주얼리'];
  const booths=[];
  for(const [u,face] of [[3.3,'E'],[12.6,'W'],[17.9,'E'],[28.4,'W']])for(const v of [9,11.2,13.4,15.6,21,23.2,25.4,27.6])booths.push({u,v,face});
  for(const [u,face] of [[34.6,'E'],[43.1,'W']])for(const v of [9,11.2,13.4,21])booths.push({u,v,face});
  for(const u of [2.4,5.5,8.6,11.7,14.8,17.9,21,24.1,27.2,30.3])booths.push({u,v:35.2,face:'N'});
  for(const u of [2.4,15.9,19,27.5,30.6,33.7,36.8,39.9,43])booths.push({u,v:2.5,face:'S'});
  // 59 model booths spanning the evidenced address range. Exact count/order is unverified.
  const nums=[15,19,21,25,31,32,34,37,41,43,69,122];
  for(let n=16;nums.length<booths.length;n++)if(!nums.includes(n))nums.push(n);
  const booth=(b,i)=>{
    const {u,v,face}=b, ns=face==='E'?1:face==='W'?-1:0, vs=face==='S'?1:face==='N'?-1:0;
    const cu=u+ns*1.15,cv=v+vs*1.15,wide=ns?1.7:2.65;
    const dims=ns?[.78,wide]:[wide,.78], backdims=ns?[.24,wide]:[wide,.24];
    box(cu,cv,0,...dims,.72,wood);box(cu,cv,.72,...dims,.06,metal);
    box(cu,cv,.78,...dims,.4,'glass',{solid:false});
    // Red piping and black velvet; polished tiny gold rings/chain lines are visible through the glass.
    box(cu,cv,.79,dims[0]-.1,dims[1]-.1,.045,0x9c1836,{solid:false});
    box(cu,cv,.837,dims[0]-.16,dims[1]-.16,.022,0x191c20,{solid:false});
    for(let row=0;row<3;row++)for(let j=0;j<5;j++){
      const du=ns?(row-1)*.18:(j-2)*.3,dv=ns?(j-2)*.25:(row-1)*.18;
      ring(cu+du,cv+dv,.89,.058+(j%2)*.015);
      if(j===2)box(cu+du,cv+dv,.89,.06,.045,.03,{color:0xf6edd0,gloss:.7},{solid:false});
    }
    box(u-ns*.9,v-vs*.9,.25,...backdims,2.15,wood);
    for(let j=0;j<3;j++){
      const du=ns?0:(j-1)*.65,dv=ns?(j-1)*.43:0;
      box(u-ns*.7+du,v-vs*.7+dv,1.1,ns?.05:.44,ns?.36:.05,.9,0xf1eee2,{solid:false});
      for(let k=0;k<2;k++)ring(u-ns*.66+du+(k-.5)*.14,v-vs*.66+dv,1.57,.13,gold,true);
    }
    const nm=named.get(nums[i])??(i<20?extra[i-12]:['순금 · 예물','보석 · 귀금속','금 · 은 · 시계'][i%3]);
    sign(nm,cu+ns*.45,cv+vs*.45,2.8,wide+.1,.36,face,{bg:'#e9e7de',fg:'#272726'});
    sign(`${nums[i]}호`,cu+ns*.46,cv+vs*.46,2.47,.5,.25,face,{bg:'#273445',fg:'#dec377'});
    for(const t of [-.43,.43]){
      const su=cu+ns*.84+(ns?0:t),sv=cv+vs*.84+(ns?t:0);
      cyl(su,sv,.72,.25,.1,0x965e4c);cyl(su,sv,0,.035,.72,0x2c2926);
      ring(su,sv,.26,.19,metal);
    }
    lamp(cu,cv,3.12);
    if(i%9===0)sign(['오늘의 금 시세','순금 · 상담 문의'],u-ns*.5,v-vs*.5,2.17,wide,.45,face,{bg:'#101013',fg:'#f55b48'});
  };
  const flower=(u,v,y,color,artificial=false)=>{
    cyl(u,v,y,.22,.42,artificial?0xe2dfd3:0x444a42,{seg:7});
    for(let k=0;k<5;k++){
      const a=k*2.4,du=Math.cos(a)*.19,dv=Math.sin(a)*.19,h=.72+(k%3)*.13;
      beam([u+du,v+dv,y+.35],[u+du*1.4,v+dv*1.4,y+h],.025,0x497045);
      const uu=u+du*1.4,vv=v+dv*1.4;
      K.quad(0x537d41,[at(uu,vv,y+h-.25),at(uu+.17,vv+.06,y+h-.12),at(uu+.02,vv+.02,y+h-.1),at(uu-.11,vv-.03,y+h-.2)],[0,1,0]);
      for(let j=0;j<5;j++){const a=j*PI*2/5,b=(j+1)*PI*2/5;K.quad(color,[at(uu,vv,y+h+.035),at(uu+.13*Math.cos(a),vv+.13*Math.sin(a),y+h),at(uu+.17*Math.cos((a+b)/2),vv+.17*Math.sin((a+b)/2),y+h-.025),at(uu+.13*Math.cos(b),vv+.13*Math.sin(b),y+h)],[0,1,0]);}
      cyl(uu,vv,y+h,.035,.035,0xeac461,{solid:false,seg:5});
    }
  };
  for(let fi=0;fi<floors.length;fi++){
    const f=floors[fi],y=f.y,top=floors[fi+1]?.y??38;
    K.detail({floor:f.label,y0:y,y1:top,poly:footprint,name:f.name},()=>{
      directory(16.4,4.45,y);
      sign('계단 ↑',33.7,23.4,y+2.4,1.6,.5,'W',{bg:'#286c50',fg:'#fff'});
      for(const v of [5.6,17.8,30.7])for(const u of [7,17,U,30,40]){
        if(u>34&&v>24)continue;
        box(u,v,top-.44,1.2,.28,.06,{tex:'emit',color:0xf5f5df},{solid:false});
      }
      for(const u of [13.9,32])for(const v of [6.8,19.3,32.1]){
        cyl(u,v,y,.34,1.5,wood,{solid:false});
      }
      if(fi===1){
        booths.forEach(booth);
        // Photo06: TWO aligned black-square inlay lines; not a guessed single diamond stripe.
        for(const u of [U-1.8,U+1.8])for(let v=2;v<33;v+=1.3)box(u,v,.007,.22,.22,.012,{color:0x333734,gloss:.5},{solid:false});
        // Barrel ceiling and stepped cove, above the 6m main passage.
        for(let k=0;k<16;k++){
          const a=-3+k*6/16,b=-3+(k+1)*6/16;
          const yy=t=>4.03+.56*Math.sqrt(Math.max(0,1-t*t/9));
          K.quad(white,[at(U+a,1,yy(a)),at(U+b,1,yy(b)),at(U+b,33,yy(b)),at(U+a,33,yy(a))],[0,-1,0]);
        }
        for(const du of [-3.2,3.2]){
          box(U+du,17,3.66,.44,32,.18,white,{solid:false});
          box(U+du,17,3.91,.42,32,.1,{tex:'emit',color:0xe4f5ef},{solid:false});
          for(let v=3;v<33;v+=3)lamp(U+du,v,3.61);
        }
        // Wrought iron curls at a shop entrance; leave the centre open.
        for(const s of [-1,1])for(let k=0;k<22;k++){
          const a=k*PI/6,b=(k+1)*PI/6,rr=.42*(1-k/30);
          beam([18+s*.9+rr*Math.cos(a),6.8,1.5+rr*Math.sin(a)],[18+s*.9+rr*Math.cos(b),6.8,1.5+rr*Math.sin(b)],.035,0x242827);
        }
        sign('공주방 · 한복',3.5,31.9,2.7,4,.5,'N',{bg:'#e9e3d7'});
        box(3.5,34.1,0,3.5,.6,.9,wood);
        sign('상가관리실',30.9,37.5,2.3,3,.5,'N',{bg:'#eeede2'});
        // No stale numeric gold quote is presented as a current market price.
        sign('강남귀금속타운',U,6.6,3.2,5,.65,'N',{fg:'#755d2c'});
        for(const [u,v] of [[22.2,12],[24.1,24],[8,18],[30,30]]){const p=P(u,v);K.person(p[0],0,p[1],{rotY:R,shirt:0x6a756e,pants:0x353942});}
      }else if(fi>=3&&fi<=6){
        const artificial=fi>=5, names=fi===3?['삼중원예','벧엘원예']:fi===4?['에이스플라워','코벤트원예','청목소재']:fi===5?['보라미화원']:[];
        let n=0;
        for(const u of [4,13.5,29.5,41])for(const v of [10.2,22,33]){
          if(u>34&&v>19)continue;
          const ww=6.5,dd=4.6;
          box(u,v,y,ww,dd,.28,0x6e7569);
          box(u,v+1.8,y+.28,ww,.7,.65,0xb4b9a7);
          sign(names[n]??(artificial?'조화 · 화병 · 리본':'생화 · 소재 · 바구니'),u,v-2.35,y+2.8,ww-.3,.5,'N',{bg:fi===5&&n===0?'#224b9a':artificial?'#e3dacb':'#e8eadd',fg:fi===5&&n===0?'#fff':'#24533b'});
          box(u,v,y+3.4,ww,dd,.1,{tex:'ceiling',color:0xe0dccb},{solid:false});
          for(const du of [-1.8,1.8])box(u+du,v,y+3.28,.08,2.6,.07,{tex:'emit',color:0xf5f0d7},{solid:false});
          const colors=[0xefdfce,0xe9a2b2,0xc36b94,0xeccb4c,0xc7b3d5,0xf2ebe0];
          for(let a=0;a<6;a++)for(let b=0;b<3;b++)flower(u-2.6+a*1.03,v-1.4+b*1.2,y+.28+(b===2?.65:0),colors[(a+b+n)%colors.length],artificial);
          if(artificial)for(let j=0;j<5;j++){
            cyl(u-2+j,v+1.8,y+1,.18,.55,0xddded4,{seg:8});
            ring(u-2+j,v+1.8,y+1.56,.18,0xc5a979);
          }
          n++;
        }
        sign(['강남꽃도매상가',f.name.split(' · ').slice(1).join(' · ')],U,7,y+2.9,6,.85,'N',{bg:'#286c4d',fg:'#fff'});
        if(fi===3||fi===4)sign(['생화시장 주차 안내','영수증 지참 · 주차 확인'],18,4.6,y+2.1,3,.75,'S',{bg:'#f1eee2',fg:'#2b4d3c'});
        // Ribbon spools / basket stock on the artificial-flower levels.
        if(artificial)for(let k=0;k<8;k++){
          const u=2+k*1.6;box(u,37,y+.3,1.25,.65,1.6,wood);
          for(let j=0;j<3;j++)cyl(u,37,y+.5+j*.45,.28,.24,[0xaca3c8,0xe2b7c3,0xc6b17d][j],{seg:8});
        }
        if(fi===6){
          for(const v of [9,13]){
            for(const u of [1.2,6.6])box(u,v,y,.06,.55,2.5,0x303634);
            for(const h of [.35,1.1,1.85]){
              box(3.9,v,y+h,5.6,.65,.07,0x303634);
              for(let j=0;j<8;j++)cyl(1.5+j*.68,v,y+h+.07,.19,.5+(j%3)*.12,'glass',{seg:8,solid:false});
            }
          }
        }
      }else if(fi===2){
        sign('헬릭스동물메디컬센터',17,8.6,y+2.8,11,.75,'N',{fg:'#2b7287'});
        box(16,10.4,y,7,1.15,1.05,{color:0xe0e8e7,gloss:.3});
        sign('접수 · 안내',16,9.8,y+.7,3,.35,'N',{fg:'#287081'});
        for(const u of [4,8,12,16])box(u,14,y+.4,2.5,.8,.48,0x8baba8);
        for(const [v,name] of [[13,'진료실'],[25,'처치실']]){
          sign(name,26.85,v,y+2.3,2,.5,'W',{bg:'#e6eeeb',fg:'#256e7d'});
          const desk=v===25?30.5:35;
          box(desk,v,y+.75,3.3,1.1,.22,metal);box(desk,v,y,2.4,.6,.75,white);
          for(const u of v===25?[31]:[31,40])box(u,v+3,y,1.7,.7,1.8,0xc6d1d0);
        }
        sign('24시 동물응급센터',21,20,y+2.7,7,.65,'N',{bg:'#b83251',fg:'#fff'});
      }else if(fi===0){
        sign(['토다이 반포점','영업 종료'],17,11.8,y+2.5,9,1.3,'N',{bg:'#333d42',fg:'#cececa'});
        for(let v=0;v<18;v++)box(17,11.75,y+.1+v*.18,12,.07,.07,0x626b6b,{solid:false});
        sign('기전실',31.5,34,y+2.2,2.5,.5,'W',{bg:'#dcddd6'});
      }else{
        const names=fi===7?['서초피브로한의원','하선정요리학원','(주)항진 T&D']:['사무실','사무실','사무실'];
        [7,23,38].forEach((u,j)=>{
          sign(names[j],u,11,y+2.5,6,.55,'N',{bg:'#e9e5d9'});
          if(u<34)for(const v of [15,24]){box(u,v,y+.72,3.5,1.4,.1,wood);box(u,v,y,2.2,.8,.72,0xc4c6bf);}
        });
      }
    });
  }
  // Eleven useful arrivals, all on real registered floors, never inside furnishings.
  for(const f of floors){const [x,z]=P(U,f.label==='1F'?7:f.label==='B1'?8:17.8);K.spawn({name:`르본시티 ${f.label} · ${f.name}`,x,z,y:f.y,yaw:R+PI,group:'르본시티'});}
  for(const [name,u,v,yaw] of [['강남귀금속타운 정문',U,-5,R+PI],['강남귀금속타운 후문',W+1.5,17.8,R+PI/2]]){
    const [x,z]=P(u,v);K.spawn({name,x,z,y:0,yaw,group:'르본시티'});
  }
}
