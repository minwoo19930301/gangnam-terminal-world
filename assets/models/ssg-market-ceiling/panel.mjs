// Original painted scrollwork, laid out for the widening bays in the operator's photograph.
import sharp from 'sharp';
const defs=[];
function path(d,fill,stroke='none',width=1){return '<path d="'+d+'" fill="'+fill+'" stroke="'+stroke+'" stroke-width="'+width+'"/>';}
let sprig='';
sprig+=path('M0 0 C-4 -27 -13 -43 -34 -62 C-53 -82 -49 -97 -37 -101 C-25 -104 -17 -89 -26 -85 C-32 -84 -33 -89 -29 -91','none','#543e28',3);
sprig+=path('M-5 -22 Q-32 -23 -41 -44 Q-28 -37 -26 -43 Q-49 -52 -50 -68 Q-39 -59 -39 -65 Q-28 -51 -24 -51 Q-16 -44 -5 -22Z','#927443','#493d2b',1.3);
sprig+=path('M-11 -36 Q-2 -65 -14 -70 Q-13 -57 -21 -57 Q-24 -49 -11 -36Z','#5d6751','#3e4131',1.1);
sprig+=path('M-21 -49 Q-49 -77 -58 -76 Q-58 -62 -67 -65 Q-68 -80 -50 -83 Q-34 -83 -21 -49Z','#b69b65','#765835',1);
sprig+=path('M-2 -14 Q-4 -34 6 -48 Q14 -54 13 -64 Q22 -49 12 -38 Q16 -40 20 -44 Q17 -25 -2 -14Z','#ad8554','#6b5133',1.1);
sprig+=path('M-5 -22 Q-24 -43 -39 -54 M-10 -39 Q-8 -53 -14 -60','none','#d6b67d',1.2);
defs.push('<g id="sprig">'+sprig+'</g>');
let ornament='';
function repeat(x,y,scale,angle=0){
 for(const mirror of [-1,1])ornament+='<use href="#sprig" transform="translate('+x+' '+y+') rotate('+angle+') scale('+scale*mirror+' '+scale+')"/>';
}
for(const [x,y,s] of [[256,470,.55],[256,413,.76],[256,333,1.08],[256,224,1.18],[256,111,.9],[142,227,.61],[370,227,.61],[112,128,.71],[400,128,.71],[81,60,.53],[431,60,.53]])repeat(x,y,s);
for(let j=0;j<20;j++){
 const x=24+j*24;
 ornament+=path('M'+x+' 24q12 13 24 0q-8 21 -24 0Z','#775c3b','#a68b59',1.2);
}
for(const [x,y,r] of [[256,278,18],[256,167,21],[256,60,16],[155,135,11],[357,135,11],[208,246,8],[304,246,8]]){
 for(let k=0;k<7;k++)ornament+='<ellipse cx="'+x+'" cy="'+(y-r*.63)+'" rx="'+r*.39+'" ry="'+r*.69+'" fill="'+(k%2?'#96634f':'#b78468')+'" stroke="#7b6142" stroke-width="1.2" transform="rotate('+k*360/7+' '+x+' '+y+')"/>';
 ornament+='<circle cx="'+x+'" cy="'+y+'" r="'+r*.29+'" fill="#c1a15d"/>';
}
let seed=675;
const noise=()=>((seed=(seed*1664525+1013904223)>>>0)/4294967296);
let flecks='';
for(let k=0;k<6400;k++){
 const x=noise()*512,y=noise()*512,r=.24+noise()*.85;
 flecks+='<circle cx="'+x.toFixed(1)+'" cy="'+y.toFixed(1)+'" r="'+r.toFixed(1)+'" opacity=".25" fill="'+(k%2?'#c69668':'#5c4836')+'"/>';
}
const svg='<svg xmlns="http://www.w3.org/2000/svg" width="512" height="512"><defs>'+defs.join('')+'</defs><rect width="512" height="512" fill="#b99268"/>'+flecks+ornament+'<rect x="0" y="488" width="24" height="24" fill="white"/></svg>';
await sharp(Buffer.from(svg)).jpeg({quality:89,chromaSubsampling:'4:4:4'}).toFile(new URL('./panel.jpg',import.meta.url).pathname);
