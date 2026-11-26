# 신세계 강남점 9층 라마르조코

[일반 게임 시점](http://127.0.0.1:8765/?pos=-39.81927,40.6,72.01883&yaw=89.219&pitch=-11#/shinsegae/9F) · [같은 위치에서 촬영한 화면](game.jpg) · [검증용 카메라](camera.json)

[신세계 층별 안내](https://www.shinsegae.com/store/floor.do?storeCd=SC00002)와 저장된 매장 목록은 라마르조코를 신관 9층 가전으로 분류한다. [브랜드 개점 사진](https://m.lamarzoccokorea.co.kr/article/뉴스/8/340/)에 나온 붉은 머신, 노출 압력계가 있는 금속 머신, 그라인더, 파란 찻잔장과 높이가 다른 진열대를 참고했다. [신세계 보도자료](https://www.shinsegaegroupnewsroom.com/revival-of-premium-appliance-market/)와 [RVMN 설계 기록](https://rvmn.kr/la-marzocco)은 이광호 작가의 참여를 확인해 준다. RVMN이 밝힌 매장 면적은 24㎡다.

포터필터 손잡이와 두 갈래 추출구, 관절형 스팀완드, 물받이 격자, 버 그라인더의 조절 링과 호퍼를 모델링했다. 머신의 세부 형상과 기기 간격은 사진을 바탕으로 추정했다. 청록색 진열면 무늬는 절차적으로 새로 그렸으며, 현재 매장의 재고나 작품 원본 무늬를 재현한 자료로 볼 수는 없다.

## 원본과 배치

편집용 파일은 `gallery.blend`, 컬렉션은 `SSG_9F_LaMarzocco`다. 컬렉션에는 분리 편집이 가능한 메시 390개와 내장 질감이 있다. 단위는 미터이며 원점은 진열대 중앙 바닥이다. Blender +X는 고객이 진열대를 바라볼 때 오른쪽, +Y는 작품 벽 방향, +Z는 위다. glTF의 Y-up 변환 후 게임에서 원점을 **(-41.905385, 40.6, 71.800856)** 에 놓고 월드 +Y축으로 **110.96657°** 돌린다. 일반 실내 게임 기준이다.

게임용 GLB는 메시 5개, 삼각형 35,588개, 493,260바이트다. 매장 상세가 생성될 때 저해상도 진열대와 층별 가시성 제어용 메시를 먼저 등록한다. 같은 층의 11m 안에서 시야가 진열대 쪽을 향하면 GLB를 불러온다. 다운로드 실패 시 간이 진열대를 유지하고 5초 후 조건을 다시 확인한다. 7층 같은 수평 좌표와 9층 원거리에서 시작했을 때 해당 GLB 요청은 각각 0건, 기록된 카메라에서는 1건이었다.

## 다시 만들기

저장소 루트에서 실행한다. 검증에는 Blender 3.6.23의 macOS 헤드리스 OpenGL 백엔드를 사용했다. 설치된 4.5.11은 이 샌드박스에서 Metal 초기화 중 종료됐다.

```sh
D=assets/models/ssg-marzocco
blender -b --factory-startup --gpu-backend opengl --python-exit-code 1 -P "$D/build.py"
node "$D/pack.mjs"
node tests/smoke.mjs shinsegae
node "$D/check-streaming.mjs"
```

편집한 원본에서 런타임 자산만 다시 만들 때는 다음 두 명령을 쓴다.

```sh
blender -b --gpu-backend opengl "$D/gallery.blend" --python-exit-code 1 -P "$D/export.py"
node "$D/pack.mjs"
```

Playwright 검사는 천장을 올려다보면서 입장해 다운로드가 없는지 확인한 뒤, 첫 GLB 요청에 HTTP 503을 돌려준다. 간이 집기가 보이는지, 고개를 돌린 동안 재요청을 미루는지, 다시 볼 때 다운로드가 성공하는지, 다른 층을 다녀와도 다운로드가 반복되지 않는지 검사한다. macOS Metal로 실행하려면 명령 끝에 `--gpu`를 붙인다.
