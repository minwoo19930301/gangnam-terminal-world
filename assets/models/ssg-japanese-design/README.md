# 신세계 강남점 9층 타임앤스타일

[게임에서 식탁 앞에 서기](http://127.0.0.1:8765/?pos=-73.53,40.6,7.24&yaw=40&pitch=-10#/shinsegae/9F) · [일반 게임 화면](game.jpg) · [카메라 좌표](camera.json)

강남점 층별 안내의 9층 홈인테리어 입점명은 ‘타임앤스타일’, 도면과 게임 HUD의 표기는 ‘타임&스타일’이다. 제조사 서울 매장 페이지 중 **Shinsegae Department Store** 항목에 실린 두 사진을 사용했다. 같은 페이지 위쪽의 학동로 직영점은 별도 매장이다. [신세계 강남점 층별 안내](https://www.shinsegae.com/store/floor.do?storeCd=SC00002) · [제조사의 지점별 안내](https://www.timeandstyle.com/time-style-seoul/)

식탁 정면 사진에서 타원형 상판 아래의 장부, 나뭇결이 휜 등판과 팔걸이, 천 좌판 아래의 가로대, 차반 위 고리 손잡이 다관을 읽을 수 있다. 뒤편에는 목재 살을 짠 병풍과 둥근 세발 스툴 두 개가 보인다. 전경 사진의 원목 장식장에서 화병·책·목기의 크기 차와 빈 칸의 비율을 참고했다. 기존 게임 도면에 맞춰 장식장을 식탁 뒤로 옮겼다. 가구 치수와 병풍 문양, 개별 기물의 유약색·형태는 사진에 맞춘 추정이다. [강남점 식탁 정면 사진](https://www.timeandstyle.com/wp-content/uploads/2025/12/Shinsegae_DSC06414.jpg) · [강남점 전시 전경](https://www.timeandstyle.com/wp-content/uploads/2025/12/Shinsegae_DSC06438.jpg)

식탁 위 펜던트는 **Spacecraft**의 미노 화지와 아키타 삼나무 휨살을 따로 모델링했다. 중간이 넓고 위아래로 좁아지는 윤곽은 제품 사진과 대조했다. 제조사가 공개한 두 규격 중 지름 880 × 높이 450 mm를 적용했으며 강남점 전시품의 규격은 미확인이다. 목재·린넨·바닥 텍스처는 직접 생성해 원본에 내장했다. [Spacecraft 제품 사진](https://www.timeandstyle.com/spacecraft/) · [규격·소재 도면](https://timeandstyle.info/wp-content/uploads/2025/04/Spacecraft_ENG_04_2025.pdf) · [제조사 공예 배경](https://www.timeandstyle.com/abouttimeandstyle/)

## 네이티브 조립과 실행

편집 원본 `dining.blend`의 `SSG_9F_TimeStyle` 컬렉션에 개별 메시 194개가 있다. 단위는 미터이며 원점은 식탁 중앙의 바닥이다. Blender +X는 정면에서 오른쪽, +Y는 장식장 쪽, +Z는 위다. glTF Y-up 변환 뒤 월드 Y축으로 +20.786241° 회전한다. 게임 원점 (x, y, z)는 (−75.381752, 40.600000, 5.019637), 지형 높이를 포함한 장면 원점은 (−75.381752, 43.760000, 5.019637)이다.

`dining.glb`는 545,552바이트, 삼각형 44,480개, 재질·드로 콜 각 5개다. 지정 카메라는 실제 펜던트 메시 `TimeStyleSpacecraft`를 향한다. 근접 화면에서는 GLB를 한 번 요청했고, 같은 좌표의 8층 및 9층 라마르조코 앞에서는 요청이 없었다.

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

## Spacecraft 아래에서 보는 화지와 삼나무

[9층 실제 보행 시점](http://127.0.0.1:8765/?pos=-75.177828,40.6,5.669572&yaw=17.41978&pitch=29.85616#/shinsegae/9F) · [게임 화면](washi-game.jpg) · [Blender 제품 접사](spacecraft.jpg)

제조사의 아래쪽 접사에는 빛을 통과시키는 미노 화지, 갓 표면을 따라 휘어진 납작한 아키타 삼나무 살, 아래쪽 입구의 목재 마감이 보인다. 둘레를 따라 16개의 휨살을 개별 부품으로 만들고, 열려 있는 위·아래 테두리에는 단면 두께를 주었다. 강남점에 놓인 펜던트의 안쪽 부속과 살 개수는 실측하지 않았다. [제조사 아래쪽 접사](https://www.timeandstyle.com/wp-content/uploads/2025/04/Spacecraft-mobile-14.jpg) · [옆면 접사](https://www.timeandstyle.com/wp-content/uploads/2025/04/Spacecraft-mobile-1.jpg) · [화지 소재 견본](https://www.timeandstyle.com/wp-content/uploads/2025/04/Japanese-paper-plain.jpg)

화지는 짧은 섬유와 여러 크기의 펄프 얼룩을 생성해 그렸다. 곡면의 호 길이에 맞춰 펼쳤으며, 같은 이미지를 종이 색과 투과광 표현에 공유한다. 갓과 목재 살을 보존하면서 다른 가구의 곡선을 단순화해 최초 파일보다 20,176바이트, 4,302개 삼각형을 줄였다. 종이 아래, 테이블, 통로, 의자 가까이에서 같은 프레임의 경량화 전후 화면을 비교한 RGB PSNR은 46.44–53.87dB였다. 드로 콜은 계속 5회다.

별도 탭에서 8층, 같은 층 14m 거리, 같은 층에서 등진 시점으로 각각 시작했을 때 이 파일의 요청은 0건이었다. 가까이 다가가고 물러난 뒤 다시 다가오는 보행 중에는 1회였다. Blender 원본을 다시 열어 내보낸 게임 파일은 빌드 직후 파일과 바이트 단위로 일치했다.
