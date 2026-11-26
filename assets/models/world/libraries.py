"""Link each original Blender model into an editable, metre-scale model gallery."""

from pathlib import Path

import bpy
from mathutils import Vector


SHELVES = {
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


def corners_of(group):
    return [
        obj.matrix_world @ Vector(corner) - group.instance_offset
        for obj in group.all_objects
        if obj.type in {"MESH", "CURVE", "FONT"}
        for corner in obj.bound_box
    ]


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
    represented = set()
    next_row = 0.0
    for instance in gallery.objects:
        group = instance.instance_collection
        if group is None:
            continue
        for obj in group.all_objects:
            if obj.library:
                represented.add(Path(bpy.path.abspath(obj.library.filepath)).resolve())
        for corner in corners_of(group):
            next_row = min(next_row, (instance.matrix_world @ corner).y - 6.0)
    for path in sorted(world_dir.parent.glob("*/*.blend")):
        if path.parent == world_dir or path.resolve() in represented:
            continue
        shelf = bpy.data.collections.new(
            SHELVES.get(path.parent.name, path.stem) + " · 모델"
        )
        gallery.collection.children.link(shelf)
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
        next_column = 0.0
        row_depth = 0.0
        for group in groups:
            corners = corners_of(group)
            if not corners:
                continue
            low = Vector([min(p[i] for p in corners) for i in range(3)])
            high = Vector([max(p[i] for p in corners) for i in range(3)])
            instance = bpy.data.objects.new(group.name, None)
            instance.instance_type = "COLLECTION"
            instance.instance_collection = group
            instance.empty_display_size = 0.15
            instance.location = (next_column - low.x, next_row - high.y, -low.z)
            shelf.objects.link(instance)
            next_column += high.x - low.x + 2.5
            row_depth = max(row_depth, high.y - low.y)
        next_row -= row_depth + 6.0
    return gallery

if __name__ == "__main__":
    world_dir = Path(__file__).resolve().parent
    master = world_dir / "gangnam-terminal.blend"
    if Path(bpy.data.filepath).resolve() != master:
        raise ValueError("Open gangnam-terminal.blend before refreshing the model library")
    link_asset_gallery(world_dir)
    bpy.context.preferences.filepaths.save_version = 0
    bpy.ops.wm.save_as_mainfile(filepath=str(master), compress=True)
