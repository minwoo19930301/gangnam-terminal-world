import {NodeIO} from '@gltf-transform/core';
import {ALL_EXTENSIONS} from '@gltf-transform/extensions';
import {meshopt, weld} from '@gltf-transform/functions';
import {MeshoptEncoder, MeshoptDecoder} from 'meshoptimizer';
import {fileURLToPath} from 'node:url';

await Promise.all([MeshoptEncoder.ready, MeshoptDecoder.ready]);
const io = new NodeIO().registerExtensions(ALL_EXTENSIONS).registerDependencies({
  'meshopt.encoder': MeshoptEncoder, 'meshopt.decoder': MeshoptDecoder
});
const path = fileURLToPath(new URL('gallery.glb',import.meta.url));
const doc = await io.read(path);
// Blender 4.5 exports the knit atlas multiplier as a white COLOR_0 and
// the garment tint as COLOR_1. glTF base colour uses the first channel.
const cloth=doc.getRoot().listNodes().find(node=>node.getName()==='BossGolfGangnamTextiles').getMesh().listPrimitives()[0];
if(cloth.getAttribute('COLOR_1')) {
  cloth.setAttribute('COLOR_0',cloth.getAttribute('COLOR_1'));
  cloth.setAttribute('COLOR_1',null);
}
await doc.transform(weld(),meshopt({encoder:MeshoptEncoder,level:'medium',quantizePosition:16}));
await io.write(path,doc);
