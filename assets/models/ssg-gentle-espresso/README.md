# 강남점 11층 살롱드호우섬

[일반 게임 시점](http://127.0.0.1:8765/?pos=-18.851687538861842,50.2,82.87884860283602&yaw=37.47801839709586&pitch=-42#/shinsegae/11F) · [게임 촬영본](game.jpg) · [감독 카메라](camera.json)

강남점 11층 전문식당가에서 딤섬·누들·홍콩식 솥밥을 내는 매장이다. 저장된 강남점 층별 안내와 운영사 삼천리의 지점 안내에서 확인했다. [신세계 층별 안내](https://www.shinsegae.com/store/floor.do?storeCd=SC00002) · [삼천리 지점·메뉴 소개](https://sabo.samchully.co.kr/202603/life02.php)

강남점 손님이 촬영한 한 상을 참고했다. 검은 부채 주름 하가우와 꼭지를 오므린 게살소롱포는 각각 구멍 난 찜지를 깐 대나무 찜기에 세 알씩 놓았다. 갈색 뚝배기에는 두부와 청경채 고명을 얹었다. 찬 접시, 무늬 앞접시, 젓가락, 찻잔과 접은 냅킨도 사진에서 따왔다. 식탁 크기와 위치는 추정했다. 곁의 3단 서비스 카트와 접시 적재는 게임용 연출이며 해당 강남점 사진으로 확인된 집기는 아니다. [강남점 외관·상차림·음식 근접 사진 8장](https://752351.tistory.com/6737)

## 원본 조립과 재생성

편집 원본은 `meal.blend`의 `SSG_11F_SalonDeHaoSum` 컬렉션이다. 309개 메시, 미터 단위이며 원점은 식탁 가운데 바닥이다. Blender +X는 상판의 긴 변, +Y는 정면에서 안쪽, +Z는 위다. glTF Y-up 변환 후 게임 Y축으로 +20.778774° 회전하고 (−19.318311, 50.2, 82.071902)에 놓는다. 전체 월드에서는 같은 지점의 지형 보정값 −0.908m를 높이에 더한다.

검증에 사용한 Blender는 기존 로컬 3.6.23 헤드리스 설치본이다. 저장소 루트에서 실행한다.

아래 명령은 `PATH`의 Blender를 사용한다. 별도로 설치했다면 `GTW_BLENDER_BIN`에 해당 실행 파일 경로를 지정한다.

```sh
D=assets/models/ssg-gentle-espresso
"${GTW_BLENDER_BIN:-blender}" -b --factory-startup --gpu-backend opengl --python-exit-code 1 -P "$D/build.py"
node "$D/pack.mjs"
node tests/smoke.mjs shinsegae
node tests/smoke.mjs shinsegae gotomall
```

배포 GLB는 메시·재질 각 2개, 삼각형 50,717개, 339,632바이트다. 층 상세 생성 시 간이 식탁과 카트, 상세 메시 두 개를 등록한다. 같은 층 11m 이내에서 시야에 들어오면 상세 파일을 요청한다. 감독 렌더러에서 8층과 11층 S GARDEN의 해당 요청은 각각 0건, 촬영 위치에서는 1건이었다. 두 스모크 테스트 모두 OK였다.
