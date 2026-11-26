# 신세계 강남점 광주요 · 9층 테이블웨어

[일반 게임에서 보기](http://127.0.0.1:8765/?pos=-26.15973,40.6,60.82735&yaw=-84.3818&pitch=-7#/shinsegae/9F) · [게임 화면](game.jpg) · [카메라 좌표](camera.json)

강남점 9층 안내도의 광주요 구획에 도자기 35점을 배치했다. 광주요가 제공한 2025년 11월 리뉴얼 사진에서 기둥에 파인 진열장, 위 칸의 붉은 상자, 낮은 청동색 선반과 아래쪽의 투톤 항아리 두 점, 옆 진열장과 바닥의 사각 무늬를 확인했다. 게임 구획의 폭에 맞춰 옆 진열장을 줄였다. 집기 치수와 금속 마감은 사진을 보고 추정했다. [신세계 강남점 층별 안내](https://www.shinsegae.com/store/floor.do?storeCd=SC00002) · [광주요 매장 안내](https://en.ekwangjuyo.com/board/store/list.html) · [리뉴얼 기사](https://www.news1.kr/industry/general-industry/5981623) · [광주요 제공 매장 사진](https://i3n.news1.kr/system/photos/2025/11/19/7609281/high.jpg)

청자 네 쪽 접이 접시는 갈색 외면과 녹색 내면, 네 군데가 접힌 입술을 표현했다. 참외형접시는 얕은 방사형 골을, 사과형 합은 꼭지와 뚜껑 이음선을 살렸다. 제품 구성은 제조사 카탈로그를 참고해 재배치했다. 매장 사진에 보이는 투톤 항아리의 품번과 유약 배합은 확인되지 않아 사진 속 색 경계와 윤곽만 재현했다. [청자 네 쪽 접이 접시](https://ekwangjuyo.com/product/detail.html?product_no=8864) · [미각 설빛 참외형접시](https://ekwangjuyo.com/product/detail.html?product_no=7810) · [미각 설백 사과형 합](https://ekwangjuyo.com/product/detail.html?product_no=7827) · [선 시리즈 오목 접시](https://ekwangjuyo.com/product/detail.html?product_no=8661) · [월백 원호](https://ekwangjuyo.com/product/detail.html?product_no=8478)

## 원본과 배치

편집 원본은 `showroom.blend`의 `SSG_9F_Kwangjuyo` 컬렉션이다. 개별 메시 135개와 명판 글자 1개를 담았다. 미터 단위로 Blender +X는 진열장을 마주 본 고객의 오른쪽, +Y는 진열장 뒤쪽, +Z는 위다. glTF Y-up 변환 후 월드 +Y축 회전은 −69.108819°다. 월드 원점은 (−23.228293, 40.600000, 60.543347), 지형을 적용한 렌더 높이는 39.692000m다.

일반 게임용 GLB는 431,560바이트, 59,088삼각형, 3드로다. 접시 단면의 분할 수를 일반 접시 32개와 참외형 48개로 나눠 가장자리 굴곡을 보존했다. 기둥과 진열장 발밑에 충돌 범위를 두었다. 같은 층 22m 이내에는 간이 모델이 보이며, 11m 안에서 집기를 바라보면 상세 모델을 읽는다.

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
