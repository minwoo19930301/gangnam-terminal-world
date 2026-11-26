# 신세계 강남점 9층 크리스토플

[일반 게임에서 무드 세트 보기](http://127.0.0.1:8765/?pos=-59.556023,40.6,38.990373&yaw=121.98687&pitch=-23#/shinsegae/9F) · [근접 화면](game.jpg) · [진열장 전체 화면](cabinet.jpg) · [카메라 좌표](camera.json)

강남점 층별 안내에 크리스토플은 9층 홈인테리어와 테이블웨어 양쪽에 실려 있다. 신세계의 생활관 리뉴얼 기사 첫 사진 세 장 중 가운데 사진에서 은색 바웨어, 올리브색 뒷판, 세로 금속 지지대와 얇은 나무 선반을 확인했다. 기사 본문은 이 매장에서 무드 컬렉션을 취급한다고 소개한다. 사진에 보이는 선반 마감과 바웨어 실루엣을 옮겼으며, 진열장 치수와 무드 세트를 놓은 위치는 추정했다. [강남점 층별 안내](https://www.shinsegae.com/store/floor.do?storeCd=SC00002) · [신세계 강남점 리뉴얼 화보](https://www.shinsegae.com/magazine/view.do?magSeq=1204&pSeq=2746)

무드 B00065299의 높이 30cm, 지름 20cm를 기준으로 여닫는 두 외피와 호두나무 받침을 만들었다. 열린 세트에는 나이프·포크·테이블스푼·티스푼이 각 여섯 개씩 꽂혀 있다. 선반 위에는 같은 네 종류를 눕혀 포크의 네 갈래와 스푼 볼의 깊이를 볼 수 있게 했다. 금속 표면에는 매장 조명과 선반을 단순화한 반사 무늬를 UV로 구워 넣었다. 실제 매장의 반사를 측정한 값은 아니다. [제조사 제품 규격과 개폐 사진](https://www.christofle.com/expeur_en/flatware-set-for-6-people-24-pieces-mood-silver-plated-00065299000101.html) · [무드 컬렉션](https://www.christofle.com/eu_en/mood-by-christofle)

## 편집과 배치

`mood.blend`의 `SSG_9F_Christofle` 컬렉션에 편집 메시 149개와 내장 이미지 두 장이 있다. Blender에서 단위는 미터이며 +X는 고객의 오른쪽, −Y는 선반 정면, +Z는 위다. glTF Y-up 변환 후 게임의 +Y축을 기준으로 110.98687° 회전한다. 게임 바닥 원점은 (−60.46832, 40.6, 39.54383), 지형 보정 후 월드 원점은 (−60.46832, 43.64310, 39.54383)이다.

Blender 3.6.23과 내장 Bfont로 생성하고 원본을 다시 열어 확인했다. 저장소 루트에서 실행한다.

```sh
D=assets/models/ssg-silver-table
"${GTW_BLENDER_BIN:-blender}" -b --factory-startup --gpu-backend opengl --python-exit-code 1 -P "$D/author.py"
node "$D/pack.mjs"
node tests/smoke.mjs shinsegae
node tests/smoke.mjs gotomall shinsegae
```

게임 파일은 407,872바이트, 삼각형 32,444개, 재질별 드로 콜 2회다. 곡면 노멀과 UV를 유지하고 meshopt로 압축했다. 같은 층 22m 이내에서는 간이 진열장을 쓰고, 11m 이내에서 시야에 들어오면 상세 모델을 요청한다. 일반 게임에서 7층과 9층 원거리의 파일 요청은 각각 0건, 저장한 근접 시점에서 1건이었다. 두 스모크 테스트 모두 OK를 확인했다.
