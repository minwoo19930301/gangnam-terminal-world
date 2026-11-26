import fs from 'node:fs/promises';
import path from 'node:path';
import sharp from 'sharp';

const out=process.argv[2], width=1280, height=1024;
const wrap=(w,h,g)=>`<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}">${g}</svg>`;
const txt=(x,y,word,size,fill,weight=650,more='')=>`<text x="${x}" y="${y}" font-family="Helvetica Neue,Helvetica,sans-serif" font-size="${size}" font-weight="${weight}" fill="${fill}" ${more}>${word}</text>`;
const rect=(x,y,w,h,color,rx=0)=>`<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${rx}" fill="${color}"/>`;
const sw=(d,col,w)=>`<path d="${d}" fill="none" stroke="${col}" stroke-width="${w}" stroke-linejoin="round" stroke-linecap="round"/>`;
const circle=(x,y,r,color)=>`<circle cx="${x}" cy="${y}" r="${r}" fill="${color}"/>`;
const road=(d,w=46)=>sw(d,'#ebdcab',w+9)+sw(d,'#c0bbac',w+4)+sw(d,'#d2cec3',w)+`<path d="${d}" fill="none" stroke="#f6f0d4" stroke-width="3.6" stroke-dasharray="17 17"/>`;
function crossing(x,y,angle){
 return `<g transform="translate(${x} ${y}) rotate(${angle})">${Array.from({length:7},(_,i)=>rect(-19+i*6,-13,3,26,'#f5efd8')).join('')}</g>`;
}
const ground=wrap(1280,544,rect(0,0,1280,544,'#7cb955')+
 '<path d="M0 0h1280v67c-141-13-246 37-424 24S364 35 176 119L0 147z" fill="#e6e37c"/>'+
 '<path d="M0 359c142 51 237-12 364-13s278 66 399 45 289-72 517-35v188H0z" fill="#d8d985"/>'+
 '<path d="M0 482c124-18 190 5 264-32s118-77 195-88 124 19 163 52 117 24 177-2 242-82 354-54 127 14 127 14v32c-94 2-145-27-236-22s-133 35-205 64-141 42-201 10-94-64-172-52-138 68-212 90S79 522 0 523z" fill="#66bad5"/>'+
 '<path d="M109 95c104-40 160-21 211 4l-30 38c-68-22-107-30-168 6zM599 118l171-24 54 44-172 27zM831 303q147-83 268-31l-32 65q-119-29-218 17z" fill="#4b9b53"/>'+
 road('M-20 222C223 242 297 343 475 301L728 190C798 160 922 163 1310 212')+
 road('M467 -40C486 88 438 138 492 237L658 537',39)+road('M1098 -22C1089 113 1145 193 1045 278S957 434 997 573',35)+
 road('M-18 384C150 399 178 349 249 335L439 300',28)+crossing(488,275,-26)+crossing(729,188,69)+crossing(1080,185,26)+
 `<g fill="#548c55">${Array.from({length:38},(_,i)=>{const x=(i*191+197)%1200+32,y=(i*83+18)%506+8;return `<circle cx="${x}" cy="${y}" r="${2+i%4}"/><circle cx="${x+4}" cy="${y-2}" r="3" fill="#9cc764"/>`;}).join('')}</g>`);
function train(x,y,main='#f1c244'){
 return `<g transform="translate(${x} ${y})">${rect(-2,0,36,17,main,4)}${rect(2,2,10,7,'#33485a',2)}${rect(15,2,8,7,'#667f91',1)}${circle(6,17,4,'#2b3436')}${circle(26,17,4,'#2b3436')}</g>`;
}
const brio=wrap(512,288,rect(0,0,512,288,'#edf0e0')+rect(0,0,512,49,'#376e50')+txt(12,37,'BRIO',40,'#fbfaf3',900)+txt(126,32,'WORLD',21,'#f5f4e8',700,'letter-spacing="5"')+
 '<path d="M0 219L245 84 512 147 274 271z" fill="#b7d58e"/>'+sw('M58 207Q14 184 91 154L231 109Q276 92 322 106L451 146Q510 166 438 196L281 243Q233 261 182 244z','#ca9e5e',12)+sw('M58 207Q14 184 91 154L231 109Q276 92 322 106L451 146Q510 166 438 196L281 243Q233 261 182 244z','#e7cfa3',7)+
 sw('M167 216L273 163 379 174','#b49364',10)+sw('M167 216L273 163 379 174','#e5cd9e',6)+
 rect(258,105,66,46,'#d86146')+rect(267,117,18,31,'#4f7478')+rect(292,113,25,15,'#efbf72')+sw('M251 110L278 92 328 102','#a9473e',11)+
 sw('M118 169Q142 106 182 152','#bc4b3d',6)+sw('M119 169L183 149','#b24f3e',4)+train(158,205)+train(198,198)+train(229,188,'#d96e47')+
 rect(0,252,512,36,'#35654b')+txt(13,277,'Central Station Set',20,'#faf6e8')+txt(461,278,'3+',27,'#fff',700));
const carton=wrap(512,196,rect(0,0,512,196,'#edece6')+txt(21,37,'VELOCITA',32,'#30333a',500,'letter-spacing="7"')+
 '<g transform="translate(103 42)">'+sw('M3 78L29 68 56 43 83 33 105 33 123 32 129 12 150 9 160 33 201 35 223 48 257 56 268 74Z','#666d78',6)+
 '<path d="M4 77l44-18 33-28h42l9-27h16l13 30 58 3 50 32-4 16H5z" fill="#575963"/>'+circle(113,30,12,'#d6d7d3')+circle(42,77,17,'#25262b')+circle(42,77,8,'#dedcd7')+circle(216,76,21,'#28282d')+circle(216,76,10,'#e2dfd6')+txt(135,28,'8',22,'#ecc85e',850)+'</g>'+
 circle(25,160,16,'#72777c')+txt(13,168,'3+',17,'#f5f3ee')+txt(360,169,'playforever.co.uk',15,'#9c3443'));
const topBox=wrap(512,138,rect(0,0,512,138,'#d8dedf')+txt(14,66,'Playforever',63,'#bb2637',790)+txt(14,103,'Designed with joy, built for play',15,'#a35d63',510)+txt(376,116,'VELOCITA',17,'#4a5157',700));
function rubberStamp(angle){
  return [...'SUNRAY'].map((letter,i)=>{
    const degrees=angle-61+24.4*i,rad=degrees*Math.PI/180;
    const x=132+100*Math.sin(rad),y=132-100*Math.cos(rad);
    return `<g transform="translate(${x.toFixed(3)} ${y.toFixed(3)}) rotate(${degrees})">${txt(0,8,letter,29,'#ecece8',800,'text-anchor="middle"')}</g>`;
  }).join('');
}
const dial=wrap(264,264,rect(0,0,264,264,'#282a2d')+rubberStamp(0)+rubberStamp(180));
const three=wrap(216,192,rect(0,0,216,192,'#f5f3ef')+txt(107,167,'3',182,'#2070aa',820,'text-anchor="middle"'));
const nose=wrap(160,160,rect(0,0,160,160,'#f5f3eb')+txt(79,135,'3',135,'#24272b',850,'text-anchor="middle"'));
const tail=wrap(240,80,rect(0,0,240,80,'#347eb0')+txt(18,51,'VELOCITA',35,'#e9ece8',560,'letter-spacing="2"'));
const kitchen=wrap(294,88,rect(0,0,294,88,'#25292b')+txt(20,55,'12:00',48,'#e6efea',500,'letter-spacing="3"')+txt(186,48,'°C',20,'#b8c6cc')+txt(236,52,'+',23,'#e9ece9'));
const specs=[
 [ground,0,0,1280,544,205,0],[brio,0,548,512,288,174,0],[carton,516,548,512,196,172,0],
 [topBox,516,746,512,138,170,0],[dial,0,0,0,0,0,0],[three,1053,549,216,192,68,0],
 [nose,1041,752,160,160,68,0],[tail,536,893,240,80,72,0],[kitchen,790,916,294,88,128,0]
];
// The circular tyre marks use a separately positioned 176 px copy of the drawing.
const resizedDial=await sharp(Buffer.from(dial)).resize(176,176).png().toBuffer();
const stamps=specs.filter(x=>x[3]>0).map(([svg,left,top])=>({input:Buffer.from(svg),left,top}));
stamps.push({input:resizedDial,left:4,top:843});
const rough=Buffer.alloc(width*height*3);
const fill=(x,y,w,h,r,m)=>{for(let j=y;j<y+h;j++) for(let i=x;i<x+w;i++){const p=(j*width+i)*3;rough[p]=255;rough[p+1]=r;rough[p+2]=m;}};
fill(0,0,width,height,143,0);for(const [,x,y,w,h,r,m] of specs)if(w)fill(x,y,w,h,r,m);
fill(4,843,176,176,194,0);fill(1220,966,12,14,67,2);fill(1220,990,12,14,55,115);fill(1245,966,12,14,199,0);
await fs.mkdir(out,{recursive:true});
await Promise.all([
 sharp({create:{width,height,channels:3,background:'#ffffff'}}).composite(stamps).png().toFile(path.join(out,'print.png')),
 sharp(rough,{raw:{width,height,channels:3}}).png().toFile(path.join(out,'response.png'))
]);
