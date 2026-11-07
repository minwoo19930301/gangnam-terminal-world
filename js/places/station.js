import { JUNCTIONS, WELLS } from './_junctions.js';

export const meta = {
  id: 'station', name: '고속터미널역 · 3·7·9호선', claims: [],
  sources: [
    'https://mediahub.seoul.go.kr/archives/2016717',
    'https://mediahub.seoul.go.kr/archives/162098',
    'https://mediahub.seoul.go.kr/archives/1139258',
    'https://itwiki.kr/w/고속터미널역',
    'https://www.ssyenc.com/upload/brochure/478dee260676480b9f7e26b0eb55d7d0.pdf',
    'https://mstore.enter6.co.kr/stores/68/directions',
    '.codex-jobs/evidence/walk_s4_enter6_subway.json',
  ],
};

// Reconstruction assumptions: B1 is the contract's public connection mezzanine;
// the real Line 7 fare concourse is also represented at B2 (Seoul, 2026-01-09).
// B4=-21 follows the shared world, not the approximately 30 m real Line 9 depth.
// Unsurveyed passage alignments, exit stair orientations and platform lengths are
// inferred. Line 3's 200 m hall extends the brief's schematic central segment to
// accommodate ten 19 m cars. Line 9 uses six cars; no speculative eight-car train.
// Round 7: photo-composed interiors, with per-room lazy furnishing.
// Shared mall-side halls are furnished only when the mall is absent; their
// full-world shells and gates belong to gotomall. Shop order is unsurveyed.
// Entrance paving, furniture and information kiosks are inferred streetscape;
// the station remains entirely underground. The unsurveyed 3↔9 stair bay is
// south of the Line 9 platform envelope so no stair skirt occupies its aisle.
export function build(K) {
  // Local material adaptation only: do not change the shared kit or neighbouring
  // modules. Glazed stone uses three restrained reflection strengths.
  const stoneGloss={'station-marble':.7,'station-granite':.5,'station-c3-marble':.3,'station-diagonal':.3,'station-panels':.3,'station-ceramic':.3,'station-concourse-bands':.3,'station-stone-diagonal':.3};
  const finish=mat=>typeof mat==='string'&&stoneGloss[mat]?{tex:mat,gloss:stoneGloss[mat]}:mat;
  const raw=K;K=Object.create(raw);
  const finished=o=>Object.fromEntries(Object.entries(o).map(([k,v])=>[k,['mat','top','side','bottom','inner'].includes(k)?finish(v):v]));
  for(const method of ['box','cyl'])K[method]=o=>raw[method](finished(o));
  K.slab=(p,y,o={})=>raw.slab(p,y,finished(o));
  K.wall=(ax,az,bx,bz,y0,y1,o={})=>raw.wall(ax,az,bx,bz,y0,y1,finished(o));
  K.polyWalls=(p,y0,y1,o={})=>raw.polyWalls(p,y0,y1,finished(o));
  K.quad=(m,...args)=>raw.quad(finish(m),...args);
  K.hpoly=(m,...args)=>raw.hpoly(finish(m),...args);
  const { B1, B2, B3, B4 } = K.LEVELS;
  const C = { 3: 0xe8731a, 7: 0x8b9a4a, 9: 0xc99b5e };
  const CSS = { 3: '#e8731a', 7: '#8b9a4a', 9: '#c99b5e' };
  const mallHere=(()=>{const s=K.phys.support(-40,-110,B1+.5);return Math.abs(s.y-B1)<.3;})();
  const rect = (x0, z0, x1, z1) => [[x0,z0],[x1,z0],[x1,z1],[x0,z1]];
  const box = o => K.box({ solid: false, ...o });
  const paint = (color) => ({ tex: 'emit', color });
  // Round 13 retains signed/shared floor levels, not the video's estimated
  // physical-depth counts. New hall coordinates are schematic (research ledger).
  // Queue furnishings by substantial room, never individual fixtures.
  // Helpers retain their world coordinates; all walkable structure is built now.
  const detailRooms = [
    ['B1','연결 대합실 · 상점과 벽돌 홀',[-205,115,65,285]],
    ['B1','중앙 대합실 · 초록 개찰구',[-94,-124,-60,-74]],
    ['B1','9호선 상층 · 타원과 출구 홀',[-65,-146,43,-109]],
    ['B2','3호선 승강장 · 대리석 출구',[-110,-235,-70,-15]],
    ['B2','3·7·9호선 환승통로',[-80,-90,46,156]],
    ['B2','7호선 대합실 · 개찰구',[-153,116,64,283]],
    ['B3','7호선 곡선 승강장',[-153,116,64,283]],
    ['B4','9호선 분기홀 · 승강장',[-190,-164,61,-39]],
    ['B1','9호선 긴 에스컬레이터',[-1,-137,40,-124]],
    ['B1','3호선 대합실 · 엔터식스 연결상가',[-105,-84,-79,-42]],
  ].map(([floor,name,bounds])=>({floor,name,rect:bounds,y0:K.LEVELS[floor],y1:K.LEVELS[floor]+4.95,jobs:[]}));
  detailRooms[8].y0=B4; // visible from either landing of the 15 m descent
  let furnishing = false;
  function later(x,y,z,fn) {
    if(furnishing||y>=-.1)return false;
    const floor=y>=B1-.1?'B1':y>=B2-.1?'B2':y>=B3-.1?'B3':'B4';
    const i=floor==='B1'?(x<-79&&z>-84&&z<-42?9:z>0?0:x<-60?1:2):floor==='B2'?(z>100?5:x<-70&&z<-15?3:4):floor==='B3'?6:7;
    detailRooms[i].jobs.push(fn);return true;
  }
  const person=(x,y,z,o={})=>{if(!later(x,y,z,()=>person(x,y,z,o)))K.person(x,y,z,{h:1.68,...o});};
  function traveler(x,y,z,i,o={}) {
    if(later(x,y,z,()=>traveler(x,y,z,i,o)))return;
    const p={x,z},support=K.phys.support(x,z,y+.3);
    K.phys.resolve(p,.29,y,y+1.7,.5);
    if(Math.abs(support.y-y)>.1||Math.hypot(p.x-x,p.z-z)>.04)return;
    const rot=o.rotY??[0,Math.PI,.6,3.6,-.8][i%5];
    const shirt=o.shirt??[0x29323d,0x444d56,0xb4a28b,0xd5d6d0,0x728f9f,0x853d38][i%6];
    person(x,y,z,{rotY:rot,shirt,pants:o.pants??[0x34353a,0x252d36,0xaaa395][i%3],h:o.h??1.68});
    const P=(xx,zz)=>({x:x+Math.cos(rot)*xx+Math.sin(rot)*zz,z:z-Math.sin(rot)*xx+Math.cos(rot)*zz});
    if(i%4===0){
      box({...P(.31,.03),y:y+.45,w:.23,h:.32,d:.12,rotY:rot,mat:0xb9a486});
      for(const xx of [.23,.38])beam([P(xx,.03).x,y+.76,P(xx,.03).z],[P(xx,.03).x,y+.87,P(xx,.03).z],.009,0x6a5e4c,4);
    }else if(i%4===1){
      box({...P(0,-.19),y:y+.86,w:.28,h:.42,d:.14,rotY:rot,mat:[0x252f3c,0x6c7065,0x657e8b][i%3]});
      for(const xx of [-.13,.13])box({...P(xx,.04),y:y+1.03,w:.025,h:.26,d:.25,rotY:rot,mat:0x39434a});
    }
    if(i%3===0)for(let j=0;j<4;j++)box({...P(0,.145),y:y+.89+j*.095,w:.32,h:.013,d:.018,rotY:rot,mat:0x58636b});
    if(i%7===0)box({...P(0,.115),y:y+1.47,w:.16,h:.07,d:.04,rotY:rot,mat:0xe1e3df});
  }
  const sign = (text, x, y, z, w, h, rotY=0, bg='#172532', fg='#ffffff') => {
    if(later(x,y,z,()=>sign(text,x,y,z,w,h,rotY,bg,fg)))return;
    // A centered backing avoids the kit's rotated/two-sided box hiding letters.
    box({x,y:y-h/2-.02,z,w:w+.06,h:h+.04,d:.09,rotY,mat:0x172532});
    const rgb=/^#[0-9a-f]{6}$/i.test(bg)?parseInt(bg.slice(1),16):0;
    const pale=((rgb>>16)*.299+((rgb>>8)&255)*.587+(rgb&255)*.114)>176;
    K.sign(text, {x,y,z,w,h,rotY,bg,fg:pale&&fg==='#ffffff'?'#243742':fg,twoSided:true,offset:.07});
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
    g.fillStyle='#91979a'; g.fillRect(0,0,w,h);
    const r=K.rand(339734);
    for(let i=0;i<10000;i++) { g.fillStyle=i%3?'#717b81':'#c5cacb'; g.fillRect(r()*w,r()*h,1.1,1.1); }
    g.strokeStyle='#737c80'; g.lineWidth=1;
    for(let i=0;i<=4;i++){g.beginPath();g.moveTo(i*128,0);g.lineTo(i*128,512);g.stroke();g.beginPath();g.moveTo(0,i*128);g.lineTo(512,i*128);g.stroke();}
  }, [2.4,2.4]);
  // These finishes are local to the photographed c3 hall, not replacements
  // for the marble shared by the 7호선 and older central halls.
  K.texture('station-c3-marble',512,512,(g,w,h)=>{
    g.fillStyle='#dcd9d3';g.fillRect(0,0,w,h);const r=K.rand(17016);
    g.strokeStyle='#b9b6b0';g.lineWidth=.7;
    for(let i=0;i<9;i++){let x=r()*w,z=r()*h;g.beginPath();g.moveTo(x,z);for(let k=0;k<4;k++){x+=30+r()*28;z+=(r()-.5)*22;g.lineTo(x,z);}g.stroke();}
  },[1.2,2.4]);
  K.texture('station-c3-floor',512,512,(g,w,h)=>{
    g.fillStyle='#8f9092';g.fillRect(0,0,w,h);const r=K.rand(17020);
    for(let i=0;i<19000;i++){g.fillStyle=i%3?'#bcbdbf':'#626469';g.fillRect(r()*w,r()*h,.8,.8);}
    g.strokeStyle='#7c7e80';g.lineWidth=1;for(const a of [0,256]){g.beginPath();g.moveTo(a,0);g.lineTo(a,h);g.moveTo(0,a);g.lineTo(w,a);g.stroke();}
  },[1.2,1.2]);
  K.texture('station-flamed-pier',256,256,(g,w,h)=>{
    g.fillStyle='#8f8e8a';g.fillRect(0,0,w,h);const r=K.rand(17024);
    for(let i=0;i<7000;i++){g.fillStyle=i%2?'#b1b0aa':'#6d6e6b';g.fillRect(r()*w,r()*h,1+r()*2,1+r()*2);}
  },[.6,.6]);
  K.texture('station-descent-stone',512,512,(g,w,h)=>{
    g.fillStyle='#dcdcd8';g.fillRect(0,0,w,h);g.strokeStyle='#aaaead';g.lineWidth=1.4;
    g.strokeRect(0,0,w,h);g.beginPath();g.moveTo(0,h*.3);g.lineTo(w,h*.72);g.stroke();
  },[1.2,2.4]);
  K.texture('station-mesh-guard',128,128,(g,w,h)=>{
    g.fillStyle='#bfc3c6';g.fillRect(0,0,w,h);g.fillStyle='#6e787e';
    for(let x=5;x<w;x+=10)for(let y=5;y<h;y+=10){g.beginPath();g.arc(x,y,2.3,0,Math.PI*2);g.fill();}
  },[.4,.4]);
  K.texture('station-psd-access',1024,128,(g,w,h)=>{
    g.fillStyle='#8a8d95';g.fillRect(0,0,w,h);g.textBaseline='middle';
    g.fillStyle='#ffffff';g.font='bold 82px sans-serif';g.fillText('6-2',35,66);
    g.strokeStyle='#f5c518';g.fillStyle='#f5c518';g.lineWidth=7;
    g.beginPath();g.arc(362,28,9,0,Math.PI*2);g.fill();
    g.beginPath();g.moveTo(358,44);g.lineTo(358,75);g.lineTo(391,75);g.lineTo(406,99);g.moveTo(360,55);g.lineTo(384,55);g.stroke();
    g.beginPath();g.arc(353,86,27,.18,Math.PI*1.75);g.stroke();
    g.font='bold 73px sans-serif';g.fillText('→ 5m',422,67);
    for(const x of [805,942]){
      g.strokeStyle='#ffffff';g.lineWidth=5;g.beginPath();g.arc(x,64,45,0,Math.PI*2);g.stroke();
      g.beginPath();g.moveTo(x-31,96);g.lineTo(x+31,32);g.stroke();
    }
    g.lineWidth=5;g.strokeRect(779,67,48,8);g.beginPath();g.moveTo(785,60);g.lineTo(785,43);g.stroke();
    g.beginPath();g.arc(940,41,7,0,Math.PI*2);g.stroke();g.beginPath();g.moveTo(939,52);g.lineTo(930,73);g.lineTo(951,88);g.moveTo(935,60);g.lineTo(961,69);g.moveTo(930,73);g.lineTo(918,93);g.stroke();
  },[2.6,.32]);
  K.texture('station-tactile', 128, 128, (g,w,h) => {
    g.fillStyle='#e2bc46';g.fillRect(0,0,w,h);
    for(let i=0;i<5;i++) for(let j=0;j<5;j++) {g.fillStyle='#a78322';g.beginPath();g.arc(12+i*25,12+j*25,4,0,Math.PI*2);g.fill();g.fillStyle='#f6d66c';g.beginPath();g.arc(11+i*25,10+j*25,3,0,Math.PI*2);g.fill();}
  },[0.6,0.6]);
  K.texture('station-ribbed',128,128,(g,w,h)=>{
    g.fillStyle='#bcc3c5';g.fillRect(0,0,w,h);for(let x=0;x<w;x+=8){g.fillStyle='#7d878c';g.fillRect(x,0,2,h);g.fillStyle='#e3e7e8';g.fillRect(x+3,0,1,h);}
  },[1.2,1.2]);
  K.texture('station-grid',512,512,(g,w,h)=>{
    g.fillStyle='#a8aaa7';g.fillRect(0,0,w,h);
    for(let r=0;r<2;r++)for(let c=0;c<2;c++){
      g.fillStyle=(r+c)%2?'#dfe1df':'#d7dad8';g.fillRect(c*256+2,r*256+2,252,252);
      g.fillStyle='#eeefec';g.fillRect(c*256+3,r*256+3,250,2);
    }
  },[1.2,1.2]);
  K.texture('station-panels',512,512,(g,w,h)=>{
    g.fillStyle='#b4b7b1';g.fillRect(0,0,w,h);
    for(let r=0;r<3;r++)for(let c=0;c<2;c++){
      g.fillStyle=['#ecebe6','#f1f0eb','#e9e9e3'][(r+c)%3];g.fillRect(c*256+2,r*h/3+2,252,h/3-4);
    }
  },[1.2,1.8]);
  K.texture('station-marble',512,512,(g,w,h)=>{
    g.fillStyle='#c9ced0';g.fillRect(0,0,w,h);const rnd=K.rand(90106);
    // Irregular mineral clouds and branching veins; no parallel sinusoidal
    // bands (the previous finish looked like sand/wood in photos 01 and 06).
    for(let i=0;i<90;i++){
      const x=rnd()*w,z=rnd()*h,r=18+rnd()*85;
      const cloud=g.createRadialGradient(x,z,0,x,z,r);
      cloud.addColorStop(0,i%3?'#939fa755':'#f1f3f1aa');cloud.addColorStop(1,'#c9ced000');
      g.fillStyle=cloud;g.fillRect(x-r,z-r,r*2,r*2);
    }
    for(let i=0;i<45;i++){
      let x=rnd()*w,z=rnd()*h,angle=rnd()*Math.PI*2;
      const points=[[x,z]];
      for(let j=0;j<12;j++){angle+=(rnd()-.5)*1.8;x+=Math.cos(angle)*(10+rnd()*35);z+=Math.sin(angle)*(8+rnd()*22);points.push([x,z]);}
      for(const [width,color] of [[9,'#918f8660'],[3,'#72746d88'],[.9,'#f4f1e7']]){
        g.beginPath();points.forEach(([xx,zz],j)=>j?g.lineTo(xx,zz):g.moveTo(xx,zz));g.lineWidth=width;g.strokeStyle=color;g.stroke();
      }
    }
    g.strokeStyle='#a2a198';g.lineWidth=1.5;g.strokeRect(0,0,w,h);
  },[.9,.9]);
  K.texture('station-diagonal',512,512,(g,w,h)=>{
    g.fillStyle='#d6d3c9';g.fillRect(0,0,w,h);g.strokeStyle='#858a84';g.lineWidth=2;
    for(let i=-512;i<=1024;i+=128){g.beginPath();g.moveTo(i,0);g.lineTo(i+512,512);g.moveTo(i,0);g.lineTo(i-512,512);g.stroke();}
  },[2.4,2.4]);
  K.texture('station-brick',512,512,(g,w,h)=>{
    g.fillStyle='#efe4d2';g.fillRect(0,0,w,h);
    for(let r=0;r<12;r++)for(let c=-1;c<5;c++){
      g.fillStyle=['#d3a17a','#c8936c','#dcae88','#c99a74'][(r+c+8)%4];g.fillRect(c*128+(r%2)*64+3,r*h/12+2,122,h/12-4);
    }
  },[1.25,1]);
  K.texture('station-guide',128,128,(g,w,h)=>{
    g.fillStyle='#e7be3c';g.fillRect(0,0,w,h);
    for(let i=8;i<w;i+=24){g.fillStyle='#b58e24';g.fillRect(i,0,5,h);g.fillStyle='#f4d466';g.fillRect(i+5,0,5,h);}
  },[.6,.6]);
  K.texture('station-concourse-bands',512,512,(g,w,h)=>{
    for(let r=0;r<8;r++){
      g.fillStyle=r%2?'#8f7560':'#e9e0d0';g.fillRect(0,r*64,w,64);
      g.fillStyle='#bdb6a9';g.fillRect(0,r*64,w,1);
      for(let c=0;c<4;c++)g.fillRect(c*128+(r%2)*64,r*64,1,64);
    }
  },[2.8,2.4]);
  K.texture('station-platform-diagonal',512,512,(g,w,h)=>{
    g.fillStyle='#e7e2d6';g.fillRect(0,0,w,h);
    for(let i=-768;i<1024;i+=192){
      g.fillStyle='#8a7561';g.beginPath();g.moveTo(i,0);g.lineTo(i+92,0);g.lineTo(i+604,h);g.lineTo(i+512,h);g.closePath();g.fill();
      g.fillStyle='#c6b9a7';g.beginPath();g.moveTo(i+92,0);g.lineTo(i+112,0);g.lineTo(i+624,h);g.lineTo(i+604,h);g.closePath();g.fill();
    }
    g.strokeStyle='#aaa496';g.lineWidth=1;g.strokeRect(0,0,w,h);
  },[3.6,3.6]);
  K.texture('station-brushed',256,256,(g,w,h)=>{
    const grad=g.createLinearGradient(0,0,w,0);
    for(const [t,c] of [[0,'#8e999e'],[.2,'#d3dadd'],[.55,'#a1aeb5'],[.83,'#e1e5e4'],[1,'#98a6ad']])grad.addColorStop(t,c);
    g.fillStyle=grad;g.fillRect(0,0,w,h);
    g.fillStyle='#66798222';for(let i=0;i<h;i+=2)g.fillRect(0,i,w,1);
  },[1.2,1.2]);
  K.texture('station-local-map',512,768,(g,w,h)=>{
    g.fillStyle='#1e2d40';g.fillRect(0,0,w,h);
    g.strokeStyle='#7c9299';g.lineWidth=9;
    for(const road of [[[0,470],[512,300]],[[0,160],[512,600]],[[110,0],[190,768]],[[400,0],[320,768]]]){
      g.beginPath();road.forEach(([x,y],i)=>i?g.lineTo(x,y):g.moveTo(x,y));g.stroke();
    }
    g.strokeStyle='#dfc371';g.lineWidth=15;g.beginPath();g.moveTo(0,530);g.lineTo(512,360);g.stroke();
    g.fillStyle='#84a386';for(const [x,y] of [[35,80],[330,640],[75,640]])g.fillRect(x,y,70,65);
    g.font='bold 25px sans-serif';g.textAlign='center';g.fillStyle='#f2eee3';
    for(const [text,x,y] of [['주변 안내',256,48],['고속터미널역',256,434],['신반포로',310,535],['경부선터미널',370,220],['센트럴시티',130,285],['신세계',110,360],['서울성모병원',375,705]])g.fillText(text,x,y);
    for(let i=0;i<8;i++){const x=90+(i%4)*105,y=380+Math.floor(i/4)*118;g.fillStyle='#ebc843';g.fillRect(x-12,y-18,24,26);g.fillStyle='#253345';g.font='bold 18px sans-serif';g.fillText(String(i+1),x,y+2);}
  },[1.15,1.8]);
  K.texture('station-violet-screen',256,512,(g,w,h)=>{
    const grad=g.createLinearGradient(0,0,w,h);grad.addColorStop(0,'#7553c5');grad.addColorStop(1,'#d89ed9');g.fillStyle=grad;g.fillRect(0,0,w,h);
    g.strokeStyle='#ecd9f3';g.lineWidth=8;g.beginPath();g.ellipse(w*.65,h*.47,w*.43,h*.29,.35,0,Math.PI*2);g.stroke();
  },[1.2,1.9]);
  K.texture('station-safety-disc',128,128,(g,w,h)=>{
    g.fillStyle='#eeeade';g.fillRect(0,0,w,h);
    g.beginPath();g.arc(w/2,h/2,48,0,Math.PI*2);g.fillStyle='#e9cf4b';g.fill();g.strokeStyle='#4b4d41';g.lineWidth=3;g.stroke();
    g.fillStyle='#33382e';g.font='bold 76px sans-serif';g.textAlign='center';g.textBaseline='middle';g.fillText('!',w/2,h*.54);
  },[.14,.14]);
  K.texture('station-stone-diagonal',512,512,(g,w,h)=>{
    g.fillStyle='#c4c3ba';g.fillRect(0,0,w,h);
    for(let i=-512;i<1024;i+=64){
      g.fillStyle=['#a6a79e','#d8d6ca','#bebfb4'][Math.abs(i/64)%3];
      g.beginPath();g.moveTo(i,0);g.lineTo(i+38,0);g.lineTo(i+550,h);g.lineTo(i+512,h);g.closePath();g.fill();
    }
    g.strokeStyle='#aaa99f';g.lineWidth=1;g.strokeRect(0,0,w,h);
  },[1.8,2.4]);
  K.texture('station-name-oval',768,160,(g,w,h)=>{
    g.fillStyle='#e6e4dc';g.fillRect(0,0,w,h);
    g.beginPath();g.ellipse(w/2,h/2,w*.49,h*.46,0,0,Math.PI*2);g.fillStyle='#e87a34';g.fill();
    g.beginPath();g.ellipse(w/2,h/2,w*.47,h*.37,0,0,Math.PI*2);g.fillStyle='#f0eee6';g.fill();
    g.font='bold 64px sans-serif';g.textAlign='center';g.textBaseline='middle';g.fillStyle='#424641';g.fillText('③ 고속터미널',w/2,h*.51);
  },[3.7,.78]);
  // Changing campaigns are represented by five photographic colour studies,
  // not repeated text cards. Brand copy is added only to every third lightbox.
  for(let theme=0;theme<5;theme++)K.texture('station-ad-'+theme,768,512,(g,w,h)=>{
    const palettes=[['#7fa8d6','#e5edf4','#375f76'],['#2c6e8f','#77c5cd','#153f51'],['#d84b3c','#f3c9aa','#7c343d'],['#e8d6b5','#a9c8c0','#5a7264'],['#2baca3','#b8e5b2','#19766f']];
    const [sky,glow,shade]=palettes[theme],grad=g.createLinearGradient(0,0,w,h);
    grad.addColorStop(0,sky);grad.addColorStop(.56,glow);grad.addColorStop(1,sky);g.fillStyle=grad;g.fillRect(0,0,w,h);
    const rnd=K.rand(700+theme);
    for(let layer=0;layer<4;layer++){
      g.globalAlpha=.14+layer*.1;g.fillStyle=shade;g.beginPath();g.moveTo(0,h);
      for(let x=0;x<=w;x+=48)g.lineTo(x,h*(.35+layer*.13)+(rnd()-.5)*h*.22);
      g.lineTo(w,h);g.closePath();g.fill();
    }
    g.globalAlpha=.22;g.fillStyle='#ffffff';
    for(let i=0;i<16;i++){g.beginPath();g.arc(rnd()*w,rnd()*h,8+rnd()*38,0,Math.PI*2);g.fill();}
    // Soft, abstract garment/product silhouette; no unverified campaign art.
    g.globalAlpha=.65;g.fillStyle=theme===4?'#258746':'#e7ece8';
    g.beginPath();g.moveTo(w*.66,h*.22);g.lineTo(w*.82,h*.29);g.lineTo(w*.9,h*.78);g.lineTo(w*.57,h*.84);g.lineTo(w*.59,h*.35);g.closePath();g.fill();
    g.globalAlpha=1;
  },[3.5,2.17]);

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
  function localSign(f,s,v,y,text,w=5,h=.65,along=false,bg='#172532',fg='#ffffff') {
    const p=f.at(s,v);sign(text,p.x,y,p.z,w,h,p.rot+(along?Math.PI/2:0),bg,fg);
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
  function lineWall(f,v,y,h,openings=[],mat='station-panels') {
    const e=f.edge(v);
    for(let i=0;i<e.length-1;i++) {
      const a=e[i],b=e[i+1],len=Math.hypot(b[0]-a[0],b[1]-a[1]);
      const ops=[];
      for(const o of openings){
        const t=((o.x-a[0])*(b[0]-a[0])+(o.z-a[1])*(b[1]-a[1]))/(len*len);
        const dist=Math.hypot(a[0]+t*(b[0]-a[0])-o.x,a[1]+t*(b[1]-a[1])-o.z);
        if(t>=-.05&&t<=1.05&&dist<o.w)ops.push({at:t*len,w:o.w,y0:y,y1:y+(o.full?h:3.2)});
      }
      K.wall(...a,...b,y,y+h,{mat,thick:.18,openings:ops});
    }
  }
  function strip(f,s,v,y,w,len,mat){localBox(f,s,v,y,w,.018,len,mat);}
  function light(f,s,v,y,length=2.4){
    const p=f.at(s,v);if(later(p.x,y,p.z,()=>light(f,s,v,y,length)))return;
    localBox(f,s,v,y,.28,.075,length+.1,0x8e9798);
    for(const dv of [-.073,.073])localBox(f,s,v+dv,y-.018,.045,.035,length,paint(0xf2f8fa));
  }
  function ceilingVent(f,s,v,y){
    const q=f.at(s,v);if(later(q.x,y,q.z,()=>ceilingVent(f,s,v,y)))return;
    const p=f.at(s,v);
    K.cyl({x:p.x,z:p.z,y:y+2.73,r:.38,h:.07,mat:0xd5d6d0,seg:20,solid:false});
    K.cyl({x:p.x,z:p.z,y:y+2.715,r:.29,h:.025,mat:0x777f7b,seg:20,solid:false});
    for(let q=-.2;q<=.2;q+=.08)localBox(f,s+q,v,y+2.708,.42,.012,.018,0xb8beb9);
  }
  function ceilingServices(f,width,y,h,holes=[]) {
    const p=f.at(f.length/2);if(later(p.x,y,p.z,()=>ceilingServices(f,width,y,h,holes)))return;
    for(let s=4;s<f.length-2;s+=7.2){
      if(insideVoid(f,s,0,holes,1))continue;
      localBox(f,s,0,y+h-.12,.6,.035,.6,0xa8aaa3);
      for(let i=0;i<9;i++)localBox(f,s-.24+i*.06,0,y+h-.143,.53,.02,.018,0x555d5d);
      const q=f.at(s+1.3,width*.18);
      K.cyl({x:q.x,z:q.z,y:y+h-.17,r:.075,h:.06,mat:0xf0eee7,seg:10,solid:false});
      localBox(f,s+2,width*.18,y+h-.19,.08,.06,.08,0xbfc3c0);
      if(Math.round(s/7.2)%3===0){
        localBox(f,s,width*.38,y+h-.25,.05,.16,.05,'metal');
        localBox(f,s,width*.38,y+h-.34,.13,.1,.25,0xf0eee9);
        localBox(f,s-.13,width*.38,y+h-.32,.075,.06,.025,0x263239);
      }
    }
  }
  function wayfinding(f,s,y,width=7) {
    const p=f.at(s);if(later(p.x,y,p.z,()=>wayfinding(f,s,y,width)))return;
    const sections=[[-.38,.23,'← 고속버스터미널','#235da1','#ffffff'],[-.12,.28,'나가는 곳','#f4c82f','#242b2b'],[.17,.29,'③ ⑦ ⑨  타는 곳 ↑','#303538','#ffffff'],[.41,.18,'경부선 →','#235da1','#ffffff']];
    for(const [v,w,text,bg,fg] of sections){const q=f.at(s,v*width);sign(text,q.x,y+2.38,q.z,w*width,.43,p.rot,bg,fg);}
    for(const v of [-width*.4,width*.4])localBox(f,s,v,y+2.61,.025,.21,.025,'metal');
  }
  const insideVoid=(f,s,v,holes,pad=.6)=>{const p=f.at(s,v);return holes.some(r=>p.x>r[0]-pad&&p.x<r[2]+pad&&p.z>r[1]-pad&&p.z<r[3]+pad);};
  function hanging(f,s,y,label,width=6,height=2.85,line=0) {
    const q=f.at(s);if(later(q.x,y,q.z,()=>hanging(f,s,y,label,width,height,line)))return;
    const p=f.at(s),rot=p.rot,cy=height>=4?2.75:2.38;
    const exit=/출구|나가는/.test(label),bg=line===9?'#d8d2c4':'#2f3336',fg=line===9?'#3d3f8f':'#ffffff';
    for(const v of [-width*.38,width*.38])localBox(f,s,v,y+cy+.24,.03,Math.max(.06,height-cy-.24),.03,'metal');
    sign('',p.x,y+cy,p.z,width,.43,rot,bg,fg);
    const lines=exit?[]:[3,7,9].filter(n=>n===line||label.includes(String(n)));
    const iconW=lines.length*.43,exitW=exit?width*.29:0,textW=width-exitW-iconW-.16;
    const textAt=f.at(s,(exitW-iconW)/2);
    K.sign(label.replace(/나가는 곳\s*/g,''),{x:textAt.x,y:y+cy,z:textAt.z,w:textW,h:.39,rotY:rot,bg:null,fg,twoSided:true,offset:.08});
    lines.forEach((n,i)=>{const q=f.at(s,width/2-.24-i*.43);K.sign({3:'③',7:'⑦',9:'⑨'}[n],{x:q.x,y:y+cy,z:q.z,w:.34,h:.34,rotY:rot,bg:null,fg:CSS[n],twoSided:true,offset:.085});});
    if(exit){const q=f.at(s,-width/2+exitW/2);K.sign('나가는 곳',{x:q.x,y:y+cy,z:q.z,w:exitW,h:.43,rotY:rot,bg:'#f2c324',fg:'#252b2d',twoSided:true,offset:.08});}
  }
  function column(f,s,v,y,line,h=2.88,marble=false) {
    const p=f.at(s,v),r=line===3?.52:.39;
    if(line===7)localBox(f,s,v,y,1.5,h,.42,'station-panels',true);
    else K.cyl({x:p.x,z:p.z,y,r,h,mat:marble?'station-marble':{color:0xeeeee8,gloss:.3},seg:marble?8:24});
    if(line!==7){
    K.cyl({x:p.x,z:p.z,y,r:r+.015,h:.09,mat:0x343a3c,seg:16,solid:false});
    K.cyl({x:p.x,z:p.z,y:y+.09,r:r+.018,h:.09,mat:{tex:'metal',gloss:.7},seg:24,solid:false});
    }
    const finish=()=>{
    // Photos 10/11/17: cladding joints and a bent, broad route-colour sash.
    if(line!==7)for(let yy=.64;yy<h;yy+=.64)K.cyl({x:p.x,z:p.z,y:y+yy,r:r+.005,h:.009,mat:0x838982,seg:24,solid:false});
    if(!line)return;
    for(const facing of [p.rot,p.rot+Math.PI]){
      const rr=line===7?.225:r+.023,half=.58/(2*rr),bottom=.25,top=h;
      const bend=yy=>{const t=(yy-bottom)/(top-bottom);return (line===7?-1:1)*(.38-.82*Math.abs(t-.52));};
      const P=(yy,t)=>{
        if(line===7){const u=t*.31+bend(yy);return [p.x+Math.sin(facing)*rr+Math.cos(facing)*u,y+yy,p.z+Math.cos(facing)*rr-Math.sin(facing)*u];}
        const a=facing+bend(yy)+t*half;return [p.x+Math.sin(a)*rr,y+yy,p.z+Math.cos(a)*rr];
      };
      if(line===7){
        const nx=Math.sin(facing),nz=Math.cos(facing),Q=(u,yy,d=.218)=>[p.x+nx*d+Math.cos(facing)*u,y+yy,p.z+nz*d-Math.sin(facing)*u];
        K.quad({color:0xbfc2c0,gloss:.3},[Q(-.73,1.12),Q(.73,1.12),Q(.73,1.78),Q(-.73,1.78)],[nx,0,nz]);
        for(const yy of [.14,.72,1.1,1.8,2.4])beam(Q(-.74,yy),Q(.74,yy),.006,0x676c69,4);
      }
      for(let j=0;j<8;j++)for(let k=0;k<12;k++){
        const a=-1+k/6,b=-1+(k+1)/6,lo=bottom+(top-bottom)*j/8,hi=bottom+(top-bottom)*(j+1)/8;
        const tip=()=>hi;
        const normal=facing+bend((lo+hi)/2)+(a+b)/2*half;
        K.quad(C[line],[P(lo,a),P(lo,b),P(tip(b),b),P(tip(a),a)],[Math.sin(normal),0,Math.cos(normal)]);
      }
      const q={x:p.x+Math.sin(facing)*(rr+.019),z:p.z+Math.cos(facing)*(rr+.019),rotY:facing,bg:null,fg:'#ffffff',bold:false};
      K.sign(line===7?'←':'→',{...q,y:y+2.36,w:.56,h:.35});
      K.sign({3:'③',7:'⑦',9:'⑨'}[line],{...q,y:y+1.77,w:.6,h:.64});
      const destinations={3:['대화','오금'],7:['장암','석남'],9:['개화','중앙보훈병원']}[line];
      K.sign(destinations[0],{...q,y:y+1.15,w:.43,h:.21});
      K.sign(destinations[1],{...q,y:y+.81,w:.43,h:.21});
      const tx=Math.cos(facing)*.22,tz=-Math.sin(facing)*.22;
      beam([q.x-tx,y+.98,q.z-tz],[q.x+tx,y+.98,q.z+tz],.006,0xffffff,4);
    }
    };
    if(!later(p.x,y,p.z,finish))finish();
  }
  function adPanel(f,s,v,y,{wide=false,led=false,theme=0,face=1,along=false,portrait=false}={}) {
    const queued=f.at(s,v);if(later(queued.x,y,queued.z,()=>adPanel(f,s,v,y,{wide,led,theme,face,along,portrait})))return;
    const p=f.at(s,v),rot=p.rot+(along?(face<0?Math.PI:0):face*Math.PI/2),w=portrait?1.2:wide?3.5:.87,h=portrait?1.9:2.17;
    box({x:p.x,y:y+.24,z:p.z,w:w+.1,h:h+.1,d:.12,rotY:rot,mat:0x303436});
    const nx=Math.sin(rot),nz=Math.cos(rot),q={x:p.x+nx*.075,z:p.z+nz*.075,rotY:rot};
    const ux=Math.cos(rot),uz=-Math.sin(rot),P=(u,yy)=>[q.x+ux*u,yy,q.z+uz*u];
    K.quad('station-ad-'+(theme%5),[P(-w/2,y+.29),P(w/2,y+.29),P(w/2,y+.29+h),P(-w/2,y+.29+h)],[nx,0,nz],[[0,0],[1,0],[1,1],[0,1]]);
    if(theme%3===0){
      const copy=led?['Sprite','새로워진 상쾌함!']:['Columbia','깃털급 가벼움','히터급 보온력'];
      K.sign(copy,{...q,y:y+1.48,w:w*.89,h:1.15,bg:null,fg:'#ffffff',offset:.025});
    }
    box({x:p.x+nx*.08,y:y+.3,z:p.z+nz*.08,w:w-.04,h:.035,d:.02,rotY:rot,mat:paint(0xeaf4f5)});
  }
  function adPier(f,s,v,y,line) {
    const p=f.at(s,v);if(later(p.x,y,p.z,()=>adPier(f,s,v,y,line)))return;
    localBox(f,s,v,y,.82,2.67,.82,0x20272a,true);
    for(const side of [-1,1])adPanel(f,s+side*.43,v,y,{led:true,theme:Math.round(s/9)+(side<0?0:1),face:side,along:true});
    localSign(f,s,v,y+2.52,`${line}호선  ↑`,.78,.23,false,'#2f3336');
  }
  function tactile(f,s0,s1,v,y) {
    for(let s=s0;s<s1;s+=2.4)strip(f,s+Math.min(2.4,s1-s)/2,v,y+.024,.6,Math.min(2.4,s1-s),'station-guide');
  }
  function vending(f,s,v,y) {
    const q=f.at(s,v);if(later(q.x,y,q.z,()=>vending(f,s,v,y)))return;
    localBox(f,s,v,y,.75,1.83,1.05,0xd2d7d5,true);
    const p=f.at(s,v-.4),rot=p.rot+Math.PI/2;
    sign('음료',p.x,y+1.65,p.z,.95,.24,rot,'#236347');
    for(let r=0;r<4;r++)for(let c=0;c<5;c++){
      localBox(f,s+(c-2)*.16,v-.405,y+.58+r*.21,.035,.14,.095,[0x7ba35d,0xeeeece,0xc76b4b,0x7393ab,0xd8ba57][c]);
    }
    localBox(f,s,v-.42,y+.28,.035,.16,.6,0x25383d);
  }
  function storefront(f,s,v,y,name,kind,entry=false) {
    // Shallow display bays are inferred; names and the planted ENTER6 jamb
    // follow 02/03. Keep partition collision independent of the stock group.
    localBox(f,s,v+1.45,y,.12,2.9,4.7,0xe3dfd5,true);
    for(const ds of [-2.3,2.3])localBox(f,s+ds,v+.6,y,1.8,2.9,.12,0xbcbcb4,true);
    const stock=()=>{
    localBox(f,s,v-.3,y+2.24,.18,.5,4.65,kind==='plant'?0x35563a:0xe8e5dc);
    localSign(f,s,v-.42,y+2.48,name,4.3,.36,true,kind==='plant'?'#36563a':'#e9e8df');
    localBox(f,s+(entry?-1.6:0),v+.1,y,.6,.85,entry?.8:3.6,kind==='plant'?'wood':0xdfdbcb,true);
    const pal=[0xd6ba9f,0xc7cf9e,0xe5bec8,0x739b8a,0xe9dfbb];
    for(let r=0;r<3;r++){
      localBox(f,s,v+1.25,y+.45+r*.47,.35,.055,4.2,0xb3ac98);
      for(let c=0;c<17;c++){
        localBox(f,s+(c-8)*.23,v+1.18,y+.51+r*.47,.13,.2+(c%3)*.035,.14,pal[(c+r)%pal.length]);
        localBox(f,s+(c-8)*.23,v+1.1,y+.57+r*.47,.01,.065,.09,0xf3ede2);
        localBox(f,s+(c-8)*.23,v+1.18,y+.71+r*.47+(c%3)*.035,.09,.035,.1,0xe7d9bb);
      }
    }
    if(kind==='plant'){
      for(const ds of [-2.12,2.12]){
        localBox(f,s+ds,v-.4,y,.28,2.7,.36,0x36553b);
        for(let r=0;r<13;r++)localBox(f,s+ds+(r%3-1)*.09,v-.59,y+.1+r*.2,.12,.14,.18,[0x647b46,0x41623d,0x7b8851][r%3]);
      }
      localBox(f,s,v+.36,y+1.62,.035,.035,3.6,'metal');
      for(let c=0;c<11;c++)localBox(f,s+(c-5)*.3,v+.36,y+.98,.08,.57,.26,[0xd3c0a6,0x7b6d67,0x395257,0xa7917e][c%4]);
      // Foreground plant wall: dense leaves, hanging fern fronds and a small
      // cream-on-brown directory instead of a generic green shop fascia.
      localBox(f,s-1.45,v-.36,y,.2,2.75,1.55,0x28452b);
      const rnd=K.rand(207),green=[0x29452b,0x405f31,0x637b3e,0x7d8d50];
      for(let i=0;i<370;i++){
        const ss=s-2.15+rnd()*1.43,yy=y+.08+rnd()*2.64,vv=v-.5-rnd()*.12;
        const a=f.at(ss-.065,vv),b=f.at(ss+.065,vv),c=f.at(ss,vv-.04);
        K.quad(green[i%4],[[a.x,yy,a.z],[c.x,yy-.1,c.z],[b.x,yy,b.z],[c.x,yy+.1,c.z]],[-f.at(s).nx,0,-f.at(s).nz]);
      }
      for(let i=0;i<14;i++)for(let j=0;j<9;j++){
        const ss=s-2.1+i*.11+Math.sin(j*.3)*.12,yy=y+2.75-j*.075;
        localBox(f,ss,v-.6-j*.026,yy,.025,.035,.12,green[(i+j)%4]);
      }
      localSign(f,s-1.45,v-.72,y+1.81,['ENTER6','↑','FASHION THEATER'],1.02,.76,true,'#413d2b','#eee5c9');
      for(let i=0;i<6;i++){
        localBox(f,s+.2+i*.28,v-.18,y+.88,.18,.28,.22,[0xc4a385,0x924b41,0x3c4840][i%3]);
        const a=f.at(s+.2+i*.28-.07,v-.2),b=f.at(s+.2+i*.28+.07,v-.2);
        beam([a.x,y+1.16,a.z],[b.x,y+1.22,b.z],.015,0xd3ba8a,4);
      }
    }
    };
    const p=f.at(s,v);if(!later(p.x,y,p.z,stock))stock();
  }
  function ovalMezzanine(x,z,y) {
    // Photo 16 is a curved balcony edge around an opening, not a dome.
    // Its unsurveyed upper circulation is shown as fascia and balustrade only.
    const inner=[],outer=[],segments=48;
    for(let i=0;i<segments;i++){
      const t=i/segments*Math.PI*2;
      inner.push([x+Math.cos(t)*13,z+Math.sin(t)*7.4]);
      outer.push([x+Math.cos(t)*14.6,z+Math.sin(t)*9]);
    }
    K.slab(outer,y+3.7,{holes:[inner],mat:0xd5d2c8,under:'station-grid',thick:.12,walk:false});
    // Low perimeter soffit meets the ordinary concourse columns; the central
    // opening exposes the upper grid and curved glass-balustraded edge.
    K.slab(rect(x-21,z-12,x+20,z+12),y+2.9,{holes:[inner],mat:0xd5d2c8,under:'station-grid',thick:.08,walk:false});
    for(let i=0;i<segments;i++){
      const a=inner[i],b=inner[(i+1)%segments],mx=x-(a[0]+b[0])/2,mz=z-(a[1]+b[1])/2;
      K.quad('station-panels',[[a[0],y+2.7,a[1]],[b[0],y+2.7,b[1]],[b[0],y+3.7,b[1]],[a[0],y+3.7,a[1]]],[mx,0,mz]);
      K.wall(...a,...b,y+3.7,y+4.55,{mat:'glass',solid:false,thick:.025});
      beam([a[0],y+4.58,a[1]],[b[0],y+4.58,b[1]],.03,'metal',6);
      if(i%2===0)box({x:a[0],z:a[1],y:y+3.7,w:.04,h:.88,d:.04,mat:'metal'});
    }
    K.slab(rect(x-20,z-12,x+20,z+12),y+4.9,{mat:'concrete',under:'station-grid',thick:.08,walk:false});
    const f=frame([[x-18,z],[x+18,z]]);
    for(let s=2;s<36;s+=3.6)for(const v of [-5,0,5])light(f,s,v,y+4.72,1.8);
  }
  function beam(a,b,r,mat=0x9ba7ad,seg=8) {
    const dx=b[0]-a[0],dy=b[1]-a[1],dz=b[2]-a[2],l=Math.hypot(dx,dy,dz),u=[dx/l,dy/l,dz/l];
    let v=Math.abs(u[1])<.95?[u[2],0,-u[0]]:[1,0,0];const vl=Math.hypot(...v);v=v.map(n=>n/vl);
    const w=[u[1]*v[2]-u[2]*v[1],u[2]*v[0]-u[0]*v[2],u[0]*v[1]-u[1]*v[0]];
    const p=(q,t)=>q.map((c,j)=>c+r*(v[j]*Math.cos(t)+w[j]*Math.sin(t)));
    for(let i=0;i<seg;i++){const t=i/seg*Math.PI*2,tt=(i+1)/seg*Math.PI*2,n=v.map((c,j)=>c*Math.cos((t+tt)/2)+w[j]*Math.sin((t+tt)/2));K.quad(mat,[p(a,t),p(b,t),p(b,tt),p(a,tt)],n);}
  }
  function steelEscalator(ax,az,bx,bz,ya,yb,w,hazard=false,glazed=false) {
    const len=Math.hypot(bx-ax,bz-az),ux=(bx-ax)/len,uz=(bz-az)/len,nx=-uz,nz=ux;
    for(const side of [-1,1]){
      const v=side*(w/2+.073),P=(t,h)=>[ax+(bx-ax)*t+nx*v,ya+(yb-ya)*t+h,az+(bz-az)*t+nz*v];
      const panel=[P(0,.06),P(1,.06),P(1,glazed?.32:.93),P(0,glazed?.32:.93)];
      for(const face of [-1,1])K.quad({tex:'station-brushed',gloss:.5},panel,[nx*side*face,0,nz*side*face],[[0,1],[len,1],[len,0],[0,0]]);
      if(glazed)K.quad('glass',[P(0,.32),P(1,.32),P(1,.94),P(0,.94)],[nx*side,0,nz*side]);
      beam(P(0,1.01),P(1,1.01),.045,0x202526,8);
      if(hazard)for(let i=0;i<Math.ceil(len/.28);i++){
        const t=i*.28/len,u=Math.min(1,(i+1)*.28/len);
        for(const face of [-1,1])K.quad(i%2?0x262a2a:0xe0c146,[P(t,.87),P(u,.87),P(u,.93),P(t,.93)],[nx*side*face,0,nz*side*face]);
      }
    }
  }
  function bench(f,s,v,y) {
    const q=f.at(s,v);if(later(q.x,y,q.z,()=>bench(f,s,v,y)))return;
    localBox(f,s,v,y+.42,.65,.11,3.5,'metal',true);
    localBox(f,s,v+.28,y+.55,.09,.55,3.5,0x8d9ca3);
    for(const q of [-1.3,1.3])localBox(f,s+q,v,y,.38,.42,.12,0x394951);
    for(let q=-1.4;q<1.5;q+=.7)localBox(f,s+q,v,y+.54,.62,.025,.035,0x5e6b70);
  }
  function facilities(f,s,v,y) {
    const p=f.at(s,v);if(later(p.x,y,p.z,()=>facilities(f,s,v,y)))return;
    localBox(f,s,v,y,.65,1.35,.7,0xdadbce,true);
    localSign(f,s,v-.36,y+1,'비상통화',.6,.25,true,'#a62f23');
    localBox(f,s+1.4,v,y,.7,1.7,.9,0xb33025,true);
    localSign(f,s+1.4,v-.46,y+1.1,['소화전','비상용'],.65,.48,true,'#ad332a');
  }
  function gates(f,s,y,n=7,line=7,steel=false,label='타는 곳') {
    const q=f.at(s);if(later(q.x,y,q.z,()=>gates(f,s,y,n,line,steel,label)))return;
    for(let i=0;i<n;i++){
      const v=(i-(n-1)/2)*1.25,green=line===3&&!steel,body=green?0x73ad45:'metal';
      localBox(f,s,v,y,.55,.35,1.65,'metal',true);
      localBox(f,s,v,y+.35,.55,.65,1.65,body,true);
      localBox(f,s,v,y+1.005,.56,.05,1.67,green?0x73ad45:{color:0xc9ccd0,gloss:.6});
      if(!green)for(const dv of [-.25,.25])localBox(f,s,v+dv,y+1.057,.03,.012,1.48,paint(0xffffff));
      localBox(f,s-.45,v,y+1.06,.25,.065,.3,0x2f87b0);
      for(const side of [-1,1]){
        const p=f.at(s+side*.84,v),rot=p.rot+(side<0?Math.PI:0);
        K.sign('↗',{x:p.x,z:p.z,y:y+.55,w:.25,h:.25,rotY:rot,bg:'#111111',fg:'#9be15a',offset:.025});
      }
      if(green){
        for(const ds of [-.48,.48])localBox(f,s+ds,v,y+1,.04,.23,.04,body);
        let last=null;
        for(let j=0;j<=8;j++){
          const t=Math.PI*j/8,p=f.at(s-.48*Math.cos(t),v),q=[p.x,y+1.23+.12*Math.sin(t),p.z];
          if(last)beam(last,q,.02,body,6);last=q;
        }
      }else{
        localBox(f,s-.69,v,y+.99,.24,.018,.13,0xeaa339);
        localBox(f,s-.42,v,y+1.07,.19,.025,.16,paint(0x4d9cd9));
        const p=f.at(s-.85,v);
        K.sign(String(21+i),{x:p.x,z:p.z,y:y+.91,w:.18,h:.12,rotY:p.rot+Math.PI,bg:'#e8ece9',fg:'#28312f'});
      }
      if(i<n-1)localBox(f,s+.06,v+.625,y+.35,.7,.45,.04,'glass');
    }
    if(label)hanging(f,s,y,label,Math.min(9,n*1.25),f.height||2.85,line);
  }
  function ticketBank(f,s,v,y) {
    const q=f.at(s,v);if(later(q.x,y,q.z,()=>ticketBank(f,s,v,y)))return;
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
    localBox(f,s,v,y,3.1,2.8,7,'station-panels',true);
    // Recessed service frontage; booths themselves are not a circulation route.
    localBox(f,s,v-1.57,y+.92,.04,1.25,5.7,'glass');
    localSign(f,s,v-1.63,y+2.45,label,5.8,.5,true);
    localBox(f,s,v-1.68,y+.87,.45,.13,5.8,0x535d5d);
  }
  function hall(points,width,y,opts={}) {
    const f=frame(points),poly=f.poly(-width/2,width/2),holes=opts.holes||[];
    const h=opts.h||2.9,roofHoles=opts.roofHoles||[],floorMat=opts.mat||'station-marble';
    f.height=h;
    cutSlab(poly,y,holes,{mat:floorMat});
    // A thin finish at shared floor joints avoids coplanar neighbour tiles;
    // the registered walking surface stays exactly on the shared level.
    if(opts.jointFinish)K.hpoly(floorMat,poly,y+.02,true,holes.map(r=>rect(...r)));
    if(!opts.noRoof)cutSlab(poly,y+h,roofHoles,{mat:'concrete',under:'station-grid',thick:.08,walk:false});
    lineWall(f,-width/2,y,h,opts.openings||[],opts.wallMat);lineWall(f,width/2,y,h,opts.openings||[],opts.wallMat);
    ceilingServices(f,width,y,h,roofHoles);
    for(let s=2;s<f.length-1;s+=3.6){
      if(!opts.crossLights)for(const v of [-width*.26,width*.26])if(!insideVoid(f,s,v,roofHoles,1.3))light(f,s,v,y+h-.15,2.4);
      if(opts.tactile!==false&&!insideVoid(f,s,0,holes,1.5))strip(f,s,0,y+.012,.6,Math.min(3.6,f.length-s+1),'station-guide');
    }
    if(opts.crossLights)for(let s=2;s<f.length-1;s+=2.4)for(const v of [-2.4,0,2.4]){
      const a=f.at(s,v-.6),b=f.at(s,v+.6),cross=frame([[a.x,a.z],[b.x,b.z]]);
      light(cross,.6,0,y+h-.15,1.2);
    }
    const gatePoints=[...[...(opts.gateStations||[]),...(opts.signStations||[])].map(s=>f.at(s)),...(opts.gatePoints||[])];
    for(let s=9;s<f.length-3;s+=22){
      const p=f.at(s);
      if(!insideVoid(f,s,0,roofHoles,2)&&gatePoints.every(q=>Math.hypot(p.x-q.x,p.z-q.z)>=8))hanging(f,s,y,opts.label||'3·7·9호선  갈아타는 곳 →',Math.min(width-1,8),h-.08,opts.line||0);
    }
    if(opts.ads)for(let s=7;s<f.length-5;s+=4.6)for(const side of [-1,1]){
      const p=f.at(s,side*(width/2-.17));
      if((opts.openings||[]).every(o=>Math.hypot(o.x-p.x,o.z-p.z)>o.w/2+2)&&!insideVoid(f,s,side*(width/2-.17),holes,2))adPanel(f,s,side*(width/2-.17),y,{wide:true,face:side,theme:Math.floor(s/4.6)+(side>0?1:0)});
    }
    if(opts.floor)K.zone({name:opts.name||'고속터미널역',floor:opts.floor,sub:opts.sub||opts.label,poly,y0:y,y1:y+4.8});
    return f;
  }

  // Public B1 band stays outside the hotel and skirts the north of the rotunda.
  const b1Path=[[45,150],[-45,186],[-68,195],[-88,220],[-175,262]];
  const b1Voids=[[17,145,25,163],[-126,235,-118,251]];
  // Round 10: destination labels and stair bearings remain unverified. OSM
  // exit points do not establish which building each underground door serves.
  const exitSpecs=[
    ['2',55.11,124.19,0,1, [45,150],'반포미도아파트 · 경부선 주차장'],
    ['7',37.5,131.19,0,1,[37,153],'JW메리어트 · 센트럴시티'],
    ['3',52.11,179.03,0,-1,[45,153],'사평대로 · JW메리어트 · 파미에스테이션'],
    ['4',-130.48,250.07,-.89,.455,[-148,248],'서울성모병원'],
    ['5',-185.64,276.89,.89,-.455,[-174,261],'국립중앙도서관'],
    ['6',-195.26,261.52,.89,-.455,[-173,255],'래미안퍼스티지'],
  ];
  // the concourse's north wall borders 파미에스테이션 B1 (센트럴시티): two open fronts into the food street
  // Exit targets lie on the hall centreline: cut only the incoming wall at
  // its actual intersection. Project the 6 m corridor width onto that wall
  // (exit 6 is oblique), rather than opening both walls around the target.
  const exitMouths=exitSpecs.flatMap(e=>{
    const target=e[5],ray=[e[1]+16*e[3]-target[0],e[2]+16*e[4]-target[1]],hits=[];
    const cross=(a,b)=>a[0]*b[1]-a[1]*b[0],f=frame(b1Path);
    for(const side of [-7,7]){
      const edge=f.edge(side);
      for(let i=0;i<edge.length-1;i++){
        const a=edge[i],d=[edge[i+1][0]-a[0],edge[i+1][1]-a[1]],q=[a[0]-target[0],a[1]-target[1]],den=cross(ray,d);
        if(Math.abs(den)<.001)continue;
        const t=cross(q,d)/den,u=cross(q,ray)/den;
        if(t>=0&&u>=0&&u<=1)hits.push({t,x:target[0]+ray[0]*t,z:target[1]+ray[1]*t,w:6.2*Math.hypot(...ray)*Math.hypot(...d)/Math.abs(den)});
      }
    }
    // Exit 2 enters the already open end of the hall, with no side-wall cut.
    hits.sort((a,b)=>a.t-b.t);return hits.length?[hits[0]]:[];
  });
  // Descending stair cores need floor voids, not gaps in both B1 perimeter walls.
  const publicOpen=[{x:-42.6,z:177.2,w:8},{x:-61.3,z:184.4,w:8},{x:-133,z:249,w:12},{x:-45,z:191,w:12},...exitMouths];
  // Shop openings avoid the existing ticket bank and staffed station office.
  const b1ShopStations=[20,38,44,50,74,80],b1ShopFrame=frame(b1Path);
  const shopOpen=b1ShopStations.map(s=>({...b1ShopFrame.at(s,7),w:4.7,full:true}));
  const b1=hall(b1Path,14,B1,{floor:'B1',name:'고속터미널역 연결 대합실',sub:'2~7번 출구 · 파미에스테이션 · 센트럴시티 · 신세계',label:'2–7 출구  |  센트럴시티 · 신세계 · JW메리어트',signStations:[33,49,101],holes:b1Voids,roofHoles:[],openings:[...publicOpen,...shopOpen]});
  const endA=b1.at(0,3.5),endB=b1.at(0,7);
  K.wall(endA.x,endA.z,endB.x,endB.z,B1,B1+2.9,{mat:'station-panels'});
  b1ShopStations.forEach((s,i)=>{
    storefront(b1,s,6.9,B1,['아트박스','네이처리퍼블릭','편의점 GS25'][i%3],'stock');
    const bay=localSlab(b1,s-2.35,s+2.35,6.65,8.45,B1,'station-marble');
    K.slab(bay,B1+2.9,{mat:'concrete',under:'station-grid',thick:.08,walk:false});
  });
  for(let s=4;s<b1.length-3;s+=7.2)ceilingVent(b1,s,0,B1);
  // bridge the seam between this concourse and the 파미에스테이션 B1 floor at the two open fronts
  // (slightly raised finish so it does not z-fight either floor; ceiling strip closes the slot above)
  for(const q of [[-42.6,177.2],[-61.3,184.4]]){const ux=.9314,uz=-.3639,nx=-uz,nz=ux;const Q=(a,b)=>[q[0]+ux*a+nx*b,q[1]+uz*a+nz*b];const r=[Q(-4.3,-2.2),Q(4.3,-2.2),Q(4.3,2.2),Q(-4.3,2.2)];K.slab(r,B1+.015,{mat:'station-marble',thick:.05,under:false,edge:false,ceil:false});K.hpoly('station-grid',r,B1+2.82,false);}
  for(let s=15;s<b1.length-5;s+=18){column(b1,s,5.7,B1,0);localSign(b1,s,5.2,B1+1.8,'고속터미널',1.1,.3,true);}
  ticketBank(b1,29,5.7,B1);room(b1,62,5.7,B1,'역무실 · 고객안내');
  hanging(b1,101,B1,'파미에스테이션  ↑    3번 출구',9);
  // Photos 07/18: brick piers and stainless-clad piers at the retail link.
  for(const s of [84,101,119]){
    localBox(b1,s,-5.6,B1+.35,1.05,2.47,1.6,'station-brick',true);
    localBox(b1,s,-5.6,B1,1.14,.35,1.7,0xe2d6c2,true);
    detailRooms[0].jobs.push(()=>{
    localBox(b1,s,-5.04,B1+1.225,.035,.55,1.1,'glass');
    const directory=b1.at(s,-5.01);
    K.sign(['신세계백화점 ↑','경부선 터미널','반포천 공영주차장 →'],{x:directory.x,z:directory.z,y:B1+1.55,w:1.1,h:.5,rotY:directory.rot-Math.PI/2,bg:null,fg:'#5a4a3a',bold:false,offset:.025});
    for(const ds of [-.19,.19]){
      const p=b1.at(s+ds,-4.9);
      localBox(b1,s+ds,-4.9,B1,.27,.06,.27,0xbe302b);
      K.cyl({x:p.x,z:p.z,y:B1+.09,r:.1,h:.43,mat:0xc33f29,seg:12,solid:false});
      localBox(b1,s+ds,-4.9,B1+.52,.14,.055,.12,'metal');
      localSign(b1,s+ds,-4.78,B1+.3,'소화기',.12,.18,true,'#f0ead9','#a82822');
      const a=b1.at(s+ds+.09,-4.89),b=b1.at(s+ds+.14,-4.89);
      beam([a.x,B1+.52,a.z],[b.x,B1+.17,b.z],.018,0x252b2d,6);
    }
    localBox(b1,s+.6,-5.04,B1+.42,.025,.12,.08,0xf1eee6);
    const standS=s+1.35,standV=-4.9;
    localBox(b1,standS,standV,B1,.28,.06,.7,0x262b2c);
    localBox(b1,standS,standV,B1+.06,.06,1.39,.55,0xf4f4f0);
    for(const ds of [-.295,.295])localBox(b1,standS+ds,standV,B1+.06,.08,1.39,.04,0x252a2c);
    const center=b1.at(standS,standV+.035),normal=[center.nx,0,center.nz];
    let previous=null;
    for(let i=0;i<=12;i++){
      const t=Math.PI*i/12,p=b1.at(standS+.275*Math.cos(t),standV+.035),q=[p.x,B1+1.45+.275*Math.sin(t),p.z];
      if(previous){K.quad(0xf4f4f0,[[center.x,B1+1.45,center.z],previous,q,q],normal);beam(previous,q,.02,0x252a2c,6);}previous=q;
    }
    localSign(b1,standS,standV+.08,B1+.93,['신세계백화점','↑','파미에스테이션','→'],.49,1.15,true,'#f4f4f0','#33393b');
    });
  }
  for(const s of [33,49]){
    const p=b1.at(s,-5.7);
    K.cyl({x:p.x,z:p.z,y:B1,r:.45,h:2.82,mat:'metal',seg:8});
    K.cyl({x:p.x,z:p.z,y:B1,r:.47,h:.1,mat:0x8f9692,seg:8,solid:false});
    wayfinding(b1,s,B1,8);
  }
  for(const s of [10,180])bench(b1,s,-5.5,B1);
  bench(b1,94,4.3,B1); // keep the seat, clear photo 07's pier/fixture approach
  // Photo 07's brick hall has plain pale stone paving, not the marbled retail
  // passage of photo 18. Finish only this local bay, retaining its walkable slab.
  K.hpoly({tex:'station-granite',color:0xe1ddd3,gloss:.3},[b1.at(77,-7),b1.at(94,-7),b1.at(94,7),b1.at(77,7)].map(p=>[p.x,p.z]),B1+.032);
  detailRooms[0].jobs.push(()=>{
    for(const s of [79,90])localBox(b1,s,-6.86,B1,.06,2.82,5.5,'station-brick');
    // Existing shop wall becomes the observed dark JAJU shutter frontage.
    localBox(b1,88.5,-6.79,B1+.05,.09,2.38,2.6,0x3d4140);
    for(let yy=.2;yy<2.25;yy+=.08)localBox(b1,88.5,-6.72,B1+yy,.025,.018,2.5,0x6b706b);
    localSign(b1,88.5,-6.68,B1+2.5,'JAJU',2.5,.29,true,'#2b302d','#e1ded0');
    const p=b1.at(90.5,-5.9);
    K.cyl({x:p.x,z:p.z,y:B1,r:.36,h:.4,mat:0xc5c2b6,seg:12,solid:false});
    beam([p.x,B1+.35,p.z],[p.x,B1+1.36,p.z],.04,0x665543,6);
    for(let i=0;i<50;i++){
      const a=i*2.4,r=.15+(i%4)*.06,yy=B1+.65+(i%9)*.11,x=p.x+Math.sin(a)*r,z=p.z+Math.cos(a)*r;
      K.quad([0x334f39,0x53684b,0x6c7856][i%3],[[x-.12,yy,z],[x,yy+.16,z-.03],[x+.12,yy,z],[x,yy-.07,z+.03]],[0,0,1]);
    }
    // Visible underside of the adjacent staircase in 07; this shallow wall
    // backing adds no invented floor, shaft opening or usable stair route.
    const A=b1.at(85.5,-6.68),B=b1.at(88.1,-6.68),N=b1.at(86,-6.68);
    K.quad(0x5b5d59,[[A.x,B1+.25,A.z],[B.x,B1+2.83,B.z],[A.x,B1+2.83,A.z],[A.x,B1+.25,A.z]],[-N.nx,0,-N.nz]);
    beam([A.x,B1+.25,A.z],[B.x,B1+2.83,B.z],.08,0x252c2e,6);
    for(const s of [80,86,92])for(const v of [-3,3]){
      const p=b1.at(s,v);K.cyl({x:p.x,z:p.z,y:B1+2.78,r:.1,h:.025,mat:paint(0xffedca),seg:12,solid:false});
    }
    // Photo 18: cream ceiling, circular cassette diffusers and inset lit shop
    // panels around the retained octagonal stainless columns.
    const ceil=[b1.at(26,-7),b1.at(54,-7),b1.at(54,7),b1.at(26,7)].map(p=>[p.x,p.z]);
    K.hpoly(0xd8d4c8,ceil,B1+2.82,false);
    for(const s of [28,35.2,42.4,49.6])for(const v of [-3.2,3.2]){
      const p=b1.at(s,v);K.cyl({x:p.x,z:p.z,y:B1+2.765,r:.11,h:.026,mat:paint(0xffedcc),seg:12,solid:false});
      for(const dv of [-1.2,1.2])localBox(b1,s,v+dv,B1+2.76,.035,.04,2.9,0x777b70);
      for(const ds of [-1.45,1.45])localBox(b1,s+ds,v,B1+2.76,2.4,.04,.035,0x777b70);
    }
    for(const s of [38,44]){
      localBox(b1,s,6.7,B1+.25,.035,1.75,2.5,0x20496c);
      localSign(b1,s,6.65,B1+1.37,['할인','80%'],2.1,.75,true,'#245d8c','#d4d8b3');
    }
  });
  for(let i=0;i<20;i++){const p=b1.at(8+i*11,(i%3-1)*2.2);person(p.x,B1,p.z,{shirt:[0x313e50,0xb3936d,0x575c46][i%3]});}

  const j=JUNCTIONS.find(j=>j.id==='J7');
  const jhall=hall([[-45,186],j.pa,[j.pb[0],j.pb[1]+.5]],j.width,B1,{label:'파미에스테이션  ↑',jointFinish:true,openings:[{x:-45,z:191,w:10}]});
  // Floor continues to pb; the neighbour owns its rotunda wall opening.
  sign('파미에스테이션 · 센트럴시티',-45,B1+2.4,200,7.7,.5,Math.PI,'#373b32');

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
    // Exit 3 joins through the open hall end; a side cut at its stair landing
    // exposed a strip beyond the shaft wall when looking east from B1.
    hall([bot,target],6,B1,{label:'7호선 타는 곳 ↓',openings:[...(number==='3'?[]:[{x:bot[0],z:bot[1],w:6.2,full:true}]),{x:target[0],z:target[1],w:6.2}]});
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
    for(let k=0;k<3;k++){const p=P(-.6,k*1.45-1.45);box({x:p[0],z:p[1],y:3.2,w:1.4,h:.13,d:.25,rotY:rot,mat:paint([0xef7c1c,0x747f00,0xbdb092][k])});}
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
      const pedestrian=P(-5,-2.8);person(pedestrian[0],.025,pedestrian[1],{shirt:0x657b8c});
    }
    if(number==='3'){
      const p=P(-5,4.85);K.cyl({x:p[0],y:0,z:p[1],r:.065,h:3.8,mat:0x4f5e65,seg:8});
      box({x:p[0],y:2.95,z:p[1],w:.31,h:.65,d:.22,rotY:rot,mat:0x263238});
      sign('보행 신호',p[0]-ux*.15,3.32,p[1]-uz*.15,.3,.12,rot+Math.PI,'#172532');
      sign('●',p[0]-ux*.15,3.12,p[1]-uz*.15,.21,.21,rot+Math.PI,'#172532','#ed6554');
    }
    K.zone({name:'고속터미널역 '+number+'번 출구',floor:'1F',sub:dest,poly:roof.poly(-5,5),y0:-.1,y1:4,priority:5});
  }
  exitSpecs.forEach(exit);

  // Real Line 7 curve, sampled from the two OSM track ways.
  const l7=frame([[49,130],[34.86,135.7],[4.24,146],[-22.5,160],[-40.4,172.4],[-73.2,198.1],[-112,238],[-133,264]]);
  const l3=frame([[-90,-225],[-90,-25]]);
  const l9=frame([[42,-142],[-71.16,-99],[-171.42,-61.66]]);

  // Train bodies sit beyond continuous platform screen doors. Car lengths are
  // full size; curved Line 7 cars each take the local tangent of the real track.
  function train(f,y,line,cars,side) {
    const q=f.at(f.length/2);if(later(q.x,y,q.z,()=>train(f,y,line,cars,side)))return;
    const carLen=19.2,gap=.55,total=cars*(carLen+gap),start=(f.length-total)/2;
    for(let c=0;c<cars;c++) {
      const s=start+c*(carLen+gap)+carLen/2,base=f.at(s,side*2.7),rot=base.rot;
      const at=(ls,v)=>({x:base.x+base.ux*ls+base.nx*v,z:base.z+base.uz*ls+base.nz*v});
      const cb=(ls,v,yy,w,h,d,mat)=>box({...at(ls,v),y:yy,w,h,d,rotY:rot,mat});
      cb(0,0,y-.6,2.85,3.7,carLen,{color:0xd2d5d2,gloss:.3});
      cb(0,0,y+2.95,2.6,.22,carLen-.25,0xd7dbd9);
      cb(0,0,y+.43,2.91,.36,carLen-.2,C[line]);
      cb(0,0,y-.85,2.45,.35,carLen-.6,0x303b42);
      for(const v of [-1.44,1.44]) {
        for(let door=0;door<4;door++) {
          const ls=-7.1+door*4.7;
          // Two separate leaves, inset windows and the blue waist stripe are
          // visible through photo 12's glass; an orange rectangle hid them.
          for(const leaf of [-1,1]){
            cb(ls+leaf*.325,v,y+.08,.04,2.3,.635,{color:line===3?0xc77929:0xdce1e1,gloss:.5});
            cb(ls+leaf*.325,v*1.009,y+.84,.045,1.13,.49,'metal');
            cb(ls+leaf*.325,v*1.023,y+.88,.045,1.05,.405,{color:0x203332,gloss:.3});
            cb(ls+leaf*.325,v*1.039,y+1.84,.014,.055,.36,paint(0xbacbc0));
            cb(ls+leaf*.325,v*1.024,y+.08,.05,.39,.635,'metal');
          }
          if(line===3)cb(ls,v*1.028,y+.54,.05,.07,1.29,0x383978);
          cb(ls,v*1.035,y+.15,.055,2.12,.024,0x5e696a);
          cb(ls,v*1.02,y+2.44,.035,.13,1.3,paint(line===9?0xe7c268:0xdde8cf));
        }
        for(const ls of [-8.7,-4.75,0,4.7,8.8]){
          cb(ls,v,y+.92,.045,1.23,1.96,'metal');
          cb(ls,v*1.02,y+.96,.045,1.15,1.87,{color:0x243c3c,gloss:.3});
        }
        if(line===3&&c===3){
          const p=at(-8.25,v*1.04);
          sign('3697',p.x,y+2.32,p.z,.7,.25,rot+(v<0?Math.PI/2:-Math.PI/2),'#d2d5d2','#263139');
        }
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
    const width=opts.width||14.8,edge=5.1,roofH=line===9?4.85:3.18;
    const platformCeiling=line===9?3.28:roofH;
    const openings=opts.openings||[];
    // B1-x/2 crosses the B4 roof near x=20.3. Start at 20 so the slab never
    // intersects passengers before the lower landing; x=22 was too late.
    const shaftRoofHole=[20,-136.2,36,-127.8];
    const roofHoles=[...(opts.roofHoles||[]),...(line===9?[shaftRoofHole]:[])];
    const directionBg=line===9?'#d8d2c4':'#2f3336',directionFg=line===9?'#3d3f8f':'#ffffff';
    const clearOfDoors=(s,v,pad=2)=>{
      const p=f.at(s,v);
      return openings.every(o=>Math.hypot(p.x-o.x,p.z-o.z)>o.w/2+pad);
    };
    ceilingServices(f,width*2,y,platformCeiling,roofHoles);
    for(const side of [-1,1]){
      cutSlab(f.poly(side<0?-width:edge,side<0?-edge:width),y,opts.holes||[]);
      lineWall(f,side*width,y,roofH,openings,'station-ceramic');
      // Texture and colour band make the long spaces readable at walking scale.
      for(let s=1.3;s<f.length-1.3;s+=2.55) {
        if(line===9&&s<30)continue;
        strip(f,s,side*5.7,y+.015,.6,2.55,'station-tactile');
        // One glass leaf rather than a six-face box: overlapping transparent
        // faces used to wash the real carriage geometry into a blue wall.
        const ga=f.at(s-1.25,side*5.13),gb=f.at(s+1.25,side*5.13);
        K.wall(ga.x,ga.z,gb.x,gb.z,y,y+2.7,{thick:.025,mat:{tex:'glass',color:0xd7e1d9}});
        for(const ds of [-1.25,1.25])localBox(f,s+ds,side*5.13,y,.075,2.72,.09,{color:line===9?0x3a5478:0x687879,gloss:.3});
        localBox(f,s,side*5.13,y,.045,2.72,.032,line===9?0x3a5478:0x38474a);
        localBox(f,s,side*5.13,y+.04,.15,.19,2.5,0x596a73);
        localBox(f,s,side*5.13,y+2.7,.18,.23,2.5,line===3?0xf2f2ee:0x4f626b);
        if(line===3){
          // Photo 12 is Line 3: white station-name fascia over orange doors.
          localBox(f,s,side*5.13,y+2.92,.2,.26,2.5,0xf2f2ee);
          localBox(f,s,side*5.14,y+2.92,.22,.06,2.5,C[3]);
          if(Math.floor(s/2.55)%2===0){
            const q=f.at(s,side*5.26);
            sign('잠원  ←  고속터미널  →  교대',q.x,y+3.075,q.z,2.38,.16,f.at(s).rot+side*Math.PI/2,'#f2f2ee','#2f3336');
            sign('열차 접근',q.x,y+2.79,q.z,.85,.14,f.at(s).rot+side*Math.PI/2,'#202426','#e34339');
          }
        }else localBox(f,s,side*5.13,y+2.92,.2,.13,2.5,line===9?0x242b43:C[line]);
        localBox(f,s,side*5.15,y+(line===9?.92:1.08),.13,line===9?.32:.06,2.55,line===9?0x8a8d95:0xd9dfd9);
        const p=f.at(s,side*5.25);
        if(Math.round(s/2.55)%3===0)sign('발빠짐 주의',p.x,y+.35,p.z,1.7,.2,f.at(s).rot+Math.PI/2,'#efc551','#2f302a');
      }
      for(let s=3.1;s<f.length-3;s+=6.2)for(const row of [8.5,12]){
        if(!insideVoid(f,s,side*row,roofHoles,3.1))light(f,s,side*row,y+(line===9&&s<32?roofH:platformCeiling)-.15,line===9&&s>=32?2.4:6);
      }
      for(let s=8;s<f.length-5;s+=12.5){
        if(line!==9&&!(line===3&&side===-1&&s>120&&s<140)&&!insideVoid(f,s,side*11.6,opts.roofHoles||[],2)){
          // The 2026 walk shows square diagonal stone piers as well as the
          // older ceramic route-sash columns. Keep both, in separate bays.
          if(line===3&&s>=83&&s<=121)localBox(f,s,side*11.6,y,1.05,3.09,1.05,'station-stone-diagonal',true);
          else column(f,s,side*11.6,y,line,3.09);
        }
      }
      for(let s=14;s<f.length-6;s+=31){
        const p=f.at(s,side*(width-.15));
        if(clearOfDoors(s,side*(width-.15),4))sign([`${{3:'339',7:'734',9:'923'}[line]}   고속터미널`,({3:'잠원  ←   3호선   →  교대',7:'반포  ←   7호선   →  내방',9:'신반포  ←   9호선   →  사평'})[line]],p.x,y+2.08,p.z,7,1.05,f.at(s).rot+Math.PI/2,line===9?directionBg:CSS[line],directionFg);
        // The arrival display in _207 must not be covered by a nearer banner.
        const directionS=line===9&&side===1&&s===45?s+13:s+6;
        localSign(f,directionS,side*9,y+(line===9?2.85:2.65),line+'호선  '+(side<0?({3:'잠원 방면',7:'반포 방면',9:'사평 방면'})[line]:({3:'교대 방면',7:'내방 방면',9:'신반포 방면'})[line]),line===9?3.2:5,.34,false,directionBg,directionFg);
        // _24 shows safety equipment here; retain the bench at the _16 oval bay.
        const benchS=line===3&&side===1&&Math.abs(s+5-112)<1?s+19:s+5;
        if(clearOfDoors(benchS,side*(width-1.1))&&(line!==7||[75,175].every(c=>Math.abs(benchS-c)>10)))bench(f,benchS,side*(width-1.1),y);
      }
      for(let s=20;s<f.length-10;s+=43){
        const p=f.at(s,side*(line===9?12.6:8.7));person(p.x,y,p.z,{shirt:side<0?0x405775:0xb39c7b});
        const q=f.at(s+3.2,side*(line===9?11.6:10.3));person(q.x,y,q.z,{shirt:0x363942});
        if(clearOfDoors(s+11,side*(width-1),3)&&(line!==7||[75,175].every(c=>Math.abs(s+11-c)>10)))facilities(f,s+11,side*(width-1),y);
      }
      if(line===3){
        // Photo 15: touching diamond corners plus inset dark tile intersections.
        for(let s=2;s<f.length-2;s+=1.07){
          const p=f.at(s,side*9.4);
          box({x:p.x,z:p.z,y:y+.025,w:.76,h:.013,d:.76,rotY:p.rot+Math.PI/4,mat:{color:0x414849,gloss:.5}});
          strip(f,s,side*6.25,y+.028,.065,1.07,0x4a9b71);
        }
        for(let s=2.4;s<f.length-2;s+=2.4)for(let v=7.2;v<=14;v+=2.4){
          if(insideVoid(f,s,side*v,opts.roofHoles||[],.4))continue;
          const p=f.at(s,side*v);
          box({x:p.x,z:p.z,y:y+.026,w:.45,h:.012,d:.45,rotY:p.rot+Math.PI/4,mat:{color:0x2f3336,gloss:.5}});
        }
      }
      for(let s=line===9?39:9;s<f.length-6;s+=9){
        if(clearOfDoors(s,side*7.2,4)&&!insideVoid(f,s,side*7.2,roofHoles,3))adPier(f,s,side*7.2,y,line);
      }
      for(let s=12;s<f.length-5;s+=9.2){
        // The station oval and TV occupy the west-wall bay at z=-138.
        // Move its campaign panel to the clear adjacent bay, never over the oval.
        const adS=line===3&&side===1?(Math.abs(s-85.6)<.2?80.8:Math.abs(s-113.2)<.2?131:s):s;
        if(clearOfDoors(adS,side*(width-.2),3))adPanel(f,adS,side*(width-.2),y,{wide:true,face:side,theme:Math.round(s/9.2)});
      }
      train(f,y,line,line===3?10:line===7?8:6,side);
      const platformLife=()=>{
        const start=line===9?38:12;
        for(let s=start,i=0;s<f.length-6;s+=line===9?5.1:10.2,i++){
          if(!clearOfDoors(s,side*7.1,3)||insideVoid(f,s,side*8,roofHoles,3))continue;
          const p=f.at(s,side*6.28),number=Math.min(line===3?10:line===7?8:6,1+Math.floor(s/f.length*(line===3?10:line===7?8:6)));
          K.floorText(`${number} - ${i%4+1}`,{x:p.x,y:y+.055,z:p.z,w:.64,h:.36,rotY:p.rot+side*Math.PI/2,bg:'#327b69',fg:'#ffffff'});
          for(const ds of [-.66,.66]){
            const q=f.at(s+ds,side*6.7);
            K.floorText('↑',{x:q.x,y:y+.055,z:q.z,w:.28,h:.42,rotY:p.rot+side*Math.PI/2,fg:'#f2e7a5'});
          }
          for(let j=0;j<(i%3===0?3:2);j++){
            const q=f.at(s+(j%2?-.68:.68),side*(6.9+Math.floor(j/2)*.85));
            person(q.x,y,q.z,{rotY:p.rot+side*Math.PI/2,shirt:[0xe0d9c8,0x303b49,0x697064,0xa38a73][(i+j)%4]});
            if(j===0&&i%3===0)localBox(f,s+.68,side*7.28,y,.3,.48,.21,0x343b3d);
          }
          if(line===9){
            localBox(f,s,side*5.14,y+2.68,.2,.5,3.4,0x29343e);
            const q=f.at(s,side*5.27);
            sign(i%2?'급행  중앙보훈병원':'일반  개화',q.x,y+2.95,q.z,2.8,.22,p.rot+side*Math.PI/2,'#1c2024','#ff6954');
            if(i%2===0)localBox(f,s+3.2,side*10,y+.023,9.3,.012,.18,{color:0x343a3e,gloss:.5});
          }
        }
        for(let s=line===9?54:42;s<f.length-10;s+=line===9?38.4:64){
          const p=f.at(s,side*9.5);
          for(const v of [side*9.5-1,side*9.5+1])localBox(f,s,v,y+2.94,.025,platformCeiling-3.03,.025,'metal');
          const observed=line===9&&side===1&&s===54;
          if(observed){
            localBox(f,s,side*9.5,y+2.02,4.5,1.02,.13,0x172227);
            const a=f.at(s,side*9.5-1.0),b=f.at(s,side*9.5+1.32);
            sign(['개화 행','일반열차 (9103)가'],a.x,y+2.75,a.z,2.35,.4,p.rot,'#111719','#ffbb3e');
            sign('전역을 출발하였습니다',a.x,y+2.35,a.z,2.35,.27,p.rot,'#111719','#67d15d');
            sign(['일반  개화  출발','급행  중앙보훈병원','일반  중앙보훈병원'],b.x,y+2.53,b.z,1.65,.66,p.rot,'#111719','#e3e8e4');
          }else sign(line===9?['이번 열차  급행','중앙보훈병원  곧 도착']:['열차 도착 안내','안전선 안쪽에서 기다려 주세요'],p.x,y+2.68,p.z,line===9?2.6:3.7,.48,p.rot,'#141c20','#ffc45a');
        }
      };
      const q=f.at(f.length/2);later(q.x,y,q.z,platformLife);
    }
    if(line===9){
      localSlab(f,-8,31,-width,width,y);
      localBox(f,31,0,y,10.1,1.1,.22,0x6b7a7d,true);
      // The raised hanging panel at s=24 directs both branches; a second
      // identical panel on this barrier would overlap it in the approach view.
    }
    // Track beds, sleepers, running rails and a restrained central cable trough.
    K.slab(f.poly(-5.05,5.05),y-1.2,{mat:0x353e43,under:0x34393d});
    for(let s=.4;s<f.length;s+=.72){localBox(f,s,0,y-1.1,8.8,.14,.22,0x737c7c);}
    for(const v of [-3.45,-1.95,1.95,3.45])for(let i=0;i<f.points.length-1;i++){
      const a=f.at(f.lengths[i],v),b=f.at(f.lengths[i+1]-.005,v);
      beam([a.x,y-.9,a.z],[b.x,y-.9,b.z],.065,0x9eaaac,6);
    }
    // Photos 12 (Line 3)/14: flat white panel ceilings; the curved ceiling is
    // limited to the branching transfer hall (13), never a 12 m station vault.
    cutSlab(f.poly(-width,width),y+roofH,roofHoles,{mat:'concrete',under:'station-grid',thick:.08,walk:false});
    if(line===9){
      // Shallow segmented white cove, 4.0 m at its edge / 4.75 m at its crown.
      // Keep the W9 incline open; the shaft has its own sloping enclosure.
      for(let s=-7;s<30;s+=2.4)for(let j=0;j<16;j++){
        const a=j/16*Math.PI,b=(j+1)/16*Math.PI;
        const P=(ss,t)=>{const p=f.at(ss,Math.cos(t)*(width-1));return [p.x,y+3.95+Math.sin(t)*.8,p.z];};
        const pts=[P(s,a),P(Math.min(s+2.4,30),a),P(Math.min(s+2.4,30),b),P(s,b)];
        if(pts.some(p=>p[0]>shaftRoofHole[0]&&p[0]<shaftRoofHole[2]&&p[2]>shaftRoofHole[1]&&p[2]<shaftRoofHole[3]))continue;
        const m=f.at(s),t=(a+b)/2;
        K.quad(j%2?0xe6e7e2:0xf1f1ec,pts,[-Math.cos(t)*m.nx,-Math.sin(t),-Math.cos(t)*m.nz]);
      }
      detailRooms[7].jobs.push(()=>{for(const v of [-12,12]){
        localBox(f,12,v,y+3.85,.75,.4,35,'station-ribbed');
        light(f,12,v,y+3.8,34);
        // These cove-edge lights are below the grid: visible metal hangers
        // connect the duct trough to the roof rather than leaving it floating.
        for(const s of [-3,27])localBox(f,s,v,y+4.2,.03,roofH-.08-4.2,.03,'metal');
      }});
      tactile(f,-6,28,1.8,y);tactile(f,-6,28,2.55,y);
      localBox(f,27,1.8,y+.024,22,.02,.6,'station-tactile');
      // A folded stainless barrier stays against the side, with a broad aisle.
      detailRooms[7].jobs.push(()=>{for(let s=5;s<17;s+=1.1){
        const p=f.at(s,-11.8),q=f.at(s+1.1,-11.8);
        beam([p.x,y+.18,p.z],[q.x,y+1.04,q.z],.025,0x9ba7a8,6);
        beam([p.x,y+1.04,p.z],[q.x,y+.18,q.z],.025,0x9ba7a8,6);
        localBox(f,s,-11.8,y,.035,1.12,.035,'metal');
      }});
      for(const v of [-8,8])column(f,23,v,y,9,3.9);
      hanging(f,24,y,'타는 곳  ←   일반 · 급행   →',10,4.5,9);
      detailRooms[7].jobs.push(()=>{
        // Photo 13's arch ribs sit on the closed cove, avoiding the W9 mouth.
        for(let s=-5;s<30;s+=3.6)for(let j=0;j<24;j++){
          const a=j/24*Math.PI,b=(j+1)/24*Math.PI;
          const A=f.at(s,Math.cos(a)*(width-1)),B=f.at(s,Math.cos(b)*(width-1));
          if([A,B].some(p=>p.x>19.5&&p.x<36.5&&p.z>-136.5&&p.z<-127.5))continue;
          beam([A.x,y+3.925+Math.sin(a)*.8,A.z],[B.x,y+3.925+Math.sin(b)*.8,B.z],.018,0x9fa7a5,6);
        }
        for(let s=5;s<18;s+=2.2){
          const p=f.at(s,-11.8);
          K.cyl({x:p.x,z:p.z,y:y+.02,r:.09,h:.055,mat:0x2c3336,seg:10,solid:false});
          localBox(f,s,-11.8,y+.06,.28,.04,.28,'metal');
        }
        for(let i=0;i<21;i++){
          const p=f.at(7+i*1.05,[-5.4,-2.3,4.8,7.1][i%4]);
          if(p.x>20&&p.x<36&&p.z>-138&&p.z<-126)continue;
          person(p.x,y,p.z,{shirt:[0xd4cec1,0x333941,0x56666e,0x6e7250][i%4]});
        }
        const p=f.at(19,0);
        sign(['일반 · 급행','개화  ←          →  중앙보훈병원'],p.x,y+3.4,p.z,9,.56,p.rot,'#d8d2c4','#58549a');
      });
      K.zone({name:'고속터미널역 9호선 환승홀',floor:'B4',sub:'긴 에스컬레이터 · 일반·급행 양방향 분기',poly:[f.at(-8,-width),f.at(31,-width),f.at(31,width),f.at(-8,width)].map(p=>[p.x,p.z]),y0:y,y1:y+4.8,priority:4});
    }
    // At either end a cross-platform bridge precedes the dark tunnel mouths.
    for(const s of [-4,f.length+4]){
      localSlab(f,s-4,s+4,-width,width,y);
      const end=s+(s<0?-4:4),a=f.at(end,-width),b=f.at(end,width);
      K.wall(a.x,a.z,b.x,b.z,y,y+roofH,{mat:'station-ceramic',thick:.2});
      for(const v of [-width,width]){const a=f.at(s-4,v),b=f.at(s+4,v);K.wall(a.x,a.z,b.x,b.z,y,y+roofH,{mat:'station-ceramic',thick:.2});}
      for(const side of [-1,1]){
        const p=f.at(s+ (s<0?-1:1)*4,side*2.7);
        localBox(f,s+(s<0?-1:1)*4.05,side*2.7,y-1.2,4.4,4.6,.18,0x131e25,true);
        sign('선로 출입금지',p.x,y+1.2,p.z,3.2,.5,f.at(s).rot,'#442b28');
      }
      const poly=[f.at(s-4,-width),f.at(s+4,-width),f.at(s+4,width),f.at(s-4,width)].map(p=>[p.x,p.z]);
      K.slab(poly,y+roofH,{walk:false,mat:'concrete',under:'station-grid',thick:.08});
      localSign(f,s,0,y+(line===9?2.75:2.5),'타는 곳  ←    →  반대편 타는 곳',11,.45,false,directionBg,directionFg);
    }
    K.zone({name:'고속터미널역 '+line+'호선 승강장',floor:{3:'B2',7:'B3',9:'B4'}[line],sub:({3:'339 · 잠원 ↔ 교대 · 10량',7:'734 · 반포 ↔ 내방 · 곡선 승강장',9:'923 · 신반포 ↔ 사평 · 일반·급행'})[line],poly:f.poly(-width,width),y0:y,y1:y+4.7,priority:3});
  }

  const lowerCoreStations=[75,175];
  const lowerCoreVoids=lowerCoreStations.map(s=>{
    const p=[l7.at(s-1.6,-1),l7.at(s+5.3,-1),l7.at(s+5.3,14),l7.at(s-1.6,14)].map(p=>[p.x,p.z]);
    return K.polyBBox(p);
  });
  const well3=WELLS.find(w=>w.id==='W3'),well9=WELLS.find(w=>w.id==='W9');
  const concourse3Voids=[[-103,-66.2,-94.6,-47.8],[-86,-64,-80,-47.8]];
  platform(l3,B2,3,{width:17,roofHoles:[well3.rect,...concourse3Voids],openings:[{x:-73,z:-50,w:18},{x:-73,z:-85,w:12}]});
  // st-01: opaque shaft upstands close the 1.82 m slot above the platform
  // roof. End walls stop at the upper floor, leaving its landing walkable.
  for(const r of concourse3Voids)K.polyWalls(rect(...r),B2+3.18,B1,{mat:'station-panels',inner:'station-panels',thick:.12});
  platform(l7,B3,7,{width:14.8,openings:[{x:-126,z:250,w:14},{x:20,z:145,w:18}],roofHoles:lowerCoreVoids});
  platform(l9,B4,9,{width:14.8,openings:[{x:32,z:-132,w:15},{x:-29,z:-100,w:11},{x:-76,z:-82,w:10},{x:-69,z:-85,w:10}]});

  // Line 7's actual B2 concourse sits over its tracks with two distributed cores.
  const b2Holes=lowerCoreVoids;
  const gate7=100;
  const concourse7=hall(l7.points,29.6,B2,{floor:'B2',name:'고속터미널역 7호선 대합실',sub:'734 · 승차권 발매 · 역무실 · 화장실 · 3·9호선 환승',label:'7호선 타는 곳  ↓     3·9호선 환승  →',mat:'station-granite',ads:true,tactile:false,gateStations:[gate7],holes:b2Holes,roofHoles:b1Voids,openings:[{x:20,z:157,w:16,full:true},{x:-122,z:245,w:16,full:true},{x:40,z:117.7,w:9,full:true},{x:41,z:150,w:16}]});
  for(const s of [0,concourse7.length]){
    const a=concourse7.at(s,-14.8),b=concourse7.at(s,14.8);
    K.wall(a.x,a.z,b.x,b.z,B2,B2+4.7,{mat:'station-ceramic'});
  }
  // The hotel's B2 reception/lockers overlap s40–90. Keep its furniture out of
  // the gate approach by moving the row beyond the hotel's western boundary.
  // Shared cores stay fixed; basement ownership is recorded in the research.
  gates(concourse7,gate7,B2,8);ticketBank(concourse7,119,12.8,B2);
  room(concourse7,103,12.4,B2,'역무실 · 고객안내');room(concourse7,148,12.4,B2,'화장실 · 수유실');
  for(let s=14;s<concourse7.length-12;s+=7.5)for(const v of [-11,11]){
    if(v>0&&s>24&&s<90)continue;
    if(!insideVoid(concourse7,s,v,[...b2Holes,...b1Voids],2)){
      if(s<30) {const p=concourse7.at(s,v);K.cyl({x:p.x,z:p.z,y:B2,r:.48,h:2.88,mat:'station-granite',seg:24});}
      else column(concourse7,s,v,B2,Math.abs(s-gate7)<13?0:7,2.88,Math.abs(s-gate7)<13);
    }
  }
  for(const [s0,s1,v] of [[20,50,9],[40,70,-9],[84,140,-9],[84,140,9]]){
    const ss=[s0,...concourse7.lengths.filter(s=>s>s0&&s<s1),s1];
    for(let i=0;i<ss.length-1;i++){
      const a=concourse7.at(ss[i],v),b=concourse7.at(ss[i+1],v);
      const door=v>0?119:96,doorW=v>0?7:6;
      const openings=door>ss[i]-doorW/2&&door<ss[i+1]+doorW/2?[{at:door-ss[i],w:doorW,y0:B2,y1:B2+2.9}]:[];
      K.wall(a.x,a.z,b.x,b.z,B2,B2+2.9,{mat:'station-ceramic',openings});
    }
    // New public-facing partitions carry the same close-set lightboxes as the
    // perimeter walls, with gaps at the dogleg, ticket bank and safety cabinets.
    for(let s=s0+2.6;s<s1-2;s+=s0===84?9.2:4.6){
      if(Math.abs(s-(v>0?119:96))<5||(v>0&&[110,132].some(q=>Math.abs(s-q)<3)))continue;
      const outsideAisle=s0===40,side=outsideAisle?1:Math.sign(v);
      adPanel(concourse7,s,v+(outsideAisle?-.17:-Math.sign(v)*.17),B2,{wide:true,face:side,theme:Math.floor(s/4.6)});
    }
  }
  for(const s of [91,107])for(const v of [-8.2,8.2])column(concourse7,s,v,B2,0,2.88,true);
  // st-08: steel columns define the photographed hall; retain the older
  // stone piers outside this row and the doorway clearance at s=119.
  for(const v of [-5.5,5.2])for(let s=104;s<=142.5;s+=5.5){
    if(v===5.2&&s>120.5)continue;
    if(insideVoid(concourse7,s,v,[...b2Holes,...b1Voids],.8))continue;
    const p=concourse7.at(s,v);
    K.cyl({x:p.x,z:p.z,y:B2,r:.45,h:2.88,mat:{tex:'station-brushed',color:0xc4c7ca,gloss:.8},seg:32});
    K.cyl({x:p.x,z:p.z,y:B2,r:.46,h:.1,mat:0x354249,seg:32,solid:false});
    if(v===5.2&&s===109.5)detailRooms[5].jobs.push(()=>{
      localBox(concourse7,s-.46,v,B2+1.1,.6,1.2,.025,'glass');
      localSign(concourse7,s-.49,v,B2+1.7,['환승 안내','③ · ⑨ →'],.53,.35,false,'#eef2ee','#334a59');
    });
  }
  K.hpoly('station-marble',[concourse7.at(99,-8.8),concourse7.at(135,-8.8),concourse7.at(135,8.8),concourse7.at(99,8.8)].map(p=>[p.x,p.z]),B2+.025);
  for(const [s,theme] of [[112,4],[119,0],[126,2]])adPanel(concourse7,s,8.65,B2,{portrait:true,led:true,theme,face:1});
  K.hpoly('station-diagonal',[concourse7.at(94,-8),concourse7.at(106,-8),concourse7.at(106,8),concourse7.at(94,8)].map(p=>[p.x,p.z]),B2+.022);
  tactile(concourse7,2,16,0,B2);
  localBox(concourse7,16,-5,B2+.025,10,.018,.6,'station-guide');
  tactile(concourse7,16,28,-10,B2);
  // Pass south of the fixed B1 stair core; its skirts block the original
  // straight B2 aisle. A narrow enclosed return stays outside the hotel wall.
  const bypassA=concourse7.at(28,-10),bypassB=concourse7.at(40,-10);
  hall([[bypassA.x,bypassA.z],[25,150],[25,163.4],[16.4,163.4],[16.4,154],[bypassB.x,bypassB.z]],2.4,B2,{floor:'B2',name:'고속터미널역 7호선 계단 옆 통로',label:'7호선 타는 곳  ↑',wallMat:'station-ceramic',openings:[{x:bypassA.x,z:bypassA.z,w:5,full:true},{x:bypassB.x,z:bypassB.z,w:5,full:true}]});
  tactile(concourse7,40,96,-10,B2);
  localBox(concourse7,96,-5,B2+.025,10,.018,.6,'station-guide');
  tactile(concourse7,96,concourse7.length-2,0,B2);
  localBox(concourse7,94,0,B2+.027,16,.018,.6,'station-tactile');
  facilities(concourse7,109,8.4,B2);vending(concourse7,132,8.4,B2);
  for(let s=14;s<concourse7.length-5;s+=30){
    if(Math.abs(s-gate7)<8||insideVoid(concourse7,s,0,b1Voids,2))continue;
    localSign(concourse7,s,s<90?-10:0,B2+2.35,'장암 행 · 당역 도착',1.6,.45,false,'#111111','#ffa531');
  }
  for(let i=0;i<16;i++){const p=concourse7.at(12+i*12,(i%2?1:-1)*5);person(p.x,B2,p.z);}

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
  K.hpoly('station-marble',rect(-83,-90,-74,-83.4),B2+.05);
  for(let c=0;c<10;c++)for(let r=0;r<7;r++)if((c+r)%2===0)
    box({x:-82.55+c*.9,z:-89.55+r*.9,y:B2+.052,w:.89,h:.009,d:.89,mat:{color:0x292d2d,gloss:.7}});
  // Marble jambs and exit-number panels at the shared W3 access, outside its
  // six-metre opening. The yellow 3 in photos 01/06 denotes EXIT 3.
  for(const x of [-84.25,-72.75]){
    box({x,z:-88.8,y:B2,w:2.5,h:3.18,d:.7,mat:'station-marble',solid:true});
    detailRooms[3].jobs.push(()=>{
    box({x:x-.25,y:B2+1.69,z:-88.36,w:1.14,h:1.04,d:.07,mat:{color:0x202627,gloss:.3}});
    K.sign('3',{x:x-.56,y:B2+2.34,z:-88.28,w:.43,h:.59,rotY:0,bg:'#e7c625',fg:'#252a2b',bold:false});
    K.sign('출구',{x:x-.56,y:B2+2.05,z:-88.27,w:.32,h:.11,bg:null,fg:'#252a2b',bold:false});
    K.sign(['경부선','호남선','신세계','파미에'],{x:x+.01,y:B2+2.22,z:-88.27,w:.48,h:.81,bg:null,fg:'#f4f2e7',bold:false});
    K.sign('←',{x:x-.55,y:B2+1.84,z:-88.27,w:.46,h:.19,bg:null,fg:'#ffffff',bold:false});
    box({x:x+.02,z:-88.32,y:B2+.43,w:.51,h:1.02,d:.075,mat:{tex:'metal',gloss:.7}});
    box({x:x+.64,z:-88.32,y:B2+.99,w:.3,h:.48,d:.065,mat:{tex:'metal',gloss:.5}});
    box({x:x+.63,z:-88.31,y:B2+2.13,w:.58,h:.67,d:.15,mat:{color:0xe6e6de,gloss:.3}});
    for(let i=0;i<5;i++)box({x:x+.64,z:-88.198,y:B2+.96+i*.034,w:.25,h:.012,d:.012,mat:0x6f7877});
    box({x:x+.56,z:-88.195,y:B2+.7,w:.04,h:.08,d:.015,mat:0x454f51});
    K.sign('전기',{x:x+.63,y:B2+2.27,z:-88.19,w:.22,h:.11,bg:null,fg:'#637170'});
    for(const xx of [x-.19,x+.64]){
      box({x:xx,y:B2+1.13,z:-88.269,w:.04,h:.16,d:.02,mat:0x58605f});
      for(let i=0;i<4;i++)box({x:xx+.11,y:B2+1.29+i*.028,z:-88.268,w:.16,h:.009,d:.01,mat:0x606963});
    }
    // Large stone panels, black plinth and fine vertical steel corner trims.
    for(const yy of [.75,1.5,2.25])box({x,y:B2+yy,z:-88.443,w:2.5,h:.005,d:.012,mat:0x999a92});
    for(const dx of [-1.21,-.61,0,.61,1.21])box({x:x+dx,y:B2,z:-88.438,w:.005,h:3.18,d:.014,mat:0x999a92});
    box({x,y:B2,z:-88.43,w:2.5,h:.08,d:.04,mat:{color:0x292d2b,gloss:.5}});
    });
  }
  detailRooms[3].jobs.push(()=>{
    box({x:-85.56,z:-89.5,y:B2+.94,w:.08,h:.5,d:.38,mat:0xa92a24});
    sign('소화전',-85.49,B2+1.21,-89.5,.34,.2,Math.PI/2,'#a92a24');
    sign('나가는 곳',-72.6,B2+2.84,-88.35,2.4,.36,0,'#f3c52d','#20292b');
  });
  box({x:-78.5,z:-88.8,y:B2+2.6,w:9,h:.58,d:.45,mat:'station-panels'});
  for(let x=-82.925,i=0;x<-74;x+=.15,i++)box({x,z:-88.56,y:B2+2.6,w:.15,h:.1,d:.025,mat:i%2?0x222222:0xf2c324});
  sign('호남선 · 경부선 · 영동선 · 사평로  ↑',-78.5,B2+2.94,-88.53,8.5,.3,0,'#f2f2ee','#2f3336');
  // Photo 01: the visible glass-block return is RIGHT of the east sign pier.
  // Retain the west strip as well; bevel highlights make the individual glass
  // blocks readable without an invented glowing wall behind them.
  detailRooms[3].jobs.push(()=>{
    for(const start of [-85.3,-71.38])for(let r=0;r<13;r++)for(let c=0;c<5;c++){
      const x=start+c*.2,yy=B2+.1+r*.2;
      box({x,y:yy,z:-88.42,w:.188,h:.188,d:.1,mat:'glass'});
      box({x,y:yy,z:-88.351,w:.2,h:.012,d:.023,mat:0xc5cfca});
      box({x:x-.094,y:yy,z:-88.349,w:.012,h:.2,d:.023,mat:0xc5cfca});
      box({x,y:yy+.027,z:-88.338,w:.132,h:.012,d:.012,mat:0xdbe3dd});
      box({x:x+.062,y:yy+.025,z:-88.338,w:.009,h:.13,d:.012,mat:0xc1d1cd});
    }
    for(const x of [-82.5,-75.85]){
      box({x,y:B2,z:-89.2,w:.22,h:1.04,d:.32,mat:{tex:'metal',gloss:.5}});
      box({x,y:B2+1.04,z:-89.2,w:.22,h:.055,d:.3,mat:0x314950});
      box({x,y:B2+.73,z:-89.025,w:.11,h:.08,d:.02,mat:paint(0x78b555)});
    }
    // Adjacent wall carries the rose stone band, fire call box and notices.
    box({x:-71.92,y:B2+.84,z:-86.9,w:.055,h:.18,d:2.7,mat:{color:0xb09682,gloss:.5}});
    box({x:-71.9,y:B2+1.05,z:-86.8,w:.08,h:.45,d:.24,mat:{color:0xad302a,gloss:.3}});
    for(const z of [-87.7,-86.05])sign(['고속터미널역','안전 이용 안내'], -71.86,B2+1.87,z,.62,.89,-Math.PI/2,'#efeee5','#315361');
  });
  if(!mallHere)sign('3  고속터미널  |  타는 곳 ↓',-79,B1+2.75,-104.7,5.8,.65,0,CSS[3]);
  K.slab(rect(-5,-138,0,-126),B1,{mat:'station-granite'});
  K.hpoly('station-granite',rect(-5,-138,0,-126),B1+.02);
  K.stairs(0,-129.3,30,-129.3,{ya:B1,yb:B4,w:1.8,mat:'darkstone'});
  down(0,-134.4,30,-134.4,B1,B4,1.4);up(0,-132.3,30,-132.3,B1,B4,1.4);
  K.slab(rect(30,-138,40,-124),B4,{mat:'station-granite'});
  // Close the flat lower landing after the inclined enclosure ends at x=30.
  K.slab(rect(30,-138,40,-124),B4+4.6,{mat:'concrete',under:'station-grid',thick:.08,walk:false});
  sign('⑨  고속터미널  |  타는 곳 ↓',-1.1,B1+2.75,-132,7.3,.65,-Math.PI/2,'#d8d2c4','#3d3f8f');
  // Inclined walls/ceiling around the long W9 well, rather than an opaque lid.
  for(const z of [-136.2,-127.8]){
    K.quad('station-ceramic',[[0,B1,z],[30,B4,z],[30,B4+4.6,z],[0,B1+4.6,z]],[0,0,z<-132?1:-1]);
  }
  K.quad('ceiling',[[0,B1+4.6,-136.2],[30,B4+4.6,-136.2],[30,B4+4.6,-127.8],[0,B1+4.6,-127.8]],[0,-1,0]);
  // The shaft floor is also the enclosed sloping soffit seen from the B4 hall.
  K.quad('station-grid',[[0,B1,-136.2],[30,B4,-136.2],[30,B4,-127.8],[0,B1,-127.8]],[-.5,-1,0],[[0,0],[25,0],[25,7],[0,7]]);
  detailRooms[8].jobs.push(()=>{
    for(let i=1.5;i<30;i+=2.4){
      const yy=B1-i/2;
      for(const z of [-135.8,-128.2]){
        box({x:i,y:yy+.8,z,w:.04,h:2.3,d:.035,mat:'metal'});
        box({x:i,y:yy+2.3,z,w:.25,h:.08,d:.035,mat:paint(0xf6f3dc)});
      }
      box({x:i,y:yy+4.47,z:-132,w:.05,h:.04,d:8.3,mat:0x9fa6a3});
      if(Math.round(i/2.4)%2===0)box({x:i,y:yy+3.8,z:-132,w:.3,h:.1,d:6.8,mat:paint(0xf8efdb)});
    }
    for(const x of [1,29])for(const z of [-134.4,-132.3,-129.3]){
      box({x,y:(x<2?B1:B4)+.02,z,w:.62,h:.018,d:1.1,mat:'station-tactile'});
    }
  });

  // Mall-side B1 galleries end at the wells; their small footprint avoids
  // duplicating the neighbouring module's entire shopping mall slab.
  // When 고투몰 (built earlier in PLACES order) already owns this B1 floor, its own fare-gate halls
  // stand here, so the station adds no walls/ceilings of its own inside the mall.
  if(!mallHere){
    // Standalone station view: photos 01–06/08–09. In the whole world the
    // surrounding B1 floors, shop fronts and gates remain gotomall's scope.
    const central=hall([[-88,-113],[-65,-113]],16,B1,{floor:'B1',name:'고속터미널역 중앙 대합실',sub:'3호선 개찰구 · 아트박스 · 네이처리퍼블릭 · 고투몰',label:'나가는 곳  ↑   3 · 7 · 9호선',mat:'station-marble',wallMat:'station-marble',gatePoints:[{x:-79,z:-106.4}],openings:[{x:-79,z:-105,w:8},{x:-70,z:-105,w:8}]});
    // Place storefronts against the northern wall, immediately beside gates.
    const retail=frame([[-65,-113],[-88,-113]]);
    storefront(retail,3,5.8,B1,'아트박스','stock');
    storefront(retail,9,5.8,B1,'네이처리퍼블릭','stock');
    storefront(retail,15,5.8,B1,'ENTER6','plant');
    for(const s of [4,12,20])ceilingVent(central,s,-1,B1);
    const gateFrame=frame([[-79,-110],[-79,-104]]);
    gates(gateFrame,3.6,B1,7,3);
    for(const x of [-85.4,-72.4]){
      box({x,y:B1,z:-108,w:.78,h:2.82,d:.78,mat:'station-marble',solid:true});
      sign(['3번 출구','경부선 · 호남선','신세계 · 파미에'],x,B1+1.72,-107.58,.73,1.05,0,'#3b4041','#f4d04c');
    }
    // The photographed violet screen is beyond the gate, beside the descent.
    sign(['통증을 피하는','유형별 반응'], -84.4,B1+1.53,-105.7,4.5,2.38,0,'#7951ce');
    detailRooms[1].jobs.push(()=>{
      // Near-camera planted pier makes the gate/shop adjacency visible in 02.
      const planted=frame([[-73.9,-111],[-73.9,-105]]);
      for(let i=0;i<120;i++){
        const p=planted.at(.5+(i%12)*.18,.02+Math.sin(i)*.06);
        box({x:p.x,y:B1+.1+Math.floor(i/12)*.25,z:p.z,w:.12,h:.2,d:.15,mat:[0x345b32,0x567342,0x70864b][i%3]});
      }
      sign('ENTER6',-74.02,B1+1.77,-109.4,1,.35,-Math.PI/2,'#443d29','#f1e8ce');
      wayfinding(gateFrame,1.7,B1,7.8);
      for(let i=0;i<8;i++)person(-86.5+i*1.5,B1,-116+(i%3)*1.1,{shirt:[0x373a43,0xbeb5a5,0x6e7879][i%3]});
    });
    for(let i=0;i<6;i++)person(-87+i*3.4,B1,-112.1+(i%2)*2,{shirt:[0x282c31,0x7c7066,0xc4b6a4][i%3]});
    hall([[-65,-113],[-5,-113],[-5,-132]],5,B1,{floor:'B1',name:'고속터미널역 3·9호선 연결부',sub:'고투몰 · 1·8·8-1·8-2번 출구',label:'1·8·8-1·8-2 출구 → 고투몰',jointFinish:true,ads:true,openings:[{x:-5,z:-132,w:8},{x:-5,z:-121,w:8}]});
    const upper9=hall([[-7,-132],[34,-132]],24,B1,{floor:'B1',name:'고속터미널역 9호선 상층 대합실',sub:'1·8번 출구 · 타원 중층 가장자리 · 긴 에스컬레이터',label:'나가는 곳  ←  8 · 8-1 · 8-2',line:9,mat:'station-granite',h:4.9,holes:[well9.rect],noRoof:true,openings:[{x:-5,z:-120,w:8},{x:34,z:-120,w:7}]});
    for(const [s,v] of [[5,8],[20,9],[34,8],[10,-9],[33,-9]]){
      column(upper9,s,v,B1,0,2.82);localSign(upper9,s,v-.42,B1+1.8,'1 · 8 출구',.7,.45,true,'#e3ba33');
    }
    vending(upper9,35,10.7,B1);
    tactile(upper9,0,39,8,B1);
    localBox(upper9,6,3,B1+.025,10,.02,.6,'station-tactile');
    adPier(upper9,26,9.2,B1,9);
    const farGate=frame([[17,-144],[17,-139]]);
    gates(farGate,2.3,B1,7,9);
    // Service frontage beside the vending bank: a real doorway and wall bays.
    K.wall(24,-120.15,33,-120.15,B1,B1+2.9,{mat:'station-panels',openings:[{at:7,w:1.35,y0:B1,y1:B1+2.2}]});
    detailRooms[2].jobs.push(()=>{
      for(const x of [3,12,21,30]){
        box({x,y:B1+.026,z:-124.8,w:.22,h:.012,d:6.5,mat:0x363c3e});
        person(x+.8,B1,-123.1,{shirt:[0x45525d,0xd0c9b9,0x4c5053][Math.abs(x)%3]});
      }
      box({x:25,y:B1,z:-120.75,w:.88,h:.7,d:.48,mat:0xdba92e});
      box({x:25,y:B1+.7,z:-120.75,w:.9,h:.08,d:.5,mat:0xf2be34});
      box({x:25,y:B1+.72,z:-120.82,w:.53,h:.06,d:.17,mat:0x343d3e});
      sign('화장실',31,B1+2.35,-120.28,1.5,.28,Math.PI,'#303b43');
      for(const x of [6,14,22,30]){
        box({x,y:B1+.35,z:-143.78,w:7.9,h:.5,d:.03,mat:'station-granite'});
        box({x,y:B1+.85,z:-143.75,w:7.9,h:.025,d:.035,mat:0x616b6c});
      }
      sign('← 8  신세계백화점     나가는 곳  8·8-1·8-2 →',10,B1+2.4,-123.3,6.2,.43,0,'#303844','#f4cf4a');
    });
  }
  // The oval balcony is station territory even above the shared mall floor.
  ovalMezzanine(14,-132,B1);
  K.zone({name:'고속터미널역 9호선 타원 대합실',floor:'B1',sub:'타원 중층 가장자리 · 9호선 타는 곳',rect:[-7,-144,34,-120],y0:B1,y1:B1+4.9,priority:5});
  K.spawn({name:'B1 · 9호선 타원 대합실',x:10,y:B1,z:-125,yaw:0});
  sign('9호선 열차 안내  |  일반 · 급행',-26,B1+2.38,-113,7,.43,0,'#d8d2c4','#3d3f8f');

  // 3↔7: a continuous paid passage around the east side of the main complex.
  // Round 13 moves the east/west leg from z=-27 to -54, north of Shinsegae's
  // basement. Its 119 + 205 = 324 m centreline is a fitted model dimension,
  // not a claim to reproduce the cited 314 m walking-distance measurement.
  const transfer=hall([[-79,-54],[40,-54],[40,151]],7,B2,{floor:'B2',name:'고속터미널역 환승통로',sub:'3호선 대합실 · 7호선 하부 홀 · 9호선 별도 통로',label:'7호선 갈아타는 곳  ↑    3·9호선  ↓',mat:'station-granite',ads:true,openings:[{x:-79,z:-54,w:9},{x:-68,z:-54,w:11,full:true},{x:40,z:151,w:12}]});
  for(let s=7,i=0;s<transfer.length-4;s+=5,i++){const p=transfer.at(s,[1.2,2.1,.3][i%3]);person(p.x,B2,p.z,{shirt:[0x57554f,0xa0a8ad,0x3d526c,0xb19b87][i%4]});}
  // Two moving walks occupy one side, preserving a full pedestrian aisle.
  for(const ends of [[35,85],[157,212]]){
    const a=transfer.at(ends[0],-1.6),b=transfer.at(ends[1],-1.6);
    K.ramp(a.x,a.z,b.x,b.z,{ya:B2+.03,yb:B2+.03,w:1.4,mat:0x49555c,move:.65,rails:true});
    localSign(transfer,ends[0]-2,-1.6,B2+2.35,'무빙워크  ↑',2.5,.45);
  }
  // The audit records a Line 9 arrival board beside the moving walkway.
  // Its exact bay, casing and static display state are reconstruction guesses.
  // Face the 9-bound approach on the north/south run, parallel to Line 3.
  detailRooms[4].jobs.push(()=>{
    const s=148,p=transfer.at(s);
    for(const v of [-1.7,1.7])localBox(transfer,s,v,B2+2.7,.025,.12,.025,'metal');
    sign(['⑨  열차 도착 안내','일반  개화  곧 도착'],p.x,B2+2.35,p.z,4.2,.7,p.rot,'#141c20','#ffc45a');
  });
  // The entire 3↔9 flight is outside the south platform wall. Previously its
  // solid step skirts rose through the platform aisle at the B4 spawn.
  hall([[-76,-85],[-65,-85]],7,B2,{floor:'B2',name:'고속터미널역 3·9호선 환승통로',label:'9호선 환승  ↓',openings:[{x:-76,z:-85,w:9},{x:-65,z:-82,w:7,full:true}]});
  K.wall(-71,-81.5,-67,-81.5,B2,B2+4.2,{mat:'station-ceramic',openings:[{at:2,w:4,y0:B2,y1:B2+3.2}]});
  K.wall(-71,-88.5,-67,-88.5,B2,B2+4.2,{mat:'station-ceramic'});
  const t39top=rect(-67,-88.5,-63,-77.5);K.slab(t39top,B2,{mat:'station-granite'});
  K.slab(t39top,B2+4.2,{mat:'concrete',under:'ceiling',walk:false});
  // The moving-walk landing opens into this hall; its former solid return
  // hid the hall and looked like a three-metre corridor in frame _157.
  K.wall(-67,-88.5,-67,-85.5,B2,B2+4.2,{mat:'station-panels'});
  K.wall(-67,-88.5,-63,-88.5,B2,B2+4.2,{mat:'station-ceramic'});
  // Close the lips outside the 8m incline enclosure without narrowing its runs.
  K.wall(-63,-88.5,-63,-86,B2,B2+4.2,{mat:'station-ceramic'});
  K.wall(-63,-78,-63,-77.5,B2,B2+4.2,{mat:'station-ceramic'});
  // st-06: photographed shaft is a 30-degree pair. The existing emergency
  // stair stays accessible in a separate, opaque enclosure to its south.
  const flight9End=-63+10/Math.tan(Math.PI/6);
  K.stairs(-63,-79.5,-33,-79.5,{ya:B2,yb:B4,w:2.0,mat:'darkstone'});
  down(-63,-84.4,flight9End,-84.4,B2,B4,1.5);up(-63,-82.2,flight9End,-82.2,B2,B4,1.5);
  K.wall(-63,-80.95,-32,-80.95,B4,B2+3.9,{mat:'station-descent-stone',thick:.12});
  K.slab(rect(flight9End,-87,-25,-77),B4,{mat:'station-granite'});
  K.slab(rect(flight9End,-87,-34,-80.95),B4+4.5,{mat:'concrete',under:0xf2f2f0,walk:false});
  K.slab(rect(-34,-87,-25,-77),B4+4.5,{mat:'concrete',under:0xf2f2f0,walk:false});
  K.wall(-34,-77,-25,-77,B4,B4+4.5,{mat:'station-ceramic'});
  hall([[-29,-82],[-29,-103]],8,B4,{label:'9호선 타는 곳  ↑',line:9,openings:[{x:-33,z:-82,w:10,full:true},{x:-29,z:-100,w:12,full:true}]});
  for(const z of [-86,-81.02])K.quad({tex:'station-descent-stone',gloss:.5},[[-63,B2,z],[flight9End,B4,z],[flight9End,B4+3.9,z],[-63,B2+3.9,z]],[0,0,z<-82?1:-1],[[0,0],[14.43,0],[14.43,1.625],[0,1.625]]);
  K.quad(0xf2f2f0,[[-63,B2+3.9,-86],[flight9End,B4+3.9,-86],[flight9End,B4+3.9,-81],[ -63,B2+3.9,-81]],[0,-1,0]);
  // The old stair retains its own enclosed soffit.
  K.quad('ceiling',[[-63,B2+3.9,-80.9],[-33,B4+3.9,-80.9],[-33,B4+3.9,-78],[-63,B2+3.9,-78]],[0,-1,0]);
  for(let i=1;i<17;i+=2.4)box({x:-63+i,y:B2-i*Math.tan(Math.PI/6)+3.5,z:-83.5,w:.12,h:.045,d:4.5,mat:paint(0xffffff)});
  K.wall(flight9End,-86,-25,-86,B4,B4+4.4,{mat:0xf2f2f0,openings:[{at:-29-flight9End,w:7.8,y0:B4,y1:B4+3.5}]});
  K.wall(flight9End+3,-85.8,flight9End+3,-83.9,B4,B4+1.05,{mat:'glass',thick:.035});
  sign('⑨  일반 · 급행  ↓',-64,B2+2.75,-82,7.5,.6,-Math.PI/2,'#d8d2c4','#3d3f8f');
  sign('3호선 환승  ↑',-31.8,B4+2.7,-82,6,.6,Math.PI/2,CSS[3]);

  // ---- Round 13 layout: independent upper Line 3 hall and paid 7↔9 bypass.
  // Stay west of Shinsegae's J1 shell (x=-79), south of the mall envelope,
  // and north of the department store. These are fitted, not surveyed bounds.
  // The existing W3/W9/J7 routes and the older photographed halls stay intact.
  const mallSouth=x=>-43.45-.397969*(x+178.53);
  const c3=frame([[-90,-44],[-90,-82]]),c3poly=[[-104,mallSouth(-104)],[-80,mallSouth(-80)],[-80,-44],[-104,-44]];
  const coffer={x:-93.2,z:-71.4};
  const cofferPoly=Array.from({length:8},(_,i)=>[coffer.x+Math.cos((i+.5)*Math.PI/4)*4,coffer.z+Math.sin((i+.5)*Math.PI/4)*2.65]);
  cutSlab(c3poly,B1,concourse3Voids,{mat:{tex:'station-c3-floor',gloss:.5}});
  K.slab(c3poly,B1+2.95,{mat:'concrete',under:'station-grid',holes:[cofferPoly],thick:.08,walk:false});
  K.slab(cofferPoly,B1+3.4,{mat:'concrete',under:0xe9e7df,thick:.08,walk:false});
  // Stop at the surveyed OSM mall edge. The station-side portal is ready;
  // gotomall's matching wall opening is outside this module's edit ownership.
  K.polyWalls(c3poly,B1,B1+2.95,{mat:'station-concourse-bands',inner:'station-concourse-bands',thick:.15,openings:[{x:-83,z:mallSouth(-83),w:6.35,y0:B1,y1:B1+2.7}]});
  // In station-only previews, an opaque neutral boundary prevents a new
  // underground sky leak. The neighbour currently closes this same seam.
  if(!mallHere)K.wall(-86, mallSouth(-86),-80,mallSouth(-80),B1,B1+2.7,{mat:'station-panels',thick:.08});
  K.zone({name:'고속터미널역 3호선 대합실',floor:'B1',sub:'3호선 개찰구 · 엔터식스 연결상가 · 7·9호선 환승',poly:c3poly,y0:B1,y1:B1+4.8,priority:6});
  K.spawn({name:'B1 · 3호선 대합실과 연결상가',x:-90,y:B1,z:-58,yaw:0});
  // West bank: platform → one floor up. East bank: concourse → lower hall.
  K.stairs(-96.1,-66,-96.1,-48,{ya:B2,yb:B1,w:2.1,mat:'darkstone'});
  up(-98.2,-48,-98.2,-66,B1,B2,1.35);
  down(-100.5,-48,-100.5,-66,B1,B2,1.35);
  // st-04: low sloping enclosure, with the stair left and down belt right
  // from the rider facing south. Soffit is 2.6 m above the tread line.
  K.quad(0xecebe8,[[-102,-8.4,-66],[-102,-3.4,-48],[-95,-3.4,-48],[-95,-8.4,-66]],[0,-1,5/18]);
  detailRooms[9].jobs.push(()=>{
    for(let z=-65;z<-48;z+=2){const yy=B2+5*(z+66)/18;
      box({x:-98.2,z,y:yy+2.53,w:5.7,h:.04,d:.12,mat:paint(0xfbfbf4)});
      for(const x of [-97.2,-95])beam([x,yy,z],[x,yy+1,z],.024,'metal',6);
    }
    for(const x of [-97.2,-95])beam([x,B2+1,-66],[x,B1+1,-48],.035,'metal',8);
    for(let z=-66,i=0;z<-48;z+=.25,i++)box({x:-101.84,z,y:B2+5*(z+66)/18+2.24,w:.11,h:.25,d:.25,mat:i%2?0x1c1c1c:0xf2c200});
  });
  K.stairs(-84.6,-64,-84.6,-48,{ya:B1,yb:B2,w:1.6,mat:'darkstone'});
  down(-82.1,-64,-82.1,-48,B1,B2,1.35);
  // Guard the upper floor edges; leave the west bank's south landing and
  // the east bank's north landing open. Inclined handrails alone sit too low
  // to guard the upstairs sides of a five-metre well.
  for(const [ax,az,bx,bz] of [[-94.6,-66.2,-94.6,-48.5],[-103,-66.2,-94.6,-66.2],[-86,-63.5,-86,-47.8],[-86,-47.8,-80,-47.8]]){
    if(ax===-94.6){
      // _88: perforated steel guard beside the rescue cabinet.
      K.wall(ax,az,bx,bz,B1,B1+1.02,{mat:'station-mesh-guard',thick:.035});
    }else K.wall(ax,az,bx,bz,B1,B1+1.02,{mat:'glass',thick:.035});
    beam([ax,B1+1.05,az],[bx,B1+1.05,bz],.035,'metal',6);
  }
  // A landing outside each shaft joins the existing Line 3 platform aisle.
  K.slab(rect(-103,-69,-94.6,-66),B2,{mat:'station-granite'});
  K.slab(rect(-103,-48,-94.6,-44),B1,{mat:'station-granite'});
  hall([[-83,-46],[-68,-46]],6,B2,{floor:'B2',name:'고속터미널역 3호선 대합실 하부 연결',label:'7·9호선 갈아타는 곳 →',openings:[{x:-83,z:-48,w:9,full:true},{x:-68,z:-46,w:10,full:true},{x:-77,z:-49,w:10,full:true}]});
  // Parallel to Line 3, never crossing its tracks or entering its platform.
  const bypass39=hall([[-68,-46],[-68,-85]],8,B2,{floor:'B2',name:'고속터미널역 7·9호선 별도 환승통로',sub:'환승 게이트 · 무빙워크 · 중간 홀 · 9호선 하행',label:'9호선 갈아타는 곳 ↑',wallMat:'station-panels',mat:'station-granite',crossLights:true,gateStations:[10],openings:[{x:-68,z:-54,w:11,full:true},{x:-64,z:-80,w:11,full:true},{x:-68,z:-82,w:10,full:true},{x:-68,z:-46,w:10,full:true}]});
  // st-02: east return and end cap close the street-visible blind corner;
  // the real east-west passage remains open at z=-57.5..-50.5.
  K.wall(-64,-50.5,-64,-46,B2,B2+2.9,{mat:'station-panels'});
  K.wall(-68,-46,-64,-46,B2,B2+2.9,{mat:'station-panels'});
  box({x:-64.09,z:-54,y:B2+2.3,w:.04,h:.18,d:7,mat:0xe8892b});
  const transferLanding=rect(-72,-85,-59.5,-74.5),transferFlight=[[-63,-86,-33,-78]];
  cutSlab(transferLanding,B2,transferFlight,{mat:'station-granite'});
  cutSlab(transferLanding,B2+2.9,transferFlight,{mat:'concrete',under:'station-grid',walk:false,thick:.08});
  K.wall(-64,-74.5,-59.5,-74.5,B2,B2+2.9,{mat:'station-panels'});
  K.wall(-59.5,-74.5,-59.5,-78,B2,B2+2.9,{mat:'station-panels'});
  K.wall(-63,-78,-59.5,-78,B2,B2+1.05,{mat:'glass',thick:.03});
  K.zone({name:'고속터미널역 9호선 환승 중간 홀',floor:'B2',sub:'무빙워크 · 하행 에스컬레이터',poly:transferLanding,y0:B2,y1:B2+2.9,priority:5});
  for(const [x,z] of [[-70.5,-81],[-60.5,-76]]){
    K.cyl({x,z,y:B2,r:x<-70?.6:.48,h:2.85,mat:x<-70?{color:0xeeece6,gloss:.3}:'station-granite',seg:24});
    K.cyl({x,z,y:B2,r:x<-70?.61:.49,h:.12,mat:'metal',seg:24,solid:false});
    if(x<-70)sign('⑨  환승 →',x,B2+2.3,z+.61,.9,.3,0,'#2c5aa8');
  }
  for(const v of [-.2,2]){
    const a=bypass39.at(14,v),b=bypass39.at(29,v);
    K.ramp(a.x,a.z,b.x,b.z,{ya:B2+.025,yb:B2+.025,w:1.35,mat:'station-ribbed',move:v>0?.65:-.65,rails:true});
  }
  // The bypass's western lane stays open beside the transfer-gate row.
  const gate39=frame([[-66,-52],[-66,-60]]);
  gates(gate39,4,B2,4,9,true);
  K.spawn({name:'B2 · 9호선 무빙워크 환승통로',x:-70.5,y:B2,z:-60,yaw:0});
  sign(['⑨ 갈아타는 곳 ↑','③ 대합실 ↖'], -70.8,B2+2.25,-51,2,.65,0,'#303538');
  sign('4번 출구 · 7호선 ↓',-82.1,B1+2.73,-65.5,3.1,.36,0,'#37503b','#f4e7a5');
  sign('3호선 대합실 ↑',-98.2,B2+2.42,-67.8,6,.45,0,'#343a37','#f5d24e');

  // Finish the walk's spaces only after the landings and connections exist.
  gates(c3,18,B1,6,3,true,'');
  // st-05: E cabinets are north of the wall sign; passage is east-west.
  const gateE=frame([[-84,-68.75],[-80,-68.75]]);
  gates(gateE,2.1,B1,3,3,true,'');
  for(const [x,z] of [[-93.8,-58],[-88.3,-55],[-88,-49]]){
    if(z<-64){
      K.cyl({x,z,y:B1,r:.4,h:2.88,mat:{color:0xeeeee8,gloss:.3},seg:24});
      K.cyl({x,z,y:B1,r:.42,h:.14,mat:'metal',seg:24,solid:false});
    }else{
      box({x,z,y:B1,w:.8,h:2.88,d:.8,mat:'station-flamed-pier',solid:true});
      box({x,z,y:B1,w:.84,h:.09,d:.84,mat:0x353c3b});
      if(z<-50)box({x:x+.405,z,y:B1+.12,w:.018,h:2.64,d:.06,mat:paint(0x2f6fe0)});
    }
  }
  for(const [x,z] of [[-94,-66.5],[-88.4,-67.1]]){
    box({x,z,y:B1,w:.9,h:2.92,d:.9,mat:{tex:'station-c3-marble',gloss:.3},solid:true});
    box({x,z,y:B1,w:.92,h:.12,d:.92,mat:'metal'});
  }
  box({x:-94.1,z:-66.05,y:B1,w:1.05,h:2.92,d:.25,mat:0xc9b9a0,solid:true});
  for(let x=-94.6;x<=-93.6;x+=.1)box({x,z:-65.915,y:B1,w:.05,h:2.92,d:.035,mat:0xb4a48c});
  detailRooms[9].jobs.push(()=>{
    for(let z=-45;z>-70;z-=1.9)for(const x of [-101.5,-98.5,-95.5,-92.5,-89.5,-86.5,-83.5]){
      if(concourse3Voids.some(r=>x>r[0]&&x<r[2]&&z>r[1]&&z<r[3]))continue;
      box({x,z,y:B1+2.78,w:.15,h:.05,d:1.28,mat:0xb7bdbd});
      box({x,z,y:B1+2.765,w:.12,h:.02,d:1.2,mat:paint(0xfbfbf4)});
    }
    for(const [label,x,z] of [['A',-94,-61.3],['B',-86.1,-61.3],['E',-81,-64.5]])
      sign(label,x,B1+2.03,z,.48,.52,0,'#edece6','#bd713c');
    K.quad('station-panels',[[-80.19,B1,-64.1],[-80.19,B1,-60.4],[-80.19,B1+2.9,-60.4],[-80.19,B1+2.9,-64.1]],[-1,0,0],[[0,0],[3,0],[3,1],[0,1]]);
    box({x:-80.21,z:-62.25,y:B1+1.08,w:.025,h:.085,d:3.7,mat:C[3]});
    box({x:-80.21,z:-62.25,y:B1+2.42,w:.025,h:.16,d:3.7,mat:0x66764b});
    sign('출구 안내',-80.24,B1+2.64,-62.5,1.3,.22,-Math.PI/2,'#eeeee6','#283d35');
    // _88: full-height glass rescue cabinet at the west stair corner. The
    // descent is on the left of its front view, without mirroring either core.
    const cx=-94.1,cz=-65.65;
    box({x:cx,z:cz,y:B1,w:.94,h:2.02,d:.45,mat:0xdce0dd,solid:true});
    box({x:cx+.1,z:cz+.235,y:B1+.56,w:.68,h:1.32,d:.02,mat:0x58686b});
    for(let row=0;row<3;row++)for(let col=0;col<4;col++){
      box({x:cx-.15+col*.155,z:cz+.27,y:B1+.68+row*.38,w:.105,h:.23,d:.08,mat:row%2?0xbfcbd0:0xe3e4dc});
      box({x:cx-.15+col*.155,z:cz+.31,y:B1+.74+row*.38,w:.08,h:.06,d:.01,mat:0xe9ddca});
    }
    box({x:cx+.1,z:cz+.33,y:B1+.57,w:.7,h:1.32,d:.015,mat:'glass'});
    box({x:cx,z:cz+.25,y:B1+.05,w:.88,h:.48,d:.025,mat:0x2f6fb3});
    sign('구호용품 보관함',cx+.04,B1+.36,cz+.29,.8,.17,0,'#2f6fb3');
    sign(['구','호','용','품','보','관','함'],cx-.37,B1+1.27,cz+.3,.19,1.38,0,'#f2f0e7','#b3162a');
    sign('A',cx-.6,B1+2.2,cz+.29,.38,.38,0,'#eeece6','#b87649');
    // _232: a narrow notice, then separate maroon cabinets on striped stone.
    box({x:-80.24,z:-65.6,y:B1+.55,w:.055,h:1.5,d:.7,mat:0x2a2d30});
    sign(['이용 안내','안전한 환승','질서를 지켜 주세요'],-80.3,B1+1.35,-65.6,.58,.8,-Math.PI/2,'#2a2d30');
    for(const z of [-64.9,-64.35]){
      box({x:-80.3,z,y:B1+1.05,w:.09,h:.47,d:.4,mat:0xa93e36});
      sign('소화전',-80.38,B1+1.3,z,.38,.17,-Math.PI/2,'#a93e36');
    }
    sign('E',-80.4,B1+2.18,-66.1,.38,.4,-Math.PI/2,'#edece6','#b87649');
    const exits=[['3','사평대로 · 파미에스테이션'],['4','서울성모병원'],['5','국립중앙도서관'],['6','래미안퍼스티지'],['7','JW메리어트'],['8','센트럴시티 · 신세계'],['8-1','반포한강공원'],['8-2','서울반원초등학교']];
    sign('나가는 곳',-86.15,B1+2.18,-58.6,1.35,.27,-Math.PI/2,'#303538');
    exits.forEach(([n,d],i)=>sign(n+'  '+d,-86.15,B1+1.92-i*.2,-58.6,1.35,.19,-Math.PI/2,i%2?'#25292b':'#b99b39',i%2?'#f6d158':'#24292a'));
    for(const [z,w,h,tex] of [[-60,1.15,1.8,'station-local-map'],[-57.2,1.2,1.9,'station-violet-screen']]){
      box({x:-86.15,z,y:B1+.27,w:.1,h:h+.1,d:w+.09,mat:0x262e33});
      K.quad(tex,[[-86.22,B1+.32,z-w/2],[-86.22,B1+.32,z+w/2],[-86.22,B1+.32+h,z+w/2],[-86.22,B1+.32+h,z-w/2]],[-1,0,0],[[0,0],[1,0],[1,1],[0,1]]);
    }
    for(const z of [-60.55,-56.6])box({x:-86.31,z,y:B1,w:.045,h:2.31,d:.045,mat:'metal'});
    for(const z of [-55,-52,-49]){
      K.cyl({x:-90,z,y:B1+.024,r:.315,h:.006,mat:0xe7e9ec,seg:32,solid:false});
      K.cyl({x:-90,z,y:B1+.026,r:.3,h:.006,mat:0x526bb0,seg:32,solid:false});
      K.floorText('↖',{x:-90,y:B1+.04,z,w:.43,h:.43,fg:'#f0efe9'});
    }
    // Only the lower cylinder is visible in _252; waste-bin identity/height
    // remain an explicit reconstruction assumption in the research ledger.
    K.cyl({x:-90.9,z:-56.2,y:B1,r:.3,h:.9,mat:0x8f9092,seg:24,solid:false});
    K.cyl({x:-90.9,z:-56.2,y:B1+.12,r:.305,h:.2,mat:0xa78b6c,seg:24,solid:false});
    K.cyl({x:-90.9,z:-56.2,y:B1+.88,r:.23,h:.025,mat:0x292e30,seg:24,solid:false});
    K.floorText('↑',{x:-89,y:B1+.035,z:-65,w:.5,h:.8,rotY:Math.PI,fg:'#e58b3b'});
    for(const [x,z] of [[-92,-55],[-87,-60.2],[-92,-68],[-95.5,-67],[-87.3,-52],[-91,-46]])person(x,B1,z,{shirt:0x444c56,pants:0x292e34});
  });

  // st-03: skew the boutique to the OSM mall edge. Its racks, glazed
  // frontage and mannequins are retained; the arcade occupies the east bay.
  const boutiqueFront=frame([[-100,mallSouth(-100)+3],[-88,mallSouth(-88)+3]]);
  const boutiqueFace=Math.atan2(.397969,1);
  const shopP=(u,d)=>{const p=boutiqueFront.at(u,-d);return {x:p.x,z:p.z};};
  const shopBox=(u,d,y,w,h,depth,mat,solid=false)=>box({...shopP(u,d),y,w,h,d:depth,rotY:boutiqueFace,mat,solid});
  for(const u of [0,boutiqueFront.length]){
    const a=shopP(u,0),b=shopP(u,2.75);
    K.wall(a.x,a.z,b.x,b.z,B1,B1+2.8,{mat:{tex:'station-c3-marble',gloss:.3},thick:.13});
  }
  {const a=shopP(0,2.75),b=shopP(boutiqueFront.length,2.75);K.wall(a.x,a.z,b.x,b.z,B1,B1+2.8,{mat:'station-c3-marble',thick:.12});}
  for(const [a,b] of [[0,4],[8.8,boutiqueFront.length]]){
    const p=shopP(a,0),q=shopP(b,0);K.wall(p.x,p.z,q.x,q.z,B1,B1+2.45,{mat:'glass',thick:.025});
  }
  const arcade=[[-87.6,-68.3],[-80.35,-68.3],[-80.35,mallSouth(-80.35)+.2],[-87.6,mallSouth(-87.6)+.2]];
  K.slab(arcade,B1+2.72,{mat:0x40484c,under:0x353c40,thick:.08,walk:false});
  K.cyl({x:-87.55,z:-72,y:B1,r:.6,h:2.95,mat:{color:0xeeece6,gloss:.3},seg:32});
  for(const x of [-88.1,-80.5])box({x,z:-68.7,y:B1,w:.32,h:2.65,d:.75,mat:{tex:'station-c3-marble',gloss:.3},solid:true});
  K.zone({name:'엔터식스 강남점 연결상가',floor:'B1',sub:'엔터식스 · 고투몰 방면',poly:arcade,y0:B1,y1:B1+2.95,priority:7});
  detailRooms[9].jobs.push(()=>{
    const front=shopP(boutiqueFront.length/2,-.08);
    sign('LOVE N SHOW',front.x,B1+2.59,front.z,11.7,.28,boutiqueFace,'#edece6','#736957');
    for(const d of [.8,2])for(const u of [2,6.4,10.8]){
      for(const du of [-.8,.8]){const q=shopP(u+du,d);beam([q.x,B1+.15,q.z],[q.x,B1+1.62,q.z],.022,'metal',6);}
      const a=shopP(u-.86,d),b=shopP(u+.86,d);beam([a.x,B1+1.62,a.z],[b.x,B1+1.62,b.z],.025,'metal',6);
      for(let i=0;i<12;i++){
        const t=u-.77+i*.14,aa=shopP(t-.08,d),bb=shopP(t,d),cc=shopP(t+.08,d);
        beam([aa.x,B1+1.47,aa.z],[bb.x,B1+1.59,bb.z],.008,'metal',4);
        beam([bb.x,B1+1.59,bb.z],[cc.x,B1+1.47,cc.z],.008,'metal',4);
        shopBox(t,d,B1+.58,.13,.88+(i%3)*.04,.38,[0xe2d6c1,0x383b39,0xb3aaa0,0xc4b190,0x77766e][i%5]);
      }
    }
    for(const [u,col] of [[1,0xd5ccb9],[11.8,0x353a37]]){
      const p=shopP(u,.45);K.cyl({...p,y:B1+.04,r:.24,h:.04,mat:'metal',seg:16,solid:false});
      K.person(p.x,B1+.08,p.z,{shirt:col,pants:0xc9b89d,h:1.66,rotY:boutiqueFace});
    }
    shopBox(6.4,2.25,B1,1.3,.86,.55,0xe2dccf);
    {const p=shopP(6.4,2.7);person(p.x,B1,p.z,{shirt:0x373b39,pants:0x343435,rotY:boutiqueFace});}
    for(const u of [1.8,4.8,7.8,10.8])shopBox(u,1.4,B1+2.72,.4,.04,1.8,paint(0xf9f4e8));
    sign('ENTER6',-84.1,B1+2.46,-68.5,3.3,.24,0,'#454b49','#eeeade');
    sign('고투몰 · 엔터식스 ↑',-83.5,B1+2.44,-76.8,4.6,.32,0,'#343a3e','#e9e8df');
    box({x:-80.65,z:-73.2,y:B1+.18,w:.16,h:2.22,d:1.3,mat:0x171b1e});
    sign(['매장 안내','의류 · 잡화'], -80.76,B1+1.8,-73.2,1.15,.64,-Math.PI/2,'#eac841','#252a2d');
    sign('엔터식스',-80.77,B1+.85,-73.2,1.15,.38,-Math.PI/2,'#202426');
    for(const x of [-86.7,-84.8,-82.9,-81.1])for(let z=-69.5;z>mallSouth(x)+.7;z-=1.3)
      K.cyl({x,z,y:B1+2.62,r:.055,h:.025,mat:paint(0xfff4d8),seg:12,solid:false});
    sign(['SALE','시즌 할인'], -88.07,B1+1.72,-68.3,.45,.67,0,'#f0ebe2','#b55935');
    sign('시즌 세일',-97.6,B1+2.2,-71.3,1.3,.35,0,'#bc3c36','#ffe1a1');
    for(let i=0;i<13;i++)traveler([-86.4,-84.5,-82.5][i%3],B1,-71.5-Math.floor(i/3)*1.65,i+190,{rotY:i%3?0:Math.PI});
    const poly=cofferPoly,inner=poly.map(([x,z])=>[coffer.x+(x-coffer.x)*.91,coffer.z+(z-coffer.z)*.91]);
    K.hpoly(paint(0xf3eedf),poly,B1+3.26,false,[inner]);
    for(let i=0;i<8;i++){
      const a=poly[i],b=poly[(i+1)%8];
      K.quad('station-c3-marble',[[a[0],B1+2.95,a[1]],[b[0],B1+2.95,b[1]],[b[0],B1+3.38,b[1]],[a[0],B1+3.38,a[1]]],[coffer.x-(a[0]+b[0])/2,0,coffer.z-(a[1]+b[1])/2]);
      beam([a[0],B1+3.25,a[1]],[b[0],B1+3.25,b[1]],.035,0x828478,6);
    }
    for(const [a,b] of [[0,4],[2,6]])beam([poly[a][0],B1+3.22,poly[a][1]],[poly[b][0],B1+3.22,poly[b][1]],.022,0x5f675d,6);
    for(const z of [-62,-65.2]){
      sign('나가는 곳',-90,B1+2.45,z,1.65,.36,0,'#f3c933','#2f3336');
      sign('← 호남선 · 신세계',-92.7,B1+2.45,z,3.65,.36,0,'#245a9c');
      sign('1 경부선·영동선 →',-87.1,B1+2.45,z,4,.36,0,'#245a9c');
    }
  });
  detailRooms[4].jobs.push(()=>{
    for(const v of [-.2,2]){
      const a=bypass39.at(14,v),b=bypass39.at(29,v);
      steelEscalator(a.x,a.z,b.x,b.z,B2+.025,B2+.025,1.35,false,true);
    }
    // _132: pale pink wrap, large white copy shapes and pale text panels.
    // The source is too small to transcribe campaign copy faithfully.
    box({x:-64.12,z:-67.5,y:B2+.2,w:.04,h:2.35,d:14,mat:0xf2b3c8});
    for(const z of [-72.7,-68.4,-64.1]){
      box({x:-64.15,z,y:B2+.4,w:.025,h:1.05,d:3.7,mat:0xf6d1de});
      for(let i=0;i<6;i++)box({x:-64.17,z:z+(i%2?.1:0),y:B2+.57+i*.12,w:.015,h:.025,d:2.4-(i%3)*.24,mat:0xc494a7});
      for(let i=0;i<7;i++){
        box({x:-64.17,z:z-.95+i*.3,y:B2+1.81,w:.015,h:.31,d:.055,mat:0xffffff});
        box({x:-64.17,z:z-.88+i*.3,y:B2+2.07,w:.015,h:.065,d:.2,mat:0xffffff});
        box({x:-64.17,z:z-.88+i*.3,y:B2+1.77,w:.015,h:.055,d:.2,mat:0xffffff});
      }
    }
    // _30: local panel return at the split; arrows follow this fitted layout.
    box({x:-64.5,z:-51.6,y:B2,w:.2,h:2.85,d:1.25,mat:'station-panels'});
    box({x:-64.63,z:-51.6,y:B2+1.08,w:.025,h:.08,d:1.25,mat:C[3]});
    sign(['⑨ ↑','9호선 방향','③ ↖','3호선 방향'],-64.65,B2+1.5,-51.6,.6,1.62,-Math.PI/2,'#2b2f33');
    for(const [x,z] of [[-61.5,-75.8],[-65.8,-76.1]]){
      box({x,z,y:B2+2.7,w:1.8,h:.06,d:.38,mat:paint(0xf3f5f0)});
    }
    // Preserve the censored _212 campaign walls; add only its visible plain
    // service-door stretch at the end of the local view.
    for(const z of [79,81.6]){
      box({x:43.37,z,y:B2,w:.04,h:2.65,d:2.35,mat:'station-panels'});
      box({x:43.32,z,y:B2+.1,w:.04,h:2.14,d:.82,mat:0xe5e7e2});
      box({x:43.27,z:z-.28,y:B2+1,w:.035,h:.12,d:.035,mat:'metal'});
    }
    // st-09: the masked frame controls the frontal corner wall only. Other
    // ad walls and the earlier service-door bays are retained.
    box({x:40,z:-57.12,y:B2,w:6.8,h:2.7,d:.035,mat:'station-panels'});
    box({x:38.4,z:-57.08,y:B2+.03,w:1,h:2.1,d:.025,mat:0xf0f0ed});
    box({x:38.78,z:-57.055,y:B2+.98,w:.035,h:.12,d:.04,mat:'metal'});
    K.cyl({x:38.4,z:-56.4,y:B2+.026,r:.3,h:.008,mat:0xf2c200,seg:32,solid:false});
    K.floorText('출입 금지',{x:38.4,y:B2+.04,z:-56.4,w:.48,h:.14,fg:'#363830'});
    for(const [i,x,z] of [[0,39.1,-53.2],[1,40.1,-53.6],[2,41.4,-53.4],[3,37.4,-54.8],[4,39,-55],[5,40.7,-55.4],[6,41.8,-55.1],[7,42.6,-54.4]])
      traveler(x,B2,z,230+i,{rotY:0,shirt:[0x34383d,0x4f545b,0xbbb4a8][i%3]});
    // st-07/st-25: rope is on the approach side of the relocated cream pier.
    for(const z of [-77.8,-78.95,-80.1,-81.25,-82.4]){
      K.cyl({x:-69.35,z,y:B2,r:.12,h:.06,mat:'metal',seg:12,solid:false});
      K.cyl({x:-69.35,z,y:B2+.06,r:.025,h:.92,mat:'metal',seg:8,solid:false});
    }
    beam([-69.35,B2+.87,-77.8],[-69.35,B2+.87,-82.4],.035,0xb3353a,8);
    sign(['환승 안내','⑨ 타는 곳 →'],-70.3,B2+1.2,-78.6,1.15,.75,0,'#eeeae1','#405666');
    for(const [x,z,col] of [[-70,-78,'#3989ba'],[-68.2,-80,'#e99e50']])K.floorText('↑',{x,y:B2+.035,z,w:.8,h:1.1,fg:col});
    for(const [x,z] of [[-69,-62],[-66,-69],[-70.2,-74],[-68.9,-79],[-65.5,-83]])person(x,B2,z,{shirt:0x4f5863});
  });

  // Accessible routes. Each lift door has a real landing and all line levels;
  // Line 7's Exit 4 lift explicitly includes the verified 1F/B2/B3 stops.
  // Its existing B1 stop is an unverified connection retained in this pass.
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
      const label=f.label==='1F'?'지상':`지하 ${f.label.slice(1)}층`;
      sign(label+' · 엘리베이터',indicator[0],f.y+2.66,indicator[1],2.55,.34,rot,'#193640','#f0db8d');
      sign([label,f.name],back[0],f.y+1.65,back[1],2.15,.62,rot,'#e8e6dc');
      part(1.65,d/2+.07,f.y+.83,.26,.58,.1,0x52666f);
      sign('호출',panel[0],f.y+1.3,panel[1],.42,.18,rot,'#193640');
      part(1.65,d/2+.15,f.y+1.01,.1,.1,.04,paint(0xf0dca0));
    }
    K.slab(poly,top,{mat:'metal',under:'ceiling',walk:false});
  }
  lift(-76,-82,0,[{label:'B1',y:B1,name:'고투몰 연결'},{label:'B2',y:B2,name:'3호선 승강장'},{label:'B4',y:B4,name:'9호선 연결'}],'3·9호선 환승 엘리베이터');
  // The neighbour's J1 wall cannot be opened by this module. A local lift gives
  // the added concourse accessible access without crossing that property seam.
  lift(-101,-70,0,[{label:'B1',y:B1,name:'3호선 대합실 · 엔터식스 연결상가'},{label:'B2',y:B2,name:'3호선 승강장'}],'3호선 대합실 엘리베이터');
  // B1 lift landing reaches the W3 gallery; B4 landing reaches Line 9's south side.
  if(!mallHere)hall([[-79,-79],[-70,-79],[-70,-106],[-79,-106]],5,B1,{label:'3·9호선 엘리베이터',openings:[{x:-76,z:-80.75,w:3},{x:-79,z:-106,w:10}]});
  hall([[-79,-79],[-69,-79],[-69,-90]],5,B4,{label:'9호선 타는 곳',openings:[{x:-76,z:-80.75,w:3},{x:-69,z:-86,w:11,full:true}]});
  for(const y of mallHere?[B4]:[B1,B4])K.wall(-79,-81.5,-79,-76.5,y,y+4.7,{mat:'station-ceramic'});
  lift(36,-124,0,[{label:'B1',y:B1,name:'고투몰 연결'},{label:'B4',y:B4,name:'9호선 승강장'}],'9호선 엘리베이터');
  if(!mallHere){
    // The upper hall itself is the lift approach. A second enclosed corridor
    // through it used to hide the oval and the vending frontage behind a wall.
    const apron=rect(31,-123.5,39,-118.5);
    K.slab(apron,B1,{mat:'station-granite'});
    K.slab(apron,B1+2.9,{mat:'concrete',under:'station-grid',walk:false,thick:.08});
    K.wall(39,-123.5,39,-118.5,B1,B1+2.9,{mat:'station-panels'});
    K.wall(31,-118.5,39,-118.5,B1,B1+2.9,{mat:'station-panels'});
    sign('엘리베이터 →',32,B1+2.35,-121.5,3.4,.35,0,'#303844');
  }
  lift(-136,248,Math.PI/2,[{label:'1F',y:0,name:'4번 출구'},{label:'B1',y:B1,name:'연결 대합실'},{label:'B2',y:B2,name:'7호선 대합실'},{label:'B3',y:B3,name:'7호선 승강장'}],'4번 출구 · 7호선 엘리베이터');
  hall([[-136,248],[-130,248]],5,B2,{label:'7호선 대합실',openings:[{x:-123,z:248,w:10}]});
  hall([[-136,248],[-130,248]],5,B3,{label:'7호선 타는 곳',openings:[{x:-123,z:248,w:10}]});
  // Ground lift canopy, glass side panels and legible street marker.
  box({x:-136,y:3.3,z:248,w:3.2,h:.18,d:3.2,mat:0x4f626c});
  sign('고속터미널역  7호선',-134.6,2.75,248,3.3,.48,Math.PI/2,'#747f00');
  sign('엘리베이터',-134.6,2.15,248,2.3,.4,Math.PI/2);
  // Seoul's 2026-01-09 article confirms an exterior ramp, but gives no survey
  // dimensions. Keep the existing street/lift levels: this shallow paving
  // relief is a flat-world approximation, not a real slope claim. Its surface
  // clears both the station's .025 m and Central City's .06 m paving finishes.
  // Approach north of the open Exit 4 stairwell, then turn south onto the
  // existing east-facing lift landing. No new indoor room or building link.
  K.ramp(-126.8,246.1,-127.8,246.1,{ya:.025,yb:.08,w:2.2,mat:'station-granite',rails:false});
  K.ramp(-127.8,246.1,-133.2,246.1,{ya:.08,yb:.065,w:2.2,mat:'station-granite',rails:true});
  K.ramp(-133.2,246.1,-133.9,246.1,{ya:.065,yb:.025,w:2.2,mat:'station-granite',rails:false});
  K.slab(rect(-134.6,245,-133.2,248.8),.025,{mat:'station-granite',thick:.08});
  for(const z of [245,247.2])for(const x of [-127.8,-130.5,-133.2]){
    const y=.08+.015*(x+127.8)/5.4;
    K.cyl({x,y,z,r:.035,h:.95,mat:'metal',seg:8});
  }
  sign('⑦ 엘리베이터 ←',-127.6,1.4,245,2.5,.32,Math.PI/2,'#747f00');

  // Network diagrams and local orientation boards, with researched names only.
  for(const [f,s,v,y,line] of [[l3,105,-16.8,B2,3],[l7,98,-14.5,B3,7],[l9,95,-14.5,B4,9]]){
    localSign(f,s,v,y+2.2,[line+'호선 노선 안내',({3:'잠원 ━ 고속터미널 ━ 교대',7:'반포 ━ 고속터미널 ━ 내방',9:'신반포 ━ 고속터미널 ━ 사평'})[line]],7.5,1.1,true,'#e9e8df');
    localSign(f,s+10,v,y+1.8,['출구 안내','고투몰 · 경부선터미널','센트럴시티 · 신세계백화점','파미에스테이션 · JW메리어트'],5,1.7,true,'#2b404e');
  }

  detailRooms[3].jobs.push(()=>{
    // _24's large diagonal stone wall remains behind the existing cabinets
    // and advertising panels; it is a different surface from the pier sash.
    K.quad({tex:'station-platform-diagonal',gloss:.3},[[-106.88,B2,-121],[-106.88,B2,-103],[-106.88,B2+3.1,-103],[-106.88,B2+3.1,-121]],[1,0,0],[[0,1],[5,1],[5,0],[0,0]]);
    // _24: tall white purifier and red-front safety cabinet below the sign.
    localBox(l3,116.5,16.2,B2,.44,1.2,.7,{color:0xc8cbcd,gloss:.5},true);
    localSign(l3,116.5,15.95,B2+.88,'소',.17,.24,true,'#c8cbcd','#b42a2f');
    {const p=l3.at(116.5,15.94);K.dome({x:p.x,y:B2+1.8,z:p.z,rx:.055,ry:.1,rz:.1,mat:0xb82b32});}
    localBox(l3,114.6,16.1,B2,.55,1.9,.8,0xe8e9e4,true);
    for(let i=0;i<13;i++)localBox(l3,114.6,15.81,B2+.12+i*.035,.025,.016,.62,0x8a9699);
    localBox(l3,112,16.28,B2,.43,1.82,.65,0xc33c35,true);
    localSign(l3,112,16.02,B2+1.25,['비상용','구호장비'],.5,.6,true,'#c33c35');
    localBox(l3,113,16.83,B2+2.75,.07,.4,17.5,0xe8823a);
    localSign(l3,115.8,16.77,B2+2.96,'고속터미널',3.3,.3,true,'#e8823a','#3a3a3a');
    // _16: unobstructed orange oval, low continuous bench, and a small TV.
    localBox(l3,87,16.35,B2,.55,.45,6,{color:0xb9b9b1,gloss:.3},true);
    localBox(l3,87,14.2,B2+.029,4.2,.012,.1,0x4c9a67);
    localBox(l3,83.2,16.7,B2+.65,.12,1.65,1.6,0x303c40);
    const tv=l3.at(83.2,16.61);
    K.quad('station-ad-0',[[tv.x,B2+1.13,tv.z+.66],[tv.x,B2+1.13,tv.z-.66],[tv.x,B2+1.9,tv.z-.66],[tv.x,B2+1.9,tv.z+.66]],[1,0,0],[[0,0],[1,0],[1,1],[0,1]]);
    for(let i=0;i<10;i++)localBox(l3,82.6+i*.13,16.6,B2+.72,.025,.3,.035,0x78858a);
    const board=l3.at(84.5,13.5);
    sign(['열차 도착 안내','잠원 방면  열차 접근'],board.x,B2+2.65,board.z,3.5,.56,Math.PI/2,'#20272a','#e8bf56');
    // _16/_24: warm ceiling panel bays and orange oval station name signs.
    for(const side of [-1,1])for(const s of [85,135]){
      localBox(l3,s,side*14.2,B2+3.08,3.2,.06,8.2,0xc9a581);
      for(let ds=-3.8;ds<4;ds+=1.3)localBox(l3,s+ds,side*14.2,B2+3.067,3.2,.012,.02,0x8a7763);
      const p=l3.at(s+2,side*16.78),rot=p.rot+side*Math.PI/2;
      const Q=(u,v)=>[p.x+Math.cos(rot)*u,B2+2.14+v,p.z-Math.sin(rot)*u];
      K.quad('station-name-oval',[Q(-1.85,-.39),Q(1.85,-.39),Q(1.85,.39),Q(-1.85,.39)],[Math.sin(rot),0,Math.cos(rot)],[[0,0],[1,0],[1,1],[0,1]]);
    }
  });
  detailRooms[6].jobs.push(()=>{
    // _142: four small discs on the UP escalator's rail, not the stair centre.
    const a=l7.at(78.7,0),b=l7.at(78.7,12.8),len=12.8,nx=-(b.z-a.z)/len,nz=(b.x-a.x)/len;
    for(let i=0;i<4;i++){
      const t=(8.3+i*.19)/len,x=a.x+(b.x-a.x)*t+nx*.705,z=a.z+(b.z-a.z)*t+nz*.705,y=B2+(B3-B2)*t+.94;
      const P=(u,v)=>[x+(b.x-a.x)*u/len+nx*v,y-5*u/len+.125,z+(b.z-a.z)*u/len+nz*v];
      K.quad('station-safety-disc',[P(-.07,-.07),P(.07,-.07),P(.07,.07),P(-.07,.07)],[5*(b.x-a.x)/(len*len),1,5*(b.z-a.z)/(len*len)],[[0,0],[1,0],[1,1],[0,1]]);
    }
    for(const [i,v] of [[0,8.8],[1,6.5],[2,4.2],[3,2]]){
      const p=l7.at(78.7,v);traveler(p.x,B2-5*v/12.8+.001,p.z,30+i,{rotY:Math.atan2(a.x-b.x,a.z-b.z),shirt:[0x303a44,0x8f9aa8,0x454950,0x9da5a4][i]});
    }
  });
  detailRooms[7].jobs.push(()=>{
    // Static observed boarding position, not a live train state.
    const q=l9.at(205.75,-5.24),rot=q.rot+Math.PI/2;
    // One flush grey strip: increasing chainage is viewer-left at this PSD.
    const Q=(u,v)=>[q.x+Math.cos(rot)*u,B4+1.08+v,q.z-Math.sin(rot)*u];
    K.quad('station-psd-access',[Q(-1.3,-.16),Q(1.3,-.16),Q(1.3,.16),Q(-1.3,.16)],[Math.sin(rot),0,Math.cos(rot)]);
    const r=l9.at(205,-6.2);
    K.floorText('6-2',{x:r.x,y:B4+.04,z:r.z,w:.72,h:.4,rotY:q.rot-Math.PI/2,fg:'#ffffff'});
  });
  // Round 15 crowds follow the photographed paths. All figures/accessories
  // belong to lazy room groups, and positions are checked against the final
  // floor/obstacles before adding them. Shared circulation stays unobstructed.
  detailRooms[9].jobs.push(()=>{
    steelEscalator(-98.2,-66,-98.2,-48,B2,B1,1.35,true);
    steelEscalator(-100.5,-66,-100.5,-48,B2,B1,1.35);
    for(const [i,z] of [[0,-60.1],[1,-56.2],[2,-51.5]])traveler(-98.2,B2+5*(z+66)/18+.001,z,i+12,{rotY:Math.PI,shirt:i===0?0xa6a9aa:0x4a535c,pants:i===0?0xd5ccba:0x313a43});
    const positions=[[-92.5,-50],[-90.6,-48.7],[-88.2,-47],[-91.2,-52.8],[-89.2,-54],[-92,-57.6],[-90.6,-56.5],[-85.5,-55.5],[-93.5,-61],[-89.2,-65.6],[-92,-66.1],[-96,-65.2],[-83.9,-68.7],[-82.6,-69.7],[-85.4,-70.7],[-86.8,-69.7],[-83.1,-71],[-81.7,-68.6],[-86.4,-65.5],[-90.7,-67.9],[-97.5,-67.7]];
    positions.forEach(([x,z],i)=>{
      const id=i>=12?i+1:i; // deletion must not change the other walkers' clothes/headings
      if(x===-86.4&&z===-65.5)traveler(x,B1,z,13,{rotY:-Math.PI/2,shirt:0xb4a28b,pants:0x34353a});
      else traveler(x,B1,z,id,{rotY:x===-90.6&&z===-56.5?Math.PI:[0,Math.PI,Math.PI/2,-.4][id%4]});
    });
    // Small observed yellow gate-side notice, no guessed campaign brand.
    sign('교통카드를 미리 준비해 주세요',-86.5,B1+1.45,-61.65,2.7,.38,0,'#f5cf43','#303938');
  });
  detailRooms[3].jobs.push(()=>{
    traveler(-101.6,B2,-136.1,12,{shirt:0x999ca0,pants:0xd8cdb8,rotY:Math.PI/2});
    // Plaid seams on the grey guide's shirt, as visible in _16.
    for(let i=0;i<5;i++)box({x:-101.76,y:B2+.9+i*.085,z:-136.1,w:.018,h:.012,d:.31,mat:0xd1d0ce});
    for(let s=77,i=0;s<122;s+=3.3,i++){
      const p=l3.at(s,[8.7,13.1,14.6][i%3]);traveler(p.x,B2,p.z,i+40,{rotY:[Math.PI/2,0,Math.PI][i%3]});
    }
  });
  detailRooms[4].jobs.push(()=>{
    for(let s=11,i=0;s<transfer.length-5;s+=8.2,i++){
      const p=transfer.at(s,[-1.7,-.9,-2.3][i%3]);traveler(p.x,B2,p.z,i+60,{rotY:p.rot+(i%3===0?Math.PI:0)});
    }
    // Walking and standing passengers on both belts, some carrying bags.
    for(let i=0;i<8;i++){
      const p=bypass39.at(15+i*1.7,i%3===0?-.2:2);
      traveler(p.x,B2+.025,p.z,i+80,{rotY:Math.PI,shirt:i===1?0x86a9ba:undefined});
    }
    const hallPeople=[[-69.2,-76.3],[-68.4,-76.6],[-66.7,-75.8],[-63.1,-76.8],[-61.3,-77],[-69.2,-80.8],[-70.3,-82],[-67.3,-79.6]];
    hallPeople.forEach(([x,z],i)=>traveler(x,B2,z,i+90,{shirt:i===0?0x3a4148:i===1?0x7fa0b4:undefined,rotY:i<2?Math.PI/2:.4}));
    // Short flight opens onto a bright flat landing; its original B4 link
    // remains open around the concealed staircase's lower end.
    steelEscalator(-63,-84.4,flight9End,-84.4,B2,B4,1.5,false,true);
    steelEscalator(-63,-82.2,flight9End,-82.2,B2,B4,1.5,false,true);
    for(const x of [flight9End+2,flight9End+6,flight9End+10,-28.5])
      box({x,y:B4+3.85,z:-83.3,w:2.4,h:.08,d:3.6,mat:paint(0xffffff)});
    for(const [i,z] of [[0,-84.5],[1,-82.4]])traveler(flight9End+4,B4,z,220+i,{rotY:Math.PI/2});

  });
  detailRooms[5].jobs.push(()=>{
    for(let s=98,i=0;s<concourse7.length-10;s+=3.1,i++){
      const p=concourse7.at(s,[-4.6,-1.7,2.1,6.5][i%4]);traveler(p.x,B2,p.z,i+110,{rotY:p.rot+(i%4===0?Math.PI:0)});
    }
    for(let i=0;i<14;i++){
      const p=concourse7.at(108+i*1.45,[-1.2,2.7,6.7][i%3]);traveler(p.x,B2,p.z,i+160,{rotY:p.rot+(i%3===0?Math.PI:0)});
    }
    // Reinforce the route in the photographed hall after the hotel overlap.
    localSign(concourse7,126,0,B2+2.38,'4번 출구  ↑    3·9호선  ↓',7,.36,false,'#293b35','#f0df8c');
  });
  K.spawn({name:'3번 출구 · 파미에스테이션 방면',x:52.1,y:0,z:185.5,yaw:0});
  K.spawn({name:'4번 출구 · 엘리베이터',x:-129,y:0,z:246,yaw:Math.PI/2});
  const p1=b1.at(66,0);K.spawn({name:'B1 · 센트럴시티 연결 대합실',x:p1.x,y:B1,z:p1.z,yaw:1.95});
  K.spawn({name:'B1 · 고투몰 3호선 입구',x:-79.625,y:B1,z:-109.3,yaw:Math.PI});
  K.spawn({name:'B2 · 3호선 승강장',x:-79,y:B2,z:-151,yaw:0});
  const p2=concourse7.at(105,-4);K.spawn({name:'B2 · 7호선 대합실',x:p2.x,y:B2,z:p2.z,yaw:2.1});
  const p3=l7.at(116,9);K.spawn({name:'B3 · 7호선 곡선 승강장',x:p3.x,y:B3,z:p3.z,yaw:2.34});
  const p4=l9.at(100,-9);K.spawn({name:'B4 · 9호선 승강장',x:p4.x,y:B4,z:p4.z,yaw:1.934});
  const p9=l9.at(22,3);K.spawn({name:'B4 · 9호선 환승 분기홀',x:p9.x,y:B4,z:p9.z,yaw:1.934});
  const pt=transfer.at(45,1.2);K.spawn({name:'B2 · 광고벽 환승통로',x:pt.x,y:B2,z:pt.z,yaw:-Math.PI/2});
  K.spawn({name:'B2 · 대리석 출구 안내와 계단',x:-80.1,y:B2,z:-84.5,yaw:0});
  for(const {jobs,...room} of detailRooms)K.detail(room,()=>{
    furnishing=true;
    try { for(const job of jobs)job(); } finally { furnishing=false; }
  });
}
