# 신세계 강남점 9층 바카라

[일반 게임에서 보기](http://127.0.0.1:8765/?pos=-44.26014,40.6,27.72821&yaw=-83&pitch=-13#/shinsegae/9F) · [실제 게임 화면](game.jpg) · [디캔터 앞에서 보기](http://127.0.0.1:8765/?pos=-42.05394,40.6,26.18961&yaw=-69.3348&pitch=4.8304#/shinsegae/9F) · [진열장 클로즈업](decanters.jpg) · [카메라 좌표](camera.json)

바카라는 강남점 9층에서 바·테이블웨어, 장식품, 조명을 판매한다. 저장된 신세계 층별 자료는 이 매장을 홈인테리어로 분류한다. 게임에서는 기존 9층 바카라 구획을 사용한다. [바카라 공식 매장 안내](https://stores.baccarat.com/baccarat-shinsegae-department-store-gangnam-seoul-korea) · [신세계 강남점 층별 안내](https://www.shinsegae.com/store/floor.do?storeCd=SC00002)

진열 근거는 2016년 **같은 강남점의 당시 3층 부티크**를 찍은 기사 사진 ①과 ③이다. 흑백 격자 바닥, 짙은 식탁과 녹색 잔, 방사형 거울, 밝은 진열장, 붉은 갓의 스탠드를 참고했다. 현 9층 가구의 치수·간격과 개별 상품 구성은 추정했다. [강남점 현장 사진과 설명](https://www.chosun.com/site/data/html_dir/2016/05/03/2016050301885.html)

아르쿠르 1841 잔은 육각 굽, 마디 있는 다리, 여섯 면을 깎은 볼과 열린 입술을 모델링했다. 디캔터에는 배가 불룩한 몸체, 좁은 목과 별도의 마개가 있다. 길고 좁은 플루트와 낮은 텀블러도 다른 단면으로 만들었다. 컷 표면의 명암은 반투명 재질과 면별 색으로 근사했다. [아르쿠르 잔 제품 사진·치수](https://www.baccarat.com/int_en/harcourt-1841-glass-1201102.html) · [디캔터 제품 사진](https://www.baccarat.com/int_en/barware-and-dining/dining/wine-decanters-and-pitchers/harcourt-1841-decanter-1201322.html) · [아르쿠르 플루트](https://www.baccarat.com/en_us/barware-and-dining/barware/champagne-flutes-and-coupes/harcourt-1841-flutes-2811799.html)

신세계의 강남점 생활관 리뉴얼 화보에는 붉은 마개의 위스키 디캔터 두 종류가 함께 등장한다. 하모니(2817113)는 높이 24.5cm로, 세로 홈과 위가 벌어진 낮은 마개를 만들었다. 룩소르(2817103)는 높이 24.3cm로, 밑부분의 피라미드 컷 네 줄과 윗부분에 엇갈리게 파인 둥근 홈, 마름모꼴 면이 돌아가는 마개를 조형했다. 두 제품의 높이는 바카라 제품 규격에 맞췄고 진열 위치·조명·반사판은 게임 장면에 맞게 배치했다. [신세계 강남점 리뉴얼 화보](https://www.shinsegae.com/magazine/view.do?pSeq=2746) · [바카라 하모니](https://www.baccarat.com/en_gr/barware-and-dining/barware/decanters/harmonie-whisky-decanter-MTHARMDE1.html?variation=2817113) · [바카라 룩소르](https://www.baccarat.com/en_gr/barware-and-dining/barware/decanters/louxor-whisky-decanter-MTLOUXDE1.html?variation=2817103)

몸체의 안쪽 벽, 두꺼운 바닥, 목과 마개는 Blender 원본에서 편집할 수 있다. 제작할 때 창과 선반 조명을 단순화한 환경에서 굴절과 루비색 흡수를 계산해 면의 꼭짓점 색·투명도로 저장했다. 가까이 다가가면 투명한 면 사이로 진열장 배경이 비치고 연마한 모서리에 가는 반사가 남는다.

## 원본과 게임 배치

`gallery.blend`의 `SSG_9F_Baccarat` 컬렉션에는 편집 가능한 메시 176개가 있다. 미터 단위이며 원점은 뒷진열장 중앙 바닥이다. Blender +X는 진열장을 바라보는 고객의 오른쪽, +Y는 진열장 뒤쪽, +Z는 위다. glTF Y-up 변환 후 게임의 +Y축 회전은 −69.092747°다. 게임 층 좌표의 원점은 (−40.935800, 40.6, 27.014933)이며 지형 높이를 이미 적용하는 조립 환경에서 렌더 루트의 y는 43.730698이다.

게임 파일은 789,964바이트, 삼각형 49,285개, 재질별 메시 4개다. 진열대와 식탁에는 충돌 영역이 있다. 간이 진열은 한 번에 그리며, 같은 층 11m 이내에서 시야에 들어오면 상세 모델을 요청한다. 일반 게임에서 7층과 9층 36m 거리의 요청은 각각 0건, 저장한 시점의 요청은 1건이었다.

## 다시 만들기

저장소 루트에서 실행한다. Blender 3.6.23으로 제작·확인했다. 상표 글씨는 macOS의 Times New Roman Italic을 사용하며 원본에는 메시로 저장했다. 작성 시 해당 글꼴이 없으면 Blender 기본 글꼴을 쓴다.

```sh
D=assets/models/ssg-riedel
blender -b --factory-startup --gpu-backend opengl --python-exit-code 1 -P "$D/build.py"
node "$D/pack.mjs"
node tests/smoke.mjs shinsegae
```

편집한 원본을 다시 내보낼 때는 다음 두 명령을 쓴다.

```sh
blender -b --gpu-backend opengl "$D/gallery.blend" --python-exit-code 1 -P "$D/export.py"
node "$D/pack.mjs"
```
