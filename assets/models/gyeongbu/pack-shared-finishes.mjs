// Extract a single WebP atlas set from separately authored Blender exports.
import fs from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
import {NodeIO} from '@gltf-transform/core';
import {ALL_EXTENSIONS,EXTMeshoptCompression} from '@gltf-transform/extensions';
import {quantize,reorder,weld} from '@gltf-transform/functions';
import {MeshoptDecoder,MeshoptEncoder} from 'meshoptimizer';

export async function packMarketSurfaces(baseURL,keys) {
  await Promise.all([MeshoptDecoder.ready,MeshoptEncoder.ready]);
  const io=new NodeIO().registerExtensions(ALL_EXTENSIONS).registerDependencies({'meshopt.decoder':MeshoptDecoder,'meshopt.encoder':MeshoptEncoder});
  const images=new Map();
  for(const key of keys){
    const file=fileURLToPath(new URL(`./${key}/${key}.glb`,baseURL)),doc=await io.read(file);
    const maps=doc.getRoot().listTextures();
    if(maps.length!==4)throw new Error(`Generate the native ${key} export before packing its four finishes`);
    for(const texture of maps){
      const name=texture.getName(),contents=Buffer.from(texture.getImage());
      if(images.has(name)&&!contents.equals(images.get(name)))throw new Error(`Mismatched ${key}/${name} finish`);
      images.set(name,contents);texture.dispose();
    }
    await doc.transform(weld(),quantize({quantizePosition:15,quantizeNormal:9,quantizeTexcoord:13}),weld(),reorder({encoder:MeshoptEncoder,target:'size'}));
    doc.createExtension(EXTMeshoptCompression).setRequired(true).setEncoderOptions({method:EXTMeshoptCompression.EncoderMethod.QUANTIZE});
    await io.write(file,doc);
  }
  for(const [name,contents] of images)await fs.writeFile(new URL(`./${name}.webp`,baseURL),contents);
}
