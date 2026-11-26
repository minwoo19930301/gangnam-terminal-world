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
  ...['목재 카운터와 창 블라인드','새들 가죽 하이체어','증류주 병과 유리잔','칵테일과 바 도구','철제 선반의 허브 화분','석재 바닥과 접촉 그림자','호박빛 전구 갓'].map(label=>{
    const name='모보 바 · '+label;
    return ['jwmarriott','7F','mobo-bar/mobo.blend',name,name];
  }),
  ['gyeongbu','B1','gyeongbu-hangaram/hangaram-framing.blend','한가람문구 · 맞춤액자 코너','한가람 반포 · 액자 코너'],
  ['gyeongbu','B1','gyeongbu-hangaram/hangaram-framing.blend','한가람문구 · 액자 금박과 견본화','근접 · 몰딩 새김과 그림'],
  ['gyeongbu','1F','gyeongbu-pharmacy/gyeongbu-pharmacy.blend','고속터미널약국 · 곡면 입구와 쇼윈도','Pharmacy','Glass','Lit'],
  ...['다이소 · 홈가드닝 화분 진열','다이소 · 화분 옆 조화 진열'].map(name=>['gyeongbu','B1','daiso-garden/garden.blend',name,name]),
  ['gyeongbu','1F','gyeongbu-boards/gates-5-to-10.blend','경부선 · 5~10번 승차홈 전광판','Housing','Lightboxes'],
  ['centralcity','2F','bean-brothers/fp203.blend','빈브라더스 · FP203 커피바와 좌석','빈브라더스 · FP203 커피바와 좌석'],
  ['jwmarriott','8F','lounge-drapery/drapes.blend','더 라운지 · 묶은 주름 커튼','더 라운지 · 묶은 주름 커튼'],
  ['jwmarriott','8F','lounge-upholstery/sofa.blend','더 라운지 · 크림색 코너 소파','더 라운지 · 크림색 코너 소파'],
  ['newcore','4F','modernhouse-provence/market.blend','모던하우스 · 마르셰 프로방스','모던하우스 · 마르셰 프로방스'],
  ['gyeongbu','1F','gyeongbu-icecream/gyeongbu-scoop-parlor.blend','배스킨라빈스 · 스쿱·케이크 매장','Parlor','Glass','Lit'],
  ...['케르반 · 제과와 포장 진열','케르반 · 청록색 주방창','케르반 · 모자이크 등','케르반 · 라바시와 차 한 상']
    .map(name=>['famille','2F','kervan/fp216.blend',name,name]),
  ...['담꽃 · 다기와 보자기 진열장','담꽃 · 백색 주문대와 검은 의자','담꽃 · 밤대추팥빙수 한 상']
    .map(name=>['centralcity','2F','damccot/fp204.blend',name,name]),
  ...['계단식 휴게 좌석','꽃이삭 화분','벽면 투사와 조명 레일'].map(label=>{
    const name='고터·세빛 라운지 · '+label;
    return ['onebailey','B1','sebit-lounge/lounge.blend',name,name];
  }),
  ...[['포석정 · 옥상 점포와 좌석','포석정 · 옥상 점포와 좌석'],['포석정 · 일곱 식탁의 배치','포석정 · 공용 4인 식탁과 의자'],
      ['포석정 · 불판과 상차림','포석정 · 불판과 상차림'],['경부선 옥상 · 대형 청색 채널 글자','청색 옥상 대형 간판']]
    .map(([mesh,native])=>['gyeongbu','10F','gyeongbu-rooftop/poseokjeong-rooftop.blend',mesh,native]),
  ...['병 선반','와인 진열 카트','나무 와인 상자','벽돌 궁륭과 석재 바닥'].map(label=>{
    const name='더 마고 그릴 · '+label;
    return ['jwmarriott','7F','margaux-cellar/cellar.blend',name,name];
  }),
  ...await retailSources(),
  ['gyeongbu','1F','gyeongbu-ticket-office/gyeongbu-ticket-office.blend','경부선 · 통합매표소','TicketOffice','Glass','Lit'],
  ...['노란 아치와 침대','베개 진열대','물병과 도시락'].map(label=>{
    const name='모던하우스 키즈 · '+label;
    return ['newcore','4F','modernhouse-kids/kids.blend',name,name];
  }),
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

// The retail author verifies these names against both the production mesh and
// the native collection when exporting the store's camera record.
async function retailSources(){
  const models=new URL('../',import.meta.url);
  const items=await fs.readdir(models,{withFileTypes:true});
  const folders=items.filter(entry=>entry.isDirectory()&&entry.name.startsWith('ssg-')).map(entry=>entry.name).sort();
  return Promise.all(folders.map(async folder=>{
    const record=JSON.parse(await fs.readFile(new URL(folder+'/camera.json',models),'utf8'));
    const {floor,sourceBlend,sourceCollection,meshName}=record;
    if(!floor||!sourceCollection||!meshName||!sourceBlend?.endsWith('.blend')||sourceBlend.includes('/')){
      throw Error('Incomplete retail source for '+folder);
    }
    return ['shinsegae',floor,folder+'/'+sourceBlend,meshName,sourceCollection];
  }));
}

// Older master files used one material's mesh name as the object's permanent ID.
// Keep those editable anchors when the fixed camera tracks a different material.
const legacyRetailId={
  SSG_9F_LaMarzocco:'MarzoccoEnamel',SSG_9F_TWL:'TWLOak',SSG_9F_HermanMiller:'HMFrame',
  SSG_10F_Stokke:'StokkeChairs',SSG_10F_Toebox:'ToeboxFootwear',SSG_11F_SalonDeHaoSum:'HaoMeal',
  SSG_9F_Miele:'MieleCabinet',SSG_8F_Arcteryx:'ArcOutdoorEquipment',
};

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
        const match=root.getObjectByName(subject);
        const placements=match.userData.nativePlacementInstances?match:root;
        const local=new THREE.Matrix4(),world=new THREE.Matrix4();
        for(let index=0;index<(placements.isInstancedMesh?placements.count:1);index++){
          world.copy(placements.matrixWorld);
          if(placements.isInstancedMesh){placements.getMatrixAt(index,local);world.multiply(local);}
          const ordinal=counts.get(subject)||0;
          counts.set(subject,ordinal+1);
          const [x,y,z]=world.elements.slice(12,15);
          const ground=rounded(relief(x,z));
          const level=subject==='광장 · 고리형 청동 조명' && y>=4 ? '2F' : floor;
          const anchor=library.startsWith('ssg-')?(legacyRetailId[collections[0]]??collections[0]):subject;
          result.push({id:[place,anchor,ordinal+1].join('/'),place,placeName:meta.name,floor:level,library,
            collections,subject,ground,terrain:root.userData.terrainApplied?0:ground,matrix:world.toArray().map(rounded)});
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
