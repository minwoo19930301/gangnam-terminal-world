"""Link each original Blender model into an editable, metre-scale model gallery."""

from pathlib import Path

import bpy
from mathutils import Vector


SHELVES = {
    "modernhouse-provence": "뉴코아 1관 4층 · 마르셰 프로방스",
    "gyeongbu-icecream": "경부선 1층 · 배스킨라빈스",
    "kervan": "파미에 2층 · 케르반",
    "ssg-kids-footwear": "신세계 10층 · 토박스",
    "ssg-gentle-espresso": "신세계 11층 · 살롱드호우섬",
    "ssg-smeg": "신세계 9층 · 밀레",
    "ssg-outdoors": "신세계 8층 · 아크테릭스",
    "gyeongbu-boards": "경부선 1층 · 출발 안내 전광판",
    "bean-brothers": "파미에 2층 · 빈브라더스",
    "lounge-drapery": "JW 8층 · 더 라운지 주름 커튼",
    "lounge-upholstery": "JW 8층 · 더 라운지 코너 소파",
    "ssg-marzocco": "신세계 9층 · 라마르조코",
    "ssg-twl": "신세계 9층 · TWL 공예 식기",
    "ssg-herman-miller": "신세계 9층 · 허먼밀러",
    "ssg-stokke": "신세계 10층 · 스토케",
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
    "patisserie": "JW 2층 파티세리 · 플랑과 마카롱",
    "daiso-merchandise": "다이소 주방·문구 매대",
    "gyeongbu-seating": "경부선 · 대합실 연석",
    "lounge-chair": "JW 8층 라운지 · 라탄 암체어",
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
    for path in sorted(world_dir.parent.glob("*/*.blend")):
        if path.parent == world_dir or path.resolve() in represented:
            continue
        shelf = bpy.data.collections.new(
            SHELVES.get(path.stem, SHELVES.get(path.parent.name, path.stem)) + " · 모델"
        )
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
