// Original illustrations for the four boxes in the opening display.
import sharp from 'sharp';
import {fileURLToPath} from 'node:url';
const panels = [];
const rect=(x,y,w,h,fill,r=0)=>`<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${r}" fill="${fill}"/>`;
const path=(d,fill,stroke='none',sw=1)=>`<path d="${d}" fill="${fill}" stroke="${stroke}" stroke-width="${sw}" stroke-linejoin="round"/>`;
const circ=(x,y,r,c)=>`<circle cx="${x}" cy="${y}" r="${r}" fill="${c}"/>`;
const text=(x,y,s,t,c='white')=>`<text x="${x}" y="${y}" font-family="sans-serif" font-weight="bold" font-size="${s}" fill="${c}">${t}</text>`;
const coral='#cb232c', blue='#1373b2', gold='#ffd13c', ink='#162330';
const mark=rect(16,16,47,43,'#bc1727',2)+text(20,44,15,'LEGO');
function panel(i,bg,art,caption,number) {
  const x=(i%2)*512,y=Math.floor(i/2)*512;
  panels.push(`<g transform="translate(${x} ${y})">${rect(0,0,512,512,bg)}${art}${mark}${text(76,46,15,'LEGO',i===0?ink:'#fff')}${rect(0,447,512,65,i===0?'#f3ba25':'#141b24')}${text(20,485,24,caption,i===0?ink:'#fff')}${text(418,484,19,number,i===0?ink:'#fff')}</g>`);
}
let fig=rect(0,0,512,447,'#eef3ec')+path('M248 94L405 95 385 405 201 403Z','#d8e7ed');
fig+=path('M202 302L310 292 314 391 267 399 260 359 246 359 248 396 194 404Z','#075187');
fig+=path('M193 384L248 377 252 407 196 415ZM263 380L314 373 324 398 269 408Z',blue);
fig+=path('M203 206L274 195 311 290 291 309 189 316Z',coral)+path('M274 195L301 202 324 283 311 291Z','#971b2c');
fig+=path('M205 203L184 212 166 269 144 299 164 312 195 284 216 232ZM303 207L324 213 344 279 324 306 306 294 324 267Z','#b82026');
for(const [x,y] of [[148,307],[324,305]])fig+=path(`M${x-9} ${y-13}q21 -12 26 9l-11 17 -9 -5 8 -11 -8 -3 -7 12 -9 -4z`,gold);
fig+=rect(221,166,46,40,gold,6)+rect(205,122,74,68,gold,14)+path('M199 134q-1 -63 42 -64 44 1 45 62l-18 6z',blue)+path('M195 130l84 -4 18 6 -15 6 -90 2z','#085b98');
fig+=circ(224,155,3,ink)+circ(244,154,3,ink)+path('M222 167q11 8 22 -1','none',ink,3);
panel(0,'#edf3ec',fig,'대형 미니피겨','40649');
let car=path('M40 388L145 367 477 322 450 355 114 413Z','#141619');
for(const [x,y,r] of [[125,344,32],[396,284,26]])car+=circ(x,y,r,'#121416')+circ(x,y,r*.73,'#f3eee4')+circ(x,y,r*.45,'#919ca4')+circ(x,y,r*.28,'#454d54');
car+=path('M39 293L126 254 233 236 280 197 367 189 406 210 446 207 461 238 446 257 426 264Q413 237 390 252Q373 262 369 285L157 337Q151 302 128 311Q103 317 95 351L46 359Z','#d42b32');
car+=path('M50 291L153 259 237 244 211 267 104 308Z','#f14847')+path('M242 241L281 204 356 198 335 222Z','#c0d1d5')+path('M156 295L373 238 360 259 170 315Z','#fff4de');
car+=path('M42 325l52 -9 -4 18 -45 10Z','#222b33')+path('M38 345l55 -11 -3 7 -50 14Z','#ccd1cc');
for(const x of [49,65,90,104])car+=circ(x,316-(x-49)*.27,6,'#fcf4d6');
panel(1,'#252932',car,'Corvette','10321');
let castle=path('M0 370Q82 265 171 323Q306 238 401 299Q470 253 512 263V448H0Z','#314968');
for(const [x,y,h,w] of [[105,252,97,33],[159,194,146,37],[203,204,148,51],[257,133,188,46],[308,191,153,40],[369,245,106,32]]){
 castle+=rect(x,y,w,h,'#e8d5b1')+path(`M${x-8} ${y}l${w/2+8} -${w*1.44} ${w/2+8} ${w*1.44}Z`,'#4479a9');
 for(let yy=y+18;yy<y+h-8;yy+=26)castle+=rect(x+w*.40,yy,7,12,'#485d78',3);
}
castle+=rect(137,319,227,47,'#d9be97')+path('M232 369v-23q13 -24 27 0v23z','#4d5568');
for(let j=0;j<34;j++)castle+=circ((j*137+36)%512,60+(j*149)%192,j%3===0?2:1,'#f7e0a9');
panel(2,'#1a283e',castle,'디즈니 캐슬','43222');
let fort=path('M20 354L205 283 465 306 477 347 272 408 48 392Z','#368489')+path('M59 348l161 -56 202 20 -6 31 -157 40 -182 -10Z','#b2a083');
for(const [x,y,w,h] of [[105,249,67,81],[175,277,88,51],[258,224,65,88],[326,244,46,62]]){
 fort+=rect(x,y,w,h,'#e9e3cd')+rect(x,y,w,11,'#e6b835');
 for(let j=x;j<x+w;j+=15)fort+=rect(j,y-9,8,10,'#f0e4c7');
 fort+=rect(x+w*.34,y+26,w*.25,h-27,'#75695d',6);
}
for(const [x,y] of [[84,294],[370,286]])fort+=path(`M${x} ${y}q12 -56 0 -85 m0 0q-32 -24 -51 0 29 -4 49 3 -12 -37 -36 -36 21 18 34 34 17 -39 35 -38 -17 20 -32 39 31 -20 50 -7 -30 -1 -48 12`,'#467f49','#446d43',5);
panel(3,'#468ca6',fort,'엘도라도 요새','10320');
const svg=`<svg xmlns="http://www.w3.org/2000/svg" width="1024" height="1024">${panels.join('')}</svg>`;
await sharp(Buffer.from(svg)).png({palette:true,colours:176}).toFile(fileURLToPath(new URL('cartons.png',import.meta.url)));
