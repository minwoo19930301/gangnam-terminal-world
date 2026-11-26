import {FONT} from '../../../js/textures.js';

export function paintClock(ctx,id,now){
  ctx.fillStyle='#101917';ctx.fillRect(0,0,512,128);
  ctx.fillStyle='#a7d98d';ctx.font='650 24px '+FONT;ctx.textBaseline='middle';
  ctx.fillText('고속터미널  '+id.slice(0,2)+'-'+id.slice(2),16,27);
  ctx.fillStyle='#596657';ctx.fillRect(15,51,481,1);
  ctx.fillStyle='#ffbc61';ctx.font='700 42px '+FONT;ctx.fillText('서울 시각',16,89);
  ctx.textAlign='right';ctx.fillStyle='#ffe7ae';ctx.font='600 49px monospace';ctx.fillText(now,498,90);
  ctx.textAlign='left';
}
