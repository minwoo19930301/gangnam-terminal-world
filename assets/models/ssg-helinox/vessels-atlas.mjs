// Paint an unfolded steel surface and titanium print from the authored camp display.
// The showroom photograph is a reference, never a texture input.
import sharp from 'sharp';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
const out=process.argv[2] || fileURLToPath(new URL('./',import.meta.url));
const width=1024,height=768, colour=Buffer.alloc(width*height*3,255), orm=Buffer.alloc(width*height*3,255);
const bands=[[.06,.045,.18],[.135,.012,-.35],[.185,.026,.16],[.27,.021,-.50],[.346,.047,.16],
  [.41,.042,-.28],[.471,.010,.18],[.503,.017,-.63],[.535,.018,.26],[.585,.04,-.26],
  [.68,.038,.22],[.752,.027,-.42],[.807,.017,.13],[.88,.032,-.30],[.946,.034,.18]];
const rects={body:[12,12,998,465],mug:[12,503,623,245],caps:[655,503,352,244]};
const clamp=(x,a,b)=>Math.min(b,Math.max(a,x));
for(let y=0;y<height;y++)for(let x=0;x<width;x++){
 const k=(y*width+x)*3;orm[k]=0;orm[k+1]=74;orm[k+2]=149;
 for(const [id,rect] of Object.entries(rects)){
  const [left,top,w,h]=rect;if(x<left-4||y<top-4||x>left+w+4||y>top+h+4)continue;
  let u=clamp((x-left)/w,0,1),v=clamp((y-top)/h,0,1);const d=(a,b,s)=>Math.exp(-Math.pow((a-b)/s,2));
  let a=.78;
  if(id==='body'||id==='caps'){
   let t=u+.013*Math.sin(v*4.5)-.016*Math.pow(v,4)-.012*Math.pow(1-v,6);
   if(id==='caps')t=u+.13*v+.05*Math.sin(6*v);
   for(const [center,wgt,intensity]of bands)a+=d(t,center,wgt)*intensity;
   const tent=d(t,.69,.12)+d(t,.326,.09),floor=.05*Math.sin(11*t+7.3*v)*Math.pow(v,2);
   const lower=d(v,.917,.018)*.09+d(v,.975,.018)*.10;
   colour[k]=clamp((a+.039*tent+floor+lower)*255,42,252);
   colour[k+1]=clamp((a+.007*tent+floor+lower)*255,40,251);
   colour[k+2]=clamp((a-.051*tent+floor+lower)*255,35,250);
   orm[k]=id==='body'?248:232;orm[k+1]=id==='body'?60:53;orm[k+2]=187;
  }else{
   const rub=.009*Math.sin(246*v+3*Math.sin(9*u))+.009*Math.cos(902*v+11*u);
   const sweep=.055*Math.cos(2*Math.PI*(u-.30))+.025*Math.cos(6*Math.PI*u);
   const edge=.105*d(v,.018,.018)+.066*d(v,.956,.055);
   const val=.69+sweep+rub+edge;
   colour[k]=clamp((val+.024)*255,0,255);colour[k+1]=val*255;colour[k+2]=(val-.026)*255;
   orm[k]=92;orm[k+1]=Math.round((.48+rub*2)*255);orm[k+2]=172;
  }
 }
}
const word=(cx,cy,sc,cap)=>`<g transform="translate(${cx} ${cy}) scale(${sc})" fill="#37322d">
 <g transform="translate(0 -26)" stroke="#37322d" stroke-width="3.5" stroke-linecap="butt">
 <path d="M0,-8.4V8.4 M-7.3,-4.2L7.3,4.2 M-7.3,4.2L7.3,-4.2"/></g>
 <text text-anchor="middle" font-family="Georgia,serif" font-size="16" font-weight="bold" letter-spacing="-.6">snow peak</text>
 <text text-anchor="middle" y="4.7" font-family="Arial,sans-serif" font-size="2.9">outdoor lifestyle creator</text>
 ${cap?'<text text-anchor="middle" y="21" font-family="Arial,sans-serif" font-size="8" font-weight="bold">450</text><text text-anchor="middle" y="30" font-family="Arial,sans-serif" font-size="4.4">TITANIUM</text><text text-anchor="middle" y="35" font-family="Arial,sans-serif" font-size="3">JAPAN</text>':''}</g>`;
const svg=Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}">${word(511,171,1.37,false)}${word(323.5,612,1.11,true)}</svg>`);
await sharp(colour,{raw:{width,height,channels:3}}).composite([{input:svg}]).png().toFile(path.join(out,'vessel-colour.png'));
await sharp(orm,{raw:{width,height,channels:3}}).png().toFile(path.join(out,'vessel-response.png'));
