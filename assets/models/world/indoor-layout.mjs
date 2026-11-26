import {wineParts} from '../house-wine-cellar/model.js';
import {types as executiveSeatTypes,prefix as seatPrefix} from '../executive-seating/layout.js';
import {parts as ceramicParts,prefix as ceramicPrefix} from '../daiso-ceramics/layout.js';
import {parts as execParts,prefix as execPrefix} from '../executive-service/layout.js';
import {parts as charDiningParts} from '../char-dining/layout.js';
import {parts as breakfastParts,prefix as breakfastPrefix} from '../flavors-breakfast/layout.js';
import {parts as madangParts} from '../gotomall-madang/layout.js';
import {parts as arrivalParts,prefix as arrivalPrefix} from '../jw-arrival/layout.js';
import {parts as westCornerParts} from '../gotomall-west-corner/layout.js';
import {parts as ashleyParts,prefix as ashleyPrefix} from '../newcore-dessert/layout.js';
import {names as yogurtNames} from '../gotomall-yogurtworld/layout.js';
import {parts as crossingParts,prefix as crossingPrefix} from '../goter-crossing/layout.js';
import {parts as floristParts,prefix as floristPrefix} from '../lejardin-shop/layout.js';
import {parts as loungeTableParts,prefix as loungeTablePrefix} from '../lounge-table-service/layout.js';
import {names as tianjinNames} from '../tianjin-baozi/layout.js';
import {names as warakuNames} from '../waraku/layout.js';
import {catalog as golfCatalog,prefix as golfPrefix} from '../newcore-golf/layout.js';
import {labels as sebitGalleryLabels} from '../sebit-gallery/gallery.js';
import {parts as tamayuraParts} from '../tamayura/layout.js';
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
  ['centralcity','지상','central-plaza-canopy/canopy.blend','센트럴시티 조각 광장 · 열린 캐노피와 의자','CentralCityCourtCanopy'],
  ['centralcity','지상','central-plaza-seatwall/seatwall.blend','센트럴시티 정문 · 동측 석재 앉음벽과 생울타리','CentralCityEastSeatWall'],
  ['streets','지상','sinbanpo-public-oaks/pin-oak.blend','반포센트럴자이 앞 신반포로 · 대왕참나무','SinbanpoPublicPinOak'],
  ...[['서쪽 녹청 구체','CentralCityPatinatedSphere'],['가운데 갈색 구체','CentralCityBronzeSphere'],['동쪽 잔물결 구체','CentralCityRippledSphere']]
    .map(([label,collection])=>['centralcity','지상','central-plaza-spheres/spheres.blend','센트럴시티 광장 · '+label,collection]),
  ['centralcity','지상','central-plaza-lantern/lantern.blend','센트럴시티 조각 광장 · 두 갈래 보행등','CentralCityTwinLantern'],
  ['gotomall','지상','g12-window-print/print.blend','고투몰 G12 · 지상 유리 점인쇄','G12 유리창 점인쇄'],
  ['streets','지상','sinbanpo-plaza-planters/planter.blend','신반포로 · 석재 화분의 전정 수목','SinbanpoPlazaPlanter'],
  ['streets','지상','exit8-sidewalk-lamp/lamp.blend','터미널 8번 출구 · 보도와 차도 등기구','Exit8_Sidewalk_Lamp'],
  ...Object.values(wineParts).map(p=>
    ['centralcity','1F','house-wine-cellar/wine-cellar.blend','와인셀라 · '+p.title,p.collection]),
  ['centralcity','B1','sweet-marcolini/chocolatier.blend','피에르 마르콜리니 · 구리 쇼케이스와 봉봉','GangnamChocolatier','Glass','Lit'],
  ['shinsegae','B1','cinema-rotary/front.blend','원형 광장 · 카멜커피 입면','CamelCoffeeRotaryFront'],
  ...['Wafille','GalleryClock'].map(name=>['famille','1F','famille/gallery.blend',name,name]),
  ['famille','1F','interior-architecture/interiors.blend','파미에 갤러리 아치와 벽등','gallery-rib'],
  ['centralcity','B1','sweet-arcade/pier.blend','스위트 파크 · 디저트 홀 타일 기둥','SweetParkArcadePier'],
  ['shinsegae','B1','sports-shoe-rotary/entry.blend','스포츠 슈 전문관 · 브랜드 간판과 계단','GangnamSportsShoeEntry'],
  ['shinsegae','B1','sweetpark-threshold/threshold.blend','스위트 파크 · 카페 통로 목재 입구','SweetParkCoffeeThreshold'],
  ['shinsegae','B1','osulloc-matcha/station.blend','오설록 강남 · 말차 스테이션','OsullocGangnamMatchaStation'],
  ['shinsegae','B1','salt-house-gangnam/shop.blend','소금집 강남 · 샌드위치 주문대와 숙성 진열장','SaltHouseGangnam'],
  ['shinsegae','B1','godiva-emack/counter.blend','에맥앤볼리오스 · 고디바 크레페 창가 매대','GangnamCrepeAndWaffle'],
  ['shinsegae','B1','guo-dumpling/counter.blend','구오 X 여경래 · 생전포 철판과 지짐만두','GuoDumpling'],
  ['shinsegae','B1','blue-butterfly/counter.blend','블루버터플라이 · 스프링롤 쇼케이스','BlueButterfly'],
  ['shinsegae','B1','kyoto-onimaru/counter.blend','교토 오니마루 · 곡면 진열대와 야끼무스비','KyotoOnimaru'],
  ['shinsegae','B1','nespresso-gangnam/display.blend','네스프레소 · 버츄오 시음 진열대','GangnamNespressoDisplay'],
  ['shinsegae','B1','intelligentsia-gangnam/coffeebar.blend','인텔리젠시아 강남 · 오렌지 진열장과 커피 바','GangnamCoffeebar'],
  ['newcore','1F','newcore-mamas/front.blend','뉴코아 3관 · 카페 마마스 외관','NC_MamasStreetFront'],
  ['newcore','5F','newcore-oksoban-entry/front.blend','뉴코아 1관 5층 · 옥소반 안내 데스크','NC_OksobanEntrance'],
  ['newcore','5F','newcore-yucheon/front.blend','뉴코아 1관 5층 · 유천냉면 입구와 식당 홀','NC_YucheonDiningHall'],
  ['gyeongbu','7F','gyeongbu-clothing-fronts/seven/tailored-front.blend','경부선 7층 · 두 단의 모직과 코트 전면','7층 신사복 · 이단 모직 진열과 코트 전면'],
  ['gyeongbu','8F','gyeongbu-clothing-fronts/eight/knit-front.blend','경부선 8층 · 긴 니트와 스카프 전면','8층 여성복 · 긴 니트와 스카프 전면'],
  ['shinsegae','B1','ypbooks-rotary/reading.blend','영풍문고 · 계단식 독서 공간','YPBooksReadingBay'],
  ['shinsegae','B1','ypbooks-rotary/front.blend','영풍문고 강남신세계점 · 원형 광장 입구','YPBooksRotaryFront'],
  ['centralcity','B1','buchang-walnut/counter.blend','부창제과 · 호두과자 철판과 선물 상자','BuchangWalnutCounter'],
  ['centralcity','B1','another-palm-astro/display.blend','어나더팜 · 아톰 에디션','AnotherPalmAstro'],
  ['centralcity','B1','biscuiterie-mo/biscuiterie.blend','비스퀴테리 M.O · 마들렌과 번호 틴 진열장','BiscuiterieMO','MO glazing','MO lit fittings'],
  ['centralcity','B1','fortnum-tea-shop/tea-shop.blend','포트넘앤메이슨 · 목재 입구와 홍차 진열대','FortnumSweetPark'],
  ['centralcity','B1','im-donut/display.blend','아임도넛 · 생도넛과 공개 조리창','ImDonutGangnam'],
  ['centralcity','B1','van-leeuwen/display.blend','밴루엔 · 아이스크림과 밀크셰이크','VanLeeuwen'],
  ['centralcity','B1','pompompurin-bakery/display.blend','폼폼푸린 · 오븐과 캐릭터 빵','PompompurinBakery'],
  ['centralcity','B1','haz-bakery/display.blend','하츠베이커리 · 샌드베이글과 포장','HazBakeryCounter'],
  ['centralcity','B1','sweet-arabica/entrance.blend','스위트 파크 · %아라비카 입면','ArabicaGangnamFront'],
  ['centralcity','B1','sweet-cake-counters/cakes.blend','스위트 파크 · 키친205 케이크 진열','SweetKitchen205'],
  ['centralcity','B1','sweet-cake-counters/cakes.blend','스위트 파크 · 쇼토 케이크 진열','SweetShoto'],
  ['centralcity','B1','chipotle-gangnam/counter.blend','치폴레 강남신세계점 · 주문대','ChipotleGangnamOrderBar'],
  ['centralcity','B1','five-guys-gangnam/front.blend','파이브가이즈 고속터미널 · 창과 음료대','FiveGuysGangnamFront'],
  ...[['보석 진열창','JewelryShadowbox'],['세로형 광고 화면','RetailPortrait'],['사각 매입등','SquareDownlightPair']].map(([label,source])=>
    ['jwmarriott','3F','jw-retail-gallery/finishes.blend','신세계 연결 갤러리 · '+label,source]),
  ['centralcity','1F','house-entry-gallery/vestibule.blend','하우스 오브 신세계 · 경사 통로 천장과 벽','HouseEntryRampBay'],
  ['centralcity','1F','house-entry-gallery/vestibule.blend','하우스 오브 신세계 · 청동 벽과 식재 입구','HouseEntryGallery'],
  ['centralcity','B1','sweet-garden-soffit/soffit.blend','스위트 가든 · 에스컬레이터 공통 하부','SweetGardenBankSoffit'],
  ['centralcity','B1','sweet-chefs-stage/counter.blend','스위트 파크 · 셰프스 스테이지와 르솔레이','SweetPark_ChefsStage'],
  ['shinsegae','B1','megabox-central/entrance.blend','메가박스 센트럴 · 부티크 아치 입면','MegaboxBoutiquePublicFront'],
  ['gyeongbu','3F','gyeongbu-basket-display/baskets.blend','경부선 화기·바구니 · 등바구니 진열','FlowerMarketWicker'],
  ['gyeongbu','3F','gyeongbu-flower-bank/flower-bank.blend','경부선 생화상가 · 절지와 열매 진열대','FreshFlowerWholesaleBank'],
  ['jwmarriott','9F','executive-seating/seating.blend','JW 9층 좌석 · 아이보리 원탁과 검은 에이프런','JW 9층 좌석 · 아이보리 원탁과 검은 에이프런'],
  ...Object.values(executiveSeatTypes).map(label=>{const name=seatPrefix+label;return ['jwmarriott','9F','executive-seating/seating.blend',name,name];}),
  ...Object.values(ceramicParts).map(([label])=>{const name=ceramicPrefix+label;return ['gyeongbu','B1','daiso-ceramics/ceramics.blend',name,name];}),
  ...Object.values(execParts).map(([label])=>{const name=execPrefix+label;return ['jwmarriott','9F','executive-service/lounge.blend',name,name];}),
  ...Object.values(charDiningParts).map(([name])=>['famille','2F','char-dining/restaurant.blend',name,name]),
  ...Object.values(breakfastParts).map(([label])=>{const name=breakfastPrefix+label;return ['jwmarriott','2F','flavors-breakfast/breakfast.blend',name,name];}),
  ...[['booth','상점 마감과 면사 울사 전문도매 표지','진열장과 표지'],['yarn','종이띠를 두른 면사와 울사 실타래','실타래와 종이띠'],
      ['wrap','도매 묶음의 투명 봉투와 접힌 이음매','도매용 투명 묶음'],['dresses','새틴 허리띠와 자수 주름 아동 드레스','아동 드레스와 저지']].map(([key,title,collection])=>
    ['gyeongbu','6F','gyeongbu-yarn-and-dresses/'+key+'/'+key+'.blend','경부선 6층 · '+title,'6층 면사·울사 · '+collection]),
  ...Object.values(madangParts).map(([name])=>['gotomall','B1','gotomall-madang/madang.blend',name,name]),
  ...Object.values(arrivalParts).map(([label])=>{const name=arrivalPrefix+label;return ['jwmarriott','1F','jw-arrival/arrival.blend',name,name];}),
  ['jwmarriott','1F','interior-architecture/interiors.blend','현관 홀 월넛 격자 천장','hotel-lattice'],
  ...[['arch','자연목 아치와 걸이 공중식물'],['stand','백색 철제 선반과 입구 마루'],['left','왼편 산세베리아와 화분'],
      ['right','오른편 잎식물과 다육 트레이'],['timber','자작 통나무와 고목 진열']].map(([key,label])=>
    ['gyeongbu','3F','gyeongbu-terrarium/'+key+'/'+key+'.blend','경부선 박테라리움 · '+label,'박테라리움 · '+label]),
  ...Object.values(westCornerParts).map(([name])=>['gotomall','B1','gotomall-west-corner/west-corner.blend',name,name]),
  ...Object.values(ashleyParts).map(([label])=>{
    const name=ashleyPrefix+label;return ['newcore','5F','newcore-dessert/dessert-room.blend',name,name];
  }),
  ...[['ribbon','색상별 리본과 꽃 포장','색상별 리본과 꽃 포장 진열'],
      ['case','원목 진열장과 황동 촛대','원목 진열장과 황동 촛대'],
      ['crystal','절삭 유리 화기와 고블릿','절삭 유리 화기와 고블릿']].map(([key,label,original])=>
    ['gyeongbu','3F','gyeongbu-florist-stock/'+key+'/'+key+'.blend','경부선 현대데코 · '+label,'현대데코 · '+original]),
  ...Object.values(yogurtNames).map(label=>{
    const name='요거트월드 · '+label;return ['gotomall','B1','gotomall-yogurtworld/g012.blend',name,name];
  }),
  ...Object.values(crossingParts).map(([label])=>{
    const name=crossingPrefix+label;return ['streets','지상','goter-crossing/signals.blend',name,name];
  }),
  ...Object.values(tianjinNames).map(label=>{
    const name='천진포자 · '+label;
    return ['centralcity','1F','tianjin-baozi/restaurant.blend',name,name];
  }),
  ...Object.values(floristParts).map(([label])=>{
    const name=floristPrefix+label;return ['centralcity','1F','lejardin-shop/flowershop.blend',name,name];
  }),
  ...Object.values(loungeTableParts).map(([label])=>{
    const name=loungeTablePrefix+label;
    return ['jwmarriott','8F','lounge-table-service/lounge-tables.blend',name,name];
  }),
  ...Object.values(warakuNames).map(label=>{
    const name='와라쿠 · '+label;return ['centralcity','1F','waraku/dining.blend',name,name];
  }),
  ...Object.values(golfCatalog).map(([label])=>{
    const name=golfPrefix+label;
    return ['newcore','5F','newcore-golf/golf-shop.blend',name,name];
  }),
  ...Object.values(tamayuraParts).map(([label])=>{
    const name='타마유라 · '+label;
    return ['jwmarriott','2F','tamayura/tamayura.blend',name,name];
  }),
  ...['142','360'].map(route=>[
    'streets','지상','seoul-city-bus/city-bus.blend','신반포로 간선버스 · '+route+'번',
    '간선버스 · 도장 차체와 경량 휠','간선버스 · 저상 승객석과 입석 손잡이','간선버스 · 곡면 유리와 출입문',
    '간선버스 · 전조등과 차폭등','간선버스 · '+route+'번 노선 표시',
  ]),
  ...['1F','2F'].flatMap(floor=>[
    ['gyeongbu',floor,'gyeongbu-uniqlo-rails/parka/parka-rail.blend','경부선 유니클로 '+floor+' · 경량 후드 파카 행거','유니클로 · 경량 후드 파카 양면 행거'],
    ['gyeongbu',floor,'gyeongbu-uniqlo-rails/blouse/blouse-rail.blend','경부선 유니클로 '+floor+' · 시어서커 블라우스 행거','유니클로 · 시어서커 블라우스 양면 행거'],
  ]),
  ['gyeongbu','2F','gyeongbu-uniqlo-finish/upstairs/oak-and-lighting.blend','경부선 유니클로 · 2층 참나무 판매층과 열린 계단','유니클로 2층 · 참나무 바닥과 계단 개구부'],
  ['gyeongbu','1F','gyeongbu-uniqlo/entrance-fashion.blend','경부선 유니클로 · 에어리즘과 입구 코디','본관 1층 유니클로 · 에어리즘 진열과 토르소'],
  ['gyeongbu','1F','gyeongbu-uniqlo-finish/oak-and-lighting.blend','경부선 유니클로 · 참나무 판매층과 흰 노출 천장','본관 1층 유니클로 · 참나무 바닥과 노출 천장'],
  ['gyeongbu','2F','gyeongbu-baking/baking-shop.blend','경부선 부속상가 · 비앤씨마켓 반죽기와 제과 도구','부속상가 2층 비앤씨마켓 · 반죽기와 제과 도구'],
  ['gyeongbu','4F','gyeongbu-hanbok/hanbok-showroom.blend','경부선 4층 · 고명재한복 치마와 저고리','4층 고명재한복 · 금직 치마와 저고리 진열'],
  ['gyeongbu','6F','gyeongbu-childrens-aisle/childrens-aisle.blend','경부선 6층 · 아동복 철망 진열과 접은 상품','6층 아동복 · 철망 행거와 접은 상품'],
  ['gyeongbu','8F','gyeongbu-womens-aisle/womens-aisle.blend','경부선 8층 · 식물무늬 니트와 집게 바지 및 외투 마네킹','8층 여성복 · 식물무늬 니트와 외투 마네킹'],
  ['gyeongbu','7F','gyeongbu-suiting-aisle/suiting-aisle.blend','경부선 7층 · 이단 신사복 행거와 소매 상품표','7층 신사복 · 모직 재킷과 이단 봉'],
  ['gyeongbu','1F','gyeongbu-front-cafes/cafes.blend','경부선 부속상가 · 이디야와 달리나인 거리 정면','경부선 정문 옆 · 이디야와 달리나인'],
  ...['CushionRack','CushionLinen','CushionSage','CushionRose','CushionIvory'].map(name=>
    ['gyeongbu','B1','concourse-fixtures/concourse-fixtures.blend','다이소 패브릭 · '+name,name]),
  ...['검은 강재 차양과 승객 벤치','강화유리와 반투명 수평 띠','한강과 서래섬 포스터','승객용 전광판과 안내 케이스','차양등과 보도 빛'].map(label=>{
    const name='중앙차로 승차대 · '+label;
    const native=label==='승객용 전광판과 안내 케이스'?'중앙차로 승차대 · 승객 전광판과 안내함':name;
    return ['streets','지상','sinbanpo-bus-shelters/shelters.blend',name,native];
  }),
  ['gyeongbu','1F','gyeongbu-waiting-ceiling/waiting-ceiling.blend','경부선 대합실 좌석 · 목재 루버와 매입등','1F waiting lounge · editable ceiling sections'],
  ['gyeongbu','1F','gyeongbu-planted-columns/planted-column.blend','경부선 대합실 · 식물 기둥','대합실 · 네 면을 감싼 식물 기둥'],
  ['gyeongbu','1F','gyeongbu-front-entrance/portal.blend','경부선 정문 · 석재 차양과 영문 명판','정문 · 경사 기둥과 영문 채널 문자'],
  ['gyeongbu','1F','gyeongbu-front-entrance/tower.blend','경부선 명판탑 · 한글 채널 문자와 적갈색 외벽','정면 명판탑 · 입체 글자와 적갈색 외벽'],
  ...['머리띠와 집게핀·헤어롤 진열','손잡이 청소솔과 틈새 브러시 진열'].map(label=>{
    const name='다이소 · '+label;
    return ['gyeongbu','B1','daiso-accessories/accessories.blend',name,name];
  }),
  ...['검은 액자와 원형 펜던트','목제 유리장 속 겹친 와플콘','돌상판과 황동 난간 주문대','스테인리스 뚜껑과 맛 이름표','황동 고정 메뉴와 스무 맛',
      '청록 상호와 두 색 콘 심벌','에스프레소 머신과 뒤 작업대','유백 구형 펜던트의 빛','포장 컵·보냉 상자와 계산대','두 맛 컵과 와플콘·젤라또라떼','주문대 보호유리'].map(label=>{
    const name='젤라띠 · '+label;
    return ['centralcity','1F','gelati/gelateria.blend',name,name];
  }),
  ...['체크 바닥과 검은 상호 외벽','물결 선반과 선물 상자','둥근 주문대와 사선 견본장','통초콜릿과 잘라 보인 단면',
      '개별 포장 롤리팝과 사탕','둥근 전시대의 포장 선물','둥근 정면 쇼윈도 유리','견본장의 사선 보호유리'].map(label=>{
    const name='씨즈캔디 · '+label;
    return ['centralcity','1F','sees/fp104.blend',name,name];
  }),
  ...['갈색 아치와 청색 커피 벽','흰 곡면 커피바와 추출 장비','각진 스툴과 창가 금속 벤치','버터바와 약과 쿠키 진열장','버터크림라떼와 바통 휘낭시에'].map(label=>{
    const name='하프커피 · '+label;
    return ['centralcity','2F','halff/fp212.blend',name,name];
  }),
  ...['두 줄 석재의 곡선 벤치','기둥 금속틀과 식재','기둥의 곡면 유리','바닥의 밝은 석재 상감'].map(label=>{
    const name='고투몰 서편 · '+label;
    return ['gotomall','B1','gotomall-west-seats/west-lounge.blend',name,name];
  }),
  ['gyeongbu','1F','gyeongbu-concourse-finish/concourse-finish.blend','경부선 대합실 · 석재 바닥과 곡면 간접 천장','Editable public concourse finishes'],
  ...['흰 곡면 화단 벤치','수경 화단의 바위와 늘어진 잎','휴게광장 접이식 유아차'].map(label=>{
    const name='고투몰 · '+label;
    return ['gotomall','B1','gotomall-rest-garden/plaza.blend',name,name];
  }),
  ...['나무 포장식품 매대','후레시 스시 벽장과 간판','한입새우튀김 포장','새우롤 포장','김가루 롤 포장','팔각 양장피 포장'].map(label=>{
    const name='킴스클럽 델리 · '+label;
    return ['newcore','B1','kims-deli/deli.blend',name,name];
  }),
  ['gyeongbu','10F','gyeongbu-yukgak/shop.blend','경부선 육각고기 · 공개 식당 입구','GB_YukgakRooftopRestaurant'],
  ['gyeongbu','1F','gyeongbu-hyodo/shop.blend','경부선 효도치킨 · 유리 입구와 식당','GB_HyodoDiningFront'],
  ['gyeongbu','1F','gyeongbu-luggage/zimcarry-counter.blend','짐캐리 · 수하물보관과 운송 창구','LuggageCounter','Glass','Lit'],
  ...['대기 접수대와 유아의자','유리블록과 대나무 조명','목제 식탁과 곡목 의자','찜기 세 가지와 차','피기 커스터드 번'].map(label=>{
    const name='딤딤섬 · '+label;
    return ['centralcity','1M','dimdimsum/restaurant.blend',name,name];
  }),
  ...['흰 다섯 단 서가와 여행 책자','다국어 책장과 세로 열람 화면','곡면 방문 안내대와 상담 집기','삼색 상호와 은색 안내 벽','천장 매입등과 입구 문턱'].map(label=>{
    const name='세빛 안내 · '+label;
    return ['onebailey','B1','sebit-information/visitor-desk.blend',name,name];
  }),
  ...['목재 카운터와 창 블라인드','새들 가죽 하이체어','증류주 병과 유리잔','칵테일과 바 도구','철제 선반의 허브 화분','석재 바닥과 접촉 그림자','호박빛 전구 갓'].map(label=>{
    const name='모보 바 · '+label;
    return ['jwmarriott','7F','mobo-bar/mobo.blend',name,name];
  }),
  ['gyeongbu','B1','gyeongbu-hangaram/hangaram-framing.blend','한가람문구 · 맞춤액자 코너','한가람 반포 · 액자 코너'],
  ['gyeongbu','B1','gyeongbu-hangaram/hangaram-framing.blend','한가람문구 · 액자 금박과 견본화','근접 · 몰딩 새김과 그림'],
  ['gyeongbu','1F','gyeongbu-pharmacy/gyeongbu-pharmacy.blend','고속터미널약국 · 곡면 입구와 쇼윈도','Pharmacy','Glass','Lit'],
  ...['다이소 · 달항아리와 압화 액자 진열','다이소 · 나무 소반과 컵받침·카드꽂이'].map(name=>['gyeongbu','B1','daiso-home/homeware.blend',name,name]),
  ...['다이소 · 홈가드닝 화분 진열','다이소 · 화분 옆 조화 진열'].map(name=>['gyeongbu','B1','daiso-garden/garden.blend',name,name]),
  ['gyeongbu','1F','gyeongbu-boards/gates-5-to-10.blend','경부선 · 5~10번 승차홈 전광판','Housing','Lightboxes','DepartureLCD'],
  ['centralcity','2F','bean-brothers/fp203.blend','빈브라더스 · FP203 커피바와 좌석','빈브라더스 · FP203 커피바와 좌석'],
  ['jwmarriott','8F','lounge-drapery/drapes.blend','더 라운지 · 묶은 주름 커튼','더 라운지 · 묶은 주름 커튼'],
  ['jwmarriott','8F','lounge-upholstery/sofa.blend','더 라운지 · 크림색 코너 소파','더 라운지 · 크림색 코너 소파'],
  ['newcore','4F','modernhouse-picnic/picnic.blend','모던하우스 · 딸기와 데이지 러그','모던하우스 · 딸기와 데이지 러그'],
  ['newcore','4F','modernhouse-provence/market.blend','모던하우스 · 마르셰 프로방스','모던하우스 · 마르셰 프로방스'],
  ['gyeongbu','1F','gyeongbu-icecream/gyeongbu-scoop-parlor.blend','배스킨라빈스 · 스쿱·케이크 매장','Parlor','Glass','Lit'],
  ...['케르반 · 제과와 포장 진열','케르반 · 청록색 주방창','케르반 · 모자이크 등','케르반 · 라바시와 차 한 상']
    .map(name=>['famille','2F','kervan/fp216.blend',name,name]),
  ...['담꽃 · 다기와 보자기 진열장','담꽃 · 백색 주문대와 검은 의자','담꽃 · 밤대추팥빙수 한 상']
    .map(name=>['centralcity','2F','damccot/fp204.blend',name,name]),
  ...Object.values(sebitGalleryLabels).map(label=>{
    const name='피카소 벽화길 · '+label;
    return ['onebailey','B1','sebit-gallery/gallery.blend',name,name];
  }),
  ...['계단식 휴게 좌석','꽃이삭 화분','벽면 투사와 조명 레일'].map(label=>{
    const name='고터·세빛 라운지 · '+label;
    return ['onebailey','B1','sebit-lounge/lounge.blend',name,name];
  }),
  ...[['포석정 · 옥상 점포와 좌석','포석정 · 옥상 점포와 좌석'],['포석정 · 일곱 식탁의 배치','포석정 · 공용 4인 식탁과 의자'],
      ['포석정 · 불판과 상차림','포석정 · 불판과 상차림'],['경부선 옥상 · 대형 청색 채널 글자','청색 옥상 대형 간판']]
    .map(([mesh,native])=>['gyeongbu','10F','gyeongbu-rooftop/poseokjeong-rooftop.blend',mesh,native]),
  ...[['HearthMasonry','벽돌과 숯받이'],['HearthIron','쇠바구니와 선반'],['HearthEmbers','숯불']].map(([collection,label])=>
    ['jwmarriott','7F','margaux-woodfire/hearth.blend','더 마고 그릴 · 화덕 '+label,collection]),
  ['jwmarriott','7F','margaux-chair/chair.blend','더 마고 그릴 · 다이닝 가죽 의자','MargauxDiningChair'],
  ...[['GardenSteel','프레임과 천장'],['GardenGlass','홈유리'],['GardenLight','펜던트 발광면'],['GardenFloor','카펫과 석재']].map(([collection,label])=>
    ['jwmarriott','7F','margaux-garden-window/window.blend','더 마고 그릴 · 정원창 '+label,collection]),
  ...['병 선반','와인 진열 카트','나무 와인 상자','벽돌 궁륭과 석재 바닥'].map(label=>{
    const name='더 마고 그릴 · '+label;
    return ['jwmarriott','7F','margaux-cellar/cellar.blend',name,name];
  }),
  ['famille','1F','famille-shopfront/shopfront.blend','파미에 식당가 · 접이식 격자창과 점포 띠','FamilleShopfrontBay'],
  ['famille','1F','famille-shopfront/shopfront.blend','파미에 식당가 · 석재 덧기둥','FamilleLimestonePier'],
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
  ['jwmarriott','2F','patisserie/gateaux.blend','파티세리 · 홀케이크와 쁘띠 가토','파티세리 · 홀케이크와 쁘띠 가토'],
  ['jwmarriott','8F','lounge-chair/lounge-chair.blend','더 라운지 · 피콕 라탄체어','피콕 암체어 · JW 8층 더 라운지'],
  ['newcore','5F','newcore/oksoban-table.blend','옥소반 · 인덕션','옥소반 · 1관 5F 식탁'],
  ['newcore','외관','architectural-retail/retail-architecture.blend','NewcoreArch','NewcoreArch'],
  ['newcore','1F','architectural-retail/retail-architecture.blend','BoutiqueWindow','BoutiqueWindow'],
  ['shinsegae','9F','hypnos-showroom/hypnos.blend','히프노스 침대 · 원거리','히프노스 · 신세계 강남 9층'],
  ['shinsegae','6F','architectural-retail/retail-architecture.blend','CaseGallery','CaseGallery'],
  ['shinsegae','5F','architectural-retail/retail-architecture.blend','RectoWall','RectoWall'],
  ['centralcity','1F','open-stage-coffer/coffer.blend','오픈 스테이지 · 코퍼 몰딩','오픈 스테이지 · 코퍼 몰딩'],
  ['centralcity','1F','open-stage-lounge/lounge.blend','오픈 스테이지 · 흰 소파와 낮은 테이블','오픈 스테이지 · 흰 소파와 낮은 테이블'],
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

// Repeat a native collection inside a merged display without adding game draw calls or edit-only scene nodes.
function* nativeTransforms(root,rules){
  if(root.userData.nativeComponents){
    root.updateWorldMatrix(true,false);
    for(const part of root.userData.nativeComponents){
      const rule=rules.find(row=>row[3]===part.subject);
      if(rule)yield [rule,new THREE.Matrix4().makeTranslation(...part.translation).premultiply(root.matrixWorld)];
    }
    return;
  }
  const rule=rules.find(row=>root.getObjectByName(row[3]));
  if(!rule)return;
  root.updateWorldMatrix(true,true);
  const match=root.getObjectByName(rule[3]);
  const group=match.userData.nativePlacementInstances?match:root;
  const local=new THREE.Matrix4(),world=new THREE.Matrix4();
  for(let i=0;i<(group.isInstancedMesh?group.count:1);i++){
    world.copy(group.matrixWorld);
    if(group.isInstancedMesh){group.getMatrixAt(i,local);world.multiply(local);}
    yield [rule,world];
  }
}

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
      // A dedicated hotel page uses level floor plates. Register them on the
      // same footprint midpoint as the hotel podium in the native city builder.
      let hotelDatum;
      if(place==='jwmarriott'){
        const outline=osm.buildings.find(building=>building.id===136986976).poly;
        const centre=[0,1].map(axis=>{
          const coords=outline.map(point=>point[axis]);
          return (Math.min(...coords)+Math.max(...coords))/2;
        });
        hotelDatum=rounded(relief(...centre));
        const collections={
          cakes:'Pâtisserie · entremets on cake boards',booth:'Margaux Grill · booth and opal lantern',
          display:'Margaux Grill · framed tableware exhibit',herbs:'JW Garden · herb trough',tea:'The Lounge · tea service',
        };
        kit.recordHotelFixture=(key,floor,o,x,z,y,scale)=>{
          const matrix=new THREE.Matrix4().set(x[0]-o[0],0,z[0]-o[0],o[0],0,scale,0,y,x[1]-o[1],0,z[1]-o[1],o[1],0,0,0,1);
          const ordinal=(counts.get(key)||0)+1;counts.set(key,ordinal);
          const ground=hotelDatum;
          result.push({id:place+'/'+key+'/'+ordinal,place,placeName:meta.name,floor,library:'jwmarriott/hotel-details.blend',
            collections:[collections[key]],subject:collections[key],ground,terrain:ground,matrix:matrix.toArray().map(rounded)});
        };
        kit.recordHotelRoof=(name,poly,y,mat)=>{
          const ordinal=(counts.get(name)||0)+1;counts.set(name,ordinal);
          const subject=name+' '+ordinal;
          const faces=[poly.map(([x,z])=>[x,-z,y].map(rounded))];
          result.push({id:place+'/roof/'+subject,place,placeName:meta.name,floor:'7F',library:'jwmarriott/public-roof.blend',
            collections:[subject],subject,ground:hotelDatum,terrain:hotelDatum,matrix:new THREE.Matrix4().toArray(),faces,color:mat.color??0x659fa5});
        };
      }
      const addMesh=kit.addMesh;
      kit.onNight=()=>{};
      kit.addMesh=root=>{
        const placed=addMesh(root);
        for(const [rule,world] of nativeTransforms(root,rules)){
          const [,floor,library,subject,...collections]=rule;
          const ordinal=counts.get(subject)||0;
          counts.set(subject,ordinal+1);
          const [x,y,z]=world.elements.slice(12,15);
          const ground=hotelDatum??rounded(relief(x,z));
          const level=subject==='광장 · 고리형 청동 조명' && y>=4 ? '2F' : floor;
          const anchor=library==='central-plaza-spheres/spheres.blend'?collections[0]:
            library.startsWith('ssg-')?(legacyRetailId[collections[0]]??collections[0]):subject;
          result.push({id:[place,anchor,ordinal+1].join('/'),place,placeName:meta.name,floor:level,library,
            collections,subject,ground,terrain:root.userData.terrainApplied?0:ground,matrix:world.toArray().map(rounded)});
        }
        return placed;
      };
      kit._.setCurrent(place,meta);
      build(kit);
      // The sales floor is batched into the structural slab. Its editable face
      // already uses city X/Z coordinates, so only the exterior height datum is added.
      if (place==='shinsegae') {
        const market=kit._.zonesList.find(z=>z.name==='신세계 마켓' && z.floor==='B1');
        if (!market) throw Error('Missing Shinsegae B1 sales-floor polygon');
        const [x,z]=market.poly[0], ground=rounded(relief(x,z));
        result.push({id:'shinsegae/MarketSalesFloor/1',place,placeName:meta.name,floor:'B1',
          library:'shinsegae-market-floor/market-floor.blend',collections:['Shinsegae_B1_Market_Floor'],
          subject:'신세계 마켓 판매장 바닥',ground,terrain:ground,matrix:new THREE.Matrix4().toArray()});
        // This shell spans multiple terrain datums. Its native vertices already
        // carry the same local relief as the rendered floors and partitions.
        result.push({id:'shinsegae/CinemaPublicShell/1',place,placeName:meta.name,floor:'B1',
          library:'cinema-public-shell/public-shell.blend',collections:['Shinsegae_B1_Cinema_Public_Shell'],
          subject:'원형 광장과 식품관 카페 통로',ground:0,terrain:0,matrix:new THREE.Matrix4().toArray()});
      }
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
