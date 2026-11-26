import {NodeIO} from '@gltf-transform/core';
import {ALL_EXTENSIONS} from '@gltf-transform/extensions';
import {meshopt, weld, simplifyPrimitive} from '@gltf-transform/functions';
import {MeshoptEncoder, MeshoptDecoder, MeshoptSimplifier} from 'meshoptimizer';
import {fileURLToPath} from 'node:url';

await Promise.all([MeshoptEncoder.ready, MeshoptDecoder.ready, MeshoptSimplifier.ready]);
const io = new NodeIO().registerExtensions(ALL_EXTENSIONS).registerDependencies({
  'meshopt.encoder': MeshoptEncoder, 'meshopt.decoder': MeshoptDecoder
});
const path = fileURLToPath(new URL('gallery.glb',import.meta.url));
const doc = await io.read(path);
await doc.transform(weld());
const frames=doc.getRoot().listNodes().find(node => node.getName()==='CollectGangnamFrames');
for (const primitive of frames.getMesh().listPrimitives()) {
  // Keep the small gap between wire and lens. Remove redundant intermediate
  // facets from temple runs and curved pads in the runtime copy only.
  simplifyPrimitive(primitive,{simplifier:MeshoptSimplifier,ratio:.57,error:.000065});
}
await doc.transform(meshopt({encoder:MeshoptEncoder,level:'medium',quantizePosition:16}));
await io.write(path,doc);
