# 강남점 신세계 마켓 홀빈 진열장

강남점 개점 자료에는 고객이 일곱 종류 원두를 골라 담는 디스펜서가 나온다. 같은 식품관에서는 마켓레인의 포장 커피도 판매했다. 2025년 5월 행사 때 신세계가 공개한 매장 사진에서 뒤편의 고정 진열장을 참고했다. 월넛색 테두리, 황동 투입통과 원형 손잡이, 자주색 돌 선반, 흰 포장과 갈색 봉투를 재현했다. 마켓레인 표기는 포장 원두와 드립백에만 넣었다. [개점 발표](https://www.shinsegaegroupnewsroom.com/shinsegae-market-new-standard-opening/) · [매장 사진과 취급 상품](https://www.shinsegaegroupnewsroom.com/shinsegae-baek-hoju-specialty-coffee/) · [신세계 매거진 식료품 소개](https://www.shinsegae.com/magazine/view.do?magSeq=964&pSeq=2462)

공개 층별도는 신세계 마켓 영업 구역을 표시한다. 진열장 위치와 너비는 기존 게임의 목재 벽장 한 칸에 맞췄다. 포장의 작은 무늬와 석재 결은 직접 그렸다. 사진의 행사 탁자와 사람은 재현 범위에서 제외했다.

[게임 정면](https://minwoo19930301.github.io/gangnam-terminal-world/#/shinsegae/B1?p=-62.56782,-6,3.16069,-69.21399,0) · [수정 전후 비교](comparison.jpg). 왼쪽은 기존 진열장, 오른쪽은 수정본이다. 위는 낮 정면, 아래는 밤에 비스듬히 본 모습이다.

## 원본과 게임

`coffee.blend`의 `MarketLaneBeanCase`에는 디스펜서, 포장, 선반과 프레임이 개별 오브젝트로 들어 있다. `camera.json`이 도시 장면의 B1 원본 등록과 확인 시점을 제공한다. 원본에서 게임 파일을 다시 내보내려면 저장소 루트에서 실행한다.

```sh
blender -b -t 4 assets/models/ssg-market-coffee/coffee.blend -P assets/models/ssg-market-coffee/export.py
```

게임은 가까운 통로에서 앞면이 보일 때 한 번 그리는 메시로 전환한다. 대기 중에는 원두통 일곱 개와 진열장 윤곽을 먼저 그린다. 같은 시야의 저화질 낮 정면에서 전체 장면은 159회에서 160회로, 건너편 통로에서는 173회에서 174회로 늘었다. 전용 GLB는 102,452바이트, 6,396삼각형이다.
