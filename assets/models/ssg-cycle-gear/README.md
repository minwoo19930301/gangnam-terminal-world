# 신세계 강남점 브롬톤

[8층 일반 플레이](http://127.0.0.1:8765/?pos=-31.23938,35.8,59.50763&yaw=34.78107&pitch=-18#/shinsegae/8F) · [게임에서 촬영한 진열](game.jpg) · [가방과 자전거의 게임 근접 화면](counter-and-drive.jpg) · [Blender 원본 근접 렌더](native-detail.jpg) · [카메라와 원본 컬렉션](camera.json)

신세계 강남점 안내의 매장명은 ‘브롬톤’, 분류는 8층 레져스포츠다. 2023년 7월 개점 당시 신세계가 제공한 사진에는 접힌 자전거 여섯 대가 세 칸씩 두 줄로 들어간 벽장, 그 앞의 연두색 자전거, 오른쪽 의류 행거가 보인다. 그 장면을 기존 게임 매장 안에 옮겼다. 이후의 상품 교체 여부와 사진 속 자전거 각각의 모델명·연식은 확인되지 않았다. [공식 층별 안내](https://www.shinsegae.com/store/floor.do?storeCd=SC00002) · [신세계 제공 강남점 사진](https://image.inews24.com/v1/9fc6fb62a9a9b6.jpg) · [사진 설명이 실린 기사](https://www.inews24.com/view/1610879) · [같은 지점의 접힌 자전거와 의류 근접 사진](https://tnnews.co.kr/archives/146817)

앞쪽 한 대는 안장 기둥과 핸들 스템이 올라간 상태다. 매장 안쪽 여섯 대는 두 바퀴가 나란히 겹치고 안장과 핸들이 내려가 있다. 제조사 자료에서 16인치 계열의 바퀴 비례, 힌지 클램프와 접은 실루엣을 참고했다. 사진 속 앞쪽 자전거에는 제조사의 C Line Archive 제품 근접 사진을 참고해 굽은 은색 스파이더 암 다섯 개, 검은 가드와 단조 크랭크, 테두리가 열린 페달, 호박색 반사판을 만들었다. 흙받이 지지봉과 교차 스포크, 앞뒤 타이어의 사선 홈, 프레임의 검은 테두리 상호도 분리한 부품이다. 전시품의 정확한 연식·등급을 특정하기 어려워 구동계는 제조사의 50T 체인링·13T 뒤 스프로킷·98링크 조합을 참고했다. 강남점의 녹색 도장과 좌석·의류 배치는 현장 사진을 따랐다. [지점 사진](https://image.inews24.com/v1/9fc6fb62a9a9b6.jpg) · [제조사 전체·구동부 사진](https://us.brompton.com/p/796/c-line-archive-edition) · [실버 크랭크 사진](https://us.brompton.com/p/731/crankset-50t-in-silver-spider-type) · [체인과 톱니 조합표](https://trade.brompton.com/Uploads/QPart/QPart-Datasheets/ds-chain.pdf)

체인은 앞뒤 기어, 역방향으로 감기는 고정 가이드와 앞쪽 스프링 풀리를 차례로 지난다. 교대로 겹친 안팎 금속 플레이트, 롤러, 핀 머리를 따로 만들었다. 진열장 안의 접힌 자전거 여섯 대는 기존 간소화 모델을 쓴다. [제조사 텐셔너 도면](https://trade.brompton.com/Uploads/QPart/QPart-Datasheets/cta_ds.pdf)

강남점 의류 진열 근접 사진에서 베이지 플랩 가방과 짙은 녹색 롤톱 가방, 흰 화병과 가느다란 자전거 장식을 확인했다. 플랩의 검은 파이핑과 두 개의 작은 금속 버클, 손잡이, 바닥 주름, 롤톱의 당김 끈을 입체로 만들었다. 면포와 합성섬유의 짜임, 메탈의 거칠기, 반사판 프리즘과 상판 목재의 결과 요철은 직접 그려 Blender 원본에 넣었다. 두 가방의 정확한 상품명과 치수는 확인되지 않았다. 게임에서는 기존 의류 집기의 왼쪽 안에 진열대를 배치했다. [강남점 가방·의류·진열대 사진](https://tnnews.co.kr/archives/146817)

## 원본 조립과 재생성

Blender 3.6.23에서 저장하고 다시 연 원본은 `gallery.blend`의 `SSG_8F_Brompton` 컬렉션이다. 자전거 7대, 셔츠 8벌, 가방 2개와 진열장·행거를 포함해 개별 편집 메시가 781개다. 원본에 UV 이미지 3개를 내장했다. Blender 좌표는 미터 단위로 +X가 벽장 오른쪽, −Y가 손님 쪽, +Z가 위다. glTF Y-up 변환 뒤 월드 +Y축으로 20.781070° 회전한다. 논리 원점은 (−32.991414, 35.8, 57.145581), 지형 높이를 적용한 원점은 (−32.991414, 34.892, 57.145581)이다. 상호는 Blender 기본 폰트로 만들었다.

저장소 루트에서 실행한다.

```sh
D=assets/models/ssg-cycle-gear
"${GTW_BLENDER_BIN:-blender}" -b --factory-startup --gpu-backend opengl --python-exit-code 1 -P "$D/build.py"
node "$D/pack.mjs"
node tests/smoke.mjs shinsegae
node tests/smoke.mjs gotomall shinsegae
```

원본을 수정하고 저장한 뒤 `"${GTW_BLENDER_BIN:-blender}" -b --gpu-backend opengl "$D/gallery.blend" --python-exit-code 1 -P "$D/export.py"`와 `node "$D/pack.mjs"`로 게임 파일을 다시 만들 수 있다. 출력 시 체인 플레이트의 안쪽 면과 금속 안에 가려지는 핀을 줄이고, 작게 보이는 실루엣은 오차를 제한해 단순화했다.

배포 GLB는 892,096바이트, 삼각형 79,044개, 메시·재질과 드로콜은 각각 2개다. 일반 게임의 위 카메라에서 전후 장면 전체의 그리기 호출은 382회로 같았다. 다른 층, 같은 층의 먼 시점, 천장을 보는 시점은 요청 0회였다. 매대 쪽으로 고개를 돌린 뒤 보행해 0.96m 가까워졌다가 돌아왔을 때도 누적 요청 1회였다. 카메라에서 보이는 자전거 메시 이름은 `BromptonGangnamCycles`다.
