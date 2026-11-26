# JW 메리어트 서울 8층 더 라운지 라탄 암체어

[lounge-chair.blend](lounge-chair.blend)에서 등받이의 이중 테와 꽃 문양, 팔걸이의 말린 끝, 받침의 교차 살을 곡선으로 편집할 수 있습니다. 좌판과 모브색 등쿠션은 별도 메시입니다. 호텔 공식 다이닝 안내와 프로젝트의 기존 8층 사진 판독 기록을 참고했습니다. 팔걸이와 봉제선의 단면, 좌석 크기와 수량은 게임을 위한 재구성입니다. [메리어트 공식 라운지 안내](https://www.marriott.com/ko/hotels/seljw-jw-marriott-hotel-seoul/dining/) · [기존 사진 판독 기록](../../../data/research/jwmarriott.json) · [같은 위치에서 본 게임 화면](review.jpg)

멀리서는 같은 원본에서 단순화한 290개 삼각형으로 한 의자를 표시합니다. 8층에서 가까운 좌석이 실제 화면에 들어오면 게임이 약 51KB의 압축 모델을 한 번 받아 다섯 좌석에서 공유합니다. 두 모델은 같은 인스턴스 배치를 사용합니다.

Blender에서 저장한 뒤 아래 명령을 실행하면 웹용 모델과 원거리 형상을 함께 갱신합니다.

```sh
blender -b assets/models/lounge-chair/lounge-chair.blend -P assets/models/lounge-chair/export.py
```
