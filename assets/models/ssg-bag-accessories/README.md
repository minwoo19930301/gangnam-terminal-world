# 신세계 강남점 투미

6층 투미 매대에 같은 지점의 2026년 ‘메디터레니언 이스케이프’ 전시 중 한 장면을 옮겼다. 흰 매대 왼쪽에 산호색 미니백, 가운데에 모래색 플랩 백팩, 오른쪽에 노란 꽃이 꽂힌 흰 화병을 두었다. 낮은 청록색 타일 매대에는 다른 각도에서 볼 수 있는 세이지색 가방과 전시용 구명환을 배치했다. [일반 게임 화면](game.jpg) · [같은 카메라로 걷기](../../../?pos=-54.45,26.2,90.32&yaw=-176&pitch=-18#/shinsegae/6F)

## 사진과 재현 범위

- 백화점 공식 6층 안내와 투미의 매장 목록에 따라 러기지 구역의 기존 투미 매장을 사용했다. [신세계 층별 안내](https://www.shinsegae.com/store/floor.do?storeCd=SC00002) · [강남점 6층 도면](https://www.shinsegae.com/cms12/SC00002/guide/floor/__icsFiles/afieldfile/2026/10/22/ogKqbBuYpuah.png) · [투미 매장 안내](https://www.tumi.co.kr/stores?horizontalView=true&showMap=true)
- 두구루가 촬영한 현장은 강남점 **1층 오픈스테이지**다. 사진에서 판독한 손잡이, 단일 중앙 버클, 전면 좌우 지퍼 포켓, 미니백의 앞지퍼와 꽃의 배치를 모델에 반영했다. 집기 치수, 후면 어깨끈, 직물 결의 크기, 6층에서의 배치는 추정했다. 현재 판매 재고와 백팩 품번은 확인되지 않았다. [시공사 현장 기록](https://duguru.co.kr/all-landscape-collections/?bmode=view&idx=171607918) · [백팩과 미니백 근접 사진](https://cdn.imweb.me/upload/S202106281c063d38a9f7c/f4984bb201b01.jpg) · [풀 타일과 구명환](https://cdn.imweb.me/upload/S202106281c063d38a9f7c/91db3ddd3bbca.jpg)
- 세로형 미니백은 페르시아 크로스바디의 지퍼 수납과 D링을 참고했다. 본체의 평직 노멀맵은 코드로 생성했으며 사진을 텍스처로 사용하지 않았다. [투미 시즌 카탈로그](https://www.tumi.com/collections/mediterranean-escape/) · [페르시아 크로스바디](https://www.tumi.com/p/persia-crossbody-01465791438/)

## 원본과 배치

편집 원본은 `gallery.blend`의 `SSG_6F_TUMI` 컬렉션이다. 개별 메시 369개에 백팩 2점과 미니백 2점, 손잡이와 금속 부속, 매대와 소품이 들어 있다. 단위는 미터다. 원점은 흰 매대 아래 바닥 중심이며 Blender +X가 진열대의 오른쪽, +Y가 뒤, +Z가 위다. Three.js에서 축은 각각 로컬 +X, −Z, +Y에 해당한다. 월드 원점은 (−54.37769, 25.29200, 91.56090), Y축 회전은 −159.22093°다. 높이는 6층 바닥 26.2에 현지 지형 보정을 더한 값이다.

Blender 3.6.23과 내장 Bfont로 검증했다. 저장소 루트에서 아래 명령을 실행한다.

```sh
D=assets/models/ssg-bag-accessories
blender -b --factory-startup --gpu-backend opengl --python-exit-code 1 -P "$D/build.py"
node "$D/pack.mjs"
node tests/smoke.mjs shinsegae
```

압축한 GLB는 345,104바이트, 삼각형 24,584개, 머티리얼 4개로 근접 시 4회 드로한다. 평상시에는 공용 거리·시야 로더가 단일 드로의 간략 진열과 전환한다. [카메라와 편집 컬렉션 정보](camera.json)
