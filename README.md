# 고속터미널 멀티버스

서울 고속터미널 일대를 1인칭으로 걸어 다닐 수 있게 만든 웹 3D 월드입니다. OpenStreetMap 실측 배치(건물 외곽선·도로·지하철 출구) 위에, 공식 층별 안내와 블로그 후기를 참고해 주요 장소의 내부를 층마다 재현했습니다.

- 고투몰(강남터미널 지하도상가), 고속터미널역(3·7·9호선)
- 신세계백화점 강남점, JW 메리어트 호텔 서울, 센트럴시티(호남선·파미에스테이션)
- 서울고속버스터미널(경부·영동선)과 3층 꽃시장, 다이소
- 반포쇼핑타운 1~8동, 반포한강공원·세빛섬·반포대교, 사이의 도로들

조작: WASD 이동, 마우스 시점, Shift 달리기, E 엘리베이터, M 지도(클릭해서 이동), F 비행, N 밤.

지도 데이터 © OpenStreetMap contributors (ODbL).

개발 메모는 `AGENTS.md`, `docs/PLACE_API.md` 에 있습니다. 로컬 실행: `node tests/serve.mjs 8765` 후 http://127.0.0.1:8765/

## 검사

- `node tests/smoke.mjs --city`: 모든 장소 모듈과 도시를 WebGL 없이 지어 계약(스폰·존·엘리베이터·연결점)을 확인합니다.
- `node tests/walk.mjs`: 연결 통로, 엘리베이터 각 층 출입, 스폰, 지하상가 장거리 경로를 실제로 걸어서(경로 탐색) 확인합니다.
- `node tests/shot.mjs --gpu --out shots/x --views "이름:x,y,z,yaw,pitch"`: 1인칭 스크린샷을 찍습니다.
- 디버그: `tests/floormap.mjs`(층 평면 통행 지도), `tests/walls_near.mjs`(어떤 코드가 벽을 세웠는지), `tests/atlas_stats.mjs`(간판 텍스처 사용량).
