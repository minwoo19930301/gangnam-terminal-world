# 뉴코아 강남점 아디다스골프

뉴코아 2관 5층 남성·골프 매장이다. 이랜드 도면에 표시된 아디다스골프와 AK골프를 한 점포씩 배치했다. 두 점포를 넣은 구간의 폭과 실내 집기 간격은 기존 게임의 층과 통로에 맞추었다. [이랜드 2관 5층 도면](https://www.elandretail.com/upload/20261111151159_0.jpg) · [아디다스 운영 매장 목록](https://www.adidas.co.kr/help/ss26acd_storelist)

검정 후드 패딩 KR5437, 버건디 KH4086, 하늘색 KR5424, 블랙 KR5425 터틀넥은 2026년 11월 26일 지점의 네이버 지도 상품 목록에서 확인했다. 패딩은 가로 퀼팅, 검정 소매, 안쪽의 초록 라벨과 지퍼를 만들었다. 니트 세 벌은 원단 색, 마름모 사선, 소맷단의 세 줄을 따로 작업했다. 흰 챙 위의 양각 세 줄과 뒤쪽 리본, 남색 챙 위의 은색 삼선은 2023년 1월 지점 방문자가 올린 바이저 사진을 참고했다. [네이버 지도 지점·상품](https://map.naver.com/p/entry/place/1661537645) · [지점 사진](https://pcmap.place.naver.com/place/1661537645/photo)

[게임 전후](play.jpg) · [Blender 근접 렌더](studio.jpg) · [편집 원본](golf-shop.blend)

옷걸이 봉과 니트 선반, 진열대, 커튼과 벤치, 광원 위치는 제작자가 배치했다. 원본에는 15개 제품·집기 컬렉션과 766개의 편집 메시가 있다. 같은 니트 세 벌은 재단 메시를 공유하고 원단 재질은 각자 갖는다. 편집한 원본을 다음 명령으로 다시 내보낼 수 있다.

```sh
blender -b assets/models/newcore-golf/golf-shop.blend --python-exit-code 1 -P assets/models/newcore-golf/export_saved.py
node assets/models/newcore-golf/check.mjs
```

입구부터 진열 벽까지 10.0m를 키보드로 걸었다. 아래층, 옆 점포, 뒤쪽 벽, 통로에서 반대로 선 시점에서는 매장 상세 파일 요청이 없었다. 두 색의 바이저와 옷걸이 지퍼, 종이 상품표는 가까이 가면 보인다. 바닥·벽과 진열 가구, 바이저·패딩에는 실제 배치의 조명과 가림을 Cycles로 구웠다. 행거와 선반에서 공통으로 쓰는 니트 원단은 색마다 한 번 불러온다.
