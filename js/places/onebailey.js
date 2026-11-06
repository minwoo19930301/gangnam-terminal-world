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
  const F=K.LEVELS.B1,C=F+3.8,floor={tex:'ob-granite',gloss:.5};
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
  K.texture('ob-granite',256,256,(g,w,h)=>{const rnd=K.rand(168911);g.fillStyle='#a5aaa8';g.fillRect(0,0,w,h);
    for(let i=0;i<6000;i++){g.fillStyle=rnd()<.5?'#a4a9a4':'#d1d1c7';g.fillRect(rnd()*w,rnd()*h,1,1);}g.fillStyle='#828d8a';g.fillRect(0,0,w,1);g.fillRect(0,0,1,h);},[.9,.9]);
  K.texture('ob-white-tile',256,128,(g,w,h)=>{g.fillStyle='#f2f2f4';g.fillRect(0,0,w,h);g.strokeStyle='#ccd0d1';g.lineWidth=1;
    for(let x=0;x<w;x+=64)for(let y=0;y<h;y+=32)g.strokeRect(x,y,64,32);},[1.2,.6]);
  K.texture('ob-tactile',64,64,(g,w,h)=>{g.fillStyle='#cfab35';g.fillRect(0,0,w,h);g.fillStyle='#e6c653';for(let x=5;x<w;x+=12)g.fillRect(x,0,5,h);},[.36,.36]);
  K.texture('ob-ceiling',128,128,(g,w,h)=>{g.fillStyle='#323c40';g.fillRect(0,0,w,h);g.strokeStyle='#19252a';g.lineWidth=2;g.strokeRect(0,0,w,h);},[.9,.9]);
  K.texture('ob-exposed-ceiling',128,128,(g,w,h)=>{g.fillStyle='#bfc2c6';g.fillRect(0,0,w,h);g.strokeStyle='#8c9295';g.lineWidth=1;g.strokeRect(0,0,w,h);},[1.2,1.2]);
  K.texture('ob-hall-carpet',256,256,(g,w,h)=>{g.fillStyle='#7c7c80';g.fillRect(0,0,w,h);g.strokeStyle='#abadb0';g.lineWidth=2;
    for(let x=-24;x<w;x+=64)for(let y=0;y<h;y+=64){g.beginPath();g.ellipse(x+32,y+32,28,17,.6,0,PI*2);g.stroke();}},[1.8,1.8]);
  K.texture('ob-column',256,512,(g,w,h)=>{g.fillStyle='#83bddc';g.fillRect(0,0,w,h);g.strokeStyle='#4c8fb9';g.lineWidth=4;
    for(let i=0;i<4;i++){g.beginPath();g.ellipse(75+i*30,100+i*100,58,43,i*.7,0,PI*2);g.stroke();}
    g.strokeStyle='#e49cab';g.lineWidth=9;g.beginPath();g.moveTo(0,310);g.bezierCurveTo(75,280,135,350,256,310);g.stroke();},[2.65,3.8]);
  K.texture('ob-charcoal-tile',256,128,(g,w,h)=>{g.fillStyle='#333638';g.fillRect(0,0,w,h);g.strokeStyle='#535859';g.lineWidth=1;
    for(let y=0;y<h;y+=32)for(let x=-64;x<w;x+=128)g.strokeRect(x+(y%64?64:0),y,128,32);},[1.2,.6]);

  K.slab(R(-26,-7,L,7),F,{mat:floor});
  K.slab(R(-26,-7,280,7),C+.25,{mat:'concrete',under:'ob-exposed-ceiling',thick:.25,walk:false});
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
  // The close F9_13 frame shows cylindrical wraps, including a curved front edge.
  for(let s=286;s<345;s+=8)for(const v of [-3.7,3.7]){const [x,z]=P(s,v);K.cyl({x,z,y:F,r:.4,h:3.8,mat:'ob-column',seg:20});}
  for(const s of [-10,0])for(const v of [-5,5])box(s,v,F,.7,3.8,.7,0xc4c8c0,true);

  // The edited walk establishes these connected spaces, but not their surveyed side or distance.
  // Put all three doors on a side branch, leaving the through route and midpoint center intact.
  K.slab(R(24,7,110,29),F,{mat:floor});
  K.slab(R(48,29,80,40),F,{mat:floor});
  K.slab(R(24,7,48,29),C+.25,{mat:'concrete',under:'ceiling',thick:.25,walk:false});
  K.slab(R(80,7,110,29),F+5.25,{mat:'concrete',under:0xe8e8e6,thick:.25,walk:false});
  for(const s of [24,48])wall(s,7,s,29,F,C,{tex:'ob-granite',color:0xaaa6a0});
  for(const s of [80,110])wall(s,7,s,29,F,F+5,0xe8e8e6);
  wall(24,29,48,29,F,C,{tex:'ob-granite',color:0x9a9690});wall(80,29,110,29,F,F+5,0x9e8572);
  wall(48,29,48,40,F,1.15,'concrete');wall(80,29,80,40,F,1.15,'concrete');
  K.groundHole(R(48,7.2,80,40));
  // Broad stone seating and a separate walking stair both reach the open-air upper landing.
  for(let i=0;i<15;i++)box(63,17+(i+.5)*1.4,F,1.4,(i+1)*.4,22,floor,true);
  K.stairs(...P(77,17),...P(77,38),{w:3,ya:F,yb:0,mat:floor,rails:true});
  K.slab(R(48,38,80,42),0,{mat:floor});
  // Covered side of the asymmetric court: _35 has a dark overhang at camera-right.
  K.slab(R(48,7,80,15),C+.25,{mat:'concrete',under:'ob-ceiling',thick:.25,walk:false});
  wall(48,16,48,39,F,.85,{tex:'ob-granite',color:0xb1b1ab});
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
  // B1 looks up through an oval-ended daylight well; the glass enclosure is right
  // of the ascending stair in the filmed view. The old open sky erased the soffit.
  const stairLength=Math.hypot(12,21),courtPoint=(s,v)=>[-330+12/stairLength*s+21/stairLength*v,-59+21/stairLength*s-12/stairLength*v];
  const skylight=[];for(let i=0;i<32;i++){const a=i*PI/16;skylight.push(courtPoint(12+12.8*Math.cos(a),-1.8+6.8*Math.sin(a)));}
  K.groundHole(skylight);
  K.slab([[-350,-75],[-305,-75],[-305,-29],[-350,-29]],C+.25,{mat:'concrete',under:'ob-ceiling',thick:.25,holes:[skylight],walk:false});
  for(let i=0;i<skylight.length;i++){const a=skylight[i],b=skylight[(i+1)%skylight.length];K.wall(...a,...b,C,.05,{mat:0xb7bab4,thick:.14,solid:false});}
  K.wall(-348,-72,-348,-44,F,C,{mat:{tex:'ob-granite',color:0xaaa9a3},openings:[{at:22,w:13,y0:F,y1:C}]});
  for(const [x,z] of [[-343,-68],[-336,-69],[-313,-64],[-311,-54]])K.box({x,z,y:C-.025,w:.16,h:.04,d:.16,mat:{tex:'emit',color:0xfff2d4},solid:false});
  K.zone({name:'고투몰 G2 · 원베일리 공개공지',floor:'B1',sub:'계단 · 공공보행통로 입구',poly:plaza,y0:F,y1:C,priority:3});
  K.zone({name:'원베일리 보행로 입구',floor:'1F',sub:'고투몰 G2 연결',rect:[-325,-42,-307,-32],y0:0,y1:3.8,priority:4});
  K.slab([[-325,-42],[-307,-42],[-307,-32],[-325,-32]],3.7,{mat:'metal',under:'ob-ceiling',thick:.2,walk:false});
  // Stop the lift approach before the rising stair's head; its last metre used
  // to run through the underside of this slab. The upper cross-landing still joins it.
  K.slab([[-342,-48],[-335,-48],[-335,-38],[-342,-38]],0,{mat:floor});K.slab([[-339,-41],[-321.2,-41],[-321.2,-36],[-339,-36]],0,{mat:floor});
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
    const colors=[0xe840a0,0xf0c030,0x98d75e,0x40d0c0,0xa46acc],rot=Math.atan2(12,21),q=courtPoint;
    for(let i=0;i<5;i++){
      for(const v of [-3.3,-6.5]){const a=q(1+i*1.65,v),b=q(2.65+i*1.65,v),y0=F+.1;
        K.quad({tex:'glass',color:colors[i]},[[a[0],y0,a[1]],[b[0],y0,b[1]],[b[0],F+3.6,b[1]],[a[0],F+3.6,a[1]]],[.868,0,-.496]);}
      const top=[q(1+i*1.65,-3.3),q(2.65+i*1.65,-3.3),q(2.65+i*1.65,-6.5),q(1+i*1.65,-6.5)];
      K.hpoly({tex:'glass',color:colors[i]},top,F+3.6);
      for(const v of [-3.3,-6.5]){const post=q(1+i*1.65,v);K.box({x:post[0],z:post[1],y:F,w:.09,h:3.7,d:.09,rotY:rot,mat:0x687d75,solid:false});}}
    const endA=q(9.25,-3.3),endB=q(9.25,-6.5);
    K.quad({tex:'glass',color:0xa790dc},[[endA[0],F,endA[1]],[endB[0],F,endB[1]],[endB[0],F+3.6,endB[1]],[endA[0],F+3.6,endA[1]]],[.496,0,.868]);
    for(const v of [-3.3,-6.5]){const a=q(5.1,v);K.box({x:a[0],z:a[1],y:F+3.58,w:.12,h:.14,d:8.4,rotY:rot,mat:0x607b73,solid:false});}
    // Narrow colored edges make the dichroic box legible against daylight.
    for(const v of [-3.3,-6.5])for(const y of [F+.16,F+2.7]){const a=q(5.1,v);K.box({x:a[0],z:a[1],y,w:.025,h:.025,d:8.3,rotY:rot,mat:{tex:'emit',color:v===-3.3?0xe45aa6:0xe5cc4c},solid:false});}
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
      // Fixed sidelights and folded glass leaves leave a usable centre opening.
      for(const side of [-1,1]){box(s+side*1.95,7.04,F,.15,2.9,.12,0x353b3c);
        box(s+side*1.48,7.07,F,.045,2.75,.82,{tex:'glass',color:0xc4d2ce});
        box(s+side*1.04,7.07,F,.055,2.8,.055,0x686e6d);box(s+side*1.06,7.57,F,1,2.75,.035,{tex:'glass',color:0xc4d2ce});
        box(s+side*1.06,7.8,F+.88,.035,.65,.035,0xc6cac8);}
      box(s,7.04,F+2.85,.15,.18,4.1,0x202628);
      if(s!==35)sign(title,s+3.7,6.81,F+1.68,s===54?1.05:2.5,.22,ROT-PI/2,{bg:null,fg:'#e9e7e0'});
      if(s===54)sign('공공개방시설',s+3.7,6.8,F+1.98,1.0,.28,ROT-PI/2,{bg:'#b6b4ab',fg:'#5b5b56',bold:false});
    }
    for(const [a,b] of [[24,33],[37,48],[48,52],[56,80],[80,88],[92,110]])wall(a,6.91,b,6.91,F,C,{tex:'ob-granite',color:0xc3c0b9},{solid:false,thick:.025});
    sign(['클라이밍','원베일리'],38.1,6.73,F+1.35,.65,1.8,ROT-PI/2,{bg:'#2c3e6a',fg:'#f4dd76',bold:false});
    sign('비상구',54,7.05,F+2.66,.45,.22,ROT-PI/2,{bg:'#1c8a4a'});
    K.hpoly('ob-hall-carpet',R(80.2,7.4,109.8,28.8),F+.015);
    for(let s=81;s<110;s+=.4)box(s,28.85,F,.065,5,.035,0x9a7f69);
    // Full-height glazed/white blinds, as seen on the left of _43.
    for(let v=8;v<29;v+=1.5){box(80.17,v,F,1.42,4.9,.035,0xe8e8e6);box(80.2,v,F,.025,4.9,.025,0xbfc3c4);}
    const chair=(s,v,a)=>{const [x,z]=P(s,v);K.cyl({x,z,y:F+.43,r:.27,h:.055,mat:0xf0f0ee,seg:12});
      const back=P(s+Math.cos(a)*.2,v+Math.sin(a)*.2);K.box({x:back[0],z:back[1],y:F+.48,w:.5,h:.4,d:.045,rotY:ROT+PI/2-a,mat:0xf0f0ee,solid:false});
      for(const ds of [-.18,.18])for(const dv of [-.18,.18])box(s+ds,v+dv,F,.025,.44,.025,0xa5aaa8);};
    for(const [s,v] of [[86,16],[95,14],[104,16],[88,24],[101,24]]){
      const [x,z]=P(s,v);K.cyl({x,z,y:F+.74,r:.75,h:.055,mat:{color:0xf0f0ee,gloss:.3},seg:24});box(s,v,F,.13,.74,.13,0xa6aaa7);
      for(let i=0;i<6;i++){const a=i*PI/3;chair(s+Math.cos(a)*1.12,v+Math.sin(a)*1.12,a);}
    }
    for(const s of [87,101]){box(s,20,F+3.75,8,.06,.1,{tex:'emit',color:0xfff9ed});for(const v of [17,23])box(s,v,F+3.81,.015,1.19,.015,0xadb4b2);}
    // Terrace vegetation is visible in _35, but sits behind the parapet.
    for(const s of [49,79]){const [x,z]=P(s,44);K.tree(x,z,{h:3.2,kind:'zelkova'});}
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
    for(const [v,r,c] of [[-5.5,.12,0xe8789a],[5.4,.10,0xd5d8d8],[4.9,.07,0xe88aa8]])pipe(P(s0,v),P(s1,v),C-.25,r,c,10);
    for(let s=s0+2;s<s1;s+=5){box(s,0,C-.38,14,.32,.38,0xcbd0ca);pipe(P(s,-6.6),P(s,6.6),C-.55,.035,0x899293,6);
      for(const v of [-4.6,4.6]){box(s+1.3,v,C-.55,.13,.055,2.7,{tex:'emit',color:0xf5fff5});box(s+1.3,v,C-.48,.25,.06,2.9,0xc0c9c7);}
      for(const v of [-5.5,5.4])box(s,v,C-.37,.035,.37,.035,0xa5abaa);
      if(pic)box(s,0,C-.025,2.7,.03,2.1,{tex:'emit',color:0xf0f7e9});}
    if(s0%90===0){sign('반포한강공원 ↑',s0+9,0,F+2.9,3.8,.45);sign('고투몰 G2 ↑',s0+9.1,0,F+2.9,3.8,.45,ROT);
      box(s0+17,6.7,F+.65,.18,1.35,.8,0xb7bdbb);sign('소화전',s0+17,6.57,F+1.5,.6,.2,ROT-PI/2,{bg:'#b24646'});}
  });

  K.slab(R(156,7.1,181,22.8),F+.12,{mat:{tex:'marble',gloss:.5},thick:.12});
  for(const [a,b] of [[155,162],[175,182]])wall(a,7,b,7,F,C,{tex:'ob-granite',color:0xbdbab5});
  wall(162,7,166,7,F,C,'glass',{thick:.04});wall(168,7,175,7,F,C,'glass',{thick:.04});wall(162,7,175,7,F+2.85,C,0x8c8a86);
  detail('관광안내센터 실내',155,7,182,23,()=>{
    for(const s of [162,164,166,168,170.3,172.6,175])box(s,7,F,.075,2.85,.075,0x4b504f);
    wall(155,6.96,182,6.96,F+2.85,C,{tex:'ob-granite',color:0xbdbab5},{solid:false,thick:.03});
    sign('고터·세빛 관광안내센터',168.7,6.82,F+3.2,4.8,.35,ROT-PI/2,{bg:'#545650',fg:'#eeeae1',bold:false});
    sign('ⓘ',165.85,6.8,F+3.2,.42,.42,ROT-PI/2,{bg:null,fg:'#f1f1e7'});
    sign('11:00 ~ 20:00',167,6.77,F+2.55,1.0,.18,ROT-PI/2,{bg:null,fg:'#f4f4ec'});
    const posterTitles=['서울 여행','한강공원','세빛섬','문화 산책','서초 관광','공연 안내','서울 지도','관광 안내'];
    const posterColors=['#f3e8d5','#c74268','#4095b5','#e7bd66','#f3e8d5','#dd718f','#6d94b2','#eeeae2'];
    for(let i=0;i<16;i++){const s=[162.6,163.4,164.4,165.2,169.0,170.5,172.3,174.2][i%8];
      sign(posterTitles[i%8],s,6.81,F+.93+Math.floor(i/8)*.86,.45,.63,ROT-PI/2,{bg:posterColors[i%8],fg:i%4===0?'#49545c':'#fff',bold:false});}
    for(const s of [166.05,167.95]){box(s,7.55,F,1.0,2.75,.035,{tex:'glass',color:0xc0d0ca});box(s,7.8,F+.9,.035,.6,.035,0xc6cac8);}
    box(168,16,F+.12,2,.95,5.5,0xf0f1e9,true);box(168,16,F+1.07,2.15,.08,5.8,{color:0xf7f4e6,gloss:.5});
    sign('관광 안내',168,14.98,F+.7,2.5,.3,ROT-PI/2,{bg:null,fg:'#465f64'});
    for(const s of [163,171,175]){box(s,21.8,F+.12,.6,2.4,3.2,0xeeeeea,true);
      for(let row=0;row<4;row++)for(let j=0;j<5;j++)box(s-1.28+j*.58,21.43,F+.55+row*.4,.10,.31,.4,[0x86a5bc,0xcacf8e,0xc99fa3,0x76a68d][(row+j)%4]);}
    box(174,10,F+.12,.5,2.2,2.6,0x222e3c,true);sign(['서울 여행','한강 · 세빛섬','문화 · 산책'],174,9.7,F+1.4,2.3,1.55,ROT-PI/2,{bg:'#3a8cb1'});
    box(161.3,6.4,F,.65,1.85,1,0xf6efe3,true);sign(['WOWPASS','환전 · 교통카드'],161.3,6.03,F+1.3,.9,.58,ROT-PI/2,{bg:'#172e60'});
    sign('환전',161.3,6.02,F+.5,.8,.28,ROT-PI/2,{bg:'#e78b43'});
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
    for(const s of [294,318,334]){box(s,2.8,F,1,.42,3.4,0x5e9fc5,true);box(s,2.8,F+.42,1.05,.08,3.5,{color:0x7bb8d6,gloss:.3});box(s,3.24,F+.5,.12,.48,3.5,0x6099bd);}
    // These modest exhibit labels no longer cover the participatory wall/poster.
    for(const s of [284,289,300,308,316])sign(['원더스트리트','도란도란','함께 걷는 조각 전시'],s,6.83,F+1.7,1.15,1.45,ROT-PI/2,{bg:'#f0eee8',fg:'#4b5356',bold:false});
    for(const [s,v] of [[305,1.8],[330,-1.9]]){const [x,z]=P(s,v);K.person(x,F,z,{shirt:s===305?0x34383c:0xc3b2a0,pants:0x555d64,rotY:ROT});}
  });
  detail('관광특구 라운지',345,-7,L,7,()=>{
    sign('관광특구 라운지',350,6.8,F+2.8,8,.6,ROT-PI/2,{bg:null,fg:'#3e5d63'});
    for(const s of [348,354])for(const v of [-5.7,5.7]){box(s,v,F+.08,.7,.36,3.2,0x5f7373,true);box(s,v,F+.44,.8,.09,3.4,{tex:'wood',gloss:.3});box(s,v+(v>0?.36:-.36),F+.5,.09,.45,3.4,0x7d8880);}
    sign('한강공원 ↑',L-2,0,F+2.9,4,.55);sign('고투몰 G2 ↑',348,0,F+2.9,4,.55,ROT);
  });
  // Small parties, opposing walkers and viewers. The tactile centre and door gaps
  // remain clear; the exhibition section has roughly three people per ten metres.
  for(let start=12;start<345;start+=42)detail('보행자 · 관람객 '+start,start,-7,Math.min(start+42,L),7,()=>{
    const shirts=[0xddd9d0,0x384b5c,0x9c6c69,0x708c80,0xc7a57a,0x616573],busy=start>=264;
    for(let s=start+5;s<Math.min(start+42,343);s+=busy?10:21)for(let j=0;j<3;j++){
      const ss=s+j*.9,v=(Math.floor(s/10)%2?1:-1)*(1.45+j*.52),[x,z]=P(ss,v),a=j===2?ROT+PI/2:ROT+(Math.floor(s/10)%2?0:PI)+j*.16;
      K.person(x,F,z,{shirt:shirts[(Math.floor(s)+j)%shirts.length],pants:[0x303c49,0x858680,0x504c4c][j],rotY:a});
      if(j===1){const [bx,bz]=P(ss+.16,v+.32);K.box({x:bx,z:bz,y:F+.4,w:.29,h:.36,d:.16,rotY:a,mat:0xaa8c67,solid:false});
        K.box({x:bx,z:bz,y:F+.75,w:.15,h:.12,d:.025,rotY:a,mat:0x625a4b,solid:false});}
    }
  });
  detail('라운지와 안내센터 이용객',80,7,181,29,()=>{
    for(const [s,v,sit,shirt] of [[86,17.1,true,0xc6bbaa],[95,12.9,true,0x6b8192],[104,17.1,true,0x7c8e7a],[89.2,24,true,0xb37b7a],[101,22.9,true,0xd6d5cc],[92,10,false,0x4d5965],[97,10.5,false,0xb7aa99],[166.7,13.7,false,0x768e9b],[167.5,12.5,false,0xc9b49e]]){
      const [x,z]=P(s,v);K.person(x,F,z,{shirt,pants:0x4b525b,rotY:ROT+(s%2?0:PI),sit});}
  });
  K.detail({name:'공개공지 보행자',floor:'B1',poly:plaza,y0:F,y1:C},()=>{
    for(const [x,z,a] of [[-327,-63,3.5],[-337,-62,.9],[-335.8,-61.5,1.2]])K.person(x,F,z,{rotY:a,shirt:a>3?0x363a40:0xb2a79c,pants:0x555b62});
  });
  buildParkPassage(K,{F,C,P,L,strip,floor,corridor,paintStrip});
}

function buildWalkMurals(K,{F,C,P,R,ROT,sign}){
  // Additional observed subjects occupy unassigned wall bays; the earlier 24-hour sequence is retained.
  // Original drawings of the observed subjects. The full-height tile ground joins the architecture;
  // camera close-ups must not be approximated by repeating one little pictogram across a banner.
  for(const [part,s] of [[0,7],[1,123],[2,139],[3,225],[4,244],[5,264],[6,-7]]){
    const span=part===5?26:12;
    K.detail({name:'보행 영상 벽화 '+part,floor:'B1',poly:R(s-span/2,3,s+span/2,7),y0:F,y1:C},()=>{
      const key='ob-walk-mural-'+part,ground=['#202d40','#22262b','#777b7e','#343b44','#e9e8df','#f1e7cf','#f4f1e9'][part];
      K.texture(key,1536,512,(g,w,h)=>{
        g.scale(w/1200,h/400);w=1200;h=400;
        g.fillStyle=ground;g.fillRect(0,0,w,h);
        const disc=(x,y,r,c)=>{g.fillStyle=c;g.beginPath();g.arc(x,y,r,0,PI*2);g.fill();};
        const oval=(x,y,rx,ry,c,a=0)=>{g.fillStyle=c;g.beginPath();g.ellipse(x,y,rx,ry,a,0,PI*2);g.fill();};
        const poly=(pts,c,edge=null)=>{g.fillStyle=c;g.beginPath();pts.forEach(([x,y],i)=>i?g.lineTo(x,y):g.moveTo(x,y));g.closePath();g.fill();if(edge){g.strokeStyle=edge;g.lineWidth=3;g.stroke();}};
        const line=(pts,c,width)=>{g.strokeStyle=c;g.lineWidth=width;g.lineJoin='round';g.lineCap='round';g.beginPath();pts.forEach(([x,y],i)=>i?g.lineTo(x,y):g.moveTo(x,y));g.stroke();};
        const star=(x,y,r,c)=>poly(Array.from({length:10},(_,i)=>{const a=-PI/2+i*PI/5;return [x+Math.cos(a)*(i%2?r*.43:r),y+Math.sin(a)*(i%2?r*.43:r)];}),c);
        const eyes=(x,y,d=12)=>{disc(x-d,y,3,'#272c31');disc(x+d,y,3,'#272c31');};
        if(part===0){
          // Layered green palace roofs, red timber bays and an orange-hatted festival visitor.
          for(const [x,y,c,r] of [[120,77,'#ee92be',66],[648,88,'#e992b4',78],[1010,65,'#6bc2eb',62],[730,216,'#f6c45a',44]])for(let k=0;k<16;k++){
            const a=k*PI/8;line([[x+Math.cos(a)*r*.3,y+Math.sin(a)*r*.3],[x+Math.cos(a)*r,y+Math.sin(a)*r]],c,3);}
          for(let k=0;k<2;k++){
            const x=55+k*55,y=260-k*119,ww=620-k*110;
            g.fillStyle='#c74d37';g.fillRect(x+25,y+8,ww-50,84);g.fillStyle='#398865';g.fillRect(x+34,y+23,ww-68,57);
            for(let j=0;j<10;j++){const xx=x+40+j*(ww-80)/9;line([[xx,y+14],[xx,y+91]],'#c53e30',9);line([[xx-10,y+33],[xx+10,y+33],[xx+10,y+70],[xx-10,y+70],[xx-10,y+33]],'#e7b34c',2);}
            poly([[x-25,y+7],[x+60,y-15],[x+ww/2,y-38],[x+ww-60,y-15],[x+ww+25,y+7],[x+ww,y+24],[x,y+24]],'#28594a');
            line([[x-25,y+6],[x+ww/2,y-35],[x+ww+25,y+6]],'#e2c86b',5);
            for(let j=0;j<32;j++)line([[x+j*ww/32,y+2],[x+j*ww/32-8,y+15]],'#9fbe75',2);
            for(let j=0;j<18;j++)disc(x+15+j*(ww-30)/17,y+27,3,'#f6ce75');
          }
          g.fillStyle='#b8b7ba';g.fillRect(0,365,760,35);for(let x=0;x<760;x+=27){line([[x,370],[x,396]],'#f0e6d6',4);line([[x-7,379],[x+7,379]],'#56616b',2);}
          oval(1000,205,70,83,'#f8d89f',-.15);poly([[922,267],[1045,265],[1129,400],[877,400]],'#e77935');
          line([[935,293],[847,231],[805,247]],'#e97839',55);oval(800,235,27,39,'#f8d89f',-.6);
          line([[903,331],[1075,353]],'#f2cf5f',11);line([[1044,286],[1080,356]],'#bd4f3e',20);
          poly([[911,149],[1042,129],[1077,172],[921,185]],'#e89236');line([[900,177],[1092,151]],'#f1bf46',12);
          eyes(995,204,19);g.strokeStyle='#30333a';g.lineWidth=5;g.beginPath();g.arc(999,230,22,0,PI);g.stroke();
        }else if(part===1){
          poly([[118,178],[218,87],[412,34],[690,35],[815,94],[813,165],[711,227],[778,279],[739,355],[565,368],[404,331],[275,355],[122,337],[149,261]],'#f4f4f6','#1b2f65');
          poly([[154,180],[225,130],[329,165],[265,223],[125,266]],'#2840a0');
          poly([[286,255],[460,230],[633,267],[690,335],[517,355],[351,322]],'#2840a0');
          oval(310,195,74,62,'#f4f4f6',-.3);line([[245,190],[283,172],[312,175]],'#21315c',5);
          line([[341,133],[393,84],[513,73],[645,89]],'#263360',7);line([[427,116],[468,104],[625,123]],'#263360',5);
          for(let i=0;i<9;i++)line([[493+i*17,145],[500+i*20,207]],'#24345f',3);
          line([[649,163],[697,206],[687,255],[610,286],[587,328]],'#263360',8);line([[690,266],[732,289],[712,333]],'#263360',5);
          line([[163,276],[223,300],[326,294]],'#263360',6);line([[219,306],[307,320]],'#263360',4);
          for(let i=0;i<4;i++)line([[624+i*15,279],[645+i*13,309]],'#f4f4f6',4);
          g.fillStyle='#ebdd9b';g.fillRect(914,0,286,400);g.fillStyle='#a2a5a8';g.fillRect(930,94,90,306);
          g.fillStyle='#d4d5d2';g.fillRect(941,114,67,51);g.strokeStyle='#42474c';g.lineWidth=3;g.strokeRect(941,114,67,51);
          g.fillStyle='#b9423c';g.font='bold 42px sans-serif';g.fillText('3',929,78);
          for(const y of [191,251]){g.fillStyle='#555d64';g.fillRect(946,y,61,34);g.fillStyle='#d3c5ad';g.fillRect(956,y+9,20,12);disc(995,y+17,5,y===251?'#c94b42':'#e3e4e2');}
          for(const [x,y] of [[877,116],[863,190],[882,264],[884,338]])star(x,y,17,'#f0c84b');
          poly([[1084,142],[1148,112],[1199,147],[1199,284],[1113,261]],'#e9a9b7');
        }else if(part===2){
          // A single small violet figure amid half-suns, not a row of duplicate mascots.
          g.save();g.translate(160,83);g.scale(.72,.72);
          oval(572,194,89,98,'#9b8ad0');oval(568,115,45,34,'#9b8ad0');oval(506,213,30,44,'#9b8ad0',.4);oval(649,207,28,48,'#9b8ad0',-.4);
          oval(540,278,29,20,'#9b8ad0');oval(606,278,29,20,'#9b8ad0');disc(553,111,6,'#f3eee3');disc(579,110,6,'#f3eee3');eyes(566,111,13);
          g.restore();
          for(const [x,y,r] of [[805,327,81],[874,176,40],[431,243,29]]){g.fillStyle='#f1c83c';g.beginPath();g.arc(x,y,r,PI,PI*2);g.closePath();g.fill();}
          for(let i=0;i<22;i++){g.fillStyle='#edce48';g.fillRect(i<11?60+(i%3)*27:1070+(i%3)*27,175+(i%7)*22,15,8);}
          line([[0,366],[1200,366]],'#d9b440',5);
        }else if(part===3){
          for(const [x,y,c] of [[185,74,'#ee9fb6'],[533,52,'#50a5df'],[859,63,'#e87779']]){
            g.globalAlpha=.85;disc(x,y,39,c);line([[x-10,y+66],[x-29,y+150],[x+90,y+211],[x+47,y+292]],c,62);
            line([[x-31,y+146],[x-109,y+231],[x-175,y+194]],c,53);line([[x-5,y+77],[x+86,y+112],[x+132,y+38]],c,40);
            line([[x-15,y+72],[x-83,y+22],[x-118,y-18]],c,37);g.globalAlpha=1;
            line([[x+39,y+294],[x+93,y+301]],c,24);line([[x-177,y+194],[x-198,y+165]],c,22);
            for(let j=0;j<4;j++)line([[x-33+j*13,y+73],[x-43+j*13,y+143]],'#ffffff22',3);
          }
          for(const p of [[[310,156],[360,129],[345,201]],[[707,240],[778,213],[732,276]],[[1114,87],[1192,112],[1150,185]]])poly(p,'#eee9e0');
        }else if(part===4){
          // A joined train interior: paired sliding doors, continuous blue seat and varied riders.
          g.fillStyle='#dce8ed';g.fillRect(0,0,w,h);g.fillStyle='#c9d4d9';g.fillRect(0,14,w,25);
          for(const x of [35,206]){g.fillStyle='#f0e8de';g.fillRect(x,55,164,315);g.strokeStyle='#3f4549';g.lineWidth=3;g.strokeRect(x,55,164,315);
            g.fillStyle='#5794b5';g.fillRect(x+18,75,128,153);g.strokeRect(x+18,75,128,153);line([[x+21,215],[x+140,215]],'#85b4c9',5);}
          g.fillStyle='#f3eee5';g.fillRect(51,10,250,30);g.fillStyle='#30383c';g.font='22px sans-serif';g.fillText('서울 지하철',66,33);
          for(const x of [430,685,940]){g.fillStyle='#e9e6df';g.fillRect(x,60,205,147);g.strokeRect(x,60,205,147);g.fillStyle='#6394b2';g.fillRect(x+12,73,181,120);}
          g.fillStyle='#315e9b';g.fillRect(403,227,753,105);g.fillStyle='#213d75';g.fillRect(403,304,753,21);
          for(const [i,x] of [480,659,836,1012].entries()){
            const yy=i%2?153:162;oval(x,yy,42,49,i===3?'#ede6d9':'#242933');eyes(x,yy-2,14);if(i!==3){disc(x-14,yy-2,5,'#eae8dd');disc(x+14,yy-2,5,'#eae8dd');}
            poly([[x-38,yy+40],[x+35,yy+40],[x+49,302],[x-51,302]],i===1?'#f2eee3':'#272c34','#383b40');
            line([[x-20,298],[x-28,356]],'#ece8df',34);line([[x+23,298],[x+39,354]],'#ece8df',34);oval(x-27,365,31,17,'#f6f1e8');oval(x+45,365,32,17,'#f6f1e8');
            const bx=x+(i%2?-22:22);g.fillStyle=i%2?'#e6d3b2':'#fcf9ed';g.fillRect(bx-22,yy+67,44,44);g.strokeRect(bx-22,yy+67,44,44);line([[bx-12,yy+69],[bx-12,yy+56],[bx+12,yy+56],[bx+12,yy+69]],'#45484c',3);
          }
          for(const x of [469,724,979]){line([[x,39],[x,83]],'#454c52',4);g.beginPath();g.arc(x,97,16,0,PI*2);g.stroke();}
          poly([[1151,164],[1200,147],[1200,392],[1138,392]],'#92b960');oval(1189,123,41,47,'#f2d4b7');g.fillStyle='#e7c045';g.fillRect(1144,77,56,17);
        }else if(part===5){
          g.fillStyle='#aa7761';g.fillRect(0,344,w,56);
          for(let i=0;i<12;i++){
            const x=37+i*103,yy=106+(i%3)*19,c=['#b94f42','#537e68','#dcbd4d','#444c54'][i%4],skin=['#ead0a8','#d2aa81','#f0d7ba'][i%3];
            oval(x,yy,17,23,skin);g.fillStyle='#494635';g.fillRect(x-18,yy-24,36,10);if(i%3===0)g.fillRect(x-25,yy-17,50,5);
            poly([[x-17,yy+24],[x+16,yy+24],[x+23,274],[x-24,274]],c);line([[x-11,274],[x-16,337]],'#53635b',12);line([[x+11,274],[x+18,337]],'#53635b',12);
            line([[x-14,yy+41],[x-29,229],[x-15,249]],skin,8);line([[x+14,yy+41],[x+35,220]],skin,8);eyes(x,yy,6);
            if(i%3===0){const bx=x+43;g.fillStyle='#835b40';g.fillRect(bx-18,234,36,72);g.fillStyle='#bf956c';for(let k=0;k<5;k++)g.fillRect(bx-17,240+k*13,34,2);
              for(let j=0;j<8;j++)disc(bx-12+(j%3)*12,235-Math.floor(j/3)*15,8,['#d9b74b','#7c9b55','#c46549'][j%3]);
              for(let j=0;j<4;j++)line([[bx+2,203],[bx-14+j*10,182]],'#5e8b4e',3);
            }else if(i%3===1){poly([[x+23,225],[x+61,219],[x+65,283],[x+29,285]],'#d4b77c','#735c44');for(let j=0;j<5;j++)line([[x+25+j*8,227],[x+30+j*8,280]],'#9d7656',2);}
            else{oval(x+42,274,18,36,'#e4d5b5');oval(x+42,237,16,18,'#e4d5b5');oval(x+31,209,5,23,'#b06b53',-.2);oval(x+51,208,5,24,'#b06b53',.2);eyes(x+42,237,5);}
          }
          for(let i=0;i<5;i++){g.fillStyle='#faf4df';g.fillRect(90+i*240,35,100,32);g.strokeStyle='#736958';g.lineWidth=2;g.strokeRect(90+i*240,35,100,32);g.fillStyle='#5f5e54';g.font='16px sans-serif';g.fillText(['우리 동네','과일 가게','꽃 시장','함께 걷기','즐거운 오후'][i],98+i*240,57);}
        }else{
          // Two different scenes: washing hair on the left, working at a desk on the right.
          oval(300,207,78,99,'#9c704c');oval(300,179,61,72,'#f2d7be');
          for(let j=0;j<17;j++){const a=j*PI*2/17,x=300+Math.cos(a)*65,y=110+Math.sin(a)*38;disc(x,y,19,'#f3f2e8');g.strokeStyle='#343b40';g.lineWidth=3;g.beginPath();g.arc(x,y,19,PI*.2,PI*1.7);g.stroke();}
          eyes(300,173,20);oval(270,194,11,7,'#de9b92');oval(331,194,11,7,'#de9b92');line([[280,213],[300,223],[319,213]],'#343b40',3);
          poly([[239,252],[361,251],[393,393],[214,393]],'#d6e7eb','#343b40');line([[254,290],[288,324],[321,289]],'#343b40',5);
          g.fillStyle='#7ca1c2';g.fillRect(391,249,43,137);line([[402,260],[402,375]],'#4d5f77',3);
          oval(780,162,100,130,'#8b6248');poly([[699,123],[737,74],[833,87],[866,152],[845,231],[710,227]],'#f0d5c4','#343b40');eyes(780,168,25);
          oval(737,188,10,8,'#e6a8a0');oval(824,188,10,8,'#e6a8a0');line([[753,207],[782,221],[811,203]],'#343b40',3);
          poly([[703,249],[852,249],[895,325],[677,325]],'#bd85a7','#343b40');line([[724,280],[749,325],[791,334]],'#343b40',3);
          poly([[616,341],[1022,291],[1199,362],[1199,400],[634,400]],'#cfb578','#343b40');
          poly([[901,292],[1017,269],[1005,338],[894,353]],'#a5b8c4','#343b40');poly([[889,354],[1006,339],[1057,352],[938,370]],'#c6d0d5','#343b40');
          g.fillStyle='#f9f5df';g.fillRect(730,348,70,25);line([[743,352],[780,360],[755,365]],'#51575a',2);
          for(const [x,y] of [[576,100],[928,72],[568,277],[1080,245]])poly([[x-16,y+24],[x-16,y],[x-29,y],[x,y-27],[x+29,y],[x+15,y],[x+15,y+24]],'#e4bd48','#343b40');
          disc(792,49,21,'#edc447');g.fillStyle='#4e8580';g.fillRect(783,65,18,21);line([[785,76],[799,76]],'#343b40',3);
          for(const [x,y] of [[1010,148],[1094,180]]){g.fillStyle='#fcfaf1';g.fillRect(x,y,31,50);g.strokeStyle='#343b40';g.lineWidth=2;g.strokeRect(x,y,31,50);for(let j=0;j<4;j++)line([[x+7,y+12+j*8],[x+24,y+12+j*8]],'#85837b',1);}
        }
        g.strokeStyle=part<4?'rgba(185,185,181,.18)':'rgba(94,100,100,.14)';g.lineWidth=1.4;
        for(let y=0;y<h;y+=50)for(let x=-100;x<w;x+=200)g.strokeRect(x+(y%100?100:0),y,200,50);
      },[span,C-F-.12]);
      const a=P(s-span/2,6.84),b=P(s+span/2,6.84);K.quad(key,[[a[0],F+.06,a[1]],[b[0],F+.06,b[1]],[b[0],C-.06,b[1]],[a[0],C-.06,a[1]]],[-V[0],0,-V[1]]);
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
    for(let i=0;i<12;i++){const g=group(283+i*5.15,5.3),kind=i===11?9:i<9?i:i%6;g.rotation.y=ROT+PI/2;mesh(g,'box',0xdee0d4,0,.07,0,2.2,.14,1.3);
      if(kind<2){const c=kind===0?0xe76d31:0xd83e4d;mesh(g,'ball',c,0,1.65,0,.48,.55,.43);mesh(g,'ball',0x253c52,0,1.68,-.34,.32,.31,.16);mesh(g,'box',c,0,.9,0,.65,.75,.52);
        for(const s of [-1,1]){mesh(g,'tube',c,s*.23,.43,0,.14,.65,.14);mesh(g,'tube',c,s*.45,.98,0,.13,.7,.13,s*.4);}
      }else if(kind===2){
        // The sharp reference shows a folded yellow paper boat and a round-eared mouse, not a banana/rabbit.
        const shape=new T.Shape();shape.moveTo(-1.35,.97);shape.lineTo(-.68,.23);shape.lineTo(.68,.23);shape.lineTo(1.35,.97);shape.lineTo(.35,.69);shape.lineTo(-.35,.69);shape.closePath();
        const boat=new T.Mesh(new T.ExtrudeGeometry(shape,{depth:.76,bevelEnabled:false,steps:1}),material(0xf0c42d));boat.position.z=-.38;g.add(boat);
        const foldPoints=[[-1.35,.98,-.39],[-.68,.24,-.39],[-.68,.24,-.39],[.68,.24,-.39],[.68,.24,-.39],[1.35,.98,-.39],[-1.35,.98,-.39],[-.35,.7,-.39],[-.35,.7,-.39],[.35,.7,-.39],[.35,.7,-.39],[1.35,.98,-.39],[-.68,.24,-.39],[-.35,.7,-.39],[.68,.24,-.39],[.35,.7,-.39]];
        const folds=new T.LineSegments(new T.BufferGeometry().setFromPoints(foldPoints.map(p=>new T.Vector3(...p))),new T.LineBasicMaterial({color:0xfff1b9}));g.add(folds);
        mesh(g,'ball',0xf4eee2,0,1.02,0,.28,.32,.24);mesh(g,'ball',0xc84250,0,1.48,0,.33,.32,.28);mesh(g,'ball',0xf4eee2,0,1.45,-.10,.27,.26,.22);
        for(const side of [-1,1]){mesh(g,'ball',0xf4eee2,side*.29,1.72,0,.18,.2,.09);mesh(g,'ball',0x313539,side*.10,1.49,-.31,.018,.025,.012);mesh(g,'ball',0xf4eee2,side*.16,.83,-.10,.1,.17,.12);}
        mesh(g,'ball',0xc84250,0,1.39,-.32,.04,.025,.025);
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
    // Both the walk and the sharper 2026 photographs show dense suspended discs and coloured floor art.
    for(let k=0;k<6;k++){const g=group(287+k*10,0);for(let i=0;i<28;i++){
      const x=((i*17)%13-6)*.43,z=((i*13)%17-8)*.48,y=2.95+(i%5)*.12,r=.13+(i%4)*.025;
      const disc=mesh(g,'tube',palette[(i+k)%6],x,y,z,r,.018,r);disc.rotation.x=PI/2;disc.rotation.z=i*.7;
      mesh(g,'tube',0xc5c9bd,x,(y+3.8)/2,z,.004,3.8-y,.004);
      // Keep the middle tactile strip clear; smaller mixed motifs belong to the exhibit side.
      if(i%9===0){const fx=2.4+(i%3)*.45,fz=z*.9;mesh(g,'tube',palette[(i+k)%6],fx,.012,fz,.36,.007,.43);
        if(i%18===0)mesh(g,'box',palette[(i+k+2)%6],fx+.26,.009,fz+.21,.67,.006,.48);}}}
    sign(['2026 원더스트리트','도란도란 · 4.27 — 11.15'],281,5.8,F+1.55,3.1,.8,ROT-PI/2,{bg:'#edce60',fg:'#243e55'});
    sign('전시 켜기·끄기',281,5.75,F+.92,2.6,.32,ROT-PI/2,{bg:'#263d55'});
    K.texture('ob-wonder-poster',512,768,(g,w,h)=>{g.scale(2,2);w/=2;h/=2;g.fillStyle='#f4ede3';g.fillRect(0,0,w,h);
      for(const [x,y,r,c] of [[82,245,91,'#d594ba'],[168,215,70,'#e4b78a'],[145,298,70,'#b1b2d6']]){g.globalAlpha=.75;g.fillStyle=c;g.beginPath();g.arc(x,y,r,0,PI*2);g.fill();}g.globalAlpha=1;
      g.fillStyle='#303639';g.font='31px serif';g.textAlign='center';g.fillText('원더',w/2,47);g.fillText('스트리트',w/2,82);g.font='15px sans-serif';g.fillText('2026.04.27 ~ 11.15',w/2,h-22);},[1.2,1.7]);
    K.texture('ob-wonder-board',1536,640,(g,w,h)=>{g.scale(2,2);w/=2;h/=2;g.fillStyle='#f5f1e9';g.fillRect(0,0,w,h);g.fillStyle='#323633';g.font='31px serif';g.textAlign='center';g.fillText('당신의 오늘을 그려주세요',w/2,47);
      const rnd=K.rand(150083),skin=['#e8d1b9','#bc9a85','#f1d5c1','#d2b899','#f6e2cc'],hair=['#463b35','#715344','#2f3032','#b79b7c'];
      for(let j=0;j<5;j++)for(let i=0;i<16;i++){const x=26+i*47.7+(rnd()-.5)*5,y=87+j*43+(rnd()-.5)*4,k=j*16+i;
        g.fillStyle=skin[k%5];g.beginPath();g.ellipse(x,y,10+(k%3),13,(k%3-1)*.1,0,PI*2);g.fill();g.fillRect(x-3,y+10,6,5);
        g.fillStyle=['#a2bbc0','#c6a2b4','#b8baa1','#d2b185'][k%4];g.beginPath();g.ellipse(x,y+19,13,6,0,PI,PI*2);g.fill();
        g.strokeStyle=hair[k%4];g.lineWidth=2+(k%3);g.beginPath();g.arc(x,y-2,11,PI,PI*2);g.stroke();
        if(k%4===0){g.beginPath();g.moveTo(x-10,y-1);g.lineTo(x-12,y+13);g.moveTo(x+10,y-1);g.lineTo(x+12,y+14);g.stroke();}
        if(k%6===0){for(let n=0;n<5;n++){g.beginPath();g.arc(x-9+n*4,y-10-(n%2)*3,3,0,PI*2);g.stroke();}}
        g.strokeStyle='#62514a';g.lineWidth=.8;g.beginPath();g.arc(x,y+4,4,0,PI);g.stroke();g.fillStyle='#514b49';g.fillRect(x-4,y-2,1.2,1.5);g.fillRect(x+3,y-2,1.2,1.5);
        if(k%7===0){g.strokeStyle='#536066';g.lineWidth=.7;g.strokeRect(x-7,y-4,6,5);g.strokeRect(x+1,y-4,6,5);}
        // Uneven visitor marks, tiny hearts and notes prevent the stock-smiley-grid appearance.
        g.strokeStyle=['#a5a0a0','#ad8590','#7f939b'][k%3];g.lineWidth=.5;g.beginPath();g.moveTo(x-12,y+27);g.lineTo(x-3,y+25);g.lineTo(x+3,y+27);g.lineTo(x+11,y+25);g.stroke();
      }
      for(let k=0;k<24;k++){const x=12+k*32,y=8+(k%3)*9;g.strokeStyle=['#8c8a85','#b78d99','#8c9aa2'][k%3];g.lineWidth=.7;g.beginPath();g.moveTo(x,y);g.lineTo(x+9,y-2);g.lineTo(x+14,y+2);g.lineTo(x+24,y-1);g.stroke();}
    },[7,2.5]);
    for(const [s,key,w,h,y] of [[339.65,'ob-wonder-poster',1.2,1.7,F+1.1],[327,'ob-wonder-board',7,2.5,F+.65]]){const p=P(s-w/2,6.82),q=P(s+w/2,6.82);K.quad(key,[[p[0],y,p[1]],[q[0],y,q[1]],[q[0],y+h,q[1]],[p[0],y+h,p[1]]],[-V[0],0,-V[1]]);}
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
  // The last white tiled passage is narrower than the gallery and opens back out
  // onto the existing accessible ramp; neither shared endpoint changes.
  for(const side of [-1,1]){
    for(const [a,b] of [[[60,side*3.45],[64,side*2.1]],[[64,side*2.1],[len-40,side*2.1]],[[len-40,side*2.1],[len-36,side*3.45]]])
      K.wall(...p(...a),...p(...b),F,F+2.35,{mat:{tex:'ob-white-tile',gloss:.5},thick:.12});
  }
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
    if(s0<64){const q=p(s0+6);K.sign('반포한강공원 ↑',{x:q[0],z:q[1],y:F+2.85,w:2.3,h:.3,rotY:rot+PI,bg:'#326173',fg:'#fff'});}
  });}
  const tact=strip(p(len-36),b,.35);K.quad('ob-tactile',tact.map((q,i)=>[q[0],(i===0||i===3?F:0)+.018,q[1]]),[0,1,0],[[0,0],[0,100],[1,100],[1,0]]);
  K.detail({name:'흰 아치 터널 · 세빛섬 안내',floor:'B1',poly:strip(p(64),p(len-40),7.5),y0:F,y1:F+3.7},()=>{
    // Preserve the earlier river artwork upstream; the newer final white section has a curved shoulder.
    for(const side of [-1,1]){
      for(let k=0;k<8;k++){const t0=k*PI/16,t1=(k+1)*PI/16,cross=t=>[side*(1.55+.49*Math.cos(t)),F+2.35+.49*Math.sin(t)];
        const [v0,y0]=cross(t0),[v1,y1]=cross(t1),a=p(64,v0),b=p(len-40,v0),c=p(len-40,v1),e=p(64,v1);
        K.quad({color:0xf2f2f4,gloss:.3},[[a[0],y0,a[1]],[b[0],y0,b[1]],[c[0],y1,c[1]],[e[0],y1,e[1]]],[-side*n[0]*Math.cos((t0+t1)/2),-Math.sin((t0+t1)/2),-side*n[1]*Math.cos((t0+t1)/2)]);}
      for(let s=67;s<len-43;s+=6){const q=p(s,side*2.01);K.box({x:q[0],z:q[1],y:F+.22,w:.06,h:1.8,d:.09,rotY:rot,mat:{tex:'emit',color:0xfff4df},solid:false});}
    }
    K.hpoly({color:0xf3f3f4,gloss:.3},[p(64,-1.55),p(len-40,-1.55),p(len-40,1.55),p(64,1.55)],F+2.84,false);
    const q=p(88);K.sign('반포한강공원 · 세빛섬 ↑',{x:q[0],z:q[1],y:F+2.6,w:1.5,h:.24,rotY:rot+PI,bg:'#f3f3ed',fg:'#404f54'});
    for(const [s,v,shirt] of [[78,1.25,0xd39169],[93,-1.1,0x8a9d9e]]){const q=p(s,v);K.person(q[0],F,q[1],{shirt,pants:0x50555a,rotY:s===78?rot:rot+PI});}
  });
  K.detail({name:'출구 하행 계단 점자 안내',floor:'1F',poly:strip(p(len-11,-5),p(len+5,-5),3.2),y0:0,y1:4},()=>{
    paintStrip(p(len-10,-5),p(len-7.3,-5),.35,1.215,'ob-tactile');paintStrip(p(len-7.5,-6),p(len-7.5,-4),.55,1.22,'ob-tactile');
    const t=strip(p(len-7,-5),p(len+2,-5),.35);K.quad('ob-tactile',t.map((q,i)=>[q[0],(i===0||i===3?1.2:0)+.025,q[1]]),[0,1,0]);
    for(const s of [len-10.5,len-9,len-7.5]){const q=p(s,-6.35);K.box({x:q[0],z:q[1],y:1.2,w:.035,h:1.0,d:.035,mat:0x8a8f96,solid:false});}
    K.wall(...p(len-11,-6.35),...p(len-7,-6.35),2.16,2.2,{mat:0x8a8f96,thick:.045,solid:false});
  });
  K.wall(...p(len-12,-3.45),...p(len+2,-3.45),0,3.7,{mat:{tex:'ob-white-tile',gloss:.3},thick:.15});
  K.slab(strip(p(len-12,-5),p(len-1,-5),3.4),4.15,{mat:'concrete',under:0xb9babb,thick:.2,walk:false});
  const q=p(len+1,4.1);K.sign(['원베일리 공공보행통로','고투몰 · 관광안내센터 ↓'],{x:q[0],z:q[1],y:1.9,w:2.2,h:.55,rotY:rot,bg:'#d5d8d2',fg:'#244957',twoSided:true});
  for(const v of [3.25,4.95]){const q=p(len+1,v);K.box({x:q[0],z:q[1],y:0,w:.045,h:2.15,d:.045,mat:0x828885,solid:false});}
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
