"""Model the underside of the Famille Park pavilion in its existing 16-sided frame."""

import math
from pathlib import Path
import sys

import bpy
from mathutils import Vector

here = Path(__file__).resolve().parent
sys.path.insert(0, str(here.parents[2] / "tools"))
from blender_shop_mesh import material

bpy.ops.wm.read_factory_settings(use_empty=True)
scene = bpy.context.scene
scene.unit_settings.system = "METRIC"
collection = bpy.data.collections.new("파미에 돔 · 삼각 천장")
scene.collection.children.link(collection)

# A shop visitor sees stained wood, opal and clear lights separated by thin bronze profiles.
# The panel pattern is reconstructed, not a record of individual installed panes.
finishes = {
    "꿀빛 목재": material("꿀빛 목재", "C29B64"),
    "중간 목재": material("중간 목재", "A47B4F"),
    "짙은 목재": material("짙은 목재", "785943"),
    "유백 패널": material("유백 패널", "E5E4D9"),
    "청회색 패널": material("청회색 패널", "AFBFC0"),
    "청동 몰딩": material("청동 몰딩", "62584A", 0.28),
    "금속 반사면": material("금속 반사면", "A49B88", 0.33),
}
for label in ("꿀빛 목재", "중간 목재", "짙은 목재"):
    mat = finishes[label]
    graph = mat.node_tree
    coords = graph.nodes.new("ShaderNodeTexCoord")
    stretch = graph.nodes.new("ShaderNodeVectorMath")
    stretch.operation = "MULTIPLY"
    stretch.inputs[1].default_value = (3, 0.24, 0.8)
    noise = graph.nodes.new("ShaderNodeTexNoise")
    noise.inputs["Scale"].default_value = 18
    ramp = graph.nodes.new("ShaderNodeValToRGB")
    base = mat.diffuse_color[:3]
    for stop, bright in zip(ramp.color_ramp.elements, (0.81, 1.08)):
        stop.color = (*[c * bright for c in base], 1)
    graph.links.new(coords.outputs["Object"], stretch.inputs[0])
    graph.links.new(stretch.outputs[0], noise.inputs["Vector"])
    graph.links.new(noise.outputs["Fac"], ramp.inputs[0])
    graph.links.new(
        ramp.outputs[0], graph.nodes["Principled BSDF"].inputs["Base Color"]
    )

# The diffuser's modest luminance preserves its separate identity at night in Cycles.
opal = finishes["유백 패널"].node_tree.nodes["Principled BSDF"]
opal.inputs["Emission Color"].default_value = finishes["유백 패널"].diffuse_color
opal.inputs["Emission Strength"].default_value = 0.23
names = list(finishes)
vertices, faces, slots = [], [], []


def face(points, finish):
    at = len(vertices)
    vertices.extend(points)
    faces.append(tuple(range(at, at + len(points))))
    slots.append(names.index(finish))


def ridge(a, b):
    axis = (b - a).normalized()
    width = axis.cross(Vector((0, 0, 1))).normalized() * 0.018
    lip = Vector((0, 0, -0.028))
    face([a - width, b - width, b - width + lip, a - width + lip], "금속 반사면")
    face(
        [a - width + lip, b - width + lip, b + width + lip, a + width + lip],
        "청동 몰딩",
    )
    face([a + width + lip, b + width + lip, b + width, a + width], "금속 반사면")


def finish_part(name):
    mesh = bpy.data.meshes.new(name)
    mesh.from_pydata(vertices, [], faces)
    for mat in finishes.values():
        mesh.materials.append(mat)
    for poly, slot in zip(mesh.polygons, slots):
        poly.material_index = slot
    mesh.update()
    obj = bpy.data.objects.new(name, mesh)
    collection.objects.link(obj)
    vertices.clear()
    faces.clear()
    slots.clear()


# Follow planar facets rather than a circular interpolation between their ends.
# The lining sits below the existing structural members, as in the cafe photographs.
bands = [
    ("하부 채광띠", 16.85, 12.51, 12.10, 15.10, 2),
    ("상부 채광띠", 11.93, 15.48, 4.65, 20.95, 3),
]
for band, ro, ho, ri, hi, rows in bands:
    segments = {}
    for sector in range(16):

        def point(u, v):
            r = ro + (ri - ro) * v
            a = sector * math.tau / 16
            b = (sector + 1) * math.tau / 16
            return Vector(
                (
                    r * ((1 - u) * math.cos(a) + u * math.cos(b)),
                    -r * ((1 - u) * math.sin(a) + u * math.sin(b)),
                    ho + (hi - ho) * v - 0.265,
                )
            )

        for row in range(rows):
            for col in range(2):
                corners = [
                    point(u / 2, v / rows)
                    for u, v in [
                        (col, row),
                        (col + 1, row),
                        (col + 1, row + 1),
                        (col, row + 1),
                    ]
                ]
                mid = sum(corners, Vector()) / 4
                for side, p in enumerate(corners):
                    q = corners[(side + 1) % 4]
                    for a, b in [(p, q), (p, mid)]:
                        key = tuple(
                            sorted(
                                tuple(round(c, 4) for c in endpoint)
                                for endpoint in (a, b)
                            )
                        )
                        segments[key] = (a, b)
                    k = (
                        sector * 73
                        + col * 41
                        + row * 29
                        + side * 17
                        + (sector * row + col * side) * 7
                    ) % 19
                    if k in (1, 4, 5, 8, 10, 13, 15, 17):
                        continue
                    tint = [
                        "꿀빛 목재",
                        "중간 목재",
                        "유백 패널",
                        "짙은 목재",
                        "청회색 패널",
                    ][k % 5]
                    inset = [(v.lerp((p + q + mid) / 3, 0.031)) for v in [p, q, mid]]
                    # Put the front normal towards the occupied floor.
                    if (inset[1] - inset[0]).cross(inset[2] - inset[0]).z > 0:
                        inset.reverse()
                    face(inset, tint)
    finish_part(band + " · 삼각 패널")
    for a, b in segments.values():
        ridge(a, b)
    finish_part(band + " · 금속 몰딩")

# A warm electric wall wash reaches the opal and timber independently of the sky.
# Only preview geometry is exported; the two large soft sources are native render lights.
for x, y in [(-6, 5), (6, -5)]:
    lamp = bpy.data.lights.new("카페 천장 반사광", "POINT")
    lamp.energy = 510
    lamp.shadow_soft_size = 3
    lamp.color = (1, 0.78, 0.56)
    ob = bpy.data.objects.new(lamp.name, lamp)
    ob.location = (x, y, 10.6)
    collection.objects.link(ob)
for area in bpy.context.screen.areas:
    if area.type == "VIEW_3D":
        view = area.spaces.active.region_3d
        view.view_distance = 29
        view.view_location = (0, 0, 15)
        view.view_rotation = Vector((0.42, 0.84, -0.42)).to_track_quat("Z", "Y")
bpy.context.preferences.filepaths.save_version = 0
bpy.ops.wm.save_as_mainfile(filepath=str(here / "pavilion.blend"), compress=True)
exec(compile((here / "export.py").read_bytes(), str(here / "export.py"), "exec"))
