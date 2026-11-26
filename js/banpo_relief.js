import { samples, x0, z0, step, width, height } from './banpo_dem.js';
import { heightEdits } from '../assets/models/world/height-edits.js';
import {bankHeight,streamGrid as creek} from './banpo_stream_profile.js';
import { gardenReference } from './garden_terrain.js';

// Model floors, portal URLs and movement use the terminal's local reference.
// Exterior pages lift both the rendered world and the player's eye into the
// survey frame. A dedicated interior keeps its authored level floor plates.
let enabled = true;
const lastX = width - 1, lastZ = height - 1;

export function exteriorReliefEnabled() { return enabled; }

const survey = {x0,z0,step,width,height,samples};
const city = {...survey, samples:Object.keys(heightEdits.city).length ? samples.slice() : samples};
for (const [index,metres] of Object.entries(heightEdits.city)) city.samples[index]=metres;
const garden = {x0:-175,z0:-175,step:5,width:136,height:96};
const inGarden = (x,z) => x>=garden.x0 && x<=garden.x0+(garden.width-1)*garden.step &&
  z>=garden.z0 && z<=garden.z0+(garden.height-1)*garden.step;

const inCreek = (x,z) => x>=creek.x0 && x<=creek.x0+(creek.width-1)*creek.step &&
  z>=creek.z0 && z<=creek.z0+(creek.height-1)*creek.step;
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
  const index=j*garden.width+i;
  // The five western columns extend the garden under the terminal. Original
  // Blender vertex keys remain valid for previously exported height edits.
  const editKey = i>=5 ? j*131+i-5 : 131*garden.height+j*5+i;
  garden.samples[index]=heightEdits.garden[editKey] ?? registered;
  if (Math.abs(garden.samples[index]-ground)<1e-7) continue;
  // A changed node can influence both sides of a coarse grid boundary.
  for(const dx of [-.01,.01]) for(const dz of [-.01,.01])
    changedCells[Math.floor((z+dz-z0)/step)*lastX+Math.floor((x+dx-x0)/step)]=1;
}

creek.samples=new Float32Array(creek.width*creek.height);
const creekBase=new Float32Array(creek.samples.length);
for(let j=0;j<creek.height;j++) for(let i=0;i<creek.width;i++){
  const x=creek.x0+i*creek.step,z=creek.z0+j*creek.step,index=j*creek.width+i;
  creekBase[index]=bankHeight(x,z,sample(city,x,z));
  creek.samples[index]=heightEdits.creek?.[index]??creekBase[index];
}
const creekLimit=creek.samples.reduce((limit,value)=>Math.max(limit,Math.abs(value)),0);
export function surveyElevation(x,z) { return sample(survey,x,z); }

// The route audit normally compares an anonymous ground plane to the raw
// survey to avoid selecting a basement. The publicly modelled stream banks
// have an explicit baseline; later manual edits remain independently detectable.
const creekReference={...creek,samples:creekBase};
export function publicGroundReference(x,z){
  return inCreek(x,z)?sample(creekReference,x,z):surveyElevation(x,z);
}

// The Blender seed carries both baseline and authored values. Baking/exporting
// again therefore preserves sparse edits without altering the source survey.
export function editableGroundGrids() {
  const baseline=Array.from(garden.samples,(_,index)=>{
    const x=garden.x0+(index%garden.width)*garden.step, z=garden.z0+Math.floor(index/garden.width)*garden.step;
    return gardenReference(x,z,sample(city,x,z));
  });
  const record=(grid,base)=>({x:grid.x0,z:grid.z0,width:grid.width,height:grid.height,step:grid.step,rows:Array.from(grid.samples),base:Array.from(base)});
  return {city:record(city,survey.samples),garden:record(garden,baseline),creek:record(creek,creekBase)};
}

export function relief(x,z) {
  if (!enabled) return 0;
  return sample(inGarden(x,z)?garden:inCreek(x,z)?creek:city,x,z);
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
    for (let i = xMin; i <= xMax; i++) limit = Math.max(limit, Math.abs(city.samples[j * width + i]));
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
  if(minX<=-675 && maxX>=-775 && minZ<=625 && maxZ>=525)
    limit=Math.max(limit,creekLimit);
  return limit;
}

export function installRelief(THREE, exterior = true) {
  enabled = exterior;
  // One nearest-neighbour read gives the four surveyed corners of a cell.
  // The GPU uses the same two planar triangles as the CPU and paving mesh.
  const cityCols=city.width-1,cityCells=cityCols*(city.height-1);
  const creekCells=(creek.width-1)*(creek.height-1);
  const atlasRows=city.height-1+Math.ceil(creekCells/cityCols);
  function cellTexture(grid,extra) {
    const cols=grid.width-1,rows=extra?atlasRows:grid.height-1;
    const cells=new Float32Array(cols*rows*4);
    function write(source,start){
      for(let j=0;j<source.height-1;j++)for(let i=0;i<source.width-1;i++){
        const k=j*source.width+i,o=4*(start+j*(source.width-1)+i),data=source.samples;
        cells[o]=data[k];cells[o+1]=data[k+1];cells[o+2]=data[k+source.width];cells[o+3]=data[k+source.width+1];
      }
    }
    write(grid,0);
    if(extra)write(extra,cityCells);
    const texture=new THREE.DataTexture(cells,cols,rows,THREE.RGBAFormat,THREE.FloatType);
    texture.needsUpdate=true;
    return texture;
  }
  // Append 1,600 local cells to the existing survey texture: no additional
  // sampler or draw call, and only the selected region is sampled per vertex.
  const sampler=exterior?cellTexture(city,creek):null,localSampler=exterior?cellTexture(garden):null;
  function shaderGrid(name,grid) {
    const cols=grid.width-1,rows=grid.height-1,isLocal=grid===creek;
    const texture=grid===garden?'gardenCells':'cityCells';
    const size=grid===garden?`vec2(${cols}.0,${rows}.0)`:`vec2(${cityCols}.0,${atlasRows}.0)`;
    const cell=isLocal?`float index=${cityCells}.0+ij.y*${cols}.0+ij.x;
  vec2 address=vec2(mod(index,${cityCols}.0),floor(index/${cityCols}.0));`:'vec2 address=ij;';
    return `${isLocal?'':'uniform highp sampler2D '+texture+';'}
float ${name}Height(vec2 p) {
  vec2 uv=clamp((p-vec2(${grid.x0}.0,${grid.z0}.0))/${grid.step.toFixed(1)},vec2(0.),vec2(${cols}.0,${rows}.0));
  vec2 ij=min(floor(uv),vec2(${cols-1}.0,${rows-1}.0)), f=uv-ij;
  ${cell}
  vec4 h=texture2D(${texture},(address+0.5)/${size});
  return f.x+f.y<=1.0 ? h.x*(1.0-f.x-f.y)+h.y*f.x+h.z*f.y :
    h.w*(f.x+f.y-1.0)+h.y*(1.0-f.y)+h.z*(1.0-f.x);
}`;
  }
  const terrainFunction=exterior ? `${shaderGrid('city',city)}
${shaderGrid('garden',garden)}
${shaderGrid('creek',creek)}
float banpoHeight(vec2 p) {
  if (all(greaterThanEqual(p,vec2(${garden.x0}.0,${garden.z0}.0))) &&
      all(lessThanEqual(p,vec2(${garden.x0+(garden.width-1)*garden.step}.0,${garden.z0+(garden.height-1)*garden.step}.0))))
    return gardenHeight(p);
  if (all(greaterThanEqual(p,vec2(-775.,525.))) && all(lessThanEqual(p,vec2(-675.,625.)))) return creekHeight(p);
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
  function localCutGrid(poly) {
    // The caller has already cut this face to one 25 m survey triangle.
    let x=0,z=0;
    for(const p of poly) { x+=p[0]; z+=p[2]; }
    x/=poly.length; z/=poly.length;
    if(inCreek(x,z))return creek;
    if(inGarden(x,z)&&changedCells[Math.floor((z-z0)/step)*lastX+Math.floor((x-x0)/step)]!==0)return garden;
    return null;
  }
  let firstAxis = 0;
  while (firstAxis < 3 && cutAt(points,firstAxis,city) === null) firstAxis++;
  if(firstAxis===3){
    const local=localCutGrid(points);
    if(!local || axes.every((_,i)=>cutAt(points,i,local)===null))return null;
  }

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
    const local=grid===city && localCutGrid(poly);
    if (local) divide(poly,0,local);
    else pieces.push(poly);
  }
  divide(points.map((p,i)=>[...p,...uvs[i]]),firstAxis,city);
  return pieces;
}
