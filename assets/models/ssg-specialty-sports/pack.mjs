import {NodeIO} from '@gltf-transform/core';
import {ALL_EXTENSIONS, KHRTextureTransform} from '@gltf-transform/extensions';
import {meshopt, simplify, weld} from '@gltf-transform/functions';
import {MeshoptEncoder, MeshoptDecoder, MeshoptSimplifier} from 'meshoptimizer';
import {fileURLToPath} from 'node:url';

await Promise.all([MeshoptEncoder.ready, MeshoptDecoder.ready, MeshoptSimplifier.ready]);
const io = new NodeIO().registerExtensions(ALL_EXTENSIONS).registerDependencies({
  'meshopt.encoder': MeshoptEncoder, 'meshopt.decoder': MeshoptDecoder
});
const path = fileURLToPath(new URL('gallery.glb',import.meta.url));
const doc = await io.read(path);
// Faceted outsole blocks and overlay edges can share their vertices. Keep
// authored normals on the knit, mannequin bodies and curved metal tubing.
const nodes=doc.getRoot().listNodes();
const footwear=nodes.find(n=>n.getName()==='NBMegaGangnamFootwear').getMesh();
for (const primitive of footwear.listPrimitives()) primitive.setAttribute('NORMAL',null);

// Preserve the physical repeat while allowing normalised 16-bit texture UVs.
const knit=nodes.find(n=>n.getName()==='NBMegaGangnamKnit').getMesh().listPrimitives()[0];
const uv=knit.getAttribute('TEXCOORD_0').getArray();
for(let i=0;i<uv.length;i++) uv[i]=uv[i]/64+.5;
const transform=doc.createExtension(KHRTextureTransform).createTransform().setScale([64,64]);
knit.getMaterial().getBaseColorTextureInfo().setExtension('KHR_texture_transform',transform);
await doc.transform(weld(),simplify({simplifier:MeshoptSimplifier,ratio:.65,error:.00010}),
  meshopt({encoder:MeshoptEncoder,level:'medium',quantizePosition:16,quantizeTexcoord:16}));
await io.write(path,doc);
