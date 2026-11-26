# 구오 X 여경래 · 신세계 강남점

강남점에는 넓은 검은 원형 철판과 대나무 뚜껑, 여경래 셰프와 GUO 글자가 직접 인쇄된 유리 가림판, 철망을 얹은 금색 2단 진열대가 있다. 주름 잡힌 생전포, 구운 면이 드러나는 반달·삼각 지짐만두, 띠지를 두른 흰 포장을 각각 편집할 수 있게 만들었다. GUO 문장은 지점의 인쇄된 뒷판에서 윤곽을 따고 유리판의 잉크를 별도 형상으로 제작했다. [2026년 7월 19일 강남점 방문 사진](https://waggo.tistory.com/3085)

[신세계의 2025년 개점 안내](https://www.shinsegaegroupnewsroom.com/premium-deli-section-opened-sinsegae-gangnam/)와 [같은 달 촬영한 구오·교토 오니마루 전경](https://asiatime.co.kr/article/20250829500337)으로 상호 및 큰 입면을 대조했다. 수량·진열 간격과 값은 매장 실측 자료가 아니다. 철판은 고정된 진열 상태다.

`counter.blend`의 `GuoDumpling` 컬렉션이 원본이다. 저장소 루트에서 `blender -b -t 4 assets/models/guo-dumpling/counter.blend -P assets/models/guo-dumpling/export.py`로 내보낼 수 있다. `build.py`는 기본 원본을 만든다. GLB는 320,028바이트, 15,069삼각형, 몸체·잉크와 유리의 두 표면이다. 시야에 놓인 10m 이내에서 상세를 요청하며 13m 밖에서는 간단한 입면만 그린다.

기존 매대와 같은 통로에서 W로 16.8m 왕복했다. 정면, 철판 앞, 지짐만두 앞은 각각 한 번 요청했고 돌아선 시점은 0번이었다. [같은 게임 카메라로 본 전후](comparison.jpg)
