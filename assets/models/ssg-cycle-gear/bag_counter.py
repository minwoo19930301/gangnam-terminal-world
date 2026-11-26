"""Public Gangnam window-counter bags. Coordinates are in metres, front is -Y."""

from math import cos, exp, pi, sin, tau
from mathutils import Vector


def finish(obj, key):
    obj["finishTile"] = key
    return obj


def add_counter(part, skins, tubing, plate, place, smooth):
    def pipe(name, points, r, col, tile, n=6):
        return finish(tubing(name, points, r, col, n), tile)

    def panel(name, grid, col, tile):
        rows = len(grid)
        n = len(grid[0])
        faces = [
            (j * n + i, j * n + i + 1, (j + 1) * n + i + 1, (j + 1) * n + i)
            for j in range(rows - 1)
            for i in range(n - 1)
        ]
        ob = smooth(part(name, [p for row in grid for p in row], faces, col))
        ob["gridSize"] = [n, rows]
        return finish(ob, tile)

    def strap(name, path, width, col, tile="webbing"):
        # Thin tape cross-sections retain their broad face at the shoulder and lip.
        rows = []
        for i, (x, y, z) in enumerate(path):
            tangent = (
                Vector(path[min(i + 1, len(path) - 1)]) - Vector(path[max(i - 1, 0)])
            ).normalized()
            side = Vector((1, 0, 0))
            normal = side.cross(tangent).normalized()
            rows.append(
                [
                    Vector((x, y, z)) + side * (u * width / 2) + normal * v
                    for u, v in [
                        (-0.96, -0.0009),
                        (0.96, -0.0009),
                        (1, 0),
                        (0.96, 0.0009),
                        (-0.96, 0.0009),
                        (-1, 0),
                    ]
                ]
            )
        return finish(smooth(skins(name, rows, col)), tile)

    def stitches(name, paths, color, pitch=0.0046, broad=0.00070):
        verts = []
        faces = []
        for path in paths:
            points = [Vector(p) for p in path]
            cursor = 0
            for head, tail in zip(points, points[1:]):
                segment = tail - head
                length = segment.length
                if length < 0.0001:
                    continue
                direction = segment / length
                # Two small lifted rounded facets per dash catch the edge light.
                normal = Vector((0, -1, 0.15))
                cross = direction.cross(normal).normalized() * broad
                while cursor < length - 0.0014:
                    p = head + direction * cursor
                    q = p + direction * min(pitch * 0.56, length - cursor)
                    k = len(verts)
                    verts.extend(
                        (
                            p,
                            p.lerp(q, 0.26) - cross,
                            p.lerp(q, 0.38) - normal * 0.0004,
                            p.lerp(q, 0.74) + cross,
                            q,
                        )
                    )
                    faces.extend(
                        (
                            (k, k + 1, k + 2),
                            (k, k + 2, k + 3),
                            (k + 1, k + 4, k + 2),
                            (k + 2, k + 4, k + 3),
                        )
                    )
                    cursor += pitch
                cursor = max(0.0, cursor - length)
        if verts:
            return part(name, verts, faces, color)

    def rounded_bag(name, width, depth, height, color, rolled=False):
        rings = []
        for j in range(17):
            v = j / 16
            row = []
            for i in range(56):
                a = tau * i / 56
                ca, sa = cos(a), sin(a)
                cx = (1 if ca >= 0 else -1) * abs(ca) ** 0.50
                cy = (1 if sa >= 0 else -1) * abs(sa) ** 0.51
                corner = abs(cx) ** 5
                sides = abs(cy) ** 5
                ripple = 0.003 * sin(13 * v + 4 * cx) + 0.0018 * cos(15 * cx - 6 * v)
                x = cx * (
                    width * (0.88 + 0.11 * sin(pi * v * 0.90))
                    + 0.005 * sin(8 * v + 2 * a) * corner
                )
                z = (
                    0.008
                    + height * (v + 0.014 * sin(2 * a + 1) * v**3)
                    + 0.004 * (1 - v) ** 6 * (1 - abs(cx))
                )
                y = cy * (
                    depth * (0.76 + 0.22 * sin(pi * v)) + 0.011 * corner * (1 - v) ** 2
                )
                # Side gussets pull inward; lower front corners pucker under load.
                y += cy * (
                    ripple * (0.38 + 0.82 * corner)
                    + 0.010
                    * sin(2.2 * a + 8 * v)
                    * corner
                    * exp(-(((v - 0.19) / 0.15) ** 2))
                )
                if rolled:
                    y += 0.0035 * sin(v * 9 + cx * 2) * sides
                row.append((x, y, z))
            rings.append(row)
        return finish(
            smooth(skins(name, rings, color)), "blackcanvas" if rolled else "canvas"
        )

    def clasp(x, z):
        y = -0.083
        # The photographed black straps attach low on the flap and run through
        # small rectangular polished buckles. A brass stud is visible above each.
        strap(
            "앞쪽 검은 조임끈",
            [
                (x, y + 0.008, 0.021),
                (x, y + 0.001, 0.046),
                (x, y - 0.003, z - 0.005),
                (x, y - 0.005, z + 0.021),
                (x, y - 0.002, z + 0.042),
            ],
            0.017,
            "strapBlack",
        )
        pts = []
        for sx, sz, start in [
            (1, 1, 0),
            (-1, 1, pi / 2),
            (-1, -1, pi),
            (1, -1, 3 * pi / 2),
        ]:
            for k in range(5):
                a = start + pi * k / 8
                pts.append(
                    (
                        x + sx * 0.009 + 0.0033 * cos(a),
                        y - 0.006,
                        z + sz * 0.009 + 0.0033 * sin(a),
                    )
                )
        pipe("니켈 버클 테두리", pts + [pts[0]], 0.0013, "nickel", "metal", 7)
        pipe(
            "버클 가로 축",
            [(x - 0.009, y - 0.005, z), (x + 0.009, y - 0.005, z)],
            0.00115,
            "nickel",
            "metal",
        )
        pipe(
            "버클 고정 핀",
            [(x, y - 0.006, z - 0.001), (x + 0.0005, y - 0.007, z + 0.009)],
            0.00085,
            "silver",
            "metal",
        )
        for off in [-0.021, -0.032]:
            a = z + off
            pipe(
                "가죽끈 조절 구멍",
                [(x, y - 0.0034, a), (x, y - 0.0040, a)],
                0.0010,
                "ink",
                "plain",
                8,
            )
        pipe(
            "황동 고정 리벳",
            [(x, y - 0.0025, z + 0.038), (x, y - 0.0054, z + 0.038)],
            0.00295,
            "brass",
            "metal",
            12,
        )
        stitches(
            "버클 스트랩 양쪽 박음질",
            [
                [
                    (x + side * 0.0063, y - 0.002, z - 0.036),
                    (x + side * 0.0063, y - 0.0035, z + 0.029),
                ]
                for side in [-1, 1]
            ],
            "strapEdge",
            0.0038,
            0.00045,
        )

    def flap(u, v):
        if v < 0.27:
            t = v / 0.27
            y = 0.043 - 0.108 * t
            z = 0.229 + 0.012 * sin(pi * t) - 0.002 * t
        else:
            t = (v - 0.27) / 0.73
            y = -0.065 - 0.017 * sin(t * pi * 0.73) - 0.003 * t
            z = 0.227 - 0.142 * t + 0.018 * abs(u) ** 8 * t**2.8
        # Narrow creases run up from the lower binding and the handle tugs the top.
        z += (
            0.0028 * (1 - u * u) * cos(2.7 * u + 0.5) * sin(pi * v)
            + 0.0024 * sin(4 * u + v) * v
        )
        y += (
            0.0033 * cos(4 * u + v * 2)
            + 0.0024 * sin(5.1 * u - 4 * v)
            + 0.0024 * sin(13 * u + 4 * v) * v * v
        )
        x = 0.180 * u * (1 - 0.032 * v * v) + 0.0022 * sin(3 * v + u) * abs(u) ** 8
        return (x, y, z + 0.014 * (1 - v) ** 1.2 + 0.004 * sin(pi * v))

    place(2.29, 0.41, 0.014)
    finish(
        plate("가방 진열대 받침", 0, 0, 0, 0.76, 0.45, 0.632, 0.017, "oakLight"), "oak"
    )
    # Fine light stripes on top are slats, as on this counter in the shop image.
    for j in range(18):
        y = (j - 8.5) * 0.025
        rows = [
            [(sx * w, y + sy * d, z) for sx, sy in [(1, 1), (-1, 1), (-1, -1), (1, -1)]]
            for w, d, z in [
                (0.383, 0.01125, 0.633),
                (0.383, 0.01125, 0.642),
                (0.382, 0.0101, 0.644),
            ]
        ]
        finish(skins("진열 상판 목살", rows, "oakHoney"), "oak")
    for x in [-0.386, 0.386]:
        finish(
            plate("상판 마구리", x, 0, 0.627, 0.009, 0.46, 0.016, 0.002, "oakLight"),
            "oak",
        )

    # Rear black folded roll-top bag, just behind its tan neighbour.
    place(2.44, 0.49, 0.660, 10)
    rounded_bag(
        "먹녹색 롤톱 가방 · 주름진 몸체", 0.167, 0.062, 0.238, "wovenGreen", True
    )
    levels = []
    for i in range(25):
        u = 2 * i / 24 - 1
        row = []
        for k in range(16):
            a = tau * k / 16
            row.append(
                (
                    0.17 * u,
                    0.007 + 0.029 * cos(a) + 0.005 * u,
                    0.235
                    + 0.030 * sin(a) * (0.89 + 0.08 * cos(3 * u))
                    + 0.008 * u
                    + 0.004 * sin(5 * u),
                )
            )
        levels.append(row)
    finish(smooth(skins("접어 말린 가방 입구", levels, "wovenGreen")), "blackcanvas")
    pipe(
        "롤 아래 접힌 선",
        [
            (-0.15, -0.038, 0.211),
            (-0.09, -0.047, 0.216),
            (0, -0.047, 0.214),
            (0.09, -0.045, 0.222),
            (0.153, -0.035, 0.230),
        ],
        0.0021,
        "strapBlack",
        "webbing",
    )
    for side in [-1, 1]:
        strap(
            "롤톱 측면 잠금띠",
            [
                (side * 0.133, 0.013, 0.261),
                (side * 0.138, -0.025, 0.247),
                (side * 0.141, -0.045, 0.213),
                (side * 0.141, -0.046, 0.197),
            ],
            0.014,
            "strapBlack",
        )
    # Two-tone tan front flap and darker binding are traced from the local photo.
    place(2.28, 0.331, 0.660, -5)
    rounded_bag("황갈색 메신저백 · 주름과 옆폭", 0.174, 0.064, 0.225, "bagTan")
    grid = [[flap(2 * i / 36 - 1, j / 25) for i in range(37)] for j in range(26)]
    panel("베이지 면포 플랩 · 안장 주름", grid, "flapTan", "canvas")
    outside = (
        [flap(-1, j / 40) for j in range(41)]
        + [flap(2 * j / 60 - 1, 1) for j in range(1, 61)]
        + [flap(1, 1 - j / 40) for j in range(1, 41)]
    )
    pipe("플랩의 검은 파이핑", outside, 0.0033, "strapBlack", "webbing", 8)
    stitch_path = (
        [flap(-0.972, j / 42 * 0.988) for j in range(43)]
        + [flap(-0.972 + 1.944 * j / 54, 0.988) for j in range(1, 55)]
        + [flap(0.972, 0.988 * (1 - j / 42)) for j in range(1, 43)]
    )
    stitches(
        "플랩 둘레 한 줄 스티치",
        [[(x, y - 0.0015, z + 0.0004) for x, y, z in stitch_path]],
        "stitchTan",
    )
    # Narrow fabric grab handle bends into the rear seam; both ends are sewn in.
    arch = [
        (
            -0.052 + 0.104 * t / 40,
            0.052 + 0.007 * sin(pi * t / 40),
            0.227 + 0.047 * sin(pi * t / 40) ** 0.72,
        )
        for t in range(41)
    ]
    rails = []
    for x, y, z in arch:
        rails.append(
            [
                (x, y - 0.009, z - 0.0017),
                (x, y + 0.009, z - 0.0017),
                (x, y + 0.01, z),
                (x, y + 0.009, z + 0.0017),
                (x, y - 0.009, z + 0.0017),
                (x, y - 0.010, z),
            ]
        )
    finish(smooth(skins("가방 손잡이 짜임띠", rails, "bagTan")), "webbing")
    for s in [-1, 1]:
        clasp(s * 0.097, 0.064)
        piping = [
            (s * 0.145, -0.041, 0.013),
            (s * 0.162, -0.043, 0.027),
            (s * 0.168, -0.051, 0.07),
            (s * 0.169, -0.051, 0.144),
            (s * 0.171, -0.045, 0.193),
        ]
        pipe("앞면 아래 모서리 감침", piping, 0.00175, "bagTan", "canvas")
        pipe(
            "옆폭 D 고리",
            [
                (s * 0.176, -0.013, 0.191),
                (s * 0.178, -0.018, 0.208),
                (s * 0.178, 0.002, 0.217),
                (s * 0.177, 0.009, 0.204),
                (s * 0.176, -0.013, 0.191),
            ],
            0.0018,
            "nickel",
            "metal",
        )
    # The same photograph shows a white, faceted vase and bleached twigs.
    place(1.995, 0.414, 0.660)
    rings = []
    for z, r in [
        (0, 0.029),
        (0.005, 0.034),
        (0.080, 0.037),
        (0.095, 0.047),
        (0.137, 0.047),
        (0.152, 0.032),
        (0.245, 0.031),
        (0.247, 0.028),
        (0.239, 0.027),
        (0.224, 0.027),
    ]:
        rings.append(
            [(r * cos(tau * i / 10), r * sin(tau * i / 10), z) for i in range(10)]
        )
    finish(skins("백색 각면 화병", rings, "ceramic", cap=False), "ceramic")
    for i in range(5):
        a = 0.6 + i * 1.96
        tips = []
        for j in range(7):
            t = j / 6
            tips.append(
                (
                    0.011 * cos(a)
                    + (0.032 + 0.03 * (i % 2)) * t * cos(a)
                    + 0.006 * sin(t * 11 + i),
                    0.009 * sin(a) + 0.043 * t * sin(a) + 0.003 * cos(t * 15 + i),
                    0.232 + t * (0.17 + 0.046 * (i % 3)),
                )
            )
        pipe("표백한 장식 가지", tips, 0.0016, "twig", "plain", 5)
        for j in (3, 4, 5):
            x, y, z = tips[j]
            k = 0.022 + 0.005 * ((i + j) % 3)
            pipe(
                "옆으로 갈린 잔가지",
                [
                    (x, y, z),
                    (x + k * cos(a + j), y + 0.01 * sin(a + j), z + 0.021),
                    (x + 1.5 * k * cos(a + j), y + 0.022 * sin(a + j), z + 0.038),
                ],
                0.0010,
                "twig",
                "plain",
                5,
            )

    # Small white bicycle outlines stand along the visitor edge of the counter.
    for i, (x, y, scale) in enumerate([(2.035, 0.216, 1.0), (2.132, 0.215, 0.79)]):
        place(x, y, 0.662, 8 - i * 11)

        def p(x, z):
            return (x * scale, 0, z * scale)

        for xx in [-0.032, 0.034]:
            circle = [
                p(xx + 0.021 * cos(tau * k / 26), 0.022 + 0.021 * sin(tau * k / 26))
                for k in range(27)
            ]
            pipe("흰색 미니어처 바퀴", circle, 0.0015, "ceramic", "ceramic", 5)
        for path in [
            [(-0.032, 0.022), (-0.008, 0.031), (-0.016, 0.051)],
            [(-0.032, 0.022), (-0.013, 0.041), (0.019, 0.051), (0.034, 0.022)],
            [(0.020, 0.051), (0.018, 0.072), (0.025, 0.073)],
            [(-0.022, 0.051), (-0.009, 0.052)],
        ]:
            pipe(
                "흰색 미니어처 프레임",
                [p(*f) for f in path],
                0.00145,
                "ceramic",
                "ceramic",
                5,
            )
