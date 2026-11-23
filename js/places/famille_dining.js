// Local x runs to the right as seen from the arcade, z goes into the restaurant.
// The same furnishings can face either side or open onto a cross aisle.
export function diningRoom(K, front, yaw, w, d, level = 0, shopID = 0) {
  const sin = Math.sin(yaw), cos = Math.cos(yaw);
  const point = (x, z) => [front[0] + x*cos - z*sin, front[1] - x*sin - z*cos];
  const box = (x,z,y,width,depth,height,mat,solid=false) => {
    const [wx,wz] = point(x,z);
    K.box({x:wx,z:wz,y:level+y,w:width,d:depth,h:height,rotY:yaw,mat,solid});
  };
  const cyl = (x,z,y,r,h,mat) => {
    const [wx,wz] = point(x,z);
    K.cyl({x:wx,z:wz,y:level+y,r,h,mat,seg:12,solid:false});
  };
  const sphere = (x,z,y,rx,ry,rz,mat) => {
    const [wx,wz] = point(x,z);
    K.dome({x:wx,z:wz,y:level+y,rx,ry,rz,mat,seg:10,rings:6,hemi:false});
  };
  const sign = (text,x,z,y,width,height,opts={}) => {
    const [wx,wz] = point(x,z);
    K.sign(text,{x:wx,z:wz,y:level+y,w:width,h:height,rotY:yaw,bg:null,fg:'#ffffff',...opts});
  };
  const person = (x,z,facing=1,opts={}) => {
    const [wx,wz] = point(x,z);
    K.person(wx,level,wz,{rotY:facing>0?yaw+Math.PI:yaw,...opts});
  };
  let seatIndex=0;
  const seat = (x,z,facing=1,color=0x715842) => {
    for (const dx of [-.15,.15]) for (const dz of [-.15,.15]) box(x+dx,z+dz,0,.04,.04,.44,color);
    box(x,z,.43,.43,.43,.075,color);
    box(x,z-facing*.195,.50,.42,.055,.35,color);
    const index=seatIndex++ + shopID;
    if(shopID && index%5===0) person(x,z,facing,{sit:true,shirt:[0x586a63,0x414f61,0xc1ac95,0x795a50][Math.floor(index/5)%4]});
  };
  const table = (x,z,width=.8,depth=.68,finish=0xaa8664) => {
    box(x,z,.70,width,depth,.075,finish);
    for (const dx of [-1,1]) for (const dz of [-1,1]) box(x+dx*(width/2-.09),z+dz*(depth/2-.08),0,.055,.055,.70,0x423b33);
  };
  const poly = [point(-w/2,0),point(w/2,0),point(w/2,d),point(-w/2,d)];
  return {w,d,poly,box,cyl,sphere,sign,seat,table,person,texture:K.texture};
}
