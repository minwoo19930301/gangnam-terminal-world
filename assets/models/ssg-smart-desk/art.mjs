// All graphics are drawn locally. Pixel rectangles are shared with build.py.
import sharp from 'sharp';
import {fileURLToPath} from 'node:url';
const defs = [], shapes = [];
function gradient(id, colors, x2='100%', y2='100%') {
  defs.push(`<linearGradient id="${id}" x2="${x2}" y2="${y2}">${colors.map(([p,c])=>`<stop offset="${p}%" stop-color="${c}"/>`).join('')}</linearGradient>`);
}
function panel(x,y,w,h,bg,markup) {
  shapes.push(`<svg x="${x}" y="${y}" width="${w}" height="${h}" viewBox="0 0 512 320"><rect width="512" height="320" fill="${bg}"/>${markup}</svg>`);
}
function text(x,y,size,str,color='#272629',weight=500) {
  return `<text x="${x}" y="${y}" font-family="Arial, Apple SD Gothic Neo, sans-serif" font-weight="${weight}" font-size="${size}" fill="${color}">${str}</text>`;
}
gradient('violet',[[0,'#05060c'],[29,'#241331'],[46,'#7436b4'],[57,'#de83fd'],[62,'#fdf1fe'],[68,'#4c2785'],[100,'#080a17']],'100%','12%');
gradient('blue',[[0,'#030510'],[34,'#111239'],[50,'#494bd3'],[57,'#add9ff'],[62,'#3354d6'],[95,'#0c081a']],'8%','100%');
gradient('sun',[[0,'#7ce6e2'],[25,'#f5d642'],[62,'#ff8a12'],[94,'#930e38']]);
gradient('fan',[[0,'#331338'],[14,'#a11b36'],[45,'#fa6224'],[73,'#ffc33b'],[100,'#ffeb89']]);
panel(0,0,512,320,'#080913',`<path d="M-45 -60 H256 V181 Q256 200 241 200 H-45Z" fill="url(#violet)"/><path d="M274 -40 H600 V107 H293 Q274 107 274 91Z" fill="url(#blue)"/><path d="M-50 224 H238 V361 H-50Z" fill="url(#blue)"/><path d="M280 127 H575 V329 H266 V152 Q266 127 280 127Z" fill="url(#violet)"/>${text(164,168,22,'MacBook Pro','#fff')}`);
panel(512,0,512,320,'url(#sun)',`<path d="M320 324 Q137 233 -22 35 Q93 61 282 206 Q212 37 179 -34 Q381 32 377 227 Q418 88 555 43 L540 327Z" fill="url(#fan)"/>${text(179,168,23,'MacBook Air','#fff')}`);
panel(0,320,512,320,'#b4e1f2',`<path d="M-38 -24 Q155 82 336 354 M43 -23 Q240 139 398 326 M130 344 Q270 221 535 -8" stroke="#7ccfdc" stroke-width="15" fill="none"/><path d="M-25 -43 L317 345 M177 350 L550 -12" stroke="#edf9fa" stroke-width="6"/>`);
panel(512,320,512,320,'#faf6ef',text(25,64,37,'MacBook Air',undefined,700)+text(26,102,21,'노트북 체험')+'<rect x="26" y="130" width="170" height="117" rx="9" fill="url(#sun)"/><path d="M24 249h175l15 8H11z" fill="#a6a6a6"/>'+text(223,163,17,'디스플레이')+text(223,196,17,'키보드와 트랙패드')+text(223,229,17,'직접 체험해 보세요'));
let bands='';
gradient('foil',[[0,'#422a1f'],[26,'#c5842e'],[49,'#fff0ae'],[63,'#9d6839'],[87,'#221e22']]);
for(let i=0;i<11;i++){
  const x=68+i*32;
  bands+=`<path d="M${x} 111 Q${x+28} 143 397 208 Q${x+12} 158 ${x-1} 123Z" fill="url(#foil)"/>`;
}
panel(0,640,512,320,'#f5f5f5',text(141,72,33,'MacBook Air',undefined,600)+'<path d="M53 104 L429 104 L460 218 L112 218Z" fill="#252526"/><path d="M59 109 L425 109 L452 212 L116 212Z" fill="#e7cf9a"/>'+bands+'<path d="M112 220h348l-98 23H31Z" fill="#aa9c89"/><path d="M30 243h332l99-23-7 6-89 22H33Z" fill="#60584e"/>');
let grain='';
for(let i=0;i<290;i++){const y=(i*37.73)%320,x=(i*83.12)%590-60;grain+=`<path d="M${x} ${y} q48 -2 108 0 t120 0" stroke="${i%2?'#f7e6ce':'#bda287'}" opacity=".26" stroke-width=".9" fill="none"/>`;}
panel(512,640,512,320,'#e1c8ac',grain);
const rows=[
  ['esc','☀','☼','▦','⌕','♩','☾','◀','▷','▶','◁','−','+','●'],
  ['±','1','2','3','4','5','6','7','8','9','0','−','=','⌫'],
  ['⇥','Q','W','E','R','T','Y','U','I','O','P','[',']','∖'],
  ['⇪','A','S','D','F','G','H','J','K','L',';',"'","↵"],
  ['⇧','Z','X','C','V','B','N','M',',','.','/','⇧'],
  ['fn','⌃','⌥','⌘','','⌘','⌥','◀','↕','▶']
];
for(const [variant,background,fg] of [[0,'#222225','#e8e9eb'],[1,'#f4f3ef','#5e5e5d']]){
  let keyFaces='';
  for(const [r,row] of rows.entries()){
    const widths=row.map((_,i)=>r===5&&i===4?5.4:(r===4&&(i===0||i===row.length-1)?1.7:1));
    const total=widths.reduce((a,b)=>a+b,0);
    let left=0;
    row.forEach((label,i)=>{
      const w=512*widths[i]/total;
      keyFaces+=text(left+w*.35,(r+.61)*320/6,r===0?11:13,label,fg);
      left+=w;
    });
  }
  panel(variant*512,960,512,320,background,keyFaces);
}
for(const [slot,label,fill] of [[0,'MacBook Pro','url(#violet)'],[1,'iMac','url(#blue)']]){
  panel(slot*512,1280,512,320,'#faf8f3',text(25,64,37,label,undefined,700)+text(26,105,21,'제품 체험')+`<rect x="26" y="134" width="170" height="106" rx="7" fill="${fill}"/><path d="M24 243h175l15 8H11z" fill="#a6a6a6"/>`+text(223,163,17,'디스플레이')+text(223,196,17,'키보드')+text(223,229,17,'직접 체험해 보세요'));
}
const path=fileURLToPath(new URL('graphics.jpg',import.meta.url));
await sharp(Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="1024" height="1600"><defs>${defs.join('')}</defs>${shapes.join('')}</svg>`)).jpeg({quality:88,chromaSubsampling:'4:4:4'}).toFile(path);
