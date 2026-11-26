"""Raised glass headhouse on Seoul Metro's Line 7 street lift at Exit 4."""

from math import cos, pi, sin
from pathlib import Path
import sys

import bpy

here = Path(__file__).resolve().parent
sys.path.insert(0, str(here.parents[2] / "tools"))
import blender_shop_mesh as mesh

bpy.ops.wm.read_factory_settings(use_empty=True)
scene = bpy.context.scene
scene.unit_settings.system = "METRIC"


def make_group(name):
    group = bpy.data.collections.new(name)
    scene.collection.children.link(group)
    mesh.group = group
    return group


finishes = {
    "알루미늄": ("AFB9BD", 0.63),
    "프레임 그늘": ("485457", 0.45),
    "헤어라인 스틸": ("ABB3B1", 0.72),
    "창 고무": ("303C3E", 0.10),
    "안내판": ("35414C", 0.17),
    "백색 문자": ("EDF2EF", 0.09),
    "주황 3호선": ("ED884D", 0.1),
    "올리브 7호선": ("85883C", 0.1),
    "금색 9호선": ("AB9368", 0.15),
    "승강기 표시창": ("171F23", 0.08),
    "유백 확산판": ("FFF3D6", 0.04),
    "노랑": ("F3C946", 0.08),
    "바닥": ("8A9290", 0.09),
    "버튼": ("A4B7BB", 0.6),
    "버튼등": ("B6D8EE", 0.05),
    "출입문 유리": ("435657", 0.2),
    "외벽 유리": ("A9C4C2", 0.05),
    "문짝 음영": ("84918E", 0.59),
}
for name, (code, metallic) in finishes.items():
    mesh.palette[name] = mesh.material(name, code, metallic)
for name, strength in [("유백 확산판", 2.1), ("버튼등", 1.6), ("백색 문자", 0.13)]:
    mat = mesh.palette[name]
    bsdf = mat.node_tree.nodes["Principled BSDF"]
    bsdf.inputs["Emission Color"].default_value = mat.diffuse_color
    bsdf.inputs["Emission Strength"].default_value = strength


def front_disc(name, x, d, z, radius, material):
    return mesh.rod(name, [(x, d - 0.004, z), (x, d, z)], radius, material, 28)


def label(text, x, d, z, width, height, material):
    curve = bpy.data.curves.new(text, "FONT")
    curve.body = text
    curve.font = font
    curve.resolution_u = 2
    obj = bpy.data.objects.new(text, curve)
    mesh.group.objects.link(obj)
    curve.materials.append(mesh.palette[material])
    bpy.context.view_layer.objects.active = obj
    bpy.ops.object.select_all(action="DESELECT")
    obj.select_set(True)
    bpy.ops.object.convert(target="MESH")
    corners = [v.co.copy() for v in obj.data.vertices]
    lo_x, hi_x = min(p.x for p in corners), max(p.x for p in corners)
    lo_y, hi_y = min(p.y for p in corners), max(p.y for p in corners)
    for v in obj.data.vertices:
        v.co.x = (v.co.x - (lo_x + hi_x) / 2) * width / (hi_x - lo_x)
        v.co.y = (v.co.y - (lo_y + hi_y) / 2) * height / (hi_y - lo_y)
    obj.rotation_euler.x = pi / 2
    obj.location = (x, -d, z)


font = bpy.data.fonts.load("/System/Library/Fonts/AppleSDGothicNeo.ttc")
case = make_group("Exit4LiftPavilion")
B = mesh.block
for x in (-1.30, 1.30):
    for d in (-1.25, 1.25):
        B("절곡 모서리 기둥", x, d, 0.02, 0.09, 0.09, 4.27, "알루미늄", 0.008)
for z, height in [
    (0.02, 0.15),
    (2.48, 0.05),
    (3.01, 0.07),
    (3.73, 0.08),
    (4.26, 0.095),
]:
    for x in (-1.30, 1.30):
        B("유리 측면 수평대", x, 0, z, 0.068, 2.5, height, "프레임 그늘")
    for d in (-1.25, 1.25):
        if z > 2.30 or d < 0:
            B("유리 전후면 수평대", 0, d, z, 2.66, 0.075, height, "알루미늄")
# Folded fascia and roof louvres, behind the thin projecting rain hood.
B("승강기 상부 환기실", 0, 0, 3.78, 2.58, 2.5, 0.48, "프레임 그늘")
for d in (-1.29, 1.29):
    for n in range(7):
        B(
            "환기실 금속 루버",
            0,
            d,
            3.79 + n * 0.064,
            2.5,
            0.09,
            0.034,
            "알루미늄",
            0.005,
        )
B("상부 덮개", 0, 0, 4.27, 2.83, 2.72, 0.09, "알루미늄", 0.012)
B("돌출 캐노피", 0, 1.90, 2.91, 3.04, 1.39, 0.095, "알루미늄", 0.016)
B("차양 하부", 0, 1.90, 2.901, 2.95, 1.29, 0.012, "프레임 그늘")
for x in (-0.96, 0.96):
    mesh.rod(
        "차양 하부 브래킷", [(x, 1.29, 2.62), (x, 2.46, 2.89)], 0.027, "프레임 그늘"
    )
    for d in (1.74, 2.34):
        mesh.profile(
            "매립등 테두리", x, d, 2.877, [(0.098, 0), (0.105, 0.016)], "알루미늄", 20
        )
        mesh.profile(
            "매립등 발광면",
            x,
            d,
            2.872,
            [(0.077, 0), (0.077, 0.006)],
            "유백 확산판",
            20,
        )
B("유리 뒤 역명 표찰", 0, 1.267, 3.09, 2.54, 0.039, 0.48, "안내판", 0.012)
for x, number, tone in [
    (-1.08, "3", "주황 3호선"),
    (-0.86, "7", "올리브 7호선"),
    (-0.64, "9", "금색 9호선"),
]:
    front_disc(number + "호선 원", x, 1.310, 3.31, 0.103, tone)
    label(number, x, 1.315, 3.31, 0.085, 0.125, "백색 문자")
label("고속터미널역", -0.02, 1.311, 3.33, 1.00, 0.195, "백색 문자")
label("Express Bus Terminal", 0.863, 1.311, 3.35, 0.64, 0.064, "백색 문자")
label("엘리베이터", 0.86, 1.311, 3.23, 0.41, 0.063, "백색 문자")
for x in (-0.79, 0.79):
    B("스테인리스 문설주", x, 1.24, 0.018, 0.15, 0.18, 2.30, "헤어라인 스틸", 0.012)
B("스테인리스 상인방", 0, 1.24, 2.265, 1.72, 0.19, 0.23, "헤어라인 스틸", 0.010)
B("검은 층표시 가로창", 0, 1.352, 2.315, 1.61, 0.015, 0.117, "승강기 표시창", 0.005)
# Compact white accessibility figures on the dark lintel strip. One figure per tile.
for i, figure in enumerate(("지팡이 보행", "휠체어", "보호자", "유모차", "유아 동반")):
    x = (i - 2) * 0.254
    B("접근성 픽토그램 받침", x, 1.347, 2.52, 0.234, 0.015, 0.18, "안내판", 0.007)
    front_disc(figure + " 머리", x - 0.026, 1.367, 2.661, 0.018, "백색 문자")

    def stroke(points):
        mesh.rod(
            figure,
            [(x + u, 1.369, 2.605 + v) for u, v in points],
            0.007,
            "백색 문자",
            6,
        )

    if figure == "휠체어":
        stroke([(-0.025, 0.03), (-0.017, -0.004), (0.031, -0.004), (0.053, -0.039)])
        stroke(
            [
                (-0.021 + 0.041 * cos(t * pi / 12), -0.018 + 0.041 * sin(t * pi / 12))
                for t in range(7, 26)
            ]
        )
    elif figure == "유모차":
        stroke([(-0.03, 0.032), (-0.043, -0.022), (-0.053, -0.063)])
        stroke(
            [
                (-0.028, 0.026),
                (0.001, 0.007),
                (0.017, -0.036),
                (0.066, -0.036),
                (0.075, -0.004),
            ]
        )
        for u in (0.019, 0.060):
            front_disc("유모차 바퀴", x + u, 1.369, 2.548, 0.013, "백색 문자")
    else:
        stroke([(-0.024, 0.034), (-0.034, -0.008), (-0.014, -0.063)])
        stroke([(-0.034, -0.008), (-0.056, -0.057)])
        stroke([(-0.024, 0.024), (0.003, 0.006), (0.027, 0.006)])
        if figure == "지팡이 보행":
            stroke([(0.025, 0.009), (0.035, -0.066)])
        else:
            front_disc(figure + " 아이", x + 0.045, 1.367, 2.623, 0.014, "백색 문자")
            stroke([(0.041, -0.002), (0.037, -0.035), (0.060, -0.062)])
            stroke([(0.037, -0.035), (0.020, -0.060)])
label("3", 0.805, 1.356, 2.349, 0.074, 0.086, "노랑")
B("호출판", 0.968, 1.30, 0.80, 0.14, 0.029, 0.41, "헤어라인 스틸", 0.01)
front_disc("호출 키 링", 0.968, 1.326, 0.985, 0.043, "프레임 그늘")
front_disc("호출 키", 0.968, 1.330, 0.985, 0.030, "버튼등")
for i in range(3):
    B("홈이 파인 문턱", 0, 1.22 + i * 0.045, 0.022, 1.5, 0.013, 0.009, "프레임 그늘")
B("승강기 실내 바닥", 0, -0.01, 0.012, 2.58, 2.42, 0.012, "바닥")
B("승강기 천장 발광판", 0, -0.075, 2.59, 1.68, 1.69, 0.025, "유백 확산판")
for x in (-1.13, 1.13):
    mesh.rod("측면 손잡이", [(x, -1.02, 0.9), (x, 0.9, 0.9)], 0.022, "알루미늄")
glass = make_group("Exit4LiftGlazing")
pane = mesh.palette["외벽 유리"]
nodes = pane.node_tree
mix = nodes.nodes.new("ShaderNodeMixShader")
clear = nodes.nodes.new("ShaderNodeBsdfTransparent")
clear.inputs[0].default_value = (0.90, 0.96, 0.95, 1)
mix.inputs[0].default_value = 0.81
nodes.links.new(nodes.nodes["Principled BSDF"].outputs[0], mix.inputs[1])
nodes.links.new(clear.outputs[0], mix.inputs[2])
nodes.links.new(mix.outputs[0], nodes.nodes["Material Output"].inputs[0])
for x in (-1.298, 1.298):
    B("측면 접합 유리", x, 0, 0.17, 0.018, 2.42, 3.58, "외벽 유리")
B("후면 접합 유리", 0, -1.243, 0.17, 2.56, 0.018, 3.58, "외벽 유리")
for x in (-1.055, 1.055):
    B("정면 고정 유리", x, 1.243, 0.17, 0.46, 0.018, 2.73, "외벽 유리")
B("역명 뒤 채광창", 0, 1.243, 2.98, 2.56, 0.018, 0.76, "외벽 유리")

door = make_group("Exit4LiftLeaf")
# A reusable leaf at its own origin. The native city places it twice.
B("스테인리스 문짝", 0, 0, 0, 0.674, 0.048, 2.239, "헤어라인 스틸", 0.008)
B("헤어라인 하부판", 0, 0.028, 0.04, 0.66, 0.009, 0.62, "문짝 음영")
B("세로 유리 테두리", 0, 0.031, 0.79, 0.232, 0.024, 0.86, "프레임 그늘", 0.015)
B("세로 관찰창", 0, 0.048, 0.82, 0.187, 0.011, 0.80, "출입문 유리", 0.009)
for d, z in [(0.051, 1.56), (0.051, 1.49)]:
    B("창의 희미한 반사", 0.031, d, z, 0.071, 0.004, 0.018, "버튼")
scene.render.engine = "CYCLES"
scene.unit_settings.system = "METRIC"
bpy.context.preferences.filepaths.save_version = 0
# Preview both leaves at their installed closed position in the editable file.
scene.collection.children.unlink(door)
for side in (-1, 1):
    placed = bpy.data.objects.new("승강기 문짝 · 닫힘", None)
    placed.instance_type = "COLLECTION"
    placed.instance_collection = door
    placed.location = (side * 0.342, -1.197, 0.018)
    scene.collection.objects.link(placed)
for area in bpy.context.screen.areas:
    if area.type == "VIEW_3D":
        from mathutils import Vector

        view = area.spaces.active.region_3d
        view.view_rotation = Vector((0.38, -1, 0.28)).to_track_quat("Z", "Y")
        view.view_location = (0, 0, 1.92)
        view.view_distance = 8.8
bpy.ops.wm.save_as_mainfile(filepath=str(here / "pavilion.blend"), compress=True)
