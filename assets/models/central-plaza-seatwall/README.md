# 센트럴시티 조각광장 동쪽 앉음벽

동쪽 녹청 구체 뒤에 낮은 생울타리가 있고, 통행로를 향해 분홍빛 석재 앉음벽이 두 단으로 내려온다. 석재 밑에 보이는 짙은 가로 이음, 모서리와 돌판 사이의 세로 줄눈은 설계자 논문의 그림 3과 두 시기의 거리뷰에서 확인했다. 13 × 1.8m는 게임에 있던 화단의 길이와 폭이다. 돌판 너비와 나뭇가지 모양은 사진에 맞춰 근사했다. [조경 설계 연구의 그림 2·3](https://www.jkila.org/archive/view_article?pid=jkila-48-5-89) · [2022년 7월 거리뷰](https://map.naver.com/p?c=18.00,0,0,0,adh&p=nuDLz2BbheMIjZ_ZXc2BRg,138,-3,27,Float) · [2026년 1월 거리뷰](https://map.naver.com/p?c=18.00,0,0,0,adh&p=FmNf2XmJtk1RjDP3k0TI7A,149,-2,25,Float)

편집 원본은 `seatwall.blend`의 `CentralCityEastSeatWall` 컬렉션이다. 석재와 생울타리를 개별 편집한 뒤 이 디렉터리에서 다시 내보낼 수 있다.

```sh
blender -b -t 4 seatwall.blend -P build.py -- --export-current
```

게임은 처음 보일 때 단순한 받침을 먼저 그리고, 가까이서 한 번 전송한 GLB를 한 번의 그리기 호출로 표시한다. 낮과 밤의 같은 보행 시점은 [비교 이미지](comparison.jpg)와 [카메라](camera.json)에 기록했다.
