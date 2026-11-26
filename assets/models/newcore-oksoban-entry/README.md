# 옥소반 더프레쉬 · 뉴코아 강남점 1관 5층

이랜드리테일의 점포별 고객 안내에서 1관은 5층 전문식당가·문화센터·VIP라운지까지, 2관은 5층 남성·골프까지, 3관은 1층 푸드까지 확인된다. 1관 5층 브랜드 목록에는 옥소반이 등재되어 있다. 2026년 11월 27일 확인. [1관](https://www.elandretail.com/store02.do?branchID=00110001&lang=000600KO) · [2관](https://www.elandretail.com/store02.do?BDID=0003002B&branchID=00110001&lang=000600KO) · [3관](https://www.elandretail.com/store02.do?BDID=0003003B&branchID=00110001&lang=000600KO) · [1관 5층 입점 목록](https://www.elandretail.com/m/store/store_04.do?bdID=0003001B&branchID=00110001&displaySeq=5&floorID=0002005F&lang=000600KO)

입면 모양은 2025년 7월 18일 방문자가 직접 찍은 강남점 식당가 사진에 근거한다. 적갈색 벽, 검은 바탕의 청록색 원형 그릇 로고, 옥소반 글자, 밝은 목재 격자와 검은 메뉴판 받침, 열린 입구 옆 안내대를 재현했다. 치수와 개별 메뉴 삽화는 기존 게임 식당 칸에 맞춘 근사치다. 메뉴와 업종은 브랜드도 확인했다. [현장 사진](https://sincerehappiness.tistory.com/396) · [옥소반](https://oksoban.odw.co.kr/)

게임 지도에서 ‘옥소반’을 찾아 이동하면 1관 5층 공용 통로에서 매장을 마주 본다. 앞쪽의 열린 입구로 들어가면 매장명이 표시된다. 기존 식탁 모델은 안쪽에서 별도로 불러온다. 같은 통로 시점의 낮·밤 비교는 [comparison.jpg](comparison.jpg)에 있다.

Blender에서 `front.blend`의 `NC_OksobanEntrance` 컬렉션을 편집한다. 이 디렉터리에서 아래 명령으로 게임용 단일 표면을 내보낸다. 최초 모델 재현에는 `blender -b -P build.py`를 사용한다. 독립 소스 배치는 월드의 `indoor-layout.mjs`에 등록했다.

```sh
blender -b front.blend -P export.py
```

근접 GLB는 16,772바이트, 한 드로다. 층과 시야를 확인한 뒤 16m 이내에서 읽고 20m 밖에서는 단순 외형을 사용한다. 청록색 간판 조명은 표면 셰이더에 적용한다.
