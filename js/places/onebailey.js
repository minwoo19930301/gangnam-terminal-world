// Original procedural illustrations; no reference photographs are published or loaded.
// B1 alignment is inferred inside OSM area 412953594. The west park tunnel follows
// way 1481658416. The east Banpo tunnel 560449165 remains owned by hangang.
// The shared G2 and park endpoints are registered in _junctions.js; keep both open.
export const meta = {
  id:'onebailey', name:'원베일리 공공보행통로', claims:[], claimRoads:[1481658416],
  sources:['https://mediahub.seoul.go.kr/archives/2011689','https://mediahub.seoul.go.kr/archives/2011692',
    'https://www.tfmedia.co.kr/news/article.html?no=170057','https://www.segye.com/newsView/20260427513557',
    'https://www.heraldk.com/article/2026042313575353478',
    'https://www.youtube.com/watch?v=F9MdeqY0Rro','https://www.youtube.com/watch?v=wvUnarSte1A','https://www.youtube.com/watch?v=PN3QyVXbUNg'],
};
const PI=Math.PI, A=[-410,-45], B=[-540,-380], L=Math.hypot(B[0]-A[0],B[1]-A[1]);
const U=[(B[0]-A[0])/L,(B[1]-A[1])/L], V=[U[1],-U[0]], ROT=Math.atan2(U[0],U[1]);
const P=(s,v=0)=>[A[0]+U[0]*s+V[0]*v,A[1]+U[1]*s+V[1]*v];
const R=(s0,v0,s1,v1)=>[P(s0,v0),P(s0,v1),P(s1,v1),P(s1,v0)];
const strip=(a,b,w)=>{const l=Math.hypot(b[0]-a[0],b[1]-a[1]),x=-(b[1]-a[1])/l*w/2,z=(b[0]-a[0])/l*w/2;
  return [[a[0]+x,a[1]+z],[b[0]+x,b[1]+z],[b[0]-x,b[1]-z],[a[0]-x,a[1]-z]];};
const THEMES=['서울의 밤','별빛과 음악','꽃시장의 새벽','잠든 도시','새벽을 여는 사람들','첫차','아침의 시작','출근길',
  '학교 가는 길','도시의 리듬','동네 산책','잠깐의 쉼','즐거운 점심','오후의 햇살','한강을 꿈꾸며','함께 걷는 길',
  '우리 동네','집으로','노을','저녁 식탁','쉼과 가족','오늘의 이야기','달빛 산책','내일을 기다리며'];

// New compositions of the observed subjects, without tracing or attributing these drawings to the artists.
function paintDay(g,W,H,hour){
  const night=hour<6||hour>18, bg=hour===2?'#fff0a3':hour===12?'#48b6d7':night?'#162348':'#e8f0df';
  const poly=(p,c)=>{g.fillStyle=c;g.beginPath();p.forEach(([x,y],i)=>i?g.lineTo(x,y):g.moveTo(x,y));g.closePath();g.fill();};
  const disc=(x,y,r,c)=>{g.fillStyle=c;g.beginPath();g.arc(x,y,r,0,PI*2);g.fill();};
  const line=(p,c,w=3)=>{g.strokeStyle=c;g.lineWidth=w;g.beginPath();p.forEach(([x,y],i)=>i?g.lineTo(x,y):g.moveTo(x,y));g.stroke();};
  const person=(x,y,c,k=1)=>{
    disc(x,y-33*k,12*k,'#f0c6ac');poly([[x-17*k,y-18*k],[x+17*k,y-18*k],[x+23*k,y+20*k],[x-21*k,y+20*k]],c);
    for(const s of [-1,1]){line([[x+s*10*k,y+18*k],[x+s*15*k,y+45*k]],'#233a4c',7*k);disc(x+s*4*k,y-34*k,1.4*k,'#232938');}
  };
  g.fillStyle=bg;g.fillRect(0,0,W,H);disc(450,33,19,night?'#f4dc8a':'#f4ca5d');
  for(let i=0;i<22;i++){const x=i*25,h=18+(i*17+hour*11)%40;g.fillStyle=night?'#293d66':'#a7c9c7';g.fillRect(x,118-h,19,h);
    for(let j=0;j<3;j++){g.fillStyle=night?'#f1cf78':'#edf1d4';g.fillRect(x+4+j*5,123-h,2,3);}}
  if(hour===0||hour===1||hour===23){
    for(let k=0;k<3;k++){g.fillStyle='#d8825b';g.fillRect(135+k*25,112-k*25,220-k*50,23);
      poly([[120+k*24,111-k*25],[370-k*24,111-k*25],[342-k*24,95-k*25],[151+k*24,95-k*25]],'#53a99a');}
    for(const [x,y,c] of [[70,48,'#ef91c6'],[417,55,'#82c9f1']])for(let k=0;k<12;k++){const a=k*PI/6;
      line([[x+Math.cos(a)*8,y+Math.sin(a)*8],[x+Math.cos(a)*33,y+Math.sin(a)*33]],c,2);}
  }else if(hour===2||hour===4||hour===10){
    for(let i=0;i<14;i++){const x=22+i*35,y=100+(i%3)*16;line([[x,y],[x,y+30]],'#30734a');
      for(let k=0;k<5;k++)disc(x+Math.cos(k*PI*.4)*10,y+Math.sin(k*PI*.4)*10,8,['#f5adbc','#eee5f5','#f2bd48'][i%3]);
      disc(x,y,5,'#f7df69');g.fillStyle='#d15e5e';g.fillRect(x-12,y+27,24,12);}
  }else if(hour===12||hour===19){
    for(let i=0;i<3;i++){disc(53+i*46,104,25,'#263d39');disc(53+i*46,104,18,'#fff2cf');disc(53+i*46,104,7,'#e98954');}
    poly([[205,145],[275,36],[330,145]],'#f0c04c');poly([[215,135],[275,49],[317,135]],'#77a958');
    g.fillStyle='#b56a47';g.fillRect(368,62,58,83);g.fillStyle='#e5ded0';g.fillRect(362,59,70,12);line([[407,34],[396,111]],'#e5ddd1',7);disc(461,126,21,'#ed8c56');
  }else if([14,15,18,22].includes(hour)){
    poly([[0,96],[90,61],[185,82],[275,54],[380,87],[W,63],[W,140],[0,140]],'#6e9a74');
    g.fillStyle='#81c7d3';g.fillRect(0,108,W,32);g.fillStyle='#a6bc63';g.fillRect(0,140,W,52);
    for(let i=0;i<25;i++)line([[i*23,122],[i*23+12,122]],'#ecf0d6',2);
    person(125,125,'#ef95a5',.72);person(177,125,'#eac463',.65);person(375,119,'#4f6e9b',.85);
  }else if([3,20,21].includes(hour)){
    g.fillStyle='#d7bd8a';g.fillRect(45,43,100,68);g.fillStyle='#6b90a2';g.fillRect(52,49,86,56);
    person(203,102,'#9b68a6',.95);person(265,111,'#db826c',.75);person(326,100,'#56959a');
    g.fillStyle='#b58450';g.fillRect(167,135,205,13);g.fillRect(184,145,9,35);g.fillRect(347,145,9,35);
  }else{
    for(let i=0;i<5;i++)person(57+i*96,120+((hour+i)%2)*8,['#e9ad63','#ea718b','#61a496'][i%3],.78+(i%2)*.16);
    disc(445,33,25,'#faf4d8');line([[445,15],[445,33],[457,40]],'#243c53');
  }
  g.strokeStyle='rgba(20,34,53,.16)';g.lineWidth=.65;
  for(let x=0;x<W;x+=32){g.beginPath();g.moveTo(x,0);g.lineTo(x,H);g.stroke();}
  for(let y=0;y<H;y+=32){g.beginPath();g.moveTo(0,y);g.lineTo(W,y);g.stroke();}
}
function paintCubist(g,W,H,part){
  const cs=['#008cce','#1468ac','#48b2d5','#153a75','#f4ae39','#e4ddd3'];
  const poly=(p,c)=>{g.fillStyle=c;g.beginPath();p.forEach(([x,y],i)=>i?g.lineTo(x,y):g.moveTo(x,y));g.closePath();g.fill();};
  g.fillStyle='#148fc5';g.fillRect(0,0,W,H);
  for(let i=0;i<13;i++)poly([[i*53-70,H],[i*53+20,0],[i*53+100,H*.45]],cs[(i+part)%6]);
  if(part===1){
    poly([[190,H],[212,132],[290,112],[357,139],[391,H]],'#deddd2');
    for(let y=145;y<H;y+=16){g.fillStyle='#253d60';g.fillRect(209,y,166,7);}
    poly([[247,40],[304,31],[333,65],[320,119],[285,143],[248,114],[232,76]],'#c1c2b8');
    poly([[248,40],[278,34],[270,114],[248,113],[232,76]],'#707b86');
    poly([[277,65],[304,67],[297,75],[276,74]],'#25334d');poly([[247,66],[263,64],[263,74],[245,75]],'#25334d');
    poly([[279,76],[275,97],[290,99]],'#eee8d9');poly([[270,112],[298,110],[283,116]],'#26354b');
  }else if(part===3){
    poly([[260,65],[330,153],[462,H],[83,H],[210,150]],'#1e2948');
    for(let k=0;k<7;k++)poly([[268,115],[80+k*55,H],[116+k*55,H]],k%2?'#be3151':'#6e2949');
    poly([[248,65],[276,61],[291,110],[257,127],[233,109]],'#e8ba91');
    g.strokeStyle='#e8ba91';g.lineWidth=12;g.beginPath();g.moveTo(250,86);g.lineTo(213,48);g.lineTo(253,24);g.stroke();
    g.fillStyle='#282b43';g.beginPath();g.arc(262,50,16,0,PI*2);g.fill();
  }else for(let i=0;i<3;i++){const x=95+i*165,y=78+(i%2)*40;
    poly([[x-65,y],[x,y-42],[x+67,y],[x,y+36]],'#e2e6d8');g.fillStyle='#163762';g.beginPath();g.arc(x,y,21,0,PI*2);g.fill();}
}

export function build(K){
  const F=K.LEVELS.B1,C=F+3.8,floor={tex:'ob-granite',gloss:.3};
  const box=(s,v,y,w,h,d,mat,solid=false)=>{const [x,z]=P(s,v);return K.box({x,z,y,w,h,d,rotY:ROT,mat,solid});};
  const wall=(s0,v0,s1,v1,y0,y1,mat,o={})=>K.wall(...P(s0,v0),...P(s1,v1),y0,y1,{mat,...o});
  const sign=(text,s,v,y,w,h,face=ROT+PI,o={})=>{const [x,z]=P(s,v);K.sign(text,{x,z,y,w,h,rotY:face,bg:'#193951',fg:'#fff',...o});};
  const zone=(name,s0,v0,s1,v1,priority=3)=>K.zone({name,floor:'B1',sub:'지하 보행로',poly:R(s0,v0,s1,v1),y0:F,y1:C,priority});
  const detail=(name,s0,v0,s1,v1,fn)=>K.detail({name,floor:'B1',poly:R(s0,v0,s1,v1),y0:F,y1:C},fn);
  const spawn=(name,s,v=0)=>{const [x,z]=P(s,v);K.spawn({name,x,z,y:F,yaw:Math.atan2(-U[0],-U[1])});};
  const paintStrip=(a,b,w,y,mat)=>K.hpoly(mat,strip(a,b,w),y);
  const pipe=(a,b,y,r,mat,seg=8)=>{const dx=b[0]-a[0],dz=b[1]-a[1],len=Math.hypot(dx,dz),nx=-dz/len,nz=dx/len;
    for(let i=0;i<seg;i++){const a0=i*PI*2/seg,a1=(i+1)*PI*2/seg,p=(q,t)=>[q[0]+nx*Math.cos(t)*r,y+Math.sin(t)*r,q[1]+nz*Math.cos(t)*r];
      K.quad(mat,[p(a,a0),p(b,a0),p(b,a1),p(a,a1)],[nx*Math.cos((a0+a1)/2),Math.sin((a0+a1)/2),nz*Math.cos((a0+a1)/2)]);}};
  K.texture('ob-granite',256,256,(g,w,h)=>{const rnd=K.rand(168911);g.fillStyle='#babdb7';g.fillRect(0,0,w,h);
    for(let i=0;i<6000;i++){g.fillStyle=rnd()<.5?'#a4a9a4':'#d1d1c7';g.fillRect(rnd()*w,rnd()*h,1,1);}g.fillStyle='#828d8a';g.fillRect(0,0,w,1);g.fillRect(0,0,1,h);},[.9,.9]);
  K.texture('ob-white-tile',256,128,(g,w,h)=>{g.fillStyle='#e2e4dd';g.fillRect(0,0,w,h);g.strokeStyle='#a8b4b2';g.lineWidth=1;
    for(let x=0;x<w;x+=64)for(let y=0;y<h;y+=32)g.strokeRect(x,y,64,32);},[1.2,.6]);
  K.texture('ob-tactile',64,64,(g,w,h)=>{g.fillStyle='#cfab35';g.fillRect(0,0,w,h);g.fillStyle='#e6c653';for(let x=5;x<w;x+=12)g.fillRect(x,0,5,h);},[.36,.36]);
  K.texture('ob-ceiling',128,128,(g,w,h)=>{g.fillStyle='#323c40';g.fillRect(0,0,w,h);g.strokeStyle='#19252a';g.lineWidth=2;g.strokeRect(0,0,w,h);},[.9,.9]);
  K.texture('ob-column',256,512,(g,w,h)=>{g.fillStyle='#008ec9';g.fillRect(0,0,w,h);g.strokeStyle='#13629a';g.lineWidth=6;
    for(let i=0;i<4;i++){g.beginPath();g.ellipse(75+i*30,100+i*100,58,43,i*.7,0,PI*2);g.stroke();}
    g.strokeStyle='#f1a635';g.lineWidth=13;g.beginPath();g.moveTo(0,310);g.bezierCurveTo(75,280,135,350,256,310);g.stroke();},[2.9,3.8]);
  K.texture('ob-charcoal-tile',256,128,(g,w,h)=>{g.fillStyle='#333638';g.fillRect(0,0,w,h);g.strokeStyle='#535859';g.lineWidth=1;
    for(let y=0;y<h;y+=32)for(let x=-64;x<w;x+=128)g.strokeRect(x+(y%64?64:0),y,128,32);},[1.2,.6]);

  K.slab(R(-26,-7,L,7),F,{mat:floor});
  K.slab(R(-26,-7,280,7),C+.25,{mat:'concrete',under:'ob-ceiling',thick:.25,walk:false});
  K.slab(R(280,-7,L,7),C+.25,{mat:'concrete',under:0xd8d9d4,thick:.25,walk:false});
  wall(-16,-7,L,-7,F,C,'ob-charcoal-tile');
  for(const [a,b] of [[-16,33],[37,52],[56,88],[92,155]])wall(a,7,b,7,F,C,{tex:'tile',color:0xc5c4ba});
  wall(213,7,L,7,F,C,{tex:'tile',color:0xbfc4c1});
  wall(178,7,182,7,F,C,0x565f62);wall(210,7,213,7,F,C,0x565f62);
  K.slab(R(155,7,213,23),F,{mat:floor});
  for(const [a,b] of [[155,182],[210,213]])K.slab(R(a,7,b,23),C+.25,{mat:'concrete',under:'ob-ceiling',thick:.25,walk:false});
  wall(155,7,155,23,F,.6,0x707a79);wall(213,7,213,23,F,.6,0x707a79);
  wall(155,23,213,23,F,.6,{tex:'ob-granite',color:0xb7bcb9});
  wall(182,7,182,23,F,0,0x6f7876);wall(210,7,210,23,F,0,0x6f7876);
  K.groundHole(R(182,7,210,23));
  for(const [a,b,c,d] of [[182,7,210,7],[182,23,210,23],[182,7,182,23],[210,7,210,23]])wall(a,b,c,d,0,1.15,'glass',{thick:.06});
  zone('원베일리 공공보행통로',-26,-7,L,7,2);zone('서울의 24시간',0,-7,278,7,4);
  zone('고터·세빛 관광안내센터',155,7,182,23,6);zone('대나무 중정',182,7,210,23,6);
  zone('피카소 벽화길',280,-7,345,7,5);zone('관광특구 라운지',345,-7,L,7,5);
  spawn('원베일리 · 서울의 24시간',5);spawn('고터·세빛 관광안내센터',165,3);spawn('대나무 중정',197,8.5);
  spawn('피카소 벽화길',285);spawn('관광특구 라운지',350);
  for(let s=286;s<345;s+=8)for(const v of [-3.7,3.7])box(s,v,F,.85,3.8,.85,'ob-column',true);
  for(const s of [-10,0])for(const v of [-5,5])box(s,v,F,.7,3.8,.7,0xc4c8c0,true);

  // The edited walk establishes these connected spaces, but not their surveyed side or distance.
  // Put all three doors on a side branch, leaving the through route and midpoint center intact.
  K.slab(R(24,7,110,29),F,{mat:floor});
  K.slab(R(48,29,80,40),F,{mat:floor});
  for(const [s0,s1] of [[24,48],[80,110]])K.slab(R(s0,7,s1,29),C+.25,{mat:'concrete',under:'ceiling',thick:.25,walk:false});
  for(const s of [24,48,80,110])wall(s,7,s,29,F,C,{tex:'darkstone',color:0x858783});
  wall(24,29,48,29,F,C,'darkstone');wall(80,29,110,29,F,C,'wood');
  wall(48,29,48,40,F,1.15,'concrete');wall(80,29,80,40,F,1.15,'concrete');
  K.groundHole(R(48,7.2,80,40));
  // Broad stone seating and a separate walking stair both reach the open-air upper landing.
  for(let i=0;i<15;i++)box(63,17+(i+.5)*1.4,F,1.4,(i+1)*.4,22,floor,true);
  K.stairs(...P(77,17),...P(77,38),{w:3,ya:F,yb:0,mat:floor,rails:true});
  K.slab(R(48,38,80,42),0,{mat:floor});
  wall(48,8,80,8,0,1.05,'glass',{thick:.05});wall(48,40,74,40,0,1.05,'glass',{thick:.05});
  zone('원베일리 공공개방시설 · 클라이밍',24,7,48,29,5);
  zone('원베일리 야외무대',48,7,80,40,5);
  zone('원베일리 공공개방시설 · 라운지',80,7,110,29,5);
  K.zone({name:'원베일리 야외무대 상부',floor:'1F',sub:'공공개방시설 · 지하보행로 계단',poly:R(48,38,80,42),y0:0,y1:3,priority:5});

  // Open-ended connectors. Cut their sidewalls back at turns so elbow landings stay traversable.
  const corridor=(a,b,w,name)=>{
    const poly=strip(a,b,w),l=Math.hypot(b[0]-a[0],b[1]-a[1]),d=[(b[0]-a[0])/l,(b[1]-a[1])/l],cut=Math.min(w*.65,l*.24);
    K.slab(poly,F,{mat:floor});K.slab(poly,C+.25,{mat:'concrete',under:'ob-ceiling',thick:.25,walk:false});
    const sides=strip([a[0]+d[0]*cut,a[1]+d[1]*cut],[b[0]-d[0]*cut,b[1]-d[1]*cut],w);
    for(const [i,j] of [[0,1],[3,2]])K.wall(...sides[i],...sides[j],F,C,{mat:{tex:'tile',color:0xc6cbc3},thick:.18});
    K.zone({name,floor:'B1',sub:'지하 보행로',poly,y0:F,y1:C,priority:2});
    K.detail({name,floor:'B1',poly,y0:F,y1:C},()=>{
      paintStrip(a,b,.35,F+.012,'ob-tactile');const rot=Math.atan2(d[0],d[1]);
      for(let t=4;t<l;t+=8)K.box({x:a[0]+d[0]*t,z:a[1]+d[1]*t,y:C-.25,w:3,h:.06,d:.17,rotY:rot,mat:{tex:'emit',color:0xf2f2e6},solid:false});
    });
  };
  corridor([-333,-58],P(-22),11,'원베일리 연결 보행로');
  const plaza=[[-345,-72],[-310,-72],[-310,-43],[-345,-43]];
  K.slab(plaza,F,{mat:floor});
  K.slab([[-342,-48],[-335,-48],[-335,-37],[-342,-37]],F,{mat:floor});
  const stairTop=[-318,-38],stairBot=[-330,-59];K.groundHole(strip(stairTop,stairBot,5.2));
  K.stairs(...stairBot,...stairTop,{w:4.5,ya:F,yb:0,mat:floor,rails:true});
  K.slab(strip([-323,-36],[-310,-36],5),0,{mat:floor});K.slab(strip([-310,-36],[-304.2464,-29.1309],4),0,{mat:floor});
  K.slab([[-345,-72],[-335,-72],[-335,-43],[-345,-43]],C+.25,{mat:'concrete',under:'ob-ceiling',thick:.25,walk:false});
  K.slab([[-335,-72],[-310,-72],[-310,-65],[-335,-65]],C+.25,{mat:'concrete',under:'ob-ceiling',thick:.25,walk:false});
  K.zone({name:'고투몰 G2 · 원베일리 공개공지',floor:'B1',sub:'계단 · 공공보행통로 입구',poly:plaza,y0:F,y1:C,priority:3});
  K.zone({name:'원베일리 보행로 입구',floor:'1F',sub:'고투몰 G2 연결',rect:[-325,-42,-307,-32],y0:0,y1:3.8,priority:4});
  K.slab([[-325,-42],[-307,-42],[-307,-32],[-325,-32]],3.7,{mat:'metal',under:'ob-ceiling',thick:.2,walk:false});
  K.slab([[-342,-48],[-335,-48],[-335,-38],[-342,-38]],0,{mat:floor});K.slab([[-339,-41],[-319,-41],[-319,-36],[-339,-36]],0,{mat:floor});
  K.elevator({name:'원베일리 공개공지 승강기',x:-338.5,z:-44.8,rotY:0,w:2.5,d:2.5,
    floors:[{label:'B1',y:F,name:'지하 보행로'},{label:'1F',y:0,name:'고투몰 G2 방면'}]});
  K.spawn({name:'고투몰 G2 · 원베일리 광장',x:-332,z:-66,y:F,yaw:PI/2});
  K.sign(['원베일리 공공보행통로','고터·세빛 관광안내센터 · 한강공원'],{x:-316,y:2.6,z:-32.2,w:8,h:.8,bg:'#eef0e4',fg:'#263d4d'});
  // Exact B1 landing of J_ONEBAILEY_G2, already opened by gotomall.
  corridor([-289.8764,-36.3812],[-294,-47],2.8,'고투몰 G2 연결부');corridor([-294,-47],[-310,-58],4.5,'고투몰 G2 연결부');
  K.slab(strip([-310,-58],[-326,-61],5),F,{mat:floor});
  K.detail({name:'G2 공개공지',floor:'B1',poly:plaza,y0:F,y1:C},()=>{
    K.sign(['고터·세빛 관광안내센터 및 피카소 벽화 가는 길','반포한강공원 →'],{x:-344,y:F+2.8,z:-58,w:8.3,h:.8,rotY:PI/2,bg:'#ead9d5',fg:'#1e2d39'});
    for(const x of [-341,-314]){K.box({x,y:F,z:-68,w:.7,h:3.8,d:.7,mat:0xc8cbc2});
      for(let i=0;i<6;i++)K.box({x:x+.36,y:F+.2+i*.52,z:-68,w:.02,h:.45,d:.68,mat:[0xef545e,0xe7c948,0x209c95,0x45478c][i%4],solid:false});}
    K.sign('공공 보행로 · 자전거는 내려서 이동',{x:-338,y:F+1.7,z:-64,w:4.5,h:.45,rotY:PI/2,bg:'#263d50',fg:'#fff'});
    // A translucent rectangular pavilion beside the exposed stair; no panel crosses the walking lane.
    const colors=[0xef7699,0xf7b05b,0x98d75e,0x69c3bb,0x9d7bd5],rot=Math.atan2(12,21),q=(s,v)=>[-330+12/Math.hypot(12,21)*s+21/Math.hypot(12,21)*v,-59+21/Math.hypot(12,21)*s-12/Math.hypot(12,21)*v];
    for(let i=0;i<5;i++){const a=q(1+i*1.65,3.3);
      for(const v of [3.3,6.5]){const a=q(1+i*1.65,v),b=q(2.65+i*1.65,v),y0=i<2?F+2.7:F+.1;
        K.quad({tex:'glass',color:colors[i]},[[a[0],y0,a[1]],[b[0],y0,b[1]],[b[0],F+3.6,b[1]],[a[0],F+3.6,a[1]]],[.868,0,-.496]);}
      const top=[q(1+i*1.65,3.3),q(2.65+i*1.65,3.3),q(2.65+i*1.65,6.5),q(1+i*1.65,6.5)];
      K.hpoly({tex:'glass',color:colors[i]},top,F+3.6);
      for(const v of [3.3,6.5]){const post=q(1+i*1.65,v);K.box({x:post[0],z:post[1],y:F,w:.09,h:3.7,d:.09,rotY:rot,mat:0x687d75,solid:false});}}
    const endA=q(9.25,3.3),endB=q(9.25,6.5);
    K.quad({tex:'glass',color:0xa790dc},[[endA[0],F,endA[1]],[endB[0],F,endB[1]],[endB[0],F+3.6,endB[1]],[endA[0],F+3.6,endA[1]]],[.496,0,.868]);
    for(const v of [3.3,6.5]){const a=q(5.1,v);K.box({x:a[0],z:a[1],y:F+3.58,w:.12,h:.14,d:8.4,rotY:rot,mat:0x607b73,solid:false});}
    K.sign('반포 한강공원',{x:-307,y:F+2.95,z:-56,w:4.1,h:.5,rotY:Math.atan2(16,11),bg:'#cf5488',fg:'#fff'});
  });
  // Continue the pink G2 cue only on this module's side of the shared doorway.
  K.detail({name:'G2 분홍 길찾기',floor:'B1',rect:[-314,-62,-289,-36],y0:F,y1:C},()=>{
    const a=[-294,-47],b=[-310,-58],l=Math.hypot(16,11),u=[-16/l,-11/l],v=[-u[1],u[0]];
    K.hpoly(0xd95691,strip(a,b,.24),C-.02,false);
    for(let s=2;s<l;s+=3){const tip=[a[0]+u[0]*s,a[1]+u[1]*s];for(const side of [-1,1])K.hpoly(0xd95691,strip([tip[0]-u[0]*.8+v[0]*side*.6,tip[1]-u[1]*.8+v[1]*side*.6],tip,.16),C-.04,false);}
  });
  detail('공공개방시설',24,7,110,40,()=>{
    for(const [s,title] of [[35,'클라이밍'],[54,'야외무대'],[90,'공공개방시설 라운지']]){
      for(const side of [-1,1]){box(s+side*1.95,7.04,F,.15,2.9,.12,0x202628);box(s+side*1.8,8.1,F,2.1,2.75,.05,'glass');}
      box(s,7.04,F+2.85,.15,.18,4.1,0x202628);
      sign(title,s+4.3,6.83,F+1.8,3.4,.5,ROT-PI/2,{bg:null,fg:'#eeeae1'});
      if(s===54)sign('야외무대',s+4.3,6.8,F+2.2,3.4,.32,ROT-PI/2,{bg:'#8d806e',fg:'#f2e9d8'});
    }
    for(const [a,b] of [[24,33],[37,48],[48,52],[56,80],[80,88],[92,110]])wall(a,6.91,b,6.91,F,C,{tex:'ob-granite',color:0x6c706e},{solid:false,thick:.025});
    sign(['클라이밍','원베일리 공공개방시설'],39,6.73,F+1.4,1.7,2.3,ROT-PI/2,{bg:'#5a5686',fg:'#f9df72'});
    sign('나가는 곳',54,7.05,F+2.64,1.3,.3,ROT-PI/2,{bg:'#319867'});
    K.hpoly({tex:'carpet',color:0x535654},R(81,8,109,28),F+.015);
    for(let s=81;s<110;s+=.65)box(s,28.85,F,.07,3.8,.035,0xb19370);
    for(const s of [85,94,103]){
      box(s,16,F,1.6,.72,2,0xe5e2d9,true);box(s,16,F+.72,1.75,.06,2.15,0xf0eee6);
      for(const v of [14.1,17.9]){box(s,v,F,.52,.43,.55,0xe8e8e2,true);box(s,v+(v<16?-.2:.2),F+.43,.10,.44,.57,0xf2f2ea);}
      box(s,18,C-.42,8,.06,.12,{tex:'emit',color:0xfff9e9});box(s,18,C-.36,.02,.36,.02,0xb4bab4);
    }
    for(const s of [50,79]){const [x,z]=P(s,41);K.tree(x,z,{h:4.5,kind:'zelkova'});}
  });

  for(let sec=0;sec<6;sec++)detail('서울의 24시간 · '+sec,sec*46,-7,(sec+1)*46,7,()=>{
    for(let i=sec*4;i<sec*4+4;i++){const a=i*11.5+.06,b=(i+1)*11.5-.06,key='ob-hour-'+i;
      K.texture(key,512,192,(g,w,h)=>paintDay(g,w,h,i),[b-a,2.7]);const p=P(a,-6.88),q=P(b,-6.88);
      K.quad(key,[[p[0],F+.65,p[1]],[q[0],F+.65,q[1]],[q[0],F+3.35,q[1]],[p[0],F+3.35,p[1]]],[V[0],0,V[1]],[[1,0],[0,0],[0,1],[1,1]]);
      sign(THEMES[i],b-4,-6.84,F+.33,5,.35,ROT+PI/2,{bg:null,bold:false});
      const clock='ob-clock-'+i;
      K.texture(clock,256,64,(g,w,h)=>{
        g.fillStyle='#193659';g.fillRect(0,0,w,h);g.fillStyle='#f3f3e9';
        const digits=String(i).padStart(2,'0')+'00',masks=[63,6,91,79,102,109,125,7,127,111];
        const bars=[[5,0,27,5],[31,5,5,23],[31,31,5,23],[5,54,27,5],[0,31,5,23],[0,5,5,23],[5,27,27,5]];
        for(let d=0;d<4;d++){const x=9+d*55+(d>1?14:0),mask=masks[Number(digits[d])];
          for(let k=0;k<7;k++)if(mask&(1<<k)){const [xx,yy,ww,hh]=bars[k];g.fillRect(x+xx,yy+2,ww,hh);}}
        g.fillRect(112,19,6,6);g.fillRect(112,42,6,6);
      },[2.7,.5]);
      const c0=P(a+.3,-6.82),c1=P(a+3,-6.82);
      K.quad(clock,[[c0[0],F+.1,c0[1]],[c1[0],F+.1,c1[1]],[c1[0],F+.6,c1[1]],[c0[0],F+.6,c0[1]]],[V[0],0,V[1]],[[1,0],[0,0],[0,1],[1,1]]);}
  });
  for(let s0=0;s0<L;s0+=45)detail('배관 · 조명 '+s0,s0,-7,Math.min(L,s0+45),7,()=>{
    const s1=Math.min(L,s0+45),pic=s0>=270;paintStrip(P(s0),P(s1),.38,F+.014,'ob-tactile');
    if(pic)paintStrip(P(s0,-5.35),P(s1,-5.35),3,F+.009,0xc9c1a6);
    for(const [v,r,c] of [[-5.5,.12,0xb7363d],[5.4,.10,0x1d3f70],[4.9,.07,0xc77e96]])pipe(P(s0,v),P(s1,v),C-.25,r,c,10);
    for(let s=s0+2;s<s1;s+=5){box(s,0,C-.38,14,.32,.38,0xcbd0ca);pipe(P(s,-6.6),P(s,6.6),C-.55,.035,0x899293,6);
      for(const v of [-4.6,4.6]){box(s+1.3,v,C-.55,.13,.055,2.7,{tex:'emit',color:0xf5fff5});box(s+1.3,v,C-.48,.25,.06,2.9,0xc0c9c7);}
      for(const v of [-5.5,5.4])box(s,v,C-.37,.035,.37,.035,0xa5abaa);
      if(pic)box(s,0,C-.025,2.7,.03,2.1,{tex:'emit',color:0xf0f7e9});}
    if(s0%90===0){sign('반포한강공원 ↑',s0+9,0,F+2.9,3.8,.45);sign('고투몰 G2 ↑',s0+9.1,0,F+2.9,3.8,.45,ROT);
      box(s0+17,6.7,F+.65,.18,1.35,.8,0xb7bdbb);sign('소화전',s0+17,6.57,F+1.5,.6,.2,ROT-PI/2,{bg:'#b24646'});}
  });

  K.slab(R(156,7.1,181,22.8),F+.12,{mat:{tex:'marble',gloss:.5},thick:.12});
  wall(155,7,165,7,F,C,'glass',{thick:.04});wall(169,7,182,7,F,C,'glass',{thick:.04});wall(155,7,182,7,F+2.85,C,0x414c50);
  detail('관광안내센터 실내',155,7,182,23,()=>{
    for(let s=155;s<=182;s+=4.5)box(s,7,F,.11,2.85,.11,0x263338);
    wall(155,6.96,182,6.96,F+2.85,C,{tex:'ob-granite',color:0x7e8580},{solid:false,thick:.03});
    sign('고터·세빛 관광안내센터',168.5,6.82,F+3.3,17,.58,ROT-PI/2,{bg:null});
    sign('11:00 ~ 20:00',171,6.77,F+2.55,2.5,.3,ROT-PI/2,{bg:null,fg:'#f4f4ec'});
    for(const [s,text,bg] of [[160,'서울 여행','#dedad0'],[163,'문화와 산책','#be5578'],[173,'한강 · 세빛섬','#daa65c'],[177,'반포한강공원','#6b9b9b']])sign(text,s,6.82,F+1.6,2.1,1.4,ROT-PI/2,{bg,fg:'#fff'});
    box(168,16,F+.12,2,.95,5.5,0xf0f1e9,true);box(168,16,F+1.07,2.15,.08,5.8,{color:0xf7f4e6,gloss:.5});
    sign('관광 안내',168,14.98,F+.7,2.5,.3,ROT-PI/2,{bg:null,fg:'#465f64'});
    for(const s of [159,175,179]){box(s,21.8,F+.12,.6,2.4,3.2,0xeeeeea,true);
      for(let row=0;row<4;row++)for(let j=0;j<5;j++)box(s-1.28+j*.58,21.43,F+.55+row*.4,.10,.31,.4,[0x86a5bc,0xcacf8e,0xc99fa3,0x76a68d][(row+j)%4]);}
    box(178,7.55,F+.12,.5,2.2,2.6,0x222e3c,true);sign(['서울 여행','한강 · 세빛섬','문화 · 산책'],178,7.25,F+1.4,2.3,1.55,ROT-PI/2,{bg:'#3a8cb1'});
    box(157.2,7.7,F+.12,.65,1.85,1,0xf6efe3,true);sign(['WOWPASS','환전 · 교통카드'],157.2,7.32,F+1.42,.9,.58,ROT-PI/2,{bg:'#172e60'});
    sign('환전',157.2,7.3,F+.55,.8,.28,ROT-PI/2,{bg:'#e78b43'});
    for(const s of [160,167,175])box(s,16,C-.16,4,.06,.22,{tex:'emit',color:0xfff3d9});
    const [x,z]=P(168,17.6);K.person(x,F+.12,z,{shirt:0xeeeeed,pants:0x293c4a,rotY:ROT});
  });
  detail('대나무 중정',182,7,210,23,()=>{
    const rnd=K.rand(16891111);
    for(const [s,v] of [[187,12],[202,12],[193,19],[205,19]]){box(s,v,F,4.3,.45,5.2,0x414b48,true);box(s,v,F+.45,4.1,.025,5,0x6c7054);
      for(let n=0;n<20;n++){const ss=s+(rnd()-.5)*4.4,vv=v+(rnd()-.5)*3.5,h=3.3+rnd()*2.1,[x,z]=P(ss,vv);
        K.cyl({x,z,y:F+.46,r:.035,h,mat:0x718454,seg:5,solid:false});
        for(let j=0;j<7;j++){const yy=F+1.8+j*.48,ds=(rnd()-.5)*1.2,dv=(rnd()-.5)*1.6,a=P(ss,vv),b=P(ss+ds,vv+dv),c=P(ss+ds*.65+.12,vv+dv*.65);
          const leaf=[[a[0],yy,a[1]],[b[0],yy+.16,b[1]],[c[0],yy+.3,c[1]],[a[0],yy+.04,a[1]]];
          for(const normal of [[0,1,0],[0,-1,0]])K.quad([0x557b3b,0x78934a,0x91a959][j%3],leaf,normal);}}
      pipe(P(s-2.1,v),P(s+2.1,v),F+1.5,.035,0x9d8765);}
    for(const s of [184,208])box(s,8.6,F,.15,.9,.15,0x263733);
    sign('대나무 중정',196,7.15,F+2.85,4.3,.5,ROT-PI/2,{bg:'#485f55'});
  });
  for(let part=0;part<5;part++)detail('피카소 벽화 '+part,280+part*13,-7,293+part*13,7,()=>{
    const a=280+part*13,b=a+13,key='ob-cubist-'+part,p=P(a,-6.88),q=P(b,-6.88);
    K.texture(key,512,256,(g,w,h)=>paintCubist(g,w,h,part),[13,3.6]);
    K.quad(key,[[p[0],F+.06,p[1]],[q[0],F+.06,q[1]],[q[0],C-.05,q[1]],[p[0],C-.05,p[1]]],[V[0],0,V[1]],[[1,0],[0,0],[0,1],[1,1]]);
    if(part===2)sign('MÁLAGA LOVES SEOUL',a+6.5,-6.78,F+1.8,11,.75,ROT+PI/2,{bg:null,fg:'#ffdb71'});
    if(part===1)sign('피카소',a+2,-6.78,F+.45,3,.45,ROT+PI/2,{bg:null});
  });

  buildExhibition(K,{F,C,P,R,ROT,sign});
  buildWalkMurals(K,{F,C,P,R,ROT,sign});
  detail('풍선 터널 벤치와 설명 패널',280,-7,345,7,()=>{
    for(const s of [294,318,334]){box(s,5.4,F,1,.42,3.4,0x238bb8,true);box(s,5.4,F+.42,1.05,.08,3.5,0x41a6ce);box(s,5.84,F+.5,.12,.48,3.5,0x287ca8);}
    for(let i=0;i<10;i++)sign(['원더 스트리트',i%2?'함께 걷는 조각 전시':'도란도란'],284+i*5.8,6.83,F+1.65,3.5,1.6,ROT-PI/2,{bg:'#f0eee8',fg:'#4b5356',bold:false});
    for(const [s,v] of [[305,1.8],[330,-1.9]]){const [x,z]=P(s,v);K.person(x,F,z,{shirt:s===305?0x34383c:0xc3b2a0,pants:0x555d64,rotY:ROT});}
  });
  detail('관광특구 라운지',345,-7,L,7,()=>{
    sign('관광특구 라운지',350,6.8,F+2.8,8,.6,ROT-PI/2,{bg:null,fg:'#3e5d63'});
    for(const s of [348,354])for(const v of [-5.7,5.7]){box(s,v,F+.08,.7,.36,3.2,0x5f7373,true);box(s,v,F+.44,.8,.09,3.4,{tex:'wood',gloss:.3});box(s,v+(v>0?.36:-.36),F+.5,.09,.45,3.4,0x7d8880);}
    sign('한강공원 ↑',L-2,0,F+2.9,4,.55);sign('고투몰 G2 ↑',348,0,F+2.9,4,.55,ROT);
  });
  buildParkPassage(K,{F,C,P,L,strip,floor,corridor,paintStrip});
}

function buildWalkMurals(K,{F,C,P,R,ROT,sign}){
  // Additional observed subjects occupy unassigned wall bays; the earlier 24-hour sequence is retained.
  // These are original illustrations, not copies of the reference artists' compositions.
  for(const [part,s] of [[0,7],[1,123],[2,139],[3,225],[4,244],[5,264],[6,-7]]){
    K.detail({name:'보행 영상 벽화 '+part,floor:'B1',poly:R(s-7,3,s+7,7),y0:F,y1:C},()=>{
      const key='ob-walk-mural-'+part;
      K.texture(key,768,256,(g,w,h)=>{
        g.fillStyle=part>3?'#eee7cb':'#303438';g.fillRect(0,0,w,h);
        const disc=(x,y,r,c)=>{g.fillStyle=c;g.beginPath();g.arc(x,y,r,0,PI*2);g.fill();};
        const line=(pts,c,width)=>{g.strokeStyle=c;g.lineWidth=width;g.lineJoin='round';g.lineCap='round';g.beginPath();pts.forEach(([x,y],i)=>i?g.lineTo(x,y):g.moveTo(x,y));g.stroke();};
        if(part===0){
          // Palace silhouette, fireworks and a warm-colored bear-like character.
          for(let k=0;k<3;k++){g.fillStyle='#ca7653';g.fillRect(60+k*28,173-k*39,345-k*56,35);line([[45+k*28,170-k*39],[232,145-k*39],[420-k*28,170-k*39]],'#64a99a',13);}
          for(const [x,y,c] of [[100,50,'#ed91bc'],[460,60,'#85bfdb']])for(let k=0;k<12;k++){const a=k*PI/6;line([[x+Math.cos(a)*13,y+Math.sin(a)*13],[x+Math.cos(a)*42,y+Math.sin(a)*42]],c,3);}
          disc(617,158,67,'#dda14b');disc(565,104,22,'#dda14b');disc(666,105,22,'#dda14b');disc(593,148,5,'#313942');disc(642,148,5,'#313942');line([[602,175],[620,184],[640,170]],'#313942',4);
        }else if(part===1){
          disc(223,131,46,'#efeee5');line([[261,161],[371,93],[484,148],[559,115]],'#efeee5',52);line([[253,164],[426,188],[548,180]],'#235aac',48);line([[188,155],[166,194],[290,199]],'#efeee5',24);
          for(let i=0;i<8;i++)line([[340+i*15,104],[334+i*17,147]],'#303438',3);
          for(let k=0;k<10;k++)disc(44+k*70,36+(k%3)*24,4,'#e2c34f');
        }else if(part===2){
          for(let i=0;i<6;i++){const x=70+i*126;g.fillStyle='#626b83';g.fillRect(x-25,143,91,113);disc(x+17,145,45,'#72619b');disc(x+3,136,5,'#eeeada');disc(x+28,136,5,'#eeeada');disc(x+3,136,2,'#292d36');disc(x+28,136,2,'#292d36');disc(x+60,215,30,'#e2bc3d');}
        }else if(part===3){
          for(let i=0;i<6;i++){const x=65+i*128,c=['#d66579','#4ba5c8','#dc7655'][i%3];disc(x,48,19,c);line([[x,76],[x-13,129],[x+31,158],[x+6,222]],c,25);line([[x-10,125],[x-48,181],[x-64,168]],c,23);line([[x,81],[x+33,102],[x+50,63]],c,17);}
        }else if(part===4){
          for(let i=0;i<4;i++){const x=75+i*180;g.fillStyle='#7a9b9e';g.fillRect(x-47,22,97,93);g.strokeStyle='#495659';g.lineWidth=4;g.strokeRect(x-47,22,97,93);disc(x,137,25,'#cfaa8f');line([[x,166],[x,204]],'#576877',40);line([[x-13,205],[x-20,242]],'#dddccc',18);line([[x+13,205],[x+23,242]],'#dddccc',18);line([[x+54,0],[x+54,28]],'#515c5e',3);g.beginPath();g.arc(x+54,38,11,0,PI*2);g.stroke();}
        }else if(part===5){
          for(let i=0;i<6;i++){const x=65+i*125;disc(x,112,18,'#d9b38b');line([[x,136],[x,205]],['#a85244','#ddb846','#657a65'][i%3],23);g.fillStyle='#8c6347';g.fillRect(x+27,153,47,51);for(let j=0;j<5;j++)disc(x+33+(j%3)*14,152-Math.floor(j/3)*13,9,['#e9ba43','#8b9d52','#b95d45'][j%3]);}
        }else{
          for(let i=0;i<3;i++){const x=120+i*250;disc(x,90,54,'#795e48');disc(x,97,42,'#edc9b2');disc(x-14,94,4,'#3b4449');disc(x+15,94,4,'#3b4449');line([[x-15,111],[x,120],[x+15,111]],'#3b4449',3);line([[x,148],[x,194]],'#c38aab',64);g.fillStyle='#cfb578';g.fillRect(x-100,206,210,25);g.fillStyle='#9cb7c7';g.fillRect(x+28,153,58,51);for(let j=0;j<4;j++)disc(x-87+j*24,38+(j%2)*22,5,'#d8b654');}
        }
        g.strokeStyle='rgba(100,108,109,.3)';g.lineWidth=1;for(let y=0;y<h;y+=32)for(let x=-64;x<w;x+=128)g.strokeRect(x+(y%64?64:0),y,128,32);
      },[12,3]);
      const a=P(s-6,6.84),b=P(s+6,6.84);K.quad(key,[[a[0],F+.45,a[1]],[b[0],F+.45,b[1]],[b[0],F+3.45,b[1]],[a[0],F+3.45,a[1]]],[-V[0],0,-V[1]]);
    });
  }
}

function buildExhibition(K,{F,C,P,R,ROT,sign}){
  let enabled=true;const groups=[],at=P(281,5.7);
  K.interact({x:at[0],z:at[1],y:F+1,r:2.2,label:'2026 원더스트리트 전시 켜기·끄기',onUse:()=>{enabled=!enabled;for(const g of groups)g.visible=enabled;}});
  K.detail({name:'2026 원더스트리트',floor:'B1',poly:R(280,-7,345,7),y0:F,y1:C},()=>{
    const T=K.THREE,mats=new Map(),geo={ball:new T.SphereGeometry(1,12,8),box:new T.BoxGeometry(1,1,1),cone:new T.ConeGeometry(1,1,5),tube:new T.CylinderGeometry(1,1,1,8)};
    const material=c=>{if(!mats.has(c))mats.set(c,new T.MeshLambertMaterial({color:c}));return mats.get(c);};
    const palette=[0xf05d70,0xeec842,0x51b99b,0x709ddd,0xd59bd4,0x72c9cb];
    const group=(s,v)=>{const g=new T.Group(),p=P(s,v);g.position.set(p[0],F,p[1]);g.rotation.y=ROT;g.visible=enabled;K.addMesh(g);groups.push(g);return g;};
    const mesh=(g,k,c,x,y,z,sx,sy,sz,rz=0)=>{const m=new T.Mesh(geo[k],material(c));m.position.set(x,y,z);m.scale.set(sx,sy,sz);m.rotation.z=rz;g.add(m);return m;};
    // Non-colliding exhibition props sit entirely outside the through route. Toggling leaves no blockers.
    for(let i=0;i<12;i++){const g=group(283+i*5.15,-5.3),kind=i===11?9:i<9?i:i%6;mesh(g,'box',0xdee0d4,0,.12,0,2.2,.24,2);
      if(kind<2){const c=kind===0?0xe76d31:0xd83e4d;mesh(g,'ball',c,0,1.65,0,.48,.55,.43);mesh(g,'ball',0x253c52,0,1.68,-.34,.32,.31,.16);mesh(g,'box',c,0,.9,0,.65,.75,.52);
        for(const s of [-1,1]){mesh(g,'tube',c,s*.23,.43,0,.14,.65,.14);mesh(g,'tube',c,s*.45,.98,0,.13,.7,.13,s*.4);}
      }else if(kind===2){mesh(g,'cone',0xf3cf43,0,.58,0,1.1,.7,.65,PI);mesh(g,'ball',0xf4eee2,0,1.13,0,.27,.33,.25);mesh(g,'ball',0xf4eee2,0,1.57,0,.29,.27,.25);mesh(g,'ball',0xc84250,0,1.36,-.19,.25,.13,.1);
        for(const side of [-1,1])mesh(g,'ball',0xf4eee2,side*.12,1.94,0,.08,.28,.09);
      }else if(kind===3){mesh(g,'ball',0xe9e9dd,0,1.18,0,.65,.28,.33);for(const x of [-.4,.4])for(const z of [-.22,.22])mesh(g,'tube',0xe9e9dd,x,.7,z,.055,.9,.055);
        mesh(g,'tube',0xe9e9dd,.45,1.6,0,.13,.8,.13,-.25);mesh(g,'ball',0xe9e9dd,.57,2.04,0,.26,.16,.16);for(const x of [.46,.65])mesh(g,'tube',0xb9a568,x,2.31,0,.025,.45,.025,x>.5?-.3:.3);
      }else if(kind===4){mesh(g,'ball',0x9aaeb1,0,.9,0,.9,.19,.2);mesh(g,'box',0x779d8e,0,.86,0,.27,.08,1.8);mesh(g,'box',0xa4b7b2,-.85,.94,0,.04,.75,.07);mesh(g,'ball',0x707e80,.2,1.18,0,.12,.18,.12);
      }else if(kind===6){mesh(g,'ball',0x65a6d2,0,.95,0,.55,.7,.38);mesh(g,'ball',0x65a6d2,0,1.9,0,.43,.42,.35);
        for(const side of [-1,1]){mesh(g,'ball',0x65a6d2,side*.38,.4,0,.24,.17,.3);mesh(g,'ball',0x233b4c,side*.12,1.98,-.32,.045,.045,.04);}
      }else if(kind===7){mesh(g,'ball',0xd94748,0,1.02,0,.55,.24,.25);mesh(g,'tube',0xd94748,.36,1.7,0,.11,1.4,.12,-.12);mesh(g,'ball',0xd94748,.46,2.44,0,.26,.13,.14);
        for(const x of [-.34,.34])for(const z of [-.18,.18])mesh(g,'tube',0xd94748,x,.61,z,.05,.8,.05);
        for(let j=0;j<4;j++)mesh(g,'ball',0xf3b8aa,.4,1.3+j*.26,-.11,.07,.06,.025);
      }else if(kind===8){mesh(g,'box',0xe6c66a,0,.7,0,.6,.9,.5);for(const side of [-1,1])mesh(g,'ball',0xdb527b,side*.18,1.7,0,.26,.26,.18);mesh(g,'cone',0xdb527b,0,1.4,0,.4,.6,.2,PI);
      }else if(kind===9){mesh(g,'box',0x242a30,0,.55,0,1.9,.25,.72);
        for(let j=0;j<24;j++)mesh(g,'ball',palette[j%6],-.85+(j%8)*.24,.69,-.23+Math.floor(j/8)*.23,.035,.015,.035);
        mesh(g,'ball',0xf2eee4,.94,.8,0,.25,.55,.25);mesh(g,'ball',0xf2eee4,.91,1.33,0,.27,.25,.24);
        for(const x of [.8,1.02])mesh(g,'ball',0xe65d5d,x,1.65,0,.07,.22,.07);
      }else{mesh(g,'ball',0x91a499,0,.42,0,.76,.16,.24);mesh(g,'cone',0x9caaa0,.8,.4,0,.2,1,.15,-PI/2);for(const x of [-.4,.4])for(const z of [-.35,.35])mesh(g,'box',0x97a89e,x,.31,z,.32,.06,.4);}
    }
    for(let k=0;k<3;k++){const g=group(290+k*20,0);for(let i=0;i<26;i++){
      const x=((i*17)%11-5)*.48,z=((i*13)%17-8)*.74,y=3.05+(i%4)*.13;
      const disc=mesh(g,'tube',palette[(i+k)%6],x,y,z,.24+(i%3)*.06,.025,.24+(i%3)*.06);disc.rotation.x=PI/2;disc.rotation.z=i*.7;
      mesh(g,'tube',0xc5c9bd,x,(y+3.8)/2,z,.006,3.8-y,.006);
      if(i%6===0)mesh(g,'tube',palette[(i+k)%6],x,.018,z,.55,.009,.75);}}
    sign(['2026 원더스트리트','도란도란 · 4.27 — 11.15'],281,5.8,F+1.55,3.1,.8,ROT-PI/2,{bg:'#edce60',fg:'#243e55'});
    sign('전시 켜기·끄기',281,5.75,F+.92,2.6,.32,ROT-PI/2,{bg:'#263d55'});
    K.texture('ob-wonder-poster',256,384,(g,w,h)=>{g.fillStyle='#f4ede3';g.fillRect(0,0,w,h);
      for(const [x,y,r,c] of [[82,245,91,'#d594ba'],[168,215,70,'#e4b78a'],[145,298,70,'#b1b2d6']]){g.globalAlpha=.75;g.fillStyle=c;g.beginPath();g.arc(x,y,r,0,PI*2);g.fill();}g.globalAlpha=1;
      g.fillStyle='#303639';g.font='bold 30px sans-serif';g.textAlign='center';g.fillText('원더 스트리트',w/2,52);g.font='15px sans-serif';g.fillText('2026.04.27 ~ 11.15',w/2,h-22);},[1.8,2.3]);
    K.texture('ob-wonder-board',768,384,(g,w,h)=>{g.fillStyle='#f5f1e6';g.fillRect(0,0,w,h);g.fillStyle='#323633';g.font='bold 34px sans-serif';g.textAlign='center';g.fillText('당신의 오늘을 그려주세요',w/2,48);
      for(let j=0;j<5;j++)for(let i=0;i<18;i++){const x=23+i*42,y=96+j*58;g.fillStyle=['#dcc7b0','#bca39a','#e4c4b6','#afbbb1'][i%4];g.beginPath();g.ellipse(x,y,13,17,(i%3-1)*.15,0,PI*2);g.fill();g.strokeStyle='#55504d';g.lineWidth=1;g.beginPath();g.arc(x,y+3,6,0,PI);g.stroke();g.fillStyle='#514b49';g.fillRect(x-5,y-4,2,2);g.fillRect(x+4,y-4,2,2);}},[8,3]);
    for(const [s,key,w,h] of [[339.65,'ob-wonder-poster',1.8,2.3],[327,'ob-wonder-board',8,3]]){const p=P(s-w/2,6.82),q=P(s+w/2,6.82);K.quad(key,[[p[0],F+.45,p[1]],[q[0],F+.45,q[1]],[q[0],F+.45+h,q[1]],[p[0],F+.45+h,p[1]]],[-V[0],0,-V[1]]);}
  });
}

function buildParkPassage(K,{F,C,P,L,strip,floor,corridor,paintStrip}){
  const a=[-513.03,-465.14],b=[-565.03,-596.26],len=Math.hypot(b[0]-a[0],b[1]-a[1]);
  const d=[(b[0]-a[0])/len,(b[1]-a[1])/len],n=[-d[1],d[0]],rot=Math.atan2(d[0],d[1]);
  const p=(s,v=0)=>[a[0]+d[0]*s+n[0]*v,a[1]+d[1]*s+n[1]*v];
  corridor(P(L-1),[-526,-420],9,'한강공원 연결 보행로');corridor([-526,-420],a,8,'나들목 진입 보행로');
  K.slab(strip(a,p(len-36),7),F,{mat:floor});K.slab(strip(a,p(len-36),7.5),F+3.7,{mat:'concrete',under:'ob-white-tile',thick:.25,walk:false});
  K.ramp(...p(len-36),...b,{w:7,ya:F,yb:0,mat:floor,rails:true});K.groundHole(strip(p(len-37),p(len+3),7.8));
  // _19 visibly looks DOWN a final outdoor flight. Keep the accessible route alongside it;
  // the raised landing is a relief approximation, not a claim that the whole park is below y=0.
  K.groundHole([p(len-38,-6.8),p(len+3,-6.8),p(len+3,-3.4),p(len-38,-3.4)]);
  K.slab([p(len-40,-6.6),p(len-35,-6.6),p(len-35,0),p(len-40,0)],F,{mat:floor});
  K.stairs(...p(len-36,-5),...p(len-11,-5),{w:2.8,ya:F,yb:1.2,mat:floor,rails:true});
  K.slab(strip(p(len-11,-5),p(len-7,-5),2.8),1.2,{mat:floor});
  K.stairs(...p(len-7,-5),...p(len+2,-5),{w:2.8,ya:1.2,yb:0,mat:floor,rails:true});
  K.slab([p(len+1,-6.7),p(len+5,-6.7),p(len+5,0),p(len+1,0)],0,{mat:'sidewalk'});
  K.zone({name:'한강공원 출구 계단',floor:'1F',sub:'세빛섬 방향 · 지상 연결',poly:strip(p(len-11,-5),p(len+5,-5),3.2),y0:0,y1:4,priority:5});
  K.slab(strip(b,p(len+8),7),0,{mat:'sidewalk'});const exit=p(len+8),park=[-592,-625];K.slab(strip(exit,park,5),0,{mat:'sidewalk'});
  for(const s of [-1,1])K.wall(...p(0,s*3.55),...p(len-(s<0?40:36),s*3.55),F,F+3.45,{mat:'ob-white-tile',thick:.18});
  K.zone({name:'한강공원 나들목',floor:'B1',sub:'원베일리 · 한강공원 연결',poly:strip(a,p(len-36),7.5),y0:F,y1:F+3.7,priority:4});
  K.zone({name:'한강공원 연결 경사로',floor:'B1',sub:'공원 출입구',poly:strip(p(len-36),b,7.5),y0:F,y1:2.5,priority:4});
  K.zone({name:'원베일리 · 한강공원 입구',floor:'1F',sub:'지하 보행로',poly:strip(b,p(len+5),7),y0:0,y1:3.5,priority:3});
  K.slab(strip(b,p(len+4),7.6),3.4,{mat:'metal',under:0xe8eadf,thick:.2,walk:false});
  K.spawn({name:'원베일리 · 한강공원 출입구',x:exit[0],z:exit[1],y:0,yaw:Math.atan2(-d[0],-d[1])});
  K.texture('ob-river',768,256,(g,w,h)=>{g.fillStyle='#deeee9';g.fillRect(0,0,w,h);
    for(let i=0;i<20;i++){g.fillStyle=['#a1c0c6','#a9b7bb','#93adb5'][i%3];g.fillRect(i*40,70-(i*13)%43,28,90);}
    g.fillStyle='#5fa4c1';g.fillRect(0,134,w,h);for(let i=0;i<32;i++){g.strokeStyle='#c2dedc';g.beginPath();g.moveTo(i*27,(i%5)*17+151);g.lineTo(i*27+18,(i%5)*17+151);g.stroke();}
    g.fillStyle='#d38b5b';g.beginPath();g.moveTo(280,197);g.lineTo(405,197);g.lineTo(381,220);g.lineTo(310,220);g.fill();
    g.fillStyle='#e15857';g.beginPath();g.moveTo(305,168);g.lineTo(348,132);g.lineTo(390,168);g.fill();g.fillStyle='#d7d5b3';g.fillRect(346,164,4,34);
  },[12,2.1]);
  for(let s0=0;s0<len-36;s0+=32){const s1=Math.min(s0+32,len-36);K.detail({name:'나들목 타일 · 한강 벽화 '+s0,floor:'B1',poly:strip(p(s0),p(s1),7.5),y0:F,y1:F+3.7},()=>{
    paintStrip(p(s0),p(s1),.35,F+.014,'ob-tactile');
    for(const side of [-1,1]){K.wall(...p(s0,side*3.43),...p(s1,side*3.43),F+.24,F+.4,{mat:0xd68a3e,thick:.015,solid:false});
      for(let s=s0+2;s<s1-10;s+=13){const x=p(s,side*3.4),y=p(s+12,side*3.4);K.quad('ob-river',[[x[0],F+.65,x[1]],[y[0],F+.65,y[1]],[y[0],F+2.75,y[1]],[x[0],F+2.75,x[1]]],[-side*n[0],0,-side*n[1]]);}}
    for(let s=s0+3;s<s1;s+=6){const q=p(s);K.box({x:q[0],z:q[1],y:F+3.3,w:2.8,h:.06,d:.12,rotY:rot,mat:{tex:'emit',color:0xf9f9e4},solid:false});}
    const q=p(s0+6);K.sign('반포한강공원 ↑',{x:q[0],z:q[1],y:F+2.85,w:4,h:.5,rotY:rot+PI,bg:'#326173',fg:'#fff'});
  });}
  const tact=strip(p(len-36),b,.35);K.quad('ob-tactile',tact.map((q,i)=>[q[0],(i===0||i===3?F:0)+.018,q[1]]),[0,1,0],[[0,0],[0,100],[1,100],[1,0]]);
  K.detail({name:'흰 아치 터널 · 세빛섬 안내',floor:'B1',poly:strip(p(64),p(len-40),7.5),y0:F,y1:F+3.7},()=>{
    // Preserve the earlier river artwork upstream; the newer final white section has a curved shoulder.
    for(const side of [-1,1]){
      K.wall(...p(64,side*3.38),...p(len-40,side*3.38),F,F+2.35,{mat:0xefefea,thick:.025,solid:false});
      for(let k=0;k<8;k++){const t0=k*PI/16,t1=(k+1)*PI/16,cross=t=>[side*(2.5+.88*Math.cos(t)),F+2.35+.88*Math.sin(t)];
        const [v0,y0]=cross(t0),[v1,y1]=cross(t1),a=p(64,v0),b=p(len-40,v0),c=p(len-40,v1),e=p(64,v1);
        K.quad(0xf1f1ed,[[a[0],y0,a[1]],[b[0],y0,b[1]],[c[0],y1,c[1]],[e[0],y1,e[1]]],[-side*n[0]*Math.cos((t0+t1)/2),-Math.sin((t0+t1)/2),-side*n[1]*Math.cos((t0+t1)/2)]);}
      for(let s=67;s<len-43;s+=6){const q=p(s,side*3.32);K.box({x:q[0],z:q[1],y:F+.22,w:.06,h:1.8,d:.09,rotY:rot,mat:{tex:'emit',color:0xfff4df},solid:false});}
    }
    K.hpoly(0xf3f3ed,[p(64,-2.5),p(len-40,-2.5),p(len-40,2.5),p(64,2.5)],F+3.23,false);
    for(const s of [70,90]){const q=p(s);K.sign('반포한강공원 · 세빛섬 ↑',{x:q[0],z:q[1],y:F+2.85,w:3.8,h:.38,rotY:rot+PI,bg:'#f3f3ed',fg:'#404f54'});}
  });
  K.detail({name:'출구 하행 계단 점자 안내',floor:'1F',poly:strip(p(len-11,-5),p(len+5,-5),3.2),y0:0,y1:4},()=>{
    paintStrip(p(len-10,-5),p(len-7.3,-5),.35,1.215,'ob-tactile');paintStrip(p(len-7.5,-6),p(len-7.5,-4),.55,1.22,'ob-tactile');
    const t=strip(p(len-7,-5),p(len+2,-5),.35);K.quad('ob-tactile',t.map((q,i)=>[q[0],(i===0||i===3?1.2:0)+.025,q[1]]),[0,1,0]);
  });
  const q=p(len+1,4.1);K.sign(['원베일리 공공보행통로','고투몰 · 관광안내센터 ↓'],{x:q[0],z:q[1],y:2.2,w:4.7,h:1,rotY:rot,bg:'#edbc60',fg:'#244957',twoSided:true});
  K.detail({name:'공원 입구 안내판',floor:'1F',poly:strip(b,p(len+9),12),y0:0,y1:3.5},()=>{
    // _19: paired tall gray boards against vertical brown battens. Diagram is schematic.
    for(const [s,title,lines] of [[len+3,'주변지역 안내',['반포한강공원','세빛섬 · 잠수교','원베일리 공공보행통로']],
      [len+6,'보행로 안내',['고투몰 G2','서울의 24시간','관광안내센터 · 피카소 벽화']]]){
      const c=p(s,4.5),face=rot+PI/2;
      K.box({x:c[0],z:c[1],y:0,w:2.3,h:2.8,d:.28,rotY:face,mat:0x78634b});
      for(let i=0;i<9;i++){const t=p(s-1.04+i*.26,4.32);K.box({x:t[0],z:t[1],y:0,w:.035,h:2.8,d:.05,rotY:face,mat:0xa18768,solid:false});}
      const f=p(s,4.28);K.sign([title,...lines],{x:f[0],z:f[1],y:1.7,w:2.05,h:1.8,rotY:face,bg:'#c1c6c2',fg:'#344954',bold:false});
    }
  });
}
