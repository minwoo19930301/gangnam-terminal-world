// A straight walkable grade with retaining faces down to the local street datum.
export function gradedGround(K, a, b, ya, yb, width, mat) {
  const dx=b[0]-a[0], dz=b[1]-a[1], length=Math.hypot(dx,dz);
  const nx=-dz/length, nz=dx/length;
  K.ramp(...a,...b,{ya,yb,w:width,mat,rails:false});
  for(const side of [-1,1]){
    const offset=side*width/2;
    const ax=a[0]+nx*offset, az=a[1]+nz*offset;
    const bx=b[0]+nx*offset, bz=b[1]+nz*offset;
    K.quad('concrete',[[ax,-.08,az],[bx,-.08,bz],[bx,yb,bz],[ax,ya,az]],[side*nx,0,side*nz]);
    const count=Math.max(1,Math.ceil(Math.abs(yb-ya)/.3));
    for(let i=0;i<count;i++){
      const t=i/count, end=(i+1)/count;
      K.phys.addWall(ax+dx*t,az+dz*t,ax+dx*end,az+dz*end,-.08,ya+(yb-ya)*(t+end)/2,.05);
    }
  }
}
