# 신세계 강남점 밀레 가전 쇼룸

[일반 게임에서 보기](http://127.0.0.1:8765/?pos=-47.54173,40.6,92.83098&yaw=-139.10365&pitch=-13#/shinsegae/9F) · [게임 화면](game.jpg) · [검증 시점](camera.json)

신관 9층 가전 매장인 밀레를 재현했다. 가게나우/스메그의 작은 진열 구획 대신 아일랜드와 제품 앞에 보행 공간을 확보할 수 있는 밀레 구획을 골랐다. 폴더명은 검증용으로 유지했다. [신세계 강남점 층별 안내](https://www.shinsegae.com/store/floor.do?storeCd=SC00002)

밀레코리아가 2025년 6월 23일 공개한 강남점 재개장 사진을 기준으로 삼았다. 흰 상판과 짙은 회색 서랍, 가운데 흡입구가 있는 인덕션, 열린 식기세척기의 식기 바구니와 손잡이, 스테인리스 냉장고 옆 와인셀러, 흰색 세탁·건조기 2단 진열이 보인다. 게임 공간에 맞춰 세탁·건조기를 뒷벽으로 돌렸고 상담 테이블은 생략했다. 제품 간격과 치수, 조작 패널의 표시값은 추정했다. [밀레코리아 강남점 사진 5장](https://pf.kakao.com/_gYxhnM/109815664) · [쇼룸 정면](https://k.kakaocdn.net/dn/b3Ksc6/btsOMPQvACw/KtTv5KIRvajFbUEhVGrGnK/img_xl.jpg) · [식기세척기 근접 사진](https://k.kakaocdn.net/dn/ujCq9/btsOOdQlMwV/RCpdVzZa99PhINRKVHBIK0/img_xl.jpg) · [밀레 마스터쿨 제품 자료](https://www.miele.co.kr/e/mastercool-1022130-h)

## 커피머신과 오븐 진열

재개장 정면 사진의 아일랜드 뒤쪽에는 검은색과 옅은색 커피머신이 나란히 있고, 오른쪽에는 검은 유리 오븐 진열이 보인다. 두 커피머신의 디스펜서와 이중 노즐, 물받이, 조작부를 구분해 만들었다. 오른쪽 오븐장은 게임의 기존 세탁기 앞 공간에 맞춰 길이를 줄였다. 머신의 정확한 품번과 오븐 구성 수량은 추정이다. 붉은 명판에는 밀레코리아의 흰색 벡터 워드마크를 사용했다. [강남점 정면 사진](https://k.kakaocdn.net/dn/b3Ksc6/btsOMPQvACw/KtTv5KIRvajFbUEhVGrGnK/img_xl.jpg) · [밀레 커피머신 제품 사진](https://shop.miele.co.kr/cm-6160-milkperfection-zid11584090/) · [공식 워드마크](https://shop.miele.co.kr/INTERSHOP/static/WFS/Miele-KR-Site/-/Miele/ko_KR/Miele_Logo.svg)

같은 위치에서 왼쪽은 기존 쇼룸, 오른쪽은 변경 후다. 윗줄은 12:30, 아랫줄은 22:00이다. 정면에서 각 1회, 같은 위치에서 뒤돌아 시작했을 때와 8층에서 시작했을 때는 각각 0회 모델을 요청했다. [게임 화면 전후 비교](comparison.jpg)

## 원본과 게임 배치

편집 원본은 `showroom.blend`, 컬렉션은 `SSG_9F_Miele`이며 메시 오브젝트 356개로 구성했다. 단위는 미터다. 원점은 매장 중앙 바닥으로, Blender +X는 정면에서 본 오른쪽, +Y는 뒷벽 방향, +Z는 위다. glTF Y-up 변환 후 게임 좌표 **(-45.63828, 40.6, 95.02866)** 에 배치하고 월드 +Y축으로 **-159.22145°** 회전한다.

게임용 `showroom.glb`는 244,404바이트, 삼각형 20,942개다. 캐비닛·금속·유리 마감별로 묶어 상세 모델은 3회, 간이 모델은 1회 그린다. 감독 렌더러로 확인한 밀레 매장 시점에서 GLB 요청 1건, 같은 수평 위치의 7층과 9층 원거리에서 각각 0건이었다. 세 시점 모두 페이지 오류가 없었다.

## 다시 만들기

저장소 루트에서 실행한다. 편집한 원본을 다시 내보낼 때는 첫 명령 대신 Blender로 `showroom.blend`를 열어 같은 폴더의 `export.py`를 백그라운드로 실행한다. 이번 편집과 재출력에는 Blender 4.5.11을 사용했다.

```sh
D=assets/models/ssg-smeg
blender -b --factory-startup --gpu-backend opengl --python-exit-code 1 -P "$D/build.py"
node "$D/pack.mjs"
node tests/smoke.mjs shinsegae
node tests/smoke.mjs shinsegae gotomall centralcity
```
