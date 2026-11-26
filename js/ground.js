// Planar difference for exterior surfaces. Overlapping cuts (water, stairs,
// sunken roads) and islands are a union of openings. Earcut accepts only
// disjoint contours strictly inside a shell; the OSM river meets the map rim.
import { pointInPoly, polyBBox } from './physics.js';

const EPS = 1e-8;
const touches = (a,b) => a[0]<=b[2] && a[2]>=b[0] && a[1]<=b[3] && a[3]>=b[1];
const insideBox = (b,x,z) => x>=b[0] && x<=b[2] && z>=b[1] && z<=b[3];

function ringEdges(ring) {
  const edges=[];
  for(let i=0,j=ring.length-1;i<ring.length;j=i++) {
    const [x,z]=ring[j], [u,v]=ring[i];
    // Horizontal edges contribute a row boundary even if both endpoints
    // lie in other tiles. They never enter the active edge list.
    const slope=v===z ? 0 : (u-x)/(v-z);
    edges.push({x,z,slope,box:[Math.min(x,u),Math.min(z,v),Math.max(x,u),Math.max(z,v)]});
  }
  return edges;
}

function shape(poly,inner=[]) {
  return {poly,inner,box:polyBBox(poly),edges:[poly,...inner].flatMap(ringEdges)};
}
const xAt=(edge,z)=>edge.x+(z-edge.z)*edge.slope;
const contains=(s,x,z)=>insideBox(s.box,x,z) && pointInPoly(x,z,s.poly) &&
  !s.inner.some(p=>pointInPoly(x,z,p));

export function cutSurface(poly,holes,emit,tileSize=100) {
  if(poly.length<3) return;
  const shell=shape(poly);
  const cuts=holes.filter(h=>h.poly.length>=3 && touches(shell.box,polyBBox(h.poly)))
    .map(h=>shape(h.poly,h.inner || []));
  const [left,top,right,bottom]=shell.box;
  for(let x=left;x<right-EPS;x+=tileSize) for(let z=top;z<bottom-EPS;z+=tileSize) {
    const box=[x,z,Math.min(x+tileSize,right),Math.min(z+tileSize,bottom)];
    const local=cuts.filter(c=>touches(box,c.box));
    const edges=[shell,...local].flatMap(s=>s.edges.filter(e=>touches(box,e.box)));
    emitTile(box,edges,(u,v)=>contains(shell,u,v) && !local.some(c=>contains(c,u,v)),emit);
  }
}

function emitTile([x0,z0,x1,z1],edges,keep,emit) {
  // Between successive vertex and intersection heights the order of all
  // boundaries is constant. The surviving intervals form exact trapezoids.
  const levels=[z0,z1];
  const add=z=>{if(z>z0+EPS && z<z1-EPS) levels.push(z);};
  for(let i=0;i<edges.length;i++) {
    const edge=edges[i],lo=edge.box[1],hi=edge.box[3];
    add(lo);add(hi);
    if(edge.slope!==0) for(const x of [x0,x1]) {
      const z=edge.z+(x-edge.x)/edge.slope;
      if(z>lo && z<hi) add(z);
    }
    for(let j=0;j<i;j++) {
      const other=edges[j], start=Math.max(z0,lo,other.box[1]), end=Math.min(z1,hi,other.box[3]);
      if(end<=start || other.slope===edge.slope || !touches(edge.box,other.box)) continue;
      const z=start+(xAt(other,start)-xAt(edge,start))/(edge.slope-other.slope);
      if(z>start && z<end && xAt(edge,z)>x0 && xAt(edge,z)<x1) add(z);
    }
  }
  levels.sort((a,b)=>a-b);
  const west={x:x0,z:z0,slope:0},east={x:x1,z:z0,slope:0};
  for(let i=1;i<levels.length;i++) {
    const a=levels[i-1], b=levels[i], mid=(a+b)/2;
    if(b-a<EPS) continue;
    const sides=[west,east];
    for(const e of edges) if(mid>e.box[1] && mid<e.box[3] && xAt(e,mid)>x0 && xAt(e,mid)<x1) sides.push(e);
    sides.sort((l,r)=>xAt(l,mid)-xAt(r,mid));
    for(let j=1;j<sides.length;j++) {
      const l=sides[j-1],r=sides[j],lx=xAt(l,mid),rx=xAt(r,mid);
      if(rx-lx<EPS || !keep((lx+rx)/2,mid)) continue;
      const la=xAt(l,a),ra=xAt(r,a),lb=xAt(l,b),rb=xAt(r,b);
      const p=[[la,a]];
      if(ra-la>EPS) p.push([ra,a]);
      p.push([rb,b]);
      if(rb-lb>EPS) p.push([lb,b]);
      emit(p);
    }
  }
}
