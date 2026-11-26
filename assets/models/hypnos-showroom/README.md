# 신세계 강남점 9층 히프노스

히프노스가 공개한 강남점 사진 다섯 장에서 남색 단추 헤드보드와 양옆 스탠드, 크림색 침대와 남색 풋 러너, 무늬 베개, 왼쪽 원단 견본장, 금속 프레임 베딩 선반, 타공 가림막, 둥근 모서리의 천장 조명을 확인했다. 기존 게임 매장 안에 사진의 침대 두 대가 들어가도록 재구성했다. 매장 치수, 진열 방향과 침대·베개 규격은 추정값이다. [브랜드의 강남점 사진](https://hypnoskorea.co.kr/article/store-info/17/4097/) · [신세계 공식 9층 안내도](https://www.shinsegae.com/cms12/SC00002/guide/floor/__icsFiles/afieldfile/2026/11/05/YOKV7v0iSs2u.png)

| 게임에서 보기 | 일반 플레이 화면 |
|---|---|
| [침대 두 대와 타공 가림막](http://127.0.0.1:8765/?pos=-53.4534,40.6,-24.09745&yaw=-69.214&pitch=-3#/shinsegae/9F) | [입구 사진](entrance.jpg) |
| [벨벳 침대와 원단 견본장](http://127.0.0.1:8765/?pos=-49.79861,40.6,-24.88186&yaw=-59.468&pitch=-10#/shinsegae/9F) | [침대 사진](bedside.jpg) |

`hypnos.blend`의 `히프노스 · 신세계 강남 9층` 컬렉션 안에 가구와 조명이 있다. 로컬 X는 매장 앞을 따라가고, Y는 매장 안쪽, Z는 위다. Blender에서 옷감·목재·금속·조명 재질을 편집할 수 있다. 웹에서는 가구 전체를 이 네 재질로 묶었다. 21 m 이내에서 카메라에 잡히면 상세 모델 하나를 요청하고, 멀어지면 156개 삼각형으로 이루어진 가구 윤곽을 표시한다.

프로젝트 루트에서 저장된 .blend의 변경 내용을 내보내거나, 생성 스크립트를 실행해 처음부터 다시 만든다.

```sh
blender -b assets/models/hypnos-showroom/hypnos.blend -P assets/models/hypnos-showroom/export.py
blender -b -P assets/models/hypnos-showroom/build.py
node assets/models/hypnos-showroom/check.mjs
```
