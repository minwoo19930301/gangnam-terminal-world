# 신세계 강남점 라잇나우

[일반 게임 9층 매장 시점](../../../?pos=-73.2455402905059,40.6,33.10852208710995&yaw=92&pitch=-7#/shinsegae/9F) · [게임 화면](game.jpg) · [카메라 좌표](camera.json)

신세계 층별 안내 저장본에는 라잇나우가 9층 홈인테리어 매장으로 올라 있다. 라잇나우 공식 매장 안내에도 본관 9층으로 기재되어 있다. 강남점 사진에서 긴 나무 테이블 위 크림색·흰색·노란색 돔형 탁상등, 뒤쪽의 겹갓 탁상등, 주름등과 타공 칸막이를 확인했다. [신세계 층별 안내](https://www.shinsegae.com/store/floor.do?storeCd=SC00002) · [라잇나우 매장 안내](https://www.lightnow.co.kr/store/) · [강남점 전경](https://www.lightnow.co.kr/web/upload/appfiles/ZaReJam3QiELznoZeGGkMG/bf618886f4e570542be83635099d6886.jpg) · [탁상등과 수직 조명 근접 사진](https://www.lightnow.co.kr/web/upload/appfiles/ZaReJam3QiELznoZeGGkMG/653a14a698659ceddcf7d32f40e1307a.jpg)

돔 아래로 퍼지는 나팔형 받침, 안쪽 반사판과 상단 버튼은 루이스폴센 판텔라 자료를, 겹갓은 PH 계열의 반사판 구조를 참고했다. 매장 사진만으로 제품별 규격과 품번을 확정하기 어려워 게임 속 비례와 간격, 표지 위치는 사진에 맞춰 추정했다. 광원은 발광 재질로 표현했다. [판텔라 제조사 자료](https://www.louispoulsen.com/en/catalog/professional/decorative-lighting/table/panthella-250-portable-lamp) · [라잇나우 루이스폴센 카탈로그](https://lightnow.co.kr/category/louis-poulsen/130/?page=1)

## 원본과 배치

편집 파일은 `lightnow.blend`, 컬렉션은 `SSG_9F_Lightnow`이며 개별 메시 125개가 들어 있다. 미터 단위로 Blender +X는 진열대 오른쪽, +Y는 뒤쪽 벽, +Z는 위다. glTF Y-up 변환 후 월드 Y축으로 +111.031163° 회전한다. 게임 평면 원점은 (−76.480658, 40.6, 33.107843), 지형 높이를 포함한 장면 Y는 43.760000이다.

런타임 모델은 294,152바이트, 삼각형 33,060개, 메시·재질 각 3개다. 일반 게임에서 7층과 9층 원거리의 모델 요청은 각각 0건, 저장한 매장 시점에서는 1건이었다. 간이 진열대는 한 번에 그린다.

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
