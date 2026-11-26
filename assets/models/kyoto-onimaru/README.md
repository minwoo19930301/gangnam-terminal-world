# 교토 오니마루 · 신세계 강남점 B1

2025년 8월 26일 강남점 현장 사진에는 쌀알과 벼 이삭 문장, 검은 처마와 양옆 장식 패널, 둥글게 굽은 유리, 어두운 대리석 하부장, 나무 통 위의 얕은 채반, 삼각 포장 제품이 보인다. 강남점 개점은 [신세계그룹 뉴스룸](https://www.shinsegaegroupnewsroom.com/premium-deli-section-opened-sinsegae-gangnam/), 진열대 형태는 [블로터 현장 사진](https://v.daum.net/v/33jk2sJqgy)에서 확인했다.

흰 쌀과 김을 두른 삼각 주먹밥, 달걀 위에 올린 돼지고기·새우튀김·장어는 [교토 오니마루 상품 사진](https://www.onimaru-net.com/)을 참고했다. 포장 접힘과 진열본의 크기 및 수량은 게임용 근사다. 벼 문장은 [브랜드 로고](https://www.onimaru-net.com/build/images/common/logo.5b0dffc4.svg)를 바탕으로 만들었다. 현장 사진은 모델에 들어가지 않는다.

편집 원본은 `counter.blend`의 `KyotoOnimaru` 컬렉션이다. 아래 명령을 저장소 루트에서 실행하면 수정한 원본을 게임용으로 내보낸다.

```sh
blender -b -t 4 assets/models/kyoto-onimaru/counter.blend -P assets/models/kyoto-onimaru/export.py
```

`build.py`는 기본 원본을 다시 생성한다. 카운터는 기존 평면과 충돌 범위를 유지한다. 거리 11m 안에서 시야에 들어올 때 GLB 한 개를 요청하고, 14m 밖에서는 기둥·처마·좌우 장식판·하부장만 남는다. 상세 모델은 308,784바이트, 삼각형 21,538개이고 인쇄면과 유리가 각각 한 번씩 그려진다.

정상 게임에서 매점 정면과 채반 앞은 각각 한 번, 뒤를 돌아선 상태와 약 13m 거리의 최초 진입 및 8층은 각각 0번 요청했다. 일반 지도에서 메가박스 위치를 출발점으로 오니마루를 검색하면 매대 옆 빈 공간에 도착해 제품을 바라본다. 예전에는 매대 뒤에서 다른 가게 방향을 바라봤다. B1 공용 통로 왕복 16.8m 동안 층은 -6m를 유지했다. 낮·밤의 같은 위치에서 찍은 [게임 화면 비교](comparison.jpg)를 참고할 수 있다.
