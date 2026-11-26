// The visible Gangnam customer directory has a pale rounded face and two columns.
// Use the current store guide for floor names, retaining only public shopping levels.
export function printDirectory(g,w,h){
  const rows=[
    [['11','전문식당가','S GARDEN'],['10','리틀 신세계','아동 · 유아 · 란제리'],['9','가구 · 홈패션','가전 · 키친웨어'],['8','뉴스트리트 · 베이직 스포츠','스포츠 · 아웃도어'],['7','골프 · 남성 정장','남성 캐주얼 · 컨템포러리'],['6','남성 부티크','']],
    [['5','여성 클래식','뉴 컨템포러리 · 핸드백'],['4','해외 컨템포러리','슈즈'],['3','인터내셔널 디자이너','럭셔리 워치 · 주얼리'],['2','해외유명브랜드',''],['1M','액세서리 · 여행','식음료'],['1','화장품 · 잡화','해외유명브랜드'],['B1','신세계 마켓','스위트 파크']]
  ];
  g.save();g.scale(w/1024,h/1024);
  g.fillStyle='#eae8e1';g.fillRect(0,0,1024,1024);
  // Geometry samples these edge swatches in its otherwise unused atlas margin.
  g.fillStyle='#464842';g.fillRect(1004,0,10,1024);
  g.fillStyle='#b8b8ad';g.fillRect(1014,0,10,1024);
  g.fillStyle='#373a36';g.textAlign='left';g.textBaseline='middle';
  g.font='bold 99px Arial, sans-serif';g.fillText('8F',35,99);
  g.font='bold 60px sans-serif';g.fillText('뉴스트리트',222,83);
  g.font='31px Arial, sans-serif';g.fillText('NEW STREET',224,146);
  g.fillRect(35,201,925,4);g.font='bold 31px sans-serif';g.fillText('백화점 층별 안내',35,246);
  g.font='24px Arial, sans-serif';g.fillText('FLOOR GUIDE',313,246);
  rows.forEach((col,j)=>col.forEach(([n,first,second],i)=>{
    const x=33+j*478,y=294+i*96,active=n==='8';
    if(active){g.fillStyle='#474a44';g.fillRect(x-4,y-3,446,91);}
    g.fillStyle=active?'#fffdf4':'#353832';g.font='bold 43px Arial, sans-serif';g.fillText(n,x+8,y+44);
    g.font='bold 26px sans-serif';g.fillText(first,x+91,y+(second?30:47),341);
    if(second){g.font='23px sans-serif';g.fillText(second,x+91,y+68,341);}
    if(!active){g.fillStyle='#b7b7ab';g.fillRect(x,y+89,442,1.5);}
  }));
  // Dedicated UV strip for the bank's folded steel and the floor indicator.
  ['#42443f','#989688','#55574f','#c6c4b6','#77786e','#41423e'].forEach((color,i)=>{
    g.fillStyle=color;g.fillRect(981+i*7,0,7,1024);
  });
  g.fillStyle='#191b19';g.fillRect(642,970,329,52);
  g.fillStyle='#ff6d42';g.font='bold 42px Arial, sans-serif';g.textAlign='center';g.fillText('8',833,996);
  g.restore();
}
