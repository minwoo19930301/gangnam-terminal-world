# 래미안퍼스티지 중심상가

반포대로 287 중심상가의 OSM 윤곽을 유지하고 지상 5개 층을 표현했다. 네이버 거리뷰에서 확인한 짙은 석재 패널, 푸른 창, 세로 유리 띠와 곡면 창, 옥상 쪽 건물명, 하나은행·비앤씨치과 표지를 모델에 반영했다. 층고와 창 간격, 건물 총높이 19.5m는 거리 사진에 맞춘 추정값이다. G1 출구와 맞닿은 갈색 루버는 고투몰 모델에서 다룬다. [2026년 1월 네이버 거리뷰](https://map.naver.com/p?c=18,0,0,0,adh&p=hjTPhNZ3xQr6lozhU0XS9w,163,10,80,Float) · [건물 개요](https://statnorth.kr/address/서울/서초구/반포동/18-3)

`centre.blend`에서 외벽의 창·패널과 금속 창틀을 편집할 수 있다. 편집한 파일을 연 상태에서 다음 명령으로 웹 모델을 다시 내보낸다.

```sh
blender -b assets/models/perstige/centre.blend --python assets/models/perstige/build.py -- --export-current
```
