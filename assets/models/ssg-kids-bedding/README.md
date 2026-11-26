# 신세계 강남점 10층 아뜰리에 슈

[일반 게임에서 매장 보기](http://127.0.0.1:8765/?pos=-13.56664,45.4,53.39184&yaw=-61.07558&pitch=-13.8#/shinsegae/10F) · [게임 화면](game.jpg) · [카메라와 원본 컬렉션](camera.json)

저장된 신세계 층별 안내에는 10층 신생아 매장으로 등록돼 있다. 2023년 5월 문을 연 강남점 정식 매장의 사진 다섯 장에서 흰 살대 침대와 쿠션, 푸른 가장자리 이불, 여섯 칸 서랍장, 황동색 선반, 뒤쪽 건물 그림을 확인했다. 침대는 침구를 보여 주는 집기다. 침대와 서랍장을 엇갈려 놓아 게임의 좁은 구획에서도 둘 사이를 걸을 수 있다. [신세계 층별 안내](https://www.shinsegae.com/store/floor.do?storeCd=SC00002) · [강남점 개점 사진과 매장 정보](https://tnnews.co.kr/archives/144034)

제조사의 열기구·회전목마·맨션 무늬 카레는 펼쳤을 때 100 × 100cm인 면 속싸개다. 게임에서는 세 장을 서랍장에 접어 세우고 한 장은 난간에 걸었다. 쿠션 네 개는 양면을 부풀리고 테두리에 파이핑을 둘렀다. 호텔 선물 상자 일곱 개에는 입면 그림, 뚜껑과 손잡이를 넣었다. 제품의 인쇄 무늬는 게임용으로 새로 그렸다. 집기의 치수와 수량, 상품 간격은 사진을 보고 정한 근사치이며 현재 재고는 확인하지 않았다. [카레와 호텔 상자](https://atelierchoux.com/en-eu/products/signature-gift-set-blue) · [침구와 쿠션 카탈로그](https://atelierchoux.com/en-int/collections/hot-air-balloon-collection)

## 원본과 월드 배치

편집 원본은 `atelier.blend`의 `SSG_10F_AtelierChoux` 컬렉션이다. 개별 메시 168개와 내장 인쇄 텍스처를 포함한다. 원점은 바닥, 단위는 미터다. Blender +X는 진열을 정면에서 볼 때 오른쪽, +Y는 벽화 방향, +Z는 위다. glTF Y-up 변환 후 월드 +Y축을 기준으로 −69.160448° 회전한다. 논리 좌표 (−10.782593, 45.4, 51.912140)에 지형 높이 −0.908m를 더한 렌더 원점은 (−10.782593, 44.492, 51.912140)이다.

## 재생성 및 검증

저장소 루트에서 실행한다. 검증 환경은 Blender 3.6.23과 macOS이며, 영문 간판에는 시스템 서체 Baskerville을 사용한다. 서체가 없으면 Blender 기본 서체를 사용한다.

```sh
D=assets/models/ssg-kids-bedding
node "$D/prints.mjs"
"${GTW_BLENDER_BIN:-blender}" -b --factory-startup --python-exit-code 1 -P "$D/build.py"
node "$D/pack.mjs"
node tests/smoke.mjs shinsegae
node tests/smoke.mjs gotomall centralcity shinsegae
```

게임용 GLB는 431,188바이트, 삼각형 24,067개, 메시 2개, 드로콜 2회다. 목공 집기에서 쓰지 않는 UV를 제거하고 정점을 병합한 뒤 meshopt로 압축했다. 공용 로더는 같은 층에서 11m 이내로 접근해 진열을 볼 때 상세 메시를 요청한다. 그 밖의 근거리에서는 간이 진열을 한 번에 그리고, 22m 밖에서는 숨긴다. 단독·인접 장소 스모크 테스트 모두 OK.
