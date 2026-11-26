"""Editable reconstruction of the BAKE counter in the Gangnam B1 food hall."""

from math import cos, sin, pi, tau
from pathlib import Path
import random, sys, bpy
from mathutils import Vector, Matrix

here = Path(__file__).resolve().parent
sys.path.insert(0, str(here.parents[2] / "tools"))
import blender_shop_mesh as S

bpy.ops.wm.read_factory_settings(use_empty=True)
scene = bpy.context.scene
scene.name = "강남점 BAKE · 치즈 타르트"
scene.unit_settings.system = "METRIC"


def collection(name, parent):
    col = bpy.data.collections.new(name)
    parent.children.link(col)
    return col


root = collection("BakeGangnam", scene.collection)
body = collection("BAKE furniture", root)
glass = collection("BAKE glazing", root)


def stage(name):
    S.group = collection(name, body)


S.palette = {
    n: S.material(n, c, m)
    for n, c, m in [
        ("천장 옅은 금박", "CDA659", 0.37),
        ("천장 금박", "C59C51", 0.35),
        ("금박 겹침", "C09A55", 0.34),
        ("코브 등", "FFE4AF", 0.04),
        ("금색 몰딩", "A17B49", 0.5),
        ("주변 천장 석고", "E4D9C2", 0.02),
        ("옻칠", "29292B", 0.30),
        ("갈색 프레임", "403A34", 0.38),
        ("홈", "17191A", 0.16),
        ("스테인리스", "B8B6AC", 0.65),
        ("황동", "A5895C", 0.58),
        ("오래된 동", "655743", 0.48),
        ("망", "726653", 0.4),
        ("금색 점광", "D2B683", 0.48),
        ("상표 흰색", "FFF5D9", 0),
        ("상판", "34312F", 0.25),
        ("노랑", "F5C524", 0.04),
        ("노랑 그림자", "CB8E0D", 0.03),
        ("종이", "F5EBC8", 0),
        ("철판", "85847B", 0.45),
        ("굽는 종이", "CAB482", 0),
        ("과자 바닥", "834425", 0),
        ("과자 옆", "B5713F", 0),
        ("과자 가장자리", "C4884E", 0),
        ("치즈무스", "F7C962", 0.02),
        ("크림", "FFE29A", 0),
        ("황금빛", "E8A243", 0),
        ("구움 자국", "AA531F", 0),
        ("점등", "FFF2CD", 0),
        ("메뉴 잉크", "514336", 0),
        ("유리", "D5E4DE", 0),
    ]
}
for n in ("상표 흰색", "점등", "코브 등"):
    p = S.palette[n].node_tree.nodes["Principled BSDF"]
    p.inputs["Emission Color"].default_value = S.palette[n].diffuse_color
    p.inputs["Emission Strength"].default_value = 0.75
m = S.palette["유리"]
p = m.node_tree.nodes["Principled BSDF"]
p.inputs["Alpha"].default_value = 0.09
m.diffuse_color = (*m.diffuse_color[:3], 0.09)

B = S.block
R = S.rod
stage("검은 세로 홈 타일과 조명")
B("안쪽 걸레받이", 0, 0, 0.015, 3.52, 0.65, 0.075, "홈")
B("홈 타일 장", 0, 0, 0.09, 3.54, 0.66, 0.73, "옻칠")
for i in range(59):
    x = (i - 29) * 0.059
    B("세로 타일 이음", x, 0.335, 0.091, 0.009, 0.009, 0.70, "홈")
    B("타일 유약 모서리", x + 0.006, 0.339, 0.102, 0.004, 0.005, 0.68, "오래된 동")
for h, t, width, material in [
    (0.74, 0.018, 3.56, "스테인리스"),
    (0.79, 0.014, 3.55, "점등"),
    (0.81, 0.025, 3.59, "옻칠"),
    (0.836, 0.055, 3.60, "상판"),
]:
    B("진열장 수평 테두리", 0, 0, h, width, 0.712, t, material, 0.003)

stage("황동 격자와 검은 처마")
for x in (-1.69, 1.69):
    for d in (-0.29, 0.29):
        for r, z, h, mat in [
            (0.034, 0.89, 1.58, "갈색 프레임"),
            (0.046, 0.91, 0.12, "오래된 동"),
            (0.046, 2.30, 0.13, "오래된 동"),
        ]:
            S.profile("원형 지주", x, d, z, [(r, 0), (r, h)], mat, 12)
    for h in (1.18, 1.62, 2.04, 2.38):
        B("지주 사이 짧은 띠", x, 0, h, 0.043, 0.62, 0.025, "오래된 동")
for z, w, d, h, mat in [
    (2.40, 3.59, 0.70, 0.055, "갈색 프레임"),
    (2.455, 3.55, 0.684, 0.035, "황동"),
    (2.49, 3.49, 0.64, 0.31, "갈색 프레임"),
    (2.80, 3.56, 0.68, 0.045, "오래된 동"),
    (2.845, 3.60, 0.71, 0.045, "옻칠"),
]:
    B("간판 인방 몰딩", 0, 0, z, w, d, h, mat, 0.006)
for face in (-1, 1):
    d = face * 0.329
    for side in (-1, 1):
        x = side * 1.03
        B("금망 바탕", x, d, 2.52, 0.72, 0.016, 0.235, "망")
        for i in range(22):
            B("가는 망살", x + (i - 10.5) * 0.031, d + face * 0.013, 2.526, 0.007, 0.008, 0.208, "오래된 동")
        for i in range(9):
            B("수평 망살", x, d + face * 0.018, 2.527 + i * 0.026, 0.70, 0.009, 0.006, "금색 점광")
        for a in (-1, 1):
            B("장식 세로 띠", x + a * 0.385, d, 2.502, 0.035, 0.044, 0.277, "황동")
            for h in (2.524, 2.751):
                S.profile(
                    "황동 띠 못",
                    x + a * 0.385,
                    d + face * 0.025,
                    h,
                    [(0.012, 0), (0.012, 0.013)],
                    "금색 점광",
                    8,
                )
    B("흑색 상표 바탕", 0, d, 2.516, 1.25, 0.025, 0.247, "옻칠")
B("차양 안쪽 간접등", 0, 0, 2.391, 3.26, 0.50, 0.012, "점등")


def lettering(name, word, x, d, z, width, height, mat, typeface=None):
    font = bpy.data.curves.new(name, "FONT")
    font.body = word
    if typeface:
        font.font = typeface
    font.align_x = "CENTER"
    font.align_y = "CENTER"
    font.extrude = 0.001
    font.resolution_u = 4
    ob = bpy.data.objects.new(name, font)
    S.group.objects.link(ob)
    ob.location = (x, -d, z)
    ob.rotation_euler = (pi / 2, 0, 0)
    ob.data.materials.append(S.palette[mat])
    bpy.context.view_layer.update()
    b = ob.bound_box
    ob.scale.x = width / (max(p[0] for p in b) - min(p[0] for p in b))
    ob.scale.y = height / (max(p[1] for p in b) - min(p[1] for p in b))
    bpy.context.view_layer.objects.active = ob
    ob.select_set(True)
    bpy.ops.object.convert(target="MESH")
    ob.select_set(False)


def printed_mark(file, name, x, d, z, width, material):
    existing = set(bpy.data.objects)
    bpy.ops.import_curve.svg(filepath=str(here / file))
    curve = next(c for c in bpy.data.objects if c not in existing and c.type == "CURVE")
    bpy.ops.object.select_all(action="DESELECT")
    curve.select_set(True)
    bpy.context.view_layer.objects.active = curve
    bpy.ops.object.convert(target="MESH")
    mesh = bpy.context.object
    coords = [mesh.matrix_world @ v.co for v in mesh.data.vertices]
    faces = [tuple(f.vertices) for f in mesh.data.polygons]
    left, right = min(v.x for v in coords), max(v.x for v in coords)
    bottom = min(v.y for v in coords)
    scale = width / (right - left)
    S.piece(
        name,
        [(x + (v.x - (left + right) / 2) * scale, d, z + (v.y - bottom) * scale) for v in coords],
        faces,
        material,
    )
    bpy.data.objects.remove(mesh, do_unlink=True)
    for c in list(bpy.data.collections):
        if c.name.endswith(".svg") and not c.all_objects:
            bpy.data.collections.remove(c)


# The Gangnam operator photo supplies both the wordmark and its position on the dark fascia.
printed_mark("wordmark.svg", "BAKE CHEESE TART 채널 문자", 0, 0.352, 2.536, 0.708, "상표 흰색")

stage("고객 매대 위 금빛 코브 천장")


# Keep the inside of the coffer below the existing 4.30 m aisle rails. The upper reveal meets the hall ceiling.
def outline(w, depth, bevel):
    x, d = w / 2, depth / 2
    return [
        (-x + bevel, -d),
        (x - bevel, -d),
        (x, -d + bevel),
        (x, d - bevel),
        (x - bevel, d),
        (-x + bevel, d),
        (-x, d - bevel),
        (-x, -d + bevel),
    ]


def moulding(name, w, depth, z, profile, mat):
    verts = []
    for inset, rise in profile:
        verts.extend((x, d, z + rise) for x, d in outline(w - inset * 2, depth - inset * 2, 0.18))
    faces = [
        (r * 8 + i, r * 8 + (i + 1) % 8, (r + 1) * 8 + (i + 1) % 8, (r + 1) * 8 + i)
        for r in range(len(profile) - 1)
        for i in range(8)
    ]
    S.piece(name, verts, faces, mat)


moulding(
    "기존 천장과 잇는 바깥 단",
    4.11,
    1.70,
    4.02,
    [(0, 0.075), (-0.06, 0.096), (-0.11, 0.145), (-0.16, 0.17), (-0.16, 0.98)],
    "주변 천장 석고",
)
moulding(
    "바깥 몰딩",
    4.11,
    1.70,
    4.02,
    [(0, 0.07), (0, 0.04), (0.026, 0.035), (0.046, 0.012), (0.085, 0), (0.10, 0.033), (0.12, 0.048)],
    "금색 몰딩",
)
moulding("간접 조명 띠", 4.11, 1.70, 4.02, [(0.12, 0.048), (0.143, 0.056), (0.17, 0.07)], "코브 등")
moulding("천장 안쪽 경사", 4.11, 1.70, 4.02, [(0.17, 0.07), (0.23, 0.17), (0.26, 0.195)], "천장 옅은 금박")
ceiling = outline(3.60, 1.19, 0.18)
S.piece("금박 천장 바탕", [(x, d, 4.218) for x, d in ceiling], [tuple(reversed(range(8)))], "천장 금박")
# Small overlapping gold sheets create subtle joints, visible only from below.
for i in range(14):
    for j in range(4):
        if i in (0, 13) and j in (0, 3):
            continue
        x = (i - 6.5) * 0.246
        d = (j - 1.5) * 0.270
        mat = ("천장 옅은 금박", "금박 겹침", "천장 금박")[(i * 5 + j * 7) % 3]
        B("금박 판", x, d, 4.214, 0.245, 0.269, 0.002, mat)
moulding("안쪽 가는 테두리", 3.52, 1.11, 4.209, [(0, 0.004), (0, 0), (0.012, 0)], "오래된 동")

stage("노란 포장과 철판")
B("노란 정면", 0, 0.225, 0.894, 2.35, 0.18, 0.16, "노랑", 0.006)
B("아래 접힌 테두리", 0, 0.319, 0.897, 2.35, 0.011, 0.021, "노랑 그림자")
B("판매대 안쪽 받침", 0, -0.018, 0.91, 2.35, 0.46, 0.12, "노랑 그림자")
font_paths = [
    Path("/System/Library/Fonts/AppleSDGothicNeo.ttc"),
    Path("/usr/share/fonts/opentype/noto/NotoSansCJK-Regular.ttc"),
]
korean_font = bpy.data.fonts.load(str(next(f for f in font_paths if f.is_file())))
lettering(
    "앞면 제품 설명", "홋카이도산 베이크 치즈타르트", 0, 0.324, 0.979, 0.87, 0.039, "메뉴 잉크", korean_font
)
printed_mark("origin.svg", "홋카이도 원산지 표식", -0.536, 0.324, 0.941, 0.078, "메뉴 잉크")
stage("비스듬한 나무 진열판 다섯 장")
trays = S.group
tray_centres = [-0.89, -0.445, 0, 0.445, 0.89]
for x in tray_centres:
    B("얕은 목재 진열판", x, -0.015, 1.034, 0.432, 0.44, 0.021, "과자 바닥", 0.005)
    B("진열지", x, -0.015, 1.055, 0.408, 0.414, 0.004, "종이")
    for edge in (-1, 1):
        B("목재 옆턱", x + edge * 0.211, -0.015, 1.049, 0.012, 0.44, 0.035, "과자 옆", 0.002)
        B("짧은 턱", x, -0.015 + edge * 0.215, 1.049, 0.42, 0.013, 0.019, "과자 옆", 0.002)

stage("쿠키 타르트지와 구운 치즈무스")
rng = random.Random(317)


def tart(x, d, z, size):
    count = 22
    phase = rng.uniform(0, tau)
    radii = [(1 + 0.035 * cos(i * 7 + phase) + rng.uniform(-0.024, 0.024)) for i in range(count)]
    rings = [
        (0.043, 0),
        (0.054, 0.024),
        (0.063, 0.032),
        (0.061, 0.036),
        (0.056, 0.034),
        (0.054, 0.040),
        (0.049, 0.048),
        (0.033, 0.056),
        (0.013, 0.058),
    ]
    verts = []
    for row, (r, h) in enumerate(rings):
        for i in range(count):
            angle = tau * i / count
            verts.append(
                (
                    x + r * size * radii[i] * cos(angle),
                    d + r * size * radii[i] * sin(angle),
                    z
                    + size
                    * (
                        h
                        + 0.0017 * sin(angle * 3 + phase)
                        + (0.0016 * cos(angle * 5 + phase) if row in (6, 7, 8) else 0)
                    ),
                )
            )
    faces = [
        (r * count + i, r * count + (i + 1) % count, (r + 1) * count + (i + 1) % count, (r + 1) * count + i)
        for r in range(len(rings) - 1)
        for i in range(count)
    ]
    faces.append(tuple(range((len(rings) - 1) * count, len(rings) * count)))
    ob = S.piece("치즈 타르트 · 구운 흔적", verts, faces, "과자 바닥")
    # Keep an irregular browning pattern continuous across adjacent faces. The outer cookie edge is crisp.
    tint = ob.data.color_attributes.new(name="Baking", type="BYTE_COLOR", domain="POINT")

    def mix(a, b, t):
        a, b = S.palette[a].diffuse_color, S.palette[b].diffuse_color
        return tuple(a[i] * (1 - t) + b[i] * t for i in range(3)) + (1,)

    for index in range(len(verts)):
        row, i = divmod(index, count)
        a = tau * i / count
        noise = 0.5 + 0.20 * sin(a * 3 + phase) + 0.14 * cos(a * 5 - phase)
        if row <= 3:
            tone = mix("과자 바닥", "과자 가장자리", min(1, 0.18 + row * 0.12 + noise * 0.36))
        else:
            v = max(
                0,
                min(
                    1,
                    (0.91 * sin(a * 2 + phase + 0.25 * row) + 0.39 * cos(a * 5 - phase) + 0.28)
                    * (1.08 if row in (6, 7) else 0.37),
                ),
            )
            tone = mix("치즈무스" if row >= 6 else "크림", "구움 자국", v)
        tint.data[index].color = tone
    ob.data.materials.clear()
    ob.data.materials.append(baked_material)
    for f in ob.data.polygons:
        f.use_smooth = f.index // count >= 4


baked_material = S.palette["치즈무스"].copy()
baked_material.name = "무스와 구움색 · 정점색"
attr = baked_material.node_tree.nodes.new("ShaderNodeVertexColor")
attr.layer_name = "Baking"
baked_material.node_tree.links.new(
    attr.outputs["Color"], baked_material.node_tree.nodes["Principled BSDF"].inputs["Base Color"]
)
for tray, x in enumerate(tray_centres):
    for row in range(3):
        for col in range(3):
            if (tray == 0 and row != 2) or (tray == 1 and row == 2) or (tray == 4 and row == 1 and col > 0):
                continue
            tart(
                x + (col - 1) * 0.126 + rng.uniform(-0.003, 0.003),
                -0.015 + (row - 1) * 0.130 + rng.uniform(-0.004, 0.004),
                1.059,
                rng.uniform(0.92, 1.00),
            )
pivot = Vector((0, 0, 1.04))
incline = Matrix.Translation(pivot) @ Matrix.Rotation(0.16, 4, "X") @ Matrix.Translation(-pivot)
for c in (trays, S.group):
    for obj in c.objects:
        obj.matrix_world = incline @ obj.matrix_world
stage("작은 메뉴와 금속 손잡이")
for index, x in enumerate((-0.89, -0.65, -0.41)):
    B("메뉴 받침", x, -0.214, 1.458, 0.226, 0.121, 0.011, "스테인리스")
    B("세운 메뉴판", x, -0.223, 1.471, 0.218, 0.012, 0.29, "종이", 0.002)
    B("상단 노란 띠", x, -0.213, 1.727, 0.210, 0.007, 0.028, "노랑" if index != 2 else "굽는 종이")
    for n in range(3):
        B("설명 줄", x, -0.213, 1.508 + n * 0.037, 0.105 + n % 2 * 0.052, 0.005, 0.006, "메뉴 잉크")
    if index < 2:
        S.piece(
            "타르트 단면 인쇄",
            [(x + 0.05 * cos(tau * t / 16), -0.211, 1.674 + 0.018 * sin(tau * t / 16)) for t in range(16)],
            [tuple(range(16))],
            "과자 옆",
        )
# The branch photograph shows a checkout terminal on the uncovered end of the counter.
B("결제기 받침", -1.48, -0.04, 0.895, 0.25, 0.20, 0.025, "옻칠", 0.004)
B("단말기 받침 기둥", -1.48, -0.06, 0.918, 0.05, 0.07, 0.15, "갈색 프레임")
for name, d, mat in [("결제기 틀", 0.006, "갈색 프레임"), ("결제 화면", 0.011, "홈")]:
    ext = 0 if name == "결제기 틀" else 0.015
    points = [
        (-1.62 + ext, 0.02 + d, 1.016 + ext),
        (-1.34 - ext, 0.02 + d, 1.016 + ext),
        (-1.34 - ext, -0.064 + d, 1.228 - ext),
        (-1.62 + ext, -0.064 + d, 1.228 - ext),
    ]
    S.piece(name, points, [(0, 1, 2, 3)], mat)
for side in (-1, 1):
    x = side * 1.20
    for d in (-0.27, 0.31):
        B("유리장 모서리", x, d, 0.92, 0.016, 0.016, 0.53, "스테인리스")
for d in (-0.27, 0.31):
    B("유리장 윗선", 0, d, 1.446, 2.42, 0.018, 0.016, "스테인리스")
S.group = glass
B("유리 앞면", 0, 0.313, 0.925, 2.38, 0.004, 0.52, "유리")
B("유리 상판", 0, 0.02, 1.455, 2.4, 0.57, 0.004, "유리")
for x in (-1.199, 1.199):
    B("유리 짧은 측면", x, 0.02, 0.925, 0.004, 0.575, 0.52, "유리")


def aim(ob, point):
    ob.rotation_euler = (Vector(point) - ob.location).to_track_quat("-Z", "Y").to_euler()


for loc, power, size in [((0, -3.5, 5), 280, 4), ((2, 1.8, 4), 160, 3)]:
    data = bpy.data.lights.new("미리보기 조명", "AREA")
    data.energy = power
    data.shape = "DISK"
    data.size = size
    ob = bpy.data.objects.new(data.name, data)
    scene.collection.objects.link(ob)
    ob.location = loc
    aim(ob, (0, 0, 1.3))
camera = bpy.data.cameras.new("손님 시점")
ob = bpy.data.objects.new(camera.name, camera)
scene.collection.objects.link(ob)
ob.location = (1.8, -7.4, 2.05)
aim(ob, (0, 0, 2.25))
scene.camera = ob
camera.lens = 32
scene.world = bpy.data.worlds.new("매장 주변광")
scene.world.use_nodes = True
scene.world.node_tree.nodes["Background"].inputs[0].default_value = (0.64, 0.62, 0.57, 1)
scene.world.node_tree.nodes["Background"].inputs[1].default_value = 0.4
scene.render.resolution_x = 760
scene.render.resolution_y = 480
scene.render.resolution_percentage = 100
scene.view_settings.look = "AgX - Medium High Contrast"
scene.render.engine = "CYCLES"
scene.cycles.samples = 10
bpy.context.preferences.filepaths.save_version = 0
bpy.ops.wm.save_as_mainfile(filepath=str(here / "counter.blend"), compress=True)
