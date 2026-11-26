// Original repeat tiles and an illustrated textile inspired by the showroom palette.
import sharp from 'sharp';
import {fileURLToPath} from 'node:url';
const file = name => fileURLToPath(new URL(name,import.meta.url));
async function png(name,w,h,body) {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}">${body}</svg>`;
  await sharp(Buffer.from(svg)).png().toFile(file(name));
}
await png('knit.png',64,64,`<defs><pattern id="p" width="16" height="16" patternUnits="userSpaceOnUse"><rect width="16" height="16" fill="#dedbd7"/><path d="M0 0 Q8 1 8 8 T16 16 M0 16 Q8 15 8 8 T16 0" fill="none" stroke="#fff" stroke-width="3"/><ellipse cx="4" cy="8" rx="2.6" ry="3.4" fill="#92908c"/><ellipse cx="12" cy="0" rx="2.6" ry="3.4" fill="#92908c"/><ellipse cx="12" cy="16" rx="2.6" ry="3.4" fill="#92908c"/></pattern></defs><rect width="64" height="64" fill="url(#p)"/>`);
const waves=Array.from({length:30},(_,i)=>`<path d="M-50 ${i*8} Q 16 ${i*8-52} 80 ${i*8-8} T218 ${i*8-34} T350 ${i*8-70}" fill="none" stroke="#514653" stroke-width="2"/>`).join('');
await png('cushion.png',256,256,`<rect width="256" height="256" fill="#d2beb0"/>${waves}<path d="M206 256 Q160 178 91 172 Q125 158 167 178 Q112 111 124 74 Q156 84 181 150 Q165 75 194 37 Q206 89 198 135 Q220 63 255 66 L260 260" fill="#e7a52d"/><path d="M256 190 Q195 129 193 96 Q224 111 256 143 M256 85 Q212 94 226 40 Q233 55 256 59" fill="#393446"/>`);
const rings=Array.from({length:16},(_,i)=>`<ellipse cx="270" cy="185" rx="${20+i*14}" ry="${10+i*8}" transform="rotate(-22 270 185)" fill="none" stroke="#6b6170" stroke-width="${i%4===0?4:2}"/>`).join('');
await png('rug.png',512,320,`<rect width="512" height="320" fill="#e5d9c4"/><path d="M-40 180 Q100 -40 156 58 T315 92 T570 -10 L540 94 Q416 153 383 127 T205 156 T0 232" fill="#e5ab32"/><path d="M-5 100 Q100 16 167 64 T320 110 T530 20" fill="none" stroke="#413c56" stroke-width="9"/>${rings}<path d="M-14 284 Q105 219 128 251 T250 272 Q365 206 415 236 T534 202" fill="none" stroke="#e8a82e" stroke-width="19"/>`);
