# 신세계 강남점 천장 마감

[Blender 원본](upper-retail-finish.blend)에는 상층 공용부의 매입 슬롯과 다운라이트, 8층 스포츠 매장의 오픈셀 블레이드와 선형 조명이 있습니다. 2~11층의 기존 게임 배치에 같은 원본을 반복 사용합니다. 절곡 단면, 반사갓과 확산 렌즈의 세부 치수는 게임용 추정치입니다.

| 컬렉션 | 게임에서 쓰이는 수량 |
| --- | ---: |
| 매입 슬롯 · 온백색 라인 | 817 |
| 천장 다운라이트 · 반사갓 | 1,019 |
| 오픈셀 천장 · 절곡 블레이드 | 348 |
| 스포츠 매장 · 선형 조명 | 430 |

Blender에서 각 컬렉션의 메시와 재질 **뷰포트 표시 색상**을 수정할 수 있습니다. 발광면은 재질의 사용자 정의 속성 `lit_face`로 구분합니다. 블레이드는 원본 길이 1m를 기준으로 게임에서 각 구간의 길이에 맞춰 늘립니다. 개별 부품은 배치 컬렉션의 `preview_origin`을 기준으로 내보냅니다.

원본을 저장한 뒤 저장소 루트에서 게임용 파일 네 개를 다시 내보냅니다.

```sh
blender -b assets/models/upper-retail-finish/upper-retail-finish.blend \
  --python-exit-code 1 -P assets/models/interior-architecture/export.py
```

[게임 화면과 천장 마감](review.jpg)
