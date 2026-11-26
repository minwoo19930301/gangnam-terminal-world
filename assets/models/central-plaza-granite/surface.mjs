import {readFileSync} from 'node:fs';
import {courtBounds,pavingLevel} from './layout.js';
import {terminalOrigin,terminalPoint,terminalRotation} from '../../../js/places/sweet-park-plan.js';
import {relief} from '../../../js/banpo_relief.js';

const {width,depth,pavers} = JSON.parse(readFileSync(0,'utf8'));
const [s0,t0,s1,t1] = courtBounds;
const cos = Math.cos(terminalRotation), sin = Math.sin(terminalRotation);
// Match the world-anchored U coordinate and downward canvas rows from K.hpoly.
const phaseT = terminalOrigin[0]*cos - terminalOrigin[1]*sin;
const phaseS = terminalOrigin[0]*sin + terminalOrigin[1]*cos;
const column0 = Math.floor((t0+phaseT)/width), column1 = Math.floor((t1+phaseT)/width);
const row0 = Math.floor((s0+phaseS)/depth), row1 = Math.floor((s1+phaseS)/depth);
const centre = terminalPoint((s0+s1)/2,(t0+t1)/2);
const anchor = [centre[0],-centre[1],relief(...centre)];
// The game serialises the editable sample edges in millimetres.
const edges = (axis,limit) => [...new Set([0,limit,...pavers.flatMap(p=>
  [p[axis],p[axis+1]].map(m=>Math.round(m*1000)/1000))])].sort((a,b)=>a-b);
const columns = edges(0,width), rows = edges(2,depth);
const pattern = [];
for (let j=1;j<rows.length;j++) for (let i=1;i<columns.length;i++) {
  const left=columns[i-1],right=columns[i],near=rows[j-1],far=rows[j];
  const t=(left+right)/2,s=(near+far)/2;
  const stone=pavers.find(([a,b,c,d])=>t>a && t<b && s>c && s<d);
  pattern.push([left,right,near,far,stone?.[4] ?? 0]);
}
const vertices = [], faces = [], slots = [], indices = new Map();
function corner(t,s) {
  const key=Math.round(t*1e6)+','+Math.round(s*1e6);
  if (!indices.has(key)) {
    indices.set(key,vertices.length);
    const [x,z] = terminalPoint(s,t);
    vertices.push([x-anchor[0],-z-anchor[1],relief(x,z)+pavingLevel-anchor[2]]);
  }
  return indices.get(key);
}
for (let row=row0;row<=row1;row++) {
  for (let col=column0;col<=column1;col++) {
    const offsetT=col*width-phaseT, offsetS=row*depth-phaseS;
    for (const [left,right,near,far,slot] of pattern) {
      const t=Math.max(offsetT+left,t0), endT=Math.min(offsetT+right,t1);
      const s=Math.max(offsetS+near,s0), endS=Math.min(offsetS+far,s1);
      if (endT-t<.00001 || endS-s<.00001) continue;
      // Grout and stone share the same terrain vertices along every edge.
      faces.push([corner(t,s),corner(t,endS),corner(endT,endS),corner(endT,s)]);
      slots.push(slot);
    }
  }
}
process.stdout.write(JSON.stringify({anchor,vertices,faces,slots}));
