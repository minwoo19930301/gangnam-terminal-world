# 차알 파미에스테이션 FP218

파미에스테이션 2층 회랑에서 흰 필기체 간판 아래로 들어가면 체크 바닥, 붉은 등받이 좌석, 석재 식탁과 황색 액자 벽이 보인다. 식탁 가까이에서 마라탕면의 둥근 면발과 얇게 접힌 차돌, 볶음밥의 쌀알과 계란, 파와 새우를 올린 가지 요리를 볼 수 있다. [같은 위치에서 비교한 게임 화면](play.jpg) · [음식과 꽃 부조, 조명](table.jpg)

운영사 도면의 2층 12번과 네이버 지도 차알 파미에스테이션점(사평대로 205, 2층)을 대조했다. 서초구 일반음식점 원자료의 FP218 행에 신고된 영업장 면적은 120.00㎡다(개업 2018-01-12, 관리번호 3210000-101-2018-00022). 게임에서 재현한 공개 좌석 구간은 기존 회랑과 점포 칸에 맞춘 12.28 × 5.94m, 약 72.94㎡다. [운영사 지점 소개](https://www.shinsegaecentral.com/famille/Cha%E2%80%99R) · [운영사 2층 안내도](https://www.shinsegaecentral.com/public/img/famille_floor_2_ko_map.png) · [네이버 지도](https://map.naver.com/p/entry/place/1433741819) · [서초구 일반음식점 인허가 원자료](https://data.seoul.go.kr/dataList/OA-18673/S/1/datasetView.do)

운영사 사진의 세이지색 벽과 금빛 꽃가지·화병 부조, 방문 사진의 곡목 의자, 석재 식탁, 황동 조명, 나무 안내대와 세 가지 요리를 참고했다. 식탁 여섯 곳의 위치, 통로와 가구 치수, 석재 무늬, 음식의 양과 기물 수, 조도와 거울에 비치는 맞은편 가구의 배치는 사진을 보고 추정했다. [운영사의 실내 사진](https://www.shinsegaecentral.com/upload_img/1517284949c87w1xdt598oc8n03mz68gr0upmaw0bsbpzeyyyvnlxyf7xh41_concept.jpg) · [홀과 마라탕면](https://babeseoul.tistory.com/133) · [식당과 볶음밥·가지 요리](https://yellow-oi.tistory.com/174) · [좌석과 기물](https://too-laky.tistory.com/196)

## 편집과 검증

[restaurant.blend](restaurant.blend)에 배치된 식당 장면과 원본 집기 컬렉션 12개가 있다. 석재 무늬는 원본에 포함되어 있다. 세 거울은 Blender에서 각각 구운 실내 파노라마를 한 이미지에 담고 게임 시점에 맞춰 투영한다. 식탁과 상판·식기류 인스턴스는 서로 가까운 식탁끼리 묶었다. 음식, 부조, 석재, 반사 이미지는 해당 좌석을 향해 접근할 때 받는다.

저장소 루트에서 아래 명령으로 원본과 게임 에셋을 다시 만들고, 실내 보행·교차 옹벽·근거리 로딩·거울 시차·시야별 픽셀을 점검한다. Blender 4.5와 Node.js 프로젝트 의존성을 사용한다. 시스템 한글 글꼴이 다른 환경에서는 `GTW_KOREAN_FONT`로 글꼴 경로를 지정한다.

```sh
blender --factory-startup -b -t 4 --python-exit-code 1 --python assets/models/char-dining/build.py
node assets/models/char-dining/check.mjs
```
