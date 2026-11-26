// Painted base colour, roughness and microrelief for the photographed Gangnam plate.
import sharp from 'sharp';
import path from 'node:path';
const size=768,cell=192, rgb=Buffer.alloc(size*size*3),response=Buffer.alloc(rgb.length),normal=Buffer.alloc(rgb.length);
const palettes=[
 [234,230,215,51],[237,228,203,97],[112,49,18,38],[190,116,45,60],
 [38,27,34,46],[111,143,53,84],[220,64,35,75],[144,99,63,82],
 [215,167,72,57],[236,186,53,86],[170,116,59,74],[84,87,87,48],
 [33,32,30,77],[76,114,48,99],[231,213,170,77],[144,75,33,42]
];
function hash(x,y,s){
 const v=Math.sin(x*127.1+y*311.7+s*97.1)*43758.5453123;
 return v-Math.floor(v);
}
function noise(x,y,s) {
 const i=Math.floor(x),j=Math.floor(y);let u=x-i,v=y-j;
 u=u*u*(3-2*u);v=v*v*(3-2*v);
 return (hash(i,j,s)*(1-u)+hash(i+1,j,s)*u)*(1-v)+(hash(i,j+1,s)*(1-u)+hash(i+1,j+1,s)*u)*v;
}
const amplitude=[1.2,8.0,19.0,23.0,12.0,14,15,20,9,5,18,3,3,12,7,12];
const ripple=[.09,.38,.18,.73,.34,.33,.33,.70,.06,.26,.50,.19,.07,.40,.20,.43];
const heights=new Float32Array(size*size);
for(let y=0;y<size;y++)for(let x=0;x<size;x++){
 const cellid=Math.floor(y/cell)*4+Math.floor(x/cell),px=x%cell,py=y%cell,u=px/cell,v=py/cell;
 const [r,g,b,rough]=palettes[cellid],n1=noise(u*7,v*7,cellid),n2=noise(u*23,v*23,cellid+2),n3=noise(u*55,v*55,cellid+4);
 let shade=(n1-.5)*1.12+(n2-.5)*.75+(n3-.5)*.35;
 if(cellid===3)shade+=.4*Math.sin(8*u+5*v+3*n1)+.2*Math.sin(52*u+38*v+2*n2);
 if(cellid===4)shade+=.31*Math.sin(46*v+4*Math.sin(5*u)+2*n2);
 if(cellid===1)shade+=.25*Math.cos(11*v+4*u);
 const grain=amplitude[cellid]*shade,i=(y*size+x)*3;
 const greenFactor=cellid===4?.44:cellid===3?.8:.92;
 rgb[i]=r+grain;rgb[i+1]=g+grain*greenFactor;rgb[i+2]=b+grain*(cellid===4?1.3:.62);
 response[i]=255;response[i+1]=rough+(n2-.5)*24;response[i+2]=cellid===11?213:cellid===12?24:0;
 heights[y*size+x]=(n2*.32+n3*.43+noise(u*88,v*88,cellid+8)*.25)*ripple[cellid];
}
for(let y=0;y<size;y++)for(let x=0;x<size;x++){
 const i=(y*size+x)*3,gx=x%cell,gy=y%cell;
 const dx=(heights[y*size+x+(gx===cell-1?0:1)]-heights[y*size+x-(gx===0?0:1)])*1.65;
 const dy=(heights[(y+(gy===cell-1?0:1))*size+x]-heights[(y-(gy===0?0:1))*size+x])*1.65,l=Math.hypot(dx,dy,1);
 normal[i]=Math.round(127.5-127.5*dx/l);normal[i+1]=Math.round(127.5+127.5*dy/l);normal[i+2]=Math.round(127.5+127.5/l);
}
for(const [name,pixels] of [['table-food',rgb],['table-finish',response],['food-grain',normal]]){
 await sharp(pixels,{raw:{width:size,height:size,channels:3}}).png().toFile(path.join(process.argv[2],name+'.png'));
}
