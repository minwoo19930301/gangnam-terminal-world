"""Export an edited hotel-details.blend: blender -b hotel-details.blend -P export.py."""
import bpy
import json
from mathutils import Vector
from pathlib import Path

directory = Path(__file__).resolve().parent
deps = bpy.context.evaluated_depsgraph_get()
result = {}
for group in bpy.data.collections:
    key = group.get("hotel_asset")
    if not key:
        continue
    origin = Vector(group["origin"])
    points, indices, materials, faces = [], {}, [], []
    for source in sorted(group.all_objects, key=lambda o: o.name):
        if source.type != 'MESH':
            continue
        obj = source.evaluated_get(deps)
        mesh = obj.to_mesh()
        try:
            local = []
            for vertex in mesh.vertices:
                pos = tuple(round(v * 1000) for v in (obj.matrix_world @ vertex.co - origin))
                if pos not in indices:
                    indices[pos] = len(points)
                    points.append(pos)
                local.append(indices[pos])
            mesh.calc_loop_triangles()
            for poly in mesh.polygons:
                mat = mesh.materials[poly.material_index]
                rgb = 0
                for v in mat.diffuse_color[:3]:
                    s = 12.92 * v if v <= .0031308 else 1.055 * v ** (1/2.4) - .055
                    rgb = (rgb << 8) | round(max(0, min(1, s)) * 255)
                finish = {"color": rgb}
                if mat.get("world_texture"):
                    finish["tex"] = mat["world_texture"]
                if mat.get("world_gloss"):
                    finish["gloss"] = mat["world_gloss"]
                if finish not in materials:
                    materials.append(finish)
                m = materials.index(finish)
                rings = [poly.vertices] if len(poly.vertices) <= 4 else [t.vertices for t in mesh.loop_triangles if t.polygon_index == poly.index]
                for ring in rings:
                    faces.append([m] + [local[i] for i in ring])
        finally:
            obj.to_mesh_clear()
    result[key] = {"points": points, "materials": materials, "faces": faces}
with (directory / "fixtures.js").open("w") as f:
    f.write("// Generated from hotel-details.blend with export.py; positions in millimetres.\nexport const fixtures = {\n")
    for k, v in result.items():
        f.write(json.dumps(k) + ":" + json.dumps(v, separators=(",", ":")) + ",\n")
    f.write("};\n")
