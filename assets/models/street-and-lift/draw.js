// Bake the GLB's decoded node transforms once. Placed triangles then share the
// kit's terrain anchor, material batches and area culling with the host facade.
import { Color, Vector3 } from 'three';
import { loadFixtureScene } from '../onebailey/load.js';

const library = await loadFixtureScene(new URL('./hardware.glb', import.meta.url));
const templates = new Map();
const uv = [[0,0],[1,0],[0,1]];

function compile(name) {
  const points = [], faces = [];
  const edge = new Vector3(), normal = new Vector3(), color = new Color();
  const root = library.getObjectByName(name);
  if (!root) throw new Error('Missing Blender hardware '+name);
  root.traverse(part => {
    if (!part.isMesh) return;
    const geometry = part.geometry, pos = geometry.attributes.position, colors = geometry.attributes.color;
    const start = points.length, index = geometry.index;
    for (let i=0; i<pos.count; i++) {
      points.push(new Vector3().fromBufferAttribute(pos,i).applyMatrix4(part.matrixWorld));
    }
    for (let i=0; i<(index?.count ?? pos.count); i+=3) {
      const a=index ? index.getX(i) : i, b=index ? index.getX(i+1) : i+1, c=index ? index.getX(i+2) : i+2;
      const p=points[start+a], q=points[start+b], r=points[start+c];
      edge.subVectors(q,p);
      normal.subVectors(r,p).crossVectors(edge,normal);
      if (normal.lengthSq()<1e-16) continue;
      color.setRGB(colors.getX(a),colors.getY(a),colors.getZ(a));
      faces.push([start+a,start+b,start+c,normal.clone().normalize(),color.getHex()]);
    }
  });
  return {points,faces};
}

export function drawHardware(K,name,x,y,z,yaw,width=1) {
  if (!templates.has(name)) templates.set(name,compile(name));
  const {points,faces}=templates.get(name), co=Math.cos(yaw), si=Math.sin(yaw);
  const vertices=points.map(p=>[x+p.x*width*co+p.z*si,y+p.y,z-p.x*width*si+p.z*co]);
  for (const [a,b,c,n,color] of faces) {
    const nx=n.x/width, len=Math.hypot(nx,n.y,n.z);
    const normal=[(nx*co+n.z*si)/len,n.y/len,(-nx*si+n.z*co)/len];
    K.triangle(color,[vertices[a],vertices[b],vertices[c]],normal,uv);
  }
}
