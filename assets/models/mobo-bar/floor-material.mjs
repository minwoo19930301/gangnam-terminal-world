import {readFile} from 'node:fs/promises';
import {NodeIO} from '@gltf-transform/core';
import {EXTTextureWebP} from '@gltf-transform/extensions';

const [source,image,destination]=process.argv.slice(2);
const io=new NodeIO().registerExtensions([EXTTextureWebP]);
const doc=await io.read(source);
doc.createExtension(EXTTextureWebP).setRequired(true);
const texture=doc.createTexture('석회석과 바 가구의 접촉 그림자').setImage(await readFile(image)).setMimeType('image/webp');
const material=doc.createMaterial('정원 쪽 바 석회석').setBaseColorTexture(texture).setMetallicFactor(0).setRoughnessFactor(.82);
doc.getRoot().listMeshes()[0].listPrimitives()[0].setMaterial(material);
await io.write(destination,doc);
