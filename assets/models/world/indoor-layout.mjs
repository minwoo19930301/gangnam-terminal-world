// Read actual production Object3D and instance transforms without a renderer or near-detail downloads.
import fs from 'node:fs/promises';
import {pathToFileURL} from 'node:url';
import * as THREE from 'three';
import {createKit} from '../../../js/kit.js';
import {createPhysics} from '../../../js/physics.js';
import {applyRoadEdits} from '../../../js/blender-roads.js';
import {relief} from '../../../js/banpo_relief.js';

// Scene object (or a uniquely identifying child) -> editable native source.
// Geometry decoder matrices and decorative LOD offsets live *below* the placement.
const sources = [
  ...[['9F','marzocco','MarzoccoEnamel','SSG_9F_LaMarzocco'],
      ['9F','twl','TWLOak','SSG_9F_TWL'],
      ['9F','herman-miller','HMFrame','SSG_9F_HermanMiller'],
      ['10F','stokke','StokkeChairs','SSG_10F_Stokke']]
    .map(([floor,shop,mesh,collection])=>['shinsegae',floor,'ssg-'+shop+'/gallery.blend',mesh,collection]),
  ['gyeongbu','1F','gyeongbu-pretzels/seoul-warmer.blend','앤티앤스 · 프레즐 진열대','Warmer','Glass'],
  ...[['2F','Bedding','quilt-shop'],['4F','Curtains','drapery-shop']]
    .map(([floor,key,collection])=>['gyeongbu',floor,'gyeongbu-homewares/homewares.blend','경부선 도매 점포 · '+key,collection]),
  ['jwmarriott','8F','lounge-piano/grand.blend','더 라운지 · 그랜드 피아노와 의자','더 라운지 · 그랜드 피아노와 의자'],
  ...[['6F','Children','childrenswear'],['7F','Suits','tailoring'],['8F','Womenswear','outerwear']]
    .map(([floor,key,collection])=>['gyeongbu',floor,'gyeongbu-apparel/apparel.blend','경부선 도매 점포 · '+key,collection]),
  ...['Sunflower','Ivory','Violet','Pink','Sleeve','Riser','BlackStack','WorkPapers'].map(name=>
    ['gyeongbu','3F','gyeongbu-cutflowers/cutflowers.blend','생화상가 · '+name,name]),
  ['gyeongbu','1F','gyeongbu-seating/waiting-benches.blend','경부선 승차홈 · TerminalTwo','TerminalTwo'],
  ['gyeongbu','1F','gyeongbu-seating/waiting-benches.blend','경부선 승차홈 · TerminalFour','TerminalFour'],
  ['gyeongbu','1F','gyeongbu-seating/waiting-benches.blend','경부선 승차홈 · WindowFour','WindowFour'],
  ['gyeongbu','B1','daiso-merchandise/merchandise.blend','Daiso stationery','DaisoStationeryEndcap'],
  ['gyeongbu','B1','daiso-merchandise/merchandise.blend','Daiso kitchen','DaisoKitchenEndcap'],
  ...['apparel','junior','kitchen','linen','flowers','tarot'].map(name=>
    ['gotomall','B1','gotomall/shop-interiors.blend','고투몰 진열 · '+name,name]),
  ['gotomall','B1','gotomall-hessed/hessed.blend','헤쎄드 가방 진열','HessedShop'],
  ['jwmarriott','2F','patisserie/patisserie.blend','파티세리 · 플랑과 마카롱','파티세리 · 플랑과 마카롱 선물 상자'],
  ['jwmarriott','8F','lounge-chair/lounge-chair.blend','더 라운지 · 피콕 라탄체어','피콕 암체어 · JW 8층 더 라운지'],
  ['newcore','5F','newcore/oksoban-table.blend','옥소반 · 인덕션','옥소반 · 1관 5F 식탁'],
  ['newcore','외관','architectural-retail/retail-architecture.blend','NewcoreArch','NewcoreArch'],
  ['newcore','1F','architectural-retail/retail-architecture.blend','BoutiqueWindow','BoutiqueWindow'],
  ['shinsegae','9F','hypnos-showroom/hypnos.blend','히프노스 침대 · 원거리','히프노스 · 신세계 강남 9층'],
  ['shinsegae','6F','architectural-retail/retail-architecture.blend','CaseGallery','CaseGallery'],
  ['shinsegae','5F','architectural-retail/retail-architecture.blend','RectoWall','RectoWall'],
  ['centralcity','1F','famille-atrium/atrium-fittings.blend','광장 · 고리형 청동 조명','광장 벽등 · 고리와 유백 갓'],
  ['centralcity','1F','famille-atrium/atrium-fittings.blend','메모리얼 광장 · 미디어 캐비닛','세로형 전광판 · 캐비닛과 매체','전광판 · 교체 가능한 화면 원화'],
  ['centralcity','1F','famille-atrium/atrium-fittings.blend','포비 앞 · 빨간 철제 테이블과 의자','광장 포비 앞 · 빨간 비스트로 테이블'],
  ['centralcity','1F','famille-atrium/atrium-fittings.blend','포비 앞 · 석재 화분과 관엽수','광장 포비 앞 · 석재 화분과 관엽수'],
];

const rounded = value => Math.round(value*1e8)/1e8;

export async function captureIndoorLayout() {
  const osm = applyRoadEdits(JSON.parse(await fs.readFile(new URL('../../../data/osm.json',import.meta.url),'utf8')));
  const previous = globalThis.__makeCanvas;
  const context = new Proxy({
    measureText: t=>({width:String(t).length*10}),
    createLinearGradient:()=>({addColorStop(){}}),createRadialGradient:()=>({addColorStop(){}}),
    createPattern:()=>({}),getImageData:()=>({data:new Uint8ClampedArray(4)}),
  },{get:(obj,key)=>obj[key]??(()=>{})});
  const result = [];
  try {
    globalThis.__makeCanvas=(width,height)=>({width,height,style:{},getContext:()=>context});
    for(const place of new Set(sources.map(row=>row[0]))){
      const rules=sources.filter(row=>row[0]===place), counts=new Map();
      const {build,meta}=await import('../../../js/places/'+place+'.js');
      const kit=createKit(THREE,new THREE.Scene(),{osm,phys:createPhysics(),keep:()=>false});
      const addMesh=kit.addMesh;
      kit.onNight=()=>{};
      kit.addMesh=root=>{
        const placed=addMesh(root);
        const rule=rules.find(row=>root.getObjectByName(row[3]));
        if(!rule)return placed;
        root.updateWorldMatrix(true,true);
        const [,floor,library,subject,...collections]=rule;
        const local=new THREE.Matrix4(),world=new THREE.Matrix4();
        for(let index=0;index<(root.isInstancedMesh?root.count:1);index++){
          world.copy(root.matrixWorld);
          if(root.isInstancedMesh){root.getMatrixAt(index,local);world.multiply(local);}
          const ordinal=counts.get(subject)||0;
          counts.set(subject,ordinal+1);
          const [x,y,z]=world.elements.slice(12,15);
          const level=subject==='광장 · 고리형 청동 조명' && y>=4 ? '2F' : floor;
          result.push({id:[place,subject,ordinal+1].join('/'),place,placeName:meta.name,floor:level,library,
            collections,subject,terrain:root.userData.terrainApplied?0:rounded(relief(x,z)),matrix:world.toArray().map(rounded)});
        }
        return placed;
      };
      kit._.setCurrent(place,meta);
      build(kit);
      kit._.buildAllDetail();
      if(kit._.detailErrors.length)throw Error(kit._.detailErrors.join('\n'));
      for(const [, , , name] of rules)if(!counts.has(name))throw Error('No production placement for '+place+'/'+name);
    }
  }finally{
    if(previous===undefined)delete globalThis.__makeCanvas;else globalThis.__makeCanvas=previous;
  }
  return result;
}

if(process.argv[1]&&import.meta.url===pathToFileURL(process.argv[1]).href){
  const rows=await captureIndoorLayout();
  if(process.argv[2])await fs.writeFile(process.argv[2],JSON.stringify(rows)+'\n');
  else process.stdout.write(JSON.stringify(rows));
}
