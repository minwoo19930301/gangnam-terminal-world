// The fixed public hotel shell is in metres. Parts are oriented like a seated guest looking along +d.
export const parts = {
  sushi: ['편백 상판과 흰 부조 벽', 6.7, 2.20, 3.28],
  teppan: ['철판과 청동 후드', 3.66, 2.60, 3.22],
  tea: ['차 화로와 찻장', 3.84, 1.75, 3.03],
  chair: ['아이보리 곡면 암체어', .55, .55, .84],
  teaChair: ['나무 차 의자', .46, .49, .83],
  setting: ['접은 냅킨과 젓가락', .48, .29, .09],
  sushiDish: ['니기리와 성게 군함 접시', .40, .19, .08],
  teppanDish: ['구운 한우와 아스파라거스', .27, .19, .06],
  teaSet: ['말차와 주전자 차 도구', .79, .33, .23],
};
export const centers = {sushi:[21.35,52.32,0],teppan:[19.81,47.03,0],tea:[24.40,46.05,Math.PI/2]};
export const furniture = [];
function part(key,bar,x,d,h=0,turn=0) {
  const [u,v,r]=centers[bar],c=Math.cos(r),s=Math.sin(r);
  furniture.push({key,bar,u:u+x*c+d*s,v:v-x*s+d*c,h,turn:r+turn});
}
part('sushi','sushi',0,0);
part('teppan','teppan',0,0);
part('tea','tea',0,0);
for(const x of [-2.84,-2.03,-1.22,-.41,.41,1.22,2.03,2.84]){
  part('chair','sushi',x,-.85);
  part('setting','sushi',x,-.21,.827);
}
for(const x of [-1.23,-.41,.41,1.23]){
  part('chair','teppan',x,-1.22);
  part('setting','teppan',x,-.67,.804);
}
for(const side of [-1,1])for(const d of [-.15,.61]){
  part('chair','teppan',side*2.08,d,0,-side*Math.PI/2);
  part('setting','teppan',side*1.56,d,.804,-side*Math.PI/2);
}
for(const x of [-1.54,-.92,-.31,.31,.92,1.54]){
  part('teaChair','tea',x,-.74);
}
part('sushiDish','sushi',-.41,.04,.829);
part('sushiDish','sushi',2.03,.04,.829);
part('teppanDish','teppan',.41,-.49,.806);
part('teaSet','tea',-.44,-.13,.813);

parts.floor=['돌 타일과 접촉 그림자',10.40,12.38,.026];
furniture.push({key:'floor',bar:'floor',u:22.24,v:49.24,h:0,turn:0});

parts.entry=['황동 현관과 계절 화병',6.60,1.10,3.06];
furniture.push({key:'entry',bar:'entry',u:20.50,v:43,h:0,turn:0});

parts.room=['낮춘 반자와 서쪽 목재 벽',10.40,12.38,3.40];
furniture.push({key:'room',bar:'room',u:22.24,v:49.24,h:0,turn:0});
