# 뉴코아 강남점 1관 5층 애슐리퀸즈 입구

뉴코아 강남점 1관 5층은 전문식당가·문화센터·VIP라운지이며, 애슐리퀸즈가 이 층에 있다. 2관 5층은 남성·골프다. [이랜드 1관 층별안내](https://www.elandretail.com/store02.do?branchID=00110001&lang=000600KO) · [1관 5층 매장 목록](https://www.elandretail.com/m/store/store_04.do?bdID=0003001B&branchID=00110001&displaySeq=5&floorID=0002005F&lang=000600KO) · [2관 층별안내](https://www.elandretail.com/store02.do?BDID=0003002B&branchID=00110001&lang=000600KO)

2026년 11월 22일 게시된 강남점 방문기의 첫 두 사진에서 짙은 청록색 몰딩, 겹친 수평 코니스와 밝은 테두리 안에 전구가 박힌 두 줄 영문 간판을 확인했다. 첫 사진에는 무늬 타일 문턱, 오른쪽 안내대와 작은 태블릿, 안쪽의 둥근 조명 세 개가 함께 보인다. 기둥 간격과 글꼴, 전구 수와 타일 무늬는 기존 게임 매장 폭과 사진 비례에 맞췄다. [방문자가 촬영한 입구와 간판](https://johnkth.tistory.com/14471)

왼쪽은 변경 전, 오른쪽은 변경 후다. 위는 공용 통로 정면의 낮, 아래는 비스듬히 본 밤이다. 게임 지도에서 ‘애슐리퀸즈’나 ‘Ashley Queens’를 검색하면 기존 영업점 핀이 이 입구로 연결된다. [게임에서 입구 보기](https://minwoo19930301.github.io/gangnam-terminal-world/?q=low#/newcore/5F?p=268.94969,18.6,-364.1963,-67.50934,8) · [정상 게임 전후 비교](comparison.jpg)

[편집용 Blender 원본](entrance.blend)에서 코니스, 기단, 글자 가장자리와 전구, 타일·조명을 따로 편집할 수 있다. 16m 안에서 입구 앞면을 보았을 때 상세 파일 45,272바이트를 한 번 받고 5,524개 삼각형을 한 번에 그린다. 느린 첫 화면과 원거리에는 74개 삼각형의 간략한 입면과 두 줄 영문 간판을 쓴다. 뷔페와 디저트는 기존 매장에 연결된다.

```sh
blender -b assets/models/newcore-ashley-entry/entrance.blend --python-exit-code 1 -P assets/models/newcore-ashley-entry/export.py
```
