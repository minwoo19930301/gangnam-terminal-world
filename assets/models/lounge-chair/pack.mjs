// Derive both viewing distances from the same editable chair.
import fs from 'node:fs/promises';
import path from 'node:path';
import {NodeIO} from '@gltf-transform/core';
import {ALL_EXTENSIONS} from '@gltf-transform/extensions';
import {cloneDocument, quantize, simplify, weld} from '@gltf-transform/functions';
import {MeshoptEncoder, MeshoptDecoder, MeshoptSimplifier} from 'meshoptimizer';

await Promise.all([MeshoptEncoder.ready, MeshoptDecoder.ready, MeshoptSimplifier.ready]);
const io = new NodeIO().registerExtensions(ALL_EXTENSIONS).registerDependencies({
  'meshopt.encoder':MeshoptEncoder, 'meshopt.decoder':MeshoptDecoder,
});
const file = process.argv[2], near = await io.read(file), far = cloneDocument(near);
// Fourteen-bit positions resolve the full-size chair's cross-section below a millimetre.
await near.transform(weld(), simplify({simplifier:MeshoptSimplifier, ratio:.53, error:.0015}),
  quantize({quantizePosition:14, quantizeNormal:8}), weld());
await io.write(file, near);

await far.transform(weld(), simplify({simplifier:MeshoptSimplifier, ratio:.026, error:.03}));
const primitive = far.getRoot().listMeshes()[0].listPrimitives()[0];
const position = primitive.getAttribute('POSITION'), color = primitive.getAttribute('COLOR_0');
const points = new Int16Array(position.getCount()*3), colors = new Uint8Array(points.length);
for (let i=0; i<position.getCount(); i++) {
  points.set(position.getElement(i,[]).map(v => Math.round(v*1000)),3*i);
  colors.set(color.getElement(i,[]).slice(0,3).map(v => Math.round(v*255)),3*i);
}
const indices = Uint16Array.from(primitive.getIndices().getArray());
const encoded = array => Buffer.from(array.buffer).toString('base64');
const output = '// Generated from lounge-chair.blend. Positions are millimetres, colours linear RGB.\n' +
  Object.entries({points,colors,indices}).map(([key,array]) =>
    'export const '+key+' = '+JSON.stringify(encoded(array))+';\n').join('');
await fs.writeFile(path.join(path.dirname(file),'proxy.js'),output);
