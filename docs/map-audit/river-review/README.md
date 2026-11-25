# 반포 한강과 원베일리 방문 동선

## 게임에서 보기

화면 시간 선택기를 ‘서울 실시간’에 두면 반포의 오늘 하늘이 보인다. ‘아침 보기’나 ‘노을 보기’를 선택하면 그날의 해 뜨는 방향과 해 지는 방향을 바로 비교할 수 있다. [네 시간대 게임 화면](daylight.jpg) · [일출·일몰 검증](daylight.md)

잠수교에서 세빛섬 쪽을 보면 한강 물결이 동작대교 방향으로 이어진다. 잠원 쪽 수변까지 같은 물 재질을 쓰며, 노을과 가로등은 서울 시각을 따른다. [낮·노을·밤 수면 비교](water.jpg) · [유동 방향과 렌더 검사](water.md)

## 지도와 모델

반포한강공원에서는 물선과 도로 쪽 이용 경계를 기준으로 세 단면을 비교했다. 네이버 지도 거리재기에서 서쪽부터 약 216m, 226m, 176m였고 한국 중부 좌표계(EPSG:5179)로 환산한 모델은 약 215.3m, 224.7m, 175.6m다. 경계 판독에는 약 4m 오차가 있다. [좌표·표고 교차검사](hangang-gis.json) · [공원 전후 비교](../../../assets/models/hangang/preview.jpg) · [공원 조사 자료](../../../data/research/hangang.json)

고투몰 서편 G2의 계단 왼쪽에서 원베일리스퀘어 상가로 갈 수 있다. 고투몰 에메트와 앤하우스에는 스카프와 침구 진열을, 원베일리스퀘어의 빽다방·본크라상·베이크드뮬란에는 매장별 카운터와 상품을 넣었다. 상가 쪽 회전문과 공공보행통로를 연결하고, 기존 서편 연결부와 한강공원 쪽 입구도 양방향으로 걸어 확인했다. 등록한 통로 폭에 맞춰 게임 구역이 바뀌므로 옆 점포를 지날 때 엉뚱한 곳으로 이동하는 경우를 줄였다. [상가 게임 화면](../../../assets/models/onebailey/preview.jpg) · [원베일리 상가 조사 자료](../../../data/research/onebailey.json) · [고투몰 조사 자료](../../../data/research/gotomall.json)

## 모델 제작 도구

Blender 차량의 타이어 접점을 JoltPhysics.js로 확인하고 주행 경사 계산에 반영했다. 원베일리·고투몰 다섯 매장에 쓰는 GLB 두 파일은 glTF Transform과 meshoptimizer로 983,788바이트에서 326,448바이트로 줄였다. 같은 카메라 10곳에서 전후 화면을 비교했다. [차량 접점 검사](model-tools.md) · [GLB 최적화](model-optimization.md) · [채빛섬 UV 검사](../../../assets/models/hangang/chavit-uv-audit.json)

## 재검사

- `node tests/riverwalk-doors.mjs --gpu`로 세 연결부를 여섯 방향으로 오가며 구역 로딩과 시각 유지를 확인한다.
- `node tests/hangang-waterfront.mjs`로 공원 폭, 도교 보행과 분수 시간표를 확인한다.
- `node tests/river-water.mjs --gpu`로 수면의 시간차, 우천 장면, 야간 점등을 확인한다.
- `node tests/daylight.mjs --gpu`로 계절별 일조, 서울 자정 경과와 수동·실시간 전환을 확인한다.
