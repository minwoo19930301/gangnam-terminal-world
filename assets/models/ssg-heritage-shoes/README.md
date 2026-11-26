# 신세계 강남점 버윅

[6층 일반 플레이](http://127.0.0.1:8765/?pos=-47.412675,26.2,100.969561&yaw=-165.820321&pitch=-10#/shinsegae/6F) · [매장 전경](game.jpg) · [슈케어 진열대 근접 화면](care.jpg) · [카메라 좌표](camera.json)

신세계 강남점 층별 안내에는 버윅이 6층 구두 매장으로 등록돼 있다. 버윅코리아의 2024년 강남점 리뉴얼 사진에서 벽 세 면을 잇는 밝은 선반, 둥근 가죽 진열대의 높이 차, 격자 카펫을 확인했다. 매장과 상품 치수, 색상별 수량, 슈케어 도구의 위치는 게임 공간에 맞춰 재구성했다. [신세계 층별 안내](https://www.shinsegae.com/store/floor.do?storeCd=SC00002) · [버윅 강남점 리뉴얼 기록](https://berwickkorea.com/article/journal/14/10535/) · [매장 전경 원본](https://berwickkorea.com/journal2/240224_03.png)

진열한 구두 40짝은 5341 플레인토 더비를 바탕으로 만들었다. 앞코 들림에서 허리가 잘록해지는 창까지 단면을 이어 만들고 갑피와 웰트를 분리했다. 중앙의 네 짝에는 발등 구김, 웰트의 바늘땀, 적층 굽과 구멍에 걸친 구두끈을 더했다. 지점 시연 사진에서는 광택을 낸 앞코와 외날 끈, 구두 안에 끼운 슈트리가 보인다. [강남점 시연 접사](https://berwickkorea.com/journal2/240224_14.png) · [5341 브라운](https://berwickkorea.com/product/5341/1159/) · [5341 블랙](https://berwickkorea.com/product/5341/1169/)

중앙에는 너도밤나무 슈트리의 앞꿈치를 두 조각으로 나눠 황동색 연결관과 뒤꿈치 손잡이가 드러나게 놓았다. 옆에는 나무 손잡이에 털다발을 심은 광택 솔과 크림 단지가 있다. [슈트리 상품 사진](https://berwickkorea.com/web/product/big/202512/6a9a99c93c31bfe17854bcf0f62cdea6.jpg) · [말털 솔](https://berwickkorea.com/product/horsehair-brush/549/category/35/display/1/) · [진열대 앞으로 이동](http://127.0.0.1:8765/?pos=-46.887682,26.2,102.043144&yaw=-165.640935&pitch=-48#/shinsegae/6F)

## 조립과 재생성

편집 원본은 `gallery.blend`의 `SSG_6F_Berwick` 컬렉션이다. 메시 오브젝트 1,273개와 직접 만든 카펫 직조 텍스처가 들어 있다. Blender 좌표에서 +X는 뒷선반을 따라 오른쪽, −Y는 매장 입구, +Z는 위이며 단위는 미터다. glTF Y-up 변환 후 월드 +Y축으로 −159.222148° 회전한다. 논리 원점 (−46.432524, 26.2, 104.426698)에 지형 높이를 적용한 렌더 원점은 (−46.432524, 25.292000, 104.426698)이다.

Blender 3.6.23에서 생성과 재개방을 확인했다. 상호는 macOS의 Times New Roman을 메시로 변환했다. 해당 폰트가 없는 환경에서 다시 생성하면 Blender 내장 서체를 쓴다. 저장소 루트에서 실행한다.

```sh
D=assets/models/ssg-heritage-shoes
"${GTW_BLENDER_BIN:-blender}" -b --factory-startup --gpu-backend opengl --python-exit-code 1 -P "$D/build.py"
node "$D/pack.mjs"
node tests/smoke.mjs shinsegae
node tests/smoke.mjs gotomall shinsegae
```

일반 선반의 구두는 굽을 한 겹으로 합치고 단면 수를 줄였다. GLB는 587,120바이트, 삼각형 56,557개, 재질별 드로 호출 4회다. 상세 갑피 메시 이름은 `BerwickGoodyearCalf`다. 같은 층에서 11m 이내이고 진열대가 시야에 들어오면 상세 모델을 요청한다. 22m까지는 간략 진열 모형을 사용한다.
