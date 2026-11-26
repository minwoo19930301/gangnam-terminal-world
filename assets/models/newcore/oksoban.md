# 뉴코아 강남점 1관 5층 옥소반

이랜드리테일은 1관 5층 식당가에 옥소반을 안내한다. 강남점 방문 사진에서 사각 인덕션과 양수 냄비, 맑은 육수, 긴 나무 쟁반 위 차돌박이, 잎채소 대접, 어두운 소스 종지를 확인했다. 식탁 크기와 위치, 인분 수와 식기 배열은 게임에서 재구성했다. [이랜드리테일 층별 안내](https://www.elandretail.com/m/store/store_04.do?bdID=0003001B&branchID=00110001&displaySeq=5&floorID=0002005F&lang=000600KO) · [강남점 방문 사진](https://sincerehappiness.tistory.com/396) · [옥소반 메뉴](https://oksoban.odw.co.kr/)

[일반 플레이 식탁 앞](http://127.0.0.1:8765/?pos=285.9516,18.6,-339.0411&yaw=-53.88&pitch=-35#/newcore/5F) · [게임 화면](oksoban-game.jpg)

`oksoban-table.blend`의 `옥소반 · 1관 5F 식탁` 컬렉션에는 식탁·의자와 상차림이 함께 들어 있다. 원점은 식탁 바로 아래 바닥이다. 프로젝트 루트에서 다음 명령으로 두 웹 자산을 다시 만든다.

```sh
blender -b -P assets/models/newcore/oksoban-build.py
```

`oksoban-base.js`의 상판과 의자는 기존 공간별 메시로 묶인다. 약 47 KiB의 `oksoban-setting.glb`는 식탁이 시야에 들어오는 13 m 안에서 처음 요청한다. 파일 하나에 냄비부터 고기 마블링까지 담았으며, 식탁에서 멀어지면 인덕션 하나로 바뀐다. 수신에 실패하면 식탁·의자와 인덕션은 보이고 다음 근접 시 다시 시도할 수 있다.
