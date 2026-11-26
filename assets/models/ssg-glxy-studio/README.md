# GLXY studio · 신세계 강남점 7층

2026년 9월 4일 강남점에 연 GLXY studio의 개점 사진을 기준으로 매장을 만들었다. 밝은 목재 벽에 붙은 흰 글자, 검은 사각 진열 프레임, 입구의 G핏 바지 마네킹과 흰 스니커, 옆 석재 매대의 붉은 니트와 짙은 갈색 구두가 한눈에 들어온다. 근거 사진에는 ‘신세계백화점 강남점 전경’과 사진 제공자 삼성물산이 명시돼 있다. [삼성물산 제공 강남점 사진과 개점 보도](https://ir.newspim.com/news/view/20260907000042) · [삼성물산의 강남점 매장 안내](https://retail.samsungfashion.com/deptdetail.do?DEPT_ID=DI_0000003&LOC_ID=RG_0000001&SPOT_ID=DS_0000031) · [신세계 강남점 공식 층별 안내](https://www.shinsegae.com/store/floor.do?storCd=SC00002)

게임의 기존 7층 매장 경계에 맞춰 행거 간격, 옷 수량과 위치를 정했다. 개점 당시 발표된 약 32㎡는 현장 매장의 규모다. 게임의 도면을 맞춘 구역은 약 51㎡로 더 넓다. 바지 주름과 주머니·허리띠, 스니커 끈, 매대의 돌결·목재 패널과 빛나는 상호는 직접 제작했다. 사진 속 상품 종류와 색은 참고했으며 개별 상품 번호와 판매 재고는 확인하지 않았다.

[일반 통로에서 본 입구](../../../index.html#/shinsegae/7F?p=-35.99510,31,80.70119,111.12044,0) · [매대와 바지의 눈높이 시점](../../../index.html#/shinsegae/7F?p=-38.07356,31,81.36962,91.20219,-17) · [낮·밤 전후 비교](comparison.jpg) · [편집 원본 렌더](native.jpg)

기존 매장도 밤에는 밝았지만, 다른 점포와 같은 단색 티셔츠·나무 탁자와 복도 머리 위의 검은 간판이 보였다. 이제 매장 안쪽의 상호와 실제 개점 사진에 있던 상품으로 구별할 수 있다. 룩북 사진은 모델과 텍스처에 사용하지 않았다. 목재 글자와 천장등에 발광 재질을 썼고, 옷과 신발이 만나는 부분의 음영은 Blender에서 버텍스 색으로 구워 한 번에 그리도록 했다.

지도에서 ‘GLXY studio’를 선택하면 안내판과 붙어 있는 바지 마네킹의 오른쪽에서 시작한다. 그 자리에서 행거 사이로 걸어갔다 돌아올 수 있다. 옆 통로로 이동하면 사각 프레임과 매대가 측면에서 보인다.

[편집 원본](gallery.blend)의 매장 컬렉션은 `SSG_7F_GLXY_Studio`이며 게임 그룹은 `GLXY studio · G핏 바지와 진열대`다. 편집용 미리보기 카메라와 조명은 이 컬렉션 밖에 있다. [카메라와 컬렉션 매핑](camera.json)에 앞 통로 시점을 기록했다.

```sh
blender -b --factory-startup -t 4 --python-exit-code 1 -P assets/models/ssg-glxy-studio/build.py
blender -b --factory-startup assets/models/ssg-glxy-studio/gallery.blend -t 4 --python-exit-code 1 -P assets/models/ssg-glxy-studio/export.py
node assets/models/ssg-glxy-studio/check.mjs
```
