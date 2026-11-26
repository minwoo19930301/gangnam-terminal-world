# 신세계 강남점 평양면옥

11층 평양면옥 입구에서 왼쪽 첫 목제 식탁에 평양냉면 한 상을 차렸다. [일반 게임에서 보기](http://127.0.0.1:8765/?pos=-18.81965243440413,50.2,59.82356784260514&yaw=7.5&pitch=-48#/shinsegae/11F) · [게임 촬영본](game.jpg) · [시점 좌표](camera.json)

강남점 층별 안내에는 11층 식당가의 평양면옥이 냉면·불고기 매장으로 실려 있다. 신세계 매거진도 이 지점의 전통평양냉면을 소개한다. [신세계 강남점 층별 안내](https://www.shinsegae.com/store/floor.do?storeCd=SC00002) · [신세계 매거진 《냉면의 미각을 노래하다》](https://www.shinsegae.com/magazine/view.do?magSeq=904&pSeq=2078)

강남점 방문 사진에서 나무 식탁과 세로살 의자, 둥근 매립 덮개, 금속 냉면기와 면수 잔, 두 칸 찬기, 양념통, 종이 메뉴를 확인했다. 그릇에는 두 갈래로 접은 메밀 면발과 편육, 반으로 자른 달걀을 담았고 찬기에는 배추김치와 무김치를 나눠 놓았다. 치수와 좌석 위치는 추정했다. 메뉴는 촬영 당시의 책자 형태와 음식 이름을 바탕으로 다시 조판했고, 가격은 생략했다. [강남점 실내·상차림·메뉴 근접 사진](https://lifensook.tistory.com/154)

## Blender 원본과 게임 배치

편집 원본은 `table.blend`의 `SSG_11F_PyongyangMyeonok` 컬렉션이다. 미터 단위이고 원점은 식탁 중앙의 바닥이다. Blender +X는 두 의자를 잇는 방향, +Y는 냉면에서 메뉴 쪽, +Z는 위다. glTF Y-up 변환 후 게임 Y축으로 +20.780533° 회전해 월드 (−18.963960, 50.2, 58.880590)에 둔다. 전체 월드 지형 보정은 높이 −0.908m다.

Blender 3.6.23에서 생성하고 원본을 다시 열어 개별 메시 173개를 확인했다. 메뉴는 AppleMyungjo로 작성해 메시로 저장했다. 다른 환경에서 다시 만들 때는 `GTW_KOREAN_FONT`에 한글 글꼴 파일을 지정할 수 있다. 저장소 루트에서 실행한다.

```sh
D=assets/models/ssg-table-service
"${GTW_BLENDER_BIN:-blender}" -b --factory-startup --gpu-backend opengl --python-exit-code 1 -P "$D/build.py"
node "$D/pack.mjs"
node tests/smoke.mjs shinsegae
node tests/smoke.mjs shinsegae gotomall
```

배포 GLB는 289,084바이트, 삼각형 41,783개, 메시·재질 각 2개로 두 번에 그린다. 11층 식탁 근처에서 시야에 들어오면 상세 모델을 요청한다. 일반 게임에서 8층과 11층 S GARDEN의 해당 파일 요청은 0건, 위 촬영 시점은 1건이었다. 두 스모크 테스트 모두 OK였다.
