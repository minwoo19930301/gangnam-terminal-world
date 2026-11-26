# 뉴코아아울렛 강남점 2관 5층 AK골프

지도에서 ‘AK골프’나 ‘AKGOLF’를 검색하면 매장 앞에 선다. 통로 왼쪽에 클럽 헤드가 보이고, 오른쪽에는 캐디백, 안쪽에는 나무살 벽과 흰 상호가 보인다. [게임에서 입장](https://minwoo19930301.github.io/gangnam-terminal-world/#/newcore/5F?p=222.62222,18.6,-459.31741,107.98195,-2) · [같은 위치에서 본 낮·밤 전후](comparison.jpg) · [Blender 진열대와 벽면](studio.jpg)

## 위치와 사진

이랜드 지점 안내에서 1관과 2관의 고객용 최상층은 5층이다. 2관 5층은 남성·골프 층이며, 층별도에는 로가디스 옆에 ‘AK 골프’가 표시되어 있다. AK골프 지점 안내에서도 강남뉴코아점의 층을 확인할 수 있다. [이랜드 1관 층별안내](https://www.elandretail.com/store02.do?branchID=00110001&lang=000600KO) · [2관 층별안내](https://www.elandretail.com/store02.do?BDID=0003002B&branchID=00110001&lang=000600KO) · [2관 5층 도면](https://www.elandretail.com/upload/20261111151159_0.jpg) · [AK골프 강남뉴코아점](https://pf.kakao.com/_rxcjys)

2023년 12월 방문 사진에서 검은 다단 클럽 받침, 위로 향한 은색 헤드, 긴 샤프트, 세워 놓은 캐디백, 모자 선반, 화면 두 대와 나무살 위 흰 상호를 확인했다. 아이언 홈과 호젤, 백의 주머니와 어깨끈, 모자 챙은 가까이에서 구분된다. 진열 수량·색과 받침 치수는 게임 매장에 맞춘 근사치다. 두 화면 속 페어웨이 그림은 재구성했다. [강남뉴코아점 방문 사진](https://obgolfer.tistory.com/88) · [브랜드 상표 원본](https://www.akgolf.co.kr/resources/assets/images/common/logo.png)

## 편집과 배치

`showroom.blend`의 `AKGolfGangnam` 컬렉션에 클럽 받침, 캐디백, 상호·모자 선반, 천장 집기가 나뉘어 있다. 통합 도시는 `assets/models/world/indoor-layout.mjs`에서 이 컬렉션을 게임과 같은 회전·높이에 연결한다. 독립 파일의 카메라와 촬영 조명은 컬렉션 밖에 있다. 이 디렉터리에서 다음 명령으로 편집한 원본을 게임용 파일로 다시 내보낼 수 있다.

```sh
blender -b --factory-startup -t 4 showroom.blend --python-exit-code 1 -P export.py
```

게임용 메시는 27,620삼각형, 한 번에 그리는 정점색 메시 하나(288,912바이트)다. 매장 쪽을 바라보며 15m 이내로 접근하면 정밀 모델을 요청한다. 같은 층에서 매장에 등을 돌린 상태나 다른 층에서 처음 입장할 때는 요청하지 않는다. 중앙 통로는 그대로 걸을 수 있고 클럽 받침과 캐디백 진열대 가장자리에는 충돌면이 있다.
