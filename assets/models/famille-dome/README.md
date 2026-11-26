# 파미에파크R점 유리돔 안쪽의 삼각 천장

파미에스테이션 3층 카페의 2025년 10월 방문 사진에는 투명한 면 사이로 꿀빛·짙은 목재와 유백색 삼각 패널이 섞여 있고, 가는 금속 몰딩이 패널마다 둘러져 있다. 2025년 건축 논문의 그림 6·7에서도 목재 기둥 위로 이어지는 삼각 천장을 확인했다. 바깥은 녹색 유리로 보인다. 색과 투명한 면의 비율은 사진에서 근사했고, 패널별 위치와 치수는 게임의 기존 16면 돔과 중앙 채광탑에 맞췄다. [방문자가 촬영한 실내와 외관](https://onespotdiary.com/starbucks-reserve-famille-park-seoul-coffee-tree-concept/) · [건축 논문 그림 6·7](https://iconarp.ktun.edu.tr/index.php/iconarp/article/download/1276/547) · [스타벅스 점포 안내](https://www.starbucks.co.kr/store/store_map.do?in_biz_cd=9990)

3층 난간에서 천장을 보면 목재와 유백 패널 사이로 외부 하늘이 보인다. 밤에는 투명한 부분으로 밤하늘이 보이고 매장 조명이 패널에 남는다. 같은 시점을 통합 Blender 원본에도 맞췄다. 지붕 밑을 막던 OSM 건물 상판 17면(약 854㎡)을 제거하고 기존 녹색 외측 유리에 투광 재질을 주었다. [게임과 Blender에서 본 낮·밤](comparison.jpg) · [3층 난간 시점](../../../index.html#/famille/3F?p=-47,9.6,222.3,0,39)

[편집 원본](pavilion.blend)의 ‘파미에 돔 · 삼각 천장’ 컬렉션에서 상·하부 패널, 금속 몰딩과 미리보기 조명을 편집한다. 기기의 첫 화면에는 원본에서 추출한 122삼각형이 보인다. 시야와 거리가 맞으면 약 90 KiB의 전체 천장(5,260삼각형)으로 교체하고 한 번에 그린다. 지하 스위트 파크와 신세계 B1에서 이 파일의 다운로드가 없었고 3층 난간에서는 한 번 요청했다. 흰색 패널의 밝기는 게임 화면 연출값이다.

```sh
blender --factory-startup -b assets/models/famille-dome/pavilion.blend --python-exit-code 1 -P assets/models/famille-dome/export.py
node tests/famille-pavilion.mjs
```
