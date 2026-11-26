import {readFile} from 'node:fs/promises';
import {Document,NodeIO} from '@gltf-transform/core';
import sharp from 'sharp';
const [papers,tiles]=JSON.parse(await readFile(process.argv[2],'utf8'));
const cols=8,tw=64,th=128,width=cols*tw,height=Math.ceil(papers.length/cols)*th,pad=2;
const paths=[],positions=[],normals=[],uv=[],indices=[];
for(const [i,[a,b,low,high,d]] of papers.entries()){
  const left=(i%cols)*tw+pad,top=Math.floor(i/cols)*th+pad,w=tw-2*pad,h=th-2*pad;
  for(const [color,points] of tiles[i]){
    const coords=points.map(([x,y])=>[(left+x*w).toFixed(2),(top+y*h).toFixed(2)].join(',')).join(' ');
    paths.push('<polygon points="'+coords+'" fill="#'+color+'"/>');
  }
  const n=i*4;
  positions.push(a,low,d,b,low,d,b,high,d,a,high,d);
  normals.push(0,0,-1,0,0,-1,0,0,-1,0,0,-1);
  uv.push(left/width,(top+h)/height,(left+w)/width,(top+h)/height,(left+w)/width,top/height,left/width,top/height);
  indices.push(n+2,n+1,n,n,n+3,n+2);
}
const svg='<svg xmlns="http://www.w3.org/2000/svg" width="'+width+'" height="'+height+'"><rect width="100%" height="100%" fill="#f5f5ee"/>'+paths.join('')+'</svg>';
const data=await sharp(Buffer.from(svg)).png({palette:true,colours:96,effort:9}).toBuffer();
const doc=new Document(),buffer=doc.createBuffer();
const accessor=(type,array)=>doc.createAccessor().setType(type).setArray(array).setBuffer(buffer);
const atlas=doc.createTexture('블렌더 원본 네컷 인화지').setImage(data).setMimeType('image/png');
const mat=doc.createMaterial('점포 견본 인화지').setBaseColorTexture(atlas).setDoubleSided(true).setMetallicFactor(0).setRoughnessFactor(.84);
const primitive=doc.createPrimitive().setMaterial(mat).setAttribute('POSITION',accessor('VEC3',new Float32Array(positions))) .setAttribute('NORMAL',accessor('VEC3',new Float32Array(normals))).setAttribute('TEXCOORD_0',accessor('VEC2',new Float32Array(uv))).setIndices(accessor('SCALAR',new Uint16Array(indices)));
const mesh=doc.createMesh('네컷 샘플 인화지').addPrimitive(primitive);doc.createScene().addChild(doc.createNode('견본 사진').setMesh(mesh));await new NodeIO().write(process.argv[3],doc);
