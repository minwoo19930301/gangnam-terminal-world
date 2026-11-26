// Counter contour in native Blender metres, with positive Y into the shop.
export const counterOutline=[[2.86,.64],[2.86,1.55],[-1.60,1.55],[-1.79,1.63],[-1.90,1.83],
  [-1.90,4.48],[-2.88,4.48],[-2.88,1.44]];
for(let i=1;i<=12;i++){
  const a=Math.PI+i*Math.PI/24;
  counterOutline.push([-2.08+.80*Math.cos(a),1.44+.80*Math.sin(a)]);
}
