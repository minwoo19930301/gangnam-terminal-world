# JW 메리어트 서울 8층 더 라운지

세 테이블에 서로 다른 차림을 놓았다. 겨울 블리스의 딸기 디저트, 3단 황동 식기, 스콘과 세 가지 잼, 청회색 금테 주기, 긴 유리잔과 작은 겨울 꽃 장식은 2026년 11월 24일 호텔이 공개한 시즌 사진을 참고했다. 더 라운지 지점은 네이버 지도에서 확인했다. [네이버 지도](https://map.naver.com/p/entry/place/1780808607) · [호텔 제공 시즌 사진과 소개](https://kr.acrofan.com/detail.php?number=462830)

대나무 찜기, 두께가 다른 만두피와 고명, 백자, 검은 젓가락과 받침은 호텔의 딤섬 사진을 참고했다. 별도 식탁에는 재스민 등갈비와 차를 차렸다. 식탁의 선택, 개별 접시 간격과 치수는 게임 안의 기존 가구에 맞췄다. [호텔 공식 사진](https://www.marriott.com/ko/hotels/seljw-jw-marriott-hotel-seoul/photos/) · [메뉴 소개](https://www.shinsegaegroupnewsroom.com/new-year-business-meeting-hotel/)

[게임에서 본 전후](play.jpg) · [Blender 근접 렌더](studio.jpg) · [편집 원본](lounge-tables.blend)

13개 컬렉션에 편집 가능한 구성품 1,055개를 만들었다. 16개 배치가 같은 원본을 공유한다. 솔기, 찜기 테, 딸기 씨와 케이크, 꽃을 손볼 수 있다. 게임에선 작은 씨를 표면 무늬로 바꾸고, Cycles로 구운 광량과 재질별 반사율을 정점에 저장했다. 유리잔과 스콘 볼은 별도 메시로 투명도를 처리한다. 도자기와 유리에는 게임 안의 8층 라운지를 여섯 방향으로 찍은 반사가 들어간다.

```sh
blender -b assets/models/lounge-table-service/lounge-tables.blend --python-exit-code 1 -P assets/models/lounge-table-service/export.py
node assets/models/lounge-table-service/check.mjs
```

키보드로 테이블 사이 통로 10.64m를 걸었다. 다른 층, 리셉션 쪽 벽 너머, 먼 바, 등진 시야에서 시작할 때 상세 요청은 각각 0건이었다. 세 테이블에 다가가고 다시 돌아왔을 때 13개 모델과 두 이미지가 각각 한 번씩 로드됐다.
