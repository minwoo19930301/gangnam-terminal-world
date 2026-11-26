// Bridge the artist's world-space mesh to the game's registered operator-plan pixels.
import {readFileSync, writeFileSync} from 'node:fs';
import {b1Plan, departmentPoint, departmentWidth, departmentDepth, marketOutline} from '../../../js/places/shinsegae-b1-plan.js';

const target = new URL('../../../js/places/shinsegae-b1-plan.js', import.meta.url);
const project = ([px, py]) => departmentPoint(...b1Plan(px, py));
const [mode] = process.argv.slice(2);

if (mode === 'read') {
  console.log(JSON.stringify(marketOutline.map(project)));
} else if (mode === 'write') {
  const vertices = JSON.parse(readFileSync(0, 'utf8'));
  if (vertices.length !== marketOutline.length) throw Error('Preserve all nine outline corners.');
  const plan = vertices.map(([x, z], i) => {
    let [px, py] = marketOutline[i];
    for (let step = 0; step < 5; step++) {
      const [a, b] = project([px, py]);
      const [cx, cz] = project([px + 1, py]), [dx, dz] = project([px, py + 1]);
      const det = (cx - a) * (dz - b) - (dx - a) * (cz - b);
      px += ((x - a) * (dz - b) - (z - b) * (dx - a)) / det;
      py += ((z - b) * (cx - a) - (x - a) * (cz - b)) / det;
    }
    // The source trace uses integer guide pixels. Sub-pixel moves snap on reimport.
    return [Math.round(px), Math.round(py)];
  });
  // Retain the documented topology: a chamfer and two rectangular west wings.
  // Each return meets the straight department seam at matching local v.
  const [a,b,c,d,e,f,g,h,j] = plan;
  const shape = a[1] === b[1] && b[0] > a[0] && c[0] > b[0] && c[1] > b[1]
    && c[0] === d[0] && d[1] > c[1] && d[1] === e[1] && e[0] > d[0]
    && e[0] === f[0] && f[1] === g[1] && f[0] > g[0] && g[0] === h[0]
    && g[1] > h[1] && h[1] === j[1] && h[0] > j[0] && j[0] === a[0];
  const local = plan.map(p => b1Plan(...p));
  if (!shape || !local.every(([u,v], i) =>
    Number.isFinite(u) && v > 0 && v < departmentDepth && (i < 5 ? u > 0 && u < departmentWidth : u < 0)))
    throw Error('Preserve the chamfer, two orthogonal west wings and the department seam.');
  const rows = [plan.slice(0,6), plan.slice(6)].map(row =>
    '  ' + row.map(point => '[' + point.join(',') + ']').join(', ') + ',');
  const source = readFileSync(target, 'utf8');
  const start = 'export const marketOutline = [\n';
  if (source.split(start).length !== 2) throw Error('Missing or ambiguous market outline.');
  const from = source.indexOf(start) + start.length;
  const end = source.indexOf('\n];', from);
  if (end < 0) throw Error('Incomplete market outline.');
  writeFileSync(target, source.slice(0, from) + rows.join('\n') + source.slice(end));
} else throw Error('Expected read or write.');
