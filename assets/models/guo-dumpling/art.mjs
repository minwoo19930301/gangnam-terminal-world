import {chromium} from 'playwright';
import {readFile,writeFile} from 'node:fs/promises';
const mark=JSON.parse(await readFile(new URL('./mark.json',import.meta.url)));
const browser=await chromium.launch({headless:true});
try{
  const page=await browser.newPage();const png=await page.evaluate(mark=>{
    const c=document.createElement('canvas');c.width=768;c.height=512;const g=c.getContext('2d');
    const rect=(x,y,w,h,col)=>{g.fillStyle=col;g.fillRect(x,y,w,h)};
    const oval=(x,y,rx,ry,q,col)=>{g.beginPath();g.ellipse(x,y,rx,ry,q,0,Math.PI*2);g.fillStyle=col;g.fill()};
    rect(0,0,768,512,'white');let seed=71926;function rng(){seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed/4294967296}
    function logo(x,y,w,h,ink){g.save();g.translate(x,y);g.scale(w/270,h/300);g.transform(1,-.082,0,1,0,8);g.fillStyle=ink;g.beginPath();for(const ring of mark){ring.forEach(([a,b],i)=>g[i?'lineTo':'moveTo'](a,b));g.closePath()}g.fill('evenodd');g.restore()}
    function text(str,x,y,size,col,font='AppleMyungjo,serif'){g.fillStyle=col;g.font='bold '+size+'px '+font;g.textAlign='center';g.fillText(str,x,y)}
    rect(1,2,490,122,'#252321');logo(19,10,85,102,'#f3e2bd');
    text('GUO',189,71,47,'#f4e9cf','Arial');text('×',268,66,20,'#e6d7b8');
    text('여경래 셰프',381,66,29,'#efe2c7');
    rect(500,2,265,122,'#eee9db');logo(516,13,82,98,'#9b875b');
    text('×',612,66,14,'#957f53');text('여경래 셰프',686,72,17,'#967d4f');
    rect(1,133,336,113,'#f5efdc');text('매일 직접',74,181,20,'#494032');text('빚은 수제만두.',92,206,22,'#4a423b');
    for(let j=0;j<3;j++)for(let k=0;k<3;k++){const x=187+k*57-j*10,y=150+j*38;oval(x,y,18,13,0,'#e8dcbc');for(let a=-1;a<=1;a++){
      g.beginPath();g.moveTo(x,y-9);g.quadraticCurveTo(x+a*8,y-10,x+a*11,y+7);g.strokeStyle='#eee6d0';g.stroke()}}
    rect(347,133,122,113,'#392f35');g.strokeStyle='#bda37a';g.strokeRect(352,137,112,105);logo(386,148,43,66,'#e8ddcc');
    text('여경래 셰프',409,231,10,'#eae0d3');
    rect(480,133,285,113,'#ba9d74');for(let j=0;j<310;j++)rect(482+rng()*252,135+rng()*106,3+rng()*24,.7,'#c9ac80');
    rect(0,258,226,122,'#f2e5c8');rect(236,258,236,122,'#ce9c5c');rect(482,258,278,122,'#e1d7b6');
    for(let j=0;j<1700;j++){oval(3+rng()*218,261+rng()*114,1+rng()*2,1,rng()*2,j%2?'#efe2c9':'#e8dabe');
      oval(239+rng()*227,262+rng()*113,1+rng()*4,.9+rng()*2,rng()*3,['#e1b578','#bb864c','#e6c28d','#a9743b'][j%4]);
      oval(488+rng()*267,262+rng()*114,1+rng()*3,1+rng()*2,rng()*2,['#c1bf8e','#dacdac','#a1a87d','#e9dabe'][j%4]);}
    rect(0,391,370,116,'#303033');for(let j=0;j<660;j++){const x=rng()*365,y=393+rng()*111;oval(x,y,1,.4,rng()*3,j%3?'#484847':'#69645b')}
    rect(380,391,256,116,'#adb0ad');for(let j=0;j<330;j++)rect(381+rng()*231,393+rng()*110,4+rng()*18,.4,j%2?'#c3c5bf':'#a0a29f');
    return c.toDataURL().split(',')[1];},mark);await writeFile(process.argv[2],Buffer.from(png,'base64'));
}finally{await browser.close()}
