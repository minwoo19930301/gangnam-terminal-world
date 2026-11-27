# 고속터미널 멀티버스

<!-- LIVE-LINK:START -->
<p align="center">
  <a href="https://minwoo19930301.github.io/gangnam-terminal-world/"><img alt="바로 가기: minwoo19930301.github.io/gangnam-terminal-world" src="https://img.shields.io/badge/%E2%96%B6%20%EB%B0%94%EB%A1%9C%20%EA%B0%80%EA%B8%B0-minwoo19930301.github.io%2Fgangnam--terminal--world-ff5a5f?style=for-the-badge"></a>
</p>
<!-- LIVE-LINK:END -->

서울 고속터미널 일대를 1인칭으로 걸어 다닐 수 있게 만든 웹 3D 월드입니다. OpenStreetMap 실측 배치(건물 외곽선·도로·지하철 출구) 위에, 공식 층별 안내와 블로그 후기를 참고해 주요 장소의 내부를 층마다 재현했습니다.


Blender에서는 도시 전경을 열어 건물 외관·도로 선형·표고·거리 배치를 편집할 수 있습니다. **시설 · 모델 라이브러리** 씬에는 매장·호텔·터미널 집기와 공통 부품이 모여 있습니다. [통합 Blender 원본](assets/models/world/gangnam-terminal.blend) · [편집과 게임 반영](assets/models/world/README.md) · [도시 전경](assets/models/world/preview.jpg)

신반포4차·반포르엘·반포센트럴자이(반센자이)는 같은 Blender 파일에 있습니다. 게임에서 **M → 단지명 → 여기로 이동**을 누르면 해당 단지의 보도 카메라 위치에 도착합니다. [아파트 Blender 원본](assets/models/banpo-apartments/banpo-apartments.blend) · [세 단지의 아침·낮·노을·밤](assets/models/banpo-apartments/native-street-views.jpg) · [문주 지도 검색과 모바일 보도 시점](assets/models/banpo-xi-portal/map-search.jpg)

11월 27일에는 지도에서 공개 장소 2,281개를 열어 낮·밤 네 방향을 확인하고, 호남선 승강기에서 신세계 마켓까지 직접 걸었습니다. [보행·모델 점검 결과](docs/map-audit/overnight-2026-11-27.md) · [장소별 확인표](docs/map-audit/public-directory-2026-11-27.csv)

호남선 12·13번 승차홈에서 파미에스테이션 1번 게이트를 바라보면 오른쪽에 스타벅스가 있습니다. 아웃백 접수대는 파미에 중층에 있습니다. 지도(M)에서 **스벅 호남선** 또는 **아웃백**으로 찾을 수 있습니다. [스타벅스 입구와 반계단](assets/models/honam-gate-coffee/README.md) · [아웃백 중층 입구](assets/models/outback-central/README.md) · [신세계 본관 승강장](docs/map-audit/shinsegae-main-8f-lift.md) · [파미에 주차장 상행·하행](docs/map-audit/famille-parking/README.md)

고투몰에서는 A-008 애니타임의 의류 행거 사이와 A-144 명플라워의 꽃다발 진열대 사이로 들어갈 수 있습니다. 중앙광장 G11 유리문을 지나 계단을 오르면 다이소 4번 출입구로 이어집니다. 지도에서 **다이소 홈웨어**와 **다이소 셀프계산대**를 찾을 수 있습니다. [애니타임](assets/models/gotomall-anytime/README.md) · [명플라워](assets/models/gotomall-myeong/README.md) · [G11 유리문](assets/models/gotomall-g11/README.md) · [홈웨어](assets/models/daiso-homewear/README.md) · [셀프계산대](assets/models/daiso-checkout/README.md)

- 고투몰(강남터미널 지하도상가), 고속터미널역(3·7·9호선)
- 신세계백화점 강남점, JW 메리어트 호텔 서울, 센트럴시티(호남선·파미에스테이션)
- 서울고속버스터미널(경부·영동선)과 3층 꽃시장, 다이소
- 반포쇼핑타운 1~8동, 반포한강공원·세빛섬·반포대교, 사이의 도로들

WASD로 걷고 마우스로 시점을 돌립니다. Shift는 달리기, E는 엘리베이터, M은 지도, F는 비행입니다.

하늘은 서울의 현재 날짜와 시각을 따릅니다. 시간 선택기로 아침·낮·노을·밤을 미리 볼 수 있습니다. N은 밤·낮을 전환하고 Shift+N은 서울 실시간으로 돌아갑니다. 아침에는 푸른 하늘에 옅은 금빛이 돌고, 저녁에는 서쪽 지평선이 주황빛을 띱니다. 밤에는 실내 전등과 아파트 창문에 불이 들어오고 가로등 주변 나무에는 잎과 줄기에 빛이 닿습니다. [신반포로와 터미널에서 본 조명 변화](docs/map-audit/terminal-lighting.jpg)

지도 데이터 © OpenStreetMap contributors (ODbL). 단지 안 녹지와 수목은 Copernicus Sentinel-2와 Meta·WRI의 수관 높이 자료를 가공했습니다. [녹지·수목 자료 출처와 이용 조건](data/research/parcel-cover.md)

개발 메모는 `AGENTS.md`, `docs/PLACE_API.md` 에 있습니다. 로컬 실행: `node tests/serve.mjs 8765` 후 http://127.0.0.1:8765/

## 검사

- `node tests/smoke.mjs --city`: 모든 장소 모듈과 도시를 WebGL 없이 지어 계약(스폰·존·엘리베이터·연결점)을 확인합니다.
- `node tests/walk.mjs`: 연결 통로, 엘리베이터 각 층 출입, 스폰, 지하상가 장거리 경로를 실제로 걸어서(경로 탐색) 확인합니다.
- `node tests/shot.mjs --gpu --out shots/x --views "이름:x,y,z,yaw,pitch"`: 1인칭 스크린샷을 찍습니다.
- 디버그: `tests/floormap.mjs`(층 평면 통행 지도), `tests/walls_near.mjs`(어떤 코드가 벽을 세웠는지), `tests/atlas_stats.mjs`(간판 텍스처 사용량).
- `node tests/entry-perf.mjs`는 거리, 호텔 8층, 파미에 1층 주소를 새 브라우저 세션에서 세 번씩 열어 첫 진입 시간을 잽니다.
- 성능: `node tests/perf.mjs [--cpu 4]`(실제 GPU, CPU 감속으로 저사양 흉내), 화면 회귀: `tests/regress_views.txt` 시점을 `shot.mjs`로 찍어 이전 결과와 비교.

## 저사양 대응

거리에서는 먼 건물의 윤곽을 먼저 보여 주고, 시야에 들어온 가까운 아파트만 상세 모델을 내려받습니다. 실내에서는 현재 층에서 보이는 매장과 집기부터 준비합니다. 먼 아파트의 가는 창틀은 가까워졌을 때 그리고, 건물 안에서는 중간 바닥에 가려진 다른 층의 집기를 건너뜁니다. 지하 실내 칸은 지상에서 멀면 그리지 않고, 깊은 지하에 있을 때는 먼 바깥을 그리지 않습니다. 같은 크기 텍스처는 텍스처 배열로 묶어 드로우콜을 줄였고, 간판 글자는 첫 화면 뒤에 가까운 것부터 채웁니다. 프레임이 떨어지면 렌더 해상도만 자동으로 낮춥니다(HUD에 % 표시). `?q=low`는 MSAA를 끄고 해상도 상한을 낮춥니다(폰·메모리 4GB 이하는 자동).
