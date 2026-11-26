# 강남점 발효:곳간 육수 재료 진열대

신세계 한식연구소 발효:곳간에서는 손님이 건어물과 건채소를 직접 골라 육수팩을 주문한다. 강남점에서 촬영한 영상에는 손님 쪽으로 낮아지는 스테인리스 재료 통과 작은 안내 카드, 재료마다 다른 색과 형태가 보인다. 게임에서는 공식 B1 안내에 표시된 발효:곳간의 기존 계산대 옆 상판에 매대를 맞췄다. 통의 정확한 개수와 매장 안 위치는 사진과 현재 게임 집기 폭을 바탕으로 재구성했다. [운영사 소개](https://www.shinsegaegroupnewsroom.com/shinsegae-market-new-standard-opening/) · [서울경제 현장 취재와 육수 코너 영상](https://v.daum.net/v/20250301053032398) · [강남점 B1 안내](https://www.shinsegae.com/store/floor.do?storCd=SC00002)

Blender 원본의 `PantryBrothWells` 컬렉션에서 팬, 재료와 카드를 각각 편집할 수 있다. 게임은 가까이서 진열대를 볼 때 하나의 메시를 불러온다. 멀리서는 낮은 받침과 재료색만 그린다. [게임 변경 전후](comparison.jpg) · [게임 시점](camera.json)

```sh
blender -b assets/models/ssg-pantry-broth/broth-wells.blend --python-exit-code 1 -P assets/models/ssg-pantry-broth/export.py
```
