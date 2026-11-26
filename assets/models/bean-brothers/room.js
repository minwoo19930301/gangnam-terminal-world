import {mergeGeometries} from 'three/addons/utils/BufferGeometryUtils.js';
import {placeSingleDetail} from '../interior-architecture/single-detail.js';

let silhouette;
function simpleFurniture(T) {
  if (silhouette) return silhouette;
  const pieces=[];
  function box(x,d,y,w,depth,h,tone) {
    const geo=new T.BoxGeometry(w,h,depth).translate(x,y+h/2,d), color=new T.Color(tone);
    const rgb=new Float32Array(geo.attributes.position.count*3);
    for(let i=0;i<rgb.length;i+=3) color.toArray(rgb,i);
    geo.setAttribute('color',new T.BufferAttribute(rgb,3));
    pieces.push(geo);
  }
  box(-1.7,1.69,.08,5.96,1.37,.94,0x303030);
  box(-.85,2.42,.02,.97,.75,3.27,0xe9e8de);
  box(4.21,2.50,.08,4.95,.65,.46,0x3d3938);
  for(const x of [-6.82,-4.75,1.45,6.88]) box(x,.06,0,.14,.10,3.46,0x27282a);
  for(const x of [2.49,3.98,5.47]) {
    box(x,1.83,.69,.65,.64,.05,0xc9bcaa);
    box(x,1.14,.43,.4,.38,.055,0xad8963);
  }
  box(-3.16,1.7,1.0,1.02,.46,.39,0xb5bbba);
  box(-1.89,1.47,1.0,1.29,.45,.22,0xb18e65);
  silhouette=mergeGeometries(pieces);
  pieces.forEach(p=>p.dispose());
  return silhouette;
}

export function beanBrothers(K,{P,RECT,lbox,lwall,lsign,R},s0,t0,s1,t1,y) {
  const width=t1-t0, depth=s1-s0, center=(t0+t1)/2, [x,z]=P(s0,center);
  // Both reference photos show an open corner, thin black columns and a light
  // rear wall. Preserve the modelled public gallery immediately behind this bay.
  for(const t of [t0,t1]) lwall(s0,t,s1,t,y,y+3.43,{mat:0xe9e6de,thick:.09});
  lwall(s1,t0,s1,t1,y,y+3.43,{mat:0xe9e6de,thick:.09});
  K.texture('bean-oak-tile',256,96,(g,w,h)=>{
    const rng=K.rand(203);
    g.fillStyle='#c7b79d';g.fillRect(0,0,w,h);
    for(let i=0;i<180;i++){
      const row=rng()*h, left=rng()*w;
      g.strokeStyle=i%3?'rgba(116,97,74,.08)':'rgba(246,231,204,.20)';
      g.beginPath();g.moveTo(left,row);g.quadraticCurveTo(left+24,row-.6,left+45+rng()*55,row+rng()*.7);g.stroke();
    }
  },[1.12,.36]);
  K.hpoly('bean-oak-tile',RECT(s0,t0,s1,t1),y+.019,true);
  K.hpoly(0xeeeae1,RECT(s0,t0,s1,t1),y+3.4,false);
  // Contact follows the solid island, bench and chair footprints; tables
  // leave a public path from the front to the stools and the seating ends.
  function contact(tx,d,w,dd,h) {
    lbox(s0+d,center+tx,dd,w,y,h,0,{skip:['top','bottom','n','s','e','w']});
  }
  contact(-1.7,1.69,5.96,1.37,1.02);
  contact(-.85,2.42,.97,.75,3.29);
  contact(4.21,2.51,4.94,.65,.54);
  contact(6.47,1.77,.60,.93,.54);
  contact(-5.65,2.04,1.78,.47,1.0);
  for(const tx of [2.49,3.98,5.47]) {
    contact(tx,1.83,.57,.57,.73);
    contact(tx,1.14,.4,.42,.77);
  }
  for(const tx of [-6.82,-4.75,1.45,6.88]) contact(tx,.06,.155,.106,3.46);
  const visibleFrom=(cx,cy,cz)=>{
    if(cy < y-.25 || cy>y+3.58) return false;
    const dx=cx-x,dz=cz-z,d=dx*Math.sin(R)+dz*Math.cos(R),tx=dx*Math.cos(R)-dz*Math.sin(R);
    return d<.16 || (d<depth+.05 && Math.abs(tx)<width/2+.06);
  };
  K.detail({name:'빈브라더스',floor:'2F',poly:RECT(s0,t0,s1,t1),y0:y,y1:y+3.45,visibleFrom},()=>{
    const T=K.THREE;
    const finish=new T.MeshLambertMaterial({vertexColors:true});
    placeSingleDetail(K,{name:'빈브라더스 · FP203 커피바와 좌석',file:'../bean-brothers/fp203.glb',
      at:[x,y,z],angle:R,fallback:simpleFurniture(T),fallbackMaterial:finish,material:finish,
      range:21,exitRange:25,floorTolerance:2.55,eyeHeight:1.4});
    lsign('BEAN BROTHERS',s0+1.996,center-.85,y+1.891,.405,.083,'N',
      {fg:'#e9e4d7',bg:null,pxPerM:375});
    for(const dd of [1.248,1.694]) {
      lbox(s0+dd,center-1.89,.008,1.29,y+1.054,.388,'glass',{solid:false,skip:['top','bottom']});
    }
  });
}
