"""The six wooden earphone cards in Scheherazade's Gangnam store photograph."""

from math import asin, cos, sin, pi, radians, sqrt
from mathutils import Matrix, Vector


def coated(obj, tile):
    obj["audioTexture"] = tile
    return obj


def catmull(points, subdivisions, closed=False):
    p = list(map(Vector, points))
    count = len(p)
    result = []

    def at(i):
        return p[i % count] if closed else p[max(0, min(count - 1, i))]

    for i in range(count if closed else count - 1):
        a, b, c, d = (at(i + k) for k in (-1, 0, 1, 2))
        for step in range(subdivisions):
            t = step / subdivisions
            result.append(
                0.5
                * (
                    (2 * b)
                    + (-a + c) * t
                    + (2 * a - 5 * b + 4 * c - d) * t * t
                    + (-a + 3 * b - 3 * c + d) * t * t * t
                )
            )
    if not closed:
        result.append(p[-1])
    return result


class Counter:
    def __init__(self, mesh, skin, slab, pipe, label, place):
        self.mesh, self.skin, self.slab, self.pipe, self.label, self.place = (
            mesh,
            skin,
            slab,
            pipe,
            label,
            place,
        )

    def inlay(self, name, rings, color, tile):
        return coated(self.skin(name, rings, color, True), tile)

    def braided(self, name, spine, colors):
        # Two individually swept conductors stay visible where the lead crosses
        # the peg. A soft gravity loop descends behind the product card.
        path = catmull(spine, 7)
        phase = 0
        strands = [[], []]
        for i, p in enumerate(path):
            tangent = (
                path[min(i + 1, len(path) - 1)] - path[max(0, i - 1)]
            ).normalized()
            axis = Vector((0, 1, 0))
            u = tangent.cross(axis)
            if u.length_squared < 0.01:
                u = tangent.cross(Vector((0, 0, 1)))
            u.normalize()
            v = tangent.cross(u).normalized()
            if i:
                phase += 2 * pi * (p - path[i - 1]).length / 0.0055
            for side, points in enumerate(strands):
                points.append(
                    p
                    + 0.00073
                    * (u * cos(phase + side * pi) + v * sin(phase + side * pi))
                )
        for points, color in zip(strands, colors):
            self.pipe(name, points, 0.00067, color, 4)

    def earpiece(self, name, finish, mount, side):
        self.place(mount)
        # The upper shoulder carries the connector. The tapered lower lobe
        # blends into the face bezel, with the nozzle angled in towards the ear.
        outline = catmull(
            [
                (-0.0140, 0.0045),
                (-0.0100, 0.0110),
                (-0.001, 0.0130),
                (0.009, 0.0120),
                (0.0145, 0.0060),
                (0.0135, -0.0020),
                (0.0078, -0.0095),
                (-0.002, -0.0120),
                (-0.009, -0.0110),
                (-0.013, -0.0050),
            ],
            3,
            True,
        )
        width = 0.90 if finish in ("z02", "z06") else 1

        def ring(depth, scale, up=0):
            return [
                (side * p.x * width * scale, depth, p.y * scale + up) for p in outline
            ]

        housings = {
            "terra": "sage",
            "mokara": "charcoal",
            "z02": "smoke",
            "z06": "berry",
            "phonix": "charcoal",
            "gold": "smoke",
        }
        bezel = (
            "champagne"
            if finish in ("mokara", "phonix", "gold")
            else ("paleMetal" if finish == "terra" else "graphite")
        )
        self.skin(
            name + " 귓바퀴 셸",
            [
                ring(0.008, 0.47, 0.002),
                ring(0.006, 0.75),
                ring(0.003, 0.91),
                ring(-0.003, 0.98),
                ring(-0.006, 1),
            ],
            housings[finish],
            True,
        )
        self.skin(
            name + " 면판 테두리",
            [
                ring(-0.0055, 1),
                ring(-0.0064, 1.015),
                ring(-0.0077, 1),
                ring(-0.0080, 0.92),
            ],
            bezel,
            True,
        )
        self.inlay(
            name + " 면판",
            [
                ring(-0.0078, 0.94),
                ring(-0.0084, 0.91),
                ring(-0.0093, 0.69),
                ring(-0.0096, 0.32),
            ],
            "sampleWhite",
            finish,
        )
        axis = Vector((side * 0.64, 0.71, -0.29)).normalized()
        base = Vector((side * 0.006, 0.005, -0.0005))
        perp = axis.cross(Vector((0, 0, 1))).normalized()
        up = axis.cross(perp)

        def nozzle_rings(profile):
            return [
                [
                    base
                    + axis * distance
                    + radius * (perp * cos(i * pi / 8) + up * sin(i * pi / 8))
                    for i in range(16)
                ]
                for distance, radius in profile
            ]

        self.skin(
            name + " 노즐",
            nozzle_rings(
                [(0, 0.0045), (0.004, 0.0031), (0.009, 0.0031), (0.010, 0.0036)]
            ),
            bezel,
            True,
        )
        self.skin(
            name + " 속이 빈 실리콘 팁",
            nozzle_rings(
                [
                    (0.007, 0.0029),
                    (0.008, 0.0048),
                    (0.010, 0.006),
                    (0.014, 0.0051),
                    (0.016, 0.0026),
                    (0.015, 0.0017),
                    (0.008, 0.0017),
                ]
            ),
            "silicone" if finish in ("terra", "mokara") else "pad",
            True,
            False,
        )
        if finish in ("terra", "phonix"):
            if side > 0:
                self.label(
                    "TERRA" if finish == "terra" else "VE",
                    0,
                    -0.0096,
                    -0.0018,
                    0.0035,
                    "champagne",
                )
            else:
                pts = [
                    (0.0045 * cos(i * pi / 12), -0.0096, 0.0036 * sin(i * pi / 12))
                    for i in range(25)
                ]
                self.pipe(name + " 면판 각인", pts, 0.00026, "champagne", 4)
        elif finish == "gold":
            # Dark ventilation slots beneath the etched, metallic face cover.
            for k in [-1, 0, 1]:
                pts = [
                    (-0.007 + k * 0.0005, -0.0096, -0.002 + k * 0.0028),
                    (0, -0.0098, 0.003 + k * 0.0024),
                    (0.006, -0.00965, 0.001 + k * 0.0022),
                ]
                self.pipe(name + " 환기 슬릿", pts, 0.00045, "graphite", 4)
        else:
            self.label("AAW", 0, -0.0097, -0.0015, 0.0034, "paleMetal")

    def board(self, center, name, brand, finish, cable):
        board = Matrix.Translation((center, -0.239, 1.315)) @ Matrix.Rotation(
            radians(-8), 4, "X"
        )
        self.place(board)
        outline = []
        for x, z, angle in [
            (0.065, 0.261, 0),
            (-0.065, 0.261, 90),
            (-0.065, 0.003, 180),
            (0.065, 0.003, 270),
        ]:
            for j in range(5):
                t = radians(angle + 22.5 * j)
                outline.append((x + 0.003 * cos(t), z + 0.003 * sin(t)))
        rings = [
            [(x * scale, depth, 0.132 + (z - 0.132) * scale) for x, z in outline]
            for depth, scale in [
                (0.007, 0.983),
                (0.006, 1),
                (-0.006, 1),
                (-0.007, 0.983),
            ]
        ]
        coated(
            self.skin(name + " 경사진 호두나무 보드", rings, "sampleWhite"), "walnut"
        )
        self.slab(
            name + " 브러시드 메탈 안내판",
            0,
            -0.0084,
            0.015,
            0.119,
            0.003,
            0.071,
            "cardPaper",
            0.002,
        )
        self.label(brand, 0, -0.0103, 0.067, 0.0068, "cardInk")
        self.label(name, 0, -0.0105, 0.041, 0.015, "black")
        self.slab(
            "카드 구분선", 0, -0.0108, 0.032, 0.070, 0.0006, 0.0006, "edge", 0.0001
        )
        self.label("IN-EAR MONITOR", 0, -0.0107, 0.023, 0.0047, "cardInk")
        self.label("Scheherazade", 0, -0.0078, 0.235, 0.0103, "black")
        for side in (-1, 1):
            x = side * 0.035
            self.pipe(
                "나무 이어후크 걸이",
                [(x, -0.005, 0.201), (x, -0.043, 0.207)],
                0.0037,
                "edge",
                10,
            )
            rot = (15 if side < 0 else -18) + (
                48 if side < 0 and finish in ("terra", "z06", "gold") else 0
            )
            ear = (
                board
                @ Matrix.Translation((x, -0.036, 0.166))
                @ Matrix.Rotation(radians(rot), 4, "Z")
                @ Matrix.Rotation(radians(side * 9), 4, "Y")
            )
            self.earpiece(name, finish, ear, side)
            self.place(board)
            spine = [
                (x + side * 0.004, -0.036, 0.176),
                (x + side * 0.012, -0.035, 0.188),
                (x + side * 0.010, -0.031, 0.206),
                (x - side * 0.002, -0.025, 0.212),
                (x - side * 0.011, -0.018, 0.201),
                (side * 0.012, -0.020, 0.171),
                (side * 0.005, -0.024, 0.134),
                (side * 0.002, -0.017, 0.114),
                (side * 0.001, -0.009, 0.112),
            ]
            self.braided(name + " 꼬아 감은 케이블", spine, cable)
            self.pipe(
                name + " 분리형 커넥터",
                [(x + side * 0.003, -0.036, 0.173), (x + side * 0.007, -0.036, 0.180)],
                0.0019,
                "paleMetal" if finish == "terra" else "graphite",
                8,
            )
        self.place(Matrix.Identity(4))

    def cabinet(self):
        self.place(Matrix.Identity(4))
        cx = 0.673
        for x in [0.197, 1.148]:
            coated(
                self.slab(
                    "청음장 호두나무 기둥",
                    x,
                    -0.11,
                    0.963,
                    0.028,
                    0.39,
                    0.731,
                    "sampleWhite",
                    0.004,
                ),
                "walnut",
            )
        coated(
            self.slab(
                "청음용 이어폰 선반",
                cx,
                -0.12,
                1.289,
                0.984,
                0.42,
                0.026,
                "sampleWhite",
                0.005,
            ),
            "walnut",
        )
        coated(
            self.slab(
                "조명 선반", cx, -0.12, 1.685, 0.984, 0.42, 0.027, "sampleWhite", 0.005
            ),
            "walnut",
        )
        self.slab(
            "상부 조명 확산판", cx, -0.166, 1.682, 0.920, 0.086, 0.003, "ivory", 0.001
        )
        coated(
            self.slab(
                "따뜻한 후면 패널",
                cx,
                0.075,
                1.311,
                0.93,
                0.014,
                0.375,
                "sampleWhite",
                0.002,
            ),
            "backlight",
        )
        self.pipe(
            "선반 황동 앞전",
            [(0.188, -0.33, 1.304), (1.159, -0.33, 1.304)],
            0.0032,
            "brass",
            10,
        )
        for i, (name, brand, finish, cable) in enumerate(
            [
                ("Z02", "AAW", "z02", ("roseWire", "pearl")),
                ("Mokara", "AAW", "mokara", ("lavenderWire", "pearl")),
                ("Z06", "AAW", "z06", ("black", "paleMetal")),
                ("TERRA", "Lime Ears", "terra", ("roseWire", "pearl")),
                ("Phönix", "Vision Ears", "phonix", ("black", "graphite")),
                ("EXT MKII", "Vision Ears", "gold", ("charcoal", "graphite")),
            ]
        ):
            self.board(0.291 + i * 0.1525, name, brand, finish, cable)
        # The retailer's photograph shows wireless charging cases on stepped
        # wooden risers underneath. Their generic hardware is left unbranded.
        for i, (x, tone) in enumerate(
            [(0.38, "cream"), (0.64, "graphite"), (0.91, "ivory")]
        ):
            level = 0.986 + 0.043 * i
            self.pipe(
                "황동 전시대 다리",
                [(x, -0.122, 0.962), (x, -0.122, level)],
                0.0065,
                "brass",
                10,
            )
            coated(
                self.slab(
                    "케이스 나무 받침",
                    x,
                    -0.123,
                    level,
                    0.157,
                    0.103,
                    0.012,
                    "sampleWhite",
                    0.008,
                ),
                "walnut",
            )
            cy = -0.12
            z = level + 0.014
            silhouette = [
                (x + 0.042 * cos(t * pi / 20), cy + 0.027 * sin(t * pi / 20))
                for t in range(40)
            ]

            def case_ring(h, scale):
                return [
                    (x + (a - x) * scale, cy + (b - cy) * scale, z + h)
                    for a, b in silhouette
                ]

            self.skin(
                "이어폰 충전 케이스",
                [
                    case_ring(h, r)
                    for h, r in [
                        (0, 0.70),
                        (0.003, 0.88),
                        (0.010, 0.98),
                        (0.020, 1),
                        (0.022, 0.995),
                    ]
                ],
                tone,
                True,
            )
            self.skin(
                "케이스 뚜껑",
                [
                    case_ring(h, r)
                    for h, r in [
                        (0.0228, 0.993),
                        (0.028, 0.94),
                        (0.031, 0.75),
                        (0.032, 0.43),
                    ]
                ],
                tone,
                True,
            )

    def grille(self, side):
        # One shallow, perforated metal dome over the visible planar driver.
        # A square-to-disk warp keeps the rim elliptical and avoids cut-off holes.
        cols, rows = 16, 21
        verts = []
        faces = []

        def surface(u, v):
            sy = u * sqrt(max(0, 1 - v * v / 2))
            sz = v * sqrt(max(0, 1 - u * u / 2))
            radius = sqrt(sy * sy + sz * sz)
            return (
                side * (0.105 + 0.0065 * (1 - radius * radius)),
                0.0455 * sy,
                0.064 + 0.0558 * sz,
            )

        outer = [(-1, -1), (0, -1), (1, -1), (1, 0), (1, 1), (0, 1), (-1, 1), (-1, 0)]
        for j in range(rows):
            for i in range(cols):
                u = 2 * (i + 0.5) / cols - 1
                v = 2 * (j + 0.5) / rows - 1
                k = len(verts)
                for ax, az in outer:
                    verts.append(surface(u + ax / cols, v + az / rows))
                for t in range(8):
                    angle = (t - 3) * pi / 4
                    verts.append(
                        surface(
                            u + 0.69 * cos(angle) / cols, v + 0.69 * sin(angle) / rows
                        )
                    )
                for t in range(8):
                    p = k + t
                    q = k + (t + 1) % 8
                    faces.append(
                        (p, q, q + 8, p + 8) if side > 0 else (p + 8, q + 8, q, p)
                    )
        self.mesh("솔리테어 P 개방형 타공 그릴", verts, faces, "grille", True)
        for row in range(-8, 9):
            yy = row * 0.0048
            extent = 0.051 * sqrt(max(0, 1 - (yy / 0.0435) ** 2))
            pts = [
                (side * 0.103, yy, 0.064 - extent),
                (side * 0.104, yy, 0.064),
                (side * 0.103, yy, 0.064 + extent),
            ]
            self.pipe(
                "그릴 너머의 평판 자석 열",
                pts,
                0.00078,
                "steel" if row % 2 else "graphite",
                5,
            )

    def solitaire(self, x, y, z, angle):
        pose = Matrix.Translation((x, y, z)) @ Matrix.Rotation(radians(angle), 4, "Z")
        self.place(pose)
        # Separate face-contact suede and leather outer skins meet at a fine seam.
        for name, inner, outer, tile in [
            ("바깥 헤드밴드 가죽", 0.002, 0.008, "leather"),
            ("안쪽 헤드밴드 알칸타라", -0.008, 0.002, "suede"),
        ]:
            band = []
            for j in range(35):
                t = 0.12 + (pi - 0.24) * j / 34
                center = Vector((0.089 * cos(t), 0, 0.122 + 0.099 * sin(t)))
                rad = Vector((cos(t), 0, sin(t)))
                ring = []
                for k in range(12):
                    q = k * pi / 6
                    across = (1 if cos(q) >= 0 else -1) * abs(cos(q)) ** 0.55
                    raised = (1 if sin(q) >= 0 else -1) * abs(sin(q)) ** 0.70
                    ring.append(
                        center
                        + Vector((0, 0.0195 * across, 0))
                        + rad * ((inner + outer) / 2 + raised * (outer - inner) / 2)
                    )
                band.append(ring)
            self.inlay("솔리테어 P " + name, band, "sampleWhite", tile)
        for s in [-1, 1]:
            pts = [
                (0.090 * cos(t), s * 0.019, 0.122 + 0.100 * sin(t))
                for t in [0.12 + (pi - 0.24) * j / 34 for j in range(35)]
            ]
            self.pipe("헤드밴드 가장자리 봉제선", pts, 0.00067, "graphite", 5)
        for side in [-1, 1]:

            def cup(profile):
                rings = []
                for depth, radius in profile:
                    loop = [
                        (
                            side * depth,
                            0.0475 * radius * cos(2 * pi * k / 44),
                            0.064 + 0.0595 * radius * sin(2 * pi * k / 44),
                        )
                        for k in range(44)
                    ]
                    rings.append(loop if side == 1 else list(reversed(loop)))
                return rings

            coated(
                self.skin(
                    "솔리테어 P 타원형 귀 쿠션",
                    cup(
                        [
                            (0.077, 0.94),
                            (0.064, 1),
                            (0.055, 0.91),
                            (0.052, 0.79),
                            (0.052, 0.62),
                            (0.058, 0.54),
                            (0.075, 0.51),
                        ]
                    ),
                    "sampleWhite",
                    True,
                    False,
                ),
                "suede",
            )
            self.inlay(
                "솔리테어 P 귀 안쪽의 붉은 음향 천",
                cup([(0.076, 0.60), (0.077, 0.52), (0.077, 0.04)]),
                "redLiner",
                "metalmesh",
            )
            self.skin(
                "솔리테어 P 밀링한 알루미늄 하우징",
                cup(
                    [
                        (0.074, 0.96),
                        (0.077, 1),
                        (0.083, 1.025),
                        (0.097, 1.02),
                        (0.104, 0.98),
                        (0.105, 0.943),
                    ]
                ),
                "paleMetal",
                True,
                False,
            )
            for step in range(6):
                d = 0.086 + step * 0.0024
                self.skin(
                    "솔리테어 P 측면 절삭 홈",
                    cup([(d, 1.025), (d + 0.00045, 1.028), (d + 0.0008, 1.025)]),
                    "steel",
                    True,
                    False,
                )
            self.skin(
                "그릴 내부의 어두운 진동판",
                cup([(0.101, 0.95), (0.099, 0.13)]),
                "charcoal",
                True,
            )
            self.grille(side)
            # Flat, machined yokes taper between the two round pivot caps.
            yoke = []
            for j in range(27):
                t = 0.10 + (pi - 0.20) * j / 26
                yy = 0.0472 * cos(t)
                zz = 0.063 + 0.069 * sin(t)
                width = 0.0031 + 0.0022 * sin(t)
                yoke.append(
                    [
                        (
                            side * (0.096 + dx),
                            yy + offset * width * cos(t),
                            zz + offset * width * sin(t),
                        )
                        for dx, offset in [
                            (-0.002, -1),
                            (0.002, -1),
                            (0.002, 1),
                            (-0.002, 1),
                        ]
                    ]
                )
            self.skin("솔리테어 P 밀링 요크", yoke, "paleMetal", True)
            for sign in [-1, 1]:
                anchor = (side * 0.092, sign * 0.046, 0.073)
                self.pipe(
                    "요크의 원형 회전축",
                    [anchor, (side * 0.099, anchor[1], anchor[2])],
                    0.0034,
                    "steel",
                    16,
                )
            self.slab(
                "솔리테어 P 길이 조절 슬라이더",
                side * 0.089,
                0,
                0.125,
                0.010,
                0.032,
                0.028,
                "paleMetal",
                0.0025,
            )
            self.slab(
                "슬라이더 고정 가이드",
                side * 0.089,
                0,
                0.149,
                0.008,
                0.028,
                0.018,
                "graphite",
                0.0016,
            )
            for k in range(3):
                self.pipe(
                    "슬라이더 평행 각인",
                    [
                        (side * 0.094, -0.009, 0.134 + k * 0.003),
                        (side * 0.094, 0.009, 0.134 + k * 0.003),
                    ],
                    0.00038,
                    "steel",
                    4,
                )
            self.place(
                pose
                @ Matrix.Translation((side * 0.0942, 0, 0.1375))
                @ Matrix.Rotation(side * pi / 2, 4, "Z")
            )
            self.label("T+A", 0, 0, -0.001, 0.0075, "charcoal")
            self.place(pose)
            self.pipe(
                "헤드폰 케이블 소켓",
                [(side * 0.084, -0.012, 0.011), (side * 0.087, -0.013, 0.003)],
                0.0031,
                "graphite",
                10,
            )
        for i, char in enumerate("SOLITAIRE P"):
            if char == " ":
                continue
            t = asin((i - 5) * 0.0051 / 0.090)
            crown = (0.090 * sin(t), 0.0035, 0.122 + 0.099 * cos(t) + 0.0083)
            self.place(
                pose
                @ Matrix.Translation(crown)
                @ Matrix.Rotation(t, 4, "Y")
                @ Matrix.Rotation(-pi / 2, 4, "X")
            )
            self.label(char, 0, 0, 0, 0.008, "bandInk")
        self.place(Matrix.Identity(4))
