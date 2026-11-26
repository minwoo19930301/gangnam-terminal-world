# 더 라운지의 크림색 코너 소파

[게임 화면](./seating.jpg) · [Blender 편집 원본](./sofa.blend). JW 메리어트 서울의 공식 다이닝 사진과 이 프로젝트의 기존 라운지 사진 판독을 참고했다. 기존 창가 코너 소파의 두 변을 따라 목재 받침, 분리 좌방석 11개, 크림색 등쿠션 11개와 테라코타·샴페인 계열 장식 쿠션 9개를 제작했다. 쿠션의 중심은 부풀리고 봉제선과 모서리는 좁혔다. 치수와 쿠션 개수는 가상 라운지 배치에 맞춘 값이다. [호텔 사진](https://www.marriott.com/en-us/hotels/seljw-jw-marriott-hotel-seoul/photos/) · [기존 라운지 판독](../../../data/research/jwmarriott.json)

게임에서 두 소파의 기존 충돌 영역을 유지하고, 16m 안에서 좌석이 보일 때 근접 모델을 받아 한 번에 그린다. 연결된 커튼과 소파는 각기 독립적으로 로딩한다.

```sh
blender -b --factory-startup -t 2 --python-exit-code 1 -P assets/models/lounge-upholstery/build.py
node assets/models/lounge-upholstery/check.mjs
```
