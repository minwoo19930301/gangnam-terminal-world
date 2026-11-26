// The grey enamel sign above the main-building escalator in AD Gangnam, p. 91.
export function paintDirectory(g,w,h){
  const gradient=g.createLinearGradient(0,0,w,h);
  gradient.addColorStop(0,'#827d76');gradient.addColorStop(.55,'#8b8378');gradient.addColorStop(1,'#736e68');
  g.fillStyle=gradient;g.fillRect(0,0,w,h);
  g.strokeStyle='#fff9ee';g.lineWidth=12;g.lineJoin='miter';
  g.beginPath();g.moveTo(55,133);g.lineTo(91,93);g.lineTo(127,133);g.stroke();
  const font='"Apple SD Gothic Neo","Malgun Gothic",sans-serif';
  g.fillStyle='#fffcf3';g.textBaseline='middle';
  g.font='600 122px '+font;g.fillText('2',152,118);
  g.font='600 66px '+font;g.fillText('혼수',293,88);g.fillText('홈패션',510,88);
  g.fillRect(461,55,3,71);
  g.font='500 23px '+font;g.fillText('MARRIAGE SUPPLIES  |  HOME FASHION',296,158);
  g.beginPath();g.arc(870,101,69,0,Math.PI*2);g.fill();
  g.fillStyle='#645f57';g.font='600 48px '+font;g.textAlign='center';g.fillText('2·4F',870,105);
  for(const [i,color] of ['#78756e','#a49e92','#4e4e4a','#c4bdaf'].entries()){
    g.fillStyle=color;g.fillRect(988,18+55*i,30,28);
  }
}
