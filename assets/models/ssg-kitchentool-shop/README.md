# 신세계 강남점 키친툴 · 9층 마루히로 하사미 진열대

[일반 게임에서 보기](http://127.0.0.1:8765/?pos=-25.878886292055576,40.6,74.0308712869597&yaw=-142.2205429129025&pitch=-24#/shinsegae/9F) · [게임 화면](game.jpg) · [카메라 좌표](camera.json)

키친툴이 공개한 강남점 입점 사진의 첫 두 컷을 기준으로 만들었다. 둥근 모서리의 크림색 진열대 앞에는 색상별 접시와 엎어 둔 볼, 뒤에는 꼭지 뚜껑이 있는 캐니스터 세 개와 세워 둔 접시를 배치했다. 사진 속 ‘MARUHIRO HASAMI’ 명패와 후면의 키친툴 한글 간판도 옮겼다. 신세계의 9층 리뉴얼 발표와 저장된 층별 안내에서 점포 및 상품군을 확인했다. [키친툴 입점 기록](https://kitchen-tool.co.kr/product/detail.html?product_no=6029) · [매장 전면·측면 원본 사진](https://kitchen-tool.co.kr/web/upload/NNEditor/20251217/copy-1765952832-EBA7A4EAB1B0ECA784.png) · [신세계 발표](https://www.shinsegaegroupnewsroom.com/shinsegae-gangnam-kitchen-tableware-renovation/) · [층별 안내](https://www.shinsegae.com/store/floor.do?storeCd=SC00002)

머그는 지름 8.5cm, 높이 6.5cm를 기준으로 굽 위 단차와 각진 띠 손잡이를 만들었다. 접시는 낮게 꺾인 가장자리와 안쪽 면을, 캐니스터는 잘록한 받침과 몸체에서 분리되는 뚜껑을 모델링했다. 볼의 밝은 굽 테두리, 유약의 색과 광택은 매장 조명 아래 보이는 모습을 근사했다. 진열장 치수와 후면 선반의 견본 수량은 추정값이다. [머그](https://www.hasamiyaki.jp/en/item/blockmug/) · [접시](https://www.hasamiyaki.jp/en/item/plate/) · [볼](https://www.hasamiyaki.jp/en/item/blockbowl/) · [캐니스터](https://www.hasamiyaki.jp/item/snack-canister/)

## 원본과 배치

`display.blend`의 `SSG_9F_KitchenTool` 컬렉션에 개별 편집 메시 123개와 내장 골재 텍스처가 있다. 원점은 전면 진열대 바로 아래 바닥 중심이다. Blender 좌표는 미터 단위이며 +X는 고객 오른쪽, +Y는 진열대 뒤쪽, +Z는 위다. glTF Y-up 변환 후 게임 원점은 (−24.923918, 39.692000, 75.249954), +Y축 회전은 −159.22054°다. 지형 보정 전 9층 바닥 높이는 40.6m다.

런타임 모델은 527,252바이트, 62,357삼각형, 3드로다. 작은 기물의 둘레 분할만 줄여 손잡이와 굽의 단면을 보존했다. 진열대 두 개의 바닥 면적에 충돌을 두었고, 매장 공용 로더가 같은 층의 근접 시야에 든 모델을 불러온다.

## 다시 만들기

저장소 루트에서 실행한다. 제작 환경은 Blender 3.6.23, AppleGothic이다. Linux에서는 NanumGothic을 사용할 수 있다. 한글 간판은 원본에 메시로 저장되어 열람 시 글꼴 설치가 필요 없다.

```sh
D=assets/models/ssg-kitchentool-shop
blender -b --factory-startup --gpu-backend opengl --python-exit-code 1 -P "$D/build.py"
node "$D/pack.mjs"
node tests/smoke.mjs shinsegae
```

편집한 원본에서 다시 내보낼 때는 아래 명령을 사용한다.

```sh
blender -b --gpu-backend opengl "$D/display.blend" --python-exit-code 1 -P "$D/export.py"
node "$D/pack.mjs"
```
