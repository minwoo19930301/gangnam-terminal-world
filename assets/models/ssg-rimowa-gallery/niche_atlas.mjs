// Original UV colour and finish atlas for the photographed silver display niche.
import path from 'node:path';
import sharp from 'sharp';
const out=process.argv[2], W=1024,H=768, rgb=Buffer.alloc(W*H*3), orm=Buffer.alloc(W*H*3);
const regions={oak:[8,8,328,530],back:[350,8,245,530],shell:[610,8,400,522],koeln:[8,550,187,210],seoul:[208,550,187,210]};
const palette=[[239,237,231,60,177],[72,72,69,108,115],[27,28,30,157,19],[178,179,177,80,155],[47,45,44,116,26],[255,250,228,63,22],[133,120,107,143,71],[206,207,205,81,165],[237,239,230,61,26],[170,116,66,135,12],[242,245,242,58,182],[82,79,77,133,64],[126,125,122,151,94]];
const g=x=>Math.exp(-x*x);
const clamp=(v,a=0,b=255)=>Math.round(Math.max(a,Math.min(b,v)));
for(let y=0;y<H;y++)for(let x=0;x<W;x++){
 let i=(W*y+x)*3,v=[245,245,245,108,81],emission=0;
 for(const [key,[l,t,w,h]] of Object.entries(regions)){
  if(x<l-3||x>l+w+3||y<t-3||y>t+h+3)continue;
  const u=(x-l)/w,j=(y-t)/h;
  if(key==='oak'){
   const knot=Math.sin(j*4.8+u*8.6),k=u*95+1.8*Math.sin(j*4.8+u*3.8)+.9*Math.sin(j*9.9+3*u);
   const fiber=8*Math.sin(k)+5*Math.sin(k*3.5+.23*Math.sin(j*44))+.56*Math.sin(j*120)+3*Math.sin(17*u+5*j)+1.7*Math.sin(k*8+2*knot);
   v=[173+fiber,132+fiber*.89,91+fiber*.67,147+fiber*.28,15];
  }else if(key==='back'){
   const beam=Math.exp(-((u-.5)**2)/(.006+.22*j*j))*(.63+.37*Math.cos(j*4.3))*20;
   const edge=15*g((u-.02)/.045)+15*g((u-.98)/.045);
   const light=9*Math.cos(j*4.7+1)+27*g((j-.028)/.052)+18*g((j-.955)/.08);
   emission=.12*beam/20+.51*(g((j-.018)/.029)+g((j-.975)/.032));
   const brushed=1.4*Math.sin(j*1777+u*2)+.8*Math.sin(j*2394+u*6);
   v=[151+beam+edge+light+brushed,150+beam+edge+light+brushed,147+beam+edge+light+brushed,115,132];
  }else if(key==='shell'){
   const strip=(a,w)=>g((u-a)/w);
   const bent=u+.024*Math.sin(j*4.3)+.023*Math.pow(Math.abs(.5-j)*2,4);
   const fall=17*Math.cos((bent-.28)*Math.PI*2)+22*strip(.15,.13)-29*strip(.63,.105)+20*strip(.38,.06)+11*strip(.82,.08);
   const grains=1.1*Math.sin(j*1101+u*2.3)+.57*Math.sin(j*1840+u*3);
   // The pressed ribs also occlude the reflected shop ceiling in the troughs.
   const slot=(((u-.5)*.388/.0239+.5)%1+1)%1-.5;
   const envelope=Math.min(1,j*21,(1-j)*21,u*20,(1-u)*20);
   const rib=envelope*(18*g((slot-.30)/.11)-40*g((slot+.25)/.12)-10*g(slot/.18));
   v=[208+fall+grains+rib,209+fall+grains+rib,207+fall+grains+rib,75+grains,176];
  }else v=key==='koeln'?[239,164,184,145,4]:[244,226,169,148,4];
 }
 if(x>=540&&y>=549){const idx=Math.floor((x-540)/34);if(idx>=0&&idx<palette.length){v=palette[idx];emission=idx===5?.94:0;}}
 rgb[i]=clamp(v[0]);rgb[i+1]=clamp(v[1]);rgb[i+2]=clamp(v[2]);orm[i]=clamp(255*(1-Math.min(1,emission)));orm[i+1]=clamp(v[3]);orm[i+2]=clamp(v[4]);
}
let towers='';
for(const [x,h] of [[48,59],[58,42],[65,52],[78,25],[86,48],[96,64],[108,64]]){
 towers+=`<path fill="#5e345e" d="M${x-6} 152V${h+35}L${x-3} ${h+25}l3 -24 3 25 3 10v74z"/>`;
 towers+=`<path d="M${x-2} ${h+33}l2 -17 2 17m-6 21 2 -8 2 8v23h-4z" stroke="#9b718a" stroke-width="1" fill="none"/>`;
}
const barcode=[];
for(let j=0;j<57;j++){
 const x=3+(j*13)%179,y=100+Math.floor(j/19)*13+2*Math.sin(2.3*j),w=5+(j*7)%9,h=9+(j*9)%25;
 const c=['#ca9b86','#c47e70','#68798e','#f3d9ae','#879091','#e3b999'][j%6];
 barcode.push(`<path fill="${c}" d="M${x} ${y+h}v-${h}l${w} -1v${h+1}z"/><path stroke="#575f68" opacity=".46" d="M${x+w-2} ${y+2}v${h-1}"/>`);
}
const c='<g transform="translate(8 550)"><path fill="#efaac1" d="M0 0h187v210H0z"/><path fill="#c791b1" d="M0 126l25-10 14 5 17-11 17 12 20-8 28 5 28-20 17-8 21 3v64H0z"/><path fill="#633862" d="m26 142 17-17 14 3 17-15 24 5 19 17 18-1v20H25z"/>'+towers+'<path fill="#788160" d="M119 140l10-31 9-9 9-12 8-7 9-19 10-7 13 2v87z"/><path fill="#6d9165" d="m107 149 14-8 19 1 12-7 19-4 16-3v36H96z"/><path fill="#e4bf55" d="m0 146 22 2 10-2 11 6 23-3 15-4 18 3 7 3 29-9 14 4 16-3 22 3v15H0z"/><path fill="#669372" d="m0 156 28 2 26-5 31 5 24-4 34-1 23 2 21-6v32H0z"/><path d="M2 165q32-22 57-1 30-22 63-2 27-24 63-2M2 168h183" fill="none" stroke="#3c7468" stroke-width="3"/><path fill="#e7c367" d="M0 174h187v15H0z"/><path fill="#508675" d="M0 189h187v21H0z"/><text x="93.5" y="185" text-anchor="middle" font-size="12.5" font-family="Arial" fill="#655846">KÖLN COLOGNE</text><text x="93.5" y="201" text-anchor="middle" font-size="5.5" letter-spacing="1" font-family="Arial" fill="#f6e3c0">RIMOWA</text></g>';
const s='<g transform="translate(208 550)"><path fill="#f1d895" d="M0 0h187v210H0z"/><path fill="#b6b991" d="m0 59 33-6 30 7 27-10 34 7 29-7 34 9v58H0z"/><path fill="#6a855e" d="M0 83q44-7 61-16 17-9 29-10 32 1 47 17l50 7v56H0z"/><path fill="#4c735c" d="M0 91q35-14 50-11 16-9 40-28l20 23 32 5 45 18v24H0z"/><path stroke="#595b52" stroke-width="1.5" d="M93 55V41m-2 4h4m-3-3h2v3h-2z"/><path fill="#a69873" d="m3 88 42-12 25 4 22-4 32 6 19 4 44-1v72H0z"/>'+barcode.join('')+'<path fill="#59866e" d="M0 151l8-5 24 9 11-7 19 3 15-8 18 6 21-7 17-11 26-4 28-21v50H0z"/><path fill="#369c99" d="M0 156q37 6 62 0 36-7 64-5 34-1 61-12v71H0z"/><text x="95" y="182" text-anchor="middle" font-family="Arial,sans-serif" font-size="16" fill="#f1e3a7">서울 SEOUL</text><text x="95" y="193" text-anchor="middle" font-size="5.5" letter-spacing="1" font-family="Arial" fill="#eadfaf">RIMOWA</text></g>';
const svg=Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}">${c}${s}</svg>`);
await sharp(rgb,{raw:{width:W,height:H,channels:3}}).composite([{input:svg}]).png().toFile(path.join(out,'niche-colours.png'));
await sharp(orm,{raw:{width:W,height:H,channels:3}}).png().toFile(path.join(out,'niche-metal.png'));
