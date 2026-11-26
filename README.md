# 고속터미널 멀티버스

<!-- LIVE-LINK:START -->
<p align="center">
  <a href="https://minwoo19930301.github.io/gangnam-terminal-world/"><img alt="바로 가기: minwoo19930301.github.io/gangnam-terminal-world" src="https://img.shields.io/badge/%E2%96%B6%20%EB%B0%94%EB%A1%9C%20%EA%B0%80%EA%B8%B0-minwoo19930301.github.io%2Fgangnam--terminal--world-ff5a5f?style=for-the-badge"></a>
</p>
<!-- LIVE-LINK:END -->

서울 고속터미널 일대를 1인칭으로 걸어 다닐 수 있게 만든 웹 3D 월드입니다. OpenStreetMap 실측 배치(건물 외곽선·도로·지하철 출구) 위에, 공식 층별 안내와 블로그 후기를 참고해 주요 장소의 내부를 층마다 재현했습니다.


Blender에서는 도시 전경을 열어 건물 외관·도로 선형·표고·거리 배치를 편집할 수 있습니다. **시설 · 모델 라이브러리** 씬에는 매장·호텔·터미널 집기와 공통 부품이 모여 있습니다. [통합 Blender 원본](assets/models/world/gangnam-terminal.blend) · [편집과 게임 반영](assets/models/world/README.md) · [도시 전경](assets/models/world/preview.jpg)

- 고투몰(강남터미널 지하도상가), 고속터미널역(3·7·9호선)
- 신세계백화점 강남점, JW 메리어트 호텔 서울, 센트럴시티(호남선·파미에스테이션)
- 서울고속버스터미널(경부·영동선)과 3층 꽃시장, 다이소
- 반포쇼핑타운 1~8동, 반포한강공원·세빛섬·반포대교, 사이의 도로들

WASD로 걷고 마우스로 시점을 돌립니다. Shift는 달리기, E는 엘리베이터, M은 지도, F는 비행입니다.

하늘은 서울의 현재 날짜와 시각을 따릅니다. 화면 시간 선택기로 아침·낮·노을·밤을 미리 볼 수 있습니다. N은 밤·낮을 전환하고 Shift+N은 서울 실시간으로 돌아갑니다. 해가 지면 강변과 하늘은 어두워지고, 지붕 아래 매장과 가로등 아래 길에는 조명이 켜집니다. [같은 시점에서 본 야간 조명](assets/models/world/night-interiors.jpg)

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

먼 아파트의 가는 창틀은 가까워졌을 때 그리고, 건물 안에서는 중간 바닥에 가려진 다른 층의 집기를 건너뜁니다. 지하 실내 칸은 지상에서 멀면 그리지 않고, 깊은 지하에 있을 때는 먼 바깥을 그리지 않습니다. 같은 크기 텍스처는 텍스처 배열로 묶어 드로우콜을 줄였고, 간판 글자는 첫 화면 뒤에 가까운 것부터 채웁니다. 프레임이 떨어지면 렌더 해상도만 자동으로 낮춥니다(HUD에 % 표시). `?q=low`는 MSAA를 끄고 해상도 상한을 낮춥니다(폰·메모리 4GB 이하는 자동).
