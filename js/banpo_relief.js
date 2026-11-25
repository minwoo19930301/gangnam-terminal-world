import { samples, x0, z0, step, width, height } from './banpo_dem.js';
import { gardenReference } from './garden_terrain.js';

// Model floors, portal URLs and movement use the terminal's local reference.
// Exterior pages lift both the rendered world and the player's eye into the
// survey frame. A dedicated interior keeps its authored level floor plates.
let enabled = true;
const lastX = width - 1, lastZ = height - 1;

export function exteriorReliefEnabled() { return enabled; }

const city = {x0,z0,step,width,height,samples};
const garden = {x0:-150,z0:-175,step:5,width:131,height:96};
const inGarden = (x,z) => x>=garden.x0 && x<=garden.x0+(garden.width-1)*garden.step &&
  z>=garden.z0 && z<=garden.z0+(garden.height-1)*garden.step;

function sample(grid,x,z) {
  const u=Math.min(grid.width-1,Math.max(0,(x-grid.x0)/grid.step));
  const v=Math.min(grid.height-1,Math.max(0,(z-grid.z0)/grid.step));
  const i=Math.min(grid.width-2,Math.floor(u)), j=Math.min(grid.height-2,Math.floor(v));
  const a=u-i, b=v-j, k=j*grid.width+i, values=grid.samples;
  if (a+b<=1) return values[k]*(1-a-b)+values[k+1]*a+values[k+grid.width]*b;
  return values[k+grid.width+1]*(a+b-1)+values[k+1]*(1-b)+values[k+grid.width]*(1-a);
}

garden.samples=new Float32Array(garden.width*garden.height);
const changedCells=new Uint8Array(lastX*lastZ);
for(let j=0;j<garden.height;j++) for(let i=0;i<garden.width;i++) {
  const x=garden.x0+i*garden.step, z=garden.z0+j*garden.step;
  const ground=sample(city,x,z), registered=gardenReference(x,z,ground);
  garden.samples[j*garden.width+i]=registered;
  if (Math.abs(registered-ground)<1e-7) continue;
  // A changed node can influence both sides of a coarse grid boundary.
  for(const dx of [-.01,.01]) for(const dz of [-.01,.01])
    changedCells[Math.floor((z+dz-z0)/step)*lastX+Math.floor((x+dx-x0)/step)]=1;
}

export function surveyElevation(x,z) { return sample(city,x,z); }

export function relief(x,z) {
  if (!enabled) return 0;
  return sample(inGarden(x,z)?garden:city,x,z);
}

// Linear interpolation stays inside the range of the grid corners. This
// bounds shader displacement even for facades spanning several terrain cells.
export function maxReliefInBounds(minX, minZ, maxX, maxZ) {
  if (!enabled) return 0;
  const xMin = Math.max(0, Math.min(lastX, Math.floor((minX-x0) / step)));
  const zMin = Math.max(0, Math.min(lastZ, Math.floor((minZ-z0) / step)));
  const xMax = Math.max(0, Math.min(lastX, Math.ceil((maxX-x0) / step)));
  const zMax = Math.max(0, Math.min(lastZ, Math.ceil((maxZ-z0) / step)));
  let limit = 0;
  for (let j = zMin; j <= zMax; j++) {
    for (let i = xMin; i <= xMax; i++) limit = Math.max(limit, Math.abs(samples[j * width + i]));
  }
  if (minX<=garden.x0+(garden.width-1)*garden.step && maxX>=garden.x0 &&
      minZ<=garden.z0+(garden.height-1)*garden.step && maxZ>=garden.z0) {
    const loX=Math.max(0,Math.floor((minX-garden.x0)/garden.step));
    const loZ=Math.max(0,Math.floor((minZ-garden.z0)/garden.step));
    const hiX=Math.min(garden.width-1,Math.ceil((maxX-garden.x0)/garden.step));
    const hiZ=Math.min(garden.height-1,Math.ceil((maxZ-garden.z0)/garden.step));
    for(let j=loZ;j<=hiZ;j++) for(let i=loX;i<=hiX;i++)
      limit=Math.max(limit,Math.abs(garden.samples[j*garden.width+i]));
  }
  return limit;
}

export function installRelief(THREE, exterior = true) {
  enabled = exterior;
  // One nearest-neighbour read gives the four surveyed corners of a cell.
  // The GPU uses the same two planar triangles as the CPU and paving mesh.
  function cellTexture(grid) {
    const cols=grid.width-1,rows=grid.height-1, cells=new Float32Array(cols*rows*4);
    for(let j=0;j<rows;j++) for(let i=0;i<cols;i++) {
      const k=j*grid.width+i,o=4*(j*cols+i), data=grid.samples;
      cells[o]=data[k]; cells[o+1]=data[k+1]; cells[o+2]=data[k+grid.width]; cells[o+3]=data[k+grid.width+1];
    }
    const texture=new THREE.DataTexture(cells,cols,rows,THREE.RGBAFormat,THREE.FloatType);
    texture.needsUpdate=true;
    return texture;
  }
  const sampler=exterior?cellTexture(city):null, localSampler=exterior?cellTexture(garden):null;
  function shaderGrid(name,grid) {
    const cols=grid.width-1, rows=grid.height-1;
    return `uniform highp sampler2D ${name}Cells;
float ${name}Height(vec2 p) {
  vec2 uv=clamp((p-vec2(${grid.x0}.0,${grid.z0}.0))/${grid.step}.0,vec2(0.),vec2(${cols}.0,${rows}.0));
  vec2 ij=min(floor(uv),vec2(${cols-1}.0,${rows-1}.0)), f=uv-ij;
  vec4 h=texture2D(${name}Cells,(ij+0.5)/vec2(${cols}.0,${rows}.0));
  return f.x+f.y<=1.0 ? h.x*(1.0-f.x-f.y)+h.y*f.x+h.z*f.y :
    h.w*(f.x+f.y-1.0)+h.y*(1.0-f.y)+h.z*(1.0-f.x);
}`;
  }
  const terrainFunction=exterior ? `${shaderGrid('city',city)}
${shaderGrid('garden',garden)}
float banpoHeight(vec2 p) {
  if (all(greaterThanEqual(p,vec2(${garden.x0}.0,${garden.z0}.0))) &&
      all(lessThanEqual(p,vec2(${garden.x0+(garden.width-1)*garden.step}.0,${garden.z0+(garden.height-1)*garden.step}.0))))
    return gardenHeight(p);
  return cityHeight(p);
}` : 'float banpoHeight(vec2 p) { return 0.0; }';
  for (const library of Object.values(THREE.ShaderLib)) {
    library.vertexShader = library.vertexShader.replace('#include <common>', '#include <common>\n' + terrainFunction);
    if (sampler) {
      library.uniforms.cityCells={value:sampler};
      library.uniforms.gardenCells={value:localSampler};
    }
  }
  const project = THREE.ShaderChunk.project_vertex;
  THREE.ShaderChunk.project_vertex = project.replace('mvPosition = modelViewMatrix * mvPosition;', `
    #ifndef BANPO_RIGID
      #ifdef USE_INSTANCING
        float reliefY = banpoHeight((modelMatrix * instanceMatrix[3]).xz);
      #else
        float reliefY = banpoHeight((modelMatrix * mvPosition).xz);
      #endif
    #endif
    mvPosition = modelViewMatrix * mvPosition;
    #ifndef BANPO_RIGID
      mvPosition += viewMatrix[1] * reliefY;
    #endif`);
  const sprite = THREE.ShaderLib.sprite;
  sprite.vertexShader = sprite.vertexShader.replace('mvPosition.xy += rotatedPosition;',
    'mvPosition += viewMatrix[1] * banpoHeight(modelMatrix[3].xz);\nmvPosition.xy += rotatedPosition;');
}

const axes = [0, 2, 3];
function cutAt(poly,index,grid) {
  const step=grid.step, origin=index===0?grid.x0:index===1?grid.z0:grid.x0+grid.z0;
  const limit=index===0?grid.width-1:index===1?grid.height-1:grid.width+grid.height-3;
  const axis = axes[index];
  let lo = Infinity, hi = -Infinity;
  for (const p of poly) {
    const t = axis === 3 ? p[0]+p[2] : p[axis];
    lo = Math.min(lo,t); hi = Math.max(hi,t);
  }
  const first = Math.max(index===2 ? 1 : 0, Math.floor((lo-origin+1e-7)/step)+1);
  const last = Math.min(limit, Math.ceil((hi-origin-1e-7)/step)-1);
  return first <= last ? origin + Math.floor((first+last)/2)*step : null;
}

// Cut each convex face on the same cell edges and diagonals used by relief().
// Work inward from the middle grid line so the large, perforated ground plate
// visits only the cells touched by each triangle, including near the map rim.
export function terrainPieces(points, uvs) {
  if (!enabled) return null;
  function needsLocalCut(poly) {
    // The caller has already cut this face to one 25 m survey triangle.
    let x=0,z=0;
    for(const p of poly) { x+=p[0]; z+=p[2]; }
    x/=poly.length; z/=poly.length;
    if (!inGarden(x,z)) return false;
    return changedCells[Math.floor((z-z0)/step)*lastX+Math.floor((x-x0)/step)]!==0;
  }
  let firstAxis = 0;
  while (firstAxis < 3 && cutAt(points,firstAxis,city) === null) firstAxis++;
  if (firstAxis===3 && (!needsLocalCut(points) || axes.every((_,i)=>cutAt(points,i,garden)===null))) return null;

  const pieces = [];
  function divide(poly, index, grid) {
    for (; index < 3; index++) {
      const cut = cutAt(poly,index,grid);
      if (cut === null) continue;
      const axis = axes[index], lower = [], upper = [];
      for (let i=0;i<poly.length;i++) {
        const a=poly[i], b=poly[(i+1)%poly.length];
        const da=(axis===3?a[0]+a[2]:a[axis])-cut, db=(axis===3?b[0]+b[2]:b[axis])-cut;
        if (da<=0) lower.push(a);
        if (da>=0) upper.push(a);
        if (da*db<0) {
          const t=da/(da-db);
          const intersection=a.map((value,k)=>value+t*(b[k]-value));
          lower.push(intersection); upper.push(intersection);
        }
      }
      if (lower.length>=3) divide(lower,index,grid);
      if (upper.length>=3) divide(upper,index,grid);
      return;
    }
    if (grid===city && needsLocalCut(poly)) divide(poly,0,garden);
    else pieces.push(poly);
  }
  divide(points.map((p,i)=>[...p,...uvs[i]]),firstAxis,city);
  return pieces;
}
