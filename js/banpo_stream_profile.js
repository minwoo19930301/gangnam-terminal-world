// The 25 m survey grid mixes the road and greenway into one surface at this
// crossing. This small illustrative bank profile leaves the surrounding grid
// intact. Only the upper road datum is supported by the public spot height.
import {terminalSurveyHeight} from './banpo_dem.js';

export const streamGrid={x0:-775,z0:525,step:2.5,width:41,height:41};
export const streamDeckIds=new Set([604527964,1232132187,1232132154]);
export const streamRoad=604527964;
export const streamWalk=604527966;
const roadHeight=16-terminalSurveyHeight;

function blend(a,b,x){
  const t=Math.max(0,Math.min(1,(x-a)/(b-a)));
  return t*t*(3-2*t);
}
export function bankHeight(x,z,base){
  const dx=x+725.2,dz=z-578.5;
  const along=.906*dx-.423*dz,cross=.423*dx+.906*dz;
  const envelope=(1-blend(18,40,Math.abs(along)))*(1-blend(22,42,Math.abs(cross)))
    *blend(0,6,Math.min(x+775,-675-x,z-525,625-z));
  const crest=cross<0?blend(11,15,-cross):blend(8,14,cross);
  const low=Math.min(base,.45);
  return base+envelope*(low+crest*(roadHeight-low)-base);
}

// The water's own surface stays below the public walk. Applying the bank
// displacement directly to a broad water triangle would tilt it up the slope.
export function streamWaterBase(x,z,ground){
  if(x < -775 || x > -675 || z < 525 || z > 625)return ground;
  const dx=x+725.2,dz=z-578.5;
  const along=.906*dx-.423*dz,cross=.423*dx+.906*dz;
  const weight=(1-blend(18,40,Math.abs(along)))*(1-blend(22,40,Math.abs(cross)))
    *blend(0,6,Math.min(x+775,-675-x,z-525,625-z));
  return ground*(1-weight);
}
