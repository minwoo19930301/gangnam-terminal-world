// Original botanical upholstery drawing. Each curved blade has a pale midrib,
// paired secondary veins and a fine cross-woven ground.
import sharp from 'sharp';
import {fileURLToPath} from 'node:url';

const fragments = [];
let seed = 201903;
function random() {
  seed = (Math.imul(seed,1664525) + 1013904223) >>> 0;
  return seed / 4294967296;
}
for (let row=0;row<2;row++) for(let clump=-1;clump<6;clump++){
  const x=clump*192 + (row ? 90:0), y=row ? 316:155;
  for (let leaf=0;leaf<8;leaf++){
    const a=(leaf-3.5)*19+random()*12, size=.7+random()*.65;
    const greens=['#466746','#678261','#385941','#74906c','#526e49'];
    const color=greens[Math.floor(random()*greens.length)];
    fragments.push(`<g transform="translate(${x} ${y}) rotate(${a}) scale(${size})"><path d="M0 0 Q-2 -45 25 -100 Q36 -126 40 -150 Q48 -109 38 -86 Q29 -60 12 -43 Q4 -24 0 0Z" fill="${color}"/><path d="M1 -4 Q10 -54 27 -88 T40 -146" fill="none" stroke="#b3b695" stroke-width="1.4"/>`);
    for(let j=0;j<11;j++){
      const t=j/11, xx=7+32*t, yy=-42-96*t;
      fragments.push(`<path d="M${xx} ${yy} q -3 -7 -5 -11 M${xx} ${yy} q 6 -4 9 -10" stroke="#a9b196" opacity=".5" fill="none" stroke-width=".9"/>`);
    }
    fragments.push('</g>');
  }
}
const svg=`<svg xmlns="http://www.w3.org/2000/svg" width="960" height="320"><defs><pattern id="weave" width="4" height="3" patternUnits="userSpaceOnUse"><path d="M0 0H4 M0 0V3" stroke="#443d31" stroke-opacity=".18" stroke-width=".8"/></pattern></defs><rect width="100%" height="100%" fill="#c3bfa2"/>${fragments.join('')}<rect width="100%" height="100%" fill="url(#weave)"/></svg>`;
await sharp(Buffer.from(svg)).jpeg({quality:85}).toFile(fileURLToPath(new URL('upholstery.jpg',import.meta.url)));

// Baked seared surface, sampled in longitude/latitude around the patty.
const width=384,height=192,pixels=Buffer.alloc(width*height*3);
const fields=[8,16,32,64].map(n=>({n,values:Array.from({length:n*n},()=>random())}));
function noise({n,values},u,v){
  const x=u*n,y=v*n,i=Math.floor(x),j=Math.floor(y);
  let a=x-i,b=y-j;a*=a*(3-2*a);b*=b*(3-2*b);
  const at=(dx,dy)=>values[((j+dy)%n)*n+((i+dx)%n)];
  return (at(0,0)*(1-a)+at(1,0)*a)*(1-b)+(at(0,1)*(1-a)+at(1,1)*a)*b;
}
for(let y=0;y<height;y++)for(let x=0;x<width;x++){
  const u=x/width,v=y/height,n=fields.map(f=>noise(f,u,v));
  const crumb=(random()-.5)*19, speck=n[2]>.77?22:0;
  const k=.50+.43*n[0]+.26*n[1]+.22*n[2]+.11*n[3];
  const i=(y*width+x)*3;
  [145,73,35].forEach((c,j)=>pixels[i+j]=Math.max(0,Math.min(255,c*k+crumb+speck)));
}
await sharp(pixels,{raw:{width,height,channels:3}}).jpeg({quality:86}).toFile(fileURLToPath(new URL('sear.jpg',import.meta.url)));
