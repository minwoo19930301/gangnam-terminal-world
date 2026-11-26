// Original underglaze artwork. Coordinates are in a 512px plate diameter.
import sharp from 'sharp';
import {fileURLToPath} from 'node:url';

const root = fileURLToPath(new URL('.',import.meta.url));
const ring = (r,color,width) => '<circle cx="256" cy="256" r="'+r+'" fill="none" stroke="'+color+'" stroke-width="'+width+'"/>';
const rotate = (angle,shape) => '<g transform="rotate('+angle+' 256 256)">'+shape+'</g>';
let lace=ring(244,'#274a82',2.5)+ring(239,'#7790b2',1.5)+ring(228,'#405f97',1.4);
for(let i=0;i<112;i++) {
  lace+=rotate(i*360/112,'<path d="M249 18q7 17 14 0 M252 22q4 8 8 0" stroke="#345991" fill="none" stroke-width="1.55"/>');
}
for(let i=0;i<4;i++) {
  let fan='';
  for(let row=0;row<4;row++) for(let j=0;j<7-2*row;j++) {
    const x=233+row*7+j*7,y=30+row*6;
    fan+='<path d="M'+x+' '+y+'q3.5 8 7 0q-4 4 -7 0" fill="#234a84" stroke="#234a84" stroke-width="1.1"/>';
  }
  lace+=rotate(i*90,fan+'<path d="M228 30q28 49 56 0M225 31q9 3 15 15m47-15q-9 3-15 15" fill="none" stroke="#617fab" stroke-width="1.4"/>');
}
// A painter seated at a worktable, with an open crown behind her.
const painter='<circle cx="297" cy="231" r="18"/><ellipse cx="314" cy="225" rx="10" ry="13"/><path d="M280 225l-7 14 8 3 3 9 13 2 3 10-18-6-18 21-38-12-7 7 48 20 14-10-2 16-44 14-7 48-12 12 18-1 15-48 31-5-7 42 23 8 9-52 9-25-3-28-15-15z M152 287h108v8H152z M158 292h6v80h-6z M244 292h5v80h-5z M301 314h39v7h-38z M334 315l9-53 6 1-9 56 7 53h-5l-9-50z M303 321h5l-4 51h-4z M173 281q-8-10 0-18h23q7 12-1 18z"/><path d="M219 268l-23-26" stroke="#163970" stroke-width="3"/>';
const crown='<g fill="none" stroke="#5c78a4" stroke-width="4"><path d="M162 233q-47-49-17-60 22-8 50 32-28-63 5-66 27-1 53 51-4-63 8-66 17 2 11 67 35-53 59-46 23 14-9 62 39-38 59-20 14 17-32 54 M163 233q93-34 186 8l-6 16q-90-36-174-10z M259 125v-21m-9 9h20"/></g>';
let anniversary='<circle cx="256" cy="256" r="254" fill="url(#wash)"/>'+ring(245,'#6684a8',4)+ring(216,'#324e84',2)+crown+'<g fill="#15376e">'+painter+'</g><text x="256" y="426" text-anchor="middle" font-family="serif" font-size="28" fill="#d0dbe8">1775 · 2025</text>';
for(let i=0;i<3;i++) anniversary+='<path d="M190 '+(376+6*i)+'q17 -8 34 0t34 0t34 0t34 0" fill="none" stroke="#6686ae" stroke-width="2"/>';
// Blue Fluted Plain anniversary dinner plate, catalogue article 1074934.
const rosette='<g fill="none" stroke="#204a85" stroke-width="2">'+Array.from({length:11},(_,i)=>'<path transform="rotate('+i*360/11+')" d="M0 -2Q-10 -12 -5 -15Q0 -18 1 -4Q5 -15 7 -11Q9 -8 2 -1"/>').join('')+'<circle r="3" fill="#244a7e"/></g>';
let fluted=ring(247,'#315284',2.6);
for(let i=0;i<112;i++) fluted+=rotate(i*360/112,'<path d="M256 10Q251 37 255 59" fill="none" stroke="#9db1c8" opacity=".38" stroke-width="1.4"/>');
for(let i=0;i<8;i++) {
 const sweep='<path d="M243 194Q243 149 213 129T196 81Q195 51 225 38Q248 26 257 17M211 128Q220 107 243 112M197 90Q171 91 166 71" fill="none" stroke="#315889" stroke-width="2.3"/>';
 const leaves=Array.from({length:8},(_,j)=>'<path transform="translate('+(202+Math.sin(j*.85)*10)+' '+(59+j*9)+') rotate('+(-25+j*7)+')" d="M0 0q-13 -3 -12 -9q8 1 12 9m0 0q9 -11 12 -10q0 6 -12 10" fill="#53779f"/>').join('');
 fluted+=rotate(i*45,sweep+leaves+'<g transform="translate(239 155) scale(.68)">'+rosette+'</g><g transform="translate(222 40) scale(.44)">'+rosette+'</g>');
}
fluted+=ring(53,'#50749f',2)+'<g fill="#305482" text-anchor="middle" font-family="serif"><text x="256" y="253" font-size="20">1775</text><text x="256" y="277" font-size="20">2025</text></g>';
let grain='';
for(let i=0;i<180;i++) {
  const y=(i*47.31)%512,k=Math.sin(i*7)*12;
  grain+='<path d="M-10 '+y+'q105 '+k+' 201 1t331 -1" stroke="'+(i%3?'#65402a':'#ffe0ab')+'" opacity=".16" fill="none" stroke-width="'+(i%3?.65:1.2)+'"/>';
}
const svg='<svg xmlns="http://www.w3.org/2000/svg" width="1024" height="1024"><defs><radialGradient id="wash"><stop stop-color="#c3d2e3"/><stop offset=".76" stop-color="#9db4d1"/><stop offset=".84" stop-color="#7494bc"/><stop offset=".86" stop-color="#28457d"/><stop offset=".97" stop-color="#456298"/><stop offset="1" stop-color="#c5d4df"/></radialGradient></defs><rect width="1024" height="1024" fill="#f8f7f3"/>'+lace+'<g transform="translate(512 0)">'+anniversary+'</g><g transform="translate(0 512)"><rect width="512" height="512" fill="#b58259"/>'+grain+'</g>'+['#ede9dc','#233e69','#ab8150','#23472f','#729460','#f7f4e3','#655044','#413c37','#c6a975','#c3bbae','#b28664','#173560'].map((c,i)=>'<rect x="'+(512+i*40)+'" y="600" width="40" height="60" fill="'+c+'"/>').join('')+'<g transform="translate(596 665) scale(.67)">'+fluted+'</g></svg>';
await sharp(Buffer.from(svg)).png({palette:true,colours:192}).toFile(root+'paint.png');
