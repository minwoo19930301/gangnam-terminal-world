# 프루니에 · 신세계 마켓

강남점에서 촬영한 냉장 진열에는 ‘프루니에 / CAVIAR | PRUNIER’ 목재 간판과 금빛 세로 홈, 은접시·철갑상어 손잡이가 달린 서비스 용기, 청록색 원형 틴, 작은 선물 상자와 병 제품이 보인다. 틴의 금색 PRUNIER 글자는 제조사 제품의 윤곽을 따고 바다 생물 문양·포장·유리병은 게임용으로 다시 그렸다. [강남점 정면 사진](https://www.news2day.co.kr/article/20250228500209) · [가까이에서 본 은기와 틴](https://v.daum.net/v/20250301053032398) · [신세계백화점의 강남점 취급 브랜드 안내](https://deptmapp.shinsegae.com/magazine/view.do?pSeq=2462) · [제조사의 캐비아 틴](https://prunier.com/en/pages/boite-de-caviar) · [은제 서비스](https://prunier.com/en/products/service-a-caviar)

사진과 공식 안내는 식품관 입점과 진열장 형태를 확인해 준다. 어느 벽 칸인지는 공개 평면에 나오지 않아 게임의 마켓 목제 진열 구간 가운데 통로에서 접근 가능한 칸에 맞췄다. 목공 테두리는 이전부터 코드에 있었으나 시장 윤곽 검사에서 후보 14칸이 전부 탈락했다. 위치를 10cm 안으로 들인 후 기존 검사를 통과하는 7칸 중 1칸에 이 냉장장을 두었다. 나머지 6칸은 기존 목재 틀로 보인다. 두 출입부와 꺾인 외곽을 포함해 나머지 7칸은 계속 비운다. 게임 보행 경계는 그대로다.

게임 지도에서 프루니에, Caviar Prunier, Prunier를 검색하면 진열장을 바라보는 공개 통로로 이동한다. 신세계 B1 층 바로가기는 신세계 마켓 동측 로비에서 입구를 바라본다.

기본 편집본은 `counter.blend` 안의 `PrunierMarketCase` 컬렉션이다. 저장소 루트에서 `blender -b -t 4 assets/models/ssg-market-prunier/counter.blend -P assets/models/ssg-market-prunier/export.py`로 편집한 원본을 내보낸다. `camera.json`은 게임 카메라와 도시 Blender 배치 양쪽에 사용한다.

241,988바이트 GLB 한 개에 15,752삼각형을 담아 한 번에 그린다. 9m 안에서 앞을 볼 때 상세를 요청하고 12m 밖에서는 간단한 진열장으로 바뀐다. 냉시작 정면·상품·은기 앞에서 각 1회, 돌아선 시점과 11m 밖에서 각 0회 요청했다. B1 선반 사이에서 W로 약 6.7m 왕복해 -6m를 유지했다. [낮·밤의 기존 벽과 새 진열 비교](comparison.jpg)
