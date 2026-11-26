# 페라가모 신세계 강남 남성 · 6F

페라가모 본사의 2024년 3분기 자료 10쪽 오른쪽 사진에는 **SEOUL – Shinsegae Gangnam Man**이라고 적혀 있다. 왼쪽 베이징점과 구분해 서울 사진의 가방·로퍼 선반, 황갈색 결이 선 밝은 석재, 검붉은 진열대 세 개, 금속 프레임 진열장, 올리브색 러그의 밝은 곡선을 모델링했다. 브랜드의 현행 지점 안내에도 강남점 남성 매장은 6층으로 나온다. 집기 위치와 치수는 게임의 기존 매장 셀 안에서 사진 비례에 맞췄다. [페라가모 본사 자료 10쪽](https://group.ferragamo.com/resource/blob/1084324/6070bac2cf4b54de73d3e24b3daedb9a/000-2024-10-15-9m24-revenue-update-analyst-data.pdf#page=10) · [신세계 공식 영문 지점 안내](https://en.shinsegae.cn/store/introduce.do?storeSeq=2)

기존 화면에는 나무 바닥과 기성 의류 행거가 보였다. 매장 앞 복도에서 같은 방향을 보면 밝은 석재 바닥 너머로 가죽 가방의 손잡이와 클러치, 금속 장식 로퍼를 볼 수 있다. [같은 시점의 낮·밤 전후 화면](comparison.jpg)

일반 게임 주소는 `#/shinsegae/6F?p=-73.326,26.200,17.850,110.785,0`이다. 진열과 출입구 사이에서 실제 캐릭터로 왕복해 6층 매장 주소와 바닥을 확인했다. 가까운 시야에서 한 번 내려받는 GLB는 143,808바이트, 14,135삼각형, 1드로다. 진열대로부터 12m 이내에서 로드하며 15m를 벗어나면 간략한 집기로 돌아간다.

`display.blend`의 `FerragamoGangnamMens` 컬렉션에는 개별 가방·구두·진열장이 들어 있다. 실내 배치 수집기는 `camera.json`을 읽어 실제 6층 매장 원점에 연결한다. 수정한 모델은 아래 명령으로 내보낸다.

```sh
cd assets/models/ssg-ferragamo
blender -b display.blend -P export.py
```
