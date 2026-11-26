# 신세계 강남점 폴스미스

본관 6층 남성복 매장. 게임에서 기존 폴스미스 매장을 찾아 2024년 리뉴얼 사진의 정면과 쇼윈도 구성을 한 시야에 담았다. 노란 병풍 앞 주황색 타원 받침대와 손가방, 크림색 병풍 앞의 정면 재킷, 청록색 면 옆의 옷걸이가 쇼윈도 사진에서 보인다. 남색 상호 띠와 자주색 벽, 세로 골이 잡힌 아이보리 오토만, 어두운 진열대와 바닥 줄무늬는 매장 정면 사진을 따랐다. 두 장면을 게임 매장 폭에 맞춰 재배치했다. 가구 치수와 재킷 8벌·접은 니트 7장의 색상 및 수량은 추정이다.

- [신세계 강남점 공식 층별 안내](https://deptmapp.shinsegae.com/store/floor.do?storeCd=SC00002) · 저장한 안내의 6F 점포명은 ‘폴스미스’, 층 분류는 ‘남성 럭셔리 · 컨템포러리’다.
- [신세계인터내셔날 강남점 리뉴얼 기사](https://www.shinsegaegroupnewsroom.com/paul-smith-shinsegae-gangnam-renovation/) · [매장과 쇼윈도 사진](https://images.shinsegaegroupnewsroom.com/wp-content/uploads/2025/08/paul-smith-shinsegae-gangnam-renovation.png) · [정면 상세 사진](https://images.shinsegaegroupnewsroom.com/wp-content/uploads/2025/08/paul-smith-shinsegae-gangnam-renovation_2.png)
- 재킷의 좁은 노치 라펠과 소맷단 단추 네 개는 [폴 스미스 Soho 수트](https://www.paulsmith.com/au/discover/guides/suit-fit-guide), 브이넥 안쪽의 가는 배색 띠는 [메리노 니트 목둘레 사진](https://assets.paulsmith.com/paul-smith-products/f_jpg,q_auto,w_500/v1670328168/STILL/M1R/M1R-571X-K01944-49/M1R-571X-K01944-49_20)을 참고했다. 지점 사진만으로 개별 상품의 품번은 확인하기 어렵다.

## 원본과 게임 화면

[일반 플레이 시점](/?pos=-63.24113101411479,26.2,-16.37232899117165&yaw=-155.08339616157195&pitch=-4#/shinsegae/6F) · [게임에서 촬영한 화면](game.jpg) · [카메라 수치](camera.json). 프로젝트를 하위 경로에 서비스하면 해당 경로 뒤에 같은 쿼리와 해시를 붙인다.

Blender 3.6.23에서 다시 연 원본은 `gallery.blend`의 `SSG_6F_PAUL_SMITH` 컬렉션이다. 개별 메시 372개, 내장 능직 텍스처 한 장, Blender 기본 글꼴로 만든 상호가 들어 있다. 단위는 미터, +X는 노란 병풍에서 의류 봉 쪽, −Y는 고객 쪽, +Z는 위다. glTF Y-up 변환 후 월드 Y축 회전은 −159.212904°다. 월드 배치 원점은 (−61.166174, 29.360000, −11.702072)이며 실내 전용 장면의 기준 높이는 26.2m다.

## 빌드와 검증

저장소 루트에서 Blender 3.6.23과 프로젝트의 Node 패키지를 사용한다.

```sh
D=assets/models/ssg-archive-tailoring
"${GTW_BLENDER_BIN:-blender}" -b --factory-startup --gpu-backend opengl --python-exit-code 1 -P "$D/build.py"
node "$D/pack.mjs"
node tests/smoke.mjs shinsegae
node tests/smoke.mjs gotomall shinsegae
```

상세 GLB는 552,148바이트, 삼각형 32,458개, 드로콜 2회다. 바닥 띠를 평면으로 만들고 작은 글자의 곡선 분할을 줄여 87,952바이트를 절약했다. 대체 진열은 공용 로더가 한 메시로 합친다. 일반 플레이에서 7층 같은 위치와 6층 신관 원거리에서는 상세 파일 요청이 없었고, 매장 안 촬영 위치에서는 한 번 요청했다. 두 smoke 테스트가 모두 OK를 출력했다.
