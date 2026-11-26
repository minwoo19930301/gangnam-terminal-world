# 모던하우스 강남점의 피크닉 러그 진열

뉴코아 강남점 1관 4층 홈데코 매대에 연두색과 파란색 러그를 걸었다. 서울관광재단의 지점 사진에서 딸기·데이지 무늬, 양옆이 들어간 러그의 모양, 은색 집게, 왼쪽의 주름진 면포와 바구니, 아래 선반의 분홍 매트를 확인했다. 무늬 간격과 가구 치수, 4층 안의 정확한 진열 위치는 게임 공간에 맞춰 정했다. [지점 소개](https://korean.visitseoul.net/gangnam/modernhouse-life/KOPw8jvg2) · [참고한 세 번째 사진](https://korean.visitseoul.net/comm/getImage?srvcId=MEDIA&parentSn=81851&fileTy=MEDIA&fileNo=2)

[게임에서 진열 앞에 서기](https://minwoo19930301.github.io/gangnam-terminal-world/?pitch=-8#/newcore/4F?p=277.7417,14.2,-355.6553,-62.58) · [같은 시점의 게임 화면](play.jpg)

[Blender 원본](picnic.blend)에서 파일 원단의 둘레와 고리실, 꽃잎, 딸기씨, 집게, 선반과 바구니를 개별 편집할 수 있다. 게임은 진열대 정면 9m 안에서 시야에 들어온 경우 169,104바이트의 메시 한 개를 읽는다. 근접 메시에는 14,569개의 삼각형이 있다. 위층, 뒤쪽, 시야 밖과 먼 거리에서는 간략한 외형을 사용한다.

편집한 원본을 내보내고 게임에서 확인하려면 저장소 루트에서 실행한다.

```sh
blender -b assets/models/modernhouse-picnic/picnic.blend --python-exit-code 1 -P assets/models/modernhouse-picnic/export.py
node assets/models/modernhouse-picnic/check.mjs
```
