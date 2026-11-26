import sharp from 'sharp';
import path from 'node:path';

const directory=process.argv[2];
if(!directory)throw Error('Specify a temporary output directory');
const width=1024,height=768;
const font='Helvetica Neue,Helvetica,Arial,sans-serif';
const txt=(x,y,value,size,color='white',weight=500,other='')=>
  '<text x="'+x+'" y="'+y+'" '+(other.includes('text-anchor')?'':'text-anchor="middle"')+' font-family="'+font+'" font-size="'+size+'" font-weight="'+weight+'" fill="'+color+'" '+other+'>'+value+'</text>';
const line=(x1,y1,x2,y2,color,sw=2)=>'<line x1="'+x1+'" y1="'+y1+'" x2="'+x2+'" y2="'+y2+'" stroke="'+color+'" stroke-width="'+sw+'" stroke-linecap="round"/>';
const circle=(x,y,r,c,s=2)=>'<circle cx="'+x+'" cy="'+y+'" r="'+r+'" fill="none" stroke="'+c+'" stroke-width="'+s+'"/>';
const defs='<defs><radialGradient id="blue"><stop stop-color="#12325b"/><stop offset=".62" stop-color="#0a1930"/><stop offset="1" stop-color="#060b12"/></radialGradient><linearGradient id="screen" x2="0" y2="1"><stop stop-color="#34c7fc"/><stop offset=".48" stop-color="#24bcef"/><stop offset="1" stop-color="#27df80"/></linearGradient><linearGradient id="mip" x2=".3" y2="1"><stop stop-color="#242629"/><stop offset="1" stop-color="#131516"/></linearGradient></defs>';
const ticks=(rad,small,big,shade)=>Array.from({length:60},(_,i)=>{
 const theta=i*Math.PI/30,major=i%5===0,length=major?big:small,dx=Math.cos(theta),dy=Math.sin(theta);
 return line(192+dx*(rad-length),192+dy*(rad-length),192+dx*rad,192+dy*rad,shade,major?2.35:1.12);
}).join('');
function letterArc(value,r,start,end,color,size){
 let s='';const n=value.length;
 for(let i=0;i<n;i++){const t=(start+(end-start)*i/(n-1))*Math.PI/180;
 s+=txt(0,0,value[i]===' ' ? '&#160;':value[i],size,color,550,'transform="translate('+(192+Math.sin(t)*r)+' '+(192-Math.cos(t)*r)+') rotate('+(t*180/Math.PI+((start>90||end< -90)?180:0))+')"');}
 return s;
}
let runner='<circle cx="192" cy="192" r="191" fill="url(#blue)"/>'+ticks(174,4,8,'#a4b0ba');
let mesh='';for(let j=-7;j<=7;j++)for(let i=-12;i<=12;i++){let x=192+i*7,y=194+j*6;if((x-192)**2/102**2+(y-194)**2/64**2<1)mesh+='<circle cx="'+x+'" cy="'+y+'" r=".82" fill="#27608a"/>';}
runner+=mesh+circle(192,83,32,'url(#screen)',2.7)+circle(193,283,30,'url(#screen)',2.7);
runner+='<g stroke="#ebf7ff" stroke-linecap="round" fill="none" stroke-width="3"><circle cx="194" cy="66" r="3"/><path d="M194 72l-6 5 -5 -1m9 -2l5 6 6 -2m-11 -2l-4 10 -5 3m11 -10l2 8 -2 4"/></g>';
runner+=txt(192,104,'25',17)+txt(103,103,'24 hr',17)+txt(280,89,'VO₂',17)+txt(280,108,'52',16);
runner+=txt(190,217,'10',94,'none',600,'text-anchor="end" transform="skewX(-4) translate(4 0)" stroke="url(#screen)" stroke-width="2.2"');
runner+=txt(174,216,'10',94,'url(#screen)',740,'text-anchor="start" transform="skewX(-4) translate(9 0)"');
runner+=txt(257,244,'SAT 01',15)+txt(193,294,'38',27,'#f0fbff',740)+txt(113,283,'8:00',14)+txt(271,283,'100%',14);
runner+=line(108,259,117,259,'#ebf7ff')+line(112,253,112,251,'#ebf7ff')+'<path d="M106 258a6 6 0 0112 0" fill="#e8f5ff"/><rect x="263" y="252" width="14" height="7" rx="1" fill="none" stroke="#dceefa" stroke-width="1.7"/>';
runner+=txt(192,346,'GARMIN',11,'#dfe6ea',650);
let rugged='<circle cx="192" cy="192" r="191" fill="url(#mip)"/>'+ticks(176,3.5,7,'#9aa1a1');
rugged+=letterArc('STEPS 8544  |  H 73  /  L 60',141,-64,65,'#e7e8e6',14)+letterArc('ALT 3428',145,224,191,'#c9cecc',12)+letterArc('BATT 22d',145,173,140,'#c9cecc',12);
rugged+='<path d="M75 123l35 19v103l-35 17 M307 123l-35 19v103l35 17" fill="none" stroke="#777d7b" stroke-width="2"/>';
rugged+=txt(191,100,'FĒNIX PRO',15,'#ecedeb',600)+txt(192,183,'10',72,'none',620,'stroke="#dadbd9" stroke-width="2"')+txt(192,246,'10',72,'#eeefed',720)+txt(192,279,'SAT 1',15,'#dfe2df',630)+txt(83,198,'24',16)+txt(299,190,'VO₂',13)+txt(298,208,'52',16)+txt(192,345,'GARMIN',10,'#c6c9c8');
let console='<rect x="0" y="0" width="236" height="147" rx="8" fill="#202c33"/>'+txt(118,20,'TACX',13,'#81c7e4',650);
console+=line(10,28,226,28,'#52707d',1)+line(10,94,226,94,'#52707d',1);
console+=txt(62,54,'POWER',11,'#adc5cd')+txt(62,84,'168',31,'#f2f8f8',650)+txt(169,54,'CADENCE',11,'#adc5cd')+txt(169,84,'84',31,'#f2f8f8',650)+txt(117,120,'12:45',20,'#d8e7e8',510);
const terrain='<rect width="236" height="147" rx="5" fill="#8fa4ae"/><path d="M0 86L39 48l26 15 41-32 32 28 25-10 27 15 46-29v112H0Z" fill="#5f776e"/><path d="M0 102l50-29 33 12 32-19 49 26 42-19 30 12v62H0Z" fill="#445f50"/><path d="M0 118l74-31 52 16 49-10 61 16v38H0Z" fill="#728660"/><path d="M85 147q9-17 30-24t8-12l-17-6 19-7-10-2" fill="none" stroke="#c6bba5" stroke-width="6"/>'+txt(39,17,'TACX',14,'#f4f4ed',660)+'<rect x="158" y="7" width="68" height="23" rx="4" fill="#24333a" opacity=".88"/>'+txt(192,23,'168 W',14,'#e7f4f8',620);
function bezel(rugged){
 const base=rugged?'#6a6661':'#888b89',lineCol=rugged?'#474541':'#686d6b';
 let out='<rect width="384" height="384" fill="'+base+'"/><circle cx="192" cy="192" r="184" fill="none" stroke="'+lineCol+'" stroke-width="10"/>';
 for(let j=0;j<22;j++)out+=circle(192,192,147+j*1.7,j%3===0?'#86817a':lineCol,.38);
 for(const [word,a,b] of [['LIGHT',-77,-54],['UP',-105,-92],['DOWN',-139,-116],['START · STOP',56,89],['BACK',106,126]]){
  out+=letterArc(word,168,a,b,rugged?'#e0dad0':'#282e31',rugged?9.5:10.5);
 }
 for(let i=0;i<12;i++){
  const t=i*Math.PI/6,dx=Math.sin(t),dy=-Math.cos(t);
  out+=line(192+dx*185,192+dy*185,192+dx*189,192+dy*189,'#cbc7c1',i%3===0?2.2:1.1);
 }
 return out;
}
const rims='<g transform="translate(0 384)">'+bezel(false)+'</g><g transform="translate(384 384)">'+bezel(true)+'</g>';
const content='<g>'+runner+'</g><g transform="translate(384 0)">'+rugged+'</g><g transform="translate(774 6)">'+console+'</g><g transform="translate(774 164)">'+terrain+'</g>';
// Extra blank ivory block below the face artwork preserves original material
// colours on untextured cases, fans and silicone. These are original vector dials.
const template=(art,bg)=>Buffer.from('<svg xmlns="http://www.w3.org/2000/svg" width="'+width+'" height="'+height+'" viewBox="0 0 '+width+' '+height+'">'+defs+'<rect width="100%" height="100%" fill="'+bg+'"/>'+art+'</svg>');
const background='<rect x="0" y="0" width="768" height="384" fill="#11161a"/>';
await sharp(template(background+content+rims,'#fff')).png().toFile(path.join(directory,'screen-art.png'));
await sharp(template(content,'#000')).modulate({brightness:.62}).png().toFile(path.join(directory,'screen-light.png'));
