import {NodeIO} from '@gltf-transform/core';
import {ALL_EXTENSIONS} from '@gltf-transform/extensions';
import {meshopt,simplify,weld} from '@gltf-transform/functions';
import {MeshoptEncoder,MeshoptSimplifier} from 'meshoptimizer';
import {fileURLToPath} from 'node:url';

await Promise.all([MeshoptEncoder.ready,MeshoptSimplifier.ready]);
const io = new NodeIO().registerExtensions(ALL_EXTENSIONS)
  .registerDependencies({'meshopt.encoder':MeshoptEncoder});
const path = fileURLToPath(new URL('snoopy-place.glb',import.meta.url));
const doc = await io.read(path);
// Collapse near-coincident pole rings and collinear lettering edges after
// authoring the miniature goods at their dedicated runtime tessellation.
await doc.transform(weld(),simplify({simplifier:MeshoptSimplifier,ratio:.72,error:.00014}),meshopt({encoder:MeshoptEncoder,level:'medium',quantizePosition:16}));
await io.write(path,doc);
