# 신세계 강남점 꼴라주

[일반 게임에서 식탁 앞으로 이동](http://127.0.0.1:8765/?pos=-41.05033451708084,50.2,69.29531605302647&yaw=-127.1456882844002&pitch=-41#/shinsegae/11F) · [게임 촬영본](game.jpg) · [카메라 좌표](camera.json)

11층 전문식당가 꼴라주의 오리지널 함박스테이크와 오일 파스타를 차린 2인석이다. 펼친 은박 안에 데미글라스 소스를 두른 패티, 그린빈과 당근을 담고 철판 가장자리에 버터를 채운 구운 감자를 놓았다. 함박 표면과 등받이 직물은 직접 그린 UV 이미지다. [신세계 강남점 11층 층별 안내](https://www.shinsegae.com/store/floor.do?storeCd=SC00002) · [한국관광공사 꼴라주 대표 메뉴](https://korean.visitkorea.or.kr/detail/ms_detail.do?cotid=8e308b47-76a4-403c-8447-d9d659d7a5b3)

강남점 홀 사진에서 검은 곡목 의자, 녹색 잎무늬 부스, 칸막이 위 황동 난간과 회녹색 식탁의 가는 주황색 선을 확인했다. 식사 사진 두 장을 대조해 철판 손잡이와 받침, 은박 주름, 감자 단면, 파스타 위 어린잎과 흰 거품을 모델링했다. [홀과 식탁 사진](https://shinebrilliantly.tistory.com/23) · [함박과 파스타를 함께 주문한 상차림 및 접사](https://hyongdoc.tistory.com/254)

천장의 녹색 꺾임무늬와 구릿빛 띠는 신세계가 강남점 꼴라주를 소개한 사진 하단에서 따왔다. 벽 장식은 방문 사진에 흐리게 잡힌 도기 모양을 단순화했다. 서로 다른 시기의 마감을 기존 게임 좌석 한 곳에 모았으며 치수, 패널 수와 간격, 잎무늬의 반복은 추정했다. [신세계 매거진 2016년 5·6월호, 인쇄면 188쪽 하단](https://www.shinsegae.com/upload/fashionstyle/ecatalog/201605021411561623.pdf#page=133)

## 편집 원본과 배치

`collage.blend`의 `SSG_11F_Collage` 컬렉션에는 개별 메시 189개와 파일 안에 저장한 이미지 2장이 있다. 미터 단위이며 식탁 중앙 바닥이 원점이다. Blender +Y가 부스 등받이 쪽, +Z가 위다. glTF Y-up 변환 뒤 게임 월드 +Y축으로 200.780311° 회전한다. 논리 원점 (x, y, z)는 (−40.319985, 50.2, 69.895224), 지형 보정 후 y는 49.292다.

배포 파일은 391,620바이트, 삼각형 37,097개, 상세 드로콜 5회다. 같은 층 22m 안에서는 간략 집기를 한 번에 그리고, 11m 안에서 집기가 보이면 상세 메시를 요청한다. 강남점 9층 라마르조코와 11층 살롱드호우섬에서 꼴라주 GLB 요청은 각각 0건, 꼴라주 식탁 앞에서 1건이었다.

## 재생성

저장소 루트에서 실행한다. Blender 3.6.23과 저장소의 Node 패키지로 검증했다. 외부 글꼴은 사용하지 않는다.

```sh
D=assets/models/ssg-western-dining
node "$D/textile.mjs"
"${GTW_BLENDER_BIN:-blender}" -b --factory-startup --gpu-backend opengl --python-exit-code 1 -P "$D/build.py"
node "$D/pack.mjs"
node tests/smoke.mjs shinsegae
node tests/smoke.mjs shinsegae gotomall
```
