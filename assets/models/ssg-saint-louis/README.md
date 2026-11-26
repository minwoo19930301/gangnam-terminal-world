# 신세계 강남점 로쉐보보아

9층 홈인테리어 구획의 버블(Bubble) 소파와 안락의자 진열. 강남점 사진 왼쪽의 회색 소파, 오른쪽의 시트론색 안락의자, 두 좌석 사이의 오목한 금속 테이블을 재현했다. 주름 반사갓, 쿠션 세 개와 곡선 무늬 러그도 같은 사진에서 확인할 수 있다. [브랜드의 강남점 쇼룸](https://www.roche-bobois.com/en-KR/showrooms/seoul-gangnam-shinsegae/s1569.html) · [전경 사진 원본](https://media.roche-bobois.com/is/image/rochebobois/KR_Seoul_Shinsegae_Information_1860_01_vdef?wid=1200) · [신세계 층별 안내](https://www.shinsegae.com/store/floor.do?storeCd=SC00002)

좌판부터 등받이까지 이어지는 봉제 골과 직물의 작은 구멍은 제조사의 정면·사선·확대 사진을 참고했다. 좌석 크기는 버블 제품군의 기술 도면과 전경 사진에서 추정했다. 강남점 진열품의 정확한 규격과 테이블·조명의 모델명은 미확인이다. 쿠션과 러그의 무늬는 사진의 색과 곡선을 바탕으로 새로 그렸다. 뒤쪽 대형 소파는 재현 범위에서 제외했다. [버블 제품 및 확대 사진](https://www.roche-bobois.com/en/product/bubble-3-seat-sofa/1407.html) · [소파·안락의자 기술 도면](https://technicals.roche-bobois.com/M30722494/TSv_BUBBLE_2023.pdf)

## 게임과 원본

[게임 카메라](../../../?pos=-61.669557151676045,40.6,24.114169715524515&yaw=-69&pitch=-22#/shinsegae/9F) · [게임 화면](game.jpg) · [카메라 값](camera.json)

편집 원본은 `bubble.blend`의 `SSG_9F_RocheBobois` 컬렉션이다. 메시 27개와 내장 이미지 3장이 있다. Blender 단위는 m이며 +X는 진열 오른쪽, +Y는 후면 패널 방향, +Z는 위다. glTF 변환 후 게임 루트 좌표는 (−58.40849, 43.76000, 22.86562), Y축 회전은 −69.04078°다. 매장 층고 기준 원점은 40.6 m이며 게임 루트 높이에 지형 보정 3.16 m가 포함되어 있다.

근접 GLB는 421,840바이트, 37,852삼각형, 5드로다. 원거리 대체 집기는 1드로다. 공유 로더가 층, 거리, 시야를 판정하고 내려받기에 실패하면 재시도한다.

## 재생성

저장소 루트에서 Blender 3.6.23과 Node.js로 실행한다. 글자는 Blender 내장 글꼴로 만들었다.

```sh
D=assets/models/ssg-saint-louis
node "$D/textiles.mjs"
blender -b --factory-startup --gpu-backend opengl --python-exit-code 1 -P "$D/build.py"
node "$D/pack.mjs"
node tests/smoke.mjs shinsegae
node tests/smoke.mjs shinsegae gotomall
```

편집한 원본을 내보낼 때는 아래 두 명령을 쓴다.

```sh
blender -b --gpu-backend opengl "$D/bubble.blend" --python-exit-code 1 -P "$D/export.py"
node "$D/pack.mjs"
```
