# 신세계 강남점 브롬톤

[8층 일반 플레이](http://127.0.0.1:8765/?pos=-31.23938,35.8,59.50763&yaw=34.78107&pitch=-18#/shinsegae/8F) · [게임에서 촬영한 진열](game.jpg) · [카메라와 원본 컬렉션](camera.json)

신세계 강남점 안내의 매장명은 ‘브롬톤’, 분류는 8층 레져스포츠다. 2023년 7월 개점 당시 신세계가 제공한 사진에는 접힌 자전거 여섯 대가 세 칸씩 두 줄로 들어간 벽장, 그 앞의 연두색 자전거, 오른쪽 의류 행거가 보인다. 그 장면을 기존 게임 매장 안에 옮겼다. 이후의 상품 교체 여부와 사진 속 자전거 각각의 모델명·연식은 확인되지 않았다. [공식 층별 안내](https://www.shinsegae.com/store/floor.do?storeCd=SC00002) · [신세계 제공 강남점 사진](https://image.inews24.com/v1/9fc6fb62a9a9b6.jpg) · [사진 설명이 실린 기사](https://www.inews24.com/view/1610879) · [같은 지점의 접힌 자전거와 의류 근접 사진](https://tnnews.co.kr/archives/146817)

앞쪽 한 대는 안장 기둥과 핸들 스템이 올라간 상태다. 매장 안쪽 여섯 대는 두 바퀴가 나란히 겹치고 안장과 핸들이 내려가 있다. 제조사 자료에서 16인치 계열의 바퀴 비례, 힌지 클램프와 접은 실루엣을 참고했다. 체인링과 크랭크, 교차 스포크, 흙받이 지지봉, 브레이크와 이동 롤러는 입체 부품이다. 체인은 가는 연결선으로 표현했다. 칸 치수와 받침, 옷의 재단 및 색 배치는 사진을 바탕으로 추정했다. [브롬톤 폴딩 가이드](https://www.brompton.com/stories/guides/folding-bike-buyers-guide) · [접은 상태](https://dam.brompton.com/filestore/6/7/6/4_385c3ae79422f2f/4676_10086fadf3d3f5d.jpg) · [힌지 클램프 근접 사진](https://dam.brompton.com/filestore/6/8/7/4_f86c3861437b0ab/4786_3431f5ef62cc66c.jpg)

## 원본 조립과 재생성

Blender 3.6.23에서 저장하고 다시 연 원본은 `gallery.blend`의 `SSG_8F_Brompton` 컬렉션이다. 자전거 7대, 셔츠 8벌, 벽장과 행거를 포함해 개별 편집 메시가 626개다. Blender 좌표는 미터 단위로 +X가 벽장 오른쪽, −Y가 손님 쪽, +Z가 위다. glTF Y-up 변환 뒤 월드 +Y축으로 20.781070° 회전한다. 논리 원점은 (−32.991414, 35.8, 57.145581), 지형 높이를 적용한 원점은 (−32.991414, 34.892, 57.145581)이다. 상호는 Blender 기본 폰트로 만들었다.

저장소 루트에서 실행한다.

```sh
D=assets/models/ssg-cycle-gear
"${GTW_BLENDER_BIN:-blender}" -b --factory-startup --gpu-backend opengl --python-exit-code 1 -P "$D/build.py"
node "$D/pack.mjs"
node tests/smoke.mjs shinsegae
node tests/smoke.mjs gotomall shinsegae
```

접힌 자전거의 타이어, 림, 흙받이 둘레 분할 수를 줄이고 정점을 용접한 뒤 meshopt로 압축했다. GLB는 499,612바이트, 삼각형 59,828개, 상세 재질 2개와 드로콜 2회다. 같은 층 22m 이내에서 대체 진열을 한 번에 그리며, 11m 안에서 진열이 시야에 들어오면 상세 모델을 요청한다. 카메라에서 보이는 자전거 메시 이름은 `BromptonGangnamCycles`다.
