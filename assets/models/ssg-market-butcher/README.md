# 신세계 마켓 · 숙성 정육장

신세계백화점이 제공한 2025년 4월 강남점 사진에서 WET-AGED와 DRY-AGED 글자가 붙은 유리문, 황동 굽 받침 위의 정육, 낮은 선반, 걸어 놓은 뼈붙이 갈비를 확인했다. 실물 사진의 특징을 기존 게임에 지정된 숙성장 자리에 재현했다. 덩어리의 단면, 마블링·지방층과 진한 외피, 뼈가 드러난 갈비는 게임용으로 별도 제작했다. 사진은 텍스처에 포함하지 않았다. [신세계백화점 제공 매장 사진](https://www.mk.co.kr/news/business/11292203) · [신세계그룹의 강남점 축산 안내](https://www.shinsegaegroupnewsroom.com/shinsegae-market-new-standard-opening/)

기존에는 숙성장과 같은 좌표에 일반 냉장 진열대도 그려져 정육 앞에 흰 상품과 전자 가격표가 겹쳤다. 이 좌표만 일반 상품 배치에서 제외했다. 원래 비운 다른 통로와 숙성장 앞유리·양끝·뒤·바닥 충돌 형상은 유지했다. 실측 자료가 없어 4.4 × 1.1m 게임 가구 외곽을 그대로 사용한다.

편집본은 `counter.blend`의 `ShinsegaeAgingCase` 컬렉션이다. 저장소 루트에서 `blender -b -t 4 assets/models/ssg-market-butcher/counter.blend -P assets/models/ssg-market-butcher/export.py`로 내보낸다. 기본 원본은 `build.py`에서 만들 수 있다.

165,188바이트 GLB는 4,806삼각형이고 정육·진열장과 유리문을 두 번에 그린다. 10m 이내에서 보일 때 요청하고, 13m 밖에서 단순 형상으로 돌아간다. 정면·제품 앞은 각각 요청 1회, 등 뒤·11m 밖은 각각 0회였다. B1 통로에서 양쪽 선반을 따라 오간 뒤 W로 밀어 본 정면 멈춤 위치는 수정 전후 모두 가구 중심에서 0.916m였다. [동일 시점의 실제 낮·밤 게임 비교](comparison.jpg)
