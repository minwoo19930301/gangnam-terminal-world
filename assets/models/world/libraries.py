"""Link each original Blender model into an editable, metre-scale model gallery."""

from pathlib import Path
import json

import bpy
from mathutils import Vector


SHELVES = {
    "jw-retail-gallery": "JW 3층 · 백화점 연결 전시 갤러리",
    "g12-window-print": "고투몰 G12 · 지상 유리 점인쇄",
    "sinbanpo-plaza-planters": "신반포로 정문 앞 석재 화분과 전정 수목",
    "central-plaza-canopy": "센트럴시티 조각광장 개방형 캐노피",
    "central-plaza-seatwall": "센트럴시티 동측 석재 앉음벽과 생울타리",
    "central-plaza-lantern": "센트럴시티 조각 광장 두 갈래 보행등",
    "central-plaza-spheres": "센트럴시티 광장 세 구체 조형물",
    "central-plaza-granite": "센트럴시티 광장 판석 포장 견본",
    "exit8-sidewalk-lamp": "터미널 8번 출구 보도등",
    "banpo-stream-bridge": "반포천1교 · 보도 난간",
    "cinema-rotary": "원형 광장 · 카멜커피",
    "sweet-cake-counters": "스위트 파크 · 키친205와 쇼토",
    "chipotle-gangnam": "치폴레 강남신세계점 · 주문대",
    "five-guys-gangnam": "파이브가이즈 고속터미널 · 음료대",
    "house-entry-gallery": "하우스 오브 신세계 · 1층 청동 벽과 식재",
    "sweet-garden-soffit": "스위트 가든 · 에스컬레이터 하부",
    "sweet-arcade": "스위트 파크 · 디저트 홀 타일 기둥",
    "salt-house-gangnam": "소금집 샌드위치 강남점",
    "intelligentsia-gangnam": "인텔리젠시아 강남 · 커피 바와 오렌지 선반",
    "another-palm-astro": "어나더팜 · 아톰 에디션",
    "biscuiterie-mo": "스위트 파크 · 비스퀴테리 M.O 마들렌과 틴 진열장",
    "fortnum-tea-shop": "스위트 파크 · 포트넘앤메이슨 홍차 매장",
    "pompompurin-bakery": "스위트 파크 · 폼폼푸린 베이커리 카페",
    "buchang-walnut": "스위트 파크 · 부창제과 호두과자",
    "haz-bakery": "스위트 파크 · 하츠베이커리",
    "sweet-arabica": "스위트 파크 · %아라비카 입구",
    "ssg-ferragamo": "신세계 6층 · 페라가모 남성",
    "ssg-rawrow": "신세계 8층 · 로우로우 여행가방",
    "newcore-mamas": "뉴코아 3관 · 카페 마마스 외관",
    "newcore-oksoban-entry": "뉴코아 1관 5층 · 옥소반 입구",
    "newcore-yucheon": "뉴코아 1관 5층 · 유천냉면",
    "tailored-front": "경부선 7층 · 신사복 판매 전면",
    "knit-front": "경부선 8층 · 니트 판매 전면",
    "osulloc-matcha": "신세계 강남점 · 오설록 말차 스테이션",
    "ypbooks-rotary": "영풍문고 강남신세계점 · 원형 광장 입구",
    "banpo-apartments": "신반포로 · 아파트 세 단지",
    "megabox-central": "메가박스 센트럴 · B1 매표 로비",
    "gyeongbu-basket-display": "경부선 3층 · 꽃바구니 진열",
    "gyeongbu-flower-bank": "경부선 3층 · 생화 절지 진열대",
    "open-stage-coffer": "센트럴시티 1층 · 오픈 스테이지 격자 천장",
    "gyeongbu-waiting-ceiling": "경부선 1층 · 대합실 목재 루버와 매입등",
    "gyeongbu-planted-columns": "경부선 1층 · 대합실 식물 기둥",
    "goter-crossing": "신반포로 · 고터사거리 보행 신호주",
    "parka-rail": "경부선 유니클로 · 경량 파카 행거",
    "blouse-rail": "경부선 유니클로 · 시어서커 블라우스 행거",
    "seoul-city-bus": "신반포로 · 서울 간선버스",
    "gyeongbu-front-cafes": "경부선 정문 옆 · 이디야와 달리나인",
    "sinbanpo-bus-shelters": "신반포로 · 고속터미널 중앙정류소",
    "gyeongbu-front-entrance": "경부선 · 정문과 세로 명판",
    "daiso-accessories": "경부선 지하 1층 · 다이소 헤어와 청소용품",
    "halff": "파미에 2층 · 하프커피",
    "gotomall-west-seats": "고투몰 지하 1층 · 서편 휴게 광장",
    "gotomall-rest-garden": "고투몰 지하 1층 · 휴게 화단과 벤치",
    "gyeongbu-concourse-finish": "경부선 1층 · 대합실 공동 마감",
    "kims-deli": "뉴코아 2관 지하 1층 · 킴스클럽 델리",
    "gyeongbu-luggage": "경부선 1층 · 짐캐리",
    "dimdimsum": "호남선 중층 · 딤딤섬",
    "gyeongbu-childrens-aisle": "경부선 6층 · 아동복 상가",
    "gyeongbu-womens-aisle": "경부선 8층 · 여성복 상가",
    "gyeongbu-suiting-aisle": "경부선 7층 · 신사복 상가",
    "tamayura": "JW 2층 · 타마유라",
    "mobo-bar": "JW 7층 · 모보 바",
    "gyeongbu-hangaram": "경부선 지하 1층 · 한가람 액자",
    "gyeongbu-pharmacy": "경부선 1층 · 고속터미널약국",
    "daiso-garden": "경부선 지하 1층 · 다이소 화분과 조화",
    "margaux-garden-window": "JW 7층 · 더 마고 그릴 정원창과 유리 펜던트",
    "margaux-woodfire": "JW 7층 · 더 마고 그릴 화덕",
    "margaux-chair": "JW 7층 · 더 마고 그릴 다이닝 가죽 의자",
    "famille-shopfront": "파미에 1층 · 식당가 격자창과 석재 덧기둥",
    "margaux-cellar": "JW 7층 · 더 마고 그릴 와인 셀러",
    "gyeongbu-rooftop": "경부선 10층 · 포석정",
    "sebit-lounge": "고투몰 G2 · 고터·세빛 라운지",
    "damccot": "파미에 2층 · 담꽃",
    "gyeongbu-ticket-office": "경부선 1층 · 통합매표소",
    "modernhouse-picnic": "뉴코아 1관 4층 · 홈데코 러그",
    "modernhouse-kids": "뉴코아 1관 4층 · 키즈 침구",
    "modernhouse-provence": "뉴코아 1관 4층 · 마르셰 프로방스",
    "gyeongbu-icecream": "경부선 1층 · 배스킨라빈스",
    "kervan": "파미에 2층 · 케르반",
    "gyeongbu-boards": "경부선 1층 · 출발 안내 전광판",
    "bean-brothers": "파미에 2층 · 빈브라더스",
    "lounge-drapery": "JW 8층 · 더 라운지 주름 커튼",
    "lounge-upholstery": "JW 8층 · 더 라운지 코너 소파",
    "gyeongbu-pretzels": "경부선 1층 · 앤티앤스 진열",
    "gyeongbu-homewares": "경부선 2·4층 · 침구와 커튼",
    "lounge-piano": "JW 8층 · 더 라운지 피아노",
    "gyeongbu-apparel": "경부선 6~8층 · 도매 의류",
    "gyeongbu-cutflowers": "경부선 3층 · 절화와 도매 꽃통",
    "coach-cabin": "경부선 승차홈 · 고속버스 승객석과 차창",
    "oksoban-table": "뉴코아 1관 5층 · 옥소반 식탁",
    "famille-atrium": "파미에 광장 · 전광판·테라스와 포장",
    "gotomall-hessed": "고투몰 D-086 · 헤쎄드",
    "hypnos-showroom": "신세계 9층 · 히프노스 쇼룸",
    "gateaux": "JW 2층 파티세리 · 홀케이크와 쁘띠 가토",
    "patisserie": "JW 2층 파티세리 · 플랑과 마카롱",
    "daiso-merchandise": "다이소 주방·문구 매대",
    "gyeongbu-seating": "경부선 · 대합실 연석",
    "lounge-chair": "JW 8층 라운지 · 라탄 암체어",
    "ssg-market-prunier": "신세계 마켓 · 프루니에 캐비아",
    "ssg-market-butcher": "신세계 마켓 · 숙성 정육 진열장",
    "godiva-emack": "식품관 · 고디바 크레페와 에맥앤볼리오스",
    "guo-dumpling": "신세계 델리 · 구오 만두",
    "blue-butterfly": "신세계 델리 · 블루버터플라이",
    "kyoto-onimaru": "신세계 식품관 · 교토 오니마루",
    "shinsegae-facade": "신세계 북측 외벽 간판",
    "shared-ceiling": "공용 실내 · 흡음 천장패널",
    "upper-retail-finish": "신세계 상층 천장 마감",
    "interior-finish": "JW 현관 조명·고투몰 모자",
    "concourse-fixtures": "경부선 매표기·다이소 생활용품",
    "newcore-floor": "뉴코아 층판·바닥 마감",
    "architectural-retail": "신세계·뉴코아·경부선 건축",
    "street-and-lift": "신호등과 승강기",
    "daiso": "다이소",
    "gotomall": "고투몰 상점",
    "shinsegae": "신세계 상층 매장",
    "newcore": "뉴코아 매장",
    "gyeongbu": "경부선 시장·매표",
    "fleet": "자동차·버스",
    "visitors": "방문객",
    "perstige": "퍼스티지 중심상가",
    "hangang": "세빛섬",
    "escalator": "에스컬레이터",
    "staircase": "계단",
    "streetscape": "가로수와 가로등",
    "riverside-furniture": "수변 벤치·아치창",
    "onebailey": "원베일리 상점",
    "interior-architecture": "호텔·고투몰·파미에·호남선 실내",
    "neighborhood-shops": "반포·반원상가",
    "jwmarriott": "JW 메리어트",
    "famille": "파미에스테이션",
    "concourse-jewelry": "역 대합실·르본시티",
}


def grouped_visitors(groups):
    assembled = {}
    for group in groups:
        pose = "앉은 방문객" if group.name.startswith("sit") else "서 있는 방문객"
        label = pose + (" · 원거리" if group.name.endswith("Far") else "")
        if label not in assembled:
            assembled[label] = bpy.data.collections.new(label)
        assembled[label].children.link(group)
    return list(assembled.values())


def instance_bounds(instance, graph):
    # An inactive scene can report identity matrices for both a linked object
    # and its collection instance. Read evaluated transforms in the gallery.
    group = instance.instance_collection
    matrix = instance.evaluated_get(graph).matrix_world
    points = []
    for source in group.all_objects:
        if source.type not in {"MESH", "CURVE", "FONT"}:
            continue
        part = source.evaluated_get(graph)
        transform = part.matrix_world
        points.extend(matrix @ (transform @ Vector(corner) - group.instance_offset)
                      for corner in part.bound_box)
    return (Vector([min(p[i] for p in points) for i in range(3)]),
            Vector([max(p[i] for p in points) for i in range(3)]))


def arrange_shelves(gallery, shelves):
    previous = bpy.context.window.scene
    try:
        bpy.context.window.scene = gallery
        graph = bpy.context.evaluated_depsgraph_get()
        bounds = {o: instance_bounds(o, graph) for o in gallery.objects
                  if o.instance_collection}
        moving = {o for shelf in shelves for o in shelf.objects}
        row = min([0.0] + [lo.y - 6 for o, (lo, hi) in bounds.items() if o not in moving])
        for shelf in shelves:
            column, depth = 0.0, 0.0
            for obj in shelf.objects:
                low, high = bounds[obj]
                # Generated gallery entries are unparented collection instances.
                obj.location += Vector((column - low.x, row - high.y, -low.z))
                column += high.x - low.x + 2.5
                depth = max(depth, high.y - low.y)
            row -= depth + 6
    finally:
        bpy.context.window.scene = previous


def link_asset_gallery(world_dir):
    gallery = bpy.data.scenes.get("시설 · 모델 라이브러리")
    if gallery is None:
        gallery = bpy.data.scenes.new("시설 · 모델 라이브러리")
        gallery.unit_settings.system = "METRIC"
        gallery.world = bpy.context.scene.world
        gallery["purpose"] = (
            "시설별 원본 모델. 컬렉션 인스턴스의 연결 원본에서 메시와 재질을 편집할 수 있습니다."
        )
    # Adding art to an edited master must preserve the artist's existing gallery
    # and the rest of the city. Older shelves predate any source-path metadata.
    source_libraries = {part.library for instance in gallery.objects if instance.instance_collection
                        for part in instance.instance_collection.all_objects if part.library}
    represented = {Path(bpy.path.abspath(lib.filepath)).resolve() for lib in source_libraries}
    added_shelves = []
    for path in sorted(world_dir.parent.rglob("*.blend")):
        if world_dir in path.parents or path.resolve() in represented:
            continue
        if path.parent.name.startswith("ssg-"):
            retail = json.loads((path.parent / "camera.json").read_text(encoding="utf-8"))
            label = f"신세계 {retail['floor'].removesuffix('F')}층 · {retail['nativeLabel']}"
        else:
            label = SHELVES.get(path.stem, SHELVES.get(path.parent.name, path.stem))
        shelf = bpy.data.collections.new(label + " · 모델")
        gallery.collection.children.link(shelf)
        added_shelves.append(shelf)
        with bpy.data.libraries.load(str(path), link=True, relative=True) as (
            available,
            selected,
        ):
            if available.collections:
                selected.collections = sorted(available.collections)
            else:
                selected.objects = sorted(available.objects)
        if selected.collections:
            nested = {
                child
                for group in selected.collections
                for child in group.children_recursive
            }
            groups = [group for group in selected.collections if group not in nested]
        else:
            group = bpy.data.collections.new(path.stem + " · 원본")
            for obj in selected.objects:
                if obj and obj.type not in {"CAMERA", "LIGHT"}:
                    group.objects.link(obj)
            groups = [group]
        if path.parent.name == "visitors":
            groups = grouped_visitors(groups)
        for group in groups:
            if not any(o.type in {"MESH", "CURVE", "FONT"} for o in group.all_objects):
                continue
            instance = bpy.data.objects.new(group.name, None)
            instance.instance_type = "COLLECTION"
            instance.instance_collection = group
            instance.empty_display_size = 0.15
            shelf.objects.link(instance)
    if added_shelves:
        arrange_shelves(gallery, added_shelves)
    return gallery


if __name__ == "__main__":
    world_dir = Path(__file__).resolve().parent
    master = world_dir / "gangnam-terminal.blend"
    if Path(bpy.data.filepath).resolve() != master:
        raise ValueError("Open gangnam-terminal.blend before refreshing the model library")
    link_asset_gallery(world_dir)
    bpy.context.preferences.filepaths.save_version = 0
    bpy.ops.wm.save_as_mainfile(filepath=str(master), compress=True)
