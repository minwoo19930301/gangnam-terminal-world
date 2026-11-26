// Run: node --max-old-space-size=8192 tools/check_surface_walks.mjs [output-dir]
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import * as THREE from 'three';
import { createKit } from '../js/kit.js';
import { createPhysics, createPlayer, pointInPoly, polyBBox } from '../js/physics.js';
import { buildCity } from '../js/city.js';
import { PLACES } from '../js/places/index.js';
import { installRelief, relief, surveyElevation } from '../js/banpo_relief.js';
import { pickReModels, reModelStandIns } from '../js/remodels.js';

const root = fileURLToPath(new URL('../', import.meta.url));
const read = f => JSON.parse(fs.readFileSync(path.join(root,f),'utf8'));
const osm = read('data/osm.json');
const ways = osm.roads.filter(r => ['footway','path','steps','pedestrian'].includes(r.hw));
const raw = new Map();
for (const file of ['osm-extra','osm-core','osm-river']) {
  for (const e of read('data/raw/'+file+'.json').elements)
    if (e.type==='way' && e.tags) raw.set(e.id,e.tags);
}

// Canvas is only needed to construct labels. Use the same no-render context as
// the repository's walk tests; all physics geometry is built by the real kit.
const context = new Proxy({}, {
  get(target,key) {
    if (key==='measureText') return text => ({width:String(text).length*10});
    if (['createLinearGradient','createRadialGradient','createPattern'].includes(key)) return () => ({addColorStop() {}});
    if (key==='getImageData') return () => ({data:new Uint8ClampedArray(4)});
    if (key in target) return target[key];
    if (typeof key==='string') return () => {};
  },
  set(target,key,value) { target[key]=value; return true; }
});
globalThis.__makeCanvas=(width,height)=>({width,height,getContext:()=>context,style:{}});
installRelief(THREE,true);
const scene=new THREE.Scene(), phys=createPhysics(), kit=createKit(THREE,scene,{osm,phys});
kit.onNight=()=>{};
const claims={claimedBuildings:new Set(),claimedRoads:new Set(),claimedAreas:new Set()};
for (const place of PLACES) {
  const mod=await import('../js/places/'+place+'.js');
  kit._.setCurrent(place,mod.meta);
  mod.build(kit);
  for (const [key,field] of [['claimedBuildings','claims'],['claimedRoads','claimRoads'],['claimedAreas','claimAreas']])
    for (const id of mod.meta[field] || []) claims[key].add(id);
}
const estates=pickReModels(read('js/places/_re_models.json'),null);
for (const estate of estates) for (const id of estate.claims) claims.claimedBuildings.add(id);
kit._.setCurrent('city'); buildCity(kit,osm,claims);
reModelStandIns({THREE,K:kit,osm,scene,models:estates,terrain:true});
kit._.buildAllDetail();
if (kit._.detailErrors.length) throw new Error(kit._.detailErrors.join('\n'));
const {r:radius,height,step}=createPlayer(phys);

function exclude(tags,road) {
  // Explicit pedestrian permission overrides a general access prohibition.
  if (['no','private'].includes(tags.foot) || (['private','no'].includes(tags.access) && !['yes','permissive','designated'].includes(tags.foot))) return 'restricted';
  if (road.hw==='steps') return 'steps';
  if (road.bridge || road.layer>0 || /육교|연결다리|(?:[0-9]+교)$/.test(road.name||'')) return 'bridge_or_upper_layer';
  if (road.tunnel || road.layer<0 || tags.location==='underground') return 'tunnel_or_lower_layer';
  if ((road.level!=null && String(road.level)!=='0') || tags.indoor==='yes' || road.covered || tags.conveying) return 'covered_or_other_level';
  return '';
}

// Inside a mapped building footprint, the OSM line alone cannot identify the
// public passage's storey. Courtyards inside holes are open-air again.
const cells=new Map(), cell=40;
const structures=[
  ...osm.buildings.map(b=>({feature:b,reason:'footprint_level_unknown'})),
  ...osm.areas.filter(a=>['man_made:pier','man_made:bridge','natural:water','waterway:riverbank'].includes(a.kind))
    .map(a=>({feature:a,reason:'structure_level_unknown'}))
];
for (const entry of structures) {
  const [x0,z0,x1,z1]=polyBBox(entry.feature.poly);
  for(let ix=Math.floor(x0/cell);ix<=Math.floor(x1/cell);ix++)
    for(let iz=Math.floor(z0/cell);iz<=Math.floor(z1/cell);iz++){
      const key=ix+','+iz;
      if(!cells.has(key)) cells.set(key,[]);
      cells.get(key).push(entry);
    }
}
function overlappingStructure(x,z) {
  const candidates=cells.get(Math.floor(x/cell)+','+Math.floor(z/cell)) || [];
  return candidates.find(({feature}) => pointInPoly(x,z,feature.poly) && !(feature.holes || []).some(h => pointInPoly(x,z,h)));
}

function centerline(pts) {
  const points=[[...pts[0],0]]; let chain=0;
  for(let i=1;i<pts.length;i++){
    const [x,z]=pts[i-1],dx=pts[i][0]-x,dz=pts[i][1]-z,len=Math.hypot(dx,dz);
    const pieces=Math.ceil(len/2);
    for(let n=1;n<=pieces;n++) points.push([x+dx*n/pieces,z+dz*n/pieces,chain+len*n/pieces]);
    chain+=len;
  }
  return points;
}

// Search a local strip following the actual polyline, anchored at its clear
// centreline on both ends. A strip width is measured to the capsule edge.
function groundAt(x,z) {
  if (overlappingStructure(x,z) || Math.abs(relief(x,z)-surveyElevation(x,z))>1) return null;
  const support=phys.support(x,z,step);
  if(!Number.isFinite(support.y) || support.y < -step) return null;
  if(Number.isFinite(phys.ceilingAbove(x,z,support.y+1e-5,support.y+height))) return null;
  const q={x,z};
  phys.resolve(q,radius,support.y,support.y+height,step);
  // Stricter than the 3 cm screening threshold: a witness route is clear.
  return Math.hypot(q.x-x,q.z-z)<=.001 ? support.y : null;
}

function sectionAt(points,chain) {
  const index=points.findIndex(p=>p[2]>=chain);
  const end=points[Math.max(1,index)],start=points[Math.max(1,index)-1];
  const t=(chain-start[2])/(end[2]-start[2]);
  const dx=end[0]-start[0],dz=end[1]-start[1],len=Math.hypot(dx,dz);
  return {x:start[0]+dx*t,z:start[1]+dz*t,nx:-dz/len,nz:dx/len};
}
function blockerAt(x,z) {
  const support=phys.support(x,z,step);
  if (!Number.isFinite(support.y)) return '';
  phys.resolve({x,z},radius,support.y,support.y+height,step);
  const hit=[];
  for(const w of phys._near) {
    const dy=w.heightOffset?.(x,z)||0;
    if(support.y+step>=w.y1+dy || support.y+height<=w.y0+dy) continue;
    const dx=w.bx-w.ax,dz=w.bz-w.az;
    const t=Math.min(1,Math.max(0,((x-w.ax)*dx+(z-w.az)*dz)/(dx*dx+dz*dz||1)));
    if(Math.hypot(x-w.ax-t*dx,z-w.az-t*dz)<radius+w.r) hit.push(w);
  }
  return hit.map(w=>[w.tag||'unlabelled',...['ax','az','bx','bz','y0','y1'].map(k=>w[k].toFixed(2))].join(':')).join('|');
}
function findDetour(points,start,end,halfWidth,anchorLimit=0) {
  const limit=halfWidth-radius, grid=.20;
  if(limit<0) return {state:'too_narrow'};
  const n=Math.ceil((end-start)/grid), side=Math.ceil(limit/grid);
  const sections=Array.from({length:n+1},(_,i)=>sectionAt(points,start+(end-start)*i/n));
  const columns=side*2+1, total=columns*sections.length, location=[];
  const ground=new Map();
  function sample(i,j) {
    const id=i*columns+j+side;
    if(!ground.has(id)) {
      const offset=side?j/side*limit:0, s=sections[i];
      const x=s.x+s.nx*offset,z=s.z+s.nz*offset;
      location[id]=[x,z];
      ground.set(id,groundAt(x,z));
    }
    return ground.get(id);
  }
  const anchors=Array.from({length:columns},(_,i)=>i-side)
    .filter(j=>(side?Math.abs(j)/side*limit:0)<=anchorLimit+1e-7)
    .sort((a,b)=>Math.abs(a)-Math.abs(b));
  const starts=anchors.filter(j=>sample(0,j)!==null).map(j=>j+side);
  const goals=new Set(anchors.filter(j=>sample(n,j)!==null).map(j=>n*columns+j+side));
  if(!starts.length || !goals.size) return {state:'anchor_unclear'};
  // Intermediate samples prevent diagonal jumps through a thin rail and
  // check small support changes with the same half-metre player step.
  function traversable(a,b,ay,by) {
    const [ax,az]=a,dx=b[0]-ax,dz=b[1]-az;
    // Near a sharp corner the normal flips; a long lateral chord could leave
    // the modeled ribbon. Cross the corner closer to the centre instead.
    if(Math.hypot(dx,dz)>grid*2) return false;
    const steps=Math.ceil(Math.hypot(dx,dz)/.08);let previous=ay;
    for(let k=1;k<=steps;k++){
      const y=k===steps?by:groundAt(ax+dx*k/steps,az+dz*k/steps);
      if(y===null || Math.abs(y-previous)>step) return false;
      previous=y;
    }
    return true;
  }
  const parent=new Int32Array(total).fill(-1);
  const queue=[...starts];
  for(const id of starts) parent[id]=id;
  const neighbors=[[1,0],[1,1],[1,-1],[0,1],[0,-1],[-1,0],[-1,1],[-1,-1]];
  for(let q=0;q<queue.length;q++) {
    const id=queue[q];
    if(goals.has(id)){
      let maxOffset=0,length=0,k=id;
      while(parent[k]!==k){
        maxOffset=Math.max(maxOffset,side?Math.abs(k%columns-side)/side*limit:0);
        const a=location[k],b=location[parent[k]];
        length+=Math.hypot(a[0]-b[0],a[1]-b[1]);k=parent[k];
      }
      maxOffset=Math.max(maxOffset,side?Math.abs(k%columns-side)/side*limit:0);
      return {state:'found',maxOffset,length};
    }
    const i=Math.floor(id/columns),j=id%columns-side;
    for(const [di,dj] of neighbors){
      const ni=i+di,nj=j+dj;
      if(ni<0 || ni>n || Math.abs(nj)>side) continue;
      const k=ni*columns+nj+side;
      if(parent[k]!==-1) continue;
      const y=sample(ni,nj);
      if(y===null || !traversable(location[id],location[k],ground.get(id),y)) continue;
      parent[k]=id;queue.push(k);
    }
  }
  return {state:'grid_exhausted'};
}

// Only extend across a shared way endpoint when another ground footway is a
// clear continuation. Intersections with a choice of similarly straight turns
// are left unresolved. Never synthesize a line beyond a mapped dead end.
const ends=new Map(), vertexKey=p=>p[0]+','+p[1];
for(const road of ways) {
  if(exclude(raw.get(road.id),road)) continue;
  for(const coords of [road.pts,[...road.pts].reverse()]){
    const key=vertexKey(coords[0]);
    if(!ends.has(key)) ends.set(key,[]);
    ends.get(key).push({road,coords});
  }
}
function continuation(road,end,prior) {
  const dx=end[0]-prior[0],dz=end[1]-prior[1],length=Math.hypot(dx,dz);
  const options=(ends.get(vertexKey(end))||[]).filter(e=>e.road!==road).map(e=>{
    const dx2=e.coords[1][0]-end[0],dz2=e.coords[1][1]-end[1];
    const cosine=(dx*dx2+dz*dz2)/(length*Math.hypot(dx2,dz2));
    return {road:e.road,coords:e.coords,turn:Math.acos(Math.max(-1,Math.min(1,cosine)))*180/Math.PI};
  }).filter(e=>e.turn<=45).sort((a,b)=>a.turn-b.turn);
  if(!options.length || (options[1] && options[1].turn-options[0].turn<10)) return null;
  return options[0];
}
function detourFor(road,partNo,points,p,tags) {
  const [x,z,chain]=p, length=points.at(-1)[2];
  const base=[road.id,partNo,round(chain),round(x),round(z),round(road.width),tags.width?'osm_width':'model_estimate'];
  const pre=chain<3?continuation(road,road.pts[0],road.pts[1]):null;
  const post=length-chain<3?continuation(road,road.pts.at(-1),road.pts.at(-2)):null;
  const before=pre?pre.coords.slice(1).reverse():[], after=post?post.coords.slice(1):[];
  const pathPts=before.length||after.length?centerline([...before,...road.pts,...after]):points;
  const bias=before.length?centerline([...before,road.pts[0]]).at(-1)[2]:0;
  const center=bias+chain,totalLength=pathPts.at(-1)[2];
  const offsets=[2.5,2.75,3,2.25,2];
  function anchor(direction){
    for(const delta of offsets){
      const s=center+direction*delta;
      if(s<0 || s>totalLength) continue;
      const pt=sectionAt(pathPts,s);
      if(groundAt(pt.x,pt.z)!==null) return s;
    }
    return null;
  }
  let start=anchor(-1),end=anchor(1);
  const blocker=blockerAt(x,z);
  const mainAnchors=start!==null && end!==null;
  if(start===null && center>=2) start=center-Math.min(2.5,center);
  if(end===null && totalLength-center>=2) end=center+Math.min(2.5,totalLength-center);
  const connected=[];
  if(pre && start!==null && start<bias) connected.push(pre.road);
  if(post && end!==null && end>bias+length) connected.push(post.road);
  const width=Math.min(road.width,...connected.map(way=>way.width));
  const widths=[['within_width',width/2],['nearby_2m',2],['nearby_4m',4]];
  const fields=()=>[...base,connected.map(way=>way.id).join('|'),round(width),
    start===null?'':round(start-bias),end===null?'':round(end-bias)];
  if(start===null || end===null) return [...fields(),'anchor_unconfirmed','','','','missing_way_continuation',blocker];
  const methods=mainAnchors?['center','offset']:['offset'];
  let checkedAny=false;
  for(const method of methods) {
    let tested=0;
    for(const [label,w] of widths) {
      if(w<=tested) continue;
      tested=w;
      const anchorLimit=method==='center'?0:Math.max(0,width/2-radius);
      const result=findDetour(pathPts,start,end,w,anchorLimit);
      checkedAny ||= result.state==='grid_exhausted';
      if(result.state==='found') return [...fields(),(method==='center'?'':'offset_')+label,round(w),
        round(result.maxOffset),round(result.length),method==='center'?'center_to_center':'ends_within_way_width',blocker];
    }
  }
  return [...fields(),checkedAny?'search_unconfirmed':'anchor_unconfirmed',round(Math.max(...widths.map(w=>w[1]))),'','',
    checkedAny?'grid_exhausted':'no_clear_width_anchors',blocker];
}

const out=process.argv[2] || path.join(root,'docs/map-audit/network');
const summary=[], observations=[], detours=[], part=new Map();
const round=(v,n=2)=>Number.isFinite(v)?v.toFixed(n):'';
const record=(r,partNo,p,reason,more={})=>{
  const [x,z,s]=p;
  observations.push([r.id,partNo,round(s),round(x),round(z),
    round(osm.origin.lat-z/osm.origin.kz,7),round(osm.origin.lon+x/osm.origin.kx,7),reason,
    more.feature || '',round(more.floor),round(more.shift,3),round(more.clearance,3)]);
};
for(const road of ways) {
  const partNo=(part.get(road.id)||0)+1;part.set(road.id,partNo);
  const points=centerline(road.pts), len=points.at(-1)[2];
  const tags=raw.get(road.id);
  if(!tags) throw new Error('Missing source tags for '+road.id);
  const omitted=exclude(tags,road);
  let checked=0,ambiguous=0,flagged=0,checksLength=0,previousFloor=null;
  const counts={no_ground:0,capsule_push:0,low_ceiling:0,support_jump:0};
  if(!omitted) for(let i=0;i<points.length;i++) {
    const p=points[i],[x,z,chain]=p;
    const structure=overlappingStructure(x,z);
    // The terminal deliberately lowers its foundations in multi-level areas.
    // A line with no explicit level cannot identify the slab sitting above it.
    const gradeGap=relief(x,z)-surveyElevation(x,z);
    if(structure || Math.abs(gradeGap)>1) {
      record(road,partNo,p,structure?.reason || 'adjusted_grade_unknown',{feature:structure?.feature.id});
      ambiguous++;previousFloor=null;continue;
    }
    checked++;
    const left=i ? (points[i-1][2]+chain)/2:0;
    const right=i+1<points.length ? (points[i+1][2]+chain)/2:len;
    checksLength+=right-left;
    const support=phys.support(x,z,step);
    const issues=[];
    const data={floor:support.y,feature:support.s?.tag||support.s?.kind};
    if(!Number.isFinite(support.y) || support.y < -step){
      issues.push('no_ground');previousFloor=null;
    } else {
      const pos={x,z};
      phys.resolve(pos,radius,support.y,support.y+height,step);
      data.shift=Math.hypot(pos.x-x,pos.z-z);
      const ceiling=phys.ceilingAbove(x,z,support.y+1e-5,support.y+height);
      data.clearance=ceiling-support.y;
      if(data.shift>.03) issues.push('capsule_push');
      if(Number.isFinite(ceiling)) issues.push('low_ceiling');
      if(previousFloor!==null && Math.abs(previousFloor-support.y)>step+1e-5) issues.push('support_jump');
      previousFloor=support.y;
    }
    if(issues.length){
      flagged++;
      detours.push(detourFor(road,partNo,points,p,tags));
      for(const issue of issues){counts[issue]++;record(road,partNo,p,issue,data);}
    }
  }
  const status=omitted || (flagged?'candidate':!checked?'height_unknown':ambiguous?'partial_clear':'sample_clear');
  summary.push([road.id,partNo,road.name||'',road.hw,tags.access||'',tags.foot||'',round(len),status,
    points.length,checked,omitted?points.length:ambiguous,flagged,...Object.values(counts),round(checksLength)]);
}
function save(name,columns,rows) {
  const escape=v=>'"'+String(v??'').replaceAll('"','""')+'"';
  fs.writeFileSync(path.join(out,name),[columns,...rows].map(row=>row.map(escape).join(',')).join('\n')+'\n');
}
fs.mkdirSync(out,{recursive:true});
save('surface-ways.csv',['osm_way','clipped_part','name','highway','access','foot','length_m','status','design_points','checked_points','skipped_points','flagged_points','no_ground','capsule_push','low_ceiling','support_jump','represented_checked_m'],summary);
save('surface-observations.csv',['osm_way','clipped_part','chainage_m','x','z','lat','lon','observation','building_or_support','local_floor_m','capsule_push_m','headroom_m'],observations);
save('surface-detours.csv',['osm_way','clipped_part','chainage_m','x','z','width_m','width_source','connected_way_ids','minimum_segment_width_m','start_chainage_m','end_chainage_m','detour_status','tested_strip_half_width_m','route_max_lateral_m','route_length_m','witness_or_limit','intersecting_engine_walls_tag_ax_az_bx_bz_y0_y1'],detours);
console.log(PLACES.length+' place modules, '+ways.length+' clipped rows, '+part.size+' OSM ways; physics:',phys.stats);
