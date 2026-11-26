# 신세계 강남점 B1 오크베리 아사이

강남점 방문 사진에서 보이는 곡면 월넛 하부장과 세로살, 미색 석재 상판, 보라색 기둥 위의 흰 유리 조명, 앞쪽의 OAKBERRY AÇAÍ 글자를 기존 델리 구획에 맞췄다. 상판에는 아사이 컵과 과일 토핑, 메뉴 카드와 식물을 따로 뒀다. 정면 길이 4.8m와 깊이 0.95m는 게임의 진열대에 맞춘 치수다. [강남점 방문자가 찍은 사진](https://geniusjw.com/3384) · [오크베리 지점 안내](https://www.oakberry.com/locator-map) · [신세계 11월 25일 B1 도면](https://www.shinsegae.com/cms12/SC00002/guide/floor/__icsFiles/afieldfile/2026/11/25/GnV7UuBEdq7K.png)

기존 지도에서는 이 구획의 중심에 도착해 아무 키를 누르지 않아도 에스컬레이터 쪽으로 밀렸다. 지도에 서서 볼 수 있는 쪽의 입구를 등록했다. 뉴코아 5층에서 M을 누르고 ‘오크베리 아사이’ 또는 ‘OAKBERRY’를 찾으면 도착한다. 게임의 야간 모드에서 5초간 제자리에 서 있는 동안 B1 높이와 위치를 유지했고, 카운터 쪽으로 걷고 물러설 수 있었다. [도착 시점 전후](comparison.jpg) · [Blender 원본 렌더](studio.jpg)

`counter.blend`의 `GangnamOakberryCounter` 컬렉션에는 분리된 목재·석재·등기구·과일 메시와 수정 가능한 입체 글자가 있다. 편집 후 아래 명령으로 웹용 정점색 표면을 다시 만든다. 상세 표면의 크기는 85,852바이트, 삼각형은 14,538개다.

```sh
blender --factory-startup -b counter.blend --python-exit-code 1 -P export.py
```
