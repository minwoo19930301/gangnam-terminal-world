# 부창제과 강남점

에프지푸드는 신세계 강남점 지하 1층을 부창제과 매장으로 안내한다. 운영사 사진에서 호두 껍데기 무늬와 얇게 구워진 반죽 테, 철판 홈과 손잡이, 낱개 종이 포장, 검은 꽃 문양을 인쇄한 선물 상자를 확인했다. 2026년 3월 신세계의 강남점 촬영 사진에는 나무로 짠 판매대, 밝은 돌 상판, 각진 유리 진열장과 둥근 유리 덮개가 보인다. [부창제과 운영사 상품·매장 사진](https://www.fgon.co.kr/brand/buchangjegwa.php) · [신세계 강남점 현장 사진](https://www.shinsegaegroupnewsroom.com/shinsegae-department-stores-gd-logo-daisy-walnut-snack-is-on-display/)

게임은 상시 상품인 팥앙금·우유니소금 호두과자와 포장에 집중했다. 왼쪽 레이스 천을 댄 진열함과 종이 손잡이 상자는 운영사 진열 사진을 따랐다. 가운데에 낱개 포장과 선물 상자, 오른쪽에 팥소 단면과 빈 철판 홈을 놓았다. 배치와 크기는 11월 25일 B1 안내도의 부창제과 구역 안에 맞춘 근사값이다. [운영사의 진열함 사진](https://www.fgon.co.kr/images/sub/sub2_3_4-img1.png) · [개점 당일 강남점 취재 사진](https://view.asiae.co.kr/article/2024102216140779956) · [게임의 같은 시점 전후 비교](comparison.jpg)

Blender 원본의 `BuchangWalnutCounter` 컬렉션에서 진열함과 각 상품 묶음을 따로 편집할 수 있다. 상품의 구운 골, 팥소 단면, 종이 접힘은 입체 형상이다. 목리와 레이스, 인쇄는 Blender 안에 포함된 이미지 한 장을 함께 쓴다. `mark.json`은 운영사가 공개한 브랜드 마크의 윤곽이다. [공식 심벌과 글자](https://www.fgon.co.kr/images/sub/sub2_3-img.png)

```sh
blender -b -P assets/models/buchang-walnut/build.py
blender -b assets/models/buchang-walnut/counter.blend -P assets/models/buchang-walnut/export.py
```

지도에서 ‘부창제과’를 선택하거나 `#/centralcity/B1?p=-63.80446,-6,86.29668,201.33861`로 들어간다. 실제 입구에서 2.73m 앞에 진열대가 보인다. GLB 195,988바이트, 10,228개 삼각형, 한 번의 그리기 명령이다. 입구와 양쪽 상품 근접 시점은 각 1회, 반대 방향·14.6m 거리·신세계 8층에서는 0회 요청했다. 실제 키보드 보행 11.5m 왕복 동안 바닥 높이 -6m를 유지했고 두 지역 smoke와 Blender 재수출 SHA-256 일치를 확인했다.
