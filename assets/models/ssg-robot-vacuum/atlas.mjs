import fs from 'node:fs/promises';
import path from 'node:path';
import sharp from 'sharp';

// The grain, terry loops, and miniature printed illustrations are original drawings.
const out = process.argv[2];
const width=1024, height=768;
const diffuse=Buffer.alloc(width*height*3,248), normal=Buffer.alloc(width*height*3);
for(let p=0;p<normal.length;p+=3){normal[p]=128;normal[p+1]=128;normal[p+2]=255;}
let seed=78231;
function rand(){seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed/4294967296;}
function plot(buf,x,y,r,g,b){
  const k=(y*width+x)*3;
  for(const [i,v] of [r,g,b].entries())buf[k+i]=Math.min(255,Math.max(0,Math.round(v)));
}
for(let y=0;y<256;y++){
  const board=Math.floor(y/86);
  for(let x=0;x<width;x++){
    const ay=y+board*67;
    const n=Math.exp(-((x-680+board*80)**2)/(125**2)-((y-150)**2)/(14**2));
    const wave=ay*.88+.94*Math.sin(x*.012+ay*.025)+1.7*Math.sin(x*.004+ay*.009)+n*4.3;
    const w=Math.sin(wave)*1.65+Math.sin(wave*.21)*2.3+2*(rand()-.5);
    const end=y%86===0?-8:(y%86===1?2:0);
    plot(diffuse,x,y,217+4*board+w+end,184+4.4*board+w+end,142+5*board+w+end);
    plot(normal,x,y,128,128+Math.cos(wave)*2,255);
  }
}
for(let y=256;y<512;y++)for(let x=0;x<1024;x++){
  const a=(x%18)+2.3*Math.sin(y*.088),b=(y-256)%14;
  const h=Math.sin(a*.38+b*.035)*Math.cos(b*.43);
  const tuft=Math.abs(Math.sin(a*.24)*Math.cos(b*.44));
  const yarn=5.5*h+7*tuft+6*(rand()-.5);
  const striped=Math.floor((y-256)/20)%2===0;
  const t=(striped?8:0)+yarn;
  plot(diffuse,x,y,169+t,181+t,192+t);
  plot(normal,x,y,128+Math.cos(a*.38)*Math.cos(b*.43)*42,128-Math.sin(a*.38)*Math.sin(b*.43)*35,246);
}
const font='Helvetica Neue,Apple SD Gothic Neo,sans-serif';
const text=(x,y,content,size,colour,weight=550)=>`<text x="${x}" y="${y}" font-family="${font}" font-size="${size}" font-weight="${weight}" fill="${colour}">${content}</text>`;
const icons=[
 '<path d="M0 21q0-9 18-10t18 10v4q-3 7-18 7T0 26Zm4-5 15-2 13 3" />',
 '<path d="M3 31h31v-5H3z M7 25v-6h24v6M8 12q-4-3 0-7m8 7q-4-3 0-7m8 7q-4-3 0-7"/>',
 '<path d="M3 9h31l-2 22H5zM5 14h26 M14 20h9m-9 4h8"/>',
 '<path d="M4 25q9-12 23-16l5 1-1 6-18 14-7-1Zm20-12 5 3M11 25l4 2"/>',
 '<path d="M4 9q0-4 4-4h20q4 0 4 4v20H4zM8 10h9v10H8zm13 0h7v10h-7zM8 25h21"/>'
];
let inset='';
for(let i=0;i<5;i++){
  const x=12+i*98;
  inset+=`<rect x="${x}" y="62" width="92" height="42" rx="3" fill="#343941"/><g transform="translate(${x+24} 64)" fill="none" stroke="#f1f1eb" stroke-width="1.8">${icons[i]}</g>`+
    text(x+4,119,['장애물 인식','물걸레 세척','먼지 비움','듀얼 롤러','복합 도크'][i],12,'#444a50');
}
const dealer=`<svg xmlns="http://www.w3.org/2000/svg" width="512" height="128"><rect width="512" height="128" rx="8" fill="#f5f4ef"/><rect width="512" height="55" rx="6" fill="#ad2738"/>${text(19,16,'roborock',12,'#fff')}${text(18,43,'청소의 한계를 넘어서다',24,'#fff',680)}<circle cx="484" cy="28" r="20" fill="#96253a" stroke="#eea2aa"/>${text(469,32,'NEW',12,'#fff',700)}${inset}</svg>`;
const labels=`<svg xmlns="http://www.w3.org/2000/svg" width="512" height="128"><rect width="512" height="128" fill="#f0f0ef"/>${text(11,19,'roborock',14,'#ac2939',700)}${text(11,41,'S8 Max Ultra',18,'#222831',640)}${text(11,69,'로봇청소기 · 시연 안내',15,'#34383d')}${text(11,96,'DuoRoller Riser   /   VibraRise',13,'#4a535c')}${text(11,116,'자동 먼지 비움   ·   물걸레 세척',11,'#444')}${text(299,38,'제품 사양',20,'#282c35')}<g stroke="#909a9b" stroke-width="1.5">${Array.from({length:9},(_,i)=>`<path d="M299 ${48+i*8.1}h${i%3===1?155:184}"/>`).join('')}</g></svg>`;
const buttons=`<svg xmlns="http://www.w3.org/2000/svg" width="512" height="128"><rect width="512" height="128" fill="#f2f1ee"/><g transform="translate(10 6)" stroke="#626867" fill="none" stroke-width="3.6"><rect x="0" y="7" width="245" height="102" rx="47" fill="#e5e5e1" stroke="#c1c5c3"/><path d="M18 57l20-17 19 17m-33-3v21h25V54"/><path d="M119 38v23 m-10-18a20 20 0 1 0 21 0"/><path d="M175 62c16-9 22-23 24-28 2 9 8 22 22 28l-22 18z"/></g>${text(278,76,'roborock',43,'#8a8c8a',620)}</svg>`;
const warranty=`<svg xmlns="http://www.w3.org/2000/svg" width="512" height="128"><rect width="512" height="128" fill="#444951"/><rect x="10" y="10" width="246" height="108" rx="4" fill="#d6d9db"/>${text(23,36,'roborock',21,'#343942',700)}${text(23,57,'Robotic Vacuum Cleaner',11,'#343942')}${text(23,75,'S8 series',10,'#343942')}<g stroke="#404550" stroke-width="2">${Array.from({length:36},(_,i)=>`<path d="M${23+i*5} 83v18"/>`).join('')}</g>${text(281,41,'DuoRoller',28,'#d1d4d7',700)}${text(281,68,'ROLLER RELEASE',13,'#9fa4aa')}<path d="M294 91h130m-10-7 10 7-10 7" fill="none" stroke="#bbbfc4" stroke-width="2"/></svg>`;
const inserts=[dealer,labels,buttons,warranty].map((svg,i)=>({input:Buffer.from(svg),left:(i%2)*512,top:512+Math.floor(i/2)*128}));
await fs.mkdir(out,{recursive:true});
await Promise.all([
 sharp(diffuse,{raw:{width,height,channels:3}}).composite(inserts).png().toFile(path.join(out,'retail-print.png')),
 sharp(normal,{raw:{width,height,channels:3}}).png().toFile(path.join(out,'retail-normal.png')),
]);
