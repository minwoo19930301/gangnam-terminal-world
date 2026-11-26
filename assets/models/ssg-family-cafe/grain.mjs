import sharp from 'sharp';
import {fileURLToPath} from 'node:url';

// Long vessels and the slower undulation of flat-sawn timber.
const width=768,height=256,data=Buffer.alloc(width*height*3);
let seed=182;
function random(){seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed/4294967296;}
const lines=Array.from({length:height},()=>random());
for(let y=0;y<height;y++)for(let x=0;x<width;x++){
  const a=2*Math.PI*x/width;
  const warp=y+2.2*Math.sin(a+y*.024)+1.55*Math.cos(2*a-y*.053);
  const fiber=lines[(Math.floor(warp)+height)%height];
  const tone=8*Math.sin(warp*.22)+5*Math.cos(warp*1.65)-15*fiber**5+5*(random()-.5);
  for(const [c,base] of [186,127,66].entries())data[(y*width+x)*3+c]=base+tone*(1-c*.16);
}
await sharp(data,{raw:{width,height,channels:3}}).jpeg({quality:86}).toFile(fileURLToPath(new URL('ash.jpg',import.meta.url)));
