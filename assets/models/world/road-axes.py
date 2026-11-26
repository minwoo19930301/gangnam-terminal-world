"""Editable road centrelines and widths. Existing OSM nodes stay exact until edited."""

import json
from pathlib import Path
import bpy


def build_axes(scene, roads):
    layer = bpy.data.collections.new("도로 선형 · 폭 편집")
    scene.collection.children.link(layer)
    for road in roads:
        curve = bpy.data.curves.new(road["name"] or road["hw"], "CURVE")
        curve.dimensions = "3D"
        line = curve.splines.new("POLY")
        line.points.add(len(road["pts"]) - 1)
        for pt, (x, z, y) in zip(line.points, road["pts"]):
            pt.co = (x, -z, y, 1)
        obj = bpy.data.objects.new(
            (road["name"] or road["hw"]) + " · " + str(road["id"]), curve
        )
        layer.objects.link(obj)
        obj["way_id"] = road["key"]
        obj["road_width"] = road["width"]
        obj["base_road"] = json.dumps(road["base"], separators=(",", ":"))
        obj.hide_render = True
        obj.display_type = "WIRE"
    return layer


def export_axes(world_dir, target=None):
    scene = bpy.data.scenes["반포 · 도시 전경"]
    edits = {}
    for obj in scene.objects:
        way = obj.get("way_id")
        if not way:
            continue
        base_points, base_width = json.loads(obj["base_road"])
        if (
            obj.type != "CURVE"
            or len(obj.data.splines) != 1
            or obj.data.splines[0].type != "POLY"
        ):
            raise ValueError("Expected a single road polyline on " + obj.name)
        points = []
        for point in obj.data.splines[0].points:
            co = obj.matrix_world @ point.co.xyz
            points.append([round(co.x, 3), round(-co.y, 3)])
        if len(points) < 2:
            raise ValueError("Invalid road segment on " + obj.name)
        width = round(float(obj["road_width"]), 3)
        if width <= 0:
            raise ValueError("Invalid road width on " + obj.name)
        edit = {}
        if len(points) != len(base_points) or any(
            max(abs(p[i] - q[i]) for i in (0, 1)) > 0.001
            for p, q in zip(points, base_points)
        ):
            if any(a == b for a, b in zip(points, points[1:])):
                raise ValueError("Coincident road nodes on " + obj.name)
            edit["points"] = points
        if abs(width - base_width) > 0.001:
            edit["width"] = width
        if edit:
            if way in edits:
                raise ValueError("Duplicate road ID " + way)
            edits[way] = edit
    target = Path(target) if target else world_dir / "road-edits.js"
    target.write_text(
        "// Blender surface-road overrides exported from the city scene.\nexport const roadEdits = "
        + json.dumps(edits, sort_keys=True, separators=(",", ":"))
        + ";\n"
    )
    return len(edits)
