"""Sparse height edits on the exact coarse and fine grids shared by physics and GPU."""

import bpy
import json
from pathlib import Path


def build_controls(scene, grids):
    layer = bpy.data.collections.new("지형 표고 · 편집 격자")
    scene.collection.children.link(layer)
    for key, grid in grids.items():
        w, h = grid["width"], grid["height"]
        vertices = [
            (
                grid["x"] + (i % w) * grid["step"],
                -grid["z"] - (i // w) * grid["step"],
                z,
            )
            for i, z in enumerate(grid["rows"])
        ]
        faces = [
            (j * w + i, (j + 1) * w + i, j * w + i + 1)
            for j in range(h - 1)
            for i in range(w - 1)
        ]
        faces.extend(
            ((j + 1) * w + i, (j + 1) * w + i + 1, j * w + i + 1)
            for j in range(h - 1)
            for i in range(w - 1)
        )
        mesh = bpy.data.meshes.new("Survey grid " + key)
        mesh.from_pydata(vertices, [], faces)
        base = mesh.attributes.new("source_z", "FLOAT", "POINT")
        base.data.foreach_set("value", grid["base"])
        obj = bpy.data.objects.new("표고 " + str(grid["step"]) + "m · " + key, mesh)
        layer.objects.link(obj)
        obj["terrain_grid"] = key
        obj["grid_shape"] = [w, h, grid["step"], grid["x"], grid["z"]]
        obj.hide_render = True
        obj.display_type = "WIRE"
        obj.hide_set(True)


def edit_key(key, shape, index):
    # The original garden grid is still addressable using its original keys.
    w, h, step, x0, _ = shape
    if key == "garden" and x0 == -175 and w == 136 and step == 5:
        row, column = divmod(index, w)
        if column < 5:
            return 131 * h + row * 5 + column
        return row * 131 + column - 5
    return index


def export_controls(world_dir, target=None):
    result = {}
    for obj in bpy.data.scenes["반포 · 도시 전경"].objects:
        key = obj.get("terrain_grid")
        if not key:
            continue
        w, h, step, x0, z0 = obj["grid_shape"]
        source = obj.data.attributes.get("source_z")
        if not source or len(obj.data.vertices) != w * h:
            raise ValueError("Terrain edit requires original grid topology")
        changes = {}
        for i, v in enumerate(obj.data.vertices):
            p = obj.matrix_world @ v.co
            if (
                abs(p.x - x0 - (i % w) * step) > 0.002
                or abs(p.y + z0 + (i // w) * step) > 0.002
            ):
                raise ValueError("Edit elevations along Z on " + obj.name)
            if abs(p.z - source.data[i].value) > 0.001:
                changes[str(edit_key(key, obj["grid_shape"], i))] = round(p.z, 3)
        result[key] = changes
    if set(result) != {"city", "garden"}:
        raise ValueError("Missing survey control grid")
    target = Path(target) if target else world_dir / "height-edits.js"
    target.write_text(
        "// Blender terrain control elevations in metres above the local datum.\nexport const heightEdits = "
        + json.dumps(result, sort_keys=True, separators=(",", ":"))
        + ";\n"
    )
    return result
