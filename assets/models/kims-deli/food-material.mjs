import {readFile} from 'node:fs/promises';
import {NodeIO} from '@gltf-transform/core';
import {EXTTextureWebP, KHRMaterialsUnlit} from '@gltf-transform/extensions';
const [source,picture,dest,key]=process.argv.slice(2);
const io=new NodeIO().registerExtensions([EXTTextureWebP,KHRMaterialsUnlit]),doc=await io.read(source);
doc.createExtension(EXTTextureWebP).setRequired(true);
const tex=doc.createTexture('Blender 제품 정사 촬영').setImage(await readFile(picture)).setMimeType('image/webp');
const mat=doc.createMaterial('포장 제품 · 점포 조명').setBaseColorTexture(tex).setMetallicFactor(0).setRoughnessFactor(.70).setDoubleSided(true);
const unlit=doc.createExtension(KHRMaterialsUnlit);
mat.setExtension('KHR_materials_unlit',unlit.createUnlit());
const nodes=doc.getRoot().listNodes();
const food=nodes.find(node=>node.getName()===key);
const lid=nodes.find(node=>node.getName()==='Lid_'+key);
if(nodes.length!==2||!food||!lid)throw Error('Expected the food surface and its original clear lid for '+key);
for(const prim of food.getMesh().listPrimitives())prim.setMaterial(mat);
const pet=doc.createMaterial('Clear formed PET').setBaseColorFactor([.90,.94,.89,.055])
  .setRoughnessFactor(.16).setMetallicFactor(0).setAlphaMode('BLEND');
for(const prim of lid.getMesh().listPrimitives())prim.setMaterial(pet);
await io.write(dest,doc);
