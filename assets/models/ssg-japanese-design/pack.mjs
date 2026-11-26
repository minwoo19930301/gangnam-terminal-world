import {NodeIO} from '@gltf-transform/core';
import {ALL_EXTENSIONS} from '@gltf-transform/extensions';
import {compactPrimitive,meshopt,weld} from '@gltf-transform/functions';
import {MeshoptEncoder,MeshoptSimplifier} from 'meshoptimizer';
import {fileURLToPath} from 'node:url';
import sharp from 'sharp';

await Promise.all([MeshoptEncoder.ready,MeshoptSimplifier.ready]);
const io=new NodeIO().registerExtensions(ALL_EXTENSIONS)
  .registerDependencies({'meshopt.encoder':MeshoptEncoder});
const file=fileURLToPath(new URL('dining.glb',import.meta.url));
const doc=await io.read(file);
const sheet=doc.getRoot().listTextures().find(texture=>texture.getName()==='MinoWashi');
if(!sheet)throw new Error('Missing paper shade texture');
sheet.setImage(await sharp(sheet.getImage()).jpeg({quality:87,mozjpeg:true}).toBuffer())
  .setMimeType('image/jpeg').setURI('mino-washi.jpg');

await doc.transform(weld());
for(const mesh of doc.getRoot().listMeshes()) {
  for(const piece of mesh.listPrimitives()) {
    if(piece.getMaterial().getName()==='미노 화지')continue;
    const positions=piece.getAttribute('POSITION').getArray();
    const normals=piece.getAttribute('NORMAL').getArray();
    const uv=piece.getAttribute('TEXCOORD_0')?.getArray();
    const count=positions.length/3, stride=uv?5:3;
    const attributes=new Float32Array(count*stride);
    const locked=new Uint8Array(count);
    for(let i=0;i<count;i++) {
      attributes.set(normals.subarray(3*i,3*i+3),i*stride);
      if(uv)attributes.set(uv.subarray(2*i,2*i+2),i*stride+3);
      // All bent cedar strips are in the small pendant envelope. Preserve
      // their width and the full upper/lower rims when reducing other furniture.
      if(Math.abs(positions[3*i])<.451 && Math.abs(positions[3*i+2])<.451 &&
         positions[3*i+1]>1.77 && positions[3*i+1]<2.24)locked[i]=1;
    }
    const index=piece.getIndices(), source=Uint32Array.from(index.getArray());
    const weights=uv?[.055,.055,.055,.19,.19]:[.055,.055,.055];
    const [indices]=MeshoptSimplifier.simplifyWithAttributes(
      source,positions,3,attributes,stride,weights,locked,Math.floor(source.length*.5/3)*3,.00045
    );
    index.setArray(indices);
    compactPrimitive(piece);
  }
}
await doc.transform(meshopt({encoder:MeshoptEncoder,level:'medium',quantizePosition:16,quantizeNormal:10}));
await io.write(file,doc);
