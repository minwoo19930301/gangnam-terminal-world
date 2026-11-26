# JW 메리어트 더 라운지의 그랜드 피아노

8층 창가의 검은 그랜드 피아노와 의자를 [Blender 원본](./grand.blend)으로 만들었다. 건반 88개에는 A0에서 C8 순서로 흑건 36개가 놓인다. 열린 상판 밑에는 저음 권선과 고음 현, 울림판, 프레임과 브리지가 보인다. 악보대, 황동 페달 세 개와 쌍바퀴, 가죽 단추가 달린 의자도 개별 메시다. 호텔의 라운지 안내와 기존 현장 사진 판독에 따라 자리를 잡았다. 악기의 실제 제조사와 치수는 미확인으로, 내부 부품은 일반적인 그랜드 피아노 구조를 참고했다. [호텔 다이닝 안내](https://www.marriott.com/ko/hotels/seljw-jw-marriott-hotel-seoul/dining/) · [라운지 사진 판독 기록](../../../data/research/jwmarriott.json) · [그랜드 피아노 구조](https://www.yamaha.com/en/musical_instrument_guide/piano/mechanism/)

[게임 화면](./lounge.jpg). 8층에서 피아노를 바라보고 14m 안에 들어오면 근접 모델을 한 번 불러온다. 18m 밖이나 다른 층에서는 간략한 형상을 쓴다. 두 거리 모두 피아노와 의자를 한 번에 그린다.

```sh
blender -b --factory-startup -t 2 --python-exit-code 1 -P assets/models/lounge-piano/build.py
node assets/models/lounge-piano/check.mjs
```
