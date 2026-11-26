// Original linework for the textiles and window display. Each quadrant is one print.
import sharp from 'sharp';
import {fileURLToPath} from 'node:url';

const ink='#725c56', pink='#df9d9e', gold='#d8b674', sky='#b7d1d5', cream='#fff2db';
const path=(d,fill='none',stroke=ink,width=1.5)=>`<path d="${d}" fill="${fill}" stroke="${stroke}" stroke-width="${width}" stroke-linejoin="round"/>`;
const rect=(x,y,w,h,fill,stroke=ink)=>`<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="${fill}" stroke="${stroke}"/>`;
const circle=(x,y,r,fill)=>`<circle cx="${x}" cy="${y}" r="${r}" fill="${fill}" stroke="${ink}"/>`;
const group=(x,y,s,d)=>`<g transform="translate(${x} ${y}) scale(${s})">${d}</g>`;
function windowUnit(x,y,w,h) {
  return group(x,y,1,path(`M0 ${h}V12 Q${w/2} -9 ${w} 12V${h}Z`,cream)+
    path(`M4 ${h-4}V14 Q${w/2} -1 ${w-4} 14V${h-4}Z`,sky)+
    path(`M${w/2} 8V${h-3} M4 22H${w-4} M4 ${h*.65}H${w-4}`)+
    path(`M4 13Q6 34 ${w*.28} 36L4 ${h-4}Z M${w-4} 13Q${w-6} 34 ${w*.72} 36L${w-4} ${h-4}Z`,pink)+
    rect(-3,h,w+6,4,cream));
}
function mansion(){
  let a=rect(0,0,512,512,'#eadac7');
  a+=path('M-5 92L19 30H493L517 92Z','#a7b5ac');
  for(let x=-8;x<512;x+=13)a+=path(`M${x} 89l20 -57`,'none','#899d96',1);
  for(let floor=0;floor<3;floor++){
    const y=98+floor*123;
    a+=rect(0,y,512,119,['#e9b8af','#f4d9bd','#deb0aa'][floor]);
    for(let i=0;i<7;i++){
      const x=i*75-1;
      a+=rect(x,y,5,116,cream)+windowUnit(x+15,y+17,42,72);
      for(let j=0;j<8;j++)a+=path(`M${x+12+j*7} ${y+106}q-4 -9 0 -16q4 7 0 16`,'none',ink,1.2);
      a+=rect(x+8,y+89,57,3,gold)+rect(x+6,y+106,61,4,cream);
    }
    a+=rect(0,y-4,512,8,cream);
  }
  for(let i=0;i<7;i++)a+=group(17+i*74,37,.68,windowUnit(0,0,42,54));
  a+=path('M201 461V329Q256 247 311 329V461Z',cream)+path('M216 456V334Q256 280 296 334V456Z','#bc8c7e')+path('M255 311v145 M221 353h67 M221 396h67');
  a+=path('M188 326L256 267L323 326Z',cream)+path('M205 320L256 278L307 320Z',gold)+circle(256,305,11,sky);
  return a+rect(0,465,512,47,'#acc3bc')+rect(0,463,512,6,cream);
}
function balloon(x,y,s,c){
  let a=path('M0 -65C-52 -66 -68 -36 -52 -4Q-35 26 -13 50H13Q39 20 52 -4C69 -41 43 -66 0 -65Z',c);
  for(const w of [-34,-15,15,34])a+=path(`M0 -65Q${w*2} -45 ${w} 1L${w*.26} 50`,'none',ink,1.2);
  a+=path('M-52 -7Q-38 9 -27 -4Q-13 11 0 -2Q14 10 28 -4Q41 8 52 -7 M-13 50L-9 75 M13 50L9 75 M0 50V73');
  return group(x,y,s,a+rect(-13,48,26,5,gold)+path('M-13 72H13L9 87H-9Z','#c39768')+path('M-9 76l14 8m-3 -10l-11 9'));
}
function clouds(x,y,s){
  return group(x,y,s,path('M-33 6q0 -8 10 -8q4 -15 17 -9q12 -19 24 -2q18 -2 18 12q12 1 13 7h-86z','#fff9ed','#aea299',1.4));
}
function balloons(){
  let a=rect(0,0,512,512,'#f9eedf');
  for(const [x,y,s,c] of [[78,67,.38,pink],[205,74,.30,gold],[335,74,.38,sky],[435,60,.26,pink],[259,244,1.68,sky],[68,208,.43,gold],[445,243,.49,'#b0c7b7'],[110,337,.41,pink],[64,430,.32,sky],[190,443,.31,gold],[329,435,.42,pink],[443,384,.44,sky]])a+=balloon(x,y,s,c);
  for(const [x,y,s] of [[211,85,.62],[434,101,.85],[88,235,.63],[326,279,.67],[179,403,.74],[442,442,.58]])a+=clouds(x,y,s);
  return a;
}
function carousel(){
 let a=rect(0,0,512,512,'#fcf2e3');
 a+=path('M25 200Q130 174 254 70Q372 168 487 200Z','#e7b2ad');
 for(let j=0;j<9;j++){
   let x=28+j*51;
   a+=path(`M254 70Q${(x+254)/2} 155 ${x} 200H${x+51}Q${(x+51+254)/2} 156 254 70Z`,j%2?cream:sky);
   a+=path(`M${x} 198h51v16q-26 30 -51 0z`,j%2?sky:gold);
 }
 a+=rect(248,48,8,382,gold)+path('M255 48V24q18 -10 38 1q-18 12 -38 5',pink);
 for(let i=0;i<5;i++){
   const x=61+i*94,y=300+(i%2)*26;
   a+=rect(x,223,4,201,gold)+group(x,y,.69,path('M-51 -6q-6 -24 -18 -19q-7 10 2 28q-8 -9 -5 -24q9 -24 25 1q16 -17 40 -7l21 -27l-1 -12l10 6l5 -9l6 11q12 2 18 15l11 7l-5 8l-19 -5l-10 20l-8 13l13 14l-16 24l-6 -4l11 -18l-17 -9l-13 3l-21 30l-8 -3l14 -29q-18 2 -28 -14z',i%2?'#e5bba0':'#f2dfbd')+path('M-25 -20q14 10 25 2l-5 14h-19z',pink)+circle(41,-39,2,ink));
 }
 return a+path('M27 421Q251 455 485 421L471 452Q249 488 41 453Z',sky)+path('M40 451q212 33 432 -1','none',gold,6);
}
function hotelBox(){
  let a=rect(0,0,512,512,'#f2e6ce')+rect(0,0,512,68,'#aba6ac');
  for(const x of [49,209,366])a+=group(x,74,1.6,windowUnit(0,0,64,94));
  for(const x of [47,367])a+=group(x,282,1.54,windowUnit(0,0,66,108));
  a+=path('M185 501V327Q255 224 327 327V501Z',gold)+path('M198 501V330Q255 247 314 330V501Z','#c88776')+path('M255 290v210 M202 352h105 M205 417h101');
  a+=circle(256,320,15,sky)+rect(0,235,512,12,cream)+rect(0,49,512,8,cream);
  for(const x of [5,162,330,495])a+=rect(x,67,8,431,cream);
  return a;
}
const panels=[mansion(),balloons(),carousel(),hotelBox()];
const svg=`<svg xmlns="http://www.w3.org/2000/svg" width="1024" height="1024">${panels.map((p,i)=>`<svg x="${i%2*512}" y="${i>>1?512:0}" width="512" height="512" viewBox="0 0 512 512">${p}</svg>`).join('')}</svg>`;
await sharp(Buffer.from(svg)).jpeg({quality:88,mozjpeg:true}).toFile(fileURLToPath(new URL('prints.jpg', import.meta.url)));
