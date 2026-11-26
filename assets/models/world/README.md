# 고속터미널 Blender 월드

[통합 원본 gangnam-terminal.blend](gangnam-terminal.blend)를 열면 반포에서 잠원한강공원까지의 건물·도로·가로수·수변 외관을 미터 단위로 편집할 수 있습니다. 상단 Scene 선택기에서 **시설 · 모델 라이브러리**로 전환하면 장소별 건축과 매장 집기, 차량, 방문객, 계단·승강기 부품을 볼 수 있습니다. 시설 원본은 같은 저장소의 상대 경로로 연결됩니다. 파일을 다른 컴퓨터로 옮길 때는 저장소의 폴더 구조를 함께 유지해 주세요.

[도시 전경](preview.jpg) · [아침·낮·노을·밤](daylight.jpg) · [게임의 실내외 야간 조명](night-interiors.jpg) · [반포대교·잠수교와 세빛섬](river-landmarks.jpg)

## Blender 편집을 게임에 반영하기

| 편집 대상 | Blender에서 바꿀 내용 | 게임에서 읽는 결과 |
| --- | --- | --- |
| 주변 건물과 주요 건물의 원거리 외관 | **건축 · 외관**에서 메시, 높이, UV, 재질 슬롯을 수정합니다. 주요 건물의 자식 메시도 편집할 수 있습니다. | 외벽·지붕·코핑과 랜드마크 입면을 실외 장면의 타일 단위로 그립니다. 상세 장소에 들어가면 해당 장소의 내부 모델을 사용합니다. |
| 신반포4차·반포르엘·반포센트럴자이 | **건축 · 외관 → 신반포로 · 아파트 원본**에서 위치를 확인하고 연결된 원본에서 외벽과 창을 편집합니다. | 보도에서 단지를 바라보면 게임이 원래의 유리·외벽 재질을 담은 상세 모델을 불러옵니다. [세 단지 Blender 파일과 편집법](../banpo-apartments/README.md) |
| 지상 도로와 보행로 | **도로 선형 · 폭 편집**에서 Poly 선의 점을 XY 평면에서 옮기거나 개체 속성 `road_width`를 미터 단위로 수정합니다. | 바뀐 중심선·폭을 입력으로 노면, 차선과 게임 도로를 생성합니다. |
| 표고 | **지형 표고 · 편집 격자**에서 원하는 격자의 눈 아이콘을 켜고 편집 모드에서 점을 Z축으로 옮깁니다. 광역 격자는 25m, 터미널 주변 보정 격자는 5m 간격입니다. | 지형 셰이더와 바닥 판정이 같은 보정값을 읽습니다. 원시 조사 표고는 별도로 조회할 수 있습니다. |
| 가로수와 가로등 | **가로수 · 가로등 배치**의 점 메시를 편집합니다. 지표에 맞춰 수평 이동하거나 직접 높이를 정할 수 있습니다. | 근·원거리 수종과 등기구가 해당 지역을 로드할 때 새 위치에 나타납니다. [상세 편집법](street-layout.md) |
| 개별 상점·시설·차량 | 모델 라이브러리에서 해당 원본 .blend를 열어 부품을 편집하고 그 폴더의 exporter로 내보냅니다. | 원본에 따라 GLB, 배치용 메시 또는 재질 데이터로 불러옵니다. |

저장한 통합 원본을 게임 자산으로 내보내고 로컬에서 열려면 저장소 루트에서 실행합니다.

```sh
blender --factory-startup -b assets/models/world/gangnam-terminal.blend --python-exit-code 1 -P assets/models/world/export.py
npm run serve -- 8765
```

내보내기는 전체 외관 파일 `buildings.json.gz`와 구역별 `building-tiles/`를 함께 갱신합니다. 일반 게임 주소에서는 현재 구역 주변의 파일만 읽습니다.

건물 원본의 색상 재질은 웹에 RGB로 내보냅니다. 파사드 이미지 재질은 `game_texture`에 등록한 게임 재질과 활성 UV를 사용합니다. 거리 조형물은 설치 전 모델과 배치가 분리되어 있습니다. 표고·도로의 편집 격자와 선형은 웹에서 지형과 포장을 재생성하는 입력입니다. Blender의 포장·녹지 표시 메시도 다시 계산하려면 편집한 통합 파일의 복사본을 보관한 후 아래의 전체 재생성을 사용하세요.

### 실내 마감과 집기

**시설 · 실내 배치 → 신세계 강남점 B1**에서 마켓 판매장 바닥과 진열대를 함께 확인할 수 있습니다. 바닥 원본의 모서리를 편집해 내보내면 게임의 서쪽 벽, 바닥과 매장 표시가 같은 윤곽을 따라갑니다. [판매장 바닥 편집법](../shinsegae-market-floor/README.md)

시설 · 모델 라이브러리에서 아래 선반을 열면 편집할 원본을 찾을 수 있습니다.

| 선반 | 게임에 반영되는 부분 |
| --- | --- |
| [공통 에스컬레이터](../escalator/README.md) | 디딤판의 리브, 승하차 빗살판, 손잡이와 곡선 반환부 |
| [경부선 1층 대합실 천장](../gyeongbu-waiting-ceiling/README.md) | 좌석 위 목재 루버, 기둥을 감싸는 곡면, 선형 매입등과 환기구 |
| [센트럴시티 1층 오픈 스테이지 천장](../open-stage-coffer/README.md) | 격자 한 칸의 동심원·치형 몰딩과 보를 따라가는 매입등 |
| [신세계 7층 보스골프](../ssg-golf-apparel/README.md) | 공용 통로에서 보이는 매장 천장의 면조명과 금속 테두리 |
| [JW 8층 라운지 · 라탄 암체어](../lounge-chair/lounge-chair.blend) | 근접 시에 보이는 등받이 짜임, 팔걸이와 방석 마감 |
| [신세계 7층 골프 진열](../shinsegae/upper-floor-displays.blend) | 퍼터 비교 진열대의 몸체와 네 가지 클럽 헤드 |
| [신세계 북측 외벽 간판](../shinsegae-facade/README.md) | 백화점 북측 입구의 채널 문자, 간판 바탕과 테두리 |
| [공용 실내 · 흡음 천장패널](../shared-ceiling/README.md) | 시설 모듈이 공통으로 사용하는 흡음판, 확산 렌즈, 환기 그릴의 모양과 반복 간격 |
| [뉴코아 층판·바닥 마감](../newcore-floor/README.md) | 1·2관 B1~5F와 3관 1F의 포세린·헤링본·연마석, 반복 간격과 층판 두께 |
| [신세계 상층 천장 마감](../upper-retail-finish/README.md) | 상층 공용부 매입 조명, 8층 격자 천장과 선형 조명 |
| [경부선 매표기·다이소 생활용품](../concourse-fixtures/README.md) | 매표기 외장, 쿠션과 3단 진열대 |
| [JW 현관 조명·고투몰 모자](../interior-finish/README.md) | 샹들리에 유리 갓과 금속 프레임, 고투몰 매장 모자와 리본 |

새 원본을 추가한 뒤 기존 도시와 선반의 배치를 유지하면서 통합 파일에 새 선반을 연결할 수 있습니다. 아래 명령은 통합 파일을 저장합니다.

```sh
blender --factory-startup -b assets/models/world/gangnam-terminal.blend --python-exit-code 1 -P assets/models/world/libraries.py
```

## 게임에 배치된 실내 집기

통합 원본의 **시설 · 실내 배치** 장면에서 아웃라이너를 시설과 층별로 열 수 있습니다. 집기를 선택하고 숫자패드 마침표를 누르면 해당 위치로 확대됩니다. 의자 한 줄, 꽃통 하나도 게임에서 사용하는 위치·회전·크기와 표고를 따릅니다. 이 장면의 집기는 각 시설의 Blender 원본을 상대경로로 연결합니다.

게임 배치가 바뀌면 아래 명령으로 이 장면을 갱신할 수 있습니다. Blender에서 직접 움직였거나 제거한 배치는 다음 갱신에도 유지합니다.

```sh
blender --factory-startup -b assets/models/world/gangnam-terminal.blend --python-exit-code 1 -P assets/models/world/indoor-layout.py -- --save
blender --factory-startup -b assets/models/world/gangnam-terminal.blend --python-exit-code 1 -P assets/models/world/indoor-layout-check.py
```

## 서울 시각

타임라인 한 프레임은 서울 시각 1분입니다. 750프레임이 낮 12시 30분이며, 마커에는 해당 날짜의 아침과 노을 시간이 표시됩니다. 태양 방향·광량과 하늘색은 웹의 서울 태양 계산을 사용합니다. 해가 지면 창 면적의 일부에 실내 조명이 켜집니다. Blender에서 현재 서울 시각을 따라가려면 저장소 루트에서 다음과 같이 엽니다.

```sh
blender assets/models/world/gangnam-terminal.blend -P assets/models/world/seoul-clock.py
```

웹에서는 기본값 **서울 실시간**을 사용하거나 시간 선택기에서 네 가지 장면을 선택할 수 있습니다.

## 전체 재생성과 검증

`node assets/models/world/build.mjs blender`는 OSM 외곽선과 이 저장소의 서울 표고, 현재 시설 라이브러리, 내보낸 도로·수목·표고 편집값으로 통합 원본을 **다시 만듭니다**. 개별 건물에 손으로 편집한 조형을 계속 작업할 때는 위의 `export.py`를 사용합니다. 재생성에는 Blender 4.5 LTS, Node, 프로젝트의 npm 의존성, Playwright Chromium, uv가 필요합니다. Shapely와 GEOS가 지형 삼각형을 강안·공원 경계에서 잘라냅니다.

`node tests/blender-world.mjs`는 Blender를 백그라운드로 열어 상대경로 라이브러리, 서울 시각, 게임 메시의 재수출을 검사합니다. 임시 변경으로 건물을 1.25m 올리고 도로 점·폭과 지형 표고를 수정해 나온 데이터도 확인합니다.

단지와 학교의 식재 경계에는 저장소의 Sentinel-2 및 수관 자료도 반영했습니다. [식생 자료와 출처](../../../data/research/parcel-cover.md)

거리뷰와 시설 안내는 모양과 용도를 대조하는 자료입니다. 이번 작업에서 현장 측량한 거리는 없습니다. 매장 진열과 외관의 세부 치수에는 사진에 맞춰 정한 비례가 포함됩니다. [네이버 지도 호텔 외부 거리뷰](https://map.naver.com/p/?p=Cy3jmhWfofOZSFQ5RWAIbA,104.03,2.78,80,Float) · [OpenStreetMap 자료와 저작자](https://www.openstreetmap.org/copyright)

JW 메리어트 실내는 호텔 포디움(도형 136986976)과 같은 높이 원점을 사용한다. 전용 게임 페이지에서 수평인 층과 가구가 지표 기복에 따라 기울어지는 것을 방지한다. 7층 공개 정원은 ‘시설 · 실내 배치’와 ‘반포 · 도시 전경’에 같은 객체로 연결된다. 정원 경계가 게임에서 바뀌면 먼저 일반 배치 manifest를 생성하고 아래 명령으로 편집용 표면을 다시 만든 뒤 도시 배치를 동기화한다. 직접 편집한 정원 원본을 보관하려면 재생성 전에 복사한다.

```sh
node assets/models/world/indoor-layout.mjs /tmp/terminal-indoor.json
blender -b -P assets/models/jwmarriott/build-public-roof.py -- /tmp/terminal-indoor.json
```
