# 상업 공간 건축 모델

`retail-architecture.blend`는 여섯 개 컬렉션을 편집 가능한 메시·재질·베벨로 보관한다. `npm ci`로 저장소 의존성을 설치한 다음, 이 디렉터리에서 다음 명령을 실행하면 저장한 Blender 모델을 게임용 GLB 세 개로 다시 내보낼 수 있다. `export.py`는 열린 `.blend`와 같은 디렉터리에 출력한다. 처음부터 장면을 생성하려면 두 번째 명령을 사용한다.

```sh
blender -b retail-architecture.blend --python-exit-code 1 -P export.py
blender -b --python-exit-code 1 -P build.py
```

| 컬렉션 | 게임 화면 | 시각 근거와 재구성 범위 |
| --- | --- | --- |
| RectoWall | 신세계 강남점 5F 렉토 | 2022년 강남점 촬영 자료에 보이는 곡면 목재 벽을 따라 베니어와 이음매를 만들었다. 곡률·패널 폭·하부 마감은 추정이다. [한성훈 촬영 기록](https://hansunghoon.com/recto-shinsegae-gangnam) |
| CaseGallery | 신세계 강남점 6F 리모와 | 2024년 개점 사진에 나온 나무와 알루미늄 마감, 크기가 다른 은색 캐리어 진열을 반영했다. 세 칸의 폭·프레임·조명 치수는 기존 게임용 진열대에 맞췄다. [매장 취재 및 사진 1–4](https://www.stylechosun.co.kr/online/spirit-journey/) |
| NewcoreArch | 뉴코아아울렛 외부 아치창 | 기존 거리뷰 조사에 기록한 크림색 석재 아치·유리창을 입체화했다. 각 돌의 절단선, 중심 쐐기돌과 몰딩 단면은 모델 치수다. [뉴코아 외관 조사](../../../data/research/newcore.json) |
| BoutiqueWindow | 뉴코아 2관 1F DESIGNERS·luxury gallery | 기존 가로변 패션 매장의 짙은 창틀과 투명 진열창을 참고했다. 양옆 쇼윈도, 받침·조명과 익명 의류·가방의 조합은 상가 성격에 맞춘 재구성이다. [뉴코아 외관 조사](../../../data/research/newcore.json) |
| HallSeatOrange · HallSeatCharcoal | 경부선 1F 공용 대합실 | 기존 조사 사진 15의 주황색·짙은 회색 소파와 목재 천장 아래 좌석을 반영했다. 등받이 기울기·쿠션 분할·봉제선과 다리는 추정이다. [경부선 대합실 조사](../../../data/research/gyeongbu.json) |

세 장소 모듈은 기존 매장과 대합실 배치에 GLB를 맞춘다. 경부선 좌석은 원래 충돌체를 유지하며, 이동·배율이 적용된 기존 대합실과 같은 좌표 변환으로 메시를 그린다. Blender에서 저장한 원본을 별도 디렉터리에서 다시 내보내 세 GLB의 SHA-256가 각각 동일한 것을 확인했다.

[세 장소 일반 플레이 화면](preview.jpg) · [신세계 6–11F에서 확인한 기존 Blender 상품](upper-floor-review.jpg)
