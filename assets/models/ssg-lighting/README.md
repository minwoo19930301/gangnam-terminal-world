# 신세계 강남점 라잇나우

[일반 게임 9층 매장 시점](../../../?pos=-73.2455402905059,40.6,33.10852208710995&yaw=92&pitch=-7#/shinsegae/9F) · [게임 화면](game.jpg) · [카메라 좌표](camera.json)

신세계 층별 안내 저장본에는 라잇나우가 9층 홈인테리어 매장으로 올라 있다. 라잇나우 공식 매장 안내에도 본관 9층으로 기재되어 있다. 강남점 사진에서 긴 나무 테이블 위 크림색·흰색·노란색 돔형 탁상등, 뒤쪽의 겹갓 탁상등, 주름등과 타공 칸막이를 확인했다. [신세계 층별 안내](https://www.shinsegae.com/store/floor.do?storeCd=SC00002) · [라잇나우 매장 안내](https://www.lightnow.co.kr/store/) · [강남점 전경](https://www.lightnow.co.kr/web/upload/appfiles/ZaReJam3QiELznoZeGGkMG/bf618886f4e570542be83635099d6886.jpg) · [탁상등과 수직 조명 근접 사진](https://www.lightnow.co.kr/web/upload/appfiles/ZaReJam3QiELznoZeGGkMG/653a14a698659ceddcf7d32f40e1307a.jpg)

돔 아래로 퍼지는 나팔형 받침, 안쪽 반사판과 상단 버튼은 루이스폴센 판텔라 자료를, 겹갓은 PH 계열의 반사판 구조를 참고했다. 매장 사진만으로 제품별 규격과 품번을 확정하기 어려워 게임 속 비례와 간격, 표지 위치는 사진에 맞춰 추정했다. 광원은 발광 재질로 표현했다. [판텔라 제조사 자료](https://www.louispoulsen.com/en/catalog/professional/decorative-lighting/table/panthella-250-portable-lamp) · [라잇나우 루이스폴센 카탈로그](https://lightnow.co.kr/category/louis-poulsen/130/?page=1)

강남점 전경 오른쪽의 기울어진 탁상등은 투명 유리 안쪽에 흰 반사판을 얹고, 아래에서 빛을 올려 보내는 구조다. FLOS Taccia Small의 제조사 도면을 참고해 지름 373mm의 불어 만든 유리, 비스듬히 닫히는 반사판, 홈이 파인 은색 압출 받침, 조광기와 전선을 따로 만들었다. 사진 속 정확한 규격은 확인되지 않아 한 가지 제조사 규격으로 비례를 잡았다. [탁상등이 보이는 강남점 사진](https://www.lightnow.co.kr/web/upload/appfiles/ZaReJam3QiELznoZeGGkMG/bf618886f4e570542be83635099d6886.jpg) · [FLOS Taccia Small 실사진과 자료](https://flos.com/en/us/taccia-small-silver-taccia-small/F6604004.html) · [FLOS 치수 도면](https://flosweb.s3.eu-central-1.amazonaws.com/dom29644/wp-content/uploads/tech-spec-pdf/product/site-1/tech-spec-taccia-small-F66040.pdf)

탁상등 뒤에는 네 단의 투명 원통을 쌓은 플로어램프가 있다. FLOS Noctambule 4단 2.17m 도면과 사진을 대조해 유리의 둥근 어깨, 검은 금속 연결부, 빛나는 실리콘 고리와 안쪽 세로 지지대를 분리했다. 쇼룸의 길쭉한 천장등 반사는 보는 각도에 따라 움직인다. 매장 전용 유리 재질은 화면을 한 번 더 렌더링하지 않는다. 흰색 도장을 닦아낸 원목 상판의 결, 제품 카드, 뒤쪽 진열장도 함께 제작했다. [플로어램프와 진열장 정면 사진](https://www.lightnow.co.kr/web/upload/appfiles/ZaReJam3QiELznoZeGGkMG/653a14a698659ceddcf7d32f40e1307a.jpg) · [FLOS Noctambule 공식 도면](https://flospro.s3.eu-central-1.amazonaws.com/tech-spec/tech-spec-noctambule-floor-4-high-cylinder-big-base-f0292000_global-en.pdf)

[유리 조명의 낮과 밤 보행 화면](glass-day-night.jpg) · [Blender 유리 접사](native-glass.jpg) · [탁상등 앞 보행 위치](../../../?pos=-76.22487,40.6,31.34887&yaw=116.443&pitch=-21.7133#/shinsegae/9F)

## 원본과 배치

편집 파일은 `lightnow.blend`, 컬렉션은 `SSG_9F_Lightnow`이며 개별 메시 175개가 들어 있다. 미터 단위로 Blender +X는 진열대 오른쪽, +Y는 뒤쪽 벽, +Z는 위다. glTF Y-up 변환 후 월드 Y축으로 +111.031163° 회전한다. 게임 평면 원점은 (−76.480658, 40.6, 33.107843), 지형 높이를 포함한 장면 Y는 43.760000이다.

런타임 모델은 535,252바이트, 삼각형 51,840개, 메시·재질 각 3개다. 일반 게임에서 7층과 9층 원거리의 모델 요청은 각각 0건, 저장한 매장 시점에서는 1건이었다. 천장을 올려다본 시점도 요청 0건이었다. 고개를 내리고 0.98m 걸은 뒤 제자리로 돌아와도 요청 1건을 유지했다. 낮 12시 30분과 밤 10시의 실제 게임 화면에서 진열 전체는 각각 3회에 그려졌고 유리 셰이더가 두 시간대 모두 컴파일됐다. 매장 전경의 전체 장면은 기존과 같은 150회였다.

## 재생성

Blender 3.6.23 헤드리스와 내장 Bfont로 확인했다. 저장소 루트에서 실행한다.

```sh
D=assets/models/ssg-lighting
"${GTW_BLENDER_BIN:-blender}" -b --factory-startup --gpu-backend opengl --python-exit-code 1 -P "$D/build.py"
node "$D/pack.mjs"
node tests/smoke.mjs shinsegae
node tests/smoke.mjs shinsegae gotomall
```

직접 편집한 원본은 `build.py` 단계 대신 아래 명령으로 내보낸 뒤 같은 압축 단계를 실행한다.

```sh
"${GTW_BLENDER_BIN:-blender}" -b --gpu-backend opengl "$D/lightnow.blend" --python-exit-code 1 -P "$D/export.py"
```
