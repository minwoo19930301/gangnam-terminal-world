"""Publish Blender exterior meshes, local UVs and material slots for the web."""

import gzip
import json
import runpy
import sys
from pathlib import Path

import bpy

here = Path(__file__).resolve().parent


def slot_value(material):
    if material and material.get("game_texture"):
        return material["game_texture"]
    linear = material.diffuse_color[:3] if material else (0.6, 0.6, 0.6)
    result = 0
    for value in linear:
        s = 12.92 * value if value <= 0.0031308 else 1.055 * value ** (1 / 2.4) - 0.055
        result = (result << 8) | max(0, min(255, round(255 * s)))
    return result


def append_part(source, graph, datum, slots, points, faces):
    obj = source.evaluated_get(graph)
    mesh = obj.to_mesh()
    try:
        mesh.calc_loop_triangles()
        offset = len(points) // 3
        for vertex in mesh.vertices:
            x, y, z = obj.matrix_world @ vertex.co
            points.extend(round(v * 100) for v in (x, z - datum, -y))
        local_slots = []
        for mat in mesh.materials:
            value = slot_value(mat)
            if value not in slots:
                slots.append(value)
            local_slots.append(slots.index(value))
        if not local_slots:
            fallback = slot_value(None)
            if fallback not in slots:
                slots.append(fallback)
            local_slots.append(slots.index(fallback))
        uv = mesh.uv_layers.active
        reverse = obj.matrix_world.to_3x3().determinant() < 0
        for tri in mesh.loop_triangles:
            if tri.area < 1e-6:
                continue
            slot = local_slots[tri.material_index]
            corners = [2, 1, 0] if reverse else [0, 1, 2]
            faces.extend(offset + tri.vertices[k] for k in corners)
            faces.append(slot)
            if isinstance(slots[slot], str):
                for k in corners:
                    coord = uv.data[tri.loops[k]].uv if uv else (0, 0)
                    faces.extend(round(v * 1000) for v in coord)
    finally:
        obj.to_mesh_clear()


def export_buildings(target):
    scene = bpy.data.scenes["반포 · 도시 전경"]
    library = {}
    with bpy.context.temp_override(scene=scene, view_layer=scene.view_layers[0]):
        graph = bpy.context.evaluated_depsgraph_get()
        for source in scene.objects:
            if source.type != "MESH" or not source.get("game_shell"):
                continue
            key = source["shell_key"]
            if key in library:
                raise ValueError("Duplicate shell key " + key)
            role = source["game_shell"]
            slots, points, faces = [], [], []
            if role != "omit":
                for part in [
                    source,
                    *sorted(source.children_recursive, key=lambda o: o.name),
                ]:
                    if part != source and not (
                        part.type == "MESH" and part.get("shell_part")
                    ):
                        continue
                    append_part(
                        part, graph, source["terrain_datum"], slots, points, faces
                    )
                if not faces:
                    raise ValueError("Empty exterior " + key)
            library[key] = [role, slots, points, faces]
    if not library:
        raise ValueError("No exterior meshes in the city scene")
    raw = json.dumps(library, sort_keys=True, separators=(",", ":")).encode()
    compressed = gzip.compress(raw, compresslevel=9, mtime=0)
    temp = target.with_suffix(".tmp")
    temp.write_bytes(compressed)
    temp.replace(target)
    from collections import Counter

    print(
        "Exported exterior mesh catalog",
        dict(Counter(v[0] for v in library.values())),
        len(compressed),
        "bytes",
    )


if __name__ == "__main__":
    target = (
        Path(sys.argv[sys.argv.index("--") + 1])
        if "--" in sys.argv
        else here / "buildings.json.gz"
    )
    export_buildings(target)
    if "--" not in sys.argv:
        runpy.run_path(str(here / "height-controls.py"))["export_controls"](here)
        runpy.run_path(str(here / "road-axes.py"))["export_axes"](here)
        runpy.run_path(str(here / "street-layout.py"))["export_street_layout"](here)
