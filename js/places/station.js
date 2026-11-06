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
// Round 6: finishes follow refs/interior/station/01–22 (2025–2026).
// Shared mall-side halls are furnished only when the mall is absent; their
// full-world shells and gates belong to gotomall. Shop order is unsurveyed.
// Entrance paving, furniture and information kiosks are inferred streetscape;
// the station remains entirely underground. The unsurveyed 3↔9 stair bay is
// south of the Line 9 platform envelope so no stair skirt occupies its aisle.
export function build(K) {
  const { B1, B2, B3, B4 } = K.LEVELS;
  const C = { 3: 0xe8731a, 7: 0x8b9a4a, 9: 0xc99b5e };
  const CSS = { 3: '#e8731a', 7: '#8b9a4a', 9: '#c99b5e' };
  const mallHere=(()=>{const s=K.phys.support(-40,-110,B1+.5);return Math.abs(s.y-B1)<.3;})();
  const rect = (x0, z0, x1, z1) => [[x0,z0],[x1,z0],[x1,z1],[x0,z1]];
  const box = o => K.box({ solid: false, ...o });
  const paint = (color) => ({ tex: 'emit', color });
  const sign = (text, x, y, z, w, h, rotY=0, bg='#172532', fg='#ffffff') => {
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
  K.texture('station-grid',512,512,(g,w,h)=>{
    g.fillStyle='#a8aaa7';g.fillRect(0,0,w,h);
    for(let r=0;r<2;r++)for(let c=0;c<2;c++){
      g.fillStyle=(r+c)%2?'#f2f2ee':'#e9eae6';g.fillRect(c*256+2,r*256+2,252,252);
      g.fillStyle='#fafaf6';g.fillRect(c*256+3,r*256+3,250,2);
    }
  },[1.2,1.2]);
  K.texture('station-panels',512,512,(g,w,h)=>{
    g.fillStyle='#b4b7b1';g.fillRect(0,0,w,h);
    for(let r=0;r<3;r++)for(let c=0;c<2;c++){
      g.fillStyle=['#ecebe6','#f1f0eb','#e9e9e3'][(r+c)%3];g.fillRect(c*256+2,r*h/3+2,252,h/3-4);
    }
  },[1.2,1.8]);
  K.texture('station-marble',512,512,(g,w,h)=>{
    g.fillStyle='#c8c2b6';g.fillRect(0,0,w,h);const rnd=K.rand(50106);
    for(let i=0;i<110;i++){
      let x=rnd()*w,z=rnd()*h;g.beginPath();g.moveTo(x,z);
      for(let j=0;j<8;j++){x+=(rnd()-.42)*78;z+=(rnd()-.32)*48;g.lineTo(x,z);}
      g.strokeStyle=['#a6a49d','#e8e5dc','#b3b0a7','#dad8d0'][i%4];g.lineWidth=i%6===0?5:1.3;g.stroke();
    }
    g.strokeStyle='#8f918b';g.lineWidth=1.4;g.strokeRect(0,0,w,h);
    g.beginPath();g.moveTo(w/2,0);g.lineTo(w/2,h);g.moveTo(0,h/2);g.lineTo(w,h/2);g.stroke();
  },[1.2,1.2]);
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
    localBox(f,s,v,y,.28,.075,length+.1,0x8e9798);
    for(const dv of [-.073,.073])localBox(f,s,v+dv,y-.018,.045,.035,length,paint(0xf2f8fa));
  }
  function ceilingVent(f,s,v,y){
    const p=f.at(s,v);
    K.cyl({x:p.x,z:p.z,y:y+2.73,r:.38,h:.07,mat:0xd5d6d0,seg:20,solid:false});
    K.cyl({x:p.x,z:p.z,y:y+2.715,r:.29,h:.025,mat:0x777f7b,seg:20,solid:false});
    for(let q=-.2;q<=.2;q+=.08)localBox(f,s+q,v,y+2.708,.42,.012,.018,0xb8beb9);
  }
  const insideVoid=(f,s,v,holes,pad=.6)=>{const p=f.at(s,v);return holes.some(r=>p.x>r[0]-pad&&p.x<r[2]+pad&&p.z>r[1]-pad&&p.z<r[3]+pad);};
  function hanging(f,s,y,label,width=6,height=2.85,line=0) {
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
    const p=f.at(s,v),r=.39;
    K.cyl({x:p.x,z:p.z,y,r,h,mat:marble?'station-marble':0xeeeee8,seg:marble?8:16});
    K.cyl({x:p.x,z:p.z,y,r:r+.015,h:.09,mat:0x343a3c,seg:16,solid:false});
    K.cyl({x:p.x,z:p.z,y:y+.09,r:r+.018,h:.09,mat:'metal',seg:16,solid:false});
    if(!line)return;
    // Photos 10/11: constant-width diagonal sash, with a notched arrow tip.
    for(const facing of [p.rot,p.rot+Math.PI]){
      const rr=r+.023,half=.9/(2*rr),bottom=.25,top=h-.1;
      const P=(yy,t)=>{const a=facing-.6+1.2*(yy-bottom)/(top-bottom)+t*half;return [p.x+Math.sin(a)*rr,y+yy,p.z+Math.cos(a)*rr];};
      for(let j=0;j<8;j++)for(let k=0;k<12;k++){
        const a=-1+k/6,b=-1+(k+1)/6,lo=bottom+(top-bottom)*j/8,hi=bottom+(top-bottom)*(j+1)/8;
        const tip=t=>hi-(j===7?.2*(1-Math.abs(t)):0);
        const normal=facing-.6+1.2*((lo+hi)/2-bottom)/(top-bottom)+(a+b)/2*half;
        K.quad(C[line],[P(lo,a),P(lo,b),P(tip(b),b),P(tip(a),a)],[Math.sin(normal),0,Math.cos(normal)]);
      }
      const q={x:p.x+Math.sin(facing)*(r+.04),z:p.z+Math.cos(facing)*(r+.04),rotY:facing,bg:null,fg:'#ffffff'};
      K.sign(line===7?'←':'→',{...q,y:y+2.36,w:.56,h:.35});
      K.sign({3:'③',7:'⑦',9:'⑨'}[line],{...q,y:y+1.77,w:.6,h:.64});
      K.sign({3:['대화','오금'],7:['장암','석남'],9:['개화','중앙보훈병원']}[line],{...q,y:y+1.06,w:.55,h:.43});
    }
  }
  function adPanel(f,s,v,y,{wide=false,led=false,theme=0,face=1,along=false}={}) {
    const p=f.at(s,v),rot=p.rot+(along?(face<0?Math.PI:0):face*Math.PI/2),w=wide?3.5:.87,h=2.17;
    box({x:p.x,y:y+.24,z:p.z,w:w+.1,h:h+.1,d:.12,rotY:rot,mat:0x303436});
    const nx=Math.sin(rot),nz=Math.cos(rot),q={x:p.x+nx*.075,z:p.z+nz*.075,rotY:rot};
    const ux=Math.cos(rot),uz=-Math.sin(rot),P=(u,yy)=>[q.x+ux*u,yy,q.z+uz*u];
    K.quad('station-ad-'+(theme%5),[P(-w/2,y+.29),P(w/2,y+.29),P(w/2,y+2.46),P(-w/2,y+2.46)],[nx,0,nz],[[0,1],[1,1],[1,0],[0,0]]);
    if(theme%3===0){
      const copy=led?['Sprite','새로워진 상쾌함!']:['Columbia','깃털급 가벼움','히터급 보온력'];
      K.sign(copy,{...q,y:y+1.48,w:w*.89,h:1.15,bg:null,fg:'#ffffff',offset:.025});
    }
    box({x:p.x+nx*.08,y:y+.3,z:p.z+nz*.08,w:w-.04,h:.035,d:.02,rotY:rot,mat:paint(0xeaf4f5)});
  }
  function adPier(f,s,v,y,line) {
    localBox(f,s,v,y,.82,2.67,.82,0x20272a,true);
    for(const side of [-1,1])adPanel(f,s+side*.43,v,y,{led:true,theme:Math.round(s/9)+(side<0?0:1),face:side,along:true});
    localSign(f,s,v,y+2.52,`${line}호선  ↑`,.78,.23,false,'#2f3336');
  }
  function tactile(f,s0,s1,v,y) {
    for(let s=s0;s<s1;s+=2.4)strip(f,s+Math.min(2.4,s1-s)/2,v,y+.024,.6,Math.min(2.4,s1-s),'station-guide');
  }
  function vending(f,s,v,y) {
    localBox(f,s,v,y,.75,1.83,1.05,0xd2d7d5,true);
    const p=f.at(s,v-.4),rot=p.rot+Math.PI/2;
    sign('음료',p.x,y+1.65,p.z,.95,.24,rot,'#236347');
    for(let r=0;r<4;r++)for(let c=0;c<5;c++){
      localBox(f,s+(c-2)*.16,v-.405,y+.58+r*.21,.035,.14,.095,[0x7ba35d,0xeeeece,0xc76b4b,0x7393ab,0xd8ba57][c]);
    }
    localBox(f,s,v-.42,y+.28,.035,.16,.6,0x25383d);
  }
  function storefront(f,s,v,y,name,kind) {
    // Shallow, open shop fronts abut the concourse; unphotographed interiors
    // stay plain. Product cartons stand in for small cosmetics/stationery.
    localBox(f,s,v+1.45,y,.12,2.9,4.7,0xe3dfd5,true);
    for(const ds of [-2.3,2.3])localBox(f,s+ds,v+.6,y,1.8,2.9,.12,0xbcbcb4,true);
    localBox(f,s,v-.3,y+2.24,.18,.5,4.65,kind==='plant'?0x35563a:0xe8e5dc);
    localSign(f,s,v-.42,y+2.48,name,4.3,.36,true,kind==='plant'?'#36563a':'#e9e8df');
    localBox(f,s,v+.1,y,.6,.85,3.6,kind==='plant'?'wood':0xdfdbcb,true);
    const pal=[0xd6ba9f,0xc7cf9e,0xe5bec8,0x739b8a,0xe9dfbb];
    for(let r=0;r<3;r++){
      localBox(f,s,v+1.25,y+.45+r*.47,.35,.055,4.2,0xb3ac98);
      for(let c=0;c<17;c++)localBox(f,s+(c-8)*.23,v+1.18,y+.51+r*.47,.13,.2+(c%3)*.035,.14,pal[(c+r)%pal.length]);
    }
    if(kind==='plant'){
      for(const ds of [-2.12,2.12]){
        localBox(f,s+ds,v-.4,y,.28,2.7,.36,0x36553b);
        for(let r=0;r<13;r++)localBox(f,s+ds+(r%3-1)*.09,v-.59,y+.1+r*.2,.12,.14,.18,[0x647b46,0x41623d,0x7b8851][r%3]);
      }
      localBox(f,s,v+.36,y+1.62,.035,.035,3.6,'metal');
      for(let c=0;c<11;c++)localBox(f,s+(c-5)*.3,v+.36,y+.98,.08,.57,.26,[0xd3c0a6,0x7b6d67,0x395257,0xa7917e][c%4]);
    }
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
  function gates(f,s,y,n=7,line=7) {
    for(let i=0;i<n;i++){
      const v=(i-(n-1)/2)*1.25,body=line===3?0x73ad45:'metal';
      localBox(f,s,v,y,.55,.35,1.65,'metal',true);
      localBox(f,s,v,y+.35,.55,.65,1.65,body,true);
      localBox(f,s,v,y+.94,.56,.06,1.67,line===3?0x73ad45:0x2f3336);
      localBox(f,s-.45,v,y+1,.25,.065,.3,0x2f87b0);
      for(const side of [-1,1]){
        const p=f.at(s+side*.84,v),rot=p.rot+(side<0?Math.PI:0);
        K.sign('↗',{x:p.x,z:p.z,y:y+.55,w:.25,h:.25,rotY:rot,bg:'#111111',fg:'#9be15a',offset:.025});
      }
      // A small bent handle rises 0.35 m above the cabinet, leaving the lane clear.
      for(const ds of [-.48,.48])localBox(f,s+ds,v,y+1,.04,.23,.04,body);
      let last=null;
      for(let j=0;j<=8;j++){
        const t=Math.PI*j/8,p=f.at(s-.48*Math.cos(t),v),q=[p.x,y+1.23+.12*Math.sin(t),p.z];
        if(last)beam(last,q,.02,body,6);last=q;
      }
      if(i<n-1)localBox(f,s+.06,v+.625,y+.35,.7,.45,.04,'glass');
    }
    hanging(f,s,y,'타는 곳  Tracks',Math.min(9,n*1.25),f.height||2.85,line);
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
    for(let s=2;s<f.length-1;s+=3.6){
      for(const v of [-width*.26,width*.26])if(!insideVoid(f,s,v,roofHoles,1.3))light(f,s,v,y+h-.15,2.4);
      if(opts.tactile!==false&&!insideVoid(f,s,0,holes,1.5))strip(f,s,0,y+.012,.6,Math.min(3.6,f.length-s+1),'station-guide');
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
  const exitSpecs=[
    ['2',55.11,124.19,0,1, [45,150],'경부선 · 신세계백화점'],
    ['7',37.5,131.19,0,1,[37,153],'JW메리어트 · 센트럴시티'],
    ['3',52.11,179.03,0,-1,[45,153],'파미에스테이션 · 센트럴시티'],
    ['4',-130.48,250.07,-.89,.455,[-148,248],'국립중앙도서관 · 누에다리'],
    ['5',-185.64,276.89,.89,-.455,[-174,261],'서래마을 방면'],
    ['6',-195.26,261.52,.89,-.455,[-173,255],'반포대로 방면'],
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
    localBox(b1,s,-5.04,B1+1.225,.035,.55,1.1,'glass');
    const directory=b1.at(s,-5.01);
    K.sign(['신세계백화점 ↑','경부선 터미널 →'],{x:directory.x,z:directory.z,y:B1+1.5,w:1.1,h:.5,rotY:directory.rot-Math.PI/2,bg:null,fg:'#5a4a3a',offset:.025});
    for(const ds of [-.19,.19]){const p=b1.at(s+ds,-4.9);K.cyl({x:p.x,z:p.z,y:B1+.09,r:.1,h:.43,mat:0xc33f29,seg:8,solid:false});localBox(b1,s+ds,-4.9,B1+.52,.14,.055,.12,'metal');}
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
  }
  for(const s of [33,49]){
    const p=b1.at(s,-5.7);
    K.cyl({x:p.x,z:p.z,y:B1,r:.45,h:2.82,mat:'metal',seg:8});
    K.cyl({x:p.x,z:p.z,y:B1,r:.47,h:.1,mat:0x8f9692,seg:8,solid:false});
    localSign(b1,s,0,B1+2.38,'← 고속버스터미널   나가는 곳 ↑',8,.43,false,'#255a9a');
  }
  for(const s of [10,83,180])bench(b1,s,-5.5,B1);
  for(let i=0;i<20;i++){const p=b1.at(8+i*11,(i%3-1)*2.2);K.person(p.x,B1,p.z,{shirt:[0x313e50,0xb3936d,0x575c46][i%3]});}

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
    const width=opts.width||14.8,edge=5.1,roofH=line===9?4.85:3.18;
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
    for(const side of [-1,1]){
      cutSlab(f.poly(side<0?-width:edge,side<0?-edge:width),y,opts.holes||[]);
      lineWall(f,side*width,y,roofH,openings,'station-ceramic');
      // Texture and colour band make the long spaces readable at walking scale.
      for(let s=1.3;s<f.length-1.3;s+=2.55) {
        if(line===9&&s<30)continue;
        strip(f,s,side*5.7,y+.015,.6,2.55,'station-tactile');
        localBox(f,s,side*5.13,y, .12,2.7,2.5,'glass',true);
        for(const ds of [-1.25,0,1.25])localBox(f,s+ds,side*5.13,y,.065,2.72,.065,0x748388);
        localBox(f,s,side*5.13,y+.04,.15,.19,2.5,0x596a73);
        localBox(f,s,side*5.13,y+2.7,.18,.23,2.5,line===3?0xf2f2ee:0x4f626b);
        if(line===3){
          // Photo 12 is Line 3: white station-name fascia over orange doors.
          localBox(f,s,side*5.13,y+2.92,.2,.26,2.5,0xf2f2ee);
          localBox(f,s,side*5.14,y+2.92,.22,.06,2.5,C[3]);
          if(Math.floor(s/2.55)%2===0){
            const q=f.at(s,side*5.26);
            sign('고속터미널  Express Bus Terminal',q.x,y+3.075,q.z,2.3,.16,f.at(s).rot+side*Math.PI/2,'#f2f2ee','#2f3336');
          }
        }else localBox(f,s,side*5.13,y+2.92,.2,.13,2.5,C[line]);
        localBox(f,s,side*5.15,y+1.08,.13,.06,2.48,0xd9dfd9);
        const p=f.at(s,side*5.25);
        if(Math.round(s/2.55)%3===0)sign('발빠짐 주의',p.x,y+.35,p.z,1.7,.2,f.at(s).rot+Math.PI/2,'#efc551','#2f302a');
      }
      for(let s=3.1;s<f.length-3;s+=6.2)for(const row of [8.5,12]){
        if(!insideVoid(f,s,side*row,roofHoles,3.1))light(f,s,side*row,y+roofH-.15,6);
      }
      for(let s=8;s<f.length-5;s+=12.5){
        if(line!==9&&!(line===3&&side===-1&&s>120&&s<140)&&!insideVoid(f,s,side*11.6,opts.roofHoles||[],2))column(f,s,side*11.6,y,line,3.09);
      }
      for(let s=14;s<f.length-6;s+=31){
        const p=f.at(s,side*(width-.15));
        if(clearOfDoors(s,side*(width-.15),4))sign([`${{3:'339',7:'734',9:'923'}[line]}   고속터미널`,({3:'잠원  ←   3호선   →  교대',7:'반포  ←   7호선   →  내방',9:'신반포  ←   9호선   →  사평'})[line]],p.x,y+2.08,p.z,7,1.05,f.at(s).rot+Math.PI/2,line===9?directionBg:CSS[line],directionFg);
        localSign(f,s+6,side*9,y+(line===9?2.75:2.65),line+'호선  '+(side<0?({3:'잠원 방면',7:'반포 방면',9:'사평 방면'})[line]:({3:'교대 방면',7:'내방 방면',9:'신반포 방면'})[line]),5,.43,false,directionBg,directionFg);
        if(clearOfDoors(s+5,side*(width-1.1))&&(line!==7||[75,175].every(c=>Math.abs(s+5-c)>10)))bench(f,s+5,side*(width-1.1),y);
      }
      for(let s=20;s<f.length-10;s+=43){
        const p=f.at(s,side*8.7);K.person(p.x,y,p.z,{shirt:side<0?0x405775:0xb39c7b});
        const q=f.at(s+3.2,side*10.3);K.person(q.x,y,q.z,{shirt:0x363942});
        if(clearOfDoors(s+11,side*(width-1),3)&&(line!==7||[75,175].every(c=>Math.abs(s+11-c)>10)))facilities(f,s+11,side*(width-1),y);
      }
      if(line===3){
        // Photo 15: touching diamond corners plus inset dark tile intersections.
        for(let s=2;s<f.length-2;s+=1.07){
          const p=f.at(s,side*9.4);
          box({x:p.x,z:p.z,y:y+.025,w:.76,h:.013,d:.76,rotY:p.rot+Math.PI/4,mat:0x414849});
          strip(f,s,side*6.25,y+.028,.065,1.07,0x4a9b71);
        }
        for(let s=2.4;s<f.length-2;s+=2.4)for(let v=7.2;v<=14;v+=2.4){
          if(insideVoid(f,s,side*v,opts.roofHoles||[],.4))continue;
          const p=f.at(s,side*v);
          box({x:p.x,z:p.z,y:y+.026,w:.45,h:.012,d:.45,rotY:p.rot+Math.PI/4,mat:0x2f3336});
        }
      }
      for(let s=line===9?39:9;s<f.length-6;s+=9){
        if(clearOfDoors(s,side*7.2,4)&&!insideVoid(f,s,side*7.2,roofHoles,3))adPier(f,s,side*7.2,y,line);
      }
      for(let s=12;s<f.length-5;s+=9.2){
        if(clearOfDoors(s,side*(width-.2),3))adPanel(f,s,side*(width-.2),y,{wide:true,face:side,theme:Math.round(s/9.2)});
      }
      train(f,y,line,line===3?10:line===7?8:6,side);
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
      for(const v of [-12,12]){
        localBox(f,12,v,y+3.85,.55,.35,35,'metal');
        light(f,12,v,y+3.8,34);
        // These cove-edge lights are below the grid: visible metal hangers
        // connect the duct trough to the roof rather than leaving it floating.
        for(const s of [-3,27])localBox(f,s,v,y+4.2,.03,roofH-.08-4.2,.03,'metal');
      }
      tactile(f,-6,28,1.8,y);tactile(f,-6,28,2.55,y);
      localBox(f,27,1.8,y+.024,22,.02,.6,'station-tactile');
      // A folded stainless barrier stays against the side, with a broad aisle.
      for(let s=5;s<17;s+=1.1){
        const p=f.at(s,-11.8),q=f.at(s+1.1,-11.8);
        beam([p.x,y+.18,p.z],[q.x,y+1.04,q.z],.025,0x9ba7a8,6);
        beam([p.x,y+1.04,p.z],[q.x,y+.18,q.z],.025,0x9ba7a8,6);
        localBox(f,s,-11.8,y,.035,1.12,.035,'metal');
      }
      for(const v of [-8,8])column(f,23,v,y,9,3.9);
      hanging(f,24,y,'타는 곳  ←   일반 · 급행   →',10,4.5,9);
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
  platform(l3,B2,3,{width:17,roofHoles:[well3.rect],openings:[{x:-73,z:-27,w:12},{x:-73,z:-85,w:12}]});
  platform(l7,B3,7,{width:14.8,openings:[{x:-126,z:250,w:14},{x:20,z:145,w:18}],roofHoles:lowerCoreVoids});
  platform(l9,B4,9,{width:14.8,openings:[{x:32,z:-132,w:15},{x:-29,z:-100,w:11},{x:-76,z:-82,w:10},{x:-69,z:-85,w:10}]});

  // Line 7's actual B2 concourse sits over its tracks with two distributed cores.
  const b2Holes=lowerCoreVoids;
  const gate7=100;
  const concourse7=hall(l7.points,29.6,B2,{floor:'B2',name:'고속터미널역 7호선 대합실',sub:'734 · 승차권 발매 · 역무실 · 화장실 · 3·9호선 환승',label:'7호선 타는 곳  ↓     3·9호선 환승  →',mat:'station-granite',ads:true,tactile:false,gateStations:[gate7],holes:b2Holes,roofHoles:b1Voids,openings:[{x:20,z:157,w:16,full:true},{x:-122,z:245,w:16,full:true},{x:41,z:150,w:16}]});
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
    if(!insideVoid(concourse7,s,v,[...b2Holes,...b1Voids],2))column(concourse7,s,v,B2,Math.abs(s-gate7)<13?0:7,2.88,Math.abs(s-gate7)<13);
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
    for(let s=s0+2.6;s<s1-2;s+=4.6){
      if(Math.abs(s-(v>0?119:96))<5||(v>0&&[110,132].some(q=>Math.abs(s-q)<3)))continue;
      const outsideAisle=s0===40,side=outsideAisle?1:Math.sign(v);
      adPanel(concourse7,s,v+(outsideAisle?-.17:-Math.sign(v)*.17),B2,{wide:true,face:side,theme:Math.floor(s/4.6)});
    }
  }
  for(const s of [91,107])for(const v of [-8.2,8.2])column(concourse7,s,v,B2,0,2.88,true);
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
    localSign(concourse7,s,s<90?-10:0,B2+2.35,'대화 행 · 당역 도착',1.6,.45,false,'#111111','#ffa531');
  }
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
  K.hpoly('station-marble',rect(-83,-90,-73,-86),B2+.024);
  for(let x=-82.5;x<-74;x+=.8)for(let z=-89.5;z<-86.5;z+=.8)if((Math.round((x+82.5)/.8)+Math.round((z+89.5)/.8))%2===0)box({x,z,y:B2+.028,w:.78,h:.013,d:.78,mat:0x3d4140});
  // Marble jambs and exit-number panels at the shared W3 access, outside its
  // six-metre opening. The yellow 3 in photos 01/06 denotes EXIT 3.
  for(const x of [-84.25,-72.75]){
    box({x,z:-88.8,y:B2,w:2.5,h:3.18,d:.7,mat:'station-marble',solid:true});
    sign(['3','경부선 · 호남선','신세계 · 파미에','←'],x,B2+1.95,-88.35,1.2,.95,0,'#2f3336');
    K.sign('3',{x:x-.35,y:B2+2.18,z:-88.25,w:.5,h:.5,rotY:0,bg:'#f2c324',fg:'#222222'});
    box({x:x+.55,z:-88.32,y:B2+.22,w:.52,h:1.08,d:.18,mat:'metal'});
  }
  box({x:-78.5,z:-88.8,y:B2+2.6,w:9,h:.58,d:.45,mat:'station-panels'});
  for(let x=-82.925,i=0;x<-74;x+=.15,i++)box({x,z:-88.56,y:B2+2.6,w:.15,h:.1,d:.025,mat:i%2?0x222222:0xf2c324});
  sign('호남선 · 경부선 · 영동선 · 사평로  ↑',-78.5,B2+2.94,-88.53,8.5,.3,0,'#f2f2ee','#2f3336');
  // Photo 01's narrow glass-block strip beside the marble wall.
  for(let r=0;r<9;r++)for(let c=0;c<3;c++){
    box({x:-85.3+c*.23,y:B2+.12+r*.27,z:-88.42,w:.215,h:.25,d:.12,mat:'glass'});
    box({x:-85.3+c*.23,y:B2+.12+r*.27,z:-88.34,w:.23,h:.018,d:.025,mat:0xe0e1d8});
  }
  if(!mallHere)sign('3  고속터미널  |  타는 곳 ↓',-79,B1+2.75,-104.7,5.8,.65,0,CSS[3]);
  K.slab(rect(-5,-138,0,-126),B1,{mat:'station-granite'});
  K.hpoly('station-granite',rect(-5,-138,0,-126),B1+.02);
  K.stairs(0,-129.3,30,-129.3,{ya:B1,yb:B4,w:1.8,mat:'darkstone'});
  down(0,-134.4,30,-134.4,B1,B4,1.4);up(0,-132.3,30,-132.3,B1,B4,1.4);
  K.slab(rect(30,-138,40,-124),B4,{mat:'station-granite'});
  sign('⑨  고속터미널  |  타는 곳 ↓',-1.1,B1+2.75,-132,7.3,.65,-Math.PI/2,'#d8d2c4','#3d3f8f');
  // Inclined walls/ceiling around the long W9 well, rather than an opaque lid.
  for(const z of [-136.2,-127.8]){
    K.quad('station-ceramic',[[0,B1,z],[30,B4,z],[30,B4+4.6,z],[0,B1+4.6,z]],[0,0,z<-132?1:-1]);
  }
  K.quad('ceiling',[[0,B1+4.6,-136.2],[30,B4+4.6,-136.2],[30,B4+4.6,-127.8],[0,B1+4.6,-127.8]],[0,-1,0]);
  // The shaft floor is also the enclosed sloping soffit seen from the B4 hall.
  K.quad('station-grid',[[0,B1,-136.2],[30,B4,-136.2],[30,B4,-127.8],[0,B1,-127.8]],[-.5,-1,0],[[0,0],[25,0],[25,7],[0,7]]);
  for(let i=2;i<30;i+=4){box({x:i,y:B1-i/2+3.8,z:-132,w:.3,h:.1,d:6.8,mat:paint(0xf8efdb)});}

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
    sign(['통증을 피하는','유형별 반응'], -83.8,B1+1.53,-105.7,2.6,2.13,0,'#7860b2');
    for(let i=0;i<6;i++)K.person(-87+i*3.4,B1,-112.1+(i%2)*2,{shirt:[0x282c31,0x7c7066,0xc4b6a4][i%3]});
    hall([[-65,-113],[-5,-113],[-5,-132]],5,B1,{floor:'B1',name:'고속터미널역 3·9호선 연결부',sub:'고투몰 · 1·8·8-1·8-2번 출구',label:'1·8·8-1·8-2 출구 → 고투몰',jointFinish:true,ads:true,openings:[{x:-5,z:-132,w:8},{x:-5,z:-121,w:8}]});
    const upper9=hall([[-7,-132],[34,-132]],24,B1,{floor:'B1',name:'고속터미널역 9호선 상층 대합실',sub:'1·8번 출구 · 타원 중층 가장자리 · 긴 에스컬레이터',label:'나가는 곳  ←  8 · 8-1 · 8-2',line:9,mat:'station-granite',h:4.9,holes:[well9.rect],noRoof:true,openings:[{x:-5,z:-120,w:8},{x:34,z:-120,w:7}]});
    for(const [s,v] of [[5,8],[20,9],[34,8],[10,-9],[33,-9]]){
      column(upper9,s,v,B1,0,2.82);localSign(upper9,s,v-.42,B1+1.8,'1 · 8 출구',.7,.45,true,'#e3ba33');
    }
    vending(upper9,35,10.7,B1);
    tactile(upper9,0,39,8,B1);
    localBox(upper9,6,3,B1+.025,10,.02,.6,'station-tactile');
    adPier(upper9,26,9.2,B1,9);
  }
  // The oval balcony is station territory even above the shared mall floor.
  ovalMezzanine(14,-132,B1);
  K.zone({name:'고속터미널역 9호선 타원 대합실',floor:'B1',sub:'타원 중층 가장자리 · 9호선 타는 곳',rect:[-7,-144,34,-120],y0:B1,y1:B1+4.9,priority:5});
  K.spawn({name:'B1 · 9호선 타원 대합실',x:10,y:B1,z:-123,yaw:0});
  sign('9호선 열차 안내  |  일반 · 급행',-26,B1+2.38,-113,7,.43,0,'#d8d2c4','#3d3f8f');

  // 3↔7: a continuous paid passage around the east side of the main complex.
  const transfer=hall([[-79,-27],[40,-27],[40,151]],7,B2,{floor:'B2',name:'고속터미널역 환승통로',sub:'3호선 ↔ 7호선 · 9호선 연결',label:'7호선 갈아타는 곳  ↑    3·9호선  ↓',mat:'station-diagonal',ads:true,openings:[{x:-79,z:-27,w:9},{x:40,z:151,w:12}]});
  for(let s=7,i=0;s<transfer.length-4;s+=5,i++){const p=transfer.at(s,[1.2,2.1,.3][i%3]);K.person(p.x,B2,p.z,{shirt:[0x57554f,0xa0a8ad,0x3d526c,0xb19b87][i%4]});}
  // Two moving walks occupy one side, preserving a full pedestrian aisle.
  for(const ends of [[35,85],[157,212]]){
    const a=transfer.at(ends[0],-1.6),b=transfer.at(ends[1],-1.6);
    K.ramp(a.x,a.z,b.x,b.z,{ya:B2+.03,yb:B2+.03,w:1.4,mat:0x49555c,move:.65,rails:true});
    localSign(transfer,ends[0]-2,-1.6,B2+2.35,'무빙워크  ↑',2.5,.45);
  }
  // The entire 3↔9 flight is outside the south platform wall. Previously its
  // solid step skirts rose through the platform aisle at the B4 spawn.
  hall([[-76,-85],[-65,-85]],7,B2,{floor:'B2',name:'고속터미널역 3·9호선 환승통로',label:'9호선 환승  ↓',openings:[{x:-76,z:-85,w:9},{x:-65,z:-82,w:7,full:true}]});
  K.wall(-71,-81.5,-67,-81.5,B2,B2+4.2,{mat:'station-ceramic'});
  K.wall(-71,-88.5,-67,-88.5,B2,B2+4.2,{mat:'station-ceramic'});
  const t39top=rect(-67,-88.5,-63,-77.5);K.slab(t39top,B2,{mat:'station-granite'});
  K.slab(t39top,B2+4.2,{mat:'concrete',under:'ceiling',walk:false});
  K.wall(-67,-88.5,-67,-77.5,B2,B2+4.2,{mat:'station-ceramic',openings:[{at:3.5,w:7,y0:B2,y1:B2+3.5}]});
  K.wall(-67,-77.5,-63,-77.5,B2,B2+4.2,{mat:'station-ceramic'});
  K.wall(-67,-88.5,-63,-88.5,B2,B2+4.2,{mat:'station-ceramic'});
  // Close the lips outside the 8m incline enclosure without narrowing its runs.
  K.wall(-63,-88.5,-63,-86,B2,B2+4.2,{mat:'station-ceramic'});
  K.wall(-63,-78,-63,-77.5,B2,B2+4.2,{mat:'station-ceramic'});
  K.stairs(-63,-79.5,-33,-79.5,{ya:B2,yb:B4,w:2.0,mat:'darkstone'});
  down(-63,-84.4,-33,-84.4,B2,B4,1.5);up(-63,-82.2,-33,-82.2,B2,B4,1.5);
  K.slab(rect(-34,-87,-25,-77),B4,{mat:'station-granite'});
  K.slab(rect(-34,-87,-25,-77),B4+4.5,{mat:'concrete',under:'ceiling',walk:false});
  K.wall(-34,-77,-25,-77,B4,B4+4.5,{mat:'station-ceramic'});
  hall([[-29,-82],[-29,-103]],8,B4,{label:'9호선 타는 곳  ↑',line:9,openings:[{x:-33,z:-82,w:10,full:true},{x:-29,z:-100,w:12,full:true}]});
  for(const z of [-86,-78])K.quad('station-ceramic',[[-63,B2,z],[-33,B4,z],[-33,B4+3.9,z],[-63,B2+3.9,z]],[0,0,z<-82?1:-1]);
  K.quad('ceiling',[[-63,B2+3.9,-86],[-33,B4+3.9,-86],[-33,B4+3.9,-78],[-63,B2+3.9,-78]],[0,-1,0]);
  for(let i=2;i<30;i+=5)box({x:-63+i,y:B2-i/3+3.5,z:-82,w:.3,h:.08,d:6.5,mat:paint(0xf8efdb)});
  sign('⑨  일반 · 급행  ↓',-64,B2+2.75,-82,7.5,.6,-Math.PI/2,'#d8d2c4','#3d3f8f');
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
  K.spawn({name:'B1 · 고투몰 3호선 입구',x:-79.625,y:B1,z:-109.3,yaw:Math.PI});
  K.spawn({name:'B2 · 3호선 승강장',x:-79,y:B2,z:-151,yaw:0});
  const p2=concourse7.at(105,-4);K.spawn({name:'B2 · 7호선 대합실',x:p2.x,y:B2,z:p2.z,yaw:2.1});
  const p3=l7.at(116,9);K.spawn({name:'B3 · 7호선 곡선 승강장',x:p3.x,y:B3,z:p3.z,yaw:2.34});
  const p4=l9.at(100,-9);K.spawn({name:'B4 · 9호선 승강장',x:p4.x,y:B4,z:p4.z,yaw:1.21});
  const p9=l9.at(22,3);K.spawn({name:'B4 · 9호선 환승 분기홀',x:p9.x,y:B4,z:p9.z,yaw:1.21});
  const pt=transfer.at(45,1.2);K.spawn({name:'B2 · 광고벽 환승통로',x:pt.x,y:B2,z:pt.z,yaw:-Math.PI/2});
}
