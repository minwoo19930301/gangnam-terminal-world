# JW 메리어트 서울 7층 더 마고 그릴 다이닝 의자

레스토랑 공식 갤러리의 ‘Dining Hall’ 사진에는 중앙 테이블을 둘러싼 짙은 갈색 의자가 보인다. 등받이와 팔걸이가 한 곡면으로 이어지고, 방석 앞단은 둥글며 다리 네 개는 바깥쪽으로 조금 벌어진다. 이 형태를 게임의 기존 4인 테이블 열두 곳에 맞췄다. 의자 크기와 봉제선은 사진을 참고해 재구성했다. [레스토랑 사진첩](https://themargauxgrill.jwmarriottseoul.com/en/photos) · [다이닝 홀 사진](https://mds-assets.marriott.com/cdn-cgi/image/f=auto/cms-platform-for-marriott/seljw-the-margaux-grill/site-images/migrated-images/tmg.jpg?width=1800&height=808)

[게임 안에서 본 주간·야간 변경 전후](comparison.jpg) · [게임 카메라](camera.json)

Blender 원본 `chair.blend`의 `MargauxDiningChair` 컬렉션에서 등받이, 방석, 파이핑, 다리를 각각 편집할 수 있다. 이 폴더에서 `blender -b chair.blend -P export.py`를 실행하면 게임용 메시를 내보낸다.

의자 48개는 같은 메시를 공유하고, 게임에서는 좌석 열마다 16개를 묶어 그린다. 13m 안에서 화면에 보이는 의자가 있으면 상세 파일을 한 번만 불러온다. 7층 반대편 모보 바에서 시작할 때는 상세 파일을 요청하지 않는다.
