// Add the single WebP atlas to Blender's vertex-coloured, UV-mapped shell.
import {readFile} from 'node:fs/promises';
import {NodeIO} from '@gltf-transform/core';
import {ALL_EXTENSIONS,EXTTextureWebP,KHRMaterialsUnlit} from '@gltf-transform/extensions';

const [source,atlas,destination]=process.argv.slice(2);
const io=new NodeIO().registerExtensions(ALL_EXTENSIONS);
const doc=await io.read(source);
const texture=doc.createTexture('간접광과 석재').setImage(await readFile(atlas)).setMimeType('image/webp');
doc.createExtension(EXTTextureWebP).setRequired(true);
const unlit=doc.createExtension(KHRMaterialsUnlit);
const material=doc.createMaterial('셀러 실내 조명').setBaseColorTexture(texture).setDoubleSided(true)
  .setExtension('KHR_materials_unlit',unlit.createUnlit());
for(const mesh of doc.getRoot().listMeshes())for(const prim of mesh.listPrimitives()){
  if(!prim.getAttribute('TEXCOORD_0'))throw Error('Missing baked room UVs');
  prim.setMaterial(material);
}
await io.write(destination,doc);
