# 신세계 강남점 아크테릭스

8층 신관 아크테릭스에 들어서면 왼쪽에는 방수 재킷, 가운데에는 등산 배낭과 밑창을 세워 놓은 석재 진열대, 오른쪽에는 등산화와 피팅 벤치가 보인다. [일반 플레이 카메라](http://127.0.0.1:8765/?pos=-60.47634921848843,35.8,69.27893529401399&yaw=112.37882518492478&pitch=-9#/shinsegae/8F) · [게임 화면](game.jpg) · [카메라 수치](camera.json)

## 장소와 제품 근거

- 아크테릭스 코리아는 매장을 강남점 신관 8층으로 안내한다. 신세계의 2023년 개편 자료에는 이 매장의 의류와 신발 구성이 기록돼 있다. 저장된 층별 안내의 매장명은 ‘아크테릭스’, 분류는 ‘레져스포츠’다. [브랜드 매장 안내](https://arcteryx.co.kr/location/123) · [신세계 층별 안내](https://www.shinsegae.com/store/floor.do?storeCd=SC00002) · [신세계 뉴스룸](https://www.shinsegaegroupnewsroom.com/shinsegae-gangnam-premium-sports-store/)
- 2023년 7월 강남점 현장 사진에서 왼쪽 검은 프레임의 색색 재킷, 중앙의 아래가 좁은 석재 진열대, 뒤쪽 회색 벽과 배낭, 오른쪽의 밝은 패널에 두 열로 놓인 신발을 확인했다. 게임 구획에서는 신발 패널을 뒤쪽 오른편으로 옮겨 통로에서 제품 옆면이 보이도록 했다. [현장 사진 원본](https://tnnews.co.kr/wp-content/uploads/2023/07/IMG_54210.jpg) · [촬영 지점과 매장을 설명한 기사](https://tnnews.co.kr/archives/146641)
- 배낭 7개에는 알파 FL 30의 상단 압축 스트랩, 앞면의 교차 번지 코드와 등판에서 떨어진 어깨끈을 표현했다. 하나는 뒤로 돌려 등판을 보여 준다. [알파 FL 30 제품 설명](https://arcteryx.com/us/en/shop/alpha-fl-30-backpack-0349) · [등판 사진](https://images.arcteryx.com/details/1350x1710/F26-X000010349-Alpha-FL-30-Backpack-Black-Back.jpg)
- 컨실 접근화 13짝 중 1짝은 밑창을 세워 앞쪽의 넓은 접지면과 뒤쪽의 돌기를 볼 수 있다. 옆면에는 갑피를 감싸 올라오는 고무와 앞코 가까이 이어지는 끈을 넣었다. [컨실 제품 설명](https://arcteryx.com/us/en/shop/mens/konseal-shoe-9834) · [옆면](https://images.arcteryx.com/details/1350x1710/F26-X000009834-Konseal-Shoe-Forage-Black-Profile.jpg) · [밑창](https://images.arcteryx.com/details/1350x1710/F26-X000009834-Konseal-Shoe-Forage-Black-Sole.jpg)

재킷 8벌의 색 배치는 사진을 참고했다. 슬링에 건 카라비너 5개는 등반 장비의 형태를 보여 주는 일반 견본이다. 카라비너의 제조사와 이 지점 판매 여부, 피팅 벤치와 발받침, 제품별 색상·수량·치수는 현장에서 확인하지 못해 게임용으로 구성했다.

## 월드 조립과 재생성

편집 원본은 `gallery.blend`의 `SSG_8F_Arcteryx` 컬렉션이며 개별 메시 오브젝트 1,151개다. 단위는 미터이며 Blender +X는 신발 벽 쪽, −Y는 진열 정면, +Z는 위다. glTF Y-up 변환 뒤 게임 월드 +Y축을 기준으로 +111.035994° 회전한다. 논리 원점 (x, y, z)은 (−63.554065, 35.8, 70.562513)이다. 지형 보정을 사용하는 전체 월드에서는 렌더 루트 y가 34.892다.

저장·내보내기와 원본 다시 열기는 Blender 3.6.23에서 확인했다. 글자는 macOS의 Arial Bold를 메시로 변환했다. 저장소 루트에서 실행한다.

```sh
D=assets/models/ssg-outdoors
"${GTW_BLENDER_BIN:-blender}" -b --factory-startup --gpu-backend opengl --python-exit-code 1 -P "$D/build.py"
node "$D/pack.mjs"
node tests/smoke.mjs shinsegae
node tests/smoke.mjs gotomall shinsegae
```

런타임 파일은 156,720바이트, 삼각형 44,668개, 불투명 재질 2개와 드로콜 2회다. 편집 원본에서 색을 정점에 구운 뒤 돌기·끈·석재 모서리의 중복 정점을 합치고 meshopt로 압축했다. 원거리 진열은 한 번에 그린다. 공용 로더는 같은 층 11m 안에서 진열이 보일 때 상세 모델을 요청하며, 등록한 메시 이름은 `ArcOutdoorEquipment`와 `ArcOutdoorFixtures`다.

두 smoke 테스트 모두 OK. 일반 플레이에서 7층 같은 위치와 8층 엄브로에서는 해당 GLB 요청이 0건, 아크테릭스 촬영 위치에서는 1건이었다.
