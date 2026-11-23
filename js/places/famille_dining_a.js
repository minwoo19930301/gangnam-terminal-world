const walnut = 0x634431;
const oak = 0xb98451;
const porcelain = 0xf5efe5;
const iron = 0x302e2b;
const metal = 0xabaead;

export function buildFourb(s) {
  // The operator's interior photo shows the oak coffee bar under a shallow
  // red-brick arch. The tall cream pier with the red FOURB graphic is on its right.
  const cz=s.d*.77, counterX=-.52, counterW=s.w*.70;
  const counterWood={tex:'wood',color:0xc59865}, brick='ccHallBrick';
  const halfSpan=counterW/2+.07, spring=2.12, crown=3.62, cornice=3.91;
  const front=cz-.51;
  for(const side of [-1,1])
    s.box(counterX+side*(halfSpan+.14),front,0,.28,.48,cornice,brick,true);
  // Each narrow upright fills the spandrel from the arch up to the lintel.
  // Equal angular intervals keep its silhouette smooth where the curve turns.
  for(let i=0;i<56;i++){
    const a=Math.PI*i/56,b=Math.PI*(i+1)/56;
    const x=(Math.cos(a)+Math.cos(b))*halfSpan/2;
    const underside=spring+(crown-spring)*Math.sin((a+b)/2);
    const width=(Math.cos(a)-Math.cos(b))*halfSpan;
    s.box(counterX+x,front,underside,width+.002,.48,cornice-underside,brick);
  }
  s.box(counterX,front,cornice,counterW+.71,.54,.095,0xc8bba7);
  s.box(counterX,cz,0,counterW,.96,.10,0x645744,true);
  s.box(counterX,cz,.10,counterW,.96,.91,counterWood,true);
  for(const y of [.38,.67])
    s.box(counterX,cz-.486,y,counterW,.013,.012,0x96744c);
  s.box(counterX,cz,1.01,counterW+.06,1.01,.058,0xd3c5aa);
  const back=cz+1.62, plaster=0xe9ddc6;
  s.box(counterX,back+.12,0,counterW+.48,.2,3.74,plaster,true);
  const left=counterX-halfSpan-.14,right=counterX+halfSpan+.14;
  s.box(left,(back+front)/2,0,.28,back-front,3.74,plaster,true);
  s.box(right,front+.31,0,.28,.62,3.74,plaster,true);
  s.box(right,back-.14,0,.28,.28,3.74,plaster,true);
  s.box(right,(back+front)/2,2.17,.28,back-front,1.57,plaster);
  s.box(counterX,(back+front)/2,3.74,counterW+.69,back-front+.28,.13,plaster);
  for(const x of [-1.80,-.55,.70])s.cyl(x,cz+.28,3.727,.08,.017,{tex:'emit',color:0xffe4ac});
  s.box(counterX,cz+1.39,0,counterW,.5,.9,0xe4ddcc,true);
  // White suspended letters face north toward the arcade with this room's yaw.
  for(const x of [-.89,.89])
    s.box(counterX+x,front-.01,3.05,.016,.016,.56,0xaca496);
  s.sign('F O U R B',counterX,front-.025,2.90,2.50,.48,
    {fg:'#fffdf0',twoSided:true,bold:true,pxPerM:150});
  const pierX=s.w*.39, panelZ=front-.26;
  s.box(pierX,front,0,1.42,.48,4.12,0xece7da,true);
  for(let i=0;i<28;i++){
    const u=(i+.5)/28*2-1,x=pierX+u*.651;
    const top=1.77+.18*Math.sqrt(1-u*u),base=.78+.19*Math.sqrt(1-u*u);
    s.box(x,panelZ,.13,1.302/28+.001,.022,base-.13,0xac8053);
    s.box(x,panelZ,base,1.302/28+.001,.022,top-base,0xba2532);
  }
  s.sign('F O U R B',pierX,panelZ-.021,1.47,1.20,.26,{fg:'#fff8ee',bold:true,pxPerM:150});
  s.sign('G A N G N A M',pierX,panelZ-.021,.62,1.10,.13,{fg:'#ffedd2',pxPerM:160});
  // Coffee machine, hopper grinders and the low glass case share the countertop.
  s.box(-.35,cz+.04,1.07,.70,.48,.36,0x555653);
  s.box(-.35,cz-.20,1.20,.65,.09,.16,metal);
  for(const x of [-.53,-.20])s.cyl(x,cz-.27,1.07,.061,.09,porcelain);
  for(const x of [.29,.52]){
    s.cyl(x,cz+.10,1.07,.083,.21,0x41403b);
    s.cyl(x,cz+.10,1.28,.1,.15,0x775e45);
    s.cyl(x,cz+.10,1.43,.093,.025,iron);
  }
  s.box(-1.95,cz+.05,1.07,1.66,.65,.34,'glass');
  for(let k=0;k<8;k++){
    const x=-2.55+(k%4)*.39,z=cz-.13+Math.floor(k/4)*.23;
    s.cyl(x,z,1.074,.115,.064,[0xb56e2f,0xd09147,0xb07a46][k%3]);
    s.cyl(x,z,1.139,.031,.005,0x764b32);
  }
  s.box(1.54,cz,1.07,.37,.32,.22,0x363834);
  s.person(1.00,cz+.85,1,{shirt:0x414c46});
  // Large round communal table and branches in its central vase.
  const r = Math.min(s.w*.15, s.d*.16, 1.30), tz=s.d*.40;
  s.cyl(0, tz, 0, r*.22, .72, walnut);
  s.cyl(0, tz, .72, r, .075, oak);
  s.cyl(0, tz, .795, .10, .31, 0xd5cdb6);
  s.cyl(0, tz, 1.10, .029, .69, 0x846745);
  for (const [dx,dz,h] of [[-.14,.05,1.54],[.16,.07,1.66],[.01,-.12,1.85]]) {
    s.sphere(dx, tz+dz, h, .21,.21,.16,0x69824c);
  }
  for (const dir of [-1,1]) s.seat(0, tz + dir*(r+.26), -dir, oak);
  for (const side of [-1,1]) {
    const x = side*s.w*.36;
    s.table(x, tz, .78, .64, oak);
    s.seat(x, tz-.52, 1, oak);
    s.seat(x,tz+.52,-1,oak);
  }
}
