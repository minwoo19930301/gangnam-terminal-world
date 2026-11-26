# 더 라운지의 묶은 커튼

호텔 공식 사진 속 크림색 좌석 뒤에는 회보랏빛 커튼 두 폭이 매달려 있다. 사진에서 보이는 위쪽 주름과 양쪽으로 묶인 중간, 바닥에서 다시 퍼지는 천을 참고해 [Blender 원본](./drapes.blend)을 제작했다. 양쪽 13줄의 주름, 접어 박은 단, 훅, 두 줄의 매듭과 태슬을 따로 편집할 수 있다.

게임에서는 기존 8층 좌석 뒤에 열린 칸막이로 두었다. 폭과 천장 높이, 기존 좌석과의 이격은 모델에 맞춘 값이다. 가까이에서 보일 때 근접 형상을 받고, 외곽선은 먼 거리에서도 유지한다. [호텔의 더 라운지 사진](https://www.marriott.com/en-us/hotels/seljw-jw-marriott-hotel-seoul/photos/) · [같은 자리에서 본 게임 화면](../lounge-upholstery/seating.jpg)

```sh
blender -b --factory-startup -t 2 --python-exit-code 1 -P assets/models/lounge-drapery/build.py
```
