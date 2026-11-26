// Original typesetting, rendered locally so the editable library is self-contained.
import sharp from 'sharp';
import path from 'node:path';
const out=process.argv[2];
async function tile(file,w,h,body) {
  const svg='<svg xmlns="http://www.w3.org/2000/svg" width="'+w+'" height="'+h+'">'+body+'</svg>';
  await sharp(Buffer.from(svg)).png().toFile(path.join(out,file+'.png'));
}
const bold='font-family="Arial Black,DejaVu Sans,sans-serif" font-weight="900"';
await tile('repeat',512,210,'<rect width="512" height="210" fill="#f5f4f5"/><g transform="translate(9 153) scale(1.29 1)"><text '+bold+' font-size="160" fill="#14131a">CDG</text></g>');
// White ink on transparent cloth patches. Each occupied row is a different screen print.
let ink='';
for (const [i,lines] of [['CDG'],['1986 été','COMME des GARÇONS'],['CDG','COMME des GARÇONS'],['CDG','CDG','CDG'],['Printemps-Été 1986','COMME des GARÇONS']].entries()) {
 const size=lines.length===1?94:lines.length===3?39:48;
 lines.forEach((s,j)=>{const y=i*128+(128-lines.length*size)/2+(j+1)*size-5;
 const stretch=s==='CDG'? (lines.length===1?2.12:lines.length===3?4.85:3.55) : 1.15;
 ink+='<text transform="translate(256 0) scale('+stretch+' 1)" x="0" y="'+y+'" text-anchor="middle" '+bold+' font-size="'+(s.length>9?30:size)+'" fill="white">'+s+'</text>';});
}
await tile('ink',512,1024,ink);
