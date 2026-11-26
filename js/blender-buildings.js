// A district uses detailed Blender exteriors around its occupied footprint.
// The complete catalog is also the editing/diagnostic path used by Node and full-scene shots.
const catalog = new URL('../assets/models/world/buildings.json.gz',import.meta.url);
const index = new URL('./building-tiles/index.json',catalog);

async function readCatalog(url) {
  if (url.protocol === 'file:') {
    const {readFile} = await import('node:fs/promises');
    const {gunzipSync} = await import('node:zlib');
    return JSON.parse(gunzipSync(await readFile(url)).toString('utf8'));
  }
  const result = await fetch(url);
  if (!result.ok) throw new Error('Exterior mesh request failed (' + result.status + ')');
  const bytes = new Uint8Array(await result.arrayBuffer());
  if (bytes[0] !== 0x1f || bytes[1] !== 0x8b) return JSON.parse(new TextDecoder().decode(bytes));
  const stream = new Blob([bytes]).stream().pipeThrough(new DecompressionStream('gzip'));
  return new Response(stream).json();
}

let buildings = catalog.protocol === 'file:' ? await readCatalog(catalog) : {};
export async function loadBuildingArea(bounds) {
  if (!bounds) { buildings = await readCatalog(catalog); return; }
  const response = await fetch(index);
  if (!response.ok) throw new Error('Exterior mesh index failed (' + response.status + ')');
  const {tiles, omit} = await response.json();
  const nearby = tiles.filter(({bounds:b}) => b[0]<=bounds[2] && b[1]<=bounds[3] && b[2]>=bounds[0] && b[3]>=bounds[1]);
  const chunks = await Promise.all(nearby.map(t => readCatalog(new URL(t.file,index))));
  buildings = Object.assign(Object.fromEntries(omit.map(id=>[id,['omit']])), ...chunks);
}
const plainUV = [[0,0],[1,0],[0,1]];

export function drawBlenderBuilding(K, building, tint, role='city') {
  const data = buildings[building.id] || buildings[[building.id,...building.poly[0].map(v=>Math.round(v*100))].join(':')];
  if (!data) return false;
  const [source, slots, positions, faces] = data;
  if (source==='omit') return role==='landmark';
  if (role!==source) return false;
  const materials = slots.map(slot => typeof slot === 'number' || slot === 'roofgravel' ? slot : {tex:slot,color:tint});
  const points = [];
  for (let i=0;i<positions.length;i+=3) points.push([positions[i]/100,positions[i+1]/100,positions[i+2]/100]);
  for (let i=0;i<faces.length;) {
    const a=points[faces[i]], b=points[faces[i+1]], c=points[faces[i+2]];
    const dx=b[0]-a[0], dy=b[1]-a[1], dz=b[2]-a[2];
    const ex=c[0]-a[0], ey=c[1]-a[1], ez=c[2]-a[2];
    const nx=dy*ez-dz*ey, ny=dz*ex-dx*ez, nz=dx*ey-dy*ex;
    const length=Math.hypot(nx,ny,nz);
    const slot=faces[i+3], textured=typeof slots[slot]==='string';
    const uv=textured ? [[faces[i+4]/1000,faces[i+5]/1000],[faces[i+6]/1000,faces[i+7]/1000],[faces[i+8]/1000,faces[i+9]/1000]] : plainUV;
    i+=textured ? 10 : 4;
    if (length) K.triangle(materials[slot],[a,b,c],[nx/length,ny/length,nz/length],uv);
  }
  return true;
}
