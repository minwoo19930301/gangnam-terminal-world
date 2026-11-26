# 신세계 강남점 광주요 · 9층 테이블웨어

[일반 게임에서 보기](http://127.0.0.1:8765/?pos=-26.15973,40.6,60.82735&yaw=-84.3818&pitch=-7#/shinsegae/9F) · [게임 화면](game.jpg) · [카메라 좌표](camera.json)

광주요가 제공한 2025년 11월 강남점 사진에서 기둥의 매입장, 맨 위의 붉은 상자, 가운데 놓인 청색·옅은 주황·자줏빛 그릇, 그 아래쪽의 밝은 기물을 확인했다. 앞쪽 진열대에는 투톤 항아리 두 점 위로 낮게 기울인 수저 견본판 두 개가 놓여 있다. 오른쪽에는 별도 받침 위에 가지를 꽂은 작은 꽃병이 보인다. 사진에서 확인한 순서와 색을 따라 배치했다. 바닥 면적과 집기 간격은 게임 구획에 맞췄다. [신세계 층별 안내](https://www.shinsegae.com/store/floor.do?storeCd=SC00002) · [광주요 매장 안내](https://en.ekwangjuyo.com/board/store/list.html) · [광주요 제공 매장 사진](https://i3n.news1.kr/system/photos/2025/11/19/7609281/high.jpg)

하단 항아리는 강남점에서 취급한 박미란 작가 협업 ‘푸른빛’ 옻칠 원호 사진과 대조했다. 넓게 부푼 몸통이 좁은 굽으로 모이고, 겹친 입술과 열린 목이 보인다. 옻색은 짙은 남색에서 청회색 띠를 거쳐 몸통 위쪽의 갈빛으로 넘어간다. 제조사가 발표한 20·30·40cm 규격 가운데 원경 사진의 크기 비와 맞는 30cm와 40cm를 골랐다. 사진에 보이는 두 점의 개별 품번은 확인하기 어렵다. [광주요 제공 제품 사진과 규격](https://www.beyondpost.co.kr/view.php?ud=20250610091234240746a9e4dd7f_30) · [강남점 취급 안내](https://www.mk.co.kr/news/business/11340062)

경사대에는 목수저 견본 네 벌과 크기가 다른 숟가락 여섯 개를 놓았다. 제조사 목수저 사진을 보며 숟가락 술의 오목한 곡면, 네모난 손잡이, 젓가락 끝으로 이어지는 나뭇결을 만들었다. 다른 견본의 수종과 금속 배합은 알 수 없어 사진 속 명암에 맞췄다. 옆 진열장의 청자 한 쪽 접이 물잔과 네 쪽 접시는 안쪽 녹유와 갈색 외면의 접힌 선을 따라 만들었다. 작은 사과형 합은 뚜껑과 몸체를 따로 편집할 수 있다. [목수저 견본](https://ekwangjuyo.com/product/detail.html?product_no=8631) · [청자 물잔](https://ekwangjuyo.com/product/detail.html?product_no=8162) · [청자 네 쪽 접시](https://ekwangjuyo.com/product/detail.html?product_no=8864) · [참외형접시](https://ekwangjuyo.com/product/detail.html?product_no=7810) · [사과형 합](https://ekwangjuyo.com/product/detail.html?product_no=7827)

[Blender 원호·수저·청자 확대](lacquer-and-cutlery.jpg) · [진열대 두 곳의 게임 시점](display-walk.jpg)

## 원본과 배치

편집 원본은 `showroom.blend`의 `SSG_9F_Kwangjuyo` 컬렉션이다. 개별 메시 319개와 명판 글자 1개, 내장 표면 이미지 세 장를 담았다. 미터 단위로 Blender +X는 진열장을 마주 본 고객의 오른쪽, +Y는 진열장 뒤쪽, +Z는 위다. glTF Y-up 변환 후 월드 +Y축 회전은 −69.108819°다. 월드 원점은 (−23.228293, 40.600000, 60.543347), 지형을 적용한 렌더 높이는 39.692000m다.

일반 게임용 GLB는 723,332바이트, 삼각형 67,433개, 드로콜 3회다. 유리 상판과 색유리 그릇을 하나의 투명 메시로 묶고, 목재·옻칠·도자·청동의 표면은 하나의 아틀라스에 넣었다. 편집 원본을 열어 다시 압축한 파일은 최초 배포본과 바이트 단위로 일치했다.

이 Mac의 헤드리스 Chromium에서 같은 시점의 전체 드로콜은 수정 전후 각 83회였다. 다른 층과 멀리 떨어진 곳, 매장 앞에서 천장을 본 상태는 상세 요청이 각 0건이었다. 매장을 바라보며 0.98m 걸어갔다가 출발점으로 돌아오는 동안 한 번 읽었다. 네트워크 속도와 실제 기기에 따라 로딩 시간과 프레임은 달라진다.

## 다시 만들기

저장소 루트에서 실행한다. Blender 3.6.23과 내장 Bfont를 사용했다.

```sh
D=assets/models/ssg-ceramics
blender -b --factory-startup --gpu-backend opengl --python-exit-code 1 -P "$D/build.py"
node "$D/pack.mjs"
node tests/smoke.mjs shinsegae
node tests/smoke.mjs gotomall shinsegae
```

원본을 직접 편집한 뒤에는 다음 명령으로 게임 모델만 갱신한다.

```sh
blender -b --gpu-backend opengl "$D/showroom.blend" --python-exit-code 1 -P "$D/export.py"
node "$D/pack.mjs"
```
