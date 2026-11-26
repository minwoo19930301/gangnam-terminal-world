// Bake a few roof and wall triangles from the original GLB for towers without
// an OSM footprint. The streaming manifest can show them before any GLB request.
import { NodeIO } from '@gltf-transform/core';
import { ALL_EXTENSIONS } from '@gltf-transform/extensions';
import { MeshoptDecoder, MeshoptSimplifier } from 'meshoptimizer';
import { Matrix4, Vector3 } from 'three';
import path from 'node:path';

export async function addEstateSilhouettes(models, root) {
  await Promise.all([MeshoptDecoder.ready,MeshoptSimplifier.ready]);
  const io = new NodeIO().registerExtensions(ALL_EXTENSIONS)
    .registerDependencies({'meshopt.decoder':MeshoptDecoder});
  const matrix = new Matrix4(), v = new Vector3(), p = new Vector3(), q = new Vector3(), t = new Vector3();
  for (const m of models) {
    if (m.claims.length) continue;
    const doc = await io.read(path.join(root,m.file));
    const vertices = [], indices = [], distinct = new Map();
    for (const node of doc.getRoot().listNodes()) {
      if (!node.getMesh()) continue;
      matrix.fromArray(node.getWorldMatrix());
      for (const prim of node.getMesh().listPrimitives()) {
        const pos = prim.getAttribute('POSITION');
        const source = prim.getIndices()?.getArray();
        const map = new Uint32Array(pos.getCount());
        for (let i=0;i<pos.getCount();i++) {
          v.fromArray(pos.getElement(i,[])).applyMatrix4(matrix);
          const xyz = v.toArray().map(n=>Math.round(n*4)); // quarter metres
          const key = xyz.join(',');
          if (!distinct.has(key)) { distinct.set(key,vertices.length/3); vertices.push(...xyz); }
          map[i] = distinct.get(key);
        }
        for (let j=0, n=source?.length ?? map.length;j<n;j+=3) {
          const a=map[source ? source[j] : j], b=map[source ? source[j+1] : j+1], c=map[source ? source[j+2] : j+2];
          p.fromArray(vertices,3*a);
          q.fromArray(vertices,3*b).sub(p); t.fromArray(vertices,3*c).sub(p);
          if (q.cross(t).lengthSq()>64) indices.push(a,b,c); // omit sub-quarter-square-metre trim
        }
      }
    }
    if (!indices.length) continue;
    const pos = Float32Array.from(vertices), src = Uint32Array.from(indices);
    let [simple] = MeshoptSimplifier.simplify(src,pos,3,240,.10,['Permissive','Prune']);
    if (simple.length>540) [simple] = MeshoptSimplifier.simplifySloppy(src,pos,3,null,240,.18);
    if (!simple.length) continue;
    const unique = [...new Set(simple)], lut = new Map(unique.map((index,i)=>[index,i]));
    if (unique.length>255) throw new Error('Oversized silhouette '+m.id);
    const coords = Buffer.alloc(unique.length*6);
    unique.forEach((k,i)=>{for(let j=0;j<3;j++) coords.writeInt16LE(vertices[3*k+j],6*i+2*j);});
    m.silhouette = [coords.toString('base64'),Buffer.from(simple.map(k=>lut.get(k))).toString('base64')];
  }
}
