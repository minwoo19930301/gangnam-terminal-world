// Camera finishes painted in product UV space. All marks and reflections are original.
import sharp from 'sharp';
import {fileURLToPath} from 'node:url';
const svg=[];
function shape(mark){svg.push(mark);}
function rect(x,y,w,h,c){shape(`<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="${c}"/>`);}
function label(s,x,y,n,c,weight=400){shape(`<text x="${x}" y="${y}" text-anchor="middle" font-family="Helvetica,Arial,sans-serif" font-size="${n}" font-weight="${weight}" fill="${c}">${s}</text>`);}
let seed=1729;
function random(){seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed/4294967296;}
shape(`<svg xmlns="http://www.w3.org/2000/svg" width="1024" height="512" viewBox="0 0 1024 512"><defs>
<radialGradient id="coat" cx=".44" cy=".4"><stop stop-color="#201722"/><stop offset=".45" stop-color="#182329"/><stop offset=".60" stop-color="#293a37"/><stop offset=".71" stop-color="#302837"/><stop offset=".91" stop-color="#11181e"/><stop offset="1" stop-color="#080b10"/></radialGradient>
<linearGradient id="satin"><stop stop-color="#28292b"/><stop offset=".14" stop-color="#4c4e50"/><stop offset=".32" stop-color="#353638"/><stop offset=".50" stop-color="#212225"/><stop offset=".72" stop-color="#404144"/><stop offset=".86" stop-color="#363739"/><stop offset="1" stop-color="#28292b"/></linearGradient>
<radialGradient id="wallwash" cx=".60" cy="-.04" r=".88"><stop stop-color="#89837e"/><stop offset=".58" stop-color="#726e6b"/><stop offset="1" stop-color="#625e5b"/></radialGradient>
<linearGradient id="glint" x2=".8" y2="1"><stop stop-color="#a7c8bb"/><stop offset=".45" stop-color="#7da59c"/><stop offset="1" stop-color="#35454c"/></linearGradient></defs>`);
rect(0,0,1024,512,'#292a2c');
// Full circumference: index line, distance/depth-of-field forks, aperture and focal-length marks.
for(let lens=0;lens<4;lens++){
 const y=lens*64;
 rect(0,y,512,64,'url(#satin)');
 for(let i=0;i<36;i++){const x=i*512/36;rect(x,y+28,1.2,i%3?4:8,'#c1bbb3');}
 for(let i=0;i<16;i++)label(['2.5','4','5.6','8','11','16','22','32'][i%8],(i+.5)*32,y+55,10,'#e5e0d8');
 for(let c of [128,384]){
 label('∞   5   3   2   1.5   1   0.7',c,y+11,10,'#d0a27e');
 for(let i=-3;i<=3;i++)shape(`<path d="M${c+i*5} ${y+16} l${i*2.8} 11" stroke="${i?'#d5d1c9':'#ed813a'}" stroke-width="1.1"/>`);
 }
 rect(0,256+lens*64,512,64,'url(#satin)');
 for(let c of [128,384]){label('HASSELBLAD',c,272+lens*64,10,'#ebe7df',600);label('XCD',c,292+lens*64,12,'#ec8756');label(['38','55','25','90'][lens],c,312+lens*64,22,'#eeeae1');}
}
// Engraved repeating H on the interlocking rubber ring.
rect(512,0,256,128,'#343538');
for(let row=0;row<12;row++)for(let i=-1;i<24;i++){
 const x=516+12*i+row%2*4,y=row*11;
 if(x<514||x>758)continue;
 shape(`<path d="M${x} ${y+9} l3 -8 m3 8 l3 -8 m-7 4 h6" fill="none" stroke="#151619" stroke-width="1.9"/>`);
}
rect(512,128,256,128,'#353537');
for(let i=0;i<4200;i++){
 let x=514+random()*251,y=130+random()*123;
 shape(`<ellipse cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" rx="${(.6+random()*2).toFixed(1)}" ry="${(.4+random()*1.3).toFixed(1)}" fill="${random()>.45?'#47474a':'#232426'}"/>`);
}
// Curved lens face with overlapping diaphragm blades and reflections.
const cx=896,cy=128;
shape(`<circle cx="896" cy="128" r="127" fill="url(#coat)"/>`);
for(let i=0;i<9;i++){
 const point=(a,r)=>[cx+r*Math.cos(a),cy+r*Math.sin(a)].map(v=>v.toFixed(2)).join(',');
 const a=i*2*Math.PI/9;
 shape(`<path d="M${point(a,53)} Q${point(a+.45,70)} ${point(a+.80,77)} L${point(a+.68,48)} L${point(a+.45,32)} Z" fill="${['#30353a','#343640','#313738'][i%3]}" stroke="#25242d" stroke-width="1.4"/>`);
}
for(let [r,col,op] of [[91,'#977294',.35],[94,'#76958e',.38],[108,'#6c8181',.42],[120,'#253039',.8]])
 shape(`<circle cx="896" cy="128" r="${r}" fill="none" stroke="${col}" opacity="${op}" stroke-width="2"/>`);
shape('<path d="M815 112 Q823 47 898 48 Q858 57 844 97 Z" fill="url(#glint)" opacity=".82"/><path d="M913 187 Q956 175 969 144 Q956 193 913 194 Z" fill="#8476a2" opacity=".54"/>');
// LCD, and the recessed top status readout.
rect(512,256,256,128,'#162024');
label('M',535,279,12,'#d9dcdb');label('1/125     f/4.0',638,325,28,'#e1e1d6');label('ISO 100     4622',640,355,12,'#c5ccc7');
rect(512,384,256,128,'#292a2d');label('f/2.5',640,445,39,'#edece3');label('1/125    ISO 100',640,480,20,'#d5d4d0');
// Hood signature and a continuous wall wash across the jointed gray panels.
rect(768,256,256,128,'url(#satin)');
for(const x of [832,960])label('HASSELBLAD',x,327,9.4,'#e8e5de',600);
rect(768,384,256,128,'url(#wallwash)');
for(let i=0;i<2400;i++){
 const x=768+random()*255,y=384+random()*127;
 shape(`<path d="M${x.toFixed(1)} ${y.toFixed(1)} h1.5" stroke="${i%2?'#b7b0a9':'#42413f'}" opacity=".11"/>`);
}
shape('</svg>');
await sharp(Buffer.from(svg.join(''))).png({palette:true,colours:200}).toFile(fileURLToPath(new URL('finishes.png',import.meta.url)));
