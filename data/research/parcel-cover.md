# 외부 부지와 식생 자료

공동주택·학교·상업지·광장의 경계에는 OpenStreetMap contributors의 ODbL 데이터를 사용했습니다. 도로·보행로·건물·운동장·지상 주차장의 경계도 같은 자료를 사용했습니다. [OpenStreetMap 저작권 안내](https://www.openstreetmap.org/copyright)

녹지 윤곽은 2025년 7월 10일 Sentinel-2C의 적색·근적외선 영상에서 추출했습니다. Contains modified Copernicus Sentinel data (2025). 원본의 픽셀 간격은 10m이며, 경계에서 도로·건물·별도로 그리는 시설을 제외했습니다. 작은 화단의 위치나 포장재의 종류는 영상에서 구분하기 어렵습니다. [Sentinel-2 장면 S2C_52SCG_20250710_0_L2A](https://earth-search.aws.element84.com/v1/collections/sentinel-2-l2a/items/S2C_52SCG_20250710_0_L2A) · [Copernicus 이용 조건](https://dataspace.copernicus.eu/terms-and-conditions)

나무의 위치와 높이는 Meta and World Resources Institute (WRI), *Version 2 High Resolution Canopy Height Maps* (2026)에서 추정했습니다. Source imagery for CHM © 2016 Vantor. 2026년 11월 26일 이용했습니다. 수관 높이에서 국소 최댓값을 선택하고 2025년 녹지와 겹치는 지점만 남겼습니다. 나무 한 그루의 줄기 위치나 수종을 측량한 자료는 아닙니다. 최근 재건축한 단지로 식별된 곳에서는 이전 수관을 사용하지 않습니다. [원본 데이터](https://registry.opendata.aws/dataforgood-fb-forestsv2/) · [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/)

`tools/import_parcel_cover.py`는 터미널 주변 필지와 그 밖의 필지를 `js/parcel-cover-terminal.js`, `js/parcel-cover-outer.js`로 나누고 터미널 영역 경계를 함께 기록합니다. 블렌더와 지도 검증 도구는 `js/parcel_cover.js`를 통해 전체 자료를 읽습니다.
