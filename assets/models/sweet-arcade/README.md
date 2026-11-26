# 스위트 파크 디저트 홀 기둥

신세계 사진에서 디저트 진열대 옆의 크림색 타일 기둥은 서로 만나는 아치를 받친다. 기단과 기둥머리는 짙은 금속색이고, 세로 홈 옆에는 원반 두 개를 포갠 벽등이 달려 있다. 게임에서도 기존 아치가 만나는 세 곳에 이 형태를 넣었다. 높이 3.5m와 간격은 게임의 천장과 통로에 맞춘 근사값이다. [신세계그룹 뉴스룸 현장 기사](https://www.shinsegaegroupnewsroom.com/go-field-life-dessert-renewal-2/) · [기둥과 디저트 매대 사진](https://images.shinsegaegroupnewsroom.com/wp-content/uploads/2025/09/ss3_image_68c8e1040f114.png)

게임 주소는 `#/centralcity/B1?destination=sweet-park`이다. 매대 옆에서 기둥머리와 벽등을 보려면 `#/centralcity/B1?p=-45.439,-6,79.541,-158.661`을 연다. [두 시점의 수정 전후 화면](comparison.jpg)

원본은 `pier.blend`의 `SweetParkArcadePier` 컬렉션이다. 이 폴더에서 `blender -b pier.blend --python-exit-code 1 -P export.py`를 실행하면 게임용 모델이 갱신된다. 게임에서는 기둥 세 개가 같은 모델을 공유한다.
