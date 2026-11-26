# 신세계 강남점 브루넬로 쿠치넬리 남성 부티크

[6층 일반 플레이 카메라](http://127.0.0.1:8765/?pos=-70.57201,26.2,10.67837&yaw=113.8545&pitch=-3#/shinsegae/6F) · [매장 전경](game.jpg) · [일반 플레이 의류 근접 화면 세 장](fabrics.jpg) · [라운지 의자 화면](upholstery.jpg) · [카메라 좌표와 메시 이름](camera.json)

신세계는 2018년 7월 강남점 본관 6층 남성 단독 매장의 개점 사진을 공개했다. 밝은 벽감 안에 가로로 건 행거, 위 선반의 액자, 원목 바닥과 패브릭 의자가 보인다. 게임에서는 기존 6층 매장 안에 벽감 두 칸을 두고 세 벌은 정면으로, 여섯 벌은 비스듬히 걸었다. 액자 그림, 치수와 진열 순서는 사진을 참고해 구성했다. 당시 사진으로 현재 재고나 가구 배치까지 확인할 수는 없다. [신세계 강남점 층별 안내](https://www.shinsegae.com/store/floor.do?storeCd=SC00002) · [신세계 개점 기사](https://www.shinsegaegroupnewsroom.com/brunello-cucinelli-new-world-gangnam/) · [강남점 실내 원본 사진](https://images.shinsegaegroupnewsroom.com/wp-content/uploads/2025/08/brunello-cucinelli-new-world-gangnam.jpg)

- 카발로 홉색 재킷은 아이보리 몸판의 곡면을 따라 노치 라펠을 접고, 가장자리에 피크 스티치를 넣었다. 버건디 포켓스퀘어, 티켓 포켓, 뿔단추 구멍과 그 안의 단추 실을 따로 모델링했다. [브루넬로 쿠치넬리 카발로 재킷](https://shop.brunellocucinelli.com/en-us/men/ready-to-wear/blazers/hopsack-deconstructed-blazer-261MZ4037BWDC042.html)
- 캐시미어 크루넥은 목둘레를 낮게 파고 가는 잉글리시 립과 팔꿈치에 모이는 주름을 입혔다. 소맷단에는 가는 배색 선을 둘렀다. [브루넬로 쿠치넬리 잉글리시 립 니트](https://shop.brunellocucinelli.com/en-us/men/ready-to-wear/knitwear/cashmere-english-rib-sweater-262M2229510CW42510.html)
- 코냑색 스웨이드 봄버의 양방향 지퍼는 위아래가 벌어진다. 베이지 니트 소매, 뒤로 접힌 후드의 와인색 안감과 조임끈 고리, 비스듬한 주머니의 좁은 입술을 만들었다. [브루넬로 쿠치넬리 스웨이드 봄버](https://shop.brunellocucinelli.com/en-gb/men/ready-to-wear/coats-jackets/suede-bomber-jacket-with-quilting-262MPCLF2053CIW1906.html)

원단에는 직접 그린 홉색의 씨실과 날실, V자 니트 골, 방향에 따라 달라지는 스웨이드의 털결을 썼다. 제품의 세부와 색상은 제조사 상품 사진을 참고했으며, 여기에 걸린 세 벌은 카탈로그를 토대로 구성했다. [홉색과 라펠 접사](https://media.brunellocucinelli.com/brunellocucinelli-dynamic/image/upload/f_jpg,q_85,w_650/261MZ4037BWDC042_D.jpg) · [니트와 팔꿈치 접사](https://media.brunellocucinelli.com/brunellocucinelli-dynamic/image/upload/f_jpg,q_85,w_650/262M2229510CW425_D.jpg) · [후드·지퍼 접사](https://media.brunellocucinelli.com/brunellocucinelli-dynamic/image/upload/f_jpg,q_85,w_650/262MPCLF2053CIW19_D.jpg)

옆의 낮은 의자는 좌판·좌방석·양쪽 팔걸이·등받이 다섯 부분으로 조립했다. 각 모서리에 둥근 파이핑을 둘렀고, 린넨 짜임과 목재 받침 결을 분리했다. 매장 사진을 바탕으로 그린 가구여서 정확한 원단 사양과 목재 수종은 추정이다. [게임에서 의자 앞에 서기](http://127.0.0.1:8765/?pos=-70.93139,26.2,12.58836&yaw=146.0237&pitch=-43.1377#/shinsegae/6F)

## 원본 조립과 재생성

`gallery.blend`의 `SSG_6F_Brunello_Cucinelli` 컬렉션에 편집 가능한 메시 오브젝트 970개가 있다. 미터 단위이며 Blender +X는 보조 행거 방향, −Y는 의류 정면, +Z는 위다. glTF Y-up 변환 뒤 게임 +Y축으로 110.992104° 회전한다. 논리 루트 (−72.771492, 26.2, 11.644942)에 지형 보정 3.16m를 적용한 전체 월드 렌더 루트는 (−72.771492, 29.36, 11.644942)다.

Blender 3.6.23 헤드리스에서 제작·재개방을 확인했다. 원단 색상·요철 아틀라스 두 장이 원본 안에 들어 있다. 가까운 정면에서 보이는 지퍼의 개별 이빨은 상세 모델에만 남기고, 옆으로 겹쳐 건 옷에는 연속된 체인 단면을 사용했다. 상호 글자는 Blender 내장 폰트를 사용한다. 저장소 루트에서 실행한다.

```sh
D=assets/models/ssg-designer-menswear
"${GTW_BLENDER_BIN:-blender}" -b --factory-startup --gpu-backend opengl --python-exit-code 1 -P "$D/build.py"
node "$D/pack.mjs"
node tests/smoke.mjs shinsegae
node tests/smoke.mjs gotomall shinsegae
```

옆으로 걸린 옷은 정면 진열보다 골의 수를 줄였다. meshopt 압축 후 GLB는 805,176바이트, 삼각형 55,550개, 불투명 메시·재질 각 4개, 드로콜 4회다. 같은 층 22m 안에서는 대체 진열을 한 번에 그리며 11m 안에서 화면에 들어오면 상세 모델을 요청한다. 일반 플레이에서 7층 같은 위치와 6층 로로피아나에서는 해당 요청이 0건, 촬영 위치에서는 1건이었다. 두 smoke 테스트 모두 OK였다.
