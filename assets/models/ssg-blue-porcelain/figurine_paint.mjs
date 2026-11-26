// Original enamel and gilding drawn for a model of Henning's 1911 bonbonnière.
import sharp from 'sharp';
import path from 'node:path';
const W=1024,H=1024;
let pieces=[];
function pathD(d,fill,stroke='none',width=1){return `<path d="${d}" fill="${fill}" stroke="${stroke}" stroke-width="${width}" stroke-linejoin="round" stroke-linecap="round"/>`;}
function circle(x,y,r,fill){return `<circle cx="${x}" cy="${y}" r="${r}" fill="${fill}"/>`;}
function flower(x,y,r,p,leaf) {
 let o='';for(let j=0;j<5;j++){let a=j*Math.PI*2/5;o+=circle(x+r*.57*Math.cos(a),y+r*.57*Math.sin(a),r*.47,p);}
 o+=circle(x,y,r*.28,'#cba24d');
 o+=pathD(`M${x+r*.5} ${y+r*.5}q${r*.72} ${r*.75} ${r*1.25} ${r*.48}q${-r*.30} ${-r*.87} ${-r*1.25} ${-r*.48}Z`,leaf);return o;
}
function scroll(x,y,s,color){return `<g transform="translate(${x} ${y}) scale(${s})">`+pathD('M-15 8 C-12 1 -4 -8 4 -6 C15 -4 11 5 5 4 C1 3 1 -1 4 -2 M-9 2 C-4 5 0 9 7 8','none',color,1.45)+'</g>';}
for(let row=0;row<7;row++){
 let content='';const base=['#143c52','#f2ead6','#d3dcd4','#eee3d6','#dee9e2','#444c52','#ad665c'][row];
 content+=`<rect width="1024" height="128" fill="${base}"/>`;
 if(row===0){
  for(let i=0;i<8;i++){let x=i*128;
   content+=`<g transform="translate(${x} 0)">`+pathD('M2 122Q12 104 18 77Q34 40 47 37Q51 27 64 18Q77 26 82 37Q98 38 111 78Q116 107 126 122Z','#f0e5ce','#cbab69',3);
   content+=pathD('M15 117Q26 96 31 80Q46 48 62 38Q85 48 103 85Q109 107 117 117Z','none','#b49356',1.45);
   content+=pathD('M45 109Q52 84 59 79Q65 75 72 83Q74 91 82 97Q70 104 65 99Q57 105 51 112Z',i%2?'#956351':'#6a7991','#a48152',1);
   content+=circle(63,70,5,'#d8aa83')+pathD('M58 69Q59 60 66 62Q69 65 69 66Z','#543e46')+pathD('M62 86Q56 83 49 81L44 75 M70 87L76 76','none','#956d5b',2.1);
   for(let j=0;j<5;j++)content+=scroll(j*20+19,16+(j%2)*4,.57,'#c4a162');
   content+='</g>';
  }
 }else if(row<=4){
  const ink=['','#553656','#273961','#754351','#405369'][row];
  for(let i=0;i<8;i++){const x=i*128;
   content+=`<g transform="translate(${x} 0)">`+pathD('M-5 125C20 105 34 100 21 82C8 62 13 48 36 45 C67 40 58 23 42 16L53 1L83 1C101 14 104 31 87 40 C59 56 51 60 65 81 C79 100 67 115 46 128Z',ink,'#bc9961',2.4);
   for(let j=0;j<6;j++)for(let k=0;k<4;k++)content+=scroll(19+j*19,10+k*32+(j%2)*11,.51, j%3===0?'#d9ae61':'#85998b');
   for(let j=0;j<8;j++){let fx=(23+j*37)%125,fy=22+(j*27)%87;content+=flower(fx,fy,2.5+(j%3)*1.1,j%2?'#ab6b61':'#ce8d82','#778878');}
   content+='</g>';
  }
 }else if(row===5){
  for(let i=0;i<38;i++){let x=i*28-3;let y=10+(i*43)%96;content+=flower(x,y,i%2?4:6,i%3?'#b7bac4':'#d1b5ad','#6a756a');content+=scroll(x+9,y+11,.48,'#bca574');}
  content+=pathD('M0 116Q128 92 256 115T512 115T768 115T1024 115','none','#d3b491',4);
 }else{
  for(let j=0;j<6;j++)for(let k=0;k<45;k++){const x=16+k*24+(j%2)*10,y=5+j*22;
   content+=circle(x,y,2.1,'#e8bc83')+circle(x,y,.9,'#524047');}
 }
 pieces.push(`<g transform="translate(0 ${row*128})">${content}</g>`);
}
const sw=['eae1ca','b18a4c','d9b890','e1c3a3','bea084','3c3338','975c56','d7cdba','ac7169','303b4b','a89b87','778c87','315066','5a4c43','715b78','d6ab50'];
pieces.push(...sw.map((v,i)=>`<rect x="${i*64}" y="896" width="64" height="128" fill="#${v}"/>`));
await sharp(Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}">${pieces.join('')}</svg>`)).png().toFile(path.join(process.argv[2],'figurine-enamel.png'));
