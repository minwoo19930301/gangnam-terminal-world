# 신세계 강남점 9층 타임앤스타일

[게임에서 식탁 앞에 서기](http://127.0.0.1:8765/?pos=-73.53,40.6,7.24&yaw=40&pitch=-10#/shinsegae/9F) · [일반 게임 화면](game.jpg) · [카메라 좌표](camera.json)

강남점 층별 안내의 9층 홈인테리어 입점명은 ‘타임앤스타일’, 도면과 게임 HUD의 표기는 ‘타임&스타일’이다. 제조사 서울 매장 페이지 중 **Shinsegae Department Store** 항목에 실린 두 사진을 사용했다. 같은 페이지 위쪽의 학동로 직영점은 별도 매장이다. [신세계 강남점 층별 안내](https://www.shinsegae.com/store/floor.do?storeCd=SC00002) · [제조사의 지점별 안내](https://www.timeandstyle.com/time-style-seoul/)

식탁 정면 사진에서 타원형 상판 아래의 장부, 나뭇결이 휜 등판과 팔걸이, 천 좌판 아래의 가로대, 차반 위 고리 손잡이 다관을 읽을 수 있다. 뒤편에는 목재 살을 짠 병풍과 둥근 세발 스툴 두 개가 보인다. 전경 사진의 원목 장식장에서 화병·책·목기의 크기 차와 빈 칸의 비율을 참고했다. 기존 게임 도면에 맞춰 장식장을 식탁 뒤로 옮겼다. 가구 치수와 병풍 문양, 개별 기물의 유약색·형태는 사진에 맞춘 추정이다. [강남점 식탁 정면 사진](https://www.timeandstyle.com/wp-content/uploads/2025/12/Shinsegae_DSC06414.jpg) · [강남점 전시 전경](https://www.timeandstyle.com/wp-content/uploads/2025/12/Shinsegae_DSC06438.jpg)

식탁 위 펜던트는 **Spacecraft**의 미노 화지와 아키타 삼나무 휨살을 따로 모델링했다. 중간이 넓고 위아래로 좁아지는 윤곽은 제품 사진과 대조했다. 제조사가 공개한 두 규격 중 지름 880 × 높이 450 mm를 적용했으며 강남점 전시품의 규격은 미확인이다. 목재·린넨·바닥 텍스처는 직접 생성해 원본에 내장했다. [Spacecraft 제품 사진](https://www.timeandstyle.com/spacecraft/) · [규격·소재 도면](https://timeandstyle.info/wp-content/uploads/2025/04/Spacecraft_ENG_04_2025.pdf) · [제조사 공예 배경](https://www.timeandstyle.com/abouttimeandstyle/)

## 네이티브 조립과 실행

편집 원본 `dining.blend`의 `SSG_9F_TimeStyle` 컬렉션에 개별 메시 194개가 있다. 단위는 미터이며 원점은 식탁 중앙의 바닥이다. Blender +X는 정면에서 오른쪽, +Y는 장식장 쪽, +Z는 위다. glTF Y-up 변환 뒤 월드 Y축으로 +20.786241° 회전한다. 게임 원점 (x, y, z)는 (−75.381752, 40.600000, 5.019637), 지형 높이를 포함한 장면 원점은 (−75.381752, 43.760000, 5.019637)이다.

`dining.glb`는 565,728바이트, 삼각형 48,782개, 재질·드로 콜 각 5개다. 지정 카메라는 실제 펜던트 메시 `TimeStyleSpacecraft`를 향한다. 근접 화면에서는 GLB를 한 번 요청했고, 같은 좌표의 8층 및 9층 라마르조코 앞에서는 요청이 없었다.

저장소 루트에서 실행한다. Blender 3.6.23으로 작성·내보내기를 확인했다. 별도 시스템 글꼴은 필요 없다.

```sh
D=assets/models/ssg-japanese-design
blender -b --factory-startup --gpu-backend opengl --python-exit-code 1 -P "$D/build.py"
node "$D/pack.mjs"
node tests/smoke.mjs shinsegae
node tests/smoke.mjs shinsegae gotomall
```

원본을 편집한 뒤 게임 파일만 다시 내보낼 때는 다음 두 명령을 사용한다.

```sh
D=assets/models/ssg-japanese-design
blender -b --gpu-backend opengl "$D/dining.blend" --python-exit-code 1 -P "$D/export.py"
node "$D/pack.mjs"
```
