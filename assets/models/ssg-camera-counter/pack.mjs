import {readFile} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
import sharp from 'sharp';
import {NodeIO} from '@gltf-transform/core';
import {ALL_EXTENSIONS} from '@gltf-transform/extensions';
import {meshopt, weld} from '@gltf-transform/functions';
import {MeshoptEncoder, MeshoptDecoder} from 'meshoptimizer';

await Promise.all([MeshoptEncoder.ready, MeshoptDecoder.ready]);
const io = new NodeIO().registerExtensions(ALL_EXTENSIONS).registerDependencies({
  'meshopt.encoder': MeshoptEncoder, 'meshopt.decoder': MeshoptDecoder
});
const path = fileURLToPath(new URL('gallery.glb',import.meta.url));
const doc = await io.read(path);
const surface = doc.getRoot().listMaterials().find(material => material.getNormalTexture());
surface.getMetallicRoughnessTexture().setImage(await readFile(new URL('surface.png',import.meta.url)));
for (const tex of [surface.getBaseColorTexture(), surface.getNormalTexture()]) {
  const palette = await sharp(tex.getImage()).png({palette:true,colours:192,quality:95,dither:0}).toBuffer();
  tex.setImage(palette);
}
await doc.transform(weld(),meshopt({encoder:MeshoptEncoder,level:'medium',quantizePosition:16}));
await io.write(path,doc);
