import { gardenPoint as P, gardenSurface as H, gardenKerb } from './_gardenGrade.js';

export function gardenPaving(K) {
  K.texture('garden-grey-paving',256,256,(g,w,h)=>{
    const rnd=K.rand(205); g.fillStyle='#797772';g.fillRect(0,0,w,h);
    for(let j=0;j<12;j++) for(let i=-1;i<7;i++){
      const x=(i+(j%2)*.5)*w/6,y=j*h/12,c=Math.floor(143+rnd()*34);
      g.fillStyle=`rgb(${c+4},${c+1},${c-4})`;g.fillRect(x+1,y+1,w/6-1.8,h/12-1.8);
    }
  },[2.3,2.3]);
  K.texture('garden-pine-needles',128,96,(g,w,h)=>{
    const r=K.rand(416);g.clearRect(0,0,w,h);
    for(let i=0;i<680;i++){
      g.strokeStyle=['#2c493b','#415842','#526a4a','#324c38'][i%4];
      const x=r()*w,y=r()*h;g.lineWidth=1.4;
      g.beginPath();g.moveTo(x,y);g.lineTo(x+(r()-.5)*11,y-2-r()*7);g.stroke();
    }
  },[1,1],{transparent:true,doubleSide:true});
  K.texture('garden-shrub',128,128,(g,w,h)=>{
    const r=K.rand(614);g.clearRect(0,0,w,h);
    for(let i=0;i<700;i++){
      const x=r()*w,y=r()*h;g.fillStyle=['#6c754c','#797c52','#8d8d5d','#586342'][i%4];
      g.beginPath();g.ellipse(x,y,2+r()*3,1+r()*2,r()*Math.PI,0,2*Math.PI);g.fill();
    }
  },[1,1],{transparent:true,doubleSide:true});
  K.texture('garden-rose-granite',256,128,(g,w,h)=>{
    const rnd=K.rand(874);g.fillStyle='#ad8174';g.fillRect(0,0,w,h);
    for(let j=0;j<6500;j++){
      g.fillStyle=j%2?'#bf9789':'#916d63';g.fillRect(rnd()*w,rnd()*h,rnd()*2.4,rnd()*2.6);
    }
    g.fillStyle='#745850';g.fillRect(0,0,2,h);g.fillRect(0,0,w,1);
  },[1.15,.8]);
}

// January 2026 Naver aCT2 / HB_BMG: paved footway and pink granite along
// the restaurant, interrupted at the signed parking driveway. Coordinates
// are in the same station frame as the mapped service carriageway.
export function buildGardenArrival(K) {
  const rot=Math.atan2(.4448,.89563),east=rot+Math.PI/2;
  const stone='garden-rose-granite', cap=0xb5978a,iron=0x394248,silver=0x9da5a5;
  const vtx=(s,v,y)=>{const [x,z]=P(s,v);return [x,y,z];};
  const box=(s,v,y,w,d,h,mat,solid=false)=>{
    const [x,z]=P(s,v);K.box({x,z,y,w,d,h,rotY:rot,mat,solid});
  };
  const post=(s,v,y,r,h,mat)=>{const [x,z]=P(s,v);K.cyl({x,z,y,r,h,seg:8,mat,solid:false});};
  const sign=(s,v,y,w,h,text,fg,bg,angle=east)=>{
    const [x,z]=P(s,v);K.sign(text,{x,z,y,w,h,rotY:angle,fg,bg,pxPerM:110});
  };
  const ground=(s,v,h=0)=>vtx(s,v,H(s,v)+h);
  function rod(a,b,r,mat) {
    const d=new K.THREE.Vector3(b[0]-a[0],b[1]-a[1],b[2]-a[2]).normalize();
    const ref=Math.abs(d.y)>.9?new K.THREE.Vector3(0,0,1):new K.THREE.Vector3(0,1,0);
    const n=ref.cross(d).normalize(),m=d.clone().cross(n);
    const radial=t=>n.clone().multiplyScalar(Math.cos(t)).addScaledVector(m,Math.sin(t));
    const point=(p,d)=>[p[0]+d.x*r,p[1]+d.y*r,p[2]+d.z*r];
    for(let k=0;k<6;k++){
      const a0=radial(k*Math.PI/3),a1=radial((k+1)*Math.PI/3);
      K.quad(mat,[point(a,a0),point(a,a1),point(b,a1),point(b,a0)],a0.add(a1).normalize().toArray());
    }
  }
  // Tapered bed ends leave both swept turns of OSM 921681575 open.
  for(const [start,end] of [[211,269],[279,371]]){
    for(let s=start;s<end;s+=2){
      const t=Math.min(end,s+2), near=gardenKerb(s)-3.55,far=gardenKerb(t)-3.55;
      const width=u=>Math.min(4,.65+Math.min(u-start,end-u)*.48);
      const a=ground(s,near),b=ground(t,far),c=ground(t,far-width(t)),d=ground(s,near-width(s));
      const top=p=>[p[0],p[1]+.59,p[2]];
      const rim=(p,q)=>{
        const dx=q[0]-p[0],dz=q[2]-p[2],L=Math.hypot(dx,dz);
        const n=[-dz/L,0,dx/L],uv=[[s/1.15,0],[t/1.15,0],[t/1.15,.74],[s/1.15,.74]];
        K.quad(stone,[p,q,top(q),top(p)],n,uv);
        K.quad(stone,[q,p,top(p),top(q)],n.map(x=>-x),[uv[1],uv[0],uv[3],uv[2]]);
        K.phys.addWall(p[0],p[2],q[0],q[2],Math.min(p[1],q[1]),Math.max(p[1],q[1])+.59,.06,'streets');
      };
      rim(a,b);rim(d,c);if(s===start)rim(d,a);if(t===end)rim(b,c);
      K.quad(cap,[top(a),top(b),top(c),top(d)],[0,1,0]);
      const inset=(p,q)=>p.map((n,i)=>n+(q[i]-n)*.045+(i===1?.014:0));
      K.quad({tex:'grass',color:0x9c9765},[inset(top(a),top(d)),inset(top(b),top(c)),inset(top(c),top(b)),inset(top(d),top(a))],[0,1,0]);
    }
  }

  // Low, clipped planting behind the granite cap. Its upper edge breaks up
  // into individual shoots in the roadview, even in winter.
  const plantRand=K.rand(229);
  for(const [start,end] of [[214,265],[283,368]]){
    for(let s=start;s<end;s+=1.05){
      const v=gardenKerb(s)-4.7-plantRand()*.65,[x,z]=P(s,v);
      K.dome({x,z,y:H(s,v)+.66,rx:.69+plantRand()*.36,rz:.58+plantRand()*.24,
        ry:.18+plantRand()*.16,hemi:false,seg:8,rings:3,mat:'garden-shrub'});
    }
  }

  // Three-bar tubular fence along the kerb, ending before the driveway.
  for(const [start,end] of [[229,258],[305,329],[340,375]]) for(let s=start;s+2.5<=end;s+=2.55){
    const t=s+2.4,v=gardenKerb(s)-.33,w=gardenKerb(t)-.33;
    const a=ground(s,v,.12),b=ground(t,w,.12);
    for(const p of [a,b])rod(p,[p[0],p[1]+.88,p[2]],.045,silver);
    for(const y of [.34,.64,.89])rod([a[0],a[1]+y,a[2]],[b[0],b[1]+y,b[2]],.032,silver);
    K.phys.addWall(a[0],a[2],b[0],b[2],Math.min(a[1],b[1])-.1,Math.max(a[1],b[1])+1,.04,'streets');
  }

  // The older twin-lantern posts and flat, spreading pine crowns are a
  // conspicuous silhouette above this low garden in the winter panorama.
  for(const s of [223,247,267,300,322,351,374]){
    const v=gardenKerb(s)-1.05,y=H(s,v)+.11;
    post(s,v,y,.18,.24,iron);post(s,v,y+.2,.085,4.45,iron);
    for(const side of [-1,1]){
      rod(vtx(s,v,y+3.88),vtx(s+.70*side,v,y+3.88),.043,iron);
      rod(vtx(s,v,y+4.08),vtx(s+.70*side,v,y+4.08),.033,iron);
      post(s+.70*side,v,y+3.85,.045,.51,iron);
      const [x,z]=P(s+.70*side,v);
      K.dome({x,z,y:y+4.30,rx:.17,ry:.24,rz:.17,hemi:false,seg:9,rings:5,mat:0xc8cbc0});
      K.dome({x,z,y:y+4.48,rx:.29,ry:.095,rz:.29,hemi:false,seg:12,rings:4,mat:iron});
    }
  }
  for(const s of [219,239,257,289,310,326,345,356,365]){
    const v=gardenKerb(s)-5.65,y=H(s,v)+.52,rnd=K.rand(Math.round(s));
    const height=5.1+rnd()*1.7,lean=(rnd()-.5)*.8,wood=0x645142;
    rod(vtx(s,v,y),vtx(s+lean,v+.16,y+height*.72),.16,wood);
    rod(vtx(s+lean,v+.16,y+height*.72),vtx(s+lean*.5,v,y+height),.085,wood);
    for(let j=0;j<9;j++){
      const angle=(j*2.40)+rnd()*.5;
      const h=height*(.49+.055*j),radius=2.45-.18*j;
      const dx=Math.cos(angle)*radius,dz=Math.sin(angle)*radius;
      rod(vtx(s+lean,v,y+h-.52),vtx(s+dx,v+dz,y+h+.14),.071,wood);
      for(const side of [-1,1]){
        const [x,z]=P(s+dx+side*.46*Math.sin(angle),v+dz-side*.46*Math.cos(angle));
        K.dome({x,z,y:y+h+.55+side*.09,rx:1.15,rz:1.03,ry:.43,hemi:false,seg:7,rings:3,mat:'garden-pine-needles'});
      }
    }
  }

  // View from HB_BMG: a tall narrow P pylon beside the parking status board,
  // the reader island and the guidance stripe that turns into the upper lot.
  const s=267,v=43.55,y=H(s,v);
  box(s,v,y-.12,.45,.84,5.62,0x34363a);
  sign(s+.24,v,y+4.81,.76,.78,'P','#9ac5d7','#34363a');
  for(const off of [1.12,3.65]) post(s,v+off,H(s,v+off)+.08,.09,3.38,iron);
  box(s,v+2.24,y+2.15,.24,3.24,1.46,iron);
  sign(s+.135,v+2.24,y+3.26,3.16,.40,'센트럴시티 주차안내','#e7e5dd','#34383a');
  sign(s+.135,v+2.24,y+2.61,3.14,.85,['P   본관주차장','P   파미에주차장'],'#c8d98a','#272729');
  // Island noses are real kerbs. Sloping the granite and yellow toe caps
  // with the entrance prevents the readers appearing to float.
  for(const [u,w] of [[272.65,45.4],[276.5,40.45]]){
    const poly=[[-.32,-1.05],[-.30,-1.27],[0,-1.43],[.30,-1.27],[.32,-1.05],[.32,1.05],
      [.22,1.25],[-.22,1.25],[-.32,1.05]].map(([ds,dv])=>[u+ds+.42*dv,w+dv]);
    const bottom=poly.map(([s,v])=>ground(s,v,.10)),top=poly.map(([s,v])=>ground(s,v,.25));
    for(let i=0;i<poly.length;i++){
      const j=(i+1)%poly.length, a=bottom[i],b=bottom[j],dx=b[0]-a[0],dz=b[2]-a[2],L=Math.hypot(dx,dz);
      K.quad(i%3?0xc7a953:0x766a58,[a,b,top[j],top[i]],[dz/L,0,-dx/L]);
      if(i>0&&i<poly.length-1)K.quad(0xa7a398,[top[0],top[i],top[j],top[j]],[0,1,0]);
    }
    const h=H(u,w)+.245;
    box(u,w,h,.46,.42,.79,0x4f5052);box(u,w,h+.79,.51,.49,.39,0x394247);
    box(u,w,h+1.18,.54,.51,.09,0xb9a875);sign(u+.265,w,h+1.01,.25,.18,'P','#86ccea','#23323b');
    for(const ds of [-.42,.42]){
      const v=w+ds*1.9,g=H(u+ds,v);
      post(u+ds,v,g+.22,.068,.76,0xd56d41);post(u+ds,v,g+.72,.071,.10,0xe2d8c2);
    }
  }
}

// The same rounded sedan silhouette is visible on the private aisles and
// inside the garage. Keep the body, wheel contact and collision hull together.
export function gardenParkedCar(K, x, z, y, rot, color, owner, grade=0) {
  const c=Math.cos(rot),s=Math.sin(rot);
  const uv=(across,along)=>[x+c*across+s*along,z-s*across+c*along];
  const P=(across,h,along)=>{const [px,pz]=uv(across,along);return [px,y+h+grade*along,pz];};
  const face = (mat, pts) => {
    let world=pts.map(p=>P(...p));
    const a=new K.THREE.Vector3(...world[0]), b=new K.THREE.Vector3(...world[1]), c=new K.THREE.Vector3(...world[2]);
    const n=b.sub(a).cross(c.sub(a)).normalize(), center=new K.THREE.Vector3(...P(0,.8,0));
    const mid=world.reduce((s,p)=>s.add(new K.THREE.Vector3(...p)),new K.THREE.Vector3()).multiplyScalar(.25);
    if(n.dot(mid.sub(center))<0){world=world.reverse();n.negate();}
    K.quad(mat,world,n.toArray());
  };
  const corners=[[-.76,-2.32],[.76,-2.32],[.94,-2.05],[.94,1.95],[.76,2.32],[-.76,2.32],[-.94,1.95],[-.94,-2.05]];
  const hull=corners.map(p=>uv(...p));
  if(grade===0) K.prism(hull,y+.31,y+.88,{mat:color});
  else {
    const roof=corners.map(([x,z])=>[x,.88,z]);
    for(let j=0;j<corners.length;j++){
      const [x,z]=corners[j],[b,c]=corners[(j+1)%corners.length];
      face(color,[[x,.31,z],[b,.31,c],[b,.88,c],[x,.88,z]]);
      if(j>0&&j<corners.length-1)face(color,[roof[0],roof[j],roof[j+1],roof[j+1]]);
    }
    K.phys.addPolyWalls(hull,y-.08,y+1.45,.02,owner);
  }
  const glazing = 0x263d4b;
  face(glazing, [[-.78,.88,-1.55],[.78,.88,-1.55],[.68,1.48,-.88],[-.68,1.48,-.88]]);
  face(glazing, [[.78,.88,1.24],[-.78,.88,1.24],[-.68,1.48,.55],[.68,1.48,.55]]);
  face(color, [[-.68,1.48,-.88],[.68,1.48,-.88],[.68,1.48,.55],[-.68,1.48,.55]]);
  for (const side of [-1, 1]) {
    face(glazing, [[side*.78,.88,-1.55],[side*.78,.88,1.24],[side*.68,1.48,.55],[side*.68,1.48,-.88]]);
    face(color,[[side*.785,.88,-.21],[side*.785,.88,-.12],[side*.685,1.48,-.12],[side*.685,1.48,-.21]]);
    for (const z of [-1.47, 1.47]) for (let j = 0; j < 16; j++) {
      const a0 = Math.PI*2*j/16, a1 = Math.PI*2*(j+1)/16;
      const rim = (x, a, r) => [side*x, .34 + r*Math.sin(a), z + r*Math.cos(a)];
      face(0x191c1f, [rim(.88,a0,.34),rim(1.01,a0,.34),rim(1.01,a1,.34),rim(.88,a1,.34)]);
      face(0x1d2023, [[side*1.012,.34,z],rim(1.012,a0,.34),rim(1.012,a1,.34),[side*1.012,.34,z]]);
      face(0xa4abb0, [[side*1.015,.34,z],rim(1.015,a0,.21),rim(1.015,a1,.21),[side*1.015,.34,z]]);
    }
    for (const z of [-2.325,2.325]) face(z > 0 ? 0xe8e4cb : 0xa62c2a, [[side*.29,.56,z],[side*.7,.56,z],[side*.7,.7,z],[side*.29,.7,z]]);
  }
}
