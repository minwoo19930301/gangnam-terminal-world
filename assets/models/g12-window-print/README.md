# 고투몰 G12 지상 캐노피의 점인쇄

반포쇼핑타운 7동 맞은편에서 보이는 녹색 유리와 흰색 점으로 찍은 G12를 기존 캐노피의 차도 쪽 긴 면에 맞췄다. 윗줄의 흐린 분홍과 아랫줄의 회색도 가까운 사진에서 보인다. 글자 윤곽과 점 간격은 게임 유리창에 맞춰 재구성했다. [2026년 1월 전경](https://map.naver.com/p?c=19.00,0,0,0,adh&p=3YBFAXEC_vDoVfcDR-lkMQ,325,2,80,Float) · [같은 달의 유리 표면](https://map.naver.com/p?c=19.00,0,0,0,adh&p=1-vcvyHd322boFpQwiCU_w,322,2,80,Float)

[Blender 원본](print.blend)의 **G12 유리창 점인쇄** 컬렉션에는 글자별 점망 세 개가 있다. 점을 격자 단위로 옮기거나 삭제한 뒤 아래 명령으로 세 잉크의 인쇄판을 다시 내보낸다. 게임은 이 인쇄판으로 투명 텍스처를 만들고 삼각형 두 개에 입힌다. 유리는 기존 캐노피가 그리며, 인쇄는 주간광과 가로등 빛을 받는다.

```sh
blender -b assets/models/g12-window-print/print.blend -P assets/models/g12-window-print/export.py
```

정면에서 약 19m 떨어진 지상 시점은 [게임에서 열기](../../../index.html?fixedres=1&q=low#/street?p=234.8,0,-211,14.5,0)로 확인할 수 있다. 같은 자리에서 등을 돌렸을 때, 약 69m 밖과 고투몰 B1에서 각각 새로 시작했을 때는 인쇄 데이터와 텍스처를 불러오지 않았다.
