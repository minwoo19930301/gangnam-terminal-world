"""AK Golf Gangnam NewCore: club displays, bags and the photographed public shop wall."""

from pathlib import Path
import sys, math, bpy
from math import cos, sin, tau
from mathutils import Vector

here = Path(__file__).resolve().parent
sys.path.insert(0, str(here.parents[2] / "tools"))
import blender_shop_mesh as S

bpy.ops.wm.read_factory_settings(use_empty=True)
scene = bpy.context.scene
scene.name = "뉴코아 강남 2관 5층 · AK골프"
scene.unit_settings.system = "METRIC"
root = bpy.data.collections.new("AKGolfGangnam")
scene.collection.children.link(root)


def stage(name):
    c = bpy.data.collections.new(name)
    root.children.link(c)
    S.group = c


S.palette = {
    n: S.material(n, c, m)
    for n, c, m in [
        ("검정 프레임", "34363A", 0.22),
        ("진열대", "464850", 0.24),
        ("밝은 모서리", "6D7175", 0.43),
        ("스틸", "BCC4C6", 0.66),
        ("크롬 하이라이트", "ECECE6", 0.72),
        ("클럽 페이스", "9CABB1", 0.58),
        ("캐비티", "87979F", 0.62),
        ("솔", "A3A7A3", 0.44),
        ("샤프트 흑연", "484E59", 0.36),
        ("빨간 샤프트", "A54C4A", 0.43),
        ("그립 고무", "35373B", 0.04),
        ("짙은 남색", "374868", 0.23),
        ("헤드 붉은색", "874641", 0.38),
        ("시트 백색", "F1EEE4", 0),
        ("펄 회색", "C8C6BE", 0.20),
        ("화면 하늘", "9ABFCC", 0),
        ("화면 초지", "88A078", 0),
        ("단풍나무", "A67649", 0),
        ("목재 음영", "6B4C37", 0),
        ("극장 흑색", "292A2D", 0.04),
        ("골드 스티치", "BDAB82", 0),
        ("연갈색 가죽", "B39A7C", 0.05),
        ("검은 가죽", "414249", 0.03),
        ("아이보리 가죽", "DEDCCD", 0.03),
        ("남색 가죽", "4D5B72", 0.03),
        ("자수 빨강", "AD5A54", 0),
        ("화이트 사인", "FFF8E8", 0),
        ("빛나는 선반", "EEDFB6", 0),
        ("초록", "62745E", 0),
        ("안내지", "DAD7C9", 0),
        ("종이 인쇄", "6C7375", 0),
    ]
}
for n in ["스틸", "크롬 하이라이트", "클럽 페이스", "캐비티", "샤프트 흑연", "헤드 붉은색", "짙은 남색"]:
    S.palette[n].node_tree.nodes["Principled BSDF"].inputs["Roughness"].default_value = 0.22
for n in ["화이트 사인", "빛나는 선반"]:
    m = S.palette[n]
    sh = m.node_tree.nodes["Principled BSDF"]
    sh.inputs["Emission Color"].default_value = m.diffuse_color
    sh.inputs["Emission Strength"].default_value = 1.0 if n == "화이트 사인" else 0.32
B = S.block
stage("01 클럽 진열대")


def rack(x, d):
    B("계단형 진열대 받침", x, d, 0.025, 1.93, 0.90, 0.12, "검정 프레임", 0.027)
    for side in [-1, 1]:
        B("끝판 기둥", x + side * 0.92, d + 0.36, 0.135, 0.039, 0.049, 1.23, "진열대", 0.005)
    for row in range(3):
        depth = d - 0.27 + 0.22 * row
        h = 0.805 + row * 0.115
        for side in [-1, 1]:
            B(
                "단차형 검정 브래킷",
                x + side * 0.916,
                (depth + d + 0.36) / 2,
                h,
                0.046,
                d + 0.36 - depth,
                0.052,
                "검정 프레임",
                0.004,
            )
        B("샤프트 받침", x, depth, 0.154 + row * 0.055, 1.81, 0.14, 0.078, "진열대", 0.007)
        B("검정 헤드 받침", x, depth + 0.03, h, 1.85, 0.13, 0.074, "검정 프레임", 0.008)
        B("진열대 앞 얇은 금속선", x, depth - 0.043, h + 0.049, 1.82, 0.008, 0.013, "밝은 모서리")
    B("상단 판", x, d + 0.36, 1.37, 1.88, 0.045, 0.21, "검정 프레임", 0.01)
    # The branch photos show a long printed product card framed by the head rail.
    B("아이언 진열 보드 인쇄면", x - 0.27, d + 0.333, 1.388, 1.22, 0.008, 0.166, "안내지")
    for j in range(5):
        B("제품표 먹색 숫자 단", x - 0.59 + j * 0.052, d + 0.326, 1.432, 0.033, 0.006, 0.068, "종이 인쇄")
    for j in range(2):
        B("제품 설명 가는 행", x - 0.24, d + 0.326, 1.404 + j * 0.012, 0.68, 0.004, 0.004, "종이 인쇄")
    for k in range(2):
        px = x + 0.02 + k * 0.115
        S.rod(
            "판에 인쇄한 아이언 윤곽",
            [
                (px - 0.035, d + 0.325, 1.502),
                (px - 0.041, d + 0.325, 1.446),
                (px + 0.018, d + 0.325, 1.457),
                (px + 0.043, d + 0.325, 1.478),
                (px + 0.047, d + 0.325, 1.504),
            ],
            0.0025,
            "종이 인쇄",
            4,
        )
    B("진열 정보 종이", x + 0.62, d + 0.331, 1.405, 0.30, 0.009, 0.135, "안내지")
    for j in range(3):
        B("진열 안내 인쇄", x + 0.60, d + 0.325, 1.433 + j * 0.027, 0.17 - j * 0.014, 0.004, 0.005, "종이 인쇄")


rack(-1.41, 2.64)


# As photographed, the shaft rack stores clubs head-up at three slightly different levels.
def layer_shape(label, center, contour, rings, mats):
    cx, cd, cz = center
    n = len(contour)
    vs = []
    for dep, scale, shift in rings:
        vs.extend((cx + x * scale, cd + dep, cz + z * scale + shift) for x, z in contour)
    faces = [tuple(reversed(range(n)))]
    for k in range(len(rings) - 1):
        for j in range(n):
            a = k * n + j
            b = k * n + (j + 1) % n
            faces.append((a, b, b + n, a + n))
    faces.append(tuple(range((len(rings) - 1) * n, len(rings) * n)))
    ob = S.piece(label, vs, faces, mats[0])
    for m in mats[1:]:
        ob.data.materials.append(S.palette[m])
    for face in ob.data.polygons:
        face.material_index = 0 if face.index == 0 else min(len(mats) - 1, 1 + (face.index - 1) // n)
    return ob


iron = [
    (-0.067, 0.012),
    (-0.063, -0.009),
    (-0.039, -0.022),
    (0.016, -0.028),
    (0.048, -0.024),
    (0.064, -0.013),
    (0.069, 0.008),
    (0.064, 0.030),
    (0.052, 0.044),
    (0.025, 0.040),
    (-0.012, 0.025),
    (-0.042, 0.010),
]
wood = [
    (-0.078, -0.005),
    (-0.068, -0.030),
    (-0.034, -0.046),
    (0.025, -0.042),
    (0.068, -0.024),
    (0.078, 0.002),
    (0.067, 0.036),
    (0.036, 0.055),
    (-0.006, 0.061),
    (-0.047, 0.050),
    (-0.073, 0.028),
]


def head(x, d, z, kind, finish, j):
    created = []
    if kind == "iron":
        created.append(
            layer_shape(
                "아이언 · 스틸 헤드",
                (x, d, z),
                iron,
                [(-0.012, 0.94, 0), (-0.005, 1.0, 0), (0.009, 1.025, -0.002), (0.020, 0.90, 0.001)],
                ["스틸", "크롬 하이라이트", "클럽 페이스", "솔"],
            )
        )
        created.append(
            layer_shape(
                "아이언 뒷면 캐비티",
                (x + 0.009, d - 0.014, z + 0.009),
                iron,
                [(-0.002, 0.53, 0), (0, 0.60, 0)],
                ["캐비티", "스틸"],
            )
        )
        created.append(
            S.rod(
                "캐비티 하단 단차",
                [
                    (x - 0.030, d - 0.018, z + 0.003),
                    (x + 0.008, d - 0.019, z - 0.006),
                    (x + 0.045, d - 0.017, z + 0.004),
                ],
                0.003,
                "크롬 하이라이트",
                5,
            )
        )
        created.append(
            S.rod(
                "단조 헤드의 토 가장자리",
                [
                    (x + 0.027, d - 0.014, z + 0.030),
                    (x + 0.045, d - 0.013, z + 0.034),
                    (x + 0.055, d - 0.013, z + 0.027),
                ],
                0.0018,
                "크롬 하이라이트",
                5,
            )
        )
    else:
        surface = layer_shape(
            "유틸리티 · 둥근 크라운",
            (x, d, z),
            wood,
            [
                (-0.034, 0.84, 0),
                (-0.028, 0.96, 0.001),
                (-0.017, 1, 0.005),
                (0.008, 1.03, 0.011),
                (0.033, 0.95, 0.017),
                (0.052, 0.76, 0.021),
                (0.064, 0.56, 0.022),
                (0.070, 0.28, 0.019),
            ],
            ["클럽 페이스", "크롬 하이라이트", finish, finish, finish, finish, finish, "솔"],
        )
        for face in list(surface.data.polygons)[1:-1]:
            face.use_smooth = True
        created.append(surface)
        for n in range(4):
            created.append(
                S.rod(
                    "페이스 수평 홈",
                    [
                        (x - 0.042, d - 0.035, z - 0.012 + n * 0.008),
                        (x + 0.039, d - 0.035, z - 0.012 + n * 0.008),
                    ],
                    0.001,
                    "스틸",
                    4,
                )
            )
    # The display presents the soles and cavity backs obliquely to a standing customer.
    tilt = math.radians(39 if kind == "iron" else 32)
    turn = math.radians(-12 + 5 * (j % 5))
    for ob in created:
        for v in ob.data.vertices:
            xx, dd, zz = v.co.x - x, -v.co.y - d, v.co.z - z
            dd, zz = dd * cos(tilt) + zz * sin(tilt), -dd * sin(tilt) + zz * cos(tilt)
            xx, dd = xx * cos(turn) - dd * sin(turn), xx * sin(turn) + dd * cos(turn)
            v.co = (x + xx, -d - dd, z + zz)


def club(x, d, z, kind, j):
    shaft = "스틸" if kind == "iron" else ["빨간 샤프트", "샤프트 흑연", "짙은 남색"][j % 3]
    low = (x - 0.060, d - 0.072, 0.16)
    end = (x - 0.042, d, z - 0.023)

    def pos(t):
        return tuple(a + (b - a) * t for a, b in zip(low, end))

    S.rod("그립", [pos(0), pos(0.18)], 0.013, "그립 고무", 7)
    S.rod("그립 링", [pos(0.17), pos(0.183)], 0.014, "펄 회색", 7)
    S.rod("클럽 샤프트", [pos(0.18), pos(0.95)], 0.007, shaft, 7)
    S.rod(
        "헤드 소켓", [pos(0.93), (x - 0.047, d - 0.004, z - 0.021), (x - 0.051, d, z + 0.005)], 0.010, "스틸", 8
    )
    S.rod("페룰 검정 링", [pos(0.927), pos(0.949)], 0.0105, "그립 고무", 8)
    head(x, d, z, kind, ["헤드 붉은색", "짙은 남색", "샤프트 흑연"][j % 3], j)


for row in range(3):
    for j in range(10):
        x = -1.41 + (j - 4.5) * 0.166 + (row % 2) * 0.026
        d = 2.64 - 0.29 + row * 0.22
        shelf = 0.805 + row * 0.115
        for side in [-1, 1]:
            S.rod(
                "개별 검정 클럽 받침",
                [
                    (x - 0.041 + side * 0.012, d + 0.050, shelf + 0.035),
                    (x - 0.041 + side * 0.014, d + 0.012, shelf + 0.055),
                    (x - 0.041 + side * 0.018, d - 0.005, shelf + 0.077),
                ],
                0.005,
                "검정 프레임",
                5,
            )
        club(x, d, 0.90 + row * 0.114 + j * 0.001, "iron" if j < 6 else "wood", j + row)
for x in [-2.11, -0.76]:
    S.rod("가격표 집게 목", [(x, 2.35, 0.76), (x, 2.24, 0.74)], 0.004, "캐비티", 5)
    B("진열표 카드", x, 2.215, 0.625, 0.102, 0.007, 0.123, "안내지", 0.002)
    for j in range(3):
        B("카드 인쇄", x, 2.209, 0.65 + j * 0.018, 0.070 - j * 0.007, 0.002, 0.004, "종이 인쇄")
stage("02 캐디백 진열")
B("가방 전시 바닥", 1.47, 3.48, 0.03, 1.82, 1.14, 0.095, "진열대", 0.023)


def bag(x, d, h, body, pocket):
    ob = S.profile(
        "캐디백 몸체",
        x,
        d,
        0.13,
        [(0.151, 0), (0.166, 0.042), (0.161, h * 0.23), (0.172, h * 0.58), (0.158, h * 0.90), (0.178, h)],
        body,
        20,
        0.78,
    )
    S.profile(
        "상단 테두리", x, d, h + 0.125, [(0.179, 0), (0.176, 0.025), (0.148, 0.035)], "검은 가죽", 20, 0.78
    )
    S.profile(
        "포켓 윗덮개",
        x,
        d - 0.13,
        0.23,
        [(0.114, 0), (0.119, 0.035), (0.115, 0.31), (0.096, 0.38)],
        pocket,
        16,
        0.63,
    )
    S.rod(
        "포켓 은색 파이핑",
        [
            (x - 0.096, d - 0.162, 0.26),
            (x - 0.095, d - 0.17, 0.48),
            (x - 0.066, d - 0.186, 0.57),
            (x + 0.067, d - 0.186, 0.57),
            (x + 0.095, d - 0.17, 0.48),
        ],
        0.005,
        "골드 스티치",
        5,
    )
    S.rod(
        "측면 운반 손잡이",
        [
            (x + 0.125, d - 0.015, 0.56),
            (x + 0.206, d - 0.012, 0.60),
            (x + 0.208, d - 0.012, 0.77),
            (x + 0.152, d - 0.015, 0.80),
        ],
        0.017,
        pocket,
        7,
    )
    S.rod(
        "가방 어깨끈",
        [
            (x - 0.112, d + 0.065, 0.88),
            (x - 0.225, d + 0.076, 0.72),
            (x - 0.25, d + 0.066, 0.46),
            (x - 0.172, d + 0.05, 0.39),
        ],
        0.023,
        "검은 가죽",
        8,
    )
    for j in range(3):
        p = (x + (j - 1) * 0.069, d + (j % 2 - 0.5) * 0.078, h + 0.158)
        S.rod("가방 분할구", [(p[0], p[1], p[2] - 0.01), (p[0], p[1], p[2] + 0.008)], 0.035, "검정 프레임", 10)


for j, (dx, dd, hh, body, pocket) in enumerate(
    [
        (-0.55, 0.18, 0.90, "아이보리 가죽", "남색 가죽"),
        (-0.03, 0.26, 0.93, "검은 가죽", "자수 빨강"),
        (0.50, 0.15, 0.86, "남색 가죽", "아이보리 가죽"),
        (-0.36, -0.25, 0.86, "검은 가죽", "검은 가죽"),
        (0.28, -0.23, 0.88, "아이보리 가죽", "초록"),
    ]
):
    bag(1.47 + dx, 3.48 + dd, hh, body, pocket)
stage("03 목재 브랜드 벽 · 모자 선반")
B("검정 벽면", 0, 9.68, 0.025, 5.38, 0.12, 3.31, "극장 흑색")
B("중앙 목재 배판", 0, 9.53, 0.04, 1.77, 0.12, 2.77, "목재 음영")
for j in range(33):
    B("목재 세로살", (j - 16) * 0.053, 9.451, 0.04, 0.030, 0.055, 2.77, "단풍나무", 0.002)
B("짙은 상단 프레임", 0, 9.46, 2.82, 5.45, 0.41, 0.46, "극장 흑색")
for h in [0.69, 1.00, 1.31, 1.62]:
    B("모자 선반", -1.72, 9.26, h, 1.56, 0.43, 0.041, "진열대")
    B("선반 앞 조명", -1.72, 9.04, h + 0.018, 1.51, 0.016, 0.013, "빛나는 선반")
    for j in range(5):
        x = -2.32 + j * 0.30
        tone = ["아이보리 가죽", "검은 가죽", "남색 가죽", "펄 회색", "자수 빨강"][(j + round(h * 8)) % 5]
        # The curved bill projects beyond the crown. Its ends dip slightly like the branch caps.
        verts = []
        for side in (0, 1):
            for t in (0, 1):
                for k in range(11):
                    a = (k - 5) / 5
                    dep = 9.180 - t * (0.050 + 0.105 * math.sqrt(max(0, 1 - a * a)))
                    verts.append((x + a * 0.101, dep, h + 0.059 - 0.010 * t - 0.014 * a * a + side * 0.006))
        faces = []
        for k in range(10):
            faces.extend(
                [(k, k + 1, 12 + k, 11 + k), (22 + k, 33 + k, 34 + k, 23 + k), (11 + k, 12 + k, 34 + k, 33 + k)]
            )
        S.piece("곡면 캡 챙", verts, faces, tone)
        S.profile("캡 상단 싸개 단추", x, 9.22, h + 0.146, [(0.011, 0), (0.009, 0.005)], tone, 8)
        S.profile(
            "캡 크라운",
            x,
            9.22,
            h + 0.049,
            [(0.106, 0), (0.103, 0.028), (0.085, 0.068), (0.040, 0.094), (0.014, 0.098)],
            tone,
            14,
            0.99,
        )
for x in [-2.07, -1.37]:
    B("전시 모니터 검은 베젤", x, 9.49, 1.98, 0.665, 0.064, 0.40, "검정 프레임")
    B("전시 화면", x, 9.451, 2.002, 0.62, 0.01, 0.355, "화면 하늘")
    widths = [-0.305, -0.22, -0.09, 0.04, 0.16, 0.305]
    for d, ridge, color in [
        (9.443, [0.11, 0.15, 0.13, 0.17, 0.16, 0.12], "초록"),
        (9.439, [0.06, 0.09, 0.07, 0.04, 0.09, 0.10], "화면 초지"),
    ]:
        for j in range(5):
            a, b = widths[j : j + 2]
            S.piece(
                "화면 속 페어웨이",
                [
                    (x + a, d, 2.005),
                    (x + b, d, 2.005),
                    (x + b, d, 2.005 + ridge[j + 1]),
                    (x + a, d, 2.005 + ridge[j]),
                ],
                [(0, 1, 2, 3)],
                color,
            )
for h in [0.52, 1.39, 2.20]:
    B("백 선반", 1.73, 9.25, h, 1.49, 0.42, 0.040, "검정 프레임")
    for j in range(3):
        x = 1.25 + j * 0.45
        B(
            "소형 골프백",
            x,
            9.19,
            h + 0.043,
            0.31,
            0.18,
            0.21,
            ["검은 가죽", "연갈색 가죽", "남색 가죽"][j],
            0.025,
        )
        S.rod(
            "작은 백 손잡이",
            [
                (x - 0.09, 9.19, h + 0.24),
                (x - 0.07, 9.19, h + 0.34),
                (x + 0.068, 9.19, h + 0.34),
                (x + 0.09, 9.19, h + 0.24),
            ],
            0.010,
            "골드 스티치",
            6,
        )
# White sign face follows AK Golf's published logo. The branch photograph shows the lit version on timber.
initial = set(bpy.data.objects)
bpy.ops.import_curve.svg(filepath=str(here / "mark.svg"))
curve = next(c for c in bpy.data.objects if c not in initial and c.type == "CURVE")
curve.data.resolution_u = 2
bpy.ops.object.select_all(action="DESELECT")
curve.select_set(True)
bpy.context.view_layer.objects.active = curve
bpy.ops.object.convert(target="MESH")
o = bpy.context.object
vertices = [o.matrix_world @ v.co for v in o.data.vertices]
faces = [tuple(f.vertices) for f in o.data.polygons]
mn, mx = min(v.x for v in vertices), max(v.x for v in vertices)
bottom = min(v.y for v in vertices)
scale = 1.59 / (mx - mn)
for d, mat in [(9.413, "밝은 모서리"), (9.40, "화이트 사인")]:
    S.piece(
        "AKGOLF · 채널 문자",
        [((v.x - (mn + mx) / 2) * scale, d, 1.84 + (v.y - bottom) * scale) for v in vertices],
        faces,
        mat,
    )
bpy.data.objects.remove(o, do_unlink=True)
for c in list(bpy.data.collections):
    if c.name.endswith(".svg") and not c.all_objects:
        bpy.data.collections.remove(c)
# The visitor approaches along local +depth. From this side, decreasing local X reads left to right.
for ob in S.group.objects:
    if ob.type == "MESH":
        for v in ob.data.vertices:
            v.co.x = -v.co.x
        ob.data.flip_normals()
stage("04 매장 안쪽 천장과 조명")
B("따뜻한 매장 천장", 0, 5.20, 3.45, 5.32, 9.05, 0.078, "시트 백색")
for x in [-2.46, 2.46]:
    B("천장 검은 단", x, 5.25, 3.32, 0.44, 8.95, 0.13, "극장 흑색")
    B("단 안쪽 간접등", x - math.copysign(0.224, x), 5.25, 3.374, 0.024, 8.85, 0.022, "빛나는 선반")
for d in [1.20, 3.40, 5.55, 7.63, 9.12]:
    for x in [-1.27, 1.27]:
        S.profile("천장 매입등 테두리", x, d, 3.431, [(0.057, 0), (0.058, 0.020)], "진열대", 12)
        S.profile("매입등 원형 렌즈", x, d, 3.426, [(0.039, 0), (0.043, 0.006)], "화이트 사인", 12)
for x, d, watts in [(-1.70, 8.91, 33), (0, 8.91, 30), (1.70, 8.91, 33), (-1.41, 2.39, 48), (1.47, 3.25, 42)]:
    data = bpy.data.lights.new("상품벽에 비치는 조명", "AREA")
    data.energy = watts
    data.size = 1.23
    data.color = (1, 0.93, 0.85)
    lamp = bpy.data.objects.new(data.name, data)
    lamp.location = (x, -d, 3.18)
    root.objects.link(lamp)
# A standalone editing camera is kept outside the collection linked into the city.
camdata = bpy.data.cameras.new("상품 진열대 · 고객 눈높이")
cam = bpy.data.objects.new(camdata.name, camdata)
scene.collection.objects.link(cam)
cam.location = (0.26, -0.65, 1.62)
cam.rotation_euler = (Vector((-0.70, -3.53, 1.04)) - cam.location).to_track_quat("-Z", "Y").to_euler()
camdata.lens = 27
scene.camera = cam
scene.world = bpy.data.worlds.new("상가 기본광")
scene.world.use_nodes = True
bg = scene.world.node_tree.nodes.get("Background")
bg.inputs[0].default_value = (0.76, 0.73, 0.66, 1)
bg.inputs[1].default_value = 0.42
for screen in bpy.data.screens:
    for area in screen.areas:
        if area.type == "VIEW_3D":
            view = area.spaces.active
            view.region_3d.view_perspective = "CAMERA"
            view.clip_end = 120
            view.shading.color_type = "MATERIAL"

bpy.context.preferences.filepaths.save_version = 0
bpy.ops.wm.save_as_mainfile(filepath=str(here / "showroom.blend"), compress=True)
