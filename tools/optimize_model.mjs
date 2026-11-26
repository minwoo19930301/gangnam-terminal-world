// npm run optimize:model -- exported.glb game.glb
// Static Blender fixtures. The game uses Three.js's existing EXT_meshopt_compression decoder.
import { mkdtemp, readFile, rename, rm, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { NodeIO } from '@gltf-transform/core';
import { ALL_EXTENSIONS, EXTMeshoptCompression } from '@gltf-transform/extensions';
import { reorder, weld } from '@gltf-transform/functions';
import { MeshoptDecoder, MeshoptEncoder } from 'meshoptimizer';

const [source, destination, ...extra] = process.argv.slice(2);
if (!source || !destination || extra.length || [source, destination].some(f => path.extname(f).toLowerCase() !== '.glb')) {
  throw new Error('Usage: npm run optimize:model -- input.glb output.glb');
}
const input = await readFile(source);
await Promise.all([MeshoptDecoder.ready, MeshoptEncoder.ready]);
const io = new NodeIO().registerExtensions(ALL_EXTENSIONS).registerDependencies({
  'meshopt.decoder': MeshoptDecoder,
  'meshopt.encoder': MeshoptEncoder,
});
const gltf = await io.binaryToJSON(input);
const supported = new Set(ALL_EXTENSIONS.map(ext => ext.EXTENSION_NAME));
for (const ext of gltf.json.extensionsUsed || []) {
  if (!supported.has(ext)) throw new Error('Cannot preserve unrecognized extension ' + ext);
}
if (gltf.json.animations?.length || gltf.json.skins?.length) {
  throw new Error('This command supports static fixtures.');
}
const doc = await io.readJSON(gltf);
await doc.transform(weld());
// Alpha blending can depend on the original triangle order.
if (!doc.getRoot().listMaterials().some(material => material.getAlphaMode() === 'BLEND')) {
  await doc.transform(reorder({encoder: MeshoptEncoder, target: 'size'}));
}
// Losslessly pack the existing attribute arrays. No position, normal, UV or colour requantization.
doc.createExtension(EXTMeshoptCompression).setRequired(true)
  .setEncoderOptions({method: EXTMeshoptCompression.EncoderMethod.QUANTIZE});
const candidate = await io.writeBinary(doc);
const useCandidate = candidate.length < input.length;
const result = useCandidate ? candidate : input;
if (useCandidate || path.resolve(source) !== path.resolve(destination)) {
  const tmp = await mkdtemp(path.join(path.dirname(destination), '.gltf-opt-'));
  try {
    const file = path.join(tmp, 'model.glb');
    await writeFile(file, result);
    await rename(file, destination);
  } finally {
    await rm(tmp, {recursive:true, force:true});
  }
}
console.log(JSON.stringify({source, destination, originalBytes: input.length,
  candidateBytes: candidate.length, outputBytes: result.length, keptOriginal: !useCandidate}));
