"""The peach and ivory product niches, and two winter Snoopy plushes shown in Gangnam."""

from math import cos, exp, pi, sin, sqrt, tau


def smooth(obj, swatch=None):
    for f in obj.data.polygons:
        f.use_smooth = True
    if swatch:
        obj["surfaceSwatch"] = swatch
    return obj


def houses(part, rings, tube, box, front_panel, wall_y):
    floor = 0.573
    front = wall_y - 0.420
    for x, outer, inner, coat, rotation in [
        (-3.387, "peach", "terracotta", "scarf", -0.045),
        (-2.691, "porcelain", "mint", "puffer", 0.07),
    ]:
        w = 0.327
        eave = 0.596
        peak = 0.948
        d = 0.418
        r = 0.185
        spring = 0.354

        def polygon(name, pts, y0, y1, mat):
            ob = front_panel(name, y0, y1, [(x + a, floor + b) for a, b in pts], mat)
            ob["surfaceSwatch"] = "lacquer"
            return ob

        def facade(label, plane, depth, r, spring, color, roof):
            for sign in [-1, 1]:
                ends = sorted([sign * r, sign * w])
                a, b = ends
                polygon(
                    label + " 문설주",
                    [
                        (a, 0.008),
                        (b, 0.008),
                        (b, peak - (peak - eave) * abs(b) / w),
                        (a, peak - (peak - eave) * abs(a) / w),
                    ],
                    plane,
                    plane + depth,
                    color,
                )
            for k in range(30):
                a = pi * k / 30
                b = pi * (k + 1) / 30
                x0 = -r * cos(a)
                x1 = -r * cos(b)
                h0 = spring + r * sin(a)
                h1 = spring + r * sin(b)
                polygon(
                    label + " 둥근 출입 아치",
                    [
                        (x0, h0),
                        (x1, h1),
                        (x1, peak - (peak - eave) * abs(x1) / w),
                        (x0, peak - (peak - eave) * abs(x0) / w),
                    ],
                    plane,
                    plane + depth,
                    color,
                )
            if roof:
                for sign in [-1, 1]:
                    ob = tube(
                        label + " 검은 지붕 테",
                        [
                            (x, plane - 0.004, floor + peak + 0.005),
                            (x + sign * w, plane - 0.004, floor + eave + 0.005),
                        ],
                        0.008,
                        "ink",
                        6,
                    )

        # Shallow outer face and a recessed secondary arch expose the coloured
        # reveal seen inside both housings. A continuous shell connects the two.
        facade(
            "살구색 집" if coat == "scarf" else "아이보리 집",
            front,
            0.023,
            r,
            spring,
            outer,
            True,
        )
        facade("안쪽 색 아치", front + 0.112, 0.025, 0.158, 0.329, inner, False)
        for sign in [-1, 1]:
            xx = x + sign * w
            box("집 측면", (xx), front + d / 2, floor, 0.018, d, eave, outer)
            tube(
                "지붕 뒤로 이어진 검은 테",
                [(xx, front, floor + eave), (xx, front + d, floor + eave)],
                0.0060,
                "ink",
                5,
            )
        for sign in [-1, 1]:
            coords = [
                (x, front, floor + peak + 0.0022),
                (x + sign * w, front, floor + eave + 0.0022),
                (x + sign * w, front + d, floor + eave + 0.0022),
                (x, front + d, floor + peak + 0.0022),
            ]
            part("집 모양의 칠한 지붕", coords, [(0, 1, 2, 3)], outer)
        box("아치 안쪽 바닥", x, front + d / 2, floor, 0.648, d, 0.012, inner)
        box("진열 칸 안쪽 바탕", x, front + d - 0.006, floor, 0.646, 0.012, eave, inner)

        def arch(r, s, zmin=0.008):
            return (
                [(-r, zmin)]
                + [(-r * cos(pi * k / 35), s + r * sin(pi * k / 35)) for k in range(36)]
                + [(r, zmin)]
            )

        outer_arch = arch(r, spring)
        inner_arch = arch(0.158, 0.329)
        vs = [(x + a, front + 0.022, floor + b) for a, b in outer_arch] + [
            (x + a, front + 0.113, floor + b) for a, b in inner_arch
        ]
        n = len(outer_arch)
        smooth(
            part(
                "아치 안쪽 둥근 두께",
                vs,
                [(k, k + 1, n + k + 1, n + k) for k in range(n - 1)],
                inner,
            )
        )
        plush(part, rings, tube, x, front + 0.122, floor + 0.011, coat, rotation)


def plush(part, rings, tube, ox, oy, base, coat, rotation):
    def world(x, y, z):
        return (
            ox + x * cos(rotation) - y * sin(rotation),
            oy + x * sin(rotation) + y * cos(rotation),
            base + z,
        )

    def loft(name, rows, mat, tile, vary_uv=False, cap=True):
        ob = smooth(
            rings(name, [[world(*p) for p in row] for row in rows], mat, cap), tile
        )
        if vary_uv:
            ob["ringUV"] = [len(rows[0]), len(rows)]
        return ob

    def cord(name, points, r, mat, tile=None, n=7):
        return smooth(tube(name, [world(*p) for p in points], r, mat, n), tile)

    def ellipsoid(name, center, rad, mat, tile, tilt=0, segs=30, steps=16):
        rows = []
        for j in range(steps + 1):
            lat = -pi / 2 + 0.002 + (pi - 0.004) * j / steps
            row = []
            for k in range(segs):
                a = tau * k / segs
                xx = rad[0] * cos(a) * cos(lat)
                yy = rad[1] * sin(a) * cos(lat)
                zz = rad[2] * sin(lat)
                row.append(
                    (
                        center[0] + xx * cos(tilt) + zz * sin(tilt),
                        center[1] + yy,
                        center[2] + zz * cos(tilt) - xx * sin(tilt),
                    )
                )
            rows.append(row)
        return loft(name, rows, mat, tile, True)

    # Shape one continuous forehead and muzzle, broad at the cheek and tapering
    # into the crown. The black velour nose sits on the projecting tip.
    rows = []
    for z, rx, forward, back, shift in [
        (0.253, 0.019, 0.031, 0.030, -0.006),
        (0.264, 0.066, 0.074, 0.056, -0.009),
        (0.278, 0.091, 0.140, 0.079, -0.009),
        (0.299, 0.107, 0.166, 0.086, -0.008),
        (0.317, 0.107, 0.176, 0.090, -0.006),
        (0.335, 0.100, 0.147, 0.094, -0.004),
        (0.357, 0.101, 0.125, 0.094, -0.002),
        (0.381, 0.096, 0.093, 0.091, 0.001),
        (0.404, 0.088, 0.088, 0.082, 0.002),
        (0.422, 0.068, 0.063, 0.063, 0.002),
        (0.435, 0.026, 0.025, 0.025, 0.001),
    ]:
        row = []
        for k in range(48):
            a = tau * k / 48
            c = cos(a)
            s = sin(a)
            # A fine indentation where the two stuffed head panels meet.
            seam = 0.0019 * exp(-(((c + 0.08) / 0.060) ** 2))
            row.append(
                (
                    rx * c - 0.0024 * sin(2 * a),
                    shift + s * (forward if s < 0 else back) + seam * max(0.0, -s),
                    z + 0.0014 * cos(2 * a),
                )
            )
        rows.append(row)
    loft("이어진 이마와 도톰한 주둥이", rows, "furIvory", "fleece", True)
    ellipsoid(
        "벨루어로 감싼 코",
        (0, -0.174, 0.311),
        (0.027, 0.020, 0.023),
        "velourInk",
        "blackfur",
        segs=30,
        steps=12,
    )
    for sign in (-1, 1):
        eye = [
            (sign * 0.061, -0.091, 0.369),
            (sign * 0.060, -0.094, 0.3745),
            (sign * 0.057, -0.097, 0.3775),
        ]
        cord("짧은 눈 자수", eye, 0.0026, "velourInk", "blackfur")
        # Long flexible black ears drop from behind the brow. The broad middle
        # and rounded tip have thickness across the seam.
        ear = []
        for j in range(23):
            t = j / 22
            w = 0.0047 + 0.025 * sin(pi * t) ** 0.67
            th = 0.0037 + 0.008 * sin(pi * t) ** 0.72
            cx = sign * (0.081 + 0.046 * sin(t * pi * 0.76) + 0.012 * t)
            cy = -0.002 + 0.007 * sin(3 * t) - 0.054 * t * t
            z = 0.406 - 0.139 * t + 0.005 * sin(pi * t)
            ear.append(
                [
                    (cx + w * cos(a), cy + th * sin(a), z + 0.008 * sin(a) * t)
                    for a in [tau * k / 16 for k in range(16)]
                ]
            )
        loft("옆으로 늘어진 검은 귀", ear, "velourInk", "blackfur", True)
    ellipsoid(
        "봉제 인형 몸통",
        (0, 0.006, 0.173),
        (0.103, 0.082, 0.123),
        "furIvory",
        "fleece",
        segs=30,
    )
    for sign in (-1, 1):
        ellipsoid(
            "앉은 인형의 볼록한 발",
            (sign * 0.063, -0.049, 0.056),
            (0.060, 0.086, 0.053),
            "furIvory",
            "fleece",
            sign * 0.12,
        )
        for dx in [-0.017, 0.017]:
            circle = sqrt(1 - (dx / 0.060) ** 2)
            pts = []
            for angle in [0.32, 0.45, 0.61, 0.77, 0.93, 1.04]:
                yy = -0.049 - (0.086 * circle + 0.0012) * cos(angle)
                zz = (0.053 * circle + 0.0012) * sin(angle)
                pts.append(
                    (
                        sign * 0.063 + dx * cos(sign * 0.12) + zz * sin(sign * 0.12),
                        yy,
                        0.056 + zz * cos(sign * 0.12) - dx * sin(sign * 0.12),
                    )
                )
            cord("발가락에 놓인 두 땀", pts, 0.00160, "velourInk", "blackfur", 6)
    if coat == "scarf":
        for sign in (-1, 1):
            ellipsoid(
                "흰 앞발",
                (sign * 0.105, -0.013, 0.155),
                (0.035, 0.047, 0.077),
                "furIvory",
                "fleece",
                sign * -0.30,
            )
        rows = []
        for j in range(11):
            t = j / 10
            r = 0.0031 * sin(pi * t)
            rows.append(
                [
                    (
                        (0.097 + r) * cos(a),
                        (0.092 + r) * sin(a) - 0.006,
                        0.237 + 0.036 * t + 0.0034 * sin(2 * a + t),
                    )
                    for a in [tau * k / 38 for k in range(38)]
                ]
            )
        loft("목을 감싼 적색 니트 머플러", rows, "woolRed", "knit", True)
        for index, (cx, length, slant) in enumerate(
            [(-0.038, 0.125, -0.021), (-0.006, 0.092, 0.018)]
        ):
            verts = []
            faces = []
            r = 23
            c = 11
            for j in range(r):
                v = j / (r - 1)
                for i in range(c):
                    u = i / (c - 1) * 2 - 1
                    xx = (
                        cx
                        + slant * v
                        + 0.021 * u * (1 - 0.08 * v)
                        + 0.003 * sin(v * 6 + index)
                    )
                    y = (
                        -0.067
                        - 0.020 * sin(pi * v)
                        + 0.0033 * cos(u * 4 + v * 7)
                        - 0.005 * index
                    )
                    z = 0.246 - length * v + 0.0018 * sin(u * 4 + v)
                    verts.append(world(xx, y, z))
                    if j < r - 1 and i < c - 1:
                        k = j * c + i
                        faces.append((k, k + 1, k + c + 1, k + c))
            ob = smooth(part("머플러의 드리운 양 끝", verts, faces, "woolRed"), "knit")
            ob["clothUV"] = [c, r]
            for i in range(10):
                u = i / 9 * 2 - 1
                xx = cx + slant + 0.021 * u * 0.92 + 0.003 * sin(6 + index)
                z = 0.246 - length + 0.0018 * sin(4 * u + 1)
                y = -0.067 + 0.0033 * cos(u * 4 + 7) - 0.005 * index
                cord(
                    "니트 단의 술",
                    [
                        (xx, y, z),
                        (xx + 0.0007, y - 0.0016, z - 0.006),
                        (xx + 0.0004, y, z - 0.010 - i % 3 * 0.001),
                    ],
                    0.00085,
                    "woolRed",
                    "knit",
                    5,
                )
    else:
        # Three lofted baffles share a continuous jacket panel, with separate
        # fronts curling away from the zipper. A high folded collar frames the muzzle.
        rows = []
        segments = 46
        for j in range(30):
            v = j / 29
            waist = sin(pi * v) ** 0.55
            air = sin(pi * (v * 3.15 + 0.07)) ** 2
            w = 0.089 + 0.021 * waist + 0.010 * air
            d = 0.074 + 0.010 * waist + 0.009 * air
            row = []
            for k in range(segments):
                u = k / (segments - 1)
                opening = 0.10 + 0.17 * v * v
                a = -pi / 2 + opening + (tau - 2 * opening) * u
                y = d * sin(a) - 0.007 - 0.0037 * sin(2 * a + v * 9)
                row.append(
                    (
                        w * cos(a),
                        y,
                        0.094
                        + 0.170 * v
                        + 0.0045 * cos(a) * sin(pi * v)
                        + 0.003 * sin(2 * a + 0.4),
                    )
                )
            rows.append(row)
        grid = [world(*p) for row in rows for p in row]
        faces = [
            (
                j * segments + i,
                j * segments + i + 1,
                (j + 1) * segments + i + 1,
                (j + 1) * segments + i,
            )
            for j in range(len(rows) - 1)
            for i in range(segments - 1)
        ]
        ob = smooth(
            part("청록색 패딩 몸판과 가로 퀼팅", grid, faces, "jacketTeal"), "nylon"
        )
        ob["clothUV"] = [segments, len(rows)]
        ob["quiltBands"] = 3.15
        for side in [0, -1]:
            pts = [row[side] for row in rows]
            cord("패딩 앞섶의 원단 테", pts, 0.00245, "jacketEdge", "nylon")
        for j in (8, 17, 26):
            pts = [rows[j][k] for k in range(segments)]
            cord("눌러 박은 패딩 퀼팅 선", pts, 0.00085, "jacketEdge", "nylon", 5)
        for s in [-1, 1]:
            sleeve = []
            for j in range(20):
                v = j / 19
                cx = s * (0.083 + 0.034 * v)
                z = 0.244 - (0.096 if s > 0 else 0.122) * v
                rad = 0.035 + 0.011 * sin(pi * v) + 0.006 * (sin(pi * 2 * v) ** 2)
                sleeve.append(
                    [
                        (
                            cx + rad * cos(a),
                            -0.006
                            - (0.075 if s > 0 else 0.041) * v
                            + rad * 0.86 * sin(a),
                            z + 0.008 * s * cos(a),
                        )
                        for a in [tau * k / 22 for k in range(22)]
                    ]
                )
            sleeve_ob = loft(
                "패딩 소매와 봉긋한 충전재", sleeve, "jacketTeal", "nylon", True
            )
            sleeve_ob["quiltBands"] = 2.0
            cuff = sleeve[-1] + [sleeve[-1][0]]
            cord("박음선이 보이는 소맷단", cuff, 0.0024, "jacketEdge", "nylon", 6)
            ellipsoid(
                "소맷단 밖의 작은 앞발",
                (s * 0.117, -0.081 if s > 0 else -0.047, 0.146 if s > 0 else 0.120),
                (0.029, 0.028, 0.020),
                "furIvory",
                "fleece",
                segs=20,
                steps=10,
            )
        # The branch photograph shows a soft dark hat with a seam above the brim.
        rows = []
        for z, rx, ry in [
            (0.389, 0.114, 0.099),
            (0.395, 0.119, 0.107),
            (0.404, 0.115, 0.100),
            (0.412, 0.103, 0.092),
            (0.425, 0.097, 0.089),
            (0.444, 0.084, 0.081),
            (0.455, 0.054, 0.055),
            (0.459, 0.014, 0.014),
        ]:
            row = []
            for k in range(44):
                a = tau * k / 44
                wave = 0.0027 * sin(3 * a + 0.4) + 0.0022 * cos(5 * a)
                row.append(
                    (rx * cos(a), 0.002 + ry * sin(a), z + wave + 0.014 * cos(a))
                )
            rows.append(row)
        loft("짙은 겨울 모자와 챙", rows, "hatInk", "blackfur", True)
    # Ivory stuffing at the seated base and dark ear fabric carry different
    # light responses from the nylon jacket or ribbed wool in the same draw.
